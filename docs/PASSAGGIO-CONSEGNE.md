# Passaggio di consegne

Sessione attuale: #42 (dopo la #41 `session_01WTjqUxmJ9kV3MucKuBbbJd`, chiusa alla soglia 10/11 ~11:05; la apre la #41 con `create_session` (catena 8 di 8: la #43 la apre Mario da `docs/PROSSIMA-SESSIONE.md`)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 ~11:05):** 1) Deepgram: ha messo il segreto (`DEEPGRAM_API_KEY`), era arrabbiato per «valido un anno» (era sbagliato: il listino dice che il credito NON scade, PT E48); 2) vedere con i suoi dati le 5 ricette del controllo (C123, v0.10.1).

## Stato (10/11 ~11:05 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta.
- Sito vero: v0.10.1 online (C123); verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.1.
- Giro «Pubblica sito» avviato a mano (workflow_dispatch, 10/11 ~11:00) DOPO che Mario ha messo il segreto `DEEPGRAM_API_KEY`: verifica nel log del giro la riga che stampa `DEEPGRAM_API_KEY` (passo dei segreti, `sito.yml` riga ~49) e la conclusione `success` (`mcp__github__actions_get` sul giro; NON `actions_list`).
- Prove (10/11, Principale 41): app `python3 -I tools/anteprima.py && node tools/prova.js` → 82 OK; `node tools/prova-database.mjs` → 86 OK; `node tools/prova-limiti.mjs` 22 OK; `node tools/prova-ascolta.mjs` 40 OK; `python3 -I tools/sito.py` OK (19 file + 17 immagini).
- Kit qui 35.0; il kit 37.2 (tutte e 5 le regole C20, C89, C103, C109, C122) è pronto nel repo del kit. Per portarlo qui serve `tools/scarica-kit.py` + la chiave `RVC_KIT_TOKEN` nell'ambiente (non c'è): domanda in «Aspetta Mario». Stato per voce in `docs/PER-IL-KIT.md`. Preferenze v37 attive (viste nella #41).

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#41)
- C123 v0.10.1 online: «🔍 Controlla tutte» rilegge SUBITO le segnate e dà a ognuna l'esito vero (sistemata · «uguale all'originale» · «pagina tolta»), niente giro infinito né «ci penso io» (PT E47). File: `worker.js` (`rileggiSegnate`, `leggiMancanti`, `controllaTutte`, `tieni(url, esito)`, `riprova`, `mancanti`, `controlla()` con `originali`/`nOriginali`), `gz.mjs` (`esaminaRicetta`: foto citata ma messa da GZ nel passo dopo = non manca), `ricettario.js` (`controlloRic`, avviso), `data.js` 0.10.1, prove in `tools/prova-database.mjs` e `tools/prova.js`. Controllo di 997 ricette vere di GZ: 18 «problemi», tutti uguali all'originale. Foto: `archivio/foto/2026-11-10-c123-controllo-uguali-originale.png`.
- Messaggio di Mario dalla chat #40: chiusi C119, C118, C111 (in `docs/DA-FARE-FATTE.md`); `CLAUDE.md` corto = NO, lascia così; C113 rispiegato con l'esempio di Elena; guida Deepgram data (in `docs/GUIDE-GIUSTE.md`), Mario l'ha fatta.
- Kit: Kit 1 e Risparmio 13 hanno risposto (37.0 poi 37.2). DA-FARE alleggerito (storia di C48, C70, C83, C93 in DA-FARE-FATTE): 37,6 KB.
- Controllo Da fare: 0 voci aggiunte (le richieste di Mario sono tutte in C108, C113, C123 e nelle righe di «Aspetta Mario»).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #41 (C123): far «sistemare» al motore le ricette segnate rileggendole → NO da solo: GZ le ridà uguali; serve l'esito salvato nella ricetta. Mostrare i nomi veri delle 5 → non si può senza l'accesso Google di Mario (rotta `/api/gz` solo per chi gestisce): serve la sua foto. Credito Deepgram «scade dopo un anno» (pagina vecchia del manuale) → SBAGLIATO: il listino dice che non scade (PT E48).
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
1. Deepgram (C108): controlla il giro «Pubblica sito» avviato ~11:00 (riga `DEEPGRAM_API_KEY` nel log, `success`). Poi chiedi a Mario la prova da cliente (riga in «Aspetta Mario»). Se il giro non ha la riga: il segreto non c'è → digli dove guardare (GitHub → Settings → Secrets and variables → Actions). Se il credito finisce, l'ascolto passa alle riserve (Groq): nessun cliente bloccato (`ascolta.mjs` riga ~121).
2. C123: aspetta la foto di Mario del riquadro; se una ricetta è «pagina tolta», proponi di toglierla dal ricettario.
3. Kit 37.2: aspetta la scelta di Mario sulla chiave (non rifare la domanda: è in «Aspetta Mario», hook «domanda ripetuta»). Con «1»: guida controllata per una chiave GitHub di sola lettura sul repo del kit, salvata con `request_credential` (host raw.githubusercontent.com) o nelle impostazioni dell'ambiente; mai in chat.
4. «Scrivimi!» sotto gli allergeni come tocco per WhatsApp: proposto dalla #40, Mario non ha risposto (non farlo senza sì).
5. Le altre righe di «Aspetta Mario»: aspettare le prove di Mario.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (kit 37.2 con la chiave: 1 sì · 2 più avanti).

## Ultimo messaggio di Mario
10/11 ~11:00 (in questa chat), parola per parola: «deepgram fatto come valido un anno che senso ha?!?» → segreto messo; risposta: il credito NON scade (listino ufficiale, PT E48), pubblicazione avviata.
Prima, nella chat CHIUSA della #40: «ia foto è un miracolo / adesso incollo / astice ok / c113 non ho capito bene / c111 è ok / deepgram a cosa serve e facciamolo ora / per le regole accorciate ho paura che perda di comprensione e luccidità».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C124; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

