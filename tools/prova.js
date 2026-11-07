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
  const passo = async (nome, fn) => { try { await fn(); console.log('OK  ', nome); } catch (e) { console.log('NO  ', nome, '→', e.message.split('\n')[0]); } };

  await page.goto(FILE);
  await page.waitForTimeout(1300); await foto('01-apertura');
  await page.waitForTimeout(5200);
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
    const t = await page.locator('.dev-scheda').innerText(); if (!/Versione \d/.test(t) || !/Novità/.test(t)) throw new Error('mancano versione o novità');
    await page.locator('.dev-scheda').scrollIntoViewIfNeeded(); await foto('14c-sviluppatore');
    await clic('.mario-scheda [data-a="tutti-prova-apri"]'); await page.locator('.foglio .lista-prova li').first().waitFor({ timeout: 3000 });
    await foto('14d-tutti-prova');
    await clic('.foglio .piede [data-a="chiudi"]');
    if (!(await page.evaluate(() => S.ordini.some(o => !diProva(o))))) throw new Error('«No, lascia così» ha segnato gli ordini');
    await clic('.mario-scheda [data-a="tutti-prova-apri"]'); await clic('[data-a="tutti-prova-si"]');
    if (await page.evaluate(() => S.ordini.some(o => !diProva(o)))) throw new Error('restano ordini non di prova');
    await page.evaluate(() => { S.ordini.forEach(o => { o.prova = false; }); salva(); render(); });   // le prove dopo usano gli ordini veri
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
    await clic('.indietro'); await clic('.riquadro >> nth=1'); await clic('.piatto-riga >> text=Tiramisù');
    await clic('details.sez[data-sez="dosi"] > summary');
    if (await page.locator('details.sez[open]').count() !== 1) throw new Error('aperte più voci insieme');
    const q = page.locator('[data-campo="d.q"][data-ing="mascarpone"]'); await q.scrollIntoViewIfNeeded();
    if (await q.inputValue() !== '85') throw new Error('dose mascarpone: ' + await q.inputValue());
    // costo: mascarpone 2,50 € per 250 g → 85 g = 0,85 € a porzione → teglia da 6 = 5,10 € (gli altri senza prezzo)
    await page.evaluate(() => { SPESA.ing.mascarpone = Object.assign({}, SPESA.ing.mascarpone, { prezzo: 2.5 }); render(); });
    if (!(await page.locator('.fila', { hasText: 'ti costa 5,10' }).count())) throw new Error('costo del tiramisù: ' + await page.locator('.scheda', { hasText: 'Quanto ti costa' }).innerText());
    await q.fill('100'); await q.dispatchEvent('change'); await foto('21-dosi');
    if (await page.evaluate(() => SPESA.dosi.tiramisu.mascarpone) !== 100) throw new Error('dose non salvata');
    await clic('.indietro');   // resta in «I miei piatti»: la prova dopo parte da una schermata interna
  });
  await passo('foto del menù: Monica ne carica 2 e le può mandare, i clienti per ora no', async () => {
    await clic('[data-a="ruolo"][data-v="monica"]'); await page.waitForTimeout(300);
    while (await page.locator('.indietro').count()) { await clic('.indietro'); await page.waitForTimeout(150); }
    await clic('.riquadro >> nth=1');
    await page.setInputFiles('#file-menu-0', 'media/anteprima-link-1.jpg'); await page.locator('.menu-foto-edit img').first().waitFor({ timeout: 5000 });
    await page.setInputFiles('#file-menu-1', 'media/icon-512.png'); await page.waitForTimeout(800);
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
  console.log(errori.length ? errori.join('\n') : 'Nessun errore nella pagina');
  await browser.close();
})();
