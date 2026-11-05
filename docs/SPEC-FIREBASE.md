# Dati veri con Firebase · specifica corta (C1 + C2)

Versione 0.1 · 05/11/2026 · da far vedere a Mario prima del codice. In discussione (05/11): link unico per il passaparola, impronta o PIN per Monica: le tabelle «Accessi» cambiano con le risposte. Finito il lavoro va in `docs/piani-finiti/`.
Fonti controllate oggi (pagine ufficiali aggiornate fra il 20/10 e il 03/11/2026):
- Firestore gratis: 1 GiB, 50.000 letture e 20.000 scritture al giorno, 10 GiB al mese in uscita (https://firebase.google.com/docs/firestore/quotas).
- Cloud Storage (le foto) e Cloud Functions chiedono il piano Blaze, con carta di credito, dal 03/02/2026 anche per i progetti vecchi (https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).
- Notifiche (Cloud Messaging) gratis; accesso anonimo fino a 100 milioni di utenti; accesso via email col link: solo 5 al giorno sul piano gratis (https://firebase.google.com/docs/auth/limits).
- Cloudflare Workers gratis: 100.000 richieste al giorno (https://developers.cloudflare.com/workers/platform/limits/).

## Scelte
| Tema | Scelta | Perché |
|---|---|---|
| Piano | **Spark**, gratis, senza carta | Già deciso «gratis». Se si superano i limiti il servizio si ferma, non arriva un conto |
| Foto | Dentro Firestore, una per documento, 900 px JPEG 0,8 (tetto 300 KB) | Storage vuole la carta |
| Indipendenza | Progetto Firebase e account Cloudflare solo dell'app (Mario 05/11) | I limiti gratuiti di Firebase valgono per progetto, quelli dei Worker di Cloudflare per account: così non si toccano le altre app |
| Notifiche (C3) | Un Worker gratuito di Cloudflare, nell'account dell'app, manda la notifica a Monica | Le Functions vogliono la carta |
| Cliente | Accesso anonimo invisibile + link personale `#i=codice` (codice casuale di 20 caratteri) | Il cliente non crea account né password |
| Monica | Accesso col suo account Google (un tocco su Android) | Sicuro, niente password da ricordare. Mario: stesso modo, come riserva |
| Chi gestisce | Documento `gestori/<id>` creato una volta da Mario nella console | Nessun dato personale nel codice |
| Pagina di prova | Resta con i dati sul telefono (`?prova`), per le prove e l'anteprima | Le prove non toccano i dati veri |

## Raccolte
| Raccolta | Cosa c'è | Legge | Scrive |
|---|---|---|---|
| `piatti/{id}` | nome, formati e prezzi, gusti, ingredienti, allergeni, pronti, nel menù, novità, cuori | invitati e Monica | Monica; il cliente solo «pronti» in meno e «cuori» +1, insieme a un suo ordine |
| `foto/{piatto}` | la foto come testo | invitati e Monica | Monica |
| `impostazioni/app` | pausa, anticipo, limite, ora dei pronti, Natale, pagamenti, ritiro, WhatsApp di Monica | invitati e Monica | Monica |
| `impostazioni/monica` | numero di Mario, cose solo sue | Monica | Monica |
| `clienti/{id}` | nome, da quando | Monica; il cliente il suo | Monica |
| `inviti/{codice}` | cliente, attivo | chi conosce il codice | Monica |
| `telefoni/{uid}` | quale cliente è questo telefono | quel telefono, Monica | quel telefono (solo con un invito attivo), Monica |
| `richieste/{uid}` | nome, chi ha mandato il link | Monica, chi chiede | chi chiede (la sua), Monica |
| `ordini/{id}` | cliente, numero, righe, entro, stato, pagamento, note, proposta, modifica | il cliente i suoi, Monica | il cliente: crea, risponde alla proposta, «Ho pagato», annulla se nuovo, chiede modifica, «Mi è piaciuto»; Monica tutto |
| `contatori/ordini` | prossimo numero | Monica | con la creazione di un ordine (+1) |
| `settimane/{anno-sett}` | teglie prenotate nella settimana | invitati e Monica | con gli ordini |

Restano solo sul telefono: allergie (dato sulla salute), carrello, testo grande, ruolo.
Fase 2 (costi e dosi): raccolta a parte che legge solo Monica.

## Come funziona per chi usa l'app
- **Cliente invitato**: tocca il link su WhatsApp → vede subito il menù. Cambia telefono → riapre lo stesso link. Monica può «Cambiare il link» se finisce in mani sbagliate: il vecchio smette di funzionare.
- **Amica senza invito** (link `#richiesta` da «Manda a un'amica»): scrive il nome → Monica la vede in «Richieste» → «Accetta» → l'app dell'amica si apre da sola sul menù, senza un altro link.
- **Monica**: la prima volta «Entra con Google»; poi l'app resta aperta.

## Occhio critico (cose che la prova non aveva)
| Caso | Cosa succede |
|---|---|
| Due clienti sull'ultimo «pronto subito» | Transazione (operazione «tutto o niente»): il secondo legge «Mi dispiace, l'ha appena preso qualcun altro» e il piatto torna da prenotare |
| Due ordini nello stesso istante | Numero dato da una transazione sul contatore: mai due ordini col 7 |
| Limite di teglie a settimana | Il cliente non vede gli ordini degli altri: conta il documento `settimane/…`, aggiornato con ogni ordine (annullato o rifiutato → si toglie) |
| Senza rete, cliente | Il menù si vede (copia sul telefono). L'ordine NON parte senza rete: resta nel carrello, avviso chiaro «Non è partito: manca la rete», riparte da solo appena torna, tasto «Riprova» |
| Senza rete, Monica | Le modifiche restano in coda: «Si salverà appena torna la rete»; «Salvato ✓» solo dopo la conferma del server |
| Monica e Mario insieme | Si scrive solo il campo cambiato, mai il documento intero: nessuno cancella il lavoro dell'altro |
| Errori di salvataggio | Messaggio chiaro, nuovo tentativo da solo, tasto «Riprova» (RVC E13) |
| Annulla 10 secondi | Rimette i campi di prima con una scrittura nuova |
| Il giorno dopo | I «pronti» si azzerano da soli (data del giorno nel piatto), senza programmi sul server |
| Link inoltrato per sbaglio | «Cambia link» di Monica; «Manda a un'amica» manda sempre il link di richiesta, mai quello personale |
| Codice d'invito di oggi | 6 caratteri da `Math.random` e non salvato: diventa casuale sicuro (20 caratteri) e salvato in `inviti/` |
| Dati di prova | Nella versione vera solo i 23 piatti (caricati alla prima entrata di Monica); clienti e ordini finti no |

## Come si cambia il codice
- `carica()` e `salva()` diventano uno strato con due motori: «prova» (telefono, come oggi) e «firebase». `salva()` confronta i dati con l'ultima copia del server e scrive solo i campi cambiati. Il resto di `app.js` cambia poco: meno rischio di rompere ciò che funziona.
- Operazioni speciali con transazione: invia ordine, prendi l'ultimo pronto, accetta richiesta, cambia link.
- Libreria Firebase caricata dal suo indirizzo ufficiale, versione fissa (controllata con Context7 prima del codice).
- La configurazione web di Firebase (`apiKey` ecc.) non è un segreto: la protezione sono le regole di sicurezza. Nessuna vera chiave nel repository.
- Regole di sicurezza in `firestore.rules`, con prove automatiche nell'emulatore (simulatore di Firebase sul computer) prima di pubblicarle.

## Passi a mano di Mario (dopo l'ok a questa specifica, uno alla volta)
1. Creare il progetto Firebase (Analytics spento).
2. Registrare l'app web e mandarmi la configurazione (non è segreta).
3. Accendere Firestore (zona Europa) e l'accesso anonimo e Google.
4. Entrare una volta nell'app con Google; poi creare `gestori/<id>` per sé e per Monica.
