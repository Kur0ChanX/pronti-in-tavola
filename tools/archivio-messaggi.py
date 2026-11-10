#!/usr/bin/env python3
"""C469 fase 1 (Mario 04/11 «ho paura di perdere cose che ho scritto»): ricostruisce l'archivio dei messaggi di Mario
(archivio/messaggi-mario/AAAA-MM.md) dalla storia di git. Legge OGNI versione dei registri (docs/MESSAGGI-MARIO*.md,
dal 27/10, C291) e degli ultimi messaggi (docs/ULTIMO-MESSAGGIO*.md, anche prima) e unisce le voci all'archivio, senza
doppi. Si può rilanciare quando si vuole: non perde e non raddoppia niente. Le voci nuove dopo questo giro le scrive da
sola la scorta (.claude/hooks/scorta.py).
Uso: python3 -I tools/archivio-messaggi.py [--scrivi] [rif ...]
     senza --scrivi: solo il conto per mese; rif = rami o commit da leggere (di base HEAD e le scorte scaricate)."""
import argparse, datetime, difflib, os, re, subprocess, sys

QUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.environ.get("CLAUDE_PROJECT_DIR") or QUI
sys.path.insert(0, os.path.join(QUI, ".claude", "hooks"))
from scorta import (ARCHIVIO, AVVISI_DI_SISTEMA, FILE_MSG, FILE_REGISTRO, RIAVVIO, file_archivio,  # noqa: E402
                    leggi_voci, ora_voce, scrivi_archivio, togli_segreti, unisci_voci)

# Voci tolte apposta (es. E321: «prova tempi», un messaggio finto): una riga «AAAA-MM-GG HH:MM · sessione · motivo».
# Stanno ancora nella storia dei registri: senza questo elenco il recupero le rimetterebbe.
TOLTI = "archivio/messaggi-tolti.txt"
TESTA_ULTIMO = re.compile(r"^# Ultimo messaggio di Mario \((\d{2})/(\d{2})/(\d{4}) (\d{2}:\d{2})(?: ora italiana)?\)\s*$")


def git(*args, inp=None, timeout=300):
    r = subprocess.run(["git", *args], cwd=BASE, capture_output=True, text=True, input=inp, timeout=timeout)
    return r.stdout if r.returncode == 0 else ""


def versioni(rif, percorsi):
    """{blob: percorso} di ogni versione dei file nella storia dei rif (anche dentro i merge)."""
    blob = {}
    for riga in git("log", "--raw", "--no-abbrev", "-m", "--format=", *rif, "--", *percorsi).splitlines():
        if not riga.startswith(":"):
            continue
        dati, _, percorso = riga.partition("\t")
        parti = dati.split()
        if len(parti) >= 4 and set(parti[3]) != {"0"}:
            blob[parti[3]] = percorso.strip()
    return blob


def leggi_blob(ids):
    """{blob: testo} con un solo git cat-file --batch."""
    if not ids:
        return {}
    r = subprocess.run(["git", "cat-file", "--batch"], cwd=BASE, input=("\n".join(ids) + "\n").encode(), capture_output=True,
                       timeout=600)
    out, testi, i = r.stdout, {}, 0
    while i < len(out):
        fine = out.index(b"\n", i)
        testa = out[i:fine].split()
        if len(testa) < 3 or testa[1] == b"missing":
            i = fine + 1
            continue
        n = int(testa[2])
        testi[testa[0].decode()] = out[fine + 1:fine + 1 + n].decode("utf-8", "replace")
        i = fine + 1 + n + 1
    return testi


def voce_ultimo(testo):
    """Una versione di ULTIMO-MESSAGGIO*.md → (quando, «?», testo) o None (sessione non scritta in quel file)."""
    righe = testo.splitlines()
    m = TESTA_ULTIMO.match(righe[0]) if righe else None
    if not m:
        return None
    corpo = "\n".join(righe[1:]).strip()
    return (f"{m.group(3)}-{m.group(2)}-{m.group(1)} {m.group(4)}", "?", corpo) if corpo else None


def piatto(t):
    return "\n".join(r.strip() for r in t.splitlines()).strip()


def minuti(quando):
    try:
        return datetime.datetime.strptime(ora_voce(quando), "%Y-%m-%d %H:%M").timestamp() / 60
    except ValueError:
        return None


def di_mario(v, segreti=False):
    """Come salva_msg di scorta.py: via l'avviso del riavvio e gli avvisi automatici (versioni vecchie li salvavano).
    segreti=True (ultimi messaggi di ottobre, prima del filtro): chiavi e password coperte. Ai registri no: le voci
    dell'hook sono già coperte e su quelle scritte a mano il filtro scambia i nomi lunghi dei file per chiavi."""
    testo = RIAVVIO.sub("", v[2]).strip()
    testo = togli_segreti(testo).strip() if segreti else testo
    return (v[0], v[1], testo) if testo and not testo.startswith(AVVISI_DI_SISTEMA) else None


def ultima_versione(voci):
    """Voce ritoccata a mano più volte (stessa testata, testo cresciuto o corretto: una per commit): resta la più
    completa. Due messaggi diversi nello stesso minuto hanno testi diversi e restano tutti e due."""
    gruppi = {}
    for v in voci:
        gruppi.setdefault((ora_voce(v[0]), v[1]), []).append(v)
    tenute = []
    for gruppo in gruppi.values():
        scelte = []
        for v in sorted(gruppo, key=lambda v: -len(v[2])):
            t = piatto(v[2])
            if not any(t in piatto(k[2]) or difflib.SequenceMatcher(None, t, piatto(k[2])).quick_ratio() >= 0.9
                       and difflib.SequenceMatcher(None, t, piatto(k[2])).ratio() >= 0.9 for k in scelte):
                scelte.append(v)
        tenute += scelte
    return sorted(tenute, key=lambda v: ora_voce(v[0]))


def togli_vicini(voci):
    """Stesso messaggio scritto due volte nei registri (testata a mano di una chat + quella dell'hook, 1 minuto dopo):
    resta il primo. Stesso testo entro 2 minuti = stesso messaggio."""
    noti, tenute = {}, []
    for v in sorted(voci, key=lambda v: ora_voce(v[0])):
        m, gia = minuti(v[0]), noti.setdefault(piatto(v[2]), [])
        if not any(n is not None and m is not None and abs(n - m) <= 2 for n in gia):
            tenute.append(v)
        gia.append(m)
    return tenute


def senza_doppi_ultimo(dai_registri, dagli_ultimi):
    """Le voci di ULTIMO-MESSAGGIO che i registri non hanno già (stesso testo, entro 2 minuti: due orologi diversi)."""
    noti = {}
    for q, _, t in dai_registri:
        noti.setdefault(piatto(t), []).append(minuti(q))
    tenute = []
    for v in dagli_ultimi:
        m = minuti(v[0])
        if not any(n is not None and m is not None and abs(n - m) <= 2 for n in noti.get(piatto(v[2]), [])):
            tenute.append(v)
            noti.setdefault(piatto(v[2]), []).append(m)
    return tenute


def leggi_tolti():
    """{«AAAA-MM-GG HH:MM · sessione»} delle voci tolte apposta (TOLTI): il recupero non le rimette."""
    try:
        with open(os.path.join(BASE, TOLTI), encoding="utf-8") as f:
            righe = f.read().splitlines()
    except OSError:
        return set()
    return {" · ".join(r.split(" · ")[:2]).strip() for r in righe if r.strip() and not r.startswith("#")}


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--scrivi", action="store_true", help="scrive i file dell'archivio (di base solo il conto)")
    p.add_argument("rif", nargs="*", help="rami o commit (di base HEAD e le scorte scaricate)")
    a = p.parse_args(argv)
    rif = a.rif or ["HEAD"] + [r for r in git("for-each-ref", "--format=%(refname)",
                                              "refs/remotes/origin/").split() if "/scorta-" in r]
    if git("rev-parse", "--is-shallow-repository").strip() == "true":
        print("⚠️ Storia corta (clone poco profondo): per tutta la storia prima `git fetch --unshallow origin <ramo>`.")
    registri = versioni(rif, list(FILE_REGISTRO.values()))
    ultimi = versioni(rif, list(FILE_MSG.values()))
    testi = leggi_blob(list(registri) + list(ultimi))
    tutte = [m for v in unisci_voci(*(testi.get(b, "") for b in registri)) if (m := di_mario(v))]
    dagli_ultimi = senza_doppi_ultimo(tutte, sorted(  # contro TUTTE le versioni dei registri, anche le più corte
        (m for b in ultimi if (v := voce_ultimo(testi.get(b, ""))) and (m := di_mario(v, segreti=True))),
        key=lambda v: ora_voce(v[0])))
    dai_registri = togli_vicini(ultima_versione(tutte))
    # le voci dei registri di adesso restano sempre, uguali: la scorta le copia nell'archivio (auto-riparazione) e
    # senza di loro tornerebbero come doppioni
    dai_registri += [v for f in FILE_REGISTRO.values() for v in leggi_voci(git("show", f"HEAD:{f}"))
                     if v not in dai_registri]
    trovate = unisci_voci("".join(f"\n## {q} · {s}\n{t}\n" for q, s, t in dai_registri + dagli_ultimi))
    tolti = leggi_tolti()
    trovate = [v for v in trovate if f"{v[0]} · {v[1]}" not in tolti]
    mesi = {}
    for v in trovate:
        mesi.setdefault(file_archivio(v[0]), []).append(v)
    print(f"Versioni lette: {len(registri)} dei registri, {len(ultimi)} degli ultimi messaggi; "
          f"messaggi trovati: {len(trovate)} ({len(dagli_ultimi)} solo negli ultimi messaggi).")
    for percorso in sorted(mesi):
        pieno = os.path.join(BASE, percorso)
        try:
            with open(pieno, encoding="utf-8") as f:
                prima = f.read()
        except OSError:
            prima = ""
        unite = unisci_voci(prima, scrivi_archivio(mesi[percorso]))
        nuove = len(unite) - len(leggi_voci(prima))
        print(f"  {percorso}: {len(leggi_voci(prima))} → {len(unite)} (+{nuove})")
        if a.scrivi and nuove:
            os.makedirs(os.path.dirname(pieno), exist_ok=True)
            with open(pieno, "w", encoding="utf-8") as f:
                f.write(scrivi_archivio(unite))
    if not a.scrivi:
        print(f"Prova a secco: niente scritto (--scrivi per scrivere in {ARCHIVIO}/).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
