# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 7 → Voce 8

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36); niente limiti per persona che interrompono (PT E41, il COME aspetta la domanda 🛑 C109); **C108: niente motore vocale sul telefono** («vai di consiglio») e **standard di qualità fisso, molto buono, mai limiti finiti, mai interruzioni**; **limiti separati gestori/clienti** («non si possono avere Monica e me dei limiti e i clienti altri?», 21:10: è nella strada 1 di C108).
**Da non rifare:** «capire meglio» (v0.9.85); dettatura dell'aiutante di Monica su iPad/iPhone (v0.9.86); la ricerca per C108 (prezzi, limiti Groq per modello, Deepgram, Voxtral, neuroni di Cloudflare, cambio BCE: tutto il 09/11/2026 in `docs/lavori-in-corso/standard-ascolto.md`); la domanda 🛑 C108 è GIÀ fatta a Mario (2 messaggi di Voce 7, riga in «0. Aspetta Mario»): non rifarla finché Mario non scrive. Non rileggere `voce-clienti.js`, `aiutante.js`, `worker.js` per intero: `grep -n`.
**Cosa preme a Mario adesso:** un ascolto della stessa qualità ogni giorno, senza fermare mai i clienti (C108); salvadanai separati per lui e Monica e per i clienti; che il microfono capisca bene sull'iPad (C105); niente interruzioni (C109).

Voce 7 = `session_01WTjqUvspWDANp8hbLq7V7x` (aperta da Voce 6 09/11 ~20:56, chiusa alla soglia 09/11 ~21:15; catena 7 di 8 → Voce 8 è l'ultima che apre Claude: alla prossima soglia la apre Mario). Motore: Opus 5.5.

## Stato (controlla, non fidarti)
- Online v0.9.86 (Voce 6): `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.86 e `voce-clienti.js` risponde 200 (controllati da Voce 7 alle ~21:00). Se la Principale ha pubblicato dopo: 0.9.87+, guarda `NOVITA`.
- Voce 7 non ha toccato codice: solo `docs/lavori-in-corso/standard-ascolto.md` (studio rivisto), `docs/DA-FARE.md` (riga 🛑 C108 in «0. Aspetta Mario», voce C108), questo file. Verifica: `git log --author=. --oneline -8 -- docs/lavori-in-corso/standard-ascolto.md`.
- Principale avvisata (send_message 09/11 ~21:13 a `session_01WTjqUxhhMWGG64KBFbuwNR`): se Mario sceglie 1, l'aiutante dei CLIENTI (`chiediAI` con `cliente`, `/api/aiuto-cliente`, sua zona) passa a Groq; chi lo fa si decide allora.

## 🔴 Prossimo lavoro
1. **C108 = strada 1** (Mario 09/11 ~21:20 «ascolta sempre la stessa qualità come consiglio»; C109 = 1, «limiti per persona da consiglio»). FATTO da Voce 8: `ascolta.mjs` (clienti con `DEEPGRAM_API_KEY`: Groq v3 + Deepgram Nova-3 con `keyterm` = misure + menù; riserve finché sono due: Groq turbo, Cloudflare per ultimo; chi gestisce resta Groq v3 + Cloudflare), `worker.js` passa `{ cliente: !!c }`, `sito.yml` (passo «Segreti da dare al Worker»), `tools/prova-ascolta.mjs` 27 prove. MANCA: a) Mario crea la chiave (riga in «0. Aspetta Mario»); poi rilanciare «Pubblica sito» (workflow_dispatch: il segreto entra solo a una pubblicazione) e 5-10 frasi vere a confronto; b) blocco a 400 → avviso con `segnala()` DOPO la patch C109 della Principale 36 (fetch e merge prima di `worker.js`); c) aiutante dei clienti su Groq: Principale.
2. Aspettare Mario sull'iPad (riga 🟨 Voce 5 · C105): se sbaglia ancora, chiedere la frase detta e quella scritta; strade dopo: parole chiave al correttore anche coi formati del piatto (t6/t8/kg), `verbose_json` di Groq (`avg_logprob`) per scartare la trascrizione peggiore.
3. **C109** (🛑 di Voce 4): NON toccare `TETTO_ASCOLTO_CLIENTE` finché Mario non risponde. Se «1»: la Principale applica `docs/lavori-in-corso/c109-codice-pronto.patch`, poi in `contaAscolto` togliere `return 'tuo'` e chiamare `this.segnala('ascolto', cliente, n, SOGLIA)` a n === soglia+1 e n === 2*soglia+1 (come `contaAIC`). Fetch e merge prima di toccare `worker.js`.
4. Versioni: la prossima libera al momento del push (`git show origin/claude/pronti-ramo-definitivo:data.js | grep VERSIONE_APP`).

## Fatti nuovi (09/11/2026, fonti in standard-ascolto.md)
- Mistral ha tolto il credito API gratis il 07/10/2026; due pagine ufficiali si contraddicono sull'uso gratis delle chiavi → Voxtral fuori dalla catena gratuita.
- Deepgram: 200 $ una volta, senza carta né scadenza, a secondi, Nova-3 monolingua 0,0043 $/min (multilingua 0,0052).
- Groq gratis: whisper 2.000 richieste e 28.800 s al giorno; chat qwen3.8-27b / gpt-oss-120b / gpt-oss-20b 1.000 richieste, 200.000 token al giorno e 8.000 al minuto CIASCUNO (per organizzazione); qwen3.8-27b è «preview» (può sparire).
- Neuroni Cloudflare (tariffe ufficiali × dimensioni del codice, calcolo non misura): domanda di Monica ~250-450, di un cliente ~100-200, frase ascoltata ~4; 10.000 al giorno → ~25-40 domande di Monica; si riempie all'1 di notte ora italiana. Misura vera solo dal pannello Workers AI (noi non entriamo).
- Cambio BCE 09/11/2026: 1 € = 1,1193 $.

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
In «## 0. Aspetta Mario»: 🟨 Voce 7 · 🛑 C108 (ascolto fisso, nuova), 🟨 Voce 5 · C105 (prova iPad), 🟨 Voce 4 · 🛑 C109 (limiti per persona). In Voce 7 Mario non ha scritto: le sue domande 21:05 e 21:10 erano nella chat di Voce 6, che ha risposto e me le ha girate.

## Ultimo messaggio di Mario (parola per parola)
09/11 ~21:10, chat Voce 6 (dopo l'handoff): «non si possono avere monica e me dei limiti e i clienti altri?» → Voce 6: sì; separazione vera = gruppi su servizi diversi. Voce 7 l'ha messo nella strada 1 di C108 e ha avvisato la Principale.
09/11 ~21:05, chat Voce 6: «come condivisa con l'aiutante cosa significa?» → Voce 6 ha spiegato il salvadanaio unico; Voce 7 ha mandato a Mario l'esempio con i numeri (monete = neuroni).
09/11 ~20:50, chat Voce 5: «vai di consiglio Per quanto riguarda la trascrizione dell'ascolto, vorrei tenere uno standard fisso. Come possiamo studiarcela? Non lo so, che facciamo che quando si finisce i limiti li scarica in automatico in un bel server? Non lo so, non ho più pallida idea. Però vorrei tenere un certo standard, uno standard di qualità fisso, buono, molto buono. Non voglio che finiscano i limiti, non voglio interruzioni dei clienti. Studiatela, ragionatela bene.»
Prima (Voce 4): regola PT E41 sui limiti per persona; «Ok possiamo integrarne una Locale per non consumare limiti?»; «non capisce bene e parlo normale» (foto iPad).

## Numeri
Controllo Da fare: 0 voci aggiunte (le richieste delle 21:05 e 21:10 sono già in C108, scritte da Voce 6). Lezioni: prossima libera PT E42 (controlla su origin). Impegno: `.claude/settings.json` com'è (condiviso, non toccato).

## Per riaprire la catena a mano (Voce 9 la apre Mario)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce N» (comando vocale dei clienti) di Pronti in Tavola, ramo claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md, poi continua da sola dal «🔴 Prossimo lavoro».»
