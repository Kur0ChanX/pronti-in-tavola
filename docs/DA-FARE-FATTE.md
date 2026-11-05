# Da fare · voci fatte

La storia dei lavori finiti (in `docs/DA-FARE.md` resta solo cosa manca).

- 05/11 · C5: anteprima del link su WhatsApp: tag og (indirizzo, immagine 1200×630 da 139 KB col logo e i decori sardi, testo) in `index.html`; immagine rifatta da `tools/immagine-link.js`; `tools/prova.js` controlla che og:url sia uguale a indirizzoApp (#7).
- 05/11 · Finestre (nota del piatto, nome della cliente nuova): se arriva un cambio mentre si scrive, testo e tastiera restano; tolto il vecchio codice dell'«invito personale» (#7).
- 05/11 · C1: motore dati.js con ascolti, scrittura dei soli campi cambiati, ordini dei clienti con transazione, nome al primo ordine e «ricollega» (28 prove nell'emulatore); regole del passaparola (50 prove).
- 05/11 · C1: schermate di Monica «Nuovi», «Telefono nuovo», Sì / No con Annulla, interruttore «Accetta clienti nuovi», prezzi di Monica, «inviato» del cliente nuovo (#4).
- 05/11 · C1: lucchetto della parte di Monica con impronta o PIN (`lucchetto.js`, WebAuthn): si chiede da solo, si richiude dopo 5 minuti fuori dall'app (Impostazioni 1-60), «Entra di nuovo con Google» se la chiave si perde, telefono senza blocco schermo con avviso, «Esci da questo telefono» (#5).
- 05/11 · C1: Monica con l'app aperta senza rete: modifiche in coda (anche ad app chiusa), gestore riconosciuto dalla copia del telefono, «Esci» aspetta la coda; pronti e teglie scritti come differenza, così quelli presi intanto dai clienti restano (65 prove nell'emulatore, #6).
- 05/11 · C2: foto dentro Firestore con tetto 300 KB; scaricate solo quando cambiano (versione nel piatto), poi dalla copia del telefono; copia veloce senza foto; il nome della cliente nuova non si perde se arriva una foto mentre scrive (72 prove nell'emulatore, #6).
- 05/11 · C3 (parte senza rete): `sw.js` (prima la rete, dopo 3 secondi o senza rete la copia; libreria Firebase e caratteri dalla copia) e `manifest.webmanifest` per la schermata Home (76 prove nell'emulatore, #6).
