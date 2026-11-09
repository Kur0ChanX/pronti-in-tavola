# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 2 → Voce 3

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36). Mario 09/11 ~17:35: «Continua con pensiero extra e se serve ripensa» (= ragiona di più, cambia strada se serve: fatto, vedi «Decisioni»).
**Da non rifare:** lo studio (`docs/SPEC-VOCE-CLIENTI.md`) e il cuore del codice: `voce-clienti.js` è SCRITTO (543 righe, sintassi ok, commit f22334b3, non collegato). Non riscriverlo né rileggerlo per intero: le funzioni che espone e i ganci esatti, con il codice già pronto da incollare, sono in `docs/lavori-in-corso/voce-clienti-ganci.md`. Non rileggere aiutante.js/worker.js per intero: righe nella specifica §1 e `grep -n`.
**Cosa preme a Mario adesso:** vedere nell'app vera il comando vocale dei clienti «veramente performante», smart e sorprendente. Finora non ha visto nulla (due sessioni di catena senza niente online): Voce 3 deve arrivare al push.

Voce 2 = `session_01WTjqUx7JeVdDBrvgVgjfXx` (aperta da Voce 1 09/11 17:11, chiusa alla soglia 09/11 ~17:45; catena 2 di 8). Ha letto il necessario (consegne, specifica, zona clienti di aiutante.js, appoggi di app.js, opzioni.js, worker.js, prova.js) e scritto `voce-clienti.js`; la soglia è arrivata prima dei ganci (il contesto parte già pesante: regole + letture mirate ≈ 150k). Lezione: Voce 3 NON deve rileggere: tutto ciò che serve è nei due file qui sopra; comandi raggruppati; `list_triggers` con `limit` 3.

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

## Stato (controlla, non fidarti)
- Ramo `claude/pronti-ramo-definitivo` = origin (f22334b3 + queste consegne): `git log -1 --oneline`. Online v0.9.78+ (la principale «🟢 🍝 Principale 34», `session_01WTjqUxkfi1LrUJwmzh137d`, pubblica spesso: prima del push `git fetch` + merge e versione libera).
- `voce-clienti.js` c'è ma NON è in index.html né in anteprima.py (`grep -n voce-clienti index.html tools/anteprima.py` → niente): online non cambia nulla finché Voce 3 non lo collega.
- Zona e file nostri: riga «Voce» di `docs/CHI-FA-COSA.md`. Sveglie di questa catena: nessuna (`list_triggers` limit 3).
- Controllo Da fare: 0 voci aggiunte (`docs/MESSAGGI-MARIO-PARALLELA.md`: nessun messaggio per questa catena dopo l'avvio).

## Prossimi passi (occhio critico prima di ognuno, C333; i ganci sono in `docs/lavori-in-corso/voce-clienti-ganci.md`)
1. Avvio: titolo «🟩 🍝 Voce 3 · collega la voce», id tuo in `docs/CHI-FA-COSA.md` («## Catene», riga Voce), fetch e merge. Prima riga a Mario: cosa farai in 3 righe, poi codice.
2. Ganci §1-§2 (index.html, anteprima.py, aiutante.js) → `python3 -I tools/anteprima.py && SOLO="C50" node tools/prova.js` (il passo C50 va aggiornato come in §6.5). Poi passo 1 delle prove (tabella di frasi): è la prova che il cuore funziona; correggi `capisciCliente` dove sbaglia (regex in `intentoVoce`, quantità in `quantitaDette`).
3. Ganci §5 (style.css) e passi 2-4 (microfono finto, ascolto preciso finto, dettatura). Foto `40-voce-clienti` da guardare (≤ 1000 px) prima di mandarla a Mario: pannello «Ti ascolto…», microfono a sinistra, «Scrivimi» a destra, niente sovrapposizioni.
4. Ganci §3 (worker.js) e §4 (opzioni.js + `tools/prova-impostazioni.js`).
5. Giro completo UNA volta in un file; versione libera + NOVITA (una riga per funzione); `docs/DA-FARE.md` C105; push → `sito.yml` success → a Mario: «chiudi e riapri l'app», Menù → microfono in basso a sinistra → «due teglie di lasagne per sabato» → «sì»; «A cosa serve». Poi prova dal vivo di `/api/ascolta` (curl col token non si può: chiedere a Mario una frase col microfono e leggere `/api/conto-ai` → `ascolti`).
6. Alla soglia: consegne qui (mai in PASSAGGIO-CONSEGNE), Voce 4 solo se resta più di mezza sessione; a lavoro finito la zona torna alla principale (skill `chat-parallela`).

## Domande aperte a Mario (non bloccanti: vai col consiglio e diglielo nel primo messaggio)
- «Sì» detto a voce mette nel carrello (fatto così, consiglio 1) oppure serve sempre il tocco su Conferma (2)? Si cambia da Impostazioni («Sì detto a voce mette nel carrello»).
- Microfono fisso a sinistra in basso nel menù e nel carrello (fatto così, consiglio 1) oppure solo nel riquadro dell'aiutante (2)? Si spegne da Impostazioni («Microfono fisso per i clienti»).

## Ultimo messaggio di Mario (parola per parola, 09/11 ~17:35, in questa chat)
«Continua con pensiero extra e se serve ripensa»
(Prima, 09/11 ~17:00, alla principale: «aggiungi una sessione parallela per un team tavola che mi potenzi molto il comando vocale per i clienti. Abbiamo potenziato quello di Monica, quello dei clienti lo voglio veramente performante a livello di lettura della voce, di quello che riesci a fare. Lo voglio ampliare molto come potenza, insomma, valuta tutto quello che si può fare per un comando vocale per il cliente. Mi sembra che chiedi a Monica, inventati cose intelligenti, smart, insomma, fai tutto quello che è in tuo potere di veramente utile al cliente, è sorprendente, ecco, innovativo.»)

## Numeri
C105 di questa catena (prossimo libero C106 detto alla principale da Voce 1). Versione: la prima libera al momento del push. Impegno: `.claude/settings.json` com'è (condiviso); Mario ha scelto «Extra» nel selettore per questa catena.

## Per riaprire la catena a mano (se serve)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce N» (comando vocale dei clienti) di Pronti in Tavola, ramo claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md, poi continua da sola dai «Prossimi passi».»
