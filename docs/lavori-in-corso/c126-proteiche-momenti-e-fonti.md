# C126 · Proteiche per momenti, fonti proteiche e più siti (Mario 10/11 ~13:57)

Testo di Mario in `docs/MESSAGGI-MARIO.md` (10/11 ~13:57, foto `archivio/foto/2026-11-10-1356-proteiche-albumi.jpg`).
Viene dopo C125 (v0.10.6-0.10.9). Codice: `ricettario.js` (`cercaFitBox`, `FIT_CERCA`, `sceltaFit`, `fitRic`), `worker.js` (`cercaFit`, `FIT_BASE`), `rf.mjs`.

## Cosa chiede Mario
1. «perché ricerca solo in questo modo… non aggiungiamo altre fonti?» → più siti oltre GialloZafferano e RicetteFit.
2. «6 selezioni così sono troppo vincolato»: le 6 parole (Pollo, Tonno, Albumi, Pancake, Budino, Yogurt) → per MOMENTO: colazione, spuntino, merenda, pranzo, cena, dolce, dopo cena «ecc».
3. «poi se voglio scelgo la fonte proteica, ma mettine tante»: la fonte proteica è una scelta in più, facoltativa, con molte voci.
4. «cerca e le aggiunge al meglio nelle mie ricette, scritte bene, chiare, complete, con foto, video, passo per passo».

## Decisioni col consiglio (dette a Mario; cambiano solo se lui dice altro)
- Momenti (riga di scelte nel riquadro «🔍 Cerca ricette fit» E filtro dell'elenco Proteiche): 🌅 Colazione · 🍎 Spuntino · 🧃 Merenda · 🍝 Pranzo · 🍽 Cena · 🌙 Dopo cena · 🍰 Dolci · 💪 Dopo l'allenamento. Un tocco = filtra le già lette di quel momento + cerca su tutte le fonti le parole di quel momento (es. Colazione → «colazione proteica», «pancake proteici», «porridge», «overnight oats»).
- Momento di una ricetta (in un punto solo, come `catRic`, PT E49): categoria del sito (RicetteFit ha «Colazione»…), parole del nome, profilo pasto/snack di `fitRic`. Una ricetta può stare in più momenti (pranzo e cena).
- Fonte proteica: riga sotto, chiusa di base («🥩 Scegli la fonte proteica (facoltativo)»), ~18 voci: pollo, tacchino, manzo, maiale magro, uova, albumi, tonno, salmone, merluzzo, gamberi, polpo e calamari, ricotta, fiocchi di latte, yogurt greco e skyr, legumi, tofu e tempeh, seitan, proteine in polvere. Momento + fonte = tutte e due.
- Voci di momenti e fonti regolabili dalle Impostazioni (riga «Senza Claude»), come `FIT_BASE`.
- «Pronte in N minuti» resta.

## Fonti (Mario 10/11 ~14:25 «2 ma metti una sezione a parte quelli con valori calcolati o segnami semplicemente la fonte nella ricetta e capisco»)
- DECISO: A + B. Ricette coi valori calcolati: in ogni ricetta e carta la fonte (sito) e «valori calcolati» ben visibili (consiglio: etichetta sulla carta + riga nei valori; più semplice di una sezione a parte e Mario dice che gli basta). Specifica di B in questo file prima del codice.
- A · siti CON i valori per porzione: da provare dal vivo uno per uno (PT E29, robots.txt, sito vero PT E25): FatSecret Italia (pagina 200 il 10/11, robots da leggere), Yazio (`/it/ricette` 404: cercare l'indirizzo giusto), MyProtein «The Zone» (robots con molte righe: leggere se vieta), Foodspring (non risponde dal contenitore il 10/11). Già scartati: Melarossa, Fondazione Veronesi, Starget (C125), GymBeam (#42, da rivedere: Mario 12:50 vuole anche ricette con proteine in polvere).
- B · siti SENZA valori (molte più ricette): valori calcolati dall'app dagli ingredienti con le tabelle ufficiali CREA, scritti «circa, calcolati». Rischio errori (q.b., cucchiai): solo se Mario dice sì; specifica a parte prima del codice.
- Ogni ricetta nuova entra come le altre: passi, foto (dei passi solo se il sito le ha), video se c'è, fonte scritta.

## Pezzi (in quest'ordine, un push per pezzo provato)
1. ✅ v0.10.10 (Principale 46) Momenti al posto delle 6 parole e di «Pasti / Snack e dolci» + filtro momento in Proteiche: `ricettario.js` `MOMENTI_FIT` (parole da cercare, max 4), `PAROLE_MOM`, `momentoRic`; `worker.js` `cercaFit` con `qq`. Prove: passi C125 aggiornati, «C126 momento» in `tools/prova-database.mjs`. Le parole dei momenti nelle Impostazioni: col pezzo 2. Anche «Cerca nuove ricette fit su tutti i siti» (Mario 14:10 «senza selezionare… mi cerca tutto»): `{ db: 'cercaFit', tutto: true }` = `FIT_TUTTO` su GZ + le prossime 30 di RicetteFit da `rf.i`.
2. ✅ v0.10.11 (Principale 46) Fonte proteica facoltativa: `ricettario.js` `FONTI_PROT` (19), `haFonteProt` (nome + ingredienti), `f.prot`, «🥩 Fonte proteica (facoltativo)» apre/chiude, tocco = filtra + `cercaFit(…, 'p:'+k)`. Manca: momenti e fonti regolabili dalle Impostazioni (riga «Senza Claude»).
3. Fonti A provate dal vivo; ognuna buona = lettore come `rf.mjs` + corsia del motore + ricerca.
4. Fonti B: solo dopo il sì di Mario.
