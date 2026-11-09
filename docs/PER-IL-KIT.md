# Da portare nel kit RVC (per una sessione del kit)

Questo progetto non può toccare il repo del kit (`add_repo` di un altro repo spegne gli hook). Una sessione del kit (repo `RVC-Operation-by-YNOY-CORP/RVC`, `docs/kit-progetto`) legge qui e porta le voci nel kit; finita una voce, scrive qui «portata in kit X.Y».

## C89 · Controllo dei numeri doppi (Mario 09/11: «come consiglio» = sì, in tutti i progetti)
- Perché: con più chat sullo stesso ramo due chat prendevano lo stesso numero (versione dell'app, voce C di Da fare): successo 3 volte l'08/11.
- File da copiare: `.claude/hooks/numeri-doppi.py` (PreToolUse Bash, prima di ogni `git push` legge i file come sono) e la prova `tools/test-numeri-doppi.py` (4/4 verdi).
- Riga in `.claude/settings.json` (PreToolUse, matcher Bash): `python3 -I "$CLAUDE_PROJECT_DIR/.claude/hooks/numeri-doppi.py" 2>/dev/null || true`.
- Da rendere generale: qui guarda `data.js` (novità e `VERSIONE_APP`) e `docs/DA-FARE.md` (righe `| C<n> |`). Nel kit: i nomi dei file come impostazione del progetto (es. in `.claude/numeri-doppi.json`), di base solo `docs/DA-FARE.md`.
- Regola nel kit, sezione «Rami e PR»: «Prima di un push l'hook numeri-doppi ferma i numeri doppi (C, versione): al primo C libero e "era Cxx doppio"».

## C20 · Link a Mario: da aprire cliccabile, da copiare in un riquadro con Copia
- Oggi solo nel `CLAUDE.md` di questo progetto; le skill `domande` e `ricerca-aggiornata` del kit dicono ancora «mai nei riquadri».
