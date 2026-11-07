# Da fare · voci fatte

La storia dei lavori finiti (in `docs/DA-FARE.md` resta solo cosa manca).

- 05/11 · C5: anteprima del link su WhatsApp: tag og (indirizzo, immagine 1200×630 da 139 KB col logo e i decori sardi, testo) in `index.html`; immagine rifatta da `tools/immagine-link.js`; `tools/prova.js` controlla che og:url sia uguale a indirizzoApp (#7).
- 05/11 · C8: coi dati veri niente striscia «Prova» né «Ricomincia la prova», per Monica e per i clienti (controllato nell'emulatore; il telefono vero resta in C1). «Manda questo piatto a un'amica»: testo del passaparola («Puoi ordinare anche tu da qui»), niente «#da=» vuoto (#7).
- 05/11 · Finestre (nota del piatto, nome della cliente nuova): se arriva un cambio mentre si scrive, testo e tastiera restano; tolto il vecchio codice dell'«invito personale» (#7).
- 05/11 · C1: motore dati.js con ascolti, scrittura dei soli campi cambiati, ordini dei clienti con transazione, nome al primo ordine e «ricollega» (28 prove nell'emulatore); regole del passaparola (50 prove).
- 05/11 · C1: schermate di Monica «Nuovi», «Telefono nuovo», Sì / No con Annulla, interruttore «Accetta clienti nuovi», prezzi di Monica, «inviato» del cliente nuovo (#4).
- 05/11 · C1: lucchetto della parte di Monica con impronta o PIN (`lucchetto.js`, WebAuthn): si chiede da solo, si richiude dopo 5 minuti fuori dall'app (Impostazioni 1-60), «Entra di nuovo con Google» se la chiave si perde, telefono senza blocco schermo con avviso, «Esci da questo telefono» (#5).
- 05/11 · C1: Monica con l'app aperta senza rete: modifiche in coda (anche ad app chiusa), gestore riconosciuto dalla copia del telefono, «Esci» aspetta la coda; pronti e teglie scritti come differenza, così quelli presi intanto dai clienti restano (65 prove nell'emulatore, #6).
- 05/11 · C2: foto dentro Firestore con tetto 300 KB; scaricate solo quando cambiano (versione nel piatto), poi dalla copia del telefono; copia veloce senza foto; il nome della cliente nuova non si perde se arriva una foto mentre scrive (72 prove nell'emulatore, #6).
- 05/11 · C3 (parte senza rete): `sw.js` (prima la rete, dopo 3 secondi o senza rete la copia; libreria Firebase e caratteri dalla copia) e `manifest.webmanifest` per la schermata Home (76 prove nell'emulatore, #6).
- C10 (05/11, #9): indirizzo del sito deciso da Mario, `pronti-in-tavola.pages.dev` («pronti-in-tavola.pages.dev questo»); cambiato in `data.js`, `index.html` (og:url, og:image) e `docs/SPECIFICA.md`.
- C4, parte (05/11, #9): `tools/sito.py` mette in `sito/` solo i file dell'app (8 file + 17 immagini, niente docs né archivio); provato in locale (niente errori né file mancanti, guscio offline attivo).

- 05/11 (#10) C14, storia: «Persone rifiutate» (Mario 05/11 «1 ok»): fatta il 05/11, in fondo a Clienti; «Accetta» = il Sì di sempre (anche `decidi` accetta un telefono in stato «no»; Annulla lo rimette «no»). Prove: app 23 OK, motore 83 OK. Corretto il 05/11 (#10): dopo «Accetta» + «Annulla» il telefono del cliente non rileggeva il «No» dal vivo; ora, quando un ascolto viene rifiutato, rilegge il suo stato dal server (`rileggiUtente` in `dati.js`) e toglie indirizzo e ordini letti prima. Prova nuova nel motore. Da riprovare con due telefoni veri. 👁 Lo vedi: nell'app online, dopo un No, in Clienti compare «Persone rifiutate (1)» · prova: foto dal telefono di Mario

- 05/11 (#10-#11) Fase 3. Fatto il 05/11 (#10): incassi del mese nella Home di Monica (già presi, da prendere, mese scorso, piatti che rendono di più). Costo per piatto: prezzi negli ingredienti della spesa, «Quanto ti costa» e «ti restano» nella scheda del piatto. Immagine del menù (I miei piatti → «Immagine del menù da mandare», condividi o scarica). Etichette per le vaschette (05/11, #11): Ordini → Da preparare → «Etichette per le vaschette», foglio A4 da 10 (105 × 57 mm) con nome, piatto, quantità, note e «Contiene:», una per teglia. 👁 Lo vedi: nell'anteprima, Ordini → Da preparare

- 07/11 (#15) C21: link dell'invito corretto (`SITO` da `data.js`, PT E15); 3 biglietti d'invito in foto (Monica `#gestore-m`, chiunque `#gestore`, amici `#da=monica`), foto `archivio/foto/biglietti-invito-tre-07-11.jpg`.
