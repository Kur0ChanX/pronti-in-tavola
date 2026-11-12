# C146 · Ogni ricetta con i passi o col video

## Parole di Mario (11/11 22:50, Principale 66, intere)
Foto `archivio/foto/2026-11-11-2250-mario-stimata-cookpad-ingredienti.jpg` e `…-valori.jpg` (sul suo telefono, v0.10.23: «Pancake proteici», Cookpad, ricetta stimata C141: foto, valori, pagella 10/10, ingredienti; i passi solo col link alla fonte): «si ma senza video ne passaggi non hanno senso»

## Come l'ho letta (#66)
- «si» = «vai» alla DOMANDA 2 della #66 (aprire la #67). Se intendeva altro, lo dice alla #67.
- Regola nuova per il Ricettario: una ricetta senza passi NELL'APP e senza video non serve.

## Piano (per la #67, scelta tecnica di Claude: dirla a Mario col perché)
1. Ricette stimate di Cookpad e del blog di GialloZafferano (C141, `tools/raccogli_stimate.py`): leggere anche i PASSI dalla fonte (testo come lo scrive l'autore, PT E25; con le foto dei passi se ci sono) e metterli in `ricette-stimate.js` → nella ricetta «Passo passo» e «▶️ Ascolta» come le altre.
2. Quelle di YouTube hanno il video: restano (copertina «▶️ Guarda il video», come C144).
3. Quelle che restano senza passi né video: fuori dall'elenco (non si cancellano dal file: un filtro, così il giorno dopo non tornano).
4. Controllare anche le ricette video di C144/C145: tutte hanno il video (ok).
5. Prova (`SOLO=C141`: ogni stimata ha passi o video) e foto a Mario prima di pubblicare (PT E69).

## Stato
- 11/11 #67 FATTO nella patch `docs/lavori-in-corso/c144-app.patch` (non pubblicata, PT E69): `tools/raccogli_stimate.py --passi` ha letto i passi di 163 ricette (Cookpad, blog GZ) → 206 su 207 coi passi (100 anche con le foto dei passi), tolta «Porridge overnight alla mela» (senza passi). App: `stimataRic` usa `x.passi`, filtro `conPassiStimata` (senza passi né video fuori). Prova `SOLO=C14` verde (C141/C146 + C144). Manca: foto a Mario e il suo «1».

## Mario 12/11 18:13 (scritto nella #65, passato alla #68), parola per parola
Foto `archivio/foto/2026-11-12-1813-cookpad-passi-mario.jpg` (Cookpad, pancake: «Istruzioni per cucinare», 3 passi): «Perché in messa è scritto solo le ricette di giallo zafferano e quelle proteiche dentro non c'è nulla? Perché nessuna ricetta, non c'è praticamente nulla, solo quelle di giallo zafferano? Vedi che qualcosa c'è dentro, tu mi hai messo solo gli ingredienti. Dai, fai un lavoro fatto bene sulle ricette proteiche, per piacere, falle accuratamente una per una.»

## Controllo una per una (#68, 12/11)
- Online (v0.10.23) le stimate hanno solo gli ingredienti: i passi sono nella patch `c144-app.patch` (DOMANDA 5, non ancora pubblicata, PT E69).
- Nella patch: 206 stimate, tutte con foto; Cookpad 135 e blog 27 TUTTE coi passi (740 passi, 327 con foto); YouTube 44 col video dentro l'app e il testo dell'autore (42 su 44).
- 730 link di foto provati uno per uno: 729 vanno; 1 rifiutato dal sito (passo di `bg:luiginalaurenzi/ricetta-crema-proteica-di-zucca-e-mandorle`): nell'app ora una foto rifiutata sparisce.
- Pubblicità nei passi tolta in 2 ricette (`cp:16256583` link a un'altra ricetta, `bg:ricettiamoconmary/pizza-di-frittata` Facebook e Instagram): `senza_pubblicita` in `tools/raccogli_stimate.py`, `--pulisci` senza rete; la prova C141 ferma link e social nei passi.
- 8 ricette hanno un passo solo: l'autore le scrive così (non le divido io, PT E30).
- RicetteFit (163) e GialloZafferano (36) delle Proteiche: ingredienti e passi li legge il server quando apri la ricetta; il lettore di RicetteFit provato dal contenitore su 2 ricette vere (10-15 ingredienti, 12-13 passi). Dal vivo nell'app non posso provarlo (serve il tuo accesso).
