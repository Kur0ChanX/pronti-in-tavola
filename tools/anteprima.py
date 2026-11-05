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
for nome in ('data.js', 'app.js'):
    html = html.replace(f'<script src="{nome}"></script>', '<script>\n' + (QUI / nome).read_text(encoding='utf-8') + '\n</script>')
for img in sorted(set(re.findall(r'media/[\w.-]+\.(?:png|webp|jpg)', html))):
    html = html.replace(img, dato(img))
(QUI / 'dist').mkdir(exist_ok=True)
(QUI / 'dist' / 'anteprima.html').write_text(html, encoding='utf-8')
print('dist/anteprima.html', round(len(html) / 1024), 'KB')
