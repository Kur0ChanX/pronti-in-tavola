#!/usr/bin/env python3
# Prova di .claude/hooks/avvio-check.py col tetto dell'hook (Risparmio 13, 10/11): rete lenta all'avvio → l'hook veniva
# fermato a 90 s da Claude Code e l'avviso intero si perdeva. Qui un git finto si ferma sul fetch e il tetto è a 3 s:
# l'avviso deve uscire lo stesso, entro il tetto, con cosa manca e come rifarlo, e il segno «avvio-in-corso» tolto.
# Repo finto in una cartella temporanea: niente rete, niente push. Uso: python3 -I tools/test-avvio-check.py
import json, os, shutil, subprocess, sys, tempfile, time

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks", "avvio-check.py")
errori = 0


def controlla(cond, nome):
    global errori
    print(("ok   " if cond else "ERR  ") + nome)
    errori += 0 if cond else 1


def git(cwd, *a):
    return subprocess.run(["git", *a], cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()


with tempfile.TemporaryDirectory() as tmp:
    repo = os.path.join(tmp, "repo")
    os.makedirs(repo)
    git(repo, "init", "-q", "-b", "claude/prova")
    git(repo, "config", "user.email", "prova@example.com")
    git(repo, "config", "user.name", "prova")
    with open(os.path.join(repo, "a.txt"), "w") as f:
        f.write("a\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "primo")
    git(repo, "remote", "add", "origin", os.path.join(tmp, "non-serve.git"))
    finto = os.path.join(tmp, "git-lento")
    os.makedirs(finto)
    vero = shutil.which("git")
    with open(os.path.join(finto, "git"), "w") as f:
        f.write(f'#!/bin/sh\nfor a in "$@"; do [ "$a" = fetch ] && exec sleep 30; done\nexec {vero} "$@"\n')
    os.chmod(os.path.join(finto, "git"), 0o755)
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, PATH=finto + os.pathsep + os.environ.get("PATH", ""),
               AVVIO_TEMPO_HOOK="3")
    env.pop("CLAUDE_CODE_REMOTE_SESSION_ID", None)
    t0 = time.time()
    r = subprocess.run([sys.executable, "-I", HOOK], cwd=repo, input="{}", env=env, capture_output=True, text=True,
                       timeout=60)
    durata = time.time() - t0
    try:
        uscita = json.loads(r.stdout)["hookSpecificOutput"]["additionalContext"]
    except Exception:  # noqa: BLE001
        uscita = ""
    controlla(r.returncode == 0 and uscita != "", f"esce sempre con un avviso valido (uscita {r.returncode})")
    controlla(durata < 10, f"entro il tetto, non dopo i tentativi del fetch ({durata:.0f} s)")
    controlla(uscita.startswith("ATTENZIONE avvio lento") and "ramo fermato" in uscita
              and "non controllati: scorte, messaggi di Mario, Aspetta Mario, promesse" in uscita,
              "dice quale passo si è fermato e cosa non ha controllato: " + uscita[:120])
    controlla("python3 -I .claude/hooks/avvio-check.py" in uscita, "dice come rifarlo")
    controlla(not os.path.exists(os.path.join(repo, ".git", "avvio-in-corso")), "segno «avvio-in-corso» tolto")
    controlla(git(repo, "config", "--get", "merge.scorta.driver") == "cp %B %A", "driver della scorta detto lo stesso")
    controlla(git(repo, "config", "--get", "merge.impostazioni.driver") == "python3 -I tools/unisci-json.py %O %A %B",
              "driver delle impostazioni detto lo stesso (E325)")

print(f"ERRORI: {errori}")
sys.exit(1 if errori else 0)
