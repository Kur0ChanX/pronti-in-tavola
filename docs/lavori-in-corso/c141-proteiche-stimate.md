# C141 · Proteiche con valori stimati (500 ricette, metà dolci)

## Parole di Mario (11/11 sera, #61, parola per parola)
«Facciamo che apriamo le porte, facciamo allora la regola o la risposta 1, ma che apriamo le porte a tutto ciò che non è magari segnato con i valori, però se guardiamo i siti di fitness e i canali fitness non ci può dare delle ricette che non siano fitness, ecco, però magari facciamo una categoria a parte, sempre su proteiche, però magari mettiamo valori non verificati, così apriamo tantissime ricette. Io direi di ne possiamo aggiungere 500, non solo, metti tantissimi dolci, magari metti un 50% dolci, tutto il resto primi, secondi, post allenamento e quant'altro. Ma stai attento che magari se in un dolce c'è scritto cetriolo, yogurt non è un dolce, cioè il cetriolo non fa parte dei dolci, stai attento a quello. Io direi sì, un 50% tra merende, snack, dolci, e gli altri, cioè nel senso, metti più dolci e meno primi e secondi, però metteli anche quelli, sempre con ricette, anche con valori non verificati, prova a stimarli tu, e dello youtuber magari qualche valore lo dice lui.»
Prima (stessa sera): «Per i dolci cerca diversi dolci con la crema proteica, magari fatta con lo shake… albumi, yogurt greco… Philadelphia proteica… 200 ricette così. Ti avevo mandato anche un link di uno youtuber» → DOMANDA 1 = 1 (valori calcolati, scritti «stimati»).

## Specifica (decisa)
- **Dove**: Proteiche, una zona a parte «🧪 Valori stimati» (chip accanto alle altre). Ogni carta dice «valori stimati, non verificati» e la fonte. Le ricette coi valori ufficiali restano come sono.
- **Quante**: 500 nuove. ~50 % dolci + merende + snack + colazione; il resto primi, secondi, dopo l'allenamento.
- **Fonti** (solo fitness: le ricette nascono proteiche): Blog di GialloZafferano con parole fitness (ingredienti in JSON-LD), Cookpad Italia (ricerche «proteico», JSON-LD), canale YouTube di Massimo Pietrobon Gobbi (descrizioni dei video: ingredienti e «Kcal totali»; se lui dà i valori, valgono i suoi). Testo e passi: link alla fonte, come oggi (PT E25).
- **Stima**: ingredienti → grammi (tabella delle misure: cucchiaio, albume = 33 g, uovo = 55 g, vasetto…) → valori per 100 g dalla **tabella CREA** (alimentinutrizione.it, citata) e, per i prodotti proteici (whey, Philadelphia protein, skyr, crema proteica), etichette di **Open Food Facts** (dati aperti). Totale ÷ porzioni. Ingrediente non riconosciuto che pesa > 15 % → ricetta scartata (non si indovina).
- **Dolce o salato** (Mario: «il cetriolo non fa parte dei dolci»): dolce solo se ha almeno un ingrediente dolce (dolcificante, cacao, frutta dolce, miele, crema proteica…) e NESSUN ingrediente salato (cetriolo, cipolla, aglio, tonno, pollo, prosciutto, sale oltre un pizzico…). Elenco di parole provato su tutte le candidate (PT E65): foto dell'elenco a Mario prima di pubblicare.
- **Regola**: le stesse soglie di Proteiche (`fitRic`), sui valori stimati.
- Niente server: tutto in un file del sito (`ricette-stimate.js`), come `ricette-fit.js` (zero letture di Cloudflare).

## Pezzi (uno per sessione se serve; ognuno si prova da solo)
1. `tools/tabella-crea.mjs`: scarica le ~900 voci CREA (kcal, prot, carb, zuccheri, grassi, saturi, sodio per 100 g) + i prodotti proteici da Open Food Facts → `tools/dati/alimenti.json` (con codice e fonte). Prova: 20 alimenti noti a mano.
2. `tools/stima.mjs`: riga d'ingrediente → (alimento, grammi); stima per porzione; dolce/salato. Prova su 50 ricette del blog GZ che hanno anche i valori veri: scarto medio da misurare (atteso < 20 % sulle proteine, stima).
3. `tools/raccogli-stimate.mjs`: candidate da blog GZ, Cookpad, YouTube Pietrobon → stima → regola → 500 (metà dolci) → `ricette-stimate.js`.
4. App: zona «🧪 Valori stimati» in Proteiche, scritta sulla carta, file in `FILE_APP`/anteprima; prova in `tools/prova.js`; giro; foto a Mario.

## Stato
- 11/11 #61: specifica scritta. In parallelo gira la raccolta dei valori ufficiali con +50 parole (patch `c139-dolci-parole.patch`), per sapere quanti dolci «verificati» esistono.
- 11/11 #61 sera: pezzo 1 `tools/tabella_crea.py` (832 alimenti, scarico in corso, lento: ~1 pagina ogni 7 s) e pezzo 2 `tools/stima.py` scritti e salvati. Prova: «cetriolo + yogurt» = salato, «Cremini» di Pietrobon = dolce; la stima aspetta la tabella (uova = CREA).
- YouTube Pietrobon: il feed ufficiale (`youtube.com/feeds/videos.xml?channel_id=UCkQmObN7tBXzPQTQhlT704Q`) dà gli ultimi 15 video con ingredienti e i SUOI valori («Kcal totali… Per metà tortino: 335 kcal / 33,5 carbo / 23,5 prot / 13 grassi»). Le pagine dei video dal contenitore → controllo anti-robot di Google: NON si aggira (bloccato anche dalla guardia). Strada pulita per tutti gli 881: chiave gratuita «YouTube Data API v3» di Mario (request_credential, host www.googleapis.com).
- Raccolta dei valori ufficiali con +50 parole: 2.994 candidate, lenta (GialloZafferano risponde piano).
