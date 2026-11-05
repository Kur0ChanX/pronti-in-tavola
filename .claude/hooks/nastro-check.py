#!/usr/bin/env python3
"""Nastro delle versioni aggiornato a ogni pubblicazione (hook Stop, C371 kit 30.6; Mario 31/10 23:50 punto 6:
«A ogni pubblicazione, notifica sul telefono … nastro aggiornato a ogni pubblicazione»).

Se in questo turno c'è stata un'unione di PR (strumento `merge_pull_request`), blocca la fine del turno UNA volta
(uscita 2, una riga su stderr) quando manca anche una sola di queste due cose:
- `docs/DA-FARE.md`, sezione «## Nastro delle versioni», riga «🚀 Online:» con la data di oggi (ora italiana, «gg/mm»):
  «🚀 Online: v<N> · <segno e catena> · <gg/mm hh:mm> · <3 parole>» (e le righe «🧪 In prova» e «⏳ Dopo» spostate);
- una notifica sul telefono nel turno (PushNotification) con «🚀»: «🚀 v<N> online · <segno e catena> · <3 parole>».
Progetto senza `docs/DA-FARE.md`: si controlla solo la notifica.
Il turno comincia all'ultimo messaggio «utente» che non è un esito di strumento.
Secondo giro (`stop_hook_active`), trascrizione assente o illeggibile, qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-nastro-check.py
"""
import datetime
import json
import os
import re
import sys

UNIONE = re.compile(r'(?:^|__)merge_pull_request$')
NOTIFICA = re.compile(r'(?:^|__)PushNotification$')
DA_FARE = os.path.join('docs', 'DA-FARE.md')
NASTRO = '## Nastro delle versioni'


def inizio_turno(voce):
    if voce.get('type') != 'user':
        return False
    contenuto = (voce.get('message') or {}).get('content')
    if isinstance(contenuto, str):
        return True
    if isinstance(contenuto, list):
        tipi = {b.get('type') for b in contenuto if isinstance(b, dict)}
        return 'tool_result' not in tipi and bool(tipi)
    return False


def strumenti_del_turno(percorso):
    """→ [(nome, input)] degli strumenti chiamati nel turno in corso; None se la trascrizione non si legge."""
    try:
        with open(percorso, encoding='utf-8') as f:
            righe = f.readlines()
    except Exception:
        return None
    uscita = []
    for riga in reversed(righe):
        try:
            voce = json.loads(riga)
        except Exception:
            continue
        if inizio_turno(voce):
            break
        contenuto = (voce.get('message') or {}).get('content') if voce.get('type') == 'assistant' else None
        if isinstance(contenuto, list):
            for b in contenuto:
                if isinstance(b, dict) and b.get('type') == 'tool_use':
                    uscita.append((str(b.get('name', '')), b.get('input') or {}))
    return uscita


def oggi():
    finta = os.environ.get('NASTRO_OGGI')
    if finta:
        return finta
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo('Europe/Rome')).strftime('%d/%m')
    except Exception:
        return (datetime.datetime.utcnow() + datetime.timedelta(hours=1)).strftime('%d/%m')


def riga_online(progetto):
    """→ la riga «🚀 Online:» della sezione del nastro; '' se manca; None se Da fare manca."""
    try:
        with open(os.path.join(progetto, DA_FARE), encoding='utf-8') as f:
            testo = f.read()
    except Exception:
        return None
    dentro = False
    for riga in testo.split('\n'):
        if riga.startswith('## '):
            dentro = riga.strip() == NASTRO
        elif dentro and riga.lstrip().startswith('🚀 Online:'):
            return riga
    return ''


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    if dati.get('stop_hook_active'):
        return 0
    strumenti = strumenti_del_turno(dati.get('transcript_path') or '')
    if not strumenti or not any(UNIONE.search(n) for n, _ in strumenti):
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    giorno = oggi()
    riga = riga_online(progetto)
    manca_nastro = riga is not None and giorno not in riga
    manca_notifica = not any(NOTIFICA.search(n) and '🚀' in json.dumps(i, ensure_ascii=False) for n, i in strumenti)
    if not manca_nastro and not manca_notifica:
        return 0
    cosa = []
    if manca_nastro:
        cosa.append(f'aggiorna in docs/DA-FARE.md la sezione «{NASTRO}» (3 righe): «🚀 Online: v<N> · <segno e catena> · '
                    f'{giorno} <ora> · <3 parole>», poi «🧪 In prova» e «⏳ Dopo» spostate; commit e push')
    if manca_notifica:
        cosa.append('manda la notifica sul telefono (PushNotification): «🚀 v<N> online · <segno e catena> · <3 parole>»')
    print('Versione unita in questo turno: ' + '; poi '.join(cosa) + '. NON riscrivere il messaggio: Mario l\'ha già letto (E255); chiudi con una riga di 3-5 parole.',
          file=sys.stderr)
    return 2


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
