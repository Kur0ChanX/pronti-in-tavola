# C144 · Ricette video (sezione a parte, divise per youtuber)

## Parole di Mario (11/11 ~19:34, Principale 65, intere)
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
- 11/11: piano scritto, raccolta in corso.
