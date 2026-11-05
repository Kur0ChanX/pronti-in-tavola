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
  } catch (e) {
    no++; console.log('NO   la prova si è fermata →', e.message.split('\n')[0]);
  }
  controlla('nessun errore nelle pagine', errori.length === 0, errori.slice(0, 3));
  console.log(`\n${ok} OK, ${no} NO`);
  await browser.close(); await env.cleanup(); server.close();
  process.exit(no ? 1 : 0);
})();
