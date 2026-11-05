# Passaggio di consegne

Sessione attuale: #11 (dopo la #10 `session_01QTFEqRJChfyuqj5DHYzUwU`, chiusa alla soglia 05/11 22:00; la apre la #10 con `create_session` (catena 1 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»); immagine dell'anteprima del link su WhatsApp approvata (05/11); Gemini in Firebase spento; progetto Firebase «Pronti in Tavola» creato sul suo account (Piano Spark). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi). Poi, il 05/11 (#8): **soglia della catena Principale a 320k** (`docs/misure/prova-soglia.json`); **app più semplice**: le scelte le fa Claude e le dice (ok «1ok» ambiguo, vedi Aspetta Mario); **«Persone rifiutate»** sì («1 ok»); Cloudflare: account nuovo solo dell'app, mai condiviso. Il 05/11 (#9): **nome del sito** `pronti-in-tavola.pages.dev`; **account Cloudflare aggiuntivo** «Pronti in Tavola» (creato da Mario, l'alias `+pronti` è rifiutato); sito dal ramo `main` (500 build/mese); schermate dell'app più semplice, Clienti, lucchetto e «Persone rifiutate» approvate («si capisce tutto»); **lista della spesa** (il «carrello» di Mario, PT E8). Il 05/11 (#10): **nome e cognome alla prima apertura** con benvenuto, obbligatori, poi «Ciao <nome>» (C18); spesa con «Tutti gli ordini»; firma YNOY senza coda che cambia colore e filo piano→veloce (C17); **lavorare da sola e pubblicare solo nell'anteprima** («pubblica momentaneamente nell'artefatto di prova, poi piano piano facciamo l'app effettiva»).
- **Da non rifare:** domande già spiegate (PT E4); coda delle modifiche di Monica senza rete, foto C2 e parte «senza rete» di C3 (fatte dalla #6, sotto); lucchetto con impronta o PIN (fatto dalla #5, `lucchetto.js`); rischio «scrivi() riscrive cambi non ancora arrivati» (corretto dalla #5); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4); C5 (tag e immagine del link), C8 (niente striscia di prova coi dati veri), testo e tastiera nelle finestre, passi 1-2 di Firebase e `firebaseConfig` in `dati.js` (fatti dalla #7, sotto); la regola «guida sbagliata → quella giusta in `docs/GUIDE-GIUSTE.md`» (Mario 05/11, già nel `CLAUDE.md`).; Firebase tappe 3 e 4 (database `(default)` creato, accessi Anonimo e Google, regole incollate: Mario ha scritto «fatto» senza foto del timbro «Pubblicato»); C13 app più semplice e C14 «Persone rifiutate» (fatte dalla #8, sotto). Dalla #9: `tools/sito.py` (sito solo coi file dell'app), anteprima versione 15 con app semplice, rifiutati e lista della spesa, `main` creato, lista della spesa v1 (`spesa.js`). Dalla #10: lista della spesa completa (C16), «Ho fatto la spesa» e consumo (C6), spesa su Firebase (C15), benvenuto (C18), rilettura del «No» (C14), incassi, costo per piatto e immagine del menù (C7), video firma (`archivio/video/firma-ynoy-c17.mp4`).
- **Cosa preme a Mario adesso:** mostrare l'app di prova (anteprima) con tutte le novità; poi, piano piano, l'app vera (Cloudflare + Firebase) senza toccare i limiti delle sue altre app.

## Stato (05/11 22:00 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR. `main` NON portato avanti: il push su `main` è stato bloccato dal permesso automatico («Production Deploy»); Mario vuole solo l'anteprima per ora.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 29 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «86 OK, 0 NO»; `npm run prova-regole` → «51 OK, 0 NO» (05/11 ~21:50, due giri verdi; `dati.js` e regole non toccati dopo).
- Sito: `python3 -I tools/sito.py` → «OK sito: 9 file dell'app + 13 immagini» (tolte le 4 lune della firma).
- Anteprima (https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH): versione 23 (05/11 ~22:00). Ripubblicare: publish con `url` e `dist/anteprima.html` (se rifiutato: Read di 5 righe del file salvato, poi ripubblicare). Avviso del publish: il pulsante «Scarica l'immagine» del menù nell'anteprima non funziona (ci vuole `downloads`): vedi Prossimi passi 1.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#10)
- Avvio manuale (catena da 0). Sveglie della #9: nessuna. Messaggio della #9 dopo l'handoff (nome del cliente) ricevuto con `send_message`, risposto.
- **C16 lista completa** (`spesa.js`): schede «La mia lista» (`vSpesaMia`, `aggiungiVoce`, `leggiVoce`, `repartoDi` con `PAROLE_REP`, «Compri spesso», niente doppioni, Annulla) e «Spesa per i miei ordini» (`vSpesaOrdini`, anche «Tutti gli ordini» = `giorni:-1`); un solo WhatsApp (`testoSpesa`). Ricerca in `docs/SPECIFICA.md`.
- **C6**: «Ho fatto la spesa» (`sp-fatta`); consumo «in casa» calcolato (`casaDi`, `consumati`, `fissaCasa`, `SPESA.cotti`): annullare un «pronto» lo rimette.
- **C15**: `impostazioni/spesa` solo gestori (`firestore.rules`), `documenti()`/`stato()`/ascolto in `dati.js`, `spesaDalServer()` (gancio in `avviaDati` di `app.js`).
- **C18 benvenuto**: `serveBenvenuto`, `vBenvenuto`, `benvEntra`, `nomeCliente` in `app.js`; `io.letto` in `dati.js`.
- **C14**: ascolto rifiutato → `rileggiUtente` (in coda, non saltata: il primo tentativo con limite di 2 s falliva) e pulizia di `srv` del cliente in `apriAscolti`.
- **C17**: `FIRMA_JONA` (filo 0,7 s con cubic-bezier, ritardi +0,38 s), lune tolte (`media/firma-luna-*.png`, `sw.js`, `style.css`).
- **C7**: `incassi()`/`contiMese()` nella Home; costo per piatto (`costoPiatto`, prezzo nel foglio ingrediente); immagine del menù (`disegnaMenu`, `mandaMenu`, `foglioMenuImg`, pulsante in I miei piatti).
- File toccati: `app.js`, `spesa.js`, `dati.js`, `firestore.rules`, `style.css`, `sw.js`, `tools/{prova.js,prova-firebase.js,prova-regole.js}`, `docs/{DA-FARE,DA-FARE-FATTE,SPECIFICA,MESSAGGI-MARIO,CHI-FA-COSA,PASSAGGIO-CONSEGNE}.md`, `archivio/video/firma-ynoy-c17.mp4`, `.claude/settings.json`.
- Controllo Da fare: 2 voci aggiunte (C17 dalla #9, C18); C6, C7, C14, C15, C16 aggiornate. «Aspetta Mario»: tolta «Principale 3» (Mario ha risposto), aggiunta «Firma YNOY».
- ⚠️ Spreco: una lettura di `list_events` della #9 di 112 KB (poi letta a pezzi); la prossima: `list_events` con `limit` piccolo.

## Strade provate e scartate (perché; così la prossima non le rifà)
- Quelle delle sessioni 1-7: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` (link unico + richiesta, email-link, leggere `nomi/` dal telefono, lucchetto in anteprima, pronti come numero, ascoltare `foto/`, Gemini acceso, ecc.).
- «Accetta» in due tocchi (prima «Ripensaci» che rimanda tra i Nuovi, poi Sì): scartata, Monica ha già sbagliato una volta; un tocco solo.
- Database Firestore in «modalità di test»: si blocca dopo 30 giorni e intanto è aperto a tutti; scelta la produzione con le nostre regole. Piano Blaze (backup): a pagamento, no.
- Cloudflare con un token API per pubblicare io: un segreto in più; scelto il collegamento con GitHub (Mario autorizza solo questo repo).
- Sito su `main`: il ramo non esiste; per ora il sito di prova segue il ramo di lavoro (nessun cliente ha il link), `main` con PR e prove verdi prima di darlo ai clienti.
- Cloudflare con l'email alias `mario.miscera+pronti@gmail.com`: rifiutata da Cloudflare (05/11 20:28, «Only one variation is allowed»); scelta l'account Free aggiuntivo dallo stesso login.
- Dosi dentro i piatti (`S.piatti`): scartato, con Firebase i piatti li legge chiunque e le dosi sono solo di Monica; per ora `localStorage` `pit-spesa-v1`, poi raccolta privata (C15).
- Spiegare «lista Hai detto di no» senza esempio: Mario non l'ha capita (PT E7).
- Rilettura dello stato del cliente con limite di 2 s che salta le chiamate: perdeva il «No» dopo Accetta + Annulla ravvicinati; ora la rilettura va in coda.
- Spesa con «in casa» che si scala davvero a ogni «pronto»: scartato, un Annulla non lo rimetterebbe; scelto il calcolo (`SPESA.cotti`).
- Push di `main` da sola: bloccato dal permesso automatico; resta a Mario/insieme quando c'è Cloudflare.

## Prossimi passi
1. Avvio: titolo verde; ricordare a Mario le 3 righe di «Aspetta Mario»; dirgli cosa c'è di nuovo nell'anteprima (lista completa, Ho fatto la spesa, benvenuto, incassi, costo per piatto, immagine del menù). Correggere subito: nel foglio dell'immagine del menù, nell'anteprima (`!Dati.attivo`) niente pulsante «Scarica» (non va nel riquadro di claude.ai): solo «tieni premuto»; poi giro e ripubblicare.
2. Mario ha detto di andare avanti da sola: C7 etichette da stampare (ultima parte della Fase 3); dosi della spesa ancora «bozza di Claude» (da far controllare a Monica).
3. **Cloudflare** (C4) quando Mario torna: guida in `docs/GUIDE-GIUSTE.md` e Prossimi passi della #9 (account «Pronti in Tavola» → Compute → Workers e Pages → … build `python3 tools/sito.py`, cartella `sito`, `SKIP_DEPENDENCY_INSTALL`=1). Poi `main` = ramo (con giro completo verde), dominio in Firebase.
4. **Firebase tappa 5**: Mario entra con Google; `gestori/<uid>` per Monica e Mario; prova coi telefoni veri (benvenuto C18, rifiutati C14, spesa C15).
5. Più avanti: chiave web `AIza…` ristretta al sito, notifiche a Monica (C3).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
05/11 ~21:35, parola per parola: «Guarda anche la risposta che ho dato nella sessione precedente, la 9, vai avanti da solo e pubblica momentaneamente nell'artefatto di prova, poi piano piano facciamo l'app effettiva, però pubblica lì, e autonomamente, da solo, vai tranquillo, mi fido di te. Da solo che mi devo assentare qualche ora.» (la risposta nella #9 = il nome del cliente, fatto C18).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C19; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

