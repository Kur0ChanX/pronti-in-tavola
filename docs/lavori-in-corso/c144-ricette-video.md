# C144 · Ricette video (sezione a parte, divise per youtuber)

## Parole di Mario (11/11 ~19:33, Principale 65, intere)
«mettimi se puoi tutti i video delle ricette dello youtuber e metti le informazioni che hai in una sezione a parte esempio ricette video e dividi per il nome che dici? occupiamo teoppo spazio limiti ecc?»

## Fatti (11/11)
- Canale di Massimo Pietrobon Gobbi: 878 video (`.cache-stime/yt.json`, YouTube Data API). Ricette: 101 con ingredienti scritti, ~40 coi suoi valori nel titolo, ~20 col solo titolo; il resto (~714) palestra e battute. Filtro a parole: elenco intero letto prima (PT E65).
- Spazio e limiti: file del sito = «static assets», gratis e senza limiti su Cloudflare (developers.cloudflare.com «Billing and Limitations», aggiornata 03/11/2026; `run_worker_first` solo `/api/*` in `wrangler.jsonc`). Video e copertine restano su YouTube. Chiave YouTube solo per la raccolta (1 unità ogni 50 video, tetto 10.000 al giorno): l'app non la usa.

## Piano
1. `tools/raccogli_video.py` → `ricette-video.js` (file del sito): per youtuber, ogni video-ricetta con nome pulito (titoli fatti di hashtag o valori → tipo: Pancake, Porridge…), tipo, copertina, link, ingredienti se scritti, i suoi valori se scritti, sennò «≈ stimati» se la stima riesce.
2. App: Ricettario → «🎬 Ricette video» → un riquadro per youtuber (nome, quanti) → filtro per tipo → ricetta: ▶️ video, ingredienti, valori, «🏋️ anche in Proteiche» se c'è.
3. Prove, foto a Mario; online dopo il suo ok (PT E69).

## Occhio critico
- Senza rete: testi sì, video e copertine no (lo dice la scheda).
- Doppioni: le 44 già in Proteiche restano lì e qui portano il segno.
- Youtuber nuovi: per ora li aggiunge Claude (chiave YouTube solo nel contenitore); dalle Impostazioni solo se Mario lo chiede (serve la chiave sul server).

## Stato
- 11/11 #65: `tools/raccogli_video.py` (commit) legge i 878 video (cache `.cache-stime/yt-video-UCkQmObN7tBXzPQTQhlT704Q.json`, solo nel contenitore: rilanciarlo con `YOUTUBE_API_KEY` la rifà, 18 unità) → 201 ricette (`--elenco` per vederle; `ricette-video.js` NON in commit: file del sito, si pubblica col push). Lettore dei valori dell'autore corretto e provato su 7 righe vere.
- Da fare nel tool (pezzo 1, poi rilanciarlo e rileggere `--elenco` a occhio, PT E65):
  1. Tipo dal TITOLO prima (oggi «Torta brasiliana», «Crepes al cioccolato», «Muffin» finiscono in Brownie, «Frullato» in Gelati: decidono gli ingredienti).
  2. Nomi generici («Pancake», «Ricetta», «Torte e tortini», «Altro», titoli-data come «8 settembre 2026») → nome dal tipo + 2 ingredienti principali («Pancake con albumi e avena»); senza ingredienti: tipo + data.
  3. Porzioni dei suoi valori: «Per metà… / a fetta / mezzo» = già a porzione; «metà», «2 pasti», «x 2» = totali / 2; sennò ricetta intera (campo per l'etichetta).
  4. File 165 KB: `testo` a 600 caratteri.
- Pezzo 2 (app, `ricettario.js`): vista `ricvideo` (NOMI_VISTE e `case 'ricvideo'` in `app.js`), bottone pieno «🎬 Ricette video (N)» sotto `zoneRic` (la griglia delle zone ha 4 colonne: non aggiungere la quinta), un riquadro per autore (nome, quante, link al canale `CANALI_VIDEO`), filtri per tipo, `cartaRic` coi valori; `ricetta(id)`: dopo RICETTE_STIMATE cerca RICETTE_VIDEO (id `yt:`, `isStimata` già vero) → oggetto come `stimataRic` con `intro` = testo; `valoriRic`: riga «Valori scritti da <autore> nel video» se `suoi`; sezione Ingredienti nascosta se vuota. Caricamento pigro come `ricette-stimate.js` (riga 165) e il file in `FILE_APP` di `tools/sito.py`.
- Pezzo 3: prova in `tools/prova.js` (`SOLO=video`), foto a Mario (skill `foto`), online dopo il suo ok.
