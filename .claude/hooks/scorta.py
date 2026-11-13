#!/usr/bin/env python3
# Scorta automatica (D27, autorizzata da Mario il 10/10/2026): se i token finiscono di colpo, su GitHub c'è già tutto.
#   scorta.py msg  (UserPromptSubmit): salva l'ultimo messaggio di Mario in .git/scorta-msg.md (fuori dal progetto).
#                  Poi fa subito anche la scorta: un «salva» scritto quando il limite è finito arriva comunque su GitHub.
#   scorta.py tool (PostToolUse di Edit/Write/Bash): scorta anche a metà risposta, al massimo ogni 2 minuti
#                  (Mario 17/10: se il limite arriva a metà lavoro, la scorta di fine risposta non parte mai).
#   scorta.py stop (Stop): fotografa il lavoro (anche non salvato) con l'ultimo messaggio in docs/ULTIMO-MESSAGGIO.md
#                  e lo manda su GitHub nel ramo scorta-<ruolo>-<AAAAMMGG>-<id>/<ramo> (C352, sotto), senza toccare il ramo di
#                  lavoro né l'indice vero.
#   scorta.py ruolo [principale|parallela]: scrive (o dice) il ruolo di questa chat, se il prompt di avvio non l'ha detto.
# Ogni scorta contiene HEAD e la scorta prima: il push è sempre in avanti, mai forzato. Niente cambiato = niente push.
# C148 (Mario 23/10 «1»): una scorta per chat. Con una sola scorta le due chat si rubavano il push (non in avanti =
# scartato in silenzio) e all'avvio non si sapeva di chi era il lavoro (E97). Il ruolo resta in .git/scorta-ruolo:
# lo decide il prompt «[AVVIO] Sei la chat parallela …» (sennò principale), o la trascrizione dopo un riavvio.
# Per riprendere: git fetch origin <scorta> && git merge origin/<scorta> (lo segnala avvio-check.py, col nome).
# C252 (E154, Mario 23/10 «avvia la correzione»): la scorta di un ALTRO contenitore non si copre mai. Contenitore nuovo
# (niente scorta locale) con la scorta di GitHub non ancora unita al ramo → niente scorta; push rifiutato da una punta
# estranea → niente push (prima si univa col proprio albero e il lavoro dell'altro spariva dai file). In tutti e due i
# casi .git/scorta-ferma e, al messaggio dopo, l'avviso «SCORTA FERMA» con il merge da fare.
# C276 (Mario 24/10 «1» e «sì scorta.py»): ferma non vuol dire più senza scorta (#304: ~1 ora persa). Finché è ferma
# il lavoro va su un ramo a parte solo di questo contenitore, <scorta>-ferma-<AAAAMMGG-HHMMSS>-<xxxx>:
# nessun altro ci scrive, quindi il push è sempre in avanti e non copre il lavoro di nessuno. Dopo il primo push
# riuscito della scorta normale un commit «Scorta a parte chiusa» lo chiude (anche quello di un contenitore morto,
# una volta unito nel ramo); avvio-check.py segnala i rami a parte aperti degli ultimi 7 giorni.
# C352 (Mario 30/10 «1 ok»): una scorta per SESSIONE, non per ruolo: scorta-<ruolo>-<AAAAMMGG>-<id corto>/<ramo>
# (data del primo salvataggio, id = i primi 12 caratteri della sessione (E226: con 8 era uguale per tutte le sessioni del giorno); .git/scorta-sessione tiene «<id> <data>»).
# Prima la scorta-parallela era UNA per tutte le chat parallele (Atlante, Inventario, Handoff): ogni parallela nuova
# trovava il lavoro dell'altra, si fermava e lavorava «a parte» (un ramo -ferma- in più al giorno, 112 conflitti di
# codice vecchio il 29/10). Ora nessuno scrive nella scorta di un altro; all'avvio avvio-check.py elenca TUTTE le scorte
# vive del ramo (scorte_vive) e dice di chi sono. Senza id della sessione resta il nome vecchio scorta-<ruolo>/<ramo>,
# che si legge ancora. Le scorte di chat ferme da più di SCORTE_GIORNI non si guardano più all'avvio (una riga le conta).
import datetime, glob, json, os, re, shutil, subprocess, sys, time

CWD = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
RUOLI = ("principale", "parallela")
# ogni chat il suo file: unendo le due scorte nel ramo comune il messaggio non va in conflitto
FILE_MSG = {"principale": "docs/ULTIMO-MESSAGGIO.md", "parallela": "docs/ULTIMO-MESSAGGIO-PARALLELA.md"}
# C291 (Mario 27/10 «1ok»): registro degli ultimi messaggi di Mario, non solo l'ultimo (due di fila o uno durante un
# riavvio: il primo si perdeva). Una voce «## AAAA-MM-GG HH:MM · <sessione>» + testo; lo legge anche avvio-check.py.
FILE_REGISTRO = {"principale": "docs/MESSAGGI-MARIO.md", "parallela": "docs/MESSAGGI-MARIO-PARALLELA.md"}
REGISTRO_MAX = 40
# I20 (Mario 27/10 «Cambia file scorta autorizzo ma fallo bene con attenzione»): allo Stop anche l'inizio dell'ultima
# risposta di Claude, segreti tolti, per la riga «💬 Ti ha scritto» delle chat sul sito dell'Atlante.
FILE_RISPOSTA = {"principale": "docs/ULTIMA-RISPOSTA.md", "parallela": "docs/ULTIMA-RISPOSTA-PARALLELA.md"}
RISPOSTA_MAX = 600  # caratteri: basta per capire di cosa parla, non diventa una copia della chat
CODA_TRASCRIZIONE = 2_000_000  # byte letti dalla fine della trascrizione (le risposte lunghe con strumenti pesano)
# C469 fase 1: una forma sola delle testate, anche di quelle scritte a mano («~11:0x», «· 01Ab… (girato alla …)»), usata
# anche da avvio-check.py e tools/consegne.py: prima 3 lettori su 4 le prendevano per testo della voce di prima.
VOCE = re.compile(r"^## (\d{4}-\d{2}-\d{2} ~?\d{2}:\d[\dx]) · (\S.*)$")


def ora_voce(quando):
    # chiave per ordinare e confrontare le ore: «2026-11-09 ~11:0x» → «2026-11-09 11:00»
    return str(quando).replace("~", "").replace("x", "0")
TESTA_REGISTRO = ("# Messaggi di Mario (ultimi {n}, ora italiana)\n\n"
                  "Scritto da `.claude/hooks/scorta.py` (C291): arriva nel ramo unendo la scorta. Non si modifica a mano.\n")
# C352: «Sei la chat parallela» vale su QUALSIASI riga dell'[AVVIO] (la P44 l'aveva sulla seconda: ruolo sbagliato), e vale
# anche un avvio che comincia con «[AVVIO] Chat parallela …».
AVVIO_PARALLELA = re.compile(r"^\[AVVIO\](?:\s*Chat parallela\b|.*?\bSei la (?:chat|sessione) parallela\b)", re.I | re.S)
FILE_SCORTA = tuple(FILE_MSG.values()) + tuple(FILE_REGISTRO.values()) + tuple(FILE_RISPOSTA.values())
# C469 fase 1 (Mario 04/11 «ho paura di perdere cose che ho scritto»): archivio di TUTTI i messaggi di Mario, senza tetto,
# un file al mese per tutte le chat. Lo scrive la scorta (copia locale in .git/scorta-archivio.md), si unisce voce per
# voce (driver «archivio»: nome nuovo, un contenitore col codice vecchio lascia il conflitto invece di tagliare a 40).
# Mai letto all'avvio: si cerca con git grep. Il registro (ultimi 40) resta per l'avvio e le consegne.
ARCHIVIO = "archivio/messaggi-mario"
TESTA_ARCHIVIO = ("# Archivio dei messaggi di Mario · {mese} (tutte le chat, ora italiana)\n\n"
                  "Scritto da `.claude/hooks/scorta.py` (C469), senza tetto: non si legge all'avvio, si cerca con "
                  "`git grep`. Non si modifica a mano.\n")
DRIVER = {"registro": "python3 -I .claude/hooks/scorta.py unisci-registro %O %A %B",
          "archivio": "python3 -I .claude/hooks/scorta.py unisci-archivio %O %A %B",
          "impostazioni": "python3 -I tools/unisci-json.py %O %A %B"}  # E325: settings.json sempre valido


def file_archivio(quando):
    # «2026-11-09 22:07» → archivio/messaggi-mario/2026-11.md
    return f"{ARCHIVIO}/{quando[:7]}.md"


def configura_driver():
    # C469 B6 e fase 1: i driver vanno detti a ogni contenitore (git config locale), anche a quelli avviati prima
    for nome, comando in DRIVER.items():
        if not git("config", "--get", f"merge.{nome}.driver"):
            run("config", f"merge.{nome}.driver", comando)


def sessione_corta(sessione):
    # C352: id della sessione del cloud (session_01… nelle consegne, cse_01… nella variabile): stesso id, prefisso diverso.
    # E226: 12 caratteri (con 8 le sessioni di un giorno erano uguali); in locale l'id è un uuid: resta il primo blocco.
    return (re.match(r"[A-Za-z0-9]*", re.sub(r"^(session|cse)_", "", str(sessione or ""))).group(0))[:12]


CHI_FA_COSA = "docs/CHI-FA-COSA.md"


def catene(base):
    """C450 (kit 35.4): le catene della tabella «## Catene» di docs/CHI-FA-COSA.md: [{nome, numero, segni, ids, attiva,
    chiusa}], ids = id corti (12) di tutte le sessioni scritte nella riga (la prima è quella aperta), attiva = quella
    aperta o '' se la catena è chiusa. [] se il file manca o la tabella non c'è."""
    try:
        with open(os.path.join(base, CHI_FA_COSA), encoding="utf-8") as f:
            testo = f.read()
    except OSError:
        return []
    out, dentro = [], False
    for riga in testo.splitlines():
        if riga.startswith("## "):
            dentro = riga.startswith("## Catene")
            continue
        if not dentro or not riga.startswith("| ") or riga.startswith("|---") or riga.startswith("| Catena "):
            continue
        celle = [c.strip() for c in riga.strip().strip("|").split("|")]
        if len(celle) < 5:
            continue
        ids = [sessione_corta(x) for x in re.findall(r"session_([A-Za-z0-9]{12,})", celle[4])]
        chiusa = len(celle) > 5 and celle[5] not in ("", "—", "-")
        out.append({"nome": celle[0], "numero": celle[3], "segni": celle[2].split(), "ids": ids,
                    "attiva": "" if chiusa or not ids else ids[0], "chiusa": chiusa})
    return out


def sessioni_attive(base):
    """C450: id corti delle sessioni aperte di tutte le catene (quelle che possono ancora scrivere una scorta)."""
    return {c["attiva"] for c in catene(base) if c["attiva"]}


def catena_di(base, mia):
    """C450: la catena (riga di «## Catene») che contiene la sessione `mia`, o None (sessione aperta a mano, non ancora scritta)."""
    return next((c for c in catene(base) if mia and mia in c["ids"]), None)


def sessione_di(dati):
    """C352 (P48): id corto della sessione. Prima la variabile ufficiale del cloud CLAUDE_CODE_REMOTE_SESSION_ID (è la
    sessione scritta nelle consegne e in CHI-FA-COSA, stabile anche se il contenitore riparte); sennò il session_id dello
    stdin dell'hook (in cloud è l'id locale del CLI, es. acf049a1-…: non si ritrova in nessun documento; in locale è l'unico)."""
    return sessione_corta(os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID") or (dati or {}).get("session_id"))


def sessione_della_scorta(rif):
    """C352: id corto della sessione che ha fatto l'ultima scorta di quel ramo (dal messaggio del commit), o ''."""
    m = re.search(r"\bsessione (\w+)\)", git("log", "-1", "--format=%s", rif))
    return m.group(1) if m else ""


def _sessione_file(gitdir):
    # .git/scorta-sessione: «<id corto> <AAAAMMGG>» (la data del primo salvataggio; manca finché non serve)
    try:
        with open(os.path.join(gitdir, "scorta-sessione"), encoding="utf-8") as f:
            parti = f.read().split()
    except OSError:
        parti = []
    return (parti[0] if parti else ""), (parti[1] if len(parti) > 1 and re.fullmatch(r"\d{8}", parti[1]) else "")


def sessione_salvata(gitdir):
    return _sessione_file(gitdir)[0]


def data_salvata(gitdir):
    return _sessione_file(gitdir)[1]


def scrivi_sessione(gitdir, chi, data=""):
    with open(os.path.join(gitdir, "scorta-sessione"), "w", encoding="utf-8") as f:
        f.write(f"{chi} {data}".strip() + "\n")


def oggi():
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("Europe/Rome")).strftime("%Y%m%d")
    except Exception:
        return datetime.datetime.utcnow().strftime("%Y%m%d")


SCORTE_GIORNI = 14  # C352: le scorte per sessione più vecchie (dalla data nel nome) non si guardano più all'avvio
NOME_SCORTA = re.compile(r"scorta-(principale|parallela)(?:-(\d{8})-([A-Za-z0-9]{1,12}))?/(.+?)((?:-ferma-)\d{8}-\d{6}-[0-9a-f]+)?")


def leggi_nome_scorta(nome, ramo=None):
    """C352: «scorta-<ruolo>[-<data>-<id>]/<ramo>[-ferma-…]» → dict(ruolo, data, id, ramo, ferma) o None.
    Nome vecchio (senza data e id) → data '' e id ''. Con ramo, solo le scorte di quel ramo."""
    m = NOME_SCORTA.fullmatch(str(nome or "").removeprefix("refs/heads/").removeprefix("refs/remotes/origin/"))
    if not m or (ramo and m.group(4) != ramo):
        return None
    return {"nome": m.group(0), "ruolo": m.group(1), "data": m.group(2) or "", "id": m.group(3) or "",
            "ramo": m.group(4), "ferma": m.group(5) or ""}


def scorte_vive(ramo, timeout=30):
    """C352: le scorte di un ramo su GitHub (ls-remote: solo i nomi, niente oggetti): [dict come leggi_nome_scorta +
    sha], dalla più recente (data nel nome; il nome vecchio è il più vecchio). None se GitHub non risponde."""
    rc, out = run("ls-remote", "--heads", "origin", "scorta-*", timeout=timeout)
    if rc:
        return None
    vive = []
    for riga in out.splitlines():
        parti = riga.split("\t")
        voce = len(parti) == 2 and leggi_nome_scorta(parti[1], ramo)
        if voce:
            vive.append(dict(voce, sha=parti[0]))
    vive.sort(key=lambda v: (v["data"], v["ferma"]), reverse=True)
    return vive


def nome_scorta(gitdir, ruolo, ramo):
    """C352: il ramo di scorta di questa sessione: scorta-<ruolo>-<AAAAMMGG>-<id>/<ramo>; senza id il nome vecchio.
    La data è quella del primo salvataggio della sessione: dopo un riavvio in un contenitore nuovo si ritrova su
    GitHub (stesso id), così la scorta continua sullo stesso ramo."""
    chi = sessione_salvata(gitdir)
    if not chi:
        return f"scorta-{ruolo}/{ramo}"
    data = data_salvata(gitdir)
    if not data:
        for v in scorte_vive(ramo) or []:
            if v["id"] == chi and v["ruolo"] == ruolo and not v["ferma"]:
                data = v["data"]
                break
        data = data or oggi()
        scrivi_sessione(gitdir, chi, data)
    return f"scorta-{ruolo}-{data}-{chi}/{ramo}"


def lavoro_della_scorta(scorta, head="HEAD", scadenza=None):
    """C352: cosa porterebbe al ramo l'unione di una scorta: «nuovo» (lavoro vero da unire), «niente» (già tutto nel
    ramo, o solo i file della scorta stessa), «vecchia» (il ramo ha cambiato dopo le stesse righe: unirla farebbe solo
    conflitti di codice vecchio, come la scorta-parallela del 29/10 con 112 segni), «messaggi» (vecchia, ma con messaggi
    di Mario che il ramo non ha: non si unisce, si prendono solo quelli con `prendi-messaggi`, PT E85). Merge simulato:
    non tocca niente.
    C469 A9: «scadenza» (ora assoluta, la dà l'hook d'avvio): nessun comando la supera; con meno di 15 s niente scavo."""
    def tempo(t):
        return t if scadenza is None else max(1, min(t, scadenza - time.time()))
    rc, out = run("merge-tree", "--write-tree", "--name-only", head, scorta, timeout=tempo(60))
    for _ in range(3):
        # C352: il contenitore in cloud è un clone poco profondo (ultimi 50 commit): senza la base comune git rifiuta
        # («unrelated histories», rc 128) e la scorta passava per «nuovo». Si scava la storia (mai si accorcia).
        if rc != 128 or run("rev-parse", "--is-shallow-repository")[1] != "true":
            break
        ramo = git("symbolic-ref", "-q", "--short", "HEAD")
        if not ramo or (scadenza is not None and scadenza - time.time() < 15) or \
                run("fetch", "-q", "--deepen=200", "origin", ramo, timeout=tempo(120))[0]:
            break
        rc, out = run("merge-tree", "--write-tree", "--name-only", head, scorta, timeout=tempo(60))
    righe = out.splitlines()
    albero = (righe or [""])[0].strip()
    if rc not in (0, 1) or not albero:
        return "nuovo"  # non so dire: meglio chiedere il merge che perdere lavoro
    # C469 fase 1: conflitti SOLO nei file della scorta o nell'archivio (contenitore senza i driver: due chat che
    # scrivono lo stesso mese) non fanno «vecchia»: decidono i messaggi (sennò un messaggio di Mario resterebbe fuori)
    conflitti = righe[1:righe.index("")] if "" in righe else righe[1:]
    if rc == 1 and any(f not in FILE_SCORTA and not f.startswith(ARCHIVIO + "/") for f in conflitti):
        # PT E85 (#82, 13/11): conflitto nelle consegne + messaggi di Mario che il ramo non ha = «messaggi», mai
        # «vecchia» (prima l'avvio diceva di NON unirla e i messaggi delle 21:18 restavano fuori dal registro)
        return "messaggi" if messaggi_nuovi(scorta, head) else "vecchia"
    file = [f for f in git("diff", "--name-only", head, albero).splitlines()
            if f not in FILE_SCORTA and not f.startswith(ARCHIVIO + "/")]  # l'archivio lo guarda messaggi_nuovi
    return "nuovo" if file or messaggi_nuovi(scorta, head) else "niente"
# "[AVVIO]" = prompt di avvio scritto dalla sessione che chiude (#58): non è un messaggio di Mario
# "<cross-session-message" = messaggio di un'altra sessione (es. un altro progetto): non è un messaggio di Mario
# "<agent-message" = rapporto finale di un aiutante (strumento Agent, #73): non è un messaggio di Mario
AVVISI_DI_SISTEMA = ("<task-notification", "<system-reminder", "<wake ", "[SYSTEM NOTIFICATION", "[AVVIO]",
                     "<cross-session-message", "<agent-message", "[MESSAGE FROM NON-USER SOURCE")
# C469 rapporto 12 voce 8: l'avvio (Mario a volte ci aggiunge parole sue) e i messaggi girati da un'altra sessione vanno
# interi nell'ARCHIVIO con l'etichetta, mai nel registro né nell'ultimo messaggio (non sono messaggi di Mario)
GIRATO = re.compile(r'^(?:\[MESSAGE FROM NON-USER SOURCE[^\n]*\n)?\s*<cross-session-message from-session="([^"]*)"[^>]*>'
                    r'\n?(.*?)(?:</cross-session-message>\s*)?\Z', re.S)
GIRATO_TESTA = re.compile(r"\A\s*The following was sent by another Claude Code session.*?(?:\n\s*\n|\Z)", re.S)
GIRATO_MAX = 20_000  # caratteri: un messaggio fra sessioni può arrivare a 64 KiB
# C469 rapporto 12 voce 6: la domanda a cui Mario risponde («1», «vai come consiglio») in coda alla voce dell'archivio
RISPONDEVA = "> Rispondeva a:"
DOMANDA_MAX = 2_000
INIZIO_DOMANDE = re.compile(r"^[\s>*#_]*❓", re.M)  # come domande-chiare.py: il blocco inizia a capo
RIGA_CORTA = re.compile(r"^[\s>*_]*(?:⚠️\s*)?Aspettano te\s*:.*$\n?", re.M)
CODA_DOMANDA = re.compile(r"\n*^> Rispondeva a:.*\Z", re.M | re.S)
# avviso del riavvio del contenitore (E104, 25/10 P16): da solo prendeva il posto del messaggio di Mario; attaccato a un
# messaggio vero si toglie e resta il messaggio
RIAVVIO = re.compile(r"\s*This session's worker process was restarted\.[^\n]*", re.I)
# E29 (#58–#59): un segreto incollato in chat non deve mai arrivare su GitHub con la scorta
TOLTO = "[segreto tolto dalla scorta]"
SEGRETI = [re.compile(p, re.S) for p in (
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?(?:-----END [A-Z ]*PRIVATE KEY-----|\Z)",  # chiavi private
    r"https?://script\.google(?:usercontent)?\.com/\S+",  # app web di Apps Script (cartella Drive)
    r"AIza[0-9A-Za-z_\-]{20,}",  # chiavi Google/Firebase
    r"\b(?:sk|pk|rk)-[A-Za-z0-9_\-]{16,}",  # chiavi API (Anthropic, OpenAI, Stripe…)
    r"\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}",  # gettoni GitHub
    r"\bxox[abprs]-[A-Za-z0-9\-]{10,}",  # gettoni Slack
    r"\bAKIA[0-9A-Z]{16}\b",  # chiavi AWS
    r"(?i)\b(?:key|token|secret|password|pass|pwd|auth|sig|signature)=[^\s&]+",  # valori segreti negli indirizzi
)]
# sequenze lunghe di lettere e cifre insieme (gettoni sconosciuti); le parole normali non arrivano a 32 caratteri
GETTONE = re.compile(r"[A-Za-z0-9_\-]{32,}")
NOMI_SEGRETI = re.compile(r"KEY|TOKEN|SECRET|PASSWORD|_URL$", re.I)
FERMA = "-ferma-"  # C276: <scorta>-ferma-<AAAAMMGG-HHMMSS>-<xxxx>, il ramo a parte della scorta ferma
CHIUSA = "Scorta a parte chiusa"  # inizio del commit che chiude un ramo a parte (lo legge anche avvio-check.py)


def togli_segreti(testo):
    for nome, valore in os.environ.items():  # i valori segreti dell'ambiente, se Mario li incolla in chat
        if NOMI_SEGRETI.search(nome) and len(valore) >= 12 and valore in testo:
            testo = testo.replace(valore, TOLTO)
    for p in SEGRETI:
        testo = p.sub(TOLTO, testo)
    return GETTONE.sub(lambda m: TOLTO if re.search(r"\d", m.group()) and re.search(r"[A-Za-z]", m.group())
                       else m.group(), testo)


def run(*args, env=None, inp=None, timeout=30):
    try:
        r = subprocess.run(["git", *args], capture_output=True, text=True, timeout=timeout, cwd=CWD,
                           env=env, input=inp)
        return r.returncode, r.stdout.strip()
    except Exception:
        return 1, ""


def git(*args, **kw):
    rc, out = run(*args, **kw)
    return out if rc == 0 else ""


def ora_italiana():
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("Europe/Rome")).strftime("%d/%m/%Y %H:%M")
    except Exception:
        return datetime.datetime.utcnow().strftime("%d/%m/%Y %H:%M UTC")


def avvio_o_girato(testo):
    """C469 rapporto 12 voce 8: (etichetta, testo da archiviare) per l'avvio e i messaggi girati; None per il resto."""
    if testo.startswith("[AVVIO]"):
        return "(avvio)", testo
    m = GIRATO.match(testo)
    if not m:
        return None
    corpo = GIRATO_TESTA.sub("", m.group(2)).strip()
    if len(corpo) > GIRATO_MAX:
        corpo = corpo[:GIRATO_MAX] + " …[tagliato]"
    return f"(girato da {sessione_corta(m.group(1)) or '?'})", corpo


def prendi_domanda(gitdir):
    """C469 rapporto 12 voce 6: il blocco ❓ dell'ultima risposta (salvato allo Stop), una volta sola: poi si cancella."""
    percorso = os.path.join(gitdir, "scorta-domanda.md")
    try:
        with open(percorso, encoding="utf-8") as f:
            domanda = f.read().strip()
        os.remove(percorso)
    except OSError:
        return ""
    return domanda


def salva_msg(dati, gitdir, ruolo="principale"):
    testo = RIAVVIO.sub("", str(dati.get("prompt") or "")).strip()
    try:
        speciale = avvio_o_girato(testo)
        if speciale and speciale[1]:
            scrivi_nell_archivio(gitdir, f"{sessione_di(dati) or '?'} {speciale[0]}",
                                 togli_segreti(speciale[1]))
    except Exception:
        pass  # l'archivio dei messaggi girati non deve mai fermare la scorta
    if not testo or testo.startswith(AVVISI_DI_SISTEMA):
        return  # avvisi automatici (GitHub, promemoria, prompt di avvio): non sono messaggi di Mario
    testo = togli_segreti(testo)
    with open(os.path.join(gitdir, "scorta-msg.md"), "w", encoding="utf-8") as f:
        f.write(f"# Ultimo messaggio di Mario ({ora_italiana()} ora italiana)\n\n{testo}\n")
    aggiungi_al_registro(gitdir, ruolo, testo, sessione_di(dati), prendi_domanda(gitdir))


def testo_assistente(voce):
    # testo scritto da Claude in una riga della trascrizione (niente strumenti né pensieri)
    if not isinstance(voce, dict) or voce.get("type") != "assistant":
        return ""
    contenuto = (voce.get("message") or {}).get("content")
    if isinstance(contenuto, str):
        return contenuto.strip()
    if not isinstance(contenuto, list):
        return ""
    return "\n".join(str(p.get("text") or "") for p in contenuto
                     if isinstance(p, dict) and p.get("type") == "text").strip()


def ultima_risposta(dati):
    # l'ultimo testo di Claude: dal campo dello Stop se c'è, sennò dalla fine della trascrizione
    testo = dati.get("last_assistant_message")
    if isinstance(testo, str) and testo.strip():
        return testo.strip()
    percorso = dati.get("transcript_path")
    if not isinstance(percorso, str) or not percorso:
        return ""
    try:
        with open(percorso, "rb") as f:
            f.seek(0, os.SEEK_END)
            f.seek(max(0, f.tell() - CODA_TRASCRIZIONE))
            righe = f.read().decode("utf-8", "replace").splitlines()
    except OSError:
        return ""
    for riga in reversed(righe):
        try:
            testo = testo_assistente(json.loads(riga))
        except ValueError:
            continue  # anche la prima riga tagliata a metà
        if testo:
            return testo
    return ""


def salva_risposta(dati, gitdir):
    testo = RIAVVIO.sub("", ultima_risposta(dati)).strip()
    if not testo:
        return  # niente testo nuovo: resta la risposta di prima
    testo = togli_segreti(testo)  # prima di tagliare: un segreto tagliato a metà non verrebbe più riconosciuto
    # le domande a Mario stanno in fondo (blocco «❓»): a parte, così il sito sa che la chat aspetta lui
    i = testo.find("❓")
    domande = testo[i:].split("───")[0].strip() if i >= 0 else ""
    corpo = testo[:i].rstrip(" \n─*") if i >= 0 else testo

    def taglia(t, n):
        t = t.strip()
        if len(t) <= n:
            return t
        corto = t[:n]
        return (corto.rsplit(None, 1)[0] if " " in corto else corto) + " …"
    # C469 rapporto 12 voce 6: il blocco ❓ (a capo, senza la riga corta «Aspettano te») per la prossima voce di Mario
    # nell'archivio; una risposta senza domande lo cancella (Mario allora non sta rispondendo a una domanda)
    inizio = INIZIO_DOMANDE.search(testo)
    blocco = RIGA_CORTA.sub("", testo[inizio.start():].split("───")[0]).strip() if inizio else ""
    percorso = os.path.join(gitdir, "scorta-domanda.md")
    if blocco:
        with open(percorso, "w", encoding="utf-8") as f:
            f.write(taglia(blocco, DOMANDA_MAX) + "\n")
    elif os.path.exists(percorso):
        os.remove(percorso)
    corpo, domande = taglia(corpo, RISPOSTA_MAX), taglia(domande, RISPOSTA_MAX)
    with open(os.path.join(gitdir, "scorta-risposta.md"), "w", encoding="utf-8") as f:
        f.write(f"# Ultima risposta di Claude ({ora_italiana()} ora italiana)\n\n{corpo}\n"
                + (f"\n## Domande a Mario\n\n{domande}\n" if domande else ""))


def leggi_voci(testo):
    # [(quando, sessione, testo)] dal registro; le righe prima della prima voce (la testata) non contano
    voci, voce = [], None
    for riga in str(testo or "").splitlines():
        m = VOCE.match(riga)
        if m:
            voce = [m.group(1), m.group(2), []]
            voci.append(voce)
        elif voce:
            voce[2].append(riga)
    return [(q, ses, "\n".join(r).strip()) for q, ses, r in voci]


def scrivi_voci(voci, tetto=REGISTRO_MAX, testa=None):
    # tetto 0 = tutte (archivio); testa None = quella del registro
    voci = voci[-tetto:] if tetto else voci
    corpo = "".join(f"\n## {q} · {ses}\n{t}\n" for q, ses, t in voci)
    return (TESTA_REGISTRO.format(n=REGISTRO_MAX) if testa is None else testa) + corpo


def senza_domanda(testo):
    """C469 rapporto 12 voce 6: il testo di Mario senza «> Rispondeva a: …» (che sta solo nell'archivio)."""
    return CODA_DOMANDA.sub("", str(testo or "")).rstrip()


def chiave(v):
    # stessa voce = stessa ora, sessione e testo di Mario (con o senza la domanda dell'archivio): niente doppi
    return v[0], v[1], senza_domanda(v[2])


def unisci_voci(*testi):
    # voci di più registri o archivi, senza doppi (chiave), in ordine di ora (stabile); fra la voce del registro e la
    # stessa dell'archivio con la domanda a cui rispondeva resta la più lunga
    indice, voci = {}, []
    for t in testi:
        for v in leggi_voci(t):
            k = chiave(v)
            if k not in indice:
                indice[k] = len(voci)
                voci.append(v)
            elif len(v[2]) > len(voci[indice[k]][2]):
                voci[indice[k]] = v
    voci.sort(key=lambda v: ora_voce(v[0]))
    return voci


def scrivi_archivio(voci):
    mese = voci[0][0][:7] if voci else ""
    return scrivi_voci(voci, tetto=0, testa=TESTA_ARCHIVIO.format(mese=mese))


def unisci_registri(*testi):
    """C469 B6: unione di registri voce per voce, come aggiungi_al_registro (stessa voce = stessa ora, sessione e testo),
    in ordine di ora, le ultime REGISTRO_MAX. È il driver «registro» di .gitattributes: prima vinceva la scorta intera
    (cp %B %A) e i messaggi entrati intanto nel ramo da un'altra chat sparivano (09/11 19:11 e 19:16, rimessi a mano)."""
    return scrivi_voci(unisci_voci(*testi))


def driver_registro(base, nostro, loro, archivio=False):
    """git merge, driver «registro» (%O %A %B): scrive l'unione in %A. Uscita 0 = unito; 1 = git lascia il conflitto
    (mai un'unione a metà che perde voci). archivio=True: driver «archivio», senza tetto."""
    try:
        testi = []
        for percorso in (nostro, loro):
            with open(percorso, encoding="utf-8") as f:
                testi.append(f.read())
        voci = unisci_voci(*testi)
        unito = scrivi_archivio(voci) if archivio else scrivi_voci(voci)
        attese = max(len(leggi_voci(t)) for t in testi)
        if len(leggi_voci(unito)) < (attese if archivio else min(REGISTRO_MAX, attese)):
            return 1
        with open(nostro, "w", encoding="utf-8") as f:
            f.write(unito)
        return 0
    except Exception:
        return 1


def prendi_messaggi(scorta):
    """PT E85 (Mario 13/11 «vai come consiglio», C158): porta nella cartella di lavoro SOLO i messaggi di Mario di una
    scorta che non si unisce (conflitti nelle consegne): registri e archivio voce per voce, come il driver; il resto della
    scorta resta fuori. Il commit lo fa chi lo chiama. Ritorna le voci nuove (contro HEAD)."""
    radice = git("rev-parse", "--show-toplevel") or CWD
    nuove = len(messaggi_nuovi(scorta))
    for f in list(FILE_REGISTRO.values()) + git("ls-tree", "--name-only", scorta, f"{ARCHIVIO}/").splitlines():
        rc, loro = run("show", f"{scorta}:{f}")
        if rc:
            continue
        percorso = os.path.join(radice, f)
        if not os.path.isfile(percorso):
            os.makedirs(os.path.dirname(percorso), exist_ok=True)
            with open(percorso, "w", encoding="utf-8") as h:
                h.write(loro + "\n")
            continue
        copia = os.path.join(git("rev-parse", "--absolute-git-dir") or os.path.join(radice, ".git"), "scorta-loro.md")
        with open(copia, "w", encoding="utf-8") as h:
            h.write(loro + "\n")
        try:
            if driver_registro("", percorso, copia, archivio=f.startswith(ARCHIVIO + "/")):
                raise RuntimeError(f"unione non riuscita: {f} (niente cambiato)")
        finally:
            os.remove(copia)
        # PT E85 bis (#82): anche la copia locale della scorta, sennò la scorta dopo li toglie di nuovo dal ramo
        gitdir = git("rev-parse", "--absolute-git-dir") or os.path.join(radice, ".git")
        locale = os.path.join(gitdir, "scorta-registro.md")
        if os.path.isfile(locale) and f == FILE_REGISTRO.get(ruolo_chat(gitdir, {}), ""):
            driver_registro("", locale, percorso)
    return nuove


def messaggi_nuovi(scorta, head="HEAD"):
    """C469 B6: voci del registro della scorta che il ramo non ha e più nuove della voce più vecchia del ramo (quelle
    più vecchie sono uscite per il tetto delle REGISTRO_MAX, ma erano arrivate). Una scorta che porta solo un messaggio
    di Mario NON è «niente»: va unita, sennò il messaggio non entra mai nel registro del ramo."""
    nuove = []
    for f in FILE_REGISTRO.values():
        rc, suo = run("show", f"{scorta}:{f}")
        if rc:
            continue
        ramo = leggi_voci(git("show", f"{head}:{f}"))
        piu_vecchia, gia = min((ora_voce(v[0]) for v in ramo), default=""), {chiave(v) for v in ramo}
        nuove += [v for v in leggi_voci(suo) if chiave(v) not in gia and ora_voce(v[0]) >= piu_vecchia]
    # C469 fase 1: l'archivio non ha tetto, il confronto è esatto (anche i messaggi più vecchi della prima voce del ramo);
    # una voce che il ramo ha nei registri ma non ancora nell'archivio non è nuova (la porta la prossima scorta)
    # (confronto con la chiave: la domanda attaccata nell'archivio, rapporto 12 voce 6, non fa una voce nuova)
    nei_registri = {chiave(v) for f in FILE_REGISTRO.values() for v in leggi_voci(git("show", f"{head}:{f}"))}
    for f in git("ls-tree", "--name-only", scorta, f"{ARCHIVIO}/").splitlines():
        gia = {chiave(v) for v in leggi_voci(git("show", f"{head}:{f}"))} | nei_registri | {chiave(v) for v in nuove}
        nuove += [v for v in leggi_voci(git("show", f"{scorta}:{f}")) if chiave(v) not in gia]
    return nuove


def archivio_della_scorta(gitdir, head, prima):
    """C469 fase 1: {percorso nel ramo: testo} dei mesi dei miei messaggi (.git/scorta-archivio.md, mai tagliato),
    uniti all'archivio del ramo (HEAD) e a quello dell'ultima scorta (contenitore riavviato: niente perso)."""
    try:
        with open(os.path.join(gitdir, "scorta-archivio.md"), encoding="utf-8") as f:
            mie = leggi_voci(f.read())
    except OSError:
        return {}
    # anche le voci dei registri del ramo: un messaggio arrivato da una chat col codice vecchio (solo nel registro)
    # entra nell'archivio alla prima scorta di una chat aggiornata, prima di uscire dai 40
    mesi = {}
    for v in mie + [v for f in FILE_REGISTRO.values() for v in leggi_voci(git("show", f"{head}:{f}"))]:
        mesi.setdefault(file_archivio(v[0]), []).append(v)
    return {percorso: scrivi_archivio(unisci_voci(git("show", f"{head}:{percorso}"),
                                                  git("show", f"{prima}:{percorso}") if prima else "",
                                                  scrivi_voci(voci, tetto=0, testa="")))
            for percorso, voci in mesi.items()}


def adesso():
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("Europe/Rome")).strftime("%Y-%m-%d %H:%M")
    except Exception:
        return datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M")


def senza_testate(testo):
    # una riga del testo uguale a una testata la spezzerebbe: uno spazio davanti
    return "\n".join(" " + r if VOCE.match(r) else r for r in str(testo or "").splitlines()).strip()


def scrivi_nell_archivio(gitdir, sessione, testo, quando=None):
    # C469 fase 1: l'archivio locale, che non si taglia mai (la scorta lo porta nel ramo)
    with open(os.path.join(gitdir, "scorta-archivio.md"), "a", encoding="utf-8") as f:
        f.write(f"\n## {quando or adesso()} · {sessione}\n{senza_testate(testo)}\n")


def aggiungi_al_registro(gitdir, ruolo, testo, sessione, domanda=""):
    # il registro di questo contenitore; il primo messaggio lo fa partire dall'unione di quello del ramo (HEAD) e di
    # quello della scorta su GitHub (contenitore nuovo con la scorta non ancora unita: i messaggi di prima non si
    # perdono). Dopo, solo il proprio: le voci più vecchie delle 40 tolte non devono rientrare.
    percorso = os.path.join(gitdir, "scorta-registro.md")
    try:
        with open(percorso, encoding="utf-8") as f:  # PT E85 bis: anche il ramo (messaggi entrati con prendi-messaggi o
            fonti = [f.read(), git("show", f"HEAD:{FILE_REGISTRO[ruolo]}")]  # un merge), sennò la scorta li toglieva
    except OSError:
        ramo = git("symbolic-ref", "-q", "--short", "HEAD")
        fonti = [git("show", f"{rif}:{FILE_REGISTRO[ruolo]}")  # C352: la propria scorta (per sessione), se scaricata
                 for rif in ("HEAD", f"refs/remotes/origin/{nome_scorta(gitdir, ruolo, ramo)}")]
    viste, voci = set(), []
    for fonte in fonti:
        for v in leggi_voci(fonte):
            if v not in viste:
                viste.add(v)
                voci.append(v)
    quando = adesso()
    sessione = sessione_corta(sessione) or "?"
    testo = senza_testate(testo)
    voci.append((quando, sessione, testo))
    voci.sort(key=lambda v: ora_voce(v[0]))  # ordine stabile: a parità di minuto resta l'ordine di arrivo
    with open(percorso, "w", encoding="utf-8") as f:
        f.write(scrivi_voci(voci))
    # la stessa voce nell'archivio; con la domanda a cui rispondeva (rapporto 12 voce 6), citata con «> »
    if domanda:
        testo += f"\n\n{RISPONDEVA}\n" + "\n".join("> " + r for r in domanda.splitlines())
    scrivi_nell_archivio(gitdir, sessione, testo, quando)


def ruolo_da_avvio(testo):
    testo = str(testo or "").strip()
    if not testo.startswith("[AVVIO]"):
        return ""
    return "parallela" if AVVIO_PARALLELA.match(testo) else "principale"


def ruolo_da_trascrizione(percorso):
    # dopo un riavvio in un contenitore nuovo .git/scorta-ruolo non c'è più: il prompt di avvio è nella trascrizione
    try:
        with open(percorso, encoding="utf-8") as f:
            for n, riga in enumerate(f):
                if n > 300:
                    break
                try:
                    voce = json.loads(riga)
                except ValueError:
                    continue
                if voce.get("type") != "user":
                    continue
                testo = (voce.get("message") or {}).get("content")
                if isinstance(testo, list):
                    testo = " ".join(str(p.get("text") or "") for p in testo if isinstance(p, dict))
                trovato = ruolo_da_avvio(testo)
                if trovato:
                    return trovato
    except (OSError, TypeError):
        pass
    return ""


def scrivi_ruolo(gitdir, ruolo):
    with open(os.path.join(gitdir, "scorta-ruolo"), "w", encoding="utf-8") as f:
        f.write(ruolo + "\n")


def ruolo_chat(gitdir, dati):
    try:
        with open(os.path.join(gitdir, "scorta-ruolo"), encoding="utf-8") as f:
            salvato = f.read().strip()
        if salvato in RUOLI:
            return salvato
    except OSError:
        pass
    trovato = ruolo_da_avvio(dati.get("prompt")) or ruolo_da_trascrizione(dati.get("transcript_path"))
    if trovato or dati.get("prompt"):  # primo messaggio senza avvio = sessione aperta a mano da Mario = principale
        trovato = trovato or "principale"
        scrivi_ruolo(gitdir, trovato)
    return trovato or "principale"


def a_parte(gitdir):
    # C276: il ramo a parte aperto da questo contenitore, se c'è
    try:
        with open(os.path.join(gitdir, "scorta-a-parte"), encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return ""


def nome_a_parte(nome):
    try:
        from zoneinfo import ZoneInfo
        ora = datetime.datetime.now(ZoneInfo("Europe/Rome"))
    except Exception:
        ora = datetime.datetime.utcnow()
    return f"{nome}{FERMA}{ora:%Y%m%d-%H%M%S}-{os.urandom(2).hex()}"


def da_chiudere(gitdir, ruolo, ramo, head, nome):
    # C276: rami a parte che il prossimo push riuscito della scorta normale chiude: quello di questo contenitore
    # (il suo lavoro è di nuovo nella scorta normale) e quelli di altri contenitori già uniti nel ramo.
    # C352: i rami a parte di tutte le scorte di questo ruolo (per sessione e nome vecchio), fra quelli scaricati.
    prefisso = f"{nome}{FERMA}"
    voci = []
    mio = a_parte(gitdir)
    punta = mio.startswith(prefisso) and git("rev-parse", "-q", "--verify", f"refs/{mio}")
    if punta:
        voci.append(f"{mio}={punta}")
    elenco = git("for-each-ref", "--format=%(refname:strip=3) %(objectname) %(subject)", "refs/remotes/origin/")
    for riga in elenco.splitlines():
        parti = riga.split(" ", 2)
        voce = len(parti) >= 2 and leggi_nome_scorta(parti[0], ramo)
        if not voce or not voce["ferma"] or voce["ruolo"] != ruolo or parti[0] == mio \
                or (len(parti) == 3 and parti[2].startswith(CHIUSA)):
            continue
        if run("merge-base", "--is-ancestor", parti[1], head)[0] == 0:
            voci.append(f"{parti[0]}={parti[1]}")
    return voci


def scorta(gitdir, ruolo="principale", push=True):
    ramo = git("symbolic-ref", "-q", "--short", "HEAD")
    head = git("rev-parse", "-q", "--verify", "HEAD")
    if not ramo or not head or ramo.startswith(("scorta/", "scorta-")):
        return
    nome = nome_scorta(gitdir, ruolo, ramo)  # C352: una scorta per sessione
    locale = git("rev-parse", "-q", "--verify", f"refs/{nome}")  # ultima scorta fatta da questo container
    remota = git("rev-parse", "-q", "--verify", f"refs/remotes/origin/{nome}")
    genitore_extra = ""
    if not locale and remota and run("merge-base", "--is-ancestor", remota, head)[0] != 0:
        if lavoro_della_scorta(remota, head) in ("nuovo", "messaggi"):  # PT E85: i messaggi non si assorbono
            segna_ferma(gitdir, nome, remota)  # C252: contenitore nuovo, la scorta di prima non è ancora nel ramo
        else:  # C352: scorta vecchia o vuota (es. di un'altra chat parallela chiusa): la assorbo come genitore,
            genitore_extra = remota  # così il push va avanti e nessuno la propone più da unire
    chiudi = []
    ferma = nome in segni_aperti(gitdir)
    if ferma:  # C276: la scorta di GitHub non si copre (C252), ma il lavoro si salva lo stesso sul ramo a parte
        mio = a_parte(gitdir)
        nome = mio if mio.startswith(nome + FERMA) else nome_a_parte(nome)
        prima = git("rev-parse", "-q", "--verify", f"refs/{nome}")
    else:
        prima = locale or remota
        chiudi = da_chiudere(gitdir, ruolo, ramo, head, nome)

    indice = os.path.join(gitdir, "scorta-index")
    env = dict(os.environ, GIT_INDEX_FILE=indice)
    # C469 (09/11: 13 «tempo scaduto» dell'hook a ogni messaggio, in 5 sessioni): si parte dall'indice vero di git, che sa
    # già quali file sono cambiati: `git add -A` da ~2 s (molti di più a contenitore freddo, oltre i 10 s dell'hook) a
    # ~0,01 s, stesso albero. Senza l'indice vero (o se la copia non riesce) si riparte da HEAD come prima.
    try:
        # E327: copy2 tiene l'ora dell'indice vero; con copyfile un file cambiato nello stesso secondo e con la stessa
        # lunghezza sembrava «non cambiato» (racy git) e la scorta salvava il contenuto VECCHIO (prova rossa «a volte»)
        shutil.copy2(os.path.join(gitdir, "index"), indice)
        pronto = True
    except OSError:
        pronto = run("read-tree", head, env=env)[0] == 0
    if not pronto or run("add", "-A", env=env, timeout=60)[0]:
        return
    msg = os.path.join(gitdir, "scorta-msg.md")
    if os.path.exists(msg):
        blob = git("hash-object", "-w", msg)
        if not blob or run("update-index", "--add", "--cacheinfo", f"100644,{blob},{FILE_MSG[ruolo]}", env=env)[0]:
            return
    for locale_f, nel_ramo in (("scorta-registro.md", FILE_REGISTRO[ruolo]), ("scorta-risposta.md", FILE_RISPOSTA[ruolo])):
        percorso = os.path.join(gitdir, locale_f)
        if os.path.exists(percorso):
            blob = git("hash-object", "-w", percorso)
            if not blob or run("update-index", "--add", "--cacheinfo", f"100644,{blob},{nel_ramo}", env=env)[0]:
                return
    for nel_ramo, testo in archivio_della_scorta(gitdir, head, prima).items():  # C469 fase 1
        blob = git("hash-object", "-w", "--stdin", inp=testo)
        if not blob or run("update-index", "--add", "--cacheinfo", f"100644,{blob},{nel_ramo}", env=env)[0]:
            return
    # C434: i totali del consumo (spreco-token.py) stanno in .git/consumo, fuori dai file del progetto: qui entrano
    # nel commit della scorta in archivio/consumo/, senza toccare i file né l'indice veri.
    for consumo in sorted(glob.glob(os.path.join(gitdir, "consumo", "*.json"))):
        blob = git("hash-object", "-w", consumo)
        nel_ramo = "archivio/consumo/" + os.path.basename(consumo)
        if not blob or run("update-index", "--add", "--cacheinfo", f"100644,{blob},{nel_ramo}", env=env)[0]:
            return
    albero = git("write-tree", env=env)
    if not albero:
        return
    if prima and git("rev-parse", f"{prima}^{{tree}}") == albero and run("merge-base", "--is-ancestor", head, prima)[0] == 0:
        if push and not gia_spinta(gitdir, nome, prima):  # C469 rapporto 12 voce 10: l'invio di prima era fallito
            lancia_spinta(prima, nome, chiudi)
        return  # niente di nuovo dall'ultima scorta
    if ferma and not prima and git("rev-parse", f"{head}^{{tree}}") == albero and \
            run("merge-base", "--is-ancestor", head, f"refs/remotes/origin/{ramo}")[0] == 0:
        return  # niente da salvare a parte: nessuna modifica e il ramo è già tutto su GitHub
    genitori = ["-p", head]
    if prima and run("merge-base", "--is-ancestor", prima, head)[0] != 0:
        genitori += ["-p", prima]
    if genitore_extra and genitore_extra != prima and run("merge-base", "--is-ancestor", genitore_extra, head)[0] != 0:
        genitori += ["-p", genitore_extra]
    dove = ", a parte: scorta ferma" if ferma else ""
    chi = sessione_salvata(gitdir)  # C352: all'avvio si sa di quale sessione è la scorta (una per tutte le parallele)
    dove += f", sessione {chi}" if chi else ""
    nuovo = git("commit-tree", albero, *genitori, inp=f"Scorta automatica {ora_italiana()} (ramo {ramo}{dove})\n")
    if not nuovo:
        return
    run("update-ref", f"refs/{nome}", nuovo)
    if ferma:
        with open(os.path.join(gitdir, "scorta-a-parte"), "w", encoding="utf-8") as f:
            f.write(nome + "\n")
    if push:  # in background: la risposta a Mario non aspetta la rete
        lancia_spinta(nuovo, nome, chiudi)


def lancia_spinta(nuovo, nome, chiudi):
    subprocess.Popen(["timeout", "120", sys.executable, "-I", os.path.abspath(__file__), "spingi", nuovo, nome,
                      *chiudi], cwd=CWD, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL, start_new_session=True)


def gia_spinta(gitdir, nome, punta):
    """C469 rapporto 12 voce 10: la scorta è già su GitHub? (riferimento remoto aggiornato dal push, o il segno
    .git/scorta-spinta scritto da spingi dopo un invio riuscito). No → il giro dopo la rimanda anche senza modifiche."""
    if git("rev-parse", "-q", "--verify", f"refs/remotes/origin/{nome}") == punta:
        return True
    try:
        with open(os.path.join(gitdir, "scorta-spinta"), encoding="utf-8") as f:
            return f.read().split() == [nome, punta]
    except OSError:
        return False


def leggi_segni(gitdir):
    # .git/scorta-ferma: una riga «<scorta> <punta da unire>» per ogni scorta ferma
    segni = {}
    try:
        with open(os.path.join(gitdir, "scorta-ferma"), encoding="utf-8") as f:
            for riga in f:
                parti = riga.split()
                if len(parti) == 2:
                    segni[parti[0]] = parti[1]
    except OSError:
        pass
    return segni


def scrivi_segni(gitdir, segni):
    segno = os.path.join(gitdir, "scorta-ferma")
    if segni:
        with open(segno, "w", encoding="utf-8") as f:
            f.write("".join(f"{n} {p}\n" for n, p in segni.items()))
    elif os.path.exists(segno):
        os.remove(segno)


def segna_ferma(gitdir, nome, punta):
    segni = leggi_segni(gitdir)
    segni[nome] = punta
    scrivi_segni(gitdir, segni)


def segni_aperti(gitdir):
    # C252: un segno resta finché il ramo non contiene la scorta dell'altro contenitore
    segni = leggi_segni(gitdir)
    aperti = {n: p for n, p in segni.items() if run("merge-base", "--is-ancestor", p, "HEAD")[0] != 0}
    if aperti != segni:
        scrivi_segni(gitdir, aperti)
    return aperti


def avviso_ferma(gitdir):
    # C252: detto a ogni messaggio finché il ramo non contiene la scorta dell'altro contenitore
    aperti = segni_aperti(gitdir)
    if not aperti:
        return
    unisci = " && ".join(f"git fetch origin {n} && git merge origin/{n}" for n in aperti)
    parte = a_parte(gitdir) or f"<scorta>{FERMA}<data>"
    print(f"SCORTA FERMA (C252): {' e '.join('origin/' + n for n in aperti)} ha lavoro di un altro contenitore che il "
          f"ramo non ha. Intanto il lavoro si salva a parte su origin/{parte} (C276). Uniscila: {unisci}, poi git push.")


def chiudi_a_parte(nome, punta):
    # C276: il lavoro del ramo a parte è di nuovo nella scorta normale (o già nel ramo): un commit lo dice all'avvio
    albero = git("rev-parse", f"{punta}^{{tree}}")
    segno = albero and git("commit-tree", albero, "-p", punta,
                           inp=f"{CHIUSA} {ora_italiana()} (C276): il suo lavoro è di nuovo nella scorta normale\n")
    if not segno or run("push", "-q", "origin", f"{segno}:refs/heads/{nome}", timeout=50)[0]:
        return
    run("update-ref", f"refs/remotes/origin/{nome}", segno)
    gitdir = git("rev-parse", "--absolute-git-dir")
    if gitdir and a_parte(gitdir) == nome and run("update-ref", "-d", f"refs/{nome}", punta)[0] == 0:
        os.remove(os.path.join(gitdir, "scorta-a-parte"))  # se si ferma di nuovo, apre un ramo a parte nuovo


def spingi(nuovo, nome, *chiudi):
    if run("push", "-q", "origin", f"{nuovo}:refs/heads/{nome}", timeout=50)[0] == 0:
        gitdir = git("rev-parse", "--absolute-git-dir")
        if gitdir:  # C469 rapporto 12 voce 10: l'ultimo invio riuscito
            with open(os.path.join(gitdir, "scorta-spinta"), "w", encoding="utf-8") as f:
                f.write(f"{nome} {nuovo}\n")
        for voce in chiudi:  # C276: la scorta normale è ripartita, i rami a parte si chiudono
            chiudi_a_parte(*voce.split("=", 1))
        return
    # push non in avanti: qualcun altro ha scritto nella stessa scorta (un altro contenitore o un ruolo sbagliato).
    # C252: niente unione col proprio albero (copriva i suoi file, E154) e mai push forzato: si ferma e lo dice.
    if run("fetch", "-q", "origin", f"+refs/heads/{nome}:refs/remotes/origin/{nome}", timeout=30)[0]:
        return
    altra = git("rev-parse", "-q", "--verify", f"refs/remotes/origin/{nome}")
    if not altra or run("merge-base", "--is-ancestor", altra, nuovo)[0] == 0:
        return
    if run("merge-base", "--is-ancestor", nuovo, altra)[0] == 0:
        return  # su GitHub c'è già una scorta più nuova di questa chat (due push partiti insieme)
    gitdir = git("rev-parse", "--absolute-git-dir")
    if gitdir:
        segna_ferma(gitdir, nome, altra)


PAUSA_TOOL = 120  # secondi minimi tra due scorte a metà risposta


def tocca_al_tool(gitdir):
    segno = os.path.join(gitdir, "scorta-ora")
    try:
        if time.time() - os.path.getmtime(segno) < PAUSA_TOOL:
            return False
    except OSError:
        pass
    with open(segno, "w") as f:
        f.write("")
    return True


def main():
    if sys.argv[1:2] == ["spingi"] and len(sys.argv) >= 4:
        spingi(*sys.argv[2:])
        return
    gitdir = git("rev-parse", "--absolute-git-dir")
    if not gitdir:
        return
    configura_driver()  # C469 B6 e fase 1: anche nei contenitori avviati prima dei driver
    if sys.argv[1:2] == ["ruolo"]:  # a mano: python3 -I .claude/hooks/scorta.py ruolo [parallela]
        if sys.argv[2:3] and sys.argv[2] in RUOLI:
            scrivi_ruolo(gitdir, sys.argv[2])
        print("Ruolo della chat per la scorta:", ruolo_chat(gitdir, {}))
        return
    try:
        dati = json.load(sys.stdin)
    except Exception:
        dati = {}
    if not isinstance(dati, dict):
        dati = {}
    ruolo = ruolo_chat(gitdir, dati)
    chi = sessione_di(dati)
    if chi and chi != sessione_salvata(gitdir):  # C352: va nel nome e nel messaggio di ogni scorta
        scrivi_sessione(gitdir, chi)  # la data la mette nome_scorta() alla prima scorta
    if "msg" in sys.argv[1:]:
        salva_msg(dati, gitdir, ruolo)
        avviso_ferma(gitdir)
    if "stop" in sys.argv[1:]:
        try:
            salva_risposta(dati, gitdir)
        except Exception:
            pass  # la riga del sito non deve mai fermare la scorta
    if "tool" in sys.argv[1:] and not tocca_al_tool(gitdir):
        return
    if {"msg", "tool", "stop"} & set(sys.argv[1:]):
        scorta(gitdir, ruolo, push=os.environ.get("JONA_SCORTA_NOPUSH") != "1")


if __name__ == "__main__":  # C352: avvio-check.py importa lavoro_della_scorta, senza far partire la scorta
    if sys.argv[1:2] == ["unisci-registro"] and len(sys.argv) == 5:  # C469 B6: driver di git, l'uscita conta
        sys.exit(driver_registro(*sys.argv[2:5]))
    if sys.argv[1:2] == ["prendi-messaggi"] and len(sys.argv) == 3:  # PT E85: solo i messaggi di una scorta
        try:
            n = prendi_messaggi(sys.argv[2])
        except Exception as e:  # noqa: BLE001
            print(f"ERRORE: {e}")
            sys.exit(1)
        print(f"Messaggi di Mario presi da {sys.argv[2]}: {n} nuovi. Ora commit e push dei registri e dell'archivio.")
        sys.exit(0)
    if sys.argv[1:2] == ["unisci-archivio"] and len(sys.argv) == 5:  # C469 fase 1: driver «archivio», senza tetto
        sys.exit(driver_registro(*sys.argv[2:5], archivio=True))
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
