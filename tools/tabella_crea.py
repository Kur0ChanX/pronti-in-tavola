#!/usr/bin/env python3
"""C141 pezzo 1 (Mario 11/11 sera: «apriamo le porte… valori non verificati… prova a stimarli tu»).
Scarica la tabella ufficiale CREA (alimentinutrizione.it, «Tabelle di composizione degli alimenti, aggiornamento 2019»,
fonte da citare) e scrive tools/dati/alimenti.json: per ogni alimento i valori per 100 g di parte edibile.
Gira sul computer di Claude, mai sul server. Pagine tenute in .cache-crea/ (rilanciarlo non rilegge il sito).
Uso: python3 -I tools/tabella_crea.py
Saturi: la scheda dà la % sugli acidi grassi; grammi = lipidi × 0,94 × % / 100 (0,94 = quota di acidi grassi nei lipidi, stima). """
import html, json, os, re, subprocess, sys, time

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(RADICE, '.cache-crea')
BASE = 'https://www.alimentinutrizione.it/tabelle-nutrizionali'
UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36'
os.makedirs(CACHE, exist_ok=True)


def pagina(nome, url):
    f = os.path.join(CACHE, nome + '.html')
    if os.path.exists(f):
        return open(f, encoding='utf-8', errors='replace').read()
    time.sleep(0.7)
    try:
        t = subprocess.run(['curl', '-sL', '-m', '30', '-A', UA, url], capture_output=True, timeout=40).stdout.decode('utf-8', 'replace')
    except Exception:
        return ''
    if len(t) > 5000:
        open(f, 'w', encoding='utf-8').write(t)
    return t


def pulito(x):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', x))).strip()


def numero(x):
    x = x.replace(',', '.').strip()
    if x in ('tr', 'tr.'):
        return 0.0
    try:
        return float(x)
    except ValueError:
        return None


CAMPI = {'Energia (kcal)': 'kcal', 'Proteine (g)': 'prot', 'Lipidi (g)': 'grassi', 'Carboidrati disponibili (g)': 'carb',
         'Zuccheri solubili (g)': 'zuc', 'Fibra totale (g)': 'fibra', 'Sodio (mg)': 'sodio', 'Acidi grassi Saturi (%)': 'satPerc'}


def scheda(codice):
    t = pagina(codice, f'{BASE}/{codice}')
    v = {}
    for r in re.findall(r'<tr[^>]*>(.*?)</tr>', t, re.S):
        c = [pulito(x) for x in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]
        if len(c) > 2 and c[0] in CAMPI and CAMPI[c[0]] not in v:
            n = numero(c[2])
            if n is not None:
                v[CAMPI[c[0]]] = n
        if len(c) > 1 and c[0] == 'Categoria':
            v['categoria'] = c[1]
    return v


def main():
    alfa = pagina('elenco', f'{BASE}/ricerca-per-ordine-alfabetico')
    elenco = re.findall(r'href="/tabelle-nutrizionali/(\d{6})"[^>]*>\s*(.*?)\s*<span', alfa, re.S)
    if len(elenco) < 500:
        sys.exit(f'elenco CREA troppo corto: {len(elenco)}')
    out = []
    for i, (cod, nome) in enumerate(elenco):
        nome = pulito(nome).strip('"|')
        v = scheda(cod)
        if 'kcal' not in v or 'prot' not in v:
            continue
        if 'satPerc' in v and v.get('grassi') is not None:
            v['saturi'] = round(v['grassi'] * 0.94 * v.pop('satPerc') / 100, 2)
        out.append({'nome': nome, 'codice': cod, 'fonte': 'CREA', **v})
        if i % 100 == 0:
            print(f'… {i}/{len(elenco)}', file=sys.stderr)
    os.makedirs(os.path.join(RADICE, 'tools', 'dati'), exist_ok=True)
    json.dump({'fonte': 'CREA Centro di ricerca Alimenti e Nutrizione, Tabelle di composizione degli alimenti (agg. 2019), www.alimentinutrizione.it',
               'alimenti': out}, open(os.path.join(RADICE, 'tools', 'dati', 'alimenti.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(json.dumps({'alimenti': len(out), 'senzaSaturi': sum('saturi' not in a for a in out), 'senzaZuccheri': sum('zuc' not in a for a in out)}))


if __name__ == '__main__':
    main()
