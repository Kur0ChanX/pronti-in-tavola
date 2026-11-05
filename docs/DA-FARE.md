# Da fare

## 0. Aspetta Mario
- 05/11 · 🟡 Principale 9 · Cloudflare passo 1 (nuovo): `mario.miscera@gmail.com` ha già un account e l'alias `+pronti` è rifiutato; quindi account Free aggiuntivo: entra su https://dash.cloudflare.com/login → pagina Accounts → Create Account «Pronti in Tavola»; foto di ogni schermata (nomi non ancora visti), poi «fatto»
- 05/11 · 🟡 Principale 8 · App più semplice (C13): le 4 foto vanno bene così? (`archivio/foto/semplice-1-menu.png`, `semplice-2-carrello.png`, `semplice-3-ritiro.png`, `semplice-4-impostazioni-monica.png`)
- 05/11 · 🟡 Principale 3 · Il nome del cliente nuovo: chiederlo al primo ordine (consiglio: chi è curioso guarda il menù senza ostacoli) o alla prima apertura?
- 05/11 · 🟡 Principale 4 · Schermata Clienti di Monica (Telefono nuovo, Nuovi, Sì/No) e primo ordine di una cliente nuova: chiare così? (anteprima versione 13; foto `archivio/foto/clienti-1-nuovi.png`, `archivio/foto/clienti-2-primo-ordine.png`)
- 05/11 · 🟡 Principale 5 · Lucchetto di Monica: le 3 schermate (Proteggi la tua parte, La tua parte è chiusa, Impostazioni → Lucchetto) chiare così? (foto `archivio/foto/lucchetto-1-metti.png`, `lucchetto-2-chiuso.png`, `lucchetto-3-impostazioni.png`)
- 05/11 · 🟡 Principale 8 · «Persone rifiutate» (fatta: un «No» sbagliato si corregge con «Accetta», in fondo a Clienti): chiara così? (foto `archivio/foto/rifiutati-1.png`) · e «1 ok» valeva anche per le 4 foto dell'app più semplice?
- 05/11 · 🟡 Principale 9 · Nome del sito (C10): `pronti-in-tavola.pages.dev` (consiglio: corto) o `pronti-in-tavola-by-ynoy-corp.pages.dev`? Senza risposta vado col consiglio

| N | Cosa | Chi | Urgenza |
|---|---|---|---|
| C1 | Dati veri con Firebase (piano Spark). Pronti e provati nell'emulatore: regole, motore `dati.js`, ordini, schermate dei clienti nuovi, lucchetto (storia in `docs/DA-FARE-FATTE.md`). Manca: progetto vero di Mario, prova sul telefono vero di Monica (anche: niente striscia «Prova» né «Ricomincia», ex C8) | Claude | alta |
| C3 | Notifiche vere a Monica (Android, app sulla schermata Home) con un Worker di Cloudflare nell'account dell'app: serve C4. Fatto il 05/11: l'app si apre senza rete (`sw.js`, `manifest.webmanifest`) | Claude | media |
| C4 | Sito su Cloudflare Pages `pronti-in-tavola.pages.dev`. Fatto (05/11, #9): `tools/sito.py` mette in `sito/` solo i file dell'app (8 file + 17 immagini, niente docs né archivio), provato in locale. In Cloudflare: comando di build `python3 tools/sito.py`, cartella `sito`, variabile `SKIP_DEPENDENCY_INSTALL` = `1` (salta l'npm delle prove). Manca: account (passo 1 di Mario), progetto, dominio in Firebase. 👁 Lo vedi: dal tuo telefono apri l'indirizzo `.pages.dev` e compare il menù di Monica · prova: foto dal telefono di Mario | Claude + Mario | media |
| C5 | Anteprima del link su WhatsApp col logo: fatti il 05/11 tag e immagine (`media/anteprima-link-1.jpg`, approvata da Mario il 05/11; `tools/immagine-link.js`). Manca: provarla su WhatsApp col sito online (C4). 👁 Lo vedi: in WhatsApp, quando il sito sarà online (C4), mandando il link a te stesso compare il riquadro col logo · prova: foto della chat | Claude | con C4 |
| C6 | Fase 2: dosi e spesa, sconti | Claude | dopo |
| C7 | Fase 3: etichette, immagine del menù, incassi, costo per piatto | Claude | dopo |
| C11 | Passaparola (Mario 05/11): link unico `#da=` che tutti rigirano, menù visibile, nome unico (`nomi/`), primo ordine «da approvare», Monica approva o ricollega un telefono nuovo, interruttore «Accetta nuovi clienti»; Monica: Google + impronta o PIN. Fatto (05/11): specifica 0.2, regole con 50 prove, schermate nell'app. Manca: provarlo coi telefoni veri (dopo il progetto Firebase di Mario) | Claude | alta |
| C9 | Kit RVC: nel pacchetto «indipendente» v35 manca `tools/consegne.py` (lo usano hook, skill `consegne` e `test-scorta.py`); qui copiato da RVC e adattato. Da segnalare alla sessione RVC | Mario → RVC | bassa |
| C10 | Indirizzo del sito da decidere con C4: in `data.js` e nella specifica c'è `pronti-in-tavola-by-ynoy-corp.pages.dev`, in C4 `pronti-in-tavola.pages.dev`; se cambia, cambiare anche og:url e og:image in `index.html` (la prova `tools/prova.js` lo controlla) | Claude + Mario | con C4 |
| C12 | Regola da portare nel kit (non sono nella fonte): «guida a mano sbagliata → scrivere subito quella giusta in `docs/GUIDE-GIUSTE.md`» (Mario 05/11). Per ora vale solo qui, nel `CLAUDE.md` | Mario → RVC | bassa |
| C13 | App più semplice per clienti e Monica (Mario 05/11: «valuta tu le scelte e dimmele»): barra del cliente a 2 voci (Menù, I miei ordini), ritiro dentro «I miei ordini», allergie e «Aa» nel menù senza schermata «Io», nota solo nel carrello, pagamento in una riga se c'è un solo modo, Impostazioni di Monica con «Altre impostazioni» chiuse. Fatto e provato il 05/11 (anteprima versione 14, 4 foto mandate); manca l'ok di Mario. 👁 Lo vedi: nell'app online, menù con 2 voci in basso e «Aa» in alto · prova: foto dal telefono di Mario | Claude | alta |
| C14 | «Persone rifiutate» (Mario 05/11 «1 ok»): fatta il 05/11, in fondo a Clienti; «Accetta» = il Sì di sempre (anche `decidi` accetta un telefono in stato «no»; Annulla lo rimette «no»). Prove: app 23 OK, motore 83 OK. Da guardare: dopo «Accetta» + «Annulla» il telefono del cliente non ha riletto il «No» dal vivo nella prova (riaperta l'app sì): controllare con due telefoni veri. 👁 Lo vedi: nell'app online, dopo un No, in Clienti compare «Persone rifiutate (1)» · prova: foto dal telefono di Mario | Claude | media |

## 1. Claude da solo
- C1, C3

## 2. Claude dopo scelta o ok di Mario
- C4 (serve l'account Cloudflare), C6, C7

## 3. Mario a mano
- Creare il progetto Firebase e il sito Cloudflare (passi uno alla volta quando servono).
- Monica: controllare ingredienti, allergeni e istruzioni dei 23 piatti; ripieno delle impanade; numero WhatsApp. Mario: numero per «Chiedi a Mario» (nelle impostazioni dell'app, non nel codice).
