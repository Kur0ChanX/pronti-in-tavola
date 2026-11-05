#!/usr/bin/env python3
# Controllo conflitti di una regola nuova (skill nuova-regola, Mario 23/10: «prima di scrivere cerca la regola»).
# Cerca le parole (basta una) nei posti dove vivono le regole e stampa righe corte «file:riga: …testo intorno…»,
# al massimo 40, così anche i file con righe lunghissime costano poco. Non cambia niente.
# Uso: python3 -I tools/cerca-regola.py parola [parola…]   (2-3 parole e sinonimi della regola, senza maiuscole)
import glob, os, re, sys

RADICE = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTI = ["CLAUDE.md", "docs/kit-progetto/REGOLE.md", "docs/PREFERENZE-CLAUDE.md", "docs/ERRORI.md",
         ".claude/settings.json", ".claude/skills/*/*.md", ".claude/rules/*.md", ".claude/hooks/*.py", ".claude/agents/*.md"]
TETTO = 40
INTORNO = 70


def file_delle_regole():
    visti = []
    for posto in POSTI:
        for p in sorted(glob.glob(os.path.join(RADICE, posto))):
            if os.path.isfile(p) and p not in visti:
                visti.append(p)
    return visti


def main(parole):
    if not parole:
        sys.exit("Uso: python3 -I tools/cerca-regola.py parola [parola…]")
    cerca = re.compile("|".join(re.escape(p) for p in parole), re.I)
    trovate, per_file = [], {}
    for p in file_delle_regole():
        rel = os.path.relpath(p, RADICE)
        with open(p, encoding="utf-8", errors="replace") as f:
            for n, riga in enumerate(f, 1):
                m = cerca.search(riga)
                if not m:
                    continue
                per_file[rel] = per_file.get(rel, 0) + 1
                a, b = max(0, m.start() - INTORNO), min(len(riga.rstrip("\n")), m.end() + INTORNO)
                pezzo = ("…" if a else "") + riga[a:b].strip() + ("…" if b < len(riga.rstrip("\n")) else "")
                trovate.append(f"{rel}:{n}: {pezzo}")
    if not trovate:
        print(f"Nessuna regola con {', '.join(parole)}: la regola è nuova (controlla anche un sinonimo).")
        return
    for t in trovate[:TETTO]:
        print(t)
    if len(trovate) > TETTO:
        print(f"… altre {len(trovate) - TETTO} righe: usa parole più precise.")
    print("Per file: " + ", ".join(f"{k} {v}" for k, v in per_file.items()))


if __name__ == "__main__":
    main(sys.argv[1:])
