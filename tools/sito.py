#!/usr/bin/env python3
"""Pronti in Tavola · costruisce il sito vero in `sito/` (lo usa Cloudflare Pages come comando di build).

Copia SOLO i file dell'app e le immagini che l'app usa davvero: niente docs/, archivio/, tools/,
.claude/ né foto vecchie (il repository contiene note e foto che non devono finire online).
A differenza di tools/anteprima.py lascia la configurazione vera di Firebase in dati.js.

Uso: python3 -I tools/sito.py   (esce con errore e non crea niente di mezzo se qualcosa manca)
"""
import pathlib
import re
import datetime
import json
import shutil
import subprocess
import sys
from zoneinfo import ZoneInfo

RADICE = pathlib.Path(__file__).resolve().parent.parent
USCITA = RADICE / 'sito'
FILE_APP = ['index.html', 'style.css', 'data.js', 'dati.js', 'opzioni.js', 'lucchetto.js', 'vapore.js', 'guida-iphone.js', 'app.js',
            'spesa.js', 'aiutante.js', 'voce-clienti.js', 'voce-piper.js', 'voce-kokoro.js', 'foto-ai.js', 'ricettario.js', 'ricette.js', 'ricette-fit.js', 'sw.js', 'manifest.webmanifest']
MEDIA = re.compile(r'media/[A-Za-z0-9._-]+\.(?:png|jpg|jpeg|webp|svg|ico|onnx)')   # .onnx: il modello di «✨ Migliora con l'AI» (C119)


def errore(testo):
    print('ERRORE sito: ' + testo, file=sys.stderr)
    sys.exit(1)


ROMA = ZoneInfo('Europe/Rome')


def ore_vere(data_js):
    """Ora italiana vera di ogni versione (Mario 08/11 «risolvilo dalla base»): mai scritta a mano.
    Versione online = adesso (la pubblicazione); le altre = il primo commit che ha messo `VERSIONE_APP = 'x'`.
    Serve la storia intera del git (sito.yml: fetch-depth 0); senza git restano `data`/`ora` delle voci."""
    versioni = re.findall(r"\{ v: '([\d.]+)'", data_js)
    attuale = re.search(r"const VERSIONE_APP = '([\d.]+)'", data_js)
    fmt = lambda d: d.astimezone(ROMA).strftime('%d/%m/%Y %H:%M')
    ore = {}
    if attuale:
        ore[attuale.group(1)] = fmt(datetime.datetime.now(datetime.timezone.utc))
    for v in versioni[:80]:
        if v in ore:
            continue
        try:
            out = subprocess.run(['git', 'log', '--reverse', '--format=%ct', '-S', f"VERSIONE_APP = '{v}'", '--', 'data.js'],
                                 cwd=RADICE, capture_output=True, text=True, timeout=60).stdout.split()
        except (OSError, subprocess.SubprocessError):
            break
        if out:
            ore[v] = fmt(datetime.datetime.fromtimestamp(int(out[0]), datetime.timezone.utc))
    return ore


def svuota_uscita():
    """Toglie il vecchio `sito/` (solo quella cartella, solo file e cartelle vere, niente collegamenti)."""
    if not USCITA.exists():
        return
    if USCITA.is_symlink() or USCITA.resolve().parent != RADICE:
        errore('la cartella sito/ non è quella attesa: non la tocco')
    for p in sorted(USCITA.rglob('*'), key=lambda x: len(x.parts), reverse=True):
        if p.is_symlink() or p.is_file():
            p.unlink()
        else:
            p.rmdir()
    USCITA.rmdir()


def main():
    testi = {}
    for nome in FILE_APP:
        f = RADICE / nome
        if not f.is_file():
            errore(f'manca {nome}')
        testi[nome] = f.read_text(encoding='utf-8')

    # Il sito vero deve parlare coi dati veri: la configurazione di Firebase deve esserci.
    if not re.search(r"const FIREBASE_CONFIG = \{[^}]*projectId: 'pronti-in-tavola'", testi['dati.js']):
        errore('in dati.js manca la configurazione vera di Firebase (projectId pronti-in-tavola)')
    if '?prova' in testi['index.html']:
        errore('index.html punta alla modalità di prova')

    # Le immagini: tutte quelle nominate dai file dell'app (pagina, stile, codice, guscio, manifest).
    media = sorted({m for t in testi.values() for m in MEDIA.findall(t)})
    mancanti = [m for m in media if not (RADICE / m).is_file()]
    if mancanti:
        errore('immagini nominate ma assenti: ' + ', '.join(mancanti))

    # Ogni file del guscio offline (sw.js) deve finire nel sito, sennò l'installazione fallisce.
    guscio = re.search(r'const GUSCIO = \[(.*?)\];', testi['sw.js'], re.S)
    if not guscio:
        errore('GUSCIO non trovato in sw.js')
    for voce in re.findall(r"'([^']+)'", guscio.group(1)):
        if voce != './' and voce not in FILE_APP and voce not in media:
            errore(f'sw.js mette nel guscio {voce}, che il sito non avrebbe')

    # ore vere delle versioni dentro data.js del sito (il file del repository resta com'è)
    vuota = 'const PUBBLICATE = {};'
    if vuota not in testi['data.js']:
        errore('in data.js manca «const PUBBLICATE = {};»')
    ore = ore_vere(testi['data.js'])
    testi['data.js'] = testi['data.js'].replace(vuota, 'const PUBBLICATE = ' + json.dumps(ore, ensure_ascii=False) + ';', 1)
    print(f'ore vere: {len(ore)} versioni')

    svuota_uscita()
    (USCITA / 'media').mkdir(parents=True)
    for nome in FILE_APP:
        (USCITA / nome).write_text(testi[nome], encoding='utf-8') if nome == 'data.js' else shutil.copyfile(RADICE / nome, USCITA / nome)
    for m in media:
        shutil.copyfile(RADICE / m, USCITA / m)

    peso = sum(p.stat().st_size for p in USCITA.rglob('*') if p.is_file())
    print(f'OK sito: {len(FILE_APP)} file dell\'app + {len(media)} immagini in sito/ ({peso // 1024} KB)')


if __name__ == '__main__':
    main()
