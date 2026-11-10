#!/usr/bin/env python3
# Guardia (hook PreToolUse): blocca da sola gli errori già noti del diario, così non serve ricordarli.
#   - Bash: comandi vietati anche dentro comandi composti (dopo ; && || | $( ), prove + commit nello
#     stesso comando (E20), prove + push nello stesso comando (E310), script + commit mentre un merge è a metà (E286),
#     «-- …» dopo `npm run prove:e2e` (E58), «playwright install», variabile
#     CLAUDE_CODE_EFFORT_LEVEL.
#   - list_sessions senza limit o con limit oltre 4 (E23).
#   - add_repo di un repo diverso da questo: chiede conferma a Mario (spegne gli hook, E28).
#   - merge_pull_request senza commit_message o con «[skip ci]» (E132: GitHub incolla i messaggi di tutti i
#     commit nello squash; un «[skip ci]» di un commit di documenti ferma la pubblicazione su main).
#   - git commit (e push_files, create_or_update_file di GitHub) con «[skip ci]» nel messaggio (F04: i workflow su push
#     hanno già `paths`, un commit di soli documenti non fa partire niente; nello squash GitHub lo incolla e main non pubblica).
#   - create_pull_request non in bozza e update_pull_request con draft false: se l'ultimo commit del ramo di partenza su
#     GitHub dice «[skip ci]» il giro delle prove non partirebbe (C413, Mario «si» 02/11; E257: v136 aperta così, 50 minuti persi).
#   - merge_pull_request con la pubblicità di app esterne nel corpo della PR (riquadro «codesmith» di Blacksmith,
#     Mario #295: «toglila … se no sporca o ci dimentichiamo»).
#   - 5stelle Pocket (C97 A): comandi di rete verso Pocket fuori dal lettore guardato, utente/password di Pocket,
#     stampa di tutte le variabili (env, printenv, set), WebFetch verso Pocket; «sblocca» del lettore chiede conferma a Mario.
# Se qualcosa va storto la guardia lascia passare (|| true nelle impostazioni): non blocca mai il lavoro per un suo errore.
# Prova: python3 -I tools/test-guardia.py
import json, os, re, subprocess, sys
from urllib.parse import quote

INIZIO = (r"(?:^|[;&|(`\n]|\$\()\s*(?:sudo\s+)?(?:env\s+\S+=\S*\s+)*"
          r"(?:flock\s+(?:-\w+\s+)*\S+\s+)?(?:timeout\s+\S+\s+)?")
VIETATI = [
    (INIZIO + r"git\s+push\b[^;&|\n]*\s(?:-f\b|--force\b|-[a-zA-Z]*f[a-zA-Z]*\b|\+\S)", "push forzato"),
    (INIZIO + r"git\s+reset\s+(?:[^;&|\n]*\s)?--hard\b", "git reset --hard"),
    (INIZIO + r"git\s+clean\s+(?:[^;&|\n]*\s)?-[a-zA-Z]*f", "git clean -f"),
    (INIZIO + r"rm\b(?=[^;&|\n]*(?:\s-[a-zA-Z]*[rR]|\s--recursive\b))(?=[^;&|\n]*(?:\s-[a-zA-Z]*f|\s--force\b))", "rm ricorsivo forzato"),
    (INIZIO + r"(?:kill|pkill|killall)\b", "kill / pkill / killall"),
]
PROVE = INIZIO + (r"(?:npm\s+(?:run\s+)?(?:prove|test)\b|npx\s+(?:vitest|playwright\s+test|firebase\s+emulators:exec)\b"
                  r"|vitest\b|playwright\s+test\b|firebase\s+emulators:exec\b)")
COMMIT = INIZIO + r"git\s+commit\b"
PUSH = INIZIO + r"git\s+push\b"
SCRIPT = INIZIO + r"(?:python3?|node|bash|sh)\s"
# 5stelle Pocket (C97 A, Mario #127): si parla con Pocket SOLO dal lettore guardato, mai a mano.
LETTORE = r"^\s*node\s+tools/pocket/lettore\.mjs\s+(?!sblocca\b)[a-z]+\b[^;&|`$<>()\n]*$"
SBLOCCA = r"^\s*node\s+tools/pocket/lettore\.mjs\s+sblocca\s*$"
POCKET = r"hotelcinquestelle|POCKET_URL"
CHIAVI_POCKET = r"POCKET_(?:PASSWORD|UTENTE)"
# Cloudflare (C205, Mario #294): la chiave di sola lettura la usa SOLO il lettore guardato, mai a mano.
LETTORE_CF = r"^\s*(?:cd\s+[\w./-]+\s*&&\s*)?node\s+tools/cloudflare/lettore\.mjs\s+[a-z]+\s*(?:2>&1\s*)?$"
CHIAVE_CF = r"CLOUDFLARE_LETTURA"
RETE = (r"(?:^|[\s;&|(`/=])(?:curl|wget|https?|nc|ncat|netcat|socat|openssl|telnet|ssh|python3?|node|npx|deno|bun"
        r"|chromium|chrome|google-chrome|playwright|lynx|w3m|links|aria2c)\b")
STAMPA_AMBIENTE = INIZIO + r"(?:env|printenv|export\s+-p|declare\s+-[a-zA-Z]*x|set)\s*(?:$|[|;&>)])"
# Parole che fanno saltare i workflow di un push (documentazione di GitHub Actions, «Skipping workflow runs»).
SALTA_CI = r"\[(?:skip ci|ci skip|no ci|skip actions|actions skip)\]|skip-checks:\s*true"


def esito(decisione, motivo):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse", "permissionDecision": decisione,
        "permissionDecisionReason": "Guardia: " + motivo}}))
    sys.exit(0)


PUBBLICITA = r"<!--\s*codesmith:footer|app\.blacksmith\.sh/[^\s\"')]*codesmith"


def corpo_della_pr(ingresso):
    """Corpo della PR da unire (CORPO_PR_PROVA solo per le prove). Errore o rete giù: vuoto, la guardia lascia passare."""
    if "CORPO_PR_PROVA" in os.environ:
        return os.environ["CORPO_PR_PROVA"]
    try:
        r = subprocess.run(["gh", "api", f"repos/{ingresso.get('owner')}/{ingresso.get('repo')}/pulls/{ingresso.get('pullNumber')}",
                            "--jq", ".body // \"\""], capture_output=True, text=True, timeout=8)
        return r.stdout if r.returncode == 0 else ""
    except Exception:
        return ""


def ramo_della_pr(ingresso):
    """Ramo di partenza (head) della PR: dal tool (create) o da GitHub (update). RAMO_PR_PROVA solo per le prove."""
    if ingresso.get("head"):
        return str(ingresso["head"])
    if "RAMO_PR_PROVA" in os.environ:
        return os.environ["RAMO_PR_PROVA"]
    try:
        r = subprocess.run(["gh", "api", f"repos/{ingresso.get('owner')}/{ingresso.get('repo')}/pulls/{ingresso.get('pullNumber')}",
                            "--jq", ".head.ref // \"\""], capture_output=True, text=True, timeout=8)
        return r.stdout.strip() if r.returncode == 0 else ""
    except Exception:
        return ""


def ultimo_commit_del_ramo(ingresso, ramo):
    """Messaggio dell'ultimo commit del ramo su GitHub (la verità che conta, E41). MESSAGGIO_HEAD_PROVA solo per le prove."""
    if "MESSAGGIO_HEAD_PROVA" in os.environ:
        return os.environ["MESSAGGIO_HEAD_PROVA"]
    try:
        r = subprocess.run(["gh", "api", f"repos/{ingresso.get('owner')}/{ingresso.get('repo')}/commits/{quote(ramo, safe='')}",
                            "--jq", ".commit.message // \"\""], capture_output=True, text=True, timeout=8)
        return r.stdout if r.returncode == 0 else ""
    except Exception:
        return ""


def merge_a_meta():
    """True se c'è un merge a metà (MERGE_HEAD). MERGE_A_META_PROVA solo per le prove. Errore: False, la guardia lascia passare."""
    if "MERGE_A_META_PROVA" in os.environ:
        return os.environ["MERGE_A_META_PROVA"] == "1"
    try:
        r = subprocess.run(["git", "rev-parse", "-q", "--verify", "MERGE_HEAD"], capture_output=True, text=True, timeout=5,
                           cwd=os.environ.get("CLAUDE_PROJECT_DIR") or None)
        return r.returncode == 0
    except Exception:
        return False


def repo_di_questo_progetto():
    try:
        url = subprocess.run(["git", "remote", "get-url", "origin"], capture_output=True, text=True, timeout=5,
                             cwd=os.environ.get("CLAUDE_PROJECT_DIR") or None).stdout.strip()
    except Exception:
        return ""
    pezzi = [p for p in re.split(r"[/:]", url.removesuffix(".git")) if p]
    return "/".join(pezzi[-2:]).lower() if len(pezzi) >= 2 else ""


def controlla_pocket(cmd):
    if re.match(SBLOCCA, cmd):
        esito("ask", "togliere il blocco del lettore di 5stelle Pocket. Mario, tocca Sì solo se l'hai chiesto tu dopo aver letto il motivo dello stop.")
    if re.match(LETTORE, cmd):
        return
    if re.search(CHIAVI_POCKET, cmd):
        esito("deny", "utente e password di Pocket non si leggono né si stampano: li usa solo il lettore (tools/pocket/lettore.mjs).")
    if re.search(POCKET, cmd, re.I) and re.search(RETE, cmd):
        esito("deny", "5stelle Pocket solo dal lettore guardato (node tools/pocket/lettore.mjs <modo> …), mai a mano.")
    if re.search(STAMPA_AMBIENTE, cmd):
        esito("deny", "stamperebbe tutte le variabili, password di Pocket compresa. Per sapere se una c'è: [ -n \"$NOME\" ] && echo sì.")


def controlla_cloudflare(cmd):
    if re.search(CHIAVE_CF, cmd) and not re.match(LETTORE_CF, cmd):
        esito("deny", "la chiave di Cloudflare non si legge né si stampa: la usa solo il lettore (node tools/cloudflare/lettore.mjs <modo>).")


def controlla_bash(cmd):
    for schema, nome in VIETATI:
        if re.search(schema, cmd):
            esito("deny", f"comando vietato ({nome}). Regola «DIVIETO ASSOLUTO» di CLAUDE.md: usa un modo normale e sicuro o fermati e spiega a Mario.")
    controlla_pocket(cmd)
    controlla_cloudflare(cmd)
    if re.search(PROVE, cmd) and re.search(COMMIT, cmd):
        esito("deny", "prove e commit nello stesso comando (E20). Prima guarda l'esito delle prove, poi fai il commit in un comando a parte.")
    if re.search(PROVE, cmd) and re.search(PUSH, cmd):
        esito("deny", "prove e push nello stesso comando (E310: prova rossa, push partito lo stesso). Prima leggi l'esito delle prove, "
                      "poi il push in un comando a parte.")
    if re.search(COMMIT, cmd) and re.search(SCRIPT, cmd) and merge_a_meta():
        esito("deny", "script e commit nello stesso comando con un merge a metà (E286: lo script è fallito e i segni «<<<<<<<» "
                      "sono finiti su GitHub). Prima lo script, poi `git diff --check` o `grep -c '^<<<<<<<'` = 0, SOLO dopo il commit.")
    if re.search(COMMIT, cmd) and re.search(SALTA_CI, cmd, re.I):
        esito("deny", "«[skip ci]» nel messaggio del commit (F04): non serve (i workflow su push hanno già i percorsi, un commit di soli "
                      "documenti non fa partire niente) e fa danno (nello squash GitHub lo incolla e main non pubblica, E132). "
                      "Rifai il commit senza «[skip ci]».")
    if re.search(r"npm\s+run\s+prove:e2e\s+--(?:\s|$)", cmd):
        esito("deny", "mai «-- …» dopo `npm run prove:e2e` (E58): le opzioni vanno dentro il comando delle prove (vedi il diario).")
    if re.search(INIZIO + r"(?:npx\s+)?playwright\s+install\b", cmd):
        esito("deny", "mai «playwright install»: Chromium è già in /opt/pw-browsers (WebKit nel contenitore non c'è).")
    if re.search(r"(?:^|[\s;&|(])(?:export\s+)?CLAUDE_CODE_EFFORT_LEVEL=", cmd):
        esito("deny", "mai la variabile CLAUDE_CODE_EFFORT_LEVEL: l'impegno va in .claude/settings.json (\"effortLevel\").")


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return
    nome = dati.get("tool_name") or ""
    ingresso = dati.get("tool_input") or {}
    if nome == "Bash":
        controlla_bash(str(ingresso.get("command") or ""))
    elif nome == "WebFetch":
        if re.search(POCKET, str(ingresso.get("url") or ""), re.I):
            esito("deny", "5stelle Pocket solo dal lettore guardato (tools/pocket/lettore.mjs), mai con WebFetch.")
    elif nome.endswith("__list_sessions"):
        limite = ingresso.get("limit")
        if not isinstance(limite, int) or limite > 4:
            esito("deny", "list_sessions solo con limit 4 o meno (E23: ogni riga è un JSON enorme).")
    elif nome.endswith("__merge_pull_request"):
        testo = f"{ingresso.get('commit_title') or ''}\n{ingresso.get('commit_message') or ''}"
        if not str(ingresso.get("commit_message") or "").strip():
            esito("deny", "unione senza commit_message (E132): GitHub incollerebbe i messaggi di tutti i commit, "
                          "anche i «[skip ci]» delle consegne, e la pubblicazione su main non partirebbe. "
                          "Passa commit_title e un commit_message corto con cosa cambia.")
        if re.search(SALTA_CI, testo, re.I):
            esito("deny", "il messaggio dell'unione contiene «[skip ci]» o simili (E132): su main non partirebbe la pubblicazione.")
        if re.search(PUBBLICITA, corpo_della_pr(ingresso)):
            esito("deny", "il corpo della PR ha ancora la pubblicità di Blacksmith («codesmith»): toglila con update_pull_request "
                          "(body senza il blocco <!-- codesmith:footer -->), poi riunisci.")
    elif nome.endswith("__push_files") or nome.endswith("__create_or_update_file"):
        if re.search(SALTA_CI, str(ingresso.get("message") or ""), re.I):
            esito("deny", "«[skip ci]» nel messaggio del commit (F04): non serve e nello squash ferma la pubblicazione su main (E132). Toglilo.")
    elif nome.endswith("__create_pull_request") or nome.endswith("__update_pull_request"):
        # C413 (Mario «si» 02/11): PR aperta non in bozza, o segnata pronta, con «[skip ci]» in cima al ramo = nessun giro (E257, v136).
        bozza = ingresso.get("draft")
        pronta = bozza is not True if nome.endswith("__create_pull_request") else bozza is False
        if pronta:
            ramo = ramo_della_pr(ingresso)
            if ramo and re.search(SALTA_CI, ultimo_commit_del_ramo(ingresso, ramo), re.I):
                esito("deny", f"l'ultimo commit di «{ramo}» su GitHub dice «[skip ci]»: GitHub non farebbe partire il giro delle prove "
                              "(C413, E257: v136 ferma 50 minuti). Fai un commit vero senza «[skip ci]» su quel ramo, push, poi riprova.")
    elif nome.endswith("__add_repo"):
        chiesto = f"{ingresso.get('owner', '')}/{ingresso.get('repo', '')}".lower()
        mio = repo_di_questo_progetto()
        if mio and chiesto != mio:
            esito("ask", f"add_repo di {chiesto}: un secondo repo spegne in silenzio gli hook di questa sessione (E28). "
                         "Mario, tocca Sì solo se l'hai chiesto tu.")


if __name__ == "__main__":
    main()
