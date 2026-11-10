#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/fermo-fable.py (C472: sessione nuova ferma finché Mario non mette Fable), su un progetto finto.
# Uso: python3 -I tools/test-fermo-fable.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "fermo-fable.py")
SETTINGS = os.path.join(QUI, "..", ".claude", "settings.json")
SEGNO = "⛔ FABLE (C472)"
AVVIO = f"[AVVIO] {SEGNO}: la sessione di prima lavorava con Fable.\nSei la chat parallela Prova 2 del progetto."
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def hook(progetto, modo, dati, grezzo=None):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto)
    testo = grezzo if grezzo is not None else json.dumps(dati)
    r = subprocess.run([sys.executable, "-I", HOOK, modo], input=testo, capture_output=True, text=True, env=env,
                       cwd=progetto)
    controlla(r.returncode == 0, f"uscita 0 sempre ({modo})")
    controlla(not r.stderr.strip(), f"niente errori ({modo}): {r.stderr[:200]}")
    return r.stdout.strip()


def registro(progetto, nome, modello):
    p = os.path.join(progetto, nome)
    with open(p, "w", encoding="utf-8") as f:
        f.write(json.dumps({"type": "user", "message": {"role": "user", "content": "x"}}) + "\n")
        if modello:
            f.write(json.dumps({"type": "assistant", "message": {"role": "assistant", "model": modello}}) + "\n")
    return p


def prova():
    base = tempfile.mkdtemp(prefix="fermo-fable-")
    try:
        os.makedirs(os.path.join(base, ".git"))
        vuoto = registro(base, "vuoto.jsonl", "")

        # 1. Messaggio normale, senza segno: muto.
        s = {"session_id": "s1", "transcript_path": vuoto}
        controlla(hook(base, "inizio", dict(s, prompt="ciao")) == "", "senza segno: muto")
        controlla(hook(base, "inizio", dict(s, prompt=f"guarda {SEGNO}")) == "", "segno fuori da [AVVIO]: muto")
        controlla(hook(base, "inizio", dict(s, prompt="[AVVIO] Sei la chat parallela X 2")) == "", "[AVVIO] senza segno: muto")

        # 2. Nata con Opus (campo model dell'avvio): ferma, a ogni messaggio, finché non c'è Fable.
        s = {"session_id": "s2", "transcript_path": vuoto}
        hook(base, "avvio", dict(s, model="claude-opus-5-5", source="startup"))
        out = hook(base, "inizio", dict(s, prompt=AVVIO))
        controlla(out.startswith("⛔ FERMO PER FABLE") and "lavora con Opus" in out, "Opus all'avvio: ferma")
        controlla("metti Fable" in out and "vai con Opus" in out, "dice a Mario cosa fare")
        out = hook(base, "inizio", dict(s, prompt="via"))
        controlla(out.startswith("⛔ FERMO PER FABLE"), "ancora Opus: ferma di nuovo")
        hook(base, "cambio", dict(s, from_model="claude-opus-5-5", to_model="claude-fable-5-2"))
        out = hook(base, "inizio", dict(s, prompt="via"))
        controlla(out.startswith("✅ FABLE (C472)") and "avvio" in out, "Fable messo da Mario: riparte")
        controlla(hook(base, "inizio", dict(s, prompt="e poi?")) == "", "dopo: muto")
        hook(base, "cambio", dict(s, from_model="claude-fable-5-2", to_model="claude-opus-5-5"))
        controlla(hook(base, "inizio", dict(s, prompt="ora Opus")) == "", "Opus scelto dopo Fable: muto (tempo 2)")

        # 3. Nata già con Fable: muta.
        s = {"session_id": "s3", "transcript_path": vuoto}
        hook(base, "avvio", dict(s, model="claude-fable-5-2", source="startup"))
        controlla(hook(base, "inizio", dict(s, prompt=AVVIO)) == "", "nata con Fable: muta")

        # 4. Motore ignoto (avvio senza model, registro vuoto): ferma e chiede a Claude di guardare il suo motore.
        s = {"session_id": "s4", "transcript_path": vuoto}
        hook(base, "avvio", dict(s, source="startup"))
        out = hook(base, "inizio", dict(s, prompt=AVVIO))
        controlla("non risulta Fable" in out and "già Fable" in out, "motore ignoto: ferma con il controllo di Claude")

        # 5. «vai con Opus» sblocca; il testo [AVVIO] stesso non sblocca.
        s = {"session_id": "s5", "transcript_path": vuoto}
        hook(base, "avvio", dict(s, model="claude-opus-5-5"))
        controlla(hook(base, "inizio", dict(s, prompt=AVVIO + " vai con Opus")).startswith("⛔"), "[AVVIO] non sblocca")
        out = hook(base, "inizio", dict(s, prompt="Vai con Opus"))
        controlla(out.startswith("✅ FABLE (C472): Mario ha scelto di andare con Opus"), "«vai con Opus» sblocca")
        controlla(hook(base, "inizio", dict(s, prompt="ok")) == "", "dopo lo sblocco: muto")
        s = {"session_id": "s5b", "transcript_path": vuoto}
        hook(base, "avvio", dict(s, model="claude-opus-5-5"))
        hook(base, "inizio", dict(s, prompt=AVVIO))
        controlla(hook(base, "inizio", dict(s, prompt="opus va bene")).startswith("✅"), "«opus va bene» sblocca")
        s = {"session_id": "s5c", "transcript_path": vuoto}
        hook(base, "avvio", dict(s, model="claude-opus-5-5"))
        hook(base, "inizio", dict(s, prompt=AVVIO))
        controlla(hook(base, "inizio", dict(s, prompt="Opus legge il piano?")).startswith("⛔"), "domanda su Opus: non sblocca")

        # 6. Dal registro: l'ultima risposta era di Opus (niente campo model all'avvio).
        s = {"session_id": "s6", "transcript_path": registro(base, "opus.jsonl", "claude-opus-5-5")}
        out = hook(base, "inizio", dict(s, prompt=AVVIO))
        controlla("ultima risposta con Opus" in out, "dal registro: parla dell'ultima risposta")
        s["transcript_path"] = registro(base, "fable.jsonl", "claude-fable-5-2")
        controlla(hook(base, "inizio", dict(s, prompt="via")).startswith("✅"), "registro con Fable: riparte")

        # 7. Entrata rotta: muto, uscita 0.
        controlla(hook(base, "inizio", {}, grezzo="non json") == "", "entrata rotta: muto")
        controlla(hook(base, "boh", {"session_id": "x"}) == "", "modo ignoto: muto")
    finally:
        shutil.rmtree(base, ignore_errors=True)

    # 8. Acceso in settings.json nei tre eventi.
    with open(SETTINGS, encoding="utf-8") as f:
        hooks = json.load(f)["hooks"]
    for evento, modo in (("SessionStart", "avvio"), ("UserPromptSubmit", "inizio"), ("PostModelSwitch", "cambio")):
        comandi = [h["command"] for g in hooks.get(evento, []) for h in g["hooks"]]
        controlla(any("fermo-fable.py\" " + modo in c for c in comandi), f"acceso in {evento} ({modo})")


if __name__ == "__main__":
    prova()
    print(f"test-fermo-fable: {ok_n} controlli verdi")
