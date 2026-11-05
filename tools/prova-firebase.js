// Prova del motore «firebase» (dati.js) nel browser, con gli emulatori di Firestore e Auth.
// Uso: npm run prova-firebase   (scrive «OK»/«NO» per ogni controllo e il totale)
// La libreria Firebase arriva da node_modules/firebase al posto del sito gstatic (stessa versione).
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium, devices } = require('playwright');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { doc, getDoc, getDocs, collection, setDoc } = require('firebase/firestore');

const RADICE = path.resolve(__dirname, '..');
const PORTA = 5055;
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  const file = path.join(RADICE, p === '/' ? 'index.html' : p);
  if (!file.startsWith(RADICE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TIPI[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(PORTA, '127.0.0.1', r));
  const env = await initializeTestEnvironment({
    projectId: 'demo-pronti',
    firestore: { rules: fs.readFileSync(path.join(RADICE, 'firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 }
  });
  await env.clearFirestore();
  // Scrive o legge senza regole (come la console di Firebase) e restituisce il risultato.
  const admin = async fn => { let r; await env.withSecurityRulesDisabled(async ctx => { r = await fn(ctx.firestore()); }); return r; };
  const browser = await chromium.launch();
  let ok = 0, no = 0;
  const controlla = (nome, vero, dettaglio) => { if (vero) { ok++; console.log('OK  ', nome); } else { no++; console.log('NO  ', nome, dettaglio === undefined ? '' : '→ ' + JSON.stringify(dettaglio)); } };
  const errori = [];
  const apri = async () => {
    const ctx = await browser.newContext(devices['Pixel 7']);
    await ctx.route('https://www.gstatic.com/firebasejs/**', r => {
      const nome = r.request().url().split('/').pop();
      r.fulfill({ path: path.join(RADICE, 'node_modules/firebase', nome), contentType: 'text/javascript' });
    });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const page = await ctx.newPage();
    page.on('pageerror', e => errori.push(e.message));
    await page.goto(`http://127.0.0.1:${PORTA}/?emulatore`);
    await page.waitForFunction(() => Dati.io.uid, null, { timeout: 20000 });
    return page;
  };
  const aspetta = (page, fn, arg) => page.waitForFunction(fn, arg, { timeout: 15000 }).then(() => true, () => false);

  try {
    // Monica: la prima volta il database è vuoto, si caricano i 23 piatti
    const monica = await apri();
    const uidM = await monica.evaluate(() => Dati.io.uid);
    await admin(d => setDoc(doc(d, 'gestori/' + uidM), { nome: 'Monica' }));
    await monica.reload();
    controlla('Monica riconosciuta come gestore', await aspetta(monica, () => Dati.io.gestore === true));
    controlla('database vuoto: arrivano i 23 piatti', await aspetta(monica, () => S.piatti.length === 23));
    await monica.evaluate(() => Dati.confermato());
    const piatti = await admin(d => getDocs(collection(d, 'piatti')));
    controlla('i piatti sono sul server, senza foto dentro', piatti.size === 23 && piatti.docs.every(x => !('foto' in x.data())), piatti.size);
    const app = await admin(d => getDoc(doc(d, 'impostazioni/app')));
    controlla('indirizzo e WhatsApp non stanno nelle impostazioni pubbliche', app.exists() && !('ritiro' in app.data()) && !('whatsapp' in app.data()));
    controlla('Monica vede la sua parte (niente striscia di prova)', await monica.evaluate(() => P.ruolo === 'monica' && !document.querySelector('.prova')));

    // Monica cambia un campo: si scrive solo quel campo
    await admin(d => setDoc(doc(d, 'piatti/tiramisu'), { campoDiMario: 'resta' }, { merge: true }));
    await aspetta(monica, () => S.piatti.find(p => p.id === 'tiramisu').campoDiMario === 'resta');
    await monica.evaluate(() => { S.piatti.find(p => p.id === 'tiramisu').stagione = 'inverno'; return salva(); });
    const tira = (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data();
    controlla('si scrive solo il campo cambiato', tira.stagione === 'inverno' && tira.campoDiMario === 'resta', tira.stagione);
    controlla('«Salvato» solo dopo la conferma del server', await monica.evaluate(() => Dati.inAttesa() === 0));
    await monica.evaluate(() => { S.impostazioni.ritiro.via = 'Via di prova 1'; return salva(); });
    const appr = (await admin(d => getDoc(doc(d, 'impostazioni/approvati')))).data();
    controlla('indirizzo del ritiro nel documento solo per approvati', appr && appr.ritiro.via === 'Via di prova 1');

    // Cliente nuovo: vede il menù, non l'indirizzo
    const cliente = await apri();
    controlla('cliente nuovo vede il menù', await aspetta(cliente, () => S.piatti.length === 23));
    controlla('cliente nuovo non vede l\'indirizzo', await cliente.evaluate(() => S.impostazioni.ritiro.via === '' && P.ruolo === 'cliente'));
    controlla('il cambio di Monica arriva al cliente', await cliente.evaluate(() => S.piatti.find(p => p.id === 'tiramisu').stagione === 'inverno'));
    controlla('il cliente vede «Sei Monica? Entra»', await cliente.evaluate(() => !!document.querySelector('[data-a="entra-monica"]')));

    // Monica approva il cliente: da quel momento vede l'indirizzo
    const uidC = await cliente.evaluate(() => Dati.io.uid);
    await admin(async d => {
      await setDoc(doc(d, 'clienti/c1'), { id: 'c1', nome: 'Anna Sanna', chiave: 'anna-sanna', da: '2026-11-05' });
      await setDoc(doc(d, 'utenti/' + uidC), { nome: 'Anna Sanna', chiave: 'anna-sanna', tramite: 'monica', il: '2026-11-05', stato: 'approvato', cliente: 'c1', primo: null });
    });
    controlla('approvato: vede l\'indirizzo senza riaprire l\'app', await aspetta(cliente, () => S.impostazioni.ritiro.via === 'Via di prova 1'));
    controlla('approvato: l\'app sa chi è', await cliente.evaluate(() => P.cliente === 'c1'));

    // Copia sul telefono: alla prossima apertura il menù si vede subito, anche prima della rete
    controlla('copia del menù sul telefono', await cliente.evaluate(() => (Dati.copiaLocale() || { piatti: [] }).piatti.length === 23));

    // Ordini veri dei clienti
    const RIGA = `window.riga = (pid, pronto, qta) => { const p = S.piatti.find(x => x.id === pid), f = p.formati[0];
      return { piatto: p.id, nome: p.nome, formato: f.id, formatoNome: f.nome, tipo: f.tipo, variante: '', varianteNome: '', qta: qta || 1, prezzo: f.prezzo, note: [], testo: '', pronto }; }`;
    const oggiPag = await cliente.evaluate(() => oggi());
    await admin(d => setDoc(doc(d, 'piatti/tiramisu'), { pronto: { formato: 't6', qta: 1, giorno: oggiPag } }, { merge: true }));
    const nuovo = await apri();
    await aspetta(nuovo, () => S.piatti.length === 23 && S.piatti.find(p => p.id === 'tiramisu').pronto);
    await nuovo.evaluate(RIGA);
    await nuovo.evaluate(() => { P.carrello = [riga('tiramisu', true)]; return inviaVero(); });
    controlla('primo ordine: chiede «Come ti chiami?»', await nuovo.evaluate(() => UI.foglio && UI.foglio.tipo === 'nome' && !!document.querySelector('#nome-nuovo')));
    await nuovo.fill('#nome-nuovo', 'Lùcia  Piras');
    await nuovo.click('[data-a="nome-ok"]');
    const uidN = await nuovo.evaluate(() => Dati.io.uid);
    controlla('primo ordine partito «da approvare»', await aspetta(nuovo, () => P.carrello.length === 0 && S.ordini.some(o => o.stato === 'daApprovare')));
    const nomeN = await admin(d => getDoc(doc(d, 'nomi/lucia-piras')));
    const uN = (await admin(d => getDoc(doc(d, 'utenti/' + uidN)))).data();
    controlla('nome segnato una volta (senza accenti né spazi doppi)', nomeN.exists() && uN.nome === 'Lùcia Piras' && uN.stato === 'nuovo' && !!uN.primo, uN);
    controlla('il nuovo non ha preso il pronto', (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data().pronto.qta === 1);

    const doppio = await apri();
    await aspetta(doppio, () => S.piatti.length === 23);
    await doppio.evaluate(RIGA);
    await doppio.evaluate(() => { P.carrello = [riga('tiramisu', true)]; return inviaVero(); });
    await doppio.fill('#nome-nuovo', 'Lucia Piras');
    await doppio.click('[data-a="nome-ok"]');
    controlla('nome già usato: «Sei tu con un telefono nuovo?»', await aspetta(doppio, () => UI.foglio && UI.foglio.usato === 'Lucia Piras' && !!document.querySelector('[data-a="nome-ricollega"]')));
    await doppio.click('[data-a="nome-ricollega"]');
    const uidD = await doppio.evaluate(() => Dati.io.uid);
    controlla('«Sì, sono io»: chiede di ricollegare e l\'ordine parte', await aspetta(doppio, () => P.carrello.length === 0)
      && (await admin(d => getDoc(doc(d, 'utenti/' + uidD)))).data().stato === 'ricollega');

    // Il cliente approvato (cliente, c1) e un secondo approvato si contendono l'ultimo pronto
    await admin(async d => {
      await setDoc(doc(d, 'clienti/c2'), { id: 'c2', nome: 'Lucia Piras', chiave: 'lucia-piras', da: oggiPag });
      await setDoc(doc(d, 'utenti/' + uidN), { stato: 'approvato', cliente: 'c2' }, { merge: true });
    });
    await aspetta(nuovo, () => P.cliente === 'c2');
    await cliente.evaluate(RIGA);
    await cliente.evaluate(() => { P.carrello = [riga('tiramisu', true)]; return inviaVero(); });
    controlla('approvato: prende l\'ultimo pronto', (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data().pronto.qta === 0);
    await nuovo.evaluate(() => { P.carrello = [riga('tiramisu', true)]; return inviaVero(); });
    controlla('l\'altro legge «l\'ha appena preso qualcun altro» e il piatto torna da prenotare',
      await nuovo.evaluate(() => P.carrello.length === 1 && P.carrello[0].pronto === false && /appena preso/.test(document.querySelector('#toast').textContent)));
    await aspetta(cliente, () => S.ordini.some(o => o.pronto && o.stato === 'nuovo'));
    const oP = await cliente.evaluate(() => (S.ordini.find(o => o.pronto && o.stato === 'nuovo') || {}).id);
    await cliente.evaluate(id => A['annulla-ordine']({ dataset: { id } }), oP);
    await cliente.evaluate(() => Dati.confermato());
    controlla('annulla: il pronto torna a disposizione', (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data().pronto.qta === 1);

    // Teglie della settimana e senza rete
    await cliente.evaluate(() => { UI.entro = piuGiorni(oggi(), 3); P.carrello = [riga('lasagne-ragu', false, 2)]; return inviaVero(); });
    const sett = await cliente.evaluate(() => settimana(piuGiorni(oggi(), 3)));
    const st = await admin(d => getDoc(doc(d, 'settimane/' + sett)));
    controlla('le teglie si contano nella settimana', st.exists() && st.data().teglie === 2, st.exists() && st.data());
    await cliente.context().setOffline(true);
    await cliente.evaluate(() => { UI.entro = piuGiorni(oggi(), 3); P.carrello = [riga('lasagne-ragu', false, 1)]; return inviaVero(); });
    controlla('senza rete l\'ordine resta nel carrello con l\'avviso', await cliente.evaluate(() => P.carrello.length === 1 && UI.riprova === true && /manca la rete/.test(document.querySelector('#toast').textContent)));
    await cliente.context().setOffline(false);
    controlla('torna la rete: l\'ordine riparte da solo', await aspetta(cliente, () => P.carrello.length === 0));
  } catch (e) {
    no++; console.log('NO   la prova si è fermata →', e.message.split('\n')[0]);
  }
  controlla('nessun errore nelle pagine', errori.length === 0, errori.slice(0, 3));
  console.log(`\n${ok} OK, ${no} NO`);
  await browser.close(); await env.cleanup(); server.close();
  process.exit(no ? 1 : 0);
})();
