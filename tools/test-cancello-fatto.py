#!/usr/bin/env python3
# Prova dell'hook Stop .claude/hooks/cancello-fatto.py (C214 c), con transcript finti in un progetto finto.
# Uso: python3 -I tools/test-cancello-fatto.py
import json, os, shutil, subprocess, sys, tempfile, time
from datetime import datetime, timezone

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "cancello-fatto.py")
BASE = time.time() - 3600
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def iso(secondi):
    return datetime.fromtimestamp(BASE + secondi, timezone.utc).isoformat().replace("+00:00", "Z")


def scrivi(cartella, rel, testo):
    p = os.path.join(cartella, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)
    return p


class Transcript:
    def __init__(self):
        self.righe, self.n = [], 0
        self.messaggio("ciao", 0)

    def messaggio(self, testo, t):
        self.righe.append({"type": "user", "timestamp": iso(t), "message": {"role": "user", "content": testo}})

    def strumento(self, t, nome, entrata, uscita="ok", errore=False, extra=None):
        self.n += 1
        tid = f"toolu_{self.n}"
        self.righe.append({"type": "assistant", "timestamp": iso(t),
                           "message": {"role": "assistant", "content": [{"type": "tool_use", "id": tid, "name": nome, "input": entrata}]}})
        self.righe.append({"type": "user", "timestamp": iso(t + 1), "toolUseResult": extra or {"stdout": uscita},
                           "message": {"role": "user", "content": [{"type": "tool_result", "tool_use_id": tid, "content": uscita, "is_error": errore}]}})

    def modifica(self, t, rel, nome="Edit"):
        self.strumento(t, nome, {"file_path": os.path.join(progetto, rel)})

    def prova(self, t, comando="npx vitest run", uscita="Test Files  12 passed", errore=False, extra=None):
        self.strumento(t, "Bash", {"command": comando}, uscita, errore, extra)

    def finale(self, testo, t=900):
        self.righe.append({"type": "assistant", "timestamp": iso(t), "message": {"role": "assistant", "content": [{"type": "text", "text": testo}]}})

    def esito(self, attivo=False, proc=None):
        percorso = os.path.join(cartella, "transcript.jsonl")
        with open(percorso, "w", encoding="utf-8") as f:
            f.write("".join(json.dumps(r) + "\n" for r in self.righe))
        env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto, CANCELLO_PROC=proc or vuota)
        entrata = json.dumps({"hook_event_name": "Stop", "transcript_path": percorso, "stop_hook_active": attivo})
        r = subprocess.run([sys.executable, "-I", HOOK], input=entrata, capture_output=True, text=True, env=env, cwd=progetto)
        return r.returncode, r.stderr


cartella = tempfile.mkdtemp(prefix="cancello-")
progetto = os.path.join(cartella, "progetto")
vuota = os.path.join(cartella, "proc-vuota")
os.makedirs(vuota)
try:
    scrivi(progetto, ".claude/zone-codice.txt", "app/\ntests/\n")
    scrivi(progetto, "package.json", '{"scripts": {"prove": "vitest run"}}\n')
    scrivi(progetto, "app/a.js", "export const a = 1;\n")
    os.utime(os.path.join(progetto, "app/a.js"), (BASE - 60, BASE - 60))

    t = Transcript(); t.modifica(100, "app/a.js"); t.finale("✅ FATTO\nAggiunto il tasto.")
    codice, err = t.esito()
    controlla(codice == 2 and "app/a.js" in err and "Cancello" in err and "non riscrivere" in err, "codice cambiato, nessuna prova, «fatto» = blocco", err)

    controlla(t.esito(attivo=True)[0] == 0, "secondo giro (stop_hook_active) = silenzio")

    t = Transcript(); t.modifica(100, "app/a.js"); t.prova(200); t.finale("✅ FATTO, prove verdi.")
    controlla(t.esito()[0] == 0, "prova riuscita dopo la modifica = silenzio")

    t = Transcript(); t.modifica(100, "app/a.js"); t.prova(200, uscita="Exit code 1", errore=True); t.finale("✅ FATTO")
    controlla(t.esito()[0] == 2, "prova con errore non conta")

    t = Transcript(); t.modifica(100, "app/a.js"); t.prova(200, "npm run build && npx playwright test > out.txt; tail -3 out.txt", "  2 failed\n  40 passed"); t.finale("Fatto.")
    controlla(t.esito()[0] == 2, "uscita con «2 failed» non conta")

    # C469 fase 2 (rapporto 14 voce 16): «0 failed» è una prova riuscita, «10 failed» no.
    t = Transcript(); t.modifica(100, "app/a.js"); t.prova(200, "npx vitest run", "Tests  0 failed | 40 passed\n  0 failed"); t.finale("Fatto.")
    controlla(t.esito()[0] == 0, "uscita con «0 failed» = prova riuscita")
    t = Transcript(); t.modifica(100, "app/a.js"); t.prova(200, "npx vitest run", "Tests  10 failed | 40 passed"); t.finale("Fatto.")
    controlla(t.esito()[0] == 2, "uscita con «10 failed» non conta")

    t = Transcript(); t.modifica(100, "app/a.js"); t.prova(200); t.modifica(300, "tests/b.spec.js", "Write"); t.finale("Funziona.")
    codice, err = t.esito()
    controlla(codice == 2 and "tests/b.spec.js" in err, "modifica DOPO l'ultima prova = blocco", err)

    t = Transcript(); t.modifica(100, "docs/APP.md"); t.modifica(110, ".claude/hooks/x.py"); t.finale("✅ FATTO")
    controlla(t.esito()[0] == 0, "solo documenti o .claude = silenzio")

    t = Transcript(); t.modifica(100, "app/a.js"); t.finale("✅ Scritto il codice, NON ancora provato: lo provo dopo.")
    controlla(t.esito()[0] == 0, "«non ancora provato» detto a Mario = silenzio")

    t = Transcript(); t.modifica(100, "app/a.js"); t.prova(200, uscita="Exit code 1", errore=True); t.finale("Prova rossa: la correggo.")
    controlla(t.esito()[0] == 0, "«rossa» detto a Mario = silenzio")

    t = Transcript(); t.modifica(100, "app/a.js"); t.finale("❓ DOMANDE\n1 · Blu · 2 · Verde chiaro")
    controlla(t.esito()[0] == 2, "«verde» come colore fa scattare (parola d'affermazione): si accetta")

    t = Transcript(); t.modifica(100, "app/a.js"); t.finale("❓ Quale colore? 1 · Blu · 2 · Rosa")
    controlla(t.esito()[0] == 0, "messaggio senza affermazioni = silenzio")

    t = Transcript(); t.modifica(100, "app/a.js")
    t.prova(200, "npx playwright test", "Command running in background with ID: bx1", extra={"backgroundTaskId": "bx1"})
    t.finale("Giro lanciato.", 210)
    t.messaggio("<task-notification><task-id>bx1</task-id><status>completed</status><summary>exit code 0</summary></task-notification>", 600)
    t.finale("✅ FATTO, giro verde.")
    controlla(t.esito()[0] == 0, "prova in sottofondo finita «completed» dopo la modifica = silenzio")

    t = Transcript(); t.modifica(100, "app/a.js")
    t.prova(200, "npx playwright test", "Command running in background with ID: bx2", extra={"backgroundTaskId": "bx2"})
    t.messaggio("<task-notification><task-id>bx2</task-id><status>failed</status><summary>exit code 1</summary></task-notification>", 600)
    t.finale("✅ FATTO")
    controlla(t.esito()[0] == 2, "prova in sottofondo «failed» non conta")

    t = Transcript(); t.modifica(100, "app/a.js")
    t.prova(200, "npx playwright test", "Command running in background with ID: bx3", extra={"backgroundTaskId": "bx3"})
    t.messaggio('<task-notification> <task-id>bx3</task-id> <status>completed</status> <summary>Background command "x" completed (exit code 1)</summary> </task-notification>', 600)
    t.finale("✅ FATTO")
    controlla(t.esito()[0] == 2, "sottofondo «completed» ma con exit code 1 non conta")

    t = Transcript(); t.modifica(100, "app/a.js"); t.finale("✅ FATTO")
    lr = scrivi(progetto, "test-results/.last-run.json", '{"status": "passed", "failedTests": []}')
    os.utime(lr, (BASE + 500, BASE + 500))
    controlla(t.esito()[0] == 0, "test-results/.last-run.json «passed» dopo la modifica = silenzio")
    scrivi(progetto, "test-results/.last-run.json", '{"status": "failed", "failedTests": ["x"]}')
    os.utime(lr, (BASE + 500, BASE + 500))
    controlla(t.esito()[0] == 2, ".last-run.json «failed» non conta")

    finta = os.path.join(cartella, "proc-finta")
    scrivi(finta, "4242/cmdline", "node\0node_modules/.bin/playwright\0test\0")
    scrivi(finta, "4243/cmdline", "node\0npx\0playwright test\0")
    controlla(t.esito(proc=finta)[0] == 0, "prova che sta girando = silenzio")

    os.rename(os.path.join(progetto, "package.json"), os.path.join(progetto, "package.vecchio"))
    controlla(t.esito()[0] == 0, "progetto senza prove note = silenzio")
    os.rename(os.path.join(progetto, "package.vecchio"), os.path.join(progetto, "package.json"))

    # File cambiato con sed (niente Edit nel transcript): conta se è sporco e cambiato dopo l'inizio della sessione.
    git = ["git", "-c", "user.email=prova@esempio.it", "-c", "user.name=prova"]
    subprocess.run(git + ["init", "-q"], cwd=progetto, check=True)
    subprocess.run(git + ["add", "-A"], cwd=progetto, check=True)
    subprocess.run(git + ["commit", "-q", "-m", "inizio"], cwd=progetto, check=True)
    scrivi(progetto, "test-results/.last-run.json", '{"status": "failed"}')
    t = Transcript(); t.strumento(100, "Bash", {"command": "sed -i 's/1/2/' app/a.js"}); t.finale("✅ FATTO")
    scrivi(progetto, "app/a.js", "export const a = 2;\n")
    controlla(t.esito()[0] == 2, "file del codice cambiato con sed (sporco, dopo l'inizio) = blocco")
    os.utime(os.path.join(progetto, "app/a.js"), (BASE - 60, BASE - 60))
    controlla(t.esito()[0] == 0, "file sporco già da prima della sessione = silenzio")

    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto)
    r = subprocess.run([sys.executable, "-I", HOOK], input="non è json", capture_output=True, text=True, env=env)
    controlla(r.returncode == 0 and r.stderr == "", "entrata rotta = silenzio")
    r = subprocess.run([sys.executable, "-I", HOOK], input=json.dumps({"transcript_path": "/non/esiste"}), capture_output=True, text=True, env=env)
    controlla(r.returncode == 0, "transcript che non c'è = silenzio")

    # Modo commit (C333, E208): secondo sguardo dopo un git commit, una volta ogni 15 minuti, mai blocca.
    def sguardo(entrata, risposta=None, nome="Bash", extra=None):
        dati = {"tool_name": nome, "tool_input": entrata, "tool_response": risposta or {"stdout": "1 file changed"},
                "session_id": "sess-a"}
        dati.update(extra or {})
        r = subprocess.run([sys.executable, "-I", HOOK, "commit"], capture_output=True, text=True, env=env,
                           input=json.dumps(dati))
        controlla(r.returncode == 0 and r.stderr == "", "modo commit: mai blocca")
        return json.loads(r.stdout)["hookSpecificOutput"]["additionalContext"] if r.stdout.strip() else ""
    os.makedirs(os.path.join(progetto, ".git"), exist_ok=True)
    mem = os.path.join(progetto, ".git", "secondo-sguardo.json")
    if os.path.exists(mem):
        os.remove(mem)
    controlla(sguardo({"command": "git status"}) == "", "senza commit = silenzio")
    controlla(sguardo({"command": "git commit -qm x"}, {"stdout": "nothing to commit, working tree clean"}) == "",
              "commit vuoto = silenzio")
    controlla(sguardo({"command": "git commit --dry-run -m x"}) == "", "commit di prova = silenzio")
    controlla(sguardo({"command": "echo 'dopo un `git commit` riuscito' >> docs/X.md"}) == "", "git commit dentro un testo = silenzio")
    controlla(sguardo({"command": "git commit"}, nome="Write") == "", "altro strumento = silenzio")
    testo = sguardo({"command": "git add -A && git commit -qm 'C1: cosa'"})
    controlla("Secondo sguardo" in testo and "c'è già" in testo and "dove lo vede Mario" in testo,
              "commit riuscito = secondo sguardo con le domande", testo)
    controlla(sguardo({"command": "git -C . commit -qm y"}) == "", "secondo commit entro 15 minuti = silenzio")
    with open(mem, "w", encoding="utf-8") as f:
        json.dump({"ultimo": time.time() - 16 * 60, "sessione": "sess-a"}, f)
    corto =sguardo({"command": "git -C . commit -qm y"})
    controlla(corto != "", "dopo 15 minuti = di nuovo")
    # C469 fase 2 (rapporto 14 voce 9): intero la prima volta della sessione, poi corto; mai negli aiutanti.
    controlla("Secondo sguardo" in corto and "c'è già?" in corto and len(corto) < 200 and "dove lo vede Mario" not in corto,
              "stessa sessione, secondo avviso = testo corto", corto)
    with open(mem, "w", encoding="utf-8") as f:
        json.dump({"ultimo": time.time() - 16 * 60, "sessione": "sess-a"}, f)
    controlla(sguardo({"command": "git -C . commit -qm y"}, extra={"agent_id": "ag1"}) == "", "aiutante = silenzio")
    nuovo = sguardo({"command": "git -C . commit -qm y"}, extra={"session_id": "sess-b"})
    controlla("dove lo vede Mario" in nuovo, "sessione nuova = di nuovo il testo intero", nuovo)
    r = subprocess.run([sys.executable, "-I", HOOK, "commit"], input="rotto", capture_output=True, text=True, env=env)
    controlla(r.returncode == 0 and r.stdout == "", "modo commit, entrata rotta = silenzio")

    # C469 fase 2 (rapporto 13 M9, E306): merge che toglie file = avviso coi nomi; spostati, già allineato, merge-base = silenzio.
    capo = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=progetto, capture_output=True, text=True).stdout.strip()
    scrivi(progetto, "docs/vecchio.md", "uno\n")
    scrivi(progetto, "docs/sposta.md", "due\n")
    subprocess.run(git + ["add", "docs/vecchio.md", "docs/sposta.md"], cwd=progetto, check=True)
    subprocess.run(git + ["commit", "-q", "-m", "base"], cwd=progetto, check=True)
    subprocess.run(git + ["checkout", "-q", "-b", "altro"], cwd=progetto, check=True)
    subprocess.run(git + ["rm", "-q", "docs/vecchio.md"], cwd=progetto, check=True)
    subprocess.run(git + ["mv", "docs/sposta.md", "docs/spostato.md"], cwd=progetto, check=True)
    subprocess.run(git + ["commit", "-q", "-m", "togli"], cwd=progetto, check=True)
    subprocess.run(git + ["checkout", "-q", capo], cwd=progetto, check=True)
    subprocess.run(git + ["merge", "-q", "--ff-only", "altro"], cwd=progetto, check=True)
    tolti = sguardo({"command": "git fetch -q && git merge --ff-only altro"}, {"stdout": "Fast-forward"})
    controlla("E306" in tolti and "docs/vecchio.md" in tolti and "sposta" not in tolti, "merge che toglie un file = avviso", tolti)
    controlla(sguardo({"command": "git merge altro"}, {"stdout": "Already up to date."}) == "", "merge già allineato = silenzio")
    controlla(sguardo({"command": "git merge-base HEAD altro"}) == "", "merge-base = silenzio")
    controlla(sguardo({"command": "git merge --abort"}) == "", "merge --abort = silenzio")

    # C469 fase 2 (rapporto 13 M9, E309): commit che tocca Da fare con una voce 👁 senza prova = avviso subito.
    scrivi(progetto, "docs/DA-FARE.md", "# Da fare\n| C312 | 🔴 **Schede** 👁 Lo vedi: Inizio | Claude | adesso |\n")
    subprocess.run(git + ["add", "docs/DA-FARE.md"], cwd=progetto, check=True)
    subprocess.run(git + ["commit", "-q", "-m", "da fare"], cwd=progetto, check=True)
    rotta = sguardo({"command": "git commit -qm 'da fare'"})
    controlla("E309" in rotta and "C312" in rotta, "commit di Da fare con 👁 senza prova = avviso", rotta)
    scrivi(progetto, "docs/DA-FARE.md", "# Da fare\n| C312 | 🔴 **Schede** 👁 Lo vedi: Inizio · prova: foto | Claude | adesso |\n")
    subprocess.run(git + ["commit", "-qam", "da fare giusto"], cwd=progetto, check=True)
    controlla("E309" not in sguardo({"command": "git commit -qam x"}), "commit di Da fare in ordine = niente avviso")
    scrivi(progetto, "docs/altro.md", "x\n")
    subprocess.run(git + ["add", "docs/altro.md"], cwd=progetto, check=True)
    subprocess.run(git + ["commit", "-q", "-m", "altro"], cwd=progetto, check=True)
    scrivi(progetto, "docs/DA-FARE.md", "# Da fare\n| C312 | 🔴 **Schede** 👁 Lo vedi: Inizio | Claude | adesso |\n")
    controlla("E309" not in sguardo({"command": "git commit -qm x"}), "commit che non tocca Da fare = niente controllo")
finally:
    shutil.rmtree(cartella)

print(f"OK: {ok_n} controlli del cancello del «fatto» passati")
