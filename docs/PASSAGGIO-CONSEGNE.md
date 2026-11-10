# Passaggio di consegne

Sessione attuale: #43 (dopo la #42 `session_01WTjqUuQygq4fvuUYytiCQV`, chiusa alla soglia 10/11 11:33; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 11:33):** 1) il ricettario proteico per la palestra e le migliorie del ricettario (C124, piano pronto); 2) la chiave GitHub del kit (ha detto sì, guida data); 3) Deepgram provato da lui su Android dopo la v0.10.2.

## Stato (10/11 11:35 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta.
- v0.10.2 ONLINE (controllato 10/11 ~11:37). Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.2 e `curl -s …/voce-clienti.js | grep -c comeCliente` → 1.
- Deepgram nel server: giro 42795541779 (10/11 11:01) «Successfully created secret for key: DEEPGRAM_API_KEY».
- Prove (10/11, Principale 42, sulla v0.10.2): app `python3 -I tools/anteprima.py && node tools/prova.js` → 83 OK, 0 NO; `node tools/prova-database.mjs` → 86 OK.
- Kit qui 35.0; il 37.2 aspetta la chiave di Mario (riga in «Aspetta Mario»). `tools/scarica-kit.py` NON esiste in questo repo: si scrive dopo, quando la chiave funziona (prima leggere dal repo del kit il percorso del pacchetto).

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- **Piano C124**: `docs/lavori-in-corso/c124-ricettario-proteico.md` (fonti verificate, formato dei valori di GZ, soglie con le fonti, 8 passi).

## Sessione appena chiusa (#42)
- Deepgram: chiave confermata nel server (registro del giro 11:01). Buco trovato: guardando come cliente, Mario era trattato da gestore e Deepgram non partiva. v0.10.2: `voce-clienti.js` manda `comeCliente` (da `UI.devCliente`) e salva `UI.ultimoAscolto = nomiMotori(r.motore)`; `worker.js` `/api/ascolta` usa la strada dei clienti se chi gestisce manda `comeCliente: true`; `app.js` `barraDev` mostra «🎧 Groq + Deepgram · corretto»; `style.css` `.prova.dev` (a capo) e `.dev-asc`; `data.js` 0.10.2; `tools/prova.js` passo nuovo in fondo «voce dei clienti C108» (autonomo). Tocca la zona di 🟨 Voce 11 (ferma dal 09/11 22:31 ad aspettare la chiave): riga in `docs/CHI-FA-COSA.md`.
- Risposte di Mario 11:25: chiusi C123 (foto `archivio/foto/2026-11-10-c123-mario-1295-a-posto-1-uguale.jpg`: 1295 a posto, 1 uguale all'originale), C106 (iPad orizzontale ok), C97 (Francesco compare) → `docs/DA-FARE-FATTE.md`. C115 vapore, C113 iPhone, C110 iPad: «per ora ok». Kit: «ok github chiave».
- Mario 11:32 (scritto nella chat chiusa della #41, girato dalla #41): oggi ha solo Android; iPad e iPhone si provano quando ne ha uno (non richiederli prima). Foto Android dell'aiutante: `archivio/foto/2026-11-10-1131-android-aiutante-lasagne.jpg` («Quale intendi? Lasagne semplici, al ragù o particolari?»).
- C124 richiesta nuova (ricettario proteico): ricerca fatta e piano scritto; domande 🛑 fonte e soglie mandate a Mario; nessun codice ancora.
- Controllo Da fare: 1 voce aggiunta (C124); le altre richieste sono nelle righe di «Aspetta Mario».

## Strade provate e scartate (perché; così la prossima non le rifà)
- #42 (C124): GymBeam come fonte → NO (ricette con le proteine in polvere del negozio). Proteine dal JSON-LD di GZ → NON ci sono: vanno lette dall'HTML (`gz-list-macros`). Chiave del kit su `api.github.com` → NO: lì il proxy usa già l'accesso GitHub della sessione (gh, ricerca); usare `raw.githubusercontent.com` con prefisso «token».
- #42 (C108): prova di Mario «guarda come cliente» → senza la v0.10.2 NON passava da Deepgram (il token è quello del gestore): mai chiedere quella prova su una versione più vecchia.
- #42 (prove): con `SOLO='voce dei clienti'` i passi che dipendono da quelli prima falliscono da soli (stato mancante): il passo nuovo è autonomo; per gli altri vale il giro completo.
- #41 (C123): far «sistemare» al motore le ricette segnate rileggendole → NO da solo: GZ le ridà uguali; serve l'esito salvato nella ricetta. Credito Deepgram «scade dopo un anno» → SBAGLIATO: non scade (PT E48).
- #40 (C119): onnxruntime 1.31.1 → NO, 1.18.0 come Paola. `/api/foto-gz` in GET → NO: rotte POST, solo chi gestisce. `window.Dati` → undefined: `typeof Dati`. Cache `pit-…` → NO, si chiama `foto-ai`.
- #39: `signInWithRedirect` di riserva → NO. AI foto: Swin2SR e Real-ESRGAN x4plus troppo grandi; modelli da Hugging Face → NO (PT E25).
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- C109 (#35): codice scritto PRIMA della scelta di Mario: messo in patch. Prima di codice su una regola nuova, controllare in «Aspetta Mario» se c'è una 🛑 sullo stesso numero.
- C106 (#35): niente `maximum-scale=1` fisso (toglierebbe lo zoom con due dita a tutti).
- C109 (#36): segnalazioni a tutti i gestori → NO, solo a Mario. Raffica e quota con blocco → NO, sempre «modo ridotto» (PT E41).
- C112 (#36): niente correzione automatica dei «pronti» presi da un ordine di prova: Monica tocca «È una prova» o annulla e i pronti tornano (`rimettiPronti`).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).

## Prossimi passi
1. A Mario (v0.10.2 è online) i passi Deepgram su Android: chiudi e riapri l'app, «guarda come cliente», Aiutante → microfono → «due teglie di lasagne per sabato»; in cima, nella barra sviluppatore, deve comparire «🎧 Groq + Deepgram». Una foto. (Riga C108 in «Aspetta Mario».)
2. C124 ricettario: segui `docs/lavori-in-corso/c124-ricettario-proteico.md` dal passo 1 (valori di GZ in `gz.mjs`), solo GialloZafferano finché Mario non sceglie la fonte. Soglie: quelle del piano se Mario non dice altro. Passi 4-7 (difficoltà, Database diretto, riquadro in Home, fonte) sono piccoli: falli insieme in una versione con la foto della Home.
3. Kit 37.2: quando Mario scrive «chiave pronta», `request_credential` con host `raw.githubusercontent.com`, prefisso `token`, nome «Kit RVC lettura»; poi prova a leggere `docs/kit-progetto/VERSIONE` del repo `RVC-Operation-by-YNOY-CORP/RVC` (ramo `claude/rvc-ramo-definitivo`).
4. «Scrivimi!» sotto gli allergeni: proposto dalla #40, nessuna risposta (non farlo senza sì).
5. Le altre righe di «Aspetta Mario»: aspettare Mario; iPad e iPhone solo quando ne ha uno.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (C124 fonte 🛑; chiave del kit da creare).

## Ultimo messaggio di Mario
10/11 11:32 (scritto nella chat chiusa della #41, girato qui), parola per parola: «non ho ipad e iphone che è quello messo male ho solo android ora è questa è la foto sembra ok ma lo era quasi da sempre ok android».
Prima, 11:25 in questa chat: «controlla tutte / ok github chiave / devo verificare vapore ma per ora ok / devo verificare dopoia richiesta ma per ora ok / proverò ipad ma per ora ok / ok poi dimmi i passi / ipad ok orizzontale / Francesco compare tra i nomi» (con la foto del controllo).
11:20 in questa chat: «Aggiungi al ricettario una voce proteica e cerchi in automatico le ricette per fitness sala pesi con poche calorie e grassi cattivi e con attenzione a sale zucchero ecc ecc insomma ricette gym per aiutare ad asciugarsi ma per migliorare l'ipertrofia / Metti anche filtro per difficoltà e il tasto database quando lo clicco con fare scorrere l'app velocemente giú ma deve andare direttamente, ricettario mettilo un pò piú in vista sembra trascurato sotto poi le ricette di giallo zafferano le segni che sono di giallo e se ne trovi altre ricette esempio per fitness in altre fonti migliori mettile caricate al meglio tutti i passaggi info foto fatte bene ecc ecc e segnami la fonte dove l'hai presa. / migliora ricettario in generale».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C125; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

