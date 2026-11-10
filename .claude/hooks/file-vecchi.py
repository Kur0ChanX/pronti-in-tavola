#!/usr/bin/env python3
"""File vecchi (hook PreToolUse Edit|Write|Bash, E319; Mario 09/11 23:38: «aggiungi una regola che stai attento a non
prendere file vecchi non aggiornati»; prima, 23:17: «stai lavorando su un file vecchio … l'hai fatto molte volte»).

Ferma Claude UNA volta per caso e sessione (al secondo tentativo passa) e dice cosa controllare. Quattro casi:
  1. ramo indietro: Edit/Write su un file che il ramo remoto (dall'ultimo `git fetch`) ha cambiato in commit che il
     ramo locale non ha ancora → prima il merge, poi si rilegge il file.
  2. gemelli: Edit/Write su un file di un gruppo «a | b» di `.claude/gemelli.txt` (lo stesso disegno in più file)
     → ultime correzioni di tutti (`git log`), la correzione su TUTTI.
  3. copia generata: Edit/Write su una copia «copia <- fonte» di `.claude/gemelli.txt` → si cambia la fonte e si
     rigenera.
  4. copia vecchia fuori dal progetto: Bash, Edit o Write che toccano una cartella in /tmp (scratchpad) con una copia
     del progetto (git worktree o clone, oppure cartella con `app/`) diversa dal progetto di adesso → elenca i file
     diversi (fuori da docs/ e archivio/). Cartelle con «prima» o «vecchi» nel nome: il vecchio voluto, passano.
Memoria dei casi già visti: .git/file-vecchi-visti.json. Qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-file-vecchi.py
"""
import hashlib
import json
import os
import re
import subprocess
import sys

TEMPO = 4  # secondi al massimo per ogni comando git (E224: l'hook resta ben sotto il suo limite)
PERCORSI_TMP = re.compile(r'''(/tmp/[^\s'"`;|&<>()]+)''')
NON_CONTANO = ('docs/', 'archivio/')  # cambiano a ogni consegna e scorta: non rendono vecchia una copia dell'app
VOLUTI = re.compile(r'prima|vecchi', re.I)
MAX_ELENCO = 8
MAX_MEMORIA = 400


def git(cartella, *argomenti):
    r = subprocess.run(['git', '-C', cartella, *argomenti], capture_output=True, text=True, timeout=TEMPO)
    return r.stdout.strip() if r.returncode == 0 else None


def dentro(percorso, cartella):
    return percorso == cartella or percorso.startswith(cartella.rstrip(os.sep) + os.sep)


def relativo(progetto, percorso):
    if not os.path.isabs(percorso):
        percorso = os.path.join(progetto, percorso)
    rel = os.path.relpath(os.path.realpath(percorso), os.path.realpath(progetto))
    return rel.replace(os.sep, '/')


def elenco(nomi):
    testo = ', '.join(nomi[:MAX_ELENCO])
    return testo + (f' e altri {len(nomi) - MAX_ELENCO}' if len(nomi) > MAX_ELENCO else '')


def leggi_gemelli(progetto):
    gruppi, copie = [], []
    try:
        with open(os.path.join(progetto, '.claude', 'gemelli.txt'), encoding='utf-8') as f:
            righe = f.read().splitlines()
    except OSError:
        return gruppi, copie
    for riga in righe:
        riga = riga.split('#', 1)[0].strip()
        if '<-' in riga:
            copia, fonte = (p.strip() for p in riga.split('<-', 1))
            if copia and fonte:
                copie.append((copia, fonte))
        elif '|' in riga:
            gruppo = [p.strip() for p in riga.split('|') if p.strip()]
            if len(gruppo) > 1:
                gruppi.append(gruppo)
    return gruppi, copie


def caso_ramo(progetto, rel):
    remoto = git(progetto, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}')
    if not remoto:
        return None
    avanti = git(progetto, 'rev-list', '--count', 'HEAD..' + remoto)
    if not avanti or avanti == '0':
        return None
    cambiati = (git(progetto, 'diff', '--name-only', 'HEAD...' + remoto) or '').splitlines()
    if rel not in cambiati:
        return None
    sha = git(progetto, 'rev-parse', '--short', remoto) or remoto
    return ('ramo|%s|%s' % (rel, sha),
            f'🕰️ File vecchio (E319): {rel} è cambiato su {remoto} in commit che il ramo locale non ha ancora '
            f'({avanti} commit). Prima `git merge --ff-only {remoto}` (o un merge normale), poi rileggi il file e '
            'rifai la modifica sulla versione nuova.')


def caso_gemelli(rel, gruppi):
    for gruppo in gruppi:
        if rel in gruppo:
            altri = [g for g in gruppo if g != rel]
            return ('gemelli|' + '|'.join(sorted(gruppo)),
                    f'🧬 Gemelli (E319): lo stesso disegno di {rel} vive anche in {", ".join(altri)}. Prima le '
                    'ultime correzioni di tutti (`git log -5 --format="%h %ad %s" --date=short -- '
                    + ' '.join(gruppo) + '`), poi la correzione su TUTTI, o scrivi perché uno no.')
    return None


def caso_copia_generata(rel, copie):
    for copia, fonte in copie:
        if rel == copia or (copia.endswith('/') and rel.startswith(copia)):
            vera = fonte + rel[len(copia):] if copia.endswith('/') else fonte
            return ('generata|' + rel,
                    f'📑 Copia generata (E319): {rel} si rifà da {vera} (`.claude/gemelli.txt`). Cambia la fonte, '
                    'poi rigenera (es. `python3 -I tools/fai-kit.py`): la copia cambiata a mano si perde o resta vecchia.')
    return None


def radice_copia(percorso, progetto):
    p = os.path.realpath(percorso)
    if dentro(p, os.path.realpath(progetto)) or not dentro(p, '/tmp'):
        return None
    cartella = p if os.path.isdir(p) else os.path.dirname(p)
    while dentro(cartella, '/tmp') and cartella != '/tmp':
        if os.path.exists(os.path.join(cartella, '.git')) or os.path.isdir(os.path.join(cartella, 'app', 'src')):
            return cartella
        cartella = os.path.dirname(cartella)
    return None


def file_diversi(progetto, cartella):
    """File del progetto (fuori da docs/ e archivio/) che nella copia mancano o sono diversi."""
    tracciati = (git(progetto, 'ls-files', 'app') or '').splitlines()
    diversi = []
    for rel in tracciati:
        if rel.startswith(NON_CONTANO) or '/node_modules/' in rel:
            continue
        try:
            with open(os.path.join(progetto, rel), 'rb') as f:
                nostro = f.read()
        except OSError:
            continue
        try:
            with open(os.path.join(cartella, rel), 'rb') as f:
                suo = f.read()
        except OSError:
            diversi.append(rel)
            continue
        if suo != nostro:
            diversi.append(rel)
    return diversi


def caso_copia(progetto, cartella):
    if VOLUTI.search(os.path.basename(cartella)):
        return None
    if os.path.exists(os.path.join(cartella, '.git')):
        sua = git(cartella, 'rev-parse', 'HEAD')
        testa = git(progetto, 'rev-parse', 'HEAD')
        if not sua or not testa or sua == testa or git(progetto, 'cat-file', '-t', sua) != 'commit':
            return None
        diversi = [r for r in (git(progetto, 'diff', '--name-only', sua, testa) or '').splitlines()
                   if not r.startswith(NON_CONTANO)]
        cosa = f'è al commit {sua[:9]}, il progetto a {testa[:9]}'
    else:
        diversi = file_diversi(progetto, cartella)
        cosa = 'è una copia con file diversi dal progetto di adesso'
    if not diversi:
        return None
    impronta = hashlib.sha1('\n'.join(diversi).encode()).hexdigest()[:12]
    return ('copia|%s|%s' % (cartella, impronta),
            f'🕰️ Copia vecchia (E319): {cartella} {cosa}. File diversi: {elenco(diversi)}. Se sono le tue modifiche '
            'volute o il «prima» di un confronto, rifai lo stesso comando: passa (meglio: «prima» nel nome della '
            'cartella). Sennò rifai la copia dal progetto di adesso, o portaci le correzioni, e poi lavora.')


def casi(progetto, strumento, entrata):
    trovati = []
    if strumento in ('Edit', 'Write'):
        percorso = entrata.get('file_path') or ''
        if not percorso:
            return trovati
        assoluto = percorso if os.path.isabs(percorso) else os.path.join(progetto, percorso)
        if dentro(os.path.realpath(assoluto), os.path.realpath(progetto)):
            rel = relativo(progetto, assoluto)
            gruppi, copie = leggi_gemelli(progetto)
            for caso in (caso_copia_generata(rel, copie), caso_gemelli(rel, gruppi), caso_ramo(progetto, rel)):
                if caso:
                    trovati.append(caso)
        else:
            cartella = radice_copia(assoluto, progetto)
            caso = caso_copia(progetto, cartella) if cartella else None
            if caso:
                trovati.append(caso)
    elif strumento == 'Bash':
        visti = set()
        for percorso in PERCORSI_TMP.findall(entrata.get('command') or '')[:12]:
            cartella = radice_copia(percorso, progetto)
            if cartella and cartella not in visti:
                visti.add(cartella)
                caso = caso_copia(progetto, cartella)
                if caso:
                    trovati.append(caso)
    return trovati


def file_memoria(progetto):
    cartella = os.path.join(progetto, '.git')
    return os.path.join(cartella if os.path.isdir(cartella) else progetto, 'file-vecchi-visti.json')


def main():
    dati = json.load(sys.stdin)
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    trovati = casi(progetto, dati.get('tool_name'), dati.get('tool_input') or {})
    if not trovati:
        return 0
    sessione = str(dati.get('session_id') or '')
    mem = file_memoria(progetto)
    try:
        with open(mem, encoding='utf-8') as f:
            visti = json.load(f)
        if not isinstance(visti, list):
            visti = []
    except (OSError, ValueError):
        visti = []
    nuovi = [(sessione + '|' + chiave, motivo) for chiave, motivo in trovati if sessione + '|' + chiave not in visti]
    if not nuovi:
        return 0
    visti = (visti + [k for k, _ in nuovi])[-MAX_MEMORIA:]
    with open(mem, 'w', encoding='utf-8') as f:
        json.dump(visti, f)
    motivo = '\n'.join(m for _, m in nuovi) + '\nControllato e va bene così: rifai lo stesso comando, passa.'
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                             'permissionDecisionReason': motivo}}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
