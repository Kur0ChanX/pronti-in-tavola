# Consegne della chat parallela «Aiuto» (bug) · Aiuto 3 → Aiuto 4

**Già deciso da Mario (non richiedere):** dosi dei piatti a teglia per la teglia da 6 (la da 8 la calcola l'app, al kg restano al kg); l'app si aggiorna e riprende dalla stessa schermata; il gesto indietro non chiude l'app; niente artefatto, Mario prova sul sito vero; voce Paola in un Web Worker (Mario «sì come consiglio», fatto in 0.9.52); il turbo «Carico 100» sale (Mario 08/11 «sì il numero è salito»).
**Da non rifare:** confronto passo per passo con GZ di 780 ricette (C83: 780 su 780 con tutti i passi e tutte le frasi, 13.551 frasi; la sola «diversa», Polpette di melanzane, ha i 7 passi giusti e un testo vecchio nascosto di GZ); controllo delle 253 ricette (C80); foto a strisce (C79).
**Cosa preme a Mario adesso:** che le cose che usa funzionino; risposte dirette SÌ/NO alle sue domande di verifica (PT E34: ha chiesto 5 volte il controllo delle ricette).

Aiuto 3 = `session_01WTjqUxSnvSoGaBqC7GtF6r` (catena 1 di 8 dalla Aiuto 2), chiusa alla soglia 08/11 ~17:50.

## Fatto (tutto online; controlla: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.53)
- v0.9.50 C83: `gz.mjs` lettore v4 (niente «Domande e risposte» né pubblicità nell'ultimo passo, entità accentate), `esaminaRicetta()`; `worker.js` `controlla()` (DO Ricettario: esito in stato 'controllo', le rotte con v=0 da rileggere, le mancanti in coda; da solo una volta al giorno nel cron; `/api/gz {db:'controlla'}`); `ricettario.js` `controlloRic()` + tasto «🔍 Controlla tutte»; strumenti `tools/controlla-ricette.mjs` (TUTTE=1 PAGINE=N) e `tools/confronta-passi.mjs` (confronto con la pagina vera). Prove: `prova-database.mjs` 71 OK, `prova-gz.mjs` 6 OK, app 53 OK.
- v0.9.52: `voce-piper.js` `env.proxy = true` (onnxruntime in un Web Worker): blocco della pagina misurato 1435 ms → 115 ms (Playwright, scratch `blocco.cjs`). `prova-voce-piper.mjs` 45 OK.
- v0.9.53 C84 (Mario 08/11 ~17:40, due problemi): 1) `app.js` render: `POS[vista]` + `penultimaVista` + `UI.torna` (tasto `.indietro` e gesto) → torna allo stesso punto della pagina; riprova a 120/400/900 ms se la pagina si allunga, si ferma se Mario scorre (`UI.mossoDopo`). 2) `ricettario.js` tasto fisso `.ric-salta` «🗄 Database» ↔ «⬆ Ricette» (`style.css` in fondo). Prove app 53 OK, ma **nessuna prova dedicata** a C84.
- Errori: PT E34. Numeri: la principale ha usato C81, C82 e 0.9.49/0.9.51 → i miei sono C83, C84, 0.9.50, 0.9.52, 0.9.53.

## Prossimi passi
1. Avvio: titolo «📗 🍝 Aiuto 4 · corregge i bug»; leggere i messaggi di Mario arrivati dopo.
2. ✅ (Aiuto 4) C84: prova «ricettario (C84)» in `tools/prova.js` (Indietro, gesto, entrata dalla Home, tasto); trovato e corretto in v0.9.54: dalla Home il Ricettario tornava a metà elenco (`app.js` regola `penultimaVista` non vale se arrivi da home/menu). Giro completo 54 OK. Foto in `archivio/foto/2026-11-08-c84-*`.
3. Kokoro (`voce-kokoro.js`, transformers.js) non è in un Web Worker: solo se Mario la usa.

## Note
- Prima di ogni versione `git fetch` e guardare `VERSIONE_APP` su origin: la principale usa gli stessi numeri (oggi 2 conflitti in `data.js`, risolti mettendo la mia sopra col numero dopo).
- Il push sul ramo pubblica da solo (`.github/workflows/sito.yml`): dopo il push controllare la versione sul sito.
- `SOLO=` non funziona per il passo «ricettario (C55)» (non autonomo): giro completo.

Controllo Da fare: 1 voce aggiunta (C84).

## Ultimo messaggio di Mario (parola per parola)
«Due problemi, una se entro in una ricetta, entro, modifico, poi torno indietro, mi riva su in alto nel foglio e quindi devo riscendere giù, quindi voglio che mi ritorni, quando vado indietro voglio che mi ritorni dove ero nella ricetta. Cosa numero due, sta diventando problematico andare nelle impostazioni delle ricette, nel senso quelle che abbiamo caricato, quelle 300 più, perché nelle impostazioni sono, ci sono sotto, quindi devo scrollare veramente tanto per scendere nelle impostazioni. Quindi o me lo fai sopra o ti inventi qualcos'altro. Cioè è brutto che appena entri ci sono impostazioni su, è bello che appena entri nel ricettario ci sono le ricette. Però devi mettermi un modo strategico per le impostazioni, perché se vado in fondo è un casino, cioè ci metto tantissimo tempo, è molto scomodo.»
