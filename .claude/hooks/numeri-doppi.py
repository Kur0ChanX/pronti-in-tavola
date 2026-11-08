#!/usr/bin/env python3
"""Numeri doppi fra chat parallele (C89, Mario 08/11 «consiglio» = 1).

PreToolUse (Bash): prima di un `git push` controlla i file come sono adesso (vale anche per «commit && push» nello stesso comando):
- data.js: due novità con lo stesso numero di versione, o VERSIONE_APP senza la sua novità;
- docs/DA-FARE.md: due righe con lo stesso numero C.
Origin più avanti: ci pensa git (il push viene rifiutato); dopo il merge questo controllo vede i doppioni.
Trovato → il push si ferma (decisione «deny» col motivo). Qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-numeri-doppi.py
"""
import json
import os
import re
import sys

PUSH = re.compile(r'(^|[;&|(]\s*)git\s+push\b')   # solo il comando vero, non la parola dentro un testo


def doppi(lista):
    visti, dop = set(), []
    for x in lista:
        if x in visti and x not in dop:
            dop.append(x)
        visti.add(x)
    return dop


def leggi(cartella, nome):
    p = os.path.join(cartella, nome)
    return open(p, encoding='utf-8').read() if os.path.exists(p) else ''


def problemi(cartella):
    out = []
    data = leggi(cartella, 'data.js')
    m = re.search(r"const NOVITA = \[(.*?)\n\];", data, re.S)
    versioni = re.findall(r"\{ v: '([\d.]+)'", m.group(1)) if m else []
    d = doppi(versioni)
    if d:
        out.append('in data.js ci sono due novità con lo stesso numero: ' + ', '.join(d) + ' (dai il numero seguente alla tua)')
    va = re.search(r"const VERSIONE_APP = '([\d.]+)'", data)
    if va and versioni and va.group(1) not in versioni:
        out.append(f'VERSIONE_APP {va.group(1)} non ha la sua novità in NOVITA')
    d = doppi(re.findall(r'^\| (C\d+) \|', leggi(cartella, 'docs/DA-FARE.md'), re.M))
    if d:
        out.append('in docs/DA-FARE.md ci sono due voci con lo stesso numero: ' + ', '.join(d) + ' (dai a una il prossimo C libero e scrivi «era Cxx doppio»)')
    return out


def main():
    try:
        dati = json.load(sys.stdin)
        cmd = (dati.get('tool_input') or {}).get('command') or ''
        if not PUSH.search(cmd):
            return 0
        cartella = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or '.'
        p = problemi(cartella)
        if p:
            print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                                     'permissionDecisionReason': 'Numeri doppi (C89): ' + ' · '.join(p)}}))
    except Exception:
        pass
    return 0


if __name__ == '__main__':
    sys.exit(main())
