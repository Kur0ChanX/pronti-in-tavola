# Da fare

## 0. Aspetta Mario
- 05/11 · 🟡 Principale 7 · Firebase, tappa 1 di 3: creare il progetto coi passi mandati in chat, poi scrivere «fatto»
- 05/11 · 🟡 Principale 3 · Il nome del cliente nuovo: chiederlo al primo ordine (consiglio: chi è curioso guarda il menù senza ostacoli) o alla prima apertura?
- 05/11 · 🟡 Principale 4 · Schermata Clienti di Monica (Telefono nuovo, Nuovi, Sì/No) e primo ordine di una cliente nuova: chiare così? (anteprima versione 13; foto `archivio/foto/clienti-1-nuovi.png`, `archivio/foto/clienti-2-primo-ordine.png`)
- 05/11 · 🟡 Principale 5 · Lucchetto di Monica: le 3 schermate (Proteggi la tua parte, La tua parte è chiusa, Impostazioni → Lucchetto) chiare così? (foto `archivio/foto/lucchetto-1-metti.png`, `lucchetto-2-chiuso.png`, `lucchetto-3-impostazioni.png`)
- 05/11 · 🟡 Principale 6 · Dopo un «No» a una cliente nuova: lista «Hai detto di no» con «Ripensaci» in fondo alla schermata Clienti? (1 sì, consiglio · 2 no)

| N | Cosa | Chi | Urgenza |
|---|---|---|---|
| C1 | Dati veri con Firebase (piano Spark). Pronti e provati nell'emulatore: regole, motore `dati.js`, ordini, schermate dei clienti nuovi, lucchetto (storia in `docs/DA-FARE-FATTE.md`). Manca: progetto vero di Mario, prova sul telefono vero di Monica (anche: niente striscia «Prova» né «Ricomincia», ex C8) | Claude | alta |
| C3 | Notifiche vere a Monica (Android, app sulla schermata Home) con un Worker di Cloudflare nell'account dell'app: serve C4. Fatto il 05/11: l'app si apre senza rete (`sw.js`, `manifest.webmanifest`) | Claude | media |
| C4 | Sito su Cloudflare Pages `pronti-in-tavola.pages.dev` | Claude + Mario | media |
| C5 | Anteprima del link su WhatsApp col logo: fatti il 05/11 tag e immagine (`media/anteprima-link-1.jpg`, approvata da Mario il 05/11; `tools/immagine-link.js`). Manca: provarla su WhatsApp col sito online (C4). 👁 Lo vedi: in WhatsApp, quando il sito sarà online (C4), mandando il link a te stesso compare il riquadro col logo · prova: foto della chat | Claude | con C4 |
| C6 | Fase 2: dosi e spesa, sconti | Claude | dopo |
| C7 | Fase 3: etichette, immagine del menù, incassi, costo per piatto | Claude | dopo |
| C11 | Passaparola (Mario 05/11): link unico `#da=` che tutti rigirano, menù visibile, nome unico (`nomi/`), primo ordine «da approvare», Monica approva o ricollega un telefono nuovo, interruttore «Accetta nuovi clienti»; Monica: Google + impronta o PIN. Fatto (05/11): specifica 0.2, regole con 50 prove, schermate nell'app. Manca: provarlo coi telefoni veri (dopo il progetto Firebase di Mario) | Claude | alta |
| C9 | Kit RVC: nel pacchetto «indipendente» v35 manca `tools/consegne.py` (lo usano hook, skill `consegne` e `test-scorta.py`); qui copiato da RVC e adattato. Da segnalare alla sessione RVC | Mario → RVC | bassa |
| C10 | Indirizzo del sito da decidere con C4: in `data.js` e nella specifica c'è `pronti-in-tavola-by-ynoy-corp.pages.dev`, in C4 `pronti-in-tavola.pages.dev`; se cambia, cambiare anche og:url e og:image in `index.html` (la prova `tools/prova.js` lo controlla) | Claude + Mario | con C4 |

## 1. Claude da solo
- C1, C3

## 2. Claude dopo scelta o ok di Mario
- C4 (serve l'account Cloudflare), C6, C7

## 3. Mario a mano
- Creare il progetto Firebase e il sito Cloudflare (passi uno alla volta quando servono).
- Monica: controllare ingredienti, allergeni e istruzioni dei 23 piatti; ripieno delle impanade; numero WhatsApp. Mario: numero per «Chiedi a Mario» (nelle impostazioni dell'app, non nel codice).
