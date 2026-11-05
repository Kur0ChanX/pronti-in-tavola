#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/titolo-giallo.py (C368, C369, E245): con domande o passi a mano un titolo dato nel turno
# (🟡 se la sessione si ferma, 🟢 se continua) e la riga di oggi in «## 0. Aspetta Mario»; «inizio»: promemoria del verde.
# Uso: python3 -I tools/test-titolo-giallo.py
import json, os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "titolo-giallo.py")
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


def titolo(t, nome="mcp__claude-code-remote__set_session_title"):
    return {"type": "assistant", "message": {"role": "assistant", "content": [
        {"type": "tool_use", "id": "t", "name": nome, "input": {"session_id": "s", "title": t}}]}}


OGGI = "01/11"
CON_RIGA = os.path.join(TMP, "con-riga")
SENZA_RIGA = os.path.join(TMP, "senza-riga")
SENZA_SEZIONE = os.path.join(TMP, "senza-sezione")
SENZA_DA_FARE = os.path.join(TMP, "senza-da-fare")
for cartella, testo in ((CON_RIGA, "# Da fare\n\n## 0. Aspetta Mario\n- 31/10 · 🧪 · #463 · vecchia\n- 01/11 · 🧪 · #464 · scegli i colori\n\n| N. | Cosa |\n## 1. Claude da solo\n"),
                        (SENZA_RIGA, "# Da fare\n\n## 0. Aspetta Mario\n- 31/10 · 🧪 · #463 · vecchia\n\n## 1. Claude da solo\n- 01/11 fuori dalla sezione\n"),
                        (SENZA_SEZIONE, "# Da fare\n\n## 1. Claude da solo\n- 01/11 · 🧪 · #464 · nella sezione sbagliata\n"),
                        (SENZA_DA_FARE, None)):
    os.makedirs(os.path.join(cartella, "docs"), exist_ok=True)
    if testo:
        with open(os.path.join(cartella, "docs", "DA-FARE.md"), "w", encoding="utf-8") as f:
            f.write(testo)


def stop(messaggio, voci, attivo=False, percorso=None, progetto=CON_RIGA):
    if percorso is None:
        percorso = os.path.join(TMP, "trascrizione.jsonl")
        with open(percorso, "w", encoding="utf-8") as f:
            for v in voci:
                f.write(json.dumps(v, ensure_ascii=False) + "\n")
            f.write("non è json\n")
    dati = json.dumps({"session_id": "prova", "stop_hook_active": attivo, "transcript_path": percorso,
                       "last_assistant_message": messaggio})
    amb = dict(os.environ, CLAUDE_PROJECT_DIR=progetto, TITOLO_GIALLO_OGGI=OGGI)
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30, env=amb)
    return r.returncode, r.stderr


DOMANDA = "✅ FATTO\n- cosa\n───\n❓ DOMANDE\n1. 📌 Di cosa parliamo: x\n   - 1 · a · 2 · b"
PASSI = "✅ FATTO\n- cosa\n───\n👉 DA FARE TU\n1. Apri il link"
SOLO = "✅ FATTO\n- cosa fatta, niente per Mario"

c, err = stop(DOMANDA, [utente("ciao"), titolo("🟢 ⭐ Lavoro · #1"), esito()])
controlla(c == 0, "domanda col titolo 🟢 dato nel turno (continua a lavorare, E245): passa", err)
c, err = stop(DOMANDA, [utente("ciao"), esito()])
controlla(c == 2 and "🟡" in err and "PushNotification" in err and "verde" in err, "domanda senza titolo nel turno: blocca, giallo o verde", err)
c, _ = stop(PASSI, [utente("ciao"), esito()])
controlla(c == 2, "passi a mano senza titolo nel turno: blocca")
c, _ = stop(DOMANDA, [utente("ciao"), titolo("🟢 ⭐ Lavoro · #1"), esito(), titolo("🟡 ⭐ Planner: colori · #1"), esito()])
controlla(c == 0, "ultimo titolo 🟡 nel turno: passa")
c, _ = stop(DOMANDA, [utente("ciao"), titolo("🟡 ⭐ Planner · #1", nome="set_session_title"), esito()])
controlla(c == 0, "nome dello strumento senza prefisso: passa")
c, _ = stop(DOMANDA, [titolo("🟡 ⭐ Vecchio · #1"), esito(), utente("1"), esito()])
controlla(c == 2, "🟡 del turno PRIMA (Mario ha risposto dopo): blocca")
c, _ = stop(DOMANDA, [utente("x"), titolo("🟡 ⭐ A · #1"), esito(), titolo("🟢 ⭐ B · #1"), esito()])
controlla(c == 0, "🟡 poi di nuovo 🟢 nel turno (riparte a lavorare): passa")
c, _ = stop(SOLO, [utente("ciao"), esito()])
controlla(c == 0, "niente domande né passi: passa")
c, _ = stop("Ecco:\n```\n❓ DOMANDE dentro il codice\n```\nfine", [utente("ciao")])
controlla(c == 0, "❓ dentro un blocco di codice: non conta")
c, _ = stop(DOMANDA, [utente("ciao")], attivo=True)
controlla(c == 0, "secondo giro (stop_hook_active): passa")
c, _ = stop(DOMANDA, [], percorso=os.path.join(TMP, "manca.jsonl"))
controlla(c == 0, "trascrizione assente: silenzio")
r = subprocess.run([sys.executable, "-I", HOOK], input="non json", capture_output=True, text=True, timeout=30)
controlla(r.returncode == 0, "ingresso rotto: silenzio")
# E255 (Mario 1/11 ~09:10 «3 messaggi di fila uguali»): sessione chiusa = silenzio; mai «riscrivi il messaggio».
for r_ in ("🔴 🧪 Principale 480 · desk corretto", "❤️ 🧪 Scorte 67 · v118 online", "❌ 🧪 Atlante 60 · fatto", "🟥 🧪 Dov'è 8 · fatto"):
    c, err = stop(PASSI, [titolo(r_), esito(), utente("mandami il testo"), esito()], progetto=SENZA_RIGA)
    controlla(c == 0, f"sessione chiusa ({r_[0]}), passo a mano nel turno dopo: silenzio, non si rinomina", err)
c, err = stop(PASSI, [titolo("🔴 🧪 Principale 480 · fatto"), esito(), titolo("🟢 🧪 Principale 480 · riaperta"), esito(), utente("x"), esito()])
controlla(c == 2, "rossa poi di nuovo verde (riaperta): torna a bloccare", err)
c, err = stop(DOMANDA, [utente("ciao"), esito()])
controlla(c == 2 and "RISCRIVI" not in err and "NON riscrivere" in err, "il blocco non chiede mai di riscrivere il messaggio", err)
c, _ = stop(DOMANDA, [{"type": "user", "message": {"content": [{"type": "text", "text": "avviso"}]}}, esito()])
controlla(c == 2, "turno aperto da un avviso (blocco di testo): conta come inizio")

GIALLO = [utente("ciao"), titolo("🟡 🧪 Principale 1 ❓ · Planner colori"), esito()]
c, err = stop(DOMANDA, GIALLO, progetto=SENZA_RIGA)
controlla(c == 2 and "Aspetta Mario" in err and "01/11" in err and "rinomina" not in err, "🟡 ma nessuna riga di oggi nella sezione 0: blocca solo per la riga", err)
c, err = stop(PASSI, GIALLO, progetto=SENZA_SEZIONE)
controlla(c == 2 and "Aspetta Mario" in err, "sezione 0 assente (riga di oggi altrove): blocca", err)
c, _ = stop(DOMANDA, GIALLO, progetto=SENZA_DA_FARE)
controlla(c == 0, "progetto senza Da fare: controllo della riga saltato")
c, err = stop(DOMANDA, [utente("ciao"), esito()], progetto=SENZA_RIGA)
controlla(c == 2 and "rinomina" in err and "Aspetta Mario" in err, "manca tutto: un solo avviso con le due cose", err)
c, _ = stop(SOLO, [utente("ciao"), esito()], progetto=SENZA_RIGA)
controlla(c == 0, "niente per Mario: la riga non serve")
for g in ("🟨 🧪 Dov'è 8 · foto", "💛 🧪 Scorte 68 · foto", "✴️ 🧪 Atlante 57 · foto", "📒 🧪 Cantina 1 · foto"):
    c, _ = stop(DOMANDA, [utente("ciao"), titolo(g), esito()])
    controlla(c == 0, f"giallo della parallela {g[0]}: passa (kit 30.7)")
c, err = stop(SOLO, GIALLO, progetto=SENZA_RIGA)
controlla(c == 2 and "Titolo giallo" in err and "Aspetta Mario" in err and "rinomina" not in err, "titolo giallo senza domande e senza riga di oggi: blocca per la riga (kit 30.6)", err)
c, _ = stop(SOLO, GIALLO)
controlla(c == 0, "titolo giallo senza domande con la riga di oggi: passa")
c, _ = stop(DOMANDA, GIALLO, attivo=True, progetto=SENZA_RIGA)
controlla(c == 0, "secondo giro senza riga: passa (blocca una volta sola)")
amb = dict(os.environ, CLAUDE_PROJECT_DIR=CON_RIGA)
amb.pop("TITOLO_GIALLO_OGGI", None)
r = subprocess.run([sys.executable, "-I", "-c", "import importlib.util as u, sys; s = u.spec_from_file_location('h', sys.argv[1]); m = u.module_from_spec(s); s.loader.exec_module(m); print(m.oggi())", HOOK],
                   capture_output=True, text=True, timeout=30, env=amb)
controlla(r.returncode == 0 and len(r.stdout.strip()) == 5 and r.stdout.strip()[2] == "/", "data di oggi «gg/mm» in ora italiana", r.stdout + r.stderr)



def inizio(voci, percorso=None):
    if percorso is None:
        percorso = os.path.join(TMP, "trascrizione-inizio.jsonl")
        with open(percorso, "w", encoding="utf-8") as f:
            for v in voci:
                f.write(json.dumps(v, ensure_ascii=False) + "\n")
    r = subprocess.run([sys.executable, "-I", HOOK, "inizio"], input=json.dumps({"transcript_path": percorso}),
                       capture_output=True, text=True, timeout=30)
    return r.returncode, r.stdout


c, out = inizio([utente("a"), titolo("🟢 🧪 Principale 1 · lavoro"), esito(), titolo("🟡 🧪 Principale 1 · scegli foto"), esito(), utente("1")])
controlla(c == 0 and "TITOLO GIALLO" in out and "verde" in out and "scegli foto" in out, "inizio: ultimo titolo giallo (turni prima) → promemoria", out)
c, out = inizio([utente("a"), titolo("🟡 🧪 Principale 1 · foto"), esito(), titolo("🟢 🧪 Principale 1 · lavoro"), esito(), utente("1")])
controlla(c == 0 and out == "", "inizio: ultimo titolo verde → silenzio", out)
c, out = inizio([utente("a"), esito()])
controlla(c == 0 and out == "", "inizio: nessun titolo → silenzio", out)
c, out = inizio([], percorso=os.path.join(TMP, "manca.jsonl"))
controlla(c == 0 and out == "", "inizio: trascrizione assente → silenzio", out)
c, out = inizio([utente("a"), titolo("💛 🧪 Scorte 70 · guarda"), esito()])
controlla(c == 0 and "TITOLO GIALLO" in out, "inizio: giallo di una parallela → promemoria", out)

# C422: domanda decisiva (🛑) → la riga di oggi in «Aspetta Mario» deve avere 🛑.
CON_STOP = os.path.join(TMP, "con-stop")
os.makedirs(os.path.join(CON_STOP, "docs"), exist_ok=True)
with open(os.path.join(CON_STOP, "docs", "DA-FARE.md"), "w", encoding="utf-8") as f:
    f.write("# Da fare\n\n## 0. Aspetta Mario\n- 01/11 · 🛑 · 🟡 Principale 1 · cancello i doppioni?\n\n## 1. Claude da solo\n")
DECISA = "❓ DOMANDE\n1. 🛑 Cancello i 40 doppioni dai dati veri? 1 · sì · 2 · no"
c, err = stop(DECISA, [utente("ciao"), titolo("🟡 🧪 Principale 1 · decidi"), esito()])
controlla(c == 2 and "🛑" in err and "C422" in err, "domanda 🛑 senza 🛑 nella riga di oggi: blocca", err)
c, err = stop(DECISA, [utente("ciao"), titolo("🟡 🧪 Principale 1 ❓ · decidi"), esito()], progetto=CON_STOP)
controlla(c == 0, "domanda 🛑 con 🛑 nella riga di oggi: passa", err)
c, err = stop("❓ DOMANDE\n```\n🛑\n```\n1. colore? 1 · blu", [utente("ciao"), titolo("🟡 🧪 Principale 1 ❓ · decidi"), esito()])
controlla(c == 0, "🛑 dentro un blocco di codice: non conta", err)

# C423: segno delle domande nel titolo, deciso dalle righe della catena in «Aspetta Mario».
c, err = stop(SOLO, [utente("x"), titolo("🟢 🧪 Principale 1 · lavoro"), esito()])
controlla(c == 2 and "Principale 1 ❔ · lavoro" in err, "verde senza ❔ con domande della catena: blocca col titolo giusto", err)
c, err = stop(SOLO, [utente("x"), titolo("🟢 🧪 Principale 1 ❔ · lavoro"), esito()])
controlla(c == 0, "verde con ❔ e domande aperte: passa", err)
c, err = stop(SOLO, [titolo("🟢 🧪 Principale 1 ❔ · lavoro"), esito(), utente("1"), esito()], progetto=SENZA_SEZIONE)
controlla(c == 2 and "«🟢 🧪 Principale 1 · lavoro»" in err, "Mario ha risposto (nessuna riga): blocca per togliere ❔", err)
c, err = stop(SOLO, [titolo("🟢 🧪 Scorte 3 · lavoro"), esito(), utente("1"), esito()])
controlla(c == 0, "altra catena senza righe sue: niente segno, passa", err)
c, err = stop(SOLO, [titolo("Regola nuova"), esito(), utente("1"), esito()])
controlla(c == 0, "titolo senza catena: silenzio", err)
c, err = stop(SOLO, [titolo("🟢 🧪 Principale 1 · lavoro"), esito(), utente("1"), esito()], attivo=True)
controlla(c == 0, "secondo giro: non blocca mai due volte", err)

print(f"ok {ok_n} controlli · ERRORI: 0")
