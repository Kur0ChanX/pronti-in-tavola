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
