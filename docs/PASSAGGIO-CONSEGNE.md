# Passaggio di consegne

Sessione attuale: #13 (dopo la #12 `session_01QTFEqU1M1r3a31XVoaAGAe`, chiusa alla soglia 07/11 02:13; la apre la #12 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»); immagine dell'anteprima del link su WhatsApp approvata (05/11); Gemini in Firebase spento; progetto Firebase «Pronti in Tavola» creato sul suo account (Piano Spark). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi). Poi, il 05/11 (#8): **soglia della catena Principale a 320k** (`docs/misure/prova-soglia.json`); **app più semplice**: le scelte le fa Claude e le dice (ok «1ok» ambiguo, vedi Aspetta Mario); **«Persone rifiutate»** sì («1 ok»); Cloudflare: account nuovo solo dell'app, mai condiviso. Il 05/11 (#9): **nome del sito** `pronti-in-tavola.pages.dev`; **account Cloudflare aggiuntivo** «Pronti in Tavola» (creato da Mario, l'alias `+pronti` è rifiutato); sito dal ramo `main` (500 build/mese); schermate dell'app più semplice, Clienti, lucchetto e «Persone rifiutate» approvate («si capisce tutto»); **lista della spesa** (il «carrello» di Mario, PT E8). Il 05/11 (#10): **nome e cognome alla prima apertura** con benvenuto, obbligatori, poi «Ciao <nome>» (C18); spesa con «Tutti gli ordini»; firma YNOY senza coda che cambia colore e filo piano→veloce (C17); **lavorare da sola e pubblicare solo nell'anteprima** («pubblica momentaneamente nell'artefatto di prova, poi piano piano facciamo l'app effettiva»).
- **Da non rifare:** domande già spiegate (PT E4); coda delle modifiche di Monica senza rete, foto C2 e parte «senza rete» di C3 (fatte dalla #6, sotto); lucchetto con impronta o PIN (fatto dalla #5, `lucchetto.js`); rischio «scrivi() riscrive cambi non ancora arrivati» (corretto dalla #5); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4); C5 (tag e immagine del link), C8 (niente striscia di prova coi dati veri), testo e tastiera nelle finestre, passi 1-2 di Firebase e `firebaseConfig` in `dati.js` (fatti dalla #7, sotto); la regola «guida sbagliata → quella giusta in `docs/GUIDE-GIUSTE.md`» (Mario 05/11, già nel `CLAUDE.md`).; Firebase tappe 3 e 4 (database `(default)` creato, accessi Anonimo e Google, regole incollate: Mario ha scritto «fatto» senza foto del timbro «Pubblicato»); C13 app più semplice e C14 «Persone rifiutate» (fatte dalla #8, sotto). Dalla #9: `tools/sito.py` (sito solo coi file dell'app), anteprima versione 15 con app semplice, rifiutati e lista della spesa, `main` creato, lista della spesa v1 (`spesa.js`). Dalla #10: lista della spesa completa (C16), «Ho fatto la spesa» e consumo (C6), spesa su Firebase (C15), benvenuto (C18), rilettura del «No» (C14), incassi, costo per piatto e immagine del menù (C7), video firma (`archivio/video/firma-ynoy-c17.mp4`). Dalla #12: sito online su https://pronti-in-tavola.pronti-in-tavola.workers.dev (Worker, non Pages) e aggiornamento automatico (C4); tentativi di collegare GitHub dentro Cloudflare (falliti, vedi Strade scartate).
- **Cosa preme a Mario adesso:** il sito si aggiorna DA SOLO (fatto il 07/11 con «Crea token» + `.github/workflows/sito.yml`): non toccarlo; ora etichette (3 domande aperte) e poi l'app vera con Firebase, piano piano. Mario è stanco dopo 2 ore su Cloudflare: passi corti, link diretti, niente ipotesi spacciate per cause (PT E9, E10).

## Stato (07/11 02:13 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 29 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «86 OK, 0 NO»; `npm run prova-regole` → «51 OK, 0 NO» (05/11 ~21:50, due giri verdi; `dati.js` e regole non toccati dopo).
- Sito: `python3 -I tools/sito.py` → «OK sito: 9 file dell'app + 13 immagini» (tolte le 4 lune della firma).
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima (https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH): versione 23 (05/11 ~22:00). Ripubblicare: publish con `url` e `dist/anteprima.html` (se rifiutato: Read di 5 righe del file salvato, poi ripubblicare). Avviso del publish: il pulsante «Scarica l'immagine» del menù nell'anteprima non funziona (ci vuole `downloads`): vedi Prossimi passi 1.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#12)
- Avvio da `create_session` della #11. Sveglie: nessuna della #11.
- **Sito online** (C4): zip di `tools/sito.py` caricato a mano da Mario come **Worker** `pronti-in-tavola` → https://pronti-in-tavola.pronti-in-tavola.workers.dev (verifica: `curl -s -o /dev/null -w '%{http_code}'` → 200).
- **Aggiornamento automatico**: `wrangler.jsonc` (nome, cartella `./sito`, `preview_urls: false`) + `.github/workflows/sito.yml` (push sul ramo di lavoro che tocca file dell'app → `python3 tools/sito.py` → `wrangler-action@v3` con `wranglerVersion: '4'`). Segreti su GitHub messi da Mario: `CLOUDFLARE_API_TOKEN` (da Worker → Impostazioni → Compilazioni → **Crea token**, vale solo per questo Worker) e `CLOUDFLARE_ACCOUNT_ID`. Prova: giri 42322694541 e quello su `1511bf3` verdi, log «Uploaded 22 files», «Deployed pronti-in-tavola». Il primo giro (42322569838) era rosso per wrangler 3.
- App Cloudflare su GitHub: disinstallata e reinstallata da Mario sul solo conto Kur0ChanX (solo `pronti-in-tavola`). Non serve più, ma è innocua; non toccarla.
- Guida aggiornata in `docs/GUIDE-GIUSTE.md` (pagine Cloudflare 8-10, giro, soluzione). Errori nuovi PT E9, PT E10 in `docs/ERRORI.md`.
- Su GitHub Mario ha visto «Claude: Permission updates requested»: detto di non toccarlo ora; da guardare con lui.
- File toccati: `wrangler.jsonc`, `.github/workflows/sito.yml`, `docs/{GUIDE-GIUSTE,DA-FARE,ERRORI,CHI-FA-COSA,PASSAGGIO-CONSEGNE}.md`, `archivio/foto/cloudflare-{8,9,10}-*.jpg`.
- Controllo Da fare: 0 voci aggiunte (le richieste di Mario erano tutte su C4, chiusa la sua riga in «Aspetta Mario»).
- ⚠️ Spreco: i video di Mario costano 80-150 KB letti come griglia: estrarre al massimo 4-6 fotogrammi piccoli.

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

- Cloudflare «Connetti GitHub» (Pages, Worker → Compilazioni → GitHub, flusso «Connect GitHub» nuovo): torna sempre a `github.com/settings/installations` senza registrare, da telefono E da PC. Probabile: Kur0ChanX già legato all'altro account Cloudflare. Disinstallare l'autorizzazione toccherebbe gli altri progetti: no. Scelto «Crea token» + GitHub Actions.
- Dare la colpa al browser del telefono: smentito dal video dal PC (PT E10).
- Link `dash.cloudflare.com/?to=/:account/...` dal telefono: portano alla scelta dell'account e poi alla Home, non alla pagina.

## Prossimi passi
1. Avvio: titolo verde, ricordare le 3 righe delle etichette. Primo messaggio corto: il sito si aggiorna da solo (prova: ultimo giro `sito.yml` verde).
2. Etichette (C7): con le risposte di Mario (o i consigli se tace) rifinire; poi chiudere le promesse 👁 a lotti (lista della spesa, benvenuto, ecc.) facendole vedere sul sito vero `…workers.dev`.
3. (#13, 07/11) Sito vero già su Firebase: entrata anonima e lettura OK (prova Playwright), menù vuoto perché Monica non è ancora entrata; Firebase avvisa «dominio non autorizzato per OAuth» → Google non va finché Mario non aggiunge il dominio. Mario: «firebase facciamo domani». Firebase tappa 5: Mario entra con Google sul sito vero; aggiungere il dominio `pronti-in-tavola.pronti-in-tavola.workers.dev` ai domini autorizzati di Firebase Authentication (passo a mano di Mario, guida in `docs/GUIDE-GIUSTE.md` se c'è); `gestori/<uid>` per Monica e Mario.
4. Chiedere a Mario della richiesta «Claude: Permission updates requested» su GitHub (cosa chiede, se serve).
5. Più avanti: `main` e PR come da regole; dosi della spesa; chiave Firebase ristretta al sito.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
07/11 ~02:10, parola per parola: «fatto» (dopo aver messo i due segreti su GitHub). Prima: «vai 1», e un video dal PC con «mi stai prendendo in giro».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C19; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

