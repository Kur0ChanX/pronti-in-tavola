#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/lingua-check.py (E139): messaggi a Mario solo in italiano.
# Uso: python3 -I tools/test-lingua-check.py
import json, os, subprocess, sys

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "lingua-check.py")
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def stop(messaggio, attivo=False, grezzo=None):
    dati = grezzo if grezzo is not None else json.dumps({"session_id": "prova", "stop_hook_active": attivo,
                                                         "last_assistant_message": messaggio})
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30)
    return r.returncode, r.stderr


def blocca(messaggio, nome):
    c, err = stop(messaggio)
    controlla(c == 2 and "E139" in err and "italiano" in err, nome, f"{c} {err}")


def passa(messaggio, nome):
    c, err = stop(messaggio)
    controlla(c == 0 and err == "", nome, f"{c} {err}")


# 1. I due messaggi veri dell'errore E139
blocca("Environment ready for tests: packages installed, Firestore emulator jar downloading.\n\n"
       "1. Can a profile have more functions than its base? 1 · Only less · 2 · More too. Advice: 1.", "E139 primo messaggio")
blocca("Test environment ready and the v66 patch still applies to the branch. I can't arm automatic reminders "
       "(session at chain depth 8/8): I'll resume when the #253 writes that v65 is merged, or when you write.",
       "E139 secondo messaggio")

# 2. Inglese corto
blocca("Waiting for v65.", "riga di stato corta in inglese")
blocca("I'll resume when you write.", "forme contratte (I'll)")
blocca("Done. Tests are green.", "resoconto corto in inglese")

# 3. Italiano: passa
passa("✅ FATTO\n- P9 avviata. Motore e impegno uguali alla P8.\n- La v65 (PR 62) è pronta e aspetta le prove su GitHub.\n\n"
      "❓ DOMANDE\n1. Un profilo può avere più funzioni della sua base? 1 · Solo meno · 2 · Anche di più. Consiglio: 1.",
      "resoconto in italiano")
passa("Sto scrivendo l'hook della lingua.", "riga di stato in italiano (con elisione)")
passa("Fatto.", "una parola")
passa("Ok", "due lettere")
passa("Ho capito: c'è un problema nell'app, l'ho visto dopo il giro.", "elisioni c'è, nell', l'ho")
passa("Ripresa: PR ready, check passed, merge fatto.", "termini tecnici inglesi in una riga italiana")

# 4. Codice, citazioni, percorsi e indirizzi non contano
passa("Il comando dice:\n```\nError: the request is not valid for this user and will be retried\n```\nLo correggo io.",
      "inglese dentro un riquadro di codice")
passa("La prova scrive `expected the value to be true but it was false`: la sistemo.", "inglese nel codice in linea")
passa("GitHub risponde «the check is still running and will finish soon»: aspetto.", "citazione «…» in inglese")
passa("Guarda https://the-site.example.com/this/is/a/path e app/src/the/and/will.js, poi dimmi.", "indirizzi e percorsi")
passa("Il server risponde: the request is invalid. Riprovo fra poco e ti scrivo cosa ho trovato.",
      "una frase inglese in un messaggio italiano")

# 5. Casi in cui l'hook tace
c, err = stop("Waiting for v65.", attivo=True)
controlla(c == 0 and err == "", "secondo giro: passa (niente giri infiniti)", err)
c, err = stop("")
controlla(c == 0, "messaggio vuoto", err)
c, err = stop(None, grezzo=json.dumps({"session_id": "prova"}))
controlla(c == 0, "senza messaggio finale", err)
c, err = stop(None, grezzo="non è json")
controlla(c == 0, "entrata illeggibile", err)
c, err = stop(None, grezzo=json.dumps({"last_assistant_message": ["lista"]}))
controlla(c == 0, "messaggio non testo", err)

print(f"OK {ok_n}/{ok_n}: lingua-check")
