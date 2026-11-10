# Passaggio di consegne

Sessione attuale: #44 (dopo la #43 `session_01WTjqUxpFkSSjXChsysjvPh`, chiusa alla soglia 10/11 12:18; la apre la #43 con `create_session` (catena 1 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 12:20):** 1) vedere la v0.10.4 (🏋️ Proteiche, Ricettario sotto i 4 riquadri) e mandare la foto (riga in «Aspetta Mario»); 2) la fonte RicetteFit.it (C124 passo 8, scelta sua); 3) la chiave GitHub del kit (ha detto sì, guida data); 4) Deepgram provato da lui su Android.

## Stato (10/11 12:18 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta. Le scorte della #43 (`scorta-principale-20261110-01WTjqUxpFkS`) NON vanno unite: il lavoro è già tutto nel ramo.
- v0.10.4 ONLINE se il push del codice è riuscito (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.4; `curl -s …/ricettario.js | grep -c contaRicHome` → ≥1). v0.10.3 (solo server) online alle ~12:00, controllato.
- Valori per porzione: il server rilegge le ricette vecchie 10 ogni 10 minuti (~1300 → circa un giorno). Verifica dalla pagina Database ricette (riquadro «🏋️ Ricette proteiche»: «letti: N, M ancora da leggere») o `{ db: 'stato' }` → `conValori`, `senzaValori`.
- Prove (10/11, Principale 43, sulla v0.10.4): app `python3 -I tools/anteprima.py && node tools/prova.js` → 84 OK, 0 NO (sulla 0.10.4 rifatto in sottofondo prima del push); `node tools/prova-database.mjs` → 105 OK.
- Kit qui 35.0; il 37.2 aspetta la chiave di Mario (riga in «Aspetta Mario»). Preferenze ricevute v37 (più nuove del kit): si aggiorna col kit 37.2. CLAUDE.md ~1459 token (tetto 1000): da accorciare con l'aggiornamento del kit.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- **Piano C124**: `docs/lavori-in-corso/c124-ricettario-proteico.md` (fonti verificate, formato dei valori di GZ, soglie con le fonti, 8 passi).

## Sessione appena chiusa (#43)
- Avvio: unita la scorta della #41 (`01WTjqUxmJ9k`, solo consumi e ULTIMA-RISPOSTA). Nessun messaggio nuovo di Mario in questa sessione.
- C124 v0.10.3 (server): `gz.mjs` `gzNutrizione`/`gzSoloNutr` (proteine dall'HTML `gz-list-macros`, il resto anche dal JSON-LD, mancante = null); `worker.js` colonna `nutr` (1 valori · 0 senza · NULL da leggere), `leggiNutr` 10 per giro (in pausa no), corsia «fit» del motore (`FIT_BASE`, una pagina su 4, `posizioneFit`, `{ db: 'fit', parole | base }`), `scelte()` porta `nutr` al telefono, `statoDb` con `conValori`, `senzaValori`, `paroleFit`, `fitI`, `paginaFit`.
- C124 v0.10.4 (telefono): `ricettario.js` zona «🏋️ Proteiche» (`fitRic`, soglie `opz('fit*')`), `DIFF_RIC` + `ric-diff` (sostituisce «Solo facili»), ordina «💪 Più proteine»/«🔥 Meno calorie», `fonteRic` sulle carte, `valoriRic` e «Fonte · Apri l'originale» nella ricetta, `notaFit`, riquadro «🏋️ Ricette proteiche» nel Database con le parole fit (textarea, salva su change), `ric-salta` diretto (`instant`), `contaRicHome`; `app.js` `ricHome()` sotto i 4 riquadri + icona `libro`; `opzioni.js` 6 soglie `fit*` nel gruppo 'mario' e `filtraImp` protetto (voci senza `parole`); `aiutante.js` voci `ricettario-fit` (ui `ricZona`), `ricettario-diff`, `ricettario-db`; `worker.js` GUIDA e voci dell'AI; `style.css` classi `.ric-home-*`, `.ric-fonte`, `.ric-valori*`, `.ric-nota-fit`; `tools/prova.js` passo autonomo «ricettario C124» (foto 46-48 in /tmp/pit); `tools/prova-database.mjs` prove C124 (corsia fit spenta in testa alle prove vecchie).
- Controllo Da fare: 0 voci aggiunte (nessun messaggio nuovo); C124 aggiornata (manca solo RicetteFit) e riga in «Aspetta Mario» per la foto.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #43 (consegne): `tools/consegne.py fatti` lanciato DUE volte alza il numero di sessione due volte (#45 invece di #44): lanciarlo una volta sola; se serve rifarlo, rimettere a mano «Sessione attuale».
- #43 (prove): un dato di prova senza `v: 4` viene riletto anche da `rileggiSegnate` (C72): le ricette finte delle prove C124 hanno `v: 4`. `SOLO='novit…'` fa fallire «sviluppatore: 7 tocchi» (dipende dai passi prima): serve il giro completo.
- #43 (C124): rileggere i valori con `leggiGz` → NO (chiede anche la pagina del video): basta `paginaGz` + `gzSoloNutr`. Contare i valori con `json_type` su tutto il JSON a ogni `statoDb` → NO (lento): colonna `nutr`.
- #42 (C124): GymBeam come fonte → NO (ricette con le proteine in polvere del negozio). Proteine dal JSON-LD di GZ → NON ci sono: vanno lette dall'HTML (`gz-list-macros`). Chiave del kit su `api.github.com` → NO: lì il proxy usa già l'accesso GitHub della sessione (gh, ricerca); usare `raw.githubusercontent.com` con prefisso «token».
- #42 (C108): prova di Mario «guarda come cliente» → senza la v0.10.2 NON passava da Deepgram (il token è quello del gestore): mai chiedere quella prova su una versione più vecchia.
- #42 (prove): con `SOLO='voce dei clienti'` i passi che dipendono da quelli prima falliscono da soli (stato mancante): il passo nuovo è autonomo; per gli altri vale il giro completo.
- #41 (C123): far «sistemare» al motore le ricette segnate rileggendole → NO da solo: GZ le ridà uguali; serve l'esito salvato nella ricetta. Credito Deepgram «scade dopo un anno» → SBAGLIATO: non scade (PT E48).
- #40 (C119): onnxruntime 1.31.1 → NO, 1.18.0 come Paola. `/api/foto-gz` in GET → NO: rotte POST, solo chi gestisce. `window.Dati` → undefined: `typeof Dati`. Cache `pit-…` → NO, si chiama `foto-ai`.
- #39: `signInWithRedirect` di riserva → NO. AI foto: Swin2SR e Real-ESRGAN x4plus troppo grandi; modelli da Hugging Face → NO (PT E25).
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- C109 (#35): codice scritto PRIMA della scelta di Mario: messo in patch. Prima di codice su una regola nuova, controllare in «Aspetta Mario» se c'è una 🛑 sullo stesso numero.
- C106 (#35): niente `maximum-scale=1` fisso (toglierebbe lo zoom con due dita a tutti).
- C109 (#36): segnalazioni a tutti i gestori → NO, solo a Mario. Raffica e quota con blocco → NO, sempre «modo ridotto» (PT E41).
- C112 (#36): niente correzione automatica dei «pronti» presi da un ordine di prova: Monica tocca «È una prova» o annulla e i pronti tornano (`rimettiPronti`).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).

## Prossimi passi
1. Controlla che la v0.10.4 sia online (riga «Stato»). Se NON lo è (push del codice mancato): giro completo delle prove e push del codice già nel ramo.
2. A Mario i passi della foto C124 (riga in «Aspetta Mario»): chiudi e riapri, Home → «Proteiche», apri una ricetta. Ricordagli che la sezione si riempie in circa un giorno.
3. C124 passo 8: RicetteFit.it come seconda fonte (piano `docs/lavori-in-corso/c124-ricettario-proteico.md`): id `rf:<slug>`, lettore del JSON-LD `Recipe` (passi con foto, `nutrition` completo), segno «RicetteFit» (`FONTI_RIC` in `ricettario.js` c'è già), link all'originale; prima prova dal vivo l'indirizzo (PT E29) e dal sito vero (PT E25).
4. Kit 37.2: quando Mario scrive «chiave pronta», `request_credential` con host `raw.githubusercontent.com`, prefisso `token`, nome «Kit RVC lettura»; poi leggere `docs/kit-progetto/VERSIONE` del repo del kit (ramo `claude/rvc-ramo-definitivo`).
5. «Scrivimi!» sotto gli allergeni: proposto dalla #40, nessuna risposta (non farlo senza sì). Le altre righe di «Aspetta Mario»: aspettare Mario; iPad e iPhone solo quando ne ha uno.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (chiave del kit da creare; fonte fit già scelta: RicetteFit.it).

## Ultimo messaggio di Mario
Nessun messaggio nuovo nella #43 (aperta da Mario col testo [AVVIO]). L'ultimo resta quello qui sotto.
10/11 ~11:40 (in questa chat, dopo l'handoff), parola per parola: «1 consiglio» → fonte fit = RicetteFit.it (riga 🛑 tolta da «Aspetta Mario», piano C124 aggiornato).
10/11 11:32 (scritto nella chat chiusa della #41, girato qui), parola per parola: «non ho ipad e iphone che è quello messo male ho solo android ora è questa è la foto sembra ok ma lo era quasi da sempre ok android».
Prima, 11:25 in questa chat: «controlla tutte / ok github chiave / devo verificare vapore ma per ora ok / devo verificare dopoia richiesta ma per ora ok / proverò ipad ma per ora ok / ok poi dimmi i passi / ipad ok orizzontale / Francesco compare tra i nomi» (con la foto del controllo).
11:20 in questa chat: «Aggiungi al ricettario una voce proteica e cerchi in automatico le ricette per fitness sala pesi con poche calorie e grassi cattivi e con attenzione a sale zucchero ecc ecc insomma ricette gym per aiutare ad asciugarsi ma per migliorare l'ipertrofia / Metti anche filtro per difficoltà e il tasto database quando lo clicco con fare scorrere l'app velocemente giú ma deve andare direttamente, ricettario mettilo un pò piú in vista sembra trascurato sotto poi le ricette di giallo zafferano le segni che sono di giallo e se ne trovi altre ricette esempio per fitness in altre fonti migliori mettile caricate al meglio tutti i passaggi info foto fatte bene ecc ecc e segnami la fonte dove l'hai presa. / migliora ricettario in generale».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C125; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

