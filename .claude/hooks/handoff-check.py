#!/usr/bin/env python3
# Protocollo di handoff di CLAUDE.md. Scatta con il contesto oltre SOGLIA_TOKENS
# (350k per tutte le catene dal C469 C1, Mario 09/11 «vai come consiglio»: token neutri, −40 % di passaggi, quiz 10/10 a 350k;
# prima 250k, Mario #149; soglia fissa, qualunque sia la finestra del modello) e lo ripete a OGNI messaggio:
# testo completo la prima volta, poi una riga corta (C81, #108). Regola dei 40 messaggi tolta da Mario nella #115:
# i token scattano sempre prima; i messaggi si contano solo per il testo dell'avviso.
# Con l'argomento «tool» (hook PostToolUse) controlla anche durante i turni lunghi: muto sotto soglia,
# avvisa una volta sola, mai dentro un aiutante (agent_id).
# Con l'argomento «compact» (hook SessionStart dopo una compressione) rimette l'obbligo nel contesto nuovo:
# la compressione cancella gli avvisi precedenti.
import json, os, sys

SOGLIA_TOKENS = int(os.environ.get("CTX_SOGLIA", "350000"))


# C396 (Mario 01/11 ~22:50 «ok, fai quiz fatti bene»): prova misurata della soglia. Solo la sessione scritta nella riga
# della catena di docs/misure/prova-soglia.json in docs/CHI-FA-COSA.md («## Catene») lavora fino alla sua «soglia»
# (tetto 350k, anche più bassa), finché «fino_al» (AAAA-MM-GG) non è passato; le altre chat alla soglia di base (350k,
# C469 C1). Senza il file o a prova finita: la soglia di base. Il numero della sessione arriva da CLAUDE_CODE_REMOTE_SESSION_ID («cse_X» = «session_X»).
def soglia_prova():
    try:
        import datetime, re
        base = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
        with open(os.path.join(base, "docs", "misure", "prova-soglia.json"), encoding="utf-8") as f:
            p = json.load(f)
        mio = os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID", "").split("_", 1)[-1]
        if len(mio) < 10:
            return None
        with open(os.path.join(base, "docs", "CHI-FA-COSA.md"), encoding="utf-8") as f:
            righe = [l for l in f if l.startswith("| ")]
        # Una catena (le chiavi in cima: Principale) o più catene («catene», Mario 04/11 ~15:1x: Magazzini a 300k).
        oggi = datetime.date.today().isoformat()
        for c in ([p] if "catena" in p else []) + list(p.get("catene", [])):
            if oggi > str(c.get("fino_al", "2099-12-31")):
                continue
            riga = next((l for l in righe if l.startswith(f"| {c.get('catena', 'Principale')} |")), "")
            m = re.search(r"`session_([A-Za-z0-9]+)`", riga)
            if m and m.group(1) == mio:
                return max(250000, min(int(c.get("soglia", 0)), 350000))
        return None
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
evento = ("SessionStart" if "compact" in sys.argv[1:] else "PostToolUse" if "tool" in sys.argv[1:]
          else "Stop" if "stop" in sys.argv[1:] else "UserPromptSubmit")
if evento in ("PostToolUse", "Stop") and data.get("agent_id"):
    sys.exit(0)  # C469 fase 2 (rapporto 14 voce 3): al secondo giro dello Stop sì (il giallo arriva spesso dopo un blocco)
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
    # C469 rapporto 12 voce 11: la compressione riassume i messaggi di Mario: prima di tutto si rileggono interi
    esci("la conversazione è stata compressa perché il contesto era pieno; prima rileggi INTERI i messaggi di Mario "
         "di questa sessione con python3 -I tools/consegne.py miei (la compressione li ha riassunti)")

if evento == "UserPromptSubmit":
    st["n"] += 1
    with open(state_file, "w") as f:
        json.dump(st, f)

ctx = 0
tp = data.get("transcript_path")
lines = []
if tp and os.path.exists(tp):
    with open(tp, "rb") as f:
        f.seek(max(0, os.path.getsize(tp) - 2_000_000))
        lines = f.read().decode("utf-8", "ignore").splitlines()
# C455 (Mario 04/11: «arriva a 250.000 … mi sono dimenticato di scrivere una cosa, la scrivo, poi lui non la passa nella nuova
# sessione»): sessione già chiusa (ultimo titolo rosso, skill consegne fase 6) → il messaggio di Mario va passato alla nuova
# (fase 8), non «rifai le consegne». La sessione nuova: l'ultima aperta con create_session in questa trascrizione.
ROSSI = ("🔴", "❤️", "❌", "🟥", "📕")
def chiusa(righe):
    import re
    titolo, nuova, attesa = "", "", {}
    for line in righe:
        try:
            v = json.loads(line)
        except Exception:
            continue
        c = (v.get("message") or {}).get("content")
        if not isinstance(c, list):
            continue
        for b in c:
            if not isinstance(b, dict):
                continue
            if b.get("type") == "tool_use" and str(b.get("name", "")).endswith("set_session_title"):
                titolo = str((b.get("input") or {}).get("title") or "")
            elif b.get("type") == "tool_use" and str(b.get("name", "")).endswith("create_session"):
                attesa[b.get("id")] = 1
            elif b.get("type") == "tool_result" and b.get("tool_use_id") in attesa and not b.get("is_error"):
                m = re.search(r"session_[A-Za-z0-9]{20,}", json.dumps(b.get("content"), ensure_ascii=False))
                nuova = m.group(0) if m else nuova
    return titolo.lstrip().startswith(ROSSI), nuova, titolo
if evento == "UserPromptSubmit" and lines:
    fatto, nuova, _ = chiusa(lines)
    if fatto:
        dove = (f"con send_message alla sessione nuova {nuova}" if nuova else
                "alla sessione nuova con send_message (id in docs/CHI-FA-COSA.md «## Catene»; se non c'è, la apre Mario: diglielo)")
        print(json.dumps({"hookSpecificOutput": {"hookEventName": evento, "additionalContext": (
            "MESSAGGIO DOPO L'HANDOFF (skill consegne, fase 8): questa sessione è chiusa. Il messaggio di Mario NON si perde: "
            f"1) mandalo parola per parola {dove}, chiedendole di rifare fetch e merge; 2) se cambia le consegne, aggiornale "
            "(docs/PASSAGGIO-CONSEGNE.md, docs/DA-FARE.md), commit e push; 3) a Mario una riga: «passato alla sessione nuova». "
            "Nessun altro lavoro qui, niente consegne rifatte da capo.")}}, ensure_ascii=False))
        sys.exit(0)
for line in reversed(lines):
    try:
        u = (json.loads(line).get("message") or {}).get("usage")
    except Exception:
        continue
    if u:
        ctx = sum(int(u.get(k) or 0) for k in ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens"))
        break

# C455 (Mario 04/11 «1 1, 2 1»): (a) a PREAVVISO un avviso, una volta: chiudi il pezzo, le consegne restano alla soglia;
# (b) Stop con titolo giallo (ferma ad aspettare Mario) oltre ATTESA: prima le consegne, così la risposta di Mario trova una
# sessione nuova leggera invece di riscrivere tutto il contesto nella memoria veloce scaduta (~1 ora). Una volta per sessione.
PREAVVISO = SOGLIA_TOKENS - 30000
ATTESA = 180000
GIALLI = ("🟡", "🟨", "💛", "✴️", "📒")
if evento == "Stop":
    _, _, titolo = chiusa(lines)
    if ctx >= ATTESA and titolo.lstrip().startswith(GIALLI) and not st.get("attesa"):
        st["attesa"] = 1
        with open(state_file, "w") as f:
            json.dump(st, f)
        print(f"Ti fermi ad aspettare Mario con il contesto a {ctx // 1000}k (oltre {ATTESA // 1000}k, C455): fai PRIMA le consegne "
              "(skill consegne, tutte le fasi; nella sessione nuova la riga in «Aspetta Mario» e le sue domande). NON riscrivere "
              "il messaggio a Mario: aggiungi solo una riga «consegne fatte, rispondi pure qui o nella nuova».", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)
if PREAVVISO <= ctx < SOGLIA_TOKENS and not st.get("preavviso") and not st.get("compattata"):
    st["preavviso"] = 1
    with open(state_file, "w") as f:
        json.dump(st, f)
    print(json.dumps({"hookSpecificOutput": {"hookEventName": evento, "additionalContext": (
        f"PREAVVISO DELLA SOGLIA (C455): contesto circa {ctx // 1000}k, le consegne a {SOGLIA_TOKENS // 1000}k. Chiudi il pezzo in "
        "corso (commit e push), niente lavori nuovi lunghi né aiutanti; poi le consegne all'avviso.")}}, ensure_ascii=False))
    sys.exit(0)
n = st["n"]
if ctx >= SOGLIA_TOKENS or st.get("compattata"):
    parti = [f"{n} messaggi in questa sessione"]
    if ctx:
        parti.append(f"contesto circa {ctx // 1000}k token (soglia {SOGLIA_TOKENS // 1000}k)")
    if st.get("compattata"):
        parti.append("conversazione già compressa")
    esci(", ".join(parti))
