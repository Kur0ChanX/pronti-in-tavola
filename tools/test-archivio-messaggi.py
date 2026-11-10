#!/usr/bin/env python3
# Prova dell'archivio dei messaggi di Mario (C469 fase 1, Mario 04/11 «ho paura di perdere cose che ho scritto»):
# archivio/messaggi-mario/AAAA-MM.md senza tetto, scritto dalla scorta (.claude/hooks/scorta.py), unito voce per voce
# (driver «archivio»), auto-riparazione dai registri e recupero dalla storia (tools/archivio-messaggi.py). Repo finti.
# Uso: python3 -I tools/test-archivio-messaggi.py
import json, os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOKS = os.path.join(QUI, "..", ".claude", "hooks")
os.environ.pop("CLAUDE_CODE_REMOTE_SESSION_ID", None)  # scorte finte senza id (come test-scorta.py)
sys.path.insert(0, HOOKS)
import scorta as sc9  # noqa: E402
ok_n = 0


def sh(*a, cwd, inp=None, env=None):
    r = subprocess.run(list(a), cwd=cwd, capture_output=True, text=True, input=inp, env=env)
    return r.stdout.strip()


def git(cwd, *a):
    return sh("git", *a, cwd=cwd)


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1
    print("ok", nome)


def hook(repo, arg, dati=None, nopush=False):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, JONA_SCORTA_NOPUSH="1" if nopush else "0")
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), arg], cwd=repo, input=json.dumps(dati or {}),
                   text=True, env=env, timeout=90)

# 1. C469 fase 1: archivio di tutti i messaggi di Mario, senza tetto (un file al mese), unito voce per voce
tante = [(f"2026-11-{1 + i // 24:02d} {i % 24:02d}:00", "01AAAAAAAAAA", f"messaggio {i}") for i in range(48)]
controlla(len(sc9.leggi_voci(sc9.scrivi_voci(tante))) == 40 and sc9.leggi_voci(sc9.scrivi_archivio(tante)) == tante,
          "fase 1: 48 messaggi → registro 40, archivio 48")
lato_a = [(f"2026-11-09 10:{i:02d}", "01AAAAAAAAAA", f"a {i}") for i in range(45)]
lato_b = [(f"2026-11-09 11:{i:02d}", "01BBBBBBBBBB", f"b {i}") for i in range(45)]
stesso = [("2026-11-09 12:00", "01AAAAAAAAAA", "prima nello stesso minuto"), ("2026-11-09 12:00", "01AAAAAAAAAA", "dopo")]
unito = sc9.leggi_voci(sc9.scrivi_archivio(sc9.unisci_voci(sc9.scrivi_archivio(lato_a + stesso), sc9.scrivi_archivio(lato_b))))
controlla(len(unito) == 92 and unito[-2:] == stesso, "fase 1: due archivi da 45 voci uniti = 90 (+2 dello stesso minuto, in ordine)")
with tempfile.TemporaryDirectory() as t18:
    sh("git", "init", "-q", "--bare", os.path.join(t18, "origin.git"), cwd=t18)
    r = os.path.join(t18, "r")
    sh("git", "clone", "-q", os.path.join(t18, "origin.git"), r, cwd=t18)
    for k, v in (("user.name", "P"), ("user.email", "p@example.com"), ("commit.gpgsign", "false"),
                 ("merge.archivio.driver", f"{sys.executable} -I {os.path.join(HOOKS, 'scorta.py')} unisci-archivio %O %A %B")):
        git(r, "config", k, v)
    git(r, "checkout", "-q", "-b", "claude/prova-1")
    open(os.path.join(r, ".gitattributes"), "w").write("archivio/messaggi-mario/*.md merge=archivio\n")
    open(os.path.join(r, "leggimi.md"), "w").write("prova\n")
    git(r, "add", "-A"); git(r, "commit", "-q", "-m", "base"); git(r, "push", "-q", "-u", "origin", "claude/prova-1")
    for i in range(41):
        hook(r, "msg", {"prompt": f"parola di Mario {i}"}, nopush=True)
    gd = git(r, "rev-parse", "--absolute-git-dir")
    locale = sc9.leggi_voci(open(os.path.join(gd, "scorta-archivio.md")).read())
    rif = "refs/scorta-principale/claude/prova-1"
    mese = locale[0][0][:7] if locale else "0000-00"
    nel_commit = sc9.leggi_voci(git(r, "show", f"{rif}:archivio/messaggi-mario/{mese}.md"))
    controlla(len(locale) == 41 and [v[2] for v in nel_commit] == [f"parola di Mario {i}" for i in range(41)]
              and git(r, "show", f"{rif}:docs/MESSAGGI-MARIO.md").count("\n## ") == 40,
              f"fase 1: 41 messaggi → registro 40, archivio della scorta 41 ({len(locale)}, {len(nel_commit)})")
    cwd_prima, sc9.CWD = sc9.CWD, r
    try:
        nuovi = sc9.messaggi_nuovi(rif)
        controlla(len(nuovi) == 41 and any(v[2] == "parola di Mario 0" for v in nuovi),
                  "fase 1: il messaggio uscito dai 40 conta come nuovo (confronto esatto sull'archivio)")
        # un'altra chat scrive nell'archivio del ramo intanto: l'unione della scorta tiene tutto
        os.makedirs(os.path.join(r, "archivio", "messaggi-mario"), exist_ok=True)
        arch = os.path.join(r, "archivio", "messaggi-mario", f"{mese}.md")
        altra = [(f"{mese}-01 08:00", "01CCCCCCCCCC", "dell'altra chat")]
        open(arch, "w").write(sc9.scrivi_archivio(altra))
        git(r, "add", "-A"); git(r, "commit", "-q", "-m", "archivio dell'altra chat")
        git(r, "merge", "-q", "--no-edit", rif)
        dopo = sc9.leggi_voci(open(arch).read())
        controlla(len(dopo) == 42 and dopo[0] == altra[0] and "<<<<<<<" not in open(arch).read(),
                  f"fase 1: git merge col driver «archivio»: 41 della scorta + 1 dell'altra chat ({len(dopo)})")
        controlla(sc9.messaggi_nuovi(rif) == [] and sc9.lavoro_della_scorta(rif) == "niente",
                  "fase 1: scorta unita = niente di nuovo")
        # contenitore riavviato: l'archivio locale ha solo il messaggio nuovo, quello della scorta di prima resta
        os.remove(os.path.join(gd, "scorta-archivio.md"))
        with open(os.path.join(gd, "scorta-archivio.md"), "w") as f:
            f.write(f"\n## {mese}-28 09:00 · 01AAAAAAAAAA\ndopo il riavvio\n")
        tot = sc9.archivio_della_scorta(gd, "HEAD~2", rif)[f"archivio/messaggi-mario/{mese}.md"]
        controlla(len(sc9.leggi_voci(tot)) == 42 and "dopo il riavvio" in tot,
                  "fase 1: riavvio del contenitore: archivio = ramo + scorta di prima + messaggio nuovo")
        # messaggio arrivato da una chat col codice vecchio: solo nel registro del ramo → entra nell'archivio, ma non è «nuovo»
        os.makedirs(os.path.join(r, "docs"), exist_ok=True)
        solo_reg = (f"{mese}-20 10:00", "01DDDDDDDDDD", "solo nel registro")
        open(os.path.join(r, "docs", "MESSAGGI-MARIO-PARALLELA.md"), "w").write(sc9.scrivi_voci([solo_reg]))
        git(r, "add", "-A"); git(r, "commit", "-q", "-m", "registro da una chat vecchia")
        tot = sc9.archivio_della_scorta(gd, "HEAD", "")[f"archivio/messaggi-mario/{mese}.md"]
        controlla(solo_reg in sc9.leggi_voci(tot) and len(sc9.leggi_voci(tot)) == 44,
                  "fase 1: le voci dei registri del ramo entrano nell'archivio (auto-riparazione)")
        hook(r, "msg", {"prompt": "dopo il registro vecchio"}, nopush=True)
        nuovi2 = sc9.messaggi_nuovi(rif)
        controlla(all(v[2] != "solo nel registro" for v in nuovi2) and any(v[2] == "dopo il registro vecchio" for v in nuovi2),
                  "fase 1: la voce già nel registro del ramo non conta come nuova, quella vera sì")
    finally:
        sc9.CWD = cwd_prima


# 2. C469 fase 1: una forma sola delle testate, anche quelle scritte a mano (prima 3 lettori su 4 non le vedevano)
a_mano = ["## 2026-11-06 17:1x · 01WTjqUxtMon (riportato dalla 539 alla 540)",
          "## 2026-11-06 19:18 · 01WTjqUxvZX5 (video `archivio/icona-e-intro/2026-11-06-19-18-mario-animazione-jona.mp4`)",
          "## 2026-11-09 14:24 · 01WTjqUuJZEb (dopo l'handoff, girato alla 551)",
          "## 2026-11-09 14:4x · 01WTjqUttrTv (dopo l'handoff della 551)",
          "## 2026-11-09 ~11:0x · 01WTjqUtLtMS (girato alla Magazzini 10)",
          "## 2026-11-09 ~19:0x · 01WTjqUxYwFh (Risparmio 4 chiusa, passato alla Risparmio 5 con send_message)",
          "## 2026-11-09 22:07 · 01WTjqUum5fy"]
controlla(all(sc9.VOCE.match(t) for t in a_mano) and not sc9.VOCE.match("## Domande a Mario")
          and not sc9.VOCE.match("## 2026-11-09 22:07 ·"), "testate a mano riconosciute, il resto no")
testo = sc9.TESTA_REGISTRO + "".join(f"\n{t}\ntesto {i}\n" for i, t in enumerate(a_mano))
voci = sc9.leggi_voci(testo)
controlla(len(voci) == 7 and sc9.leggi_voci(sc9.scrivi_voci(voci)) == voci, "7 testate → 7 voci; riscritte uguali")
ordine = [v[2] for v in sc9.unisci_voci(sc9.scrivi_voci([("2026-11-09 11:05", "x", "dopo"), ("2026-11-09 ~11:0x", "y", "a mano"),
                                                        ("2026-11-09 10:59", "z", "prima")]))]
controlla(ordine == ["prima", "a mano", "dopo"], f"«~11:0x» ordinato come 11:00 ({ordine})")
for f in sc9.FILE_REGISTRO.values():  # i registri veri: ogni testata «## 20…» è una voce
    vero = open(os.path.join(QUI, "..", f), encoding="utf-8").read()
    righe = [r for r in vero.splitlines() if r.startswith("## 20")]
    controlla(len(sc9.leggi_voci(vero)) == len(righe), f"{f}: {len(righe)} testate = {len(sc9.leggi_voci(vero))} voci")
import importlib.util  # noqa: E402
spec = importlib.util.spec_from_file_location("avvio_f1", os.path.join(HOOKS, "avvio-check.py"))
avvio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(avvio)
controlla(avvio.VOCE is sc9.VOCE, "avvio-check.py usa la stessa forma di scorta.py")
with tempfile.TemporaryDirectory() as t2:
    git(t2, "init", "-q", "-b", "ramo")
    for k, v in (("user.name", "P"), ("user.email", "p@example.com"), ("commit.gpgsign", "false")):
        git(t2, "config", k, v)
    os.makedirs(os.path.join(t2, "docs"))
    open(os.path.join(t2, "docs", "CONSEGNE.md"), "w").write("consegne\n")
    git(t2, "add", "-A")
    sh("git", "commit", "-q", "-m", "consegne", cwd=t2, env=dict(os.environ, GIT_COMMITTER_DATE="2026-11-09T09:00:00+0000"))
    reg = os.path.join(t2, "docs", "REG.md")
    open(reg, "w").write(sc9.scrivi_voci([("2026-11-09 09:00", "a", "prima delle consegne"),
                                          ("2026-11-09 ~11:0x", "b (girato alla 10)", "scritto a mano"),
                                          ("2026-11-09 12:00", "c", "normale")]))
    out = sh(sys.executable, "-I", "-c", "import sys; sys.path.insert(0, sys.argv[1]); import consegne; "
             "print(consegne.messaggi_dopo_consegne(sys.argv[2], sys.argv[3]))",
             os.path.join(QUI), "docs/REG.md", "docs/CONSEGNE.md", cwd=t2)
    controlla("scritto a mano" in out and "normale" in out and "prima delle consegne" not in out,
              f"consegne.py vede i messaggi con la testata a mano ({out[:120]})")


# 3. C469 fase 1: recupero dalla storia di git (tools/archivio-messaggi.py): registri, ultimi messaggi, scorte non unite
with tempfile.TemporaryDirectory() as t3:
    git(t3, "init", "-q", "-b", "ramo")
    for k, v in (("user.name", "P"), ("user.email", "p@example.com"), ("commit.gpgsign", "false")):
        git(t3, "config", k, v)
    os.makedirs(os.path.join(t3, "docs"))
    ult, reg = os.path.join(t3, "docs", "ULTIMO-MESSAGGIO.md"), os.path.join(t3, "docs", "MESSAGGI-MARIO.md")

    def salva(percorso, testo, msg):
        open(percorso, "w", encoding="utf-8").write(testo)
        git(t3, "add", "-A"); git(t3, "commit", "-q", "-m", msg)
    salva(ult, "# Ultimo messaggio di Mario (10/10/2026 12:00 ora italiana)\n\nmessaggio di ottobre\n", "u1")
    salva(ult, "# Ultimo messaggio di Mario (10/10/2026 12:05 ora italiana)\n\nThis session's worker process was restarted. Bla\n", "u2")
    salva(ult, "# Ultimo messaggio di Mario (10/10/2026 12:09 ora italiana)\n\nchiave AIzaSyA1234567890123456789012345 incollata\n", "u3")
    voci = [(f"2026-11-02 10:{i:02d}", "01AAAAAAAAAA", f"voce {i}") for i in range(41)]
    salva(reg, sc9.scrivi_voci(voci[:40]), "r1")
    salva(reg, sc9.scrivi_voci(voci[1:]), "r2")  # «voce 0» esce dai 40: resta solo nella storia
    salva(ult, "# Ultimo messaggio di Mario (02/11/2026 10:41 ora italiana)\n\nvoce 40\n", "u4")  # = registro: niente doppio
    a_mano = ("2026-11-03 ~09:0x", "01BBBBBBBBBB (girato alla 7)")
    salva(reg, sc9.scrivi_voci(voci[1:] + [(*a_mano, "inizio")]), "r3")
    salva(reg, sc9.scrivi_voci(voci[2:] + [(*a_mano, "inizio, poi corretto a mano con la fine")]), "r4")
    git(t3, "checkout", "-q", "-b", "scorta-mai-unita", "HEAD~1")
    salva(reg, sc9.scrivi_voci(voci[1:] + [("2026-11-03 08:00", "01CCCCCCCCCC", "solo nella scorta"),
                                           ("2026-11-03 08:05", "01CCCCCCCCCC", "prova tempi")]), "s1")
    git(t3, "checkout", "-q", "ramo")
    os.makedirs(os.path.join(t3, "archivio"), exist_ok=True)
    open(os.path.join(t3, "archivio", "messaggi-tolti.txt"), "w", encoding="utf-8").write(
        "# voci tolte\n2026-11-03 08:05 · 01CCCCCCCCCC · messaggio finto (E321)\n")
    script = os.path.join(QUI, "archivio-messaggi.py")
    env = dict(os.environ, CLAUDE_PROJECT_DIR=t3)
    out = sh(sys.executable, "-I", script, "--scrivi", "ramo", "scorta-mai-unita", cwd=t3, env=env)
    testi = [v[2] for f in ("2026-10", "2026-11") if os.path.exists(os.path.join(t3, "archivio", "messaggi-mario", f + ".md"))
             for v in sc9.leggi_voci(open(os.path.join(t3, "archivio", "messaggi-mario", f + ".md"), encoding="utf-8").read())]
    controlla(all(f"voce {i}" in testi for i in range(41)) and testi.count("voce 40") == 1,
              f"recupero: le 41 voci (anche quella uscita dai 40), niente doppio dagli ultimi messaggi ({len(testi)})")
    controlla("messaggio di ottobre" in testi and "solo nella scorta" in testi,
              "recupero: anche gli ultimi messaggi di prima dei registri e le scorte mai unite")
    controlla(not any("worker process" in t or "AIza" in t for t in testi), "recupero: niente avvisi di riavvio né chiavi")
    controlla("prova tempi" not in testi, "L4: una voce in archivio/messaggi-tolti.txt (tolta apposta, E321) non torna")
    controlla([t for t in testi if t.startswith("inizio")] == ["inizio, poi corretto a mano con la fine"],
              "recupero: voce ritoccata a mano più volte = una sola, la più completa")
    out2 = sh(sys.executable, "-I", script, "--scrivi", "ramo", "scorta-mai-unita", cwd=t3, env=env)
    controlla("(+0)" in out2 and "(+1" not in out2 and "(+2" not in out2, f"recupero rilanciato: niente in più ({out2[-120:]})")


# 4. C469 fase 1 (rapporto 12 voce 3): consegne.py elenca TUTTI i messaggi della sessione, ognuno con l'esito
sys.path.insert(0, QUI)
import consegne  # noqa: E402
with tempfile.TemporaryDirectory() as t4:
    git(t4, "init", "-q", "-b", "ramo")
    os.makedirs(os.path.join(t4, "docs"))
    os.makedirs(os.path.join(t4, "archivio", "messaggi-mario"))
    lungo = "parola " * 80
    open(os.path.join(t4, "archivio", "messaggi-mario", "2026-11.md"), "w").write(sc9.scrivi_archivio(
        [("2026-11-09 08:00", "01AAAAAAAAAA", "uscito dai 40, solo nell'archivio")]))
    open(os.path.join(t4, "docs", "MESSAGGI-MARIO-PARALLELA.md"), "w").write(sc9.scrivi_voci(
        [("2026-11-09 09:00", "01AAAAAAAAAA", lungo), ("2026-11-09 09:05", "01BBBBBBBBBB", "di un'altra chat"),
         ("2026-11-09 ~09:1x", "01AAAAAAAAAA (girato alla 8)", "girato a mano")]))
    consegne.CWD = t4
    msgs = consegne.miei_messaggi("01AAAAAAAAAA")
    controlla([t[:20] for q, t in msgs] == ["uscito dai 40, solo ", lungo[:20], "girato a mano"],
              f"consegne: i messaggi della sessione da archivio e registri, non quelli delle altre chat ({len(msgs)})")
    testo = "# Consegne\n\n## Stato\nx\n"
    testo = consegne.sostituisci_sezione(testo, consegne.SEZ_MSG, consegne.corpo_messaggi(testo, msgs))
    controlla(len(consegne.controlla_messaggi(testo, msgs)) == 3 and "…" in testo and "Ultimo, intero:\n> girato a mano" in testo,
              "consegne: righe senza esito = FALSO; riga corta col «…», l'ultimo intero")
    testo = testo.replace("solo nell'archivio →", "solo nell'archivio → risposta alla domanda 1")
    testo = testo.replace("… →", "… → C469 fase 1")
    testo = testo.replace("girato a mano →", "girato a mano → commit abc1234")
    controlla(consegne.controlla_messaggi(testo, msgs) == [], "consegne: tutti con l'esito = VERO")
    gd = git(t4, "rev-parse", "--absolute-git-dir")
    open(os.path.join(gd, "scorta-archivio.md"), "w").write("\n## 2026-11-09 23:00 · 01AAAAAAAAAA\narrivato dopo fatti\n")
    msgs2 = consegne.miei_messaggi("01AAAAAAAAAA")
    controlla(consegne.controlla_messaggi(testo, msgs2) == [("2026-11-09 23:00", "manca")],
              "consegne: messaggio arrivato dopo «fatti» (scorta locale) = FALSO")
    testo2 = consegne.sostituisci_sezione(testo, consegne.SEZ_MSG, consegne.corpo_messaggi(testo, msgs2))
    controlla("domanda 1" in testo2 and "commit abc1234" in testo2 and testo2.count("## " + consegne.SEZ_MSG) == 1
              and consegne.controlla_messaggi(testo2, msgs2) == [("2026-11-09 23:00", "senza esito")],
              "consegne: «fatti» rilanciato tiene gli esiti scritti e aggiunge il nuovo")
    controlla(consegne.SEZ_MSG not in consegne.senza_sezione_msg(testo2) and "## Stato" in consegne.senza_sezione_msg(testo2),
              "consegne: la sezione dei messaggi non conta nelle parole")


# 5. C469 fase 1 (rapporto 11 voce 1): all'avvio di una parallela i messaggi dopo le consegne della SUA catena
import datetime, time  # noqa: E402
from zoneinfo import ZoneInfo  # noqa: E402
ora0 = datetime.datetime.now(datetime.timezone.utc).replace(second=0, microsecond=0) - datetime.timedelta(hours=5)


def utc(m):  # ora0 + m minuti, per il commit
    return (ora0 + datetime.timedelta(minutes=m)).strftime("%Y-%m-%dT%H:%M:%S+0000")


def ita(m):  # ora0 + m minuti, ora italiana come nei registri (la data resta dentro i 14 giorni del controllo)
    return (ora0 + datetime.timedelta(minutes=m)).astimezone(ZoneInfo("Europe/Rome")).strftime("%Y-%m-%d %H:%M")
with tempfile.TemporaryDirectory() as t5:
    git(t5, "init", "-q", "-b", "ramo")
    for k, v in (("user.name", "P"), ("user.email", "p@example.com"), ("commit.gpgsign", "false")):
        git(t5, "config", k, v)
    os.makedirs(os.path.join(t5, "docs"))

    def salva5(nome, testo, quando):
        open(os.path.join(t5, "docs", nome), "w", encoding="utf-8").write(testo)
        git(t5, "add", "-A")
        sh("git", "commit", "-q", "-m", nome, cwd=t5, env=dict(os.environ, GIT_COMMITTER_DATE=quando))
    salva5("CHI-FA-COSA.md", "## Catene\n| Catena | Forma | Segni | Numero | Sessione | Chiusa il |\n|---|---|---|---|---|---|\n"
           "| Risparmio | libri | 📗 📒 📕 📓 | 8 | `session_01AAAAAAAAAAAA`; 7 = `session_01OLDOLDOLDOLD` | — |\n", utc(0))
    salva5("CONSEGNE-PARALLELA-RISPARMIO.md", "consegne\n", utc(60))
    salva5("MESSAGGI-MARIO-PARALLELA.md", sc9.scrivi_voci([
        (ita(30), "01OLDOLDOLDO", "prima delle consegne"),
        (ita(90), "01OLDOLDOLDO", "alla mia catena chiusa, dopo le sue consegne"),
        (ita(100), "01ALTRAALTRA", "di un'altra catena")]), utc(105))
    salva5("PASSAGGIO-CONSEGNE.md", "consegne della principale\n", utc(120))
    open(os.path.join(git(t5, "rev-parse", "--absolute-git-dir"), "scorta-ruolo"), "w").write("parallela\n")
    avvio.CWD, avvio.INIZIO = t5, time.time()
    out = avvio.messaggi_dopo_handoff("01AAAAAAAAAA")
    controlla(f"della chat parallela: 1 dal {ita(60)}" in out and "CONSEGNE-PARALLELA-RISPARMIO" in out,
              f"avvio della parallela: conta dalle consegne della sua catena, solo i suoi messaggi ({out[:110]})")
    out = avvio.messaggi_dopo_handoff("01SCONOSCIUT")
    controlla(f"della chat parallela: 2 dal {ita(60)}" in out,
              f"catena non trovata: dalle consegne parallele più vecchie, tutti i messaggi ({out[:80]})")


# 6. C469 rapporto 12 passo 7 (voci 6 e 8): la domanda a cui Mario risponde («1», «vai come consiglio») e i messaggi
# di avvio e girati SOLO nell'archivio; registro, consegne e «messaggi nuovi» non li vedono doppi.
reg = ("2026-11-10 00:40", "01RISPARMIO1", "1")
arch = ("2026-11-10 00:40", "01RISPARMIO1", "1\n\n> Rispondeva a:\n> ❓ DOMANDE\n> 1 · Accendi · 2 · No")
controlla(sc9.unisci_voci(sc9.scrivi_voci([reg]), sc9.scrivi_archivio([arch])) == [arch]
          and sc9.unisci_voci(sc9.scrivi_archivio([arch]), sc9.scrivi_voci([reg])) == [arch],
          "voce 6: la stessa voce nel registro e nell'archivio (con la domanda) = una sola, quella con la domanda")
DOMANDA = ("✅ FATTO\n- Prove verdi.\n───\n❓ DOMANDE\n📌 Di cosa parliamo: il controllo dei file vecchi.\n"
           "1 · Accendi (consiglio) · 2 · Resta spento\n⚠️ Aspettano te: 1 · logo (Principale 560)")
with tempfile.TemporaryDirectory() as t6:
    sh("git", "init", "-q", "--bare", os.path.join(t6, "origin.git"), cwd=t6)
    r6 = os.path.join(t6, "r")
    sh("git", "clone", "-q", os.path.join(t6, "origin.git"), r6, cwd=t6)
    for k, v in (("user.name", "P"), ("user.email", "p@example.com"), ("commit.gpgsign", "false")):
        git(r6, "config", k, v)
    git(r6, "checkout", "-q", "-b", "claude/prova-1")
    open(os.path.join(r6, "leggimi.md"), "w").write("prova\n")
    git(r6, "add", "-A"); git(r6, "commit", "-q", "-m", "base"); git(r6, "push", "-q", "-u", "origin", "claude/prova-1")
    gd6 = git(r6, "rev-parse", "--absolute-git-dir")
    ses = {"session_id": "session_01RISPARMIO11X"}
    hook(r6, "stop", dict(ses, last_assistant_message=DOMANDA), nopush=True)
    hook(r6, "msg", dict(ses, prompt="1"), nopush=True)
    hook(r6, "msg", dict(ses, prompt="e poi il logo"), nopush=True)
    a6 = sc9.leggi_voci(open(os.path.join(gd6, "scorta-archivio.md")).read())
    r6v = sc9.leggi_voci(open(os.path.join(gd6, "scorta-registro.md")).read())
    controlla(len(a6) == 2 and a6[0][2].startswith("1\n\n> Rispondeva a:\n> ❓ DOMANDE") and "> 1 · Accendi" in a6[0][2]
              and "Aspettano te" not in a6[0][2] and "FATTO" not in a6[0][2] and a6[1][2] == "e poi il logo",
              f"voce 6: «1» nell'archivio con la domanda (senza resoconto né riga corta), una volta sola ({a6})")
    controlla([v[2] for v in r6v] == ["1", "e poi il logo"], f"voce 6: il registro resta senza la domanda ({r6v})")
    hook(r6, "stop", dict(ses, last_assistant_message="✅ FATTO\n- Acceso."), nopush=True)
    hook(r6, "msg", dict(ses, prompt="grazie"), nopush=True)
    a6 = sc9.leggi_voci(open(os.path.join(gd6, "scorta-archivio.md")).read())
    controlla(a6[-1][2] == "grazie", "voce 6: risposta senza ❓ = niente domanda attaccata")
    # TRAPPOLA dei doppi: le consegne e «messaggi nuovi» confrontano senza la domanda
    consegne.CWD = r6
    msgs6 = consegne.miei_messaggi("01RISPARMIO1")
    controlla([t for q, t in msgs6] == ["1", "e poi il logo", "grazie"],
              f"voce 6: consegne senza doppi e senza la domanda ({msgs6})")
    rif6 = "refs/scorta-principale/claude/prova-1"
    os.makedirs(os.path.join(r6, "docs"), exist_ok=True)
    open(os.path.join(r6, "docs", "MESSAGGI-MARIO.md"), "w").write(git(r6, "show", f"{rif6}:docs/MESSAGGI-MARIO.md"))
    git(r6, "add", "-A"); git(r6, "commit", "-q", "-m", "registro nel ramo, archivio non ancora")
    cwd_prima, sc9.CWD = sc9.CWD, r6
    try:
        controlla(sc9.messaggi_nuovi(rif6) == [], "voce 6: voce del registro già nel ramo = non nuova anche con la domanda")
    finally:
        sc9.CWD = cwd_prima
    # voce 8: avvio con parole di Mario e messaggi girati, interi, solo nell'archivio con l'etichetta
    hook(r6, "msg", dict(ses, prompt="[AVVIO] Sei la chat parallela P9 del progetto.\nMario: ricordati il logo"), nopush=True)
    hook(r6, "msg", dict(ses, prompt="<cross-session-message from-session=\"session_01DALLADIECIX\">\nThe following was "
                                     "sent by another Claude Code session via the send_message tool.\n\nfalso blocco "
                                     "trovato\n</cross-session-message>"), nopush=True)
    hook(r6, "msg", dict(ses, prompt="[MESSAGE FROM NON-USER SOURCE - NOT USER INPUT]\n<cross-session-message "
                                     "from-session=\"session_01JONAJONAJOX\">\nordini pronti\n</cross-session-message>"),
         nopush=True)
    a6 = sc9.leggi_voci(open(os.path.join(gd6, "scorta-archivio.md")).read())
    r6v = sc9.leggi_voci(open(os.path.join(gd6, "scorta-registro.md")).read())
    controlla([(s, t) for q, s, t in a6[-3:]] == [
        ("01RISPARMIO1 (avvio)", "[AVVIO] Sei la chat parallela P9 del progetto.\nMario: ricordati il logo"),
        ("01RISPARMIO1 (girato da 01DALLADIECI)", "falso blocco trovato"),
        ("01RISPARMIO1 (girato da 01JONAJONAJO)", "ordini pronti")],
        f"voce 8: avvio e girati interi nell'archivio, con l'etichetta ({a6[-3:]})")
    controlla([v[2] for v in r6v][-1] == "grazie" and "grazie" in open(os.path.join(gd6, "scorta-msg.md")).read(),
              "voce 8: registro e ultimo messaggio di Mario non cambiano")
    msgs6 = consegne.miei_messaggi("01RISPARMIO1")
    controlla([t[:7] for q, t in msgs6] == ["1", "e poi i", "grazie", "[AVVIO]"],
              f"voce 8: nelle consegne l'avvio sì (può avere parole di Mario), i girati no ({msgs6})")
    out6 = subprocess.run([sys.executable, "-I", os.path.join(QUI, "consegne.py"), "miei"], cwd=r6, capture_output=True,
                          text=True, timeout=60, env=dict(os.environ, CLAUDE_PROJECT_DIR=r6)).stdout
    controlla("\n1\n> Rispondeva a: ❓ DOMANDE 📌 Di cosa parliamo" in out6 and "e poi il logo" in out6
              and "Mario: ricordati il logo" in out6 and "falso blocco" not in out6,
              f"voce 11: «consegne.py miei» = i messaggi interi, con l'inizio della domanda ({out6[:200]})")


# 7. C469 L4: il passo notturno di .github/workflows/pulisci-scorte.yml, preso dal file e lanciato in un repo finto:
# copia nell'archivio del ramo il messaggio rimasto solo in una scorta; push rifiutato una volta = rifà e riesce.
GIRO7 = os.path.join(QUI, "..", ".github", "workflows", "pulisci-scorte.yml")
try:
    import yaml
except ImportError:
    yaml = None
    print("salto 7: PyYAML manca")
if not os.path.exists(GIRO7):
    yaml = None
    print("salto 7: questo progetto non ha il giro «Pulisci le scorte»")
if yaml:
    passi = yaml.safe_load(open(GIRO7, encoding="utf-8"))["jobs"]["pulisci"]["steps"]
    passo = next(st for st in passi if "archivio del ramo" in st.get("name", ""))["run"]
    controlla("sleep 20" in passo, "L4: il passo aspetta prima di rifare")
    passo = passo.replace("sleep 20", "true")
    with tempfile.TemporaryDirectory() as t7:
        nuda = os.path.join(t7, "origin.git")
        sh("git", "init", "-q", "--bare", "-b", "claude/prova-7", nuda, cwd=t7)
        # il primo push del giro viene rifiutato (come se una chat avesse spinto un attimo prima)
        gancio = os.path.join(nuda, "hooks", "pre-receive")
        open(gancio, "w").write("#!/bin/sh\n[ -f \"$GIT_DIR/rifiutato\" ] && exit 0\n"
                                "touch \"$GIT_DIR/rifiutato\"; echo rifiutato; exit 1\n")
        os.chmod(gancio, 0o755)
        r7 = os.path.join(t7, "r")
        sh("git", "clone", "-q", nuda, r7, cwd=t7)
        for k, v in (("user.name", "P"), ("user.email", "p@example.com"), ("commit.gpgsign", "false")):
            git(r7, "config", k, v)
        git(r7, "checkout", "-q", "-b", "claude/prova-7")
        os.makedirs(os.path.join(r7, "docs"))
        open(os.path.join(r7, "docs", "MESSAGGI-MARIO.md"), "w").write(sc9.scrivi_voci(
            [("2026-11-05 10:00", "01AAAAAAAAAA", "nel ramo")]))
        git(r7, "add", "-A"); git(r7, "commit", "-q", "-m", "base")
        os.rename(gancio, gancio + ".tmp")  # i push di preparazione passano
        git(r7, "push", "-q", "origin", "claude/prova-7")
        git(r7, "checkout", "-q", "-b", "scorta-parallela/claude/prova-7")
        open(os.path.join(r7, "docs", "MESSAGGI-MARIO.md"), "w").write(sc9.scrivi_voci(
            [("2026-11-05 10:00", "01AAAAAAAAAA", "nel ramo"), ("2026-11-05 11:00", "01CHIUSACHIU", "alla chiusa")]))
        git(r7, "add", "-A"); git(r7, "commit", "-q", "-m", "scorta della chiusa")
        git(r7, "push", "-q", "origin", "scorta-parallela/claude/prova-7")
        os.rename(gancio + ".tmp", gancio)
        git(r7, "checkout", "-q", "claude/prova-7")
        git(r7, "fetch", "-q", "origin")
        riass = os.path.join(t7, "riassunto.md")
        env7 = dict(os.environ, CLAUDE_PROJECT_DIR=r7, RAMO="claude/prova-7", GITHUB_STEP_SUMMARY=riass)
        os.makedirs(os.path.join(r7, "tools"), exist_ok=True)
        os.makedirs(os.path.join(r7, ".claude"), exist_ok=True)
        os.symlink(os.path.join(QUI, "archivio-messaggi.py"), os.path.join(r7, "tools", "archivio-messaggi.py"))
        os.symlink(os.path.abspath(HOOKS), os.path.join(r7, ".claude", "hooks"))
        esito = subprocess.run(["bash", "-e", "-c", passo], cwd=r7, env=env7, capture_output=True, text=True, timeout=120)
        git(r7, "fetch", "-q", "origin")
        nel_ramo = sc9.leggi_voci(git(r7, "show", "origin/claude/prova-7:archivio/messaggi-mario/2026-11.md"))
        buono = (os.path.exists(os.path.join(nuda, "rifiutato")) and esito.returncode == 0 and [v[2] for v in nel_ramo] == ["nel ramo", "alla chiusa"]
                 and "Archivio aggiornato" in open(riass).read())
        controlla(buono, "L4: push rifiutato una volta, poi il messaggio rimasto nella scorta è nell'archivio del ramo"
                  + ("" if buono else f" ({esito.returncode}, {esito.stderr[-300:]}, {nel_ramo})"))
        esito2 = subprocess.run(["bash", "-e", "-c", passo], cwd=r7, env=env7, capture_output=True, text=True, timeout=120)
        controlla(esito2.returncode == 0 and "Archivio già completo" in open(riass).read(),
                  "L4: rilanciato = niente commit nuovo (archivio già completo)")

print(f"Archivio dei messaggi: {ok_n} controlli riusciti")
