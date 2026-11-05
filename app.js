/* Pronti in Tavola · logica dell'app.
   Versione di prova: i dati restano su questo telefono (localStorage).
   Nella versione vera solo lo strato «Dati» (carica, salva) passa a Firebase: il resto non cambia. */
'use strict';

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
  tab: 'guardare', modifica: null, nuovo: null, guidaPasso: 0, proposta: null, salvato: false
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
const descRiga = r => [r.varianteNome, qtaTesto(r.tipo, r.qta, r.formatoNome)].filter(Boolean).join(' · ');
const totale = rr => arrot(rr.reduce((s, r) => s + r.prezzo * r.qta, 0));
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
const STATO_CLIENTE = { nuovo: 'Da confermare', proposta: 'Nuova data', accettato: 'Confermato', pronto: 'Pronto!', ritirato: 'Ritirato', rifiutato: 'Non disponibile', annullato: 'Annullato', daApprovare: 'Aspetta Monica' };
const STATO_MONICA = { nuovo: 'Nuovo', proposta: 'Aspetta risposta', accettato: 'Da preparare', pronto: 'Pronto', ritirato: 'Ritirato', rifiutato: 'Rifiutato', annullato: 'Annullato dal cliente', daApprovare: 'Cliente nuovo' };
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
  return Object.assign({}, r, { prezzo: v ? v.prezzo : prezzoOra(r) });
});
const daAccettare = o => ['nuovo', 'daApprovare'].includes(o.stato);
const daGuardare = () => S.ordini.filter(o => o.stato === 'nuovo' || o.modifica || richiestaDi(o) || (o.paga.dice && !o.paga.ricevuto && o.stato !== 'annullato'));
const mapsLink = () => { const r = S.impostazioni.ritiro; return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.via + ', ' + r.citta)}`; };
const numero = n => { const d = String(n || '').replace(/\D/g, ''); return d ? (d.length <= 10 ? '39' + d : d) : ''; };
const wa = (num, testo) => `https://wa.me/${numero(num)}?text=${encodeURIComponent(testo)}`;
const firmaMsg = '\nMonica · Pronti in Tavola';
function righeDaCarrello(rr) { return rr.map(r => Object.assign({}, r)); }

/* ---------- pezzi di pagina ---------- */
function foto(p, cls = '') {
  if (p.foto) return `<div class="foto ${cls}"><img src="${p.foto}" alt="${esc(p.nome)}"></div>`;
  return `<div class="foto segnaposto ${cls}" aria-hidden="true"><span>${esc(p.nome.charAt(0))}</span></div>`;
}
const YN = '<div class="yn" role="img" aria-label="YNOY Corp"><i class="ys"></i><i class="y1"></i><i class="y2"></i><i class="y3"></i><i class="y4"></i></div>';
const firma = () => `<footer class="firma">Powered by${YN}${Dati.attivo && !Dati.io.gestore && P.ruolo !== 'monica' ? '<br><button type="button" class="btn chiaro piccolo" data-a="entra-monica">Sei Monica? Entra</button>' : ''}</footer>`;
const filo = () => `<div class="filo" aria-hidden="true">${ico('spiga')}</div>`;
function striscia() {
  if (Dati.attivo) return '';
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
  return `<div class="riga-ord ${extra}"><b>${esc(r.nome)}</b><span class="prezzo">${euro(r.prezzo * r.qta)}</span>
    <span class="det">${esc(descRiga(r))}</span>
    ${r.note && r.note.length || r.testo ? `<span class="nota">${esc([...(r.note || []), r.testo].filter(Boolean).join(' · '))}</span>` : ''}</div>`;
}

/* ================= CLIENTE ================= */
function testataCliente() {
  const n = quanti(P.carrello);
  return `<header class="testata"><img class="marchio" src="${LOGO}" alt="">
    <div class="titolo"><b>Pronti in Tavola</b><span>Ciao ${esc(nomeBreve(cliente(P.cliente).nome))}!</span></div>
    <button type="button" class="icona aa" data-a="testo-grande" aria-pressed="${!!P.grande}" aria-label="Testo più grande">Aa</button>
    <button type="button" class="icona" data-a="vai" data-v="carrello" aria-label="Il tuo ordine: ${n} piatti">${ico('carrello')}${n ? `<span class="pallino">${n}</span>` : ''}</button></header>`;
}
function testataSemplice(titolo, indietro, etichetta = 'Indietro') {
  return `<header class="testata"><button type="button" class="indietro" data-a="vai" data-v="${indietro}">${ico('indietro')}${etichetta}</button>
    <div class="titolo"><b>${esc(titolo)}</b></div></header>`;
}

function vMenu() {
  const imp = S.impostazioni, cats = CATEGORIE.filter(([k]) => visibili().some(p => p.cat === k && p.disponibile));
  let h = testataCliente() + '<main class="corpo">';
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
  cats.forEach(([k, n], i) => {
    if (i) h += filo();
    h += `<section class="sezione" aria-labelledby="cat-${k}"><div class="cat-titolo" id="cat-${k}"><h2>${n}</h2><span></span></div>
      <div>${visibili().filter(p => p.cat === k && p.disponibile).map(voce).join('')}</div></section>`;
  });
  return h + '</main>';
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
  const testoWa = `Guarda cosa cucina Monica: ${p.nome}. Puoi ordinare anche tu da qui: ${S.impostazioni.indirizzoApp}${!Dati.attivo ? '' : P.ruolo === 'monica' ? '#da=monica' : P.cliente ? '#da=' + P.cliente : ''}`;
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
  if (p.scalda) h += `<div class="avviso">${ico('orologio')}<div><b>Come si prepara a casa</b><br>${esc(p.scalda)}</div></div>`;
  if (!anteprima) {
    if (p.note.length) h += `<div class="gruppo"><span class="etichetta">Vuoi qualcosa di diverso?</span><div class="scelte">${p.note.map(n =>
      `<button type="button" class="chip" data-a="sel-nota" data-v="${esc(n)}" aria-pressed="${s.note.includes(n)}">${esc(n)}</button>`).join('')}</div></div>`;
    h += `<a class="link" href="${wa('', testoWa)}" target="_blank" rel="noopener">Manda questo piatto a un'amica</a>`;
  }
  h += '</div>';
  if (!anteprima) h += `<div class="piede"><button type="button" class="btn pieno" data-a="aggiungi">${UI.modifica ? 'Aggiungi alla modifica' : pronto ? 'Lo prendo oggi' : 'Aggiungi'} · ${euro(prezzo * s.qta)}</button></div>`;
  return h;
}

function vCarrello() {
  const c = P.carrello;
  let h = testataSemplice('Il tuo ordine', 'menu', 'Menù') + '<main class="corpo">';
  if (!c.length) return h + `<div class="scheda" style="align-items:center;text-align:center"><h2>Il carrello è vuoto</h2><p class="tenue" style="margin:0">Scegli dal menù quello che ti va.</p><button type="button" class="btn" data-a="vai" data-v="menu">Guarda il menù</button></div></main>`;
  const pronti = c.map((r, i) => [r, i]).filter(([r]) => r.pronto), dopo = c.map((r, i) => [r, i]).filter(([r]) => !r.pronto);
  const imp = S.impostazioni, metodi = Object.keys(METODO).filter(m => imp.paga[m]);
  if (!metodi.includes(UI.metodo)) UI.metodo = metodi[0] || 'contanti';
  const riga = ([r, i]) => `<div class="riga-ord"><b>${esc(r.nome)}</b><span class="prezzo">${euro(r.prezzo * r.qta)}</span>
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
  h += `    <div class="gruppo"><label for="nota-ordine">Vuoi dire qualcosa a Monica? (se vuoi)</label><textarea id="nota-ordine" data-campo="nota" placeholder="es. polpette senza prezzemolo, passo dopo le 18">${esc(UI.nota)}</textarea></div>
    <div class="totale"><span>Totale</span><span>${euro(totale(c))}</span></div>
    <button type="button" class="btn pieno" data-a="invia" ${(dopo.length && !UI.entro) || UI.invio ? 'disabled' : ''}>${ico('invito')}${UI.invio ? 'Invio in corso…' : 'Invia l\'ordine a Monica'}</button>
    ${dopo.length && !UI.entro ? '<span class="tenue piccolo" style="text-align:center">Scegli prima il giorno.</span>' : ''}`;
  return h + '</main>';
}

function vInviato() {
  return `${testataCliente()}<main class="corpo"><div class="inviato"><div class="scoppio">${Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36}deg"></i>`).join('')}<div class="spunta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div></div>
    <h1>Ordine inviato!</h1><p class="tenue" style="margin:0">${Dati.attivo && Dati.io.utente && Dati.io.utente.stato !== 'approvato'
      ? 'È il tuo primo ordine: Monica lo guarda e ti conferma lei.' : 'A Monica è arrivata la notifica. Ti conferma lei il giorno.'}<br>Lo segui in «I miei ordini».</p>
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
  let h = `<article class="scheda ordine-carta"><header><div><h3>Ordine n. ${o.n}</h3><span class="tenue piccolo">${o.pronto ? 'Pronti subito, ritiro oggi' : ['accettato', 'pronto', 'ritirato'].includes(o.stato) ? 'Ritiro: ' + giornoLungo(o.entro) : 'Ti serve entro ' + giornoLungo(o.entro)}</span></div>
    <span class="stato ${o.stato}">${STATO_CLIENTE[o.stato]}</span></header>`;
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
  if (o.stato === 'ritirato' || chiuso) az.push(`<button type="button" class="btn chiaro" data-a="riordina" data-id="${o.id}">Ordina di nuovo</button>`);
  if (az.length) h += `<div class="fila larga">${az.join('')}</div>`;
  if (o.stato === 'nuovo' && !o.modifica) h += `<button type="button" class="link" data-a="annulla-ordine" data-id="${o.id}">Annulla l'ordine</button>`;
  return h + '</article>';
}
function vOrdiniCliente() {
  const lista = S.ordini.filter(o => o.cliente === P.cliente).sort((a, b) => b.n - a.n);
  let h = testataCliente() + '<main class="corpo"><h1>I miei ordini</h1>';
  if (!lista.length) h += '<p class="tenue">Non hai ancora ordinato.</p>';
  /* l'indirizzo sta dopo l'ordine più recente: si trova senza scorrere anche con tanti ordini vecchi */
  return h + lista.slice(0, 1).map(cartaOrdineCliente).join('') + schedaRitiro() + lista.slice(1).map(cartaOrdineCliente).join('') + '</main>';
}

function vModifica() {
  const m = UI.modifica, o = S.ordini.find(x => x.id === m.ordine);
  let h = `<header class="testata"><button type="button" class="indietro" data-a="modifica-esci">${ico('x')}Lascia stare</button><div class="titolo"><b>Cambia l'ordine n. ${o.n}</b></div></header><main class="corpo">
    <p class="tenue" style="margin:0">Cambia le quantità, togli o aggiungi piatti. Monica deve approvare.</p><section class="scheda">`;
  h += m.righe.length ? m.righe.map((r, i) => `<div class="riga-ord"><b>${esc(r.nome)}</b><span class="prezzo">${euro(r.prezzo * r.qta)}</span><span class="det">${esc(descRiga(r))}</span>
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
const NOMI_VISTE = { home: 'Home', ordini: 'Ordini', piatti: 'I miei piatti', piatto: 'Modifica piatto', nuovo: 'Nuovo piatto', clienti: 'Clienti', impostazioni: 'Impostazioni' };
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
  h += `<div><h1>Ciao Monica</h1><p class="tenue" style="margin:4px 0 0">${n ? `Hai <b>${n}</b> ${n === 1 ? 'cosa' : 'cose'} da guardare negli ordini.` : 'Nessun ordine nuovo da guardare.'}</p></div>
    <div class="riquadri">
      <button type="button" class="riquadro primo" data-a="vai" data-v="ordini">${ico('ordini')}${n ? `<span class="pallino">${n}</span>` : ''}<div><b>Ordini</b><br><small>Accetta e prepara</small></div></button>
      <button type="button" class="riquadro" data-a="vai" data-v="piatti">${ico('piatti')}<div><b>I miei piatti</b><br><small>Foto, prezzi, pronti</small></div></button>
      <button type="button" class="riquadro" data-a="vai" data-v="clienti">${ico('clienti')}${S.richieste.length ? `<span class="pallino">${S.richieste.length}</span>` : ''}<div><b>Clienti</b><br><small>Invita e approva</small></div></button>
      <button type="button" class="riquadro" data-a="vai" data-v="impostazioni">${ico('impostazioni')}<div><b>Impostazioni</b><br><small>Pausa e ferie</small></div></button>
    </div>
    <section class="scheda"><header class="fila"><h2 style="flex:1">Pronti subito oggi</h2></header>
      ${pronti.length ? `<ul style="margin:0;padding-left:18px">${pronti.map(p => { const f = p.formati.find(x => x.id === p.pronto.formato) || p.formati[0]; return `<li><b>${esc(p.nome)}</b>: ${qtaTesto(f.tipo, p.pronto.qta, f.nome)}</li>`; }).join('')}</ul>` : '<p class="tenue" style="margin:0">Hai qualcosa già pronto? Segnalo: i clienti lo vedono in cima al menù.</p>'}
      <button type="button" class="btn ${pronti.length ? 'chiaro' : ''} pieno" data-a="apri-pronti">${ico('fiamma')}${pronti.length ? 'Cambia i pronti' : 'Segna cosa hai pronto'}</button></section>
    <section class="scheda"><h2>Da preparare</h2>${agenda()}</section>`;
  return h + '</main>';
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
    proposta: `Ciao ${nomeBreve(c.nome)}! Per il tuo ordine n. ${o.n} ti propongo ${giornoLungo(o.proposta)}. Rispondi dall'app con un tocco: ${S.impostazioni.indirizzoApp}`,
    accettato: `Ciao ${nomeBreve(c.nome)}! Ho confermato il tuo ordine n. ${o.n} per ${giornoLungo(o.entro)}.`
  };
  return wa(c.telefono || '', testi[tipo] + firmaMsg);
}
function cartaOrdineMonica(o) {
  const r = richiestaDi(o), righe = daAccettare(o) ? prezziGiusti(o.righe) : o.righe;
  let h = `<article class="scheda ordine-carta"><header><div><h3>${esc(chiOrdina(o))}</h3><span class="tenue piccolo">Ordine n. ${o.n} · ${o.pronto ? 'pronti subito, ritiro oggi' : ['accettato', 'pronto'].includes(o.stato) ? 'ritiro ' + giornoLungo(o.entro) : 'le serve entro ' + giornoLungo(o.entro)}</span></div>
    <span class="stato ${o.stato}">${r && r.cliente ? 'Telefono nuovo' : STATO_MONICA[o.stato]}</span></header>`;
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
  if (!['rifiutato', 'annullato', 'daApprovare'].includes(o.stato)) {
    const pg = o.paga;
    h += `<div class="fila" style="justify-content:space-between"><span><b>${METODO[pg.metodo]}</b> · ${pg.ricevuto ? '<span style="color:var(--basilico);font-weight:800">soldi ricevuti ✓</span>' : pg.dice ? '<span style="color:var(--cotto);font-weight:800">dice che ha pagato: controlla</span>' : 'da ricevere'}</span>
      ${!pg.ricevuto && (pg.dice || ['accettato', 'pronto', 'ritirato'].includes(o.stato) && (pg.metodo !== 'contanti' || o.stato !== 'accettato')) ? `<button type="button" class="btn chiaro piccolo" data-a="ricevuto" data-id="${o.id}">${ico('euro')}Soldi ricevuti</button>` : ''}</div>`;
  }
  if (r) h += bottoniRichiesta(r);
  if (!o.modifica) {
    if (o.stato === 'nuovo') h += `<div class="fila larga"><button type="button" class="btn verde" data-a="accetta" data-id="${o.id}">${ico('spunta')}Accetta</button>${o.pronto ? '' : `<button type="button" class="btn chiaro" data-a="proponi" data-id="${o.id}">Proponi un altro giorno</button>`}</div>
      <button type="button" class="link" data-a="rifiuta" data-id="${o.id}">Non posso farlo</button>`;
    if (o.stato === 'accettato') h += `<a class="btn verde pieno" data-a="pronto" data-id="${o.id}" href="${waOrdine(o, 'pronto')}" target="_blank" rel="noopener">${ico('chat')}È pronto: avvisa su WhatsApp</a>
      <button type="button" class="link" data-a="pronto-muto" data-id="${o.id}">Segna pronto senza messaggio</button>`;
    if (o.stato === 'pronto') h += `<button type="button" class="btn pieno" data-a="ritirato" data-id="${o.id}">${ico('spunta')}Ritirato</button>`;
  }
  return h + '</article>';
}
function vOrdiniMonica() {
  const gruppi = {
    guardare: daGuardare().sort((a, b) => a.entro.localeCompare(b.entro)),
    preparare: S.ordini.filter(o => (o.stato === 'accettato' || o.stato === 'proposta') && !o.modifica).sort((a, b) => a.entro.localeCompare(b.entro)),
    pronti: S.ordini.filter(o => o.stato === 'pronto' && !o.modifica),
    finiti: S.ordini.filter(o => ['ritirato', 'rifiutato', 'annullato'].includes(o.stato) && !daGuardare().includes(o)).sort((a, b) => b.n - a.n).slice(0, 20)
  };
  const nomi = { guardare: 'Da guardare', preparare: 'Da preparare', pronti: 'Pronti', finiti: 'Finiti' };
  let h = testataMonica('Ordini', 'home') + `<main class="corpo"><nav class="schede-cat" aria-label="Tipi di ordini" style="top:65px">${Object.keys(gruppi).map(k =>
    `<button type="button" class="chip" data-a="tab" data-v="${k}" aria-pressed="${UI.tab === k}">${nomi[k]}${k !== 'finiti' ? ` (${gruppi[k].length})` : ''}</button>`).join('')}</nav>`;
  const lista = gruppi[UI.tab];
  if (UI.tab === 'preparare') {
    const cucina = daCucinare(lista.filter(o => o.stato === 'accettato'));
    if (cucina.length) h += `<section class="scheda"><h2>Cosa cucinare</h2>${cucina.map(([g, piatti]) => `<div class="gruppo"><span class="etichetta">${maiuscola(giornoLungo(g))}</span>
      <ul style="margin:0;padding-left:18px">${Object.values(piatti).map(x => `<li><b>${esc(x.nome)}</b>${x.varianteNome ? ' ' + esc(x.varianteNome.toLowerCase()) : ''}: ${qtaTesto(x.tipo, x.qta, x.formatoNome)}${x.note.length ? `<br><span style="color:var(--cotto);font-weight:800">${esc(x.note.join(' · '))}</span>` : ''}</li>`).join('')}</ul></div>`).join('')}</section>`;
  }
  if (!lista.length) h += `<p class="tenue">${{ guardare: 'Niente da guardare. Ti arriva una notifica a ogni ordine nuovo.', preparare: 'Niente da preparare.', pronti: 'Nessun ordine pronto da ritirare.', finiti: 'Ancora nessun ordine finito.' }[UI.tab]}</p>`;
  return h + lista.map(cartaOrdineMonica).join('') + '</main>';
}

function vPiatti() {
  let h = testataMonica('I miei piatti', 'home') + `<main class="corpo"><button type="button" class="btn pieno" data-a="nuovo-piatto">${ico('piu')}Aggiungi un piatto</button>
    <p class="tenue" style="margin:0">Tocca un piatto per cambiare foto, prezzi e ingredienti. L'interruttore lo toglie o lo rimette nel menù.</p>`;
  const daControllare = visibili().filter(p => !p.controllato).length;
  if (daControllare) h += `<div class="avviso">${ico('aiuto')}<div>Ho preparato una bozza di ingredienti e allergeni per <b>${daControllare} piatti</b>. Aprili uno alla volta e controlla.</div></div>`;
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
  let h = testataMonica(p.nome, 'piatti') + '<main class="corpo">';
  h += `<section class="scheda" style="padding:0;overflow:hidden">${foto(p, 'grande')}<div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:8px">
    <label class="btn chiaro pieno" for="file-foto">${ico('foto')}${p.foto ? 'Cambia la foto' : 'Aggiungi una foto'}</label><input type="file" id="file-foto" accept="image/*" class="nascosto" data-id="${p.id}">
    <span class="tenue piccolo">La foto viene migliorata da sola: più luce e colori caldi.</span>
    ${p.foto ? '<button type="button" class="link" data-a="togli-foto">Togli la foto</button>' : ''}</div></section>`;
  h += `<section class="scheda"><h2>Pronto subito oggi</h2><p class="tenue" style="margin:0">Ne hai già pronto? Scrivi quanti: i clienti lo vedono in cima al menù e non devono prenotare.</p>
    ${p.formati.length > 1 ? `<div class="scelte">${p.formati.map(f => `<button type="button" class="scelta" data-a="p-pronto-formato" data-v="${f.id}" aria-pressed="${fp.id === f.id}">${esc(f.nome)}</button>`).join('')}</div>` : ''}
    <div class="fila">${passo('p-pronto', fp.tipo === 'kg' ? NUM.format(qp) + ' kg' : qp)}<span class="tenue">${qp ? 'Si azzera da solo domani.' : 'Nessuno pronto.'}</span></div></section>`;
  h += `<section class="scheda"><h2>Nome</h2><input type="text" data-campo="p.nome" value="${esc(p.nome)}" aria-label="Nome del piatto">
    <label class="etichetta" for="p-sotto" style="font-weight:800">Una riga sotto il nome (se vuoi)</label><input type="text" id="p-sotto" data-campo="p.sotto" value="${esc(p.sotto)}" placeholder="es. da friggere a casa">
    <span class="etichetta" style="font-weight:800">Parte del menù</span><div class="scelte">${CATEGORIE.map(([k, n]) => `<button type="button" class="scelta" data-a="p-cat" data-v="${k}" aria-pressed="${p.cat === k}">${n}</button>`).join('')}</div></section>`;
  h += `<section class="scheda"><h2>Prezzi</h2>${p.formati.map(f => `<div class="formato-riga"><b>${esc(f.nome)}</b><input type="number" inputmode="decimal" step="0.5" min="0" data-campo="p.prezzo" data-f="${f.id}" value="${f.prezzo}" aria-label="Prezzo ${esc(f.nome)} in euro">
      ${p.formati.length > 1 ? `<button type="button" class="icona" data-a="p-formato-togli" data-f="${f.id}" aria-label="Togli ${esc(f.nome)}">${ico('cestino')}</button>` : '<span></span>'}</div>`).join('')}
    <span class="tenue piccolo">Prezzo in euro${p.formati.some(f => f.tipo === 'kg') ? ', al chilo' : ''}.</span>
    ${mancano.length ? `<span class="etichetta" style="font-weight:800">Aggiungi un formato</span><div class="scelte">${mancano.map(([k, n]) => `<button type="button" class="chip" data-a="p-formato-aggiungi" data-v="${k}">${ico('piu')}${n}</button>`).join('')}</div>` : ''}</section>`;
  h += `<section class="scheda"><h2>Gusti</h2><p class="tenue" style="margin:0">Se il piatto ha più gusti (es. ricotta, spinaci), il cliente sceglie.</p>
    ${p.varianti.map(v => `<div class="scheda" style="box-shadow:none;background:#fff"><div class="fila" style="flex-wrap:nowrap"><input type="text" data-campo="v.nome" data-v="${v.id}" value="${esc(v.nome)}" aria-label="Nome del gusto">
      <button type="button" class="icona" data-a="v-togli" data-v="${v.id}" aria-label="Togli il gusto ${esc(v.nome)}">${ico('cestino')}</button></div>
      <label class="piccolo" style="font-weight:800">Prezzo diverso (${esc(p.formati[0].nome.toLowerCase())}, se serve)</label><input type="number" inputmode="decimal" step="0.5" data-campo="v.prezzo" data-v="${v.id}" value="${v.prezzi && v.prezzi[p.formati[0].id] != null ? v.prezzi[p.formati[0].id] : ''}" placeholder="uguale">
      <span class="piccolo" style="font-weight:800">Ingredienti in più</span>${editorIng(p, v.id)}</div>`).join('')}
    <button type="button" class="btn chiaro" data-a="v-aggiungi">${ico('piu')}Aggiungi un gusto</button></section>`;
  h += `<section class="scheda"><h2>Ingredienti</h2>${editorIng(p, 'base')}
    <span class="etichetta" style="font-weight:800">Allergeni, calcolati da soli</span>${all.length ? `<div class="allergeni">${all.map(a => `<span>${NOME_ALL[a]}</span>`).join('')}</div>` : '<span class="tenue">Nessuno.</span>'}
    ${vegetariano(p) ? '<span class="eti veg" style="align-self:flex-start">Vegetariano: lo scrivo da solo nel menù</span>' : ''}</section>`;
  h += `<section class="scheda"><h2>Richieste veloci</h2><p class="tenue" style="margin:0">Tasti pronti per il cliente, es. «Poco sale».</p>
    <div class="ingr-lista">${p.note.map((n, i) => `<span class="chip">${esc(n)}<button type="button" data-a="nota-togli" data-i="${i}" aria-label="Togli ${esc(n)}">${ico('x')}</button></span>`).join('')}</div>
    <div class="fila" style="flex-wrap:nowrap"><input type="text" id="nota-nuova" placeholder="es. Senza cipolla" aria-label="Nuova richiesta veloce"><button type="button" class="btn piccolo" data-a="nota-aggiungi">Aggiungi</button></div></section>`;
  h += `<section class="scheda"><h2>Come si prepara a casa</h2><textarea data-campo="p.scalda" placeholder="es. Forno a 180 °C per 20 minuti" aria-label="Come si prepara a casa">${esc(p.scalda)}</textarea></section>`;
  h += `<section class="scheda"><label class="interr"><span>Nel menù<small>Spento: i clienti non lo vedono</small></span><input type="checkbox" data-campo="disp" data-id="${p.id}" ${p.disponibile ? 'checked' : ''}></label>
    <label class="interr"><span>Novità<small>Etichetta «Novità» per 2 settimane</small></span><input type="checkbox" data-campo="p.novita" ${novita(p) ? 'checked' : ''}></label></section>`;
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
  const conta = id => S.ordini.filter(o => o.cliente === id).length;
  const ordineDi = r => { const o = r.primo && ordine(r.primo); return o && o.stato === 'daApprovare' ? o : null; };
  const riga = r => { const o = ordineDi(r);
    return `<div class="gruppo" style="border-bottom:1px dashed var(--riga);padding-bottom:12px"><div><b>${esc(r.nome)}</b><br><span class="tenue piccolo">${r.cliente ? 'Dice che ha cambiato telefono' : r.tramite ? 'Amica di ' + esc(r.tramite) : 'Ha trovato il link'}
      · ${o ? `ha ordinato: ${euro(totale(prezziGiusti(o.righe)))}, ${o.pronto ? 'pronti subito' : 'entro ' + giornoLungo(o.entro)}` : 'non ha ancora ordinato'}</span></div>${bottoniRichiesta(r)}</div>`; };
  const nuovi = S.richieste.filter(r => !r.cliente), telefoni = S.richieste.filter(r => r.cliente);
  const testo = `Ciao! Qui vedi cosa cucino e puoi ordinare: ${S.impostazioni.indirizzoApp}#da=monica`;
  return `${testataMonica('Clienti', 'home')}<main class="corpo">
    ${telefoni.length ? `<section class="scheda"><h2>Telefono nuovo</h2><p class="tenue" style="margin:0">Hanno lo stesso nome di un tuo cliente. Se è proprio lei, ricollega: ritrova i suoi ordini.</p>${telefoni.map(riga).join('')}</section>` : ''}
    ${nuovi.length ? `<section class="scheda"><h2>Nuovi</h2><p class="tenue" style="margin:0">Se la conosci, dille di sì: vedrà l'indirizzo e potrà ordinare.</p>${nuovi.map(riga).join('')}</section>` : ''}
    <section class="scheda"><h2>Fai conoscere la tua cucina</h2><p class="tenue" style="margin:0">Manda il link a chi vuoi: vede il menù e al primo ordine scrive il suo nome. Poi decidi tu.</p>
      <a class="btn pieno" href="${wa('', testo)}" target="_blank" rel="noopener">${ico('invito')}Manda il link su WhatsApp</a>
      <label class="interr"><span>Accetta clienti nuovi<small>Spento: chi ha il link vede il menù, ma non può fare il primo ordine.</small></span><input type="checkbox" data-campo="i.nuovi" ${S.impostazioni.nuovi !== false ? 'checked' : ''}></label></section>
    <section class="scheda"><h2>I tuoi clienti</h2>${S.clienti.map(c => `<div class="fila" style="justify-content:space-between;border-bottom:1px dashed var(--riga);padding:8px 0"><div><b>${esc(c.nome)}</b><br><span class="tenue piccolo">${c.invitato && !conta(c.id) ? 'Invitata, non ha ancora ordinato' : `${conta(c.id)} ordini · dal ${F_DATA.format(daIso(c.da))}`}</span></div></div>`).join('')}</section></main>`;
}

function vImpostazioni() {
  const i = S.impostazioni;
  const sw = (campo, val, t, s) => `<label class="interr"><span>${t}${s ? `<small>${s}</small>` : ''}</span><input type="checkbox" data-campo="${campo}" ${val ? 'checked' : ''}></label>`;
  return `${testataMonica('Impostazioni', 'home')}<main class="corpo">
    <section class="scheda"><h2>Pausa</h2>${sw('i.pausa.attiva', i.pausa.attiva, 'Sono in pausa', 'I clienti ordinano solo per dopo')}
      ${i.pausa.attiva ? `<label for="pausa-fino" style="font-weight:800">Fino a (compreso)</label><input type="date" id="pausa-fino" data-campo="i.pausa.fino" value="${i.pausa.fino}">` : ''}</section>
    <section class="scheda"><h2>Pronti subito</h2><label for="pronti-fino" style="font-weight:800">Ritiro entro le</label><input type="time" id="pronti-fino" data-campo="i.prontiFino" value="${esc(i.prontiFino)}"></section>
    <section class="scheda"><label class="interr"><span>Testo grande<small>Per leggere meglio</small></span><input type="checkbox" data-campo="p.grande" ${P.grande ? 'checked' : ''}></label>
      <button type="button" class="link" data-a="rivedi-guida">Rivedi la guida</button></section>
    <button type="button" class="btn chiaro pieno" data-a="altre-imp" aria-expanded="${!!UI.altreImp}">${ico('impostazioni')}${UI.altreImp ? 'Chiudi le altre impostazioni' : 'Altre impostazioni (le sistema Mario)'}</button>
    ${UI.altreImp ? `<p class="tenue piccolo" style="margin:0">Cose che si cambiano di rado: nel dubbio chiedi a Mario.</p>
    <section class="scheda"><h2>Giorni di anticipo</h2><p class="tenue" style="margin:0">Quanti giorni prima devono ordinare.</p>
      <div class="fila">${passo('i-anticipo', i.anticipo)}<span class="tenue">${i.anticipo === 0 ? 'anche per oggi' : i.anticipo === 1 ? 'giorno' : 'giorni'}</span></div></section>
    <section class="scheda"><h2>Limite della settimana</h2>${sw('i.limite.attivo', i.limite.attivo, 'Metti un limite', 'Arrivata al limite, i giorni di quella settimana si chiudono')}
      ${i.limite.attivo ? `<div class="fila">${passo('i-limite', i.limite.teglie)}<span class="tenue">teglie e torte a settimana</span></div>` : ''}</section>
    <section class="scheda natale-imp"><h2>Menù di Natale</h2>${sw('i.natale.attivo', i.natale.attivo, 'Mostra il menù di Natale', 'Compare in cima, con la sua data limite')}
      ${i.natale.attivo ? `<label for="natale-entro" style="font-weight:800">Ordini entro</label><input type="date" id="natale-entro" data-campo="i.natale.entro" value="${i.natale.entro}">
      <span class="etichetta" style="font-weight:800">Piatti del menù di Natale</span><div class="scelte">${visibili().map(p => `<button type="button" class="chip" data-a="natale-piatto" data-id="${p.id}" aria-pressed="${i.natale.piatti.includes(p.id)}">${esc(p.nome)}</button>`).join('')}</div>` : ''}</section>
    <section class="scheda"><h2>Pagamenti</h2>${sw('i.paga.contanti', i.paga.contanti, 'Contanti al ritiro')}${sw('i.paga.bonifico', i.paga.bonifico, 'Bonifico istantaneo')}
      ${i.paga.bonifico ? `<input type="text" data-campo="i.paga.iban" value="${esc(i.paga.iban)}" placeholder="IBAN, es. IT60 X054 2811 1010 0000 0123 456" aria-label="IBAN"><input type="text" data-campo="i.paga.intestataria" value="${esc(i.paga.intestataria)}" placeholder="Intestato a" aria-label="Intestato a">` : ''}
      ${sw('i.paga.postepay', i.paga.postepay, 'Postepay a Postepay')}${i.paga.postepay ? `<input type="tel" data-campo="i.paga.telefonoPostepay" value="${esc(i.paga.telefonoPostepay)}" placeholder="Numero collegato alla Postepay" aria-label="Numero Postepay">` : ''}</section>
    <section class="scheda"><h2>Dove ritirano</h2><input type="text" data-campo="i.ritiro.via" value="${esc(i.ritiro.via)}" aria-label="Via"><input type="text" data-campo="i.ritiro.citta" value="${esc(i.ritiro.citta)}" aria-label="Città">
      <label for="rit-nota" style="font-weight:800">Come trovarti</label><input type="text" id="rit-nota" data-campo="i.ritiro.nota" value="${esc(i.ritiro.nota)}"></section>
    <section class="scheda"><h2>Numeri</h2><label for="n-wa" style="font-weight:800">Il tuo WhatsApp</label><input type="tel" id="n-wa" data-campo="i.whatsapp" value="${esc(i.whatsapp)}" placeholder="es. 333 123 4567">
      <label for="n-mario" style="font-weight:800">Numero di Mario (per «Chiedi a Mario»)</label><input type="tel" id="n-mario" data-campo="i.mario" value="${esc(i.mario)}" placeholder="es. 333 123 4567"></section>
    ${Dati.attivo ? vSicurezza() : ''}
    ${Dati.attivo ? '' : '<button type="button" class="link" data-a="ricomincia" style="color:var(--allarme)">Ricomincia la prova da capo</button>'}` : ''}</main>`;
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
  ['Qui arrivano gli ordini', 'Il numero ti dice quanti ne devi guardare. A ogni ordine nuovo ti arriva anche la notifica sul telefono.'],
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
    default: return vHome();
  }
}
let ultimaVista = '', ultimoFoglio = '';
function render() {
  document.documentElement.classList.toggle('grande', !!P.grande);
  const y = window.scrollY, f = $('.foglio'), fy = f ? f.scrollTop : 0;
  const attivo = document.activeElement && document.activeElement.id;
  const chiuso = statoLucchetto();   /* la parte di Monica col lucchetto: nessun dato nella pagina finché non si apre */
  $('#app').innerHTML = striscia() + (chiuso ? vLucchetto(chiuso) : P.ruolo === 'monica' ? vistaMonica() : vistaCliente()) + firma();
  $('#barra').innerHTML = P.ruolo === 'cliente' ? barraCliente() : '';
  $('#barra').classList.toggle('nascosto', P.ruolo !== 'cliente');
  document.body.classList.toggle('con-barra', P.ruolo === 'cliente');
  const chiaveFoglio = UI.foglio ? UI.foglio.tipo + (UI.foglio.id || '') : '';
  let fh = '';
  if (UI.foglio && !chiuso) {
    const dentro = UI.foglio.tipo === 'piatto' ? foglioPiatto() : UI.foglio.tipo === 'pronti' ? foglioPronti() : UI.foglio.tipo === 'nome' ? foglioNome() : UI.foglio.tipo === 'allergie' ? foglioAllergie() : foglioGiorni();
    fh = `<div class="velo" data-a="chiudi-fuori"><div class="foglio" role="dialog" aria-modal="true">${dentro}</div></div>`;
  }
  $('#foglio').innerHTML = fh;
  if (fh && chiaveFoglio === ultimoFoglio) $('.foglio').scrollTop = fy;
  if (UI.vista !== ultimaVista && $('main.corpo')) $('main.corpo').classList.add('entra');
  $('#guida').innerHTML = P.ruolo === 'monica' && !chiuso && !P.guida && UI.vista === 'home' ? guida() : '';
  document.body.style.overflow = UI.foglio ? 'hidden' : '';
  if (UI.vista === ultimaVista) window.scrollTo(0, y); else window.scrollTo(0, 0);
  if (attivo && document.getElementById(attivo) && /^(ing-|nota-nuova)/.test(attivo)) document.getElementById(attivo).focus();
  ultimaVista = UI.vista; ultimoFoglio = chiaveFoglio;
  if (chiuso === 'chiuso') setTimeout(provaApri, 0);
}

/* ================= AZIONI ================= */
function vai(v) {
  clearTimeout(tToast); $('#toast').innerHTML = ''; fnAnnulla = null;
  if (v === 'nuovo') UI.nuovo = { passo: 1, nome: '', cat: '', modo: '', prezzi: {} };
  if (v === 'ordini' && P.ruolo === 'monica' && daGuardare().length) UI.tab = 'guardare';
  UI.vista = v; UI.foglio = null; UI.salvato = false; render();
}
function aggiungiRiga(lista, r) {
  const k = x => [x.piatto, x.formato, x.variante, x.note.join(','), x.testo, !!x.pronto].join('|');
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

const A = {
  annulla() { if (fnAnnulla) { const f = fnAnnulla; fnAnnulla = null; $('#toast').innerHTML = ''; f(); } },
  async 'nome-ok'() {
    const i = $('#nome-nuovo'), nome = (i ? i.value : '').trim().replace(/\s+/g, ' ');
    if (nome.length < 3 || !nome.includes(' ')) { mostraToast('Scrivi nome e cognome.'); if (i) i.focus(); return; }
    try { await Dati.registra(nome, P.tramite || '', false); UI.foglio = null; inviaVero(); } catch (e) { erroreNome(e, nome); }
  },
  async 'nome-ricollega'() {
    try { await Dati.registra(UI.foglio.usato, P.tramite || '', true); UI.foglio = null; inviaVero(); } catch (e) { erroreNome(e); }
  },
  'nome-altro'() { UI.foglio = { tipo: 'nome' }; render(); const i = $('#nome-nuovo'); if (i) i.focus(); },
  'entra-monica'() { Dati.entraGoogle().catch(() => mostraToast('Accesso non riuscito. Riprova.')); },
  ruolo(el) { P.ruolo = el.dataset.v; salvaP(); UI.foglio = null; UI.modifica = null; vai(P.ruolo === 'monica' ? 'home' : 'menu'); if (P.ruolo === 'monica') notificaMonica(); },
  vai(el) { vai(el.dataset.v); },
  cat(el) { UI.cat = el.dataset.v; const t = document.getElementById('cat-' + el.dataset.v); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.querySelectorAll('[data-a="cat"]').forEach(b => b.setAttribute('aria-pressed', b === el)); },
  piatto(el) { apriPiatto(el.dataset.id, !!el.dataset.pronto); },
  chiudi() { chiudiFoglio(); },
  'altre-imp'() { UI.altreImp = !UI.altreImp; render(); },
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
    const r = { piatto: p.id, nome: p.nome, formato: f.id, formatoNome: f.nome, tipo: f.tipo, variante: v ? v.id : '', varianteNome: v ? v.nome : '', qta: s.qta, prezzo: prezzoDi(p, f.id, s.variante), note: s.note.slice(), testo: s.testo.trim(), pronto: !!UI.foglio.pronto };
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
    if (Dati.attivo) { inviaVero(); return; }
    const c = P.carrello, pronti = c.filter(r => r.pronto), dopo = c.filter(r => !r.pronto);
    for (const r of pronti) {
      const p = piatto(r.piatto);
      if (!p.pronto || p.pronto.giorno !== oggi() || p.pronto.qta < r.qta) { mostraToast(`${r.nome}: ne restano ${p.pronto ? p.pronto.qta : 0}. Cambia la quantità.`); return; }
    }
    const nuovo = (righe, entro, pronto) => {
      const o = { id: 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), n: S.prossimoNumero++, cliente: P.cliente, righe: righe.map(r => { const x = Object.assign({}, r); delete x.pronto; return x; }), entro, stato: 'nuovo', pronto, paga: { metodo: UI.metodo || 'contanti', dice: false, ricevuto: false }, nota: UI.nota.trim(), creato: oggi(), cuori: {} };
      S.ordini.push(o);
    };
    if (dopo.length) nuovo(dopo, UI.entro, false);
    if (pronti.length) { nuovo(pronti, oggi(), true); pronti.forEach(r => { const p = piatto(r.piatto); p.pronto.qta = arrot(p.pronto.qta - r.qta); }); }
    P.carrello = []; UI.entro = null; UI.nota = ''; salva(); salvaP(); vai('inviato');
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
  },
  'annulla-ordine'(el) { const o = ordine(el.dataset.id); cambia('Ordine annullato', () => { o.stato = 'annullato'; rimettiPronti(o); }); },
  'proposta-si'(el) { const o = ordine(el.dataset.id); cambia('Perfetto, giorno confermato', () => { o.entro = o.proposta; o.proposta = null; o.stato = 'accettato'; }, false); },
  'proposta-altro'(el) { UI.foglio = { tipo: 'giorno', id: el.dataset.id }; UI.proposta = null; render(); },
  proponi(el) { UI.foglio = { tipo: 'proponi', id: el.dataset.id }; UI.proposta = null; render(); },
  'scegli-giorno'(el) { UI.proposta = el.dataset.v; render(); },
  'conferma-giorno'() {
    const { tipo, id } = UI.foglio, o = ordine(id), g = UI.proposta;
    UI.foglio = null; UI.proposta = null;
    if (tipo === 'proponi') cambia(`Proposta mandata: ${giornoLungo(g)}`, () => { if (daAccettare(o)) o.righe = prezziGiusti(o.righe); o.proposta = g; o.stato = 'proposta'; });
    else cambia('Nuovo giorno mandato a Monica', () => { o.entro = g; o.proposta = null; o.stato = 'nuovo'; }, false);
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
  tab(el) { UI.tab = el.dataset.v; render(); },
  accetta(el) { const o = ordine(el.dataset.id); cambia(`Accettato: ${cliente(o.cliente).nome}`, () => { o.righe = prezziGiusti(o.righe); o.stato = 'accettato'; }); },
  rifiuta(el) { const o = ordine(el.dataset.id); cambia('Ordine rifiutato', () => { o.stato = 'rifiutato'; rimettiPronti(o); }); },
  'mod-si'(el) { const o = ordine(el.dataset.id); cambia('Modifica accettata', () => { o.righe = prezziGiusti(o.modifica.righe, daAccettare(o) ? [] : o.righe); o.modifica = null; o.esitoModifica = 'si'; }); },
  'mod-no'(el) { const o = ordine(el.dataset.id); cambia('Modifica rifiutata', () => { o.modifica = null; o.esitoModifica = 'no'; }); },
  pronto(el) { const o = ordine(el.dataset.id); setTimeout(() => cambia('Segnato pronto', () => { o.stato = 'pronto'; }), 60); },
  'pronto-muto'(el) { const o = ordine(el.dataset.id); cambia('Segnato pronto', () => { o.stato = 'pronto'; }); },
  ritirato(el) { const o = ordine(el.dataset.id); cambia('Ritirato', () => { o.stato = 'ritirato'; }); },
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
  'i-anticipo'(el) { cambia('', () => { S.impostazioni.anticipo = Math.min(14, Math.max(0, S.impostazioni.anticipo + Number(el.dataset.d))); }, false); salvatoOk(); },
  'i-limite'(el) { cambia('', () => { S.impostazioni.limite.teglie = Math.min(99, Math.max(1, S.impostazioni.limite.teglie + Number(el.dataset.d))); }, false); salvatoOk(); },
  'natale-piatto'(el) { const l = S.impostazioni.natale.piatti, id = el.dataset.id; cambia('', () => { S.impostazioni.natale.piatti = l.includes(id) ? l.filter(x => x !== id) : [...l, id]; }, false); },
  ricomincia() { if (Dati.attivo) return; /* coi dati veri cancellerebbe ordini e clienti */ cambia('Prova ricominciata da capo', () => { S = statoIniziale(); }); }
};
/* Monica dice Sì o No a un telefono nuovo. Annulla per 10 secondi. */
async function decidiRichiesta(id, si) {
  const r = S.richieste.find(x => x.id === id);
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
  const o = r.primo && ordine(r.primo);
  if (!si) { if (o && o.stato === 'daApprovare') o.stato = 'rifiutato'; return; }
  let id = r.cliente;
  if (!id) { id = 'c' + Date.now().toString(36); S.clienti.push({ id, nome: r.nome, da: oggi() }); }
  if (!o || o.stato !== 'daApprovare') return;
  o.stato = 'nuovo'; o.cliente = id;
  if (!o.pronto) return;
  const ci = o.righe.every(x => { const p = piatto(x.piatto); return p && p.pronto && p.pronto.giorno === oggi() && p.pronto.qta >= x.qta; });
  if (ci) o.righe.forEach(x => { const p = piatto(x.piatto); p.pronto.qta = arrot(p.pronto.qta - x.qta); });
  else o.pronto = false;
}
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
  if (c === 'p.grande') { P.grande = val; salvaP(); render(); return; }
  if (c === 'disp') { const p = piatto(el.dataset.id); cambia(val ? `Di nuovo nel menù: ${p.nome}` : `Tolto dal menù: ${p.nome}`, () => { p.disponibile = val; }); return; }
  if (c === 'p.novita') { const p = piatto(pid); cambia('', () => { p.novita = val; p.novitaDal = oggi(); }, false); salvatoOk(); return; }
  if (c.startsWith('p.')) {
    const p = piatto(pid), k = c.slice(2);
    if (k === 'prezzo') { const f = p.formati.find(x => x.id === el.dataset.f); f.prezzo = Math.max(0, Number(val) || 0); }
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
function caricaFoto(input) {
  const file = input.files && input.files[0], id = input.dataset.id;
  if (!file) return;
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
    cambia('Foto aggiunta e migliorata', () => { piatto(id).foto = dati; });
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

/* firma «Powered by YNOY»: copiata così com'è dall'apertura di Jona (tratti che scrivono il logo a mano), tempi più corti per stare in 5 secondi */
const FIRMA_JONA = `<div class="wall-by" role="img" aria-label="Powered by YNOY Corp"><span><em style="animation-delay:1.70s">P</em><em style="animation-delay:1.74s">o</em><em style="animation-delay:1.78s">w</em><em style="animation-delay:1.82s">e</em><em style="animation-delay:1.86s">r</em><em style="animation-delay:1.90s">e</em><em style="animation-delay:1.94s">d</em><em style="animation-delay:1.98s">&nbsp;</em><em style="animation-delay:2.02s">b</em><em style="animation-delay:2.06s">y</em></span><div class="yn"><svg class="ywr" viewBox="0 0 496 190" aria-hidden="true"><mask id="ylg" maskUnits="userSpaceOnUse" x="0" y="0" width="496" height="190" style="mask-type:alpha"><image href="media/ynoy-firma.png" width="496" height="190"/></mask><mask id="ywm" maskUnits="userSpaceOnUse" x="0" y="0" width="496" height="190"><g><path pathLength="100" d="M46.5 30.5 50.5 30.5 56.5 31.4 62.0 32.8 63.4 32.4 64.5 33.9 67.5 35.5 70.0 37.3 73.0 40.0 75.5 42.5 76.9 43.3 77.7 44.1 78.3 45.5 87.9 57.5 88.5 59.5 88.5 62.5 88.0 67.0" style="stroke-width:18.1;--o:115;animation-delay:2.100s;animation-duration:0.046s"/><path pathLength="100" d="M144.5 31.0 141.0 31.1 136.5 32.5 130.5 35.7 123.5 41.5 121.0 44.0 120.4 45.5 121.1 47.1 120.0 46.4 118.6 46.6 105.5 60.0 101.8 64.0 98.1 69.5 96.4 72.5 92.9 80.5 91.4 83.0 87.9 87.5 80.0 93.9 74.5 97.4 71.5 99.0" style="stroke-width:18.3;--o:109;animation-delay:2.147s;animation-duration:0.065s"/><path pathLength="100" d="M145.5 31.5 148.5 34.5 149.1 36.0 148.9 37.0 146.6 40.0 146.0 43.0 146.0 71.0 146.0 84.5 146.4 88.5 145.8 89.9 145.0 90.5 143.0 91.3 141.4 91.5 143.0 91.3 146.0 90.3 147.5 90.2 151.0 91.3 155.0 92.0" style="stroke-width:11.7;--o:108;animation-delay:2.212s;animation-duration:0.054s"/><path pathLength="100" d="M145.5 31.5 150.0 35.7 151.0 36.2 153.5 36.6 155.0 37.2 158.0 39.5 178.0 59.4 181.0 62.0 199.0 80.0 200.0 80.7 202.4 81.7 203.6 83.1 204.9 85.5 206.3 86.5 207.0 86.5" style="stroke-width:19.3;--o:112;animation-delay:2.266s;animation-duration:0.055s"/><path pathLength="100" d="M204.0 81.5 206.9 78.5 207.6 77.5 208.0 76.0 208.0 53.5 208.0 36.5 208.5 33.5 209.2 32.3 210.5 31.4 212.5 30.8 215.5 30.5" style="stroke-width:10.6;--o:110;animation-delay:2.321s;animation-duration:0.044s"/><path pathLength="100" d="M263.0 30.0 259.0 30.0 250.5 31.6 245.0 33.9 239.0 37.8 237.0 39.5 234.9 42.0 232.6 45.0 230.9 48.0 228.6 54.0 227.3 60.4 227.8 62.2 227.6 64.0 228.3 67.5 230.9 74.5 233.7 79.0 240.0 85.3 244.5 88.1 250.0 90.4 256.5 92.0 261.0 92.5 265.0 92.5 271.0 91.7 278.5 89.4 284.0 86.5 286.5 84.8 289.5 82.1 291.1 81.6 291.5 79.5 294.1 76.0 296.1 71.5 297.7 66.5 298.5 61.0 297.7 56.0 295.1 48.5 292.9 44.5 290.0 41.0 288.6 38.5 286.5 37.7 281.5 34.3 275.0 31.5 267.0 30.0 263.0 30.0" style="stroke-width:19.0;--o:105;animation-delay:2.365s;animation-duration:0.110s"/><path pathLength="100" d="M296.5 30.5 298.0 30.5 303.5 31.4 308.0 32.5 310.0 33.3 314.0 35.4 318.0 38.2 321.5 41.5 333.2 55.5 334.5 57.5 334.9 58.5 334.5 62.0 334.5 66.5" style="stroke-width:17.9;--o:116;animation-delay:2.476s;animation-duration:0.044s"/><path pathLength="100" d="M307.5 108.0 313.0 105.3 318.0 102.2 323.0 98.2 327.3 94.1 333.9 86.5 341.6 75.5 342.7 73.1 343.1 68.9 346.9 67.3 348.6 66.0 357.5 55.5 365.0 47.5 374.5 38.2 380.4 32.9 382.3 29.4 383.7 28.1 389.0 26.3 397.0 21.0 405.0 16.5 416.9 11.7 420.9 10.7 427.0 9.8 432.0 9.5 437.5 9.7 443.0 10.5 448.3 12.2 453.5 14.3 457.5 17.0 460.5 19.6 463.5 23.0 466.6 27.5 468.4 31.5 469.8 36.0 470.8 42.2 471.0 47.5 470.6 53.0 469.9 57.0 468.8 62.0 466.9 68.0 462.6 77.9 461.2 80.4 458.6 84.4 453.0 91.5 445.5 99.4 439.5 104.5 431.4 109.8 429.5 111.3 426.0 113.3 415.0 118.5 408.0 121.0 402.0 122.7 395.0 124.3 386.9 125.3 384.0 126.0 373.5 126.9 361.0 127.0 353.5 126.6 334.0 124.9 315.0 122.1 275.3 114.7 228.0 107.0 192.5 102.1 182.5 101.3 157.5 100.0 141.0 100.0 125.0 100.8 111.5 102.1 96.0 104.3 83.5 106.8 70.5 110.5 63.1 113.4 54.5 117.5 51.5 118.5 41.5 119.6 35.0 121.0" style="stroke-width:15.1;--o:101;animation-delay:2.521s;animation-duration:0.323s"/><path pathLength="100" d="M61.0 116.5 59.4 116.2 56.1 117.2 54.7 118.3 53.5 120.3 52.8 123.0 53.0 129.0" style="stroke-width:17.2;--o:149;animation-delay:2.843s;animation-duration:0.028s"/><path pathLength="100" d="M53.5 145.0 48.0 142.0 43.6 140.8 42.7 139.9 42.5 138.9 42.3 139.8 41.8 140.3 38.5 140.4 36.5 140.9 33.5 142.3 32.0 142.4 30.9 141.9 31.1 143.4 27.9 147.0 26.6 149.5 25.9 152.0 25.5 154.5 25.5 159.5 26.5 165.0" style="stroke-width:16.4;--o:117;animation-delay:2.871s;animation-duration:0.042s"/><path pathLength="100" d="M65.5 149.5 61.5 150.8 60.0 151.7 56.5 154.6 55.5 154.8 54.1 154.4 54.8 156.0 54.8 157.0 53.1 160.5 51.9 163.9 50.5 164.9 48.0 165.1 49.5 165.7 50.6 167.0 50.9 168.0 50.8 171.0 51.5 173.0 51.4 173.9 50.9 174.7 48.4 177.1 51.0 175.1 52.5 174.9 58.0 179.1 60.0 180.2 63.5 181.5" style="stroke-width:20.0;--o:117;animation-delay:2.913s;animation-duration:0.046s"/><path pathLength="100" d="M81.0 147.5 79.5 150.5 77.9 156.0 77.2 157.1 76.4 157.5 77.3 158.2 77.4 161.5 78.4 164.0 79.5 166.0 80.9 168.0 81.1 169.0 80.9 170.1 82.5 169.8 86.0 171.4 89.0 171.5 92.0 171.1 97.5 169.5" style="stroke-width:16.2;--o:120;animation-delay:2.959s;animation-duration:0.038s"/><path pathLength="100" d="M100.5 142.0 99.0 142.4 97.5 143.5 95.7 145.5 95.0 147.5 95.1 150.5 95.7 151.9 96.5 152.6 97.5 152.9 100.5 153.0 102.9 153.1 103.8 152.6 104.1 149.0 105.1 146.4 104.9 145.9 103.0 144.5 100.5 142.0" style="stroke-width:18.6;--o:128;animation-delay:2.996s;animation-duration:0.035s"/><path pathLength="100" d="M378.0 77.0 376.9 75.1 375.0 74.1 371.0 74.0 368.5 74.6 365.5 77.0 363.8 79.5 363.0 82.5 363.2 84.5 364.1 87.0 365.1 88.5 367.0 90.1 370.0 91.4 374.0 91.5 376.5 91.1 377.9 89.9 379.0 87.0" style="stroke-width:8.0;--o:110;animation-delay:3.031s;animation-duration:0.039s"/><path pathLength="100" d="M390.5 74.0 389.4 74.3 388.0 75.1 386.0 77.0 384.6 79.0 384.0 82.0 384.2 85.5 384.7 87.0 385.6 88.5 388.0 90.6 389.0 91.1 391.0 91.5 394.0 91.4 396.5 90.4 398.5 88.5 399.6 86.5 400.2 84.5 400.4 82.5 400.1 81.0 399.0 78.0 397.0 75.7 395.5 74.7 394.0 74.1 390.5 74.0" style="stroke-width:8.0;--o:108;animation-delay:3.070s;animation-duration:0.043s"/><path pathLength="100" d="M408.5 74.5 409.0 78.0 409.0 83.0 409.0 87.5 408.5 91.0" style="stroke-width:8.0;--o:126;animation-delay:3.112s;animation-duration:0.027s"/><path pathLength="100" d="M405.5 91.5 408.5 90.1 410.0 90.4 411.5 91.5" style="stroke-width:7.5;--o:160;animation-delay:3.139s;animation-duration:0.022s"/><path pathLength="100" d="M406.0 74.5 408.5 75.4 411.5 74.6 414.0 74.6 415.9 75.6 417.2 77.5 417.4 79.0 417.1 80.0 416.1 82.0 415.3 82.8 414.0 83.4 409.0 83.0" style="stroke-width:7.2;--o:116;animation-delay:3.163s;animation-duration:0.031s"/><path pathLength="100" d="M412.5 83.0 413.9 83.6 415.1 84.6 417.4 88.0 418.4 89.4 419.6 90.4 423.0 91.5" style="stroke-width:7.1;--o:127;animation-delay:3.193s;animation-duration:0.026s"/><path pathLength="100" d="M427.5 74.5 427.8 75.2 427.5 78.0 427.5 83.0 427.5 88.0 427.8 89.5 427.8 90.8 427.5 91.5" style="stroke-width:8.0;--o:125;animation-delay:3.219s;animation-duration:0.027s"/><path pathLength="100" d="M424.5 91.5 426.0 90.4 427.5 90.1 428.5 90.4 430.5 91.5" style="stroke-width:7.5;--o:160;animation-delay:3.246s;animation-duration:0.022s"/><path pathLength="100" d="M424.5 74.5 427.5 75.6 430.5 74.6 433.0 74.6 435.0 75.6 436.3 77.5 436.5 78.5 435.9 81.0 434.9 82.2 434.0 82.8 431.0 83.5 429.0 83.4 427.5 83.0" style="stroke-width:7.0;--o:115;animation-delay:3.269s;animation-duration:0.031s"/></g></mask><g mask="url(#ylg)"><rect width="496" height="190" fill="#7B2318" mask="url(#ywm)"/></g></svg><i class="y0"></i><i class="coda c1"></i><i class="coda c2"></i><i class="coda c3"></i><i class="coda c4"></i></div></div>`;

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
    setTimeout(() => { d.remove(); const m = $('main.corpo'); if (m) { m.classList.remove('entra'); void m.offsetWidth; m.classList.add('entra'); } provaApri(); }, 560);
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
const MINUTI_LUCCHETTO = [1, 2, 5, 10, 15, 30, 60];   /* «si richiude se esci dall'app per…» */
const minutiLucchetto = () => { const m = Number(S.impostazioni.lucchetto); return MINUTI_LUCCHETTO.includes(m) ? m : 5; };
function statoLucchetto() {
  if (!Dati.attivo || P.ruolo !== 'monica' || L.aperto) return '';
  const io = Dati.io;
  if (!io.uid || !io.gestore || L.puo === undefined) return 'attendi';
  const k = Lucchetto.di(io.uid);
  if (k && k.id) return 'chiuso';
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
  const k = Lucchetto.di(Dati.io.uid) || {}, m = minutiLucchetto();
  return `<section class="scheda"><h2>Lucchetto</h2>
    ${k.id ? `<p style="margin:0"><b>Acceso.</b> Per aprire la tua parte il telefono chiede l'impronta o il PIN.</p>
      <span class="etichetta" style="font-weight:800">Si richiude se esci dall'app per</span>
      <div class="fila">${passo('i-lucchetto', m)}<span class="tenue">${m === 1 ? 'minuto' : 'minuti'}</span></div>`
    : L.puo ? `<p style="margin:0"><b>Spento.</b> Mettilo: per aprire la tua parte il telefono chiederà l'impronta o il PIN.</p>
      <button type="button" class="btn pieno" data-a="lucchetto-metti">${ico('lucchetto')}Metti l'impronta</button>`
    : `<p style="margin:0"><b>Spento:</b> il telefono non ha il blocco schermo. Mettilo nelle impostazioni del telefono, poi riapri l'app.</p>`}
    <button type="button" class="link" data-a="lucchetto-esci" style="color:var(--allarme)">${L.esci ? 'Sicura? Tocca ancora per uscire' : 'Esci da questo telefono'}</button>
    <small class="tenue">Se cambi telefono o lo dai via. Per rientrare: «Sei Monica? Entra» in fondo alla pagina.</small></section>`;
}
/* l'impronta si chiede da sola una volta, finita l'apertura animata; poi col pulsante */
function provaApri() {
  if (L.tentato || L.inCorso || document.visibilityState !== 'visible' || $('.apertura') || statoLucchetto() !== 'chiuso') return;
  L.tentato = true; apriLucchetto();
}
async function apriLucchetto() {
  if (L.inCorso) return;
  L.inCorso = true; L.errore = ''; render();
  try { await Lucchetto.apri(Dati.io.uid); L.aperto = true; }
  catch (e) { L.errore = e.name === 'NotAllowedError' ? 'Non si è aperta. Tocca il pulsante e riprova.' : 'Il telefono non riesce a usare l\'impronta. Riprova, o entra di nuovo con Google.'; }
  L.inCorso = false; render();
}
/* uscita dall'app più lunga dei minuti scelti: si richiude */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { L.via = Date.now(); return; }
  const k = Dati.attivo ? Lucchetto.di(Dati.io.uid) : null;
  if (L.aperto && k && k.id && L.via && Date.now() - L.via >= minutiLucchetto() * 60000) {
    L.aperto = false; L.tentato = false; L.errore = ''; UI.foglio = null; render();
  }
  L.via = 0; provaApri();
});
Object.assign(A, {
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
    const i = MINUTI_LUCCHETTO.indexOf(minutiLucchetto()) + Number(el.dataset.d);
    cambia('', () => { S.impostazioni.lucchetto = MINUTI_LUCCHETTO[Math.min(MINUTI_LUCCHETTO.length - 1, Math.max(0, i))]; }, false); salvatoOk();
  },
  async 'lucchetto-esci'() {
    if (!L.esci) { L.esci = true; render(); setTimeout(() => { L.esci = false; if (UI.vista === 'impostazioni') render(); }, 5000); return; }
    const uid = Dati.io.uid;
    try { await Dati.esci(); } catch (e) {
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
  const f = A[el.dataset.a];
  if (f) f(el, e);
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'file-foto') { caricaFoto(el); return; }
  if (el.dataset.campo && !['sel.testo', 'nota'].includes(el.dataset.campo)) salvaCampo(el);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.campo === 'sel.testo' || el.dataset.campo === 'nota') salvaCampo(el);
  if (el.dataset.cerca) suggerisci(el);
  if (el.id === 'nome-nuovo' && UI.foglio) UI.foglio.scritto = el.value;   // resta anche se la pagina si ridisegna (una foto che arriva)
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && UI.foglio) A.chiudi();
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.cerca) { e.preventDefault(); A['ing-aggiungi']({ dataset: { s: e.target.dataset.cerca } }); }
  if (e.key === 'Enter' && e.target.id === 'nuovo-nome') A['nuovo-avanti']();
});

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
    P.ruolo = io.gestore ? 'monica' : 'cliente';
    P.cliente = io.utente && io.utente.stato === 'approvato' ? io.utente.cliente : null;
    if (UI.vista === 'home' && P.ruolo === 'cliente') UI.vista = 'menu';
    /* mentre Monica scrive in un campo non si ridisegna: si aspetta che esca dal campo */
    if (staScrivendo()) { renderDopo = true; return; }
    render();
  }, st => {
    if (st.errore === 'permission-denied') mostraToast('Non salvato: questa modifica non è permessa.');
    else if (st.errore === 'non-pronto') mostraToast('Non salvato: l\'app non è ancora collegata. Rifallo appena c\'è la rete.');
    else if (st.errore) mostraToast('Non salvato: riprova tra poco.');
    else if (st.rete === false && st.inAttesa) mostraToast('Senza rete: si salverà appena torna.');
  }, { oggi, settimana, teglieOrdine, contaSettimane }).catch(() => mostraToast('Non riesco a caricare il menù: controlla la rete e riapri l\'app.'));
}
addEventListener('online', () => { if (UI.riprova && P.carrello.length) inviaVero(); });

/* ordine vero: parte solo con la rete e con la conferma del server; se no resta nel carrello */
async function inviaVero() {
  if (UI.invio) return;
  if (!Dati.io.utente) { UI.foglio = { tipo: 'nome' }; render(); const i = $('#nome-nuovo'); if (i) i.focus(); return; }
  if (Dati.io.utente.stato === 'no') { mostraToast('Monica per ora non può prendere il tuo ordine.'); return; }
  const c = P.carrello, pronti = c.filter(r => r.pronto), dopo = c.filter(r => !r.pronto);
  if (dopo.length && !UI.entro) return;
  const fai = (righe, entro, pronto) => ({ id: 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), n: 0, cliente: P.cliente,
    righe: righe.map(r => { const x = Object.assign({}, r); delete x.pronto; return x; }), entro, stato: 'nuovo', pronto, proposta: null,
    paga: { metodo: UI.metodo || 'contanti', dice: false, ricevuto: false }, nota: UI.nota.trim(), creato: oggi(), cuori: {}, modifica: null, esitoModifica: '' });
  const lista = [];
  if (pronti.length) lista.push([pronti, fai(pronti, oggi(), true)]);
  if (dopo.length) lista.push([dopo, fai(dopo, UI.entro, false)]);
  UI.invio = true; UI.riprova = false; render();
  try {
    await Dati.inviaOrdini(lista.map(x => x[1]));
    P.carrello = []; UI.entro = null; UI.nota = ''; UI.invio = false; salvaP(); vai('inviato');
  } catch (e) {
    UI.invio = false;
    lista.slice(0, e.partiti || 0).forEach(([righe]) => { P.carrello = P.carrello.filter(r => !righe.includes(r)); });
    if (e.code === 'finito') {
      P.carrello.forEach(r => { if (r.pronto && r.piatto === e.piatto) r.pronto = false; });
      mostraToast(`Mi dispiace: ${e.nome} pronto l'ha appena preso qualcun altro. Ora è da prenotare: scegli il giorno.`);
    } else if (e.code === 'unavailable' || !navigator.onLine) { UI.riprova = true; mostraToast('Non è partito: manca la rete. Riparte da solo appena torna.'); }
    else mostraToast('Non è partito. Riprova tra poco.');
    salvaP(); render();
  }
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
