---
name: unione-pr
description: Passi per unire (squash) una PR verso main da sola quando il giro completo è tutto verde sull'ultimo commit (fuori, dove dice `tools/scegli-giro.py`: Blacksmith, GitHub o in locale), e per riallineare subito il ramo di lavoro.
---

# Unione di una PR

## Prima
- Unisco da sola, senza chiedere, solo col giro completo finito e tutto verde sull'ultimo commit, dove dice `tools/scegli-giro.py` (Blacksmith o GitHub; in locale solo a minuti finiti; `REGOLE.md` «Rami e PR»; oltre 2000: skill `minuti-github`). Dopo, una riga a Mario: «PR N unita, v.. in pubblicazione».
- La PR si apre (o si segna pronta) solo a versione finita: le cose che cambiano l'aspetto hanno già l'ok di Mario sulla foto.
- **Ramo-copia** (C148, Mario 23/10 «1», dalla v76): il ramo comune non entra mai in una PR, così resta libero.
  1. Sul commit X del ramo comune: verdi le prove della parte cambiata, `npm run prove:regole` (E185) e quelle «come GitHub» (`CI=true`, E100/E103: `VERSIONI`, service worker). Il giro completo è uno solo, fuori, dove dice `tools/scegli-giro.py` (Mario #296 «1»: niente doppio giro in locale).
  2. `git push origin X:refs/heads/versione-vNN` (solo la copia; il ramo comune non si muove).
  3. `create_pull_request` head `versione-vNN`, base `main`, `draft: false` → parte UN giro, dove dice lo smistatore (skill `minuti-github`; senza minuti fuori, il giro completo in locale). Riga «PR N da versione-vNN» in `docs/CHI-FA-COSA.md`. Aspetto l'evento `check_suite`, leggo l'esito una volta.
  4. Rosso: prima la PR torna in bozza (`POST /repos/{owner}/{repo}/pulls/{n}/ccr/convert_to_draft`), poi la correzione sul ramo comune (prove locali). Se sul ramo comune dopo X c'è solo lavoro pronto e provato: `git push origin HEAD:refs/heads/versione-vNN` (in avanti). Sennò in una cartella a parte: `git worktree add --detach .claude/worktrees/vNN origin/versione-vNN`, `git -C .claude/worktrees/vNN cherry-pick <commit>`, `git -C .claude/worktrees/vNN push origin HEAD:refs/heads/versione-vNN`, poi `git worktree remove .claude/worktrees/vNN`. Poi la PR di nuovo pronta: giro nuovo.
  5. Versione con la sola urgenza: come il punto 4, con la cartella da `origin/main`.
- Prove verdi sul commit attuale della PR: giro su GitHub FINITO, non annullato da un push dopo (`pull_request_read` `get_check_runs`); in locale, il commit del giro (`git rev-parse HEAD` all'inizio) = `head.sha` della PR.
- **Il giro verde deve essere sull'ULTIMO commit della PR** (E113): `head_sha` del giro = `head.sha` della PR. Un push su una PR pronta non fa partire le prove: se dopo il giro c'è stato un push di codice, NON unisco. Eccezione: i commit dopo il giro verde toccano solo documenti (`gh api repos/{owner}/{repo}/compare/<sha verde>...<head>`: solo `docs/`, `archivio/`, `.claude/`, `*.md` in radice, la lista del passo «Solo documenti» di `prove.yml`) → unisco (es. consegne con la PR pronta). Rifaccio il giro così: PR in bozza (`POST /repos/{owner}/{repo}/pulls/{n}/ccr/convert_to_draft`) e di nuovo pronta (`.../ccr/ready_for_review`).

- Corsia veloce (Mario #152): PR con solo documenti, colori (`app/src/stile.css`) o testi (`app/src/lingue/`); la scelta la fa `tools/prove-scelte.mjs` (passo «Quali prove nel browser servono?» di `prove.yml`). Il giro su GitHub dura ~4 min (prove nel browser saltate, fatte in locale sulla schermata toccata). Solo prove nuove → quelle; qualsiasi altro file, il lunedì, il lancio a mano o un dubbio → tutte. Logica, regole e build girano sempre (prova: `tests/prove-scelte.test.js`). Unisco appena verde, come sempre.

## Passi
1. `merge_pull_request` con metodo `squash`, `commit_title` = titolo della PR con « (#N)» e `commit_message` corto scritto da me (cosa cambia per chi usa l'app). Mai il messaggio di base: GitHub incolla i messaggi di TUTTI i commit e un «[skip ci]» delle consegne ferma i workflow del push su `main`, pubblicazione compresa (E132, v62). La guardia blocca l'unione senza `commit_message` o con «[skip ci]».
2. Controllo che la pubblicazione sia partita: `gh api "repos/{owner}/{repo}/actions/runs?head_sha=<sha di main>" --jq .total_count` > 0 dopo ~20 s. Se 0: `gh workflow run pubblica-app.yml --ref main` (e `firebase-regole.yml` / `cloudflare-worker.yml` se la PR tocca i loro file). Poi aspetto la fine in sottofondo e controllo il sito vero prima di dire «online».
3. SUBITO, prima di ogni altra modifica o commit: `git fetch origin main && git merge origin/main`, poi push del ramo di lavoro. Perché: un commit fatto prima del merge fa tornare righe già tolte e crea conflitti (E31).
4. Conflitti: mi fermo e li spiego a Mario.

## Intoppi noti
- «unrelated histories»: il contenitore ha la storia corta. Prima `git fetch --unshallow origin`, poi il merge normale (E19). Mai `--allow-unrelated-histories`.
- GitHub nega l'unione: lo dico a Mario e propongo un workflow automatico.
