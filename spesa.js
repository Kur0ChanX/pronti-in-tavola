/* Pronti in Tavola · lista della spesa (Fase 2, docs/SPECIFICA.md «Lista della spesa»).
   Dosi per ricetta, cosa c'è già in casa, confezioni e reparti: i clienti non li vedono mai.
   Per ora stanno solo sul telefono di Monica (chiave pit-spesa-v1), anche senza rete:
   da portare nei dati privati di Monica su Firebase prima di darle l'app vera (docs/DA-FARE.md C15).
   Si carica dopo app.js e ne usa S, UI, A e le funzioni di disegno. */
'use strict';

const REPARTI = ['Frutta e verdura', 'Carne, pesce e salumi', 'Frigo: latte, formaggi e uova', 'Farine, pasta e riso', 'Dispensa', 'Surgelati', 'Altro'];
const [R_FV, R_CP, R_FR, R_PF, R_DI, R_SU] = REPARTI;
const UNITA = { g: 'grammi', ml: 'millilitri', pz: 'pezzi' };
/* ingrediente: [unità, confezione che si compra (0 = sfuso, a peso), reparto] · bozza di Claude */
const ING_SPESA = {
  farina: ['g', 1000, R_PF], semola: ['g', 1000, R_PF], pangrattato: ['g', 500, R_PF], sfoglia: ['pz', 1, R_FR],
  sfogliauovo: ['g', 500, R_PF], couscous: ['g', 500, R_PF], savoiardi: ['g', 400, R_DI], biscotti: ['g', 400, R_DI],
  riso: ['g', 1000, R_PF], uova: ['pz', 6, R_FR], latte: ['ml', 1000, R_FR], burro: ['g', 250, R_FR],
  besciamella: ['ml', 500, R_FR], mozzarella: ['g', 125, R_FR], parmigiano: ['g', 200, R_FR], pecorino: ['g', 200, R_FR],
  ricotta: ['g', 250, R_FR], formaggio: ['g', 200, R_FR], gorgonzola: ['g', 200, R_FR], emmenthal: ['g', 200, R_FR],
  mascarpone: ['g', 250, R_FR], spalmabile: ['g', 250, R_FR], panna: ['ml', 200, R_FR], nutella: ['g', 450, R_DI],
  noci: ['g', 200, R_DI], mandorle: ['g', 200, R_DI], tonno: ['g', 240, R_DI], gamberetti: ['g', 400, R_SU],
  macinato: ['g', 500, R_CP], carne: ['g', 500, R_CP], pollo: ['g', 500, R_CP], cotto: ['g', 100, R_CP], strutto: ['g', 250, R_FR],
  melanzane: ['g', 0, R_FV], zucchine: ['g', 0, R_FV], carciofi: ['pz', 0, R_FV], patate: ['g', 0, R_FV], spinaci: ['g', 0, R_FV],
  radicchio: ['g', 0, R_FV], verdure: ['g', 0, R_FV], pomodoro: ['ml', 700, R_DI], cipolla: ['g', 0, R_FV], aglio: ['g', 0, R_FV],
  prezzemolo: ['g', 0, R_FV], basilico: ['g', 0, R_FV], menta: ['g', 0, R_FV], carota: ['g', 0, R_FV], sedano: ['g', 0, R_FV],
  peperoni: ['g', 0, R_FV], avocado: ['pz', 0, R_FV], rucola: ['g', 125, R_FV], frutti: ['g', 250, R_SU], marmellata: ['g', 340, R_DI],
  uvetta: ['g', 100, R_DI], arancia: ['pz', 0, R_FV], zucchero: ['g', 1000, R_DI], cacao: ['g', 75, R_DI], caffe: ['g', 250, R_DI],
  olio: ['ml', 1000, R_DI], oliosemi: ['ml', 1000, R_DI], limone: ['pz', 0, R_FV]
};
/* dosi (bozza di Claude, da controllare): per 1 porzione (teglie), per 1 kg, per 1 pezzo o per 1 torta intera;
   «piatto:gusto» = quello che serve in più per quel gusto */
const DOSI_INIZIALI = {
  'polpette-melanzane': { melanzane: 1000, pangrattato: 150, uova: 2, pecorino: 80, aglio: 5, prezzemolo: 10, oliosemi: 250 },
  'polpette-zucchine': { zucchine: 1000, pangrattato: 150, uova: 2, parmigiano: 80, menta: 5, oliosemi: 250 },
  'polpette-tonno': { tonno: 400, patate: 500, pangrattato: 120, uova: 2, parmigiano: 60, prezzemolo: 10, oliosemi: 250 },
  'polpette-carne': { macinato: 700, pangrattato: 120, uova: 2, parmigiano: 80, latte: 100, aglio: 5, prezzemolo: 10, oliosemi: 250 },
  involtini: { melanzane: 200, cotto: 40, mozzarella: 50, pomodoro: 80, parmigiano: 15, basilico: 2, olio: 10 },
  'sfoglia-zucchine': { sfoglia: 0.34, zucchine: 100, cotto: 30, mozzarella: 40 },
  'sfoglia-parmigiana': { sfoglia: 0.34, melanzane: 120, mozzarella: 40, pomodoro: 60, parmigiano: 15, basilico: 1 },
  'panade-carciofi': { semola: 80, strutto: 10, carciofi: 0.5, patate: 60, aglio: 2, prezzemolo: 3, olio: 5 },
  'panade-carne': { semola: 80, strutto: 10, carne: 80, aglio: 2, prezzemolo: 3 },
  impanade: { farina: 400, strutto: 60, carne: 450 },
  ravioli: { semola: 250, farina: 150, uova: 4 },
  'ravioli:ricotta': { ricotta: 400 }, 'ravioli:spinaci': { spinaci: 250, ricotta: 250 }, 'ravioli:formaggio': { pecorino: 150, formaggio: 250 },
  parmigiana: { melanzane: 250, pomodoro: 100, mozzarella: 50, parmigiano: 20, basilico: 2, oliosemi: 60 },
  'lasagne-semplici': { sfogliauovo: 50, besciamella: 80, pomodoro: 80, parmigiano: 15, mozzarella: 40 },
  'lasagne-ragu': { sfogliauovo: 50, besciamella: 70, macinato: 80, pomodoro: 100, parmigiano: 15, cipolla: 10, carota: 10, sedano: 10, olio: 10 },
  'lasagne-particolari': { sfogliauovo: 50, besciamella: 90, parmigiano: 15 },
  'lasagne-particolari:carciofi': { carciofi: 1 }, 'lasagne-particolari:verdure': { verdure: 120 },
  'lasagne-particolari:radicchio': { radicchio: 80, gorgonzola: 30 }, 'lasagne-particolari:noci': { gorgonzola: 40, noci: 15 },
  sformato: { zucchine: 150, uova: 1, parmigiano: 20, pangrattato: 10, latte: 40 },
  'insalata-riso': { riso: 80, gamberetti: 50, avocado: 0.25, rucola: 10, emmenthal: 25, olio: 10, limone: 0.1 },
  couscous: { couscous: 70, pollo: 80, zucchine: 50, peperoni: 40, carota: 20, cipolla: 15, olio: 10 },
  tiramisu: { savoiardi: 50, mascarpone: 85, uova: 0.7, zucchero: 17, caffe: 5, cacao: 2 },
  'cheesecake-nutella': { biscotti: 35, burro: 14, spalmabile: 85, panna: 35, nutella: 35 },
  'cheesecake-frutti': { biscotti: 35, burro: 14, spalmabile: 85, panna: 35, frutti: 40 },
  crostata: { farina: 300, burro: 150, zucchero: 120, uova: 2, marmellata: 350 },
  papassini: { farina: 450, zucchero: 200, uvetta: 100, noci: 100, mandorle: 100, strutto: 100, uova: 2, arancia: 1 }
};
const GIORNI_SPESA = [[0, 'Oggi'], [1, 'Fino a domani'], [2, '3 giorni'], [6, 'Una settimana']];
const BASI = { teglia: '1 porzione', kg: '1 kg', pz: '1 pezzo', intera: '1 torta intera' };
const CHIAVE_SPESA = 'pit-spesa-v1';

function spesaVuota() {
  return { versione: 1, dosi: JSON.parse(JSON.stringify(DOSI_INIZIALI)), ing: {}, casa: {}, presi: {}, giorni: 2, anche: false };
}
let SPESA = (() => {
  try { const s = JSON.parse(localStorage.getItem(CHIAVE_SPESA)); if (s && s.versione === 1) return Object.assign(spesaVuota(), s); }
  catch (e) { /* prova senza memoria */ }
  return spesaVuota();
})();
function salvaSpesa() { try { localStorage.setItem(CHIAVE_SPESA, JSON.stringify(SPESA)); } catch (e) { mostraToast('Memoria piena: la lista non è stata salvata.'); } }

function infoIng(id) {
  const b = ING_SPESA[id] || ['g', 0, 'Altro'];
  return Object.assign({ u: b[0], conf: b[1], rep: b[2] }, SPESA.ing[id] || {});
}
const baseDi = p => (p.formati[0] || { tipo: 'kg' }).tipo;
/* quante «basi» chiede una riga: teglie × porzioni, kg, pezzi o torte */
function basiRiga(r, p) {
  const f = p.formati.find(x => x.id === r.formato) || {};
  if ((f.tipo || r.tipo) === 'teglia') return r.qta * (f.porzioni || (r.formato === 't8' ? 8 : 6));
  return r.qta;
}
function ordiniSpesa() {
  const fino = piuGiorni(oggi(), SPESA.giorni);
  const stati = SPESA.anche ? ['accettato', 'nuovo', 'proposta'] : ['accettato'];
  return S.ordini.filter(o => stati.includes(o.stato) && o.entro <= fino).sort((a, b) => a.entro.localeCompare(b.entro));
}
function calcolaSpesa(oo) {
  const tot = {}, per = [], mancano = {};
  oo.forEach(o => {
    const qui = {};
    o.righe.forEach(r => {
      if (r.pronto) return;                        // i «pronti subito» sono già cucinati
      const p = piatto(r.piatto);
      if (!p) return;
      const n = basiRiga(r, p), v = r.variante ? p.varianti.find(x => x.id === r.variante) : null;
      const pezzi = [[p.ing, SPESA.dosi[p.id] || {}], ...(v ? [[v.ing || [], SPESA.dosi[p.id + ':' + v.id] || {}]] : [])];
      pezzi.forEach(([ids, d]) => ids.forEach(id => {
        if (d[id] == null || d[id] === '') { (mancano[p.id] = mancano[p.id] || new Set()).add(id); return; }
        qui[id] = (qui[id] || 0) + d[id] * n;
        tot[id] = (tot[id] || 0) + d[id] * n;
      }));
    });
    per.push({ o, ing: qui });
  });
  return { tot, per, mancano: Object.entries(mancano).map(([pid, ii]) => [pid, [...ii]]) };
}
/* quantità leggibile: grammi → kg, ml → litri, pezzi interi */
function quanto(q, u) {
  if (u === 'pz') return `${Math.max(1, Math.ceil(q - 1e-9))} pz`;
  const grande = u === 'g' ? 'kg' : 'l';
  if (q >= 1000) return `${NUM.format(Math.ceil(q / 100 - 1e-9) / 10)} ${grande}`;
  return `${Math.max(10, Math.ceil(q / 10 - 1e-9) * 10)} ${u}`;
}
/* la confezione com'è scritta sul pacco, senza arrotondare (es. 75 g, 1,5 l) */
const misura = (q, u) => u !== 'pz' && q >= 1000 ? `${NUM.format(q / 1000)} ${u === 'g' ? 'kg' : 'l'}` : `${NUM.format(q)} ${u}`;
function daComprare(id, serve) {
  const inf = infoIng(id), casa = SPESA.casa[id] || 0, manca = Math.max(0, serve - casa);
  if (!manca) return null;
  if (inf.conf > 0) {
    const n = Math.ceil(manca / inf.conf - 1e-9);
    return { testo: inf.u === 'pz' && inf.conf === 1 ? `${n} pz` : `${n} × ${misura(inf.conf, inf.u)}`, manca };
  }
  return { testo: quanto(manca, inf.u), manca };
}
function testoSpesa(c, fino) {
  const righe = [`🛒 Lista della spesa (ordini fino a ${giornoLungo(fino)})`];
  REPARTI.forEach(rep => {
    const qui = Object.keys(c.tot).filter(id => infoIng(id).rep === rep).map(id => [id, daComprare(id, c.tot[id])]).filter(x => x[1]);
    if (!qui.length) return;
    righe.push('', `*${rep}*`, ...qui.map(([id, d]) => `- ${ING(id).n}: ${d.testo}`));
  });
  return righe.join('\n');
}

function vSpesa() {
  const oo = ordiniSpesa(), c = calcolaSpesa(oo), fino = piuGiorni(oggi(), SPESA.giorni);
  const ids = Object.keys(c.tot).sort((a, b) => ING(a).n.localeCompare(ING(b).n, 'it'));
  const compra = ids.map(id => [id, daComprare(id, c.tot[id])]).filter(x => x[1]);
  const inCasa = ids.filter(id => !daComprare(id, c.tot[id]));
  const presi = compra.filter(([id]) => SPESA.presi[id]).length;
  let h = testataMonica('Lista della spesa', 'home') + '<main class="corpo">';
  h += `<section class="scheda"><h2>Per quali ordini?</h2>
    <div class="scelte">${GIORNI_SPESA.map(([n, t]) => `<button type="button" class="scelta" data-a="sp-giorni" data-v="${n}" aria-pressed="${SPESA.giorni === n}">${t}</button>`).join('')}</div>
    <label class="interr"><span>Conta anche gli ordini da accettare<small>Così non resti senza se li accetti</small></span><input type="checkbox" data-campo="sp.anche" ${SPESA.anche ? 'checked' : ''}></label>
    <p class="tenue" style="margin:0">${oo.length ? `<b>${oo.length}</b> ${oo.length === 1 ? 'ordine' : 'ordini'} fino a ${giornoLungo(fino)}. I «pronti subito» non contano: sono già cucinati.` : `Nessun ordine fino a ${giornoLungo(fino)}.`}</p></section>`;
  if (c.mancano.length) h += `<div class="avviso"><div style="width:100%"><b>Mancano delle dosi</b>, quindi la lista non è completa:
    ${c.mancano.map(([id, ii]) => `<div class="fila" style="margin-top:8px"><button type="button" class="chip" data-a="vai" data-v="piatto:${id}">${ico('matita')}${esc(piatto(id).nome)}</button>
      <small>senza dose: ${esc(ii.map(i => ING(i).n.toLowerCase()).join(', '))}</small></div>`).join('')}</div></div>`;
  if (compra.length) {
    h += `<p class="tenue" style="margin:0" aria-live="polite">Nel carrello: <b>${presi}</b> di ${compra.length}. Tocca il cerchio quando prendi una cosa.</p>`;
    REPARTI.forEach(rep => {
      const qui = compra.filter(([id]) => infoIng(id).rep === rep);
      if (!qui.length) return;
      h += `<section class="scheda spesa"><h2>${esc(rep)}</h2>${qui.map(([id, d]) => {
        const preso = !!SPESA.presi[id], inf = infoIng(id), casa = SPESA.casa[id] || 0;
        const sotto = `Servono ${quanto(c.tot[id], inf.u)}${casa ? ` · in casa ${quanto(casa, inf.u)}` : ''}`;
        return `<div class="spesa-riga${preso ? ' presa' : ''}"><button type="button" class="spunta" data-a="sp-preso" data-ing="${id}" aria-pressed="${preso}" aria-label="Preso: ${esc(ING(id).n)}">${preso ? ico('spunta') : ''}</button>
          <div class="cosa"><b>${esc(ING(id).n)}</b><small>${sotto}</small></div><b class="quanto">${esc(d.testo)}</b>
          <button type="button" class="icona" data-a="sp-ing" data-ing="${id}" aria-label="Cambia ${esc(ING(id).n)}: in casa, confezione, reparto">${ico('matita')}</button></div>`; }).join('')}</section>`;
    });
    h += `<a class="btn pieno" href="${wa('', testoSpesa(c, fino))}" target="_blank" rel="noopener">${ico('chat')}Manda la lista su WhatsApp</a>
      ${presi ? '<button type="button" class="btn chiaro pieno" data-a="sp-ricomincia">Togli le spunte</button>' : ''}`;
  } else if (oo.length && !c.mancano.length) h += `<div class="avviso verde">${ico('spunta')}<div>Hai già in casa tutto quello che serve.</div></div>`;
  if (inCasa.length) h += `<section class="scheda"><h2>Ce l'hai già in casa</h2><div class="ingr-lista">${inCasa.map(id => `<button type="button" class="chip" data-a="sp-ing" data-ing="${id}">${esc(ING(id).n)}</button>`).join('')}</div></section>`;
  if (c.per.length) h += `<details class="scheda"><summary><b>Cosa serve per ogni ordine</b></summary>${c.per.map(({ o, ing }) => `<div class="spesa-ordine"><b>${esc(cliente(o.cliente).nome)}</b> · ${giornoLungo(o.entro)}
      <small>${esc(o.righe.map(r => `${r.nome.toLowerCase()} (${descRiga(r)})`).join(', '))}</small>
      <span>${Object.keys(ing).map(id => `${esc(ING(id).n)} ${quanto(ing[id], infoIng(id).u)}`).join(' · ') || 'Niente da comprare.'}</span></div>`).join('')}</details>`;
  h += `<p class="tenue piccolo" style="margin:0">Le dosi le cambi in «I miei piatti», dentro ogni piatto. Per ora la lista resta su questo telefono.</p>`;
  return h + '</main>';
}

function foglioSpesaIng() {
  const id = UI.foglio.id, inf = infoIng(id), casa = SPESA.casa[id] || 0;
  const serve = calcolaSpesa(ordiniSpesa()).tot[id] || 0;
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro"><h1>${esc(ING(id).n)}</h1>
    <p class="tenue" style="margin:0">${serve ? `Per gli ordini scelti ti servono <b>${quanto(serve, inf.u)}</b>.` : 'Per gli ordini scelti non serve.'}</p>
    <span class="etichetta" style="font-weight:800">Ce l'hai già in casa</span>
    <div class="fila">${passo('sp-casa', casa ? quanto(casa, inf.u) : '0', `data-ing="${id}"`)}<span class="tenue">${casa ? 'Lo tolgo dalla lista.' : 'Niente in casa.'}</span></div>
    <span class="etichetta" style="font-weight:800">La confezione che compri</span>
    <div class="fila" style="flex-wrap:nowrap"><input type="number" inputmode="decimal" min="0" step="any" data-campo="sp.conf" data-ing="${id}" value="${inf.conf || ''}" placeholder="sfuso, a peso" aria-label="Confezione in ${UNITA[inf.u]}"><span class="tenue">${UNITA[inf.u]}</span></div>
    <span class="etichetta" style="font-weight:800">Si misura in</span>
    <div class="scelte">${Object.entries(UNITA).map(([k, n]) => `<button type="button" class="chip" data-a="sp-unita" data-ing="${id}" data-v="${k}" aria-pressed="${inf.u === k}">${n}</button>`).join('')}</div>
    <span class="etichetta" style="font-weight:800">Reparto del negozio</span>
    <div class="scelte">${REPARTI.map(r => `<button type="button" class="chip" data-a="sp-rep" data-ing="${id}" data-v="${esc(r)}" aria-pressed="${inf.rep === r}">${esc(r)}</button>`).join('')}</div></div>
    <div class="piede"><button type="button" class="btn pieno" data-a="chiudi">Fatto</button></div>`;
}

/* nella scheda del piatto di Monica */
function sezioneDosi(p) {
  const base = BASI[baseDi(p)] || '1 porzione';
  const riga = (id, d, scope) => { const u = infoIng(id).u;
    return `<div class="formato-riga"><b>${esc(ING(id).n)}</b><input type="number" inputmode="decimal" min="0" step="any" data-campo="d.q" data-s="${scope}" data-ing="${id}" value="${d[id] ?? ''}" placeholder="?" aria-label="${esc(ING(id).n)} in ${UNITA[u]}"><span class="tenue">${u}</span></div>`; };
  const d = SPESA.dosi[p.id] || {};
  const gusti = p.varianti.filter(v => (v.ing || []).length);
  return `<section class="scheda"><h2>Dosi per la lista della spesa</h2><p class="tenue" style="margin:0">Quanto ti serve per <b>${base}</b>. Solo tu le vedi.</p>
    ${p.ing.map(id => riga(id, d, 'base')).join('') || '<span class="tenue">Prima aggiungi gli ingredienti.</span>'}
    ${gusti.map(v => `<span class="etichetta" style="font-weight:800">In più per il gusto ${esc(v.nome)}</span>${v.ing.map(id => riga(id, SPESA.dosi[p.id + ':' + v.id] || {}, v.id)).join('')}`).join('')}
    ${DOSI_INIZIALI[p.id] ? '<span class="tenue piccolo">Sono una mia bozza: correggi i numeri che non tornano.</span>' : ''}</section>`;
}

function salvaCampoSpesa(el) {
  const c = el.dataset.campo, id = el.dataset.ing;
  const num = v => Math.max(0, Number(String(v).replace(',', '.')) || 0);
  if (c === 'd.q') {
    const pid = UI.vista.split(':')[1], k = el.dataset.s === 'base' ? pid : pid + ':' + el.dataset.s;
    const d = SPESA.dosi[k] = SPESA.dosi[k] || {};
    if (el.value === '') delete d[id]; else d[id] = num(el.value);
    salvaSpesa(); salvatoOk(); return;
  }
  if (c === 'sp.anche') { SPESA.anche = el.checked; salvaSpesa(); render(); return; }
  if (c === 'sp.conf') { SPESA.ing[id] = Object.assign({}, SPESA.ing[id], { conf: num(el.value) }); salvaSpesa(); render(); }
}
function cambiaIng(id, campi) { SPESA.ing[id] = Object.assign({}, SPESA.ing[id], campi); salvaSpesa(); render(); }

Object.assign(A, {
  'sp-giorni'(el) { SPESA.giorni = Number(el.dataset.v); salvaSpesa(); render(); },
  'sp-preso'(el) { const id = el.dataset.ing; if (SPESA.presi[id]) delete SPESA.presi[id]; else SPESA.presi[id] = true; salvaSpesa(); render(); },
  'sp-ing'(el) { UI.foglio = { tipo: 'spesa-ing', id: el.dataset.ing }; render(); },
  'sp-casa'(el) {
    const id = el.dataset.ing, inf = infoIng(id), passoQ = inf.conf || (inf.u === 'pz' ? 1 : 100);
    SPESA.casa[id] = Math.max(0, arrot((SPESA.casa[id] || 0) + Number(el.dataset.d) * passoQ));
    if (!SPESA.casa[id]) delete SPESA.casa[id];
    salvaSpesa(); render();
  },
  'sp-unita'(el) { cambiaIng(el.dataset.ing, { u: el.dataset.v }); },
  'sp-rep'(el) { cambiaIng(el.dataset.ing, { rep: el.dataset.v }); },
  'sp-ricomincia'() {
    const prima = SPESA.presi; SPESA.presi = {}; salvaSpesa(); render();
    mostraToast('Spunte tolte.', () => { SPESA.presi = prima; salvaSpesa(); render(); });
  }
});
