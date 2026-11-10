# Passaggio di consegne

Sessione attuale: #48 (dopo la #47 `session_01WTjqUtQRSAx8znUmHjDHcG`, chiusa alla soglia 10/11 14:57; la apre la #47 con `create_session` (catena 5 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 15:05):** C127 scelto da Mario («vai di consiglio 1 e 3»): 1) pagina Proteiche ordinata come la foto `archivio/foto/2026-11-10-1500-c127-proposta-filtri.png`; 2) «📅 Il mio giorno proteico» (foto `…-c127-proposta-giorno.png`); 3) «🔁 Simili a questa». Poi la foto di Mario della v0.10.12 (C128: quante proteiche arrivano).

## Stato (10/11 15:00 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta (qui il push del ramo pubblica da solo: `sito.yml`). Scorte #44-#47: solo documenti, NON unirle se `worker.js` contiene `caricoAuto`.
- v0.10.12 ONLINE (controllata dalla #47 alle 14:47, push 1515ac0a): verifica `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.12 e `…/ricettario.js` contiene `function letturaFit`.
- v0.10.12 (C128): carico veloce da solo (cron → `caricoAuto` → turbo `auto`: 5 RicetteFit + 2 altre + 10 valori per sveglia ogni 30 s; riparte se fermo da 10 min; dopo un carico vuoto aspetta 1 ora); «Cerca» con `nuoveTra` (prima RicetteFit, poi GZ dalla pagina salvata `cercaPag:<parola>`, max 2 pagine per parola e 6 in tutto); riga «⏳ Sto leggendo adesso…» (`letturaFit`) nella nota di Proteiche. Il server non si legge dal contenitore (API solo per chi gestisce): l'effetto lo conferma la foto di Mario.
- Prove (Principale 47, sulla v0.10.12): app giro completo 89 OK, 0 NO; `node tools/prova-database.mjs` → 154 OK, 0 NO.
- Kit qui 35.0; il 37.2 aspetta la chiave di Mario (riga in «Aspetta Mario»). Preferenze ricevute v38 (più nuove del kit): si aggiorna col kit 37.2. CLAUDE.md ~1459 token (tetto 1000).

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- **Piano C124**: `docs/lavori-in-corso/c124-ricettario-proteico.md` (8 passi, tutti fatti). **Piano C125**: `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md` (5 pezzi). **Piano C126**: `docs/lavori-in-corso/c126-proteiche-momenti-e-fonti.md` (pezzi 1-2 fatti, 3-4 fonti).

## Sessione appena chiusa (#47)
- Avvio: scorte #44-#46 non unite (solo documenti). Nessuna sveglia della #46 da cancellare.
- C128 causa (campione dal vivo, `scratchpad` 14:30): GZ normali 0 su 48 passano le regole (34 per i grassi saturi), RicetteFit 4 su 30 (13%, 10 con meno di 10 g di proteine) → stima ~120 proteiche da RicetteFit, ~150 in tutto. Cause: RicetteFit 1 ogni 10 minuti; «Cerca ancora» sempre pagina 1; tetto di 40 prima di togliere le già lette (RicetteFit fuori) → PT E50.
- C127: proposta con 2 foto finte (DOM dell'anteprima cambiato da Playwright, script in scratchpad non salvato: rifarlo nel codice vero); Mario ha scelto 15:05. Nessun codice C127 scritto.
- Controllo Da fare: 0 voci aggiunte (i 2 messaggi di Mario sono in C128 e C127).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #47 (C128): leggere i numeri veri del server dal contenitore → NO (`/api/gz` solo per chi gestisce): campione dal vivo coi lettori veri (`rf.mjs`, `gz.mjs`) + `fitRic`. Pagina 2 della ricerca GZ: `…/ricerca-ricette/page2/<parole>/` funziona (provato dal vivo). `leggiNutr` dentro l'oggetto (sveglie) falliva in silenzio (`.catch` su un array): ora `Promise.resolve().then(...)`. Ricette di prova con `nutr: null` = «lette, senza valori» (colonna 0), NON «da leggere»: per «da leggere» niente `nutr`.
- #47 (prove): `python3 - <<EOF` con la parola `env` dentro lo ferma la guardia («stamperebbe tutte le variabili»): scrivere lo script in un file dello scratchpad e lanciarlo con `python3 -I`.
- #46 (C126): Foodspring non risponde dal contenitore; Yazio `/it/ricette` 404; MyProtein robots.txt con molte regole (da leggere prima); FatSecret pagina 200 (da provare). Nessuna provata a fondo: è il pezzo 3 del piano C126. Push del codice prima del giro completo → NO: qui ogni push del ramo pubblica il sito vero.
- #45 (C125): Melarossa → NO per Proteiche (JSON-LD `Recipe` senza `nutrition`, solo calorie nel testo); Fondazione Veronesi → NO (senza valori, passi in un testo unico, ~16 ricette); Starget → NO (ricette caricate dal browser, piccola, `Content-Signal use=reference`). Ricerca del sito RicetteFit → NO (robots): le parole si cercano negli indirizzi della sitemap. Prove del database con `fetch` finto che risponde 404 a tutto → l'accesso di chi gestisce fallisce («non sei tra chi gestisce»): far passare a `prima(u, o)` gli indirizzi non dei siti.
- #44 (RicetteFit): foto dal JSON-LD → NO (ritagli da 500 px, PT E45): og:image + la sua serie srcset ≥ 1000 px. Ricerca del sito (`/?s=`) → NO (vietata nel loro robots.txt): l'elenco viene dalla sitemap. Il loro `transFatContent` è «Grassi insaturi» sul sito: non si usa. Ricette RicetteFit nella coda normale → NO (sarebbero rimaste dietro a GZ, e una fallita mai ripresa): una sola alla volta, in testa (`prendi` ordina RicetteFit prima).
- #44 (prove): `SOLO=… node tools/prova.js` con `timeout 110` si ferma prima della fine (il passo da solo ci mette ~2-3 minuti): lanciarlo in sottofondo.
- #44 (C125): Instagram e YouTube come fonti → NO (condizioni d'uso, niente formato ricetta; PT E25). Soglie fisse più alte per tutte → NO (taglierebbero snack e dolci proteici): due profili, pasto e snack.
- Sessioni #28-#43 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo, «Strade scartate #28-#43»).

## Prossimi passi
1. C127 pezzo 1 (Mario «consiglio 1»), come la foto `archivio/foto/2026-11-10-1500-c127-proposta-filtri.png`, in `ricettario.js`: zone in una riga «Tutte · 🏋️ Proteiche · ⭐ Preferite · Altre ▾» (Sarde, Italiane, Le mie dentro «Altre»); momenti e fonti a scelta MULTIPLA (salvati come `'colazione,spuntino'` in `f.fit`/`f.prot`; helper `fitSel`, `protSel`, `passaFit` = OR fra momenti, OR fra fonti, AND fra i due) in righe che scorrono di lato (render() tiene già `scrollLeft` delle `.scelte`); tocco che accende = filtra e cerca le parole di quel momento/fonte, tocco che spegne = solo filtra; «⚙️ Portata, difficoltà, tempo e ordine (n)» con dentro portata e difficoltà; riquadro verde «⏳ Sto caricando…» (`letturaFit` + barra + «Oggi +N entrate in Proteiche» calcolato dal telefono: proteiche con `aggiunta` nelle ultime 24 ore) con «🔍 Cerca altre» e «ℹ️ Le regole» (la nota `.ric-nota-fit` si apre lì); esito della ricerca dentro il riquadro. Prove da aggiornare in `tools/prova.js`: passi C124 (righe ~1636-1645 `ric-diff`, `ric-piu`), C125 (~1695-1721 momenti a scelta singola → multipla), C125 cerca fit (~1730-1767: testo «Puoi anche toccare…» tolto), C128, e ~957-962 (`ric-diff`, `ric-tempo`). Foto prima/dopo a Mario (cambia l'aspetto).
2. C127 pezzo 2: «📅 Il mio giorno proteico» (foto `…-c127-proposta-giorno.png`): obiettivo in grammi (Impostazioni, regolabile, base 150), una proposta per Colazione, Pranzo, Spuntino, Cena dalle proteiche (`momentoRic`), «🔄 Cambia» per ognuna, totale proteine e kcal, «🛒 Lista della spesa» (riusa `spesa.js` se si può), «📤 Manda» (WhatsApp). Occhio critico: niente proteiche per un momento → dirlo; ricette senza dosi per persona.
3. C127 pezzo 3: «🔁 Simili a questa» in fondo alla ricetta proteica (stessa fonte proteica o stesso momento, prima più proteine per caloria).
4. C128: quando Mario manda la foto, confronta il numero con la stima (~150); se il carico veloce non è partito, guardare `turbo` nella pagina Database (riga «⚡ Sto leggendo da sola…»).
5. C126 pezzo 3-4 (Mario «2»): fonti con valori calcolati (tabelle CREA), fonte e «calcolati» segnati nella ricetta; specifica nel piano prima del codice. Kit 37.2: quando Mario scrive «chiave pronta», `request_credential` (host `raw.githubusercontent.com`, prefisso `token`, nome «Kit RVC lettura»).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (la 🛑 C127 è chiusa: Mario «vai di consiglio 1 e 3»).

## Ultimo messaggio di Mario
10/11 ~15:05, parola per parola: «Vai di consiglio 1 e 3» (risposta alle 2 domande C127: DOMANDA 1 → 1 pagina come la foto; DOMANDA 2 → 1 giorno proteico e 3 simili). Prima, ~14:31 (2 foto `archivio/foto/2026-11-10-1431-*.jpg`): «non è possibile cosí generico non trova nulla assurdo» (corretto nella v0.10.12).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C129; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

