# C153 · Ingredienti mancanti nelle ricette video

Mario 13/11 15:18, parola per parola (foto del Cloud bread, v0.10.27): «mancano in tutti ingredienti».
Foto: `archivio/foto/2026-11-13-1517-mario-cloud-bread-1.jpg`, `…-1518-…-2.jpg`.

## Causa
- Pietrobon scrive alcune dosi DENTRO il procedimento («aggiungete 150 ml di albume e montatelo»): il programma prendeva solo le righe a trattino.
- Il resto (91 ricette senza ingredienti, 23 senza dosi) arriva dal parlato dei video (C150): ~20 video al giorno col limite gratuito.

## Fatto (#75)
- `tools/raccogli_video.py`: `dosi_nel_testo` + `con_dosi_testo` (solo Pietrobon, solo cibi che la tabella conosce, ordine come nel testo), modo `--dosi-su`. 13 ricette con dosi in più.
- Patch `docs/lavori-in-corso/c153-dosi-procedimento.patch` (NON nel ramo, PT E69). Prove C144 e C150 verdi.
- Foto prima/dopo: `archivio/foto/2026-11-13-c153-cloud-bread-ingredienti.png`.

## Manca
- Ok di Mario sulla foto → insieme a C152 nella prossima versione, giro completo, online.
