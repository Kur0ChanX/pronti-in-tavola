#!/usr/bin/env python3
# Prova d'insieme degli hook (C469 fase 2, rapporto 14 voce 8): molti hook sono lanciati con «2>/dev/null || true» e
# inghiottono gli errori, quindi un hook rotto si spegne in silenzio (anche la guardia). Qui, per ogni comando di
# .claude/settings.json: il file c'è, si compila, e lanciato con un ingresso finto in un progetto finto esce con 0 o 2
# senza «Traceback». E ogni .claude/hooks/*.py è collegato in settings.json (sennò non gira mai).
# Uso: python3 -I tools/test-hook-vivi.py
import json, os, py_compile, re, shlex, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOKS = os.path.join(QUI, ".claude", "hooks")
ok_n, errori = 0, []


def controlla(cond, nome, extra=""):
    global ok_n
    if cond:
        ok_n += 1
    else:
        errori.append(f"{nome} · {extra}"[:400])


with open(os.path.join(QUI, ".claude", "settings.json"), encoding="utf-8") as f:
    impostazioni = json.load(f)

comandi = []  # (evento, file, argomenti, tempo massimo)
for evento, gruppi in impostazioni.get("hooks", {}).items():
    for g in gruppi:
        for h in g.get("hooks", []):
            m = re.search(r'hooks/([\w-]+\.py)"?((?:\s+[a-zA-Z][\w-]*)*)', h.get("command", ""))
            controlla(bool(m), f"{evento}: comando senza file .py riconoscibile", h.get("command", ""))
            if m:
                comandi.append((evento, m.group(1), shlex.split(m.group(2)), int(h.get("timeout") or 60)))

presenti = sorted(f for f in os.listdir(HOOKS) if f.endswith(".py"))
usati = {c[1] for c in comandi}
for f in presenti:
    controlla(f in usati, f"{f}: non è collegato in settings.json (non gira mai)")
for f in sorted(usati):
    percorso = os.path.join(HOOKS, f)
    controlla(os.path.isfile(percorso), f"{f}: collegato ma il file non c'è")
    if os.path.isfile(percorso):
        try:
            py_compile.compile(percorso, cfile=os.path.join(tempfile.gettempdir(), "hook-vivi.pyc"), doraise=True)
            controlla(True, f)
        except py_compile.PyCompileError as e:
            controlla(False, f"{f}: non si compila", str(e))

cartella = tempfile.mkdtemp(prefix="hook-vivi-")
try:
    progetto = os.path.join(cartella, "progetto")
    casa = os.path.join(cartella, "casa")
    os.makedirs(os.path.join(progetto, "docs"))
    os.makedirs(casa)
    subprocess.run(["git", "init", "-q", "-b", "claude/prova-vivi", progetto], check=True)
    trascrizione = os.path.join(cartella, "t.jsonl")
    with open(trascrizione, "w", encoding="utf-8") as f:
        f.write(json.dumps({"type": "user", "message": {"role": "user", "content": "ciao"}}) + "\n")
        f.write(json.dumps({"type": "assistant", "message": {"id": "m1", "role": "assistant", "content": [
            {"type": "text", "text": "ok"}], "usage": {"input_tokens": 10, "output_tokens": 5}}}) + "\n")
    amb = {k: v for k, v in os.environ.items() if not k.startswith(("CLAUDE_CODE_REMOTE", "CTX_"))}
    amb.update(CLAUDE_PROJECT_DIR=progetto, HOME=casa, JONA_SCORTA_NOPUSH="1", GIT_TERMINAL_PROMPT="0")
    for evento, f, argomenti, tempo in comandi:
        ingresso = {"session_id": "prova-vivi", "transcript_path": trascrizione, "cwd": progetto, "hook_event_name": evento,
                    "source": "startup", "prompt": "ciao", "stop_hook_active": False, "last_assistant_message": "ok",
                    "tool_name": "Bash", "tool_input": {"command": "echo ciao"}, "tool_response": {"stdout": "ciao"}}
        try:
            r = subprocess.run([sys.executable, "-I", os.path.join(HOOKS, f), *argomenti], input=json.dumps(ingresso),
                               capture_output=True, text=True, cwd=progetto, env=amb, timeout=tempo + 30)
            controlla(r.returncode in (0, 2) and "Traceback" not in r.stderr,
                      f"{evento} {f} {' '.join(argomenti)}: esce con {r.returncode}", r.stderr.strip()[-300:])
        except subprocess.TimeoutExpired:
            controlla(False, f"{evento} {f} {' '.join(argomenti)}: oltre {tempo + 30} s")
finally:
    shutil.rmtree(cartella, ignore_errors=True)

for e in errori:
    print("FALLITA:", e)
print(f"Hook vivi: {ok_n} controlli riusciti, {len(errori)} falliti ({len(comandi)} comandi, {len(usati)} file)")
sys.exit(1 if errori else 0)
