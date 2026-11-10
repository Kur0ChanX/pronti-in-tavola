#!/usr/bin/env python3
"""Forma dei titoli delle sessioni (hook PreToolUse, kit 30.7; Mario 1/11 00:15 «titoli definitivi»).

Su `set_session_title` e `create_session` (strumenti di claude-code-remote) controlla il titolo:
    <segno della catena> <icona progetto> <Nome> <numero> · <cosa fa>
- segno = catena (forma) + stato (colore): Principale 🟢 lavora · 🟡 tocca a Mario · 🔴 chiusa · ⚫ bloccata;
  Dov'è 🟩 🟨 🟥 ⬛; Scorte 💚 💛 ❤️ 🖤; Atlante ✳️ ✴️ ❌ ✖️; catena nuova (riserva) 📗 📒 📕 📓;
- icona del progetto (quella scritta nel suo CLAUDE.md): una emoji, senza lettere né numeri;
- Nome della catena in una parola, fisso (Principale, Dov'è, Scorte, Atlante), spazio, numero senza # né P; mai in fondo;
- cosa fa: al massimo 3 parole e ~24 caratteri.
- C454 (Mario 04/11 16:5x «io nelle sessioni non vedo nessun punto di domanda»; prima C423): subito dopo il numero,
  facoltativo, « ❓N» = N risposte che Mario deve dare (righe della catena in «## 0. Aspetta Mario»), su ogni colore;
  sessione chiusa (rosso o nero) con domande aperte: « ❓N → NN» (la sessione dove rispondere). Il «❔» non si usa più.
I cerchi sono solo della catena «Principale». Se `docs/CHI-FA-COSA.md` ha la tabella «## Catene» (| Catena | Forma | …),
il segno deve essere della forma di quella catena.
Eccezione: i titoli che cominciano con «✗ DOPPIONE» (E44).
Titolo sbagliato → nega lo strumento col motivo e un esempio giusto. Qualunque errore del controllo: silenzio.
Prova: python3 -I tools/test-titolo-forma.py
"""
import json
import os
import re
import sys

FORME = {
    'cerchi': ('🟢', '🟡', '🔴', '⚫'),
    'quadrati': ('🟩', '🟨', '🟥', '⬛'),
    'cuori': ('💚', '💛', '❤️', '🖤'),
    'stelle': ('✳️', '✴️', '❌', '✖️'),
    'libri': ('📗', '📒', '📕', '📓'),
}
PRINCIPALE = 'principale'
TETTO_COSA = 24
STRUMENTO = re.compile(r'(?:^|__)(set_session_title|create_session)$')
ESEMPI = ('«🟢 <icona> Principale 466 · colori Planner» · «🟨 <icona> Dov\'è 8 · foto da ridare» · «❤️ <icona> Scorte 67 · v118 online» '
          '· con domande aperte «🟢 <icona> Principale 535 ❓5 · minibar» · chiusa «🔴 <icona> Principale 534 ❓5 → 535 · consegne»')


def forma_di(segno):
    for nome, segni in FORME.items():
        if segno in segni:
            return nome
    return None


def linee(progetto):
    """→ {nome della catena (minuscolo): forma} dalla tabella «## Catene» di docs/CHI-FA-COSA.md; {} se manca."""
    try:
        with open(os.path.join(progetto, 'docs', 'CHI-FA-COSA.md'), encoding='utf-8') as f:
            testo = f.read()
    except Exception:
        return {}
    dentro, uscita = False, {}
    for riga in testo.split('\n'):
        if riga.startswith('## '):
            dentro = riga.strip() in ('## Catene', '## Linee')
        elif dentro and riga.startswith('|'):
            celle = [c.strip().strip('*') for c in riga.strip().strip('|').split('|')]
            # C469 rapporto 15 voce 5: «libri (riserva)» = libri (prima le catene coi libri non avevano il controllo)
            forma = (celle[1].lower().split() or [''])[0] if len(celle) >= 2 else ''
            if forma in FORME:
                uscita[celle[0].lower()] = forma
    return uscita


def controlla(titolo, tabella=None):
    """→ '' se il titolo va bene, sennò il motivo (una riga)."""
    t = ' '.join(str(titolo or '').split())
    if t.startswith('✗ DOPPIONE'):
        return ''
    parti = t.split(' ', 2)
    if len(parti) < 3:
        return 'manca qualcosa: servono segno, icona, nome della catena col numero, « · » e cosa fa'
    segno, icona, resto = parti
    forma = forma_di(segno)
    if not forma:
        return f'«{segno}» non è un segno: il primo pezzo è il segno della catena col colore dello stato'
    if re.search(r'[\w#·⭐]', icona) or forma_di(icona):
        return f'«{icona}» non è l\'icona del progetto (una emoji, quella del CLAUDE.md)'
    if ' · ' not in resto:
        return 'manca « · » fra il nome della catena col numero e cosa fa'
    catena, cosa = resto.split(' · ', 1)
    if re.search(r'[#⭐]|\bP\d', catena):
        return 'il numero va senza #, ⭐ né P, subito dopo il nome della catena (Principale 466, Dov\'è 8)'
    if re.search(r'[❔❓]', catena) and not re.search(r' ❓[1-9]\d*(?: → \d+)?$', catena):
        return ('il segno delle domande è « ❓N» dopo il numero, N = risposte che Mario deve dare (Principale 535 ❓5); '
                'chiusa con domande aperte « ❓N → NN» (dove rispondere); il «❔» non si usa più (C454)')
    m = re.fullmatch(r"([^\W\d_][\w'’]*) (\d+)(?: ❓(\d+)(?: → (\d+))?)?", catena)
    if not m:
        return f'«{catena}»: serve il nome della catena in una parola, spazio, numero (Principale 466, Scorte 68)'
    nome = m.group(1).lower()
    stato = FORME[forma].index(segno)  # 0 verde · 1 giallo · 2 rosso · 3 nero
    if m.group(4) and stato < 2:
        return '«→ NN» (la sessione dove rispondere) va solo sulle sessioni chiuse (rosso o nero); una sessione aperta risponde da sé'
    if nome == PRINCIPALE and forma != 'cerchi':
        return 'la catena Principale usa i cerchi: 🟢 lavora · 🟡 tocca a Mario · 🔴 chiusa · ⚫ bloccata'
    if nome != PRINCIPALE and forma == 'cerchi':
        return 'i cerchi (🟢🟡🔴⚫) sono solo della catena Principale: le altre usano la forma scritta in docs/CHI-FA-COSA.md'
    attesa = (tabella or {}).get(nome)
    if attesa and attesa != forma:
        return f'la catena «{m.group(1)}» ha i segni {" ".join(FORME[attesa])} in docs/CHI-FA-COSA.md, non {segno}'
    if '·' in cosa or re.search(r'(?:#|\bP)\d+\s*$', cosa):
        return 'il numero va dopo il nome della catena, mai in fondo'
    parole = cosa.split()
    if not parole:
        return 'manca cosa fa (al massimo 3 parole)'
    if len(parole) > 3 or len(cosa) > TETTO_COSA:
        return f'cosa fa «{cosa}»: al massimo 3 parole e ~20 caratteri'
    return ''


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    if not STRUMENTO.search(str(dati.get('tool_name', ''))):
        return 0
    titolo = (dati.get('tool_input') or {}).get('title')
    if titolo is None:
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    motivo = controlla(titolo, linee(progetto))
    if not motivo:
        return 0
    print(json.dumps({'hookSpecificOutput': {
        'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
        'permissionDecisionReason': f'Titolo «{titolo}»: {motivo}. Forma: <segno della catena> <icona> <Nome> <numero> · <cosa fa> '
                                    f'(REGOLE.md «Titoli», skill consegne fase 6). Esempi: {ESEMPI}.'}}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
