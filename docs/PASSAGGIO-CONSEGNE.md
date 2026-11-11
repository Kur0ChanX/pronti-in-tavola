# Passaggio di consegne

Sessione attuale: #63 (dopo la #62 `session_01WTjqUu7eADM6beo2ANa1vf`, chiusa 11/11 ~19:50 in attesa delle foto, oltre 180k; la apre la #62 con `create_session` (catena 2 di 8)). La #61 `session_01WTjqUuVtcnfLTgQuLpg3Qb` si è fermata senza consegne (C141 passato alla #62, tutto su GitHub).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 #62):** 1) 🛑 risposta sulle foto della pagella (C141, già ONLINE per errore, PT E69): «1» = va bene, «2» = cosa cambiare; 2) più ricette proteiche (soprattutto dolci) coi valori stimati; 3) C140 giri casa → Blacksmith → GitHub. Pietrobon: RISOLTO (chiave YouTube, 44 sue ricette dentro).

## Stato (11/11 ~19:50 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta. Versione nel codice ancora **0.10.23** (NON alzata).
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Prove del ricettario verdi in locale (`SOLO='ricettario C1[234]'` 7/7); giro completo locale lanciato 19:35 (37 OK, nessun NO a metà): la #63 lo rifà con `node tools/prova.js` e scrive l'esito.
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %.
- Prova C55 rossa da sola E nel giro? (#57 diceva verde nel giro): C142.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto, non urgente.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#62)
- Chiave YouTube (modulo sicuro rifiuta `X-Goog-Api-Key` → variabile d'ambiente, PT E68); C141 pezzo 3 (YouTube con API, correzioni della stima) e, su «carta bianca» di Mario, regola larga + pagella + 207 stimate nell'app. PT E69 (pubblicato senza ok). C142 (prova C55).

## Sessione prima (#61)
- C141 specifica, tabella CREA (832 alimenti), `stima.py` (errore mediano 8-9 %), `raccogli_stimate.py`; ferma per la chiave YouTube.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #62: modulo sicuro per la chiave Google (`X-Goog-Api-Key`, anche minuscolo) → rifiutato dal servizio: solo variabile d'ambiente. Pagine dei video YouTube dal contenitore → controllo anti-robot: solo API. Valori di Pietrobon + nostri saturi → tutto scartato: saturi in proporzione ai suoi grassi. Regola stretta di prima sulle stimate → solo 69 su 1.112 candidate.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
0. Avvio: giro completo `node tools/prova.js` in sottofondo (il sito ha già il C141): rosso → correggere SUBITO (è online).
1. Alla risposta di Mario sulle foto: «1» → alzare la versione a 0.10.24 con le novità (skill `pr`), chiudere C141 alla sua foto dall'app; «2» → cambiare quello che dice.
2. Più stimate: insegnare a `tools/stima.py` gli ingredienti sconosciuti più frequenti (lista: `stima_ricetta` → dettagli «alimento?»), poi rilanciare la raccolta.
3. C142 prova C55; C140 alla risposta sul motore di casa.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (la 🛑 nuova: foto C141). Controllo Da fare: 1 voce aggiunta (C142); le richieste della #62 sono in C141.

## Ultimo messaggio di Mario
11/11 ~18:22, parola per parola: «nelle ricette aggiungile tutte quante e metti un voto o fammi capire ler ricetta quanto è proteica calorica grassa zuccheri sale ecc ecc con i voti o inventati tu qualcosa di migliore ti dò carta bianca fai passare tutte le ricette proteiche» → C141 regola larga + pagella + stimate (online), foto mandate, DOMANDA 1 (🛑).
Prima: 18:04 «ok vai avanti allora» → C141 pezzo 3; 17:44-17:53 chiave YouTube («chiave», «sono al pc», «la metto nel'ambiente», «fatto») → variabile `YOUTUBE_API_KEY`, provata.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C143; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 17:44 · chiave → C141 chiave YouTube (PT E68)
- 2026-11-11 17:47 · chiave sono al pc → chiave YouTube, variabile d'ambiente
- 2026-11-11 17:48 · sono al pc fammi incollarew la chiave → chiave YouTube, variabile d'ambiente
- 2026-11-11 17:49 · riprova → chiave YouTube, variabile d'ambiente
- 2026-11-11 17:50 · la metto nel'ambiente → chiave YouTube, variabile d'ambiente
- 2026-11-11 17:52 · fatto → variabile salvata e provata
- 2026-11-11 17:52 · nell'ambiente pronti in tavola → chiave YouTube, variabile d'ambiente
- 2026-11-11 17:53 · fatto → variabile salvata e provata
- 2026-11-11 18:04 · ok vai avanti allora → C141 pezzo 3
- 2026-11-11 18:22 · nelle ricette aggiungile tutte quante e metti un voto o fammi capire ler ricetta… → 

Ultimo, intero:
> nelle ricette aggiungile tutte quante e metti un voto o fammi capire ler ricetta quanto è proteica calorica grassa zuccheri sale ecc ecc con i voti o inventati tu qualcosa di migliore ti dò carta bianca fai passare tutte le ricette proteiche

