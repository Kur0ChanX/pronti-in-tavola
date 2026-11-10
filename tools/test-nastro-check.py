#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/nastro-check.py (C371 kit 30.6): a ogni unione di PR nastro «🚀 Online» con la data
# di oggi in docs/DA-FARE.md e notifica «🚀» sul telefono.
# Uso: python3 -I tools/test-nastro-check.py
import json, os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "nastro-check.py")
TMP = tempfile.mkdtemp()
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def utente(testo):
    return {"type": "user", "message": {"role": "user", "content": testo}}


def esito():
    return {"type": "user", "message": {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "t", "content": "ok"}]}}


def usa(nome, dati):
    return {"type": "assistant", "message": {"role": "assistant", "content": [{"type": "tool_use", "id": "t", "name": nome, "input": dati}]}}


UNISCI = usa("mcp__github__merge_pull_request", {"pullNumber": 114})
NOTIFICA = usa("PushNotification", {"message": "🚀 v119 online · 🟢 Principale 466 · colori Planner"})
OGGI = "01/11"
AGGIORNATO = os.path.join(TMP, "aggiornato")
VECCHIO = os.path.join(TMP, "vecchio")
SENZA = os.path.join(TMP, "senza")
for cartella, testo in ((AGGIORNATO, "# Da fare\n\n## Nastro delle versioni\n🚀 Online: v119 · 🟢 Principale 466 · 01/11 10:20 · colori Planner\n🧪 In prova: nessuna\n\n## 0. Aspetta Mario\n"),
                        (VECCHIO, "# Da fare\n\n## Nastro delle versioni\n🚀 Online: v118 · 💚 Scorte 67 · 31/10 23:53 · ordini\n\n## 0. Aspetta Mario\n- 01/11 · altro\n"),
                        (SENZA, None)):
    os.makedirs(os.path.join(cartella, "docs"), exist_ok=True)
    if testo:
        with open(os.path.join(cartella, "docs", "DA-FARE.md"), "w", encoding="utf-8") as f:
            f.write(testo)


def stop(voci, progetto, attivo=False, percorso=None):
    if percorso is None:
        percorso = os.path.join(TMP, "trascrizione.jsonl")
        with open(percorso, "w", encoding="utf-8") as f:
            for v in voci:
                f.write(json.dumps(v, ensure_ascii=False) + "\n")
            f.write("non è json\n")
    dati = json.dumps({"session_id": "prova", "stop_hook_active": attivo, "transcript_path": percorso, "last_assistant_message": "fatto"})
    amb = dict(os.environ, CLAUDE_PROJECT_DIR=progetto, NASTRO_OGGI=OGGI)
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30, env=amb)
    return r.returncode, r.stderr


c, _ = stop([utente("vai"), esito()], VECCHIO)
controlla(c == 0, "nessuna unione nel turno: passa")
c, _ = stop([utente("vai"), UNISCI, esito(), NOTIFICA, esito()], AGGIORNATO)
controlla(c == 0, "unione + nastro di oggi + notifica: passa")
c, err = stop([utente("vai"), UNISCI, esito(), NOTIFICA, esito()], VECCHIO)
controlla(c == 2 and "Nastro delle versioni" in err and "PushNotification" not in err, "nastro vecchio: blocca solo per il nastro", err)
c, err = stop([utente("vai"), UNISCI, esito()], AGGIORNATO)
controlla(c == 2 and "PushNotification" in err and "Nastro" not in err, "senza notifica: blocca solo per la notifica", err)
c, err = stop([utente("vai"), UNISCI, esito(), usa("PushNotification", {"message": "unita"}), esito()], AGGIORNATO)
controlla(c == 2 and "PushNotification" in err, "notifica senza 🚀: non conta", err)
c, err = stop([utente("vai"), UNISCI, esito()], VECCHIO)
controlla(c == 2 and "Nastro" in err and "PushNotification" in err and "solo quella" in err, "manca tutto: un solo avviso con le due cose", err)
c, err = stop([utente("vai"), UNISCI, esito()], SENZA)
controlla(c == 2 and "Nastro" not in err and "PushNotification" in err, "progetto senza Da fare: solo la notifica", err)
c, _ = stop([utente("vai"), UNISCI, esito(), utente("altro"), esito()], VECCHIO)
controlla(c == 0, "unione di un turno PRIMA: passa")
c, _ = stop([utente("vai"), usa("merge_pull_request", {}), esito()], VECCHIO, attivo=True)
controlla(c == 0, "secondo giro (stop_hook_active): passa")
c, _ = stop([], VECCHIO, percorso=os.path.join(TMP, "manca.jsonl"))
controlla(c == 0, "trascrizione assente: silenzio")
r = subprocess.run([sys.executable, "-I", HOOK], input="{rotto", capture_output=True, text=True, timeout=30)
controlla(r.returncode == 0, "ingresso rotto: silenzio")
print(f"ok {ok_n} controlli · ERRORI: 0")
