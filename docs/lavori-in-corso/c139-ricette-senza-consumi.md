# C139 · Ricette senza consumi (Cloudflare mai più fermo per il ricettario)

## Parole di Mario (11/11 10:39, chat Principale 57)
«Una cosa, le ricette della palestra, quelle proteiche stanno crescendo, ma non vorrei che si ricreasse assolutamente quel problema di bloccare Claude Flare. Evitalo assolutamente, al massimo le ricette le aggiungiamo da Claude, ti dico di fare una ricerca e di aggiungerle tu manualmente, oppure dall'app, ma con doppia richiesta, con doppio clic, che magari esce un avviso che dice potrebbero consumare i dati di, e mi metti la cosa tecnica. Insomma, per le cose superflue facciamo attenzione ai consumi di tutta l'app. Deve funzionare bene io, Monica, e i clienti dobbiamo comunicare bene, con notifiche, risposte, tutto il funzionamento dell'app fatto bene, tutto il resto è superfluo.»

## Scelte (v0.10.19)
- Trovato: in Proteiche un tocco su un momento (🍽 Cena…) o su una fonte (🍗 Pollo…) e l'invio della ricerca facevano partire DA SOLI una ricerca sul web e un carico (C126). Ora filtrano solo le già lette.
- Doppia conferma (tocco + «OK», `okConsumo` in `ricettario.js`) con avviso tecnico (Durable Objects SQLite, 5 milioni di righe al giorno per tutta l'app, stima ricette, letture di oggi): «⚡ Carica altre», «🔄 Cerca adesso», «🔍 Controlla tutte», «🔍 Cerca altre».
- Freno del ricettario (`LETTURE_FONDO`) da 2 milioni a 1 milione (un quinto del gratis).
- v0.10.19 online 11/11 (prove 92 su 92, `okConsumo` nel sito vero). Aspetta Mario: strada 1-3 per le ricette nuove (file del sito scritto da Claude = zero letture).

## Strada 1 (Mario 11/11 11:25, nella #57 dopo l'handoff, parola per parola)
«Aggiungi 200 ricette proteiche specialmente dolci snack merenda colazione dopo allenamento poi il resto 
cerca da varie fonti»

## Piano (#58)
1. `tools/raccogli-fit.mjs` (gira sul computer di Claude, mai sul server): tutto RicetteFit + ricerche proteiche su GialloZafferano; tiene solo chi passa `fitRic` di `ricettario.js` (codice preso da lì, un posto solo); prima i momenti di Mario (fino a 3 su 4), poi il resto; niente doppioni di nome. Scrive `ricette-fit.js` (nome, foto, tempo, valori per porzione; dosi e passi dal sito d'origine all'apertura, PT E25).
2. App: `caricaRicette` carica anche `ricette-fit.js`; `elencoRic` le aggiunge (una già nel ricettario resta la sua). File in `FILE_APP` di `tools/sito.py` e nell'anteprima (come `ricette.js`, che non sta nel `GUSCIO`).
3. Prova nuova in `tools/prova.js` (le proteiche del file si vedono nei momenti), giro, v0.10.20, foto a Mario.

## Esito (#58, 11/11)
- v0.10.20 online: 191 proteiche in `ricette-fit.js` (RicetteFit 154, GialloZafferano 37) su 1.914 lette; 1.673 non passano le regole Proteiche, 26 senza valori. Non arrivano a 200: le altre non rispettano le soglie (soprattutto zuccheri dei dolci).
- Momenti: dolci 13, spuntino 14, merenda 4, colazione 3 (dopo la correzione PT E65), dopo l'allenamento 50. Pochi dolci e colazioni: le soglie snack (zuccheri ≤ 20% delle kcal) li scartano → domanda a Mario.
- v0.10.21: niente piatti salati in Colazione, Merenda, Dopo cena (PT E65).
- Rifare/aggiungere: `node tools/raccogli-fit.mjs 200` (pagine in `.cache-fit/`), prova `SOLO=C139`, giro, push.

## 11/11 #59 · Mario: «vai di consiglio» = DOMANDA 1 → 2
Soglie di base snack e dolci: proteine ≥ 8 g (era 10), quota ≥ 20 % (era 30), zuccheri ≤ 30 % (era 20); in `ricettario.js` (`fitRic`, nota) e `opzioni.js`. Poi `node tools/raccogli-fit.mjs 200`.
