#!/usr/bin/env python3
"""Comandi raggruppati (C64; Mario 08/11 «solo pro, senza contro», ok scritto ~11:36 «ok per pronti in tavola»).

Solo in Pronti in Tavola. Conta i comandi Bash PICCOLI di fila (comando corto, uscita corta, non in sottofondo) e,
arrivato a SOGLIA (4), ricorda a Claude di raggrupparli. AVVISA e basta: mai blocca (uscita sempre 0).
- `tool` (PostToolUse, ogni strumento): Bash piccolo → +1; un altro strumento, un Bash grande, le prove, commit e push
  (comandi che vanno a sé, RVC E20) → conto a zero. Avvisa a 4, poi di nuovo ogni altri 4.
- `stop` (Stop): turno finito → conto a zero.
Prova: python3 -I tools/test-comandi-piccoli.py
"""
import hashlib
import json
import os
import re
import sys
import tempfile

SOGLIA = 4
COMANDO_CORTO = 300      # caratteri del comando
USCITA_CORTA = 2000      # caratteri dell'uscita
A_SE = re.compile(r'tools/prova\.js|prova-firebase|tools/test-|git\s+commit|git\s+push|git\s+merge')


def file_memoria(progetto):
    nome = hashlib.sha1(os.path.realpath(progetto).encode()).hexdigest()[:12]
    return os.path.join(os.environ.get('COMANDI_TMP') or tempfile.gettempdir(), f'comandi-piccoli-{nome}.json')


def piccolo(dati):
    if dati.get('tool_name') != 'Bash':
        return False
    ingresso = dati.get('tool_input') or {}
    comando = str(ingresso.get('command') or '')
    if ingresso.get('run_in_background') or A_SE.search(comando) or len(comando) > COMANDO_CORTO:
        return False
    uscita = dati.get('tool_response')
    testo = uscita if isinstance(uscita, str) else json.dumps(uscita or '', ensure_ascii=False)
    return len(testo) <= USCITA_CORTA


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        dati = {}
    modo = sys.argv[1] if len(sys.argv) > 1 else 'tool'
    mem_path = file_memoria(os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd())
    try:
        with open(mem_path, encoding='utf-8') as f:
            conto = int(json.load(f).get('conto', 0))
    except Exception:
        conto = 0
    avviso = ''
    if modo != 'stop' and piccolo(dati):
        conto += 1
        if conto % SOGLIA == 0:
            avviso = (f'📦 {conto} comandi piccoli di fila (C64): raggruppa i casi sicuri in un solo comando '
                      '(letture e ricerche; cambio + controllo sintassi; fetch, merge, push), uscita corta. '
                      'A sé: il passo che dipende dal risultato, prove poi commit (E20), comandi rischiosi sui dati veri.')
    else:
        conto = 0
    try:
        with open(mem_path, 'w', encoding='utf-8') as f:
            json.dump({'conto': conto}, f)
    except OSError:
        pass
    if avviso:
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse', 'additionalContext': avviso}},
                         ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
