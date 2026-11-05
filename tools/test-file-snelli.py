#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/file-snelli.py (avviso per file di lavoro e voci troppo lunghi), su un progetto finto.
# Uso: python3 -I tools/test-file-snelli.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "file-snelli.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def hook(progetto, memoria):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto, FILE_SNELLI_TMP=memoria)
    r = subprocess.run([sys.executable, "-I", HOOK], input=json.dumps({"tool_name": "Bash", "tool_input": {}}),
                       capture_output=True, text=True, env=env, cwd=progetto)
    controlla(r.returncode == 0, "mai blocca (uscita 0)")
    if not r.stdout.strip():
        return ""
    dati = json.loads(r.stdout)
    controlla(dati["hookSpecificOutput"]["hookEventName"] == "PostToolUse", "avviso nel formato PostToolUse")
    return dati["hookSpecificOutput"]["additionalContext"]


def scrivi(progetto, relativo, testo):
    p = os.path.join(progetto, relativo)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)


base = tempfile.mkdtemp()
try:
    prog = os.path.join(base, "progetto")
    mem = os.path.join(base, "memoria")
    os.makedirs(mem)
    scrivi(prog, ".claude/file-snelli.txt", "# prova\ndocs/DA-FARE.md 2 100\ndocs/ERRORI.md 50 80\n")
    corta = "| C1 | breve | Claude | 🟠 |\n"
    lunga = "| C2 | " + "x" * 150 + " | Claude | 🟠 |\n"
    scrivi(prog, "docs/DA-FARE.md", "# Da fare\n" + corta + lunga + "y" * 2100)
    scrivi(prog, "docs/ERRORI.md", "- **E1** breve\n")

    # 1. Primo sguardo (contenitore nuovo): prende le misure, zitto, anche se il file è già oltre il tetto.
    controlla(hook(prog, mem) == "", "primo sguardo zitto")
    controlla(hook(prog, mem) == "", "niente cambiato: zitto")

    # 2. File oltre il tetto che cresce: avviso col nome del file.
    with open(os.path.join(prog, "docs/DA-FARE.md"), "a", encoding="utf-8") as f:
        f.write("z" * 50)
    a = hook(prog, mem)
    controlla("docs/DA-FARE.md" in a and "tetto 2 KB" in a, "file oltre il tetto e cresciuto: avviso")
    controlla("C2 (" not in a, "voce lunga ma uguale: non citata")
    controlla(hook(prog, mem) == "", "subito dopo, niente cambiato: zitto")

    # 3. File che si accorcia: zitto (sta migliorando).
    scrivi(prog, "docs/DA-FARE.md", "# Da fare\n" + corta + lunga + "y" * 2000)
    controlla(hook(prog, mem) == "", "file che si accorcia: zitto")

    # 4. Voce lunga nuova (file sotto il tetto): avviso con il codice della voce.
    scrivi(prog, "docs/DA-FARE.md", "# Da fare\n" + corta + lunga + "| C3 | " + "w" * 120 + " |\n")
    a = hook(prog, mem)
    controlla("C3 (" in a and "tetto" not in a, "voce nuova lunga: avviso solo per la voce")
    # 5. Voce lunga che cresce: avviso; la voce corta che resta corta non conta.
    scrivi(prog, "docs/DA-FARE.md", "# Da fare\n" + corta.replace("breve", "breve ma") + "| C2 | " + "x" * 170 + " |\n" + "| C3 | " + "w" * 120 + " |\n")
    a = hook(prog, mem)
    controlla("C2 (" in a and "C3 (" not in a and "C1 (" not in a, "voce cresciuta: avviso solo per lei")

    # 6. Lezioni del diario «- **E12** …» con il loro tetto di riga.
    scrivi(prog, "docs/ERRORI.md", "- **E1** breve\n- **E2** " + "v" * 90 + "\n")
    a = hook(prog, mem)
    controlla("docs/ERRORI.md" in a and "E2 (" in a, "lezione lunga nuova: avviso")

    # 7. File che manca: nessun errore, zitto.
    os.remove(os.path.join(prog, "docs/ERRORI.md"))
    controlla(hook(prog, mem) == "", "file mancante: zitto")

    # 8. Senza .claude/file-snelli.txt valgono i file di base (DA-FARE.md, tetto 40 KB): un file piccolo non avvisa.
    os.remove(os.path.join(prog, ".claude/file-snelli.txt"))
    mem2 = os.path.join(base, "memoria2")
    os.makedirs(mem2)
    hook(prog, mem2)
    with open(os.path.join(prog, "docs/DA-FARE.md"), "a", encoding="utf-8") as f:
        f.write("| C9 | corta |\n")
    controlla(hook(prog, mem2) == "", "elenco di base: file piccolo con voci corte, zitto")
finally:
    shutil.rmtree(base, ignore_errors=True)

print(f"OK: {ok_n} controlli verdi (file-snelli)")
