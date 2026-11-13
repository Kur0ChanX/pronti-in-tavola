# C152 · Altre ricette proteiche (dalle scartate)

Mario 13/11 12:57, parola per parola: «hai altre ricette da aggiungere?» → consiglio della #74: prima le ~300 scartate dalla stima, poi i creatori (Ricette di Alice, HSN, Sergio Chisari).

## Fatto (#75, 13/11)
- `tools/raccogli_stimate.py --ignoti`: elenco degli ingredienti che fanno scartare (`.cache-stime/ignoti.txt`). Scartate dalla stima: 293 → 136.
- `tools/stima.py`: «q b» non era riconosciuto (dopo `norm` il punto sparisce); erbe, spezie e attrezzi («1 pentolino») saltati; pesi tipici di verdure e frutta; 9 prodotti nuovi (kefir, pangrattato, chia, lino, sesamo, sfoglia, gallette, pancarrè, hummus); codici CREA di 20 verdure e frutti. Difetti trovati e corretti: «cipollotti» letti come pollo, «pomodorini» da 100 g, «peperoncino» da 150 g.
- Dolce o salato: «porridge» era salato (porro) e «gallette di riso» salate (riso): 37 ricette già online passano a dolce.
- `--aggiungi`: le 522 vecchie restano uguali (valori compresi), si aggiungono le nuove. Risultato: **+70 ricette** (1 tolta: nome illeggibile «Kcal totali…»). Totale 592.
- Prova `SOLO=C141` verde. Patch: `docs/lavori-in-corso/c152-stimate-nuove.patch` (NON nel ramo: push = app pubblicata, PT E69).

## Manca
- Foto a Mario (Proteiche con le nuove), suo ok, versione, giro completo, online. Poi i creatori.
