# Passaggio di consegne

Sessione attuale: #8 (dopo la #7 `session_01QTFEqRY58R5Wqc31NCsaiq`, chiusa alla soglia 05/11 14:39; la apre la #7 con `create_session` (catena 7 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»); immagine dell'anteprima del link su WhatsApp approvata (05/11); Gemini in Firebase spento; progetto Firebase «Pronti in Tavola» creato sul suo account (Piano Spark). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi).
- **Da non rifare:** domande già spiegate (PT E4); coda delle modifiche di Monica senza rete, foto C2 e parte «senza rete» di C3 (fatte dalla #6, sotto); lucchetto con impronta o PIN (fatto dalla #5, `lucchetto.js`); rischio «scrivi() riscrive cambi non ancora arrivati» (corretto dalla #5); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4); C5 (tag e immagine del link), C8 (niente striscia di prova coi dati veri), testo e tastiera nelle finestre, passi 1-2 di Firebase e `firebaseConfig` in `dati.js` (fatti dalla #7, sotto); la regola «guida sbagliata → quella giusta in `docs/GUIDE-GIUSTE.md`» (Mario 05/11, già nel `CLAUDE.md`).
- **Cosa preme a Mario adesso:** avere l'app vera con i dati condivisi e il passaparola, così gli ordini delle amiche arrivano davvero a Monica; senza toccare i limiti delle sue altre app.

## Stato (05/11 14:39 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v0.7 (di prova).
- App: verifica `python3 -I tools/anteprima.py && node tools/prova.js` → 22 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «80 OK, 0 NO» (con `VEDI=1` stampa anche gli avvisi delle pagine); `npm run prova-regole` → «50 OK, 0 NO» (regole non toccate).
- Anteprima versione 13: https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH, NON ripubblicata dalla #5, #6 né #7 (nella prova non cambia niente: lucchetto, coda senza rete, foto e service worker ci sono solo coi dati veri). Ripubblicarla alla prossima modifica visibile (`python3 -I tools/anteprima.py` → `dist/anteprima.html`).
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#7)
- Avvio: titolo verde; sveglia delle 21:30 della #6 cancellata e rifatta mia (`trig_01M9LWsjdzhVxHEpJi8KAUQf`, «Preferenze a fine giornata»: Preferenze v27 contro kit v35, testo di `docs/kit-progetto/PREFERENZE-CHAT.txt` in un riquadro, una volta sola; «Punto (ogni 5 ore)» è di un'altra chat). Unite le scorte della #6 e della #7 (riavvio). Foto delle righe 4 e 5 rimandate.
- **C5**: tag og in `index.html` (indirizzo di `indirizzoApp`) e immagine 1200×630 da 139 KB (`media/anteprima-link-1.jpg`, disegnata da `tools/immagine-link.js`: logo, «Cucina di casa», «Ordina e ritira», bordura a rombi). Mario l'ha approvata. `tools/prova.js` controlla indirizzo, descrizione e peso; se l'indirizzo cambia (C10) cambiano anche og:url e og:image. Si vede su WhatsApp solo col sito online (C4).
- **Difetto corretto**: se arrivava un cambio mentre si scriveva in una finestra (nota del piatto, nome), la tastiera si chiudeva e il testo spariva: `staScrivendo()` ora guarda anche `#foglio`; prova nuova in `tools/prova-firebase.js`. Tolto il codice morto dell'invito personale; «Manda questo piatto a un'amica» col testo del passaparola e senza `#da=` vuoto. **C8** chiuso nell'emulatore (cliente senza striscia di prova).
- **Firebase con Mario** (dal telefono, console in italiano): passo 1 progetto creato (Piano Spark); passo 2 app web registrata, `firebaseConfig` messo in `dati.js` (non segreto; repo pubblico). `tools/anteprima.py` la toglie dall'anteprima di prova (controllo in `tools/prova.js`). Passo 3 mandato a Mario (Firestore a Milano, accesso Anonimo e Google): aspetta il suo «fatto».
- **Guida sbagliata**: la mia guida diceva «icona Web al centro»; nella sua console c'è **+ Aggiungi app** → **Web**. Mario: ogni volta che sbaglio una guida segno quella giusta su GitHub, e la consulto ogni volta che se ne parla → `docs/GUIDE-GIUSTE.md`, regola nel `CLAUDE.md`, PT E6, voce C12 (portare nel kit). Da leggere PRIMA di ogni guida.
- Prove: app 22 OK; motore 80 OK, 0 NO; test del kit verdi. File toccati: `index.html`, `app.js`, `dati.js`, `media/anteprima-link-1.jpg`, `tools/{immagine-link,anteprima,prova,prova-firebase}`, `CLAUDE.md`, `docs/{GUIDE-GIUSTE,SPEC-FIREBASE,DA-FARE,DA-FARE-FATTE,ERRORI,STORIA-REGOLE,PASSAGGIO-CONSEGNE,PROSSIMA-SESSIONE,CHI-FA-COSA}.md`.
- Controllo Da fare: 1 voce aggiunta (C12). Righe di «Aspetta Mario»: Principale 7 tappa 3 (nuova, al posto di tappa 1 e 2), Principale 3, 4, 5, 6 (immagine approvata e Firebase tappa 1: tolte, Mario ha risposto).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Link personale per cliente + link «richiesta»: Mario vuole UN link che tutti rigirano.
- Accesso di Monica via email-link: solo 5 email al giorno sul piano gratis.
- Leggere `nomi/` dal telefono per sapere se il nome c'è: permetterebbe di scoprire chi è cliente; il telefono prova a scrivere e il rifiuto dice «nome già usato».
- Nuovi che prendono i pronti o le teglie: un link girato in un gruppo potrebbe bloccare i piatti; li prende Monica all'approvazione.
- Due ordini nella stessa scrittura: le regole vogliono il contatore +1 per scrittura → una transazione per ordine.
- Approvare con le scritture normali di Monica (S confrontato col server, a lotti): non è «tutto o niente» e con l'ultimo pronto conteso si potrebbe andare sotto zero; scelta la transazione con l'annulla inverso.
- Lucchetto anche nella versione di prova: nell'anteprima (riquadro di claude.ai) WebAuthn non è permesso e cadrebbe sempre in «senza blocco schermo»; le schermate si mostrano con le foto.
- Mettere la chiave senza Google quando manca (dati del sito cancellati a metà): chiunque col telefono potrebbe metterne una sua; serve l'entrata fresca o «Entra di nuovo con Google».
- Bloccare le scritture di Monica finché non arriva il server (scelta della #5): le modifiche fatte senza rete si perdevano; la coda di Firestore le tiene anche ad app chiusa.
- Pronti e teglie scritti come numero: Monica con la copia vecchia rimetteva i pronti già presi dai clienti; scelta la differenza (`increment`), con la base aggiornata dopo ogni scrittura.
- Ascoltare la raccolta `foto/`: dopo 30 minuti fuori Firestore rimanda tutte le foto (fino a 7 MB per apertura) e i 10 GiB gratis del mese possono finire; scelta la versione nel piatto.
- Service worker con «prima la copia» per i file dell'app: le novità arriverebbero solo alla seconda apertura; scelta «prima la rete», copia dopo 3 secondi.
- Configurazione vera di Firebase anche nell'anteprima di prova: il riquadro di claude.ai si collegherebbe ai dati veri; scelta `FIREBASE_CONFIG = null` nell'anteprima (`tools/anteprima.py`).
- Gemini in Firebase acceso («azione consigliata»): non serve (il codice lo scrivo io) e può usare i prompt per addestrarsi; spento.
- Guide giuste dentro ogni documento del servizio: un file solo, `docs/GUIDE-GIUSTE.md`, vale per Firebase, Cloudflare, GitHub.
- Guida per Firebase a memoria o solo dalla guida ufficiale: la console di Mario aveva un pulsante diverso; prima `docs/GUIDE-GIUSTE.md`, poi la guida ufficiale con la data, e chiedere una foto al primo passo.

## Prossimi passi
1. Ricordare a Mario le 5 righe di «## 0. Aspetta Mario» (Firebase tappa 3, nome al primo ordine, schermata Clienti, lucchetto, lista «Hai detto di no»), una riga ciascuna, e rimandare le 5 foto delle righe «Principale 4» e «Principale 5» (2 + 3). Sveglia delle 21:30: rifatta dalla #8 (`trig_01XuT1kCsBQ4VoagHHMTGq7R`).
2. **Firebase tappa 3** (aspetta il «fatto» di Mario): prima di rispondere leggere `docs/GUIDE-GIUSTE.md` e «Dove siamo» in `docs/SPEC-FIREBASE.md`. Se Mario scrive che un pulsante non c'è, o manda una foto diversa: correggere subito `docs/GUIDE-GIUSTE.md` (regola di Mario). Chiedere a Mario una foto della Panoramica di Firestore a fine passo, per controllare posizione (Milano) e che il database sia uno solo.
3. Poi **tappa 4**: regole. Mario le incolla da **Firestore** → scheda **Regole** → **Pubblica**: mandargli `firestore.rules` (188 righe) in un riquadro solo, e provare dopo con l'app vera (non dal telefono di Mario: `?emulatore` non c'è, serve il sito online o `localhost` con la configurazione vera; leggere solo, mai scrivere dati finti nel suo progetto). **Tappa 5**: entrare con Google nell'app e creare `gestori/<id>` per Mario e Monica (vedi `docs/SPEC-FIREBASE.md`).
4. Il sito online serve per l'entrata con Google (dominio autorizzato) e per vedere l'anteprima del link su WhatsApp (C5, «👁»): C4 con l'account Cloudflare nuovo dell'app (Mario). Chiederlo appena Firebase tappa 3 è fatta. Se l'indirizzo cambia (C10), cambiare og:url e og:image in `index.html` (la prova lo segnala).
5. Se Mario risponde «1» alla lista «Hai detto di no»: in fondo alla schermata Clienti, chiusa finché non si tocca; «Ripensaci» = transazione inversa del No (utenti/ → «nuovo», ordine rifiutato → «daApprovare»), con prova nell'emulatore.
6. Chiave web `AIza…` in un repo pubblico: non è segreta, ma più avanti, col sito online, restringerla agli indirizzi del sito (console Google Cloud → API e servizi → Credenziali: guida da verificare e da scrivere in `docs/GUIDE-GIUSTE.md`).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
05/11 ~14:36, `firebaseConfig` incollato come testo (parola per parola; non è segreto): «const firebaseConfig = { apiKey: "AIzaSyDagZOV9P1sER30TLq24i2ybZlZ0sQqFdE", authDomain: "pronti-in-tavola.firebaseapp.com", projectId: "pronti-in-tavola", storageBucket: "pronti-in-tavola.firebasestorage.app", messagingSenderId: "340961319417", appId: "1:340961319417:web:0c1e6c4a9b894bc187c528" }; // Initialize Firebase const app = initializeApp(firebaseConfig);»
Prima: «se ne parliamo la consulti» · «ogni vokta che vedi che sbagli una guida segna quella giusta su github» · «salvalo cosí ti ricordi» · «fatto» (tappa 1) · «immagine anteprima ok firebase manda guida».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C14; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

