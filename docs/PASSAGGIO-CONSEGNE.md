# Passaggio di consegne

Sessione attuale: #37 (dopo la #36 `session_01WTjqUtPqTTxpnkk1cGLaiK`, chiusa alla soglia 09/11 20:57; la apre la #36 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (09/11 ~20:55):** 1) C112: la scelta «Ordino davvero / Sto solo provando» deve uscire a TUTTI i clienti a ogni ordine, mai già segnata (un amico che provava ha mandato un ordine vero): codice fatto in v0.9.90, va PROVATO e PUBBLICATO (vedi Prossimi passi 1); 2) C111 🔴: sull'iPad di Mario la schermata dev non si apre (messaggio arrivato in Voce 9, passato a noi); 3) le prove di Mario su C106, C109, C108.

## Stato (09/11 20:58 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Sito vero: v0.9.90 online (C112), giro «Pubblica sito» success sul commit e356f431 (09/11 ~21:10); `grep -m1 VERSIONE_APP data.js` → 0.9.90. App: 78 OK, 0 NO sul codice unito con Voce 10.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 77 OK, 0 NO (09/11 ~20:40, v0.9.87). `SOLO=carrello` NON va da solo (il carrello dipende dai passi prima): giro completo, ~3 minuti.
- Server: `node tools/prova-limiti.mjs` → 22 OK (limiti C109 + catena Groq C108, memoria finta); `node tools/prova-ascolta.mjs` → 27 OK (di Voce).
- Motore e regole: `npm run prova-firebase` → 98 OK; `npm run prova-regole` → 66 OK (09/11 ~18:00, non toccati qui). Regole Firebase NON cambiate in questa sessione (il campo `prova` negli ordini dei clienti accettati è già permesso).
- Sito: `python3 -I tools/sito.py` → «OK sito: 18 file». Sito vero https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica a ogni push di file dell'app; esito: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` (NON `mcp__github__actions_list`: ignora per_page e manda 30 giri, ~25k token).
- Kit RVC 35.0. Soglia 320k: vale se l'id della sessione è nella riga «Principale» di `docs/CHI-FA-COSA.md`.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#36)
- v0.9.87 online (C109 + C108 parte nostra). worker.js: `contaAIC(cliente, lim)` senza blocchi (segnalazione a 30 e 60, 'ridotto' oltre 100 o 10 in un minuto, quota `TETTO_AIC` 200 con avviso all'80%), una segnalazione per soglia (`c.visti`); `segnala()` manda la notifica 'esagera' SOLO agli iscritti con `dev:true` (il telefono di Mario lo manda a `/api/iscrivi`, app.js `iscriviTelefono`); `campiApp`/`accesoAIC`/`limitiAIC` leggono le soglie da impostazioni/app (`aicAvviso` 10-200 base 30, `aicRidotto` 20-1000 base 100); `RISPOSTA_RIDOTTA` al posto di «riprova domani»; `PONTE_CLIENTI` Groq qwen3.8-27b → gpt-oss-120b → gpt-oss-20b, poi Cloudflare, poi 'ridotto' (Monica resta Cloudflare per prima). opzioni.js: gruppo 'mario' (non in GRUPPI_OPZ, filtrato dall'aiutante di Monica). sw.js: testo di 'esagera' secondo `cosa`. app.js: `segnalazioniHtml`, le due soglie in `schedaMario`. Patch spostata in `docs/piani-finiti/`. Voce 9 avvisata (usa `segnala('ascolto', …)`).
- C112 (Mario 09/11 ~20:45): `puoProvare()` ora segue l'opzione `chiediProva` (opzioni.js, gruppo clienti: 'tutti' di base, 'nuovi', 'mai'); prima valeva solo per chi non era accettato e, con l'accettazione prima del primo ordine (C93-C97), non usciva più. Prova nuova nel passo «carrello: giorno, bonifico, invio». Versione 0.9.90 (Voce 9 e Voce 10 avevano già preso la 0.9.88 e la 0.9.89). Lezione PT E43.
- Controllo Da fare: 1 voce aggiunta (C112); C111 l'ha scritta Voce 9.

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
0. C113 (Principale 37, v0.9.92): accesso anonimo del cliente anche nel cookie `pit_acc` (`ricordaAccesso`, `riprendiAccesso` in dati.js prima di `getAuth`; tolto in `esci` e per Google): iPhone copia nell'app sulla Home solo i cookie (WebKit 17.2), l'SDK riprende l'accesso da localStorage. Prova Firebase «C113» (99 OK). Aspetta la prova di Mario con un iPhone NUOVO. Se ancora no: Mario propone di togliere l'approvazione (🛑, chiedere). Idea dopo: iscrizione alle notifiche anche prima del sì.
1. C112: online (v0.9.90). Mario ha già le istruzioni per l'ordine di Antonio Sanna («È una prova»). Aspetta la sua foto (voce C112 👁).
2. C111 (Principale 37, v0.9.91): firma con `touch-action: manipulation` + `cursor: pointer` (iPad: i tocchi veloci erano zoom col doppio tocco; ipotesi, non provata su iPad vero), `accendiDev()` e pulsante «🛠 Accendi la modalità sviluppatore su questo dispositivo» in `schedaMario`, 7 tocchi che rispondono sempre (cliente → «entra da Area riservata»; già sviluppatore → apre/chiude la barra). Tutti i comandi (`button, summary, label, [data-a]`) senza zoom col doppio tocco. Aspetta la foto di Mario dall'iPad; se ancora no: chiedergli come entra (cliente o Google suo).
3. Per Voce 10: fatto in v0.9.91 (`ascoltoQuota` in `segnalazioniHtml` e `sw.js`, opzione `ascoltoAvviso` nel gruppo 'mario').
4. C106, C108, C109, C107: aspettare le prove di Mario (foto). C104/C97: Francesco in Clienti.
5. Regola C109 nel kit: testo pronto in `docs/PER-IL-KIT.md` (tre livelli), la porta una sessione del kit.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md` (6 righe: 3 della principale). Nessuna 🛑 nuova: «segnalazioni solo a te» deciso col consiglio e detto a Mario.

## Ultimo messaggio di Mario
09/11 ~20:45 (in questa chat), parola per parola: «Per chi ordina è sparito il comando, prima di ordinare voglio solo provare l'app, oppure adesso non mi ricordo, ordina sul serio, che uno deve cliccare per forza uno dei due, che non è già preselezionato prima di ordinare. Perché mi è appena, per far provare l'app mi è appena arrivato un ordine, ma mi ha detto che la voleva solo provare. Quindi si è creato un po' di caos.» → C112, v0.9.90 online, risposta data.
Poi, 09/11 ~21:00, parola per parola: «Fai un controllo perché io ho accettato subito Antonio Sanna e dopo lui ha ordinato e non gli è uscita la scelta stò provando o invio vero» · «accettato dopo 5 secondi» → conferma la causa di C112 (accettato prima di ordinare = niente scelta); risposto: v0.9.90 la corregge, l'ordine di Antonio si segna «È una prova».
Dopo l'handoff, nella #36 (09/11 ~21:20), parola per parola: «Quindi mi confermi che adesso esce a tutti quanti prima di ordinare? Devono cliccare per forza se è una prova o se vogliono ordinare seriamente, e poi per qualsiasi motivo magari hanno cliccato per sbaglio la scelta sbagliata, io posso cliccare che è stata una prova o viceversa.» → risposto dalla #36: sì (v0.9.90, provato solo con le prove automatiche); nell'ordine «È una prova» e, sugli ordini di prova, «Non è una prova: rimettilo tra i veri».
Nella chat Voce 9, 20:58: «Poi nel mio ipad non posso neanche aprire la schermata dev» → C111.

## Numeri liberi
Prossimo E libero: PT E45; prossimo C libero: C114; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

