#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/consegne-push.py (C226, E131), con un repo finto e il suo «origin» in una cartella temporanea.
# Uso: python3 -I tools/test-consegne-push.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "consegne-push.py")
RAMO = "claude/prova"
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def git(*argomenti):
    subprocess.run(["git", *argomenti], cwd=progetto, check=True, capture_output=True)


def scrivi(rel, testo):
    p = os.path.join(progetto, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "a", encoding="utf-8") as f:
        f.write(testo + "\n")


def lancia(modo, dati):
    r = subprocess.run([sys.executable, "-I", HOOK, modo], input=json.dumps(dati) if isinstance(dati, dict) else dati,
                       capture_output=True, text=True, timeout=30,
                       env={**os.environ, "CLAUDE_PROJECT_DIR": progetto, "CONSEGNE_STATO": stato})
    return r.returncode, r.stdout, r.stderr


def stop(messaggio="✅ FATTO", attivo=False, chiave=True):
    dati = {"session_id": "sessione-prova", "stop_hook_active": attivo}
    if chiave:
        dati["last_assistant_message"] = messaggio
    return lancia("stop", dati)


radice = tempfile.mkdtemp(prefix="prova-consegne-")
progetto, origine, stato = (os.path.join(radice, n) for n in ("progetto", "origine.git", "stato"))
os.makedirs(stato)
try:
    subprocess.run(["git", "init", "-q", "--bare", origine], check=True)
    os.makedirs(progetto)
    git("init", "-q", "-b", RAMO)
    git("config", "user.email", "prova@esempio.it")
    git("config", "user.name", "Prova")
    scrivi("docs/PASSAGGIO-CONSEGNE.md", "# Consegne")
    scrivi("docs/ERRORI.md", "# Errori")
    scrivi("app/main.js", "// app")
    git("add", "-A")
    git("commit", "-q", "-m", "inizio")
    git("remote", "add", "origin", origine)
    git("push", "-q", "-u", "origin", RAMO)

    # 1. Dopo Edit/Write: avviso solo per i documenti
    c, out, _ = lancia("tool", {"tool_name": "Edit", "tool_input": {"file_path": os.path.join(progetto, "docs/PASSAGGIO-CONSEGNE.md")}})
    contesto = json.loads(out or "{}").get("hookSpecificOutput", {}).get("additionalContext", "")
    controlla(c == 0 and "C226" in contesto and f"origin/{RAMO}" in contesto, "avviso dopo la modifica delle consegne", out)
    c, out, _ = lancia("tool", {"tool_name": "Write", "tool_input": {"file_path": "docs/ERRORI.md"}})
    controlla(c == 0 and "C226" in out, "percorso relativo del diario", out)
    c, out, _ = lancia("tool", {"tool_name": "Edit", "tool_input": {"file_path": os.path.join(progetto, "app/main.js")}})
    controlla(c == 0 and out.strip() == "", "nessun avviso per il codice", out)

    # 2. Tutto su origin: il turno finisce
    c, _, err = stop()
    controlla(c == 0 and err == "", "tutto pushato", err)

    # 3. Consegne fuori dal commit: blocco, anche al secondo giro, fino a 3
    scrivi("docs/PASSAGGIO-CONSEGNE.md", "stato nuovo")
    c, _, err = stop("Consegne scritte.")
    controlla(c == 2 and "fuori dal commit" in err and "1/3" in err, "consegne non nel commit", err)
    c, _, err = stop("Push dopo le prove.", attivo=True)
    controlla(c == 2 and "2/3" in err, "secondo giro: ancora blocco (#245)", err)
    c, _, err = stop("ok", attivo=True)
    controlla(c == 2 and "3/3" in err, "terzo blocco", err)
    c, _, err = stop("ok", attivo=True)
    controlla(c == 0, "dopo 3 blocchi passa (niente giri infiniti)", err)

    # 4. Messaggio onesto a Mario: passa
    c, _, err = stop("⚠️ Consegne NON su GitHub: push fallito (rete).")
    controlla(c == 0, "detto chiaro che non sono su GitHub", err)
    c, _, err = stop("Consegne in locale, push dopo le prove.")
    controlla(c == 2, "«in locale» non basta per le consegne (#245)", err)

    # 5. Nel commit ma non pushate; la scorta non conta
    git("add", "-A")
    git("commit", "-q", "-m", "consegne")
    git("push", "-q", "origin", f"HEAD:refs/heads/scorta-principale/{RAMO}")
    c, _, err = stop("fatto")
    controlla(c == 2 and "non pushati" in err and "fuori dal commit" not in err, "commit non pushato (scorta sì)", err)

    # 6. Dopo il push: passa e il conto riparte da zero
    git("push", "-q", "origin", RAMO)
    c, _, err = stop("Consegne scritte e pushate.")
    controlla(c == 0 and err == "", "consegne pushate", err)
    scrivi("docs/ERRORI.md", "E999")
    c, _, err = stop("fatto")
    controlla(c == 2 and "1/3" in err and "docs/ERRORI.md" in err, "il conto riparte da 1 (diario)", err)
    git("add", "-A")
    git("commit", "-q", "-m", "diario")
    git("push", "-q", "origin", RAMO)

    # 6b. Merge di origin con consegne nuove (scritte da un'altra chat) sopra un commit di codice locale: niente blocco
    altro = os.path.join(radice, "altra-chat")
    subprocess.run(["git", "clone", "-q", "-b", RAMO, origine, altro], check=True)
    for k, v in (("user.email", "altra@esempio.it"), ("user.name", "Altra")):
        subprocess.run(["git", "config", k, v], cwd=altro, check=True)
    with open(os.path.join(altro, "docs/PASSAGGIO-CONSEGNE.md"), "a", encoding="utf-8") as f:
        f.write("consegne dell'altra chat\n")
    subprocess.run(["git", "commit", "-q", "-am", "consegne altra chat"], cwd=altro, check=True)
    subprocess.run(["git", "push", "-q", "origin", RAMO], cwd=altro, check=True)
    scrivi("app/main.js", "// locale")
    git("commit", "-q", "-am", "codice locale")
    git("fetch", "-q", "origin")
    git("merge", "-q", "--no-edit", f"origin/{RAMO}")
    c, _, err = stop("Codice in locale, push dopo il giro.")
    controlla(c == 0, "merge di consegne già su origin: niente blocco (#246)", err)
    git("push", "-q", "origin", RAMO)

    # 7. «Pushato» detto con HEAD avanti (codice in locale): blocco una volta sola
    scrivi("app/main.js", "// nuovo")
    git("add", "-A")
    git("commit", "-q", "-m", "codice")
    c, _, err = stop("✅ FATTO: ho pushato tutto.")
    controlla(c == 2 and "HEAD non è ancora su origin" in err, "«pushato» falso", err)
    c, _, err = stop("✅ FATTO: ho pushato tutto.", attivo=True)
    controlla(c == 0, "«pushato» falso: una volta sola", err)
    c, _, err = stop("✅ FATTO: codice in locale, push dopo il giro.")
    controlla(c == 0, "codice in locale senza dire «pushato»", err)
    c, _, err = stop("Il codice NON è ancora su GitHub: consegne pushate, codice dopo il giro.")
    controlla(c == 0, "«pushate» ma detto chiaro cosa manca", err)
    c, _, err = stop("Consegne pushate; il codice resta in locale fino al giro.")
    controlla(c == 0, "«pushate» con il codice detto «in locale»", err)
    git("push", "-q", "origin", RAMO)
    c, _, err = stop("Tutto pushato.")
    controlla(c == 0, "«pushato» vero", err)

    # 8. Turno senza testo per Mario (E65, E123)
    c, _, err = stop("")
    controlla(c == 2 and "senza un messaggio" in err, "messaggio finale vuoto", err)
    c, _, err = stop("No response requested.")
    controlla(c == 2, "«No response requested»", err)
    c, _, err = stop("", attivo=True)
    controlla(c == 0, "messaggio vuoto: una volta sola", err)
    c, _, err = stop(chiave=False)
    controlla(c == 0, "versione senza last_assistant_message: silenzio", err)

    # 9. Casi strani: silenzio
    git("checkout", "-q", "--detach")
    scrivi("docs/PASSAGGIO-CONSEGNE.md", "staccato")
    c, _, err = stop("fatto")
    controlla(c == 0, "HEAD staccato", err)
    c, _, err = lancia("stop", "non è json")
    controlla(c == 0 and err == "", "entrata illeggibile", err)
    c, _, err = lancia("altro", {})
    controlla(c == 0, "modo sconosciuto", err)
finally:
    shutil.rmtree(radice, ignore_errors=True)

print(f"OK: {ok_n} controlli")
