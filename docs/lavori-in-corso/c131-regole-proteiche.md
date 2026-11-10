# C131 · Regole di «🏋️ Proteiche»: quante ricette taglia ognuna (misura dal vivo)

Mario 10/11 ~15:58 «le regole… sono valide o taglia tantissime ricette?»; 16:15 «vai di consiglio» (= misura e proponi soglie coi numeri).

## Campione (Principale 50, 10/11 ~16:25)
- 250 ricette vere lette coi lettori dell'app (`rf.mjs`, `gz.mjs`): 120 RicetteFit a caso dalla sitemap + 130 GialloZafferano (10 per parola: pollo, tacchino, manzo, uova, tonno, salmone, gamberi, ricotta, yogurt greco, ceci, lenticchie, merluzzo, proteico). Regola uguale a `fitRic` di `ricettario.js`.
- Senza tutti i valori: 5 su 250 (2%): non è un problema.
- «Da palestra» = almeno 25 g di proteine E almeno 25% delle calorie dalle proteine (le soglie di proteine di oggi): 60 su 245.

## Esito con le soglie di oggi
- Entrano 18 su 245 (7%); delle 60 «da palestra» ne entrano 17 (28%).
- Le 43 «da palestra» tagliate, per motivo (una può averne più): grassi saturi oltre 10% delle kcal 29 · sodio oltre 700 mg 26 · oltre 550 kcal 17 · zuccheri oltre 10% 5.
- Tagliate da UNA sola regola: saturi 11 (Pollo ai peperoni 12%, Arrosto di manzo 12%, Salmone al forno 12%, Straccetti di manzo 15%, Polpette di tacchino 14%), sodio 7 (720-934 mg: Pollo al curry e yogurt, Tofu speziato, Ragù di tacchino, Insalata di gamberi), zuccheri 2 (Uova alla boscaiola 14%, Tonno in agrodolce 12%).
- Snack: 4 su 15 candidati (≤300 kcal, ≥10 g, ≥30%).
- Le regole di proteine (25 g, 25%) sono giuste: tolte, entrerebbero quasi solo contorni.

## Proposte (stesse regole di proteine)
| | Saturi | Zuccheri pasto/snack | Sodio pasto/snack | Kcal pasto | Entrano | Da palestra | Snack |
|---|---|---|---|---|---|---|---|
| Oggi | 10% | 10% / 15% | 700 / 400 mg | 550 | 18 | 17/60 | 4/15 |
| P1 (consiglio) | 13% | 15% / 20% | 800 / 500 mg | 550 | 29 (+11) | 25/60 | 7/15 |
| P2 (più larga) | 15% | 15% / 20% | 900 / 500 mg | 650 | 35 (+17) | 31/60 | 9/15 |

- P1 aggiunge: Pollo ai peperoni, Pollo al curry e yogurt, Arrosto di manzo, Salmone al forno, Ragù di tacchino, Tofu speziato, Tonno in agrodolce, Uova alla boscaiola, Involtini di peperoni col tonno, Gamberi gratinati, Medaglioni di merluzzo.
- P2 in più: Filetto di salmone in padella (640 kcal), Burger di tacchino (565 kcal), Polpettone di tonno, Straccetti di manzo (saturi 15%), Polpette di tacchino (14%), Carpaccio di baccalà.
- Restano fuori con tutte e due (giusto): Pollo alla crema (saturi 35%), Tagliata (23%), Frittata (18-19%), Petti di pollo al latte (21%), Spezzatino (sodio 1.500), Tonno sott'olio (sodio 3.300).
- Perché: la regola OMS «saturi sotto il 10%» vale per tutta la giornata; un piatto ricco di proteine ha pochi carboidrati, quindi la sua parte di grassi è più alta anche se è magro (salmone, manzo magro). Sodio: 800 mg = 2 g di sale, poco più di un terzo dei 5 g OMS al giorno. Zuccheri: GZ e RicetteFit contano anche quelli di latte, yogurt e verdure, non solo lo zucchero aggiunto.
- Stima su tutto l'archivio: circa +60% di ricette in Proteiche con P1 (campione di 250, non tutto l'archivio).

## Come si cambia
- Mario lo può fare da solo, subito: Impostazioni → «Solo per te, Mario» → «Proteiche: grassi saturi massimi», «zuccheri massimi», «sodio massimo» (e quelle degli snack).
- Oppure Claude cambia le soglie di base (`opzioni.js` `def` + i valori di riserva in `fitRic`), con prova e novità.
