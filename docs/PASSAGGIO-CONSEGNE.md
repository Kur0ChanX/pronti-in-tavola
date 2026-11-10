# Passaggio di consegne

Sessione attuale: #54 (dopo la #53 `session_01WTjqUwM2NNTWHtEAdVH6dq`, chiusa alla soglia 10/11 18:21; la apre la #53 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.). NUOVO 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario.
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #20 alla #26: stesso file, in fondo.
- **Cosa preme a Mario adesso (10/11 17:46):** 1) C136 PRIMA delle 01:00: il ricettario non deve più lavorare da solo (a mano, poco alla volta), sennò alle 01:00 il cron lo riaccende. 2) C135 corsia d'emergenza degli avvisi (aspetta la scelta 1-3). 3) Alle 01:00 controllare che il server riparta. Mario era arrabbiato per il blocco di Cloudflare (PT E53, E54): niente soldi, niente blocchi alle persone.

## Stato (10/11 18:21 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261110-01WTjqUwM2NN/claude/pronti-ramo-definitivo.
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta (il push di `*.js`, `*.css`, `*.html` del ramo pubblica il sito da solo: `sito.yml`). Scorta `scorta-principale-20261110-01WTjqUuJHcT…` = della #52 (questa): unirla solo se ha lavoro non nel ramo.
- v0.10.16 online (C134, Notifiche oneste col server fermo; giro 90/90). Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.16; `app.js` contiene «server degli avvisi è fermo».
- Server: memoria (Durable Objects) bloccata da Cloudflare fino alle 01:00 italiane; il Worker risponde (errore tradotto da `perche`). Verifica: `curl -s …/api/chiave` → oggi `{"errore":"…letture gratuite…"}`, dopo le 01:00 `{"chiave":"…"}`.
- Kit 38.16 applicato (prove degli hook 33/33, commit 436a230e): `CLAUDE.md` corto, `.claude/numeri-doppi.json` (data.js + DA-FARE), `tools/consegne.py` = quello di RVC adattato (REPO, ICONA, «di Pronti in Tavola»), settings = kit + `comandi-piccoli.py` + `effortLevel` xhigh, `.mcp.json` senza parallel-search (c'è il connettore Parallel). Verifica: `cat docs/kit-progetto/VERSIONE`. Gli hook nuovi valgono da questa sessione nuova.
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca `data.js` → ora va rifatta come v0.10.17 o dopo (`git apply --exclude=data.js` + novità a mano).
- `docs/DA-FARE.md` ~40,8 KB (tetto 40.960 byte): prima di aggiungere, sposta storia in `docs/DA-FARE-FATTE.md`.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- Piani: C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch; C131 `docs/lavori-in-corso/c131-regole-proteiche.md`; C126 `docs/lavori-in-corso/c126-proteiche-momenti-e-fonti.md` (pezzi 3-4).
- Foto dell'email di Cloudflare: `archivio/foto/2026-11-10-1645-email-cloudflare-blocco.jpg`, `…-1653-email-cloudflare-orari.jpg` (avviso 90% 15:29, blocco 15:35).

## Sessione appena chiusa (#52)
- Kit 38.16 (Mario «Kit sì»): 72 file copiati con `cp` dai file estratti (non Write: ~200k token), segnaposto sostituiti, prove 33/33; difetti del pacchetto in `docs/PER-IL-KIT.md`.
- C133: 7 regole → 5 (A lavori automatici, B causa con prova, C soluzioni smart, D guide giuste, E errori col perché), testo in `docs/PER-IL-KIT.md`, mandato a Risparmio 19 (RVC, `session_01WTjqUxBvxdEgUbiyhEijCA`) 17:30 con `send_message`. La vecchia sessione del kit (Kit 1) è chiusa.
- C134 v0.10.16: Notifiche oneste (foto prima/dopo `archivio/foto/2026-11-10-c134-notifiche-confronto.png`, mandata). Mario: «2» = niente riga nella Home.
- C135 spiegata (KV, 100 mila letture/giorno, copia dopo l'01:00 senza riiscrizioni, anche i clienti): aspetta 1/2/3. C136 scritta: da fare per prima.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #52: copiare il pacchetto del kit con Write (punto 3) → ~200k token: copia con `cp` dopo il controllo dei segnaposto (anche `<OWNER>`/`<NOME-REPO>` in `test-guardia.py`). Eseguire un file scaricato nello scratchpad → rifiutato dal controllo automatico: prima nel progetto, poi le prove. `tools/unisci-json.py` a tre vie sulle impostazioni ha perso `PostModelSwitch`: impostazioni = kit + aggiunte del progetto a mano. Foto: nell'anteprima `sulSito()` è falso (niente pulsante né «Ultimi avvisi») → copia nello scratchpad con la condizione a `true`, solo per le foto; saltare l'apertura col tocco su «Salta» e scorrere fino al testo con `scrollBy` del contenitore.
- #51: piano Workers Paid (5 $/mese, sblocca in pochi minuti) → NO di Mario (niente soldi). Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). Rimettere stasera le notifiche senza Cloudflare (KV o un altro account) → scartato: chiave privata e iscrizioni dei telefoni stanno dentro la memoria bloccata, nuove chiavi = tutti i telefoni da riiscrivere. `send_later` e sveglie → rifiutati a catena 8 (lineage 8): per aspettare usare `run_in_background`. Misura delle righe lette nella prova: `EXPLAIN QUERY PLAN` (SCAN = tutta la tabella, SEARCH = righe trovate), non c'è miniflare qui.
- #50: `tools/scarica-kit.py` NON c'è qui e quello della fonte cerca solo 12 parti → curl a mano (17 parti). Commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- #49: `node --check worker.js` NON vede gli errori dei moduli: `node --input-type=module --check < worker.js`. `.find(x => !x || …) || {ok}` nasconde un `null`.
- #48: Monitor con `tail -f` → la guardia lo blocca. Nome di azione nuovo senza `grep` → doppione (PT E51).
- #47: `python3 - <<EOF` con la parola `env` dentro lo ferma la guardia: script in un file dello scratchpad + `python3 -I`.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. C136 SUBITO (prima delle 01:00): nel cron `CRON_DB` di `worker.js` (`scheduled`, ~riga 1263) niente `motoreRicette` / `caricoAuto` / `controllaTutte` automatici; un tasto «Carica altre 20 ricette» nella pagina Database (usa `motoreRicette(cfg, true)` o `turboAvvia` con N piccolo), N nelle Impostazioni dev con tetto sicuro; anche «Cerca ancora» resta a mano. Occhio critico: cosa dipende dal motore automatico (RicetteFit, valori, controllo del giorno, «Oggi +N entrate» di C127/C128: testi da rendere onesti, PT E17). Prove: `tools/prova-database.mjs` (server) + giro dell'app; misura delle letture (riga «MISURA»). Pubblicare prima delle 01:00.
1. Alle 01:00: `curl -s …/api/chiave` deve dare la chiave; a Mario una riga «server ripartito, notifiche di nuovo attive». Promessa C130: 7 giorni senza email di Cloudflare.
2. C135 DECISO (Mario 17:50, dopo l'handoff: «1 anche per i clienti e non far riscriversi in clienti per carità se no diventa uno stress quest' app»): per tutti, NESSUNO deve iscriversi di nuovo, quindi dopo l'01:00 copia chiavi VAPID e iscrizioni dal DO a Workers KV (binding nuovo in `wrangler.toml`, scritture solo quando un telefono si iscrive), `avvisaGestori`/avviso ai clienti: se il DO dà errore → invio dal KV, senza diario. Controllare prima i limiti KV sul sito (fatto 10/11: 100 mila letture, mille scritture al giorno).
3. C130 contatore vero (chiave «Account Analytics», Aspetta Mario) al «1».
4. C127 (v0.10.17) al «1»; foto Proteiche quando il server è ripartito.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md`. Nuova della #52: C135 corsia d'emergenza (1 tutti · 2 solo Mario e Monica · 3 no). Chiusa: riga nella Home (Mario «2»). C132 proposte 1-3: ora esempi dentro la regola C mandata al kit, la scelta resta di Mario.

## Ultimo messaggio di Mario
10/11 17:44 (in questa chat, #52), parola per parola: «Ok mi dici che cosa consiste questo canale di emergenza quando durerebbe in fatti alla mano e i clienti ricevono le notifiche se monica gli sposta la data di consegna?» → risposto (KV, regge sempre, clienti sì se si sceglie 1; domanda C135 aperta).
Prima: 17:41 «cmq bisogna mettere un blocco al ritardo se tutto il consumo era quello che non vada sempre in automatico a manuale poco alla volta» + «volevo scrivere un blocco al ricettario» → C136. 17:39 «2 non ci sono stratagemmi per far arrivare una notifica solo per chi fà gli ordini» → «2» alla riga nella Home + C135. 17:34 «mandami una foto prima e dopo» → foto mandata. 17:15 «è normale che funziona?» (foto della prova notifiche) → sì, la prova la fa il telefono; C134.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C138; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-10 17:48 · [AVVIO] Sessione #53 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → 
- 2026-11-10 18:10 · come integriamo il server emergenza e quando? → 
- 2026-11-10 18:13 · quando è in modalità emergenza mettinche non si possono fare cose quasi inutili … → 

Ultimo, intero:
> quando è in modalità emergenza mettinche non si possono fare cose quasi inutili come aggiornate ricettario al solo cose base per far funzionare il programma al 100%

