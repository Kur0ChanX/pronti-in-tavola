# Passaggio di consegne

Sessione attuale: #19 (dopo la #18 `session_01QTFEqTxh2SWw8opojrUSBm`, chiusa alla soglia 07/11 19:06; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»); immagine dell'anteprima del link su WhatsApp approvata (05/11); Gemini in Firebase spento; progetto Firebase «Pronti in Tavola» creato sul suo account (Piano Spark). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi). Poi, il 05/11 (#8): **soglia della catena Principale a 320k** (`docs/misure/prova-soglia.json`); **app più semplice**: le scelte le fa Claude e le dice (ok «1ok» ambiguo, vedi Aspetta Mario); **«Persone rifiutate»** sì («1 ok»); Cloudflare: account nuovo solo dell'app, mai condiviso. Il 05/11 (#9): **nome del sito** `pronti-in-tavola.pages.dev`; **account Cloudflare aggiuntivo** «Pronti in Tavola» (creato da Mario, l'alias `+pronti` è rifiutato); sito dal ramo `main` (500 build/mese); schermate dell'app più semplice, Clienti, lucchetto e «Persone rifiutate» approvate («si capisce tutto»); **lista della spesa** (il «carrello» di Mario, PT E8). Il 05/11 (#10): **nome e cognome alla prima apertura** con benvenuto, obbligatori, poi «Ciao <nome>» (C18); spesa con «Tutti gli ordini»; firma YNOY senza coda che cambia colore e filo piano→veloce (C17); **lavorare da sola e pubblicare solo nell'anteprima** («pubblica momentaneamente nell'artefatto di prova, poi piano piano facciamo l'app effettiva»). Il 07/11 (#16): Monica ha un **Android**; pagina Ordini a 4 schede e scadenze chiare approvate («tutto come consiglio»); promemoria della sera sì; «I miei ordini» del cliente uguale sì; avviso al cliente «sia da app sia WhatsApp»; dosi le mette Monica, solo sue; allergeni li controlla e cambia Monica; **foto del menù ai clienti IN ATTESA** («non sono molto convinto, aspettiamo»): per ora Monica le carica e le manda; link: «apri» = cliccabile, «copia» = riquadro (PT E18); app ben impaginata anche su tablet Android e iPad. Il 07/11 (#17): fritto da Monica = sovrapprezzo UNICO per piatto (non a pezzo); solo tema chiaro; lucchetto 8 minuti; cliente non approvato: «Attendi che Monica accetti la tua richiesta»; Monica deve vedere subito le persone nuove; notifica → apre il punto giusto. Il 07/11 (#18): via il riquadro «Apri in Chrome», spinta forte a installare e notifiche; ordini di prova = giro normale col bollino «PROVA» (niente emoji fiala), fuori da incassi e spesa, scelta OBBLIGATORIA «Ordino davvero / Sto solo provando l'app» prima di «Invia» (solo per chi Monica non ha ancora accettato); modalità sviluppatore solo per Mario (7 tocchi sulla firma); scheda del piatto semplice senza togliere funzioni; un sistema unico per Mario e Monica (stessi gestori); tutti gli ordini fatti finora = prova.
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16: rinnovo da solo dell'iscrizione alle notifiche + `pushsubscriptionchange`; pagina Ordini (Nuovi/Oggi/Prossimi/Storico, cerca, filtri, `tempi`, scadenze, striscia 7 giorni); promemoria della sera (cron); «I miei ordini» del cliente; foto del menù (3, `foto/menu-N`, `menuFotoV`, «Manda le foto su WhatsApp»); tablet; avviso «è pronto» al cliente (C25); regole Firebase PUBBLICATE da Mario e provate dal vivo (07/11 ~16:15). Dalla #17: proposta di un altro giorno anche per cliente nuovo e ordini accettati + avviso «proposta» al cliente (C26); ordine «Non è partito» = secondo ordine prima dell'ok, ora messaggio chiaro (C26); C27-C34 fatti e online (notifiche col tipo e `#vai=`, riquadro persone nuove `foglioRichieste`, tema `only light`, niente lampeggio `.velo.fermo`/`scatta`, fritto `extraFritto`/`prezzoRiga`, `primiPassi` installa+notifiche, lucchetto `pit-lucchetto-via`); Samsung Internet: banner «Apri in Chrome» (`bannerSamsung`, `?h=`), PT E19. Dalla #18: C36 (`primiPassi` «Due tocchi e sei a posto», loghi in `media/` senza bianco nelle lettere), C35 (`o.prova`, `diProva`, `bollinoProva`, `listaProve`, `sceltaProva`/`sceltaManca`), C37 (notifica `primo` e `ordineProva` in `sw.js`/`worker.js`, `avvisoAttesa`), C38 modalità sviluppatore (`barraDev`, `sezioneDev`, `VERSIONE_APP`/`NOVITA` in `data.js`), C39 scheda del piatto a voci (`details.sez`, `UI.sez`), C40 «Segna come PROVA tutti gli ordini» (`dev-tutti-prova`).
- **Cosa preme a Mario adesso:** app semplice per Monica (non pratica di app) senza togliere funzioni; prove vere coi telefoni (Barbara, Monica). Prossimo: Impostazioni a voci come la scheda del piatto (proposto, aspetta la sua foto/ok). Vuole proposte smart, decide lui (PT E14).

## Stato (07/11 19:06 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 35 OK, nessun errore (07/11 ~17:50).
- Motore e regole: `npm install`, `npm run prova-firebase` → «88 OK, 0 NO» (07/11 ~17:45); regole non toccate.
- Sito: `python3 -I tools/sito.py` → «OK sito».
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima (https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH): versione 36, più vecchia del codice; ripubblicare con `Artifact` (`url`, `dist/anteprima.html`).
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#18)
Aperta da Mario a mano (catena a 8). Sveglia «Controllo promemoria sera» della #17 cancellata; NON rifatta: a profondità 8 `send_later` è bloccato. La #19 la rifà se serve (controllo di `/api/stato`, voce «promemoria», dopo le 19:05).
- File toccati: `app.js`, `style.css`, `data.js`, `dati.js` (`fuori` + 'prova'), `spesa.js` (niente prove nella spesa), `sw.js`, `worker.js`, `tools/prova.js` (37 OK), `media/logo-480.webp`, `logo-titolo.webp`, `logo-firma.webp`, `logo.png`, `docs/DA-FARE.md`, `docs/CHI-FA-COSA.md`.
- Fatti: a Monica alle 17:14 erano arrivate 2 notifiche «ordine» (diario `/api/stato`), ma non «persona nuova»: ora tipo `primo` (resta e vibra, senza pausa). Le regole Firebase NON servono per `prova` (la creazione dell'ordine non limita i campi).
- Da provare sul telefono vero (non fatto): barra sviluppatore col Google di Mario (`nomeGestore` deve iniziare con «Mario»), notifica `ordineProva`, scheda del piatto.
- Controllo Da fare: 3 voci aggiunte (C38, C39, C40).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Quelle delle sessioni 1-7: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` (link unico + richiesta, email-link, leggere `nomi/` dal telefono, lucchetto in anteprima, pronti come numero, ascoltare `foto/`, Gemini acceso, ecc.).
- `color-scheme: only light` contro il modo scuro di Samsung Internet: non basta (PT E19).
- Quelle delle sessioni 8-16 (Cloudflare «Connetti GitHub», dosi, stampantina, ecc.): `docs/lavori-in-corso/strade-scartate-sessioni-8-13.md`.

## Prossimi passi
1. Avvio: titolo verde; ricorda a Mario le righe di «Aspetta Mario».
2. Se Mario dà l'ok (o manda la foto della scheda del piatto): Impostazioni a voci come la scheda del piatto (`vImpostazioni`, stesso `details.sez`), senza togliere funzioni; foto prima/dopo.
3. Aspetta le foto di Mario: barra sviluppatore, «Segna come PROVA tutti gli ordini», notifica di un ordine di prova sul telefono di Monica, logo su Samsung, ordini di prova.
4. Poi: promemoria della sera (controllo `/api/stato`), promesse 👁 a lotti (C23), `CLAUDE.md` oltre il tetto (~1005 token: accorciare con la skill nuova-regola).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
07/11 ~19:00, parola per parola: «tutti gli ordini effettuati al momento sono stati prova segnali esempio vedo qui 4 ordini e 2 ordini quelli erano tutti come prova non incide nei dati gli ordini prova» → fatto: in Impostazioni → Sviluppatore il pulsante «Segna come PROVA tutti gli ordini fatti finora» (due tocchi, online `a8145c5`). Lo deve toccare Mario dal suo telefono (non ho accesso ai dati veri).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C38; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

