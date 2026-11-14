# Passaggio di consegne

Sessione attuale: #88 (dopo la #87 `session_01WTjqUuBu8asstNqK8GBSNf`, chiusa alla soglia 14/11 04:35; la apre la #87 con `create_session` (catena 2 di 8)).

**#88: la apre la #87 (catena 2 di 8).** #87: v0.10.34 ONLINE (C154 scritte «✅ Controllata con Gemini» / «⚠️ Non ancora controllata», 16 controllate una per una, 3 nomi corretti); C161 regole sistemate (CLAUDE.md, ERRORI.md, prove.md); C23 gruppo 1 visto da Mario (7 voci chiuse).

- **Modo di lavorare (Mario 14/11, C161, sostituisce quello del 13/11):** correzioni ovvie da sola e le dico; funzioni nuove, aspetto e proposte grandi: prima una riga a Mario e il suo ok (`CLAUDE.md` «Regime leggero»); rispondo a ogni suo messaggio prima di lavorare.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (14/11 04:35, #87):** niente di urgente. Mario: «per ora sono ok te lo segnalerò io se ci saranno problemi tu vai avanti tranquillo» → niente altri gruppi C23 (le 95 restano aperte, le segnala lui). Trascrizione dei video: ogni nuova controllata UNA PER UNA («controllale tutte piano piano con cura»). Poi foto v0.10.34/33/31/30, C159 vista cliente (2 🛑), pagella Proteiche, PC di casa.

## Stato (14/11 04:35 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **v0.10.34 ONLINE** (#87, giro 105/105 locale, commit `[pubblica]` d64b3ca): C154 scritte, 16 `controllata`, 3 con `dubbi` restano «non controllata» (Ciambellefit, Pancake del 1 lug, Ricetta del 25 mag); nomi Ricotta di soia, Gomasio, «torta a limone» (`fatto_qui`/`REFUSI` in raccogli_video.py, PT E90); prova C155 aspetta WhatsApp con `waitForEvent` (era rossa a volte). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.34; `…/ricette-video.js | grep -o '"controllata":true' | wc -l` → 16. Patch cancellata.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia 14/11 9:10 (`trig_01EMU7mdT9CxPjUGCbEGj7vs`, della #88). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **v0.10.29 ONLINE** (#78, giro 99/99 locale, commit `[pubblica]` e8e10dc): «Scrivimi» capisce gli ordini + link `…/?ordine=<testo>` (carrello pronto, `carrelloDaLink` in app.js). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.29; `…/app.js | grep -c carrelloDaLink` → 3. Link e messaggio WhatsApp per Lisa dati a Mario 13/11.
- **v0.10.30 ONLINE** (#81, giro 100/100 locale, commit `[pubblica]` 1e115ff): barra `.ai-cliente` ferma in cima (sticky) con un microfono solo `ai-mic[data-a=ac-detta]`, microfoni galleggianti `.vc-fab` solo nel carrello, barra in basso Menù · I miei ordini · Scrivi a Monica; C157 riquadro «Scegli la misura» + «Invia» spento. Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.30; `…/app.js | grep -c misuraManca` → 5. Patch cancellata (applicata).
- **v0.10.32 ONLINE** (#84, giro 103/103, commit `[pubblica]` c145312): C159 ordini di prova fuori da pronti e teglie (`!o.prova` in `teglieOrdine`, `presi`, `riprendiPronti`/`rimettiPronti`), «per sabato» di sabato (PT E88). PT E87: un `commit -a` aveva pubblicato C159 prima del giro.
- **v0.10.31 ONLINE** (#84, giro 102/102, commit `[pubblica]` 16e1997): C160 costo della ricetta, patch applicata e cancellata. Prima: **C160 in PATCH** (#83): `docs/lavori-in-corso/c160-unita.patch` (spesa.js, app.js, tools/prova.js; 7 punti, dettagli in `c160-costo-ricetta.md`). Verifica: `git apply --check docs/lavori-in-corso/c160-unita.patch`; dopo l'applicazione `python3 -I tools/anteprima.py && SOLO='C160|dosi nella scheda' node tools/prova.js` → 3 OK. Giro completo locale #83 con la patch applicata: 102/102 OK, nessun errore (13/11 23:26); da rifare sull'ultimo commit prima di pubblicare. Foto `archivio/foto/2026-11-13-2340-c160-dopo-1..4.png` mandate.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#87)
- Avvio: sveglia C150 rifatta (`trig_01BgZ9pVgV63R6RxRzS37Z4Z`, 14/11 9:10, prompt «ogni nuova una per una»; arriva alla #87: la #88 la rifà sua e cancella questa); quella della #86 cancellata; scorta mia unita.
- «ho 10 minuti» → gruppo 1 C23 (C42, C47-C51, C58); «vapore ok ecc per ora sono ok…» → 7 voci in DA-FARE-FATTE con «👁 Visto da Mario» (colonna 2: `promesse.py` legge solo quella).
- «dimmi le regole in contrasto…» → spiegate; «correzione ovvie falle da solo anteprima di prova tieni 400 il resto … scegli tu» → C161 fatta (piano in `docs/piani-finiti/c161-controllo-regole.md`).
- «mettile online ma controllale tutte piano piano con cura» → 19 trascritte guardate una per una (16 ✅, 3 dubbi), v0.10.34 online, curl verificato.
- Controllo Da fare: 0 voci aggiunte (C154 e C161 avevano già la voce).
- Aperto: nome «Torta con barrette proteiche e piadina con uova» (yt:7MpGzkD-H8A, video con 3 colazioni; Gemini dice «Colazioni proteiche da portare via»): lasciato, detto a Mario nel 💡.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #83: rifare la pagina (`salvatoOk`, `render`) quando si esce dal campo prezzo/confezione → no: il tocco subito dopo su «kg» o «Fatto» si perdeva (PT E86). Tasto dell'unità che converte il numero (250 g → 0,25 kg) → no: chi scrive «1» e poi tocca «kg» vuole 1 kg; il numero resta, cambia l'unità.
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario (PT E82). Modo di lavorare: `CLAUDE.md` «Regime leggero» (correzioni ovvie da sola, il resto con l'ok).
2. Sveglia C150 (9:10): trascrizione; OGNI ricetta nuova guardata una per una (detti contro file, nome, `dubbi`), poi `--parlato-su`, prove, giro, versione nuova online; solo `git add` coi nomi (PT E87).
3. C23: niente altri gruppi se Mario non li chiede (le segnala lui).
4. C159 vista cliente dopo le 2 risposte 🛑; C154 velocità (consiglio 1 = gratis, già in corso); foto 0.10.34/33/31/30; idee C149, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70), `01WTjqUuVK9Q` (#83).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 22; 🛑: C159, v0.10.26, C141, PC di casa).

## Ultimo messaggio di Mario
14/11 04:12: «mettile online ma controllale tutte piano piano con cura» → 19 controllate una per una, v0.10.34 online (16 ✅), sveglia aggiornata.


## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C165; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Alto** (`high`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-14 03:31 · [AVVIO] Sessione #87 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio, sveglia C150 rifatta
- 2026-11-14 03:39 · ho 10 minuti → gruppo 1 C23
- 2026-11-14 03:42 · vapore ok ecc oer ora sono ok te lo segnalerò io se ci saranno problemi tu vai a… → 7 voci viste (C42 C47-C51 C58)
- 2026-11-14 03:48 · dimmi le regole in contrasto 6 doppioni e 2 inutili fammi capire bene di cosa st… → spiegazione delle 11 regole
- 2026-11-14 03:51 · correzione ovvie falle da solo anteprima di prova tieni 400 il resto valuta bene… → C161 fatta, commit ae65e74
- 2026-11-14 04:12 · mettile online ma controllale tutte piano piano con cura → C154 v0.10.34 online, commit d64b3ca

Ultimo, intero:
> mettile online ma controllale tutte piano piano con cura

