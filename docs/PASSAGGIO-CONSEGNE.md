# Passaggio di consegne

Sessione attuale: #55 (dopo la #54 `session_01WTjqUv32ceej8YoR2QzfQU`, chiusa alla soglia 10/11 18:56; la apre la #54 con `create_session` (catena 4 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); C137 = in emergenza il ricettario si ferma (richiesta sua: ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 e C137 (v0.10.18) sono FATTE: non rifarle.
- **Cosa preme a Mario adesso (10/11 19:10):** 1) v0.10.18 online alle 19:20 (promessa «prima dell'01:00» mantenuta); il primo deploy era fallito (PT E57); C135 spenta finché non c'è il cassetto KV. 2) C135 si accende solo col cassetto: passo a mano di Mario (vedi Prossimi passi 1). 3) All'01:05 il server deve ripartire. Niente soldi, niente blocchi alle persone (PT E53, E54).

## Stato (10/11 18:56 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta (il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs` pubblica sito e server da solo: `sito.yml`). Scorta `scorta-principale-20261110-01WTjqUv32ce…` = della #54 (questa): unirla solo se ha lavoro non nel ramo.
- **v0.10.18 ONLINE (19:20, provato: `curl …/data.js` → 0.10.18, `ricettario.js` contiene `ric-risparmio`; giro completo 92/92, server 180/180).** Storia: il push delle 18:56 è FALLITO nel giro «Pubblica sito» (run 42869980930: «/storage/kv/namespaces… Authentication error 10000»: il token è un Account API Token senza KV, PT E57). Rifatta SENZA `kv_namespaces` in `wrangler.jsonc` (C137 attiva; C135 nel codice ma spenta: `/api/stato` → `riserva: {spenta: true}`, Notifiche lo dice onestamente). Verifica: `curl -s …/data.js | grep -m1 VERSIONE_APP` → 0.10.18 e il giro sito.yml verde (`mcp__github__actions_list`, `list_workflow_runs`, `sito.yml`). Se non l'ha spinta la #54: giro completo `node tools/prova.js` (la prova «7 tocchi sulla firma» cade lanciata DA SOLA con SOLO, nel giro completo passava), poi commit e push.
- **C135 come funziona** (worker.js, cerca «C135»): KV `RISERVA` in `wrangler.jsonc` SENZA id (wrangler ≥4.45 lo crea al deploy; il token di Workers Builds ha «Workers KV Storage Edit», doc ufficiale letta 10/11). L'oggetto Avvisi scrive la chiave `avvisi` (VAPID pub+priv, iscritti, clienti) solo quando cambia (`copiaRiserva`, firma su elenchi ordinati); cron `*/10` → `riserva()` (1 lettura KV, rimette i `nuovi` iscritti durante il blocco, rifà la copia se manca). Ogni `/api/*` degli avvisi passa da `oRiserva(oggetto, corsia)`. `/api/ultimo` = il più recente fra oggetto e KV `ultimo`. `/api/prova {riserva:true}` = prova di Mario dalla copia (sw.js tipo `riserva`). La copia NON c'è finché la memoria è bloccata: si fa da sola al primo giro del cron dopo l'01:00.
- **C137 come funziona**: server `RISPARMIO(perche)` + `DB_PAUSA` in `ricettaGz` (cerca, controlla, cercaFit, turbo con n, archivio, proposte, ricerche dal vivo) con freno (`LETTURE_FONDO` 2 milioni) o memoria bloccata (503, `risparmio.perche` 'freno'|'bloccato'). App: tutte le domande del ricettario passano da `chiediRic` (ricettario.js), riquadro `#ric-risparmio` «🛟 Modalità risparmio fino alle 01:00» (ora da mezzanotte UTC).
- Prove: `tools/prova-database.mjs` 180/180 (blocchi C135 e C137); app 92/92 (giro completo 91 + C55 resa stabile, PT E56).
- Server: memoria (Durable Objects) bloccata da Cloudflare fino alle 01:00. Verifica: `curl -s …/api/chiave` → errore «letture gratuite» fino all'01:00, poi `{"chiave":…}`; `curl -s …/api/stato | grep -o '"riserva":{[^}]*}'` → `quando` della copia.
- Sveglia mia `trig_01VVC4R65aFGLDtnJ2jvRjgC` (send_later, 11/11 01:05, legata alla #54): la #55 la rifà sua e cancella questa (E248).
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca `data.js` → v0.10.19 o dopo (`git apply --exclude=data.js` + novità a mano).
- File oltre il tetto: `docs/DA-FARE.md` ~40 KB (tetto 40 KB) e `docs/ERRORI.md` 24 KB (tetto 10 KB): snellirli (storia in `DA-FARE-FATTE.md` / `ERRORI-STORIA.md`; C122 è APERTA).
- Chat parallela **Salvagente** attiva (C138 «salvagente in casa», solo documenti, `docs/CONSEGNE-PARALLELA-SALVAGENTE.md`): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto (arriva col «KIT NUOVO» all'avvio), non urgente; Preferenze v38 uguali.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.
- Piani: C137 `docs/lavori-in-corso/c137-modalita-risparmio.md`; C136 `docs/lavori-in-corso/c136-blocco-ricettario.md`; C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch.
- Doc ufficiale KV automatico: developers.cloudflare.com/workers/wrangler/configuration («Automatic provisioning»); permessi del token di Workers Builds: developers.cloudflare.com/workers/ci-cd/builds/configuration («API token»).

## Sessione appena chiusa (#54)
- C135 corsia d'emergenza + C137 modalità risparmio scritte, provate e spinte (v0.10.18, 18:56). Aiutante (voci Notifiche e Ricettario) e GUIDA aggiornati (diceva ancora «una ricetta ogni 10 minuti»).
- PT E55 (firma della copia e /api/ultimo, prove rosse trovate da me) e PT E56 (prova C55 «a volte»: ora spia tutti gli avvisi) in `docs/ERRORI.md`.
- Sveglia 01:05 rifatta mia; quella della #53 cancellata.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #54: Context7 → quota del mese finita: usata la ricerca Parallel (skill `ricerca-aggiornata`). Heredoc `cat > file <<EOF` con la parola `env` → fermato dalla guardia anche fuori da `python3 -`: script scritti con Write. Aspettare `!RIC.scarico` prima del clic non bastava per C55 (lo scarico parte DOPO il clic): spia su `mostraToast`.
- #53: togliere il cron da `wrangler.jsonc` → scartato (Mario non potrebbe riaccendere il motore). `SOLO=` sulla prova C55 da sola: `SOLO='Monica: notifica|ricettario \(C55\)'`. `turbo` con n non valido deve dare errore.
- #51: piano Workers Paid → NO di Mario. Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). `send_later` a catena 8 → rifiutato.
- #50: commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- #49: `node --input-type=module --check < worker.js` (il `--check` semplice non vede gli errori dei moduli).
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. Subito all'avvio: `curl` della versione (0.10.18?). Se il deploy è fallito: log del giro, causa vera, correzione (PT E53: prima la fonte). Poi a Mario, nel primo messaggio, cosa c'è di nuovo (tabella corta): corsia d'emergenza (Impostazioni → Notifiche, «🧪 Prova la corsia» solo Mario, funziona dopo l'01:00 quando la copia c'è) e modalità risparmio («🛟» in alto nel Ricettario). «Chiudi e riapri l'app» (PT E22).
1. **C135 da accendere (passo a mano di Mario, dopo il «1»)**: A cosa serve: senza il cassetto, se Cloudflare ferma di nuovo la memoria, i telefoni non suonano. Strada consigliata: Mario crea il cassetto in Cloudflare (Storage e database → Workers KV → Crea, nome `pronti-in-tavola-riserva`) e manda l'ID (non è segreto: «KV namespace IDs are public»); tu lo scrivi in `wrangler.jsonc` (`"kv_namespaces": [{ "binding": "RISERVA", "id": "…" }]`) e pubblichi. Pulsanti esatti: PRIMA verifica sulla doc ufficiale e su `docs/GUIDE-GIUSTE.md` (PT E6), poi riga in «Aspetta Mario». Alternativa: dare al token «Workers KV Storage: Modifica».
2. Alle 01:05 (sveglia): `…/api/chiave` dà la chiave; `…/api/stato` ha `riserva.quando` (copia fatta; se manca, aspetta il giro del cron delle 01:10); motore `auto` spento, letture basse. A Mario una riga «server ripartito, notifiche attive, corsia d'emergenza pronta: tocca «🧪 Prova la corsia d'emergenza»». Promessa C130: 7 giorni senza email di Cloudflare.
3. Foto a Mario (skill `foto`) di C136 (riquadro «🗄 Il mio database») e di C135 (Notifiche con «🛟 Corsia d'emergenza pronta») quando il server risponde: chiudono le promesse 👁.
4. C130 contatore vero (chiave «Account Analytics», Aspetta Mario) al «1». C127 al «1» (patch pezzi 2-3).
5. Snellire `docs/DA-FARE.md` e `docs/ERRORI.md` (oltre il tetto).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (9 della principale). Nessuna nuova della #54. Controllo Da fare: 0 voci aggiunte (nessun messaggio di Mario in questa sessione); C135 e C137 aggiornate (fatte, v0.10.18).

## Ultimo messaggio di Mario
10/11 18:13 (nella #53), parola per parola: «quando è in modalità emergenza mettinche non si possono fare cose quasi inutili come aggiornate ricettario al solo cose base per far funzionare il programma al 100%» → C137, fatta nella v0.10.18 (#54) con C135.
Prima: 18:10 «come integriamo il server emergenza e quando?» → C135 (KV, copia da sola), fatta nella v0.10.18.

## Numeri liberi
Prossimo E libero: PT E58; prossimo C libero: C139; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, da `get_session` della #54): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-10 18:23 · [AVVIO] Sessione #54 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio fatto; C135 + C137 v0.10.18 spinta 18:56

Ultimo, intero:
> [AVVIO] Sessione #54 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo claude/pronti-ramo-definitivo): git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo (se «HEAD detached», prima git checkout claude/pronti-ramo-definitivo).
> Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md; continua da sola dai «Prossimi passi».
