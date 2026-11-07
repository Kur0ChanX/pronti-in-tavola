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
for nome in ('data.js', 'dati.js', 'lucchetto.js', 'vapore.js', 'app.js', 'spesa.js'):
    codice = (QUI / nome).read_text(encoding='utf-8')
    if nome == 'dati.js':  # l'anteprima di prova non si collega ai dati veri di Monica
        codice, n = re.subn(r'const FIREBASE_CONFIG = \{.*?\};', 'const FIREBASE_CONFIG = null;', codice, flags=re.S)
        assert n == 1, 'FIREBASE_CONFIG non trovata in dati.js'
    html = html.replace(f'<script src="{nome}"></script>', '<script>\n' + codice + '\n</script>')
for img in sorted(set(re.findall(r'(?<![/\w])media/[\w.-]+\.(?:png|webp|jpg)', html))):  # non gli indirizzi interi (og:image)
    html = html.replace(img, dato(img))
(QUI / 'dist').mkdir(exist_ok=True)
(QUI / 'dist' / 'anteprima.html').write_text(html, encoding='utf-8')
print('dist/anteprima.html', round(len(html) / 1024), 'KB')
