#!/usr/bin/env python3
"""Prova di .claude/hooks/numeri-doppi.py (C89): un repo finto con novità e voci doppie o giuste."""
import json, os, subprocess, sys, tempfile
HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.claude', 'hooks', 'numeri-doppi.py')
def repo(data, fare):
    d = tempfile.mkdtemp()
    os.makedirs(os.path.join(d, 'docs'))
    open(os.path.join(d, 'data.js'), 'w').write(data); open(os.path.join(d, 'docs', 'DA-FARE.md'), 'w').write(fare)
    for c in (['init', '-q'], ['add', '.'], ['-c', 'user.email=a@b', '-c', 'user.name=p', 'commit', '-qm', 'x']):
        subprocess.run(['git', *c], cwd=d, check=True)
    return d
def esito(d, cmd='git push -u origin x'):
    r = subprocess.run([sys.executable, '-I', HOOK], input=json.dumps({'tool_input': {'command': cmd}, 'cwd': d}), capture_output=True, text=True, env={**os.environ, 'CLAUDE_PROJECT_DIR': d})
    return r.stdout
NOV = "const VERSIONE_APP = '0.2';\nconst NOVITA = [\n  { v: '0.2', data: 'x' },\n  { v: '%s', data: 'x' }\n];\n"
ok = 0
casi = [('giusto', NOV % '0.1', '| C1 | a |\n| C2 | b |\n', False), ('versione doppia', NOV % '0.2', '| C1 | a |\n', True),
        ('C doppio', NOV % '0.1', '| C1 | a |\n| C1 | b |\n', True)]
for nome, data, fare, blocca in casi:
    out = esito(repo(data, fare)); bloccato = '"deny"' in out
    print('OK  ' if bloccato == blocca else 'NO  ', nome, out[:120]); ok += bloccato == blocca
d = repo(NOV % '0.2', '| C1 | a |\n| C1 | b |\n')
fuori = esito(d, 'git status') == ''; print('OK  ' if fuori else 'NO  ', 'senza push: silenzio'); ok += fuori
print(f'{ok} su {len(casi) + 1}'); sys.exit(0 if ok == len(casi) + 1 else 1)
