/* voce-kokoro.js · voce italiana sul telefono con Kokoro TTS (Kokoro-82M v1.0), senza server.
   Si carica come script normale. Espone window.VociLocali.kokoro (vedi sotto).

   Come funziona (verificato leggendo il pacchetto kokoro-js 1.2.1, novembre 2026):
   - kokoro-js 1.2.1 conosce solo voci inglesi e fonemi inglesi. Per l'italiano uso le sue parti
     basse: il modello (KokoroTTS.model + tokenizer), il fonemizzatore eSpeak NG in lingua "it"
     (pacchetto phonemizer) e generate_from_ids con la voce if_sara / im_nicola (stile .bin).
   - Modello: onnx-community/Kokoro-82M-v1.0-ONNX, versione q8 (model_quantized.onnx, ~92 MB).
     Le versioni q4 sono piu' grandi (154-305 MB), quindi q8 e' la piu' leggera. Gira in WASM.
   - WebGPU solo a richiesta (window.VociLocali.kokoroWebGPU = true): serve fp32 (~326 MB), troppo
     per un telefono; per questo il predefinito e' WASM q8.
   - Cache: il modello va nella cache di transformers.js ("transformers-cache", Cache Storage,
     resta nel telefono); le voci in "kokoro-voices". Dopo il primo scarico funziona senza rete.
     Le librerie da CDN (jsdelivr) vanno tenute da sw.js se si vuole anche l'avvio senza rete. */
(function () {
  'use strict';
  var W = (typeof window !== 'undefined') ? window : globalThis;
  W.VociLocali = W.VociLocali || {};

  var VERSIONE_KOKORO = '1.2.1';
  var VERSIONE_FONEMI = '1.2.1';
  var URL_KOKORO = 'https://cdn.jsdelivr.net/npm/kokoro-js@' + VERSIONE_KOKORO + '/dist/kokoro.web.js';
  var URL_FONEMI = 'https://cdn.jsdelivr.net/npm/phonemizer@' + VERSIONE_FONEMI + '/dist/phonemizer.js';
  var MODELLO = 'onnx-community/Kokoro-82M-v1.0-ONNX';
  var FILE_MODELLO = 'model_quantized.onnx'; // q8
  var MB_MODELLO = 93;                       // 92,4 MB modello + voce (stima)
  var MAX_CARATTERI = 300;
  var CACHE_MODELLI = 'transformers-cache';
  var CACHE_VOCI = 'kokoro-voices';
  var RATE = 24000;

  // voce dell'app -> voce di Kokoro
  var VOCI = { 'kokoro:sara': 'if_sara', 'kokoro:nicola': 'im_nicola' };
  var ELENCO = [
    ['kokoro:sara', 'Sara · sul telefono (Kokoro)'],
    ['kokoro:nicola', 'Nicola · sul telefono (Kokoro)']
  ];

  var libreria = null;   // { tts, fonemizza }
  var inCaricamento = null;
  var coda = Promise.resolve(); // le frasi si fanno una alla volta

  function vocePiena(v) {
    var k = VOCI[v];
    if (!k) throw new Error('Voce Kokoro sconosciuta: ' + v);
    return k;
  }
  function importa(url) {
    if (typeof W.VociLocali.kokoroImport === 'function') return W.VociLocali.kokoroImport(url);
    return import(url);
  }
  function opzioni() {
    if (W.VociLocali.kokoroWebGPU && W.navigator && W.navigator.gpu) return { device: 'webgpu', dtype: 'fp32' };
    return { device: 'wasm', dtype: 'q8' };
  }

  // Cache Storage: c'e' gia' tutto?
  async function inCache(nome, filtro) {
    try {
      if (typeof caches === 'undefined') return false;
      if (!(await caches.has(nome))) return false;
      var c = await caches.open(nome);
      var chiavi = await c.keys();
      return chiavi.some(function (r) { return filtro(r.url); });
    } catch (e) { return false; }
  }

  function mb() { return MB_MODELLO; }

  async function pronta(voce) {
    var k = VOCI[voce];
    if (!k) return false;
    if (libreria) return true;
    var o = opzioni();
    var file = o.dtype === 'fp32' ? 'model.onnx' : FILE_MODELLO;
    var modello = await inCache(CACHE_MODELLI, function (u) { return u.indexOf('Kokoro-82M-v1.0-ONNX') >= 0 && u.indexOf(file) >= 0; });
    var vocefile = await inCache(CACHE_VOCI, function (u) { return u.indexOf('/' + k + '.bin') >= 0; });
    return modello && vocefile;
  }

  // Frazione di avanzamento da una serie di eventi di transformers.js
  function creaAvanzamento(cb) {
    var file = {};
    var ultimo = 0;
    return function (ev) {
      if (!ev || ev.status !== 'progress' || !ev.file) return;
      file[ev.file] = { l: ev.loaded || 0, t: ev.total || 0 };
      var l = 0, t = 0;
      Object.keys(file).forEach(function (f) { l += file[f].l; t += file[f].t; });
      if (!t) return;
      var fr = Math.min(0.95, l / Math.max(t, 92 * 1048576)); // il modello pesa ~92 MB: i file piccoli non fanno finto 100%
      if (fr > ultimo) { ultimo = fr; try { cb(fr); } catch (e) { /* l'app non deve rompere il caricamento */ } }
    };
  }

  async function caricaLibreria(cb) {
    if (libreria) return libreria;
    if (inCaricamento) return inCaricamento;
    var o = opzioni();
    inCaricamento = (async function () {
      var moduli = await Promise.all([importa(URL_KOKORO), importa(URL_FONEMI)]);
      var K = moduli[0], F = moduli[1];
      var tts = await K.KokoroTTS.from_pretrained(MODELLO, {
        dtype: o.dtype,
        device: o.device,
        progress_callback: cb ? creaAvanzamento(cb) : null
      });
      libreria = { tts: tts, fonemizza: F.phonemize };
      return libreria;
    })();
    try { return await inCaricamento; }
    finally { inCaricamento = null; }
  }

  async function scarica(voce, avanzamento) {
    var k = vocePiena(voce);
    var cb = typeof avanzamento === 'function' ? avanzamento : null;
    if (cb) cb(0);
    var lib = await caricaLibreria(cb);
    // scarico (e metto in cache) anche il file della voce, con una frase brevissima
    await sintetizza(lib, 'Ciao.', k);
    if (cb) cb(1);
  }

  /* ---------- testo -> fonemi italiani ---------- */

  var PUNTI = /(\s*[;:,.!?¡¿—…"«»“”(){}\[\]]+\s*)+/g;

  function pulisci(t) {
    return String(t || '')
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\(/g, '«').replace(/\)/g, '»')
      .replace(/[^\S \n]/g, ' ')
      .replace(/\n+/g, '. ')
      .replace(/ {2,}/g, ' ')
      .trim();
  }

  // spezza il testo in pezzi di al massimo ~180 caratteri, a fine frase o a virgola
  function pezzi(testo) {
    var frasi = testo.match(/[^.!?…]+[.!?…]*/g) || [testo];
    var out = [], cur = '';
    frasi.forEach(function (f) {
      f = f.trim();
      if (!f) return;
      if ((cur + ' ' + f).trim().length <= 180) { cur = (cur + ' ' + f).trim(); return; }
      if (cur) out.push(cur);
      while (f.length > 180) {
        var cut = f.lastIndexOf(',', 180);
        if (cut < 40) cut = f.lastIndexOf(' ', 180);
        if (cut < 40) cut = 180;
        out.push(f.slice(0, cut + 1).trim());
        f = f.slice(cut + 1).trim();
      }
      cur = f;
    });
    if (cur) out.push(cur);
    return out;
  }

  // come fa kokoro-js per l'inglese, ma con la lingua "it" di eSpeak NG
  async function fonemi(lib, testo) {
    var parti = [];
    var ultimo = 0, m;
    PUNTI.lastIndex = 0;
    while ((m = PUNTI.exec(testo)) !== null) {
      if (m.index > ultimo) parti.push({ punto: false, t: testo.slice(ultimo, m.index) });
      if (m[0].length) parti.push({ punto: true, t: m[0] });
      ultimo = m.index + m[0].length;
    }
    if (ultimo < testo.length) parti.push({ punto: false, t: testo.slice(ultimo) });
    var res = await Promise.all(parti.map(async function (p) {
      if (p.punto) return p.t;
      var r = await lib.fonemizza(p.t, 'it');
      return Array.isArray(r) ? r.join(' ') : String(r);
    }));
    return res.join('')
      .replace(/\^/g, '')
      .replace(/ʲ/g, 'j')
      .replace(/r/g, 'ɹ')
      .replace(/x/g, 'k')
      .replace(/ɬ/g, 'l')
      .replace(/«/g, '"').replace(/»/g, '"')
      .trim();
  }

  async function sintetizza(lib, testo, chiave) {
    var ph = await fonemi(lib, testo);
    if (!ph) return null;
    var tok = lib.tts.tokenizer(ph, { truncation: true });
    var audio = await lib.tts.generate_from_ids(tok.input_ids, { voice: chiave, speed: 1 });
    return audio; // { audio: Float32Array, sampling_rate }
  }

  /* ---------- wav ---------- */

  function wav(campioni, rate) {
    var n = campioni.length;
    var buf = new ArrayBuffer(44 + n * 2);
    var v = new DataView(buf);
    function s(o, t) { for (var i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); }
    s(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); s(8, 'WAVE'); s(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true);
    v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) {
      var x = Math.max(-1, Math.min(1, campioni[i]));
      v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  function unisci(liste, rate) {
    var pausa = Math.round(rate * 0.18);
    var tot = 0;
    liste.forEach(function (a, i) { tot += a.length + (i ? pausa : 0); });
    var out = new Float32Array(tot), p = 0;
    liste.forEach(function (a, i) { if (i) p += pausa; out.set(a, p); p += a.length; });
    return out;
  }

  async function faiParla(testo, voce) {
    var k = vocePiena(voce);
    var t = pulisci(testo);
    if (!t) throw new Error('Testo vuoto');
    if (t.length > MAX_CARATTERI) t = t.slice(0, MAX_CARATTERI);
    var lib = await caricaLibreria(null);
    var liste = [], rate = RATE;
    var lista = pezzi(t);
    for (var i = 0; i < lista.length; i++) {
      var a = await sintetizza(lib, lista[i], k);
      if (a && a.audio && a.audio.length) { liste.push(a.audio); rate = a.sampling_rate || RATE; }
    }
    if (!liste.length) throw new Error('Kokoro non ha prodotto audio');
    return wav(liste.length === 1 ? liste[0] : unisci(liste, rate), rate);
  }

  function parla(testo, voce) {
    var p = coda.then(function () { return faiParla(testo, voce); });
    coda = p.catch(function () { /* la coda va avanti anche dopo un errore */ });
    return p;
  }

  // libera la memoria (il modello resta nella cache del telefono)
  function libera() {
    var lib = libreria;
    libreria = null;
    try {
      if (lib && lib.tts && lib.tts.model && typeof lib.tts.model.dispose === 'function') lib.tts.model.dispose();
    } catch (e) { /* niente */ }
  }

  W.VociLocali.kokoro = {
    voci: ELENCO,
    mb: mb,
    pronta: pronta,
    scarica: scarica,
    parla: parla,
    libera: libera
  };
})();
