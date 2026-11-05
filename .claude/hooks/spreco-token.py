#!/usr/bin/env python3
"""Guardiano dello spreco di token (C433, Mario 03/11: «una regola che verifichi lo spreco di token in generale per
account, sessione, per qualsiasi situazione, e me lo segnali se vedi anomalie; la regola stessa non deve sprecare token»).

Costa zero token finché va tutto bene: è un programma, legge la trascrizione e parla SOLO con un'anomalia (una riga).
  spreco-token.py inizio (UserPromptSubmit): anomalie del turno prima, non ancora dette → UNA riga di contesto
                         («dillo a Mario in una riga»); poi azzera i contatori del turno.
  spreco-token.py tool   (PostToolUse): stesso strumento con lo stesso ingresso RIPETUTO volte nel turno → una riga
                         subito («fermati e cambia strada»), una volta sola per comando.
  spreco-token.py fine   (Stop): conti del turno dalla trascrizione (messaggi contati una volta, per id) → anomalie
                         nello stato; totale del giorno della sessione in archivio/consumo/<data>-<sessione>.json
                         (aggiunto all'indice di git: va su GitHub col primo commit della sessione).
  spreco-token.py avvio  (SessionStart): somma per account dei file di archivio/consumo degli ultimi 8 giorni →
                         una riga solo se ieri un account ha speso oltre CONTO_ACCOUNT volte la sua media.
Stato in .git/spreco-<sessione>.json (fuori dal progetto). Qualunque errore: silenzio, uscita 0.
«Peso» = token equivalenti, stima coi rapporti dei prezzi: ingresso 1 · memoria scritta 1,25 · memoria letta 0,1 · uscita 5.
Prova: python3 -I tools/test-spreco-token.py
"""
import datetime
import glob
import hashlib
import json
import os
import re
import subprocess
import sys

# Tetti (regolabili qui; tutti in token, tranne dove detto)
USCITA_KB = 40            # un esito di strumento più grande (≈ 12k token)
RIPETUTO = 4              # stesso strumento con lo stesso ingresso, nello stesso turno
CRESCITA_TURNO = 100_000  # contesto cresciuto in un turno solo
AVVIO = 130_000           # contesto alla fine del primo turno della sessione
USCITA_TURNO = 25_000     # token scritti da Claude in un turno
AIUTANTI = 3              # aiutanti (Agent) lanciati in un turno
CONTO_ACCOUNT = 1.6       # ieri contro la media dei giorni prima, per account (servono almeno 3 giorni)
CODICE = 'C433'


def progetto():
    return os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()


def sessione(dati):
    s = str(dati.get('session_id') or os.environ.get('CLAUDE_CODE_REMOTE_SESSION_ID') or 'locale')
    return re.sub(r'[^A-Za-z0-9]', '', s.split('_', 1)[-1])[:12] or 'locale'


def account():
    a = os.environ.get('CLAUDE_CODE_ACCOUNT_UUID', '')
    return hashlib.sha256(a.encode()).hexdigest()[:6] if a else 'ignoto'


def oggi():
    finta = os.environ.get('SPRECO_OGGI')
    if finta:
        return finta
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo('Europe/Rome')).strftime('%Y-%m-%d')
    except Exception:
        return datetime.date.today().isoformat()


def file_stato(dati):
    return os.path.join(progetto(), '.git', f'spreco-{sessione(dati)}.json')


def leggi_stato(dati):
    try:
        with open(file_stato(dati), encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def scrivi_stato(dati, st):
    try:
        with open(file_stato(dati), 'w', encoding='utf-8') as f:
            json.dump(st, f, ensure_ascii=False)
    except Exception:
        pass


def contesto(evento, testo):
    print(json.dumps({'hookSpecificOutput': {'hookEventName': evento, 'additionalContext': testo}}, ensure_ascii=False))


def inizio_turno(voce):
    if voce.get('type') != 'user':
        return False
    c = (voce.get('message') or {}).get('content')
    if isinstance(c, str):
        return True
    if isinstance(c, list):
        tipi = {b.get('type') for b in c if isinstance(b, dict)}
        return bool(tipi) and 'tool_result' not in tipi
    return False


def voci(percorso):
    try:
        with open(percorso, 'rb') as f:
            f.seek(max(0, os.path.getsize(percorso) - 4_000_000))
            righe = f.read().decode('utf-8', 'ignore').splitlines()
    except Exception:
        return None
    uscita = []
    for r in righe:
        try:
            uscita.append(json.loads(r))
        except Exception:
            continue
    return uscita


def conti_turno(tutte):
    """→ dict coi conti dell'ultimo turno (dall'ultimo messaggio che apre un turno alla fine)."""
    inizio = max((i for i, v in enumerate(tutte) if inizio_turno(v)), default=0)
    turno, prima = tutte[inizio:], tutte[:inizio]
    usi, visti = [], set()
    for v in turno:
        m = v.get('message') or {}
        u = m.get('usage')
        if v.get('type') != 'assistant' or not u:
            continue
        chiave = m.get('id') or id(v)
        if chiave in visti:
            continue
        visti.add(chiave)
        usi.append(u)
    def ctx(u):
        return sum(int(u.get(k) or 0) for k in ('input_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens'))
    ctx_prima = 0
    for v in reversed(prima):
        u = (v.get('message') or {}).get('usage') if v.get('type') == 'assistant' else None
        if u:
            ctx_prima = ctx(u)
            break
    peso = sum(int(u.get('input_tokens') or 0) + 1.25 * int(u.get('cache_creation_input_tokens') or 0)
               + 0.1 * int(u.get('cache_read_input_tokens') or 0) + 5 * int(u.get('output_tokens') or 0) for u in usi)
    chiamate, grandi = {}, []
    aiutanti = 0
    for v in turno:
        c = (v.get('message') or {}).get('content')
        if not isinstance(c, list):
            continue
        for b in c:
            if not isinstance(b, dict):
                continue
            if b.get('type') == 'tool_use':
                nome = str(b.get('name', ''))
                k = nome + json.dumps(b.get('input'), sort_keys=True, ensure_ascii=False)
                chiamate[k] = chiamate.get(k, 0) + 1
                if nome in ('Agent', 'Task'):
                    aiutanti += 1
            elif b.get('type') == 'tool_result':
                dentro = b.get('content')
                testo = dentro if isinstance(dentro, str) else json.dumps(dentro, ensure_ascii=False)
                if len(testo.encode('utf-8')) > USCITA_KB * 1024:
                    grandi.append(len(testo.encode('utf-8')) // 1024)
    primo_turno = not any(inizio_turno(v) for v in prima)
    return {
        'ctx_prima': ctx_prima, 'ctx_fine': ctx(usi[-1]) if usi else ctx_prima,
        'uscita': sum(int(u.get('output_tokens') or 0) for u in usi), 'peso': round(peso),
        'ripetuti': [k for k, n in chiamate.items() if n >= RIPETUTO], 'grandi': grandi, 'aiutanti': aiutanti,
        'primo_turno': primo_turno,
    }


def anomalie(c):
    a = []
    if c['grandi']:
        a.append(f"{len(c['grandi'])} uscite di strumento enormi ({max(c['grandi'])} KB la più grande): leggere a pezzi (grep -n, sed -n)")
    if c['ripetuti']:
        nome = c['ripetuti'][0].split('{', 1)[0][:30]
        a.append(f"stesso comando {RIPETUTO}+ volte ({nome}): giro a vuoto")
    crescita = c['ctx_fine'] - c['ctx_prima']
    if c['primo_turno'] and c['ctx_fine'] > AVVIO:
        a.append(f"avvio pesante: {c['ctx_fine'] // 1000}k token dopo il primo turno (tetto {AVVIO // 1000}k)")
    elif crescita > CRESCITA_TURNO:
        a.append(f"un turno ha aggiunto {crescita // 1000}k token al contesto")
    if c['uscita'] > USCITA_TURNO:
        a.append(f"{c['uscita'] // 1000}k token scritti in un turno")
    if c['aiutanti'] > AIUTANTI:
        a.append(f"{c['aiutanti']} aiutanti in un turno")
    return a


def salva_consumo(dati, c, nuove):
    """Totale del giorno della sessione in archivio/consumo/<data>-<sessione>.json, aggiunto all'indice di git."""
    cartella = os.path.join(progetto(), 'archivio', 'consumo')
    nome = os.path.join(cartella, f'{oggi()}-{sessione(dati)}.json')
    try:
        with open(nome, encoding='utf-8') as f:
            tot = json.load(f)
    except Exception:
        tot = {'account': account(), 'sessione': sessione(dati), 'giorno': oggi(), 'turni': 0, 'peso': 0,
               'uscita': 0, 'contesto_max': 0, 'anomalie': []}
    tot['turni'] += 1
    tot['peso'] += c['peso']
    tot['uscita'] += c['uscita']
    tot['contesto_max'] = max(tot['contesto_max'], c['ctx_fine'])
    tot['anomalie'] = (tot['anomalie'] + nuove)[-10:]
    try:
        os.makedirs(cartella, exist_ok=True)
        with open(nome, 'w', encoding='utf-8') as f:
            json.dump(tot, f, ensure_ascii=False, indent=0)
        # C434: niente `git add` qui: un file cambiato a ogni fine turno faceva scattare l'hook «modifiche non salvate».
        # Il file si salva col primo commit normale della sessione (da sistemare in C434: salvataggio senza falsi allarmi).
    except Exception:
        pass


def fine(dati):
    if dati.get('stop_hook_active'):
        return 0
    tutte = voci(dati.get('transcript_path') or '')
    if not tutte:
        return 0
    c = conti_turno(tutte)
    nuove = anomalie(c)
    st = leggi_stato(dati)
    if nuove:
        st['da_dire'] = (st.get('da_dire') or []) + nuove
    scrivi_stato(dati, st)
    salva_consumo(dati, c, nuove)
    return 0


def inizio(dati):
    st = leggi_stato(dati)
    da_dire = st.get('da_dire') or []
    if da_dire:
        contesto('UserPromptSubmit', f'SPRECO TOKEN ({CODICE}): ' + '; '.join(dict.fromkeys(da_dire))[:400] + '. Dillo a Mario in '
                 'UNA riga in «⚠️ ATTENZIONE» (cosa, quanto, perché) e da ora lavora nel modo che costa meno; niente altro.')
    scrivi_stato(dati, {'chiamate': {}, 'detti': []})
    return 0


def tool(dati):
    k = str(dati.get('tool_name', '')) + json.dumps(dati.get('tool_input'), sort_keys=True, ensure_ascii=False)
    h = hashlib.sha1(k.encode()).hexdigest()[:12]
    st = leggi_stato(dati)
    chiamate = st.setdefault('chiamate', {})
    chiamate[h] = chiamate.get(h, 0) + 1
    detti = st.setdefault('detti', [])
    if chiamate[h] >= RIPETUTO and h not in detti:
        detti.append(h)
        contesto('PostToolUse', f'SPRECO TOKEN ({CODICE}): stesso comando ({dati.get("tool_name")}) {chiamate[h]} volte in questo '
                 'turno. Fermati e cambia strada (dopo 2 tentativi falliti: cosa ho capito, cosa no, via nuova).')
    scrivi_stato(dati, st)
    return 0


def avvio(_dati):
    ieri = (datetime.date.fromisoformat(oggi()) - datetime.timedelta(days=1)).isoformat()
    per_acc = {}
    for nome in glob.glob(os.path.join(progetto(), 'archivio', 'consumo', '*.json')):
        giorno = os.path.basename(nome)[:10]
        if giorno > ieri or giorno < (datetime.date.fromisoformat(ieri) - datetime.timedelta(days=7)).isoformat():
            continue
        try:
            with open(nome, encoding='utf-8') as f:
                t = json.load(f)
        except Exception:
            continue
        g = per_acc.setdefault(t.get('account', 'ignoto'), {})
        g[giorno] = g.get(giorno, 0) + int(t.get('peso') or 0)
    righe = []
    for acc, giorni in per_acc.items():
        prima = [v for d, v in giorni.items() if d < ieri]
        if ieri in giorni and len(prima) >= 3:
            media = sum(prima) / len(prima)
            if media and giorni[ieri] > CONTO_ACCOUNT * media:
                righe.append(f'account {acc}: ieri {giorni[ieri] / media:.1f} volte la sua media ({giorni[ieri] // 1000}k contro '
                             f'{int(media) // 1000}k token equivalenti)')
    if righe:
        contesto('SessionStart', f'SPRECO TOKEN ({CODICE}): ' + '; '.join(righe) + '. Una riga a Mario nel primo messaggio, '
                 'con le sessioni di ieri più care (archivio/consumo/, campo «anomalie»).')
    return 0


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        dati = {}
    modo = (sys.argv[1:] or [''])[0]
    return {'inizio': inizio, 'tool': tool, 'fine': fine, 'avvio': avvio}.get(modo, lambda d: 0)(dati)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
