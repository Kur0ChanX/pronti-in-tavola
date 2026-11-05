#!/usr/bin/env python3
"""Dove far girare le prove adesso: contenitore, Blacksmith o GitHub (Mario #295, «gestisci con intelligenza»).

Uso:  python3 -I tools/scegli-giro.py <caso> [--minuti FILE]
Casi: lavoro (prove della parte cambiata) · versione (giro completo prima di pubblicare) · urgenza ·
      rosso (un giro fuori è fallito) · lunedi (giro automatico con l'iPhone «apple»).
Legge i minuti con `.claude/conta-minuti.py --json` (o da FILE, per le prove di questo programma).
Scrive una riga «DOVE: <posto>» e il perché. La tabella della «bravura» è nella skill `minuti-github`.
"""
import json
import subprocess
import sys

# Durata di un giro completo, minuti (misure del 23-24/10: Blacksmith 16-17, GitHub 32-33, contenitore ~35).
DURATA = {'blacksmith': 17, 'github': 33, 'locale': 35}
GIRI_DI_SCORTA = 2  # un giro fuori parte solo se ne restano almeno 2 (il primo può venire rosso)
GIRI_AL_GIORNO = 2  # stima per le versioni, giri rossi compresi: il giro del lunedì non deve toglierli


def leggi_minuti(argv):
    if '--minuti' in argv:
        with open(argv[argv.index('--minuti') + 1]) as f:
            return json.load(f)
    uscita = subprocess.run([sys.executable, '-I', '.claude/conta-minuti.py', '--json'],
                            capture_output=True, text=True, timeout=300)
    if uscita.returncode != 0:
        raise SystemExit(f'conta-minuti non risponde: {uscita.stderr.strip()[:200]}')
    return json.loads(uscita.stdout)


def scegli(caso, m):
    """(posto, perché). posto: locale · blacksmith · github · nessuno."""
    bs_restano = m['blacksmith_totale'] - m['blacksmith']
    gh_per_prove = m['github_per_prove']
    bs_ok = m['blacksmith_attivo'] and bs_restano >= GIRI_DI_SCORTA * DURATA['blacksmith']
    gh_ok = gh_per_prove >= GIRI_DI_SCORTA * DURATA['github']
    conti = (f"Blacksmith {m['blacksmith']}/{m['blacksmith_totale']}, GitHub {m['github']}/{m['github_totale']} "
             f"(riserva {m['riserva']} per pubblicazioni e anteprime), azzeramento fra {m['giorni']} giorni")
    if caso == 'lavoro':
        return 'locale', 'poche prove della parte cambiata: qui partono subito, gratis, senza coda'
    if caso == 'rosso':
        return 'locale', ('prima si rifà QUI la prova rossa (stesso file, --repeat-each), gratis; '
                          'mai rilanciare il giro fuori senza la causa (E22)')
    # Mario #296 «1» (E162): versioni e urgenze su Blacksmith (~17 min, stesse prove); GitHub fa il secondo parere
    # del lunedì (macchina più lenta + iPhone) e le versioni solo se Blacksmith è fermo o finito.
    if caso == 'versione':
        caso = 'urgenza'
    if caso == 'urgenza':
        if bs_ok:
            return 'blacksmith', f"il più veloce (~{DURATA['blacksmith']} min) e su una macchina pulita; {conti}"
        if gh_ok:
            return 'github', f"Blacksmith {'spento' if not m['blacksmith_attivo'] else 'quasi finito'}; GitHub ha minuti oltre la riserva; {conti}"
        return 'locale', f"niente minuti fuori (o solo la riserva di GitHub): il giro verde qui basta per pubblicare; {conti}"
    if caso == 'lunedi':
        # Il giro del lunedì è un controllo in più (iPhone): solo se avanza, mai a spese delle versioni.
        if gh_ok:
            return 'github', f'secondo parere su GitHub (macchina più lenta, iPhone) coi minuti oltre la riserva; {conti}'
        if bs_ok and bs_restano >= (m['giorni'] * GIRI_AL_GIORNO + GIRI_DI_SCORTA) * DURATA['blacksmith']:
            return 'blacksmith', f'avanzano minuti anche per le versioni della settimana; {conti}'
        return 'nessuno', f'minuti da tenere per le versioni: il giro del lunedì si salta; {conti}'
    raise SystemExit(f'caso sconosciuto: {caso} (lavoro · versione · urgenza · rosso · lunedi)')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    posto, perche = scegli(sys.argv[1], leggi_minuti(sys.argv))
    print(f'DOVE: {posto}')
    print(f'Perché: {perche}')
    if posto == 'github':
        print("Come: etichetta «giro-github» sulla PR PRIMA di segnarla pronta (prove.yml la legge).")
    if posto == 'locale' and sys.argv[1] in ('versione', 'urgenza'):
        print('Come: bash tools/giro-come-github.sh <cartella> in sottofondo; verde → etichetta «giro-locale» sulla PR '
              '(prove.yml salta il giro fuori), poi pronta e unione.')
