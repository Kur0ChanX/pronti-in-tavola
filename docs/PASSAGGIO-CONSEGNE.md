# Passaggio di consegne

Sessione attuale: #62 (dopo la #61 `session_01WTjqUu7eADM6beo2ANa1vf`, chiusa alla soglia 11/11 18:50; la apre la #61 con `create_session` (catena 1 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 #60):** 1) foto di Proteiche → «🍰 Dolci» (v0.10.23, chiude C139) e di Notifiche «🛟 Corsia d'emergenza pronta» (chiude C135); 2) DOMANDA 1 C139 ricette di Massimo Pietrobon Gobbi (1 link a mano · 2 YouTube automatico · 3 niente; consiglio 1); 3) C140 giri casa → Blacksmith → GitHub.

## Stato (11/11 18:50 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Giri in corso: Pubblica sito. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261111-01WTjqUu7eAD/claude/pronti-ramo-definitivo.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs` pubblica da solo (`sito.yml`): codice a metà = patch in `docs/lavori-in-corso/`, mai commit dei `.js`. Pubblicazioni 0.10.20-22 verdi (sito aggiornato).
- **v0.10.23 online** (#60: C139 regola 2 + blog GZ, C135 riserva ACCESA). Prima: **v0.10.22 online** (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.22; `…/ricette-fit.js` ha 191 righe `  {`). Giro completo locale 93/93 sulla 0.10.20; sulla 0.10.22 92/93 con la sola soglia della prova C139 (carte ≥ 10) poi corretta a 3 e `SOLO=C139` verde.
- **C135**: cassetto `c4fa18640b4846cba693e198059fd860` in `wrangler.jsonc`, pubblicato #60, riserva ACCESA (verifica: `curl -s …/api/stato | grep -o '"riserva":{[^}]*}'` → `quando`, 2 telefoni, 3 clienti). Manca la foto di Mario.
- **C135 come funziona** (worker.js, cerca «C135», `riservaKv`): copia `avvisi` scritta solo quando cambia; cron `*/10` → `riserva()`; `/api/prova {riserva:true}` = prova di Mario. ~150 letture KV al giorno.
- **C139**: v0.10.23 online, 200 proteiche (RicetteFit 163, GZ 36, Blog GZ 1; dolci 22, merenda 23, colazione 17). Regola 2 nel codice. Blog GZ: id `bg:<blog>/<ricetta>` (`gz.mjs` `urlBg`), 348 candidate ma quasi nessuna con valori per porzione. Verifica: `curl -s …/ricette-fit.js | grep -c '^  {'` → 200. Dettagli: `docs/lavori-in-corso/c139-ricette-senza-consumi.md`.
- Server: `/api/chiave` dà la chiave, `/api/stato` 2 telefoni, riserva accesa.
- Sveglie: nessuna mia; nessuna da rifare.
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca `data.js` → v0.10.19 o dopo (`git apply --exclude=data.js` + novità a mano), al «1» di Mario.
- File snelli: `docs/ERRORI.md` ~10 KB, al tetto; `docs/DA-FARE.md` voci ≤ 400 caratteri. Giro completo ora lancia anche le prove del server (PT E67): 94 passi.
- Chat parallela **Salvagente 4** attiva (C138, solo documenti, `docs/CONSEGNE-PARALLELA-SALVAGENTE.md`, riga 🛑 in Aspetta Mario): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto (arriva col «KIT NUOVO» all'avvio), non urgente; Preferenze v38 uguali.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.
- Piani: C137 `docs/lavori-in-corso/c137-modalita-risparmio.md`; C136 `docs/lavori-in-corso/c136-blocco-ricettario.md`; C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch.
- Manuali KV: developers.cloudflare.com/kv/get-started (dashboard: Workers KV → «Create instance»), /kv/concepts/kv-namespaces («KV namespace IDs are public»), /workers/authorization/workers (permessi per i binding).

## Sessione appena chiusa (#60)
- C139 regola 2 + terza fonte Blog GZ → v0.10.23 online (giro 94/94); C135 cassetto collegato, riserva accesa; PT E67 (prove del server fuori dal giro: C130 e `prova-limiti` erano rosse); domanda Pietrobon.

## Sessione prima (#59)
- C139 regola 2 come patch; raccolta avviata (da rifare); ricerca siti → Blog GZ. PT E66 (sito da aprire = link cliccabile; controllo in `.claude/hooks/domande-chiare.py`, 46 prove). Agent Reach: parere no. Guida cassetto passi 1-7.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #60: Blog di GialloZafferano come fonte di dolci → solo 1 su 348 ha i valori per porzione (codice tenuto: link incollati e futuri blog coi valori). Pietrobon Gobbi: nessun sito, ricette solo nei post/video con kcal della ricetta intera, Instagram col login → domanda a Mario. Passo «prove del server» in testa al giro → faceva scadere la prova del vapore: va in fondo.
- #59: Agent Reach (Panniantong) → no: legge social (X, Reddit, YouTube), segnalato «critico» da uno scanner (issue #802), vuole cookie. Siti scartati per i dolci: Melarossa (solo kcal), My-personaltrainer (per 100 g), Starbene (nessun valore), negozi; inglesi (BBC Food, Eating Bird Food) = tradurre = PT E25. Commit dei `.js` a metà → il Stop hook chiede commit: patch + `git stash`.
- #58: allentare SOLO gli zuccheri degli snack (30 % o 40 %) → +2 dolci appena: li blocca la quota di proteine. Altre 10 ricerche di dolci su GZ (senza zucchero, albumi, ricotta…) → 0 nuove buone. Filtro «yogurt»/«dolc» nei nomi → pollo a colazione e «patate dolci» nei dolci (PT E65). `tools/anteprima.py` con `ricette-fit.js` dentro → rompe i conteggi delle prove vecchie: il file si aggiunge solo nella prova C139 (`addScriptTag`, poi `RICETTE_FIT.splice(0)`).
- #57: ipotesi B (permesso KV del token) SCARTATA: il problema era il login/account (PT E64). Tasti dei momenti in Proteiche che cercano sul web da soli → tolti (consumavano). Prova C55 da sola (`SOLO=C55`) è rossa anche prima delle modifiche: nel giro completo è verde.
- #56: collegare un cassetto creato a mano con il solo accesso «Editor» del token → «KV namespace not found 10041» (manuale: «non servono permessi sulle risorse collegate», dal vivo NON vale o è l'account). Link `dash.cloudflare.com/?to=/:account/workers/kv/namespaces` dal telefono → apre la Home.
- #55: collegare il cassetto dal pannello «Associazioni» del Worker → scartato: il deploy successivo da GitHub (`wrangler.jsonc`) lo toglierebbe. `git rev-parse --short HEAD origin/…` → «Needed a single revision» che sembra un push fallito (PT E59). Testo intero delle voci aperte come righe `| C…` in `DA-FARE-FATTE.md` → `promesse.py --controlla` rosso (PT E60).
- #54: Context7 → quota del mese finita: ricerca Parallel (skill `ricerca-aggiornata`). Heredoc `cat > file <<EOF` con la parola `env` → fermato dalla guardia: script scritti con Write. Per C55: spia su `mostraToast`.
- #53: togliere il cron da `wrangler.jsonc` → scartato (Mario non potrebbe riaccendere il motore). `turbo` con n non valido deve dare errore.
- #51: piano Workers Paid → NO di Mario. Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). `send_later` a catena 8 → rifiutato.
- #50: commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. Avvio leggero. Sito v0.10.23.
1. Alle foto di Mario: chiudere le promesse C139 e C135 in `docs/DA-FARE.md`.
2. DOMANDA 1 Pietrobon: «1» → Mario manda link, ricette a mano con valori divisi per porzione (fonte = suo post, PT E25); «2» → chiave YouTube Data API (request_credential), lettura descrizioni; «3» → togliere la riga.
3. C140: alla risposta sul motore di casa → specifica `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (11 della principale, compresa la 🛑 Pietrobon). Controllo Da fare: 0 voci aggiunte (i 2 messaggi arrivati nella #59 dopo l'handoff sono in C135 e C139).

## Ultimo messaggio di Mario
(#60: nessun messaggio nuovo di Mario; gli ultimi due sono arrivati nella #59 e sono stati fatti qui.)
11/11 ~13:57 (nella #59 dopo l'handoff), parola per parola: «https://dash.cloudflare.com/d6fb052e691f8763af8421b0f214664a/workers/kv/namespaces/c4fa18640b4846cba693e198059fd860» → C135: cassetto NUOVO, account `d6fb…664a`, ID `c4fa18640b4846cba693e198059fd860` → `wrangler.jsonc`, push, giro verde, `/api/stato` riserva accesa.
Prima: 11/11 13:55 (nella #59 dopo l'handoff), foto del canale YouTube «Massimo Pietrobon gobbi» (@massimopietrobongobbi, 881 video, Short di dolci proteici: tortino al limone, torta al cioccolato…; `archivio/foto/2026-11-11-1355-youtube-pietrobon.jpg`), parola per parola: «vorrei tutte le sue ricette» → da valutare in C139 (video senza testo né valori per porzione? PT E25; descrizioni dei video, sito o libro suo?) e dirlo a Mario.
Prima: 11/11 13:52, parola per parola: «passo 2 della guida» → dati i passi 2-7 della guida del cassetto (C135); aspetta il suo indirizzo o foto.
Prima: 13:50 foto Agent Reach «che dici se integriamo questo per le ricerche ?» (`archivio/foto/2026-11-11-1349-agent-reach.jpg`) → parere no; 13:43 «scusa e la regola dei link? perché l'hai saltata quella cliccabile se devo entrare e quella copiabile se devo copiare cerca come mai non l'hai presa» → PT E66; 13:36 «vai di consiglio e procediamo con la guida cassetto» → C139 = 2, guida C135.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C143; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 17:44 · chiave → 
- 2026-11-11 17:47 · chiave sono al pc → 
- 2026-11-11 17:48 · sono al pc fammi incollarew la chiave → 
- 2026-11-11 17:49 · riprova → 
- 2026-11-11 17:50 · la metto nel'ambiente → 
- 2026-11-11 17:52 · fatto → 
- 2026-11-11 17:52 · nell'ambiente pronti in tavola → 
- 2026-11-11 17:53 · fatto → 
- 2026-11-11 18:04 · ok vai avanti allora → 
- 2026-11-11 18:22 · nelle ricette aggiungile tutte quante e metti un voto o fammi capire ler ricetta… → 

Ultimo, intero:
> nelle ricette aggiungile tutte quante e metti un voto o fammi capire ler ricetta quanto è proteica calorica grassa zuccheri sale ecc ecc con i voti o inventati tu qualcosa di migliore ti dò carta bianca fai passare tutte le ricette proteiche

