#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/promesse.py (C331, E207): Stop con un Da fare finto, --aperte e --controlla.
# Uso: python3 -I tools/test-promesse.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "promesse.py")
ok_n = 0

DA_FARE = """# Da fare

| N. | Cosa | Chi | Urgenza |
|---|---|---|---|
| C312 | 🔴 **Schede dei clienti con tutti i dati** (Mario 29/10). 👁 Lo vedi: Inizio → 👥 Clienti, nomi interi · prova: lettura dei dati veri + foto dal sito | Claude | adesso |
| C200 | 🟠 **Turni più comodi**: piano pronto. | Claude | dopo |

## 1. Claude da solo
"""
FATTE = """# Da fare: voci finite

| N. | Cosa | Chi | Urgenza |
|---|---|---|---|
| C100 | ✅ **Vecchia voce** senza occhio. | Claude | — |
"""


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def progetto(da_fare=DA_FARE, fatte=FATTE):
    p = tempfile.mkdtemp(prefix="promesse-")
    os.makedirs(os.path.join(p, ".git"))
    os.makedirs(os.path.join(p, "docs"))
    for nome, testo in (("DA-FARE.md", da_fare), ("DA-FARE-FATTE.md", fatte)):
        if testo is not None:
            with open(os.path.join(p, "docs", nome), "w", encoding="utf-8") as fh:
                fh.write(testo)
    return p


def lancia(p, *argomenti, entrata=""):
    return subprocess.run([sys.executable, "-I", HOOK, *argomenti], input=entrata, capture_output=True, text=True,
                          env={**os.environ, "CLAUDE_PROJECT_DIR": p}, timeout=20)


def stop(testo, attivo=False, **kw):
    p = progetto(**kw)
    try:
        r = lancia(p, entrata=json.dumps({"last_assistant_message": testo, "stop_hook_active": attivo}))
        return r.returncode, r.stderr
    finally:
        shutil.rmtree(p)


def modo(*argomenti, **kw):
    p = progetto(**kw)
    try:
        r = lancia(p, *argomenti)
        return r.returncode, r.stdout
    finally:
        shutil.rmtree(p)


# Promesse vere senza voce con 👁 → blocco
for frase in ("Caricherò l'inventario attuale della biancheria.", "Te lo mando appena finisce il giro.",
              "La fattura entra nella v100.", "Domani vedrai il riquadro nuovo.",
              "I riquadri diventano uguali appena finisce la prova.", "Stasera pubblico la versione."):
    rc, err = stop("✅ FATTO\n" + frase)
    controlla(rc == 2 and "DA-FARE.md" in err and "👁" in err, "promessa bloccata: " + frase, err)

# Secondo giro, niente Da fare → passa
controlla(stop("Caricherò l'inventario.", attivo=True)[0] == 0, "stop_hook_active")
controlla(stop("Caricherò l'inventario.", da_fare=None)[0] == 0, "progetto senza Da fare")

# Non sono promesse, o parlano di una voce con 👁 → passa
for nome, testo in (
        ("passato", "Ho caricato l'inventario e messo i nomi."),
        ("negata", "Non lo metto nella v100, aspetta la tua risposta."),
        ("legata alla risposta", "Se dici sì lo metto nella prossima."),
        ("domanda", "Lo metto anche nella pagina Clienti?"),
        ("citazione", "Avevo scritto «i nomi diventano interi appena finisce il giro» e non era vero."),
        ("codice", "```\nlo carico domani\n```\nFatto."),
        ("blocco domande", "❓ DOMANDE\n📌 Di cosa parliamo: lo sblocco.\n1 · lo metto solo a Riccardo\n───\nok"),
        ("passi di Mario", "👉 DA FARE TU\n1. Tocca **Salva**: vedrai comparire la riga verde.\n───"),
        ("voce con 👁", "I nomi interi dei clienti arrivano verso le 07:00."),
        ("voce con 👁, titolo", "Le schede dei clienti saranno pronte stasera.")):
    rc, err = stop(testo)
    controlla(rc == 0, "non bloccata: " + nome, err)

# Una voce senza 👁 non basta: «turni più comodi» promessi → blocco
controlla(stop("I turni più comodi entrano nella v101.")[0] == 2, "voce senza 👁 non conta")

# La stessa frase blocca una volta sola (stesso progetto)
p = progetto()
try:
    entrata = json.dumps({"last_assistant_message": "Caricherò la bolla di ieri."})
    primo, secondo = lancia(p, entrata=entrata).returncode, lancia(p, entrata=entrata).returncode
    controlla(primo == 2 and secondo == 0, "frase già vista", f"{primo} {secondo}")
finally:
    shutil.rmtree(p)

# --aperte e --controlla
rc, out = modo("--aperte", "--breve")
controlla(rc == 0 and "PROMESSE APERTE a Mario: 1" in out and "C312" in out, "--aperte --breve", out)
# Mario 03/11 «4 consiglio»: le 5 più vecchie e le 5 più nuove, senza doppioni
molte = DA_FARE.replace("| C200 |", "".join(f"| C{n} | 🟠 **Voce {n}**. 👁 Lo vedi: qui · prova: foto | Claude | dopo |\n" for n in range(401, 412)) + "| C200 |")
rc, out = modo("--aperte", "--breve", da_fare=molte)
vecchie, _, nuove = out.partition("Le 5 più nuove:")
controlla(rc == 0 and "C312" in vecchie and "C404" in vecchie and "C405" not in vecchie
          and all(f"C{n}" in nuove for n in range(407, 412)) and "C406" not in nuove and nuove.index("C411") < nuove.index("C407"),
          "--breve con 5 vecchie e 5 nuove", out)
# C469 B5: --lotto N = le N più vecchie, numerate, con le scelte per Mario
rc, out = modo("--lotto", "3", da_fare=molte)
righe = [r for r in out.splitlines() if r[:2] in ("1.", "2.", "3.", "4.")]
controlla(rc == 0 and "le 3 più vecchie di 12" in out and "1 va · 2 non va" in out and len(righe) == 3
          and righe[0].startswith("1. C312") and righe[2].startswith("3. C402"), "--lotto 3", out)
rc, out = modo("--lotto", da_fare=molte)
controlla(rc == 0 and "le 10 più vecchie di 12" in out, "--lotto di base 10", out)
rc, out = modo("--aperte")
controlla("lo vedi: Inizio → 👥 Clienti, nomi interi" in out and "prova: lettura" in out, "--aperte", out)
controlla(modo("--controlla")[0] == 0, "Da fare in ordine")
senza = DA_FARE.replace(" · prova: lettura dei dati veri + foto dal sito", "")
rc, out = modo("--controlla", da_fare=senza)
controlla(rc == 1 and "C312" in out, "👁 senza prova", out)
finita = FATTE + "| C320 | ✅ **Riquadri** 👁 Visto da Mario: 29/10 · è online | Claude | — |\n"
rc, out = modo("--controlla", fatte=finita)
controlla(rc == 1 and "C320" in out, "finita senza la prova vista", out)
finita = FATTE + "| C320 | ✅ **Riquadri** 👁 Visto da Mario: 29/10 · foto archivio/C320/08-sito.png | Claude | — |\n"
controlla(modo("--controlla", fatte=finita)[0] == 0, "finita con la foto")

# Il Da fare vero del progetto è in ordine
r = lancia(os.path.join(QUI, ".."), "--controlla")
controlla(r.returncode == 0, "docs/DA-FARE.md vero", r.stdout)

print(f"test-promesse: {ok_n} controlli ok")
