#!/usr/bin/env python3
"""Titolo giallo e riga in «## 0. Aspetta Mario» quando tocca a Mario (hook Stop, C368, C369, C371 kit 30.6; Mario 31/10 21:4x: «Il 🟡
deve valere sempre: valuta un hook che lo ricorda quando il turno finisce con ❓ DOMANDE o 👉 DA FARE TU»; 31/10 ~23:10:
«Ogni cosa che aspetta Mario … diventa subito una riga nella sezione nuova «## 0. Aspetta Mario», in cima a DA-FARE»).

Gialli = segno «tocca a Mario» di ogni catena (kit 30.7): 🟡 Principale · 🟨 Dov'è · 💛 Scorte · ✴️ Atlante · 📒 riserva.
E245 (Mario 1/11 01:45): il colore dice cosa fa la sessione ADESSO: verde finché lavora, anche con una domanda aperta;
giallo solo quando si ferma ad aspettare Mario; all'avvio sempre verde; ripartita a lavorare dopo il giallo, subito verde.
Se il messaggio finale ha il blocco «❓» (domande) o «👉 DA FARE TU» (passi a mano), blocca la fine del turno UNA volta
(uscita 2, una riga su stderr) quando manca anche una sola di queste due cose:
- in questo turno la sessione è stata rinominata (`set_session_title`): col giallo se dopo il messaggio si ferma ad
  aspettare Mario («<giallo> <icona> <Nome> <numero> · <cosa fa>», più la notifica sul telefono, se lo strumento c'è),
  col verde se continua a lavorare da sola (giro di prove, sveglia, altro lavoro);
- `docs/DA-FARE.md` ha la sezione «## 0. Aspetta Mario» con almeno una riga con la data di oggi (ora italiana, «gg/mm»).
  Progetto senza `docs/DA-FARE.md`: questo controllo si salta.
Anche senza domande nel messaggio: un titolo giallo dato in questo turno vuole la riga di oggi nella sezione 0.
Il turno comincia all'ultimo messaggio «utente» che non è un esito di strumento (Mario, un avviso o una sveglia).
Con l'argomento «inizio» (hook UserPromptSubmit): se l'ultimo titolo dato alla sessione è giallo, ricorda (senza bloccare)
di rinominarla SUBITO col verde se in questo turno lavora.
Secondo giro (`stop_hook_active`), trascrizione assente o illeggibile, qualunque errore: silenzio, uscita 0.
E255 (Mario 1/11 ~09:10: «non voglio che rispondi in loop 3 volte in modo uguale un messaggio dietro l'altro … trova una
soluzione intelligente»): sessione chiusa (ultimo titolo rosso: 🔴 ❤️ ❌ 🟥 📕) = silenzio, le chiuse non si rinominano;
dopo il blocco MAI riscrivere il messaggio (Mario l'ha già letto): rinomina e chiudi con una riga di 3-5 parole.
C422 (Mario 02/11 «domande decisive: fermati e aspetta, o un sistema salva token per non dimenticarle»): messaggio
finale con una domanda decisiva («🛑» fuori dai blocchi di codice) → la riga di oggi in «## 0. Aspetta Mario» deve avere
anche lei «🛑» (così l'avvio la ricorda per prima e nessuna sessione ci lavora sopra a caso).
C423 (Mario 02/11 «nel nome sessione ❔ se c'è una domanda, ❓ se è ferma e mi aspetta; se ho risposto toglilo»):
segno delle domande subito dopo il numero del titolo, deciso dalle righe della catena in «## 0. Aspetta Mario»
(«<segno> <Nome> <numero>»): righe aperte → verde con « ❔», giallo con « ❓»; nessuna riga → nessun segno. Ultimo titolo
diverso → blocca UNA volta: rinomina (un solo strumento, zero letture). Titolo senza catena o rosso/nero: silenzio.
Prova: python3 -I tools/test-titolo-giallo.py
"""
import datetime
import json
import os
import re
import sys

BLOCCHI_CODICE = re.compile(r'```.*?```', re.S)
TOCCA_A_MARIO = re.compile(r'^[\s>*#_]*(?:❓|👉\s*DA FARE TU)', re.M)
TITOLO = re.compile(r'(?:^|__)set_session_title$')
GIALLI = ('🟡', '🟨', '💛', '✴️', '📒')
ROSSI = ('🔴', '❤️', '❌', '🟥', '📕')  # sessione chiusa: non si rinomina più (skill consegne, fase 6)
DA_FARE = os.path.join('docs', 'DA-FARE.md')
SEZIONE_0 = '## 0. Aspetta Mario'


DECISIVA = '🛑'


def decisiva(testo):
    return DECISIVA in BLOCCHI_CODICE.sub(' ', testo)


def tocca_a_mario(testo):
    return bool(TOCCA_A_MARIO.search(BLOCCHI_CODICE.sub(' ', testo)))


def inizio_turno(voce):
    """→ True se la voce della trascrizione è un messaggio che apre un turno (non l'esito di uno strumento)."""
    if voce.get('type') != 'user':
        return False
    contenuto = (voce.get('message') or {}).get('content')
    if isinstance(contenuto, str):
        return True
    if isinstance(contenuto, list):
        tipi = {b.get('type') for b in contenuto if isinstance(b, dict)}
        return 'tool_result' not in tipi and bool(tipi)
    return False


def titoli_del_turno(percorso, tutta=False):
    """→ i titoli dati alla sessione nel turno in corso (`tutta`: in tutta la trascrizione, ultimi 2 MB), in ordine;
    None se la trascrizione non si legge."""
    try:
        with open(percorso, 'rb') as f:
            f.seek(max(0, os.path.getsize(percorso) - 2_000_000))
            righe = f.read().decode('utf-8', 'ignore').splitlines()
    except Exception:
        return None
    titoli = []
    for riga in reversed(righe):
        try:
            voce = json.loads(riga)
        except Exception:
            continue
        if not tutta and inizio_turno(voce):
            break
        if tutta and titoli:
            break
        contenuto = (voce.get('message') or {}).get('content') if voce.get('type') == 'assistant' else None
        if isinstance(contenuto, list):
            for b in contenuto:
                if isinstance(b, dict) and b.get('type') == 'tool_use' and TITOLO.search(str(b.get('name', ''))):
                    titoli.append(str((b.get('input') or {}).get('title', '')))
    return list(reversed(titoli))


def oggi():
    """→ la data di oggi in ora italiana, «gg/mm» (prova: variabile TITOLO_GIALLO_OGGI)."""
    finta = os.environ.get('TITOLO_GIALLO_OGGI')
    if finta:
        return finta
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo('Europe/Rome')).strftime('%d/%m')
    except Exception:
        return (datetime.datetime.utcnow() + datetime.timedelta(hours=1)).strftime('%d/%m')


def righe_aspetta(progetto):
    """→ le righe «- …» della sezione «## 0. Aspetta Mario» di Da fare; [] se la sezione manca; None se Da fare manca."""
    try:
        with open(os.path.join(progetto, DA_FARE), encoding='utf-8') as f:
            testo = f.read()
    except Exception:
        return None
    righe, dentro = [], False
    for riga in testo.split('\n'):
        if riga.startswith('## '):
            dentro = riga.startswith(SEZIONE_0)
        elif dentro and riga.lstrip().startswith('- '):
            righe.append(riga)
    return righe


CATENA = re.compile(r"^\S+ \S+ ([^\W\d_][\w'’]*) (\d+)( [❔❓])? · ")
VERDI = ('🟢', '🟩', '💚', '✳️', '📗')


def segno_domande(titolo, righe):
    """→ '' se il segno delle domande nel titolo è giusto, sennò il titolo corretto (C423)."""
    t = ' '.join(str(titolo or '').split())
    m = CATENA.match(t)
    if not m or righe is None:
        return ''
    segno = t.split(' ', 1)[0]
    if segno in VERDI:
        voluto = ' ❔'
    elif segno in GIALLI:
        voluto = ' ❓'
    else:
        return ''
    nome = m.group(1)
    giro = rf"(?:^|[\s·]){re.escape(nome)} \d+\b" + (r"|(?:^|[\s·])[#⭐]\d+\b" if nome.lower() == 'principale' else '')
    aperte = sum(1 for r in righe if re.search(giro, r))
    if not aperte:
        voluto = ''
    if (m.group(3) or '') == voluto:
        return ''
    return t[:m.start(3)] + voluto + t[m.end(3):] if m.group(3) else t[:m.end(2)] + voluto + t[m.end(2):]


def inizio(dati):
    """UserPromptSubmit: ultimo titolo giallo → promemoria del verde (E245). Mai blocca."""
    titoli = titoli_del_turno(dati.get('transcript_path') or '', tutta=True)
    if not titoli or not titoli[-1].lstrip().startswith(GIALLI):
        return 0
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'UserPromptSubmit', 'additionalContext': (
        f'TITOLO GIALLO (E245): «{titoli[-1][:80]}». Se in questo turno lavori, rinomina SUBITO la sessione col verde '
        'della tua catena (set_session_title; « ❔» dopo il numero se restano domande tue in «Aspetta Mario», C423); giallo con « ❓» solo se resti ferma ad aspettare Mario.')}}, ensure_ascii=False))
    return 0


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    if 'inizio' in sys.argv[1:]:
        return inizio(dati)
    if dati.get('stop_hook_active'):
        return 0
    finale = dati.get('last_assistant_message')
    domanda = isinstance(finale, str) and tocca_a_mario(finale)
    titoli = titoli_del_turno(dati.get('transcript_path') or '')
    if titoli is None:
        return 0
    ultimo = titoli_del_turno(dati.get('transcript_path') or '', tutta=True) or ['']
    if ultimo[-1].lstrip().startswith(ROSSI):
        return 0  # sessione chiusa: niente titolo da dare, niente messaggio da riscrivere (E255)
    giallo = bool(titoli) and titoli[-1].lstrip().startswith(GIALLI)
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    righe = righe_aspetta(progetto)
    if not domanda and not giallo:
        giusto = segno_domande(ultimo[-1], righe)
        if giusto:
            print(f'Segno delle domande nel titolo (C423: ❔ verde con domande della tua catena in «{SEZIONE_0}», ❓ giallo '
                  f'ferma ad aspettare Mario, niente se non ce ne sono): rinomina SOLO col titolo «{giusto}» '
                  '(set_session_title). NON riscrivere il messaggio; chiudi con 3-5 parole.', file=sys.stderr)
            return 2
        return 0
    giorno = oggi()
    manca_titolo = domanda and not titoli
    manca_riga = righe is not None and not any(giorno in r for r in righe)
    manca_stop = (domanda and decisiva(finale) and righe is not None and not manca_riga
                  and not any(giorno in r and DECISIVA in r for r in righe))
    if not manca_titolo and not manca_riga and not manca_stop:
        giusto = segno_domande((titoli or ultimo)[-1], righe)
        if giusto:
            print(f'Segno delle domande nel titolo (C423): rinomina SOLO col titolo «{giusto}» (set_session_title). NON '
                  'riscrivere il messaggio; chiudi con 3-5 parole.', file=sys.stderr)
            return 2
        return 0
    cosa = []
    if manca_titolo:
        cosa.append('rinomina la sessione (set_session_title): col giallo della tua catena se dopo questo messaggio ti fermi '
                    'ad aspettare Mario («<🟡|🟨|💛|✴️|📒> <icona> <Nome> <numero> · <cosa fa>», es. «🟡 <icona> Principale 466 ❓ · '
                    'scegli foto», più la notifica sul telefono con PushNotification, se lo strumento c\'è), col verde se continui '
                    'a lavorare da sola (E245: il colore dice cosa fai adesso)')
    if manca_riga:
        cosa.append(f'scrivi in docs/DA-FARE.md, sezione «{SEZIONE_0}» in cima, una riga per ogni cosa che aspetta Mario '
                    f'(«- {giorno} · <segno giallo> <Nome> <numero> · <cosa deve fare Mario>», es. «🟨 Dov\'è 8»; domanda rifatta: data '
                    'di oggi nella sua riga), poi commit e push')
    if manca_stop:
        cosa.append(f'il messaggio ha una domanda decisiva (🛑): metti «🛑» nella sua riga di oggi in «{SEZIONE_0}» '
                    '(«- gg/mm · 🛑 · <segno giallo> <Nome> <numero> · …»), poi commit e push (C422)')
    print(('Il turno finisce con una domanda o un passo a mano per Mario: ' if domanda else 'Titolo giallo in questo turno: ') + '; poi '.join(cosa) + '. NON riscrivere il '
          'messaggio: Mario l\'ha già letto (E255, «3 messaggi di fila uguali»); chiudi con una riga di 3-5 parole. La '
          'prossima volta: PRIMA del messaggio finale.', file=sys.stderr)
    return 2


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
