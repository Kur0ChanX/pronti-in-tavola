#!/usr/bin/env python3
"""Copia DI LAVORO di una foto da guardare io (PT E58 E71 E92): massimo 400 px di lato, JPEG, scritta gialla
«DI LAVORO · non è da guardare» in alto (E314). Uso: python3 -I tools/copia-lavoro.py <foto> [uscita.jpg]
Stampa il percorso e il peso; esce 1 se la copia pesa oltre 40 KB (allora non si apre)."""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(src)[0] + '-lavoro.jpg'
im = Image.open(src).convert('RGB')
im.thumbnail((400, 400))
w, h = im.size
band = 26
tela = Image.new('RGB', (w, h + band), (240, 200, 40))
tela.paste(im, (0, band))
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
except OSError:
    f = ImageFont.load_default()
ImageDraw.Draw(tela).text((6, 5), 'DI LAVORO · non è da guardare', fill='black', font=f)
tela.save(out, 'JPEG', quality=60)
kb = os.path.getsize(out) / 1024
print(f'{out} · {tela.size[0]}x{tela.size[1]} · {kb:.0f} KB')
sys.exit(1 if kb > 40 else 0)
