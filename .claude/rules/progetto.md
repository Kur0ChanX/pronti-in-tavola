---
paths:
  - "app.js"
  - "data.js"
  - "style.css"
  - "index.html"
  - "media/**"
---
# Regola a richiesta: regole del prodotto Pronti in Tavola
- Semplicissima: una cosa per schermata, pulsanti grandi con parole, niente tasto Salva (si salva da solo), «Annulla» per 10 secondi. Monica deve fare tutto da sola.
- Solo italiano, frasi corte, «tu» ai clienti.
- **Ogni funzione nuova anche nell'aiutante di chi gestisce** («Chiedi all'aiutante…» nella Home di Monica): Monica e Mario la cercano e la cambiano anche da lì. Nella stessa versione: voce in `aiutante.js` (`VOCI`/`VOCI_PIATTO`, con `come` e `parole`), voce e GUIDA dell'app in `worker.js` (azione «vai»), una prova in `tools/prova.js`. Solo cose base e sicure: portare al punto giusto, cambiare un valore dopo «Faccio?»; mai azioni che rompono dati o codice.
- Colori dal logo: bordeaux `#7B2318`, terracotta `#C4532E`, ocra `#E8B46A`, crema `#FBF4E8`, basilico `#4C6A36`. Caratteri Fraunces (titoli) e Nunito Sans (testo). Stile «trattoria moderna», decori sardi solo leggeri (trama «a pibiones», bordura a rombi).
- Firma: «Powered by» + logo YNOY Corp con le 4 lune (`media/ynoy-firma.png`), mai le versioni vecchie con la scia.
- Dati (con Firebase): «salvato» solo dopo la conferma del server; senza rete si vede il menù e si dice chiaro che l'ordine partirà o non è partito; due persone sull'ultimo «pronto subito» → transazione.
- Allergie del cliente solo sul suo telefono (dato sulla salute).
- Pagamento oggi: solo contanti al ritiro (bonifico e Postepay spenti).
