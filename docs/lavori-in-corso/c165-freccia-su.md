# C165 · Freccia per tornare in cima

## Parole di Mario (14/11 05:11, #88)
«Quando clicco database sotto, che potrebbe chiamarsi anche in un altro nome, lì nelle ricette, mi fa scendere molto giù, ma poi per risalire su devo scrollare all'infinito. Mi servirebbe una freccia o un qualcosa per risalire su in un posto fatto bene, una piccola freccia dove io clicco e ritorno su in cima al punto di partenza…»

## Scelte
- Tasto «🗄 Database» (C84) c'era già: diventa «⬆ Ricette» solo quando sei al database, poco chiaro → freccia tonda fissa, sempre la stessa.
- Pagine di Monica e Mario (Ricettario, Database ricette, Ricette video, tutte): compare dopo 1,5 schermi; un tocco = in cima subito (C124).
- Nel Ricettario sopra «🗄 Database»; ai clienti no (in basso barra e microfoni, PT E83).
- Prova `C165` in `tools/prova.js` (OK). C84 da sola (`SOLO=C84`) è rossa anche senza la patch («Indietro» 2262 invece di 2500): da guardare nel giro completo.

## Stato
- Patch `c165-freccia-su.patch` (app.js, style.css, tools/prova.js); foto `archivio/foto/2026-11-14-c165-freccia-su.png` mandata; aspetta l'ok di Mario.
