#!/usr/bin/env python3
"""Messaggi a Mario solo in italiano (hook Stop, E139; «perché in inglese ?!?!» → «hook lingua sì»).

Blocca la fine del turno UNA volta (uscita 2, una riga su stderr) se il messaggio finale è in inglese:
  - si tolgono codice (``` e `…`), indirizzi, percorsi e nomi di file, citazioni «…» e "…" (testi d'altri);
  - si contano le parole che ci sono solo in inglese (the, and, will, I'm…) e quelle solo in italiano (il, che, è…);
  - inglese se le parole inglesi sono almeno 2 e almeno il triplo di quelle italiane.
Parole uguali nelle due lingue o usate anche in italiano (a, in, come, test, merge, push…) non contano.
Secondo giro (`stop_hook_active`), messaggio vuoto o illeggibile, qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-lingua-check.py
"""
import json
import re
import sys

INGLESE = set('''
the and is are was were be been being to of for with this that these those will would should could can't cannot
you your yours we our my it's its not have has had does did don't doesn't didn't won't isn't aren't wasn't
when what which who where why how there here than then now still already only just also after before until yet
about into over from or on at if all any some every each nothing something everything
waiting wait ready done resume resuming merged running sorry thanks please yes i'll i'm i've i'd let's you're we're
that's there's what's
'''.split())
ITALIANO = set('''
il lo la gli le un una uno di da che e è non per con su del della dello dei degli delle al alla allo ai alle
nel nella nei nelle sul sulla sui dal dalla dai l dell nell dall sull c o
sono ho hai ha abbiamo hanno mi ti ci si ma se anche più già poi ora quando questo questa questi queste
solo tutto tutti tutte fatto fatta ancora dopo prima perché cosa dove così sì va fa sta stato stata ogni tra fra
io tu noi voi loro mio mia tuo tua suo sua ecco dice scrivi
'''.split())
CODICE = re.compile(r'```.*?```|`[^`\n]*`', re.S)
CITAZIONI = re.compile(r'«[^»]*»|"[^"\n]*"|“[^”\n]*”')
INDIRIZZI = re.compile(r'https?://\S+|\S*[/\\]\S*|\b\w+\.\w+(?:\.\w+)*\b')
PAROLE = re.compile(r"[A-Za-zÀ-ÿ]+(?:'[A-Za-z]+)?")


def conta(testo):
    """→ (parole solo inglesi, parole solo italiane) nel testo, senza codice, indirizzi e citazioni."""
    pulito = CODICE.sub(' ', testo.replace('’', "'"))
    pulito = INDIRIZZI.sub(' ', CITAZIONI.sub(' ', pulito))
    en = it = 0
    for parola in PAROLE.findall(pulito):
        p = parola.lower()
        if p in INGLESE:
            en += 1
            continue
        pezzi = p.split("'")  # «dell'app», «c'è», «l'ho» contano come italiano
        if any(x in ITALIANO for x in pezzi):
            it += 1
    return en, it


def in_inglese(testo):
    en, it = conta(testo)
    return en >= 2 and en >= 3 * it


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    if dati.get('stop_hook_active'):
        return 0
    finale = dati.get('last_assistant_message')
    if not isinstance(finale, str) or not finale.strip() or not in_inglese(finale):
        return 0
    print('Messaggio per Mario in inglese (E139): riscrivilo tutto in italiano, frasi corte. '
          'Codice, comandi e nomi tecnici possono restare come sono.', file=sys.stderr)
    return 2


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
