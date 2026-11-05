#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/turno-breve.py (avviso dei turni lunghi, C218), con l'orologio finto TURNO_ORA.
# Uso: python3 -I tools/test-turno-breve.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "turno-breve.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def hook(memoria, modo, minuto, soglia=None):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=memoria, TURNO_TMP=memoria, TURNO_ORA=str(1_000_000 + minuto * 60))
    env.pop("TURNO_MINUTI", None)
    if soglia is not None:
        env["TURNO_MINUTI"] = str(soglia)
    r = subprocess.run([sys.executable, "-I", HOOK, modo], input=json.dumps({"tool_name": "Bash"}),
                       capture_output=True, text=True, env=env)
    controlla(r.returncode == 0, "mai blocca (uscita 0)")
    if not r.stdout.strip():
        return ""
    dati = json.loads(r.stdout)
    controlla(dati["hookSpecificOutput"]["hookEventName"] == "PostToolUse", "avviso nel formato PostToolUse")
    return dati["hookSpecificOutput"]["additionalContext"]


mem = tempfile.mkdtemp(prefix="turno-breve-")
try:
    # Turno corto: niente avviso.
    controlla(hook(mem, "tool", 0) == "", "primo strumento: zitto")
    controlla(hook(mem, "tool", 10) == "", "10 min: zitto")
    controlla(hook(mem, "tool", 19) == "", "19 min: zitto")
    # Oltre 20 minuti: avviso con i minuti e la ripresa in sottofondo.
    a = hook(mem, "tool", 21)
    controlla("21 min" in a and "sottofondo" in a and "C218" in a, "21 min: avviso")
    controlla(hook(mem, "tool", 23) == "", "avviso non ripetuto prima di 5 min")
    controlla("27 min" in hook(mem, "tool", 27), "avviso ripetuto dopo 5 min")
    # Fine del turno: si riparte da zero.
    controlla(hook(mem, "stop", 28) == "", "stop: zitto")
    controlla(hook(mem, "tool", 30) == "", "turno nuovo: zitto")
    controlla(hook(mem, "tool", 45) == "", "turno nuovo 15 min: zitto")
    controlla("20 min" in hook(mem, "tool", 50), "turno nuovo: avviso a 20 min dall'inizio nuovo")
    # Stop perso (riavvio): dopo più di 15 min senza strumenti il turno è nuovo.
    controlla(hook(mem, "tool", 70) == "", "pausa lunga senza stop = turno nuovo")
    controlla(hook(mem, "tool", 85) == "", "15 min dopo la pausa: zitto")
    # Comando lungo in primo piano (10 min fra due strumenti): stesso turno.
    controlla("25 min" in hook(mem, "tool", 95), "10 min fra due strumenti: stesso turno")
    # Soglia scelta da fuori (TURNO_MINUTI) e soglia sbagliata.
    hook(mem, "stop", 96)
    controlla(hook(mem, "tool", 100, soglia=5) == "", "soglia 5: zitto all'inizio")
    controlla("6 min" in hook(mem, "tool", 106, soglia=5), "soglia 5: avviso a 6 min")
    hook(mem, "stop", 107)
    hook(mem, "tool", 110, soglia="x")
    controlla(hook(mem, "tool", 125, soglia="x") == "", "soglia sbagliata = 20")
    # Memoria rotta: niente errore, riparte.
    for f in os.listdir(mem):
        open(os.path.join(mem, f), "w").write("{rotto")
    controlla(hook(mem, "tool", 200) == "", "memoria rotta: riparte zitto")
    controlla(hook(mem, "tool", 210) == "", "memoria rotta: 10 min dopo zitto")
    controlla("21 min" in hook(mem, "tool", 221), "memoria rotta: poi misura")
finally:
    shutil.rmtree(mem, ignore_errors=True)

print(f"OK: {ok_n} controlli verdi")
