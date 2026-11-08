// Prova delle impostazioni in più (C88, opzioni.js): Impostazioni → ricerca, salvataggio, effetto su menù, carrello, messaggi e aiutante.
// Uso: python3 -I tools/anteprima.py && node tools/prova-impostazioni.js   (foto in /tmp/pit/)
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = '/tmp/pit'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 1 })).newPage();
  const errori = []; page.on('pageerror', e => errori.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../dist/anteprima.html')); await page.waitForTimeout(1500);
  let no = 0;
  const passo = async (nome, fn) => { try { await fn(); console.log('OK  ', nome); } catch (e) { no++; console.log('NO  ', nome, '→', e.message.split('\n')[0]); } };
  const monica = v => page.evaluate(v => { P.ruolo = 'monica'; UI.foglio = null; UI.sez = null; UI.cercaImp = ''; vai(v); }, v);

  await passo('Impostazioni: ricerca «minimo» lascia solo l\'ordine minimo', async () => {
    await monica('impostazioni');
    await page.fill('#cerca-imp', 'minimo'); await page.waitForTimeout(200);
    const viste = await page.$$eval('details.sez', d => d.filter(x => !x.hidden).map(x => x.dataset.sez));
    if (viste.join() !== 'opz-minimo') throw new Error('voci viste: ' + viste.join());
    await page.fill('#cerca-imp', 'zzzz'); await page.waitForTimeout(100);
    if (await page.isHidden('#cerca-imp-niente')) throw new Error('manca «Non trovo niente»');
  });
  await passo('ordine minimo: si salva e nel carrello blocca l\'invio', async () => {
    await monica('impostazioni');
    await page.click('details.sez[data-sez="opz-minimo"] > summary');
    const q = page.locator('[data-campo="o.minimo"]'); await q.fill('300'); await q.dispatchEvent('change');
    if (await page.evaluate(() => S.impostazioni.minimo) !== undefined && await page.evaluate(() => S.impostazioni.minimo) === 300) throw new Error('300 è oltre il tetto e non va salvato');
    await page.locator('[data-campo="o.minimo"]').fill('30'); await page.locator('[data-campo="o.minimo"]').dispatchEvent('change');
    if (await page.evaluate(() => S.impostazioni.minimo) !== 30) throw new Error('minimo non salvato');
    await page.evaluate(() => { P.ruolo = 'cliente'; P.benvenuto = true; P.carrello = [{ piatto: 'tiramisu', nome: 'Tiramisù', tipo: 'teglia', formato: 't6', formatoNome: 'Teglia da 6', qta: 1, prezzo: 18, note: [], testo: '', variante: null }]; UI.entro = null; vai('carrello'); });
    await page.waitForTimeout(200);
    if (!(await page.locator('.avviso', { hasText: 'ordine minimo' }).count())) throw new Error('manca l\'avviso del minimo');
    if (!(await page.locator('[data-a="invia"][disabled]').count())) throw new Error('il tasto Invia non è bloccato');
    await page.screenshot({ path: OUT + '/opz-minimo.png' });
    await page.evaluate(() => { delete S.impostazioni.minimo; P.carrello = []; });
  });
  await passo('giorni chiusi: la domenica i clienti non la possono scegliere', async () => {
    await monica('impostazioni');
    await page.click('details.sez[data-sez="opz-giorniChiusi"] > summary');
    await page.click('[data-a="o-giorno"][data-v="0"]');
    if (JSON.stringify(await page.evaluate(() => S.impostazioni.giorniChiusi)) !== '[0]') throw new Error('domenica non salvata');
    const r = await page.evaluate(() => giorniPossibili(0).filter(x => daIso(x.g).getDay() === 0).map(x => x.no));
    if (!r.length || r.some(x => x !== 'Chiuso')) throw new Error('domeniche: ' + r.join());
    await page.click('[data-a="o-giorno"][data-v="0"]');
    if ((await page.evaluate(() => opz('giorniChiusi'))).length) throw new Error('domenica non riaperta');
  });
  await passo('avviso in cima al menù dei clienti', async () => {
    await page.evaluate(() => { S.impostazioni.avviso = 'Questa settimana niente fritti'; P.ruolo = 'cliente'; P.benvenuto = true; vai('menu'); });
    await page.waitForTimeout(200);
    if (!(await page.locator('.avviso', { hasText: 'niente fritti' }).count())) throw new Error('avviso non visto');
    await page.evaluate(() => { delete S.impostazioni.avviso; });
  });
  await passo('messaggio «pronto» scritto da Monica, con firma', async () => {
    const t = await page.evaluate(() => {
      const di = waOrdine(S.ordini[0], 'pronto');
      S.impostazioni.msgPronto = 'Ehi {nome}, il n. {n} ti aspetta!'; S.impostazioni.firma = 'Moni';
      const mio = waOrdine(S.ordini[0], 'pronto'); delete S.impostazioni.msgPronto; delete S.impostazioni.firma;
      return [decodeURIComponent(di), decodeURIComponent(mio)];
    });
    if (!/è pronto\.\nTotale/.test(t[0]) || !/Pronti in Tavola/.test(t[0])) throw new Error('messaggio di base cambiato: ' + t[0].slice(0, 120));
    if (!/Ehi .+, il n\. \d+ ti aspetta!\nMoni/.test(t[1])) throw new Error('messaggio di Monica: ' + t[1].slice(0, 120));
  });
  await passo('aiutante: «dove cambio l\'ordine minimo?» porta alla voce', async () => {
    await page.evaluate(() => { P.ruolo = 'monica'; AI.msgs = []; UI.aiQui = null; vai('aiutante'); });
    await page.evaluate(() => inviaAI('dove cambio l\'ordine minimo?')); await page.waitForTimeout(1900);
    const r = await page.evaluate(() => UI.vista + ' ' + UI.sez + ' ' + !!document.querySelector('details.sez[data-sez="opz-minimo"][open]'));
    if (r !== 'impostazioni opz-minimo true') throw new Error(r);
    await page.screenshot({ path: OUT + '/opz-aiutante.png' });
  });
  await passo('aiutante (AI): l\'azione «impostazione» cambia una voce in più', async () => {
    const r = await page.evaluate(() => { const c = controllaAI({ azione: 'impostazione', chiave: 'giorniChiusi', valore: [0, 1] }); return [c.no, c.dopo]; });
    if (r[0] || r[1] !== 'Lunedì, Domenica') throw new Error(r.join(' | '));
  });
  console.log(errori.length ? 'ERRORI: ' + errori.join(' | ') : 'Nessun errore nella pagina');
  await b.close(); process.exit(no || errori.length ? 1 : 0);
})();
