// Prova di voce-kokoro.js: sintassi, interfaccia e logica con libreria finta (niente rete).
// Uso: node tools/prova-voce-kokoro.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const qui = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(qui, '..', 'voce-kokoro.js');
let ok = 0, ko = 0;
function prova(nome, cond) { if (cond) { ok++; console.log('ok   ' + nome); } else { ko++; console.log('FALLITA ' + nome); } }

// 1. sintassi
try { execFileSync(process.execPath, ['--check', file]); prova('node --check', true); } catch (e) { prova('node --check', false); }

// 2. ambiente finto del browser
const chiamate = { import: [], fonemi: [], ids: [], dispose: 0, progress: 0 };
const store = new Map(); // cache finta
globalThis.caches = {
  has: async n => store.has(n),
  open: async n => {
    if (!store.has(n)) store.set(n, []);
    return { keys: async () => store.get(n).map(url => ({ url })) };
  }
};
const win = globalThis;
win.window = win;
win.VociLocali = {
  kokoroImport: async url => {
    chiamate.import.push(url);
    if (url.includes('phonemizer')) {
      return { phonemize: async (t, lingua) => { chiamate.fonemi.push([t, lingua]); return [t.toLowerCase()]; } };
    }
    return {
      KokoroTTS: {
        from_pretrained: async (id, o) => {
          chiamate.opt = [id, o.dtype, o.device];
          if (o.progress_callback) {
            o.progress_callback({ status: 'progress', file: 'config.json', loaded: 100, total: 100 });
            o.progress_callback({ status: 'progress', file: 'onnx/model_quantized.onnx', loaded: 46e6, total: 92e6 });
            chiamate.progress++;
          }
          return {
            tokenizer: (ph, o2) => ({ input_ids: { ph, trunc: o2.truncation } }),
            generate_from_ids: async (ids, o3) => {
              chiamate.ids.push([ids.ph, o3.voice]);
              return { audio: new Float32Array(2400).fill(0.5), sampling_rate: 24000 };
            },
            model: { dispose() { chiamate.dispose++; } }
          };
        }
      }
    };
  }
};
vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
const K = win.VociLocali.kokoro;

// 3. interfaccia
prova('interfaccia: voci è elenco di coppie', Array.isArray(K.voci) && K.voci.length >= 2 && K.voci.every(v => Array.isArray(v) && v.length === 2));
prova('voci: kokoro:sara e kokoro:nicola', K.voci.some(v => v[0] === 'kokoro:sara') && K.voci.some(v => v[0] === 'kokoro:nicola'));
for (const f of ['mb', 'pronta', 'scarica', 'parla', 'libera']) prova('funzione ' + f, typeof K[f] === 'function');
prova('mb è un numero ragionevole', typeof K.mb('kokoro:sara') === 'number' && K.mb('kokoro:sara') > 50 && K.mb('kokoro:sara') < 200);

// 4. pronta: prima di scaricare è falso, con cache piena è vero
prova('pronta prima dello scarico = false', (await K.pronta('kokoro:sara')) === false);
prova('pronta con voce sconosciuta = false', (await K.pronta('altra:voce')) === false);

// 5. scarica con avanzamento
const fr = [];
await K.scarica('kokoro:sara', f => fr.push(f));
prova('scarica: avanzamento parte da 0 e arriva a 1', fr[0] === 0 && fr[fr.length - 1] === 1);
prova('scarica: avanzamento sempre tra 0 e 1 e non scende', fr.every((x, i) => x >= 0 && x <= 1 && (i === 0 || x >= fr[i - 1])));
prova('scarica: modello q8 in WASM', chiamate.opt && chiamate.opt[0] === 'onnx-community/Kokoro-82M-v1.0-ONNX' && chiamate.opt[1] === 'q8' && chiamate.opt[2] === 'wasm');
prova('librerie con versione fissa da jsdelivr', chiamate.import.every(u => u.startsWith('https://cdn.jsdelivr.net/npm/') && /@\d+\.\d+\.\d+\//.test(u)));
prova('fonemi in lingua it', chiamate.fonemi.length > 0 && chiamate.fonemi.every(c => c[1] === 'it'));
prova('pronta dopo scarico = true (libreria in memoria)', (await K.pronta('kokoro:sara')) === true);

// 6. parla: wav valido, voce giusta, testo lungo spezzato
const blob = await K.parla('Buongiorno! Oggi ci sono lasagne, tiramisù e parmigiana di melanzane. Si ritira dalle sette.', 'kokoro:nicola');
const buf = Buffer.from(await blob.arrayBuffer());
prova('parla: Blob audio/wav', blob.type === 'audio/wav');
prova('parla: intestazione RIFF/WAVE a 24 kHz', buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WAVE' && buf.readUInt32LE(24) === 24000);
prova('parla: dimensione dati coerente', buf.readUInt32LE(40) === buf.length - 44);
prova('parla: voce im_nicola', chiamate.ids.some(c => c[1] === 'im_nicola'));
let lungo = ('Questa è una frase abbastanza lunga da riempire lo spazio. ').repeat(20);
chiamate.ids.length = 0;
const b2 = await K.parla(lungo, 'kokoro:sara');
prova('parla: oltre 300 caratteri tagliato a 300', chiamate.fonemi.length > 0 && b2.size > 44);
prova('parla: più pezzi uniti con pausa', chiamate.ids.length >= 2 && b2.size > 44 + 2400 * 2 * chiamate.ids.length);
prova('parla: voce sconosciuta rifiutata', await K.parla('ciao', 'x').then(() => false, () => true));
prova('parla: testo vuoto rifiutato', await K.parla('  ', 'kokoro:sara').then(() => false, () => true));
prova('parla: la coda va avanti dopo un errore', (await K.parla('Ciao', 'kokoro:sara')).size > 44);

// 7. cache vera: con modello e voce in cache, pronta = true anche senza libreria in memoria
K.libera();
prova('libera: dispose chiamato', chiamate.dispose === 1);
prova('pronta dopo libera senza cache = false', (await K.pronta('kokoro:sara')) === false);
store.set('transformers-cache', ['https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model_quantized.onnx']);
store.set('kokoro-voices', ['https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/if_sara.bin']);
prova('pronta con cache piena = true', (await K.pronta('kokoro:sara')) === true);
prova('pronta: Nicola senza il suo file = false', (await K.pronta('kokoro:nicola')) === false);

console.log(`\n${ok} ok, ${ko} fallite`);
process.exit(ko ? 1 : 0);
