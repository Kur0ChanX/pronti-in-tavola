# C163 · Sconto di Monica su un ordine (con notifica carina al cliente)

## Parole di Mario (intere, 14/11 ~01:00, sessione #84)
«c'è l'opzione che Monica puoi mandare lo sconto anche fino aprima del ritiro nell'importo che vuole lei e se crea lo econto per l'ordine che si troverà in ordini tipo vuoi applicare uno sconto all'importo X e lei sceglie di quanto e al cliente arriva la notifica Monica ti ha applicato uno sconto o una frase carina con un cuore.
Tipo grazie per l'ordine ecc ecc la frase può essere editata delle impostazioni
per inviare lo sconto deve andare a doppia conferma da parte di Monica»
(stesso messaggio: «e Correggi i 2 buchi come consiglio» = C159 ordini di prova)

## Ho capito
Nell’ordine aperto (Ordini), finché non è ritirato, Monica tocca «Fai uno sconto», sceglie quanto, conferma due volte; il cliente riceve una notifica con una frase carina e un cuore (frase cambiabile nelle Impostazioni) e vede il prezzo nuovo. ✅ confermato da Mario (14/11 ~01:15, «1 1 ok / 2 in tutti e 2 i modi»: piano ok, sconto in euro e in percentuale).

## Occhio critico (deciso da me, salvo diverso parere di Mario)
- Il prezzo scontato vale ovunque: totale dell'ordine, incassi, messaggi WhatsApp, bonifico, «ti costa · ti restano» (C160).
- Sconto mai più del totale (niente prezzi sotto zero); solo ordini non ritirati, non annullati, non rifiutati.
- Già pagato col bonifico: avviso a Monica «ha già pagato: la differenza gliela rendi tu».
- Monica può cambiarlo o toglierlo prima del ritiro (doppia conferma anche lì); togliendolo nessuna notifica.
- Cliente senza notifiche: lo vede comunque in «I miei ordini» (prezzo vecchio barrato, nuovo accanto, frase col cuore).
- Ordine di prova: sconto possibile, notifica al cliente come sempre (serve proprio a provare).
- Mario e Monica insieme sullo stesso ordine: vale l'ultimo.
- Frase di base nelle Impostazioni → Messaggi: «Grazie per l'ordine, {nome}! Ti ho fatto uno sconto di {sconto}: ora paghi {totale} ❤️».

## Stato
- 14/11 01:12 Mario «1 1 ok / 2 in tutti e 2 i modi»: piano ok, sconto in euro E in percentuale. Codice dalla Principale 85.
- 14/11 #85: codice in PATCH `docs/lavori-in-corso/c163-sconto.patch` (app.js, aiutante.js, opzioni.js, data.js v0.10.33, style.css, sw.js, worker.js, tools/prova.js, tools/prova-database.mjs). Verifica: `git apply --check docs/lavori-in-corso/c163-sconto.patch`; applicata: `python3 -I tools/anteprima.py && SOLO=C163 node tools/prova.js` → OK; `node tools/prova-database.mjs` → 186 OK.
  Come funziona: `o.sconto = { modo: 'euro'|'perc', valore, il }` (togliere = `null`, non delete: il server aggiorna solo i campi presenti); `scontoSu`/`daPagare` in app.js usati in carta cliente e Monica, liste, incassi del giorno e del mese, WhatsApp {totale}, aiutante. Foglio `foglioSconto` (passo 1 → «Avanti» → passo 2 «Sì, manda lo sconto»; «Togli lo sconto» col suo sì). Niente «Annulla» dopo l'invio (l'avviso è già partito): si toglie dal tasto. Avviso: `/api/pronto` tipo `sconto` + `testo` (≤220 lettere, pulito) e `da`; sw.js titolo «<cuoca> ti ha fatto uno sconto ❤️». Frase: opzione `msgSconto` (parole {nome} {n} {sconto} {totale} {prima}). Aiutante: voce `ordini-sconto`.

