#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/spreco-token.py (C433): muto se va tutto bene, una riga sola con un'anomalia;
# totale della sessione in archivio/consumo/; somma per account all'avvio.
# Uso: python3 -I tools/test-spreco-token.py
import json, os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "spreco-token.py")
TMP = tempfile.mkdtemp()
os.makedirs(os.path.join(TMP, ".git"))
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def utente(t):
    return {"type": "user", "message": {"role": "user", "content": t}}


def esito(testo="ok"):
    return {"type": "user", "message": {"content": [{"type": "tool_result", "tool_use_id": "t", "content": testo}]}}


def claude(mid, ctx, out=500, strumento=None, ingresso=None):
    c = [{"type": "tool_use", "id": "t", "name": strumento, "input": ingresso or {}}] if strumento else [{"type": "text", "text": "x"}]
    return {"type": "assistant", "message": {"id": mid, "content": c, "usage": {
        "input_tokens": 10, "cache_read_input_tokens": ctx - 10, "cache_creation_input_tokens": 0, "output_tokens": out}}}


def lancia(modo, voci=None, sessione="s1", acc="conto-A", oggi="2026-11-03", **extra):
    percorso = os.path.join(TMP, "t.jsonl")
    with open(percorso, "w", encoding="utf-8") as f:
        for v in voci or []:
            f.write(json.dumps(v, ensure_ascii=False) + "\n")
    dati = dict({"session_id": sessione, "transcript_path": percorso}, **extra)
    amb = dict(os.environ, CLAUDE_PROJECT_DIR=TMP, CLAUDE_CODE_ACCOUNT_UUID=acc, SPRECO_OGGI=oggi, SPRECO_NO_GIT="1")
    r = subprocess.run([sys.executable, "-I", HOOK, modo], input=json.dumps(dati), capture_output=True, text=True, timeout=30, env=amb)
    return r.returncode, r.stdout


BASE = [utente("ciao"), claude("a", 60_000), utente("fai x")]
# Turno normale: muto.
c, out = lancia("fine", BASE + [claude("b", 70_000, strumento="Bash", ingresso={"command": "ls"}), esito(), claude("c", 72_000)])
controlla(c == 0 and out == "", "fine, turno normale: muto", out)
c, out = lancia("inizio")
controlla(c == 0 and out == "", "inizio dopo un turno normale: muto", out)
# Uscita enorme + giro a vuoto + contesto cresciuto: detto al messaggio dopo, una volta sola.
grande = "x" * 50 * 1024
giro = [claude(f"g{i}", 80_000 + i, strumento="Bash", ingresso={"command": "git status"}) for i in range(4)]
voci = BASE + [claude("b", 70_000, strumento="Read", ingresso={"file_path": "/a"}), esito(grande)]
for g in giro:
    voci += [g, esito()]
voci += [claude("z", 190_000)]
c, out = lancia("fine", voci)
controlla(c == 0 and out == "", "fine: non parla mai da sé (zero token)", out)
c, out = lancia("inizio")
controlla("SPRECO TOKEN" in out and "50 KB" in out and "giro a vuoto" in out and "130k" in out and "UNA riga" in out,
          "inizio: anomalie del turno prima in una riga", out)
c, out = lancia("inizio")
controlla(out == "", "dette una volta sola", out)
# Messaggi divisi in più righe con lo stesso id: contati una volta.
doppio = claude("d", 75_000, out=20_000)
c, out = lancia("fine", BASE + [doppio, doppio])
c, out = lancia("inizio")
controlla(out == "", "stesso id due volte: 20k scritti, non 40k (sotto il tetto)", out)
# Avvio pesante.
c, out = lancia("fine", [utente("[AVVIO]"), claude("a", 150_000)], sessione="s2")
c, out = lancia("inizio", sessione="s2")
controlla("avvio pesante" in out, "primo turno oltre il tetto: avvio pesante", out)
# Ripetuto dal vivo: al 4° uguale una riga, poi silenzio.
lancia("inizio", sessione="s3")
uscite = [lancia("tool", sessione="s3", tool_name="Bash", tool_input={"command": "git log"})[1] for _ in range(5)]
controlla(uscite[:3] == ["", "", ""] and "4 volte" in uscite[3] and uscite[4] == "", "tool: avviso al 4° comando uguale, una volta", uscite)
controlla(lancia("tool", sessione="s3", tool_name="Bash", tool_input={"command": "git diff"})[1] == "", "tool: comando diverso muto")
lancia("inizio", sessione="s3")
controlla(lancia("tool", sessione="s3", tool_name="Bash", tool_input={"command": "git log"})[1] == "", "tool: turno nuovo, conti azzerati")
# Totale del giorno della sessione.
with open(os.path.join(TMP, "archivio", "consumo", "2026-11-03-s1.json"), encoding="utf-8") as f:
    tot = json.load(f)
controlla(tot["turni"] == 3 and tot["account"] != "conto-A" and len(tot["account"]) == 6 and tot["anomalie"], "totale in archivio/consumo, account coperto", tot)
# Avvio: account con ieri 2 volte la media → una riga; account normale → muto.
cons = os.path.join(TMP, "archivio", "consumo")
for nome in os.listdir(cons):
    os.remove(os.path.join(cons, nome))
for giorno, peso in (("2026-10-28", 100_000), ("2026-10-29", 120_000), ("2026-10-30", 80_000), ("2026-11-02", 300_000)):
    with open(os.path.join(cons, f"{giorno}-x.json"), "w") as f:
        json.dump({"account": "aaa111", "peso": peso}, f)
c, out = lancia("avvio")
controlla("account aaa111" in out and "3.0 volte" in out, "avvio: account oltre la media → una riga", out)
with open(os.path.join(cons, "2026-11-02-x.json"), "w") as f:
    json.dump({"account": "aaa111", "peso": 110_000}, f)
c, out = lancia("avvio")
controlla(out == "", "avvio: account nella media → muto", out)
# Errori: silenzio.
r = subprocess.run([sys.executable, "-I", HOOK, "fine"], input="non json", capture_output=True, text=True, timeout=30)
controlla(r.returncode == 0 and r.stdout == "", "ingresso rotto: silenzio")
c, out = lancia("fine", BASE, stop_hook_active=True)
controlla(c == 0 and out == "", "secondo giro dello Stop: muto")

print(f"ok {ok_n} controlli · ERRORI: 0")
