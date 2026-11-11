# C140 · Giri di prova: prima il PC di casa, poi Blacksmith, poi GitHub (tutti i progetti)

## Parole di Mario (11/11 ~11:45, Principale 58, intere)
«Domanda, puoi fare in modo che tutti i progetti possano passare per il mio GitHub a casa, che ho creato un server, se provano inizialmente il mio server del PC a casa per fare i giri di prova su GitHub, se è occupato da un altro progetto che non c'è spazio passano a Blacksmith, se ho finito i crediti di Blacksmith passa a GitHub server normale, quello con quello il server gratuito, ecco, con i limiti per chi ce li ha, per chi ha un progetto privato, chi ce l'ha pubblico invece è un altro discorso.»

## Parole di Mario (11/11 ~19:06, Principale 63, intere)
«devi girare in priorita sul GitHub del mio pc nzxt a casa poi blacksmith poi github a comsumo gratuito»

## Fatti (manuali GitHub letti l'11/11/2026)
- Un motore di casa (self-hosted runner) serve UN repository, oppure tutti quelli di un'ORGANIZZAZIONE. Su un account personale: un motore per progetto (più cartelle sullo stesso PC) o un'organizzazione gratuita con i progetti spostati dentro.
- GitHub sconsiglia il motore di casa per i progetti PUBBLICI (chiunque apre una PR fa girare codice sul PC). I pubblici hanno GitHub gratis: vanno lì.
- GitHub non ha «se è occupato passa a un altro»: un giro aspetta in coda. Serve un passo che sceglie prima (motore libero? crediti Blacksmith?). Per sapere se il PC è libero serve una chiave di sola lettura dei motori.
- Questo progetto ha già il posto: `runs-on: ${{ vars.PROVE_RUNNER || 'ubuntu-latest' }}` e `tools/scegli-giro.py` (oggi: contenitore, Blacksmith, GitHub).
- #63 (11/11): Pronti in Tavola è PUBBLICO (`search/repositories`: visibility public). Quindi qui GitHub è gratis senza tetto, e il PC di casa porterebbe il rischio scritto sopra (una PR da un fork può aggiungere un workflow `pull_request` che gira sul PC). Oggi qui girano su GitHub solo `sito.yml` (pubblica, ~1 min) e `pulisci-scorte.yml`; il giro completo delle prove è in locale (`node tools/prova.js`).
- Con «se è spento o occupato passa al prossimo»: serve un lavoro «scegli» su GitHub (pochi secondi) che legge i motori con una chiave di sola lettura (Amministrazione: lettura) e mette `runs-on` di conseguenza; sennò un giro col PC spento resta in coda fino a 24 ore (anche la pubblicazione).

## Parole di Mario (11/11 ~19:2x, Principale 64, intere)
«se lo rendiamo privato e mettiamo il mio PC?»

## Scelta 3: privato + PC (controllato l'11/11 19:21, docs.github.com)
- Privato su GitHub Free: 2.000 minuti al mese di GitHub per tutti i privati dell'account; i motori di casa sono gratis. Qui oggi su GitHub solo `sito.yml` e `pulisci-scorte.yml`.
- Rami protetti: nei privati di Free non ci sono, ma qui non ne usiamo (`list_branches`: tutti `protected: false`). Nessun file del codice legge il repo da GitHub (grep).
- Account personale: il motore di casa serve UN repo → un secondo motore sul PC solo per questo. Blacksmith qui non è collegato.
- In più: nomi di clienti e messaggi di Mario nei documenti non restano in pubblico.

## Parole di Mario (11/11 ~19:24, arrivate nella #64 dopo l'handoff, intere)
«hai aggiunto le ricette dello youtuber piú tutte quelle dette 500? ricette / 3 secondo me se sei d'accordo» → scelta **3**.

## Scelta 3: piano (#65, 11/11)
- Minuti misurati (`actions_list` di `sito.yml`, 11/11): 68 giri in 3 giorni = 118 minuti arrotondati (~40 al giorno, giorni di lavoro fitto) → stima ~1.200 al mese su 2.000, più `pulisci-scorte.yml`. Finiti i minuti, GitHub ferma i giri dei privati (anche la pubblicazione) fino al mese dopo; i motori di casa non consumano minuti.
- Controllato prima del passo 1 (`search/repositories`, 11/11): niente GitHub Pages, 0 fork, 1 stella (si perde).
- Passo 1 (Mario, 1 minuto): Settings → in fondo «Danger Zone» → **Change visibility** → privato → **I have read and understand these effects** → **Make this repository private** (docs.github.com «Setting repository visibility», letto 11/11). Dopo: io controllo `visibility: private` e che la pubblicazione parta.
- Passo 2 (Mario, dal PC): secondo motore per questo repo: Settings → Actions → Runners → **New self-hosted runner** → Windows; comandi in PowerShell da amministratore (il codice dura 1 ora; cartella sua; come servizio), etichette `self-hosted` + `casa` (docs.github.com «Adding self-hosted runners», letto 11/11).
- Passo 3 (io, dopo l'ok per `.claude/`): kit 38.26 (caso «casa» in `tools/scegli-giro.py`), giro completo in `prove.yml` sul PC (in coda oltre 3 minuti → GitHub). Pubblicazione: resta su GitHub (deve partire anche col PC spento); sul PC solo se i minuti si avvicinano al tetto (decido coi numeri veri dopo il passo 2).

## Stato
Mario ha scelto 3 (11/11 19:24). Aspetta il passo 1 di Mario e l'ok per `.claude/` (righe in «## 0. Aspetta Mario»). Regola per tutti i progetti → kit (sessione del kit), qui la prova su Pronti in Tavola.
