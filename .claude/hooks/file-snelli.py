#!/usr/bin/env python3
"""File di lavoro snelli (C220, Mario 21/10: «tieni tutti i file che crei ottimizzati se no va a finire che tra mesi
sono pieni di spazzatura… se è necessario si lascia»).

PostToolUse su Edit|Write|Bash: guarda i file di lavoro letti spesso (elenco in `.claude/file-snelli.txt`, righe
«percorso tetto_KB riga_max», riga_max 0 = righe libere; senza il file valgono quelli di ELENCO). Avvisa Claude
(additionalContext) solo quando:
- un file supera il tetto ED è cresciuto da come l'aveva visto;
- una voce (riga di tabella «| C123 |» o lezione «- **E12**») supera riga_max caratteri ED è nuova o cresciuta.
La prima volta che vede un file (contenitore nuovo) non dice niente: prende le misure. Mai blocca (uscita 0).
Prova: python3 -I tools/test-file-snelli.py
"""
import hashlib
import json
import os
import re
import sys
import tempfile

ELENCO = [
    ('docs/DA-FARE.md', 40, 400),  # C469 L10: voci oltre 400 caratteri (prima 600); 320 a fine migrazione
    ('docs/CHI-FA-COSA.md', 6, 400),
    ('docs/PASSAGGIO-CONSEGNE.md', 15, 0),
    ('docs/ERRORI.md', 10, 300),  # C352: lezioni in una riga, storia in ERRORI-STORIA.md; C469 A6: due livelli, tetto 10 KB
    ('CLAUDE.md', 30, 0),
]
VOCE = re.compile(r'^(?:\|\s*([A-Z]{1,3}\d+[a-z]?)\s*\||-\s+\*\*([A-Z]{1,3}\d+)\b)')
# C469 A6 e fase 2 (rapporto 13 M9, M8): le lezioni recenti del diario si leggono a ogni avvio, al massimo 10
RECENTI = {'docs/ERRORI.md': ('## Ultimi 14 giorni', 10)}


def conta_recenti(percorso, titolo):
    n, dentro = 0, False
    with open(percorso, encoding='utf-8') as f:
        for r in f:
            if r.startswith('## '):
                dentro = r.strip() == titolo
            elif dentro and r.startswith('- **'):
                n += 1
    return n


def elenco(progetto):
    try:
        with open(os.path.join(progetto, '.claude', 'file-snelli.txt'), encoding='utf-8') as f:
            righe = [r.split() for r in f if r.strip() and not r.startswith('#')]
        return [(r[0], int(r[1]), int(r[2]) if len(r) > 2 else 0) for r in righe]
    except (OSError, ValueError, IndexError):
        return ELENCO


def misura(percorso, riga_max):
    with open(percorso, encoding='utf-8') as f:
        testo = f.read()
    voci = {}
    if riga_max:
        for r in testo.split('\n'):
            m = VOCE.match(r)
            if m:
                voci[m.group(1) or m.group(2)] = len(r)
    return len(testo.encode('utf-8')), voci


def file_memoria(progetto):
    nome = hashlib.sha1(os.path.realpath(progetto).encode()).hexdigest()[:12]
    return os.path.join(os.environ.get('FILE_SNELLI_TMP') or tempfile.gettempdir(), f'file-snelli-{nome}.json')


def main():
    try:
        json.load(sys.stdin)
    except Exception:
        pass
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    mem_path = file_memoria(progetto)
    try:
        with open(mem_path, encoding='utf-8') as f:
            memoria = json.load(f)
    except Exception:
        memoria = {}
    avvisi = []
    for rel, tetto, riga_max in elenco(progetto):
        try:
            peso, voci = misura(os.path.join(progetto, rel), riga_max)
        except OSError:
            continue
        prima = memoria.get(rel)
        # C469 fase 2 (rapporto 14 voce 10): sopra il tetto si ripete solo dopo 1 KB in più dall'ultimo avviso (prima a
        # ogni byte, anche per un merge di un'altra chat); sotto il tetto si riparte da zero
        detto = (prima or {}).get('detto', 0) if peso > tetto * 1024 else 0
        memoria[rel] = {'peso': peso, 'voci': voci, 'detto': detto}
        titolo, massimo = RECENTI.get(rel, ('', 0))
        recenti = conta_recenti(os.path.join(progetto, rel), titolo) if titolo else 0
        if titolo:
            memoria[rel]['recenti'] = recenti
        if prima is None:
            continue
        if titolo and recenti > massimo and recenti > prima.get('recenti', 0):
            avvisi.append(f'{rel}: {recenti} lezioni in «{titolo[3:]}», tetto {massimo}: le doppie o già fatte '
                          'rispettare da un hook vanno in docs/ERRORI-STORIA.md.')
        if peso > tetto * 1024 and peso > prima.get('peso', 0) and peso >= detto + 1024:
            memoria[rel]['detto'] = peso
            avvisi.append(f'{rel}: {round(peso / 1024)} KB, tetto {tetto} KB, ed è cresciuto.')
        lunghe = [(k, n) for k, n in voci.items() if n > riga_max and n > prima.get('voci', {}).get(k, 0)]
        if lunghe:
            lunghe.sort(key=lambda x: -x[1])
            avvisi.append(f'{rel}: voci oltre {riga_max} caratteri, nuove o cresciute: '
                          + ', '.join(f'{k} ({n})' for k, n in lunghe[:6]) + '.')
    try:
        with open(mem_path, 'w', encoding='utf-8') as f:
            json.dump(memoria, f)
    except OSError:
        pass
    if avvisi:
        testo = ('📏 File snelli (C220): ' + ' '.join(avvisi)
                 + ' Togli il finito e la storia (vanno in docs/DA-FARE-FATTE.md o docs/ERRORI-STORIA.md):'
                 + ' nella voce resta solo cosa manca. Necessario sì, spazzatura no.')
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse', 'additionalContext': testo}}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
