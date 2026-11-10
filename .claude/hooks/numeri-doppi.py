#!/usr/bin/env python3
"""Numeri doppi fra chat parallele (kit 37.2; da Pronti in Tavola C89, Mario «come consiglio», per tutti i progetti).

PreToolUse (Bash): prima di un `git push` (anche «commit && push» nello stesso comando) legge i file come sono adesso e
ferma il push («deny» col motivo) se due voci hanno lo stesso numero: due chat sullo stesso ramo avevano preso lo stesso
numero (voce C di Da fare, versione dell'app), 3 volte l'08/11 a Pronti in Tavola.
Cosa guardare: `.claude/numeri-doppi.json` del progetto, un elenco di
  {"file": percorso, "modello": regex con un gruppo (il numero), "cosa": nome, "rimedio": cosa fare,
   "presente": regex facoltativa con un gruppo: quel numero deve stare fra quelli trovati (es. la versione dell'app)}.
Senza il file: solo docs/DA-FARE.md, righe «| C<n> |». Origin più avanti: lo dice git (push rifiutato); dopo il merge
questo controllo vede i doppioni. Qualunque errore: silenzio, uscita 0. Prova: python3 -I tools/test-numeri-doppi.py
"""
import json
import os
import re
import sys

PUSH = re.compile(r'(^|[;&|(]\s*)git\s+push\b')  # solo il comando vero, non la parola dentro un testo
DI_BASE = [{"file": "docs/DA-FARE.md", "modello": r"^\| (C\d+) \|", "cosa": "voci di docs/DA-FARE.md",
            "rimedio": "dai a una il prossimo C libero (dopo git fetch e git grep) e scrivi «era Cxx doppio»"}]


def doppi(lista):
    visti, dop = set(), []
    for x in lista:
        if x in visti and x not in dop:
            dop.append(x)
        visti.add(x)
    return dop


def leggi(cartella, nome):
    p = os.path.join(cartella, nome)
    return open(p, encoding='utf-8').read() if os.path.isfile(p) else ''


def controlli(cartella):
    testo = leggi(cartella, os.path.join('.claude', 'numeri-doppi.json'))
    voci = json.loads(testo) if testo.strip() else DI_BASE
    return [v for v in voci if isinstance(v, dict) and v.get('file') and v.get('modello')]


def problemi(cartella):
    out = []
    for v in controlli(cartella):
        testo = leggi(cartella, v['file'])
        if not testo:
            continue
        numeri = re.findall(v['modello'], testo, re.M)
        cosa = v.get('cosa') or v['file']
        d = doppi(numeri)
        if d:
            out.append(f"{cosa}: stesso numero due volte: {', '.join(d)} ({v.get('rimedio') or 'dai alla tua il numero seguente'})")
        if v.get('presente'):
            m = re.search(v['presente'], testo, re.M)
            if m and numeri and m.group(1) not in numeri:
                out.append(f"{cosa}: {m.group(1)} non ha la sua voce in {v['file']}")
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
                                                     'permissionDecisionReason': 'Numeri doppi: ' + ' · '.join(p)}},
                             ensure_ascii=False))
    except Exception:  # noqa: BLE001
        pass
    return 0


if __name__ == '__main__':
    sys.exit(main())
