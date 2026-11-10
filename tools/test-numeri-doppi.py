#!/usr/bin/env python3
"""Prova di .claude/hooks/numeri-doppi.py (kit 37.2, da Pronti in Tavola C89): repo finti con voci doppie o giuste.
Uso: python3 -I tools/test-numeri-doppi.py"""
import json, os, subprocess, sys, tempfile

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.claude', 'hooks', 'numeri-doppi.py')
errori = 0


def controlla(cond, nome):
    global errori
    print(('ok   ' if cond else 'ERR  ') + nome)
    errori += 0 if cond else 1


def repo(file, config=None):
    d = tempfile.mkdtemp()
    for nome, testo in file.items():
        os.makedirs(os.path.dirname(os.path.join(d, nome)) or d, exist_ok=True)
        open(os.path.join(d, nome), 'w', encoding='utf-8').write(testo)
    if config is not None:
        os.makedirs(os.path.join(d, '.claude'), exist_ok=True)
        open(os.path.join(d, '.claude', 'numeri-doppi.json'), 'w').write(json.dumps(config))
    return d


def esito(d, cmd='git push -u origin x'):
    r = subprocess.run([sys.executable, '-I', HOOK], input=json.dumps({'tool_input': {'command': cmd}, 'cwd': d}),
                       capture_output=True, text=True, env={**os.environ, 'CLAUDE_PROJECT_DIR': d})
    return r.returncode, r.stdout


FARE_OK, FARE_DOPPIO = '| C1 | a |\n| C2 | b |\n| ⏭️ C1 | non conta |\n', '| C1 | a |\n| C1 | b |\n'
VERS = "export const VERSIONI = [\n  {\n    v: 3, data: 'x',\n  },\n  {\n    v: %s, data: 'x',\n  },\n];\n"
CONF = [{"file": "docs/DA-FARE.md", "modello": r"^\| (C\d+) \|", "cosa": "voci"},
        {"file": "app/versioni.js", "modello": r"^\s*v: (\d+), data:", "cosa": "versioni"},
        {"file": "data.js", "modello": r"\{ v: '([\d.]+)'", "presente": r"const VERSIONE_APP = '([\d.]+)'", "cosa": "novità"}]
NOV = "const VERSIONE_APP = '%s';\nconst NOVITA = [\n  { v: '0.2' },\n  { v: '0.1' }\n];\n"

rc, out = esito(repo({'docs/DA-FARE.md': FARE_OK}))
controlla(rc == 0 and out == '', 'senza impostazioni, Da fare giusto: silenzio (la riga «⏭️ C1» non conta)')
rc, out = esito(repo({'docs/DA-FARE.md': FARE_DOPPIO}))
controlla('"deny"' in out and 'C1' in out and 'era Cxx doppio' in out, 'senza impostazioni, C doppio in Da fare: push fermato col rimedio')
giusto = {'docs/DA-FARE.md': FARE_OK, 'app/versioni.js': VERS % 2, 'data.js': NOV % '0.2'}
rc, out = esito(repo(giusto, CONF))
controlla(out == '', 'con le impostazioni, tutto giusto: silenzio')
rc, out = esito(repo(dict(giusto, **{'app/versioni.js': VERS % 3}), CONF))
controlla('"deny"' in out and 'versioni' in out and '3' in out, 'versione dell\'app doppia: push fermato')
rc, out = esito(repo(dict(giusto, **{'data.js': NOV % '0.3'}), CONF))
controlla('"deny"' in out and '0.3 non ha la sua voce' in out, 'versione senza la sua novità: push fermato')
d = repo({'docs/DA-FARE.md': FARE_DOPPIO})
controlla(esito(d, 'git status')[1] == '' and esito(d, 'echo "poi git push"')[1] == '',
          'senza push vero (anche «git push» dentro un testo): silenzio')
controlla(esito(d, 'git commit -qm x && git push -q origin r')[1] != '', '«commit && push» nello stesso comando: controllato')
rc, out = esito(repo({'docs/DA-FARE.md': FARE_DOPPIO}, 'non è json'))
controlla(rc == 0 and out == '', 'impostazioni rotte: silenzio, mai un blocco per errore dell\'hook')

print(f'ERRORI: {errori}')
sys.exit(1 if errori else 0)
