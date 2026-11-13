#!/usr/bin/env python3
"""C150 (Mario 13/11 «dalle parole che dicono ti prendi il testo e ci fai la ricetta… per ogni singolo video»; «1 faccio la chiave»).
Per ogni ricetta video chiede a Gemini di Google (API ufficiale, link pubblico di YouTube: Google ascolta e guarda il video)
il testo di quello che dice e, SOLO da quello, porzioni, ingredienti con le dosi, passi e valori se li dice (mai inventati, PT E25).
Gira nelle sessioni di Claude, mai sul server dell'app (Mario 13/11 ~09:45). Chiave: variabile d'ambiente GEMINI_API_KEY (mai stampata).
Esce tools/dati/video-dal-parlato.json (id → ricetta dal parlato): file NON del sito (non pubblica nulla); il testo intero del video
resta solo nel contenitore (.cache-stime/gemini/), mai su GitHub (è parlato dei creatori).
Ordine: prima i video senza valori, poi quelli senza dosi, poi gli altri. Al limite gratuito (429: 8 ore di video al giorno) si ferma
e salva: rilanciarlo riparte da dove era.
Uso: python3 -I tools/trascrivi_video.py [--da ricette-video.js] [--quanti N] [--modello gemini-…] [--finto]
     --finto: nessuna chiamata a Google, risposta di prova (per le prove dello strumento)."""
import json, os, re, subprocess, sys, time

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(RADICE, '.cache-stime', 'gemini')
USCITA = os.path.join(RADICE, 'tools', 'dati', 'video-dal-parlato.json')
API = 'https://generativelanguage.googleapis.com/v1beta/'

DOMANDA = """Questo è un video di una ricetta. Guardalo e ascoltalo tutto.
1. In «testo» scrivi parola per parola quello che dice chi parla (in italiano come lo dice).
2. Poi, SOLO da quello che dice o che compare scritto nel video, compila gli altri campi:
   - «ricetta»: false se nel video non si prepara un piatto (recensione, prova di un prodotto, allenamento, chiacchiere).
   - «porzioni»: per quante porzioni o pezzi sono le dosi dette; null se non lo dice.
   - «ingredienti»: uno per riga, con la quantità come la dice, in grammi o millilitri se li dice (es. «100 g di albume», «1 uovo», «5 g di cacao»).
     Se di un ingrediente non dice la quantità, scrivi solo il nome. Niente attrezzi.
   - «passi»: i passaggi in italiano semplice, frasi corte, nell'ordine del video, con tempi e temperature se li dice.
   - «valori»: kcal, proteine, carboidrati, grassi in grammi PER PORZIONE solo se li dice o li mostra scritti; sennò null.
NON inventare niente: quello che non dice o non mostra resta null o fuori. Non aggiungere consigli tuoi."""

SCHEMA = {'type': 'OBJECT', 'properties': {
    'ricetta': {'type': 'BOOLEAN'},
    'testo': {'type': 'STRING'},
    'porzioni': {'type': 'INTEGER', 'nullable': True},
    'ingredienti': {'type': 'ARRAY', 'items': {'type': 'STRING'}},
    'passi': {'type': 'ARRAY', 'items': {'type': 'STRING'}},
    'valori': {'type': 'OBJECT', 'nullable': True, 'properties': {
        'kcal': {'type': 'NUMBER', 'nullable': True}, 'prot': {'type': 'NUMBER', 'nullable': True},
        'carb': {'type': 'NUMBER', 'nullable': True}, 'grassi': {'type': 'NUMBER', 'nullable': True}}}},
    'required': ['ricetta', 'testo', 'ingredienti', 'passi']}

FINTO = {'ricetta': True, 'testo': 'Oggi facciamo dei pancake proteici: 100 grammi di albume, 40 grammi di farina di avena…',
         'porzioni': 1, 'ingredienti': ['100 g di albume', '40 g di farina di avena', '1 cucchiaino di lievito'],
         'passi': ['Frulla albume, avena e lievito.', 'Cuoci in padella antiaderente 2 minuti per lato.'],
         'valori': {'kcal': 210, 'prot': 16, 'carb': 26, 'grassi': 3}}


def chiave():
    k = (os.environ.get('GEMINI_API_KEY') or '').strip()   # spazio in fondo come YOUTUBE_API_KEY (11/11): sempre trim
    if not k:
        sys.exit('Manca GEMINI_API_KEY nelle impostazioni dell\'ambiente (vale dalla sessione nuova).')
    return k


def chiama(metodo, percorso, corpo=None, attesa=300):
    """curl (passa dal proxy del contenitore); la chiave va nell'header, mai nella riga di comando visibile nei log."""
    cmd = ['curl', '-s', '-m', str(attesa), '-w', '\n%{http_code}', '-X', metodo, '-H', 'Content-Type: application/json', '-H', '@-']
    if corpo is not None:
        cmd += ['--data-binary', json.dumps(corpo, ensure_ascii=False)]
    r = subprocess.run(cmd + [API + percorso], input='x-goog-api-key: ' + chiave() + '\n', capture_output=True, text=True)
    testo, _, codice = r.stdout.rpartition('\n')
    return int(codice or 0), testo


def modelli_flash():
    """I Flash che il progetto può usare, dal più nuovo (niente lite, anteprime, immagini o voce); GEMINI_MODELLO ne forza uno.
    Più di uno perché il più nuovo a volte è pieno (503 «high demand», 13/11 #72: 5 su 5 col 3.8) e il limite gratis è per modello."""
    if os.environ.get('GEMINI_MODELLO'):
        return [os.environ['GEMINI_MODELLO']]
    c, t = chiama('GET', 'models?pageSize=200', attesa=30)
    if c != 200:
        sys.exit(f'Elenco dei modelli rifiutato da Google (codice {c}): {t[:300]}')
    nomi = [m['name'].split('/')[-1] for m in json.loads(t).get('models', []) if 'generateContent' in m.get('supportedGenerationMethods', [])]
    flash = [n for n in nomi if re.fullmatch(r'gemini-(\d+(?:\.\d+)?)-flash', n)]
    if not flash:
        sys.exit('Nessun modello «gemini-N-flash» fra: ' + ', '.join(nomi[:30]))
    return sorted(flash, key=lambda n: float(re.search(r'(\d+(?:\.\d+)?)', n).group(1)), reverse=True)


def leggi_video(f):
    t = open(f, encoding='utf-8').read()
    i = t.index('const RICETTE_VIDEO = [') + len('const RICETTE_VIDEO = ') if 'const RICETTE_VIDEO = [' in t else t.index('[')
    fine = t.index('\n];', i) + 2 if '\n];' in t[i:] else t.rindex(']') + 1
    return json.loads(t[i:fine])


def con_dosi(x):
    return sum(bool(re.search(r'\d', str(i))) for i in (x.get('ingredienti') or [])) >= 2


def ordine(vv):
    return sorted(vv, key=lambda x: (bool(x.get('nutr')), con_dosi(x)))   # prima senza valori, poi senza dosi


def buona(r):
    """Una risposta entra solo se è una ricetta con almeno 2 ingredienti con la dose e almeno un passo."""
    if not isinstance(r, dict) or not r.get('ricetta'):
        return False
    ing = [i for i in r.get('ingredienti') or [] if isinstance(i, str) and i.strip()]
    return sum(bool(re.search(r'\d', i)) for i in ing) >= 2 and any(len(p.strip()) >= 8 for p in r.get('passi') or [])


def main():
    a = sys.argv
    da = a[a.index('--da') + 1] if '--da' in a else os.path.join(RADICE, 'ricette-video.js')
    quanti = int(a[a.index('--quanti') + 1]) if '--quanti' in a else 10 ** 6
    finto = '--finto' in a
    uscita = os.environ.get('VIDEO_PARLATO', USCITA)
    os.makedirs(CACHE, exist_ok=True); os.makedirs(os.path.dirname(uscita), exist_ok=True)
    fatti = json.load(open(uscita, encoding='utf-8')) if os.path.exists(uscita) else {}
    modelli = [a[a.index('--modello') + 1]] if '--modello' in a else (['finto'] if finto else modelli_flash())
    m = 0   # indice del modello in uso: su 503 ripetuti o 429 si passa al Flash precedente
    da_fare = [x for x in ordine(leggi_video(da)) if x['id'] not in fatti][:quanti]
    conti = {'chiesti': 0, 'ricette': 0, 'scartati': 0, 'errori': 0}
    print(f'modelli {", ".join(modelli)} · da fare {len(da_fare)} · già fatti {len(fatti)}', file=sys.stderr)
    for x in da_fare:
        url = x['url']
        corpo = {'contents': [{'parts': [{'file_data': {'file_uri': url}}, {'text': DOMANDA}]}],
                 'generationConfig': {'responseMimeType': 'application/json', 'responseSchema': SCHEMA, 'temperature': 0}}
        if finto:
            c, r = 200, dict(FINTO)
        else:
            prove = 0
            while True:
                c, t = chiama('POST', f'models/{modelli[m]}:generateContent', corpo)
                if c == 503 and prove == 0:          # pieno: aspetto e riprovo una volta
                    prove = 1; time.sleep(30); continue
                if c in (503, 429) and m + 1 < len(modelli):   # ancora pieno o limite di oggi: Flash precedente
                    print(f'{modelli[m]}: codice {c}, passo a {modelli[m + 1]}', file=sys.stderr)
                    m += 1; prove = 0; continue
                break
            if c == 429:
                print('Limite gratuito di oggi raggiunto su tutti i modelli (429): mi fermo, il resto domani.', file=sys.stderr)
                break
            if c != 200:
                conti['errori'] += 1
                print(f'{x["id"]}: codice {c} {t[:200]}', file=sys.stderr)
                if conti['errori'] >= 5 and not conti['ricette']:
                    sys.exit('5 errori di fila senza una ricetta: mi fermo (controlla chiave e modello).')
                continue
            try:
                parti = json.loads(t)['candidates'][0]['content']['parts']
                r = json.loads(''.join(p.get('text', '') for p in parti))
            except Exception:
                conti['errori'] += 1; continue
            time.sleep(4)   # gentile coi limiti al minuto del piano gratis
        conti['chiesti'] += 1
        modello = modelli[m]
        json.dump({'url': url, 'modello': modello, 'risposta': r}, open(os.path.join(CACHE, x['id'].replace(':', '_') + '.json'), 'w', encoding='utf-8'), ensure_ascii=False)
        if buona(r):
            v = r.get('valori') or {}
            fatti[x['id']] = {'porzioni': r.get('porzioni') or None, 'ingredienti': [i.strip() for i in r['ingredienti'] if i.strip()],
                              'passi': [p.strip() for p in r['passi'] if p.strip()],
                              'valori': {k: v[k] for k in ('kcal', 'prot', 'carb', 'grassi') if v.get(k) is not None} or None,
                              'modello': modello, 'data': time.strftime('%Y-%m-%d')}
            conti['ricette'] += 1
        else:
            fatti[x['id']] = {'scartato': 'non è una ricetta' if isinstance(r, dict) and r.get('ricetta') is False else 'senza dosi o passi',
                              'modello': modello, 'data': time.strftime('%Y-%m-%d')}
            conti['scartati'] += 1
        json.dump(fatti, open(uscita, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)   # salvo a ogni video
    print(json.dumps(conti, ensure_ascii=False))


if __name__ == '__main__':
    main()
