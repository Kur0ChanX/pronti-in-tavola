#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/regole-prove.py (#261), con conversazioni finte.
# Uso: python3 -I tools/test-regole-prove.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "regole-prove.py")
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def conversazione(nome, letture):
    """Conversazione finta: un tool_use per ogni (strumento, percorso)."""
    p = os.path.join(radice, nome + ".jsonl")
    with open(p, "w", encoding="utf-8") as f:
        f.write(json.dumps({"type": "user", "message": {"content": "ciao"}}) + "\n")
        for strumento, percorso in letture:
            f.write(json.dumps({"type": "assistant", "message": {"content": [
                {"type": "tool_use", "name": strumento, "input": {"file_path": percorso}}]}}) + "\n")
    return p


def lancia(comando, sessione="s1", conv=None, progetto=os.path.join(QUI, "..")):
    env = dict(os.environ, REGOLE_PROVE_STATO=stato, CLAUDE_PROJECT_DIR=progetto)
    dati = json.dumps({"session_id": sessione, "transcript_path": conv or "", "tool_name": "Bash",
                       "tool_input": {"command": comando}})
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30, env=env)
    uscita = json.loads(r.stdout).get("hookSpecificOutput", {}) if r.stdout.strip() else {}
    fermo = uscita.get("permissionDecision") == "deny"
    return (2 if fermo else r.returncode), uscita.get("permissionDecisionReason", "") + r.stderr


radice = tempfile.mkdtemp(prefix="prova-regole-prove-")
stato = os.path.join(radice, "stato")
os.makedirs(stato)
try:
    vuota = conversazione("vuota", [("Read", "/home/user/progetto/app/src/main.js")])
    c, e = lancia("git status", conv=vuota)
    controlla(c == 0 and e == "", "comando qualsiasi: passa", e)
    c, e = lancia("grep -n vitest package.json", conv=vuota)
    controlla(c == 0, "la parola da sola non è un giro: passa", e)

    giro = 'flock /tmp/prove.lock npx firebase emulators:exec --only firestore,auth --project demo-progetto "npx playwright test x"'
    c, e = lancia(giro, conv=vuota)
    controlla(c == 2 and ".claude/rules/prove.md" in e, "primo giro senza la regola: fermo col motivo", e)
    c, e = lancia(giro, conv=vuota)
    controlla(c == 0 and e == "", "secondo tentativo: passa (una volta sola)", e)

    c, e = lancia("npx vitest run", sessione="s2", conv=vuota)
    controlla(c == 2, "altra sessione, vitest: fermo", e)
    c, e = lancia("npm run prove:regole", sessione="s3", conv=vuota)
    controlla(c == 2, "npm run prove:regole: fermo", e)

    letta = conversazione("letta", [("Read", "/home/user/progetto/.claude/rules/prove.md")])
    c, e = lancia("npx vitest run", sessione="s4", conv=letta)
    controlla(c == 0 and e == "", "regola già letta: passa", e)
    prova = conversazione("prova", [("Edit", "/home/user/progetto/tests/e2e/hotel-chiaro.spec.js")])
    c, e = lancia("npm run prove", sessione="s5", conv=prova)
    controlla(c == 0, "file delle prove aperto (regola caricata da sola): passa", e)
    falsa = conversazione("falsa", [("Read", "/home/user/progetto/app/src/contests/x.js")])
    c, e = lancia("npm test", sessione="s6", conv=falsa)
    controlla(c == 2, "percorso che contiene «tests/» ma non è la cartella: fermo", e)

    senza = os.path.join(radice, "progetto-senza-prove")
    os.makedirs(senza)
    c, e = lancia("npx vitest run", sessione="s8", conv=vuota, progetto=senza)
    controlla(c == 0 and e == "", "progetto senza .claude/rules/prove.md (kit senza modulo): passa", e)

    c, e = lancia("npx vitest run", sessione="s7", conv="/non/esiste.jsonl")
    controlla(c == 2, "conversazione illeggibile: fermo (meglio una lettura in più)", e)
    r = subprocess.run([sys.executable, "-I", HOOK], input="non è json", capture_output=True, text=True, timeout=30,
                       env=dict(os.environ, REGOLE_PROVE_STATO=stato))
    controlla(r.returncode == 0 and r.stderr == "", "entrata illeggibile: silenzio", r.stderr)
finally:
    shutil.rmtree(radice, ignore_errors=True)

print(f"OK: {ok_n} controlli")
