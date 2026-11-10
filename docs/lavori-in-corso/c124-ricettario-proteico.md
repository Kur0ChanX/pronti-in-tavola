# C124 · Ricettario proteico e migliorie (piano della Principale 42, 10/11/2026)

Richiesta di Mario (10/11 ~11:20), parola per parola in `docs/DA-FARE.md` voce C124.

## Già verificato dal vivo (10/11/2026)
- **GialloZafferano ha i valori per porzione** su ogni ricetta: nel JSON-LD `"nutrition":{"calories":"558,7 kcal","carbohydrateContent":"61,2 g","sugarContent":"2,5 g","fatContent":"23,9 g","saturatedFatContent":"9 g","fiberContent":"2,7 g","cholesterolContent":"255,9 mg","sodiumContent":"475 mg"}` (virgola decimale). **Le proteine NON sono nel JSON-LD**: sono nell'HTML, lista `gz-list-macros` (`gz-list-macros-value">22,8` accanto a «Proteine»). Prova: `Spaghetti-alla-Carbonara.html`.
- `gz.mjs` riga ~89 legge già `difficolta` («Difficoltà») e `costo`; i valori nutrizionali NON li legge ancora.
- Fonti fit trovate (curl 200, 10/11):
  - **RicetteFit.it** (`/ricetta/<slug>/`, «La Cuoca Fit», non nutrizionista): JSON-LD `Recipe` con `nutrition` completo (calorie, proteine, grassi, saturi, zuccheri, sodio, fibre, `servingSize`) e 11 `HowToStep` ognuno con `image`. Consiglio di Claude.
  - **A Tavola col Nutrizionista** (`/ricette/<slug>/`, Dott. Giuseppe Scopelliti, biologo nutrizionista): JSON-LD `Recipe` con solo calorie, carboidrati, proteine, grassi; nessun `HowToStep` strutturato, niente foto dei passi.
  - GymBeam blog: ricette con proteine in polvere del negozio: scartato.
- Scelta della fonte: 🛑 domanda in «## 0. Aspetta Mario» (1 RicetteFit · 2 A Tavola col Nutrizionista · 3 tutte e due · 4 solo GZ). Finché Mario non risponde: solo GialloZafferano.

## Regola «🏋️ Proteiche» (valori per porzione; soglie regolabili in Impostazioni → Sviluppatore)
| Valore | Soglia di base | Fonte (letta il 10/11/2026) |
|---|---|---|
| Proteine | ≥ 20 g | ISSN Position Stand 2017 (PubMed 28642676): 20-40 g a pasto, anche in deficit calorico |
| Proteine | ≥ 20% delle kcal | Reg. UE 1924/2006: «ad alto contenuto di proteine» |
| Calorie | ≤ 550 | stima di Claude (pasto in definizione) |
| Grassi saturi | ≤ 10% delle kcal | OMS, scheda «Healthy diet» (26/01/2026) |
| Zuccheri | ≤ 10% delle kcal | OMS (zuccheri liberi; GZ conta tutti gli zuccheri: più severo) |
| Sodio | ≤ 700 mg | OMS: 2 g di sodio al giorno (5 g di sale), diviso 3 pasti |
Ordine nella sezione: grammi di proteine per 100 kcal (più alto prima). Su ogni ricetta: riga «perché è qui» (es. «32 g proteine · 410 kcal · sale basso»).

## Passi (in quest'ordine, un push per pezzo provato)
1. `gz.mjs`: leggere i valori (JSON-LD + proteine dall'HTML) → `nutr: {kcal, prot, carb, zuc, grassi, saturi, fibre, sodio}` nella ricetta. Prova in `tools/prova-database.mjs` con una pagina finta (virgole decimali, proteine mancanti = null, mai 0).
2. `worker.js`: le 1296 ricette già salvate senza `nutr` → rilettura a piccoli gruppi nel giro a orario (mai bloccare, PT E29), con esito scritto. Elenco del database (`worker.js` ~893) con i valori per porzione.
3. `ricettario.js`: sezione «🏋️ Proteiche» (filtro + ordine), riquadro «Valori per porzione» su ogni ricetta, ordina per «più proteine» / «meno calorie».
4. Filtro difficoltà: oggi c'è solo «facile» (`f.facile`, riga ~429): chip Tutte · Facile (anche «Molto facile») · Media · Difficile.
5. Tasto «🗄 Database» (`ric-salta`, `ricettario.js` ~882): `behavior: 'smooth'` → salto diretto (`'instant'`), Mario: «non scorrere, deve andare direttamente».
6. Home di Monica (`app.js` `vHome`, ~1181): il riquadro «Ricettario» oggi è in fondo dopo «Da preparare»; spostarlo subito sotto i 4 riquadri, largo, coi numeri (ricette, proteiche). Foto a Mario (cambia l'aspetto).
7. Fonte su ogni ricetta: segno «GialloZafferano» sulle schede e «Fonte: GialloZafferano» nella ricetta; per le altre fonti il loro nome; quelle di Monica «Ricetta di Monica».
8. Fonte in più (solo dopo la scelta di Mario): stesso motore, sezione per sito, fonte scritta.
Soglie e interruttori in `opzioni.js` (gruppo dev), mai numeri fissi nel codice (regola «Senza Claude»).
