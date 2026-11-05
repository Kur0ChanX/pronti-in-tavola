#!/usr/bin/env python3
# Controllo e riparazione all'avvio della sessione (vedi docs/ERRORI.md, E2 ed E8).
# Riaggancia da solo il ramo di lavoro all'ultima versione su GitHub, solo con operazioni sicure:
#   - HEAD staccato → passa al ramo;
#   - ramo locale indietro → git merge --ff-only;
#   - ramo locale vecchio con storia diversa → lo RINOMINA in backup (non cancella niente)
#     e ricrea il ramo da origin;
#   - sessione partita su un altro ramo (es. quello creato dalla piattaforma) → passa al ramo
#     scritto in .claude/ramo-di-lavoro.txt, solo se non si perde nessun commit (E12).
# Non tocca niente se ci sono modifiche non salvate o se il commit attuale non è su GitHub.
import datetime, json, os, re, subprocess, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:  # C352: merge simulato; sessione; scorte per sessione (scorta-<ruolo>-<data>-<id>/<ramo>)
    from scorta import (lavoro_della_scorta, sessione_corta, sessione_di, sessione_della_scorta, scorte_vive,
                        leggi_nome_scorta, scrivi_sessione, oggi, SCORTE_GIORNI)
except Exception:  # noqa: BLE001
    SCORTE_GIORNI = 14

    def lavoro_della_scorta(scorta, head="HEAD"):
        return "nuovo"

    def sessione_corta(sessione):
        return (re.match(r"[A-Za-z0-9]*", re.sub(r"^(session|cse)_", "", str(sessione or ""))).group(0))[:12]

    def sessione_di(dati):
        return sessione_corta(os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID") or (dati or {}).get("session_id"))

    def sessione_della_scorta(rif):
        return ""

    def scorte_vive(ramo, timeout=30):
        return None

    def leggi_nome_scorta(nome, ramo=None):
        m = re.fullmatch(r"scorta-(principale|parallela)/(.+?)((?:-ferma-)\d{8}-\d{6}-[0-9a-f]+)?", str(nome or ""))
        if not m or (ramo and m.group(2) != ramo):
            return None
        return {"nome": m.group(0), "ruolo": m.group(1), "data": "", "id": "", "ramo": m.group(2), "ferma": m.group(3) or ""}

    def scrivi_sessione(gitdir, chi, data=""):
        pass

    def oggi():
        return datetime.date.today().strftime("%Y%m%d")

CWD = os.environ.get("CLAUDE_PROJECT_DIR") or None
IN_CORSO = "avvio-in-corso"  # come kit-check.py
INIZIO = time.time()
# C352: l'hook ha 90 s (settings.json); se li supera viene fermato e tutto l'avviso di avvio si perde (P47: 112 fetch,
# 65 s). Oltre TEMPO_MAX i controlli lenti si saltano e l'avviso lo dice.
TEMPO_MAX = 45


def run(*args, timeout=20):
    try:
        r = subprocess.run(["git", *args], capture_output=True, text=True, timeout=timeout, cwd=CWD)
        return r.returncode, r.stdout.strip()
    except Exception:
        return 1, ""


def git(*args):
    rc, out = run(*args)
    return out if rc == 0 else ""


def ok(*args):
    return run(*args)[0] == 0


def tempo_finito():
    return time.time() - INIZIO > TEMPO_MAX


def ramo_scritto():
    try:
        with open(os.path.join(CWD or ".", ".claude", "ramo-di-lavoro.txt")) as f:
            nome = f.read().strip()
    except OSError:
        return ""
    return nome if nome and ok("check-ref-format", "--branch", nome) else ""


def ramo_di_lavoro():
    attuale = git("symbolic-ref", "-q", "--short", "HEAD")
    scritto = ramo_scritto()
    if scritto:
        return scritto, attuale != scritto
    if attuale:
        return attuale, False
    rami = [r.removeprefix("origin/") for r in git("branch", "-a", "--format=%(refname:short)", "--contains", "HEAD").splitlines()
            if r and not r.startswith("(") and r not in ("origin", "origin/HEAD")]
    rami.sort(key=lambda r: r in ("main", "master"))  # il ramo di lavoro prima di main
    return (rami[0] if rami else ""), True


def ripara():
    ramo, staccato = ramo_di_lavoro()
    if not ramo:
        return "ATTENZIONE: HEAD staccato e ramo di lavoro non trovato. Avvisa Mario, non lavorare."
    remoto = f"origin/{ramo}"
    for attesa in (0, 3, 6, 10):  # la rete può non essere pronta appena parte il contenitore
        time.sleep(attesa)
        if ok("fetch", "-q", "origin", ramo):
            break
    else:
        return f"ATTENZIONE: git fetch origin {ramo} fallito. Riprova a mano prima di lavorare."
    if not ok("rev-parse", "--verify", "-q", remoto):
        return f"Ramo {ramo} non ancora su GitHub: nessuna riparazione necessaria."
    if git("status", "--porcelain", "--untracked-files=no"):
        return f"ATTENZIONE: modifiche non salvate, riparazione automatica saltata. Controlla {ramo} a mano."
    if staccato and not ok("merge-base", "--is-ancestor", "HEAD", remoto):
        return f"ATTENZIONE: il commit attuale ha lavoro non presente su {remoto}. Avvisa Mario, non lavorare."

    fatto = []
    if ok("rev-parse", "--verify", "-q", f"refs/heads/{ramo}"):
        locale_indietro = ok("merge-base", "--is-ancestor", ramo, remoto)
        locale_avanti = ok("merge-base", "--is-ancestor", remoto, ramo)
        if not locale_indietro and not locale_avanti:
            backup = f"vecchio-{ramo}-{time.strftime('%Y%m%d-%H%M%S')}"
            if not ok("branch", "-m", ramo, backup):
                return f"ATTENZIONE: non riesco a rinominare il ramo locale stantio {ramo}. Avvisa Mario."
            fatto.append(f"ramo locale stantio rinominato in {backup} (niente cancellato)")
    if not ok("rev-parse", "--verify", "-q", f"refs/heads/{ramo}"):
        if not ok("checkout", "-q", "-b", ramo, "--track", remoto):
            return f"ATTENZIONE: git checkout -b {ramo} fallito. Avvisa Mario."
        fatto.append(f"ramo {ramo} creato da {remoto}")
    else:
        if git("symbolic-ref", "-q", "--short", "HEAD") != ramo:
            if not ok("checkout", "-q", ramo):
                return f"ATTENZIONE: git checkout {ramo} fallito. Avvisa Mario."
            fatto.append(f"passato al ramo {ramo}")
        if ok("merge-base", "--is-ancestor", ramo, remoto) and git("rev-parse", ramo) != git("rev-parse", remoto):
            if not ok("merge", "-q", "--ff-only", remoto):
                return f"ATTENZIONE: git merge --ff-only {remoto} fallito. Avvisa Mario."
            fatto.append(f"aggiornato a {remoto}")
        ok("branch", "-q", "--set-upstream-to", remoto, ramo)

    stato = "allineato a GitHub" if git("rev-parse", "HEAD") == git("rev-parse", remoto) else f"avanti rispetto a {remoto} (commit da inviare)"
    dettagli = ("; ".join(fatto) + ". ") if fatto else ""
    return f"Avvio: ramo {ramo} {stato}. {dettagli}Fetch e merge già fatti dall'hook: non rifarli."


FILE_MSG = {"principale": "docs/ULTIMO-MESSAGGIO.md", "parallela": "docs/ULTIMO-MESSAGGIO-PARALLELA.md"}


def ruolo_salvato():
    try:
        with open(os.path.join(git("rev-parse", "--absolute-git-dir"), "scorta-ruolo"), encoding="utf-8") as f:
            ruolo = f.read().strip()
        return ruolo if ruolo in FILE_MSG else ""
    except OSError:
        return ""


CHIUSA = "Scorta a parte chiusa"  # come in scorta.py (C276)
A_PARTE_GIORNI = 7  # i rami a parte più vecchi non si guardano più: sarebbero solo lenti da scaricare


def tutte_le_scorte(ramo):
    # C352: le scorte del ramo su GitHub (ls-remote, un solo giro di rete); se GitHub non risponde, almeno i due nomi
    # vecchi (scorta-<ruolo>/<ramo>) si provano col fetch, come prima
    vive = scorte_vive(ramo)
    if vive is None:
        vive = [{"nome": f"scorta-{r}/{ramo}", "ruolo": r, "data": "", "id": "", "ramo": ramo, "ferma": ""} for r in FILE_MSG]
    return vive


def limite_giorni(giorni):
    return (datetime.date.today() - datetime.timedelta(days=giorni)).strftime("%Y%m%d")


def a_parte_recente(v):
    return bool(v["ferma"]) and v["ferma"].split("-")[2] >= limite_giorni(A_PARTE_GIORNI)


def scarica(voci):
    # C352: le scorte da guardare in UN solo fetch (prima uno per ramo: 112 rami = 59 s, oltre il limite dell'hook, e
    # l'avviso di avvio andava perso). Salta quelle già scaricate allo stesso commit (sha di ls-remote); se il fetch
    # insieme fallisce (un ramo cancellato nel frattempo) riprova uno per uno. Ritorna i nomi scaricati.
    locali = {}
    for riga in git("for-each-ref", "--format=%(objectname) %(refname)", "refs/remotes/origin/").splitlines():
        sha, _, rif = riga.partition(" ")
        locali[rif.removeprefix("refs/remotes/origin/")] = sha
    pronte = {v["nome"] for v in voci if v.get("sha") and locali.get(v["nome"]) == v["sha"]}
    da_scaricare = [v["nome"] for v in voci if v["nome"] not in pronte]
    for i in range(0, len(da_scaricare), 200):  # a gruppi: la riga di comando non cresce senza fine
        gruppo = da_scaricare[i:i + 200]
        if run("fetch", "-q", "origin", *[f"+refs/heads/{n}:refs/remotes/origin/{n}" for n in gruppo], timeout=40)[0] == 0:
            pronte.update(gruppo)
            continue
        for n in gruppo:
            if tempo_finito():
                break
            if ok("fetch", "-q", "origin", f"+refs/heads/{n}:refs/remotes/origin/{n}"):
                pronte.add(n)
    return pronte


def scorte_a_parte(vive, scaricate):
    # C276: rami a parte delle scorte ferme (…/<ramo>-ferma-<AAAAMMGG-HHMMSS>-<xxxx>) degli ultimi 7 giorni, non chiusi
    # da scorta.py e non ancora nel ramo. C352: di tutte le scorte (per sessione e nome vecchio), già scaricate.
    trovate = []
    for v in vive:
        if not a_parte_recente(v):
            continue
        nome = v["nome"]
        if nome not in scaricate or \
                git("log", "-1", "--format=%s", f"origin/{nome}").startswith(CHIUSA) or \
                ok("merge-base", "--is-ancestor", f"origin/{nome}", "HEAD"):
            continue
        trovate.append((v["ruolo"], f"origin/{nome}", "SCORTA A PARTE", "salvata a parte mentre la scorta era ferma, C276", v["id"]))
    return trovate


def driver_scorta():
    # C352 (soluzione 4): i file della scorta (ultimo messaggio, registro, ultima risposta) all'unione prendono la
    # versione della scorta, che è sempre la più nuova: zero conflitti. L'attributo sta in .gitattributes; il driver
    # va detto a ogni contenitore (git config locale), e senza di esso git fa il merge normale.
    ok("config", "merge.scorta.driver", "cp %B %A")


def di_chi(remoto, mia, chi=""):
    # C352: di quale sessione è una scorta: dal nome (scorta per sessione) o dal messaggio del commit (nome vecchio).
    # Stessa sessione = riavvio del contenitore (unire); un'altra = la precedente della catena chiusa di colpo (unire)
    # oppure una chat ancora attiva (E97: non unire): lo decide chi legge, con docs/CHI-FA-COSA.md.
    chi = chi or sessione_della_scorta(remoto)
    if not chi:
        return ""
    if not mia:
        return f" È della sessione {chi}."
    if chi == mia:
        return f" È della tua sessione ({chi}: riavvio): uniscila."
    return (f" È della sessione {chi}, non della tua: uniscila solo se quella sessione è chiusa (la precedente della "
            f"tua catena, o fermata di colpo); se è una chat ancora attiva (docs/CHI-FA-COSA.md) NON unirla (E97).")


def controlla_scorta(mia=""):
    # Scorta automatica (scorta.py): se la sessione prima si è fermata di colpo, il lavoro più nuovo è lì.
    # C148: una scorta per chat; si unisce solo la propria (E97: il lavoro dell'altra chat attiva non si unisce).
    # In un contenitore nuovo il ruolo non si sa ancora (lo dice il prompt di avvio, che arriva dopo): le dico tutte e due.
    # C352: «mia» = id corto di questa sessione (dallo stdin dell'hook): dice se una scorta «nuovo» è sua o di un'altra.
    ramo = git("symbolic-ref", "-q", "--short", "HEAD")
    if not ramo:
        return ""
    tutte = tutte_le_scorte(ramo)
    if mia:  # C352: così la prima scorta di questa sessione ha già il nome nuovo (data: quella già su GitHub, o oggi)
        data = next((v["data"] for v in tutte if v["id"] == mia and not v["ferma"]), "") or oggi()
        gitdir = git("rev-parse", "--absolute-git-dir")
        if gitdir:
            scrivi_sessione(gitdir, mia, data)
    limite = limite_giorni(SCORTE_GIORNI)
    vecchie = 0
    da_guardare = []
    for v in tutte:
        if v["ferma"]:
            if a_parte_recente(v):
                da_guardare.append(v)
            continue
        if v["data"] and v["data"] < limite and v["id"] != mia:
            vecchie += 1  # chat ferme da settimane: niente fetch (col tempo sarebbero decine, C352)
            continue
        da_guardare.append(v)
    scaricate = scarica(da_guardare)
    trovate = []
    for v in tutte:
        nome = v["nome"]
        if not v["ferma"] and nome in scaricate and not ok("merge-base", "--is-ancestor", f"origin/{nome}", "HEAD"):
            trovate.append((v["ruolo"], f"origin/{nome}", "SCORTA", "sessione chiusa di colpo?", v["id"]))
    trovate += scorte_a_parte(tutte, scaricate)
    mio = ruolo_salvato()
    avvisi = []
    ignorate = []  # C352: scorte già nel ramo o superate (il ramo ha cambiato dopo le stesse righe): unirle non porta niente
    vive = []
    non_guardate = []  # C352: tempo dell'hook quasi finito: meglio dirlo che farsi fermare e perdere tutto l'avviso
    for voce in trovate:
        if tempo_finito():
            non_guardate.append(voce[1])
            continue
        esito = lavoro_della_scorta(voce[1])
        (vive if esito == "nuovo" else ignorate).append((voce, esito))
    if len(da_guardare) > len(scaricate) and tempo_finito():
        non_guardate.append(f"{len(da_guardare) - len(scaricate)} non scaricate")
    trovate = [v for v, _ in vive]
    for ruolo, remoto, tipo, perche, chi in trovate:
        if mio and ruolo != mio:
            avvisi.append(f"Notizia: anche {remoto} (chat {ruolo}) ha lavoro non nel ramo: non è tuo, non unirla (E97).")
        else:
            avvisi.append(f"{tipo} della chat {ruolo}: {remoto} ha lavoro non presente nel ramo ({perche})"
                          + ("." if mio else f" Se sei la chat {ruolo}:") + f" git diff --stat HEAD {remoto}, poi "
                          f"git merge {remoto}, git push e leggi {FILE_MSG[ruolo]}." + di_chi(remoto, mia, chi))
    if trovate and not mio:
        avvisi.append("Ruolo: parallela se il prompt di avvio dice «Sei la chat parallela», sennò principale. "
                      "La scorta dell'altra chat NON si unisce (E97): al massimo git show <scorta>:<suo file del messaggio>.")
    if ignorate:  # C352: poche righe anche con decine di rami vecchi (prima ~3k token di elenco)
        nomi = [f"{v[1]} ({e})" for v, e in ignorate]
        elenco = ", ".join(nomi) if len(nomi) <= 4 else ", ".join(nomi[:3]) + f" e altre {len(nomi) - 3}"
        avvisi.append(f"Scorte senza lavoro nuovo (merge simulato: già nel ramo o superate), da NON unire: {elenco}.")
    if vecchie:
        avvisi.append(f"Scorte di sessioni ferme da più di {SCORTE_GIORNI} giorni non guardate: {vecchie} (pulizia mensile).")
    if non_guardate:
        elenco = ", ".join(non_guardate[:3]) + (f" e altre {len(non_guardate) - 3}" if len(non_guardate) > 3 else "")
        avvisi.append(f"ATTENZIONE scorte: tempo dell'avvio finito, non controllate: {elenco}. Rifai il controllo a mano: "
                      f"python3 .claude/hooks/avvio-check.py < /dev/null")
    return " ".join(avvisi)


FILE_REGISTRO = {"principale": "docs/MESSAGGI-MARIO.md", "parallela": "docs/MESSAGGI-MARIO-PARALLELA.md"}  # come scorta.py
VOCE = re.compile(r"^## (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) · \S+$")


def messaggi_dopo_handoff():
    # C291 (Mario 27/10 «1ok»): i messaggi di Mario arrivati dopo l'ultimo commit delle consegne (alla sessione chiusa,
    # o durante un riavvio) sono nel registro di scorta.py: li conto dal ramo e dalla scorta non ancora unita.
    ramo = git("symbolic-ref", "-q", "--short", "HEAD")
    quando = git("log", "-1", "--format=%ct", "HEAD", "--", "docs/PASSAGGIO-CONSEGNE.md")
    if not ramo or not quando:
        return ""
    try:
        from zoneinfo import ZoneInfo
        dal = datetime.datetime.fromtimestamp(int(quando), ZoneInfo("Europe/Rome")).strftime("%Y-%m-%d %H:%M")
    except Exception:
        return ""
    mio = ruolo_salvato()
    avvisi = []
    for ruolo, file in FILE_REGISTRO.items():
        if mio and ruolo != mio:
            continue
        voci = 0  # la scorta contiene il registro del ramo più i messaggi nuovi: vale la fonte più lunga
        # C352: tutte le scorte di questo ruolo scaricate da controlla_scorta (per sessione e nome vecchio)
        scorte = [r for r in git("for-each-ref", "--format=%(refname)", "refs/remotes/origin/").splitlines()
                  if (v := leggi_nome_scorta(r, ramo)) and v["ruolo"] == ruolo and not v["ferma"]]
        for rif in ("HEAD", *scorte):
            rc, testo = run("show", f"{rif}:{file}")
            if rc == 0:
                voci = max(voci, sum(1 for riga in testo.splitlines() if (m := VOCE.match(riga)) and m.group(1) >= dal))
        if voci:
            avvisi.append(f"MESSAGGI DOPO L'HANDOFF della chat {ruolo}: {voci} dal {dal} (ultimo commit delle "
                          f"consegne) in {file}, dopo il merge della propria scorta: leggili TUTTI prima di lavorare "
                          f"e confrontali con docs/DA-FARE.md (C291).")
    return " ".join(avvisi)


def promesse_aperte():
    # C331 (Mario 29/10 «perché fai le cose a metà»): le promesse a Mario non chiuse con la prova, dal registro.
    hook = os.path.join(os.path.dirname(os.path.abspath(__file__)), "promesse.py")
    if not os.path.isfile(hook):
        return ""
    try:
        r = subprocess.run([sys.executable, "-I", hook, "--aperte", "--breve"], capture_output=True, text=True, timeout=10)
        return r.stdout.strip()
    except Exception:
        return ""


def aspetta_mario():
    # C369 (Mario 31/10 ~23:10): le righe di «## 0. Aspetta Mario» restano all'handoff; la sessione nuova parte SEMPRE
    # verde (E245, Mario 1/11 01:45: il colore dice cosa fa adesso), le ricorda a Mario e cancella le sveglie della
    # vecchia (solo quelle legate alla vecchia, mai delle altre chat).
    try:
        with open(os.path.join(CWD or ".", "docs", "DA-FARE.md"), encoding="utf-8") as f:
            testo = f.read()
    except OSError:
        return ""
    righe, dentro = [], False
    for riga in testo.split("\n"):
        if riga.startswith("## "):
            dentro = riga.startswith("## 0. Aspetta Mario")
        elif dentro and riga.lstrip().startswith("- "):
            righe.append(riga)
    principale = sum(1 for r in righe if re.search(r"(?:^|[\s·])(?:#|⭐|Principale )\d+\b", r))
    vecchia = ""
    try:
        with open(os.path.join(CWD or ".", "docs", "PASSAGGIO-CONSEGNE.md"), encoding="utf-8") as f:
            m = re.search(r"^Sessione attuale: #\d+ \(dopo la #\d+ `(session_\w+)`", f.read(), re.M)
        vecchia = f" (principale: `{m.group(1)}`)" if m else ""
    except OSError:
        pass
    testa = (f"ASPETTA MARIO (C369): {len(righe)} righe in «## 0. Aspetta Mario» di docs/DA-FARE.md (della principale "
             f"«Principale NN»: {principale}; delle altre catene: {len(righe) - principale}): all'avvio titolo VERDE della tua "
             "catena anche con righe tue, con « ❔» dopo il numero se ce ne sono della tua catena (E245, C423: verde finché lavori; giallo con « ❓» solo quando ti fermi ad aspettare Mario); "
             "si tolgono solo quando Mario risponde; ricordale a Mario in fondo al primo messaggio, una riga "
             "ciascuna (C347; la domanda intera solo quando Mario scrive, E179); le foto e i video delle righe della "
             "tua catena li rimandi con lo strumento dei file nello stesso messaggio (E240, E247; quelli delle altre "
             "catene li rimanda la loro chat): "
             + " | ".join(r.strip()[2:][:160] for r in righe[:8]) + ". " if righe else
             "ASPETTA MARIO (C369): nessuna riga in «## 0. Aspetta Mario» di docs/DA-FARE.md: titolo verde della tua catena. ")
    stop = [r.strip()[2:][:120] for r in righe if "🛑" in r]
    if stop:
        # C422 (Mario 02/11): le domande decisive si ricordano PER PRIME e nessuno ci lavora sopra prima della risposta.
        testa = (f"🛑 DECISIVE (C422): {len(stop)} domande decisive aspettano Mario: ricordale PER PRIME, una riga ciascuna; "
                 "niente codice che dipende dalla risposta, né sveglie che ci lavorano sopra (solo lavori indipendenti): "
                 + " | ".join(stop[:5]) + ". " + testa)
    return (testa + "SVEGLIE: con list_triggers cancella (delete_trigger) solo quelle con persistent_session_id = la "
            f"sessione vecchia della tua chat{vecchia}, mai quelle delle altre chat; rifai tue (send_later) quelle che "
            "servono ancora, UNA per lavoro (kit 30.7).")


# La versione del kit e delle Preferenze la controlla kit-check.py (C250, kit v23), che parte subito dopo.
if __name__ == "__main__":
    try:
        dati = {} if sys.stdin.isatty() else json.load(sys.stdin)  # C352: l'hook SessionStart porta session_id
    except Exception:  # noqa: BLE001
        dati = {}
    mia = sessione_di(dati if isinstance(dati, dict) else {})  # C352: variabile del cloud, sennò stdin
    # C352: kit-check.py parte insieme (gli hook dello stesso evento girano in parallelo) e aspetta questo segno per
    # leggere i file DOPO il merge (P47: «Kit 29.1» letto prima del merge, il ramo era già al 29.2)
    segno = os.path.join(CWD or ".", ".git", IN_CORSO)
    try:
        open(segno, "w").close()
    except OSError:
        segno = ""
    try:
        avvisi = ["Leggi docs/ERRORI.md (diario degli errori) prima di lavorare. I «Prossimi passi» delle consegne sono "
                  "un piano da ricontrollare, non un ordine: prima di ognuno l'occhio critico (già fatto? doppione? un file "
                  "o una voce che fa già quel lavoro? C333).", ripara(), controlla_scorta(mia), messaggi_dopo_handoff(),
                  promesse_aperte(), aspetta_mario()]
        driver_scorta()
    finally:
        if segno:
            try:
                os.remove(segno)
            except OSError:
                pass
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                             "additionalContext": " ".join(a for a in avvisi if a)}}))
    sys.exit(0)
