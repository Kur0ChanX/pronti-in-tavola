# C139 · Ricette senza consumi (Cloudflare mai più fermo per il ricettario)

## Parole di Mario (11/11 10:39, chat Principale 57)
«Una cosa, le ricette della palestra, quelle proteiche stanno crescendo, ma non vorrei che si ricreasse assolutamente quel problema di bloccare Claude Flare. Evitalo assolutamente, al massimo le ricette le aggiungiamo da Claude, ti dico di fare una ricerca e di aggiungerle tu manualmente, oppure dall'app, ma con doppia richiesta, con doppio clic, che magari esce un avviso che dice potrebbero consumare i dati di, e mi metti la cosa tecnica. Insomma, per le cose superflue facciamo attenzione ai consumi di tutta l'app. Deve funzionare bene io, Monica, e i clienti dobbiamo comunicare bene, con notifiche, risposte, tutto il funzionamento dell'app fatto bene, tutto il resto è superfluo.»

## Scelte (v0.10.19)
- Trovato: in Proteiche un tocco su un momento (🍽 Cena…) o su una fonte (🍗 Pollo…) e l'invio della ricerca facevano partire DA SOLI una ricerca sul web e un carico (C126). Ora filtrano solo le già lette.
- Doppia conferma (tocco + «OK», `okConsumo` in `ricettario.js`) con avviso tecnico (Durable Objects SQLite, 5 milioni di righe al giorno per tutta l'app, stima ricette, letture di oggi): «⚡ Carica altre», «🔄 Cerca adesso», «🔍 Controlla tutte», «🔍 Cerca altre».
- Freno del ricettario (`LETTURE_FONDO`) da 2 milioni a 1 milione (un quinto del gratis).
- v0.10.19 online 11/11 (prove 92 su 92, `okConsumo` nel sito vero). Aspetta Mario: strada 1-3 per le ricette nuove (file del sito scritto da Claude = zero letture).
