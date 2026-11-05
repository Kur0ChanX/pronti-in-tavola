#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/domande-chiare.py (C233, E145): domande a Mario chiare e col contesto.
# Uso: python3 -I tools/test-domande-chiare.py
import json, os, subprocess, sys, tempfile, time

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "domande-chiare.py")
ok_n = 0
TMP = tempfile.mkdtemp()
subprocess.run(["git", "init", "-q", TMP], check=True)
GITDIR = os.path.join(TMP, ".git")
STATO = os.path.join(GITDIR, "domande-ultime.json")


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def stop(messaggio, attivo=False, grezzo=None, tieni=False):
    if not tieni and os.path.exists(STATO):
        os.remove(STATO)  # ogni controllo parte senza domande di prima, salvo quelli della domanda ripetuta
    dati = grezzo if grezzo is not None else json.dumps({"session_id": "prova", "stop_hook_active": attivo,
                                                         "last_assistant_message": messaggio})
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30,
                       env=dict(os.environ, CLAUDE_PROJECT_DIR=TMP))
    return r.returncode, r.stderr


def blocca(messaggio, nome, motivo):
    c, err = stop(messaggio)
    controlla(c == 2 and "C233" in err and motivo in err, nome, f"{c} {err}")


def passa(messaggio, nome):
    c, err = stop(messaggio)
    controlla(c == 0 and not err, nome, f"{c} {err}")


BUONA = """✅ FATTO
- Prove verdi.

───
❓ DOMANDE
📌 Di cosa parliamo: la striscia gialla in alto nella chat quando il server gratuito ha finito le scritture del giorno.
Che testo vuoi nella striscia (foto qui sopra)?
1 · «…partono alle 09:00» · 2 · «…fino alle 09:00: partono da soli»
Consiglio la 2: l'ora si legge subito.

───
⚠️ ATTENZIONE
La patch C200 entra nella v68 (E143)."""

# Messaggi senza domande: sempre zitto.
passa("✅ FATTO\n- C200 nel ramo, E143 rispettata, #263 chiusa.", "niente domande: le sigle nel resoconto vanno bene")
passa(BUONA, "domanda col contesto, scelte e versione v67: va bene; sigle dopo «───» non contano")
passa(BUONA.replace("📌 Di cosa parliamo:", "📌 Di cosa parliamo (v67):"), "la versione dell'app (v67) va bene")
passa("Confronta il blocco `❓ DOMANDE` delle regole.", "«❓» in mezzo alla riga (citato) non è un blocco")
passa("```\n❓ DOMANDE\n1 · C200\n```\nFatto.", "«❓» dentro un blocco di codice non conta")
passa("❓ DOMANDE\n📌 Di cosa parliamo: cancellare le prove vecchie.\nConfermi? 1 · Sì · 2 · No", "conferma «1 · Sì · 2 · No»")

# Domande poco chiare: blocca una volta.
blocca(BUONA.replace("📌 Di cosa parliamo: la striscia", "La striscia"), "manca il contesto", "📌")
blocca(BUONA.replace("1 · «…partono alle 09:00» · 2 · «…fino alle 09:00: partono da soli»", "La 1 o la 2?"),
       "mancano le scelte numerate", "scelte numerate")
blocca(BUONA.replace("Che testo vuoi", "Per la C231 della P18, che testo vuoi"), "sigle di lavoro e di sessione", "C231, P18")
blocca("**❓ DOMANDE**\n📌 Di cosa parliamo: i passi della #247.\n1 · Fatti · 2 · Non ancora", "sigla di sessione", "#247")
blocca("❓ Domanda 3\n📌 Di cosa parliamo: E140.\n1 · Sì · 2 · No", "domanda in testa senza blocco «DOMANDE»", "E140")

# Secondo giro e ingressi strani: silenzio.
c, err = stop(BUONA.replace("📌", ""), attivo=True)
controlla(c == 0 and not err, "secondo giro (stop_hook_active): mai bloccare due volte", f"{c} {err}")
for grezzo, nome in (("non json", "ingresso non JSON"), (json.dumps({"session_id": "x"}), "senza messaggio"),
                     (json.dumps({"last_assistant_message": 7}), "messaggio non testo")):
    c, err = stop(None, grezzo=grezzo)
    controlla(c == 0 and not err, nome, f"{c} {err}")

# Domanda ripetuta senza un messaggio di Mario in mezzo (Mario 27/10 «non rifarmi le stesse domande in loop»).
def mario_scrive():
    open(os.path.join(GITDIR, "scorta-msg.md"), "w").write("messaggio\n")
    t = time.time() + len(os.listdir(GITDIR))
    os.utime(os.path.join(GITDIR, "scorta-msg.md"), (t, t))


mario_scrive()
c, err = stop(BUONA)
controlla(c == 0, "prima volta: passa", err)
c, err = stop(BUONA.replace("Consiglio la 2", "Io consiglio la 2"), tieni=True)
controlla(c == 2 and "ripetuta" in err, "stessa domanda (riscritta) senza Mario in mezzo: blocca", f"{c} {err}")
c, err = stop("✅ FATTO\n- Aspetto la tua risposta.", tieni=True)
controlla(c == 0 and not err, "senza la domanda: passa", f"{c} {err}")
c, err = stop("❓ DOMANDE\n📌 Di cosa parliamo: il colore del tasto Salva nella scheda camere.\n1 · Verde · 2 · Blu",
              tieni=True)
controlla(c == 0 and not err, "domanda diversa: passa", f"{c} {err}")
c, err = stop(BUONA, tieni=True)
controlla(c == 0, "torna la prima ma l'ultima mostrata era un'altra: passa", err)
mario_scrive()
c, err = stop(BUONA, tieni=True)
controlla(c == 0 and not err, "Mario ha scritto d'altro: la domanda si può rifare una volta", f"{c} {err}")
c, err = stop(BUONA.replace("📌", ""), tieni=True)
controlla(c == 2 and "ripetuta" in err, "ripetuta e anche senza contesto: vale la ripetuta", f"{c} {err}")
c, err = stop(BUONA.replace("📌 Di cosa parliamo: la striscia", "La striscia"), tieni=False)
c, err = stop(BUONA, attivo=True, tieni=True)
controlla(c == 0 and not err, "riscritta dopo il blocco del contesto: passa (secondo giro)", f"{c} {err}")
c, err = stop(BUONA, tieni=True)
controlla(c == 2 and "ripetuta" in err, "dopo la riscrittura è segnata: rifarla di nuovo blocca", f"{c} {err}")

# Foto e video (E240, E247; Mario 1/11 «mandami un video se mi devi mostrare qualcosa animata»).
def turno(*voci):
    """Scrive un transcript finto: voci = ("mario", testo) | ("sistema", testo) | ("file", [percorsi])."""
    righe = []
    for tipo, x in voci:
        if tipo == "file":
            righe.append({"type": "assistant", "message": {"content": [
                {"type": "tool_use", "name": "SendUserFile", "input": {"files": x}}]}})
        else:
            righe.append({"type": "user", "isMeta": tipo == "sistema", "message": {"content": x}})
    nome = os.path.join(TMP, "turno.jsonl")
    with open(nome, "w") as f:
        f.write("\n".join(json.dumps(r) for r in righe) + "\n")
    return nome


def stop_media(messaggio, voci, attivo=False):
    if os.path.exists(STATO):
        os.remove(STATO)
    dati = json.dumps({"session_id": "session_scorte", "stop_hook_active": attivo, "last_assistant_message": messaggio,
                       "transcript_path": turno(*voci)})
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30,
                       env=dict(os.environ, CLAUDE_PROJECT_DIR=TMP))
    return r.returncode, r.stderr


MOSSA = "❓ DOMANDE\n📌 Di cosa parliamo: lo sblocco con l'impronta, con l'onda verde.\n1 · Va bene · 2 · Cambi"
c, err = stop_media(MOSSA, [("mario", "mandami un video")])
controlla(c == 2 and "E247" in err and "video" in err, "cosa che si muove senza video nel turno: blocca", f"{c} {err}")
c, err = stop_media(MOSSA, [("mario", "ok"), ("file", ["archivio/C359/sblocco.mp4"])])
controlla(c == 0 and not err, "video mandato nel turno: passa", f"{c} {err}")
c, err = stop_media(MOSSA, [("file", ["archivio/C359/sblocco.mp4"]), ("mario", "e il video?")])
controlla(c == 2 and "E247" in err, "video mandato in un turno di prima: blocca", f"{c} {err}")
c, err = stop_media(MOSSA, [("mario", "ok"), ("file", ["archivio/x.png"]), ("sistema", "Stop hook feedback")])
controlla(c == 2 and "video" in err, "solo una foto (e un messaggio del sistema dopo): blocca", f"{c} {err}")
c, err = stop_media(MOSSA, [("mario", "ok")], attivo=True)
controlla(c == 0 and not err, "secondo giro: mai due volte", f"{c} {err}")
c, err = stop_media(BUONA, [("mario", "ok")])
controlla(c == 0 and not err, "domanda su una cosa ferma senza video: passa", f"{c} {err}")
os.makedirs(os.path.join(TMP, "docs"), exist_ok=True)
os.makedirs(os.path.join(TMP, "archivio", "c1"), exist_ok=True)
open(os.path.join(TMP, "archivio", "c1", "colori.png"), "w").write("x")
open(os.path.join(TMP, "docs", "DA-FARE.md"), "w").write(
    "# Da fare\n## 0. Aspetta Mario\n- 01/11 · 💛 Scorte 70 · colori del tasto (foto `archivio/c1/colori.png`): 1 · 2.\n"
    "- 01/11 · 💛 Scorte 70 · foto `archivio/c1/manca.png` che non c'è.\n"
    "- 01/11 · 🟡 Principale 471 · foto `archivio/c1/colori2.png` (dell'altra catena).\n\n## 1. Altro\n")
open(os.path.join(TMP, "archivio", "c1", "colori2.png"), "w").write("x")
open(os.path.join(TMP, "docs", "CHI-FA-COSA.md"), "w").write(
    "## Catene\n| Catena | Forma | Segni | Numero | Sessione | Chiusa il |\n|---|---|---|---|---|---|\n"
    "| Principale | cerchi | 🟢 | 471 | `session_princ` | — |\n| Scorte | cuori | 💚 | 71 | `session_scorte` | — |\n")
RICORDO = "✅ FATTO\n- Avvio.\n───\n⏳ Aspettano te\n- Scorte 70: colori del tasto.\n- Principale 471: altro."
c, err = stop_media(RICORDO, [("mario", "[AVVIO]")])
controlla(c == 2 and "archivio/c1/colori.png" in err and "manca.png" not in err and "colori2" not in err,
          "promemoria: la foto vera della propria catena va rimandata (il file che non c'è e l'altra catena no)",
          f"{c} {err}")
c, err = stop_media(RICORDO, [("mario", "[AVVIO]"), ("file", ["/home/x/archivio/c1/colori.png"])])
controlla(c == 0 and not err, "foto rimandata (percorso intero): passa", f"{c} {err}")
c, err = stop_media("✅ FATTO\n- Principale 471 ha finito.", [("mario", "ok")])
controlla(c == 0 and not err, "riga senza foto vera: passa", f"{c} {err}")

print(f"OK domande-chiare: {ok_n} controlli")
