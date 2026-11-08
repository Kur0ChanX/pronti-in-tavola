# Diario degli errori (lezioni)

Si legge a ogni avvio. Una riga per errore: la lezione da ricordare.
Le lezioni per scrivere e lanciare le prove sono in `.claude/rules/prove.md`, quelle del codice in `.claude/rules/codice.md`.

## Pronti in Tavola
- **PT E1** (05/11/2026) Il logo di Mario è YNOY Corp con le **4 lune** (lo stesso di Jona, `media/ynoy-firma.png`). In RVC `archivio/loghi/` ci sono versioni vecchie con la scia tratteggiata: mai usarle. La firma «Powered by YNOY» si copia così com'è dall'apertura di Jona.
- **PT E2** (05/11/2026) L'apertura animata si vede a OGNI apertura dell'app (si salta con un tocco) e parte solo quando la pagina è visibile e le immagini sono pronte: «una volta al giorno» Mario non la vedeva mai. Il logo YNOY con le 4 lune deve essere grande e ben visibile.
- **PT E3** (05/11/2026) «Se clicchi salta l'animazione» voleva dire: un tocco ovunque (anche sul logo) deve saltarla. Nel dubbio su una frase di Mario, chiedere in una riga prima di cambiare.
- **PT E4** (05/11/2026) In Claude Code ho rifatto domande (cos'è l'app, chi la usa) già spiegate nella chat che non posso vedere. Se un'informazione non è nella sessione o nel repository, dirlo una volta chiaramente e chiedere tutto insieme, senza ripetere.
- **PT E5** (05/11/2026) L'app non deve usare i limiti gratuiti condivisi con altre app di Mario (Firebase, Cloudflare) né pesare su di esse: servizi su account solo dell'app. Avevo proposto il Worker sull'account Cloudflare comune.
- **PT E6** (05/11/2026) Guida a mano sbagliata («icona Web al centro» invece di «+ Aggiungi app»): ogni volta che vedo che una guida era sbagliata scrivo subito quella giusta in `docs/GUIDE-GIUSTE.md` (come l'ha vista Mario) e la leggo prima di rifare quella guida (Mario 05/11).
- **PT E7** (05/11/2026) Ho chiesto a Mario della «lista Hai detto di no» senza spiegare cosa fosse: nome mio, nessun esempio. Mario: «in che senso? sei sicuro?». Ogni funzione nuova: prima un esempio con una persona vera («Laura tocca No per sbaglio…»), poi il nome nelle sue parole, poi le scelte numerate.
- **PT E8** (05/11/2026) Mario: «il carrello che ti avevo detto» = la **lista della spesa** (Fase 2, C6: dosi per ricetta → spesa dagli ordini). Ho cercato solo «carrello» e ho chiesto a lui e alla #8. Prima di dire «non lo trovo»: cercare anche i sinonimi e le voci di Da fare (spesa, dosi, ingredienti), e proporre la più probabile.
- **PT E9** (07/11/2026) Cloudflare↔GitHub: 2 ore di giri sul telefono (Mario: «siamo 2 ore, cerca bene», «non inventarti nulla»). Prima di guidare un collegamento fra servizi: cercare SUBITO bug noti e soluzioni nei forum, dare link diretti provati e passi chiari; dopo 2 giri uguali fermarsi e cambiare strada (es. PC invece del telefono).
- **PT E10** (07/11/2026) Ho dato la colpa al browser del telefono (2 volte) senza prova: anche dal PC il giro è uguale (Mario: «mi stai prendendo in giro»). Una causa si dice solo quando un esperimento la conferma; altrimenti «ipotesi».
- **PT E11** (07/11/2026) Ho proposto e fatto le etichette per la stampantina termica in bianco e nero: Mario «in bianco e nero no». Le etichette restano a colori; prima di proporre un modo di stampa, chiedere se il colore serve.

## Lezioni ereditate da RVC (numeri «RVC E..»)
- **RVC E1** Si lavora solo in Claude Code. Ogni file ricevuto va subito in `archivio/` con commit.
- **RVC E7** Prima di chiedere a Mario (o di scrivere un prompt a un aiutante), `grep` in documenti e archivio.
- **RVC E11** La sessione nuova la apre Claude con `create_session` (catena di 8); a 8 la apre Mario: nel testo per lui il repo esatto e il ramo.
- **RVC E19** «unrelated histories» dopo uno squash: prima `git fetch --unshallow origin`, poi merge normale.
- **RVC E20** Mai `prove … | grep … && git commit`: prima l'esito delle prove, poi il commit a parte.
- **RVC E21** Mai inventare il nome di un pulsante. Nel selettore: medium = «Medio», high = «Alto», xhigh = «Extra».
- **RVC E23 E32 E33 E36** Prima `grep -n`, poi solo le righe utili. All'avvio niente `list_sessions` completo, `actions_list`, `list_events`, `Artifact read` di controllo.
- **RVC E24** Un solo ramo. Il ramo nuovo per sessione ha diviso il lavoro in due.
- **RVC E28** Mai `add_repo` di un secondo repo: spegne in silenzio gli hook.
- **RVC E29** Segreti mai in chat né nel repo: vanno nelle impostazioni dell'ambiente.
- **RVC E30** Mai dire «non è successo» senza una prova che lo possa vedere.
- **RVC E31** Dopo lo squash: unire `main` PRIMA di ogni altro commit.
- **RVC E37 E48 E49** Foto: io guardo un'anteprima ≤1000 px; a Mario un telefono per foto, una schermata per foto, pezzi alti al massimo ~1100 px.
- **RVC E59** File di `.claude/`: ok di Mario (scritto) nella chat di quella sessione.
- **RVC E60** Dopo un riavvio: unire la scorta e leggere `docs/ULTIMO-MESSAGGIO.md`.
- **RVC E64** Scheda delle domande persa: rifarla subito, scritta anche in chiaro con le scelte numerate. Foto e domanda nello stesso messaggio.
- **RVC E61** Prima di ogni push `git fetch`: lavoro di un'altra chat si unisce con un merge normale, mai forzare.
- **RVC E65** Dopo «worker process was restarted»: se il mio ultimo passo era uno strumento e non il resoconto a Mario, il turno NON è finito: continuo e scrivo il resoconto.
- **RVC E66** `effort_level` assente in `get_session` = Mario non l'ha scelto nel selettore: non prova «normale». `"effortLevel"` in `.claude/settings.json` vale anche nel cloud.
- **RVC E67** File con righe lunghissime (tabelle): `grep -n -o '.\{0,80\}parola.\{0,80\}'`, mai `grep` semplice (una riga sola = migliaia di token).
- **PT E12** (07/11/2026) Dicevo «no, sbagliato» a una foto senza dire PERCHÉ (UID in «ID raccolta» invece che in «ID documento»): 3 volte, Mario irritato. Davanti a un errore in un passo a mano: spiega subito dove va ogni cosa (metafora) e quale casella è quella sbagliata.
- **PT E13** (07/11/2026) La Home del gestore diceva sempre «Ciao Monica»: Mario, entrato col suo Google, si è visto chiamare Monica («lo fai apposta?»). Ogni nome di persona nelle schermate viene dai dati (`gestori/<UID>.nome`), mai scritto nel codice.
- **PT E14** (07/11/2026) Ho dato a Mario il link nudo per Monica, senza pensare a un invito curato: «fai le cose da robot, senza inventiva, poche strategie, idee geniali». Vale per TUTTO, non solo gli inviti: a ogni lavoro PROPONGO a Mario, senza che lo chieda, soluzioni smart, innovative, geniali e professionali; decide lui (mai decidere al posto suo); il minimo che funziona non basta. Una regola si scrive generale, mai legata al caso che l'ha fatta nascere.
- **PT E15** (07/11/2026) L'invito su WhatsApp non si apriva (Mario: «se cliccano non funziona il link»): il link prendeva l'indirizzo salvato nei dati di Firebase (ancora `pages.dev`, mai esistito) e non quello corretto in `data.js`. Correggere un indirizzo nel codice non basta: controllare anche dove è salvato nei dati; ora l'app usa sempre `SITO` da `data.js`.
- **PT E16** (07/11/2026) Su iPhone (ospite) l'apertura mostrava il medaglione come un riquadro bianco (foto di Mario): Safari sbaglia il `filter` animato da `blur` a `drop-shadow`. Animazioni nuove: provarle anche su Safari, o niente filtri animati su iPhone (`@supports (-webkit-touch-callout: none)`).
- **PT E17** (07/11/2026) L'app diceva «A Monica è arrivata la notifica» ma le notifiche vere non esistono ancora (C3): Mario le ha aspettate invano. Mai scrivere nelle schermate una funzione che non c'è: testi onesti finché non è fatta.
- **PT E18** (07/11/2026) Ho messo nel riquadro di codice un link che Mario doveva solo APRIRE (Firebase → Regole): «se mi dici apri questo link mi devi mandare il link cliccabile, se mi dici copia mi devi mandare il link copiabile». Link da aprire = cliccabile; link da copiare = riquadro.
- **PT E19** (07/11/2026) «Solo tema chiaro» col `color-scheme: only light` non basta: Samsung Internet (browser dei Samsung, si apre dai link di WhatsApp) scurisce da solo ogni sito e lo ignora (Mario: «no no, è uscito sul telefono di Barbara»). Prima di dire «tolto» cercare come si comporta OGNI browser dei telefoni veri (Samsung Internet compreso); per Samsung: pulsante «Apri in Chrome».
- **PT E20** (07/11/2026) Il pulsante «ordini → PROVA» stava dietro 7 tocchi sulla firma E dentro «Altre impostazioni»: Mario non lo trovava. Un comando che Mario deve usare subito va in vista (in cima, solo per lui), con conferma chiara; i 7 tocchi solo per cose di rado.
- **PT E21** (08/11/2026) «Scrivi a Monica»: Mario non vedeva nome e cognome nel messaggio WhatsApp. Ipotesi (non provata): guardava come cliente col suo accesso da gestore, e lì il nome del cliente non c'è. Ogni testo con il nome di chi scrive: un'alternativa sempre presente, e la prova anche con «guarda come».
- **PT E22** (08/11/2026) Mario: «hai diverse cose che ti ho chiesto non fatte… guida account api groq». Avevo proposto il ponte con un servizio nuovo senza dare SUBITO la guida per crearlo, e non avevo detto che le novità si vedono solo dopo aver riaperto l'app. Quando propongo un servizio, nello stesso messaggio: guida passo passo e testo pronto; dopo ogni pubblicazione: «chiudi e riapri l'app per vederla».
