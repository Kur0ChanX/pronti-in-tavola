# Passaggio di consegne

Sessione attuale: #57 (dopo la #56 `session_01WTjqUwi3AbYevJZMMno3mN`, chiusa 11/11 06:35 per attesa lunga oltre 180k; la apre la #56 con `create_session` (catena 6 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 e C137 (v0.10.18) sono FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55: non rifarlo.
- **Cosa preme a Mario adesso (11/11 06:35):** accendere la corsia d'emergenza C135. Mario ha CREATO il cassetto (ID `a8b7372a6c4244f289dcbe7f79fed771`, account `0818809e56ba46be591961c5e07b2eca`, «standard», nome `pronti-in-tavola-riserva`), ma il deploy col binding è fallito: «KV namespace not found [code: 10041]». Aspetto la sua foto di Compute → Workers & Pages (c'è «pronti-in-tavola» in quell'account?). Niente soldi, niente blocchi alle persone (PT E53, E54).

## Stato (11/11 06:31 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD origin/claude/pronti-ramo-definitivo`, senza `--short`: PT E59). Nessuna PR aperta (il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs` pubblica da solo: `sito.yml`). Ultimo giro «Pubblica sito» 193 ROSSO (10041) sul commit dce5b93; dopo, il binding è tornato commento (commit 3893430, solo `wrangler.jsonc`: giro nuovo da controllare verde).
- **v0.10.18 online** (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.18; `ricettario.js` contiene `ric-risparmio`). C137 attiva; C135 nel codice ma **spenta** (`/api/stato` → `riserva: {spenta: true}` quando il server risponde).
- **C135, cosa manca**: il deploy col cassetto. Log del giro 193: wrangler vede `env.RISERVA (a8b7…)`, poi l'API `/workers/scripts/pronti-in-tavola/versions` risponde «KV namespace … not found» (10041). Due ipotesi NON provate (PT E10): A) il Worker è in un altro account (il segreto `CLOUDFLARE_ACCOUNT_ID` è mascherato nel log); B) il token di GitHub (`CLOUDFLARE_API_TOKEN`, «Account API Token») senza permesso KV non vede il cassetto. Il manuale «Editor basta» si è rivelato FALSO o non vale qui. Esperimento: foto di Mario di Compute → Workers & Pages nell'account del cassetto. Se c'è «pronti-in-tavola» → B: guidare Mario ad aggiungere al token il permesso «Workers KV Storage: Edit» (pulsanti da verificare sul manuale prima, PT E6; Account API Tokens sta in Manage Account). Se non c'è → A: ricreare il cassetto nell'account giusto. Poi in `wrangler.jsonc` togliere `//` dalla riga «Da rimettere…».
- **C135 come funziona** (worker.js, cerca «C135», `riservaKv`): la copia `avvisi` (VAPID, iscritti, clienti) si scrive solo quando cambia; cron `*/10` → `riserva()` (1 lettura KV); `/api/ultimo` = il più recente fra oggetto e KV `ultimo` (TTL 1 giorno); `/api/prova {riserva:true}` = prova di Mario dalla copia. Consumo KV misurato dalla #54: ~150 letture e poche scritture al giorno (gratis: 100.000 letture, 1.000 scritture).
- Server: ripartito l'11/11 alle 01:26 (non alle 01:00: PT E63); `/api/chiave` dà la chiave, `/api/stato` 2 telefoni iscritti, `riserva: {spenta: true}` (manca il cassetto). Verifica: `curl -s …/api/chiave` → `{"chiave":…}`.
- Sveglie: la mia `trig_012apGb54kDTC1piNcujxKiB` (01:05) è già suonata; quella della #55 `trig_014GQsL6yeqH3aSfpkb9gCRD` SPENTA (delete rifiutato dal permesso automatico). Nessuna sveglia da rifare.
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca `data.js` → v0.10.19 o dopo (`git apply --exclude=data.js` + novità a mano), al «1» di Mario.
- File snelli: `docs/ERRORI.md` 9,5 KB (storia intera in `docs/ERRORI-STORIA.md`: lezione nuova = riga corta lì + testo lungo nella storia); `docs/DA-FARE.md` 38,7 KB (18 voci accorciate, testo intero in fondo a `DA-FARE-FATTE.md` come ELENCO «- (APERTA…)», mai righe `| C…`: PT E60).
- Chat parallela **Salvagente 4** attiva (C138, solo documenti, `docs/CONSEGNE-PARALLELA-SALVAGENTE.md`, riga 🛑 in Aspetta Mario): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto (arriva col «KIT NUOVO» all'avvio), non urgente; Preferenze v38 uguali.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.
- Piani: C137 `docs/lavori-in-corso/c137-modalita-risparmio.md`; C136 `docs/lavori-in-corso/c136-blocco-ricettario.md`; C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch.
- Manuali KV: developers.cloudflare.com/kv/get-started (dashboard: Workers KV → «Create instance»), /kv/concepts/kv-namespaces («KV namespace IDs are public»), /workers/authorization/workers (permessi per i binding).

## Sessione appena chiusa (#56)
- Avvio; sveglia 01:05: server fermo fino alle 01:26 (PT E63 scritta). Guida del cassetto corretta in `GUIDE-GIUSTE.md` (dal telefono il link apre la Home: menù ☰ → Storage & databases → Workers KV; l'ID non è in Settings ma nell'indirizzo della pagina: `…/kv/namespaces/<ID>/settings`). Foto di Mario in `archivio/foto/2026-11-11-0613-*`.
- Mario ha creato il cassetto; collegato in `wrangler.jsonc` → deploy rosso 10041 → tolto di nuovo (online sempre v0.10.18, verificato).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #56: collegare un cassetto creato a mano con il solo accesso «Editor» del token → «KV namespace not found 10041» (manuale: «non servono permessi sulle risorse collegate», dal vivo NON vale o è l'account). Link `dash.cloudflare.com/?to=/:account/workers/kv/namespaces` dal telefono → apre la Home.
- #55: collegare il cassetto dal pannello «Associazioni» del Worker → scartato: il deploy successivo da GitHub (`wrangler.jsonc`) lo toglierebbe. `git rev-parse --short HEAD origin/…` → «Needed a single revision» che sembra un push fallito (PT E59). Testo intero delle voci aperte come righe `| C…` in `DA-FARE-FATTE.md` → `promesse.py --controlla` rosso (PT E60).
- #54: Context7 → quota del mese finita: ricerca Parallel (skill `ricerca-aggiornata`). Heredoc `cat > file <<EOF` con la parola `env` → fermato dalla guardia: script scritti con Write. Per C55: spia su `mostraToast`.
- #53: togliere il cron da `wrangler.jsonc` → scartato (Mario non potrebbe riaccendere il motore). `turbo` con n non valido deve dare errore.
- #51: piano Workers Paid → NO di Mario. Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). `send_later` a catena 8 → rifiutato.
- #50: commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. Avvio leggero (PT E61). Mario risponde qui o nella #56: se ha mandato la foto di Workers & Pages nella #56, leggila da `docs/MESSAGGI-MARIO.md`/archivio.
1. Controlla che il giro «Pubblica sito» del commit 3893430 (o successivo) sia VERDE (`mcp__github__actions_list`, `sito.yml`, perPage 2).
2. Foto di Mario: c'è «pronti-in-tavola» → ipotesi B: verifica sul manuale i pulsanti per aggiungere «Workers KV Storage: Edit» all'Account API Token (Manage Account → Account API Tokens → modifica), guida Mario passo passo, poi rimetti il binding e ripubblica; controlla `…/api/stato` → `riserva` con `quando` dopo il cron (10 minuti). Non c'è → ipotesi A. Scrivi la causa vera in `ERRORI.md` (PT E64) e correggi `GUIDE-GIUSTE.md`.
3. Poi: foto di Mario di C136 (Ricettario → «🗄 Il mio database») e C135 (Notifiche → «🛟 Corsia d'emergenza pronta» + «🧪 Prova»). C130 e C127 al «1».

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (10 della principale; C135 riga «🟡 Principale 56»: foto di Workers & Pages). Controllo Da fare: 0 voci aggiunte (i messaggi di Mario della #56 sono tutti sul cassetto C135).

## Ultimo messaggio di Mario
11/11 ~06:20, parola per parola: «https://dash.cloudflare.com/0818809e56ba46be591961c5e07b2eca/workers/kv/namespaces/a8b7372a6c4244f289dcbe7f79fed771/settings» → ID del cassetto preso; deploy rosso 10041; a Mario chiesta la foto di Compute → Workers & Pages.
Prima: «fatto ora?», «Jurisdiction o standard?» (→ standard), «ora?» con 2 foto, «dimmi cosa devo fare».

## Numeri liberi
Prossimo E libero: PT E64; prossimo C libero: C139; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-10 19:22 · [AVVIO] Sessione #56 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio fatto, sveglia 01:05 (server ripartito 01:26, PT E63)
- 2026-11-11 05:07 · dimmi cosa devo fare → passi del cassetto C135
- 2026-11-11 06:13 · ora? → guida corretta (menù Storage & databases), GUIDE-GIUSTE
- 2026-11-11 06:16 · Jurisdiction o standard? → risposta: standard
- 2026-11-11 06:17 · fatto ora? → ID dall'indirizzo della pagina
- 2026-11-11 06:20 · https://dash.cloudflare.com/[segreto tolto dalla scorta]/workers/kv/namespaces/[… → ID in wrangler.jsonc, deploy rosso 10041, tolto; chiesta foto Workers & Pages

Ultimo, intero:
> https://dash.cloudflare.com/[segreto tolto dalla scorta]/workers/kv/namespaces/[segreto tolto dalla scorta]/settings

