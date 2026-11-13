# Passaggio di consegne

Sessione attuale: #71 (dopo la #70 `session_01WTjqUvtoJCfRTCpGySkXAG`, chiusa alla soglia 13/11 10:00; la apre la #70 con `create_session` (catena 1 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11 09:38-10:09, #70):** «catalogo immenso proteico in priorità a GialloZafferano» (GZ piano piano): voto palestra su tutte le carte (C149, patch pronta, 🛑 DOMANDA 2 «1 = mettilo nell'app»), tanti creatori in più (C148), le ricette le carica Claude, MAI il motore dell'app (consumava tutto e bloccava l'app, Mario ~09:45).

## Stato (13/11 10:00 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUvtoJC/claude/pronti-ramo-definitivo.
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Giro completo dopo: 95/95 verde (#63).
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %. #65: raccolta rilanciata in sottofondo (log nel contenitore della #65, perso): rilanciarla se serve.
- Giro completo `node tools/prova.js` 95/95 verde nella #63 (due volte, l'ultima con `tools/prova.js` del commit 0a3d2ce0); C142 chiusa (PT E70). Verifica: `node tools/prova.js > f 2>&1; grep -c '^NO' f` → 0 (~4,5 min).
- **C143 difesa pronta ma SPENTA**: `docs/lavori-in-corso/c143-guardia.patch` (guardia: commit/push di file del sito sul ramo senza «[pubblica]» → fermo; 26 prove in `tools/test-guardia.py`, 146/146 verdi). Al «1» di Mario (DOMANDA 2): `git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`, commit, push. Verifica: `git apply --check` della patch passa.
- **C140 = 3** (Mario 19:24): privato + PC di casa, poi GitHub. Passo 1 a Mario (rendere privato, passi in chat 19:30, guida in `docs/GUIDE-GIUSTE.md`); verifica: `gh api -X GET search/repositories -f q='repo:Kur0ChanX/pronti-in-tavola' --jq '.items[0].visibility'` (oggi `public`). Minuti misurati: ~40 al giorno di pubblicazioni → ~1.200 al mese su 2.000 (stima). Piano: `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- **v0.10.24 ONLINE (#70)**: C144-C147 (268 ricette video, passi, video dentro l'app) + voce `ricettario-video` dell'aiutante; giro 96/96. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"`.
- **C149 PRONTO come patch** `docs/lavori-in-corso/c149-app.patch` (`ricettario.js`, `app.js`, `aiutante.js`, `worker.js`, `style.css`, `tools/prova.js`): voto palestra a 6 voci (dose, densità g/100 kcal, calorie per tipo, saturi, zuccheri, sale; voto «≈» coi soli kcal e proteine), voto sulle carte video, «🏋️ Il mio profilo palestra» in «Solo per te, Mario» (solo localStorage `pit-profilo-pal`, anche % di grasso → Katch-McArdle), «Voto per te». Prove C124/C141/C144/C100 verdi. Foto `archivio/foto/2026-11-13-c149-*.png` mandate. Verifica: `git apply --check docs/lavori-in-corso/c149-app.patch`.
- **C148 dati (#70)**: `docs/lavori-in-corso/c148-video.patch` = `ricette-video.js` con 798 ricette (Pietrobon 202, Beardedscara 67, Cotto al Dente 52, 2foodfitlovers 477; recensioni e ristoranti tolti); strumenti già su GitHub (`tools/raccogli_video.py` CANALI, `tools/raccogli_stimate.py --creatori` per Fit with Fun, Iamfitandsweet, Giuseppe Healthy: 298 ricette GH trovate). La raccolta `--creatori` NON è finita (lenta nel contenitore #70): rilanciarla in sottofondo. Verifica: `git apply --check docs/lavori-in-corso/c148-video.patch`.
- `docs/DA-FARE.md` 39,5 KB (tetto 40, #69): la storia delle voci aperte va in fondo a `docs/DA-FARE-FATTE.md` («Storia delle voci ancora aperte»). Verifica: `wc -c docs/DA-FARE.md`.
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: 38.26 disponibile (ha il caso «casa» per il PC): si aggiorna con l'ok di Mario per `.claude/` (DOMANDA 1 della #65, insieme a C143). Verifica: `cat docs/kit-progetto/VERSIONE`.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#70)
- v0.10.24 pubblicata (C144-C147); prova C144 rimetteva male `navigator.onLine` → corretta + controllo in `passo` (PT E74). PT E75 (titolo per primo), PT E76 («pubblica» ambiguo). C149 voto palestra e profilo (patch, foto, DOMANDA 2 🛑). C148: canali e siti nuovi, ricerca altri creatori (tabella in `c148-lista-creatori-fitness.md`). Messaggi di Mario con età, altezza e % di grasso: numeri coperti nel registro (progetto pubblico).
- Controllo Da fare: 2 voci aggiunte (C149; riga C149 idee e DOMANDA 2 in «Aspetta Mario»). Offerta non ancora accettata: «Quanti addominali vedi?» al posto della % (Mario deve scrivere «sì addominali»).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #68: video di YouTube nel contenitore con «autoplay=1» → «Video unavailable» (senza autoplay il lettore si vede): è il contenitore, non il codice; la prova vera è l'Android di Mario. `recordVideo` di Playwright con `size` 780×1688 → registra a 390×844 con bordo grigio: registrare a 390×844 e ingrandire con ffmpeg. Rileggere una foto rifiutata (403) con un altro «user agent» → rifiutato dal controllo della sessione (aggirare un controllo anti-robot): non rifarlo.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
⛔ NON unire le scorte `01WTjqUup234` (#66) e `01WTjqUwz4Kr` (#67): vecchie, superate dalla v0.10.24.
1. 🛑 DOMANDA 2 (C149) «1» → `git apply docs/lavori-in-corso/c149-app.patch docs/lavori-in-corso/c148-video.patch`, `python3 -I tools/anteprima.py`, giro completo `node tools/prova.js` (0 «NO»), versione 0.10.25 in `data.js` (novità: voto palestra, profilo, 2 canali nuovi), commit `[pubblica]` e push, `curl` del sito, `git rm` delle due patch. Prima una foto della pagina «🎬 Ricette video» con 4 riquadri (PT E69). «2» → cambiare quello che dice.
2. C148 siti: `python3 -I tools/raccogli_stimate.py --creatori` in sottofondo (~1.400 pagine, ~1 s l'una; salva prima una copia di `ricette-stimate.js`); poi conti per creatore, controllo a occhio di 10 ricette, patch, foto. Mela, ecc. sconosciute a `tools/stima.py` scartano molte ricette: valutare sinonimi nuovi in `SINONIMI`/`CODICI`.
3. App: filtro «per creatore o sito» anche in Proteiche (Mario 12/11 18:54); `FONTI_RIC` in `ricettario.js` coi prefissi nuovi `fw`, `fs`, `gh` (sennò la fonte dice «GialloZafferano»!).
4. Altri creatori della tabella #70 (Ricette di Alice, HSN, Sergio Chisari): robots e lettura; poi inglesi (MattsfitChef ecc.) con prova di traduzione e foto.
5. Idee C149 (DOMANDA 1, consiglio 1 e 4) quando Mario risponde.
6. Vecchi: C140 privato (passo di Mario), C143 + kit 38.26 (DOMANDA 1 della #65), pagella C141, Android: schermo intero e zoom del lettore.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 15; 🛑 DOMANDA 2 C149, 🛑 C141, idee C149).

## Ultimo messaggio di Mario
13/11 ~10:09, parola per parola: «palestra pubblica a cosa ti serve saperlo?!?!?» → malinteso: «1 = pubblica» della DOMANDA 2 letto come «palestra pubblica»; domanda riscritta («1 · Mettilo nell'app»), PT E76.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C150; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Alto** (`high`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 09:12 · https://claude.ai/connect-github → GitHub controllato (get_me ok)
- 2026-11-13 09:23 · Rinomina la sessione, rinomina la sessione, rinomina la sessioneeeeeeeeee → rinominata; PT E75
- 2026-11-13 09:32 · [AVVIO] Sessione #70 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → 
- 2026-11-13 09:38 · stai andando bene metti i voti anche fuori in vista prima di entrare valuta se t… → 
- 2026-11-13 09:4x · Le sto facendo cercare a te su Claude perché mi ha consumato un sacco di resourc… → 
- 2026-11-13 09:41 · stai andando bene metti i voti anche fuori in vista prima di entrare valuta se t… → 
- 2026-11-13 09:42 · Le sto facendo cercare a te su Claude perché mi ha consumato un sacco di resourc… → 
- 2026-11-13 09:46 · nel mio utente Mario mette i voti per me invece per monica valuta in modo generi… → 
- 2026-11-13 ~09:50 · nel mio utente Mario mette i voti per me invece per monica valuta in modo generi… → 
- 2026-11-13 09:52 · adesso forse sono o al 12% o 14% di grasso circa → 
- 2026-11-13 09:54 · mi si vedono gli addomina no tutti tranne quelli bassi gli ultimi 2 → 
- 2026-11-13 09:54 · valuta tu la percentuale → stima 11-12 %, consiglio 12
- 2026-11-13 09:55 · palestra pubblica a cosa ti serve saperlo?!?!? → PT E76, DOMANDA 2 riscritta
- 2026-11-13 ~10:00 · adesso forse sono o al [percentuale]% di grasso circa (numero coperto: progetto … → 
- 2026-11-13 ~10:05 · mi si vedono gli addomina no tutti tranne quelli bassi gli ultimi 2 → 
- 2026-11-13 ~10:07 · valuta tu la percentuale → stima 11-12 %, consiglio 12
- 2026-11-13 ~10:09 · palestra pubblica a cosa ti serve saperlo?!?!? (malinteso: «1 = pubblica» della … → 

Ultimo, intero:
> palestra pubblica a cosa ti serve saperlo?!?!?
> (malinteso: «1 = pubblica» della DOMANDA 2 letto come «palestra pubblica»)

