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
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };

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
  // impronta: true → telefono con l'impronta finta (autenticatore virtuale di Chromium); WebAuthn vuole «localhost», non l'IP
  const apri = async (opz = {}) => {
    const ctx = await browser.newContext(Object.assign({}, devices['Pixel 7'], { serviceWorkers: opz.sw ? 'allow' : 'block' }));
    await ctx.route('https://www.gstatic.com/firebasejs/**', r => {
      const nome = r.request().url().split('/').pop();
      r.fulfill({ path: path.join(RADICE, 'node_modules/firebase', nome), contentType: 'text/javascript' });
    });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const page = await ctx.newPage();
    if (opz.impronta) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('WebAuthn.enable', { enableUI: false });
      const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: {
        protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } });
      page.impronta = giusta => cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: giusta });
    }
    page.on('pageerror', e => errori.push(e.message));
    if (process.env.VEDI) page.on('console', m => { if (/warn|error/.test(m.type())) console.log('   [pagina]', m.text().slice(0, 300)); });
    await page.goto(`http://${opz.impronta ? 'localhost' : '127.0.0.1'}:${PORTA}/?emulatore`);
    await page.waitForFunction(() => Dati.io.uid, null, { timeout: 20000 });
    return page;
  };
  const aspetta = (page, fn, arg) => page.waitForFunction(fn, arg, { timeout: 15000 }).then(() => true, () => false);

  try {
    // Monica: la prima volta il database è vuoto, si caricano i 23 piatti
    const monica = await apri({ impronta: true });
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
    // Lucchetto: appena entrata propone l'impronta; prima nessun dato nella pagina
    controlla('lucchetto: appena entrata, «Metti l\'impronta» e niente dati', await aspetta(monica, () => !!document.querySelector('[data-a="lucchetto-metti"]')
      && !document.querySelector('#app [data-v="ordini"]')));
    await monica.click('[data-a="lucchetto-metti"]');
    controlla('lucchetto messo: la parte si apre', await aspetta(monica, () => L.aperto && !!(Lucchetto.di(Dati.io.uid) || {}).id && !!document.querySelector('#app [data-v="ordini"]')));

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

    // Un cambio del server non ancora arrivato in S (i 30 ms prima del ridisegno) non si riscrive né si cancella
    await monica.evaluate(() => { window.__st = window.setTimeout; window.__fermi = []; window.setTimeout = (f, ms) => (ms === 30 ? (__fermi.push(f), 0) : __st(f, ms)); });
    await admin(d => setDoc(doc(d, 'piatti/tiramisu'), { stagione: 'estate' }, { merge: true }));
    await admin(d => setDoc(doc(d, 'clienti/cProva'), { nome: 'Cliente Prova' }));
    await monica.waitForFunction(() => __fermi.length > 0, null, { timeout: 15000 }).catch(() => {});
    await monica.waitForTimeout(800);
    await monica.evaluate(() => { S.impostazioni.prontiFino = '21:00'; return salva(); });
    await monica.evaluate(() => { window.setTimeout = __st; __fermi.splice(0).forEach(f => f()); return Dati.confermato(); });
    const tira2 = (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data(), cP = await admin(d => getDoc(doc(d, 'clienti/cProva')));
    const app2 = (await admin(d => getDoc(doc(d, 'impostazioni/app')))).data();
    controlla('cambio del server non ancora in S: resta, e il campo di Monica si scrive', tira2.stagione === 'estate' && cP.exists() && app2.prontiFino === '21:00', [tira2.stagione, cP.exists(), app2.prontiFino]);
    await admin(d => require('firebase/firestore').deleteDoc(doc(d, 'clienti/cProva')));
    await admin(d => setDoc(doc(d, 'piatti/tiramisu'), { stagione: 'inverno' }, { merge: true }));

    // Cliente nuovo: vede il menù, non l'indirizzo
    const cliente = await apri();
    controlla('cliente nuovo vede il menù', await aspetta(cliente, () => S.piatti.length === 23));
    controlla('cliente: niente striscia di prova né «Ricomincia»', await cliente.evaluate(() => !document.querySelector('.prova') && !document.querySelector('[data-a="ricomincia"]')));
    controlla('cliente nuovo: il link da girare non ha «#da=» vuoto', await cliente.evaluate(() => { apriPiatto('tiramisu'); const h = decodeURIComponent(document.querySelector('.foglio a[href*="wa.me"]').href); A.chiudi(); return !/#da=$/.test(h) && !/invito/.test(h); }));
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

    // Chi scrive in una finestra (la nota del piatto) non perde testo né tastiera quando arriva un cambio
    const oggiC = await cliente.evaluate(() => oggi());
    await cliente.evaluate(() => apriPiatto('tiramisu'));
    await cliente.click('#nota-piatto'); await cliente.keyboard.type('senza cacao');
    await admin(d => setDoc(doc(d, 'piatti/tiramisu'), { pronto: { formato: 't6', qta: 2, giorno: oggiC } }, { merge: true }));
    await aspetta(cliente, () => (S.piatti.find(p => p.id === 'tiramisu').pronto || {}).qta === 2);
    controlla('finestra: testo e tastiera restano quando arriva un cambio',
      await cliente.evaluate(() => document.activeElement.id === 'nota-piatto' && document.activeElement.value === 'senza cacao'),
      await cliente.evaluate(() => [document.activeElement.id, document.activeElement.value]));
    await cliente.evaluate(() => document.activeElement.blur());
    controlla('finestra: uscita dal campo, la pagina mostra il cambio',
      await aspetta(cliente, () => [...document.querySelectorAll('.pronto-carta')].some(e => /iramis/.test(e.textContent))));
    await cliente.evaluate(() => A.chiudi());

    // Foto (C2): dentro Firestore, versione nel piatto; il cliente la scarica una volta sola, poi dalla copia del telefono
    const FOTO = await monica.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 40; const x = c.getContext('2d'); x.fillStyle = '#C4532E'; x.fillRect(0, 0, 40, 40); return c.toDataURL('image/jpeg', 0.8); });
    await monica.evaluate(f => { S.piatti.find(p => p.id === 'tiramisu').foto = f; salva(); }, FOTO);
    await monica.evaluate(() => Dati.confermato());
    const pT = (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data(), fT = await admin(d => getDoc(doc(d, 'foto/tiramisu')));
    controlla('foto: nel suo documento, e il piatto ha la versione', fT.exists() && fT.data().foto === FOTO && !!pT.fotoV && !('foto' in pT), pT.fotoV);
    controlla('foto: arriva al cliente', await aspetta(cliente, f => S.piatti.find(p => p.id === 'tiramisu').foto === f, FOTO));
    const scaricate = await cliente.evaluate(() => Dati.fotoDalServer());
    await cliente.reload();
    await cliente.waitForFunction(() => Dati.io.uid, null, { timeout: 20000 });
    controlla('foto: riaperta l\'app arriva dalla copia del telefono, senza riscaricarla', await aspetta(cliente, f => S.piatti.find(p => p.id === 'tiramisu').foto === f, FOTO)
      && await cliente.evaluate(() => Dati.fotoDalServer() === 0) && scaricate === 1, scaricate);
    controlla('foto: la copia veloce (localStorage) non tiene le foto', await cliente.evaluate(() => !/data:image/.test(localStorage.getItem('pit-copia-v1') || '')));
    await monica.evaluate(() => { S.piatti.find(p => p.id === 'tiramisu').stagione = 'inverno'; salva(); });
    await monica.evaluate(() => Dati.confermato());
    controlla('foto: un altro cambio del piatto non la riscrive né la toglie', (await admin(d => getDoc(doc(d, 'foto/tiramisu')))).exists()
      && (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data().fotoV === pT.fotoV);
    await monica.evaluate(() => { S.piatti.find(p => p.id === 'tiramisu').foto = null; salva(); });
    await monica.evaluate(() => Dati.confermato());
    controlla('foto tolta: sparisce dal server e dal cliente', !(await admin(d => getDoc(doc(d, 'foto/tiramisu')))).exists()
      && await aspetta(cliente, () => !S.piatti.find(p => p.id === 'tiramisu').foto));
    // foto pesantissima (rumore): si alleggerisce sotto il tetto e il server la accetta
    await monica.evaluate(() => new Promise(fine => {
      const c = document.createElement('canvas'); c.width = c.height = 1800; const x = c.getContext('2d'), im = x.createImageData(1800, 1800);
      for (let i = 0; i < im.data.length; i++) im.data[i] = (i % 4 === 3) ? 255 : Math.random() * 255;
      x.putImageData(im, 0, 0);
      c.toBlob(b => { caricaFoto({ files: [new File([b], 'rumore.png', { type: 'image/png' })], dataset: { id: 'lasagne-ragu' } }); fine(); }, 'image/png');
    }));
    await aspetta(monica, () => !!S.piatti.find(p => p.id === 'lasagne-ragu').foto);
    await monica.evaluate(() => Dati.confermato()).catch(() => {});
    const fL = await admin(d => getDoc(doc(d, 'foto/lasagne-ragu')));
    controlla('foto pesante: alleggerita sotto i 400.000 caratteri e salvata', fL.exists() && fL.data().foto.length < 400000, fL.exists() && fL.data().foto.length);

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
    await nuovo.evaluate(() => { window.__t = []; new MutationObserver(() => __t.push(document.querySelector('#toast').textContent)).observe(document.querySelector('#toast'), { childList: true, subtree: true, characterData: true }); });
    await nuovo.fill('#nome-nuovo', 'Lùcia  Piras');
    await nuovo.click('[data-a="nome-ok"]');
    const uidN = await nuovo.evaluate(() => Dati.io.uid);
    controlla('primo ordine partito «da approvare»', await aspetta(nuovo, () => P.carrello.length === 0 && S.ordini.some(o => o.stato === 'daApprovare')),
      await nuovo.evaluate(() => [__t, S.impostazioni.nuovi, UI.foglio, UI.invio, P.carrello.length, navigator.onLine]));
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

    // Monica decide sui telefoni nuovi
    // a) «Telefono nuovo» con lo stesso nome di Lucia Piras (c2): Ricollega, prende il pronto se c'è ancora
    const uD = async () => (await admin(d => getDoc(doc(d, 'utenti/' + uidD)))).data();
    await aspetta(monica, id => S.richieste.some(r => r.id === id && r.cliente === 'c2'), uidD);
    await monica.evaluate(() => vai('clienti'));
    controlla('Monica vede «Telefono nuovo» con «Sì, ricollega»', await monica.evaluate(id => /Telefono nuovo/.test(document.querySelector('main').textContent)
      && /ricollega/.test((document.querySelector(`[data-a="richiesta-si"][data-id="${id}"]`) || {}).textContent || ''), uidD));
    await monica.click(`[data-a="richiesta-si"][data-id="${uidD}"]`);
    controlla('Ricollega: il telefono nuovo torna di Lucia Piras', await aspetta(doppio, () => P.cliente === 'c2') && (await uD()).stato === 'approvato');
    const primoD = (await uD()).primo;
    const oD = (await admin(d => getDoc(doc(d, 'ordini/' + primoD)))).data();
    controlla('il suo primo ordine diventa «nuovo» e prende il pronto rimasto', oD.stato === 'nuovo' && oD.cliente === 'c2' && oD.pronto === true
      && (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data().pronto.qta === 0, oD);
    controlla('ricollega: nessun cliente doppio', (await admin(d => getDocs(collection(d, 'clienti')))).size === 2);
    // prezzo cambiato dal telefono: Monica accetta col prezzo del suo menù
    const prezzoT = await monica.evaluate(() => S.piatti.find(p => p.id === 'tiramisu').formati[0].prezzo);
    await admin(d => setDoc(doc(d, 'ordini/' + primoD), { righe: [Object.assign({}, oD.righe[0], { prezzo: 0.5 })] }, { merge: true }));
    await aspetta(monica, id => ((S.ordini.find(o => o.id === id) || {}).righe || [{}])[0].prezzo === 0.5, primoD);
    controlla('il totale che vede Monica usa i suoi prezzi', await monica.evaluate(([id, pz]) => { UI.tab = 'guardare'; vai('ordini');
      return [...document.querySelectorAll('.ordine-carta')].some(c => c.querySelector(`[data-id="${id}"]`) && c.querySelector('.totale').textContent.includes(euro(pz))); }, [primoD, prezzoT]));
    await monica.evaluate(id => A.accetta({ dataset: { id } }), primoD);
    await monica.evaluate(() => Dati.confermato());
    controlla('Accetta: nell\'ordine resta il prezzo del menù', (await admin(d => getDoc(doc(d, 'ordini/' + primoD)))).data().righe[0].prezzo === prezzoT);

    // b) Cliente nuovo, ma il pronto è finito nel frattempo; poi Annulla
    const terzo = await apri();
    await admin(d => setDoc(doc(d, 'piatti/tiramisu'), { pronto: { formato: 't6', qta: 1, giorno: oggiPag } }, { merge: true }));
    await aspetta(terzo, () => S.piatti.length === 23 && (S.piatti.find(p => p.id === 'tiramisu').pronto || {}).qta === 1);
    await terzo.evaluate(RIGA);
    await terzo.evaluate(() => { P.carrello = [riga('tiramisu', true)]; return inviaVero(); });
    await terzo.fill('#nome-nuovo', 'Sara Mura');
    await terzo.click('[data-a="nome-ok"]');
    await aspetta(terzo, () => P.carrello.length === 0);
    controlla('il cliente nuovo legge «Monica ti conferma lei»', await terzo.evaluate(() => /primo ordine/.test(document.querySelector('main').textContent)));
    const uidT = await terzo.evaluate(() => Dati.io.uid);
    await admin(d => setDoc(doc(d, 'piatti/tiramisu'), { pronto: { formato: 't6', qta: 0, giorno: oggiPag } }, { merge: true }));
    await aspetta(monica, id => S.ordini.some(o => o.utente === id && o.stato === 'daApprovare') && S.piatti.find(p => p.id === 'tiramisu').pronto.qta === 0, uidT);
    await monica.evaluate(() => { UI.tab = 'guardare'; vai('ordini'); });
    controlla('il primo ordine di Sara Mura è in «Da guardare» con Sì e No', await monica.evaluate(id => /Sara Mura/.test(document.querySelector('main').textContent)
      && !!document.querySelector(`[data-a="richiesta-si"][data-id="${id}"]`) && !!document.querySelector(`[data-a="richiesta-no"][data-id="${id}"]`), uidT));
    await monica.click(`[data-a="richiesta-si"][data-id="${uidT}"]`);
    controlla('pronto finito: l\'ordine resta da fare in un altro giorno', await aspetta(monica, id => S.ordini.some(o => o.utente === id && o.stato === 'nuovo' && o.pronto === false)
      && /proponi un altro giorno/.test(document.querySelector('#toast').textContent), uidT));
    const uT = (await admin(d => getDoc(doc(d, 'utenti/' + uidT)))).data();
    controlla('Sara Mura diventa cliente', uT.stato === 'approvato' && (await admin(d => getDoc(doc(d, 'clienti/' + uT.cliente)))).exists(), uT);
    await monica.click('#toast [data-a="annulla"]');
    controlla('Annulla: torna tutto com\'era', await aspetta(monica, id => S.richieste.some(r => r.id === id) && S.ordini.some(o => o.utente === id && o.stato === 'daApprovare' && o.pronto === true), uidT)
      && !(await admin(d => getDoc(doc(d, 'clienti/' + uT.cliente)))).exists() && (await admin(d => getDoc(doc(d, 'utenti/' + uidT)))).data().stato === 'nuovo');

    // c) No: il telefono non può più ordinare
    await aspetta(monica, id => !!document.querySelector(`[data-a="richiesta-no"][data-id="${id}"]`), uidT);
    await monica.click(`[data-a="richiesta-no"][data-id="${uidT}"]`);
    controlla('No: ordine rifiutato e il telefono resta fuori', await aspetta(terzo, () => Dati.io.utente && Dati.io.utente.stato === 'no' && S.ordini.some(o => o.stato === 'rifiutato')));
    await terzo.evaluate(() => { UI.entro = piuGiorni(oggi(), 3); P.carrello = [riga('lasagne-ragu', false, 1)]; return inviaVero(); });
    controlla('dopo il No legge «Monica per ora non può prendere il tuo ordine»', /non può prendere/.test(await terzo.textContent('#toast')));

    // d) «Accetta clienti nuovi» spento
    await monica.evaluate(() => { vai('clienti'); const i = document.querySelector('[data-campo="i.nuovi"]'); i.checked = false; i.dispatchEvent(new Event('change', { bubbles: true })); });
    await monica.evaluate(() => Dati.confermato());
    controlla('interruttore spento sul server', (await admin(d => getDoc(doc(d, 'impostazioni/app')))).data().nuovi === false);
    const quarto = await apri();
    await aspetta(quarto, () => S.piatti.length === 23 && S.impostazioni.nuovi === false);
    await quarto.evaluate(RIGA);
    await quarto.evaluate(() => { UI.entro = piuGiorni(oggi(), 3); P.carrello = [riga('lasagne-ragu', false, 1)]; return inviaVero(); });
    await quarto.fill('#nome-nuovo', 'Pino Fois');
    await quarto.click('[data-a="nome-ok"]');
    controlla('spento: il telefono nuovo legge «non prende clienti nuovi»', await aspetta(quarto, () => /non prende clienti nuovi/.test(document.querySelector('#toast').textContent)));

    // e) lucchetto: riaperta l'app si chiude, si apre da solo con l'impronta, si richiude fuori dall'app
    await monica.reload();
    controlla('riaperta l\'app: la parte è chiusa, nessun cliente nella pagina', await aspetta(monica, () => !!document.querySelector('[data-a="lucchetto-apri"]')
      && !/Sara Mura|Paolo Sanna|Ordini/.test(document.querySelector('#app').textContent)));
    controlla('finita l\'apertura, l\'impronta si chiede da sola e apre', await aspetta(monica, () => L.aperto && !document.querySelector('.apertura')));
    const fuori = (pg, minuti) => pg.evaluate(m => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange'));
      L.via -= m * 60000; delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange'));
    }, minuti);
    await fuori(monica, 1);
    controlla('fuori dall\'app 1 minuto: resta aperta', await monica.evaluate(() => L.aperto));
    await monica.impronta(false);
    await fuori(monica, 6);
    controlla('fuori 6 minuti e impronta sbagliata: resta chiusa con l\'avviso', await aspetta(monica, () => !L.aperto && !L.inCorso && /Non si è aperta/.test(document.querySelector('#app').textContent)));
    await monica.impronta(true);
    await monica.click('[data-a="lucchetto-apri"]');
    controlla('impronta giusta col pulsante: si apre', await aspetta(monica, () => L.aperto));
    await monica.evaluate(() => vai('impostazioni'));
    controlla('dati veri: niente «Ricomincia la prova da capo»', await monica.evaluate(() => !document.querySelector('[data-a="ricomincia"]')));
    await monica.click('[data-a="i-lucchetto"][data-d="1"]');
    await monica.evaluate(() => Dati.confermato());
    const minSrv = (await admin(d => getDoc(doc(d, 'impostazioni/app')))).data().lucchetto;
    controlla('Impostazioni: «si richiude dopo» 10 minuti, sul server', minSrv === 10, [minSrv, await monica.evaluate(() => [S.impostazioni.lucchetto, UI.vista, !!document.querySelector('[data-a="i-lucchetto"]'), Dati.io.gestore, Dati.io.pronto])]);
    // chiave persa (o telefono che non la trova più): di nuovo Google, poi impronta nuova
    const vecchia = await monica.evaluate(() => { const id = Lucchetto.di(Dati.io.uid).id; Lucchetto.metti(Dati.io.uid, null); Dati.io.entrata = 0; L.aperto = false; render(); return id; });
    controlla('senza chiave e senza entrata fresca: «Entra con Google»', await aspetta(monica, () => statoLucchetto() === 'google' && !!document.querySelector('[data-a="lucchetto-google"]')));
    await monica.evaluate(() => { Dati.rientra = async () => { Dati.io.entrata = Date.now(); }; });
    await monica.click('[data-a="lucchetto-google"]');
    await monica.click('[data-a="lucchetto-metti"]');
    controlla('dopo Google: impronta nuova e parte aperta', await aspetta(monica, id => L.aperto && Lucchetto.di(Dati.io.uid).id && Lucchetto.di(Dati.io.uid).id !== id, vecchia));

    // g) Monica apre l'app senza rete: le modifiche restano in coda e partono da sole; quello che è cambiato intanto sul server resta
    await admin(d => setDoc(doc(d, 'piatti/tiramisu'), { pronto: { formato: 't6', qta: 3, giorno: oggiPag } }, { merge: true }));
    await aspetta(monica, () => (S.piatti.find(p => p.id === 'tiramisu').pronto || {}).qta === 3);
    const tegliePrima = (await admin(d => getDoc(doc(d, 'settimane/' + sett)))).data().teglie;
    const oL = await monica.evaluate(() => (S.ordini.find(o => o.cliente === 'c1' && o.stato === 'nuovo' && !o.pronto && o.righe.some(r => r.piatto === 'lasagne-ragu' && r.qta === 2)) || {}).id);
    const SENZA = /127\.0\.0\.1:8080/;
    await monica.context().route(SENZA, r => r.abort());
    await monica.reload();
    controlla('senza rete: Monica riconosciuta dalla copia del telefono e parte aperta con l\'impronta', await aspetta(monica, () => Dati.io.gestore && !Dati.io.pronto && L.aperto && S.piatti.length === 23));
    // intanto sul server: un cliente prende 2 tiramisù pronti e arrivano 5 teglie nella stessa settimana
    await admin(async d => {
      await setDoc(doc(d, 'piatti/tiramisu'), { pronto: { formato: 't6', qta: 1, giorno: oggiPag } }, { merge: true });
      await setDoc(doc(d, 'settimane/' + sett), { teglie: tegliePrima + 5 }, { merge: true });
    });
    await monica.evaluate(id => {
      A.rifiuta({ dataset: { id } });        // rifiuta un ordine da 2 teglie
      segnaPronto(piatto('tiramisu'), 1);   // un tiramisù pronto in più (lei ne vede 3 → 4); tre salvataggi di fila
      S.piatti.find(p => p.id === 'tiramisu').stagione = 'primavera'; salva();
    }, oL);
    controlla('senza rete: modifiche in coda con l\'avviso «si salverà appena torna»', await aspetta(monica, () => Dati.inAttesa() > 0 && /si salverà appena torna/.test(document.querySelector('#toast').textContent)));
    await monica.evaluate(() => vai('impostazioni'));
    await monica.click('[data-a="lucchetto-esci"]');
    await monica.click('[data-a="lucchetto-esci"]');
    controlla('modifiche in coda: «Esci da questo telefono» aspetta la rete', await aspetta(monica, () => /Non esco ancora/.test(document.querySelector('#toast').textContent) && Dati.io.gestore));
    await monica.context().unroute(SENZA);
    await monica.evaluate(() => dispatchEvent(new Event('online')));
    controlla('torna la rete: le modifiche partono da sole', await aspetta(monica, () => Dati.io.pronto && Dati.inAttesa() === 0));
    const tiraG = (await admin(d => getDoc(doc(d, 'piatti/tiramisu')))).data(), settG = (await admin(d => getDoc(doc(d, 'settimane/' + sett)))).data();
    controlla('pronti: conta la differenza (1 rimasto + 1 di Monica = 2), non il 4 che vedeva lei', tiraG.pronto.qta === 2 && tiraG.stagione === 'primavera', [tiraG.pronto, tiraG.stagione]);
    controlla('teglie: le 5 arrivate intanto restano, meno le 2 rifiutate', settG.teglie === tegliePrima + 5 - 2, [tegliePrima, settG.teglie]);
    controlla('l\'ordine rifiutato senza rete è rifiutato sul server', (await admin(d => getDoc(doc(d, 'ordini/' + oL)))).data().stato === 'rifiutato');

    // h) l'app si apre anche senza rete (service worker): pagina e file dalla copia, menù dalla copia del telefono
    const versFB = fs.readFileSync(path.join(RADICE, 'dati.js'), 'utf8').match(/FIREBASE_VERSIONE = '([\d.]+)'/)[1];
    controlla('service worker: stessa versione di Firebase di dati.js', fs.readFileSync(path.join(RADICE, 'sw.js'), 'utf8').includes(`VERSIONE_FB = '${versFB}'`));
    const sw = await apri({ sw: true });
    await aspetta(sw, () => S.piatti.length === 23);
    controlla('service worker attivo', await sw.evaluate(() => navigator.serviceWorker.ready.then(r => !!r.active)));
    await sw.reload();
    await sw.waitForFunction(() => Dati.io.uid, null, { timeout: 20000 });
    await aspetta(sw, () => S.piatti.length === 23 && !!navigator.serviceWorker.controller && ((Dati.copiaLocale() || {}).piatti || []).length === 23);
    await sw.context().setOffline(true);
    await sw.reload();
    controlla('senza rete l\'app si apre col menù', await aspetta(sw, () => typeof S === 'object' && S.piatti.length === 23 && /Tiramis/.test(document.querySelector('#app').textContent)));
    controlla('senza rete anche la libreria Firebase dalla copia (telefono riconosciuto)', await aspetta(sw, () => !!Dati.io.uid));
    await sw.context().setOffline(false);

    // f) telefono senza blocco schermo (Mario): la parte resta aperta con l'avviso; poi «Esci da questo telefono»
    const mario = await apri();
    const uidMa = await mario.evaluate(() => Dati.io.uid);
    await admin(d => setDoc(doc(d, 'gestori/' + uidMa), { nome: 'Mario' }));
    await mario.reload();
    controlla('senza blocco schermo: parte aperta con l\'avviso', await aspetta(mario, () => Dati.io.gestore && L.puo === false && L.aperto
      && /non ha il blocco schermo/.test(document.querySelector('#toast').textContent)));
    await mario.evaluate(() => vai('impostazioni'));
    controlla('Impostazioni: «Spento: il telefono non ha il blocco schermo»', /Spento: il telefono non ha il blocco schermo/.test(await mario.textContent('#app')));
    await mario.click('[data-a="lucchetto-esci"]');
    await Promise.all([mario.waitForNavigation(), mario.click('[data-a="lucchetto-esci"]')]);
    await mario.waitForFunction(() => Dati.io.uid, null, { timeout: 20000 });
    controlla('Esci: telefono di nuovo cliente, senza la copia dei dati di Monica', await aspetta(mario, u => Dati.io.uid !== u && !Dati.io.gestore && P.ruolo === 'cliente'
      && !/Via di prova|Sara Mura/.test(localStorage.getItem('pit-copia-v1') || '') && !Lucchetto.di(u), uidMa));
  } catch (e) {
    no++; console.log('NO   la prova si è fermata →', e.message.split('\n')[0]);
  }
  controlla('nessun errore nelle pagine', errori.length === 0, errori.slice(0, 3));
  console.log(`\n${ok} OK, ${no} NO`);
  await browser.close(); await env.cleanup(); server.close();
  process.exit(no ? 1 : 0);
})();
