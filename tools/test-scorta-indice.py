#!/usr/bin/env python3
# Prova di E327: la scorta (.claude/hooks/scorta.py) salva il contenuto NUOVO di un file cambiato nello stesso secondo
# dell'indice di git e con la stessa lunghezza («racy git»: con la copia dell'indice senza la sua ora salvava il vecchio).
# A parte da test-scorta.py (tetto di una parte del pacchetto). Uso: python3 -I tools/test-scorta-indice.py
import json, os, subprocess, sys, tempfile, time

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "scorta.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def git(repo, *argomenti):
    return subprocess.run(["git", "-C", repo, *argomenti], capture_output=True, text=True).stdout.strip()


with tempfile.TemporaryDirectory() as t:
    subprocess.run(["git", "init", "-q", "--bare", os.path.join(t, "origin.git")], check=True)
    repo = os.path.join(t, "r")
    subprocess.run(["git", "clone", "-q", os.path.join(t, "origin.git"), repo], check=True, capture_output=True)
    for k, v in (("user.name", "P"), ("user.email", "p@example.com"), ("commit.gpgsign", "false")):
        git(repo, "config", k, v)
    git(repo, "checkout", "-q", "-b", "claude/prova-1")
    a = os.path.join(repo, "a.txt")
    open(a, "w").write("uno\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "base")
    git(repo, "push", "-q", "-u", "origin", "claude/prova-1")
    registrata = os.stat(a).st_mtime_ns
    indice = os.path.join(repo, ".git", "index")
    os.utime(indice, ns=(registrata, registrata))   # indice scritto nello stesso secondo del file
    open(a, "w").write("due\n")                       # cambiato nello stesso secondo, stessa lunghezza
    os.utime(a, ns=(registrata, registrata))
    time.sleep(1.1)                                   # la scorta arriva un secondo dopo
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, JONA_SCORTA_NOPUSH="1")
    r = subprocess.run([sys.executable, "-I", HOOK, "stop"], cwd=repo, input=json.dumps({}), text=True, env=env,
                       capture_output=True, timeout=90)
    controlla(r.returncode == 0, "hook: uscita 0 " + r.stderr[-300:])
    # nome della scorta con o senza l'id della sessione del cloud (C352)
    scorta = git(repo, "for-each-ref", "--format=%(objectname)", "refs/scorta-principale*/claude/prova-1")
    controlla(bool(scorta), "la scorta c'è")
    controlla(git(repo, "show", f"{scorta}:a.txt") == "due", "E327: la scorta ha il contenuto nuovo, non il vecchio")
    # dopo: `git status` riscrive l'indice e nasconde il caso, per questo non si guarda prima della scorta
    controlla(git(repo, "status", "--short") == "M a.txt", "git vede il file cambiato")

print(f"test-scorta-indice: {ok_n} controlli verdi")
