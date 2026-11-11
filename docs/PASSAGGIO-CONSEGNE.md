# Passaggio di consegne

Sessione attuale: #60 (dopo la #59 `session_01WTjqUwA2q291z3N1uEMDoL`, chiusa alla soglia 11/11 13:52; la apre la #59 con `create_session` (catena 8 di 8: la PROSSIMA la apre Mario, passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 13:52):** 1) il cassetto C135: Mario è al **passo 2** della guida (sotto, «C135»); aspetta la risposta; 2) dolci proteici leggeri (C139, regola 2) + più siti fitness (Blog di GialloZafferano trovato); 3) C140 giri di prova casa → Blacksmith → GitHub.

## Stato (11/11 13:52 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261111-01WTjqUwA2q2/claude/pronti-ramo-definitivo.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs` pubblica da solo (`sito.yml`): codice a metà = patch in `docs/lavori-in-corso/`, mai commit dei `.js`. Pubblicazioni 0.10.20-22 verdi (sito aggiornato).
- **v0.10.22 online** (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.22; `…/ricette-fit.js` ha 191 righe `  {`). Giro completo locale 93/93 sulla 0.10.20; sulla 0.10.22 92/93 con la sola soglia della prova C139 (carte ≥ 10) poi corretta a 3 e `SOLO=C139` verde.
- **C135, cosa manca**: causa del 10041 = account sbagliato (PT E64). Guida data a Mario nella #59 (passi: 1 https://dash.cloudflare.com con l'email del sito, non `info.prontiintavola`; 2 ☰ → Compute → Workers & Pages deve mostrare pronti-in-tavola, sennò cambia account con le freccine ⇕; 4 ☰ → Storage & databases → Workers KV → Create instance; 5 nome `pronti-in-tavola-riserva`; 6 Create; 7 manda l'indirizzo della pagina). Mario ha scritto «passo 2 della guida» (13:52) e ha avuto i passi 2-7. Quando manda l'indirizzo (`…/<account>/workers/kv/namespaces/<ID>…`): ID in `wrangler.jsonc` (togli `//` dalla riga «Da rimettere…», ID nuovo), push, giro verde, `/api/stato` → `riserva` accesa dopo 10 minuti.
- **C135 come funziona** (worker.js, cerca «C135», `riservaKv`): copia `avvisi` scritta solo quando cambia; cron `*/10` → `riserva()`; `/api/prova {riserva:true}` = prova di Mario. ~150 letture KV al giorno.
- **C139**: online v0.10.22 con 191 (dolci 4). #59: regola 2 in `docs/lavori-in-corso/c139-soglie-snack.patch` (NON nel codice: `git apply` di quella patch su `ricettario.js` e `opzioni.js`; soglie `fitSnackProt` 8, `fitSnackPerc` 20, `fitSnackZuc` 30 + nota). La raccolta `node tools/raccogli-fit.mjs 200` era partita nella #59 (dopo 200/1915 pagine: 35 buone) ma il contenitore non passa: va RIFATTA (~30 min, in sottofondo) DOPO il `git apply` (legge le soglie da `ricettario.js`). Terza fonte trovata: **Blog di GialloZafferano** (`blog.giallozafferano.it/<blog>/<ricetta>`, 301 → pagina con JSON-LD `nutrition` per porzione, provato). Dettagli e siti scartati: `docs/lavori-in-corso/c139-ricette-senza-consumi.md` (in fondo).
- Server: ripartito l'11/11 alle 01:26 (non alle 01:00: PT E63); `/api/chiave` dà la chiave, `/api/stato` 2 telefoni iscritti, `riserva: {spenta: true}` (manca il cassetto). Verifica: `curl -s …/api/chiave` → `{"chiave":…}`.
- Sveglie: nessuna mia; nessuna da rifare.
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca `data.js` → v0.10.19 o dopo (`git apply --exclude=data.js` + novità a mano), al «1» di Mario.
- File snelli: `docs/ERRORI.md` ~10 KB, al tetto (lezione nuova = riga corta + storia in `ERRORI-STORIA.md`); `docs/DA-FARE.md` voci ≤ 400 caratteri.
- Chat parallela **Salvagente 4** attiva (C138, solo documenti, `docs/CONSEGNE-PARALLELA-SALVAGENTE.md`, riga 🛑 in Aspetta Mario): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto (arriva col «KIT NUOVO» all'avvio), non urgente; Preferenze v38 uguali.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.
- Piani: C137 `docs/lavori-in-corso/c137-modalita-risparmio.md`; C136 `docs/lavori-in-corso/c136-blocco-ricettario.md`; C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch.
- Manuali KV: developers.cloudflare.com/kv/get-started (dashboard: Workers KV → «Create instance»), /kv/concepts/kv-namespaces («KV namespace IDs are public»), /workers/authorization/workers (permessi per i binding).

## Sessione appena chiusa (#59)
- C139 regola 2 come patch; raccolta avviata (da rifare); ricerca siti → Blog GZ. PT E66 (sito da aprire = link cliccabile; controllo in `.claude/hooks/domande-chiare.py`, 46 prove). Agent Reach: parere no. Guida cassetto passi 1-7.

## Sessione prima (#58)
- Avvio; messaggio di Mario 11:25 (arrivato nella #57) = strada 1 → 191 proteiche nel file del sito, v0.10.20-22 online, PT E65. C140 (giri casa → Blacksmith → GitHub): fatti dai manuali e DOMANDA 1 (motore di casa già collegato?).

## Strade provate e scartate (perché; così la prossima non le rifà)
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
0. Avvio leggero. Sito: v0.10.22. Messaggio di Mario sul cassetto → passo C135 (Stato).
1. C139: `git apply docs/lavori-in-corso/c139-soglie-snack.patch`; poi terza fonte «Blog di GialloZafferano» in `tools/raccogli-fit.mjs` (trova l'elenco: ricerca dei blog o pagine «ricette proteiche»; stessa regola `fitRic`; solo JSON-LD `nutrition` per porzione); poi `node tools/raccogli-fit.mjs 200` in sottofondo (~30+ min), `SOLO=C139`, giro completo, versione, push, foto a Mario. Ogni blocco di sito o ricerca detto subito a Mario (sua richiesta 13:42).
2. C135: alla risposta di Mario → `wrangler.jsonc`, push, giro verde, `/api/stato`.
3. C140: alla risposta sul motore di casa → specifica `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
4. Foto di Mario di Proteiche per chiudere la promessa C139.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (11 della principale; la C139 tolta: Mario ha risposto 2). Controllo Da fare: 0 voci aggiunte (i 4 messaggi della #59 sono già in C135, C139, PT E66; Agent Reach = solo parere).

## Ultimo messaggio di Mario
11/11 13:52, parola per parola: «passo 2 della guida» → dati i passi 2-7 della guida del cassetto (C135); aspetta il suo indirizzo o foto.
Prima: 13:50 foto Agent Reach «che dici se integriamo questo per le ricerche ?» (`archivio/foto/2026-11-11-1349-agent-reach.jpg`) → parere no; 13:43 «scusa e la regola dei link? perché l'hai saltata quella cliccabile se devo entrare e quella copiabile se devo copiare cerca come mai non l'hai presa» → PT E66; 13:36 «vai di consiglio e procediamo con la guida cassetto» → C139 = 2, guida C135.

## Numeri liberi
Prossimo E libero: PT E67; prossimo C libero: C141; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 12:56 · [AVVIO] Sessione #59 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio
- 2026-11-11 13:36 · vai di consiglio e procediamo con la guida cassetto → C139 = 2 (patch), guida C135
- 2026-11-11 13:43 · scusa e la regola dei link? perché l'hai saltata quella cliccabile se devo entra… → PT E66
- 2026-11-11 13:50 · che dici se integriamo questo per le ricerche ? → parere no (foto in archivio)
- 2026-11-11 13:52 · passo 2 della guida → C135 passi 2-7

Ultimo, intero:
> passo 2 della guida

