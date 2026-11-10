# C119 · «✨ Migliora con l'AI» nello zoom delle foto piccole (piano, Principale 39, 10/11)

Mario 10/11 01:56: «ia delle foto sembra ok implementala nell'app» (= scelta 1: tasto nello zoom).

## Fatti provati (10/11)
- Modello: Real-ESRGAN general x4v3, ONNX fp32, 4.866.417 byte, SHA-256 `1940a93ee08283a0…`, BSD-3. Fonte: https://huggingface.co/CoderViking/realesr-general-x4v3-onnx/resolve/main/realesr-general-x4v3.onnx — ingresso `[1,3,H,W]` float 0-1 RGB, uscita `[1,3,4H,4W]` NON limitata (clamp 0-1).
- Motore: onnxruntime-web 1.31.1, build solo wasm (`ort.wasm.min.js` 54 KB + `ort-wasm-simd-threaded.wasm` 14,8 MB), 1 filo (il sito non è «cross-origin isolated»). jsdelivr risponde 200.
- Tempi: 220×170 → 880×680 in ~2,6 s qui; con la CPU rallentata ×4 ~12 s (stima telefono 3-12 s). Script di prova: `prova-sr.js` nello scratchpad della #39 (non nel repo): rifarlo se serve.
- Le foto di GZ NON hanno `Access-Control-Allow-Origin`: il canvas si «sporca» e non si leggono i pixel → serve un passaggio dal nostro server.
- HF rifiuta richieste da *.workers.dev (PT E25): il modello va servito dal NOSTRO sito.

## Come (da fare)
1. `worker.js`: `GET /api/foto-gz?u=<url>` solo per `^https://www\.giallozafferano\.it/images/[\w./%-]+\.(jpe?g|png|webp)$`, fetch con `UA_GZ`, massimo ~3 MB, `caches.default`, `cache-control: public, max-age=2592000`. Mai un passaggio aperto ad altri siti.
2. `foto-ai-worker.js` (Web Worker, stessa origine): `importScripts` di `ort.wasm.min.js` da jsdelivr (versione fissa), `ort.env.wasm.wasmPaths` = cartella dist su jsdelivr, `numThreads = 1`; sessione da `media/ai/realesr-general-x4v3.onnx` (o percorso simile servito dal sito); messaggio `{ u, n, j }` → fetch `/api/foto-gz?u=`, `createImageBitmap`, taglio j-esimo della striscia (larghezza/n), modello, `OffscreenCanvas.convertToBlob('image/jpeg', 0.92)` → risposta.
3. `foto-ai.js` (pagina): avvia il worker una volta, `FotoAI.migliora(u, n, j)` → URL della foto migliorata; tiene i risultati nella Cache API (`pit-foto-ai`) così la seconda volta è subito.
4. `ricettario.js` `'ric-zoom'` (~riga 780): sulle foto a strisce (`x.n`) tasto «✨ Migliora con l'AI» in basso; durante il lavoro «✨ Miglioro la foto… (pochi secondi)»; fatto → al posto di `.ric-zoom-taglio` la foto grande (larga fino a tutto lo schermo) e «✨ Migliorata con l'AI»; errore → «Non è riuscito (motivo): riprova». Dopo il primo uso (`localStorage` `pit-foto-ai`) le altre foto a strisce si migliorano da sole. Se l'utente cambia foto mentre lavora, il risultato vale solo per la sua foto.
5. `style.css` per tasto e foto; file nuovi in `FILE_APP` di `tools/sito.py`, nel `GUSCIO` di `sw.js` e in `tools/anteprima.py` (PT E38); il modello `.onnx`: `sito.py` oggi copia solo media png/jpg/webp/svg/ico → aggiungere.
6. Aiutante (regola del prodotto): voce in `aiutante.js` (`VOCI`) e GUIDA in `worker.js` («foto sgranate / migliora foto» → spiega dove si tocca).
7. Prove: `tools/prova-database.mjs` (endpoint: GZ sì, altro sito 400); `tools/prova.js` (lo zoom di una striscia mostra il tasto); dopo il push, prova VERA dal sito pubblicato (Playwright: Astice passo 3 → tasto → foto 880×680) e foto prima/dopo a Mario.
8. Novità: versione nuova (dopo 0.9.99 → `0.10.0`), «Nuovo: ✨ Migliora con l'AI…».

## Fatto (Principale 40, 10/11)
v0.10.0: tutti i punti 1-8. Differenze dal piano: onnxruntime-web **1.18.0** (lo stesso di Paola, stessa memoria `voci-modelli`: niente doppio scarico) al posto della 1.31.1; Web Worker creato da un Blob dentro `foto-ai.js` (niente file in più); `/api/foto-gz` è **POST** con l'accesso di chi gestisce (tutte le rotte sono POST; niente passaggio aperto al mondo); modello in `media/realesr-x4v3.onnx`; `sw.js` non tiene il `.onnx` (ci pensa `foto-ai.js`). Provato nel contenitore: 880×680 in ~3,6 s la prima volta, subito la seconda.
