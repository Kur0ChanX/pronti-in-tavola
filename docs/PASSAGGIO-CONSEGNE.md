# Passaggio di consegne

Sessione attuale: #39 (dopo la #38 `session_01WTjqUx6Bw42npV5PZSzDj2`, chiusa alla soglia 10/11 01:20; la apre la #38 con `create_session` (catena 5 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 ~01:15):** 1) 🔴 C120: sul suo Android l'app è in modo cliente e «Entra con Google» dice «Accesso non riuscito. Riprova.» (Mario: «perché rompi sempre il codice quando funziona?»); 2) C119 foto piccole delle ricette vecchie: scelta 2 = zoom piccolo (fatto v0.9.97) + motore che mette prima le foto grandi + «✨ Migliora con l'AI».

## Stato (10/11 01:20 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Sito vero: v0.9.90 online (C112), giro «Pubblica sito» success sul commit e356f431 (09/11 ~21:10); `grep -m1 VERSIONE_APP data.js` → 0.9.90. App: 78 OK, 0 NO sul codice unito con Voce 10.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 77 OK, 0 NO (09/11 ~20:40, v0.9.87). `SOLO=carrello` NON va da solo (il carrello dipende dai passi prima): giro completo, ~3 minuti.
- Server: `node tools/prova-limiti.mjs` → 22 OK (limiti C109 + catena Groq C108, memoria finta); `node tools/prova-ascolta.mjs` → 27 OK (di Voce).
- Motore e regole: `npm run prova-firebase` → 98 OK; `npm run prova-regole` → 66 OK (09/11 ~18:00, non toccati qui). Regole Firebase NON cambiate in questa sessione (il campo `prova` negli ordini dei clienti accettati è già permesso).
- Sito: `python3 -I tools/sito.py` → «OK sito: 18 file». Sito vero https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica a ogni push di file dell'app; esito: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` (NON `mcp__github__actions_list`: ignora per_page e manda 30 giri, ~25k token).
- Kit RVC 35.0. Soglia 320k: vale se l'id della sessione è nella riga «Principale» di `docs/CHI-FA-COSA.md`.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#38)
- v0.9.94: C115 vapore anche per i clienti (`apertura()` → `Vapore.parti(…, null, true)` se `!statoLucchetto()`; `vapore.js` param `dolce`); C116 copia col video perso si rilegge (`vRicetta`); C117 già così (lucchetto solo `P.ruolo === 'monica'`), prova Firebase nuova.
- v0.9.95: C118 `fotoRicetta(r)` + `riquadri(p, dopo)` in ricettario.js: strisce «…seq3.jpg» con un numerino continuano dal passo prima. Controllo 92 ricette: 684 foto delle strisce numerate, 0 senza numero.
- v0.9.96: frase sotto gli allergeni di Mario (app.js ~918). v0.9.97: `.ric-zoom-taglio` max 340 px (C119).
- C116 numeri: 92 ricette, 75 col video (tutti trovati), 17 «solo foto» su GZ (`gz-type-photo`). C119: 34/92 solo strisce 660×170 (ogni foto 220×170), 57 da 600×450; versioni grandi su GZ: 403.
- Prove: app 81 OK, Firebase 100 OK (prima serve `npm ci`). Script di controllo nello scratchpad (non nel repo): se servono, rifarli da `tools/controlla-ricette.mjs`.
- Lezione PT E45 (foto ingrandite senza guardare i pixel). Controllo Da fare: 2 voci aggiunte (C120, C121).

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
0. 🔴 C120 URGENTE (foto `archivio/foto/2026-11-10-0112-android-*.jpg`): Android di Mario, app in modo cliente («Benvenuti da Monica!», carrello 2), 7 tocchi → «prima entra da Area riservata col tuo Google», poi «Accesso non riuscito. Riprova.». Nella barra del telefono il segnale ha una ✕ (forse senza rete: IPOTESI, PT E10). Da capire leggendo: `Dati.entraGoogle` (dati.js ~650, `signInWithPopup`) e i 3 punti con quel testo (app.js 2136, 2162, 2925) che NON mostrano `e.code`; `riprendiAccesso` (dati.js ~268, C113 v0.9.92) mette l'accesso anonimo del cookie `pit_acc` in localStorage se lì non c'è nulla: controllare che non possa mai sostituire un accesso Google che sta in IndexedDB (l'SDK sceglie la prima persistenza con un utente: IndexedDB prima). Subito: messaggio d'errore col motivo vero (senza rete → «Manca la rete»; `auth/popup-blocked`, `auth/network-request-failed`…) e una prova Firebase «Google già entrato + cookie pit_acc vecchio → resta Google». Chiedere a Mario: era in rete? prima su questo telefono era entrato col Google?
1. C119: motore e elenco «nuove» prima le ricette con foto 600×450 (worker.js `proposte`, oggi `ORDER BY video DESC`); poi «✨ Migliora con l'AI» nello zoom delle strisce: ricerca aggiornata (skill `ricerca-aggiornata`) di un ingranditore gratis nel browser (es. UpscalerJS/ESRGAN leggero: peso, tempo su telefono), prova sull'Astice e foto prima/dopo a Mario PRIMA di metterlo a tutti.
2. «Scrivimi!» sotto gli allergeni come tocco che apre WhatsApp con Monica: proposto, Mario non ha risposto (non farlo senza sì).
3. C113, C118/C115, C111, C106, C108, C110: aspettare le prove di Mario (righe in «Aspetta Mario»).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`. La 🛑 C119 ha avuto risposta (tolta). C120: da chiedere a Mario se era in rete.

## Ultimo messaggio di Mario
10/11 ~01:15 (in questa chat), con 2 foto (Android, modo cliente: «Modalità sviluppatore: prima entra da «Area riservata»…» e «Accesso non riuscito. Riprova.»), parola per parola: «perché rompi sempre il codice  quando funziona?» → C120, Prossimi passi 0 (non ancora risposto nel merito: la #39 risponde).
Prima, 10/11 01:10: «b + migliora con ia» (= scelta 2 di C119). 09/11 23:58: «quelle che separi sono sgranatissime controllale tutte se sono in hd di tutte le rivette e evita questo problema in futuro e risolvi tutte le foto in bassa qualità e riscaricale in tutte le ricette». 09/11 23:51: testo allergeni → v0.9.96.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C120; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

