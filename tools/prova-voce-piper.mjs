/* Prova di voce-piper.js senza rete: sintassi, interfaccia, cache «voci-modelli» (scarico, riuso, riserva unpkg,
   file incompleti) e il giro parla() con onnxruntime e fonemizzatore finti. Lancia: node tools/prova-voce-piper.mjs → «N OK, 0 NO».
   NON prova la voce vera (servono rete e telefono): quella si prova sul sito. */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveObjectURL } from 'node:buffer';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const radice = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(radice, 'voce-piper.js');
let ok = 0, no = 0;
const prova = (nome, v) => { if (v) ok++; else { no++; console.log('NO  ' + nome); } };

/* 1. sintassi */
try { execFileSync(process.execPath, ['--check', file]); prova('node --check', true); } catch (e) { prova('node --check', false); }
const sorgente = readFileSync(file, 'utf8');
prova('niente import statici', !/^\s*import\s/m.test(sorgente));
prova('niente chiavi nel file', !/(api[_-]?key|secret|token)\s*[:=]/i.test(sorgente));
prova('versioni fisse sui CDN', /onnxruntime-web@1\.18\.0/.test(sorgente) && /piper-wasm@1\.0\.0/.test(sorgente) && !/@latest/.test(sorgente));

/* 2. mondo finto: cache, rete, script */
const MB = { 'onnx.json': 0 };
const archivio = new Map();                                   // la «Cache Storage» finta
globalThis.caches = { open: async (nome) => { if (nome !== 'voci-modelli') throw new Error('cache sbagliata: ' + nome); return { match: async (u) => { const r = archivio.get(u); return r ? new Response(r.blob, { headers: r.headers }) : undefined; }, put: async (u, r) => { archivio.set(u, { blob: await r.blob(), headers: Object.fromEntries(r.headers) }); } }; } };
const dimensioni = { // byte veri dei file (stessi del file da provare)
  'ort.wasm.min.js': 142930, 'ort-wasm-simd.wasm': 10595041, 'piper_phonemize.js': 120714, 'piper_phonemize.wasm': 635212, 'piper_phonemize.data': 18077249,
  'it_IT-paola-medium.onnx': 63511038, 'it_IT-paola-medium.onnx.json': 7099, 'it_IT-riccardo-x_low.onnx': 28130791, 'it_IT-riccardo-x_low.onnx.json': 4161
};
const configFinta = JSON.stringify({ audio: { sample_rate: 22050 }, espeak: { voice: 'it' }, inference: { noise_scale: 0.667, length_scale: 1, noise_w: 0.8 }, speaker_id_map: {} });
const riempi = (t, n) => { const b = Buffer.alloc(n, 32); Buffer.from(t).copy(b); return b; };
let richieste = [], bloccaJsdelivr = false, troncaData = false;
globalThis.fetch = async (url) => {
  url = String(url); richieste.push(url);
  if (bloccaJsdelivr && url.startsWith('https://cdn.jsdelivr.net/')) return new Response('no', { status: 403 });
  const nome = url.split('/').pop(); const n = dimensioni[nome];
  if (n == null) return new Response('manca', { status: 404 });
  let corpo;
  if (nome === 'ort.wasm.min.js') corpo = riempi('globalThis.ort=globalThis.__ortFinto;', n);
  else if (nome === 'piper_phonemize.js') corpo = riempi('var createPiperPhonemize = globalThis.__fonFinto;', n);
  else if (nome.endsWith('.onnx.json')) corpo = riempi(configFinta, n);
  else corpo = Buffer.alloc(nome === 'piper_phonemize.data' && troncaData ? n - 5 : n, 1);
  return new Response(corpo, { status: 200 });          // il Response di node ha body a flusso, come il browser
};
/* script iniettati: li «eseguo» io leggendo il blob */
const elementi = [];
globalThis.document = { head: { appendChild: (s) => { setImmediate(async () => { try { const b = resolveObjectURL(s.src); vm.runInThisContext(await b.text()); s.onload(); } catch (e) { s.errore = e; s.onerror(); } }); } }, createElement: () => { const s = {}; elementi.push(s); return s; } };
globalThis.window = globalThis;
/* onnxruntime e fonemizzatore finti */
const fedi = [];
globalThis.__ortFinto = {
  env: { wasm: {} },
  Tensor: class { constructor(tipo, dati, forma) { this.tipo = tipo; this.dati = dati; this.forma = forma; } },
  InferenceSession: { create: async (buf, opz) => { globalThis.__sessioniCreate = (globalThis.__sessioniCreate || 0) + 1; return { release() { globalThis.__rilasciate = (globalThis.__rilasciate || 0) + 1; }, run: async (f) => { fedi.push(f); return { output: { data: new Float32Array(2205).fill(0.5) } }; } }; } }
};
let ultimiArgomenti = null;
globalThis.__fonFinto = (opz) => Promise.resolve({ callMain: (args) => { ultimiArgomenti = args; JSON.parse(args[3]).forEach((x, i) => opz.print(JSON.stringify({ phoneme_ids: [1, 2 + i, 3] }))); } });

/* 3. caricamento del file e interfaccia */
vm.runInThisContext(sorgente, { filename: file });
const P = globalThis.VociLocali && globalThis.VociLocali.piper;
prova('window.VociLocali.piper esiste', !!P);
for (const f of ['mb', 'pronta', 'scarica', 'parla', 'libera']) prova('funzione ' + f, typeof P[f] === 'function');
prova('voci: lista di coppie', Array.isArray(P.voci) && P.voci.length >= 2 && P.voci.every((c) => Array.isArray(c) && c.length === 2 && c[0].startsWith('piper:') && typeof c[1] === 'string'));
prova('voci: paola e riccardo', P.voci.some((c) => c[0] === 'piper:paola') && P.voci.some((c) => c[0] === 'piper:riccardo'));
const mbPrima = P.mb('piper:paola');
prova('mb(paola) ≈ 93 MB con i programmi', mbPrima >= 90 && mbPrima <= 96);
prova('mb(riccardo) più piccolo', P.mb('piper:riccardo') < mbPrima);
prova('voce sconosciuta rifiutata', await P.scarica('piper:zzz').then(() => false, () => true));

/* 4. niente scaricata → pronta falso, parla rifiuta */
prova('pronta prima dello scarico = false', (await P.pronta('piper:riccardo')) === false);
prova('parla senza voce scaricata rifiuta', await P.parla('Ciao', 'piper:riccardo').then(() => false, (e) => /scarica/i.test(e.message)));

/* 5. scarico con riserva unpkg (jsdelivr bloccato) e avanzamento */
bloccaJsdelivr = true;
const passi = [];
await P.scarica('piper:riccardo', (x) => passi.push(x));
prova('scarico riuscito con jsdelivr bloccato (usa unpkg)', await P.pronta('piper:riccardo'));
prova('avanzamento: sempre fra 0 e 1', passi.every((x) => x >= 0 && x <= 1));
prova('avanzamento: parte da 0 e finisce a 1', passi[0] === 0 && passi[passi.length - 1] === 1);
prova('avanzamento: mai all\'indietro', passi.every((x, i) => i === 0 || x >= passi[i - 1] - 1e-9));
prova('avanzamento: chiamato spesso', passi.length > 10);
prova('unpkg usato', richieste.some((u) => u.startsWith('https://unpkg.com/')));
const chiavi = [...archivio.keys()];
prova('in cache con chiave jsdelivr/HF', chiavi.some((k) => k.startsWith('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/')) && chiavi.some((k) => k.startsWith('https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/riccardo/')));
prova('7 file in cache (2 voce + 5 programmi)', archivio.size === 7);
prova('mb dopo: programmi già nel telefono (paola ≈ 64)', P.mb('piper:paola') < 70);

/* 6. secondo scarico: niente rete (già tutto) */
richieste = [];
await P.scarica('piper:riccardo', () => {});
prova('già scaricata: nessuna richiesta di rete', richieste.length === 0);

/* 7. file incompleto non entra in cache e dà errore chiaro */
archivio.delete([...archivio.keys()].find((k) => k.endsWith('piper_phonemize.data')));
troncaData = true; bloccaJsdelivr = false;
const prima = archivio.size;
prova('file troncato → errore', await P.scarica('piper:riccardo', () => {}).then(() => false, (e) => /Scaricamento non riuscito/.test(e.message)));
prova('file troncato non salvato', archivio.size === prima && (await P.pronta('piper:riccardo')) === false);
troncaData = false;
await P.scarica('piper:riccardo', () => {});
prova('ripresa dopo errore: scaricata', await P.pronta('piper:riccardo'));

/* 8. due scarichi insieme = uno solo */
richieste = [];
archivio.delete([...archivio.keys()].find((k) => k.endsWith('it_IT-riccardo-x_low.onnx.json')));
await Promise.all([P.scarica('piper:riccardo'), P.scarica('piper:riccardo')]);
prova('scarichi doppi uniti (una sola richiesta del json)', richieste.filter((u) => u.endsWith('.onnx.json')).length === 1);

/* 9. parla(): giro completo con finti */
const testoLungo = 'Buongiorno Monica, oggi il menù è questo: lasagne al forno e tiramisù. ' + 'Ordina entro le dieci! '.repeat(8) + '🍝 Grazie e a presto.';
const wav = await P.parla(testoLungo, 'piper:riccardo');
const buf = Buffer.from(await wav.arrayBuffer());
prova('parla restituisce un Blob wav', wav instanceof Blob && wav.type === 'audio/wav');
prova('intestazione RIFF/WAVE', buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WAVE' && buf.readUInt32LE(24) === 22050);
prova('wav con dati veri', buf.length > 44 + 2205 * 2 && buf.readUInt32LE(40) === buf.length - 44);
prova('frasi → più pezzi al fonemizzatore', JSON.parse(ultimiArgomenti[3]).length >= 2 && JSON.parse(ultimiArgomenti[3]).every((x) => x.text.length <= 220));
prova('testo ≤ 300 caratteri, emoji tolta', JSON.parse(ultimiArgomenti[3]).map((x) => x.text).join(' ').length <= 300 && !/🍝/u.test(ultimiArgomenti[3]));
prova('lingua espeak dal modello (it)', ultimiArgomenti[0] === '-l' && ultimiArgomenti[1] === 'it');
const f0 = fedi[0];
prova('tensori int64 con BigInt', f0.input.tipo === 'int64' && f0.input.dati instanceof BigInt64Array && f0.input_lengths.dati[0] === 3n && f0.scales.dati.length === 3);
prova('una riga di audio per pezzo', fedi.length === JSON.parse(ultimiArgomenti[3]).length);
prova('ort configurato: un filo in un Web Worker (C83), wasm dalla cache', globalThis.ort.env.wasm.numThreads === 1 && globalThis.ort.env.wasm.proxy === true && String(globalThis.ort.env.wasm.wasmPaths['ort-wasm-simd.wasm']).startsWith('blob:'));
await P.parla('Ciao!', 'piper:riccardo');
prova('sessione riusata (creata una volta)', globalThis.__sessioniCreate === 1);
prova('testo vuoto rifiutato', await P.parla('   🍝  ', 'piper:riccardo').then(() => false, (e) => /Niente/.test(e.message)));
P.libera();
prova('libera rilascia la sessione', globalThis.__rilasciate === 1);
await P.parla('Ciao ancora', 'piper:riccardo');
prova('dopo libera la sessione si ricrea', globalThis.__sessioniCreate === 2);

/* 10. cache senza Cache Storage → errore, non crash */
const salvata = globalThis.caches; globalThis.caches = undefined;
prova('senza Cache Storage: pronta=false', (await P.pronta('piper:paola')) === false);
globalThis.caches = salvata;

console.log(ok + ' OK, ' + no + ' NO');
process.exit(no ? 1 : 0);
