---
name: cambio-account
description: 🔒 Passi del cambio account (Mario scrive «cambio account» o il limite settimanale sta per finire), del salvataggio automatico e della ripartenza quando i token finiscono di colpo. Regola bloccata, non si cambia senza il consenso di Mario.
---

# 🔒 Cambio account e salvataggio

Regola bloccata: non la cambio, ammorbidisco o tolgo senza il consenso esplicito di Mario.
Mario ha più account Claude; il lavoro vive su GitHub, mai solo nel contenitore.

## Quando
- Mario scrive «cambio account», oppure il limite settimanale sta per finire.
- L'avviso `get_session` → `rate_limit_info.status` = `allowed_warning` NON è una percentuale (visto già al 51%): da solo non fa partire il cambio né rifare le consegne. La percentuale vera la vede solo Mario in **Utilizzo**.

## Passi
1. Consegne complete come dice la skill `consegne` (consegne, controlli, `docs/DA-FARE.md`), fino al push confermato: `git rev-parse HEAD` = `origin/<ramo>`. Anche un solo controllo falso: mi fermo e scrivo a Mario.
2. La sessione nuova NON la apro io (eccezione alla catena di `create_session`): nascerebbe nell'account senza token.
3. Titolo di questa sessione col segno «chiusa» della sua catena: `🔴 <icona> Principale <NN> · <cosa ha fatto>` (parallela: il segno «chiusa» e il nome della sua catena, es. `🟥 <icona> Dov'è <NN> · …`; regola «Titoli», skill `consegne` fase 6). Le righe di «## 0. Aspetta Mario» in `docs/DA-FARE.md` restano.
4. A Mario il prompt di 3 righe da incollare nell'altro account, in UN solo riquadro, con repo esatto e ramo presi dal `CLAUDE.md`:
   ```
   [AVVIO] Sessione #<NN+1> di <progetto> (repo <Owner/Repo>, ramo <ramo>): git fetch origin <ramo> && git merge --ff-only origin/<ramo> (se «HEAD detached», prima git checkout <ramo>).
   Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md; continua da sola dai «Prossimi passi».
   I numeri delle sessioni continuano da qui.
   ```
   Lo stesso prompt, col titolo nuovo, anche in `docs/PROSSIMA-SESSIONE.md` (skill `consegne`, fase 5), così Mario lo copia da GitHub.
5. Una riga a Mario: i suoi 3 passi (Preferenze nel profilo, Parallel nella chat, aprire la sessione) sono in `docs/kit-progetto/CAMBIO-ACCOUNT.md`.
- Un solo account attivo per progetto alla volta; tutti i progetti passano insieme. I numeri delle sessioni continuano.

## Salvataggio automatico
- Il salvataggio continuo lo fa l'hook `.claude/hooks/scorta.py` (zero token): l'ultimo messaggio di Mario in `docs/ULTIMO-MESSAGGIO.md` e gli ultimi 40 in `docs/MESSAGGI-MARIO.md` (chat parallela: `docs/ULTIMO-MESSAGGIO-PARALLELA.md` e `docs/MESSAGGI-MARIO-PARALLELA.md`, C291) e il lavoro nel ramo `scorta-<ruolo>-<AAAAMMGG>-<id sessione>/<ramo>`, una scorta per sessione (C352). Non fa partire le prove (prova `python3 -I tools/test-scorta.py`).
- Il lavoro finito è già su GitHub (push dopo ogni pezzo, `REGOLE.md`): la scorta copre solo quello a metà. Consegne complete una volta sola, alla soglia.

## Token finiti di colpo
- Mario apre la sessione nell'altro account e scrive: «la sessione di prima si è interrotta: controlla su GitHub cosa manca e riparti».
- La sessione nuova fa l'avvio normale. L'hook segnala la SCORTA → `git diff --stat HEAD <scorta>`, `git merge` della propria scorta (mai quella dell'altra chat), push, e legge il proprio `docs/ULTIMO-MESSAGGIO….md`: un messaggio di Mario mai arrivato in chat lo dice e lo esegue.
