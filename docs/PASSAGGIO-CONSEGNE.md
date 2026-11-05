# Passaggio di consegne

Sessione attuale: #5 (dopo la #4 `session_01QTFEqR4jaQSUsJcA8P5FqD`, chiusa alla soglia 05/11 12:40; la apre la #4 con `create_session` (catena 4 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato; decori sardi delicati come sono (05/11, `docs/SPECIFICA.md` «Aspetto»). In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi).
- **Da non rifare:** domande già spiegate (PT E4); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (Mario ha risposto); schermate di Monica «Nuovi», «Telefono nuovo», Sì/No con Annulla, interruttore e prezzi (fatte il 05/11 dalla #4, sotto).
- **Cosa preme a Mario adesso:** avere l'app vera con i dati condivisi e il passaparola, così gli ordini delle amiche arrivano davvero a Monica; senza toccare i limiti delle sue altre app.

## Stato (05/11 12:40 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v0.7 (di prova).
- App: verifica `python3 -I tools/anteprima.py && node tools/prova.js` → 20 «OK» e «Nessun errore nella pagina».
- Motore e regole: `npm install`, poi `npm run prova-firebase` → «43 OK, 0 NO»; `npm run prova-regole` → «50 OK, 0 NO» (regole non toccate).
- Anteprima versione 13 pubblicata: https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH (verifica: Monica → Clienti mostra «Telefono nuovo» e «Nuovi»).
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C2, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#4)
- Avvio: titolo verde con ❔; sveglia «Preferenze a fine giornata» della #3 cancellata e rifatta mia (`trig_01XVzzyyYoqqidLShRBTsrHC`, 21:30). «Punto (ogni 5 ore)» è di un'altra chat: non toccata.
- `dati.js`: `decidi(uid, si)` in una transazione. Sì: crea `clienti/` (o ricollega al cliente con la stessa `chiave`), `utenti/` approvato, primo ordine `daApprovare` → `nuovo` col cliente, prende i pronti se ci sono ancora (se no `pronto: false` e Monica propone un giorno), teglie della settimana. No: `utenti/` `no`, ordine `rifiutato`. Restituisce `annulla()` (transazione inversa, 10 secondi). `S.richieste` ora ha `primo` e `cliente` (telefono nuovo di un cliente che c'è).
- `app.js`: «Da guardare» mostra il primo ordine del cliente nuovo con avviso e Sì/No; Clienti: «Telefono nuovo», «Nuovi», «Manda il link su WhatsApp» (`#da=monica`, tolto l'invito per nome), interruttore «Accetta clienti nuovi» (`impostazioni.nuovi`); prezzi: finché Monica non accetta, totale coi prezzi del menù e avviso se non torna; «Accetta», «Proponi» e «Accetta la modifica» scrivono i prezzi di Monica; «inviato» del cliente nuovo («Monica lo guarda e ti conferma lei»); notifica «Cliente nuovo: nome». Doppio tocco e Monica+Mario insieme: «Già fatto: l'ha deciso qualcun altro».
- `data.js` (prova): Laura Deiana col primo ordine o4 da approvare, Paolo Sanna «telefono nuovo» (c2); `prossimoNumero` 5. `tools/prova.js`: ordini 6 e 5, passo nuovo dei clienti. `tools/prova-firebase.js`: 15 controlli nuovi (ricollega, prezzo cambiato dal telefono, pronto finito, Annulla, No, interruttore).
- Risposta di Mario sui decori (alla #2 alle 09:32, arrivata qui con send_message): riga tolta da «Aspetta Mario», regola in `docs/SPECIFICA.md` «Aspetto». Riga nuova in «Aspetta Mario»: schermata Clienti con 2 foto.
- Riavvio del contenitore a metà: unite le scorte #2, #3 e la mia (conflitti solo in `docs/MESSAGGI-MARIO.md`, `ULTIMO-MESSAGGIO.md`, `ULTIMA-RISPOSTA.md`: tenuti tutti i messaggi, l'ultimo il più nuovo).
- File toccati: `dati.js`, `app.js`, `data.js`, `tools/prova.js`, `tools/prova-firebase.js`, `docs/SPEC-FIREBASE.md`, `docs/SPECIFICA.md`, `docs/DA-FARE.md`, `docs/CHI-FA-COSA.md`, `docs/MESSAGGI-MARIO.md`, `docs/ULTIMO-MESSAGGIO.md`, `docs/ULTIMA-RISPOSTA.md`, `archivio/foto/clienti-1-nuovi.png`, `archivio/foto/clienti-2-primo-ordine.png`, `docs/PASSAGGIO-CONSEGNE.md`, `docs/PROSSIMA-SESSIONE.md`.
- Controllo Da fare: 0 voci aggiunte (decori: risposta registrata; Firebase e Cloudflare già decisi; «continua» non chiede lavori nuovi).

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

## Prossimi passi
1. Ricordare a Mario le 3 righe di «## 0. Aspetta Mario» (Firebase, nome al primo ordine, schermata Clienti) e rimandare le 2 foto della riga «Principale 4».
2. Impronta o PIN per Monica (C1): lucchetto sul telefono con WebAuthn (l'impronta o il PIN del telefono, niente server). Prima l'occhio critico: telefono senza impronta, Monica cambia telefono, Mario gestore, prova automatica (Playwright ha l'autenticatore virtuale).
3. Rischio da valutare (non urgente): `scrivi()` di Monica confronta S con l'ultima copia del server; un cambio del server non ancora arrivato in S (circa 30 ms) può essere riscritto. Miglioria possibile: confronto con la copia da cui S è nato (base), non con quella attuale.
4. Idea da chiedere a Mario: dopo un «No» Monica non può ripensarci oltre i 10 secondi; una lista «Hai detto di no» con «Ripensaci».
5. Quando Mario scrive «Firebase»: passi a mano uno alla volta (progetto nuovo sul SUO account Google; nomi della console controllati sulla guida ufficiale). Poi la configurazione in `dati.js` e la prima entrata di Monica.
6. Sveglia delle 21:30 (`trig_01XVzzyyYoqqidLShRBTsrHC`, mia): cancellarla e rifarla tua con `send_later` (Preferenze v27 contro kit v35 → testo di `docs/kit-progetto/PREFERENZE-CHAT.txt` in un riquadro, una volta sola).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
«continua» (05/11 12:38, alla #4 dopo il riavvio del contenitore). Prima, alla #2 alle 09:32: «Non ho capito, allora Firebase può rimanere sul mio account con limiti separati che non influisce niente negli altri progetti? Sì, e allora ok. E poi Cloudflare invece devo creare un nuovo account, non mi ricordo. Per quello sardo sì, che non sia troppo pacchiano e troppo pesante, però sì, una cosa delicata che rispecchia le tradizioni sarde, ecco.»

## Numeri liberi
Prossimo PT E libero: PT E6; prossimo C libero: C12; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

