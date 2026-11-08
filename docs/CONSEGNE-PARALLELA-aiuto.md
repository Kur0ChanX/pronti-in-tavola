# Consegne della chat parallela «Aiuto» (bug) · Aiuto 5 → Aiuto 6

**Già deciso da Mario (non richiedere):** guida corta iPhone | Android al posto del tasto (v0.9.59); la guida arriva DOPO il primo ordine, «Ordina di nuovo» in cima al menù, foto nel manifest (Mario «1 consiglio», fatto v0.9.62); l'app si aggiorna da sola con «Riavvia»; niente artefatto, Mario prova sul sito vero.
**Da non rifare:** ricerca installazione iPhone (fatta due volte, 08/11, openpwa.net 10/2026 + manuale Apple iOS 26: nessuna API, nessuna finestra; solo Condividi → Aggiungi alla schermata Home → «Apri come app web» acceso → Aggiungi; da iOS 26 ogni sito aggiunto si apre come app); studio guide web.dev (installare dopo un'azione importante, manifest con foto).
**Cosa preme a Mario adesso:** i clienti con iPhone devono riuscire a mettere l'app senza aiuto: «impossibile che non ci sia nulla».

Aiuto 5 = `session_01WTjqUvX75Bht1iG65adkCZ` (catena 3 di 8), chiusa alla soglia 08/11 ~18:40.

## Fatto (tutto online; controlla: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.62 o più)
- v0.9.61 C93: `dati.js` richieste raggruppate per `chiave` (`gemelli`), `decidi` per 'ricollega' senza cliente legge dentro la transazione gli altri `utenti` con la stessa chiave (mai due clienti); `app.js decidiRichiesta` decide anche i gemelli, Annulla li annulla tutti. Cookie `pit_nome` (1 anno, SameSite=Lax): `nomeRicordato()`, `ricordaNome()` (scritto alla registrazione e a ogni `render` di un cliente con nome), benvenuto «Bentornati! Sei …? Sì, sono io» (`benv-ricordato`: prova come nuovo, se `permission-denied` come ricollega) e «No, sono un'altra persona» (`benv-non-io`). Prove in `tools/prova-firebase.js` (b2, b3): 9 OK; il bug era vero (col codice vecchio 2 richieste).
- v0.9.62: `primiPassi()` mostra «Metti l'app» solo con `P.ordinato` (messo in `vInviato`), `vInviato` ha `cartaHome(...)`; `ultimoDaRifare()` («Lo stesso dell'ultima volta?», classe `.rifai`, CSS in fondo a `style.css`); `manifest.webmanifest` con `screenshots` (`media/schermata-1.webp` logo, `-2.webp` menù, 824x1784). Prova «cliente (C93)…» in `tools/prova.js`. Giro completo 56 OK. Foto `archivio/foto/2026-11-08-c93-*`.
- `npm install` fatto nel contenitore (firebase-tools): `npm run prova-firebase` funziona; 2 NO VECCHI (c'erano prima: «foto pesante» e lucchetto «page.click Timeout»), segnati in C93.
- Numeri usati: C94 (nuovo), versioni 0.9.61, 0.9.62.

## Prossimi passi (C94, 🔴)
1. Avvio: titolo «📗 🍝 Aiuto 6 · iPhone facile».
2. Rispondere a Mario (la sua domanda non ha ancora avuto risposta piena): su iPhone nessun sito può installarsi da solo (fonti sopra); cosa si può fare: a) guida a figure grandi, una per passo, con freccia che lampeggia verso dove sta Condividi (in basso su iOS 26 Safari, dietro «⋯»); b) passo 3 «lascia acceso Apri come app web, poi Aggiungi»; c) se il link si apre dentro WhatsApp o un'altra app: «tocca Apri in Safari» (ipotesi da verificare con ricerca: come apre i link WhatsApp su iPhone nel 2026); d) app vera nell'App Store (99 €/anno Apple + revisione): sconsigliata. Chiedere a Mario quali. Il punto b l'ha già fatto Aiuto 5 (v0.9.63, dopo l'handoff: Mario «facciamo prima in questa app», poi «pubblica»).
3. Giro completo, push, controllo versione sul sito, novità in una riga.

## Note
- Prima di ogni versione `git fetch` e guardare `VERSIONE_APP` su origin.
- Merge con la principale: conflitti solo in `data.js` (novità) e in fondo a `style.css`: tenere entrambe.
- Prove autonome: `P.benvenuto = true` in testa al passo; ordini finti con righe complete (`note: []`, `testo`, `paga: {}`).
- Avvio pesante: questa sessione a 235k dopo pochi turni (foto e uscite lunghe): foto piccole, `grep -n`.

Controllo Da fare: 1 voce aggiunta (C94). Messaggi di Mario della sessione: «1 consiglio» (C93, fatto), «per iphone non si può fare nulla…» (C94).

## Ultimo messaggio di Mario (parola per parola)
«pubblica» (prima: «facciamo prima in questa app»; «per iphone non si può fare nulla hai teovato qualcosa con la ricerca di prima? impossibile che mon ci sia nulla»)
