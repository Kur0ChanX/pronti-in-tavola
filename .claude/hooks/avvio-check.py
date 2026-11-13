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
import datetime, json, os, re, subprocess, sys, time, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:  # C352: merge simulato; sessione; scorte per sessione (scorta-<ruolo>-<data>-<id>/<ramo>)
    from scorta import (lavoro_della_scorta, sessione_corta, sessione_di, sessione_della_scorta, scorte_vive,
                        leggi_nome_scorta, scrivi_sessione, oggi, catena_di, SCORTE_GIORNI, VOCE, ora_voce)
except Exception:  # noqa: BLE001
    SCORTE_GIORNI = 14
    VOCE = re.compile(r"^## (\d{4}-\d{2}-\d{2} ~?\d{2}:\d[\dx]) · (\S.*)$")  # come scorta.py (C469 fase 1)

    def ora_voce(quando):
        return str(quando).replace("~", "").replace("x", "0")

    def catena_di(base, mia):
        return None

    def lavoro_della_scorta(scorta, head="HEAD", scadenza=None):
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
RIAVVIO = "avvio-riavvio"  # C469 fase 2: segno per kit-check.py (stesso nome là)
GIA_PARTITA = {"si": False}  # C469 fase 2: la scorta di questa sessione è già su GitHub = riavvio del contenitore
INIZIO = time.time()
# C352: l'hook ha 90 s (settings.json); se li supera viene fermato e tutto l'avviso di avvio si perde (P47: 112 fetch,
# 65 s). Oltre TEMPO_MAX i controlli lenti si saltano e l'avviso lo dice.
TEMPO_MAX = 45
# C469 A9: tetto duro di ogni comando git dell'avvio (dopo restano messaggi, promesse e Aspetta Mario, ~5 s) e tetto del
# fetch del ramo (prima 4 prove × 20 s + 19 s di attese = 99 s: l'hook veniva fermato e l'avviso si perdeva).
TEMPO_DURO = 75
TETTO_RIPARA = 40
# Risparmio 13 (10/11): l'hook è stato fermato a 90 s lo stesso (contenitore con il ramo di 6 giorni prima, 513 scorte su
# GitHub) e l'avviso intero si è perso: a TEMPO_HOOK secondi un allarme ferma il passo in corso e l'avviso esce con quello
# che c'è, cosa manca e come rifarlo. AVVIO_TEMPO_HOOK solo per le prove (tools/test-scorta.py).
TEMPO_HOOK = max(1, int(os.environ.get("AVVIO_TEMPO_HOOK") or 80))
FASE = {"ora": ""}


class Scaduto(BaseException):
    """Tetto dell'hook raggiunto (BaseException: gli «except Exception» dei passi non la fermano)."""


def _scaduto(*_):
    raise Scaduto()


def resto(tetto=TEMPO_DURO):
    return tetto - (time.time() - INIZIO)


def run(*args, timeout=20):
    timeout = min(timeout, resto())  # C469 A9
    if timeout < 1:
        return 1, ""
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
    scaricato = False
    for attesa in (0, 3, 6, 10):  # la rete può non essere pronta appena parte il contenitore
        if resto(TETTO_RIPARA) - attesa < 5:  # C469 A9: tutte le prove dentro i 40 s
            break
        time.sleep(attesa)
        if run("fetch", "-q", "origin", ramo, timeout=min(20, resto(TETTO_RIPARA)))[0] == 0:
            scaricato = True
            break
    if not scaricato:
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
    vive = scorte_vive(ramo, timeout=max(1, min(30, resto())))  # C469 A9
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
    # C469 B6: i registri dei messaggi di Mario si uniscono voce per voce (con «cp» si perdevano quelli dell'altra chat)
    ok("config", "merge.registro.driver", 'python3 -I .claude/hooks/scorta.py unisci-registro %O %A %B')
    # C469 fase 1: l'archivio dei messaggi di Mario (un file al mese, senza tetto)
    ok("config", "merge.archivio.driver", 'python3 -I .claude/hooks/scorta.py unisci-archivio %O %A %B')
    # E325: .claude/settings.json unito chiave per chiave, sempre valido (un conflitto lì spegneva i divieti)
    ok("config", "merge.impostazioni.driver", 'python3 -I tools/unisci-json.py %O %A %B')


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


def scrivi_elenco(righe):
    """C469 A1: elenco lungo in .git/avvio-scorte.txt (fuori dal contesto; si legge solo se serve)."""
    try:
        percorso = os.path.join(git("rev-parse", "--absolute-git-dir"), "avvio-scorte.txt")
        with open(percorso, "w", encoding="utf-8") as f:
            f.write("\n".join(righe) + "\n")
        return percorso
    except Exception:  # noqa: BLE001
        return "non scritto"


def controlla_scorta(mia=""):
    # Scorta automatica (scorta.py): se la sessione prima si è fermata di colpo, il lavoro più nuovo è lì.
    # C148: una scorta per chat; si unisce solo la propria (E97: il lavoro dell'altra chat attiva non si unisce).
    # In un contenitore nuovo il ruolo non si sa ancora (lo dice il prompt di avvio, che arriva dopo): le dico tutte e due.
    # C352: «mia» = id corto di questa sessione (dallo stdin dell'hook): dice se una scorta «nuovo» è sua o di un'altra.
    ramo = git("symbolic-ref", "-q", "--short", "HEAD")
    if not ramo:
        return ""
    tutte = tutte_le_scorte(ramo)
    GIA_PARTITA["si"] = bool(mia) and any(v["id"] == mia for v in tutte)
    if mia:  # C352: così la prima scorta di questa sessione ha già il nome nuovo (data: quella già su GitHub, o oggi)
        data = next((v["data"] for v in tutte if v["id"] == mia and not v["ferma"]), "") or oggi()
        gitdir = git("rev-parse", "--absolute-git-dir")
        if gitdir:
            scrivi_sessione(gitdir, mia, data)
    limite = limite_giorni(SCORTE_GIORNI)
    vecchie = 0
    da_guardare = []
    # C450 (kit 35.4, proposta 8): se questa sessione è scritta in docs/CHI-FA-COSA.md, si guardano solo le scorte della
    # sua catena (le altre non si uniscono comunque, E97): una riga le conta; le elenca la Bacheca del mattino.
    catena = catena_di(CWD or os.getcwd(), mia)
    mie = set(catena["ids"]) | {mia} if catena else None
    altre_catene = 0  # C450: scorte di altre catene (nome diverso da «altre» di C455, che è l'elenco delle altre sessioni)
    for v in tutte:
        if mie is not None and v["id"] and v["id"] not in mie:
            altre_catene += 1
            continue
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
    con_messaggi = []  # PT E85: scorte che non si uniscono (conflitti nelle consegne) ma con messaggi di Mario fuori dal ramo
    non_guardate = []  # C352: tempo dell'hook quasi finito: meglio dirlo che farsi fermare e perdere tutto l'avviso
    for voce in trovate:
        if tempo_finito():
            non_guardate.append(voce[1])
            continue
        esito = lavoro_della_scorta(voce[1], scadenza=INIZIO + TEMPO_DURO)
        if resto() < 1:  # C469 A9: tempo finito durante il merge simulato, l'esito non è sicuro
            non_guardate.append(voce[1])
            continue
        (vive if esito == "nuovo" else con_messaggi if esito == "messaggi" else ignorate).append((voce, esito))
    if len(da_guardare) > len(scaricate) and tempo_finito():
        non_guardate.append(f"{len(da_guardare) - len(scaricate)} non scaricate")
    trovate = [v for v, _ in vive]
    notizie = []  # C469 A1: scorte dell'altro ruolo in una riga sola
    altre = []  # C455: scorte di altre sessioni in un solo avviso (prima ~600 caratteri ripetuti per ognuna: 8 = ~1,3k token)
    for ruolo, remoto, tipo, perche, chi in trovate:
        if mio and ruolo != mio:
            notizie.append(f"{remoto} (chat {ruolo})")
        elif mia and chi and chi != mia:
            altre.append(f"{remoto} (chat {ruolo}, della sessione {chi}, non della tua)")
        else:
            avvisi.append(f"{tipo} della chat {ruolo}: {remoto} ha lavoro non presente nel ramo ({perche})"
                          + ("." if mio else f" Se sei la chat {ruolo}:") + f" git diff --stat HEAD {remoto}, poi "
                          f"git merge {remoto}, git push e leggi {FILE_MSG[ruolo]}." + di_chi(remoto, mia, chi))
    if notizie:
        elenco = ", ".join(notizie[:3]) + (f" e altre {len(notizie) - 3} (elenco intero: {scrivi_elenco(notizie)})" if len(notizie) > 3 else "")
        avvisi.append(f"Notizia: anche {elenco} " + ("ha lavoro non nel ramo: non è tuo, non unirla (E97)." if len(notizie) == 1
                      else "hanno lavoro non nel ramo: non sono tue, non unirle (E97)."))
    if altre:  # C469 A1: oltre 3 (sessione non in docs/CHI-FA-COSA.md: fino a ~30 = ~8k token) le 3 più nuove + file
        altre.sort(key=lambda s: (re.search(r"-(\d{8})-", s) or re.search("", s)).group(0), reverse=True)
        mostrate = "; ".join(altre[:3])
        if len(altre) > 3:
            mostrate += f" e altre {len(altre) - 3} (elenco intero: {scrivi_elenco(altre)})"
        avvisi.append(f"SCORTE con lavoro non presente nel ramo ({len(altre)}, prima le più nuove): " + mostrate + ". Una si unisce solo "
                      "se è della tua chat (principale o parallela) e quella sessione è chiusa (la precedente della tua catena, o "
                      "fermata di colpo): git diff --stat HEAD <scorta>, poi git merge <scorta>, git push e leggi "
                      f"{FILE_MSG.get('principale', '')} (principale) o {FILE_MSG.get('parallela', '')} (parallela); se è una chat "
                      "ancora attiva (docs/CHI-FA-COSA.md) NON unirla (E97).")
    if trovate and not mio:
        avvisi.append("Ruolo: parallela se il prompt di avvio dice «Sei la chat parallela», sennò principale. "
                      "La scorta dell'altra chat NON si unisce (E97): al massimo git show <scorta>:<suo file del messaggio>.")
    for (ruolo, remoto, _tipo, _perche, chi), _e in con_messaggi:  # PT E85 (#82, C158): prima erano «vecchia», da NON unire
        avvisi.append(f"MESSAGGI DI MARIO FUORI DAL RAMO (PT E85): {remoto} (chat {ruolo}, sessione {chi or '?'}) NON si unisce "
                      "(conflitti nelle consegne), ma ha messaggi di Mario che il ramo non ha. Prendi SOLO quelli: "
                      f"python3 -I .claude/hooks/scorta.py prendi-messaggi {remoto} ; poi commit e push di docs/MESSAGGI-MARIO*.md "
                      "e archivio/messaggi-mario/, e leggili INTERI prima dei Prossimi passi.")
    if ignorate:  # C352: poche righe anche con decine di rami vecchi (prima ~3k token di elenco)
        nomi = [f"{v[1]} ({e})" for v, e in ignorate]
        elenco = ", ".join(nomi) if len(nomi) <= 4 else ", ".join(nomi[:3]) + f" e altre {len(nomi) - 3}"
        avvisi.append(f"Scorte senza lavoro nuovo (merge simulato: già nel ramo o superate), da NON unire: {elenco}.")
    if altre_catene:
        avvisi.append(f"Scorte di altre catene non guardate: {altre_catene} (la tua catena «{catena['nome']}» è in docs/CHI-FA-COSA.md; "
                      "non si uniscono, E97; le elenca la Bacheca del mattino).")
    if vecchie:
        avvisi.append(f"Scorte di sessioni ferme da più di {SCORTE_GIORNI} giorni non guardate: {vecchie} (pulizia mensile).")
    if altre_catene or vecchie or ignorate:  # C450 (kit 35.4, proposta 1): le scorte di sessioni chiuse già nel ramo non servono più
        avvisi.append("Dopo l'unione della tua scorta: `python3 -I tools/pulisci-scorte.py --unite --cancella` (C450: toglie solo le "
                      "etichette delle scorte di sessioni chiuse già tutte nel ramo; i commit restano; mai la tua né di una chat aperta).")
    if non_guardate:
        elenco = ", ".join(non_guardate[:3]) + (f" e altre {len(non_guardate) - 3}" if len(non_guardate) > 3 else "")
        avvisi.append(f"ATTENZIONE scorte: tempo dell'avvio finito, non controllate: {elenco}. Rifai il controllo a mano: "
                      f"python3 .claude/hooks/avvio-check.py < /dev/null")
    return " ".join(avvisi)


FILE_REGISTRO = {"principale": "docs/MESSAGGI-MARIO.md", "parallela": "docs/MESSAGGI-MARIO-PARALLELA.md"}  # come scorta.py


def consegne_di(ruolo, mia):
    """C469 fase 1 (rapporto 11 voce 1): (file delle consegne, id della catena o None) da cui contare i messaggi dopo
    il passaggio. Principale: PASSAGGIO-CONSEGNE.md. Parallela: le consegne della SUA catena (CHI-FA-COSA.md); se la
    catena non si trova, le consegne parallele più VECCHIE fra quelle salvate negli ultimi 14 giorni (meglio contare di
    più). Prima per tutti si contava dal file della Principale: Mario scrive alla Fix chiusa, la Principale consegna
    dopo, la Fix nuova non aveva l'avviso."""
    if ruolo != "parallela":
        return "docs/PASSAGGIO-CONSEGNE.md", None
    c = catena_di(CWD or ".", mia)
    if c:
        nome = re.sub(r"[^A-Za-z0-9]", "", unicodedata.normalize("NFKD", c["nome"]).encode("ascii", "ignore").decode()).upper()
        f = f"docs/CONSEGNE-PARALLELA-{nome}.md"
        if git("log", "-1", "--format=%ct", "HEAD", "--", f):
            return f, set(c["ids"]) - {mia}
    file = sorted(set(git("log", "--since=14.days", "--format=", "--name-only", "HEAD", "--",
                          "docs/CONSEGNE-PARALLELA-*.md").split()))
    piu_vecchio = min(file, key=lambda f: int(git("log", "-1", "--format=%ct", "HEAD", "--", f) or 0), default="")
    return piu_vecchio, None


def messaggi_dopo_handoff(mia=""):
    # C291 (Mario 27/10 «1ok»): i messaggi di Mario arrivati dopo l'ultimo commit delle consegne (alla sessione chiusa,
    # o durante un riavvio) sono nel registro di scorta.py: li conto dal ramo e dalla scorta non ancora unita.
    ramo = git("symbolic-ref", "-q", "--short", "HEAD")
    if not ramo:
        return ""
    mio = ruolo_salvato()
    avvisi = []
    for ruolo, file in FILE_REGISTRO.items():
        if mio and ruolo != mio:
            continue
        consegne, ids = consegne_di(ruolo, mia)
        quando = git("log", "-1", "--format=%ct", "HEAD", "--", consegne) if consegne else ""
        try:
            from zoneinfo import ZoneInfo
            dal = datetime.datetime.fromtimestamp(int(quando), ZoneInfo("Europe/Rome")).strftime("%Y-%m-%d %H:%M")
        except Exception:
            continue
        voci = 0  # la scorta contiene il registro del ramo più i messaggi nuovi: vale la fonte più lunga
        # C352: tutte le scorte di questo ruolo scaricate da controlla_scorta (per sessione e nome vecchio)
        scorte = [r for r in git("for-each-ref", "--format=%(refname)", "refs/remotes/origin/").splitlines()
                  if (v := leggi_nome_scorta(r, ramo)) and v["ruolo"] == ruolo and not v["ferma"]]
        for rif in ("HEAD", *scorte):
            rc, testo = run("show", f"{rif}:{file}")
            if rc == 0:
                voci = max(voci, sum(1 for riga in testo.splitlines() if (m := VOCE.match(riga)) and ora_voce(m.group(1)) >= dal
                                     and (not ids or (m.group(2).split() or [''])[0] in ids)))  # C469: della mia catena
        if voci:
            avvisi.append(f"MESSAGGI DOPO L'HANDOFF della chat {ruolo}: {voci} dal {dal} (ultimo commit di "
                          f"{consegne}{', sessioni della mia catena' if ids else ''}) in {file}, dopo il merge della propria scorta: leggili TUTTI prima di lavorare "
                          f"e confrontali con docs/DA-FARE.md (C291).")
    return " ".join(avvisi)


def parole_intere(mia=""):
    # PT E84 (Mario 13/11 «deve leggere tutto quello che scrivo nei passaggi di consegna, perché ho paura che
    # accorciandolo si perda qualche senso»): le consegne sono un riassunto; i messaggi INTERI della sessione
    # precedente della mia catena stanno nel registro. L'hook dice le righe esatte da leggere prima dei Prossimi passi.
    mio = ruolo_salvato() or "principale"
    consegne, _ids = consegne_di(mio, mia)
    rc, testo = run("show", f"HEAD:{consegne}") if consegne else (1, "")
    rc2, registro = run("show", f"HEAD:{FILE_REGISTRO.get(mio, '')}")
    if rc or rc2:
        return ""
    prima = next((c for c in (sessione_corta(x) for x in re.findall(r"session_[A-Za-z0-9]+", testo)) if c and c != mia), "")
    if not prima:
        return ""
    def pezzi_di(testo):
        righe = testo.splitlines()
        inizi = [i for i, r in enumerate(righe) if VOCE.match(r)]
        pezzi = []
        for n, i in enumerate(inizi):
            if (VOCE.match(righe[i]).group(2).split() or [""])[0] == prima:
                pezzi.append((i + 1, inizi[n + 1] if n + 1 < len(inizi) else len(righe)))
        return pezzi
    pezzi = pezzi_di(registro)
    # PT E85 (C158, Mario 13/11 21:20 «facciamo della precedente»): anche dalla SUA scorta, che ha i messaggi scritti
    # dopo l'ultimo merge della scorta o dopo il passaggio (13/11 #82: «1 messaggio» invece di 3, 2 solo nella scorta)
    scorta = ([s for s in sorted(git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin/").splitlines())
               if s.startswith(f"origin/scorta-{mio}-") and f"-{prima}/" in s] or [""])[-1]
    rc3, suo = run("show", f"{scorta}:{FILE_REGISTRO[mio]}") if scorta else (1, "")
    pezzi_scorta = pezzi_di(suo) if not rc3 else []
    fuori = len(pezzi_scorta) - len(pezzi)
    if fuori > 0:
        da, a = pezzi_scorta[0][0], pezzi_scorta[-1][1]
        dove = (f"nella sua scorta (righe {da}-{a}; {fuori} non ancora nel ramo): leggili TUTTI interi (git show "
                f"{scorta}:{FILE_REGISTRO[mio]} | sed -n {da},{a}p) e portali nel ramo (python3 -I .claude/hooks/scorta.py "
                f"prendi-messaggi {scorta}, commit e push)")
        pezzi = pezzi_scorta
    elif pezzi:
        da, a = pezzi[0][0], pezzi[-1][1]
        dove = (f"in {FILE_REGISTRO[mio]} righe {da}-{a}: leggili TUTTI interi (sed -n {da},{a}p {FILE_REGISTRO[mio]})")
    else:
        return ""
    return (f"PAROLE INTERE DI MARIO (PT E84): la sessione precedente ({prima}) ha {len(pezzi)} messaggi di Mario {dove} PRIMA dei "
            "Prossimi passi; le consegne e i riassunti non bastano. Lavoro a metà ereditato (patch, foto, piano): prima "
            "scrivi a Mario «Ho capito che vuoi:» (una riga per richiesta, con le sue parole fra «») e aspetta il suo ok; "
            "prima delle foto spunta ogni richiesta.")


def promesse_aperte(riavvio=False):
    # C331 (Mario 29/10 «perché fai le cose a metà»): le promesse a Mario non chiuse con la prova, dal registro.
    hook = os.path.join(os.path.dirname(os.path.abspath(__file__)), "promesse.py")
    if not os.path.isfile(hook):
        return ""
    try:
        r = subprocess.run([sys.executable, "-I", hook, "--aperte", "--breve"], capture_output=True, text=True, timeout=10)
    except Exception:
        return ""
    n = re.search(r"PROMESSE APERTE a Mario: (\d+)", r.stdout)
    if riavvio and n:  # C469 fase 2: al riavvio solo il numero (l'elenco è già nel primo avvio)
        return f"PROMESSE APERTE a Mario: {n.group(1)}."
    return r.stdout.strip()


def aspetta_mario(riavvio=False):
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
    if riavvio:  # C469 fase 2: al riavvio le righe e basta (titolo e sveglie li hai già sistemati al primo avvio)
        testa = (f"ASPETTA MARIO: {len(righe)} righe: " + " | ".join(r.strip()[2:][:160] for r in righe[:8]) + ". "
                 if righe else "ASPETTA MARIO: nessuna riga. ")
        stop = [r.strip()[2:][:120] for r in righe if "🛑" in r]
        return (f"🛑 DECISIVE (C422): {len(stop)}: " + " | ".join(stop[:5]) + ". " if stop else "") + testa
    testa = (f"ASPETTA MARIO (C369, skill `domande`): {len(righe)} righe in «## 0. Aspetta Mario» di docs/DA-FARE.md "
             f"(Principale: {principale}; altre catene: {len(righe) - principale}): titolo VERDE della tua catena con « ❓N» "
             "(N = risposte alle righe tue, C454, E245); in fondo al primo messaggio la sola riga «⚠️ Aspettano te: N · nomi corti» "
             "(C347, E179, C469); la domanda intera quando Mario scrive, una per messaggio con foto e video (E240, E247): "
             + " | ".join(r.strip()[2:][:160] for r in righe[:8]) + ". " if righe else
             "ASPETTA MARIO (C369): nessuna riga in «## 0. Aspetta Mario» di docs/DA-FARE.md: titolo verde della tua catena. ")
    stop = [r.strip()[2:][:120] for r in righe if "🛑" in r]
    if stop:
        # C422 (Mario 02/11): le domande decisive si ricordano PER PRIME e nessuno ci lavora sopra prima della risposta.
        testa = (f"🛑 DECISIVE (C422): {len(stop)} domande decisive aspettano Mario: ricordale PER PRIME, una riga ciascuna; "
                 "niente codice che dipende dalla risposta, né sveglie che ci lavorano sopra (solo lavori indipendenti): "
                 + " | ".join(stop[:5]) + ". " + testa)
    return (testa + f"SVEGLIE (E248): prima rifai tue (send_later, una per lavoro) quelle che servono ancora, poi cancella solo "
            f"quelle con persistent_session_id = la sessione vecchia della tua chat{vecchia}; `send_later` bloccato (8 di 8) → non cancellarle.")


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
    riavvio = False
    avvisi, tempi = [], []
    passi = ["ramo", "scorte", "messaggi di Mario", "parole intere", "Aspetta Mario", "promesse"]

    def fase(nome, funzione, *argomenti):
        FASE["ora"], t0 = nome, time.time()
        risultato = funzione(*argomenti)
        tempi.append(f"{nome} {time.time() - t0:.0f} s")
        return risultato

    driver_scorta()  # prima di tutto: 3 righe di config locale; a fine avvio i comandi git possono essere già scaduti
    try:
        import signal
        signal.signal(signal.SIGALRM, _scaduto)
        signal.alarm(TEMPO_HOOK)
    except (ImportError, AttributeError, ValueError):  # senza SIGALRM (Windows) resta il tetto dei comandi git
        pass
    try:
        avvisi.append(fase("ramo", ripara))
        avvisi.append(fase("scorte", controlla_scorta, mia))
        # C469 fase 2 (rapporto 14 voce 6): riavvio del contenitore = scorta di questa sessione già su GitHub, o «resume».
        # La conversazione c'è ancora: solo i dati di adesso, via le frasi fisse (~900 token a ogni riavvio).
        riavvio = GIA_PARTITA["si"] or (isinstance(dati, dict) and dati.get("source") == "resume")
        frase = ("RIAVVIO del contenitore, stessa sessione: le regole d'avvio le hai già; qui solo i dati di adesso."
                 if riavvio else
                 "Leggi docs/ERRORI.md (diario degli errori) prima di lavorare. I «Prossimi passi» delle consegne sono "
                 "un piano da ricontrollare, non un ordine: prima di ognuno l'occhio critico (già fatto? doppione? un file "
                 "o una voce che fa già quel lavoro? C333).")
        # C469 fase 3 (rapporto 11 voce 6): oltre ~10.000 caratteri Claude Code mostra solo l'inizio dell'avviso: prima
        # ATTENZIONE (ramo, scorta), poi messaggi di Mario e decisive, la frase fissa in fondo (al riavvio resta in testa)
        avvisi += [fase("messaggi di Mario", messaggi_dopo_handoff, mia), fase("parole intere", parole_intere, mia), fase("Aspetta Mario", aspetta_mario, riavvio),
                   fase("promesse", promesse_aperte, riavvio)]
        avvisi.insert(0, frase) if riavvio else avvisi.append(frase)
        if time.time() - INIZIO > TEMPO_MAX:  # per il rodaggio: quale passo è lento
            avvisi.append(f"Avvio lento ({time.time() - INIZIO:.0f} s): {', '.join(tempi)}.")
    except Scaduto:
        fatti = len(tempi)
        mancano = ", ".join(passi[fatti + 1:])
        avvisi.insert(0, f"ATTENZIONE avvio lento: oltre {TEMPO_HOOK} s ({', '.join(tempi + [FASE['ora'] + ' fermato'])})"
                         f"{'; non controllati: ' + mancano if mancano else ''}. Prima di lavorare rilancia: "
                         "python3 -I .claude/hooks/avvio-check.py < /dev/null (la seconda volta è veloce: i rami sono già "
                         "scaricati); poi leggi docs/ERRORI.md e le consegne.")
    finally:
        try:
            signal.alarm(0)
        except Exception:  # noqa: BLE001
            pass
        marca = os.path.join(CWD or ".", ".git", RIAVVIO)  # prima di togliere il segno: kit-check.py lo legge dopo
        try:
            if riavvio:
                open(marca, "w").close()
            elif os.path.exists(marca):
                os.remove(marca)
        except OSError:
            pass
        if segno:
            try:
                os.remove(segno)
            except OSError:
                pass
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                             "additionalContext": " ".join(a for a in avvisi if a)}}))
    sys.exit(0)
