# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 9 (in corso)

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36); niente motore vocale sul telefono; **C108 = strada 1** (09/11 ~21:20 «ascolta sempre la stessa qualità come consiglio»: salvadanai separati, clienti Groq + Deepgram, 0 €); **C109 = sì** («limiti per persona da consiglio»: mai blocchi, avviso a chi gestisce).
**Da non rifare:** «capire meglio» (v0.9.85); dettatura di Monica su iPad (v0.9.86); ricerca C108 (`docs/lavori-in-corso/standard-ascolto.md`); codice C108 del server (Voce 8, sotto); manuale Deepgram (letto 09/11/2026, sotto). Non rileggere `voce-clienti.js`, `aiutante.js`, `worker.js` per intero: `grep -n`.
**Cosa preme a Mario adesso:** che su iPad (e iPhone) dalla Home il microfono sia «una bomba» come su Android (C110): segnali subito, attesa riempita, risposta a voce.

Voce 9 = `session_01WTjqUuB1p39aBRtu1G1T8K` (aperta a mano da Mario 09/11 ~20:27, catena nuova 1 di 8). Voce 8 = `session_01WTjqUwiB7LRCHcan27dbLW` (chiusa; scorta unita da Voce 9). Scorta di Voce 7 (`…UvspWD`) superata, non unita (solo consumo e vecchia risposta, in conflitto).

## Stato (controlla, non fidarti)
- Online v0.9.86 (`curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP`). Voce 8 non ha cambiato l'app del telefono.
- Server (commit `f7abee86`, pubblicato dal push): `ascolta.mjs` per i CLIENTI con `env.DEEPGRAM_API_KEY` usa Groq `whisper-large-v3` + Deepgram `nova-3` (`keyterm` = misure + menù, `paroleChiave`), riserve finché le trascrizioni sono due: Groq turbo, poi Cloudflare per ultimo; chi gestisce (e i clienti finché manca la chiave) Groq v3 + Cloudflare, riserva turbo. `worker.js` `/api/ascolta` passa `{ cliente: !!c }`. `sito.yml`: passo «Segreti da dare al Worker» (lista dei segreti presenti). Verifica: `node tools/prova-ascolta.mjs` → 27 OK; giro «Pubblica sito» verde dopo `f7abee86`.
- La chiave Deepgram NON c'è ancora (riga 🟩 Voce 8 in «0. Aspetta Mario»; passi dati a Mario nell'ultimo messaggio di Voce 8).

## 🔴 Prossimo lavoro
1. **C110 fatto in v0.9.88 (Voce 9), aspetta il video di Mario** (riga 🟩 Voce 9 in «0. Aspetta Mario»). Cosa c'è (`voce-clienti.js`): stato `avvio` (pannello «Accendo il microfono…» prima di `getUserMedia`, Annulla che ferma anche dopo), pannello anche in Aiutante (`vc-senza-fab`: fuori da Menù/Carrello niente microfono tondo, pannello più in basso), barrette che seguono il volume (`.vc-onda.viva`, `--liv`), «Ti sento!», attesa `capisco` con `testoCapisco()` (2,5 s / 6 s / 15 s), microfono della pagina acceso da `statoVC`; voce: `sbloccaVoceIOS()` (speak muto nel tocco: in `registraCliente`, al pointerup e al click del tondo), `sessioneAudio()` (`navigator.audioSession`: play-and-record durante, playback dopo), `parlaCliente()` (voce del telefono, niente avviso falso «si sta scaricando», cancel solo se sta parlando) e `riascoltaCliente()`; fumetto con «Riascolta» / «Ascolta la risposta» (`aiutante.js` `fumettoAC`, `m.muta` dopo 3 s senza `onstart` su iOS). Prova: passo «C110» in fondo a `tools/prova.js`.
   Se Mario dice che su iPad la voce resta muta o bassa: strada 2 = leggere con un audio vero via `AudioContext` (Sam Eddy 18/05/2026: la voce di sistema dopo il microfono va bassa, l'AudioContext no), serve un servizio che dia l'audio (Deepgram Aura-2 ha l'italiano? da cercare) → chiedere a Mario (soldi).
2. **C108 resto**: a) quando Mario dice che la chiave è nei segreti → rilanciare «Pubblica sito» (`workflow_dispatch`: il segreto entra nel Worker solo a una pubblicazione), poi 5-10 frasi vere a confronto; b) blocco a 400 frasi → avviso con `segnala()` DOPO la patch C109 della Principale 36 (`session_01WTjqUtPqTTxpnkk1cGLaiK`, ti scrive lei; fetch e merge prima di `worker.js`): in `contaAscolto` togliere `return 'tuo'` e il blocco, `this.segnala('ascolto', …)` a soglia+1 e 2×soglia+1; in `voce-clienti.js` ~514 togliere «Per oggi ho ascoltato tanto»; c) aiutante dei clienti su Groq: Principale.
3. Versioni: la prossima libera al push (`git show origin/claude/pronti-ramo-definitivo:data.js | grep VERSIONE_APP`).

## Fatti nuovi (09/11/2026)
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
In «## 0. Aspetta Mario»: 🟩 Voce 8 · chiave Deepgram (passo a mano di Mario). La riga 🟨 Voce 5 (prova iPad) è tolta: Mario ha risposto con la foto (trascrive giusto).

## Ultimo messaggio di Mario (parola per parola)
09/11 ~20:25 (video Android): «poi per android è una bomba per iPad fà schifo a confronto e penso anche per iphone a questo punto» · «guarda che bomba per android per ipad è completamente diverso...perché????»
09/11 ~20:20 (foto iPad, pagina Aiutante): «non parlaè corretto? poi a volte ci mette un pó specialmente pa prima volta e non si vapisce quando clicchi il tasto e l'attesa bisogna riempirla se no sembra che non è partito»
09/11 ~20:15: «limiti per persona da consiglio e ascomta sempre la stessa qualità come consiglio»

## Numeri
Controllo Da fare: 1 voce aggiunta (C110). Prossimo C libero: C111; lezioni: prossima PT E42 (controlla su origin). Impegno: `.claude/settings.json` com'è (condiviso, non toccato).

## Per riaprire la catena a mano (Voce 9 la apre Mario)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla il testo dell'ultimo messaggio di Voce 8 (inizia con «[AVVIO]»).
