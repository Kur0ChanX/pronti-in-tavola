# Standard fisso dell'ascolto (C108) · studio di Voce 6, rivisto da Voce 7 (09/11/2026)

Mario 09/11 ~20:50: «vai di consiglio» (niente motore sul telefono) + «uno standard di qualità fisso, buono… non voglio che finiscano i limiti… studiatela».

## Oggi (v0.9.86)
Ogni frase va INSIEME a Groq `whisper-large-v3` e a Cloudflare `whisper-large-v3-turbo`, poi il correttore (Groq `qwen3.8-27b`, riserva `gpt-oss-120b`). Tetto del server: `TETTO_ASCOLTO` 400 frasi al giorno in tutto → oltre, il cliente legge «Per oggi ho ascoltato tanto: scrivimi la frase» (= interruzione, contro C108 e PT E41).

## Dati (ricerca 09/11/2026, fonti ufficiali)
| Servizio | Qualità | Gratis | A pagamento | Fonte |
|---|---|---|---|---|
| Groq `whisper-large-v3` | la migliore di Whisper | 2.000 frasi/giorno, 28.800 s audio/giorno, 20 al minuto | 0,111 $/ora, minimo 10 s a frase → ~0,0003 $ a frase; tetto di spesa e avvisi email | https://console.groq.com/docs/rate-limits · https://console.groq.com/docs/spend-limits |
| Cloudflare `whisper-large-v3-turbo` | poco sotto | 10.000 neuroni/giorno CONDIVISI con l'aiutante (Monica e clienti: `TETTO_AI`, `TETTO_AIC`, prompt lunghi; `worker.js` passa già a Groq quando i neuroni finiscono) | Workers Paid 5 $/mese + 0,011 $ ogni 1.000 neuroni | https://developers.cloudflare.com/workers-ai/platform/pricing/ |
| Deepgram Nova-3 (monolingua, italiano) | buona sulla carta, **da provare con frasi vere** | 200 $ di credito una volta, senza carta, senza scadenza | 0,0043 $/min, a secondi, nessun minimo | https://deepgram.com/pricing · https://developers.deepgram.com/docs/create-additional-api-keys |
| Mistral Voxtral Mini Transcribe 3 | la migliore sulla carta (FLEURS) | **niente di sicuro**: il credito Free di 10 $/mese è sparito il 07/10/2026; due pagine ufficiali di Mistral si contraddicono sull'uso gratis delle chiavi; modello «Public Preview» | 0,0035 $/min | https://docs.mistral.ai/inference/pricing · https://docs.mistral.ai/admin/billing-usage/usage-limits |
| OpenAI gpt-4o-transcribe | ottima | nessuno | 0,006 $/min | https://developers.openai.com/api/docs/pricing |
Cambio BCE 09/11/2026: 1 € = 1,1193 $ (https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html).

## Occhio critico (Voce 7)
- Il punto debole vero è il SECONDO motore: Cloudflare divide i neuroni con l'aiutante, nei giorni pieni finiscono e resta un motore solo (qualità che cambia = non «fissa»). Misura esatta dei neuroni dell'aiutante: solo dal pannello di Cloudflare (non abbiamo un contatore dei neuroni); il codice lo dà già per probabile (`finiti()` → Groq).
- Neuroni dell'aiutante (calcolo dal codice × tariffe ufficiali, 09/11/2026; MISURA vera solo dal pannello Workers AI di Cloudflare, dove noi non entriamo): `qwen3.8-27b` = 40.909 neuroni per milione di parole-pezzo («token») in entrata, 290.909 in uscita. Una domanda di Monica: istruzioni 6.902 caratteri + DATI (fino a 80 ordini, impostazioni) ≈ 3.500-7.000 token in entrata + 300-600 in uscita ≈ **250-450 neuroni**; di un cliente (istruzioni 2.321 caratteri) ≈ 100-200. Una frase ascoltata da Cloudflare (5 s × 46,63 al minuto) ≈ **4 neuroni**. → ~25-40 domande di Monica svuotano i 10.000 del giorno (si riempiono all'1 di notte, ora italiana). Con la strada 1: contatore dei neuroni nella scheda «Solo per te, Mario» (da `usage` delle risposte × tariffe), così diventa una misura ogni giorno.
- Voxtral esce dalla catena gratuita (vedi tabella). Resta un'idea a pagamento.
- Deepgram come secondo motore fisso: 200 $ a 0,0043 $/min, frase media 5 s (stima) → ~0,00036 $ a frase → ~550.000 frasi.
- Il tetto di 400 frasi al giorno blocca tutti: con qualunque scelta diventa un avviso a chi gestisce (stessa `segnala()` della Principale, C109), mai un blocco. Il tetto PER CLIENTE (`TETTO_ASCOLTO_CLIENTE`) aspetta la risposta di C109.

## Conti (stime, frase media 5 s, 30 giorni)
| Frasi al giorno | Strada 1: dura il credito Deepgram | Strada 1 dopo il credito | Strada 2: Groq a pagamento |
|---|---|---|---|
| 50 | ~30 anni | ~0,48 €/mese | ~0,41 €/mese |
| 200 | ~7 anni | ~1,92 €/mese | ~1,65 €/mese |
| 1.000 | ~1 anno e mezzo | ~9,60 €/mese | ~8,26 €/mese |

## Strade proposte a Mario (🛑 soldi, 09/11 Voce 7)
1. **Consiglio · salvadanai separati + due motori forti, 0 €** (Mario ~21:10 «non si possono avere Monica e me dei limiti e i clienti altri?»): Monica e Mario tengono TUTTO Cloudflare (aiutante, 10.000 neuroni ≈ 25-40 domande; finito → ponte Groq come oggi). I clienti passano a Groq + Deepgram: ascolto Groq v3 + Deepgram Nova-3 insieme, il correttore sceglie (riserve Groq turbo, Cloudflare solo per ultima); aiutante dei clienti su Groq `qwen3.8-27b` → `gpt-oss-120b` → `gpt-oss-20b` (gratis: 1.000 richieste e 200.000 token al giorno PER MODELLO, 8.000 token al minuto; domanda di un cliente ~2.000-3.000 token → ~70-100 domande al giorno per modello, ~200-300 coi tre; https://console.groq.com/docs/rate-limits, 09/11/2026). L'aiutante dei clienti è zona della Principale (avvisata 09/11). Mai «ho ascoltato tanto»: oltre l'80% di un limite, avviso a chi gestisce. Serve un account Deepgram (senza carta) e la chiave nei segreti di GitHub.
2. **Groq a pagamento con tetto di spesa** (carta), Cloudflare resta il secondo: stesso Groq sempre, nessun account nuovo; il secondo motore resta debole.
3. **Lascio così** (Groq + Cloudflare) e tolgo solo il blocco a 400.
Scartate: server su un PC di Mario (acceso sempre, più guasti); Voxtral gratis (non c'è più).

## Da fare dopo la scelta
- Codice in `ascolta.mjs` (motori in parallelo + riserve in ordine), `worker.js` solo `/api/ascolta` e `contaAscolto` (avviso, niente blocco), `.github/workflows/sito.yml` (segreto `DEEPGRAM_API_KEY` come `GROQ_API_KEY`), prova `tools/prova-ascolta.mjs` col server finto per ogni riserva; con la chiave: 5-10 frasi vere a confronto Groq / Deepgram / Cloudflare prima di decidere il secondo fisso.
- Chiavi nuove SOLO nei segreti di GitHub (diventano segreti del Worker): mai in chat né nel repo.
- (Voce 10, 09/11/2026, developers.deepgram.com/trust-security/your-data e changelog 05/03/2026) Privacy: Deepgram di base conserva l'audio e lo usa per addestrare (Model Improvement Program); `mip_opt_out=true` a ogni richiesta = zero conservazione, stesso prezzo. Endpoint UE `api.eu.deepgram.com`.
