# Da fare

## 0. Aspetta Mario
- 05/11 · 🟡 Principale 9 · Cloudflare passo 2: nel menù tocca **Compute** e manda la foto di cosa compare (account «Pronti in Tavola» già creato e scelto)
- 05/11 · 🟡 Principale 9 · Lista della spesa completa (C16): la usa solo Monica sul suo telefono, con «Manda su WhatsApp» (consiglio, si fa subito) o la condivide con un'altra persona che fa la spesa con lei (serve Firebase, dopo)? Senza risposta vado col consiglio
- 05/11 · 🟡 Principale 3 · Il nome del cliente nuovo: chiederlo al primo ordine (consiglio: chi è curioso guarda il menù senza ostacoli) o alla prima apertura?

| N | Cosa | Chi | Urgenza |
|---|---|---|---|
| C1 | Dati veri con Firebase (piano Spark). Pronti e provati nell'emulatore: regole, motore `dati.js`, ordini, schermate dei clienti nuovi, lucchetto (storia in `docs/DA-FARE-FATTE.md`). Manca: progetto vero di Mario, prova sul telefono vero di Monica (anche: niente striscia «Prova» né «Ricomincia», ex C8) | Claude | alta |
| C3 | Notifiche vere a Monica (Android, app sulla schermata Home) con un Worker di Cloudflare nell'account dell'app: serve C4. Fatto il 05/11: l'app si apre senza rete (`sw.js`, `manifest.webmanifest`) | Claude | media |
| C4 | Sito `pronti-in-tavola.pages.dev` su Cloudflare Pages, account «Pronti in Tavola» (creato). In Cloudflare: build `python3 tools/sito.py`, cartella `sito`, variabile `SKIP_DEPENDENCY_INSTALL`=`1`, ramo di produzione `main` (creato, giro verde in locale; anteprime degli altri rami spente). Manca: progetto (nome con suffisso → cambiarlo in `data.js` e `index.html`), dominio in Firebase. 👁 Lo vedi: dal telefono apri l'indirizzo `.pages.dev` e compare il menù di Monica · prova: foto di Mario | Claude + Mario | media |
| C5 | Anteprima del link su WhatsApp col logo: fatti il 05/11 tag e immagine (`media/anteprima-link-1.jpg`, approvata da Mario il 05/11; `tools/immagine-link.js`). Manca: provarla su WhatsApp col sito online (C4). 👁 Lo vedi: in WhatsApp, quando il sito sarà online (C4), mandando il link a te stesso compare il riquadro col logo · prova: foto della chat | Claude | con C4 |
| C6 | Fase 2. Lista della spesa fatta il 05/11 (`spesa.js`, nell'anteprima): dosi per piatto (bozza di Claude), ordini da preparare per giorni, in casa, confezioni, reparti, spunte, WhatsApp. Manca: dosi controllate da Monica; «ho fatto la spesa → in casa» e consumo automatico; sconti. 👁 Lo vedi: nell'anteprima, Monica → Da preparare → Lista della spesa · prova: foto di Mario | Claude | media |
| C15 | Dosi, «in casa» e confezioni della spesa nei dati privati di Monica su Firebase (raccolta solo gestori, regole e prove): oggi stanno solo sul suo telefono (`pit-spesa-v1`). Prima di darle l'app vera | Claude | alta |
| C16 | Lista della spesa completa (Mario 05/11: «prendi spunto alle app gold standard… e poi una sezione… spesa per i miei ordini»): lista libera di Monica come le app migliori (voci a mano, reparti automatici, quantità, spunte, usati spesso) + sezione «Spesa per i miei ordini» (`spesa.js`). Prima ricerca, domande, specifica. 👁 Lo vedi: nell'anteprima, Monica → Lista della spesa con voci tue e sezione ordini · prova: foto di Mario | Claude | alta |
| C7 | Fase 3: etichette, immagine del menù, incassi, costo per piatto | Claude | dopo |
| C11 | Passaparola (Mario 05/11): link unico `#da=` che tutti rigirano, menù visibile, nome unico (`nomi/`), primo ordine «da approvare», Monica approva o ricollega un telefono nuovo, interruttore «Accetta nuovi clienti»; Monica: Google + impronta o PIN. Fatto (05/11): specifica 0.2, regole con 50 prove, schermate nell'app. Manca: provarlo coi telefoni veri (dopo il progetto Firebase di Mario) | Claude | alta |
| C9 | Kit RVC: nel pacchetto «indipendente» v35 manca `tools/consegne.py` (lo usano hook, skill `consegne` e `test-scorta.py`); qui copiato da RVC e adattato. Da segnalare alla sessione RVC | Mario → RVC | bassa |
| C12 | Regola da portare nel kit (non sono nella fonte): «guida a mano sbagliata → scrivere subito quella giusta in `docs/GUIDE-GIUSTE.md`» (Mario 05/11). Per ora vale solo qui, nel `CLAUDE.md` | Mario → RVC | bassa |
| C13 | App più semplice per clienti e Monica (Mario 05/11: «valuta tu le scelte e dimmele»): barra del cliente a 2 voci (Menù, I miei ordini), ritiro dentro «I miei ordini», allergie e «Aa» nel menù senza schermata «Io», nota solo nel carrello, pagamento in una riga se c'è un solo modo, Impostazioni di Monica con «Altre impostazioni» chiuse. Fatto e provato il 05/11 (anteprima versione 14, 4 foto mandate); ok di Mario alle foto (05/11 «si capisce tutto»). 👁 Lo vedi: nell'app online, menù con 2 voci in basso e «Aa» in alto · prova: foto dal telefono di Mario | Claude | alta |
| C14 | «Persone rifiutate» (Mario 05/11 «1 ok»): fatta il 05/11, in fondo a Clienti; «Accetta» = il Sì di sempre (anche `decidi` accetta un telefono in stato «no»; Annulla lo rimette «no»). Prove: app 23 OK, motore 83 OK. Da guardare: dopo «Accetta» + «Annulla» il telefono del cliente non ha riletto il «No» dal vivo nella prova (riaperta l'app sì): controllare con due telefoni veri. 👁 Lo vedi: nell'app online, dopo un No, in Clienti compare «Persone rifiutate (1)» · prova: foto dal telefono di Mario | Claude | media |

## 1. Claude da solo
- C1, C3

## 2. Claude dopo scelta o ok di Mario
- C4 (serve l'account Cloudflare), C6, C7

## 3. Mario a mano
- Creare il progetto Firebase e il sito Cloudflare (passi uno alla volta quando servono).
- Monica: controllare ingredienti, allergeni e istruzioni dei 23 piatti; ripieno delle impanade; numero WhatsApp. Mario: numero per «Chiedi a Mario» (nelle impostazioni dell'app, non nel codice).
