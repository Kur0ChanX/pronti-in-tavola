# Passaggio di consegne

Sessione attuale: #31 (dopo la #30 `session_01WTjqUx82oy6ErYMX4nn4Wx`, chiusa alla soglia 08/11 14:34; la apre la #30 con `create_session` (catena 5 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (08/11 ~15:10):** 1) **voce**: Supertonic e Kokoro scartate («sembrano straniere»); aspetta la scelta fra 4 strade (riga 🛑 in «Aspetta Mario»); 2) ricette **uguali a GialloZafferano paro paro** (fatto v0.9.40-0.9.42, aspetta la sua foto della Pastiera); 3) filtri del Ricettario (v0.9.39, aspetta foto).

## Stato (08/11 14:34 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 47 OK, 0 NO (08/11 ~09:00). `SOLO=ricettario` NON funziona da solo (serve il giro completo, ~3 minuti). Dal contenitore il sito vero, GialloZafferano e Microsoft sono bloccati (curl 000): esito dei giri con `mcp__github__actions_list` (sito.yml, perPage 1).
- Motore e regole: `npm install`, `npm run prova-firebase` → «88 OK, 0 NO» (07/11 ~17:45); regole non toccate.
- Sito: `python3 -I tools/sito.py` → «OK sito».
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima artefatto: NON si pubblica più (Mario 08/11 «non lo uso più»); `dist/anteprima.html` serve solo alle prove.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#30)
Online v0.9.36 → v0.9.42 (ognuna: prove verdi, giro «Pubblica sito» success, curl del sito = versione):
- v0.9.37 C70.1 velocità della voce: cursore in «Solo per te, Mario» (`velVoceHtml` app.js, `S.impostazioni.velVoce` 0,7-1,3, di base 0,9), `velVoce()` aiutante.js, Piper `length_scale / vel` (voce-piper.js), telefono `u.rate`.
- v0.9.38 C71 prova delle AI: 400 token + `reasoning_effort: 'low'` (con 30 i modelli che pensano rispondevano vuoto: ipotesi, Mario deve riprovare), motivo se vuota. C54 chiusa (foto di Mario).
- v0.9.39 C69 filtri: `scelte()` del worker con totale/difficolta/cerca da `ricette.json`; ricettario.js `ORDINI_RIC`, `filtriVuoti`, `minutiRic`, `salvaFiltri` (localStorage `pit-ric-filtri`), «⚙️ Più filtri e ordina» chiuso di base.
- v0.9.40-0.9.42 C72/C73: gz.mjs tiene i numerini `[[n]]` frase↔foto, legge TUTTI i paragrafi (`<p class>`, più `<p>`, `<li>`), si ferma a `<h1-3>`; `v: 3`; ricettario.js `passoHtml`, `testoVoce`, `fotoPasso` (badge «1-3» sulle foto a strisce), copia vecchia sul telefono riletta una volta (`RIC.riletta`); worker `vecchie(5)`/`tieni(url)` nel cron: archivio riletto 5 ogni 10 minuti. Tutte le 69 di `ricette.js` controllate dal vivo: 58 perfette, 11 con numerini≠foto come sull'originale, mirto senza foto al passo 1 (originale). Prova nuova `node tools/prova-gz.mjs` (6 OK).
- C70.2 ricerca voci: `docs/lavori-in-corso/ricerca-voci-2026-11.md` + WAV in `docs/lavori-in-corso/voci-prova/`; Mario: NO a tutte. VoiceStudio confermato scartato (OmniVoice, AGPL, niente web).
- Prove finali: app 50 OK, server 70 OK, lettore 6 OK. Da questo contenitore GialloZafferano ORA risponde (curl 200).
- Excel mensile degli ordini: Mario «per ora no» (in gia-deciso).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).

## Prossimi passi
1. Avvio: titolo verde; a Mario una riga per riga di «Aspetta Mario» (la 🛑 della voce per prima, con le 4 scelte).
2. Voce, quando Mario risponde: 1 = voce Google del telefono (già nell'app come «voce del telefono»: guidare Mario a scaricare le voci italiane Google su Android e sceglierla; valutare di metterla come voce di base); 2 = Microsoft Isabella/Elsa/Diego (tolte in v0.9.33: rimettere `VOCI_VERE` e `/api/voce`, rischio: servizio non ufficiale); 3 = Deepgram Aura-2 Cinzia/Cesare (italiano nativo, a pagamento, chiave con `request_credential`, audio generato una volta e salvato in `voci` del Durable Object); 4 = resta Piper.
3. Controllare (dopo qualche ora) che il cron abbia riletto l'archivio: «🗄 Il mio database» o un `/api/ricettario {db:'mie'}` con ricette `v:3`.
4. Aspettare le foto di Mario: filtri (C69), Pastiera (C73), prova AI (C71), velocità (C70).

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
08/11 ~15:10, parola per parola: «non mi piacciono come tono e pause e accenti sembrano stranieri ai altre alternative?» (sulle 4 voci di prova). Prima: «riscrivimi la domanda 4 voci l'ho persa»; «hai guardato tutte le ricette e hai kesso la regola delle migliorie nelle prossime caricate?»; «Controlla tutte le ricette e falle come giallo zafferano uguali paro paro»; «Pensi che i passi di tutte le ricette caricate siano completi e chiare? o ci sono buchi riguardale tutte migliorale e le nuove le carichi dora in poi migliorate»; «salvataggio excell per ora no».
Risposta data alla #30 (alternative): 1 voce Google del telefono (consiglio: nativa, gratis, senza rete) · 2 Microsoft Isabella di nuovo · 3 voce a pagamento Aura-2 Cinzia · 4 resta Piper.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C74; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).



Controllo Da fare: 3 voci aggiunte (C71, C72 poi chiusa, C73); riga 🛑 della voce aggiornata.
