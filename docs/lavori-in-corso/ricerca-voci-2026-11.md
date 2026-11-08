# Ricerca voci italiane nel browser · 08/11/2026

Solo ricerca, nessun codice dell'app toccato. Distinguo sempre PROVATO (eseguito qui) e LETTO (solo pagine/schede).
Limite del contenitore: github.com (pagine web) e le release GitHub danno 403; invece Hugging Face (API e file), raw.githubusercontent.com, npm e `git clone` di GitHub funzionano. Non ho potuto aprire Chrome su telefono né ASCOLTARE l'audio: la qualità vocale NON è giudicata da me.

## 1. Candidati

| Candidato | Italiano? | Nel browser del telefono? | Peso | Licenza (codice / voce) | Stato |
|---|---|---|---|---|---|
| **Supertonic 3** (Supertone) | SI, `it`, 31 lingue; WER italiano 1,75 (letto, README) | Esempio ufficiale `web/` con onnxruntime-web, WebGPU con ripiego WASM (letto) | ~398 MB fp32: vector_estimator 257, vocoder 101, text_encoder 36, duration 4 (misurato dai file) | Codice MIT; pesi OpenRAIL-M (uso commerciale ammesso con restrizioni d'uso, da leggere) | Repo ufficiale ARCHIVIATO (README: nessun aggiornamento), pesi del 18/05/2026 |
| **Kokoro 82M v1.0** (Italiano: if_sara, im_nicola) | SI, ma voti scheda: qualità C (letto) | Pesi ONNX q8 88 MB ok; manca il fonemizzatore italiano nel browser (già scartato: kokoro-js "Invalid language identifier it"). Serve espeak-ng in WASM a parte | 88 MB (model_quantized) + 0,5 MB per voce | Apache-2.0 | Provato in Python, vedi sotto |
| **Piper serena-high** (it_IT) | SI | SI, stesso motore di oggi (voce-piper.js) | 114 MB | Dati CC-BY-4.0; dataset "serena-synthetic-it-27h" = SINTETICO (voce generata da altra IA) | Letto; NON provato, ma è la sostituzione più facile |
| Piper paola-medium (attuale) / riccardo x_low | SI | SI | ~63 MB / piccolo | dataset "See URL" (paola): licenza da verificare | in uso |
| **OmniVoice** (k2-fsa, è il motore di VoiceStudio) | SI (600+ lingue, clonazione voce) | Esiste `onnx-community/OmniVoice-Onnx` (ago 2026, Apache-2.0): int4 ~365 MB solo LLM + tokenizzatore audio ~700 MB (fp32) | oltre 1 GB totale | Codice Apache-2.0; pesi originali: licenza non dichiarata nella pagina | Troppo pesante per telefono; nessun demo browser trovato |
| **Chatterbox multilingual** (Resemble) | SI (23 lingue) | Build ONNX per WebGPU/Transformers.js; q4 ~790 MB-1,6 GB, richiede WebGPU e ~8 GB RAM, "non usabile su CPU" (letto, fonti terze) | 0,8-1,6 GB | MIT | Escluso per telefono |
| Kitten TTS | solo inglese | - | piccolo | - | escluso (non verificato a fondo) |
| MeloTTS | nessun italiano (da memoria, non ricercato) | - | - | - | escluso |
| sherpa-onnx WASM | motore ok (npm 2.0.1, 26/10/2026, Apache-2.0) | Demo WASM ufficiali solo Piper en/de, Matcha zh/en (README letto); nessun Matcha italiano trovato | - | Apache-2.0 | Serve solo come contenitore di Piper/Kokoro, non migliora la voce |

## 2. VoiceStudio (debpalash/VoiceStudio) · letto
- Motore predefinito: **k2-fsa/OmniVoice** (poi "dozzine" di altri nel Model Manager); STT whisper.cpp. Licenza app AGPL-3.0 (più versione Pro chiusa).
- Nessuna versione web/WASM: app desktop (Win/Mac/Linux) + Docker su localhost:3900 con chiave API; Android 10+/iOS in "anteprima".
- Il motore sotto (OmniVoice) in teoria ha un export ONNX, ma pesa oltre 1 GB: non adatto al browser del telefono. Conferma: scarto giusto.

## 3. Prove eseguite (PROVATE)
Frase: "Metti la pasta nell'acqua bollente e mescola per due minuti." File in `docs/lavori-in-corso/voci-prova/`:
- `supertonic3-F1-it.wav`, `supertonic3-M1-it.wav` (384 KB): modelli veri scaricati da Hugging Face, esempio Node ufficiale con onnxruntime-node, `--lang it`, 5 passi. Sintesi in 0,6-0,8 s di CPU server per ~4 s di audio (NON è il telefono).
- `kokoro-if_sara-it.wav` (180 KB), `kokoro-im_nicola-it.wav` (198 KB): pesi ONNX q8 di onnx-community con onnxruntime Python; fonemi italiani da espeak-ng (libreria `espeakng-loader`, tramite ctypes): "mˈetːɪ la pˈasta nellˈakːwa bollˈɛnte..." Sintesi 3,6-4 s per ~4 s di audio su CPU server (Kokoro q8 più lento di Supertonic).
- Non provato: Piper serena-high, qualunque prova su Chrome/Android, WebGPU, consumo RAM sul telefono, ascolto.
- Nota: i fonemi italiani di Kokoro li ho ottenuti con una libreria nativa; nel browser servirebbe espeak-ng compilato in WASM (non provato). Il WAV di Kokoro usa una mia semplificazione (niente post-correzioni di misaki): potrebbe suonare un po' peggio di Kokoro "vero".

## 4. Classifica
1. **Supertonic 3** (motivo: unico con italiano nativo, esempio browser ufficiale WebGPU/WASM, solo ONNX senza fonemizzatore, veloce, voci pulite). Rischi: ~400 MB da scaricare una volta (pesante per cache PWA e Android economici; quantizzazioni/fp16 trovate solo per Supertonic 2, `rapidrabbit76/supertonic-2-web`); repo archiviato (nessun aggiornamento); OpenRAIL-M da leggere per l'uso commerciale; WebGPU non su tutti i telefoni, il ripiego WASM è più lento (non misurato). Per integrare: copiare `web/` (helper + ONNX), servire i 4 ONNX con cache (Cache API), caricare le voci JSON F/M, inserire tutto in un worker, stima prova su un vero telefono per tempi e memoria.
2. **Piper serena-high** (motivo: stessa tecnologia già integrata, solo cambio file da 114 MB, rischio quasi zero). Rischi: dati sintetici, non garantisce un salto di qualità vero; da ascoltare. Per integrare: cambiare URL modello e json in voce-piper.js.
3. **Kokoro italiano (if_sara/im_nicola) + espeak-ng WASM** (motivo: 88 MB, Apache-2.0). Rischi: scheda dà qualità C per l'italiano, serve fonemizzatore WASM da integrare (via sherpa-onnx WASM con espeak-ng-data o pacchetto espeak WASM, non provati), già deluso una volta. Per integrare: espeak-ng WASM + tokenizzazione (vocabolario di tokenizer.json) + onnxruntime-web.

## Fonti principali (lette 08/11/2026)
- https://huggingface.co/Supertone/supertonic-3 (pesi 18/05/2026, openrail) e README di github.com/supertone-inc/supertonic (Supertonic 3 del 29/04/2026, archiviato)
- https://huggingface.co/rhasspy/piper-voices (it_IT: paola medium, riccardo x_low, serena high+medium)
- https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- https://huggingface.co/onnx-community/OmniVoice-Onnx, https://github.com/k2-fsa/OmniVoice, https://github.com/debpalash/VoiceStudio
- https://huggingface.co/onnx-community/chatterbox-multilingual-ONNX
- https://raw.githubusercontent.com/k2-fsa/sherpa-onnx/master/README.md ; npm sherpa-onnx 2.0.1 (26/10/2026)
