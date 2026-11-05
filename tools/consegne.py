#!/usr/bin/env python3
"""Consegne a stampo (C352, soluzione 2; Mario 30/10: «il passaggio consegne è così lento… ottimizzare al 120%»).

Le righe di FATTO delle consegne le scrive questo script, non Claude: numero della sessione, ramo = origin, giri in
corso, PR aperte, versione nel codice, scorte non unite, motore e impegno, numeri liberi (E, C, M) cercati anche su
origin (E221 doppio), e tutto `docs/PROSSIMA-SESSIONE.md`. Claude scrive solo le parti di giudizio (3 righe fisse,
ultimo messaggio di Mario, prossimi passi, fatti della sessione).

Uso:
  python3 -I tools/consegne.py fatti --id <id della sessione che chiude> [--motore claude-fable-5-1] [--catena N]
                                     [--prossimo "argomento della sessione nuova"] [--apre claude|mario]
      scrive in docs/PASSAGGIO-CONSEGNE.md: la riga «Sessione attuale: #N+1 …», l'intestazione e il primo punto di
      «## Stato», la sezione «## Motore e forza di pensiero», la riga «Prossimo E libero…»; riscrive
      docs/PROSSIMA-SESSIONE.md; stampa i messaggi di Mario arrivati dopo l'ultimo commit delle consegne (per il
      «Controllo Da fare») e le scorte non unite. Non tocca le altre sezioni.
  python3 -I tools/consegne.py controlla
      i controlli della fase 3 della skill «consegne», uno per riga, VERO o FALSO; uscita 1 se uno è FALSO.
Prova: python3 -I tools/test-consegne.py
"""
import argparse
import datetime
import difflib
import json
import os
import re
import subprocess
import sys

CWD = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
REPO = "Kur0ChanX/pronti-in-tavola"
CONSEGNE = "docs/PASSAGGIO-CONSEGNE.md"
PROSSIMA = "docs/PROSSIMA-SESSIONE.md"
REGISTRO = "docs/MESSAGGI-MARIO.md"
SETTINGS = ".claude/settings.json"
MOTORI = {"claude-fable-5-1": "Fable 5.1", "claude-opus-5-5": "Opus 5.5", "claude-opus-5": "Opus 5",
          "claude-sonnet-5-5": "Sonnet 5.5"}
IMPEGNI = {"high": "Alto", "xhigh": "Extra", "medium": "Medio", "low": "Basso", "max": "Massimo"}
MAX_PAROLE = 1750


def run(cmd, timeout=30):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=CWD)
        return r.returncode, r.stdout.strip()
    except Exception:
        return 1, ""


def git(*args):
    rc, out = run(["git", *args])
    return out if rc == 0 else ""


def leggi(rel):
    with open(os.path.join(CWD, rel), encoding="utf-8") as f:
        return f.read()


def scrivi(rel, testo):
    with open(os.path.join(CWD, rel), "w", encoding="utf-8") as f:
        f.write(testo)


def ora_italiana(quando=None):
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo("Europe/Rome")
    except Exception:
        tz = None
    d = quando or datetime.datetime.now(datetime.timezone.utc)
    return d.astimezone(tz) if tz else d


def ramo_di_lavoro():
    try:
        return leggi(".claude/ramo-di-lavoro.txt").strip()
    except OSError:
        return git("symbolic-ref", "-q", "--short", "HEAD")


def numero_sessione(testo):
    m = re.search(r"^Sessione attuale: #(\d+)", testo, re.M)
    return int(m.group(1)) if m else None


def versione_nel_codice():
    try:
        nums = re.findall(r"\bv:\s*'?(\d+(?:\.\d+)?)'?", leggi("app/src/logica/versioni.js"))
    except OSError:
        return "?"
    return max(nums, key=lambda s: float(s)) if nums else "?"


def impegno():
    try:
        liv = json.loads(leggi(SETTINGS)).get("effortLevel", "")
    except Exception:
        liv = ""
    return liv, IMPEGNI.get(liv, liv or "?")


def maiuscola(s):
    return s[:1].upper() + s[1:]


def gh(path):
    rc, out = run(["gh", "api", path], timeout=40)
    try:
        return json.loads(out) if rc == 0 and out else None
    except ValueError:
        return None


def giri_in_corso():
    d = gh(f"repos/{REPO}/actions/runs?status=in_progress&per_page=5")
    if d is None:
        return "giri in corso: non verificati (gh non risponde)"
    nomi = [r.get("name", "?") for r in d.get("workflow_runs", [])]
    return "nessun giro in corso" if not nomi else "giri in corso: " + ", ".join(nomi)


def pr_aperte():
    d = gh(f"repos/{REPO}/pulls?state=open&per_page=5")
    if d is None:
        return "PR aperte: non verificate (gh non risponde)"
    if not d:
        return "nessuna PR aperta"
    return "PR aperte: " + ", ".join(f"#{p['number']} {'(bozza) ' if p.get('draft') else ''}{p.get('title', '')[:40]}" for p in d)


def lavoro_della_scorta(remoto):
    # come in .claude/hooks/scorta.py (merge simulato): «nuovo» solo se porta file diversi da quelli della scorta stessa
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
        from scorta import lavoro_della_scorta as f
        return f(remoto)
    except Exception:
        return "nuovo"


def scorte_non_unite(ramo):
    """Scorte con lavoro vero non ancora nel ramo. La scorta che ha solo i commit automatici di fine risposta
    (`ULTIMA-RISPOSTA.md`, #434) non conta: è il caso normale a ogni handoff."""
    fuori = []
    for nome in mie_scorte(nomi_delle_scorte(ramo), id_corto_mio()):
        if run(["git", "fetch", "-q", "origin", f"+refs/heads/{nome}:refs/remotes/origin/{nome}"])[0] == 0 and \
                run(["git", "merge-base", "--is-ancestor", f"origin/{nome}", "HEAD"])[0] != 0 and \
                lavoro_della_scorta(f"origin/{nome}") == "nuovo":
            fuori.append(nome)
    return fuori


def id_corto_mio():
    """Id corto di questa sessione dalla variabile del cloud (come scorta.py); '' in locale."""
    return (re.match(r"[A-Za-z0-9]*", re.sub(r"^(session|cse)_", "", os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID") or "")).group(0))[:12]


def mie_scorte(nomi, mio):
    """Mario 30/10 «sì» (#439): al controllo contano solo le scorte di QUESTA sessione (E60/E97: quelle delle altre chat
    non si uniscono mai, e le parallele vive ne scrivono una a ogni risposta: fermavano ogni handoff). Senza id (in
    locale) restano tutte, come prima."""
    if not mio:
        return list(nomi)
    # Questo script è della chat principale (CONSEGNE fisso): solo il suo ruolo, e l'id corto di 12 caratteri (E226: con 8
    # era lo stesso per tutte le sessioni del giorno).
    return [n for n in nomi if re.search(r"^scorta-principale-\d{8}-" + re.escape(mio) + "/", n)]


def nomi_delle_scorte(ramo):
    """C352: le scorte vive del ramo su GitHub (per sessione «scorta-<ruolo>-<data>-<id>/<ramo>» e nome vecchio),
    senza i rami «-ferma-» e senza quelle di sessioni ferme da più di SCORTE_GIORNI; se GitHub non risponde, i due
    nomi vecchi."""
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
        from scorta import scorte_vive, SCORTE_GIORNI
        vive = scorte_vive(ramo)
    except Exception:
        vive = None
    if vive is None:
        return [f"scorta-{r}/{ramo}" for r in ("principale", "parallela")]
    limite = (datetime.date.today() - datetime.timedelta(days=SCORTE_GIORNI)).strftime("%Y%m%d")
    return [v["nome"] for v in vive if not v["ferma"] and not (v["data"] and v["data"] < limite)]


def numeri_liberi(ramo):
    """Il numero più alto di E, C e M nei documenti che li assegnano, locali E su origin (l'altra chat può averne preso
    uno). Solo le forme vere: «**E123**» nel diario degli errori, «| C123 |» e «| M12 |» nelle tabelle di Da fare,
    «C123-» nei nomi dei file dei lavori (non ogni sigla citata in giro: #434 aveva avuto «E1000»)."""
    fonti = {"E": (r"\*\*E(\d+)", ["docs/ERRORI.md", "docs/ERRORI-STORIA.md"]),
             "C": (r"^\| C(\d+) \|", ["docs/DA-FARE.md", "docs/DA-FARE-FATTE.md"]),
             "M": (r"^\| M(\d+) \|", ["docs/DA-FARE.md", "docs/DA-FARE-FATTE.md"])}
    out = {}
    for lettera, (forma, file) in fonti.items():
        nums = []
        for f in file:
            for testo in (leggi(f) if os.path.exists(os.path.join(CWD, f)) else "", git("show", f"origin/{ramo}:{f}")):
                nums += [int(n) for n in re.findall(forma, testo, re.M)]
        if lettera == "C":
            nomi = git("ls-tree", "--name-only", f"origin/{ramo}", "docs/lavori-in-corso/")
            cartella = os.path.join(CWD, "docs/lavori-in-corso")
            nomi += "\n" + "\n".join(os.listdir(cartella)) if os.path.isdir(cartella) else ""
            nums += [int(n) for n in re.findall(r"C(\d+)-", nomi)]
        out[lettera] = (max(nums) + 1) if nums else 1
    return out


def messaggi_dopo_consegne(registro=REGISTRO):
    quando = git("log", "-1", "--format=%ct", "HEAD", "--", CONSEGNE)
    if not quando:
        return []
    dal = ora_italiana(datetime.datetime.fromtimestamp(int(quando), datetime.timezone.utc)).strftime("%Y-%m-%d %H:%M")
    try:
        testo = leggi(registro)
    except OSError:
        return []
    voci, corrente = [], None
    for riga in testo.splitlines():
        m = re.match(r"^## (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) · \S+$", riga)
        if m:
            corrente = [m.group(1), ""] if m.group(1) >= dal else None
            if corrente:
                voci.append(corrente)
        elif corrente is not None and riga.strip():
            corrente[1] = (corrente[1] + " " + riga.strip()).strip()
    return [(q, t) for q, t in voci]


TETTO_TITOLO = 40  # caratteri: nella barra del PC se ne leggono ~35 (Mario 31/10 21:4x, C368)


TETTO_COSA = 22  # caratteri del «cosa fa»: «~20» di Mario, 22 per tenere intero il suo esempio «Planner: scegli colori» (kit 30.4)
ICONA = "🍝"  # icona di Pronti in Tavola nei titoli (kit 30.5)
DA_FARE = "docs/DA-FARE.md"
SEZIONE_0 = "## 0. Aspetta Mario"


def titolo_breve(segno, icona, catena, cosa):
    """Titolo «<segno della catena> <icona> <Nome> <numero> · <cosa fa>» (kit 30.7, Mario 1/11 00:15): `catena` è
    «Principale 467» o «Dov'è 8»; il «cosa fa» tiene al massimo 3 parole e ~20 caratteri (si taglia solo lui, mai il
    numero). Forma giusta controllata anche da `.claude/hooks/titolo-forma.py`."""
    testa = f"{segno} {icona} {catena} · "
    parole = " ".join(cosa.split()).split(" ")[:3]
    cosa = " ".join(parole)
    spazio = max(8, min(TETTO_COSA, TETTO_TITOLO - len(testa)))
    if len(cosa) > spazio:
        cosa = cosa[:spazio - 1].rstrip(" ,;:·-") + "…"
    return testa + cosa


def aspetta_mario():
    """→ le righe «- …» della sezione «## 0. Aspetta Mario» di Da fare (C369); [] se manca."""
    try:
        testo = leggi(DA_FARE)
    except OSError:
        return []
    righe, dentro = [], False
    for riga in testo.split("\n"):
        if riga.startswith("## "):
            dentro = riga.startswith(SEZIONE_0)
        elif dentro and riga.lstrip().startswith("- "):
            righe.append(riga.strip())
    return righe


def della_principale(riga):
    """→ True se la riga di «Aspetta Mario» è della catena Principale («🟡 Principale 466»; prima `⭐NN` o `#NN`), non di
    un'altra catena («🟨 Dov'è 8», prima `PNN`)."""
    return bool(re.search(r"(?:^|[\s·])(?:#|⭐|Principale )\d+\b", riga))


def sostituisci_sezione(testo, titolo, corpo):
    """Rimpiazza la sezione «## titolo» (fino al prossimo «## » o alla fine); se manca, la aggiunge in fondo."""
    forma = re.compile(rf"^## {re.escape(titolo)}[^\n]*\n.*?(?=^## |\Z)", re.M | re.S)
    nuovo = f"## {titolo}\n{corpo.rstrip()}\n\n"
    if forma.search(testo):
        return forma.sub(lambda _: nuovo, testo, count=1)
    return testo.rstrip("\n") + "\n\n" + nuovo


STRADE = "Strade provate e scartate"


def strade_scartate(testo):
    """C352 (ricerca 30/10: gli esperti la tengono sempre): la sezione «## Strade provate e scartate» c'è sempre,
    prima dei «Prossimi passi». Se manca la aggiunge vuota («- Nessuna.»); se c'è non la tocca (giudizio della sessione)."""
    if re.search(rf"^## {STRADE}", testo, re.M):
        return testo
    sezione = f"## {STRADE} (perché; così la prossima non le rifà)\n- Nessuna.\n\n"
    m = re.search(r"^## [^\n]*Prossimi passi", testo, re.M)
    if m:
        return testo[:m.start()] + sezione + testo[m.start():]
    return testo.rstrip("\n") + "\n\n" + sezione


def stato_primo_punto(testo, intestazione, punto):
    """Rinomina l'intestazione «## Stato …» e rimpiazza (o inserisce) il primo punto «- Ramo comune …»."""
    forma = re.compile(r"^## Stato[^\n]*\n((?:- Ramo comune[^\n]*\n)?)", re.M)
    if not forma.search(testo):
        return testo + f"\n## Stato ({intestazione})\n- {punto}\n"
    return forma.sub(lambda _: f"## Stato ({intestazione})\n- {punto}\n", testo, count=1)


def fatti(args):
    ramo = ramo_di_lavoro()
    testo = leggi(CONSEGNE)
    n = numero_sessione(testo)
    if n is None:
        print("FALSO: in docs/PASSAGGIO-CONSEGNE.md manca la riga «Sessione attuale: #N»")
        return 1
    nuovo = n + 1
    adesso = ora_italiana()
    quando = adesso.strftime("%d/%m %H:%M")
    run(["git", "fetch", "-q", "origin", ramo])
    allineato = git("rev-parse", "HEAD") == git("rev-parse", f"origin/{ramo}")
    liv, liv_nome = impegno()
    motore = args.motore or ""
    motore_nome = MOTORI.get(motore, motore or "?")
    catena = args.catena
    apre = args.apre or ("mario" if catena >= 8 else "claude")
    chi_apre = (f"la apre la #{n} con `create_session` (catena {catena} di 8)" if apre == "claude"
                else f"la apre Mario (catena a {catena} di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`")
    sigla = f" `{args.id}`" if args.id else ""

    testo = re.sub(r"^Sessione attuale: #\d+[^\n]*$",
                   f"Sessione attuale: #{nuovo} (dopo la #{n}{sigla}, chiusa alla soglia {quando}; {chi_apre}).",
                   testo, count=1, flags=re.M)
    punto = (f"Ramo comune {'= origin' if allineato else '≠ origin: PUSH DA FARE'} (verifica: `git rev-parse HEAD` = "
             f"`origin/{ramo}`). {maiuscola(giri_in_corso())}. {maiuscola(pr_aperte())}. Versione nel codice v{versione_nel_codice()}.")
    scorte = scorte_non_unite(ramo)
    if scorte:
        punto += " Scorte NON unite: " + ", ".join(scorte) + "."
    testo = stato_primo_punto(testo, f"{quando} ora italiana", punto)
    testo = strade_scartate(testo)
    liberi = numeri_liberi(ramo)
    riga_liberi = f"Prossimo E libero: E{liberi['E']}; prossimo C libero: C{liberi['C']}; prossimo M libero: M{liberi['M']}."
    if re.search(r"^Prossimo E libero:", testo, re.M):
        testo = re.sub(r"^Prossimo E libero:[^\n]*$", riga_liberi, testo, count=1, flags=re.M)
    else:
        testo = sostituisci_sezione(testo, "Numeri liberi", riga_liberi)
    # E277 (Mario 03/11 11:38): niente avviso a Mario sull'impegno; la sessione nuova eredita motore e impegno.
    motore_sez = (f"Motore: **{motore or '?'}** ({motore_nome}) · impegno **{liv_nome}** (`{liv or '?'}`, `{SETTINGS}`): "
                  "li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).")
    testo = sostituisci_sezione(testo, "Motore e forza di pensiero", motore_sez)
    scrivi(CONSEGNE, testo)

    aspetta = aspetta_mario()
    sue = [r for r in aspetta if della_principale(r)]
    # E245 (Mario 1/11 01:45): la sessione nuova parte sempre verde (lavora), anche con righe sue in «Aspetta Mario».
    titolo = titolo_breve("🟢", ICONA, f"Principale {nuovo}", args.prossimo or "(scrivilo)")
    prossima = f"""# Prossima sessione

La scrive la sessione che chiude, nello stesso commit delle consegne (skill `consegne`, fase 5; righe di fatto da `tools/consegne.py`). Di solito la apre Claude con `create_session`; Mario la apre da qui solo a 8 della catena o al cambio account (i suoi passi: `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

Scritta da: #{n} per la #{nuovo} · {adesso.strftime('%d/%m/%Y')} · {chi_apre}, motore {motore_nome}, impegno {liv_nome}.

- Dove: https://claude.ai/code → repo `{REPO}`, ramo `{ramo}`
- Motore: {motore_nome} (l'impegno lo prende da solo da `{SETTINGS}`: non si sceglie)

## Titolo
{titolo}

## Testo da incollare
```
[AVVIO] Sessione #{nuovo} di Pronti in Tavola (repo {REPO}, ramo {ramo}): git fetch origin {ramo} && git merge --ff-only origin/{ramo} (se «HEAD detached», prima git checkout {ramo}).
Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md; continua da sola dai «Prossimi passi».
```
"""
    scrivi(PROSSIMA, prossima)
    print(f"Scritto: {CONSEGNE} (Sessione attuale #{nuovo}, Stato, Strade scartate, Motore, numeri liberi) e {PROSSIMA} (titolo: {titolo}).")
    print(riga_liberi)
    print(f"Aspetta Mario: {len(aspetta)} righe in «{SEZIONE_0}» (della principale: {len(sue)}"
          + "; la nuova parte comunque 🟢, E245). Restano lì finché Mario non risponde (C369).")
    msg = messaggi_dopo_consegne(args.registro)
    print(f"Messaggi di Mario dopo l'ultimo commit delle consegne: {len(msg)} (controllo Da fare: confrontali con docs/DA-FARE.md).")
    for q, t in msg:
        print(f"  - {q}: {t[:200]}")
    return 0


def controlla(args):
    ramo = ramo_di_lavoro()
    run(["git", "fetch", "-q", "origin", ramo])
    esiti = []
    esiti.append(("push confermato: HEAD = origin/" + ramo, git("rev-parse", "HEAD") == git("rev-parse", f"origin/{ramo}") != ""))
    esiti.append(("niente modifiche pendenti", git("status", "--porcelain") == ""))
    testo = leggi(CONSEGNE)
    prossima = leggi(PROSSIMA) if os.path.exists(os.path.join(CWD, PROSSIMA)) else ""
    esiti.append(("niente segni di conflitto nei documenti", "<<<<<<<" not in testo + prossima and ">>>>>>>" not in testo + prossima))
    n = numero_sessione(testo)
    esiti.append(("numero nuovo uguale nelle consegne e in PROSSIMA-SESSIONE", n is not None and f"#{n} " in prossima))
    parole = len(testo.split())
    esiti.append((f"consegne entro {MAX_PAROLE} parole ({parole})", parole <= MAX_PAROLE))
    esiti.append(("3 righe fisse presenti", all(k in testo for k in ("Già deciso da Mario", "Da non rifare", "Cosa preme a Mario"))))
    esiti.append(("impegno scritto in .claude/settings.json", bool(impegno()[0])))
    msg = messaggi_dopo_consegne(args.registro)
    compatto = lambda s: re.sub(r"\s+", " ", s).strip().lower()
    ultimo = compatto(msg[-1][1])[:60] if msg else ""
    # parola per parola, ma un refuso corretto («ka» → «la») non deve fermare l'handoff: somiglianza ≥ 85%
    dentro = compatto(testo)
    dove = dentro.find(ultimo[:20]) if ultimo else -1
    simile = dove >= 0 and difflib.SequenceMatcher(None, ultimo, dentro[dove:dove + len(ultimo)]).ratio() >= 0.85
    esiti.append(("ultimo messaggio di Mario dentro le consegne" + (f" («{ultimo[:25]}…»)" if ultimo else " (nessuno nuovo)"),
                  (not ultimo) or simile))
    esiti.append(("nessuna scorta non unita", not scorte_non_unite(ramo)))
    tutto_vero = True
    for nome, ok in esiti:
        print(f"{'VERO ' if ok else 'FALSO'}: {nome}")
        tutto_vero &= bool(ok)
    print("Tutto vero: apri la sessione nuova." if tutto_vero else "Un controllo è FALSO: fermati e scrivi a Mario (fase 4).")
    return 0 if tutto_vero else 1


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = p.add_subparsers(dest="cosa", required=True)
    f = sub.add_parser("fatti")
    f.add_argument("--id", default="")
    f.add_argument("--motore", default="")
    f.add_argument("--catena", type=int, default=1)
    f.add_argument("--prossimo", default="")
    f.add_argument("--apre", choices=("claude", "mario"), default="")
    f.add_argument("--registro", default=REGISTRO)
    c = sub.add_parser("controlla")
    c.add_argument("--registro", default=REGISTRO)
    args = p.parse_args(argv)
    return fatti(args) if args.cosa == "fatti" else controlla(args)


if __name__ == "__main__":
    sys.exit(main())
