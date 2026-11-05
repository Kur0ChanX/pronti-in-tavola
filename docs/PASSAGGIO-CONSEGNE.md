# Passaggio di consegne

Sessione attuale: #9 (dopo la #8 `session_01QTFEqSmQascLxb6RP3Wyih`, chiusa alla soglia 05/11 20:00; la apre la #8 con `create_session` (catena 7 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»); immagine dell'anteprima del link su WhatsApp approvata (05/11); Gemini in Firebase spento; progetto Firebase «Pronti in Tavola» creato sul suo account (Piano Spark). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi). Poi, il 05/11 (#8): **soglia della catena Principale a 320k** (`docs/misure/prova-soglia.json`); **app più semplice**: le scelte le fa Claude e le dice (ok «1ok» ambiguo, vedi Aspetta Mario); **«Persone rifiutate»** sì («1 ok»); Cloudflare: account nuovo solo dell'app, mai condiviso.
- **Da non rifare:** domande già spiegate (PT E4); coda delle modifiche di Monica senza rete, foto C2 e parte «senza rete» di C3 (fatte dalla #6, sotto); lucchetto con impronta o PIN (fatto dalla #5, `lucchetto.js`); rischio «scrivi() riscrive cambi non ancora arrivati» (corretto dalla #5); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4); C5 (tag e immagine del link), C8 (niente striscia di prova coi dati veri), testo e tastiera nelle finestre, passi 1-2 di Firebase e `firebaseConfig` in `dati.js` (fatti dalla #7, sotto); la regola «guida sbagliata → quella giusta in `docs/GUIDE-GIUSTE.md`» (Mario 05/11, già nel `CLAUDE.md`).; Firebase tappe 3 e 4 (database `(default)` creato, accessi Anonimo e Google, regole incollate: Mario ha scritto «fatto» senza foto del timbro «Pubblicato»); C13 app più semplice e C14 «Persone rifiutate» (fatte dalla #8, sotto).
- **Cosa preme a Mario adesso:** avere l'app vera con i dati condivisi e il passaparola, così gli ordini delle amiche arrivano davvero a Monica; senza toccare i limiti delle sue altre app.

## Stato (05/11 20:00 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. `main` = versione pubblicata (creata il 05/11, portata a 51b56fc dopo il giro verde in locale: app 23, regole 50, motore 83). Anteprima ripubblicata il 05/11 20:37 (C13, C14, nome del sito).
- App: verifica `python3 -I tools/anteprima.py && node tools/prova.js` → 23 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «83 OK, 0 NO»; `npm run prova-regole` → «50 OK, 0 NO» (regole non toccate; `firestore.rules` è anche quella incollata da Mario nella console).
- Anteprima su claude.ai (https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH): ancora la versione 13, NON ripubblicata dalla #5 alla #8 (ora cambia molto: app più semplice e rifiutati). Prima di ripubblicare serve `Artifact read` dell'URL, poi publish con `url` e `dist/anteprima.html`.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello scritto nella riga «Principale» di `docs/CHI-FA-COSA.md` (lo legge `handoff-check.py`): la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#8)
- Avvio: titolo verde; sveglia «Preferenze a fine giornata» rifatta mia (`trig_01XuT1kCsBQ4VoagHHMTGq7R`, 21:30 ore italiane); catena Principale 8 in `docs/CHI-FA-COSA.md`.
- **Soglia** della catena a 320k (Mario: «porta questa sessione a 320mila»); parere dato: ~100k solo di partenza, 320k è un buon compromesso.
- **C13 app più semplice** (Mario: «molto più semplice e chiara per clienti e Monica, valuta tu e dimmi cosa hai scelto»): barra del cliente a 2 voci (Menù, I miei ordini); «Aa» (testo grande) in alto; allergie in un riquadro in cima al menù (finestra); una sola nota, nel carrello; con solo «contanti» il pagamento è una riga; indirizzo e Maps in «I miei ordini» dopo l'ordine più recente (via le schede «Ritiro» e «Io»); Impostazioni di Monica: Pausa, Pronti, Testo grande; il resto sotto «Altre impostazioni (le sistema Mario)», chiuse. 4 foto mandate (`archivio/foto/semplice-*.png`), ok di Mario da avere.
- **C14 «Persone rifiutate»**: in fondo a Clienti (chiusa, appare solo se c'è qualcuno); «Accetta» = il Sì di sempre in un tocco (`decidi` accetta anche un telefono in stato «no», il «No» ora salva `era`). Prove nuove in `tools/prova.js` e `tools/prova-firebase.js`. Da guardare: dopo «Accetta» + «Annulla» il telefono del cliente, nella prova, non ha riletto il «No» dal vivo (riaperta l'app sì): controllare coi telefoni veri.
- **Firebase** con Mario dal telefono: tappa 3 (database `(default)`, passi 1-4 della finestra «Crea un database», produzione, niente backup/Blaze; Anonimo abilitato, Google con nome pubblico «Pronti in Tavola» e la sua email di assistenza) e tappa 4 (188 righe incollate, viste nelle foto). Nomi veri salvati in `docs/GUIDE-GIUSTE.md`. Non verificati: posizione del database (guida: Milano; toccare la «i» accanto a «(default)») e timbro «Pubblicato».
- Mario ha chiesto se aver scelto «Europa 3» in un'altra sua app cambia qualcosa: risposto, nessun danno (due app, due progetti separati).
- Cloudflare passo 1 mandato (account nuovo con `mario.miscera+pronti@gmail.com`, piano Free): aspetta il suo «fatto». Lezione PT E7 (nomi miei senza esempio).
- File toccati: `app.js`, `dati.js`, `style.css`, `tools/prova.js`, `tools/prova-firebase.js`, `docs/{DA-FARE,ERRORI,GUIDE-GIUSTE,SPEC-FIREBASE,STORIA-REGOLE,CHI-FA-COSA,PASSAGGIO-CONSEGNE,PROSSIMA-SESSIONE}.md`, `docs/misure/prova-soglia.json`, `archivio/foto/{semplice-1..4,rifiutati-1}.png`.
- Controllo Da fare: 2 voci aggiunte (C13, C14). Righe di «Aspetta Mario»: Cloudflare passo 1, app più semplice, rifiutati (nuove) + Principale 3, 4, 5 (restano). Tappa 3 e 4 e «lista rifiutati sì/no»: tolte (Mario ha risposto).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Quelle delle sessioni 1-7: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` (link unico + richiesta, email-link, leggere `nomi/` dal telefono, lucchetto in anteprima, pronti come numero, ascoltare `foto/`, Gemini acceso, ecc.).
- «Accetta» in due tocchi (prima «Ripensaci» che rimanda tra i Nuovi, poi Sì): scartata, Monica ha già sbagliato una volta; un tocco solo.
- Database Firestore in «modalità di test»: si blocca dopo 30 giorni e intanto è aperto a tutti; scelta la produzione con le nostre regole. Piano Blaze (backup): a pagamento, no.
- Cloudflare con un token API per pubblicare io: un segreto in più; scelto il collegamento con GitHub (Mario autorizza solo questo repo).
- Sito su `main`: il ramo non esiste; per ora il sito di prova segue il ramo di lavoro (nessun cliente ha il link), `main` con PR e prove verdi prima di darlo ai clienti.
- Cloudflare con l'email alias `mario.miscera+pronti@gmail.com`: rifiutata da Cloudflare (05/11 20:28, «Only one variation is allowed»); scelta l'account Free aggiuntivo dallo stesso login.
- Spiegare «lista Hai detto di no» senza esempio: Mario non l'ha capita (PT E7).

## Prossimi passi
1. Avvio: ricordare le 6 righe di «## 0. Aspetta Mario» (una riga ciascuna) e rimandare le foto: `semplice-1..4`, `rifiutati-1`, `clienti-1-nuovi`, `clienti-2-primo-ordine`, `lucchetto-1..3` (E240). Sveglie: cancellare `trig_01XuT1kCsBQ4VoagHHMTGq7R` e rifarla tua (`send_later`, 21:30 ore italiane, «Preferenze a fine giornata»). Mettere il tuo id nella riga Principale di `docs/CHI-FA-COSA.md` (soglia 320k).
2. **Cloudflare (C4)**, quando Mario scrive «fatto» al passo 1 (se rifiuta il «+» nell'email: altra email). Prima leggere `docs/GUIDE-GIUSTE.md`, poi la guida ufficiale con Context7 (`/websites/developers_cloudflare_pages`): **Workers & Pages** → **Create application** → scheda **Pages** → **Import an existing Git repository** → GitHub: autorizzare SOLO il repo `pronti-in-tavola` → nome `pronti-in-tavola`, ramo di produzione `claude/pronti-ramo-definitivo` (non c'è `main`), comando di build, cartella di uscita. Non ripetere questi nomi come certi: non visti da Mario. Serve uno script (`tools/sito.py`, da scrivere e provare) che copia in `sito/` solo i file dell'app (`index.html`, `style.css`, `data.js`, `dati.js`, `app.js`, `lucchetto.js`, `sw.js`, `manifest.webmanifest`, `media/`) col `firebaseConfig` vero (l'anteprima lo toglie, il sito no). Poi: indirizzo vero in `data.js` e `index.html` (C10, la prova lo controlla) e il dominio in Firebase **Autenticazione** → **Impostazioni** → domini autorizzati (nome da controllare).
3. **Firebase tappa 5**: Mario entra con Google nel sito; creare a mano `gestori/<uid>` per Monica e per Mario (console → Firestore → Dati; l'uid sta in Autenticazione → Utenti). Poi prova coi telefoni veri (leggere, mai scrivere dati finti) e controllare la posizione del database e il timbro «Pubblicato».
4. Ripubblicare l'anteprima (versione con C13 e C14) dopo l'ok alle foto; se Mario chiede cambi, farli prima.
5. Aspetta Mario 3 («nome del cliente nuovo») e le altre: appena risponde, farle.
6. Più avanti: restringere la chiave web `AIza…` agli indirizzi del sito (guida da verificare e da scrivere in `docs/GUIDE-GIUSTE.md`); notifiche a Monica (C3, Worker di Cloudflare nel suo account).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
05/11 20:25 (nella chat della #8), parola per parola: «non usa altri limiti se lo metto cloudflare in mario.miscera@gmail.com?». Risposta della #8: i limiti sono per account, non per email; strade: (a) stessa email ma account Free aggiuntivo (dashboard → Accounts, utente da 7+ giorni, fino a 5), (b) alias `+pronti`, (c) iscriversi normalmente. Alle 20:28 la foto di Mario ha mostrato l'alias rifiutato (l'email ha già un account): resta la strada (a), passi in `docs/GUIDE-GIUSTE.md` «Cloudflare». Prima, 05/11 ~20:00: «1ok». Prima (alla mia domanda «Persone rifiutate? 1 sì / 2 no»): «in che senso lista ho detto di no? sei sicuro?» · prima ancora: «lista ho detto di no cosa?» · «fatto» (tappa 4 regole) · «fatto» (tappa 3B) · «Cavolo, io in un'altra app che avevo creato ho messo Europa 3… Cambia qualcosa nella mia app per l'albergo RVC?» · «porta questa sessione a 320mila in catena a max token prima di passaggio di consegna» · «manda guida firebase parte 3 e rendi l'app molto più in play semplice e chiara per i clienti e Monica valuta tu le scelte e dimmele… per monica l'aiuto io».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C15; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

