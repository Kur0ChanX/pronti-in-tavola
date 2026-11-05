# Passaggio di consegne

Sessione attuale: #10 (dopo la #9 `session_01QTFEqSy2LMrSBBuwFMh1qk`, chiusa alla soglia 05/11 21:11; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»); immagine dell'anteprima del link su WhatsApp approvata (05/11); Gemini in Firebase spento; progetto Firebase «Pronti in Tavola» creato sul suo account (Piano Spark). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi). Poi, il 05/11 (#8): **soglia della catena Principale a 320k** (`docs/misure/prova-soglia.json`); **app più semplice**: le scelte le fa Claude e le dice (ok «1ok» ambiguo, vedi Aspetta Mario); **«Persone rifiutate»** sì («1 ok»); Cloudflare: account nuovo solo dell'app, mai condiviso. Il 05/11 (#9): **nome del sito** `pronti-in-tavola.pages.dev`; **account Cloudflare aggiuntivo** «Pronti in Tavola» (creato da Mario, l'alias `+pronti` è rifiutato); sito dal ramo `main` (500 build/mese); schermate dell'app più semplice, Clienti, lucchetto e «Persone rifiutate» approvate («si capisce tutto»); **lista della spesa** (il «carrello» di Mario, PT E8).
- **Da non rifare:** domande già spiegate (PT E4); coda delle modifiche di Monica senza rete, foto C2 e parte «senza rete» di C3 (fatte dalla #6, sotto); lucchetto con impronta o PIN (fatto dalla #5, `lucchetto.js`); rischio «scrivi() riscrive cambi non ancora arrivati» (corretto dalla #5); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4); C5 (tag e immagine del link), C8 (niente striscia di prova coi dati veri), testo e tastiera nelle finestre, passi 1-2 di Firebase e `firebaseConfig` in `dati.js` (fatti dalla #7, sotto); la regola «guida sbagliata → quella giusta in `docs/GUIDE-GIUSTE.md`» (Mario 05/11, già nel `CLAUDE.md`).; Firebase tappe 3 e 4 (database `(default)` creato, accessi Anonimo e Google, regole incollate: Mario ha scritto «fatto» senza foto del timbro «Pubblicato»); C13 app più semplice e C14 «Persone rifiutate» (fatte dalla #8, sotto). Dalla #9: `tools/sito.py` (sito solo coi file dell'app), anteprima versione 15 con app semplice, rifiutati e lista della spesa, `main` creato, lista della spesa v1 (`spesa.js`).
- **Cosa preme a Mario adesso:** mostrare l'app di prova (anteprima con la lista della spesa) e mettere online il sito vero su Cloudflare, senza toccare i limiti delle sue altre app.

## Stato (05/11 21:11 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR. `main` = versione per il sito (a 51b56fc, giro verde in locale; NON ha ancora la lista della spesa: portarlo avanti con `git push origin claude/pronti-ramo-definitivo:main` solo dopo il giro completo verde).
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 25 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «83 OK, 0 NO»; `npm run prova-regole` → «50 OK, 0 NO» (05/11 20:36; `dati.js` e regole non toccati dopo).
- Sito: `python3 -I tools/sito.py` → «OK sito: 9 file dell'app + 17 immagini».
- Anteprima su claude.ai (https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH): versione 15 (05/11 21:11) con lista della spesa. Ripubblicare: publish con `url` e `dist/anteprima.html` (la prima volta viene rifiutato e mostra le differenze: se sono solo le nostre, ripubblicare).
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#9)
- Avvio: sveglia vecchia cancellata; `send_later` rifiutato (catena 8 di 8: niente sveglie né sessioni nuove); al suo posto un promemoria solo di questa sessione (Preferenze a fine giornata, 21:31): se la #10 parte prima, le Preferenze vanno mandate a Mario a fine giornata (riga in Prossimi passi).
- **Sito**: `tools/sito.py` (solo i file dell'app, controlla config Firebase, immagini e guscio offline), `sito/` ignorata da git. Cloudflare: build `python3 tools/sito.py`, cartella `sito`, `SKIP_DEPENDENCY_INSTALL`=1 (Python 3.13 nell'immagine v3, fonte developers.cloudflare.com/pages/configuration/build-image).
- **Cloudflare con Mario**: alias `+pronti` rifiutato → account aggiuntivo «Pronti in Tavola» creato (foto `archivio/foto/cloudflare-1-menu-account.jpg`, menù italiano in `docs/GUIDE-GIUSTE.md`). La #8 (chiusa) ha continuato a parlare con Mario e gli ha mandato la guida intera; le ho chiesto di smettere. Mario aspetta la prossima foto (dopo **Compute**).
- **Nome del sito** `pronti-in-tavola.pages.dev` (Mario): in `data.js`, `index.html`, `docs/SPECIFICA.md` (C10 chiusa).
- **Anteprima** ripubblicata due volte (20:37 app semplice e rifiutati; 21:11 lista della spesa, versione 15).
- **Lista della spesa** (Mario: «il carrello che ti avevo detto della spesa…»): `spesa.js` + ganci in `app.js` (vista `spesa`, sezione dosi nel piatto, foglio `spesa-ing`, `salvaCampo` d./sp.), stile in `style.css`, `index.html`, `sw.js`, `tools/sito.py`, `tools/anteprima.py`, 2 prove nuove in `tools/prova.js`. Dati in `localStorage` `pit-spesa-v1` (solo telefono di Monica: C15 per Firebase). Dosi: bozza di Claude da far controllare.
- Errore mio: ho cercato solo «carrello» e ho chiesto a Mario (PT E8). Per sbaglio un `send_message` «test» a me stessa (detto a Mario).
- File toccati: `spesa.js`, `app.js`, `index.html`, `style.css`, `sw.js`, `data.js`, `.gitignore`, `tools/{sito.py,anteprima.py,prova.js}`, `CLAUDE.md`, `docs/{DA-FARE,DA-FARE-FATTE,ERRORI,GUIDE-GIUSTE,SPECIFICA,CHI-FA-COSA,PASSAGGIO-CONSEGNE,PROSSIMA-SESSIONE}.md`, `archivio/foto/cloudflare-1-menu-account.jpg`.
- Controllo Da fare: 1 voce aggiunta (C15); C6 aggiornata; C10 chiusa. «Aspetta Mario»: tolte 5 righe (Mario ha risposto), restano 2.

## Strade provate e scartate (perché; così la prossima non le rifà)
- Quelle delle sessioni 1-7: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` (link unico + richiesta, email-link, leggere `nomi/` dal telefono, lucchetto in anteprima, pronti come numero, ascoltare `foto/`, Gemini acceso, ecc.).
- «Accetta» in due tocchi (prima «Ripensaci» che rimanda tra i Nuovi, poi Sì): scartata, Monica ha già sbagliato una volta; un tocco solo.
- Database Firestore in «modalità di test»: si blocca dopo 30 giorni e intanto è aperto a tutti; scelta la produzione con le nostre regole. Piano Blaze (backup): a pagamento, no.
- Cloudflare con un token API per pubblicare io: un segreto in più; scelto il collegamento con GitHub (Mario autorizza solo questo repo).
- Sito su `main`: il ramo non esiste; per ora il sito di prova segue il ramo di lavoro (nessun cliente ha il link), `main` con PR e prove verdi prima di darlo ai clienti.
- Cloudflare con l'email alias `mario.miscera+pronti@gmail.com`: rifiutata da Cloudflare (05/11 20:28, «Only one variation is allowed»); scelta l'account Free aggiuntivo dallo stesso login.
- Dosi dentro i piatti (`S.piatti`): scartato, con Firebase i piatti li legge chiunque e le dosi sono solo di Monica; per ora `localStorage` `pit-spesa-v1`, poi raccolta privata (C15).
- Spiegare «lista Hai detto di no» senza esempio: Mario non l'ha capita (PT E7).

## Prossimi passi
1. Avvio: titolo verde; ricordare a Mario le 2 righe di «Aspetta Mario»; chiedergli se ha visto la lista della spesa nell'anteprima (Monica → Da preparare → Lista della spesa). Se è sera tardi e non sono state mandate: Preferenze a fine giornata (il testo intero di `docs/kit-progetto/PREFERENZE-CHAT.txt`, skill `nuova-regola` §5).
2. **Cloudflare**: Mario segue la guida intera data dalla #8 (sotto). A ogni foto: nomi veri in `docs/GUIDE-GIUSTE.md`. Guida: account «Pronti in Tavola» in cima al menù → Compute → «Workers e Pages» → Create application → Pages → Connect to Git → GitHub «Only select repositories» → pronti-in-tavola → Install & Authorize → Begin setup; nome `pronti-in-tavola`, ramo `main`, preset None, build `python3 tools/sito.py`, cartella `sito`, variabile `SKIP_DEPENDENCY_INSTALL`=`1` → Save and Deploy → indirizzo `.pages.dev` (se ha un suffisso: cambiarlo in `data.js` e `index.html`, la prova lo controlla); poi Settings → Builds → Branch control: anteprime None; poi Firebase: Autenticazione → Impostazioni → Domini autorizzati → Aggiungi dominio. Nomi inglesi della guida ufficiale, non visti da Mario.
2b. **C16 lista della spesa completa** (ultimo messaggio di Mario): ricerca sulle app di spesa migliori (Bring!, AnyList, Listonic, OurGroceries… con `ricerca-aggiornata`, fonti datate), poi poche domande a Mario e specifica in `docs/SPECIFICA.md`, poi il codice in `spesa.js`: la lista di adesso diventa la sezione «Spesa per i miei ordini». Domanda aperta (condivisa o no) in «Aspetta Mario».
3. Prima di portare `main` avanti con la lista della spesa: giro completo verde (app, regole, motore).
4. **C15**: dosi e «in casa» nei dati privati di Monica (raccolta solo gestori in `firestore.rules`, prove in `tools/prova-regole.js`, scrittura in `dati.js`) prima di darle l'app vera. Poi C6: «ho fatto la spesa → in casa» e consumo, sconti.
5. **Firebase tappa 5**: Mario entra con Google nel sito; creare `gestori/<uid>` per Monica e Mario; prova coi telefoni veri (leggere, mai scrivere dati finti).
6. Aspetta Mario «nome del cliente nuovo»: appena risponde, farlo. Più avanti: chiave web `AIza…` ristretta al sito, notifiche a Monica (C3).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
05/11 ~21:15 (dopo l'handoff), parola per parola: «Praticamente ha una lista della spesa. Ovviamente fai una lista della spesa, visto che ci siamo, completa, prendi spunto alle app gold standard della spesa e mettila dentro, e poi dentro una sezione con scritto tipo, cosa ne so, spesa per i miei ordini, gli esce quello che deve comprare.» → C16. Prima, ~20:45: «Il carrello che ti avevo detto della spesa, che guarda le quantità dei prodotti che usa, le carica quanti ingredienti ci vogliono, le quantità, e quando va a fare la spesa gli segna la spesa che deve fare in base alle quantità degli ordini che ha. Quello te l'avevo detto, te ne sei dimenticato ovviamente.» Prima: «si capisce tutto / metti il carrello che ti ho detto e le funzioni nuove nell app di test devo farla vedere» · «metti tutti gli aggiornamenti sull artefatto test che devo mostrare l'app» · «pronti-in-tavola.pages.dev questo» · foto del menù Cloudflare con l'account «Pronti in Tavola».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C16; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

