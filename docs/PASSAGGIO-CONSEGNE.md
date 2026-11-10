# Passaggio di consegne

Sessione attuale: #40 (dopo la #39 `session_01WTjqUwXqzf1yXN3r3aJ8nd`, chiusa alla soglia 10/11 01:59; la apre la #39 con `create_session` (catena 6 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 01:56):** 1) C119 «✨ Migliora con l'AI» nello zoom delle foto piccole (Mario: «sembra ok implementala»); 2) le 5 regole nate qui per tutto l'account (C122: testo delle Preferenze da incollare + sessione del kit).

## Stato (10/11 01:59 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso, nessuna PR aperta.
- Sito vero: v0.9.99 online, giro «Pubblica sito» success su c964d4ae (10/11 ~01:45); verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.9.99.
- Prove (10/11): app `python3 -I tools/anteprima.py && node tools/prova.js` → 81 OK; `npm run prova-firebase` → 103 OK (prima `npm ci`); `node tools/prova-database.mjs` → 73 OK (riparata: non trovava `ascolta.mjs`); `node tools/prova-limiti.mjs` 22 OK; `node tools/prova-ascolta.mjs` 40 OK.
- Sito: `python3 -I tools/sito.py` → «OK sito: 18 file». Esito del giro: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` (NON `mcp__github__actions_list`).
- Kit RVC 35.0 · Preferenze v35 qui, ma Mario usa già le Preferenze v36 (09/11): scritto in `docs/PER-IL-KIT.md`.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#39)
- v0.9.98 (C120): `msgAccesso(e, chiusa)` in app.js (dopo `mostraToast`) per «Area riservata», «Entra con Google» (invito) e lucchetto: rete, finestra bloccata/chiusa, codice dell'errore; senza rete niente finestra. Il cookie `pit_acc` (C113) NON può battere un accesso Google: Firebase 13.2.0 sceglie la prima memoria con un utente (IndexedDB prima) — letto nel codice dell'SDK e provato (prova Firebase nuova). Difetto Firebase «Database is closing/hidden» (agosto 2026) non presente nella 13.2.0. Mario 01:35: «adesso funziona, potrebbe essere la rete».
- v0.9.99 (C119): colonna `strisce` nell'archivio (worker.js, `STRISCIA` = stessa regola di `fotoRicetta`), riempita una volta (`strisceOk`) e a ogni `salva`; `proposte` ordina `strisce ASC, video DESC…`. Provata solo in locale, non sui dati veri.
- C119 AI: Real-ESRGAN provato nel browser sull'Astice; piano completo e fatti in `docs/lavori-in-corso/c119-ai-foto.md`.
- C122: regola «impara dagli errori» in testa a `docs/ERRORI.md`; testo per il kit in `docs/PER-IL-KIT.md` (con C20, C89, C103, C109). Lezione PT E46.
- Controllo Da fare: 0 voci aggiunte (C119 e C122 aggiornate col messaggio delle 01:56).

## Strade provate e scartate (perché; così la prossima non le rifà)
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
0. C119 «✨ Migliora con l'AI»: seguire `docs/lavori-in-corso/c119-ai-foto.md` (endpoint `/api/foto-gz`, worker con onnxruntime-web, modello servito dal sito, tasto nello zoom, voce dell'aiutante, prove, prova VERA dal sito pubblicato e foto prima/dopo a Mario).
1. C122: testo NUOVO delle Preferenze (parti dalla v36 che Mario ha in claude.ai: chiedi a Mario di incollarla se non c'è nel repo) con le 5 regole di `docs/PER-IL-KIT.md`, sotto i 2.500 caratteri, in UN riquadro; e dire a Mario che il kit lo cambia solo una sessione del progetto del kit (da qui mai `add_repo`): proporre a Mario di aprirla lui o con `create_session` sul repo del kit, col suo ok.
2. «Scrivimi!» sotto gli allergeni come tocco per WhatsApp: proposto, Mario non ha risposto (non farlo senza sì).
3. Righe in «Aspetta Mario»: aspettare le prove di Mario.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`. La 🛑 C119 ha avuto risposta (tolta).

## Ultimo messaggio di Mario
10/11 01:56 (in questa chat), parola per parola: «ia delle foto sembra ok implemetala nell'app e dimmi se 5 regole non aggiungi all account» → Prossimi passi 0 e 1 (la #39 gli ha risposto in breve: le 5 regole qui valgono già; per l'account servono Preferenze e kit).
Prima, 10/11 01:35 (nella #38): «adesso funziona, potrebbe essere la rete… Impara sempre dagli errori, come regola, con logica, intelligenza e con ragionamento» → C120 fatto (v0.9.98), C122.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C123; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

