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
- 11/11 #66 pezzo 1 FATTO (commit): 200 ricette su 878 video (132 coi suoi valori, 43 «≈ stimati», 25 senza valori; 7 doppioni tolti). Tipo dal titolo (il cibo nominato prima vince), nomi generici → cibo + 2 ingredienti («Pancake con uova e albumi») o cibo + data («Pancake del 27 nov 2025»), porzioni dei suoi valori (sempre a porzione nel file, campo `porzioni`), grassi «senza nome» presi dopo le proteine (prima prendeva quelli della mezza porzione), file 160 KB. Verifica: `python3 -I tools/raccogli_video.py --elenco | grep -c '  SÌ'` → 200.
- 11/11 #66 pezzo 2 FATTO come PATCH (non in commit: i `.js` pubblicano, PT E69): `docs/lavori-in-corso/c144-app.patch` (`ricettario.js` vista `ricvideo` e `videoRic`, bottone «🎬 Ricette video (N)» sotto le zone, riquadro per youtuber, tipi compatti, carte col ▶, ricetta con copertina «▶️ Guarda il video su YouTube», «Valori scritti da…», ingredienti solo se ci sono, «Indietro» all'elenco, preferite video nelle Preferite; `app.js` vista e nome; `style.css`; `tools/sito.py` FILE_APP; `tools/prova.js` prova C144; `ricette-video.js` 201 ricette). Verifica: `git apply --check docs/lavori-in-corso/c144-app.patch`.
- Pezzo 3: prova `SOLO=C144 node tools/prova.js` VERDE (#66, Pixel 7, anteprima); foto `archivio/foto/2026-11-11-1956-c144-ricette-video-1..4.png` mandate a Mario (🛑 aspetta «1»). Al «1»: `git apply docs/lavori-in-corso/c144-app.patch`, `python3 -I tools/anteprima.py`, giro completo `node tools/prova.js` (0 «NO»), commit, push (pubblica), `curl` di `ricette-video.js` dal sito (PT E38), patch tolta.
- Scelte: video aperto su YouTube (link), non dentro l'app (niente iframe: meno rischi su iPhone e senza rete); `ricette-video.js` NON nel GUSCIO di `sw.js` come `ricette-stimate.js` (solo per chi gestisce; la copia la fa `primaRete` al primo uso).
- Da guardare dopo (C141): «Fulldayofeating in scarica a 2000 kcal» è fra le Proteiche stimate ma è una giornata di pasti, non una ricetta (qui esclusa da `MAI_RICETTE`).
- 11/11 #67: la patch ora contiene anche C145 (Beardedscara, 67 ricette), C146 (passi delle stimate) e C147 (video dentro l'app). Prove `SOLO=C14` verdi. Foto vecchie superate: servono foto nuove per C144-C147 insieme.
