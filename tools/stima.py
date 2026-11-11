#!/usr/bin/env python3
"""C141 pezzo 2 (Mario 11/11 sera: «valori non verificati… prova a stimarli tu… attento: il cetriolo non fa parte dei dolci»).
Riga d'ingrediente → (alimento, grammi) → valori per porzione, con la tabella CREA (tools/dati/alimenti.json, pezzo 1)
e i prodotti proteici da etichetta (PRODOTTI, sotto). Dice anche se la ricetta è dolce o salata.
Uso come modulo: from stima import stima_ricetta, dolce_o_salato. Prova: python3 -I tools/stima.py --prova """
import json, os, re, sys, unicodedata

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def norm(s):
    s = unicodedata.normalize('NFD', str(s).lower())
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in s if unicodedata.category(c) != 'Mn'))).strip()

# Prodotti proteici che CREA non ha: valori medi d'etichetta per 100 g (Open Food Facts, prodotti venduti in Italia, 11/2026).
# kcal, prot, carb, zuc, grassi, saturi, sodio(mg)
PRODOTTI = {
    'proteine in polvere': (380, 78, 7, 4, 6, 3.5, 250),   # whey al gusto (vaniglia, cioccolato)
    'philadelphia protein': (95, 12, 4, 4, 3.5, 2.3, 300),
    'skyr': (63, 11, 4, 4, 0.2, 0.1, 40),
    'yogurt greco 0': (57, 10, 3.8, 3.8, 0.2, 0.1, 40),
    'yogurt greco': (97, 9, 4, 4, 5, 3.3, 40),
    'yogurt proteico': (60, 10, 4, 4, 0.3, 0.2, 50),
    'budino proteico': (85, 10, 6, 4, 2.2, 1.5, 120),
    'crema proteica': (520, 21, 33, 7, 37, 9, 200),
    'quark': (67, 12, 4, 4, 0.2, 0.1, 40),
    'albume': (43, 10.7, 0.8, 0.8, 0.2, 0, 166),
    'fiocchi di latte': (100, 12, 3.5, 3.5, 4.3, 2.8, 380),
    'dolcificante': (0, 0, 0, 0, 0, 0, 0),
    'eritritolo': (0, 0, 0, 0, 0, 0, 0),
    'stevia': (0, 0, 0, 0, 0, 0, 0),
    'farina di avena': (372, 13, 60, 1.2, 7, 1.3, 2),
    'cioccolato fondente 85': (600, 11, 19, 12, 50, 30, 15),
    'gocce di cioccolato senza zucchero': (480, 7, 52, 1, 30, 18, 20),
    'latte di mandorla': (13, 0.4, 0.1, 0.1, 1.1, 0.1, 50),
    'amido di mais': (348, 0.3, 86, 0, 0.1, 0, 10),
    'bevanda vegetale': (35, 1, 4, 3, 1.5, 0.2, 40),
    'proteine vegane': (380, 72, 8, 2, 8, 1.5, 900),
    'farina proteica': (360, 35, 40, 4, 5, 1, 50),
    'cacao amaro': (355, 20, 11.5, 0.5, 25.6, 15, 20),
}
# parole della riga → prodotto (o nome CREA); le prime che combaciano vincono
SINONIMI = [
    (r'\b(whey|proteine? in polvere|proteine (alla |al gusto )?(vaniglia|cioccolato|cacao|fragola|biscotto)|scoop|misurin|isolat[eo]|protein powder)', 'proteine in polvere'),
    (r'\bproteine? vegan', 'proteine vegane'), (r'farina proteica|protein flour', 'farina proteica'),
    (r'philadelphia.*prote|philadelphia protein', 'philadelphia protein'), (r'\bskyr\b', 'skyr'),
    (r'yogurt greco (0|zero|magro|light)|greco 0', 'yogurt greco 0'), (r'yogurt greco', 'yogurt greco'),
    (r'yogurt proteic|yopro|hipro', 'yogurt proteico'), (r'budino proteic|dessert proteic', 'budino proteico'),
    (r'crema (spalmabile )?proteic', 'crema proteica'), (r'\bquark\b', 'quark'),
    (r'album|chiar[ae] d uovo', 'albume'), (r'fiocchi di latte|cottage', 'fiocchi di latte'),
    (r'dolcificant|eritritol|stevia|sucralos|xilitol', 'dolcificante'),
    (r'farina d[i ]* ?avena|avena (frullat|tritat|macinat)|fiocchi d[i ]* ?avena|avena', 'farina di avena'),
    (r'cioccolato fondente (85|90|99)', 'cioccolato fondente 85'), (r'gocce di cioccolato.*(senza zucc|sugar free)', 'gocce di cioccolato senza zucchero'),
    (r'latte di mandorl|bevanda (alla |di )?mandorl', 'latte di mandorla'), (r'bevanda (vegetale|di soia|di riso|d avena)', 'bevanda vegetale'),
    (r'amido di mais|maizena|fecola', 'amido di mais'), (r'cacao amaro|cacao in polvere|\bcacao\b', 'cacao amaro'),
]
# pesi tipici (g) per le righe senza grammi
PEZZI = [(r'\buov[ao]\b|\buova\b', 55), (r'album', 33), (r'tuorl', 18), (r'banan', 120), (r'mel[ae]\b', 150), (r'pera|pere\b', 150),
         (r'vasett', 125), (r'scoop|misurin', 30), (r'fett[ae] di pane', 30), (r'fett[ae] biscottat', 10), (r'datter', 8), (r'noc[ei]\b', 5),
         (r'petto di pollo', 150), (r'filett', 150), (r'scatolett', 80), (r'tortill|piadin', 60), (r'limon', 0), (r'spicchi?', 3)]
MISURE = [(r'cucchiain', 5), (r'cucchiai|cucchiaio', 15), (r'tazz', 200), (r'bicchier', 200), (r'pizzic|q\.?b|quanto basta|a piacere|un filo|spruzz', 0)]

# Mario: «il cetriolo non fa parte dei dolci». Dolce = almeno una parola dolce e NESSUNA salata (provato sull'elenco vero, PT E65).
DOLCI = r'dolcific|eritrit|stevia|zucchero|miele|sciroppo|cacao|cioccolat|vanigl|cannella|marmellat|confettur|nutell|crema proteic|frutti di bosco|fragol|mirtill|lampon|banan|mela\b|mele\b|pera\b|pesc[ah]\b|albicocc|ananas|mango|datter|uvetta|cocco|nocciol|mandorl|pistacch|burro d[i ]* ?arachid|lievito per dolci|lievito vanigliato|biscott|savoiard|amaretti|caff[eè]\b'
SALATI = r'cetriol|cipoll|aglio|scalogn|porr|tonno|salmon|pollo|tacchin|manzo|maiale|prosciutt|bresaol|speck|salam|pancett|wurstel|acciug|gamber|merluzz|pesce|carne|pomodor|passata|zucchin|melanzan|peperon|spinac|broccol|cavol|funghi|patat|insalat|rucola|lattug|olive\b|capperi|parmigian|grana\b|pecorin|mozzarell|feta|origano|rosmarin|basilic|prezzemol|pepe\b|curry|paprica|senape|maionese|ketchup|salsa di soia|brodo|dado|ceci|lenticch|fagiol|pasta\b|riso\b|spaghett|fusill|penne'


def _tabella():
    p = os.path.join(RADICE, 'tools', 'dati', 'alimenti.json')
    crea = json.load(open(p, encoding='utf-8'))['alimenti'] if os.path.exists(p) else []
    for a in crea:
        a['_n'] = norm(a['nome'])
    return crea

CREA = _tabella()
K = ('kcal', 'prot', 'carb', 'zuc', 'grassi', 'saturi', 'sodio')


def alimento(testo):
    """nome dell'ingrediente → (valori per 100 g, fonte) o None"""
    t = norm(testo)
    for rx, nome in SINONIMI:
        if re.search(rx, t):
            return dict(zip(K, PRODOTTI[nome])), 'etichetta: ' + nome
    parole = [w for w in t.split() if len(w) > 2 and not re.match(r'^\d', w) and w not in ('del', 'della', 'con', 'per', 'senza', 'fresco', 'fresca', 'grattugiat', 'g', 'gr', 'ml')]
    if not parole:
        return None
    meglio, punti = None, 0
    for a in CREA:
        n = a['_n'].split()
        p = sum(2 if w == (n[0] if n else '') else 1 for w in parole if any(x.startswith(w[:5]) for x in n))
        if p == 0:
            continue
        p -= 0.15 * max(0, len(n) - len(parole))          # più corto = più generico = meglio («Latte di vacca, intero» batte «Latte… UHT…»)
        if 'crud' in a['_n'] or 'intero' in a['_n']:
            p += 0.1
        if p > punti:
            meglio, punti = a, p
    if not meglio or punti < 1.5 and len(parole) > 1:
        return None
    v = {k: meglio.get(k) for k in K}
    if v['saturi'] is None:
        v['saturi'] = round((v.get('grassi') or 0) * 0.3, 2)   # manca nella scheda: 30 % dei grassi (stima prudente)
    for k in K:
        if v[k] is None:
            v[k] = 0
    return v, 'CREA ' + meglio['codice'] + ' ' + meglio['nome']


def grammi(riga):
    """«200 g yogurt greco» → (200, 'yogurt greco'); «2 albumi» → (66, 'albumi'); «q.b. sale» → (0, 'sale')"""
    r = norm(riga.replace(',', '.'))
    r0 = riga.lower().replace(',', '.')
    m = re.search(r'(\d+(?:\.\d+)?)\s*(kg|g|gr|grammi|ml|cl|l)\b', r0)
    if m:
        q = float(m.group(1)) * {'kg': 1000, 'l': 1000, 'cl': 10}.get(m.group(2), 1)
        return q, re.sub(r'(\d+(?:\.\d+)?)\s*(kg|g|gr|grammi|ml|cl|l)\b', ' ', r0)
    num = re.search(r'(\d+(?:\.\d+)?)|\b(un|una|uno|mezzo|mezza)\b', r)
    n = float(num.group(1)) if num and num.group(1) else (0.5 if num and num.group(2) in ('mezzo', 'mezza') else 1)
    for rx, g in MISURE:
        if re.search(rx, r):
            return n * g, r
    for rx, g in PEZZI:
        if re.search(rx, r):
            return n * g, r
    return None, r


def porzioni(resa):
    m = re.search(r'\d+', str(resa or ''))
    return max(1, min(20, int(m.group()))) if m else None


def stima_ricetta(ingredienti, n_porzioni):
    """→ (valori per porzione, dettagli, quota di peso non riconosciuta) o (None, motivo, …)"""
    tot = dict.fromkeys(K, 0.0)
    peso = ignoto = 0.0
    dett = []
    for riga in ingredienti:
        g, resto = grammi(riga)
        if re.search(r'\b(sale|acqua|ghiaccio|lievito|bicarbonato|aroma|scorza|buccia|vanillina|cannella|spezie)\b', norm(riga)) and (g is None or g <= 10):
            continue   # pesano poco o niente (il sale lo conta il sodio solo se ha i grammi)
        if g is None:
            ignoto += 30; dett.append((riga, None, 'quantità?')); continue
        if g == 0:
            continue
        a = alimento(resto)
        peso += g
        if not a:
            ignoto += g; dett.append((riga, g, 'alimento?')); continue
        v, fonte = a
        for k in K:
            tot[k] += v[k] * g / 100
        dett.append((riga, g, fonte))
    if peso + ignoto == 0:
        return None, 'niente ingredienti', 1
    quota = ignoto / (peso + ignoto)
    if quota > 0.15:
        return None, dett, quota
    n = n_porzioni or 1
    return {k: round(tot[k] / n, 1) for k in K}, dett, quota


def dolce_o_salato(nome, ingredienti):
    t = norm(nome + ' ' + ' '.join(ingredienti))
    s = re.findall(SALATI, t)
    if s:
        return 'salato', s[:3]
    d = re.findall(DOLCI, t)
    return ('dolce', d[:3]) if d else ('neutro', [])


if __name__ == '__main__' and '--prova' in sys.argv:
    print('alimenti CREA:', len(CREA))
    ing = ['4 uova intere', '200 g yogurt greco', 'Dolcificante alla vaniglia', 'Scorza di limone grattuggiata', '50 g amido di mais', 'Gocce di cioccolato, queste senza zuccheri io 30 g']
    v, d, q = stima_ricetta(ing, 2)
    print('Pietrobon «Torta a colazione» metà: stima', v, 'quota ignota', round(q, 2), '· lui dice 335 kcal, 23,5 g prot, 33,5 carbo, 13 grassi')
    for x in d:
        print('  ', x)
    print(dolce_o_salato('Insalata di cetrioli e yogurt', ['1 cetriolo', '150 g yogurt greco']))
    print(dolce_o_salato('Cremini', ing))
