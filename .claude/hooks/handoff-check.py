#!/usr/bin/env python3
# Protocollo di handoff di CLAUDE.md. Scatta con il contesto oltre SOGLIA_TOKENS
# (250k, Mario #149: la partenza costa ~100k; soglia fissa per risparmiare token, qualunque sia la finestra del modello) e lo ripete a OGNI messaggio:
# testo completo la prima volta, poi una riga corta (C81, #108). Regola dei 40 messaggi tolta da Mario nella #115:
# i token scattano sempre prima; i messaggi si contano solo per il testo dell'avviso.
# Con l'argomento «tool» (hook PostToolUse) controlla anche durante i turni lunghi: muto sotto soglia,
# avvisa una volta sola, mai dentro un aiutante (agent_id).
# Con l'argomento «compact» (hook SessionStart dopo una compressione) rimette l'obbligo nel contesto nuovo:
# la compressione cancella gli avvisi precedenti.
import json, os, sys

SOGLIA_TOKENS = int(os.environ.get("CTX_SOGLIA", "250000"))


# C396 (Mario 01/11 ~22:50 «ok, fai quiz fatti bene»): prova misurata della soglia. Solo la sessione scritta nella riga
# della catena di docs/misure/prova-soglia.json in docs/CHI-FA-COSA.md («## Catene») lavora fino alla sua «soglia»
# (tetto 350k), finché «fino_al» (AAAA-MM-GG) non è passato; le altre chat restano a 250k. Senza il file o a prova
# finita: 250k. Il numero della sessione arriva da CLAUDE_CODE_REMOTE_SESSION_ID («cse_X» = «session_X»).
def soglia_prova():
    try:
        import datetime, re
        base = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
        with open(os.path.join(base, "docs", "misure", "prova-soglia.json"), encoding="utf-8") as f:
            p = json.load(f)
        if datetime.date.today().isoformat() > str(p.get("fino_al", "")):
            return None
        mio = os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID", "").split("_", 1)[-1]
        if len(mio) < 10:
            return None
        with open(os.path.join(base, "docs", "CHI-FA-COSA.md"), encoding="utf-8") as f:
            riga = next((l for l in f if l.startswith(f"| {p.get('catena', 'Principale')} |")), "")
        m = re.search(r"`session_([A-Za-z0-9]+)`", riga)
        if not m or m.group(1) != mio:
            return None
        return max(250000, min(int(p.get("soglia", 0)), 350000))
    except Exception:
        return None


if "CTX_SOGLIA" not in os.environ:
    SOGLIA_TOKENS = soglia_prova() or SOGLIA_TOKENS
AZIONE = ("Prima di qualsiasi altro lavoro: rispondi in breve al messaggio, poi le consegne a stampo (C352, skill «consegne»): "
          "1) python3 -I tools/consegne.py fatti --id <id di questa sessione> --motore <id del motore> --catena <N di lineage> "
          "--prossimo \"<argomento>\" scrive da solo le righe di fatto e docs/PROSSIMA-SESSIONE.md e stampa i messaggi di Mario "
          "da confrontare con docs/DA-FARE.md; 2) tu scrivi in docs/PASSAGGIO-CONSEGNE.md SOLO le parti di giudizio (3 righe fisse, "
          "ultimo messaggio di Mario parola per parola, prossimi passi, fatti nuovi, domande aperte; ~1.000 parole, tetto 1.750) e "
          "l'impegno in .claude/settings.json; 3) commit e push; 4) python3 -I tools/consegne.py controlla: con tutti VERO apri tu "
          "la nuova sessione con create_session (catena sotto 8; a 8 o al cambio account dai a Mario link, repo, ramo e il testo da "
          "incollare), titolo «🟢 🍝 Principale NN · <cosa fa>» (sempre verde, E245; cosa fa: max 3 parole), e rinomina questa in «🔴 🍝 Principale NN · <cosa ha fatto>» (🔴 = chiusa; le altre catene col loro segno, docs/CHI-FA-COSA.md «## Catene»); un FALSO → fermati e "
          "scrivi a Mario. Non iniziare lavori nuovi in questa sessione.")

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
evento = "SessionStart" if "compact" in sys.argv[1:] else "PostToolUse" if "tool" in sys.argv[1:] else "UserPromptSubmit"
if evento == "PostToolUse" and data.get("agent_id"):
    sys.exit(0)
sid = str(data.get("session_id") or "x").replace("/", "_")
state_dir = os.path.join(os.path.expanduser("~"), ".claude", "handoff-check")
os.makedirs(state_dir, exist_ok=True)
state_file = os.path.join(state_dir, sid + ".json")
try:
    with open(state_file) as f:
        st = json.load(f)
except Exception:
    st = {"n": 0}


def esci(why):
    if evento == "PostToolUse" and st.get("avvisato"):
        sys.exit(0)
    corto = evento == "UserPromptSubmit" and st.get("avvisato")
    st["avvisato"] = 0 if evento == "SessionStart" else 1
    with open(state_file, "w") as f:
        json.dump(st, f)
    testo = (f"PROTOCOLLO DI HANDOFF ancora da fare ({why}): passaggio di consegne SUBITO, come da CLAUDE.md."
             if corto else f"PROTOCOLLO DI HANDOFF (CLAUDE.md) OBBLIGATORIO: {why}. {AZIONE}")
    print(json.dumps({
        "systemMessage": f"Soglia {SOGLIA_TOKENS // 1000}k: {why}. Claude deve fare il passaggio di consegne.",
        "hookSpecificOutput": {"hookEventName": evento, "additionalContext": testo}
    }))
    sys.exit(0)


if evento == "SessionStart":
    st["compattata"] = st.get("compattata", 0) + 1
    with open(state_file, "w") as f:
        json.dump(st, f)
    esci("la conversazione è stata compressa perché il contesto era pieno")

if evento == "UserPromptSubmit":
    st["n"] += 1
    with open(state_file, "w") as f:
        json.dump(st, f)

ctx = 0
tp = data.get("transcript_path")
if tp and os.path.exists(tp):
    with open(tp, "rb") as f:
        f.seek(max(0, os.path.getsize(tp) - 2_000_000))
        lines = f.read().decode("utf-8", "ignore").splitlines()
    for line in reversed(lines):
        try:
            u = (json.loads(line).get("message") or {}).get("usage")
        except Exception:
            continue
        if u:
            ctx = sum(int(u.get(k) or 0) for k in ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens"))
            break

n = st["n"]
if ctx >= SOGLIA_TOKENS or st.get("compattata"):
    parti = [f"{n} messaggi in questa sessione"]
    if ctx:
        parti.append(f"contesto circa {ctx // 1000}k token (soglia {SOGLIA_TOKENS // 1000}k)")
    if st.get("compattata"):
        parti.append("conversazione già compressa")
    esci(", ".join(parti))
