# Da portare nel kit RVC (per una sessione del kit)

Questo progetto non può toccare il repo del kit (`add_repo` di un altro repo spegne gli hook). Una sessione del kit (repo `RVC-Operation-by-YNOY-CORP/RVC`, `docs/kit-progetto`) legge qui e porta le voci nel kit; finita una voce, scrive qui «portata in kit X.Y».

**Preferenze v37 pronte** (Principale 40, 10/11): `docs/PREFERENZE-PROPOSTA-v37.txt` = v36 di claude.ai + C103 («A cosa serve»), C20 (link), C109 (niente blocchi per persona), C122 (impara dagli errori); 2.482 caratteri. La sessione del kit la copia in `docs/kit-progetto/PREFERENZE-CHAT.txt` e alza la versione.

**Kit vecchio qui** (10/11): questo progetto ha kit 35.0 · Preferenze v35; Mario usa già le Preferenze v36 (09/11/2026). La sessione del kit manda qui il pacchetto nuovo (da qui non si legge il repo del kit).

## C89 · Controllo dei numeri doppi (Mario 09/11: «come consiglio» = sì, in tutti i progetti)
**Kit (10/11):** portata in kit 37.2 (hook generale + `.claude/numeri-doppi.json` del progetto: per data.js serve il file con la riga di `{ v: …}`, testo nel messaggio di Risparmio 13).
- Perché: con più chat sullo stesso ramo due chat prendevano lo stesso numero (versione dell'app, voce C di Da fare): successo 3 volte l'08/11.
- File da copiare: `.claude/hooks/numeri-doppi.py` (PreToolUse Bash, prima di ogni `git push` legge i file come sono) e la prova `tools/test-numeri-doppi.py` (4/4 verdi).
- Riga in `.claude/settings.json` (PreToolUse, matcher Bash): `python3 -I "$CLAUDE_PROJECT_DIR/.claude/hooks/numeri-doppi.py" 2>/dev/null || true`.
- Da rendere generale: qui guarda `data.js` (novità e `VERSIONE_APP`) e `docs/DA-FARE.md` (righe `| C<n> |`). Nel kit: i nomi dei file come impostazione del progetto (es. in `.claude/numeri-doppi.json`), di base solo `docs/DA-FARE.md`.
- Regola nel kit, sezione «Rami e PR»: «Prima di un push l'hook numeri-doppi ferma i numeri doppi (C, versione): al primo C libero e "era Cxx doppio"».

## C20 · Link a Mario: da aprire cliccabile, da copiare in un riquadro con Copia
**Kit (10/11):** portata in kit 37.0 (skill domande).
- Oggi solo nel `CLAUDE.md` di questo progetto; le skill `domande` e `ricerca-aggiornata` del kit dicono ancora «mai nei riquadri».

## C103 · «A cosa serve» in tutto ciò che chiedo a Mario (Mario 09/11: «regola per tutti i progetti ed account»)
**Kit (10/11):** portata in kit 37.0 (skill domande); il resto nel 37.2.
- Testo per «COME PARLARMI» delle Preferenze (tutte le chat e tutti gli account) e per `REGOLE.md` (sezione «Come parlo a Mario»): «Ogni cosa che chiedo a Mario di fare (passi a mano, prove, foto, decisioni) dice in una riga a cosa serve: cosa ottiene lui, l'app o il lavoro.»
- Nel blocco `👉 DA FARE TU`: prima dei passi una riga «A cosa serve: …»; nelle domande è già nel «📌 Di cosa parliamo» (skill `domande`): aggiungere «a cosa serve la risposta».
- Preferenze: `PREFERENZE-CHAT.txt` è a ~2.400 caratteri su 2.500: accorciare un'altra riga senza cambiarne il senso.
- Imporla con un hook (consiglio): allo Stop, se l'ultimo messaggio ha «👉 DA FARE TU» senza «A cosa serve», una riga di richiamo.

## C109 · Niente blocchi per persona (Mario 09/11 ~20:35: «aggiungi la regola come ti avevo già detto per tutto l'account»)
**Kit (10/11):** portata in kit 37.0 (skill nuova-funzione); il resto nel 37.2.
- Cercata nel kit e nel repo del kit (09/11): non c'è. Le parole di Mario: `docs/CONSEGNE-PARALLELA-voce.md` «Ultimo messaggio di Mario»; lezione PT E41 in `docs/ERRORI.md`.
- Testo per `REGOLE.md`, sezione «Parere e occhio critico», sotto «App indipendenti da Claude»: «**Niente blocchi per persona**: mai un limite che interrompe un cliente, un amico o un collega (sembra un'app amatoriale); un limite per persona si chiede prima a Mario. Al suo posto un tetto AMPIO che, superato, non blocca: manda a chi gestisce una segnalazione nell'app e la registra (molto oltre = c'è un problema; poco oltre = si alza il tetto).»
- Nella skill `nuova-funzione`, fra i controlli dell'occhio critico: «limiti per persona? → niente blocchi, tetto ampio + segnalazione (regola Niente blocchi per persona)».
- Tre livelli (proposta `docs/lavori-in-corso/limiti-per-persona.md`, Mario 09/11 «da consiglio»): 1) **Avviso**: tetto ampio (3-5 volte l'uso normale) → segnalazione registrata a chi gestisce, servizio intatto; 2) **Protezione**: tetto altissimo (10-20 volte) o raffica da robot (es. 10 in un minuto) → «modo ridotto» (senza AI, risposte locali), avviso urgente; 3) **Totale**: avviso all'80% della quota gratuita, a quota finita modo ridotto, mai errore. Numeri regolabili dalle Impostazioni dello sviluppatore, con tetti sicuri.
- Esempio fatto qui (v0.9.87): `contaAIC()` e `segnala()` in `worker.js` (registro + notifica solo ai telefoni di Mario), soglie `aicAvviso` 30 e `aicRidotto` 100 in «Solo per te, Mario» (opzioni.js, gruppo 'mario'), al posto del blocco a 10.

## C122 · Impara sempre dagli errori (Mario 10/11 ~01:35: «come regola, con logica, intelligenza e ragionamento… in tutto l'account»)
**Kit (10/11):** portata in kit 37.0 (REGOLE.md «Prova o non è successo»); il resto nel 37.2.
- Controllo conflitti (10/11): nessun contrasto. Già coperte solo in parte: «Ogni correzione di Mario → una riga in `docs/ERRORI.md`» (`REGOLE.md` «Prova o non è successo»), «Dopo 2 tentativi falliti mi fermo», «una causa si dice solo con una prova» (PT E10), «una regola si scrive generale» (PT E14). Manca: gli errori trovati da me (prova rossa, difetto, guida sbagliata) e la difesa contro gli errori SIMILI, non solo lo stesso.
- Testo per `REGOLE.md`, sezione «Prova o non è successo», al posto della riga «Ogni correzione di Mario → …»: «**Impara dagli errori**: ogni errore (correzione di Mario, prova rossa, difetto o guida sbagliata trovati da me) → la causa vera (perché è successo, provata, non solo cosa) e una difesa perché non ricapiti uguale né simile: lezione generale in una riga in `docs/ERRORI.md` (letto a ogni avvio), e se si può controllare una prova o un hook; commit. La storia lunga in `docs/ERRORI-STORIA.md`.»
- Testo per «COME PARLARMI» delle Preferenze, al posto di «Ogni mia correzione → una riga in docs/ERRORI.md»: «Impara dagli errori (miei e tuoi): causa vera e difesa perché non ricapitino uguali o simili → una riga in docs/ERRORI.md.» (stessa lunghezza circa: le Preferenze sono vicine al tetto di 2.500 caratteri).
- Qui vale già: intestazione di `docs/ERRORI.md` (letta a ogni avvio).

## C133 · Regole nate qui che il kit 38.14 non ha (controllo del 10/11, Mario 16:50 «dimmele e vediamo se le ha rvc»)
Confronto fatto dalla Principale 50 sul pacchetto v38 indipendente + `CLAUDE.md`, `docs/ERRORI.md`, `docs/PREFERENZE-CLAUDE.md` di RVC. Si portano solo col sì di Mario.
- **No**: guide giuste con le foto dei siti (`docs/GUIDE-GIUSTE.md`, PT E6) · servizio nuovo = guida passo passo e testo pronto nello stesso messaggio, e dopo ogni pubblicazione «chiudi e riapri l'app» (PT E22) · messaggi d'errore col perché vero e il codice (PT E46) · ogni giro automatico finisce con un esito scritto per elemento (PT E47) · un lavoro che si ripete si misura prima contro i limiti gratuiti (PT E52) · iPhone/iPad: bug WebKit noti e prova nell'app installata sulla Home (PT E39, E42, E44) · contenuti di fiducia (ricette, salute, leggi) solo da fonte ufficiale, mai inventati (PT E25) · funzione nuova: prima un esempio con una persona vera, poi il nome (PT E7) · testi onesti: mai scrivere nell'app una funzione che non c'è (PT E17) · foto: misurare i pixel, mai oltre ~2 volte la misura vera (PT E45) · approvazioni possibili solo dal computer: dirlo prima (PT E28).
- **In parte**: proporre soluzioni smart senza che Mario lo chieda (PT E14; nel kit solo «💡 PARERE con idee») · indirizzi di siti esterni provati dal vivo prima di usarli (PT E29; RVC ha solo «contatore provato dal vivo») · una causa si dice solo con una prova, sennò «ipotesi» (PT E10; il kit chiede prove per i fatti, non per le cause).
- **Già nel kit**: link cliccabili / riquadri (C20) · «A cosa serve» (C103) · niente limiti per persona (C109) · impara dagli errori (C122) · numeri doppi (C89) · fonti ufficiali con data (skill `ricerca-aggiornata`) · dopo 2 tentativi falliti fermarsi (PT E9).
- **Solo qui, apposta** (Mario 08/11): regime leggero delle prove, niente artefatto dell'anteprima.
