# Passaggio di consegne

Sessione attuale: #79 (dopo la #78 `session_01WTjqUu3oyBhedrQbbAPNAH`, chiusa alla soglia 13/11 18:55; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

**#79: la apre Mario (catena 8 di 8).** #78 ha risposto a Mario su C155 (causa provata dal testo: Lisa ha usato «Scrivimi» credendo di ordinare), proposto il piano «Tutto dentro l'app» (DOMANDA 3) e la regola per tutto l'account (C156, DOMANDA 4). Aspetta le due risposte: NIENTE codice prima.

- **Modo di lavorare (Mario 13/11 18:50, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11 sera, #78):** Mario arrabbiato: «lavori per conto tuo, pubblichi, senza che ascolti e leggi i miei messaggi». Vuole: tutto tracciato nell'app, clienti spinti a ordinare dall'app, WhatsApp non in primo piano («controproducente»); la regola deve valere in tutto l'account. Turni CORTISSIMI, prima rispondere, mai lavori non chiesti.

## Stato (13/11 18:55 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUu3oyB/claude/pronti-ramo-definitivo.
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **v0.10.29 ONLINE** (#78, giro 99/99 locale, commit `[pubblica]` e8e10dc): «Scrivimi» capisce gli ordini + link `…/?ordine=<testo>` (carrello pronto, `carrelloDaLink` in app.js). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.29; `…/app.js | grep -c carrelloDaLink` → 3. Link e messaggio WhatsApp per Lisa dati a Mario 13/11.
## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#78)
- Avvio; sveglia 9:10 NON rifatta (8 di 8: `send_later` bloccato), resta quella della #77 (`trig_01E2n2khL5VsdZX4q5C51iN3`).
- C155: causa PROVATA dal testo (app.js:330-331: senza «per l'ordine n.» = tasto «Scrivimi» senza ordine); ipotesi «da approvare» scartata (Scrivimi solo agli approvati); dettagli in `docs/lavori-in-corso/c155-messaggi-in-ordini.md`. Gusto «ricotta e spinaci» spiegato (serviva per il carrello di Lisa). v0.10.28 resta online (curl), patch C155 ferma.
- PT E82 in ERRORI (risposta in ritardo nel passaggio, domanda già risposta). C156 in Da fare. Aspetta Mario: righe «di chi parlavi» e «foto C155» sostituite con DOMANDA 3 (piano) e DOMANDA 4 (regola).
- Controllo Da fare: 1 voce aggiunta (C156).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #72: **Flash-Lite** per trascrivere (500 al giorno gratis) → no: meno preciso, crema di riso contata due volte; Mario «il lite fà un pò schifo». **Gemini Omni** (`gemini-omni-1.2-flash`) → no: CREA video, niente generateContent né piano gratis. **gemini-2.5-flash** → 404 per gli utenti nuovi dall'11/11. Valori nutrizionali detti nel video → no: 2 su 3 sbagliati, si stimano dalle dosi. `--finto` scriveva nella cache vera → corretto.
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario, PRIMA dell'avvio lungo (PT E82). Attese: DOMANDA 3 (piano «Tutto dentro l'app»: 1 tutto · 2 WhatsApp nascosto · 3 cambia) e DOMANDA 4 (regola account: 1 Preferenze + kit + blocco automatico · 2 senza blocco · 3 cambia).
2. DOMANDA 3 = 1: piano in `docs/lavori-in-corso/c155-messaggi-in-ordini.md` (quinto messaggio + tabella del piano nel messaggio della #78: togli il tasto verde WhatsApp, «🛒 Ordina» in basso, Messaggi dentro l'app con raccolta `messaggi` + regole in firestore.rules provate nell'emulatore + guida a Mario per incollarle, ordine riconosciuto → carrello (riusa `ordineDaMessaggio` della patch C155), domande attaccate all'ordine, Monica risponde dall'app con `avvisaGestori`, resta solo «Chiama» in «Dove ritiri»). Prima di ogni pezzo una riga a Mario e il suo ok. Foto, poi online solo col suo ok.
3. DOMANDA 4 = 1: testo nuovo di `docs/kit-progetto/PREFERENZE-CHAT.txt` (2.498/2.500: accorciare altre righe), riga per il kit (questo progetto non è la fonte: voce C156 per la sessione del kit), blocco automatico = C143 rafforzato (pubblicazione solo con ok scritto di Mario nel registro dei messaggi); file `.claude/` solo con l'ok scritto nella chat.
4. Vecchi: trascrizione ogni mattina (sveglia della #77), scritte C154, idee C149, C140, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.
## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 19; prime DOMANDA 3 piano e DOMANDA 4 regola).

## Ultimo messaggio di Mario
13/11 18:54, parola per parola: «Mi raccomando, questo errore che è appena successo non deve capitare in tutto l'account e non solo in pronti in tavola. Questa cosa che lavori per conto tuo, pubblichi, senza che ascolti e leggi i miei messaggi.» → C156, DOMANDA 4.
## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C157; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Alto** (`high`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 18:43 · [AVVIO] Sessione #78 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio, risposta su C155
- 2026-11-13 18:46 · Cioè, stai rispondendo a quello che ti ho detto dopo 20 e passa minuti? È un'alt… → spiegazione del ritardo, PT E82
- 2026-11-13 18:48 · Se ascolti quello che dico nei messaggi, ti ho detto che Monica non lo visualizz… → causa provata, domanda ritirata, PT E82
- 2026-11-13 18:49 · Come puoi da questo messaggio correggere i gusti dei cibi? Cioè, sei pazzo. Hai … → spiegato il gusto dei ravioli
- 2026-11-13 18:50 · No, non è che non ti avevo chiesto se è una correzione, è una correzione, ma non… → modo di lavorare nelle consegne, v0.10.28 verificata
- 2026-11-13 18:53 · Io voglio che sia tutto tracciato, voglio spingere il cliente a ordinare dall'ap… → C155 piano «Tutto dentro l'app», DOMANDA 3
- 2026-11-13 18:54 · Mi raccomando, questo errore che è appena successo non deve capitare in tutto l'… → C156, DOMANDA 4

Ultimo, intero:
> Mi raccomando, questo errore che è appena successo non deve capitare in tutto l'account e non solo in pronti in tavola. Questa cosa che lavori per conto tuo, pubblichi, senza che ascolti e leggi i miei messaggi.

