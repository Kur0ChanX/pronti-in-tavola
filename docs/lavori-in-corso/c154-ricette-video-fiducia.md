# C154 · Ricette video: ingredienti di cui fidarsi

## Parole di Mario (13/11 ~15:30, parola per parola)
«mi sà che cancelliamo tutto cosí nom ha senso / non posso riguardare il video perché ho paura che manchi qualcosa / chissà in quanti altre ricette video mancano gli ingredienti.......»

## Causa trovata (#76)
- `tools/raccogli_video.py` `ingredienti()` buttava via INTERA ogni riga con `@` o `#` (es. «-5g cacao (noi degrassato @fitporn)», «-100g farina (… di @fitporn)»): 2foodfitlovers cita le marche così. Corretto: si toglie solo la menzione o la pubblicità.
- Rigenerato da YouTube: 92 ricette guadagnano ingredienti, 0 ne perdono (comprese le 13 di Pietrobon di C153). Patch `c154-ingredienti-video.patch` (sostituisce `c153-dosi-procedimento.patch`). Prove `SOLO=C144`, `SOLO=C150` verdi.
- Cambiano anche: 15 doppioni o non ricette tolti, 6 ricette nuove da YouTube, 18 nomi (ripubblicate: resta la più nuova).

## Conti (stima: controllo automatico su quanto scritto sotto il video, il parlato non si vede)
Dopo la correzione, 771 ricette: complete ~423 · qualche ingrediente senza dose ~187 (spesso «zucchero a velo», «frutti di bosco») · il procedimento cita dosi non in lista ~58 · Pietrobon senza ingredienti scritti 91 (+12 già dal parlato).
Script dei conti: da rifare (in scratchpad #76: `conta2.js`): portarlo in `tools/` se Mario sceglie «solo complete».

## Domanda 🛑 a Mario (#76): vedi «0. Aspetta Mario»

## Mario 13/11 ~15:40 (parola per parola)
«mettile online» → v0.10.28 (C152 + correzione C154), giro completo in locale, poi `[pubblica]`.
«e nei video fai un check a tutti e trascrivi bene tutti gli ingredienti almeno puoi dare un voto vero»
→ trascrizione di TUTTI i video (753 da fare, ~17,4 ore di video misurate da YouTube; limite gratis ~8 ore al giorno → ~3 giorni, stima).
→ `col_parlato`: ogni ricetta trascritta = `controllata`; lo scritto resta, il detto AGGIUNGE gli ingredienti mancanti (`unisci_ingredienti`) e la dose a quelli scritti senza; poi stima e voto ricalcolati.
Da fare: a trascrizione finita (o a blocchi ogni giorno) rigenerare, controllo a campione, versione nuova; nell'app «✅ controllata col video» (con la scelta di Mario 1/2).

## Mario 13/11 ~15:45 (parola per parola)
«Metti nei video ricetta controllata con Gemini, fai ricetta non controllata nei video e poi controlla se c'è un'altra soluzione. Per forza Gemini dobbiamo usare, non c'è nient'altro di performante a costo zero»
→ v0.10.28 ONLINE (giro 98/98, curl: versione e «5g cacao» ok). Scritte ✅/⚠️ in patch `c154-etichette.patch` (ricettario.js, ricette-video.js con 12 controllate, prova C150+C154 verde), foto mandate.
→ Alternative cercate 13/11: le API «transcript» leggono solo i sottotitoli già esistenti (bloccate dai server cloud o 100 crediti al mese: Supadata, TranscriptAPI); nessuna gratis che guardi e ascolti il video da un link come Gemini.
→ Ritmo vero: ~2 video ogni 5 minuti (503 «troppo carico» sui Flash nuovi): da misurare ancora; idea: 2-3 trascrizioni insieme.
