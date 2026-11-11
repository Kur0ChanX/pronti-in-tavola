# C140 · Giri di prova: prima il PC di casa, poi Blacksmith, poi GitHub (tutti i progetti)

## Parole di Mario (11/11 ~11:45, Principale 58, intere)
«Domanda, puoi fare in modo che tutti i progetti possano passare per il mio GitHub a casa, che ho creato un server, se provano inizialmente il mio server del PC a casa per fare i giri di prova su GitHub, se è occupato da un altro progetto che non c'è spazio passano a Blacksmith, se ho finito i crediti di Blacksmith passa a GitHub server normale, quello con quello il server gratuito, ecco, con i limiti per chi ce li ha, per chi ha un progetto privato, chi ce l'ha pubblico invece è un altro discorso.»

## Fatti (manuali GitHub letti l'11/11/2026)
- Un motore di casa (self-hosted runner) serve UN repository, oppure tutti quelli di un'ORGANIZZAZIONE. Su un account personale: un motore per progetto (più cartelle sullo stesso PC) o un'organizzazione gratuita con i progetti spostati dentro.
- GitHub sconsiglia il motore di casa per i progetti PUBBLICI (chiunque apre una PR fa girare codice sul PC). I pubblici hanno GitHub gratis: vanno lì.
- GitHub non ha «se è occupato passa a un altro»: un giro aspetta in coda. Serve un passo che sceglie prima (motore libero? crediti Blacksmith?). Per sapere se il PC è libero serve una chiave di sola lettura dei motori.
- Questo progetto ha già il posto: `runs-on: ${{ vars.PROVE_RUNNER || 'ubuntu-latest' }}` e `tools/scegli-giro.py` (oggi: contenitore, Blacksmith, GitHub).

## Stato
Domande a Mario (riga in «## 0. Aspetta Mario»). Regola per tutti i progetti → kit (sessione del kit), qui la prova su Pronti in Tavola.
