# C155 · Messaggio WhatsApp del cliente → ordine

## Parole di Mario (13/11 18:19)
«Un cliente non proprio pratico di tecnologia gli è arrivato questo messaggio a Monica, però non c'è nessun ordine. Si può fare in modo di integrarlo all'ordine, in qualche modo in automatico?»
Foto (nome coperto): `archivio/foto/2026-11-13-1817-c155-messaggio-cliente-senza-ordine.jpg`. La cliente ha usato «Scrivimi» (`waMonica()` in app.js) e ha scritto l'ordine nel messaggio: 2 kg ravioli ricotta e spinaci, 1 parmigiana al posto della pasta al forno, la prossima settimana.

## Seconda risposta di Mario (13/11 ~18:30)
«No, troppo che Monica deve incollare e fare, voglio automatismo. Riesci innanzitutto a mettermi questo ordine dentro e far partire subito il fix?»
→ scelta: solo lato cliente, automatico (niente lavoro per Monica).

## Terza richiesta di Mario (13/11 ~18:35)
«dimmi la causa anche come è successo … Voglio tutto tracciato nell app cosí non c'è l'ordine spingi i clienti a ordinare nell app» → piano: (1) ogni messaggio di «Scrivimi» salvato nell'app (raccolta nuova `messaggi`, regole da incollare in Firebase da Mario), Monica li vede in Ordini con «diventato ordine» o «senza ordine»; (2) messaggio con numeri o kg ma piatti non capiti → prima «Ordina dal menù»; (3) per un messaggio senza ordine Monica ha un tocco «Chiedi di ordinare dall'app» (risposta WhatsApp già scritta col link).

## Fatto (patch `docs/lavori-in-corso/c155-scrivimi.patch`, v0.10.29, NON online)
- «Scrivimi» apre un foglio «Scrivi a Monica»: il cliente scrive; se `ordineDaMessaggio` (app.js, usa `capisciCliente` + `controllaAIC`) trova piatti del menù → «Sembra un ordine 🛒» (con scelta se ambiguo, es. quale parmigiana) → «Metti nel carrello» (righe + messaggio nella nota + giorno se detto e possibile) → il cliente sceglie il giorno e invia: ordine vero. Niente piatti → WhatsApp col testo già scritto (una volta sola: `window.open` senza «noopener», che dava sempre null e apriva due volte).
- «2kg» → «2 kg»; gusto: a parità vince chi ha più ingredienti detti («ricotta e spinaci» → Spinaci) in `piattiVoce` (voce-clienti.js).
- Prova `tools/prova.js` passo «Scrivimi capisce gli ordini (C155)» col messaggio vero. Foto `archivio/foto/2026-11-13-c155-scrivimi-{1..4}.png`.

## Ordine di Lisa
Da qui NON si può scrivere nel database (regole: solo Monica o la cliente dalla loro app; nessuna chiave di amministratore, giusto così). Strada: dopo la pubblicazione Monica le scrive di rimandarlo con «Scrivimi», oppure lo tiene su WhatsApp (è per la prossima settimana).

## Occhio critico
Doppione (già nel carrello: le righe si sommano con `aggiungiRiga`), piatto non nel menù (resta solo nella nota), giorno vago (lo sceglie il cliente nel carrello), cliente senza rete (capisce senza rete), messaggio che è solo una domanda con un nome di piatto («la lasagna ha glutine?»: intento non «ordina» → WhatsApp).

## Stato
Aspetta l'ok di Mario sulle foto; poi giro completo, pubblicazione, «chiudi e riapri».

## Quarto messaggio di Mario (13/11 ~18:45, dopo l'handoff)
«La cliente Lisa … ha fatto un ordine tramite l'app, però gli è arrivato solo il messaggio a Monica … vorrei evitare questa cosa che arriva solo il messaggio e nell'app non c'è traccia di nulla … Stai correggendo i gusti. Nessuno ti ha parlato di gusti … stai lavorando a testa bassa».

## Causa: cosa è PROVATO e cosa no (#78)
- PROVATO dal codice: il testo «Ciao Monica! 👋 Ti scrivo dall'app Pronti in Tavola. Sono … Volevo chiederti:» lo scrive SOLO `waMonica()` senza ordine (app.js:330-331): tasto verde «Scrivimi» in basso o «Scrivimi» nella scheda «Dove ritiri» (app.js:1149). Dentro un ordine il testo direbbe «per l'ordine n. …» (app.js:1091). Quindi il messaggio NON è partito da un ordine.
- NON provato: se Lisa ha prima provato il carrello e si è fermata. Possibili inciampi: tasto «Invia» grigio finché non sceglie il giorno (la «prossima settimana» va scelta a mano fra i giorni), scelta «ordini davvero o stai provando?», ordine minimo, «parmigiana al posto della pasta al forno» che nel carrello non si può dire senza nota. Oppure ordine segnato «di prova».
- Da qui non leggo i dati veri (nessuna chiave, giusto così): serve Monica (Ordini, anche quelli di prova) o Lisa (cosa ha toccato).
- Il gusto «ricotta e spinaci» nella patch: Mario non l'ha chiesto → da togliere dalla patch.
