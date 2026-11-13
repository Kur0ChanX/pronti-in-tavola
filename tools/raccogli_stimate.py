#!/usr/bin/env python3
"""C141 pezzo 3 (Mario 11/11 sera: «apriamo le porte… 500… 50% dolci… il cetriolo non fa parte dei dolci… dello youtuber
qualche valore lo dice lui»). Raccoglie ricette proteiche da fonti FITNESS senza valori, li stima (tools/stima.py, tabella CREA)
e scrive ricette-stimate.js, un file del sito (zero letture di Cloudflare).
- Fonti: Cookpad Italia (ricerche proteiche; robots.txt permette), Blog di GialloZafferano (dalle ricerche di GZ),
  feed ufficiale YouTube di Massimo Pietrobon Gobbi (ultimi 15 video; i suoi valori, se li scrive, vincono sulla stima).
- Della fonte si tengono nome, foto, porzioni, l'elenco ingredienti e i passi COSÌ COME SONO (PT E25); C146: senza passi né video fuori.
- Entra solo chi passa la regola «🏋️ Proteiche» (soglie di base di fitRic in ricettario.js, copiate qui sotto) sui valori stimati.
- Metà dolci (dolce_o_salato: nessun ingrediente salato, almeno uno dolce), metà il resto.
Uso: python3 -I tools/raccogli_stimate.py [quante=500]   (pagine in .cache-stime/; rilanciarlo non rilegge i siti)
     python3 -I tools/raccogli_stimate.py --passi   (C146: solo i passi delle ricette già nel file)
     python3 -I tools/raccogli_stimate.py --pulisci (12/11: toglie la pubblicità dai passi già nel file, senza rete)
     python3 -I tools/raccogli_stimate.py --creatori (C148: AGGIUNGE le ricette di Fit with Fun, Iamfitandsweet, Giuseppe Healthy) """
import hashlib, html, json, os, re, subprocess, sys, time
from urllib.parse import quote, urlencode

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stima import stima_ricetta, dolce_o_salato, porzioni, norm

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(RADICE, '.cache-stime')
QUANTE = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 5000   # C141: «aggiungile tutte quante»
UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36'
os.makedirs(CACHE, exist_ok=True)
lette = 0


def pagina(url):
    global lette
    f = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + '.html')
    if os.path.exists(f):
        return open(f, encoding='utf-8', errors='replace').read()
    time.sleep(1.0)
    lette += 1
    try:
        t = subprocess.run(['curl', '-sL', '-m', '25', '-A', UA, '-H', 'accept-language: it-IT,it', url], capture_output=True, timeout=35).stdout.decode('utf-8', 'replace')
    except Exception:
        return ''
    if len(t) > 2000:
        open(f, 'w', encoding='utf-8').write(t)
    return t


def ld_ricetta(t):
    for m in re.finditer(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', t, re.S):
        try:
            d = json.loads(m.group(1))
        except Exception:
            continue
        for x in (d if isinstance(d, list) else d.get('@graph', [d])):
            if isinstance(x, dict) and 'Recipe' in str(x.get('@type')):
                return x
    return None


def foto(r):
    i = r.get('image')
    if isinstance(i, list):
        i = i[0] if i else ''
    if isinstance(i, dict):
        i = i.get('url', '')
    return str(i or '')


def passi_ld(r):
    """C146 (Mario 11/11 22:50 «senza video ne passaggi non hanno senso»): i passi COME LI SCRIVE L'AUTORE (PT E25), con le foto dei
    passi se ci sono. Un passo con solo la foto (testo «-») la dà al passo prima. Esce [{'t': testo, 'foto': [url]}]."""
    def testo(s):
        s = re.sub(r'<[^>]+>', ' ', html.unescape(str(s or ''))).replace('​', '')
        s = re.sub(r'([a-zà-ù][.!?])([A-ZÀ-Ü])', r'\1 \2', s)   # «liscia.Riponi» → «liscia. Riponi» (anche per la voce)
        return re.sub(r'\s+', ' ', s).strip()

    def imm(i):
        i = i if isinstance(i, list) else [i]
        return [u for u in (x.get('url', '') if isinstance(x, dict) else str(x or '') for x in i) if u.startswith('https://')]

    def piatti(x):
        if isinstance(x, list):
            for y in x:
                yield from piatti(y)
        elif isinstance(x, dict):
            if x.get('itemListElement'):   # HowToSection
                yield from piatti(x['itemListElement'])
            else:
                yield testo(x.get('text') or x.get('name')), imm(x.get('image'))
        elif x:
            for riga in re.split(r'\n+', str(x)):
                yield testo(riga), []

    out, attesa = [], []
    for t, f in piatti(r.get('recipeInstructions')):
        if len(re.sub(r'[\W_]', '', t)) < 2:   # solo la foto
            if out:
                out[-1]['foto'] += f
            else:
                attesa += f
            continue
        out.append({'t': t, 'foto': attesa + f})
        attesa = []
    for p in out:
        p['foto'] = list(dict.fromkeys(p['foto']))[:3]
    return senza_pubblicita(out)


PUBBLICITA = re.compile(r'https?://|www\.|facebook|instagram|tiktok|telegram|iscriv|seguimi|seguitemi|mi trovate|vi aspetto|vi lascio il link|codice sconto', re.I)


def senza_pubblicita(passi):
    """Mario 12/11 18:13 «falle accuratamente una per una»: dai passi tolgo le frasi di pubblicità (link, social, «vi aspetto»),
    mai la ricetta (PT E30). Un passo che era quasi tutto pubblicità (resta meno del 40 % o meno di 25 lettere) sparisce e le sue foto
    vanno al passo prima."""
    out = []
    for p in passi:
        if not PUBBLICITA.search(p['t']):
            out.append(p)
            continue
        frasi = re.split(r'(?<=[.!?…])\s+', p['t'])
        resto = ' '.join(f for f in frasi if not PUBBLICITA.search(f)).strip()
        if len(resto) >= 25 and len(resto) >= 0.4 * len(p['t']):
            out.append({'t': resto, 'foto': p['foto']})
        elif out:
            out[-1]['foto'] = list(dict.fromkeys(out[-1]['foto'] + p['foto']))[:3]
    return out


def con_passi(x):
    """C146: entra solo chi ha i passi nell'app o il video (YouTube)."""
    return x['id'].startswith('yt:') or any(len(p['t']) >= 10 for p in x.get('passi') or [])


def minuti(iso):
    m = re.match(r'P(?:T)?(?:(\d+)H)?(?:(\d+)M)?', str(iso or ''))
    return (int(m.group(1) or 0) * 60 + int(m.group(2) or 0)) if m else 0


# la regola d'entrata dell'app (fitRic di ricettario.js, C141 «fai passare tutte le ricette proteiche»): almeno il 20% delle calorie dalle
# proteine (regola UE «ricco di proteine») e almeno 8 g a porzione; il resto lo dice la pagella nell'app. Se cambia là, cambiala qui.
def fit(n):
    if not n or n['kcal'] <= 0 or n['prot'] < 8 or n['prot'] * 400 / n['kcal'] < 20:
        return False
    return 'pasto' if n['prot'] >= 25 or n['kcal'] > 300 else 'snack'


ATTREZZI = r'\b(ciotol|forchett|padella|coperchi|frusta|frullator|mixer|stamp[oi]|teglia|pirofil|carta forno|carta da forno|pellicola|spatol|cucchiaio di legno|bilancia|tazza da)\w*'

PAROLE_CP = ['dolci proteici', 'torta proteica', 'pancake proteici', 'muffin proteici', 'cheesecake proteica', 'budino proteico', 'mug cake proteica',
             'biscotti proteici', 'brownies proteici', 'crema proteica', 'gelato proteico', 'tiramisù proteico', 'barrette proteiche', 'porridge proteico',
             'overnight oats', 'dolci yogurt greco', 'dolci con albumi', 'skyr', 'dolci fit', 'colazione proteica', 'merenda proteica', 'snack proteici',
             'plumcake proteico', 'crepes proteiche', 'waffle proteici', 'pancake albumi', 'whey', 'proteine in polvere', 'frittata dolce', 'banana bread proteico',
             'ciambella proteica', 'philadelphia protein', 'quark', 'fiocchi di latte',
             'ricette proteiche', 'pollo proteico', 'pasta proteica', 'insalata proteica', 'piadina proteica', 'pizza proteica', 'secondi proteici',
             'frittata di albumi', 'burger proteico', 'polpette di tonno', 'wrap proteico', 'bowl proteica', 'post allenamento', 'pranzo proteico', 'cena proteica']
PAROLE_GZ = ['dolci proteici', 'pancake proteici', 'torta proteica', 'muffin proteici', 'cheesecake proteica', 'budino proteico', 'biscotti proteici',
             'brownies proteici', 'porridge proteico', 'dolci con albumi', 'dolci yogurt greco', 'proteine in polvere', 'crema proteica', 'mug cake',
             'ricette proteiche', 'secondi proteici', 'pollo light', 'frittata albumi', 'colazione proteica', 'snack proteici']


def candidati():
    c = []
    for p in PAROLE_CP:
        for k in range(1, 4):
            t = pagina(f'https://cookpad.com/it/cerca/{quote(p)}' + (f'?page={k}' if k > 1 else ''))
            ids = list(dict.fromkeys(re.findall(r'href="/it/ricette/(\d+)', t)))
            c += [('cp', f'https://cookpad.com/it/ricette/{i}') for i in ids]
            if len(ids) < 10:
                break
    for p in PAROLE_GZ:
        t = pagina('https://www.giallozafferano.it/ricerca-ricette/' + quote(p).replace('%20', '+') + '/')
        c += [('bg', u) for u in dict.fromkeys(re.findall(r'https://blog\.giallozafferano\.it/[\w-]+/[\w-]+/', t))]
    return list(dict.fromkeys(c))


def da_ricetta(chi, url):
    r = ld_ricetta(pagina(url))
    if not r or not r.get('recipeIngredient') or not r.get('name'):
        return None
    ing = [re.sub(r'\s+', ' ', html.unescape(str(i))).replace('​', '').strip() for i in r['recipeIngredient']]
    ing = [i for i in ing if i and not re.search(ATTREZZI, norm(i)) and not re.match(r'(?i)si conserva|per (la|il) ', i)]
    p = porzioni(r.get('recipeYield'))
    if not p:
        return None   # senza porzioni la stima per porzione non ha senso
    if chi == 'cp':
        rid = 'cp:' + url.rstrip('/').split('/')[-1]
    else:
        rid = 'bg:' + '/'.join(url.rstrip('/').split('/')[-2:])
    nome = re.sub(r'\s+', ' ', re.sub(r'[\U0001F300-\U0001FAFF☀-➿]', '', html.unescape(r['name']))).strip(' -·:')
    return {'id': rid, 'nome': nome, 'foto': foto(r), 'url': url, 'porzioni': p, 'ingredienti': ing,
            'totale': minuti(r.get('totalTime')) or minuti(r.get('cookTime')) + minuti(r.get('prepTime')), 'passi': passi_ld(r)}


def video_pietrobon():
    """Tutti i video (~880) con la chiave YouTube Data API (variabile d'ambiente YOUTUBE_API_KEY, 1 unità ogni 50 video);
    senza chiave solo gli ultimi 15 dal feed. Cache in .cache-stime/yt.json. La chiave non si stampa mai."""
    f = os.path.join(CACHE, 'yt.json')
    if os.path.exists(f):
        return json.load(open(f, encoding='utf-8'))
    chiave, out, tok = os.environ.get('YOUTUBE_API_KEY', '').strip(), [], ''
    while chiave:
        q = {'part': 'snippet', 'playlistId': 'UUkQmObN7tBXzPQTQhlT704Q', 'maxResults': 50, 'key': chiave}
        if tok:
            q['pageToken'] = tok
        try:
            d = json.loads(subprocess.run(['curl', '-sS', '-m', '25', 'https://www.googleapis.com/youtube/v3/playlistItems?' + urlencode(q)],
                                          capture_output=True, timeout=35).stdout or b'{}')
        except Exception:
            d = {}
        for i in d.get('items', []):
            sn = i['snippet']
            out.append({'id': sn['resourceId']['videoId'], 'titolo': sn['title'], 'testo': sn.get('description', ''),
                        'img': ((sn.get('thumbnails') or {}).get('high') or {}).get('url', '')})
        tok = d.get('nextPageToken')
        if not tok:
            break
    if out:
        json.dump(out, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
        return out
    t = pagina('https://www.youtube.com/feeds/videos.xml?channel_id=UCkQmObN7tBXzPQTQhlT704Q')
    for e in re.findall(r'<entry>(.*?)</entry>', t, re.S):
        vid = re.search(r'<yt:videoId>(.*?)</yt:videoId>', e)
        tit = re.search(r'<title>(.*?)</title>', e)
        d = re.search(r'<media:description>(.*?)</media:description>', e, re.S)
        img = re.search(r'<media:thumbnail url="([^"]+)"', e)
        if vid and tit and d:
            out.append({'id': vid.group(1), 'titolo': html.unescape(tit.group(1)), 'testo': html.unescape(d.group(1)), 'img': img.group(1) if img else ''})
    return out


def pietrobon():
    out = []
    for v in video_pietrobon():
        testo = v['testo']
        ing = [l.strip(' -•').strip() for l in testo.split('\n') if re.match(r'\s*[-•]\s*\S', l) and not re.search(r'(?i)codice|kcal|@|#', l)]
        if re.fullmatch(r'\s*\d{1,2}\s+\w+\s+\d{4}\s*', v['titolo']):
            continue   # titolo = una data, non il nome di una ricetta
        if len(ing) < 2 or re.search(r'(?i)melatonin|omega ?3|creatina|\beaa\b|beta ?alanin|\bvit\.? ?[cd]\b|\bzm[ab]', ' '.join(ing)):
            continue   # niente ricetta, o è la lista degli integratori
        x = {'id': 'yt:' + v['id'], 'nome': v['titolo'].strip(), 'foto': v['img'],
             'url': 'https://www.youtube.com/watch?v=' + v['id'], 'porzioni': 1, 'ingredienti': ing, 'totale': 0, 'autore': 'Massimo Pietrobon Gobbi'}
        tot = re.search(r'(?i)kcal totali\s*:?\s*(\d+)\s*/\s*([\d.,]+)\s*g?\s*carbo\w*\s*/\s*([\d.,]+)\s*g?\s*prot\w*\s*/\s*([\d.,]+)\s*g?\s*grass', testo)
        due = re.search(r'(?i)(due|2) (pasti|porzioni|persone)|per met', testo)
        x['porzioni'] = 2 if due else 1
        if tot:
            f = lambda s: float(s.replace(',', '.'))
            x['suoi'] = {'kcal': f(tot.group(1)), 'carb': f(tot.group(2)), 'prot': f(tot.group(3)), 'grassi': f(tot.group(4))}
        out.append(x)
    return out


def main():
    gia = set()
    for f in ('ricette-fit.js', 'ricette.js'):
        p = os.path.join(RADICE, f)
        if os.path.exists(p):
            gia |= {norm(n) for n in re.findall(r'"nome":"([^"]+)"', open(p, encoding='utf-8').read())}
    cand = candidati()
    print(f'candidati: {len(cand)}', file=sys.stderr)
    ricette = pietrobon()
    for i, (chi, url) in enumerate(cand):
        if i % 100 == 0:
            print(f'… {i}/{len(cand)} lette {lette}', file=sys.stderr)
        try:
            x = da_ricetta(chi, url)
        except Exception:
            x = None
        if x:
            ricette.append(x)
    buone, nomi, scarti = [], set(), {'stima': 0, 'regola': 0, 'doppione': 0, 'senza passi': 0}
    for x in ricette:
        if not con_passi(x):
            scarti['senza passi'] += 1; continue
        x['nome'] = re.sub(r'\s*#\w+', '', x['nome']).strip() or re.sub(r'#', '', x['nome']).strip().capitalize()   # «#spumone» → «Spumone»
        if x['nome'].isupper():
            x['nome'] = x['nome'].capitalize()   # «TORTA PROTEICA» → «Torta proteica»
        k = norm(x['nome'])
        if k in nomi or k in gia:
            scarti['doppione'] += 1; continue
        v, _, q = stima_ricetta(x['ingredienti'], x['porzioni'])
        if not v:
            scarti['stima'] += 1; continue
        if x.get('suoi'):   # Pietrobon: i suoi valori (ricetta intera) vincono; zuccheri, saturi e sale dalla stima
            suoi = {k2: round(val / x['porzioni'], 1) for k2, val in x.pop('suoi').items()}
            r = suoi['grassi'] / v['grassi'] if v['grassi'] else 1   # saturi in proporzione ai SUOI grassi (sennò i nostri, più alti, la scartano)
            v['saturi'] = round(min(suoi['grassi'], v['saturi'] * r), 1)
            v.update(suoi)
        v['zuc'] = round(min(v['zuc'], v['carb']), 1); v['saturi'] = round(min(v['saturi'], v['grassi']), 1)   # zuccheri dentro i carboidrati, saturi dentro i grassi
        if abs(4 * v['prot'] + 4 * v['carb'] + 9 * v['grassi'] - v['kcal']) > 0.35 * v['kcal'] + 20:
            scarti['stima'] += 1; continue   # calorie che non tornano coi macronutrienti: stima sbagliata, meglio una in meno
        if not (40 <= v['kcal'] <= 900) or not fit(v):
            scarti['regola'] += 1; continue
        nomi.add(k)
        tipo, _ = dolce_o_salato(x['nome'], x['ingredienti'])
        x.update(nutr=v, dolce=tipo == 'dolce', stimata=True)
        buone.append(x)
    perProt = lambda a: -a['nutr']['prot'] / a['nutr']['kcal']
    dolci = sorted([x for x in buone if x['dolce']], key=perProt)
    altre = sorted([x for x in buone if not x['dolce']], key=perProt)
    meta = QUANTE // 2
    scelte = dolci[:max(meta, QUANTE - len(altre))] + altre[:max(QUANTE - meta, QUANTE - len(dolci))]
    scelte = scelte[:QUANTE]
    scrivi(scelte)
    fonti = {p: sum(x['id'].startswith(p) for x in scelte) for p in ('cp:', 'bg:', 'yt:')}
    print(json.dumps({'scritte': len(scelte), 'dolci': sum(x['dolce'] for x in scelte), 'candidati': len(cand), 'lette': lette,
                      'stimabili': len(buone), 'scarti': scarti, 'fonti': fonti, 'dolciDisponibili': len(dolci), 'altreDisponibili': len(altre)}, ensure_ascii=False))


def scrivi(scelte):
    oggi = time.strftime('%d/%m/%Y')
    righe = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in scelte)
    open(os.path.join(RADICE, 'ricette-stimate.js'), 'w', encoding='utf-8').write(
        f"""/* C141 · Ricette proteiche con VALORI STIMATI (non verificati), raccolte da Claude il {oggi} (Mario 11/11 sera «apriamo le porte…
   valori non verificati… 500… 50% dolci»). Scritto da tools/raccogli_stimate.py, NON a mano.
   Nome, foto, porzioni, ingredienti e passi come sulla fonte (Cookpad, Blog di GialloZafferano, YouTube di Massimo Pietrobon Gobbi: il video).
   C146: solo ricette coi passi o col video.
   Valori per porzione stimati dagli ingredienti con la tabella CREA (www.alimentinutrizione.it) e etichette di prodotti proteici: errore
   mediano misurato 8-9 % (tools/valida_stima.py). Ognuna passa la regola «🏋️ Proteiche» sui valori stimati. */
const RICETTE_STIMATE = [
{righe}
];
""")


def solo_passi():
    """C146: aggiunge i passi alle ricette GIÀ nel file (rilegge solo le loro pagine) e toglie quelle senza passi né video.
    Le altre righe restano uguali (valori, ordine): niente sorprese nelle Proteiche."""
    t = open(os.path.join(RADICE, 'ricette-stimate.js'), encoding='utf-8').read()
    vecchie = json.loads('[' + t.split('const RICETTE_STIMATE = [', 1)[1].rsplit('];', 1)[0] + ']')
    tenute, tolte = [], []
    for i, x in enumerate(vecchie):
        if i % 25 == 0:
            print(f'… {i}/{len(vecchie)} lette {lette}', file=sys.stderr)
        if not x['id'].startswith('yt:'):
            r = ld_ricetta(pagina(x['url']))
            x['passi'] = passi_ld(r) if r else []
        (tenute if con_passi(x) else tolte).append(x)
    scrivi(tenute)
    print(json.dumps({'prima': len(vecchie), 'scritte': len(tenute), 'dolci': sum(x['dolce'] for x in tenute), 'lette': lette,
                      'conFotoPassi': sum(any(p['foto'] for p in x.get('passi') or []) for x in tenute),
                      'tolte': [x['id'] + ' ' + x['nome'] for x in tolte]}, ensure_ascii=False))


def pulisci():
    """--pulisci: toglie la pubblicità dai passi GIÀ nel file, senza rileggere i siti (resto uguale)."""
    t = open(os.path.join(RADICE, 'ricette-stimate.js'), encoding='utf-8').read()
    vecchie = json.loads('[' + t.split('const RICETTE_STIMATE = [', 1)[1].rsplit('];', 1)[0] + ']')
    cambiate = []
    for x in vecchie:
        if x.get('passi'):
            nuovi = senza_pubblicita(x['passi'])
            if nuovi != x['passi']:
                cambiate.append(x['id'])
                x['passi'] = nuovi
    righe = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in vecchie)   # testa del file (data della raccolta) uguale
    open(os.path.join(RADICE, 'ricette-stimate.js'), 'w', encoding='utf-8').write(t.split('const RICETTE_STIMATE = [', 1)[0] + 'const RICETTE_STIMATE = [\n' + righe + '\n];\n')
    print(json.dumps({'ricette': len(vecchie), 'cambiate': cambiate}, ensure_ascii=False))



# ---------- C148 (Mario 12/11 «tutti i creatori italiani»; 13/11 «li faccio cercare e caricare a te»): siti dei creatori fitness ----------
# --creatori: AGGIUNGE a ricette-stimate.js le ricette dei siti qui sotto (le vecchie restano uguali; la cache di Cookpad e GZ non serve).
# Regole dei siti controllate il 13/11 (robots.txt: pagine delle ricette permesse). Stessi filtri: passi o video, regola Proteiche, stima;
# i valori del creatore (se li scrive) vincono sulla stima. Campo «autore» = il nome del creatore (si cerca per creatore nell'app).
CREATORI = {'fw': 'Fit with Fun', 'fs': 'Iamfitandsweet', 'gh': 'Giuseppe Healthy'}
GH_API = 'https://www.giuseppehealthy.it/wp-content/themes/hello-elementor-child/api/async-ricetta.php'
GH_CATEGORIE = ('36', '21', '19', '49')   # aperitivo, cena, colazione, pranzo (data-current-category delle pagine /it/ricette/…/)
AFFILIATI = re.compile(r'\s*\((?:[^()]*\b(?:trovi|link|qui|amazon|sconto|codice|acquist)\b[^()]*)?\)', re.I)


def post_wp(url):
    """Elenco degli articoli di un sito WordPress dalla sua mappa (post-sitemap*.xml)."""
    out, k = [], 1
    while k < 20:
        t = pagina(url + ('post-sitemap.xml' if k == 1 else f'post-sitemap{k}.xml'))
        locs = re.findall(r'<loc>([^<]+)</loc>', t)
        if not locs:
            break
        out += [u for u in locs if not re.search(r'\.(jpe?g|png|webp)$', u)]
        k += 1
    return out


def gh_elenco():
    out = []
    for c in GH_CATEGORIE:
        off = 0
        while off < 3000:
            corpo = json.dumps({'offset': off, 'lang': 'Italian', 'current-category': c})
            f = os.path.join(CACHE, hashlib.sha1((GH_API + corpo).encode()).hexdigest() + '.html')
            if os.path.exists(f):
                t = open(f, encoding='utf-8', errors='replace').read()
            else:
                t = subprocess.run(['curl', '-s', '-m', '25', '-A', UA, '-X', 'POST', '-H', 'Content-Type: text/html', '--data', corpo, GH_API],
                                   capture_output=True, text=True).stdout
                open(f, 'w', encoding='utf-8').write(t)
                time.sleep(0.5)
            u = list(dict.fromkeys(re.findall(r'https://www\.giuseppehealthy\.it/it/ricetta/[\w-]+', t)))
            if not u:
                break
            out += u
            off += len(u)
    return list(dict.fromkeys(out))


def pulito(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).replace('​', '').strip()


def da_gh(url):
    """Giuseppe Healthy: pagina sua (niente ld+json). Nome, foto, ingredienti (le righe dell'elenco), passi (i paragrafi), porzioni, video."""
    t = pagina(url.rstrip('/') + '/')
    nome = re.search(r'<h1[^>]*>(.*?)</h1>', t, re.S)
    ing = re.search(r'article-ingredienti(.*?)</div>', t, re.S)
    prep = re.search(r'article-preparazione(.*?)</div>', t, re.S)
    if not (nome and ing and prep):
        return None
    righe = [pulito(x) for x in re.findall(r'<li[^>]*>(.*?)</li>', ing.group(1), re.S)]
    righe = [AFFILIATI.sub('', r).strip() for r in righe if r and not re.search(ATTREZZI, norm(r))]
    passi = [{'t': pulito(x), 'foto': []} for x in re.findall(r'<p[^>]*>(.*?)</p>', prep.group(1), re.S)]
    passi = senza_pubblicita([x for x in passi if len(x['t']) >= 10])
    pers = re.search(r'Persone:\s*<strong>\s*(\d+)', t) or re.search(r'(?i)per (\d+) (?:porzion|person|pezz|pancake|muffin|biscott|fett)', pulito(ing.group(1)))
    p = int(pers.group(1)) if pers else 0
    if not p or not righe:
        return None
    img = re.search(r'jumbotron-ricetta.*?<img src="([^"]+)"', t, re.S)
    vid = re.search(r'youtube\.com/embed/([\w-]{6,})', t)
    tm = sum(int(x) for x in re.findall(r'(?:Preparazione|cottura):\s*<strong>\s*(\d+)\s*min', t))
    nm = pulito(nome.group(1))
    if nm.isupper():
        nm = nm.capitalize()
    x = {'id': 'gh:' + url.rstrip('/').split('/')[-1], 'nome': nm, 'foto': img.group(1) if img else '', 'url': url.rstrip('/') + '/',
         'porzioni': p, 'ingredienti': righe, 'totale': tm, 'passi': passi, 'autore': CREATORI['gh']}
    if vid:
        x['video'] = 'https://www.youtube.com/watch?v=' + vid.group(1)
    return x


def num(v):
    m = re.search(r'[\d]+(?:[.,]\d+)?', str(v or ''))
    return float(m.group(0).replace(',', '.')) if m else None


def da_ld_creatore(chi, url):
    t = pagina(url)
    r = ld_ricetta(t)
    if not r or not r.get('recipeIngredient') or not r.get('name'):
        return None
    ing = [AFFILIATI.sub('', re.sub(r'\s+', ' ', html.unescape(str(i))).replace('​', '')).strip() for i in r['recipeIngredient']]
    ing = [i for i in ing if i and not re.search(ATTREZZI, norm(i)) and not re.match(r'(?i)si conserva|per (la|il) ', i)]
    p = porzioni(r.get('recipeYield'))
    if not p:
        return None
    nm = re.sub(r'\s+', ' ', re.sub(r'[\U0001F300-\U0001FAFF☀-➿]', '', html.unescape(r['name']))).strip(' -·:')
    x = {'id': chi + ':' + url.rstrip('/').split('/')[-1], 'nome': nm.capitalize() if nm.isupper() else nm, 'foto': foto(r), 'url': url,
         'porzioni': p, 'ingredienti': ing, 'totale': minuti(r.get('totalTime')) or minuti(r.get('cookTime')) + minuti(r.get('prepTime')),
         'passi': passi_ld(r), 'autore': CREATORI[chi]}
    n = r.get('nutrition') or {}
    suoi = {'kcal': num(n.get('calories')), 'prot': num(n.get('proteinContent')), 'carb': num(n.get('carbohydrateContent')), 'grassi': num(n.get('fatContent')),
            'saturi': num(n.get('saturatedFatContent')), 'zuc': num(n.get('sugarContent')), 'sodio': num(n.get('sodiumContent'))}
    if suoi['kcal'] and suoi['prot'] is not None:   # i SUOI valori per porzione (WP Recipe Maker): vincono sulla stima
        x['suoiPorz'] = {k: v for k, v in suoi.items() if v is not None}
    return x


def creatori():
    t = open(os.path.join(RADICE, 'ricette-stimate.js'), encoding='utf-8').read()
    testa, corpo = t.split('const RICETTE_STIMATE = [', 1)
    vecchie = json.loads('[' + corpo.rsplit('];', 1)[0] + ']')
    gia = {norm(x['nome']) for x in vecchie} | {x['id'] for x in vecchie}
    for f in ('ricette-fit.js', 'ricette.js'):
        pf = os.path.join(RADICE, f)
        if os.path.exists(pf):
            gia |= {norm(n) for n in re.findall(r'"nome":"([^"]+)"', open(pf, encoding='utf-8').read())}
    cand = [('fw', u) for u in post_wp('https://fitwithfun.it/')] + [('fs', u) for u in post_wp('https://iamfitandsweet.com/')] + [('gh', u) for u in gh_elenco()]
    print(f'candidati: {len(cand)}', file=sys.stderr)
    nuove, scarti, per = [], {'lettura': 0, 'senza passi': 0, 'doppione': 0, 'stima': 0, 'regola': 0}, {k: 0 for k in CREATORI}
    for i, (chi, url) in enumerate(cand):
        if i % 100 == 0:
            print(f'… {i}/{len(cand)} lette {lette}', file=sys.stderr)
        try:
            x = da_gh(url) if chi == 'gh' else da_ld_creatore(chi, url)
        except Exception:
            x = None
        if not x:
            scarti['lettura'] += 1; continue
        if not (any(len(p['t']) >= 10 for p in x.get('passi') or []) or x.get('video')):
            scarti['senza passi'] += 1; continue
        k = norm(x['nome'])
        if k in gia or x['id'] in gia:
            scarti['doppione'] += 1; continue
        v, _, q = stima_ricetta(x['ingredienti'], x['porzioni'])
        suoi = x.pop('suoiPorz', None)
        if suoi:
            v = dict(v or {}); v.update(suoi)
            for k2 in ('saturi', 'zuc', 'sodio', 'carb', 'grassi'):
                if k2 not in v:
                    v = None; break
            if v:
                x['valoriSuoi'] = True
        if not v:
            scarti['stima'] += 1; continue
        v['zuc'] = round(min(v['zuc'], v['carb']), 1); v['saturi'] = round(min(v['saturi'], v['grassi']), 1)
        if abs(4 * v['prot'] + 4 * v['carb'] + 9 * v['grassi'] - v['kcal']) > 0.35 * v['kcal'] + 20:
            scarti['stima'] += 1; continue
        if not (40 <= v['kcal'] <= 900) or not fit(v):
            scarti['regola'] += 1; continue
        gia.add(k); gia.add(x['id'])
        tipo, _ = dolce_o_salato(x['nome'], x['ingredienti'])
        x.update(nutr={a: round(b, 1) for a, b in v.items()}, dolce=tipo == 'dolce', stimata=not x.get('valoriSuoi'))
        nuove.append(x); per[x['id'].split(':')[0]] += 1
    righe = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in vecchie + nuove)
    open(os.path.join(RADICE, 'ricette-stimate.js'), 'w', encoding='utf-8').write(testa + 'const RICETTE_STIMATE = [\n' + righe + '\n];\n')
    print(json.dumps({'prima': len(vecchie), 'aggiunte': len(nuove), 'per': per, 'candidati': len(cand), 'lette': lette, 'scarti': scarti}, ensure_ascii=False))

if __name__ == '__main__':
    creatori() if '--creatori' in sys.argv else pulisci() if '--pulisci' in sys.argv else solo_passi() if '--passi' in sys.argv else main()
