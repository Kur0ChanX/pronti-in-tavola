# Da fare

## 0. Aspetta Mario
- 05/11 · 🟡 Principale 2 · Creare il progetto Firebase con la guida passo passo: scrivere «Firebase» quando ha 10 minuti, meglio al computer
- 05/11 · 🟡 Principale 3 · Il nome del cliente nuovo: chiederlo al primo ordine (consiglio: chi è curioso guarda il menù senza ostacoli) o alla prima apertura?

| N | Cosa | Chi | Urgenza |
|---|---|---|---|
| C1 | Dati veri con Firebase (piano Spark). Pronti: specifica 0.2, regole (`npm run prova-regole`), motore `dati.js` e ordini dei clienti (`npm run prova-firebase`). Fatto il 05/11: schermate di Monica «Nuovi», «Telefono nuovo», Sì / No con Annulla, interruttore «Accetta clienti nuovi», prezzi di Monica, «inviato» del cliente nuovo (`npm run prova-firebase`: 43 OK). Manca: impronta o PIN, progetto vero di Mario | Claude | alta |
| C2 | Foto dentro Firestore (900 px, JPEG 0,8, tetto 300 KB): Storage vuole la carta anche per i progetti vecchi dal 03/02/2026 (verificato 05/11) | Claude | alta |
| C3 | Notifiche vere a Monica (Android, app sulla schermata Home) e funzionamento senza rete (service worker, manifest) | Claude | media |
| C4 | Sito su Cloudflare Pages `pronti-in-tavola.pages.dev` | Claude + Mario | media |
| C5 | Anteprima del link su WhatsApp col logo (og:image) | Claude | bassa |
| C6 | Fase 2: dosi e spesa, sconti | Claude | dopo |
| C7 | Fase 3: etichette, immagine del menù, incassi, costo per piatto | Claude | dopo |
| C8 | Togliere la striscia «Prova · guarda come» nella versione vera | Claude | con C1 |
| C11 | Passaparola (Mario 05/11): link unico `#da=` che tutti rigirano, menù visibile, nome unico (`nomi/`), primo ordine «da approvare», Monica approva o ricollega un telefono nuovo, interruttore «Accetta nuovi clienti»; Monica: Google + impronta o PIN. Fatto (05/11): specifica 0.2, regole con 50 prove, schermate nell'app. Manca: provarlo coi telefoni veri (dopo il progetto Firebase di Mario) | Claude | alta |
| C9 | Kit RVC: nel pacchetto «indipendente» v35 manca `tools/consegne.py` (lo usano hook, skill `consegne` e `test-scorta.py`); qui copiato da RVC e adattato. Da segnalare alla sessione RVC | Mario → RVC | bassa |
| C10 | Indirizzo del sito da decidere con C4: in `data.js` e nella specifica c'è `pronti-in-tavola-by-ynoy-corp.pages.dev`, in C4 `pronti-in-tavola.pages.dev` | Claude + Mario | con C4 |

## 1. Claude da solo
- C1, C2, C3, C5, C8

## 2. Claude dopo scelta o ok di Mario
- C4 (serve l'account Cloudflare), C6, C7

## 3. Mario a mano
- Creare il progetto Firebase e il sito Cloudflare (passi uno alla volta quando servono).
- Monica: controllare ingredienti, allergeni e istruzioni dei 23 piatti; ripieno delle impanade; numero WhatsApp. Mario: numero per «Chiedi a Mario» (nelle impostazioni dell'app, non nel codice).
