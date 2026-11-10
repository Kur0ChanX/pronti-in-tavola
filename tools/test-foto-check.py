#!/usr/bin/env python3
"""Prova di .claude/hooks/foto-check.py (E294; C469 A4: entra nel pacchetto del kit). Uso: python3 -I tools/test-foto-check.py"""
import json
import os
import struct
import subprocess
import sys
import tempfile
import zlib

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, '..', '.claude', 'hooks', 'foto-check.py')
errori = 0


def png(cartella, nome, w, h):
    """Solo l'intestazione vera (firma + IHDR): l'hook legge i primi 24 byte."""
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    blocco = struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr))
    p = os.path.join(cartella, nome)
    with open(p, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + blocco)
    return p


def prova(nome, files, bloccata):
    global errori
    dati = {'tool_name': 'SendUserFile', 'tool_input': {'files': files}}
    r = subprocess.run([sys.executable, '-I', HOOK], input=json.dumps(dati), capture_output=True, text=True)
    ok = (r.returncode == 2) == bloccata
    if not ok:
        errori += 1
    print(('ok  ' if ok else 'NO  ') + nome + ('' if ok else f' → exit {r.returncode} {r.stderr.strip()}'))


with tempfile.TemporaryDirectory() as d:
    buona = png(d, 'telefono-2x.png', 780, 1600)
    prova('telefono 2x, alta ≤ 2,2 larghezze: passa', [buona], False)
    prova('bassa risoluzione (390 px): bloccata', [png(d, 'telefono-1x.png', 390, 800)], True)
    prova('foto lunga da scroll (780×4238): bloccata', [png(d, 'lunga.png', 780, 4238)], True)
    prova('una buona e una lunga: bloccata', [buona, png(d, 'lunga2.png', 800, 2000)], True)
    prova('non PNG (video): passa', [os.path.join(d, 'video.webm')], False)
    prova('PNG che non esiste: passa (niente da misurare)', [os.path.join(d, 'manca.png')], False)
    prova('nessun file: passa', [], False)
    # E313: prima e dopo separate → bloccate; il confronto (anche con una foto intera in più) passa
    pr, do = png(d, 'c409-prima-pc.png', 2732, 1536), png(d, 'c409-dopo-pc.png', 2732, 1536)
    conf = png(d, 'c409-dopo-pc-confronto.png', 1600, 1592)
    prova('E313 prima + dopo separate: bloccate', [pr, do], True)
    prova('E313 before + after (inglese): bloccate', [png(d, 'before.png', 780, 1600), png(d, 'after_1.png', 780, 1600)], True)
    prova('E313 solo il confronto: passa', [conf], False)
    prova('E313 confronto + dopo intera: passa', [conf, do], False)
    prova('E313 solo «dopo» (funzione nuova): passa', [do], False)
    prova('E313 parole che contengono «dopo» (dopopranzo): passa', [png(d, 'dopopranzo.png', 780, 1600), pr], False)
    r = subprocess.run([sys.executable, '-I', HOOK], input='non json', capture_output=True, text=True)
    if r.returncode != 0:
        errori += 1
    print(('ok  ' if r.returncode == 0 else 'NO  ') + 'entrata rotta: silenzio')

print(f'\n{"TUTTE VERDI" if not errori else f"{errori} ROSSE"} (foto-check)')
sys.exit(1 if errori else 0)
