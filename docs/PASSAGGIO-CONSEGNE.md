# Passaggio di consegne

Sessione attuale: #67 (dopo la #66 `session_01WTjqUup234iNMuPGR7huag`, chiusa alla soglia 11/11 19:57; la apre la #66 con `create_session` (catena 5 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 #66):** 1) 🛑 foto di C144 «🎬 Ricette video» (mandate 19:57): «1» → patch, giro completo, pubblicazione; «2» → cambiare; 2) C140 = 3: aspetta il suo passo 1 (rendere privato) e l'ok per `.claude/` (DOMANDA 1 della #65); 3) 🛑 foto della pagella (C141); 4) più stimate dopo il «1».

## Stato (11/11 19:57 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice **0.10.23** (verifica: `grep VERSIONE_APP data.js`; non alzata). Scorta della #66 = solo copia automatica del ramo (non unire).
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Giro completo dopo: 95/95 verde (#63).
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %. #65: raccolta rilanciata in sottofondo (log nel contenitore della #65, perso): rilanciarla se serve.
- Giro completo `node tools/prova.js` 95/95 verde nella #63 (due volte, l'ultima con `tools/prova.js` del commit 0a3d2ce0); C142 chiusa (PT E70). Verifica: `node tools/prova.js > f 2>&1; grep -c '^NO' f` → 0 (~4,5 min).
- **C143 difesa pronta ma SPENTA**: `docs/lavori-in-corso/c143-guardia.patch` (guardia: commit/push di file del sito sul ramo senza «[pubblica]» → fermo; 26 prove in `tools/test-guardia.py`, 146/146 verdi). Al «1» di Mario (DOMANDA 2): `git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`, commit, push. Verifica: `git apply --check` della patch passa.
- **C140 = 3** (Mario 19:24): privato + PC di casa, poi GitHub. Passo 1 a Mario (rendere privato, passi in chat 19:30, guida in `docs/GUIDE-GIUSTE.md`); verifica: `gh api -X GET search/repositories -f q='repo:Kur0ChanX/pronti-in-tavola' --jq '.items[0].visibility'` (oggi `public`). Minuti misurati: ~40 al giorno di pubblicazioni → ~1.200 al mese su 2.000 (stima). Piano: `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- **C144 ricette video**: tool in commit (`tools/raccogli_video.py`: 201 ricette, 133 coi suoi valori, 43 stimate, 42 anche in Proteiche); app PRONTA come patch `docs/lavori-in-corso/c144-app.patch` (anche `ricette-video.js` e la prova C144), prova `SOLO=C144` verde, foto `archivio/foto/2026-11-11-1956-c144-ricette-video-1..4.png` mandate. Verifica: `git apply --check docs/lavori-in-corso/c144-app.patch`. Passi al «1» in `docs/lavori-in-corso/c144-ricette-video.md` «Stato».
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: 38.26 disponibile (ha il caso «casa» per il PC): si aggiorna con l'ok di Mario per `.claude/` (DOMANDA 1 della #65, insieme a C143). Verifica: `cat docs/kit-progetto/VERSIONE`.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#66)
- Avvio; C144 pezzo 1 (tool: tipi dal titolo, nomi chiari, porzioni, grassi giusti, doppioni), pezzo 2 (app, patch), pezzo 3 (prova verde, 4 foto, 🛑 domanda a Mario); PT E71 (dentro E58).

## Sessione prima (#65)
- Avvio; risposta coi numeri veri sulle ricette (207 nuove, YouTube 44 su 878 video); C140 scelta 3: piano, minuti misurati, passo 1 a Mario; DOMANDA 1 (ok `.claude/` per C143 + kit 38.26); C144 piano e `tools/raccogli_video.py`; limiti controllati (file del sito gratis su Cloudflare).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #66: video DENTRO l'app (iframe YouTube) → scartato: più rischi su iPhone e senza rete; link a YouTube (si apre la sua app). `ricette-video.js` nel GUSCIO di `sw.js` → no: solo chi gestisce lo usa (come `ricette-stimate.js`). Chip dei tipi a due righe (numero sotto) → 6 righe di bottoni: ora «Pancake · 50» su una riga.
- #65: quinta zona «Video» nella griglia delle zone del Ricettario → scartata: la griglia ha 4 colonne (`.ric-zone`), su telefono diventa stretta; meglio un bottone pieno sotto. Pubblicazione sul PC con un lavoro «scegli» su GitHub → nessun risparmio (ogni lavoro costa almeno 1 minuto): resta su GitHub.
- #64: scrivere nei file di questo repo come fa RVC (nomi di file e workflow di RVC) → fermato dal controllo della sessione: il repo è PUBBLICO e RVC è privato; i dettagli di RVC solo in chat.
- #63: C55 da sola → aspettare la fine del «vapore» dell'apertura NON basta (provato): la causa è `#guida`. C143 nei file `.claude/` → bloccato da RVC E59 (serve l'ok scritto di Mario): patch.
- #62: modulo sicuro per la chiave Google (`X-Goog-Api-Key`, anche minuscolo) → rifiutato dal servizio: solo variabile d'ambiente. Pagine dei video YouTube dal contenitore → controllo anti-robot: solo API. Valori di Pietrobon + nostri saturi → tutto scartato: saturi in proporzione ai suoi grassi. Regola stretta di prima sulle stimate → solo 69 su 1.112 candidate.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
0. Consegne FERME alla fase 4 (`consegne.py controlla`: «scorta non unita» FALSO; la scorta della #66 ha il codice C144 = patch, 6 file su 6 identici, controllato in una copia di lavoro). DOMANDA 2 a Mario: «1/vai» → la #66 apre la #67 con `create_session`; «2» → la #66 pubblica al «1» delle foto e poi passa. DOMANDA 3: «1» → `tools/consegne.py`: una scorta i cui file diversi sono uguali a HEAD + una patch di `docs/lavori-in-corso/` conta come salvata (prova nuova).
1. 🛑 Mario risponde sulle foto C144: «1» → `git apply docs/lavori-in-corso/c144-app.patch`, `python3 -I tools/anteprima.py`, giro completo `node tools/prova.js` (0 «NO»), commit e push (pubblica), `curl` di `ricette-video.js` dal sito, `git rm` della patch, v0.10.24 con le novità; «2» → cambiare quello che dice, nuove foto.
2. Mario «fatto» sul passo 1 di C140 → controllo `visibility: private` e il prossimo giro di `sito.yml`; poi il passo 2 (motore sul PC, guida su docs.github.com «Adding self-hosted runners»).
3. DOMANDA 1 della #65 «1» → patch C143 (`git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`) e kit 38.26.
4. Foto della pagella (C141): «1» → più stimate (`tools/stima.py`, ingredienti sconosciuti) e togliere «Fulldayofeating» dalle Proteiche (giornata di pasti, non ricetta); «2» → cambiare.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 13; 🛑 foto C144 e C141). Controllo Da fare: 0 voci aggiunte (nessun messaggio nuovo di Mario nella #66).

## Ultimo messaggio di Mario
11/11 19:33, parola per parola: «mettimi se puoi tutti i video delle ricette dello youtuber e metti le informazioni che hai in una sezione a parte esempio ricette video e dividi per il nome che dici? occupiamo teoppo spazio limiti ecc?» → C144 (risposto: spazio ~100-165 KB, file del sito gratis su Cloudflare; foto prima di pubblicare).
Prima: 19:24 «hai aggiunto le ricette dello youtuber piú tutte quelle dette 500? ricette / 3 secondo me se sei d'accordo» → risposta coi numeri, C140 = 3.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C145; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 19:42 · [AVVIO] Sessione #66 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio; C144 pezzi 1-3 (commit 0980c080, 8df758ba)

Ultimo, intero:
> [AVVIO] Sessione #66 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo claude/pronti-ramo-definitivo): git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo (se «HEAD detached», prima git checkout claude/pronti-ramo-definitivo).
> Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md; continua da sola dai «Prossimi passi».

