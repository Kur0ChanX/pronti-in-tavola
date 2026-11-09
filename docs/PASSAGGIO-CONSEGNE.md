# Passaggio di consegne

Sessione attuale: #36 (dopo la #35 `session_01WTjqUxhhMWGG64KBFbuwNR`, chiusa alla soglia 09/11 20:15; la apre la #35 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (09/11 ~20:20):** 1) C109 🔴: Mario ha detto «limiti per persona da consiglio» (nella chat Voce 8, 09/11 ~21:20 ora della Voce) = sì alla proposta `docs/lavori-in-corso/limiti-per-persona.md`: applicare la patch `docs/lavori-in-corso/c109-codice-pronto.patch` (soglia da 20 a 30, poi «modo ridotto» a 100 al giorno o 10 al minuto) e avvisare Voce 8 con `send_message` quando è nel ramo (lei tocca dopo `contaAscolto` e `/api/ascolta`); 2) C108 = 1 «salvadanai separati»: l'aiutante dei CLIENTI (`chiediAI` con cliente, `/api/aiuto-cliente`, zona nostra) passa a Groq qwen3.8-27b → gpt-oss-120b → gpt-oss-20b, Cloudflare per ultimo (`docs/lavori-in-corso/standard-ascolto.md`); 3) C106: prova di Mario sull'iPad.

## Stato (09/11 20:15 ora italiana)
- Ramo comune ≠ origin: PUSH DA FARE (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 72 OK, 0 NO (09/11 ~18:15, codice unito con la v0.9.80 della Voce). `SOLO=ricettario` NON funziona da solo (serve il giro completo, ~3 minuti). Dal contenitore il sito vero, GialloZafferano e Microsoft sono bloccati (curl 000): esito dei giri con `mcp__github__actions_list` (sito.yml, perPage 1).
- Motore e regole: `npm install`, `npm run prova-firebase` → 98 OK, 0 NO; `npm run prova-regole` → 66 OK, 0 NO (09/11 ~18:00). Regole cambiate in v0.9.79 (`accettaNuovi()` solo per stato 'nuovo') e pubblicate da Mario 09/11 ~17:20.
- Sito: `python3 -I tools/sito.py` → «OK sito».
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima artefatto: NON si pubblica più (Mario 08/11 «non lo uso più»); `dist/anteprima.html` serve solo alle prove.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#35)
- v0.9.83 online (C106): `ZoomIOS` in app.js (al rientro, al giro e al cambio di larghezza: per 400 ms `maximum-scale=1`, poi la regola normale; solo iPhone/iPad; `pageshow` solo se `persisted`), `text-size-adjust: 100%` su html; causa: WebKit 262207 (app installate, ancora aperto 2026); nessun pezzo esce dai bordi (1180/1194/1366 px). Prova `C106 iPad` in tools/prova.js. Poi le versioni 0.9.82, 0.9.84-0.9.86 sono della catena Voce (contengono la C106).
- C109: codice del livello «Avviso» scritto e provato (prova C109 verde, prova del server con memoria finta: 45 domande, nessun blocco, segnalazioni a 21 e 41), poi NON pubblicato perché Mario aveva chiesto un consiglio prima: tutto in `docs/lavori-in-corso/c109-codice-pronto.patch` (`git apply --check` OK sul ramo di allora). Contiene: worker.js `TIPI_SERVER` ['esagera'], `SOGLIA_AIC_CLIENTE`, `contaAIC` senza 'tuo', `segnala(cosa, cliente, n, soglia)` (registro 'segnalazioni' ultime 30 + `manda(null,'esagera')`), `contoAI` con `segnalazioni`; sw.js testo «esagera»; app.js `NOMI_AVVISO.esagera`, `vaiDaNotifica` 'esagera' → Impostazioni, `segnalazioniHtml()` in «Solo per te, Mario»; aiutante.js `DOVE_AI['imp-notifiche']` parole «segnalazion…»; regola per il kit in `docs/PER-IL-KIT.md`. La versione nella patch NON c'è: usare la prossima libera (dopo 0.9.86).
- `CLAUDE.md` più corto: misurato, risparmio ~0,2%: consiglio cambiato in «2 lascia così» (riga in Aspetta Mario).
- Controllo Da fare: 0 voci aggiunte (l'unico messaggio di Mario qui ha già la sua riga).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).
- C109 (#35): codice scritto PRIMA della scelta di Mario (la regola era arrivata da un'altra chat, ma Mario aveva poi chiesto un consiglio): messo in patch. Prima di codice su una regola nuova, controllare in «Aspetta Mario» se c'è una 🛑 sullo stesso numero.
- C106 (#35): niente `maximum-scale=1` fisso (toglierebbe lo zoom con due dita a tutti) e niente prova con WebKit vero (non installato nel contenitore).

## Prossimi passi
1. Avvio: titolo verde ❔. Leggi `docs/lavori-in-corso/limiti-per-persona.md` e `standard-ascolto.md` (a pezzi, grep).
2. C109: `git apply docs/lavori-in-corso/c109-codice-pronto.patch` (togli le righe che iniziano con «# » o usa `grep -v '^# '`); soglia 30; aggiungi il «modo ridotto» per l'aiutante dei clienti (100 al giorno o 10 in un minuto → `fermo:'ridotto'` e il telefono risponde con `capisciCliente` di voce-clienti.js: zona Voce, accordarsi); versione nuova in data.js; prove (`SOLO=C109`, poi giro completo); push; `send_message` a Voce 8 «patch C109 nel ramo». Chiedere a Mario solo «segnalazione solo a te o anche a Monica» (riga da scrivere in Aspetta Mario, consiglio: solo a lui).
3. C108 parte nostra: aiutante dei clienti su Groq (modelli e limiti in `standard-ascolto.md`, 09/11/2026: verificarli con la skill `ricerca-aggiornata`), Cloudflare per ultimo; Monica resta su Cloudflare.
4. C106 e C107: aspettare le prove di Mario (foto). C104/C97: Francesco in Clienti.
5. Regola C109 nel kit: testo già in `docs/PER-IL-KIT.md` (sezione C109, aggiornare coi tre livelli della proposta).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md` (le 🛑 C108 e C109 tolte: Mario ha risposto «da consiglio» nella chat Voce 8).

## Ultimo messaggio di Mario
09/11 19:38 (in questa chat), parola per parola: «principale 34 accorciare claude md Ne vale veramente la pena? Risparmiamo veramente tanti token e tanto tempo? E non c'è nessun problema assolutamente sulla lucidità? Al 100% non c'è problema?» → risposta: no, ~0,2%, piccolo rischio sulle prove; consiglio 2 «lascia così», aspetta il numero.
Nella chat Voce 8, ~21:20 (ora scritta dalla Voce), riportato da Voce 8: «limiti per persona da consiglio e ascomta sempre la stessa qualità come consiglio» (= C109 1, C108 1).
Prima, 09/11 ~18:27: «aspetta prima di pubblicare aggiungi la risoluzione del problema nell'altra sessione» (→ C106 nella v0.9.83).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C110; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

