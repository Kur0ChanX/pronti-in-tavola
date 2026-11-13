/* Pronti in Tavola · lista della spesa (Fase 2, docs/SPECIFICA.md «Lista della spesa»).
   Dosi per ricetta, cosa c'è già in casa, confezioni e reparti: i clienti non li vedono mai.
   Per ora stanno solo sul telefono di Monica (chiave pit-spesa-v1), anche senza rete:
   da portare nei dati privati di Monica su Firebase prima di darle l'app vera (docs/DA-FARE.md C15).
   Si carica dopo app.js e ne usa S, UI, A e le funzioni di disegno. */
'use strict';

const REPARTI = ['Frutta e verdura', 'Carne, pesce e salumi', 'Frigo: latte, formaggi e uova', 'Farine, pasta e riso', 'Dispensa', 'Surgelati', 'Pane e dolci', 'Bevande', 'Casa e pulizia', 'Altro'];
const [R_FV, R_CP, R_FR, R_PF, R_DI, R_SU, R_PD, R_BE, R_CA] = REPARTI;
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
/* dosi (bozza di Claude, da controllare): per 1 porzione (teglie: Monica le vede e scrive per la teglia da 6), per 1 kg, per 1 pezzo o per 1 torta intera;
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
const GIORNI_SPESA = [[0, 'Oggi'], [1, 'Fino a domani'], [2, '3 giorni'], [6, 'Una settimana'], [-1, 'Tutti gli ordini']];   /* -1 = tutti (Mario 05/11) */
const fineSpesa = () => SPESA.giorni < 0 ? '9999-12-31' : piuGiorni(oggi(), SPESA.giorni);
const finoA = fino => fino === '9999-12-31' ? 'tutti gli ordini' : `fino a ${giornoLungo(fino)}`;
const BASI = { teglia: '1 porzione', kg: '1 kg', pz: '1 pezzo', intera: '1 torta intera' };
/* piatti a pezzi (Mario 08/11, panade): Monica scrive le dosi per un impasto da N pezzi, l'app divide; N si cambia dalla scheda */
const LOTTI_INIZIALI = { 'panade-carne': 12, 'panade-carciofi': 12 };
const lottoDi = p => Math.min(200, Math.max(1, Math.round(Number((SPESA.lotti || {})[p.id] || LOTTI_INIZIALI[p.id] || 1)) || 1));
const CHIAVE_SPESA = 'pit-spesa-v1';

function spesaVuota() {
  return { versione: 1, dosi: JSON.parse(JSON.stringify(DOSI_INIZIALI)), ing: {}, casa: {}, presi: {}, giorni: 2, anche: false, mia: [], usati: {} };
}
let SPESA = (() => {
  try { const s = JSON.parse(localStorage.getItem(CHIAVE_SPESA)); if (s && s.versione === 1) return Object.assign(spesaVuota(), s); }
  catch (e) { /* prova senza memoria */ }
  return spesaVuota();
})();
function salvaSpesa() {
  try { localStorage.setItem(CHIAVE_SPESA, JSON.stringify(SPESA)); } catch (e) { if (!Dati.attivo) mostraToast('Memoria piena: la lista non è stata salvata.'); }
  if (Dati.attivo && Dati.io.gestore) { S.spesa = JSON.parse(JSON.stringify(SPESA)); salva(); }   // anche sul server, nei dati privati di Monica (C15)
}
/* coi dati veri la spesa sta su Firebase (impostazioni/spesa, solo gestori): la prima volta ci va quella del telefono */
function spesaDalServer() {
  if (S.spesa && S.spesa.versione === 1) { SPESA = Object.assign(spesaVuota(), JSON.parse(JSON.stringify(S.spesa))); if (!S.spesa.cotti) segnaCotti(); }
  else if (Dati.haDati && Dati.haDati()) { segnaCotti(); S.spesa = JSON.parse(JSON.stringify(SPESA)); salva(); }   // gli ordini già cucinati non consumano
}

/* «in casa» che si consuma da solo: SPESA.casa è quello che c'era quando l'hai segnato; gli ordini segnati pronti
   (o ritirati) dopo, non in SPESA.cotti, lo consumano. Se annulli il «pronto», torna. */
const COTTI = ['pronto', 'ritirato'];
function consumati() {
  const oo = S.ordini.filter(o => COTTI.includes(o.stato) && !o.prova && !SPESA.cotti[o.id]);
  return oo.length ? calcolaSpesa(oo).tot : {};
}
function casaDi(id) { return Math.max(0, arrot((SPESA.casa[id] || 0) - (consumati()[id] || 0))); }
/* prima di cambiare «in casa»: il consumo diventa definitivo */
function fissaCasa() {
  const c = consumati();
  Object.keys(c).forEach(id => { if (SPESA.casa[id] != null) { SPESA.casa[id] = Math.max(0, arrot(SPESA.casa[id] - c[id])); if (!SPESA.casa[id]) delete SPESA.casa[id]; } });
  segnaCotti();
}
function segnaCotti() { SPESA.cotti = {}; S.ordini.forEach(o => { if (COTTI.includes(o.stato)) SPESA.cotti[o.id] = true; }); }
if (!SPESA.cotti) segnaCotti();

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
  const fino = fineSpesa();
  const stati = SPESA.anche ? ['accettato', 'nuovo', 'proposta'] : ['accettato'];
  return S.ordini.filter(o => stati.includes(o.stato) && !o.prova && o.entro <= fino).sort((a, b) => a.entro.localeCompare(b.entro));
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
/* confezione in grammi, etti, kg · ml, cl, litri · pezzi (C160, Mario 13/11 23:07 «aggiungi anche KG e CL ed Etti»):
   in memoria resta in g, ml o pz (conti e dati di prima uguali); «cu» è solo l'unità con cui Monica la scrive */
const MISURE_CONF = { g: [['g', 1, 'grammi'], ['hg', 100, 'etti'], ['kg', 1000, 'kg']], ml: [['ml', 1, 'ml'], ['cl', 10, 'cl'], ['l', 1000, 'litri']], pz: [['pz', 1, 'pezzi']] };
function unitaConf(inf) {   // [sigla, quanti g/ml per 1, nome]
  const tt = MISURE_CONF[inf.u] || MISURE_CONF.g;
  return tt.find(x => x[0] === inf.cu) || (inf.conf >= 1000 && tt[2] ? tt[2] : tt[0]);
}
const prezzoPer = inf => `€ ${inf.conf > 0 ? `per ${misura(inf.conf, inf.u, inf.cu)}` : inf.u === 'pz' ? 'al pezzo' : inf.u === 'g' ? 'al kg' : 'al litro'}`;
/* la confezione com'è scritta sul pacco, senza arrotondare (es. 75 g, 3 etti, 75 cl, 1,5 l) */
function misura(q, u, cu) {
  const x = (MISURE_CONF[u] || []).find(m => m[0] === cu && m[1] > 1);
  if (x) { const v = +(q / x[1]).toFixed(3); return x[0] === 'hg' ? `${NUM.format(v)} ${v === 1 ? 'etto' : 'etti'}` : `${NUM.format(v)} ${x[0]}`; }
  return u !== 'pz' && q >= 1000 ? `${NUM.format(q / 1000)} ${u === 'g' ? 'kg' : 'l'}` : `${NUM.format(q)} ${u}`;
}
function daComprare(id, serve) {
  const inf = infoIng(id), casa = casaDi(id), manca = Math.max(0, serve - casa);
  if (!manca) return null;
  if (inf.conf > 0) {
    const n = Math.ceil(manca / inf.conf - 1e-9);
    return { testo: inf.u === 'pz' && inf.conf === 1 ? `${n} pz` : `${n} × ${misura(inf.conf, inf.u, inf.cu)}`, manca };
  }
  return { testo: quanto(manca, inf.u), manca };
}
/* tutta la spesa ancora da prendere, per reparto: la mia lista + quella degli ordini */
function testoSpesa(c, fino) {
  const righe = [`🛒 Lista della spesa (con ${finoA(fino) === 'tutti gli ordini' ? 'tutti gli ordini' : 'gli ordini ' + finoA(fino)})`];
  REPARTI.forEach(rep => {
    const mie = SPESA.mia.filter(v => !v.preso && v.rep === rep).map(v => `- ${v.n}${v.q ? `: ${v.q}` : ''}`);
    const ord = Object.keys(c.tot).filter(id => !SPESA.presi[id] && infoIng(id).rep === rep).map(id => [id, daComprare(id, c.tot[id])]).filter(x => x[1])
      .map(([id, d]) => `- ${ING(id).n}: ${d.testo}`);
    if (mie.length || ord.length) righe.push('', `*${rep}*`, ...mie, ...ord);
  });
  return righe.join('\n');
}

function spesaOrdini() {
  const oo = ordiniSpesa(), c = calcolaSpesa(oo), fino = fineSpesa();
  const ids = Object.keys(c.tot).sort((a, b) => ING(a).n.localeCompare(ING(b).n, 'it'));
  const compra = ids.map(id => [id, daComprare(id, c.tot[id])]).filter(x => x[1]);
  return { oo, c, fino, ids, compra };
}
function vSpesa() {
  const so = spesaOrdini(), mancaMia = SPESA.mia.filter(v => !v.preso).length, mancaOrd = so.compra.filter(([id]) => !SPESA.presi[id]).length;
  const tab = UI.spesaTab || 'mia';
  let h = testataMonica('Lista della spesa', 'home') + '<main class="corpo">';
  h += `<div class="scelte schede-spesa" role="group" aria-label="Quale lista">
    <button type="button" class="scelta" data-a="sp-tab" data-v="mia" aria-pressed="${tab === 'mia'}">La mia lista<small>${mancaMia ? `${mancaMia} da prendere` : 'Scrivi cosa ti serve'}</small></button>
    <button type="button" class="scelta" data-a="sp-tab" data-v="ordini" aria-pressed="${tab === 'ordini'}">Spesa per i miei ordini<small>${mancaOrd ? `${mancaOrd} da prendere` : 'Niente da comprare'}</small></button></div>`;
  h += tab === 'mia' ? vSpesaMia(so) : vSpesaOrdini(so);
  if (mancaMia || mancaOrd) h += `<a class="btn pieno" href="${wa('', testoSpesa(so.c, so.fino))}" target="_blank" rel="noopener">${ico('chat')}Manda tutta la spesa su WhatsApp</a>`;
  h += `<p class="tenue piccolo" style="margin:0">Le dosi le cambi in «I miei piatti», dentro ogni piatto. ${Dati.attivo ? 'La lista la vedi solo tu, anche da un altro telefono dove entri tu.' : 'Nella prova la lista resta su questo telefono.'}</p>`;
  return h + '</main>';
}
function vSpesaOrdini({ oo, c, fino, ids, compra }) {
  const inCasa = ids.filter(id => !daComprare(id, c.tot[id]));
  const presi = compra.filter(([id]) => SPESA.presi[id]).length;
  let h = `<section class="scheda"><h2>Per quali ordini?</h2>
    <div class="scelte">${GIORNI_SPESA.map(([n, t]) => `<button type="button" class="scelta" data-a="sp-giorni" data-v="${n}" aria-pressed="${SPESA.giorni === n}">${t}</button>`).join('')}</div>
    <label class="interr"><span>Conta anche gli ordini da accettare<small>Così non resti senza se li accetti</small></span><input type="checkbox" data-campo="sp.anche" ${SPESA.anche ? 'checked' : ''}></label>
    <p class="tenue" style="margin:0">${oo.length ? `<b>${oo.length}</b> ${oo.length === 1 ? 'ordine' : 'ordini'}${fino === '9999-12-31' ? ', tutti quelli che hai' : ` fino a ${giornoLungo(fino)}`}. I «pronti subito» non contano: sono già cucinati.` : `Nessun ordine${fino === '9999-12-31' ? '' : ` fino a ${giornoLungo(fino)}`}.`}</p></section>`;
  if (c.mancano.length) h += `<div class="avviso"><div style="width:100%"><b>Mancano delle dosi</b>, quindi la lista non è completa:
    ${c.mancano.map(([id, ii]) => `<div class="fila" style="margin-top:8px"><button type="button" class="chip" data-a="vai" data-v="piatto:${id}">${ico('matita')}${esc(piatto(id).nome)}</button>
      <small>senza dose: ${esc(ii.map(i => ING(i).n.toLowerCase()).join(', '))}</small></div>`).join('')}</div></div>`;
  if (compra.length) {
    h += `<p class="tenue" style="margin:0" aria-live="polite">Nel carrello: <b>${presi}</b> di ${compra.length}. Tocca il cerchio quando prendi una cosa.</p>`;
    REPARTI.forEach(rep => {
      const qui = compra.filter(([id]) => infoIng(id).rep === rep);
      if (!qui.length) return;
      h += `<section class="scheda spesa"><h2>${esc(rep)}</h2>${qui.map(([id, d]) => {
        const preso = !!SPESA.presi[id], inf = infoIng(id), casa = casaDi(id);
        const sotto = `Servono ${quanto(c.tot[id], inf.u)}${casa ? ` · in casa ${quanto(casa, inf.u)}` : ''}`;
        return `<div class="spesa-riga${preso ? ' presa' : ''}"><button type="button" class="spunta" data-a="sp-preso" data-ing="${id}" aria-pressed="${preso}" aria-label="Preso: ${esc(ING(id).n)}">${preso ? ico('spunta') : ''}</button>
          <div class="cosa"><b>${esc(ING(id).n)}</b><small>${sotto}</small></div><b class="quanto">${esc(d.testo)}</b>
          <button type="button" class="icona" data-a="sp-ing" data-ing="${id}" aria-label="Cambia ${esc(ING(id).n)}: in casa, confezione, reparto">${ico('matita')}</button></div>`; }).join('')}</section>`;
    });
    if (presi) h += `<button type="button" class="btn pieno" data-a="sp-fatta">${ico('spunta')}Ho fatto la spesa: metti in casa le cose prese</button>
      <button type="button" class="btn chiaro pieno" data-a="sp-ricomincia">Togli le spunte</button>`;
  } else if (oo.length && !c.mancano.length) h += `<div class="avviso verde">${ico('spunta')}<div>Hai già in casa tutto quello che serve.</div></div>`;
  if (inCasa.length) h += `<section class="scheda"><h2>Ce l'hai già in casa</h2><div class="ingr-lista">${inCasa.map(id => `<button type="button" class="chip" data-a="sp-ing" data-ing="${id}">${esc(ING(id).n)}</button>`).join('')}</div></section>`;
  if (c.per.length) h += `<details class="scheda"><summary><b>Cosa serve per ogni ordine</b></summary>${c.per.map(({ o, ing }) => `<div class="spesa-ordine"><b>${esc(cliente(o.cliente).nome)}</b> · ${giornoLungo(o.entro)}
      <small>${esc(o.righe.map(r => `${r.nome.toLowerCase()} (${descRiga(r)})`).join(', '))}</small>
      <span>${Object.keys(ing).map(id => `${esc(ING(id).n)} ${quanto(ing[id], infoIng(id).u)}`).join(' · ') || 'Niente da comprare.'}</span></div>`).join('')}</details>`;
  h += `<p class="tenue piccolo" style="margin:0">Quando segni un ordine «pronto», tolgo da «in casa» quello che hai usato.</p>`;
  return h;
}

function foglioSpesaIng() {
  const id = UI.foglio.id, inf = infoIng(id), casa = casaDi(id), uc = unitaConf(inf);
  const serve = calcolaSpesa(ordiniSpesa()).tot[id] || 0;
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro"><h1>${esc(ING(id).n)}</h1>
    <p class="tenue" style="margin:0">${serve ? `Per gli ordini scelti ti servono <b>${quanto(serve, inf.u)}</b>.` : 'Per gli ordini scelti non serve.'}</p>
    <span class="etichetta" style="font-weight:800">Ce l'hai già in casa</span>
    <div class="fila">${passo('sp-casa', casa ? quanto(casa, inf.u) : '0', `data-ing="${id}"`)}<span class="tenue">${casa ? 'Lo tolgo dalla lista.' : 'Niente in casa.'}</span></div>
    <span class="etichetta" style="font-weight:800">Quanto lo paghi (se vuoi)</span>
    <div class="fila" style="flex-wrap:nowrap"><input type="number" inputmode="decimal" min="0" step="any" data-campo="sp.prezzo" data-ing="${id}" value="${inf.prezzo || ''}" placeholder="0,00" aria-label="Prezzo in euro"><span class="tenue" id="sp-per">${prezzoPer(inf)}</span></div>
    <span class="etichetta" style="font-weight:800">La confezione che compri</span>
    <div class="fila" style="flex-wrap:nowrap"><input type="number" inputmode="decimal" min="0" step="any" data-campo="sp.conf" data-ing="${id}" value="${inf.conf ? +(inf.conf / uc[1]).toFixed(3) : ''}" placeholder="${inf.u === 'pz' ? 'sfusi' : 'sfuso, a peso'}" aria-label="Confezione in ${uc[2]}"><span class="tenue">${uc[2]}</span></div>
    ${inf.u === 'pz' ? '' : `<div class="scelte">${(MISURE_CONF[inf.u] || MISURE_CONF.g).map(([k, , n]) => `<button type="button" class="chip" data-a="sp-cu" data-ing="${id}" data-v="${k}" aria-pressed="${uc[0] === k}">${n}</button>`).join('')}</div>`}
    <span class="etichetta" style="font-weight:800">Si misura in</span>
    <div class="scelte">${Object.entries(UNITA).map(([k, n]) => `<button type="button" class="chip" data-a="sp-unita" data-ing="${id}" data-v="${k}" aria-pressed="${inf.u === k}">${n}</button>`).join('')}</div>
    <span class="etichetta" style="font-weight:800">Reparto del negozio</span>
    <div class="scelte">${REPARTI.map(r => `<button type="button" class="chip" data-a="sp-rep" data-ing="${id}" data-v="${esc(r)}" aria-pressed="${inf.rep === r}">${esc(r)}</button>`).join('')}</div></div>
    <div class="piede"><button type="button" class="btn pieno" data-a="chiudi">Fatto</button></div>`;
}

/* nella scheda del piatto di Monica */
function sezioneDosi(p) {
  /* teglie (Mario 08/11): Monica scrive le dosi per la teglia piccola (da 6), quella grande la calcola l'app;
     dentro restano per 1 porzione, così lista e costi non cambiano e i dati già salvati vanno bene */
  const tt = p.formati.filter(f => f.tipo === 'teglia').map(f => f.porzioni || (f.id === 't8' ? 8 : 6)).sort((a, b) => a - b);
  const aPezzi = !tt.length && baseDi(p) === 'pz';
  const k = tt[0] || (aPezzi ? lottoDi(p) : 1), altre = tt.slice(1);
  const base = tt.length ? `una teglia da ${k}` : aPezzi ? `${k} ${k === 1 ? 'pezzo' : 'pezzi'}` : BASI[baseDi(p)] || '1 porzione';
  const giro = n => +n.toFixed(2);
  const riga = (id, d, scope) => { const u = infoIng(id).u, v = d[id];
    const sotto = v != null && v !== '' && altre.length ? `<small class="tenue" style="display:block;font-weight:400">${altre.map(n => `teglia da ${n}: ${NUM.format(giro(v * n))} ${u}`).join(' · ')}</small>` : '';
    return `<div class="formato-riga"><b>${esc(ING(id).n)}${sotto}</b><input type="number" inputmode="decimal" min="0" step="any" data-campo="d.q" data-k="${k}" data-s="${scope}" data-ing="${id}" value="${v == null || v === '' ? '' : giro(v * k)}" placeholder="?" aria-label="${esc(ING(id).n)} in ${UNITA[u]} per ${base}"><span class="tenue">${u}</span></div>`; };
  const d = SPESA.dosi[p.id] || {};
  const gusti = p.varianti.filter(v => (v.ing || []).length);
  const lotto = aPezzi ? `<div class="formato-riga"><b>Le dosi sono per quanti pezzi?<small class="tenue" style="display:block;font-weight:400">Scrivi quanti ne fai con un impasto: il resto lo calcolo io.</small></b><input type="number" inputmode="numeric" min="1" max="200" step="1" data-campo="d.lotto" value="${k}" aria-label="Pezzi per un impasto"><span class="tenue">pz</span></div>` : '';
  return `<section class="scheda"><h2>Dosi per la lista della spesa</h2><p class="tenue" style="margin:0">Quanto ti serve per <b>${base}</b>.${altre.length ? ` Le altre teglie le calcolo io.` : ''} Solo tu le vedi.</p>${lotto}
    ${p.ing.map(id => riga(id, d, 'base')).join('') || '<span class="tenue">Prima aggiungi gli ingredienti.</span>'}
    ${gusti.map(v => `<span class="etichetta" style="font-weight:800">In più per il gusto ${esc(v.nome)}</span>${v.ing.map(id => riga(id, SPESA.dosi[p.id + ':' + v.id] || {}, v.id)).join('')}`).join('')}
    ${costoPiatto(p)}
    ${DOSI_INIZIALI[p.id] ? '<span class="tenue piccolo">Sono una mia bozza: correggi i numeri che non tornano.</span>' : ''}</section>`;
}

function salvaCampoSpesa(el) {
  const c = el.dataset.campo, id = el.dataset.ing;
  const num = v => Math.max(0, Number(String(v).replace(',', '.')) || 0);
  if (c === 'd.lotto') {
    const pid = UI.vista.split(':')[1];
    SPESA.lotti = Object.assign({}, SPESA.lotti, { [pid]: Math.min(200, Math.max(1, Math.round(num(el.value)) || 1)) });
    salvaSpesa(); render(); return;
  }
  if (c === 'd.q') {
    const pid = UI.vista.split(':')[1], k = el.dataset.s === 'base' ? pid : pid + ':' + el.dataset.s;
    const d = SPESA.dosi[k] = SPESA.dosi[k] || {};
    if (el.value === '') delete d[id]; else d[id] = num(el.value) / (Number(el.dataset.k) || 1);   // in memoria per 1 porzione
    salvaSpesa(); salvatoOk(); return;
  }
  if (c === 'sp.vn' || c === 'sp.vq') { salvaVoce(el); return; }
  if (c === 'sp.anche') { SPESA.anche = el.checked; salvaSpesa(); render(); return; }
  /* prezzo e confezione: niente render mentre si esce dal campo (C160): la pagina rifatta sotto il dito perdeva il tocco su «kg» o «Fatto» */
  if (c === 'sp.prezzo') { SPESA.ing[id] = Object.assign({}, SPESA.ing[id], { prezzo: num(el.value) }); salvaSpesa(); return; }
  if (c === 'sp.conf') { const uc = unitaConf(infoIng(id)); SPESA.ing[id] = Object.assign({}, SPESA.ing[id], { conf: arrot(num(el.value) * uc[1]), cu: uc[0] }); salvaSpesa();
    const per = document.getElementById('sp-per'); if (per) per.textContent = prezzoPer(infoIng(id)); }
}
function cambiaIng(id, campi) { SPESA.ing[id] = Object.assign({}, SPESA.ing[id], campi); salvaSpesa(); render(); }

Object.assign(A, {
  'sp-giorni'(el) { SPESA.giorni = Number(el.dataset.v); salvaSpesa(); render(); },
  'sp-preso'(el) { const id = el.dataset.ing; if (SPESA.presi[id]) delete SPESA.presi[id]; else SPESA.presi[id] = true; salvaSpesa(); render(); },
  'sp-ing'(el) { UI.foglio = { tipo: 'spesa-ing', id: el.dataset.ing }; render(); },
  'sp-casa'(el) {
    const id = el.dataset.ing, inf = infoIng(id), passoQ = inf.conf || (inf.u === 'pz' ? 1 : 100);
    fissaCasa();
    SPESA.casa[id] = Math.max(0, arrot((SPESA.casa[id] || 0) + Number(el.dataset.d) * passoQ));
    if (!SPESA.casa[id]) delete SPESA.casa[id];
    salvaSpesa(); render();
  },
  'sp-unita'(el) { cambiaIng(el.dataset.ing, { u: el.dataset.v, cu: null }); },
  'sp-cu'(el) {
    const id = el.dataset.ing, inf = infoIng(id), dopo = (MISURE_CONF[inf.u] || []).find(x => x[0] === el.dataset.v);
    if (!dopo) return;
    /* il numero che Monica vede nel campo (anche se non ha ancora finito di scrivere), nell'unità appena toccata */
    const campo = document.querySelector(`.foglio [data-campo="sp.conf"][data-ing="${id}"]`);
    const visto = campo ? Math.max(0, Number(String(campo.value).replace(',', '.')) || 0) : inf.conf / unitaConf(inf)[1];
    cambiaIng(id, { cu: dopo[0], conf: arrot(visto * dopo[1]) });
  },
  'sp-rep'(el) { cambiaIng(el.dataset.ing, { rep: el.dataset.v }); },
  'sp-fatta'() {   /* le cose spuntate vanno «in casa» (le confezioni intere che hai preso), la lista si svuota da sola */
    const prima = JSON.stringify(SPESA), c = calcolaSpesa(ordiniSpesa());
    fissaCasa();
    let n = 0;
    Object.keys(SPESA.presi).forEach(id => {
      const serve = c.tot[id] || 0, inf = infoIng(id), manca = Math.max(0, serve - (SPESA.casa[id] || 0));
      if (manca) { SPESA.casa[id] = arrot((SPESA.casa[id] || 0) + (inf.conf > 0 ? Math.ceil(manca / inf.conf - 1e-9) * inf.conf : manca)); n++; }
    });
    SPESA.presi = {}; salvaSpesa(); render();
    mostraToast(`Messe in casa ${n} ${n === 1 ? 'cosa' : 'cose'}.`, () => { SPESA = JSON.parse(prima); salvaSpesa(); render(); });
  },
  'sp-ricomincia'() {
    const prima = SPESA.presi; SPESA.presi = {}; salvaSpesa(); render();
    mostraToast('Spunte tolte.', () => { SPESA.presi = prima; salvaSpesa(); render(); });
  }
});

/* ---------- «La mia lista»: la spesa libera di Monica, come nelle app di spesa migliori (docs/SPECIFICA.md) ----------
   scrivi e aggiungi (anche «2 kg patate»), reparto da solo, suggerimenti mentre scrivi, usati spesso, spunte, Annulla */
const PAROLE_REP = [   /* inizi di parola → reparto; si guarda in quest'ordine (es. «passata di pomodoro» → Dispensa) */
  [R_SU, 'surgel gelat bastoncin piselli minestrone'],
  [R_CA, 'detersiv sapone carta scottex tovagli sacchett sacchi spugn ammorbident candeggin anticalcare dentifric shampoo bagnoschiuma deodorant pellicol alluminio stagnola forno-carta piatti-di bicchier vaschett'],
  [R_BE, 'acqua vino birra succo succhi bibit coca aranciata spremut'],
  [R_DI, 'olio aceto sale zucchero caffe tè te tisan passata pelati polpa conserv concentrat legumi ceci lenticch fagioli tonno sgombr marmellat miele nutella biscott cacao lievit spezi pepe origano dado brodo cereali fette crackers grissin cioccolat noci mandorl nocciol uvetta savoiard vanigli'],
  [R_CP, 'carne pollo petto cosce tacchin manzo maiale vitell agnell macinat salsicc prosciutt cotto crudo salame mortadell speck pancett guancial bresaol wurstel pesce salmone merluzz orata spigol cozze vongol gamber calamar polpo seppi alici acciugh'],
  [R_FR, 'latte yogurt burro panna formagg mozzarell parmigian grana pecorin ricotta mascarpone gorgonzol stracchin provol scamorz emmenthal fontin philadelphia spalmabil uova uovo sfoglia besciamell pasta-fresca'],
  [R_PD, 'pane panin pancarr focacc piadin brioche cornett torta crostat merend'],
  [R_PF, 'farina pasta spaghett penne fusill rigaton linguin tagliatell lasagn riso semola couscous gnocch pangrattat orzo farro'],
  [R_FV, 'mela mele pera pere banan arance arancia limon mandarin clementin uva fragol kiwi pesca pesche albicocc cilieg melon anguri insalat lattug pomodor zucchin melanzan patat cipoll aglio carot sedano peperon funghi spinac bietol cavol broccol finocch carciof rucola basilic prezzemol menta rosmarin salvia verdur frutta zucca fagiolin avocado porr scalogn']
].map(([r, p]) => [r, p.split(' ').map(x => x.replace(/-/g, ' '))]);
const IDEE_SPESA = ['Latte', 'Uova', 'Pane', 'Acqua', 'Olio', 'Farina', 'Zucchero', 'Caffè', 'Pasta', 'Pomodori', 'Detersivo piatti', 'Carta da forno'];
const chiaveVoce = n => norm(n).replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim() || '-';
function repartoDi(n) {
  const k = chiaveVoce(n), u = SPESA.usati[k];
  if (u && u.rep) return u.rep;
  const ing = Object.keys(ING_SPESA).find(id => chiaveVoce(ING(id).n) === k);
  if (ing) return infoIng(ing).rep;
  const parole = k.split(' ');
  for (const [rep, inizi] of PAROLE_REP) {
    if (inizi.some(i => i.includes(' ') ? k.includes(i) : parole.some(w => w.startsWith(i)))) return rep;
  }
  return 'Altro';
}
/* «2 kg patate», «patate 2 kg», «latte x2» → nome e quantità */
const MISURE = '(?:kg|g|gr|hg|l|lt|litri|ml|cl|pz|pezzi|conf|confezioni|bottiglie|pacchi|pacco|vasetti|scatole|barattoli|mazzi|mazzo)';
function leggiVoce(t) {
  t = String(t || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  let m = t.match(new RegExp(`^(\\d+(?:[.,]\\d+)?\\s*${MISURE}?)\\.?\\s+(?:di\\s+)?(.+)$`, 'i'));
  if (m) return { n: m[2], q: m[1] };
  m = t.match(new RegExp(`^(.+?)\\s+(?:x\\s*)?(\\d+(?:[.,]\\d+)?\\s*${MISURE}?)$`, 'i'));
  if (m) return { n: m[1], q: m[2] };
  return { n: t, q: '' };
}
function aggiungiVoce(testo) {
  const { n, q } = leggiVoce(testo);
  if (!n) return false;
  const k = chiaveVoce(n), gia = SPESA.mia.find(v => chiaveVoce(v.n) === k);
  if (gia) {   // niente doppioni: la voce che c'è torna «da prendere», con la quantità nuova se l'hai scritta
    const prima = JSON.stringify(SPESA.mia);
    gia.preso = false; if (q) gia.q = q;
    salvaSpesa(); render();
    mostraToast(`${gia.n} era già nella lista${q ? ': quantità cambiata' : ''}.`, () => { SPESA.mia = JSON.parse(prima); salvaSpesa(); render(); });
    return true;
  }
  const v = { id: 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), n: maiuscola(n), q, rep: repartoDi(n), preso: false };
  SPESA.mia.push(v);
  const u = SPESA.usati[k] = Object.assign({ volte: 0 }, SPESA.usati[k], { n: v.n, rep: v.rep });
  u.volte++; u.ultimo = oggi();
  const tutte = Object.keys(SPESA.usati);   // al massimo 150 cose ricordate: via quelle usate meno
  if (tutte.length > 150) tutte.sort((a, b) => SPESA.usati[a].volte - SPESA.usati[b].volte || (SPESA.usati[a].ultimo || '').localeCompare(SPESA.usati[b].ultimo || '')).slice(0, tutte.length - 150).forEach(x => delete SPESA.usati[x]);
  salvaSpesa(); render();
  return true;
}
function vSpesaMia(so) {
  const ordine = new Map(so.compra.map(([id, d]) => [chiaveVoce(ING(id).n), d.testo]));
  const nella = new Set(SPESA.mia.map(v => chiaveVoce(v.n)));
  const usati = Object.entries(SPESA.usati).filter(([k]) => !nella.has(k)).sort((a, b) => b[1].volte - a[1].volte || (b[1].ultimo || '').localeCompare(a[1].ultimo || '')).map(([, u]) => u.n);
  const spesso = [...usati, ...IDEE_SPESA.filter(n => !nella.has(chiaveVoce(n)) && !usati.some(u => chiaveVoce(u) === chiaveVoce(n)))].slice(0, 12);
  const presi = SPESA.mia.filter(v => v.preso).length;
  let h = `<section class="scheda"><h2>Cosa ti serve?</h2>
    <div class="fila" style="flex-wrap:nowrap"><input type="text" id="ing-spesa-nuova" data-spcerca="1" enterkeyhint="done" autocomplete="off" maxlength="60" placeholder="es. latte, oppure 2 kg patate" aria-label="Cosa ti serve">
      <button type="button" class="btn" data-a="sp-agg" aria-label="Aggiungi alla lista">${ico('piu')}</button></div>
    <div class="suggerimenti" id="sug-spesa"></div>
    <p class="tenue piccolo" style="margin:0">Il reparto lo metto io. Puoi scrivere anche la quantità.</p></section>`;
  if (SPESA.mia.length) {
    h += `<p class="tenue" style="margin:0" aria-live="polite">Nel carrello: <b>${presi}</b> di ${SPESA.mia.length}. Tocca il cerchio quando prendi una cosa.</p>`;
    REPARTI.forEach(rep => {
      const qui = SPESA.mia.filter(v => v.rep === rep).sort((a, b) => a.preso - b.preso);
      if (!qui.length) return;
      h += `<section class="scheda spesa"><h2>${esc(rep)}</h2>${qui.map(v => {
        const anche = ordine.get(chiaveVoce(v.n));
        return `<div class="spesa-riga${v.preso ? ' presa' : ''}"><button type="button" class="spunta" data-a="sp-mpreso" data-id="${v.id}" aria-pressed="${v.preso}" aria-label="Preso: ${esc(v.n)}">${v.preso ? ico('spunta') : ''}</button>
          <div class="cosa"><b>${esc(v.n)}</b>${anche ? `<small>Anche per gli ordini: ${esc(anche)}</small>` : ''}</div>${v.q ? `<b class="quanto">${esc(v.q)}</b>` : ''}
          <button type="button" class="icona" data-a="sp-voce" data-id="${v.id}" aria-label="Cambia ${esc(v.n)}">${ico('matita')}</button></div>`; }).join('')}</section>`;
    });
    h += `<div class="fila">${presi ? '<button type="button" class="btn chiaro" data-a="sp-mpulisci">Togli le cose prese</button>' : ''}<button type="button" class="btn chiaro" data-a="sp-msvuota">Svuota la lista</button></div>`;
  } else h += `<div class="avviso"><div>La tua lista è vuota. Scrivi qui sopra o tocca una cosa che compri spesso.</div></div>`;
  if (spesso.length) h += `<section class="scheda"><h2>Compri spesso</h2><p class="tenue piccolo" style="margin:0">Tocca per metterla nella lista.</p>
    <div class="suggerimenti">${spesso.map(n => `<button type="button" data-a="sp-sug" data-n="${esc(n)}">${ico('piu')}${esc(n)}</button>`).join('')}</div></section>`;
  return h;
}
function suggerisciSpesa(el) {
  const box = document.getElementById('sug-spesa');
  if (!box) return;
  const q = chiaveVoce(leggiVoce(el.value).n);
  if (q.length < 2) { box.innerHTML = ''; return; }
  const nella = new Set(SPESA.mia.filter(v => !v.preso).map(v => chiaveVoce(v.n)));
  const tutti = [...Object.values(SPESA.usati).map(u => u.n), ...IDEE_SPESA, ...Object.keys(ING_SPESA).map(id => ING(id).n)];
  const visti = new Set(), trovati = [];
  tutti.forEach(n => { const k = chiaveVoce(n); if (k.includes(q) && !visti.has(k) && !nella.has(k)) { visti.add(k); trovati.push(n); } });
  trovati.sort((a, b) => chiaveVoce(b).startsWith(q) - chiaveVoce(a).startsWith(q));
  box.innerHTML = trovati.slice(0, 6).map(n => `<button type="button" data-a="sp-sug" data-n="${esc(n)}" data-q="${esc(leggiVoce(el.value).q)}">${esc(n)}</button>`).join('');
}
function foglioSpesaVoce() {
  const v = SPESA.mia.find(x => x.id === UI.foglio.id);
  if (!v) return '<div class="dentro"><p>Questa voce non c\'è più.</p></div><div class="piede"><button type="button" class="btn pieno" data-a="chiudi">Chiudi</button></div>';
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro"><h1>${esc(v.n)}</h1>
    <label class="etichetta" for="sp-vn" style="font-weight:800">Nome</label><input type="text" id="sp-vn" data-campo="sp.vn" data-id="${v.id}" maxlength="60" value="${esc(v.n)}">
    <label class="etichetta" for="sp-vq" style="font-weight:800">Quanto (se vuoi)</label><input type="text" id="sp-vq" data-campo="sp.vq" data-id="${v.id}" maxlength="30" value="${esc(v.q)}" placeholder="es. 2 kg, 3 pacchi">
    <span class="etichetta" style="font-weight:800">Reparto del negozio</span>
    <div class="scelte">${REPARTI.map(r => `<button type="button" class="chip" data-a="sp-vrep" data-id="${v.id}" data-v="${esc(r)}" aria-pressed="${v.rep === r}">${esc(r)}</button>`).join('')}</div>
    <p class="tenue piccolo" style="margin:0">Il reparto me lo ricordo per la prossima volta.</p>
    <button type="button" class="btn chiaro pieno" data-a="sp-vtogli" data-id="${v.id}">${ico('cestino')}Togli dalla lista</button></div>
    <div class="piede"><button type="button" class="btn pieno" data-a="chiudi">Fatto</button></div>`;
}
function salvaVoce(el) {
  const v = SPESA.mia.find(x => x.id === el.dataset.id);
  if (!v) return;
  if (el.dataset.campo === 'sp.vn') { const n = String(el.value).replace(/\s+/g, ' ').trim().slice(0, 60); if (!n) { el.value = v.n; return; } v.n = maiuscola(n); }
  else v.q = String(el.value).replace(/\s+/g, ' ').trim().slice(0, 30);
  salvaSpesa(); salvatoOk();
}
function cambiaMia(msg, fn) {
  const prima = JSON.stringify(SPESA.mia);
  fn(); salvaSpesa(); render();
  if (msg) mostraToast(msg, () => { SPESA.mia = JSON.parse(prima); salvaSpesa(); render(); });
}
Object.assign(A, {
  'sp-tab'(el) { UI.spesaTab = el.dataset.v; render(); },
  'sp-agg'() {
    const el = document.getElementById('ing-spesa-nuova');
    if (!el || !el.value.trim()) { if (el) el.focus(); return; }
    const t = el.value; el.value = '';
    aggiungiVoce(t);
    const nuovo = document.getElementById('ing-spesa-nuova'); if (nuovo) nuovo.focus();
  },
  'sp-sug'(el) {
    const campo = document.getElementById('ing-spesa-nuova'); if (campo) campo.value = '';
    aggiungiVoce((el.dataset.q ? el.dataset.q + ' ' : '') + el.dataset.n);
  },
  'sp-mpreso'(el) { const v = SPESA.mia.find(x => x.id === el.dataset.id); if (!v) return; v.preso = !v.preso; salvaSpesa(); render(); },
  'sp-voce'(el) { UI.foglio = { tipo: 'spesa-voce', id: el.dataset.id }; render(); },
  'sp-vrep'(el) {
    const v = SPESA.mia.find(x => x.id === el.dataset.id); if (!v) return;
    v.rep = el.dataset.v;
    const k = chiaveVoce(v.n); SPESA.usati[k] = Object.assign({ volte: 1, n: v.n }, SPESA.usati[k], { rep: v.rep });
    salvaSpesa(); render();
  },
  'sp-vtogli'(el) { const v = SPESA.mia.find(x => x.id === el.dataset.id); if (!v) return; UI.foglio = null; cambiaMia(`Tolto: ${v.n}`, () => { SPESA.mia = SPESA.mia.filter(x => x !== v); }); },
  'sp-mpulisci'() { const n = SPESA.mia.filter(v => v.preso).length; cambiaMia(`Tolte ${n} cose prese.`, () => { SPESA.mia = SPESA.mia.filter(v => !v.preso); }); },
  'sp-msvuota'() { cambiaMia('Lista svuotata.', () => { SPESA.mia = []; }); }
});

/* costo per piatto (Fase 3, C7): dosi × prezzi che Monica scrive negli ingredienti della spesa */
function prezzoUnita(id) {   // euro per 1 g, 1 ml o 1 pezzo
  const inf = infoIng(id);
  if (!inf.prezzo) return null;
  return inf.conf > 0 ? inf.prezzo / inf.conf : inf.prezzo / (inf.u === 'pz' ? 1 : 1000);
}
function costoDosi(p, variante) {
  const pezzi = [SPESA.dosi[p.id] || {}, variante ? SPESA.dosi[p.id + ':' + variante] || {} : {}];
  let tot = 0; const senza = [];
  pezzi.forEach(d => Object.keys(d).forEach(id => { const u = prezzoUnita(id); if (u == null) senza.push(id); else tot += d[id] * u; }));
  return { tot, senza: [...new Set(senza)] };
}
function costoPiatto(p) {
  const { tot, senza } = costoDosi(p);
  if (!Object.keys(SPESA.dosi[p.id] || {}).length) return '';
  const quante = f => f.tipo === 'teglia' ? (f.porzioni || (f.id === 't8' ? 8 : 6)) : 1;   // come basiRiga
  let h = `<span class="etichetta" style="font-weight:800">Quanto ti costa</span>`;
  /* prezzi scritti QUI, senza cercare la matita nella spesa (Mario 08/11 ~15:20 «la matita dov'è?»): un tasto per ogni ingrediente senza prezzo apre lo stesso foglio della spesa */
  const tasti = ids => `<div class="fila" style="flex-wrap:wrap;gap:6px;margin-top:6px">${ids.map(i => `<button type="button" class="chip" data-a="sp-ing" data-ing="${esc(i)}">${ico('matita')}${esc(ING(i).n)}</button>`).join('')}</div>`;
  if (!tot) return h + `<span class="tenue piccolo">Tocca un ingrediente e scrivi quanto lo paghi: qui vedi quanto ti costa e quanto ti resta.</span>${tasti(senza)}`;
  h += p.formati.map(f => { const c = tot * quante(f), resta = (f.prezzo || 0) - c;
    return `<div class="fila" style="justify-content:space-between"><span>${esc(f.nome)}: ti costa <b>${euro(c)}</b></span><span class="${resta < 0 ? 'allarme' : 'tenue'}">vendi a ${euro(f.prezzo)} · ti restano <b>${euro(resta)}</b></span></div>`; }).join('');
  if (senza.length) h += `<span class="tenue piccolo">Senza prezzo (non contano ancora), tocca per scriverlo:</span>${tasti(senza)}`;
  return h;
}
