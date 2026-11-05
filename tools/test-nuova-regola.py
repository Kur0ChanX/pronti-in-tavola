#!/usr/bin/env python3
# Prova degli strumenti della skill nuova-regola: tools/cerca-regola.py (controllo conflitti) e
# tools/pulizia-kit.py (file orfani, doppi o citati solo dalla storia), su un progetto finto.
# Uso: python3 -I tools/test-nuova-regola.py
import os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
ok_n = 0


def controlla(cond, nome, uscita=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", uscita)
        sys.exit(1)
    ok_n += 1


def esegui(progetto, script, *arg):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto)
    r = subprocess.run([sys.executable, "-I", os.path.join(QUI, script), *arg], capture_output=True, text=True, env=env, cwd=progetto)
    return r.returncode, r.stdout + r.stderr


def scrivi(progetto, rel, testo):
    p = os.path.join(progetto, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)


with tempfile.TemporaryDirectory() as c:
    # cerca-regola: trova la riga giusta, taglia le righe lunghe, salta i posti che non sono regole
    scrivi(c, "CLAUDE.md", "# Progetto\n@docs/kit-progetto/REGOLE.md\n")
    scrivi(c, "docs/kit-progetto/REGOLE.md", "# Regole\n- Domande: una per volta, con scelte numerate.\n" + "x" * 500 + " domande in fondo\n")
    scrivi(c, ".claude/skills/foto/SKILL.md", "---\nname: foto\n---\nFoto alte al massimo 1100 px.\n")
    scrivi(c, "app/codice.js", "// domande qui non contano\n")
    rc, u = esegui(c, "cerca-regola.py", "domand")
    controlla(rc == 0, "cerca-regola esce pulito", u)
    controlla("docs/kit-progetto/REGOLE.md:2: - Domande: una per volta" in u, "trova la riga con file e numero", u)
    controlla("docs/kit-progetto/REGOLE.md:3: …" in u and "x" * 200 not in u, "riga lunghissima tagliata", u)
    controlla("app/codice.js" not in u, "il codice dell'app non è un posto delle regole", u)
    rc, u = esegui(c, "cerca-regola.py", "1100", "PX")
    controlla(".claude/skills/foto/SKILL.md:4:" in u, "cerca anche nelle skill, senza maiuscole", u)
    rc, u = esegui(c, "cerca-regola.py", "astronave")
    controlla("la regola è nuova" in u, "nessuna riga: dice che la regola è nuova", u)
    rc, u = esegui(c, "cerca-regola.py")
    controlla(rc != 0 and "Uso:" in u, "senza parole spiega l'uso", u)
    scrivi(c, ".claude/rules/tanti.md", "".join(f"regola tanti {i}\n" for i in range(60)))
    rc, u = esegui(c, "cerca-regola.py", "tanti")
    controlla("altre 20 righe" in u, "al massimo 40 righe", u)

with tempfile.TemporaryDirectory() as c:
    # pulizia-kit: orfani, solo storia e doppi; mai le skill, le copie del kit o il pacchetto generato
    scrivi(c, "CLAUDE.md", "Leggi docs/USATO.md, docs/DOPPIO-A.md, docs/DOPPIO-B.md, docs/G.md e .claude/hooks/attivo.py.\n")
    scrivi(c, "docs/USATO.md", "usato\n")
    scrivi(c, "docs/ORFANO.md", "nessuno mi cita, solo io: docs/ORFANO.md\n")
    scrivi(c, "docs/VECCHIO.md", "vecchio\n")
    scrivi(c, "docs/ERRORI-STORIA.md", "- E1 vedi docs/VECCHIO.md\n")
    scrivi(c, "docs/DOPPIO-A.md", "stesso testo\n")
    scrivi(c, "docs/DOPPIO-B.md", "stesso testo\n")
    scrivi(c, "docs/G.md", "copia del kit\n")
    scrivi(c, "docs/kit-progetto/G.md", "copia del kit\n")
    scrivi(c, "docs/kit-progetto/pacchetto/PACCHETTO-v1-1di1.md", "generato, cita docs/ORFANO.md\n")
    scrivi(c, ".claude/skills/foto/SKILL.md", "skill\n")
    scrivi(c, ".claude/hooks/attivo.py", "# attivo\n")
    scrivi(c, ".claude/hooks/spento.py", "# spento\n")
    scrivi(c, "archivio/vecchio.md", "storia\n")
    subprocess.run(["git", "init", "-q"], cwd=c, check=True)
    subprocess.run(["git", "add", "-A"], cwd=c, check=True)
    rc, u = esegui(c, "pulizia-kit.py")
    controlla(rc == 0, "pulizia esce pulito", u)
    controlla("ORFANO docs/ORFANO.md" in u, "file che cita solo se stesso (e il pacchetto generato) = orfano", u)
    controlla("ORFANO .claude/hooks/spento.py" in u, "hook non citato = orfano", u)
    controlla("SOLO STORIA docs/VECCHIO.md" in u, "citato solo dalla storia", u)
    controlla("DOPPIO docs/DOPPIO-A.md (stesso contenuto di docs/DOPPIO-B.md" in u, "doppio trovato", u)
    controlla("docs/USATO.md" not in u and "attivo.py" not in u, "file citati: non in elenco", u)
    controlla("SKILL.md" not in u and "PACCHETTO" not in u, "skill e pacchetto generato mai in elenco", u)
    controlla("docs/G.md" not in u, "le copie del kit non sono doppi", u)
    controlla("mai nel registro" in u, "data dell'ultimo cambio (qui nessun commit)", u)
    controlla("Mai da sola" in u, "proposta senza cancellare", u)
    controlla(os.path.exists(os.path.join(c, "docs/ORFANO.md")), "non cancella niente", u)

print(f"OK: {ok_n} controlli di cerca-regola e pulizia-kit")
