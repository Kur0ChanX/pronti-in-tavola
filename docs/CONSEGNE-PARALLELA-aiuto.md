# Consegne della chat parallela «Aiuto» (bug) · Aiuto 2 → Aiuto 3

**Già deciso da Mario (non richiedere):** dosi dei piatti a teglia per la teglia da 6, la da 8 la calcola l'app, al kg restano al kg; l'app si aggiorna da sola e riprende dalla stessa schermata; il gesto indietro non chiude l'app; niente artefatto, Mario prova sul sito vero.
**Da non rifare:** controllo di 253 ricette GZ (C80, fatto); taglio delle foto «a strisce» (C79); numerini delle foto dal nome del file (0.9.47).
**Cosa preme a Mario adesso:** che le cose che usa funzionino (bug che manda con le foto). Questa catena = sessione dei bug.

Aiuto 2 = `session_01WTjqUxGGtuXRFWUE5Y5Jkz`, aperta a mano da Mario 08/11 ~14:25 («sessione per correggere bug o problemi»), chiusa alla soglia 08/11 ~16:45.

## Fatto (tutto online, prove complete verdi; controlla: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP`)
- v0.9.43 C74 dosi a teglia (`spesa.js` sezioneDosi: in memoria restano per porzione, `data-k`); C75 aggiornamento da solo (`app.js` controllaAggiornamento / riavviaQuandoPuoi / riprendiDopoAggiornamento, `sessionStorage` 'pit-ripresa').
- v0.9.44 C76 cucina guidata vuota: la voce locale (ONNX sul filo principale) bloccava l'animazione `.entra` → niente `entra` sulle viste `cucina:` (`app.js` render), voce dopo 300 ms.
- v0.9.46 C78 gesto indietro (`app.js` popstate + pagina di guardia); C79 foto a strisce (`ricettario.js` fotoPasso, `style.css` .ric-striscia).
- v0.9.47 C80 numerini delle foto dal nome GZ (`_strip_1-3`, `_27`); script `tools/controlla-ricette.mjs`.
- Errori PT E31 (dosi a teglia), E32 (promemoria voci vecchio).

## Prossimi passi
1. Avvio: titolo «📗 🍝 Aiuto 3 · corregge i bug»; leggere i messaggi di Mario arrivati dopo e le voci C74-C80 di Da fare (aspettano la sua prova).
2. Idea (chiedere a Mario prima, è lavoro grande): voce locale in un Web Worker (`ort.env.wasm.proxy`), così l'app non si blocca mai mentre parla.
3. «Carico 100 ricette: 0 fatte» nella foto di Mario 16:09 (Il mio database) con «Motore al lavoro»: controllare se il turbo è fermo (zona della principale: chiederle con `send_message` prima di toccare).

## Note
- La principale usa gli stessi numeri di versione e di C: prima di ogni versione `git fetch` e guardare `VERSIONE_APP` su origin; in caso di conflitto i miei prendono il numero dopo.
- `SOLO=` funziona solo per i passi autonomi (stato in `page.evaluate` in testa): dosi, strisce, gesto, aggiornamento lo sono.

## Ultimo messaggio di Mario (parola per parola)
«hai guardato tutte le ricette se sono ok?»
