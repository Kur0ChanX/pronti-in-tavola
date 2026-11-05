#!/usr/bin/env python3
"""Prova di .claude/hooks/titolo-forma.py (kit 30.7, Mario 1/11 00:15). Uso: python3 -I tools/test-titolo-forma.py"""
import json
import os
import subprocess
import sys
import tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, '..', '.claude', 'hooks', 'titolo-forma.py')
CHI = """# Chi fa cosa

## Catene
| Catena | Forma | Segni | Numero | Sessione |
|---|---|---|---|---|
| Principale | cerchi | 🟢 🟡 🔴 ⚫ | 466 | x |
| Dov'è | quadrati | 🟩 🟨 🟥 ⬛ | 8 | y |
| Scorte | cuori | 💚 💛 ❤️ 🖤 | 68 | z |
| Atlante | stelle | ✳️ ✴️ ❌ ✖️ | 56 | w |

## Zone fisse
"""

errori = 0


def prova(nome, titolo, giusto, strumento='mcp__claude-code-remote__set_session_title', cartella=None):
    global errori
    dati = {'tool_name': strumento, 'tool_input': {'title': titolo}, 'cwd': cartella or QUI}
    env = dict(os.environ, CLAUDE_PROJECT_DIR=cartella or QUI)
    r = subprocess.run([sys.executable, '-I', HOOK], input=json.dumps(dati), capture_output=True, text=True, env=env)
    negato = '"deny"' in r.stdout
    ok = (not negato) if giusto else negato
    if not ok:
        errori += 1
    print(('ok  ' if ok else 'NO  ') + nome + ('' if ok else f' → {r.stdout or r.stderr}'))


with tempfile.TemporaryDirectory() as d:
    os.makedirs(os.path.join(d, 'docs'))
    with open(os.path.join(d, 'docs', 'CHI-FA-COSA.md'), 'w', encoding='utf-8') as f:
        f.write(CHI)
    prova('esempio di Mario, principale', '🟢 🧪 Principale 466 · colori Planner', True, cartella=d)
    prova('esempio di Mario, Dov\'è', '🟨 🧪 Dov\'è 8 · foto da ridare', True, cartella=d)
    prova('esempio di Mario, Scorte chiusa', '❤️ 🧪 Scorte 67 · v118 online', True, cartella=d)
    prova('Atlante con le stelle', '✳️ 🧪 Atlante 56 · correzioni', True, cartella=d)
    prova('Atlante tocca a Mario', '✴️ 🧪 Atlante 57 · scegli foto', True, cartella=d)
    prova('principale chiusa', '🔴 🧪 Principale 465 · kit 30.6', True, cartella=d)
    prova('altro progetto', '🟢 🌊 Principale 120 · menù estate', True, cartella=d)
    prova('create_session giusto', '🟢 🧪 Principale 467 · import clienti', True, 'mcp__claude-code-remote__create_session', d)
    prova('altro strumento', 'qualsiasi cosa', True, 'mcp__claude-code-remote__send_message', d)
    prova('doppione', '✗ DOPPIONE di 466', True, cartella=d)
    prova('formato ⭐ di stasera', '🟢 🧪 ⭐466 · kit titoli', False, cartella=d)
    prova('formato vecchio', '🟡 🧪⭐ Import clienti 1:08 · #465', False, cartella=d)
    prova('numero in fondo', '🟢 🧪 Principale · kit titoli · 465', False, cartella=d)
    prova('con la P', '🟩 🧪 Dov\'è P8 · cose ospiti', False, cartella=d)
    prova('cerchio su un\'altra catena', '🟡 🧪 Dov\'è 8 · da ridare', False, cartella=d)
    prova('forma di un\'altra catena', '🟨 🧪 Scorte 68 · cambio lenzuola', False, cartella=d)
    prova('Atlante coi libri (forma vecchia)', '📗 🧪 Atlante 56 · correzioni', False, cartella=d)
    prova('quadrato sulla principale', '🟩 🧪 Principale 466 · kit', False, cartella=d)
    prova('troppe parole', '🟢 🧪 Principale 466 · import dei clienti di tutti', False, cartella=d)
    prova('senza nome della catena', '🟢 🧪 466 · kit', False, cartella=d)
    prova('nome di due parole', '🟢 🧪 Chat principale 466 · kit', False, cartella=d)
    prova('vecchio ✅', '✅ 🧪 Principale 465 · fatto', False, cartella=d)
    prova('senza icona', '🟢 Principale 466 · kit', False, cartella=d)
    prova('❔ col verde (domande aperte, C423)', '🟢 🧪 Principale 466 ❔ · colori Planner', True, cartella=d)
    prova('❓ col giallo (ferma, C423)', '🟨 🧪 Dov\'è 8 ❓ · foto da ridare', True, cartella=d)
    prova('❓ col verde', '🟢 🧪 Principale 466 ❓ · colori', False, cartella=d)
    prova('❔ col giallo', '🟡 🧪 Principale 466 ❔ · colori', False, cartella=d)
    prova('❔ sul rosso', '🔴 🧪 Principale 466 ❔ · fatto', False, cartella=d)
    vuota = os.path.join(d, 'vuota')
    os.makedirs(vuota)
    prova('senza tabella, catena nuova coi libri', '📒 🧪 Cantina 1 · scegli vini', True, cartella=vuota)
    prova('senza tabella, cerchi a una catena nuova', '🟢 🧪 Cantina 1 · scegli vini', False, cartella=vuota)

print('Tutto verde' if not errori else f'ERRORI: {errori}')
sys.exit(1 if errori else 0)
