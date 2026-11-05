# Passaggio di consegne

Sessione attuale: #6 (dopo la #5 `session_01QTFEqUTD1rwfGVfHvjoy5s`, chiusa alla soglia 05/11 13:07; la apre la #5 con `create_session` (catena 5 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi).
- **Da non rifare:** domande già spiegate (PT E4); lucchetto con impronta o PIN (fatto dalla #5, `lucchetto.js`); rischio «scrivi() riscrive cambi non ancora arrivati» (corretto dalla #5); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4, sotto).
- **Cosa preme a Mario adesso:** avere l'app vera con i dati condivisi e il passaparola, così gli ordini delle amiche arrivano davvero a Monica; senza toccare i limiti delle sue altre app.

## Stato (05/11 13:07 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v0.7 (di prova). Scorta `scorta-principale-20261105-01QTFEqUTD1r`: superata dal commit 17fa560 (stesso lavoro), da NON unire.
- App: verifica `python3 -I tools/anteprima.py && node tools/prova.js` → 20 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «58 OK, 0 NO»; `npm run prova-regole` → «50 OK, 0 NO» (regole non toccate).
- Anteprima versione 13: https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH, NON ripubblicata dalla #5 (nella prova non cambia niente: il lucchetto c'è solo coi dati veri). Ripubblicarla alla prossima modifica visibile (`python3 -I tools/anteprima.py` → `dist/anteprima.html`).
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C2, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#5)
- Avvio: titolo verde con ❔; sveglia «Preferenze a fine giornata» della #4 cancellata e rifatta mia (`trig_01AzhBDxYkAhjicx8qY2yL7H`, 21:30). «Punto (ogni 5 ore)» è di un'altra chat: non toccata.
- **Lucchetto** (`lucchetto.js`, WebAuthn senza server): appena entrata con Google (entrata «fresca» = `lastSignInTime` < 5 min) schermata «Proteggi la tua parte» → «Metti l'impronta»; a ogni apertura «La tua parte è chiusa», l'impronta si chiede da sola finita l'apertura animata (Chrome e Safari lo permettono senza tocco: issue W3C webauthn #1293, chiusa 02/04/2025); si richiude dopo N minuti fuori dall'app (`impostazioni.lucchetto`, passi 1-2-5-10-15-30-60, default 5); chiave persa → «Non funziona? Entra di nuovo con Google» (`Dati.rientra`, reauthenticateWithPopup, solo stesso account) → impronta nuova; senza chiave e senza entrata fresca → «Entra di nuovo»; telefono senza blocco schermo → parte aperta con avviso; Impostazioni → Lucchetto con «Esci da questo telefono» (due tocchi: `Dati.esci` chiude ascolti, terminate + clearIndexedDbPersistence, toglie `pit-copia-v1`, signOut; poi ricarica). Finché è chiusa la pagina non ha dati (anche la copia locale ha i clienti: per questo chiuso di partenza con `P.ruolo === 'monica'`).
- **Difetto vecchio corretto** (`dati.js`): riaperta l'app con la copia uguale al server, `io.pronto` non diventava mai vero (senza `includeMetadataChanges` il passaggio cache → server non arriva) e Monica non salvava, con «Salvato» a schermo. Ora gli ascolti hanno `includeMetadataChanges` e avvisano solo con dati cambiati o al primo «pronto»; senza collegamento: toast «Non salvato: l'app non è ancora collegata» e niente «Salvato».
- **scrivi() di Monica** confronta con `base` (la copia da cui S è nato), non con l'ultima arrivata: un cambio del server nei 30 ms prima del ridisegno non si riscrive e un documento nuovo non si cancella.
- Coi dati veri spariscono «Ricomincia la prova da capo» (cancellava ordini e clienti) e il suo comando.
- Prove: 15 controlli nuovi in `tools/prova-firebase.js` (autenticatore virtuale CDP; Monica su `localhost` perché WebAuthn non accetta l'IP). Foto: `archivio/foto/lucchetto-1-metti.png`, `-2-chiuso.png`, `-3-impostazioni.png` (mandate a Mario con le 2 della schermata Clienti).
- File toccati: `lucchetto.js` (nuovo), `app.js`, `dati.js`, `index.html`, `style.css`, `tools/anteprima.py`, `tools/prova-firebase.js`, `archivio/foto/lucchetto-*.png`, `docs/SPEC-FIREBASE.md`, `docs/DA-FARE.md`, `docs/DA-FARE-FATTE.md`, `docs/CHI-FA-COSA.md`, `docs/PASSAGGIO-CONSEGNE.md`, `docs/PROSSIMA-SESSIONE.md`.
- Controllo Da fare: 0 voci aggiunte (nessun messaggio di Mario in questa sessione).
- Spreco di token segnalato dall'hook: uscita di 355 KB (risultati della ricerca web) e avvio pesante; da fare: ricerche con domande strette, uscite lunghe in un file.

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

## Prossimi passi
1. Ricordare a Mario le 4 righe di «## 0. Aspetta Mario» (Firebase, nome al primo ordine, schermata Clienti, lucchetto) e rimandare le 5 foto delle righe «Principale 4» e «Principale 5» (due invii: 3 + 2).
2. Idea da chiedere a Mario: dopo un «No» Monica non può ripensarci oltre i 10 secondi; una lista «Hai detto di no» con «Ripensaci».
3. Occhio critico ancora aperto: l'app aperta SENZA rete da Monica mostra «Non salvato: l'app non è ancora collegata» (onesto, ma la modifica si perde al primo ridisegno). Valutare una coda locale delle modifiche fatte prima del primo collegamento.
4. Quando Mario scrive «Firebase»: passi a mano uno alla volta (progetto nuovo sul SUO account Google; nomi della console controllati sulla guida ufficiale). Poi la configurazione in `dati.js`, la prima entrata di Monica e la prova del lucchetto sul telefono vero.
5. C2 (foto dentro Firestore, 900 px, JPEG 0,8, tetto 300 KB) e C3 (notifiche e senza rete) dopo, in quest'ordine.
6. Sveglia delle 21:30 (`trig_01AzhBDxYkAhjicx8qY2yL7H`, mia): cancellarla e rifarla tua con `send_later` (Preferenze v27 contro kit v35 → testo di `docs/kit-progetto/PREFERENZE-CHAT.txt` in un riquadro, una volta sola).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
«continua» (05/11 12:38, alla #4 dopo il riavvio del contenitore). Prima, alla #2 alle 09:32: «Non ho capito, allora Firebase può rimanere sul mio account con limiti separati che non influisce niente negli altri progetti? Sì, e allora ok. E poi Cloudflare invece devo creare un nuovo account, non mi ricordo. Per quello sardo sì, che non sia troppo pacchiano e troppo pesante, però sì, una cosa delicata che rispecchia le tradizioni sarde, ecco.»

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C12; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

