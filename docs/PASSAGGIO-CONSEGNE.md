# Passaggio di consegne

Sessione attuale: #41 (dopo la #40 `session_01WTjqUumYwYKzwSjzjYGFEV`, chiusa alla soglia 10/11 08:35; la apre la #40 con `create_session` (catena 7 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 08:35):** 1) le 5 regole nate qui in tutti i progetti (Mario «si consiglio»): sessione del kit aperta, `session_01WTjqUtqQ6xthRd3TmBp2WC`; Mario incolla le Preferenze v37; 2) la sua prova di C119 «✨ Migliora con l'AI» (v0.10.0) sul telefono vero.

## Stato (10/11 08:35 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso, nessuna PR aperta.
- Sito vero: v0.10.0 online (C119 «✨ Migliora con l'AI»), giro «Pubblica sito» success su 0403cc42 (10/11 ~02:21); verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.0. Prova vera dal sito (Playwright, solo `/api/foto-gz` finto perché serve l'accesso Google): motore da jsdelivr + modello dal sito → foto 880×680 in 4,8 s.
- Prove (10/11, Principale 40): app `python3 -I tools/anteprima.py && node tools/prova.js` → 82 OK; `node tools/prova-database.mjs` → 77 OK; `node tools/prova-limiti.mjs` 22 OK; `node tools/prova-ascolta.mjs` 40 OK; `npm run prova-firebase` 103 OK (#39, non toccata).
- Sito: `python3 -I tools/sito.py` → «OK sito: 19 file dell'app + 17 immagini» (il modello `media/realesr-x4v3.onnx` compreso). Esito del giro: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` (NON `mcp__github__actions_list`).
- Kit RVC 35.0 · Preferenze v35 qui; Mario usa le v36 e ha in mano la v37 (`docs/PREFERENZE-PROPOSTA-v37.txt`, 2.482 caratteri). Sessione del kit `session_01WTjqUtqQ6xthRd3TmBp2WC` (repo RVC, titolo «📗 🧰 Kit 1 · 5 regole nuove», aperta 10/11 ~08:35 col prompt intero: 5 regole + v37 + file dell'hook dei numeri doppi): risponderà con `send_message`. Verifica: `get_session` con quell'id.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#40)
- v0.10.0 (C119) online: «✨ Migliora con l'AI» nello zoom delle foto a strisce. File: NUOVO `foto-ai.js` (Real-ESRGAN x4v3, onnxruntime-web 1.18.0 dalla stessa memoria di Paola `voci-modelli`, Web Worker da Blob, risultati in Cache `foto-ai` max 200, `localStorage pit-foto-ai` = da sola dopo il primo uso), `media/realesr-x4v3.onnx` (4.866.417 byte, SHA-256 1940a93e…), `ricettario.js` `'ric-zoom'` (tasto, `stato` per foto, solo la foto guardata), `worker.js` `fotoGz` + rotta POST `/api/foto-gz` (dopo `gestoreDa`), `style.css` `.ric-zoom-ai`, `sw.js` (GUSCIO + niente cache del `.onnx`), `tools/sito.py` (FILE_APP + `.onnx` in MEDIA), `tools/anteprima.py`, `index.html`, `aiutante.js` voce `ricettario-foto`, GUIDA del server, `data.js` 0.10.0. Prove nuove: `tools/prova-database.mjs` (4 C119), `tools/prova.js` passo «C119 migliora con l'AI…» (AI finta). Piano chiuso in `docs/piani-finiti/c119-ai-foto.md`. Foto prima/dopo: `archivio/foto/2026-11-10-c119-migliora-con-ai-prima-dopo.png` (mandata a Mario).
- C122: Preferenze v37 date a Mario in un riquadro; Mario «si consiglio» alle 5 regole per tutti → sessione del kit aperta (vedi Stato).
- Controllo Da fare: 0 voci aggiunte (C119 e la riga C122 di «Aspetta Mario» aggiornate).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #40 (C119): onnxruntime 1.31.1 del piano → NO, 1.18.0 come Paola (niente doppio scarico). `/api/foto-gz` in GET → NO: tutte le rotte sono POST (405), e solo chi gestisce (niente passaggio aperto). `window.Dati` → undefined (`const` di dati.js): si usa `typeof Dati`. Cache chiamata `pit-…` → NO, `sw.js` la cancellerebbe all'attivazione: si chiama `foto-ai`. Migliorare da sola ogni foto scorsa → NO, solo quella guardata (batteria e dati).
- #39: accesso Google con `signInWithRedirect` di riserva → NO (authDomain firebaseapp.com ≠ sito: con la memoria divisa di Chrome il ritorno si perde). AI foto: Swin2SR (~150 MB) e Real-ESRGAN x4plus (~67 MB) → troppo grandi; modello caricato da Hugging Face → NO (rifiuta *.workers.dev, PT E25); build WebGPU di onnxruntime (wasm 29 MB) → per ora no, solo wasm (14,8 MB).
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).
- C109 (#35): codice scritto PRIMA della scelta di Mario (la regola era arrivata da un'altra chat, ma Mario aveva poi chiesto un consiglio): messo in patch. Prima di codice su una regola nuova, controllare in «Aspetta Mario» se c'è una 🛑 sullo stesso numero.
- C106 (#35): niente `maximum-scale=1` fisso (toglierebbe lo zoom con due dita a tutti) e niente prova con WebKit vero (non installato nel contenitore).
- C109 (#36): segnalazioni a tutti i gestori → NO, solo a Mario (Monica non può cambiare le soglie). Raffica e quota con blocco → NO, sempre «modo ridotto» (PT E41).
- C112 (#36): niente correzione automatica dei «pronti» presi da un ordine di prova: come prima, Monica tocca «È una prova» o annulla e i pronti tornano (`rimettiPronti`).

## Prossimi passi
0a. (Principale 41, 10/11 ~09:25) Risposto al messaggio di Mario della chat #40: C119, Astice (C118) e C111 chiusi; regole corte = lascia così; C113 rispiegato; guida Deepgram data. Quando Mario dice che il segreto `DEEPGRAM_API_KEY` c'è: avvia «Pubblica sito» (workflow_dispatch) e prova l'ascolto (Voce: `tools/prova-ascolta.mjs`, poi frasi vere).
00. ✅ FATTO dalla Principale 41: v0.10.1 online (verificata), aspetta la foto di Mario. Era: **C123 per primo** (Mario 10/11 08:35, arrivato durante l'handoff): «5 da sistemare» nel database del ricettario che non si sistemano da sole. In `ricettario.js` ~357/364/883 il testo «le rileggo da sola… ci penso io»; in `worker.js` `controlla()`/`vecchie()` del Ricettario. Trova le 5 (id e motivo), prova se il giro le rilegge davvero, correggi la causa (PT E17: niente promesse finte nei testi); prove; a Mario la risposta SÌ/NO in cima (PT E34).
0. Kit: quando arriva il `send_message` della sessione del kit (`session_01WTjqUtqQ6xthRd3TmBp2WC`), scrivi in `docs/PER-IL-KIT.md` «portata in kit X.Y» per ogni voce e porta qui il kit nuovo come dice lei (da qui mai `add_repo`); poi togli da Da fare C89, C20, C103, C109, C122 se il kit le ha. Se tace: `get_session` con l'id, niente `list_events`.
1. C119: aspettare la prova di Mario sul telefono vero (riga in «Aspetta Mario»). Non provato su iPhone/iPad veri. Idea non fatta (da proporre solo se Mario la chiede): l'AI anche sulle foto piccole singole, non a strisce.
2. «Scrivimi!» sotto gli allergeni come tocco per WhatsApp: proposto, Mario non ha risposto (non farlo senza sì).
3. Righe in «Aspetta Mario»: aspettare le prove di Mario.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`. La 🛑 C119 ha avuto risposta (tolta).

## Ultimo messaggio di Mario
10/11 (nella chat CHIUSA della #40, dopo l'handoff), parola per parola: «ia foto è un miracolo / adesso incollo / astice ok / c113 non ho capito bene / c111 è ok / deepgram a cosa serve e facciamolo ora / per le regole accorciate ho paura che perda di comprensione e luccidità» → per la #41: C119 confermato (togli la riga di «Aspetta Mario», chiudi la promessa); Preferenze v37: le incolla; C118/C115 Astice ok (riga Principale 38); C113 da rispiegare con un esempio; C111 ok; C108 Deepgram: spiegare a cosa serve e guidarlo ADESSO; regole corte (Principale 34): Mario teme che si perda chiarezza → risposta = 2 «lascia così» (o spiegare che nulla si toglie, si sposta).
10/11 ~08:36 (in questa chat, durante l'handoff), parola per parola: «come ti ho già detto 5 da sistemare ma secondo me non le sistema da solo» + foto `archivio/foto/2026-11-10-0835-ricettario-5-da-sistemare.jpg` → C123, Prossimo passo 00.
Prima, 10/11 ~08:34: «si consiglio» (5 regole in tutti i progetti → sessione del kit aperta); 08:30: «dimmi le regole che vuoi mettere per tutti».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C124; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

