---
name: foto
description: Regole per fare e mandare a Mario le foto e i video dell'app (telefono o PC), per approvazioni, confronti prima/dopo e domande sull'aspetto; una cosa che si muove (animazione, transizione, sblocco, scorrimento) si mostra col video. Usala prima di ogni foto o video da mostrare.
---

# Foto e video per Mario

- Le fa l'agente `fotografo` (`.claude/agents/`) quando fa guadagnare tempo (`REGOLE.md` «Aiutanti»); altrimenti le faccio io con Playwright (`chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`, mai «playwright install»).
- Alta risoluzione: `deviceScaleFactor: 2`. Si mandano con lo strumento dei file (zero token).
- Un telefono per foto (al massimo due affiancati), una schermata per foto (390×844 → 780×1688), numerate «1 di 4».
- Pagine da PC in fasce orizzontali (altezza ≤ ~1100 px); confronti larghi fino a 2400 px.
- Mai una foto alta per intero (Mario #116: il visualizzatore la riduce e il testo non si legge). Foto lunghe o da scroll: `python3 -I tools/taglia-foto.py <foto.png> <cartella>` la taglia in pezzi alti al massimo ~1100 px a larghezza piena, negli spazi vuoti. Meglio ancora: una foto per schermata (viewport 390×844, scorri e scatta con `fullPage: false`).
- Al massimo 4 pezzi per messaggio, numerati «1 di 4», tutti nella stessa chiamata dello strumento dei file. Poi chiedo a Mario se si leggono bene.
- Io guardo solo una copia piccola (≤1000 px), una volta.
- Foto e domanda nello stesso messaggio, mai la foto da sola in un turno.
- Le foto da tenere vanno in `archivio/` con commit.

## Video (E247, Mario 1/11 «mandami un video se mi devi mostrare qualcosa animata»)
- Una cosa che si muove (animazione, transizione, sblocco, onda, scorrimento, una serie di tocchi) si mostra col VIDEO, mai solo con foto o «3 momenti»; al massimo una foto in più del momento chiave.
- Come: `tests/e2e/video.js` → `const v = await registra(page)`, tocchi e attese, poi `await v.ferma(`${process.env.FOTO}/<nome>.mp4`, { lento: 0.5 })` (velocità vera, poi rallentato ×0,5). Dentro una prova FOTO-only (`test.skip(!process.env.FOTO, …)`, esempio «Sblocco: video del velo» in `tests/e2e/blocco.spec.js`); con `FOTO` acceso il telefono è a 2× anche nei video (780×1688). Il registratore di Playwright nel contenitore non c'è: non cercarlo.
- Si manda con lo strumento dei file (`display: render`), con la didascalia: cosa si vede, quanto dura, «poi rallentato». Il video da tenere va in `archivio/` con commit.
- Si rimanda a ogni domanda ripetuta e nei promemoria della propria catena (l'hook `domande-chiare.py` lo controlla).
