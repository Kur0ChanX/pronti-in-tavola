# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 6 → Voce 7

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36); niente limiti per persona che interrompono (PT E41, il COME aspetta la domanda 🛑 C109); **C108: niente motore vocale sul telefono** («vai di consiglio», 09/11 ~20:50) e **standard di qualità fisso, molto buono, mai limiti finiti, mai interruzioni** («studiatela, ragionatela bene»).
**Da non rifare:** «capire meglio» (v0.9.85); dettatura dell'aiutante di Monica su iPad/iPhone dalla Home (v0.9.86, Voce 6); la ricerca dei prezzi e limiti per C108 (fatta 09/11/2026, in `docs/lavori-in-corso/standard-ascolto.md`). Non rileggere `voce-clienti.js`, `aiutante.js`, `worker.js` per intero: `grep -n`.
**Cosa preme a Mario adesso:** che il microfono capisca bene quando parla normale (iPad); una qualità fissa dell'ascolto che non finisca mai (C108); niente interruzioni per i clienti (C109).

Voce 6 = `session_01WTjqUwDxxa1bScHDSPReXe` (aperta da Voce 5 09/11 ~20:45, chiusa alla soglia 09/11 ~21:10; catena 6 di 8). Motore: Opus 5.5.

## Stato (controlla, non fidarti)
- v0.9.86 (Voce 6): l'aiutante di Monica su iPad/iPhone con l'app dalla Home detta con l'ascolto preciso (`ascoltaAI` → `dettaConAscoltoPreciso` in `voce-clienti.js` → `registraCliente({ manda })`; fuori di lì resta il riconoscitore del telefono, `dettaturaServe()`). Controllo: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.86 (se la Principale ha pubblicato dopo, 0.9.87+: guarda `NOVITA`). Giro `sito.yml` sul push.
- Prove: `tools/prova.js` passo nuovo «aiutante di Monica: su iPad…»; il passo «iPad con l'app sulla Home» ora è autonomo (`P.benvenuto = true`). `node tools/prova-ascolta.mjs` (server finto). Mai provato dal vivo con audio vero (serve Mario).
- Correttore: Groq `qwen/qwen3.8-27b` (`reasoning_effort: 'none'`, 4,5 s), poi `openai/gpt-oss-120b` `low`. Nota ricerca: Groq dice che i modelli «preview» come qwen3.8 possono sparire senza preavviso → nella catena di C108 tenere `gpt-oss-120b` come riserva (già così).

## 🔴 Prossimo lavoro
1. **C108 · PRIMO LAVORO**: lo studio è in `docs/lavori-in-corso/standard-ascolto.md` (dati con fonti e date, conti in $, 3 strade in bozza). Manca: rileggere la bozza con occhio critico (Cloudflare divide i 10.000 neuroni con l'aiutante: misurare quanti ne usa l'aiutante; Voxtral credito Free non più scritto: verificarlo; la conversione in euro con il cambio del giorno), poi la domanda 🛑 a Mario (soldi) con «📌 Di cosa parliamo», scelte numerate, costi in euro al mese per 50/200/1.000 frasi, consiglio (1: catena gratuita a tre + avviso all'80%). Riga in «## 0. Aspetta Mario». Codice solo dopo la risposta.
2. Aspettare Mario sull'iPad (riga 🟨 Voce 5 · C105 in «0. Aspetta Mario»): se sbaglia ancora, chiedere la frase detta e quella scritta; strade dopo: parole chiave al correttore anche coi formati del piatto (t6/t8/kg), `verbose_json` di Groq (`avg_logprob`) per scartare la trascrizione peggiore.
3. **C109** (domanda 🛑 di Voce 4): NON toccare `TETTO_ASCOLTO_CLIENTE` finché Mario non risponde. Accordo con la Principale 35 (messaggio 09/11 18:37 UTC): il suo codice è in `docs/lavori-in-corso/c109-codice-pronto.patch` (NON applicato). Se Mario risponde «1»: avvisare la Principale (`send_message`), lei applica la patch (worker.js `contaAIC`/`segnala`), poi in `contaAscolto` togliere `return 'tuo'` e chiamare `this.segnala('ascolto', cliente, n, SOGLIA)` quando n === soglia+1 e n === 2*soglia+1 (come `contaAIC`). Fetch e merge prima di toccare worker.js.
4. Versioni: la Principale sa che 0.9.86 è nostra (messaggio di Voce 6); la prossima libera al momento del push (`git show origin/claude/pronti-ramo-definitivo:data.js | grep VERSIONE_APP`).

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

## Domande a Mario
In «## 0. Aspetta Mario»: 🟨 Voce 5 · C105 (prova iPad, v0.9.85), 🟨 Voce 4 · 🛑 C109 (limiti per persona). Voce 6 ha scritto a Mario le due domande con il contesto e una domanda sul motore locale già risposta in Voce 5 (C108): dirgli che è superata. In Voce 6 Mario non ha scritto.

## Ultimo messaggio di Mario (parola per parola)
09/11 ~21:10, chat Voce 6 (dopo l'handoff): «non si possono avere monica e me dei limiti e i clienti altri?» → Voce 6: sì; oggi c'è solo un recinto dentro lo stesso salvadanaio (`TETTO_AI` 150 Monica, `TETTO_AIC` 60 clienti, neuroni Cloudflare in comune); separazione vera = gruppi su servizi diversi, ognuno col suo gratuito (es. clienti su Groq e Deepgram, Monica e Mario su Cloudflare). Da mettere nella domanda C108 (e C109 con la Principale).
09/11 ~21:05, chat Voce 6 (dopo l'handoff): «come condivisa con l'aiutante cosa significa?» → spiegato da Voce 6: i 10.000 neuroni gratis al giorno di Cloudflare sono un salvadanaio unico dell'account, usato sia dalle risposte dell'aiutante (Monica e clienti) sia dal secondo motore d'ascolto; quanto consuma l'aiutante è da misurare (Voce 7, punto 1).
09/11 ~20:50, chat Voce 5 (chiusa, dopo l'handoff): «vai di consiglio Per quanto riguarda la trascrizione dell'ascolto, vorrei tenere uno standard fisso. Come possiamo studiarcela? Non lo so, che facciamo che quando si finisce i limiti li scarica in automatico in un bel server? Non lo so, non ho più pallida idea. Però vorrei tenere un certo standard, uno standard di qualità fisso, buono, molto buono. Non voglio che finiscano i limiti, non voglio interruzioni dei clienti. Studiatela, ragionatela bene.»
09/11 ~20:45, chat Voce 4: «Dimmi cosa metteresti per quest'app e che regola metteresti in generale.» → proposta in `docs/lavori-in-corso/limiti-per-persona.md`, aspetta l'ok (riga 🛑 C109).
09/11 ~20:40, chat Voce 4: «Cioè, io ti ho detto un'idea, però se ci sono più cose più contro che pro, io vorrei salvaguardare il servizio del cliente e dell'amico, ecco. Cosa mi consigli tu? Valuta bene.» → Voce 4 ha consigliato i tre livelli (domanda 🛑 C109 in «0. Aspetta Mario»): C109 aspetta la risposta.
09/11 ~20:35, chat Voce 4 (dopo l'handoff), regola nuova per tutti i progetti: «Metti, aggiungi la regola come ti avevo già detto per tutto l'account, che se metti un limite per cliente non lo devi mettere per cliente, o me lo devi chiedere che cosa vuoi applicare, perché io vorrei applicare una regola che se un cliente esagera, secondo te, mi manda una segnalazione nell'app, però non vorrei, vorrei evitare di avere un'interruzione da parte del cliente, perché o del cliente o del collega o cioè della persona, perché mi sembra un'app amatoriale, ecco, se ci sono questi limiti. Quindi metterei un limite un po' ampio e se lo oltrepassa mi manda una notifica, così vedo come comportarmi, perché se esagera di molto significa c'è un problema e te lo registri tu. Se oltrepassa di poco, vediamo di aumentare un po' il limite, ecco. Però vorrei evitare le interruzioni da parte del cliente, cliente, persona, amico, eccetera, eccetera, eccetera, per tutti i progetti.» → C109, PT E41; regola nel kit: Principale.
09/11 ~20:25, chat Voce 4 (dopo l'handoff): «Ok possiamo integrarne una Locale per non consumare limiti? se molti clienti chiedono magari ci sono interruzioni per limiti».
09/11 ~20:15, chat Voce 4, con la foto dell'iPad: «non capisce bene e parlo normale».
Prima, in Voce 4: «ti ascolto frickera e la pagina deco scrollare in alto per vedere cosa dice» (→ v0.9.84); «è su app da ipad sento il  suono di attivazione microfono ma non va su android smartphone da app va cosí guarda video» (→ v0.9.82). In Voce 3: «su ipad non funziona il comando vocale e il microfono è abilitato, risolvi».

## Numeri
Controllo Da fare: 0 voci aggiunte (Mario non ha scritto in Voce 6; C105 aggiornata con la promessa 👁 di Monica su iPad).
Lezioni: prossima libera PT E42 (controlla su origin). Versione: 0.9.86 presa da Voce 6; la prossima libera al momento del push. Impegno: `.claude/settings.json` com'è (condiviso, non toccato).

## Per riaprire la catena a mano (se serve)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce N» (comando vocale dei clienti) di Pronti in Tavola, ramo claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md, poi continua da sola dal «🔴 Prossimo lavoro».»
