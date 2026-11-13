# Passaggio di consegne

Sessione attuale: #82 (dopo la #81 `session_01WTjqUwJ4nEdo84Hoh2yP3S`, chiusa alla soglia 13/11 21:24; la apre la #81 con `create_session` (catena 4 di 8)).

**#82: la apre la #81 (catena 4 di 8).** #81: **v0.10.30 ONLINE** (barra «Chiedi o ordina» con un microfono solo + misura della teglia da scegliere, C155+C157, giro 100/100). Mario ha detto «le foto vanno bene». Aspetta la sua foto del menù da cliente e la risposta su C158 (passaggio di consegne).

- **Modo di lavorare (Mario 13/11 18:50, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11 sera, #81):** C158 passaggio di consegne fatto bene: Mario sceglie «della precedente» (non tutte le aperte: troppi token) e chiede a me il sistema migliore. Mia proposta (in Aspetta Mario, DOMANDA C158): l'hook d'avvio legge le parole intere della sessione PRECEDENTE anche dalla sua scorta (messaggi scritti dopo l'handoff), consegne corte come ora, la vecchia gira i messaggi tardivi. Poi controllo regole (DOMANDA 2 #79). Caratteri grandi: foto a Mario coi caratteri NORMALI. Turni corti, prima rispondere, niente lavori non chiesti.

## Stato (13/11 21:24 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice 0.10.30. Scorte NON unite: scorta-principale-20261113-01WTjqUwJ4nE/claude/pronti-ramo-definitivo.
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **v0.10.29 ONLINE** (#78, giro 99/99 locale, commit `[pubblica]` e8e10dc): «Scrivimi» capisce gli ordini + link `…/?ordine=<testo>` (carrello pronto, `carrelloDaLink` in app.js). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.29; `…/app.js | grep -c carrelloDaLink` → 3. Link e messaggio WhatsApp per Lisa dati a Mario 13/11.
- **v0.10.30 ONLINE** (#81, giro 100/100 locale, commit `[pubblica]` 1e115ff): barra `.ai-cliente` ferma in cima (sticky) con un microfono solo `ai-mic[data-a=ac-detta]`, microfoni galleggianti `.vc-fab` solo nel carrello, barra in basso Menù · I miei ordini · Scrivi a Monica; C157 riquadro «Scegli la misura» + «Invia» spento. Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.30; `…/app.js | grep -c misuraManca` → 5. Patch cancellata (applicata).

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#81)
- Foto barra rimandate; Mario «le foto per ora vanno bene» → patch applicata, prove dei tasti spostate sulla barra (`tools/prova.js`: un microfono solo nel menù, barra sticky su una riga, «Dettami l'ordine» nel carrello; la prova si prepara da sola con `P.benvenuto = true`, PT E70), novità 0.10.30 riscritte, controllo caratteri grandi coi numeri (barra 56 px, una riga, microfono dentro lo schermo), giro 100/100, online.
- C158: Mario non vuole leggere TUTTE le sessioni aperte, solo la precedente; proposta scritta in Aspetta Mario (niente codice prima del suo «1»).
- Controllo Da fare: 0 voci aggiunte (C158 c'era già, aggiornata la riga in Aspetta Mario; riga nuova «v0.10.30 ONLINE, foto del menù»).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario (PT E82). Ricordare per prima la DOMANDA C158 (riga «Principale 81 · C158» in Aspetta Mario) con «📌 Di cosa parliamo» e scelte 1 · 2.
2. Col «1» su C158: in `.claude/hooks/avvio-check.py` (`parole_intere`, riga ~456) leggere il registro anche dalla scorta della sessione precedente (`git show origin/scorta-principale-*-<id corto>/claude/pronti-ramo-definitivo:docs/MESSAGGI-MARIO.md`) e stampare i messaggi della precedente non ancora nel ramo; prova dell'hook; riga in ERRORI (PT E84 bis). File di `.claude/`: serve l'ok scritto di Mario nella chat (RVC E59).
3. Foto di Mario del menù 0.10.30 → chiudere C155 barra e C157 (👁).
4. Controllo regole dopo la DOMANDA 2 #79. Vecchi: «Tutto dentro l'app» e C156, trascrizione ogni mattina (sveglia della #77 `trig_01E2n2khL5VsdZX4q5C51iN3`, gira nella #77), scritte C154, idee C149, C140, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.
## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 20; prime le 3 della #79: DOMANDA 1 tasti 🛑, 2 controllo regole, 3 misura C157).

## Ultimo messaggio di Mario
13/11 ~21:20, parola per parola: «Scusa, se facciamo da quella precedente e basta, non rimarranno mai indietro, perché alla fine quella dopo legge quella precedente. Di tutte mi sembra un po', forse un po' troppo dispendioso di token, di tutte quelle aperte. Facciamo della precedente. Perché non facciamo invece... risolviamo meglio che il passaggio di consegna, valuta tu se è meglio fare un passaggio di consegna più accurato oppure che la sessione dopo legge la sessione precedente. Qual è meglio, qual è il sistema migliore, più ottimale per lavorare meglio?»
→ risposto: meglio che la nuova legga la precedente (anche la sua scorta), tabella e proposta; DOMANDA C158 1 · 2 in Aspetta Mario. Prima, 21:1x: «spiegami cosa vuoi fare su chiedi o ordina più misura della teglia» → spiegato; 21:12 «le foto per ora vanno bene… cosa resta in sospeso?» → tabella delle cose in sospeso.
## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C159; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 20:46 · [AVVIO] Sessione #81 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio, titolo, foto rimandate
- 2026-11-13 21:12 · Allora, le foto secondo me per ora vanno bene. Cosa resta in sospeso? La questio… → risposta alla DOMANDA 1 #80 (foto ok) → v0.10.30 online (1e115ff), tabella delle cose in sospeso
- 2026-11-13 21:18 · Allora, spiegami cosa vuoi fare su / chiedi o ordina più misura della teglia. Qu… → spiegato barra + misura della teglia
- 2026-11-13 21:18 · Scusa, se facciamo da quella precedente e basta, non rimarranno mai indietro, pe… → C158: proposta + DOMANDA C158 in Aspetta Mario, `docs/lavori-in-corso/c158-passaggio-consegne.md`

Ultimo, intero:
> Scusa, se facciamo da quella precedente e basta, non rimarranno mai indietro, perché alla fine quella dopo legge quella precedente. Di tutte mi sembra un po', forse un po' troppo dispendioso di token, di tutte quelle aperte. Facciamo della precedente. Perché non facciamo invece... risolviamo meglio che il passaggio di consegna, valuta tu se è meglio fare un passaggio di consegna più accurato oppure che la sessione dopo legge la sessione precedente. Qual è meglio, qual è il sistema migliore, più ottimale per lavorare meglio?

