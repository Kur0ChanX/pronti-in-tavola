/* Ricettario di Monica (C55, docs/SPEC-RICETTARIO.md): solo per chi gestisce, mai per i clienti.
   Mario 08/11: «porta GialloZafferano dentro l'app», niente pagine esterne. Le ricette di GialloZafferano si leggono DAL VIVO
   dal server dell'app (/api/gz → gz.mjs) e si mostrano qui: video nel lettore dell'app, ingredienti, passaggi con le loro foto.
   Nel codice c'è solo l'elenco scelto (ricette.js: nome, link, foto di copertina). Le ricette aperte restano sul telefono
   (preferite sempre, le altre le ultime 15) così si rileggono anche senza rete. Monica può scrivere anche le SUE ricette.
   Viste: 'ricettario' (elenco e ricerca), 'ricetta:<id>' (scheda), 'cucina:<id>' (un passo per schermata), 'ricmia:<id|nuova>' (scrivi la tua). */
const RIC = { stato: typeof RICETTE_GZ !== 'undefined' ? 'pronto' : 'no', wake: null, timers: [], tick: null,
  apre: {}, errore: {}, cerca: { q: '', stato: '', risultati: [] }, hls: null,
  /* domanda al server (le prove la sostituiscono con risposte finte) */
  chiedi: async corpo => {
    const tok = typeof Dati !== 'undefined' && Dati.token ? await Dati.token() : '';
    if (!tok) throw new Error('Serve l\'accesso di Monica o di Mario (sul sito vero).');
    const r = await fetch('/api/gz', { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.errore) throw new Error(j.errore || 'Il server risponde ' + r.status);
    return j;
  } };
/* C69 (Mario 08/11 «filtri come le app gold standard»): tempo, facili, ordina, numero, «Azzera», filtri ricordati sul telefono */
const ORDINI_RIC = [['', 'Consigliate'], ['nuove', '🆕 Nuove'], ['az', 'A-Z'], ['veloci', '⏱ Più veloci']];
const filtriVuoti = () => ({ q: '', zona: 'tutte', cat: '', tempo: 0, facile: false, ordine: '', piu: false });
const filtriAttivi = f => !!(f.q.trim() || f.zona !== 'tutte' || f.cat || f.tempo || f.facile);
const minutiRic = r => Number(r.totale) || Number(r.minuti) || (Number(r.prep) || 0) + (Number(r.cottura) || 0) || 0;
function salvaFiltri() { const f = UI.ric; scriviRic('pit-ric-filtri', { piu: !!f.piu, zona: f.zona, cat: f.cat, tempo: f.tempo, facile: f.facile, ordine: f.ordine }); }
const ZONE_RIC = [['tutte', 'Tutte'], ['pref', '⭐ Preferite'], ['sarda', 'Sarde'], ['italiana', 'Italiane'], ['mie', 'Le mie']];   // Mario 08/11 «filtri quasi doppi»: una riga sola
const CAT_RIC = [['', 'Tutto'], ['antipasti', 'Antipasti'], ['primi', 'Primi'], ['secondi', 'Secondi'], ['contorni', 'Contorni'], ['dolci', 'Dolci'], ['pane', 'Pane e pizze']];
const URL_GZ = 'https://ricette.giallozafferano.it/';
/* motore: le sarde vanno una pagina sì e una no (Mario 08/11 «in priorità sarde ma cercale miste») */
const sardeTxt = d => d.paginaSarda === 'fine' ? 'sarde ✅ finite' : `sarde: pagina ${(/\/page(\d+)\//.exec(d.paginaSarda || '') || [, 1])[1]}`;
/* catalogo completo per portata (sezioni di GialloZafferano lette dal server, pagina dopo pagina) */
const CATALOGO_RIC = [['sardegna', 'Ricette sarde'], ['antipasti', 'Antipasti'], ['primi', 'Primi'], ['secondi', 'Secondi'], ['contorni', 'Contorni'], ['dolci', 'Dolci'], ['lievitati', 'Pane, pizze e lievitati'], ['unici', 'Piatti unici'], ['sughi', 'Salse e sughi'], ['bevande', 'Bevande']];
/* catalogo per ingrediente: pagine «ricette-con-…» di GialloZafferano; se una non esiste, il server cerca la parola */
const CATALOGO_ING = [['le-Melanzane', 'Melanzane'], ['le-Zucchine', 'Zucchine'], ['le-Patate', 'Patate'], ['i-Pomodori', 'Pomodori'], ['i-Carciofi', 'Carciofi'], ['i-Funghi', 'Funghi'],
  ['gli-Spinaci', 'Spinaci'], ['i-Ceci', 'Ceci'], ['le-Lenticchie', 'Lenticchie'], ['la-Ricotta', 'Ricotta'], ['la-Mozzarella', 'Mozzarella'], ['Pecorino-sardo', 'Pecorino sardo'],
  ['le-Uova', 'Uova'], ['il-Pollo', 'Pollo'], ['la-Salsiccia', 'Salsiccia'], ['il-Maiale', 'Maiale'], ['l-Agnello', 'Agnello'], ['il-Tonno', 'Tonno'], ['il-Salmone', 'Salmone'],
  ['i-Gamberi', 'Gamberi'], ['le-Cozze', 'Cozze'], ['le-Vongole', 'Vongole'], ['il-Polpo', 'Polpo'], ['le-Mele', 'Mele'], ['i-Limoni', 'Limoni'], ['il-Cioccolato', 'Cioccolato'], ['le-Mandorle', 'Mandorle']];
/* temi della ricerca veloce (si cercano dal vivo su GialloZafferano: niente elenchi da tenere aggiornati) */
const ESPLORA_RIC = ['ricette sarde', 'dolci sardi', 'culurgiones', 'fregola', 'malloreddus', 'porceddu', 'pane carasau', 'bottarga', 'pecorino sardo', 'mirto', 'amaretti', 'ricette con la ricotta', 'ricette con il pesce spada', 'polpo', 'cozze', 'agnello', 'pasta fresca', 'primi di pesce', 'secondi di carne', 'secondi di pesce', 'contorni', 'antipasti', 'torte salate', 'focacce',
  'dolci al cucchiaio', 'biscotti', 'torte', 'zuppe', 'risotti', 'lasagne', 'polpette', 'verdure ripiene', 'ricette veloci', 'ricette vegetariane', 'senza glutine', 'avanzi', 'per buffet', 'sughi', 'torte salate di verdure', 'crostate', 'dolci della nonna', 'pane fatto in casa', 'ricette in friggitrice ad aria', 'piatti unici', 'ricette di Natale', 'ricette di Pasqua'];

function caricaRicette() {
  if (RIC.stato === 'pronto' || RIC.stato === 'carico') return;
  RIC.stato = 'carico';
  const s = document.createElement('script');
  s.src = 'ricette.js';
  s.onload = () => { RIC.stato = typeof RICETTE_GZ !== 'undefined' ? 'pronto' : 'errore'; render(); };
  s.onerror = () => { RIC.stato = 'errore'; s.remove(); render(); };
  document.head.appendChild(s);
}

/* ---------- 📥 SCARICATE (Mario 08/11 «offline crea il motore… cercare e scaricare… in un click») ----------
   Le ricette scaricate stanno nella memoria grande del telefono (IndexedDB, centinaia di ricette) e le loro foto nella cache «gz-foto»
   che il service worker usa senza rete. Il video resta solo online (troppo pesante). Ogni giorno, col Wi-Fi, l'app scarica da sola
   le ricette nuove di preferite, elenco e «Ispirate» (interruttore nella schermata del ricettario). */
RIC.scaricate = {}; RIC.scarico = null;
const DB_RIC = () => new Promise((ok, ko) => {
  if (!window.indexedDB) { ko(new Error('senza memoria')); return; }
  const q = indexedDB.open('pit-ricettario', 1);
  q.onupgradeneeded = () => q.result.createObjectStore('ricette', { keyPath: 'id' });
  q.onsuccess = () => ok(q.result); q.onerror = () => ko(q.error);
});
async function dbRic(modo, fai) {
  const db = await DB_RIC();
  return new Promise((ok, ko) => { const tx = db.transaction('ricette', modo), st = tx.objectStore('ricette'), q = fai(st); tx.oncomplete = () => ok(q && q.result); tx.onerror = () => ko(tx.error); });
}
function caricaScaricate() {
  dbRic('readonly', st => st.getAll()).then(tt => { (tt || []).forEach(r => { RIC.scaricate[r.id] = r; }); if (/^(ricettario|ricetta:)/.test(UI.vista)) render(); autoScarica(); }).catch(() => {});
}
const fotoDi = r => [r.foto, r.copertina, ...(r.passi || []).flatMap(p => p.foto || [])].filter(f => /^https:\/\/www\.giallozafferano\.it\/images\//.test(f || ''));
async function scaricaUna(id) {
  if (RIC.scaricate[id]) return false;
  const j = await RIC.chiedi({ u: URL_GZ + id.slice(3) + '.html' });
  const r = Object.assign({}, j.ricetta, { scaricata: Date.now() });
  await dbRic('readwrite', st => st.put(r));
  RIC.scaricate[r.id] = r;
  codaVoci(r);   // anche la voce dei passi, sul telefono (in fila, una ricetta alla volta)
  try { const c = await caches.open('gz-foto'); await Promise.all(fotoDi(r).map(f => c.match(f).then(m => m || fetch(f, { mode: 'no-cors', referrerPolicy: 'no-referrer' }).then(x => c.put(f, x))).catch(() => {}))); } catch (e) { /* le foto restano online */ }
  return true;
}
async function scaricaTante(ids, titolo) {
  if (RIC.scarico) return;
  const da = [...new Set(ids)].filter(id => /^gz:/.test(id) && !RIC.scaricate[id]);
  if (!da.length) { mostraToast('Sono già tutte sul telefono ✓'); return; }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  const s = RIC.scarico = { titolo, tot: da.length, fatte: 0, errori: 0, stop: false };
  render();
  let k = 0;
  const lavora = async () => { while (k < da.length && !s.stop) { const id = da[k++]; try { await scaricaUna(id); s.fatte++; } catch (e) { s.errori++; } if (/^ricettario/.test(UI.vista)) aggiornaBarraScarico(); } };
  await Promise.all([lavora(), lavora(), lavora()]);   // 3 alla volta: veloce senza pesare su GialloZafferano
  RIC.scarico = null;
  mostraToast(s.stop ? `Fermato: ${s.fatte} ricette scaricate.` : `📥 ${s.fatte} ricette sul telefono${s.errori ? ` (${s.errori} non riuscite: riprova più tardi)` : ''}. Le apri anche senza rete.`);
  render();
}
function aggiornaBarraScarico() { const b = document.getElementById('ric-scarico'); const s = RIC.scarico; if (b && s) b.querySelector('b').textContent = `${s.fatte + s.errori} di ${s.tot}`; }
const barraScarico = () => RIC.scarico ? `<section class="scheda" id="ric-scarico"><p style="margin:0">📥 Scarico «${esc(RIC.scarico.titolo)}»: <b>${RIC.scarico.fatte + RIC.scarico.errori} di ${RIC.scarico.tot}</b></p><button type="button" class="btn chiaro piccolo" data-a="ric-scarica-stop">Ferma</button></section>` : '';
/* una volta al giorno, col Wi-Fi (o rete che non si paga a consumo) e l'app aperta: scarica le nuove di preferite, elenco e Ispirate */
function autoScarica() {
  if (leggiRic('pit-ric-auto', true) === false || navigator.onLine === false || RIC.scarico) return;
  const conn = navigator.connection; if (conn && (conn.saveData || conn.type === 'cellular')) return;
  const oggiS = new Date().toDateString(); if (leggiRic('pit-ric-auto-giorno', '') === oggiS) return;
  if (typeof Dati === 'undefined' || !Dati.token) return;
  scriviRic('pit-ric-auto-giorno', oggiS);
  const ids = preferiteRic().concat(elencoRic().map(r => r.id), ispirate().map(r => r.id)).filter(id => !RIC.scaricate[id]).slice(0, 40);
  if (ids.length) setTimeout(() => scaricaTante(ids, 'aggiornamento di oggi'), 8000);
}
/* 💾 riprende una copia: unisce (non cancella): ricette tue per id, note, preferite; un tocco su «Annulla» torna a prima */
function riprendiCopia(file) {
  const fr = new FileReader();
  fr.onload = () => {
    let c; try { c = JSON.parse(fr.result); } catch (e) { c = null; }
    if (!c || c.tipo !== 'pronti-ricettario' || !Array.isArray(c.mie) || typeof c.note !== 'object' || !Array.isArray(c.preferite)) { mostraToast('Questo file non è una copia del ricettario.'); return; }
    const prima = { mie: mieRic(), note: noteRic(), pref: preferiteRic() };
    const mie = prima.mie.slice(); c.mie.filter(m => m && /^mia:/.test(m.id) && m.nome).forEach(m => { const i = mie.findIndex(x => x.id === m.id); if (i < 0) mie.push(m); else mie[i] = m; });
    const note = Object.assign({}, prima.note, c.note), pref = [...new Set(prima.pref.concat(c.preferite.filter(x => typeof x === 'string')))];
    if (!scriviRic('pit-ric-mie', mie) || !scriviRic('pit-ric-note', note) || !scriviRic('pit-ric-pref', pref)) { scriviRic('pit-ric-mie', prima.mie); scriviRic('pit-ric-note', prima.note); scriviRic('pit-ric-pref', prima.pref); mostraToast('Il telefono è pieno: copia non ripresa.'); return; }
    mostraToast(`📂 Ripresi: ${c.mie.length} ricette tue, ${Object.keys(c.note).length} note, ${c.preferite.length} preferite.`, () => { scriviRic('pit-ric-mie', prima.mie); scriviRic('pit-ric-note', prima.note); scriviRic('pit-ric-pref', prima.pref); render(); });
    render();
  };
  fr.readAsText(file);
}
/* ---------- memoria sul telefono ---------- */
const leggiRic = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
function scriviRic(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
const preferiteRic = () => leggiRic('pit-ric-pref', []);
const mieRic = () => leggiRic('pit-ric-mie', []);
const cacheRic = () => leggiRic('pit-ric-cache', {});
/* note di Monica su ogni ricetta (anche di GialloZafferano): «meno zucchero», «piace a Laura»… */
const noteRic = () => leggiRic('pit-ric-note', {});
const notaRic = id => noteRic()[id] || '';
/* timer: più di uno insieme (Monica cucina più piatti); ognuno sa ricetta e passo */
const restaTimer = x => Math.max(0, Math.ceil((x.fine - Date.now()) / 1000));
const mmssRic = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const timerDi = (id, passo) => RIC.timers.find(x => x.id === id && x.passo === passo && !x.libero);   // il timer DEL passo (non quelli veloci)
/* tiene le preferite sempre e le ultime 15 aperte; se il telefono è pieno toglie le più vecchie */
function salvaCache(r) {
  const c = cacheRic(), pref = preferiteRic();
  c[r.id] = Object.assign({}, r, { visto: Date.now() });
  let ids = Object.keys(c).filter(k => !pref.includes(k)).sort((a, b) => c[b].visto - c[a].visto);
  ids.slice(15).forEach(k => delete c[k]);
  ids = ids.slice(0, 15);
  while (!scriviRic('pit-ric-cache', c) && ids.length) delete c[ids.pop()];
}
/* IL TUO RICETTARIO (C61, Mario 08/11 «io devo soltanto dare l'ok di aggiungere»): quelle nel codice + quelle scelte con «➕ Aggiungi»,
   salvate sul server (uguali sul telefono di Monica e di Mario) e copiate qui per usarle senza rete */
RIC.scelte = (() => { try { return JSON.parse(localStorage.getItem('pit-ric-scelte') || '[]'); } catch (e) { return []; } })();
function elencoRic() {
  const base = typeof RICETTE_GZ !== 'undefined' ? RICETTE_GZ : [], ids = new Set(base.map(r => r.id));
  return base.concat(RIC.scelte.filter(x => !ids.has(x.id)).map(x => ({ id: x.id, pagina: x.id.slice(3), nome: x.nome, zona: x.zona || 'italiana', categoria: x.categoria || '', foto: x.foto || '', totale: Number(x.totale) || 0, difficolta: x.difficolta || '', cerca: x.cerca || '', aggiunta: x.aggiunta || 0, scelta: true, nuova: (x.aggiunta || 0) > Date.now() - 7 * 86400000 })));
}
const nelRicettario = id => elencoRic().some(r => r.id === id);
function salvaScelte(tt) { if (!Array.isArray(tt)) return; RIC.scelte = tt; scriviRic('pit-ric-scelte', tt); }
/* RICETTE SCRITTE A MANO sul server (C68): ognuna ha `agg` (quando l'hai cambiata) e `suServer` (già arrivata).
   Al giro: vince la più nuova; quelle mai arrivate partono; quelle tolte su un altro telefono spariscono anche qui. */
const mieTolte = () => leggiRic('pit-ric-mie-tolte', []);
function mandaMia(m) {
  return RIC.chiedi({ db: 'salvaMia', r: m }).then(j => {
    if (!j || j.errore) return;
    const tt = mieRic(), i = tt.findIndex(x => x.id === m.id); if (i >= 0 && (tt[i].agg || 0) === (m.agg || 0)) { tt[i].suServer = true; scriviRic('pit-ric-mie', tt); }
  }).catch(() => null);
}
function togliMiaServer(id) {
  scriviRic('pit-ric-mie-tolte', mieTolte().concat(id));
  return RIC.chiedi({ db: 'togliMia', id }).then(j => { if (j && !j.errore) scriviRic('pit-ric-mie-tolte', mieTolte().filter(x => x !== id)); }).catch(() => null);
}
function sincronizzaMie() {
  RIC.chiedi({ db: 'mieScritte' }).then(j => {
    if (!j || !Array.isArray(j.mie)) return;
    mieTolte().forEach(id => togliMiaServer(id));
    const tolte = new Set(mieTolte()), loc = mieRic(), srv = new Set(j.mie.map(x => x.id)), out = [];
    for (const x of j.mie) {
      if (tolte.has(x.id)) continue;
      const l = loc.find(y => y.id === x.id);
      out.push(l && (l.agg || 0) > (x.aggiornata || 0) ? l : Object.assign({}, x.r, { agg: x.aggiornata || 0, suServer: true }));
    }
    const nuove = loc.filter(l => !srv.has(l.id) && !l.suServer);   // scritte qui e mai arrivate (anche senza rete): partono adesso
    const tutte = nuove.concat(out);
    if (JSON.stringify(tutte) !== JSON.stringify(loc)) { scriviRic('pit-ric-mie', tutte); if (UI.vista === 'ricettario' || UI.vista === 'ricdb') render(); }
    nuove.concat(out.filter(m => !m.suServer)).forEach(mandaMia);
  }).catch(() => null);
}
function leggiScelte() {
  if (RIC.scelteChiede || Date.now() - (RIC.scelteOra || 0) < 60000) return;
  RIC.scelteChiede = true; RIC.scelteOra = Date.now();
  sincronizzaMie();
  RIC.chiedi({ db: 'mie' }).then(j => { if (j && Array.isArray(j.scelte)) { salvaScelte(j.scelte); if (UI.vista === 'ricettario') render(); } }).catch(() => null).finally(() => { RIC.scelteChiede = false; });
}
/* corpo della domanda per un catalogo: per «nuove» dico al server quali ho già (niente doppioni) */
const corpoCat = (cat, q, pagina) => Object.assign({ cat, cerca: q }, pagina ? { pagina } : {}, cat === 'nuove' ? { fuori: elencoRic().map(r => r.id) } : {});
const voceElenco = id => elencoRic().find(r => r.id === id) || RIC.cerca.risultati.find(r => r.id === id) || ispirate().find(r => r.id === id);
const daCerca = x => ({ id: 'gz:' + x.url.replace(URL_GZ, '').replace(/\.html$/, ''), nome: x.nome, foto: x.foto, categoria: '' });
/* «Ispirate ai tuoi piatti»: per ogni piatto del menù di Monica cerco su GialloZafferano (una volta al giorno, poi resta sul telefono) */
const ispirate = () => (leggiRic('pit-ric-ispira', {}).lista || []);
function ispira() {
  const c = leggiRic('pit-ric-ispira', {}), oggiRic = new Date().toDateString();
  const nomi = (typeof visibili === 'function' ? visibili() : []).map(p => p.nome).filter(Boolean).slice(0, 8);
  const firma = nomi.join('|');
  if (RIC.ispiraVa || !nomi.length || (c.giorno === oggiRic && c.firma === firma) || navigator.onLine === false) return;
  RIC.ispiraVa = true;
  Promise.all(nomi.map(n => RIC.chiedi({ cerca: n.replace(/\(.*?\)/g, '').trim() }).then(j => (j.ricette || []).slice(0, 3).map(x => Object.assign(daCerca(x), { per: n }))).catch(() => [])))
    .then(gruppi => {
      const lista = [], visti = new Set(elencoRic().map(r => r.id));
      for (let k = 0; k < 3; k++) gruppi.forEach(g => { const r = g[k]; if (r && !visti.has(r.id)) { visti.add(r.id); lista.push(r); } });
      scriviRic('pit-ric-ispira', { giorno: oggiRic, firma, lista: lista.slice(0, 24) });   // anche vuota: così non ricerca in giro (una volta al giorno)
    })
    .finally(() => { RIC.ispiraVa = false; if (UI.vista === 'ricettario') render(); });
}
/* la ricetta completa: mia, già sul telefono, o da chiedere al server */
function ricetta(id) {
  if (!RIC.dbLetto) { RIC.dbLetto = true; caricaScaricate(); }
  if (/^mia:/.test(id)) { const m = mieRic().find(x => x.id === id); return m ? daMia(m) : null; }
  return cacheRic()[id] || RIC.scaricate[id] || null;
}
function apriGz(id) {
  if (RIC.apre[id]) return;
  RIC.apre[id] = true; delete RIC.errore[id];
  RIC.chiedi({ u: URL_GZ + id.slice(3) + '.html' })
    .then(j => { salvaCache(j.ricetta); })
    .catch(e => { RIC.errore[id] = e.message || String(e); })
    .finally(() => { delete RIC.apre[id]; if (UI.vista.split(':').slice(1).join(':') === id) render(); });
}

const durataRic = m => !m ? '' : m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`;
const senzaAccenti = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
/* quantità per le porzioni scelte, arrotondate in modo da leggersi bene */
function qRic(q, base, porz) {
  if (q == null) return '';
  const x = q * porz / base;
  if (x >= 100) return String(Math.round(x / 10) * 10);
  if (x >= 10) return String(Math.round(x));
  const m = Math.round(x * 2) / 2;
  return m === 0 ? '½' : String(m).replace('.5', '½').replace(/^0½$/, '½');
}
const rigaIng = (i, base, porz) => i.q == null ? `${esc(i.nome)} <small>q.b.</small>${i.nota ? ` <small>(${esc(i.nota)})</small>` : ''}`
  : `<b>${qRic(i.q, base, porz)}${i.u ? ' ' + esc(i.u) : ''}</b> ${esc(i.nome)}${i.nota ? ` <small>(${esc(i.nota)})</small>` : ''}`;
/* «Farina 300 g» → { nome, q, u } (stessa idea di gz.mjs, per le ricette di Monica) */
function ingRic(riga) {
  const t = String(riga || '').trim();
  let m = /^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(g|gr|kg|ml|cl|dl|l|cucchiai(?:ni|no|o)?|bicchier[ei]|tazz[ae]|spicchi?|foglie|pizzic[oh]i?|bustin[ae]|fette|fetta)?\.?$/i.exec(t);
  if (m && m[1]) return { nome: m[1], q: parseFloat(m[2].replace(',', '.')), u: (m[3] || '').toLowerCase(), nota: '' };
  m = /^(\d+(?:[.,]\d+)?)\s*(g|gr|kg|ml|cl|dl|l)?\s+(?:di\s+)?(.+)$/i.exec(t);
  if (m) return { nome: m[3], q: parseFloat(m[1].replace(',', '.')), u: (m[2] || '').toLowerCase(), nota: '' };
  return { nome: t.replace(/\s+q\.?\s?b\.?$/i, ''), q: null, u: '', nota: '' };
}
const daMia = m => ({ id: m.id, mia: true, nome: m.nome, intro: m.note || '', foto: m.foto || '', porzioni: m.porzioni || 4, totale: m.minuti || 0,
  categoria: m.categoria || '', ingredienti: (m.ingredienti || []).map(ingRic).filter(i => i.nome), passi: (m.passi || []).map(t => ({ t, foto: [] })), conserva: '', consiglio: '' });
/* minuti scritti nel passo («cuocete per 20 minuti», «1 ora») → timer nella cucina guidata */
function minutiPasso(t) {
  const m = /(\d+)(?:\s*[-–]\s*(\d+))?\s*(minut|or[ae]\b)/i.exec(t || '');
  if (!m) return 0;
  const n = Number(m[2] || m[1]) * (/^or/i.test(m[3]) ? 60 : 1);
  return n > 0 && n <= 600 ? n : 0;
}

function attesaRic(titolo, indietro, testo) {
  caricaRicette();
  return testataMonica(titolo, indietro || 'home') + `<main class="corpo"><section class="scheda">${RIC.stato === 'errore'
    ? '<p style="margin:0"><b>Non riesco ad aprire il ricettario.</b> Controlla la rete e riprova.</p><button type="button" class="btn pieno" data-a="ric-riprova">Riprova</button>'
    : `<p class="tenue" style="margin:0">${testo || 'Apro il ricettario…'}</p>`}</section></main>`;
}
const cartaRic = (r, pref) => `<button type="button" class="ric-carta" data-a="vai" data-v="ricetta:${esc(r.id)}">
    ${r.foto ? `<img src="${esc(r.foto)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="ric-senzafoto">${ico('piatti')}</span>`}
    <span class="ric-testo"><b>${pref.includes(r.id) ? '⭐ ' : ''}${r.nuova ? '🆕 ' : ''}${esc(r.nome)}</b><small>${r.mia ? 'Ricetta tua' : { gallura: 'Gallura', sarda: 'Sardegna', italiana: 'Italia' }[r.zona] || 'GialloZafferano'}${r.categoria ? ' · ' + esc((CAT_RIC.find(c => c[0] === r.categoria) || [, r.categoria])[1]) : ''}</small></span></button>`;

/* 🗄 DATABASE RICETTE (C60, C61; Mario 08/11 «quante ricette ho, quante nuove, quali, quali con la voce, dati offline»):
   una pagina sola coi numeri veri: il tuo ricettario, le aggiunte, quelle sul telefono (con 🔊 se la voce è pronta),
   l'archivio automatico sul server, lo spazio usato. I numeri del server arrivano da /api/gz { db: 'stato' } (al massimo uno al minuto). */
function chiediStatoDb() {
  if (RIC.dbChiede || Date.now() - (RIC.dbOra || 0) < 60000) return;
  RIC.dbChiede = true; RIC.dbOra = Date.now();   // una domanda al minuto al massimo, anche se il server non risponde (niente giri infiniti)
  Promise.all([RIC.chiedi({ db: 'stato' }), RIC.chiedi({ cat: 'db' }).catch(() => null)])
    .then(([j, u]) => { RIC.db = j && j.db ? j.db : RIC.db || { errore: true }; if (u && u.ricette) RIC.dbUltime = u.ricette.slice(0, 8).map(daCerca); })
    .catch(() => { RIC.db = RIC.db || { errore: true }; })
    .finally(() => { RIC.dbChiede = false; if (UI.vista === 'ricdb' || UI.vista === 'ricettario') render(); });
}
/* spazio e dati senza rete sul telefono: una volta ogni 5 minuti */
function misuraDati() {
  if (RIC.datiChiede || Date.now() - (RIC.datiOra || 0) < 300000) return;
  RIC.datiChiede = true; RIC.datiOra = Date.now();
  (async () => {
    const d = { foto: 0, voci: 0, usatoMb: 0, totMb: 0 };
    try { if (window.caches) { d.foto = (await (await caches.open('gz-foto')).keys()).length; d.voci = (await (await caches.open(typeof CACHE_VOCI !== 'undefined' ? CACHE_VOCI : 'voci-pit')).keys()).length; } } catch (e) { /* senza cache */ }
    try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); d.usatoMb = Math.round((e.usage || 0) / 104857.6) / 10; d.totMb = Math.round((e.quota || 0) / 1048576); } } catch (e) { /* niente */ }
    RIC.dati = d;
  })().finally(() => { RIC.datiChiede = false; if (UI.vista === 'ricdb') render(); });
}
const dataBreve = t => { const d = new Date(t || 0); return t ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}` : ''; };
const rigaDb = (r, extra) => `<li><button type="button" class="link" data-a="vai" data-v="ricetta:${esc(r.id)}">${esc(r.nome)}</button> <small class="tenue">${extra}</small></li>`;
/* 🗄 IL MIO DATABASE dentro il Ricettario (Mario 08/11 «sembra una funzione nascosta… senza un reparto a parte»):
   i numeri in vista, ordinati: archivio sul server · mio ricettario · sul telefono · voci; il motore (oggi +N, avanzamento) e le ultime trovate */
function riquadroDb() {
  leggiScelte(); chiediStatoDb();
  const d = RIC.db && !RIC.db.errore ? RIC.db : null, elenco = elencoRic(), mie = mieRic(), scar = Object.values(RIC.scaricate || {}), nVoci = scar.filter(r => RIC.vociFatte[r.id]).length;
  const oggi0 = new Date(); oggi0.setHours(0, 0, 0, 0);
  const nuoveOggi = (RIC.scelte || []).filter(x => (x.aggiunta || 0) >= oggi0.getTime()).length;
  const n = (v, t, s) => `<div class="ric-db-n"><b>${v == null ? '…' : v}</b><span>${t}</span>${s ? `<small class="tenue">${s}</small>` : ''}</div>`;
  let motore = '';
  if (d) {
    const ug = d.ultimoGiro && d.ultimoGiro.quando ? d.ultimoGiro.quando : 0, faMin = ug ? Math.round((Date.now() - ug) / 60000) : -1, perc = Math.min(100, Math.round(((Math.max(1, d.fonte || 0) - 1) / ((d.fonti || 10) - 1)) * 100));
    const nomeSez = (CATALOGO_RIC.find(x => x[0] === d.sezione) || [, d.sezione || ''])[1];
    const stato = RIC.dbCerco ? '🔄 Sto cercando…' : d.pausa ? '⏸ Motore fermo' : faMin < 0 ? '🕐 Il motore parte entro 10 minuti' : faMin > 25 ? `⚠️ Motore fermo da ${faMin} minuti` : `🟢 Motore al lavoro (ultimo giro ${faMin} min fa)`;
    motore = `<p style="margin:6px 0 0"><b>${stato}</b> · oggi <b>+${d.oggi}</b> nuove${d.coda ? `, ${d.coda} in arrivo` : ''}</p>
      <div class="ricdb-barra" role="progressbar" aria-valuenow="${perc}"><i style="width:${perc}%"></i></div>
      <p class="piccolo tenue" style="margin:2px 0 0">${sardeTxt(d)} · altre: sezione ${Math.max(1, d.fonte || 0)} di ${(d.fonti || 10) - 1} (${esc(nomeSez)}) · ${d.giri} giri</p>
      ${RIC.dbUltime && RIC.dbUltime.length ? `<p class="piccolo" style="margin:6px 0 2px"><b>Ultime entrate nel ricettario:</b></p><ul class="ricdb-lista">${RIC.dbUltime.slice(0, 5).map(r => rigaDb(r, nelRicettario(r.id) ? '✅ nel ricettario' : '')).join('')}</ul>` : ''}`;
  } else if (RIC.db) motore = '<p class="piccolo" style="margin:6px 0 0">Il server non risponde: i numeri del motore arrivano con la rete.</p>';
  const base = typeof RICETTE_GZ !== 'undefined' ? RICETTE_GZ.length : 0, trovate = elenco.length - base, sett = Date.now() - 7 * 86400000;
  const nuove7 = (RIC.scelte || []).filter(x => (x.aggiunta || 0) > sett).length, nonArrivate = mie.filter(m => !m.suServer).length;
  const t = d && d.turbo;
  if (t && t.attivo && !RIC.turboTimer) RIC.turboTimer = setTimeout(() => { RIC.turboTimer = null; RIC.dbOra = 0; RIC.scelteOra = 0; if (UI.vista === 'ricettario') render(); }, 30000);   // numeri che salgono da soli
  const turbo = t ? (t.attivo ? `<p style="margin:6px 0 0"><b>⚡ Carico ${t.obiettivo} ricette: ${t.fatte} fatte</b>${t.scartate ? ` · ${t.scartate} scartate perché incomplete` : ''}</p><div class="ricdb-barra"><i style="width:${Math.min(100, Math.round(t.fatte / (t.obiettivo || 1) * 100))}%"></i></div>`
    : t.finito ? `<p class="piccolo" style="margin:6px 0 0">⚡ Ultimo carico: <b>${t.fatte}</b> ricette nuove${t.scartate ? `, ${t.scartate} scartate perché incomplete` : ''}.</p>` : '') : '';
  return `<section class="scheda ric-db-box"><h2>🗄 Il mio database</h2>
    <div class="ric-db-griglia">${n(elenco.length + mie.length, '📖 nel ricettario', `le vede anche Monica · ${base} di partenza, ${trovate} trovate, ${mie.length} scritte da te`)}${n(nuove7, '🆕 nuove', `negli ultimi 7 giorni${nuoveOggi ? `, ${nuoveOggi} oggi` : ''}`)}${n(d ? d.coda : null, '⏳ in arrivo', 'il motore le sta leggendo')}${n(scar.length, '📥 sul telefono', `leggibili senza rete · ${nVoci} con la voce`)}</div>
    <p class="piccolo" style="margin:6px 0 0">${nonArrivate ? `⚠️ ${nonArrivate} ${nonArrivate === 1 ? 'ricetta scritta da te non è' : 'ricette scritte da te non sono'} ancora sul server: partono appena c'è rete.` : '✅ Tutto salvato sul server dell\'app: Mario e Monica vedono le stesse ricette.'}</p>
    ${turbo}${motore}
    <div class="fila" style="margin-top:8px"><button type="button" class="btn pieno" data-a="ric-db-turbo" ${t && t.attivo ? 'disabled' : ''}>${t && t.attivo ? '⚡ Sto caricando…' : '⚡ Carica 100 ricette adesso'}</button><button type="button" class="btn chiaro" data-a="ric-db-cerca" ${RIC.dbCerco ? 'disabled' : ''}>${RIC.dbCerco ? 'Cerco…' : '🔄 Cerca adesso'}</button><button type="button" class="btn chiaro" data-a="vai" data-v="ricdb">Tutto il dettaglio</button></div></section>`;
}
function vRicDb() {
  if (!RIC.dbLetto) { RIC.dbLetto = true; caricaScaricate(); }
  if (RIC.stato !== 'pronto') return attesaRic('Database ricette', 'ricettario');
  leggiScelte(); chiediStatoDb(); misuraDati();
  const elenco = elencoRic(), mie = mieRic(), scar = Object.values(RIC.scaricate).sort((a, b) => (b.scaricata || 0) - (a.scaricata || 0));
  const nVoci = scar.filter(r => RIC.vociFatte[r.id]).length, scelte = (RIC.scelte || []).slice().sort((a, b) => (b.aggiunta || 0) - (a.aggiunta || 0));
  const sett = Date.now() - 7 * 86400000, nuoveSett = scelte.filter(x => (x.aggiunta || 0) > sett).length, d = RIC.db && !RIC.db.errore ? RIC.db : null, dati = RIC.dati;
  const tutteScelte = UI.ricDbTutte === 'scelte', tutteScar = UI.ricDbTutte === 'scar';
  let h = testataMonica('Database ricette', 'ricettario') + '<main class="corpo">';
  h += `<section class="scheda"><h2>📖 Il tuo ricettario: ${elenco.length + mie.length} ricette</h2>
    <p class="piccolo tenue" style="margin:0">${elenco.length} di GialloZafferano (${scelte.length} aggiunte da te${nuoveSett ? `, ${nuoveSett} negli ultimi 7 giorni` : ''}) e ${mie.length} scritte da te. Uguali sul telefono di Monica e di Mario.</p>
    ${scelte.length ? `<h3 style="margin:8px 0 4px">➕ Aggiunte di recente</h3><ul class="ricdb-lista ricdb-scelte">${(tutteScelte ? scelte : scelte.slice(0, 5)).map(x => rigaDb(x, dataBreve(x.aggiunta))).join('')}</ul>
      ${scelte.length > 5 && !tutteScelte ? `<button type="button" class="link" data-a="ricdb-tutte" data-v="scelte">Tutte le ${scelte.length}</button>` : ''}` : '<p class="piccolo" style="margin:0">Non hai ancora aggiunto ricette: nel Ricettario tocca «🔎 Fammi vedere le ricette nuove».</p>'}</section>`;
  h += barraScarico();
  h += `<section class="scheda"><h2>📥 Sul telefono: ${scar.length} ricette</h2>
    <p class="piccolo tenue" style="margin:0">Testi e foto scaricati qui: le apri anche senza rete (il video no). ${nVoci} con la voce pronta 🔊.</p>
    ${scar.length ? `<ul class="ricdb-lista ricdb-scaricate">${(tutteScar ? scar : scar.slice(0, 8)).map(r => rigaDb(r, `${dataBreve(r.scaricata)}${RIC.vociFatte[r.id] ? ' · 🔊 voce' : ''}`)).join('')}</ul>
      ${scar.length > 8 && !tutteScar ? `<button type="button" class="link" data-a="ricdb-tutte" data-v="scar">Tutte le ${scar.length}</button>` : ''}` : ''}
    ${RIC.scarico ? '' : `<div class="fila"><button type="button" class="btn chiaro" data-a="ric-scarica-elenco">📥 Scarica tutto l'elenco (${elenco.length + preferiteRic().filter(id => !nelRicettario(id)).length})</button>
      ${scar.length > nVoci ? `<button type="button" class="btn chiaro" data-a="ricdb-voci">🔊 Prepara la voce di tutte (${scar.length - nVoci})</button>` : ''}</div>`}
    <label class="interr"><span>Aggiorna da sola ogni giorno<small>Col Wi-Fi scarica le nuove di preferite, elenco e «Ispirate».</small></span><input type="checkbox" data-a="ric-auto" ${leggiRic('pit-ric-auto', true) !== false ? 'checked' : ''}></label>
    ${scar.length ? '<button type="button" class="btn chiaro piccolo" data-a="ric-scarica-via">Togli le ricette scaricate</button>' : ''}</section>`;
  h += `<section class="scheda" id="ricdb-archivio"><h2>🤖 Motore delle ricette${d ? `: ${d.ricette} trovate` : ''}</h2>`;
  if (d) {
    /* chiaro (Mario 08/11 «non si capisce se funziona»): stato, ultimo giro, avanzamento sulle 10 sezioni, «Cerca adesso» */
    const ug = d.ultimoGiro && d.ultimoGiro.quando ? d.ultimoGiro.quando : 0, faMin = ug ? Math.round((Date.now() - ug) / 60000) : -1;
    const stato = RIC.dbCerco ? '🔄 Sto cercando…' : d.pausa ? '⏸ Fermo (tocca «Riprendi» o «Cerca adesso»)' : faMin < 0 ? '🕐 Non è ancora partito: il primo giro arriva entro 10 minuti' : faMin > 25 ? `⚠️ Ultimo giro ${faMin} minuti fa: dovrebbe girare ogni 10` : `🟢 Lavora sul server, anche con l'app chiusa · ultimo giro ${faMin < 1 ? 'adesso' : faMin + ' min fa'}`;
    const nomeSez = (CATALOGO_RIC.find(x => x[0] === d.sezione) || [, d.sezione || ''])[1], perc = Math.min(100, Math.round(((Math.max(1, d.fonte || 0) - 1) / ((d.fonti || 10) - 1)) * 100));
    h += `<p style="margin:0"><b>${stato}</b></p>
      <p class="piccolo tenue" style="margin:4px 0 0">Ogni 10 minuti legge una pagina di GialloZafferano, mette in archivio le ricette che mancano e le propone in «🔎 Fammi vedere le ricette nuove». Oggi +${d.oggi}${d.coda ? `, ${d.coda} in arrivo` : ''} · ${d.giri} giri, ${d.pagine} pagine lette${d.passate ? `, ${d.passate} giri completi` : ''}.</p>
      <div class="ricdb-barra" role="progressbar" aria-valuenow="${perc}" aria-valuemin="0" aria-valuemax="100"><i style="width:${perc}%"></i></div>
      <p class="piccolo tenue" style="margin:4px 0 0">Giro ${(d.passate || 0) + 1}: ${sardeTxt(d)} · altre: sezione ${Math.max(1, d.fonte || 0)} di ${(d.fonti || 10) - 1} (${esc(nomeSez)}) · ${perc}%${d.ultimoGiro && d.ultimoGiro.errore ? ` · ⚠️ ultimo errore: ${esc(d.ultimoGiro.errore)}` : ''}</p>
      ${RIC.dbUltime && RIC.dbUltime.length ? `<h3 style="margin:8px 0 4px">Ultime trovate</h3><ul class="ricdb-lista">${RIC.dbUltime.map(r => rigaDb(r, '')).join('')}</ul>` : ''}
      <div class="fila"><button type="button" class="btn pieno" data-a="ric-db-cerca" ${RIC.dbCerco ? 'disabled' : ''}>${RIC.dbCerco ? 'Cerco…' : '🔄 Cerca adesso'}</button>${d.ricette ? '<button type="button" class="btn chiaro" data-a="ric-catalogo" data-v="db">🗄 Sfoglia l\'archivio</button>' : ''}<button type="button" class="btn chiaro" data-a="ric-db-pausa">${d.pausa ? '▶️ Riprendi' : '⏸ Ferma'}</button></div>
      <p class="piccolo tenue" style="margin:4px 0 0">Archivio sul server dell'app: ${d.mb} MB di ricette e ${d.voci} letture della voce${d.mbVoci ? ` (${d.mbVoci} MB)` : ''}, salvate per sempre.</p>`;
  }
  else if (RIC.db) h += '<p class="piccolo" style="margin:0">Il server non risponde: riprova fra un minuto (serve la rete).</p>';
  h += '</section>';
  h += `<section class="scheda"><h2>📊 Dati senza rete su questo telefono</h2>${dati ? `<p class="piccolo tenue" style="margin:0">${scar.length} ricette, ${dati.foto} foto e ${dati.voci} letture della voce salvate. Spazio usato dall'app: ${dati.usatoMb} MB${dati.totMb ? ` su ${dati.totMb} MB disponibili` : ''}.</p>` : '<p class="piccolo tenue" style="margin:0">Misuro…</p>'}</section>`;
  h += `<details class="ric-intro"><summary><b>💾 Copia di sicurezza</b> <small class="tenue">(ricette tue, note, preferite)</small></summary>
    <p class="piccolo" style="margin:0">Stanno solo su questo telefono: salva una copia (un file) e, se cambi telefono, riprendila da lì.</p>
    <div class="fila"><button type="button" class="btn chiaro" data-a="ric-copia-salva">💾 Salva una copia</button><label class="btn chiaro">📂 Riprendi da una copia<input type="file" id="ric-copia-file" accept=".json,application/json" hidden></label></div></details>`;
  return h + '</main>';
}
function vRicettario() {
  if (!RIC.dbLetto) { RIC.dbLetto = true; caricaScaricate(); }
  if (RIC.stato !== 'pronto') return attesaRic('Ricettario');
  leggiScelte(); chiediStatoDb();
  const f = UI.ric || (UI.ric = Object.assign(filtriVuoti(), leggiRic('pit-ric-filtri', {}), { q: '' }));   // C69: filtri ricordati (non la ricerca scritta)
  const pref = preferiteRic(), q = senzaAccenti(f.q).trim(), cache = cacheRic();
  const mie = mieRic().map(daMia);
  const scar = RIC.scaricate, extra = Object.assign({}, scar, cache);
  const elenco = elencoRic();
  const tutte = mie.concat(elenco.map(r => { const x = extra[r.id]; return !x ? r : Object.assign({}, r, { foto: r.foto || x.foto || '', totale: r.totale || x.totale || (x.prep || 0) + (x.cottura || 0), difficolta: r.difficolta || x.difficolta || '', ingredienti: r.ingredienti || x.ingredienti }); }), Object.values(extra).filter(r => !elenco.some(x => x.id === r.id)));
  let rr = tutte.filter(r => (f.zona === 'tutte' ? !(!r.mia && !r.zona && !pref.includes(r.id)) : f.zona === 'pref' ? pref.includes(r.id) : f.zona === 'mie' ? r.mia
      : f.zona === 'sarda' ? r.zona === 'sarda' || r.zona === 'gallura' : r.zona === f.zona)
    && (!f.cat || r.categoria === f.cat)
    && (!f.tempo || (minutiRic(r) > 0 && minutiRic(r) <= f.tempo)) && (!f.facile || /facil/i.test(r.difficolta || ''))
    && (!q || q.split(/[\s,]+/).filter(Boolean).every(p => senzaAccenti(r.nome + ' ' + (r.cerca || '') + ' ' + (r.ingredienti || []).map(i => i.nome).join(' ')).includes(p))));
  const az = (a, b) => a.nome.localeCompare(b.nome, 'it');
  rr = rr.sort(f.ordine === 'nuove' ? (a, b) => (b.aggiunta || 0) - (a.aggiunta || 0) || az(a, b) : f.ordine === 'az' ? az
    : f.ordine === 'veloci' ? (a, b) => (minutiRic(a) || 1e4) - (minutiRic(b) || 1e4) || az(a, b)
    : (a, b) => (pref.includes(b.id) - pref.includes(a.id)) || (!!b.mia - !!a.mia) || az(a, b));
  const filtrato = filtriAttivi(f);
  const c = RIC.cerca, nScar = Object.keys(scar).length;
  let h = testataMonica('Ricettario', 'home') + '<main class="corpo">';
  h += `<div><h1>Ricettario</h1><p class="tenue" style="margin:4px 0 0">${elenco.length + mie.length} ricette tue e di GialloZafferano, con video, foto dei passaggi e voce. Le vedete solo tu e Mario.</p></div>
    <form class="ric-cerca" data-ric-cerca="1"><input id="ric-cerca" type="search" data-ricerca="1" value="${esc(f.q)}" placeholder="Cerca un piatto o 2-3 ingredienti (es. zucchine, uova)" autocomplete="off" enterkeyhint="search">
      ${typeof Riconosci !== 'undefined' && Riconosci && typeof ascoltaAI === 'function' ? `<button type="button" class="btn chiaro" data-a="ric-dico" aria-label="Cerca a voce">${AI.rec ? '⏹' : '🎙'}</button>` : ''}
      <button type="submit" class="btn pieno" aria-label="Cerca su GialloZafferano">${ico('cerca')}</button></form>
    <div class="scelte" role="group" aria-label="Quali">${ZONE_RIC.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-zona" data-v="${k}" aria-pressed="${f.zona === k}">${t}</button>`).join('')}</div>
    <div class="scelte" role="group" aria-label="Portata">${CAT_RIC.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-cat" data-v="${k}" aria-pressed="${f.cat === k}">${t}</button>`).join('')}</div>
    ${(() => { const n = (f.tempo ? 1 : 0) + (f.facile ? 1 : 0) + (f.ordine ? 1 : 0); return `<button type="button" class="btn chiaro piccolo" data-a="ric-piu" aria-expanded="${!!(f.piu || n)}">⚙️ Più filtri e ordina${n ? ` (${n})` : ''}</button>`; })()}
    ${f.piu || f.tempo || f.facile || f.ordine ? `<div class="scelte" role="group" aria-label="Tempo e difficoltà"><button type="button" class="scelta" data-a="ric-tempo" data-v="30" aria-pressed="${f.tempo === 30}">⏱ Fino a 30 min</button><button type="button" class="scelta" data-a="ric-tempo" data-v="60" aria-pressed="${f.tempo === 60}">⏱ Fino a 1 ora</button><button type="button" class="scelta" data-a="ric-facile" aria-pressed="${!!f.facile}">👌 Facili</button></div>
    <div class="scelte" role="group" aria-label="Ordina"><span class="piccolo tenue" style="align-self:center">Ordina:</span>${ORDINI_RIC.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-ordine" data-v="${k}" aria-pressed="${(f.ordine || '') === k}">${t}</button>`).join('')}</div>` : ''}
    <p class="piccolo ric-conta" style="margin:0"><b>${rr.length}</b> ${rr.length === 1 ? 'ricetta' : 'ricette'}${filtrato ? ` · <button type="button" class="link" data-a="ric-pulisci">✕ Azzera i filtri</button>` : ''}${f.tempo || f.facile ? '<br><span class="tenue">Tempo e difficoltà ci sono solo per le ricette già arrivate nell\'archivio: le altre compaiono dopo.</span>' : ''}</p>`;
  if (f.q.trim().length >= 2) h += `<button type="button" class="btn chiaro pieno" data-a="ric-cerca-gz">${ico('cerca')}Cerca «${esc(f.q.trim())}» fra tutte le ricette di GialloZafferano</button>`;
  if (c.stato) {
    h += `<section class="scheda" id="ric-risultati"><h2>${c.cat === 'nuove' ? '🔎 Ricette nuove per te' : c.cat ? '📚 ' + esc(c.q) + ' · tutte' : `Da GialloZafferano: «${esc(c.q)}»`}${c.risultati.length ? ` <small class="tenue">(${c.risultati.length}${c.prossima ? '+' : ''})</small>` : ''}</h2>${c.stato === 'carico' ? '<p class="tenue" style="margin:0">Cerco…</p>'
      : c.stato === 'errore' ? `<p style="margin:0">${esc(c.errore)}</p><button type="button" class="btn chiaro" data-a="ric-cerca-gz">Riprova</button>`
      : c.risultati.length ? `${RIC.scarico ? '' : `<button type="button" class="btn chiaro pieno" data-a="ric-scarica-cerca">📥 Scarica queste ${c.risultati.length} per usarle senza rete</button>`}<div class="ric-elenco">${c.risultati.map(r => cartaRic(r, pref)).join('')}</div>${c.prossima ? `<button type="button" class="btn chiaro pieno" data-a="ric-altre" ${c.altre === 'carico' ? 'disabled' : ''}>${c.altre === 'carico' ? 'Carico…' : c.altre === 'errore' ? 'Non riuscito: riprova' : 'Carica altre ricette'}</button>` : ''}` : c.cat === 'nuove' ? '<p style="margin:0">Il motore sta ancora cercando: ogni 10 minuti trova ricette nuove. Riprova fra un\'ora, o cerca a parole qui sopra.</p>' : '<p style="margin:0">Nessuna ricetta con queste parole. Prova con meno parole.</p>'}
      <button type="button" class="btn chiaro piccolo" data-a="ric-chiudi-cerca">Chiudi la ricerca</button></section>`;
  }
  if (!filtrato && !c.stato) {
    /* 🎲 una ricetta a caso per oggi: preferite e sarde contano doppio; «Un'altra» ne pesca un'altra */
    const pool = tutte.filter(x => !x.mia || x.passi), pesi = pool.flatMap(x => pref.includes(x.id) || x.zona === 'sarda' || x.zona === 'gallura' ? [x, x] : [x]);
    if (pesi.length) {
      const g = Number(oggi().replace(/\D/g, '')) || 1, k = (g * 7919 + (UI.dado || 0) * 104729) % pesi.length, x = pesi[k];
      h += `<section class="scheda"><h2>🎲 Cosa cucino oggi?</h2>${cartaRic(x, pref)}<button type="button" class="btn chiaro piccolo" data-a="ric-dado">Un'altra</button></section>`;
    }
  }
  h += barraScarico();
  /* L'ELENCO, subito (Mario 08/11 «fai ordine»): prima le ricette, poi il resto */
  h += rr.length ? `<div class="ric-elenco">${rr.map(r => cartaRic(r, pref)).join('')}</div>`
    : `<section class="scheda"><p style="margin:0">${f.zona === 'pref' ? 'Nessuna preferita: apri una ricetta e tocca ☆ Preferita.' : f.zona === 'mie' ? 'Non hai ancora scritto ricette tue.' : filtrato ? 'Nessuna ricetta con questi filtri.' : 'Nessuna ricetta in questo gruppo.'}</p>
      <button type="button" class="btn chiaro" data-a="ric-pulisci">Mostra tutte</button></section>`;
  h += `<button type="button" class="btn chiaro pieno" data-a="vai" data-v="ricmia:nuova">${ico('matita')}Scrivi una tua ricetta</button>`;
  if (!q && !c.stato) {
    /* SCOPRI: il motore, il catalogo, i temi, le ispirate: tutto in una scheda, aperto solo quello che tocchi */
    voceAutomatica(); h += riquadroDb();
    h += `<section class="scheda"><h2>🔎 Scopri ricette nuove</h2>
      <button type="button" class="btn pieno" data-a="ric-catalogo" data-v="nuove">🔎 Fammi vedere le ricette nuove</button>
      <p class="piccolo tenue" style="margin:0">Il motore cerca su GialloZafferano quelle che non hai ancora (prima col video e i voti alti): apri, e se ti piace «➕ Aggiungi».</p>
      <details class="ric-intro ric-catalogo-box"><summary><b>📚 Catalogo per portata</b> <small class="tenue">tutte le ricette di GialloZafferano</small></summary>
        <div class="scelte">${CATALOGO_RIC.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-catalogo" data-v="${k}">${t}</button>`).join('')}</div>
        <details class="ric-intro ric-ingr"><summary><b>Per ingrediente</b> <small class="tenue">(${CATALOGO_ING.length})</small></summary><div class="scelte">${CATALOGO_ING.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-catalogo" data-v="ricette-con-${k}">${t}</button>`).join('')}</div></details></details>
      <details class="ric-intro ric-esplora-box"><summary><b>✨ Per tema</b> <small class="tenue">sardi, veloci, dolci…</small></summary><div class="scelte">${ESPLORA_RIC.map(t => `<button type="button" class="scelta" data-a="ric-esplora" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div></details></section>`;
    if (f.zona === 'tutte' && !f.cat) {
      ispira();
      const isp = ispirate();
      if (isp.length) h += `<section class="scheda"><h2>✨ Ispirate ai tuoi piatti</h2><p class="piccolo tenue" style="margin:0">Ricette di GialloZafferano simili a quelle del tuo menù. Si aggiornano ogni giorno.</p>
        <div class="ric-scorri">${isp.map(r => cartaRic(Object.assign({}, r, { categoria: '' }), pref).replace('</small></span></button>', ` · come «${esc(r.per)}»</small></span></button>`)).join('')}</div></section>`;
    }
    /* 🗄 verso la pagina Database: i numeri in una riga */
    const d = RIC.db && !RIC.db.errore ? RIC.db : null;
    h += `<button type="button" class="riquadro ric-db-link" data-a="vai" data-v="ricdb">🗄<div><b>Database ricette</b><small>${elenco.length + mie.length} nel ricettario · ${nScar} sul telefono${d ? ` · ${d.ricette} nell'archivio` : ''}</small></div></button>`;
  }
  return h + '</main>';
}

function vRicetta(id) {
  if (RIC.stato !== 'pronto') return attesaRic('Ricetta', 'ricettario');
  const r = ricetta(id), v = voceElenco(id);
  if (!r) {
    if (/^mia:/.test(id) || !/^gz:[\w%-]+$/.test(id)) { UI.vista = 'ricettario'; return vRicettario(); }
    if (RIC.errore[id]) return testataMonica('Ricetta', 'ricettario') + `<main class="corpo"><section class="scheda"><p style="margin:0"><b>Non riesco ad aprire «${esc(v ? v.nome : 'la ricetta')}».</b></p>
      <p class="piccolo" style="margin:0">${esc(RIC.errore[id])}</p><button type="button" class="btn pieno" data-a="ric-riapri" data-v="${esc(id)}">Riprova</button></section></main>`;
    apriGz(id);
    return testataMonica('Ricetta', 'ricettario') + `<main class="corpo">${v && v.foto ? `<figure class="ric-foto"><img src="${esc(v.foto)}" alt="" referrerpolicy="no-referrer"></figure>` : ''}
      <section class="scheda"><p class="tenue" style="margin:0">Apro «${esc(v ? v.nome : 'la ricetta')}» da GialloZafferano…</p></section></main>`;
  }
  const porz = (UI.ricPorz && UI.ricPorz[id]) || r.porzioni, spunte = (UI.ricSpunte && UI.ricSpunte[id]) || {}, pref = preferiteRic().includes(id);
  let h = testataMonica('Ricetta', 'ricettario') + '<main class="corpo">';
  // Mario 08/11: «il play come prima cosa nella ricetta»
  h += `<button type="button" class="btn pieno ric-play" data-a="ric-play" data-v="${esc(id)}">▶️ Ascolta la ricetta passo passo</button>`;
  if (/^gz:/.test(id) && !nelRicettario(id)) h += `<section class="scheda ric-aggiungi"><p style="margin:0"><b>Non è ancora nel tuo ricettario.</b> Ti piace? Aggiungila: la vedrete tu e Monica nell'elenco, con video, foto e voce.</p>
    <button type="button" class="btn pieno" data-a="ric-aggiungi" data-v="${esc(id)}">➕ Aggiungi al mio ricettario</button></section>`;
  else if ((RIC.scelte || []).some(x => x.id === id)) h += `<p class="piccolo tenue" style="margin:0">✓ Nel tuo ricettario · <button type="button" class="link" data-a="ric-togli" data-v="${esc(id)}">Togli</button></p>`;
  if (r.hls || r.mp4) h += `<div class="ric-video"><video id="ric-video" controls playsinline preload="none" poster="${esc(r.copertina || r.foto)}" data-hls="${esc(r.hls || '')}" data-mp4="${esc(r.mp4 || '')}"></video></div>`;
  else if (r.foto) h += `<figure class="ric-foto"><img src="${esc(r.foto)}" alt="${esc(r.nome)}" referrerpolicy="no-referrer"></figure>`;
  const info = [r.prep && 'Preparazione ' + durataRic(r.prep), r.cottura && 'Cottura ' + durataRic(r.cottura), !r.prep && r.totale && 'Tempo ' + durataRic(r.totale),
    r.difficolta && 'Difficoltà ' + r.difficolta.toLowerCase(), r.costo && 'Costo ' + r.costo.toLowerCase()].filter(Boolean).join(' · ');
  h += `<div><h1>${esc(r.nome)}</h1>${info ? `<p class="tenue" style="margin:4px 0 0">${esc(info)}</p>` : ''}</div>`;
  if (r.intro) h += `<details class="ric-intro"><summary>${esc(r.intro.split('\n')[0].slice(0, 140))}${r.intro.length > 140 ? '…' : ''} <b>Leggi tutto</b></summary>${r.intro.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('')}</details>`;
  h += `<div class="fila"><button type="button" class="btn chiaro" data-a="ric-pref" data-v="${esc(id)}" aria-pressed="${pref}">${pref ? '⭐ Preferita' : '☆ Preferita'}</button>
      ${r.mia ? `<button type="button" class="btn chiaro" data-a="vai" data-v="ricmia:${esc(id)}">${ico('matita')}Cambia</button>` : ''}
      ${typeof S !== 'undefined' && S.piatti && !S.piatti.some(x => x.ricetta === id) ? `<button type="button" class="btn chiaro" data-a="ric-menu" data-v="${esc(id)}">➕ Metti nel menù</button>` : ''}</div>
    <section class="scheda"><h2>Ingredienti</h2>
      <div class="fila ric-porz"><span>Per <b>${porz}</b> ${porz === 1 ? 'persona' : 'persone'}</span>
        <button type="button" class="btn chiaro piccolo" data-a="ric-porz" data-v="-1" aria-label="Una persona in meno" ${porz <= 1 ? 'disabled' : ''}>−</button>
        <button type="button" class="btn chiaro piccolo" data-a="ric-porz" data-v="1" aria-label="Una persona in più" ${porz >= 60 ? 'disabled' : ''}>+</button></div>
      <p class="piccolo tenue" style="margin:0">Spunta quello che hai già: nella spesa va solo il resto.</p>
      <ul class="ric-ing">${r.ingredienti.map((i, k) => `<li><label><input type="checkbox" data-a="ric-spunta" data-v="${k}" ${spunte[k] ? 'checked' : ''}><span>${rigaIng(i, r.porzioni, porz)}</span></label></li>`).join('')}</ul>
      <button type="button" class="btn chiaro pieno" data-a="ric-spesa" data-v="${esc(id)}">${ico('carrello')}Metti nella lista della spesa</button></section>
    <section class="scheda"><h2>📝 Le tue note</h2><textarea id="ric-nota" data-ricnota="${esc(id)}" rows="2" maxlength="1000" placeholder="Es. metà zucchero; a Laura piace con più pecorino">${esc(notaRic(id))}</textarea>
      <p class="piccolo tenue" style="margin:0">Si salvano da sole su questo telefono e le rivedi nella cucina guidata.</p></section>
    <section class="scheda"><h2>Passo passo</h2><ol class="ric-passi">${r.passi.map(p => `<li><div>${p.foto && p.foto.length ? `<div class="ric-fotopassi">${p.foto.map(f => `<img src="${esc(f)}" alt="Ingrandisci" loading="lazy" referrerpolicy="no-referrer" data-a="ric-zoom" data-v="${esc(f)}">`).join('')}</div>` : ''}<span>${esc(p.t)}</span></div></li>`).join('')}</ol></section>`;
  if (r.conserva) h += `<section class="scheda"><h2>Conservazione</h2>${r.conserva.split(/\n+/).map(p => `<p style="margin:0">${esc(p)}</p>`).join('')}</section>`;
  if (r.consiglio) h += `<section class="scheda"><h2>Consiglio</h2>${r.consiglio.split(/\n+/).map(p => `<p style="margin:0">${esc(p)}</p>`).join('')}</section>`;
  h += r.mia ? '' : `<p class="piccolo tenue" style="margin:0">Ricetta, foto e video di GialloZafferano${r.autore && r.autore !== 'GialloZafferano' ? ' · ' + esc(r.autore) : ''}. ${navigator.onLine === false ? 'Senza rete: vedi la copia salvata sul telefono.' : ''}</p>`;
  return h + '</main>';
}
/* il video si gioca DENTRO l'app: Android/iPhone col lettore del telefono; dove serve, hls.js (si scarica solo allora) */
function preparaVideo() {
  const v = document.getElementById('ric-video');
  if (RIC.hls && (!v || RIC.hls.media !== v)) { try { RIC.hls.destroy(); } catch (e) { /* già chiuso */ } RIC.hls = null; }
  if (!v || v.dataset.pronto) return;
  v.dataset.pronto = '1';
  const hls = v.dataset.hls, mp4 = v.dataset.mp4;
  v.addEventListener('error', () => { if (mp4 && v.src !== mp4) v.src = mp4; }, { once: true });
  if (!hls || v.canPlayType('application/vnd.apple.mpegurl')) { v.src = hls || mp4; return; }
  const usa = () => { if (window.Hls && Hls.isSupported()) { RIC.hls = new Hls(); RIC.hls.loadSource(hls); RIC.hls.attachMedia(v); } else v.src = mp4 || hls; };
  if (window.Hls) return usa();
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
  s.onload = usa; s.onerror = () => { v.src = mp4 || hls; };
  document.head.appendChild(s);
}
new MutationObserver(() => { if (/^ricetta:/.test(UI.vista) || RIC.hls) preparaVideo(); }).observe(document.documentElement, { childList: true, subtree: true });

/* cucina guidata: schermo acceso, voce, timer se il passo dice i minuti. Un passo alla volta, tasti grandi */
function vCucina(id) {
  if (RIC.stato !== 'pronto') return attesaRic('Cucina guidata', 'ricettario');
  const r = ricetta(id);
  if (!r || !r.passi.length) { UI.vista = 'ricetta:' + id; return vRicetta(id); }
  const nuova = !(UI.cucina && UI.cucina.id === id);
  const c = nuova ? (UI.cucina = { id, passo: 0, voce: true }) : UI.cucina;
  tieniAcceso(true); voceAutomatica();
  if (nuova || c.leggi) { c.leggi = false; setTimeout(() => { if (UI.cucina === c && /^cucina:/.test(UI.vista)) leggiPasso(); }, 0); }   // la voce parte da sola al primo passo (Mario 08/11): il tocco su ▶️ ha già dato il permesso audio
  const i = Math.min(c.passo, r.passi.length - 1), p = r.passi[i], ultimo = i === r.passi.length - 1, min = minutiPasso(p.t);
  const mio = timerDi(id, i), altri = RIC.timers.filter(x => x !== mio), nota = notaRic(id);
  let h = testataMonica('Cucina guidata', 'ricetta:' + id) + '<main class="corpo ric-cucina">';
  h += `<p class="tenue" style="margin:0">${esc(r.nome)} · passo <b>${i + 1}</b> di ${r.passi.length}</p>
    <div class="punti ric-punti">${r.passi.map((_, j) => `<i class="${j === i ? 'on' : j < i ? 'fatto' : ''}"></i>`).join('')}</div>
    ${nota ? `<p class="avviso piccolo" style="margin:0">📝 ${esc(nota)}</p>` : ''}
    <section class="scheda ric-passo">${p.foto && p.foto.length ? `<div class="ric-fotopassi grandi">${p.foto.map(f => `<img src="${esc(f)}" alt="Ingrandisci" referrerpolicy="no-referrer" data-a="ric-zoom" data-v="${esc(f)}">`).join('')}</div>` : ''}<p>${esc(p.t)}</p>
      ${min ? `<button type="button" class="btn ${mio ? 'chiaro' : 'pieno'}" data-a="ric-timer" data-v="${min}">⏱ ${mio ? `Mancano ${mmssRic(restaTimer(mio))} · ferma` : `Timer ${durataRic(min)}`}</button>` : ''}</section>
    ${altri.map(x => `<p class="avviso piccolo fila" style="margin:0"><span>⏱ ${esc((x.libero ? durataRic(x.min) + ' · ' : '') + (x.id === id ? 'Passo ' + (x.passo + 1) : x.nome + ', passo ' + (x.passo + 1)))}: mancano <b>${mmssRic(restaTimer(x))}</b></span><button type="button" class="btn chiaro piccolo" data-a="ric-timer-via" data-v="${x.n}">Ferma</button></p>`).join('')}
    <button type="button" class="btn chiaro piccolo" data-a="ric-altro" aria-expanded="${!!UI.ricAltro}">⏱ Altro timer${UI.ricAltro ? ' ▴' : ' ▾'}</button>
    ${UI.ricAltro ? `<div class="scelte" role="group" aria-label="Timer veloce">${[5, 10, 15, 20, 30, 45].map(m => `<button type="button" class="scelta" data-a="ric-timer-libero" data-v="${m}">${m} min</button>`).join('')}</div>` : ''}
    <div class="ric-tasti">
      <button type="button" class="btn chiaro" data-a="ric-passo" data-v="-1" ${i === 0 ? 'disabled' : ''}>${ico('indietro')}Indietro</button>
      <button type="button" class="btn chiaro" data-a="ric-ripeti">🔊 Ripeti</button>
      ${ultimo ? `<button type="button" class="btn pieno" data-a="ric-fine">Finito!</button>` : `<button type="button" class="btn pieno" data-a="ric-passo" data-v="1">Avanti</button>`}</div>
    <label class="interr"><span>Leggi i passi ad alta voce<small>La voce legge ogni passo quando lo apri.</small></span><input type="checkbox" data-a="ric-voce" ${c.voce ? 'checked' : ''}></label>
    ${typeof vociIt === 'function' ? `<label>Voce che legge<select id="ric-voce-scelta">${(typeof VOCI_VERE !== 'undefined' ? VOCI_VERE : []).concat(typeof vociLocali === 'function' ? vociLocali() : []).map(([k, n]) => `<option value="${k}" ${sceltaVoce() === k ? 'selected' : ''}>${n}</option>`).join('')}${vociIt().map(v => `<option value="${esc(v.name)}" ${sceltaVoce() === v.name ? 'selected' : ''}>${esc(v.name.replace(/^(Microsoft|Google)\s*/i, '').replace(/\s*\(.*\)$/, ''))}${v.localService === false ? ' · del telefono, online' : ' · del telefono'}</option>`).join('')}</select></label>` : ''}
    ${vociLocaleRiga()}
    ${RiconosciRic ? `<label class="interr"><span>🎙 Mani libere${RIC.rec ? ' · <b>ti ascolto</b>' : ''}<small>Dopo ogni passo la voce si ferma e aspetta. Di': «avanti», «indietro», «ripeti», «timer», «quanto manca», «ingredienti», «finito», «stop».</small></span><input type="checkbox" data-a="ric-mani" ${c.mani ? 'checked' : ''}></label>` : ''}`;
  return h + '</main>';
}
/* testi che la cucina guidata legge: «Passo N. …» e le code («di' avanti»…), uguali a quelli di leggiPasso */
function testiVoceRic(r) {
  const code = [' Di\' «timer» per il conto alla rovescia.', ' Era l\'ultimo passo: di\' «finito».', ' Quando hai fatto, di\' «avanti».', ' Se vuoi, tocca Timer.',
    ' Di\' «timer» per il conto alla rovescia. Era l\'ultimo passo: di\' «finito».', ' Di\' «timer» per il conto alla rovescia. Quando hai fatto, di\' «avanti».'].map(x => x.trim());
  return (r.passi || []).map((p, i) => `Passo ${i + 1}. ${p.t}`).concat(code);
}
/* fila delle voci da scaricare: una ricetta alla volta, così non si intasa niente */
RIC.filaVoci = []; RIC.vociFatte = leggiRic('pit-ric-voci', {}) || {};
function codaVoci(r) {
  if (!r || RIC.vociFatte[r.id] || RIC.filaVoci.some(x => x.id === r.id)) return;
  RIC.filaVoci.push(r);
  if (RIC.filaVoci.length === 1) (async () => { while (RIC.filaVoci.length) { const x = RIC.filaVoci[0]; if (await preparaVociRic(x) >= testiVoceRic(x).length) { RIC.vociFatte[x.id] = Date.now(); scriviRic('pit-ric-voci', RIC.vociFatte); if (UI.vista === 'ricdb') render(); } RIC.filaVoci.shift(); } })();
}
async function preparaVociRic(r) {
  if (!r || typeof scaricaVoce !== 'function') return 0;
  let n = 0;
  for (const t of testiVoceRic(r)) { if (!(await scaricaVoce(t))) break; n++; }   // al primo errore mi fermo (Microsoft giù): riprovo la prossima volta
  return n;
}
/* voce sul telefono scelta: dice se è scaricata; se no, «⬇️ Scarica la voce (N MB)» con la barra (Mario 08/11) */
/* VOCE AUTOMATICA (Mario 08/11): a chi gestisce l'app scarica da sola la voce di base (VOCE_AUTO) la prima volta che apre il Ricettario, con qualunque rete; niente da toccare */
function voceAutomatica() {
  if (RIC.voceAutoFatto || typeof motoreLocale !== 'function' || typeof VOCE_AUTO === 'undefined' || !navigator.onLine) return;
  const k = VOCE_AUTO, M = motoreLocale(k); if (!M) return;
  RIC.voceAutoFatto = true;
  M.pronta(k).then(ok => {
    if (ok) { AI.localiPronte[k] = true; return; }
    RIC.scaricoVoce = { k, p: 0 };
    return M.scarica(k, p => { if (RIC.scaricoVoce) RIC.scaricoVoce.p = p; const b = document.querySelector('.ric-voce-stato b'), pr = document.querySelector('.ric-voce-stato progress'); if (b && pr) { b.textContent = Math.round(p * 100) + '%'; pr.value = Math.round(p * 100); } })
      .then(() => { AI.localiPronte[k] = true; RIC.scaricoVoce = null; if (/^cucina:/.test(UI.vista)) { render(); if (sceltaVoce() === k) leggiPasso(); } });
  }).catch(() => { RIC.scaricoVoce = null; RIC.voceAutoFatto = false; });   // rete caduta: riprova alla prossima apertura
}
function vociLocaleRiga() {
  const k = sceltaVoce(), M = typeof motoreLocale === 'function' && motoreLocale(k);
  if (!M) return /^edge:/.test(k) && typeof AI !== 'undefined' && AI.voceNo ? '<p class="avviso piccolo ric-voce-stato" style="margin:0">⚠️ Microsoft non risponde adesso: legge la voce del telefono (per questo le voci sembrano uguali). Scegli una voce «sul telefono» e scaricala: è tua per sempre.</p>' : '';
  const st = statoVoceLocale(k, () => { if (/^cucina:/.test(UI.vista)) render(); }), sc = RIC.scaricoVoce;
  if (sc && sc.k === k) return `<p class="tenue ric-voce-stato">⬇️ Scarico la voce… <b>${Math.round(sc.p * 100)}%</b><progress max="100" value="${Math.round(sc.p * 100)}" style="width:100%"></progress><small>Resta sul telefono: dopo parla anche senza rete.</small></p>`;
  if (st === true) return '<p class="tenue ric-voce-stato">✅ Voce sul telefono: parla anche senza rete.</p>';
  if (st === false) return `<p class="ric-voce-stato"><button type="button" class="btn chiaro pieno" data-a="ric-voce-scarica">⬇️ Scarica la voce (${M.mb(k)} MB, una volta sola)</button><small class="tenue">Finché non è scaricata legge la voce del telefono.</small></p>`;
  return '<p class="tenue ric-voce-stato">Controllo se la voce è sul telefono…</p>';
}
function leggiPasso() {
  const c = UI.cucina, r = c && ricetta(c.id);
  if (!r || !c.voce || typeof parlaAI !== 'function') return;
  if (c.passo === 0) codaVoci(r);   // mentre leggo il primo passo, scarico le voci degli altri
  const p = r.passi[c.passo], min = minutiPasso(p.t), ultimo = c.passo === r.passi.length - 1;
  const coda = c.mani ? (min ? ' Di\' «timer» per il conto alla rovescia.' : '') + (ultimo ? ' Era l\'ultimo passo: di\' «finito».' : ' Quando hai fatto, di\' «avanti».') : (min ? ' Se vuoi, tocca Timer.' : '');
  fermaAscolto();
  // due letture: il passo e la coda («di' avanti»…): la coda è uguale in tutte le ricette, il server la salva una volta sola (C60)
  const poi = () => { if (UI.cucina === c && c.mani) ascoltaCucina(); };
  parlaAI(`Passo ${c.passo + 1}. ${p.t}`, () => { if (UI.cucina !== c) return; if (coda.trim()) parlaAI(coda.trim(), poi); else poi(); });
}
/* MANI LIBERE: dopo ogni passo la voce si ferma e aspetta un comando detto (Chrome su Android). Comandi in COMANDI_RIC */
const RiconosciRic = window.SpeechRecognition || window.webkitSpeechRecognition;
const COMANDI_RIC = [[/avanti|fatto|prossimo|successivo|vai|ok/, 'avanti'], [/indietro|torna|precedente/, 'indietro'], [/ripeti|ancora|come|cosa/, 'ripeti'],
  [/quanto manca|manca/, 'manca'], [/timer|avvia|conta/, 'timer'], [/ingredient/, 'ingredienti'], [/finit|ho finito/, 'fine'], [/stop|basta|ferma|silenzio/, 'stop']];
function fermaAscolto() { if (RIC.rec) { const r = RIC.rec; RIC.rec = null; try { r.abort(); } catch (e) { /* già fermo */ } } }
function ascoltaCucina() {
  const c = UI.cucina;
  if (!RiconosciRic || !c || !c.mani || RIC.rec || !/^cucina:/.test(UI.vista) || document.visibilityState !== 'visible') return;
  const rec = new RiconosciRic(); RIC.rec = rec;
  rec.lang = 'it-IT'; rec.interimResults = false; rec.maxAlternatives = 3;
  let capito = '';
  rec.onresult = e => { const alt = [...e.results[0]].map(a => a.transcript.toLowerCase()); for (const t of alt) { const k = COMANDI_RIC.find(([re]) => re.test(t)); if (k) { capito = k[1]; break; } } };
  rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { c.mani = false; mostraToast('Il microfono è bloccato: permettilo nelle impostazioni del telefono.'); render(); } };
  rec.onend = () => {
    if (RIC.rec !== rec) return;
    RIC.rec = null;
    if (capito) comandoCucina(capito);
    else setTimeout(ascoltaCucina, 300);   // silenzio: riascolto finché sei in cucina
  };
  try { rec.start(); render(); } catch (e) { RIC.rec = null; }
}
function comandoCucina(k) {
  const c = UI.cucina, r = c && ricetta(c.id); if (!r) return;
  const min = minutiPasso(r.passi[c.passo].t);
  if (k === 'avanti') { if (c.passo < r.passi.length - 1) A['ric-passo']({ dataset: { v: '1' } }); else parlaAI('È l\'ultimo passo. Di\' «finito» se hai fatto.', ascoltaCucina); }
  else if (k === 'indietro') { if (c.passo > 0) A['ric-passo']({ dataset: { v: '-1' } }); else parlaAI('Sei al primo passo.', ascoltaCucina); }
  else if (k === 'ripeti') leggiPasso();
  else if (k === 'timer') { if (min) { if (!timerDi(c.id, c.passo)) A['ric-timer']({ dataset: { v: String(min) } }); parlaAI(`Timer di ${durataRic(min)} partito.`, ascoltaCucina); } else parlaAI('In questo passo non ci sono minuti.', ascoltaCucina); }
  else if (k === 'manca') { const tt = RIC.timers.slice().sort((a, b) => a.fine - b.fine); parlaAI(tt.length ? tt.map(x => { const s = restaTimer(x); return `${tt.length > 1 ? x.nome + ' passo ' + (x.passo + 1) + ': ' : ''}mancano ${Math.floor(s / 60)} minuti e ${s % 60} secondi`; }).join('. ') + '.' : 'Nessun timer acceso.', ascoltaCucina); }
  else if (k === 'ingredienti') { const porz = (UI.ricPorz && UI.ricPorz[r.id]) || r.porzioni; parlaAI('Ingredienti: ' + r.ingredienti.map(i => (i.q == null ? '' : qRic(i.q, r.porzioni, porz).replace('½', ' e mezzo') + ' ' + (i.u || '') + ' ') + i.nome).join(', ') + '.', ascoltaCucina); }
  else if (k === 'fine') A['ric-fine']();
  else if (k === 'stop') { c.mani = false; fermaAscolto(); parlaAI('Va bene, smetto di ascoltare.'); render(); }
}

/* scrivi o cambia una ricetta tua: nome, persone, ingredienti e passi (uno per riga), foto */
function vRicMia(id) {
  const nuova = id === 'nuova', m = nuova ? null : mieRic().find(x => x.id === id);
  if (!nuova && !m) { UI.vista = 'ricettario'; return vRicettario(); }
  const b = UI.ricBozza && UI.ricBozza.id === id ? UI.ricBozza : (UI.ricBozza = Object.assign({ id, nome: '', porzioni: 4, minuti: '', categoria: '', ingredienti: [], passi: [], note: '', foto: '' }, m || {}));
  let h = testataMonica(nuova ? 'Ricetta nuova' : 'Cambia ricetta', nuova ? 'ricettario' : 'ricetta:' + id) + '<main class="corpo">';
  h += `<section class="scheda ric-modulo">
    <label>Nome del piatto<input type="text" data-ric="nome" value="${esc(b.nome)}" maxlength="80" placeholder="es. Malloreddus di mia nonna"></label>
    <div class="fila"><label style="flex:1">Per quante persone<input type="number" data-ric="porzioni" value="${esc(b.porzioni)}" min="1" max="60" inputmode="numeric"></label>
      <label style="flex:1">Minuti in tutto<input type="number" data-ric="minuti" value="${esc(b.minuti)}" min="0" max="1440" inputmode="numeric"></label></div>
    <label>Portata<select data-ric="categoria">${CAT_RIC.map(([k, t]) => `<option value="${k}" ${b.categoria === k ? 'selected' : ''}>${k ? t : 'Scegli…'}</option>`).join('')}</select></label>
    <label>Ingredienti, uno per riga<textarea data-ric="ingredienti" rows="6" placeholder="Farina 300 g&#10;Uova 2&#10;Sale q.b.">${esc(b.ingredienti.join('\n'))}</textarea></label>
    <label>Come si fa: un passo per riga<textarea data-ric="passi" rows="8" placeholder="Impasta farina e acqua per 10 minuti.&#10;Lascia riposare 30 minuti.">${esc(b.passi.join('\n'))}</textarea></label>
    <label>Note (facoltative)<textarea data-ric="note" rows="2" placeholder="Segreti, varianti, a chi piace…">${esc(b.note)}</textarea></label>
    <div class="fila">${b.foto ? `<img class="ric-mia-foto" src="${b.foto}" alt="">` : ''}<label class="btn chiaro">${ico('foto')}${b.foto ? 'Cambia foto' : 'Aggiungi una foto'}<input id="ric-foto-file" type="file" accept="image/*" hidden></label>
      ${b.foto ? '<button type="button" class="btn chiaro piccolo" data-a="ric-mia-via-foto">Togli foto</button>' : ''}</div>
    <p class="piccolo tenue" style="margin:0">Se scrivi i minuti in un passo (es. «cuoci 20 minuti») la cucina guidata ti dà il timer.</p>
    <button type="button" class="btn pieno" data-a="ric-mia-salva">Salva la ricetta</button>
    ${nuova ? '' : '<button type="button" class="btn chiaro" data-a="ric-mia-elimina">Elimina la ricetta</button>'}</section>
    <p class="piccolo tenue" style="margin:0">Le tue ricette restano su questo telefono.</p>`;
  return h + '</main>';
}
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.ricerca) { UI.ric.q = el.value; ridisegnaElenco(); }
  if (el.dataset && el.dataset.ricnota) { const n = noteRic(), v = el.value.slice(0, 1000).trim(); if (v) n[el.dataset.ricnota] = v; else delete n[el.dataset.ricnota]; scriviRic('pit-ric-note', n); }
  if (el.dataset && el.dataset.ric && UI.ricBozza) {
    const k = el.dataset.ric, b = UI.ricBozza;
    b[k] = k === 'ingredienti' || k === 'passi' ? el.value.split('\n') : k === 'porzioni' ? Number(el.value) || '' : k === 'minuti' ? Number(el.value) || '' : el.value;
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'ric-voce-scelta') { try { localStorage.setItem('pit-voce', el.value); } catch (er) { /* niente */ } if (typeof motoreLocale === 'function' && motoreLocale(el.value) && statoVoceLocale(el.value) !== true) { mostraToast('La scarico adesso sul telefono: tra poco legge con questa voce.'); A['ric-voce-scarica'](); } else if (typeof parlaAI === 'function') parlaAI('Ciao, sono la tua nuova voce. Ti leggo i passi così.'); }
  if (el.id === 'ric-copia-file' && el.files[0]) { riprendiCopia(el.files[0]); el.value = ''; return; }
  if (el.dataset && el.dataset.ric === 'categoria' && UI.ricBozza) UI.ricBozza.categoria = el.value;
  if (el.id !== 'ric-foto-file' || !el.files[0] || !UI.ricBozza) return;
  const f = el.files[0], img = new Image(), url = URL.createObjectURL(f);
  img.onload = () => {
    const k = Math.min(1, 800 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    UI.ricBozza.foto = c.toDataURL('image/jpeg', .75); render();
  };
  img.onerror = () => { URL.revokeObjectURL(url); mostraToast('Questa foto non si apre: prova con un\'altra.'); };
  img.src = url;
});
/* scrivendo nella ricerca ridisegno solo l'elenco: la tastiera resta aperta */
function ridisegnaElenco() {
  const el = document.getElementById('ric-cerca'), pos = el ? el.selectionStart : 0;
  render();
  const n = document.getElementById('ric-cerca');
  if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* type=search su alcuni telefoni */ } }
}
document.addEventListener('submit', e => {
  if (!e.target.dataset || !e.target.dataset.ricCerca) return;
  e.preventDefault();
  const q = (UI.ric.q || '').trim();
  const link = /ricette\.giallozafferano\.it\/([\w%-]+)\.html/.exec(q);   // incollato un link di GialloZafferano: si apre qui dentro
  if (link) { UI.ric.q = ''; vai('ricetta:gz:' + link[1]); return; }
  if (q.length >= 2) A['ric-cerca-gz']();
});

/* schermo sempre acceso mentre si cucina (Wake Lock: Chrome su Android sì, alcuni telefoni no → nessun errore) */
async function tieniAcceso(si) {
  try {
    if (si && !RIC.wake && navigator.wakeLock && document.visibilityState === 'visible') { RIC.wake = await navigator.wakeLock.request('screen'); RIC.wake.addEventListener('release', () => { RIC.wake = null; }); }
    if (!si && RIC.wake) { await RIC.wake.release(); RIC.wake = null; }
  } catch (e) { RIC.wake = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && /^cucina:/.test(UI.vista)) tieniAcceso(true); });
function fermaTimer(x) {
  (x ? [x] : RIC.timers.slice()).forEach(y => { clearTimeout(y.t); RIC.timers = RIC.timers.filter(z => z !== y); });
  if (!RIC.timers.length) { clearInterval(RIC.tick); RIC.tick = null; }
  barraTimer();
}
function avviaTimer(id, nome, passo, min, libero) {
  const x = { n: Date.now() + Math.random(), id, nome, passo, libero: !!libero, min, fine: Date.now() + min * 60000 };
  x.t = setTimeout(() => { fermaTimer(x); suonaTimer(`Il timer di ${durataRic(min)} è finito: ${nome}, passo ${passo + 1}.`); if (/^cucina:/.test(UI.vista)) render(); }, min * 60000);
  RIC.timers.push(x);
  if (!RIC.tick) RIC.tick = setInterval(() => { if (/^cucina:/.test(UI.vista) && !document.querySelector('.foglio') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') render(); barraTimer(); }, 1000);
  barraTimer();
}
/* fuori dalla cucina guidata i timer accesi restano in vista: barretta in alto, un tocco riporta alla ricetta */
function barraTimer() {
  let b = document.getElementById('ric-barra-timer');
  const tt = RIC.timers.slice().sort((a, c) => a.fine - c.fine);
  if (!tt.length || /^cucina:/.test(UI.vista)) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = 'ric-barra-timer'; b.className = 'ric-barra-timer'; b.addEventListener('click', () => { const x = RIC.timers.slice().sort((a, c) => a.fine - c.fine)[0]; if (x) { UI.cucina = { id: x.id, passo: x.passo, voce: false }; vai('cucina:' + x.id); } barraTimer(); }); document.body.appendChild(b); }
  b.textContent = '⏱ ' + tt.map(x => `${x.nome.slice(0, 22)} ${mmssRic(restaTimer(x))}`).join(' · ');
}
function suonaTimer(testo) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.5, 1, 1.5, 2].forEach(s => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; g.gain.value = 0.3; o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + s); o.stop(ctx.currentTime + s + 0.3); });
  } catch (e) { /* senza audio: restano vibrazione e avviso */ }
  if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 800]);
  if (document.visibilityState !== 'visible' && navigator.serviceWorker && window.Notification && Notification.permission === 'granted')
    navigator.serviceWorker.ready.then(reg => reg.showNotification('⏱ Timer finito', { body: testo, tag: 'pit-timer', renotify: true, vibrate: [400, 200, 400] })).catch(() => {});
  if (typeof parlaAI === 'function') parlaAI(testo);
}

Object.assign(A, {
  'ric-riprova'() { RIC.stato = 'no'; render(); },
  'ric-riapri'(el) { delete RIC.errore[el.dataset.v]; render(); },
  'ric-zona'(el) { UI.ric.zona = el.dataset.v; salvaFiltri(); render(); },
  'ric-cat'(el) { UI.ric.cat = el.dataset.v; salvaFiltri(); render(); },
  'ric-tempo'(el) { const v = Number(el.dataset.v); UI.ric.tempo = UI.ric.tempo === v ? 0 : v; salvaFiltri(); render(); },
  'ric-facile'() { UI.ric.facile = !UI.ric.facile; salvaFiltri(); render(); },
  'ric-piu'() { UI.ric.piu = !UI.ric.piu; salvaFiltri(); render(); },
  'ric-ordine'(el) { UI.ric.ordine = el.dataset.v; salvaFiltri(); render(); },
  'ric-pulisci'() { UI.ric = filtriVuoti(); salvaFiltri(); render(); },
  'ric-chiudi-cerca'() { RIC.cerca = { q: '', stato: '', risultati: [] }; UI.ric.q = ''; render(); },   // chiude e pulisce anche la casella
  'ric-esplora'(el) { UI.ric.q = ''; A['ric-cerca-gz'](el.dataset.v); },
  'ric-zoom'(el) {
    const tutte = [...document.querySelectorAll('[data-a="ric-zoom"]')].map(i => i.dataset.v), i0 = Math.max(0, tutte.indexOf(el.dataset.v));
    const v = document.createElement('div'); v.className = 'ric-zoom'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Foto ingrandita');
    let i = i0;
    const mostra = () => { v.innerHTML = `<img src="${esc(tutte[i])}" alt="" referrerpolicy="no-referrer"><span class="ric-zoom-n">${i + 1} / ${tutte.length}</span>
      <button type="button" class="ric-zoom-x" aria-label="Chiudi">✕</button>${i > 0 ? '<button type="button" class="ric-zoom-p" aria-label="Foto prima">‹</button>' : ''}${i < tutte.length - 1 ? '<button type="button" class="ric-zoom-s" aria-label="Foto dopo">›</button>' : ''}`; };
    let x0 = null;
    v.addEventListener('click', e => { e.stopPropagation(); const t = e.target.className; if (t === 'ric-zoom-p') { i--; mostra(); } else if (t === 'ric-zoom-s') { i++; mostra(); } else if (t === 'ric-zoom-x' || t === 'ric-zoom') v.remove(); });
    v.addEventListener('touchstart', e => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    v.addEventListener('touchend', e => { if (x0 == null || (window.visualViewport && visualViewport.scale > 1.05)) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) { const n = i + (dx < 0 ? 1 : -1); if (n >= 0 && n < tutte.length) { i = n; mostra(); } } });
    mostra(); document.body.appendChild(v);
  },
  'ric-dico'() {   // detti il piatto o gli ingredienti: si cerca su tutto GialloZafferano
    if (AI.rec) { AI.rec.stop(); return; }
    ascoltaAI(detto => { const q = String(detto || '').replace(/[.!?]+$/, '').trim(); UI.ric.q = q; if (q.length >= 2) A['ric-cerca-gz'](q); else render(); }, {});
    mostraToast('Ti ascolto: di\' il piatto o gli ingredienti.'); render();
  },
  'ric-menu'(el) {   // dalla ricetta un piatto nuovo: nome e portata già scritti, Monica sceglie come lo vende e il prezzo
    const r = ricetta(el.dataset.v); if (!r) return;
    vai('nuovo');
    Object.assign(UI.nuovo, { nome: r.nome.replace(/\s*\(.*\)$/, '').slice(0, 60), cat: { antipasti: 'stuzzichini', primi: 'primi', dolci: 'dolci' }[r.categoria] || '', ricetta: r.id });
    render(); mostraToast('Controlla il nome e tocca Avanti.');
  },
  'ric-dado'() { UI.dado = (UI.dado || 0) + 1; render(); },
  'ric-scarica-cerca'() { const c = RIC.cerca; scaricaTante(c.risultati.map(r => r.id), c.cat ? c.q : '«' + c.q + '»'); },
  'ric-scarica-elenco'() { scaricaTante(preferiteRic().concat(elencoRic().map(r => r.id)), 'tutto l\'elenco'); },
  'ric-scarica-stop'() { if (RIC.scarico) RIC.scarico.stop = true; },
  'ric-auto'(el) { scriviRic('pit-ric-auto', el.checked); mostraToast(el.checked ? 'Ogni giorno, col Wi-Fi, scarico le nuove.' : 'Aggiornamento automatico spento.'); },
  'ric-scarica-via'() {
    if (!confirm('Tolgo dal telefono le ricette scaricate? Preferite e ricette tue restano.')) return;
    dbRic('readwrite', st => st.clear()).catch(() => {}); RIC.scaricate = {};
    caches.delete('gz-foto').catch(() => {}); mostraToast('Ricette scaricate tolte.'); render();
  },
  'ric-copia-salva'() {
    const d = new Date(), giorno = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const copia = { tipo: 'pronti-ricettario', versione: 1, data: d.toISOString(), mie: mieRic(), note: noteRic(), preferite: preferiteRic() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(copia)], { type: 'application/json' }));
    a.download = `ricettario-${giorno}.json`; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    mostraToast(`💾 Copia salvata nei Download: ${copia.mie.length} ricette tue, ${Object.keys(copia.note).length} note, ${copia.preferite.length} preferite.`);
  },
  'ric-catalogo'(el) {
    if (UI.vista !== 'ricettario') UI.vista = 'ricettario';
    const k = el.dataset.v, nome = k === 'db' ? 'Archivio automatico' : k === 'nuove' ? 'Ricette nuove' : (CATALOGO_RIC.find(x => x[0] === k) || CATALOGO_ING.find(x => 'ricette-con-' + x[0] === k) || [, k])[1];
    A['ric-cerca-gz'](nome, k);
  },
  'ric-aggiungi'(el) {
    const id = el.dataset.v, r = ricetta(id), v = voceElenco(id) || {};
    if (!r) return;
    const zona = /sard|gallur/i.test([r.categoria, r.nome, v.zona].join(' ')) ? 'sarda' : 'italiana';
    const cat = (CAT_RIC.find(([k, t]) => k && new RegExp(t.slice(0, 5), 'i').test(r.categoria || '')) || [''])[0];
    const prima = RIC.scelte.slice(), nuova = { id, nome: r.nome, zona, categoria: cat, foto: r.foto || v.foto || '', aggiunta: Date.now() };
    salvaScelte([nuova].concat(RIC.scelte.filter(x => x.id !== id))); render();   // subito sul telefono, poi sul server
    RIC.chiedi({ db: 'aggiungi', r: nuova })
      .then(j => { salvaScelte(j.scelte); mostraToast(`➕ «${r.nome}» è nel tuo ricettario. Preparo la voce dei passi…`); codaVoci(r); })
      .catch(e => { salvaScelte(prima); mostraToast('Non aggiunta: ' + (e.message || e)); })
      .finally(() => render());
  },
  'ric-togli'(el) {
    const id = el.dataset.v, prima = RIC.scelte.slice();
    salvaScelte(RIC.scelte.filter(x => x.id !== id)); render();
    RIC.chiedi({ db: 'togli', id }).then(j => { salvaScelte(j.scelte); mostraToast('Tolta dal tuo ricettario.', () => A['ric-aggiungi']({ dataset: { v: id } })); })
      .catch(e => { salvaScelte(prima); mostraToast('Non tolta: ' + (e.message || e)); }).finally(() => render());
  },
  'ric-db-turbo'() {   // Mario 08/11 «cercane 100 ricette miste con priorità sarde e caricale»: lo fa il server da solo, anche a telefono chiuso
    if (RIC.db && RIC.db.turbo && RIC.db.turbo.attivo) return;
    RIC.chiedi({ db: 'turbo', n: 100 }).then(j => { if (j && j.turbo) { RIC.db = Object.assign({}, RIC.db, { turbo: j.turbo }); mostraToast('⚡ Parto: carico 100 ricette complete, sarde per prime. Ci vuole circa mezz\'ora; puoi chiudere l\'app.'); } else mostraToast('Non riuscito: ' + ((j && j.errore) || 'riprova tra poco')); })
      .catch(e => mostraToast('Non riuscito: ' + (e.message || e))).finally(() => { RIC.dbOra = 0; render(); });
  },
  'ric-db-cerca'() {
    if (RIC.dbCerco) return; RIC.dbCerco = true; render();
    RIC.chiedi({ db: 'cerca' }).then(j => { RIC.db = j.db; RIC.dbOra = Date.now(); RIC.dbUltime = null; mostraToast(j.nuove ? `🔄 Trovate ${j.nuove} ricette nuove.` : '🔄 Giro fatto: niente di nuovo in questa pagina, riprova.'); })
      .catch(e => mostraToast('Non riuscito: ' + (e.message || e)))
      .finally(() => { RIC.dbCerco = false; RIC.dbOra = 0; render(); });
  },
  'ricdb-tutte'(el) { UI.ricDbTutte = el.dataset.v; render(); },
  'ricdb-voci'() { const da = Object.values(RIC.scaricate).filter(r => !RIC.vociFatte[r.id]); da.forEach(codaVoci); mostraToast(`🔊 Preparo la voce di ${da.length} ricette: ci vuole qualche minuto, intanto puoi fare altro.`); },
  'ric-db-pausa'() {
    const d = RIC.db; if (!d || d.errore) return;
    RIC.chiedi({ db: d.pausa ? 'riprendi' : 'pausa' })
      .then(j => { RIC.db = j.db; RIC.dbOra = Date.now(); mostraToast(j.db.pausa ? '⏸ Il database non cresce più finché non tocchi «Riprendi».' : '▶️ Il database ricomincia a crescere da solo.'); })
      .catch(e => mostraToast('Non riuscito: ' + (e.message || e)))
      .finally(() => { if (UI.vista === 'ricettario') render(); });
  },
  'ric-altre'() {
    const c = RIC.cerca; if (!c.prossima || c.altre === 'carico') return;
    c.altre = 'carico'; render();
    RIC.chiedi(c.cat ? corpoCat(c.cat, c.q, c.prossima) : { cerca: c.q, pagina: c.prossima })
      .then(j => {
        if (RIC.cerca !== c) return;
        const nuove = (j.ricette || []).map(daCerca).filter(x => !c.risultati.some(y => y.id === x.id));
        c.risultati = c.risultati.concat(nuove); c.prossima = nuove.length ? j.prossima || '' : ''; c.altre = '';
      })
      .catch(() => { if (RIC.cerca === c) c.altre = 'errore'; })
      .finally(() => { if (UI.vista === 'ricettario') render(); });
  },
  'ric-cerca-gz'(tema, cat) {
    const q = (typeof tema === 'string' ? tema : UI.ric.q || '').replace(/\s*[,;]+\s*/g, ' ').replace(/\s+/g, ' ').trim(); if (q.length < 2) return;   // «zucchine, uova» = due parole
    if (typeof cat !== 'string') cat = '';
    RIC.cerca = { q, cat, stato: 'carico', risultati: [], prossima: '' }; render();
    const ris = document.getElementById('ric-risultati'); if (ris) ris.scrollIntoView({ block: 'start' });
    RIC.chiedi(cat ? corpoCat(cat, q) : { cerca: q })
      .then(j => { if (RIC.cerca.q !== q) return; RIC.cerca.stato = 'ok'; RIC.cerca.risultati = (j.ricette || []).map(daCerca); RIC.cerca.prossima = j.prossima || ''; })
      .catch(e => { RIC.cerca.stato = 'errore'; RIC.cerca.errore = navigator.onLine === false ? 'Senza rete non posso cercare: riprova quando torna.' : 'Ricerca non riuscita: ' + (e.message || e); })
      .finally(() => { if (UI.vista === 'ricettario') render(); });
  },
  'ric-pref'(el) {
    const id = el.dataset.v, p = preferiteRic(), i = p.indexOf(id);
    if (i < 0) p.push(id); else p.splice(i, 1);
    scriviRic('pit-ric-pref', p);
    mostraToast(i < 0 ? 'Fra le preferite: la trovi anche senza rete.' : 'Tolta dalle preferite.');
    render();
  },
  'ric-porz'(el) {
    const id = UI.vista.split(':').slice(1).join(':'), r = ricetta(id); if (!r) return;
    UI.ricPorz = UI.ricPorz || {};
    UI.ricPorz[id] = Math.min(60, Math.max(1, ((UI.ricPorz[id] || r.porzioni) + Number(el.dataset.v))));
    render();
  },
  'ric-spunta'(el) {
    const id = UI.vista.split(':').slice(1).join(':');
    UI.ricSpunte = UI.ricSpunte || {}; UI.ricSpunte[id] = UI.ricSpunte[id] || {};
    UI.ricSpunte[id][el.dataset.v] = el.checked;
  },
  'ric-spesa'(el) {
    const r = ricetta(el.dataset.v); if (!r || typeof aggiungiVoce !== 'function') return;
    const porz = (UI.ricPorz && UI.ricPorz[r.id]) || r.porzioni, spunte = (UI.ricSpunte && UI.ricSpunte[r.id]) || {};
    const prima = JSON.stringify(SPESA.mia);
    let n = 0;
    r.ingredienti.forEach((i, k) => {
      if (spunte[k]) return;   // spuntato = ce l'ho già
      const q = i.q == null ? '' : qRic(i.q, r.porzioni, porz).replace('½', '.5') + (i.u ? ' ' + i.u : '');
      if (aggiungiVoce(q && /^(g|kg|ml|l)$/.test(i.u) ? `${i.nome} ${q}` : i.nome)) n++;
    });
    mostraToast(n ? `${n} ingredienti nella lista della spesa (quelli spuntati no: li hai già).` : 'Niente da aggiungere: hai spuntato tutto, o c\'erano già.',
      n ? () => { SPESA.mia = JSON.parse(prima); salvaSpesa(); render(); } : null);
  },
  'ric-passo'(el) {
    const c = UI.cucina, r = c && ricetta(c.id); if (!r) return;
    c.passo = Math.min(r.passi.length - 1, Math.max(0, c.passo + Number(el.dataset.v)));
    render(); window.scrollTo(0, 0); leggiPasso();
  },
  'ric-play'(el) { const id = el.dataset.v; const c = UI.cucina && UI.cucina.id === id ? UI.cucina : (UI.cucina = { id, passo: 0, voce: true }); c.voce = true; c.leggi = true; vai('cucina:' + id); },   // ▶️: entra in cucina e legge subito (anche tornando)
  'ric-voce-scarica'() {
    const k = sceltaVoce(), M = typeof motoreLocale === 'function' && motoreLocale(k); if (!M || (RIC.scaricoVoce && RIC.scaricoVoce.k === k)) return;
    RIC.scaricoVoce = { k, p: 0 };
    const mostra = () => { const b = document.querySelector('.ric-voce-stato b'), pr = document.querySelector('.ric-voce-stato progress'); if (b && pr) { b.textContent = Math.round(RIC.scaricoVoce.p * 100) + '%'; pr.value = Math.round(RIC.scaricoVoce.p * 100); } else if (/^cucina:/.test(UI.vista)) render(); };
    render();
    M.scarica(k, p => { if (RIC.scaricoVoce) { RIC.scaricoVoce.p = p; mostra(); } })
      .then(() => { AI.localiPronte[k] = true; RIC.scaricoVoce = null; mostraToast('✅ Voce scaricata: da ora parla anche senza rete.'); if (/^cucina:/.test(UI.vista)) { render(); leggiPasso(); } })
      .catch(e => { RIC.scaricoVoce = null; AI.localiPronte[k] = false; mostraToast('Non riesco a scaricare la voce (' + (e && e.message ? e.message : 'rete') + '). Riprova col Wi-Fi.'); if (/^cucina:/.test(UI.vista)) render(); });
  },
  'ric-ripeti'() { if (UI.cucina) { const v = UI.cucina.voce; UI.cucina.voce = true; leggiPasso(); UI.cucina.voce = v; } },
  'ric-mani'(el) { const c = UI.cucina; if (!c) return; c.mani = el.checked; if (c.mani) { c.voce = true; leggiPasso(); } else fermaAscolto(); render(); },
  'ric-voce'(el) { if (UI.cucina) { UI.cucina.voce = el.checked; if (!el.checked && typeof fermaVoce === 'function') fermaVoce(); if (!el.checked && window.speechSynthesis) speechSynthesis.cancel(); } },
  'ric-timer'(el) {
    const c = UI.cucina, r = c && ricetta(c.id); if (!r) return;
    const mio = timerDi(c.id, c.passo);
    if (mio) { fermaTimer(mio); render(); return; }
    avviaTimer(c.id, r.nome, c.passo, Number(el.dataset.v));
    render();
  },
  'ric-altro'() { UI.ricAltro = !UI.ricAltro; render(); },
  'ric-timer-via'(el) { const x = RIC.timers.find(y => String(y.n) === el.dataset.v); if (x) fermaTimer(x); render(); },
  'ric-timer-libero'(el) {
    const c = UI.cucina, r = c && ricetta(c.id); if (!r) return;
    const min = Math.min(600, Math.max(1, Number(el.dataset.v) || 10));
    UI.ricAltro = false; avviaTimer(c.id, r.nome, c.passo, min, true); mostraToast(`Timer di ${durataRic(min)} partito.`); render();
  },
  'ric-fine'() { fermaAscolto(); if (UI.cucina) UI.cucina.mani = false; RIC.timers.filter(x => x.id === (UI.cucina && UI.cucina.id)).forEach(x => fermaTimer(x)); if (!RIC.timers.length) tieniAcceso(false); const id = UI.cucina && UI.cucina.id; UI.cucina = null; mostraToast('Buon appetito! 🍝'); vai('ricetta:' + id); },
  'ric-mia-via-foto'() { if (UI.ricBozza) { UI.ricBozza.foto = ''; render(); } },
  'ric-mia-salva'() {
    const b = UI.ricBozza; if (!b) return;
    const pulito = a => (a || []).map(x => String(x).trim()).filter(Boolean);
    const m = { id: b.id === 'nuova' ? 'mia:' + Date.now().toString(36) : b.id, nome: String(b.nome || '').trim().slice(0, 80), porzioni: Math.min(60, Math.max(1, Number(b.porzioni) || 4)),
      minuti: Math.min(1440, Math.max(0, Number(b.minuti) || 0)), categoria: b.categoria || '', ingredienti: pulito(b.ingredienti).slice(0, 60), passi: pulito(b.passi).slice(0, 60),
      note: String(b.note || '').trim().slice(0, 2000), foto: b.foto || '', agg: Date.now() };
    if (!m.nome) { mostraToast('Scrivi il nome del piatto.'); return; }
    if (!m.ingredienti.length && !m.passi.length) { mostraToast('Scrivi almeno gli ingredienti o i passi.'); return; }
    const tutte = mieRic(), prima = JSON.stringify(tutte), i = tutte.findIndex(x => x.id === m.id);
    if (i < 0) tutte.unshift(m); else tutte[i] = m;
    if (!scriviRic('pit-ric-mie', tutte)) { mostraToast('Il telefono è pieno: togli la foto e riprova.'); return; }
    UI.ricBozza = null; mandaMia(m);
    mostraToast('Ricetta salvata: la vede anche Monica.', () => { scriviRic('pit-ric-mie', JSON.parse(prima)); const v = JSON.parse(prima).find(x => x.id === m.id); if (v) { v.agg = Date.now(); mandaMia(v); } else togliMiaServer(m.id); vai('ricettario'); });
    vai('ricetta:' + m.id);
  },
  'ric-mia-elimina'() {
    const b = UI.ricBozza; if (!b || !confirm(`Elimino la ricetta «${b.nome}»?`)) return;
    const tutte = mieRic(), prima = JSON.stringify(tutte);
    scriviRic('pit-ric-mie', tutte.filter(x => x.id !== b.id)); togliMiaServer(b.id);
    scriviRic('pit-ric-pref', preferiteRic().filter(x => x !== b.id));
    UI.ricBozza = null;
    mostraToast('Ricetta eliminata.', () => { const tt = JSON.parse(prima); scriviRic('pit-ric-mie', tt); scriviRic('pit-ric-mie-tolte', mieTolte().filter(x => x !== b.id)); const v = tt.find(x => x.id === b.id); if (v) { v.agg = Date.now(); mandaMia(v); } render(); });
    vai('ricettario');
  }
});
