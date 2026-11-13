# C148 · Lista di creatori di ricette fitness da valutare

## Parole di Mario (12/11/2026 18:41, scritte nella #68, passate alla #69)
> Una domanda, non puoi mettere un play nei video e mette un player sempre che guarda non in locale, però che guarda direttamente il video su YouTube direttamente da quel player, senza che mi apra un'altra pagina che posso mettere magari schermo intero, magari mi interessa. Schermo intero e sottotitoli, il classico banner di YouTube, sottotitoli, la qualità della risoluzione, le classiche cose di YouTube, però che mi apre un player direttamente lì, direttamente in quella finestra. Io posso cliccare, zoomare, fare schermo intero in orizzontale o schermo intero in verticale. Puoi farlo. E poi dimmi se ci sono altri influencer, youtuber, tiktoker che fanno tantissime ricette fitness, che si inventano molte ricette. Fammi una lista e valutiamo chi possiamo inserire, quale di questi possiamo inserire per prenderli le ricette e portarcele da noi.

## Cosa vuole
- Prima parte (lettore dentro l'app con schermo intero, sottotitoli, qualità): è già C147, nella patch `c144-app.patch` (DOMANDA 5). Vedi `c147-video-dalla-foto.md`.
- Seconda parte (questa voce): una lista di youtuber, tiktoker e influencer che inventano tante ricette fitness; Mario sceglie chi inserire.

## Limiti già decisi
- TikTok e Instagram: niente lettura automatica (Agent Reach NO, #59: rischio e cookie). Un creatore solo TikTok o Instagram entra solo se ha anche un canale YouTube o un sito con le ricette scritte.
- YouTube: solo con l'API ufficiale (`YOUTUBE_API_KEY`), come Pietrobon e Beardedscara (`tools/raccogli_video.py`).
- Valori nutrizionali: dai suoi numeri o stimati (`tools/stima.py`), sempre con la fonte (PT E25).

## Lista (ricerca del 12/11/2026, Parallel Search; numeri dalle pagine dei canali e dei siti)
| N | Chi | Dove si prendono | Quanto | Lingua |
|---|---|---|---|---|
| 1 | Giuseppe Healthy | sito giuseppehealthy.it (ricette scritte, «approvate dai nutrizionisti») | oltre 3,7 milioni di follower | italiano |
| 2 | Fit with Fun (Nico) | sito fitwithfun.it, sezione «Ricette Proteiche», dal 2016 | centinaia (stima) | italiano |
| 3 | Cotto al Dente | YouTube | 117 mila iscritti, 1.800 video (anche allenamenti) | italiano |
| 4 | Iamfitandsweet (Michele Cipriano) | sito iamfitandsweet.com (soprattutto dolci fit) | 267 mila su Instagram | italiano |
| 5 | 2foodfitlovers (Raf e Cate) | YouTube | 724 mila iscritti, 1.900 video (molte recensioni) | italiano |
| 6 | MattsfitChef (Matteo) | sito mattsfitchef.com, valori per ricetta | 2,8 milioni su TikTok, ~33 pagine di ricette | inglese |
| 7 | Remington James | YouTube, ricette «anabolic» | 733 mila iscritti, 1.800 video | inglese |
| 8 | fitfoodieselma | YouTube | 1 milione di iscritti, 788 video | inglese |
| 9 | Stealth Health Life | YouTube, piatti con valori | 238 mila iscritti, 247 video | inglese |
Esclusi: solo Instagram o TikTok (es. Marta Ponzini, Melissa «ginni_fit»): non si leggono (#59). Greg Doucette: oggi quasi niente ricette.
Consiglio: 1 + 2 + 3 (italiani, tante ricette, grammi). Prima di leggerli: regole del sito (robots, condizioni d'uso) e grammi negli ingredienti (per `tools/stima.py`). Inglese = traduzione: rischio errori (PT E25), solo se Mario lo vuole.

## Stato
- 12/11 #69: lista fatta, DOMANDA 6 🛑 a Mario (scelga i numeri).
- 12/11 18:54 Mario (scritto nella #68), risposta alla DOMANDA 6, parola per parola: «solo ricette con i passi o con un video mettili che posso anche cercarli per youtuber o per sito».
  Scelte: 1) entrano SOLO ricette coi passi scritti o col video (come C146); 2) nell'app si cercano per youtuber o per sito (filtro per fonte: oggi c'è solo in «🎬 Ricette video» per youtuber; Proteiche e stimate non l'hanno).
  Dubbio (PT E3): «mettili» = tutti e 9 o i consigliati 1+2+3? Una riga a Mario prima di partire; consiglio: i 6 italiani subito, gli inglesi solo col suo sì (traduzione = rischio errori, PT E25).
- 12/11 20:00 Mario (nella #69, dopo le consegne), alla DOMANDA 6 riscritta (1 = i 6 italiani · 2 = tutti e 9 · 3 = solo 1+2+3), parola per parola: «sono italiani tutti direi» → scelta 1, gli italiani.
  Errore mio (PT E73): nella scelta 1 avevo messo MattsfitChef tra gli italiani, ma le sue ricette sul sito sono in inglese. Quindi entrano i 5 che scrivono in italiano: Giuseppe Healthy, Fit with Fun, Cotto al Dente, Iamfitandsweet, 2foodfitlovers. MattsfitChef solo col sì di Mario (traduzione).
  Da fare (sessione #70): per ognuno regole del sito (robots, condizioni d'uso), solo ricette coi passi o col video, ricerca per youtuber o per sito anche in Proteiche e stimate; patch, foto a Mario prima di pubblicare (PT E69).
- 12/11 21:27 Mario (nella #69), parola per parola: «solo tutti italiani e se si traducono bene metti anche quelle inglesi».
  Scelta finale: tutti gli italiani (i 5 + MattsfitChef, italiano) e anche gli inglesi (MattsfitChef, Remington James, fitfoodieselma, Stealth Health Life) SE la traduzione viene bene.
  Come (sessione #70): prima gli italiani; poi una prova di traduzione su poche ricette inglesi (grammi al posto di tazze e once, nomi degli ingredienti italiani, passi chiari) con foto a Mario prima di metterle tutte (PT E25: dosi e salute = fiducia).

## Piano #70 (13/11, dopo v0.10.24 online)
- Regole dei siti (robots.txt, 13/11): Giuseppe Healthy, Fit with Fun, Iamfitandsweet, MattsfitChef permettono le pagine delle ricette.
- Lettura provata (13/11): Fit with Fun (1.204 articoli) e Iamfitandsweet (69) hanno la ricetta in formato standard (ld+json: ingredienti, porzioni, passi; Fit with Fun anche i suoi valori). Giuseppe Healthy: pagina sua (ingredienti, passi, porzioni, video YouTube), elenco caricato a pezzi da `async-ricetta.php` → lettore apposta.
- 1) Siti: modalità `--creatori` di `tools/raccogli_stimate.py` che AGGIUNGE a `ricette-stimate.js` (non rifà Cookpad/GZ: la cache non c'è più), stessi filtri (passi o video, regola Proteiche, stima; i loro valori vincono), campo `fonte` col nome del creatore.
- 2) YouTube: Cotto al Dente e 2foodfitlovers in `CANALI` di `tools/raccogli_video.py`, controllo a occhio con `--elenco` (2foodfitlovers fa molte recensioni: fuori).
- 3) App: filtro «per creatore o sito» anche in Proteiche; prova; foto a Mario prima di pubblicare (PT E69). Poi gli inglesi: prova di traduzione su poche, foto.

## Mario 13/11 09:38 (#70, con foto dell'elenco Ricette video), parola per parola
> stai andando bene metti i voti anche fuori in vista prima di entrare valuta se tutti i tuoi voti vanno bene con la logita palestra fitness ipertrofia senza ingrassare e aggiungi gli altri youtuber influenzer video cercane tanti altri e aggiungi voglio un catalogo immenso proteico in priorità a GialloZafferano lo facciamo andare avanti piano piano alla volta giallo ma le ricette proteiche e video sono importanti se vuoi dammi anche qualche idea intelligente e geniale
- Da fare: voto visibile nelle carte degli elenchi; ricontrollo della pagella con la logica «muscoli senza ingrassare»; tanti creatori in più (cercarne altri); proteiche e video prima di GialloZafferano; idee.
- Esame del voto di oggi (`pagellaRic`, #70): proteine solo in % delle calorie (8 g in 100 kcal = verde come 40 g); calorie giudicate sulla giornata (un pasto da 650 kcal e 47 g di proteine = rosso, ma per l'ipertrofia va bene); le carte di «🎬 Ricette video» coi soli «valori del video» (kcal e proteine) NON hanno voto (mancano saturi, zuccheri, sale).
- Voto «palestra» proposto (Claude, carta bianca di Mario 09:38; si vede con la foto prima di pubblicare): 1) densità = g di proteine ogni 100 kcal (🟢 ≥ 8, 🟡 ≥ 6, 🔴 sotto); 2) dose = g di proteine nel piatto (🟢 ≥ 25 pasto / ≥ 15 snack, 🟡 ≥ 15 / ≥ 8); 3) calorie giudicate per tipo (pasto 🟢 ≤ 650, snack 🟢 ≤ 300); 4) saturi, zuccheri, sale come ora. Densità e dose pesano doppio. Valori mancanti: si stimano dagli ingredienti (come le stimate), sennò voto sulle voci che ci sono, con «≈».
- Ordine dei lavori #70: A) voto palestra + voto su tutte le carte (patch, foto a Mario); B) siti di Fit with Fun, Iamfitandsweet, Giuseppe Healthy (298 ricette trovate) e canali Cotto al Dente, 2foodfitlovers; C) ricerca di altri creatori (aiutante); D) GialloZafferano piano piano dopo.

## Mario 13/11 ~09:45 (#70), parola per parola
> Le sto facendo cercare a te su Claude perché mi ha consumato un sacco di resource dall'app. Per me l'idea sarebbe che me le cerchi in automatico dall'app, ma non so quanto sia performante, e me le carica. Solo che mi ha fatto consumare tutti i token e mi aveva bloccato l'applicazione, quindi per questo voglio evitarlo. Li faccio cercare e caricare a te.
- Scelta: le ricette le cerca e le carica Claude nelle sessioni (file del sito, zero letture del server); il motore automatico dell'app resta spento.

## Mario 13/11 ~09:50 (#70): voto personale
> nel mio utente Mario mette i voti per me invece per monica valuta in modo generico — io … vado in palestra sala pesi dalle 3 alle 5 volte a settimana per scopo addominali in vista e molta ipertrofia (età e altezza coperte, progetto pubblico)
- Scelte (Claude): utente dev (Mario) = voto «per te» dal SUO profilo palestra, che scrive lui nelle Impostazioni (peso, altezza, età, giorni di palestra, obiettivo), salvato solo nel suo profilo; Monica e gli altri = voto palestra generico.
- Obiettivo «addominali + ipertrofia» = ricomposizione: proteine 2 g per kg al giorno (tetto 2,2), divise in 4 pasti (~0,5 g/kg a pasto); calorie un po' sotto il mantenimento (Mifflin-St Jeor × attività 3-5 giorni); il voto premia densità proteica e dose vicina alla sua quota per pasto, penalizza calorie oltre la sua quota.
- 13/11 #70: C149 FATTO come patch `docs/lavori-in-corso/c149-app.patch` (voto palestra a 6 voci, voto sulle carte video, profilo palestra di Mario solo sul telefono, aiutante `imp-palestra`, prove C124/C141/C144/C100 verdi); foto `archivio/foto/2026-11-13-c149-*.png`, DOMANDA 2 🛑 a Mario. Al «1»: `git apply`, giro completo, versione 0.10.25, push.
