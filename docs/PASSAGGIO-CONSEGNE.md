# Passaggio di consegne

Sessione attuale: #77 (dopo la #76 `session_01WTjqUy56yFQCWNDcwHsXB4`, chiusa alla soglia 13/11 15:45; la apre la #76 con `create_session` (catena 7 di 8)).

**#77 aperta dalla #76 (13/11, ferma ad aspettare Mario oltre 180k, C455).** v0.10.28 ONLINE (C152 + correzione C154). Scritte «✅ controllata con Gemini / ⚠️ non controllata» PRONTE IN PATCH `docs/lavori-in-corso/c154-etichette.patch`, foto `archivio/foto/2026-11-13-c154-48{h,i,j}.png` mandate: aspettano l'ok di Mario. Trascrizione di tutti i video FERMATA all'handoff (22 su ~770): la nuova la rilancia.

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11, #76):** ricette video di cui fidarsi: TUTTE controllate col video da Gemini, ingredienti completi, voto vero (15:37 «fai un check a tutti e trascrivi bene tutti gli ingredienti almeno puoi dare un voto vero»); scritte controllata / non controllata (15:42). Gemini è l'unica strada gratis (Mario «Per forza Gemini», ricerca 13/11 confermata).

## Stato (13/11 15:45 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice 0.10.28 (`VERSIONE_APP` in data.js). Scorte NON unite: scorta-principale-20261113-01WTjqUy56yF/claude/pronti-ramo-definitivo.
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#76)
- Avvio; sveglia C150 14/11 9:10 rifatta (`trig_01AeWzak3U9TaJYRmrQaDu7k`, della #76: la nuova la rifà sua e cancella questa).
- C154: causa vera trovata (righe con @/# buttate intere, PT E79), corretta, +92 ricette con ingredienti; v0.10.28 online (Mario «mettile online»).
- Trascrizione di tutti i video avviata (Mario «check a tutti»), ingredienti scritto + detto; scritte ✅/⚠️ in patch con foto; ricerca alternative a Gemini (nessuna gratis che guardi il video).
- Controllo Da fare: 0 voci aggiunte (C154 aggiornata con le 3 richieste).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #72: **Flash-Lite** per trascrivere (500 al giorno gratis) → no: meno preciso, crema di riso contata due volte; Mario «il lite fà un pò schifo». **Gemini Omni** (`gemini-omni-1.2-flash`) → no: CREA video, niente generateContent né piano gratis. **gemini-2.5-flash** → 404 per gli utenti nuovi dall'11/11. Valori nutrizionali detti nel video → no: 2 su 3 sbagliati, si stimano dalle dosi. `--finto` scriveva nella cache vera → corretto.
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rilanciare SUBITO la trascrizione in sottofondo: `python3 -I tools/trascrivi_video.py --da ricette-video.js` (il file online va bene: legge gli id). Misurare il ritmo vero (video all'ora); se lento valutare 2-3 trascrizioni insieme (attenzione al limite al minuto, PT E77). Commit del json a blocchi.
2. Risposta di Mario sulle scritte (foto 48h/48i/48j). «1» → `git apply` della patch, `python3 -I tools/raccogli_video.py` (con le trascrizioni nuove), versione 0.10.29 in data.js, anteprima, giro completo locale verde, commit `[pubblica]`, curl, «chiudi e riapri l'app».
3. Ogni giorno: rigenerare con le trascrizioni nuove, controllo a campione delle ricette unite (scritto + detto: doppioni?), righe `dubbi` a mano, versione nuova. Il voto (pagella) si ricalcola dalla stima.
4. Foto di v0.10.26/28 a Mario sulle ricette controllate quando ce ne sono di più. Vecchi: idee C149, C140 privato, C143 + kit, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 16; 🛑 C148+C150 online, 🛑 C150 foto, 🛑 C141 pagella, idee C149).

## Ultimo messaggio di Mario
13/11 15:42, parola per parola: «Metti nei video ricetta controllata con Gemini, fai ricetta non controllata nei video e poi controlla se c'è un'altra soluzione. Per forza Gemini dobbiamo usare, non c'è nient'altro di performante a costo zero» → scritte in patch + foto, ricerca fatta, DOMANDA 1 (1 = online · 2 = cambia).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C156; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Alto** (`high`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 15:25 · [AVVIO] Sessione #76 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio; C154 causa trovata
- 2026-11-13 15:35 · mettile online → v0.10.28 online (C152 + C154)
- 2026-11-13 15:37 · e nei video fai un check a tutti e trascrivi bene tutti gli ingredienti almeno p… → C154 trascrizione di tutti + `unisci_ingredienti`
- 2026-11-13 15:42 · Metti nei video ricetta controllata con Gemini, fai ricetta non controllata nei … → C154 scritte in patch + foto, ricerca alternative, DOMANDA 1

Ultimo, intero:
> Metti nei video ricetta controllata con Gemini, fai ricetta non controllata nei video e poi controlla se c'è un'altra soluzione. Per forza Gemini dobbiamo usare, non c'è nient'altro di performante a costo zero

