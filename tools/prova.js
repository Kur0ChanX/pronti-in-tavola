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
    await clic('[data-a="invia"]'); await page.waitForTimeout(500); await foto('05-inviato');
    if (!(await page.locator('.inviato').count())) throw new Error('niente conferma');
  });
  await passo('due ordini creati (pronti + da preparare)', async () => {
    await clic('[data-a="vai"][data-v="ordini"]');
    const n = await page.locator('.ordine-carta').count(); if (n !== 3) throw new Error('ordini cliente: ' + n);
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
    await clic('[data-a="tab"][data-v="preparare"]'); await foto('09-da-preparare');
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
    await clic('[data-a="tab"][data-v="preparare"]'); await clic('[data-a="pronto-muto"]');
    await clic('[data-a="tab"][data-v="pronti"]'); await clic('[data-a="ritirato"]');
  });
  await passo('Monica: modifica piatto e ingredienti nuovi', async () => {
    await clic('.indietro'); await clic('.riquadro >> nth=1'); await foto('12-piatti');
    await page.locator('.piatto-riga', { hasText: 'Tiramisù' }).locator('.apri').click(); await page.waitForTimeout(300);
    await page.fill('#ing-base', 'liquore marsala, granella di pistacchio'); await clic('[data-a="ing-aggiungi"][data-s="base"]');
    await foto('13-piatto-modifica');
    const t = await page.locator('main').innerText(); if (!/Frutta a guscio/.test(t) || !/Solfiti/.test(t)) throw new Error('allergeni nuovi non trovati');
    await clic('[data-a="controllato"]');
  });
  await passo('Monica: segna pronti, Natale acceso, pausa', async () => {
    await clic('.indietro'); await clic('.indietro'); await clic('[data-a="apri-pronti"]');
    await page.locator('.foglio .gruppo', { hasText: 'Tiramisù' }).locator('[data-a="pr-qta"][data-d="1"]').click(); await page.waitForTimeout(200);
    await clic('.foglio .piede [data-a="chiudi"]');
    await clic('.riquadro >> nth=3'); await clic('[data-a="altre-imp"]'); await page.locator('[data-campo="i.natale.attivo"]').check(); await page.waitForTimeout(300);
    await foto('14-impostazioni');
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
  await passo('Monica: lista della spesa dagli ordini', async () => {
    await clic('.indietro'); await clic('[data-a="vai"][data-v="spesa"]'); await clic('[data-a="sp-tab"][data-v="ordini"]'); await foto('19-spesa');
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
    await page.locator('[data-campo="sp.anche"]').uncheck(); await foto('20-spesa-presa');
  });
  await passo('Monica: la mia lista della spesa', async () => {
    await clic('[data-a="sp-tab"][data-v="mia"]');
    const campo = page.locator('#ing-spesa-nuova');
    await campo.fill('2 kg patate'); await campo.press('Enter');
    await page.waitForTimeout(200);
    if (!(await page.evaluate(() => document.activeElement && document.activeElement.id)) === 'ing-spesa-nuova') throw new Error('il campo ha perso la tastiera');
    await page.locator('#ing-spesa-nuova').fill('detersivo piatti'); await clic('[data-a="sp-agg"]');
    await page.locator('#ing-spesa-nuova').fill('masc');
    if (!(await page.locator('#sug-spesa button', { hasText: 'Mascarpone' }).count())) throw new Error('nessun suggerimento per «masc»');
    await clic('#sug-spesa button >> text=Mascarpone');
    const mia = await page.evaluate(() => SPESA.mia.map(v => `${v.n}|${v.q}|${v.rep}`).join(' / '));
    if (mia !== 'Patate|2 kg|Frutta e verdura / Detersivo piatti||Casa e pulizia / Mascarpone||Frigo: latte, formaggi e uova') throw new Error('voci: ' + mia);
    if (!(await page.locator('.spesa-riga', { hasText: 'Mascarpone' }).locator('small', { hasText: 'Anche per gli ordini' }).count())) throw new Error('manca «Anche per gli ordini»');
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
  await passo('Monica: dosi nella scheda del piatto', async () => {
    await clic('.indietro'); await clic('.riquadro >> nth=1'); await clic('.piatto-riga >> text=Tiramisù');
    const q = page.locator('[data-campo="d.q"][data-ing="mascarpone"]'); await q.scrollIntoViewIfNeeded();
    if (await q.inputValue() !== '85') throw new Error('dose mascarpone: ' + await q.inputValue());
    await q.fill('100'); await q.dispatchEvent('change'); await foto('21-dosi');
    if (await page.evaluate(() => SPESA.dosi.tiramisu.mascarpone) !== 100) throw new Error('dose non salvata');
    await clic('.indietro');   // resta in «I miei piatti»: la prova dopo parte da una schermata interna
  });
  await passo('testo grande', async () => {
    await clic('.indietro'); await clic('.riquadro >> nth=3'); await page.locator('[data-campo="p.grande"]').check(); await page.waitForTimeout(200);
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
