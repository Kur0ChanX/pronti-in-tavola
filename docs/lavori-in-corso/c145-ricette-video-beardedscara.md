# C145 · Ricette video di Beardedscara (secondo youtuber in «🎬 Ricette video»)

## Parole di Mario (11/11 ~22:47, Principale 66, intere)
Foto in chat (storia Instagram di un amico con un reel di «beardedscara», Kürtőskalács; NON salvata nel repo: è pubblico e la foto ha nomi e volti di altre persone) e: «aggiungi tutti  i suoi video di ricette»

## Fatti (11/11 #66)
- «beardedscara» ha un canale YouTube: «Beardedscara ScaraLegacy®» (Dr. Raffaele Scarabelli, «Ricette FELICI»), id `UCWhoPXcEJRPWxtIwjSGgpug`, @scaralegacy479, 205 video, 271.000 iscritti (YouTube Data API, 11/11). Instagram NO (Agent Reach scartato #59: social, rischio, cookie): solo YouTube.

## Piano (per la #67)
1. `tools/raccogli_video.py`: aggiungere `('Beardedscara', 'UCWhoPXcEJRPWxtIwjSGgpug')` in `CANALI` (nome come lo scrive lui: decidere fra «Beardedscara» e «Raffaele Scarabelli»: consiglio «Beardedscara» come su Instagram).
2. Rilanciarlo con `--elenco` e leggere a occhio TUTTE le righe del suo canale (PT E65): le sue descrizioni hanno un'altra forma (ricette normali, non fit: di solito niente valori) → controllare ingredienti, nomi, tipi (forse servono tipi nuovi: primi, secondi, lievitati…), doppioni.
3. `ricette-video.js` rifatto entra nella patch di C144 (stesso giro di foto e pubblicazione: una foto in più col secondo riquadro).

## Stato
- 11/11 #67 FATTO nella patch `docs/lavori-in-corso/c144-app.patch`: `CANALI` + `A_SEZIONI` e `sezioni()` in `tools/raccogli_video.py` (lui scrive ingredienti, preparazione, valori e considerazioni a sezioni). 205 video → 67 ricette (54 coi suoi valori, 4 stimate, 63 coi passi → «Passo passo» e «Ascolta»; considerazioni in «Cosa scrive sotto il video»). Nome «Beardedscara». Fuori: video di informazione (tonno, würstel…) e «Crudaiola» (ricetta nel primo commento). Pietrobon invariato (201). Letti a occhio tutti i 67 (PT E65). Manca: foto a Mario e il suo «1».
