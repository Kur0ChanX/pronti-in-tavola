# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 10 → Voce 11

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36); niente motore vocale sul telefono; **C108 = strada 1** (09/11 «ascolta sempre la stessa qualità come consiglio»: salvadanai separati, clienti Groq + Deepgram, 0 €); **C109 = sì** («limiti per persona da consiglio»: mai blocchi, avviso a chi gestisce).
**Da non rifare:** C108b mai fermo (v0.9.89, sotto); C110 v0.9.88; «capire meglio» (v0.9.85); dettatura di Monica su iPad (v0.9.86); ricerca C108 (`docs/lavori-in-corso/standard-ascolto.md`); manuale Deepgram e privacy (letti 09/11/2026, sotto); spiegazione della chiave Deepgram a Mario con i passi (ultimo messaggio di Voce 10, 09/11 ~23:25). Non rileggere `voce-clienti.js`, `aiutante.js`, `worker.js` per intero: `grep -n`.
**Cosa preme a Mario adesso:** capire la chiave Deepgram (gli ho dato i passi); che su iPad il microfono sia «una bomba» come su Android (C110, aspetta il suo video).

Voce 10 = `session_01WTjqUtYvuMZ4rMC2iVwr4M` (aperta da Voce 9 09/11 ~20:52, catena 2 di 8; chiusa alla soglia ~23:25 italiane) → Voce 11 la apre Voce 10 con `create_session` (3 di 8). Motore Opus 5.5, impegno Extra (`.claude/settings.json` condiviso: non toccato). Due riavvii del contenitore: scorta mia unita entrambe le volte (solo file di servizio).

## Stato (controlla, non fidarti)
- v0.9.89 = C108b (Voce 10); sopra la Principale 37: v0.9.90 (C112), v0.9.91 (C111 + etichette 'ascoltoQuota' in `app.js`/`sw.js` + opzione `ascoltoAvviso` in `opzioni.js`, chieste da Voce 10), v0.9.92 (C113). Online: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → `0.9.92` o più; `grep -c ascoltoQuota app.js sw.js` → 1 e 1.
- Prove: giro completo 78 OK (v0.9.89); `node tools/prova-ascolta.mjs` 39 OK (sezioni 12-13 = C108b); `node tools/prova-limiti.mjs` 22 OK (Principale).
- Server: `contaAscolto(cliente, soglia)` mai fermo; `DEEPGRAM_API_KEY` ancora NON c'è (riga 🟩 Voce 8 in «0. Aspetta Mario»).

## 🔴 Prossimo lavoro
1. ✅ FATTO (Voce 11, 09/11): `mip_opt_out=true` nella chiamata Deepgram di `ascolta.mjs` + prova in `tools/prova-ascolta.mjs` (40 OK; senza la riga la prova va NO). Solo server: niente versione né novità (come Voce 8, f7abee86).
2. **C108 resto**: quando Mario dice che la chiave è nei segreti → rilanciare «Pubblica sito» (`workflow_dispatch`, `.github/workflows/sito.yml`), poi 5-10 frasi vere a confronto Groq / Deepgram / Cloudflare. Da provare in quel momento: l'indirizzo europeo `api.eu.deepgram.com` (audio trattato in UE; quello globale ha più modelli): se Nova-3 italiano risponde lì, usarlo.
3. **C110 aspetta il video di Mario** (riga 🟩 Voce 9). Se su iPad la voce resta muta o bassa: strada 2 = audio vero via `AudioContext` (Sam Eddy 18/05/2026); Deepgram Aura-2 ha l'italiano? da cercare → chiedere a Mario (soldi).
4. Versioni: la prossima libera al push (`git show origin/claude/pronti-ramo-definitivo:data.js | grep VERSIONE_APP`).

## Fatti nuovi (09/11/2026)
- (Voce 10, deepgram.com/pricing, developers.deepgram.com/trust-security/your-data, changelog 05/03/2026) Pay as you go: 200 $ di credito gratis, senza carta, senza scadenza, ~43.000 minuti di Nova-3; Model Improvement Program attivo di base (conserva e addestra), `mip_opt_out=true` a ogni richiesta = zero conservazione, prezzo uguale; endpoint UE `api.eu.deepgram.com`.
- C108b: `contaAscolto` conta i clienti in `asc.n`, chi gestisce in `asc.g`; segnalazioni 'ascolto' a soglia+1 e 2×soglia+1 (soglia = `numeroApp(f, 'ascoltoAvviso', 10, 500, 40)`), oltre `TETTO_ASCOLTO` (400) → `'ridotto'` = `ascolta(…, { ridotto: true })`: v3 + turbo (o v3 + Deepgram), Cloudflare solo se nessuno risponde, + 'ascoltoQuota' una volta. `inviaAC` (aiutante.js): con `r.fermo` usa `loc.risposta` se `loc.confidenza > 0`.
- (Voce 9) iOS: `speak()` fuori da un tocco è ignorato; il tocco vero è il rilascio; `navigator.audioSession.type` (Safari 17+); voce di sistema bassa dopo il microfono, `AudioContext` no.
- Deepgram (manuale 09/11/2026): `POST https://api.deepgram.com/v1/listen?model=nova-3&language=it&smart_format=true&keyterm=…`, header `Authorization: Token <chiave>`, corpo = audio grezzo; testo in `results.channels[0].alternatives[0].transcript`; `keyterm` max 100 termini e 500 token. Chiave: console → Projects (in alto a sinistra) → Settings → API Keys → Create a New API Key → Create Key → copia → Got it.
- Context7 ha finito la quota del mese: per i manuali Parallel Search.

## Strade scartate (col perché)
- Server su un PC di Mario: acceso sempre, più guasti. Voxtral gratis: non c'è più.
- Prompt di Whisper con un ordine intero: sul rumore può ricopiare il prompt.
- Ritocco dei giorni «simili» sempre: «qualcosa di salato» → «sabato»; ora solo dopo «per/entro».
- Deepgram su Cloudflare (`@cf/deepgram/nova-3`): 472,73 neuroni al minuto, mangerebbe il salvadanaio dei gestori.
- (Voce 10) Oltre il tetto di tutti fermare l'ascolto: no (PT E41); togliere il tetto del tutto: no, i clienti userebbero i neuroni di Monica e Mario.

## Decisioni di Voce 2 (col perché; cambiarle solo con un motivo)
- Capire sul telefono prima del server (`capisciCliente`); al server solo confidenza < 0,6 con `dati.indizi`. Ambiguità → domanda con chips, mai scegliere al posto del cliente. «Sì»/«no» confermano l'ultima proposta (`rispondiSiNoCliente`). «Dettami l'ordine» usa subito l'ascolto preciso, si ferma dopo N secondi di silenzio (`voceClientiSecondi`). Microfono fisso in basso a SINISTRA. Allergie mai al server. Quantità prudenti e arrotondate al formato. Prezzi letti bene (`perVoceCliente`).

## Dopo (non fatte, da proporre a Mario quando i lavori aperti scendono)
«ripeti» legge l'ultima risposta; suggerimenti a voce nel carrello («manca il giorno: per quando?»); voce di Monica che legge gli ordini dettati. Chiusura della voce 👁 di C105 solo con foto o lettura di Mario; poi la zona torna alla principale (skill `chat-parallela`).

## Domande a Mario
In «## 0. Aspetta Mario»: 🟩 Voce 8 · chiave Deepgram (spiegata di nuovo da Voce 10 con i passi); 🟩 Voce 9 · video dall'iPad di C110.

## Ultimo messaggio di Mario (parola per parola)
09/11 ~23:20 (Voce 10): «parlami della chiave deepgram e a cosa ti serve»
Risposta di Voce 10: cos'è, a cosa serve (secondo motore forte dei clienti con le parole del menù, Cloudflare resta a Mario e Monica), costo 0 (200 $ di credito, ~43.000 minuti), privacy (`mip_opt_out` lo mette Voce 11 subito), passi: account Deepgram → chiave → GitHub «New repository secret» `DEEPGRAM_API_KEY` → scrivere «chiave messa».

## Numeri
Controllo Da fare (messaggi di Mario in Voce 10: solo la domanda sulla chiave, già in C108): 0 voci aggiunte. Prossimo C libero: C119 (controlla su origin); lezioni: prossima PT E45.

## Per riaprire la catena a mano (se Voce 11 non parte)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce 11» (microfono dei clienti) di Pronti in Tavola: git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md; continua da sola dal «🔴 Prossimo lavoro».»
