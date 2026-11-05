#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/controlla-js.py (node --check dopo Edit/Write), su un progetto finto in una cartella temporanea.
# Uso: python3 -I tools/test-controlla-js.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "controlla-js.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def hook(progetto, percorso, strumento="Edit"):
    entrata = json.dumps({"tool_name": strumento, "tool_input": {"file_path": percorso}})
    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto)
    r = subprocess.run([sys.executable, "-I", HOOK], input=entrata, capture_output=True, text=True, env=env, cwd=progetto)
    return r.returncode, r.stderr


def scrivi(progetto, relativo, testo):
    p = os.path.join(progetto, relativo)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)
    return p


cartella = tempfile.mkdtemp(prefix="controlla-js-")
try:
    # Come il repo vero: "type": "module" alla radice (senza, node --check non vede gli errori dei moduli).
    scrivi(cartella, "package.json", '{ "type": "module" }\n')
    buono = "import { a } from './b.js';\nexport const c = a + 1;\n"
    rotto = "export const a = ;\n"

    codice, err = hook(cartella, scrivi(cartella, "app/src/ui/buono.js", buono))
    controlla(codice == 0 and err == "", "app: file giusto = silenzio")

    codice, err = hook(cartella, scrivi(cartella, "app/src/ui/rotto.js", rotto))
    controlla(codice == 2 and "app/src/ui/rotto.js" in err and "SyntaxError" in err, "app: errore di sintassi = uscita 2 col messaggio")

    codice, err = hook(cartella, scrivi(cartella, "worker/src/rotto.js", rotto))
    controlla(codice == 2 and "worker/src/rotto.js" in err, "worker: errore di sintassi = uscita 2")

    codice, err = hook(cartella, "app/src/ui/rotto.js")
    controlla(codice == 2, "percorso relativo al progetto")

    codice, err = hook(cartella, scrivi(cartella, "tools/rotto.mjs", rotto))
    controlla(codice == 2, "senza zone-codice.txt (kit): tutto il progetto, anche .mjs")

    codice, err = hook(cartella, scrivi(cartella, "docs/rotto.js", rotto))
    controlla(codice == 0, "senza zone-codice.txt: docs/ non si controlla")

    scrivi(cartella, ".claude/zone-codice.txt", "# zone di esempio\napp/\nworker/\ntests/\n")
    codice, err = hook(cartella, scrivi(cartella, "tests/rotto.js", rotto))
    controlla(codice == 2 and "tests/rotto.js" in err, "zona tests/ di zone-codice.txt: si controlla")

    codice, err = hook(cartella, "tools/rotto.mjs")
    controlla(codice == 0, "fuori dalle zone di zone-codice.txt: non si controlla")

    codice, err = hook(cartella, scrivi(cartella, "app/dist/assets/rotto.js", rotto))
    controlla(codice == 0, "app/dist: non si controlla")

    codice, err = hook(cartella, scrivi(cartella, "app/node_modules/x/rotto.js", rotto))
    controlla(codice == 0, "node_modules: non si controlla")

    codice, err = hook(cartella, scrivi(cartella, "app/src/stile.css", "a { color: ; }\n"))
    controlla(codice == 0, "file non .js: non si controlla")

    codice, err = hook(cartella, os.path.join(cartella, "app/src/ui/non-esiste.js"))
    controlla(codice == 0, "file che non esiste: silenzio")

    fuori = tempfile.mkdtemp(prefix="controlla-js-fuori-")
    try:
        codice, err = hook(cartella, scrivi(fuori, "app/rotto.js", rotto))
        controlla(codice == 0, "file fuori dal progetto: non si controlla")
    finally:
        shutil.rmtree(fuori)

    # ESLint (#296): solo se il progetto ha eslint e eslint.config.js; senza, il nome sbagliato passa (come prima).
    sbagliato = "export const c = nonDefinito + 1;\n"
    codice, err = hook(cartella, scrivi(cartella, "app/src/ui/nome.js", sbagliato))
    controlla(codice == 0, "senza ESLint: solo la sintassi")
    moduli = os.path.join(QUI, "..", "node_modules")
    if os.path.isfile(os.path.join(moduli, ".bin", "eslint")):
        os.symlink(os.path.realpath(moduli), os.path.join(cartella, "node_modules"))
        scrivi(cartella, "eslint.config.js", "export default [{ files: ['**/*.js'], rules: { 'no-undef': 'error' } }];\n")
        codice, err = hook(cartella, "app/src/ui/nome.js")
        controlla(codice == 2 and "nonDefinito" in err and "app/src/ui/nome.js" in err, "ESLint: nome non definito = uscita 2 col messaggio")
        codice, err = hook(cartella, "app/src/ui/buono.js")
        controlla(codice == 0 and err == "", "ESLint: file giusto = silenzio")
        scrivi(cartella, "eslint.config.js", "export default [ rotto\n")
        codice, err = hook(cartella, "app/src/ui/nome.js")
        controlla(codice == 0, "ESLint con la configurazione rotta: non blocca")
    else:
        print("(ESLint non installato: controlli di ESLint saltati; npm ci)")

    env = dict(os.environ, CLAUDE_PROJECT_DIR=cartella)
    r = subprocess.run([sys.executable, "-I", HOOK], input="non è json", capture_output=True, text=True, env=env)
    controlla(r.returncode == 0, "entrata rotta: silenzio")
finally:
    shutil.rmtree(cartella)

print(f"OK: {ok_n} controlli dell'hook controlla-js passati")
