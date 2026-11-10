---
name: nuova-regola
description: Regola nuova o cambiata sul modo di lavorare: controllo dei conflitti, dove va (hook, REGOLE, skill, Preferenze, CLAUDE.md, diario), versione del kit, pacchetto e pulizia. Usala ogni volta che Mario dà o cambia una regola e per ogni cambio del kit.
---

# Regola nuova

## 0. Controllo conflitti (obbligatorio, PRIMA di scrivere)
1. `python3 -I tools/cerca-regola.py <2-3 parole e sinonimi>`: cerca in `CLAUDE.md`, `REGOLE.md`, Preferenze, diario, skill, regole per zona, hook, aiutanti e `settings.json` (righe corte, al massimo 40). Niente trovato: provo un sinonimo.
2. Guardo ogni esito (possono essere più di uno):
   - **Già coperta** (stesso senso): non la scrivo una seconda volta. A Mario una riga: dove sta già (`file:riga`). Se il testo nuovo è più chiaro, sostituisco quello vecchio nello stesso posto.
   - **Contraddice** una regola che c'è: non scrivo niente. Domanda a Mario con scelte numerate e il mio consiglio: «1 · tengo quella di prima (testo, dove) · 2 · tengo la nuova (testo) · 3 · le unisco (testo)». Una regola 🔒 resta finché Mario non dà il consenso esplicito.
   - **Spreca token o peggiora il lavoro** (anche se l'ha chiesta Mario): lo dico col perché (stima di token, tempo o rischio) e propongo una versione migliore: «1 · la tua · 2 · la mia». Scrivo quella scelta.
   - **Nuova e senza problemi**: vado al punto 1.
3. **File, elenco o registro nuovo** (anche senza regola, E207): prima `ls docs/` e `grep -ril <argomento> docs/ .claude/`: un file o una voce che fa già quel lavoro c'è? → scrivo lì, una cosa in un posto solo. L'hook `file-nuovi.py` ferma una volta ogni file nuovo in `docs/`.

## 1. Classifico (un posto solo)
| La regola… | Livello | Dove |
|---|---|---|
| deve valere sempre e un programma la può controllare | C · imposto | hook in `.claude/hooks/` + prova `tools/test-<nome>.py`, acceso in `.claude/settings.json` |
| vieta un comando | C · imposto | `permissions.deny` in `.claude/settings.json` + guardia `.claude/hooks/guardia.py` (con il caso in `tools/test-guardia.py`) |
| dice come parlare a Mario, in tutte le chat | D + A | «COME PARLARMI» di `docs/PREFERENZE-CLAUDE.md` e `docs/kit-progetto/REGOLE.md` |
| è una procedura a passi | B · a richiesta | skill `.claude/skills/<nome>/SKILL.md` (nel kit con `fai-kit.py`) |
| è corta e vale per tutti i progetti | A · sempre | `docs/kit-progetto/REGOLE.md` |
| vale solo per questo progetto | — | `CLAUDE.md` del progetto; solo per una zona del codice → `.claude/rules/<zona>.md` con `paths:` |
| è la lezione di un errore | — | una riga in `docs/ERRORI.md`, la storia in `docs/ERRORI-STORIA.md` |

Una frase si dimentica, un hook no: se si può controllare, va imposta. Una regola 🔒 non cambia testo senza il consenso esplicito di Mario. I file di `.claude/` e `CLAUDE.md` li può bloccare il controllo di sicurezza di Claude («Self-Modification»): serve l'ok di Mario scritto nella chat di quella sessione.

## 2. Scrivo
- Una idea per riga, senza storia: date, citazioni di Mario e perché vanno in `docs/STORIA-REGOLE.md`.
- Regola di Mario su come parlargli: anche in «COME PARLARMI» di `docs/PREFERENZE-CLAUDE.md`; le regole di lavoro nei progetti solo nel kit (`REGOLE.md`, skill, hook): in `PREFERENZE-CLAUDE.md` niente copia (lotto L6, kit 38.0).
- Tetti (li controlla `tools/fai-kit.py`): `CLAUDE.md` ~1.000 token, `REGOLE.md` ~6.000 token, `PREFERENZE-CHAT.txt` 2.500 caratteri. Mai alzare un tetto da solo: è di Mario.
- **Due livelli** (oltre il tetto di `REGOLE.md`): mai togliere parole a una regola per starci (E236). Nella regola resta il «cosa», corto e a parole intere; il «come» (passi, esempi, casi) va INTERO in una skill del kit, e la regola finisce col rimando «→ skill `nome`». Una skill nuova costa anche la sua descrizione, sempre caricata: conviene solo per un blocco grande; sennò il blocco va in una skill che c'è già. `fai-kit.py` si ferma se un rimando non ha la sua skill nel kit. Nel `CLAUDE.md` del progetto e in `PREFERENZE-CHAT.txt` invece si accorcia senza cambiare il senso.

## 3. Versione e kit (solo nel progetto fonte del kit, quello con `tools/fai-kit.py`)
1. `docs/kit-progetto/VERSIONE` = «kit N.M · gg/mm/aaaa · Preferenze vN». N = versione delle Preferenze: sale se cambia il loro testo. M = cambi solo del kit: sale per tutto il resto (torna a 0 quando sale N).
2. La stessa versione in testa a `REGOLE.md` («kit N.M · gg/mm/aaaa») e a `docs/PREFERENZE-CLAUDE.md` («vN · gg/mm/aaaa · …»).
3. `python3 -I tools/fai-kit.py`: copia le skill del kit, impostazioni e Preferenze; genera `PREFERENZE-CHAT.txt`; si ferma oltre i tetti o con versioni diverse.
4. `python3 -I tools/fai-pacchetto.py`: pacchetto per gli altri progetti. Poi le prove degli hook (`python3 -I tools/test-*.py`) e `--controlla` di tutti e due.
- Progetto che non è la fonte: il kit non lo cambio. Se serve subito, la regola va nel `CLAUDE.md` del progetto; una riga in `docs/DA-FARE.md` («regola da portare nel kit») e lo dico a Mario.

## 4. Pulizia (a ogni versione nuova del kit: nella fonte dopo il punto 3, negli altri progetti dopo il pacchetto)
1. `python3 -I tools/pulizia-kit.py`: file di `docs/` e `.claude/` orfani o mai usati (nessun file li cita), citati solo dalla storia, doppi (stesso contenuto). Skill, aiutanti, regole per zona, copie del kit e pacchetto non contano.
2. `/doctor prompt-audit`, **solo quando una regola cambia SENSO, o una volta al mese** (C450, Mario 04/11 «solo pro»; Mario 23/10: un giro intero legge ~5 milioni di token); per spostamenti e righe nuove no: il controllo mirato dei conflitti resta `cerca-regola.py` a ogni regola (passo 1); sennò una riga «Audit: saltato (righe nuove, nessun senso cambiato)». Controlla le istruzioni che si caricano (`CLAUDE.md`, import, skill, regole, hook). Lo lancio in una copia del repo con origine finta, così non tocca il ramo e non riempie la chat: `env -u CLAUDE_CODE_SESSION_ID -u CLAUDE_CODE_REMOTE_SESSION_ID claude -p "/doctor prompt-audit" --allowedTools Read Grep Glob` (uscita in un file; leggo solo il riassunto).
3. A Mario una riga per file (lista numerata: togliere con `git rm` o spostare in `archivio/`) e una riga per problema dell'audit (con la correzione proposta). **Mai cancellare né spostare da soli**: solo i numeri che Mario sceglie. Niente da segnalare: una riga «Pulizia: niente da togliere».

## 5. A Mario
- Cambiata la chat (livello D): al massimo UNA volta al giorno, a fine giornata (Mario 23/10: «non a ogni cambio»); i cambi del giorno si sommano nella stessa versione. Il testo INTERO di `docs/kit-progetto/PREFERENZE-CHAT.txt` in UN solo riquadro, da incollare in https://claude.ai/settings/general (riquadro delle preferenze personali: cancella tutto e incolla) in ogni account. Mai «sostituisci la riga…»: non si capisce dove finisce.
- La domanda «La mando anche agli altri progetti?» con scelte numerate (elenco nel `CLAUDE.md`; progetto indipendente: niente). Le regole delle funzioni di un progetto non si mandano.
- Con il sì: il pacchetto alle sessioni attive nell'ultima ora (`send_message`, una parte per messaggio); per le altre una riga in coda in `docs/DA-FARE.md`.

## Lezioni dal diario (spostate intere da `docs/ERRORI.md`, C469 A6, 09/11)
- **E224** Un hook oltre il suo tempo viene fermato e il suo avviso si perde senza segno (P47: avvio a 65 s, limite 60). Ogni hook: tempo misurato nel caso peggiore e guardia che avvisa prima del limite.
- **E69** Script di un altro repo che scrive `.claude/`: bloccato anche con l'ok. `CLAUDE.md`, hook e `.mcp.json`: negati `cp` ed Edit dopo un «Accendi» generico; copia nella scratchpad = aggiramento (P43). Serve un ok scritto che nomini i file; poi Write, un file per volta.
- **E59** File di `.claude/`: ok di Mario nella chat di quella sessione. Un agente nuovo si carica dopo qualche minuto.
