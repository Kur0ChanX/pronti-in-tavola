#!/usr/bin/env python3
"""Driver d'unione di git per i file JSON delle impostazioni (E325, 10/11: un merge con conflitto in .claude/settings.json
ha lasciato il file non valido = divieti spenti finché non era risolto).

Uso (lo chiama git, driver «impostazioni» in .gitattributes; lo registra avvio-check.py a ogni avvio):
  python3 -I tools/unisci-json.py %O %A %B     O = antenato comune, A = il nostro (qui va il risultato), B = il loro

Unione a tre vie chiave per chiave: cambiato da una parte sola = quel lato; dizionari ricorsivi; liste della stessa
lunghezza posizione per posizione (es. un gruppo di hook cambiato dai due lati), altrimenti elemento per elemento
(aggiunte dei due lati tenute, tolte da un lato tolte); stesso valore cambiato in modo diverso dai due lati = il LORO
(B) + avviso su stderr. Il risultato è SEMPRE un JSON valido: se il nostro non si legge si tiene il loro (uscita 1:
git segna il conflitto da guardare); se nessuno dei due si legge si lascia com'è (uscita 1). Uscita 0 = unito.
"""
import json
import sys

MANCA = object()  # chiave assente da quel lato


def chiave(x):
    return json.dumps(x, sort_keys=True, ensure_ascii=False)


def unisci(o, a, b, percorso, avvisi):
    if chiave_o(a) == chiave_o(b):
        return a
    if chiave_o(a) == chiave_o(o):
        return b
    if chiave_o(b) == chiave_o(o):
        return a
    if isinstance(a, dict) and isinstance(b, dict):
        base = o if isinstance(o, dict) else {}
        esito = {}
        for k in list(a) + [k for k in b if k not in a]:
            v = unisci(base.get(k, MANCA), a.get(k, MANCA), b.get(k, MANCA), f"{percorso}.{k}", avvisi)
            if v is not MANCA:
                esito[k] = v
        return esito
    if isinstance(a, list) and isinstance(b, list):
        base = o if isinstance(o, list) else []
        if len(base) == len(a) == len(b):
            return [unisci(base[i], a[i], b[i], f"{percorso}[{i}]", avvisi) for i in range(len(a))]
        in_o, in_a, in_b = ({chiave(x) for x in lista} for lista in (base, a, b))
        tenuti = [x for x in a if not (chiave(x) in in_o and chiave(x) not in in_b)]
        return tenuti + [x for x in b if chiave(x) not in in_a and chiave(x) not in in_o]
    avvisi.append(f"{percorso or '(tutto)'}: cambiato dai due lati, tengo il loro ({riassunto(b)}; il nostro era {riassunto(a)})")
    return b


def chiave_o(x):
    return "\0manca" if x is MANCA else chiave(x)


def riassunto(x):
    return "tolto" if x is MANCA else chiave(x)[:60]


def leggi(percorso):
    try:
        with open(percorso, encoding="utf-8") as f:
            testo = f.read()
    except OSError:
        return None, None
    try:
        return testo, (json.loads(testo) if testo.strip() else MANCA)
    except ValueError:
        return testo, None


def main(argv):
    if len(argv) != 4:
        print("Uso: python3 -I tools/unisci-json.py %O %A %B", file=sys.stderr)
        return 2
    _, p_o, p_a, p_b = argv
    _, o = leggi(p_o)
    testo_a, a = leggi(p_a)
    testo_b, b = leggi(p_b)
    if a is None or a is MANCA:
        if b is None or b is MANCA:
            print(f"unisci-json: {p_a} e il loro non si leggono: lascio il nostro, da guardare (E325)", file=sys.stderr)
            return 1
        with open(p_a, "w", encoding="utf-8") as f:
            f.write(testo_b)
        print("unisci-json: il nostro non si legge: tengo il loro (valido), conflitto da guardare (E325)", file=sys.stderr)
        return 1
    if b is None or b is MANCA:
        print("unisci-json: il loro non si legge: tengo il nostro (valido), conflitto da guardare (E325)", file=sys.stderr)
        return 1
    avvisi = []
    esito = unisci(MANCA if o is None else o, a, b, "", avvisi)
    if chiave(esito) == chiave(a):
        testo = testo_a
    elif chiave(esito) == chiave(b):
        testo = testo_b
    else:
        testo = json.dumps(esito, ensure_ascii=False, indent=2) + "\n"
    with open(p_a, "w", encoding="utf-8") as f:
        f.write(testo)
    for riga in avvisi:
        print(f"unisci-json (E325): {riga}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
