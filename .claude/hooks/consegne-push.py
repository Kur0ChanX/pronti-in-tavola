#!/usr/bin/env python3
"""Consegne sempre su GitHub (C226, E131; Mario #245: «Le consegne non sono scritte, risolvi questo problema che
non ricapiti più… pensi che li hai inviati e invece non li hai inviati»).

  consegne-push.py tool (PostToolUse di Edit/Write): se il file toccato è uno dei DOCUMENTI, ricorda subito
        commit + push e il controllo HEAD = origin/<ramo>.
  consegne-push.py stop (Stop): blocca la fine del turno (uscita 2, una riga su stderr) se
     1. un DOCUMENTO è cambiato e non è su origin/<ramo> (fuori dal commit, o nel commit ma non pushato).
        Si ripete finché non è pushato (anche al secondo giro): passa solo se il messaggio finale dice chiaro
        a Mario che NON è su GitHub e perché (es. push fallito), o dopo 3 blocchi di fila (niente giri infiniti);
     2. il messaggio finale dice «pushato», «consegne scritte», «è su GitHub»… ma HEAD non è su origin/<ramo>
        o un DOCUMENTO è fuori dal commit (una volta sola);
     3. il turno finisce senza testo per Mario (E65, E123: messaggio mai arrivato; una volta sola).
La scorta (`scorta-<ruolo>-<data>-<id>/<ramo>`, o il nome vecchio `scorta-<ruolo>/<ramo>`) NON conta come «su GitHub»: la sessione nuova legge il ramo di lavoro.
Qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-consegne-push.py
"""
import json
import os
import re
import subprocess
import sys
import tempfile

DOCUMENTI = ('docs/PASSAGGIO-CONSEGNE.md', 'docs/ERRORI.md', 'docs/ERRORI-STORIA.md')
MAX_BLOCCHI = 3
DICE_PUSH = re.compile(r'\bpushat[oaie]\b|\bpush\s+(fatto|riuscito|confermato)\b'
                       r'|\bconsegne\s+(scritte|salvate|pushate|fatte|pronte|aggiornate)\b'
                       r'|\b(è|sono)\s+(già\s+)?su\s+GitHub\b|\bho\s+salvato\b', re.I)
DICE_NON_SU_GITHUB = re.compile(r'\bNON\s+(?:(?:è|sono|ancora)\s+){0,2}(su\s+GitHub|pushat|nel\s+push)'
                                r'|\bpush\s+(fallito|non\s+riuscito|rifiutato)', re.I)
DICE_IN_LOCALE = re.compile(r'\bin\s+locale\b', re.I)  # basta per il punto 2, non per le consegne


def git(progetto, *argomenti):
    r = subprocess.run(['git', *argomenti], cwd=progetto, capture_output=True, text=True, timeout=15)
    return r.stdout.strip() if r.returncode == 0 else None


def stato_git(progetto):
    """→ (ramo, documenti fuori dal commit, documenti nel commit ma non su origin, HEAD fuori da origin)."""
    ramo = git(progetto, 'rev-parse', '--abbrev-ref', 'HEAD')
    if not ramo or ramo == 'HEAD':
        return None
    righe = (git(progetto, 'status', '--porcelain', '--', *DOCUMENTI) or '').splitlines()
    sporchi = sorted({riga.split(maxsplit=1)[-1].split(' -> ')[-1].strip('"') for riga in righe if riga.strip()})
    if git(progetto, 'rev-parse', '--verify', '-q', f'refs/remotes/origin/{ramo}') is None:
        return ramo, sporchi, [], False
    # Contenuto, non commit: un merge che porta da origin consegne già pushate non conta (falso allarme nella #246).
    base = git(progetto, 'merge-base', 'HEAD', f'origin/{ramo}')
    non_pushati = (git(progetto, 'diff', '--name-only', base, 'HEAD', '--', *DOCUMENTI) or '').split() if base else []
    avanti = bool(git(progetto, 'rev-list', '--max-count=1', f'origin/{ramo}..HEAD'))
    return ramo, sporchi, non_pushati, avanti


def file_stato(sessione):
    cartella = os.environ.get('CONSEGNE_STATO') or tempfile.gettempdir()  # cartella finta solo nella prova
    return os.path.join(cartella, f'consegne-push-{re.sub(r"[^A-Za-z0-9_-]", "", sessione or "x")}.json')


def blocchi(sessione, nuovo=None):
    percorso = file_stato(sessione)
    if nuovo is None:
        try:
            with open(percorso, encoding='utf-8') as f:
                return int(json.load(f).get('blocchi', 0))
        except Exception:
            return 0
    try:
        with open(percorso, 'w', encoding='utf-8') as f:
            json.dump({'blocchi': nuovo}, f)
    except OSError:
        pass
    return nuovo


def dopo_strumento(dati, progetto):
    entrata = dati.get('tool_input') or {}
    percorso = entrata.get('file_path') or ''
    pieno = os.path.realpath(percorso if os.path.isabs(percorso) else os.path.join(progetto, percorso))
    rel = os.path.relpath(pieno, os.path.realpath(progetto))
    if rel not in DOCUMENTI:
        return 0
    ramo = git(progetto, 'rev-parse', '--abbrev-ref', 'HEAD') or '<ramo>'
    testo = (f'C226 (E131): hai cambiato {rel}. Commit + push SUBITO, da solo (documenti: vale anche con prove in corso '
             f'o PR in bozza), poi `git rev-parse HEAD origin/{ramo}` devono essere uguali. Prima non dire a Mario '
             '«scritte», «salvate» o «fatto»: la scorta non conta, la sessione nuova legge il ramo.')
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse', 'additionalContext': testo}}))
    return 0


def a_fine_turno(dati, progetto):
    stato = stato_git(progetto)
    if stato is None:
        return 0
    ramo, sporchi, non_pushati, avanti = stato
    sessione = dati.get('session_id') or ''
    finale = dati.get('last_assistant_message')
    testo = finale if isinstance(finale, str) else ''
    secondo_giro = bool(dati.get('stop_hook_active'))
    if sporchi or non_pushati:
        if DICE_NON_SU_GITHUB.search(testo) or blocchi(sessione) >= MAX_BLOCCHI:
            blocchi(sessione, 0)
            return 0
        n = blocchi(sessione, blocchi(sessione) + 1)
        cosa = ', '.join(sporchi) + (' fuori dal commit' if sporchi else '')
        if non_pushati:
            cosa += ('; ' if sporchi else '') + f'{", ".join(non_pushati)} nel commit ma non pushati'
        print(f'Consegne non su GitHub (C226, blocco {n}/{MAX_BLOCCHI}): {cosa}. Fai commit e push adesso '
              f'(`git push -u origin {ramo}`), controlla `git rev-parse HEAD origin/{ramo}` uguali, poi chiudi il turno. '
              'Se il push non riesce, scrivi a Mario «consegne NON su GitHub» e il motivo.', file=sys.stderr)
        return 2
    blocchi(sessione, 0)
    if secondo_giro:
        return 0
    if avanti and DICE_PUSH.search(testo) and not (DICE_NON_SU_GITHUB.search(testo) or DICE_IN_LOCALE.search(testo)):
        print(f'Hai scritto a Mario che è su GitHub, ma HEAD non è ancora su origin/{ramo}. Fai il push e controlla '
              'HEAD = origin, oppure correggi il messaggio («in locale, push dopo …»).', file=sys.stderr)
        return 2
    if isinstance(finale, str) and (not finale.strip() or finale.strip().lower().startswith('no response requested')):
        print('Il turno finisce senza un messaggio per Mario (E65, E123): scrivi il resoconto o almeno una riga di stato.',
              file=sys.stderr)
        return 2
    return 0


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    modo = sys.argv[1] if len(sys.argv) > 1 else ''
    if modo == 'tool':
        return dopo_strumento(dati, progetto)
    if modo == 'stop':
        return a_fine_turno(dati, progetto)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
