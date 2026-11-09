# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 4 → Voce 5

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36). Mario 09/11 ~17:35: «Continua con pensiero extra e se serve ripensa» (= ragiona di più, cambia strada se serve: fatto, vedi «Decisioni»).
**Da non rifare:** la correzione iPad (v0.9.82: su iPhone/iPad subito l'ascolto preciso, «sì» col tocco) e quella del pannello (v0.9.84: niente lampeggio, risposta in vista): sono online e provate. Non rileggere `voce-clienti.js`, `aiutante.js`, `worker.js` per intero: `grep -n` sulle funzioni citate qui sotto.
**Cosa preme a Mario adesso:** «non capisce bene e parlo normale» (iPad, 09/11 ~20:15). Il microfono ora ascolta, ma le parole escono storpiate: va reso PRECISO.

Voce 4 = `session_01WTjqUvJr7mmfdSNihHR6LZ` (aperta da Voce 3 09/11 ~19:45, chiusa alla soglia 09/11 ~20:20; catena 4 di 8). Motore: Fable 5.1, poi Opus 5.5 (cambiato da Mario con /model), impegno Extra.

## Stato (controlla, non fidarti)
- Online v0.9.84 (principale ha la 0.9.83 = C106 zoom iPad). Controllo: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP`; `voce-clienti.js` contiene `dataset.chiave`, `aiutante.js` contiene `schermo basso`.
- Giro completo verde in locale sull'ultimo codice: `tools/prova.js` 74 OK + `prova-impostazioni.js` 11 OK, «Nessun errore nella pagina». Passo nuovo: «voce dei clienti: iPad con l'app sulla Home…» (iPad finto 1024×600, foto `42-voce-ipad-orizzontale`).
- Codice di Voce 4 in `voce-clienti.js`: `suiOS`, `appSullaHome`, `telefonoAscoltaBene`, `vocePuoSentireSi`, guardia 4 s su iOS, AudioContext dentro il tocco, `disegnaVC` con `box.dataset.chiave`. In `aiutante.js`: `fondoAC` (inizio dell'ultima risposta in vista), «Controlla e tocca Conferma» se il «sì» a voce non si può.
- Lezione PT E39 in `docs/ERRORI.md` (riconoscitore di Safari muto nell'app sulla Home: WebKit 225298, 321436).
- Video Android (va) `archivio/foto/2026-11-09-mario-android-voce-clienti.mp4`; foto iPad (capisce male) `archivio/foto/2026-11-09-ipad-voce-capisce-male.jpg`.

## 🔴 Prossimo lavoro: «capire meglio» (Mario 09/11 ~20:15, foto iPad)
Cosa si vede nella foto: detto «due teglie di lasagne per sabato» → scritto «Dette di lasagne per sabato.» e «2 teglie di lasagna persa a Mato». Quindi l'audio arriva al server, ma Whisper storpia; «Quale intendi?» sulle lasagne è giusto (3 lasagne nel menù).
Oggi (`worker.js` `ascolta`, righe ~107-132): per `audio/mp4` (Safari) prima Cloudflare `@cf/openai/whisper-large-v3-turbo`, poi Groq `whisper-large-v3-turbo`; prompt = elenco di parole. Il telefono riceve un solo testo (`r.testo`, `voce-clienti.js` ~riga 468) e lo usa così com'è.
Piano (ricerca 09/11/2026: Groq docs speech-to-text e rate-limits; Cloudflare models):
1. **Modello più preciso**: Groq `whisper-large-v3` (non turbo): errore sulle parole 8,4% contro 12%. Gratis: 20 al minuto, 2.000 al giorno, 28.800 secondi di audio al giorno (ogni richiesta conta almeno 10 s) → ~2.800 frasi al giorno, basta.
2. **Doppio ascolto**: Groq v3 e Cloudflare in parallelo (`Promise.allSettled`), il server restituisce `alternative: [..]`.
3. **Correttore intelligente**: con le trascrizioni e l'elenco dei piatti, una domanda veloce a Groq (`PONTE` in `worker.js`, come `ponteAI`, `temperature: 0`, tempo massimo ~6 s, `max_tokens` alto perché i modelli «pensano»): «correggi solo le parole sentite male (piatti, giorni, quantità, teglia/chilo/etti/pezzi), non aggiungere nulla, rispondi solo con la frase». Se fallisce: le trascrizioni di Whisper.
4. **Prompt di Whisper come frase vera** (Whisper lo prende come testo precedente): «Vorrei due teglie di lasagne al ragù per sabato e un chilo di polpette di carne per domani. Menù: …».
5. **Sul telefono**: con `r.alternative`, scelta con `scegliAlternativa([r.alternative])` (vince la frase con più senso sul menù); in più un ritocco locale dei giorni simili («persa a Mato» → «per sabato», «sa bato») dentro `giornoDetto` o come alternativa in più. La proposta resta da confermare.
6. Prove: in `tools/prova.js` passo con `ascoltaServerFinto` che restituisce `alternative` storpiate; una prova del Worker con `env.AI` e `fetch` finti (oggi non c'è: crearla piccola, es. `tools/prova-ascolta.mjs`). Poi giro completo, versione libera (oggi 0.9.85 se la principale non l'ha presa), push: `sito.yml` pubblica sito e Worker. Dal vivo: `/api/conto-ai` → `ascolti` (solo per chi gestisce).
7. A Mario: «chiudi e riapri, di' la stessa frase» + riga in «## 0. Aspetta Mario» (quella di Voce 4 c'è già: aggiornarla, non doppiarla).
8. **Domanda di Mario (dopo l'handoff): motore LOCALE per non consumare limiti?** Rispondigli tu, dopo una ricerca aggiornata (mese e anno): riconoscimento nel browser (Whisper con transformers.js o whisper.cpp in WASM/WebGPU, Vosk italiano con vocabolario ristretto ai piatti, altri nuovi) su iPhone/iPad: peso da scaricare, velocità, precisione in italiano. Parere di Voce 4 da verificare: i limiti di oggi bastano per un negozio di amici (Groq 2.000 frasi al giorno, Cloudflare ~200 minuti al giorno coi neuroni gratis condivisi con le altre AI dell'app, tetto dell'app 400 al giorno e 40 per cliente; Android usa già il riconoscitore del telefono, gratis); un motore locale pesa decine o centinaia di MB sul telefono del cliente e su iPhone è lento. Proposta probabile: niente locale ora; due fornitori in fila + contatore, e il locale (es. Vosk col vocabolario del menù) solo come ultima riserva se i contatori mostrano limiti raggiunti. Decide Mario (🛑 cosa scaricano i clienti).
Strada scartata: Deepgram Nova-3 su Cloudflare (italiano sì, parole chiave sì) costa ~10 volte Whisper in neuroni (473 al minuto) e il formato d'ingresso va verificato; da tenere come terza strada solo se 1-5 non bastano.

## Decisioni di Voce 2 (col perché; cambiarle solo con un motivo)
- **Capire sul telefono prima del server** (`capisciCliente`): risposta istantanea e gratuita per ordini, prezzi, allergie, pronti, consigli, stato, info; al server (`/api/aiuto-cliente`) solo le frasi con confidenza < 0,6, con `dati.indizi` (piatti e numeri trovati). Senza rete l'app risponde lo stesso e, se il server manca, aggiunge gli esempi.
- **Ambiguità → domanda con chips**: «lasagne» (3 piatti) → «Quale intendi? …» e un tocco risolve (`alternative` con `scelte`); mai scegliere al posto del cliente.
- **«Sì»/«no» detti o scritti** sull'ultima proposta aperta la confermano o la lasciano (`rispondiSiNoCliente`), non solo il «sì» a voce.
- **«Dettami l'ordine» usa subito l'ascolto preciso** (MediaRecorder → Whisper): il riconoscitore del telefono si ferma alla prima pausa e una frase con tre piatti no. Si ferma da sola dopo N secondi di silenzio (`voceClientiSecondi`, 2-6, base 3) o a 15 s.
- **Microfono fisso in basso a SINISTRA** nel menù e nel carrello (a destra c'è «Scrivimi»), con pillola «Dettami l'ordine» (nascosta sotto 380 px); tocco = ascolta fino al silenzio, tenuto premuto = parla finché tieni; `body.vc-su` allarga il fondo così non copre «Invia».
- **Allergie mai al server**: `datiAIC` non manda più i nomi (vedi ganci §2); le risposte sulle allergie le dà il telefono.
- **Quantità prudenti**: «un/una» conta solo davanti a un piatto («una parmigiana», non «una domanda»); «teglia da 8», «per il 15», «alle 18» non sono quantità; le quantità si arrotondano al minimo e al passo del formato (come `controllaAIC`) e il testo dice il valore vero («0,5 kg… è il minimo che Monica prepara»).
- **Aggancio a `window.render`** per ridisegnare il microfono fisso senza toccare app.js (fuori zona). Se Mario o la principale preferiscono una riga in `render()`, basta chiamare `disegnaVC()` con typeof.
- **Prezzi letti bene** (`perVoceCliente`): «12,50 €» → «dodici euro e cinquanta», «1,5 kg» → «un chilo e mezzo».

## Dopo (non fatte, da proporre a Mario)
«ripeti» legge l'ultima risposta; suggerimenti a voce nel carrello («manca il giorno: per quando?»); voce di Monica che legge gli ordini dettati. Chiusura della voce 👁 di C105 solo con foto o lettura di Mario; poi la zona torna alla principale (skill `chat-parallela`).

## Domande a Mario
Nessuna nuova. In «## 0. Aspetta Mario» resta la riga di Voce 4 (prova su iPad): dopo la correzione si aggiorna con la versione nuova.

## Ultimo messaggio di Mario (parola per parola)
09/11 ~20:25, chat Voce 4 (dopo l'handoff): «Ok possiamo integrarne una Locale per non consumare limiti? se molti clienti chiedono magari ci sono interruzioni per limiti».
09/11 ~20:15, chat Voce 4, con la foto dell'iPad: «non capisce bene e parlo normale».
Prima, in Voce 4: «ti ascolto frickera e la pagina deco scrollare in alto per vedere cosa dice» (→ v0.9.84); «è su app da ipad sento il  suono di attivazione microfono ma non va su android smartphone da app va cosí guarda video» (→ v0.9.82). In Voce 3: «su ipad non funziona il comando vocale e il microfono è abilitato, risolvi».

## Numeri
Controllo Da fare: 0 voci aggiunte (le 3 richieste di Mario in Voce 4 sono tutte in C105).
C105 di questa catena. Lezioni: prossima libera PT E41 (controlla su origin). Versione: la prima libera al momento del push. Impegno: `.claude/settings.json` com'è (condiviso, non toccato).

## Per riaprire la catena a mano (se serve)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce N» (comando vocale dei clienti) di Pronti in Tavola, ramo claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md, poi continua da sola dal «🔴 Prossimo lavoro».»
