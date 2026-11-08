/* Voce Piper sul telefono (senza server). Espone window.VociLocali.piper, lo usa aiutante.js.
   Come funziona: i fonemi li fa piper-wasm (espeak-ng in WebAssembly), la voce la fa il modello Piper (.onnx)
   eseguito da onnxruntime-web. Tutto (programmi e modello) si scarica UNA volta e resta nella Cache Storage
   «voci-modelli»: dopo, funziona anche senza rete. Niente import statici: i programmi sono script iniettati.
   Versioni fisse (cercate a novembre 2026): onnxruntime-web 1.18.0, @diffusionstudio/piper-wasm 1.0.0, voci rhasspy/piper-voices. */
(function () {
  'use strict';
  const W = typeof window !== 'undefined' ? window : globalThis;
  W.VociLocali = W.VociLocali || {};

  const CACHE = 'voci-modelli';
  const CDN = ['https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/'];   // il primo è la chiave in cache, il secondo è di riserva
  const HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/';
  const MAX_FRASE = 300;     // caratteri di testo per ogni chiamata a parla()
  const MAX_PEZZO = 220;     // caratteri per ogni pezzo dato al fonemizzatore

  /* Programmi comuni a tutte le voci: percorso npm, byte attesi (controllati), tipo. Per gli script basta che non siano vuoti. */
  const RUNTIME = {
    ort:     { p: 'onnxruntime-web@1.18.0/dist/ort.wasm.min.js', byte: 142930, esatto: false, tipo: 'text/javascript' },
    ortWasm: { p: 'onnxruntime-web@1.18.0/dist/ort-wasm-simd.wasm', byte: 10595041, esatto: true, tipo: 'application/wasm' },
    fonJs:   { p: '@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.js', byte: 120714, esatto: false, tipo: 'text/javascript' },
    fonWasm: { p: '@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm', byte: 635212, esatto: true, tipo: 'application/wasm' },
    fonData: { p: '@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data', byte: 18077249, esatto: true, tipo: 'application/octet-stream' }
  };
  const BYTE_RUNTIME = Object.values(RUNTIME).reduce((s, f) => s + f.byte, 0);

  /* Voci italiane: percorso su Hugging Face (senza estensione), byte del modello (.onnx) e del .json */
  const VOCI = {
    paola:    { id: 'it_IT-paola-medium',    p: 'it/it_IT/paola/medium/it_IT-paola-medium',       byte: 63511038, byteJson: 7099 },
    riccardo: { id: 'it_IT-riccardo-x_low', p: 'it/it_IT/riccardo/x_low/it_IT-riccardo-x_low', byte: 28130791, byteJson: 4161 }
  };
  const NOMI = { paola: 'Paola · sul telefono (Piper)', riccardo: 'Riccardo · sul telefono (Piper, più leggera)' };

  let runtimeNelTelefono = false;   // aggiornato da pronta()/scarica(): serve solo a mb()
  let rt = null;                    // programmi caricati nella pagina (una volta sola)
  let sess = null;                  // { id, sessione, cfg } della voce in uso
  const inCorso = {};               // scarichi in corso per voce (niente doppioni)

  const errore = (m) => new Error(m);

  function trovaVoce(voce) {
    const k = String(voce || '').replace(/^piper:/, '');
    if (!VOCI[k]) throw errore('Voce Piper sconosciuta: ' + voce);
    return { chiave: k, ...VOCI[k] };
  }
  const urlRuntime = (f) => CDN[0] + f.p;
  const urlModello = (v) => HF + v.p + '.onnx';
  const urlConfig = (v) => HF + v.p + '.onnx.json';

  /* ---------- Cache Storage ---------- */
  async function cartella() {
    if (!W.caches) throw errore('Questo telefono non permette di salvare le voci (Cache Storage mancante).');
    return W.caches.open(CACHE);
  }
  async function dallaCache(url) {
    try { return await (await cartella()).match(url); } catch (e) { return null; }
  }
  async function bloccoDaCache(url, tipo) {
    const r = await dallaCache(url);
    if (!r) throw errore('Voce non scaricata: manca un file nel telefono.');
    const b = await r.blob();
    return tipo ? new Blob([b], { type: tipo }) : b;
  }

  /* Scarica un file (prova gli indirizzi in ordine), controlla la grandezza e lo mette in cache con la chiave urls[0].
     dentro(n): chiamata con i byte arrivati (negativa se un tentativo fallisce e si riparte). */
  async function scaricaFile(urls, byteAttesi, esatto, tipo, dentro) {
    let ultimo = null;
    for (const url of urls) {
      let presi = 0;
      try {
        const r = await W.fetch(url, { referrerPolicy: 'no-referrer' });   // Hugging Face risponde 404 senza CORS se la provenienza è *.workers.dev (provato 08/11)
        if (!r.ok) throw errore('Risposta ' + r.status + ' da ' + url);
        const pezzi = [];
        if (r.body && r.body.getReader) {
          const lettore = r.body.getReader();
          for (;;) {
            const { done, value } = await lettore.read();
            if (done) break;
            pezzi.push(value); presi += value.length; dentro(value.length);
          }
        } else {
          const b = await r.blob(); pezzi.push(b); presi = b.size; dentro(b.size);
        }
        const blob = new Blob(pezzi, { type: tipo });
        if (esatto ? blob.size !== byteAttesi : blob.size < 1000) throw errore('File incompleto o sbagliato (' + blob.size + ' byte invece di ' + byteAttesi + ')');
        await (await cartella()).put(urls[0], new W.Response(blob, { headers: { 'Content-Type': tipo, 'Content-Length': String(blob.size) } }));
        return;
      } catch (e) {
        dentro(-presi);
        ultimo = e;
      }
    }
    throw errore('Scaricamento non riuscito (controlla la rete): ' + (ultimo && ultimo.message || ultimo));
  }

  /* Elenco dei file di una voce: chiave in cache, indirizzi, byte, controllo, tipo */
  function filiDi(v) {
    const lista = [
      { chiave: urlConfig(v), urls: [urlConfig(v), urlConfig(v)], byte: v.byteJson, esatto: false, tipo: 'application/json', runtime: false },
      { chiave: urlModello(v), urls: [urlModello(v), urlModello(v)], byte: v.byte, esatto: true, tipo: 'application/octet-stream', runtime: false }
    ];
    for (const f of Object.values(RUNTIME)) {
      lista.push({ chiave: urlRuntime(f), urls: CDN.map((c) => c + f.p), byte: f.byte, esatto: f.esatto, tipo: f.tipo, runtime: true });
    }
    return lista;
  }

  async function pronta(voce) {
    try {
      const v = trovaVoce(voce);
      for (const f of filiDi(v)) { if (!(await dallaCache(f.chiave))) { return false; } }
      runtimeNelTelefono = true;
      return true;
    } catch (e) { return false; }
  }

  function mb(voce) {
    const v = trovaVoce(voce);
    const tot = v.byte + v.byteJson + (runtimeNelTelefono ? 0 : BYTE_RUNTIME);
    return Math.ceil(tot / 1e6);
  }

  function scarica(voce, avanzamento) {
    let v;
    try { v = trovaVoce(voce); } catch (e) { return Promise.reject(e); }
    if (inCorso[v.chiave]) return inCorso[v.chiave];
    const lavoro = (async () => {
      const dire = (x) => { try { if (avanzamento) avanzamento(Math.max(0, Math.min(1, x))); } catch (e) { /* l'app non deve rompere lo scarico */ } };
      dire(0);
      try { if (W.navigator && W.navigator.storage && W.navigator.storage.persist) W.navigator.storage.persist(); } catch (e) { /* facoltativo: evita che Chrome butti la voce */ }
      const mancanti = [];
      for (const f of filiDi(v)) { if (!(await dallaCache(f.chiave))) mancanti.push(f); }
      const totale = mancanti.reduce((s, f) => s + f.byte, 0);
      let fatti = 0;
      for (const f of mancanti) {
        await scaricaFile(f.urls, f.byte, f.esatto, f.tipo, (n) => { fatti += n; dire(totale ? fatti / totale : 0); });
      }
      runtimeNelTelefono = true;
      dire(1);
    })();
    inCorso[v.chiave] = lavoro;
    const fine = () => { delete inCorso[v.chiave]; };
    lavoro.then(fine, fine);
    return lavoro;
  }

  /* ---------- Programmi nella pagina ---------- */
  function iniettaScript(url) {
    return new Promise((ok, no) => {
      const s = W.document.createElement('script');
      s.src = url;
      s.onload = () => { ok(); };
      s.onerror = () => no(errore('Non riesco ad avviare il programma della voce.'));
      (W.document.head || W.document.documentElement).appendChild(s);
    });
  }
  async function caricaRuntime() {
    if (rt) return rt;
    rt = (async () => {
      const ortBlob = await bloccoDaCache(urlRuntime(RUNTIME.ort), 'text/javascript');
      const u1 = W.URL.createObjectURL(ortBlob);
      await iniettaScript(u1);
      if (!W.ort || !W.ort.InferenceSession) throw errore('onnxruntime non partito.');
      const wasm = W.URL.createObjectURL(await bloccoDaCache(urlRuntime(RUNTIME.ortWasm), 'application/wasm'));
      const env = W.ort.env.wasm;
      env.numThreads = 1;     // un solo filo: niente bisogno di pagina "isolata", più stabile sul telefono
      env.proxy = true;    // C83 (Mario 08/11 «sì come consiglio»): la voce lavora in un Web Worker, la pagina non si blocca (prova: blocco 1,4 s → 0,1 s)
      // onnxruntime 1.18 cerca il .wasm per nome: lo diamo dalla cache. I due non-SIMD (telefoni vecchissimi) restano da rete.
      env.wasmPaths = {
        'ort-wasm-simd.wasm': wasm,
        'ort-wasm-simd-threaded.wasm': wasm,
        'ort-wasm.wasm': CDN[0] + 'onnxruntime-web@1.18.0/dist/ort-wasm.wasm',
        'ort-wasm-threaded.wasm': CDN[0] + 'onnxruntime-web@1.18.0/dist/ort-wasm-threaded.wasm'
      };
      const fonUrl = W.URL.createObjectURL(await bloccoDaCache(urlRuntime(RUNTIME.fonJs), 'text/javascript'));
      await iniettaScript(fonUrl);
      if (typeof W.createPiperPhonemize !== 'function') throw errore('Il fonemizzatore non è partito.');
      return true;
    })();
    rt.catch(() => { rt = null; });   // se fallisce, si può riprovare
    return rt;
  }

  async function apriSessione(v) {
    if (sess && sess.id === v.id) return sess;
    liberaSessione();
    await caricaRuntime();
    const cfg = JSON.parse(await (await bloccoDaCache(urlConfig(v))).text());
    const dati = await (await bloccoDaCache(urlModello(v))).arrayBuffer();
    const sessione = await W.ort.InferenceSession.create(dati, { executionProviders: ['wasm'] });
    sess = { id: v.id, sessione, cfg };
    return sess;
  }
  function liberaSessione() {
    const s = sess; sess = null;
    try { if (s && s.sessione && s.sessione.release) s.sessione.release(); } catch (e) { /* già libera */ }
  }
  function libera() { liberaSessione(); }

  /* ---------- Testo → pezzi → fonemi → audio ---------- */
  function pulisci(testo) {
    let t = String(testo == null ? '' : testo);
    try { t = t.replace(/[\p{Extended_Pictographic}️‍]/gu, ' '); } catch (e) { /* motori vecchi */ }
    t = t.replace(/[‘’]/g, "'").replace(/[“”«»]/g, '"').replace(/\s+/g, ' ').trim();
    return t.length > MAX_FRASE ? t.slice(0, MAX_FRASE) : t;
  }
  function dividi(testo) {
    const frasi = testo.match(/[^.!?…;\n]+[.!?…;]*\s*/g) || [testo];
    const pezzi = []; let corrente = '';
    const spingi = () => { const c = corrente.trim(); if (c) pezzi.push(c); corrente = ''; };
    for (const fr of frasi) {
      if (fr.length > MAX_PEZZO) {   // frase lunghissima: a parole
        spingi();
        let p = '';
        for (const parola of fr.split(/\s+/)) {
          if ((p + ' ' + parola).trim().length > MAX_PEZZO) { if (p.trim()) pezzi.push(p.trim()); p = parola; } else p = p ? p + ' ' + parola : parola;
        }
        corrente = p;
      } else {
        if ((corrente + fr).length > MAX_PEZZO) spingi();
        corrente += fr;
      }
    }
    spingi();
    return pezzi;
  }

  /* Fonemi di tutti i pezzi con UNA sola partenza del fonemizzatore: una riga JSON per pezzo/frase. Restituisce liste di numeri. */
  async function fonemi(pezzi, cfg) {
    const urlWasm = W.URL.createObjectURL(await bloccoDaCache(urlRuntime(RUNTIME.fonWasm), 'application/wasm'));
    const urlData = W.URL.createObjectURL(await bloccoDaCache(urlRuntime(RUNTIME.fonData), 'application/octet-stream'));
    try {
      const righe = [];
      let timer;
      const modulo = await Promise.race([
        W.createPiperPhonemize({
          print: (d) => { try { const j = JSON.parse(d); if (j && Array.isArray(j.phoneme_ids)) righe.push(j.phoneme_ids); } catch (e) { /* riga non JSON */ } },
          printErr: () => {},
          locateFile: (u) => (u.endsWith('.wasm') ? urlWasm : u.endsWith('.data') ? urlData : u)
        }),
        new Promise((_, no) => { timer = setTimeout(() => no(errore('Il fonemizzatore non risponde.')), 60000); })
      ]).finally(() => clearTimeout(timer));
      modulo.callMain(['-l', (cfg.espeak && cfg.espeak.voice) || 'it', '--input', JSON.stringify(pezzi.map((text) => ({ text }))), '--espeak_data', '/espeak-ng-data']);
      if (!righe.length) throw errore('Nessun suono da questo testo.');
      return righe;
    } finally {
      W.URL.revokeObjectURL(urlWasm); W.URL.revokeObjectURL(urlData);
    }
  }

  function inWav(pcm, hz) {
    const n = pcm.length, vista = new DataView(new ArrayBuffer(44 + n * 2));
    const testoA = (o, s) => { for (let i = 0; i < s.length; i++) vista.setUint8(o + i, s.charCodeAt(i)); };
    testoA(0, 'RIFF'); vista.setUint32(4, 36 + n * 2, true); testoA(8, 'WAVE'); testoA(12, 'fmt ');
    vista.setUint32(16, 16, true); vista.setUint16(20, 1, true); vista.setUint16(22, 1, true);
    vista.setUint32(24, hz, true); vista.setUint32(28, hz * 2, true); vista.setUint16(32, 2, true); vista.setUint16(34, 16, true);
    testoA(36, 'data'); vista.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, pcm[i])); vista.setInt16(44 + i * 2, x < 0 ? x * 32768 : x * 32767, true); }
    return new Blob([vista.buffer], { type: 'audio/wav' });
  }

  async function parla(testo, voce, vel) {
    const v = trovaVoce(voce);
    const t = pulisci(testo);
    if (!t) throw errore('Niente da leggere.');
    if (!(await pronta(voce))) throw errore('La voce non è ancora nel telefono: scaricala prima.');
    const s = await apriSessione(v);
    const hz = s.cfg.audio.sample_rate;
    const righe = await fonemi(dividi(t), s.cfg);
    const inf = s.cfg.inference || {};
    const T = W.ort.Tensor;
    const audio = [];
    for (const ids of righe) {
      const feeds = {
        input: new T('int64', BigInt64Array.from(ids, (n) => BigInt(n)), [1, ids.length]),
        input_lengths: new T('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
        scales: new T('float32', Float32Array.from([inf.noise_scale ?? 0.667, (inf.length_scale ?? 1) / (vel >= 0.5 && vel <= 2 ? vel : 1), inf.noise_w ?? 0.8]), [3])
      };
      if (s.cfg.speaker_id_map && Object.keys(s.cfg.speaker_id_map).length) feeds.sid = new T('int64', BigInt64Array.from([0n]), [1]);
      const out = await s.sessione.run(feeds);
      audio.push(out.output.data);
    }
    const pausa = Math.round(hz * 0.2);   // mezzo respiro fra una frase e l'altra
    const tot = audio.reduce((a, p) => a + p.length, 0) + pausa * Math.max(0, audio.length - 1);
    const unito = new Float32Array(tot);
    let o = 0;
    audio.forEach((p, i) => { unito.set(p, o); o += p.length + (i < audio.length - 1 ? pausa : 0); });
    return inWav(unito, hz);
  }

  W.VociLocali.piper = {
    voci: Object.keys(VOCI).map((k) => ['piper:' + k, NOMI[k]]),
    mb, pronta, scarica, parla, libera
  };
})();
