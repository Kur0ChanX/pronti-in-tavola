#!/usr/bin/env python3
# Prova dell'hook della soglia (.claude/hooks/handoff-check.py). Uso: python3 -I tools/test-handoff-check.py
import json, os, subprocess, sys, tempfile

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks", "handoff-check.py")
casa = tempfile.mkdtemp()
esiti = []


def trascrizione(token):
    p = os.path.join(casa, f"t{token}.jsonl")
    with open(p, "w") as f:
        f.write(json.dumps({"message": {"usage": {"input_tokens": 10, "cache_read_input_tokens": token}}}) + "\n")
    return p


# Progetto finto per la prova C396: riga della catena e file della prova (soglia, fine). Di base nessuna sessione remota.
progetto = tempfile.mkdtemp()
os.makedirs(os.path.join(progetto, "docs", "misure"))


def scrivi_prova(prova_json, sessione="session_01ABCDEFGHIJKL"):
    with open(os.path.join(progetto, "docs", "CHI-FA-COSA.md"), "w", encoding="utf-8") as f:
        f.write(f"| Principale | cerchi | 🟢 🟡 🔴 ⚫ | 500 | `{sessione}` (dalla 499) | — |\n")
    p = os.path.join(progetto, "docs", "misure", "prova-soglia.json")
    if prova_json is None:
        if os.path.exists(p):
            os.remove(p)
    else:
        with open(p, "w", encoding="utf-8") as f:
            json.dump(prova_json, f)


def lancia(sid, token, arg=None, remota="", **extra):
    dati = {"session_id": sid, "transcript_path": trascrizione(token), **extra}
    amb = {k: v for k, v in os.environ.items() if k not in ("CLAUDE_CODE_REMOTE_SESSION_ID", "CTX_SOGLIA")}
    amb.update(HOME=casa, CLAUDE_PROJECT_DIR=progetto)
    if remota:
        amb["CLAUDE_CODE_REMOTE_SESSION_ID"] = remota
    r = subprocess.run([sys.executable, "-I", HOOK] + ([arg] if arg else []), input=json.dumps(dati),
                       capture_output=True, text=True, env=amb, timeout=10)
    return json.loads(r.stdout) if r.stdout.strip() else None


def prova(nome, ok):
    esiti.append(ok)
    print(("OK  " if ok else "NO  ") + nome)


def testo(o):
    return o["hookSpecificOutput"]["additionalContext"] if o else ""


prova("sotto soglia: messaggio muto", lancia("a", 50_000) is None)
prova("sotto soglia: strumento muto", lancia("a", 50_000, "tool") is None)
o = lancia("a", 260_000, "tool")
prova("oltre soglia dopo uno strumento: avviso completo", "OBBLIGATORIO" in testo(o)
      and o["hookSpecificOutput"]["hookEventName"] == "PostToolUse" and o["systemMessage"].startswith("Soglia 250k"))
prova("secondo strumento oltre soglia: muto", lancia("a", 261_000, "tool") is None)
prova("messaggio dopo l'avviso: riga corta", "ancora da fare" in testo(lancia("a", 262_000)))
prova("dentro un aiutante: muto", lancia("b", 260_000, "tool", agent_id="x") is None)
prova("messaggio oltre soglia la prima volta: avviso completo", "OBBLIGATORIO" in testo(lancia("c", 255_000)))
prova("dopo una compressione: avviso completo", "OBBLIGATORIO" in testo(lancia("d", 10_000, "compact")))
prova("messaggio dopo la compressione: di nuovo completo", "OBBLIGATORIO" in testo(lancia("d", 10_000)))
for _ in range(60):
    ultimo = lancia("e", 1_000)
prova("60 messaggi sotto soglia: muto (niente regola dei 40)", ultimo is None)
prova("messaggio oltre soglia: avviso col numero dei messaggi", "61 messaggi" in testo(lancia("e", 251_000)))
prova("gli strumenti non contano come messaggi", lancia("f", 1_000, "tool") is None
      and not os.path.exists(os.path.join(casa, ".claude", "handoff-check", "f.json")))

# C396: prova della soglia solo per la sessione della catena Principale, con fine e tetto.
DOMANI = __import__("datetime").date.fromordinal(__import__("datetime").date.today().toordinal() + 1).isoformat()
IERI = __import__("datetime").date.fromordinal(__import__("datetime").date.today().toordinal() - 1).isoformat()
scrivi_prova({"catena": "Principale", "soglia": 350000, "fino_al": DOMANI})
prova("C396: la sessione Principale a 300k lavora ancora", lancia("p1", 300_000, remota="cse_01ABCDEFGHIJKL") is None)
o = lancia("p2", 351_000, remota="cse_01ABCDEFGHIJKL")
prova("C396: la sessione Principale a 351k ha l'avviso «soglia 350k»", "soglia 350k" in testo(o))
prova("C396: un'altra chat resta a 250k", "OBBLIGATORIO" in testo(lancia("p3", 260_000, remota="cse_01ALTRASESSIONE")))
prova("C396: senza numero della sessione resta a 250k", "OBBLIGATORIO" in testo(lancia("p4", 260_000)))
scrivi_prova({"catena": "Principale", "soglia": 900000, "fino_al": DOMANI})
prova("C396: soglia oltre il tetto → 350k", "soglia 350k" in testo(lancia("p5", 351_000, remota="cse_01ABCDEFGHIJKL")))
scrivi_prova({"catena": "Principale", "soglia": 350000, "fino_al": IERI})
prova("C396: prova finita (data passata) → 250k", "OBBLIGATORIO" in testo(lancia("p6", 260_000, remota="cse_01ABCDEFGHIJKL")))
scrivi_prova(None)
prova("C396: senza il file della prova → 250k", "OBBLIGATORIO" in testo(lancia("p7", 260_000, remota="cse_01ABCDEFGHIJKL")))

print(f"{sum(esiti)}/{len(esiti)} prove dell'hook della soglia verdi")
sys.exit(0 if all(esiti) else 1)
