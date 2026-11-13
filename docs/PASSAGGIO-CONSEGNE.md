# Passaggio di consegne

Sessione attuale: #72 (dopo la #71 `session_01WTjqUvRgtBLtmiruU8Yb9m`, chiusa alla soglia 13/11 10:49; la apre la #71 con `create_session` (catena 2 di 8)).

**#72 aperta dalla #71 in parallelo (13/11 ~10:46; Mario: «lavorate in 2 sessione fino a quando non la chiudi questa e comunicate quello che vi serve»)**: la #71 ora è CHIUSA: la #72 fa tutto (C150 per primo, poi i «Prossimi passi»). La scorta della #71 si unisce solo se ha lavoro nuovo (E97).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11, #71):** catalogo proteico immenso: ricette dal PARLATO di ogni video (C150, Gemini con la sua chiave, «per ogni singolo video»), creatori nuovi (C148: 316 dai siti pronte, 2 canali video pronti), le carica Claude, MAI il motore dell'app.

## Stato (13/11 10:49 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUvRgtB/claude/pronti-ramo-definitivo.
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Giro completo dopo: 95/95 verde (#63).
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %. #65: raccolta rilanciata in sottofondo (log nel contenitore della #65, perso): rilanciarla se serve.
- Giro completo `node tools/prova.js` 97/97 verde nella #71 (con la v0.10.25). Verifica: `node tools/prova.js > f 2>&1; grep -c '^NO' f` → 0 (~5 min).
- **C143 difesa pronta ma SPENTA**: `docs/lavori-in-corso/c143-guardia.patch` (guardia: commit/push di file del sito sul ramo senza «[pubblica]» → fermo; 26 prove in `tools/test-guardia.py`, 146/146 verdi). Al «1» di Mario (DOMANDA 2): `git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`, commit, push. Verifica: `git apply --check` della patch passa.
- **C140 = 3** (Mario 19:24): privato + PC di casa, poi GitHub. Passo 1 a Mario (rendere privato, passi in chat 19:30, guida in `docs/GUIDE-GIUSTE.md`); verifica: `gh api -X GET search/repositories -f q='repo:Kur0ChanX/pronti-in-tavola' --jq '.items[0].visibility'` (oggi `public`). Minuti misurati: ~40 al giorno di pubblicazioni → ~1.200 al mese su 2.000 (stima). Piano: `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- **v0.10.24 ONLINE (#70)**: C144-C147 (268 ricette video, passi, video dentro l'app) + voce `ricettario-video` dell'aiutante; giro 96/96. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"`.
- **C150 ricette dal parlato**: chiave `GEMINI_API_KEY` salvata da Mario nell'ambiente (13/11 10:38; `get_environment` mostra il nome; la #71 non la leggeva). `tools/trascrivi_video.py` (provato `--finto`). Piano e stato: `docs/lavori-in-corso/c150-ricette-dal-parlato.md`. Verifica: `[ -n "$GEMINI_API_KEY" ] && echo si`.
- **v0.10.25 ONLINE (#71)**: C149 voto palestra su ogni carta + profilo palestra di Mario, C148 «Da chi» in Proteiche (`chiRic`, `f.chi` 'A|B') e `FONTI_RIC` con `fw`/`fs`/`gh`; giro locale 97/97. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.25.
- **C148 dati pronti, NON online**: `docs/lavori-in-corso/c148-stimate.patch` (della #70: `ricette-stimate.js` 206 → 522, Fit with Fun 241, Iamfitandsweet 19, Giuseppe Healthy 56) e `docs/lavori-in-corso/c148-video.patch` (`ricette-video.js` 798: + Cotto al Dente 52, 2foodfitlovers 477). Prima foto a Mario (PT E69): `FOTO2=1 SOLO='C144|C148' node tools/prova.js` coi due patch applicati nel contenitore → `/tmp/pit/48e-c144-video-youtuber.png`, `48e-c148-da-chi.png`, `48f-c148-ricetta-sito.png` (scritta «DOPO · NUOVA» in alto, taglio ≤1100 px). Verifica: `git apply --check` delle due patch.
- `docs/DA-FARE.md` 39,5 KB (tetto 40, #69): la storia delle voci aperte va in fondo a `docs/DA-FARE-FATTE.md` («Storia delle voci ancora aperte»). Verifica: `wc -c docs/DA-FARE.md`.
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: 38.26 disponibile (ha il caso «casa» per il PC): si aggiorna con l'ok di Mario per `.claude/` (DOMANDA 1 della #65, insieme a C143). Verifica: `cat docs/kit-progetto/VERSIONE`.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#71)
- v0.10.25 online (C149 + «Da chi»). C150 aperta: strade studiate (Gemini sì; sottotitoli e scarico dell'audio no), strumento scritto, chiave di Mario nell'ambiente, #72 aperta in parallelo per la prova vera. Raccolta `--creatori` della #71 doppia di quella della #70: file IDENTICO a quello della patch della #70 (316: fw 241, fs 19, gh 56; scarti lettura 400, stima 310, regola 543) = verifica indipendente. Prova C148 resa indipendente (PT E70 ampliato).
- Controllo Da fare: 1 voce aggiunta (C150); C148 e C149 aggiornate; righe tolte da «Aspetta Mario»: «Da chi» (approvata), C149 🛑 (risposta «1»), chiave C150 (fatta).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #68: video di YouTube nel contenitore con «autoplay=1» → «Video unavailable» (senza autoplay il lettore si vede): è il contenitore, non il codice; la prova vera è l'Android di Mario. `recordVideo` di Playwright con `size` 780×1688 → registra a 390×844 con bordo grigio: registrare a 390×844 e ingrandire con ffmpeg. Rileggere una foto rifiutata (403) con un altro «user agent» → rifiutato dal controllo della sessione (aggirare un controllo anti-robot): non rifarlo.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
⛔ NON unire le scorte `01WTjqUup234` (#66) e `01WTjqUwz4Kr` (#67): vecchie.
1. C150: 10 video di prova (`python3 -I tools/trascrivi_video.py --da <ricette-video.js con c148-video.patch> --quanti 10`), controllo a occhio, esito nel file C150; poi `tools/raccogli_video.py` usa dosi e passi del parlato (scritta «📝 dal video»), foto a Mario, poi tutti (8 ore di video al giorno gratis: riprende da dove era).
2. C148: foto a Mario delle ricette nuove (riga «Stato» sopra), al suo ok versione 0.10.26 con le due patch: giro completo, commit `[pubblica]`, `curl` del sito, `git rm` delle patch.
3. Altri creatori della tabella #70 (Ricette di Alice, HSN, Sergio Chisari), poi gli inglesi con prova di traduzione e foto.
4. Idee C149 (consiglio 1 e 4) quando Mario risponde. Vecchi: C140 privato, C143 + kit 38.26, pagella C141, Android schermo intero.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 14; 🛑 C141 pagella, idee C149).

## Ultimo messaggio di Mario
13/11 10:45, parola per parola: «si lavorate in 2 sessione fino a quando non la chiudi questa e comunicate quello vhe vi serve» → #72 aperta in parallelo, ora fa tutto.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C151; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 10:02 · [AVVIO] Sessione #71 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio fatto
- 2026-11-13 10:24 · va bene come Consiglio → foto «Da chi» approvata (C148)
- 2026-11-13 10:26 · Riesci per ogni singolo video a magari, non so, riesci a capire quello che dici … → C150
- 2026-11-13 10:33 · prendiamo l'audio da ogni video e prendi il testo tranquillo tanto lo guardo sol… → C150, strada 3 no (motivi in chat)
- 2026-11-13 10:34 · 1 faccio la chiave → C150 strada 1
- 2026-11-13 10:36 · mandami la finestra che la incollo la chiave → finestra «Denied», GUIDE-GIUSTE
- 2026-11-13 10:37 · non va nega la metto su ambiente → ok
- 2026-11-13 10:38 · fatto messa nell'ambiente → chiave vista (C150)
- 2026-11-13 10:39 · 1 metti online il voto palestra → v0.10.25 online
- 2026-11-13 10:45 · si lavorate in 2 sessione fino a quando non la chiudi questa e comunicate quello… → #72 aperta

Ultimo, intero:
> si lavorate in 2 sessione fino a quando non la chiudi questa e comunicate quello vhe vi serve

