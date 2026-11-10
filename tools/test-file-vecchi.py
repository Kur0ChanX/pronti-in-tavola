#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/file-vecchi.py (ferma una volta chi lavora su un file o una copia vecchia, E319),
# su un progetto finto con il suo remoto. Uso: python3 -I tools/test-file-vecchi.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "file-vecchi.py")  # acceso: ok di Mario 10/11 01:58 «ok controllo file vecchi»
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def hook(progetto, strumento, entrata, sessione="s1", grezzo=None):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto)
    testo = grezzo if grezzo is not None else json.dumps(
        {"tool_name": strumento, "tool_input": entrata, "session_id": sessione})
    r = subprocess.run([sys.executable, "-I", HOOK], input=testo, capture_output=True, text=True, env=env,
                       cwd=progetto)
    controlla(r.returncode == 0, "uscita 0 sempre")
    if not r.stdout.strip():
        return ""
    dati = json.loads(r.stdout)["hookSpecificOutput"]
    controlla(dati["hookEventName"] == "PreToolUse", "formato PreToolUse")
    controlla(dati["permissionDecision"] == "deny", "ferma con deny")
    return dati["permissionDecisionReason"]


def scrivi(cartella, relativo, testo="x\n"):
    p = os.path.join(cartella, relativo)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)


def git(cartella, *argomenti):
    return subprocess.run(["git", "-C", cartella, *argomenti], check=True, capture_output=True,
                          text=True).stdout.strip()


def utente(cartella):
    git(cartella, "config", "user.email", "prova@esempio.it")
    git(cartella, "config", "user.name", "Prova")


base = tempfile.mkdtemp(dir="/tmp")
try:
    remoto = os.path.join(base, "remoto.git")
    git(base, "init", "-q", "--bare", "-b", "lavoro", remoto)
    prog = os.path.join(base, "progetto")
    git(base, "clone", "-q", remoto, prog)
    utente(prog)
    git(prog, "checkout", "-q", "-b", "lavoro")
    scrivi(prog, "app/src/ui/logo.js", "logo 1\n")
    scrivi(prog, "app/src/ui/intro.js", "intro 1\n")
    scrivi(prog, "app/src/altro.js", "altro 1\n")
    scrivi(prog, "docs/DA-FARE.md", "| C1 | voce |\n")
    scrivi(prog, ".claude/skills/pr/SKILL.md", "pr\n")
    scrivi(prog, ".claude/gemelli.txt",
           "# prova\napp/src/ui/logo.js | app/src/ui/intro.js   # logo\n"
           "docs/kit-progetto/skills/ <- .claude/skills/\ndocs/kit/P.md <- docs/P.md\n")
    git(prog, "add", "-A")
    git(prog, "commit", "-qm", "inizio")
    git(prog, "push", "-q", "-u", "origin", "lavoro")

    def edit(rel, sessione="s1"):
        return hook(prog, "Edit", {"file_path": os.path.join(prog, rel), "old_string": "a", "new_string": "b"},
                    sessione)

    # Caso 2, gemelli: ferma una volta per gruppo e sessione, col nome dell'altro file e il git log.
    m = edit("app/src/ui/logo.js")
    controlla("Gemelli" in m and "app/src/ui/intro.js" in m, "gemelli: fermato col nome del gemello")
    controlla("git log" in m and "TUTTI" in m, "gemelli: dice di guardare le correzioni e cambiarli tutti")
    controlla(edit("app/src/ui/logo.js") == "", "gemelli: secondo tentativo passa")
    controlla(edit("app/src/ui/intro.js") == "", "gemelli: stesso gruppo nella stessa sessione passa")
    controlla(edit("app/src/ui/intro.js", "s2") != "", "gemelli: sessione nuova, fermato di nuovo")
    controlla(edit("app/src/altro.js") == "", "file senza gemelli, ramo allineato: passa")

    # Caso 3, copia generata: cartella e file singolo.
    m = edit("docs/kit-progetto/skills/pr/SKILL.md")
    controlla("Copia generata" in m and ".claude/skills/pr/SKILL.md" in m, "copia generata: dice la fonte vera")
    m = hook(prog, "Write", {"file_path": os.path.join(prog, "docs/kit/P.md"), "content": "x"})
    controlla("docs/P.md" in m, "copia generata, file singolo: dice la fonte")
    controlla(edit(".claude/skills/pr/SKILL.md") == "", "la fonte si cambia libera")

    # Caso 1, ramo indietro: un'altra chat cambia altro.js sul remoto; il fetch lo porta, il merge no.
    altra = os.path.join(base, "altra")
    git(base, "clone", "-q", "-b", "lavoro", remoto, altra)
    utente(altra)
    scrivi(altra, "app/src/altro.js", "altro 2\n")
    scrivi(altra, "docs/DA-FARE.md", "| C1 | voce cambiata |\n")
    git(altra, "commit", "-qam", "altra chat")
    git(altra, "push", "-q")
    controlla(edit("app/src/altro.js") == "", "prima del fetch il remoto non si vede: passa")
    git(prog, "fetch", "-q")
    m = edit("app/src/altro.js")
    controlla("File vecchio" in m and "merge --ff-only" in m, "ramo indietro sul file: fermato col merge")
    controlla(edit("app/src/altro.js") == "", "ramo indietro: secondo tentativo passa")
    controlla(edit("app/src/ui/intro.js", "s3").count("🕰️") == 0, "file non cambiato sul remoto: niente ramo")
    git(prog, "merge", "-q", "--ff-only", "origin/lavoro")
    controlla(edit("app/src/altro.js", "s4") == "", "dopo il merge passa")

    # Caso 4, copia vecchia fuori dal progetto: worktree a un commit vecchio.
    vecchio = git(prog, "rev-parse", "HEAD~1")
    copia = os.path.join(base, "k4", "copia")
    git(prog, "worktree", "add", "-q", "--detach", copia, vecchio)
    m = hook(prog, "Bash", {"command": f"cd {copia} && node f.cjs uscita"})
    controlla("Copia vecchia" in m and "app/src/altro.js" in m, "worktree vecchio: fermato coi file diversi")
    controlla("docs/DA-FARE.md" not in m, "worktree vecchio: docs/ non conta")
    controlla(hook(prog, "Bash", {"command": f"ls {copia}/app"}) == "", "worktree vecchio: secondo tentativo passa")
    prima = os.path.join(base, "k4", "prima")
    git(prog, "worktree", "add", "-q", "--detach", prima, vecchio)
    controlla(hook(prog, "Bash", {"command": f"ls {prima}/app/src"}) == "", "cartella «prima»: il vecchio voluto passa")
    nuovo = os.path.join(base, "nuova")
    git(prog, "worktree", "add", "-q", "--detach", nuovo, "HEAD")
    controlla(hook(prog, "Bash", {"command": f"ls {nuovo}/app/src"}) == "", "worktree al commit di adesso: passa")
    m = hook(prog, "Edit", {"file_path": os.path.join(copia, "app/src/ui/logo.js")}, "s5")
    controlla("Copia vecchia" in m, "Edit dentro una copia vecchia: fermato")

    # Caso 4, copia semplice (cp -r): diversa → fermata; uguale → passa; cambia il progetto → fermata di nuovo.
    semplice = os.path.join(base, "semplice")
    shutil.copytree(os.path.join(prog, "app"), os.path.join(semplice, "app"))
    controlla(hook(prog, "Bash", {"command": f"node {semplice}/app/x.cjs"}) == "", "copia uguale al progetto: passa")
    scrivi(prog, "app/src/ui/logo.js", "logo 2 corretto\n")
    m = hook(prog, "Bash", {"command": f"node {semplice}/app/x.cjs"})
    controlla("Copia vecchia" in m and "app/src/ui/logo.js" in m, "progetto corretto dopo la copia: fermato")
    controlla(hook(prog, "Bash", {"command": f"node {semplice}/app/x.cjs"}) == "", "copia semplice: secondo passa")
    scrivi(prog, "app/src/altro.js", "altro 3\n")
    controlla(hook(prog, "Bash", {"command": f"node {semplice}/app/x.cjs"}) != "", "altra correzione: fermato di nuovo")

    # Bash senza percorsi in /tmp, percorsi senza copie, entrate rotte: silenzio.
    controlla(hook(prog, "Bash", {"command": "git status && npm run build"}) == "", "Bash normale: passa")
    controlla(hook(prog, "Bash", {"command": f"ls {base}/vuota/foto.png"}) == "", "cartella senza copia: passa")
    controlla(hook(prog, "Read", {"file_path": os.path.join(prog, "app/src/ui/logo.js")}) == "", "Read: passa")
    controlla(hook(prog, "Bash", {}, grezzo="non json") == "", "entrata rotta: silenzio")
    controlla(hook(prog, "Edit", {}) == "", "Edit senza percorso: silenzio")
finally:
    shutil.rmtree(base, ignore_errors=True)

print(f"test-file-vecchi: {ok_n} controlli verdi")
