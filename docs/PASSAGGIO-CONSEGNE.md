# Passaggio di consegne

Sessione attuale: #58 (dopo la #57 `session_01WTjqUuGgdEp6b8Lnd8vrPB`, chiusa alla soglia 11/11 10:58; la apre la #57 con `create_session` (catena 7 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 10:58):** 1) il ricettario non deve MAI più bloccare Cloudflare (C139, Mario 10:39: «funzionare bene io, Monica e i clienti… tutto il resto è superfluo»); 2) accendere la corsia d'emergenza C135: il cassetto fatto da Mario sta nel login Cloudflare SBAGLIATO (`info.prontiintavola@…`, Workers & Pages vuoto, foto 06:37 e 06:39); Mario deve fare Log out, entrare col login del sito (probabilmente `mario.miscera@…`), account «Pronti in Tavola», e ricreare il cassetto `pronti-in-tavola-riserva` (standard). Niente soldi, niente blocchi alle persone.

## Stato (11/11 10:58 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261111-01WTjqUuGgdE/claude/pronti-ramo-definitivo.
- Ramo = origin (verifica: `git rev-parse HEAD origin/claude/pronti-ramo-definitivo`, senza `--short`: PT E59). Nessuna PR aperta (il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs` pubblica da solo: `sito.yml`). Ultimo giro «Pubblica sito» 193 ROSSO (10041) sul commit dce5b93; dopo, il binding è tornato commento (commit 3893430, solo `wrangler.jsonc`: giro nuovo da controllare verde).
- **v0.10.19 online** (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.19; `ricettario.js` contiene `okConsumo`). Giro «Pubblica sito» 194 verde; dopo, il push d99687a (controlla verde con `actions_list sito.yml perPage 1`). C137 attiva; C135 spenta (`/api/stato` → `riserva: {spenta: true}`).
- **C135, cosa manca**: causa del 10041 TROVATA (PT E64, foto di Mario): cassetto nell'account `0818…` del login `info.prontiintavola`, che non ha il Worker. Quando Mario manda l'indirizzo del cassetto NUOVO (`…/<account>/workers/kv/namespaces/<ID>/settings`): metti l'ID in `wrangler.jsonc` (togli `//` dalla riga «Da rimettere…», ID nuovo), push, controlla il giro verde, poi `/api/stato` → `riserva` con `quando` dopo 10 minuti. Guida corretta in `GUIDE-GIUSTE.md` (cassetto C135).
- **C135 come funziona** (worker.js, cerca «C135», `riservaKv`): copia `avvisi` scritta solo quando cambia; cron `*/10` → `riserva()`; `/api/prova {riserva:true}` = prova di Mario. ~150 letture KV al giorno.
- **C139 (v0.10.19)**: in Proteiche momenti, fonti, invio e voce SOLO filtrano (prima facevano partire `cercaFit` da soli: era la crescita); `okConsumo()` in `ricettario.js` = conferma con avviso tecnico su Carica altre, Cerca adesso, Controlla tutte, Cerca altre; `LETTURE_FONDO` 1.000.000 in `worker.js`. Prove 92/92. Piano e domanda: `docs/lavori-in-corso/c139-ricette-senza-consumi.md`.
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

## Sessione appena chiusa (#57)
- Avvio leggero; foto di Mario: Workers & Pages vuoto e profilo `info.prontiintavola` → C135 causa = login/account sbagliato (PT E64, GUIDE-GIUSTE corretta, foto `archivio/foto/2026-11-11-0637-*` e `-0639-*`).
- C139 v0.10.19 fatta e online (vedi Stato). Riavvio del contenitore a metà: scorta mia unita.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #56: collegare un cassetto creato a mano con il solo accesso «Editor» del token → «KV namespace not found 10041» (manuale: «non servono permessi sulle risorse collegate», dal vivo NON vale o è l'account). Link `dash.cloudflare.com/?to=/:account/workers/kv/namespaces` dal telefono → apre la Home.
- #55: collegare il cassetto dal pannello «Associazioni» del Worker → scartato: il deploy successivo da GitHub (`wrangler.jsonc`) lo toglierebbe. `git rev-parse --short HEAD origin/…` → «Needed a single revision» che sembra un push fallito (PT E59). Testo intero delle voci aperte come righe `| C…` in `DA-FARE-FATTE.md` → `promesse.py --controlla` rosso (PT E60).
- #54: Context7 → quota del mese finita: ricerca Parallel (skill `ricerca-aggiornata`). Heredoc `cat > file <<EOF` con la parola `env` → fermato dalla guardia: script scritti con Write. Per C55: spia su `mostraToast`.
- #53: togliere il cron da `wrangler.jsonc` → scartato (Mario non potrebbe riaccendere il motore). `turbo` con n non valido deve dare errore.
- #51: piano Workers Paid → NO di Mario. Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). `send_later` a catena 8 → rifiutato.
- #50: commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. Avvio leggero (PT E61). Controlla il giro «Pubblica sito» di d99687a verde.
1. Mario manda l'indirizzo del cassetto nuovo (C135) → `wrangler.jsonc`, push, giro verde, `/api/stato` riserva accesa; poi chiedi la foto Notifiche → «🛟 Corsia d'emergenza pronta» + «🧪 Prova».
2. Mario risponde alla DOMANDA C139 (1 = Claude cerca e mette le ricette in un file statico del sito, zero letture; 2 = solo app; 3 = tutte e due). Con 1 o 3: piano corto in `c139-…md` (file JSON in `FILE_APP` di `tools/sito.py` e `GUSCIO` di `sw.js`, PT E38; fonti ufficiali PT E25), poi codice.
3. Foto di Mario della conferma in Proteiche («🔍 Cerca altre») per chiudere la promessa C139.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (11 della principale; nuove della #57: C135 🛑 login giusto, C139 strada 1-3). Controllo Da fare: 1 voce aggiunta (C139).

## Ultimo messaggio di Mario
11/11 10:39, parola per parola: «Una cosa, le ricette della palestra, quelle proteiche stanno crescendo, ma non vorrei che si ricreasse assolutamente quel problema di bloccare Claude Flare. Evitalo assolutamente, al massimo le ricette le aggiungiamo da Claude, ti dico di fare una ricerca e di aggiungerle tu manualmente, oppure dall'app, ma con doppia richiesta, con doppio clic, che magari esce un avviso che dice potrebbero consumare i dati di, e mi metti la cosa tecnica. Insomma, per le cose superflue facciamo attenzione ai consumi di tutta l'app. Deve funzionare bene io, Monica, e i clienti dobbiamo comunicare bene, con notifiche, risposte, tutto il funzionamento dell'app fatto bene, tutto il resto è superfluo.» → C139 v0.10.19 + DOMANDA 1-3.
Prima (foto 06:37 Workers & Pages vuoto; 06:39 menù profilo `info.prontiintavola`) → PT E64, passi Log out e login giusto.

## Numeri liberi
Prossimo E libero: PT E65; prossimo C libero: C140; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 06:33 · [AVVIO] Sessione #57 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → 
- 2026-11-11 10:39 · Una cosa, le ricette della palestra, quelle proteiche stanno crescendo, ma non v… → 

Ultimo, intero:
> Una cosa, le ricette della palestra, quelle proteiche stanno crescendo, ma non vorrei che si ricreasse assolutamente quel problema di bloccare Claude Flare. Evitalo assolutamente, al massimo le ricette le aggiungiamo da Claude, ti dico di fare una ricerca e di aggiungerle tu manualmente, oppure dall'app, ma con doppia richiesta, con doppio clic, che magari esce un avviso che dice potrebbero consumare i dati di, e mi metti la cosa tecnica. Insomma, per le cose superflue facciamo attenzione ai consumi di tutta l'app. Deve funzionare bene io, Monica, e i clienti dobbiamo comunicare bene, con notifiche, risposte, tutto il funzionamento dell'app fatto bene, tutto il resto è superfluo.

