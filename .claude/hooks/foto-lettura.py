#!/usr/bin/env python3
"""Guardia delle foto che apro io (PT E92, Mario 14/11 «Avevamo già messo questa regola di non aprire foto troppo grandi»
→ «si aggiungilo a tutto l account»). PreToolUse su Read: un'immagine oltre 40 KB non si apre (ogni KB resta nella
conversazione e si rilegge a ogni passo). Si apre la copia fatta da `python3 -I tools/copia-lavoro.py <foto>`
(≤400 px, JPEG, scritta «DI LAVORO»). Esce 2 (blocca) col motivo; zero dipendenze."""
import json
import os
import sys

TETTO_KB = 40
IMMAGINI = ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp')

try:
    dati = json.load(sys.stdin)
except Exception:
    sys.exit(0)
p = (dati.get('tool_input') or {}).get('file_path') or ''
if not p.lower().endswith(IMMAGINI) or not os.path.isfile(p):
    sys.exit(0)
kb = os.path.getsize(p) / 1024
if kb <= TETTO_KB:
    sys.exit(0)
print(f'Foto troppo pesante da aprire: {os.path.basename(p)} pesa {kb:.0f} KB (tetto {TETTO_KB} KB, PT E92). '
      f'Prima la copia di lavoro: python3 -I tools/copia-lavoro.py "{p}" e apri il .jpg che stampa.', file=sys.stderr)
sys.exit(2)
