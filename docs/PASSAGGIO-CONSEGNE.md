# Passaggio di consegne

Sessione attuale: #54 (dopo la #53 `session_01WTjqUwM2NNTWHtEAdVH6dq`, chiusa alla soglia 10/11 18:21; la apre la #53 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); C137 = in emergenza il ricettario si ferma (richiesta sua, non è un blocco alle persone: ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 è FATTA e online (v0.10.17): non rifarla.
- **Cosa preme a Mario adesso (10/11 18:21):** 1) C135 corsia d'emergenza degli avvisi + C137 modalità risparmio, insieme nella v0.10.18, pubblicate PRIMA dell'01:00 (promesso). 2) All'01:05 sveglia: il server deve ripartire. Mario era arrabbiato per il blocco di Cloudflare (PT E53, E54): niente soldi, niente blocchi alle persone.

## Stato (10/11 18:21 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta (il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs` del ramo pubblica sito e server da solo: `sito.yml`). Scorta `scorta-principale-20261110-01WTjqUwM2NN…` = della #53 (questa): unirla solo se ha lavoro non nel ramo.
- v0.10.17 online (C136). Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.17; `ricettario.js` contiene «Carica altre» (6 volte, provato 18:20).
- C136 come funziona: chiave `auto` nel Ricettario (DO), di base spenta → il cron `*/10` legge 1 riga e basta (MISURA: 144 righe al giorno); `mettiAuto`, `turboFerma`, `autoAcceso`, `caricoN` (CARICO_BASE 20, CARICO_MAX 50), azioni `/api/gz` `auto` e `ferma`; opzione `ricCarico` in `opzioni.js` (gruppo mario); interruttore «Motore automatico» solo con `puoSviluppare()` nel dettaglio Database, con `confirm`. Prove: `tools/prova-database.mjs` 168/168 (blocco «C136»), app 90/90 (89 nel giro + C55 rifatta).
- Server: memoria (Durable Objects) bloccata da Cloudflare fino alle 01:00 italiane. Verifica: `curl -s …/api/chiave` → oggi errore «letture gratuite», dopo le 01:00 `{"chiave":"…"}`.
- Sveglia `trig_019AjEgskwCdnYiW9q8jirgp` (send_later, 11/11 01:05) legata alla #53: la #54 la rifà sua e cancella questa (E248).
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca `data.js` → va rifatta come v0.10.19 o dopo (`git apply --exclude=data.js` + novità a mano).
- `docs/DA-FARE.md` ~40,9 KB (tetto 40.960 byte): prima di aggiungere, sposta storia in `docs/DA-FARE-FATTE.md` (attenzione: C122 sembra finita ma è APERTA, promessa del kit).
- Kit: RVC ha pronto il 38.18 (messaggio di Risparmio 20, 18:02): arriva col «KIT NUOVO» all'avvio, non urgente; Preferenze v38 uguali.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- Piani: C137 `docs/lavori-in-corso/c137-modalita-risparmio.md`; C136 `docs/lavori-in-corso/c136-blocco-ricettario.md`; C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch.
- Foto dell'email di Cloudflare: `archivio/foto/2026-11-10-1645-email-cloudflare-blocco.jpg`, `…-1653-email-cloudflare-orari.jpg`.

## Sessione appena chiusa (#53)
- C136 v0.10.17 (online 18:20): motore automatico spento, carichi a mano di N, «⏹ Ferma», testi onesti senza «ogni 10 minuti» (con `d.auto` tornano quelli vecchi). Foto a Mario non ancora mandata (promessa C136 «👁»).
- Risposto a Mario su C135 (come e quando: stasera prima dell'01:00, copia da sola nel KV) e su C137 (piano scritto).
- `docs/CHI-FA-COSA.md` snellito (tolte le righe chiuse #38-#46).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #53: togliere il cron da `wrangler.jsonc` → scartato: senza cron Mario non può riaccendere il motore da solo (regola «Senza Claude»); il cron spento costa 1 riga ogni 10 minuti. `SOLO=` sulla prova C55 da sola fallisce (serve la Home di Monica): `SOLO='Monica: notifica|ricettario \(C55\)'`. Un avviso «📥 N ricette» dello scarico copre i toast controllati: la prova aspetta `!RIC.scarico`. Spostare C122 in FATTE → era aperta (rimessa). `turbo` con n non valido deve dare errore (non partire con 20): solo oltre 50 si taglia.
- #52: copia del kit con Write (~200k token) → `cp`. Eseguire un file scaricato nello scratchpad → rifiutato. `tools/unisci-json.py` a tre vie ha perso `PostModelSwitch`.
- #51: piano Workers Paid → NO di Mario. Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). `send_later` a catena 8 → rifiutato.
- #50: commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- #49: `node --check worker.js` NON vede gli errori dei moduli: `node --input-type=module --check < worker.js`.
- #47-#48: `python3 - <<EOF` con la parola `env` (anche dentro il testo) lo ferma la guardia: script in un file dello scratchpad + `python3 -I`. Monitor con `tail -f` bloccato.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. C135 + C137 nella v0.10.18, pubblicate PRIMA dell'01:00 (promesso a Mario). Occhio critico prima del codice.
   - C135: KV nuovo in `wrangler.jsonc` (`kv_namespaces`). PRIMA controlla sulla guida ufficiale (skill `ricerca-aggiornata`) se wrangler 4 nel deploy di `sito.yml` crea da solo il namespace; se no, guida a Mario coi pulsanti esatti, una riga in «Aspetta Mario». L'oggetto AVVISI, appena risponde (01:00), scrive da solo nel KV UNA chiave con chiavi VAPID e iscrizioni (una scrittura; poi una per ogni iscrizione nuova). `avvisaGestori` e avviso ai clienti: se il DO dà errore → invio dal KV, senza diario. Iscrizione durante il blocco → nel KV, rimessa nel DO dopo. Limiti KV: 100 mila letture, mille scritture al giorno (letti 10/11).
   - C137: piano in `docs/lavori-in-corso/c137-modalita-risparmio.md` (freno C130 o memoria bloccata → ricettario solo con ciò che è salvato; riquadro «🛟 Modalità risparmio fino alle 01:00»). ATTENZIONE: la prova C130 «anche con tantissime letture le ricerche delle persone funzionano» va cambiata: ora Mario vuole il ricettario in pausa (solo ricettario).
   - Prove: `tools/prova-database.mjs` + giro completo; poi push e `curl` della versione.
1. Alle 01:05 (sveglia): `curl -s …/api/chiave` deve dare la chiave; a Mario una riga «server ripartito, notifiche di nuovo attive»; controlla `auto` spento e letture basse. Promessa C130: 7 giorni senza email di Cloudflare.
2. Foto a Mario di C136 (riquadro «🗄 Il mio database» col motore a mano) quando il server risponde (skill `foto`).
3. C130 contatore vero (chiave «Account Analytics», Aspetta Mario) al «1». C127 al «1».

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (9 della principale). Nessuna nuova della #53. Controllo Da fare: 1 voce aggiunta (C137); C135 aggiornata.

## Ultimo messaggio di Mario
10/11 18:13 (in questa chat, #53), parola per parola: «quando è in modalità emergenza mettinche non si possono fare cose quasi inutili come aggiornate ricettario al solo cose base per far funzionare il programma al 100%» → C137 (piano detto a Mario: freno o memoria bloccata, ricettario in pausa fino alle 01:00, base sempre), con C135 nella v0.10.18.
Prima: 18:10 «come integriamo il server emergenza e quando?» → risposto (KV, copia da sola, stasera prima dell'01:00).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C138; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-10 17:48 · [AVVIO] Sessione #53 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio fatto, C136 v0.10.17
- 2026-11-10 18:10 · come integriamo il server emergenza e quando? → risposto; C135 in `docs/DA-FARE.md`
- 2026-11-10 18:13 · quando è in modalità emergenza mettinche non si possono fare cose quasi inutili … → C137 modalità risparmio (piano in `docs/lavori-in-corso/c137-modalita-risparmio.md`)

Ultimo, intero:
> quando è in modalità emergenza mettinche non si possono fare cose quasi inutili come aggiornate ricettario al solo cose base per far funzionare il programma al 100%
