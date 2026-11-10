#!/usr/bin/env python3
"""Confronto PRIMA/DOPO da mandare a Mario: un'immagine sola dove il cambiamento salta all'occhio (E313).

Perché: due foto intere mandate una dopo l'altra, sul telefono di Mario, sembrano uguali quando il cambiamento
è un pezzetto dello schermo (C409: il tasto in fondo al foglio, ~6% della foto; Mario 09/11 19:11 «le foto porter
mi sembrano uguali … fai in modo che vedi il cambiamento più chiaro»).

Cosa fa, da solo:
1. trova DOVE le due foto sono diverse (pixel per pixel, senza il rumore dei bordi sfumati);
2. ritaglia quella zona con un po' di contorno e la ingrandisce;
3. mette PRIMA e DOPO uno accanto all'altro (o uno sopra l'altro se la zona è larga) con l'etichetta grande;
4. disegna un riquadro rosso sul cambiamento in tutte e due;
5. in alto la frase «cosa guardare» (--testo) e la schermata intera piccola col riquadro, per sapere dov'è.

Uso: python3 -I tools/confronta-foto.py <prima.png> <dopo.png> [uscita.png] [--testo "cosa guardare"] [--zona x,y,l,a]
  uscita di base: accanto a <dopo>, «<nome di dopo>-confronto.png»
  --zona: ritaglio scelto a mano (pixel della foto), per cambiamenti sparsi o per stringere lo zoom.
Stampa il percorso e quanta parte della foto è cambiata. Esce 1 se le foto sono uguali: non si manda niente
(foto sbagliata o cambiamento non arrivato nel codice: si cerca il perché). Esce 2 per un errore d'uso.
"""
import sys
from collections import deque
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageDraw, ImageFont
except ImportError:
    sys.exit('Serve Pillow per i confronti: pip install pillow')

SOGLIA = 40          # differenza minima di un pixel (0-255) per contare come cambiato: sotto è rumore dei bordi
MIN_PIXEL = 30       # meno pixel cambiati di così = foto uguali
CELLA = 16           # griglia per trovare le zone cambiate (px)
LARGHEZZA = 1600     # larghezza dell'immagine finale (alta risoluzione, leggibile sul telefono)
TUTTA = 0.6          # zona cambiata oltre il 60% della foto: niente zoom, foto intere
ROSSO = (220, 38, 38)
VERDE_DOPO = (46, 125, 50)
GRIGIO_PRIMA = (110, 110, 110)
CARATTERE = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def carattere(dim):
    try:
        return ImageFont.truetype(CARATTERE, dim)
    except OSError:
        return ImageFont.load_default(size=dim)


def stessa_misura(a, b):
    """Foto di misure diverse: tutte e due su una tela grande uguale (in alto a sinistra), il resto grigio."""
    if a.size == b.size:
        return a, b
    w, h = max(a.width, b.width), max(a.height, b.height)
    tele = []
    for im in (a, b):
        t = Image.new('RGB', (w, h), (200, 200, 200))
        t.paste(im, (0, 0))
        tele.append(t)
    return tele[0], tele[1]


def zone_cambiate(a, b):
    """Maschera dei pixel cambiati → riquadri delle zone (celle vicine unite). Ritorna (riquadri, pixel cambiati)."""
    diff = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > SOGLIA else 0)
    cambiati = diff.histogram()[255]
    if cambiati < MIN_PIXEL:
        return [], cambiati
    gw, gh = (a.width + CELLA - 1) // CELLA, (a.height + CELLA - 1) // CELLA
    piccola = diff.resize((gw, gh), Image.Resampling.BOX)   # media della cella: >0 = qualcosa è cambiato
    px = piccola.load()
    accese = {(x, y) for y in range(gh) for x in range(gw) if px[x, y] > 2}
    riquadri, visti = [], set()
    for inizio in accese:
        if inizio in visti:
            continue
        coda, x0, y0, x1, y1 = deque([inizio]), inizio[0], inizio[1], inizio[0], inizio[1]
        visti.add(inizio)
        while coda:
            x, y = coda.popleft()
            x0, y0, x1, y1 = min(x0, x), min(y0, y), max(x1, x), max(y1, y)
            for dx in range(-3, 4):          # celle vicine fino a 3 di distanza = stessa zona
                for dy in range(-3, 4):
                    v = (x + dx, y + dy)
                    if v in accese and v not in visti:
                        visti.add(v)
                        coda.append(v)
        riquadri.append((x0 * CELLA, y0 * CELLA, min((x1 + 1) * CELLA, a.width), min((y1 + 1) * CELLA, a.height)))
    riquadri.sort(key=lambda r: (r[2] - r[0]) * (r[3] - r[1]), reverse=True)
    return riquadri, cambiati


def unisci(riquadri):
    return (min(r[0] for r in riquadri), min(r[1] for r in riquadri),
            max(r[2] for r in riquadri), max(r[3] for r in riquadri))


def ritaglio(zona, w, h):
    """Zona + contorno: almeno 40% della larghezza e 30% dell'altezza della foto, centrato, dentro la foto."""
    x0, y0, x1, y1 = zona
    cw = max(x1 - x0 + 2 * max(60, (x1 - x0) // 3), int(w * 0.4))
    ch = max(y1 - y0 + 2 * max(60, (y1 - y0) // 3), int(h * 0.3))
    cw, ch = min(cw, w), min(ch, h)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    l = min(max(0, cx - cw // 2), w - cw)
    t = min(max(0, cy - ch // 2), h - ch)
    return l, t, l + cw, t + ch


def testo_a_capo(draw, testo, font, larghezza):
    righe, riga = [], ''
    for parola in testo.split():
        prova = (riga + ' ' + parola).strip()
        if draw.textlength(prova, font=font) <= larghezza or not riga:
            riga = prova
        else:
            righe.append(riga)
            riga = parola
    if riga:
        righe.append(riga)
    return righe


def pannello(im, scatola, zona, scala, etichetta, colore):
    """Ritaglio ingrandito con la fascia dell'etichetta sopra e il riquadro rosso sulla zona cambiata."""
    pezzo = im.crop(scatola)
    pezzo = pezzo.resize((round(pezzo.width * scala), round(pezzo.height * scala)), Image.Resampling.LANCZOS)
    fascia = max(56, round(pezzo.width * 0.05))
    out = Image.new('RGB', (pezzo.width, pezzo.height + fascia), colore)
    out.paste(pezzo, (0, fascia))
    d = ImageDraw.Draw(out)
    f = carattere(round(fascia * 0.62))
    d.text((pezzo.width // 2, fascia // 2), etichetta, font=f, fill='white', anchor='mm')
    if zona:
        spessore = max(5, round(out.width * 0.005))
        x0, y0 = (zona[0] - scatola[0]) * scala, (zona[1] - scatola[1]) * scala + fascia
        x1, y1 = (zona[2] - scatola[0]) * scala, (zona[3] - scatola[1]) * scala + fascia
        m = spessore * 2
        d.rectangle((max(0, x0 - m), max(fascia, y0 - m), min(out.width - 1, x1 + m), min(out.height - 1, y1 + m)),
                    outline=ROSSO, width=spessore)
    return out


def main(argv):
    testo, zona_mano, pos = '', None, []
    i = 0
    while i < len(argv):
        if argv[i] == '--testo' and i + 1 < len(argv):
            testo, i = argv[i + 1], i + 2
        elif argv[i] == '--zona' and i + 1 < len(argv):
            try:
                x, y, l, a = (int(v) for v in argv[i + 1].split(','))
            except ValueError:
                print('--zona vuole x,y,l,a in pixel (es. 0,1200,900,336)', file=sys.stderr)
                return 2
            zona_mano, i = (x, y, x + l, y + a), i + 2
        else:
            pos.append(argv[i])
            i += 1
    if len(pos) not in (2, 3):
        print(__doc__.split('Uso: ')[1].split('\n')[0], file=sys.stderr)
        return 2
    p_prima, p_dopo = Path(pos[0]), Path(pos[1])
    uscita = Path(pos[2]) if len(pos) == 3 else p_dopo.with_name(p_dopo.stem + '-confronto.png')
    a, b = stessa_misura(Image.open(p_prima).convert('RGB'), Image.open(p_dopo).convert('RGB'))
    w, h = a.size

    riquadri, cambiati = zone_cambiate(a, b)
    if not riquadri and not zona_mano:
        print(f'UGUALI: {p_prima.name} e {p_dopo.name} non hanno differenze visibili ({cambiati} pixel). '
              'Non mandarle: foto sbagliata o cambiamento non arrivato?')
        return 1
    zona = unisci(riquadri) if riquadri else None
    quota = cambiati / (w * h)
    if zona_mano:
        scatola = (max(0, zona_mano[0]), max(0, zona_mano[1]), min(w, zona_mano[2]), min(h, zona_mano[3]))
        if zona:   # riquadro rosso solo sulla parte cambiata che cade nel ritaglio
            zona = (max(zona[0], scatola[0]), max(zona[1], scatola[1]), min(zona[2], scatola[2]), min(zona[3], scatola[3]))
            if zona[0] >= zona[2] or zona[1] >= zona[3]:
                zona = None
    elif (zona[2] - zona[0]) * (zona[3] - zona[1]) > TUTTA * w * h:
        scatola = (0, 0, w, h)
    else:
        scatola = ritaglio(zona, w, h)

    cw, ch = scatola[2] - scatola[0], scatola[3] - scatola[1]
    affiancate = cw / ch <= 1.3            # zona alta o quadrata: una accanto all'altra; larga: una sopra l'altra
    spazio = 24
    scala = ((LARGHEZZA - spazio) / 2 if affiancate else LARGHEZZA) / cw
    p1 = pannello(a, scatola, zona, scala, 'PRIMA', GRIGIO_PRIMA)
    p2 = pannello(b, scatola, zona, scala, 'DOPO', VERDE_DOPO)

    # Testata: frase «cosa guardare» a sinistra, schermata intera piccola col riquadro a destra (se c'è zoom).
    zoom = scatola != (0, 0, w, h)
    mini = None
    if zoom:
        mw = round(LARGHEZZA * 0.24)
        mini = b.resize((mw, round(h * mw / w)), Image.Resampling.LANCZOS)
        dm = ImageDraw.Draw(mini)
        k = mw / w
        dm.rectangle((scatola[0] * k, scatola[1] * k, scatola[2] * k - 1, scatola[3] * k - 1), outline=ROSSO, width=4)
    f_testo = carattere(40)
    misura = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    spazio_testo = LARGHEZZA - 48 - (mini.width + 24 if mini else 0)
    righe = testo_a_capo(misura, testo or 'Guarda il riquadro rosso', f_testo, spazio_testo)
    alto_testo = 24 + len(righe) * 52 + 24
    alto_testata = max(alto_testo, (mini.height + 40) if mini else 0)

    corpo_w = LARGHEZZA
    corpo_h = max(p1.height, p2.height) if affiancate else p1.height + spazio + p2.height
    out = Image.new('RGB', (corpo_w, alto_testata + corpo_h + 24), (255, 255, 255))
    d = ImageDraw.Draw(out)
    for n, r in enumerate(righe):
        d.text((24, 24 + n * 52), r, font=f_testo, fill=(30, 30, 30))
    if mini:
        x = LARGHEZZA - mini.width - 24
        out.paste(mini, (x, 20))
        d.rectangle((x - 1, 19, x + mini.width, 20 + mini.height), outline=(160, 160, 160), width=1)
        d.text((x + mini.width // 2, 24 + mini.height), 'schermata intera', font=carattere(18),
               fill=(110, 110, 110), anchor='mt')
    if affiancate:
        out.paste(p1, (0, alto_testata))
        out.paste(p2, (p1.width + spazio, alto_testata))
    else:
        out.paste(p1, (0, alto_testata))
        out.paste(p2, (0, alto_testata + p1.height + spazio))
    if out.height > 2.2 * out.width:   # tetto dell'hook foto-check.py: si riduce in altezza tenendo le proporzioni
        f = 2.2 * out.width / out.height
        out = out.resize((round(out.width * f), round(out.height * f)), Image.Resampling.LANCZOS)
    uscita.parent.mkdir(parents=True, exist_ok=True)
    out.save(uscita, optimize=True)

    zone = len(riquadri)
    print(uscita)
    print(f'Cambiato: {quota * 100:.1f}% della foto · zone: {zone} · '
          f'ritaglio {cw}×{ch} da ({scatola[0]},{scatola[1]}) · ingrandito ×{scala:.2f} · '
          f'{"affiancate" if affiancate else "una sopra l altra"} · {out.width}×{out.height}')
    if zone > 1 and zona and not zona_mano and (zona[2] - zona[0]) * (zona[3] - zona[1]) > 0.3 * w * h:
        print('ATTENZIONE: cambiamenti in più punti lontani: valuta un confronto per zona con --zona '
              + ' · '.join(f'{r[0]},{r[1]},{r[2] - r[0]},{r[3] - r[1]}' for r in riquadri[:4]))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
