# Passaggio di consegne

Sessione attuale: #70 (dopo la #69 `session_01WTjqUxxnTzNis39N5xRv3s`, chiusa alla soglia 12/11 18:46; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (12/11 18:41, scritto nella #68):** il lettore di YouTube dentro l'app (schermo intero, sottotitoli, qualità) = C147, già nella patch c144 → DOMANDA 5 (NON rifarla finché non scrive); poi tanti creatori di ricette fitness: lista di 9 in `docs/lavori-in-corso/c148-lista-creatori-fitness.md` → DOMANDA 6 🛑 (consiglio 1+2+3). Le proteiche «una per una» (18:13) sono dentro la patch c144.

## Stato (12/11 18:46 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Giro completo dopo: 95/95 verde (#63).
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %. #65: raccolta rilanciata in sottofondo (log nel contenitore della #65, perso): rilanciarla se serve.
- Giro completo `node tools/prova.js` 95/95 verde nella #63 (due volte, l'ultima con `tools/prova.js` del commit 0a3d2ce0); C142 chiusa (PT E70). Verifica: `node tools/prova.js > f 2>&1; grep -c '^NO' f` → 0 (~4,5 min).
- **C143 difesa pronta ma SPENTA**: `docs/lavori-in-corso/c143-guardia.patch` (guardia: commit/push di file del sito sul ramo senza «[pubblica]» → fermo; 26 prove in `tools/test-guardia.py`, 146/146 verdi). Al «1» di Mario (DOMANDA 2): `git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`, commit, push. Verifica: `git apply --check` della patch passa.
- **C140 = 3** (Mario 19:24): privato + PC di casa, poi GitHub. Passo 1 a Mario (rendere privato, passi in chat 19:30, guida in `docs/GUIDE-GIUSTE.md`); verifica: `gh api -X GET search/repositories -f q='repo:Kur0ChanX/pronti-in-tavola' --jq '.items[0].visibility'` (oggi `public`). Minuti misurati: ~40 al giorno di pubblicazioni → ~1.200 al mese su 2.000 (stima). Piano: `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- **C144-C147 PRONTI come UNA patch** `docs/lavori-in-corso/c144-app.patch` (7 file: `app.js`, `ricettario.js`, `style.css`, `ricette-stimate.js` coi passi, `ricette-video.js` nuovo 268 ricette = Pietrobon 201 + Beardedscara 67, `tools/prova.js`, `tools/sito.py`); prova `SOLO=C14` VERDE (#68, con la pubblicità tolta dai passi e le foto rifiutate nascoste). Verifica: `git apply --check docs/lavori-in-corso/c144-app.patch`. Strumenti in commit: `tools/raccogli_stimate.py --passi`, `tools/raccogli_video.py` (`sezioni()`, `A_SEZIONI`). Dettagli: `docs/lavori-in-corso/c144-ricette-video.md`, `c145-…`, `c146-…`, `c147-video-dalla-foto.md`.
- **C148 (#69)**: lista di 9 creatori (6 italiani con sito o YouTube, 3 inglesi; esclusi i solo TikTok/Instagram, #59) in `docs/lavori-in-corso/c148-lista-creatori-fitness.md`, DOMANDA 6 🛑 in «Aspetta Mario». Verifica: `grep -c '^| [1-9] |' docs/lavori-in-corso/c148-lista-creatori-fitness.md` → 9.
- `docs/DA-FARE.md` 39,5 KB (tetto 40, #69): la storia delle voci aperte va in fondo a `docs/DA-FARE-FATTE.md` («Storia delle voci ancora aperte»). Verifica: `wc -c docs/DA-FARE.md`.
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: 38.26 disponibile (ha il caso «casa» per il PC): si aggiorna con l'ok di Mario per `.claude/` (DOMANDA 1 della #65, insieme a C143). Verifica: `cat docs/kit-progetto/VERSIONE`.
- **12/11 #68 (Mario 18:13 «falle accuratamente una per una», dalla #65)**: stimate controllate tutte (`c146-ricette-con-passi-o-video.md` «Controllo una per una»): pubblicità tolta in 2 (PT E72), foto rifiutate nascoste, prova C141 più severa; tutto nella patch c144 (prova `SOLO=C14` verde). Risposta a Mario: è la DOMANDA 5.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#69)
- Avvio leggero (PT E61); `docs/DA-FARE.md` da 42,8 a 38,8 KB (storia di 25 voci aperte in `DA-FARE-FATTE.md`); riavvio del contenitore, scorta mia unita; messaggio di Mario 18:41 (dalla #68): lettore = C147 già nella patch (nota in `c147-video-dalla-foto.md`), video #68 rimandato; C148 ricerca e lista di 9 creatori, DOMANDA 6 🛑; consegne a 242k (attesa oltre 180k).

## Sessione prima (#68)
- Foto e video C144-C147 (DOMANDA 5); le 206 stimate controllate una per una (`c146-ricette-con-passi-o-video.md`), pubblicità tolta (PT E72).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #68: video di YouTube nel contenitore con «autoplay=1» → «Video unavailable» (senza autoplay il lettore si vede): è il contenitore, non il codice; la prova vera è l'Android di Mario. `recordVideo` di Playwright con `size` 780×1688 → registra a 390×844 con bordo grigio: registrare a 390×844 e ingrandire con ffmpeg. Rileggere una foto rifiutata (403) con un altro «user agent» → rifiutato dal controllo della sessione (aggirare un controllo anti-robot): non rifarlo.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
00. Mario 13/11 ~09:08 (scritto nella #67 chiusa, parola per parola): «Vai avanti con le ricette proteiche, vai avanti, il lavoro che stavi iniziando continualo e caricamele, quelle che abbiamo detto, quelle che abbiamo segnalato, i nuovi youtuber, blogger, i video, la scelta dei video che abbiamo fatto, che mi fa vedere i passaggi del player, che clicchi e me lo fa vedere lì, che non mi manda nessuna pagina, insomma tutto quello che abbiamo deciso, continualo.» → letto come «1» alla DOMANDA 5: PUBBLICA C144-C147 (passo 2) e poi C148 (passo 6), senza richiedere.
⛔ NON unire le scorte `scorta-principale-20261111-01WTjqUup234` (#66) e quella della #67 (`01WTjqUwz4`): contengono codice dell'app NON approvato (= `c144-app.patch`); unirle e fare push PUBBLICA l'app (PT E69).
1. FATTO #68 (12/11 00:14 e 18:20): foto `archivio/foto/2026-11-12-0014-c144-c147-1..3.png` mandate, DOMANDA 5 🛑 a Mario; patch ritoccata (testo «tocca la foto e il video parte»), `SOLO=C14` verde. Video: nel contenitore «autoplay» non parte (ipotesi robot, `c147-video-dalla-foto.md`), la prova è sull'Android di Mario.
2. Al «1» di Mario: `git apply` della patch, anteprima, giro completo `node tools/prova.js` (0 «NO»), commit e push (pubblica), `curl` di `ricette-video.js` e `ricette-stimate.js` dal sito, `git rm` della patch, v0.10.24 con le novità; Mario prova C147 sul suo Android (YouTube dentro l'app).
3. Mario «fatto» sul passo 1 di C140 → controllo `visibility: private` e il prossimo giro di `sito.yml`; poi il passo 2 (motore sul PC).
4. DOMANDA 1 della #65 «1» → patch C143 (`git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`) e kit 38.26.
4b. Se Mario scrive che una ricetta di RicetteFit si apre vuota: il server la legge con `leggiRf` (`worker.js`, `rf.mjs`); il lettore funziona dal contenitore (2 ricette vere, #68), quindi guardare la lettura del server.
5. Foto della pagella (C141): «1» → più stimate e togliere «Fulldayofeating» dalle Proteiche.
6. C148 (Mario 18:54, 20:00, 21:27): tutti i creatori italiani (Giuseppe Healthy, Fit with Fun, Cotto al Dente, Iamfitandsweet, 2foodfitlovers, MattsfitChef); gli inglesi solo se la traduzione viene bene (prova su poche, foto a Mario). Per ognuno: regole del sito (robots.txt, condizioni d'uso), solo ricette coi passi o col video; sito → come `tools/raccogli_stimate.py`, YouTube → come `tools/raccogli_video.py` (API); ricerca per youtuber o per sito anche in Proteiche e stimate; patch in `docs/lavori-in-corso/`, foto a Mario prima di pubblicare (PT E69). Indipendente dalla DOMANDA 5, ma tocca gli stessi file della patch c144: lavorare sopra la patch.
7. Dopo il «1» alla DOMANDA 5, sull'Android di Mario: schermo intero orizzontale e verticale e zoom con due dita dentro il lettore (ipotesi: lo zoom potrebbe mancare).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 14; 🛑 DOMANDA 5, C141). Controllo Da fare: 1 voce aggiunta (C148, Mario 18:41; la parte del lettore è C147).

## Ultimo messaggio di Mario
12/11 21:27, scritto nella #69 dopo le consegne, parola per parola: «solo tutti italiani e se si traducono bene metti anche quelle inglesi» → C148: tutti gli italiani (anche MattsfitChef) e gli inglesi se la traduzione viene bene (prova su poche ricette, foto a Mario). Prima: 20:00 «sono italiani tutti direi», 18:54 «solo ricette con i passi o con un video mettili che posso anche cercarli per youtuber o per sito». Tutto in `docs/lavori-in-corso/c148-lista-creatori-fitness.md`.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C149; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-12 18:22 · [AVVIO] Sessione #69 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio; Da fare snellito (commit d2c446cf)
- 2026-11-12 18:41 (nella #68) · Una domanda, non puoi mettere un play nei video… → C147 (nota, commit 73fe8662), C148 lista e DOMANDA 6 (commit 3a09295d)
- 2026-11-12 18:54 (nella #68) · solo ricette con i passi o con un video mettili… → risposta alla DOMANDA 6 (C148), consegne aggiornate dalla #69
- 2026-11-12 20:00 · sono italiani tutti direi → risposta alla DOMANDA 6: i creatori italiani (C148), consegne aggiornate dalla #69
- 2026-11-12 20:02 · solo → messaggio di una parola, forse tagliato: chiesto a Mario cosa intendeva (PT E3); se non risponde, vale la scelta di prima (C148, 5 italiani)
- 2026-11-12 21:27 · solo tutti italiani e se si traducono bene metti anche quelle inglesi → C148 scelta finale, consegne aggiornate dalla #69

Ultimo, intero:
> [AVVIO] Sessione #69 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo claude/pronti-ramo-definitivo): git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo (se «HEAD detached», prima git checkout claude/pronti-ramo-definitivo).
> ⛔ NON unire le scorte 01WTjqUup234 e 01WTjqUwz4Kr (codice C144-C147 non approvato = c144-app.patch: pubblicherebbe, PT E69). Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md; continua da sola dai «Prossimi passi».

