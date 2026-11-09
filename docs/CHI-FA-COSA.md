# Chi fa cosa

## Catene
| Catena | Forma | Segni | Numero | Sessione | Chiusa il |
|---|---|---|---|---|---|
| Principale | cerchi | 🟢 🟡 🔴 ⚫ | 36 | `session_01WTjqUtPqTTxpnkk1cGLaiK` | |
| Voce | quadrati | 🟩 🟨 🟥 ⬛ | 8 | (Voce 8 `session_01WTjqUwiB7LRCHcan27dbLW` aperta da Voce 7 09/11 ~21:08, catena 8 di 8; Voce 7 `session_01WTjqUvspWDANp8hbLq7V7x` chiusa 09/11 ~21:08 alla soglia: domanda 🛑 C108; aperta da Voce 6 09/11 ~20:56; Voce 6 `session_01WTjqUwDxxa1bScHDSPReXe` chiusa 09/11 ~20:56 alla soglia: v0.9.86 dettatura di Monica su iPad, studio C108; Voce 5 `session_01WTjqUtKDPi7C12EuwhSQ1U` chiusa 09/11 ~20:45 alla soglia: v0.9.85 «capire meglio»; Voce 4 `session_01WTjqUvJr7mmfdSNihHR6LZ` chiusa 09/11 ~20:20 alla soglia: v0.9.82-84; Voce 3 `session_01WTjqUvuFacpinWPAvkMDYG` chiusa 09/11 ~19:20 alla soglia: v0.9.80 pubblicata; Voce 2 `session_01WTjqUx7JeVdDBrvgVgjfXx` chiusa 09/11 alla soglia; Voce 1 `session_01WTjqUuVyq5p6FhV1dVJtVC` chiusa 09/11) | |
| Aiuto | libri | 📗 📒 📕 📓 | 10 | `session_01WTjqUwG7wNgyoWoXYNwdic` (Aiuto 10, catena 8 di 8; il resto alla principale) | 09/11 |

## Lavori in corso
| Chat | Lavoro | File | Dal |
|---|---|---|---|
| 🟢 Principale 36 | C109 (Mario «da consiglio»): applico `docs/lavori-in-corso/c109-codice-pronto.patch` (soglia 30, `segnala()` nell'oggetto Avvisi di `worker.js`, UNA funzione per tutti i contatori) + «modo ridotto»; poi C108 aiutante dei clienti su Groq | `worker.js` (contaAIC, segnala, contoAI), `sw.js`, `app.js`, `aiutante.js` | 09/11 |
| 🟩 Voce 8 | Comando vocale dei CLIENTI potenziato (C105, Mario 09/11 ~17:00): riconoscimento (telefono + ascolto preciso sul server), capire senza rete, risposta e conferma a voce, ordine dettato | NUOVO `voce-clienti.js` · `aiutante.js` solo la zona «AIUTANTE DEI CLIENTI» (`inviaAC`, `barraAIC`, `ac-detta`) e `ascoltaAI` + i 2 pulsanti microfono dell'aiutante di Monica (dettatura su iPad/iPhone dalla Home, Voce 6) · `worker.js` solo `/api/ascolta` · NUOVO `ascolta.mjs` (Whisper + correttore, solo server) e `tools/prova-ascolta.mjs` · `.github/workflows/sito.yml` una riga (`'*.mjs'` nei percorsi: anche `gz.mjs` ora pubblica) · `index.html` (script) · `style.css` solo classi `.vc-*` · `tools/prova.js` passi nuovi in fondo · `docs/CONSEGNE-PARALLELA-voce.md` | 09/11 |
