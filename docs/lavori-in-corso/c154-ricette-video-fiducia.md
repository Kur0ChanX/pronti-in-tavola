# C154 · Ricette video: ingredienti di cui fidarsi

## Parole di Mario (13/11 ~15:30, parola per parola)
«mi sà che cancelliamo tutto cosí nom ha senso / non posso riguardare il video perché ho paura che manchi qualcosa / chissà in quanti altre ricette video mancano gli ingredienti.......»

## Causa trovata (#76)
- `tools/raccogli_video.py` `ingredienti()` buttava via INTERA ogni riga con `@` o `#` (es. «-5g cacao (noi degrassato @fitporn)», «-100g farina (… di @fitporn)»): 2foodfitlovers cita le marche così. Corretto: si toglie solo la menzione o la pubblicità.
- Rigenerato da YouTube: 92 ricette guadagnano ingredienti, 0 ne perdono (comprese le 13 di Pietrobon di C153). Patch `c154-ingredienti-video.patch` (sostituisce `c153-dosi-procedimento.patch`). Prove `SOLO=C144`, `SOLO=C150` verdi.
- Cambiano anche: 15 doppioni o non ricette tolti, 6 ricette nuove da YouTube, 18 nomi (ripubblicate: resta la più nuova).

## Conti (stima: controllo automatico su quanto scritto sotto il video, il parlato non si vede)
Dopo la correzione, 772 ricette: complete ~423 · qualche ingrediente senza dose ~187 (spesso «zucchero a velo», «frutti di bosco») · il procedimento cita dosi non in lista ~58 · Pietrobon senza ingredienti scritti 91 (+12 già dal parlato).
Script dei conti: da rifare (in scratchpad #76: `conta2.js`): portarlo in `tools/` se Mario sceglie «solo complete».

## Domanda 🛑 a Mario (#76): vedi «0. Aspetta Mario»
