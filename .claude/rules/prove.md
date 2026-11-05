---
paths:
  - "tools/prova.js"
  - "tools/fotogrammi.js"
  - "tools/anteprima.py"
  - ".github/workflows/**"
---
# Regola a richiesta: scrivere e lanciare le prove
Si carica da sola quando apro con Read, Edit o Write un file delle prove.

## Dispositivi
- Oggi: telefono Android `Pixel 7` (Monica ha Android). Più avanti anche iPhone (`iPhone 15`) per i clienti.
- Limite onesto: l'emulazione non trova i limiti veri dei telefoni; ultima prova sul telefono di Mario.

## Lanciare e leggere le prove
- **PT** Prima `python3 -I tools/anteprima.py`, poi `node tools/prova.js`: le prove usano `dist/anteprima.html`, se no provano l'app vecchia.
- **RVC E20** Mai `prove … | grep … && git commit`: prima l'esito delle prove, poi il commit a parte.
- **RVC E22** Prova che fallisce «a volte» = difetto da trovare. Mai solo rilanciare.
- **RVC E39** Uscite delle prove in un file, mai in `head`.
- **RVC E53** Dopo il lavoro di più aiutanti: giro completo delle prove prima di «fatto».
- **RVC E54** Script di modifica: `replace(vecchio, () => nuovo)`, poi `git diff`.
- **RVC E62** Per aspettare un comando: primo piano o un file di fine, mai `pgrep -f` col testo del comando.

## Lezioni (per scriverle)
- **RVC E38** Scorrimento: tolleranza 2 px, mai il pixel esatto.
- **RVC E52** Prove con orologio fisso (`page.clock.setFixedTime`): mai dipendere dall'ora.
