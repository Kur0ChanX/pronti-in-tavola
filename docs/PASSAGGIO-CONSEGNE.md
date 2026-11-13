# Passaggio di consegne

Sessione attuale: #80 (dopo la #79 `session_01WTjqUvRMYeAzAnDtr3mSfk`, chiusa alla soglia 13/11 20:31; la apre la #79 con `create_session` (catena 2 di 8)).

**#80: la apre la #79 (catena 2 di 8).** #79: le foto della v0.10.30 (tasti) BOCCIATE da Mario: la #78 aveva capito male («bannerino» = riquadro «Hai una domanda? Allergie, prezzi…», non la striscia «Hai allergie?»). Niente online. Regola nuova PT E84 (parole intere di Mario) fatta: hook + skill. Aspettano Mario 3 domande della #79 (tasti, controllo regole, misura C157).

- **Modo di lavorare (Mario 13/11 18:50, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11 sera, #79):** pagina del menù «bella ordinata» online COME LA VUOLE LUI (DOMANDA 1 della #79), poi lui manda a Lisa il link NUOVO «carrello pronto» (dato dalla #78: `?ordine=2 kg di ravioli ricotta e spinaci` + `1 parmigiana da 6`). Poi C157 misura obbligatoria. Paura di Mario: troppe regole in conflitto (DOMANDA 2). Turni CORTISSIMI, prima rispondere, niente lavori non chiesti, foto coi caratteri grandi prima di pubblicare (PT E83).

## Stato (13/11 20:31 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUvRMYe/claude/pronti-ramo-definitivo.
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **v0.10.29 ONLINE** (#78, giro 99/99 locale, commit `[pubblica]` e8e10dc): «Scrivimi» capisce gli ordini + link `…/?ordine=<testo>` (carrello pronto, `carrelloDaLink` in app.js). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.29; `…/app.js | grep -c carrelloDaLink` → 3. Link e messaggio WhatsApp per Lisa dati a Mario 13/11.
## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#79)
- Foto v0.10.30 coi caratteri grandi (`archivio/foto/2026-11-13-c155-tasti-grande-{1,2}.jpg`) BOCCIATE. Parole intere di Mario e «Ho capito» (❓ da confermare) in fondo a `docs/lavori-in-corso/c155-messaggi-in-ordini.md`. La patch `c155-tasti.patch` resta valida SOLO per la barra in basso a 3 voci; striscia allergie e «Dettami l'ordine» vanno rifatti dopo il «1» di Mario.
- PT E84 (`docs/ERRORI.md`): hook `avvio-check.py` funzione `parole_intere` (avviso «PAROLE INTERE DI MARIO» con le righe esatte), prova in `tools/test-avvio-check.py` (8/8), skill `consegne` fase 1 e «Avvio», nota in `docs/PER-IL-KIT.md`.
- C157 in Da fare (misura obbligatoria dei piatti a teglia: causa `aiutante.js:685` prende `p.formati[0]`, `app.js:961` prima misura già scelta).
- Controllo Da fare: 1 voce aggiunta (C157); 3 righe in Aspetta Mario.
- Contraddizioni viste, per il controllo regole: tetto «voce ≤400 caratteri» di `file-snelli` contro le parole intere di Mario (PT E84); «ok a pubblicare» delle consegne contro PT E83; conteggi diversi di « ❓N» fra gli hook (19/20/17/18).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #72: **Flash-Lite** per trascrivere (500 al giorno gratis) → no: meno preciso, crema di riso contata due volte; Mario «il lite fà un pò schifo». **Gemini Omni** (`gemini-omni-1.2-flash`) → no: CREA video, niente generateContent né piano gratis. **gemini-2.5-flash** → 404 per gli utenti nuovi dall'11/11. Valori nutrizionali detti nel video → no: 2 su 3 sbagliati, si stimano dalle dosi. `--finto` scriveva nella cache vera → corretto.
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario (PT E82). Mai toccare il codice dei tasti prima del suo «1» alla DOMANDA 1 della #79 (domanda intera in «Aspetta Mario»; ❓ da confermare).
2. Col «1»: `git apply docs/lavori-in-corso/c155-tasti.patch` (buona solo la barra a 3 voci), poi: riquadro «Hai una domanda?» più basso e fisso mentre scorri, dentro anche «Dettami l'ordine» (un tasto solo), via `.vc-fab` in basso (file della Voce `voce-clienti.js` `disegnaVC`/`fabVisibile`; prove `.vc-fab` in tools/prova.js). Spunta ogni richiesta, foto coi caratteri grandi (`P.grande = true`, Pixel 7), ok di Mario sulle foto, giro completo, `v0.10.30 [pubblica]`, curl, «puoi mandare il link a Lisa».
3. C157 dopo la DOMANDA 3. Controllo delle regole dopo la DOMANDA 2 (consiglio: dopo i tasti).
4. Vecchi: «Tutto dentro l'app» e C156, trascrizione ogni mattina (sveglia della #77), scritte C154, idee C149, C140, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.
## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 20; prime le 3 della #79: DOMANDA 1 tasti 🛑, 2 controllo regole, 3 misura C157).

## Ultimo messaggio di Mario
13/11 20:20, parola per parola: «E siccome ho cambiato tantissime regole, ne ho aggiunto tante, ho paura che mettendone troppe si sta creando un conflitto.» → risposta coi conflitti visti, DOMANDA 2. Dopo, scritto nella #78 e girato qui: «Puoi fare in modo che le lasagne deve mettere la quantità, se no non parte l'ordine? Perché cos'erano le lasagne? Cos'erano le melanzane? Non mi ricordo. La parmigiana, scusami. Puoi mettere che non c'è quantità, deve metterla per forza?» → C157, DOMANDA 3.
## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C158; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 20:10 · [AVVIO] Sessione #79 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio, scorta unita, foto v0.10.30
- 2026-11-13 20:12 · tra quanto è online? → stima ~25 min dopo il suo ok sulle foto
- 2026-11-13 20:13 · No, non vanno bene per niente. Cioè, non capisco perché non mi capisci quando pa… → spiegato come ho ragionato, PT E84, niente codice
- 2026-11-13 20:15 · Aspetta, quindi significa che è un problema di passaggio di consegna? L'ha accor… → risposta: errore della #78 portato avanti dalle consegne
- 2026-11-13 20:17 · miglioralo Miglioralo che deve leggere tutto quello che scrivo nei passaggi di c… → PT E84 hook parole_intere + skill consegne + PER-IL-KIT
- 2026-11-13 20:20 · E siccome ho cambiato tantissime regole, ne ho aggiunto tante, ho paura che mett… → tabella conflitti, DOMANDA 2

Ultimo, intero:
> E siccome ho cambiato tantissime regole, ne ho aggiunto tante, ho paura che mettendone troppe si sta creando un conflitto.

