#!/usr/bin/env python3
"""Domande a Mario chiare e col contesto (hook Stop, C233, E145; Mario 22/10: «metti la regola di farmi le domande piú
chiare possibili e farmi capire il contesto che magari non lo ricordo»).

Guarda solo il blocco delle domande del messaggio finale: dalla riga che comincia con «❓» alla riga «───» dopo (o alla
fine). Blocca la fine del turno UNA volta (uscita 2, una riga su stderr) se nel blocco:
  - manca la riga del contesto «📌 Di cosa parliamo: …»;
  - mancano le scelte numerate «1 · …» e «2 · …»;
  - c'è una sigla di lavoro che Mario può non ricordare (C200, E140, P18, M9, #263): va detta a parole.
Le versioni dell'app (v67) si vedono nell'app e vanno bene. Il testo fra `…` conta, quello nei blocchi ``` no.
Domanda ripetuta (Mario 27/10: «non rifarmi le stesse domande in loop»): se la stessa domanda (testo simile) è già
comparsa e Mario non ha scritto dopo (lo dice .git/scorta-msg.md di scorta.py, riscritto a ogni suo messaggio), blocca:
la domanda si toglie, resta scritta nelle consegne. L'ultima domanda mostrata sta in .git/domande-ultime.json.
Foto e video (E240, E247; Mario 1/11 «mandami un video se mi devi mostrare qualcosa animata … risolvere per
sempre»): blocca UNA volta anche se nel turno lo strumento dei file (SendUserFile) non ha mandato
  - un video, e la domanda parla di una cosa che si muove (animazione, onda, sfumatura, transizione, scorrimento…);
  - le foto o i video (file veri in `archivio/`) delle righe della propria catena (session_id nella tabella
    «## Catene» di docs/CHI-FA-COSA.md) in «## 0. Aspetta Mario» che il messaggio ricorda («Scorte 70»), o i file
    citati nel blocco della domanda.
«👉 DA FARE TU» senza la riga «A cosa serve» nel suo blocco: blocca UNA volta (kit 37.2).
Il turno parte dall'ultimo messaggio che non è del sistema (transcript_path).
Secondo giro (`stop_hook_active`), niente blocco delle domande, qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-domande-chiare.py
"""
import difflib
import json
import os
import re
import subprocess
import sys

BLOCCHI_CODICE = re.compile(r'```.*?```', re.S)
INIZIO = re.compile(r'^[\s>*#_]*❓', re.M)
FINE = re.compile(r'^\s*─{3,}', re.M)
SIGLE = re.compile(r'(?<![\w/.#-])(?:[CEPM]\d{1,3}|#\d{2,3})(?![\w])')
SCELTA = lambda n: re.compile(rf'(?<![\d.]){n}\s*·')
MOVIMENTO = re.compile(r'animazion|animat|video|\bonda\b|sfum|transizion|scorriment|si muove|movimento|effetto wow',
                       re.I)
MEDIA = re.compile(r'archivio/[\w./+-]+\.(?:mp4|webm|mov|gif|png|jpe?g)', re.I)
VIDEO = ('.mp4', '.webm', '.mov', '.gif')
RIGA_CATENA = re.compile(r"^-\s*\d{2}/\d{2}\s*·\s*\S+\s+([^\W\d][\w']*)\s+(\d+)(?:\s*→\s*(\d+))?\s*·")
# C469 fase 2 (rodato dal vivo): la riga corta in fondo a ogni messaggio non ripete la domanda; la foto va con quella intera
RIGA_CORTA = re.compile(r'^[\s>*_]*(?:⚠️\s*)?Aspettano te\s*:.*$', re.M)


def blocco(testo):
    """→ il testo del blocco delle domande, o None se il messaggio non ne ha."""
    pulito = BLOCCHI_CODICE.sub(' ', testo)
    inizio = INIZIO.search(pulito)
    if not inizio:
        return None
    resto = pulito[inizio.start():]
    fine = FINE.search(resto)
    # 10/11 (rodato dal vivo): la riga corta «⚠️ Aspettano te» attaccata senza «───» non fa parte delle domande
    return RIGA_CORTA.sub('', resto[:fine.start()] if fine else resto)


DA_FARE = re.compile(r'^[\s>*#_]*👉[^\n]*DA FARE TU', re.M)


def manca_a_cosa_serve(testo):
    """kit 37.2 (Pronti in Tavola, Mario «regola per tutti i progetti ed account»): il blocco «👉 DA FARE TU» (fino a
    «───» o alla fine) parte da «A cosa serve: …». → True se manca."""
    pulito = BLOCCHI_CODICE.sub(' ', testo)
    m = DA_FARE.search(pulito)
    if not m:
        return False
    resto = pulito[m.start():]
    fine = FINE.search(resto)
    return not re.search(r'a cosa serve', resto[:fine.start()] if fine else resto, re.I)


SITO_DA_APRIRE = re.compile(r'\b(apri|entra|vai)\b[^\n]{0,40}\b(sito|dashboard|console|cloudflare|firebase|github|google|blacksmith)\b', re.I)


def manca_link_da_aprire(testo):
    """PT E18 + PT E66: nel blocco «👉 DA FARE TU» un sito da aprire («Apri il sito di Cloudflare») vuole un link
    cliccabile (https:// fuori dai riquadri di codice). → True se manca."""
    m = DA_FARE.search(testo)
    if not m:
        return False
    resto = testo[m.start():]
    fine = FINE.search(resto)
    resto = resto[:fine.start()] if fine else resto
    fuori = BLOCCHI_CODICE.sub(' ', resto)
    return bool(SITO_DA_APRIRE.search(fuori)) and 'https://' not in fuori


INCOLLA = re.compile(r'\bincoll\w*', re.I)
TESTO_IN_FILE = re.compile(r'PROSSIMA-SESSIONE|CAMBIO-ACCOUNT|testo che trovi|«Testo da incollare»', re.I)


def manca_testo_da_incollare(testo):
    """PT E89 (Mario 14/11 «la prima volta che non mi fai copiare la stringa da mettere nell'altra chat»):
    se dico a Mario di incollare un testo, il testo sta nel messaggio in un riquadro di codice, mai solo
    «lo trovi in docs/PROSSIMA-SESSIONE.md». → True se manca."""
    return bool(INCOLLA.search(testo)) and bool(TESTO_IN_FILE.search(testo)) and '```' not in testo


def difetti(testo):
    """→ elenco dei difetti del blocco delle domande (vuoto = va bene)."""
    b = blocco(testo)
    if b is None:
        return []
    out = []
    if '📌' not in b:
        out.append('manca la riga «📌 Di cosa parliamo:» (cos\'è, dove si vede, perché serve adesso)')
    if not (SCELTA(1).search(b) and SCELTA(2).search(b)):
        out.append('mancano le scelte numerate «1 · … · 2 · …»')
    sigle = sorted(set(SIGLE.findall(b)))
    if sigle:
        out.append('sigle da dire a parole: ' + ', '.join(sigle[:6]))
    return out


def normale(testo):
    return ' '.join(re.sub(r'[^\w\s]', ' ', testo.lower()).split())


def simile(a, b):
    a, b = normale(a), normale(b)
    if not a or not b:
        return False
    pa, pb = set(a.split()), set(b.split())
    return difflib.SequenceMatcher(None, a, b).ratio() >= 0.5 or len(pa & pb) / len(pa | pb) >= 0.4


def cartella_git():
    try:
        r = subprocess.run(['git', 'rev-parse', '--absolute-git-dir'], capture_output=True, text=True, timeout=10,
                           cwd=os.environ.get('CLAUDE_PROJECT_DIR') or None)
        return r.stdout.strip() if r.returncode == 0 else ''
    except Exception:
        return ''


def segno_mario(gitdir):
    """→ quando Mario ha scritto l'ultima volta (data del file di scorta.py), 0 se non si sa."""
    try:
        return os.path.getmtime(os.path.join(gitdir, 'scorta-msg.md'))
    except OSError:
        return 0


def mandati_nel_turno(percorso):
    """→ percorsi mandati con SendUserFile dopo l'ultimo messaggio che non è del sistema (inizio del turno)."""
    try:
        with open(percorso, encoding='utf-8') as f:
            righe = f.readlines()
    except OSError:
        return []
    out = []
    for riga in reversed(righe):
        try:
            d = json.loads(riga)
        except ValueError:
            continue
        c = (d.get('message') or {}).get('content')
        if d.get('type') == 'user' and not d.get('isMeta') and (
                isinstance(c, str) or (isinstance(c, list) and c and c[0].get('type') == 'text')):
            break
        if d.get('type') == 'assistant' and isinstance(c, list):
            for b in c:
                if isinstance(b, dict) and b.get('type') == 'tool_use' and b.get('name') == 'SendUserFile':
                    out += [str(x) for x in ((b.get('input') or {}).get('files') or [])]
    return out


def catena_della_sessione(progetto, sessione):
    """→ nome della catena di questa sessione (tabella «## Catene» di docs/CHI-FA-COSA.md), '' se non c'è.
    C469 fase 2 (rapporto 14 voce 1): in cloud l'ingresso dell'hook ha l'id locale, mai nella tabella; quello della
    tabella è `session_` + la parte dopo `cse_` di CLAUDE_CODE_REMOTE_SESSION_ID. Si prova prima quello."""
    remoto = os.environ.get('CLAUDE_CODE_REMOTE_SESSION_ID') or ''
    if '_' in remoto and sessione != 'session_' + remoto.split('_', 1)[1]:
        trovata = catena_della_sessione(progetto, 'session_' + remoto.split('_', 1)[1])
        if trovata:
            return trovata
    if not sessione:
        return ''
    try:
        with open(os.path.join(progetto, 'docs', 'CHI-FA-COSA.md'), encoding='utf-8') as f:
            for riga in f:
                celle = [c.strip() for c in riga.split('|')]
                if len(celle) > 5 and sessione in riga and celle[1] not in ('Catena', ''):
                    return celle[1]
    except OSError:
        pass
    return ''


def file_aspetta_mario(progetto, finale, catena):
    """→ file veri di foto e video delle righe della propria catena in «## 0. Aspetta Mario» che il messaggio
    finale ricorda (quelle delle altre catene le rimanda la loro chat: niente doppioni)."""
    if not catena:
        return []
    try:
        with open(os.path.join(progetto, 'docs', 'DA-FARE.md'), encoding='utf-8') as f:
            testo = f.read()
    except OSError:
        return []
    m = re.search(r'^## 0\. Aspetta Mario\n(.*?)(?=^## )', testo, re.S | re.M)
    out = []
    for riga in (m.group(1).splitlines() if m else []):
        c = RIGA_CATENA.match(riga.strip())
        if not c or c.group(1) != catena:
            continue
        resto = RIGA_CORTA.sub('', finale)
        if not any(re.search(rf'\b{re.escape(c.group(1))}\s+{n}\b', resto) for n in (c.group(2), c.group(3)) if n):
            continue
        out += [f for f in MEDIA.findall(riga) if os.path.isfile(os.path.join(progetto, f))]
    return out


def media_mancanti(finale, mandati, progetto, sessione=''):
    """→ difetti di foto e video non mandati nel turno (E240, E247); vuoto = va bene."""
    nomi = {os.path.basename(x) for x in mandati}
    out = []
    b = blocco(finale)
    if b is not None and MOVIMENTO.search(b) and not any(x.lower().endswith(VIDEO) for x in mandati):
        out.append('la domanda parla di una cosa che si muove ma nel turno non hai mandato un video: fallo con '
                   '`tests/e2e/video.js` (skill `foto`, «Video») e mandalo con lo strumento dei file')
    citati = (MEDIA.findall(b) if b is not None else []) + file_aspetta_mario(
        progetto, finale, catena_della_sessione(progetto, sessione))
    manca = sorted({f for f in citati if os.path.basename(f) not in nomi})
    if manca:
        out.append('foto o video da rimandare con lo strumento dei file, nello stesso messaggio: ' + ', '.join(manca[:4]))
    return out


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    finale = dati.get('last_assistant_message')
    if not isinstance(finale, str) or not finale.strip():
        return 0
    if not dati.get('stop_hook_active'):
        progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
        mancano = media_mancanti(finale, mandati_nel_turno(dati.get('transcript_path') or ''), progetto,
                                 str(dati.get('session_id') or ''))
        if mancano:
            print('Foto e video (E240, E247; Mario 1/11 «mandami un video se mi devi mostrare qualcosa animata»): '
                  + '; '.join(mancano) + '. Mandali, poi chiudi il turno riscrivendo solo la parte che li riguarda (domanda o riga).',
                  file=sys.stderr)
            return 2
        if manca_a_cosa_serve(finale):
            print('«👉 DA FARE TU» senza «A cosa serve» (kit 37.2, Mario: «regola per tutti i progetti»): prima riga del '
                  'blocco «A cosa serve: …» (cosa ottiene Mario, l\'app o il lavoro). Riscrivi solo quel blocco.',
                  file=sys.stderr)
            return 2
        if manca_testo_da_incollare(finale):
            print('Testo da incollare solo nominato (PT E89): il testo per l\'altra chat va NEL messaggio, in un '
                  'riquadro di codice (```), pronto da copiare; il file si nomina solo come copia. Riscrivi solo quel passo.',
                  file=sys.stderr)
            return 2
        if manca_link_da_aprire(finale):
            print('«👉 DA FARE TU» dice di aprire un sito ma non c\'è il link cliccabile (PT E18, PT E66): metti '
                  'l\'indirizzo https:// nel testo (cliccabile, fuori dal riquadro); il riquadro solo per ciò che Mario '
                  'copia. Riscrivi solo quel blocco.', file=sys.stderr)
            return 2
    b = blocco(finale)
    if b is None:
        return 0
    gitdir = cartella_git()
    stato = os.path.join(gitdir, 'domande-ultime.json') if gitdir else ''
    segno = segno_mario(gitdir) if gitdir else 0
    if not dati.get('stop_hook_active'):
        try:
            with open(stato, encoding='utf-8') as f:
                prima = json.load(f)
        except Exception:
            prima = {}
        if prima.get('segno') == segno and simile(prima.get('testo', ''), b):
            print('Domanda ripetuta (Mario 27/10: «non rifarmi le stesse domande in loop»): l\'hai già fatta e Mario '
                  'non ha scritto dopo. Togli il blocco «❓» da questo messaggio: la domanda resta nelle consegne e si '
                  'rifà solo se Mario scrive d\'altro.', file=sys.stderr)
            return 2
        d = difetti(finale)
        if d:
            print('Domanda a Mario poco chiara (C233, E145): ' + '; '.join(d) + '. Riscrivi SOLO la domanda, '
              'col contesto in 1-2 righe e cosa cambia con ogni scelta (niente resoconto ripetuto).', file=sys.stderr)
            return 2  # la domanda giusta è quella riscritta: si segna al secondo giro
    if stato:
        with open(stato, 'w', encoding='utf-8') as f:
            json.dump({'testo': b, 'segno': segno}, f, ensure_ascii=False)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
