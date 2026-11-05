# Passaggio di consegne

Sessione attuale: #7 (dopo la #6 `session_01QTFEqQc4xdxWWJgwR1fXZB`, chiusa alla soglia 05/11 13:40; la apre la #6 con `create_session` (catena 6 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi).
- **Da non rifare:** domande già spiegate (PT E4); coda delle modifiche di Monica senza rete, foto C2 e parte «senza rete» di C3 (fatte dalla #6, sotto); lucchetto con impronta o PIN (fatto dalla #5, `lucchetto.js`); rischio «scrivi() riscrive cambi non ancora arrivati» (corretto dalla #5); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4, sotto).
- **Cosa preme a Mario adesso:** avere l'app vera con i dati condivisi e il passaparola, così gli ordini delle amiche arrivano davvero a Monica; senza toccare i limiti delle sue altre app.

## Stato (05/11 13:40 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v0.7 (di prova). Scorta `scorta-principale-20261105-01QTFEqQc4xd`: delle 12:39 UTC, superata dai commit dopo (tutto il lavoro è nel ramo), da NON unire.
- App: verifica `python3 -I tools/anteprima.py && node tools/prova.js` → 20 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «76 OK, 0 NO» (con `VEDI=1` stampa anche gli avvisi delle pagine); `npm run prova-regole` → «50 OK, 0 NO» (regole non toccate).
- Anteprima versione 13: https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH, NON ripubblicata dalla #5 né dalla #6 (nella prova non cambia niente: lucchetto, coda senza rete, foto e service worker ci sono solo coi dati veri). Ripubblicarla alla prossima modifica visibile (`python3 -I tools/anteprima.py` → `dist/anteprima.html`).
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#6)
- Avvio: titolo verde con ❔; sveglia «Preferenze a fine giornata» della #5 cancellata e rifatta mia (`trig_017v4uLiqHwJYdkLYiZA8AdK`, 21:30 ora italiana). «Punto (ogni 5 ore)» è di un'altra chat: non toccata. Rimandate a Mario le 5 foto (Clienti 2, lucchetto 3) e ricordate le 4 righe.
- **Monica senza rete all'apertura** (`dati.js`): prima le modifiche si perdevano («Non salvato: l'app non è ancora collegata»), contro la specifica. Ora si scrive anche con la base dalla copia di Firestore: le scritture restano in coda (anche ad app chiusa) e partono quando torna la rete; avviso «Senza rete: si salverà appena torna» anche quando il telefono crede di avere rete ma Firestore non risponde. Gestore riconosciuto anche senza rete; «Esci da questo telefono» aspetta la coda; `salvatoOk` usa `Dati.haDati()`.
- **Pronti e teglie come differenza** (`increment`): i pronti dello stesso giorno e formato e le teglie della settimana si scrivono come +1/−2, così quelli presi o ordinati intanto dai clienti restano. Dopo ogni scrittura la base si aggiorna (`dopo`): due salvataggi di fila non mandano due volte la stessa differenza (difetto trovato dalla prova).
- **C2 foto**: non si ascoltano più; il piatto ha `fotoV` (versione) e il telefono scarica la foto solo quando cambia, poi dalla copia di Firestore (`getDocFromCache`). Motivo: dopo 30 minuti fuori Firestore rimanda tutto e oltre 10 GiB al mese il piano gratis si spegne fino a fine mese (fonti in `docs/SPEC-FIREBASE.md`, riga «Foto»). Tetto 300 KB in `caricaFoto` (qualità fino a 0,5, poi foto più piccola). La copia veloce (localStorage) non tiene le foto (7 MB non ci starebbero).
- **Difetto trovato**: il nome scritto dalla cliente nuova si perdeva se la pagina si ridisegnava (una foto in arrivo); ora resta in `UI.foglio.scritto`.
- **C3 senza rete**: `sw.js` (pagina e file: prima la rete, dopo 3 s o senza rete la copia; libreria Firebase 13.2.0 e caratteri dalla copia) e `manifest.webmanifest`; nelle prove i service worker sono spenti, tranne la prova (h). Le notifiche vere restano: servono il Worker e l'account Cloudflare (C4).
- Prove: da 58 a 76 controlli in `tools/prova-firebase.js` (g: Monica senza rete; foto; h: app senza rete). App: 20 OK.
- File toccati: `dati.js`, `app.js`, `index.html`, `sw.js` (nuovo), `manifest.webmanifest` (nuovo), `tools/prova-firebase.js`, `docs/SPEC-FIREBASE.md`, `docs/DA-FARE.md`, `docs/DA-FARE-FATTE.md`, `docs/CHI-FA-COSA.md`, `docs/PASSAGGIO-CONSEGNE.md`, `docs/PROSSIMA-SESSIONE.md`.
- Controllo Da fare: 0 voci aggiunte (nessun messaggio di Mario in questa sessione). 1 riga nuova in «## 0. Aspetta Mario» (Principale 6: lista «Hai detto di no»).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Costruire l'app da zero: l'app esiste già (consegna in `archivio/`).
- Installare il kit con `installa.py`: il kit lo vieta.
- Link personale per cliente + link «richiesta»: Mario vuole UN link che tutti rigirano.
- Accesso di Monica via email-link: solo 5 email al giorno sul piano gratis.
- Worker sull'account Cloudflare comune: limiti per account (PT E5).
- Leggere `nomi/` dal telefono per sapere se il nome c'è: permetterebbe di scoprire chi è cliente; il telefono prova a scrivere e il rifiuto dice «nome già usato».
- Nuovi che prendono i pronti o le teglie: un link girato in un gruppo potrebbe bloccare i piatti; li prende Monica all'approvazione.
- Due ordini nella stessa scrittura: le regole vogliono il contatore +1 per scrittura → una transazione per ordine.
- Lasciare `S` con oggetti in comune con la copia del server: il confronto non vede i cambi (difetto corretto).
- Prova del motore con la libreria da gstatic nel browser di prova: si serve da `node_modules/firebase` (stessa 13.2.0) con `page.route`.
- Approvare con le scritture normali di Monica (S confrontato col server, a lotti): non è «tutto o niente» e con l'ultimo pronto conteso si potrebbe andare sotto zero; scelta la transazione con l'annulla inverso.
- Ricalcolare coi prezzi di oggi anche le righe già accettate quando arriva una modifica: le righe accettate tengono il loro prezzo.
- Leggere l'anteprima con `Artifact read` per ripubblicarla (969 KB nel contesto): basta `get_artifact` (solo la versione) e `publish_files`.
- Lucchetto anche nella versione di prova: nell'anteprima (riquadro di claude.ai) WebAuthn non è permesso e cadrebbe sempre in «senza blocco schermo»; le schermate si mostrano con le foto.
- Un PIN dell'app come riserva per i telefoni senza blocco schermo: un'altra cosa da ricordare per Monica; un telefono senza blocco è già aperto a tutti.
- Mettere la chiave senza Google quando manca (dati del sito cancellati a metà): chiunque col telefono potrebbe metterne una sua; serve l'entrata fresca o «Entra di nuovo con Google».
- Ascolti con `includeMetadataChanges` che ridisegnano a ogni cambio di metadati: ridisegni inutili a ogni salvataggio; si avvisa solo con dati cambiati o al primo «pronto».
- Bloccare le scritture di Monica finché non arriva il server (scelta della #5): le modifiche fatte senza rete si perdevano; la coda di Firestore le tiene anche ad app chiusa.
- Pronti e teglie scritti come numero: Monica con la copia vecchia rimetteva i pronti già presi dai clienti; scelta la differenza (`increment`), con la base aggiornata dopo ogni scrittura.
- Ascoltare la raccolta `foto/`: dopo 30 minuti fuori Firestore rimanda tutte le foto (fino a 7 MB per apertura) e i 10 GiB gratis del mese possono finire; scelta la versione nel piatto.
- Tenere le foto nella copia veloce (localStorage): 23 foto non ci stanno (limite ~5 MB) e la copia non si salverebbe più.
- Service worker con «prima la copia» per i file dell'app: le novità arriverebbero solo alla seconda apertura; scelta «prima la rete», copia dopo 3 secondi.

## Prossimi passi
1. Fatti dalla #7 (05/11): avvio, sveglia delle 21:30 rifatta mia (`trig_01M9LWsjdzhVxHEpJi8KAUQf`), C5 (tag og e immagine), C8 nell'emulatore, finestre senza perdita di testo, testo «Manda questo piatto a un'amica». Prove: app 21 OK; motore 80 OK, 0 NO.
2. Se Mario risponde «1» alla lista «Hai detto di no»: in fondo alla schermata Clienti, chiusa finché non si tocca; «Ripensaci» = transazione inversa del No (utenti/ → «nuovo», ordine rifiutato → «daApprovare»), con prova nell'emulatore.
3. Quando Mario scrive «Firebase»: passi a mano uno alla volta (progetto nuovo sul SUO account Google; nomi della console controllati sulla guida ufficiale). Poi la configurazione in `dati.js`, la prima entrata di Monica e la prova del lucchetto sul telefono vero.
4. C3 notifiche e C4 sito: servono l'account Cloudflare nuovo dell'app (Mario); chiederlo dopo Firebase. Col sito online: provare l'anteprima del link su WhatsApp (C5, «👁»); se l'indirizzo cambia (C10), cambiare anche og:url e og:image in `index.html` (la prova lo segnala).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
«continua» (05/11 12:38, alla #4 dopo il riavvio del contenitore). Prima, alla #2 alle 09:32: «Non ho capito, allora Firebase può rimanere sul mio account con limiti separati che non influisce niente negli altri progetti? Sì, e allora ok. E poi Cloudflare invece devo creare un nuovo account, non mi ricordo. Per quello sardo sì, che non sia troppo pacchiano e troppo pesante, però sì, una cosa delicata che rispecchia le tradizioni sarde, ecco.»

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C12; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

