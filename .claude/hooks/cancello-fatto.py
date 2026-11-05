#!/usr/bin/env python3
"""Cancello del «fatto» (hook Stop, C214 c, Mario 21/10): niente «fatto» sul codice senza una prova riuscita dopo.

Blocca la fine del turno UNA volta (uscita 2, una riga su stderr) solo se tutto è vero:
  1. in questa sessione è cambiato un file del codice (Edit/Write nelle zone di `.claude/zone-codice.txt`,
     oppure un file delle zone modificato e non ancora nel commit) DOPO l'ultima prova riuscita;
  2. l'ultima prova riuscita è più vecchia: comando di prova in Bash finito senza errore e senza «failed»
     nell'uscita, prova in sottofondo finita con «completed», oppure `test-results/.last-run.json` «passed»;
  3. nessuna prova sta girando adesso;
  4. il messaggio finale dice fatto / ✅ / funziona / provato / verde / pronto,
     e non dice già che non è provato (o che è rosso);
  5. non è già un secondo giro del cancello (`stop_hook_active`).
Progetto senza prove note, transcript illeggibile, qualunque errore: silenzio, uscita 0.
Modo `commit` (PostToolUse su Bash, C333, E208, Mario 29/10 «a volte sei superficiale … attenzione in generale»): dopo
un `git commit` riuscito ricorda il secondo sguardo prima del «fatto» (c'è già? come lo vede Mario? cosa chiederà?),
al massimo una volta ogni 15 minuti (.git/secondo-sguardo.json). Mai blocca.
Prova: python3 -I tools/test-cancello-fatto.py
"""
import json
import os
import re
import subprocess
import sys
from datetime import datetime

FUORI = ('docs/', 'archivio/', '.claude/', 'node_modules/', 'dist/', '.git/')
STRUMENTI_SCRITTURA = ('Edit', 'Write', 'MultiEdit', 'NotebookEdit')
PROVA = re.compile(r'\b(vitest|playwright\s+test|pytest|node\s+--test|npm\s+(run\s+)?(test|prove[\w:-]*)\b|npm\s+t\b'
                   r'|emulators:exec|tools/test-[\w-]+\.py|go\s+test|cargo\s+test)')
FALLITA = re.compile(r'\b\d+\s+failed\b|\bFAILED\b|\bFALLITA\b|Tests?\s+\d+\s+failed|\bfailures?:\s*[1-9]', re.I)
AFFERMA = re.compile(r'✅|\bfatt[oaie]\b|\bfunzion(a|ano)\b|\bprovat[oaie]\b|\bverd[ei]\b|\bpront[oaie]\b|\bdone\b', re.I)
ONESTO = re.compile(r'non\s+(ancora\s+)?(l\'ho\s+|ho\s+|è\s+|sono\s+)?(provat|testat)|senza\s+prov|da\s+provare'
                    r'|prov[ae]\s+in\s+corso|giro\s+in\s+corso|\bross[aoie]\b|fallit[aoie]|non\s+funziona', re.I)
ESCE_MALE = re.compile(r'exit code [1-9]')
COMMIT = re.compile(r'(?:^|[;&|(]\s*)git\s+(?:-C\s+\S+\s+)?commit\b(?!.*--dry-run)', re.M)  # comando, non testo
NIENTE_DA_SALVARE = re.compile(r'nothing to commit|nothing added to commit|no changes added to commit')
PAUSA_SGUARDO = 15 * 60
SGUARDO = ('🔎 Secondo sguardo (C333, E208), prima di scrivere a Mario «fatto»: 1. c\'è già qualcosa che fa lo stesso '
           '(file, voce di Da fare, funzione, regola) o che questo contraddice? 2. dove lo vede Mario: in quanti tocchi, '
           'senza scorrere, coi dati veri? 3. cosa chiederà leggendo: cosa manca, cosa si rompe nelle altre funzioni, '
           'il giorno dopo, due persone insieme? Un buco → correggilo o scrivilo nel 💡 PARERE; niente → non parlarne.')
IN_CORSO = ('playwright test', 'vitest', 'emulators:exec', 'pytest')


def ora(testo):
    try:
        return datetime.fromisoformat(testo.replace('Z', '+00:00')).timestamp()
    except Exception:
        return None


def zone(progetto):
    try:
        with open(os.path.join(progetto, '.claude', 'zone-codice.txt'), encoding='utf-8') as f:
            righe = [r.strip() for r in f if r.strip() and not r.startswith('#')]
    except OSError:
        return None
    return tuple(righe) or None


def nel_codice(relativo, scelte):
    if not relativo or relativo.startswith('..') or '/node_modules/' in '/' + relativo or '/dist/' in '/' + relativo:
        return False
    if scelte is None:
        return not relativo.startswith(FUORI) and not relativo.endswith(('.md', '.txt'))
    return any(relativo == z or (z.endswith('/') and relativo.startswith(z)) for z in scelte)


def relativo(percorso, progetto):
    if not percorso:
        return ''
    pieno = os.path.realpath(percorso if os.path.isabs(percorso) else os.path.join(progetto, percorso))
    radice = os.path.realpath(progetto) + os.sep
    return pieno[len(radice):] if pieno.startswith(radice) else ''


def ha_prove(progetto):
    nomi = os.listdir(progetto)
    if any(n.startswith(('playwright.config', 'vitest.config', 'jest.config', 'pytest.ini')) for n in nomi):
        return True
    if any(os.path.isdir(os.path.join(progetto, d)) for d in ('tests', 'test')):
        return True
    try:
        with open(os.path.join(progetto, 'package.json'), encoding='utf-8') as f:
            script = json.load(f).get('scripts') or {}
        return any(k == 'test' or k.startswith('prove') for k in script)
    except Exception:
        return False


def prova_in_corso():
    proc = os.environ.get('CANCELLO_PROC') or '/proc'  # cartella finta solo nella prova
    try:
        pid = [p for p in os.listdir(proc) if p.isdigit()]
    except OSError:
        return False
    for p in pid:
        try:
            with open(os.path.join(proc, p, 'cmdline'), 'rb') as f:
                riga = f.read().replace(b'\0', b' ').decode('utf-8', 'replace')
        except OSError:
            continue
        if any(t in riga for t in IN_CORSO):
            return True
    return False


def testo_risultato(blocco):
    c = blocco.get('content')
    if isinstance(c, list):
        return ' '.join(x.get('text', '') for x in c if isinstance(x, dict))
    return c if isinstance(c, str) else ''


def leggi_transcript(percorso, progetto, scelte):
    """→ (inizio della sessione, ultima modifica al codice, file, ultima prova riuscita, testo finale)."""
    usi, sottofondo = {}, {}
    inizio, modifica, file_mod, prova, finale = 0.0, 0.0, '', 0.0, []
    with open(percorso, encoding='utf-8') as f:
        for riga in f:
            try:
                d = json.loads(riga)
            except Exception:
                continue
            m = d.get('message') or {}
            contenuto = m.get('content')
            quando = ora(d.get('timestamp') or '') or 0.0
            inizio = inizio or quando
            if d.get('type') == 'assistant' and isinstance(contenuto, list):
                for b in contenuto:
                    if b.get('type') == 'tool_use':
                        usi[b.get('id')] = (b.get('name'), b.get('input') or {})
                    elif b.get('type') == 'text' and b.get('text', '').strip():
                        finale.append(b['text'])
                continue
            if d.get('type') != 'user':
                continue
            finale = []
            blocchi = contenuto if isinstance(contenuto, list) else [{'type': 'text', 'text': contenuto or ''}]
            for b in blocchi:
                if b.get('type') == 'text':
                    t = b.get('text') or ''
                    for tid, stato in re.findall(r'<task-id>([^<]+)</task-id>.*?<status>([^<]+)</status>', t, re.S):
                        if tid in sottofondo and stato.strip() == 'completed' and not FALLITA.search(t) and not ESCE_MALE.search(t):
                            prova = max(prova, quando)
                    continue
                if b.get('type') != 'tool_result':
                    continue
                nome, entrata = usi.get(b.get('tool_use_id'), (None, {}))
                if b.get('is_error'):
                    continue
                if nome in STRUMENTI_SCRITTURA:
                    rel = relativo(entrata.get('file_path') or entrata.get('notebook_path'), progetto)
                    if nel_codice(rel, scelte) and quando >= modifica:
                        modifica, file_mod = quando, rel
                elif nome == 'Bash' and PROVA.search(entrata.get('command') or ''):
                    extra = d.get('toolUseResult') if isinstance(d.get('toolUseResult'), dict) else {}
                    if extra.get('backgroundTaskId'):
                        sottofondo[extra['backgroundTaskId']] = True
                    elif not FALLITA.search(testo_risultato(b)):
                        prova = max(prova, quando)
    return inizio, modifica, file_mod, prova, '\n'.join(finale)


def modifiche_sporche(progetto, scelte):
    try:
        r = subprocess.run(['git', 'status', '--porcelain', '--untracked-files=all'], cwd=progetto,
                           capture_output=True, text=True, timeout=10)
    except Exception:
        return 0.0, ''
    piu_nuova, quale = 0.0, ''
    for riga in r.stdout.splitlines():
        rel = riga[3:].split(' -> ')[-1].strip('"')
        if not nel_codice(rel, scelte):
            continue
        try:
            t = os.path.getmtime(os.path.join(progetto, rel))
        except OSError:
            continue
        if t > piu_nuova:
            piu_nuova, quale = t, rel
    return piu_nuova, quale


def ultima_corsa_playwright(progetto):
    p = os.path.join(progetto, 'test-results', '.last-run.json')
    try:
        with open(p, encoding='utf-8') as f:
            return os.path.getmtime(p) if json.load(f).get('status') == 'passed' else 0.0
    except Exception:
        return 0.0


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    if dati.get('stop_hook_active'):
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    percorso = dati.get('transcript_path') or ''
    if not os.path.isfile(percorso) or not ha_prove(progetto):
        return 0
    scelte = zone(progetto)
    inizio, modifica, file_mod, prova, finale = leggi_transcript(percorso, progetto, scelte)
    finale = dati.get('last_assistant_message') or finale
    sporca, file_sporco = modifiche_sporche(progetto, scelte)  # anche i file cambiati con sed o script
    if inizio and sporca > max(modifica, inizio):
        modifica, file_mod = sporca, file_sporco
    if not modifica:
        return 0  # niente codice cambiato in questa sessione
    prova = max(prova, ultima_corsa_playwright(progetto))
    if prova >= modifica or not AFFERMA.search(finale) or ONESTO.search(finale) or prova_in_corso():
        return 0
    print(f'Cancello del «fatto»: {file_mod} è cambiato dopo l\'ultima prova riuscita. Prima di dire fatto, '
          'funziona o verde lancia la prova della parte cambiata; se non si può, scrivi a Mario «non provato» e perché.',
          file=sys.stderr)
    return 2


def secondo_sguardo():
    dati = json.load(sys.stdin)
    entrata = dati.get('tool_input') or {}
    if dati.get('tool_name') != 'Bash' or not COMMIT.search(entrata.get('command') or ''):
        return 0
    risposta = dati.get('tool_response')
    testo = json.dumps(risposta, ensure_ascii=False) if not isinstance(risposta, str) else risposta
    if NIENTE_DA_SALVARE.search(testo or ''):
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    cartella = os.path.join(progetto, '.git')
    mem = os.path.join(cartella if os.path.isdir(cartella) else progetto, 'secondo-sguardo.json')
    adesso = datetime.now().timestamp()
    try:
        with open(mem, encoding='utf-8') as f:
            if adesso - float(json.load(f).get('ultimo', 0)) < PAUSA_SGUARDO:
                return 0
    except (OSError, ValueError, AttributeError):
        pass
    with open(mem, 'w', encoding='utf-8') as f:
        json.dump({'ultimo': adesso}, f)
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse', 'additionalContext': SGUARDO}},
                     ensure_ascii=False))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(secondo_sguardo() if sys.argv[1:] == ['commit'] else main())
    except Exception:
        sys.exit(0)
