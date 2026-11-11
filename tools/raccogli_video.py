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
CIBO = r'(?i)\b(tort[ae]|tortin\w*|cheesecake|cheescake|pancake|bread|pane|pizz\w*|biscott\w*|muffin|crem[ae]|cremin\w*|gelat\w*|tiramis\w*|budin\w*|brownie|plumcake|frittat\w*|poll[oi]|tonno|salmon\w*|pasta|insalat\w*|burger|wrap|piadin\w*|toast|porridge\w*|overnight|yogurt|mousse|cookie|crepes?|waffle|ricett\w*|polpett\w*|cake|crostat\w*|ciambell\w*|focacc\w*|spumone|semifredd\w*|sorbett\w*|pudding|frullat\w*|smoothie|lattaiolo|brioss|muffins|nuggets|angel ?cake|bake?c?ke?d ?oats?|pancakemis\w*|chersecake|portidge|pluncake|gelatofit|sushi|banana ?bread)\b'
INTEGRATORI = r'(?i)melatonin|omega ?3|creatina|\beaa\b|beta ?alanin|\bvit\.? ?[cd]\b|\bzm[ab]'
# Video di cibo che NON sono una ricetta (scherzi, saluti, giornate alimentari): letti a occhio l'11/11 con --elenco.
NON_RICETTE = (r'(?i)non chiedetemi|è salvo|grazie ragazzi|cosa mangio|settimane (dalla|della) gara|in ogni situazione #gym #funny'
               r'|full ?day ?of ?eating|allenamento|peak ?week|push day|pull day|leg day|\bbulk\b|weeks out|pasto libero|dopo mesi')
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
    """kcal, carbo, prot, grassi dalla riga dei valori; None se ne manca uno (meglio niente che un numero sbagliato).
    Forme vere: «Kcal totali : 519 / 55.8 g carbo / 42.4 g proteine / 13.4 g grassi», «158.8 c/ 70.6 p / 30.6 g»,
    «Per metà pancake : 505 kcal / 65.5 g carbo / 33.3 proteime / 10.2 g grass», «54 g carbo / … kcal 515»."""
    t = riga.lower().replace(',', '.')
    N = r'(\d+(?:\.\d+)?)'
    def primo(*rx):   # fra più forme vince quella che compare PRIMA nella riga (i totali prima di «Metà : 555 kcal»)
        mm = [m for m in (re.search(r, t) for r in rx) if m]
        return float(min(mm, key=lambda m: m.start()).group(1)) if mm else None
    def ultimo(r):
        m = re.findall(r, t)
        return float(m[-1]) if m else None
    v = {'kcal': primo(N + r'\s*kcal', r'kcal\D{0,45}?' + N),
         'carb': primo(N + r'\s*g?\s*(?:carbo\w*|c)\b'),
         'prot': primo(N + r'\s*g?\s*(?:prot\w*|p)\b'),
         'grassi': primo(N + r'\s*g?\s*grass\w*') or ultimo(N + r'\s*g\b(?!\s*(?:carb|prot|c\b|p\b))')}
    if v['kcal'] is None and None not in (v['carb'], v['prot'], v['grassi']):
        v['kcal'] = round(4 * v['carb'] + 4 * v['prot'] + 9 * v['grassi'])   # «Per un gelato : 18 g carbo / 20 g proteine / 11 g»
    if None in v.values() or not (50 <= v['kcal'] <= 2500):
        return None
    if abs(4 * v['prot'] + 4 * v['carb'] + 9 * v['grassi'] - v['kcal']) > 0.2 * v['kcal'] + 30:
        return None   # i conti non tornano: la riga si legge male
    return v


# Come si scrivono nell'app i cibi presi da hashtag e titoli (#pluncake → Plumcake). Il resto: prima lettera maiuscola.
NOMI_CIBO = {'cheescake': 'Cheesecake', 'chersecake': 'Cheesecake', 'portidge': 'Porridge', 'pluncake': 'Plumcake', 'muffins': 'Muffin',
             'gelatofit': 'Gelato fit', 'angelcake': 'Angel cake', 'bakedoats': 'Baked oats', 'backedoat': 'Baked oats', 'bakedoat': 'Baked oats',
             'pancakemisu': 'Pancakemisù', 'bread': 'Pane', 'bananabread': 'Banana bread', 'crepe': 'Crêpes', 'crepes': 'Crêpes',
             'tiramisu': 'Tiramisù', 'ricettafit': 'Ricetta fit', 'gelatino': 'Gelato', 'polli': 'Pollo'}
# Un nome per tipo, quando il titolo non dice altro
TIPO_UNO = {'Torte e tortini': 'Torta', 'Budini e creme': 'Crema', 'Gelati e freddi': 'Gelato', 'Frullati': 'Frullato', 'Pane e salati': 'Pane',
            'Pasti': 'Piatto', 'Altro': 'Ricetta'}
MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
# Ingredienti che non danno il nome (pesano poco o ci sono ovunque)
BANALI = (r'\b(acqua|sale|lievit\w*|bicarbonato|dolcific\w*|eritrit\w*|ertritol\w*|stevia|cannella|vanigli\w*|vanillina|aroma\w*|scorza|succo|'
          r'ghiaccio|pepe|olio|yumm\w*|topping|amido|latte|piacere|facoltativ\w*|faciltativ\w*|spray|caffe|frullate)\b')
SOLO_NOME = [(r'(farina|fiocchi|crema)( di| d)? ?avena|^avena', 'avena'), (r'^album', 'albumi'), (r'^uov', 'uova'), (r'^yogurt greco', 'yogurt greco'),
             (r'^proteine|^whey|^isolat', 'proteine'), (r'^philadelphia', 'philadelphia'), (r'^ricotta', 'ricotta'), (r'^banan', 'banana'),
             (r'^cacao', 'cacao'), (r'^gocce di cioccolato', 'gocce di cioccolato'), (r'^cioccolat', 'cioccolato'), (r'^mirtill', 'mirtilli'),
             (r'^skyr', 'skyr'), (r'^fragol', 'fragole'), (r'^mel[ae]\b', 'mela'), (r'^burro di arachid', 'burro di arachidi'), (r'^zucca', 'zucca'),
             (r'^pollo|^petto di pollo', 'pollo'), (r'^tonno', 'tonno'), (r'^patat[ae] dolc', 'patate dolci'), (r'^carot', 'carote'), (r'^limon', 'limone')]
AGGETTIVI = r'\b(intere?|intero|light|magr\w*|neutr\w*|grattugg?iat\w*|amaro|fresc\w*|surgelat\w*|cott\w*|crud\w*|schiacciat\w*|zero|bianc[oa])\b'


def nome_cibo(testo):
    """Il cibo nominato nel titolo o negli hashtag (#pluncake → Plumcake); «ricetta» solo se non c'è altro."""
    tt = [m.group(0) for m in re.finditer(CIBO, testo)]
    t = next((x for x in tt if not re.match(r'(?i)ricett', x)), tt[0] if tt else '').replace('#', '').strip()
    k = norm(t).replace(' ', '')
    return NOMI_CIBO.get(k, t.capitalize()) if t else ''


def generico(n):
    """Nome che non distingue una ricetta dall'altra («Pancake», «Ricetta», «8 settembre 2026», «Torte e tortini»)."""
    t = re.sub(r'\b(fit|fitness|proteic\w*|ricett\w*|la mia|versione|il mio|di|e|al|alla)\b', ' ', norm(n))
    return len(t.split()) <= 1 or bool(re.fullmatch(r'\s*\d{1,2}\s+\w+\s+\d{4}\s*', n))


def principali(ing, base):
    """I due ingredienti che danno il nome («Pancake con albumi e avena»): nell'ordine in cui li scrive lui, senza i banali."""
    out, b = [], (norm(base).split() or [''])[0]
    for l in ing:
        t = norm(l)
        t = re.sub(r'^[\d ]*(g|gr|grammi|ml|cl|kg|scoop|misurin\w*|cucchiai\w*|cucchiain\w*|tazzin\w*|vasett\w*|fett\w*|pizzico)?\b ?(di |d )?', '', t)
        t = re.split(r'\b(o|io|oppure|al|alla|allo|ai|alle|gusto|tipo|circa|a occhio|q b|qb)\b', t)[0].strip()
        if not t or re.search(BANALI, t) or (b and b in t):
            continue
        for rx, nome in SOLO_NOME:
            if re.search(rx, t):
                t = nome
                break
        else:
            t = ' '.join(re.sub(AGGETTIVI, ' ', t).split()[:3])
        if t and t not in out and not re.search(r'\d', t):
            out.append(t)
        if len(out) == 2:
            break
    return out


def nome_pulito(titolo, tipo, ing, data, testo=''):
    """Il nome come lo scrive lui; se non distingue la ricetta («Pancake», «#ricetta», i soli valori, una data):
    cibo + due ingredienti principali («Pancake con albumi e avena»), sennò cibo + data del video («Pancake del 27 nov 2025»)."""
    n = re.sub(r'(?i)\s*(#\w+|@\w+|codice.*|cod\.? sconto.*|“[^”]*”|"[^"]*")', ' ', titolo)
    n = re.sub(r'\s+', ' ', n).strip(' -:/!.,')
    if re.search(r'(?i)kcal|\d+\s*g?\s*(carbo|prot|grass)', n):
        n = ''   # il titolo sono i valori: il nome viene dal cibo nominato
    if n.isupper() or n.islower():
        n = n.capitalize()
    n = NOMI_CIBO.get(norm(n).replace(' ', ''), n)
    if n and not generico(n):
        return n
    base = n if n and not re.match(r'(?i)(ricett|altro|\d)', n) else ''
    base = base or nome_cibo(titolo) or nome_cibo(' '.join(re.findall(r'#\w+', testo))) or TIPO_UNO.get(tipo, tipo)
    if re.match(r'(?i)ricett', base):
        base = TIPO_UNO.get(tipo, tipo)
    pp = principali(ing, base)
    if pp:
        return f"{base} con {' e '.join(pp)}"
    a, m, g = (data.split('-') + ['', '', ''])[:3]
    return f"{base} del {int(g)} {MESI[int(m) - 1]} {a}" if g else base


def tipo_di(*testi):
    """Il primo testo che dice un tipo vince: prima il titolo, poi gli hashtag, poi gli ingredienti («Torta brasiliana» è una torta
    anche se fra gli ingredienti c'è l'avena al gusto brownie)."""
    for testo in testi:
        t = norm(testo)
        for nome, rx in TIPI:
            if re.search(rx, t):
                return nome
    return 'Altro'


def porzioni_suoi(riga):
    """(valori già a porzione?, porzioni) dalla riga dei suoi valori: «Per metà pancake : 505 kcal» = a porzione, 2;
    «Per due pasti. Kcal totali : 1323» = totali, 2; «Kcal totali : 519» = ricetta intera, 1."""
    t = norm(riga)
    due = bool(re.search(r'\bmeta\b|\bmezz|\b(2|due)( 3)? pasti|\bx ?2\b|per (2|due)\b', t))
    gia = bool(re.search(r'per meta|per mezz|kcal mezz|a fetta|per un gelato|a porzione|per porzione', t))
    return gia, 2 if due else 1


def testo_pulito(testo):
    righe = []
    for l in testo.split('\n'):
        l = re.sub(r'#\w+', '', l).strip()
        if not l or re.search(VUOTO, l) or re.search(r'(?i)codice|sconto|https?://', l):
            continue
        righe.append(l)
    return '\n'.join(righe)[:600]


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
