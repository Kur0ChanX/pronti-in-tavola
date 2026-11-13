# C161 · Controllo delle regole (conflitti, doppioni, regole morte)

## Parole di Mario (intere)
- 13/11 20:20: «E siccome ho cambiato tantissime regole, ne ho aggiunto tante, ho paura che mettendone troppe si sta creando un conflitto.»
- 13/11 22:35 (parte): «Prima fai questa cosa che abbiamo detto adesso, poi questa cosa delle regole.»

Guardate (#82): preferenze della chat, `docs/kit-progetto/REGOLE.md`, `CLAUDE.md`, `.claude/rules/*.md`, `docs/ERRORI.md`. Il kit è comune a tutti i progetti: qui cambio solo i file del progetto.

| N | Cosa ho trovato | Proposta |
|---|---|---|
| 1 | CONFLITTO: «prima di ogni modifica chiedo a Mario» (13/11 18:50) sta solo nelle consegne; il kit dice «correzioni ovvie: le faccio», «vado col consiglio», «giro verde → unisco da solo» | In `CLAUDE.md`: app e pubblicazione = prima una riga a Mario e il suo ok; documenti, diario e prove = da sola |
| 2 | CONFLITTO: il kit dice «anteprima a ogni push di codice», qui ogni push di file dell'app va ONLINE (causa di PT E69) | In `CLAUDE.md`: codice nuovo in patch finché foto ok e giro verde |
| 3 | MORTE: PR, squash e `main` (kit «Rami e PR», skill `pr` e `unione-pr`, RVC E19 ed E31): qui si pubblica dal ramo | In `CLAUDE.md` «qui niente PR né main»; tolgo RVC E19 ed E31 dal diario |
| 4 | CONFLITTO foto di lavoro: PT E58 «copia ≤400 px» contro RVC E37 «anteprima ≤1000 px» | Tengo 400 (meno token) |
| 5 | DOPPIONE «prima le prove, poi il commit»: 3 posti | Tolgo dal diario (restano `CLAUDE.md` e `prove.md`) |
| 6 | DOPPIONE «ogni prova si prepara da sola»: PT E70 e `prove.md` | Una sola, in `prove.md` |
| 7 | DOPPIONE filtri a parole provati su un elenco vero: PT E65 e PT E79 | Unisco |
| 8 | DOPPIONE limiti gratuiti misurati prima (PT E52) e al giorno (PT E80) | Unisco |
| 9 | DOPPIONE prove su iPhone e Safari: PT E16 e PT E39 | Unisco |
| 10 | DOPPIONE «prima grep -n»: RVC E23 e regola del kit «Token» | Tolgo dal diario |
| 11 | MORTA: PT E63 (sblocco di Cloudflare dell'11/11, finito) | Nella storia |

Stato: aspetta Mario (1 = tutte · 2 = numeri da non fare).
