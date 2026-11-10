#!/usr/bin/env python3
# Prova del driver d'unione tools/unisci-json.py (E325: settings.json sempre valido dopo un merge), anche con un git vero.
# Uso: python3 -I tools/test-unisci-json.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(QUI, "unisci-json.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def scrivi(p, dati):
    with open(p, "w", encoding="utf-8") as f:
        f.write(dati if isinstance(dati, str) else json.dumps(dati, ensure_ascii=False, indent=2) + "\n")


def unisci(cartella, o, a, b):
    po, pa, pb = (os.path.join(cartella, n) for n in ("o.json", "a.json", "b.json"))
    for p, d in ((po, o), (pa, a), (pb, b)):
        scrivi(p, d)
    r = subprocess.run([sys.executable, "-I", DRIVER, po, pa, pb], capture_output=True, text=True)
    testo = open(pa, encoding="utf-8").read()
    try:
        esito = json.loads(testo)
    except ValueError:
        esito = None
    return r.returncode, esito, testo, r.stderr


def hook(nome):
    return {"type": "command", "command": f"python3 {nome}", "timeout": 10}


def prova(cartella):
    base = {"hooks": {"UserPromptSubmit": [{"hooks": [hook("a.py"), hook("b.py")]}],
                      "Stop": [{"hooks": [hook("s.py")]}]},
            "permissions": {"deny": ["Bash(rm -rf:*)", "Bash(git push -f:*)"]},
            "effortLevel": "high"}

    # 1. Il caso vero di E325: divieti nuovi da un lato, effortLevel dall'altro → tutti e due.
    a = json.loads(json.dumps(base)); a["permissions"]["deny"].append("Bash(kill:*)")
    b = json.loads(json.dumps(base)); b["effortLevel"] = "medium"
    rc, e, _, err = unisci(cartella, base, a, b)
    controlla(rc == 0 and e is not None, "E325: unito e valido")
    controlla(e["permissions"]["deny"] == ["Bash(rm -rf:*)", "Bash(git push -f:*)", "Bash(kill:*)"], "E325: divieto nuovo tenuto")
    controlla(e["effortLevel"] == "medium" and not err, "E325: effortLevel dell'altro lato, nessun avviso")

    # 2. Stesso valore cambiato in modo diverso dai due lati → il loro + avviso.
    a = dict(base, effortLevel="xhigh"); b = dict(base, effortLevel="medium")
    rc, e, _, err = unisci(cartella, base, a, b)
    controlla(rc == 0 and e["effortLevel"] == "medium" and "effortLevel" in err, "conflitto vero: il loro + avviso")

    # 3. Un hook aggiunto dai due lati allo stesso gruppo → un gruppo solo, niente hook doppi.
    a = json.loads(json.dumps(base)); a["hooks"]["UserPromptSubmit"][0]["hooks"].append(hook("fermo.py"))
    b = json.loads(json.dumps(base)); b["hooks"]["UserPromptSubmit"][0]["hooks"].insert(1, hook("titolo.py"))
    rc, e, _, _ = unisci(cartella, base, a, b)
    comandi = [h["command"] for g in e["hooks"]["UserPromptSubmit"] for h in g["hooks"]]
    controlla(len(e["hooks"]["UserPromptSubmit"]) == 1, "hook: un gruppo solo")
    controlla(sorted(comandi) == sorted(["python3 a.py", "python3 b.py", "python3 fermo.py", "python3 titolo.py"]),
              "hook: tutti e quattro, nessuno doppio")

    # 4. Evento nuovo da un lato (PostModelSwitch), hook cambiato dall'altro → tutti e due.
    a = json.loads(json.dumps(base)); a["hooks"]["PostModelSwitch"] = [{"hooks": [hook("cambio.py")]}]
    b = json.loads(json.dumps(base)); b["hooks"]["Stop"][0]["hooks"][0]["timeout"] = 20
    rc, e, _, _ = unisci(cartella, base, a, b)
    controlla("PostModelSwitch" in e["hooks"] and e["hooks"]["Stop"][0]["hooks"][0]["timeout"] == 20, "evento nuovo + timeout cambiato")
    controlla(list(e["hooks"]) == ["UserPromptSubmit", "Stop", "PostModelSwitch"], "ordine delle chiavi: il nostro, poi le nuove")

    # 5. Tolto da un lato, aggiunto dall'altro.
    a = json.loads(json.dumps(base)); a["permissions"]["deny"].append("Bash(pkill:*)")
    b = json.loads(json.dumps(base)); b["permissions"]["deny"].remove("Bash(git push -f:*)")
    rc, e, _, _ = unisci(cartella, base, a, b)
    controlla(e["permissions"]["deny"] == ["Bash(rm -rf:*)", "Bash(pkill:*)"], "tolto dal loro, aggiunto dal nostro")
    b = dict(base); b.pop("effortLevel")
    rc, e, _, _ = unisci(cartella, base, base, b)
    controlla("effortLevel" not in e, "chiave tolta da un lato solo: tolta")

    # 6. Risultato uguale a un lato: testo tenuto com'era (righe compatte comprese, niente rumore nel diff).
    compatto = '{\n  "deniedMcpServers": [\n    {"serverName": "x"}\n  ]\n}\n'
    rc, e, testo, _ = unisci(cartella, compatto, compatto, compatto)
    controlla(rc == 0 and testo == compatto, "uguali: testo intatto")
    b_testo = '{\n  "deniedMcpServers": [\n    {"serverName": "x"}, {"serverName": "y"}\n  ]\n}\n'
    rc, e, testo, _ = unisci(cartella, compatto, compatto, b_testo)
    controlla(rc == 0 and testo == b_testo, "cambia solo il loro: il suo testo com'era")

    # 7. JSON rotto: sempre un file valido.
    rc, e, _, err = unisci(cartella, base, '{"hooks": <<<<<<< HEAD', base)
    controlla(rc == 1 and e == base and "E325" in err, "il nostro rotto: tengo il loro (valido), conflitto segnalato")
    rc, e, _, _ = unisci(cartella, base, base, "{rotto")
    controlla(rc == 1 and e == base, "il loro rotto: tengo il nostro")
    rc, e, testo, _ = unisci(cartella, base, "{rotto", "[rotto")
    controlla(rc == 1 and testo == "{rotto", "tutti e due rotti: lascio il nostro, uscita 1")
    rc, e, _, _ = unisci(cartella, "", {"x": 1}, {"y": 2})
    controlla(rc == 0 and e == {"x": 1, "y": 2}, "antenato vuoto: unione delle chiavi")
    r = subprocess.run([sys.executable, "-I", DRIVER], capture_output=True, text=True)
    controlla(r.returncode == 2 and "Uso" in r.stderr, "senza argomenti: uso")


def prova_git(cartella):
    # 8. Un merge vero di git col driver «impostazioni» (come in .gitattributes e avvio-check.py): nessun conflitto.
    repo = os.path.join(cartella, "repo")
    os.makedirs(os.path.join(repo, ".claude"))

    def git(*args):
        return subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True)

    git("init", "-q", "-b", "principale")
    git("config", "user.email", "prova@example.com")
    git("config", "user.name", "prova")
    git("config", "merge.impostazioni.driver", f"{sys.executable} -I {DRIVER} %O %A %B")
    scrivi(os.path.join(repo, ".gitattributes"), ".claude/settings.json merge=impostazioni\n")
    imp = os.path.join(repo, ".claude", "settings.json")
    base = {"permissions": {"deny": ["a"]}, "effortLevel": "high"}
    scrivi(imp, base)
    git("add", "-A"); git("commit", "-q", "-m", "base")
    git("checkout", "-q", "-b", "altro")
    scrivi(imp, dict(base, effortLevel="medium"))
    git("commit", "-q", "-am", "impegno")
    git("checkout", "-q", "principale")
    scrivi(imp, {"permissions": {"deny": ["a", "b"]}, "effortLevel": "high"})
    git("commit", "-q", "-am", "divieto")
    r = git("merge", "-q", "--no-edit", "altro")
    controlla(r.returncode == 0, "git merge: niente conflitto " + r.stdout + r.stderr)
    testo = open(imp, encoding="utf-8").read()
    controlla("<<<<<<<" not in testo and json.loads(testo) == {"permissions": {"deny": ["a", "b"]}, "effortLevel": "medium"},
              "git merge: settings.json valido, con tutti e due i cambi")


if __name__ == "__main__":
    tmp = tempfile.mkdtemp(prefix="unisci-json-")
    try:
        prova(tmp)
        prova_git(tmp)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"test-unisci-json: {ok_n} controlli verdi")
