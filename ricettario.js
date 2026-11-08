/* Ricettario di Monica (C55, docs/SPEC-RICETTARIO.md): solo per chi gestisce.
   Le ricette (ricette.js) si scaricano solo quando Monica o Mario aprono il ricettario: i clienti non le scaricano mai.
   Viste: 'ricettario' (elenco), 'ricetta:<id>' (scheda), 'cucina:<id>' (cucina guidata, un passo per schermata). */
const RIC = { stato: typeof RICETTE !== 'undefined' ? 'pronto' : 'no', wake: null, timer: null, fine: 0, tick: null };
const ZONE_RIC = [['tutte', 'Tutte'], ['gallura', 'Gallura'], ['sarda', 'Sarde'], ['italiana', 'Italiane']];
const CAT_RIC = [['', 'Tutto'], ['antipasti', 'Antipasti'], ['primi', 'Primi'], ['secondi', 'Secondi'], ['contorni', 'Contorni'], ['dolci', 'Dolci'], ['pane', 'Pane']];
/* disegni dei passi: figure semplici, stesso tratto delle icone dell'app */
const DISEGNI_RIC = {
  pentola: '<path d="M4 10h16v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><path d="M2 10h20M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2"/>',
  padella: '<circle cx="10" cy="13" r="6"/><path d="M16 13h6"/>',
  forno: '<rect x="3" y="4" width="18" height="16" rx="2"/><rect x="6" y="9" width="12" height="8" rx="1"/><path d="M7 6.5h1M11 6.5h1"/>',
  teglia: '<rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 12h12"/>',
  mestolo: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-9"/>',
  coltello: '<path d="M3 21l10-10 3 3-10 10z"/><path d="M13 11l7-7a2 2 0 0 1 0 3l-4 7"/>',
  impastare: '<path d="M4 14c0-4 4-7 8-7s8 3 8 7-4 5-8 5-8-1-8-5z"/><path d="M9 12c1 1 5 1 6 0"/>',
  ciotola: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-2 2-2 2-4M14 7c0-2 2-2 2-4"/>',
  mattarello: '<rect x="5" y="9" width="14" height="6" rx="3"/><path d="M2 12h3M19 12h3"/>',
  friggere: '<circle cx="10" cy="13" r="6"/><path d="M16 13h6M7 12h0M10 15h0M12 11h0"/>'
};
const disegnoRic = n => DISEGNI_RIC[n] ? `<svg class="ric-disegno" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DISEGNI_RIC[n]}</svg>` : '';

function caricaRicette() {
  if (RIC.stato === 'pronto' || RIC.stato === 'carico') return;
  RIC.stato = 'carico';
  const s = document.createElement('script');
  s.src = 'ricette.js';
  s.onload = () => { RIC.stato = typeof RICETTE !== 'undefined' ? 'pronto' : 'errore'; render(); };
  s.onerror = () => { RIC.stato = 'errore'; s.remove(); render(); };
  document.head.appendChild(s);
}
const preferiteRic = () => { try { return JSON.parse(localStorage.getItem('pit-ric-pref')) || []; } catch (e) { return []; } };
const ricetta = id => (typeof RICETTE !== 'undefined' ? RICETTE : []).find(r => r.id === id);
const minutiRic = r => (r.prep || 0) + (r.cottura || 0);
const durataRic = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`;
const senzaAccenti = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
/* quantità per le porzioni scelte: arrotondate in modo da leggersi bene */
function qRic(q, base, porz) {
  if (q == null) return '';
  const x = q * porz / base;
  if (x >= 100) return String(Math.round(x / 10) * 10);
  if (x >= 10) return String(Math.round(x));
  const m = Math.round(x * 2) / 2;
  return m === 0 ? '½' : String(m).replace('.5', '½').replace(/^0½$/, '½');
}
const rigaIng = (i, base, porz) => i.q == null ? `${esc(i.nome)}${i.nota ? ` <small>(${esc(i.nota)})</small>` : ''}` : `<b>${qRic(i.q, base, porz)}${i.u ? ' ' + esc(i.u) : ''}</b> ${esc(i.nome)}${i.nota ? ` <small>(${esc(i.nota)})</small>` : ''}`;

function attesaRic(titolo) {
  caricaRicette();
  return testataMonica(titolo, 'home') + `<main class="corpo"><section class="scheda">${RIC.stato === 'errore'
    ? '<p style="margin:0"><b>Non riesco ad aprire il ricettario.</b> Controlla la rete e riprova.</p><button type="button" class="btn pieno" data-a="ric-riprova">Riprova</button>'
    : '<p class="tenue" style="margin:0">Apro il ricettario…</p>'}</section></main>`;
}

function vRicettario() {
  if (RIC.stato !== 'pronto') return attesaRic('Ricettario');
  const f = UI.ric || (UI.ric = { q: '', zona: 'tutte', cat: '', rapide: false });
  const pref = preferiteRic(), q = senzaAccenti(f.q).trim();
  let rr = RICETTE.filter(r => (f.zona === 'tutte' || (f.zona === 'sarda' ? r.zona !== 'italiana' : r.zona === f.zona))
    && (!f.cat || r.categoria === f.cat) && (!f.rapide || minutiRic(r) <= 30)
    && (!q || senzaAccenti(r.nome + ' ' + r.regione + ' ' + r.ingredienti.map(i => i.nome).join(' ')).includes(q)));
  rr = rr.sort((a, b) => (pref.includes(b.id) - pref.includes(a.id)) || a.nome.localeCompare(b.nome, 'it'));
  let h = testataMonica('Ricettario', 'home') + '<main class="corpo">';
  h += `<div><h1>Ricettario</h1><p class="tenue" style="margin:4px 0 0">${RICETTE.length} ricette spiegate passo passo. Le vedete solo tu e Mario.</p></div>
    <input class="campo" id="ric-cerca" type="search" data-ricerca="1" value="${esc(f.q)}" placeholder="Cerca: nome o ingrediente (es. patate)" autocomplete="off">
    <div class="scelte" role="group" aria-label="Da dove">${ZONE_RIC.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-zona" data-v="${k}" aria-pressed="${f.zona === k}">${t}</button>`).join('')}</div>
    <div class="scelte" role="group" aria-label="Portata">${CAT_RIC.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-cat" data-v="${k}" aria-pressed="${f.cat === k}">${t}</button>`).join('')}
      <button type="button" class="scelta" data-a="ric-rapide" aria-pressed="${f.rapide}">Entro 30 min</button></div>`;
  h += rr.length ? `<div class="ric-elenco">${rr.map(r => `<button type="button" class="ric-carta" data-a="vai" data-v="ricetta:${r.id}">
      ${r.foto ? `<img src="${esc(r.foto.file)}" alt="" loading="lazy">` : `<span class="ric-senzafoto">${disegnoRic((r.passi.find(p => p.disegno) || {}).disegno)}</span>`}
      <span class="ric-testo"><b>${pref.includes(r.id) ? '⭐ ' : ''}${esc(r.nome)}</b><small>${esc(r.regione)} · ${durataRic(minutiRic(r))} · ${'●'.repeat(r.difficolta)}${'○'.repeat(3 - r.difficolta)}</small></span></button>`).join('')}</div>`
    : '<section class="scheda"><p style="margin:0">Nessuna ricetta trovata. Prova con meno parole o togli un filtro.</p><button type="button" class="btn chiaro" data-a="ric-pulisci">Mostra tutte</button></section>';
  return h + '</main>';
}

function vRicetta(id) {
  if (RIC.stato !== 'pronto') return attesaRic('Ricetta');
  const r = ricetta(id);
  if (!r) { UI.vista = 'ricettario'; return vRicettario(); }
  const porz = (UI.ricPorz && UI.ricPorz[id]) || r.porzioni, spunte = (UI.ricSpunte && UI.ricSpunte[id]) || {}, pref = preferiteRic().includes(id);
  let h = testataMonica(r.nome, 'ricettario') + '<main class="corpo">';
  if (r.foto) h += `<figure class="ric-foto"><img src="${esc(r.foto.file)}" alt="${esc(r.nome)}"><figcaption>Foto: <a href="${esc(r.foto.link)}" target="_blank" rel="noopener">${esc(r.foto.autore)}</a> · ${esc(r.foto.licenza)}</figcaption></figure>`;
  h += `<div><h1>${esc(r.nome)}</h1><p class="tenue" style="margin:4px 0 0">${esc(r.regione)} · Preparazione ${durataRic(r.prep)} · Cottura ${durataRic(r.cottura)} · Difficoltà ${['', 'facile', 'media', 'impegnativa'][r.difficolta]}</p></div>
    <p style="margin:0">${esc(r.intro)}</p>
    <div class="fila"><button type="button" class="btn pieno" data-a="vai" data-v="cucina:${id}">${disegnoRic('pentola')}Cucina guidata</button>
      <button type="button" class="btn chiaro" data-a="ric-pref" data-v="${id}" aria-pressed="${pref}">${pref ? '⭐ Preferita' : '☆ Preferita'}</button></div>
    <section class="scheda"><header class="fila"><h2 style="flex:1">Ingredienti</h2></header>
      <div class="fila ric-porz"><span>Per <b>${porz}</b> ${porz === 1 ? 'persona' : 'persone'}</span>
        <button type="button" class="btn chiaro piccolo" data-a="ric-porz" data-v="-1" aria-label="Una persona in meno" ${porz <= 1 ? 'disabled' : ''}>−</button>
        <button type="button" class="btn chiaro piccolo" data-a="ric-porz" data-v="1" aria-label="Una persona in più" ${porz >= 60 ? 'disabled' : ''}>+</button></div>
      <ul class="ric-ing">${r.ingredienti.map((i, k) => `<li><label><input type="checkbox" data-a="ric-spunta" data-v="${k}" ${spunte[k] ? 'checked' : ''}><span>${rigaIng(i, r.porzioni, porz)}</span></label></li>`).join('')}</ul>
      <button type="button" class="btn chiaro pieno" data-a="ric-spesa" data-v="${id}">${ico('carrello')}Metti nella lista della spesa</button></section>
    <section class="scheda"><h2>Passo passo</h2><ol class="ric-passi">${r.passi.map(p => `<li>${disegnoRic(p.disegno)}<span>${esc(p.t)}</span></li>`).join('')}</ol></section>`;
  if (r.consigli && r.consigli.length) h += `<section class="scheda"><h2>Consigli</h2><ul style="margin:0;padding-left:18px">${r.consigli.map(c => `<li>${esc(c)}</li>`).join('')}</ul></section>`;
  h += `<section class="scheda"><h2>Conservare e allergeni</h2><p style="margin:0">${esc(r.conserva || '')}</p>
    <p class="piccolo" style="margin:0"><b>Allergeni:</b> ${esc((r.allergeni || []).join(', ') || 'nessuno indicato')}. Controlla sempre le etichette dei prodotti che usi.</p></section>`;
  return h + '</main>';
}

/* cucina guidata: schermo acceso, voce, timer. Un passo alla volta, tasti grandi */
function vCucina(id) {
  if (RIC.stato !== 'pronto') return attesaRic('Cucina guidata');
  const r = ricetta(id);
  if (!r) { UI.vista = 'ricettario'; return vRicettario(); }
  const c = UI.cucina && UI.cucina.id === id ? UI.cucina : (UI.cucina = { id, passo: 0, voce: true });
  tieniAcceso(true);
  const i = c.passo, p = r.passi[i], ultimo = i === r.passi.length - 1;
  const resta = RIC.timer ? Math.max(0, Math.ceil((RIC.fine - Date.now()) / 1000)) : 0;
  let h = testataMonica('Cucina guidata', 'ricetta:' + id) + '<main class="corpo ric-cucina">';
  h += `<p class="tenue" style="margin:0">${esc(r.nome)} · passo <b>${i + 1}</b> di ${r.passi.length}</p>
    <div class="punti ric-punti">${r.passi.map((_, j) => `<i class="${j === i ? 'on' : j < i ? 'fatto' : ''}"></i>`).join('')}</div>
    <section class="scheda ric-passo">${disegnoRic(p.disegno)}<p>${esc(p.t)}</p>
      ${p.min ? `<button type="button" class="btn ${RIC.timer && RIC.timer.passo === i ? 'chiaro' : 'pieno'}" data-a="ric-timer" data-v="${p.min}">⏱ ${RIC.timer && RIC.timer.passo === i ? `Mancano ${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')} · Ferma` : `Timer ${p.min} minuti`}</button>` : ''}</section>
    ${RIC.timer && RIC.timer.passo !== i ? `<p class="avviso piccolo" style="margin:0">⏱ Timer del passo ${RIC.timer.passo + 1}: mancano ${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')}</p>` : ''}
    <div class="ric-tasti">
      <button type="button" class="btn chiaro" data-a="ric-passo" data-v="-1" ${i === 0 ? 'disabled' : ''}>${ico('indietro')}Indietro</button>
      <button type="button" class="btn chiaro" data-a="ric-ripeti">🔊 Ripeti</button>
      ${ultimo ? `<button type="button" class="btn pieno" data-a="ric-fine">Finito!</button>` : `<button type="button" class="btn pieno" data-a="ric-passo" data-v="1">Avanti</button>`}</div>
    <label class="interr"><span>Leggi i passi ad alta voce<small>La voce legge ogni passo quando lo apri.</small></span><input type="checkbox" data-a="ric-voce" ${c.voce ? 'checked' : ''}></label>`;
  return h + '</main>';
}
function leggiPasso() {
  const c = UI.cucina, r = c && ricetta(c.id);
  if (!r || !c.voce || typeof parlaAI !== 'function') return;
  const p = r.passi[c.passo];
  parlaAI(`Passo ${c.passo + 1}. ${p.t}${p.min ? ` Se vuoi, tocca Timer ${p.min} minuti.` : ''}`);
}
/* schermo sempre acceso mentre si cucina (Wake Lock: Chrome su Android sì, alcuni telefoni no → nessun errore) */
async function tieniAcceso(si) {
  try {
    if (si && !RIC.wake && navigator.wakeLock && document.visibilityState === 'visible') { RIC.wake = await navigator.wakeLock.request('screen'); RIC.wake.addEventListener('release', () => { RIC.wake = null; }); }
    if (!si && RIC.wake) { await RIC.wake.release(); RIC.wake = null; }
  } catch (e) { RIC.wake = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && /^cucina:/.test(UI.vista)) tieniAcceso(true); });
function fermaTimer() { clearTimeout(RIC.timer && RIC.timer.t); clearInterval(RIC.tick); RIC.timer = null; RIC.tick = null; }
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
  'ric-zona'(el) { UI.ric.zona = el.dataset.v; render(); },
  'ric-cat'(el) { UI.ric.cat = el.dataset.v; render(); },
  'ric-rapide'() { UI.ric.rapide = !UI.ric.rapide; render(); },
  'ric-pulisci'() { UI.ric = { q: '', zona: 'tutte', cat: '', rapide: false }; render(); },
  'ric-pref'(el) {
    const id = el.dataset.v, p = preferiteRic(), i = p.indexOf(id);
    if (i < 0) p.push(id); else p.splice(i, 1);
    try { localStorage.setItem('pit-ric-pref', JSON.stringify(p)); } catch (e) { /* telefono senza spazio: resta per ora */ }
    render();
  },
  'ric-porz'(el) {
    const id = UI.vista.split(':')[1], r = ricetta(id); if (!r) return;
    UI.ricPorz = UI.ricPorz || {};
    UI.ricPorz[id] = Math.min(60, Math.max(1, ((UI.ricPorz[id] || r.porzioni) + Number(el.dataset.v))));
    render();
  },
  'ric-spunta'(el) {
    const id = UI.vista.split(':')[1];
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
    mostraToast(n ? `${n} ingredienti nella lista della spesa (quelli spuntati no: li hai già).` : 'Niente da aggiungere: hai spuntato tutto.',
      n ? () => { SPESA.mia = JSON.parse(prima); salvaSpesa(); render(); } : null);
  },
  'ric-passo'(el) {
    const c = UI.cucina, r = c && ricetta(c.id); if (!r) return;
    c.passo = Math.min(r.passi.length - 1, Math.max(0, c.passo + Number(el.dataset.v)));
    render(); window.scrollTo(0, 0); leggiPasso();
  },
  'ric-ripeti'() { if (UI.cucina) { const v = UI.cucina.voce; UI.cucina.voce = true; leggiPasso(); UI.cucina.voce = v; } },
  'ric-voce'(el) { if (UI.cucina) { UI.cucina.voce = el.checked; if (!el.checked && window.speechSynthesis) speechSynthesis.cancel(); } },
  'ric-timer'(el) {
    const c = UI.cucina, r = c && ricetta(c.id); if (!r) return;
    if (RIC.timer && RIC.timer.passo === c.passo) { fermaTimer(); render(); return; }
    fermaTimer();
    const min = Number(el.dataset.v), passo = c.passo;
    RIC.fine = Date.now() + min * 60000;
    RIC.timer = { passo, t: setTimeout(() => { fermaTimer(); suonaTimer(`Il timer di ${min} minuti è finito: ${r.nome}, passo ${passo + 1}.`); if (/^cucina:/.test(UI.vista)) render(); }, min * 60000) };
    RIC.tick = setInterval(() => { if (/^cucina:/.test(UI.vista) && !document.querySelector('.foglio')) render(); }, 1000);
    render();
  },
  'ric-fine'() { fermaTimer(); tieniAcceso(false); const id = UI.cucina && UI.cucina.id; UI.cucina = null; mostraToast('Buon appetito! 🍝'); vai('ricetta:' + id); }
});
document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.ricerca) { UI.ric.q = e.target.value; render(); } });
