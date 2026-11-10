#!/usr/bin/env python3
"""Promesse a Mario dentro `docs/DA-FARE.md` (hook Stop, C331, E206, E207; Mario 29/10: «perché fai le cose a metà …
risolvi il problema dalla base per tutto claude senza futuri conflitti», poi «è diverso o mezzo doppione?»).

Una promessa è una voce di Da fare con «👁 Lo vedi: <dove la vede Mario> · prova: <foto o lettura dei dati veri>».
La voce va in `docs/DA-FARE-FATTE.md` solo con «👁 Visto da Mario: <data> · <foto in archivio/, lettura o commit>».
Tre modi:
  (nessun argomento) hook Stop: se il messaggio finale promette a Mario qualcosa al futuro («caricherò», «lo metto»,
      «vedrai», «entra nella v100», «diventano interi appena…») e la frase non parla di una voce con 👁 (almeno 2 parole
      in comune col titolo in grassetto o col «Lo vedi»), blocca la fine del turno UNA volta (uscita 2, una riga su stderr).
      Non contano: blocchi ```, testo fra «», righe delle domande (❓ … ───) e dei passi di Mario (👉 … ───),
      righe che finiscono con «?», scelte «1 · …», frasi negate («non lo metto») o legate a una risposta di Mario
      («se dici sì…»). La stessa frase blocca una volta sola (.git/promesse-viste.json).
  --aperte     le voci con 👁, una per riga (avvio, consegne, prima di ogni versione); --breve: una riga sola.
  --lotto [N]  le N più vecchie (di base 10) pronte per il lotto a Mario (skill domande «Lavori aperti e chat», C469 B5).
  --controlla  ogni voce con 👁 ha «Lo vedi» e «prova»; ogni voce finita con 👁 ha «Visto da Mario» con la prova.
Secondo giro (`stop_hook_active`), progetto senza Da fare, qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-promesse.py
"""
import hashlib
import json
import os
import re
import sys

DA_FARE = os.path.join('docs', 'DA-FARE.md')
FATTE = os.path.join('docs', 'DA-FARE-FATTE.md')
SEGNO = re.compile(r'👁\s*Lo vedi', re.I)  # 👁 da solo può avere altri significati (es. Visione)
SEGNO_FINITA = re.compile(r'👁\s*(?:Lo vedi|Visto)', re.I)

VERBI = (r'caricher|metter|far|porter|aggiunger|sistemer|corregger|pubblicher|mander|finir|rifar|preparer|rilancer'
         r'|completer|mostrer|accender|cambier|sposter|unir|verificher|rimetter|importer|riempir|diventer|arriver'
         r'|comparir|entrer')
PRESENTE = r'carico|metto|porto|aggiungo|sistemo|correggo|pubblico|mando|mostro|accendo|importo|rimetto|completo'
PROMESSE = [
    re.compile(rf"\b(?:{VERBI})(?:ò|emo|à|anno)\b", re.I),
    re.compile(r"\b(?:vedrai|vedrete|troverai|potrai)\b", re.I),
    re.compile(r"\bsar(?:à|anno)\s+(?:pront|online|caricat|visibil|nell|in\s+app|attiv|fatt|complet)", re.I),
    re.compile(rf"\b(?:lo|la|li|le|ne|l')\s?(?:{PRESENTE})\b", re.I),
    re.compile(rf"\b(?:poi|dopo|appena\s+\S+|subito|stasera|stanotte|domani|fra\s+poco|tra\s+poco|entro\s+\S+)\s+"
               rf"(?:{PRESENTE})\b", re.I),
    re.compile(r"\b(?:entra|entrano)\s+(?:nella|in|con\s+la)\s+v\d+", re.I),
    re.compile(r"\b(?:arriva|arrivano|diventa|diventano|compare|compaiono)\b[^.!?\n]{0,60}"
               r"\b(?:appena|dopo|stasera|domani|entro|fra|tra|con\s+la\s+v\d+|nella\s+v\d+|alle\s+\d|verso)", re.I),
    re.compile(r"\b(?:appena|dopo|stasera|domani|entro|con\s+la\s+v\d+)\b[^.!?\n]{0,60}"
               r"\b(?:arriva|arrivano|diventa|diventano|compare|compaiono)\b", re.I),
]
CODICE = re.compile(r'```.*?```', re.S)
CITAZIONE = re.compile(r'«[^»\n]*»')
INIZIO_SALTO = re.compile(r'^[\s>*#_]*(?:❓|👉)')
FINE_SALTO = re.compile(r'^\s*─{3,}')
SCELTA = re.compile(r'^[\s>*_-]*\d+\s*·')
SE_MARIO = re.compile(r'\bse\s+(?:mi\s+)?(?:dici|rispondi|scegli|confermi|vuoi|preferisci|dai|approvi)\b', re.I)
NEGATA = re.compile(r'\bnon\b[^.!?\n]{0,18}$', re.I)
LO_VEDI = re.compile(r'👁\s*Lo vedi:\s*(?P<dove>[^|]+?)\s*·\s*prova:\s*(?P<prova>[^|]+)', re.I)
VISTO = re.compile(r'👁\s*Visto da Mario:[^|]*?(?:archivio/\S+|\blettura\b|\b[0-9a-f]{8,40}\b)', re.I)
TITOLO = re.compile(r'\*\*(.+?)\*\*')
PAROLA = re.compile(r'[a-zà-ù]{4,}', re.I)
VUOTE = {'nella', 'della', 'dalla', 'delle', 'degli', 'nelle', 'sulla', 'questo', 'questa', 'quello', 'quella', 'prima',
         'sempre', 'ancora', 'anche', 'tutti', 'tutte', 'tutto', 'mario', 'adesso', 'subito', 'sono', 'come', 'dopo',
         'ogni', 'fino', 'dove', 'solo', 'oggi', 'alle', 'dalle', 'nelle', 'quando', 'appena', 'verso', 'entro', 'tuoi',
         'tuo', 'vedi', 'prova', 'foto', 'dati', 'veri', 'sito'}


def righe_tabelle(testo):
    """Righe di tutte le tabelle del file (senza intestazione e separatore) → liste di caselle."""
    righe = []
    for riga in (testo or '').splitlines():
        if not riga.lstrip().startswith('|'):
            continue
        caselle = [c.strip() for c in riga.strip().strip('|').split('|')]
        if all(re.fullmatch(r':?-{3,}:?', c) for c in caselle if c) or caselle[:1] in (['N'], ['N.']):
            continue
        righe.append(caselle)
    return righe


def leggi(progetto, rel):
    try:
        with open(os.path.join(progetto, rel), encoding='utf-8') as f:
            return f.read()
    except OSError:
        return None


def aperte(progetto):
    """Voci di Da fare con 👁: dict con n, titolo, dove, prova, chi."""
    voci = []
    for c in righe_tabelle(leggi(progetto, DA_FARE)):
        cosa = c[1] if len(c) > 1 else ''
        if not SEGNO.search(cosa):
            continue
        t, v = TITOLO.search(cosa), LO_VEDI.search(cosa)
        voci.append({'n': c[0], 'titolo': (t.group(1) if t else cosa[:70]).strip(), 'dove': v.group('dove') if v else '',
                     'prova': v.group('prova').strip() if v else '', 'chi': c[2] if len(c) > 2 else ''})
    return voci


def numero_voce(v):
    """Numero della voce (C312 → 312) per l'ordine dalla più vecchia; senza numero in fondo."""
    cifre = ''.join(ch for ch in v['n'] if ch.isdigit())
    return int(cifre) if cifre else 10**9


def controlla(progetto):
    if leggi(progetto, DA_FARE) is None:
        return [f'manca {DA_FARE}']
    difetti = [f'{v["n"]}: con 👁 servono «Lo vedi: <dove la vede Mario> · prova: <foto o lettura>»'
               for v in aperte(progetto) if not v['dove'] or not v['prova']]
    for c in righe_tabelle(leggi(progetto, FATTE)):
        cosa = ' '.join(c[1:2])
        if SEGNO_FINITA.search(cosa) and not VISTO.search(cosa):
            difetti.append(f'{c[0]} finita senza «👁 Visto da Mario: <data> · <foto in archivio/, lettura o commit>»')
    return difetti


def frasi_promesse(testo):
    """Frasi del messaggio che promettono qualcosa a Mario (esclusi codice, citazioni, domande, passi di Mario)."""
    testo = CITAZIONE.sub('«»', CODICE.sub('', testo or ''))
    trovate, salto = [], False
    for riga in testo.splitlines():
        if FINE_SALTO.match(riga):
            salto = False
            continue
        if INIZIO_SALTO.match(riga):
            salto = True
        if salto or not riga.strip() or riga.rstrip().endswith('?') or SCELTA.match(riga) or SE_MARIO.search(riga):
            continue
        for modello in PROMESSE:
            m = next((m for m in modello.finditer(riga) if not NEGATA.search(riga[:m.start()])), None)
            if m:
                inizio = riga.rfind('. ', 0, m.start())
                inizio = inizio + 2 if inizio >= 0 else 0
                fine = riga.find('. ', m.end())
                trovate.append(riga[inizio:fine if fine > 0 else len(riga)].strip(' *_>-·|')[:140])
                break
    return trovate


def parole(testo):
    return {p.lower() for p in PAROLA.findall(testo)} - VUOTE


def gia_aperta(frase, voci):
    mie = parole(frase)
    return any(len(mie & parole(v['titolo'] + ' ' + v['dove'])) >= 2 for v in voci)


def ultimo_testo(percorso):
    finale = []
    with open(percorso, encoding='utf-8') as f:
        for riga in f:
            try:
                d = json.loads(riga)
            except Exception:
                continue
            c = (d.get('message') or {}).get('content')
            if d.get('type') == 'user':
                finale = []
            elif d.get('type') == 'assistant' and isinstance(c, list):
                finale += [b.get('text', '') for b in c if isinstance(b, dict) and b.get('type') == 'text']
    return '\n'.join(finale)


def gia_vista(progetto, frase):
    """True se la frase ha già bloccato una volta; sennò la segna."""
    cartella = os.path.join(progetto, '.git')
    if not os.path.isdir(cartella):
        return False
    file = os.path.join(cartella, 'promesse-viste.json')
    chiave = hashlib.sha1(re.sub(r'\W+', ' ', frase.lower()).strip().encode()).hexdigest()[:16]
    try:
        with open(file, encoding='utf-8') as f:
            viste = json.load(f)
    except Exception:
        viste = []
    if chiave in viste:
        return True
    with open(file, 'w', encoding='utf-8') as f:
        json.dump((viste + [chiave])[-200:], f)
    return False


def stop(dati):
    if dati.get('stop_hook_active'):
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    percorso = dati.get('transcript_path') or ''
    if leggi(progetto, DA_FARE) is None:
        return 0
    finale = dati.get('last_assistant_message') or (ultimo_testo(percorso) if os.path.isfile(percorso) else '')
    voci = aperte(progetto)
    frasi = [f for f in frasi_promesse(finale) if not gia_aperta(f, voci)]
    if not frasi or gia_vista(progetto, frasi[0]):
        return 0
    print(f'Promessa a Mario senza voce 👁 in {DA_FARE} (C331): «{frasi[0]}». Nella sua voce (o in una nuova) scrivi '
          '«👁 Lo vedi: <dove la vede Mario> · prova: <foto o lettura dei dati veri>», commit e push; poi chiudi il turno '
          'con UNA riga che non ripete il messaggio. Se non è una promessa, chiudi con una riga sola.', file=sys.stderr)
    return 2


def main():
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    if '--controlla' in sys.argv:
        difetti = controlla(progetto)
        for d in difetti:
            print('PROMESSE:', d)
        if not difetti:
            print(f'PROMESSE: in ordine ({len(aperte(progetto))} voci con 👁 in {DA_FARE})')
        return 1 if difetti else 0
    if '--lotto' in sys.argv:
        dopo = sys.argv[sys.argv.index('--lotto') + 1:]
        quante = int(dopo[0]) if dopo and dopo[0].isdigit() else 10
        voci = aperte(progetto)
        scelte = sorted(voci, key=numero_voce)[:quante]
        print(f'LOTTO «👁» per Mario: le {len(scelte)} più vecchie di {len(voci)}. Per ognuna: foto o prova, poi '
              '«1 va · 2 non va (cosa) · 3 non serve più»; 1 e 3 la chiudono, 2 la riapre col difetto.')
        for i, v in enumerate(scelte, 1):
            print(f'{i}. {v["n"]} · {v["titolo"]} · lo vedi: {v["dove"]} · prova: {v["prova"]} · {v["chi"]}')
        return 0
    if '--aperte' in sys.argv:
        voci = aperte(progetto)
        if '--breve' in sys.argv:
            if voci:
                # C434: all'avvio solo il numero e le 5 più vecchie (l'elenco intero costava ~1.600 token a ogni avvio).
                num = numero_voce
                # Mario 03/11 «4 consiglio»: anche le 5 più nuove (numero C più alto), senza doppioni.
                ordinate = sorted(voci, key=num)
                vecchie = ordinate[:5]
                nuove = [v for v in ordinate if num(v) < 10**9 and v not in vecchie][-5:][::-1]
                riga = lambda vs: '; '.join(f'{v["n"]} {v["titolo"][:60]} [{v["chi"]}]' for v in vs)
                print(f'PROMESSE APERTE a Mario: {len(voci)} (voci con 👁 in {DA_FARE}); le 5 più vecchie: '
                      + riga(vecchie)
                      + (f'. Le 5 più nuove: {riga(nuove)}' if nuove else '')
                      + '. Elenco intero: python3 -I .claude/hooks/promesse.py --aperte. Chiudile con la prova come le vede Mario PRIMA di lavoro nuovo e diglielo nel primo messaggio.')
            return 0
        for v in voci:
            print(f'{v["n"]} · {v["titolo"]} · lo vedi: {v["dove"]} · prova: {v["prova"]} · {v["chi"]}')
        return 0
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    return stop(dati)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
