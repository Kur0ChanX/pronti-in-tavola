/* Pronti in Tavola · logica dell'app.
   Versione di prova: i dati restano su questo telefono (localStorage).
   Nella versione vera solo lo strato «Dati» (carica, salva) passa a Firebase: il resto non cambia. */
'use strict';
/* arrivo da «Apri in Chrome» (C28): l'indirizzo non può portare il «#…» (inviti, #da=), viaggia in ?h= e qui torna al suo posto */
(() => { try { const h = new URLSearchParams(location.search).get('h'); if (h && !location.hash) history.replaceState(null, '', location.pathname + '#' + h); } catch (e) { /* niente */ } })();

const CHIAVE = 'pit-prova-v1', CHIAVE_P = 'pit-telefono-v1';
const LOGO = 'media/logo-480.webp';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const NUM = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });
const euro = n => EUR.format(n || 0);
const euroBreve = n => Number.isInteger(n) ? `${n} €` : euro(n);
const arrot = n => Math.round(n * 100) / 100;
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/* ---------- date ---------- */
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const oggi = () => iso(new Date());
const daIso = s => { const [y, m, g] = s.split('-').map(Number); return new Date(y, m - 1, g, 12); };
const piuGiorni = (s, n) => { const d = daIso(s); d.setDate(d.getDate() + n); return iso(d); };
const settimana = s => { const d = daIso(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const F_LUNGO = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const F_GS = new Intl.DateTimeFormat('it-IT', { weekday: 'short' });
const F_MESE = new Intl.DateTimeFormat('it-IT', { month: 'short' });
const F_DATA = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' });
function giornoLungo(s) {
  if (!s) return '';
  if (s === oggi()) return 'oggi';
  if (s === piuGiorni(oggi(), 1)) return 'domani';
  return F_LUNGO.format(daIso(s));
}
const maiuscola = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const giorniFa = s => Math.round((daIso(oggi()) - daIso(s)) / 864e5);

/* ---------- icone ---------- */
const PATH = {
  menu: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 21V3c-2 1-3 3.5-3 7s1 4 3 4"/>',
  ordini: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  ritiro: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  io: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  carrello: '<path d="M3 9h18l-2 11H5z"/><path d="M8 9l4-6 4 6"/>',
  piu: '<path d="M12 5v14M5 12h14"/>',
  meno: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  indietro: '<path d="M15 5l-7 7 7 7"/>',
  spunta: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  cuore: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  piatti: '<path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 7V5M10 5h4"/>',
  clienti: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .7 3.2 2.3 3.8 5"/>',
  impostazioni: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  scarica: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  chat: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 10h6M9 13h4"/>',
  telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mappa: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  foto: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  cestino: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  orologio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  aiuto: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>',
  condividi: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
  spiga: '<path d="M12 21V6"/><path d="M12 9c-2-1-3-3-3-5 2 1 3 3 3 5zM12 9c2-1 3-3 3-5-2 1-3 3-3 5zM12 13c-2-1-3-3-3-5 2 1 3 3 3 5zM12 13c2-1 3-3 3-5-2 1-3 3-3 5zM12 17c-2-1-3-3-3-5 2 1 3 3 3 5zM12 17c2-1 3-3 3-5-2 1-3 3-3 5z"/>',
  pausa: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
  invito: '<path d="M21 3L3 10.5l7 2.5 2.5 7z"/><path d="M10 13l11-10"/>',
  fiamma: '<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.6 3-5.6 3.5-9.3 2.3 1.4 3.5 3.6 3.5 5.5 1-.6 1.7-1.7 2-3 2 1.8 4 4.2 4 6.8 0 3.6-2.5 6.2-6.5 6.2z"/>',
  stella: '<path d="M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16.3 6.6 19.2l1.3-6-4.5-4 6-.6z"/>',
  matita: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  euro: '<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5M4 10h9M4 14h9"/>',
  occhio: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lucchetto: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v2"/>'
};
const ico = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATH[n]}</svg>`;

/* ---------- dati ---------- */
function carica() {
  /* motore «firebase»: la copia del telefono subito, poi i dati veri dal server (dati.js) */
  if (Dati.attivo) return Dati.copiaLocale() || Object.assign(statoIniziale(), { piatti: [], clienti: [], ordini: [], richieste: [] });
  try {
    const s = JSON.parse(localStorage.getItem(CHIAVE));
    if (s && s.versione === 1) return s;
  } catch (e) { /* prova senza memoria */ }
  return statoIniziale();
}
let S = carica();
if (!S.ingExtra) S.ingExtra = {};
if (!S.soloContanti) { S.impostazioni.paga.bonifico = false; S.impostazioni.paga.postepay = false; S.soloContanti = true; }
/* il cestino tiene i piatti 30 giorni */
S.piatti = S.piatti.filter(p => !p.cestino || giorniFa(p.cestino) <= 30);

const P0 = { ruolo: 'cliente', cliente: 'c1', carrello: [], allergie: [], grande: false, apertura: '', guida: false, visti: 3 };
function caricaP() {
  try { return Object.assign({}, P0, JSON.parse(localStorage.getItem(CHIAVE_P)) || {}); }
  catch (e) { return Object.assign({}, P0); }
}
let P = caricaP(); /* cose di questo telefono: ruolo, carrello, allergie */

const UI = {
  vista: P.ruolo === 'monica' ? 'home' : 'menu',
  foglio: null, sel: null, entro: null, metodo: '', nota: '',
  tab: 'oggi', ordAperto: null, ordFiltro: 'tutti', ordQuanti: 40, modifica: null, nuovo: null, guidaPasso: 0, proposta: null, salvato: false
};

function salva() {
  if (Dati.attivo) return Dati.scrivi(S);
  try { localStorage.setItem(CHIAVE, JSON.stringify(S)); }
  catch (e) { mostraToast('Memoria piena: in questa prova le foto pesano troppo. Togline una.'); }
  return Promise.resolve();
}
function salvaP() { try { localStorage.setItem(CHIAVE_P, JSON.stringify(P)); } catch (e) { /* niente */ } }

let tToast = null, fnAnnulla = null;
function mostraToast(msg, annulla) {
  clearTimeout(tToast);
  fnAnnulla = annulla || null;
  $('#toast').innerHTML = `<div class="toast" role="status"><span>${esc(msg)}</span>${annulla ? '<button type="button" data-a="annulla">Annulla</button>' : ''}</div>`;
  tToast = setTimeout(() => { $('#toast').innerHTML = ''; fnAnnulla = null; }, annulla ? 10000 : 3200);
}
/* ogni cambio: salva da solo e, se serve, si può annullare per 10 secondi */
function cambia(msg, fn, annullabile = true) {
  const prima = annullabile ? JSON.stringify(S) : null;
  fn();
  salva(); render();
  if (msg) mostraToast(msg, prima ? () => { S = JSON.parse(prima); salva(); render(); } : null);
}

/* ---------- piatti, prezzi, allergeni ---------- */
const piatto = id => S.piatti.find(p => p.id === id);
const visibili = () => S.piatti.filter(p => !p.cestino).sort((a, b) => a.ordine - b.ordine);
const ING = id => INGREDIENTI[id] || S.ingExtra[id] || { n: id, a: [] };
const NOME_ALL = Object.fromEntries(ALLERGENI);
const ingDi = (p, vId) => {
  const v = vId ? p.varianti.find(x => x.id === vId) : null;
  return [...new Set([...(p.ing || []), ...(v ? v.ing || [] : [])])];
};
const allergeniDi = ids => { const s = new Set(); ids.forEach(i => ING(i).a.forEach(a => s.add(a))); return ALLERGENI.map(x => x[0]).filter(k => s.has(k)); };
const tuttiIng = p => [...new Set([...(p.ing || []), ...p.varianti.flatMap(v => v.ing || [])])];
const vegetariano = p => tuttiIng(p).length > 0 && !tuttiIng(p).some(i => ING(i).m);
function rischio(p) {
  const mie = new Set(P.allergie);
  if (!mie.size) return null;
  const base = allergeniDi(p.ing || []).filter(a => mie.has(a));
  if (base.length) return { tutti: true, a: base };
  const alcune = [...new Set(p.varianti.flatMap(v => allergeniDi(v.ing || [])))].filter(a => mie.has(a));
  return alcune.length ? { tutti: false, a: alcune } : null;
}
function prezzoDi(p, fId, vId) {
  const f = p.formati.find(x => x.id === fId) || p.formati[0];
  const v = vId ? p.varianti.find(x => x.id === vId) : null;
  const pv = v && v.prezzi ? v.prezzi[f.id] : null;
  return pv !== null && pv !== undefined && pv !== '' ? Number(pv) : Number(f.prezzo);
}
function etichettaPrezzo(p) {
  const prezzi = [];
  p.formati.forEach(f => { prezzi.push(prezzoDi(p, f.id)); p.varianti.forEach(v => prezzi.push(prezzoDi(p, f.id, v.id))); });
  const min = Math.min(...prezzi), f = p.formati[0];
  const unita = p.formati.length === 1 ? (f.tipo === 'kg' ? ' al kg' : f.tipo === 'pz' ? ' l\'uno' : '') : '';
  return (new Set(prezzi).size > 1 ? 'da ' : '') + euroBreve(min) + unita;
}
function qtaTesto(tipo, q, formatoNome) {
  if (tipo === 'kg') return `${NUM.format(q)} kg`;
  if (tipo === 'pz') return `${q} ${q === 1 ? 'pezzo' : 'pezzi'}`;
  if (tipo === 'teglia') return `${q} ${q === 1 ? 'teglia' : 'teglie'}${String(formatoNome || '').replace(/^Teglia/i, '')}`;
  return `${q} ${q === 1 ? 'intera' : 'intere'}`;
}
const descRiga = r => [r.varianteNome, qtaTesto(r.tipo, r.qta, r.formatoNome), r.fritto ? 'fritto da Monica' : r.forno ? 'al forno da Monica' : ''].filter(Boolean).join(' · ');
/* «Fritto da Monica» (Mario 07/11, C30): sovrapprezzo che Monica mette per ogni piatto; una cifra sola per il piatto, qualunque quantità (Mario: «non a pezzo ma a prodotto complessivo») */
/* «Al forno da Monica» (Mario 07/11): come il fritto, sovrapprezzo unico per piatto; il cliente sceglie una sola cottura */
const extraFritto = r => r.fritto ? arrot(r.frittoPrezzo || 0) : r.forno ? arrot(r.fornoPrezzo || 0) : 0;
const prezzoRiga = r => arrot(r.prezzo * r.qta + extraFritto(r));
const totale = rr => arrot(rr.reduce((s, r) => s + prezzoRiga(r), 0));
const quanti = rr => rr.length;
const passoDi = f => ({ min: f.min || 1, passo: f.passo || 1 });
const piuAmato = () => { const p = visibili().filter(x => x.disponibile).sort((a, b) => b.cuori - a.cuori)[0]; return p && p.cuori >= 5 ? p.id : null; };
const novita = p => p.novita && (!p.novitaDal || giorniFa(p.novitaDal) <= 14);
const descPiatto = p => {
  const ing = (p.ing || []).slice(0, 4).map(i => ING(i).n.toLowerCase());
  const v = p.varianti.length ? `${p.varianti.length} gusti` : '';
  return [p.sotto, v, ing.join(', ')].filter(Boolean).join(' · ');
};
const pausaOra = () => { const pa = S.impostazioni.pausa; return pa.attiva && oggi() <= pa.fino; };
const prontiOggi = () => pausaOra() ? [] : visibili().filter(p => p.disponibile && p.pronto && p.pronto.qta > 0 && p.pronto.giorno === oggi());
const cliente = id => S.clienti.find(c => c.id === id) || { nome: 'Cliente' };
const nomeBreve = n => String(n || '').split(' ')[0];

/* ---------- ordini ---------- */
const ATTIVI = ['nuovo', 'proposta', 'accettato', 'pronto'];
/* teglie che un ordine occupa nella sua settimana (i «pronti» e gli ordini chiusi no) */
const teglieOrdine = o => (!o.pronto && ATTIVI.includes(o.stato) ? o.righe.filter(r => r.tipo === 'teglia' || r.tipo === 'intera').reduce((a, r) => a + r.qta, 0) : 0);
function teglieSettimana(sett, escludi) {
  /* il cliente vero non vede gli ordini degli altri: conta il documento settimane/ */
  if (S.motore === 'firebase' && P.ruolo !== 'monica') {
    const o = escludi && ordine(escludi);
    return Math.max(0, ((S.settimane || {})[sett] || 0) - (o && settimana(o.entro) === sett ? teglieOrdine(o) : 0));
  }
  return S.ordini.filter(o => o.id !== escludi && settimana(o.entro) === sett).reduce((s, o) => s + teglieOrdine(o), 0);
}
const contaSettimane = St => St.ordini.reduce((m, o) => { const n = teglieOrdine(o); if (n) { const k = settimana(o.entro); m[k] = (m[k] || 0) + n; } return m; }, {});
function giorniPossibili(teglieNuove, da, escludi) {
  const imp = S.impostazioni, out = [], primo = da || piuGiorni(oggi(), imp.anticipo);
  for (let i = 0; i < 14; i++) {
    const g = piuGiorni(primo, i);
    let no = '';
    if (imp.pausa.attiva && g <= imp.pausa.fino) no = 'Pausa';
    else if (imp.limite.attivo && teglieNuove > 0 && teglieSettimana(settimana(g), escludi) + teglieNuove > imp.limite.teglie) no = 'Piena';
    out.push({ g, no });
  }
  return out;
}
const STATO_CLIENTE = { nuovo: 'Da confermare', proposta: 'Nuova data', accettato: 'Confermato', pronto: 'Pronto!', ritirato: 'Ritirato', rifiutato: 'Non disponibile', annullato: 'Annullato', daApprovare: 'Aspetta Monica', prova: 'Di prova' };
const segna = (o, st) => { o.stato = st; o.tempi = Object.assign({}, o.tempi, { [st]: Date.now() }); };
const STATO_MONICA = { nuovo: 'Nuovo', proposta: 'Aspetta risposta', accettato: 'Da preparare', pronto: 'Pronto', ritirato: 'Ritirato', rifiutato: 'Rifiutato', annullato: 'Annullato dal cliente', daApprovare: 'Cliente nuovo', prova: 'Di prova' };
const METODO = { contanti: 'Contanti al ritiro', bonifico: 'Bonifico istantaneo', postepay: 'Postepay' };
/* telefono nuovo che aspetta il Sì di Monica, legato al suo primo ordine */
const richiestaDi = o => o.stato === 'daApprovare' ? (S.richieste || []).find(r => r.primo === o.id) || null : null;
const chiOrdina = o => o.cliente ? cliente(o.cliente).nome
  : ((S.richieste || []).find(r => r.primo === o.id) || (S.utenti || []).find(u => u.uid === o.utente) || {}).nome || 'Cliente nuovo';
/* prezzi di Monica: finché non accetta, il totale si fa coi prezzi del menù (non con quelli scritti dal telefono);
   le righe già accettate tengono il loro prezzo */
const prezzoOra = r => { const p = piatto(r.piatto); return p && p.formati.some(f => f.id === r.formato) ? prezzoDi(p, r.formato, r.variante) : r.prezzo; };
const prezziGiusti = (rr, prima = []) => rr.map(r => {
  const v = prima.find(x => x.piatto === r.piatto && x.formato === r.formato && (x.variante || '') === (r.variante || ''));
  const p = piatto(r.piatto), fp = v && v.fritto ? v.frittoPrezzo : (p && p.fritto > 0 ? p.fritto : r.frittoPrezzo);
  const fo = v && v.forno ? v.fornoPrezzo : (p && p.forno > 0 ? p.forno : r.fornoPrezzo);
  return Object.assign({}, r, { prezzo: v ? v.prezzo : prezzoOra(r) }, r.fritto ? { frittoPrezzo: fp || 0 } : {}, r.forno ? { fornoPrezzo: fo || 0 } : {});
});
const daAccettare = o => ['nuovo', 'daApprovare'].includes(o.stato);
const daGuardare = () => S.ordini.filter(o => !o.archiviato && o.stato !== 'prova' && (o.stato === 'nuovo' || o.modifica || richiestaDi(o) || (o.paga.dice && !o.paga.ricevuto && o.stato !== 'annullato')));
const mapsLink = () => { const r = S.impostazioni.ritiro; return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.via + ', ' + r.citta)}`; };
const numero = n => { const d = String(n || '').replace(/\D/g, ''); return d ? (d.length <= 10 ? '39' + d : d) : ''; };
/* indirizzo del sito: sempre quello di data.js, mai quello salvato nei dati (Mario 07/11: nei dati di Firebase c'era ancora pages.dev, sito mai esistito, e il link dell'invito non si apriva) */
const SITO = statoIniziale().impostazioni.indirizzoApp;
const wa = (num, testo) => `https://wa.me/${numero(num)}?text=${encodeURIComponent(testo)}`;
const firmaMsg = '\nMonica · Pronti in Tavola';
function righeDaCarrello(rr) { return rr.map(r => Object.assign({}, r)); }

/* ---------- pezzi di pagina ---------- */
function foto(p, cls = '') {
  if (p.foto) return `<div class="foto ${cls}"><img src="${p.foto}" alt="${esc(p.nome)}"></div>`;
  return `<div class="foto segnaposto ${cls}" aria-hidden="true"><span>${esc(p.nome.charAt(0))}</span></div>`;
}
const YN = '<div class="yn" role="img" aria-label="YNOY Corp"><i class="ys"></i><i class="y1"></i><i class="y2"></i><i class="y3"></i><i class="y4"></i></div>';
/* Modalità sviluppatore (Mario 07/11): 7 tocchi sulla firma, solo per il gestore «Mario» (o nell'anteprima), solo su quel telefono */
const puoSviluppare = () => P.ruolo === 'monica' || UI.devCliente ? (!Dati.attivo || (Dati.io.gestore && /^mario\b/i.test(Dati.io.nomeGestore || ''))) : false;
const sviluppatore = () => !!P.sviluppatore && (puoSviluppare() || !!UI.devCliente);
function barraDev() {
  if (!sviluppatore() || !(UI.barraDev || UI.devCliente)) return '';   // guardando come cliente resta, per poter tornare
  return `<div class="prova dev" role="group" aria-label="Modalità sviluppatore">Sviluppatore · guarda come
    <button type="button" data-a="dev-come" data-v="cliente" aria-pressed="${!!UI.devCliente}">Cliente</button>
    <button type="button" data-a="dev-come" data-v="" aria-pressed="${!UI.devCliente}">Gestore</button>
    <span class="dev-v">v${VERSIONE_APP}</span></div>`;
}
/* barra sviluppatore: scorri il dito da sinistra a destra in cima allo schermo (Mario 07/11).
   È un gesto di lato: il «tira giù per ricaricare» è in verticale, quindi non si toccano. */
(() => {
  let x0 = null, y0 = 0, t0 = 0;
  addEventListener('touchstart', e => { const t = e.touches[0]; x0 = e.touches.length === 1 && t.clientY < 140 && t.clientX < innerWidth * .6 ? t.clientX : null; y0 = t.clientY; t0 = Date.now(); }, { passive: true });
  addEventListener('touchend', e => {
    if (x0 === null) return; const t = e.changedTouches[0], dx = t.clientX - x0, dy = Math.abs(t.clientY - y0); x0 = null;
    if (dx < 90 || dy > 40 || dy > dx * .35 || Date.now() - t0 > 700 || !Dati.attivo || !sviluppatore()) return;
    UI.barraDev = !UI.barraDev; render(); mostraToast(UI.barraDev ? 'Barra sviluppatore aperta. Scorri di nuovo per chiuderla.' : 'Barra sviluppatore chiusa.');
  }, { passive: true });
})();
const firma = () => `<footer class="firma" data-a="firma-tocco">Powered by${YN}${Dati.attivo && !Dati.io.gestore && P.ruolo !== 'monica' && !P.invitoGestore ? '<br><button type="button" class="riservata" data-a="entra-monica">Area riservata</button>' : ''}</footer>`;
const filo = () => `<div class="filo" aria-hidden="true">${ico('spiga')}</div>`;
function striscia() {
  if (Dati.attivo) return barraDev();
  const n = daGuardare().length;
  return `<div class="prova" role="group" aria-label="Versione di prova">Prova · guarda come
    <button type="button" data-a="ruolo" data-v="cliente" aria-pressed="${P.ruolo === 'cliente'}">Cliente</button>
    <button type="button" data-a="ruolo" data-v="monica" aria-pressed="${P.ruolo === 'monica'}">Monica${n ? ` (${n})` : ''}</button>
    <button type="button" data-a="rivedi-apertura" aria-label="Rivedi l'apertura">▶ Intro</button></div>`;
}
function passo(azione, valore, extra = '') {
  return `<div class="passo"><button type="button" data-a="${azione}" data-d="-1" ${extra} aria-label="Meno">${ico('meno')}</button><output>${valore}</output><button type="button" data-a="${azione}" data-d="1" ${extra} aria-label="Più">${ico('piu')}</button></div>`;
}
function etichette(p, conPronto = true) {
  const e = [];
  const r = rischio(p);
  if (r) e.push(`<span class="eti rischio">${r.tutti ? 'Contiene' : 'Un gusto contiene'}: ${r.a.map(a => NOME_ALL[a].toLowerCase()).join(', ')}</span>`);
  if (conPronto && prontiOggi().includes(p)) e.push('<span class="eti pronto">Pronto oggi</span>');
  if (novita(p)) e.push('<span class="eti nuovo">Novità</span>');
  if (piuAmato() === p.id) e.push('<span class="eti amato">Il più amato</span>');
  if (vegetariano(p)) e.push('<span class="eti veg">Vegetariano</span>');
  return e.length ? `<div class="etichette">${e.join('')}</div>` : '';
}
function voce(p) {
  return `<button type="button" class="voce" data-a="piatto" data-id="${p.id}">${foto(p)}<div>
    <div class="nome-prezzo"><b>${esc(p.nome)}</b><i></i><em>${etichettaPrezzo(p)}</em></div>
    <p>${esc(descPiatto(p))}</p>${etichette(p)}</div></button>`;
}
function rigaOrdine(r, extra = '') {
  return `<div class="riga-ord ${extra}"><b>${esc(r.nome)}</b><span class="prezzo">${euro(prezzoRiga(r))}</span>
    <span class="det">${esc(descRiga(r))}</span>
    ${r.note && r.note.length || r.testo ? `<span class="nota">${esc([...(r.note || []), r.testo].filter(Boolean).join(' · '))}</span>` : ''}</div>`;
}

/* ================= CLIENTE ================= */
/* nome del cliente di questo telefono: quello scritto nel benvenuto (Mario 05/11: «entra nome e cognome… e gli dici ciao, il suo nome») */
/* «Scrivi a Monica» (Mario 08/11): messaggio già iniziato, professionale, il cliente scrive solo la domanda.
   Il numero di Monica ce l'hanno solo i clienti approvati (impostazioni/approvati): senza numero niente tasto. */
function waMonica(o) {
  /* nome e cognome scritti all'entrata; se manca (es. Mario che guarda come cliente) quello di chi gestisce, poi quello di prova */
  const chi = [nomeCliente(), Dati.attivo && Dati.io.nomeGestore, P.nomeProva].find(x => x && x !== 'Cliente') || '', firma = chi ? ` Sono ${chi}.` : '';
  const testa = o ? `Ciao Monica! 👋 Ti scrivo dall'app Pronti in Tavola per l'ordine n. ${o.n} (ritiro ${giornoLungo(o.entro)}).${firma}` : `Ciao Monica! 👋 Ti scrivo dall'app Pronti in Tavola.${firma}`;
  return wa(S.impostazioni.whatsapp, `${testa}\n\nVolevo chiederti: `);
}
const tastoMonica = () => S.impostazioni.whatsapp ? `<a class="wa-monica" href="${waMonica()}" target="_blank" rel="noopener" aria-label="Scrivi a Monica su WhatsApp">${ico('chat')}<span>Scrivi a Monica</span></a>` : '';
const nomeCliente = () => Dati.attivo ? ((Dati.io.utente && Dati.io.utente.nome) || (cliente(P.cliente) || {}).nome || '') : (P.nomeProva || cliente(P.cliente).nome);
/* il benvenuto: alla prima apertura il cliente nuovo scrive nome e cognome, senza non si entra (nell'anteprima: una volta per telefono) */
function serveBenvenuto() {
  if (P.ruolo !== 'cliente' || UI.senzaNome || UI.devCliente) return false;   // lo sviluppatore che guarda come cliente non si registra
  return Dati.attivo ? !!Dati.io.uid && Dati.io.letto && !Dati.io.utente : !P.benvenuto;
}
/* app sulla schermata Home «a prova di stupido» (Mario 07/11): Android = un tocco (beforeinstallprompt);
   se il telefono non lo offre, i passi veri di Chrome (foto di Mario: ⋮ → «Installa e crea scorciatoia»); iPhone = passi di Safari.
   Già installata: non si mostra niente. */
let installa = null;
/* niente preventDefault: così Chrome mostra da solo il suo bannerino «Installa app» in alto (come in altri siti); il pulsante resta per chi lo chiude */
addEventListener('beforeinstallprompt', e => { installa = e; render(); });
addEventListener('appinstalled', () => { installa = null; P.installata = true; salvaP(); render(); mostraToast('Fatto! Trovi Pronti in Tavola tra le app del telefono.'); });
const suHome = () => P.installata || (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const telefono = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios' : 'android';
function cartaHome(dopo) {
  if (suHome()) return '';
  const passi = pp => pp.map((t, i) => `<div class="passo-invito"><span class="num">${i + 1}</span><div>${t}</div></div>`).join('');
  let h = `<section class="scheda passi-invito carta-home"><h2>${ico('scarica')}Metti l'app sul telefono</h2><p class="tenue" style="margin:0">Così la apri con un tocco, come le altre app.</p>`;
  if (installa) h += `<button type="button" class="btn pieno grande" data-a="installa">Mettila sul telefono</button>`;
  else if (telefono() === 'ios') h += passi([
    'Apri questa pagina con <b>Safari</b> (l\'icona della bussola).',
    'Tocca <b>⋯</b> (o <b>aA</b>) accanto all\'indirizzo, poi <b>Condividi</b>: il quadrato con la freccia in su.',
    'Scorri in giù e tocca <b>Aggiungi alla schermata Home</b>, poi <b>Aggiungi</b> in alto a destra.']);
  else if (suSamsung) h += passi([
    'Tocca le <b>tre righe ≡</b> in basso a destra.',
    'Tocca <b>Aggiungi pagina a</b>, poi <b>Schermata Home</b>.',
    'Tocca <b>Aggiungi</b>.']);
  else h += passi([
    'Tocca i <b>tre puntini ⋮</b> in alto a destra.',
    'Scorri fino in fondo e tocca <b>Installa e crea scorciatoia</b> (su alcuni telefoni: <b>Aggiungi a schermata Home</b>).',
    'Tocca <b>Installa</b>.']) + `<p class="tenue piccolo" style="margin:8px 0 0">Non vedi i tre puntini in alto? Sei dentro WhatsApp: tocca ⋮ e poi <b>Apri in Chrome</b>.</p>`;
  if (dopo) h += `<p class="tenue piccolo" style="margin:8px 0 0">${dopo}</p>`;
  return h + '</section>';
}
/* invito per gestire (Mario 07/11: «un invito fatto bene, come un'app professionale»): link con #gestore.
   Chi lo apre entra con Google; a Mario arriva la richiesta con Sì/No; al sì l'app si riapre da gestore. */
function vInvitoGestore() {
  const io = Dati.io, google = Dati.attivo && io.uid && !io.anonimo, mia = google && io.richiestaMia, lei = P.invitoGestore === 'm';
  let h = `<main class="corpo benvenuto invito"><img class="benv-logo" src="media/logo-medaglione.webp" alt="Pronti in Tavola con Monica">`;
  if (!google) return h + `<h1>${lei ? 'Benvenuta nella tua app!' : 'Ti aspettiamo in cucina!'}</h1>
    <p class="tenue">Questa è <b>Pronti in Tavola</b>, l'app ${lei ? 'preparata per te' : 'della cucina'}: qui ricevi gli ordini delle amiche, sistemi i tuoi piatti e vedi cosa preparare.</p>
    <section class="scheda passi-invito"><h2>Due passi e ci sei</h2>
      <div class="passo-invito"><span class="num">1</span><div><b>Entra con il tuo account Google</b><br><span class="tenue piccolo">Serve una volta sola: così l'app sa che sei tu.</span></div></div>
      <div class="passo-invito"><span class="num">2</span><div><b>Mettila sul telefono</b><br><span class="tenue piccolo">Te lo mostriamo subito dopo, con un tocco.</span></div></div>
      <button type="button" class="btn pieno grande" data-a="inv-google"${UI.invInvio ? ' disabled' : ''}>${UI.invInvio ? 'Un attimo…' : 'Entra con Google'}</button></section>
    <p class="tenue piccolo" style="text-align:center">Non ti aspettavi questo messaggio? Chiudi pure la pagina.</p></main>`;
  if (!mia) return h + `<h1>Ci sei quasi!</h1><p class="tenue">${lei ? 'Sei entrata' : 'Hai fatto l\'accesso'} come <b>${esc(io.email)}</b>. Manca un tocco per avvisare Mario.</p>
    <button type="button" class="btn pieno grande" data-a="inv-chiedi"${UI.invInvio ? ' disabled' : ''}>${UI.invInvio ? 'Un attimo…' : 'Avvisa Mario'}</button>
    <button type="button" class="link" data-a="inv-altro">Non sei tu? Entra con un altro account</button></main>`;
  const testo = `Ciao! ${lei ? 'Sono entrata' : 'Ho fatto l\'accesso'} in Pronti in Tavola: quando puoi, dimmi di sì dall'app 😊`;
  return h + `<h1>Fatto!</h1><p class="tenue">Mario ha ricevuto la tua richiesta. Appena dice sì, la tua cucina si apre da sola, qui.</p>
    <div class="avviso verde">${ico('spunta')}<div>${lei ? 'Sei entrata' : 'Hai fatto l\'accesso'} come <b>${esc(io.email)}</b>.</div></div>
    <a class="btn chiaro pieno" href="${wa('', testo)}" target="_blank" rel="noopener">${ico('chat')}Scrivi a Mario su WhatsApp</a>
    ${cartaHome(telefono() === 'ios' ? 'Su iPhone: dopo, apri l\'app dall\'icona e tocca «Area riservata» in fondo, con lo stesso Google.' : '')}
    <button type="button" class="link" data-a="inv-altro">Non sei tu? Entra con un altro account</button></main>`;
}
/* testo dell'invito che Mario manda dall'app */
const testoInvitoGestore = (tipo = 'g') => tipo === 'a'
  ? `Ciao! Sono ${cuoca()} 🍝 Ho aperto Pronti in Tavola, la mia cucina di casa a ${citta()}: guardi il menù coi prezzi, ordini con pochi tocchi e passi da me a ritirare.\n\nTocca qui:\n${SITO}#da=monica`
  : tipo === 'm'
  ? `Ciao! 👩‍🍳 Ho preparato per te Pronti in Tavola, la tua cucina online: qui ricevi gli ordini delle amiche, sistemi i piatti e vedi cosa preparare.\n\nApri il link, entra col tuo account Google e io ti confermo con un tocco:\n${SITO}#gestore-m`
  : `Ciao! 👩‍🍳 Ti invito a gestire con me Pronti in Tavola: qui arrivano gli ordini, si sistemano i piatti e si vede cosa preparare.\n\nApri il link, entra col tuo account Google e io ti confermo con un tocco:\n${SITO}#gestore`;
/* prova delle notifiche (Mario 07/11: «fai test notifica nell'app»): una notifica vera su QUESTO telefono, senza server.
   Dice se il telefono le sa mostrare e se il permesso c'è; le notifiche degli ordini arrivano dopo, col Worker (C3). */
function statoNotifiche() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return telefono() === 'ios' && !standalone() ? 'ios-home' : 'no';
  return Notification.permission;   // 'granted', 'denied', 'default'
}
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
function cartaNotifica() {
  const st = statoNotifiche(), esito = UI.notEsito;
  const msg = {
    'ios-home': 'Su iPhone le notifiche arrivano solo dall\'app messa sulla schermata Home: mettila lì (Condividi → «Aggiungi alla schermata Home») e riprova dall\'icona.',
    no: 'Questo browser non sa mostrare notifiche. Prova con Chrome, o dall\'app sulla schermata Home.',
    denied: 'Le notifiche sono bloccate per questo sito. Riaprile dalle impostazioni del browser: lucchetto accanto all\'indirizzo → Notifiche → Consenti.',
    granted: 'Permesso dato. Tocca il pulsante: deve arrivarti una notifica di prova.',
    default: 'Tocca il pulsante: il telefono ti chiede il permesso, rispondi «Consenti».'
  }[st];
  return `<section class="scheda"><h2>Notifiche</h2><p class="tenue" style="margin:0">${msg}</p>
    ${esito ? `<div class="avviso ${esito.ok ? 'verde' : ''}">${ico(esito.ok ? 'spunta' : 'x')}<div>${esc(esito.t)}</div></div>` : ''}
    ${(st === 'granted' || st === 'default') && sulSito() && Dati.io.gestore ? `<button type="button" class="btn pieno" data-a="avvisi-attiva"${UI.notProva ? ' disabled' : ''}>${ico('invito')}${UI.notProva ? 'Un attimo…' : P.avvisiAttivi ? 'Iscrivi di nuovo questo telefono' : 'Tocca qui: ricevi gli ordini su questo telefono'}</button>
    <p class="tenue piccolo" style="margin:0">${P.avvisiAttivi ? '✅ Questo telefono è iscritto: a ogni ordine nuovo suona.' : '❌ Questo telefono NON è ancora iscritto agli ordini.'}</p>` : ''}
    ${(st === 'granted' || st === 'default') && sulSito() && !Dati.io.gestore && P.cliente ? `<button type="button" class="btn pieno" data-a="avvisi-cliente"${UI.notProva ? ' disabled' : ''}>${ico('invito')}${UI.notProva ? 'Un attimo…' : P.avvisiCliente ? 'Riattiva l\'avviso su questo telefono' : 'Avvisami quando il mio ordine è pronto'}</button>
    <p class="tenue piccolo" style="margin:0">${P.avvisiCliente ? '✅ Avviso attivo: quando Monica segna «pronto», ti suona il telefono.' : 'Se preferisci, Monica ti scrive anche su WhatsApp come sempre.'}</p>` : ''}
    ${st === 'granted' || st === 'default' ? `<button type="button" class="btn chiaro pieno" data-a="notifica-prova"${UI.notProva ? ' disabled' : ''}>${ico('chat')}${UI.notProva ? 'Un attimo…' : 'Prova le notifiche'}</button>` : ''}
    <p class="tenue piccolo" style="margin:0">${Dati.attivo && Dati.io.gestore ? '«Ricevi gli ordini» iscrive questo telefono: a ogni ordine nuovo suona. «Prova» controlla solo che il telefono le sappia mostrare.' : '«Prova» controlla solo che il telefono sappia mostrare le notifiche.'}</p></section>`;
}
/* notifiche vere degli ordini (C3): solo sul sito vero, dove c'è worker.js */
const sulSito = () => Dati.attivo && location.origin === new URL(SITO).origin;
/* tipo: ordine (nuovo), richiesta (persona nuova), risposta (alla proposta del giorno), modifica (C27, C33) */
function avvisaGestori(tipo = 'ordine') { if (sulSito()) fetch('/api/avvisa', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tipo }) }).catch(() => {}); }
/* iscrive (o rinnova) questo telefono presso worker.js; ridà la funzione per altre chiamate col token */
async function iscriviTelefono(tok) {
  const { chiave } = await (await fetch('/api/chiave')).json();
  const reg = await navigator.serviceWorker.ready, b = Uint8Array.from(atob(chiave.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((chiave.length + 3) % 4)), c => c.charCodeAt(0));
  let sub = await reg.pushManager.getSubscription();
  if (sub && sub.options && sub.options.applicationServerKey && new Uint8Array(sub.options.applicationServerKey).join() !== b.join()) { await sub.unsubscribe(); sub = null; }
  sub = sub || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b });
  const post = (u, corpo) => fetch(u, { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify(corpo || {}) });
  const r = await post('/api/iscrivi', { sub: sub.toJSON() });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).errore) || 'iscrizione rifiutata');
  return post;
}
/* rinnovo da solo (07/11: iscrizione scaduta → 410, il telefono non suonava): a ogni apertura del gestore iscritto,
   in silenzio, si rimanda l'iscrizione di oggi (se il telefono l'ha cambiata, quella vecchia non vale più) */
let rinnovato = false;
async function rinnovaAvvisi() {
  if (!rinnovato && P.avvisiCliente && !Dati.io.gestore && sulSito() && 'Notification' in window && Notification.permission === 'granted') { rinnovato = true; iscriviCliente().catch(() => { rinnovato = false; }); return; }
  if (rinnovato || !P.avvisiAttivi || !sulSito() || !('Notification' in window) || Notification.permission !== 'granted') return;
  rinnovato = true;
  try { const tok = await Dati.token(); if (tok) await iscriviTelefono(tok); } catch (e) { rinnovato = false; }
}
/* agenda per il promemoria della sera (Mario 07/11): quanti ordini accettati per ogni giorno, solo numeri */
let agendaMandata = '';
function inviaAgenda() {
  if (!sulSito() || !Dati.io.gestore) return;
  const a = {};
  S.ordini.filter(o => ['accettato', 'pronto'].includes(o.stato) && o.entro >= oggi()).forEach(o => { a[o.entro] = (a[o.entro] || 0) + 1; });
  const j = JSON.stringify(a);
  if (j === agendaMandata) return;
  agendaMandata = j;
  Dati.token().then(tok => tok && fetch('/api/agenda', { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: j }))
    .then(r => { if (!r || !r.ok) agendaMandata = ''; }).catch(() => { agendaMandata = ''; });
}
/* avviso «il tuo ordine è pronto» al cliente (C25, Mario 07/11 «sia da app se vuole sia WhatsApp, può scegliere») */
async function iscriviCliente() {
  const tok = await Dati.tokenCliente(); if (!tok) throw new Error('apri l\'app dal link di Monica');
  const { chiave } = await (await fetch('/api/chiave')).json();
  const reg = await navigator.serviceWorker.ready, b = Uint8Array.from(atob(chiave.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((chiave.length + 3) % 4)), c => c.charCodeAt(0));
  const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b });
  const r = await fetch('/api/cliente', { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ sub: sub.toJSON() }) });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).errore) || 'iscrizione rifiutata');
}
async function attivaAvvisiCliente() {
  UI.notProva = true; UI.notEsito = null; render();
  try {
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('permesso non dato: senza «Consenti» non arrivano');
    await iscriviCliente();
    P.avvisiCliente = true; salvaP();
    UI.notEsito = { ok: true, t: 'Fatto! Quando il tuo ordine è pronto, ti arriva un avviso qui.' };
  } catch (e) { UI.notEsito = { ok: false, t: 'Non attivato: ' + ((e && e.message) || 'errore sconosciuto') + '.' }; }
  finally { UI.notProva = false; render(); }
}
function avvisaCliente(o, tipo = 'pronto') {   // tipo: 'pronto' o 'proposta' (Monica propone un altro giorno)
  if (!sulSito() || !o.cliente) return;
  Dati.token().then(tok => tok && fetch('/api/pronto', { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ cliente: o.cliente, tipo }) })).catch(() => {});
}
async function attivaAvvisi() {
  UI.notProva = true; UI.notEsito = null; render();
  try {
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('permesso non dato: senza «Consenti» le notifiche non arrivano');
    const tok = await Dati.token(); if (!tok) throw new Error('entra prima con Google');
    const post = await iscriviTelefono(tok);
    const p = await (await post('/api/prova')).json();
    P.avvisiAttivi = true; salvaP();
    UI.notEsito = { ok: true, t: `Fatto! Da ora ogni ordine nuovo ti suona qui. È partita una notifica di prova${p.telefoni > 1 ? ` (${p.telefoni} telefoni iscritti)` : ''}: guarda in alto.` };
  } catch (e) {
    UI.notEsito = { ok: false, t: 'Non attivate: ' + ((e && e.message) || 'errore sconosciuto') + '.' };
  } finally { UI.notProva = false; render(); }
}
async function provaNotifica() {
  UI.notProva = true; UI.notEsito = null; render();
  try {
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm !== 'granted') { UI.notEsito = { ok: false, t: 'Permesso non dato: senza «Consenti» le notifiche non arrivano.' }; return; }
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification('Pronti in Tavola', { body: 'Le notifiche funzionano! Così saprai subito degli ordini.', icon: 'media/icon-192.png', badge: 'media/badge-96.png', tag: 'prova', data: { url: location.pathname } });
    UI.notEsito = { ok: true, t: 'Notifica mandata: guarda in alto sul telefono. Non c\'è? Controlla che il telefono non sia in «Non disturbare».' };
  } catch (e) {
    UI.notEsito = { ok: false, t: 'Non è partita: ' + ((e && e.message) || 'errore sconosciuto') + '.' };
  } finally { UI.notProva = false; render(); }
}
/* biglietto d'invito in foto (Mario 07/11: «un bel biglietto di invito in foto da allegare in automatico su WhatsApp»):
   si disegna qui, poi va su WhatsApp insieme al messaggio col link; dove il telefono non sa allegarlo, si mostra da salvare */
function caricaImg(src) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }
/* i tre biglietti: 'm' = per Monica (Mario 07/11: «benvenuta nella tua app»), 'g' = per chiunque gestisca (frasi per tutti), 'a' = per gli amici clienti */
/* chi cucina: l'invito agli amici parla con la sua voce (Mario 07/11: «è Monica che invita, io gestisco e basta») */
const cuoca = () => (S.impostazioni.paga || {}).intestataria || 'Monica';
const citta = () => String((S.impostazioni.ritiro || {}).citta || 'Olbia').replace(/[\d\s]+/, ' ').trim();
const BIGLIETTI = () => ({
  m: { titolo: 'Benvenuta nella tua app!', sotto: 'Pronti in Tavola è pronta per te', righe: ['Ricevi gli ordini delle amiche', 'Sistemi i tuoi piatti e i prezzi', 'Vedi cosa preparare ogni giorno'], box: ['Tocca il link nel messaggio', 'ed entra con Google: basta un minuto'] },
  g: { titolo: 'Ti aspettiamo in cucina!', sotto: 'Gestisci con noi Pronti in Tavola', righe: ['Ricevi gli ordini degli amici', 'Sistemi i piatti e i prezzi', 'Vedi cosa preparare ogni giorno'], box: ['Tocca il link nel messaggio', 'ed entra con Google: basta un minuto'] },
  a: { titolo: 'Assaggia la mia cucina!', sotto: 'Piatti fatti a mano da me, pronti da ritirare', firma: cuoca(), righe: ['Guarda il menù coi prezzi', 'Ordina con pochi tocchi', 'Ritiri a ' + citta() + ', senza pensieri'], box: ['Tocca il link nel messaggio', 'e scegli cosa ti va'] }
});
async function disegnaInvito(tipo = 'g') {
  const B = BIGLIETTI()[tipo] || BIGLIETTI().g;
  const L = 1080, A = 1350, c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = L; c.height = A;
  try { await document.fonts.ready; } catch (e) { /* senza i caratteri va bene lo stesso */ }
  const logo = await caricaImg('media/logo-medaglione.webp');
  g.fillStyle = '#FBF5EA'; g.fillRect(0, 0, L, A);
  g.strokeStyle = '#7B2318'; g.lineWidth = 8; g.strokeRect(28, 28, L - 56, A - 56);
  g.strokeStyle = '#C9A27A'; g.lineWidth = 2; g.strokeRect(48, 48, L - 96, A - 96);
  g.textAlign = 'center';
  g.fillStyle = '#9A5B3C'; g.font = '800 30px "Nunito Sans", system-ui, sans-serif';
  if ('letterSpacing' in g) g.letterSpacing = '8px';
  g.fillText('UN INVITO PER TE', L / 2, 130);
  if ('letterSpacing' in g) g.letterSpacing = '0px';
  if (logo) { const d = 360, r = Math.min(d / logo.width, d / logo.height); g.drawImage(logo, (L - logo.width * r) / 2, 165, logo.width * r, logo.height * r); }
  g.fillStyle = '#7B2318'; let ft = 82; do { g.font = `600 ${ft}px Fraunces, Georgia, serif`; ft -= 4; } while (g.measureText(B.titolo).width > L - 160 && ft > 40); g.fillText(B.titolo, L / 2, 640);
  g.fillStyle = '#2B1A12'; g.font = '600 40px "Nunito Sans", system-ui, sans-serif'; g.fillText(B.sotto, L / 2, 710);
  const righe = B.righe;
  g.font = '700 38px "Nunito Sans", system-ui, sans-serif';
  const larga = Math.max(...righe.map(t => g.measureText(t).width)), x0 = (L - larga - 70) / 2;
  righe.forEach((t, i) => {
    const y = 815 + i * 78;
    g.fillStyle = '#7B2318'; g.beginPath(); g.arc(x0 + 22, y - 13, 22, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#FBF5EA'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x0 + 11, y - 13); g.lineTo(x0 + 19, y - 4); g.lineTo(x0 + 34, y - 22); g.stroke();
    g.textAlign = 'left'; g.fillStyle = '#2B1A12'; g.fillText(t, x0 + 70, y); g.textAlign = 'center';
  });
  const bx = 120, by = 1045, bw = L - 240, bh = 150;
  g.fillStyle = '#7B2318'; g.beginPath(); (g.roundRect ? g.roundRect(bx, by, bw, bh, 30) : g.rect(bx, by, bw, bh)); g.fill();
  g.fillStyle = '#FFFFFF'; g.font = '800 44px "Nunito Sans", system-ui, sans-serif'; g.fillText(B.box[0], L / 2, by + 66);
  g.font = '600 32px "Nunito Sans", system-ui, sans-serif'; g.fillText(B.box[1], L / 2, by + 115);
  const da = B.firma || (Dati.attivo && Dati.io.nomeGestore) || '';
  g.fillStyle = '#9A5B3C'; g.font = 'italic 600 40px Fraunces, Georgia, serif';
  g.fillText(da ? 'Con affetto, ' + da : 'Pronti in Tavola · Olbia', L / 2, 1272);
  return c;
}
async function mandaInvito(tipo = 'g') {
  if (UI.invPrepara) return;
  UI.invPrepara = tipo; render();
  const testo = testoInvitoGestore(tipo);
  try {
    const c = await disegnaInvito(tipo);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
    const file = blob && new File([blob], 'invito-pronti-in-tavola.jpg', { type: 'image/jpeg' });
    if (file && navigator.canShare && navigator.canShare({ files: [file], text: testo })) {
      try { await navigator.share({ files: [file], text: testo }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }   // iPhone: troppo tempo dal tocco → sotto, il pulsante per riprovare
    }
    UI.invFile = file; UI.invTipo = tipo;
    UI.foglio = { tipo: 'invito-img', url: c.toDataURL('image/jpeg', 0.9) };
  } catch (e) {
    window.open(wa('', testo), '_blank', 'noopener');
  } finally { UI.invPrepara = false; render(); }
}
function foglioInvitoImg() {
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro"><h1>Il tuo invito</h1>
    <p class="tenue" style="margin:0">${puoiAllegare() ? 'Tocca il pulsante sotto e scegli WhatsApp: parte la foto col messaggio.' : 'Questo telefono non sa allegare la foto da solo: tienila premuta per salvarla, poi mandala su WhatsApp dopo il messaggio.'}</p>
    <img src="${UI.foglio.url}" alt="Biglietto d'invito a Pronti in Tavola" style="width:100%;border-radius:12px;border:1px solid var(--riga)"></div>
    <div class="piede">${puoiAllegare() ? `<button type="button" class="btn pieno" data-a="inv-condividi">${ico('chat')}Manda foto e messaggio</button>`
      : `<a class="btn pieno" href="${wa('', testoInvitoGestore(UI.invTipo))}" target="_blank" rel="noopener">${ico('chat')}Manda il messaggio col link</a>`}</div>`;
}
const puoiAllegare = () => !!(UI.invFile && navigator.canShare && navigator.canShare({ files: [UI.invFile], text: testoInvitoGestore(UI.invTipo) }));
const bottoneBiglietto = (tipo, testo, cls) => `<button type="button" class="btn ${cls}" data-a="inv-manda" data-v="${tipo}"${UI.invPrepara ? ' disabled' : ''}>${ico('invito')}${UI.invPrepara === tipo ? 'Preparo il biglietto…' : testo}</button>`;
/* richieste di chi vuole gestire: in cima alla Home e nelle Impostazioni */
function richiesteGestore() {
  const rr = (Dati.attivo && Dati.io.richiesteGestore) || [];
  return rr.map(r => `<div class="avviso">${ico('clienti')}<div><b>${esc(r.nome)}</b> chiede di gestire la cucina con te.<br><span class="tenue piccolo">${esc(r.email)}</span>
    <div class="fila" style="margin-top:10px"><button type="button" class="btn verde piccolo" data-a="gest-si" data-id="${esc(r.uid)}"${UI.gestDecido ? ' disabled' : ''}>${ico('spunta')}Sì, è lei</button>
    <button type="button" class="btn chiaro piccolo" data-a="gest-no" data-id="${esc(r.uid)}"${UI.gestDecido ? ' disabled' : ''}>No</button></div></div></div>`).join('');
}
function chiGestisce() {
  const gg = (Dati.attivo && Dati.io.gestoriLista) || [];
  return `<section class="scheda"><h2>Chi gestisce la cucina</h2>
    ${gg.map(g => `<div class="fila" style="justify-content:space-between;border-bottom:1px dashed var(--riga);padding:8px 0"><b>${esc(g.nome || 'Senza nome')}${g.uid === Dati.io.uid ? ' (tu)' : ''}</b>
      ${g.uid === Dati.io.uid ? '' : `<button type="button" class="btn chiaro piccolo" data-a="gest-togli" data-id="${esc(g.uid)}">${UI.gestTogli === g.uid ? 'Tocca ancora per togliere' : 'Togli'}</button>`}</div>`).join('')}
    ${richiesteGestore()}
    <p class="tenue" style="margin:0">Manda l'invito a chi deve gestire con te: entra col suo Google e tu dici sì da qui.</p>
    ${bottoneBiglietto('m', 'Invita Monica', 'pieno')}${bottoneBiglietto('g', 'Invita un\'altra persona', 'chiaro pieno')}</section>`;
}
function vBenvenuto() {
  const b = UI.benv || {};
  let h = `<main class="corpo benvenuto"><img class="benv-logo" src="media/logo-medaglione.webp" alt="Pronti in Tavola con Monica">
    <h1>Benvenuti da Monica!</h1><p class="tenue">Monica cucina per te a Olbia. Prima di entrare, dicci come ti chiami: così Monica sa chi ordina. Te lo chiediamo una volta sola.</p>`;
  if (b.chiuso) return h + `<div class="avviso"><div><b>Monica in questo momento non prende clienti nuovi.</b><br>Puoi guardare il menù; per ordinare riprova più avanti.</div></div>
    <button type="button" class="btn chiaro pieno" data-a="benv-guarda">Guarda il menù</button></main>`;
  h += `<section class="scheda"><label class="etichetta" for="benv-nome" style="font-weight:800">Il tuo nome</label>
    <input type="text" id="benv-nome" autocomplete="given-name" autocapitalize="words" maxlength="30" placeholder="es. Laura" value="${esc(b.nome || '')}">
    <label class="etichetta" for="benv-cognome" style="font-weight:800">Il tuo cognome</label>
    <input type="text" id="benv-cognome" autocomplete="family-name" autocapitalize="words" maxlength="30" placeholder="es. Sanna" value="${esc(b.cognome || '')}" enterkeyhint="go"></section>`;
  if (b.usato) h += `<div class="avviso"><div><b>«${esc(b.usato)}» c'è già.</b> Sei tu con un telefono nuovo?
    <div class="fila" style="margin-top:10px"><button type="button" class="btn" data-a="benv-ricollega">Sì, sono io</button><button type="button" class="btn chiaro" data-a="benv-altro">No, è un'altra persona</button></div>
    <small>Se è un'altra persona con lo stesso nome, aggiungi qualcosa (es. «Laura Sanna B.»).</small></div></div>`;
  else h += `<button type="button" class="btn pieno" data-a="benv-entra"${UI.benvInvio ? ' disabled' : ''}>${UI.benvInvio ? 'Un attimo…' : 'Entra'}</button>`;
  return h + '</main>';
}
async function benvEntra(ricollega) {
  const prendi = id => { const i = document.getElementById(id); return i ? i.value.replace(/\s+/g, ' ').trim() : ''; };
  const b = UI.benv = Object.assign({}, UI.benv, ricollega ? {} : { nome: prendi('benv-nome'), cognome: prendi('benv-cognome') });
  if (b.nome.length < 2) { mostraToast('Scrivi il tuo nome.'); const i = $('#benv-nome'); if (i) i.focus(); return; }
  if (b.cognome.length < 2) { mostraToast('Scrivi anche il cognome.'); const i = $('#benv-cognome'); if (i) i.focus(); return; }
  const tutto = ricollega ? b.usato : [b.nome, b.cognome].map(x => x.split(' ').map(maiuscola).join(' ')).join(' ');
  if (Dati.attivo) {
    UI.benvInvio = true; render();
    try { await Dati.registra(tutto, P.tramite || '', !!ricollega); avvisaGestori('richiesta'); }
    catch (e) {
      UI.benvInvio = false;
      if (e.code === 'permission-denied' && !ricollega) { UI.benv.usato = tutto; render(); return; }
      if (e.code === 'chiuso') { UI.benv.chiuso = true; render(); return; }
      render(); mostraToast(e.code === 'unavailable' ? 'Manca la rete: riprova appena torna.' : 'Non è andata. Riprova tra poco.'); return;
    }
    UI.benvInvio = false;
  } else { P.benvenuto = true; P.nomeProva = tutto; salvaP(); }
  UI.benv = null; vai('menu');
  mostraToast(`Ciao ${nomeBreve(tutto)}! Ecco il menù di Monica.`);
}

function testataCliente() {
  const n = quanti(P.carrello);
  return `<header class="testata"><img class="marchio" src="${LOGO}" alt="">
    <div class="titolo"><b>Pronti in Tavola</b><span>${(n => n && n !== 'Cliente' ? `Ciao ${esc(n)}!` : 'Benvenuti da Monica!')(nomeBreve(nomeCliente() || ''))}</span></div>
    <button type="button" class="icona aa" data-a="testo-grande" aria-pressed="${!!P.grande}" aria-label="Testo più grande">Aa</button>
    <button type="button" class="icona" data-a="vai" data-v="carrello" aria-label="Il tuo ordine: ${n} piatti">${ico('carrello')}${n ? `<span class="pallino">${n}</span>` : ''}</button></header>`;
}
function testataSemplice(titolo, indietro, etichetta = 'Indietro') {
  return `<header class="testata"><button type="button" class="indietro" data-a="vai" data-v="${indietro}">${ico('indietro')}${etichetta}</button>
    <div class="titolo"><b>${esc(titolo)}</b></div></header>`;
}

/* foto del menù (Mario 07/11: «cambiare la foto del menù… caricare 3 foto»): Monica le mette in «I miei piatti», i clienti le vedono in cima al menù */
const versioneFotoApp = f => { let h = 0; for (let i = 0; i < f.length; i++) h = (h * 31 + f.charCodeAt(i)) | 0; return f.length.toString(36) + '-' + (h >>> 0).toString(36); };
const fotoMenu = () => (S.menuFoto || []).filter(Boolean);
function schedaFotoMenu() {
  const ff = (S.menuFoto || []).slice(0, 3);
  return `<section class="scheda"><h2>Foto del menù</h2><p class="tenue" style="margin:0">Fino a 3 foto. Per ora le vedi solo tu: le mandi tu su WhatsApp con il pulsante qui sotto.</p>
    <div class="menu-foto-edit">${ff.map((f, i) => `<div class="mf">${f ? `<img src="${f}" alt="Foto ${i + 1} del menù">` : '<span class="tenue piccolo">In arrivo…</span>'}
      <label class="btn chiaro piccolo" for="file-menu-${i}">Cambia</label><input type="file" id="file-menu-${i}" accept="image/*" class="nascosto file-menu" data-i="${i}">
      <button type="button" class="link" data-a="menu-foto-togli" data-i="${i}">Togli</button></div>`).join('')}</div>
    ${fotoMenu().length ? `<button type="button" class="btn pieno" data-a="menu-foto-manda">${ico('chat')}Manda le foto su WhatsApp</button>` : ''}
    ${ff.length < 3 ? `<label class="btn chiaro pieno" for="file-menu-${ff.length}">${ico('foto')}Aggiungi una foto del menù</label><input type="file" id="file-menu-${ff.length}" accept="image/*" class="nascosto file-menu" data-i="${ff.length}">` : ''}</section>`;
}
function carosello() {
  const ff = fotoMenu();
  if (!ff.length) return '';
  return `<div class="carosello" aria-label="Foto del menù">${ff.map((f, i) => `<img src="${f}" alt="Foto ${i + 1} del menù" loading="${i ? 'lazy' : 'eager'}">`).join('')}</div>${ff.length > 1 ? '<p class="tenue piccolo" style="margin:-4px 0 0;text-align:center">Scorri le foto →</p>' : ''}`;
}
/* in cima al menù del cliente (Mario 07/11, C32 C33): installa l'app e attiva le notifiche, subito, un tocco ciascuno;
   e chi aspetta l'ok di Monica lo legge chiaro. Le notifiche le chiede il telefono solo dopo un tocco: da sole non si può. */
/* Samsung Internet scurisce da solo i siti (PT E19): niente più riquadro «Apri in Chrome» (Mario 07/11 C36):
   si spinge forte a installare l'app e attivare le notifiche; il bottone usa l'installazione del telefono se c'è. */
const suSamsung = /SamsungBrowser/i.test(navigator.userAgent) && !/Android.*wv/.test(navigator.userAgent);
/* Mario 07/11: il cliente non ancora accettato lo legge chiaro, sempre (anche dopo «Più tardi»), nel menù, dopo l'invio e nei suoi ordini */
const inAttesa = () => { const u = Dati.attivo ? Dati.io.utente : null; return !!(u && ['nuovo', 'ricollega'].includes(u.stato)); };
const avvisoAttesa = () => inAttesa() ? `<div class="avviso attesa-forte">${ico('orologio')}<div><b>Attendi che Monica accetti la tua richiesta.</b><br>Monica ti conosce e ti dice di sì dall'app: di solito in giornata. Il tuo primo ordine lo vede lei e te lo conferma.</div></div>` : '';
function primiPassi() {
  if (UI.modifica) return '';
  if (UI.passiVia) return avvisoAttesa();
  const attesa = inAttesa();
  const notifOk = sulSito() && P.cliente && 'Notification' in window && Notification.permission !== 'denied';
  const notif = notifOk && !P.avvisiCliente, app = !suHome();
  if (!attesa && !notif && !app) return '';
  let h = '<section class="scheda primi-passi">';
  if (attesa) h += avvisoAttesa();
  if (app || notif) {
    const passo = (n, fatto, tit, perche, btn) => `<div class="passo-forte${fatto ? ' fatto' : ''}"><span class="num">${fatto ? '✓' : n}</span><div><b>${tit}</b><span class="tenue piccolo">${perche}</span>${fatto ? '' : btn}</div></div>`;
    const due = notifOk || P.avvisiCliente;
    h += `<h2 class="pp-titolo">${due ? 'Due tocchi' : 'Un tocco'} e sei a posto</h2>`
      + passo(1, !app, "Metti l'app sul telefono", 'La ritrovi tra le app, come WhatsApp: niente più link da cercare.',
        `<button type="button" class="btn pieno grande" data-a="${installa ? 'installa' : 'passi-app'}">${ico('scarica')}Installa l'app</button>`)
      + (due ? passo(2, !notif, 'Attiva le notifiche', 'Monica ti avvisa quando il tuo ordine è pronto o se ti propone un altro giorno.',
        `<button type="button" class="btn ${app ? 'chiaro' : 'pieno'} grande" data-a="avvisi-cliente"${UI.notProva ? ' disabled' : ''}>${ico('invito')}${UI.notProva ? 'Un attimo…' : 'Attiva le notifiche'}</button>`) : '')
      + `${UI.notEsito && notif ? `<p class="tenue piccolo" style="margin:0">${esc(UI.notEsito.t)}</p>` : ''}
    ${UI.passiApp ? cartaHome() : ''}<button type="button" class="link piccolo" data-a="passi-via">Più tardi</button>`;
  }
  return h + '</section>';
}
function vMenu() {
  const imp = S.impostazioni, cats = CATEGORIE.filter(([k]) => visibili().some(p => p.cat === k && p.disponibile));
  /* foto del menù ai clienti: in attesa (Mario 07/11 «non sono molto convinto, aspettiamo»): per ora Monica le manda e basta */
  let h = testataCliente() + '<main class="corpo">' + primiPassi() + barraAIC() + (UI.modifica || !imp.menuFotoClienti ? '' : carosello());
  if (UI.modifica) {
    const o = S.ordini.find(x => x.id === UI.modifica.ordine);
    h += `<div class="avviso">${ico('matita')}<div><b>Stai cambiando l'ordine n. ${o.n}.</b><br>Tocca i piatti da aggiungere, poi «Rivedi la modifica».
      <div class="fila" style="margin-top:10px"><button type="button" class="btn piccolo" data-a="vai" data-v="modifica">Rivedi la modifica</button></div></div></div>`;
  }
  if (pausaOra()) h += `<div class="avviso">${ico('pausa')}<div><b>Monica è in pausa fino a ${giornoLungo(imp.pausa.fino)}.</b><br>Puoi già ordinare per i giorni dopo.</div></div>`;

  if (imp.natale.attivo && oggi() <= imp.natale.entro) {
    const np = imp.natale.piatti.map(piatto).filter(p => p && !p.cestino && p.disponibile);
    if (np.length) h += `<section class="natale"><div class="stelle"></div><div><h2>Menù di Natale</h2>
      <p class="piccolo">Ordini entro ${giornoLungo(imp.natale.entro)}. Prenota presto: i posti in cucina finiscono.</p></div>
      <div>${np.map(voce).join('')}</div></section>`;
  }
  const pronti = UI.modifica ? [] : prontiOggi();
  if (pronti.length) {
    h += `<section class="pronti" aria-labelledby="t-pronti"><div><h2 id="t-pronti"><span class="fiammella">${ico('fiamma')}</span>Pronti subito</h2>
      <p class="tenue piccolo">Non serve prenotare: li ritiri oggi entro le ${esc(imp.prontiFino)}.</p></div>
      <div class="pronti-lista">${pronti.map(p => {
        const f = p.formati.find(x => x.id === p.pronto.formato) || p.formati[0];
        return `<button type="button" class="pronto-carta" data-a="piatto" data-id="${p.id}" data-pronto="1">${foto(p)}
          <b>${esc(p.nome)}</b><span class="qta">${qtaTesto(f.tipo, p.pronto.qta, f.nome)} ${f.tipo === 'kg' || f.tipo === 'pz' ? (p.pronto.qta === 1 && f.tipo === 'pz' ? 'pronto' : 'pronti') : p.pronto.qta === 1 ? 'pronta' : 'pronte'}</span>
          <span class="piccolo num">${euro(prezzoDi(p, f.id))}${f.tipo === 'kg' ? ' al kg' : ''}</span></button>`;
      }).join('')}</div></section>`;
  }
  h += P.allergie.length
    ? `<button type="button" class="allergie-box" data-a="apri-allergie">${ico('cuore')}<span><b>Le tue allergie:</b> ${esc(P.allergie.map(a => NOME_ALL[a].toLowerCase()).join(', '))}<br><u>Cambia</u></span></button>`
    : `<button type="button" class="allergie-box" data-a="apri-allergie">${ico('cuore')}<span><b>Hai allergie?</b><br><small>Toccale qui: i piatti a rischio diventano rossi.</small></span></button>`;
  h += `<nav class="schede-cat" aria-label="Parti del menù">${cats.map(([k, n]) => `<button type="button" class="chip" data-a="cat" data-v="${k}" aria-pressed="${UI.cat === k}">${n}</button>`).join('')}
</nav>`;
  if (!cats.length && !pronti.length) h += Dati.attivo && !Dati.io.pronto
    ? `<p class="tenue" style="text-align:center;margin:24px 0">Carico il menù…</p>`
    : `<div class="avviso">${ico('cuore')}<div><b>Monica sta preparando il menù.</b><br>Torna a trovarci presto!</div></div>`;
  cats.forEach(([k, n], i) => {
    if (i) h += filo();
    h += `<section class="sezione" aria-labelledby="cat-${k}"><div class="cat-titolo" id="cat-${k}"><h2>${n}</h2><span></span></div>
      <div class="voci">${visibili().filter(p => p.cat === k && p.disponibile).map(voce).join('')}</div></section>`;
  });
  return h + tastoMonica() + '</main>';
}

function apriPiatto(id, pronto, anteprima) {
  const p = piatto(id);
  const fId = pronto && p.pronto ? p.pronto.formato : p.formati[0].id;
  const f = p.formati.find(x => x.id === fId) || p.formati[0];
  UI.sel = { formato: f.id, variante: p.varianti[0] ? p.varianti[0].id : '', qta: f.tipo === 'kg' || f.tipo === 'pz' ? passoDi(f).min : 1, note: [], testo: '' };
  if (pronto && p.pronto) UI.sel.qta = Math.min(UI.sel.qta, p.pronto.qta);
  UI.foglio = { tipo: 'piatto', id, pronto: !!pronto, anteprima: !!anteprima };
  render();
}

function foglioPiatto() {
  const { id, pronto, anteprima } = UI.foglio, p = piatto(id), s = UI.sel;
  const f = p.formati.find(x => x.id === s.formato) || p.formati[0];
  const prezzo = prezzoDi(p, f.id, s.variante), ing = ingDi(p, s.variante), all = allergeniDi(ing), mie = new Set(P.allergie);
  const etiQta = { teglia: 'Quante teglie?', kg: 'Quanti chili?', pz: 'Quanti pezzi?', intera: 'Quante?' }[f.tipo];
  const testoWa = `Guarda cosa cucina Monica: ${p.nome}. Puoi ordinare anche tu da qui: ${SITO}${!Dati.attivo ? '' : P.ruolo === 'monica' ? '#da=monica' : P.cliente ? '#da=' + P.cliente : ''}`;
  let h = `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div>
    ${foto(p, 'grande')}<div class="dentro">
    <div class="sezione"><h1>${esc(p.nome)}</h1>${p.sotto ? `<p class="tenue" style="margin:0">${esc(p.sotto)}</p>` : ''}${etichette(p, false)}</div>`;
  if (anteprima) h += `<div class="avviso">${ico('occhio')}<div>Così lo vede il cliente.</div></div>`;
  if (pronto) {
    const max = p.pronto.qta;
    h += `<div class="avviso verde">${ico('fiamma')}<div><b>Pronto oggi.</b> Ne restano ${f.tipo === 'kg' ? NUM.format(max) + ' kg' : max}. Lo ritiri entro le ${esc(S.impostazioni.prontiFino)}.</div></div>`;
  }
  if (p.varianti.length) {
    h += `<div class="gruppo"><span class="etichetta">Scegli il gusto</span><div class="scelte">${p.varianti.map(v =>
      `<button type="button" class="scelta" data-a="sel-var" data-v="${v.id}" aria-pressed="${s.variante === v.id}">${esc(v.nome)}<small>${euro(prezzoDi(p, f.id, v.id))}${f.tipo === 'kg' ? ' al kg' : ''}</small></button>`).join('')}</div></div>`;
  }
  if (p.formati.length > 1 && !pronto) {
    h += `<div class="gruppo"><span class="etichetta">Formato</span><div class="scelte">${p.formati.map(x =>
      `<button type="button" class="scelta" data-a="sel-formato" data-v="${x.id}" aria-pressed="${s.formato === x.id}">${esc(x.nome)}<small>${x.porzioni ? x.porzioni + ' porzioni · ' : ''}${euro(prezzoDi(p, x.id, s.variante))}</small></button>`).join('')}</div></div>`;
  }
  h += `<div class="gruppo"><span class="etichetta">${etiQta}</span>
    <div class="fila">${passo('sel-qta', f.tipo === 'kg' ? NUM.format(s.qta) + ' kg' : s.qta)}<span class="tenue num">${euro(prezzo)}${f.tipo === 'kg' ? ' al kg' : f.tipo === 'pz' ? ' l\'uno' : ''}</span></div>
    ${p.aiuto ? `<span class="tenue piccolo">${esc(p.aiuto)}</span>` : ''}</div>`;
  h += `<div class="gruppo"><span class="etichetta">Ingredienti</span><p class="ingr">${esc(ing.map(i => ING(i).n).join(', ')) || 'Monica li sta scrivendo.'}</p></div>`;
  h += `<div class="gruppo"><span class="etichetta">Allergeni</span>${all.length ? `<div class="allergeni">${all.map(a => `<span class="${mie.has(a) ? 'mio' : ''}">${NOME_ALL[a]}</span>`).join('')}</div>` : '<span class="tenue">Nessuno dei 14 allergeni di legge.</span>'}
    <span class="tenue piccolo">Calcolati dagli ingredienti. La cucina è di casa: per allergie gravi chiedi a Monica.</span></div>`;
  const fr = p.fritto > 0, fo = p.forno > 0;
  if ((fr || fo) && !anteprima) h += `<div class="gruppo fritto-scelta"><span class="etichetta">Lo cuoci tu o lo cuoce Monica?</span>
    <div class="scelte"><button type="button" class="scelta" data-a="sel-fritto" data-v="no" aria-pressed="${!s.fritto && !s.forno}">Lo cuocio io<small>prezzo del menù</small></button>${fr ? `<button type="button" class="scelta" data-a="sel-fritto" data-v="si" aria-pressed="${!!s.fritto}">Fritto da Monica<small>+ ${euro(p.fritto)} in tutto</small></button>` : ''}${fo ? `<button type="button" class="scelta" data-a="sel-fritto" data-v="forno" aria-pressed="${!!s.forno}">Al forno da Monica<small>+ ${euro(p.forno)} in tutto</small></button>` : ''}</div>
    <span class="tenue piccolo">Il prezzo del menù è da cuocere a casa. Se lo vuoi già cotto, pronto da gustare, lo cucina Monica.</span></div>`;
  else if (fr || fo) h += `<div class="avviso">${ico('fiamma')}<div>Prezzo da cuocere a casa.${fr ? ` <b>Fritto da Monica: + ${euro(p.fritto)}</b> in tutto.` : ''}${fo ? ` <b>Al forno da Monica: + ${euro(p.forno)}</b> in tutto.` : ''}</div></div>`;
  if (p.scalda) h += `<div class="avviso">${ico('orologio')}<div><b>Come si prepara a casa</b><br>${esc(p.scalda)}</div></div>`;
  if (!anteprima) {
    if (p.note.length) h += `<div class="gruppo"><span class="etichetta">Vuoi qualcosa di diverso?</span><div class="scelte">${p.note.map(n =>
      `<button type="button" class="chip" data-a="sel-nota" data-v="${esc(n)}" aria-pressed="${s.note.includes(n)}">${esc(n)}</button>`).join('')}</div></div>`;
    h += `<a class="link" href="${wa('', testoWa)}" target="_blank" rel="noopener">Manda questo piatto a un'amica</a>`;
  }
  h += '</div>';
  if (!anteprima) h += `<div class="piede"><button type="button" class="btn pieno" data-a="aggiungi">${UI.modifica ? 'Aggiungi alla modifica' : pronto ? 'Lo prendo oggi' : 'Aggiungi'} · ${euro(prezzoRiga({ prezzo, qta: s.qta, tipo: f.tipo, fritto: s.fritto && p.fritto > 0, frittoPrezzo: p.fritto, forno: s.forno && p.forno > 0, fornoPrezzo: p.forno }))}</button></div>`;
  return h;
}

/* chi non è ancora stato accettato da Monica dice se ordina davvero o prova l'app (Mario 07/11) */
/* scelta obbligatoria (Mario 07/11): senza, «Invia» non parte */
const sceltaManca = () => puoProvare() && UI.prova === undefined;
const puoProvare = () => !UI.modifica && (!Dati.attivo || (Dati.io.utente && Dati.io.utente.stato !== 'approvato'));
function sceltaProva() {
  if (!puoProvare()) return '';
  return `<section class="scheda"><h2>Ordini davvero o provi l'app?</h2><div class="scelte">
    <button type="button" class="scelta" data-a="ordine-prova" data-v="" aria-pressed="${UI.prova === false}">Ordino davvero</button>
    <button type="button" class="scelta" data-a="ordine-prova" data-v="1" aria-pressed="${UI.prova === true}">Sto solo provando l'app</button></div>
    <span class="tenue piccolo">${UI.prova === undefined ? 'Scegli una delle due: serve per inviare.' : UI.prova ? 'Monica lo vede con la scritta PROVA e non lo cucina.' : 'Monica lo prepara per te.'}</span></section>`;
}
function vCarrello() {
  const c = P.carrello;
  let h = testataSemplice('Il tuo ordine', 'menu', 'Menù') + '<main class="corpo">';
  if (!c.length) return h + `<div class="scheda" style="align-items:center;text-align:center"><h2>Il carrello è vuoto</h2><p class="tenue" style="margin:0">Scegli dal menù quello che ti va.</p><button type="button" class="btn" data-a="vai" data-v="menu">Guarda il menù</button></div></main>`;
  const pronti = c.map((r, i) => [r, i]).filter(([r]) => r.pronto), dopo = c.map((r, i) => [r, i]).filter(([r]) => !r.pronto);
  const imp = S.impostazioni, metodi = Object.keys(METODO).filter(m => imp.paga[m]);
  if (!metodi.includes(UI.metodo)) UI.metodo = metodi[0] || 'contanti';
  const riga = ([r, i]) => `<div class="riga-ord"><b>${esc(r.nome)}</b><span class="prezzo">${euro(prezzoRiga(r))}</span>
    <span class="det">${esc(descRiga(r))}</span>
    ${r.note.length || r.testo ? `<span class="nota">${esc([...r.note, r.testo].filter(Boolean).join(' · '))}</span>` : ''}
    <div class="azioni">${passo('c-qta', r.tipo === 'kg' ? NUM.format(r.qta) + ' kg' : r.qta, `data-i="${i}"`)}<button type="button" class="link" data-a="c-togli" data-i="${i}">Togli</button></div></div>`;
  if (pronti.length && dopo.length) h += `<div class="avviso">${ico('orologio')}<div>Sono <b>due ritiri</b>: oggi i piatti già pronti, il resto nel giorno che scegli.</div></div>`;
  if (pronti.length) h += `<section class="scheda"><header class="fila"><h2 style="flex:1">Pronti, da ritirare oggi</h2></header>${pronti.map(riga).join('')}<span class="tenue piccolo">Ritiro oggi entro le ${esc(imp.prontiFino)}.</span></section>`;
  if (dopo.length) {
    const teglie = dopo.reduce((s, [r]) => s + (r.tipo === 'teglia' || r.tipo === 'intera' ? r.qta : 0), 0);
    const giorni = giorniPossibili(teglie);
    if (UI.entro && giorni.find(g => g.g === UI.entro && g.no)) UI.entro = null;
    h += `<section class="scheda"><h2>${pronti.length ? 'Da preparare' : 'I tuoi piatti'}</h2>${dopo.map(riga).join('')}
      <div class="gruppo"><span class="etichetta">Ti serve entro…</span>
      <div class="giorni">${giorni.map(({ g, no }) => { const d = daIso(g); return `<button type="button" class="giorno" data-a="entro" data-v="${g}" aria-pressed="${UI.entro === g}" ${no ? 'disabled' : ''} aria-label="${giornoLungo(g)}${no ? ', non disponibile' : ''}"><small>${no || F_GS.format(d)}</small><b>${d.getDate()}</b><small>${F_MESE.format(d)}</small></button>`; }).join('')}</div>
      <span class="tenue piccolo">Monica lo prepara entro quel giorno e te lo conferma. Se non ce la fa, ti propone un altro giorno.</span></div></section>`;
  }
  h += metodi.length === 1 && metodi[0] === 'contanti' ? `<p class="paga-riga">${ico('spunta')}Paghi in contanti quando ritiri.</p>` : `<section class="scheda"><h2>Come paghi</h2><div class="scelte">${metodi.map(m => `<button type="button" class="scelta" data-a="metodo" data-v="${m}" aria-pressed="${UI.metodo === m}">${METODO[m]}</button>`).join('')}</div>
    <span class="tenue piccolo">${UI.metodo === 'contanti' ? 'Paghi quando ritiri.' : 'Paghi dopo che Monica ha confermato: nell\'ordine trovi i dati da copiare.'}</span></section>`;
  h += `    <div class="gruppo"><label for="nota-ordine">Vuoi dire qualcosa a Monica?</label><textarea id="nota-ordine" data-campo="nota" placeholder="es. polpette senza prezzemolo, passo dopo le 18">${esc(UI.nota)}</textarea></div>
    <div class="totale"><span>Totale</span><span>${euro(totale(c))}</span></div>
    ${sceltaProva()}<button type="button" class="btn pieno" data-a="invia" ${(dopo.length && !UI.entro) || UI.invio || sceltaManca() ? 'disabled' : ''}>${ico('invito')}${UI.invio ? 'Invio in corso…' : 'Invia l\'ordine a Monica'}</button>
    ${dopo.length && !UI.entro ? '<span class="tenue piccolo" style="text-align:center">Scegli prima il giorno.</span>' : sceltaManca() ? '<span class="tenue piccolo" style="text-align:center">Scegli prima: ordini davvero o provi l\'app?</span>' : ''}`;
  return h + '</main>';
}

function vInviato() {
  return `${testataCliente()}<main class="corpo"><div class="inviato"><div class="scoppio">${Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36}deg"></i>`).join('')}<div class="spunta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div></div>
    <h1>Ordine inviato!</h1>${avvisoAttesa()}<p class="tenue" style="margin:0">${Dati.attivo && Dati.io.utente && Dati.io.utente.stato !== 'approvato'
      ? 'È il tuo primo ordine: Monica lo guarda e ti conferma lei.' : 'Monica lo vede appena apre l\'app e ti conferma lei il giorno.'}<br>Lo segui in «I miei ordini».</p>
    <div class="fila larga" style="width:100%"><button type="button" class="btn" data-a="vai" data-v="ordini">I miei ordini</button><button type="button" class="btn chiaro" data-a="vai" data-v="menu">Torna al menù</button></div></div></main>`;
}

function tappe(o) {
  const n = { daApprovare: 1, nuovo: 1, proposta: 1, accettato: 2, pronto: 3, ritirato: 4 }[o.stato];
  return `<div class="tappe" aria-label="Stato: ${STATO_CLIENTE[o.stato]}">${['Inviato', 'Confermato', 'Pronto', 'Ritirato'].map((t, i) =>
    `<div class="tappa ${i < n ? 'fatta' : i === n ? 'ora' : ''}"><i>${i < n ? ico('spunta') : ''}</i>${t}</div>`).join('')}</div>`;
}
function boxPaga(o) {
  const imp = S.impostazioni.paga, c = cliente(o.cliente);
  if (o.paga.ricevuto) return `<div class="avviso verde">${ico('spunta')}<div>Pagamento ricevuto. Grazie!</div></div>`;
  if (o.paga.metodo === 'contanti') return `<p class="tenue" style="margin:0">Paghi in contanti al ritiro: ${euro(totale(o.righe))}.</p>`;
  if (!['accettato', 'pronto', 'ritirato'].includes(o.stato)) return `<p class="tenue" style="margin:0">Paghi con ${METODO[o.paga.metodo].toLowerCase()} dopo la conferma di Monica.</p>`;
  const riga = (et, val, esempio) => `<div class="copia"><small>${et}${esempio ? ' · esempio, Monica lo inserisce' : ''}</small><code>${esc(val)}</code><button type="button" class="btn chiaro piccolo" data-a="copia" data-t="${esc(val)}">Copia</button></div>`;
  let h = `<div class="scheda" style="box-shadow:none"><h3>Come pagare: ${METODO[o.paga.metodo].toLowerCase()}</h3>`;
  h += riga('Importo', NUM.format(totale(o.righe)).replace(/(,\d)$/, '$10'));
  if (o.paga.metodo === 'bonifico') {
    h += riga('IBAN', imp.iban || 'IT00 X000 0000 0000 0000 0000 000', !imp.iban) + riga('Intestato a', imp.intestataria) + riga('Causale', `Ordine ${o.n} - ${c.nome}`);
    h += '<span class="tenue piccolo">Apri l\'app della tua banca, scegli «bonifico istantaneo» e incolla i dati.</span>';
  } else {
    h += riga('Numero di Monica', imp.telefonoPostepay || '333 000 0000', !imp.telefonoPostepay);
    h += '<span class="tenue piccolo">Apri l\'app Postepay, tocca «P2P» e scegli Monica.</span>';
  }
  h += o.paga.dice ? `<div class="avviso verde">${ico('spunta')}<div>Hai detto che hai pagato. Monica controlla e conferma.</div></div>` : `<button type="button" class="btn verde pieno" data-a="ho-pagato" data-id="${o.id}">Ho pagato</button>`;
  return h + '</div>';
}
function cartaOrdineCliente(o) {
  const chiuso = ['rifiutato', 'annullato'].includes(o.stato);
  let h = `<article class="scheda ordine-carta"><header><div><h3>${bollinoProva(o)}Ordine n. ${o.n}</h3></div>
    <span class="stato ${o.stato}">${STATO_CLIENTE[o.stato]}</span></header>${dateOrdine(o, true)}`;
  if (!chiuso) h += tappe(o);
  if (o.stato === 'proposta') h += `<div class="fumetto"><b>Monica propone ${giornoLungo(o.proposta)}. Ti va bene?</b>
    <div class="fila larga"><button type="button" class="btn verde" data-a="proposta-si" data-id="${o.id}">Va bene</button><button type="button" class="btn chiaro" data-a="proposta-altro" data-id="${o.id}">Un altro giorno</button></div></div>`;
  if (o.stato === 'pronto') h += `<div class="avviso verde">${ico('fiamma')}<div><b>È pronto!</b> Passa a ritirarlo. ${esc(S.impostazioni.ritiro.nota)}</div></div>`;
  if (o.modifica) h += `<div class="avviso">${ico('orologio')}<div>Hai chiesto una modifica. Aspetta la risposta di Monica.</div></div>`;
  if (o.esitoModifica) h += `<div class="avviso ${o.esitoModifica === 'si' ? 'verde' : 'rosso'}">${ico(o.esitoModifica === 'si' ? 'spunta' : 'x')}<div>${o.esitoModifica === 'si' ? 'Monica ha accettato la modifica.' : 'Monica non è riuscita ad accettare la modifica: resta l\'ordine di prima.'}</div></div>`;
  if (o.stato === 'rifiutato') h += `<div class="avviso rosso">${ico('x')}<div>Questa volta Monica non ce la fa. Prova con un altro giorno.</div></div>`;
  h += `<div>${o.righe.map(r => {
    if (o.stato !== 'ritirato') return rigaOrdine(r);
    const piace = !!(o.cuori || {})[r.piatto];
    return rigaOrdine(r) + `<button type="button" class="chip" data-a="cuore" data-id="${o.id}" data-p="${r.piatto}" aria-pressed="${piace}" style="margin:-4px 0 8px">${ico('cuore')}${piace ? 'Ti è piaciuto' : 'Mi è piaciuto'}</button>`;
  }).join('')}</div>
    <div class="totale"><span>Totale</span><span>${euro(totale(o.righe))}</span></div>`;
  if (!chiuso) h += boxPaga(o);
  const az = [];
  if (['nuovo', 'accettato'].includes(o.stato) && !o.pronto && !o.modifica) az.push(`<button type="button" class="btn chiaro" data-a="modifica" data-id="${o.id}">${ico('matita')}Cambia l'ordine</button>`);
  if (o.stato === 'pronto') az.push(`<a class="btn" href="${mapsLink()}" target="_blank" rel="noopener">${ico('ritiro')}Come arrivare</a>`);
  if (o.stato === 'pronto' || (o.stato === 'accettato' && o.entro === oggi())) h += sonoQui(o);
  if (o.stato === 'ritirato' || chiuso) az.push(`<button type="button" class="btn chiaro" data-a="riordina" data-id="${o.id}">Ordina di nuovo</button>`);
  if (az.length) h += `<div class="fila larga">${az.join('')}</div>`;
  if (S.impostazioni.whatsapp && !chiuso) h += `<a class="link wa-ordine" href="${waMonica(o)}" target="_blank" rel="noopener">${ico('chat')}Domande su quest'ordine? Scrivi a Monica</a>`;
  if (o.stato === 'nuovo' && !o.modifica) h += `<button type="button" class="link" data-a="annulla-ordine" data-id="${o.id}">Annulla l'ordine</button>`;
  return h + '</article>';
}
/* I miei ordini (Mario 07/11 «stesso ordine anche per i clienti»): in corso sopra, per data di ritiro; passati sotto, per mese, in righe corte */
function vOrdiniCliente() {
  const miei = S.ordini.filter(o => o.cliente === P.cliente && o.stato !== 'prova');   // le prove di Monica il cliente non le vede (C35)
  const inCorso = miei.filter(o => !FINITI.includes(o.stato)).sort((a, b) => a.entro.localeCompare(b.entro) || a.n - b.n);
  const passati = miei.filter(o => FINITI.includes(o.stato)).sort((a, b) => b.entro.localeCompare(a.entro) || b.n - a.n);
  let h = testataCliente() + '<main class="corpo"><h1>I miei ordini</h1>' + avvisoAttesa();
  if (!miei.length) h += '<p class="tenue">Non hai ancora ordinato.</p>';
  if (inCorso.length) h += `<h2 class="ord-titolo">In corso (${inCorso.length})</h2>` + inCorso.map(cartaOrdineCliente).join('');
  /* l'indirizzo sta subito dopo gli ordini in corso: si trova senza scorrere anche con tanti ordini vecchi */
  h += schedaRitiro();
  if (passati.length) {
    const mesi = {};
    passati.slice(0, UI.ordQuanti || 40).forEach(o => (mesi[o.entro.slice(0, 7)] = mesi[o.entro.slice(0, 7)] || []).push(o));
    h += `<h2 class="ord-titolo">Ordini passati</h2>` + Object.entries(mesi).map(([m, oo]) => `<section class="ord-giorno"><h3 class="ord-mese">${maiuscola(new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(daIso(m + '-15')))}</h3>
      <div class="ord-lista">${oo.map(rigaCliente).join('')}</div></section>`).join('');
    if (passati.length > (UI.ordQuanti || 40)) h += `<button type="button" class="btn chiaro pieno" data-a="ord-altri">Mostra altri</button>`;
  }
  return h + cartaNotifica() + tastoMonica() + '</main>';
}
/* «Sono qui» (Mario 07/11, idea presa dal ritiro in auto): il cliente sotto casa avvisa Monica con un tocco */
function sonoQui(o) {
  const t = (UI.qui || {})[o.id], fatto = t && Date.now() - t < 60000;
  if (UI.quiEsito && UI.quiEsito.id === o.id && UI.quiEsito.senza) return `<div class="avviso">${ico('occhio')}<div><b>Monica non ha le notifiche accese.</b> Scrivile tu:
    <a class="btn piccolo" style="margin-top:8px" href="${wa(S.impostazioni.whatsapp, `Ciao Monica, sono qui sotto per il ritiro (ordine n. ${o.n}).`)}" target="_blank" rel="noopener">Scrivi su WhatsApp</a></div></div>`;
  return `<button type="button" class="btn verde pieno grande sono-qui" data-a="sono-qui" data-id="${o.id}" ${fatto || UI.quiInvio ? 'disabled' : ''}>${ico('ritiro')}${UI.quiInvio === o.id ? 'Un attimo…' : fatto ? 'Monica sa che sei qui ✓' : 'Sono qui sotto: avvisa Monica'}</button>`;
}
function rigaCliente(o) {
  if (UI.ordAperto === o.id) return `<div class="ord-aperto">${cartaOrdineCliente(o)}<button type="button" class="link" data-a="ord-apri" data-id="${o.id}">Chiudi</button></div>`;
  const cosa = o.righe.map(r => `${qtaTesto(r.tipo, r.qta, r.formatoNome)} ${r.nome}`).join(', ');
  return `<button type="button" class="ord-riga" data-a="ord-apri" data-id="${o.id}">
    <span class="ord-n">n. ${o.n}<small>${F_BREVE.format(daIso(o.entro))}</small></span>
    <span class="ord-chi"><b>${esc(cosa)}</b></span>
    <span class="ord-dx"><b>${euroBreve(totale(o.righe))}</b><span class="stato ${o.stato}">${STATO_CLIENTE[o.stato]}</span></span></button>`;
}

function vModifica() {
  const m = UI.modifica, o = S.ordini.find(x => x.id === m.ordine);
  let h = `<header class="testata"><button type="button" class="indietro" data-a="modifica-esci">${ico('x')}Lascia stare</button><div class="titolo"><b>Cambia l'ordine n. ${o.n}</b></div></header><main class="corpo">
    <p class="tenue" style="margin:0">Cambia le quantità, togli o aggiungi piatti. Monica deve approvare.</p><section class="scheda">`;
  h += m.righe.length ? m.righe.map((r, i) => `<div class="riga-ord"><b>${esc(r.nome)}</b><span class="prezzo">${euro(prezzoRiga(r))}</span><span class="det">${esc(descRiga(r))}</span>
    <div class="azioni">${passo('m-qta', r.tipo === 'kg' ? NUM.format(r.qta) + ' kg' : r.qta, `data-i="${i}"`)}<button type="button" class="link" data-a="m-togli" data-i="${i}">Togli</button></div></div>`).join('') : '<p class="tenue">Hai tolto tutto. Se non vuoi più niente, puoi annullare l\'ordine.</p>';
  h += `</section><button type="button" class="btn chiaro pieno" data-a="vai" data-v="menu">${ico('piu')}Aggiungi un piatto</button>
    <div class="totale"><span>Nuovo totale</span><span>${euro(totale(m.righe))}</span></div>
    <button type="button" class="btn pieno" data-a="modifica-invia" ${m.righe.length ? '' : 'disabled'}>Invia la modifica a Monica</button>`;
  return h + '</main>';
}

function schedaRitiro() {
  const r = S.impostazioni.ritiro, num = S.impostazioni.whatsapp;
  if (!r.via) return '';   /* chi non è ancora approvato non riceve l'indirizzo */
  return `<section class="scheda ritiro-scheda"><h2>Dove ritiri</h2>
    <div><b style="font-size:1.2rem;font-family:var(--display)">${esc(r.via)}</b><br><span class="tenue">${esc(r.citta)}</span></div>
    ${r.nota ? `<p class="tenue" style="margin:0">${esc(r.nota)}</p>` : ''}
    <a class="btn pieno" href="${mapsLink()}" target="_blank" rel="noopener">${ico('mappa')}Apri in Maps</a>
    ${num ? `<div class="fila larga"><a class="btn chiaro" href="${wa(num, 'Ciao Monica! ')}" target="_blank" rel="noopener">${ico('chat')}Scrivi a Monica</a>
      <a class="btn chiaro" href="tel:+${numero(num)}">${ico('telefono')}Chiama</a></div>` : ''}
  </section>`;
}
function foglioAllergie() {
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro"><h1>Le tue allergie</h1>
    <p class="tenue" style="margin:0">Tocca quelle che hai: nel menù i piatti che le contengono diventano rossi. Restano solo su questo telefono.</p>
    <div class="scelte">${ALLERGENI.map(([k, n]) => `<button type="button" class="chip" data-a="allergia" data-v="${k}" aria-pressed="${P.allergie.includes(k)}">${n}</button>`).join('')}</div></div>
    <div class="piede"><button type="button" class="btn pieno" data-a="chiudi">Fatto</button></div>`;
}

function barraCliente() {
  const att = { menu: 'menu', carrello: 'menu', modifica: 'ordini', inviato: 'ordini' }[UI.vista] || UI.vista;
  const avvisi = S.ordini.filter(o => o.cliente === P.cliente && (o.stato === 'proposta' || o.stato === 'pronto')).length;
  const b = (v, n, t, extra = '') => `<button type="button" data-a="vai" data-v="${v}" ${att === v ? 'aria-current="page"' : ''}>${ico(n)}${t}${extra}</button>`;
  return `<nav aria-label="Sezioni">${b('menu', 'menu', 'Menù')}${b('ordini', 'ordini', 'I miei ordini', avvisi ? `<span class="pallino">${avvisi}</span>` : '')}</nav>`;
}

/* ================= MONICA ================= */
const NOMI_VISTE = { home: 'Home', ordini: 'Ordini', piatti: 'I miei piatti', piatto: 'Modifica piatto', nuovo: 'Nuovo piatto', clienti: 'Clienti', impostazioni: 'Impostazioni', spesa: 'Lista della spesa' };
function testataMonica(titolo, indietro) {
  const vista = UI.vista.split(':')[0];
  const aiuto = wa(S.impostazioni.mario, `Ciao Mario, sono bloccata in Pronti in Tavola, nella schermata «${NOMI_VISTE[vista] || vista}». Mi aiuti?`);
  return `<header class="testata">${indietro ? `<button type="button" class="indietro" data-a="vai" data-v="${indietro}">${ico('indietro')}Indietro</button>` : `<img class="marchio" src="${LOGO}" alt="">`}
    <div class="titolo"><b>${esc(titolo)}</b>${UI.salvato ? '<span>Salvato da solo ✓</span>' : ''}</div>
    <a class="icona" href="${aiuto}" target="_blank" rel="noopener" aria-label="Chiedi a Mario su WhatsApp" title="Chiedi a Mario">${ico('aiuto')}</a></header>`;
}
function agenda() {
  const prossimi = S.ordini.filter(o => o.stato === 'accettato').sort((a, b) => a.entro.localeCompare(b.entro));
  if (!prossimi.length) return '<p class="tenue" style="margin:0">Niente da preparare per ora.</p>';
  const perGiorno = {};
  prossimi.forEach(o => (perGiorno[o.entro] = perGiorno[o.entro] || []).push(o));
  return `<div class="agenda">${Object.entries(perGiorno).slice(0, 5).map(([g, oo]) => { const d = daIso(g); return `<div class="agenda-giorno"><div class="data"><small>${F_GS.format(d)}</small><b>${d.getDate()}</b><small>${F_MESE.format(d)}</small></div>
    <ul>${oo.map(o => `<li><b>${esc(cliente(o.cliente).nome)}</b>: ${esc(o.righe.map(r => `${r.nome.toLowerCase()} (${descRiga(r)})`).join(', '))}</li>`).join('')}</ul></div>`; }).join('')}</div>`;
}
function vHome() {
  const n = daGuardare().length, imp = S.impostazioni, pronti = prontiOggi();
  let h = testataMonica('Pronti in Tavola') + '<main class="corpo">';
  if (pausaOra()) h += `<div class="avviso">${ico('pausa')}<div><b>Sei in pausa fino a ${giornoLungo(imp.pausa.fino)}.</b> I clienti possono ordinare solo per dopo.
    <div class="fila" style="margin-top:10px"><button type="button" class="btn piccolo" data-a="riprendi">Riprendi adesso</button></div></div></div>`;
  h += richiesteGestore();
  if (!P.homeNo) h += cartaHome().replace('</section>', '<button type="button" class="link" data-a="home-no">Non ora</button></section>');
  h += `<div><h1>Ciao ${esc((Dati.attivo && Dati.io.nomeGestore) || 'Monica')}</h1><p class="tenue" style="margin:4px 0 0">${n ? `Hai <b>${n}</b> ${n === 1 ? 'cosa' : 'cose'} da guardare negli ordini.` : 'Nessun ordine nuovo da guardare.'}</p></div>
    ${barraAI()}
    <div class="riquadri">
      <button type="button" class="riquadro primo" data-a="vai" data-v="ordini">${ico('ordini')}${n ? `<span class="pallino">${n}</span>` : ''}<div><b>Ordini</b><br><small>Accetta e prepara</small></div></button>
      <button type="button" class="riquadro" data-a="vai" data-v="piatti">${ico('piatti')}<div><b>I miei piatti</b><br><small>Foto, prezzi, pronti</small></div></button>
      <button type="button" class="riquadro" data-a="vai" data-v="clienti">${ico('clienti')}${S.richieste.length ? `<span class="pallino">${S.richieste.length}</span>` : ''}<div><b>Clienti</b><br><small>Invita e approva</small></div></button>
      <button type="button" class="riquadro" data-a="vai" data-v="impostazioni">${ico('impostazioni')}<div><b>Impostazioni</b><br><small>Pausa e ferie</small></div></button>
    </div>
    <section class="scheda"><header class="fila"><h2 style="flex:1">Pronti subito oggi</h2></header>
      ${pronti.length ? `<ul style="margin:0;padding-left:18px">${pronti.map(p => { const f = p.formati.find(x => x.id === p.pronto.formato) || p.formati[0]; return `<li><b>${esc(p.nome)}</b>: ${qtaTesto(f.tipo, p.pronto.qta, f.nome)}</li>`; }).join('')}</ul>` : '<p class="tenue" style="margin:0">Hai qualcosa già pronto? Segnalo: i clienti lo vedono in cima al menù.</p>'}
      <button type="button" class="btn ${pronti.length ? 'chiaro' : ''} pieno" data-a="apri-pronti">${ico('fiamma')}${pronti.length ? 'Cambia i pronti' : 'Segna cosa hai pronto'}</button></section>
    <section class="scheda"><h2>Da preparare</h2>${agenda()}
      <button type="button" class="btn chiaro pieno" data-a="vai" data-v="spesa">${ico('carrello')}Lista della spesa</button></section>`;
  h += incassi();
  /* inviti anche dalla Home (Mario 07/11: «mettili nella mia app gli inviti ora»); «Invita Monica» solo a chi non è lei */
  const nonLei = Dati.attivo && Dati.io.nomeGestore && Dati.io.nomeGestore !== cuoca();
  h += `<section class="scheda"><h2>Inviti</h2><p class="tenue" style="margin:0">Parte un biglietto in foto col link, pronto per WhatsApp.</p>
    ${bottoneBiglietto('a', 'Invita le amiche', 'pieno')}${nonLei ? bottoneBiglietto('m', 'Invita ' + cuoca(), 'chiaro pieno') : ''}</section>`;
  return h + '</main>';
}
/* incassi del mese (Fase 3, C7): per il giorno del ritiro; solo ordini accettati, pronti o ritirati */
const VALIDI = ['accettato', 'pronto', 'ritirato'];
function contiMese(mese) {
  const oo = S.ordini.filter(o => VALIDI.includes(o.stato) && !diProva(o) && String(o.entro).slice(0, 7) === mese);
  const presi = oo.filter(o => o.paga && o.paga.ricevuto), daPrendere = oo.filter(o => !(o.paga && o.paga.ricevuto));
  const piatti = {};
  oo.forEach(o => o.righe.forEach(r => { piatti[r.nome] = (piatti[r.nome] || 0) + totale([r]); }));
  return { oo, presi: totale(presi.flatMap(o => o.righe)), daPrendere: totale(daPrendere.flatMap(o => o.righe)), nDa: daPrendere.length,
    piatti: Object.entries(piatti).sort((a, b) => b[1] - a[1]).slice(0, 3) };
}
function incassi() {
  const ora = oggi().slice(0, 7), d = new Date(ora + '-15T12:00:00'); d.setMonth(d.getMonth() - 1);
  const prima = d.toISOString().slice(0, 7), c = contiMese(ora), p = contiMese(prima);
  const nome = m => new Date(m + '-15T12:00:00').toLocaleDateString('it-IT', { month: 'long' });
  const tot = c.presi + c.daPrendere;
  return `<details class="scheda incassi"><summary><b>Incassi di ${nome(ora)}</b><span>${euro(tot)}</span></summary>
    <div class="conti"><div><small>Già presi</small><b>${euro(c.presi)}</b></div><div><small>Da prendere${c.nDa ? ` (${c.nDa} ${c.nDa === 1 ? 'ordine' : 'ordini'})` : ''}</small><b>${euro(c.daPrendere)}</b></div></div>
    <p class="tenue" style="margin:0"><b>${c.oo.length}</b> ${c.oo.length === 1 ? 'ordine' : 'ordini'} da ritirare in ${nome(ora)}. ${nome(prima).replace(/^./, x => x.toUpperCase())}: ${euro(p.presi + p.daPrendere)}.</p>
    ${c.piatti.length ? `<p style="margin:0"><small class="tenue">Rendono di più:</small><br>${c.piatti.map(([n, v]) => `${esc(n)} <b>${euro(v)}</b>`).join(' · ')}</p>` : ''}
    <p class="tenue piccolo" style="margin:0">Contano gli ordini accettati, pronti o ritirati, per il giorno del ritiro. «Già presi» = quelli segnati «Soldi ricevuti».</p></details>`;
}

function daCucinare(oo) {
  const perGiorno = {};
  oo.forEach(o => o.righe.forEach(r => {
    const g = perGiorno[o.entro] = perGiorno[o.entro] || {};
    const k = [r.piatto, r.variante, r.formato].join('|');
    const x = g[k] = g[k] || { nome: r.nome, varianteNome: r.varianteNome, tipo: r.tipo, formatoNome: r.formatoNome, qta: 0, note: [] };
    x.qta = arrot(x.qta + r.qta);
    const nn = [...(r.note || []), r.testo].filter(Boolean);
    if (nn.length) x.note.push(`${nn.join(', ')} (${nomeBreve(cliente(o.cliente).nome)})`);
  }));
  return Object.entries(perGiorno).sort((a, b) => a[0].localeCompare(b[0]));
}
function diff(o) {
  const k = r => [r.piatto, r.formato, r.variante].join('|');
  const prima = new Map(o.righe.map(r => [k(r), r])), dopo = new Map(o.modifica.righe.map(r => [k(r), r]));
  let h = '';
  dopo.forEach((r, key) => {
    const v = prima.get(key);
    if (!v) h += rigaOrdine(r, 'aggiunta').replace('<b>', '<b>+ ');
    else if (v.qta !== r.qta) h += rigaOrdine(r, 'aggiunta').replace('</span>\n', '</span>\n').replace('<span class="det">', `<span class="det">Prima: ${esc(qtaTesto(v.tipo, v.qta, v.formatoNome))} → ora: `);
    else h += rigaOrdine(r);
  });
  prima.forEach((r, key) => { if (!dopo.has(key)) h += rigaOrdine(r, 'tolta'); });
  return h;
}
function waOrdine(o, tipo) {
  const c = cliente(o.cliente), r = S.impostazioni.ritiro;
  const testi = {
    pronto: `Ciao ${nomeBreve(c.nome)}! Il tuo ordine n. ${o.n} è pronto.\nTotale: ${euro(totale(o.righe))}\nRitira qui: ${r.via}, ${r.citta}\n${mapsLink()}\n${r.nota}`,
    proposta: `Ciao ${nomeBreve(c.nome)}! Per il tuo ordine n. ${o.n} ti propongo ${giornoLungo(o.proposta)}. Rispondi dall'app con un tocco: ${SITO}`,
    accettato: `Ciao ${nomeBreve(c.nome)}! Ho confermato il tuo ordine n. ${o.n} per ${giornoLungo(o.entro)}.`
  };
  return wa(c.telefono || '', testi[tipo] + firmaMsg);
}
function cartaOrdineMonica(o) {
  const r = richiestaDi(o), righe = daAccettare(o) ? prezziGiusti(o.righe) : o.righe;
  let h = `<article class="scheda ordine-carta"><header><div><h3>${esc(chiOrdina(o))}</h3><span class="tenue piccolo">Ordine n. ${o.n}</span></div>
    ${bollinoProva(o)}<span class="stato ${o.stato}">${r && r.cliente ? 'Telefono nuovo' : STATO_MONICA[o.stato]}</span></header>${dateOrdine(o)}${tempiOrdine(o)}`;
  if (r) h += `<div class="avviso">${ico('clienti')}<div>${r.cliente ? `<b>Telefono nuovo.</b> Dice di essere ${esc(r.nome)}, che conosci già. Se è lei, ricollega: vedrà i suoi ordini.`
    : `<b>Prima volta.</b> ${r.tramite ? `Amica di ${esc(r.tramite)}.` : ''} Se la conosci, dille di sì: vedrà l'indirizzo e potrà ordinare.`}</div></div>`;
  if (o.stato === 'proposta') h += `<p class="tenue" style="margin:0">Hai proposto ${giornoLungo(o.proposta)}. Aspetti la risposta. <a class="link" href="${waOrdine(o, 'proposta')}" target="_blank" rel="noopener">Avvisala su WhatsApp</a></p>`;
  if (o.modifica) {
    h += `<div class="avviso">${ico('matita')}<div><b>Chiede una modifica.</b> In verde il nuovo, in rosso il tolto.</div></div><div>${diff(o)}</div>
      <div class="totale"><span>Nuovo totale</span><span>${euro(totale(prezziGiusti(o.modifica.righe, daAccettare(o) ? [] : o.righe)))}</span></div>
      <div class="fila larga"><button type="button" class="btn verde" data-a="mod-si" data-id="${o.id}">Accetta la modifica</button><button type="button" class="btn chiaro" data-a="mod-no" data-id="${o.id}">No</button></div>`;
  } else {
    h += `<div>${righe.map(x => rigaOrdine(x)).join('')}</div><div class="totale"><span>Totale</span><span>${euro(totale(righe))}</span></div>`;
    if (totale(righe) !== totale(o.righe)) h += `<p class="tenue piccolo" style="margin:0">Coi tuoi prezzi di oggi. Il cliente vedeva ${euro(totale(o.righe))}: quando accetti, vede il tuo.</p>`;
  }
  if (o.nota) h += `<div class="avviso">${ico('chat')}<div><b>Nota:</b> ${esc(o.nota)}</div></div>`;
  if (o.prova) h += `<div class="avviso avviso-prova">${ico('aiuto')}<div><b>È un ordine di PROVA.</b> ${o.provaCliente ? 'Il cliente ha scritto che sta provando l\'app.' : 'L\'hai segnato tu.'} Non conta negli incassi né nella spesa. Puoi seguirlo come un ordine vero.</div></div>`;
  if (o.stato === 'prova') return h + `<div class="avviso">${ico('aiuto')}<div><b>Ordine di prova.</b> Non conta negli incassi, nella spesa, nelle etichette né nei giorni pieni, e il cliente non lo vede.</div></div>
    <button type="button" class="btn chiaro pieno" data-a="ord-vero" data-id="${o.id}">Rimetti tra i veri</button></article>`;
  if (!['rifiutato', 'annullato', 'daApprovare'].includes(o.stato)) {
    const pg = o.paga;
    h += `<div class="fila" style="justify-content:space-between"><span><b>${METODO[pg.metodo]}</b> · ${pg.ricevuto ? '<span style="color:var(--basilico);font-weight:800">soldi ricevuti ✓</span>' : pg.dice ? '<span style="color:var(--cotto);font-weight:800">dice che ha pagato: controlla</span>' : 'da ricevere'}</span>
      ${!pg.ricevuto && (pg.dice || ['accettato', 'pronto', 'ritirato'].includes(o.stato) && (pg.metodo !== 'contanti' || o.stato !== 'accettato')) ? `<button type="button" class="btn chiaro piccolo" data-a="ricevuto" data-id="${o.id}">${ico('euro')}Soldi ricevuti</button>` : ''}</div>`;
  }
  if (r) h += bottoniRichiesta(r) + (!r.cliente && o.stato === 'daApprovare' && !o.pronto ? `<button type="button" class="link" data-a="richiesta-proponi" data-id="${r.id}" data-o="${o.id}"${UI.decido === r.id ? ' disabled' : ''}>Sì, ma il giorno non mi va: proponi un altro giorno</button>` : '');
  if (!o.modifica) {
    if (o.stato === 'nuovo') h += `<div class="fila larga"><button type="button" class="btn verde" data-a="accetta" data-id="${o.id}">${ico('spunta')}Accetta</button>${o.pronto ? '' : `<button type="button" class="btn chiaro" data-a="proponi" data-id="${o.id}">Proponi un altro giorno</button>`}</div>
      <button type="button" class="link" data-a="rifiuta" data-id="${o.id}">Non posso farlo</button>`;
    if (o.stato === 'accettato') h += `<a class="btn verde pieno" data-a="pronto" data-id="${o.id}" href="${waOrdine(o, 'pronto')}" target="_blank" rel="noopener">${ico('chat')}È pronto: avvisa su WhatsApp</a>
      <button type="button" class="link" data-a="pronto-muto" data-id="${o.id}">Segna pronto senza messaggio</button>
      ${o.pronto ? '' : `<button type="button" class="link" data-a="proponi" data-id="${o.id}">Il giorno non va più: proponi un altro giorno</button>`}`;
    if (o.stato === 'pronto') h += `<button type="button" class="btn pieno" data-a="ritirato" data-id="${o.id}">${ico('spunta')}Ritirato</button>`;
  }
  /* C35: un ordine fatto per provare l'app esce da tutti i conti; due tocchi, per non sbagliare */
  if (diProva(o)) h += UI.archSi === o.id ? `<button type="button" class="btn chiaro pieno conferma-prova" data-a="arch-prova" data-id="${o.id}">Tocca ancora: archivia questa prova</button>`
    : `<button type="button" class="btn chiaro" data-a="arch-prova" data-id="${o.id}">Archivia questa prova</button>`;
  if (o.prova) h += `<button type="button" class="link piccolo" data-a="ord-vero" data-id="${o.id}">Non è una prova: rimettilo tra i veri</button>`;
  else if (o.stato !== 'daApprovare') h += UI.provaSi === o.id
    ? `<button type="button" class="btn chiaro pieno conferma-prova" data-a="ord-prova" data-id="${o.id}">Tocca ancora: è una prova</button>`
    : `<button type="button" class="link piccolo" data-a="ord-prova" data-id="${o.id}">È una prova</button>`;
  return h + '</article>';
}
/* Ordini di chi gestisce (Mario 07/11: «in modo ordinato, uno storico, quelli in corso, per data… come le app gold standard»):
   Nuovi (da guardare) · Oggi (da fare e pronti, anche in ritardo) · Prossimi giorni (per giorno) · Storico (finiti: cerca, filtri, mesi) */
const FINITI = ['ritirato', 'rifiutato', 'annullato'];
/* ordine di prova (Mario 07/11): fa il giro normale (notifiche, Nuovi, Oggi) con «PROVA» ben visibile; fuori da incassi e spesa; finito, va negli «Ordini di prova».
   stato 'prova' = vecchio modo (C35 prima versione), trattato come una prova finita */
const diProva = o => !!o.prova || o.stato === 'prova';
const bollinoProva = o => diProva(o) ? '<span class="bollino-prova">PROVA</span>' : '';
const giornoDi = o => o.stato === 'proposta' && o.proposta ? o.proposta : o.entro;
/* scadenze chiare (Mario 07/11: «deve capire in modo facile le scadenze, il giorno che è stato ordinato… che le faciliti l'organizzativo») */
function scadenza(g, finito) {
  const d = Math.round((daIso(g) - daIso(oggi())) / 864e5);
  if (finito) return { t: '', c: '' };
  if (d < 0) return { t: d === -1 ? 'in ritardo di 1 giorno' : `in ritardo di ${-d} giorni`, c: 'ritardo' };
  if (d === 0) return { t: 'oggi', c: 'urgente' };
  if (d === 1) return { t: 'domani', c: 'urgente' };
  return { t: `tra ${d} giorni`, c: d <= 3 ? 'presto' : 'calmo' };
}
const GIORNO_DATA = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const dataLunga = g => maiuscola(GIORNO_DATA.format(daIso(g)));
function dateOrdine(o, cliente) {
  const g = cliente ? o.entro : giornoDi(o), fin = FINITI.includes(o.stato), sc = scadenza(g, fin || o.stato === 'pronto');
  const quando = o.tempi && o.tempi.nuovo ? dataLunga(iso(new Date(o.tempi.nuovo))) + ', ore ' + F_ORA.format(new Date(o.tempi.nuovo)) : o.creato ? dataLunga(o.creato) : '';
  const cosa = o.stato === 'proposta' && !cliente ? 'Giorno proposto da te' : fin ? (o.stato === 'ritirato' ? 'Ritirato per' : 'Era per') : ['accettato', 'pronto'].includes(o.stato) ? (o.pronto ? 'Ritiro (pronti subito)' : 'Ritiro') : cliente ? 'Ti serve entro' : 'Le serve entro';
  return `<div class="date-ord">
    <div class="date-riga"><span class="date-ico">${ico('ritiro')}</span><div><small>${cosa}</small><b>${dataLunga(g)}</b></div>${sc.t ? `<span class="scad ${sc.c}">${maiuscola(sc.t)}</span>` : ''}</div>
    ${quando ? `<div class="date-riga tenue"><span class="date-ico">${ico('ordini')}</span><div><small>Ordinato</small><span>${quando}${o.creato ? ` · ${giorniFa(o.creato) === 0 ? 'oggi' : giorniFa(o.creato) === 1 ? 'ieri' : giorniFa(o.creato) + ' giorni fa'}` : ''}</span></div></div>` : ''}</div>`;
}
/* Prove archiviate (Mario 07/11): spariscono da tutte le schede; due tocchi per non sbagliare, «Annulla» subito dopo */
const proveDaArchiviare = () => S.ordini.filter(o => diProva(o) && !o.archiviato);
function listaProve() {
  const { prove: pp, archiviati: aa } = gruppiOrdini(), tutte = proveDaArchiviare().length;
  if (!pp.length && !aa.length && !tutte) return '';
  return `<details class="ord-prove"${pp.some(o => o.id === UI.ordAperto) || UI.vediArch || UI.archSi === 'tutte' ? ' open' : ''}><summary class="tenue">Ordini di prova (${pp.length})</summary>
    <p class="tenue piccolo" style="margin:4px 0">Prove finite: non contano negli incassi né nella spesa. Toccane una per rimetterla tra i veri.</p>
    <div class="ord-lista">${pp.map(o => rigaOrd(o, true)).join('')}</div>
    ${tutte ? `<button type="button" class="btn chiaro pieno${UI.archSi === 'tutte' ? ' conferma-prova' : ''}" data-a="arch-prova" data-id="tutte">${UI.archSi === 'tutte' ? `Tocca ancora: archivia ${tutte === 1 ? 'la prova' : `le ${tutte} prove`}` : `Archivia tutte le prove (${tutte})`}</button>` : ''}
    ${aa.length ? `<button type="button" class="link piccolo" data-a="vedi-arch">${UI.vediArch ? 'Nascondi gli archiviati' : `Archiviati (${aa.length})`}</button>
      ${UI.vediArch ? `<div class="ord-lista">${aa.map(o => `<div class="arch-riga"><span>n. ${o.n} · ${esc(chiOrdina(o))}</span><button type="button" class="link piccolo" data-a="disarch" data-id="${o.id}">Ripristina</button></div>`).join('')}</div>` : ''}` : ''}</details>`;
}
function gruppiOrdini() {
  const g = daGuardare(), oo = S.ordini.filter(o => !g.includes(o) && o.stato !== 'prova' && !o.archiviato), o0 = oggi(), finita = o => o.stato === 'prova' || (o.prova && FINITI.includes(o.stato));
  const perGiorno = (a, b) => giornoDi(a).localeCompare(giornoDi(b)) || a.n - b.n;
  return {
    nuovi: g.sort(perGiorno),
    oggi: oo.filter(o => o.stato === 'pronto' || (o.stato === 'accettato' && o.entro <= o0)).sort(perGiorno),
    prossimi: oo.filter(o => (o.stato === 'accettato' && o.entro > o0) || o.stato === 'proposta').sort(perGiorno),
    storico: oo.filter(o => FINITI.includes(o.stato) && !o.prova).sort((a, b) => b.entro.localeCompare(a.entro) || b.n - a.n),
    prove: S.ordini.filter(o => finita(o) && !o.archiviato).sort((a, b) => b.n - a.n),
    archiviati: S.ordini.filter(o => o.archiviato).sort((a, b) => b.n - a.n)
  };
}
function schedaCucina(oo, titolo = 'Cosa cucinare', conGiorno = true) {
  const cucina = daCucinare(oo.filter(o => o.stato === 'accettato'));
  if (!cucina.length) return '';
  return `<section class="scheda"><h2>${titolo}</h2>${cucina.map(([g, piatti]) => `<div class="gruppo">${conGiorno ? `<span class="etichetta">${maiuscola(giornoLungo(g))}${g < oggi() ? ' · in ritardo' : ''}</span>` : ''}
    <ul style="margin:0;padding-left:18px">${Object.values(piatti).map(x => `<li><b>${esc(x.nome)}</b>${x.varianteNome ? ' ' + esc(x.varianteNome.toLowerCase()) : ''}: ${qtaTesto(x.tipo, x.qta, x.formatoNome)}${x.note.length ? `<br><span style="color:var(--cotto);font-weight:800">${esc(x.note.join(' · '))}</span>` : ''}</li>`).join('')}</ul></div>`).join('')}
    <button type="button" class="btn chiaro pieno" data-a="etichette">${ico('spunta')}Etichette per le vaschette</button></section>`;
}
/* riga corta di un ordine: un tocco la apre (scheda intera con i pulsanti) */
const F_ORA = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });
const F_BREVE = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
function rigaOrd(o, conGiorno) {
  if (UI.ordAperto === o.id) return `<div class="ord-aperto">${cartaOrdineMonica(o)}<button type="button" class="link" data-a="ord-apri" data-id="${o.id}">Chiudi</button></div>`;
  const cosa = o.righe.map(r => `${qtaTesto(r.tipo, r.qta, r.formatoNome)} ${r.nome}`).join(', ');
  const chi = chiOrdina(o);
  return `<button type="button" class="ord-riga" data-a="ord-apri" data-id="${o.id}" data-testo="${esc((chi + ' ' + cosa + ' ' + o.n).toLowerCase())}">
    <span class="ord-n">n. ${o.n}${conGiorno ? `<small>${F_BREVE.format(daIso(giornoDi(o)))}</small>` : ''}</span>
    <span class="ord-chi"><b>${bollinoProva(o)}${esc(chi)}</b><small>${esc(cosa)}</small></span>
    <span class="ord-dx"><b>${euroBreve(totale(o.righe))}</b>${(() => { const sc = scadenza(giornoDi(o), FINITI.includes(o.stato) || o.stato === 'pronto'); return sc.t && !['proposta', 'prova'].includes(o.stato) ? `<span class="scad ${sc.c}">${maiuscola(sc.t)}</span>` : `<span class="stato ${o.stato}">${STATO_MONICA[o.stato]}</span>`; })()}</span></button>`;
}
/* orari di ogni passo (da questa versione: gli ordini vecchi non li hanno) */
function tempiOrdine(o) {
  const t = o.tempi || {}, passi = [['accettato', 'Accettato'], ['pronto', 'Pronto'], ['ritirato', 'Ritirato'], ['rifiutato', 'Rifiutato']].filter(([k]) => t[k]);
  if (!passi.length) return '';
  const quando = ms => { const d = new Date(ms); return (iso(d) === oggi() ? '' : F_BREVE.format(d) + ' ') + F_ORA.format(d); };
  return `<p class="tenue piccolo ord-tempi">${passi.map(([k, n]) => `${n} ${quando(t[k])}`).join(' · ')}</p>`;
}
function vOrdiniMonica() {
  const gr = gruppiOrdini(), o0 = oggi();
  if (!gr[UI.tab] || UI.tab === 'prove') UI.tab = gr.nuovi.length ? 'nuovi' : 'oggi';
  const nomi = { nuovi: 'Nuovi', oggi: 'Oggi', prossimi: 'Prossimi', storico: 'Storico' };
  let h = testataMonica('Ordini', 'home') + `<main class="corpo"><nav class="schede-cat ord-schede" aria-label="Tipi di ordini" style="top:65px">${Object.keys(nomi).map(k =>
    `<button type="button" class="chip" data-a="tab" data-v="${k}" aria-pressed="${UI.tab === k}">${nomi[k]}${k !== 'storico' && gr[k].length ? ` <span class="conta">${gr[k].length}</span>` : ''}</button>`).join('')}</nav>`;
  const lista = gr[UI.tab];
  if (UI.tab === 'nuovi') {
    if (!lista.length) h += '<p class="tenue">Niente da guardare. Gli ordini nuovi compaiono qui (e ti suona il telefono).</p>';
    return h + lista.map(cartaOrdineMonica).join('') + '</main>';
  }
  if (UI.tab === 'oggi') {
    const fare = lista.filter(o => o.stato === 'accettato'), pronti = lista.filter(o => o.stato === 'pronto');
    const ritirati = S.ordini.filter(o => o.stato === 'ritirato' && o.entro === o0);
    const incasso = S.ordini.filter(o => VALIDI.includes(o.stato) && !diProva(o) && o.entro === o0).reduce((x, o) => x + totale(o.righe), 0);
    const ritardo = lista.filter(o => o.entro < o0).length;
    h += `<div class="riepilogo"><div><b>${fare.length}</b><span>da preparare</span></div><div><b>${pronti.length}</b><span>pronti</span></div><div><b>${ritirati.length}</b><span>ritirati</span></div><div><b>${euroBreve(arrot(incasso))}</b><span>di oggi</span></div></div>`;
    if (ritardo) h += `<div class="avviso">${ico('aiuto')}<div><b>${ritardo === 1 ? '1 ordine' : ritardo + ' ordini'} di giorni passati</b> non ancora ritirati: sono qui sotto, segnati «in ritardo».</div></div>`;
    h += schedaCucina(fare, 'Da cucinare');
    if (!lista.length) h += '<p class="tenue">Oggi niente da preparare né da far ritirare.</p>';
    if (fare.length) h += `<h2 class="ord-titolo">Da preparare (${fare.length})</h2>` + fare.map(cartaOrdineMonica).join('');
    if (pronti.length) h += `<h2 class="ord-titolo">Pronti, aspettano il ritiro (${pronti.length})</h2>` + pronti.map(cartaOrdineMonica).join('');
    if (ritirati.length) h += `<h2 class="ord-titolo">Già ritirati oggi (${ritirati.length})</h2><div class="ord-lista">${ritirati.map(o => rigaOrd(o)).join('')}</div>`;
    return h + '</main>';
  }
  if (UI.tab === 'prossimi') {
    if (!lista.length) return h + '<p class="tenue">Nessun ordine per i prossimi giorni.</p></main>';
    const giorni = {};
    lista.forEach(o => (giorni[giornoDi(o)] = giorni[giornoDi(o)] || []).push(o));
    h += `<div class="settimana" aria-label="Prossimi 7 giorni">${[1, 2, 3, 4, 5, 6, 7].map(i => { const g = piuGiorni(o0, i), n = (giorni[g] || []).length, d = daIso(g);
      return `<button type="button" class="sett-g${n ? ' pieno' : ''}" data-a="ord-giorno" data-v="${g}"${n ? '' : ' disabled'}><small>${i === 1 ? 'domani' : F_GS.format(d)}</small><b>${d.getDate()}</b><span>${n ? n + ' ord.' : '—'}</span></button>`; }).join('')}</div>`;
    h += Object.entries(giorni).map(([g, oo]) => `<section class="ord-giorno" id="g-${g}"><h2 class="ord-titolo">${maiuscola(giornoLungo(g))}${giornoLungo(g).length < 8 ? ` · ${F_DATA.format(daIso(g))}` : ''}<small>${maiuscola(scadenza(g).t)} · ${oo.length === 1 ? '1 ordine' : oo.length + ' ordini'} · ${euroBreve(arrot(oo.reduce((x, o) => x + totale(o.righe), 0)))}</small></h2>
      ${schedaCucina(oo, 'Da cucinare', false)}<div class="ord-lista">${oo.map(o => rigaOrd(o)).join('')}</div></section>`).join('');
    return h + '</main>';
  }
  /* storico */
  const filtri = [['tutti', 'Tutti'], ['ritirato', 'Ritirati'], ['annullato', 'Annullati'], ['rifiutato', 'Rifiutati']];
  const f = UI.ordFiltro || 'tutti', scelti = lista.filter(o => f === 'tutti' || o.stato === f), quanti = UI.ordQuanti || 40;
  h += `<input type="search" class="cerca-ord" data-cercaord="1" placeholder="Cerca un nome, un piatto o un numero" aria-label="Cerca negli ordini" autocomplete="off">
    <div class="scelte">${filtri.map(([k, n]) => `<button type="button" class="chip" data-a="ord-filtro" data-v="${k}" aria-pressed="${f === k}">${n}</button>`).join('')}</div>`;
  if (!scelti.length) return h + '<p class="tenue">Ancora nessun ordine qui.</p>' + listaProve() + '</main>';
  const mesi = {};
  scelti.slice(0, quanti).forEach(o => (mesi[o.entro.slice(0, 7)] = mesi[o.entro.slice(0, 7)] || []).push(o));
  h += Object.entries(mesi).map(([m, oo]) => {
    const tutti = lista.filter(o => o.entro.slice(0, 7) === m && o.stato === 'ritirato');
    return `<section class="ord-giorno"><h2 class="ord-titolo">${maiuscola(new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(daIso(m + '-15')))}<small>${tutti.length === 1 ? '1 ritirato' : tutti.length + ' ritirati'} · ${euroBreve(arrot(tutti.reduce((x, o) => x + totale(o.righe), 0)))}</small></h2>
      <div class="ord-lista">${oo.map(o => rigaOrd(o, true)).join('')}</div></section>`;
  }).join('');
  if (scelti.length > quanti) h += `<button type="button" class="btn chiaro pieno" data-a="ord-altri">Mostra altri (${scelti.length - quanti})</button>`;
  return h + '<p class="tenue piccolo ord-nessuno nascosto">Nessun ordine trovato.</p>' + listaProve() + '</main>';
}

function vPiatti() {
  let h = testataMonica('I miei piatti', 'home') + `<main class="corpo"><button type="button" class="btn pieno" data-a="nuovo-piatto">${ico('piu')}Aggiungi un piatto</button>
    <p class="tenue" style="margin:0">Tocca un piatto per cambiare foto, prezzi e ingredienti. L'interruttore lo toglie o lo rimette nel menù.</p>`;
  const daControllare = visibili().filter(p => !p.controllato).length;
  if (daControllare) h += `<div class="avviso">${ico('aiuto')}<div>Ho preparato una bozza di ingredienti e allergeni per <b>${daControllare} piatti</b>. Aprili uno alla volta e controlla.</div></div>`;
  h += `<button type="button" class="btn chiaro pieno" data-a="menu-immagine">${ico('chat')}Immagine del menù da mandare</button>`;
  h += schedaFotoMenu();
  CATEGORIE.forEach(([k, n]) => {
    const pp = visibili().filter(p => p.cat === k);
    if (!pp.length) return;
    h += `<section class="sezione"><div class="cat-titolo"><h2>${n}</h2><span></span></div><div>${pp.map(p => `<div class="piatto-riga">${foto(p)}
      <button type="button" class="apri" data-a="vai" data-v="piatto:${p.id}"><b>${esc(p.nome)}</b><span class="tenue piccolo">${etichettaPrezzo(p)}</span>
      <span class="etichette" style="margin:0">${!p.controllato ? '<span class="eti nuovo">Da controllare</span>' : ''}${p.pronto && p.pronto.qta > 0 && p.pronto.giorno === oggi() ? '<span class="eti pronto">Pronto oggi</span>' : ''}${!p.disponibile ? '<span class="eti">Fuori menù</span>' : ''}</span></button>
      <label class="interr" aria-label="Nel menù: ${esc(p.nome)}"><input type="checkbox" data-campo="disp" data-id="${p.id}" ${p.disponibile ? 'checked' : ''}></label></div>`).join('')}</div></section>`;
  });
  const cestino = S.piatti.filter(p => p.cestino);
  if (cestino.length) h += `<section class="scheda"><h2>Nel cestino</h2><span class="tenue piccolo">Restano 30 giorni, poi spariscono.</span>${cestino.map(p => `<div class="fila" style="justify-content:space-between"><b>${esc(p.nome)}</b><button type="button" class="btn chiaro piccolo" data-a="rimetti" data-id="${p.id}">Rimetti</button></div>`).join('')}</section>`;
  return h + '</main>';
}

function editorIng(p, scope) {
  const v = scope === 'base' ? null : p.varianti.find(x => x.id === scope);
  const ids = v ? v.ing || [] : p.ing;
  const nuovi = ids.filter(i => S.ingExtra[i] && S.ingExtra[i].nuovo);
  return `<div class="ingr-lista">${ids.map(i => `<span class="chip">${esc(ING(i).n)}<button type="button" data-a="ing-togli" data-s="${scope}" data-ing="${i}" aria-label="Togli ${esc(ING(i).n)}">${ico('x')}</button></span>`).join('') || '<span class="tenue">Nessun ingrediente.</span>'}</div>
    <div class="fila" style="flex-wrap:nowrap"><input type="text" id="ing-${scope}" data-cerca="${scope}" placeholder="es. mozzarella, basilico" autocomplete="off" aria-label="Aggiungi ingredienti">
      <button type="button" class="btn piccolo" data-a="ing-aggiungi" data-s="${scope}">Aggiungi</button></div>
    <div class="suggerimenti" id="sug-${scope}"></div>
    ${nuovi.map(i => `<div class="avviso"><div style="width:100%"><b>«${esc(ING(i).n)}» è nuovo.</b> Ho segnato gli allergeni che mi sembrano giusti: tocca per cambiare.
      <div class="scelte" style="margin:8px 0">${ALLERGENI.map(([k, n]) => `<button type="button" class="chip" data-a="ing-all" data-ing="${i}" data-v="${k}" aria-pressed="${ING(i).a.includes(k)}" style="min-height:38px;font-size:.85rem">${n}</button>`).join('')}</div>
      <button type="button" class="btn piccolo" data-a="ing-ok" data-ing="${i}">Va bene</button></div></div>`).join('')}`;
}
function vPiatto(id) {
  const p = piatto(id);
  if (!p) { UI.vista = 'piatti'; return vPiatti(); }
  const f0 = p.pronto ? p.pronto.formato : p.formati[0].id, fp = p.formati.find(x => x.id === f0) || p.formati[0];
  const qp = p.pronto && p.pronto.giorno === oggi() ? p.pronto.qta : 0;
  const all = allergeniDi(tuttiIng(p));
  const mancano = [['t6', 'Teglia da 6'], ['t8', 'Teglia da 8'], ['kg', 'Al chilo'], ['pz', 'Al pezzo'], ['intera', 'Intera']].filter(([k]) => !p.formati.some(f => f.id === k));
  const parti = [];   // [chiave, titolo, riassunto, html della sezione]
  const breve = (t, n = 38) => t.length > n ? t.slice(0, n - 1) + '…' : t;
  let h = testataMonica(p.nome, 'piatti') + '<main class="corpo">';
  /* Mario 07/11: scheda del piatto «a prova di stupido» per Monica: un elenco di voci col valore di adesso; se ne apre una alla volta */
  h += `<section class="scheda"><label class="interr"><span>Nel menù<small>Spento: i clienti non lo vedono</small></span><input type="checkbox" data-campo="disp" data-id="${p.id}" ${p.disponibile ? 'checked' : ''}></label></section>`;
  parti.push(['foto', 'Foto', p.foto ? 'C\'è la foto' : 'Manca: tocca per aggiungerla', `<section class="scheda" style="padding:0;overflow:hidden">${foto(p, 'grande')}<div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:8px">
    <label class="btn chiaro pieno" for="file-foto">${ico('foto')}${p.foto ? 'Cambia la foto' : 'Aggiungi una foto'}</label><input type="file" id="file-foto" accept="image/*" class="nascosto" data-id="${p.id}">
    <span class="tenue piccolo">La foto viene migliorata da sola: più luce e colori caldi.</span>
    ${p.foto ? '<button type="button" class="link" data-a="togli-foto">Togli la foto</button>' : ''}</div></section>`]);
  parti.push(['pronto', 'Pronto subito oggi', qp ? `${fp.tipo === 'kg' ? NUM.format(qp) + ' kg' : qp} pronti oggi` : 'Nessuno pronto', `<section class="scheda"><h2>Pronto subito oggi</h2><p class="tenue" style="margin:0">Ne hai già pronto? Scrivi quanti: i clienti lo vedono in cima al menù e non devono prenotare.</p>
    ${p.formati.length > 1 ? `<div class="scelte">${p.formati.map(f => `<button type="button" class="scelta" data-a="p-pronto-formato" data-v="${f.id}" aria-pressed="${fp.id === f.id}">${esc(f.nome)}</button>`).join('')}</div>` : ''}
    <div class="fila">${passo('p-pronto', fp.tipo === 'kg' ? NUM.format(qp) + ' kg' : qp)}<span class="tenue">${qp ? 'Si azzera da solo domani.' : 'Nessuno pronto.'}</span></div></section>`]);
  parti.push(['nome', 'Nome e parte del menù', breve(`${p.nome} · ${(CATEGORIE.find(([k]) => k === p.cat) || ['', ''])[1]}`), `<section class="scheda"><h2>Nome</h2><input type="text" data-campo="p.nome" value="${esc(p.nome)}" aria-label="Nome del piatto">
    <label class="etichetta" for="p-sotto" style="font-weight:800">Una riga sotto il nome (se vuoi)</label><input type="text" id="p-sotto" data-campo="p.sotto" value="${esc(p.sotto)}" placeholder="es. da friggere a casa">
    <span class="etichetta" style="font-weight:800">Parte del menù</span><div class="scelte">${CATEGORIE.map(([k, n]) => `<button type="button" class="scelta" data-a="p-cat" data-v="${k}" aria-pressed="${p.cat === k}">${n}</button>`).join('')}</div></section>`]);
  parti.push(['prezzi', 'Prezzi e formati', breve(p.formati.map(f => `${f.nome}: ${euroBreve(f.prezzo)}`).join(' · '), 60), `<section class="scheda"><h2>Prezzi</h2>${p.formati.map(f => `<div class="formato-riga"><b>${esc(f.nome)}</b><input type="number" inputmode="decimal" step="0.5" min="0" data-campo="p.prezzo" data-f="${f.id}" value="${f.prezzo}" aria-label="Prezzo ${esc(f.nome)} in euro">
      ${p.formati.length > 1 ? `<button type="button" class="icona" data-a="p-formato-togli" data-f="${f.id}" aria-label="Togli ${esc(f.nome)}">${ico('cestino')}</button>` : '<span></span>'}</div>`).join('')}
    <span class="tenue piccolo">Prezzo in euro${p.formati.some(f => f.tipo === 'kg') ? ', al chilo' : ''}.</span>
    ${mancano.length ? `<span class="etichetta" style="font-weight:800">Aggiungi un formato</span><div class="scelte">${mancano.map(([k, n]) => `<button type="button" class="chip" data-a="p-formato-aggiungi" data-v="${k}">${ico('piu')}${n}</button>`).join('')}</div>` : ''}</section>`]);
  parti.push(['gusti', 'Gusti', p.varianti.length ? breve(`${p.varianti.length}: ${p.varianti.map(v => v.nome).join(', ')}`, 60) : 'Nessuno: tocca per aggiungerne', `<section class="scheda"><h2>Gusti</h2><p class="tenue" style="margin:0">Se il piatto ha più gusti (es. ricotta, spinaci), il cliente sceglie.</p>
    ${p.varianti.map(v => `<div class="scheda" style="box-shadow:none;background:#fff"><div class="fila" style="flex-wrap:nowrap"><input type="text" data-campo="v.nome" data-v="${v.id}" value="${esc(v.nome)}" aria-label="Nome del gusto">
      <button type="button" class="icona" data-a="v-togli" data-v="${v.id}" aria-label="Togli il gusto ${esc(v.nome)}">${ico('cestino')}</button></div>
      <label class="piccolo" style="font-weight:800">Prezzo diverso (${esc(p.formati[0].nome.toLowerCase())}, se serve)</label><input type="number" inputmode="decimal" step="0.5" data-campo="v.prezzo" data-v="${v.id}" value="${v.prezzi && v.prezzi[p.formati[0].id] != null ? v.prezzi[p.formati[0].id] : ''}" placeholder="uguale">
      <span class="piccolo" style="font-weight:800">Ingredienti in più</span>${editorIng(p, v.id)}</div>`).join('')}
    <button type="button" class="btn chiaro" data-a="v-aggiungi">${ico('piu')}Aggiungi un gusto</button></section>`]);
  parti.push(['ingredienti', 'Ingredienti e allergeni', all.length ? breve(all.map(a => NOME_ALL[a]).join(', '), 60) : 'Nessun allergene', `<section class="scheda"><h2>Ingredienti</h2>${editorIng(p, 'base')}
    <span class="etichetta" style="font-weight:800">Allergeni, calcolati da soli</span>${all.length ? `<div class="allergeni">${all.map(a => `<span>${NOME_ALL[a]}</span>`).join('')}</div>` : '<span class="tenue">Nessuno.</span>'}
    ${vegetariano(p) ? '<span class="eti veg" style="align-self:flex-start">Vegetariano: lo scrivo da solo nel menù</span>' : ''}</section>`]);
  parti.push(['dosi', 'Dosi e costo', 'Per la lista della spesa', sezioneDosi(p)]);
  parti.push(['richieste', 'Richieste veloci', p.note.length ? breve(p.note.join(', '), 60) : 'Nessuna', `<section class="scheda"><h2>Richieste veloci</h2><p class="tenue" style="margin:0">Tasti pronti per il cliente, es. «Poco sale».</p>
    <div class="ingr-lista">${p.note.map((n, i) => `<span class="chip">${esc(n)}<button type="button" data-a="nota-togli" data-i="${i}" aria-label="Togli ${esc(n)}">${ico('x')}</button></span>`).join('')}</div>
    <div class="fila" style="flex-wrap:nowrap"><input type="text" id="nota-nuova" placeholder="es. Senza cipolla" aria-label="Nuova richiesta veloce"><button type="button" class="btn piccolo" data-a="nota-aggiungi">Aggiungi</button></div></section>`]);
  const cot = [p.fritto ? `fritto +${euroBreve(p.fritto)}` : '', p.forno ? `al forno +${euroBreve(p.forno)}` : ''].filter(Boolean).join(' · ');
  parti.push(['fritto', 'Cotto da te', cot || 'No', `<section class="scheda"><h2>Cotto da te</h2><p class="tenue" style="margin:0">Quanto costa in più se il cliente lo vuole già cotto da te: una cifra sola, qualunque quantità prenda. Lascia 0 se quella cottura non la fai.</p>
    <div class="formato-riga"><b>Fritto: + euro</b><input type="number" inputmode="decimal" step="0.5" min="0" max="99" data-campo="p.fritto" value="${p.fritto || 0}" aria-label="Sovrapprezzo fritto in euro"><span></span></div>
    <div class="formato-riga"><b>Al forno: + euro</b><input type="number" inputmode="decimal" step="0.5" min="0" max="99" data-campo="p.forno" value="${p.forno || 0}" aria-label="Sovrapprezzo al forno in euro"><span></span></div></section>`]);
  parti.push(['casa', 'Come si prepara a casa', p.scalda ? breve(p.scalda, 60) : 'Non scritto', `<section class="scheda"><h2>Come si prepara a casa</h2><textarea data-campo="p.scalda" placeholder="es. Forno a 180 °C per 20 minuti" aria-label="Come si prepara a casa">${esc(p.scalda)}</textarea></section>`]);
  parti.push(['novita', 'Etichetta «Novità»', novita(p) ? 'Accesa' : 'Spenta', `<section class="scheda"><label class="interr"><span>Novità<small>Etichetta «Novità» per 2 settimane</small></span><input type="checkbox" data-campo="p.novita" ${novita(p) ? 'checked' : ''}></label></section>`]);
  const ordine = ['pronto', 'prezzi', 'gusti', 'foto', 'nome', 'ingredienti', 'dosi', 'richieste', 'fritto', 'casa', 'novita'];
  parti.sort((a, b) => ordine.indexOf(a[0]) - ordine.indexOf(b[0]));
  h += `<p class="tenue piccolo" style="margin:0">Tocca una voce per cambiarla. Si salva da sola.</p><div class="sez-lista">${parti.map(([k, t, r, x]) =>
    `<details class="sez" data-sez="${k}"${UI.sez === k ? ' open' : ''}><summary><span><b>${t}</b><small>${esc(r)}</small></span>${ico('indietro')}</summary>${x}</details>`).join('')}</div>`;
  h += p.controllato ? `<div class="avviso verde">${ico('spunta')}<div>Hai controllato ingredienti e allergeni.</div></div>`
    : `<div class="avviso"><div style="width:100%"><b>Questa è una mia bozza.</b> Controlla ingredienti, allergeni e istruzioni, poi tocca qui.<div class="fila" style="margin-top:10px"><button type="button" class="btn verde piccolo" data-a="controllato">${ico('spunta')}Ho controllato tutto</button></div></div></div>`;
  h += `<button type="button" class="btn chiaro pieno" data-a="anteprima">${ico('occhio')}Come lo vede il cliente</button>
    <button type="button" class="link" data-a="cestina" style="color:var(--allarme)">Sposta nel cestino</button>`;
  return h + '</main>';
}

function vNuovo() {
  const n = UI.nuovo;
  const punti = `<div class="punti">${[1, 2, 3, 4].map(i => `<i class="${i === n.passo ? 'on' : ''}"></i>`).join('')}</div>`;
  let h = `<header class="testata"><button type="button" class="indietro" data-a="${n.passo > 1 ? 'nuovo-indietro' : 'vai'}" data-v="piatti">${ico('indietro')}Indietro</button><div class="titolo"><b>Nuovo piatto</b><span>Passo ${n.passo} di 4</span></div></header><main class="corpo">${punti}`;
  if (n.passo === 1) h += `<h1>Come si chiama il piatto?</h1><input type="text" id="nuovo-nome" value="${esc(n.nome)}" placeholder="es. Lasagne al ragù" aria-label="Nome del piatto">
    <button type="button" class="btn pieno" data-a="nuovo-avanti">Avanti</button>`;
  if (n.passo === 2) h += `<h1>In quale parte del menù?</h1><div class="sezione">${CATEGORIE.map(([k, nn]) => `<button type="button" class="scelta" data-a="nuovo-cat" data-v="${k}" aria-pressed="${n.cat === k}" style="min-height:64px;font-size:1.1rem">${nn}</button>`).join('')}</div>`;
  if (n.passo === 3) h += `<h1>Come lo vendi?</h1><div class="sezione">${[['teglie', 'A teglie', 'da 6 e da 8 porzioni'], ['kg', 'Al chilo', 'es. polpette, ravioli'], ['pz', 'Al pezzo', 'es. panade'], ['intera', 'Intero', 'es. una crostata']].map(([k, a, b]) =>
    `<button type="button" class="scelta" data-a="nuovo-modo" data-v="${k}" aria-pressed="${n.modo === k}" style="min-height:64px">${a}<small>${b}</small></button>`).join('')}</div>`;
  if (n.passo === 4) {
    const campi = n.modo === 'teglie' ? [['t6', 'Teglia da 6'], ['t8', 'Teglia da 8']] : [[n.modo, { kg: 'Al chilo', pz: 'Al pezzo', intera: 'Intero' }[n.modo]]];
    h += `<h1>Quanto costa?</h1>${campi.map(([k, et]) => `<div class="gruppo"><label for="nuovo-${k}">${et}, in euro</label><input type="number" inputmode="decimal" step="0.5" min="0" id="nuovo-${k}" data-nuovo-prezzo="${k}" value="${n.prezzi[k] || ''}" placeholder="es. 20"></div>`).join('')}
      <button type="button" class="btn verde pieno" data-a="nuovo-crea">${ico('spunta')}Crea il piatto</button><span class="tenue piccolo">Dopo aggiungi foto e ingredienti.</span>`;
  }
  return h + '</main>';
}

/* Sì / No a un telefono nuovo (cliente nuovo o «telefono nuovo» di un cliente che c'è già) */
function bottoniRichiesta(r) {
  const occ = UI.decido === r.id ? ' disabled' : '';
  return `<div class="fila larga"><button type="button" class="btn verde" data-a="richiesta-si" data-id="${r.id}"${occ}>${ico('spunta')}${r.cliente ? 'Sì, ricollega' : 'Sì, può ordinare'}</button><button type="button" class="btn chiaro" data-a="richiesta-no" data-id="${r.id}"${occ}>No</button></div>`;
}
function vClienti() {
  const conta = id => S.ordini.filter(o => o.cliente === id && o.stato !== 'prova').length;
  const ordineDi = r => { const o = r.primo && ordine(r.primo); return o && o.stato === 'daApprovare' ? o : null; };
  const riga = r => { const o = ordineDi(r);
    return `<div class="gruppo" style="border-bottom:1px dashed var(--riga);padding-bottom:12px"><div><b>${esc(r.nome)}</b><br><span class="tenue piccolo">${r.cliente ? 'Dice che ha cambiato telefono' : r.tramite ? 'Amica di ' + esc(r.tramite) : 'Ha trovato il link'}
      · ${o ? `ha ordinato: ${euro(totale(prezziGiusti(o.righe)))}, ${o.pronto ? 'pronti subito' : 'entro ' + giornoLungo(o.entro)}` : 'non ha ancora ordinato'}</span></div>${bottoniRichiesta(r)}</div>`; };
  const nuovi = S.richieste.filter(r => !r.cliente), telefoni = S.richieste.filter(r => r.cliente), rifiutati = S.rifiutati || [];
  const rigaRifiutato = r => `<div class="fila" style="justify-content:space-between;border-bottom:1px dashed var(--riga);padding:8px 0"><b>${esc(r.nome)}</b>
    <button type="button" class="btn verde piccolo" data-a="rifiutato-si" data-id="${r.id}"${UI.decido === r.id ? ' disabled' : ''}>${ico('spunta')}Accetta</button></div>`;
  return `${testataMonica('Clienti', 'home')}<main class="corpo">
    ${telefoni.length ? `<section class="scheda"><h2>Telefono nuovo</h2><p class="tenue" style="margin:0">Hanno lo stesso nome di un tuo cliente. Se è proprio lei, ricollega: ritrova i suoi ordini.</p>${telefoni.map(riga).join('')}</section>` : ''}
    ${nuovi.length ? `<section class="scheda"><h2>Nuovi</h2><p class="tenue" style="margin:0">Se la conosci, dille di sì: vedrà l'indirizzo e potrà ordinare.</p>${nuovi.map(riga).join('')}</section>` : ''}
    <section class="scheda"><h2>Fai conoscere la tua cucina</h2><p class="tenue" style="margin:0">Manda il link a chi vuoi: vede il menù e al primo ordine scrive il suo nome. Poi decidi tu.</p>
      ${bottoneBiglietto('a', 'Manda l\'invito su WhatsApp', 'pieno')}
      <label class="interr"><span>Accetta clienti nuovi<small>Spento: chi ha il link vede il menù, ma non può fare il primo ordine.</small></span><input type="checkbox" data-campo="i.nuovi" ${S.impostazioni.nuovi !== false ? 'checked' : ''}></label></section>
    <section class="scheda"><h2>I tuoi clienti</h2>${S.clienti.map(c => `<div class="fila" style="justify-content:space-between;border-bottom:1px dashed var(--riga);padding:8px 0"><div><b>${esc(c.nome)}</b><br><span class="tenue piccolo">${c.invitato && !conta(c.id) ? 'Invitata, non ha ancora ordinato' : `${conta(c.id)} ordini · dal ${F_DATA.format(daIso(c.da))}`}</span></div></div>`).join('')}</section>
    ${rifiutati.length ? `<section class="scheda"><button type="button" class="link" data-a="rifiutati-apri" aria-expanded="${!!UI.rifiutati}" style="text-align:left">Persone rifiutate (${rifiutati.length}) ${UI.rifiutati ? '▲' : '▼'}</button>
      ${UI.rifiutati ? `<p class="tenue" style="margin:0">Hai detto di no a queste persone: non vedono l'indirizzo e non possono ordinare. Se hai sbagliato, tocca «Accetta»: da quel momento sono tue clienti.</p>${rifiutati.map(rigaRifiutato).join('')}` : ''}</section>` : ''}</main>`;
}

function sezioneDev() {
  if (!sviluppatore()) return '';
  const ultime = NOVITA.slice(0, UI.devTutte ? NOVITA.length : 3);
  return `<section class="scheda dev-scheda"><h2>Sviluppatore</h2>
    <p style="margin:0"><b>Versione ${VERSIONE_APP}</b> · ${esc(NOVITA[0].data)}</p>
    <p class="tenue piccolo" style="margin:0">La vedi solo tu, su questo telefono. Monica non vede niente di questa parte.</p>
    <button type="button" class="btn chiaro" data-a="dev-come" data-v="cliente">Guarda l'app come un cliente</button>
    ${Dati.attivo ? '<p class="tenue piccolo" style="margin:0">Barra «guarda come» in alto: scorri il dito da sinistra a destra in cima allo schermo (apre e chiude).</p>' : ''}
    <h3 style="margin:8px 0 0">Vapore dopo lo sblocco</h3>
    <div class="scelte">${Object.entries(Vapore.STILI).map(([k, n]) => `<button type="button" class="chip" data-a="dev-vapore" data-v="${k}" aria-pressed="${(P.vapore || 'A') === k}">${k} · ${n}</button>`).join('')}</div>
    <p class="tenue piccolo" style="margin:0">Tocca per vederlo e sceglierlo su questo telefono.</p>
    <h3 style="margin:8px 0 0">Novità</h3>
    ${ultime.map(n => `<div class="dev-nov"><b>${esc(n.v)} · ${esc(n.data)}</b>${[['nuovo', '✨ Nuovo'], ['migliorato', '⬆️ Migliorato'], ['corretto', '🔧 Corretto']].filter(([k]) => (n[k] || []).length).map(([k, t]) => `<div class="dev-tipo">${t}</div><ul>${n[k].map(c => `<li>${esc(c)}</li>`).join('')}</ul>`).join('')}</div>`).join('')}
    ${NOVITA.length > 3 && !UI.devTutte ? '<button type="button" class="link" data-a="dev-tutte">Tutte le novità</button>' : ''}
    <button type="button" class="link piccolo" data-a="dev-esci">Esci dalla modalità sviluppatore</button></section>`;
}
/* Solo per Mario (07/11): ordini fatti per provare → PROVA, in vista nelle Impostazioni, con conferma a foglio */
function schedaMario() {
  if (P.ruolo !== 'monica' || UI.devCliente || !puoSviluppare()) return '';
  const n = S.ordini.filter(o => !diProva(o)).length;
  return `<section class="scheda mario-scheda"><h2>Solo per te, Mario</h2>
    <p class="tenue piccolo" style="margin:0">La vedi solo tu. Monica non vede questa scheda.</p>
    ${n ? `<button type="button" class="btn chiaro" data-a="tutti-prova-apri">Segna come PROVA gli ordini fatti finora (${n})</button>`
      : '<p style="margin:0"><b>Tutti gli ordini sono già di PROVA.</b> Non contano negli incassi né nella spesa.</p>'}
    <label class="interr"><span>Aiutante AI per i clienti<small>${aiClientiOn() ? 'Acceso: tutti i clienti accettati lo trovano in cima al menù.' : 'Spento: i clienti non lo vedono. Tu lo provi da «guarda come» → cliente.'}</small></span><input type="checkbox" data-campo="i.aiClienti" ${aiClientiOn() ? 'checked' : ''}></label>
    ${contoAI()}</section>`;
}
/* domande all'AI di oggi (C50: Mario vuole capire i limiti). Il conto lo tiene il server; qui si chiede una volta ogni 2 minuti */
function contoAI() {
  const c = UI.contoAI;
  if (sulSito() && (!c || Date.now() - c.quando > 120000) && !UI.contoAIin) {
    UI.contoAIin = true;
    Dati.token().then(tok => tok && fetch('/api/conto-ai', { method: 'POST', headers: { authorization: 'Bearer ' + tok } })).then(r => r && r.ok ? r.json() : null)
      .then(j => { if (j) { UI.contoAI = Object.assign(j, { quando: Date.now() }); if (UI.vista === 'impostazioni') render(); } }).catch(() => {}).finally(() => { UI.contoAIin = false; });
  }
  const riga = c ? `Oggi: <b>${c.monica}</b> domande di chi gestisce (tetto ${c.tetti.monica}) · <b>${c.clienti}</b> dei clienti${c.persone ? ` (${c.persone} ${c.persone === 1 ? 'persona' : 'persone'})` : ''} (tetto ${c.tetti.clienti}, ${c.tetti.aCliente} a testa).` : sulSito() ? 'Conto delle domande di oggi: lo sto chiedendo…' : 'Il conto delle domande si vede nell\'app vera.';
  return `<p class="tenue piccolo" style="margin:0">${riga}<br>Limite gratuito vero: 10.000 «neuroni» al giorno per tutto l'account (si azzera all'una di notte, ora italiana). Una domanda ne usa circa 150-300: stima 30-60 risposte al giorno in tutto. Finiti: «riprova domani», nessun costo.</p>`;
}
function foglioTuttiProva() {
  const oo = S.ordini.filter(o => !diProva(o)).sort((x, y) => x.n - y.n), n = oo.length;
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro">
    <h1>${n === 1 ? 'Questo ordine diventa PROVA?' : `Questi ${n} ordini diventano PROVA?`}</h1>
    <ul class="lista-prova" style="margin:0;padding-left:20px">${oo.map(o => `<li><b>${esc(nomeBreve((cliente(o.cliente) || {}).nome || 'Cliente'))}</b> · ordine n. ${o.n}</li>`).join('')}</ul>
    <div class="avviso">${ico('occhio')}<div>Dopo, con il bollino <b>PROVA</b>:<br>· non contano negli <b>incassi</b><br>· non vanno nella <b>lista della spesa</b><br>· restano nello storico, non si cancellano.</div></div>
    <p class="tenue piccolo" style="margin:0">Se sbagli, subito dopo puoi toccare «Annulla».</p></div>
    <div class="piede"><button type="button" class="btn pieno" data-a="tutti-prova-si">Sì, segnali come PROVA</button><button type="button" class="btn chiaro pieno" data-a="chiudi">No, lascia così</button></div>`;
}
/* Impostazioni a voci (Mario 07/11, «va bene consiglio»): come la scheda del piatto, si vedono solo i titoli
   col riassunto; un tocco apre solo quella parte. Nessuna funzione tolta. */
function listaSez(parti) {
  return `<div class="sez-lista">${parti.map(([k, t, r, x]) =>
    `<details class="sez" data-sez="${k}"${UI.sez === k ? ' open' : ''}><summary><span><b>${t}</b><small>${esc(r)}</small></span>${ico('indietro')}</summary>${x}</details>`).join('')}</div>`;
}
function vImpostazioni() {
  const i = S.impostazioni;
  const sw = (campo, val, t, s) => `<label class="interr"><span>${t}${s ? `<small>${s}</small>` : ''}</span><input type="checkbox" data-campo="${campo}" ${val ? 'checked' : ''}></label>`;
  const data = g => g ? F_BREVE.format(daIso(g)) : '';
  const pagamenti = [i.paga.contanti && 'contanti', i.paga.bonifico && 'bonifico', i.paga.postepay && 'Postepay'].filter(Boolean).join(', ').replace(/^./, c => c.toUpperCase()) || 'Nessuno scelto';
  const tue = [
    ['imp-pausa', 'Pausa', i.pausa.attiva ? `In pausa${i.pausa.fino ? ' fino al ' + data(i.pausa.fino) : ''}` : 'Non sei in pausa', `<section class="scheda sez-dentro">${sw('i.pausa.attiva', i.pausa.attiva, 'Sono in pausa', 'I clienti ordinano solo per dopo')}
      ${i.pausa.attiva ? `<label for="pausa-fino" style="font-weight:800">Fino a (compreso)</label><input type="date" id="pausa-fino" data-campo="i.pausa.fino" value="${i.pausa.fino}">` : ''}</section>`],
    ['imp-pronti', 'Pronti subito', `Ritiro entro le ${i.prontiFino}`, `<section class="scheda sez-dentro"><label for="pronti-fino" style="font-weight:800">Ritiro entro le</label><input type="time" id="pronti-fino" data-campo="i.prontiFino" value="${esc(i.prontiFino)}"></section>`],
    ['imp-ritiro', 'Dove ritirano', i.ritiro.via ? [i.ritiro.via, i.ritiro.citta].filter(Boolean).join(', ') : 'Da scrivere', `<section class="scheda sez-dentro"><p class="tenue piccolo" style="margin:0">L'indirizzo di casa tua: lo vedono solo i clienti che hai accettato, con il pulsante della mappa.</p><label for="rit-via" style="font-weight:800">Via e numero</label><input type="text" id="rit-via" data-campo="i.ritiro.via" value="${esc(i.ritiro.via)}" placeholder="es. Via Roma 12" autocomplete="street-address"><label for="rit-citta" style="font-weight:800">Città</label><input type="text" id="rit-citta" data-campo="i.ritiro.citta" value="${esc(i.ritiro.citta)}" placeholder="es. Olbia">
      <label for="rit-nota" style="font-weight:800">Come trovarti</label><input type="text" id="rit-nota" data-campo="i.ritiro.nota" value="${esc(i.ritiro.nota)}" placeholder="es. citofono Rossi, 2° piano, portone verde"></section>`],
    ['imp-numeri', 'Numeri', i.whatsapp ? `WhatsApp ${i.whatsapp}` : 'Da scrivere', `<section class="scheda sez-dentro"><label for="n-wa" style="font-weight:800">WhatsApp di ${esc(cuoca())}<small class="tenue" style="display:block;font-weight:400">I clienti scrivono qui per gli ordini</small></label><input type="tel" id="n-wa" data-campo="i.whatsapp" value="${esc(i.whatsapp)}" placeholder="es. 333 123 4567">
      <label for="n-mario" style="font-weight:800">Numero di Mario<small class="tenue" style="display:block;font-weight:400">Per «Chiedi a Mario»: chi ha un problema con l'app scrive a lui</small></label><input type="tel" id="n-mario" data-campo="i.mario" value="${esc(i.mario)}" placeholder="es. 333 123 4567"></section>`],
    ['imp-paga', 'Pagamenti', pagamenti, `<section class="scheda sez-dentro">${sw('i.paga.contanti', i.paga.contanti, 'Contanti al ritiro')}${sw('i.paga.bonifico', i.paga.bonifico, 'Bonifico istantaneo')}
      ${i.paga.bonifico ? `<input type="text" data-campo="i.paga.iban" value="${esc(i.paga.iban)}" placeholder="IBAN, es. IT60 X054 2811 1010 0000 0123 456" aria-label="IBAN"><input type="text" data-campo="i.paga.intestataria" value="${esc(i.paga.intestataria)}" placeholder="Intestato a" aria-label="Intestato a">` : ''}
      ${sw('i.paga.postepay', i.paga.postepay, 'Postepay a Postepay')}${i.paga.postepay ? `<input type="tel" data-campo="i.paga.telefonoPostepay" value="${esc(i.paga.telefonoPostepay)}" placeholder="Numero collegato alla Postepay" aria-label="Numero Postepay">` : ''}</section>`],
    ['imp-vista', 'Testo grande e guida', P.grande ? 'Testo grande acceso' : 'Testo normale', `<section class="scheda"><label class="interr"><span>Testo grande<small>Per leggere meglio</small></span><input type="checkbox" data-campo="p.grande" ${P.grande ? 'checked' : ''}></label>
      <button type="button" class="link" data-a="rivedi-guida">Rivedi la guida</button></section>`]
  ];
  if (Dati.attivo) tue.push(['imp-gestori', 'Chi gestisce la cucina', 'Persone che entrano come te', chiGestisce()]);
  tue.push(['imp-notifiche', 'Notifiche', 'Avvisi degli ordini su questo telefono', cartaNotifica()]);
  if (Dati.attivo) tue.push(['imp-lucchetto', 'Lucchetto', 'Impronta o PIN per aprire la tua parte', vSicurezza()]);
  const rare = [
    ['imp-anticipo', 'Giorni di anticipo', i.anticipo === 0 ? 'Anche per oggi' : `${i.anticipo} ${i.anticipo === 1 ? 'giorno' : 'giorni'} prima`, `<section class="scheda sez-dentro"><p class="tenue" style="margin:0">Quanti giorni prima devono ordinare.</p>
      <div class="fila">${passo('i-anticipo', i.anticipo)}<span class="tenue">${i.anticipo === 0 ? 'anche per oggi' : i.anticipo === 1 ? 'giorno' : 'giorni'}</span></div></section>`],
    ['imp-limite', 'Limite della settimana', i.limite.attivo ? `${i.limite.teglie} teglie e torte` : 'Nessun limite', `<section class="scheda sez-dentro">${sw('i.limite.attivo', i.limite.attivo, 'Metti un limite', 'Arrivata al limite, i giorni di quella settimana si chiudono')}
      ${i.limite.attivo ? `<div class="fila">${passo('i-limite', i.limite.teglie)}<span class="tenue">teglie e torte a settimana</span></div>` : ''}</section>`],
    ['imp-natale', 'Menù di Natale', i.natale.attivo ? `Acceso${i.natale.entro ? ', ordini entro il ' + data(i.natale.entro) : ''}` : 'Spento', `<section class="scheda sez-dentro natale-imp">${sw('i.natale.attivo', i.natale.attivo, 'Mostra il menù di Natale', 'Compare in cima, con la sua data limite')}
      ${i.natale.attivo ? `<label for="natale-entro" style="font-weight:800">Ordini entro</label><input type="date" id="natale-entro" data-campo="i.natale.entro" value="${i.natale.entro}">
      <span class="etichetta" style="font-weight:800">Piatti del menù di Natale</span><div class="scelte">${visibili().map(p => `<button type="button" class="chip" data-a="natale-piatto" data-id="${p.id}" aria-pressed="${i.natale.piatti.includes(p.id)}">${esc(p.nome)}</button>`).join('')}</div>` : ''}</section>`]
  ];
  return `${testataMonica('Impostazioni', 'home')}<main class="corpo">
    ${schedaMario()}
    <p class="tenue piccolo" style="margin:0">Tocca una voce per cambiarla. Si salva da sola.</p>
    ${listaSez(tue)}
    <h3 class="tenue" style="margin:14px 0 0;font-size:.95rem">Si cambiano di rado · nel dubbio chiedi a Mario</h3>
    ${listaSez(rare)}
    ${sezioneDev()}
    ${Dati.attivo ? '' : '<button type="button" class="link" data-a="ricomincia" style="color:var(--allarme)">Ricomincia la prova da capo</button>'}</main>`;
}

function foglioPronti() {
  const lista = visibili().filter(p => p.disponibile);
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro"><h1>Cosa hai pronto oggi?</h1>
    <p class="tenue" style="margin:0">Metti quanti ne hai. I clienti li prendono senza prenotare. Domani si azzerano da soli.</p>
    ${lista.map(p => { const fId = p.pronto ? p.pronto.formato : p.formati[0].id, f = p.formati.find(x => x.id === fId) || p.formati[0], q = p.pronto && p.pronto.giorno === oggi() ? p.pronto.qta : 0;
      return `<div class="gruppo" style="border-bottom:1px dashed var(--riga);padding-bottom:12px"><b style="font-family:var(--display);font-size:1.05rem">${esc(p.nome)}</b>
        ${p.formati.length > 1 ? `<div class="scelte">${p.formati.map(x => `<button type="button" class="chip" data-a="pr-formato" data-id="${p.id}" data-v="${x.id}" aria-pressed="${x.id === f.id}">${esc(x.nome)}</button>`).join('')}</div>` : ''}
        ${passo('pr-qta', f.tipo === 'kg' ? NUM.format(q) + ' kg' : q, `data-id="${p.id}"`)}</div>`; }).join('')}</div>
    <div class="piede"><button type="button" class="btn pieno" data-a="chiudi">Fatto</button></div>`;
}
function foglioGiorni() {
  const { tipo, id } = UI.foglio, o = S.ordini.find(x => x.id === id);
  const teglie = o.righe.reduce((s, r) => s + (r.tipo === 'teglia' || r.tipo === 'intera' ? r.qta : 0), 0);
  const giorni = giorniPossibili(teglie, tipo === 'proponi' ? oggi() : null, o.id);
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro">
    <h1>${tipo === 'proponi' ? `Che giorno proponi a ${esc(nomeBreve(cliente(o.cliente).nome))}?` : 'Che giorno ti va bene?'}</h1>
    <div class="giorni">${giorni.map(({ g, no }) => { const d = daIso(g); return `<button type="button" class="giorno" data-a="scegli-giorno" data-v="${g}" aria-pressed="${UI.proposta === g}" ${no && tipo !== 'proponi' ? 'disabled' : ''}><small>${no && tipo !== 'proponi' ? no : F_GS.format(d)}</small><b>${d.getDate()}</b><small>${F_MESE.format(d)}</small></button>`; }).join('')}</div></div>
    <div class="piede"><button type="button" class="btn pieno" data-a="conferma-giorno" ${UI.proposta ? '' : 'disabled'}>${tipo === 'proponi' ? 'Manda la proposta' : 'Scegli questo giorno'}</button></div>`;
}

const GUIDA = [
  ['Qui arrivano gli ordini', 'Il numero ti dice quanti ne devi guardare.'],
  ['I tuoi piatti', 'In «I miei piatti» cambi foto, prezzi e ingredienti. Con «Segna cosa hai pronto» dici ai clienti cosa c\'è già.'],
  ['Non puoi rompere niente', 'Ogni modifica si salva da sola. Se sbagli, tocca «Annulla» in basso. Se ti blocchi, il punto di domanda in alto scrive a Mario.']
];
function guida() {
  const i = UI.guidaPasso, [t, d] = GUIDA[i];
  return `<div class="guida" role="dialog" aria-modal="true" aria-label="Guida"><div class="scheda"><div class="punti">${GUIDA.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
    <h2>${t}</h2><p style="margin:0">${d}</p><button type="button" class="btn pieno" data-a="guida-avanti">${i < GUIDA.length - 1 ? 'Avanti' : 'Ho capito'}</button></div></div>`;
}

/* ================= DISEGNO ================= */
function vistaCliente() {
  switch (UI.vista) {
    case 'carrello': return vCarrello();
    case 'inviato': return vInviato();
    case 'ordini': return vOrdiniCliente();
    case 'aiuto': return aiClientiVisibile() ? vAiutoCliente() : vMenu();
    case 'modifica': return UI.modifica ? vModifica() : vOrdiniCliente();
    default: return vMenu();
  }
}
function vistaMonica() {
  const [v, id] = UI.vista.split(':');
  switch (v) {
    case 'ordini': return vOrdiniMonica();
    case 'piatti': return vPiatti();
    case 'piatto': return vPiatto(id);
    case 'nuovo': return vNuovo();
    case 'clienti': return vClienti();
    case 'impostazioni': return vImpostazioni();
    case 'spesa': return vSpesa();
    case 'aiutante': return vAiutante();
    default: return vHome();
  }
}
let ultimaVista = '', ultimoFoglio = '';
function render() {
  document.documentElement.classList.toggle('grande', !!P.grande);
  const y = window.scrollY, f = $('.foglio'), fy = f ? f.scrollTop : 0;
  const attivo = document.activeElement && document.activeElement.id;
  const orizz = [...document.querySelectorAll('.giorni, .settimana, .scelte')].map(x => x.scrollLeft);   // file che scorrono di lato: restano dove erano (C31)
  const chiuso = statoLucchetto();   /* la parte di Monica col lucchetto: nessun dato nella pagina finché non si apre */
  const invito = !chiuso && P.invitoGestore && P.ruolo !== 'monica';
  const benv = !chiuso && (invito || serveBenvenuto());
  if (!chiuso) controllaRichieste();
  $('#app').innerHTML = striscia() + (chiuso ? vLucchetto(chiuso) : P.ruolo === 'monica' ? vistaMonica() : invito ? vInvitoGestore() : benv ? vBenvenuto() : vistaCliente()) + firma()
    + (UI.avvisoTesto && !chiuso ? `<div class="notifica" role="status"><img src="media/icon-192.png" alt=""><div><b>Dalla notifica</b><span>${esc(UI.avvisoTesto)}</span></div></div>` : '');
  $('#barra').innerHTML = P.ruolo === 'cliente' && !benv ? barraCliente() : '';
  $('#barra').classList.toggle('nascosto', P.ruolo !== 'cliente' || benv);
  document.body.classList.toggle('con-barra', P.ruolo === 'cliente' && !benv);
  const chiaveFoglio = UI.foglio ? UI.foglio.tipo + (UI.foglio.id || '') : '';
  let fh = '';
  if (UI.foglio && !chiuso) {
    const dentro = UI.foglio.tipo === 'spesa-ing' ? foglioSpesaIng() : UI.foglio.tipo === 'spesa-voce' ? foglioSpesaVoce() : UI.foglio.tipo === 'invito-img' ? foglioInvitoImg() : UI.foglio.tipo === 'menu-img' ? foglioMenuImg() : UI.foglio.tipo === 'etichette' ? foglioEtichette() : UI.foglio.tipo === 'piatto' ? foglioPiatto() : UI.foglio.tipo === 'pronti' ? foglioPronti() : UI.foglio.tipo === 'nome' ? foglioNome() : UI.foglio.tipo === 'allergie' ? foglioAllergie() : UI.foglio.tipo === 'richieste' ? foglioRichieste() : UI.foglio.tipo === 'tutti-prova' ? foglioTuttiProva() : foglioGiorni();
    fh = `<div class="velo" data-a="chiudi-fuori"><div class="foglio" role="dialog" aria-modal="true">${dentro}</div></div>`;
  }
  $('#foglio').innerHTML = fh;
  /* stesso foglio ridisegnato (più/meno, scelta del giorno): niente animazione d'entrata, resta fermo dov'era (Mario 07/11, C29 C31) */
  if (fh && chiaveFoglio === ultimoFoglio) { $('.velo').classList.add('fermo'); $('.foglio').scrollTop = fy; }
  document.querySelectorAll('.giorni, .settimana, .scelte').forEach((x, i) => { if (orizz[i]) x.scrollLeft = orizz[i]; });
  if (UI.tocco) { const [a, v] = UI.tocco.split('|'); document.querySelectorAll(`[data-a="${a}"][aria-pressed="true"]`).forEach(b => { if ((b.dataset.v || '') === v) b.classList.add('scatta'); }); UI.tocco = null; }
  if (UI.vista !== ultimaVista && $('main.corpo')) $('main.corpo').classList.add('entra');
  $('#guida').innerHTML = P.ruolo === 'monica' && !chiuso && !P.guida && UI.vista === 'home' ? guida() : '';
  document.body.style.overflow = UI.foglio ? 'hidden' : '';
  if (UI.vista === ultimaVista) window.scrollTo(0, y); else window.scrollTo(0, 0);
  if (UI.inCima) { UI.inCima = false; window.scrollTo(0, 0); }   // dopo il tocco su una notifica: si parte dall'alto
  if (attivo && document.getElementById(attivo) && /^(ing-|nota-nuova|ai-testo)/.test(attivo)) document.getElementById(attivo).focus();
  ultimaVista = UI.vista; ultimoFoglio = chiaveFoglio;
  if (chiuso === 'chiuso') setTimeout(provaApri, 0);
}

/* ================= AZIONI ================= */
function vai(v) {
  clearTimeout(tToast); $('#toast').innerHTML = ''; fnAnnulla = null;
  if (v === 'nuovo') UI.nuovo = { passo: 1, nome: '', cat: '', modo: '', prezzi: {} };
  if (v === 'ordini' && P.ruolo === 'monica') { UI.tab = daGuardare().length ? 'nuovi' : 'oggi'; UI.ordAperto = null; }
  UI.vista = v; UI.foglio = null; UI.salvato = false; render();
}
function aggiungiRiga(lista, r) {
  const k = x => [x.piatto, x.formato, x.variante, x.note.join(','), x.testo, !!x.pronto, !!x.fritto, !!x.forno].join('|');
  const c = lista.find(x => k(x) === k(r));
  if (c) c.qta = arrot(c.qta + r.qta); else lista.push(r);
}
function cambiaQta(r, d) {
  const p = piatto(r.piatto), f = p ? p.formati.find(x => x.id === r.formato) : null;
  const { min, passo: st } = f ? passoDi(f) : { min: 1, passo: 1 };
  let q = arrot(r.qta + d * st);
  if (r.pronto && p && p.pronto) q = Math.min(q, p.pronto.qta);
  return Math.max(min, q);
}
function notificaMonica() {
  const nuovi = S.ordini.filter(o => o.n > P.visti && (o.stato === 'nuovo' || o.stato === 'daApprovare'));
  P.visti = S.prossimoNumero - 1; salvaP();
  if (!nuovi.length) return;
  const o = nuovi[nuovi.length - 1], piu = nuovi.length > 1;
  const el = document.createElement('div');
  el.className = 'notifica'; el.setAttribute('role', 'status');
  el.innerHTML = `<img src="${LOGO}" alt=""><div><b>${piu ? `${nuovi.length} ordini nuovi` : `${o.stato === 'daApprovare' ? 'Cliente nuovo' : 'Nuovo ordine'}: ${esc(chiOrdina(o))}`}</b><span>${piu ? esc([...new Set(nuovi.map(chiOrdina))].join(', ')) + ' · ' + euro(nuovi.reduce((s, x) => s + totale(x.righe), 0)) : `${o.righe.length} ${o.righe.length === 1 ? 'piatto' : 'piatti'} · ${euro(totale(o.righe))} · ${o.pronto ? 'pronti subito' : 'entro ' + giornoLungo(o.entro)}`}</span></div>`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 5200);
}
const ordine = id => S.ordini.find(o => o.id === id);
function scegliIng(scope, testo) {
  const p = piatto(UI.vista.split(':')[1]);
  const lista = scope === 'base' ? p.ing : (p.varianti.find(v => v.id === scope).ing = p.varianti.find(v => v.id === scope).ing || []);
  const tutti = Object.assign({}, INGREDIENTI, S.ingExtra);
  const aggiunti = [];
  testo.split(/,|\n|;| e (?=[a-zà-ù])/i).map(t => t.trim()).filter(Boolean).forEach(t => {
    const nt = norm(t);
    let id = Object.keys(tutti).find(k => norm(tutti[k].n) === nt) || Object.keys(tutti).find(k => norm(tutti[k].n).startsWith(nt) || nt.startsWith(norm(tutti[k].n)));
    if (!id) {
      id = 'x-' + nt.replace(/[^a-z0-9]+/g, '-');
      if (!S.ingExtra[id]) S.ingExtra[id] = { n: t.charAt(0).toUpperCase() + t.slice(1), a: indovinaAllergeni(nt), m: /carn|poll|maial|manz|vitell|salsicc|prosciutt|pancett|speck|salam|agnell|strutt|tacchin|tonn|salmon|merluzz|acciug|pesce|baccal|gamber|cozz|vongol|calamar|polp/.test(nt) ? 1 : 0, nuovo: true };
    }
    if (!lista.includes(id)) { lista.push(id); aggiunti.push(ING(id).n); }
  });
  return aggiunti;
}
function indovinaAllergeni(t) {
  const r = [];
  const test = (re, a) => { if (re.test(t)) r.push(a); };
  test(/farin|pane|pasta|biscott|semol|gran|orzo|farro|segale|cracker|grissin/, 'glutine');
  test(/latt|formagg|burr|pann|mozzarell|ricott|parmig|pecorin|yogurt|mascarpon|scamorz|provol|fontina|stracchin/, 'latte');
  test(/uov/, 'uova');
  test(/noc|mandorl|nocciol|pistacch|anacard|pinol/, 'guscio');
  test(/arachid/, 'arachidi'); test(/soia/, 'soia'); test(/sedan/, 'sedano'); test(/senap/, 'senape'); test(/sesam/, 'sesamo');
  test(/gamber|scamp|aragost|granch/, 'crostacei'); test(/cozz|vongol|calamar|polp|seppi/, 'molluschi');
  test(/tonn|salmon|merluzz|acciug|pesce|baccal|alici/, 'pesce'); test(/vino|aceto|marsala/, 'solfiti'); test(/lupin/, 'lupini');
  return [...new Set(r)];
}

/* immagine del menù (Fase 3, C7): i piatti nel menù coi prezzi, da mandare su WhatsApp o negli stati */
function disegnaMenu() {
  const L = 1080, M = 70, cats = CATEGORIE.map(([k, n]) => [n, visibili().filter(p => p.cat === k && p.disponibile)]).filter(x => x[1].length);
  const prezzi = p => p.formati.map(f => `${f.nome.replace(/^Teglia /, '')} ${euroBreve(f.prezzo)}`).join(' · ');
  const c = document.createElement('canvas'), g = c.getContext('2d');
  const righe = cats.reduce((n, [, pp]) => n + 1 + pp.length, 0);
  c.width = L; c.height = 330 + righe * 64 + cats.length * 30 + 170;
  g.fillStyle = '#FBF5EA'; g.fillRect(0, 0, L, c.height);
  g.strokeStyle = '#7B2318'; g.lineWidth = 6; g.strokeRect(24, 24, L - 48, c.height - 48);
  g.textAlign = 'center'; g.fillStyle = '#7B2318';
  g.font = '600 76px Fraunces, Georgia, serif'; g.fillText('Pronti in Tavola', L / 2, 150);
  g.font = '700 34px "Nunito Sans", system-ui, sans-serif'; g.fillStyle = '#9A5B3C'; g.fillText('Il menù di Monica · Olbia · ' + giornoLungo(oggi()), L / 2, 205);
  let y = 290;
  cats.forEach(([nome, pp]) => {
    g.textAlign = 'left'; g.fillStyle = '#7B2318'; g.font = '600 46px Fraunces, Georgia, serif'; g.fillText(nome, M, y); y += 20;
    g.fillStyle = '#E7D6BE'; g.fillRect(M, y, L - 2 * M, 3); y += 52;
    pp.forEach(p => {
      g.fillStyle = '#2B1A12'; g.font = '700 34px "Nunito Sans", system-ui, sans-serif'; g.textAlign = 'left';
      let n = p.nome; while (g.measureText(n).width > 560 && n.length > 4) n = n.slice(0, -2) + '…';
      g.fillText(n, M, y);
      g.textAlign = 'right'; g.fillStyle = '#7B2318'; g.font = '700 30px "Nunito Sans", system-ui, sans-serif';
      let pr = prezzi(p); while (g.measureText(pr).width > 400 && pr.length > 4) pr = pr.slice(0, -2) + '…';
      g.fillText(pr, L - M, y); y += 64;
    });
    y += 30;
  });
  g.textAlign = 'center'; g.fillStyle = '#9A5B3C'; g.font = '700 32px "Nunito Sans", system-ui, sans-serif';
  g.fillText('Ordina da qui: ' + SITO.replace(/^https?:\/\//, '').replace(/\/$/, ''), L / 2, y + 40);
  return c;
}
async function mandaMenu() {
  const c = disegnaMenu();
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = blob && new File([blob], 'menu-pronti-in-tavola.png', { type: 'image/png' });
  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: 'Il menù di Monica: ' + SITO + '#da=monica' }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  UI.foglio = { tipo: 'menu-img', url: c.toDataURL('image/png') }; render();
}
function foglioMenuImg() {
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro"><h1>Il tuo menù</h1>
    <p class="tenue" style="margin:0">Tieni premuto sull'immagine per salvarla o condividerla${Dati.attivo ? ', oppure scaricala' : ''}.</p>
    <img src="${UI.foglio.url}" alt="Menù di Monica coi prezzi" style="width:100%;border-radius:12px;border:1px solid var(--riga)"></div>
    ${Dati.attivo ? `<div class="piede"><a class="btn pieno" href="${UI.foglio.url}" download="menu-pronti-in-tavola.png">Scarica l'immagine</a></div>` : ''}`;
}

/* ---------- etichette per le vaschette (A4, 10 per foglio da 105 x 57 mm) ---------- */
const ordiniDaCucinare = () => S.ordini.filter(o => o.stato === 'accettato' && !o.modifica && !o.archiviato);
function etichetteDi(giorno) {   // per prodotto, senza nome del cliente: le uguali stanno vicine e si stampano in serie (Mario 07/11)
  const gruppi = new Map();
  ordiniDaCucinare().filter(o => o.entro === giorno).forEach(o => o.righe.forEach(r => {
    const p = piatto(r.piatto), all = p ? allergeniDi(ingDi(p, r.variante)) : [];
    const pezzi = ['teglia', 'intera'].includes(r.tipo) && Number.isInteger(r.qta) && r.qta > 1 ? r.qta : 1;
    const e = { nome: r.nome, variante: r.varianteNome || '', qta: pezzi > 1 ? qtaTesto(r.tipo, 1, r.formatoNome) : qtaTesto(r.tipo, r.qta, r.formatoNome),
      note: [...(r.note || []), r.testo].filter(Boolean).join(' · '), all: all.map(x => NOME_ALL[x].toLowerCase()), scalda: (p && p.scalda) || '' };
    const k = [e.nome, e.variante, e.qta, e.note].join('|');
    if (!gruppi.has(k)) gruppi.set(k, { e, quante: 0 });
    gruppi.get(k).quante += pezzi;
  }));
  const out = [];
  [...gruppi.values()].sort((a, b) => a.e.nome.localeCompare(b.e.nome, 'it') || a.e.note.length - b.e.note.length)
    .forEach(g => { for (let i = 0; i < g.quante; i++) out.push(g.e); });
  return out.slice(0, 100);
}
const riassuntoEti = ee => { const m = new Map(); ee.forEach(e => { const t = [e.nome, e.variante, e.qta, e.note].filter(Boolean).join(' · '); m.set(t, (m.get(t) || 0) + 1); }); return [...m]; };
let LOGO_ETI = null;
const caricaLogoEti = async () => {   // logo e font devono essere pronti PRIMA di disegnare sul foglio
  try { await Promise.all(['700 40px Caveat', 'italic 600 34px Fraunces', '600 46px Fraunces', '700 26px "Nunito Sans"', '800 24px "Nunito Sans"', 'italic 700 18px "Nunito Sans"'].map(f => document.fonts.load(f))); } catch (e) { /* senza font resta quello di sistema */ }
  if (!LOGO_ETI) LOGO_ETI = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = LOGO; });
  return LOGO_ETI;
};
function disegnaEtichette(ee) {
  window.ETI_SCATOLE = [];
  const W = 1240, H = 1754, LW = 620, LH = 337, TOP = 35, FONT = '"Nunito Sans", system-ui, sans-serif', SERIF = 'Fraunces, Georgia, serif';
  const taglia = (g, t, max) => { t = String(t); while (g.measureText(t).width > max && t.length > 2) t = t.slice(0, -2) + '…'; return t; };
  const tondo = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const pagine = [];
  for (let k = 0; k < ee.length; k += 10) {
    const c = document.createElement('canvas'), g = c.getContext('2d');
    c.width = W; c.height = H; g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);
    ee.slice(k, k + 10).forEach((e, i) => {
      const x = (i % 2) * LW, y = TOP + Math.floor(i / 2) * LH;
      g.setLineDash([10, 8]); g.strokeStyle = '#E2D3BC'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, LW - 2, LH - 2); g.setLineDash([]);   // riga da ritagliare
      g.save(); tondo(g, x + 10, y + 10, LW - 20, LH - 20, 22); g.clip();   // trama sarda «a pibiones», appena visibile (come lo sfondo dell'app)
      g.fillStyle = '#FFFBF3'; g.fillRect(x, y, LW, LH); g.fillStyle = 'rgba(123,35,24,.07)';
      for (let py = 0; py < LH; py += 36) for (let px = 0; px < LW; px += 36) [[18, 4], [25, 11], [32, 18], [25, 25], [18, 32], [11, 25], [4, 18], [11, 11]].forEach(([dx, dy]) => { g.beginPath(); g.arc(x + px + dx, y + py + dy, 1.5, 0, 7); g.fill(); });
      g.restore();
      g.strokeStyle = '#B5482F'; g.lineWidth = 3; tondo(g, x + 10, y + 10, LW - 20, LH - 20, 22); g.stroke();
      g.save(); g.strokeStyle = '#B5482F'; g.globalAlpha = .75; g.lineWidth = 2.4; g.lineCap = 'round'; g.setLineDash([9, 7]);   // cucitura da sarta
      tondo(g, x + 21, y + 21, LW - 42, LH - 42, 13); g.stroke(); g.restore();
      // zona utile: dentro la cucitura, con margine
      const X0 = x + 40, X1 = x + LW - 40, Y0 = y + 38, Y1 = y + LH - 36, LGW = 92, LGH = 100, LGX = X1 - LGW, LGB = Y0 + LGH;
      if (LOGO_ETI) g.drawImage(LOGO_ETI, LGX, Y0 - 4, LGW, LGH);
      const alto = f => { g.font = f; const m = g.measureText('ÀÈHgjpq'); return [m.actualBoundingBoxAscent, m.actualBoundingBoxDescent]; };
      // riga in basso: firma a destra, consiglio di cottura a sinistra, mai sotto la firma
      const fFirma = '700 40px Caveat, "Segoe Script", "Brush Script MT", "Snell Roundhand", cursive';
      g.font = fFirma; const largFirma = g.measureText('Buon appetito').width + 46, [aF, dF] = alto(fFirma);
      const baseFirma = Y1 - dF, cimaFirma = baseFirma - aF;
      const fCott = `italic 700 17px ${FONT}`, largCott = X1 - X0 - largFirma - 20; let righeCott = [];
      if (e.scalda) { g.font = fCott; let r = ''; ('Scalda: ' + e.scalda).split(' ').forEach(w => { const t = r ? r + ' ' + w : w; if (g.measureText(t).width > largCott && r) { righeCott.push(r); r = w; } else r = t; }); righeCott.push(r);
        if (righeCott.length > 2) { righeCott = righeCott.slice(0, 2); righeCott[1] = taglia(g, righeCott[1] + '…', largCott); } }
      const [aC, dC] = alto(fCott), passoC = aC + dC + 5, cimaCott = righeCott.length ? Y1 - dC - (righeCott.length - 1) * passoC - aC : Y1;
      const fondo = Math.min(cimaFirma, cimaCott) - 10;   // il testo sopra non scende oltre qui
      // righe di sopra: si misurano, si stringono se serve, poi si distribuisce l'aria che avanza
      const impagina = (sc, aria) => {
        const pos = []; let cur = Y0;
        const metti = (t, f, col, gap, opz = {}) => {
          let fz = f; const [a, d] = alto(fz); let cima = cur + (pos.length ? gap + aria : 0);
          let larg = (cima < LGB + 6 ? LGX - 16 : X1) - X0;
          if (opz.stringi) { let k = 1; while (k > .62) { g.font = fz; if (g.measureText(t).width <= larg) break; k -= .04; fz = f.replace(/(\d+(\.\d+)?)px/, (m0, n) => (n * k).toFixed(1) + 'px'); } }
          const [a2, d2] = alto(fz); larg = (cima < LGB + 6 ? LGX - 16 : X1) - X0;
          pos.push({ t, f: fz, col, base: cima + a2, larg, avvolgi: opz.avvolgi }); cur = cima + a2 + d2;
        };
        metti(e.nome, `600 ${44 * sc}px ${SERIF}`, '#7B2318', 0, { stringi: true });
        metti([e.variante, e.qta].filter(Boolean).join(' · '), `700 ${25 * sc}px ${FONT}`, '#5B4636', 10 * sc);
        if (e.note) metti(e.note, `800 ${23 * sc}px ${FONT}`, '#A0451F', 9 * sc);
        if (e.all.length) {
          const f = `800 ${22 * sc}px ${FONT}`; g.font = f; const parole = ('Contiene: ' + e.all.join(', ')).split(' '); let r = '', n = 0; const righe = [];
          parole.forEach(w => { const t = r ? r + ' ' + w : w; if (g.measureText(t).width > X1 - X0 && r && n < 1) { righe.push(r); n++; r = w; } else r = t; }); righe.push(r);
          righe.forEach((t, k) => metti(t, f, '#B3261E', k ? 3 * sc : 9 * sc));
        }
        return { pos, fine: cur };
      };
      let sc = 1, lay = impagina(sc, 0);
      while (lay.fine > fondo && sc > .66) { sc -= .03; lay = impagina(sc, 0); }
      const spazi = lay.pos.length - 1, avanza = fondo - lay.fine;
      if (avanza > 0 && spazi > 0) lay = impagina(sc, Math.min(10, avanza / spazi));
      g.textAlign = 'left';
      const box = [{ n: 'logo', x0: LGX, x1: LGX + LGW, y0: Y0 - 4, y1: Y0 - 4 + LGH }], misura = (n, t, x0, base, dx) => { const m = g.measureText(t); box.push({ n, x0: dx ? x0 - m.width : x0, x1: dx ? x0 : x0 + m.width, y0: base - m.actualBoundingBoxAscent, y1: base + m.actualBoundingBoxDescent }); };
      lay.pos.forEach(r => { g.font = r.f; g.fillStyle = r.col; const t = taglia(g, r.t, r.larg); g.fillText(t, X0, r.base); misura(r.t, t, X0, r.base); });
      g.font = fCott; g.fillStyle = '#6B5646';
      righeCott.forEach((t, k) => { const b = Y1 - dC - (righeCott.length - 1 - k) * passoC; g.fillText(t, X0, b); misura('cottura', t, X0, b); });
      g.fillStyle = '#B5482F'; g.font = fFirma; g.textAlign = 'right';   // la firma di Monica, a mano
      const fx = X1 - 38; g.fillText('Buon appetito', fx, baseFirma); misura('firma', 'Buon appetito', fx, baseFirma, true); box[box.length - 1].x1 = X1;   // cuoricino staccato dalla scritta, dentro il margine
      box.forEach(b => Object.assign(b, { X0, X1, Y0: Y0 - 4, Y1 })); (window.ETI_SCATOLE = window.ETI_SCATOLE || []).push(box);   // per la prova: niente si sovrappone
      g.save(); g.translate(fx + 10, baseFirma - 22); g.beginPath(); g.moveTo(10, 20); g.bezierCurveTo(-8, 8, 0, -6, 10, 3); g.bezierCurveTo(20, -6, 28, 8, 10, 20); g.fill(); g.restore();
    });
    pagine.push(c);
  }
  return pagine;
}
async function apriEtichette(giorno) {
  const giorni = [...new Set(ordiniDaCucinare().map(o => o.entro))].sort();
  if (!giorni.length) return;
  if (!giorni.includes(giorno)) giorno = giorni[0];
  const ee = etichetteDi(giorno); await caricaLogoEti();
  UI.foglio = { tipo: 'etichette', giorni, giorno, quante: ee.length, conti: riassuntoEti(ee), url: disegnaEtichette(ee).map(c => c.toDataURL('image/png')) };
  render();
}
async function mandaEtichette() {
  const ff = await Promise.all(UI.foglio.url.map(async (u, i) => new File([await (await fetch(u)).blob()], `etichette-${UI.foglio.giorno}-${i + 1}.png`, { type: 'image/png' })));
  try { if (navigator.canShare && navigator.canShare({ files: ff })) await navigator.share({ files: ff }); } catch (e) { /* annullato */ }
}
function foglioEtichette() {
  const f = UI.foglio, fogli = f.url.length;
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro"><h1>Etichette per le vaschette</h1>
    ${f.giorni.length > 1 ? `<div class="fila" style="flex-wrap:wrap;gap:8px">${f.giorni.map(g => `<button type="button" class="chip" data-a="eti-giorno" data-v="${g}" aria-pressed="${g === f.giorno}">${maiuscola(giornoLungo(g))}</button>`).join('')}</div>` : `<p style="margin:0"><b>${maiuscola(giornoLungo(f.giorno))}</b></p>`}
    <p class="tenue" style="margin:0">${f.quante} ${f.quante === 1 ? 'etichetta' : 'etichette'}, ${fogli} ${fogli === 1 ? 'foglio' : 'fogli'} A4. Le etichette uguali sono vicine, una per vaschetta, senza nome: vanno bene per chiunque. Stampa su fogli adesivi da 10 (105 × 57 mm) oppure su carta normale e ritaglia lungo le righe. Tieni premuto su un foglio per salvarlo o condividerlo.</p>
    <ul style="margin:0;padding-left:20px">${(f.conti || []).map(([t, n]) => `<li><b>${n}</b> × ${esc(t)}</li>`).join('')}</ul>
    ${f.url.map((u, i) => `<img src="${u}" alt="Foglio ${i + 1} delle etichette" style="width:100%;border-radius:8px;border:1px solid var(--riga);background:#fff">`).join('')}</div>
    ${Dati.attivo && navigator.canShare ? `<div class="piede"><button type="button" class="btn pieno" data-a="eti-manda">Condividi per stampare</button></div>` : ''}`;
}

const A = {
  'menu-immagine'() { mandaMenu(); },
  'notifica-prova'() { provaNotifica(); },
  'avvisi-attiva'() { attivaAvvisi(); },
  'avvisi-cliente'() { attivaAvvisiCliente(); },
  'sel-fritto'(el) { UI.sel.fritto = el.dataset.v === 'si'; UI.sel.forno = el.dataset.v === 'forno'; render(); },
  'passi-app'() { UI.passiApp = !UI.passiApp; render(); },
  'passi-via'() { UI.passiVia = true; render(); },
  'inv-manda'(el) { mandaInvito(el.dataset.v || 'g'); },
  async 'inv-condividi'() { try { await navigator.share({ files: [UI.invFile], text: testoInvitoGestore(UI.invTipo) }); chiudiFoglio(); } catch (e) { /* annullato */ } },
  etichette() { apriEtichette(); },
  'eti-giorno'(el) { apriEtichette(el.dataset.v); },
  'eti-manda'() { mandaEtichette(); },
  annulla() { if (fnAnnulla) { const f = fnAnnulla; fnAnnulla = null; $('#toast').innerHTML = ''; f(); } },
  async 'nome-ok'() {
    const i = $('#nome-nuovo'), nome = (i ? i.value : '').trim().replace(/\s+/g, ' ');
    if (nome.length < 3 || !nome.includes(' ')) { mostraToast('Scrivi nome e cognome.'); if (i) i.focus(); return; }
    try { await Dati.registra(nome, P.tramite || '', false); UI.foglio = null; inviaVero(); } catch (e) { erroreNome(e, nome); }
  },
  async 'nome-ricollega'() {
    try { await Dati.registra(UI.foglio.usato, P.tramite || '', true); UI.foglio = null; inviaVero(); } catch (e) { erroreNome(e); }
  },
  'benv-entra'() { benvEntra(false); },
  'benv-ricollega'() { benvEntra(true); },
  'benv-altro'() { UI.benv.usato = ''; render(); const i = $('#benv-cognome'); if (i) i.focus(); },
  'benv-guarda'() { UI.senzaNome = true; render(); },
  'nome-altro'() { UI.foglio = { tipo: 'nome' }; render(); const i = $('#nome-nuovo'); if (i) i.focus(); },
  async 'inv-google'() {
    if (!Dati.attivo) { mostraToast('Nell\'anteprima non si entra con Google: prova sul sito vero.'); return; }
    UI.invInvio = true; render();
    try { await Dati.entraGoogle(); await Dati.chiediGestore(); }
    catch (e) { mostraToast(e.code === 'unavailable' ? 'Manca la rete: riprova appena torna.' : 'Accesso non riuscito. Riprova.'); }
    UI.invInvio = false; render();
  },
  async installa() {
    if (!installa) return;
    const e = installa; installa = null;
    await e.prompt(); const r = await e.userChoice.catch(() => null);
    if (r && r.outcome === 'accepted') { P.installata = true; salvaP(); }
    render();
  },
  'home-no'() { P.homeNo = true; salvaP(); render(); },
  async 'inv-chiedi'() {
    UI.invInvio = true; render();
    try { await Dati.chiediGestore(); } catch (e) { mostraToast(e.code === 'unavailable' ? 'Manca la rete: riprova appena torna.' : 'Non è partita. Riprova tra poco.'); }
    UI.invInvio = false; render();
  },
  async 'inv-altro'() { await Dati.esci().catch(() => {}); location.reload(); },
  async 'gest-si'(el) { return decidiGestore(el.dataset.id, true); },
  async 'gest-no'(el) { return decidiGestore(el.dataset.id, false); },
  async 'gest-togli'(el) {
    const id = el.dataset.id;
    if (UI.gestTogli !== id) { UI.gestTogli = id; render(); setTimeout(() => { if (UI.gestTogli === id) { UI.gestTogli = null; render(); } }, 5000); return; }
    UI.gestTogli = null;
    try { await Dati.togliGestore(id); mostraToast('Tolto: non gestisce più la cucina.'); } catch (e) { mostraToast(e.code === 'unavailable' ? 'Manca la rete: riprova appena torna.' : 'Non è andata. Riprova tra poco.'); }
    render();
  },
  'entra-monica'() { Dati.entraGoogle().catch(() => mostraToast('Accesso non riuscito. Riprova.')); },
  ruolo(el) { P.ruolo = el.dataset.v; salvaP(); UI.foglio = null; UI.modifica = null; vai(P.ruolo === 'monica' ? 'home' : 'menu'); if (P.ruolo === 'monica') notificaMonica(); },
  vai(el) { vai(el.dataset.v); },
  cat(el) { UI.cat = el.dataset.v; const t = document.getElementById('cat-' + el.dataset.v); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.querySelectorAll('[data-a="cat"]').forEach(b => b.setAttribute('aria-pressed', b === el)); },
  piatto(el) { apriPiatto(el.dataset.id, !!el.dataset.pronto); },
  chiudi() { chiudiFoglio(); },
  'apri-allergie'() { UI.foglio = { tipo: 'allergie' }; render(); },
  'testo-grande'() { P.grande = !P.grande; salvaP(); render(); mostraToast(P.grande ? 'Testo grande' : 'Testo normale'); },
  'chiudi-fuori'(el, e) { if (e.target === el) A.chiudi(); },
  'sel-var'(el) { UI.sel.variante = el.dataset.v; render(); },
  'sel-formato'(el) { const p = piatto(UI.foglio.id), f = p.formati.find(x => x.id === el.dataset.v); UI.sel.formato = f.id; UI.sel.qta = f.tipo === 'kg' || f.tipo === 'pz' ? passoDi(f).min : 1; render(); },
  'sel-qta'(el) {
    const p = piatto(UI.foglio.id), f = p.formati.find(x => x.id === UI.sel.formato), { min, passo: st } = passoDi(f);
    let q = arrot(UI.sel.qta + Number(el.dataset.d) * st);
    if (UI.foglio.pronto) q = Math.min(q, p.pronto.qta);
    UI.sel.qta = Math.max(Math.min(min, UI.foglio.pronto ? p.pronto.qta : min), q); render();
  },
  'sel-nota'(el) { const n = el.dataset.v, s = UI.sel.note; UI.sel.note = s.includes(n) ? s.filter(x => x !== n) : [...s, n]; el.setAttribute('aria-pressed', UI.sel.note.includes(n)); },
  aggiungi(el) {
    if (!UI.foglio) return;
    const p = piatto(UI.foglio.id), s = UI.sel, f = p.formati.find(x => x.id === s.formato), v = p.varianti.find(x => x.id === s.variante);
    const r = { piatto: p.id, nome: p.nome, formato: f.id, formatoNome: f.nome, tipo: f.tipo, variante: v ? v.id : '', varianteNome: v ? v.nome : '', qta: s.qta, prezzo: prezzoDi(p, f.id, s.variante), note: s.note.slice(), testo: s.testo.trim(), pronto: !!UI.foglio.pronto, fritto: !!(s.fritto && p.fritto > 0), frittoPrezzo: s.fritto && p.fritto > 0 ? p.fritto : 0, forno: !!(s.forno && !s.fritto && p.forno > 0), fornoPrezzo: s.forno && !s.fritto && p.forno > 0 ? p.forno : 0 };
    if (UI.modifica) { delete r.pronto; aggiungiRiga(UI.modifica.righe, r); UI.foglio = null; UI.vista = 'modifica'; render(); mostraToast(`Aggiunto alla modifica: ${p.nome}`); return; }
    aggiungiRiga(P.carrello, r); salvaP();
    const da = el.getBoundingClientRect();
    chiudiFoglio(() => { vola(da); mostraToast(`Nel carrello: ${p.nome}`); });
  },
  'c-qta'(el) { const r = P.carrello[el.dataset.i]; r.qta = cambiaQta(r, Number(el.dataset.d)); salvaP(); render(); },
  'c-togli'(el) {
    const prima = JSON.stringify(P.carrello), r = P.carrello[el.dataset.i];
    P.carrello.splice(Number(el.dataset.i), 1); salvaP(); render();
    mostraToast(`Tolto: ${r.nome}`, () => { P.carrello = JSON.parse(prima); salvaP(); render(); });
  },
  entro(el) { UI.entro = el.dataset.v; render(); },
  metodo(el) { UI.metodo = el.dataset.v; render(); },
  invia() {
    if (UI.devCliente && Dati.attivo) { P.carrello = []; UI.entro = null; UI.nota = ''; UI.prova = undefined; salvaP(); mostraToast('Modalità sviluppatore: ordine NON inviato a Monica. Per un ordine vero usa un altro telefono.'); vai('inviato'); return; }
    if (sceltaManca()) { mostraToast('Scegli prima: ordini davvero o stai provando l\'app?'); return; }
    if (Dati.attivo) { inviaVero(); return; }
    const c = P.carrello, pronti = c.filter(r => r.pronto), dopo = c.filter(r => !r.pronto);
    for (const r of pronti) {
      const p = piatto(r.piatto);
      if (!p.pronto || p.pronto.giorno !== oggi() || p.pronto.qta < r.qta) { mostraToast(`${r.nome}: ne restano ${p.pronto ? p.pronto.qta : 0}. Cambia la quantità.`); return; }
    }
    const nuovo = (righe, entro, pronto) => {
      const o = { id: 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), n: S.prossimoNumero++, cliente: P.cliente, righe: righe.map(r => { const x = Object.assign({}, r); delete x.pronto; return x; }), entro, stato: 'nuovo', pronto, paga: { metodo: UI.metodo || 'contanti', dice: false, ricevuto: false }, nota: UI.nota.trim(), creato: oggi(), tempi: { nuovo: Date.now() }, cuori: {} };
      if (UI.prova === true && puoProvare()) Object.assign(o, { prova: true, provaCliente: true });
      S.ordini.push(o);
    };
    if (dopo.length) nuovo(dopo, UI.entro, false);
    if (pronti.length) { nuovo(pronti, oggi(), true); pronti.forEach(r => { const p = piatto(r.piatto); p.pronto.qta = arrot(p.pronto.qta - r.qta); }); }
    P.carrello = []; UI.entro = null; UI.nota = ''; UI.prova = undefined; salva(); salvaP(); vai('inviato');
  },
  modifica(el) { const o = ordine(el.dataset.id); UI.modifica = { ordine: o.id, righe: JSON.parse(JSON.stringify(o.righe)) }; vai('modifica'); },
  'modifica-esci'() { UI.modifica = null; vai('ordini'); },
  'm-qta'(el) { const r = UI.modifica.righe[el.dataset.i]; r.qta = cambiaQta(r, Number(el.dataset.d)); render(); },
  'm-togli'(el) { UI.modifica.righe.splice(Number(el.dataset.i), 1); render(); },
  'modifica-invia'() {
    const o = ordine(UI.modifica.ordine), righe = UI.modifica.righe;
    if (JSON.stringify(o.righe) === JSON.stringify(righe)) { mostraToast('Non hai cambiato niente.'); return; }
    UI.modifica = null; UI.vista = 'ordini';
    cambia('Modifica inviata a Monica', () => { o.modifica = { righe, il: oggi() }; o.esitoModifica = ''; }, false);
    avvisaGestori('modifica');
  },
  'firma-tocco'(el, e) {
    if (e && e.target.closest('button')) return;
    if (!puoSviluppare() || P.sviluppatore) return;
    const t = Date.now(); UI.firmaTocchi = (UI.firmaTocchi || []).filter(x => t - x < 4000).concat(t);
    const manca = 7 - UI.firmaTocchi.length;
    if (manca <= 0) { P.sviluppatore = true; UI.firmaTocchi = []; salvaP(); render(); mostraToast('Ora sei sviluppatore: la trovi in Impostazioni. Barra in alto: scorri il dito da sinistra a destra in cima.'); }
    else if (manca <= 3) mostraToast(manca === 1 ? 'Ancora 1 tocco per la modalità sviluppatore' : `Ancora ${manca} tocchi per la modalità sviluppatore`);
  },
  'dev-come'(el) {
    UI.devCliente = el.dataset.v === 'cliente'; UI.foglio = null; UI.modifica = null;
    if (Dati.attivo) P.ruolo = UI.devCliente ? 'cliente' : 'monica'; else { P.ruolo = UI.devCliente ? 'cliente' : 'monica'; salvaP(); }
    vai(UI.devCliente ? 'menu' : 'home');
  },
  'tutti-prova-apri'() { UI.foglio = { tipo: 'tutti-prova' }; render(); },
  'tutti-prova-si'() {
    if (!puoSviluppare()) return;
    const oo = S.ordini.filter(o => !diProva(o)); UI.foglio = null;
    cambia(`${oo.length} ${oo.length === 1 ? 'ordine segnato' : 'ordini segnati'} come PROVA: non contano più negli incassi né nella spesa`, () => { oo.forEach(o => { o.prova = true; }); });
  },
  'dev-vapore'(el) { P.vapore = el.dataset.v; salvaP(); render(); Vapore.parti(P.vapore); },
  'dev-tutte'() { UI.devTutte = true; render(); },
  'dev-esci'() { P.sviluppatore = false; UI.devCliente = false; salvaP(); render(); mostraToast('Modalità sviluppatore spenta.'); },
  'ordine-prova'(el) { UI.prova = !!el.dataset.v; render(); },
  'ord-prova'(el) {
    const id = el.dataset.id;
    if (UI.provaSi !== id) { UI.provaSi = id; render(); clearTimeout(A._prova); A._prova = setTimeout(() => { if (UI.provaSi === id) { UI.provaSi = null; render(); } }, 4000); return; }
    UI.provaSi = null; const o = ordine(id);
    cambia(FINITI.includes(o.stato) ? 'Spostato negli ordini di prova (in fondo allo Storico)' : 'Segnato come PROVA: non conta negli incassi né nella spesa', () => { o.prova = true; });
  },
  'arch-prova'(el) {
    const id = el.dataset.id;
    if (UI.archSi !== id) { UI.archSi = id; render(); clearTimeout(A._arch); A._arch = setTimeout(() => { if (UI.archSi === id) { UI.archSi = null; render(); } }, 4000); return; }
    UI.archSi = null; const oo = id === 'tutte' ? proveDaArchiviare() : [ordine(id)].filter(Boolean);
    if (UI.ordAperto && oo.some(o => o.id === UI.ordAperto)) UI.ordAperto = null;
    cambia(oo.length === 1 ? 'Prova archiviata' : `${oo.length} prove archiviate`, () => { oo.forEach(o => { o.archiviato = true; }); });
  },
  'vedi-arch'() { UI.vediArch = !UI.vediArch; render(); },
  'disarch'(el) { const o = ordine(el.dataset.id); if (o) cambia('Prova ripristinata', () => { o.archiviato = false; }); },
  'ord-vero'(el) {
    const o = ordine(el.dataset.id);
    cambia('Rimesso tra gli ordini veri', () => { o.prova = false; o.provaCliente = false; if (o.stato !== 'prova') return; o.stato = o.statoPrima || 'ritirato'; delete o.statoPrima; if (!FINITI.includes(o.stato)) riprendiPronti(o); });
  },
  'annulla-ordine'(el) { const o = ordine(el.dataset.id); cambia('Ordine annullato', () => { o.stato = 'annullato'; rimettiPronti(o); }); },
  'proposta-si'(el) { const o = ordine(el.dataset.id); cambia('Perfetto, giorno confermato', () => { o.entro = o.proposta; o.proposta = null; o.stato = 'accettato'; }, false); avvisaGestori('risposta'); },
  'proposta-altro'(el) { UI.foglio = { tipo: 'giorno', id: el.dataset.id }; UI.proposta = null; render(); },
  proponi(el) { UI.foglio = { tipo: 'proponi', id: el.dataset.id }; UI.proposta = null; render(); },
  'scegli-giorno'(el) { UI.proposta = el.dataset.v; render(); },
  'conferma-giorno'() {
    const { tipo, id } = UI.foglio, o = ordine(id), g = UI.proposta;
    UI.foglio = null; UI.proposta = null;
    if (tipo === 'proponi') {
      if (!o || !['nuovo', 'accettato'].includes(o.stato)) { mostraToast('Aspetta un attimo e riprova: l\'ordine si sta aggiornando'); render(); return; }
      cambia(`Proposta mandata: ${giornoLungo(g)}`, () => { if (daAccettare(o)) o.righe = prezziGiusti(o.righe); o.proposta = g; o.stato = 'proposta'; });
      avvisaCliente(o, 'proposta');
    }
    else { cambia('Nuovo giorno mandato a Monica', () => { o.entro = g; o.proposta = null; o.stato = 'nuovo'; }, false); avvisaGestori('risposta'); }
  },
  'ho-pagato'(el) { const o = ordine(el.dataset.id); cambia('Grazie! Monica controlla e conferma.', () => { o.paga.dice = true; }, false); },
  copia(el) {
    const t = el.dataset.t;
    const ok = () => { el.textContent = 'Copiato'; setTimeout(() => { el.textContent = 'Copia'; }, 1600); };
    try { navigator.clipboard.writeText(t).then(ok, () => mostraToast('Non riesco a copiare: tieni premuto il testo.')); } catch (e) { mostraToast('Non riesco a copiare: tieni premuto il testo.'); }
  },
  cuore(el) {
    const o = ordine(el.dataset.id), pid = el.dataset.p, p = piatto(pid);
    cambia('', () => { o.cuori = o.cuori || {}; const on = !o.cuori[pid]; o.cuori[pid] = on; if (p) p.cuori = Math.max(0, p.cuori + (on ? 1 : -1)); }, false);
  },
  riordina(el) {
    const o = ordine(el.dataset.id); let saltati = 0;
    o.righe.forEach(r => {
      const p = piatto(r.piatto);
      if (!p || p.cestino || !p.disponibile || !p.formati.some(f => f.id === r.formato)) { saltati++; return; }
      aggiungiRiga(P.carrello, Object.assign({}, r, { prezzo: prezzoDi(p, r.formato, r.variante), pronto: false }));
    });
    salvaP(); vai('carrello');
    mostraToast(saltati ? `Ho rimesso nel carrello quello che c'è. ${saltati} piatti non ci sono più.` : 'Ho rimesso tutto nel carrello. Controlla e scegli il giorno.');
  },
  allergia(el) { const k = el.dataset.v; P.allergie = P.allergie.includes(k) ? P.allergie.filter(x => x !== k) : [...P.allergie, k]; salvaP(); render(); },
  'rivedi-apertura'() { apertura(); },

  /* Monica */
  'guida-avanti'() { if (UI.guidaPasso < GUIDA.length - 1) UI.guidaPasso++; else { P.guida = true; salvaP(); UI.guidaPasso = 0; } render(); },
  'rivedi-guida'() { P.guida = false; salvaP(); UI.guidaPasso = 0; vai('home'); },
  riprendi() { cambia('Pausa finita: sei di nuovo aperta', () => { S.impostazioni.pausa.attiva = false; }); },
  tab(el) { UI.tab = el.dataset.v; UI.ordAperto = null; render(); },
  'ord-apri'(el) { UI.ordAperto = UI.ordAperto === el.dataset.id ? null : el.dataset.id; render(); },
  'ord-filtro'(el) { UI.ordFiltro = el.dataset.v; UI.ordQuanti = 40; render(); },
  'ord-altri'() { UI.ordQuanti += 40; render(); },
  async 'menu-foto-manda'() {
    const ff = fotoMenu().map((f, i) => { const b = atob(f.split(',')[1]); const a = new Uint8Array(b.length); for (let j = 0; j < b.length; j++) a[j] = b.charCodeAt(j); return new File([a], `menu-${i + 1}.jpg`, { type: 'image/jpeg' }); });
    const testo = `Il menù di ${cuoca()} 🍝 Per ordinare: ${SITO}`;
    try {
      if (navigator.canShare && navigator.canShare({ files: ff })) await navigator.share({ files: ff, text: testo });
      else mostraToast('Questo telefono non sa allegare le foto: tienile premute per salvarle, poi mandale da WhatsApp.');
    } catch (e) { if (!e || e.name !== 'AbortError') mostraToast('Non sono partite: riprova.'); }
  },
  'menu-foto-togli'(el) { const i = Number(el.dataset.i); if ((S.menuFoto || []).some(f => !f)) { mostraToast('Le foto stanno ancora arrivando: riprova tra poco.'); return; } cambia('Foto del menù tolta', () => { S.menuFoto = (S.menuFoto || []).filter((f, j) => j !== i); S.impostazioni.menuFotoV = S.menuFoto.map(versioneFotoApp); }); },
  'ord-giorno'(el) { const x = document.getElementById('g-' + el.dataset.v); if (x) x.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  accetta(el) { const o = ordine(el.dataset.id); cambia(`Accettato: ${cliente(o.cliente).nome}`, () => { o.righe = prezziGiusti(o.righe); segna(o, 'accettato'); }); },
  rifiuta(el) { const o = ordine(el.dataset.id); cambia('Ordine rifiutato', () => { segna(o, 'rifiutato'); rimettiPronti(o); }); },
  'mod-si'(el) { const o = ordine(el.dataset.id); cambia('Modifica accettata', () => { o.righe = prezziGiusti(o.modifica.righe, daAccettare(o) ? [] : o.righe); o.modifica = null; o.esitoModifica = 'si'; }); },
  'mod-no'(el) { const o = ordine(el.dataset.id); cambia('Modifica rifiutata', () => { o.modifica = null; o.esitoModifica = 'no'; }); },
  pronto(el) { const o = ordine(el.dataset.id); setTimeout(() => { cambia('Segnato pronto', () => { segna(o, 'pronto'); }); avvisaCliente(o); }, 60); },
  'pronto-muto'(el) { const o = ordine(el.dataset.id); cambia('Segnato pronto', () => { segna(o, 'pronto'); }); avvisaCliente(o); },
  ritirato(el) { const o = ordine(el.dataset.id); cambia('Ritirato', () => { segna(o, 'ritirato'); }); },
  ricevuto(el) { const o = ordine(el.dataset.id); cambia('Soldi ricevuti', () => { o.paga.ricevuto = true; o.paga.dice = false; }); },
  'apri-pronti'() { UI.foglio = { tipo: 'pronti' }; render(); },
  'pr-formato'(el) { const p = piatto(el.dataset.id); const q = p.pronto && p.pronto.giorno === oggi() ? p.pronto.qta : 0; p.pronto = { formato: el.dataset.v, qta: q, giorno: oggi() }; salva(); render(); },
  'pr-qta'(el) { segnaPronto(piatto(el.dataset.id), Number(el.dataset.d)); },
  'p-pronto'(el) { segnaPronto(piatto(UI.vista.split(':')[1]), Number(el.dataset.d)); },
  'p-pronto-formato'(el) { const p = piatto(UI.vista.split(':')[1]); p.pronto = { formato: el.dataset.v, qta: p.pronto && p.pronto.giorno === oggi() ? p.pronto.qta : 0, giorno: oggi() }; salva(); render(); },
  'nuovo-piatto'() { vai('nuovo'); },
  'nuovo-avanti'() { const n = $('#nuovo-nome').value.trim(); if (!n) { mostraToast('Scrivi il nome del piatto.'); return; } UI.nuovo.nome = n; UI.nuovo.passo = 2; render(); },
  'nuovo-indietro'() { UI.nuovo.passo--; render(); },
  'nuovo-cat'(el) { UI.nuovo.cat = el.dataset.v; UI.nuovo.passo = 3; render(); },
  'nuovo-modo'(el) { UI.nuovo.modo = el.dataset.v; UI.nuovo.passo = 4; render(); },
  'nuovo-crea'() {
    const n = UI.nuovo, campi = [...document.querySelectorAll('[data-nuovo-prezzo]')];
    if (campi.some(c => !(Number(c.value) > 0))) { mostraToast('Scrivi il prezzo.'); return; }
    const prezzi = Object.fromEntries(campi.map(c => [c.dataset.nuovoPrezzo, Number(c.value)]));
    const formati = n.modo === 'teglie' ? T(prezzi.t6, prezzi.t8) : n.modo === 'kg' ? KG(prezzi.kg) : n.modo === 'pz' ? PZ(prezzi.pz) : [{ id: 'intera', tipo: 'intera', nome: 'Intera', prezzo: prezzi.intera }];
    const id = norm(n.nome).replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36).slice(-3);
    S.piatti.push({ id, cat: n.cat, nome: n.nome, sotto: '', aiuto: '', formati, varianti: [], ing: [], note: [], scalda: '', foto: null, disponibile: true, stagione: '', novita: true, novitaDal: oggi(), controllato: true, cuori: 0, pronto: null, ordine: S.piatti.length, cestino: null });
    salva(); UI.nuovo = null; vai('piatto:' + id); mostraToast('Piatto creato. Ora aggiungi foto e ingredienti.');
  },
  'togli-foto'() { const p = piatto(UI.vista.split(':')[1]); cambia('Foto tolta', () => { p.foto = null; }); },
  'p-cat'(el) { const p = piatto(UI.vista.split(':')[1]); cambia('', () => { p.cat = el.dataset.v; }, false); salvatoOk(); },
  'p-formato-togli'(el) { const p = piatto(UI.vista.split(':')[1]); cambia('Formato tolto', () => { p.formati = p.formati.filter(f => f.id !== el.dataset.f); if (p.pronto && p.pronto.formato === el.dataset.f) p.pronto = null; }); },
  'p-formato-aggiungi'(el) {
    const p = piatto(UI.vista.split(':')[1]), k = el.dataset.v;
    const f = { t6: T(0, 0)[0], t8: T(0, 0)[1], kg: KG(0)[0], pz: PZ(0)[0], intera: { id: 'intera', tipo: 'intera', nome: 'Intera', prezzo: 0 } }[k];
    cambia('Formato aggiunto: scrivi il prezzo', () => { p.formati.push(f); });
  },
  'v-aggiungi'() { const p = piatto(UI.vista.split(':')[1]); cambia('Gusto aggiunto: scrivi il nome', () => { p.varianti.push({ id: 'v' + Date.now().toString(36), nome: 'Nuovo gusto', ing: [] }); }); },
  'v-togli'(el) { const p = piatto(UI.vista.split(':')[1]); cambia('Gusto tolto', () => { p.varianti = p.varianti.filter(v => v.id !== el.dataset.v); }); },
  'ing-togli'(el) {
    const p = piatto(UI.vista.split(':')[1]), s = el.dataset.s, i = el.dataset.ing;
    cambia(`Tolto: ${ING(i).n}`, () => { if (s === 'base') p.ing = p.ing.filter(x => x !== i); else { const v = p.varianti.find(x => x.id === s); v.ing = v.ing.filter(x => x !== i); } });
  },
  'ing-aggiungi'(el) {
    const s = el.dataset.s, inp = document.getElementById('ing-' + s), t = inp.value.trim();
    if (!t) { mostraToast('Scrivi un ingrediente.'); inp.focus(); return; }
    let agg = [];
    cambia('', () => { agg = scegliIng(s, t); }, false);
    mostraToast(agg.length ? `Aggiunto: ${agg.join(', ')}` : 'C\'era già.');
  },
  'ing-scegli'(el) { const s = el.dataset.s; let agg = []; cambia('', () => { agg = scegliIng(s, el.dataset.n); }, false); mostraToast(`Aggiunto: ${agg.join(', ')}`); },
  'ing-all'(el) { const x = S.ingExtra[el.dataset.ing], k = el.dataset.v; cambia('', () => { x.a = x.a.includes(k) ? x.a.filter(a => a !== k) : [...x.a, k]; }, false); },
  'ing-ok'(el) { cambia('Allergeni confermati', () => { S.ingExtra[el.dataset.ing].nuovo = false; }, false); },
  'nota-togli'(el) { const p = piatto(UI.vista.split(':')[1]); cambia('Richiesta tolta', () => { p.note.splice(Number(el.dataset.i), 1); }); },
  'nota-aggiungi'() { const p = piatto(UI.vista.split(':')[1]), t = $('#nota-nuova').value.trim(); if (!t) return; cambia('', () => { if (!p.note.includes(t)) p.note.push(t); }, false); },
  controllato() { const p = piatto(UI.vista.split(':')[1]); cambia('Segnato come controllato', () => { p.controllato = true; }); },
  anteprima() { apriPiatto(UI.vista.split(':')[1], false, true); },
  cestina() { const p = piatto(UI.vista.split(':')[1]); UI.vista = 'piatti'; cambia(`Nel cestino: ${p.nome}`, () => { p.cestino = oggi(); }); },
  rimetti(el) { cambia('Rimesso nel menù', () => { piatto(el.dataset.id).cestino = null; }); },
  'richiesta-si'(el) { return decidiRichiesta(el.dataset.id, true); },
  'richiesta-no'(el) { return decidiRichiesta(el.dataset.id, false); },
  /* cliente nuovo col giorno che non va (Monica 07/11): prima il sì, poi appena l'ordine è «Nuovo» si apre la scelta del giorno */
  async 'richiesta-proponi'(el) {
    const oid = el.dataset.o;
    await decidiRichiesta(el.dataset.id, true);
    for (let i = 0; i < 20 && !(ordine(oid) && ordine(oid).stato === 'nuovo'); i++) await new Promise(f => setTimeout(f, 300));
    if (!ordine(oid) || ordine(oid).stato !== 'nuovo') return;
    UI.foglio = { tipo: 'proponi', id: oid }; UI.proposta = null; render();
  },
  'rifiutato-si'(el) { return decidiRichiesta(el.dataset.id, true); },
  'rifiutati-apri'() { UI.rifiutati = !UI.rifiutati; render(); },
  'i-anticipo'(el) { cambia('', () => { S.impostazioni.anticipo = Math.min(14, Math.max(0, S.impostazioni.anticipo + Number(el.dataset.d))); }, false); salvatoOk(); },
  'i-limite'(el) { cambia('', () => { S.impostazioni.limite.teglie = Math.min(99, Math.max(1, S.impostazioni.limite.teglie + Number(el.dataset.d))); }, false); salvatoOk(); },
  'natale-piatto'(el) { const l = S.impostazioni.natale.piatti, id = el.dataset.id; cambia('', () => { S.impostazioni.natale.piatti = l.includes(id) ? l.filter(x => x !== id) : [...l, id]; }, false); },
  ricomincia() { if (Dati.attivo) return; /* coi dati veri cancellerebbe ordini e clienti */ cambia('Prova ricominciata da capo', () => { S = statoIniziale(); }); }
};
/* Monica dice Sì o No a un telefono nuovo. Annulla per 10 secondi. */
async function decidiRichiesta(id, si) {
  const r = S.richieste.find(x => x.id === id) || (S.rifiutati || []).find(x => x.id === id);
  if (!r || UI.decido) return;
  const msg = si ? (r.cliente ? `${r.nome}: telefono ricollegato` : `${r.nome} ora può ordinare`) : `Hai detto di no a ${r.nome}`;
  if (!Dati.attivo) { cambia(msg, () => decidiProva(r, si)); return; }
  UI.decido = id; render();
  try {
    const esito = await Dati.decidi(id, si);
    UI.decido = null; render();
    mostraToast(esito.finiti.length ? `${msg}. I pronti sono finiti (${esito.finiti.join(', ')}): proponi un altro giorno.` : msg, () => {
      esito.annulla().then(() => mostraToast('Annullato'),
        e => mostraToast(e.code === 'gia' ? 'Non si può più annullare: è già cambiato.' : 'Non annullato: controlla la rete e riprova.'));
    });
  } catch (e) {
    UI.decido = null; render();
    mostraToast(e.code === 'gia' ? 'Già fatto: l\'ha deciso qualcun altro.' : e.code === 'unavailable' || !navigator.onLine ? 'Manca la rete: riprova appena torna.' : 'Non è andata. Riprova tra poco.');
  }
}
/* la stessa decisione nella prova (dati sul telefono) */
function decidiProva(r, si) {
  S.richieste = S.richieste.filter(x => x !== r);
  S.rifiutati = (S.rifiutati || []).filter(x => x !== r);
  const o = r.primo && ordine(r.primo);
  if (!si) { if (o && o.stato === 'daApprovare') o.stato = 'rifiutato'; S.rifiutati.push(r); return; }
  let id = r.cliente;
  if (!id) { id = 'c' + Date.now().toString(36); S.clienti.push({ id, nome: r.nome, da: oggi() }); }
  if (!o || !(o.stato === 'daApprovare' || (o.stato === 'rifiutato' && !o.cliente))) return;
  o.stato = 'nuovo'; o.cliente = id;
  if (!o.pronto) return;
  const ci = o.righe.every(x => { const p = piatto(x.piatto); return p && p.pronto && p.pronto.giorno === oggi() && p.pronto.qta >= x.qta; });
  if (ci) o.righe.forEach(x => { const p = piatto(x.piatto); p.pronto.qta = arrot(p.pronto.qta - x.qta); });
  else o.pronto = false;
}
function riprendiPronti(o) { if (!o.pronto) return; o.righe.forEach(r => { const p = piatto(r.piatto); if (p && p.pronto && p.pronto.giorno === oggi()) p.pronto.qta = Math.max(0, arrot(p.pronto.qta - r.qta)); }); }
function rimettiPronti(o) { if (!o.pronto) return; o.righe.forEach(r => { const p = piatto(r.piatto); if (p && p.pronto && p.pronto.giorno === oggi()) p.pronto.qta = arrot(p.pronto.qta + r.qta); }); }
function segnaPronto(p, d) {
  const fId = p.pronto ? p.pronto.formato : p.formati[0].id, f = p.formati.find(x => x.id === fId) || p.formati[0];
  const q = p.pronto && p.pronto.giorno === oggi() ? p.pronto.qta : 0;
  const st = f.tipo === 'kg' ? (f.passo || 0.5) : 1;
  p.pronto = { formato: f.id, qta: Math.max(0, arrot(q + d * st)), giorno: oggi() };
  salva(); render();
}
let tSalvato = null;
function salvatoOk() { if (Dati.attivo && !Dati.haDati()) return; if (Dati.attivo && Dati.inAttesa()) { Dati.confermato().then(salvatoOk, () => {}); return; } UI.salvato = true; render(); clearTimeout(tSalvato); tSalvato = setTimeout(() => { UI.salvato = false; const s = $('.testata .titolo span'); if (s && P.ruolo === 'monica') s.remove(); }, 2500); }

/* campi scritti: si salvano da soli */
function salvaCampo(el) {
  const c = el.dataset.campo, val = el.type === 'checkbox' ? el.checked : el.value;
  const pid = UI.vista.split(':')[1];
  if (c === 'sel.testo') { UI.sel.testo = val; return; }
  if (c === 'nota') { UI.nota = val; return; }
  if (c.startsWith('d.') || c.startsWith('sp.')) { salvaCampoSpesa(el); return; }
  if (c === 'p.grande') { P.grande = val; salvaP(); render(); return; }
  if (c === 'disp') { const p = piatto(el.dataset.id); cambia(val ? `Di nuovo nel menù: ${p.nome}` : `Tolto dal menù: ${p.nome}`, () => { p.disponibile = val; }); return; }
  if (c === 'p.novita') { const p = piatto(pid); cambia('', () => { p.novita = val; p.novitaDal = oggi(); }, false); salvatoOk(); return; }
  if (c.startsWith('p.')) {
    const p = piatto(pid), k = c.slice(2);
    if (k === 'prezzo') { const f = p.formati.find(x => x.id === el.dataset.f); f.prezzo = Math.max(0, Number(val) || 0); }
    else if (k === 'fritto') p.fritto = Math.min(99, Math.max(0, Math.round((Number(String(val).replace(',', '.')) || 0) * 100) / 100));
    else if (k === 'forno') p.forno = Math.min(99, Math.max(0, Math.round((Number(String(val).replace(',', '.')) || 0) * 100) / 100));
    else if (k === 'nome' && !val.trim()) { mostraToast('Il nome non può restare vuoto.'); render(); return; }
    else p[k] = val;
    salva(); salvatoOk(); return;
  }
  if (c.startsWith('v.')) {
    const p = piatto(pid), v = p.varianti.find(x => x.id === el.dataset.v), k = c.slice(2);
    if (k === 'nome') v.nome = val.trim() || v.nome;
    else { v.prezzi = v.prezzi || {}; v.prezzi[p.formati[0].id] = val === '' ? null : Number(val); }
    salva(); salvatoOk(); return;
  }
  if (c.startsWith('i.')) {
    const parti = c.slice(2).split('.'); let o = S.impostazioni;
    parti.slice(0, -1).forEach(k => { o = o[k]; });
    const k = parti[parti.length - 1];
    if (el.type === 'checkbox') { cambia(val ? 'Acceso' : 'Spento', () => { o[k] = val; }); return; }
    o[k] = val; salva(); salvatoOk();
  }
}

/* foto: ridotta e migliorata (più luce, colori caldi) */
const TETTO_FOTO = 390000;   // caratteri della foto (circa 290 KB)
function caricaFoto(input, fatto) {
  const file = input.files && input.files[0], id = input.dataset.id;
  if (!file) return;
  input.value = '';
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => {
    const s = Math.min(1, 900 / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    const x = c.getContext('2d');
    x.filter = 'brightness(1.06) saturate(1.12) contrast(1.04)';
    x.drawImage(img, 0, 0, c.width, c.height);
    x.filter = 'none'; x.globalCompositeOperation = 'soft-light'; x.fillStyle = 'rgba(255,170,90,.16)'; x.fillRect(0, 0, c.width, c.height);
    // tetto 300 KB (il server ne accetta fino a 400.000 caratteri): prima qualità più bassa, poi foto più piccola
    let q = 0.8, dati = c.toDataURL('image/jpeg', q);
    while (dati.length > TETTO_FOTO && q > 0.55) { q -= 0.1; dati = c.toDataURL('image/jpeg', q); }
    while (dati.length > TETTO_FOTO && c.width > 300) {
      const p = document.createElement('canvas'); p.width = Math.round(c.width * 0.8); p.height = Math.round(c.height * 0.8);
      p.getContext('2d').drawImage(c, 0, 0, p.width, p.height); c.width = p.width; c.height = p.height; c.getContext('2d').drawImage(p, 0, 0);
      dati = c.toDataURL('image/jpeg', q);
    }
    URL.revokeObjectURL(url);
    if (dati.length > TETTO_FOTO) { mostraToast('Questa foto è troppo pesante. Prova con un\'altra.'); return; }
    if (fatto) fatto(dati); else cambia('Foto aggiunta e migliorata', () => { piatto(id).foto = dati; });
  };
  img.onerror = () => { URL.revokeObjectURL(url); mostraToast('Questa foto non si apre. Prova con un\'altra.'); };
  img.src = url;
}

/* suggerimenti mentre scrive un ingrediente */
function suggerisci(el) {
  const s = el.dataset.cerca, q = norm(el.value.split(',').pop());
  const box = document.getElementById('sug-' + s);
  if (!box) return;
  if (q.length < 2) { box.innerHTML = ''; return; }
  const tutti = Object.assign({}, INGREDIENTI, S.ingExtra);
  const trovati = Object.keys(tutti).filter(k => norm(tutti[k].n).includes(q)).slice(0, 6);
  box.innerHTML = trovati.map(k => `<button type="button" data-a="ing-scegli" data-s="${s}" data-n="${esc(tutti[k].n)}">${esc(tutti[k].n)}</button>`).join('');
}

/* firma «Powered by YNOY»: dall'apertura di Jona (tratti che scrivono il logo a mano), tempi più corti per stare in 5 secondi.
   Mario 05/11 (C17): la coda resta del colore della firma (niente lune colorate) e il filo della Y verso la coda parte piano e finisce veloce, come una firma */
const FIRMA_JONA = `<div class="wall-by" role="img" aria-label="Powered by YNOY Corp"><span><em style="animation-delay:1.70s">P</em><em style="animation-delay:1.74s">o</em><em style="animation-delay:1.78s">w</em><em style="animation-delay:1.82s">e</em><em style="animation-delay:1.86s">r</em><em style="animation-delay:1.90s">e</em><em style="animation-delay:1.94s">d</em><em style="animation-delay:1.98s">&nbsp;</em><em style="animation-delay:2.02s">b</em><em style="animation-delay:2.06s">y</em></span><div class="yn"><svg class="ywr" viewBox="0 0 496 190" aria-hidden="true"><mask id="ylg" maskUnits="userSpaceOnUse" x="0" y="0" width="496" height="190" style="mask-type:alpha"><image href="media/ynoy-firma.png" width="496" height="190"/></mask><mask id="ywm" maskUnits="userSpaceOnUse" x="0" y="0" width="496" height="190"><g><path pathLength="100" d="M46.5 30.5 50.5 30.5 56.5 31.4 62.0 32.8 63.4 32.4 64.5 33.9 67.5 35.5 70.0 37.3 73.0 40.0 75.5 42.5 76.9 43.3 77.7 44.1 78.3 45.5 87.9 57.5 88.5 59.5 88.5 62.5 88.0 67.0" style="stroke-width:18.1;--o:115;animation-delay:2.100s;animation-duration:0.046s"/><path pathLength="100" d="M144.5 31.0 141.0 31.1 136.5 32.5 130.5 35.7 123.5 41.5 121.0 44.0 120.4 45.5 121.1 47.1 120.0 46.4 118.6 46.6 105.5 60.0 101.8 64.0 98.1 69.5 96.4 72.5 92.9 80.5 91.4 83.0 87.9 87.5 80.0 93.9 74.5 97.4 71.5 99.0" style="stroke-width:18.3;--o:109;animation-delay:2.147s;animation-duration:0.065s"/><path pathLength="100" d="M145.5 31.5 148.5 34.5 149.1 36.0 148.9 37.0 146.6 40.0 146.0 43.0 146.0 71.0 146.0 84.5 146.4 88.5 145.8 89.9 145.0 90.5 143.0 91.3 141.4 91.5 143.0 91.3 146.0 90.3 147.5 90.2 151.0 91.3 155.0 92.0" style="stroke-width:11.7;--o:108;animation-delay:2.212s;animation-duration:0.054s"/><path pathLength="100" d="M145.5 31.5 150.0 35.7 151.0 36.2 153.5 36.6 155.0 37.2 158.0 39.5 178.0 59.4 181.0 62.0 199.0 80.0 200.0 80.7 202.4 81.7 203.6 83.1 204.9 85.5 206.3 86.5 207.0 86.5" style="stroke-width:19.3;--o:112;animation-delay:2.266s;animation-duration:0.055s"/><path pathLength="100" d="M204.0 81.5 206.9 78.5 207.6 77.5 208.0 76.0 208.0 53.5 208.0 36.5 208.5 33.5 209.2 32.3 210.5 31.4 212.5 30.8 215.5 30.5" style="stroke-width:10.6;--o:110;animation-delay:2.321s;animation-duration:0.044s"/><path pathLength="100" d="M263.0 30.0 259.0 30.0 250.5 31.6 245.0 33.9 239.0 37.8 237.0 39.5 234.9 42.0 232.6 45.0 230.9 48.0 228.6 54.0 227.3 60.4 227.8 62.2 227.6 64.0 228.3 67.5 230.9 74.5 233.7 79.0 240.0 85.3 244.5 88.1 250.0 90.4 256.5 92.0 261.0 92.5 265.0 92.5 271.0 91.7 278.5 89.4 284.0 86.5 286.5 84.8 289.5 82.1 291.1 81.6 291.5 79.5 294.1 76.0 296.1 71.5 297.7 66.5 298.5 61.0 297.7 56.0 295.1 48.5 292.9 44.5 290.0 41.0 288.6 38.5 286.5 37.7 281.5 34.3 275.0 31.5 267.0 30.0 263.0 30.0" style="stroke-width:19.0;--o:105;animation-delay:2.365s;animation-duration:0.110s"/><path pathLength="100" d="M296.5 30.5 298.0 30.5 303.5 31.4 308.0 32.5 310.0 33.3 314.0 35.4 318.0 38.2 321.5 41.5 333.2 55.5 334.5 57.5 334.9 58.5 334.5 62.0 334.5 66.5" style="stroke-width:17.9;--o:116;animation-delay:2.476s;animation-duration:0.044s"/><path pathLength="100" d="M307.5 108.0 313.0 105.3 318.0 102.2 323.0 98.2 327.3 94.1 333.9 86.5 341.6 75.5 342.7 73.1 343.1 68.9 346.9 67.3 348.6 66.0 357.5 55.5 365.0 47.5 374.5 38.2 380.4 32.9 382.3 29.4 383.7 28.1 389.0 26.3 397.0 21.0 405.0 16.5 416.9 11.7 420.9 10.7 427.0 9.8 432.0 9.5 437.5 9.7 443.0 10.5 448.3 12.2 453.5 14.3 457.5 17.0 460.5 19.6 463.5 23.0 466.6 27.5 468.4 31.5 469.8 36.0 470.8 42.2 471.0 47.5 470.6 53.0 469.9 57.0 468.8 62.0 466.9 68.0 462.6 77.9 461.2 80.4 458.6 84.4 453.0 91.5 445.5 99.4 439.5 104.5 431.4 109.8 429.5 111.3 426.0 113.3 415.0 118.5 408.0 121.0 402.0 122.7 395.0 124.3 386.9 125.3 384.0 126.0 373.5 126.9 361.0 127.0 353.5 126.6 334.0 124.9 315.0 122.1 275.3 114.7 228.0 107.0 192.5 102.1 182.5 101.3 157.5 100.0 141.0 100.0 125.0 100.8 111.5 102.1 96.0 104.3 83.5 106.8 70.5 110.5 63.1 113.4 54.5 117.5 51.5 118.5 41.5 119.6 35.0 121.0" style="stroke-width:15.1;--o:101;animation-delay:2.521s;animation-duration:0.700s;animation-timing-function:cubic-bezier(.65,0,.9,.6)"/><path pathLength="100" d="M61.0 116.5 59.4 116.2 56.1 117.2 54.7 118.3 53.5 120.3 52.8 123.0 53.0 129.0" style="stroke-width:17.2;--o:149;animation-delay:3.223s;animation-duration:0.028s"/><path pathLength="100" d="M53.5 145.0 48.0 142.0 43.6 140.8 42.7 139.9 42.5 138.9 42.3 139.8 41.8 140.3 38.5 140.4 36.5 140.9 33.5 142.3 32.0 142.4 30.9 141.9 31.1 143.4 27.9 147.0 26.6 149.5 25.9 152.0 25.5 154.5 25.5 159.5 26.5 165.0" style="stroke-width:16.4;--o:117;animation-delay:3.251s;animation-duration:0.042s"/><path pathLength="100" d="M65.5 149.5 61.5 150.8 60.0 151.7 56.5 154.6 55.5 154.8 54.1 154.4 54.8 156.0 54.8 157.0 53.1 160.5 51.9 163.9 50.5 164.9 48.0 165.1 49.5 165.7 50.6 167.0 50.9 168.0 50.8 171.0 51.5 173.0 51.4 173.9 50.9 174.7 48.4 177.1 51.0 175.1 52.5 174.9 58.0 179.1 60.0 180.2 63.5 181.5" style="stroke-width:20.0;--o:117;animation-delay:3.293s;animation-duration:0.046s"/><path pathLength="100" d="M81.0 147.5 79.5 150.5 77.9 156.0 77.2 157.1 76.4 157.5 77.3 158.2 77.4 161.5 78.4 164.0 79.5 166.0 80.9 168.0 81.1 169.0 80.9 170.1 82.5 169.8 86.0 171.4 89.0 171.5 92.0 171.1 97.5 169.5" style="stroke-width:16.2;--o:120;animation-delay:3.339s;animation-duration:0.038s"/><path pathLength="100" d="M100.5 142.0 99.0 142.4 97.5 143.5 95.7 145.5 95.0 147.5 95.1 150.5 95.7 151.9 96.5 152.6 97.5 152.9 100.5 153.0 102.9 153.1 103.8 152.6 104.1 149.0 105.1 146.4 104.9 145.9 103.0 144.5 100.5 142.0" style="stroke-width:18.6;--o:128;animation-delay:3.376s;animation-duration:0.035s"/><path pathLength="100" d="M378.0 77.0 376.9 75.1 375.0 74.1 371.0 74.0 368.5 74.6 365.5 77.0 363.8 79.5 363.0 82.5 363.2 84.5 364.1 87.0 365.1 88.5 367.0 90.1 370.0 91.4 374.0 91.5 376.5 91.1 377.9 89.9 379.0 87.0" style="stroke-width:8.0;--o:110;animation-delay:3.411s;animation-duration:0.039s"/><path pathLength="100" d="M390.5 74.0 389.4 74.3 388.0 75.1 386.0 77.0 384.6 79.0 384.0 82.0 384.2 85.5 384.7 87.0 385.6 88.5 388.0 90.6 389.0 91.1 391.0 91.5 394.0 91.4 396.5 90.4 398.5 88.5 399.6 86.5 400.2 84.5 400.4 82.5 400.1 81.0 399.0 78.0 397.0 75.7 395.5 74.7 394.0 74.1 390.5 74.0" style="stroke-width:8.0;--o:108;animation-delay:3.450s;animation-duration:0.043s"/><path pathLength="100" d="M408.5 74.5 409.0 78.0 409.0 83.0 409.0 87.5 408.5 91.0" style="stroke-width:8.0;--o:126;animation-delay:3.492s;animation-duration:0.027s"/><path pathLength="100" d="M405.5 91.5 408.5 90.1 410.0 90.4 411.5 91.5" style="stroke-width:7.5;--o:160;animation-delay:3.519s;animation-duration:0.022s"/><path pathLength="100" d="M406.0 74.5 408.5 75.4 411.5 74.6 414.0 74.6 415.9 75.6 417.2 77.5 417.4 79.0 417.1 80.0 416.1 82.0 415.3 82.8 414.0 83.4 409.0 83.0" style="stroke-width:7.2;--o:116;animation-delay:3.543s;animation-duration:0.031s"/><path pathLength="100" d="M412.5 83.0 413.9 83.6 415.1 84.6 417.4 88.0 418.4 89.4 419.6 90.4 423.0 91.5" style="stroke-width:7.1;--o:127;animation-delay:3.573s;animation-duration:0.026s"/><path pathLength="100" d="M427.5 74.5 427.8 75.2 427.5 78.0 427.5 83.0 427.5 88.0 427.8 89.5 427.8 90.8 427.5 91.5" style="stroke-width:8.0;--o:125;animation-delay:3.599s;animation-duration:0.027s"/><path pathLength="100" d="M424.5 91.5 426.0 90.4 427.5 90.1 428.5 90.4 430.5 91.5" style="stroke-width:7.5;--o:160;animation-delay:3.626s;animation-duration:0.022s"/><path pathLength="100" d="M424.5 74.5 427.5 75.6 430.5 74.6 433.0 74.6 435.0 75.6 436.3 77.5 436.5 78.5 435.9 81.0 434.9 82.2 434.0 82.8 431.0 83.5 429.0 83.4 427.5 83.0" style="stroke-width:7.0;--o:115;animation-delay:3.649s;animation-duration:0.031s"/></g></mask><g mask="url(#ylg)"><rect width="496" height="190" fill="#7B2318" mask="url(#ywm)"/></g></svg><i class="y0"></i></div></div>`;

/* ---------- animazioni ---------- */
const pocoMoto = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
let chiudendo = false;
function chiudiFoglio(poi) {
  const v = $('.velo');
  const fine = () => { chiudendo = false; UI.foglio = null; UI.proposta = null; render(); if (poi) poi(); };
  if (!v || pocoMoto()) { fine(); return; }
  if (chiudendo) return;
  chiudendo = true; v.classList.add('chiude'); setTimeout(fine, 200);
}
/* il piatto «vola» nel carrello e il carrello fa un salto */
function vola(da) {
  const t = $('.testata [data-v="carrello"]');
  if (!t || !da || pocoMoto()) return;
  const b = t.getBoundingClientRect(), x0 = da.left + da.width / 2, y0 = da.top + da.height / 2;
  const dx = b.left + b.width / 2 - x0, dy = b.top + b.height / 2 - y0;
  const v = document.createElement('div');
  v.className = 'volo'; v.innerHTML = ico('piu'); v.style.left = (x0 - 15) + 'px'; v.style.top = (y0 - 15) + 'px';
  document.body.appendChild(v);
  const anim = v.animate([
    { transform: 'translate(0,0) scale(1)' },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.55 - 90}px) scale(1.1)`, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) scale(.35)`, opacity: 0.7 }
  ], { duration: 700, easing: 'cubic-bezier(.45,0,.25,1)' });
  anim.onfinish = () => { v.remove(); const c = $('.testata [data-v="carrello"]'); if (c) { c.classList.remove('salta'); void c.offsetWidth; c.classList.add('salta'); } };
}

/* apertura: a ogni apertura dell'app; parte solo quando la pagina si vede e le immagini sono pronte */
function apertura() {
  const vecchia = $('.apertura'); if (vecchia) vecchia.remove();
  const d = document.createElement('div');
  d.className = 'apertura';
  d.innerHTML = `<button type="button" class="salta">Salta</button>
    <div class="scena"><div class="alone"></div>
      <svg class="anello" viewBox="0 0 640 694" aria-hidden="true"><circle cx="320" cy="376" r="322"/></svg>
      <img class="l-med" src="media/logo-medaglione.webp" alt=""><div class="luce"></div>
      <img class="l-tit" src="media/logo-titolo.webp" alt="">
      <img class="l-fir" src="media/logo-firma.webp" alt="Pronti in Tavola con Monica"></div>
    ${FIRMA_JONA}`;
  document.body.appendChild(d);
  let partita = false, tEsci = null;
  const esci = () => {
    if (!d.isConnected || d.classList.contains('esce')) return;
    clearTimeout(tEsci); d.classList.add('esce');
    /* la Home entra MENTRE l'apertura svanisce (Mario 07/11: prima spariva e rientrava dopo, «movimento scattoso») */
    const m = $('main.corpo'); if (m) { m.classList.remove('entra'); void m.offsetWidth; m.classList.add('entra'); }
    setTimeout(() => { d.remove(); provaApri(); }, 560);
  };
  const parti = () => {
    if (partita) return; partita = true;
    requestAnimationFrame(() => requestAnimationFrame(() => { d.classList.add('parti'); tEsci = setTimeout(esci, pocoMoto() ? 1800 : 4500); }));
  };
  const quandoVisibile = () => {
    if (document.visibilityState === 'visible') { parti(); return; }
    const f = () => { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', f); parti(); } };
    document.addEventListener('visibilitychange', f);
  };
  Promise.all([...d.querySelectorAll('img')].map(im => (im.decode ? im.decode() : Promise.resolve()).catch(() => {})))
    .then(() => setTimeout(quandoVisibile, 120));
  setTimeout(() => { if (!partita && document.visibilityState === 'visible') parti(); }, 2500);
  d.addEventListener('click', esci); /* un tocco ovunque (anche sul logo) salta l'apertura */
}

/* ---------- lucchetto della parte di Monica (lucchetto.js; docs/SPEC-FIREBASE.md «Accesso») ----------
   Solo coi dati veri. Stati: '' aperto · 'attendi' (si sta capendo chi è) · 'chiuso' (impronta o PIN)
   · 'metti' (appena entrata con Google: mette il lucchetto) · 'google' (chiave mancante: di nuovo Google). */
const L = { aperto: false, puo: undefined, inCorso: false, tentato: false, errore: '', fallito: false, via: 0, esci: false };
const FRESCA = 5 * 60000;                          /* entrata con Google da meno di 5 minuti */
const MINUTI_LUCCHETTO = [1, 2, 5, 8, 10, 15, 30, 60];   /* «si richiude se esci dall'app per…» */
/* tre tempi (Mario 07/11, C46): «mario» lo cambia solo Mario, «monica» Monica e Mario (08/11), «ospiti» (gli altri di «Chi gestisce») Mario o Monica.
   Prima era un numero solo: vale per tutti e tre finché qualcuno non ne cambia uno. */
function chiLucchetto() {
  const n = ((Dati.attivo && Dati.io.nomeGestore) || '').trim().toLowerCase();
  if (/^mario\b/.test(n)) return 'mario';
  const c = (cuoca().trim().split(/\s+/)[0] || 'monica').toLowerCase();
  return !n || /^monica\b/.test(n) || n.split(/\s+/)[0] === c ? 'monica' : 'ospiti';
}
const tempiLucchetto = () => {
  const v = S.impostazioni.lucchetto, t = {};
  for (const k of ['mario', 'monica', 'ospiti']) {
    const m = Number(v && typeof v === 'object' ? v[k] : v);
    t[k] = MINUTI_LUCCHETTO.includes(m) ? m : 8;   /* 8 minuti di base (Mario 07/11, C34) */
  }
  return t;
};
const minutiLucchetto = (chi = chiLucchetto()) => tempiLucchetto()[chi];
/* l'ultima uscita con la parte aperta resta salvata: se Android chiude l'app (indietro) e Monica rientra subito, niente impronta di nuovo */
const VIA = 'pit-lucchetto-via';
const leggiVia = () => { try { return Number(localStorage.getItem(VIA)) || 0; } catch (e) { return 0; } };
const scriviVia = t => { try { t ? localStorage.setItem(VIA, String(t)) : localStorage.removeItem(VIA); } catch (e) { /* senza memoria: chiede l'impronta */ } };
function statoLucchetto() {
  if (!Dati.attivo || P.ruolo !== 'monica' || L.aperto) return '';
  const io = Dati.io;
  if (!io.uid || !io.gestore || L.puo === undefined) return 'attendi';
  const k = Lucchetto.di(io.uid);
  if (k && k.id) {
    const via = leggiVia();
    if (via && Date.now() - via < minutiLucchetto() * 60000) { L.aperto = true; return ''; }
    return 'chiuso';
  }
  if (k && k.senza && !L.puo) { L.aperto = true; return ''; }
  if (Date.now() - (io.entrata || 0) < FRESCA || (k && k.senza)) {
    if (L.puo) return 'metti';
    /* telefono senza blocco schermo: la parte resta aperta, con l'avviso (una volta) */
    Lucchetto.metti(io.uid, { senza: true }); L.aperto = true;
    setTimeout(() => mostraToast('Il telefono non ha il blocco schermo: la tua parte resta aperta. Mettilo nelle impostazioni del telefono.'), 0);
    return '';
  }
  return 'google';
}
function vLucchetto(st) {
  const scheda = (titolo, testo, corpo) => `<main class="corpo lucchetto"><section class="scheda">
    <div class="lucchetto-ico">${ico('lucchetto')}</div><h1>${titolo}</h1><p>${testo}</p>${corpo}
    ${L.errore ? `<p class="avviso-errore" role="alert">${esc(L.errore)}</p>` : ''}</section></main>`;
  const testata = `<header class="testata"><img class="marchio" src="${LOGO}" alt=""><div class="titolo"><b>Pronti in Tavola</b></div></header>`;
  if (st === 'attendi') return testata + `<main class="corpo lucchetto"><section class="scheda"><div class="lucchetto-ico">${ico('lucchetto')}</div><p>Un attimo…</p></section></main>`;
  if (st === 'chiuso') return testata + scheda('La tua parte è chiusa', 'Per aprirla usa l\'impronta o il PIN del telefono.',
    `<button type="button" class="btn pieno grande" data-a="lucchetto-apri" ${L.inCorso ? 'disabled' : ''}>${ico('lucchetto')}${L.inCorso ? 'Tocca il sensore…' : 'Apri con l\'impronta'}</button>
     <button type="button" class="link" data-a="lucchetto-google">Non funziona? Entra di nuovo con Google</button>`);
  if (st === 'metti') return testata + scheda('Proteggi la tua parte', 'Da ora, per aprire la tua parte, il telefono ti chiede l\'impronta o il PIN. Così i dati dei clienti restano al sicuro anche se presti il telefono.',
    `<button type="button" class="btn pieno grande" data-a="lucchetto-metti" ${L.inCorso ? 'disabled' : ''}>${ico('lucchetto')}${L.inCorso ? 'Tocca il sensore…' : 'Metti l\'impronta'}</button>
     ${L.fallito || (Lucchetto.di(Dati.io.uid) || {}).senza ? '<button type="button" class="link" data-a="lucchetto-dopo">Più tardi</button>' : ''}`);
  return testata + scheda('Entra di nuovo', 'Per sicurezza, entra di nuovo con il tuo account Google. Poi metti l\'impronta.',
    `<button type="button" class="btn pieno grande" data-a="lucchetto-google">Entra con Google</button>`);
}
function vSicurezza() {
  const k = Lucchetto.di(Dati.io.uid) || {}, chi = chiLucchetto(), m = minutiLucchetto(chi), mo = minutiLucchetto('ospiti');
  const min = x => x === 1 ? 'minuto' : 'minuti';
  const tuo = chi === 'ospiti'
    ? `<p style="margin:0">Si richiude se esci dall'app per <b>${m} ${min(m)}</b>. Lo decidono Mario e Monica.</p>`
    : `<span class="etichetta" style="font-weight:800">Si richiude se esci dall'app per</span>
      <div class="fila">${passo('i-lucchetto', m, `data-chi="${chi}"`)}<span class="tenue">${min(m)}</span></div>
      <small class="tenue">${chi === 'mario' ? 'Vale solo per te: Monica ha il suo tempo.' : 'Vale solo per te. Lo può cambiare anche Mario.'}</small>`;
  const mm = minutiLucchetto('monica');
  const monica = chi !== 'mario' ? '' : `<div class="lucchetto-ospiti"><span class="etichetta" style="font-weight:800">Per Monica</span>
      <small class="tenue">Lo può cambiare anche lei dal suo telefono.</small>
      <div class="fila">${passo('i-lucchetto', mm, 'data-chi="monica"')}<span class="tenue">${min(mm)}</span></div></div>`;
  const ospiti = chi === 'ospiti' ? '' : `${monica}<div class="lucchetto-ospiti"><span class="etichetta" style="font-weight:800">Per gli ospiti</span>
      <small class="tenue">Le altre persone in «Chi gestisce la cucina». Lo cambiate tu e ${chi === 'mario' ? 'Monica' : 'Mario'}.</small>
      <div class="fila">${passo('i-lucchetto', mo, 'data-chi="ospiti"')}<span class="tenue">${min(mo)}</span></div></div>`;
  return `<section class="scheda"><h2>Lucchetto</h2>
    ${k.id ? `<p style="margin:0"><b>Acceso.</b> Per aprire la tua parte il telefono chiede l'impronta o il PIN.</p>${tuo}`
    : L.puo ? `<p style="margin:0"><b>Spento.</b> Mettilo: per aprire la tua parte il telefono chiederà l'impronta o il PIN.</p>
      <button type="button" class="btn pieno" data-a="lucchetto-metti">${ico('lucchetto')}Metti l'impronta</button>`
    : `<p style="margin:0"><b>Spento:</b> il telefono non ha il blocco schermo. Mettilo nelle impostazioni del telefono, poi riapri l'app.</p>`}
    ${ospiti}
    <button type="button" class="link" data-a="lucchetto-esci" style="color:var(--allarme)">${L.esci ? 'Sicura? Tocca ancora per uscire' : 'Esci da questo telefono'}</button>
    <small class="tenue">Se cambi telefono o lo dai via. Per rientrare: «Area riservata» in fondo alla pagina.</small></section>`;
}
/* l'impronta si chiede da sola una volta, finita l'apertura animata; poi col pulsante */
function provaApri() {
  if (L.tentato || L.inCorso || document.visibilityState !== 'visible' || $('.apertura') || statoLucchetto() !== 'chiuso') return;
  L.tentato = true; apriLucchetto();
}
async function apriLucchetto() {
  if (L.inCorso) return;
  L.inCorso = true; L.errore = ''; render();
  try { await Lucchetto.apri(Dati.io.uid); L.aperto = true; L.vapore = true; }
  catch (e) { L.errore = e.name === 'NotAllowedError' ? 'Non si è aperta. Tocca il pulsante e riprova.' : 'Il telefono non riesce a usare l\'impronta. Riprova, o entra di nuovo con Google.'; }
  L.inCorso = false; render();
  if (L.vapore) { L.vapore = false; Vapore.parti(P.vapore || 'A'); }   // vapore di cucina dopo lo sblocco (Mario 07/11)
}
/* uscita dall'app più lunga dei minuti scelti: si richiude */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { L.via = Date.now(); scriviVia(L.aperto ? L.via : 0); return; }
  const k = Dati.attivo ? Lucchetto.di(Dati.io.uid) : null;
  if (L.aperto && k && k.id && L.via && Date.now() - L.via >= minutiLucchetto() * 60000) {
    L.aperto = false; L.tentato = false; L.errore = ''; UI.foglio = null; scriviVia(0); render();
  }
  L.via = 0; provaApri();
});
Object.assign(A, {
  async 'sono-qui'(el) {
    const o = S.ordini.find(x => x.id === el.dataset.id);
    if (!o || UI.quiInvio) return;
    if (!sulSito()) { mostraToast('Qui è l\'anteprima: l\'avviso a Monica parte solo dall\'app vera.'); return; }
    UI.quiInvio = o.id; UI.quiEsito = null; render();
    try {
      const tok = await Dati.token();
      const r = await fetch('/api/qui', { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' },
        body: JSON.stringify({ n: o.n, nome: nomeCliente() || '', prova: diProva(o) }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.errore || 'errore');
      UI.qui = { ...(UI.qui || {}), [o.id]: Date.now() };
      if (d.fermo === 'pausa') mostraToast('Monica è già avvisata: aspetta un minuto prima di riavvisarla.');
      else if (!d.mandati) UI.quiEsito = { id: o.id, senza: true };
      else mostraToast('Fatto ✓ A Monica è suonato l\'avviso: arriva!');
      setTimeout(render, 61000);
    } catch (e) { mostraToast('Non è partito (manca la rete?). Riprova, o scrivi a Monica su WhatsApp.'); }
    UI.quiInvio = null; render();
  },
  'lucchetto-apri'() { L.tentato = true; apriLucchetto(); },
  async 'lucchetto-metti'() {
    if (L.inCorso) return;
    L.inCorso = true; L.errore = ''; render();
    try {
      await Lucchetto.crea(Dati.io.uid, Dati.io.nome); L.aperto = true; L.fallito = false; L.inCorso = false; render();
      mostraToast('Lucchetto messo ✓ Da ora il telefono ti chiede l\'impronta o il PIN.');
    } catch (e) { L.inCorso = false; L.fallito = true; L.errore = 'Non è andata. Riprova.'; render(); }
  },
  'lucchetto-dopo'() { L.aperto = true; L.errore = ''; render(); },
  async 'lucchetto-google'() {
    L.errore = '';
    try { await Dati.rientra(); Lucchetto.metti(Dati.io.uid, null); L.fallito = false; }
    catch (e) {
      L.errore = e.code === 'auth/user-mismatch' ? 'Questo non è il tuo account: scegli quello con cui entri di solito.'
        : e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request' ? '' : 'Accesso non riuscito. Riprova.';
    }
    render();
  },
  'i-lucchetto'(el) {
    const io = chiLucchetto(), chi = el.dataset.chi || io;
    if (io === 'ospiti' || (chi !== io && chi !== 'ospiti' && !(io === 'mario' && chi === 'monica'))) return;   // ognuno il suo; Mario anche quello di Monica (Mario 08/11); gli ospiti Mario e Monica
    const i = MINUTI_LUCCHETTO.indexOf(minutiLucchetto(chi)) + Number(el.dataset.d);
    cambia('', () => { S.impostazioni.lucchetto = { ...tempiLucchetto(), [chi]: MINUTI_LUCCHETTO[Math.min(MINUTI_LUCCHETTO.length - 1, Math.max(0, i))] }; }, false); salvatoOk();
  },
  async 'lucchetto-esci'() {
    if (!L.esci) { L.esci = true; render(); setTimeout(() => { L.esci = false; if (UI.vista === 'impostazioni') render(); }, 5000); return; }
    const uid = Dati.io.uid;
    try { scriviVia(0); await Dati.esci(); } catch (e) {
      L.esci = false; render();
      mostraToast(e.code === 'in-attesa' ? 'Non esco ancora: alcune modifiche non sono salvate. Riprova quando c\'è la rete.' : 'Non sono riuscita a uscire. Riprova.');
      return;
    }
    Lucchetto.metti(uid, null); P.ruolo = 'cliente'; salvaP(); location.reload();
  }
});
if (Dati.attivo) Lucchetto.disponibile().then(v => { L.puo = v; render(); });

/* ---------- avvio ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  UI.tocco = el.dataset.a + '|' + (el.dataset.v || '');
  if (UI.avvisoTesto) { UI.avvisoTesto = ''; const n = $('.notifica'); if (n) n.remove(); }   // il riquadro della notifica sparisce al primo tocco   // solo il pulsante appena toccato fa lo «scatto» (C29)
  const f = A[el.dataset.a];
  if (f) f(el, e);
});
document.addEventListener('toggle', e => {
  const d = e.target;
  if (!d.matches || !d.matches('details.sez')) return;
  if (d.open) { UI.sez = d.dataset.sez; document.querySelectorAll('details.sez[open]').forEach(x => { if (x !== d) x.open = false; }); setTimeout(() => d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50); }
  else if (UI.sez === d.dataset.sez) UI.sez = null;
}, true);
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'file-foto') { caricaFoto(el); return; }
  if (el.classList.contains('file-menu')) {
    const i = Number(el.dataset.i);
    caricaFoto(el, dati => cambia(i < (S.menuFoto || []).length ? 'Foto del menù cambiata' : 'Foto del menù aggiunta', () => {
      S.menuFoto = (S.menuFoto || []).slice(0, 3); S.menuFoto[i] = dati;
      const vv = S.impostazioni.menuFotoV || [];
      S.impostazioni.menuFotoV = S.menuFoto.map((f, j) => f ? versioneFotoApp(f) : vv[j] || null);
    }));
    return;
  }
  if (el.dataset.campo && !['sel.testo', 'nota'].includes(el.dataset.campo)) salvaCampo(el);
});
/* cerca nello storico senza ridisegnare (la tastiera resta aperta): nasconde le righe che non c'entrano */
function cercaOrdini(q) {
  const t = q.trim().toLowerCase();
  let visti = 0;
  document.querySelectorAll('.ord-giorno').forEach(sez => {
    let qui = 0;
    sez.querySelectorAll('.ord-riga').forEach(r => { const si = !t || r.dataset.testo.includes(t); r.classList.toggle('nascosto', !si); if (si) qui++; });
    sez.classList.toggle('nascosto', !qui); visti += qui;
  });
  const n = $('.ord-nessuno'); if (n) n.classList.toggle('nascosto', visti > 0);
}
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.campo === 'sel.testo' || el.dataset.campo === 'nota') salvaCampo(el);
  if (el.dataset.cerca) suggerisci(el);
  if (el.dataset.spcerca) suggerisciSpesa(el);
  if (el.dataset.cercaord) cercaOrdini(el.value);
  if (el.id === 'nome-nuovo' && UI.foglio) UI.foglio.scritto = el.value;   // resta anche se la pagina si ridisegna (una foto che arriva)
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && UI.foglio) A.chiudi();
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.cerca) { e.preventDefault(); A['ing-aggiungi']({ dataset: { s: e.target.dataset.cerca } }); }
  if (e.key === 'Enter' && e.target.id === 'nuovo-nome') A['nuovo-avanti']();
  if (e.key === 'Enter' && e.target.id === 'benv-nome') { e.preventDefault(); const c = $('#benv-cognome'); if (c) c.focus(); }
  if (e.key === 'Enter' && e.target.id === 'benv-cognome') { e.preventDefault(); benvEntra(false); }
  if (e.key === 'Enter' && e.target.id === 'ing-spesa-nuova') { e.preventDefault(); A['sp-agg'](); }
});

/* tocco su una notifica (C27): sw.js apre «#vai=<tipo>» o, con l'app già aperta, lo manda come messaggio */
const vaiHash = location.hash.match(/^#vai=(\w{1,20})$/);
if (vaiHash) { UI.vaiDopo = vaiHash[1]; history.replaceState(null, '', location.pathname + location.search); }
if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.vai) { UI.vaiDopo = String(e.data.vai); if (S && P.ruolo) { vaiDaNotifica(); render(); } } });
function vaiDaNotifica() {
  const t = UI.vaiDopo; UI.vaiDopo = null;
  if (!t) return;
  setTimeout(() => { UI.avvisoTesto = ''; const n = $('.notifica'); if (n) n.remove(); }, 9000);
  UI.foglio = null; UI.modifica = null; UI.inCima = true;
  if (P.ruolo === 'monica' && /^qui(_\d+)?$/.test(t)) {   // «sono qui»: si apre l'ordine di chi aspetta sotto casa
    const o = S.ordini.find(x => x.n === Number(t.slice(4)));
    UI.vista = 'ordini'; UI.tab = o && o.entro > oggi() ? 'prossimi' : 'oggi'; UI.ordAperto = o ? o.id : null;
    UI.avvisoTesto = o ? `${nomeBreve((cliente(o.cliente) || {}).nome || 'Il cliente')} è qui sotto: ordine n. ${o.n} aperto qui sotto.` : 'Un cliente è qui sotto per il ritiro.';
    return;
  }
  if (P.ruolo === 'monica') {
    if (t === 'promemoria') { UI.vista = 'ordini'; UI.tab = 'prossimi'; UI.ordAperto = null; UI.avvisoTesto = 'Ecco gli ordini dei prossimi giorni: in cima quelli di domani.'; return; }
    if (t === 'richiesta' || t === 'primo') { UI.richViste = []; UI.vista = 'ordini'; return; }   // il riquadro delle persone nuove si apre da solo
    const g = daGuardare().slice().sort((a, b) => (b.tempi && b.tempi.nuovo || 0) - (a.tempi && a.tempi.nuovo || 0) || b.n - a.n);
    UI.vista = 'ordini'; UI.tab = 'nuovi'; UI.ordAperto = g.length ? g[0].id : null;
    UI.avvisoTesto = { ordine: 'Ordine nuovo: lo vedi qui sotto, già aperto.', risposta: 'Il cliente ha risposto sul giorno: lo vedi qui sotto.', modifica: 'Il cliente chiede una modifica: la vedi qui sotto.' }[t] || '';
    if (!g.length) { UI.tab = 'oggi'; UI.avvisoTesto = 'Già fatto: niente di nuovo da guardare.'; }
  } else {
    UI.vista = 'ordini';
    UI.avvisoTesto = t === 'proposta' ? 'Monica ti propone un altro giorno: rispondi qui sotto.' : t === 'pronto' ? 'Il tuo ordine è pronto: passa a ritirarlo.' : '';
  }
}
/* persone nuove che vogliono ordinare: a Monica si apre subito il riquadro per dire sì o no (Mario 07/11, C33) */
function foglioRichieste() {
  const rr = S.richieste || [];
  return `<div class="chiudi"><button type="button" class="icona" data-a="chiudi" aria-label="Chiudi">${ico('x')}</button></div><div class="dentro">
    <h1>${rr.length === 1 ? 'Una persona vuole ordinare' : rr.length + ' persone vogliono ordinare'}</h1>
    <p class="tenue" style="margin:0">Se la conosci, dille di sì: vedrà l'indirizzo e potrà ordinare da te.</p>
    ${rr.map(r => { const o = r.primo && ordine(r.primo);
      return `<section class="scheda"><h2 style="margin:0">${esc(r.nome)}</h2><span class="tenue piccolo">${r.cliente ? 'Dice che ha cambiato telefono' : r.tramite ? 'Amica di ' + esc(r.tramite) : 'Ha trovato il link'}${o && o.stato === 'daApprovare' ? ` · ha già ordinato: ${euro(totale(prezziGiusti(o.righe)))}` : ''}</span>${bottoniRichiesta(r)}</section>`; }).join('')}</div>
    <div class="piede"><button type="button" class="btn chiaro pieno" data-a="chiudi">Dopo</button></div>`;
}
function controllaRichieste() {
  if (P.ruolo !== 'monica' || !S || !S.richieste || !(Dati.attivo || UI.provaRichieste)) return;   // nell'anteprima di prova solo se acceso dalle prove
  if (UI.foglio && UI.foglio.tipo === 'richieste' && !S.richieste.length) { UI.foglio = null; return; }
  UI.richViste = UI.richViste || [];
  const nuove = S.richieste.filter(r => !UI.richViste.includes(r.id));
  if (!nuove.length || UI.foglio) return;
  UI.richViste.push(...nuove.map(r => r.id));
  UI.foglio = { tipo: 'richieste' };
}
if (/^#gestore(-m)?$/.test(location.hash)) { P.invitoGestore = location.hash === '#gestore-m' ? 'm' : true; if (Dati.attivo) salvaP(); }
render();
apertura();
if (Dati.attivo) avviaDati();
/* l'app si apre anche senza rete (sw.js); non nell'anteprima (riquadro) né da file */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && window.top === window) navigator.serviceWorker.register('sw.js').catch(() => {});

/* ---------- dati veri (motore «firebase», dati.js) ---------- */
let renderDopo = false;
const staScrivendo = () => { const a = document.activeElement; return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && !!($('#app').contains(a) || $('#foglio').contains(a)); };   /* anche le finestre (nota del piatto, nome): se no si chiude la tastiera */
function avviaDati() {
  const m = location.hash.match(/^#da=([\w-]{1,40})$/);
  if (m && !P.tramite) { P.tramite = m[1]; salvaP(); }
  Dati.avvia((nuovo, io) => {
    if (Dati.preparaVuoto(statoIniziale())) return;
    S = nuovo;
    if (!S.ingExtra) S.ingExtra = {};
    if (io.gestore) { spesaDalServer(); rinnovaAvvisi(); setTimeout(inviaAgenda, 0); }
    if (io.gestore && P.invitoGestore) { P.invitoGestore = false; salvaP(); }
    P.ruolo = io.gestore ? (UI.devCliente ? 'cliente' : 'monica') : 'cliente';
    P.cliente = io.utente && io.utente.stato === 'approvato' ? io.utente.cliente : null;
    if (P.cliente) rinnovaAvvisi();
    if (UI.vista === 'home' && P.ruolo === 'cliente') UI.vista = 'menu';
    if (UI.vaiDopo && (P.ruolo === 'cliente' || io.gestore)) vaiDaNotifica();
    /* mentre Monica scrive in un campo non si ridisegna: si aspetta che esca dal campo */
    if (staScrivendo()) { renderDopo = true; return; }
    render();
  }, st => {
    if (st.errore === 'permission-denied') mostraToast('Non salvato: questa modifica non è permessa.');
    else if (st.errore === 'non-pronto') mostraToast('Non salvato: l\'app non è ancora collegata. Rifallo appena c\'è la rete.');
    else if (st.errore) mostraToast('Non salvato: riprova tra poco.');
    else if (st.rete === false && st.inAttesa) mostraToast('Senza rete: si salverà appena torna.');
  }, { oggi, settimana, teglieOrdine, contaSettimane, ridisegna: () => { if (staScrivendo()) renderDopo = true; else render(); } }).catch(() => mostraToast('Non riesco a caricare il menù: controlla la rete e riapri l\'app.'));
}
addEventListener('online', () => { if (UI.riprova && P.carrello.length) inviaVero(); });

/* ordine vero: parte solo con la rete e con la conferma del server; se no resta nel carrello */
async function inviaVero() {
  if (UI.invio) return;
  if (!Dati.io.utente) { UI.foglio = { tipo: 'nome' }; render(); const i = $('#nome-nuovo'); if (i) i.focus(); return; }
  if (Dati.io.utente.stato === 'no') { mostraToast('Monica per ora non può prendere il tuo ordine.'); return; }
  const c = P.carrello, pronti = c.filter(r => r.pronto), dopo = c.filter(r => !r.pronto);
  if (dopo.length && !UI.entro) return;
  const prova = puoProvare() && UI.prova === true;
  const fai = (righe, entro, pronto) => ({ id: 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), n: 0, cliente: P.cliente,
    righe: righe.map(r => { const x = Object.assign({}, r); delete x.pronto; return x; }), entro, stato: 'nuovo', pronto, proposta: null,
    paga: { metodo: UI.metodo || 'contanti', dice: false, ricevuto: false }, nota: UI.nota.trim(), creato: oggi(), tempi: { nuovo: Date.now() }, cuori: {}, modifica: null, esitoModifica: '', ...(prova ? { prova: true, provaCliente: true } : {}) });
  /* telefono non ancora approvato da Monica: un solo ordine alla volta (regole dei dati). Prima dava «Non è partito» (Mario 07/11) */
  const u = Dati.io.utente, daApprovare = u.stato !== 'approvato';
  if (daApprovare && u.primo) {
    const p = ordine(u.primo);
    if (!p || p.stato !== 'annullato') { mostraToast('Attendi che Monica accetti la tua richiesta per ordinare da lei: il primo ordine lo ha già. Vuoi aggiungere piatti? Annullalo in «I miei ordini» e rifallo tutto insieme.'); return; }
  }
  const lista = [];
  if (daApprovare && pronti.length && dopo.length) lista.push([c.slice(), fai(c, UI.entro, false)]);   // primo ordine: tutto insieme, nel giorno scelto
  else {
    if (pronti.length) lista.push([pronti, fai(pronti, oggi(), true)]);
    if (dopo.length) lista.push([dopo, fai(dopo, UI.entro, false)]);
  }
  UI.invio = true; UI.riprova = false; render();
  try {
    await Dati.inviaOrdini(lista.map(x => x[1]));
    avvisaGestori(prova ? 'ordineProva' : daApprovare ? 'primo' : 'ordine');
    UI.prova = undefined;   // persona nuova: a Monica «accettala», in evidenza
    P.carrello = []; UI.entro = null; UI.nota = ''; UI.invio = false; salvaP(); vai('inviato');
  } catch (e) {
    UI.invio = false;
    lista.slice(0, e.partiti || 0).forEach(([righe]) => { P.carrello = P.carrello.filter(r => !righe.includes(r)); });
    if (e.code === 'finito') {
      P.carrello.forEach(r => { if (r.pronto && r.piatto === e.piatto) r.pronto = false; });
      mostraToast(`Mi dispiace: ${e.nome} pronto l'ha appena preso qualcun altro. Ora è da prenotare: scegli il giorno.`);
    } else if (e.code === 'unavailable' || !navigator.onLine) { UI.riprova = true; mostraToast('Non è partito: manca la rete. Riparte da solo appena torna.'); }
    else { console.warn('ordine', e && e.code); mostraToast(e && e.code === 'permission-denied' ? 'Non è partito: Monica deve ancora darti l\'ok. Scrivile su WhatsApp o riprova più tardi.' : `Non è partito (${(e && e.code) || 'errore'}). Riprova tra poco.`); }
    salvaP(); render();
  }
}
async function decidiGestore(uid, si) {
  const r = ((Dati.io.richiesteGestore) || []).find(x => x.uid === uid);
  if (!r) return;
  UI.gestDecido = true; render();
  try { await Dati.decidiGestore(uid, nomeBreve(r.nome), si); mostraToast(si ? `Fatto: ${nomeBreve(r.nome)} ora gestisce la cucina con te.` : 'Va bene: richiesta tolta.'); }
  catch (e) { mostraToast(e.code === 'unavailable' ? 'Manca la rete: riprova appena torna.' : 'Non è andata. Riprova tra poco.'); }
  UI.gestDecido = false; render();
}
function erroreNome(e, nome) {
  if (e.code === 'permission-denied' && nome) { UI.foglio = { tipo: 'nome', usato: nome }; render(); return; }
  mostraToast(e.code === 'chiuso' ? 'Monica in questo momento non prende clienti nuovi.' : e.code === 'nome' ? 'Scrivi nome e cognome.'
    : e.code === 'unavailable' ? 'Manca la rete: riprova appena torna.' : 'Non è andata. Riprova tra poco.');
}
function foglioNome() {
  const u = UI.foglio.usato;
  return `<h2>Come ti chiami?</h2>
    <p class="tenue">Scrivi nome e cognome: così Monica sa chi ordina. Te lo chiediamo una volta sola.</p>
    <input type="text" id="nome-nuovo" placeholder="Nome e cognome" aria-label="Nome e cognome" autocomplete="name" maxlength="60" value="${esc(u || UI.foglio.scritto || '')}">
    ${u ? `<p><b>Questo nome c'è già.</b> Sei tu con un telefono nuovo?</p>
      <div class="fila"><button type="button" class="btn pieno" data-a="nome-ricollega">Sì, sono io</button><button type="button" class="btn chiaro" data-a="nome-altro">No, scrivo un altro nome</button></div>`
    : `<button type="button" class="btn pieno" data-a="nome-ok">${ico('invito')}Invia l'ordine a Monica</button>`}`;
}
document.addEventListener('focusout', () => { if (renderDopo) setTimeout(() => { if (!staScrivendo() && renderDopo) { renderDopo = false; render(); } }, 0); });
