"""Crea dist/anteprima.html: tutta l'app in un solo file (stile, codice e immagini dentro).
Serve per la pagina di prova da aprire sul telefono. Uso: python3 -I tools/anteprima.py"""
import base64
import pathlib
import re

QUI = pathlib.Path(__file__).resolve().parent.parent
TIPI = {'.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg'}


def dato(percorso):
    p = QUI / percorso
    return f"data:{TIPI[p.suffix]};base64," + base64.b64encode(p.read_bytes()).decode()


html = (QUI / 'index.html').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + (QUI / 'style.css').read_text(encoding='utf-8') + '\n</style>')
for nome in ('data.js', 'dati.js', 'opzioni.js', 'lucchetto.js', 'vapore.js', 'guida-iphone.js', 'app.js', 'spesa.js', 'aiutante.js', 'voce-clienti.js', 'voce-piper.js', 'voce-kokoro.js', 'ricette.js', 'ricettario.js'):
    if nome == 'ricette.js':  # online si scarica solo per chi gestisce; nell'anteprima di prova va dentro, prima di ricettario.js
        html = html.replace('<script src="ricettario.js"></script>', '<script src="ricette.js"></script>\n<script src="ricettario.js"></script>')
    codice = (QUI / nome).read_text(encoding='utf-8')
    if nome == 'data.js':  # ore vere delle versioni dal git, come sul sito (tools/sito.py, Mario 08/11 «risolvilo dalla base»)
        import importlib.util, json
        spec = importlib.util.spec_from_file_location('sito', QUI / 'tools' / 'sito.py'); sito = importlib.util.module_from_spec(spec); spec.loader.exec_module(sito)
        codice = codice.replace('const PUBBLICATE = {};', 'const PUBBLICATE = ' + json.dumps(sito.ore_vere(codice), ensure_ascii=False) + ';', 1)
    if nome == 'dati.js':  # l'anteprima di prova non si collega ai dati veri di Monica
        codice, n = re.subn(r'const FIREBASE_CONFIG = \{.*?\};', 'const FIREBASE_CONFIG = null;', codice, flags=re.S)
        assert n == 1, 'FIREBASE_CONFIG non trovata in dati.js'
    html = html.replace(f'<script src="{nome}"></script>', '<script>\n' + codice + '\n</script>')
for img in sorted(set(re.findall(r'(?<![/\w])media/[\w.-]+\.(?:png|webp|jpg)', html))):  # non gli indirizzi interi (og:image)
    html = html.replace(img, dato(img))
(QUI / 'dist').mkdir(exist_ok=True)
(QUI / 'dist' / 'anteprima.html').write_text(html, encoding='utf-8')
print('dist/anteprima.html', round(len(html) / 1024), 'KB')
