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
  await passo('aiutante: «dove cambio l\'ordine minimo?» → «Intendi…?» → porta alla voce', async () => {
    await page.evaluate(() => { P.ruolo = 'monica'; AI.msgs = []; UI.aiQui = null; vai('aiutante'); });
    await page.evaluate(() => inviaAI('dove cambio l\'ordine minimo?')); await page.waitForTimeout(1900);
    await page.click('[data-a="ai-vai"]'); await page.waitForTimeout(300);   // senza AI (anteprima) chiede «Intendi…?» (C102)
    const r = await page.evaluate(() => UI.vista + ' ' + UI.sez + ' ' + !!document.querySelector('details.sez[data-sez="opz-minimo"][open]'));
    if (r !== 'impostazioni opz-minimo true') throw new Error(r);
    await page.screenshot({ path: OUT + '/opz-aiutante.png' });
  });
  await passo('aiutante (AI): l\'azione «impostazione» cambia una voce in più', async () => {
    const r = await page.evaluate(() => { const c = controllaAI({ azione: 'impostazione', chiave: 'giorniChiusi', valore: [0, 1] }); return [c.no, c.dopo]; });
    if (r[0] || r[1] !== 'Lunedì, Domenica') throw new Error(r.join(' | '));
  });
  /* ---------- lotto 2 (C92) ---------- */
  await passo('parti del menù: aggiungo «Secondi», la sposto, rinomino; con piatti non si toglie', async () => {
    await monica('impostazioni');
    await page.click('details.sez[data-sez="opz-parti"] > summary');
    await page.fill('#nuova-parte', 'secondi'); await page.click('[data-a="o-parte-agg"]'); await page.waitForTimeout(150);
    let v = await page.evaluate(() => CATEGORIE.map(c => c.join(':')).join());
    if (v !== 'stuzzichini:Stuzzichini,primi:Primi,dolci:Dolci,secondi:Secondi') throw new Error('dopo aggiungi: ' + v);
    await page.click('[data-a="o-parte-su"][data-v="secondi"]'); await page.waitForTimeout(100);
    v = await page.evaluate(() => CATEGORIE.map(c => c[0]).join());
    if (v !== 'stuzzichini,primi,secondi,dolci') throw new Error('dopo su: ' + v);
    const q = page.locator('[data-campo="op.stuzzichini"]'); await q.fill('Antipasti'); await q.dispatchEvent('change'); await page.waitForTimeout(100);
    v = await page.evaluate(() => CATEGORIE.find(c => c[0] === 'stuzzichini')[1]);
    if (v !== 'Antipasti') throw new Error('rinomina: ' + v);
    await page.click('[data-a="o-parte-togli"][data-v="primi"]'); await page.waitForTimeout(100);
    if (!(await page.evaluate(() => CATEGORIE.some(c => c[0] === 'primi')))) throw new Error('ha tolto una parte con dei piatti');
    await page.screenshot({ path: OUT + '/opz-parti.png' });
    await page.click('[data-a="o-parte-togli"][data-v="secondi"]'); await page.waitForTimeout(100);
    if (await page.evaluate(() => CATEGORIE.some(c => c[0] === 'secondi'))) throw new Error('secondi (vuota) non tolta');
    await page.evaluate(() => { delete S.impostazioni.parti; render(); });
  });
  await passo('piatto in «Secondi»: il cliente lo vede sotto «Secondi»', async () => {
    await page.evaluate(() => { S.impostazioni.parti = [['stuzzichini', 'Stuzzichini'], ['primi', 'Primi'], ['secondi', 'Secondi'], ['dolci', 'Dolci']];
      const p = visibili().find(x => x.disponibile); UI.provaCat = [p.id, p.cat]; p.cat = 'secondi'; P.ruolo = 'cliente'; P.benvenuto = true; vai('menu'); });
    await page.waitForTimeout(200);
    if (!(await page.locator('h2', { hasText: 'Secondi' }).count())) throw new Error('manca la parte Secondi nel menù');
    await page.evaluate(() => { piatto(UI.provaCat[0]).cat = UI.provaCat[1]; delete S.impostazioni.parti; render(); });
  });
  await passo('aiutante a voce: «aggiungi la parte secondi» → conferma → c\'è', async () => {
    await page.evaluate(() => { P.ruolo = 'monica'; AI.msgs = []; UI.aiQui = null; vai('aiutante'); });
    await page.evaluate(() => inviaAI('Aggiungi la parte secondi.')); await page.waitForTimeout(400);
    const r = await page.evaluate(() => { const m = AI.msgs[AI.msgs.length - 1]; return [m.t, m.piano && m.piano.azioni ? m.piano.azioni.length : (m.azioni || []).length]; });
    if (!/Secondi|secondi/.test(r[0])) throw new Error('risposta: ' + r[0]);
    const c = await page.evaluate(() => { const c = controllaAI({ azione: 'impostazione', chiave: 'parti', valore: [...opz('parti'), [null, 'secondi']] }); if (c.fai) c.fai(); return [c.no, c.dopo, CATEGORIE.map(x => x[0]).join()]; });
    if (c[0] || !/Nuova: Secondi/.test(c[1])) throw new Error(c.join(' | '));
    const no = await page.evaluate(() => controllaAI({ azione: 'impostazione', chiave: 'parti', valore: 'Antipasti, Secondi, Dolci' }).no || '');
    if (!/ha dei piatti/.test(no)) throw new Error('toglie parti con piatti: ' + no);
    await page.screenshot({ path: OUT + '/opz-parti-voce.png' });
    await page.evaluate(() => { delete S.impostazioni.parti; render(); });
  });
  await passo('saluto, frase della pausa, altro pagamento, invito e biglietto', async () => {
    const r = await page.evaluate(() => {
      const base = [opz('saluto'), testoInvitoGestore('a'), BIGLIETTI().a.titolo];
      Object.assign(S.impostazioni, { saluto: 'Ciao da Moni!', invitoAmici: 'Venite a trovarmi!', bigliettoTitolo: 'Prova la mia cucina' });
      const mio = [opz('saluto'), testoInvitoGestore('a'), BIGLIETTI().a.titolo];
      ['saluto', 'invitoAmici', 'bigliettoTitolo'].forEach(k => delete S.impostazioni[k]);
      return [base, mio];
    });
    if (!/^Benvenuti da /.test(r[0][0]) || !/la mia cucina casalinga/.test(r[0][1]) || !/#da=monica/.test(r[0][1]) || r[0][2] !== 'Assaggia la mia cucina!') throw new Error('base: ' + JSON.stringify(r[0]));
    if (r[1][0] !== 'Ciao da Moni!' || !/^Venite a trovarmi!\n\n.*#da=monica$/.test(r[1][1]) || r[1][2] !== 'Prova la mia cucina') throw new Error('mio: ' + JSON.stringify(r[1]));
    await page.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 3); S.impostazioni.pausa = { attiva: true, fino: iso(d) };
      S.impostazioni.pausaTesto = 'Torno presto!'; S.impostazioni.altroPagare = 'Satispay al 333 0000000'; P.ruolo = 'cliente'; P.benvenuto = true; vai('menu'); });
    await page.waitForTimeout(200);
    if (!(await page.locator('.avviso', { hasText: 'Torno presto!' }).count())) throw new Error('frase della pausa non vista');
    await page.evaluate(() => { S.impostazioni.pausa.attiva = false; P.carrello = [{ piatto: 'tiramisu', nome: 'Tiramisù', tipo: 'teglia', formato: 't6', formatoNome: 'Teglia da 6', qta: 1, prezzo: 18, note: [], testo: '', variante: null }]; UI.entro = null; vai('carrello'); });
    await page.waitForTimeout(200);
    if (!(await page.locator('.paga-riga', { hasText: 'Satispay' }).count())) throw new Error('altro pagamento non visto nel carrello');
    await page.screenshot({ path: OUT + '/opz-paga.png' });
    await page.evaluate(() => { delete S.impostazioni.pausaTesto; delete S.impostazioni.altroPagare; P.carrello = []; });
  });
  console.log(errori.length ? 'ERRORI: ' + errori.join(' | ') : 'Nessun errore nella pagina');
  await b.close(); process.exit(no || errori.length ? 1 : 0);
})();
