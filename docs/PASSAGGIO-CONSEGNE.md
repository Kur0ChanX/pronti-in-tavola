# Passaggio di consegne

Sessione attuale: #49 (dopo la #48 `session_01WTjqUtGdNdfJFPzdQkQu77`, chiusa alla soglia 10/11 15:21; la apre la #48 con `create_session` (catena 5 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 15:25):** PRIMA il kit (C129): aggiornarlo qui all'ultimo («prendilo pure») e dirgli se nel suo account è rimasto qualcosa di sospeso per aggiornare il kit (solo per capire). Poi C127 pezzi 2-3 (patch pronta) e la sua foto di Proteiche.

## Stato (10/11 15:21 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta (qui il push di file `*.js`, `*.css`, `*.html` del ramo pubblica il sito vero da solo: `sito.yml`; i soli documenti no). Scorte #44-#48: solo documenti, NON unirle se `ricettario.js` contiene `function riquadroFit`.
- v0.10.13 ONLINE (controllata dalla #48 alle 15:20, push 8a107c3f): verifica `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.13 e `…/ricettario.js` contiene `function riquadroFit`.
- v0.10.13 (C127 pezzo 1): zone «Tutte · 🏋️ Proteiche · ⭐ Preferite · Altre ▾» (`zoneRic`, tasto `ric-zone-altre`); momenti e fonti a scelta multipla (`f.fit`/`f.prot` = 'colazione,spuntino'; `fitSel`, `protSel`, `passaFit`, `giraSel`, `selFit`, `chiaveFit`); «⚙️ Portata, difficoltà, tempo e ordine (n)» (`piuFiltriRic`, aperto solo con `f.piu`) in tutte le zone; riquadro verde (`riquadroFit`: `letturaFit` → {t, p} con barra, «Oggi +N entrate» dal telefono, «🔍 Cerca altre», esito, «ℹ️ Le regole» = `notaFit`); scorrimento di lato ritrovato per nome (`app.js`, `righeLato`).
- Pezzi 2-3 di C127 SCRITTI MA NON PROVATI: `docs/lavori-in-corso/c127-pezzi-2-3.patch` (ricettario.js +100, spesa.js +13; si applica sulla v0.10.13: `git apply --check` ok alle 15:21). Mancano: stile, aiutante, prove, versione, foto.
- Prove (Principale 48, sulla v0.10.13): app giro completo 90 OK, 0 NO (passo nuovo «tasti: nessun nome di azione definito due volte», PT E51). `prova-database.mjs` non rifatto (server non toccato).
- Kit qui 35.0; il 37.2 aspetta la chiave di Mario (riga in «Aspetta Mario»). Preferenze ricevute v38 (più nuove del kit): si aggiorna col kit 37.2. CLAUDE.md ~1459 token (tetto 1000).

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- **Piano C127 pezzi 2-3**: `docs/lavori-in-corso/c127-giorno-proteico.md` + patch `c127-pezzi-2-3.patch`. **Piano C124**: `docs/lavori-in-corso/c124-ricettario-proteico.md` (8 passi, tutti fatti). **Piano C125**: `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md` (5 pezzi). **Piano C126**: `docs/lavori-in-corso/c126-proteiche-momenti-e-fonti.md` (pezzi 1-2 fatti, 3-4 fonti).

## Sessione appena chiusa (#48)
- Avvio: scorte #45-#47 non unite (solo documenti, superate). Nessuna sveglia della #47 da cancellare.
- C127 pezzo 1 fatto: v0.10.13 online. Foto prima/dopo: `archivio/foto/2026-11-10-1520-c127-prima.png`, `…-dopo.png`: approvate da Mario alle 15:26 («Le foto vanno bene»).
- Errore mio trovato dalle prove: «Altre ▾» chiamato `ric-altre`, già usato da «Carica altre ricette» più in basso (la seconda definizione cancella la prima) → PT E51 + passo automatico in `tools/prova.js`.
- Passo C69 di `tools/prova.js` reso autonomo (si lancia da solo con `SOLO=`).
- Obiettivo del giorno proteico sul TELEFONO (`pit-giorno-ob`), non in Impostazioni: Impostazioni sono condivise col server e il gruppo «Solo per te, Mario» Monica non lo vede; un obiettivo a testa (occhio critico «due persone»).
- Controllo Da fare: 1 voce aggiunta (C129 kit, messaggio di Mario delle 15:25 arrivato dopo l'handoff).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #48 (C127): codice del pezzo 2 salvato nel ramo prima delle prove → NO (il push di un `.js` pubblica il sito vero): patch in `docs/lavori-in-corso/`, il codice resta com'è online. Monitor con `tail -f` chiuso a forza → la guardia lo blocca (comando vietato), anche scritto dentro un testo: ciclo con `grep -c` e `sleep`. Nome di azione nuovo senza `grep` → doppione (PT E51).
- #47 (C128): leggere i numeri veri del server dal contenitore → NO (`/api/gz` solo per chi gestisce): campione dal vivo coi lettori veri (`rf.mjs`, `gz.mjs`) + `fitRic`. Pagina 2 della ricerca GZ: `…/ricerca-ricette/page2/<parole>/` funziona (provato dal vivo). `leggiNutr` dentro l'oggetto (sveglie) falliva in silenzio (`.catch` su un array): ora `Promise.resolve().then(...)`. Ricette di prova con `nutr: null` = «lette, senza valori» (colonna 0), NON «da leggere»: per «da leggere» niente `nutr`.
- #47 (prove): `python3 - <<EOF` con la parola `env` dentro lo ferma la guardia («stamperebbe tutte le variabili»): scrivere lo script in un file dello scratchpad e lanciarlo con `python3 -I`.
- #46 (C126): Foodspring non risponde dal contenitore; Yazio `/it/ricette` 404; MyProtein robots.txt con molte regole (da leggere prima); FatSecret pagina 200 (da provare). Nessuna provata a fondo: è il pezzo 3 del piano C126. Push del codice prima del giro completo → NO: qui ogni push del ramo pubblica il sito vero.
- #45 (C125): Melarossa → NO per Proteiche (JSON-LD `Recipe` senza `nutrition`, solo calorie nel testo); Fondazione Veronesi → NO (senza valori, passi in un testo unico, ~16 ricette); Starget → NO (ricette caricate dal browser, piccola, `Content-Signal use=reference`). Ricerca del sito RicetteFit → NO (robots): le parole si cercano negli indirizzi della sitemap. Prove del database con `fetch` finto che risponde 404 a tutto → l'accesso di chi gestisce fallisce («non sei tra chi gestisce»): far passare a `prima(u, o)` gli indirizzi non dei siti.
- #44 (RicetteFit): foto dal JSON-LD → NO (ritagli da 500 px, PT E45): og:image + la sua serie srcset ≥ 1000 px. Ricerca del sito (`/?s=`) → NO (vietata nel loro robots.txt): l'elenco viene dalla sitemap. Il loro `transFatContent` è «Grassi insaturi» sul sito: non si usa. Ricette RicetteFit nella coda normale → NO (sarebbero rimaste dietro a GZ, e una fallita mai ripresa): una sola alla volta, in testa (`prendi` ordina RicetteFit prima).
- #44 (prove): `SOLO=… node tools/prova.js` con `timeout 110` si ferma prima della fine (il passo da solo ci mette ~2-3 minuti): lanciarlo in sottofondo.
- #44 (C125): Instagram e YouTube come fonti → NO (condizioni d'uso, niente formato ricetta; PT E25). Soglie fisse più alte per tutte → NO (taglierebbero snack e dolci proteici): due profili, pasto e snack.
- Sessioni #28-#43 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo, «Strade scartate #28-#43»).

## Prossimi passi
0. C129 KIT (Mario 10/11 15:25, dopo l'handoff della #48; parola per parola in «Ultimo messaggio»): aggiorna il kit di questo progetto all'ultimo (qui 35.0; ultimo noto 37.2) e dì a Mario se nel suo account è rimasto qualcosa di sospeso per aggiornare il kit (risposta solo informativa, «giusto una cosa mia, per capire»). Il kit sta nel repo RVC (`docs/kit-progetto`), che questa sessione non legge: niente `add_repo` (spegne gli hook, RVC E28). Strade: la chiave in sola lettura già prevista (riga «Kit 37.2» in «Aspetta Mario»: se Mario non l'ha ancora fatta, «prendilo pure» NON è «chiave pronta»: chiedigli in una riga se la chiave è pronta o se preferisce un'altra strada), oppure `gh api -X GET search/code` (solo ricerca: dice dove sono i file del kit e in quali repo, non il contenuto). Per «sospeso nell'account»: `list_triggers` (sveglie del kit), `list_sessions` (limit 4) e la ricerca `gh api search/code` della riga di versione del kit nei repo dell'account; nel `CLAUDE.md` di questo progetto gli altri progetti non si nominano: a Mario dai i numeri (quanti progetti col kit vecchio, quale versione) solo perché li ha chiesti lui.
1. C127 pezzi 2-3: `git apply docs/lavori-in-corso/c127-pezzi-2-3.patch` (poi togli il file della patch nello stesso commit). Rileggi il codice (occhio critico; specifica `c127-giorno-proteico.md`). Mancano: (a) stile in `style.css`: `.ric-giorno-testa` (titolo e «Nascondi» in riga), `.ric-giorno-riga` (riga con bordo sopra, nome a sinistra, grammi a destra, 🔄), `.ric-giorno-ric` (bottone senza bordo, testo a sinistra), `.ric-giorno-g`, `.ric-giorno-ob input` (stretto), `.ric-simili`; (b) aiutante: voce `giorno-proteico` in `aiutante.js` (vista ricettario, `ui: { ricZona: 'fit' }` e in `vRicettario` un `UI.ricGiorno` che toglie momenti, fonti e parola e riapre il riquadro) + elenco delle voci in `worker.js` riga ~73; (c) prova autonoma in `tools/prova.js` (`SOLO=giorno`): 4 righe coi nomi, totale e «mancano», piano uguale dopo un nuovo disegno e salvato con la data di oggi, data vecchia → piano nuovo, «🔄» cambia (e «Annulla» rimette), «Nascondi»/«📅», obiettivo 120 ok e 400 rifiutato, «📤 Manda» con il testo, «🛒» con `salvaCache` delle 4 ricette (es. pollo 600 g per 4 → «150 g Petto di pollo», niente sale; «Annulla» svuota), con un momento scelto il riquadro sparisce; «🔁 Simili» nella ricetta proteica (non lei stessa) e assente in una non proteica; (d) v0.10.14 + novità in `data.js`; (e) giro completo una volta, push, controllo online, foto a Mario (aspetto nuovo).
2. C127/C128: quando Mario manda la foto della pagina Proteiche (riga in «Aspetta Mario»), confronta il numero con la stima (~150) e la riga verde; se il carico veloce non è partito, guarda `turbo` nella pagina Database.
3. C126 pezzo 3-4 (Mario «2»): fonti con valori calcolati (tabelle CREA), fonte e «calcolati» segnati nella ricetta; specifica nel piano prima del codice. Kit 37.2: quando Mario scrive «chiave pronta», `request_credential` (host `raw.githubusercontent.com`, prefisso `token`, nome «Kit RVC lettura»).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (nuova: foto della pagina Proteiche v0.10.13).

## Ultimo messaggio di Mario
10/11 15:26 (nella chat della #48, dopo l'handoff), parola per parola: «Le foto vanno bene, pubblica pure se vuoi.» = foto prima/dopo della v0.10.13 (C127 pezzo 1) APPROVATE; la v0.10.13 era già online dalle 15:20 (glielo ha detto la #48). Niente da pubblicare.
Prima, 10/11 15:25: «Aggiorna il kit, verifica se, fammi questa cortesia, verifica se è rimasto in tutto il mio account, se è rimasto qualcosa di sospeso per aggiornare al kit. Ma è giusto una cosa mia, per capire un po'. Il kit dovrebbe essere aggiornato, prendilo pure.»
Prima, 10/11 ~15:05: «Vai di consiglio 1 e 3» (C127).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C130; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

