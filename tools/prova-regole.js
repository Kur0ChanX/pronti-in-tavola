// Prove delle regole di sicurezza (firestore.rules) nell'emulatore di Firebase.
// Uso: npm run prova-regole   (scrive «OK»/«NO» per ogni caso e alla fine il totale)
// Controprova: REGOLE=<file di regole aperte> npm run prova-regole → devono fallire i casi «no».
const fs = require('fs');
const path = require('path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where, writeBatch } = require('firebase/firestore');

const IL = '2026-11-05';
const pronto = { formato: 't8', qta: 2, giorno: IL };
const ordine = (id, cliente, stato, extra) => Object.assign({ id, n: 1, utente: 'tel1', cliente, stato, righe: [], entro: '2026-11-07', proposta: null,
  paga: { metodo: 'contanti', dice: false, ricevuto: false }, nota: '', creato: IL, cuori: {}, modifica: null, esitoModifica: '' }, extra || {});
const utente = extra => Object.assign({ nome: 'Anna Sanna', chiave: 'anna-sanna', tramite: 'c1', il: IL, stato: 'nuovo', cliente: null, primo: null }, extra || {});

async function semina(env) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    const scrivi = (p, d) => setDoc(doc(db, p), d);
    await scrivi('gestori/monica', { nome: 'Monica' });
    await scrivi('impostazioni/app', { anticipo: 1, nuovi: true });
    await scrivi('impostazioni/approvati', { ritiro: 'Via di prova 1', whatsapp: '' });
    await scrivi('impostazioni/monica', { mario: '' });
    await scrivi('clienti/c1', { id: 'c1', nome: 'Giulia Bianchi', chiave: 'giulia-bianchi' });
    await scrivi('clienti/c2', { id: 'c2', nome: 'Paolo Rossi', chiave: 'paolo-rossi' });
    await scrivi('utenti/tel1', utente({ nome: 'Giulia Bianchi', chiave: 'giulia-bianchi', tramite: 'monica', stato: 'approvato', cliente: 'c1' }));
    await scrivi('utenti/tel2', utente({ nome: 'Paolo Rossi', chiave: 'paolo-rossi', tramite: 'c1', stato: 'approvato', cliente: 'c2' }));
    await scrivi('utenti/nuova', utente({ nome: 'Laura Neri', chiave: 'laura-neri' }));
    await scrivi('utenti/rifiutata', utente({ nome: 'Rita Mura', chiave: 'rita-mura', stato: 'no' }));
    for (const k of ['giulia-bianchi', 'paolo-rossi', 'laura-neri', 'rita-mura']) await scrivi('nomi/' + k, { il: IL });
    await scrivi('piatti/lasagne', { id: 'lasagne', nome: 'Lasagne', cuori: 3, pronto });
    await scrivi('foto/lasagne', { foto: 'data:image/jpeg;base64,AAAA' });
    await scrivi('contatori/ordini', { prossimo: 5, ultimo: '' });
    await scrivi('ordini/o1', ordine('o1', 'c1', 'nuovo'));
    await scrivi('ordini/o3', ordine('o3', 'c1', 'accettato'));
    await scrivi('ordini/o2', ordine('o2', 'c2', 'proposta', { utente: 'tel2', proposta: '2026-11-08' }));
  });
}

(async () => {
  const regole = process.env.REGOLE || path.join(__dirname, '../firestore.rules');
  const env = await initializeTestEnvironment({
    projectId: 'demo-pronti',
    firestore: { rules: fs.readFileSync(regole, 'utf8'), host: '127.0.0.1', port: 8080 }
  });
  const db = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
  const senzaRegole = fn => env.withSecurityRulesDisabled(ctx => fn(ctx.firestore()));
  let ok = 0, no = 0;
  const caso = async (nome, fn) => {
    await semina(env);
    try { await fn(); ok++; console.log('OK  ', nome); } catch (e) { no++; console.log('NO  ', nome, '→', String(e.message).split('\n')[0]); }
  };
  // Ordine di un telefono approvato (tel1 = cliente c1).
  const nuovoOrdine = (d, n, cliente, extra) => {
    const b = writeBatch(d);
    b.set(doc(d, 'ordini/o9'), ordine('o9', cliente, 'nuovo', Object.assign({ n }, extra)));
    b.update(doc(d, 'contatori/ordini'), { prossimo: n + 1, ultimo: 'o9' });
    return b;
  };
  // Primo ordine di un telefono non approvato: con «u» crea anche utenti/ (e nomi/ se nome è vero).
  const primoOrdine = (d, uid, { u, nome = true, n = 5, o } = {}) => {
    const b = writeBatch(d);
    if (u) b.set(doc(d, 'utenti/' + uid), utente(Object.assign({ primo: 'o9' }, u)));
    else b.update(doc(d, 'utenti/' + uid), { primo: 'o9' });
    if (u && nome) b.set(doc(d, 'nomi/' + (u.chiave || 'anna-sanna')), { il: IL });
    b.set(doc(d, 'ordini/o9'), ordine('o9', null, 'daApprovare', Object.assign({ n, utente: uid }, o)));
    b.update(doc(d, 'contatori/ordini'), { prossimo: n + 1, ultimo: 'o9' });
    return b;
  };

  // Telefono appena entrato col link
  await caso('chi non è entrato non vede il menù', () => assertFails(getDoc(doc(db(null), 'piatti/lasagne'))));
  await caso('telefono appena entrato vede menù, foto e impostazioni', async () => {
    const d = db('tel3');
    await assertSucceeds(getDoc(doc(d, 'piatti/lasagne'))); await assertSucceeds(getDoc(doc(d, 'foto/lasagne'))); await assertSucceeds(getDoc(doc(d, 'impostazioni/app')));
  });
  await caso('telefono appena entrato non vede indirizzo, clienti, ordini, nomi', async () => {
    const d = db('tel3');
    await assertFails(getDoc(doc(d, 'impostazioni/approvati'))); await assertFails(getDoc(doc(d, 'clienti/c1')));
    await assertFails(getDoc(doc(d, 'ordini/o1'))); await assertFails(getDoc(doc(d, 'utenti/tel1'))); await assertFails(getDoc(doc(d, 'nomi/giulia-bianchi')));
  });
  await caso('primo ordine col nome nuovo: utente, nome, ordine da approvare, contatore', () => assertSucceeds(primoOrdine(db('tel3'), 'tel3', { u: {} }).commit()));
  await caso('nome nuovo senza ordine: sì', () => {
    const d = db('tel3'), b = writeBatch(d);
    b.set(doc(d, 'utenti/tel3'), utente()); b.set(doc(d, 'nomi/anna-sanna'), { il: IL });
    return assertSucceeds(b.commit());
  });
  await caso('nome già usato: no', () => assertFails(primoOrdine(db('tel3'), 'tel3', { u: { nome: 'Giulia Bianchi', chiave: 'giulia-bianchi' } }).commit()));
  await caso('nome nuovo senza segnarlo in nomi/: no', () => assertFails(setDoc(doc(db('tel3'), 'utenti/tel3'), utente())));
  await caso('si scrive da solo «approvato»: no', () => {
    const d = db('tel3'), b = writeBatch(d);
    b.set(doc(d, 'utenti/tel3'), utente({ stato: 'approvato', cliente: 'c1' })); b.set(doc(d, 'nomi/anna-sanna'), { il: IL });
    return assertFails(b.commit());
  });
  await caso('si registra al posto di un altro telefono: no', () => {
    const d = db('tel3'), b = writeBatch(d);
    b.set(doc(d, 'utenti/tel4'), utente()); b.set(doc(d, 'nomi/anna-sanna'), { il: IL });
    return assertFails(b.commit());
  });
  await caso('«Accetta nuovi clienti» spento: no', async () => {
    await senzaRegole(d => updateDoc(doc(d, 'impostazioni/app'), { nuovi: false }));
    await assertFails(primoOrdine(db('tel3'), 'tel3', { u: {} }).commit());
  });
  await caso('telefono nuovo col nome già usato: «ricollega» sì', () => assertSucceeds(setDoc(doc(db('tel3'), 'utenti/tel3'), utente({ nome: 'Giulia Bianchi', chiave: 'giulia-bianchi', stato: 'ricollega' }))));
  await caso('«ricollega» con un nome che non c\'è: no', () => assertFails(setDoc(doc(db('tel3'), 'utenti/tel3'), utente({ stato: 'ricollega' }))));
  await caso('«ricollega» col primo ordine da approvare: sì', () => assertSucceeds(primoOrdine(db('tel3'), 'tel3', { u: { nome: 'Giulia Bianchi', chiave: 'giulia-bianchi', stato: 'ricollega' }, nome: false }).commit()));
  await caso('nessuno cancella o cambia un nome già usato', async () => {
    const d = db('tel1');
    await assertFails(deleteDoc(doc(d, 'nomi/laura-neri'))); await assertFails(setDoc(doc(d, 'nomi/laura-neri'), { il: '2026-11-06' }));
  });

  // Telefono registrato ma non ancora approvato
  await caso('registrato fa il primo ordine', () => assertSucceeds(primoOrdine(db('nuova'), 'nuova').commit()));
  await caso('secondo ordine prima dell\'ok di Monica: no', async () => {
    await senzaRegole(async d => { await setDoc(doc(d, 'ordini/o4'), ordine('o4', null, 'daApprovare', { utente: 'nuova' })); await updateDoc(doc(d, 'utenti/nuova'), { primo: 'o4' }); });
    await assertFails(primoOrdine(db('nuova'), 'nuova').commit());
  });
  await caso('ordine da approvare senza segnarlo nel suo utenti/: no', () => {
    const d = db('nuova'), b = writeBatch(d);
    b.set(doc(d, 'ordini/o9'), ordine('o9', null, 'daApprovare', { n: 5, utente: 'nuova' }));
    b.update(doc(d, 'contatori/ordini'), { prossimo: 6, ultimo: 'o9' });
    return assertFails(b.commit());
  });
  await caso('primo ordine annullato: lo può rifare', async () => {
    await senzaRegole(async d => { await setDoc(doc(d, 'ordini/o4'), ordine('o4', null, 'annullato', { utente: 'nuova' })); await updateDoc(doc(d, 'utenti/nuova'), { primo: 'o4' }); });
    await assertSucceeds(primoOrdine(db('nuova'), 'nuova').commit());
  });
  await caso('il nuovo annulla il suo ordine da approvare', async () => {
    await senzaRegole(d => setDoc(doc(d, 'ordini/o4'), ordine('o4', null, 'daApprovare', { utente: 'nuova' })));
    await assertSucceeds(updateDoc(doc(db('nuova'), 'ordini/o4'), { stato: 'annullato' }));
  });
  await caso('il nuovo non fa un ordine «nuovo» né a nome di un cliente', async () => {
    await assertFails(primoOrdine(db('nuova'), 'nuova', { o: { stato: 'nuovo' } }).commit());
    await assertFails(primoOrdine(db('nuova'), 'nuova', { o: { cliente: 'c1' } }).commit());
  });
  await caso('il nuovo non prende i pronti né le teglie', async () => {
    let d = db('nuova'), b = primoOrdine(d, 'nuova');
    b.update(doc(d, 'piatti/lasagne'), { pronto: Object.assign({}, pronto, { qta: 1 }), ultimoOrdine: 'o9' });
    await assertFails(b.commit());
    b = primoOrdine(d, 'nuova'); b.set(doc(d, 'settimane/2026-45'), { teglie: 1, ultimo: 'o9' });
    await assertFails(b.commit());
  });
  await caso('il nuovo non si approva da solo né cambia nome', async () => {
    const d = db('nuova');
    await assertFails(updateDoc(doc(d, 'utenti/nuova'), { stato: 'approvato', cliente: 'c1' }));
    await assertFails(updateDoc(doc(d, 'utenti/nuova'), { chiave: 'giulia-bianchi' }));
  });
  await caso('il nuovo vede il suo ordine, non l\'indirizzo né gli altri', async () => {
    await senzaRegole(d => setDoc(doc(d, 'ordini/o4'), ordine('o4', null, 'daApprovare', { utente: 'nuova' })));
    const d = db('nuova');
    await assertSucceeds(getDocs(query(collection(d, 'ordini'), where('utente', '==', 'nuova'))));
    await assertFails(getDoc(doc(d, 'ordini/o1'))); await assertFails(getDoc(doc(d, 'impostazioni/approvati')));
  });
  await caso('Monica dice «No»: quel telefono non ordina più', () => assertFails(primoOrdine(db('rifiutata'), 'rifiutata').commit()));

  // Telefono approvato
  await caso('approvato vede menù, foto, impostazioni e indirizzo', async () => {
    const d = db('tel1');
    for (const p of ['piatti/lasagne', 'foto/lasagne', 'impostazioni/app', 'impostazioni/approvati', 'clienti/c1']) await assertSucceeds(getDoc(doc(d, p)));
  });
  await caso('approvato non vede le cose solo di Monica', async () => {
    const d = db('tel1');
    await assertFails(getDoc(doc(d, 'impostazioni/monica'))); await assertFails(getDoc(doc(d, 'clienti/c2')));
    await assertFails(getDoc(doc(d, 'utenti/tel2'))); await assertFails(getDocs(collection(d, 'utenti')));
  });
  await caso('approvato vede solo i suoi ordini', async () => {
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
  await caso('ordine col telefono di un altro: no', () => assertFails(nuovoOrdine(db('tel1'), 5, 'c1', { utente: 'tel2' }).commit()));
  await caso('ordine già «soldi ricevuti»: no', () => assertFails(nuovoOrdine(db('tel1'), 5, 'c1', { paga: { metodo: 'contanti', dice: false, ricevuto: true } }).commit()));
  await caso('ordine senza contatore: no', () => assertFails(setDoc(doc(db('tel1'), 'ordini/o9'), ordine('o9', 'c1', 'nuovo', { n: 5 }))));
  await caso('contatore +1 senza ordine: no', () => assertFails(updateDoc(doc(db('tel1'), 'contatori/ordini'), { prossimo: 6, ultimo: 'o8' })));
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

  // Monica
  await caso('Monica ricollega un telefono nuovo: vede gli ordini del cliente', async () => {
    await assertSucceeds(setDoc(doc(db('tel3'), 'utenti/tel3'), utente({ nome: 'Giulia Bianchi', chiave: 'giulia-bianchi', stato: 'ricollega' })));
    await assertSucceeds(updateDoc(doc(db('monica'), 'utenti/tel3'), { stato: 'approvato', cliente: 'c1' }));
    await assertSucceeds(getDoc(doc(db('tel3'), 'ordini/o1')));
  });
  await caso('Monica approva un nuovo e il suo primo ordine', async () => {
    await senzaRegole(d => setDoc(doc(d, 'ordini/o4'), ordine('o4', null, 'daApprovare', { utente: 'nuova' })));
    const m = db('monica'), b = writeBatch(m);
    b.set(doc(m, 'clienti/c3'), { id: 'c3', nome: 'Laura Neri', chiave: 'laura-neri' });
    b.update(doc(m, 'utenti/nuova'), { stato: 'approvato', cliente: 'c3' });
    b.update(doc(m, 'ordini/o4'), { cliente: 'c3', stato: 'nuovo' });
    await assertSucceeds(b.commit());
    await assertSucceeds(getDoc(doc(db('nuova'), 'impostazioni/approvati')));
  });
  await caso('Monica cambia tutto e vede tutti gli ordini', async () => {
    const d = db('monica');
    await assertSucceeds(updateDoc(doc(d, 'piatti/lasagne'), { nome: 'Lasagne al ragù' }));
    await assertSucceeds(getDocs(collection(d, 'ordini'))); await assertSucceeds(getDocs(collection(d, 'utenti')));
    await assertSucceeds(updateDoc(doc(d, 'ordini/o3'), { stato: 'pronto', 'paga.ricevuto': true }));
    await assertSucceeds(updateDoc(doc(d, 'impostazioni/app'), { nuovi: false }));
  });
  await caso('spesa di Monica: solo lei la legge e la scrive (C15)', async () => {
    await assertSucceeds(setDoc(doc(db('monica'), 'impostazioni/spesa'), { versione: 1, dosi: { tiramisu: { mascarpone: 85 } }, mia: [{ id: 'v1', n: 'Latte', q: '', rep: 'Frigo', preso: false }] }));
    await assertSucceeds(getDoc(doc(db('monica'), 'impostazioni/spesa')));
    for (const chi of ['tel1', 'nuova', null]) {
      await assertFails(getDoc(doc(db(chi), 'impostazioni/spesa')));
      await assertFails(setDoc(doc(db(chi), 'impostazioni/spesa'), { versione: 1 }));
    }
  });
  await caso('foto troppo grande: no', () => assertFails(setDoc(doc(db('monica'), 'foto/lasagne'), { foto: 'x'.repeat(400001) })));
  await caso('nessuno si fa gestore da solo', () => assertFails(setDoc(doc(db('tel1'), 'gestori/tel1'), { nome: 'io' })));

  console.log(`\n${ok} OK, ${no} NO`);
  await env.cleanup();
  process.exit(no ? 1 : 0);
})();
