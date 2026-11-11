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

## Stato
Domande a Mario (riga in «## 0. Aspetta Mario»). Regola per tutti i progetti → kit (sessione del kit), qui la prova su Pronti in Tavola.
