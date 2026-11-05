# Passaggio di consegne

Sessione attuale: #4 (dopo la #3 `session_01QTFEqS6SnpDQrcYm57NxM7`, chiusa alla soglia 05/11 09:18; la apre la #3 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato. In `docs/SPECIFICA.md`: **passaparola** con link unico che tutti rigirano, menù visibile, il nuovo scrive il SUO nome (diverso da quelli usati), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN a ogni apertura; **indipendenza**: Firebase = progetto nuovo sull'account Google di Mario, Cloudflare = account nuovo solo dell'app, mai condiviso neanche all'1% (niente account Google nuovi).
- **Da non rifare:** domande già spiegate (PT E4); ricerca sui piani Firebase (fonti in `docs/SPEC-FIREBASE.md`); specifica 0.2, regole e motore dati col passaparola (fatti il 05/11, sotto); foto dei decori (in `archivio/foto/`, già mandate due volte).
- **Cosa preme a Mario adesso:** avere l'app vera con i dati condivisi e il passaparola, così gli ordini delle amiche arrivano davvero a Monica; senza toccare i limiti delle sue altre app.

## Stato (05/11 09:18 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta.
- App v0.7 di prova invariata per chi la usa. Verifica: `python3 -I tools/anteprima.py && node tools/prova.js` → 19 «OK» e «Nessun errore nella pagina».
- Specifica `docs/SPEC-FIREBASE.md` **0.2** col passaparola (raccolte `utenti/`, `nomi/`, `impostazioni/approvati`; stati `nuovo`, `ricollega`, `approvato`, `no`; ordine `daApprovare`). Verifica: in testa «Versione 0.2».
- Regole `firestore.rules` col passaparola. Verifica: `npm install` poi `npm run prova-regole` → «50 OK, 0 NO». Controprova: con regole aperte 34 NO; tre regole indebolite apposta (accettaNuovi, primo ordine, `primo == id`) scoperte.
- Motore `dati.js` (nuovo, spento: `FIREBASE_CONFIG = null`; si accende con la configurazione o con `?emulatore`). Lo usano `carica()`, `salva()`, `avviaDati()` e `inviaVero()` in fondo ad `app.js`. Verifica: `npm run prova-firebase` (emulatori Firestore + Auth, libreria da `node_modules/firebase`) → «28 OK, 0 NO».
- Anteprima pubblicata (versione 12, con i decori): https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH. NON ripubblicata: niente di visibile è cambiato (con `?prova`/senza configurazione il motore è spento).
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → 21 verdi.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C2, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#3)
- Avvio: titolo verde con ❔, sveglia «Preferenze a fine giornata» rifatta mia (`trig_0188qdAMXXMNTGaAQF8KYFEV`, 21:30). Nessuna sveglia della #2 da cancellare (quella «Punto ogni 5 ore» è di un'altra chat: non toccata).
- Uniti i commit della #2 arrivati dopo l'avvio (Firebase sul conto di Mario, Cloudflare nuovo).
- Specifica 0.2, regole e 50 prove (sopra).
- `dati.js`: copia sul telefono (`pit-copia-v1`), ascolti per ruolo (Monica tutto; cliente: menù, impostazioni pubbliche, suo `utenti/`, suoi ordini; approvato anche indirizzo e `clienti/<suo>`), Monica scrive solo i campi cambiati (batch), database vuoto → carica i 23 piatti (`preparaVuoto`), settimane ricalcolate da Monica (`contaSettimane`). Cliente: `registra()` (nome unico o «ricollega»), `inviaOrdini()` (una transazione per ordine: contatore, pronti di oggi, teglie, `primo` per i nuovi), `scriviCliente()` per annulla/proposta/«Ho pagato»/cuori.
- `app.js`: niente striscia di prova col motore acceso; «Sei Monica? Entra» (Google) in fondo; mentre si scrive in un campo non si ridisegna; foglio «Come ti chiami?» al primo ordine (scelta 1, in attesa di conferma); «l'ha appena preso qualcun altro» → riga da prenotare; senza rete resta nel carrello e riparte da sola; link «Manda a un'amica» con `#da=<cliente>`; stato `daApprovare` («Aspetta Monica» / «Cliente nuovo»).
- Difetti trovati dalle prove e corretti: S condivideva oggetti con la copia del server (le modifiche dentro oggetti non partivano); il cliente senza `utenti/` non apriva gli ascolti.
- File toccati: `dati.js` (nuovo), `app.js`, `index.html`, `tools/anteprima.py`, `tools/prova-firebase.js` (nuovo), `tools/prova-regole.js`, `firestore.rules`, `firebase.json` (emulatore Auth 9099), `package.json` (script `prova-firebase`), `package-lock.json`, `docs/SPEC-FIREBASE.md`, `docs/DA-FARE.md`, `docs/DA-FARE-FATTE.md`, `docs/CHI-FA-COSA.md`, `docs/PASSAGGIO-CONSEGNE.md`, `docs/PROSSIMA-SESSIONE.md`, `archivio/consumo/`.
- Controllo Da fare: 0 voci aggiunte (nessun messaggio di Mario in questa sessione); 1 riga nuova in «Aspetta Mario» (quando chiedere il nome).
- Avviso spreco: avvio pesante (170k dopo il primo turno, tetto 130k). Detto a Mario. Lavorare con `grep -n -o` e pezzi corti.

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

## Prossimi passi
1. Ricordare a Mario le 3 righe di «## 0. Aspetta Mario» (decori con le foto, creare Firebase, quando chiedere il nome), una riga ciascuna.
2. C1/C11, schermate di Monica col motore acceso: «Nuovi» (Sì: crea `clienti/`, mette `utenti/` approvato e l'ordine `daApprovare` → `nuovo`, prende i pronti se ci sono ancora sennò propone un giorno; No: stato `no`), «Telefono nuovo» (Ricollega al cliente con la stessa `chiave`), interruttore «Accetta nuovi clienti» (`impostazioni/app.nuovi`), totale ricalcolato coi prezzi di Monica. Oggi `S.richieste` arriva da `utenti/` ma «Sì/No» scrivono ancora come la prova: vanno rifatti per il motore. Poi casi in `tools/prova-firebase.js`, tutto verde (19 + 50 + 28).
3. Schermata «inviato» per il cliente nuovo («Monica ti conferma lei»); impronta o PIN per Monica con WebAuthn (lucchetto locale).
4. Quando Mario scrive «Firebase»: passi a mano uno alla volta (progetto nuovo sul SUO account Google; nomi della console da controllare sulla guida ufficiale). Poi la configurazione in `dati.js` e la prima entrata di Monica.
5. Sveglia delle 21:30 (già fatta): Preferenze v27 contro kit v35 → testo di `docs/kit-progetto/PREFERENZE-CHAT.txt` in un riquadro, una volta sola.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
«Ok, Firebase sul mio account, confermo Cloudflare, faccio un nuovo account, non voglio che si utilizzi mai neanche l'1% in condivisione.»
(Arrivato alla #2 dopo il suo handoff; in `docs/SPECIFICA.md` «Indipendenza». Alla #3 Mario non ha scritto.)

## Numeri liberi
Prossimo PT E libero: PT E6; prossimo C libero: C12; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).
