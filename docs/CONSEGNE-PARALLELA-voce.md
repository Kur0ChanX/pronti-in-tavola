# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 5 → Voce 6

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36); niente limiti per persona che interrompono (PT E41, il COME aspetta la domanda 🛑 C109).
**Da non rifare:** «capire meglio» (v0.9.85: `ascolta.mjs` con Groq `whisper-large-v3` + Cloudflare in parallelo, correttore col menù, `scegliTrascrizione`/`ritoccaGiorni`/`giornoSimile` in `voce-clienti.js`); la ricerca sul motore locale (C108, risposta data a Mario con 3 scelte). Non rileggere `voce-clienti.js`, `aiutante.js`, `worker.js` per intero: `grep -n`.
**Cosa preme a Mario adesso:** che il microfono capisca bene quando parla normale (iPad); niente interruzioni per i clienti (C109).

Voce 5 = `session_01WTjqUtKDPi7C12EuwhSQ1U` (aperta da Voce 4 09/11 ~20:20, chiusa alla soglia 09/11 ~20:40; catena 5 di 8). Motore: Opus 5.5.

## Stato (controlla, non fidarti)
- v0.9.85 pubblicata da Voce 5 (se il push del codice è andato: `git log --oneline -3 -- ascolta.mjs`). Controllo dal vivo: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.85; il giro `sito.yml` verde (pubblica sito e Worker; `'*.mjs'` ora nei percorsi, anche per `gz.mjs`). `ascolta.mjs` NON va servito al telefono (non è in `FILE_APP`).
- Prove: `node tools/prova-ascolta.mjs` 19 OK (server finto: v3+Cloudflare, turbo di riserva, correttore giù/lento, «sì» senza correttore, frasi inventate tipo Amara.org scartate); `tools/prova.js` 75 OK con il passo nuovo «frasi storpiate da Whisper…». Nota: il passo «iPad con l'app sulla Home» fallisce se lanciato DA SOLO con `SOLO=` (non è autonomo: serve lo stato «guarda come cliente» dei passi prima); nel giro completo passa.
- Correttore: Groq `qwen/qwen3.8-27b` con `reasoning_effort: 'none'` (4,5 s max), poi `openai/gpt-oss-120b` `low`; frasi di 1-2 parole («sì») non passano dal correttore. Risposta di `/api/ascolta`: `{ testo, alternative, corretto, motore }`.
- Mai provato dal vivo con audio vero (serve Mario o un token di cliente): `/api/conto-ai` → `ascolti` dice se arrivano.

## 🔴 Prossimo lavoro
1. Se il codice di 0.9.85 non è su origin (`git log origin/claude/pronti-ramo-definitivo --oneline -- ascolta.mjs` vuoto): giro completo (`python3 -I tools/anteprima.py && node tools/prova.js`, `node tools/prova-impostazioni.js`, `node tools/prova-ascolta.mjs`), commit, push, poi `curl` del `data.js` online. Se è su origin: solo il controllo dal vivo.
2. Aspettare Mario sull'iPad (riga 🟨 Voce 5 · C105 in «0. Aspetta Mario»): se sbaglia ancora, chiedere la frase detta e quella scritta; strade dopo: parole chiave al correttore anche coi formati del piatto (t6/t8/kg), `verbose_json` di Groq (`avg_logprob`) per scartare la trascrizione peggiore, terza strada Deepgram Nova-3 (vedi «Strade scartate»).
3. **C109** (domanda 🛑 di Voce 4 in «0. Aspetta Mario»: proposta in `docs/lavori-in-corso/limiti-per-persona.md`, 1 sì · 2 cambia i numeri; Voce 4 ci parla ancora con Mario): NON toccare `TETTO_ASCOLTO_CLIENTE` finché Mario non risponde. Bozza pronta di Voce 5 (tolta prima del push): in `contaAscolto` togliere `return 'tuo'`, contare per cliente, chi supera `SEGNALA_ASCOLTO_CLIENTE` (60) va in `c.oltre` e in `/api/conto-ai` (`ascoltiOltre`); l'avviso a chi gestisce una sola funzione con la Principale 35 (aiutante, `TETTO_AIC_CLIENTE`): accordarsi in `docs/CHI-FA-COSA.md`.
4. **C108** (motore locale): aspetta la risposta di Mario (riga 🟨 Voce 5 · C108). Ricerca 09/11/2026 (localmodel.run, catalogo 02-03/11/2026; ggml.ai whisper.cpp): Whisper Tiny 39 MB (WASM) / 73 MB (WebGPU), «basic» in italiano; Whisper Small 238/463 MB; Large v3 Turbo 537 MB; Safari 26+ ha WebGPU; Moonshine senza italiano nell'elenco. Consiglio dato: 1 niente locale ora.
5. Idea da proporre (non fatta): l'aiutante di MONICA detta col riconoscitore del telefono (`ascoltaAI` in `aiutante.js`, zona della Principale): su iPad/iPhone nell'app dalla Home ha lo stesso guasto di PT E39; potrebbe usare `registraCliente`/`/api/ascolta` (il server accetta già chi gestisce).

## Strade scartate (col perché)
- Prompt di Whisper con un ordine intero («Vorrei due teglie…»): Whisper sul rumore può ricopiare il prompt; usata una frase descrittiva con le parole giuste.
- Ritocco dei giorni «simili» sempre: «qualcosa di salato» diventava «sabato»; ora solo dopo «per/entro» o attaccato a «per», e solo come frase in più da confrontare.
- Deepgram Nova-3 su Cloudflare: ~10 volte i neuroni di Whisper; terza strada se serve.

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

## Dopo (non fatte, da proporre a Mario)
«ripeti» legge l'ultima risposta; suggerimenti a voce nel carrello («manca il giorno: per quando?»); voce di Monica che legge gli ordini dettati. Chiusura della voce 👁 di C105 solo con foto o lettura di Mario; poi la zona torna alla principale (skill `chat-parallela`).

## Domande a Mario
In «## 0. Aspetta Mario»: 🟨 Voce 5 · C105 (prova iPad, v0.9.85), 🟨 Voce 5 · C108 (motore locale, 3 scelte), 🟨 Voce 4 · 🛑 C109 (limiti per persona). Mario non ha scritto nella chat di Voce 5.

## Ultimo messaggio di Mario (parola per parola)
09/11 ~20:45, chat Voce 4: «Dimmi cosa metteresti per quest'app e che regola metteresti in generale.» → proposta in `docs/lavori-in-corso/limiti-per-persona.md`, aspetta l'ok (riga 🛑 C109).
09/11 ~20:40, chat Voce 4: «Cioè, io ti ho detto un'idea, però se ci sono più cose più contro che pro, io vorrei salvaguardare il servizio del cliente e dell'amico, ecco. Cosa mi consigli tu? Valuta bene.» → Voce 4 ha consigliato i tre livelli (domanda 🛑 C109 in «0. Aspetta Mario»): C109 aspetta la risposta.
09/11 ~20:35, chat Voce 4 (dopo l'handoff), regola nuova per tutti i progetti: «Metti, aggiungi la regola come ti avevo già detto per tutto l'account, che se metti un limite per cliente non lo devi mettere per cliente, o me lo devi chiedere che cosa vuoi applicare, perché io vorrei applicare una regola che se un cliente esagera, secondo te, mi manda una segnalazione nell'app, però non vorrei, vorrei evitare di avere un'interruzione da parte del cliente, perché o del cliente o del collega o cioè della persona, perché mi sembra un'app amatoriale, ecco, se ci sono questi limiti. Quindi metterei un limite un po' ampio e se lo oltrepassa mi manda una notifica, così vedo come comportarmi, perché se esagera di molto significa c'è un problema e te lo registri tu. Se oltrepassa di poco, vediamo di aumentare un po' il limite, ecco. Però vorrei evitare le interruzioni da parte del cliente, cliente, persona, amico, eccetera, eccetera, eccetera, per tutti i progetti.» → C109, PT E41; regola nel kit: Principale.
09/11 ~20:25, chat Voce 4 (dopo l'handoff): «Ok possiamo integrarne una Locale per non consumare limiti? se molti clienti chiedono magari ci sono interruzioni per limiti».
09/11 ~20:15, chat Voce 4, con la foto dell'iPad: «non capisce bene e parlo normale».
Prima, in Voce 4: «ti ascolto frickera e la pagina deco scrollare in alto per vedere cosa dice» (→ v0.9.84); «è su app da ipad sento il  suono di attivazione microfono ma non va su android smartphone da app va cosí guarda video» (→ v0.9.82). In Voce 3: «su ipad non funziona il comando vocale e il microfono è abilitato, risolvi».

## Numeri
Controllo Da fare: 0 voci aggiunte (Mario non ha scritto in Voce 5; C108 e C109 già in Da fare).
Lezioni: prossima libera PT E42 (controlla su origin). Versione: 0.9.85 presa da Voce 5; la prossima libera al momento del push. Impegno: `.claude/settings.json` com'è (condiviso, non toccato).

## Per riaprire la catena a mano (se serve)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce N» (comando vocale dei clienti) di Pronti in Tavola, ramo claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md, poi continua da sola dal «🔴 Prossimo lavoro».»
