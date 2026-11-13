# C155 · Messaggio WhatsApp del cliente → ordine

## Parole di Mario (13/11 18:19)
«Un cliente non proprio pratico di tecnologia gli è arrivato questo messaggio a Monica, però non c'è nessun ordine. Si può fare in modo di integrarlo all'ordine, in qualche modo in automatico?»
Foto (nome coperto): `archivio/foto/2026-11-13-1817-c155-messaggio-cliente-senza-ordine.jpg`. La cliente ha usato «Scrivimi» (`waMonica()` in app.js) e ha scritto l'ordine nel messaggio: 2 kg ravioli ricotta e spinaci, 1 parmigiana al posto della pasta al forno, la prossima settimana.

## Cosa si può e cosa no
- L'app NON può leggere le chat WhatsApp di Monica (numero normale): niente lettura automatica.
- Si può: (1) lato cliente, «Scrivimi» chiede prima «Voglio ordinare / Ho una domanda»; (2) lato Monica, «Ordine da messaggio»: incolla (o Condividi su Android) → l'app trova cliente dalla firma «Sono …», piatti e quantità con `capisciCliente` (voce-clienti.js), Monica sceglie il giorno e conferma. Oggi Monica NON può creare un ordine a nome di un cliente: va fatto.

## Occhio critico
Doppione (stesso messaggio incollato due volte → avviso), cliente non trovato (scelta dall'elenco), piatto non nel menù (riga «nota»), giorno vago («prossima settimana» → Monica sceglie), cliente senza app, senza rete (ordine in coda come gli altri).

## Stato
Domanda a Mario (1 tasto clienti · 2 ordine da messaggio · 3 entrambi, consiglio 3). Niente codice finché risponde.
