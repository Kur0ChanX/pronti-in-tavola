# Passaggio di consegne

Sessione attuale: #87 (dopo la #86 `session_01WTjqUuqoS1WHeKkswH3iaF`, chiusa alla soglia 14/11 03:30; la apre la #86 con `create_session` (catena 1 di 8)).

**#87: la apre la #86 (catena 1 di 8).** #86: niente codice dell'app. Difese PT E87 (guardia: `commit -a`/`add -A` + commit fermati con file del sito cambiati, `tools/test-guardia.py` 133/133) e PT E88 (prova «giorni detti … 7 giorni … data finta» in `tools/prova.js`, rossa senza la correzione). Da fare ed ERRORI snelliti (stesse 109 voci, 103 promesse, 81 lezioni; testo intero in `DA-FARE-FATTE.md` e `ERRORI-STORIA.md`).

- **Modo di lavorare (Mario 13/11 18:50, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (14/11 03:30, #86):** niente di urgente; Mario vuole che i 103 lavori fatti non si dimentichino («basta che non si dimenticano e che vengano controllati o menzionati»): proposta C23 = mandarglieli a gruppi da guardare nell'app quando ha 10 minuti (aspetta il suo «quando»). Poi foto v0.10.33/31/30, C159 vista cliente (2 🛑), C161, pagella Proteiche, PC di casa.

## Stato (14/11 03:30 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261114-01WTjqUuqoS1/claude/pronti-ramo-definitivo (merge con conflitti nelle consegne: `python3 -I .claude/hooks/scorta.py prendi-messaggi origin/<scorta>`, PT E85).
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **v0.10.29 ONLINE** (#78, giro 99/99 locale, commit `[pubblica]` e8e10dc): «Scrivimi» capisce gli ordini + link `…/?ordine=<testo>` (carrello pronto, `carrelloDaLink` in app.js). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.29; `…/app.js | grep -c carrelloDaLink` → 3. Link e messaggio WhatsApp per Lisa dati a Mario 13/11.
- **v0.10.30 ONLINE** (#81, giro 100/100 locale, commit `[pubblica]` 1e115ff): barra `.ai-cliente` ferma in cima (sticky) con un microfono solo `ai-mic[data-a=ac-detta]`, microfoni galleggianti `.vc-fab` solo nel carrello, barra in basso Menù · I miei ordini · Scrivi a Monica; C157 riquadro «Scegli la misura» + «Invia» spento. Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.30; `…/app.js | grep -c misuraManca` → 5. Patch cancellata (applicata).
- **v0.10.32 ONLINE** (#84, giro 103/103, commit `[pubblica]` c145312): C159 ordini di prova fuori da pronti e teglie (`!o.prova` in `teglieOrdine`, `presi`, `riprendiPronti`/`rimettiPronti`), «per sabato» di sabato (PT E88). PT E87: un `commit -a` aveva pubblicato C159 prima del giro.
- **v0.10.31 ONLINE** (#84, giro 102/102, commit `[pubblica]` 16e1997): C160 costo della ricetta, patch applicata e cancellata. Prima: **C160 in PATCH** (#83): `docs/lavori-in-corso/c160-unita.patch` (spesa.js, app.js, tools/prova.js; 7 punti, dettagli in `c160-costo-ricetta.md`). Verifica: `git apply --check docs/lavori-in-corso/c160-unita.patch`; dopo l'applicazione `python3 -I tools/anteprima.py && SOLO='C160|dosi nella scheda' node tools/prova.js` → 3 OK. Giro completo locale #83 con la patch applicata: 102/102 OK, nessun errore (13/11 23:26); da rifare sull'ultimo commit prima di pubblicare. Foto `archivio/foto/2026-11-13-2340-c160-dopo-1..4.png` mandate.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#86)
- Avvio: scorta #85 unita; sveglia C150 rifatta qui (`trig_01XSJxcg5WkqtkMrxf1DDAhy`, 14/11 9:10 → arriva alla #86: la #87 la rifà sua e cancella questa), quella della #77 cancellata.
- Mario «si va bene per tutti» → PT E87 + PT E88 fatte (commit 2b81f4bd e f9141a7). Prova E88 controllata: tolta apposta la correzione di `giornoDetto` → 7 giorni sbagliati; rimessa → verde.
- Mario «1 basta che non si dimenticano e che vengano controllati o menzionati» → snellimento: 12 voci di Da fare accorciate (storia in `DA-FARE-FATTE.md` «Storia delle voci ancora aperte … 14/11»), 6 righe di ERRORI accorciate (storia in fondo a `ERRORI-STORIA.md`). Ancora sopra i tetti (Da fare 46 KB su 40, ERRORI 12 KB su 10): il motivo sono i 103 lavori 👁 che aspettano Mario.
- Controllo Da fare: 0 voci aggiunte (C23 copre già i lotti 👁).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #83: rifare la pagina (`salvatoOk`, `render`) quando si esce dal campo prezzo/confezione → no: il tocco subito dopo su «kg» o «Fatto» si perdeva (PT E86). Tasto dell'unità che converte il numero (250 g → 0,25 kg) → no: chi scrive «1» e poi tocca «kg» vuole 1 kg; il numero resta, cambia l'unità.
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario (PT E82). Modo di lavorare: prima di OGNI modifica una riga a Mario e il suo ok.
2. C23: quando Mario dice «ora», mandargli i lavori 👁 a gruppi (5-8 per messaggio, i più vecchi prima), con dove guardare nell'app; ogni «ok» → voce in `DA-FARE-FATTE.md` con «👁 Visto da Mario».
3. Sveglia C150 (9:10): trascrizione dei video (se non gira, rilanciarla in sottofondo); solo `git add` coi nomi (PT E87).
4. C159 vista cliente dopo le 2 risposte 🛑; C161 col «1»; poi foto menù 0.10.30, scritte C154, idee C149, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70), `01WTjqUuVK9Q` (#83).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 22; 🛑: C159, v0.10.26, C141, PC di casa).

## Ultimo messaggio di Mario
14/11 ~03:35: «1 basta che non si dimenticano e che vengano controllati o menzionati» → snellimento fatto (sopra); proposta dei lotti C23, aspetta il suo «quando».


## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C165; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-14 02:24 · [AVVIO] Sessione #86 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → 
- 2026-11-14 03:00 · si va bene per tutti che dici? → 
- 2026-11-14 03:25 · rifammi la domanda chiara → 
- 2026-11-14 03:27 · 1 basta che non si dimenticano e che vengano controllati o menzionati → 

Ultimo, intero:
> 1 basta che non si dimenticano e che vengano controllati o menzionati

