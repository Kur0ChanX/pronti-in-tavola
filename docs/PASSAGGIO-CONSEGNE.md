# Passaggio di consegne

Sessione attuale: #47 (dopo la #46 `session_01WTjqUvA9kNYEDeziYdojRk`, chiusa alla soglia 10/11 14:25; la apre la #46 con `create_session` (catena 4 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 14:23):** 1) C128 «non c'è niente di nuovo, ne ho pochissime, come è possibile» (Proteiche: 15 ricette, 1114 in coda a 10 ogni 10 minuti): causa vera coi numeri e rimedio; 2) C127 multi scelta, «chiaro se sono state caricate», ordine nella pagina (caos), funzioni smart; 3) C126 fonti B (Mario «2»: valori calcolati, fonte e «calcolati» segnati nella ricetta).

## Stato (10/11 14:30 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta (qui il push del ramo pubblica da solo: `sito.yml`). Scorte delle sessioni #44-#46: solo documenti, NON unirle se `ricettario.js` contiene `FONTI_PROT`.
- v0.10.11 ONLINE (controllata dalla #46 alle ~14:30, push 7194b59f): verifica `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.11 e `…/ricettario.js` contiene `FONTI_PROT`. Se dice ancora 0.10.10: guardare il giro «Pubblica sito».
- Versioni della #46: v0.10.9 ricerca normale anche su RicetteFit (in cima, con foto); v0.10.10 Proteiche per 8 momenti + «Cerca nuove ricette fit su tutti i siti» (`{ db: 'cercaFit', tutto: true }`); v0.10.11 «🥩 Fonte proteica (facoltativo)», 19 scelte.
- Prove (Principale 46, sulla v0.10.11): app giro completo 88 OK, 0 NO; `node tools/prova-database.mjs` → 145 OK.
- Kit qui 35.0; il 37.2 aspetta la chiave di Mario (riga in «Aspetta Mario»). Preferenze ricevute v38 (più nuove del kit): si aggiorna col kit 37.2. CLAUDE.md ~1459 token (tetto 1000).

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- **Piano C124**: `docs/lavori-in-corso/c124-ricettario-proteico.md` (8 passi, tutti fatti). **Piano C125**: `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md` (5 pezzi). **Piano C126**: `docs/lavori-in-corso/c126-proteiche-momenti-e-fonti.md` (pezzi 1-2 fatti, 3-4 fonti).

## Sessione appena chiusa (#46)
- Avvio: scorte #44 (01WTjqUtY9Gg) non unite (solo documenti). Nessuna sveglia della #45 da cancellare.
- v0.10.9 (C125 strada 2): `rf.mjs` `rfTrova`/`radiciRf`/`nomeRf` (radici, parole vuote, nome dall'indirizzo, foto da `<image:loc>` della sitemap); `worker.js` `rfCerca`, `nomiDi` (nome vero delle già lette), ricerca `{ cerca }` = RicetteFit in cima + GZ. Provata dal contenitore coi siti veri (`scratchpad/vivo`).
- v0.10.10-0.10.11 (C126): `ricettario.js` `MOMENTI_FIT` (parole da cercare), `PAROLE_MOM`, `momentoRic`, `FONTI_PROT`, `haFonteProt`, `f.prot`, tasto `ric-cerca-fit-tutto`; `worker.js` `cercaFit` con `qq` (max 4) e `tutto` (`FIT_TUTTO` + prossime 30 RicetteFit da `rf.i`). Le 6 parole fisse (`FIT_CERCA`) e la riga «Pasti / Snack e dolci» tolte.
- Controllo Da fare: 3 voci aggiunte (C126, C127, C128).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #46 (C126): Foodspring non risponde dal contenitore; Yazio `/it/ricette` 404; MyProtein robots.txt con molte regole (da leggere prima); FatSecret pagina 200 (da provare). Nessuna provata a fondo: è il pezzo 3 del piano C126. Push del codice prima del giro completo → NO: qui ogni push del ramo pubblica il sito vero.
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
1. C128 (🔴, Mario 14:23 «ne ho pochissime, come è possibile»): numeri veri dal server (pagina Database / `statoDb`: lette coi valori, senza valori, in coda 1114, quante passano `fitRic` e perché no: soglie, sodio, zuccheri) e risposta a Mario con la causa in una riga; rimedio subito se è la coda (più veloce: turbo sulle ricette fit in coda) o le regole troppo strette per gli snack. Le foto 14:22: «le 40 trovate le avevo già lette» = le ricerche trovano ricette già lette che non passano le regole.
2. C127 (Mario 14:21): proposta con foto prima del codice: momenti e fonti a scelta multipla; avanzamento chiaro («lette 12 di 40 · 3 entrate in Proteiche»); ordine nella pagina (zona, momenti, portate, difficoltà sono 4 righe di scelte: raggrupparle, es. Proteiche con solo momenti e fonte, il resto in «⚙️ Più filtri»); 2-3 funzioni smart proposte.
3. C126 pezzo 3-4 (Mario «2»): fonti B con valori calcolati (tabelle CREA) e fonte + «calcolati» segnati nella ricetta; specifica nel piano prima del codice. Pezzo 2 resto: momenti e fonti regolabili dalle Impostazioni.
4. Kit 37.2: quando Mario scrive «chiave pronta», `request_credential` (host `raw.githubusercontent.com`, prefisso `token`, nome «Kit RVC lettura»). Le altre righe di «Aspetta Mario»: aspettare Mario; iPad e iPhone solo quando ne ha uno.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (la 🛑 sulle fonti è chiusa: Mario «2»).

## Ultimo messaggio di Mario
10/11 ~14:23, parola per parola (con 2 foto `archivio/foto/2026-11-10-1422-dopo-allenamento-*.jpg`): «non c'è niente di nuovo ne ho pochissime come è possibile». Prima, ~14:21 (foto `…-1420-proteiche-momenti.jpg`): «fammi multi scelta e fammi capire chiare se sono state caricate e fai ordine cè un pò di caos in tutta la pagina aggiungi funzioni utili e smart». ~14:18 (prima delle due foto): «2 ma metti una sezione a parte quelli con valori calcolati o segnami semplicemente la fonte nella ricetta e capisco». Arrivati durante la v0.10.11 (la fonte proteica non l'ha ancora vista): la #47 risponde per prima a questi.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C129; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

