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
- Ipotesi «ordine da approvare» (suggerita dalla #77): poco probabile. Il numero di Monica, e quindi «Scrivimi», arriva solo ai clienti già approvati (`impostazioni/approvati`, dati.js:46 e 207). Gli ordini «da approvare» Monica li vede comunque (STATO_MONICA, app.js:231).

## Quinto messaggio di Mario (13/11 18:53)
«Io voglio che sia tutto tracciato, voglio spingere il cliente a ordinare dall'app … non è la prima cosa che vede, scrivi a Monica … sennò bypassa tutto il lavoro che facciamo dell'app … la prima cosa è cercare di far ordinare e che sia tutto tracciato dall'applicazione. Tutto il resto è superfluo, i messaggi a Monica di WhatsApp, anche perché è controproducente per l'app. Inventati qualcosa di intelligente … impegnati di più e non metterci una vita.»
→ #78: piano «Messaggi dentro l'app» proposto, aspetta ok (modo di lavorare: prima ok, poi codice).

## Sesto messaggio di Mario (13/11 ~18:57)
«1 vai di consiglio. Riusciamo a metterlo dentro l'ordine? Almeno rimane tracciato questo primo ordine che gli stanno facendo dall'app … vorrei questo primo ordine dall'app. Come possiamo fare? Inventati qualcosa.»
→ «1» letto come DOMANDA 3 = 1 (piano tutto) e DOMANDA 4 = 1 (regola account con blocco). Proposto per Lisa: link col carrello pronto (aspetta ok).

## Link «carrello pronto» (#78, Mario 13/11 «1 VAI E DAMMI IL LINK PER LISA CON CARRELLO GIà PRONTO DOPO AGGIORNAMENTO DA APP»)
- `…/?ordine=<testo>` → `carrelloDaLink()` (app.js): capisce i piatti con `ordineDaMessaggio`, carrello + nota, apre il carrello; aperto due volte non raddoppia (`P.linkFatti`); niente piatti → «Scrivi a Monica» col testo. Niente consiglio del microfono sopra (`UI.linkCiao`, voce-clienti.js).
- Mario (mid-turn): messaggio carino su WhatsApp che invita a toccare il link, NON nell'app («sta già facendo 2 volte … è già la terza volta»): riquadro nell'app tolto.
- Menù vero non letto da qui (lettura di Firestore negata dal controllo di sicurezza): se «parmigiana» ha più varianti, l'app chiede a Lisa quale (un tocco).

## Tasti del menù dei clienti (Mario 13/11 ~19:30, dopo le foto `archivio/foto/2026-11-13-c155-tasti-{1,2}.png`)
- Mario: «quel tasto l'avrei messo sotto nella banda bianca … menu, i miei ordini e poi il tasto» + «il bannerino delle allergie … rimane fisso mentre scorri, un pochettino più piccolo … stretto … e sotto mettiamo Scrivi a Monica, così non rimane nessun microfono sospeso lì in basso».
- Piano proposto (#78, aspetta ok, DOMANDA 8): in cima, sotto la testata, UNA striscia sottile fissa che scorre col menù: [❤ Allergie] [🎤 Dettami l'ordine] (il microfono non galleggia più); barra bianca in basso: Menù · I miei ordini · Scrivi a Monica (icona fumetto; poi diventa «Messaggi» dentro l'app). Patch di partenza: `docs/lavori-in-corso/c155-tasti.patch` (riga «Scrivi a Monica» in fondo, da spostare nella barra). Foto coi caratteri grandi, poi ok di Mario, poi online.

## Tasti: foto v0.10.30 bocciate (Principale 79, 13/11 sera) · PT E84
- Mario, parola per parola: «No, non vanno bene per niente. Cioè, non capisco perché non mi capisci quando parlo. Cioè, ma ultimamente, prima mi capivi sempre. Non ho neanche voglia di rispiegartelo. Quando mi dici, hai una domanda, allergia, quello lì io prima ti ho detto di metterlo più piccolo, stretto, non stretto in lunghezza, ma in larghezza, e di farlo che segue la pagina. E non ho capito perché hai fatto di testa tua. Sotto ti ho detto di togliere il pulsante del microfono, di lasciarlo lì. Hai una domanda, allergia, prezzi, cosa prendere? Lì facciamo tutto insieme, sia detta l'ordine sia hai una domanda. Vedi che ci sono due tasti, ma perché non te ne accorgi? Sono gemelli. E ti ho detto di toglierlo quello in mezzo, perché l'hai lasciato? Ma non risolvere il problema, spiegami come stai ragionando.»
- ❌ Il «capito» della #78 (striscia «Hai allergie? Toccale qui» fissa, «Dettami l'ordine» rimandato) era SBAGLIATO. Patch `c155-tasti.patch` = solo la barra in basso a 3 voci (quella Mario non l'ha bocciata).
- Ho capito (❓ da confermare con Mario prima di toccare il codice): 1) il riquadro «Hai una domanda? Allergie, prezzi, cosa prendere…» più piccolo (più basso), segue la pagina mentre scorri, cliccabile bene; 2) dentro quel riquadro sia le domande sia «Dettami l'ordine»: un tasto solo, niente gemelli; 3) via il microfono che galleggia in basso («Dettami l'ordine» + microfono).
