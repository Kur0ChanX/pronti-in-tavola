#!/usr/bin/env python3
# Pulizia mensile dei rami di scorta su GitHub (C352, Mario 30/10 «consigliato»: scelta 1).
# Le scorte (scorta-<ruolo>-<AAAAMMGG>-<id>/<ramo>, …/<ramo>-ferma-<AAAAMMGG-HHMMSS>-<xxxx>) crescono di ~20 al giorno
# e non si cancellano mai da sole: in un mese sono centinaia. Qui si tolgono SOLO quelle che insieme sono:
#   - più vecchie di GIORNI (la data sta nel nome: niente da scaricare per saperlo);
#   - già tutte nel ramo di lavoro (merge-base --is-ancestor): cancellarle non perde una riga.
# Tutto il resto resta: i due nomi vecchi senza data (scorta-<ruolo>/<ramo>), le scorte recenti, le vecchie con lavoro non
# nel ramo (vengono elencate: le guarda una persona), i rami-copia versione-vNN e ogni altro ramo.
# Uso: python3 -I tools/pulisci-scorte.py            → prova a secco: dice cosa toglierebbe, non tocca niente
#      python3 -I tools/pulisci-scorte.py --cancella → cancella davvero (lo lancia il workflow «Pulisci le scorte» il 1° del mese)
#      opzioni: --ramo <ramo> (di base .claude/ramo-di-lavoro.txt), --giorni N (di base 30)
# Eccezione scritta alla regola 🔒 «nessun ramo si cancella» (REGOLE.md «Rami e PR», kit 29.3).
import argparse, datetime, os, re, subprocess, sys

QUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(QUI)
GIORNI = 30
NOME = re.compile(r"scorta-(principale|parallela)(?:-(\d{8})-([A-Za-z0-9]{1,12}))?/(.+?)(?:-ferma-(\d{8})-\d{6}-[0-9a-f]+)?")


def run(*args, timeout=120):
    r = subprocess.run(["git", *args], capture_output=True, text=True, timeout=timeout, cwd=BASE)
    return r.returncode, r.stdout.strip()


def ramo_di_lavoro():
    try:
        with open(os.path.join(BASE, ".claude", "ramo-di-lavoro.txt"), encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return ""


def scorte(ramo):
    """[(nome, sha, data AAAAMMGG o '')] delle scorte del ramo su GitHub, dai soli nomi (ls-remote)."""
    rc, out = run("ls-remote", "--heads", "origin", "scorta-*")
    if rc:
        raise SystemExit("ls-remote fallito: GitHub non risponde")
    voci = []
    for riga in out.splitlines():
        sha, _, rif = riga.partition("\t")
        m = NOME.fullmatch(rif.removeprefix("refs/heads/"))
        if m and m.group(4) == ramo:
            voci.append((m.group(0), sha, m.group(5) or m.group(2) or ""))
    return voci


def scegli(voci, ramo, giorni=GIORNI, oggi=None):
    """(da_cancellare, tenute_con_lavoro): vecchie e già nel ramo → via; vecchie ma con lavoro non nel ramo → elencate."""
    oggi = oggi or datetime.date.today()
    limite = (oggi - datetime.timedelta(days=giorni)).strftime("%Y%m%d")
    vecchie = [v for v in voci if v[2] and v[2] < limite]
    if not vecchie:
        return [], []
    if run("fetch", "-q", "origin", ramo, *[f"+refs/heads/{n}:refs/remotes/origin/{n}" for n, _, _ in vecchie])[0]:
        raise SystemExit("fetch delle scorte fallito")
    if run("rev-parse", "--is-shallow-repository")[1] == "true":  # clone poco profondo: senza storia is-ancestor dice no
        run("fetch", "-q", "--unshallow", "origin", timeout=600)
    via, tenute = [], []
    for nome, sha, data in vecchie:
        (via if run("merge-base", "--is-ancestor", sha, f"origin/{ramo}")[0] == 0 else tenute).append((nome, sha, data))
    return via, tenute


def cancella(via):
    """Cancella i rami su GitHub a gruppi (un push ogni 50 rami): ritorna quanti sono andati."""
    fatti = 0
    for i in range(0, len(via), 50):
        gruppo = [n for n, _, _ in via[i:i + 50]]
        if run("push", "-q", "origin", "--delete", *gruppo, timeout=300)[0] == 0:
            fatti += len(gruppo)
        else:  # uno già sparito fa fallire tutto il gruppo: uno per uno
            fatti += sum(run("push", "-q", "origin", "--delete", n)[0] == 0 for n in gruppo)
    return fatti


def main(argv=None):
    p = argparse.ArgumentParser(description="Pulizia mensile dei rami di scorta già nel ramo (C352).")
    p.add_argument("--cancella", action="store_true", help="cancella davvero (di base solo prova a secco)")
    p.add_argument("--ramo", default=ramo_di_lavoro())
    p.add_argument("--giorni", type=int, default=GIORNI)
    a = p.parse_args(argv)
    if not a.ramo:
        raise SystemExit("ramo di lavoro non trovato (.claude/ramo-di-lavoro.txt o --ramo)")
    voci = scorte(a.ramo)
    via, tenute = scegli(voci, a.ramo, a.giorni)
    print(f"Scorte del ramo {a.ramo} su GitHub: {len(voci)}; più vecchie di {a.giorni} giorni e già nel ramo: {len(via)}; "
          f"vecchie con lavoro non nel ramo (restano, da guardare): {len(tenute)}.")
    for nome, _, data in tenute:
        print(f"  tenuta: {nome} ({data[:4]}-{data[4:6]}-{data[6:]})")
    if not via:
        return 0
    if not a.cancella:
        print("Prova a secco (senza --cancella): niente toccato. Toglierebbe:")
        for nome, _, _ in via:
            print(f"  {nome}")
        return 0
    fatti = cancella(via)
    print(f"Cancellate {fatti} di {len(via)}.")
    return 0 if fatti == len(via) else 1


if __name__ == "__main__":
    sys.exit(main())
