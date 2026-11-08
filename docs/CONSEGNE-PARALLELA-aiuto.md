# Consegne della chat parallela «Aiuto 1» (chiusa 08/11 ~11:25, alla soglia)

Aperta a mano da Mario 08/11 10:15 (`session_01WTjqUwARtSys2ePd2SL8qw`). Niente sessione nuova: il resto passa alla principale.

## Fatto
- Numerino della versione → foglio «Aggiornamenti dell'app» con data e ora (C63, online dalla 0.9.29; ogni voce di NOVITA porta `ora:`).
- Indagine lentezza: hook innocui (0,02-0,2 s); cause = contesto grande, tanti comandi piccoli, giro completo a ogni ritocco, rete chiusa (ora aperta da Mario: accesso completo), Fable più lento di Opus. Altro account: stesso kit e modello, ~11 min a versione contro ~22, lavori più semplici e niente siti bloccati.
- «Regime leggero» nel `CLAUDE.md` (Mario «1»). C39 era già fatta il 07/11 (voce di Da fare corretta).
- Errori PT E27, E28.

## Da fare (alla principale)
1. **Prove autonome** (regime leggero): `SOLO=<passo>` oggi NON fa risparmiare tempo: ogni passo da solo ha impiegato 90 s (il limite del mio ciclo), e i passi Monica dipendono da quelli prima (es. 11 e 12). Prima capire cosa gira fuori da `passo()` in `tools/prova.js` (attese, foto, preparazioni fra un passo e l'altro), poi dare a ogni passo il suo stato con `page.evaluate`. Esiti dei primi passi da soli:
    1 90s OK   benvenuto: nome e cognome alla prima apertura, poi «Ciao»
    2 90s NO   menù visibile → locator.waitFor: Timeout 30000ms exceeded. | Call log: | [2m  - waiting for locator('.voc
    3 90s NO   pronti subito visibili → attesi 2 pronti
    4 90s NO   allergia frutta a guscio → locator.click: Timeout 30000ms exceeded. | Call log: | [2m  - waiting for locat
    5 90s NO   lasagne particolari: gusto noci, 2 teglie da 8, nota → locator.click: Timeout 30000ms exceeded. | Call log:
    6 90s NO   polpette al kg: 1,5 kg → locator.click: Timeout 30000ms exceeded. | Call log: | [2m  - waiting for locator
    7 90s NO   pronto subito: panade → locator.click: Timeout 30000ms exceeded. | Call log: | [2m  - waiting for locator(
    8 90s NO   carrello: giorno, bonifico, invio → locator.click: Timeout 30000ms exceeded. | Call log: | [2m  - waiting 
    9 90s NO   due ordini creati (pronti + da preparare) → locator.click: Timeout 30000ms exceeded. | Call log: | [2m  - 
    10 90s OK   Monica: notifica e guida
    11 90s NO   Monica: accetta e propone → locator.click: Timeout 30000ms exceeded. | Call log: | [2m  - waiting for loc
    12 90s NO   Monica: etichette per le vaschette → locator.click: Timeout 30000ms exceeded. | Call log: | [2m  - waitin
2. **Regola «un comando raggruppato»** per tutti i progetti: Mario 08/11 ~11:30 «Puoi fare in modo di ottimizzarla avendo solo dei pro senza dei contro?» = sì, versione senza contro: si raggruppano SOLO i casi sicuri (letture, cambio + controllo sintassi, fetch/merge/push); le eccezioni restano comandi a sé; il controllo automatico AVVISA e non blocca mai. Da fare: testo pronto per la sessione di RVC (il kit vive lì; mai `add_repo`) con le eccezioni: passo che dipende dal risultato, prove poi commit (RVC E20), comandi rischiosi sui dati veri; più un controllo che avvisa dopo 4 comandi piccoli di fila.
