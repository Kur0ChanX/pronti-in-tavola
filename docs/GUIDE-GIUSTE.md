# Guide giuste (passi a mano provati con Mario)

Ogni volta che vedo che una guida data a Mario era sbagliata (pulsante o voce che non c'è, ordine diverso), scrivo qui subito la versione giusta, come l'ha vista lui. Prima di dare di nuovo una guida allo stesso servizio, leggo qui: vale più della guida ufficiale.
Una voce per passo: servizio · data · cosa avevo scritto · cosa c'è davvero (nomi esatti dei pulsanti) · da dove l'ho saputo (foto o parole di Mario).

## Firebase (console in italiano, aperta dal telefono di Mario, tema scuro)
- **Creare il progetto** (05/11/2026, foto di Mario): finestra **Creare un progetto**. In fondo c'è l'interruttore **Abilita Gemini in Firebase** («Azione consigliata»), già acceso: va spento. Pulsanti **Continua** e **Indietro**. A fine corsa la Panoramica mostra il nome e **Piano Spark** (il gratis).
- **Registrare l'app web** (05/11/2026): avevo scritto «icona **Web** `</>` al centro della Panoramica». **Sbagliato.** Giusto: sotto il nome del progetto, in alto a sinistra, **+ Aggiungi app**, poi la piattaforma **Web** (`</>`). Si apre **Registra app**: campo **Nickname app**, casella «Inoltre, configura **Firebase Hosting** per questa app» (lasciare vuota), pulsante **Registra app**; il passo 2 si chiama **Aggiungi SDK Firebase** e mostra `firebaseConfig`.
- In basso nella Panoramica può comparire «Impossibile caricare Cloud Shell»: non conta (**Chiudi** o ignorare).
- **Crea un database (Firestore)** (05/11/2026, foto di Mario dal telefono): finestra **Crea un database** a **4 passi** (pallini in alto; il 3 si chiama **Configura**). Al passo 3: «Avvia in **modalità di produzione**» (già scelta, è quella giusta) oppure «Avvia in **modalità di test**» (NON usarla: dopo 30 giorni si blocca e intanto è aperta a tutti). Sotto compare il testo delle regole (`allow read, write: if false;`). Nomi del passo 1, 2 e 4 e pulsante finale: da vedere (foto di Mario).
