# C125 · Fitness più severo, «🔍 Cerca ricette fit», ricette immediate (Mario 10/11 ~12:50, «vai di consiglio»)

Testo di Mario in `docs/MESSAGGI-MARIO.md`. Decisioni prese da Claude col consiglio (Mario: «vai di consiglio»). Un push per pezzo provato.

## Già deciso (non richiedere)
- **Instagram e YouTube: NO.** Le loro condizioni d'uso vietano di raccogliere i contenuti in automatico e le ricette non hanno un formato leggibile (niente JSON-LD `Recipe`, niente valori). PT E25: solo fonti attendibili. Lo si dice a Mario in una riga.
- **«Sembra solo GialloZafferano»**: RicetteFit è entrata con la v0.10.5 (12:45), dopo il controllo di Mario; il motore ne prende 1 ogni 10 minuti. Pezzo 4 rende il numero per fonte visibile.

## Pezzi (in quest'ordine)
1. **Soglie più severe, due profili** (`ricettario.js` `fitRic`, soglie in `opzioni.js` gruppo 'mario', mai numeri fissi):
   - Pasto (sopra `fitSnackKcal` = 300 kcal): proteine ≥ 25 g (era 20; ISSN 2017: 20-40 g a pasto) e ≥ 25% delle kcal (era 20; Reg. UE 1924/2006 «alto contenuto» = 20%), kcal ≤ 550, saturi ≤ 10% kcal, zuccheri ≤ 10% kcal (OMS), sodio ≤ 700 mg.
   - Snack e dolci proteici (fino a 300 kcal): proteine ≥ 10 g e ≥ 30% delle kcal, zuccheri ≤ 15% kcal, sodio ≤ 400 mg, saturi ≤ 10% kcal. Numeri 10 g, 30%, 15%, 400 mg = **stime di Claude** (dirlo a Mario).
   - Riga «perché è qui» con «Pasto» o «Snack»; ordine: proteine per 100 kcal. Prova in `tools/prova.js` passo C124 (aggiornare le attese).
2. **«⚡ Pronte in 10 minuti»** dentro «🏋️ Proteiche» (chip; `totale` ≤ `fitVeloci` minuti, Impostazioni) e parole nuove della corsia fit (`FIT_BASE`, `worker.js`): «proteine in polvere», «proteico», «pancake proteici», «budino proteico», «mug cake», «overnight oats», «skyr». Attenzione: se Mario ha già salvato parole sue, le base non cambiano da sole → aggiungere solo se la lista salvata è quella di base.
3. **«🔍 Cerca ricette fit»** nella sezione Proteiche: cerca nel database (tutte le fonti) con le parole + filtro fit; in più dal vivo su GialloZafferano con «<parole> light/proteico». RicetteFit: robots vieta `/?s=` → solo dal database (tutte le ~905 entro ~6 giorni).
4. **Numero per fonte** nella pagina Database e nella Home Proteiche («GialloZafferano N · RicetteFit N»): `statoDb` conta per prefisso dell'id.
5. **Fonti nuove attendibili** (una per volta, ognuna provata dal vivo PT E29 e dal sito vero PT E25, `robots.txt` letto): cercare siti italiani con JSON-LD `Recipe` + `nutrition` scritti da nutrizionisti o enti (candidati da verificare: Fondazione Veronesi, Melarossa, Humanitas). Scartati: GymBeam e blog di negozi di integratori (prodotti loro), A Tavola col Nutrizionista (niente passi strutturati).
