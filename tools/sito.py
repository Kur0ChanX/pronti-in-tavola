#!/usr/bin/env python3
"""Pronti in Tavola · costruisce il sito vero in `sito/` (lo usa Cloudflare Pages come comando di build).

Copia SOLO i file dell'app e le immagini che l'app usa davvero: niente docs/, archivio/, tools/,
.claude/ né foto vecchie (il repository contiene note e foto che non devono finire online).
A differenza di tools/anteprima.py lascia la configurazione vera di Firebase in dati.js.

Uso: python3 -I tools/sito.py   (esce con errore e non crea niente di mezzo se qualcosa manca)
"""
import pathlib
import re
import shutil
import sys

RADICE = pathlib.Path(__file__).resolve().parent.parent
USCITA = RADICE / 'sito'
FILE_APP = ['index.html', 'style.css', 'data.js', 'dati.js', 'lucchetto.js', 'vapore.js', 'app.js',
            'spesa.js', 'aiutante.js', 'ricettario.js', 'ricette.js', 'sw.js', 'manifest.webmanifest']
MEDIA = re.compile(r'media/[A-Za-z0-9._-]+\.(?:png|jpg|jpeg|webp|svg|ico)')


def errore(testo):
    print('ERRORE sito: ' + testo, file=sys.stderr)
    sys.exit(1)


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

    svuota_uscita()
    (USCITA / 'media').mkdir(parents=True)
    for nome in FILE_APP:
        shutil.copyfile(RADICE / nome, USCITA / nome)
    for m in media:
        shutil.copyfile(RADICE / m, USCITA / m)

    peso = sum(p.stat().st_size for p in USCITA.rglob('*') if p.is_file())
    print(f'OK sito: {len(FILE_APP)} file dell\'app + {len(media)} immagini in sito/ ({peso // 1024} KB)')


if __name__ == '__main__':
    main()
