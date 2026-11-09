# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 9 → Voce 10

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36); niente motore vocale sul telefono; **C108 = strada 1** (09/11 ~21:20 «ascolta sempre la stessa qualità come consiglio»: salvadanai separati, clienti Groq + Deepgram, 0 €); **C109 = sì** («limiti per persona da consiglio»: mai blocchi, avviso a chi gestisce).
**Da non rifare:** C110 v0.9.88 (sotto); «capire meglio» (v0.9.85); dettatura di Monica su iPad (v0.9.86); ricerca C108 (`docs/lavori-in-corso/standard-ascolto.md`); codice C108 del server (Voce 8, sotto); manuale Deepgram (letto 09/11/2026, sotto). Non rileggere `voce-clienti.js`, `aiutante.js`, `worker.js` per intero: `grep -n`.
**Cosa preme a Mario adesso:** che su iPad (e iPhone) dalla Home il microfono sia «una bomba» come su Android (C110): fatto in v0.9.88, aspetta il suo video; poi C108b (ascolto mai fermo, PT E41).

Voce 9 = `session_01WTjqUuB1p39aBRtu1G1T8K` (aperta a mano da Mario 09/11 ~20:27, catena nuova 1 di 8; chiusa alla soglia ~21:05 italiane) → Voce 10 la apre Voce 9 con `create_session` (2 di 8). Motore Opus 5.5, impegno Extra. Scorta di Voce 7 (`…UvspWD`) superata, non unita.

## Stato (controlla, non fidarti)
- v0.9.88 = C110 (Voce 9) sopra la v0.9.87 della Principale 36 (C109 + C108c). Online: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → `0.9.88` (pubblicata dal push `debb60a8`; se no, guarda il giro «Pubblica sito»).
- Prove: giro completo in locale 78 OK su codice unito; passo «C110» in fondo a `tools/prova.js` (`SOLO=C110`).
- Server: com'era dopo Voce 8 (Groq v3 + Deepgram per i clienti se c'è `DEEPGRAM_API_KEY`, che ancora NON c'è: riga 🟩 Voce 8 in «0. Aspetta Mario»).

## 🔴 Prossimo lavoro
1. **C110 fatto in v0.9.88 (Voce 9), aspetta il video di Mario** (riga 🟩 Voce 9 in «0. Aspetta Mario»). Cosa c'è (`voce-clienti.js`): stato `avvio` (pannello «Accendo il microfono…» prima di `getUserMedia`, Annulla che ferma anche dopo), pannello anche in Aiutante (`vc-senza-fab`: fuori da Menù/Carrello niente microfono tondo, pannello più in basso), barrette che seguono il volume (`.vc-onda.viva`, `--liv`), «Ti sento!», attesa `capisco` con `testoCapisco()` (2,5 s / 6 s / 15 s), microfono della pagina acceso da `statoVC`; voce: `sbloccaVoceIOS()` (speak muto nel tocco: in `registraCliente`, al pointerup e al click del tondo), `sessioneAudio()` (`navigator.audioSession`: play-and-record durante, playback dopo), `parlaCliente()` (voce del telefono, niente avviso falso «si sta scaricando», cancel solo se sta parlando) e `riascoltaCliente()`; fumetto con «Riascolta» / «Ascolta la risposta» (`aiutante.js` `fumettoAC`, `m.muta` dopo 3 s senza `onstart` su iOS). Prova: passo «C110» in fondo a `tools/prova.js`.
   Se Mario dice che su iPad la voce resta muta o bassa: strada 2 = leggere con un audio vero via `AudioContext` (Sam Eddy 18/05/2026: la voce di sistema dopo il microfono va bassa, l'AudioContext no), serve un servizio che dia l'audio (Deepgram Aura-2 ha l'italiano? da cercare) → chiedere a Mario (soldi).
2. **C108 resto**: a) quando Mario dice che la chiave è nei segreti → rilanciare «Pubblica sito» (`workflow_dispatch`: il segreto entra nel Worker solo a una pubblicazione), poi 5-10 frasi vere a confronto; b) **FARE SUBITO (PT E41)**: `contaAscolto` blocca ancora il cliente (`worker.js` ~625 `return 'tuo'` a `TETTO_ASCOLTO_CLIENTE`) e il telefono dice «Per oggi ho ascoltato tanto» (`voce-clienti.js` ~545). La C109 della Principale 36 è unita (v0.9.87): usa la sua `segnala()` nell'oggetto Avvisi di `worker.js` (leggi come la chiama `contaAIC`). Dalla Principale 36 (09/11 ~20:43): `segnala('ascolto', cliente, n, soglia)` = registro 'segnalazioni' + notifica solo ai telefoni di Mario; sw.js e app.js hanno già il testo per 'ascolto'; una segnalazione per soglia (`c.visti`); prova con memoria finta `node tools/prova-limiti.mjs` (22 OK): aggiungi lì i casi di `contaAscolto`. Facoltativo (zona Voce): in `inviaAC` con `r.fermo === 'ridotto'` usare `loc.risposta` quando c'è `loc`: in `contaAscolto` togliere `return 'tuo'` e il blocco, `this.segnala('ascolto', …)` a soglia+1 e 2×soglia+1; in `voce-clienti.js` ~514 togliere «Per oggi ho ascoltato tanto»; c) aiutante dei clienti su Groq: Principale.
3. Versioni: la prossima libera al push (`git show origin/claude/pronti-ramo-definitivo:data.js | grep VERSIONE_APP`).

## Fatti nuovi (09/11/2026)
- (Voce 9, fonti 06-10/2026) iOS: `speak()` fuori da un tocco viene ignorato in silenzio (WebKit `SpeechSynthesis.cpp`), dopo un primo speak nel tocco vale per tutta la pagina; per Safari il tocco vero è il rilascio (pointerup/click), non il pointerdown; `navigator.audioSession.type` (Safari 17+) dà l'intento; la voce di sistema dopo il microfono può restare bassa, l'audio via `AudioContext` no (Sam Eddy 18/05/2026).
- Deepgram (manuale letto 09/11/2026): `POST https://api.deepgram.com/v1/listen?model=nova-3&language=it&smart_format=true&keyterm=…`, header `Authorization: Token <chiave>`, corpo = audio grezzo col suo `content-type`; testo in `results.channels[0].alternatives[0].transcript`; `keyterm` solo Nova-3, monolingua e multilingua, max 100 termini e 500 token. Chiave: console → Projects (in alto a sinistra) → Settings → API Keys → Create a New API Key → Create Key → copia → Got it.
- iOS: il primo `speechSynthesis.speak()` deve stare dentro il tocco (dopo `await fetch` → not-allowed); con il microfono aperto la voce di sistema va bassa; chiudere le tracce prima di parlare (già fatto in `onstop`).
- Context7 ha finito la quota del mese: per i manuali Parallel Search.

## Strade scartate (col perché)
- Server su un PC di Mario: acceso sempre, più guasti. Voxtral gratis: non c'è più.
- Prompt di Whisper con un ordine intero: sul rumore può ricopiare il prompt.
- Ritocco dei giorni «simili» sempre: «qualcosa di salato» → «sabato»; ora solo dopo «per/entro».
- Deepgram su Cloudflare (`@cf/deepgram/nova-3`): 472,73 neuroni al minuto, mangerebbe il salvadanaio dei gestori; meglio l'API di Deepgram col suo credito.

## Decisioni di Voce 2 (col perché; cambiarle solo con un motivo)
- Capire sul telefono prima del server (`capisciCliente`); al server solo confidenza < 0,6 con `dati.indizi`. Ambiguità → domanda con chips, mai scegliere al posto del cliente. «Sì»/«no» detti o scritti confermano l'ultima proposta (`rispondiSiNoCliente`). «Dettami l'ordine» usa subito l'ascolto preciso (MediaRecorder → Whisper), si ferma dopo N secondi di silenzio (`voceClientiSecondi`). Microfono fisso in basso a SINISTRA (a destra «Scrivimi»). Allergie mai al server. Quantità prudenti e arrotondate al formato. Aggancio a `window.render` per ridisegnare il microfono. Prezzi letti bene (`perVoceCliente`).

## Dopo (non fatte, da proporre a Mario quando i lavori aperti scendono)
«ripeti» legge l'ultima risposta; suggerimenti a voce nel carrello («manca il giorno: per quando?»); voce di Monica che legge gli ordini dettati. Chiusura della voce 👁 di C105 solo con foto o lettura di Mario; poi la zona torna alla principale (skill `chat-parallela`).

## Domande a Mario
In «## 0. Aspetta Mario»: 🟩 Voce 8 · chiave Deepgram; 🟩 Voce 9 · video dall'iPad di C110 (v0.9.88).

## Ultimo messaggio di Mario (parola per parola)
09/11 ~20:58 (in Voce 9, dopo l'handoff): «Poi nel mio ipad non posso neanche aprire la schermata dev» → C111 in Da fare, passata alla Principale 36 (non è zona Voce).
In Voce 9 Mario ha scritto solo il testo di avvio («[AVVIO] Sei la chat parallela «Voce 9» … Continua da sola dal «🔴 Prossimo lavoro», prima C110 (iPad come Android).»). Prima, in Voce 8:
09/11 ~20:24 (video Android): «poi per android è una bomba per iPad fà schifo a confronto e penso anche per iphone a questo punto» · «guarda che bomba per android per ipad è completamente diverso...perché????»
09/11 ~20:20 (foto iPad, pagina Aiutante): «non parlaè corretto? poi a volte ci mette un pó specialmente pa prima volta e non si vapisce quando clicchi il tasto e l'attesa bisogna riempirla se no sembra che non è partito»

## Numeri
Controllo Da fare (messaggi di Mario in Voce 9: avvio + schermata dev): 1 voce aggiunta (C111, alla Principale). Prossimo C libero: C112 (controlla su origin); lezioni: Voce 9 ha scritto PT E42, prossima PT E43. Impegno: `.claude/settings.json` com'è (condiviso, non toccato).

## Per riaprire la catena a mano (se Voce 10 non parte)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce 10» (microfono dei clienti) di Pronti in Tavola: git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md; continua da sola dal «🔴 Prossimo lavoro».»

