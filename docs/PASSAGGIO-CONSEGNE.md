# Passaggio di consegne

Sessione attuale: #66 (dopo la #65 `session_01WTjqUumr4nH1ZeRWix2tJQ`, chiusa alla soglia 11/11 19:40; la apre la #65 con `create_session` (catena 4 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 #65):** 1) C144 «🎬 Ricette video» (Mario 19:33): sezione a parte coi video-ricette dello youtuber, divise per youtuber (pezzi in `docs/lavori-in-corso/c144-ricette-video.md`); 2) C140 = 3 (privato + PC): aspetta il suo passo 1 (rendere privato, passi mandati) e l'ok per `.claude/`; 3) 🛑 foto della pagella (C141): «1» va bene, «2» cambia; 4) più stimate (298 scartate) dopo il «1».

## Stato (11/11 19:40 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice **0.10.23** (verifica: `grep VERSIONE_APP data.js`; non alzata).
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Giro completo dopo: 95/95 verde (#63).
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %. #65: raccolta rilanciata in sottofondo (log nel contenitore della #65, perso): rilanciarla se serve.
- Giro completo `node tools/prova.js` 95/95 verde nella #63 (due volte, l'ultima con `tools/prova.js` del commit 0a3d2ce0); C142 chiusa (PT E70). Verifica: `node tools/prova.js > f 2>&1; grep -c '^NO' f` → 0 (~4,5 min).
- **C143 difesa pronta ma SPENTA**: `docs/lavori-in-corso/c143-guardia.patch` (guardia: commit/push di file del sito sul ramo senza «[pubblica]» → fermo; 26 prove in `tools/test-guardia.py`, 146/146 verdi). Al «1» di Mario (DOMANDA 2): `git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`, commit, push. Verifica: `git apply --check` della patch passa.
- **C140 = 3** (Mario 19:24): privato + PC di casa, poi GitHub. Passo 1 a Mario (rendere privato, passi in chat 19:30, guida in `docs/GUIDE-GIUSTE.md`); verifica: `gh api -X GET search/repositories -f q='repo:Kur0ChanX/pronti-in-tavola' --jq '.items[0].visibility'` (oggi `public`). Minuti misurati: ~40 al giorno di pubblicazioni → ~1.200 al mese su 2.000 (stima). Piano: `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- **C144 ricette video**: `tools/raccogli_video.py` in commit (201 ricette su 878 video; `--elenco` per controllarle); `ricette-video.js` NON in commit (file del sito). Cache dei video solo nel contenitore: rilanciarlo con `YOUTUBE_API_KEY` (presente nell'ambiente) la rifà. Verifica: `python3 -I tools/raccogli_video.py --elenco | grep -c '  SÌ'`.
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: 38.26 disponibile (ha il caso «casa» per il PC): si aggiorna con l'ok di Mario per `.claude/` (DOMANDA 1 della #65, insieme a C143). Verifica: `cat docs/kit-progetto/VERSIONE`.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#65)
- Avvio; risposta coi numeri veri sulle ricette (207 nuove, YouTube 44 su 878 video); C140 scelta 3: piano, minuti misurati, passo 1 a Mario; DOMANDA 1 (ok `.claude/` per C143 + kit 38.26); C144 piano e `tools/raccogli_video.py`; limiti controllati (file del sito gratis su Cloudflare).

## Sessione prima (#64)
- Orari della #63 corretti (PT E33) e controllo in `consegne.py`; C140 scelta 3 chiesta.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #65: quinta zona «Video» nella griglia delle zone del Ricettario → scartata: la griglia ha 4 colonne (`.ric-zone`), su telefono diventa stretta; meglio un bottone pieno sotto. Pubblicazione sul PC con un lavoro «scegli» su GitHub → nessun risparmio (ogni lavoro costa almeno 1 minuto): resta su GitHub.
- #64: scrivere nei file di questo repo come fa RVC (nomi di file e workflow di RVC) → fermato dal controllo della sessione: il repo è PUBBLICO e RVC è privato; i dettagli di RVC solo in chat.
- #63: C55 da sola → aspettare la fine del «vapore» dell'apertura NON basta (provato): la causa è `#guida`. C143 nei file `.claude/` → bloccato da RVC E59 (serve l'ok scritto di Mario): patch.
- #62: modulo sicuro per la chiave Google (`X-Goog-Api-Key`, anche minuscolo) → rifiutato dal servizio: solo variabile d'ambiente. Pagine dei video YouTube dal contenitore → controllo anti-robot: solo API. Valori di Pietrobon + nostri saturi → tutto scartato: saturi in proporzione ai suoi grassi. Regola stretta di prima sulle stimate → solo 69 su 1.112 candidate.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. C144 pezzo 1 (tool), pezzo 2 (app), pezzo 3 (prova e foto) come in `docs/lavori-in-corso/c144-ricette-video.md` «Stato»: niente commit di `ricette-video.js` né dei `.js` del sito prima del «1» di Mario sulla foto (PT E69: il push pubblica).
2. Mario «fatto» sul passo 1 di C140 → controllo `visibility: private` e che il prossimo giro di `sito.yml` vada; poi il passo 2 (motore sul PC, guida su docs.github.com «Adding self-hosted runners»).
3. DOMANDA 1 «1» → patch C143 (`git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`) e kit 38.26; «2» → niente.
4. Foto della pagella (C141): «1» → v0.10.24 con le novità e più stimate (`tools/stima.py`, ingredienti sconosciuti); «2» → cambiare quello che dice.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 12; 🛑 foto C141). Controllo Da fare: 1 voce aggiunta (C144, Mario 19:33).

## Ultimo messaggio di Mario
11/11 19:33, parola per parola: «mettimi se puoi tutti i video delle ricette dello youtuber e metti le informazioni che hai in una sezione a parte esempio ricette video e dividi per il nome che dici? occupiamo teoppo spazio limiti ecc?» → C144 (risposto: spazio ~100-165 KB, file del sito gratis su Cloudflare; foto prima di pubblicare).
Prima: 19:24 «hai aggiunto le ricette dello youtuber piú tutte quelle dette 500? ricette / 3 secondo me se sei d'accordo» → risposta coi numeri, C140 = 3.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C145; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 19:24 · [AVVIO] Sessione #65 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio; poi messaggio della #64 (19:24): risposta coi numeri delle ricette, C140 = 3 (piano, passo 1, DOMANDA 1)
- 2026-11-11 19:33 · mettimi se puoi tutti i video delle ricette dello youtuber e metti le informazio… → C144 (piano, `tools/raccogli_video.py`, risposta su spazio e limiti)

Ultimo, intero:
> mettimi se puoi tutti i video delle ricette dello youtuber e metti le informazioni che hai in una sezione a parte esempio ricette video e dividi per il nome che dici? occupiamo teoppo spazio limiti ecc?

