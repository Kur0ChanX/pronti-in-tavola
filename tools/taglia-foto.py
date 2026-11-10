#!/usr/bin/env python3
"""Taglia una foto lunga in pezzi leggibili sul telefono (C90, Mario #116).

Perché: il visualizzatore riduce una foto alta (es. 780×6400) per farla entrare nello schermo, e il testo diventa
illeggibile. Pezzi alti al massimo ~1100 px a larghezza piena restano chiari.

Uso: python3 -I tools/taglia-foto.py <foto.png> [cartella-uscita] [altezza-massima]
Scrive <nome>-1di3.png, <nome>-2di3.png… e stampa i percorsi (uno per riga). Taglia negli spazi vuoti
(le righe più uniformi vicino al punto di taglio), mai in mezzo al testo. Non cancella niente.
"""
import sys
from pathlib import Path

from PIL import Image

ALTEZZA = 1100   # px massimi per pezzo (foto a 2x di un telefono: poco più di mezza schermata alta)
FINESTRA = 0.2   # il taglio si cerca entro il 20% dell'altezza prima del punto ideale


def riga_vuota(img, y):
    """Più basso = riga più uniforme (spazio vuoto). Misura la differenza tra il pixel più chiaro e più scuro."""
    riga = img.crop((0, y, img.width, y + 1)).convert('L')
    lo, hi = riga.getextrema()
    return hi - lo


def punti_di_taglio(img, massimo):
    tagli = [0]
    while img.height - tagli[-1] > massimo:
        ideale = tagli[-1] + massimo
        minimo = tagli[-1] + int(massimo * (1 - FINESTRA))
        migliore = min(range(minimo, ideale + 1), key=lambda y: (riga_vuota(img, y), -y))
        tagli.append(migliore)
    tagli.append(img.height)
    return tagli


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    foto = Path(sys.argv[1])
    uscita = Path(sys.argv[2]) if len(sys.argv) > 2 else foto.parent
    massimo = int(sys.argv[3]) if len(sys.argv) > 3 else ALTEZZA
    uscita.mkdir(parents=True, exist_ok=True)
    img = Image.open(foto).convert('RGB')
    if img.height <= massimo * 1.15:
        print(foto)  # già abbastanza bassa: niente da tagliare
        return 0
    tagli = punti_di_taglio(img, massimo)
    n = len(tagli) - 1
    for i in range(n):
        pezzo = img.crop((0, tagli[i], img.width, tagli[i + 1]))
        p = uscita / f'{foto.stem}-{i + 1}di{n}.png'
        pezzo.save(p)
        print(p)
    return 0


if __name__ == '__main__':
    sys.exit(main())
