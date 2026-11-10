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

## Scritta su ogni immagine (E314, Mario 09/11 ~20:0x «metti nelle regole come in questi casi che mi scrivi prima o vecchia nella foto»)
- Mario vede ogni immagine che apro, anche quelle di lavoro lette con Read (l'app le mostra). Ognuna porta in alto, grande e su fondo pieno, cosa è:
  - **PRIMA · VECCHIA** (grigio): stato di prima o versione vecchia (es. l'ordine vecchio dei tratti);
  - **DOPO · NUOVA** (verde): com'è adesso;
  - **DI LAVORO · non è da guardare** (giallo): misure, numeri, tratti colorati che servono solo a me.
- Numeri e scritte dentro l'immagine non si toccano né si sovrappongono (due numeri vicini si leggono come uno: «1» e «3» → «13»).
- Si fa nello stesso script che crea l'immagine, prima di aprirla; `confronta-foto.py` lo fa già per i confronti.

## Prima e dopo (E313, Mario 09/11 «le foto mi sembrano uguali … fai in modo che vedi il cambiamento più chiaro»)
- Mai due foto intere separate: sul telefono sembrano uguali se cambia un pezzetto. Si manda UN confronto: `python3 -I tools/confronta-foto.py <prima> <dopo> [uscita] --testo "cosa guardare"` (l'hook `foto-check.py` ferma le coppie «prima»/«dopo» sciolte).
- Lo strumento trova da solo dove cambia, ingrandisce la zona, mette PRIMA (grigio) e DOPO (verde) uno sopra l'altro o affiancati, riquadro rosso sul cambiamento e la schermata intera piccola per sapere dov'è.
- `--testo`: in parole semplici dove guardare e cosa è cambiato («in fondo al foglio: prima il tasto era tagliato, ora si vede»); la didascalia del messaggio dice lo stesso.
- Prima di mandarlo lo guardo una volta: la differenza si vede in 2 secondi? Se no, `--zona x,y,l,a` più stretta. Esce 1 (foto uguali) = non si manda: foto sbagliata o codice non arrivato, cerco il perché.
- Cambiamenti in più punti lontani (lo strumento lo scrive): un confronto per zona con `--zona`, al massimo 4. Un cambiamento che si muove o che si vede solo scorrendo: video, oppure il confronto dei due momenti.
- Le due foto si fanno uguali in tutto il resto (stessa misura, stessi dati, stesso punto di scorrimento): sennò ogni pixel cambia e il riquadro prende tutto.

## Video (E247, Mario 1/11 «mandami un video se mi devi mostrare qualcosa animata»)
- Una cosa che si muove (animazione, transizione, sblocco, onda, scorrimento, una serie di tocchi) si mostra col VIDEO, mai solo con foto o «3 momenti»; al massimo una foto in più del momento chiave.
- Come: `tests/e2e/video.js` → `const v = await registra(page)`, tocchi e attese, poi `await v.ferma(`${process.env.FOTO}/<nome>.mp4`, { lento: 0.5 })` (velocità vera, poi rallentato ×0,5). Dentro una prova FOTO-only (`test.skip(!process.env.FOTO, …)`, esempio «Sblocco: video del velo» in `tests/e2e/blocco.spec.js`); con `FOTO` acceso il telefono è a 2× anche nei video (780×1688). Il registratore di Playwright nel contenitore non c'è: non cercarlo.
- Si manda con lo strumento dei file (`display: render`), con la didascalia: cosa si vede, quanto dura, «poi rallentato». Il video da tenere va in `archivio/` con commit.
- Si rimanda a ogni domanda ripetuta e nei promemoria della propria catena (l'hook `domande-chiare.py` lo controlla).

## Lezioni dal diario (spostate intere da `docs/ERRORI.md`, C469 A6, 09/11)
- **E294** Foto a Mario prese dalla prova (`fullPage: true`, 780×4238): lunga da scroll e piccola nel visualizzatore (04/11 18:2x). Le foto delle prove sono per le prove; a Mario solo pezzi alti ≤ 2,2 larghezze, 2x: lo blocca l'hook `foto-check.py`.
- **E284** Foto di 5stelle «coperte»: si controlla TUTTA la foto (il Planner dietro la finestra e la testata della scheda mostravano ancora nomi di ospiti, 531 → ricoperte dalla 532). Prima del commit: rettangoli anche sullo sfondo, poi guardo ogni foto una volta.
- **E317** Video 4 del logo guardato solo alla fine: la «gobba» spuntava a metà (6,6 s), quando il braccio destro riempiva l'angolo lasciato mezzo vuoto dal sinistro (Mario 09/11 22:2x). Un'animazione si controlla in TUTTI i momenti: fotogrammi ingranditi ogni 0,2 s del punto chiesto.
- **E315** Video 2 del logo mandato senza guardarne ingrandite giunture e fine: la Y scopriva un pezzo della N, la cornice verde passava in un attimo (Mario 09/11 20:57). Prima di mandare: fotogrammi ingranditi di ogni punto chiesto.
