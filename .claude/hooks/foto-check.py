#!/usr/bin/env python3
"""Guardia delle foto a Mario (E294, Mario 04/11 18:2x: «mi stai rimandando le foto con lo scroll … a bassa risoluzione»).
PreToolUse su SendUserFile: ogni PNG mandato a Mario dev'essere in alta risoluzione (larghezza almeno 700 px, cioè
telefono a 2x) e NON una foto lunga da scroll (altezza oltre 2,2 volte la larghezza): quelle si tagliano con
tools/taglia-foto.py (skill `foto`). Le foto delle prove (`fullPage: true`) sono per le prove, non per Mario.
E313 (Mario 09/11 19:11 «le foto porter mi sembrano uguali … fai in modo che vedi il cambiamento più chiaro»):
una foto «prima» e una «dopo» mandate separate si bloccano: si manda UN confronto fatto con
tools/confronta-foto.py (zona cambiata ingrandita, PRIMA e DOPO con l'etichetta, riquadro rosso).
Zero dipendenze: legge solo l'intestazione del PNG e i nomi. Esce 2 (blocca) con il motivo."""
import json
import os
import re
import struct
import sys

LARGHEZZA_MIN = 700
RAPPORTO_MAX = 2.2
PRIMA = re.compile(r'(^|[-_. ])(prima|before)([-_. ]|$)', re.I)
DOPO = re.compile(r'(^|[-_. ])(dopo|after)([-_. ]|$)', re.I)
CONFRONTO = re.compile(r'confronto|compare', re.I)


def misura_png(percorso):
    try:
        with open(percorso, 'rb') as f:
            testa = f.read(24)
        if testa[:8] != b'\x89PNG\r\n\x1a\n':
            return None
        return struct.unpack('>II', testa[16:24])
    except OSError:
        return None


def main():
    try:
        dati = json.load(sys.stdin)
    except ValueError:
        return 0
    file = (dati.get('tool_input') or {}).get('files') or []
    problemi = []
    for p in file:
        if not str(p).lower().endswith('.png'):
            continue
        m = misura_png(p)
        if not m:
            continue
        w, h = m
        nome = os.path.basename(p)
        if w < LARGHEZZA_MIN:
            problemi.append(f'{nome}: {w}×{h}, bassa risoluzione (serve deviceScaleFactor 2: almeno {LARGHEZZA_MIN} px di larghezza)')
        elif h > RAPPORTO_MAX * w:
            problemi.append(f'{nome}: {w}×{h}, foto lunga da scroll: tagliala con python3 -I tools/taglia-foto.py e manda i pezzi')
    nomi = [os.path.splitext(os.path.basename(str(p)))[0] for p in file
            if str(p).lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    sciolte = [n for n in nomi if not CONFRONTO.search(n)]
    if any(PRIMA.search(n) for n in sciolte) and any(DOPO.search(n) for n in sciolte):
        problemi.append('foto «prima» e «dopo» separate: sul telefono sembrano uguali (E313). Manda UN confronto: '
                        'python3 -I tools/confronta-foto.py <prima> <dopo> [uscita] --testo "cosa guardare"')
    if problemi:
        print('FOTO BLOCCATA (skill foto, E294 E313): ' + ' · '.join(problemi), file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
