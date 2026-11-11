# C141: misura la stima (tools/stima.py) contro le ricette di GialloZafferano coi valori veri (pagine in .cache-fit/). Uso: python3 -I tools/valida_stima.py
import json, os, re, sys, glob, html
sys.path.insert(0, '/home/user/pronti-in-tavola/tools')
from stima import stima_ricetta, porzioni
def ld(t):
    for m in re.finditer(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', t, re.S):
        try: d = json.loads(m.group(1))
        except Exception: continue
        for x in (d if isinstance(d, list) else d.get('@graph', [d])):
            if isinstance(x, dict) and 'Recipe' in str(x.get('@type')): return x
def num(x):
    m = re.search(r'[\d.,]+', str(x or '')); return float(m.group().replace(',', '.')) if m else None
err = {'kcal': [], 'prot': []}; n = rif = 0
for f in glob.glob('/home/user/pronti-in-tavola/.cache-fit/*.html'):
    t = open(f, errors='replace').read(); r = ld(t)
    if not r or not r.get('nutrition') or not r.get('recipeIngredient') or 'blog.giallozafferano' in t[:3000] and False: continue
    nu = r['nutrition']
    if '100 g' in str(nu.get('servingSize', '')): continue
    p = porzioni(r.get('recipeYield'))
    v, d, q = stima_ricetta([html.unescape(i) for i in r['recipeIngredient']], p)
    n += 1
    if not v: continue
    rif += 1
    for k, c in (('kcal', 'calories'), ('prot', 'proteinContent')):
        vero = num(nu.get(c))
        if vero: err[k].append(abs(v[k] - vero) / vero)
import statistics as s
print('pagine con valori', n, 'stimate', rif)
for k, e in err.items():
    if e: print(k, 'errore mediano', round(s.median(e) * 100), '%', '· entro 20%:', round(sum(x <= .2 for x in e) / len(e) * 100), '%')
