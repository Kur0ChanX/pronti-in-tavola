#!/usr/bin/env python3
"""Controllo della sessione nuova (hook PreToolUse su `create_session`; Mario 04/11 E69, lezioni E295 ed E296).

Una sessione aperta con `create_session` deve nascere col repository e col motore giusto:
- `source_url` presente e uguale al repo del progetto (E296: senza, nasce vuota, senza codice né hook);
- `source_revision` = il ramo di `.claude/ramo-di-lavoro.txt` (se il file c'è);
- `model` = il motore di QUESTA sessione (C474, Mario 10/11 13:19: la nuova continua con lo stesso motore e impegno),
  letto dal registro; se ignoto claude-opus-5-5 (E295); Fable se il testo d'avvio ha il segno «⛔ FABLE (C472)»;
- `effort` = l'impegno di questa sessione (C474); senza, solo se il testo d'avvio dice «impegno rifiutato (C474)»
  (la piattaforma ha rifiutato il campo: la nuova chiede a Mario di metterlo dal selettore).
Manca qualcosa → nega lo strumento col motivo e i valori giusti. Qualunque errore del controllo: silenzio.
Prova: python3 -I tools/test-controlla-nuova-sessione.py
"""
import json
import os
import re
import sys

MOTORE = 'claude-opus-5-5'
FABLE = 'claude-fable-5-2'
SEGNO_FABLE = '⛔ FABLE (C472)'  # come in fermo-fable.py e tools/consegne.py
STRUMENTO = re.compile(r'(?:^|__)create_session$')
SEGNO_SENZA_IMPEGNO = 'impegno rifiutato (C474)'


def questa_sessione(dati):
    """(motore, impegno) di questa sessione: impegno dall'hook o dal registro, motore dall'ultima risposta; '' se ignoti."""
    motore = impegno = ''
    try:
        with open(dati.get('transcript_path') or '', 'rb') as f:
            f.seek(max(0, os.path.getsize(f.name) - 300_000))
            righe = f.read().decode('utf-8', 'ignore').splitlines()
        for r in reversed(righe):
            if '"assistant"' not in r:
                continue
            try:
                d = json.loads(r)
                m = str((d.get('message') or {}).get('model') or '')
            except Exception:
                continue
            if m and not m.startswith('<'):
                motore, impegno = re.sub(r'\[.*\]$', '', m), str(d.get('effort') or '')
                break
    except Exception:
        pass
    livello = dati.get('effort')
    livello = str(livello.get('level') or '') if isinstance(livello, dict) else ''
    return motore, livello or impegno


def repo_del_progetto(progetto):
    """→ «owner/nome» in minuscolo dall'origin di .git/config; '' se non si trova."""
    try:
        with open(os.path.join(progetto, '.git', 'config'), encoding='utf-8') as f:
            testo = f.read()
    except Exception:
        return ''
    blocco = re.search(r'\[remote "origin"\][^\[]*', testo)
    if not blocco:
        return ''
    url = re.search(r'url\s*=\s*(\S+)', blocco.group(0))
    return nome_repo(url.group(1)) if url else ''


def nome_repo(url):
    """https://…/Owner/Nome(.git) o git@…:Owner/Nome → «owner/nome» (minuscolo); '' se non si legge."""
    m = re.search(r'([\w.-]+)/([\w.-]+?)(?:\.git)?/?$', (url or '').strip())
    return f'{m.group(1)}/{m.group(2)}'.lower() if m else ''


def ramo_di_lavoro(progetto):
    try:
        with open(os.path.join(progetto, '.claude', 'ramo-di-lavoro.txt'), encoding='utf-8') as f:
            return f.read().strip()
    except Exception:
        return ''


def problemi(entrata, progetto, mio_motore='', mio_impegno=''):
    """→ elenco dei problemi (vuoto = va bene)."""
    uscita = []
    url = str(entrata.get('source_url') or '').strip()
    giusto = repo_del_progetto(progetto)
    if not url:
        uscita.append('manca source_url: la sessione nascerebbe vuota, senza codice né hook (E296)')
    elif giusto and nome_repo(url) != giusto:
        uscita.append(f'source_url «{url}» non è il repo del progetto ({giusto})')
    ramo = ramo_di_lavoro(progetto)
    rev = str(entrata.get('source_revision') or '').strip()
    if ramo and rev != ramo:
        uscita.append(f'source_revision deve essere «{ramo}» (.claude/ramo-di-lavoro.txt), non «{rev or "vuoto"}»')
    motore = str(entrata.get('model') or '').strip()
    if SEGNO_FABLE in str(entrata.get('prompt') or ''):  # C472: lavoro di Fable a metà → nasce già con Fable
        if 'fable' not in motore.lower():
            uscita.append(f'model deve essere Fable («{FABLE}»), non «{motore or "vuoto"}»: il testo d\'avvio ha '
                          f'«{SEGNO_FABLE}» (C472, Mario 10/11 12:10 «1»)')
    elif motore != (mio_motore or MOTORE):
        uscita.append(f'model deve essere «{mio_motore or MOTORE}» (il motore di questa sessione, C474), '
                      f'non «{motore or "vuoto"}»')
    impegno = str(entrata.get('effort') or '').strip()
    if not impegno and SEGNO_SENZA_IMPEGNO not in str(entrata.get('prompt') or ''):
        uscita.append(f'manca effort: la sessione nuova deve avere l\'impegno di questa (C474: '
                      f'«{mio_impegno or "effort_level di get_session"}»)')
    elif impegno and mio_impegno and impegno != mio_impegno:
        uscita.append(f'effort deve essere «{mio_impegno}» (impegno di questa sessione, C474), non «{impegno}»')
    return uscita


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    if not STRUMENTO.search(str(dati.get('tool_name') or '')):
        return 0
    entrata = dati.get('tool_input') or {}
    if not isinstance(entrata, dict):
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    elenco = problemi(entrata, progetto, *questa_sessione(dati))
    if not elenco:
        return 0
    print(json.dumps({'hookSpecificOutput': {
        'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
        'permissionDecisionReason': 'Sessione nuova non aperta: ' + '; '.join(elenco)
        + '. Rifai create_session con source_url, source_revision, model ed effort giusti (skill consegne, fase 5).',
    }}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
