# Passaggio di consegne

Sessione attuale: #33 (dopo la #32 `session_01WTjqUx7w6hfTURRcXZ18Ja`, chiusa alla soglia 08/11 16:57; la apre la #32 con `create_session` (catena 7 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (08/11 ~17:00):** 1) secondo gruppo di impostazioni modificabili da Monica + comando vocale che la porta lì e le cambia (Mario «anche secondo gruppo impostazioni e integra con comando vocale», C92); 2) provare v0.9.58 (aiutante «Portami lì» C87, impostazioni C88, panade C86, invito «cucina casalinga»).

## Stato (08/11 16:57 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v0.9.58 (online, sito.yml success su f0884bae). Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"`.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 54 OK, 0 NO + `node tools/prova-impostazioni.js` → 7 OK (08/11 ~16:45). `SOLO=ricettario` NON funziona da solo (serve il giro completo, ~3 minuti). Dal contenitore il sito vero, GialloZafferano e Microsoft sono bloccati (curl 000): esito dei giri con `mcp__github__actions_list` (sito.yml, perPage 1).
- Motore e regole: `npm install`, `npm run prova-firebase` → «88 OK, 0 NO» (07/11 ~17:45); regole non toccate.
- Sito: `python3 -I tools/sito.py` → «OK sito».
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima artefatto: NON si pubblica più (Mario 08/11 «non lo uso più»); `dist/anteprima.html` serve solo alle prove.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#32)
Online v0.9.55-0.9.58 (giro completo verde ogni volta). Unita all'avvio la scorta vecchia della #30 (solo appunti).
- v0.9.55 (C86): piatti a pezzi, dosi per un impasto: `LOTTI_INIZIALI` e `lottoDi` in spesa.js (panade 12), campo `d.lotto` → `SPESA.lotti`; dentro restano per 1 pezzo.
- v0.9.56 (C87): aiutante «Portami lì» in aiutante.js: `DOVE_AI` (voci del piatto, Impostazioni, pagine; `parole` per capire senza AI), `capisciDove` (prima dell'AI; con numeri e voci `azione` decide l'AI), `piattiDetti` (pari punti → «Quale piatto?»), azione `vai` in `controllaAI`, `portaLi`, `bannerAI` (chiamata da render() in app.js) con «Torna all'aiutante»; un solo «vai» → ci va da sola dopo 1,4 s. Idea non fattibile → azione `idea` (WhatsApp a Mario con pagina e versione), anche senza AI. worker.js: azione `vai` nelle istruzioni.
- v0.9.58 (C88): `opzioni.js` (NUOVO, caricato dopo dati.js: index.html, sw.js, tools/anteprima.py, tools/sito.py): `OPZIONI` (14 voci: avviso, giorniChiusi, oraLimite, giorniAvanti, minimo, orari, notaClienti, novitaGiorni, aiClienti, msgAccettato/msgPronto/msgProposta, firma, annullaSecondi), `opz(k)` (valore o quello di base), `valoreOpz`, `testoOpz`, `riempi` ({nome} {n}…), `sezioniOpzioni` in vImpostazioni, ricerca `#cerca-imp` (`filtraImp`, `dopoRenderOpz` in render), `salvaOpz` (campi `o.<k>` in salvaCampo), `AZIONI_OPZ` (aggiunte ad A in fondo ad app.js). Collegate in app.js: giorniPossibili, vMenu (avviso), vCarrello (orari, nota, minimo + invia), waOrdine, mostraToast, novita. Aiutante: `DOVE_AI['opz-<k>']` per ognuna, `controllaAI` azione `impostazione` generica, `datiAI.impostazioniExtra`; worker.js istruzioni. Prova `tools/prova-impostazioni.js` (7). Piano e lotto 2 in `docs/SPEC-IMPOSTAZIONI.md`.
- Invito WhatsApp (app.js ~382): «la mia cucina casalinga» (Mario).
- C89: hook `.claude/hooks/numeri-doppi.py` (PreToolUse Bash, settings.json): prima di un push ferma novità con lo stesso numero in data.js e C doppi in DA-FARE (legge i file com'è adesso). Prova `tools/test-numeri-doppi.py` 4/4. Doppioni sistemati: C84 → C90, C63 → C91.
- Aiuto 4 ha preso 0.9.57 in parallelo: la mia è diventata 0.9.58.

## Strade provate e scartate (perché; così la prossima non le rifà)
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).

## Prossimi passi
1. Avvio: titolo verde ❔; a Mario una riga per riga di «Aspetta Mario».
2. C92 (Mario «anche secondo gruppo impostazioni e integra con comando vocale»): lotto 2 di `docs/SPEC-IMPOSTAZIONI.md` in `opzioni.js`: nomi e ordine delle parti del menù (CATEGORIE: aggiungere «Secondi»), porzioni delle teglie (6/8) e nomi dei formati, reparti della spesa (REPARTI spesa.js), testi dei biglietti e del messaggio d'invito (BIGLIETTI, testoInvito app.js ~382), testo della pausa e saluto nel menù, altro modo di pagare (testo libero). Ogni voce con `parole` (aiutante «Portami lì» e azione `impostazione`, anche a voce: il microfono passa da `inviaAI`). Prova in `tools/prova-impostazioni.js`, giro completo, numero di versione dopo fetch (controllo C89).
3. Teglie al giorno: serve un contatore sul server (documento come `settimane/`): proporlo a Mario, non farlo da sola.
4. Aspettare le prove di Mario (v0.9.58 e le vecchie 👁).
5. Idea non chiesta (dire, non fare): pizzico con due dita in «Sistema la foto».

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
08/11 ~17:00, parola per parola: «anche secondo gruppo impostazioni e integra con comando vocale» (→ C92; ha risposto 1 alla domanda del lotto 2; resta aperta la domanda C89 nel kit).
Prima: «ok pubblica e dimmi quando posso provare»; «Nell'invito su WhatsApp correggi il testo… La mia cucina casalinga… sostituisci solo quel pezzo» (fatto in v0.9.58).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C93; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

