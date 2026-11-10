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

### C133 · Testo finale da attivare nel kit (Mario 10/11 17:10 «attiva su rvc quelle selezionate da me con i controlli richiesti»)
Controlli fatti dalla Principale 52 sul kit 38.16 (REGOLE.md, skill, Preferenze v38): 7 regole scelte → 5 (3 doppioni uniti; nessun conflitto; C132 punto 4 = regola D, i punti 1-3 di C132 aspettano Mario ma stanno sotto la regola C).
- **A · Lavori automatici** (PT E29, E47, E52, E53, E54; unisce «misurare i lavori che si ripetono», «esito scritto», «siti provati dal vivo»). REGOLE.md «Parere e occhio critico», sotto «Niente blocchi per persona»: «**Lavori automatici** (giri, motori, sveglie, cron): prima di accenderli li misuro contro i limiti gratuiti (letture × giri al giorno); ogni giro finisce con un esito scritto per ogni elemento e non resta mai fermo sullo stesso errore; ogni indirizzo esterno lo provo dal vivo, anche dal sito vero. A un avviso di limite PRIMA fermo la fonte (in un minuto), poi correggo; mai blocchi alle persone e mai i soldi di Mario per un mio errore: solo pausa del lavoro automatico e avviso a Mario.» Skill `nuova-funzione`, controlli: «lavoro che si ripete? → misura, esito per elemento, regola Lavori automatici».
- **B · Causa solo con una prova** (PT E10; il kit chiede la prova per «fatto», non per le cause dette a Mario). REGOLE.md «Prova o non è successo», primo punto, in coda: «Una causa la dico solo quando un esperimento la conferma; prima è un'«ipotesi» e lo scrivo.»
- **C · Soluzioni smart senza che Mario le chieda** (PT E14 + C132). REGOLE.md «Parere e occhio critico», nella riga del `💡 PARERE`: «…e almeno una soluzione smart che Mario non ha chiesto (più comoda, automatica, professionale: es. modulo sicuro per le chiavi, link già compilati, promemoria prima delle scadenze); decide Mario, mai io al posto suo; il minimo che funziona non basta.» Nessun conflitto con «proposte grandi: chiedimele» (proporre non è fare).
- **D · Guide giuste con le foto** (PT E6, C132 punto 4). Skill `domande`, dopo «Cose da fare a mano»: «Guida a mano sbagliata (foto di Mario o pagina cambiata): subito quella giusta in `docs/GUIDE-GIUSTE.md` coi pulsanti esatti e le foto in `archivio/foto/`, con commit; prima di rifare quella guida la leggo lì.» Modello di `CLAUDE.md`: una riga «Servizi: prima `docs/GUIDE-GIUSTE.md`».
- **E · Errori col perché vero** (PT E46; esempio del 10/11: «manca la rete?» mentre il server era fermo per il limite). Skill `nuova-funzione`, controllo «errori»: «ogni messaggio d'errore dice il perché vero (rete, permesso, server fermo e fino a quando) e, se sconosciuto, il suo codice: una foto deve bastare a capire; mai un'ipotesi scritta come domanda («manca la rete?»).»
- Manca nel kit: la skill `nuova-funzione` è citata in REGOLE.md e in `skillOverrides`, ma non è nel pacchetto 38.16 né qui: A ed E vanno lì quando c'è; finché manca, in REGOLE.md.

## Kit 38.16 applicato qui (Principale 52, 10/11) · difetti del pacchetto da correggere nel kit
- Manca ancora `tools/consegne.py` (C9): le prove `test-archivio-messaggi.py` e `test-consegne-push.py` e la skill `consegne` vogliono quello nuovo (`miei_messaggi`, `fatti --parallela`, `avvio`); qui copiato da RVC e adattato a mano (REPO, ICONA, «di Pronti in Tavola»). Proposta: metterlo nel pacchetto con `<REPO>`, `<ICONA>`, `<PROGETTO>`.
- Mancano `tools/scarica-kit.py` e `tools/test-scarica-kit.py`, ma il punto 8 li chiede (33 prove → qui 32 + quella del progetto).
- `tools/test-guardia.py` ha `<OWNER>` e `<NOME-REPO>`: giusto, ma il punto 3 «se è uguale saltalo» non avvisa che anche le prove hanno segnaposto (la guardia era rossa finché non li ho sostituiti).
- Punto 3 «scrivi con Write, niente script»: per 75 file (~700 KB) costerebbe ~200 mila token; qui copiati con `cp` dai file estratti, dopo il controllo dei segnaposto e delle parti del progetto. Proposta: permettere la copia per i file senza parti del progetto.

## PT E58 · Foto aperte con Read: il contatore le pesa ~70k token l'una (Salvagente 2, 10/11)
- Fatto provato: due PNG a 2x (780×1508, 180 e 198 KB) aperti con `Read` → avvisi C433 «235 KB (~70k token)» e «257 KB (~77k token)»; il contatore dell'attesa lunga è salito a 258k e ha chiesto le consegne dopo una sola risposta a Mario.
- Proposta 1 (hook PreToolUse su `Read`): un'immagine oltre ~100 KB si ferma PRIMA, col comando pronto per farne una copia piccola (1x, larga al massimo 400 px, JPEG). Oggi l'avviso arriva dopo, quando il peso è già nel contesto.
- Proposta 2 (da misurare, è un'ipotesi): il peso vero di un'immagine nel contesto può essere molto più basso dei byte del file; se una misura lo conferma, `handoff-check.py` e C433 dovrebbero contare le immagini a parte, sennò le consegne partono troppo presto e si spendono token per niente.


## Avvio di una parallela aperta con `create_session`: «messaggi dopo l'handoff» contati dal file di un'altra catena (Salvagente 3, 10/11)
- Fatto provato: l'hook di avvio della Salvagente 3 è partito alle 19:13:21; il suo id è entrato nella tabella «## Catene» col commit `654b007d` delle 19:13:38 (chi chiude conosce l'id solo DOPO `create_session`). `consegne_di()` di `avvio-check.py` non ha trovato la catena ed è andata alla riserva: il file parallelo più vecchio (`CONSEGNE-PARALLELA-aiuto.md`, 09/11 14:39) → «26 messaggi, leggili TUTTI». Quelli veri dopo le consegne della Salvagente: 0 (coda del registro: ultimo 18:51, già nelle consegne).
- Stima (non misurata su altre catene): capita a ogni parallela aperta dalla precedente, perché il contenitore nuovo parte in pochi secondi. Effetto: token sprecati a rileggere messaggi di altre catene, o l'abitudine a non credere al conto.
- Proposte, da valutare nel kit (non provate): 1) senza id in tabella, il conto riconosce la catena dal nome nel testo «[AVVIO]» («linea «<Nome>»», lo scrive già `fatti`), letto dall'hook del primo messaggio; 2) oppure sceglie le consegne parallele salvate negli ultimi minuti prima dell'avvio (la catena che ha appena chiuso), e la più vecchia resta la riserva.
- Intanto, per le sessioni: parallela appena aperta e conto alto → `git log -1 --format=%ci -- docs/CONSEGNE-PARALLELA-<CATENA>.md` e la coda di `docs/MESSAGGI-MARIO-PARALLELA.md` da quell'ora in poi; i messaggi delle altre catene non si rileggono.

## Attesa lunga (C455): giro a vuoto quando l'avvio da solo porta vicino a 180k (Salvagente 3, 10/11)
- Fatto provato (registro della sessione, stesso conto di `handoff-check.py`): contesto alla PRIMA chiamata 84,8k (prompt di sistema, strumenti, kit: prima di leggere qualsiasi file); al primo stop 183k (letture ~45k, il resto pensieri a impegno Massimo e un'indagine: PT E61). L'hook ha chiesto le consegne dopo un solo messaggio corto, senza lavoro fatto. Catena Salvagente: 3 sessioni chiuse per l'attesa lunga in un'ora (18:52, 19:20, 19:30), Mario non ha ancora risposto. Anche la Principale 55 ha chiuso 15 minuti dopo l'avvio (19:10 → 19:25, da `docs/CHI-FA-COSA.md`; causa non misurata da me).
- Perché non rende (stima, non misura): la sessione nuova riparte da ~85k e rilegge consegne, errori e stato; se la precedente ha fatto solo l'avvio, le consegne costano un secondo avvio per tornare allo stesso punto.
- Proposte, da far scegliere a Mario (regola 🔒, non provate): 1) guardia: dopo una chiusura per l'attesa lunga, la sessione successiva non richiude per lo stesso motivo finché Mario non ha scritto o non c'è lavoro nuovo oltre l'avvio; 2) soglia dell'attesa lunga contata sopra il contesto della prima chiamata (es. prima chiamata + 100k) invece di 180k fissi; 3) «avvio leggero» per le sessioni nate solo per aspettare una risposta: pochi passi fissi scritti da `fatti` nelle consegne.

## Promemoria di una 🛑 all'avvio: il blocco «❓» corto fa riscrivere la domanda (Salvagente 4, 10/11, PT E62)
- Fatto provato (`difetti()` di `domande-chiare.py` sui due testi): il promemoria scritto come blocco «❓ DOMANDE» senza «📌» e con le scelte «1.» → fine del turno bloccata, domanda riscritta, Mario riceve due messaggi; lo stesso promemoria come riga semplice che parte da «🛑» → nessun difetto.
- Proposta, da valutare nel kit (non provata): nell'avviso «🛑 DECISIVE» di `avvio-check.py` dire «una riga ciascuna, fuori dal blocco ❓».
