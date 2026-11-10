#!/usr/bin/env python3
# Prova di .claude/hooks/kit-check.py (C250): versione del kit, import di REGOLE.md, tetti, Preferenze, su un progetto finto.
# Uso: python3 -I tools/test-kit-check.py
import functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading, time

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "kit-check.py")
ok_n = 0


def controlla(cond, nome, uscita=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", uscita)
        sys.exit(1)
    ok_n += 1


def esegui(progetto, *arg, **env_extra):
    env = {k: v for k, v in os.environ.items() if k not in ("KIT_FONTE_TOKEN", "KIT_FONTE_URL")}
    env.update(env_extra, CLAUDE_PROJECT_DIR=progetto)
    r = subprocess.run([sys.executable, "-I", HOOK, *arg], capture_output=True, text=True, env=env, cwd=progetto)
    return r.returncode, r.stdout.strip()


def riga(progetto, **env_extra):
    return esegui(progetto, "testo", **env_extra)[1]


def scrivi(progetto, rel, testo):
    p = os.path.join(progetto, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)


class Muto(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def pref(v, data="23/10/2026"):
    return f"v{v} · {data} · originale: docs/PREFERENZE-CLAUDE.md del kit\n\nCOME PARLARMI\n- v99 · 1/1/2027 qui non conta\n"


def progetto_buono(c):
    scrivi(c, "docs/kit-progetto/VERSIONE", "kit 23.0 · 23/10/2026 · Preferenze v23\n")
    scrivi(c, "docs/kit-progetto/REGOLE.md", "# Regole di lavoro · kit 23.0 · 23/10/2026\n\n- una regola\n")
    scrivi(c, "docs/kit-progetto/PREFERENZE-CHAT.txt", pref(23))
    scrivi(c, "CLAUDE.md", "# Progetto\n@docs/kit-progetto/REGOLE.md\n\nRegole del progetto.\n")
    for rel in ("docs/PREFERENZE-CLAUDE.md", "tools/fai-kit.py"):
        if os.path.exists(os.path.join(c, rel)):
            os.remove(os.path.join(c, rel))


cartella = tempfile.mkdtemp(prefix="kit-check-")
try:
    u = riga(cartella)
    controlla(u.startswith("ATTENZIONE kit: manca docs/kit-progetto/VERSIONE") and "pacchetto" in u, "kit assente: avviso", u)

    scrivi(cartella, ".claude/kit-VERSIONE", "kit 22.2 · 22/10/2026 · Preferenze v22\n")
    controlla("v22 o prima" in riga(cartella), "solo il kit vecchio (.claude/kit-VERSIONE): lo dice", riga(cartella))

    progetto_buono(cartella)
    u = riga(cartella)
    controlla(u.startswith("Kit 23.0 (23/10/2026), Preferenze v23.") and "ATTENZIONE" not in u, "kit allineato: una riga sola", u)
    controlla("PREFERENZE-CHAT.txt" in u and "più nuove" in u, "dice cosa fare in tutti e due i casi", u)
    controlla("fine giornata" in u and "NON adesso" in u, "Preferenze vecchie: a Mario solo a fine giornata", u)

    codice, uscita = esegui(cartella)
    d = json.loads(uscita)
    controlla(codice == 0 and d["hookSpecificOutput"]["hookEventName"] == "SessionStart"
              and d["hookSpecificOutput"]["additionalContext"] == u, "uscita JSON dell'hook SessionStart", uscita)

    # C469 fase 2 (rapporto 14 voce 6): riavvio (segno fresco di avvio-check.py) → muto se il kit è a posto
    os.makedirs(os.path.join(cartella, ".git"), exist_ok=True)
    marca = os.path.join(cartella, ".git", "avvio-riavvio")
    open(marca, "w").close()
    controlla(riga(cartella) == "", "riavvio, kit a posto: muto", riga(cartella))
    os.utime(marca, (time.time() - 3600, time.time() - 3600))
    controlla(riga(cartella) == u, "segno di riavvio vecchio: avviso intero", riga(cartella))
    open(marca, "w").close()
    scrivi(cartella, "docs/kit-progetto/REGOLE.md", "# Regole di lavoro · kit 22.9 · 22/10/2026\n")
    r_ = riga(cartella)
    controlla(r_.startswith("ATTENZIONE kit: REGOLE.md") and "Preferenze v23." not in r_, "riavvio: solo l'ATTENZIONE", r_)
    os.remove(marca)
    progetto_buono(cartella)

    scrivi(cartella, "docs/kit-progetto/REGOLE.md", "# Regole di lavoro · kit 22.2 · 22/10/2026\n")
    u = riga(cartella)
    controlla("ATTENZIONE kit: REGOLE.md è «kit 22.2»" in u, "REGOLE.md di un'altra versione: avviso", u)

    progetto_buono(cartella)
    scrivi(cartella, "CLAUDE.md", "# Progetto\nVedi docs/kit-progetto/REGOLE.md\n")
    u = riga(cartella)
    controlla("non ha la riga «@docs/kit-progetto/REGOLE.md»" in u, "CLAUDE.md senza import: avviso", u)

    progetto_buono(cartella)
    scrivi(cartella, "docs/kit-progetto/PREFERENZE-CHAT.txt", pref(22, "22/10/2026"))
    u = riga(cartella)
    controlla("PREFERENZE-CHAT.txt è v22" in u, "Preferenze della chat vecchie: avviso", u)

    progetto_buono(cartella)
    scrivi(cartella, "docs/PREFERENZE-CLAUDE.md", "# Preferenze\n\n```\n" + pref(22, "22/10/2026") + "```\n")
    u = riga(cartella)
    controlla("docs/PREFERENZE-CLAUDE.md è v22" in u, "testo completo delle Preferenze vecchio: avviso (la riga «- v99» non conta)", u)
    scrivi(cartella, "docs/PREFERENZE-CLAUDE.md", "# Preferenze\n\n```\n" + pref(23) + "```\n")
    controlla("ATTENZIONE" not in riga(cartella), "testo completo allineato: niente avviso", riga(cartella))

    os.remove(os.path.join(cartella, "docs/kit-progetto/PREFERENZE-CHAT.txt"))
    controlla("manca docs/kit-progetto/PREFERENZE-CHAT.txt" in riga(cartella), "manca il testo della chat: avviso")

    progetto_buono(cartella)
    scrivi(cartella, "docs/kit-progetto/REGOLE.md", "# Regole di lavoro · kit 23.0 · 23/10/2026\n" + "- regola\n" * 1500)
    u = riga(cartella)
    controlla("REGOLE.md ha ~" in u and "(tetto 6000)" in u, "REGOLE.md oltre 6.000 token: avviso", u)

    progetto_buono(cartella)
    scrivi(cartella, "CLAUDE.md", "# Progetto\n@docs/kit-progetto/REGOLE.md\n" + "riga\n" * 450)
    u = riga(cartella)
    controlla("CLAUDE.md ha ~" in u and "(tetto 1000)" in u, "CLAUDE.md oltre 1.000 token: avviso", u)

    progetto_buono(cartella)
    scrivi(cartella, "docs/kit-progetto/VERSIONE", "kit 7.1 · 3/9/2026 · Preferenze v7\n")
    scrivi(cartella, "docs/kit-progetto/REGOLE.md", "# Regole di lavoro · kit 7.1 · 3/9/2026\n")
    scrivi(cartella, "docs/kit-progetto/PREFERENZE-CHAT.txt", pref(7, "3/9/2026"))
    controlla(riga(cartella).startswith("Kit 7.1 (03/09/2026), Preferenze v7."), "giorno e mese a una cifra", riga(cartella))

    progetto_buono(cartella)
    scrivi(cartella, "docs/kit-progetto/VERSIONE", "kit ventitré\n")
    controlla("VERSIONE illeggibile" in riga(cartella), "VERSIONE illeggibile: avviso", riga(cartella))

    progetto_buono(cartella)
    scrivi(cartella, "tools/fai-kit.py", "import sys\nprint('Kit indietro rispetto alla fonte, rigeneralo')\nsys.exit(1)\n")
    u = riga(cartella)
    controlla("ATTENZIONE kit: Kit indietro rispetto alla fonte" in u, "repo fonte con kit indietro: avviso", u)
    scrivi(cartella, "tools/fai-kit.py", "print('OK: kit allineato')\n")
    controlla("ATTENZIONE" not in riga(cartella), "repo fonte con kit allineato: niente avviso", riga(cartella))

    # C259: un altro progetto guarda il kit nella fonte (qui una fonte finta, server locale) con tools/scarica-kit.py.
    # Nei progetti indipendenti scarica-kit.py non c'è: si salta.
    if os.path.exists(os.path.join(QUI, "scarica-kit.py")):
        fonte = tempfile.mkdtemp(prefix="fonte-finta-")
        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Muto, directory=fonte))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}"
        progetto_buono(cartella)
        scrivi(fonte, "docs/kit-progetto/VERSIONE", "kit 24.1 · 24/10/2026 · Preferenze v24\n")
        controlla("KIT NUOVO" not in riga(cartella, KIT_FONTE_URL=url), "senza scarica-kit.py: niente controllo", riga(cartella, KIT_FONTE_URL=url))
        shutil.copy(os.path.join(QUI, "scarica-kit.py"), os.path.join(cartella, "tools", "scarica-kit.py"))
        controlla("KIT NUOVO" not in riga(cartella) and "Kit della fonte" not in riga(cartella), "senza chiave: zitto", riga(cartella))
        u = riga(cartella, KIT_FONTE_URL=url, KIT_FONTE_TOKEN="segreto")
        controlla("KIT NUOVO nella fonte del kit: «kit 24.1 · 24/10/2026 · Preferenze v24» (qui kit 23.0)" in u and "scarica-kit.py --cartella" in u
                  and "segreto" not in u, "kit più nuovo nella fonte: avviso con i passi, chiave mai a schermo", u)
        scrivi(fonte, "docs/kit-progetto/VERSIONE", "kit 23.0 · 23/10/2026 · Preferenze v23\n")
        controlla("KIT NUOVO" not in riga(cartella, KIT_FONTE_URL=url), "stesso kit: niente avviso", riga(cartella, KIT_FONTE_URL=url))
        scrivi(fonte, "docs/kit-progetto/VERSIONE", "kit 22.9 · 22/10/2026 · Preferenze v22\n")
        controlla("KIT NUOVO" not in riga(cartella, KIT_FONTE_URL=url), "kit più vecchio nella fonte: niente avviso", riga(cartella, KIT_FONTE_URL=url))
        server.shutdown()
        server.server_close()
        u = riga(cartella, KIT_FONTE_URL=url)
        controlla("Kit della fonte: " in u and "non raggiungibile" in u and "ATTENZIONE" not in u, "fonte spenta: una riga, nessun blocco", u)
        scrivi(cartella, "tools/fai-kit.py", "print('OK: kit allineato')\n")
        controlla("Kit della fonte" not in riga(cartella, KIT_FONTE_URL=url), "nel repo fonte non si guarda la fonte", riga(cartella, KIT_FONTE_URL=url))
        shutil.rmtree(fonte)
finally:
    shutil.rmtree(cartella)

print(f"OK: {ok_n} controlli della versione del kit passati")
