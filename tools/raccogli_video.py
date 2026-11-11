#!/usr/bin/env python3
"""C144 (Mario 11/11 ~19:34 «mettimi tutti i video delle ricette dello youtuber… in una sezione a parte… ricette video e dividi
per il nome»). Legge TUTTI i video dei canali YouTube in CANALI (YouTube Data API, chiave nella variabile d'ambiente
YOUTUBE_API_KEY, mai stampata; 1 unità ogni 50 video) e tiene solo le RICETTE: ingredienti scritti sotto il video, oppure i
suoi valori («Kcal totali…»), oppure un titolo di cibo. Scrive ricette-video.js, un file del sito (gratis su Cloudflare).
Di ogni video: nome pulito, tipo (Pancake, Porridge…), copertina e link di YouTube, data, ingredienti e testo COSÌ COME
li scrive lui (PT E25; tolti hashtag, codici sconto e link), i suoi valori se li scrive (vincono), sennò «≈ stimati» da
tools/stima.py se gli ingredienti bastano.
Uso: python3 -I tools/raccogli_video.py [--elenco]   (--elenco: stampa ogni video con la scelta, per il controllo a occhio)
Cache: .cache-stime/yt-video-<canale>.json (rilanciarlo non rilegge YouTube; per rileggere cancella quel file)."""
import json, os, re, subprocess, sys, time
from urllib.parse import urlencode

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stima import stima_ricetta, norm

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(RADICE, '.cache-stime')
# Un canale = un riquadro nell'app. Per aggiungerne uno: nome come lo scrive lui, id del canale (UC…).
CANALI = [('Massimo Pietrobon Gobbi', 'UCkQmObN7tBXzPQTQhlT704Q')]

# Tipo della ricetta: la prima parola che compare (nome, hashtag, ingredienti) decide. Ordine = priorità.
TIPI = [('Pancake', r'pancake'), ('Porridge', r'porridge|porridgemis'), ('Cheesecake', r'chee?s?e?cake'), ('Brownie', r'brownie'),
        ('Crêpes', r'crepe'), ('Waffle', r'waffle'), ('Gelati e freddi', r'gelat|spumone|semifredd|sorbett|ghiacciol|granit'),
        ('Torte e tortini', r'tort[ae]|tortin|plumcake|crostat|ciambell|cake|muffin|brioss|lattaiolo|sacher|biscott|cookie'),
        ('Budini e creme', r'budin|pudding|crem[ae]|cremin|mousse|tiramis|panna ?cotta'),
        ('Frullati', r'frullat|shake|smoothie'), ('Pane e salati', r'bread|pane|piadin|pizz|focacc|toast|wrap'),
        ('Pasti', r'poll[oi]|tacchin|tonno|salmon|pasta|ris[oi]\b|riso|patat|uov[ao]|frittat|burger|polpett|insalat|carne|manzo|zucchin')]
CIBO = r'(?i)\b(tort[ae]|tortin\w*|cheesecake|cheescake|pancake|bread|pane|pizz\w*|biscott\w*|muffin|crem[ae]|cremin\w*|gelat\w*|tiramis\w*|budin\w*|brownie|plumcake|frittat\w*|poll[oi]|tonno|salmon\w*|pasta|insalat\w*|burger|wrap|piadin\w*|toast|porridge\w*|overnight|yogurt|mousse|cookie|crepes?|waffle|ricett\w*|polpett\w*|cake|crostat\w*|ciambell\w*|focacc\w*|spumone|semifredd\w*|sorbett\w*|pudding|frullat\w*|smoothie|lattaiolo|brioss)\b'
INTEGRATORI = r'(?i)melatonin|omega ?3|creatina|\beaa\b|beta ?alanin|\bvit\.? ?[cd]\b|\bzm[ab]'
# Video di cibo che NON sono una ricetta (scherzi, saluti, giornate alimentari): letti a occhio l'11/11 con --elenco.
NON_RICETTE = r'(?i)non chiedetemi|è salvo|grazie ragazzi|cosa mangio|settimane (dalla|della) gara|in ogni situazione #gym #funny'
VUOTO = r'(?i)^\s*(codice|cod\.? sconto|sconto|usa il codice|link|http|www\.|@|seguimi|iscriviti|instagram|tiktok)'


def leggi_canale(canale):
    f = os.path.join(CACHE, f'yt-video-{canale}.json')
    if os.path.exists(f):
        return json.load(open(f, encoding='utf-8'))
    chiave, out, tok = os.environ.get('YOUTUBE_API_KEY', '').strip(), [], ''
    if not chiave:
        raise SystemExit('Manca la chiave YouTube (variabile d\'ambiente YOUTUBE_API_KEY): niente da leggere.')
    while True:
        q = {'part': 'snippet,contentDetails', 'playlistId': 'UU' + canale[2:], 'maxResults': 50, 'key': chiave}
        if tok:
            q['pageToken'] = tok
        uscita = subprocess.run(['curl', '-sS', '-m', '25', 'https://www.googleapis.com/youtube/v3/playlistItems?' + urlencode(q)],
                                capture_output=True, timeout=35)
        d = json.loads(uscita.stdout or b'{}')
        if 'error' in d:
            raise SystemExit(f"YouTube ha risposto con un errore: {d['error'].get('code')} {d['error'].get('message', '')[:120]}")
        for i in d.get('items', []):
            sn, cd = i['snippet'], i.get('contentDetails', {})
            out.append({'id': sn['resourceId']['videoId'], 'titolo': sn['title'], 'testo': sn.get('description', ''),
                        'data': (cd.get('videoPublishedAt') or sn.get('publishedAt') or '')[:10],
                        'img': ((sn.get('thumbnails') or {}).get('high') or {}).get('url', '')})
        tok = d.get('nextPageToken')
        if not tok:
            break
        time.sleep(0.3)
    os.makedirs(CACHE, exist_ok=True)
    json.dump(out, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
    return out


def ingredienti(testo):
    return [l.strip(' -•').strip() for l in testo.split('\n')
            if re.match(r'\s*[-•]\s*\S', l) and not re.search(r'(?i)codice|kcal|@|#|http', l)]


def riga_valori(testo):
    """La riga dove lui scrive i valori («Kcal totali: 519 / 55.8 g carbo / 42.4 g proteine / 13.4 g grassi»), pulita."""
    for l in testo.split('\n'):
        if re.search(r'(?i)kcal|\bcarbo|\bprot', l) and re.search(r'\d', l):
            l = re.sub(r'(?i)\s*(💪\S*|codice.*|cod\.? sconto.*|#\w+.*)$', '', l).strip(' :-/')
            if len(l) >= 8:
                return l
    return ''


def numeri(riga):
    """kcal, carbo, prot, grassi dalla riga dei valori; None se ne manca uno (meglio niente che un numero sbagliato)."""
    t = riga.lower().replace(',', '.')
    def dopo(parola):   # il numero subito prima della parola («55.8 g carbo», «36proteine»)
        m = re.search(r'(\d+(?:\.\d+)?)\s*g?\s*' + parola, t)
        return float(m.group(1)) if m else None
    k = re.search(r'kcal\D{0,25}?(\d+(?:\.\d+)?)', t) or re.search(r'(\d+(?:\.\d+)?)\s*kcal', t)
    v = {'kcal': float(k.group(1)) if k else None, 'carb': dopo(r'c(?:arbo\w*)?\b'), 'prot': dopo(r'p(?:rot\w*)?\b'), 'grassi': dopo(r'g(?:rass\w*)?\b|grass')}
    if None in v.values() or not (50 <= v['kcal'] <= 2500):
        return None
    if abs(4 * v['prot'] + 4 * v['carb'] + 9 * v['grassi'] - v['kcal']) > 0.2 * v['kcal'] + 30:
        return None   # i conti non tornano: la riga si legge male
    return v


def nome_pulito(titolo, tipo):
    n = re.sub(r'(?i)\s*(#\w+|@\w+|codice.*|cod\.? sconto.*|“[^”]*”|"[^"]*")', ' ', titolo)
    n = re.sub(r'\s+', ' ', n).strip(' -:/!.,')
    if re.search(r'(?i)kcal|\d+\s*g\s*(carbo|prot|grass)', n) or len(re.sub(r'[^a-zàèéìòù]', '', n.lower())) < 3:
        m = re.search(CIBO, titolo)   # il titolo sono i valori o solo hashtag: il nome viene dal cibo nominato, o dal tipo
        n = (m.group(0) if m else tipo).replace('#', '')
        n = {'cheescake': 'cheesecake', 'porridgemisù': 'porridgemisù'}.get(n.lower(), n)
    if n.isupper() or n.islower():
        n = n.capitalize()
    return n


def tipo_di(*testi):
    t = norm(' '.join(testi))
    for nome, rx in TIPI:
        if re.search(rx, t):
            return nome
    return 'Altro'


def testo_pulito(testo):
    righe = []
    for l in testo.split('\n'):
        l = re.sub(r'#\w+', '', l).strip()
        if not l or re.search(VUOTO, l) or re.search(r'(?i)codice|sconto|https?://', l):
            continue
        righe.append(l)
    return '\n'.join(righe)[:900]


def main():
    elenco = '--elenco' in sys.argv
    stimate = set()
    p = os.path.join(RADICE, 'ricette-stimate.js')
    if os.path.exists(p):
        stimate = set(re.findall(r'"id":"(yt:[\w-]+)"', open(p, encoding='utf-8').read()))
    tutte, conti = [], {}
    for autore, canale in CANALI:
        video = leggi_canale(canale)
        c = conti.setdefault(autore, {'video': len(video), 'ricette': 0, 'suoi': 0, 'stimati': 0, 'senza': 0, 'scartati': 0})
        for v in video:
            ing = ingredienti(v['testo'])
            if ing and re.search(INTEGRATORI, ' '.join(ing)):
                ing = []   # è la lista degli integratori, non degli ingredienti
            riga = riga_valori(v['titolo'] + '\n' + v['testo'])
            cibo = re.search(CIBO, v['titolo'] + ' ' + ' '.join(re.findall(r'#\w+', v['testo'])))
            ricetta = (len(ing) >= 2 or bool(riga and cibo) or bool(cibo)) and not re.search(NON_RICETTE, v['titolo'])
            if re.fullmatch(r'\s*\d{1,2}\s+\w+\s+\d{4}\s*', v['titolo']) and len(ing) < 2:
                ricetta = False
            if not ricetta:
                c['scartati'] += 1
                if elenco:
                    print('  NO  ', v['titolo'][:90].replace('\n', ' '))
                continue
            tipo = tipo_di(v['titolo'], ' '.join(re.findall(r'#\w+', v['testo'])), ' '.join(ing))
            x = {'id': 'yt:' + v['id'], 'nome': nome_pulito(v['titolo'], tipo), 'tipo': tipo, 'autore': autore,
                 'foto': v['img'] or f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg", 'url': 'https://www.youtube.com/watch?v=' + v['id'],
                 'data': v['data'], 'ingredienti': ing, 'testo': testo_pulito(v['testo'])}
            if x['id'] in stimate:
                x['proteica'] = True   # è anche in «🏋️ Proteiche»: lì valori, pagella e voto
            nv = numeri(riga) if riga else None
            if riga:
                x['valoriSuoi'] = riga
            if nv:
                x['nutr'] = nv; x['suoi'] = True; c['suoi'] += 1
            elif len(ing) >= 2:
                st, _, _ = stima_ricetta(ing, 2 if re.search(r'(?i)(due|2) (pasti|porzioni)|per met', v['testo']) else 1)
                if st and 40 <= st['kcal'] <= 1500:
                    x['nutr'] = st; x['stimata'] = True; c['stimati'] += 1
            if 'nutr' not in x:
                c['senza'] += 1
            c['ricette'] += 1
            tutte.append(x)
            if elenco:
                n = x.get('nutr')
                print('  SÌ  ', f"{x['tipo'][:12]:12} {x['nome'][:34]:34} ing {len(ing):2} {'suoi' if x.get('suoi') else 'stim' if x.get('stimata') else '----'}"
                      f" {round(n['kcal']) if n else '':>5} kcal {n['prot'] if n else '':>5} p  ← {v['titolo'][:50]!r}")
    # nomi uguali dello stesso youtuber: si distinguono con la data del video
    visti = {}
    for x in tutte:
        visti.setdefault((x['autore'], norm(x['nome'])), []).append(x)
    for gruppo in visti.values():
        if len(gruppo) > 1:
            for x in gruppo:
                if x['data']:
                    x['nome'] += ' · ' + '/'.join(reversed(x['data'].split('-')))
    tutte.sort(key=lambda x: (x['autore'], x['data']), reverse=True)
    canali = {a: 'https://www.youtube.com/channel/' + c for a, c in CANALI}
    oggi = time.strftime('%d/%m/%Y')
    righe = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in tutte)
    open(os.path.join(RADICE, 'ricette-video.js'), 'w', encoding='utf-8').write(
        f"""/* C144 · Ricette video di YouTube, divise per youtuber, raccolte da Claude il {oggi} (Mario 11/11 «tutti i video delle
   ricette dello youtuber… in una sezione a parte»). Scritto da tools/raccogli_video.py, NON a mano.
   Nome, ingredienti e testo come li scrive l'autore sotto il video (tolti hashtag, codici sconto e link); i passi sono nel video.
   Valori: quelli dell'autore se li scrive («suoi»), sennò «≈ stimati» dagli ingredienti (tabella CREA, tools/stima.py), sennò niente. */
const CANALI_VIDEO = {json.dumps(canali, ensure_ascii=False)};
const RICETTE_VIDEO = [
{righe}
];
""")
    print(json.dumps(conti, ensure_ascii=False), file=sys.stderr)


if __name__ == '__main__':
    main()
