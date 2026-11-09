# Chi fa cosa

## Catene
| Catena | Forma | Segni | Numero | Sessione | Chiusa il |
|---|---|---|---|---|---|
| Principale | cerchi | 🟢 🟡 🔴 ⚫ | 37 | `session_01WTjqUwYZ9ro8F9Ku7rJMWq` | |
| Voce | quadrati | 🟩 🟨 🟥 ⬛ | 10 | `session_01WTjqUtYvuMZ4rMC2iVwr4M` (Voce 10, catena 2 di 8, aperta da Voce 9 09/11 ~20:52); Voce 9 `session_01WTjqUuB1p39aBRtu1G1T8K` chiusa 09/11 ~20:52 alla soglia: C110 v0.9.88 iPad come Android; Voce 8 `session_01WTjqUwiB7LRCHcan27dbLW` chiusa 09/11 ~21:30 alla soglia: C108 server Groq + Deepgram, C110 iPad scritto; aperta da Voce 7 09/11 ~21:08; Voce 7 `session_01WTjqUvspWDANp8hbLq7V7x` chiusa 09/11 ~21:08 alla soglia: domanda 🛑 C108; aperta da Voce 6 09/11 ~20:56; Voce 6 `session_01WTjqUwDxxa1bScHDSPReXe` chiusa 09/11 ~20:56 alla soglia: v0.9.86 dettatura di Monica su iPad, studio C108; Voce 5 `session_01WTjqUtKDPi7C12EuwhSQ1U` chiusa 09/11 ~20:45 alla soglia: v0.9.85 «capire meglio»; Voce 4 `session_01WTjqUvJr7mmfdSNihHR6LZ` chiusa 09/11 ~20:20 alla soglia: v0.9.82-84; Voce 3 `session_01WTjqUvuFacpinWPAvkMDYG` chiusa 09/11 ~19:20 alla soglia: v0.9.80 pubblicata; Voce 2 `session_01WTjqUx7JeVdDBrvgVgjfXx` chiusa 09/11 alla soglia; Voce 1 `session_01WTjqUuVyq5p6FhV1dVJtVC` chiusa 09/11) | |
| Aiuto | libri | 📗 📒 📕 📓 | 10 | `session_01WTjqUwG7wNgyoWoXYNwdic` (Aiuto 10, catena 8 di 8; il resto alla principale) | 09/11 |

## Lavori in corso
| Chat | Lavoro | File | Dal |
|---|---|---|---|
| 🟢 Principale 37 | C113 iPhone: accesso nel cookie (v0.9.92), aspetto la prova di Mario · C111 schermata dev su iPad (firma a prova di doppio tocco, «Attiva qui» in «Solo per te, Mario»); C109 testi `ascoltoQuota` e opzione `ascoltoAvviso` (richiesta di Voce 10) | `app.js` (firma-tocco, schedaMario, segnalazioniHtml), `style.css` (.firma, tocchi), `sw.js` (esagera), `opzioni.js` (gruppo 'mario'), `data.js` (versione, NOVITA) | 09/11 |
| 🟩 Voce 10 | Comando vocale dei CLIENTI potenziato (C105, Mario 09/11 ~17:00): riconoscimento (telefono + ascolto preciso sul server), capire senza rete, risposta e conferma a voce, ordine dettato | NUOVO `voce-clienti.js` · `aiutante.js` solo la zona «AIUTANTE DEI CLIENTI» (`inviaAC`, `barraAIC`, `ac-detta`) e `ascoltaAI` + i 2 pulsanti microfono dell'aiutante di Monica (dettatura su iPad/iPhone dalla Home, Voce 6) · `worker.js` solo `/api/ascolta` · NUOVO `ascolta.mjs` (Whisper + correttore, solo server) e `tools/prova-ascolta.mjs` · `.github/workflows/sito.yml` una riga (`'*.mjs'` nei percorsi: anche `gz.mjs` ora pubblica) · `index.html` (script) · `style.css` solo classi `.vc-*` · `tools/prova.js` passi nuovi in fondo · `docs/CONSEGNE-PARALLELA-voce.md` | 09/11 |
