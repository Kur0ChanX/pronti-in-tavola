#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/file-nuovi.py (ferma una volta un file nuovo in docs/), su un progetto finto.
# Uso: python3 -I tools/test-file-nuovi.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "file-nuovi.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def hook(progetto, strumento, entrata, grezzo=None):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto)
    testo = grezzo if grezzo is not None else json.dumps({"tool_name": strumento, "tool_input": entrata})
    r = subprocess.run([sys.executable, "-I", HOOK], input=testo, capture_output=True, text=True, env=env,
                       cwd=progetto)
    controlla(r.returncode == 0, "uscita 0 sempre")
    if not r.stdout.strip():
        return ""
    dati = json.loads(r.stdout)["hookSpecificOutput"]
    controlla(dati["hookEventName"] == "PreToolUse", "formato PreToolUse")
    controlla(dati["permissionDecision"] == "deny", "ferma con deny")
    return dati["permissionDecisionReason"]


def scrivi(progetto, relativo, testo="x\n"):
    p = os.path.join(progetto, relativo)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)


def git(progetto, *argomenti):
    subprocess.run(["git", "-C", progetto, *argomenti], check=True, capture_output=True)


base = tempfile.mkdtemp()
try:
    prog = os.path.join(base, "progetto")
    os.makedirs(prog)
    git(prog, "init", "-q")
    git(prog, "config", "user.email", "prova@esempio.it")
    git(prog, "config", "user.name", "Prova")
    scrivi(prog, "docs/DA-FARE.md", "| C1 | voce |\n")
    git(prog, "add", "-A")
    git(prog, "commit", "-qm", "inizio")

    # Write su un file nuovo in docs/: ferma una volta, poi passa.
    m = hook(prog, "Write", {"file_path": os.path.join(prog, "docs/PROMESSE.md"), "content": "x"})
    controlla("docs/PROMESSE.md" in m, "Write nuovo in docs/ fermato col nome del file")
    controlla("c'è già un file" in m, "il motivo chiede se c'è già un file")
    controlla("docs/lavori-in-corso/<C>-<nome>.md" in m and "archivio/<C>/" in m,
              "C469 L9: il motivo dice dove va un file nuovo (piano del lavoro, foto e rapporti)")
    controlla(hook(prog, "Write", {"file_path": os.path.join(prog, "docs/PROMESSE.md")}) == "",
              "secondo tentativo dello stesso file passa")
    controlla(hook(prog, "Write", {"file_path": "docs/ALTRO.md"}) != "", "percorso relativo: fermato")

    # File che c'è già, cartelle libere, fuori da docs/: passano.
    controlla(hook(prog, "Write", {"file_path": os.path.join(prog, "docs/DA-FARE.md")}) == "",
              "Write su un file che c'è già passa")
    for libero in ("docs/lavori-in-corso/C1.md", "docs/misure/m.json", "docs/piani-finiti/p.md",
                   "docs/kit-progetto/pacchetto/P.md", "archivio/C1/foto.md", "app/src/nuovo.js"):
        controlla(hook(prog, "Write", {"file_path": os.path.join(prog, libero)}) == "", "libero: " + libero)
    controlla(hook(prog, "Write", {"file_path": os.path.join(base, "fuori", "docs", "X.md")}) == "",
              "fuori dal progetto: passa")

    # Bash: file nuovo creato con un comando, fermato al git add / git commit.
    scrivi(prog, "docs/REGISTRO.md")
    controlla(hook(prog, "Bash", {"command": "ls docs/"}) == "", "Bash senza git add/commit: passa")
    m = hook(prog, "Bash", {"command": "git add -A && git commit -m 'registro'"})
    controlla("docs/REGISTRO.md" in m, "git add con file nuovo non tracciato: fermato")
    controlla(hook(prog, "Bash", {"command": "git add -A && git commit -m 'registro'"}) == "",
              "secondo tentativo passa")
    scrivi(prog, "docs/STAGED.md")
    git(prog, "add", "docs/STAGED.md")
    controlla("docs/STAGED.md" in hook(prog, "Bash", {"command": "git commit -qm x"}),
              "git commit con file nuovo già aggiunto: fermato")
    scrivi(prog, "docs/lavori-in-corso/C2.md")
    controlla(hook(prog, "Bash", {"command": "git -C . add docs"}) == "", "solo file liberi o già visti: passa")
    git(prog, "add", "-A")
    git(prog, "commit", "-qm", "tutto")
    scrivi(prog, "docs/DA-FARE.md", "| C1 | voce cambiata |\n")
    controlla(hook(prog, "Bash", {"command": "git commit -qam x"}) == "", "file cambiato (non nuovo): passa")

    # Memoria in .git/ e ingressi strani.
    controlla(os.path.exists(os.path.join(prog, ".git", "file-nuovi-visti.json")), "memoria in .git/")
    controlla(hook(prog, "", {}, grezzo="non json") == "", "ingresso rotto: silenzio")
    controlla(hook(prog, "Edit", {"file_path": os.path.join(prog, "docs/NUOVO2.md")}) == "", "Edit: non controllato")
finally:
    shutil.rmtree(base, ignore_errors=True)

print(f"test-file-nuovi: {ok_n} controlli ok")
