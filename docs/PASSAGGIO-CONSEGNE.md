# Passaggio di consegne

Sessione attuale: #3 (dopo la #2 `session_01QTFEqS28bRVosA9LwXjudR`, chiusa alla soglia 05/11 08:51; la apre la #2 con `create_session` (catena 2 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase; solo contanti; Kit RVC installato. Nuovo il 05/11 (in `docs/SPECIFICA.md`): **passaparola** con link unico che tutti possono rigirare, menù visibile, il nuovo utente scrive il SUO nome (diverso da quelli già usati, così Monica sa chi ordina), Monica approva al primo ordine, indirizzo e ordini solo agli approvati; **Monica** entra con Google una volta + impronta o PIN del telefono a ogni apertura; **indipendenza**: l'app non usa i limiti gratuiti di altre app (Firebase per progetto, Cloudflare per account) e non pesa su di esse (PT E5).
- **Da non rifare:** domande già spiegate (PT E4); ricerca sui piani Firebase (fatta il 05/11, fonti in `docs/SPEC-FIREBASE.md`); regole di sicurezza e prove nell'emulatore (fatte, da adattare al passaparola); foto dei decori (in `archivio/foto/`).
- **Cosa preme a Mario adesso:** avere l'app vera con i dati condivisi e il passaparola, così gli ordini delle amiche arrivano davvero a Monica; senza toccare i limiti delle sue altre app.

## Stato (05/11 08:51 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Scorta `scorta-principale-20261105-01QTFEqS28bR/claude/pronti-ramo-definitivo`: da NON unire (solo una cache Python, superata: `__pycache__` ora è in `.gitignore`).
- App v0.7 di prova (dati solo sul telefono) + decori sardi, NON ancora toccata per Firebase. Verifica: `python3 -I tools/anteprima.py && node tools/prova.js` → 19 «OK» e «Nessun errore nella pagina».
- Regole di sicurezza `firestore.rules` (modello «link personale», da adattare al passaparola). Verifica: `npm install` (strumenti solo per le prove, `node_modules` ignorato) poi `npm run prova-regole` → «30 OK, 0 NO». Controprova fatta: con regole aperte 23 NO.
- Specifica `docs/SPEC-FIREBASE.md` v0.1: piano gratis Spark, foto dentro Firestore (Storage e Functions vogliono la carta dal 03/02/2026), notifiche con un Worker Cloudflare nell'account dell'app. Verifica: il file ha la riga «Indipendenza».
- Anteprima pubblicata (versione 12, con i decori): https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → 21 verdi.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C2, C11). Regole del prodotto: `.claude/rules/progetto.md`.

## Sessione appena chiusa (#2)
- Avvio: tolti dal repository i file `__pycache__` (facevano scattare «modifiche non salvate» a ogni avvio).
- Ricerca aggiornata (Parallel, pagine ufficiali 20/10–03/11/2026): Firestore gratis 1 GiB, 50k letture e 20k scritture al giorno; Storage e Functions solo Blaze; FCM gratis; email-link solo 5 al giorno sul piano gratis; Cloudflare Workers gratis 100k richieste al giorno PER ACCOUNT.
- Scritta `docs/SPEC-FIREBASE.md` (raccolte, chi legge e scrive, casi difficili: ultimo pronto con transazione, numero ordine col contatore, limite teglie con `settimane/`, ordine senza rete resta nel carrello e riparte, si scrive solo il campo cambiato).
- Regole `firestore.rules` + `tools/prova-regole.js` (30 casi) + `firebase.json` + `package.json` (firebase-tools 15.35.0, firebase 13.2.0, @firebase/rules-unit-testing 6.0.0). L'emulatore gira nel contenitore (Java 21).
- Foto dei decori mandate di nuovo a Mario: `archivio/foto/decori-1-menu.png`, `decori-2-titoli.png`.
- Mario: passaparola con link unico (risposta «1 1 2 1»), niente limiti in comune con altre app, impronta o PIN per Monica.
- File toccati: `.gitignore`, `docs/CHI-FA-COSA.md`, `docs/DA-FARE.md`, `docs/SPECIFICA.md`, `docs/SPEC-FIREBASE.md`, `docs/ERRORI.md`, `docs/PASSAGGIO-CONSEGNE.md`, `firestore.rules`, `firebase.json`, `package.json`, `package-lock.json`, `tools/prova-regole.js`, `archivio/foto/`.
- Controllo Da fare: 1 voce aggiunta (C11 passaparola), più C10 (indirizzo del sito) e la riga «account» in Aspetta Mario.
- Sveglie: cancellate le mie due (continua lavoro, Preferenze a fine giornata). Rifare quella delle Preferenze (sotto).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Costruire l'app da zero: l'app esiste già (consegna in `archivio/`).
- Installare il kit con `installa.py`: il kit lo vieta.
- Link personale per cliente + link «richiesta» per le amiche: Mario vuole UN link che tutti rigirano (passaparola); il link personale girato mostrava gli ordini di chi lo mandava.
- Accesso di Monica via email-link: solo 5 email al giorno sul piano gratis.
- Worker sull'account Cloudflare comune: i limiti sono per account, toccherebbe le altre app (PT E5).

## Prossimi passi
1. Ricordare a Mario le righe di «## 0. Aspetta Mario» (decori, account nuovo per l'app, creare Firebase), una per messaggio, con le foto dei decori.
2. C11: riportare il passaparola in `docs/SPEC-FIREBASE.md` (ogni telefono = utente anonimo; `piatti`, `foto` e una parte delle impostazioni leggibili da chi è entrato anche se non approvato; indirizzo, WhatsApp e pagamenti in un documento solo per approvati; nome unico: controllo con un documento `nomi/{nome-normalizzato}` creato in transazione; `tramite` = chi ha girato il link, nel link stesso; al cambio telefono Monica «ricollega» al cliente vecchio). Poi adattare `firestore.rules` e `tools/prova-regole.js`, tutte verdi più la controprova.
3. C1: strato dati a due motori in `app.js` (solo `carica()`/`salva()`; «prova» come oggi, «firebase» che scrive solo i campi cambiati), 19 controlli verdi; impronta o PIN per Monica con WebAuthn (sblocco del telefono).
4. Quando Mario scrive «Firebase»: passi a mano uno alla volta (account Google nuovo per l'app se risponde 1; console con «Databases & Storage > Firestore» e «Security > Authentication», nomi da controllare sulla guida ufficiale perché la console chiede l'accesso).
5. Sveglia `send_later` a fine giornata (~21:30): Preferenze di claude.ai v27 contro kit v35 → mandare a Mario `docs/kit-progetto/PREFERENZE-CHAT.txt` in un riquadro, una volta sola.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
«1 1   2 1 Metti che anche il cliente può inviare a sua volta il link per farlo girare per passaparola, ecco. Solo che quando invia il link gli chiederà al nuovo utente, gli chiederà il nome diverso e l'utente diverso, così Monica traccia di chi fa l'ordine, se no tutti farebbero tutti gli ordini con lo stesso nome e cognome.»

## Numeri liberi
Prossimo PT E libero: PT E6; prossimo C libero: C12; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).
