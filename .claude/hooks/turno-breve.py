#!/usr/bin/env python3
"""Turni brevi (C218, E129; Mario 21/10: «quello che consuma meno token… trova un sistema»).

Un messaggio di Mario mandato mentre un turno gira aspetta in coda la fine del turno. Questo hook misura quanto dura
il turno e, oltre TURNO_MINUTI (20), ricorda a Claude di chiuderlo con una riga di stato e la ripresa in sottofondo.
- `stop` (Stop): il turno è finito → memoria azzerata.
- `tool` (PostToolUse, ogni strumento): il primo strumento dopo uno stop segna l'inizio; oltre la soglia avvisa
  (additionalContext), poi di nuovo ogni RIPETI minuti. Più di PAUSA minuti senza strumenti = turno nuovo
  (Stop perso per un riavvio). Mai blocca (uscita 0).
Prova: python3 -I tools/test-turno-breve.py
"""
import hashlib
import json
import os
import sys
import tempfile
import time

SOGLIA = 20
RIPETI = 5
PAUSA = 15


def file_memoria(progetto):
    nome = hashlib.sha1(os.path.realpath(progetto).encode()).hexdigest()[:12]
    return os.path.join(os.environ.get('TURNO_TMP') or tempfile.gettempdir(), f'turno-breve-{nome}.json')


def main():
    try:
        json.load(sys.stdin)
    except Exception:
        pass
    modo = sys.argv[1] if len(sys.argv) > 1 else 'tool'
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    mem_path = file_memoria(progetto)
    adesso = float(os.environ.get('TURNO_ORA') or time.time())
    try:
        soglia = float(os.environ.get('TURNO_MINUTI') or SOGLIA)
    except ValueError:
        soglia = SOGLIA
    try:
        with open(mem_path, encoding='utf-8') as f:
            m = json.load(f)
    except Exception:
        m = {}
    avviso = ''
    if modo == 'stop':
        m = {}
    else:
        if not m.get('inizio') or adesso - m.get('ultimo', 0) > PAUSA * 60:
            m = {'inizio': adesso}
        durata = (adesso - m['inizio']) / 60
        if durata >= soglia and adesso - m.get('avvisato', 0) >= RIPETI * 60:
            m['avvisato'] = adesso
            avviso = (f'⏱ Turno lungo (C218): lavori da {int(durata)} min senza chiudere il turno e i messaggi di Mario'
                      ' aspettano in coda. Finito il pezzetto in corso: Bash in sottofondo `sleep 60; echo "ripresa'
                      ' automatica: …"`, poi l\'ultimo messaggio a Mario (riga di stato, domande aperte in fondo) e'
                      ' chiudi il turno. Comandi lunghi (prove, build) sempre in sottofondo.')
        m['ultimo'] = adesso
    try:
        with open(mem_path, 'w', encoding='utf-8') as f:
            json.dump(m, f)
    except OSError:
        pass
    if avviso:
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse', 'additionalContext': avviso}}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
