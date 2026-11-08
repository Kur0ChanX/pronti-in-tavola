#!/usr/bin/env python3
"""Numeri doppi fra chat parallele (C89, Mario 08/11 «consiglio» = 1).

PreToolUse (Bash): prima di un `git push` controlla quello che sta per partire (HEAD):
- data.js: due novità con lo stesso numero di versione, o VERSIONE_APP senza la sua novità;
- docs/DA-FARE.md: due righe con lo stesso numero C;
- origin più avanti di HEAD (un'altra chat ha salvato): prima fetch e merge, così i doppioni si vedono.
Trovato → il push si ferma (decisione «deny» col motivo). Qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-numeri-doppi.py
"""
import json
import os
import re
import subprocess
import sys

PUSH = re.compile(r'\bgit\s+push\b')


def git(*a, cartella='.'):
    r = subprocess.run(['git', *a], cwd=cartella, capture_output=True, text=True, timeout=20)
    return r.stdout if r.returncode == 0 else None


def doppi(lista):
    visti, dop = set(), []
    for x in lista:
        if x in visti and x not in dop:
            dop.append(x)
        visti.add(x)
    return dop


def problemi(cartella):
    out = []
    data = git('show', 'HEAD:data.js', cartella=cartella) or ''
    m = re.search(r"const NOVITA = \[(.*?)\n\];", data, re.S)
    versioni = re.findall(r"\{ v: '([\d.]+)'", m.group(1)) if m else []
    d = doppi(versioni)
    if d:
        out.append('in data.js ci sono due novità con lo stesso numero: ' + ', '.join(d) + ' (dai il numero seguente alla tua)')
    va = re.search(r"const VERSIONE_APP = '([\d.]+)'", data)
    if va and versioni and va.group(1) not in versioni:
        out.append(f'VERSIONE_APP {va.group(1)} non ha la sua novità in NOVITA')
    fare = git('show', 'HEAD:docs/DA-FARE.md', cartella=cartella) or ''
    d = doppi(re.findall(r'^\| (C\d+) \|', fare, re.M))
    if d:
        out.append('in docs/DA-FARE.md ci sono due voci con lo stesso numero: ' + ', '.join(d) + ' (dai a una il prossimo C libero e scrivi «era Cxx doppio»)')
    ramo = (git('rev-parse', '--abbrev-ref', 'HEAD', cartella=cartella) or '').strip()
    if ramo and ramo != 'HEAD':
        git('fetch', '-q', 'origin', ramo, cartella=cartella)
        avanti = git('rev-list', '--count', f'HEAD..origin/{ramo}', cartella=cartella)
        if avanti and avanti.strip() not in ('', '0'):
            out.append(f'su origin ci sono {avanti.strip()} commit di un\'altra chat: prima git merge origin/{ramo}, poi ricontrolla i numeri')
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
