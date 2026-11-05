#!/usr/bin/env python3
# Prova della scorta automatica (.claude/hooks/scorta.py e controllo in avvio-check.py), su repo finti in una cartella temporanea.
# C148: una scorta per chat (principale e parallela), ruolo dal prompt di avvio o dalla trascrizione, push non in avanti.
# C252: la scorta di un altro contenitore non si copre mai (E154).
# C291: registro dei messaggi di Mario (docs/MESSAGGI-MARIO.md) e conto all'avvio dei messaggi dopo l'handoff.
# Uso: python3 tools/test-scorta.py
import json, os, subprocess, sys, tempfile, time

QUI = os.path.dirname(os.path.abspath(__file__))
HOOKS = os.path.join(QUI, "..", ".claude", "hooks")
# C352 (P48): in cloud la variabile porta l'id vero della sessione; qui le scorte finte devono nascere senza id (la prova 15 la imposta)
os.environ.pop("CLAUDE_CODE_REMOTE_SESSION_ID", None)
ok_n = 0


def sh(*a, cwd, inp=None, env=None):
    r = subprocess.run(list(a), cwd=cwd, capture_output=True, text=True, input=inp, env=env)
    return r.stdout.strip()


def git(cwd, *a):
    return sh("git", *a, cwd=cwd)


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1
    print("ok", nome)


def hook(repo, arg, dati=None, nopush=False):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, JONA_SCORTA_NOPUSH="1" if nopush else "0")
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), arg], cwd=repo, input=json.dumps(dati or {}),
                   text=True, env=env, timeout=90)


def remoto_scorta(repo, ruolo="principale"):
    return remoto(repo, f"scorta-{ruolo}/claude/prova-1")


def aspetta_chiusa(repo, nome):
    # C276: il commit «Scorta a parte chiusa» lo manda il push in background
    for _ in range(150):
        git(repo, "fetch", "-q", "origin", f"+refs/heads/{nome}:refs/remotes/origin/{nome}")
        if git(repo, "log", "-1", "--format=%s", f"origin/{nome}").startswith("Scorta a parte chiusa"):
            return True
        time.sleep(0.1)
    return False


def remoto(repo, nome):
    for _ in range(150):  # il push parte in background
        out = git(repo, "ls-remote", "origin", f"refs/heads/{nome}")
        locale = git(repo, "rev-parse", "-q", "--verify", f"refs/{nome}")
        if out and out.split()[0] == locale:
            return out.split()[0]
        time.sleep(0.1)
    return git(repo, "ls-remote", "origin", f"refs/heads/{nome}").split("\t")[0]


def hook_out(repo, arg, dati=None):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, JONA_SCORTA_NOPUSH="0")
    return subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), arg], cwd=repo, input=json.dumps(dati or {}),
                          text=True, env=env, timeout=90, capture_output=True).stdout


def aspetta_file(percorso):
    for _ in range(150):  # lo scrive il push in background
        if os.path.exists(percorso):
            return True
        time.sleep(0.1)
    return False


def aspetta_sparito(percorso):
    # C352: chiudi_a_parte() toglie il segno locale DOPO il push: chi aspetta solo il commit su GitHub arrivava un attimo
    # prima (prova rossa «a volte», E22)
    for _ in range(150):
        if not os.path.exists(percorso):
            return True
        time.sleep(0.1)
    return False


def clona(tmp, nome):
    cartella = os.path.join(tmp, nome)
    sh("git", "clone", "-q", "-b", "claude/prova-1", os.path.join(tmp, "origin.git"), cartella, cwd=tmp)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(cartella, "config", k, v)
    return cartella


def ruolo_file(repo):
    try:
        return open(os.path.join(git(repo, "rev-parse", "--absolute-git-dir"), "scorta-ruolo")).read().strip()
    except OSError:
        return ""


AVVIO_PAR = "[AVVIO] Sei la chat parallela P40 del progetto (ramo claude/prova-1): git fetch origin claude/prova-1\nLeggi CLAUDE.md"


with tempfile.TemporaryDirectory() as tmp:
    nudo = os.path.join(tmp, "origin.git")
    repo = os.path.join(tmp, "lavoro")
    sh("git", "init", "-q", "--bare", nudo, cwd=tmp)
    sh("git", "clone", "-q", nudo, repo, cwd=tmp)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(repo, "config", k, v)
    git(repo, "checkout", "-q", "-b", "claude/prova-1")
    open(os.path.join(repo, "a.txt"), "w").write("uno\n")
    open(os.path.join(repo, ".gitignore"), "w").write("segreto.txt\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "primo")
    git(repo, "push", "-q", "-u", "origin", "claude/prova-1")
    head0 = git(repo, "rev-parse", "HEAD")

    # 1. messaggio + lavoro non salvato
    hook(repo, "msg", {"prompt": "Ciao, prova della scorta"})
    controlla(git(repo, "status", "--porcelain") == "", "il messaggio salvato non sporca git status")
    open(os.path.join(repo, "a.txt"), "w").write("due\n")
    open(os.path.join(repo, "nuovo.txt"), "w").write("nuovo\n")
    open(os.path.join(repo, "segreto.txt"), "w").write("chiave\n")
    hook(repo, "stop")
    s1 = remoto_scorta(repo)
    controlla(bool(s1), "scorta mandata su GitHub")
    controlla(git(repo, "rev-parse", "HEAD") == head0, "il ramo di lavoro non si muove")
    controlla(git(repo, "rev-parse", "origin/claude/prova-1") == head0, "il ramo su GitHub non si muove")
    controlla("M a.txt" in git(repo, "status", "--porcelain") and git(repo, "diff", "--cached", "--name-only") == "",
              "indice vero non toccato")
    controlla(git(repo, "show", f"{s1}:a.txt") == "due", "file modificato nella scorta")
    controlla(git(repo, "show", f"{s1}:nuovo.txt") == "nuovo", "file nuovo nella scorta")
    controlla("segreto.txt" not in git(repo, "ls-tree", "-r", "--name-only", s1).split(), "file in .gitignore escluso")
    controlla("prova della scorta" in git(repo, "show", f"{s1}:docs/ULTIMO-MESSAGGIO.md"), "ultimo messaggio nella scorta")

    # 2. niente cambiato = niente scorta nuova
    hook(repo, "stop")
    time.sleep(1)
    controlla(remoto_scorta(repo) == s1, "niente cambiato, niente push")

    # 3. commit nuovo: scorta in avanti (contiene la precedente)
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "secondo")
    hook(repo, "msg", {"prompt": "secondo messaggio"})
    hook(repo, "stop")
    s2 = remoto_scorta(repo)
    controlla(s2 != s1, "scorta nuova dopo il commit")
    controlla(subprocess.run(["git", "merge-base", "--is-ancestor", s1, s2], cwd=repo).returncode == 0,
              "push sempre in avanti (la scorta nuova contiene la vecchia)")
    controlla("secondo messaggio" in git(repo, "show", f"{s2}:docs/ULTIMO-MESSAGGIO.md"), "messaggio aggiornato")

    # 3b. un avviso automatico (GitHub, promemoria) non prende il posto del messaggio di Mario
    hook(repo, "msg", {"prompt": "<task-notification>\n<task-type>queued-remote-notifications</task-type>\n</task-notification>"})
    open(os.path.join(repo, "a.txt"), "w").write("tre\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "avviso di sistema ignorato")

    # 3c. il prompt di avvio della sessione nuova (segno «[AVVIO]») non prende il posto del messaggio di Mario
    hook(repo, "msg", {"prompt": "[AVVIO] git fetch origin claude/prova-1 && git merge --ff-only origin/claude/prova-1"})
    open(os.path.join(repo, "a.txt"), "w").write("quattro\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "prompt di avvio ignorato")

    # 3c-bis. un messaggio di un'altra sessione (send_message, es. un altro progetto) non prende il posto del messaggio di Mario
    hook(repo, "msg", {"prompt": "<cross-session-message from-session=\"session_FINTA\">\nciao da un'altra sessione\n</cross-session-message>"})
    open(os.path.join(repo, "a.txt"), "w").write("quattro-bis\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "messaggio di un'altra sessione ignorato")

    # 3c-ter. il rapporto di un aiutante (strumento Agent, #73) non prende il posto del messaggio di Mario
    hook(repo, "msg", {"prompt": "<agent-message from=\"a0000\">\n[Subagent hand-back] C41 fatto\n</agent-message>"})
    open(os.path.join(repo, "a.txt"), "w").write("quattro-ter\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "rapporto di un aiutante ignorato")

    # 3c-quater. l'avviso del riavvio del contenitore (E104): da solo ignorato; attaccato a un messaggio vero, tolto
    riavvio = ("This session's worker process was restarted. If your previous turn was already complete, "
               "take no action and wait for the next event. Otherwise, continue from where you left off.")
    hook(repo, "msg", {"prompt": riavvio})
    open(os.path.join(repo, "a.txt"), "w").write("quattro-quater\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "avviso del riavvio ignorato")
    hook(repo, "msg", {"prompt": "secondo messaggio, di nuovo\n" + riavvio})
    open(os.path.join(repo, "a.txt"), "w").write("quattro-quinquies\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    m = git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md")
    controlla("secondo messaggio, di nuovo" in m and "restarted" not in m, "avviso del riavvio tolto dal messaggio vero")

    # 3d. E29: un segreto incollato in chat non arriva su GitHub (resto del messaggio intatto)
    url = "https://script.google.com/macros/s/AKfycbFINTO0123456789abcdefghijklmnopqrstuvwxyz_-ABCDEF/exec"
    segreti = [url, "AIzaSyFINTA0123456789abcdefghijklmnopq", "ghp_FINTO0123456789abcdefghijklmnop",
               "sk-ant-api03-FINTA0123456789abcdef", "FINTO9x8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3", "valore-env-segreto-123"]
    testo = ("ecco il link " + url + " e la chiave " + " ".join(segreti[1:5]) + " e " + segreti[5] +
             " · normale https://claude.ai/code perché è così")
    env_prova = dict(os.environ, CLAUDE_PROJECT_DIR=repo, PROVA_DRIVE_URL=segreti[5])
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), "msg"], cwd=repo, input=json.dumps({"prompt": testo}),
                   text=True, env=env_prova, timeout=90)
    open(os.path.join(repo, "a.txt"), "w").write("cinque\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    salvato = git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md")
    controlla(not any(s in salvato for s in segreti) and "AKfyc" not in salvato, "segreti tolti dalla scorta")
    controlla(salvato.count("[segreto tolto dalla scorta]") == 6, "ogni segreto segnato come tolto")
    controlla("ecco il link" in salvato and "https://claude.ai/code perché è così" in salvato, "il resto del messaggio resta")

    # 3e. Mario 17/10: «salva» scritto col limite finito → la scorta parte già col messaggio, senza aspettare la fine risposta
    open(os.path.join(repo, "a.txt"), "w").write("sei\n")
    hook(repo, "msg", {"prompt": "salva 99%"})
    s4 = remoto_scorta(repo)
    controlla(s4 != s3 and git(repo, "show", f"{s4}:a.txt") == "sei", "il messaggio fa subito la scorta del lavoro")
    controlla("salva 99%" in git(repo, "show", f"{s4}:docs/ULTIMO-MESSAGGIO.md"), "messaggio nella scorta subito")

    # 3f. scorta a metà risposta (dopo uno strumento), al massimo ogni 2 minuti
    gitdir = git(repo, "rev-parse", "--absolute-git-dir")
    segno = os.path.join(gitdir, "scorta-ora")
    if os.path.exists(segno):
        os.remove(segno)
    open(os.path.join(repo, "a.txt"), "w").write("sette\n")
    hook(repo, "tool")
    s5 = remoto_scorta(repo)
    controlla(s5 != s4 and git(repo, "show", f"{s5}:a.txt") == "sette", "scorta dopo uno strumento")
    open(os.path.join(repo, "a.txt"), "w").write("otto\n")
    hook(repo, "tool")
    time.sleep(1)
    controlla(remoto_scorta(repo) == s5, "seconda scorta entro 2 minuti saltata")
    os.utime(segno, (time.time() - 200, time.time() - 200))
    hook(repo, "tool")
    s3 = remoto_scorta(repo)
    controlla(s3 != s5 and git(repo, "show", f"{s3}:a.txt") == "otto", "dopo 2 minuti la scorta riparte")

    # 4. sessione nuova da un altro clone: avvio-check segnala la scorta e il merge è in avanti
    altro = os.path.join(tmp, "altro")
    sh("git", "clone", "-q", "-b", "claude/prova-1", nudo, altro, cwd=tmp)
    env = dict(os.environ, CLAUDE_PROJECT_DIR=altro)
    avvio = lambda: sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=altro, inp="{}", env=env)
    out = avvio()
    controlla("SCORTA della chat principale: origin/scorta-principale/claude/prova-1" in out, "avvio-check segnala la scorta")
    git(altro, "merge", "-q", "--ff-only", "origin/scorta-principale/claude/prova-1")
    controlla(git(altro, "rev-parse", "HEAD") == s3, "la scorta si unisce in avanti")
    controlla("SCORTA" not in avvio(), "dopo l'unione nessun avviso")

    # 5. C148: la chat parallela ha la sua scorta (ruolo dal prompt di avvio) e il suo file del messaggio
    controlla(ruolo_file(repo) == "principale", "sessione aperta a mano (niente [AVVIO]) → principale")
    par = clona(tmp, "parallela")
    hook(par, "msg", {"prompt": AVVIO_PAR})
    controlla(ruolo_file(par) == "parallela", "prompt «Sei la chat parallela» → ruolo parallela")
    hook(par, "msg", {"prompt": "ciao dalla parallela"})
    open(os.path.join(par, "b.txt"), "w").write("parallela\n")
    hook(par, "stop")
    p1 = remoto_scorta(par, "parallela")
    controlla(bool(p1) and git(par, "show", f"{p1}:b.txt") == "parallela", "scorta della parallela nel suo ramo")
    controlla("ciao dalla parallela" in git(par, "show", f"{p1}:docs/ULTIMO-MESSAGGIO-PARALLELA.md"),
              "messaggio della parallela nel suo file")
    controlla(remoto_scorta(repo) == s3, "la scorta della principale non si muove")

    # 6. il ruolo: avvio della principale che nomina la parallela, riavvio (trascrizione), a mano
    prin = clona(tmp, "principale2")
    hook(prin, "msg", {"prompt": "[AVVIO] Sei la sessione principale #283 del progetto (la chat parallela P40 resta): git fetch"},
         nopush=True)
    controlla(ruolo_file(prin) == "principale", "avvio della principale che nomina la parallela → principale")
    riav = clona(tmp, "riavvio")
    trascr = os.path.join(tmp, "trascrizione.jsonl")
    with open(trascr, "w") as f:
        f.write(json.dumps({"type": "system"}) + "\nnon json\n")
        f.write(json.dumps({"type": "user", "message": {"role": "user", "content": AVVIO_PAR}}) + "\n")
    hook(riav, "msg", {"prompt": "eccomi, continua", "transcript_path": trascr}, nopush=True)
    controlla(ruolo_file(riav) == "parallela", "riavvio in un contenitore nuovo: ruolo ritrovato nella trascrizione")
    out = sh(sys.executable, "-I", os.path.join(HOOKS, "scorta.py"), "ruolo", "parallela", cwd=prin,
             env=dict(os.environ, CLAUDE_PROJECT_DIR=prin))
    controlla(out.endswith("parallela") and ruolo_file(prin) == "parallela", "ruolo scritto a mano")

    # 7. C252: push non in avanti (un altro contenitore ha scritto nella stessa scorta): niente unione col proprio
    #    albero (copriva i suoi file, E154), niente push; avviso «SCORTA FERMA» finché il ramo non la contiene
    intruso = clona(tmp, "intruso")
    git(intruso, "merge", "-q", "--ff-only", "origin/scorta-principale/claude/prova-1")
    open(os.path.join(intruso, "c.txt"), "w").write("intruso\n")
    git(intruso, "add", "-A")
    git(intruso, "commit", "-q", "-m", "intruso")
    git(intruso, "push", "-q", "origin", "HEAD:refs/heads/scorta-principale/claude/prova-1")
    estraneo = git(intruso, "rev-parse", "HEAD")
    open(os.path.join(repo, "a.txt"), "w").write("nove\n")
    hook(repo, "stop")
    ferma = os.path.join(gitdir, "scorta-ferma")
    controlla(aspetta_file(ferma), "push rifiutato da una scorta estranea: segno «ferma»")
    remota = git(repo, "ls-remote", "origin", "refs/heads/scorta-principale/claude/prova-1").split("\t")[0]
    controlla(remota == estraneo and git(repo, "show", f"{remota}:c.txt") == "intruso",
              "la scorta dell'altro contenitore resta intatta su GitHub")
    out = hook_out(repo, "msg", {"prompt": "come va?"})
    controlla("SCORTA FERMA" in out and "git merge origin/scorta-principale/claude/prova-1" in out,
              "al messaggio dopo l'avviso con il merge da fare")
    # C276: ferma, ma il lavoro e il messaggio arrivano lo stesso su GitHub, su un ramo a parte di questo contenitore
    parte = open(os.path.join(gitdir, "scorta-a-parte")).read().strip()
    controlla(parte.startswith("scorta-principale/claude/prova-1-ferma-"), "C276: scorta ferma → ramo a parte")
    sp = remoto(repo, parte)
    controlla(bool(sp) and git(repo, "show", f"{sp}:a.txt") == "nove"
              and "come va?" in git(repo, "show", f"{sp}:docs/ULTIMO-MESSAGGIO.md"),
              "C276: lavoro e messaggio salvati lo stesso su GitHub, a parte")
    controlla(git(repo, "ls-remote", "origin", "refs/heads/scorta-principale/claude/prova-1").split("\t")[0] == estraneo
              and subprocess.run(["git", "merge-base", "--is-ancestor", estraneo, sp], cwd=repo).returncode != 0,
              "C276: la scorta dell'altro resta intatta e il ramo a parte non la copre (E154)")
    open(os.path.join(repo, "a.txt"), "w").write("nove-bis\n")
    hook(repo, "stop")
    sp2 = remoto(repo, parte)
    controlla(sp2 != sp and git(repo, "show", f"{sp2}:a.txt") == "nove-bis"
              and subprocess.run(["git", "merge-base", "--is-ancestor", sp, sp2], cwd=repo).returncode == 0,
              "C276: sul ramo a parte ogni scorta va in avanti")
    git(repo, "checkout", "-q", "--", "a.txt")
    git(repo, "fetch", "-q", "origin")
    git(repo, "merge", "-q", "--ff-only", "origin/scorta-principale/claude/prova-1")
    open(os.path.join(repo, "a.txt"), "w").write("nove\n")
    out = hook_out(repo, "msg", {"prompt": "unita"})
    s6 = remoto_scorta(repo)
    controlla("SCORTA FERMA" not in out and not os.path.exists(ferma), "dopo l'unione niente avviso")
    controlla(subprocess.run(["git", "merge-base", "--is-ancestor", estraneo, s6], cwd=repo).returncode == 0
              and git(repo, "show", f"{s6}:a.txt") == "nove" and git(repo, "show", f"{s6}:c.txt") == "intruso",
              "dopo l'unione la scorta riparte con il lavoro di tutti e due")
    controlla(aspetta_chiusa(repo, parte) and aspetta_sparito(os.path.join(gitdir, "scorta-a-parte"))
              and git(repo, "rev-parse", "-q", "--verify", f"refs/{parte}") == "",
              "C276: ripartita la scorta normale, il ramo a parte si chiude")

    # 7b. E154 (avvio della #290): contenitore nuovo, la scorta di prima è su GitHub e non nel ramo → niente scorta
    nuovo_c = clona(tmp, "contenitore-nuovo")
    hook(nuovo_c, "msg", {"prompt": "[AVVIO] Sei la sessione principale #2: git fetch"})
    controlla(git(nuovo_c, "rev-parse", "-q", "--verify", "refs/scorta-principale/claude/prova-1") == ""
              and git(nuovo_c, "ls-remote", "origin", "refs/heads/scorta-principale/claude/prova-1").split("\t")[0] == s6,
              "contenitore nuovo: niente scorta finché quella di prima non è unita")
    controlla(os.path.exists(os.path.join(git(nuovo_c, "rev-parse", "--absolute-git-dir"), "scorta-ferma")),
              "contenitore nuovo: segno «ferma» scritto")
    controlla(not os.path.exists(os.path.join(git(nuovo_c, "rev-parse", "--absolute-git-dir"), "scorta-a-parte")),
              "C276: contenitore nuovo senza modifiche: niente ramo a parte")
    # stessa cosa se il riferimento remoto non è ancora stato scaricato: lo ferma il push rifiutato
    cieco = clona(tmp, "contenitore-cieco")
    git(cieco, "update-ref", "-d", "refs/remotes/origin/scorta-principale/claude/prova-1")
    open(os.path.join(cieco, "d.txt"), "w").write("cieco\n")
    hook(cieco, "stop")
    controlla(aspetta_file(os.path.join(git(cieco, "rev-parse", "--absolute-git-dir"), "scorta-ferma"))
              and git(cieco, "ls-remote", "origin", "refs/heads/scorta-principale/claude/prova-1").split("\t")[0] == s6,
              "contenitore nuovo senza fetch: push fermato, la scorta di prima resta")
    hook(cieco, "stop")
    parte_c = open(os.path.join(git(cieco, "rev-parse", "--absolute-git-dir"), "scorta-a-parte")).read().strip()
    pc = remoto(cieco, parte_c)
    controlla(parte_c != parte and bool(pc) and git(cieco, "show", f"{pc}:d.txt") == "cieco",
              "C276: un altro contenitore fermo salva sul suo ramo a parte")

    # 8. avvio-check con due scorte: ruolo non ancora noto → tutte e due; ruolo noto → la sua e una notizia
    #    C276: anche i rami a parte aperti degli ultimi 7 giorni (non quelli chiusi, non quelli vecchi)
    git(intruso, "push", "-q", "origin", f"{estraneo}:refs/heads/scorta-principale/claude/prova-1-ferma-20200101-000000-abcd")
    out = avvio()
    controlla("SCORTA della chat principale" in out and "SCORTA della chat parallela" in out and "Ruolo:" in out,
              "ruolo non noto: avvisa delle due scorte e dice come scegliere")
    controlla(f"SCORTA A PARTE della chat principale: origin/{parte_c}" in out and parte not in out
              and "ferma-20200101" not in out, "C276: all'avvio il ramo a parte aperto, non quello chiuso né il vecchio")
    open(os.path.join(git(altro, "rev-parse", "--absolute-git-dir"), "scorta-ruolo"), "w").write("principale\n")
    out = avvio()
    controlla("SCORTA della chat principale" in out and "Notizia: anche origin/scorta-parallela/claude/prova-1" in out
              and "SCORTA della chat parallela" not in out, "ruolo noto: la sua scorta, l'altra solo notizia")

    # 9. C276: la sessione dopo unisce il ramo a parte rimasto aperto (contenitore morto); la sua scorta normale lo chiude
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(altro, "config", k, v)
    git(altro, "merge", "-q", "--ff-only", "origin/scorta-principale/claude/prova-1")
    git(altro, "merge", "-q", "--no-edit", f"origin/{parte_c}")
    controlla(open(os.path.join(altro, "d.txt")).read() == "cieco\n", "C276: il lavoro del ramo a parte si unisce")
    open(os.path.join(altro, "e.txt"), "w").write("dopo\n")
    sh(sys.executable, os.path.join(HOOKS, "scorta.py"), "stop", cwd=altro, inp="{}",
       env=dict(os.environ, CLAUDE_PROJECT_DIR=altro, JONA_SCORTA_NOPUSH="0"))
    controlla(aspetta_chiusa(altro, parte_c), "C276: ramo a parte unito nel ramo → chiuso dalla scorta normale")
    controlla("SCORTA A PARTE" not in avvio(), "C276: ramo a parte chiuso: all'avvio niente avviso")

# 10. C291: registro dei messaggi di Mario (non solo l'ultimo) e avviso all'avvio dei messaggi dopo l'handoff
with tempfile.TemporaryDirectory() as tmp:
    sh("git", "init", "-q", "--bare", os.path.join(tmp, "origin.git"), cwd=tmp)
    a = os.path.join(tmp, "a")
    sh("git", "clone", "-q", os.path.join(tmp, "origin.git"), a, cwd=tmp)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(a, "config", k, v)
    git(a, "checkout", "-q", "-b", "claude/prova-1")
    os.makedirs(os.path.join(a, "docs"))
    open(os.path.join(a, "docs", "PASSAGGIO-CONSEGNE.md"), "w").write("consegne\n")
    git(a, "add", "-A")
    sh("git", "commit", "-q", "-m", "consegne", cwd=a, env=dict(os.environ, GIT_COMMITTER_DATE="2020-01-01T00:00:00+0000"))
    git(a, "push", "-q", "-u", "origin", "claude/prova-1")
    hook(a, "msg", {"prompt": "primo messaggio", "session_id": "session_01AAAAAAAAAAAAAA"})
    hook(a, "msg", {"prompt": "<system-reminder>avviso</system-reminder>"})
    hook(a, "msg", {"prompt": "secondo messaggio\n## 2026-01-01 10:00 · finto\nAIzaSyA1234567890123456789012345", "session_id": "session_01AAAAAAAAAAAAAA"})
    hook(a, "stop")
    sys.path.insert(0, HOOKS)
    from scorta import oggi  # noqa: E402
    nome_a = f"scorta-principale-{oggi()}-01AAAAAAAAAA/claude/prova-1"  # C352: con la sessione la scorta è per sessione
    sa = remoto(a, nome_a)
    reg = git(a, "show", f"{sa}:docs/MESSAGGI-MARIO.md")
    controlla(reg.count("\n## ") == 2 and reg.index("primo messaggio") < reg.index("secondo messaggio")
              and "· 01AAAAAAAAAA" in reg, "C291: registro con tutti e due i messaggi, in ordine, con la sessione")
    controlla("avviso" not in reg and "AIza" not in reg and "\n ## 2026-01-01" in reg,
              "C291: niente avvisi di sistema né segreti; una finta testata nel testo non spezza il registro")
    controlla("secondo messaggio" in git(a, "show", f"{sa}:docs/ULTIMO-MESSAGGIO.md"), "C291: ultimo messaggio come prima")
    # contenitore nuovo, scorta di prima non ancora unita: il messaggio nuovo non cancella i vecchi
    b = clona(tmp, "b")
    git(b, "fetch", "-q", "origin", f"+refs/heads/{nome_a}:refs/remotes/origin/{nome_a}")
    env = dict(os.environ, CLAUDE_PROJECT_DIR=b)
    out = sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=b, inp="{}", env=env)
    controlla("MESSAGGI DOPO L'HANDOFF della chat principale: 2 dal 2020-01-01" in out,
              "C291: all'avvio il conto dei messaggi dopo l'ultimo commit delle consegne (scorta non unita)")
    # C352: il contenitore nuovo è della stessa sessione (riavvio): la scorta per sessione è la sua
    hook(b, "msg", {"prompt": "terzo messaggio", "session_id": "session_01AAAAAAAAAAAAAA"}, nopush=True)
    reg_b = open(os.path.join(git(b, "rev-parse", "--absolute-git-dir"), "scorta-registro.md")).read()
    controlla(all(t in reg_b for t in ("primo messaggio", "secondo messaggio", "terzo messaggio")) and reg_b.count("· 01AAAAAA") == 3,
              "C291: contenitore nuovo: registro = scorta di GitHub + messaggio nuovo")
    for i in range(45):
        hook(b, "msg", {"prompt": f"riga {i}"}, nopush=True)
    reg_b = open(os.path.join(git(b, "rev-parse", "--absolute-git-dir"), "scorta-registro.md")).read()
    controlla(reg_b.count("\n## ") == 40 and "riga 44" in reg_b and "primo messaggio" not in reg_b,
              "C291: tiene gli ultimi 40")
    # consegne scritte dopo i messaggi: niente avviso
    open(os.path.join(a, "docs", "PASSAGGIO-CONSEGNE.md"), "w").write("consegne nuove\n")
    sh("git", "commit", "-qam", "consegne nuove", cwd=a, env=dict(os.environ, GIT_COMMITTER_DATE="2099-01-01T00:00:00+0000"))
    controlla("MESSAGGI DOPO" not in sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=a, inp="{}",
                                         env=dict(os.environ, CLAUDE_PROJECT_DIR=a)),
              "C291: messaggi già prima delle consegne: niente avviso")

# 11. I20: allo Stop l'inizio dell'ultima risposta di Claude, segreti tolti, nella scorta della propria chat
with tempfile.TemporaryDirectory() as tmp:
    sh("git", "init", "-q", "--bare", os.path.join(tmp, "origin.git"), cwd=tmp)
    a = os.path.join(tmp, "a")
    sh("git", "clone", "-q", os.path.join(tmp, "origin.git"), a, cwd=tmp)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(a, "config", k, v)
    git(a, "checkout", "-q", "-b", "claude/prova-1")
    open(os.path.join(a, "x.txt"), "w").write("x\n")
    git(a, "add", "-A")
    git(a, "commit", "-q", "-m", "inizio")
    git(a, "push", "-q", "-u", "origin", "claude/prova-1")
    tr = os.path.join(tmp, "trascrizione.jsonl")
    lungo = "parola " * 200
    righe = [
        {"type": "user", "message": {"content": "[AVVIO] Sei la chat parallela"}},
        {"type": "assistant", "message": {"content": [{"type": "text", "text": "risposta vecchia"}]}},
        {"type": "assistant", "message": {"content": [{"type": "thinking", "thinking": "pensiero segreto"},
                                                      {"type": "text", "text": "✅ FATTO chiave ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123 " + lungo}]}},
        {"type": "assistant", "message": {"content": [{"type": "tool_use", "name": "Bash", "input": {}}]}},
        {"type": "user", "message": {"content": [{"type": "tool_result", "content": "uscita"}]}},
    ]
    open(tr, "w").write("\n".join(json.dumps(r) for r in righe) + "\n")
    hook(a, "stop", {"transcript_path": tr})
    sa = remoto(a, "scorta-parallela/claude/prova-1")
    risp = git(a, "show", f"{sa}:docs/ULTIMA-RISPOSTA-PARALLELA.md")
    controlla(risp.startswith("# Ultima risposta di Claude (") and "✅ FATTO chiave [segreto tolto dalla scorta]" in risp,
              "I20: ultima risposta dalla trascrizione, nella scorta della parallela, segreto tolto")
    controlla("ghp_" not in risp and "pensiero" not in risp and "vecchia" not in risp and len(risp) < 700
              and risp.rstrip().endswith("…"), "I20: niente pensieri né strumenti, solo l'ultima, tagliata con «…»")
    controlla(git(a, "show", "-s", "--format=%s", "HEAD") == "inizio" and not git(a, "status", "--porcelain"),
              "I20: il ramo di lavoro e i file non cambiano")
    # campo dello Stop, se c'è, prima della trascrizione; senza testo resta la risposta di prima
    hook(a, "stop", {"transcript_path": tr, "last_assistant_message": "Risposta dal campo"})
    controlla("Risposta dal campo" in git(a, "show", f"{remoto(a, 'scorta-parallela/claude/prova-1')}:docs/ULTIMA-RISPOSTA-PARALLELA.md"),
              "I20: last_assistant_message vince sulla trascrizione")
    hook(a, "stop", {"transcript_path": os.path.join(tmp, "manca.jsonl")})
    controlla("Risposta dal campo" in git(a, "show", f"{remoto(a, 'scorta-parallela/claude/prova-1')}:docs/ULTIMA-RISPOSTA-PARALLELA.md"),
              "I20: trascrizione mancante: resta la risposta di prima, nessun errore")
    # le domande a Mario (blocco «❓», in fondo alla risposta) vanno a parte: il sito sa che la chat aspetta lui
    hook(a, "stop", {"last_assistant_message": "✅ FATTO tutto.\n\n───\n❓ **DOMANDE**\n1. Va bene? 1 · Sì · 2 · No\n───\n⚠️ nota"})
    risp = git(a, "show", f"{remoto(a, 'scorta-parallela/claude/prova-1')}:docs/ULTIMA-RISPOSTA-PARALLELA.md")
    controlla("✅ FATTO tutto." in risp and "\n## Domande a Mario\n\n❓ **DOMANDE**\n1. Va bene?" in risp and "nota" not in risp
              and risp.index("FATTO") < risp.index("## Domande"), "I20: domande a Mario a parte, sotto «## Domande a Mario»")
    hook(a, "stop", {"last_assistant_message": "Risposta dal campo"})
    hook(a, "msg", {"prompt": "messaggio di Mario"})
    controlla("Risposta dal campo" in git(a, "show", f"{remoto(a, 'scorta-parallela/claude/prova-1')}:docs/ULTIMA-RISPOSTA-PARALLELA.md")
              and "messaggio di Mario" in git(a, "show", f"{remoto(a, 'scorta-parallela/claude/prova-1')}:docs/ULTIMO-MESSAGGIO-PARALLELA.md"),
              "I20: al messaggio di Mario la risposta salvata resta nella scorta")

# 12. C352: ruolo da tutto l'[AVVIO]; sessione nel messaggio della scorta e all'avvio «tua» / «di un'altra»;
#     scorta che cambia solo i suoi file = «senza lavoro nuovo»; scorta vecchia assorbita senza «SCORTA FERMA»
with tempfile.TemporaryDirectory() as tmp:
    sh("git", "init", "-q", "--bare", os.path.join(tmp, "origin.git"), cwd=tmp)
    a = os.path.join(tmp, "a")
    sh("git", "clone", "-q", os.path.join(tmp, "origin.git"), a, cwd=tmp)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(a, "config", k, v)
    git(a, "checkout", "-q", "-b", "claude/prova-1")
    os.makedirs(os.path.join(a, "docs"))
    open(os.path.join(a, "a.txt"), "w").write("uno\n")
    open(os.path.join(a, ".gitattributes"), "w").write("docs/ULTIMA-RISPOSTA*.md merge=scorta\n")
    git(a, "add", "-A")
    git(a, "commit", "-q", "-m", "primo")
    git(a, "push", "-q", "-u", "origin", "claude/prova-1")
    avvio_p44 = "[AVVIO] Chat parallela P44 «Handoff veloce» del progetto: git fetch origin claude/prova-1\nSei la chat parallela: leggi"
    hook(a, "msg", {"prompt": avvio_p44, "session_id": "session_01PPPPPPPPPPPPPP"})
    controlla(ruolo_file(a) == "parallela", "C352: «Sei la chat parallela» sulla seconda riga → parallela")
    hook(a, "msg", {"prompt": "lavoro della P44", "session_id": "session_01PPPPPPPPPPPPPP"})
    open(os.path.join(a, "b.txt"), "w").write("nuovo\n")
    hook(a, "stop", {"session_id": "session_01PPPPPPPPPPPPPP"})
    nome = f"scorta-parallela-{oggi()}-01PPPPPPPPPP/claude/prova-1"
    sp = remoto(a, nome)
    controlla("sessione 01PPPPPPPPPP)" in git(a, "log", "-1", "--format=%s", sp), "C352: la sessione nel messaggio della scorta")
    b = clona(tmp, "b")
    avvio_b = lambda dati: sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=b, inp=json.dumps(dati),
                              env=dict(os.environ, CLAUDE_PROJECT_DIR=b))
    out = avvio_b({"session_id": "session_01PPPPPPPPPPPPPP"})
    controlla(f"SCORTA della chat parallela: origin/{nome}" in out and "della tua sessione (01PPPPPPPPPP: riavvio)" in out,
              "C352: stessa sessione → riavvio, unirla")
    out = avvio_b({"session_id": "session_01QQQQQQQQQQQQQQ"})
    controlla("della sessione 01PPPPPPPPPP, non della tua" in out and "NON unirla (E97)" in out,
              "C352: un'altra sessione → tua solo se chiusa, mai se la chat è attiva")
    out = avvio_b({})
    controlla(f"SCORTA della chat parallela: origin/{nome}" in out and "della sessione 01PPPPPPPPPP." in out
              and "non della tua" not in out, "C352: senza id nello stdin solo di chi è, niente giudizio")
    # scorta già unita nel ramo + una scorta nuova che cambia solo docs/ULTIMA-RISPOSTA-PARALLELA.md → niente da unire
    git(b, "merge", "-q", "--ff-only", f"origin/{nome}")
    git(b, "push", "-q", "origin", "claude/prova-1")
    os.remove(os.path.join(a, "b.txt"))  # ora è nel ramo: il pull lo riscrive
    git(a, "pull", "-q", "--ff-only", "origin", "claude/prova-1")
    controlla(git(a, "rev-parse", "HEAD") == sp, "C352: il ramo di a contiene la scorta unita")
    trascr = os.path.join(tmp, "trascrizione.jsonl")
    with open(trascr, "w") as f:
        f.write(json.dumps({"type": "assistant", "message": {"content": [{"type": "text", "text": "Risposta nuova"}]}}) + "\n")
    hook(a, "stop", {"session_id": "session_01PPPPPPPPPPPPPP", "transcript_path": trascr})
    sp2 = remoto(a, nome)
    controlla(sp2 != sp and git(a, "diff", "--name-only", "HEAD", sp2) == "docs/ULTIMA-RISPOSTA-PARALLELA.md",
              "C352: scorta con solo l'ultima risposta")
    git(b, "fetch", "-q", "origin")
    out = avvio_b({"session_id": "session_01QQQQQQQQQQQQQQ"})
    controlla("Scorte senza lavoro nuovo" in out and f"origin/{nome} (niente)" in out and "SCORTA della chat" not in out,
              "C352: scorta che cambia solo i suoi file → «senza lavoro nuovo», non proposta")
    # scorta vecchia: il ramo cambia dopo le stesse righe → «vecchia»; il contenitore nuovo la assorbe come genitore
    open(os.path.join(a, "a.txt"), "w").write("scorta vecchia\n")
    hook(a, "stop", {"session_id": "session_01PPPPPPPPPPPPPP", "transcript_path": trascr})
    sp3 = remoto(a, nome)
    open(os.path.join(b, "a.txt"), "w").write("ramo avanti\n")
    git(b, "commit", "-qam", "ramo avanti")
    git(b, "push", "-q", "origin", "claude/prova-1")
    git(b, "fetch", "-q", "origin")
    out = avvio_b({"session_id": "session_01QQQQQQQQQQQQQQ"})
    controlla(f"origin/{nome} (vecchia)" in out and "SCORTA della chat" not in out, "C352: scorta superata dal ramo → ignorata")
    c = clona(tmp, "c")  # contenitore nuovo della stessa sessione (riavvio): trova la propria scorta superata
    hook(c, "msg", {"prompt": avvio_p44, "session_id": "session_01PPPPPPPPPPPPPP"})
    open(os.path.join(c, "c.txt"), "w").write("lavoro P45\n")
    out = hook_out(c, "stop", {"session_id": "session_01PPPPPPPPPPPPPP"})
    sp4 = remoto(c, nome)
    controlla("SCORTA FERMA" not in out and sp4 != sp3
              and subprocess.run(["git", "merge-base", "--is-ancestor", sp3, sp4], cwd=c).returncode == 0
              and git(c, "show", f"{sp4}:c.txt") == "lavoro P45" and git(c, "show", f"{sp4}:a.txt") == "ramo avanti"
              and not os.path.exists(os.path.join(git(c, "rev-parse", "--absolute-git-dir"), "scorta-ferma")),
              "C352: la scorta vecchia è assorbita come genitore, niente «SCORTA FERMA»")
    controlla("sessione 01PPPPPPPPPP)" in git(c, "log", "-1", "--format=%s", sp4)
              and open(os.path.join(git(c, "rev-parse", "--absolute-git-dir"), "scorta-sessione")).read().split() == ["01PPPPPPPPPP", oggi()],
              "C352: il contenitore nuovo ritrova data e ramo della propria scorta su GitHub")
    # clone poco profondo (come il contenitore in cloud): senza la base comune la scorta vecchia passava per «nuovo»
    for i in range(3):  # il ramo scrive c.txt in un altro modo: la scorta di c è superata («vecchia»)
        open(os.path.join(b, "c.txt"), "w").write(f"ramo avanti {i}\n")
        git(b, "add", "c.txt")
        git(b, "commit", "-qm", f"ramo avanti {i}")
    git(b, "push", "-q", "origin", "claude/prova-1")
    d = os.path.join(tmp, "d")
    sh("git", "clone", "-q", "--depth", "1", "-b", "claude/prova-1", "file://" + os.path.join(tmp, "origin.git"), d, cwd=tmp)
    controlla(git(d, "rev-parse", "--is-shallow-repository") == "true", "C352: clone poco profondo come in cloud")
    out = sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=d, inp=json.dumps({"session_id": "session_01RRRRRRRRR"}),
             env=dict(os.environ, CLAUDE_PROJECT_DIR=d))
    controlla(f"origin/{nome} (vecchia)" in out and "SCORTA della chat" not in out
              and git(d, "merge-base", "HEAD", f"origin/{nome}") != "",
              "C352: clone poco profondo: l'hook scava la storia e la scorta superata resta ignorata")


# 13. C352 (Mario 30/10 «1 ok»): una scorta per SESSIONE: scorta-<ruolo>-<AAAAMMGG>-<id>/<ramo>. Due parallele con id
#     diversi → due rami, nessuna «SCORTA FERMA»; l'avvio le elenca con «tua» / «di un'altra»; riavvio con lo stesso id →
#     stesso ramo; nome vecchio (senza id) ancora letto; scorte di sessioni ferme da settimane contate in una riga.
with tempfile.TemporaryDirectory() as tmp:
    sh("git", "init", "-q", "--bare", os.path.join(tmp, "origin.git"), cwd=tmp)
    a = os.path.join(tmp, "a")
    sh("git", "clone", "-q", os.path.join(tmp, "origin.git"), a, cwd=tmp)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(a, "config", k, v)
    git(a, "checkout", "-q", "-b", "claude/prova-1")
    os.makedirs(os.path.join(a, "docs"))
    open(os.path.join(a, "a.txt"), "w").write("uno\n")
    git(a, "add", "-A")
    git(a, "commit", "-q", "-m", "primo")
    git(a, "push", "-q", "-u", "origin", "claude/prova-1")
    sys.path.insert(0, HOOKS)
    from scorta import oggi, leggi_nome_scorta  # noqa: E402
    data = oggi()
    avvio = lambda repo, dati: sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=repo, inp=json.dumps(dati),
                                  env=dict(os.environ, CLAUDE_PROJECT_DIR=repo))
    sess_file = lambda repo: open(os.path.join(git(repo, "rev-parse", "--absolute-git-dir"), "scorta-sessione")).read().strip()
    # sessione P (chat parallela «Handoff»)
    hook(a, "msg", {"prompt": AVVIO_PAR, "session_id": "session_01PPPPPPPPPPPPPP"})
    open(os.path.join(a, "p.txt"), "w").write("lavoro P\n")
    out = hook_out(a, "stop", {"session_id": "session_01PPPPPPPPPPPPPP"})
    nome_p = f"scorta-parallela-{data}-01PPPPPPPPPP/claude/prova-1"
    sp = remoto(a, nome_p)
    controlla(sp and git(a, "show", f"{sp}:p.txt") == "lavoro P" and "sessione 01PPPPPPPPPP)" in git(a, "log", "-1", "--format=%s", sp),
              "C352: scorta per sessione: scorta-parallela-<data>-<id>/<ramo> con la sessione nel messaggio")
    controlla(sess_file(a) == f"01PPPPPPPPPP {data}", "C352: .git/scorta-sessione tiene id e data del primo salvataggio")
    controlla(leggi_nome_scorta(nome_p, "claude/prova-1") == {"nome": nome_p, "ruolo": "parallela", "data": data, "id": "01PPPPPPPPPP",
                                                               "ramo": "claude/prova-1", "ferma": ""}
              and leggi_nome_scorta("scorta-principale/claude/prova-1-ferma-20261030-081757-471c", "claude/prova-1")["ferma"] == "-ferma-20261030-081757-471c"
              and leggi_nome_scorta(nome_p, "claude/altro") is None, "C352: leggi_nome_scorta legge nome nuovo, vecchio e -ferma-")
    # sessione Q (un'altra chat parallela, es. Atlante), nello stesso momento: il suo ramo, nessuna «SCORTA FERMA»
    b = clona(tmp, "b")
    hook(b, "msg", {"prompt": AVVIO_PAR.replace("P40", "P41"), "session_id": "session_01QQQQQQQQQQQQQQ"})
    open(os.path.join(b, "q.txt"), "w").write("lavoro Q\n")
    out = hook_out(b, "stop", {"session_id": "session_01QQQQQQQQQQQQQQ"})
    nome_q = f"scorta-parallela-{data}-01QQQQQQQQQQ/claude/prova-1"
    sq = remoto(b, nome_q)
    controlla(sq and sq != sp and "SCORTA FERMA" not in out and git(b, "show", f"{sq}:q.txt") == "lavoro Q"
              and not os.path.exists(os.path.join(git(b, "rev-parse", "--absolute-git-dir"), "scorta-ferma")),
              "C352: due parallele insieme → due rami di scorta, nessuna si ferma")
    vive = sh(sys.executable, "-I", "-c", f"import sys; sys.path.insert(0, {HOOKS!r}); import scorta; "
              "print(sorted(v['id'] for v in scorta.scorte_vive('claude/prova-1')))", cwd=b, env=dict(os.environ, CLAUDE_PROJECT_DIR=b))
    controlla(vive == "['01PPPPPPPPPP', '01QQQQQQQQQQ']", "C352: scorte_vive elenca le scorte del ramo da ls-remote")
    # avvio di un contenitore nuovo della sessione Q (riavvio): la sua è «tua», quella di P «di un'altra»
    c = clona(tmp, "c")
    out = avvio(c, {"session_id": "session_01QQQQQQQQQQQQQQ"})
    controlla(f"origin/{nome_q}" in out and "della tua sessione (01QQQQQQQQQQ: riavvio)" in out
              and f"origin/{nome_p}" in out and "della sessione 01PPPPPPPPPP, non della tua" in out,
              "C352: l'avvio elenca tutte le scorte vive del ramo: «tua: riavvio» e «di un'altra»")
    controlla(sess_file(c) == f"01QQQQQQQQQQ {data}", "C352: l'avvio scrive id e data (dalla scorta già su GitHub)")
    hook(c, "msg", {"prompt": AVVIO_PAR.replace("P40", "P41"), "session_id": "session_01QQQQQQQQQQQQQQ"})
    git(c, "merge", "-q", f"origin/{nome_q}")  # come dice l'avvio: la propria scorta si unisce
    open(os.path.join(c, "q2.txt"), "w").write("lavoro Q dopo il riavvio\n")
    out = hook_out(c, "stop", {"session_id": "session_01QQQQQQQQQQQQQQ"})
    sq2 = remoto(c, nome_q)
    controlla(sq2 and sq2 != sq and "SCORTA FERMA" not in out and git(c, "show", f"{sq2}:q2.txt") == "lavoro Q dopo il riavvio"
              and subprocess.run(["git", "merge-base", "--is-ancestor", sq, sq2], cwd=c).returncode == 0,
              "C352: riavvio con lo stesso id → la scorta continua sullo stesso ramo")
    # nome vecchio (sessione senza id, es. hook vecchio in un'altra chat) ancora letto all'avvio
    d = clona(tmp, "d")
    hook(d, "msg", {"prompt": "[AVVIO] Sei la chat principale #99 (ramo claude/prova-1)"})
    open(os.path.join(d, "vecchia.txt"), "w").write("scorta col nome vecchio\n")
    hook(d, "stop", {})
    sv = remoto(d, "scorta-principale/claude/prova-1")
    controlla(sv and git(d, "show", f"{sv}:vecchia.txt") == "scorta col nome vecchio", "C352: senza id resta il nome vecchio")
    out = avvio(c, {"session_id": "session_01QQQQQQQQQQQQQQ"})
    controlla("Notizia: anche origin/scorta-principale/claude/prova-1 (chat principale)" in out,
              "C352: il nome vecchio si legge ancora all'avvio (chat principale: non mia)")
    # scorta di una sessione ferma da settimane: contata in una riga, non scaricata
    git(d, "push", "-q", "origin", f"{sv}:refs/heads/scorta-parallela-20250101-01OLDOLD/claude/prova-1")
    out = avvio(c, {"session_id": "session_01QQQQQQQQQQQQQQ"})
    controlla("giorni non guardate: 1" in out and "01OLDOLD" not in out,
              "C352: scorta più vecchia di 14 giorni → una riga col conto, niente fetch")
    # tools/consegne.py: le scorte non unite vedono i nomi nuovi (la propria, col lavoro ormai nel commit, non conta)
    git(c, "add", "-A")
    git(c, "commit", "-qm", "lavoro Q nel ramo")
    out = sh(sys.executable, "-c", "import sys; sys.path.insert(0, 'tools'); import consegne; print(consegne.scorte_non_unite('claude/prova-1'))",
             cwd=QUI + "/..", env=dict(os.environ, CLAUDE_PROJECT_DIR=c))
    controlla(nome_p in out and "scorta-principale/claude/prova-1" in out and nome_q not in out and "01OLDOLD" not in out,
              "C352: consegne.py elenca le scorte per sessione non unite (la propria unita no, le vecchie no)")
    # 14. C352 (P47): le scorte si scaricano in UN fetch (112 fetch = 65 s, oltre il limite dell'hook: avviso perso);
    # un ramo sparito fa fallire il fetch insieme → si riprova uno per uno; tempo finito → avviso, non hook fermato
    prova = ("import importlib.util, json, sys; sys.path.insert(0, {h!r}); "
             "s = importlib.util.spec_from_file_location('a', {h!r} + '/avvio-check.py'); m = importlib.util.module_from_spec(s); "
             "s.loader.exec_module(m); ").format(h=HOOKS)
    e = clona(tmp, "e")
    env_e = dict(os.environ, CLAUDE_PROJECT_DIR=e)
    out = sh(sys.executable, "-I", "-c", prova + f"print(sorted(m.scarica([{{'nome': {nome_q!r}}}, {{'nome': {nome_p!r}}}])))",
             cwd=e, env=env_e)
    controlla(out == str(sorted([nome_p, nome_q])) and remoto(e, nome_q) == sq2, "C352: scorte scaricate in un fetch solo")
    out = sh(sys.executable, "-I", "-c", prova + f"print(sorted(m.scarica([{{'nome': {nome_q!r}}}, {{'nome': 'scorta-parallela-20261030-01SPARIT/claude/prova-1'}}])))",
             cwd=e, env=env_e)
    controlla(out == str([nome_q]), "C352: un ramo sparito → gli altri scaricati uno per uno")
    out = sh(sys.executable, "-I", "-c", prova + "m.TEMPO_MAX = -1; print(m.controlla_scorta('01QQQQQQQQQQ'))", cwd=e, env=env_e)
    controlla("ATTENZIONE scorte: tempo dell'avvio finito" in out and "avvio-check.py < /dev/null" in out,
              "C352: tempo dell'avvio finito → avviso con il comando a mano, niente hook fermato")

    # 15. C352 (P48): id della sessione dalla variabile del cloud CLAUDE_CODE_REMOTE_SESSION_ID (cse_01… = la session_01…
    # delle consegne), che vince sullo stdin dell'hook (in cloud porta l'id locale del CLI); senza variabile resta lo stdin.
    env_z = dict(os.environ, CLAUDE_PROJECT_DIR=e, CLAUDE_CODE_REMOTE_SESSION_ID="cse_01ZZZZZZZZZZZZZZ", JONA_SCORTA_NOPUSH="0")
    out = sh(sys.executable, "-I", "-c", f"import sys; sys.path.insert(0, {HOOKS!r}); import scorta; "
             "print(scorta.sessione_di({}), scorta.sessione_di({'session_id': 'session_01PPPPPPPPPPPPPP'}), scorta.sessione_corta('cse_01WTjqUtzw5oABCDEF'))",
             cwd=e, env=env_z)
    controlla(out == "01ZZZZZZZZZZ 01ZZZZZZZZZZ 01WTjqUtzw5o", "C352/E226: sessione_di: la variabile del cloud vince sullo stdin, prefisso cse_ tolto, 12 caratteri")
    out = sh(sys.executable, "-I", "-c", f"import sys; sys.path.insert(0, {HOOKS!r}); import scorta; "
             "print(scorta.sessione_di({'session_id': 'acf049a1-9d34-5fc2'}), '|', scorta.sessione_di({}))", cwd=e, env=dict(os.environ, CLAUDE_PROJECT_DIR=e))
    controlla(out == "acf049a1 |", "C352: senza variabile resta lo stdin (id locale), senza niente ''")
    f = clona(tmp, "f")
    env_f = dict(env_z, CLAUDE_PROJECT_DIR=f)
    out = subprocess.run([sys.executable, os.path.join(HOOKS, "avvio-check.py")], cwd=f, input="{}", text=True, env=env_f,
                         timeout=120, capture_output=True).stdout
    controlla(sess_file(f).startswith("01ZZZZZZZZZZ "), "C352: avvio senza id nello stdin → id dalla variabile del cloud in .git/scorta-sessione")
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), "msg"], cwd=f, input=json.dumps({"prompt": AVVIO_PAR.replace("P40", "P42")}),
                   text=True, env=env_f, timeout=90)
    open(os.path.join(f, "z.txt"), "w").write("lavoro Z\n")
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), "stop"], cwd=f, input="{}", text=True, env=env_f, timeout=90)
    nome_z = f"scorta-parallela-{data}-01ZZZZZZZZZZ/claude/prova-1"
    sz = remoto(f, nome_z)
    controlla(sz and git(f, "show", f"{sz}:z.txt") == "lavoro Z" and "sessione 01ZZZZZZZZZZ)" in git(f, "log", "-1", "--format=%s", sz),
              "C352: scorta senza id nello stdin → ramo per sessione dalla variabile del cloud")

print(f"Scorta: {ok_n} controlli riusciti")
