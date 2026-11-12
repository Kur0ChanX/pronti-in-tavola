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

## Stato
- 12/11 #69: ricerca in corso (skill `ricerca-aggiornata`).
