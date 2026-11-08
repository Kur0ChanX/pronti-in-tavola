/* Ricettario di Monica (C55, docs/SPEC-RICETTARIO.md): solo per chi gestisce, mai per i clienti.
   Mario 08/11: «porta GialloZafferano dentro l'app», niente pagine esterne. Le ricette di GialloZafferano si leggono DAL VIVO
   dal server dell'app (/api/gz → gz.mjs) e si mostrano qui: video nel lettore dell'app, ingredienti, passaggi con le loro foto.
   Nel codice c'è solo l'elenco scelto (ricette.js: nome, link, foto di copertina). Le ricette aperte restano sul telefono
   (preferite sempre, le altre le ultime 15) così si rileggono anche senza rete. Monica può scrivere anche le SUE ricette.
   Viste: 'ricettario' (elenco e ricerca), 'ricetta:<id>' (scheda), 'cucina:<id>' (un passo per schermata), 'ricmia:<id|nuova>' (scrivi la tua). */
const RIC = { stato: typeof RICETTE_GZ !== 'undefined' ? 'pronto' : 'no', wake: null, timer: null, fine: 0, tick: null,
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
const ZONE_RIC = [['tutte', 'Tutte'], ['pref', '⭐ Preferite'], ['gallura', 'Gallura'], ['sarda', 'Sarde'], ['italiana', 'Italiane'], ['mie', 'Le mie']];
const CAT_RIC = [['', 'Tutto'], ['antipasti', 'Antipasti'], ['primi', 'Primi'], ['secondi', 'Secondi'], ['contorni', 'Contorni'], ['dolci', 'Dolci'], ['pane', 'Pane e pizze']];
const URL_GZ = 'https://ricette.giallozafferano.it/';
/* temi della ricerca veloce (si cercano dal vivo su GialloZafferano: niente elenchi da tenere aggiornati) */
const ESPLORA_RIC = ['ricette sarde', 'dolci sardi', 'pasta fresca', 'primi di pesce', 'secondi di carne', 'secondi di pesce', 'contorni', 'antipasti', 'torte salate', 'focacce',
  'dolci al cucchiaio', 'biscotti', 'torte', 'zuppe', 'risotti', 'lasagne', 'polpette', 'verdure ripiene', 'ricette veloci', 'ricette vegetariane', 'senza glutine', 'avanzi', 'per buffet', 'sughi'];

function caricaRicette() {
  if (RIC.stato === 'pronto' || RIC.stato === 'carico') return;
  RIC.stato = 'carico';
  const s = document.createElement('script');
  s.src = 'ricette.js';
  s.onload = () => { RIC.stato = typeof RICETTE_GZ !== 'undefined' ? 'pronto' : 'errore'; render(); };
  s.onerror = () => { RIC.stato = 'errore'; s.remove(); render(); };
  document.head.appendChild(s);
}
/* ---------- memoria sul telefono ---------- */
const leggiRic = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
function scriviRic(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
const preferiteRic = () => leggiRic('pit-ric-pref', []);
const mieRic = () => leggiRic('pit-ric-mie', []);
const cacheRic = () => leggiRic('pit-ric-cache', {});
/* tiene le preferite sempre e le ultime 15 aperte; se il telefono è pieno toglie le più vecchie */
function salvaCache(r) {
  const c = cacheRic(), pref = preferiteRic();
  c[r.id] = Object.assign({}, r, { visto: Date.now() });
  let ids = Object.keys(c).filter(k => !pref.includes(k)).sort((a, b) => c[b].visto - c[a].visto);
  ids.slice(15).forEach(k => delete c[k]);
  ids = ids.slice(0, 15);
  while (!scriviRic('pit-ric-cache', c) && ids.length) delete c[ids.pop()];
}
const voceElenco = id => (typeof RICETTE_GZ !== 'undefined' ? RICETTE_GZ : []).find(r => r.id === id) || RIC.cerca.risultati.find(r => r.id === id) || ispirate().find(r => r.id === id);
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
      const lista = [], visti = new Set(RICETTE_GZ.map(r => r.id));
      for (let k = 0; k < 3; k++) gruppi.forEach(g => { const r = g[k]; if (r && !visti.has(r.id)) { visti.add(r.id); lista.push(r); } });
      scriviRic('pit-ric-ispira', { giorno: oggiRic, firma, lista: lista.slice(0, 24) });   // anche vuota: così non ricerca in giro (una volta al giorno)
    })
    .finally(() => { RIC.ispiraVa = false; if (UI.vista === 'ricettario') render(); });
}
/* la ricetta completa: mia, già sul telefono, o da chiedere al server */
function ricetta(id) {
  if (/^mia:/.test(id)) { const m = mieRic().find(x => x.id === id); return m ? daMia(m) : null; }
  return cacheRic()[id] || null;
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
    <span class="ric-testo"><b>${pref.includes(r.id) ? '⭐ ' : ''}${esc(r.nome)}</b><small>${r.mia ? 'Ricetta tua' : { gallura: 'Gallura', sarda: 'Sardegna', italiana: 'Italia' }[r.zona] || 'GialloZafferano'}${r.categoria ? ' · ' + esc((CAT_RIC.find(c => c[0] === r.categoria) || [, r.categoria])[1]) : ''}</small></span></button>`;

function vRicettario() {
  if (RIC.stato !== 'pronto') return attesaRic('Ricettario');
  const f = UI.ric || (UI.ric = { q: '', zona: 'tutte', cat: '' });
  const pref = preferiteRic(), q = senzaAccenti(f.q).trim(), cache = cacheRic();
  const mie = mieRic().map(daMia);
  const tutte = mie.concat(RICETTE_GZ, Object.values(cache).filter(r => !RICETTE_GZ.some(x => x.id === r.id)));
  let rr = tutte.filter(r => (f.zona === 'tutte' ? !(!r.mia && !r.zona && !pref.includes(r.id)) : f.zona === 'pref' ? pref.includes(r.id) : f.zona === 'mie' ? r.mia
      : f.zona === 'sarda' ? r.zona === 'sarda' || r.zona === 'gallura' : r.zona === f.zona)
    && (!f.cat || r.categoria === f.cat)
    && (!q || senzaAccenti(r.nome + ' ' + (r.ingredienti || []).map(i => i.nome).join(' ')).includes(q)));
  rr = rr.sort((a, b) => (pref.includes(b.id) - pref.includes(a.id)) || (!!b.mia - !!a.mia) || a.nome.localeCompare(b.nome, 'it'));
  const c = RIC.cerca;
  let h = testataMonica('Ricettario', 'home') + '<main class="corpo">';
  h += `<div><h1>Ricettario</h1><p class="tenue" style="margin:4px 0 0">Le ricette di GialloZafferano con video e foto dei passaggi, più le tue. Le vedete solo tu e Mario.</p></div>
    <form class="ric-cerca" data-ric-cerca="1"><input id="ric-cerca" type="search" data-ricerca="1" value="${esc(f.q)}" placeholder="Cerca: piatto o ingrediente (es. melanzane)" autocomplete="off" enterkeyhint="search">
      <button type="submit" class="btn pieno" aria-label="Cerca su GialloZafferano">${ico('cerca')}</button></form>
    <div class="scelte" role="group" aria-label="Quali">${ZONE_RIC.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-zona" data-v="${k}" aria-pressed="${f.zona === k}">${t}</button>`).join('')}</div>
    <div class="scelte" role="group" aria-label="Portata">${CAT_RIC.map(([k, t]) => `<button type="button" class="scelta" data-a="ric-cat" data-v="${k}" aria-pressed="${f.cat === k}">${t}</button>`).join('')}</div>`;
  if (f.q.trim().length >= 2) h += `<button type="button" class="btn chiaro pieno" data-a="ric-cerca-gz">${ico('cerca')}Cerca «${esc(f.q.trim())}» fra tutte le ricette di GialloZafferano</button>`;
  if (c.stato) {
    h += `<section class="scheda"><h2>Da GialloZafferano: «${esc(c.q)}»</h2>${c.stato === 'carico' ? '<p class="tenue" style="margin:0">Cerco…</p>'
      : c.stato === 'errore' ? `<p style="margin:0">${esc(c.errore)}</p><button type="button" class="btn chiaro" data-a="ric-cerca-gz">Riprova</button>`
      : c.risultati.length ? `<div class="ric-elenco">${c.risultati.map(r => cartaRic(r, pref)).join('')}</div>` : '<p style="margin:0">Nessuna ricetta con queste parole. Prova con meno parole.</p>'}
      <button type="button" class="btn chiaro piccolo" data-a="ric-chiudi-cerca">Chiudi la ricerca</button></section>`;
  }
  if (f.zona === 'tutte' && !q && !f.cat) {
    ispira();
    const isp = ispirate();
    if (isp.length) h += `<section class="scheda"><h2>✨ Ispirate ai tuoi piatti</h2><p class="piccolo tenue" style="margin:0">Ricette di GialloZafferano simili a quelle del tuo menù. Si aggiornano ogni giorno.</p>
      <div class="ric-scorri">${isp.map(r => cartaRic(Object.assign({}, r, { categoria: '' }), pref).replace('</small></span></button>', ` · come «${esc(r.per)}»</small></span></button>`)).join('')}</div></section>`;
    else if (RIC.ispiraVa) h += '<p class="piccolo tenue" style="margin:0">✨ Cerco ricette simili ai tuoi piatti…</p>';
  }
  if (!q && !c.stato) h += `<section class="scheda"><h2>🔎 Esplora GialloZafferano</h2><p class="piccolo tenue" style="margin:0">Migliaia di ricette: tocca un tema e si aprono qui dentro.</p>
    <div class="scelte">${ESPLORA_RIC.map(t => `<button type="button" class="scelta" data-a="ric-esplora" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div></section>`;
  h += `<button type="button" class="btn chiaro pieno" data-a="vai" data-v="ricmia:nuova">${ico('matita')}Scrivi una tua ricetta</button>`;
  h += rr.length ? `<div class="ric-elenco">${rr.map(r => cartaRic(r, pref)).join('')}</div>`
    : `<section class="scheda"><p style="margin:0">${f.zona === 'pref' ? 'Nessuna preferita: apri una ricetta e tocca ☆ Preferita.' : f.zona === 'mie' ? 'Non hai ancora scritto ricette tue.' : 'Nessuna ricetta in elenco con queste parole: tocca la lente per cercare su tutto GialloZafferano.'}</p>
      <button type="button" class="btn chiaro" data-a="ric-pulisci">Mostra tutte</button></section>`;
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
  if (r.hls || r.mp4) h += `<div class="ric-video"><video id="ric-video" controls playsinline preload="none" poster="${esc(r.copertina || r.foto)}" data-hls="${esc(r.hls || '')}" data-mp4="${esc(r.mp4 || '')}"></video></div>`;
  else if (r.foto) h += `<figure class="ric-foto"><img src="${esc(r.foto)}" alt="${esc(r.nome)}" referrerpolicy="no-referrer"></figure>`;
  const info = [r.prep && 'Preparazione ' + durataRic(r.prep), r.cottura && 'Cottura ' + durataRic(r.cottura), !r.prep && r.totale && 'Tempo ' + durataRic(r.totale),
    r.difficolta && 'Difficoltà ' + r.difficolta.toLowerCase(), r.costo && 'Costo ' + r.costo.toLowerCase()].filter(Boolean).join(' · ');
  h += `<div><h1>${esc(r.nome)}</h1>${info ? `<p class="tenue" style="margin:4px 0 0">${esc(info)}</p>` : ''}</div>`;
  if (r.intro) h += `<details class="ric-intro"><summary>${esc(r.intro.split('\n')[0].slice(0, 140))}${r.intro.length > 140 ? '…' : ''} <b>Leggi tutto</b></summary>${r.intro.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('')}</details>`;
  h += `<div class="fila"><button type="button" class="btn pieno" data-a="vai" data-v="cucina:${esc(id)}">${ico('piatti')}Cucina guidata</button>
      <button type="button" class="btn chiaro" data-a="ric-pref" data-v="${esc(id)}" aria-pressed="${pref}">${pref ? '⭐ Preferita' : '☆ Preferita'}</button>
      ${r.mia ? `<button type="button" class="btn chiaro" data-a="vai" data-v="ricmia:${esc(id)}">${ico('matita')}Cambia</button>` : ''}</div>
    <section class="scheda"><h2>Ingredienti</h2>
      <div class="fila ric-porz"><span>Per <b>${porz}</b> ${porz === 1 ? 'persona' : 'persone'}</span>
        <button type="button" class="btn chiaro piccolo" data-a="ric-porz" data-v="-1" aria-label="Una persona in meno" ${porz <= 1 ? 'disabled' : ''}>−</button>
        <button type="button" class="btn chiaro piccolo" data-a="ric-porz" data-v="1" aria-label="Una persona in più" ${porz >= 60 ? 'disabled' : ''}>+</button></div>
      <p class="piccolo tenue" style="margin:0">Spunta quello che hai già: nella spesa va solo il resto.</p>
      <ul class="ric-ing">${r.ingredienti.map((i, k) => `<li><label><input type="checkbox" data-a="ric-spunta" data-v="${k}" ${spunte[k] ? 'checked' : ''}><span>${rigaIng(i, r.porzioni, porz)}</span></label></li>`).join('')}</ul>
      <button type="button" class="btn chiaro pieno" data-a="ric-spesa" data-v="${esc(id)}">${ico('carrello')}Metti nella lista della spesa</button></section>
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
  const c = UI.cucina && UI.cucina.id === id ? UI.cucina : (UI.cucina = { id, passo: 0, voce: true });
  tieniAcceso(true);
  const i = Math.min(c.passo, r.passi.length - 1), p = r.passi[i], ultimo = i === r.passi.length - 1, min = minutiPasso(p.t);
  const resta = RIC.timer ? Math.max(0, Math.ceil((RIC.fine - Date.now()) / 1000)) : 0, mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  let h = testataMonica('Cucina guidata', 'ricetta:' + id) + '<main class="corpo ric-cucina">';
  h += `<p class="tenue" style="margin:0">${esc(r.nome)} · passo <b>${i + 1}</b> di ${r.passi.length}</p>
    <div class="punti ric-punti">${r.passi.map((_, j) => `<i class="${j === i ? 'on' : j < i ? 'fatto' : ''}"></i>`).join('')}</div>
    <section class="scheda ric-passo">${p.foto && p.foto.length ? `<div class="ric-fotopassi grandi">${p.foto.map(f => `<img src="${esc(f)}" alt="Ingrandisci" referrerpolicy="no-referrer" data-a="ric-zoom" data-v="${esc(f)}">`).join('')}</div>` : ''}<p>${esc(p.t)}</p>
      ${min ? `<button type="button" class="btn ${RIC.timer && RIC.timer.passo === i ? 'chiaro' : 'pieno'}" data-a="ric-timer" data-v="${min}">⏱ ${RIC.timer && RIC.timer.passo === i ? `Mancano ${mmss(resta)} · ferma` : `Timer ${durataRic(min)}`}</button>` : ''}</section>
    ${RIC.timer && RIC.timer.passo !== i ? `<p class="avviso piccolo" style="margin:0">⏱ Timer del passo ${RIC.timer.passo + 1}: mancano ${mmss(resta)}</p>` : ''}
    <div class="ric-tasti">
      <button type="button" class="btn chiaro" data-a="ric-passo" data-v="-1" ${i === 0 ? 'disabled' : ''}>${ico('indietro')}Indietro</button>
      <button type="button" class="btn chiaro" data-a="ric-ripeti">🔊 Ripeti</button>
      ${ultimo ? `<button type="button" class="btn pieno" data-a="ric-fine">Finito!</button>` : `<button type="button" class="btn pieno" data-a="ric-passo" data-v="1">Avanti</button>`}</div>
    <label class="interr"><span>Leggi i passi ad alta voce<small>La voce legge ogni passo quando lo apri.</small></span><input type="checkbox" data-a="ric-voce" ${c.voce ? 'checked' : ''}></label>
    ${RiconosciRic ? `<label class="interr"><span>🎙 Mani libere${RIC.rec ? ' · <b>ti ascolto</b>' : ''}<small>Dopo ogni passo la voce si ferma e aspetta. Di': «avanti», «indietro», «ripeti», «timer», «quanto manca», «ingredienti», «finito», «stop».</small></span><input type="checkbox" data-a="ric-mani" ${c.mani ? 'checked' : ''}></label>` : ''}`;
  return h + '</main>';
}
function leggiPasso() {
  const c = UI.cucina, r = c && ricetta(c.id);
  if (!r || !c.voce || typeof parlaAI !== 'function') return;
  const p = r.passi[c.passo], min = minutiPasso(p.t), ultimo = c.passo === r.passi.length - 1;
  const coda = c.mani ? (min ? ' Di\' «timer» per il conto alla rovescia.' : '') + (ultimo ? ' Era l\'ultimo passo: di\' «finito».' : ' Quando hai fatto, di\' «avanti».') : (min ? ' Se vuoi, tocca Timer.' : '');
  fermaAscolto();
  parlaAI(`Passo ${c.passo + 1}. ${p.t}${coda}`, () => { if (UI.cucina === c && c.mani) ascoltaCucina(); });
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
  else if (k === 'timer') { if (min) { if (!(RIC.timer && RIC.timer.passo === c.passo)) A['ric-timer']({ dataset: { v: String(min) } }); parlaAI(`Timer di ${durataRic(min)} partito.`, ascoltaCucina); } else parlaAI('In questo passo non ci sono minuti.', ascoltaCucina); }
  else if (k === 'manca') { const s = RIC.timer ? Math.max(0, Math.ceil((RIC.fine - Date.now()) / 1000)) : 0; parlaAI(s ? `Mancano ${Math.floor(s / 60)} minuti e ${s % 60} secondi.` : 'Nessun timer acceso.', ascoltaCucina); }
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
  if (el.dataset && el.dataset.ric && UI.ricBozza) {
    const k = el.dataset.ric, b = UI.ricBozza;
    b[k] = k === 'ingredienti' || k === 'passi' ? el.value.split('\n') : k === 'porzioni' ? Number(el.value) || '' : k === 'minuti' ? Number(el.value) || '' : el.value;
  }
});
document.addEventListener('change', e => {
  const el = e.target;
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
  'ric-riapri'(el) { delete RIC.errore[el.dataset.v]; render(); },
  'ric-zona'(el) { UI.ric.zona = el.dataset.v; render(); },
  'ric-cat'(el) { UI.ric.cat = el.dataset.v; render(); },
  'ric-pulisci'() { UI.ric = { q: '', zona: 'tutte', cat: '' }; render(); },
  'ric-chiudi-cerca'() { RIC.cerca = { q: '', stato: '', risultati: [] }; render(); },
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
  'ric-cerca-gz'(tema) {
    const q = (typeof tema === 'string' ? tema : UI.ric.q || '').trim(); if (q.length < 2) return;
    RIC.cerca = { q, stato: 'carico', risultati: [] }; render();
    RIC.chiedi({ cerca: q })
      .then(j => { if (RIC.cerca.q !== q) return; RIC.cerca.stato = 'ok'; RIC.cerca.risultati = (j.ricette || []).map(daCerca); })
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
  'ric-ripeti'() { if (UI.cucina) { const v = UI.cucina.voce; UI.cucina.voce = true; leggiPasso(); UI.cucina.voce = v; } },
  'ric-mani'(el) { const c = UI.cucina; if (!c) return; c.mani = el.checked; if (c.mani) { c.voce = true; leggiPasso(); } else fermaAscolto(); render(); },
  'ric-voce'(el) { if (UI.cucina) { UI.cucina.voce = el.checked; if (!el.checked && window.speechSynthesis) speechSynthesis.cancel(); } },
  'ric-timer'(el) {
    const c = UI.cucina, r = c && ricetta(c.id); if (!r) return;
    if (RIC.timer && RIC.timer.passo === c.passo) { fermaTimer(); render(); return; }
    fermaTimer();
    const min = Number(el.dataset.v), passo = c.passo;
    RIC.fine = Date.now() + min * 60000;
    RIC.timer = { passo, t: setTimeout(() => { fermaTimer(); suonaTimer(`Il timer di ${durataRic(min)} è finito: ${r.nome}, passo ${passo + 1}.`); if (/^cucina:/.test(UI.vista)) render(); }, min * 60000) };
    RIC.tick = setInterval(() => { if (/^cucina:/.test(UI.vista) && !document.querySelector('.foglio')) render(); }, 1000);
    render();
  },
  'ric-fine'() { fermaAscolto(); if (UI.cucina) UI.cucina.mani = false; fermaTimer(); tieniAcceso(false); const id = UI.cucina && UI.cucina.id; UI.cucina = null; mostraToast('Buon appetito! 🍝'); vai('ricetta:' + id); },
  'ric-mia-via-foto'() { if (UI.ricBozza) { UI.ricBozza.foto = ''; render(); } },
  'ric-mia-salva'() {
    const b = UI.ricBozza; if (!b) return;
    const pulito = a => (a || []).map(x => String(x).trim()).filter(Boolean);
    const m = { id: b.id === 'nuova' ? 'mia:' + Date.now().toString(36) : b.id, nome: String(b.nome || '').trim().slice(0, 80), porzioni: Math.min(60, Math.max(1, Number(b.porzioni) || 4)),
      minuti: Math.min(1440, Math.max(0, Number(b.minuti) || 0)), categoria: b.categoria || '', ingredienti: pulito(b.ingredienti).slice(0, 60), passi: pulito(b.passi).slice(0, 60),
      note: String(b.note || '').trim().slice(0, 2000), foto: b.foto || '' };
    if (!m.nome) { mostraToast('Scrivi il nome del piatto.'); return; }
    if (!m.ingredienti.length && !m.passi.length) { mostraToast('Scrivi almeno gli ingredienti o i passi.'); return; }
    const tutte = mieRic(), prima = JSON.stringify(tutte), i = tutte.findIndex(x => x.id === m.id);
    if (i < 0) tutte.unshift(m); else tutte[i] = m;
    if (!scriviRic('pit-ric-mie', tutte)) { mostraToast('Il telefono è pieno: togli la foto e riprova.'); return; }
    UI.ricBozza = null;
    mostraToast('Ricetta salvata.', () => { scriviRic('pit-ric-mie', JSON.parse(prima)); vai('ricettario'); });
    vai('ricetta:' + m.id);
  },
  'ric-mia-elimina'() {
    const b = UI.ricBozza; if (!b || !confirm(`Elimino la ricetta «${b.nome}»?`)) return;
    const tutte = mieRic(), prima = JSON.stringify(tutte);
    scriviRic('pit-ric-mie', tutte.filter(x => x.id !== b.id));
    scriviRic('pit-ric-pref', preferiteRic().filter(x => x !== b.id));
    UI.ricBozza = null;
    mostraToast('Ricetta eliminata.', () => { scriviRic('pit-ric-mie', JSON.parse(prima)); render(); });
    vai('ricettario');
  }
});
