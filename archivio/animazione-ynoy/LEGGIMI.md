# Animazione «Powered by YNOY» (firma scritta a mano)

Copia fedele dell'animazione di apertura dell'app Pronti in Tavola (09/11/2026), staccata dal resto dell'app.
Per chi la riceve (un'altra sessione di Claude o una persona): **la fonte di verità è `ynoy-animazione.html`**.
È il codice esatto: ogni fotogramma si rifà identico. I video servono a vederla, il codice a rifarla.

## I file
| File | A cosa serve |
|---|---|
| `ynoy-animazione.html` | Pagina unica, logo già dentro (base64). Aprila in un browser: parte da sola, «▶ Rivedi» la rifà. Unica cosa esterna: il carattere Nunito Sans di Google Fonts. |
| `ynoy-animazione-4k-60fps.mp4` | Video 3840×2160, 60 fotogrammi al secondo, registrato fotogramma per fotogramma (nessun fotogramma perso), 3,9 s. |
| `ynoy-animazione-1080p-60fps.mp4` | Lo stesso, 1920×1080, più leggero. |
| `ynoy-fotogrammi-ogni-10.png` | 24 fotogrammi in griglia (uno ogni 10, cioè ogni 1/6 di secondo): per capire il movimento senza guardare il video. |

## Come è fatta (3 fasi)
1. **«POWERED BY» cade**: 10 lettere (`em`), ognuna con `byDrop` (0,55 s, molla `cubic-bezier(.3,1.6,.5,1)`): parte 26 px più in alto, ruotata di −25°, e atterra. Una lettera ogni 40 ms, da 0,30 s.
2. **YNOY scritto a mano** (il cuore dell'effetto, da 0,70 s a ~2,3 s):
   - il logo è un PNG trasparente (`ynoy-firma`, 992×380, mostrato a 496×190) dentro un `<mask>` SVG (`#ylg`);
   - sopra, un secondo `<mask>` (`#ywm`) con **22 tratti** (`<path>` bianchi, `pathLength="100"`) che seguono a mano le linee del logo: il logo si vede solo dove la «penna» è già passata;
   - ogni tratto si disegna con `stroke-dasharray: 100 300` e `stroke-dashoffset` da `--o` (105-115) a 0 (keyframes `yStroke`, curva `cubic-bezier(.4,.1,.6,.9)`);
   - ogni tratto ha il **suo spessore** (`stroke-width` 10-19), il **suo ritardo** e la **sua durata** (44-110 ms): i tratti partono uno dopo l'altro, come una mano che scrive;
   - il filo lungo della Y verso la coda parte piano e finisce veloce, come una firma vera.
3. **Riflesso finale** (2,33 s): compare il logo pieno (`i.y0`, stesso PNG come maschera CSS) e una luce chiara `#FFF1DC` lo attraversa da destra a sinistra (`ynoyShine`, 0,55 s).

Colori: bordeaux `#7B2318` (logo), marrone chiaro `#9A7D66` (scritta), sfondo crema con sfumatura radiale `#FFFBF3 → #FBF4E8 → #EFDDBF`.
Nell'app tutto parte 1,4 s più tardi (prima si vede il logo di Pronti in Tavola) e il logo è largo al massimo 150 px; qui è largo fino a 640 px.

## Per usarla in un altro progetto
- **Stesso logo YNOY**: copia `ynoy-animazione.html` così com'è (o solo il blocco `.wall-by` e lo stile), cambia colori e dimensioni a piacere.
- **Altro logo**: i 22 tratti sono disegnati sopra le linee di QUESTO logo (coordinate nel riquadro 496×190). Per un logo diverso vanno ritracciati: un `<path>` per ogni gesto della penna, nell'ordine in cui lo scriverebbe una mano, spessore appena più largo della linea che copre.
- Per registrare un video uguale: aprire la pagina con `?registra` (nasconde il pulsante), mettere in pausa le animazioni (`document.getAnimations()`), portarle a ogni istante con `currentTime` e fare una foto per fotogramma (così non se ne perde nessuno).
