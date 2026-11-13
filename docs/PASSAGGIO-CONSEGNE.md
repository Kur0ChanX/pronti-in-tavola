# Passaggio di consegne

Sessione attuale: #78 (dopo la #77 `session_01WTjqUwuvHsJV45jPRb8icT`, chiusa alla soglia 13/11 18:41; la apre la #77 con `create_session` (catena 8 di 8)).

**#78 aperta dalla #77 (13/11 ~18:45, ferma ad aspettare Mario oltre 180k, C455).** C155 «Scrivimi» capisce gli ordini: PATCH pronta `docs/lavori-in-corso/c155-scrivimi.patch` (v0.10.29), giro 98/98 verde, foto `archivio/foto/2026-11-13-c155-scrivimi-{1..4}.png` MANDATE: aspettano l'ok di Mario. Trascrizione video: limite giornaliero gratis (~25 al giorno), riparte da sola ogni mattina 9:10.

- **Modo di lavorare (Mario 13/11 ~19:00, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11 sera, #77):** C155. Una cliente ha scritto l'ordine nel messaggio WhatsApp di «Scrivimi» e nell'app non c'era niente. Mario: «voglio automatismo» (NIENTE lavoro per Monica: scartato «Ordine da messaggio» da incollare) e «Voglio tutto tracciato nell app … spingi i clienti a ordinare nell app». Mario si è lamentato dei turni lunghi: «scrivo e non mi rispondi e correggi i problemi senza leggere dopo» → turni CORTI, prima rispondere.

## Stato (13/11 18:41 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUwuvHs/claude/pronti-ramo-definitivo.
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **C155 in patch** `docs/lavori-in-corso/c155-scrivimi.patch` (app.js `ordineDaMessaggio`/`foglioScrivimi`/azioni `scrivimi*`, style.css `.wa-monica` bottone, voce-clienti.js gusto, data.js v0.10.29, tools/prova.js passo C155). Verifica: `git apply --check`; giro 98/98 verde con la patch (13/11 18:40).
## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#77)
- Avvio; sveglia trascrizione rifatta mia (`trig_01E2n2khL5VsdZX4q5C51iN3`, 14/11 9:10: la nuova la rifà sua e cancella questa).
- C154: trascrizione ferma al limite GIORNALIERO (PT E80; la stima «17,4 ore» era ~4 settimane); domanda gratis/pagamento in Aspetta Mario.
- C155: causa (PT E81), patch «Scrivimi» capisce gli ordini (+ gusto «ricotta e spinaci» → Spinaci in voce-clienti.js, WhatsApp non più aperto due volte), prova nuova, giro 98/98, foto mandate. Ordine di Lisa NON inseribile da qui (nessuna chiave di amministratore: solo app di Monica o della cliente).
- Controllo Da fare: C155 aggiunta (le 4 richieste di Mario); domanda «di chi parlavi» in Aspetta Mario.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #72: **Flash-Lite** per trascrivere (500 al giorno gratis) → no: meno preciso, crema di riso contata due volte; Mario «il lite fà un pò schifo». **Gemini Omni** (`gemini-omni-1.2-flash`) → no: CREA video, niente generateContent né piano gratis. **gemini-2.5-flash** → 404 per gli utenti nuovi dall'11/11. Valori nutrizionali detti nel video → no: 2 su 3 sbagliati, si stimano dalle dosi. `--finto` scriveva nella cache vera → corretto.
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
0. **Messaggio di Mario dopo l'handoff (13/11 ~18:45):** «La cliente Lisa … ha fatto un ordine tramite l'app, però gli è arrivato solo il messaggio a Monica … vorrei evitare questa cosa che arriva solo il messaggio e nell'app non c'è traccia di nulla … Stai correggendo i gusti. Nessuno ti ha parlato di gusti … stai lavorando a testa bassa». La #77 aveva SUPPOSTO (dal solo testo del messaggio) che Lisa avesse usato «Scrivimi»: NON provato. Prima rispondere corto; poi causa vera con prove (ordine «da approvare» non visto da Monica? invio fallito? carrello non inviato? Sentry). Patch C155 ferma finché la causa non è chiara.
1. Rispondere SUBITO a Mario (turni corti!). Sue risposte attese: ok foto C155 (1 = online · 2 = cambia) e «di chi parlavi» (1 me · 2 cliente · 3 entrambi).
2. C155 «1» → `git apply docs/lavori-in-corso/c155-scrivimi.patch` (contiene già v0.10.29 e novità in data.js; se C154 va online prima, versioni da riallineare), anteprima, giro completo locale verde, commit `[pubblica]`, curl della versione, «chiudi e riapri l'app». Poi a Mario: Monica scrive a Lisa «rimandalo dal tasto Scrivimi».
3. C155 «tutto tracciato» (piano in `docs/lavori-in-corso/c155-messaggi-in-ordini.md`, «Terza richiesta»): raccolta nuova `messaggi` (regole in firestore.rules provate nell'emulatore, `tools/prova-regole.js`; UNA guida a Mario per incollarle in Firebase, `docs/GUIDE-GIUSTE.md`), ogni messaggio di «Scrivimi» salvato, Monica lo vede in Ordini con «diventato ordine / senza ordine»; numeri o kg senza piatto capito → «Ordina dal menù». Idea 3 (un tocco di Monica «chiedi di ordinare dall'app») solo se Mario la vuole.
4. Trascrizione video: la sveglia di ogni mattina; dopo ogni giorno `python3 -I tools/raccogli_video.py`. Vecchi: scritte C154, idee C149, C140 privato, C143 + kit, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.
## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 16; 🛑 C148+C150 online, 🛑 C150 foto, 🛑 C141 pagella, idee C149).

## Ultimo messaggio di Mario
13/11 ~18:40, parola per parola: «ma hai capito il problema? scrivo e non mi rispondi e correggi i problemi senza leggere dopo» → risposta: turni corti, prima rispondo; domanda «di chi parlavi» (1 me · 2 cliente · 3 entrambi).
## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C156; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Alto** (`high`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 15:47 · [AVVIO] Sessione #77 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio; trascrizione rilanciata, limite giornaliero (PT E80)
- 2026-11-13 18:19 · Un cliente non proprio pratico di tecnologia gli è arrivato questo messaggio a M… → C155 causa + domanda
- 2026-11-13 18:21 · spiegami cosa è successo → spiegazione passo passo
- 2026-11-13 18:22 · No, troppo che Monica deve incollare e fare, voglio automatismo. Riesci innanzit… → C155 patch «Scrivimi» capisce gli ordini; ordine di Lisa non inseribile
- 2026-11-13 18:37 · dimmi la causa anche come è successo Sì, ma la mia domanda è come mai il cliente… → causa PT E81 + piano «tutto tracciato» (C155)
- 2026-11-13 18:39 · ma hai capito il problema? scrivo e non mi rispondi e correggi i problemi senza … → turni corti; domanda «di chi parlavi»

Ultimo, intero:
> ma hai capito il problema? scrivo e non mi rispondi e correggi i problemi senza leggere dopo

