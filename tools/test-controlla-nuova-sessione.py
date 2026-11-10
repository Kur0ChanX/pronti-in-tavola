#!/usr/bin/env python3
"""Prova di .claude/hooks/controlla-nuova-sessione.py (E69, E295, E296, C474). Uso: python3 -I tools/test-controlla-nuova-sessione.py"""
import json
import os
import subprocess
import sys
import tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, '..', '.claude', 'hooks', 'controlla-nuova-sessione.py')
URL = 'https://github.com/Esempio-Owner/Progetto'
RAMO = 'claude/progetto-ramo-definitivo'
errori = 0


def prova(nome, entrata, giusto, cartella, strumento='mcp__claude-code-remote__create_session', registro=None):
    global errori
    dati = {'tool_name': strumento, 'tool_input': entrata, 'cwd': cartella}
    if registro:  # C474: registro finto di questa sessione (motore e impegno dell'ultima risposta)
        dati['transcript_path'] = os.path.join(cartella, 'registro.jsonl')
        with open(dati['transcript_path'], 'w', encoding='utf-8') as f:
            f.write(json.dumps({'type': 'user', 'message': {'content': 'ciao'}}) + '\n')
            f.write(json.dumps({'type': 'assistant', 'effort': registro[1], 'message': {'model': registro[0]}}) + '\n')
    env = dict(os.environ, CLAUDE_PROJECT_DIR=cartella)
    r = subprocess.run([sys.executable, '-I', HOOK], input=json.dumps(dati), capture_output=True, text=True, env=env)
    negato = '"deny"' in r.stdout
    ok = (not negato) if giusto else negato
    if not ok:
        errori += 1
    print(('ok  ' if ok else 'NO  ') + nome + ('' if ok else f' → {r.stdout or r.stderr}'))


with tempfile.TemporaryDirectory() as d:
    os.makedirs(os.path.join(d, '.git'))
    os.makedirs(os.path.join(d, '.claude'))
    with open(os.path.join(d, '.git', 'config'), 'w', encoding='utf-8') as f:
        f.write('[core]\n\tbare = false\n[remote "origin"]\n\turl = http://proxy@127.0.0.1:9/git/Esempio-Owner/Progetto\n')
    with open(os.path.join(d, '.claude', 'ramo-di-lavoro.txt'), 'w', encoding='utf-8') as f:
        f.write(RAMO + '\n')
    giusta = {'source_url': URL, 'source_revision': RAMO, 'model': 'claude-opus-5-5', 'effort': 'medium', 'prompt': '[AVVIO] …'}
    prova('tutto giusto', giusta, True, d)
    prova('url con .git e maiuscole diverse', dict(giusta, source_url=URL.lower() + '.git'), True, d)
    prova('senza source_url (E296)', {k: v for k, v in giusta.items() if k != 'source_url'}, False, d)
    prova('altro repo', dict(giusta, source_url='https://github.com/altro/progetto'), False, d)
    prova('senza source_revision', {k: v for k, v in giusta.items() if k != 'source_revision'}, False, d)
    prova('ramo sbagliato', dict(giusta, source_revision='main'), False, d)
    prova('senza model (E295)', {k: v for k, v in giusta.items() if k != 'model'}, False, d)
    prova('motore Fable senza il segno C472 (E295)', dict(giusta, model='claude-fable-5-2'), False, d)
    # C472 (Mario 10/11 12:10 «1»): lavoro di Fable a metà (segno nel testo d'avvio) → la sessione nuova nasce già con Fable
    con_segno = dict(giusta, prompt='[AVVIO] ⛔ FABLE (C472) la sessione di prima lavorava con Fable …')
    prova('C472: segno Fable + model Fable', dict(con_segno, model='claude-fable-5-2'), True, d)
    prova('C472: segno Fable + model Opus', con_segno, False, d)
    prova('C472: segno Fable senza model', {k: v for k, v in con_segno.items() if k != 'model'}, False, d)
    # C474 (Mario 10/11 13:19): la nuova continua con motore e impegno di QUESTA sessione, letti dal registro
    senza_effort = {k: v for k, v in giusta.items() if k != 'effort'}
    prova('C474: senza effort', senza_effort, False, d)
    prova('C474: senza effort ma «impegno rifiutato (C474)»', dict(senza_effort, prompt='[AVVIO] impegno rifiutato (C474)'), True, d)
    prova('C474: Opus Extra → Opus Extra', dict(giusta, effort='xhigh'), True, d, registro=('claude-opus-5-5', 'xhigh'))
    prova('C474: Opus Extra → Opus Medio', giusta, False, d, registro=('claude-opus-5-5', 'xhigh'))
    prova('C474: Fable Medio → Fable Medio', dict(giusta, model='claude-fable-5-2'), True, d, registro=('claude-fable-5-2', 'medium'))
    prova('C474: Fable Medio → Opus Medio', giusta, False, d, registro=('claude-fable-5-2', 'medium'))
    prova('C474: motore col suffisso [1m] nel registro', giusta, True, d, registro=('claude-opus-5-5[1m]', 'medium'))
    prova('altro strumento: silenzio', {}, True, d, strumento='mcp__claude-code-remote__set_session_title')
    r = subprocess.run([sys.executable, '-I', HOOK], input='non json', capture_output=True, text=True)
    if r.returncode != 0 or r.stdout:
        errori += 1
        print('NO  entrata rotta: deve tacere')
    else:
        print('ok  entrata rotta: silenzio')

print('TUTTO OK' if not errori else f'{errori} ERRORI')
sys.exit(1 if errori else 0)
