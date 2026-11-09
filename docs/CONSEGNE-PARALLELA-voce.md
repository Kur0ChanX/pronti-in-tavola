# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 3 (`session_01WTjqUvuFacpinWPAvkMDYG`, aperta 09/11 17:37)

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

## Stato (Voce 3, 09/11 sera; controlla, non fidarti)
- Tutto collegato: index.html, anteprima.py, aiutante.js (zona clienti), style.css `.vc-*`, worker.js `/api/ascolta` + `contaAscolto` (Groq prima per webm/ogg: Cloudflare non decodifica bene l'opus, blog 06/2026; base64 confermato dal manuale Cloudflare 09/11), opzioni.js 6 voci + tipo `scelta`, prova.js 4 passi nuovi + C50. Versione 0.9.80 in data.js, NOVITA, C105 in Da fare.
- Prove verdi in locale: 31 frasi, microfono finto, ascolto preciso finto, dettatura, C50 (`SOLO="benvenuto|voce dei clienti|C50"`). Giro completo + `prova-impostazioni.js`: vedi l'ultimo commit (se non è scritto «giro completo verde» qui, rifallo prima del push).
- Decisioni di Voce 3: `UNITA` → `UNITA_VOCE` (scontro con spesa.js); «ha il glutine?» → allergeni; a parità di punti vince la frase già giusta («lasagne» e non «la sagne»); il «sì»/«no» dopo la proposta lo sente SEMPRE il telefono (gratis, subito), mai l'ascolto preciso; senza riconoscitore (iPhone dentro WhatsApp) resta il tocco su Conferma; «parmigiana» è doppia nel menù → «Quale intendi?» (giusto così).
- Non ancora provato dal vivo: `/api/ascolta` sul sito vero (serve una frase col microfono di Mario, poi `/api/conto-ai` → `ascolti`); `env.AI.run` con audio base64 (manuale sì); Groq Whisper (chiave già nel Worker per il ponte).

## Prossimi passi (occhio critico prima di ognuno, C333)
1. Giro completo verde in locale (un file) → `git fetch` + merge → push (sito.yml pubblica dal ramo) → `actions` success → a Mario: «chiudi e riapri l'app», Menù → microfono in basso a sinistra → «due teglie di lasagne per sabato» → «sì»; «Dettami l'ordine»; «A cosa serve». Foto `40-voce-clienti` già guardata (pannello «Puoi parlarmi!» leggibile).
2. Prova dal vivo dell'ascolto preciso: Mario tocca «Dettami l'ordine» e dice una frase lunga; leggo `/api/conto-ai` (`ascolti`) e, se fallisce, i log del Worker. Se Cloudflare sbaglia con webm, resta Groq (già prima per webm).
3. Chiusura della voce 👁 di C105 solo con la foto o la lettura di Mario; poi la zona torna alla principale (skill `chat-parallela`), riga in CHI-FA-COSA.
4. Idee dopo (non fatte, da proporre a Mario): «ripeti» legge l'ultima risposta; suggerimenti a voce nel carrello («manca il giorno: per quando?»); voce di Monica che legge gli ordini dettati.

## Domande a Mario: nessuna aperta
Mario (09/11, nella chat Voce 1, girato da Voce 1 con send_message): «Vai avanti da solo» = vale il consiglio per entrambe: 1) il «sì» detto a voce mette nel carrello (l'ordine parte solo con «Invia»); 2) microfono grande fisso nel menù e nel carrello (Voce 1 scriveva «a destra»: a destra c'è già «Scrivimi», quindi va a SINISTRA, stessa altezza; se Mario lo vuole a destra basta spostare `.vc-fabs`). Niente altro da chiedergli: lavorare da sola fino alla versione online e dirglielo con «chiudi e riapri l'app» e dove toccare.

## Ultimo messaggio di Mario (parola per parola)
09/11 ~17:35 in questa chat: «Continua con pensiero extra e se serve ripensa». 09/11, nella chat Voce 1 (girato da Voce 1): «Vai avanti da solo».
(Prima, 09/11 ~17:00, alla principale: «aggiungi una sessione parallela per un team tavola che mi potenzi molto il comando vocale per i clienti. Abbiamo potenziato quello di Monica, quello dei clienti lo voglio veramente performante a livello di lettura della voce, di quello che riesci a fare. Lo voglio ampliare molto come potenza, insomma, valuta tutto quello che si può fare per un comando vocale per il cliente. Mi sembra che chiedi a Monica, inventati cose intelligenti, smart, insomma, fai tutto quello che è in tuo potere di veramente utile al cliente, è sorprendente, ecco, innovativo.»)

## Numeri
C105 di questa catena (prossimo libero C106 detto alla principale da Voce 1). Versione: la prima libera al momento del push. Impegno: `.claude/settings.json` com'è (condiviso); Mario ha scelto «Extra» nel selettore per questa catena.

## Per riaprire la catena a mano (se serve)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce N» (comando vocale dei clienti) di Pronti in Tavola, ramo claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md, poi continua da sola dai «Prossimi passi».»
