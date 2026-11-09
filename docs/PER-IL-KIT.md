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

## C103 · «A cosa serve» in tutto ciò che chiedo a Mario (Mario 09/11: «regola per tutti i progetti ed account»)
- Testo per «COME PARLARMI» delle Preferenze (tutte le chat e tutti gli account) e per `REGOLE.md` (sezione «Come parlo a Mario»): «Ogni cosa che chiedo a Mario di fare (passi a mano, prove, foto, decisioni) dice in una riga a cosa serve: cosa ottiene lui, l'app o il lavoro.»
- Nel blocco `👉 DA FARE TU`: prima dei passi una riga «A cosa serve: …»; nelle domande è già nel «📌 Di cosa parliamo» (skill `domande`): aggiungere «a cosa serve la risposta».
- Preferenze: `PREFERENZE-CHAT.txt` è a ~2.400 caratteri su 2.500: accorciare un'altra riga senza cambiarne il senso.
- Imporla con un hook (consiglio): allo Stop, se l'ultimo messaggio ha «👉 DA FARE TU» senza «A cosa serve», una riga di richiamo.

## C109 · Niente blocchi per persona (Mario 09/11 ~20:35: «aggiungi la regola come ti avevo già detto per tutto l'account»)
- Cercata nel kit e nel repo del kit (09/11): non c'è. Le parole di Mario: `docs/CONSEGNE-PARALLELA-voce.md` «Ultimo messaggio di Mario»; lezione PT E41 in `docs/ERRORI.md`.
- Testo per `REGOLE.md`, sezione «Parere e occhio critico», sotto «App indipendenti da Claude»: «**Niente blocchi per persona**: mai un limite che interrompe un cliente, un amico o un collega (sembra un'app amatoriale); un limite per persona si chiede prima a Mario. Al suo posto un tetto AMPIO che, superato, non blocca: manda a chi gestisce una segnalazione nell'app e la registra (molto oltre = c'è un problema; poco oltre = si alza il tetto).»
- Nella skill `nuova-funzione`, fra i controlli dell'occhio critico: «limiti per persona? → niente blocchi, tetto ampio + segnalazione (regola Niente blocchi per persona)».
- Esempio fatto qui (v0.9.85): `segnala()` in `worker.js` (registro + notifica a chi gestisce), soglia `SOGLIA_AIC_CLIENTE` 20 al posto del blocco a 10.
