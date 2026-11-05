#!/usr/bin/env python3
# Prova di tools/pulisci-scorte.py (C352) su un repo finto: via solo le scorte vecchie E già nel ramo; resta tutto il resto.
import datetime, os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(QUI, "pulisci-scorte.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print(f"ERRORE: {nome}")
        sys.exit(1)
    ok_n += 1
    print(f"ok {nome}")


def git(cwd, *a):
    return subprocess.run(["git", *a], cwd=cwd, capture_output=True, text=True).stdout.strip()


def pulisci(repo, *a):
    r = subprocess.run([sys.executable, "-I", SCRIPT, *a], cwd=repo, capture_output=True, text=True,
                       env=dict(os.environ, CLAUDE_PROJECT_DIR=repo))
    return r.returncode, r.stdout + r.stderr


def rami_remoti(repo):
    return sorted(r.split("\t")[1].removeprefix("refs/heads/") for r in git(repo, "ls-remote", "--heads", "origin").splitlines())


with tempfile.TemporaryDirectory() as tmp:
    nudo = os.path.join(tmp, "origin.git")
    repo = os.path.join(tmp, "lavoro")
    subprocess.run(["git", "init", "-q", "--bare", nudo], check=True)
    subprocess.run(["git", "clone", "-q", nudo, repo], check=True, capture_output=True)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(repo, "config", k, v)
    ramo = "claude/prova-1"
    git(repo, "checkout", "-q", "-b", ramo)
    os.makedirs(os.path.join(repo, ".claude"))
    open(os.path.join(repo, ".claude", "ramo-di-lavoro.txt"), "w").write(ramo + "\n")
    open(os.path.join(repo, "a.txt"), "w").write("uno\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "primo")
    base = git(repo, "rev-parse", "HEAD")
    oggi = datetime.date.today()
    vecchia = (oggi - datetime.timedelta(days=40)).strftime("%Y%m%d")
    recente = (oggi - datetime.timedelta(days=3)).strftime("%Y%m%d")
    # scorte già nel ramo (puntano a un commit del ramo): una vecchia per sessione, una vecchia -ferma-, una recente
    git(repo, "push", "-q", "origin", ramo,
        f"{base}:refs/heads/scorta-parallela-{vecchia}-01AAAAAA/{ramo}",
        f"{base}:refs/heads/scorta-principale/{ramo}-ferma-{vecchia}-120000-abcd",
        f"{base}:refs/heads/scorta-principale-{recente}-01BBBBBB/{ramo}",
        f"{base}:refs/heads/scorta-principale/{ramo}",  # nome vecchio senza data: resta sempre
        f"{base}:refs/heads/scorta-parallela-{vecchia}-01CCCCCC/claude/altro-ramo",  # di un altro ramo: non si tocca
        f"{base}:refs/heads/versione-v1")
    # scorta vecchia con lavoro NON nel ramo
    git(repo, "checkout", "-q", "-b", "tmp")
    open(os.path.join(repo, "lavoro-perso.txt"), "w").write("non unito\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "lavoro non nel ramo")
    git(repo, "push", "-q", "origin", f"HEAD:refs/heads/scorta-parallela-{vecchia}-01DDDDDD/{ramo}")
    git(repo, "checkout", "-q", ramo)
    git(repo, "branch", "-q", "-D", "tmp")
    prima = rami_remoti(repo)
    controlla(len(prima) == 8, "repo finto pronto: 8 rami su origin")

    # 1. prova a secco: dice cosa toglierebbe, non tocca niente
    rc, out = pulisci(repo)
    controlla(rc == 0 and "già nel ramo: 2;" in out and "da guardare): 1." in out and "Prova a secco" in out
              and f"scorta-parallela-{vecchia}-01AAAAAA/{ramo}" in out and f"ferma-{vecchia}-120000-abcd" in out
              and f"tenuta: scorta-parallela-{vecchia}-01DDDDDD/{ramo}" in out, "prova a secco: 2 da togliere, 1 tenuta con lavoro")
    controlla(rami_remoti(repo) == prima, "prova a secco: nessun ramo toccato")

    # 2. --cancella: via solo le 2 vecchie già nel ramo
    rc, out = pulisci(repo, "--cancella")
    dopo = rami_remoti(repo)
    controlla(rc == 0 and "Cancellate 2 di 2." in out and len(dopo) == 6
              and f"scorta-parallela-{vecchia}-01AAAAAA/{ramo}" not in dopo
              and f"scorta-principale/{ramo}-ferma-{vecchia}-120000-abcd" not in dopo, "--cancella: via le 2 vecchie già nel ramo")
    controlla(f"scorta-parallela-{vecchia}-01DDDDDD/{ramo}" in dopo, "la vecchia con lavoro non nel ramo resta")
    controlla(f"scorta-principale-{recente}-01BBBBBB/{ramo}" in dopo and f"scorta-principale/{ramo}" in dopo, "recente e nome vecchio restano")
    controlla(f"scorta-parallela-{vecchia}-01CCCCCC/claude/altro-ramo" in dopo and "versione-v1" in dopo and ramo in dopo,
              "altro ramo, versione-vNN e ramo di lavoro intatti")

    # 3. seconda passata: niente da fare; --giorni 1 toglie anche la recente (già nel ramo), mai quella col lavoro
    rc, out = pulisci(repo, "--cancella")
    controlla(rc == 0 and "già nel ramo: 0;" in out and rami_remoti(repo) == dopo, "seconda passata: niente da togliere")
    rc, out = pulisci(repo, "--cancella", "--giorni", "1")
    controlla(rc == 0 and "Cancellate 1 di 1." in out and f"scorta-principale-{recente}-01BBBBBB/{ramo}" not in rami_remoti(repo)
              and f"scorta-parallela-{vecchia}-01DDDDDD/{ramo}" in rami_remoti(repo), "--giorni 1: via la recente, tenuta quella col lavoro")

print(f"Pulisci scorte: {ok_n} controlli riusciti")
