// Prova dell'app come un telefono vero: cliente ordina, Monica riceve e gestisce.
// Uso: node tools/prova.js   (foto in /tmp/pit/)
const { chromium, devices } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + path.resolve(__dirname, '../dist/anteprima.html');
const OUT = '/tmp/pit'; fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', e => errori.push('ERRORE: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errori.push('console: ' + m.text()); });
  const foto = async n => page.screenshot({ path: `${OUT}/${n}.png` });
  const clic = async (sel, opz) => { await page.locator(sel).first().click(opz); await page.waitForTimeout(250); };
  const passo = async (nome, fn) => { if (process.env.SOLO && !new RegExp(process.env.SOLO, 'i').test(nome)) return; try { await Promise.race([fn(), new Promise((_, no) => setTimeout(() => no(new Error('BLOCCATA oltre 120 s (la prova non deve mai restare appesa)')), 120000))]); console.log('OK  ', nome); } catch (e) { console.log('NO  ', nome, '→', e.message.split('\n').slice(0, 3).join(' | ')); } };

  await page.goto(FILE);
  await page.waitForTimeout(1300); await foto('01-apertura');
  await page.waitForTimeout(5200);
  await passo('vapore dopo l\'apertura anche per i clienti (C115)', async () => {
    await page.locator('.vapore').waitFor({ state: 'attached', timeout: 4000 });
    await page.locator('.vapore').waitFor({ state: 'detached', timeout: 6000 });
    if (await page.evaluate(() => document.getElementById('app').style.opacity) !== '') throw new Error('app rimasta nascosta dopo il vapore');
  });
  await passo('strisce di GZ senza numerini (C118, Astice alla Catalana): i numeri continuano dal passo prima', async () => {
    const f = n => `https://www.giallozafferano.it/images/ricette/1/123/foto_seq${n}.jpg`;
    const r = { passi: [{ t: 'a [[1]] b [[2]] c [[3]]', foto: [f(1)] }, { t: 'd [[4]] e [[5]] f [[6]]', foto: [f(2)] }, { t: 'g [[7]]', foto: [f(3)] }, { t: 'h [[12]]', foto: [f(4)] }] };
    const n = await page.evaluate(r => fotoRicetta(r).map(q => q.map(x => x.num + (x.n ? 's' : '')).join(',')).join('|'), r);
    if (n !== '1s,2s,3s|4s,5s,6s|7s,8s,9s|10s,11s,12s') throw new Error('numeri: ' + n);
    const nuova = await page.evaluate(() => fotoRicetta({ passi: [{ t: 'x [[1]] y [[2]]', foto: ['a_1.jpg', 'a_2.jpg'] }, { t: 'z', foto: ['a_3.jpg'] }] }).map(q => q.map(x => x.num + (x.n ? 's' : '')).join(',')).join('|'));
    if (nuova !== '1,2|3') throw new Error('ricetta nuova cambiata: ' + nuova);
  });
  await passo('benvenuto: nome e cognome alla prima apertura, poi «Ciao»', async () => {
    await page.locator('#benv-nome').waitFor(); await foto('00-benvenuto');
    if (await page.locator('.voce').count()) throw new Error('il menù si vede senza nome');
    await page.fill('#benv-nome', 'laura'); await clic('[data-a="benv-entra"]');
    if (!(await page.locator('#toast', { hasText: 'cognome' }).count())) throw new Error('senza cognome è entrato');
    await page.fill('#benv-cognome', 'sanna'); await page.press('#benv-cognome', 'Enter');
    await page.locator('.testata .titolo span', { hasText: 'Ciao Laura!' }).waitFor({ timeout: 3000 });
    const n = await page.evaluate(() => P.nomeProva + '/' + P.benvenuto);
    if (n !== 'Laura Sanna/true') throw new Error('nome salvato: ' + n);
  });
  await passo('menù visibile', async () => { await page.locator('.voce').first().waitFor(); await foto('02-menu'); });
  await passo('pronti subito visibili', async () => { if (await page.locator('.pronto-carta').count() !== 2) throw new Error('attesi 2 pronti'); });

  await passo('allergia frutta a guscio', async () => {
    await clic('[data-a="apri-allergie"]'); await clic('[data-a="allergia"][data-v="guscio"]');
    await clic('.foglio .piede [data-a="chiudi"]');
    if (!(await page.locator('.allergie-box', { hasText: 'frutta a guscio' }).count())) throw new Error('riquadro allergie non aggiornato');
    const rossi = await page.locator('.eti.rischio').count(); if (rossi < 2) throw new Error('etichette rosse: ' + rossi);
  });

  await passo('lasagne particolari: gusto noci, 2 teglie da 8, nota', async () => {
    await page.locator('.voce', { hasText: 'Lasagne particolari' }).click(); await page.waitForTimeout(300);
    await clic('[data-a="sel-var"][data-v="noci"]'); await clic('[data-a="sel-formato"][data-v="t8"]');
    await clic('[data-a="sel-qta"][data-d="1"]'); await clic('[data-a="sel-nota"]');
    await foto('03-piatto');
    const t = await page.locator('[data-a="aggiungi"]').innerText(); if (!t.includes('50,00')) throw new Error('prezzo: ' + t);
    await clic('[data-a="aggiungi"]');
  });
  await passo('polpette al kg: 1,5 kg', async () => {
    await page.locator('.voce', { hasText: 'Polpette di carne' }).click(); await page.waitForTimeout(300);
    await clic('[data-a="sel-qta"][data-d="1"]'); await clic('[data-a="sel-qta"][data-d="1"]');
    const t = await page.locator('[data-a="aggiungi"]').innerText(); if (!t.includes('22,50')) throw new Error('prezzo: ' + t);
    await clic('[data-a="aggiungi"]');
  });
  await passo('pronto subito: panade', async () => {
    await page.locator('.pronto-carta', { hasText: 'Panade' }).click(); await page.waitForTimeout(300);
    await clic('[data-a="aggiungi"]');
  });
  await passo('carrello: giorno, bonifico, invio', async () => {
    await clic('.testata [data-v="carrello"]'); await foto('04-carrello');
    await clic('.giorno:not([disabled])');
    if (await page.locator('[data-a="ordine-prova"]').count() !== 2) throw new Error('manca la scelta «Ordino davvero / Sto solo provando»');
    if (!(await page.locator('[data-a="invia"][disabled]').count())) throw new Error('«Invia» attivo senza la scelta davvero/prova');
    await clic('[data-a="ordine-prova"][data-v="1"]'); await clic('[data-a="ordine-prova"][data-v=""]');   // ci ripensa: ordine vero
    if (await page.locator('[data-a="ordine-prova"][data-v=""][aria-pressed="true"]').count() !== 1) throw new Error('la scelta «Ordino davvero» non resta');
    // (Mario 09/11) anche un cliente GIÀ accettato deve scegliere; con «Solo a chi non hai ancora accettato» o «Mai» no
    const q = await page.evaluate(() => {
      const prima = { attivo: Dati.attivo, utente: Dati.io.utente, scelta: S.impostazioni.chiediProva, prova: UI.prova };
      Dati.attivo = true; Dati.io.utente = { stato: 'approvato' }; UI.prova = undefined;
      const r = { base: opz('chiediProva'), tutti: puoProvare() && sceltaManca() };
      S.impostazioni.chiediProva = 'nuovi'; r.nuovi = puoProvare(); S.impostazioni.chiediProva = 'mai'; r.mai = puoProvare();
      Dati.attivo = prima.attivo; Dati.io.utente = prima.utente; S.impostazioni.chiediProva = prima.scelta; UI.prova = prima.prova;
      return r;
    });
    if (q.base !== 'tutti' || !q.tutti || q.nuovi || q.mai) throw new Error('scelta davvero/prova per i clienti accettati sbagliata: ' + JSON.stringify(q));
    await clic('[data-a="invia"]'); await page.waitForTimeout(500); await foto('05-inviato');
    if (!(await page.locator('.inviato').count())) throw new Error('niente conferma');
  });
  await passo('due ordini creati (pronti + da preparare)', async () => {
    await clic('[data-a="vai"][data-v="ordini"]');
    const n = await page.locator('.ordine-carta').count(), v = await page.locator('.ord-riga').count();
    if (n !== 2 || v !== 1) throw new Error(`ordini cliente: ${n} in corso, ${v} passati`);
    await foto('06b-miei-ordini'); await clic('.ord-riga'); await page.locator('.ord-aperto .ordine-carta').waitFor({ timeout: 3000 }); await clic('.ord-aperto [data-a="ord-apri"]');
  });

  await passo('Monica: notifica e guida', async () => {
    await clic('[data-a="ruolo"][data-v="monica"]'); await page.waitForTimeout(500); await foto('06-monica-notifica');
    await clic('[data-a="guida-avanti"]'); await clic('[data-a="guida-avanti"]'); await clic('[data-a="guida-avanti"]');
    await page.waitForTimeout(5000); await foto('07-monica-home');
  });
  await passo('Monica: accetta e propone', async () => {
    await clic('.riquadro.primo'); await foto('08-ordini');
    await page.locator('.ordine-carta', { hasText: 'Ordine n. 6' }).locator('[data-a="accetta"]').click(); await page.waitForTimeout(250);
    await page.locator('.ordine-carta', { hasText: 'Ordine n. 5' }).locator('[data-a="proponi"]').click(); await page.waitForTimeout(250); await clic('.foglio .giorno >> nth=3'); await clic('[data-a="conferma-giorno"]');
    await clic('[data-a="tab"][data-v="prossimi"]'); await foto('09-prossimi');
    await clic('[data-a="tab"][data-v="nuovi"]');   // cliente nuovo: «Sì, ma proponi un altro giorno» (Monica 07/11)
    if (!(await page.locator('.ordine-carta [data-a="richiesta-proponi"]').count())) throw new Error('manca la proposta per il cliente nuovo');
    await clic('[data-a="tab"][data-v="prossimi"]');
  });
  await passo('Monica: etichette per le vaschette', async () => {
    await clic('[data-a="etichette"]');
    await page.locator('.foglio img[alt^="Foglio 1"]').waitFor({ timeout: 5000 });
    const x = await page.evaluate(() => { const g = UI.foglio.giorno, ee = etichetteDi(g), c = disegnaEtichette(ee)[0];
      return { n: ee.length, fogli: UI.foglio.url.length, w: c.width, h: c.height, all: ee.some(e => e.all.length), giorni: UI.foglio.giorni.length }; });
    if (!x.n || x.fogli !== Math.ceil(x.n / 10) || x.w !== 1240 || x.h !== 1754 || !x.all) throw new Error('etichette: ' + JSON.stringify(x));
    const gr = await page.evaluate(() => { const ee = etichetteDi(UI.foglio.giorno), k = ee.map(e => [e.nome, e.variante, e.qta, e.note].join('|'));
      return { nome: ee.some(e => e.chi || e.pezzo), sparse: k.some((v, i) => k.indexOf(v) < i - 1 && k[i - 1] !== v), conti: UI.foglio.conti.reduce((t, c) => t + c[1], 0) === ee.length }; });
    if (gr.nome || gr.sparse || !gr.conti) throw new Error('etichette per prodotto: ' + JSON.stringify(gr));
    if (x.giorni > 1) { await clic('.foglio [data-a="eti-giorno"] >> nth=1'); await page.locator('.foglio [data-a="eti-giorno"][aria-pressed="true"] >> nth=0').waitFor(); }
    const sovr = await page.evaluate(() => { const L = 'Forno a 180 °C per 20-25 minuti, coperte con la stagnola, poi lasciare riposare.';
      disegnaEtichette([{ chi: 'Maria Giovanna Piras Sanna', nome: 'Parmigiana di melanzane alla sarda', variante: 'Con sugo', qta: '1 teglia da 8', note: 'Ben gratinata, poco sale, niente basilico', all: ['glutine', 'latte', 'uova', 'sedano', 'frutta a guscio', 'senape', 'soia'], scalda: L, pezzo: 'Vaschetta 2 di 4' },
        { chi: 'Gio', nome: 'Pane', variante: '', qta: '1 pezzo', note: '', all: [], scalda: '', pezzo: '' }, ...etichetteDi(UI.foglio.giorno)]);
      const err = []; ETI_SCATOLE.forEach((bb, i) => bb.forEach((a, k) => { if (a.x0 < a.X0 - 1 || a.x1 > a.X1 + 1 || a.y0 < a.Y0 - 1 || a.y1 > a.Y1 + 1) err.push(i + ' fuori: ' + a.n);
        bb.slice(k + 1).forEach(b => { if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) err.push(i + ': ' + a.n + ' / ' + b.n); }); })); return err; });
    if (sovr.length) throw new Error('etichette sovrapposte: ' + sovr.join('; '));
    await page.waitForTimeout(500); await foto('09b-etichette'); await clic('.foglio [data-a="chiudi"]');
  });
  await passo('cliente: accetta la proposta, paga, cambia ordine', async () => {
    await clic('[data-a="ruolo"][data-v="cliente"]'); await clic('.barra [data-v="ordini"]');
    await clic('[data-a="proposta-si"]'); await foto('10-cliente-ordini');
    
    await clic('[data-a="modifica"]'); await clic('[data-a="m-qta"][data-d="1"]'); await clic('[data-a="modifica-invia"]');
  });
  await passo('Monica: vede la modifica e la accetta', async () => {
    await clic('[data-a="ruolo"][data-v="monica"]'); await clic('.riquadro.primo');
    await foto('11-modifica'); await clic('[data-a="mod-si"]');
  });
  await passo('Monica: pronto e ritirato', async () => {
    await clic('[data-a="tab"][data-v="oggi"]'); await clic('[data-a="pronto-muto"]'); await foto('13-oggi'); await clic('[data-a="ritirato"]');
    await clic('[data-a="tab"][data-v="prossimi"]'); await page.locator('.ord-riga', { hasText: 'n. 2' }).click(); await page.waitForTimeout(250);
    await page.locator('.ord-aperto [data-a="pronto-muto"]').waitFor({ timeout: 3000 });
    if (!(await page.locator('.ord-aperto [data-a="proponi"]').count())) throw new Error('ordine già accettato: manca «proponi un altro giorno»');
    await page.locator('.ord-aperto [data-a="proponi"]').scrollIntoViewIfNeeded(); await foto('13b-accettato-proponi');
    await clic('.ord-aperto [data-a="ord-apri"]');
  });
  await passo('Monica: storico con cerca e filtri', async () => {
    await clic('[data-a="tab"][data-v="storico"]'); await foto('14-storico');
    const prima = await page.locator('.ord-riga:visible').count();
    await page.fill('.cerca-ord', 'zzzz'); await page.waitForTimeout(150);
    if (await page.locator('.ord-riga:visible').count() !== 0 || !(await page.locator('.ord-nessuno').isVisible())) throw new Error('la ricerca non nasconde le righe');
    await page.fill('.cerca-ord', ''); await page.waitForTimeout(150);
    if (await page.locator('.ord-riga:visible').count() !== prima || prima < 1) throw new Error('storico vuoto o ricerca che non torna indietro: ' + prima);
    await clic('[data-a="ord-filtro"][data-v="ritirato"]'); await clic('.ord-riga >> nth=0');
    await page.locator('.ord-aperto .ordine-carta').waitFor({ timeout: 3000 });
  });
  await passo('Monica: ordine di prova con due tocchi, fuori dallo storico, poi rimesso tra i veri (C35)', async () => {
    const n = (await page.locator('.ord-aperto .ordine-carta .tenue.piccolo').first().innerText()).match(/\d+/)[0];
    const fuori = async () => (await page.locator('.ord-riga').allInnerTexts()).filter(x => x.includes('n. ' + n)).length;
    const nelleProve = async () => (await page.locator('.ord-prove .ord-riga').allInnerTexts()).filter(x => x.includes('n. ' + n)).length;
    await clic('.ord-aperto [data-a="ord-prova"]');
    if (!(await page.locator('.conferma-prova').count())) throw new Error('manca il secondo tocco di conferma');
    await clic('.conferma-prova');
    await page.locator('.ord-prove summary', { hasText: 'Ordini di prova (1)' }).waitFor({ timeout: 3000 });
    if (!(await page.locator('.ord-aperto .bollino-prova').count())) throw new Error('manca la scritta PROVA sull\'ordine');
    if (await fuori() !== await nelleProve()) throw new Error('l\'ordine n. ' + n + ' di prova è ancora tra i veri');
    if (/undefined/.test(await page.locator('main').innerText())) throw new Error('«undefined» nella pagina');
    await page.locator('.ord-prove[open] .ord-aperto [data-a="ord-vero"]').scrollIntoViewIfNeeded(); await foto('14b-ordini-prova');
    await clic('.ord-prove [data-a="ord-vero"]');
    await page.waitForTimeout(300);
    if (await page.locator('.ord-prove').count()) throw new Error('la lista delle prove non si svuota');
    if (!(await page.locator('.ord-aperto .ordine-carta', { hasText: 'Ordine n. ' + n }).count() + await fuori())) throw new Error('rimesso tra i veri: non torna nello storico');
  });
  await passo('Monica: modifica piatto e ingredienti nuovi', async () => {
    await clic('.indietro'); await clic('.riquadro >> nth=1'); await foto('12-piatti');
    await page.locator('.piatto-riga', { hasText: 'Tiramisù' }).locator('.apri').click(); await page.waitForTimeout(300);
    if (await page.locator('details.sez[open]').count()) throw new Error('una voce del piatto è già aperta');
    await clic('details.sez[data-sez="ingredienti"] > summary');
    await page.fill('#ing-base', 'liquore marsala, granella di pistacchio'); await clic('[data-a="ing-aggiungi"][data-s="base"]');
    await foto('13-piatto-modifica');
    const t = await page.locator('main').innerText(); if (!/Frutta a guscio/.test(t) || !/Solfiti/.test(t)) throw new Error('allergeni nuovi non trovati');
    await clic('[data-a="controllato"]');
  });
  await passo('Monica: segna pronti, Natale acceso, pausa', async () => {
    await clic('.indietro'); await clic('.indietro'); await clic('[data-a="apri-pronti"]');
    await page.locator('.foglio .gruppo', { hasText: 'Tiramisù' }).locator('[data-a="pr-qta"][data-d="1"]').click(); await page.waitForTimeout(200);
    await clic('.foglio .piede [data-a="chiudi"]');
    await clic('.riquadro >> nth=3'); if (await page.locator('details.sez[open]').count()) throw new Error('voci delle impostazioni già aperte');
    await clic('details.sez[data-sez="imp-natale"] > summary'); await page.locator('[data-campo="i.natale.attivo"]').check(); await page.waitForTimeout(300);
    await foto('14-impostazioni');
  });
  await passo('sviluppatore: 7 tocchi sulla firma, versione e novità, guarda come cliente', async () => {
    if (await page.locator('.dev-scheda').count()) throw new Error('sezione sviluppatore visibile senza sbloccarla');
    for (let i = 0; i < 7; i++) await page.locator('footer.firma').click({ position: { x: 20, y: 10 } });
    await page.waitForTimeout(300);
    await page.locator('.dev-scheda').waitFor({ timeout: 3000 });
    const t = await page.locator('.dev-scheda').innerText(); if (!/Versione \d/.test(t) || !/Cronologia/.test(t)) throw new Error('mancano versione o novità');
    await page.locator('.dev-scheda').scrollIntoViewIfNeeded(); await foto('14c-sviluppatore');
    await clic('.mario-scheda [data-a="tutti-prova-apri"]'); await page.locator('.foglio .lista-prova li').first().waitFor({ timeout: 3000 });
    await foto('14d-tutti-prova');
    await clic('.foglio .piede [data-a="chiudi"]');
    if (!(await page.evaluate(() => S.ordini.some(o => !diProva(o))))) throw new Error('«No, lascia così» ha segnato gli ordini');
    await clic('.mario-scheda [data-a="tutti-prova-apri"]'); await clic('[data-a="tutti-prova-si"]');
    if (await page.evaluate(() => S.ordini.some(o => !diProva(o)))) throw new Error('restano ordini non di prova');
    await page.evaluate(() => { S.ordini.forEach(o => { o.prova = false; }); salva(); render(); });   // le prove dopo usano gli ordini veri
    // (C101) «Togli tutti gli ordini»: lista per cliente, «No» non tocca niente, «Sì» toglie e riparte da 1, «Annulla» li rimette
    const primaT = await page.evaluate(() => ({ n: S.ordini.length, p: S.prossimoNumero }));
    await clic('.mario-scheda [data-a="togli-ordini-apri"]'); await page.locator('.foglio .lista-togli li').first().waitFor({ timeout: 3000 });
    await foto('14e-togli-ordini');
    await clic('.foglio .piede [data-a="chiudi"]');
    if ((await page.evaluate(() => S.ordini.length)) !== primaT.n) throw new Error('«No, lascia così» ha tolto ordini');
    await clic('.mario-scheda [data-a="togli-ordini-apri"]'); await clic('[data-a="togli-ordini-si"]');
    const dopoT = await page.evaluate(() => ({ n: S.ordini.length, resto: S.ordini.every(o => o.stato === 'daApprovare'), p: S.prossimoNumero, clienti: S.clienti.length }));
    if (!dopoT.resto || dopoT.n >= primaT.n || !dopoT.clienti) throw new Error('togli ordini: ' + JSON.stringify(dopoT));
    if (dopoT.p !== (dopoT.n ? 0 : 1) && !(await page.evaluate(() => S.prossimoNumero === S.ordini.reduce((m, o) => Math.max(m, o.n || 0), 0) + 1))) throw new Error('numero non ripartito: ' + dopoT.p);
    await clic('#toast [data-a="annulla"]');
    const tornati = await page.evaluate(() => ({ n: S.ordini.length, p: S.prossimoNumero }));
    if (tornati.n !== primaT.n || tornati.p !== primaT.p) throw new Error('«Annulla» non rimette gli ordini: ' + JSON.stringify(tornati));
    // foto originali di Monica (Mario 08/11): il riquadro c'è; la coda sul telefono tiene la foto finché non parte
    if (!(await page.locator('.mario-scheda', { hasText: 'Foto originali di Monica' }).count())) throw new Error('manca «📷 Foto originali di Monica» nella scheda di Mario');
    const coda = await page.evaluate(async () => { await mandaOriginale(new File([new Uint8Array(5000)], 'x.jpg', { type: 'image/jpeg' }), 'Prova'); const d = await dbOriginali(); const n = await new Promise(ok => { const r = d.transaction('coda').objectStore('coda').count(); r.onsuccess = () => ok(r.result); }); await new Promise(ok => { const t = d.transaction('coda', 'readwrite'); t.objectStore('coda').clear(); t.oncomplete = ok; }); return n; });
    if (coda !== 1) throw new Error('la foto originale non resta in coda sul telefono: ' + coda);
    // velocità della voce (C70; Mario 09/11 «non salva… predefinita 0,75… se la cambia Monica solo per lei»): di base 0,75, il vecchio campo rotto non conta
    const vel0 = await page.evaluate(() => { localStorage.removeItem('pit-vel-voce'); S.impostazioni.velVoce = 1.2; delete S.impostazioni.voceVel; render(); return [velVoce(), document.querySelector('.mario-scheda .vel-cursore').value]; });
    if (vel0[0] !== 0.75 || vel0[1] !== '0.75') throw new Error('velocità di base non 0,75: ' + JSON.stringify(vel0));
    const cur = page.locator('.mario-scheda .vel-cursore'); if ((await cur.evaluate(el => getComputedStyle(el).appearance)) === 'none') throw new Error('il cursore ha ancora lo stile di un interruttore');
    await cur.evaluate(el => { el.value = '0.9'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
    await clic('.mario-scheda [data-a="vel-passo"][data-v="-1"]');
    const vel = await page.evaluate(() => [S.impostazioni.voceVel, velVoce(), document.querySelector('.mario-scheda .vel-cursore').value, document.querySelector('.mario-scheda .vel-voce-txt').textContent]);
    if (vel[0] !== 0.85 || vel[1] !== 0.85 || vel[2] !== '0.85' || !/lenta/.test(vel[3])) throw new Error('velocità di tutti non salvata o non rimasta dopo il ridisegno: ' + JSON.stringify(vel));
    // Monica: la sua, solo sul suo telefono; quella di base resta
    await page.evaluate(() => { UI.sez = 'imp-voce'; vai('impostazioni'); });
    await page.locator('details[data-sez="imp-voce"] .vel-cursore').evaluate(el => { el.value = '1.1'; el.dispatchEvent(new Event('change', { bubbles: true })); });
    const mia = await page.evaluate(() => [localStorage.getItem('pit-vel-voce'), velVoce(), S.impostazioni.voceVel, !!document.querySelector('details[data-sez="imp-voce"] [data-a="vel-base"]')]);
    if (mia[0] !== '1.1' || mia[1] !== 1.1 || mia[2] !== 0.85 || !mia[3]) throw new Error('velocità personale: ' + JSON.stringify(mia));
    await clic('details[data-sez="imp-voce"] [data-a="vel-base"]');
    if ((await page.evaluate(() => velVoce())) !== 0.85) throw new Error('«Rimetti quella di base» non torna a quella di Mario');
    await page.evaluate(() => { delete S.impostazioni.velVoce; delete S.impostazioni.voceVel; UI.sez = null; salva(); vai('impostazioni'); });
    await clic('.dev-scheda [data-a="dev-come"]'); await page.locator('.voce').first().waitFor({ timeout: 3000 });
    await clic('[data-a="ruolo"][data-v="monica"]'); await page.waitForTimeout(300);
  });
  await passo('ordini di prova: archivia con due tocchi, poi ripristina (Mario 07/11)', async () => {
    await page.evaluate(() => { P.ruolo = 'monica'; S.ordini.slice(0, 2).forEach(o => { o.prova = true; }); salva(); vai('ordini'); });
    await page.waitForTimeout(300); await clic('[data-a="tab"][data-v="storico"]'); await page.locator('.ord-prove summary').click({ timeout: 4000 });
    await clic('[data-a="arch-prova"][data-id="tutte"]');
    if (await page.evaluate(() => S.ordini.some(o => o.archiviato))) throw new Error('archiviate con un tocco solo');
    await clic('[data-a="arch-prova"][data-id="tutte"]'); await page.waitForTimeout(300);
    const r = await page.evaluate(() => { const g = gruppiOrdini(); return [S.ordini.filter(o => o.archiviato).length, [...g.nuovi, ...g.oggi, ...g.prossimi, ...g.storico, ...g.prove].some(o => o.archiviato)].join('/'); });
    if (r !== '2/false') throw new Error('archivio: ' + r);
    await foto('14e-archivio-prove');
    await page.evaluate(() => { S.ordini.forEach(o => { o.prova = false; o.archiviato = false; }); salva(); vai('home'); });   // le prove dopo usano gli ordini veri
  });
  await passo('cliente: menù di Natale e tiramisù pronto', async () => {
    await clic('[data-a="ruolo"][data-v="cliente"]'); await page.waitForTimeout(300); await foto('15-menu-natale');
    if (!(await page.locator('.natale').count())) throw new Error('natale assente');
    if (!(await page.locator('.pronto-carta', { hasText: 'Tiramisù' }).count())) throw new Error('tiramisù pronto assente');
  });
  await passo('ritiro: link Maps', async () => {
    await clic('.barra [data-v="ordini"]'); await page.locator('.ritiro-scheda').scrollIntoViewIfNeeded(); await foto('16-ritiro');
    const h = await page.locator('a', { hasText: 'Apri in Maps' }).getAttribute('href'); if (!h.includes('Via%20Libano%2053')) throw new Error(h);
  });
  await passo('annulla dopo un cambio', async () => {
    await clic('[data-a="ruolo"][data-v="monica"]'); await clic('.riquadro >> nth=1');
    await page.locator('.piatto-riga', { hasText: 'Papassini' }).locator('input').uncheck(); await page.waitForTimeout(200);
    await clic('[data-a="annulla"]');
    if (!(await page.locator('.piatto-riga', { hasText: 'Papassini' }).locator('input').isChecked())) throw new Error('annulla non ha funzionato');
  });
  await passo('Monica: clienti nuovi e telefono nuovo', async () => {
    await clic('.indietro'); await clic('.riquadro >> nth=2'); await foto('17-clienti');
    if (!(await page.locator('main', { hasText: 'Telefono nuovo' }).count())) throw new Error('manca «Telefono nuovo»');
    await clic('[data-a="richiesta-no"][data-id="r1"]');   // un No sbagliato...
    if (!(await page.locator('[data-a="rifiutati-apri"]', { hasText: 'Persone rifiutate (1)' }).count())) throw new Error('manca «Persone rifiutate (1)»');
    await clic('[data-a="rifiutati-apri"]'); await foto('18-rifiutati');
    await clic('[data-a="rifiutato-si"][data-id="r1"]');   // ...si corregge con «Accetta»
    if (await page.locator('[data-a="rifiutati-apri"]').count()) throw new Error('la lista dei rifiutati non si è svuotata');
    const o = await page.evaluate(() => { const x = S.ordini.find(y => y.id === 'o4'); return x.stato + '/' + !!x.cliente; });
    if (o !== 'nuovo/true') throw new Error('primo ordine di Laura: ' + o);
    await clic('[data-a="richiesta-si"][data-id="r2"]');
    const r = await page.evaluate(() => S.richieste.length + '/' + S.clienti.filter(c => c.nome === 'Paolo Sanna').length);
    if (r !== '0/1') throw new Error('ricollega: ' + r);
  });
  await passo('Monica: cliente nuovo col giorno che non va → sì e proposta', async () => {
    await page.evaluate(() => { const o = JSON.parse(JSON.stringify(S.ordini.find(y => y.id === 'o4')));
      Object.assign(o, { id: 'o9', n: 99, stato: 'daApprovare', cliente: null, pronto: false, proposta: null });
      S.ordini.push(o); S.richieste.push({ id: 'r9', nome: 'Anna Prova', primo: 'o9' }); render(); });
    await clic('.indietro'); await clic('.riquadro.primo'); await clic('[data-a="tab"][data-v="nuovi"]');
    await page.locator('.ordine-carta [data-a="richiesta-proponi"][data-id="r9"]').scrollIntoViewIfNeeded(); await foto('17b-nuovo-proponi');
    await clic('.ordine-carta [data-a="richiesta-proponi"][data-id="r9"]'); await page.waitForTimeout(400); await foto('17c-scegli-giorno');
    await clic('.foglio .giorno >> nth=2'); await clic('[data-a="conferma-giorno"]');
    const o = await page.evaluate(() => { const x = S.ordini.find(y => y.id === 'o9'); return x.stato + '/' + !!x.cliente + '/' + !!x.proposta; });
    if (o !== 'proposta/true/true') throw new Error('cliente nuovo con proposta: ' + o);
  });
  await passo('Monica: riquadro delle persone nuove e tocco sulla notifica (C27, C33)', async () => {
    await page.evaluate(() => { S.richieste.push({ id: 'r8', nome: 'Gina Prova', tramite: 'Laura' }); UI.provaRichieste = true; render(); });
    await page.locator('.foglio', { hasText: 'Gina Prova' }).waitFor({ timeout: 3000 }); await foto('17d-richieste');
    await clic('.foglio [data-a="richiesta-si"][data-id="r8"]'); await page.waitForTimeout(300);
    if (await page.locator('.foglio', { hasText: 'Gina Prova' }).count()) throw new Error('il riquadro non si chiude dopo il sì');
    await page.evaluate(() => { UI.provaRichieste = false; UI.vaiDopo = 'ordine'; vaiDaNotifica(); render(); });
    await page.locator('.notifica', { hasText: 'Ordine nuovo' }).waitFor({ timeout: 3000 }); await foto('17e-da-notifica');
    if (await page.evaluate(() => UI.vista) !== 'ordini') throw new Error('il tocco sulla notifica non apre gli ordini');
    await clic('[data-a="tab"][data-v="oggi"]');
    if (await page.locator('.notifica').count()) throw new Error('il riquadro della notifica non sparisce al tocco');
  });
  await passo('Monica: incassi del mese nella Home', async () => {
    await clic('.indietro');
    const atteso = await page.evaluate(() => { const c = contiMese(oggi().slice(0, 7)); return euro(c.presi + c.daPrendere); });
    if (!(await page.locator('.incassi summary', { hasText: atteso }).count())) throw new Error('totale incassi: atteso ' + atteso + ', c\'è ' + await page.locator('.incassi summary').innerText());
    await page.locator('.incassi summary').click(); await foto('22-incassi'); await page.locator('.incassi summary').click();
  });
  await passo('Monica: lista della spesa dagli ordini', async () => {
    await clic('[data-a="vai"][data-v="spesa"]'); await clic('[data-a="sp-tab"][data-v="ordini"]'); await foto('19-spesa');
    const riga = n => page.locator('.spesa-riga', { hasText: n });
    // tiramisù da 6: 6 × 85 g di mascarpone = 510 g → 3 confezioni da 250 g; lasagne da 8: 8 × 80 g di macinato = 640 g → 2 da 500 g
    if (!(await riga('Mascarpone').locator('.quanto', { hasText: '3 × 250 g' }).count())) throw new Error('mascarpone: ' + await riga('Mascarpone').innerText());
    if (!(await riga('Carne macinata').locator('.quanto', { hasText: '2 × 500 g' }).count())) throw new Error('macinato: ' + await riga('Carne macinata').innerText());
    await page.locator('[data-campo="sp.anche"]').check(); await page.waitForTimeout(250);   // + polpette di carne 1,5 kg (ordine da accettare)
    if (!(await riga('Carne macinata').locator('.quanto', { hasText: '4 × 500 g' }).count())) throw new Error('con gli ordini da accettare: ' + await riga('Carne macinata').innerText());
    await clic('[data-a="sp-ing"][data-ing="mascarpone"]'); await clic('.foglio [data-a="sp-casa"][data-d="1"]'); await clic('.foglio .piede [data-a="chiudi"]');
    if (!(await riga('Mascarpone').locator('.quanto', { hasText: '2 × 250 g' }).count())) throw new Error('in casa non tolto: ' + await riga('Mascarpone').innerText());
    await clic('[data-a="sp-preso"][data-ing="mascarpone"]');
    if (!(await page.locator('.spesa-riga.presa', { hasText: 'Mascarpone' }).count())) throw new Error('spunta non messa');
    const w = await page.locator('a', { hasText: 'Manda tutta la spesa su WhatsApp' }).getAttribute('href');
    if (decodeURIComponent(w).includes('Mascarpone') || !decodeURIComponent(w).includes('Carne macinata: 4 × 500 g')) throw new Error('testo WhatsApp (il preso non va, il resto sì): ' + decodeURIComponent(w).slice(0, 160));
    await foto('20-spesa-presa');
    await clic('[data-a="sp-fatta"]');   // «Ho fatto la spesa»: 250 g in casa + 2 confezioni prese = 750 g
    const dopo = await page.evaluate(() => casaDi('mascarpone') + '/' + Object.keys(SPESA.presi).length);
    if (dopo !== '750/0') throw new Error('dopo la spesa (in casa/spunte): ' + dopo);
    if (await riga('Mascarpone').count()) throw new Error('il mascarpone è ancora da comprare');
    const usato = await page.evaluate(() => { const o = S.ordini.find(x => x.stato === 'accettato' && x.righe.some(r => r.piatto === 'tiramisu' && !r.pronto)); o.stato = 'pronto'; const q = casaDi('mascarpone'); o.stato = 'accettato'; return q + '/' + casaDi('mascarpone'); });
    if (usato !== '240/750') throw new Error('consumo col «pronto» e poi annullato: ' + usato);
    await page.locator('[data-campo="sp.anche"]').uncheck();
    await clic('[data-a="sp-giorni"][data-v="-1"]');   // «Tutti gli ordini» (Mario 05/11)
    if (!(await page.locator('main p', { hasText: 'tutti quelli che hai' }).count())) throw new Error('«Tutti gli ordini» non scelto');
    await clic('[data-a="sp-giorni"][data-v="2"]');
  });
  await passo('Monica: la mia lista della spesa', async () => {
    await clic('[data-a="sp-tab"][data-v="mia"]');
    const campo = page.locator('#ing-spesa-nuova');
    await campo.fill('2 kg patate'); await campo.press('Enter');
    await page.waitForTimeout(200);
    if ((await page.evaluate(() => document.activeElement && document.activeElement.id)) !== 'ing-spesa-nuova') throw new Error('il campo ha perso la tastiera');
    await page.locator('#ing-spesa-nuova').fill('detersivo piatti'); await clic('[data-a="sp-agg"]');
    await page.locator('#ing-spesa-nuova').fill('macin');
    if (!(await page.locator('#sug-spesa button', { hasText: 'Carne macinata' }).count())) throw new Error('nessun suggerimento per «macin»');
    await clic('#sug-spesa button >> text=Carne macinata');
    const mia = await page.evaluate(() => SPESA.mia.map(v => `${v.n}|${v.q}|${v.rep}`).join(' / '));
    if (mia !== 'Patate|2 kg|Frutta e verdura / Detersivo piatti||Casa e pulizia / Carne macinata||Carne, pesce e salumi') throw new Error('voci: ' + mia);
    if (!(await page.locator('.spesa-riga', { hasText: 'Carne macinata' }).locator('small', { hasText: 'Anche per gli ordini: 2 × 500 g' }).count())) throw new Error('manca «Anche per gli ordini»');
    await page.locator('#ing-spesa-nuova').fill('patate 3 kg'); await campo.press('Enter');   // niente doppioni: cambia la quantità
    const pat = await page.evaluate(() => SPESA.mia.filter(v => v.n === 'Patate').map(v => v.q).join());
    if (pat !== '3 kg') throw new Error('doppione patate: ' + pat);
    await clic('[data-a="sp-mpreso"] >> nth=0'); await foto('21-mia-lista');
    await clic('[data-a="sp-msvuota"]');
    if (await page.locator('[data-a="sp-mpreso"]').count()) throw new Error('lista non svuotata');
    await clic('#toast [data-a="annulla"]');
    if (await page.locator('[data-a="sp-mpreso"]').count() !== 3) throw new Error('Annulla non ha rimesso le 3 voci');
    if (!(await page.locator('.suggerimenti [data-a="sp-sug"]', { hasText: 'Latte' }).count())) throw new Error('manca «Compri spesso»');
    await clic('[data-a="sp-voce"] >> nth=0'); await clic('.foglio [data-a="sp-vrep"][data-v="Dispensa"]'); await clic('.foglio .piede [data-a="chiudi"]');
  });
  await passo('Monica: immagine del menù da mandare', async () => {
    await clic('.indietro'); await clic('.riquadro >> nth=1'); await clic('[data-a="menu-immagine"]');
    await page.locator('.foglio img[alt^="Menù"]').waitFor({ timeout: 5000 });
    const alta = await page.evaluate(() => { const c = disegnaMenu(); return c.width + 'x' + (c.height > 1000); });
    if (alta !== '1080xtrue') throw new Error('immagine: ' + alta);
    await foto('23-menu-immagine'); await clic('.foglio [data-a="chiudi"]');
  });
  await passo('Monica: dosi nella scheda del piatto', async () => {
    await page.evaluate(() => { P.ruolo = 'monica'; UI.foglio = null; UI.vista = 'piatto:tiramisu'; render(); });   // autonoma
    await clic('details.sez[data-sez="dosi"] > summary');
    if (await page.locator('details.sez[open]').count() !== 1) throw new Error('aperte più voci insieme');
    const q = page.locator('[data-campo="d.q"][data-ing="mascarpone"]'); await q.scrollIntoViewIfNeeded();
    if (await q.inputValue() !== '510') throw new Error('dose mascarpone per la teglia da 6 (85 × 6): ' + await q.inputValue());
    if (!(await page.locator('.formato-riga', { hasText: 'teglia da 8: 680 g' }).count())) throw new Error('manca la teglia da 8 calcolata');
    // costo: mascarpone 2,50 € per 250 g → 85 g = 0,85 € a porzione → teglia da 6 = 5,10 € (gli altri senza prezzo)
    // senza prezzi: un tasto per ingrediente apre il foglio del prezzo QUI (Mario 08/11 «la matita dov'è?»)
    await page.evaluate(() => { window._prezzoM = SPESA.ing.mascarpone; SPESA.ing.mascarpone = Object.assign({}, SPESA.ing.mascarpone, { prezzo: 0 }); render(); });
    await clic('[data-a="sp-ing"][data-ing="mascarpone"]');
    if (!(await page.locator('.foglio [data-campo="sp.prezzo"][data-ing="mascarpone"]').count())) throw new Error('il tasto dell\'ingrediente non apre il prezzo');
    await clic('.foglio [data-a="chiudi"]');
    await page.evaluate(() => { SPESA.ing.mascarpone = window._prezzoM; render(); });
    await page.evaluate(() => { SPESA.ing.mascarpone = Object.assign({}, SPESA.ing.mascarpone, { prezzo: 2.5 }); render(); });
    if (!(await page.locator('.fila', { hasText: 'ti costa 5,10' }).count())) throw new Error('costo del tiramisù: ' + await page.locator('.scheda', { hasText: 'Quanto ti costa' }).innerText());
    await q.fill('600'); await q.dispatchEvent('change'); await foto('21-dosi');
    if (await page.evaluate(() => SPESA.dosi.tiramisu.mascarpone) !== 100) throw new Error('dose non salvata (600 per la teglia da 6 = 100 a porzione)');
    if (!(await page.locator('.formato-riga', { hasText: 'teglia da 8: 800 g' }).count())) throw new Error('teglia da 8 non ricalcolata');
    await page.evaluate(() => { UI.vista = 'piatti'; render(); });   // resta in «I miei piatti»: la prova dopo parte da una schermata interna
  });
  await passo('foto del menù: Monica ne carica 2 e le può mandare, i clienti per ora no', async () => {
    await clic('[data-a="ruolo"][data-v="monica"]'); await page.waitForTimeout(300);
    while (await page.locator('.indietro').count()) { await clic('.indietro'); await page.waitForTimeout(150); }
    await clic('.riquadro >> nth=1');
    // «Sistema la foto» (Mario 08/11 «un editor di ritaglio… molto plug and play»): si apre prima di salvare; quadrata + ruota + trascina → foto quadrata
    await page.setInputFiles('#file-menu-0', 'media/anteprima-link-1.jpg');
    await page.locator('#rit-tela').waitFor({ timeout: 5000 });
    if (await page.locator('[data-a="rit-forma"][data-v="intera"]').getAttribute('aria-pressed') !== 'true') throw new Error('per le foto del menù la forma di base deve essere «Intera»');
    await clic('[data-a="rit-forma"][data-v="11"]'); await clic('[data-a="rit-ruota"]');
    const tela = await page.locator('#rit-tela').boundingBox();
    const prima = await page.evaluate(() => UI.rit.cx + ',' + UI.rit.cy);
    await page.mouse.move(tela.x + tela.width / 2, tela.y + tela.height / 2); await page.mouse.down(); await page.mouse.move(tela.x + tela.width / 2 + 40, tela.y + tela.height / 2 + 30, { steps: 4 }); await page.mouse.up();
    await page.locator('[data-rit="luce"]').fill('1.3');
    if (await page.evaluate(() => UI.rit.luce) !== 1.3) throw new Error('la luce non cambia');
    if (await page.evaluate(() => UI.rit.cx + ',' + UI.rit.cy) === prima && await page.evaluate(() => UI.rit.base.width !== UI.rit.base.height)) throw new Error('trascinare non sposta la foto');
    await foto('22a-sistema-la-foto');
    await clic('[data-a="rit-ok"]'); await page.locator('.menu-foto-edit img').first().waitFor({ timeout: 5000 });
    const lati = await page.evaluate(() => new Promise(ok => { const i = new Image(); i.onload = () => ok([i.width, i.height]); i.src = S.menuFoto[0]; }));
    if (lati[0] !== lati[1]) throw new Error('la foto ritagliata «Quadrata» non è quadrata: ' + lati);
    // Annulla: chiude senza salvare niente
    await page.setInputFiles('#file-menu-1', 'media/icon-512.png'); await page.locator('#rit-tela').waitFor({ timeout: 5000 });
    await clic('.foglio [data-a="chiudi"]'); await page.waitForTimeout(400);
    if (await page.locator('.menu-foto-edit img').count() !== 1) throw new Error('«Annulla» ha salvato la foto lo stesso');
    await page.setInputFiles('#file-menu-1', 'media/icon-512.png'); await page.locator('#rit-tela').waitFor({ timeout: 5000 });
    await clic('[data-a="rit-ok"]'); await page.waitForTimeout(800);
    if (!(await page.locator('[data-a="menu-foto-manda"]').count())) throw new Error('manca «Manda le foto»');
    if (await page.locator('.menu-foto-edit img').count() !== 2) throw new Error('foto del menù: ' + await page.locator('.menu-foto-edit img').count());
    await page.locator('.menu-foto-edit').scrollIntoViewIfNeeded(); await foto('22-foto-menu-monica');
    await clic('[data-a="ruolo"][data-v="cliente"]'); await page.waitForTimeout(300);
    if (await page.locator('.barra [data-v="menu"]').count()) await clic('.barra [data-v="menu"]');
    await page.waitForTimeout(400);
    if (await page.locator('.carosello img').count() !== 0) throw new Error('le foto del menù non devono ancora vedersi ai clienti');
    await clic('[data-a="ruolo"][data-v="monica"]'); await page.waitForTimeout(300);
    while (await page.locator('.indietro').count()) { await clic('.indietro'); await page.waitForTimeout(150); }
    await clic('.riquadro >> nth=1'); await clic('[data-a="menu-foto-togli"][data-i="1"]');
    if (await page.locator('.menu-foto-edit img').count() !== 1) throw new Error('togli non va');
  });
  await passo('testo grande', async () => {
    await clic('.indietro'); await clic('.riquadro >> nth=3'); await clic('details.sez[data-sez="imp-vista"] > summary'); await page.locator('[data-campo="p.grande"]').check(); await page.waitForTimeout(200);
    if (!(await page.evaluate(() => document.documentElement.classList.contains('grande')))) throw new Error('niente classe');
    await page.locator('[data-campo="p.grande"]').uncheck();
  });
  await passo('cliente semplice: 2 voci in basso, «Aa», una sola nota, pagamento in una riga', async () => {
    await clic('[data-a="ruolo"][data-v="cliente"]'); await clic('.barra [data-v="menu"]');
    const voci = await page.locator('.barra button').count(); if (voci !== 2) throw new Error('voci in basso: ' + voci);
    await clic('.testata [data-a="testo-grande"]');
    if (!(await page.evaluate(() => document.documentElement.classList.contains('grande')))) throw new Error('«Aa» non ingrandisce');
    await clic('.testata [data-a="testo-grande"]');
    await page.locator('.voce').first().click(); await page.waitForTimeout(300);
    if (await page.locator('#nota-piatto').count()) throw new Error('nota nel piatto ancora presente');
    await clic('[data-a="aggiungi"]'); await clic('.testata [data-v="carrello"]');
    if (!(await page.locator('.paga-riga').count())) throw new Error('pagamento non in una riga');
    if ((await page.locator('textarea').count()) !== 1) throw new Error('caselle di testo nel carrello: ' + await page.locator('textarea').count());
  });
  await passo('cliente: «Fritto da Monica» col sovrapprezzo del piatto (C30)', async () => {
    const r = await page.evaluate(() => {
      const p = S.piatti.find(x => x.formati.some(f => f.tipo === 'pz')) || S.piatti[0]; p.fritto = 1.5;
      P.ruolo = 'cliente'; UI.vista = 'menu'; P.carrello = []; apriPiatto(p.id); render();
      return { id: p.id, prezzo: prezzoDi(p, UI.sel.formato, UI.sel.variante), qta: UI.sel.qta, kg: p.formati[0].tipo === 'kg' };
    });
    await clic('.foglio [data-a="sel-fritto"][data-v="si"]'); await foto('31-fritto');
    await clic('.foglio [data-a="aggiungi"]'); await page.waitForTimeout(500);
    const t = await page.evaluate(() => totale(P.carrello) + '/' + P.carrello[0].fritto);
    const atteso = Math.round((r.prezzo * r.qta + 1.5) * 100) / 100 + '/true';   // fritto: una cifra sola per il piatto
    if (t !== atteso) throw new Error('totale col fritto: ' + t + ', atteso ' + atteso);
  });
  await passo('cliente: «Al forno da Monica», una cottura sola (Mario 07/11)', async () => {
    const r = await page.evaluate(() => {
      const p = S.piatti.find(x => x.formati.some(f => f.tipo === 'pz')) || S.piatti[0]; p.fritto = 1.5; p.forno = 2;
      P.carrello = []; apriPiatto(p.id); render();
      return { prezzo: prezzoDi(p, UI.sel.formato, UI.sel.variante), qta: UI.sel.qta };
    });
    await clic('.foglio [data-a="sel-fritto"][data-v="si"]'); await clic('.foglio [data-a="sel-fritto"][data-v="forno"]'); await foto('31b-forno');
    if (!(await page.locator('.foglio [data-a="aggiungi"]').innerText()).includes(String(Math.round((r.prezzo * r.qta + 2) * 100) / 100).replace('.', ','))) throw new Error('pulsante Aggiungi senza il forno');
    if (await page.locator('.foglio [data-a="sel-fritto"][aria-pressed="true"]').count() !== 1) throw new Error('più cotture scelte insieme');
    await clic('.foglio [data-a="aggiungi"]'); await page.waitForTimeout(500);
    const t = await page.evaluate(() => totale(P.carrello) + '/' + P.carrello[0].forno + '/' + P.carrello[0].fritto + '/' + descRiga(P.carrello[0]).includes('al forno'));
    const atteso = Math.round((r.prezzo * r.qta + 2) * 100) / 100 + '/true/false/true';
    if (t !== atteso) throw new Error('totale al forno: ' + t + ', atteso ' + atteso);
  });
  await passo('cliente: «Sono qui sotto» sull\'ordine pronto, non su quelli passati (Mario 07/11)', async () => {
    const id = await page.evaluate(() => {
      const o = S.ordini.find(x => x.cliente === P.cliente && x.stato === 'accettato') || S.ordini.find(x => x.stato === 'accettato');
      P.cliente = o.cliente; o.stato = 'pronto'; UI.vista = 'ordini'; UI.ordAperto = null; render(); return o.id;
    });
    await page.waitForTimeout(300);
    if (await page.locator(`[data-a="sono-qui"][data-id="${id}"]`).count() !== 1) throw new Error('manca «Sono qui» sull\'ordine pronto');
    await page.locator(`[data-a="sono-qui"][data-id="${id}"]`).scrollIntoViewIfNeeded(); await foto('32-sono-qui');
    await clic(`[data-a="sono-qui"][data-id="${id}"]`); await page.waitForTimeout(300);
    if (!(await page.locator('.toast, .avviso-toast, [role="status"]').allInnerTexts()).join(' ').includes('anteprima')) throw new Error('nell\'anteprima «Sono qui» non spiega che parte solo dall\'app vera');
    const passati = await page.evaluate(() => S.ordini.filter(x => x.cliente === P.cliente && ['ritirato', 'rifiutato', 'annullato'].includes(x.stato)).map(x => x.id));
    for (const p of passati) if (await page.locator(`[data-a="sono-qui"][data-id="${p}"]`).count()) throw new Error('«Sono qui» su un ordine passato');
    await page.evaluate(id => { S.ordini.find(x => x.id === id).stato = 'accettato'; }, id);
  });
  await passo('Monica: aiutante con AI, chiede sempre «Faccio?» e controlla sui dati (C48)', async () => {
    await page.evaluate(() => { P.ruolo = 'monica'; UI.vista = 'home'; UI.foglio = null; render(); });
    await page.waitForTimeout(300);
    if (!(await page.locator('.ai-barra .ai-apri').count())) throw new Error('manca «Chiedi all\'aiutante» nella Home');
    await clic('.ai-apri'); await page.locator('.ai-intro').waitFor({ timeout: 2000 });
    const dati = await page.evaluate(() => JSON.stringify(datiAI()).length);
    if (dati > 60000) throw new Error('dati per l\'AI troppo grandi: ' + dati);
    await clic('[data-a="ai-chiedi"]'); await page.waitForTimeout(400);
    if (!(await page.locator('.ai-fum.lei', { hasText: 'anteprima' }).count())) throw new Error('nell\'anteprima non spiega che risponde solo nell\'app vera');
    const finta = r => page.evaluate(r => { window.chiediAiutante = async () => r; }, r);
    const scrivi = async t => { await page.fill('#ai-testo', t); await page.press('#ai-testo', 'Enter'); await page.waitForTimeout(400); };
    const o = await page.evaluate(() => { const o = S.ordini.find(x => x.stato === 'accettato' && !x.archiviato); return { id: o.id, n: o.n }; });
    await finta({ azione: 'pronto', n: o.n }); await scrivi('l\'ordine è pronto');
    if (!(await page.locator('.ai-fum.lei', { hasText: `Ordine n. ${o.n} di` }).filter({ hasText: 'pronto' }).count())) throw new Error('niente proposta «pronto»');
    if (await page.evaluate(id => S.ordini.find(x => x.id === id).stato, o.id) !== 'accettato') throw new Error('ha cambiato prima del «Sì»');
    await foto('33-aiutante');
    await clic('[data-a="ai-si"]');
    if (await page.evaluate(id => S.ordini.find(x => x.id === id).stato, o.id) !== 'pronto') throw new Error('«Sì, fallo» non ha segnato pronto');
    if (!(await page.locator('.ai-esito', { hasText: 'Fatto' }).count())) throw new Error('manca «✓ Fatto»');
    await finta({ azione: 'pronto', n: o.n }); await scrivi('è pronto?');
    if (await page.locator('[data-a="ai-si"]').count()) throw new Error('propone di nuovo un ordine già pronto');
    await page.evaluate(id => { S.ordini.find(x => x.id === id).stato = 'accettato'; render(); }, o.id);
    await finta({ azione: 'ritirato', n: o.n }); await scrivi('l\'ha ritirato');
    await page.evaluate(id => { S.ordini.find(x => x.id === id).stato = 'rifiutato'; }, o.id);   // intanto l'altra persona lo cambia
    await clic('[data-a="ai-si"]');
    if (await page.evaluate(id => S.ordini.find(x => x.id === id).stato, o.id) !== 'rifiutato') throw new Error('al «Sì» non ricontrolla i dati di adesso');
    await page.evaluate(id => { S.ordini.find(x => x.id === id).stato = 'accettato'; render(); }, o.id);
    await finta({ azione: 'soldi', n: 99999 }); await scrivi('ha pagato');
    if (!(await page.locator('.ai-fum.lei', { hasText: 'Non trovo l\'ordine n. 99999' }).count()) || await page.locator('[data-a="ai-si"]').count()) throw new Error('ordine inventato non scartato');
    const p = await page.evaluate(() => visibili().find(x => x.disponibile).id);
    await finta({ azione: 'disponibile', id: p, si: false }); await scrivi('togli');
    await clic('[data-a="ai-no"]');
    if (!(await page.evaluate(id => piatto(id).disponibile, p))) throw new Error('«No» ha tolto il piatto');
    await finta({ azione: 'spesa', voci: ['2 kg farina di semola'] }); await scrivi('farina alla spesa');
    await clic('[data-a="ai-si"]');
    if (!(await page.evaluate(() => SPESA.mia.some(v => /semola/i.test(v.n))))) throw new Error('la farina non è nella spesa');
    await page.evaluate(() => { SPESA.mia = SPESA.mia.filter(v => !/semola/i.test(v.n)); salvaSpesa(); });
    await foto('34-aiutante-fine');
    /* piano di più azioni: anteprima prima → dopo, Monica corregge un prezzo e ne toglie una, poi un solo Annulla */
    const pp = await page.evaluate(() => { const v = visibili().filter(x => x.disponibile); const f = v[0].formati[0]; return { a: v[0].id, f: f.id, prima: f.prezzo, b: v[1].id }; });
    const fino = await page.evaluate(() => iso(new Date(Date.now() + 3 * 864e5)));
    await finta({ testo: 'Ecco cosa farei:', azioni: [{ azione: 'prezzo', id: pp.a, formato: pp.f, prezzo: 99 }, { azione: 'disponibile', id: pp.b, si: false },
      { azione: 'pausa', fino }, { azione: 'nuovo_piatto', nome: 'Seadas', cat: 'dolci', modo: 'pz', prezzi: { pz: 3.5 } }, { azione: 'inventata' }] });
    await scrivi('fai tutto');
    if (await page.locator('.ai-fum.lei').last().locator('.ai-azione').count() !== 4) throw new Error('il piano non mostra 4 righe');
    if (!(await page.locator('.ai-fum.lei').last().locator('.ai-prima').first().count())) throw new Error('manca il «prima»');
    await page.locator('.ai-fum.lei').last().locator('[data-aif$="|prezzo"]').fill('15'); await page.waitForTimeout(900);
    await page.locator('.ai-fum.lei').last().locator('[data-aion$="|1"]').uncheck(); await page.waitForTimeout(300);
    await foto('35-aiutante-piano');
    if (!(await page.locator('[data-a="ai-si"]', { hasText: 'Conferma tutte e 3' }).count())) throw new Error('il pulsante non conta 3 azioni');
    await clic('[data-a="ai-si"]');
    const dopo = await page.evaluate(([pp]) => ({ prezzo: piatto(pp.a).formati.find(f => f.id === pp.f).prezzo, disp: piatto(pp.b).disponibile, pausa: S.impostazioni.pausa.attiva,
      nuovo: (S.piatti.find(x => x.nome === 'Seadas') || {}).controllato }), [pp]);
    if (dopo.prezzo !== 15 || !dopo.disp || !dopo.pausa || dopo.nuovo !== false) throw new Error('piano fatto male: ' + JSON.stringify(dopo));
    await clic('#toast [data-a="annulla"]');
    const annullato = await page.evaluate(([pp]) => ({ prezzo: piatto(pp.a).formati.find(f => f.id === pp.f).prezzo, pausa: S.impostazioni.pausa.attiva, nuovo: S.piatti.some(x => x.nome === 'Seadas') }), [pp]);
    if (annullato.prezzo !== pp.prima || annullato.pausa || annullato.nuovo) throw new Error('Annulla non rimette tutto: ' + JSON.stringify(annullato));
    const prima = await page.evaluate(() => S.impostazioni.anticipo);
    await finta({ testo: 'Fatto il piano:', azioni: [{ azione: 'impostazione', chiave: 'anticipo', valore: prima + 2 }, { azione: 'impostazione', chiave: 'segreta', valore: 1 }] });
    await scrivi('voglio 2 giorni in più di preavviso');
    if (!(await page.locator('.ai-fum.lei').last().locator('.ai-azione', { hasText: 'Giorni di preavviso' }).count())) throw new Error('manca la riga dell\'impostazione');
    await clic('[data-a="ai-si"]');
    if (await page.evaluate(() => S.impostazioni.anticipo) !== prima + 2) throw new Error('impostazione non cambiata');
    await page.evaluate(p => { S.impostazioni.anticipo = p; }, prima);
    await page.evaluate(() => { UI.vista = 'home'; render(); });
  });
  await passo('cliente: «Scrivimi» su WhatsApp col messaggio già iniziato (Mario 08/11)', async () => {
    await page.evaluate(() => { P.ruolo = 'cliente'; S.impostazioni.whatsapp = '3331234567'; UI.vista = 'menu'; UI.foglio = null; render(); });
    await page.waitForTimeout(1500);
    const h = decodeURIComponent(await page.locator('.wa-monica').getAttribute('href'));
    if (!h.includes('Ti scrivo dall\'app Pronti in Tavola') || !h.includes('Volevo chiederti:')) throw new Error('messaggio: ' + h);
    await page.evaluate(() => { $('#toast').innerHTML = ''; }); await foto('36-scrivi-monica');
    await page.evaluate(() => { UI.vista = 'ordini'; UI.ordAperto = (S.ordini.find(o => o.cliente === P.cliente && !['rifiutato', 'annullato'].includes(o.stato)) || {}).id; render(); });
    await page.waitForTimeout(300);
    if (!decodeURIComponent(await page.locator('.wa-ordine').first().getAttribute('href')).includes('per l\'ordine n.')) throw new Error('manca il numero dell\'ordine nel messaggio');
    await page.evaluate(() => { S.impostazioni.whatsapp = ''; UI.vista = 'menu'; render(); });
    if (await page.locator('.wa-monica').count()) throw new Error('tasto visibile senza numero (cliente non approvato)');
  });
  await passo('Monica: l\'aiutante capisce il senso, le parole sono solo indizi; senza AI chiede «Intendi…?» (C102)', async () => {   // autonoma
    await page.evaluate(() => { P.ruolo = 'monica'; AI.msgs = []; AI.attesa = false; UI.aiQui = null; UI.foglio = null; window._chiediVero = window._chiediVero || chiediAiutante; vai('aiutante'); });
    // 1) con l'AI: decide lei dal senso, anche se le parole portano altrove; le parole le arrivano come indizi
    await page.evaluate(() => { window.chiediAiutante = async (t, d) => { window._indizi = d.indizi || null; return { testo: 'Ti porto nelle notifiche.', azioni: [{ azione: 'vai', voce: 'imp-notifiche' }] }; }; });
    await page.evaluate(() => inviaAI('voglio che i clienti vedano subito la foto quando ordinano')); await page.waitForTimeout(1900);
    const a = await page.evaluate(() => ({ v: UI.vista, s: UI.sez, ind: (window._indizi || []).map(x => x.voce) }));
    if (a.v !== 'impostazioni' || a.s !== 'imp-notifiche') throw new Error('non segue l\'AI: ' + JSON.stringify(a));
    if (!a.ind.length) throw new Error('le parole non arrivano all\'AI come indizi');
    // 2) senza AI: «Intendi…?» con «Portami lì», e non parte da sola
    await page.evaluate(() => { AI.msgs = []; UI.aiQui = null; window.chiediAiutante = async () => { throw new Error('Sei senza internet: riprova quando torna la rete.'); }; vai('aiutante'); });
    await page.evaluate(() => inviaAI('dove metto la pausa?')); await page.waitForTimeout(1900);
    const b = await page.evaluate(() => ({ v: UI.vista, t: AI.msgs[AI.msgs.length - 1].t }));
    if (b.v !== 'aiutante' || !/intendi/i.test(b.t)) throw new Error('senza AI è partita da sola o non chiede: ' + JSON.stringify(b));
    await foto('33b-aiutante-intendi');
    await clic('[data-a="ai-vai"]'); await page.waitForTimeout(300);
    const c = await page.evaluate(() => UI.vista + ' ' + UI.sez);
    if (c !== 'impostazioni imp-pausa') throw new Error('«Portami lì» non porta alla pausa: ' + c);
    await page.evaluate(() => { window.chiediAiutante = window._chiediVero; AI.msgs = []; UI.aiQui = null; UI.sez = null; vai('home'); });
  });
  await passo('aiutante: conosce anche le funzioni vecchie (voce, Storico, clienti nuovi, rifiutati, chi aspetta) e tutte le voci date all\'AI esistono (C100)', async () => {   // autonoma
    const W = require('fs').readFileSync(require('path').join(__dirname, '..', 'worker.js'), 'utf8');
    const pezzo = (da, a) => W.slice(W.indexOf(da) + da.length, W.indexOf(a, W.indexOf(da))).replace(/\([^)]*\)/g, '').split(',').map(x => x.replace(/[.\s]+$/, '').trim()).filter(Boolean);
    const voci = [...pezzo('Voci del piatto (con id):', 'Voci delle Impostazioni:'), ...pezzo('Voci delle Impostazioni:', 'Pagine:'), ...pezzo('Pagine:', 'Usala per')];
    const r = await page.evaluate(voci => {
      const primaS = JSON.stringify(S), primaUI = [UI.vista, UI.tab, UI.rifiutati, P.ruolo];
      try {
        P.ruolo = 'monica';
        const mancano = voci.filter(v => !DOVE_AI[v]);
        const prime = ['dove vedo gli ordini vecchi?', 'come faccio a non accettare clienti nuovi?', 'ho detto no per sbaglio a una persona, come la riaccetto?', 'come rallento la voce che parla troppo veloce?', 'Laura dice che aspetta il mio sì ma non la trovo tra i clienti']
          .map(t => ((capisciDove(t) || [])[0] || {}).voce);
        S.rifiutati = []; const vuota = controllaAI({ azione: 'vai', voce: 'clienti-rifiutati' }).no || '';
        portaLi(controllaAI({ azione: 'vai', voce: 'ordini-storico' })); const storico = UI.vista + ' ' + UI.tab;
        return { mancano, prime, vuota, storico };
      } finally { S = JSON.parse(primaS); [UI.vista, UI.tab, UI.rifiutati, P.ruolo] = primaUI; UI.aiQui = null; render(); }
    }, voci);
    if (voci.length < 20) throw new Error('non trovo l\'elenco delle voci in worker.js: ' + voci.join());
    if (r.mancano.length) throw new Error('voci date all\'AI che l\'app non conosce: ' + r.mancano.join());
    if (r.prime.join() !== 'ordini-storico,clienti-nuovi,clienti-rifiutati,imp-voce,clienti-attesa') throw new Error('posti sbagliati: ' + r.prime.join());
    if (!/vuota/.test(r.vuota)) throw new Error('rifiutati vuoti: ' + r.vuota);
    if (r.storico !== 'ordini storico') throw new Error('«Portami lì» non apre lo Storico: ' + r.storico);
  });
  await passo('cliente: aiutante AI acceso di base, spento da Mario, carrello solo dopo «Conferma» (C50)', async () => {
    await page.evaluate(() => { P.ruolo = 'cliente'; S.impostazioni.aiClienti = false; UI.devCliente = false; UI.vista = 'menu'; UI.foglio = null; P.carrello = []; render(); });
    if (await page.locator('.ai-cliente').count()) throw new Error('aiutante visibile ai clienti da spento');
    await page.evaluate(() => { delete S.impostazioni.aiClienti; render(); });
    if (!(await page.locator('.ai-cliente .ai-apri').count())) throw new Error('acceso ma manca nel menù');
    await clic('.ai-cliente .ai-apri'); await page.locator('.ai-intro').waitFor({ timeout: 2000 });
    const d = await page.evaluate(() => { const x = datiAIC(); return { n: JSON.stringify(x).length, altri: x.mieiOrdini.length === S.ordini.filter(o => o.cliente === P.cliente && o.stato !== 'prova' && !o.archiviato).slice(0, 8).length, ind: JSON.stringify(x).includes(S.impostazioni.ritiro.via || '§§') }; });
    if (d.n > 40000) throw new Error('dati per l\'AI dei clienti troppo grandi: ' + d.n);
    if (!d.altri) throw new Error('nei dati ci sono ordini di altri clienti');
    if (d.ind) throw new Error('nei dati c\'è l\'indirizzo di Monica');
    await clic('[data-a="ac-chiedi"]'); await page.waitForTimeout(400);   // «Cosa c'è di pronto oggi?» ora risponde sul telefono (C105)
    if (!(await page.locator('.ai-fum.lei').count()) || await page.locator('.ai-fum.lei', { hasText: 'anteprima' }).count()) throw new Error('la domanda sui pronti non ha avuto la risposta locale');
    await page.fill('#ac-testo', 'blu vermiglio quattordici'); await page.press('#ac-testo', 'Enter'); await page.waitForTimeout(400);   // frase senza senso → server
    if (!(await page.locator('.ai-fum.lei', { hasText: 'anteprima' }).count())) throw new Error('nell\'anteprima non spiega che risponde solo nell\'app vera');
    const pid = await page.evaluate(() => { const p = visibili().find(x => x.disponibile && !x.varianti.length) || visibili().find(x => x.disponibile); return p.id; });
    await page.evaluate(id => { window.chiediAiutoCliente = async () => ({ testo: 'Ecco!', azioni: [{ azione: 'carrello', id, qta: 2 }, { azione: 'carrello', id: 'inventato' }] }); }, pid);
    await page.fill('#ac-testo', 'due per sabato'); await page.press('#ac-testo', 'Enter'); await page.waitForTimeout(400);
    if (await page.evaluate(() => P.carrello.length)) throw new Error('ha messo nel carrello prima di «Conferma»');
    if (!(await page.locator('.ai-azione.no', { hasText: 'non è nel menù' }).count())) throw new Error('piatto inventato non scartato');
    await foto('35-aiutante-cliente');
    await clic('[data-a="ac-si"]');
    if (await page.evaluate(id => (P.carrello.find(r => r.piatto === id) || {}).piatto !== id, pid)) throw new Error('«Conferma» non ha messo nel carrello');
    if (!(await page.locator('.ai-esito', { hasText: 'Nel carrello' }).count())) throw new Error('manca «✓ Nel carrello»');
    await page.evaluate(() => { P.carrello = []; salvaP(); S.impostazioni.aiClienti = false; UI.vista = 'menu'; render(); });
    if (await page.locator('.ai-cliente').count()) throw new Error('rispento ma ancora visibile');
  });
  await passo('cliente: tasto «Scrivimi»; Monica: «Sono qui» squilla con l\'app aperta e si ferma con «Ho visto» (C51)', async () => {
    await page.evaluate(() => { P.ruolo = 'cliente'; S.impostazioni.whatsapp = '3331234567'; UI.vista = 'menu'; UI.foglio = null; render(); });
    if (!(await page.locator('.wa-monica', { hasText: 'Scrivimi' }).count())) throw new Error('il tasto non dice «Scrivimi»');
    await page.evaluate(() => { S.impostazioni.whatsapp = ''; P.ruolo = 'monica'; UI.vista = 'home'; render(); });
    const n = await page.evaluate(() => S.ordini.find(o => !o.archiviato).n);
    await page.evaluate(n => suoneria({ nome: 'Laura Rossi', n }), n);
    if (!(await page.locator('.squillo', { hasText: 'Laura Rossi è qui sotto' }).count())) throw new Error('niente schermata della suoneria');
    await foto('36-suoneria');
    await clic('#squillo-ok');
    if (await page.locator('.squillo').count()) throw new Error('«Ho visto» non ferma la suoneria');
    if (await page.evaluate(() => UI.vista) !== 'ordini') throw new Error('«Ho visto» non apre gli ordini');
  });
  await passo('sviluppatore: cronologia completa delle versioni dalla 0.1 (C52)', async () => {
    await page.evaluate(() => { P.ruolo = 'monica'; P.sviluppatore = true; UI.devTutte = false; UI.vista = 'impostazioni'; UI.foglio = null; render(); });
    await clic('[data-a="dev-tutte"]');
    if (!(await page.locator('.dev-nov', { hasText: '0.1 → 0.6' }).count())) throw new Error('nella cronologia manca la 0.1');
    if (await page.locator('.dev-nov').count() < 15) throw new Error('cronologia incompleta');
    await page.locator('.dev-nov', { hasText: '0.7 · tappa 1' }).scrollIntoViewIfNeeded(); await foto('37-cronologia');
    await page.evaluate(() => { P.sviluppatore = false; UI.devTutte = false; render(); });
  });
  await passo('sviluppatore: tocco sul numerino della versione → tutti gli aggiornamenti con data e ora (Mario 08/11)', async () => {
    // la barra sviluppatore esiste solo col server vero (Dati.attivo): qui lo si finge per il tempo del passo, poi si rimette com'era
    await page.evaluate(() => { window._prima = { attivo: Dati.attivo, gestore: Dati.io.gestore, nome: Dati.io.nomeGestore, aperto: L.aperto }; Dati.attivo = true; Dati.io.gestore = true; Dati.io.nomeGestore = 'Mario'; L.aperto = true;
      P.ruolo = 'monica'; P.sviluppatore = true; UI.barraDev = true; UI.devCliente = false; UI.vista = 'impostazioni'; UI.foglio = null; UI.richViste = (S.richieste || []).map(r => r.id); render(); });
    if (!(await page.locator('.prova.dev .dev-v').count())) throw new Error('numerino della versione non visibile nella barra sviluppatore');
    await clic('.prova.dev .dev-v');
    const quante = await page.locator('.foglio .dev-nov').count();
    if (quante < 15) throw new Error('il foglio degli aggiornamenti è incompleto: ' + quante);
    const testo = await page.locator('.foglio .dev-nov').first().innerText();
    if (!/\d\d\/\d\d\/\d{4}/.test(testo) || !/ore \d\d:\d\d/.test(testo)) throw new Error('nel foglio manca data o ora dell\'ultima versione: ' + testo.slice(0, 80));
    await foto('37b-aggiornamenti-dal-numerino');
    await clic('.foglio [data-a="chiudi"]');
    if (await page.evaluate(() => !!UI.foglio)) throw new Error('il foglio degli aggiornamenti non si chiude');
    // versione SEMPRE in vista per Mario anche senza barra (08/11), con l'ora VERA della pubblicazione (PUBBLICATE, riempita da tools/sito.py)
    await page.evaluate(() => { P.sviluppatore = false; UI.barraDev = false; PUBBLICATE[VERSIONE_APP] = '08/11/2026 09:07'; render(); });
    const mini = await page.locator('.versione-mini').innerText({ timeout: 2000 }).catch(() => '');
    if (!mini.includes('v' + await page.evaluate(() => VERSIONE_APP)) || !/09:07/.test(mini)) throw new Error('senza barra sviluppatore non si vede la versione con l\'ora vera: «' + mini + '»');
    await clic('.versione-mini');
    if (!/ore 09:07/.test(await page.locator('.foglio .dev-nov').first().innerText())) throw new Error('il foglio non usa l\'ora vera della pubblicazione');
    await clic('.foglio [data-a="chiudi"]');
    await page.evaluate(() => { delete PUBBLICATE[VERSIONE_APP]; P.ruolo = 'cliente'; render(); });
    if (await page.locator('.versione-mini').count()) throw new Error('la versione piccola si vede anche al cliente');
    await page.evaluate(() => { Dati.attivo = _prima.attivo; Dati.io.gestore = _prima.gestore; Dati.io.nomeGestore = _prima.nome; L.aperto = _prima.aperto; P.sviluppatore = false; UI.barraDev = false; render(); });
  });
  await passo('sviluppatore su iPad (C111): pulsante «Accendi» in «Solo per te, Mario», 7 tocchi che rispondono sempre, niente zoom col doppio tocco', async () => {   // autonoma
    await page.evaluate(() => { window._prima = { attivo: Dati.attivo, gestore: Dati.io.gestore, nome: Dati.io.nomeGestore, aperto: L.aperto }; Dati.attivo = true; Dati.io.gestore = true; Dati.io.nomeGestore = 'Mario'; L.aperto = true;
      P.ruolo = 'monica'; P.sviluppatore = false; UI.barraDev = false; UI.devCliente = false; UI.vista = 'impostazioni'; UI.foglio = null; UI.firmaTocchi = []; UI.richViste = (S.richieste || []).map(r => r.id); render(); });
    const stile = await page.evaluate(() => { const f = getComputedStyle(document.querySelector('footer.firma')), b = getComputedStyle(document.querySelector('button')); return [f.touchAction, f.cursor, b.touchAction].join('|'); });
    if (stile !== 'manipulation|pointer|manipulation') throw new Error('firma o pulsanti senza «touch-action: manipulation» / cursor (zoom col doppio tocco su iPad): ' + stile);
    await clic('[data-a="dev-attiva"]');
    if (!(await page.evaluate(() => P.sviluppatore && UI.barraDev)) || !(await page.locator('.prova.dev').count())) throw new Error('«Accendi la modalità sviluppatore» non accende la modalità o non apre la barra');
    if (await page.locator('[data-a="dev-attiva"]').count()) throw new Error('il pulsante «Accendi» resta anche quando è già accesa');
    const sette = async () => { await page.evaluate(() => { UI.firmaTocchi = []; }); for (let i = 0; i < 7; i++) await page.locator('footer.firma').dispatchEvent('click'); return (await page.locator('#toast').innerText().catch(() => '')).trim(); };   // tocco diretto: apertura, avvisi e riquadro «Puoi parlarmi!» possono stare sopra
    let t = await sette();
    if (await page.evaluate(() => UI.barraDev) || !/chiusa/.test(t)) throw new Error('da sviluppatore i 7 tocchi non chiudono la barra: «' + t + '»');
    t = await sette();
    if (!(await page.evaluate(() => UI.barraDev)) || !/aperta/.test(t)) throw new Error('da sviluppatore i 7 tocchi non riaprono la barra: «' + t + '»');
    await page.evaluate(() => { P.sviluppatore = false; UI.barraDev = false; Dati.io.gestore = false; Dati.io.nomeGestore = ''; P.ruolo = 'cliente'; UI.vista = 'menu'; render(); });
    t = await sette();
    if (!/Area riservata/.test(t) || await page.evaluate(() => P.sviluppatore)) throw new Error('entrato come cliente, i 7 tocchi non dicono di entrare da «Area riservata»: «' + t + '»');
    await page.evaluate(() => { Dati.attivo = _prima.attivo; Dati.io.gestore = _prima.gestore; Dati.io.nomeGestore = _prima.nome; L.aperto = _prima.aperto; P.sviluppatore = false; UI.barraDev = false; UI.firmaTocchi = []; $('#toast').innerHTML = ''; render(); });
  });
  await passo('ricettario (C55): GialloZafferano dentro l\'app (finto server), preferite, porzioni, spesa, cucina guidata, ricetta mia', async () => {
    await page.evaluate(() => {
      P.ruolo = 'monica'; S.impostazioni.ricettario = true;
      try { localStorage.removeItem('pit-ric-cache'); localStorage.removeItem('pit-ric-pref'); localStorage.removeItem('pit-ric-mie'); localStorage.removeItem('pit-ric-note'); } catch (e) { /* niente */ }
      const finta = { url: 'https://ricette.giallozafferano.it/Seadas-sebadas.html', id: 'gz:Seadas-sebadas', nome: 'Seadas (sebadas)', intro: 'Dolce gallurese di formaggio e miele.', foto: '', porzioni: 4, prep: 60, cottura: 10,
        difficolta: 'Media', costo: 'Medio', ingredienti: [{ nome: 'Semola', q: 250, u: 'g', nota: '' }, { nome: 'Pecorino fresco', q: 300, u: 'g', nota: '' }, { nome: 'Miele', q: null, u: '', nota: '' }, { nome: 'Strutto', q: 25, u: 'g', nota: '' }, { nome: 'Acqua', q: 120, u: 'ml', nota: '' }, { nome: 'Limone', q: 1, u: '', nota: '' }],
        passi: [{ t: 'Impastate semola e strutto.', foto: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2230%22%3E%3Crect width=%2240%22 height=%2230%22 fill=%22%23c96%22/%3E%3C/svg%3E#1', 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2230%22%3E%3Crect width=%2240%22 height=%2230%22 fill=%22%23c96%22/%3E%3C/svg%3E#2'] }, { t: 'Lasciate riposare 30 minuti.', foto: [] }, { t: 'Friggete e servite col miele.', foto: [] }], conserva: '', consiglio: '', autore: '', hls: '', mp4: '' };
      RIC.chiedi = async c => c.cerca ? { ricette: [{ url: finta.url, nome: finta.nome, foto: '' }] } : { ricetta: finta };
      RIC.voceAutoFatto = true;   // niente scarico vero della voce (94 MB) durante la prova: la voce automatica si prova sotto col finto Piper
      vai('home');
    });
    await page.locator('.ric-home').click({ timeout: 3000 }); await page.locator('.ric-carta').first().waitFor({ timeout: 3000 });
    const n = await page.locator('.ric-elenco .ric-carta').count(); if (n !== await page.evaluate(() => RICETTE_GZ.length)) throw new Error('ricette in elenco: ' + n);
    if (await page.locator('.ric-cerca svg path, .ric-cerca svg circle').count() < 1) throw new Error('manca la lente');
    await foto('30-ricettario');
    await clic('details.ric-esplora-box > summary'); await clic('[data-a="ric-esplora"]'); await page.locator('.scheda h2', { hasText: 'Da GialloZafferano' }).waitFor({ timeout: 3000 }); await clic('[data-a="ric-chiudi-cerca"]');
    // 🎲 cosa cucino oggi: c'è una proposta e «Un'altra» la cambia (quasi sempre)
    const prop = () => page.locator('.scheda', { hasText: 'Cosa cucino oggi' }).locator('.ric-carta b').innerText();
    const p1 = await prop(); let cambia = false; for (let i = 0; i < 4 && !cambia; i++) { await clic('[data-a="ric-dado"]'); cambia = (await prop()) !== p1; }
    if (!cambia) throw new Error('«Un\'altra» non cambia la proposta');
    // cosa cucino con quello che ho: gli ingredienti diventano una ricerca
    await page.fill('#ric-cerca', 'zucchine, uova'); await page.press('#ric-cerca', 'Enter');
    await page.locator('.scheda h2', { hasText: 'zucchine uova' }).waitFor({ timeout: 3000 }); await clic('[data-a="ric-chiudi-cerca"]');
    // catalogo per portata: 30 ricette, «Carica altre» ne aggiunge altre 30, poi basta
    await page.evaluate(() => { RIC._c = RIC.chiedi; RIC.chiedi = async c => c.cat ? ({ ricette: Array.from({ length: 30 }, (_, i) => ({ url: 'https://ricette.giallozafferano.it/P' + (c.pagina ? 'b' : 'a') + i + '.html', nome: 'Primo ' + i, foto: '' })), prossima: c.pagina ? '' : 'https://www.giallozafferano.it/ricette-cat/page2/Primi/' }) : RIC._c(c); });
    await clic('details.ric-catalogo-box > summary'); await clic('[data-a="ric-catalogo"][data-v="primi"]'); await page.locator('[data-a="ric-altre"]').waitFor({ timeout: 3000 });
    await clic('[data-a="ric-altre"]'); await page.waitForTimeout(300);
    if (await page.locator('#ric-risultati .ric-carta').count() !== 60) throw new Error('«Carica altre» non aggiunge le ricette');
    if (await page.locator('[data-a="ric-altre"]').count()) throw new Error('«Carica altre» resta anche a catalogo finito');
    await clic('[data-a="ric-chiudi-cerca"]'); await clic('details.ric-catalogo-box > summary'); await clic('details.ric-ingr > summary');
    await clic('[data-a="ric-catalogo"][data-v="ricette-con-le-Melanzane"]'); await page.locator('#ric-risultati h2', { hasText: 'Melanzane' }).waitFor({ timeout: 3000 });
    await clic('[data-a="ric-chiudi-cerca"]');
    // 🗄 pagina Database ricette (C60): numeri del telefono e del server, «Sfoglia» apre l'archivio nel Ricettario
    await page.evaluate(() => { RIC.db = { ricette: 42, coda: 5, voci: 7, mbVoci: 1.2, mb: 3, oggi: 12, pausa: false, fonte: 3, fonti: 10, sezione: 'dolci', giri: 20, pagine: 9, passate: 0, ultimoGiro: { quando: Date.now() - 120000 } }; RIC.dbOra = Date.now(); vai('ricdb'); });
    await page.locator('#ricdb-archivio h2', { hasText: '42 trovate' }).waitFor({ timeout: 3000 });
    if (!(await page.locator('#ricdb-archivio', { hasText: 'Lavora sul server' }).count()) || !(await page.locator('#ricdb-archivio', { hasText: 'sarde: pagina 1 · altre: sezione 3 di 9 (Dolci) · 22%' }).count())) throw new Error('il motore non dice stato e avanzamento');
    await page.evaluate(() => { RIC._c3 = RIC.chiedi; RIC.chiedi = async c => c.db === 'cerca' ? { db: Object.assign({}, RIC.db, { ricette: 44 }), nuove: 2 } : RIC._c3(c); });
    await clic('[data-a="ric-db-cerca"]'); await page.waitForTimeout(300);
    if (!(await page.locator('#ricdb-archivio h2', { hasText: '44 trovate' }).count())) throw new Error('«Cerca adesso» non aggiorna i numeri');
    await page.evaluate(() => { RIC.chiedi = RIC._c3; RIC.dbOra = Date.now(); });
    if (!(await page.locator('.scheda h2', { hasText: 'Il tuo ricettario: ' }).count())) throw new Error('manca «Il tuo ricettario: N»');
    await foto('42-database');
    await clic('[data-a="ric-catalogo"][data-v="db"]'); await page.locator('#ric-risultati h2', { hasText: 'Archivio automatico' }).waitFor({ timeout: 3000 });
    await page.evaluate(() => { RIC.chiedi = RIC._c; }); await clic('[data-a="ric-chiudi-cerca"]');
    // 🗄 Il mio database in vista nel Ricettario (Mario 08/11 «sembra nascosta»): numeri e motore senza cambiare pagina
    const box = await page.locator('.ric-db-box').innerText();
    if (!/nel ricettario/.test(box) || !/le vede anche Monica/.test(box) || !/in arrivo/.test(box) || !/Tutto salvato sul server/.test(box)) throw new Error('il riquadro del database non dice chiaro totale, arrivo e salvataggio: ' + box.slice(0, 300));
    // ⚡ Carica 100 (Mario 08/11): parte sul server e la barra lo mostra
    await page.evaluate(() => { RIC._c4 = RIC.chiedi; RIC.chiedi = async c => c.db === 'turbo' ? { turbo: { obiettivo: c.n, fatte: 0, scartate: 0, attivo: true } } : c.db === 'stato' ? { db: RIC.db } : RIC._c4(c); });
    await clic('[data-a="ric-db-turbo"]'); await page.waitForTimeout(400);
    if (!(await page.locator('.ric-db-box', { hasText: 'Carico 100 ricette: 0 fatte' }).count())) throw new Error('«⚡ Carica 100» non mostra il carico in corso');
    await page.evaluate(() => { RIC.chiedi = RIC._c4; RIC.db.turbo = null; clearTimeout(RIC.turboTimer); RIC.turboTimer = null; render(); });
    if (!(await page.locator('.ric-db-box', { hasText: 'Motore' }).count())) throw new Error('nel Ricettario manca lo stato del motore');
    // C83: «🔍 Controlla tutte» → esito di tutte le ricette in vista, con quelle da sistemare
    await page.evaluate(() => { RIC._c5 = RIC.chiedi; RIC.chiedi = async c => c.db === 'controlla' ? { controllo: { quando: Date.now(), totale: 120, ok: 119, nMale: 1, male: [{ id: 'gz:X', nome: 'Pane cafone', prob: ['passo 3: resti di HTML'] }], mancanti: 0 }, db: Object.assign({}, RIC.db, { controllo: { quando: Date.now(), totale: 120, ok: 119, nMale: 1, male: [{ id: 'gz:X', nome: 'Pane cafone', prob: ['passo 3: resti di HTML'] }], mancanti: 0 } }) } : RIC._c5(c); });
    await clic('.ric-db-box [data-a="ric-db-controlla"]'); await page.waitForTimeout(300);
    if (!(await page.locator('.ric-db-box', { hasText: 'Controllate 120 ricette' }).count()) || !(await page.locator('.ric-db-box', { hasText: 'Pane cafone' }).count())) throw new Error('«🔍 Controlla tutte» non mostra l\'esito');
    // C123: le rilette uguali su GZ: «uguali all'originale» col perché, e mai più «ci penso io» finto
    await page.evaluate(() => { const c = { quando: Date.now(), totale: 1161, ok: 1156, nMale: 0, male: [], nOriginali: 5, originali: [{ id: 'gz:P', nome: 'Peperonata', prob: ['passo 6: 1 foto mancante'], esito: 'uguale' }, { id: 'gz:F', nome: 'Frullato di frutta', prob: ['1 passo solo'], esito: 'uguale' }], mancanti: 0 };
      RIC.chiedi = async q => q.db === 'controlla' ? { controllo: c, db: Object.assign({}, RIC.db, { controllo: c }) } : RIC._c5(q); });
    await clic('.ric-db-box [data-a="ric-db-controlla"]'); await page.waitForTimeout(300);
    if (!(await page.locator('.ric-db-box', { hasText: "5 uguali all'originale" }).count()) || !(await page.locator('.ric-db-box li', { hasText: 'Frullato di frutta' }).filter({ hasText: 'su GialloZafferano è così' }).count())) throw new Error('C123: le «uguali all\'originale» non hanno il perché');
    if (await page.locator('#toast', { hasText: 'ci penso io' }).count()) throw new Error('C123: l\'avviso promette ancora «ci penso io»');
    if (!(await page.locator('#toast', { hasText: "uguali all'originale" }).count())) throw new Error('C123: l\'avviso non dice cosa è successo');
    await page.locator('.ric-db-box').scrollIntoViewIfNeeded(); await foto('81b-controllo-originali');
    await page.evaluate(() => { RIC.chiedi = RIC._c5; });
    await page.fill('#ric-cerca', 'seadas'); await page.waitForTimeout(200);
    if (await page.locator('.ric-carta').count() !== 1) throw new Error('la ricerca «seadas» non trova solo le seadas');
    await clic('[data-a="ric-cerca-gz"]'); await page.locator('.scheda h2', { hasText: 'Da GialloZafferano' }).waitFor({ timeout: 3000 });
    await clic('[data-a="ric-chiudi-cerca"]');
    await page.locator('.ric-elenco .ric-carta', { hasText: 'Seadas' }).first().click({ timeout: 3000 }); await page.locator('.ric-ing').waitFor({ timeout: 3000 });
    const prima = await page.locator('.ric-ing li').first().innerText();
    await clic('[data-a="ric-porz"][data-v="1"]'); await clic('[data-a="ric-porz"][data-v="1"]');
    const dopo = await page.locator('.ric-ing li').first().innerText();
    if (prima === dopo) throw new Error('le porzioni non cambiano le dosi: ' + dopo);
    await clic('[data-a="ric-zoom"]'); await page.locator('.ric-zoom img').waitFor({ timeout: 3000 });
    if (!/1 \/ 2/.test(await page.locator('.ric-zoom-n').innerText())) throw new Error('la foto ingrandita non dice 1 / 2');
    await clic('.ric-zoom-s'); if (!/2 \/ 2/.test(await page.locator('.ric-zoom-n').innerText())) throw new Error('la freccia non va alla foto dopo');
    await clic('.ric-zoom-x'); if (await page.locator('.ric-zoom').count()) throw new Error('la foto ingrandita non si chiude');
    await clic('[data-a="ric-pref"]');
    if (!(await page.evaluate(() => preferiteRic().includes('gz:Seadas-sebadas')))) throw new Error('la preferita non si salva');
    await foto('31-ricetta');
    const voci = await page.evaluate(() => SPESA.mia.length);
    await page.locator('.ric-ing input').first().check(); await clic('[data-a="ric-spesa"]'); await page.waitForTimeout(200);
    const aggiunte = await page.evaluate(() => SPESA.mia.length) - voci;
    if (aggiunte < 4) throw new Error('nella spesa solo ' + aggiunte + ' ingredienti');
    // ▶️ fa partire la voce da sola al primo passo (Mario 08/11 «non si attiva la voce in automatico»)
    await page.evaluate(() => { window._detto = []; window._parlaVera = parlaAI; parlaAI = (t, f) => { _detto.push(t); if (f) f(); }; });
    await clic('[data-a="ric-play"]'); await page.locator('.ric-passo').waitFor({ timeout: 3000 }); await page.waitForTimeout(100);
    if (!/^Passo 1\./.test(await page.evaluate(() => _detto[0] || ''))) throw new Error('▶️ non fa leggere il primo passo da solo: ' + await page.evaluate(() => JSON.stringify(_detto)));
    await page.evaluate(() => { parlaAI = _parlaVera; });
    await clic('[data-a="ric-passo"][data-v="1"]');
    await page.locator('[data-a="ric-timer"]').click({ timeout: 3000 }); await page.waitForTimeout(1200);
    if (!/Mancano/.test(await page.locator('[data-a="ric-timer"]').innerText())) throw new Error('il timer non parte');
    await foto('32-cucina-guidata');
    // voci sul telefono (C61, Piper/Kokoro): voce scelta non scaricata → tasto «Scarica (N MB)» → barra → ✅ e legge; Microsoft giù → ripiega sulla voce scaricata
    await page.evaluate(() => {
      window._piperVero = VociLocali.piper; VociLocali.piper = { voci: [['piper:paola', 'Paola · sul telefono (Piper)']], mb: () => 93, pronta: async () => !!window._paolaOk, scarica: (k, av) => new Promise(ok => { av(0.5); setTimeout(() => { window._paolaOk = true; av(1); ok(); }, 150); }), parla: async () => { window._paolaDetto = (window._paolaDetto || 0) + 1; return new Blob([new Uint8Array(44)], { type: 'audio/wav' }); }, libera() {} };
      AI.localiPronte = {}; localStorage.setItem('pit-voce', 'piper:paola'); render();
    });
    await page.waitForTimeout(200);
    if (!(await page.locator('#ric-voce-scelta option[value="piper:paola"]').count())) throw new Error('Paola (Piper) non è fra le voci');
    if (!/93 MB/.test(await page.locator('[data-a="ric-voce-scarica"]').innerText({ timeout: 2000 }))) throw new Error('manca «Scarica la voce (93 MB)»');
    await clic('[data-a="ric-voce-scarica"]'); await page.waitForTimeout(400);
    if (!(await page.locator('.ric-voce-stato', { hasText: 'Voce sul telefono' }).count())) throw new Error('dopo lo scarico non dice ✅ Voce sul telefono');
    if (!(await page.evaluate(() => window._paolaDetto >= 1))) throw new Error('la voce scaricata non legge il passo');
    // Microsoft spenta (Mario 08/11 «lasciamo perdere»): una vecchia scelta «edge:…» salvata legge Paola, e nella scelta non c'è più
    await page.evaluate(() => { localStorage.setItem('pit-voce', 'edge:isabella'); window._fetchVero = fetch; window._paolaDetto = 0; parlaAI('Prova di ripiego.'); });
    await page.waitForTimeout(400);
    if (!(await page.evaluate(() => sceltaVoce() === 'piper:paola' && window._paolaDetto >= 1))) throw new Error('una vecchia scelta Microsoft non passa a Paola');
    if (await page.locator('#ric-voce-scelta option[value^="edge:"]').count()) throw new Error('le voci Microsoft sono ancora nella scelta');
    // voce AUTOMATICA (Mario 08/11 «deve funzionare tutto da sola»): senza scelta salvata la voce è Paola e si scarica da sola aprendo la cucina
    await page.evaluate(() => { fetch = window._fetchVero; localStorage.removeItem('pit-voce'); window._paolaOk = false; window._paolaDetto = 0; AI.localiPronte = {}; RIC.voceAutoFatto = false; render(); });
    await page.waitForTimeout(500);
    if (!(await page.evaluate(() => sceltaVoce() === 'piper:paola' && window._paolaOk === true && window._paolaDetto >= 1))) throw new Error('la voce di base non si scarica da sola o non legge: ' + await page.evaluate(() => JSON.stringify([sceltaVoce(), window._paolaOk, window._paolaDetto])));
    if (await page.locator('#ric-voce-scelta option[value^="kokoro:"]').count()) throw new Error('Kokoro è ancora fra le voci (in italiano non funziona)');
    // voce Google del telefono (Mario 08/11 «proviamo google come seconda voce»): seconda nella scelta, la usa se c'è, se manca lo dice
    {
      const ord = await page.locator('#ric-voce-scelta option').evaluateAll(o => o.map(x => x.value));
      if (ord[1] !== 'tel:google') throw new Error('«Voce Google del telefono» non è la seconda voce: ' + ord.slice(0, 3).join(', '));
      const r = await page.evaluate(() => { const vero = speechSynthesis.getVoices; speechSynthesis.getVoices = () => [{ name: 'Alice', lang: 'it-IT' }, { name: 'Google italiano', lang: 'it-IT', localService: false }]; localStorage.setItem('pit-voce', 'tel:google'); const g = voceAI(); render(); const conG = document.querySelector('.ric-voce-stato').textContent; speechSynthesis.getVoices = () => [{ name: 'Alice', lang: 'it-IT' }]; render(); const senza = document.querySelector('.ric-voce-stato').textContent, alt = voceAI(); speechSynthesis.getVoices = vero; localStorage.removeItem('pit-voce'); render(); return { g: g && g.name, conG, senza, alt: alt && alt.name }; });
      if (r.g !== 'Google italiano' || !/Voce Google/.test(r.conG)) throw new Error('con la voce Google scelta non usa Google: ' + JSON.stringify(r));
      if (r.alt !== 'Alice' || !/non ha la voce Google/.test(r.senza)) throw new Error('senza voce Google non ripiega o non lo dice: ' + JSON.stringify(r));
    }
    await page.evaluate(() => { VociLocali.piper = window._piperVero; AI.voceNo = false; AI.localiPronte = {}; RIC.voceAutoFatto = true; });
    // due timer insieme: quello del passo e uno veloce; il primo si ferma da solo, l'altro resta
    await clic('[data-a="ric-altro"]'); await clic('[data-a="ric-timer-libero"][data-v="5"]');
    await page.evaluate(() => vai('home')); await page.waitForTimeout(1200);
    if (!(await page.locator('#ric-barra-timer').count())) throw new Error('fuori dalla cucina non si vede la barretta dei timer');
    await clic('#ric-barra-timer'); await page.locator('.ric-passo').waitFor({ timeout: 3000 });
    if (await page.locator('#ric-barra-timer').count()) throw new Error('la barretta resta anche nella cucina guidata'); await page.waitForTimeout(300);
    if (await page.evaluate(() => RIC.timers.length) !== 2) throw new Error('i due timer non partono insieme');
    if (await page.locator('[data-a="ric-timer-via"]').count() !== 1) throw new Error('manca il «Ferma» del secondo timer');
    await clic('[data-a="ric-timer"]'); if (await page.evaluate(() => RIC.timers.length) !== 1) throw new Error('fermare un timer li ferma tutti');
    await clic('[data-a="ric-timer-via"]'); if (await page.evaluate(() => RIC.timers.length) !== 0) throw new Error('il «Ferma» non ferma il timer');
    await clic('.indietro'); await page.locator('.ric-ing').waitFor({ timeout: 3000 });
    // note mie sulla ricetta: si salvano e si vedono nella cucina guidata
    await page.fill('#ric-nota', 'Metà zucchero'); await page.waitForTimeout(100);
    if (await page.evaluate(() => notaRic('gz:Seadas-sebadas')) !== 'Metà zucchero') throw new Error('la nota non si salva');
    await clic('[data-a="ric-play"]'); await page.locator('.ric-passo').waitFor({ timeout: 3000 });
    if (!(await page.locator('.avviso', { hasText: 'Metà zucchero' }).count())) throw new Error('la nota non si vede nella cucina guidata');
    await clic('.indietro'); await page.locator('.ric-ing').waitFor({ timeout: 3000 });
    // metti nel menù: dalla ricetta al piatto nuovo, collegato alla ricetta
    await page.evaluate(() => vai('ricetta:gz:Seadas-sebadas')); await clic('[data-a="ric-menu"]');
    if ((await page.inputValue('#nuovo-nome')) !== 'Seadas') throw new Error('«Metti nel menù» non scrive il nome del piatto');
    await clic('[data-a="nuovo-avanti"]'); await clic('[data-a="nuovo-cat"][data-v="dolci"]'); await page.waitForTimeout(150);
    if (await page.locator('[data-a="nuovo-modo"]').count()) { await clic('[data-a="nuovo-modo"][data-v="pz"]'); await page.waitForTimeout(150); }
    await page.fill('[data-nuovo-prezzo]', '3'); await clic('[data-a="nuovo-crea"]'); await page.waitForTimeout(200);
    if (!(await page.evaluate(() => S.piatti.some(p => p.ricetta === 'gz:Seadas-sebadas')))) throw new Error('il piatto non è collegato alla ricetta');
    if (!(await page.locator('[data-v="ricetta:gz:Seadas-sebadas"]').count())) throw new Error('nella scheda del piatto manca «Apri la ricetta»');
    await page.evaluate(() => { S.piatti = S.piatti.filter(p => p.ricetta !== 'gz:Seadas-sebadas'); salva(); });
    // 📥 scarica: tre ricette finte dal catalogo finiscono nella memoria grande e si aprono senza rete
    const scar = await page.evaluate(async () => {
      const c0 = RIC.chiedi; scriviRic('pit-ric-auto', false); await dbRic('readwrite', st => st.clear()); RIC.scaricate = {};
      RIC.chiedi = async c => ({ ricetta: { id: 'gz:' + c.u.replace(URL_GZ, '').replace('.html', ''), nome: 'Scaricata ' + c.u.slice(-8), porzioni: 4, ingredienti: [{ nome: 'Farina', q: 100, u: 'g' }], passi: [{ t: 'Impasta.', foto: [] }], foto: '' } });
      await scaricaTante(['gz:Prova-a', 'gz:Prova-b', 'gz:Prova-c'], 'prova');
      RIC.chiedi = async () => { throw new Error('senza rete'); };
      const n = Object.keys(RIC.scaricate).length; RIC.scaricate = {}; RIC.dbLetto = false; ricetta('gz:x');
      await new Promise(ok => setTimeout(ok, 400));
      const dopo = Object.keys(RIC.scaricate).length; RIC.chiedi = c0;
      return { n, dopo, apre: !!ricetta('gz:Prova-b') };
    });
    if (scar.n !== 3 || scar.dopo !== 3 || !scar.apre) throw new Error('«Scarica» non tiene le ricette sul telefono: ' + JSON.stringify(scar));
    await page.evaluate(() => { vai('ricdb'); });
    if (await page.locator('.ricdb-scaricate li').count() !== 3) throw new Error('la pagina Database non elenca le 3 scaricate');
    if (!(await page.locator('.scheda h2', { hasText: 'Sul telefono: 3 ricette' }).count())) throw new Error('la pagina Database non conta le scaricate');
    await page.evaluate(async () => { await dbRic('readwrite', st => st.clear()); RIC.scaricate = {}; scriviRic('pit-ric-auto', true); UI.ric = { q: '', zona: 'tutte', cat: '' }; });
    // 💾 copia di sicurezza: si salva un file e riprenderlo rimette note e preferite
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.evaluate(() => { UI.ric = { q: '', zona: 'tutte', cat: '' }; vai('ricdb'); A['ric-copia-salva'](); })]);
    const copia = JSON.parse(require('fs').readFileSync(await dl.path(), 'utf8'));
    if (copia.tipo !== 'pronti-ricettario' || !copia.preferite.includes('gz:Seadas-sebadas')) throw new Error('la copia non contiene le preferite');
    await page.evaluate(() => { scriviRic('pit-ric-pref', []); render(); });
    await page.setInputFiles('#ric-copia-file', { name: 'copia.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(copia)) }); await page.waitForTimeout(300);
    if (!(await page.evaluate(() => preferiteRic().includes('gz:Seadas-sebadas')))) throw new Error('riprendere la copia non rimette le preferite');
    // la ricetta appena aperta resta sul telefono (copia per il «senza rete»)
    if (!(await page.evaluate(() => !!cacheRic()['gz:Seadas-sebadas']))) throw new Error('la ricetta aperta non resta sul telefono');
    await page.evaluate(() => { UI.ric = { q: '', zona: 'tutte', cat: '' }; vai('ricettario'); });
    // senza rete: la preferita si riapre dalla copia sul telefono
    await page.evaluate(() => { RIC.chiedi = async () => { throw new Error('senza rete'); }; vai('ricetta:gz:Seadas-sebadas'); });
    await page.locator('.ric-ing').waitFor({ timeout: 3000 });
    // mani libere: il comando detto «avanti» porta al passo dopo
    await page.evaluate(() => { vai('cucina:gz:Seadas-sebadas'); UI.cucina.passo = 0; UI.cucina.voce = false; comandoCucina('avanti'); });
    if (await page.evaluate(() => UI.cucina.passo) !== 1) throw new Error('il comando «avanti» non va al passo dopo');
    if (await page.evaluate(() => document.querySelector('main.corpo').classList.contains('entra'))) throw new Error('cucina guidata con l\'animazione d\'entrata: col telefono occupato dalla voce la pagina resta vuota');
    await page.evaluate(() => { comandoCucina('stop'); vai('ricettario'); });
    // ispirate ai piatti di Monica
    await page.evaluate(() => { try { localStorage.removeItem('pit-ric-ispira'); } catch (e) { /* niente */ }
      RIC.chiedi = async c => ({ ricette: [{ url: 'https://ricette.giallozafferano.it/Prova-' + c.cerca.replace(/\W+/g, '-') + '.html', nome: 'Simile a ' + c.cerca, foto: '' }] });
      UI.ric = { q: '', zona: 'tutte', cat: '' }; render(); });
    await page.locator('.ric-scorri .ric-carta').first().waitFor({ timeout: 3000 });
    await foto('33-ispirate');
    // ricetta mia
    await page.evaluate(() => vai('ricmia:nuova')); await page.locator('.ric-modulo').waitFor({ timeout: 3000 });
    await page.fill('[data-ric="nome"]', 'Malloreddus di nonna'); await page.fill('[data-ric="ingredienti"]', 'Semola 300 g\nAcqua 150 ml'); await page.fill('[data-ric="passi"]', 'Impasta 10 minuti.');
    await clic('[data-a="ric-mia-salva"]'); await page.locator('.ric-ing').waitFor({ timeout: 3000 });
    if (!(await page.evaluate(() => mieRic().length === 1))) throw new Error('la ricetta mia non si salva');
    // C68: la ricetta scritta va anche sul server (così la vede Monica); senza rete parte al giro dopo
    const sync = await page.evaluate(async () => {
      const prima = RIC.chiedi, chiesti = [];
      RIC.chiedi = async c => { chiesti.push(c.db); return c.db === 'salvaMia' ? { ok: true } : c.db === 'mieScritte' ? { mie: [] } : prima(c); };
      const m = mieRic()[0]; m.suServer = false; scriviRic('pit-ric-mie', [m]); sincronizzaMie(); await new Promise(ok => setTimeout(ok, 300));
      RIC.chiedi = prima; return { chiesti, su: mieRic()[0].suServer };
    });
    if (!sync.chiesti.includes('salvaMia') || sync.su !== true) throw new Error('la ricetta scritta non va sul server: ' + JSON.stringify(sync));
    await page.evaluate(() => vai('home'));
  });
  await passo('sito vero: i file separati (come online) si aprono senza errori, nessuna funzione chiamata prima di caricarla (PT E23)', async () => {
    require('child_process').execFileSync('python3', ['-I', path.resolve(__dirname, 'sito.py')], { stdio: 'ignore' });
    const radice = path.resolve(__dirname, '../sito'), http = require('http');
    const tipi = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
    const srv = http.createServer((q, r) => { const f = path.join(radice, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
      if (!f.startsWith(radice) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
      r.writeHead(200, { 'content-type': tipi[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
    await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
    const p2 = await page.context().newPage(), sbagli = [];
    p2.on('pageerror', e => sbagli.push(e.message));
    await p2.route(/firebase|googleapis|gstatic/, r => r.abort());   // senza rete verso Firebase: conta solo il nostro codice
    await p2.goto(`http://127.0.0.1:${srv.address().port}/`); await p2.waitForTimeout(3000);
    await p2.close(); srv.close();
    const nostri = sbagli.filter(m => /is not defined|is not a function|Cannot read/.test(m));
    if (nostri.length) throw new Error('errori nel sito vero: ' + [...new Set(nostri)].join(' · '));
  });
  await passo('ricettario (C61): ▶️ in cima, il motore propone, «➕ Aggiungi» con l\'ok, niente doppioni, «Togli»', async () => {
    await page.evaluate(() => {
      RIC._c2 = RIC.chiedi; RIC.server = []; RIC.domande = [];
      RIC.chiedi = async c => {
        RIC.domande.push(c);
        if (c.db === 'aggiungi') { if (!RIC.server.some(x => x.id === c.r.id)) RIC.server.unshift(c.r); return { scelte: RIC.server.slice() }; }
        if (c.db === 'togli') { RIC.server = RIC.server.filter(x => x.id !== c.id); return { scelte: RIC.server.slice() }; }
        if (c.db === 'mie') return { scelte: RIC.server.slice() };
        if (c.db) return { db: { ricette: 3, coda: 0, voci: 0, mbVoci: 0, oggi: 3, pausa: false, scelte: RIC.server.length } };
        if (c.cat === 'nuove') return { ricette: [{ url: 'https://ricette.giallozafferano.it/Nuova-prova.html', nome: 'Nuova prova', foto: '', video: true }], prossima: '' };
        return { ricetta: { id: 'gz:Nuova-prova', url: 'https://ricette.giallozafferano.it/Nuova-prova.html', nome: 'Nuova prova', categoria: 'Primi piatti', porzioni: 4, ingredienti: [{ nome: 'Farina', q: 100, u: 'g' }], passi: [{ t: 'Impasta.', foto: [] }], foto: '' } };
      };
      RIC.scelteOra = 0; UI.ric = { q: '', zona: 'tutte', cat: '' }; RIC.cerca = { q: '', stato: '', risultati: [] }; vai('ricettario');
    });
    await clic('[data-a="ric-catalogo"][data-v="nuove"]'); await page.locator('#ric-risultati h2', { hasText: 'Ricette nuove per te' }).waitFor({ timeout: 3000 });
    if (!(await page.evaluate(() => (RIC.domande.find(c => c.cat === 'nuove').fuori || []).length === elencoRic().length))) throw new Error('il motore non sa quali ricette hai già');
    await page.locator('#ric-risultati .ric-carta').first().click(); await page.locator('.ric-ing').waitFor({ timeout: 3000 });
    if (!(await page.evaluate(() => { const p = document.querySelector('main.corpo').firstElementChild; return p && p.classList.contains('ric-play') && /Ascolta la ricetta passo passo/.test(p.textContent); }))) throw new Error('il ▶️ non è la prima cosa della ricetta');
    await foto('41-ricetta-nuova');
    await clic('[data-a="ric-aggiungi"]'); await page.waitForTimeout(300);
    if (!(await page.evaluate(() => nelRicettario('gz:Nuova-prova') && RIC.server.length === 1))) throw new Error('«Aggiungi» non la mette nel ricettario');
    if (await page.locator('[data-a="ric-aggiungi"]').count()) throw new Error('«Aggiungi» resta dopo averla aggiunta');
    await page.evaluate(() => A['ric-aggiungi']({ dataset: { v: 'gz:Nuova-prova' } })); await page.waitForTimeout(200);
    if (await page.evaluate(() => RIC.server.length !== 1 || RIC.scelte.length !== 1)) throw new Error('doppione nel ricettario');
    await page.evaluate(() => { UI.ric = { q: '', zona: 'tutte', cat: '' }; RIC.cerca = { q: '', stato: '', risultati: [] }; vai('ricettario'); });
    if (!(await page.locator('.ric-elenco .ric-carta', { hasText: 'Nuova prova' }).count())) throw new Error('la ricetta aggiunta non è nell\'elenco');
    await page.evaluate(() => vai('ricetta:gz:Nuova-prova')); await clic('[data-a="ric-togli"]');
    if (await page.evaluate(() => nelRicettario('gz:Nuova-prova') || RIC.server.length)) throw new Error('«Togli» non la toglie');
    await page.evaluate(() => { RIC.chiedi = RIC._c2; try { localStorage.removeItem('pit-ric-scelte'); } catch (e) { /* niente */ } RIC.scelte = []; vai('home'); });
  });
  await passo('ricettario (C69): filtri tempo e facili, ricerca per ingredienti, ordina, numero, «Azzera», filtri ricordati', async () => {   // autonomo
    await page.evaluate(() => {
      window.__primaC69 = [P.ruolo, UI.devCliente, P.guida, P.homeNo, S.impostazioni.ricettario]; P.ruolo = 'monica'; P.guida = true; P.homeNo = true; UI.devCliente = false; UI.foglio = null; UI.modifica = null; S.impostazioni.ricettario = true;
      const ora = Date.now(), ss = [
        { id: 'gz:Pasta-veloce-prova', nome: 'Pasta veloce prova', zona: 'italiana', categoria: '', foto: '', aggiunta: ora, totale: 20, difficolta: 'Facile', cerca: 'pasta zucchine uova' },
        { id: 'gz:Arrosto-lungo-prova', nome: 'Arrosto lungo prova', zona: 'italiana', categoria: '', foto: '', aggiunta: ora - 1000, totale: 120, difficolta: 'Media', cerca: 'maiale patate' },
        { id: 'gz:Zuppa-media-prova', nome: 'Zuppa media prova', zona: 'italiana', categoria: '', foto: '', aggiunta: ora - 2000, totale: 50, difficolta: 'Facile', cerca: 'ceci zucchine' }];
      RIC.chiedi = async c => c.db === 'mie' ? { scelte: ss } : c.db ? { db: { ricette: 3, coda: 0, voci: 0, mbVoci: 0, oggi: 0, pausa: false, scelte: 3 } } : { ricette: [], prossima: '' };
      salvaScelte(ss); localStorage.removeItem('pit-ric-filtri'); UI.ric = null; RIC.cerca = { stato: '', risultati: [] }; UI.vista = 'ricettario'; render();
    });
    await page.waitForFunction(() => RIC.stato === 'pronto', null, { timeout: 30000 }); await page.evaluate(() => render());
    const elenco = () => page.locator('main .ric-elenco').last().innerText();
    if (await page.locator('[data-a="ric-tempo"]').count()) throw new Error('«Più filtri» aperto da solo: spinge giù l\'elenco');
    await clic('[data-a="ric-piu"]'); await clic('[data-a="ric-tempo"][data-v="30"]');
    let t = await elenco(); if (!/Pasta veloce prova/.test(t) || /Arrosto lungo prova|Zuppa media prova/.test(t)) throw new Error('«Fino a 30 min» sbagliato');
    if ((await page.evaluate(() => JSON.parse(localStorage.getItem('pit-ric-filtri')).tempo)) !== 30) throw new Error('filtro non ricordato');
    await clic('[data-a="ric-tempo"][data-v="60"]'); await clic('[data-a="ric-diff"][data-v="facile"]');
    t = await elenco(); if (!/Pasta veloce prova/.test(t) || !/Zuppa media prova/.test(t) || /Arrosto lungo prova/.test(t)) throw new Error('«1 ora» + «Facili» sbagliato');
    await clic('[data-a="ric-ordine"][data-v="veloci"]');
    const nomi = await page.locator('main .ric-elenco').last().innerText(); if (nomi.indexOf('Pasta veloce prova') > nomi.indexOf('Zuppa media prova')) throw new Error('«Più veloci» non ordina');
    if (!/^2 ricette/.test(await page.locator('.ric-conta').innerText())) throw new Error('numero dei risultati sbagliato: ' + await page.locator('.ric-conta').innerText());
    await foto('19-ricettario-filtri');
    await clic('.ric-conta [data-a="ric-pulisci"]');
    const dopo = await page.evaluate(() => [UI.ric.tempo, UI.ric.diff, JSON.parse(localStorage.getItem('pit-ric-filtri')).tempo]);
    if (dopo[0] || dopo[1] || dopo[2]) throw new Error('«Azzera» non azzera: ' + JSON.stringify(dopo));
    await page.evaluate(() => { UI.ric.q = 'zucchine ceci'; render(); });
    t = await elenco(); if (!/Zuppa media prova/.test(t) || /Pasta veloce prova/.test(t)) throw new Error('ricerca per 2 ingredienti sbagliata');
    await page.evaluate(() => { UI.ric = null; localStorage.removeItem('pit-ric-filtri'); salvaScelte([]); [P.ruolo, UI.devCliente, P.guida, P.homeNo, S.impostazioni.ricettario] = window.__primaC69; });
    // C72 passi come su GialloZafferano: numerini sulla frase, niente numerini nella voce e nel timer
    const ch = await page.evaluate(() => [passoHtml('Tritate la cipolla [[1]]. Cuocete per 20 minuti [[2]].'), testoVoce('Tritate la cipolla [[1]]. Cuocete per 20 minuti [[2]].'), minutiPasso('Rosolate [[3]]. Cuocete 15 minuti [[4]].')]);
    if (!/cipolla <span class="nw"><span class="num-step">1<\/span>\.<\/span>/.test(ch[0]) || ch[1] !== 'Tritate la cipolla. Cuocete per 20 minuti.' || ch[2] !== 15) throw new Error('passi come GZ sbagliati: ' + JSON.stringify(ch));
  });
  await passo('tasti: nessun nome di azione (data-a) definito due volte (PT E51)', async () => {   // statico: il secondo cancellava il primo in silenzio («Altre ▾» e «Carica altre ricette»)
    const radice = path.resolve(__dirname, '..'), v = {};
    for (const f of fs.readdirSync(radice).filter(f => /\.js$/.test(f) && !['sw.js', 'worker.js'].includes(f))) {
      const t = fs.readFileSync(path.join(radice, f), 'utf8'), re = /^\s*'([a-z][\w-]*)'\s*\([^)]*\)\s*\{/gm; let m;
      while ((m = re.exec(t))) (v[m[1]] = v[m[1]] || []).push(f + ':' + t.slice(0, m.index).split('\n').length);
    }
    const doppi = Object.entries(v).filter(([, l]) => l.length > 1);
    if (doppi.length) throw new Error('azioni con lo stesso nome (la seconda cancella la prima): ' + JSON.stringify(doppi));
  });
  await passo('anteprima di prova senza i dati veri di Monica', async () => {
    const html = fs.readFileSync(FILE.replace('file://', ''), 'utf8');
    if (/pronti-in-tavola\.firebaseapp\.com|AIza[\w-]{30,}/.test(html)) throw new Error('la configurazione vera di Firebase è dentro l\'anteprima');
    if (!/const FIREBASE_CONFIG = null;/.test(html)) throw new Error('FIREBASE_CONFIG non è null nell\'anteprima');
  });
  await passo('anteprima del link su WhatsApp', async () => {
    const radice = path.resolve(__dirname, '..');
    const html = fs.readFileSync(path.join(radice, 'index.html'), 'utf8');
    const og = n => (html.match(new RegExp(`<meta property="og:${n}" content="([^"]*)">`)) || [])[1] || '';
    const indirizzo = (fs.readFileSync(path.join(radice, 'data.js'), 'utf8').match(/indirizzoApp:\s*'([^']+)'/) || [])[1];
    for (const n of ['title', 'description', 'url', 'image']) if (!og(n)) throw new Error('manca og:' + n);
    if (og('description').length > 80) throw new Error('og:description oltre 80 lettere');
    if (og('url') !== indirizzo) throw new Error(`og:url ${og('url')} diverso da indirizzoApp ${indirizzo}`);
    if (!og('image').startsWith(indirizzo + 'media/')) throw new Error('og:image non è sull\'indirizzo dell\'app');
    const img = path.join(radice, og('image').slice(indirizzo.length));
    if (!fs.existsSync(img)) throw new Error('manca il file ' + path.relative(radice, img));
    if (fs.statSync(img).size >= 300 * 1024) throw new Error('immagine oltre 300 KB');
  });
  await passo('C119 migliora con l\'AI le foto a strisce ingrandite', async () => {   // autonoma: AI finta (quella vera si prova dal sito pubblicato)
    const r = await page.evaluate(async () => {
      const vera = window.FotoAI, chiamate = [], aspetta = ms => new Promise(f => setTimeout(f, ms));
      const grande = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="880" height="680"><rect width="880" height="680" fill="orange"/></svg>');
      let auto = false, rompi = '';
      window.FotoAI = { gia: async () => null, auto: () => auto, migliora: async (u, n, j, passo) => { chiamate.push(j); passo('✨ Miglioro la foto… (pochi secondi)'); await aspetta(150); if (rompi) throw new Error(rompi); return grande; } };
      const svg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><rect width="300" height="80" fill="gray"/></svg>');
      const d = document.createElement('div'); d.id = 'prova-ai'; d.style.width = '330px';
      d.innerHTML = fotoPasso({ t: 'Uno [[1]], due [[2]], tre [[3]].', foto: [svg] }) + fotoPasso({ t: 'Sola.', foto: [svg + '#a_9.jpg'] });
      document.body.appendChild(d);
      const out = {};
      try {
        d.querySelectorAll('img')[1].click();
        const tasto = () => document.querySelector('.ric-zoom-ai');
        out.tasto = tasto() && tasto().textContent;
        tasto().click(); await aspetta(20); out.lavora = tasto() && tasto().textContent;
        await aspetta(250);
        out.fatta = !!document.querySelector('.ric-zoom img.ric-zoom-grande') && !document.querySelector('.ric-zoom-taglio') && (document.querySelector('.ric-zoom-ai-ok') || {}).textContent;
        document.querySelector('.ric-zoom-s').click(); out.dopo = tasto() && tasto().textContent;   // la foto dopo: non ancora migliorata
        rompi = 'manca la rete'; tasto().click(); await aspetta(250); out.errore = tasto() && tasto().textContent;
        rompi = ''; auto = true; document.querySelector('.ric-zoom-p').click(); document.querySelector('.ric-zoom-p').click(); await aspetta(250);   // dopo il primo uso: da sola
        out.auto = chiamate.join() + '|' + !!document.querySelector('.ric-zoom img.ric-zoom-grande');
        document.querySelector('.ric-zoom-s').click(); document.querySelector('.ric-zoom-s').click(); document.querySelector('.ric-zoom-s').click();
        out.singola = document.querySelector('.ric-zoom-n').textContent + '|' + !!tasto();   // foto normale: niente tasto
        document.querySelector('.ric-zoom-x').click();
      } finally { window.FotoAI = vera; d.remove(); }
      return out;
    });
    const atteso = { tasto: '✨ Migliora con l\'AI', lavora: '✨ Miglioro la foto… (pochi secondi)', fatta: '✨ Migliorata con l\'AI', dopo: '✨ Migliora con l\'AI', errore: '✨ Non è riuscito: manca la rete. Tocca per riprovare', auto: '1,2,0|true', singola: '4 / 4|false' };
    for (const k of Object.keys(atteso)) if (r[k] !== atteso[k]) throw new Error(k + ': ' + JSON.stringify(r[k]) + ' invece di ' + JSON.stringify(atteso[k]));
  });
  await passo('foto a strisce delle ricette vecchie: tagliate una per numerino', async () => {   // autonoma
    const r = await page.evaluate(() => {
      const svg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><rect width="100" height="80" fill="red"/><rect x="100" width="100" height="80" fill="lime"/><rect x="200" width="100" height="80" fill="blue"/></svg>');
      const d = document.createElement('div'); d.id = 'prova-strisce'; d.style.width = '330px';
      d.innerHTML = fotoPasso({ t: 'Uno [[1]], due [[2]], tre [[3]].', foto: [svg] });
      document.body.appendChild(d);
      return [...d.querySelectorAll('.ric-striscia')].map(f => f.querySelector('.num-step').textContent);
    });
    if (r.join() !== '1,2,3') throw new Error('riquadri: ' + r.join());
    await page.waitForTimeout(300);
    await page.locator('#prova-strisce').screenshot({ path: OUT + '/strisce.png' });   // controllo a occhio: rosso, verde, blu
    const tx = await page.evaluate(() => [...document.querySelectorAll('#prova-strisce img')].map(i => i.style.transform));
    if (tx.join('|') !== 'translateX(0%)|translateX(-33.3333%)|translateX(-66.6667%)') throw new Error('tagli: ' + tx.join('|'));
    // (C114, foto di Mario 09/11 «se clicchi sono unite») ingrandita: UNA foto della striscia, non tutte e tre
    await page.locator('#prova-strisce img').nth(1).dispatchEvent('click');
    const z1 = await page.evaluate(() => { const i = document.querySelector('.ric-zoom-taglio img'); return [i && i.style.transform, document.querySelector('.ric-zoom-n').textContent]; });
    await page.locator('.ric-zoom-s').click();
    const z2 = await page.evaluate(() => { const i = document.querySelector('.ric-zoom-taglio img'); return [i && i.style.transform, document.querySelector('.ric-zoom-n').textContent]; });
    await page.locator('.ric-zoom-x').click();
    if (z1.join('|') !== 'translateX(-33.3333%)|2 / 3' || z2.join('|') !== 'translateX(-66.6667%)|3 / 3') throw new Error('foto a strisce ingrandite tutte insieme: ' + z1 + ' · ' + z2);
    // i numeri dal nome della foto (GZ): striscia «strip_4-6» anche se la frase salta un numero; foto singole «_27» anche senza numerino nella frase
    const daNome = await page.evaluate(() => {
      const d = document.getElementById('prova-strisce'), svg = d.querySelector('img').getAttribute('src').split('#')[0];
      d.innerHTML = fotoPasso({ t: 'Uno [[4]], tre [[6]].', foto: [svg + '#x_strip_4-6.jpg'] }) + fotoPasso({ t: 'Dischi [[25]] e teglia [[26]].', foto: ['a_25.jpg', 'a_26.jpg', 'a_27.jpg'].map(n => svg + '#' + n) });
      return [...d.querySelectorAll('.num-step')].map(x => x.textContent).join();
    });
    if (daNome !== '4,5,6,25,26,27') throw new Error('numeri dal nome della foto: ' + daNome);
    await page.evaluate(() => document.getElementById('prova-strisce').remove());
  });
  await passo('ricettario (C84): Indietro e gesto tornano allo stesso punto dell\'elenco; tasto fisso «🗄 Database» ↔ «⬆ Ricette»', async () => {   // autonoma
    await page.evaluate(() => { P.ruolo = 'monica'; S.impostazioni.ricettario = true; UI.foglio = null; RIC.voceAutoFatto = true;
      RIC.chiedi = async c => c.cerca ? { ricette: [] } : c.db ? { db: null } : { ricetta: null }; vai('home'); vai('ricettario'); });
    await page.locator('.ric-elenco .ric-carta').nth(20).waitFor({ timeout: 8000 });
    // 1) scendo nell'elenco, apro una ricetta, Indietro → stesso punto
    await page.evaluate(() => window.scrollTo(0, 2500)); await page.waitForTimeout(300);
    const y0 = await page.evaluate(() => window.scrollY); if (y0 < 2000) throw new Error('elenco troppo corto: ' + y0);
    const carta = await page.evaluate(() => { const c = [...document.querySelectorAll('.ric-elenco .ric-carta')].find(b => { const r = b.getBoundingClientRect(); return r.top > 80 && r.bottom < innerHeight - 100; }); return c && c.dataset.v; });
    if (!carta) throw new Error('nessuna ricetta visibile a metà elenco');
    await clic(`.ric-carta[data-v="${carta}"]`); await page.waitForTimeout(400);
    if (await page.evaluate(() => UI.vista) !== carta) throw new Error('non si apre la ricetta: ' + await page.evaluate(() => UI.vista));
    await page.evaluate(() => window.scrollTo(0, 600));   // dentro la ricetta scorro (come Mario quando modifica)
    await clic('#app .testata .indietro'); await page.waitForTimeout(1100);
    let y1 = await page.evaluate(() => [UI.vista, window.scrollY]);
    if (y1[0] !== 'ricettario' || Math.abs(y1[1] - y0) > 40) throw new Error(`con «Indietro» torna a ${y1[1]} invece di ${y0} (${y1[0]})`);
    // 2) stessa cosa col gesto del telefono
    await clic(`.ric-carta[data-v="${carta}"]`); await page.waitForTimeout(400);
    await page.goBack(); await page.waitForTimeout(1100);
    y1 = await page.evaluate(() => [UI.vista, window.scrollY]);
    if (y1[0] !== 'ricettario' || Math.abs(y1[1] - y0) > 40) throw new Error(`col gesto torna a ${y1[1]} invece di ${y0} (${y1[0]})`);
    // 3) dalla Home si entra in cima (si torna indietro solo con Indietro)
    await page.evaluate(() => { vai('home'); vai('ricettario'); }); await page.waitForTimeout(300);
    if (await page.evaluate(() => window.scrollY) > 40) throw new Error('entrando dalla Home non parte dall\'alto');
    // 4) tasto fisso: porta al database, poi «⬆ Ricette» riporta su
    const b = page.locator('.ric-salta'); if (await b.textContent() !== '🗄 Database') throw new Error('tasto: ' + await b.textContent());
    if (!(await b.isVisible())) throw new Error('il tasto «🗄 Database» non si vede');
    await foto('84-tasto-database');
    await b.click(); await page.waitForTimeout(1500);
    const top = await page.evaluate(() => document.querySelector('.ric-db-box').getBoundingClientRect().top);
    if (top < -5 || top > 120) throw new Error('il tasto non porta al riquadro del database: ' + Math.round(top));
    if (await b.textContent() !== '⬆ Ricette') throw new Error('al database il tasto dice: ' + await b.textContent());
    await foto('84-tasto-ricette');
    await b.click(); await page.waitForTimeout(1500);
    if (await page.evaluate(() => window.scrollY) > 5) throw new Error('«⬆ Ricette» non riporta in cima');
    if (await b.textContent() !== '🗄 Database') throw new Error('in cima il tasto dice: ' + await b.textContent());
    await page.evaluate(() => vai('home'));
  });
  await passo('cliente: invito «Installa l\'app» all\'ingresso, scelta iPhone | Android, notifiche (Mario 08/11 «fallo subito»)', async () => {   // autonoma
    await page.evaluate(() => { P.ruolo = 'cliente'; P.benvenuto = true; P.installata = false; UI.foglio = null; UI.invitoFatto = false; UI.invitoProva = true; vai('menu'); });
    await page.waitForSelector('.foglio .inv-scelta', { timeout: 3000 });
    if (await page.locator('.inv-tel.mio').getAttribute('data-v') !== 'android') throw new Error('su Pixel deve essere segnato Android');
    await page.waitForTimeout(800); await foto('94-invito-installa');
    await page.click('.inv-tel[data-v="ios"]'); await page.waitForTimeout(300);
    if (await page.locator('.foglio .gf-fig').count() < 3) throw new Error('iPhone: mancano le figure');
    await foto('94-invito-iphone');
    await page.click('.foglio [data-a="inv-os"][data-v=""]'); await page.click('.inv-tel[data-v="android"]'); await page.waitForTimeout(300);
    if (!await page.locator('.foglio .gi-passi, .foglio [data-a="installa"]').count()) throw new Error('Android: niente passi né tasto Installa');
    await page.click('.foglio .piede [data-a="chiudi"]'); await page.waitForTimeout(500);
    await page.evaluate(() => render()); await page.waitForTimeout(300);
    if (await page.locator('.foglio').count()) throw new Error('«Più tardi» non chiude, o il foglio torna nella stessa apertura');
    const dopo = await page.evaluate(() => { UI.invitoFatto = false; const a = serveInvito(); P.invitoDopo = 0; UI.invitoFatto = false; const b = serveInvito(); return [a, b]; });
    if (dopo[0] || !dopo[1]) throw new Error('«Più tardi» deve rimandare a domani (e non oltre): ' + JSON.stringify(dopo));
    await page.evaluate(() => { UI.invitoProva = false; });
  });
  await passo('cliente non ancora approvato: «Attiva le notifiche» non va in giro continuo (C96, foto di Mario 08/11)', async () => {   // autonoma
    await page.context().grantPermissions(['notifications']);
    const r = await page.evaluate(async () => { const c = P.cliente; P.cliente = null; P.vuoleAvvisi = false; P.avvisiCliente = false;
      await attivaAvvisiCliente(); const out = [P.vuoleAvvisi, notifPossibili(), UI.notEsito && UI.notEsito.t];
      P.cliente = c; P.vuoleAvvisi = false; UI.notEsito = null; return out; });
    if (!r[0]) throw new Error('il sì alle notifiche non viene ricordato: ' + r[2]);
    if (r[1]) throw new Error('dopo il sì il foglio delle notifiche si riproporrebbe');
    if (!/appena Monica ti conferma/.test(r[2] || '')) throw new Error('messaggio sbagliato: ' + r[2]);
  });
  await passo('«Attiva le notifiche» (foto di Mario 09/11, iPad): esito in un riquadro verde grande, il foglio si chiude da solo', async () => {   // autonoma
    await page.context().grantPermissions(['notifications']);
    await page.evaluate(() => { P.ruolo = 'cliente'; P.benvenuto = true; P.installata = true; P.vuoleAvvisi = false; P.avvisiCliente = false; UI.foglio = { tipo: 'installa', os: null }; UI.notEsito = null; render(); });
    await page.waitForSelector('.foglio [data-a="avvisi-cliente"]', { timeout: 3000 });
    await page.evaluate(async () => { const c = P.cliente; P.cliente = null; await attivaAvvisiCliente(); P.cliente = c; });
    await page.waitForSelector('.foglio .avviso.verde', { timeout: 3000 });
    const t = await page.locator('.foglio .avviso.verde').innerText();
    if (!/Notifiche attive!/.test(t)) throw new Error('manca il riquadro verde «Notifiche attive!»: ' + t.slice(0, 80));
    await foto('96-notifiche-attive');
    await page.waitForTimeout(3400);
    if (await page.locator('.foglio').count()) throw new Error('il foglio non si chiude da solo dopo l\'esito');
    await page.evaluate(() => { P.installata = false; P.vuoleAvvisi = false; UI.notEsito = null; });
  });
  await passo('gestore: ultimi avvisi mandati in Notifiche (C97, Mario 08/11 «non mi è arrivata nessuna notifica»)', async () => {   // autonoma
    const r = await page.evaluate(() => {
      const ora = new Date().toISOString(), prima = [UI.diarioAvvisi, UI.diarioChiesto];
      UI.diarioChiesto = true;
      UI.diarioAvvisi = { questo: false, ultimi: [{ quando: ora, per: 'richiesta', telefoni: 2, esiti: ['201', '201'] }, { quando: ora, per: 'ordine', telefoni: 0, esiti: [], fermo: 'pausa' }, { quando: ora, per: 'primo', telefoni: 2, esiti: ['201', '410 '] }] };
      const h = diarioAvvisi(); UI.diarioAvvisi = { errore: true }; const err = diarioAvvisi();
      [UI.diarioAvvisi, UI.diarioChiesto] = prima; return [h, err];
    });
    for (const t of ['NON conosce questo telefono', 'Persona nuova da accettare · ✅ 2 telefoni', 'non partito (appena dopo un altro)', '⚠️ 1 su 2 telefoni', 'oggi '])
      if (!r[0].includes(t)) throw new Error('manca «' + t + '» negli ultimi avvisi');
    if (r[0].indexOf('primo ordine') > r[0].indexOf('da accettare')) throw new Error('gli avvisi non sono dal più nuovo');
    if (!/non riesco a leggerli/.test(r[1])) throw new Error('senza rete manca il messaggio');
  });
  await passo('cliente in attesa: codice e «Ricorda a Monica»; Monica vede il codice o «Nessuno in attesa» (C97, Mario 08/11 «come se si fosse persa»)', async () => {   // autonoma
    const r = await page.evaluate(() => {
      const prima = [P.ricordatoIl, UI.ricordoAuto]; P.ricordatoIl = Date.now(); UI.ricordoAuto = true;
      const h = righeAttesa();
      const sp = Dati.io.uid; const cod = codiceTel('abcd1234');
      [P.ricordatoIl, UI.ricordoAuto] = prima; return [h, cod];
    });
    if (!/Ricorda a Monica/.test(r[0]) || !/codice <b>/.test(r[0])) throw new Error('manca il codice o il tasto: ' + r[0].slice(0, 200));
    if (r[1] !== 'ABCD') throw new Error('codice sbagliato: ' + r[1]);
    await page.evaluate(() => { P.ruolo = 'monica'; UI.vista = 'clienti'; UI.foglio = null; render(); });
    const t = await page.locator('main').innerText();
    const n = await page.evaluate(() => S.richieste.length);
    if (!n && !/Nessuno in attesa/.test(t)) throw new Error('senza richieste manca «Nessuno in attesa»');
    if (n && !/codice /.test(t)) throw new Error('nelle richieste manca il codice');
    await page.evaluate(() => { P.ruolo = 'cliente'; UI.vista = 'menu'; render(); });
  });
  await passo('cliente senza nome («Guarda il menù»): avviso «Monica non sa che ci sei» e notifiche → prima il nome (C97, Mario 09/11)', async () => {   // autonoma
    await page.context().grantPermissions(['notifications']);
    const r = await page.evaluate(async () => {
      const io = Dati.io, prima = [Dati.attivo, io.utente, io.letto, io.gestore, P.ruolo, UI.senzaNome, P.vuoleAvvisi, P.cliente, io.uid];
      const ripristina = () => { [Dati.attivo, io.utente, io.letto, io.gestore, P.ruolo, UI.senzaNome, P.vuoleAvvisi, P.cliente, io.uid] = prima; };
      try {
        Object.defineProperty(Dati, 'attivo', { value: true, configurable: true, writable: true });
        io.utente = null; io.letto = true; io.gestore = false; io.uid = 'prova123'; P.ruolo = 'cliente'; UI.senzaNome = true; P.cliente = null;
        const banner = avvisoSenzaNome(), menu = primiPassi();
        UI.invitoProva = true; UI.invitoFatto = false; UI.foglio = null; const invito = serveInvito(); UI.invitoProva = false;
        await attivaAvvisiCliente();
        return [banner, menu, UI.senzaNome, P.vuoleAvvisi, serveBenvenuto(), invito];
      } finally { ripristina(); UI.notEsito = null; render(); }
    });
    if (!/Monica non sa ancora che ci sei/.test(r[0])) throw new Error('manca l\'avviso senza nome');
    if (!/Monica non sa ancora/.test(r[1])) throw new Error('l\'avviso non è in cima al menù');
    if (r[2] !== false || !r[3]) throw new Error('le notifiche non portano al nome: ' + JSON.stringify(r.slice(2)));
    if (!r[4]) throw new Error('dopo il tocco non si chiede il nome');
    if (r[5]) throw new Error('il popup «Installa l\'app» esce anche senza nome');
  });
  await passo('codice fisso e nome dei profili: codice, MARIO 🦝 e MONICA ❤️, «nome cambiato» con Visto, matita di Monica, aiutante (C99, Mario 09/11)', async () => {   // autonoma
    const r = await page.evaluate(() => {
      const primaS = JSON.stringify(S), primaUI = [UI.vista, UI.foglio, P.ruolo];
      try {
        const codici = Array.from({ length: 300 }, () => Dati.nuovoCodice());
        const buoni = codici.every(c => /^[A-HJ-NP-Z2-9]{5}$/.test(c) && /[2-9]/.test(c));
        const fuori = Dati.nuovoCodice(new Set(codici)), unico = !codici.includes(fuori);
        P.ruolo = 'monica';
        S.clienti.push({ id: 'cprova99', nome: 'Laura Rosi', nomeCliente: 'Laura Rossi', chiave: 'laura-rosi', da: '2026-11-01', codice: 'K7P2M',
          nomiPrima: [{ nome: 'Laura Rosi', chi: 'cliente', il: '2026-11-09T10:00' }] });
        const c = S.clienti.find(x => x.id === 'cprova99');
        const riga1 = rigaMioCliente(c);
        A['nome-visto']({ dataset: { id: 'cprova99' } });
        const riga2 = rigaMioCliente(c);
        A['nome-monica']({ dataset: { id: 'cprova99' } });
        document.querySelector('#nome-monica').value = 'Laura del mercato';
        A['nome-monica-ok']();
        const dopo = [c.nome, (c.nomiPrima || []).length, c.codice, nomeNonVisto(c)];
        const stella = [mostraCodice('MARIO'), mostraCodice('MONICA'), mostraCodice('K7P2M')];
        const ai = capisciDove('come cambio il nome di un cliente?'), ai2 = capisciDove('come cambio il nome delle lasagne');
        return { buoni, unico, riga1, riga2, dopo, stella, ai, ai2 };
      } finally { S = JSON.parse(primaS); salva(); [UI.vista, UI.foglio, P.ruolo] = primaUI; render(); }
    });
    if (!r.buoni || !r.unico) throw new Error('codici casuali non validi o doppi');
    if (!/K7P2M/.test(r.riga1) || !/Nome cambiato/.test(r.riga1) || !/Laura Rossi/.test(r.riga1) || !/Visto/.test(r.riga1)) throw new Error('riga del cliente senza codice o senza «nome cambiato»');
    if (/Nome cambiato/.test(r.riga2) || !/Si fa chiamare «Laura Rossi»/.test(r.riga2)) throw new Error('«Visto» non toglie l\'avviso');
    if (r.dopo[0] !== 'Laura del mercato' || r.dopo[1] !== 2 || r.dopo[2] !== 'K7P2M' || r.dopo[3]) throw new Error('matita di Monica: ' + JSON.stringify(r.dopo));
    if (r.stella.join() !== 'MARIO 🦝,MONICA ❤️,K7P2M') throw new Error('stelle sbagliate: ' + r.stella);
    if (!r.ai || r.ai[0].voce !== 'clienti-nome') throw new Error('aiutante: il nome del cliente non porta in Clienti ' + JSON.stringify(r.ai));
    if (!r.ai2 || r.ai2[0].voce !== 'nome') throw new Error('aiutante: il nome del piatto non va più al piatto ' + JSON.stringify(r.ai2));
  });
  await passo('cliente: correggi il nome, sempre il suo nome e il suo codice (C99)', async () => {   // autonoma
    const r = await page.evaluate(() => {
      const io = Dati.io, prima = [Dati.attivo, io.utente, io.letto, io.gestore, P.ruolo, io.uid];
      try {
        Object.defineProperty(Dati, 'attivo', { value: true, configurable: true, writable: true });
        io.gestore = false; io.letto = true; io.uid = 'prova99'; P.ruolo = 'cliente';
        io.utente = { nome: 'Gianni Verdi', stato: 'nuovo', codice: 'AB3CD', cliente: null };
        const attesa = righeAttesa();
        io.utente = { nome: 'Gianni Verdi', stato: 'approvato', codice: 'AB3CD', cliente: 'cnonc' };
        const prof = profiloCliente();
        A['mio-nome'](); const f = document.querySelector('#mio-nome');
        return [attesa, prof, f && f.value];
      } finally { [Dati.attivo, io.utente, io.letto, io.gestore, P.ruolo, io.uid] = prima; UI.foglio = null; render(); }
    });
    if (!/AB3CD/.test(r[0]) || !/Correggi il nome/.test(r[0])) throw new Error('in attesa: manca codice o «Correggi il nome»');
    if (!/AB3CD/.test(r[1]) || !/Gianni Verdi/.test(r[1]) || !/Correggi il nome/.test(r[1])) throw new Error('profilo del cliente: ' + r[1]);
    if (r[2] !== 'Gianni Verdi') throw new Error('il foglio non parte dal nome attuale');
  });
  await passo('cliente: guida a figure iPhone per iOS 27, 26, 18 e Chrome (C94, Mario 08/11 «1 guida a figure»)', async () => {   // autonoma
    const r = await page.evaluate(() => {
      const u = v => `Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) ${v} Mobile/15E148 Safari/604.1`;
      return ['Version/27.1', 'Version/26.0', 'Version/18.6', 'CriOS/140.0'].map(v => { const h = GuidaIPhone.guidaIPhone(u(v));
        return { passi: (h.match(/class="gf-passo"/g) || []).length, fig: (h.match(/<svg class="gf-fig"/g) || []).length, web: /Apri come app web/.test(h), h }; });
    });
    const [v27, v26, v18, cr] = r;
    if (v27.passi !== 4 || v26.passi !== 4 || v18.passi !== 3 || cr.passi !== 3) throw new Error('numero di passi sbagliato: ' + r.map(x => x.passi));
    if (r.some(x => x.fig !== x.passi)) throw new Error('un passo senza disegno');
    if (!/a sinistra dell'indirizzo/.test(v27.h) || !/⋯<\/b> in basso a destra/.test(v26.h) || !/in basso, al centro/.test(v18.h) || !/in alto a destra, vicino/.test(cr.h)) throw new Error('tasto di partenza sbagliato per una versione');
    if (!v27.web || !v26.web || v18.web) throw new Error('«Apri come app web» deve esserci solo da iOS 26');
    const ins = await page.evaluate(() => { UI.guidaOS = 'ios'; const g = guidaInstalla(); UI.guidaOS = null;
      return [/class="gf-fig"/.test(g), (GuidaIPhone.guidaIPhone('Mozilla/5.0 (iPhone) Instagram 300.0').match(/class="gf-passo"/g) || []).length]; });
    if (!ins[0]) throw new Error('la scheda iPhone della guida non mostra le figure');
    if (ins[1] !== 1) throw new Error('dentro Instagram deve esserci solo «Apri nel browser»');
  });
  await passo('cliente: guida corta «metti l\'app sul telefono» con schede iPhone | Android (Mario 08/11, Sabrina)', async () => {   // autonoma
    const r = await page.evaluate(() => { UI.guidaOS = 'ios'; const a = guidaInstalla(); UI.guidaOS = 'android'; const b = guidaInstalla(); UI.guidaOS = null; return [a, b, primiPassi()]; });
    if (!/Aggiungi alla schermata Home/.test(r[0]) || !/aria-pressed="true">iPhone/.test(r[0])) throw new Error('scheda iPhone sbagliata');
    if (!/⋮/.test(r[1]) || !/aria-pressed="true">Android/.test(r[1])) throw new Error('scheda Android sbagliata');
    if (r[2] && /data-a="passi-app"/.test(r[2])) throw new Error('c\'è ancora il tasto che apre solo i passi');
  });
  await passo('cliente (C93): guida a installare dopo il primo ordine, «Ordina di nuovo» in cima al menù', async () => {   // autonoma
    const r = await page.evaluate(() => {
      P.ruolo = 'cliente'; P.benvenuto = true; P.installata = false; P.ordinato = false; P.carrello = []; UI.passiVia = false; UI.modifica = null; UI.foglio = null;
      const prima = primiPassi(); vai('inviato'); const dopoInvio = $('main').innerHTML; vai('menu'); const dopo = primiPassi();
      return [/guida-inst|data-a="installa"/.test(prima), /carta-home/.test(dopoInvio), /guida-inst|data-a="installa"/.test(dopo), P.ordinato];
    });
    if (r[0]) throw new Error('la guida a installare compare prima del primo ordine');
    if (!r[1]) throw new Error('dopo «Ordine inviato!» manca «Metti l\'app sul telefono»');
    if (!r[2] || !r[3]) throw new Error('dopo il primo ordine la guida non compare nei primi passi');
    const c = await page.evaluate(() => {
      if (!P.cliente) P.cliente = (S.clienti[0] || {}).id;
      const p = S.piatti.find(x => x.disponibile && !x.cestino), f = p.formati[0];
      S.ordini.push({ id: 'o-c93', n: 999, cliente: P.cliente, stato: 'ritirato', entro: '2999-01-01', paga: {}, righe: [{ piatto: p.id, nome: p.nome, formato: f.id, formatoNome: f.nome, tipo: f.tipo, variante: '', varianteNome: '', qta: 2, prezzo: f.prezzo, note: [], testo: '' }] });
      P.carrello = []; vai('menu'); return [!!document.querySelector('.rifai [data-a="riordina"]'), p.id];
    });
    if (!c[0]) throw new Error('in cima al menù manca «Ordina di nuovo»');
    await clic('.rifai [data-a="riordina"]');
    const ok = await page.evaluate(id => UI.vista === 'carrello' && P.carrello.some(r => r.piatto === id && r.qta === 2), c[1]);
    await page.evaluate(() => { S.ordini = S.ordini.filter(o => o.id !== 'o-c93'); P.carrello = []; P.ordinato = false; });
    if (!ok) throw new Error('«Ordina di nuovo» non mette i piatti nel carrello');
  });
  await passo('gesto indietro del telefono: torna indietro nell\'app, non la chiude', async () => {   // autonoma
    const url = page.url();
    await page.evaluate(() => { P.ruolo = 'monica'; UI.foglio = null; vai('home'); vai('piatti'); vai('piatto:tiramisu'); });
    await page.goBack(); await page.waitForTimeout(300);
    if (page.url() !== url) throw new Error('il gesto ha lasciato l\'app');
    const v1 = await page.evaluate(() => UI.vista);
    if (v1 === 'piatto:tiramisu') throw new Error('il gesto non torna indietro');
    await page.evaluate(() => { UI.foglio = { tipo: 'novita' }; render(); });
    await page.goBack(); await page.waitForTimeout(300);
    if (await page.evaluate(() => !!UI.foglio || UI.vista) !== v1) throw new Error('il gesto non chiude prima il foglio');
    await page.evaluate(() => vai('spesa')); await page.goBack(); await page.waitForTimeout(300);
    if (await page.evaluate(() => UI.vista) !== 'home') throw new Error('dalla spesa il gesto non torna alla Home: ' + await page.evaluate(() => UI.vista));
    await page.goBack(); await page.waitForTimeout(300);
    if (!(await page.locator('.toast', { hasText: 'Per uscire' }).count())) throw new Error('nella Home manca l\'avviso «Per uscire…»');
    if (page.url() !== url) throw new Error('il primo gesto nella Home ha chiuso l\'app');
  });
  await passo('C109 nessun cliente fermato: la segnalazione «esagera» apre le Impostazioni, elenco con nome e numeri, l\'aiutante porta alle Notifiche', async () => {
    const r = await page.evaluate(() => {
      P.ruolo = 'monica'; UI.foglio = null; UI.vista = 'home'; render();
      const k = S.clienti[0];
      const h = segnalazioniHtml([{ quando: new Date().toISOString(), cosa: 'aiutante', cliente: k.id, n: 31, soglia: 30 }]);
      const h2 = segnalazioniHtml([{ quando: new Date().toISOString(), cosa: 'ridotto', cliente: k.id, n: 100, soglia: 100 }, { quando: new Date().toISOString(), cosa: 'quota', cliente: '', n: 60, soglia: 60 }]);
      UI.vista = 'impostazioni'; render();
      const mario = { avviso: !!document.querySelector('[data-sez="opz-aicAvviso"], #opz-aicAvviso, [data-campo="o.aicAvviso"]') || document.body.innerHTML.includes('Aiutante dei clienti: segnalazione'),
        monicaNo: !('opz-aicAvviso' in DOVE_AI) && !datiAI().impostazioniExtra.some(o => o.chiave === 'aicAvviso'), base: opz('aicAvviso') === 30 && opz('aicRidotto') === 100 };
      UI.vaiDopo = 'esagera'; vaiDaNotifica(); render();
      const voce = DOVE_AI['imp-notifiche'].parole.test('chi usa molto l\'aiutante?');
      return { h, h2, mario, nome: k.nome, vista: UI.vista, avviso: UI.avvisoTesto, nomeAvviso: NOMI_AVVISO.esagera, voce };
    });
    if (!r.h.includes(r.nome) || !/31 domande/.test(r.h) || !/segnalazione a 30/.test(r.h)) throw new Error('elenco delle segnalazioni sbagliato: ' + r.h);
    if (!/risponde il telefono senza AI/.test(r.h2) || !/Tutti i clienti: domande di oggi finite/.test(r.h2) || /fermat[oa] /.test(r.h2.replace('nessuno fermato', ''))) throw new Error('segnalazioni «ridotto» e «quota» sbagliate: ' + r.h2);
    if (!r.mario.avviso || !r.mario.monicaNo || !r.mario.base) throw new Error('soglie di Mario: in «Solo per te, Mario» ' + r.mario.avviso + ', nascoste all\'aiutante di Monica ' + r.mario.monicaNo + ', base 30/100 ' + r.mario.base);
    if (r.vista !== 'impostazioni' || !/Nessuno è stato fermato/.test(r.avviso)) throw new Error('il tocco su «esagera» non apre le Impostazioni con l\'avviso: ' + r.vista + ' · ' + r.avviso);
    if (!r.nomeAvviso) throw new Error('manca il nome dell\'avviso «esagera» negli ultimi avvisi');
    if (r.voce !== true) throw new Error('l\'aiutante non porta alle Notifiche con «chi usa molto l\'aiutante?»');
    await page.evaluate(() => { UI.avvisoTesto = ''; UI.vista = 'home'; render(); });
  });
  await passo('C106 iPad in orizzontale: al rientro nell\'app lo zoom torna a 1 (regola «mai più grande di 1» per un attimo, poi quella normale)', async () => {
    const c2 = await browser.newContext({ ...devices['iPad Pro 11 landscape'], deviceScaleFactor: 1 });
    const p2 = await c2.newPage(); const errori = [];
    p2.on('pageerror', e => errori.push(e.message));
    try {
      await p2.goto(FILE); await p2.waitForTimeout(2500);
      const base = await p2.evaluate(() => document.querySelector('meta[name="viewport"]').content);
      if (/maximum-scale/.test(base)) throw new Error('la regola normale non deve bloccare lo zoom: ' + base);
      await p2.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      const subito = await p2.evaluate(() => document.querySelector('meta[name="viewport"]').content);
      if (!/maximum-scale=1/.test(subito)) throw new Error('al rientro manca «maximum-scale=1»: ' + subito);
      await p2.waitForTimeout(2000);
      const dopo = await p2.evaluate(() => document.querySelector('meta[name="viewport"]').content);
      if (dopo !== base) throw new Error('dopo il rientro la regola non torna quella normale: ' + dopo);
      const largo = await p2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (largo > 0) throw new Error('la pagina esce dai bordi di ' + largo + ' px');
      if (errori.length) throw new Error('errori nella pagina: ' + errori.join(' | '));
    } finally { await c2.close(); }
  });
  await passo('aggiornamento: avvisa, NON riavvia da solo, «Riavvia» riprende dalla stessa schermata col foglio aperto', async () => {   // autonoma, ultima (ricarica la pagina)
    await page.evaluate(() => { P.ruolo = 'monica'; UI.vista = 'piatto:tiramisu'; UI.foglio = { tipo: 'novita' }; render(); window._stessaPagina = true; nuovaVersione = '9.9.9'; riavviaQuandoPuoi(); });
    if (!(await page.locator('#agg-avviso', { hasText: "C'è l'aggiornamento 9.9.9" }).count())) throw new Error('manca l\'avviso');
    await page.waitForTimeout(4000);   // prima ripartiva da sola dopo 2,5 s (Mario 08/11 «non aggiornare in automatico»)
    if (!(await page.evaluate(() => window._stessaPagina === true))) throw new Error('l\'app si è riavviata da sola');
    await foto('99-avviso-aggiornamento');
    await clic('[data-a="agg-dopo"]');
    if (await page.locator('#agg-avviso').count()) throw new Error('«Dopo» non toglie l\'avviso');
    await page.evaluate(() => riavviaQuandoPuoi());
    await Promise.all([page.waitForEvent('load', { timeout: 15000 }), clic('[data-a="agg-riavvia"]')]);
    await page.waitForFunction(() => typeof UI !== 'undefined' && UI.vista === 'piatto:tiramisu', null, { timeout: 15000 });
    if (!(await page.evaluate(() => UI.foglio && UI.foglio.tipo === 'novita'))) throw new Error('dopo il riavvio il foglio aperto non torna');
    if (!(await page.locator('.toast', { hasText: 'App aggiornata' }).count())) throw new Error('manca «App aggiornata»');
    if (await page.locator('.apertura').count()) throw new Error('dopo l\'aggiornamento riparte l\'apertura animata');
  });
  await passo('clienti nuovi (C104): spegnere chiede conferma, avviso rosso con «Riapri», il cliente bloccato tiene il nome e avvisa, la notifica apre Clienti', async () => {   // autonoma
    await page.evaluate(() => { P.ruolo = 'monica'; UI.foglio = null; UI.sez = null; delete S.impostazioni.nuovi; vai('clienti'); });
    await page.waitForTimeout(250);
    if (await page.locator('.avviso-chiusi').count()) throw new Error('avviso rosso visibile con la porta aperta');
    const sw = page.locator('input[data-campo="i.nuovi"]'); await sw.scrollIntoViewIfNeeded(); await sw.click(); await page.waitForTimeout(300);
    if (!(await page.locator('.foglio', { hasText: 'Chiudere ai clienti nuovi?' }).count())) throw new Error('manca la conferma prima di chiudere');
    if ((await page.evaluate(() => S.impostazioni.nuovi)) === false) throw new Error('chiuso prima della conferma');
    await foto('23-chiudi-nuovi-conferma');
    await clic('[data-a="nuovi-chiudi-si"]'); await page.waitForTimeout(400);
    if ((await page.evaluate(() => S.impostazioni.nuovi)) !== false) throw new Error('la conferma non ha chiuso');
    if (!(await page.locator('.avviso-chiusi').count())) throw new Error('manca l\'avviso rosso in Clienti');
    await page.evaluate(() => vai('home')); await page.waitForTimeout(250);
    if (!(await page.locator('.avviso-chiusi [data-a="nuovi-riapri"]').count())) throw new Error('manca l\'avviso rosso con «Riapri» in Home');
    await foto('23-home-chiusi');
    // il cliente che trova chiuso: testo onesto, il nome resta per la prossima volta
    const cl = await page.evaluate(() => { P.ruolo = 'cliente'; UI.devCliente = false; UI.benvPrima = P.benvenuto; P.benvenuto = false; UI.benv = { nome: 'Francesco', cognome: 'Prova', chiuso: true }; vai('menu'); return document.querySelector('.benvenuto .avviso') ? document.querySelector('.benvenuto .avviso').textContent : ''; });
    if (!/non accetta clienti nuovi/.test(cl) || !/Sì, sono io/.test(cl)) throw new Error('testo del cliente bloccato: ' + cl.slice(0, 120));
    // (C104, v0.9.78) chi trova chiuso avvisa chi gestisce, una volta sola ogni 3 ore
    const bus = await page.evaluate(() => { const vero = window.avvisaGestori, tipi = []; window.avvisaGestori = t => tipi.push(t); P.bussatoIl = 0; bussaChiusi(); bussaChiusi(); window.avvisaGestori = vero; return tipi; });
    if (bus.join() !== 'chiusi') throw new Error('avviso della porta chiusa: ' + JSON.stringify(bus));
    await page.evaluate(() => { P.ruolo = 'monica'; P.benvenuto = UI.benvPrima; P.guida = true; P.homeNo = true; UI.benv = null; UI.foglio = null; vai('home'); }); await page.waitForTimeout(250);
    const st = await page.evaluate(() => [UI.vista, P.ruolo, S.impostazioni.nuovi, !!document.querySelector('.avviso-chiusi'), (document.querySelector('main.corpo') || {}).className]);
    if (!st[3]) throw new Error('tornata in Home senza avviso rosso: ' + JSON.stringify(st));
    await page.evaluate(() => { UI.vaiDopo = 'chiusi'; vaiDaNotifica(); render(); }); await page.waitForTimeout(250);   // il tocco sulla notifica apre Clienti
    const nt = await page.evaluate(() => [UI.vista, !!document.querySelector('.avviso-chiusi [data-a="nuovi-riapri"]')]);
    if (nt[0] !== 'clienti' || !nt[1]) throw new Error('la notifica «non riesce a entrare» non apre Clienti con «Riapri»: ' + JSON.stringify(nt));
    try { await page.locator('[data-a="nuovi-riapri"]').first().click({ timeout: 5000 }); } catch (e) { await foto('23-errore'); throw new Error('«Riapri» non cliccabile: ' + e.message.split('\n').slice(0, 6).join(' | ')); }
    await page.waitForTimeout(300);
    const dopo = await page.evaluate(() => [S.impostazioni.nuovi, document.querySelectorAll('.avviso-chiusi').length]);
    if (dopo[0] !== true || dopo[1]) throw new Error('«Riapri» non riapre: ' + JSON.stringify(dopo));
    await page.evaluate(() => { delete S.impostazioni.nuovi; salva(); });
  });

  /* ===== COMANDO VOCALE DEI CLIENTI (C105, voce-clienti.js): passi autonomi ===== */
  await passo('voce dei clienti: capisce 30 frasi senza rete (C105)', async () => {
    await page.evaluate(() => { P.ruolo = 'cliente'; UI.devCliente = false; UI.vista = 'menu'; UI.foglio = null; P.carrello = []; AIC.msgs = []; delete S.impostazioni.aiClienti; delete S.impostazioni.voceClientiSinonimi; render(); });
    const sab = await page.evaluate(() => { for (let i = 1; i <= 7; i++) { const g = piuGiorni(oggi(), i); if (daIso(g).getDay() === 6) return g; } });
    const dom = await page.evaluate(() => piuGiorni(oggi(), 1));
    const casi = [
      ['due teglie di lasagne al ragù per sabato', { intento: 'ordina', id: 'lasagne-ragu', qta: 2, formato: 't6', giorno: sab }],
      ['una teglia da 8 di lasagne al ragu', { intento: 'ordina', id: 'lasagne-ragu', qta: 1, formato: 't8' }],
      ['un chilo e mezzo di polpette di carne', { intento: 'ordina', id: 'polpette-carne', qta: 1.5, formato: 'kg' }],
      ['tre etti di papassini', { intento: 'ordina', id: 'papassini', qta: 0.5, formato: 'kg', testo: 'minimo' }],
      ['la sagne al ragù', { id: 'lasagne-ragu', alt: 0 }],
      ['quanto costa il tiramisù', { intento: 'prezzo', id: 'tiramisu', carrello: 0 }],
      ['il tiramisù ha il glutine?', { intento: 'allergeni', id: 'tiramisu', testo: 'glutine' }],
      ['cosa c\'è di pronto oggi', { intento: 'pronti' }],
      ['il mio ordine è pronto?', { intento: 'stato' }],
      ['cosa mi consigli', { intento: 'consiglio' }],
      ['lasagne', { alt: 3 }],
      ['polpette', { alt: 4 }],
      ['scrivi a Monica che arrivo alle 18', { intento: 'monica', carrello: 0 }],
      ['lo stesso dell\'ultima volta', { intento: 'rifai' }],
      ['apri il carrello', { intento: 'apri' }],
      ['sì', { intento: 'si' }], ['no', { intento: 'no' }], ['ciao', { intento: 'saluto' }], ['grazie', { intento: 'saluto' }],
      ['una domanda: quanto costa la parmigiana', { intento: 'prezzo', alt: 2, carrello: 0, testo: 'Quale intendi' }],   // nel menù ci sono due «parmigiana»: chiede, non sceglie
      ['blu vermiglio', { confMax: 0.6 }],
      ['vorrei un chilo di ravioli alla ricotta', { intento: 'ordina', id: 'ravioli', qta: 1, formato: 'kg', gusto: 'ricotta' }],
      ['un tiramisù per domani', { intento: 'ordina', id: 'tiramisu', qta: 1, giorno: dom }],
      ['due panade di carne', { intento: 'ordina', id: 'panade-carne', qta: 2 }],
      ['quanto costano le polpette di tonno', { intento: 'prezzo', id: 'polpette-tonno', carrello: 0 }],
      ['cosa posso mangiare con le mie allergie', { intento: 'allergeni' }],
      ['come si paga', { intento: 'info' }],
      ['a che ora posso ritirare', { intento: 'info' }],
      ['mettimi una parmigiana', { intento: 'ordina', alt: 2, carrello: 0 }],
      ['mettimi una parmigiana di melanzane', { intento: 'ordina', id: 'parmigiana', qta: 1, alt: 0 }],
      ['cosa sai fare', { intento: 'aiuto' }],
      ['due teglie di lasagne al ragù, un chilo di polpette di carne e un tiramisù per sabato', { intento: 'ordina', carrello: 3, giorno: sab }]
    ];
    const esiti = await page.evaluate(casi => casi.map(([f]) => { const e = capisciCliente(f), az = (e.risposta.azioni || []).filter(x => x.azione === 'carrello'), a = az[0] || {};
      return { f, intento: e.intento, id: a.id || (e.piatti[0] || {}).id, qta: a.qta, formato: a.formato, gusto: a.gusto, giorno: e.giorno, conf: e.confidenza, alt: e.alternative.length, carrello: az.length, testo: e.risposta.testo || '' }; }), casi);
    const err = [];
    esiti.forEach((e, i) => Object.entries(casi[i][1]).forEach(([k, v]) => {
      if (k === 'testo') { if (!new RegExp(v, 'i').test(e.testo)) err.push(`«${e.f}»: risposta senza «${v}»: ${e.testo.slice(0, 90)}`); }
      else if (k === 'confMax') { if (!(e.conf < v)) err.push(`«${e.f}»: confidenza ${e.conf}, attesa sotto ${v}`); }
      else if (JSON.stringify(e[k]) !== JSON.stringify(v)) err.push(`«${e.f}»: ${k} = ${JSON.stringify(e[k])}, atteso ${JSON.stringify(v)} (${e.testo.slice(0, 60)})`);
    }));
    fs.writeFileSync(`${OUT}/frasi.txt`, err.join('\n'));
    if (err.length) throw new Error(err.length + ' su ' + casi.length + ' sbagliate:\n' + err.join('\n'));
  });
  await passo('voce dei clienti: microfono fisso nel menù, frase detta (alternativa con più senso), «sì» a voce → carrello e giorno (C105)', async () => {
    await page.evaluate(() => { P.ruolo = 'cliente'; UI.devCliente = false; UI.vista = 'menu'; UI.foglio = null; P.carrello = []; AIC.msgs = []; UI.entro = ''; delete S.impostazioni.aiClienti; delete S.impostazioni.voceClientiMotore; S.impostazioni.voceClientiRisponde = false; S.impostazioni.whatsapp = '3331234567';
      try { localStorage.removeItem('pit-vc-visto'); } catch (e) { /* niente */ }
      window.SpeechRecognition = class { start() { setTimeout(() => { const alts = window.__frasi.shift() || ['']; const r = alts.map(t => ({ transcript: t })); r.isFinal = true; r.length = alts.length; this.onresult({ resultIndex: 0, results: [r] }); setTimeout(() => this.onend(), 40); }, 60); } stop() {} abort() {} };
      window.__frasi = [['due teglie di la sagne al ragu per sabato', 'due teglie di lasagne al ragù per sabato'], ['sì']];
      render(); });
    const sab = await page.evaluate(() => { for (let i = 1; i <= 7; i++) { const g = piuGiorni(oggi(), i); if (daIso(g).getDay() === 6) return g; } });
    if (!(await page.locator('.vc-fab').count())) throw new Error('manca il microfono fisso nel menù');
    if (!(await page.locator('.vc-primo').count())) throw new Error('manca «Puoi parlarmi!» la prima volta');
    const pos = await page.evaluate(() => { const a = document.querySelector('.vc-fab').getBoundingClientRect(), b = document.querySelector('.wa-monica').getBoundingClientRect(); return { sx: a.left < window.innerWidth / 2, dx: b.left > window.innerWidth / 2, sovra: a.right > b.left && a.top < b.bottom && a.bottom > b.top }; });
    if (!pos.sx || !pos.dx || pos.sovra) throw new Error('microfono e «Scrivimi» mal messi: ' + JSON.stringify(pos));
    await page.waitForTimeout(2600); await foto('40-voce-clienti');   // dopo il toast «Ecco il menù»
    await page.locator('.vc-fab').click(); await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({ vista: UI.vista, msgs: AIC.msgs.map(m => m.t), carr: P.carrello.map(x => [x.piatto, x.qta]), entro: UI.entro, esito: (AIC.msgs[1] || {}).esito }));
    if (r.msgs[0] !== 'due teglie di lasagne al ragù per sabato') throw new Error('non ha scelto la frase con più senso: ' + JSON.stringify(r.msgs));
    if (JSON.stringify(r.carr) !== JSON.stringify([['lasagne-ragu', 2]])) throw new Error('dopo il «sì» a voce il carrello è ' + JSON.stringify(r));
    if (r.vista !== 'carrello' || r.entro !== sab) throw new Error('dopo il «sì» non va al carrello con sabato: ' + JSON.stringify(r));
    await foto('41-voce-carrello');
  });
  await passo('voce dei clienti: ascolto preciso (registra → server finto con i nomi dei piatti), poi «solo telefono» (C105)', async () => {
    await page.evaluate(() => { UI.vista = 'menu'; P.carrello = []; AIC.msgs = []; UI.entro = ''; S.impostazioni.voceClientiMotore = 'preciso'; S.impostazioni.voceClientiRisponde = false;
      if (!navigator.mediaDevices) Object.defineProperty(navigator, 'mediaDevices', { value: {}, configurable: true });
      navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [] });
      window.MediaRecorder = class { constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; } start() { this.state = 'recording'; } stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob([new Uint8Array(3000)]) }); this.onstop(); } static isTypeSupported() { return true; } };
      window.ascoltaServerFinto = async b => { window.__mandato = b; return { testo: 'un chilo di polpette di carne per domani', motore: 'finto' }; };
      render(); });
    await page.locator('.vc-fab').click(); await page.waitForTimeout(700);
    const st = await page.evaluate(() => [VC.stato, !!VC.media, !!document.querySelector('.vc-pannello'), !!document.querySelector('.vc-fab.acceso')]);
    if (st[0] !== 'registro' || !st[1] || !st[2] || !st[3]) throw new Error('ascolto preciso non partito: ' + JSON.stringify(st));
    await page.evaluate(() => fermaAscoltoCliente()); await page.waitForTimeout(900);
    const r = await page.evaluate(() => ({ piatti: (window.__mandato || {}).piatti, audio: ((window.__mandato || {}).audio || '').length, msgs: AIC.msgs.map(m => m.t), az: ((AIC.msgs[1] || {}).piano || []).map(x => x.a), vista: UI.vista, giorno: (AIC.msgs[1] || {}).giorno }));
    if (!Array.isArray(r.piatti) || !r.piatti.some(n => /polpette di carne/i.test(n)) || !r.audio) throw new Error('al server non arrivano audio e nomi dei piatti: ' + JSON.stringify(r).slice(0, 200));
    if (r.msgs[0] !== 'un chilo di polpette di carne per domani' || !r.az[0] || r.az[0].id !== 'polpette-carne' || Number(r.az[0].qta) !== 1 || r.vista !== 'aiuto') throw new Error('proposta sbagliata: ' + JSON.stringify(r).slice(0, 300));
    if (r.giorno !== await page.evaluate(() => piuGiorni(oggi(), 1))) throw new Error('«per domani» non capito: ' + r.giorno);
    if (await page.evaluate(() => (window.__mandato || {}).comeCliente) !== false) throw new Error('cliente vero: «comeCliente» deve essere false');
    await page.evaluate(() => { S.impostazioni.voceClientiMotore = 'telefono'; window.__frasi = [['quanto costa il tiramisù']]; UI.vista = 'menu'; AIC.msgs = []; render(); });
    await page.locator('.vc-fab').click(); await page.waitForTimeout(700);
    const r2 = await page.evaluate(() => ({ media: !!VC.media, msgs: AIC.msgs.map(m => m.t) }));
    if (r2.media || r2.msgs[0] !== 'quanto costa il tiramisù' || !/tiramis/i.test(r2.msgs[1] || '')) throw new Error('«solo telefono» non va: ' + JSON.stringify(r2));
  });
  await passo('voce dei clienti: «Dettami l\'ordine» con tre piatti e il giorno → tre righe dopo Conferma (C105)', async () => {
    await page.evaluate(() => { UI.vista = 'menu'; P.carrello = []; AIC.msgs = []; UI.entro = ''; S.impostazioni.voceClientiMotore = 'auto'; S.impostazioni.voceClientiRisponde = false;
      window.ascoltaServerFinto = async () => ({ testo: 'due teglie di lasagne al ragù, un chilo di polpette di carne e un tiramisù per sabato', motore: 'finto' }); render(); });
    if (!(await page.locator('.vc-detta').count())) throw new Error('manca la pillola «Dettami l\'ordine»');
    await page.locator('.vc-detta').click(); await page.waitForTimeout(700);
    if ((await page.evaluate(() => VC.stato)) !== 'registro') throw new Error('la dettatura non usa subito l\'ascolto preciso');
    await page.evaluate(() => fermaAscoltoCliente()); await page.waitForTimeout(900);
    const n = await page.evaluate(() => ((AIC.msgs[1] || {}).piano || []).map(x => x.a.id));
    if (n.join() !== 'lasagne-ragu,polpette-carne,tiramisu') throw new Error('tre piatti dettati, proposte: ' + JSON.stringify(n) + ' ' + JSON.stringify(await page.evaluate(() => AIC.msgs.map(m => m.t))));
    await foto('42-voce-dettato');
    await clic('[data-a="ac-si"]'); await page.waitForTimeout(400);
    const sab = await page.evaluate(() => { for (let i = 1; i <= 7; i++) { const g = piuGiorni(oggi(), i); if (daIso(g).getDay() === 6) return g; } });
    const r = await page.evaluate(() => ({ n: P.carrello.length, vista: UI.vista, entro: UI.entro }));
    if (r.n !== 3 || r.vista !== 'carrello' || r.entro !== sab) throw new Error('dopo Conferma: ' + JSON.stringify(r) + ' atteso sabato ' + sab);
    await page.evaluate(() => { P.carrello = []; salvaP(); AIC.msgs = []; UI.entro = ''; delete S.impostazioni.voceClientiMotore; delete S.impostazioni.voceClientiRisponde; S.impostazioni.whatsapp = ''; UI.vista = 'menu'; render(); });
  });
  await passo('voce dei clienti: iPad con l\'app sulla Home → il riconoscitore di Safari non parte mai, si registra subito e il «sì» resta col tocco (C105, Mario 09/11)', async () => {   // autonomo
    await page.evaluate(() => { P.ruolo = 'cliente'; P.benvenuto = true; UI.devCliente = false; UI.foglio = null; delete S.impostazioni.aiClienti; UI.vista = 'menu'; P.carrello = []; AIC.msgs = []; UI.entro = ''; delete S.impostazioni.voceClientiMotore; S.impostazioni.voceClientiRisponde = false;
      Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (iPad; CPU OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', configurable: true });
      Object.defineProperty(navigator, 'standalone', { get: () => true, configurable: true });
      window.__partito = 0; window.SpeechRecognition = class { start() { window.__partito++; } stop() {} abort() {} };   // come su iPad: c'è, ma non dice mai nulla
      if (!navigator.mediaDevices) Object.defineProperty(navigator, 'mediaDevices', { value: {}, configurable: true });
      navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [] });
      window.MediaRecorder = class { constructor() { this.state = 'inactive'; this.mimeType = 'audio/mp4'; } start() { this.state = 'recording'; } stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob([new Uint8Array(3000)]) }); this.onstop(); } static isTypeSupported(t) { return /mp4/.test(t); } };
      window.ascoltaServerFinto = async b => { window.__mandato = b; return { testo: 'due teglie di lasagne al ragù per sabato', motore: 'finto' }; };
      render(); });
    await page.setViewportSize({ width: 1024, height: 600 });   // iPad in orizzontale: schermo basso
    await page.locator('.vc-fab').click(); await page.waitForTimeout(700);
    const st = await page.evaluate(() => ({ stato: VC.stato, media: !!VC.media, partito: window.__partito, si: vocePuoSentireSi(), bene: telefonoAscoltaBene(), pann: (document.querySelector('.vc-pannello b') || {}).textContent }));
    if (st.stato !== 'registro' || !st.media || st.partito || st.si || st.bene || !/attenzione/.test(st.pann || '')) throw new Error('su iPad non parte subito l\'ascolto preciso: ' + JSON.stringify(st));
    const stesso = await page.evaluate(() => { const p = document.querySelector('.vc-pannello'); p.__mio = 1; render(); render(); statoVC('registro', ''); return (document.querySelector('.vc-pannello') || {}).__mio === 1; });
    if (!stesso) throw new Error('il pannello «Ti ascolto» viene rifatto a ogni render: lampeggia (Mario 09/11, iPad)');
    await page.evaluate(() => fermaAscoltoCliente()); await page.waitForTimeout(900);
    const r = await page.evaluate(() => { const f = document.querySelectorAll('.ai-fum.lei'), u = f[f.length - 1], b = u ? u.getBoundingClientRect() : null; return { tipo: (window.__mandato || {}).tipo, msgs: AIC.msgs.map(m => m.t), rec: !!VC.rec, vista: UI.vista, az: (((AIC.msgs[1] || {}).piano || [])[0] || {}).a, inizio: b ? Math.round(b.top) : null, alto: b ? Math.round(b.height) : null, schermo: window.innerHeight, y: Math.round(window.scrollY) }; });
    if (r.tipo !== 'audio/mp4' || r.msgs[0] !== 'due teglie di lasagne al ragù per sabato' || r.vista !== 'aiuto' || !r.az || r.az.id !== 'lasagne-ragu') throw new Error('la frase registrata (mp4) non arriva all\'aiutante: ' + JSON.stringify(r).slice(0, 300));
    if (r.rec) throw new Error('su iPad il «sì» a voce col riconoscitore non deve partire (resta il tocco su Conferma)');
    if (r.inizio == null || r.inizio < 0 || r.inizio > r.schermo - 120) throw new Error('su uno schermo basso l\'inizio della risposta resta fuori dallo schermo (Mario 09/11, iPad): ' + JSON.stringify({ inizio: r.inizio, alto: r.alto, schermo: r.schermo, y: r.y }));
    await foto('42-voce-ipad-orizzontale');
    await page.setViewportSize({ width: 412, height: 915 });
    await page.evaluate(() => { delete navigator.userAgent; delete navigator.standalone; });
  });
  await passo('voce dei clienti: frasi storpiate da Whisper → vince quella giusta, giorni spezzati riparati (C105, Mario 09/11 «non capisce bene»)', async () => {   // autonomo: solo funzioni
    const r = await page.evaluate(() => ({
      corretta: scegliTrascrizione({ testo: 'Due teglie di lasagne al ragù per sabato.', corretto: true, alternative: ['Due teglie di lasagne al ragù persa a Mato.', 'Dette di lasagne al ragù per sabato.'] }),
      senzaCorrettore: scegliTrascrizione({ testo: '2 teglie di lasagne al ragù persa a Mato', corretto: false, alternative: ['2 teglie di lasagne al ragù persa a Mato', 'Dette di lasagne al ragù per sabato.'] }),
      spezzato: scegliTrascrizione({ testo: 'un chilo di polpette di carne per sa bato' }),
      dopo: capisciCliente(scegliTrascrizione({ testo: 'un chilo di polpette di carne per dopo domani' })).giornoDetto,
      salato: giornoSimile('vorrei qualcosa di salato'), si: scegliTrascrizione({ testo: 'Sì.', alternative: ['Sì.'] })
    }));
    if (r.corretta !== 'Due teglie di lasagne al ragù per sabato.') throw new Error('la frase del correttore non vince: ' + r.corretta);
    if (!/^2 teglie di lasagne al ragù per sabato$/.test(r.senzaCorrettore)) throw new Error('senza correttore «persa a Mato» non torna «per sabato» con la quantità: ' + r.senzaCorrettore);
    if (r.spezzato !== 'un chilo di polpette di carne per sabato') throw new Error('«sa bato» non riparato: ' + r.spezzato);
    if (r.dopo !== 'dopodomani') throw new Error('«dopo domani» capito come ' + r.dopo);
    if (r.salato !== '' || r.si !== 'Sì.') throw new Error('ritocco dei giorni a caso: ' + JSON.stringify(r));
  });
  await passo('aiutante di Monica: su iPad con l\'app sulla Home il microfono detta con l\'ascolto preciso (il riconoscitore di Safari lì non parte, PT E39)', async () => {   // autonomo
    await page.evaluate(() => { P.ruolo = 'monica'; UI.devCliente = false; UI.foglio = null; AI.msgs = []; AI.attesa = false; UI.aiQui = null; AIC.msgs = [];
      Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (iPad; CPU OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', configurable: true });
      Object.defineProperty(navigator, 'standalone', { get: () => true, configurable: true });
      window.__partito = 0; window.SpeechRecognition = class { start() { window.__partito++; } stop() {} abort() {} };
      if (!navigator.mediaDevices) Object.defineProperty(navigator, 'mediaDevices', { value: {}, configurable: true });
      navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [] });
      window.MediaRecorder = class { constructor() { this.state = 'inactive'; this.mimeType = 'audio/mp4'; } start() { this.state = 'recording'; } stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob([new Uint8Array(3000)]) }); this.onstop(); } static isTypeSupported(t) { return /mp4/.test(t); } };
      window.ascoltaServerFinto = async b => { window.__mandato = b; return { testo: 'quante teglie di lasagne devo fare domani', motore: 'finto' }; };
      window.__chiesto = null; window._chiediVero = window._chiediVero || chiediAiutante; window.chiediAiutante = (...a) => { window.__chiesto = a[0]; return new Promise(() => {}); };
      vai('aiutante'); });
    const mic = page.locator('.ai-mic[data-a="ai-detta"]').last();
    if (!(await mic.count())) throw new Error('nell\'aiutante di Monica manca il microfono');
    await mic.click(); await page.waitForTimeout(700);
    const st = await page.evaluate(() => ({ stato: VC.stato, media: !!VC.media, partito: window.__partito, rec: !!AI.rec, pann: (document.querySelector('.vc-pannello b') || {}).textContent }));
    if (st.stato !== 'registro' || !st.media || st.partito || st.rec || !/attenzione/.test(st.pann || '')) throw new Error('su iPad l\'aiutante di Monica non registra: ' + JSON.stringify(st));
    await page.evaluate(() => fermaAscoltoCliente()); await page.waitForTimeout(1200);
    const r = await page.evaluate(() => ({ tipo: (window.__mandato || {}).tipo, io: (AI.msgs[0] || {}).t, chi: (AI.msgs[0] || {}).chi, vista: UI.vista, carrello: P.carrello.length, aic: AIC.msgs.length, stato: VC.stato }));
    if (r.tipo !== 'audio/mp4' || r.io !== 'quante teglie di lasagne devo fare domani' || r.chi !== 'io' || r.vista !== 'aiutante' || r.aic || r.stato) throw new Error('la frase dettata non arriva all\'aiutante di Monica: ' + JSON.stringify(r));
    await page.evaluate(() => { delete navigator.userAgent; delete navigator.standalone; });
    const android = await page.evaluate(() => dettaturaServe());
    if (android) throw new Error('fuori dall\'iPad dalla Home deve restare il riconoscitore del telefono (gratis e subito)');
    await page.evaluate(() => { window.chiediAiutante = window._chiediVero; AI.msgs = []; AI.attesa = false; render(); });
  });
  await passo('voce dei clienti C110: iPad dalla Home nella pagina Aiutante → pannello subito, attesa che cambia, voce sbloccata nel tocco, «Ascolta la risposta» se resta muta (Mario 09/11)', async () => {   // autonomo
    await page.evaluate(() => { P.ruolo = 'cliente'; P.benvenuto = true; UI.devCliente = false; UI.foglio = null; delete S.impostazioni.aiClienti; P.carrello = []; AIC.msgs = []; AIC.attesa = false; UI.entro = ''; delete S.impostazioni.voceClientiMotore; S.impostazioni.voceClientiRisponde = true; VC.voceSbloccata = false;
      Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (iPad; CPU OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', configurable: true });
      Object.defineProperty(navigator, 'standalone', { get: () => true, configurable: true });
      window.SpeechRecognition = class { start() {} stop() {} abort() {} };
      window.__parla = []; Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speaking: false, pending: false, getVoices: () => [], cancel() {}, speak(u) { window.__parla.push({ t: u.text, vol: u.volume, tocco: navigator.userActivation ? navigator.userActivation.isActive : null, stato: VC.stato }); } } });   // come iOS: non parte mai da sola (niente onstart)
      if (!navigator.mediaDevices) Object.defineProperty(navigator, 'mediaDevices', { value: {}, configurable: true });
      window.__chiuse = 0; navigator.mediaDevices.getUserMedia = async () => { await new Promise(r => setTimeout(r, 700)); return { getTracks: () => [{ stop() { window.__chiuse++; } }] }; };   // iPad: il microfono ci mette un attimo
      window.MediaRecorder = class { constructor() { this.state = 'inactive'; this.mimeType = 'audio/mp4'; } start() { this.state = 'recording'; } stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob([new Uint8Array(3000)]) }); this.onstop(); } static isTypeSupported(t) { return /mp4/.test(t); } };
      window.ascoltaServerFinto = async () => { await new Promise(r => setTimeout(r, 3200)); return { testo: 'due teglie di lasagne al ragù per sabato', motore: 'finto' }; };   // server lento
      vai('aiuto'); });
    // 1) Annulla mentre il microfono si accende: non deve partire dopo
    await page.locator('.ai-mic[data-a="ac-detta"]').click(); await page.waitForTimeout(150);
    const a = await page.evaluate(() => ({ stato: VC.stato, pann: (document.querySelector('#vc:not([hidden]) .vc-pannello b') || {}).textContent, mic: !!document.querySelector('.ai-mic[data-a="ac-detta"].acceso'), campo: ($('#ac-testo') || {}).placeholder, sblocco: window.__parla[0] }));
    if (a.stato !== 'avvio' || !/Accendo il microfono/.test(a.pann || '') || !a.mic || a.campo !== 'Ti ascolto…') throw new Error('nella pagina Aiutante al tocco non si vede che parte: ' + JSON.stringify(a));
    if (!a.sblocco || a.sblocco.vol !== 0 || a.sblocco.tocco === false) throw new Error('la voce non viene sbloccata dentro il tocco (iOS): ' + JSON.stringify(a.sblocco));
    await page.locator('[data-vc="stop"]').click(); await page.waitForTimeout(900);
    const b = await page.evaluate(() => ({ stato: VC.stato, media: !!VC.media, chiuse: window.__chiuse, vc: document.getElementById('vc').hidden }));
    if (b.stato || b.media || b.chiuse !== 1 || !b.vc) throw new Error('«Annulla» durante l\'accensione non ferma il microfono: ' + JSON.stringify(b));
    // 2) giro intero: avvio → registro (barrette che seguono la voce) → capisco con i testi che cambiano → risposta letta
    await page.locator('.ai-mic[data-a="ac-detta"]').click(); await page.waitForTimeout(1500);   // 0,7 s di accensione + più di 0,5 s di frase
    const c = await page.evaluate(() => ({ stato: VC.stato, pann: (document.querySelector('#vc:not([hidden]) .vc-pannello b') || {}).textContent }));
    if (c.stato !== 'registro' || !/attenzione/.test(c.pann || '')) throw new Error('dopo l\'accensione non registra: ' + JSON.stringify(c));
    await foto('43-voce-c110-ascolto');
    await page.evaluate(() => fermaAscoltoCliente()); await page.waitForTimeout(400);
    const d = await page.evaluate(() => { const p = document.querySelector('#vc:not([hidden]) .vc-pannello'); if (p) p.__mio = 1; return { stato: VC.stato, testo: p && p.querySelector('p') ? p.querySelector('p').textContent : '' }; });
    if (d.stato !== 'capisco' || !/capendo/.test(d.testo)) throw new Error('attesa del server senza pannello: ' + JSON.stringify(d));
    await page.waitForTimeout(2500);
    const e = await page.evaluate(() => { const p = document.querySelector('#vc:not([hidden]) .vc-pannello'); return { stesso: !!(p && p.__mio), testo: p && p.querySelector('p') ? p.querySelector('p').textContent : '' }; });
    if (!e.stesso || !/nomi dei piatti/.test(e.testo)) throw new Error('il testo dell\'attesa non cambia (o il pannello lampeggia): ' + JSON.stringify(e));
    await foto('44-voce-c110-attesa');
    await page.waitForTimeout(1200);
    const g = await page.evaluate(() => ({ msgs: AIC.msgs.map(m => m.t), parla: window.__parla.filter(x => x.vol !== 0).map(x => x.t).join(' '), tasto: (document.querySelector('.vc-ascolta') || {}).textContent }));
    if (g.msgs[0] !== 'due teglie di lasagne al ragù per sabato' || !g.parla || !/Riascolta/.test(g.tasto || '')) throw new Error('la risposta non viene letta o manca «Riascolta»: ' + JSON.stringify(g).slice(0, 300));
    if (/scaricando/i.test(await page.evaluate(() => (document.querySelector('.toast') || {}).textContent || ''))) throw new Error('al cliente compare «la voce si sta scaricando» (non è vero)');
    // 3) la voce non parte (iOS muto) → dopo 3 s «Ascolta la risposta»; un tocco la legge
    await page.waitForTimeout(3300);
    const h = await page.evaluate(() => ({ tasto: (document.querySelector('.vc-ascolta.forte') || {}).textContent, n: window.__parla.length }));
    if (!/Ascolta la risposta/.test(h.tasto || '')) throw new Error('con la voce muta non compare «Ascolta la risposta»: ' + JSON.stringify(h));
    await foto('45-voce-c110-ascolta');
    await page.locator('.vc-ascolta').first().click(); await page.waitForTimeout(300);
    const k = await page.evaluate(() => window.__parla.slice(-1)[0]);
    if (!k || !k.t || k.vol === 0 || k.tocco === false) throw new Error('«Ascolta la risposta» non legge dentro il tocco: ' + JSON.stringify(k));
    await page.evaluate(() => { delete navigator.userAgent; delete navigator.standalone; delete window.speechSynthesis; S.impostazioni.voceClientiRisponde = false; AIC.msgs = []; UI.vista = 'menu'; render(); });
  });
  await passo('voce dei clienti C108: Mario che guarda come cliente → al server la strada dei clienti (Deepgram), 🎧 chi ha sentito nella barra sviluppatore', async () => {   // autonomo
    await page.evaluate(() => { if (ascoltoInCorso()) fermaAscoltoCliente(); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { window.__primaDev = [UI.devCliente, P.sviluppatore, P.ruolo];
      P.ruolo = 'cliente'; P.benvenuto = true; UI.devCliente = true; P.sviluppatore = true; UI.foglio = null; UI.modifica = null; UI.ultimoAscolto = ''; UI.vista = 'menu'; AIC.msgs = []; AIC.attesa = false;
      S.impostazioni.voceClientiMotore = 'preciso'; S.impostazioni.voceClientiRisponde = false; S.impostazioni.voceClientiConferma = false; VC.rec = null; VC.media = null; statoVC('', '');
      if (!navigator.mediaDevices) Object.defineProperty(navigator, 'mediaDevices', { value: {}, configurable: true });
      navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [] });
      window.MediaRecorder = class { constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; } start() { this.state = 'recording'; } stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob([new Uint8Array(3000)]) }); this.onstop(); } static isTypeSupported() { return true; } };
      window.ascoltaServerFinto = async b => { window.__mandato = b; return { testo: 'un chilo di polpette di carne per domani', motore: 'groq:whisper-large-v3+deepgram → qwen/qwen3.8-27b' }; }; render(); });
    await page.locator('.vc-fab').click(); await page.waitForTimeout(700);
    const st = await page.evaluate(() => [VC.stato, !!VC.media]);
    if (st[0] !== 'registro' || !st[1]) throw new Error('guarda come cliente: ascolto preciso non partito: ' + JSON.stringify(st));
    await page.evaluate(() => fermaAscoltoCliente()); await page.waitForTimeout(900);
    const d = await page.evaluate(() => ({ come: (window.__mandato || {}).comeCliente, asc: UI.ultimoAscolto, barra: barraDev() }));   // la barra sta in pagina solo sul sito vero (Dati.attivo)
    await page.evaluate(() => { [UI.devCliente, P.sviluppatore, P.ruolo] = window.__primaDev; UI.ultimoAscolto = ''; delete S.impostazioni.voceClientiConferma; AIC.msgs = []; UI.vista = 'menu'; render(); });
    if (d.come !== true || d.asc !== 'Groq + Deepgram · corretto' || !d.barra.includes('<span class="dev-asc">🎧 Groq + Deepgram · corretto</span>')) throw new Error('guarda come cliente: strada o 🎧 sbagliati: ' + JSON.stringify(d).slice(0, 300));
  });
  await passo('ricettario C124: «🏋️ Proteiche», difficoltà, valori per porzione, fonte, tasto Database diretto, Ricettario in vista nella Home', async () => {   // autonomo
    await page.evaluate(() => {
      window.__primaC124 = [P.ruolo, UI.devCliente]; P.ruolo = 'monica'; P.guida = true; P.homeNo = true; UI.devCliente = false; UI.foglio = null; UI.modifica = null; S.impostazioni.ricettario = true;
      const ora = Date.now(), nu = (kcal, prot, saturi, zuc, sodio) => ({ kcal, prot, carb: 30, grassi: 8, saturi, zuc, fibre: 3, sodio });
      const ss = [
        { id: 'gz:Pollo-fit-prova', nome: 'Pollo fit prova', zona: 'italiana', categoria: 'secondi', foto: '', aggiunta: ora, totale: 30, difficolta: 'Facile', cerca: 'pollo', nutr: nu(380, 38, 2, 3, 400) },
        { id: 'gz:Merluzzo-fit-prova', nome: 'Merluzzo fit prova', zona: 'italiana', categoria: 'secondi', foto: '', aggiunta: ora - 1, totale: 25, difficolta: 'Molto facile', cerca: 'merluzzo', nutr: nu(300, 27, 1, 2, 350) },
        { id: 'gz:Carbonara-prova', nome: 'Carbonara prova', zona: 'italiana', categoria: 'primi', foto: '', aggiunta: ora - 2, totale: 30, difficolta: 'Media', cerca: 'uova guanciale', nutr: nu(558.7, 22.8, 9, 2.5, 475) },
        { id: 'gz:Salata-prova', nome: 'Salata prova', zona: 'italiana', categoria: 'secondi', foto: '', aggiunta: ora - 3, totale: 30, difficolta: 'Difficile', cerca: 'sale', nutr: nu(400, 35, 2, 2, 1500) },
        { id: 'gz:Senza-valori-prova', nome: 'Senza valori prova', zona: 'italiana', categoria: 'secondi', foto: '', aggiunta: ora - 4, totale: 30, difficolta: 'Molto difficile', cerca: 'niente', nutr: null }];
      const st = { ricette: 5, coda: 0, voci: 0, mbVoci: 0, oggi: 0, pausa: false, scelte: 5, nelRicettario: 5, conValori: 4, senzaValori: 1, paroleFit: ['proteiche', 'tonno'], fitI: 1, paginaFit: '', giri: 3, fonte: 1, fonti: 10 };
      window.__fit = [];
      RIC.chiedi = async c => c.db === 'mie' ? { scelte: ss } : c.db === 'fit' ? (window.__fit.push(c), { db: Object.assign({}, st, { paroleFit: c.base ? ['proteiche'] : String(c.parole).split(',').map(x => x.trim()).filter(Boolean) }) })
        : c.db ? { db: st } : { ricette: [], prossima: '' };
      salvaScelte(ss); localStorage.removeItem('pit-ric-filtri'); localStorage.removeItem('pit-ric-cache'); UI.ric = null; RIC.cerca = { stato: '', risultati: [] }; RIC.db = null; RIC.dbOra = 0; RIC.scelteOra = Date.now();
      salvaCache({ id: 'gz:Pollo-fit-prova', v: 4, nome: 'Pollo fit prova', url: 'https://ricette.giallozafferano.it/Pollo-fit-prova.html', porzioni: 4, prep: 10, cottura: 20, difficolta: 'Facile',
        ingredienti: [{ nome: 'Petto di pollo', q: 600, u: 'g' }, { nome: 'Limone', q: 1, u: '' }, { nome: 'Sale', q: null, u: '' }], passi: [{ t: 'Tagliate il pollo.', foto: [] }, { t: 'Cuocete 20 minuti.', foto: [] }], nutr: nu(380, 38, 2, 3, 400) });
      UI.vista = 'home'; render();
    });
    await page.waitForFunction(() => RIC.stato === 'pronto', null, { timeout: 30000 }); await page.evaluate(() => render());
    /* Home: Ricettario e Proteiche subito sotto i 4 riquadri, coi numeri */
    const home = await page.evaluate(() => { const r = document.querySelector('main .riquadri'), d = r && r.nextElementSibling; return { dopo: d ? d.className : '', testo: d ? d.innerText : '' }; });
    if (!/ric-home-due/.test(home.dopo) || !/Ricettario/.test(home.testo) || !/Proteiche\s*\n?2 ricette/.test(home.testo)) throw new Error('Home: Ricettario non subito sotto i 4 riquadri o numeri sbagliati: ' + JSON.stringify(home));
    await page.waitForTimeout(900); await foto('46-c124-home');   // i riquadri entrano con una piccola animazione
    /* «🏋️ Proteiche» dalla Home: solo quelle giuste, prima più proteine per caloria, riga «perché è qui» */
    await clic('[data-a="ric-vai-fit"]');
    const fit = await page.evaluate(() => ({ vista: UI.vista, zona: UI.ric.zona, premuto: (document.querySelector('[data-a="ric-zona"][aria-pressed="true"]') || {}).textContent, nomi: [...document.querySelectorAll('main .ric-elenco .ric-carta b')].map(b => b.textContent.replace(/^\W+/u, '')), riga: (document.querySelector('.ric-valori-riga') || {}).textContent, nota: !!document.querySelector('.ric-carica') && !document.querySelector('.ric-nota-fit'), fonte: (document.querySelector('.ric-carta .ric-fonte') || {}).textContent }));
    if (fit.vista !== 'ricettario' || fit.zona !== 'fit' || !/Proteiche/.test(fit.premuto || '')) throw new Error('«Proteiche» dalla Home non apre la sezione: ' + JSON.stringify(fit));
    if (JSON.stringify(fit.nomi.filter(n => /prova$/.test(n))) !== '["Pollo fit prova","Merluzzo fit prova"]') throw new Error('Proteiche: ricette o ordine sbagliati (carbonara 559 kcal, sale alto, senza valori: fuori): ' + JSON.stringify(fit.nomi));
    if (fit.riga !== '💪 38 g proteine · 380 kcal · sale 1 g' || !fit.nota || fit.fonte !== 'GialloZafferano') throw new Error('Proteiche: riga dei valori, nota o fonte sbagliate: ' + JSON.stringify(fit));
    await foto('47-c124-proteiche');
    /* difficoltà in vista (Facili comprende «Molto facile», Difficili «Molto difficile») */
    await clic('[data-a="ric-zona"][data-v="tutte"]'); await clic('[data-a="ric-piu"]'); await clic('[data-a="ric-diff"][data-v="facile"]');   // C127: dentro «⚙️»
    let nomi = await page.evaluate(() => [...document.querySelectorAll('main .ric-elenco .ric-carta b')].map(b => b.textContent.replace(/^\W+/u, '')).filter(n => /prova$/.test(n)).sort());
    if (JSON.stringify(nomi) !== '["Merluzzo fit prova","Pollo fit prova"]') throw new Error('«Facili» sbagliato: ' + JSON.stringify(nomi));
    await clic('[data-a="ric-diff"][data-v="difficile"]');
    nomi = await page.evaluate(() => [...document.querySelectorAll('main .ric-elenco .ric-carta b')].map(b => b.textContent.replace(/^\W+/u, '')).filter(n => /prova$/.test(n)).sort());
    if (JSON.stringify(nomi) !== '["Salata prova","Senza valori prova"]') throw new Error('«Difficili» sbagliato: ' + JSON.stringify(nomi));
    await clic('[data-a="ric-diff"][data-v="difficile"]');   // ritocco = tolto
    if (await page.evaluate(() => UI.ric.diff)) throw new Error('ritoccare «Difficili» non toglie il filtro');
    /* ordina «🔥 Meno calorie» */
    await clic('[data-a="ric-ordine"][data-v="kcal"]');   // «⚙️» già aperto
    nomi = await page.evaluate(() => [...document.querySelectorAll('main .ric-elenco .ric-carta b')].map(b => b.textContent.replace(/^\W+/u, '')).filter(n => /prova$/.test(n)));
    if (nomi[0] !== 'Merluzzo fit prova' || nomi[nomi.length - 1] !== 'Senza valori prova') throw new Error('«Meno calorie» non ordina (senza valori in fondo): ' + JSON.stringify(nomi));
    await page.evaluate(() => { UI.ric = null; localStorage.removeItem('pit-ric-filtri'); render(); });
    /* tasto «🗄 Database»: salto diretto, niente scorrimento lento (Mario 10/11) */
    const salto = await page.evaluate(() => { const v = []; const a = Element.prototype.scrollIntoView, b = window.scrollTo;
      Element.prototype.scrollIntoView = function (o) { v.push(o && o.behavior); }; window.scrollTo = o => v.push(o && o.behavior);
      const t = document.querySelector('.ric-salta'); if (t) t.click(); Element.prototype.scrollIntoView = a; window.scrollTo = b; return { c: !!t, v }; });
    if (!salto.c || salto.v[0] !== 'instant') throw new Error('«🗄 Database» non salta diretto: ' + JSON.stringify(salto));
    /* ricetta: fonte col link all'originale e «Valori per porzione» */
    await page.evaluate(() => vai('ricetta:gz:Pollo-fit-prova')); await page.waitForTimeout(300);
    const ric = await page.evaluate(() => ({ fonte: (document.querySelector('.ric-fonte-riga') || {}).innerText, link: (document.querySelector('.ric-fonte-riga a') || {}).href, valori: (document.querySelector('.ric-valori') || {}).innerText }));
    if (!/Fonte: GialloZafferano/.test(ric.fonte || '') || ric.link !== 'https://ricette.giallozafferano.it/Pollo-fit-prova.html') throw new Error('ricetta: fonte o link sbagliati: ' + JSON.stringify(ric));
    if (!/Proteica/.test(ric.valori || '') || !/380\s*kcal/.test(ric.valori) || !/38 g\s*proteine/.test(ric.valori) || !/sale 1 g/.test(ric.valori) || !/per 1 porzione \(la ricetta è per 4\)/.test(ric.valori)) throw new Error('ricetta: valori per porzione sbagliati: ' + JSON.stringify(ric.valori));
    await page.evaluate(() => { const v = document.querySelector('.ric-valori'); if (v) v.scrollIntoView({ block: 'start' }); });
    await foto('48-c124-ricetta-valori');
    /* Database: valori letti, parole della corsia fit cambiate dall'app («salvato» solo dopo la risposta) */
    await page.evaluate(() => { RIC.dbOra = 0; vai('ricdb'); }); await page.waitForTimeout(400); await page.evaluate(() => render());
    const db = await page.evaluate(() => ({ t: (document.querySelector('#ricdb-fit') || {}).innerText, p: (document.querySelector('#ric-fit-parole') || {}).value }));
    if (!/Ricette proteiche: 2/.test(db.t || '') || !/letti: 4 ricette, 1 ancora da leggere/.test(db.t) || !/adesso «tonno»/.test(db.t) || db.p !== 'proteiche, tonno') throw new Error('Database: riquadro proteiche sbagliato: ' + JSON.stringify(db));
    await page.locator('#ric-fit-parole').fill('pollo, orata'); await page.locator('#ric-fit-parole').dispatchEvent('change'); await page.waitForTimeout(300);
    const dopo = await page.evaluate(() => ({ chiesto: window.__fit.slice(-1)[0], parole: RIC.db.paroleFit, toast: (document.querySelector('.toast') || {}).textContent }));
    if (!dopo.chiesto || dopo.chiesto.parole !== 'pollo, orata' || JSON.stringify(dopo.parole) !== '["pollo","orata"]' || !/Salvato: 2 parole/.test(dopo.toast || '')) throw new Error('Database: parole fit non salvate: ' + JSON.stringify(dopo));
    /* aiutante: «dove trovo le ricette proteiche?» → dritto alla sezione */
    const ai = await page.evaluate(() => { const c = capisciDove('dove trovo le ricette proteiche per la palestra?'); return c && c[0] && Object.assign({ voce: c[0].voce }, controllaAI(c[0])); });
    if (!ai || ai.voce !== 'ricettario-fit' || ai.vai !== 'ricettario' || !ai.ui || ai.ui.ricZona !== 'fit') throw new Error('aiutante: «ricette proteiche» non porta alla sezione: ' + JSON.stringify(ai));
    await page.evaluate(() => { [P.ruolo, UI.devCliente] = window.__primaC124; UI.ric = null; localStorage.removeItem('pit-ric-filtri'); localStorage.removeItem('pit-ric-cache'); salvaScelte([]); RIC.db = null; UI.vista = 'home'; render(); });
  });
  await passo('ricettario C125: Proteiche con Pasti, Snack e dolci, «⚡ Pronte in 10 minuti», nota con le due regole', async () => {   // autonomo
    await page.evaluate(() => {
      window.__primaC125 = [P.ruolo, UI.devCliente]; P.ruolo = 'monica'; P.guida = true; P.homeNo = true; UI.devCliente = false; UI.foglio = null; UI.modifica = null; S.impostazioni.ricettario = true;
      const ora = Date.now(), nu = (kcal, prot, saturi, zuc, sodio) => ({ kcal, prot, carb: 20, grassi: 5, saturi, zuc, fibre: 2, sodio });
      const ss = [
        { id: 'gz:Pollo-fit-prova', nome: 'Pollo fit prova', zona: 'italiana', categoria: 'Secondi piatti', foto: '', aggiunta: ora, totale: 30, difficolta: 'Facile', cerca: 'pollo', nutr: nu(380, 38, 2, 3, 400) },
        { id: 'gz:Frittata-albumi-prova', nome: 'Frittata albumi prova', zona: 'italiana', categoria: 'secondi', foto: '', aggiunta: ora - 1, totale: 10, difficolta: 'Facile', cerca: 'albumi', nutr: nu(250, 30, 2, 1, 300) },
        { id: 'rf:budino-proteico-prova', nome: 'Budino proteico prova', zona: 'italiana', categoria: 'Dolci', foto: '', aggiunta: ora - 2, totale: 5, difficolta: 'Facile', cerca: 'budino', nutr: nu(180, 18, 1, 5, 150) },
        { id: 'gz:Carbonara-prova', nome: 'Carbonara prova', zona: 'italiana', categoria: 'primi', foto: '', aggiunta: ora - 3, totale: 30, difficolta: 'Media', cerca: 'uova', nutr: nu(558.7, 22.8, 9, 2.5, 475) }];
      RIC.chiedi = async c => c.db === 'mie' ? { scelte: ss } : c.db ? { db: { ricette: 40, coda: 0, scelte: 4, conValori: 4, senzaValori: 0, paroleFit: [], giri: 1, fonte: 1, fonti: 10, rf: { lette: 5, tot: 906, inCoda: 0, scartate: 0, i: 5, fine: '', spento: false } } } : { ricette: [], prossima: '' };
      salvaScelte(ss); localStorage.removeItem('pit-ric-filtri'); UI.ric = null; RIC.cerca = { stato: '', risultati: [] }; RIC.db = null; RIC.dbOra = 0; RIC.scelteOra = Date.now();
      UI.ricZona = 'fit'; UI.vista = 'ricettario'; render();
    });
    await page.waitForFunction(() => RIC.stato === 'pronto', null, { timeout: 30000 }); await page.evaluate(() => render());
    const nomi = () => page.evaluate(() => [...document.querySelectorAll('main .ric-elenco .ric-carta b')].map(b => b.textContent.replace(/^\W+/u, '')).filter(n => /prova$/.test(n)));
    const st0 = await page.evaluate(() => ({ nota: !!document.querySelector('.ric-nota-fit'), oggi: (document.querySelector('.ric-carica-oggi') || {}).innerText || '' }));
    if (st0.nota || !/Oggi \+3 entrate in Proteiche ✅ · 1 letta che non passa le regole/.test(st0.oggi)) throw new Error('Proteiche (C127): regole aperte da sole o «Oggi» sbagliato: ' + JSON.stringify(st0));
    await clic('[data-a="ric-regole"]');
    const st = await page.evaluate(() => ({ scelte: [...document.querySelectorAll('.ric-fit-scelte .scelta')].map(b => b.textContent), nota: (document.querySelector('.ric-nota-fit') || {}).innerText || '' }));
    if (JSON.stringify(st.scelte) !== '["🌅 Colazione","🍎 Spuntino","🧃 Merenda","🍝 Pranzo","🍽 Cena","🌙 Dopo cena","🍰 Dolci","💪 Dopo l\'allenamento","⚡ Pronte in 10 minuti"]') throw new Error('Proteiche: momenti e ⚡ mancanti (C126): ' + JSON.stringify(st.scelte));
    if (!/Pasti: almeno 25 g di proteine/.test(st.nota) || !/Snack e dolci: fino a 300 kcal/.test(st.nota) || !/RicetteFit/.test(st.nota)) throw new Error('Proteiche: nota senza le due regole: ' + st.nota);
    let n = await nomi();
    if (JSON.stringify(n) !== '["Frittata albumi prova","Budino proteico prova","Pollo fit prova"]') throw new Error('Proteiche: elenco o ordine sbagliati (carbonara fuori, prima più proteine per caloria): ' + JSON.stringify(n));
    const conta = await page.evaluate(() => (document.querySelector('.ric-conta') || {}).innerText || '');
    if (!/3 ricette: GialloZafferano 2 · RicetteFit 1/.test(conta)) throw new Error('Proteiche: numero per fonte mancante: ' + conta);
    await page.evaluate(() => { window.__cf125 = 0; const c0 = RIC.chiedi; RIC.chiedi = c => { if (c.db === 'cercaFit') window.__cf125++; return c0(c); }; });
    await clic('[data-a="ric-fit-tipo"][data-v="cena"]'); n = await nomi();
    const cerca = await page.evaluate(() => RIC.fitCerca && { mom: RIC.fitCerca.mom, testo: RIC.fitCerca.testo });
    if (JSON.stringify(n) !== '["Frittata albumi prova","Pollo fit prova"]' || !cerca || cerca.mom !== 's:cena|' || cerca.testo !== 'Cena') throw new Error('«🍽 Cena» sbagliato (elenco o ricerca del momento): ' + JSON.stringify({ n, cerca }));
    /* C127 scelta MULTIPLA (Mario 10/11 «multi scelta»): Cena + Dolci = l'una O l'altra, ricordata; spegnere = solo filtra, niente ricerca */
    await clic('[data-a="ric-fit-tipo"][data-v="dolci"]'); n = await nomi();
    const multi = await page.evaluate(() => ({ fit: UI.ric.fit, salvato: JSON.parse(localStorage.getItem('pit-ric-filtri')).fit, accesi: [...document.querySelectorAll('.ric-fit-scelte [aria-pressed="true"]')].map(b => b.dataset.v), cerche: window.__cf125 }));
    if (JSON.stringify(n) !== '["Frittata albumi prova","Budino proteico prova","Pollo fit prova"]' || multi.fit !== 'cena,dolci' || multi.salvato !== 'cena,dolci' || JSON.stringify(multi.accesi) !== '["cena","dolci"]' || multi.cerche !== 2) throw new Error('«🍽 Cena» + «🍰 Dolci» (scelta multipla) sbagliato: ' + JSON.stringify({ n, multi }));
    await clic('[data-a="ric-fit-tipo"][data-v="cena"]'); n = await nomi();
    const spento = await page.evaluate(() => ({ fit: UI.ric.fit, cerche: window.__cf125 }));
    if (JSON.stringify(n) !== '["Budino proteico prova"]' || spento.fit !== 'dolci' || spento.cerche !== 2) throw new Error('spegnere «🍽 Cena» non toglie solo lei o cerca ancora: ' + JSON.stringify({ n, spento }));
    const riga = await page.evaluate(() => (document.querySelector('main .ric-elenco .ric-carta .ric-valori-riga') || {}).textContent || '');
    if (!/snack o dolce/.test(riga)) throw new Error('«🍰 Dolci»: riga senza «snack o dolce»: ' + riga);
    await clic('[data-a="ric-fit-tipo"][data-v="dolci"]'); await clic('[data-a="ric-fit-tipo"][data-v="pranzo"]'); n = await nomi();
    if (n.length) throw new Error('«🍝 Pranzo»: secondi e dolci non sono pranzo: ' + JSON.stringify(n));
    await clic('[data-a="ric-fit-tipo"][data-v="pranzo"]'); await clic('[data-a="ric-fit-tipo"][data-v="dopocena"]'); n = await nomi();
    if (JSON.stringify(n) !== '["Budino proteico prova"]') throw new Error('«🌙 Dopo cena» sbagliato: ' + JSON.stringify(n));
    await clic('[data-a="ric-fit-tipo"][data-v="dopocena"]');   // ritocco = tolto
    /* fonti proteiche sempre in vista, anche più di una (O fra loro), E coi momenti */
    const np = await page.evaluate(() => ({ n: document.querySelectorAll('.ric-prot-scelte .scelta').length, apri: !!document.querySelector('[data-a="ric-prot-apri"]') }));
    await clic('[data-a="ric-prot"][data-v="pollo"]'); n = await nomi();
    const cp = await page.evaluate(() => RIC.fitCerca && RIC.fitCerca.mom);
    if (np.n < 15 || np.apri || JSON.stringify(n) !== '["Pollo fit prova"]' || cp !== 's:|pollo') throw new Error('fonte proteica «🍗 Pollo» sbagliata: ' + JSON.stringify({ np, n, cp }));
    await clic('[data-a="ric-prot"][data-v="albumi"]'); n = await nomi();
    if (JSON.stringify(n) !== '["Frittata albumi prova","Pollo fit prova"]') throw new Error('«🍗 Pollo» + «🥚 Albumi» (l\'una o l\'altra) sbagliato: ' + JSON.stringify(n));
    await clic('[data-a="ric-fit-tipo"][data-v="dolci"]'); n = await nomi();
    if (n.length) throw new Error('«🍰 Dolci» con pollo o albumi: nessuna (i due gruppi valgono insieme): ' + JSON.stringify(n));
    await clic('[data-a="ric-fit-tipo"][data-v="dolci"]'); await clic('[data-a="ric-prot"][data-v="pollo"]'); await clic('[data-a="ric-prot"][data-v="albumi"]');
    if (await page.evaluate(() => UI.ric.prot || UI.ric.fit)) throw new Error('ritoccare le fonti non le toglie');
    /* «Altre ▾»: Sarde, Italiane, Le mie dentro; scelta una, il tasto dice quale */
    await clic('[data-a="ric-zone-altre"]'); await clic('[data-a="ric-zona"][data-v="mie"]');
    const al = await page.evaluate(() => ({ zona: UI.ric.zona, t: (document.querySelector('[data-a="ric-zone-altre"]') || {}).textContent, p: (document.querySelector('[data-a="ric-zone-altre"]') || {}).getAttribute('aria-pressed'), riga: !!document.querySelector('[aria-label="Altre"]') }));
    if (al.zona !== 'mie' || al.t !== 'Le mie ▾' || al.p !== 'true' || al.riga) throw new Error('«Altre ▾» sbagliato: ' + JSON.stringify(al));
    await clic('[data-a="ric-zona"][data-v="fit"]');
    await clic('.ric-fit-scelte [data-a="ric-tempo"]'); n = await nomi();
    if (JSON.stringify(n) !== '["Frittata albumi prova","Budino proteico prova"]') throw new Error('«⚡ Pronte in 10 minuti» sbagliato: ' + JSON.stringify(n));
    await foto('48b-c125-proteiche-scelte');
    await clic('[data-a="ric-fit-tipo"][data-v="cena"]'); await clic('[data-a="ric-prot"][data-v="pollo"]');
    await clic('[data-a="ric-zona"][data-v="tutte"]');
    const via = await page.evaluate(() => ({ fit: UI.ric.fit, prot: UI.ric.prot, tempo: UI.ric.tempo, scelte: !!document.querySelector('.ric-fit-scelte') }));
    if (via.fit || via.prot || via.tempo || via.scelte) throw new Error('uscendo da Proteiche restano Pasti o ⚡: ' + JSON.stringify(via));
    /* Database: numeri per fonte del motore e delle proteiche */
    await page.evaluate(() => { RIC.dbOra = 0; vai('ricdb'); }); await page.waitForTimeout(400); await page.evaluate(() => render());
    const dbf = await page.evaluate(() => ({ m: (document.querySelector('#ricdb-archivio .ricdb-fonti') || {}).innerText, f: (document.querySelector('#ricdb-fit') || {}).innerText || '' }));
    if (dbf.m !== 'GialloZafferano 35 · RicetteFit 5' || !/Ricette proteiche: 3\s*GialloZafferano 2 · RicetteFit 1/.test(dbf.f)) throw new Error('Database: numeri per fonte sbagliati: ' + JSON.stringify(dbf));
    await page.evaluate(() => { [P.ruolo, UI.devCliente] = window.__primaC125; UI.ric = null; localStorage.removeItem('pit-ric-filtri'); salvaScelte([]); RIC.db = null; UI.vista = 'home'; render(); });
  });
  await passo('ricettario C125 cerca fit: parole pronte, tasto e invio cercano su GZ e RicetteFit, esito detto, errore detto, fuori da Proteiche la ricerca di sempre', async () => {   // autonomo
    await page.evaluate(() => {
      window.__primaC125c = [P.ruolo, UI.devCliente]; P.ruolo = 'monica'; P.guida = true; P.homeNo = true; UI.devCliente = false; UI.foglio = null; UI.modifica = null; S.impostazioni.ricettario = true;
      const ss = [{ id: 'rf:budino-proteico-prova', nome: 'Budino proteico prova', zona: 'italiana', categoria: 'Dolci', foto: '', aggiunta: Date.now(), totale: 5, difficolta: 'Facile', cerca: 'budino cacao', nutr: { kcal: 180, prot: 18, carb: 15, grassi: 5, saturi: 1, zuc: 5, fibre: 2, sodio: 150 } }];
      window.__cf = []; window.__cfRisp = { q: 'budino', gz: 3, rf: 1, nuove: 3, gia: 1 };
      RIC.chiedi = async c => { if (c.db === 'cercaFit') { window.__cf.push(c); return window.__cfRisp; } if (c.cerca || c.cat) window.__cf.push({ gz: c.cerca }); return c.db === 'mie' ? { scelte: ss } : c.db ? { db: { ricette: 1, coda: 0, scelte: 1, conValori: 1, senzaValori: 0, paroleFit: [], giri: 1, fonte: 1, fonti: 10 } } : { ricette: [], prossima: '' }; };
      salvaScelte(ss); localStorage.removeItem('pit-ric-filtri'); UI.ric = null; RIC.cerca = { stato: '', risultati: [] }; RIC.fitCerca = null; RIC.db = null; RIC.dbOra = 0; RIC.scelteOra = Date.now();
      UI.ricZona = 'fit'; UI.vista = 'ricettario'; render();
    });
    await page.waitForFunction(() => RIC.stato === 'pronto', null, { timeout: 30000 }); await page.evaluate(() => render());
    const box = await page.evaluate(() => ({ vecchie: document.querySelectorAll('.ric-cerca-fit [data-a="ric-cerca-fit"][data-v]').length, testo: (document.querySelector('.ric-cerca-fit') || {}).innerText || '', ph: document.getElementById('ric-cerca').placeholder }));
    if (box.vecchie || !/Cerca altre/.test(box.testo) || !/Tocca e cerco ricette fit nuove su GialloZafferano e RicetteFit/.test(box.testo) || !/Cerca ricette fit/.test(box.ph)) throw new Error('Proteiche: riquadro verde senza «🔍 Cerca altre» (C127): ' + JSON.stringify(box));
    /* C126 (Mario 14:10 «senza selezionare… mi cerca tutto nei siti»): niente momento né parola = cerca tutto */
    await clic('[data-a="ric-cerca-fit-tutto"]'); await page.waitForTimeout(200);
    const tutto = await page.evaluate(() => ({ chiesto: window.__cf.slice(-1)[0], esito: (document.querySelector('.ric-cerca-fit') || {}).innerText || '' }));
    if (!tutto.chiesto || tutto.chiesto.tutto !== true || tutto.chiesto.qq || !/Trovate 3 ricette nuove su tutti i siti/.test(tutto.esito)) throw new Error('«Cerca nuove ricette fit su tutti i siti» sbagliato: ' + JSON.stringify(tutto));
    await clic('[data-a="ric-fit-tipo"][data-v="dopocena"]'); await page.waitForTimeout(200);
    let st = await page.evaluate(() => ({ chiesto: window.__cf.slice(-1)[0], esito: (document.querySelector('.ric-cerca-fit') || {}).innerText || '', nomi: [...document.querySelectorAll('main .ric-elenco .ric-carta b')].map(b => b.textContent.replace(/^\W+/u, '')), timer: !!RIC.fitTimer }));
    if (!st.chiesto || st.chiesto.q !== 'Dopo cena' || !Array.isArray(st.chiesto.qq) || st.chiesto.qq.length !== 4 || !st.chiesto.qq.includes('budino proteico') || !/Trovate 3 ricette nuove con «Dopo cena» \(un'altra l'avevo già letta\)/.test(st.esito) || !st.timer) throw new Error('«🌙 Dopo cena»: ricerca del momento o esito sbagliati: ' + JSON.stringify(st));
    if (JSON.stringify(st.nomi.filter(n => /prova$/.test(n))) !== '["Budino proteico prova"]') throw new Error('«🌙 Dopo cena»: elenco qui sotto non filtrato: ' + JSON.stringify(st.nomi));
    await foto('48c-c125-cerca-fit');
    /* C127 «🔍 Cerca altre» con più scelte: nomi nell'esito, 4 parole a turno (una per scelta); spegnere una scelta non cerca */
    await clic('[data-a="ric-prot"][data-v="pollo"]'); await clic('[data-a="ric-cerca-fit-tutto"]'); await page.waitForTimeout(200);
    st = await page.evaluate(() => ({ chiesto: window.__cf.slice(-1)[0], esito: (document.querySelector('.ric-cerca-fit') || {}).innerText || '', n: window.__cf.length }));
    if (!st.chiesto || st.chiesto.q !== 'Dopo cena, Pollo' || JSON.stringify(st.chiesto.qq) !== '["dessert proteico","pollo","budino proteico","mousse proteica"]' || !/Trovate 3 ricette nuove con «Dopo cena, Pollo»/.test(st.esito)) throw new Error('«Cerca altre» con Dopo cena e Pollo sbagliato: ' + JSON.stringify(st));
    await clic('[data-a="ric-prot"][data-v="pollo"]'); await clic('[data-a="ric-fit-tipo"][data-v="dopocena"]');
    const n1 = await page.evaluate(() => ({ n: window.__cf.length, testo: (document.querySelector('.ric-cerca-fit') || {}).innerText || '' }));
    if (n1.n !== st.n || !/Tocca e cerco ricette fit nuove/.test(n1.testo)) throw new Error('spegnere le scelte ha cercato o lasciato l\'esito vecchio: ' + JSON.stringify(n1));
    /* scritta a mano e invio (anche dalla tastiera): niente ricerca generica di GialloZafferano dentro Proteiche */
    await page.evaluate(() => { window.__cfRisp = { errore: 'GialloZafferano e RicetteFit non rispondono adesso: riprova fra poco' }; });
    await page.locator('#ric-cerca').fill('salmone'); await page.locator('#ric-cerca').press('Enter'); await page.waitForTimeout(250);
    st = await page.evaluate(() => ({ ultimi: window.__cf.slice(-1), esito: (document.querySelector('.ric-cerca-fit') || {}).innerText || '' }));
    if (!st.ultimi[0] || st.ultimi[0].q !== 'salmone' || !/Non riesco a cercare adesso \(GialloZafferano e RicetteFit non rispondono/.test(st.esito)) throw new Error('invio dentro Proteiche: errore non detto o ricerca sbagliata: ' + JSON.stringify(st));
    /* «Niente di nuovo»: tutte già lette */
    await page.evaluate(() => { window.__cfRisp = { nuove: 0, gia: 4 }; });
    await clic('.ric-cerca-fit .btn.pieno'); await page.waitForTimeout(200);
    st = await page.evaluate(() => (document.querySelector('.ric-cerca-fit') || {}).innerText || '');
    if (!/Niente di nuovo con «salmone»: le 4 trovate le avevo già lette/.test(st)) throw new Error('«niente di nuovo» non detto: ' + st);
    /* fuori da Proteiche: la ricerca di sempre su GialloZafferano */
    await clic('[data-a="ric-zona"][data-v="tutte"]'); const n0 = await page.evaluate(() => window.__cf.length);
    await page.locator('#ric-cerca').fill('lasagne'); await page.locator('#ric-cerca').press('Enter'); await page.waitForTimeout(250);
    st = await page.evaluate(n0 => ({ nuovi: window.__cf.slice(n0), box: !!document.querySelector('.ric-cerca-fit') }), n0);
    if (st.box || st.nuovi.some(c => c.q) || !st.nuovi.some(c => c.gz === 'lasagne')) throw new Error('fuori da Proteiche la ricerca non è quella di sempre: ' + JSON.stringify(st));
    await page.evaluate(() => { clearTimeout(RIC.fitTimer); RIC.fitTimer = null; RIC.fitCerca = null; [P.ruolo, UI.devCliente] = window.__primaC125c; UI.ric = null; localStorage.removeItem('pit-ric-filtri'); salvaScelte([]); RIC.db = null; RIC.cerca = { stato: '', risultati: [] }; UI.vista = 'home'; render(); });
  });
  await passo('ricettario C128 lettura delle fonti: a che punto è (RicetteFit e valori, stima), «niente di nuovo» con le pagine guardate', async () => {   // autonomo
    await page.evaluate(() => {
      window.__primaC128 = [P.ruolo, UI.devCliente]; P.ruolo = 'monica'; P.guida = true; P.homeNo = true; UI.devCliente = false; UI.foglio = null; UI.modifica = null; S.impostazioni.ricettario = true;
      const ss = [{ id: 'rf:budino-proteico-prova', nome: 'Budino proteico prova', zona: 'italiana', categoria: 'Dolci', foto: '', aggiunta: Date.now(), totale: 5, difficolta: 'Facile', cerca: 'budino', nutr: { kcal: 180, prot: 18, carb: 15, grassi: 5, saturi: 1, zuc: 5, fibre: 2, sodio: 150 } }];
      window.__db128 = { ricette: 900, coda: 3, scelte: 1, conValori: 500, senzaValori: 400, daLeggere: 400, paroleFit: [], giri: 1, fonte: 1, fonti: 10,
        turbo: { attivo: true, auto: true, obiettivo: 200, fatte: 12, valori: 30, scartate: 0, da: Date.now() },
        rf: { lette: 230, tot: 905, inCoda: 5, scartate: 5, i: 240, fine: '', spento: false } };
      window.__cfRisp128 = { q: 'tutto', gz: 0, rf: 0, nuove: 0, gia: 23, pagine: 6 };
      RIC.chiedi = async c => c.db === 'cercaFit' ? window.__cfRisp128 : c.db === 'mie' ? { scelte: ss } : c.db ? { db: window.__db128 } : { ricette: [], prossima: '' };
      salvaScelte(ss); localStorage.removeItem('pit-ric-filtri'); UI.ric = null; RIC.cerca = { stato: '', risultati: [] }; RIC.fitCerca = null; RIC.db = null; RIC.dbOra = 0; RIC.scelteOra = Date.now();
      clearTimeout(RIC.turboTimer); RIC.turboTimer = null; UI.ricZona = 'fit'; UI.vista = 'ricettario'; render();
    });
    await page.waitForFunction(() => RIC.stato === 'pronto' && RIC.db && RIC.db.rf, null, { timeout: 30000 }); await page.evaluate(() => render());
    const carica = () => page.evaluate(() => { const b = document.querySelector('.ric-carica .ric-barra'); return { t: (document.querySelector('.ric-carica') || {}).innerText || '', barra: b ? b.getAttribute('aria-valuenow') : null }; });
    let nota = await carica();
    if (!/⏳ Sto caricando ricette nuove: RicetteFit 230 di 905 · valori ancora 400\. Finisco fra circa un'ora \(stima\)/.test(nota.t) || nota.barra !== '26' || !/Oggi \+1 entrata in Proteiche ✅/.test(nota.t) || /10 ogni 10 minuti/.test(nota.t)) throw new Error('Proteiche: lettura delle fonti non detta (C127 riquadro verde): ' + JSON.stringify(nota));
    await foto('48d-c128-lettura');
    /* fermo ma con cose da leggere: «parto da sola»; tutto letto: «Letto tutto», niente barra; senza rete: detto */
    await page.evaluate(() => { RIC.db = Object.assign({}, window.__db128, { turbo: null }); render(); });
    nota = await carica();
    if (!/⏳ Da leggere \(parto da sola entro 10 minuti\): RicetteFit 230 di 905/.test(nota.t)) throw new Error('Proteiche: «da leggere» non detto: ' + nota.t);
    await page.evaluate(() => { RIC.db = Object.assign({}, window.__db128, { turbo: null, daLeggere: 0, senzaValori: 0, rf: { lette: 880, tot: 905, scartate: 25, fine: new Date(Date.now() + 3600000).toISOString().slice(0, 10) } }); render(); });
    nota = await carica();
    if (!/✅ Letto tutto: RicetteFit 880 di 905 · valori tutti letti\./.test(nota.t) || nota.barra !== null) throw new Error('Proteiche: «letto tutto» non detto: ' + JSON.stringify(nota));
    await page.context().setOffline(true); await page.evaluate(() => { RIC.db = null; RIC.dbOra = Date.now(); render(); }); nota = await carica(); await page.context().setOffline(false);
    if (!/📵 Senza rete non so a che punto è il server/.test(nota.t)) throw new Error('Proteiche: senza rete non detto: ' + nota.t);
    await page.evaluate(() => { RIC.db = Object.assign({}, window.__db128, { turbo: null, daLeggere: 0, senzaValori: 0, rf: { lette: 880, tot: 905, scartate: 25, fine: new Date(Date.now() + 3600000).toISOString().slice(0, 10) } }); render(); });
    /* «Niente di nuovo» dice quante pagine ho guardato e che la prossima volta vado avanti */
    await clic('[data-a="ric-cerca-fit-tutto"]'); await page.waitForTimeout(200);
    const esito = await page.evaluate(() => (document.querySelector('.ric-cerca-fit') || {}).innerText || '');
    if (!/Niente di nuovo su tutti i siti \(ho guardato 6 pagine dei siti\): le 23 trovate le avevo già lette\. Tocca ancora: la prossima volta vado alle pagine dopo/.test(esito)) throw new Error('«niente di nuovo» senza le pagine: ' + esito);
    await page.evaluate(() => { clearTimeout(RIC.fitTimer); RIC.fitTimer = null; clearTimeout(RIC.turboTimer); RIC.turboTimer = null; RIC.fitCerca = null; [P.ruolo, UI.devCliente] = window.__primaC128; UI.ric = null; localStorage.removeItem('pit-ric-filtri'); salvaScelte([]); RIC.db = null; RIC.cerca = { stato: '', risultati: [] }; UI.ricZona = null; UI.vista = 'home'; render(); });
  });
  await passo('ricettario C125 ricerca con RicetteFit: tasto e titolo dicono le due fonti, RicetteFit in cima con la sua etichetta', async () => {   // autonomo
    await page.evaluate(() => {
      window.__primaC125r = [P.ruolo, UI.devCliente]; P.ruolo = 'monica'; P.guida = true; P.homeNo = true; UI.devCliente = false; UI.foglio = null; UI.modifica = null; S.impostazioni.ricettario = true;
      window.__rc = [];
      RIC.chiedi = async c => { if (c.cerca && !c.cat) { window.__rc.push(c); return { ricette: [{ url: 'https://www.ricettefit.it/ricetta/budino-proteico-al-cacao/', nome: 'Budino proteico al cacao', foto: '' }, { url: 'https://ricette.giallozafferano.it/Budino-al-cioccolato.html', nome: 'Budino al cioccolato', foto: '' }], rf: 1, prossima: '' }; }
        return c.db === 'mie' ? { scelte: [] } : c.db ? { db: { ricette: 0, coda: 0, scelte: 0, conValori: 0, senzaValori: 0, paroleFit: [], giri: 1, fonte: 1, fonti: 10 } } : { ricette: [], prossima: '' }; };
      salvaScelte([]); localStorage.removeItem('pit-ric-filtri'); UI.ric = null; RIC.cerca = { stato: '', risultati: [] }; RIC.fitCerca = null; RIC.db = null; RIC.dbOra = 0; RIC.scelteOra = Date.now();
      UI.ricZona = 'tutte'; UI.vista = 'ricettario'; render();
    });
    await page.waitForFunction(() => RIC.stato === 'pronto', null, { timeout: 30000 }); await page.evaluate(() => render());
    await page.locator('#ric-cerca').fill('budino'); await page.locator('#ric-cerca').press('Enter'); await page.waitForTimeout(300);
    const st = await page.evaluate(() => ({ tasto: (document.querySelector('[data-a="ric-cerca-gz"]') || {}).textContent || '', titolo: (document.querySelector('#ric-risultati h2') || {}).textContent || '',
      carte: [...document.querySelectorAll('#ric-risultati .ric-carta')].map(b => b.innerText.replace(/\s+/g, ' ')), chiesto: window.__rc.slice(-1)[0] }));
    if (!/Cerca «budino» su GialloZafferano e RicetteFit/.test(st.tasto) || !/Da GialloZafferano e RicetteFit: «budino»/.test(st.titolo) || st.carte.length !== 2 || !/Budino proteico al cacao.*RicetteFit/.test(st.carte[0])
      || !/Budino al cioccolato.*GialloZafferano/.test(st.carte[1]) || !st.chiesto || st.chiesto.cerca !== 'budino') throw new Error('ricerca con RicetteFit sbagliata: ' + JSON.stringify(st));
    await page.evaluate(() => { [P.ruolo, UI.devCliente] = window.__primaC125r; UI.ric = null; localStorage.removeItem('pit-ric-filtri'); RIC.db = null; RIC.cerca = { stato: '', risultati: [] }; UI.vista = 'home'; render(); });
  });
  await passo('ricettario RicetteFit (C124 passo 8): ricetta aperta dal suo sito con fonte e valori, portate del motore nei filtri, interruttore nel Database, link incollato', async () => {   // autonomo
    await page.evaluate(() => {
      window.__primaRf = [P.ruolo, UI.devCliente]; P.ruolo = 'monica'; P.guida = true; P.homeNo = true; UI.devCliente = false; UI.foglio = null; UI.modifica = null; S.impostazioni.ricettario = true;
      const ora = Date.now(), nu = { kcal: 320, prot: 38.5, carb: null, grassi: 9.1, saturi: 1.6, zuc: 0.4, fibre: null, sodio: 310 };
      const ss = [{ id: 'rf:pollo-fit-rf', nome: 'Pollo fit rf', zona: 'italiana', categoria: 'Secondi', foto: '', aggiunta: ora, totale: 25, difficolta: 'Facile', cerca: 'pollo', nutr: nu },
        { id: 'gz:Primo-motore-prova', nome: 'Primo motore prova', zona: 'italiana', categoria: 'Primi piatti', foto: '', aggiunta: ora - 1, totale: 20, difficolta: 'Facile', cerca: 'pasta', nutr: null }];
      const F = 'https://www.ricettefit.it/wp-content/uploads/2026/04/';
      const st = { ricette: 2, coda: 0, voci: 0, mbVoci: 0, oggi: 0, pausa: false, scelte: 2, nelRicettario: 2, conValori: 1, senzaValori: 0, paroleFit: ['proteiche'], fitI: 0, paginaFit: '', giri: 3, fonte: 1, fonti: 10,
        rf: { lette: 12, tot: 905, inCoda: 0, scartate: 0, i: 12, fine: '', spento: false } };
      window.__rf = [];
      RIC.chiedi = async c => { window.__rf.push(c);
        if (c.u) return { ricetta: { id: 'rf:pollo-fit-rf', v: 4, fonte: 'rf', nome: 'Pollo fit rf', url: 'https://www.ricettefit.it/ricetta/pollo-fit-rf/', foto: '', porzioni: 2, prep: 10, cottura: 15, totale: 25, difficolta: 'Facile', autore: 'La Cuoca Fit',
          ingredienti: [{ nome: 'Petto di pollo', q: 300, u: 'g' }, { nome: 'Limone', q: 1, u: '' }, { nome: 'Sale', q: null, u: '' }], passi: [{ t: 'Tagliare il pollo. Taglia il petto a strisce.', foto: [F + 'passo1.webp'] }, { t: 'Cuocere. In padella per 8 minuti.', foto: [] }],
          nutr: nu, consiglio: 'Posso usare il tacchino?\nSì, va benissimo.' } };
        if (c.db === 'mie') return { scelte: ss };
        if (c.db === 'rf') return { db: Object.assign({}, st, { rf: Object.assign({}, st.rf, { spento: c.acceso === false }) }) };
        return c.db ? { db: st } : { ricette: [], prossima: '' }; };
      salvaScelte(ss); localStorage.removeItem('pit-ric-filtri'); localStorage.removeItem('pit-ric-cache'); UI.ric = null; RIC.cerca = { stato: '', risultati: [] }; RIC.db = null; RIC.dbOra = 0; RIC.scelteOra = Date.now();
      UI.vista = 'ricettario'; render();
    });
    await page.waitForFunction(() => RIC.stato === 'pronto', null, { timeout: 30000 }); await page.evaluate(() => render());
    /* C125 soglie più severe a due profili: pasto o snack/dolce proteico */
    const prof = await page.evaluate(() => [fitRic({ kcal: 380, prot: 38, saturi: 2, zuc: 3, sodio: 400 }), fitRic({ kcal: 458, prot: 24.4, saturi: 6.5, zuc: 2.8, sodio: 463 }),
      fitRic({ kcal: 180, prot: 16, saturi: 1, zuc: 5, sodio: 150 }), fitRic({ kcal: 200, prot: 6.3, saturi: 0.3, zuc: 18.7, sodio: 176 }), rigaFit({ kcal: 180, prot: 16, saturi: 1, zuc: 5, sodio: 150 }),
      /* C131 P1 (Mario 10/11): saturi 12,4% e sodio 780 entrano; saturi 13,5% o sodio 820 no */
      fitRic({ kcal: 400, prot: 30, saturi: 5.5, zuc: 2, sodio: 780 }), fitRic({ kcal: 400, prot: 30, saturi: 6, zuc: 2, sodio: 780 }), fitRic({ kcal: 400, prot: 30, saturi: 5.5, zuc: 2, sodio: 820 })]);
    if (JSON.stringify(prof) !== '["pasto",false,"snack",false,"💪 16 g proteine · 180 kcal · sale 0,4 g · snack o dolce","pasto",false,false]') throw new Error('C125 soglie: pasto, snack o fuori sbagliati: ' + JSON.stringify(prof));
    /* portata del motore («Primi piatti») sotto il filtro «Primi»; la carta di RicetteFit col suo nome */
    await page.evaluate(() => { UI.ric.cat = 'primi'; render(); });
    let nomi = await page.evaluate(() => [...document.querySelectorAll('main .ric-elenco .ric-carta b')].map(b => b.textContent.replace(/^\W+/u, '')).filter(n => /prova$|rf$/.test(n)));
    if (JSON.stringify(nomi) !== '["Primo motore prova"]') throw new Error('filtro «Primi»: le ricette del motore («Primi piatti») non escono: ' + JSON.stringify(nomi));
    await page.evaluate(() => { UI.ric.cat = 'secondi'; render(); });
    const carta = await page.evaluate(() => [...document.querySelectorAll('main .ric-elenco .ric-carta')].filter(c => /Pollo fit rf/.test(c.innerText)).map(c => (c.querySelector('.ric-fonte') || {}).textContent)[0]);
    if (carta !== 'RicetteFit') throw new Error('carta di RicetteFit: fonte sbagliata o assente nei «Secondi»: ' + JSON.stringify(carta));
    /* ricetta aperta dal sito di RicetteFit (non da GZ): fonte, link, valori «(tabelle CREA)», foto del passo, consiglio */
    await page.evaluate(() => { UI.ric.cat = ''; vai('ricetta:rf:pollo-fit-rf'); }); await page.waitForTimeout(400); await page.evaluate(() => render());
    const ric = await page.evaluate(() => ({ chiesto: (window.__rf.find(c => c.u) || {}).u, fonte: (document.querySelector('.ric-fonte-riga') || {}).innerText, link: (document.querySelector('.ric-fonte-riga a') || {}).href,
      valori: (document.querySelector('.ric-valori') || {}).innerText, fotoPasso: !!document.querySelector('.ric-passi img[src$="passo1.webp"]'), testo: document.querySelector('main').innerText }));
    if (ric.chiesto !== 'https://www.ricettefit.it/ricetta/pollo-fit-rf/') throw new Error('ricetta RicetteFit chiesta all\'indirizzo sbagliato: ' + JSON.stringify(ric.chiesto));
    if (!/Fonte: RicetteFit/.test(ric.fonte || '') || ric.link !== 'https://www.ricettefit.it/ricetta/pollo-fit-rf/') throw new Error('ricetta RicetteFit: fonte o link sbagliati: ' + JSON.stringify(ric));
    if (!/tabelle CREA/.test(ric.valori || '') || !/Proteica/.test(ric.valori) || !ric.fotoPasso || !/Posso usare il tacchino\?/.test(ric.testo) || /GialloZafferano/.test(ric.testo)) throw new Error('ricetta RicetteFit: valori, foto del passo, consiglio o nome della fonte sbagliati: ' + JSON.stringify(ric).slice(0, 600));
    await foto('49-rf-ricetta');
    /* Database: riga RicetteFit con l'interruttore (senza Claude) */
    await page.evaluate(() => { RIC.dbOra = 0; vai('ricdb'); }); await page.waitForTimeout(400); await page.evaluate(() => render());
    const t = await page.evaluate(() => (document.querySelector('#ricdb-fit') || {}).innerText || '');
    if (!/RicetteFit.*12 di 905 prese\. Una nuova ogni 10 minuti\./s.test(t)) throw new Error('Database: riga RicetteFit sbagliata: ' + JSON.stringify(t));
    await clic('[data-a="ric-rf"]'); await page.waitForTimeout(300);
    const sp = await page.evaluate(() => ({ c: window.__rf.filter(c => c.db === 'rf').slice(-1)[0], t: (document.querySelector('#ricdb-fit') || {}).innerText, toast: (document.querySelector('.toast') || {}).textContent }));
    if (!sp.c || sp.c.acceso !== false || !/Spenta\./.test(sp.t || '') || !/Riaccendi/.test(sp.t) || !/RicetteFit spenta/.test(sp.toast || '')) throw new Error('Database: «Spegni» RicetteFit non va: ' + JSON.stringify(sp));
    /* link di RicetteFit incollato nella ricerca: si apre dentro l'app */
    await page.evaluate(() => { vai('ricettario'); UI.ric.q = 'https://www.ricettefit.it/ricetta/pollo-fit-rf/'; const f = document.querySelector('[data-ric-cerca]'); f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    const vista = await page.evaluate(() => UI.vista);
    if (vista !== 'ricetta:rf:pollo-fit-rf') throw new Error('link di RicetteFit incollato: non apre la ricetta: ' + vista);
    await page.evaluate(() => { [P.ruolo, UI.devCliente] = window.__primaRf; UI.ric = null; localStorage.removeItem('pit-ric-filtri'); localStorage.removeItem('pit-ric-cache'); salvaScelte([]); RIC.db = null; UI.vista = 'home'; render(); });
  });
  console.log(errori.length ? errori.join('\n') : 'Nessun errore nella pagina');
  await browser.close();
})();
