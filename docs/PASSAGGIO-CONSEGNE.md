# Passaggio di consegne

Sessione attuale: #75 (dopo la #74 `session_01WTjqUw4QVbXHnpAg1txmfs`, chiusa alla soglia 13/11 13:09; la apre la #74 con `create_session` (catena 5 di 8)).

**#75 aperta dalla #74 (13/11 ~13:10, ferma ad aspettare Mario oltre 180k, C455).** C151 PRONTA, NON online: riordino del Ricettario + sezione «💡 Consigli, allenamenti e altro» (18 video non ricette). Foto mandate, DOMANDA 🛑 (1 = metti online · 2 = cambia).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11, #74):** Ricettario chiaro (12:50 «3000 tastine… non si capisce nulla»), niente video non ricette fra le ricette (12:53 «è uno scherzo?»; 12:54 «cose utili… lasciale… una sezione a parte»); altre ricette (13:0x «hai altre ricette da aggiungere?»).

## Stato (13/11 13:09 ora italiana)
- **C151 pronta, NON online** (PT E69): patch `docs/lavori-in-corso/c151-app.patch` (`ricettario.js`, `style.css`, `ricette-video.js`; verifica: `git apply --check` passa). Prove `tools/prova.js` già aggiornate e committate (helper `apriFiltri`, `clic` apre il pannello). SOLO=ricett 17/17 verde nella #74; giro completo NON ancora fatto con la patch. Foto: `archivio/foto/2026-11-13-c151-*.png` (script `/tmp` perso: rifarlo se servono foto nuove). Video non ricette: `tools/dati/video-non-ricette.json` (18, letti a occhio), `raccogli_video.py` `segna_altro` + `ATTREZZI` li segna «altro» (non scarta).
- Al «1» di Mario: `git apply docs/lavori-in-corso/c151-app.patch`, `python3 -I tools/anteprima.py`, giro completo `node tools/prova.js` (0 «NO»), versione 0.10.27 in `data.js` (VERSIONE_APP + NOVITA: riordino Ricettario, ricerca in tutte, sezione Consigli), commit `[pubblica]`, push, `curl` del sito, patch tolta, 👁 C151 a Mario.
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUw4QVb/claude/pronti-ramo-definitivo.
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Giro completo dopo: 95/95 verde (#63).
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %. #65: raccolta rilanciata in sottofondo (log nel contenitore della #65, perso): rilanciarla se serve.
- Giro completo `node tools/prova.js` 97/97 verde nella #71 (con la v0.10.25). Verifica: `node tools/prova.js > f 2>&1; grep -c '^NO' f` → 0 (~5 min).
- **C143 difesa pronta ma SPENTA**: `docs/lavori-in-corso/c143-guardia.patch` (guardia: commit/push di file del sito sul ramo senza «[pubblica]» → fermo; 26 prove in `tools/test-guardia.py`, 146/146 verdi). Al «1» di Mario (DOMANDA 2): `git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`, commit, push. Verifica: `git apply --check` della patch passa.
- **C140 = 3** (Mario 19:24): privato + PC di casa, poi GitHub. Passo 1 a Mario (rendere privato, passi in chat 19:30, guida in `docs/GUIDE-GIUSTE.md`); verifica: `gh api -X GET search/repositories -f q='repo:Kur0ChanX/pronti-in-tavola' --jq '.items[0].visibility'` (oggi `public`). Minuti misurati: ~40 al giorno di pubblicazioni → ~1.200 al mese su 2.000 (stima). Piano: `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- **v0.10.24 ONLINE (#70)**: C144-C147 (268 ricette video, passi, video dentro l'app) + voce `ricettario-video` dell'aiutante; giro 96/96. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"`.
- **C150 ricette dal parlato (ONLINE v0.10.26, 12 con dosi)**: `tools/trascrivi_video.py` (Flash dal più nuovo; 503 → riprova poi il successivo; 429 al minuto → aspetta, al giorno → successivo; 404 → via; valori MAI dal video; campo `dubbi`; nome del piatto) → `tools/dati/video-dal-parlato.json` (20 fatti; testo intero solo in `.cache-stime/gemini/`). Nuove nell'app a ogni versione: `python3 -I tools/raccogli_video.py --parlato-su ricette-video.js`. Limite gratis ~20 video al giorno per modello, azzerato alle 9:00 italiane; 13/11 finito su tutti (3.8, 3.7, 3.6, 3.5). Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricette-video.js | grep -c parlato`.
- **v0.10.25 ONLINE (#71)**: C149 voto palestra su ogni carta + profilo palestra di Mario, C148 «Da chi» in Proteiche (`chiRic`, `f.chi` 'A|B') e `FONTI_RIC` con `fw`/`fs`/`gh`; giro locale 97/97. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.25.
- **C148 ONLINE v0.10.26**: `ricette-stimate.js` 522 (Fit with Fun 241, Giuseppe Healthy 56, Iamfitandsweet 19), `ricette-video.js` 798 (Cotto al Dente 52, 2foodfitlovers 477). Verifica sul sito vero (#73): 798 video, 12 «parlato», 241 Fit with Fun.
- `docs/DA-FARE.md` 39,5 KB (tetto 40, #69): la storia delle voci aperte va in fondo a `docs/DA-FARE-FATTE.md` («Storia delle voci ancora aperte»). Verifica: `wc -c docs/DA-FARE.md`.
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: 38.26 disponibile (ha il caso «casa» per il PC): si aggiorna con l'ok di Mario per `.claude/` (DOMANDA 1 della #65, insieme a C143). Verifica: `cat docs/kit-progetto/VERSIONE`.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#74)
- Avvio, sveglia C150 rifatta (`trig_01JKS2CJhRPjxHBXxR1GXhxu`, 14/11 9:10). Foto di Mario: v0.10.26 online, «Ricette video (798)» ✅, ma «cloud bread» 0 in Proteiche (ricerca solo nella scheda accesa) → C151.
- PT E78 (video di allenamento fra le ricette). Prima tolto il video e preparata v0.10.27 (giro 98/98 verde), poi annullata per «lasciale… sezione a parte».
- Controllo Da fare: 1 voce aggiunta (C151).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #72: **Flash-Lite** per trascrivere (500 al giorno gratis) → no: meno preciso, crema di riso contata due volte; Mario «il lite fà un pò schifo». **Gemini Omni** (`gemini-omni-1.2-flash`) → no: CREA video, niente generateContent né piano gratis. **gemini-2.5-flash** → 404 per gli utenti nuovi dall'11/11. Valori nutrizionali detti nel video → no: 2 su 3 sbagliati, si stimano dalle dosi. `--finto` scriveva nella cache vera → corretto.
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Risposta di Mario alla DOMANDA C151 (foto 1-4): «1» → passi in «Stato»; «2» → cambi chiesti, foto nuove.
2. Poi «altre ricette» (risposta a Mario #74): prima le ~300 scartate da `tools/stima.py` (ingredienti sconosciuti), poi Ricette di Alice, HSN, Sergio Chisari.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67) e `01WTjqUvtoJC` (#70): vecchie (C148 ormai online).
3. Foto di v0.10.26 (C148, C150): «798» visto da Mario 12:49; «🎙️ dosi» da vedere dopo C151 (cloud bread si trova). Poi chiudere le 👁. Era: quando Mario manda la foto di v0.10.26 (Ricette video con Cotto al Dente e 2foodfitlovers, «Cloud bread» con «🎙️ dosi dal video»): chiudere le 👁 di C148 e C150 se va bene; se Mario scrive altro, prima quello.
4. Ogni mattina dopo le 9:00 (limite azzerato): `python3 -I tools/trascrivi_video.py --da ricette-video.js` in sottofondo (C148 ormai nel file: niente patch); controllo a occhio a campione e delle righe `dubbi`; commit del json. Sveglia `send_later` 14/11 9:10 (`trig_01JKS2CJhRPjxHBXxR1GXhxu`, della #74; quella della #73 cancellata): rifarla ogni giorno.
5. A fine giro: rifare i primi video senza «nome» (togliere le loro voci senza nome dal json e rilanciare), poi nuove versioni coi video trascritti.
6. Altri creatori della tabella #70 (Ricette di Alice, HSN, Sergio Chisari); idee C149 quando Mario risponde. Vecchi: C140 privato, C143 + kit 38.26, pagella C141, Android schermo intero.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 16; 🛑 C148+C150 online, 🛑 C150 foto, 🛑 C141 pagella, idee C149).

## Ultimo messaggio di Mario
13/11 ~13:00 (ora a mano: arrivato a metà turno), parola per parola: «hai altre ricette da aggiungere?» → risposta in chat (tabella: ~450 RicetteFit dal server, ~300 scartate da `stima.py`, 3 creatori, dosi dei video ogni mattina; consiglio: prima C151, poi le 300, poi i creatori). Prima, 12:53 «è uno scherzo verooooooo????» e 12:54 «magari cose utili cosí lasciale visto che c'è ma una sezione a parte» → C151.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C152; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 11:52 · [AVVIO] Sessione #74 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → 
- 2026-11-13 12:50 · riordina la pagina oltre a non trovare nulla c'è un casino in questa pagina 3000… → 
- 2026-11-13 12:53 · è uno scherzo verooooooo???? → 
- 2026-11-13 12:55 · magari cose utili cosí lasciale visto che c'è ma una sezione a parte → 
- 2026-11-13 12:57 · hai altre ricette da aggiungere? → 

Ultimo, intero:
> hai altre ricette da aggiungere?

