# Standard fisso dell'ascolto (C108) · studio di Voce 6, 09/11/2026

Mario 09/11 ~20:50: «vai di consiglio» (niente motore sul telefono) + «uno standard di qualità fisso, buono… non voglio che finiscano i limiti… studiatela».

## Oggi (v0.9.85)
Ogni frase va INSIEME a Groq `whisper-large-v3` e a Cloudflare `whisper-large-v3-turbo`, poi il correttore (Groq `qwen3.8-27b`, riserva `gpt-oss-120b`). Tetto del server: `TETTO_ASCOLTO` 400 frasi al giorno in tutto.

## Dati (ricerca 09/11/2026, fonti ufficiali)
| Servizio | Qualità | Gratis | A pagamento | Fonte |
|---|---|---|---|---|
| Groq `whisper-large-v3` | la migliore di Whisper (WER 8,4% frasi corte) | 2.000 frasi/giorno, 28.800 s audio/giorno, 20 al minuto | 0,111 $/ora, minimo 10 s a frase → ~0,0003 $ a frase; piano Developer con **tetto di spesa** e avvisi email | https://console.groq.com/docs/rate-limits · https://console.groq.com/docs/speech-to-text · https://console.groq.com/docs/spend-limits |
| Cloudflare `whisper-large-v3-turbo` | poco sotto (WER ~12%) | 10.000 neuroni/giorno CONDIVISI con l'aiutante (46,6 neuroni al minuto di audio → ~200 min se solo ascolto) | Workers Paid 5 $/mese + 0,011 $ ogni 1.000 neuroni | https://developers.cloudflare.com/workers-ai/platform/pricing/ |
| Mistral Voxtral Mini Transcribe 2/3 | ~4% WER su FLEURS, italiano sì (13 lingue) | piano Free con credito mensile (importo non più scritto dal 07/10/2026) | 0,003-0,0035 $/min | https://mistral.ai/news/voxtral-transcribe-2 · https://docs.mistral.ai/inference/pricing |
| Deepgram Nova-3 | buona, italiano sì | 200 $ di credito senza scadenza, senza carta | 0,0043 $/min (registrato) | https://deepgram.com/pricing |
| OpenAI gpt-4o-transcribe / gpt-transcribe | ottima | nessuno | 0,006 / 0,0045 $/min | https://developers.openai.com/api/docs/pricing |

## Conti (stime, frase media 5 s, Groq fattura 10 s)
| Frasi al giorno | Groq a pagamento al mese | Voxtral al mese |
|---|---|---|
| 50 | ~0,45 $ | ~0,40 $ |
| 200 | ~1,85 $ | ~1,50 $ |
| 1.000 | ~9 $ | ~7,50 $ |
Con il gratuito di Groq (2.000/giorno) i limiti finiscono solo oltre ~2.000 frasi al giorno: per Monica (decine di frasi) quasi impossibile. Il punto debole vero è Cloudflare, che divide i 10.000 neuroni con l'aiutante.

## Strade da proporre a Mario (🛑 soldi) — bozza
1. **Catena gratuita a tre (consiglio)**: Groq v3 → Voxtral (credito Free) → Deepgram Nova-3 (200 $), tutte di alto livello; Cloudflare turbo solo come ultima. Contatori giornalieri dagli header di Groq (`x-ratelimit-remaining-*`) e avviso nell'app a chi gestisce all'80%. Costo 0 €; serve che Mario crei 2 chiavi (Mistral, Deepgram) → guida passo passo con «A cosa serve».
2. **Groq a pagamento con tetto di spesa** (es. 5 $/mese, avvisi al 50/75/90%): stesso modello sempre, niente limiti al giorno; serve una carta. ~0,5-2 € al mese all'uso di Monica.
3. **Server proprio** (Whisper large-v3 su un PC con scheda video di Mario): gratis a frase ma il PC deve restare acceso e collegato; più guasti possibili. Sconsigliato.

## Da fare dopo la scelta
- Codice in `ascolta.mjs` (catena con riserve in ordine, contatori), `worker.js` solo `/api/ascolta` e `/api/conto-ai`, prova `tools/prova-ascolta.mjs` col server finto per ogni riserva.
- Chiavi nuove SOLO nelle impostazioni segrete del Worker (mai in chat né nel repo).
