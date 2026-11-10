# Passaggio di consegne

Sessione attuale: #45 (dopo la #44 `session_01WTjqUtY9GgqzGxG4dQ2KZe`, chiusa alla soglia 10/11 12:56; la apre la #44 con `create_session` (catena 2 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 12:56):** 1) C125: ricette fit più severe, «🔍 Cerca ricette fit» da tante fonti attendibili, ricette immediate (piano `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md`, «vai di consiglio»: decidi tu); 2) vedere la v0.10.5 (Proteiche + RicetteFit) e mandare le 3 foto (riga in «Aspetta Mario»); 3) la chiave GitHub del kit; 4) Deepgram provato da lui su Android.

## Stato (10/11 12:56 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta. Scorte della #44 (`scorta-principale-20261110-01WTjqUtY9Gg`): NON unirle se il codice delle soglie C125 è già nel ramo (vedi riga sotto).
- v0.10.5 ONLINE (controllato 12:50: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.5; `…/ricettario.js` contiene `URL_RF`; `…/sw.js` contiene `ricettefit`).
- C125 pezzo 1 (soglie a due profili, `opzioni.js` + `ricettario.js` `fitRic` → 'pasto' | 'snack' | false, `rigaFit` «· snack o dolce», prova nel passo «ricettario RicetteFit» di `tools/prova.js`): verifica con `git log -1 --format=%s -- opzioni.js` → se il messaggio parla di C125 è nel ramo; altrimenti il lavoro è nella scorta della #44 (unirla), poi giro completo e push. NON ancora online (resta v0.10.5): alla pubblicazione alzare a v0.10.6 con le novità.
- RicetteFit sul server: NON verificabile da qui (le letture del database chiedono l'accesso di chi gestisce). La prova è la foto di Mario della riga «📗 RicetteFit: N di 905 prese» nella pagina Database (riga in «Aspetta Mario»). Se N resta 0 dopo 1 ora: il server di Cloudflare non riesce a leggere ricettefit.it (ipotesi da provare, non certezza).
- Prove (10/11, Principale 44, sulla v0.10.5): app giro completo 85 OK, 0 NO; `node tools/prova-database.mjs` → 128 OK.
- Kit qui 35.0; il 37.2 aspetta la chiave di Mario (riga in «Aspetta Mario»). Preferenze ricevute v38 (più nuove del kit): si aggiorna col kit 37.2. CLAUDE.md ~1459 token (tetto 1000).

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- **Piano C124**: `docs/lavori-in-corso/c124-ricettario-proteico.md` (8 passi, tutti fatti). **Piano C125**: `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md` (5 pezzi).

## Sessione appena chiusa (#44)
- Avvio: v0.10.4 online controllata; scorte delle chat Voce non unite (solo documenti loro; Voce 11 ferma, E97).
- C124 passo 8, v0.10.5: NUOVO `rf.mjs` (lettore RicetteFit dal JSON-LD: passi col titolo e la foto 1024 px, valori per porzione, «Domande frequenti» nel Consiglio, foto grande dalla serie di og:image); `gz.mjs` esporta `recipeLd`; `worker.js`: `paginaGz(u, chi)`, `leggiRf`, `leggiWeb`, `urlDaId`, motore con 1 ricetta RicetteFit per giro (`RF_GIRO`, `oggiRf`, sitemap `recipe-sitemap.xml` ~905, in testa alla coda, 3 tentativi poi scartata, `rfFine` per il giorno), `/api/gz` apre `rf:`, `{ db: 'rf', acceso }`, oggetto Ricettario (`rfInCoda`, `prendi` con RicetteFit prima, `salva`/`aggiungi` con `rf:`, `statoDb.rf`); `ricettario.js`: `URL_RF`, `webRic`, `urlRic`, `idDaUrl`, `catRic` (PT E49: le portate del motore «Primi piatti» ora escono coi filtri), link RicetteFit incollato, «(tabelle CREA)», riga RicetteFit con Spegni/Riaccendi nel Database; `sw.js` foto RicetteFit senza rete; `data.js` v0.10.5.
- C125 (Mario 12:50, arrivato dalla chat doppione Principale 45 `session_01WTjqUtxqaC`, chiusa su scelta di Mario «1»): piano scritto; pezzo 1 (soglie) fatto, vedi «Stato».
- Controllo Da fare: 0 voci aggiunte (C125 già scritta dalla chat doppione).

## Strade provate e scartate (perché; così la prossima non le rifà)
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
1. Controlla «Stato»: soglie C125 nel ramo? Se no, unisci la scorta della #44, giro completo delle prove (`python3 -I tools/anteprima.py && node tools/prova.js`, in sottofondo) e push. Poi v0.10.6 con le novità (soglie più severe: pasto 25 g e 25%, snack e dolci proteici fino a 300 kcal).
2. C125 pezzi 2-4 (piano `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md`): «⚡ Pronte in 10 minuti», parole nuove della corsia fit, «🔍 Cerca ricette fit», numero di ricette per fonte (Database e Home). Un push per pezzo provato.
3. C125 pezzo 5: fonti nuove attendibili, una alla volta: ricerca aggiornata (skill `ricerca-aggiornata`), robots.txt, prova dal vivo (PT E29) e dal sito vero (PT E25).
4. A Mario, nel primo messaggio: «sembrava solo GialloZafferano» perché RicetteFit è uscita alle 12:45; le 3 foto (Home, Proteiche, riga RicetteFit nel Database); Instagram e YouTube no, in una riga col perché; le soglie nuove dette come stime dove lo sono.
5. Kit 37.2: quando Mario scrive «chiave pronta», `request_credential` (host `raw.githubusercontent.com`, prefisso `token`, nome «Kit RVC lettura»). Le altre righe di «Aspetta Mario»: aspettare Mario; iPad e iPhone solo quando ne ha uno.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md`. Per C125 nessuna 🛑: Mario ha detto «vai di consiglio».

## Ultimo messaggio di Mario
10/11 ~12:50 (scritto nella chat doppione Principale 45, girato alla #44), parola per parola: «Vai di consiglio e ti chiedo metti solo le ricette un pò piú severe per il fitness e mettimi tasto cerca per per ricerche fitness che mi cerca in automatico guarda in tante fonti  gold standard molto attendibili per le ricette fitness gym senza ingrassare e ipertrofia anche ricette dolci proteiche Snack primi secondi sfizio proteico light ricette rivisitate in chiave proteica light Ne vedo moltissime su anche instagram e YouTube influenzer e canali Fit / Cerco anche ricette immediate un esempio stupido tipo la cioccolata la fà con le proteine in polvere al cioccolato con poca acqua ecc ecc ma è un esempio / al momento sembra che carichi solo ricette di GialloZafferano valutate per calorie e proteine  riverifica tutto». Nella stessa chat doppione aveva scelto «1: chiudi il doppione, continua la 44».
Prima, 10/11 ~12:25 (nella #43): «Possiamo farlo piano piano come per il ricettario non tutto in una volta no? basta che lo fà in automatico le ricette fitness piano piano no? che dici?» → fatto così in v0.10.5.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C126; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

