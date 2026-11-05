# Dati veri con Firebase · specifica corta (C1 + C2 + C11)

Versione 0.2 · 05/11/2026 · col passaparola deciso da Mario (link unico) e l'impronta o PIN per Monica. Da far vedere a Mario prima del codice dell'app. Finito il lavoro va in `docs/piani-finiti/`.
Fonti controllate oggi (pagine ufficiali aggiornate fra il 20/10 e il 03/11/2026):
- Firestore gratis: 1 GiB, 50.000 letture e 20.000 scritture al giorno, 10 GiB al mese in uscita (https://firebase.google.com/docs/firestore/quotas).
- Cloud Storage (le foto) e Cloud Functions chiedono il piano Blaze, con carta di credito, dal 03/02/2026 anche per i progetti vecchi (https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).
- Notifiche (Cloud Messaging) gratis; accesso anonimo fino a 100 milioni di utenti; accesso via email col link: solo 5 al giorno sul piano gratis (https://firebase.google.com/docs/auth/limits).
- Cloudflare Workers gratis: 100.000 richieste al giorno (https://developers.cloudflare.com/workers/platform/limits/).

## Scelte
| Tema | Scelta | Perché |
|---|---|---|
| Piano | **Spark**, gratis, senza carta | Già deciso «gratis». Se si superano i limiti il servizio si ferma, non arriva un conto |
| Foto | Dentro Firestore, una per documento, 900 px JPEG 0,8 (tetto 300 KB: qualità più bassa, poi foto più piccola). Non si ascoltano: il piatto ha la versione (`fotoV`) e il telefono la scarica solo quando cambia, poi la prende dalla sua copia; la copia veloce (localStorage) non tiene le foto | Storage vuole la carta; dopo 30 minuti fuori Firestore rimanda tutto (https://firebase.google.com/docs/firestore/pricing, 03/11/2026) e oltre i 10 GiB del mese il piano gratis spegne Firestore fino a fine mese (https://firebase.google.com/docs/projects/billing/firebase-pricing-plans, 20/10/2026) |
| Indipendenza | Progetto Firebase e account Cloudflare solo dell'app (Mario 05/11) | I limiti gratuiti di Firebase valgono per progetto, quelli dei Worker di Cloudflare per account: così non si toccano le altre app |
| Notifiche (C3) | Un Worker gratuito di Cloudflare, nell'account dell'app, manda la notifica a Monica | Le Functions vogliono la carta |
| Cliente | **Passaparola**: un link unico che tutti possono rigirare (`#da=<chi l'ha girato>`). Ogni telefono entra da solo con l'accesso anonimo (invisibile). Scrive il suo nome una volta, diverso da quelli già usati | Il cliente non crea account né password; Monica sa sempre chi ordina e chi l'ha portato |
| Approvazione | Monica approva la persona al primo ordine (o prima, dalla lista «Nuovi») | Deciso da Mario: indirizzo e ordini veri solo agli approvati |
| Monica | Google una volta sola; poi impronta o PIN del telefono a ogni apertura della sua parte (WebAuthn, lo sblocco del telefono). Mario: stesso modo, come riserva | La sicurezza vera sono Google e le regole; l'impronta è il lucchetto se il telefono resta in mano ad altri |
| Chi gestisce | Documento `gestori/<id>` creato una volta da Mario nella console | Nessun dato personale nel codice |
| Pagina di prova | Resta con i dati sul telefono (`?prova`), per le prove e l'anteprima | Le prove non toccano i dati veri |

## Raccolte
«Entrato» = chiunque ha aperto il link (telefono anonimo). «Approvato» = telefono legato da Monica a un cliente.
| Raccolta | Cosa c'è | Legge | Scrive |
|---|---|---|---|
| `piatti/{id}` | nome, formati e prezzi, gusti, ingredienti, allergeni, pronti, nel menù, novità, cuori | entrati, Monica | Monica; l'approvato solo «pronti» in meno e «cuori» +1, insieme a un suo ordine |
| `foto/{piatto}` | la foto come testo | entrati, Monica | Monica |
| `impostazioni/app` | pausa, anticipo, limite, ora dei pronti, Natale, «nuovi» (accetta nuovi clienti sì/no) | entrati, Monica | Monica |
| `impostazioni/approvati` | indirizzo del ritiro, WhatsApp di Monica | approvati, Monica | Monica |
| `impostazioni/monica` | numero di Mario, cose solo sue | Monica | Monica |
| `utenti/{uid}` | un telefono: nome, chiave del nome, tramite, stato (`nuovo`, `ricollega`, `approvato`, `no`), cliente, primo ordine | quel telefono, Monica | il telefono: si crea una volta (con «nuovi» acceso) e segna il primo ordine; Monica tutto |
| `nomi/{chiave}` | il nome già usato (chiave = nome in minuscolo, senza accenti, con `-`) | Monica | si crea una volta sola, insieme al suo `utenti/`; Monica |
| `clienti/{id}` | la persona: nome, chiave, da quando, tramite (uno o più telefoni) | Monica; l'approvato il suo | Monica |
| `ordini/{id}` | utente, cliente, numero, righe, entro, stato, pagamento, note, proposta, modifica | chi l'ha fatto; l'approvato quelli del suo cliente; Monica | vedi sotto |
| `contatori/ordini` | prossimo numero | entrati, Monica | con la creazione di un ordine (+1) |
| `settimane/{anno-sett}` | teglie prenotate nella settimana | entrati, Monica | con gli ordini degli approvati; Monica |

Ordini, chi scrive: il **nuovo** crea un solo ordine «da approvare» (un altro solo se lo annulla) e lo può annullare; l'**approvato** crea, risponde alla proposta, «Ho pagato», annulla se nuovo, chiede modifica, «Mi è piaciuto»; **Monica** tutto.
Restano solo sul telefono: allergie (dato sulla salute), carrello, testo grande, ruolo.
Fase 2 (costi e dosi): raccolta a parte che legge solo Monica.

## Come funziona per chi usa l'app
- **Amica nuova**: tocca il link su WhatsApp → vede subito il menù. Al primo ordine: «Come ti chiami?» (nome e cognome) → l'ordine parte «da approvare» e Monica lo vede con «amica di Giulia». Monica dice «Sì» → da quel momento l'amica vede l'indirizzo del ritiro e ordina come tutti.
- **Rigirare il link**: «Manda a un'amica» in ogni telefono approvato manda il link unico col proprio segno `#da=`.
- **Nome già usato**: «Questo nome c'è già. Sei tu con un telefono nuovo?» → «Sì» manda a Monica «Maria Rossi: telefono nuovo?» e Monica ricollega con un tocco; «No» → aggiunge un dettaglio (es. «Maria Rossi Olbia»).
- **Monica**: la prima volta «Entra con Google»; poi a ogni apertura della sua parte l'impronta o il PIN del telefono. Nel menù Clienti: «Nuovi» (Sì / No), «Telefono nuovo» (Ricollega / No), l'interruttore «Accetta nuovi clienti».

## Occhio critico (cose che la prova non aveva)
| Caso | Cosa succede |
|---|---|
| Due clienti sull'ultimo «pronto subito» | Transazione (operazione «tutto o niente»): il secondo legge «Mi dispiace, l'ha appena preso qualcun altro» e il piatto torna da prenotare |
| Due ordini nello stesso istante | Numero dato da una transazione sul contatore: mai due ordini col 7 |
| Due persone scelgono lo stesso nome insieme | `nomi/{chiave}` si crea una volta sola: la seconda legge «Questo nome c'è già» |
| Cambio telefono o dati del browser cancellati | Stesso nome → «Sei tu con un telefono nuovo?» → Monica ricollega al cliente vecchio, con i suoi ordini |
| Link girato in un gruppo grande, scherzi | Il nuovo non tocca i pronti né le teglie, fa un solo ordine prima del «Sì»; Monica spegne «Accetta nuovi clienti» e nessun telefono nuovo può più registrarsi |
| Primo ordine con un piatto pronto | Il primo ordine prenota soltanto; al «Sì» l'app di Monica prende i pronti se ci sono ancora, sennò le propone un altro giorno |
| Monica dice «No» | Il telefono vede il menù ma non ordina più |
| Prezzi nell'ordine | Li scrive il telefono del cliente: finché Monica non accetta, la sua app mostra il totale coi suoi prezzi e avvisa se non torna; «Accetta», «Proponi» e «Accetta la modifica» scrivono nell'ordine i prezzi di Monica (le righe già accettate tengono il loro) |
| Monica e Mario dicono Sì/No allo stesso telefono | Transazione: il secondo legge «Già fatto: l'ha deciso qualcun altro». «Annulla» (10 secondi) rimette telefono, cliente, ordine, pronti e teglie com'erano |
| Limite di teglie a settimana | Il cliente non vede gli ordini degli altri: conta il documento `settimane/…`, aggiornato con ogni ordine (annullato o rifiutato → si toglie) |
| Senza rete, cliente | Il menù si vede (copia sul telefono). L'ordine NON parte senza rete: resta nel carrello, avviso chiaro «Non è partito: manca la rete», riparte da solo appena torna, tasto «Riprova» |
| Senza rete, Monica | Le modifiche restano in coda, anche con l'app aperta senza rete (dalla copia di Firestore sul telefono) e ad app chiusa: «Si salverà appena torna la rete»; «Salvato ✓» solo dopo la conferma del server. «Esci da questo telefono» aspetta che la coda sia vuota |
| Pronti e teglie cambiati da Monica | Si scrive la differenza (+1, −2), non il numero: i pronti presi e le teglie ordinate intanto dai clienti restano contati |
| Monica e Mario insieme | Si scrive solo il campo cambiato, mai il documento intero: nessuno cancella il lavoro dell'altro |
| Errori di salvataggio | Messaggio chiaro, nuovo tentativo da solo, tasto «Riprova» (RVC E13) |
| Annulla 10 secondi | Rimette i campi di prima con una scrittura nuova |
| Il giorno dopo | I «pronti» si azzerano da soli (data del giorno nel piatto), senza programmi sul server |
| Impronta non disponibile (telefono vecchio) | Entra col PIN, la sequenza o la password del telefono: le chiede lo stesso Android |
| Lucchetto, come funziona (fatto 05/11, `lucchetto.js`) | Chiave del telefono (WebAuthn) messa subito dopo «Entra con Google»; a ogni apertura l'impronta si chiede da sola finita l'apertura animata, poi col pulsante. Finché è chiusa la pagina non ha dati. Si richiude se Monica esce dall'app per più di 5 minuti (Impostazioni → Lucchetto: 1-60) |
| Chiave persa, telefono che non la trova più, sito con indirizzo nuovo | «Non funziona? Entra di nuovo con Google» (solo lo stesso account) → impronta nuova. Senza chiave e senza entrata fresca (5 minuti) la parte non si apre senza Google |
| Telefono senza blocco schermo | La parte resta aperta, con l'avviso di mettere il blocco schermo; messo il blocco, «Metti l'impronta» nelle Impostazioni |
| Monica cambia telefono o lo dà via | Impostazioni → «Esci da questo telefono» (due tocchi): via l'account, la copia dei dati (anche quella di Firestore) e la chiave; il telefono torna cliente |
| Dati di prova | Nella versione vera solo i 23 piatti (caricati alla prima entrata di Monica); clienti e ordini finti no |

## Come si cambia il codice
- `carica()` e `salva()` diventano uno strato con due motori: «prova» (telefono, come oggi) e «firebase». `salva()` confronta i dati con l'ultima copia del server e scrive solo i campi cambiati. Il resto di `app.js` cambia poco: meno rischio di rompere ciò che funziona.
- Operazioni speciali con transazione: invia ordine (anche il primo, con nome nuovo), prendi l'ultimo pronto, approva o ricollega un telefono.
- I link personali `#i=` e le richieste della prova spariscono: al loro posto il link unico e la lista «Nuovi».
- Libreria Firebase caricata dal suo indirizzo ufficiale, versione fissa (controllata con Context7 prima del codice).
- La configurazione web di Firebase (`apiKey` ecc.) non è un segreto: la protezione sono le regole di sicurezza. Nessuna vera chiave nel repository.
- Regole di sicurezza in `firestore.rules`, con prove automatiche nell'emulatore (simulatore di Firebase sul computer) prima di pubblicarle: `npm run prova-regole`.

## Passi a mano di Mario (dopo l'ok a questa specifica, uno alla volta)
1. Creare il progetto Firebase (Analytics spento).
2. Registrare l'app web e mandarmi la configurazione (non è segreta).
3. Accendere Firestore (zona Europa) e l'accesso anonimo e Google.
4. Entrare una volta nell'app con Google; poi creare `gestori/<id>` per sé e per Monica.

### Dove siamo (05/11, ore 14:50, dal telefono di Mario)
- **Passo 1 fatto**: progetto «Pronti in Tavola» (id `pronti-in-tavola`) sul suo account Google, **Piano Spark** (gratis, visto nella foto). Gemini e Analytics: gli ho detto di spegnerli, non verificato.
- **Passo 2 fatto**: app web registrata (nickname «Pronti in Tavola web», Hosting non attivato). `firebaseConfig` incollato da Mario e messo in `dati.js` (`FIREBASE_CONFIG`); l'anteprima di prova la toglie da sola (`tools/anteprima.py`, controllato da `tools/prova.js`). Il repo è pubblico: la chiave `AIza…` è la chiave web di Firebase, non segreta (la protezione sono le regole).
- **Passo 3 in corso** (guida rimandata il 05/11 dalla #8, controllata sulla guida ufficiale): 3A link diretto `https://console.firebase.google.com/project/pronti-in-tavola/firestore` → **Crea database** (o **Aggiungi database**) → edizione **Standard** (mai Enterprise) → **Avanti** → ID **(default)** da lasciare com'è (il codice usa il database predefinito) → posizione **europe-west8 (Milano)**, non si cambia più → **Avanti** → modalità di **produzione** → **Crea**; poi foto della pagina. 3B (dopo): `https://console.firebase.google.com/project/pronti-in-tavola/authentication/providers` → **Inizia** se c'è → scheda **Metodo di accesso**: **Anonimo** e **Google** (**Salva**; per Google serve l'email di assistenza). Nomi italiani non ancora visti da Mario: se sbagliano, versione giusta in `docs/GUIDE-GIUSTE.md`.
- Gratis di Firestore: 1 GiB, 50.000 letture e 20.000 scritture al giorno, **un solo database gratis per progetto** (il primo creato): creare solo quello «(default)».
- Poi: passo 4 = regole (`firestore.rules`, 188 righe: console → **Firestore** → scheda **Regole** → incollare → **Pubblica**; da provare dopo, con l'app vera), passo 5 = entrare con Google una volta nell'app e creare `gestori/<id>` per Monica. Serve il sito online (C4, Cloudflare): per l'accesso con Google il dominio del sito va aggiunto in **Autenticazione** → **Impostazioni** → domini autorizzati (nome da controllare allora).
