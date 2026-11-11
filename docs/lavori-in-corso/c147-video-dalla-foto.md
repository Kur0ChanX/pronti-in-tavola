# C147 · Il video parte dalla foto della ricetta, dentro l'app

## Parole di Mario (11/11 22:54, Principale 67, intere)
Foto `archivio/foto/2026-11-11-2254-mario-spumone-video.jpg` (sul suo telefono, v0.10.23: «Spumone», ricetta stimata da YouTube; in alto la copertina del video, ferma): «metti i video che partono da lì»

## Come l'ho letta (#67)
- Toccando la foto della ricetta il video parte DENTRO l'app (prima: niente, o con la patch di C144 si apriva YouTube fuori). Cambia la scelta della #66 («link a YouTube, niente iframe»): la chiede Mario.

## Scelte (Claude, #67)
- Il video si apre grande sopra la ricetta, in un riquadro suo fuori da `#app` (`apriVideoYt` in `ricettario.js`): `render()` riscrive `#app` a ogni cambio (un ordine che arriva) e fermerebbe un video messo al posto della foto. «✕ Chiudi il video» e il gesto indietro lo chiudono; l'aggiornamento automatico aspetta che il video sia chiuso.
- Lettore `youtube-nocookie.com/embed/ID?autoplay=1&playsinline=1` con `referrerpolicy="strict-origin-when-cross-origin"`: YouTube vuole il sito d'origine (sennò «errore 153»; pagina Google «Required Minimum Functionality», aggiornata il 06/11/2026). Sotto: «Non parte? Aprilo su YouTube ↗» (video con l'incorporamento vietato dall'autore).
- Senza rete: avviso, il video non si apre. Vale per tutte le ricette `yt:` (stimate C141 e video C144/C145).
- Da provare sul telefono vero (Android di Mario; iPhone quando ne ha uno, C113): il riquadro di prova non ha YouTube.

## Stato
- 11/11 #67 FATTO nella patch unica `docs/lavori-in-corso/c144-app.patch` (`apriVideoYt`, `chiudiVideoYt`, gesto indietro, aggiornamento che aspetta), prova C147 dentro `SOLO=C144` verde. Manca: foto a Mario e il suo «1»; prova sul telefono vero.
