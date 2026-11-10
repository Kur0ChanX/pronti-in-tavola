#!/usr/bin/env python3
"""Prove di tools/scegli-giro.py: un caso per strada (python3 -I tools/test-scegli-giro.py)."""
import importlib.util
import pathlib

spec = importlib.util.spec_from_file_location('sg', pathlib.Path(__file__).with_name('scegli-giro.py'))
sg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sg)


def minuti(gh=2764, riserva=184, bs=34, attivo=True, giorni=8):
    return {'github': gh, 'github_totale': 2000, 'riserva': riserva, 'github_per_prove': max(0, 2000 - gh - riserva),
            'blacksmith': bs, 'blacksmith_totale': 3000, 'blacksmith_attivo': attivo, 'giorni': giorni}


casi = [
    ('lavoro', minuti(), 'locale'),
    ('rosso', minuti(), 'locale'),
    ('versione', minuti(), 'blacksmith'),                         # oggi: GitHub oltre, Blacksmith quasi vuoto
    ('urgenza', minuti(), 'blacksmith'),
    ('versione', minuti(gh=500, attivo=False), 'github'),         # Blacksmith spento, GitHub con minuti
    ('versione', minuti(gh=500, bs=2990), 'github'),              # Blacksmith finito
    ('versione', minuti(gh=1800, bs=2990), 'locale'),             # GitHub solo con la riserva
    ('versione', minuti(gh=1700, bs=2990), 'locale'),             # C471: 116 liberi < 2 giri da 87
    ('versione', minuti(gh=2764, attivo=False), 'locale'),
    ('lunedi', minuti(), 'blacksmith'),
    ('lunedi', minuti(bs=2500, giorni=20), 'nessuno'),            # i minuti servono alle versioni
    # E162 (Mario #296 «1»): versioni su Blacksmith, GitHub il lunedì.
    ('versione', minuti(gh=0, riserva=700, giorni=30), 'blacksmith'),  # 1/11: anche con GitHub vuoto
    ('versione', minuti(gh=0, riserva=700, giorni=30, attivo=False), 'github'),
    ('urgenza', minuti(gh=0, riserva=700, giorni=30, bs=2990), 'github'),
    ('lunedi', minuti(gh=0, riserva=300, giorni=10), 'github'),      # secondo parere su GitHub
    ('lunedi', minuti(gh=1900, riserva=50, giorni=10), 'blacksmith'),  # GitHub solo con la riserva
]
rossi = 0
for caso, m, atteso in casi:
    posto, _ = sg.scegli(caso, m)
    if posto != atteso:
        rossi += 1
        print(f'ROSSO {caso} {m}: {posto} invece di {atteso}')
print(f'Scegli-giro: {len(casi) - rossi}/{len(casi)} casi giusti')
raise SystemExit(1 if rossi else 0)
