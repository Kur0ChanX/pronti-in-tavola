#!/usr/bin/env python3
# Prova della guardia (.claude/hooks/guardia.py): python3 -I tools/test-guardia.py
import json, os, subprocess, sys

QUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUARDIA = os.path.join(QUI, ".claude", "hooks", "guardia.py")


def decide(nome, ingresso, corpo="", **finti):
    # CORPO_PR_PROVA: corpo finto della PR, così le prove dell'unione non chiedono niente a GitHub.
    r = subprocess.run([sys.executable, "-I", GUARDIA], input=json.dumps({"tool_name": nome, "tool_input": ingresso}),
                       capture_output=True, text=True, timeout=10, cwd=QUI,
                       env={**os.environ, "CLAUDE_PROJECT_DIR": QUI, "CORPO_PR_PROVA": corpo, **finti})
    if r.returncode != 0:
        return "errore:" + r.stderr.strip()[-200:]
    if not r.stdout.strip():
        return "passa"
    return json.loads(r.stdout)["hookSpecificOutput"]["permissionDecision"]


BASH = [
    # (comando, atteso)
    ("git push -f origin x", "deny"), ("git push --force-with-lease", "deny"), ("git push origin x --force", "deny"),
    ("git push origin +main", "deny"), ("git push -u origin +HEAD:x", "deny"),
    ("cd app && git push -f", "deny"), ("git fetch && git reset --hard origin/x", "deny"), ("git clean -fd", "deny"),
    ("rm -rf node_modules", "deny"), ("rm -Rf x", "deny"), ("rm -r -f x", "deny"), ("rm --recursive --force x", "deny"),
    ("ls; kill 123", "deny"), ("pkill -f node", "deny"), ("sudo killall node", "deny"), ("echo $(kill 1)", "deny"),
    ("npm run prove > f.log 2>&1; git commit -m x", "deny"), ("npm run prove | grep ok && git commit -m x", "deny"),
    ("flock /tmp/prove.lock npm run prove:e2e && git commit -qm x", "deny"),
    ("npx firebase emulators:exec --only firestore \"npx vitest run\" && git commit -m x", "deny"),
    ("npm run prove:e2e -- --grep fruga", "deny"), ("npx playwright install chromium", "deny"),
    ("CLAUDE_CODE_EFFORT_LEVEL=xhigh claude", "deny"),
    # devono passare
    ("git push -u origin claude/progetto-ramo-definitivo", "passa"), ("git push origin feature-fix", "passa"),
    ("git push -q -u origin x && git fetch -q origin x", "passa"), ("git commit -m 'kill the bug'", "passa"),
    ("grep -n \"git reset --hard\" CLAUDE.md", "passa"), ("grep -n 'rm -rf' docs/ERRORI.md", "passa"),
    ("rm -r /tmp/x", "passa"), ("rm -f file.txt", "passa"), ("npm run prove > /tmp/p.log 2>&1; echo $?", "passa"),
    ("git add -A && git commit -m 'prove verdi'", "passa"), ("ps aux | grep node", "passa"),
    ("curl -X POST http://127.0.0.1:8080/shutdown", "passa"), ("npm run build && npm run prove:e2e > f 2>&1", "passa"),
    ("git log --follow -- x", "passa"), ("echo skill", "passa"),
    ("export CLAUDE_CODE_EFFORT_LEVEL=high", "deny"),
    ("grep -n 'CLAUDE_CODE_EFFORT_LEVEL' CLAUDE.md", "passa"),
    ("cat >> docs/x.md <<'FINE'\n- mai la variabile `CLAUDE_CODE_EFFORT_LEVEL`\nFINE", "passa"),
    # 5stelle Pocket (C97 A): solo dal lettore guardato
    ("curl -s \"$POCKET_URL\"", "deny"), ("curl https://app.pc211.hotelcinquestelle.cloud/receptionMobile/UIDL/", "deny"),
    ("wget -q https://app.pc211.hotelcinquestelle.cloud/", "deny"), ("python3 -c \"import os;print(os.environ['POCKET_URL'])\"", "deny"),
    ("node -e \"fetch(process.env.POCKET_URL)\"", "deny"), ("echo $POCKET_PASSWORD", "deny"), ("printenv POCKET_UTENTE", "deny"),
    ("env", "deny"), ("env | grep POCKET", "deny"), ("printenv", "deny"), ("set | grep -i pass", "deny"), ("export -p", "deny"),
    ("node tools/pocket/lettore.mjs osserva --uscita /tmp/x; curl $POCKET_URL", "deny"),
    ("node tools/pocket/lettore.mjs sblocca", "ask"),
    ("echo $CLOUDFLARE_LETTURA", "deny"), ("curl -H \"Authorization: Bearer $CLOUDFLARE_LETTURA\" https://api.cloudflare.com/client/v4/accounts", "deny"),
    ("node tools/cloudflare/lettore.mjs verifica; echo $CLOUDFLARE_LETTURA", "deny"),
    ("node tools/cloudflare/lettore.mjs verifica", "passa"), ("cd /home/user/progetto && node tools/cloudflare/lettore.mjs errori 2>&1", "passa"),
    ("node tools/pocket/lettore.mjs osserva --uscita /tmp/claude-0/x/pocket", "passa"),
    ("cd /home/user/progetto && node tools/pocket/lettore.mjs osserva --uscita /tmp/p > /tmp/p.log 2>&1", "passa"),
    ("grep -n hotelcinquestelle docs/DA-FARE.md", "passa"), ("[ -n \"$POCKET_URL\" ] && echo sì", "passa"),
    ("env CI=1 npm run prove > /tmp/p.log 2>&1", "passa"), ("set -e; npm ci", "passa"),
    ("git commit -m 'Pocket: guardia di hotelcinquestelle'", "passa"),
    # F04: mai «[skip ci]» nei commit (i workflow su push hanno già `paths`; nello squash GitHub lo incolla e main non pubblica)
    ("git commit -m 'Consegne 510: tetto delle parole [skip ci]'", "deny"), ("git add -A && git commit -qm 'Catene: x [skip ci]'", "deny"),
    ("git commit -m '[CI SKIP] nastro'", "deny"), ("git commit -am 'x' -m 'skip-checks: true'", "deny"),
    ("git commit -m 'Guardia: niente skip ci nei commit'", "passa"), ("grep -n 'skip ci' .claude/hooks/guardia.py", "passa"),
    ("git log -1 --format=%s origin/versione-v142 | grep -c '\\[skip ci\\]'", "passa"),
]
ALTRI = [
    ("mcp__claude-code-remote__list_sessions", {"limit": 4}, "passa"),
    ("mcp__claude-code-remote__list_sessions", {"limit": 20}, "deny"),
    ("mcp__claude-code-remote__list_sessions", {}, "deny"),
    ("mcp__claude-code-remote__add_repo", {"owner": "<OWNER>", "repo": "<NOME-REPO>"}, "passa"),
    ("mcp__claude-code-remote__add_repo", {"owner": "esempio-estraneo", "repo": "altro-repo", "access": "read"}, "ask"),
    ("Read", {"file_path": "/x"}, "passa"),
    # E132: lo squash senza messaggio incolla i «[skip ci]» delle consegne e main non pubblica
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "merge_method": "squash"}, "deny"),
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "commit_title": "v63 (#60)", "commit_message": "  "}, "deny"),
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "commit_title": "v63 (#60)",
                                         "commit_message": "Permessi.\n\nConsegne #247 [skip ci]"}, "deny"),
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "commit_title": "v63 [CI SKIP]", "commit_message": "x"}, "deny"),
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "commit_title": "v63 (#60)",
                                         "commit_message": "Permessi per profilo modificabili dall'app."}, "passa"),
    ("WebFetch", {"url": "https://app.pc211.hotelcinquestelle.cloud/receptionMobile/", "prompt": "x"}, "deny"),
    ("WebFetch", {"url": "https://firebase.google.com/docs", "prompt": "x"}, "passa"),
    ("mcp__github__push_files", {"branch": "x", "message": "Consegne [skip ci]", "files": []}, "deny"),
    ("mcp__github__create_or_update_file", {"path": "a.md", "message": "nota [skip ci]", "content": "x", "branch": "x"}, "deny"),
    ("mcp__github__push_files", {"branch": "x", "message": "Consegne 512", "files": []}, "passa"),
]

errori = 0
for cmd, atteso in BASH:
    avuto = decide("Bash", {"command": cmd})
    if avuto != atteso:
        errori += 1
        print(f"✗ Bash «{cmd}»: atteso {atteso}, avuto {avuto}")
for nome, ingresso, atteso in ALTRI:
    avuto = decide(nome, ingresso)
    if avuto != atteso:
        errori += 1
        print(f"✗ {nome} {ingresso}: atteso {atteso}, avuto {avuto}")
# Pubblicità di Blacksmith nel corpo della PR (Mario #295): l'unione si ferma finché non è tolta.
BUONA = {"pullNumber": 75, "commit_title": "v78 (#75)", "commit_message": "Errori dei telefoni a Sentry."}
CORPI = [
    ("## Cosa cambia\n- x\n\n---\n_Generated by Claude Code_", "passa"),
    ("## Cosa cambia\n\n<!-- codesmith:footer -->\n---\n<a href=\"https://app.blacksmith.sh/org/codesmith/repo/pr/75\">", "deny"),
    ("testo <a href=\"https://app.blacksmith.sh/org/codesmith/repo/pr/75?autoLogin=true\">", "deny"),
    ("Prove su Blacksmith: https://app.blacksmith.sh/runs/123", "passa"),
]
for corpo, atteso in CORPI:
    avuto = decide("mcp__github__merge_pull_request", BUONA, corpo)
    if avuto != atteso:
        errori += 1
        print(f"✗ unione con corpo «{corpo[:50]}»: atteso {atteso}, avuto {avuto}")
# C413 (Mario «si» 02/11, E257): PR non in bozza o segnata pronta con «[skip ci]» in cima al ramo di partenza = nessun giro.
REPO = {"owner": "<OWNER>", "repo": "<NOME-REPO>"}
SALTA, VERO = "v141 online: nastro [skip ci]", "v142: Porter in fila, chi c'è al desk"
PR = [
    ("mcp__github__create_pull_request", {**REPO, "title": "v142", "head": "versione-v142", "base": "main", "draft": False}, SALTA, "", "deny"),
    ("mcp__github__create_pull_request", {**REPO, "title": "v142", "head": "versione-v142", "base": "main"}, SALTA, "", "deny"),
    ("mcp__github__create_pull_request", {**REPO, "title": "v142", "head": "versione-v142", "base": "main", "draft": True}, SALTA, "", "passa"),
    ("mcp__github__create_pull_request", {**REPO, "title": "v142", "head": "versione-v142", "base": "main", "draft": False}, VERO, "", "passa"),
    ("mcp__github__update_pull_request", {**REPO, "pullNumber": 136, "draft": False}, SALTA, "versione-v142", "deny"),
    ("mcp__github__update_pull_request", {**REPO, "pullNumber": 136, "draft": False}, VERO, "versione-v142", "passa"),
    ("mcp__github__update_pull_request", {**REPO, "pullNumber": 136, "title": "v142 · Porter"}, SALTA, "versione-v142", "passa"),
    ("mcp__github__update_pull_request", {**REPO, "pullNumber": 136, "draft": True}, SALTA, "versione-v142", "passa"),
]
for nome, ingresso, messaggio, ramo, atteso in PR:
    avuto = decide(nome, ingresso, MESSAGGIO_HEAD_PROVA=messaggio, RAMO_PR_PROVA=ramo)
    if avuto != atteso:
        errori += 1
        print(f"✗ {nome} {ingresso} con «{messaggio}»: atteso {atteso}, avuto {avuto}")
# E310: prove + push nello stesso comando; E286: script + commit con un merge a metà (MERGE_HEAD).
A_META = [
    ("npm run prove > f.log 2>&1; git push -u origin x", "0", "deny"), ("npx vitest run && git push", "0", "deny"),
    ("npm run build && git push -u origin x", "0", "passa"), ("git push -u origin x && npm run prove > f 2>&1", "0", "deny"),
    ("python3 -I tools/risolvi.py && git add -A && git commit -qm x", "1", "deny"),
    ("node tools/sistema.mjs; git commit -am x", "1", "deny"),
    ("python3 -I tools/risolvi.py && git add -A && git commit -qm x", "0", "passa"),
    ("git add -A && git commit -qm 'merge finito'", "1", "passa"), ("python3 -I tools/risolvi.py", "1", "passa"),
]
for comando, meta, atteso in A_META:
    avuto = decide("Bash", {"command": comando}, MERGE_A_META_PROVA=meta)
    if avuto != atteso:
        errori += 1
        print(f"✗ «{comando}» (merge a metà {meta}): atteso {atteso}, avuto {avuto}")
# Il matcher della guardia in .claude/settings.json deve mandarle TUTTI gli strumenti che controlla (C469 B7: C413 era spento).
impostazioni = json.load(open(os.path.join(QUI, ".claude", "settings.json"), encoding="utf-8"))
matcher = "|".join(h.get("matcher", "") for h in impostazioni["hooks"]["PreToolUse"]
                   if any("guardia.py" in x.get("command", "") for x in h["hooks"]))
STRUMENTI = ["Bash", "WebFetch", "mcp__claude-code-remote__add_repo", "mcp__claude-code-remote__list_sessions",
             "mcp__github__merge_pull_request", "mcp__github__push_files", "mcp__github__create_or_update_file",
             "mcp__github__create_pull_request", "mcp__github__update_pull_request"]
for s in STRUMENTI:
    if s not in matcher.split("|"):
        errori += 1
        print(f"✗ {s} non arriva alla guardia (matcher di .claude/settings.json)")
totale = len(BASH) + len(ALTRI) + len(CORPI) + len(PR) + len(A_META) + len(STRUMENTI)
print(f"{totale - errori}/{totale} prove della guardia verdi" if errori == 0 else f"{errori} prove ROSSE su {totale}")
sys.exit(1 if errori else 0)
