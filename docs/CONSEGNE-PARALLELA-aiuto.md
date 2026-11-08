# Consegne della chat parallela «Aiuto» (bug) · Aiuto 6 → Aiuto 7

**Già deciso da Mario (non richiedere):** «vai avanti da solo» (08/11 ~19:30, dopo l'handoff): procedi coi tuoi consigli e pubblica, senza aspettarlo; guida iPhone a figure (Mario «1»); popup «Installa l'app» all'ingresso dei clienti, scelta iPhone | Android, poi notifiche (Mario 08/11 «fallo subito»); «vai avanti da solo, accetta i tuoi consigli e pubblica»; niente artefatto, Mario prova sul sito vero.
**Da non rifare:** ricerca su dove sta Condividi in Safari (fatta 08/11, fonti in testa a `guida-iphone.js`: iOS 27 menu pagina a sinistra dell'indirizzo, iOS 26 ⋯ a destra, iOS ≤18 o barra Basso/Alto Condividi in basso); l'app legge la versione da `Version/NN` dello user agent (risposto a Mario: il cliente vede una guida sola).
**Cosa preme a Mario adesso:** i clienti con iPhone devono installare l'app e ricevere le notifiche senza aiuto; e a Mario/Monica non è arrivata la notifica della richiesta del cliente nuovo (C97).

Aiuto 6 = `session_01WTjqUxUsvWTFTvCxyDVdwH` (catena 4 di 8), chiusa alla soglia 08/11 ~19:25.

## Fatto (tutto online; controlla: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.66 o più)
- v0.9.64 C94: `guida-iphone.js` (nuovo, in `index.html`, `sw.js` GUSCIO, `tools/anteprima.py`, `tools/sito.py`): `GuidaIPhone.guidaIPhone(ua)` disegni SVG per passo con cerchio che pulsa (`.gf-pulsa`) e freccia; varianti iOS 27/26/18, Chrome (CriOS), Instagram/Facebook. CSS `.gf-*` in fondo a `style.css`. `app.js guidaInstalla()` usa le figure nella scheda iPhone.
- v0.9.65 C95: foglio `UI.foglio.tipo === 'installa'` (`foglioInstalla`, `serveInvito`, `controllaInvito` chiamato in fondo a `render`, azione `inv-os`): 2,5 s dopo l'ingresso del cliente, una volta per apertura (`UI.invitoFatto`), solo `sulSito()` o `UI.invitoProva` (prove). Se `suHome()` chiede solo le notifiche. CSS `.inv-*` in fondo a `style.css`.
- v0.9.66 C96: cliente non approvato (foto di Mario: «Non attivato: prima Monica deve approvarti» in giro continuo): `attivaAvvisiCliente` con `!P.cliente` salva `P.vuoleAvvisi`; `rinnovaAvvisi` iscrive da solo appena approvato; `notifPossibili` esclude `P.vuoleAvvisi`.
- Prove in `tools/prova.js`: «invito Installa l'app», «cliente non ancora approvato», «guida a figure iPhone». Giro completo 59 OK. Foto `archivio/foto/2026-11-08-c94-*`, `-c95-*`, `-c96-*`.

## Prossimi passi
1. Avvio: titolo «📗 🍝 Aiuto 7 · notifica richieste».
2. C97 (🔴): Mario «quando ho mandato il link non mi è arrivata nessuna notifica nell'app di accettarlo». Cercare come parte la notifica a chi gestisce per una richiesta nuova (`worker.js`, `dati.js` richieste, `/api/avvisa`), capire perché non è partita (prova con Playwright sul sito vero se serve). Poi chiedere a Mario cosa intende con «Accetta per il primo ordine» (ipotesi: il primo ordine passa anche senza approvazione di Monica) con scelte numerate.
3. Ipotesi C96 da verificare: su iPhone l'app aperta dall'icona ha dati separati da Safari, quindi il cliente risulta nuovo e serve un'altra approvazione. Cercare (ricerca 11/2026) se iOS 26/27 separa anche i cookie (`pit_nome`); se sì, valutare un modo per riconoscerlo (es. codice nel link della guida).
4. Proposta aperta a Mario: togliere l'invito piccolo dopo il primo ordine (`primiPassi`/`cartaHome`), ora doppio col popup.

## Note
- Prima di ogni versione `git fetch` e guardare `VERSIONE_APP` su origin; conflitti solo in `data.js` (novità) e in fondo a `style.css`: tenere entrambe.
- Prove autonome: `UI.invitoProva = true` per far uscire il popup nelle prove; `P.benvenuto = true` in testa.

Controllo Da fare: 3 voci aggiunte (C95, C96, C97). Messaggi di Mario della sessione: «1 guida a figure…» (C94), «pop-up… fallo subito» (C95), «riesce a capire quale versione di iPhone?» (risposto), foto giro notifiche (C96), «non mi è arrivata nessuna notifica… Accetta per il primo ordine» (C97).

## Ultimo messaggio di Mario (parola per parola)
«Ma nell'ultimo, quando ho mandato il link, non mi è arrivata nessuna notifica nell'app di accettarlo. Non lo so, forse perché ci stai lavorando tu, non lo so, comunque non mi è arrivato niente. Accetta per il primo ordine.»

## Messaggio di Mario dopo l'handoff (parola per parola)
«vai avanti da solo»
