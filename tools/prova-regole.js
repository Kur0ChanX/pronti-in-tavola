// Prove delle regole di sicurezza (firestore.rules) nell'emulatore di Firebase.
// Uso: npm run prova-regole   (scrive «OK»/«NO» per ogni caso e alla fine il totale)
const fs = require('fs');
const path = require('path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where, writeBatch } = require('firebase/firestore');

const C1 = 'codice-giulia-0123456789', C2 = 'codice-paolo-01234567890', SPENTO = 'codice-vecchio-012345678';
const pronto = { formato: 't8', qta: 2, giorno: '2026-11-05' };
const ordine = (id, cliente, stato, extra) => Object.assign({ id, n: 1, cliente, stato, righe: [], entro: '2026-11-07', proposta: null,
  paga: { metodo: 'contanti', dice: false, ricevuto: false }, nota: '', creato: '2026-11-05', cuori: {}, modifica: null, esitoModifica: '' }, extra || {});

async function semina(env) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    const scrivi = (p, d) => setDoc(doc(db, p), d);
    await scrivi('gestori/monica', { nome: 'Monica' });
    await scrivi('clienti/c1', { id: 'c1', nome: 'Cliente uno' });
    await scrivi('clienti/c2', { id: 'c2', nome: 'Cliente due' });
    await scrivi('inviti/' + C1, { cliente: 'c1', attivo: true });
    await scrivi('inviti/' + C2, { cliente: 'c2', attivo: true });
    await scrivi('inviti/' + SPENTO, { cliente: 'c1', attivo: false });
    await scrivi('telefoni/tel1', { cliente: 'c1', codice: C1, il: '2026-11-05' });
    await scrivi('telefoni/tel2', { cliente: 'c2', codice: C2, il: '2026-11-05' });
    await scrivi('piatti/lasagne', { id: 'lasagne', nome: 'Lasagne', cuori: 3, pronto });
    await scrivi('foto/lasagne', { foto: 'data:image/jpeg;base64,AAAA' });
    await scrivi('impostazioni/app', { anticipo: 1 });
    await scrivi('impostazioni/monica', { mario: '' });
    await scrivi('contatori/ordini', { prossimo: 5, ultimo: '' });
    await scrivi('ordini/o1', ordine('o1', 'c1', 'nuovo'));
    await scrivi('ordini/o3', ordine('o3', 'c1', 'accettato'));
    await scrivi('ordini/o2', ordine('o2', 'c2', 'proposta', { proposta: '2026-11-08' }));
  });
}

(async () => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-pronti',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 }
  });
  const db = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
  let ok = 0, no = 0;
  const caso = async (nome, fn) => {
    await semina(env);
    try { await fn(); ok++; console.log('OK  ', nome); } catch (e) { no++; console.log('NO  ', nome, '→', String(e.message).split('\n')[0]); }
  };
  const nuovoOrdine = (d, n, cliente, extra) => {
    const b = writeBatch(d);
    b.set(doc(d, 'ordini/o9'), ordine('o9', cliente, 'nuovo', Object.assign({ n }, extra)));
    b.update(doc(d, 'contatori/ordini'), { prossimo: n + 1, ultimo: 'o9' });
    return b;
  };

  await caso('chi non è entrato non vede il menù', () => assertFails(getDoc(doc(db(null), 'piatti/lasagne'))));
  await caso('telefono senza invito non vede il menù', () => assertFails(getDoc(doc(db('sconosciuto'), 'piatti/lasagne'))));
  await caso('telefono nuovo si lega con un invito attivo', () => assertSucceeds(setDoc(doc(db('tel3'), 'telefoni/tel3'), { cliente: 'c1', codice: C1, il: '2026-11-05' })));
  await caso('invito spento non lega il telefono', () => assertFails(setDoc(doc(db('tel3'), 'telefoni/tel3'), { cliente: 'c1', codice: SPENTO, il: '2026-11-05' })));
  await caso('codice giusto ma cliente diverso: no', () => assertFails(setDoc(doc(db('tel3'), 'telefoni/tel3'), { cliente: 'c2', codice: C1, il: '2026-11-05' })));
  await caso('un telefono non lega un altro telefono', () => assertFails(setDoc(doc(db('tel3'), 'telefoni/tel4'), { cliente: 'c1', codice: C1, il: '2026-11-05' })));
  await caso('invitato vede menù, foto e impostazioni', async () => {
    const d = db('tel1');
    await assertSucceeds(getDoc(doc(d, 'piatti/lasagne'))); await assertSucceeds(getDoc(doc(d, 'foto/lasagne'))); await assertSucceeds(getDoc(doc(d, 'impostazioni/app')));
  });
  await caso('invitato non vede le cose solo di Monica', async () => {
    const d = db('tel1');
    await assertFails(getDoc(doc(d, 'impostazioni/monica'))); await assertFails(getDoc(doc(d, 'clienti/c2'))); await assertFails(getDoc(doc(d, 'inviti/' + C2)));
    await assertSucceeds(getDoc(doc(d, 'clienti/c1')));
  });
  await caso('invitato vede solo i suoi ordini', async () => {
    const d = db('tel1');
    await assertSucceeds(getDoc(doc(d, 'ordini/o1'))); await assertFails(getDoc(doc(d, 'ordini/o2')));
    await assertSucceeds(getDocs(query(collection(d, 'ordini'), where('cliente', '==', 'c1'))));
    await assertFails(getDocs(collection(d, 'ordini')));
  });
  await caso('ordine nuovo col numero del contatore e un pronto preso', () => {
    const d = db('tel1'), b = nuovoOrdine(d, 5, 'c1');
    b.update(doc(d, 'piatti/lasagne'), { pronto: Object.assign({}, pronto, { qta: 1 }), ultimoOrdine: 'o9' });
    b.set(doc(d, 'settimane/2026-45'), { teglie: 1, ultimo: 'o9' });
    return assertSucceeds(b.commit());
  });
  await caso('ordine col numero sbagliato: no', () => assertFails(nuovoOrdine(db('tel1'), 7, 'c1').commit()));
  await caso('ordine a nome di un altro cliente: no', () => assertFails(nuovoOrdine(db('tel1'), 5, 'c2').commit()));
  await caso('ordine già «soldi ricevuti»: no', () => assertFails(nuovoOrdine(db('tel1'), 5, 'c1', { paga: { metodo: 'contanti', dice: false, ricevuto: true } }).commit()));
  await caso('ordine senza contatore: no', () => assertFails(setDoc(doc(db('tel1'), 'ordini/o9'), ordine('o9', 'c1', 'nuovo', { n: 5 }))));
  await caso('pronto sotto zero: no', () => {
    const d = db('tel1'), b = nuovoOrdine(d, 5, 'c1');
    b.update(doc(d, 'piatti/lasagne'), { pronto: Object.assign({}, pronto, { qta: -1 }), ultimoOrdine: 'o9' });
    return assertFails(b.commit());
  });
  await caso('pronto preso senza ordine: no', () => assertFails(updateDoc(doc(db('tel1'), 'piatti/lasagne'), { pronto: Object.assign({}, pronto, { qta: 0 }), ultimoOrdine: 'o1' })));
  await caso('cliente non cambia il prezzo di un piatto', () => assertFails(updateDoc(doc(db('tel1'), 'piatti/lasagne'), { nome: 'Gratis' })));
  await caso('annulla un ordine nuovo e rimette il pronto', () => {
    const d = db('tel1'), b = writeBatch(d);
    b.update(doc(d, 'ordini/o1'), { stato: 'annullato' });
    b.update(doc(d, 'piatti/lasagne'), { pronto: Object.assign({}, pronto, { qta: 3 }), ultimoOrdine: 'o1' });
    return assertSucceeds(b.commit());
  });
  await caso('ordine già accettato non si annulla dal cliente', () => assertFails(updateDoc(doc(db('tel1'), 'ordini/o3'), { stato: 'annullato' })));
  await caso('«Ho pagato» sì, «Soldi ricevuti» no', async () => {
    const d = db('tel1');
    await assertSucceeds(updateDoc(doc(d, 'ordini/o1'), { 'paga.dice': true }));
    await assertFails(updateDoc(doc(d, 'ordini/o1'), { 'paga.ricevuto': true }));
  });
  await caso('cliente non segna «pronto» il suo ordine', () => assertFails(updateDoc(doc(db('tel1'), 'ordini/o3'), { stato: 'pronto' })));
  await caso('«Mi è piaciuto»: cuore +1 sì, +5 no', async () => {
    const d = db('tel1');
    let b = writeBatch(d); b.update(doc(d, 'ordini/o3'), { cuori: { lasagne: true } }); b.update(doc(d, 'piatti/lasagne'), { cuori: 4, ultimoOrdine: 'o3' });
    await assertSucceeds(b.commit());
    b = writeBatch(d); b.update(doc(d, 'ordini/o3'), { cuori: { lasagne: false } }); b.update(doc(d, 'piatti/lasagne'), { cuori: 9, ultimoOrdine: 'o3' });
    await assertFails(b.commit());
  });
  await caso('proposta di Monica: «Va bene» col suo giorno', () => assertSucceeds(updateDoc(doc(db('tel2'), 'ordini/o2'), { stato: 'accettato', entro: '2026-11-08', proposta: null })));
  await caso('proposta: «accettato» con un altro giorno no', () => assertFails(updateDoc(doc(db('tel2'), 'ordini/o2'), { stato: 'accettato', entro: '2026-11-20', proposta: null })));
  await caso('proposta: «Un altro giorno» torna nuovo', () => assertSucceeds(updateDoc(doc(db('tel2'), 'ordini/o2'), { stato: 'nuovo', entro: '2026-11-10', proposta: null })));
  await caso('link cambiato: il telefono vecchio non vede più niente', async () => {
    await env.withSecurityRulesDisabled(ctx => updateDoc(doc(ctx.firestore(), 'inviti/' + C1), { attivo: false }));
    await assertFails(getDoc(doc(db('tel1'), 'piatti/lasagne')));
    await assertFails(getDoc(doc(db('tel1'), 'ordini/o1')));
  });
  await caso('Monica cambia tutto e vede tutti gli ordini', async () => {
    const d = db('monica');
    await assertSucceeds(updateDoc(doc(d, 'piatti/lasagne'), { nome: 'Lasagne al ragù' }));
    await assertSucceeds(getDocs(collection(d, 'ordini')));
    await assertSucceeds(updateDoc(doc(d, 'ordini/o3'), { stato: 'pronto', 'paga.ricevuto': true }));
    await assertSucceeds(setDoc(doc(d, 'inviti/nuovo-codice-0123456789'), { cliente: 'c1', attivo: true }));
  });
  await caso('foto troppo grande: no', () => assertFails(setDoc(doc(db('monica'), 'foto/lasagne'), { foto: 'x'.repeat(400001) })));
  await caso('richiesta di entrare: la propria sì, altrui no', async () => {
    const d = db('amica');
    await assertSucceeds(setDoc(doc(d, 'richieste/amica'), { id: 'amica', nome: 'Laura', tramite: 'c1', il: '2026-11-05' }));
    await assertFails(setDoc(doc(d, 'richieste/altra'), { id: 'altra', nome: 'X', tramite: 'c1', il: '2026-11-05' }));
    await assertFails(getDocs(collection(d, 'richieste')));
    await assertFails(getDoc(doc(d, 'piatti/lasagne')));
  });
  await caso('nessuno si fa gestore da solo', () => assertFails(setDoc(doc(db('tel1'), 'gestori/tel1'), { nome: 'io' })));

  console.log(`\n${ok} OK, ${no} NO`);
  await env.cleanup();
  process.exit(no ? 1 : 0);
})();
