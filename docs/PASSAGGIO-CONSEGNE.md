# Passaggio di consegne

Sessione attuale: #38 (dopo la #37 `session_01WTjqUwYZ9ro8F9Ku7rJMWq`, chiusa alla soglia 09/11 23:01; la apre la #37 con `create_session` (catena 4 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (09/11 ~22:50):** 1) C113: con un iPhone la stessa persona chiedeva due volte il sì di Monica («un disastro… se non riesci togliamo l'approvazione»): corretto in v0.9.92, aspetta la prova di Mario con un iPhone NUOVO; 2) le 4 richieste delle 22:47: C114 foto a strisce (fatto v0.9.93), C115 vapore anche per i clienti, C116 video delle ricette (normale o dimenticanza?), C117 niente PIN/impronta per i clienti.

## Stato (09/11 23:01 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261109-01WTjqUwYZ9r/claude/pronti-ramo-definitivo.
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Sito vero: v0.9.90 online (C112), giro «Pubblica sito» success sul commit e356f431 (09/11 ~21:10); `grep -m1 VERSIONE_APP data.js` → 0.9.90. App: 78 OK, 0 NO sul codice unito con Voce 10.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 77 OK, 0 NO (09/11 ~20:40, v0.9.87). `SOLO=carrello` NON va da solo (il carrello dipende dai passi prima): giro completo, ~3 minuti.
- Server: `node tools/prova-limiti.mjs` → 22 OK (limiti C109 + catena Groq C108, memoria finta); `node tools/prova-ascolta.mjs` → 27 OK (di Voce).
- Motore e regole: `npm run prova-firebase` → 98 OK; `npm run prova-regole` → 66 OK (09/11 ~18:00, non toccati qui). Regole Firebase NON cambiate in questa sessione (il campo `prova` negli ordini dei clienti accettati è già permesso).
- Sito: `python3 -I tools/sito.py` → «OK sito: 18 file». Sito vero https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica a ogni push di file dell'app; esito: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` (NON `mcp__github__actions_list`: ignora per_page e manda 30 giri, ~25k token).
- Kit RVC 35.0. Soglia 320k: vale se l'id della sessione è nella riga «Principale» di `docs/CHI-FA-COSA.md`.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#37)
- v0.9.91 (C111): firma «Powered by» con `touch-action: manipulation` + `cursor: pointer` (iPad: i 7 tocchi veloci erano zoom col doppio tocco, ipotesi non provata), `accendiDev()` + pulsante «🛠 Accendi la modalità sviluppatore» in `schedaMario`, 7 tocchi che rispondono sempre; `button, summary, label, [data-a]` senza zoom col doppio tocco. C109: `ascoltoQuota` in `segnalazioniHtml` e `sw.js`, opzione `ascoltoAvviso` (gruppo 'mario'), Voce 10 avvisata.
- v0.9.92 (C113): accesso anonimo del cliente anche nel cookie `pit_acc` (dati.js `ricordaAccesso` dopo l'accesso, `riprendiAccesso` prima di `getAuth`, `cancellaAccesso` in `esci` e per Google). iPhone copia nell'app sulla Home solo i cookie (WebKit 17.2; OpenPWA 20/10/2026 su iOS 18.6.2); l'SDK trova l'accesso in localStorage e lo sposta in IndexedDB. Prova Firebase «C113» (contesto coi soli cookie): 99 OK, 0 NO. Lezione PT E44.
- v0.9.93 (C114): `ric-zoom` in ricettario.js ingrandisce UNA foto della striscia (`data-n`/`data-j`, `.ric-zoom-taglio`), prova nel passo «foto a strisce». App 79 OK, 0 NO.
- Foto di Mario in `archivio/foto/2026-11-09-2231-iphone-doppia-richiesta.jpg` e `2026-11-09-2247-ricetta-*.jpg`. Per far girare `npm run prova-firebase` in un contenitore nuovo: prima `npm ci`.
- Controllo Da fare: 5 voci aggiunte (C113-C117).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).
- C109 (#35): codice scritto PRIMA della scelta di Mario (la regola era arrivata da un'altra chat, ma Mario aveva poi chiesto un consiglio): messo in patch. Prima di codice su una regola nuova, controllare in «Aspetta Mario» se c'è una 🛑 sullo stesso numero.
- C106 (#35): niente `maximum-scale=1` fisso (toglierebbe lo zoom con due dita a tutti) e niente prova con WebKit vero (non installato nel contenitore).
- C109 (#36): segnalazioni a tutti i gestori → NO, solo a Mario (Monica non può cambiare le soglie). Raffica e quota con blocco → NO, sempre «modo ridotto» (PT E41).
- C112 (#36): niente correzione automatica dei «pronti» presi da un ordine di prova: come prima, Monica tocca «È una prova» o annulla e i pronti tornano (`rimettiPronti`).

## Prossimi passi
1. C115: vapore (`vapore.js`, stile scelto da Mario «A Pentola», `P.vapore`) anche per i clienti: oggi parte solo dopo lo sblocco di chi gestisce (cercare `Vapore.parti`). Proposta: all'apertura dell'app del cliente, una volta, breve; occhio a non coprire «Come ti chiami?» e il foglio «Installa l'app».
2. C116: contare le ricette col video (campo video nei dati del ricettario e sul server) e controllare 3-5 ricette senza video sulla pagina vera di GialloZafferano: se GZ il video ce l'ha, il lettore lo perde → correggerlo. Risposta a Mario con SÌ/NO e numeri (PT E34).
3. C117: cercare il lucchetto (`L.`, `Lucchetto`, PIN, impronta) nei percorsi del cliente; Mario dice che ai clienti non lo chiede già: togliere ogni resto (opzioni, fogli, testi) e lasciarlo solo a chi gestisce. Prova: da cliente nessun PIN/impronta.
4. C113: aspettare la prova di Mario con un iPhone NUOVO. Se ancora due richieste: Mario propone di togliere l'approvazione (🛑, chiedere prima). Idea dopo: iscrizione alle notifiche anche prima del sì (il server già accetta, il blocco è `P.cliente` in app.js ~510).
5. C111, C106, C108, C109, C110: aspettare le prove di Mario (foto). C104/C97: Francesco in Clienti. C112: foto di Mario.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md` (8 righe: 5 della principale, fra cui C113 iPhone e C111 iPad di questa sessione). Nessuna 🛑 nuova.

## Ultimo messaggio di Mario
09/11 ~22:47 (in questa chat), con 4 foto (Culurgiones e Astice alla Catalana, la foto ingrandita con 1-2-3 unite), parola per parola: «poi correggi il ricettario molte ricette sembrano ancora con il sistema vecchio le foto se clichi sono unite e non va bene

poi l'animazione del fumo ci deve essere anche nell'app dei clienti 
poi nel ricettario non tutte le ricette hanno il video è normale o dimenticanza o entrambe? poi
togliamo il PIN e impronta nei clienti tanto ho visto che non la chiede manteniamola spenta per accesso piú rapido» → C114 fatto (v0.9.93), C115-C117 nei Prossimi passi.
Prima, 09/11 ~22:31, con foto «Elena Fancello · Dice che ha cambiato telefono»: «ho fatto un test con un invito ad un iphone un  disastro allora le notifiche non puoi abilitarle perché vanno approvate da monica dopo  che abbiamo approvato gli ha fatto uscire e rientrare con un altra richiesta di approvazione che monica ha dovuto avvertare non ha cambiato telefono se non riesci a risolvere togliamo l'approvazione sembra quello il problema di tutto» → C113, v0.9.92.

## Numeri liberi
Prossimo E libero: PT E45; prossimo C libero: C118; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

