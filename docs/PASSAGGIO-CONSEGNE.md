# Passaggio di consegne

Sessione attuale: #84 (dopo la #83 `session_01WTjqUuVK9QyrnrAkWZod36`, chiusa alla soglia 13/11 23:25; la apre la #83 con `create_session` (catena 6 di 8)).

**#84: la apre la #83 (catena 6 di 8).** #83: **C160 costo della ricetta: 7 punti in PATCH** (`docs/lavori-in-corso/c160-unita.patch`, prove verdi, 4 foto mandate, aspetta l'ok di Mario sulle foto). C159: 2 buchi degli ordini di prova trovati (aspetta «1» = correggo). C161 e C159 gesto/tocchi: ancora senza risposta.

- **Modo di lavorare (Mario 13/11 18:50, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11 23:25, #83):** C160 costo della ricetta (patch pronta: col suo «1» sulle foto → applicare, giro completo, online); C159 Monica vista cliente + ordini di prova che non contano come veri (Mario 23:23 «se monica mette stò provando l'app… non viene conteggiato nell'ordine vero»); C161 controllo regole. Prima di OGNI modifica dell'app: una riga a Mario e il suo ok.

## Stato (13/11 23:25 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUuVK9Q/claude/pronti-ramo-definitivo (merge con conflitti nelle consegne: `python3 -I .claude/hooks/scorta.py prendi-messaggi origin/<scorta>`, PT E85).
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

## Sessione appena chiusa (#83)
- C160: trovato che il costo c'era già quasi tutto (C7); DOMANDA con 7 punti; Mario «aggiungi anche KG e CL ed Etti» + «per il resto va bene» → 7 punti in patch con prova `C160 confezione…` e `C160 costo della ricetta…` in `tools/prova.js`. PT E86 in `docs/ERRORI.md` (tocco perso dopo un campo che rifà la pagina uscendo).
- C159: controllo «Sto solo provando l'app»: fuori da incassi, spesa, storico; 2 buchi: `p.pronto.qta` scalato in app.js (azione `invia`, `nuovo`) e `presi()` in dati.js; teglie della settimana (`teglieOrdine` in app.js, `teglie()` in dati.js). Correzione proposta nel file `docs/lavori-in-corso/c159-*.md`.
- Controllo Da fare: 0 voci aggiunte (le richieste stanno in C159 e C160).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #83: rifare la pagina (`salvatoOk`, `render`) quando si esce dal campo prezzo/confezione → no: il tocco subito dopo su «kg» o «Fatto» si perdeva (PT E86). Tasto dell'unità che converte il numero (250 g → 0,25 kg) → no: chi scrive «1» e poi tocca «kg» vuole 1 kg; il numero resta, cambia l'unità.
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario (PT E82). Domande aperte di questa catena: C160 foto (1 = online), C159 ordini di prova (1 = correggo), C159 gesto e tocchi, C161 regole: righe in «0. Aspetta Mario».
2. C160 col «1»: `git apply docs/lavori-in-corso/c160-unita.patch` (con la correzione C159 se Mario dice «1» anche lì, stessa versione), numero di versione, giro completo verde, online (skill `pr`), cancellare la patch, «chiudi e riapri l'app» a Mario.
3. C159 ordini di prova col «1»: `!o.prova` in `teglieOrdine` (app.js) e `presi()` (dati.js); niente scalo dei pronti per la prova; `riprendiPronti`/`rimettiPronti` e «rimettilo tra i veri» coerenti; prova che una prova non tocca pronti né teglie.
4. C159 vista cliente dopo le 2 risposte (gesto, tocchi): Ho capito → specifica → patch, foto, ok, giro, online.
5. C161 col «1»: le 11 proposte (CLAUDE.md, ERRORI.md, prove.md). Poi i vecchi: foto menù 0.10.30, trascrizione (sveglia #77), scritte C154, idee C149, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 20; prime le 3 della #79: DOMANDA 1 tasti 🛑, 2 controllo regole, 3 misura C157).

## Ultimo messaggio di Mario
13/11 23:23, parola per parola: «Ricordati che se monica mette stò provando l'app nell' invio dell 'ordine non viene conteggiato nell'ordine vero»
→ controllato: già fuori da incassi e spesa; 2 buchi (pronti subito, teglie) → domanda «1 = correggo». Prima: 23:07 «aggiungi anche KG e CL ed Etti», 23:17 «per il resto va bene» (C160 punti 2-7, fatti in patch).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C162; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 22:48 · [AVVIO] Sessione #83 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio, titolo, C160 controllo + DOMANDA 1 (7 punti), foto `2026-11-13-2310-c160-oggi-*`
- 2026-11-13 23:07 · aggiungi anche KG e CL ed Etti → C160 punto 1 in patch (`c160-unita.patch`)
- 2026-11-13 23:17 · per il resto va bene → C160 punti 2-7 in patch, 4 foto `2026-11-13-2340-c160-dopo-*`, domanda «1 = online»
- 2026-11-13 23:23 · Ricordati che se monica mette stò provando l'app nell' invio dell 'ordine non vi… → C159: 2 buchi trovati, domanda «1 = correggo» (`c159-*.md`)

Ultimo, intero:
> Ricordati che se monica mette stò provando l'app nell' invio dell 'ordine non viene conteggiato nell'ordine vero

