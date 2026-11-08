/* ================= IMPOSTAZIONI IN PIÙ (C88, Mario 08/11 «aggiungi tantissime impostazioni… così non siamo vincolati al codice») =================
   Un elenco unico: ogni voce sa dove si vede, il suo valore di base (= come funziona oggi), i limiti e le parole per l'aiutante.
   Si salvano in S.impostazioni.<chiave> (un campo per chiave in impostazioni/app). Spiegazione in docs/SPEC-IMPOSTAZIONI.md.
   Caricato dopo data.js e prima di app.js: app.js può chiamare opz() direttamente. */
const GRUPPI_OPZ = [['clienti', 'Menù e ordini dei clienti'], ['messaggi', 'Messaggi WhatsApp ai clienti'], ['cucina', 'Per te in cucina']];
const GIORNI_SETT = [[1, 'Lunedì'], [2, 'Martedì'], [3, 'Mercoledì'], [4, 'Giovedì'], [5, 'Venerdì'], [6, 'Sabato'], [0, 'Domenica']];
const PAROLE_MSG = [['nome', 'il nome del cliente'], ['n', 'il numero dell\'ordine'], ['giorno', 'il giorno del ritiro'], ['totale', 'il totale'],
  ['indirizzo', 'il tuo indirizzo'], ['mappa', 'il link per arrivare'], ['nota', 'come trovarti'], ['orari', 'gli orari di ritiro'], ['link', 'il link dell\'app']];
const OPZIONI = [
  { k: 'avviso', g: 'clienti', nome: 'Avviso in cima al menù', tipo: 'testo', max: 160, def: '', es: 'es. Questa settimana niente fritti',
    aiuto: 'Una frase che i clienti vedono subito, in cima al menù. Vuota = nessun avviso.', parole: /avviso|in cima al menu|scritta per i client|comunicazion|annunci/ },
  { k: 'giorniChiusi', g: 'clienti', nome: 'Giorni in cui non si ritira', tipo: 'giorni', def: [],
    aiuto: 'Tocca i giorni in cui sei chiusa ogni settimana: i clienti non possono sceglierli.', parole: /chius[oa] (la |il )?(domenic|luned|marted|mercoled|gioved|venerd|sabat)|giorn[oi] di (chiusura|riposo)|non lavoro (la |il )|riposo/ },
  { k: 'oraLimite', g: 'clienti', nome: 'Ora limite per ordinare', tipo: 'ora', def: '',
    aiuto: 'Dopo quest\'ora il primo giorno che il cliente può scegliere slitta di uno. Vuota = nessuna ora limite.', parole: /ora limite|entro che ora|fino a che ora (si puo|possono) ordin|ordin\w* (la sera|tardi)/ },
  { k: 'giorniAvanti', g: 'clienti', nome: 'Quanti giorni avanti si ordina', tipo: 'numero', min: 3, max: 60, def: 14, unita: 'giorni',
    aiuto: 'Quanti giorni vedono i clienti quando scelgono il giorno del ritiro.', parole: /giorni avanti|troppo avanti|quanti giorni (vedono|possono)|settimane prima/ },
  { k: 'minimo', g: 'clienti', nome: 'Ordine minimo', tipo: 'euro', min: 0, max: 200, def: 0,
    aiuto: 'Sotto questa cifra il cliente non può mandare l\'ordine. 0 = nessun minimo.', parole: /minimo|ordini (troppo )?piccoli/ },
  { k: 'orari', g: 'clienti', nome: 'Orari di ritiro', tipo: 'testo', max: 80, def: '', es: 'es. dalle 17 alle 20',
    aiuto: 'Li leggono i clienti quando scelgono il giorno (e nei messaggi con {orari}). Vuoto = non si vede.', parole: /orari|a che ora (ritir|vengon|passan)|fascia/ },
  { k: 'notaClienti', g: 'clienti', nome: 'Nota dei clienti', tipo: 'si', def: true,
    aiuto: 'Acceso: nel carrello il cliente può scriverti una nota.', parole: /nota (del|dei) client|scriver\w* (una )?nota|commento/ },
  { k: 'novitaGiorni', g: 'clienti', nome: 'Quanto dura «Novità»', tipo: 'numero', min: 1, max: 60, def: 14, unita: 'giorni',
    aiuto: 'Quanti giorni resta l\'etichetta «Novità» su un piatto.', parole: /quanto dura (la |l.etichetta )?novit|giorni (della )?novit/ },
  { k: 'aiClienti', g: 'clienti', nome: 'Aiutante per i clienti', tipo: 'si', def: true,
    aiuto: 'Acceso: i clienti possono chiedere all\'aiutante (allergie, cosa ordinare, a che punto è l\'ordine).', parole: /aiutante (per i|dei) client/ },
  { k: 'msgAccettato', g: 'messaggi', nome: 'Messaggio «ordine confermato»', tipo: 'messaggio', max: 600, def: 'Ciao {nome}! Ho confermato il tuo ordine n. {n} per {giorno}.',
    aiuto: 'Lo mandi su WhatsApp quando accetti un ordine.', parole: /messaggio (di |della |del )?conferm/ },
  { k: 'msgPronto', g: 'messaggi', nome: 'Messaggio «ordine pronto»', tipo: 'messaggio', max: 600, def: 'Ciao {nome}! Il tuo ordine n. {n} è pronto.\nTotale: {totale}\nRitira qui: {indirizzo}\n{mappa}\n{nota}',
    aiuto: 'Lo mandi su WhatsApp quando l\'ordine è pronto.', parole: /messaggio (di |del )?pront/ },
  { k: 'msgProposta', g: 'messaggi', nome: 'Messaggio «ti propongo un altro giorno»', tipo: 'messaggio', max: 600, def: 'Ciao {nome}! Per il tuo ordine n. {n} ti propongo {giorno}. Rispondi dall\'app con un tocco: {link}',
    aiuto: 'Lo mandi su WhatsApp quando proponi un altro giorno.', parole: /messaggio (per |di |del )?(propost|altro giorno)/ },
  { k: 'firma', g: 'messaggi', nome: 'Firma dei messaggi', tipo: 'testo', max: 60, def: () => `${cuoca()} · Pronti in Tavola`, vuotoDiBase: true,
    aiuto: 'Va in fondo a ogni messaggio ai clienti. Vuota = quella di base.', parole: /\bfirma\b/ },
  { k: 'annullaSecondi', g: 'cucina', nome: 'Tempo per «Annulla»', tipo: 'numero', min: 5, max: 30, def: 10, unita: 'secondi',
    aiuto: 'Dopo un cambio, per quanti secondi resta il tasto «Annulla» in basso.', parole: /tasto annulla|tempo per annull|annullare (dopo|se sbaglio)/ }
];
const OPZ = Object.fromEntries(OPZIONI.map(o => [o.k, o]));
const baseOpz = o => typeof o.def === 'function' ? o.def() : Array.isArray(o.def) ? o.def.slice() : o.def;

/* un valore scritto da Monica (o dall'AI) → il valore giusto, o undefined se non va bene */
function valoreOpz(o, v) {
  switch (o.tipo) {
    case 'numero': case 'euro': {
      const n = Number(String(v).replace(',', '.'));
      if (!Number.isFinite(n) || n < o.min || n > o.max) return undefined;
      return o.tipo === 'euro' ? Math.round(n * 100) / 100 : Math.round(n);
    }
    case 'si': return v === true || v === 'true' || v === 'sì' || v === 'si' ? true : v === false || v === 'false' || v === 'no' ? false : undefined;
    case 'ora': { const t = String(v || '').trim(); return t === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : undefined; }
    case 'giorni': { const a = (Array.isArray(v) ? v : String(v || '').split(',')).map(Number); return a.every(x => Number.isInteger(x) && x >= 0 && x <= 6) && a.length < 7 ? [...new Set(a)].sort() : undefined; }
    default: return String(v == null ? '' : v).replace(/[<>]/g, '').slice(0, o.max || 200);
  }
}
/* il valore di adesso (quello di base se non è mai stato cambiato o non va bene) */
function opz(k) {
  const o = OPZ[k], v = S && S.impostazioni ? S.impostazioni[k] : undefined;
  if (!o) return undefined;
  if (v === undefined || v === null) return baseOpz(o);
  const ok = valoreOpz(o, v);
  if (ok === undefined || ((o.tipo === 'messaggio' || o.vuotoDiBase) && !String(ok).trim())) return baseOpz(o);
  return ok;
}
const cambiataOpz = k => { const v = opz(k), b = baseOpz(OPZ[k]); return JSON.stringify(v) !== JSON.stringify(b); };
function testoOpz(o, v) {
  switch (o.tipo) {
    case 'numero': return `${v} ${o.unita || ''}`.trim();
    case 'euro': return v ? euro(v) : 'Nessun minimo';
    case 'si': return v ? 'Acceso' : 'Spento';
    case 'ora': return v || 'Nessuna';
    case 'giorni': return v.length ? GIORNI_SETT.filter(([n]) => v.includes(n)).map(([, t]) => t).join(', ') : 'Nessuno: sempre aperta';
    case 'messaggio': return cambiataOpz(o.k) ? 'Scritto da te' : 'Quello di base';
    default: return v ? `«${v.length > 50 ? v.slice(0, 50) + '…' : v}»` : 'Vuoto';
  }
}
/* le parole tra graffe dei messaggi → i valori veri */
const riempi = (t, val) => String(t).replace(/\{(\w+)\}/g, (m, k) => (k in val ? String(val[k] == null ? '' : val[k]) : m));

/* ---------- in Impostazioni: una voce per impostazione, a gruppi, con la ricerca in cima ---------- */
function sezOpz(o) {
  const v = opz(o.k), campo = `data-campo="o.${o.k}"`;
  let dentro = `<p class="tenue" style="margin:0">${esc(o.aiuto)}</p>`;
  if (o.tipo === 'testo') dentro += `<input type="text" ${campo} maxlength="${o.max}" value="${esc(S.impostazioni[o.k] == null ? (o.vuotoDiBase ? '' : v) : S.impostazioni[o.k])}" placeholder="${esc(o.es || (o.vuotoDiBase ? baseOpz(o) : ''))}" aria-label="${esc(o.nome)}">`;
  if (o.tipo === 'numero' || o.tipo === 'euro') dentro += `<div class="fila"><input type="number" ${campo} inputmode="${o.tipo === 'euro' ? 'decimal' : 'numeric'}" min="${o.min}" max="${o.max}" step="${o.tipo === 'euro' ? '0.5' : '1'}" value="${v}" style="max-width:120px" aria-label="${esc(o.nome)}"><span class="tenue">${o.tipo === 'euro' ? 'euro' : esc(o.unita || '')} (da ${o.min} a ${o.max})</span></div>`;
  if (o.tipo === 'si') dentro += `<label class="interr"><span>${esc(o.nome)}</span><input type="checkbox" ${campo} ${v ? 'checked' : ''}></label>`;
  if (o.tipo === 'ora') dentro += `<div class="fila"><input type="time" ${campo} value="${esc(v)}" style="max-width:140px" aria-label="${esc(o.nome)}">${v ? `<button type="button" class="link" data-a="o-base" data-k="${o.k}">Togli l'ora</button>` : ''}</div>`;
  if (o.tipo === 'giorni') dentro += `<div class="scelte">${GIORNI_SETT.map(([n, t]) => `<button type="button" class="chip" data-a="o-giorno" data-k="${o.k}" data-v="${n}" aria-pressed="${v.includes(n)}">${t}</button>`).join('')}</div>`;
  if (o.tipo === 'messaggio') {
    const esempio = riempi(v, { nome: 'Laura', n: 12, giorno: 'sabato 14 novembre', totale: '24,00 €', indirizzo: 'Via Roma 1, Olbia', mappa: 'https://maps.google.com/…', nota: 'Suona il citofono', orari: opz('orari') || 'dalle 17 alle 20', link: 'https://…' });
    dentro += `<textarea ${campo} rows="5" maxlength="${o.max}" aria-label="${esc(o.nome)}">${esc(v)}</textarea>
      <small class="tenue">Parole che riempio io: ${PAROLE_MSG.map(([k, t]) => `<b>{${k}}</b> ${t}`).join(' · ')}</small>
      <span class="etichetta" style="font-weight:800">Esempio</span><div class="ai-fum lei" style="white-space:pre-line;max-width:100%">${esc(esempio)}\n${esc(opz('firma'))}</div>
      ${cambiataOpz(o.k) ? `<button type="button" class="link" data-a="o-base" data-k="${o.k}">Rimetti il messaggio di base</button>` : ''}`;
  }
  if (o.tipo === 'testo' && S.impostazioni[o.k]) dentro += `<button type="button" class="link" data-a="o-base" data-k="${o.k}">${o.vuotoDiBase ? 'Rimetti quella di base' : 'Svuota'}</button>`;
  return ['opz-' + o.k, esc(o.nome), testoOpz(o, v), `<section class="scheda sez-dentro">${dentro}</section>`];
}
function sezioniOpzioni() {
  return `<h3 class="tenue" style="margin:14px 0 0;font-size:.95rem">Altre regole dell'app</h3>
    ${GRUPPI_OPZ.map(([g, t]) => `<span class="etichetta" style="font-weight:800;margin-top:6px">${t}</span>${listaSez(OPZIONI.filter(o => o.g === g).map(sezOpz))}`).join('')}`;
}
function cercaImpHtml() {
  return `<div class="cerca-imp"><input type="search" id="cerca-imp" autocomplete="off" placeholder="🔎 Cerca un'impostazione… (es. minimo, orari, firma)" value="${esc(UI.cercaImp || '')}" aria-label="Cerca un'impostazione"></div>
    <p class="tenue piccolo" id="cerca-imp-niente" hidden style="margin:0">Non trovo niente: prova con un'altra parola, o chiedi all'aiutante.</p>`;
}
/* filtra le voci di Impostazioni: nome, valore e parole dell'aiutante */
function filtraImp() {
  if (UI.vista !== 'impostazioni') return;
  const q = semplOpz(UI.cercaImp || '').trim(), voci = document.querySelectorAll('main.corpo details.sez');
  let viste = 0;
  voci.forEach(d => {
    const o = OPZ[(d.dataset.sez || '').replace(/^opz-/, '')];
    const testo = semplOpz(d.querySelector('summary').textContent + ' ' + (o ? o.aiuto : ''));
    const si = !q || q.split(/\s+/).every(w => testo.includes(w)) || (o && o.parole.test(q));
    d.hidden = !si; if (si) viste++;
  });
  document.querySelectorAll('main.corpo h3.tenue, main.corpo .etichetta').forEach(x => { if (!x.closest('details')) x.hidden = !!q; });
  const n = $('#cerca-imp-niente'); if (n) n.hidden = !q || viste > 0;
}
const semplOpz = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function dopoRenderOpz() { if (UI.vista === 'impostazioni' && UI.cercaImp) filtraImp(); }   // chiamata da render() (app.js)

/* salvataggio: un campo alla volta (due persone insieme non si pestano i piedi) */
function salvaOpz(k, el) {
  const o = OPZ[k]; if (!o) return;
  const v = valoreOpz(o, el.type === 'checkbox' ? el.checked : el.value);
  if (v === undefined) { mostraToast(o.tipo === 'numero' || o.tipo === 'euro' ? `Scrivi un numero da ${o.min} a ${o.max}.` : 'Questo valore non va bene.'); render(); return; }
  if (o.tipo === 'si') { cambia(v ? 'Acceso' : 'Spento', () => { S.impostazioni[k] = v; }); return; }
  S.impostazioni[k] = v; salva(); salvatoOk();
}
const AZIONI_OPZ = {   // app.js le aggiunge ad A (A nasce dopo questo file)
  'o-giorno'(el) {
    const k = el.dataset.k, n = Number(el.dataset.v), v = opz(k).slice(), i = v.indexOf(n);
    if (i >= 0) v.splice(i, 1); else if (v.length < 6) v.push(n); else { mostraToast('Almeno un giorno deve restare aperto.'); return; }
    cambia(i >= 0 ? 'Riaperto' : 'Chiuso', () => { S.impostazioni[k] = v.sort(); });
  },
  'o-base'(el) { const k = el.dataset.k; cambia('Rimesso come prima', () => { delete S.impostazioni[k]; }); }
};
document.addEventListener('input', e => { if (e.target.id === 'cerca-imp') { UI.cercaImp = e.target.value; filtraImp(); } });
