#!/usr/bin/env python3
# Pulizia a ogni versione del kit (skill nuova-regola, Mario 23/10): elenca i file di docs/ e .claude/
# orfani (nessun file li cita), citati solo dalla storia (forse non servono più) o doppi (stesso contenuto).
# Solo un elenco con la proposta: non cancella e non sposta niente (decide Mario, un file alla volta).
# Uso: python3 -I tools/pulizia-kit.py
import hashlib, os, re, subprocess, sys

RADICE = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARTELLE = ("docs/", ".claude/")
# Si usano senza essere citati: skill, aiutanti, regole per zona e impostazioni li carica Claude Code da solo.
DA_SOLI = re.compile(r"^\.claude/(skills|agents|rules)/|^\.claude/settings[^/]*\.json$|^\.claude/ramo-di-lavoro\.txt$")
GENERATI = re.compile(r"^docs/kit-progetto/pacchetto/")
STORIA = re.compile(r"^archivio/|^docs/piani-finiti/|^docs/(ERRORI-STORIA|DA-FARE-FATTE|SESSIONE-\d+)\.md$|^docs/[^/]*STORIA[^/]*\.md$")
FUORI = re.compile(r"^docs/kit-progetto/pacchetto/|(^|/)node_modules/|\.(png|jpe?g|webp|gif|ico|pdf|zip|woff2?|ttf|mp3|mp4|ogg|jar)$", re.I)
TETTO = 40


def git(*a):
    return subprocess.run(["git", *a], cwd=RADICE, capture_output=True, text=True).stdout


def leggi(rel):
    try:
        with open(os.path.join(RADICE, rel), "rb") as f:
            dati = f.read()
    except OSError:
        return None, None
    try:
        return dati, dati.decode("utf-8")
    except UnicodeDecodeError:
        return dati, None


def main():
    tutti = [r for r in git("ls-files", "-z").split("\0") if r]
    testi, vivi, storia = {}, [], []
    for rel in tutti:
        if FUORI.search(rel):
            continue
        _, testo = leggi(rel)
        if testo is None or len(testo) > 3_000_000:
            continue
        testi[rel] = testo
        (storia if STORIA.search(rel) else vivi).append(testo)
    vivo, vecchio = "\n".join(vivi), "\n".join(storia)

    righe, impronte = [], {}
    for rel in tutti:
        if not rel.startswith(CARTELLE) or GENERATI.search(rel):
            continue
        dati, _ = leggi(rel)
        if dati is None:
            continue
        if not rel.startswith("docs/kit-progetto/"):  # le copie del kit sono doppie apposta
            impronte.setdefault(hashlib.sha1(dati).hexdigest(), []).append(rel)
        if DA_SOLI.search(rel):
            continue
        proprio = testi.get(rel, "")
        chiavi = {rel, os.path.basename(rel)}
        if rel.startswith("docs/") and os.path.dirname(rel) != "docs":  # cartella citata (es. «docs/misure/»)
            chiavi.add(os.path.dirname(rel) + "/")

        def citato(corpo, conta_proprio):
            return any(corpo.count(k) - (proprio.count(k) if conta_proprio else 0) > 0 for k in chiavi)

        in_storia = STORIA.search(rel) is not None
        if citato(vivo, not in_storia):
            continue
        if citato(vecchio, in_storia):
            righe.append(("SOLO STORIA", rel, "lo citano solo storia o archivio"))
        else:
            righe.append(("ORFANO", rel, "nessun file lo cita"))
    for gruppo in impronte.values():
        if len(gruppo) > 1:
            righe.append(("DOPPIO", gruppo[0], "stesso contenuto di " + ", ".join(gruppo[1:])))

    if not righe:
        print("Pulizia: nessun file orfano, doppio o citato solo dalla storia in docs/ e .claude/.")
        return
    ordine = {"ORFANO": 0, "DOPPIO": 1, "SOLO STORIA": 2}
    if git("rev-parse", "--is-shallow-repository").strip() == "true":  # clone corto: la data è quella del primo commit scaricato
        print("Registro corto (clone parziale): «ultimo cambio» può essere più vecchio di quello scritto.")
    righe.sort(key=lambda r: (ordine[r[0]], r[1]))
    for n, (tipo, rel, perche) in enumerate(righe[:TETTO], 1):
        data = git("log", "-1", "--format=%cs", "--", rel).strip() or "mai nel registro"
        print(f"{n}. {tipo} {rel} ({perche}; ultimo cambio {data})")
    if len(righe) > TETTO:
        print(f"… altri {len(righe) - TETTO} file.")
    conti = {t: sum(1 for r in righe if r[0] == t) for t in ordine}
    print("Totale: " + ", ".join(f"{v} {k.lower()}" for k, v in conti.items() if v)
          + ". Proposta a Mario, lista numerata: togliere (git rm) o spostare in archivio/. Mai da sola: solo col suo ok.")


if __name__ == "__main__":
    main()
