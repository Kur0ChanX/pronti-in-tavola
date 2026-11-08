# Passaggio di consegne

Sessione attuale: #30 (dopo la #29 `session_01WTjqUwE6uYDDYLauzqskRo`, chiusa alla soglia 08/11 12:17; la apre la #29 con `create_session` (catena 4 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (08/11 ~12:20):** 1) **voce**: Piper «troppo veloce» → velocità regolabile solo da Mario ma valida anche per Monica (C70.1); 2) **voce migliore di Piper**: ricerca approfondita su GitHub, open source, locale nel browser, senza chiavi, italiano; e VoiceStudio studiato a fondo da un aiutante a parte (C70.2, C66); 3) **ricerca e filtri del Ricettario come le app migliori** (C69); 4) verificare sul sito vero che «⚡ Carica 100» e il ricettario automatico funzionino (v0.9.36).

## Stato (08/11 12:17 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Giri in corso: Pubblica sito. Nessuna PR aperta. Versione nel codice v?.
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
Sessione appena chiusa (#29)
Aperta dalla #28 (catena 4). Online v0.9.33 → v0.9.36 (si pubblica da solo a ogni push):
- C64 hook `.claude/hooks/comandi-piccoli.py` (+ `tools/test-comandi-piccoli.py`), avvisa dopo 4 Bash piccoli, mai blocca.
- v0.9.33 voci Microsoft tolte (`VOCI_VERE = []`, `sceltaVoce` porta `edge:` a Paola, aiutante.js).
- v0.9.34 C65 motore: `CAT_GZ.sardegna = 'ricerca-ricette/sardegna'` (la sezione regionale GZ era 404, provato dal vivo), pagina rotta → sezione dopo; sarde una pagina sì e una no (`posizioneSarda`, `paginaSarda`), riga `sardeTxt` in ricettario.js.
- v0.9.35 C67 foto originali: `/api/originali` in worker.js (archivio `fotoDb` = Ricettario idFromName('originali'), pezzi 1,9 MB, 25 MB, 60 giorni, pulizia nel cron della sera); app.js `mandaOriginale`/`inviaOriginali` (coda IndexedDB `pit-originali`), `originaliHtml` in «Solo per te, Mario», `orig-scarica`; foto di Mario senza filtro.
- v0.9.36 C68 (Mario «1»): aiutante (sonnet) su worker.js: `ricettaCompleta`, `passoMotore`, `salvaMotore` (archivio + scelte), `riempiScelte`, turbo `{db:'turbo', n}` con `alarm()` (5 ricette ogni 30 s), tabella `mie` con `mieScritte/salvaMia/togliMia`; io in ricettario.js: `sincronizzaMie`, `mandaMia`, `togliMiaServer`, riquadro chiaro, `ric-db-turbo`, 🆕 7 giorni. NON provato sul Cloudflare vero (allarmi finti nella prova).
- Prove: `node tools/prova-database.mjs` 67 OK; `node tools/prova.js` 49 OK (08/11 ~12:15). PT E29 in ERRORI. 32 voci chiuse in blocco segnate «Visto da Mario» in DA-FARE-FATTE (test-promesse verde).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Ricette (#29): GZ `ricette-regionali/Sardegna` NON esiste (404) e `ricette-cat/Sardegna` rimanda alla pagina generale: si usa `ricerca-ricette/sardegna/` (30+15 a pagina). Firebase Storage per le foto originali NO (piano Blaze con carta): archivio nel Durable Object (5 GB gratis, 1 GB per oggetto, 2 MB a riga; docs Cloudflare 29/10/2026).
- Voci (#28, 08/11): Kokoro in italiano NO (phonemizer 1.2.1 sa solo l'inglese: «Invalid language identifier it»); VoiceStudio (debpalash) e voice-studio (msrbuilds) NO: app a sé o server Python con GPU, non dentro l'app web. Piper Paola SÌ: provata dal vivo, dati CC0.
- Quelle delle sessioni 1-7: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` (link unico + richiesta, email-link, leggere `nomi/` dal telefono, lucchetto in anteprima, pronti come numero, ascoltare `foto/`, Gemini acceso, ecc.).
- Quelle delle sessioni 8-22 (Cloudflare «Connetti GitHub», dosi, stampantina, vapore, AI a pagamento, ecc.): `docs/lavori-in-corso/strade-scartate-sessioni-8-13.md`.
- Ricettario con ricette scritte da Claude (5, in `ricette.js`): Mario «non inventarle, prendile ufficiali… sembra super amatoriale». Videoricette YouTube + link esterni: scartata da Mario 08/11 ~05:00 (vuole tutto DENTRO l'app; GZ letto dal vivo dal server, solo per chi gestisce, niente copie nel codice). Prova dal contenitore su giallozafferano.it: impossibile (proxy 403). API Spoonacular/Edamam: solo inglese, regole strette; Pepesto: a pagamento e foto fatte dall'AI.

## Prossimi passi
Prossimi passi
1. Avvio: titolo verde; a Mario una riga per riga di «Aspetta Mario».
2. Controlla che il sito vero abbia v0.9.36 (`curl -s <sito>/data.js | grep VERSIONE_APP`) e il giro «Pubblica sito» verde (wrangler deploy anche del worker). Se l'allarme del turbo dà errori su Cloudflare, sistemalo.
3. C70.1 velocità della voce: impostazione in «Solo per te, Mario» (es. 0,7-1,2), salvata in `S.impostazioni` (vale per Monica); Piper la usa (length_scale o playbackRate) in `voce-piper.js`/aiutante.js `parlaLocale`.
4. C70.2 aiutante a parte (agente `voce-locale`, sonnet, in sottofondo) per la ricerca approfondita: voci italiane open source, locali nel browser (ONNX/WebGPU), senza chiavi, migliori di Piper; e VoiceStudio (foto `archivio/foto/2026-11-08-voicestudio-icona-2.jpg`, già scartato come app a sé: verificare di nuovo quale motore usa e se ha una versione web). Rapporto con licenze e prova d'ascolto se possibile.
5. C69 ricerca e filtri (piano nella voce di DA-FARE): filtri fatti dal server sull'archivio (minuti, difficoltà, dieta, ingredienti da `ricette.json`).
6. Mario ha detto «1 perfetto» per le sarde 1 a 1: niente da fare.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
Ultimo messaggio di Mario
08/11 ~12:20, parola per parola (2 messaggi, con la foto dell'icona di VoiceStudio): «la voce piper è troppo veloce fai in modo di farmi modificare la velocità solo a me ma valido anche per monica la modifica , e ooi che fine ha fatto  voice studio da implementare? metti un agente a parte che ci studia sopra bene su voicestudio» e «cerchiamo una voce migloore di Piper da github che va senza token e in locale dall'app fai una ricerca approfondita». Prima: «1 perfetto / fai ricerche filtri ecc come app Gold standard ricette»; «1 consiglio / adesso vai tu cercane 100 ricette miste con priorità sarde e caricale metti un agente…»; «nel mio ricettario risultano sempre 69…»; «quando monica carica una foto riesci a farmela scaricare originale…»; «ma dico in priorità sarde ma cercale miste».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C73; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).



Controllo Da fare: 5 voci aggiunte (C65 aggiornata, C67, C68, C69, C70).
