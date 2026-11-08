# Passaggio di consegne

Sessione attuale: #29 (dopo la #28 `session_01WTjqUwVMfqBTtDMBndT5KS`, chiusa alla soglia 08/11 11:34; la apre la #28 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (08/11 ~11:35):** 1) **la voce Paola sul telefono**: v0.9.32 corregge lo scarico dal sito vero (Hugging Face rifiutava la provenienza *.workers.dev → `referrerPolicy: 'no-referrer'` in `voce-piper.js`), provato dal vivo sul sito vero con Playwright: aspetta la prova di Mario sul telefono; 2) voci tutte uguali = Microsoft giù (403, lasciapassare v1); il v2 lo blocca la guardia della sessione (2 volte, «Bot Check Circumvention»): domanda in «Aspetta Mario»; 3) «🗄 Il mio database» in vista nel Ricettario (v0.9.30, fatto); 4) Mario ha dato l'ok scritto (08/11 ~11:36 «ok per pronti in tavola») al controllo automatico dei comandi raggruppati (hook in `.claude/`, avvisa dopo 4 comandi piccoli di fila, non blocca mai): C64.

## Stato (08/11 11:34 ora italiana)
- Ramo comune ≠ origin: PUSH DA FARE (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261108-01WTjqUwVMfq/claude/pronti-ramo-definitivo.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 47 OK, 0 NO (08/11 ~09:00). `SOLO=ricettario` NON funziona da solo (serve il giro completo, ~3 minuti). Dal contenitore il sito vero, GialloZafferano e Microsoft sono bloccati (curl 000): esito dei giri con `mcp__github__actions_list` (sito.yml, perPage 1).
- Motore e regole: `npm install`, `npm run prova-firebase` → «88 OK, 0 NO» (07/11 ~17:45); regole non toccate.
- Sito: `python3 -I tools/sito.py` → «OK sito».
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima artefatto: NON si pubblica più (Mario 08/11 «non lo uso più»); `dist/anteprima.html` serve solo alle prove.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#28)
Aperta dalla #27 (catena 3). Versioni online v0.9.28 → v0.9.32 (sito si pubblica da solo a ogni push): v0.9.28 ▶️ legge da sola (`ric-play` in ricettario.js, `c.leggi`); prove del ricettario sistemate (guardia 120 s per passo in `tools/prova.js`; il blocco era la coda delle voci); v0.9.29 Piper/Kokoro collegati (`motoreLocale`, `parlaLocale`, `ripiegoVoce` in aiutante.js; `vociLocaleRiga`, `ric-voce-scarica` in ricettario.js; file in index.html, sw.js, tools/anteprima.py, tools/sito.py); v0.9.30 `riquadroDb()` nel Ricettario; v0.9.31 voce automatica (`VOCE_AUTO = 'piper:paola'`, `MOTORI_VOCE = ['piper']`, `voceAutomatica()`); v0.9.32 scarico dal sito vero. Chat parallela Aiuto 1 (aperta da Mario, chiusa alla soglia): numerino della versione con `ORE_NOVITA`, regime leggero nel CLAUDE.md; ogni versione nuova DEVE avere `ora:` in NOVITA (la prova lo pretende). Giro completo: 49 OK (08/11 ~11:30). Rete dell'ambiente: accesso completo da 08/11 ~11:00 (GialloZafferano, Hugging Face, jsdelivr, sito vero raggiungibili dal contenitore).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Voci (#28, 08/11): Kokoro in italiano NO (phonemizer 1.2.1 sa solo l'inglese: «Invalid language identifier it»); VoiceStudio (debpalash) e voice-studio (msrbuilds) NO: app a sé o server Python con GPU, non dentro l'app web. Piper Paola SÌ: provata dal vivo, dati CC0.
- Quelle delle sessioni 1-7: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` (link unico + richiesta, email-link, leggere `nomi/` dal telefono, lucchetto in anteprima, pronti come numero, ascoltare `foto/`, Gemini acceso, ecc.).
- Quelle delle sessioni 8-22 (Cloudflare «Connetti GitHub», dosi, stampantina, vapore, AI a pagamento, ecc.): `docs/lavori-in-corso/strade-scartate-sessioni-8-13.md`.
- Ricettario con ricette scritte da Claude (5, in `ricette.js`): Mario «non inventarle, prendile ufficiali… sembra super amatoriale». Videoricette YouTube + link esterni: scartata da Mario 08/11 ~05:00 (vuole tutto DENTRO l'app; GZ letto dal vivo dal server, solo per chi gestisce, niente copie nel codice). Prova dal contenitore su giallozafferano.it: impossibile (proxy 403). API Spoonacular/Edamam: solo inglese, regole strette; Pepesto: a pagamento e foto fatte dall'AI.

## Prossimi passi
1. Avvio: titolo verde; a Mario una riga su ogni riga di «Aspetta Mario».
2. C64: hook in `.claude/hooks/` che AVVISA (mai blocca) dopo 4 comandi Bash piccoli di fila, solo in questo progetto (ok scritto di Mario 08/11 «ok per pronti in tavola»; regola nel CLAUDE.md «Regime leggero → Comandi»; dettagli in `docs/CONSEGNE-PARALLELA-aiuto.md`). Prova: `tools/test-*.py` verdi.
3. Aspetta la prova di Paola da Mario. Se va: niente; se no, foto e rifare lo scarico sul sito vero con Playwright (`page.goto` sull'indirizzo pubblicato, `VociLocali.piper.scarica`).
4. Prove autonome (da Aiuto 1): `SOLO=<passo>` impiega ~90 s a passo perché il codice fuori da `passo()` in `tools/prova.js` gira sempre (attese di 6,5 s all'apertura ecc.) e i passi Monica dipendono dai precedenti: stato proprio per ogni passo.
5. Licenze: dati della voce Paola CC0 (verificato); Riccardo (M-AILABS) da leggere prima di proporlo.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
08/11 ~11:40 (dopo l'handoff, con 2 foto: icona di VoiceStudio e `archivio/foto/2026-11-08-mio-database-motore-fermo.jpg`), parola per parola: «Microsoft togliamolo le voci di Piper non mi piacciono molto che ne pensi di questo per sintetizzatore vocale / poi non mk trova altre nuove ricette da giallo zafferano non posso chiederle semore a token da claude». Da fare: 1) togliere le voci Microsoft (VOCI_VERE); 2) cercare una voce migliore di Piper che giri nel browser del telefono (VoiceStudio = app a sé, già scartato per l'app; ma si può valutare se il suo motore OmniVoice o altri hanno un modello ONNX/WebGPU leggero con italiano, oppure generare le voci sul server); 3) MOTORE BLOCCATO: la foto dice 26 trovate, 24 giri, «Sezione 1 di 10 (Ricette sarde) · 0%» e «Giro fatto: niente di nuovo in questa pagina»: il motore non avanza di pagina/sezione quando una pagina non porta niente di nuovo (worker.js, oggetto Ricettario, cron */10). Con la rete aperta si può provare dal vivo GialloZafferano dal contenitore. Prima:
08/11 ~11:40 (dopo l'handoff), parola per parola: «voci Microsoft lasciamo perdere». Riga tolta da «Aspetta Mario»; voci Microsoft da togliere dalla scelta (VOCI_VERE in aiutante.js) o lasciare come ripiego: decidi tu (consiglio: toglierle, così Monica non sceglie voci che non funzionano). Prima:
08/11 ~11:36, parola per parola: «ok per pronti in tavola» (ok scritto ai file di `.claude/` per il controllo dei comandi raggruppati, C64). Prima (~11:25): foto dello scarico di Paola fallito («Failed to fetch»), corretto in v0.9.32. Prima: «metti che scarica le voci automaticamente… il programma sceglie la miglior voce… gliela scarica automaticamente nel telefono… anche con i dati» (fatto v0.9.31) e «Voice Studio… guarda se c'è l'italiano» (scartato: app a sé).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C69; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).


Controllo Da fare: 1 voce aggiunta (C64).
