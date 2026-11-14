#!/usr/bin/env python3
"""C144 (Mario 11/11 ~19:34 «mettimi tutti i video delle ricette dello youtuber… in una sezione a parte… ricette video e dividi
per il nome»). Legge TUTTI i video dei canali YouTube in CANALI (YouTube Data API, chiave nella variabile d'ambiente
YOUTUBE_API_KEY, mai stampata; 1 unità ogni 50 video) e tiene solo le RICETTE: ingredienti scritti sotto il video, oppure i
suoi valori («Kcal totali…»), oppure un titolo di cibo. Scrive ricette-video.js, un file del sito (gratis su Cloudflare).
Di ogni video: nome pulito, tipo (Pancake, Porridge…), copertina e link di YouTube, data, ingredienti e testo COSÌ COME
li scrive lui (PT E25; tolti hashtag, codici sconto e link), i suoi valori se li scrive (vincono), sennò «≈ stimati» da
tools/stima.py se gli ingredienti bastano.
Uso: python3 -I tools/raccogli_video.py [--elenco] [--dosi-su ricette-video.js]   (--elenco: stampa ogni video con la scelta, per il controllo a occhio)
Cache: .cache-stime/yt-video-<canale>.json (rilanciarlo non rilegge YouTube; per rileggere cancella quel file)."""
import json, os, re, subprocess, sys, time
from urllib.parse import urlencode

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stima import stima_ricetta, norm, alimento

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(RADICE, '.cache-stime')
# Un canale = un riquadro nell'app. Per aggiungerne uno: nome come lo scrive lui, id del canale (UC…).
# Canali che scrivono la ricetta a sezioni (ingredienti, preparazione, valori): si leggono con sezioni(), passi compresi
A_SEZIONI = {'Beardedscara'}
CANALI = [('Massimo Pietrobon Gobbi', 'UCkQmObN7tBXzPQTQhlT704Q'),
          ('Beardedscara', 'UCWhoPXcEJRPWxtIwjSGgpug'),   # C145 (Mario 11/11 22:46 «aggiungi tutti i suoi video di ricette»)
          ('Cotto al Dente', 'UCF3eVR6iAiKYZHOXLj9Coyw'), ('2foodfitlovers', 'UCAkHCnECo1Uqyy9MvhsVOSQ')]   # C148 (Mario 12/11 «tutti i creatori italiani»)
# C148: canali con tanti video che non sono ricette (recensioni, prove di prodotti): ricetta SOLO con gli ingredienti scritti sotto il video
SOLO_CON_INGREDIENTI = {'Cotto al Dente', '2foodfitlovers'}

# Tipo della ricetta: la prima parola che compare (nome, hashtag, ingredienti) decide. Ordine = priorità.
TIPI = [('Pancake', r'pancake'), ('Porridge', r'porridge|porridgemis|portidge|ba(?:c?k)e?d ?oats?'), ('Cheesecake', r'chee?r?s?e?cake'), ('Brownie', r'brownie'),
        ('Crêpes', r'crepe'), ('Waffle', r'waffle'), ('Gelati e freddi', r'gelat|spumone|semifredd|sorbett|ghiacciol|granit'),
        ('Torte e tortini', r'tort[ae]|tortin|plumcake|crostat|ciambell|cake|muffin|brioss|lattaiolo|biscott|cookie'),
        ('Budini e creme', r'budin|pudding|crem[ae]|cremin|mousse|tiramis|panna ?cotta'),
        ('Frullati', r'frullat|shake|smoothie'), ('Pane e salati', r'bread|pane|piadin|pizz|focacc|toast|wrap'),
        ('Pasti', r'poll[oi]|tacchin|tonno|salmon|pasta|risott|patat|frittat|burger|polpett|insalat|carne|manzo|zucchin|nugget|sushi')]
CIBO = r'(?i)\b(tort[ae]|tortin\w*|cheesecake|cheescake|pancake|bread|pane|pizz\w*|biscott\w*|muffin|crem[ae]|cremin\w*|gelat\w*|tiramis\w*|budin\w*|brownie|plumcake|frittat\w*|poll[oi]|tonno|salmon\w*|pasta|insalat\w*|burger|wrap|piadin\w*|toast|porridge\w*|overnight|yogurt|mousse|cookie|crepes?|waffle|ricett\w*|polpett\w*|cake|crostat\w*|ciambell\w*|focacc\w*|spumone|semifredd\w*|sorbett\w*|pudding|frullat\w*|smoothie|lattaiolo|brioss|muffins|nuggets|angel ?cake|ba(?:c?k)e?d ?oats?|pancakemis\w*|chersecake|portidge|pluncake|gelatofit|sushi|banana ?bread)\b'
INTEGRATORI = r'(?i)melatonin|omega ?3|creatina|\beaa\b|beta ?alanin|\bvit\.? ?[cd]\b|\bzm[ab]'
# Video di cibo che NON sono una ricetta (scherzi, saluti, giornate alimentari): letti a occhio l'11/11 con --elenco.
NON_RICETTE = r'(?i)non chiedetemi|è salvo|grazie ragazzi|cosa mangio|settimane (dalla|della) gara|in ogni situazione #gym #funny'
# …e questi mai, neanche con gli ingredienti scritti (una giornata intera di pasti non è una ricetta)
MAI_RICETTE = (r'(?i)recension|review|ristorante|michelin|\bhaul\b|cosa ho comprato|degustazion|full ?day ?of ?eating|allenamento|peak ?week|push day|pull day|leg day|\bbulk\b|weeks out|pasto libero|dopo mesi|vedo la luce|\d settimane -|\bgag\b|lower body|upper body|total body|workout|\bhiit\b|tabata')
# C151 (Mario 13/11 «è uno scherzo?» poi «cose utili… lasciale… una sezione a parte»): attrezzi da palestra = allenamento → sezione «Consigli, allenamenti e altro»
ATTREZZI = r'(?i)\bmanubri|\belastic[io]\b|tappetin|kettlebell|bilanciere|fitball|\bpanca\b|cavigliere'
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


PROMO = r'(?i)promozion|omagg|sconto|codice|\bcod\b|cashback|link|https?://'


def ingredienti(testo):
    """Righe a trattino. Una menzione (@marca, #tag) o una pubblicità fra parentesi NON butta via l'ingrediente: si toglie solo lei
    («-5g cacao (noi degrassato @fitporn)» → «5g cacao (noi degrassato)»). C154: prima la riga spariva intera (43 ricette senza
    farina, cacao o proteine in polvere; Mario 13/11 «chissà in quanti altre ricette video mancano gli ingredienti»)."""
    out = []
    for l in testo.split('\n'):
        if not re.match(r'\s*[-•]\s*\S', l):
            continue
        l = re.sub(r'\([^)]*(?:' + PROMO[4:] + r')[^)]*\)?', '', l, flags=re.I)   # «(promozione omaggi ogni 20€ con …»
        l = re.sub(r'(?i)\s*(?:➡️?|,\s*lo trovi|,?\s*(?:col\s+)?cod\b).*$', '', l)   # «… ➡️ noi usiamo quelle di …», «, cod Fitlovers …»
        if re.search(r'(?i)codice|kcal|https?://|www\.|e-?mail|\w@\w', l):
            continue   # pubblicità, valori o indirizzi email: non sono ingredienti
        l = re.sub(r'[@#][\w.]+', '', l)
        l = re.sub(r'(?:\s+(?:di|da|del|della|con|il|la|nostro|nostra|noi|io|tipo|come|quello|quella|marca))*\s*\)', ')', l)   # «(… come il nostro @fitporn)» → «(…)»
        l = re.sub(r'\(\s+', '(', l)
        l = re.sub(r'\(\s*\)', '', l)
        l = re.sub(r'\s{2,}', ' ', l).strip(' -•').strip()
        if re.search(r'[a-zà-ü]{3}', l, re.I):
            out.append(l)
    return out


STOP_DOSE = r'\s+(?:e|ed|per|in|a|al|alla|nel|nella|poi|fino|dentro|sopra|insieme|oppure|o|che|quindi|così|cosi)\b.*$'


def dosi_nel_testo(testo, ing):
    """C153 (Mario 13/11 «mancano in tutti ingredienti»): le dosi che l'autore scrive DENTRO il procedimento
    («aggiungete 150 ml di albume e montatelo» → «150 ml di albume»), se non sono già fra gli ingredienti a trattino."""
    gia = ' '.join(norm(i) for i in ing)
    nuove = []
    for l in testo.split('\n'):
        if re.match(r'\s*[-•]', l) or re.search(r'(?i)kcal|codice|@|#|http|valori|carbo\b|proteine\s*/', l):
            continue
        for m in re.finditer(r'(\d+(?:[.,]\d+)?)\s*(g|gr|grammi|ml|kg)\s+((?:di\s+|d[\'’]\s*)?[^\d,.;:()!?\n]{3,60})', l, re.I):
            cibo = re.sub(STOP_DOSE, '', m.group(3).strip(), flags=re.I).strip()
            cibo = re.sub(r'^(?:di\s+|d[\'’]\s*)', '', cibo, flags=re.I)
            parole = [w for w in norm(cibo).split() if len(w) > 2 and w not in ('senza', 'con', 'del', 'della', 'dei', 'delle')]
            if not parole or len(cibo) < 3 or parole[0] in ('totali', 'circa', 'impasto', 'abbiamo', 'gradi', 'seconda', 'proteine', 'carboidrati', 'grassi', 'calorie', 'acqua') or not alimento(cibo):
                continue   # solo cibi che la tabella conosce («100 g di e completate…», «5 g di totali» fuori)
            if any(w[:5] in gia for w in parole[:2]):
                continue   # già scritto fra gli ingredienti
            riga = f'{m.group(1)} {m.group(2).lower()} di {cibo}'
            nuove.append(riga); gia += ' ' + norm(cibo)
    return nuove


def con_dosi_testo(testo, ing):
    """Ingredienti a trattino + dosi del procedimento, nell'ordine in cui compaiono nel testo (l'albume montato viene prima)."""
    nuove = dosi_nel_testo(testo, ing)
    if not nuove:
        return ing
    t = norm(testo)
    def pos(i):
        k = norm(i)
        p = t.find(k)
        if p < 0 and ' di ' in i:
            p = t.find(norm(i.split(' di ', 1)[1]))
        return p if p >= 0 else len(t)
    return sorted(ing + nuove, key=pos)


def dosi_su(f):
    """--dosi-su FILE: aggiunge le dosi scritte nel procedimento (C153) a un ricette-video.js già fatto, senza rileggere YouTube."""
    t = open(f, encoding='utf-8').read()
    i = t.index('const RICETTE_VIDEO = [') + len('const RICETTE_VIDEO = '); fine = t.index('\n];', i) + 2
    tutte, n = json.loads(t[i:fine]), 0
    for x in tutte:
        if x.get('autore') == 'Massimo Pietrobon Gobbi' and x.get('ingredienti') and x.get('parlato') != 'dosi':
            nuovi = con_dosi_testo(x.get('testo') or '', x['ingredienti'])
            if nuovi != x['ingredienti']:
                x['ingredienti'] = nuovi; n += 1
    righe = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in tutte)
    open(f, 'w', encoding='utf-8').write(t[:i] + '[\n' + righe + '\n]' + t[fine:])
    print(json.dumps({'ricette con dosi in più': n}, ensure_ascii=False), file=sys.stderr)


def riga_valori(testo):
    """La riga dove lui scrive i valori («Kcal totali: 519 / 55.8 g carbo / 42.4 g proteine / 13.4 g grassi»), pulita."""
    for l in testo.split('\n'):
        if re.search(r'(?i)kcal|\bcarbo|\bprot', l) and re.search(r'\d', l):
            l = re.sub(r'(?i)\s*(💪\S*|codice.*|cod\.? sconto.*|#\w+.*)$', '', l).strip(' :-/')
            if len(l) >= 8:
                return l
    return ''


def numeri(riga, largo=False):
    """kcal, carbo, prot, grassi dalla riga dei valori; None se ne manca uno (meglio niente che un numero sbagliato).
    Forme vere: «Kcal totali : 519 / 55.8 g carbo / 42.4 g proteine / 13.4 g grassi», «158.8 c/ 70.6 p / 30.6 g»,
    «Per metà pancake : 505 kcal / 65.5 g carbo / 33.3 proteime / 10.2 g grass», «54 g carbo / … kcal 515»."""
    t = riga.lower().replace(',', '.')
    N = r'(\d+(?:\.\d+)?)'
    def primo(*rx):   # fra più forme vince quella che compare PRIMA nella riga (i totali prima di «Metà : 555 kcal»)
        mm = [m for m in (re.search(r, t) for r in rx) if m]
        return float(min(mm, key=lambda m: m.start()).group(1)) if mm else None
    def dopo_prot(r):   # «… / 70.6 p / 30.6 g metà … 15.3 g»: i grassi senza nome sono il primo «N g» DOPO le proteine
        mp = re.search(N + (r'\s*g?\s*(?:pro\w*|p)\b' if largo else r'\s*g?\s*(?:prot\w*|p)\b'), t)
        m = re.search(r, t[mp.end():] if mp else t)
        return float(m.group(1)) if m else None
    v = {'kcal': primo(N + r'\s*kcal', r'kcal\D{0,45}?' + N),
         'carb': primo(N + r'\s*g?\s*(?:carbo\w*|c)\b'),
         'prot': primo(N + (r'\s*g?\s*(?:pro\w*|p)\b' if largo else r'\s*g?\s*(?:prot\w*|p)\b')),   # «42.4 g proteine», «70.6 p»; largo: «12g Pro» (C145)
         'grassi': primo(N + r'\s*g?\s*grass\w*') or dopo_prot(N + r'\s*g\b(?!\s*(?:carb|prot|c\b|p\b))')}
    if v['kcal'] is None and None not in (v['carb'], v['prot'], v['grassi']):
        v['kcal'] = round(4 * v['carb'] + 4 * v['prot'] + 9 * v['grassi'])   # «Per un gelato : 18 g carbo / 20 g proteine / 11 g»
    if None in v.values() or not (50 <= v['kcal'] <= 2500):
        return None
    if abs(4 * v['prot'] + 4 * v['carb'] + 9 * v['grassi'] - v['kcal']) > 0.2 * v['kcal'] + 30:
        return None   # i conti non tornano: la riga si legge male
    return v


NUMERI_PAROLA = {'una': 1, 'uno': 1, 'un': 1, 'due': 2, 'tre': 3, 'quattro': 4, 'cinque': 5, 'sei': 6, 'otto': 8, 'dieci': 10}


def sezioni(testo):
    """C145: descrizioni a sezioni (Beardedscara): «🧾 Ingredienti per ~3 porzioni:», «👨‍🍳 Preparazione:» coi passi a trattino o pallino,
    «🔥 Valori nutrizionali - per UNA porzione:», poi considerazioni e pubblicità (fuori). Esce ingredienti, passi, valori e porzioni
    COME LI SCRIVE LUI (PT E25); «A 🔄 B» = «A (oppure B)»."""
    pulisci = lambda l: re.sub(r'^[^\w~½¼¾(]+', '', re.sub(r'[\u200b-\u200f\u2060\ufeff]', '', l)).strip(' ;.,')
    sez, sotto, ing, passi, val, note, testa_ing, testa_val = '', '', [], [], [], [], '', ''
    ha_prep = re.search(r'(?im)^\W*(preparazione|procedimento)', testo)
    for l in testo.split('\n'):
        l0 = re.sub(r'[\u200b-\u200f\u2060\ufeff]', '', l).strip()
        if not l0:
            continue
        b = norm(l0)
        testa = not re.match(r'[•\-*]', l0) and (l0.endswith(':') or len(b) < 40)   # un titolo, non una riga a pallino («• ingredienti “ottimi”»)
        if testa and b.startswith('ingredient') and len(b) < 90:   # «🧾 Ingredienti per ~3 porzioni:» (mai «unisci gli ingredienti»)
            sez, testa_ing, sotto = 'ing', l0, ''; continue
        if testa and re.match(r'(preparazione|procedimento)\b', b) and len(b) < 60:
            sez, sotto = 'passi', ''; continue
        if testa and b.startswith('valori') and len(b) < 80:
            sez, testa_val = 'val', l0; continue
        if testa and re.search(r'consideraz', b):
            sez = 'note'; continue   # i suoi consigli: «Cosa scrive sotto il video» nell'app (ingredienti e passi sono già sopra)
        if re.search(r'consideraz|figata|grazie|link|clicca|ricettario|segui|#\w|\bvoto\b', b):
            sez = 'fine'; continue
        if sez in ('ing', 'passi') and l0.endswith(':') and len(b) < 40 and not re.search(r'\d', b):
            sotto = pulisci(l0).rstrip(':'); continue   # «Per la base:», «Per il ripieno:»
        if sez == 'ing' and not ha_prep and re.match(r'\s*-', l0) and not re.search(r'\d|q\.? ?b\b', b[:14]) and len(b.split()) >= 4:
            sez = 'passi'   # passi a trattino subito dopo gli ingredienti, senza «Preparazione»
        if sez == 'ing':
            for pezzo in l0.split(';'):
                t = pulisci(pezzo)
                if re.match(r'\W*\*', pezzo) or re.search(r'(?i)kcal', pezzo):
                    continue   # note a piè di lista («*a me non piace», «*opzionali») e valori
                if t:
                    alt = [x.strip(' ;.,') for x in re.split(r'\s*🔄\s*', t)]
                    ing.append(alt[0] + (f" (oppure {' oppure '.join(pulisci(x) for x in alt[1:] if pulisci(x))})" if len(alt) > 1 and any(pulisci(x) for x in alt[1:]) else '')
                               + (' (facoltativo)' if re.search(r'(?i)facoltativ', sotto) else ''))
        elif sez == 'passi':
            t = pulisci(l0)
            if t:
                t = (sotto + ': ' + t[0].lower() + t[1:]) if sotto else t
                passi.append(t[0].upper() + t[1:])
                sotto = ''
        elif sez == 'val':
            val.append(pulisci(l0))
        elif sez == 'note' and pulisci(l0):
            t = pulisci(l0)
            note.append(t[0].upper() + t[1:])
    m = re.search(r'(?i)(?:per|-)\s*~?\s*(\d+|' + '|'.join(NUMERI_PAROLA) + r')\b', testa_ing)   # «per ~3 porzioni», «- 8 fette»
    porz = int(m.group(1)) if m and m.group(1).isdigit() else NUMERI_PAROLA.get(m.group(1).lower(), 1) if m else 1
    riga, nv = '', None
    for i, v in enumerate(val):   # la prima riga con le kcal; se proteine, carboidrati e grassi sono sotto, una riga per uno, si uniscono
        if re.search(r'(?i)kcal', v) and re.search(r'\d', v):
            for r in (v, ' · '.join(val[i:i + 4])):
                nv = numeri(r, largo=True)
                if nv:
                    riga = r
                    break
            break
    return {'ing': ing, 'passi': passi, 'riga': riga, 'nv': nv, 'porzioni': max(1, min(porz, 12)), 'note': note,
            'a_porzione': True if re.search(r'(?i)\bper\s+(1|una|un|uno|ogni|singol\w*)\b|a porzione|per porzione|\b(a|una) (fetta|biscotto|pezzo)\b', testa_val)
            else None}   # None = non lo dice: decide la stima (main)


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
SOLO_NOME = [(r'^\w+ (di |d )?aven[ae]|^aven[ae]', 'avena'), (r'^album', 'albumi'), (r'^uov', 'uova'), (r'^yogurt greco', 'yogurt greco'),
             (r'^proteine|^whey|^isolat', 'proteine'), (r'^philadelphia', 'philadelphia'), (r'^ricotta', 'ricotta'), (r'^banan', 'banana'),
             (r'^cacao', 'cacao'), (r'^gocce di cioccolato', 'gocce di cioccolato'), (r'^cioccolat', 'cioccolato'), (r'^mirtill', 'mirtilli'),
             (r'^skyr', 'skyr'), (r'^fragol', 'fragole'), (r'^mel[ae]\b', 'mela'), (r'^burro di arachid', 'burro di arachidi'), (r'^zucca', 'zucca'),
             (r'^pollo|^petto di pollo', 'pollo'), (r'^tonno', 'tonno'), (r'^patat[ae] dolc', 'patate dolci'), (r'^carot', 'carote'), (r'^limon', 'limone')]
PASSI = r'\b(separate|separare|montate|montare|lasciate|lasciare|aggiungete|aggiungere|mescolate|mescolare|cuocete|cuocere|unite|unire|versate|versare|mettete|mettere|infornate|infornare|frullate tutto|amalgamate|impastate|lascio|riposare|riposo)\b'
# Lodi nel titolo che non sono il nome («Crema di riso spettacolare» → «Crema di riso»)
LODI = r'(?i)\b(assolutamente|sempre|troppo|davvero|veramente)?\s*\b(spettacolar\w*|buonissim\w*|buon[oa]|fantastic\w*)\b|\bprovatel\w*|\bfatel\w*|\bcome sempre\b|\bsono\b|\s\bè\b'
AGGETTIVI = r'\b(intere?|intero|light|magr\w*|neutr\w*|grattugg?iat\w*|amaro|fresc\w*|surgelat\w*|cott\w*|crud\w*|schiacciat\w*|zero|bianc[oa])\b'


def nome_cibo(testo):
    """Il cibo nominato nel titolo o negli hashtag (#pluncake → Plumcake); «ricetta» solo se non c'è altro."""
    tt = [m.group(0) for m in re.finditer(CIBO, testo)]
    t = next((x for x in tt if not re.match(r'(?i)ricett', x)), tt[0] if tt else '').replace('#', '').strip()
    k = norm(t).replace(' ', '')
    return NOMI_CIBO.get(k, t.capitalize()) if t else ''


REFUSI = {r'\btornta\b': 'torta'}   # refusi nei titoli dei video («farina tornta a limone», C154 controllo 14/11)


def refusi(n):
    for k, v in REFUSI.items():
        n = re.sub(k, v, n, flags=re.I)
    return n


def generico(n):
    """Nome che non distingue una ricetta dall'altra («Pancake», «Ricetta», «8 settembre 2026», «Torte e tortini»)."""
    t = re.sub(r'\b(fit|fitness|proteic\w*|ricett\w*|la mia|versione|il mio|di|e|al|alla)\b', ' ', norm(n))
    return len(t.split()) <= 1 or bool(re.fullmatch(r'\s*\d{1,2}\s+\w+\s+\d{4}\s*', n))


def principali(ing, base):
    """I due ingredienti che danno il nome («Pancake con albumi e avena»): nell'ordine in cui li scrive lui, senza i banali."""
    out, b = [], (norm(base).split() or [''])[0]
    for l in ing:
        if re.search(PASSI, norm(l)) or '(facoltativo)' in l:
            continue   # è un passo scritto col trattino («separate gli albumi…»), non un ingrediente; o è facoltativo
        t = re.sub(r'^[\d/.,\s]*(g|gr|grammi|ml|cl|kg|scoop|misurin\w*|cucchiai\w*|cucchiain\w*|tazzin\w*|vasett\w*|fett[ae]\b|pizzico)?\.?\s*(di |d’|d\')?', '', l.lower().strip())
        t = re.split(r'[,(:;]|\b(?:o|io|ho|uso|oppure|al|alla|allo|ai|alle|gusto|tipo|circa|a occhio|q\.?b\.?)\b', t)[0].strip(' .-')
        if not t or re.search(BANALI, norm(t)) or (b and b in norm(t)):
            continue
        for rx, nome in SOLO_NOME:
            if re.search(rx, norm(t)):
                t = nome
                break
        else:
            t = re.sub(r'\s+(de|di|del|della|dei|al|alla|con|e|in)$', '', ' '.join(re.sub(AGGETTIVI, ' ', t).split()[:3]))   # niente «pastel de»
        if t and t not in out and not re.search(r'\d', t):
            out.append(t)
        if len(out) == 2:
            break
    return out


def nome_pulito(titolo, tipo, ing, data, testo='', lungo=40):
    """Il nome come lo scrive lui; se non distingue la ricetta («Pancake», «#ricetta», i soli valori, una data):
    cibo + due ingredienti principali («Pancake con albumi e avena»), sennò cibo + data del video («Pancake del 27 nov 2025»)."""
    n = re.sub(r'(?i)\s*(#\w+|@\w+|codice.*|cod\.? sconto.*|“[^”]*”|"[^"]*")', ' ', titolo)
    n = re.sub(r'[\u200b-\u200f\u2060\ufeff]', '', n)
    if re.search(r'(?i)kcal|\d+\s*g?\s*(carbo|prot|grass)', n):
        n = ''   # il titolo sono i valori: il nome viene dal cibo nominato
    pezzi = [x for x in re.split(r'\s+-\s+|[,.:/!?]\s|🥞|🫡', n) if x.strip()]
    if len(pezzi) > 1:   # «Torta pancake fit, porterò la ricetta» → «Torta pancake fit»; «Una delle mie colazioni preferite - OVERNIGHT PORRIDGE» → il pezzo col cibo
        n = next((x for x in pezzi if re.search(CIBO, x) and not re.fullmatch(r'(?i)\s*ricett\w*.*', x)), pezzi[0])
    n = re.sub(r'\s+', ' ', re.sub(LODI, ' ', n)).strip(' -:/!.,')
    if len(n) > lungo:
        n = ''   # una frase, non un nome
    if n.isupper() or n.islower():
        n = n.capitalize()
    n = refusi(NOMI_CIBO.get(norm(n).replace(' ', ''), n))
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
        trovati = [(m.start(), nome) for nome, rx in TIPI for m in [re.search(rx, t)] if m]
        if trovati:
            return min(trovati)[1]
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


PARLATO = os.path.join(RADICE, 'tools', 'dati', 'video-dal-parlato.json')


def leggi_parlato():
    return json.load(open(PARLATO, encoding='utf-8')) if os.path.exists(PARLATO) else {}


def con_dosi(ing):
    return sum(bool(re.search(r'\d', i)) for i in ing) >= 2


def cibo_chiave(i):
    """«150 ml di albume (montato)» → «albume»: la prima parola di cibo, per riconoscere lo stesso ingrediente scritto e detto."""
    t = norm(re.sub(r'\(.*?\)', ' ', i))
    t = re.sub(r'\b\d+([.,]\d+)?\s*(g|gr|grammi|ml|kg|cl|l)?\b', ' ', t)
    parole = [w for w in t.split() if len(w) > 2 and w not in ('di', 'del', 'della', 'dei', 'delle', 'con', 'per', 'qb', 'circa', 'uno', 'una', 'cucchiaio', 'cucchiai', 'cucchiaino', 'cucchiaini', 'pizzico', 'spicchio', 'spicchi', 'fette', 'fetta', 'bustina', 'mezzo', 'mezza', 'intere', 'intero')]
    return parole[0][:5] if parole else ''


def unisci_ingredienti(scritti, detti):
    """C154: lo scritto dell'autore resta com'è; si aggiungono gli ingredienti DETTI nel video che non sono scritti, e la dose
    detta va al posto di uno scritto senza dose («Frutti di bosco» + «50 g di frutti di bosco»)."""
    out = list(scritti)
    chiavi = [cibo_chiave(i) for i in out]
    for d in detti:
        k = cibo_chiave(d)
        if not k:
            continue
        if k in chiavi:
            j = chiavi.index(k)
            if not re.search(r'\d', out[j]) and re.search(r'\d', d):
                out[j] = d
            continue
        out.append(d); chiavi.append(k)
    return out


def col_parlato(x, par):
    """C150 (Mario 13/11 «dalle parole che dicono… ci fai la ricetta»): dosi e passi dal parlato del video (tools/trascrivi_video.py).
    Lo scritto dell'autore vince: ai video con le dosi scritte solo i passi che mancano. Fuori: risposte con numeri non sentiti nel
    parlato («dubbi», finché Claude non le guarda, PT E25) e dosi per porzioni diverse dai suoi valori scritti.
    «parlato» = 'dosi' (ingredienti e passi) o 'passi': nell'app «📝 dal video». True se ha cambiato gli ingredienti."""
    p = par.get(x['id'])
    if not p or 'ingredienti' not in p or p.get('dubbi'):
        return False
    x['controllata'] = True   # C154 (Mario 13/11 «fai un check a tutti e trascrivi bene tutti gli ingredienti»): confrontata col video
    cambia = not con_dosi(x.get('ingredienti') or [])
    if cambia and x.get('suoi') and (p.get('porzioni') or 1) != (x.get('porzioni') or 1):
        cambia = False   # i suoi valori sono per altre porzioni: le dosi del parlato li confonderebbero
    if cambia:
        x['ingredienti'] = p['ingredienti']; x['parlato'] = 'dosi'
        if not x.get('suoi'):
            x['porzioni'] = p.get('porzioni') or 1
    elif (p.get('porzioni') or 1) == (x.get('porzioni') or 1):
        unite = unisci_ingredienti(x.get('ingredienti') or [], p['ingredienti'])   # C154: lo scritto resta, il detto aggiunge ciò che manca
        if unite != x.get('ingredienti'):
            x['ingredienti'] = unite; x['parlato'] = 'dosi'; cambia = True
    if not x.get('passi') and p.get('passi'):
        x['passi'] = p['passi']; x.setdefault('parlato', 'passi')
    m = re.fullmatch(r'(.*?) del \d{1,2} \w+ \d{4}( · [\d/]+)?', x['nome'])
    senza_cibo = not re.search(CIBO, x['nome']) and p.get('nome')   # «In cucina con mio padre»: non dice il piatto
    fatto_qui = re.match(r'(?i)ricetta con\b', x['nome'])   # «Ricetta con limone» l'ha fatto nome_pulito: il nome detto è meglio («Ricotta di soia»)
    x['nome'] = refusi(x['nome'])
    if x.get('parlato') and (m or generico(x['nome']) or senza_cibo or fatto_qui):   # «Ricetta del 4 giu 2025» → il piatto come lo dice
        if p.get('nome') and len(p['nome']) <= 40:
            x['nome'] = p['nome'][0].upper() + p['nome'][1:]
        elif cambia:
            base = (m.group(1) if m else x['nome']).strip()
            base = TIPO_UNO.get(x.get('tipo'), x.get('tipo') or 'Ricetta') if not base or re.match(r'(?i)ricett', base) else base
            pp = principali(x['ingredienti'], base)
            if pp:
                x['nome'] = f"{base} con {' e '.join(pp)}"
    return cambia


def distingui(tutte):
    """Nomi uguali dello stesso youtuber: si distinguono con la data del video."""
    visti = {}
    for x in tutte:
        visti.setdefault((x['autore'], norm(x['nome'])), []).append(x)
    for gruppo in visti.values():
        if len(gruppo) > 1:
            for x in gruppo:
                if x['data'] and ' · ' not in x['nome']:
                    x['nome'] += ' · ' + '/'.join(reversed(x['data'].split('-')))


def stima_su(x):
    """Valori «≈ stimati» dalle dosi (tools/stima.py), mai quelli detti nel video (13/11 #72: 2 su 3 sbagliati)."""
    porz = x.get('porzioni') or 1
    st, _, _ = stima_ricetta([re.sub(r'\s*\(oppure .*$', '', i) for i in x['ingredienti'] if '(facoltativo)' not in i], porz)
    x.pop('nutr', None); x.pop('stimata', None)
    if st and 40 <= st['kcal'] <= 1500:
        x['nutr'] = st; x['porzioni'] = porz; x['stimata'] = True


def segna_altro(tutte):
    """C151: i video che non sono ricette (elenco letto a occhio + attrezzi) restano, segnati «altro» = allenamento/consiglio/prodotti/posti."""
    try:
        elenco = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dati', 'video-non-ricette.json'), encoding='utf-8'))['video']
    except (OSError, ValueError, KeyError):
        elenco = {}
    n = 0
    for x in tutte:
        tipo = (elenco.get(x['id']) or {}).get('tipo') or ('allenamento' if re.search(ATTREZZI, ' '.join(map(str, x.get('ingredienti') or []))) else '')
        if tipo:
            x['altro'] = tipo; x.pop('proteica', None); n += 1
    print(f'non ricette (sezione a parte): {n}', file=sys.stderr)


def su_file(f):
    """--parlato-su FILE: il parlato su un ricette-video.js già fatto (es. con la patch C148), senza rileggere YouTube."""
    t = open(f, encoding='utf-8').read()
    i = t.index('const RICETTE_VIDEO = [') + len('const RICETTE_VIDEO = '); fine = t.index('\n];', i) + 2
    tutte, par, c = json.loads(t[i:fine]), leggi_parlato(), {'dosi': 0, 'passi': 0, 'stimati': 0}
    for x in tutte:
        if col_parlato(x, par) and not x.get('suoi'):
            stima_su(x); c['stimati'] += 'nutr' in x
        if x.get('parlato'):
            c[x['parlato']] += 1
    distingui(tutte)
    segna_altro(tutte)
    righe = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in tutte)
    t = t[:i] + '[\n' + righe + '\n]' + t[fine:]
    open(f, 'w', encoding='utf-8').write(t.replace('i passi sono nel video.', 'senza dosi sotto, dosi e passi dal parlato del video («parlato», C150).'))
    print(json.dumps(c, ensure_ascii=False), file=sys.stderr)


def main():
    if '--dosi-su' in sys.argv:
        return dosi_su(sys.argv[sys.argv.index('--dosi-su') + 1])
    if '--parlato-su' in sys.argv:
        return su_file(sys.argv[sys.argv.index('--parlato-su') + 1])
    elenco = '--elenco' in sys.argv
    par = leggi_parlato()
    stimate = set()
    p = os.path.join(RADICE, 'ricette-stimate.js')
    if os.path.exists(p):
        stimate = set(re.findall(r'"id":\s*"(yt:[\w-]+)"', open(p, encoding='utf-8').read()))
    tutte, conti = [], {}
    for autore, canale in CANALI:
        video = leggi_canale(canale)
        c = conti.setdefault(autore, {'video': len(video), 'ricette': 0, 'suoi': 0, 'stimati': 0, 'senza': 0, 'scartati': 0, 'doppie': 0})
        doppie = {}
        for v in video:
            sz = sezioni(v['testo']) if autore in A_SEZIONI else None
            if sz is not None:   # C145: titolo senza emoji e frecce («🥒 FRITTELLE di ZUCCHINE ⤵️» → «Frittelle di zucchine»)
                t = re.sub(r'[\U0001F000-\U0001FAFF\U000E0000-\U000E007F☀-➿⬀-⯿⤴⤵\ufe0f\u200d\u2060]', '', re.sub(r'#\w+', '', v['titolo']))
                t = re.sub(r'\s+', ' ', t.replace('”', '').replace('“', '').replace('"', '')).strip(' -')
                v = dict(v, titolo=t.capitalize() if re.search(r'\b[A-ZÀ-Ü]{3,}\b', t) else t)   # una parola TUTTA MAIUSCOLA → «Frittelle di zucchine»
            ing = ingredienti(v['testo']) if sz is None else sz['ing']
            if sz is None and ing and autore == 'Massimo Pietrobon Gobbi':   # scrive le dosi nel «Procedimento»; gli altri raccontano (letto a occhio 13/11)
                ing = con_dosi_testo(v['testo'], ing)   # C153: anche le dosi scritte nel procedimento
            if ing and re.search(INTEGRATORI, ' '.join(ing)):
                ing = []   # è la lista degli integratori, non degli ingredienti
            riga = riga_valori(v['titolo'] + '\n' + v['testo']) if sz is None else sz['riga']
            cibo = re.search(CIBO, v['titolo'] + ' ' + ' '.join(re.findall(r'#\w+', v['testo'])))
            nv = sz['nv'] if sz is not None else numeri(riga) if riga else None   # i suoi valori leggibili: li scrive solo sotto le ricette
            ricetta = (len(ing) >= 2 or ((cibo or nv) and not re.search(NON_RICETTE, v['titolo']))) and not re.search(MAI_RICETTE, v['titolo'])
            if sz is not None or autore in SOLO_CON_INGREDIENTI:
                ricetta = len(ing) >= 2 and not re.search(MAI_RICETTE, v['titolo'])   # a sezioni (o C148): ricetta = ingredienti scritti
            if re.fullmatch(r'\s*\d{1,2}\s+\w+\s+\d{4}\s*', v['titolo']) and len(ing) < 2:
                ricetta = False
            if not ricetta:
                c['scartati'] += 1
                if elenco:
                    print('  NO  ', v['titolo'][:90].replace('\n', ' '))
                continue
            tipo = tipo_di(v['titolo'], ' '.join(re.findall(r'#\w+', v['testo'])), ' '.join(ing))
            # stessa ricetta ripubblicata (stessi ingredienti, o stessi valori senza ingredienti): resta la più nuova (l'elenco parte dalle nuove)
            chiave = (autore, tuple(norm(i) for i in ing) if len(ing) >= 2 else re.sub(r'[^\d.]+', ' ', riga).strip() or v['id'])
            chiave2 = (autore, nv['kcal'], nv['carb'], nv['prot']) if nv else None   # stessi valori = stessa ricetta, anche senza ingredienti
            if chiave in doppie or (chiave2 and chiave2 in doppie):
                c['doppie'] += 1
                if 'yt:' + v['id'] in stimate:
                    (doppie.get(chiave) or doppie[chiave2])['proteica'] = True   # la stessa ricetta, ripubblicata, è in «🏋️ Proteiche»
                if elenco:
                    print('  DOP ', v['titolo'][:90].replace('\n', ' '))
                continue
            x = {'id': 'yt:' + v['id'], 'nome': nome_pulito(v['titolo'], tipo, ing, v['data'], v['testo'], 40 if sz is None else 55), 'tipo': tipo, 'autore': autore,
                 'foto': v['img'] or f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg", 'url': 'https://www.youtube.com/watch?v=' + v['id'],
                 'data': v['data'], 'ingredienti': ing, 'testo': testo_pulito(v['testo'])}
            doppie.update({k: x for k in ([chiave, chiave2] if chiave2 else [chiave])})
            if sz is not None:
                x['testo'] = ('Considerazioni:\n' + '\n'.join(sz['note']))[:600] if sz['note'] else ''
            if sz is not None and sz['passi']:
                x['passi'] = sz['passi']   # C145/C146: i passi come li scrive lui → «Passo passo» e «Ascolta» nell'app
            if x['id'] in stimate:
                x['proteica'] = True   # è anche in «🏋️ Proteiche»: lì valori, pagella e voto
            if riga:
                x['valoriSuoi'] = riga
            if nv and sz is not None:
                porz, a_porz = sz['porzioni'], sz['a_porzione']
                if a_porz is None and porz > 1:   # «Valori nutrizionali:» senza dire per cosa: vince il più vicino alla stima dagli ingredienti
                    st, _, _ = stima_ricetta([re.sub(r'\s*\(oppure .*$', '', i) for i in ing if '(facoltativo)' not in i], porz)
                    a_porz = not st or abs(nv['kcal'] - st['kcal']) <= abs(nv['kcal'] - st['kcal'] * porz)
                x['nutr'] = nv if a_porz or porz == 1 else {k: round(n / porz, 1) for k, n in nv.items()}
                x['porzioni'] = porz; x['suoi'] = True; c['suoi'] += 1
            elif nv:
                gia, porz = porzioni_suoi(riga)
                x['nutr'] = nv if gia or porz == 1 else {k: round(n / porz, 1) for k, n in nv.items()}   # sempre a porzione, come le altre
                x['porzioni'] = porz; x['suoi'] = True; c['suoi'] += 1
            elif len(ing) >= 2:
                porz = sz['porzioni'] if sz is not None else 2 if re.search(r'(?i)(due|2) (pasti|porzioni)|per met', v['testo']) else 1
                ing_st = [re.sub(r'\s*\(oppure .*$', '', i) for i in ing if '(facoltativo)' not in i]   # la stima usa la prima scelta
                st, _, _ = stima_ricetta(ing_st, porz)
                if st and 40 <= st['kcal'] <= 1500:
                    x['nutr'] = st; x['porzioni'] = porz; x['stimata'] = True; c['stimati'] += 1
            if col_parlato(x, par) and not x.get('suoi'):
                stima_su(x)   # C150: dosi dal parlato → «≈ stimati»
            if 'nutr' not in x:
                c['senza'] += 1
            c['ricette'] += 1
            tutte.append(x)
            if elenco:
                n = x.get('nutr')
                print('  SÌ  ', f"{x['tipo'][:12]:12} {x['nome'][:34]:34} ing {len(ing):2} {'suoi' if x.get('suoi') else 'stim' if x.get('stimata') else '----'}"
                      f" {round(n['kcal']) if n else '':>5} kcal {n['prot'] if n else '':>5} p  ← {v['titolo'][:50]!r}")
    distingui(tutte)
    segna_altro(tutte)
    tutte.sort(key=lambda x: (x['autore'], x['data']), reverse=True)
    canali = {a: 'https://www.youtube.com/channel/' + c for a, c in CANALI}
    oggi = time.strftime('%d/%m/%Y')
    righe = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in tutte)
    open(os.path.join(RADICE, 'ricette-video.js'), 'w', encoding='utf-8').write(
        f"""/* C144 · Ricette video di YouTube, divise per youtuber, raccolte da Claude il {oggi} (Mario 11/11 «tutti i video delle
   ricette dello youtuber… in una sezione a parte»). Scritto da tools/raccogli_video.py, NON a mano.
   Nome, ingredienti e testo come li scrive l'autore sotto il video (tolti hashtag, codici sconto e link); senza dosi sotto, dosi e passi dal parlato del video («parlato», C150).
   Valori: quelli dell'autore se li scrive («suoi»), sennò «≈ stimati» dagli ingredienti (tabella CREA, tools/stima.py), sennò niente. */
const CANALI_VIDEO = {json.dumps(canali, ensure_ascii=False)};
const RICETTE_VIDEO = [
{righe}
];
""")
    print(json.dumps(conti, ensure_ascii=False), file=sys.stderr)


if __name__ == '__main__':
    main()
