# Consegne della chat parallela «Aiuto» (bug) · Aiuto 4 → Aiuto 5

**Già deciso da Mario (non richiedere):** al posto del tasto «Installa l'app» una guida corta a due schede iPhone | Android (fatto v0.9.59); il link non si rimanda mai, l'app si aggiorna da sola con l'avviso «Riavvia»; dosi a teglia per la teglia da 6; Indietro torna allo stesso punto; niente artefatto, Mario prova sul sito vero.
**Da non rifare:** ricerca su installazione iPhone (fatta 08/11, manuale Apple iOS 26: Condividi → scorri in giù → «Aggiungi alla schermata Home» → «Aggiungi»; nessun sito può installarsi da solo su iPhone; scritta in `docs/GUIDE-GIUSTE.md`); confronto delle 780 ricette con GZ (C83).
**Cosa preme a Mario adesso:** i clienti (non pratici col telefono) devono entrare e ordinare senza intoppi, subito: «non posso far aspettare i clienti».

Aiuto 4 = `session_01WTjqUvGDca64C84DGDYxik` (catena 2 di 8 dalla Aiuto 3), chiusa alla soglia 08/11 ~18:15.

## Fatto (tutto online; controlla: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.59 o più)
- v0.9.54 C84: prova «ricettario (C84)» in `tools/prova.js`; corretto: dalla Home il Ricettario parte dall'alto (`app.js`, regola `penultimaVista` non vale se arrivi da home/menu). Foto `archivio/foto/2026-11-08-c84-*`.
- v0.9.57: iPhone con Chrome/Google/Firefox/Edge → passi giusti; «Non serve per ordinare: il menù è qui sotto» nei primi passi.
- v0.9.59: `app.js` `guidaInstalla()` (schede `.gi-tab`, azione `guida-os`, `UI.guidaOS`) usata in `primiPassi()` al posto del tasto e in `cartaHome()`; il tasto resta solo con `beforeinstallprompt` (Android che installa a un tocco). CSS in fondo a `style.css`. Prova «cliente: guida corta…». Giro completo 55 OK. Foto `archivio/foto/2026-11-08-guida-installa-*`.
- Numeri usati: C93 (nuova voce), versioni 0.9.54, 0.9.57, 0.9.59 (la principale ha 0.9.55, 0.9.56, 0.9.58).

## Prossimi passi (C93, 🔴)
1. Avvio: titolo «📗 🍝 Aiuto 5 · clienti facili».
2. **Caso doppione** (da provare, ipotesi letta nel codice): cliente si registra nel browser (utenti/{uid} stato 'nuovo', `nomi/{chiave}` creato), Monica non approva ancora, poi installa su iPhone → l'app ha memoria separata (Firebase anonimo in IndexedDB non passa; **i cookie sì, copiati una volta all'«Aggiungi», iOS 17.2+**, fonte WebKit/openpwa.net) → nuovo uid, benvenuto, stesso nome → `permission-denied` → «Sì, sono io» → `registra(…, ricollega)` stato 'ricollega'. In `dati.js decidi()` un 'ricollega' senza cliente in `clienti` crea un cliente nuovo → Monica vede due richieste «Sabrina» e approvandole entrambe fa due clienti? Provarlo con l'emulatore (`tools/prova-firebase.js`, `tools/prova-regole.js`) o leggendo bene; poi unire: nella lista di Monica una sola richiesta per chiave (la più nuova), e `decidi` per 'ricollega' senza cliente che riusa quello appena creato per la stessa chiave.
3. **Riconoscimento da solo dopo l'installazione** (senza cambiare le regole di Firestore, che Mario incolla a mano nella console): alla registrazione scrivere un cookie (1 anno, `SameSite=Lax`) col nome completo; nell'app installata, se non c'è utente e c'è il cookie → benvenuto già compilato e «Sei Sabrina Rossi? Sì, sono io» con un tocco. Valutare se serve che Monica approvi ancora (oggi sì per 'ricollega').
4. Studio rapido (skill `ricerca-aggiornata`) delle guide per web app con utenti non pratici (installazione dopo il primo ordine, niente login, testi grandi, un'azione per schermata) e proporre a Mario le 2-3 cose più utili.
5. Giro completo, push, controllo versione sul sito, novità in una riga.

## Note
- Prima di ogni versione `git fetch` e guardare `VERSIONE_APP` su origin (oggi 3 volte la principale aveva già il numero: ho preso il successivo).
- Merge con la principale: conflitti solo in `data.js` (novità) e in fondo a `style.css`: tenere entrambe.
- `SOLO=` per i passi autonomi; il benvenuto va compilato prima (`#benv-nome`, `#benv-cognome`) se la prova parte da zero.

Controllo Da fare: 1 voce aggiunta (C93).

## Ultimo messaggio di Mario (parola per parola)
«si prova tutto Prova tutto quello che puoi, per i clienti deve essere veramente plug and play, perché non sanno fare nulla col telefonino. Quindi guarda le guide che fanno su questo tipo di app, in questo tipo di web app, che cosa si studiano gli sviluppatori per renderli a prova di stupido, molto semplice e chiaro. E applica questa nuova questo nuovo plug and play, per piacere, perché non posso far aspettare i clienti, ecco.»
