#!/usr/bin/env python3
"""C472 (Mario 10/11 ~11:35, Principale 563): «se la vecchia sessione è con Fable, nella nuova sessione non parte se non
metto Fable, per evitare che inizia in automatico con Opus e rovini il lavoro». Vale per tutti gli account (kit).

La sessione che chiude lavorando con Fable mette il segno «⛔ FABLE (C472)» nel testo [AVVIO] (`tools/consegne.py fatti`).
- avvio  (SessionStart): salva il motore con cui nasce la sessione (campo `model`, non sempre presente);
- cambio (PostModelSwitch): salva il motore scelto da Mario (`to_model`);
- inizio (UserPromptSubmit): prompt [AVVIO] col segno = la sessione aspetta Fable; finché il motore non è Fable e Mario
  non scrive «vai con Opus», a ogni messaggio dice a Claude di non lavorare e di chiedere Fable. Muto in tutti gli altri casi.
Stato in .git/fermo-fable-<sessione>.json (fuori dal repo). Esce sempre 0: un errore non ferma mai la chat.
"""
import json
import os
import re
import sys
import time

SEGNO = '⛔ FABLE (C472)'
SBLOCCO = re.compile(r'\b(?:vai|andiamo|parti|continua|procedi|lavora|resta|va bene)\b[^\n]{0,20}?\bopus\b'
                     r'|\bopus\b[^\n]{0,12}?\b(?:va bene|ok|vai)\b|\bsenza fable\b', re.I)


def progetto():
    return os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()


def file_stato(dati):
    sessione = re.sub(r'[^A-Za-z0-9_-]', '', str(dati.get('session_id') or 'ignota'))[:64] or 'ignota'
    return os.path.join(progetto(), '.git', f'fermo-fable-{sessione}.json')


def leggi(dati):
    try:
        with open(file_stato(dati), encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def scrivi(dati, st):
    try:
        with open(file_stato(dati), 'w', encoding='utf-8') as f:
            json.dump(st, f, ensure_ascii=False)
    except Exception:
        pass


def nome(modello):
    m = str(modello or '').lower()
    return next((n for n in ('fable', 'opus', 'sonnet', 'haiku') if n in m), '')


def dal_registro(dati):
    """Motore dell'ultima risposta nel registro della sessione ('' se nessuna risposta: primo turno)."""
    try:
        with open(dati.get('transcript_path') or '', 'rb') as f:
            f.seek(max(0, os.path.getsize(f.name) - 300_000))
            righe = f.read().decode('utf-8', 'ignore').splitlines()
    except Exception:
        return ''
    for r in reversed(righe):
        if '"assistant"' not in r:
            continue
        try:
            m = (json.loads(r).get('message') or {}).get('model')
        except Exception:
            continue
        if m and not str(m).startswith('<'):
            return str(m)
    return ''


def motore_ora(dati, st):
    """Prima il cambio di Mario (PostModelSwitch), poi l'ultima risposta nel registro, poi il motore dell'avvio."""
    return st.get('cambio') or dal_registro(dati) or st.get('avvio') or ''


def fermo(chi):
    return (f'⛔ FERMO PER FABLE (C472, regola di Mario): la sessione di prima lavorava con Fable e questa {chi}. '
            'Non lavorare e non fare l\'avvio (niente comandi, letture, file o commit: Fable poi rileggerebbe tutto). '
            'Rispondi a Mario solo questo: «⛔ La sessione di prima lavorava con Fable: metti Fable (menu del motore '
            'nell\'app o /model), poi scrivimi "via". Per andare con Opus scrivimi "vai con Opus".» '
            'Se il tuo motore è già Fable (riga del motore nel prompt di sistema), ignora questo avviso e lavora.')


def inizio(dati):
    st = leggi(dati)
    prompt = str(dati.get('prompt') or '')
    if prompt.lstrip().startswith('[AVVIO]') and SEGNO in prompt and not st.get('risolto'):
        st['aspetta'] = True
    if not st.get('aspetta') or st.get('risolto'):
        return ''
    if SBLOCCO.search(prompt) and not prompt.lstrip().startswith('[AVVIO]'):
        st.update(risolto=True, aspetta=False)
        scrivi(dati, st)
        return ('✅ FABLE (C472): Mario ha scelto di andare con Opus. Adesso fai l\'avvio scritto nel primo messaggio '
                '([AVVIO]) e lavora; nel primo messaggio una riga «🧠 Opus, scelto da te al posto di Fable».')
    ora = motore_ora(dati, st)
    if nome(ora) == 'fable':
        st.update(risolto=True, aspetta=False)
        scrivi(dati, st)
        if prompt.lstrip().startswith('[AVVIO]'):
            return ''  # nata già con Fable: niente da dire
        return ('✅ FABLE (C472): adesso lavori con Fable. Fai l\'avvio scritto nel primo messaggio ([AVVIO]) e continua '
                'il lavoro di Fable dai «Prossimi passi».')
    scrivi(dati, st)
    if not nome(ora):
        chi = 'non risulta Fable'
    elif ora == st.get('cambio') or ora == st.get('avvio'):
        chi = f'lavora con {nome(ora).capitalize()}'
    else:  # dal registro: è il motore dell'ultima risposta, non per forza quello di adesso
        chi = f'ha dato l\'ultima risposta con {nome(ora).capitalize()}'
    return fermo(chi)


def main():
    modo = sys.argv[1] if len(sys.argv) > 1 else ''
    try:
        dati = json.load(sys.stdin)
    except Exception:
        dati = {}
    try:
        if modo == 'avvio':
            if dati.get('model'):
                st = leggi(dati)
                st['avvio'] = str(dati['model'])
                scrivi(dati, st)
        elif modo == 'cambio':
            if dati.get('to_model'):
                st = leggi(dati)
                st.update(cambio=str(dati['to_model']), quando=int(time.time()))
                scrivi(dati, st)
        elif modo == 'inizio':
            testo = inizio(dati)
            if testo:
                print(testo)
    except Exception:
        pass
    return 0


if __name__ == '__main__':
    sys.exit(main())
