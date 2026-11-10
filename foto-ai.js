/* Pronti in Tavola · «✨ Migliora con l'AI» (C119, Mario 10/11 «ia delle foto sembra ok implementala»).
   Le ricette vecchie di GialloZafferano hanno foto dei passi piccole (strisce di 3 foto da 220×170 px): ingrandite si sgranano.
   Qui un'AI sul telefono le ingrandisce 4 volte (220×170 → 880×680), gratis e senza server che pensa.
   - Modello: Real-ESRGAN general x4v3 (xinntao/Real-ESRGAN, licenza BSD-3), ONNX da 4,9 MB, servito dal NOSTRO sito
     (media/realesr-x4v3.onnx): Hugging Face rifiuta le richieste da *.workers.dev (PT E25).
   - Motore: onnxruntime-web 1.18.0, lo STESSO della voce Paola (voce-piper.js) e nella stessa memoria («voci-modelli»):
     se Paola è già nel telefono non si riscarica niente. Gira in un Web Worker tutto suo: la pagina non si blocca
     mentre lavora (provato 10/11 nel contenitore: ~2,6 s; telefono 3-12 s, stima).
   - La foto arriva da /api/foto-gz (worker.js): le foto di GZ non danno il permesso (CORS) di leggere i pixel.
   - Le foto migliorate restano nella memoria del telefono («foto-ai», al massimo 200): la seconda volta è subito.
   window.FotoAI = { gia(u, n, j), migliora(u, n, j, passo), auto(), primaVolta() } */
(function () {
  'use strict';
  const W = window;
  const CACHE_ORT = 'voci-modelli', CACHE_FOTO = 'foto-ai', MAX_FOTO = 200, VERSIONE = 1;
  const CDN = ['https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/'];   // il primo è la chiave in memoria (come voce-piper.js)
  const ORT = {
    js:   { p: 'onnxruntime-web@1.18.0/dist/ort.wasm.min.js', byte: 142930, esatto: false, tipo: 'text/javascript' },
    wasm: { p: 'onnxruntime-web@1.18.0/dist/ort-wasm-simd.wasm', byte: 10595041, esatto: true, tipo: 'application/wasm' }
  };
  const MODELLO = { p: 'media/realesr-x4v3.onnx', byte: 4866417, tipo: 'application/octet-stream' };
  const LATO_MAX = 360;   // ingresso al massimo 360 px di lato: le strisce sono 220; oltre, il telefono ci metterebbe troppo
  const MB_PRIMA = Math.round((ORT.js.byte + ORT.wasm.byte + MODELLO.byte) / 1e6);

  const errore = (t, codice) => { const e = new Error(t); if (codice) e.codice = codice; return e; };
  const assoluto = p => new URL(p, W.location.href).href;
  const chiaveFoto = (u, n, j) => assoluto('foto-ai/v' + VERSIONE + '?u=' + encodeURIComponent(u) + '&n=' + n + '&j=' + j);
  async function cartella(nome) {
    if (!W.caches) throw errore('questo telefono non lascia salvare l\'AI', 'memoria');
    return W.caches.open(nome);
  }

  /* un file dalla memoria del telefono; se manca si scarica (prova gli indirizzi in ordine), si controlla la grandezza e si salva */
  async function prendi(nomeCartella, chiave, urls, byte, esatto, tipo) {
    const c = await cartella(nomeCartella);
    const m = await c.match(chiave).catch(() => null);
    if (m) return m.blob();
    if (W.navigator && W.navigator.onLine === false) throw errore('manca la rete', 'rete');
    let ultimo = null;
    for (const url of urls) {
      try {
        const r = await W.fetch(url, { referrerPolicy: 'no-referrer' });
        if (!r.ok) throw errore('risposta ' + r.status, 'http-' + r.status);
        const b = new Blob([await r.arrayBuffer()], { type: tipo });
        if (esatto ? b.size !== byte : b.size < 1000) throw errore('file incompleto (' + b.size + ' byte)', 'incompleto');
        await c.put(chiave, new W.Response(b, { headers: { 'Content-Type': tipo, 'Content-Length': String(b.size) } })).catch(() => null);
        return b;
      } catch (e) { ultimo = e; }
    }
    throw errore('non riesco a scaricare l\'AI (' + ((ultimo && ultimo.message) || 'rete') + ')', (ultimo && ultimo.codice) || 'scarica');
  }

  /* ---------- il lavoratore (Web Worker): solo conti, niente pagina ---------- */
  function lavoratore() {
    let sess = null;
    self.onmessage = async e => {
      const m = e.data;
      try {
        if (m.tipo === 'avvia') {
          importScripts(m.ortJs);
          const env = self.ort.env.wasm;
          env.numThreads = 1; env.proxy = false;   // un filo: il sito non è «isolato» (niente memoria condivisa)
          env.wasmPaths = { 'ort-wasm-simd.wasm': m.wasm, 'ort-wasm-simd-threaded.wasm': m.wasm, 'ort-wasm.wasm': m.cdn + 'ort-wasm.wasm', 'ort-wasm-threaded.wasm': m.cdn + 'ort-wasm-threaded.wasm' };
          sess = await self.ort.InferenceSession.create(m.modello, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
          self.postMessage({ id: m.id, ok: true });
          return;
        }
        if (m.tipo === 'migliora') {
          const w = m.w, h = m.h, px = m.px, n = w * h, f = new Float32Array(3 * n);
          for (let i = 0; i < n; i++) { f[i] = px[4 * i] / 255; f[n + i] = px[4 * i + 1] / 255; f[2 * n + i] = px[4 * i + 2] / 255; }
          const fuori = await sess.run({ [sess.inputNames[0]]: new self.ort.Tensor('float32', f, [1, 3, h, w]) });
          const t = fuori[sess.outputNames[0]], H = t.dims[2], L = t.dims[3], d = t.data, N = H * L, o = new Uint8ClampedArray(4 * N);
          for (let i = 0; i < N; i++) { o[4 * i] = d[i] * 255; o[4 * i + 1] = d[N + i] * 255; o[4 * i + 2] = d[2 * N + i] * 255; o[4 * i + 3] = 255; }   // l'uscita non è limitata: Uint8ClampedArray taglia a 0-255
          self.postMessage({ id: m.id, ok: true, w: L, h: H, px: o }, [o.buffer]);
        }
      } catch (err) { self.postMessage({ id: m.id, errore: String((err && err.message) || err) }); }
    };
  }

  let lav = null, avvio = null, conta = 0, coda = Promise.resolve();
  const attese = {};
  function chiedi(msg, trasferisci) {
    return new Promise((ok, ko) => { const id = ++conta; attese[id] = { ok, ko }; lav.postMessage(Object.assign({ id }, msg), trasferisci || []); });
  }
  function avvia(passo) {
    if (avvio) return avvio;
    avvio = (async () => {
      if (typeof W.Worker !== 'function' || typeof W.WebAssembly !== 'object') throw errore('questo telefono è troppo vecchio per l\'AI', 'vecchio');
      if (!(await giaScaricata())) passo('✨ Preparo l\'AI (solo la prima volta, ' + MB_PRIMA + ' MB)…');
      const [js, wasm, modello] = await Promise.all([
        prendi(CACHE_ORT, CDN[0] + ORT.js.p, CDN.map(c => c + ORT.js.p), ORT.js.byte, ORT.js.esatto, ORT.js.tipo),
        prendi(CACHE_ORT, CDN[0] + ORT.wasm.p, CDN.map(c => c + ORT.wasm.p), ORT.wasm.byte, ORT.wasm.esatto, ORT.wasm.tipo),
        prendi(CACHE_FOTO, assoluto(MODELLO.p), [assoluto(MODELLO.p)], MODELLO.byte, true, MODELLO.tipo)
      ]);
      passo('✨ Accendo l\'AI…');
      const codice = '(' + lavoratore.toString() + ')();';
      lav = new W.Worker(W.URL.createObjectURL(new Blob([codice], { type: 'text/javascript' })));
      lav.onmessage = e => { const a = attese[e.data.id]; if (!a) return; delete attese[e.data.id]; if (e.data.errore) a.ko(errore(e.data.errore, 'ai')); else a.ok(e.data); };
      lav.onerror = e => { const msg = (e && e.message) || 'il lavoratore si è fermato'; Object.keys(attese).forEach(k => { attese[k].ko(errore(msg, 'ai')); delete attese[k]; }); };
      const buf = await modello.arrayBuffer();
      await chiedi({ tipo: 'avvia', ortJs: W.URL.createObjectURL(js), wasm: W.URL.createObjectURL(wasm), cdn: CDN[0] + 'onnxruntime-web@1.18.0/dist/', modello: buf }, [buf]);
      return true;
    })();
    avvio.catch(() => { avvio = null; if (lav) { try { lav.terminate(); } catch (e) { /* già fermo */ } lav = null; } });   // fallito: si può riprovare
    return avvio;
  }
  async function giaScaricata() {
    try {
      const [a, b] = [await cartella(CACHE_ORT), await cartella(CACHE_FOTO)];
      return !!((await a.match(CDN[0] + ORT.js.p)) && (await a.match(CDN[0] + ORT.wasm.p)) && (await b.match(assoluto(MODELLO.p))));
    } catch (e) { return false; }
  }

  /* la j-esima foto della striscia (n foto affiancate), in pixel; la foto arriva dal nostro server (/api/foto-gz) */
  async function pixel(u, n, j) {
    if (W.navigator && W.navigator.onLine === false) throw errore('manca la rete', 'rete');
    const tok = typeof Dati !== 'undefined' && Dati.token ? await Dati.token().catch(() => '') : '';   // Dati (dati.js) è una const: non sta in window   // il passaggio è solo per chi gestisce
    if (!tok) throw errore('serve l\'accesso di Monica o di Mario', 'accesso');
    let r;
    try { r = await W.fetch(assoluto('/api/foto-gz'), { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ u }) }); } catch (e) { throw errore('la foto non arriva (rete?)', 'rete'); }
    if (!r.ok) throw errore('la foto non arriva (codice ' + r.status + ')', 'http-' + r.status);
    const b = await r.blob();
    let img;
    if (typeof W.createImageBitmap === 'function') img = await W.createImageBitmap(b);
    else img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(errore('foto illeggibile', 'foto')); i.src = W.URL.createObjectURL(b); });
    const L = img.width || img.naturalWidth, A = img.height || img.naturalHeight, sw = Math.floor(L / (n || 1)), sx = (j || 0) * sw;
    const k = Math.min(1, LATO_MAX / Math.max(sw, A)), w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(A * k));
    const c = W.document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(img, sx, 0, sw, A, 0, 0, w, h);
    if (img.close) img.close();
    return { w, h, px: g.getImageData(0, 0, w, h).data };
  }
  function inJpeg(o) {
    const c = W.document.createElement('canvas'); c.width = o.w; c.height = o.h;
    c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(o.px.buffer || o.px), o.w, o.h), 0, 0);
    return new Promise((ok, ko) => c.toBlob(b => b ? ok(b) : ko(errore('foto non salvata', 'foto')), 'image/jpeg', 0.92));
  }

  const fatte = new Map();   // chiave → indirizzo della foto migliorata (per questa apertura dell'app)
  async function gia(u, n, j) {
    const k = chiaveFoto(u, n, j);
    if (fatte.has(k)) return fatte.get(k);
    try {
      const m = await (await cartella(CACHE_FOTO)).match(k);
      if (!m) return null;
      const url = W.URL.createObjectURL(await m.blob()); fatte.set(k, url); return url;
    } catch (e) { return null; }
  }
  /* migliora(u, n, j, passo): una alla volta (coda); passo(testo) dice a che punto è; risponde con l'indirizzo della foto grande */
  function migliora(u, n, j, passo) {
    passo = typeof passo === 'function' ? passo : () => {};
    const lavoro = coda.then(async () => {
      const g = await gia(u, n, j); if (g) return g;
      await avvia(passo);
      passo('✨ Miglioro la foto… (pochi secondi)');
      const p = await pixel(u, n, j);
      const o = await chiedi({ tipo: 'migliora', w: p.w, h: p.h, px: p.px }, [p.px.buffer]);
      const b = await inJpeg(o), k = chiaveFoto(u, n, j);
      try {
        const c = await cartella(CACHE_FOTO);
        await c.put(k, new W.Response(b, { headers: { 'Content-Type': 'image/jpeg' } }));
        const ks = (await c.keys()).filter(r => r.url.includes('/foto-ai/'));
        for (const r of ks.slice(0, Math.max(0, ks.length - MAX_FOTO))) await c.delete(r);   // le più vecchie fuori: la memoria non cresce per sempre
      } catch (e) { /* senza memoria: la foto si vede lo stesso */ }
      try { W.localStorage.setItem('pit-foto-ai', '1'); } catch (e) { /* niente memoria: si chiede ogni volta */ }
      const url = W.URL.createObjectURL(b); fatte.set(k, url); return url;
    });
    coda = lavoro.catch(() => null);
    return lavoro;
  }
  /* dopo il primo uso le altre foto a strisce si migliorano da sole (Mario 10/11) */
  const auto = () => { try { return W.localStorage.getItem('pit-foto-ai') === '1'; } catch (e) { return false; } };
  W.FotoAI = { gia, migliora, auto, primaVolta: async () => !(await giaScaricata()), MB_PRIMA };
})();
