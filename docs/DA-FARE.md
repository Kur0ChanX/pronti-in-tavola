# Da fare

## 0. Aspetta Mario
- 🟢 Principale 1 · Decori sardi (trama sullo sfondo e rombi nei titoli): vanno bene così, più visibili o più leggeri? (anteprima versione 12)

| N | Cosa | Chi | Urgenza |
|---|---|---|---|
| C1 | Dati veri condivisi con Firebase (Firestore): accesso cliente col link d'invito `#i=codice`, accesso di Monica separato, regole di sicurezza, transazione sull'ultimo «pronto subito» | Claude | alta |
| C2 | Foto: se Firebase Storage chiede il piano a pagamento, foto piccole (900 px, JPEG 0,8) dentro Firestore | Claude | alta |
| C3 | Notifiche vere a Monica (Android, app sulla schermata Home) e funzionamento senza rete (service worker, manifest) | Claude | media |
| C4 | Sito su Cloudflare Pages `pronti-in-tavola.pages.dev` | Claude + Mario | media |
| C5 | Anteprima del link su WhatsApp col logo (og:image) | Claude | bassa |
| C6 | Fase 2: dosi e spesa, sconti | Claude | dopo |
| C7 | Fase 3: etichette, immagine del menù, incassi, costo per piatto | Claude | dopo |
| C8 | Togliere la striscia «Prova · guarda come» nella versione vera | Claude | con C1 |
| C9 | Kit RVC: nel pacchetto «indipendente» v35 manca `tools/consegne.py` (lo usano hook, skill `consegne` e `test-scorta.py`); qui copiato da RVC e adattato. Da segnalare alla sessione RVC | Mario → RVC | bassa |

## 1. Claude da solo
- C1, C2, C3, C5, C8

## 2. Claude dopo scelta o ok di Mario
- C4 (serve l'account Cloudflare), C6, C7

## 3. Mario a mano
- Creare il progetto Firebase e il sito Cloudflare (passi uno alla volta quando servono).
- Monica: controllare ingredienti, allergeni e istruzioni dei 23 piatti; ripieno delle impanade; numero WhatsApp. Mario: numero per «Chiedi a Mario» (nelle impostazioni dell'app, non nel codice).
