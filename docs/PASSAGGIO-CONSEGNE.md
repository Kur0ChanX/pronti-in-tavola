# Passaggio di consegne

Sessione attuale: #46 (dopo la #45 `session_01WTjqUx8FCK2e7jG9SRdRCo`, chiusa alla soglia 10/11 13:38; la apre la #45 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 13:40):** 1) la sua frase delle 13:40 sulle «fonti alternative… tasto manuale» (domanda 1/2/3 in «Aspetta Mario», consiglio 1 poi 2); 2) vedere la v0.10.8 (Proteiche: Pasti, Snack e dolci, ⚡, «🔍 Cerca ricette fit») e mandare 3 foto; 3) la chiave GitHub del kit; 4) Deepgram provato da lui su Android.

## Stato (10/11 13:42 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta. Scorte della #45 (`scorta-principale-20261110-01WTjqUx8F…`): solo documenti, NON unirle se `ricettario.js` contiene `cercaFitBox`.
- v0.10.10 ONLINE (Principale 46, 10/11 14:13, `VERSIONE_APP` letto dal sito vero): C126 pezzo 1, Proteiche per momenti (8) e «Cerca nuove ricette fit su tutti i siti». Prove: app 88 OK, database 145 OK. Prossimo: C126 pezzo 2 (fonte proteica facoltativa, tante voci, + Impostazioni), poi fonti (🛑 domanda a Mario).
- v0.10.9 (Principale 46, 10/11 13:55: `VERSIONE_APP` 0.10.9 e `ricettario.js` nuovo sul sito vero): C125 strada 2, la ricerca normale anche su RicetteFit; provata dal contenitore con GZ e RicetteFit veri (budino: 4 RicetteFit con foto + 15 GZ). Prove: app 88 OK, database 143 OK.
- v0.10.8 (controllata 13:34: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.8; `…/ricettario.js` contiene `cercaFitBox`). La parte del server (`{ db: 'cercaFit' }`) è nella stessa pubblicazione ma da qui NON è provabile (chiede l'accesso di chi gestisce): la prova è la foto di Mario dopo «🍮 Budino».
- C125 FATTO (v0.10.6-0.10.8, piano `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md`, tutti i 5 pezzi ✅). Manca solo la prova di Mario (riga in «Aspetta Mario»).
- Prove (10/11, Principale 45, sulla v0.10.8): app giro completo 87 OK, 0 NO; `node tools/prova-database.mjs` → 137 OK.
- Kit qui 35.0; il 37.2 aspetta la chiave di Mario (riga in «Aspetta Mario»). Preferenze ricevute v38 (più nuove del kit): si aggiorna col kit 37.2. CLAUDE.md ~1459 token (tetto 1000).

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- **Piano C124**: `docs/lavori-in-corso/c124-ricettario-proteico.md` (8 passi, tutti fatti). **Piano C125**: `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md` (5 pezzi).

## Sessione appena chiusa (#45)
- Avvio: v0.10.6 online controllata; scorta della #44 non unita (solo documenti, soglie già nel ramo).
- v0.10.7 (C125 pezzo 2): `ricettario.js` `sceltaFit` (🍽 Pasti, 🍫 Snack e dolci, ⚡ Pronte in N minuti = filtro `tempo`), `f.fit` nei filtri, uscendo da Proteiche si tolgono; `notaFit` con le due regole; `opzioni.js` `fitVeloci` (5-30, base 10); `worker.js` `FIT_BASE` +7 parole (provate dal vivo), `FIT_BASE_1` = base vecchia → se salvata uguale vale la nuova.
- v0.10.8 (pezzi 3-4): `worker.js` `{ db: 'cercaFit', q }` (GZ `urlCerca(q + ' light')`, RicetteFit dalla sitemap per radici delle parole, `inCodaPrima` con `aggiunta = 1`, turbo solo se fermo, max 40) · `ricettario.js` `cercaFitBox`, `cercaFit`, `aggiornaFit` (elenco riletto ogni 30 s per 5 minuti), invio e voce dentro Proteiche → `cercaFit`; `perFonte` (Proteiche, Database, motore). Prove: passi «C125» e «C125 cerca fit» in `tools/prova.js`, 7 prove «C125 cerca fit» in `tools/prova-database.mjs`.
- Pezzo 5: Melarossa, Fondazione Veronesi, Starget provati dal vivo: nessuno ha i valori per porzione → restano GZ e RicetteFit (scritto nel piano).
- Controllo Da fare: 1 voce aggiunta (riga in «Aspetta Mario» per il messaggio delle 13:40).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #45 (C125): Melarossa → NO per Proteiche (JSON-LD `Recipe` senza `nutrition`, solo calorie nel testo); Fondazione Veronesi → NO (senza valori, passi in un testo unico, ~16 ricette); Starget → NO (ricette caricate dal browser, piccola, `Content-Signal use=reference`). Ricerca del sito RicetteFit → NO (robots): le parole si cercano negli indirizzi della sitemap. Prove del database con `fetch` finto che risponde 404 a tutto → l'accesso di chi gestisce fallisce («non sei tra chi gestisce»): far passare a `prima(u, o)` gli indirizzi non dei siti.
- #44 (RicetteFit): foto dal JSON-LD → NO (ritagli da 500 px, PT E45): og:image + la sua serie srcset ≥ 1000 px. Ricerca del sito (`/?s=`) → NO (vietata nel loro robots.txt): l'elenco viene dalla sitemap. Il loro `transFatContent` è «Grassi insaturi» sul sito: non si usa. Ricette RicetteFit nella coda normale → NO (sarebbero rimaste dietro a GZ, e una fallita mai ripresa): una sola alla volta, in testa (`prendi` ordina RicetteFit prima).
- #44 (prove): `SOLO=… node tools/prova.js` con `timeout 110` si ferma prima della fine (il passo da solo ci mette ~2-3 minuti): lanciarlo in sottofondo.
- #44 (C125): Instagram e YouTube come fonti → NO (condizioni d'uso, niente formato ricetta; PT E25). Soglie fisse più alte per tutte → NO (taglierebbero snack e dolci proteici): due profili, pasto e snack.
- #43 (consegne): `tools/consegne.py fatti` lanciato DUE volte alza il numero di sessione due volte (#45 invece di #44): lanciarlo una volta sola; se serve rifarlo, rimettere a mano «Sessione attuale».
- #43 (prove): un dato di prova senza `v: 4` viene riletto anche da `rileggiSegnate` (C72): le ricette finte delle prove C124 hanno `v: 4`. `SOLO='novit…'` fa fallire «sviluppatore: 7 tocchi» (dipende dai passi prima): serve il giro completo.
- #43 (C124): rileggere i valori con `leggiGz` → NO (chiede anche la pagina del video): basta `paginaGz` + `gzSoloNutr`. Contare i valori con `json_type` su tutto il JSON a ogni `statoDb` → NO (lento): colonna `nutr`.
- #42 (C124): GymBeam come fonte → NO (ricette con le proteine in polvere del negozio). Proteine dal JSON-LD di GZ → NON ci sono: vanno lette dall'HTML (`gz-list-macros`). Chiave del kit su `api.github.com` → NO: lì il proxy usa già l'accesso GitHub della sessione (gh, ricerca); usare `raw.githubusercontent.com` con prefisso «token».
- #42 (C108): prova di Mario «guarda come cliente» → senza la v0.10.2 NON passava da Deepgram (il token è quello del gestore): mai chiedere quella prova su una versione più vecchia.
- #42 (prove): con `SOLO='voce dei clienti'` i passi che dipendono da quelli prima falliscono da soli (stato mancante): il passo nuovo è autonomo; per gli altri vale il giro completo.
- #41 (C123): far «sistemare» al motore le ricette segnate rileggendole → NO da solo: GZ le ridà uguali; serve l'esito salvato nella ricetta. Credito Deepgram «scade dopo un anno» → SBAGLIATO: non scade (PT E48).
- #40 (C119): onnxruntime 1.31.1 → NO, 1.18.0 come Paola. `/api/foto-gz` in GET → NO: rotte POST, solo chi gestisce. `window.Dati` → undefined: `typeof Dati`. Cache `pit-…` → NO, si chiama `foto-ai`.
- #39: `signInWithRedirect` di riserva → NO. AI foto: Swin2SR e Real-ESRGAN x4plus troppo grandi; modelli da Hugging Face → NO (PT E25).
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- C109 (#35): codice scritto PRIMA della scelta di Mario: messo in patch. Prima di codice su una regola nuova, controllare in «Aspetta Mario» se c'è una 🛑 sullo stesso numero.
- C106 (#35): niente `maximum-scale=1` fisso (toglierebbe lo zoom con due dita a tutti).
- C109 (#36): segnalazioni a tutti i gestori → NO, solo a Mario. Raffica e quota con blocco → NO, sempre «modo ridotto» (PT E41).
- C112 (#36): niente correzione automatica dei «pronti» presi da un ordine di prova: Monica tocca «È una prova» o annulla e i pronti tornano (`rimettiPronti`).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).

## Prossimi passi
1. Mario 13:40 «fonti alternative… tasto manuale»: 1 c'era già (v0.10.8), 2 fatto col consiglio (v0.10.9, Principale 46). Resta solo la domanda «vuoi anche 3 (più siti senza valori)?» in «Aspetta Mario»: aspettare la risposta.
2. Le 3 foto della v0.10.8 (riga in «Aspetta Mario»): se dopo «Budino» compare un errore, causa vera dalla foto (il messaggio dice il perché, PT E46).
3. Kit 37.2: quando Mario scrive «chiave pronta», `request_credential` (host `raw.githubusercontent.com`, prefisso `token`, nome «Kit RVC lettura»). Le altre righe di «Aspetta Mario»: aspettare Mario; iPad e iPhone solo quando ne ha uno.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (nuova: C125 fonti alternative 1/2/3, consiglio 1 poi 2).

## Ultimo messaggio di Mario
10/11 ~13:40, parola per parola: «intendo la ricerca che cerca nelle fonti alternative anche a giallozafferano le cerca e me ne carica un tasto manuale». Arrivato dopo il mio messaggio sulle fonti provate (Melarossa ecc. senza valori) e prima che provasse la v0.10.8.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C126; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

