# Passaggio di consegne

Sessione attuale: #56 (dopo la #55 `session_01WTjqUtvkKYUz8PkqShV8KA`, chiusa alla soglia 10/11 19:25, attesa lunga oltre 180k; la apre la #55 con `create_session` (catena 5 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 e C137 (v0.10.18) sono FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55: non rifarlo.
- **Cosa preme a Mario adesso (10/11 19:25):** 1) accendere la corsia d'emergenza C135: Mario deve creare il cassetto KV e incollare l'ID (DOMANDA 1 della #55, mandata 19:15 con i passi). 2) All'01:05 il server deve ripartire. Niente soldi, niente blocchi alle persone (PT E53, E54).

## Stato (10/11 19:25 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`, senza `--short`: PT E59). Nessuna PR aperta (il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs` pubblica sito e server da solo: `sito.yml`). Scorta `scorta-principale-20261110-01WTjqUtvkKY…` = della #55 (questa): unirla solo se ha lavoro non nel ramo (di solito solo il file del consumo).
- **v0.10.18 online** (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.18; `ricettario.js` contiene `ric-risparmio`). C137 attiva; C135 nel codice ma **spenta** (`/api/stato` → `riserva: {spenta: true}` quando il server risponde).
- **C135, cosa manca**: il cassetto. Il token di GitHub (`CLOUDFLARE_API_TOKEN`, «Account API Token») NON ha i permessi KV (PT E57): wrangler non può crearlo da solo. Strada scelta: Mario lo crea (guida in `docs/GUIDE-GIUSTE.md`, riga «Workers KV, il cassetto…», manuale ufficiale letto 10/11, non ancora visto da Mario) e incolla l'ID (32 caratteri esadecimali, pubblico). Con l'ID: in `wrangler.jsonc` al posto del commento C135 → `"kv_namespaces": [{ "binding": "RISERVA", "id": "<ID>" }],`. Per pubblicare con un cassetto GIÀ creato basta l'accesso Editor ai Worker (developers.cloudflare.com/workers/authorization/workers, «You do not need separate permissions on the bound resources»), ma va provato dal vivo al primo deploy (PT E57): se `sito.yml` fallisce, online resta la v0.10.18 e l'alternativa è dare al token «Workers KV Storage: Modifica» (passi da verificare prima).
- **C135 come funziona** (worker.js, cerca «C135», `riservaKv`): la copia `avvisi` (VAPID, iscritti, clienti) si scrive solo quando cambia; cron `*/10` → `riserva()` (1 lettura KV); `/api/ultimo` = il più recente fra oggetto e KV `ultimo` (TTL 1 giorno); `/api/prova {riserva:true}` = prova di Mario dalla copia. Consumo KV misurato dalla #54: ~150 letture e poche scritture al giorno (gratis: 100.000 letture, 1.000 scritture).
- Server: memoria (Durable Objects) bloccata da Cloudflare fino alle 01:00 (verifica: `curl -s …/api/chiave` → errore «letture gratuite» fino all'01:00, poi `{"chiave":…}`).
- Sveglia mia `trig_014GQsL6yeqH3aSfpkb9gCRD` (send_later, 11/11 01:05, legata alla #55): la #56 la rifà sua e cancella questa (E248).
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca `data.js` → v0.10.19 o dopo (`git apply --exclude=data.js` + novità a mano), al «1» di Mario.
- File snelli: `docs/ERRORI.md` 9,5 KB (storia intera in `docs/ERRORI-STORIA.md`: lezione nuova = riga corta lì + testo lungo nella storia); `docs/DA-FARE.md` 38,7 KB (18 voci accorciate, testo intero in fondo a `DA-FARE-FATTE.md` come ELENCO «- (APERTA…)», mai righe `| C…`: PT E60).
- Chat parallela **Salvagente 3** attiva (C138 «salvagente in casa», solo documenti, `docs/CONSEGNE-PARALLELA-SALVAGENTE.md`, riga 🛑 in Aspetta Mario): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto (arriva col «KIT NUOVO» all'avvio), non urgente; Preferenze v38 uguali.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.
- Piani: C137 `docs/lavori-in-corso/c137-modalita-risparmio.md`; C136 `docs/lavori-in-corso/c136-blocco-ricettario.md`; C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch.
- Manuali KV: developers.cloudflare.com/kv/get-started (dashboard: Workers KV → «Create instance»), /kv/concepts/kv-namespaces («KV namespace IDs are public»), /workers/authorization/workers (permessi per i binding).

## Sessione appena chiusa (#55)
- Avvio: v0.10.18 online verificata; sveglia 01:05 rifatta mia, quella della #54 cancellata; Chi fa cosa aggiornato (righe chiuse 47-53 tolte).
- C135: guida del cassetto verificata sul manuale ufficiale e scritta in `docs/GUIDE-GIUSTE.md`; riga in Aspetta Mario; DOMANDA 1 a Mario (19:15) con i 6 passi.
- `ERRORI.md` 26 → 9,5 KB e `DA-FARE.md` 41,8 → 38,7 KB; C50 corretta (la chiave Groq c'era già). PT E59 (`rev-parse --short`) e PT E60 (voci aperte copiate come righe finite) trovati e scritti.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #55: collegare il cassetto dal pannello «Associazioni» del Worker → scartato: il deploy successivo da GitHub (`wrangler.jsonc`) lo toglierebbe. `git rev-parse --short HEAD origin/…` → «Needed a single revision» che sembra un push fallito (PT E59). Testo intero delle voci aperte come righe `| C…` in `DA-FARE-FATTE.md` → `promesse.py --controlla` rosso (PT E60).
- #54: Context7 → quota del mese finita: ricerca Parallel (skill `ricerca-aggiornata`). Heredoc `cat > file <<EOF` con la parola `env` → fermato dalla guardia: script scritti con Write. Per C55: spia su `mostraToast`.
- #53: togliere il cron da `wrangler.jsonc` → scartato (Mario non potrebbe riaccendere il motore). `turbo` con n non valido deve dare errore.
- #51: piano Workers Paid → NO di Mario. Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). `send_later` a catena 8 → rifiutato.
- #50: commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. Avvio: la DOMANDA 1 (cassetto) è già stata mandata dalla #55 alle 19:15: NON rimandarla intera; se Mario scrive altro, ricordala in una riga.
1. **Mario incolla l'ID del cassetto** (32 caratteri 0-9 a-f; se no, chiedi una foto): scrivilo in `wrangler.jsonc` (vedi Stato), commit e push (pubblica: `sito.yml`). Controlla il giro (`mcp__github__actions_list`, `sito.yml`): verde → dopo l'01:00 `curl -s …/api/stato | grep -o '"riserva":{[^}]*}'` deve dare `quando` (non `spenta`); rosso per permessi → causa vera dal log, a Mario la strada del permesso KV sul token (pulsanti verificati prima, PT E6). Poi riga «Aspetta Mario» C135 tolta e voce C135 aggiornata.
2. Alle 01:05 (sveglia): `…/api/chiave` dà la chiave; motore `auto` spento, letture basse; se il cassetto c'è, `riserva.quando` (copia al cron delle 01:10). A Mario una riga «server ripartito, notifiche attive» (+ «corsia d'emergenza pronta: tocca 🧪 Prova la corsia» solo se la copia c'è). Promessa C130: 7 giorni senza email di Cloudflare.
3. Foto a Mario (skill `foto`) di C136 (riquadro «🗄 Il mio database») e di C135 (Notifiche con «🛟 Corsia d'emergenza pronta») quando il server risponde: chiudono le promesse 👁.
4. C130 contatore vero (chiave «Account Analytics») al «1». C127 al «1» (patch pezzi 2-3).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (10 della principale). Nuova della #55: C135 cassetto (riga «🟢 Principale 55»). Controllo Da fare: 0 voci aggiunte (nessun messaggio di Mario nella #55, solo l'avvio).

## Ultimo messaggio di Mario
10/11 18:13 (nella #53), parola per parola: «quando è in modalità emergenza mettinche non si possono fare cose quasi inutili come aggiornate ricettario al solo cose base per far funzionare il programma al 100%» → C137, fatta nella v0.10.18 (#54) con C135.
Prima: 18:10 «come integriamo il server emergenza e quando?» → C135 (KV, copia da sola), fatta nella v0.10.18; manca il cassetto.

## Numeri liberi
Prossimo E libero: PT E61; prossimo C libero: C139; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, da `get_session` della #55): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-10 19:11 · [AVVIO] Sessione #55 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio fatto; C135 guida + DOMANDA 1; file snelliti

Ultimo, intero:
> [AVVIO] Sessione #55 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo claude/pronti-ramo-definitivo): git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo (se «HEAD detached», prima git checkout claude/pronti-ramo-definitivo).
> Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md; continua da sola dai «Prossimi passi».
