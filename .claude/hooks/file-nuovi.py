#!/usr/bin/env python3
"""File nuovi in `docs/` (hook PreToolUse, C333, E207; Mario 29/10: «è diverso o mezzo doppione?», poi «perché non te
ne sei accorto tu da solo? migliorati per il futuro»).

Prima di un file nuovo in `docs/` ferma Claude UNA volta per quel file e chiede: c'è già un file che fa questo lavoro?
(esempio: il registro `docs/PROMESSE.md` rifaceva le voci di Da fare). Due casi:
  Write su un file di `docs/` che non c'è ancora;
  Bash con `git add` o `git commit` mentre in `docs/` c'è un file nuovo (non ancora nel ramo), creato con un comando.
Liberi: `docs/lavori-in-corso/`, `docs/misure/`, `docs/piani-finiti/`, `docs/kit-progetto/pacchetto/` (file di lavoro
e copie del kit). Lo stesso file si ferma una volta sola (.git/file-nuovi-visti.json): al secondo tentativo passa.
Qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-file-nuovi.py
"""
import json
import os
import re
import subprocess
import sys

LIBERI = ('docs/lavori-in-corso/', 'docs/misure/', 'docs/piani-finiti/', 'docs/kit-progetto/pacchetto/')
GIT_ADD = re.compile(r'\bgit\s+(?:-C\s+\S+\s+)?(?:add|commit)\b')


def da_controllare(rel):
    return rel.startswith('docs/') and not rel.startswith(LIBERI)


def relativo(progetto, percorso):
    if not os.path.isabs(percorso):
        percorso = os.path.join(progetto, percorso)
    rel = os.path.relpath(os.path.realpath(percorso), os.path.realpath(progetto))
    return rel.replace(os.sep, '/')


def nuovi_in_git(progetto):
    r = subprocess.run(['git', '-C', progetto, 'status', '--porcelain', '--untracked-files=all', '--', 'docs'],
                       capture_output=True, text=True, timeout=10)
    if r.returncode != 0:
        return []
    nuovi = []
    for riga in r.stdout.splitlines():
        if riga[:2] == '??' or riga[0] == 'A':
            nuovi.append(riga[3:].strip().strip('"'))
    return nuovi


def file_visti(progetto):
    cartella = os.path.join(progetto, '.git')
    return os.path.join(cartella if os.path.isdir(cartella) else progetto, 'file-nuovi-visti.json')


def main():
    dati = json.load(sys.stdin)
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    strumento = dati.get('tool_name')
    entrata = dati.get('tool_input') or {}
    candidati = []
    if strumento == 'Write':
        percorso = entrata.get('file_path') or ''
        rel = relativo(progetto, percorso)
        if not os.path.exists(os.path.join(progetto, rel)):
            candidati = [rel]
    elif strumento == 'Bash' and GIT_ADD.search(entrata.get('command') or ''):
        candidati = nuovi_in_git(progetto)
    candidati = [c for c in candidati if da_controllare(c)]
    if not candidati:
        return 0
    mem = file_visti(progetto)
    try:
        with open(mem, encoding='utf-8') as f:
            visti = set(json.load(f))
    except (OSError, ValueError):
        visti = set()
    nuovi = sorted(c for c in candidati if c not in visti)
    if not nuovi:
        return 0
    with open(mem, 'w', encoding='utf-8') as f:
        json.dump(sorted(visti | set(nuovi)), f)
    motivo = ('📄 File nuovo in docs/ (C333, E207): ' + ', '.join(nuovi) + '. Prima: c\'è già un file che fa questo '
              'lavoro? Guarda `ls docs/` e cerca l\'argomento (`grep -ril <parola> docs/ .claude/`, '
              '`python3 -I tools/cerca-regola.py <2-3 parole>`). C\'è → scrivi lì, una cosa in un posto solo. '
              'Non c\'è → rifai lo stesso comando: passa. Dove (C469 L9): piano di un lavoro in '
              '`docs/lavori-in-corso/<C>-<nome>.md`, uno per lavoro (senza numero, prima la voce in Da fare); '
              'foto e rapporti in `archivio/<C>/`.')
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                             'permissionDecisionReason': motivo}}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
