#!/usr/bin/env python3
"""Prova di tools/confronta-foto.py (E313). Uso: python3 -I tools/test-confronta-foto.py
Foto finte: uguali → esce 1; cambiamento piccolo → un'immagine sola, larga ≥ 700 px, non più alta di 2,2 larghezze,
con il riquadro rosso; telefono (foto alta) → affiancate; cambiamento grande → foto intere."""
import os
import subprocess
import sys
import tempfile

try:
    from PIL import Image, ImageChops, ImageDraw
except ImportError:
    print('Pillow mancante: prova saltata (pip install pillow)')
    sys.exit(0)

QUI = os.path.dirname(os.path.abspath(__file__))
STRUMENTO = os.path.join(QUI, 'confronta-foto.py')
errori = 0


def foto(percorso, w, h, rettangolo=None, colore=(40, 90, 60)):
    im = Image.new('RGB', (w, h), (245, 242, 235))
    d = ImageDraw.Draw(im)
    d.text((40, 40), 'Schermata finta', fill=(30, 30, 30))
    if rettangolo:
        d.rectangle(rettangolo, fill=colore)
    im.save(percorso)
    return percorso


def lancia(*argomenti):
    return subprocess.run([sys.executable, '-I', STRUMENTO, *argomenti], capture_output=True, text=True)


def controlla(nome, ok, dettaglio=''):
    global errori
    if not ok:
        errori += 1
    print(('ok  ' if ok else 'NO  ') + nome + ('' if ok else f' → {dettaglio}'))


def rossi(percorso):
    r, g, b = Image.open(percorso).convert('RGB').split()
    m = ImageChops.multiply(r.point(lambda v: 255 if v > 200 else 0), g.point(lambda v: 255 if v < 70 else 0))
    return ImageChops.multiply(m, b.point(lambda v: 255 if v < 70 else 0)).histogram()[255]


with tempfile.TemporaryDirectory() as d:
    # PC 2732×1536: tasto in fondo a sinistra che prima non c'era
    pr = foto(os.path.join(d, 'pc-prima.png'), 2732, 1536)
    do = foto(os.path.join(d, 'pc-dopo.png'), 2732, 1536, (90, 1360, 860, 1470))
    r = lancia(pr, pr, os.path.join(d, 'uguali.png'))
    controlla('foto uguali: esce 1 e non scrive niente', r.returncode == 1 and not os.path.exists(os.path.join(d, 'uguali.png')),
              f'exit {r.returncode}')
    r = lancia(pr, do, '--testo', 'Il tasto in fondo ora si vede')
    uscita = os.path.join(d, 'pc-dopo-confronto.png')
    controlla('PC: scrive <dopo>-confronto.png', r.returncode == 0 and os.path.exists(uscita), r.stderr or r.stdout)
    if os.path.exists(uscita):
        w, h = Image.open(uscita).size
        controlla(f'PC: misure buone per il telefono ({w}×{h})', w >= 700 and h <= 2.2 * w)
        controlla('PC: zona larga → una sopra l\'altra', 'una sopra' in r.stdout, r.stdout)
        controlla('PC: c\'è lo zoom (ritaglio, non foto intera)', 'ingrandito' in r.stdout and '2732×1536 da' not in r.stdout, r.stdout)
        controlla('PC: riquadro rosso disegnato', rossi(uscita) > 2000, str(rossi(uscita)))

    # Telefono 780×1688: icona cambiata di colore in alto a destra
    tp = foto(os.path.join(d, 'tel-prima.png'), 780, 1688, (650, 60, 730, 140), (200, 200, 200))
    td = foto(os.path.join(d, 'tel-dopo.png'), 780, 1688, (650, 60, 730, 140), (240, 180, 0))
    r = lancia(tp, td, os.path.join(d, 'tel.png'))
    controlla('telefono: zona alta → affiancate', r.returncode == 0 and 'affiancate' in r.stdout, r.stdout + r.stderr)
    if os.path.exists(os.path.join(d, 'tel.png')):
        w, h = Image.open(os.path.join(d, 'tel.png')).size
        controlla(f'telefono: misure buone ({w}×{h})', w >= 700 and h <= 2.2 * w)

    # Cambiamento quasi su tutta la foto: niente zoom, foto intere
    gp = foto(os.path.join(d, 'g-prima.png'), 1000, 800)
    gd = foto(os.path.join(d, 'g-dopo.png'), 1000, 800, (0, 0, 999, 799))
    r = lancia(gp, gd, os.path.join(d, 'g.png'))
    controlla('cambiamento grande: foto intere', r.returncode == 0 and '1000×800 da (0,0)' in r.stdout, r.stdout + r.stderr)

    # Zona scelta a mano
    r = lancia(pr, do, os.path.join(d, 'mano.png'), '--zona', '0,1200,1000,336')
    controlla('--zona: ritaglio scelto a mano', r.returncode == 0 and '1000×336 da (0,1200)' in r.stdout, r.stdout + r.stderr)
    r = lancia(pr, do, '--zona', '1,2,3')
    controlla('--zona sbagliata: esce 2', r.returncode == 2, f'exit {r.returncode}')

print(f'\n{"TUTTE VERDI" if not errori else f"{errori} ROSSE"} (confronta-foto)')
sys.exit(1 if errori else 0)
