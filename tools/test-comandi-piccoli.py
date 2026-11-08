#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/comandi-piccoli.py (avviso dei comandi piccoli di fila, C64).
# Uso: python3 -I tools/test-comandi-piccoli.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "comandi-piccoli.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def hook(mem, modo="tool", strumento="Bash", comando="git status", uscita="ok", sotto=False):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=mem, COMANDI_TMP=mem)
    dati = {"tool_name": strumento, "tool_input": {"command": comando, "run_in_background": sotto},
            "tool_response": {"stdout": uscita, "stderr": ""}}
    r = subprocess.run([sys.executable, "-I", HOOK, modo], input=json.dumps(dati),
                       capture_output=True, text=True, env=env)
    controlla(r.returncode == 0, "mai blocca (uscita 0)")
    if not r.stdout.strip():
        return ""
    d = json.loads(r.stdout)
    controlla(d["hookSpecificOutput"]["hookEventName"] == "PostToolUse", "formato PostToolUse")
    return d["hookSpecificOutput"]["additionalContext"]


mem = tempfile.mkdtemp(prefix="comandi-piccoli-")
try:
    for i in range(3):
        controlla(hook(mem) == "", f"piccolo {i + 1}: zitto")
    a = hook(mem)
    controlla("4 comandi piccoli" in a and "C64" in a, "quarto piccolo: avviso")
    for i in range(3):
        controlla(hook(mem) == "", "dal 5 al 7: zitto")
    controlla("8 comandi" in hook(mem), "ottavo: avviso di nuovo")
    # Ognuno di questi azzera il conto.
    for nome, kw in [("stop", {"modo": "stop"}), ("altro strumento", {"strumento": "Edit"}),
                     ("uscita lunga", {"uscita": "x" * 3000}), ("comando lungo", {"comando": "echo " + "a" * 400}),
                     ("in sottofondo", {"sotto": True}), ("prove", {"comando": "node tools/prova.js"}),
                     ("commit", {"comando": "git commit -m x"}), ("push", {"comando": "git push -u origin r"})]:
        hook(mem, **kw)
        for i in range(3):
            controlla(hook(mem) == "", f"dopo {nome}: conto da capo ({i + 1})")
        controlla(hook(mem) != "", f"dopo {nome}: avviso al quarto")
        hook(mem, modo="stop")
    # Memoria rovinata: riparte da zero senza errori.
    for f in os.listdir(mem):
        open(os.path.join(mem, f), "w").write("{rotto")
    controlla(hook(mem) == "", "memoria rotta: zitto e riparte")
finally:
    shutil.rmtree(mem, ignore_errors=True)
print(f"OK comandi-piccoli: {ok_n} controlli")
