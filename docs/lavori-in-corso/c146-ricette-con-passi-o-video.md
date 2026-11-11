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
