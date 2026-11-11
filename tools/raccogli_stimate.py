#!/usr/bin/env python3
"""C141 pezzo 3 (Mario 11/11 sera: «apriamo le porte… 500… 50% dolci… il cetriolo non fa parte dei dolci… dello youtuber
qualche valore lo dice lui»). Raccoglie ricette proteiche da fonti FITNESS senza valori, li stima (tools/stima.py, tabella CREA)
e scrive tools/dati/ricette-stimate.js (pezzo 4: diventa un file del sito, zero letture di Cloudflare).
- Fonti: Cookpad Italia (ricerche proteiche; robots.txt permette), Blog di GialloZafferano (dalle ricerche di GZ),
  feed ufficiale YouTube di Massimo Pietrobon Gobbi (ultimi 15 video; i suoi valori, se li scrive, vincono sulla stima).
- Della fonte si tengono nome, foto, porzioni e l'elenco ingredienti COSÌ COM'È (PT E25); i passi si leggono sulla fonte (link).
- Entra solo chi passa la regola «🏋️ Proteiche» (soglie di base di fitRic in ricettario.js, copiate qui sotto) sui valori stimati.
- Metà dolci (dolce_o_salato: nessun ingrediente salato, almeno uno dolce), metà il resto.
Uso: python3 -I tools/raccogli_stimate.py [quante=500]   (pagine in .cache-stime/; rilanciarlo non rilegge i siti) """
import hashlib, html, json, os, re, subprocess, sys, time
from urllib.parse import quote, urlencode

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stima import stima_ricetta, dolce_o_salato, porzioni, norm

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(RADICE, '.cache-stime')
QUANTE = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 500
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


def minuti(iso):
    m = re.match(r'P(?:T)?(?:(\d+)H)?(?:(\d+)M)?', str(iso or ''))
    return (int(m.group(1) or 0) * 60 + int(m.group(2) or 0)) if m else 0


# la regola dell'app (fitRic di ricettario.js, soglie di base) — se cambiano là, cambiale qui (la prova C141 le confronta)
def fit(n):
    if not n or n['kcal'] <= 0:
        return False
    quota, zuc = n['prot'] * 400 / n['kcal'], n['zuc'] * 400 / n['kcal']
    if n['saturi'] * 900 / n['kcal'] > 13:
        return False
    if n['prot'] >= 25 and quota >= 25 and n['kcal'] <= 550 and zuc <= 15 and n['sodio'] <= 800:
        return 'pasto'
    return 'snack' if n['kcal'] <= 300 and n['prot'] >= 8 and quota >= 20 and zuc <= 30 and n['sodio'] <= 500 else False


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
            'totale': minuti(r.get('totalTime')) or minuti(r.get('cookTime')) + minuti(r.get('prepTime'))}


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
        if len(ing) < 2:
            continue
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
    buone, nomi, scarti = [], set(), {'stima': 0, 'regola': 0, 'doppione': 0}
    for x in ricette:
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
    oggi = time.strftime('%d/%m/%Y')
    righe = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in scelte)
    open(os.path.join(RADICE, 'tools', 'dati', 'ricette-stimate.js'), 'w', encoding='utf-8').write(
        f"""/* C141 · Ricette proteiche con VALORI STIMATI (non verificati), raccolte da Claude il {oggi} (Mario 11/11 sera «apriamo le porte…
   valori non verificati… 500… 50% dolci»). Scritto da tools/raccogli_stimate.py, NON a mano.
   Nome, foto, porzioni e ingredienti come sulla fonte (Cookpad, Blog di GialloZafferano, YouTube di Massimo Pietrobon Gobbi); passi sulla fonte.
   Valori per porzione stimati dagli ingredienti con la tabella CREA (www.alimentinutrizione.it) e etichette di prodotti proteici: errore
   mediano misurato 8-9 % (tools/valida_stima.py). Ognuna passa la regola «🏋️ Proteiche» sui valori stimati. */
const RICETTE_STIMATE = [
{righe}
];
""")
    fonti = {p: sum(x['id'].startswith(p) for x in scelte) for p in ('cp:', 'bg:', 'yt:')}
    print(json.dumps({'scritte': len(scelte), 'dolci': sum(x['dolce'] for x in scelte), 'candidati': len(cand), 'lette': lette,
                      'stimabili': len(buone), 'scarti': scarti, 'fonti': fonti, 'dolciDisponibili': len(dolci), 'altreDisponibili': len(altre)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
