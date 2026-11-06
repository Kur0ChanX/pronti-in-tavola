# Passaggio di consegne

Sessione attuale: #12 (dopo la #11 `session_01QTFEqRMnzmo5dBYtkmvYt4`, chiusa alla soglia 06/11 23:48; la apre la #11 con `create_session` (catena 2 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»); immagine dell'anteprima del link su WhatsApp approvata (05/11); Gemini in Firebase spento; progetto Firebase «Pronti in Tavola» creato sul suo account (Piano Spark). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi). Poi, il 05/11 (#8): **soglia della catena Principale a 320k** (`docs/misure/prova-soglia.json`); **app più semplice**: le scelte le fa Claude e le dice (ok «1ok» ambiguo, vedi Aspetta Mario); **«Persone rifiutate»** sì («1 ok»); Cloudflare: account nuovo solo dell'app, mai condiviso. Il 05/11 (#9): **nome del sito** `pronti-in-tavola.pages.dev`; **account Cloudflare aggiuntivo** «Pronti in Tavola» (creato da Mario, l'alias `+pronti` è rifiutato); sito dal ramo `main` (500 build/mese); schermate dell'app più semplice, Clienti, lucchetto e «Persone rifiutate» approvate («si capisce tutto»); **lista della spesa** (il «carrello» di Mario, PT E8). Il 05/11 (#10): **nome e cognome alla prima apertura** con benvenuto, obbligatori, poi «Ciao <nome>» (C18); spesa con «Tutti gli ordini»; firma YNOY senza coda che cambia colore e filo piano→veloce (C17); **lavorare da sola e pubblicare solo nell'anteprima** («pubblica momentaneamente nell'artefatto di prova, poi piano piano facciamo l'app effettiva»).
- **Da non rifare:** domande già spiegate (PT E4); coda delle modifiche di Monica senza rete, foto C2 e parte «senza rete» di C3 (fatte dalla #6, sotto); lucchetto con impronta o PIN (fatto dalla #5, `lucchetto.js`); rischio «scrivi() riscrive cambi non ancora arrivati» (corretto dalla #5); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4); C5 (tag e immagine del link), C8 (niente striscia di prova coi dati veri), testo e tastiera nelle finestre, passi 1-2 di Firebase e `firebaseConfig` in `dati.js` (fatti dalla #7, sotto); la regola «guida sbagliata → quella giusta in `docs/GUIDE-GIUSTE.md`» (Mario 05/11, già nel `CLAUDE.md`).; Firebase tappe 3 e 4 (database `(default)` creato, accessi Anonimo e Google, regole incollate: Mario ha scritto «fatto» senza foto del timbro «Pubblicato»); C13 app più semplice e C14 «Persone rifiutate» (fatte dalla #8, sotto). Dalla #9: `tools/sito.py` (sito solo coi file dell'app), anteprima versione 15 con app semplice, rifiutati e lista della spesa, `main` creato, lista della spesa v1 (`spesa.js`). Dalla #10: lista della spesa completa (C16), «Ho fatto la spesa» e consumo (C6), spesa su Firebase (C15), benvenuto (C18), rilettura del «No» (C14), incassi, costo per piatto e immagine del menù (C7), video firma (`archivio/video/firma-ynoy-c17.mp4`).
- **Cosa preme a Mario adesso:** finire Cloudflare passo passo con le sue foto (C4); etichette approvate nei dettagli; poi, piano piano, l'app vera (Cloudflare + Firebase) senza toccare i limiti delle sue altre app.

## Stato (06/11 23:48 ora italiana)
- Ramo comune ≠ origin: PUSH DA FARE (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 29 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «86 OK, 0 NO»; `npm run prova-regole` → «51 OK, 0 NO» (05/11 ~21:50, due giri verdi; `dati.js` e regole non toccati dopo).
- Sito: `python3 -I tools/sito.py` → «OK sito: 9 file dell'app + 13 immagini» (tolte le 4 lune della firma).
- Anteprima (https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH): versione 23 (05/11 ~22:00). Ripubblicare: publish con `url` e `dist/anteprima.html` (se rifiutato: Read di 5 righe del file salvato, poi ripubblicare). Avviso del publish: il pulsante «Scarica l'immagine» del menù nell'anteprima non funziona (ci vuole `downloads`): vedi Prossimi passi 1.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#11)
- Avvio da `create_session` della #10. Sveglie: nessuna della #10 (quella «Punto» è di un'altra chat, lasciata).
- **C7 etichette per le vaschette** (`app.js`: `ordiniDaCucinare`, `etichetteDi`, `caricaLogoEti`, `disegnaEtichette`, `apriEtichette`, `mandaEtichette`, `foglioEtichette`, azioni `etichette`/`eti-giorno`/`eti-manda`; pulsante sotto «Cosa cucinare» in Ordini → Da preparare). Foglio A4 da 10 (105 × 57 mm, canvas 1240×1754). Su richiesta di Mario (6 giri): niente numero d'ordine né ritiro; «Per <nome>» a sinistra, logo a destra staccato dagli angoli; «Vaschetta 1 di 3» in piccolo (conta le vaschette di tutto l'ordine); piatto, quantità, note, «Contiene:»; «Scalda: …» dal campo `scalda` del piatto (max 2 righe, in basso a sinistra); firma «Buon appetito» in Caveat (font aggiunto in `index.html`) con cuoricino disegnato; trama «a pibiones» e cucitura da sarta tratteggiata. Impaginazione misurata: si rimpicciolisce se non basta lo spazio; `window.ETI_SCATOLE` + prova in `tools/prova.js` che nulla si sovrapponga né esca dai margini (caso peggiore).
- Anteprima: tolto «Scarica» del menù nel riquadro (`foglioMenuImg`, solo con `Dati.attivo`).
- **C17 apertura**: «Powered by» e logo YNOY più piccoli e fissi in basso (`style.css` `.apertura .wall-by`, Mario 06/11). Foto `archivio/foto-apertura-ynoy-piccola.png`.
- **Regola** (Mario 06/11): ogni foto di un sito → pagina e pulsanti in `docs/GUIDE-GIUSTE.md`, solo pagine mancanti (nel `CLAUDE.md`; per il kit C12). Foto con nomi di altri progetti NON archiviate.
- **Cloudflare C4**: passi 1-7 fatti da Mario (Compute → Workers e Pages → Crea applicazione → **Continua su Pages** → Connetti GitHub → account Kur0ChanX → ritorno alla Home dell'account). Guida aggiornata, foto `archivio/foto/cloudflare-*.jpg`.
- File toccati: `app.js`, `style.css`, `index.html`, `tools/prova.js`, `CLAUDE.md`, `docs/{DA-FARE,DA-FARE-FATTE,GUIDE-GIUSTE,CHI-FA-COSA,STORIA-REGOLE,PASSAGGIO-CONSEGNE}.md`, `archivio/foto*`.
- Controllo Da fare: 0 voci nuove (etichette in C7, apertura in C17, regola in C12, Cloudflare in C4).
- ⚠️ Spreco: il publish dell'anteprima rimanda la pagina intera (fino a 533 KB) quando rifiuta: pubblicare una volta sola.

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
1. Avvio: titolo verde, ricordare le righe di «Aspetta Mario». Permesso GitHub già giusto (foto 06/11 23:49). Dire a Mario di tornare su Cloudflare: ☰ → Recenti → **Workers e Pages** → **Crea applicazione** → **Continua su Pages** → **Connetti GitHub**, e mandare la foto.
2. Poi Cloudflare: ☰ → Recenti → **Workers e Pages** → **Crea applicazione** → **Continua su Pages** → scegliere `pronti-in-tavola` → nome progetto `pronti-in-tavola`, ramo `main`, build `python3 tools/sito.py`, cartella `sito`, variabile `SKIP_DEPENDENCY_INSTALL`=`1` → salva e distribuisci. Un passo per foto, pulsanti come li vede Mario (scriverli in `docs/GUIDE-GIUSTE.md`). `main` è vecchio: aggiornarlo con Mario dopo il giro completo verde.
3. Firebase tappa 5 (Mario entra con Google; `gestori/<uid>` per Monica e Mario; prova sui telefoni veri).
4. Dosi della spesa: bozza di Claude, le controlla Monica. Più avanti chiave `AIza…` ristretta al sito, notifiche (C3).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
06/11 23:49, foto di GitHub → Applications → Cloudflare Workers and Pages → «Repository access»: già **Only select repositories**, 1 repository `Kur0ChanX/pronti-in-tavola`. Permesso giusto, niente da cambiare (foto `archivio/foto/github-cloudflare-permesso.jpg`). Prossimo passo: tornare su Cloudflare e riprovare **Connetti GitHub**.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C19; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

