#!/usr/bin/env python3
"""Versione del kit di regole (C250, Mario 23/10: «hook SessionStart che controlla la versione del kit»).

SessionStart (startup|resume), zero token. Legge docs/kit-progetto/VERSIONE («kit N.M · gg/mm/aaaa · Preferenze vN») e
controlla che coincida con la testata di docs/kit-progetto/REGOLE.md («kit N.M») e con la riga «vN · gg/mm/aaaa» in
testa a docs/kit-progetto/PREFERENZE-CHAT.txt e a docs/PREFERENZE-CLAUDE.md (se c'è). Avvisa anche se CLAUDE.md non
importa REGOLE.md (le regole del kit non arriverebbero a Claude) e se i tetti sono superati (CLAUDE.md ~1.000 token,
REGOLE.md ~6.000, stimati dai caratteri). Nel repo fonte del kit (c'è tools/fai-kit.py) lancia anche `fai-kit.py --controlla`;
negli altri, con la chiave KIT_FONTE_TOKEN, `tools/scarica-kit.py --versione`: kit più nuovo nella fonte → «KIT NUOVO» (C259).
Poi dice a Claude di confrontare la versione con la riga «v…» in testa alle Preferenze ricevute da claude.ai.
Prende il posto della riga «Preferenze del kit» di avvio-check.py. Non blocca mai (uscita 0).
Prova: python3 -I tools/test-kit-check.py
"""
import json
import os
import re
import subprocess
import sys
import time

KIT = "docs/kit-progetto"
IMPORTA = "@docs/kit-progetto/REGOLE.md"
TETTI = (("CLAUDE.md", 1000), (KIT + "/REGOLE.md", 6000))  # token, tetti di Mario (23/10)
CARATTERI_PER_TOKEN = 2.1  # stima tarata su /context vero (23/10), come tools/fai-kit.py
PREFERENZE = (KIT + "/PREFERENZE-CHAT.txt", "docs/PREFERENZE-CLAUDE.md")
RE_VERSIONE = re.compile(r"kit (\d+)\.(\d+) · (\d{1,2})/(\d{1,2})/(\d{4}) · Preferenze v(\d+)")
RE_REGOLE = re.compile(r"kit (\d+\.\d+)")
RE_PREF = re.compile(r"^v(\d+) · \d{1,2}/\d{1,2}/\d{4}", re.M)


def leggi(base, rel):
    try:
        with open(os.path.join(base, rel), encoding="utf-8") as f:
            return f.read()
    except OSError:
        return None


def controlla_fonte(base):
    # Solo nel repo fonte del kit: il kit è allineato alle regole del progetto?
    script = os.path.join(base, "tools", "fai-kit.py")
    if not os.path.exists(script):
        return ""
    try:
        r = subprocess.run([sys.executable, "-I", script, "--controlla"], capture_output=True, text=True, timeout=20, cwd=base)
    except Exception:
        return ""
    if r.returncode == 0:
        return ""
    prima = (r.stdout or r.stderr).strip().splitlines()
    return "ATTENZIONE kit: " + (prima[0] if prima else "fai-kit.py --controlla fallito") + " (python3 -I tools/fai-kit.py)."


def controlla_rvc(base, qui):
    # Progetti che non sono la fonte (C259): nel repo fonte c'è un kit più nuovo? Serve la chiave KIT_FONTE_TOKEN; senza, niente.
    script = os.path.join(base, "tools", "scarica-kit.py")
    if (os.path.exists(os.path.join(base, "tools", "fai-kit.py")) or not os.path.exists(script)
            or not (os.environ.get("KIT_FONTE_TOKEN") or os.environ.get("KIT_FONTE_URL"))):
        return ""
    try:
        r = subprocess.run([sys.executable, "-I", script, "--versione"], capture_output=True, text=True, timeout=20, cwd=base)
    except Exception:
        return "Kit della fonte: non raggiungibile (tempo scaduto), riprova al prossimo avvio."
    if r.returncode != 0:
        return "Kit della fonte: " + ((r.stdout or r.stderr).strip().splitlines() or ["scarica-kit.py fallito"])[0]
    m = RE_VERSIONE.search(r.stdout)
    if not m or (int(m.group(1)), int(m.group(2))) <= qui:
        return ""
    return (f"KIT NUOVO nella fonte del kit: «{m.group(0)}» (qui kit {qui[0]}.{qui[1]}). Prima del lavoro nuovo: "
            "python3 -I tools/scarica-kit.py --cartella <scratchpad>/kit-nuovo (con --indipendente se il progetto lo è), "
            "poi la parte 1 del pacchetto: una domanda a Mario per l'ok, file uno per uno con Write, e il testo dell'ok "
            "che nomina i file di .claude/ pronto da copiare.")


def controlla(base):
    versione = leggi(base, KIT + "/VERSIONE")
    if versione is None:
        vecchio = " (c'è solo .claude/kit-VERSIONE: kit v22 o prima)" if leggi(base, ".claude/kit-VERSIONE") else ""
        return (f"ATTENZIONE kit: manca {KIT}/VERSIONE{vecchio}. Le regole del kit (REGOLE.md) non sono installate: "
                "dillo a Mario in una riga e chiedi il pacchetto del kit.")
    m = RE_VERSIONE.search(versione)
    if not m:
        return f"ATTENZIONE kit: {KIT}/VERSIONE illeggibile («{versione.strip()[:60]}»): serve «kit N.M · gg/mm/aaaa · Preferenze vN»."
    kit, pref = f"{m.group(1)}.{m.group(2)}", m.group(6)
    data = f"{int(m.group(3)):02d}/{int(m.group(4)):02d}/{m.group(5)}"
    avvisi = []
    regole = leggi(base, KIT + "/REGOLE.md")
    if regole is None:
        avvisi.append(f"ATTENZIONE kit: manca {KIT}/REGOLE.md: le regole di lavoro non sono caricate.")
    else:
        r = RE_REGOLE.search(regole.split("\n", 1)[0])
        if not r or r.group(1) != kit:
            avvisi.append(f"ATTENZIONE kit: REGOLE.md è «{r.group(0) if r else 'senza versione'}», VERSIONE dice kit {kit}: riallinea.")
    claude = leggi(base, "CLAUDE.md")
    if claude is not None and IMPORTA not in (riga.strip() for riga in claude.splitlines()):
        avvisi.append(f"ATTENZIONE kit: CLAUDE.md non ha la riga «{IMPORTA}»: le regole del kit non arrivano a Claude. Aggiungila.")
    for rel in PREFERENZE:
        testo = leggi(base, rel)
        if testo is None:
            if rel.startswith(KIT):
                avvisi.append(f"ATTENZIONE kit: manca {rel} (testo delle Preferenze per la chat).")
            continue
        p = RE_PREF.search(testo)
        if not p or p.group(1) != pref:
            avvisi.append(f"ATTENZIONE kit: {rel} è {'v' + p.group(1) if p else 'senza riga «vNN · gg/mm/aaaa»'}, "
                          f"VERSIONE dice Preferenze v{pref}: riallinea.")
    for rel, tetto in TETTI:
        testo = leggi(base, rel)
        if testo is not None and round(len(testo) / CARATTERI_PER_TOKEN) > tetto:
            avvisi.append(f"ATTENZIONE kit: {rel} ha ~{round(len(testo) / CARATTERI_PER_TOKEN)} token stimati (tetto {tetto}): "
                          "sposta una procedura in una skill o accorcia (skill nuova-regola).")
    avvisi.append(controlla_fonte(base))
    avvisi.append(controlla_rvc(base, (int(m.group(1)), int(m.group(2)))))
    avvisi.append(f"Kit {kit} ({data}), Preferenze v{pref}. Confrontala con la riga «v…» delle Preferenze di claude.ai: più "
                  f"vecchie o senza riga → NON adesso, a fine giornata il testo di {KIT}/PREFERENZE-CHAT.txt a Mario (skill "
                  "nuova-regola §5); più nuove → aggiorna il kit e dillo in una riga.")
    return " ".join(a for a in avvisi if a)


def per_riavvio(base, testo, vecchio=300):
    """C469 fase 2 (rapporto 14 voce 6): al riavvio del contenitore (segno fresco di avvio-check.py) solo gli avvisi veri
    (ATTENZIONE, KIT NUOVO); la frase fissa sulla versione e le Preferenze è già nel primo avvio."""
    try:
        if time.time() - os.path.getmtime(os.path.join(base, ".git", "avvio-riavvio")) > vecchio:
            return testo
    except OSError:
        return testo
    return " ".join(p for p in re.split(r"(?<=\.)\s+(?=ATTENZIONE kit:|KIT NUOVO|Kit \d)", testo)
                    if p.startswith(("ATTENZIONE", "KIT NUOVO")))


def aspetta_avvio(base, attesa=25, vecchio=120):
    # C352: avvio-check.py (stesso evento, in parallelo) fa fetch e merge; finché c'è il suo segno i file sono quelli
    # di prima del merge. Un segno più vecchio di 2 minuti è di un hook fermato: non si aspetta.
    segno = os.path.join(base, ".git", "avvio-in-corso")
    fine = time.time() + attesa
    while time.time() < fine:
        try:
            if time.time() - os.path.getmtime(segno) > vecchio:
                return
        except OSError:
            return
        time.sleep(0.5)


if __name__ == "__main__":
    base = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    if sys.argv[1:] != ["testo"]:
        time.sleep(0.3)  # avvio-check.py crea il segno appena parte
        aspetta_avvio(base)
    try:
        testo = per_riavvio(base, controlla(base))
    except Exception as e:  # un errore della prova non deve mai fermare l'avvio
        testo = f"ATTENZIONE kit: kit-check.py non è riuscito a leggere i file ({type(e).__name__})."
    if sys.argv[1:] == ["testo"]:  # solo per la prova tools/test-kit-check.py
        print(testo)
        sys.exit(0)
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": testo}}, ensure_ascii=False))
    sys.exit(0)
