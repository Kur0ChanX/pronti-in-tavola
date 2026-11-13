# Passaggio di consegne

Sessione attuale: #79 (dopo la #78 `session_01WTjqUu3oyBhedrQbbAPNAH`, chiusa alla soglia 13/11 19:48; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

**#79: la apre Mario (catena 8 di 8).** #78: v0.10.29 ONLINE (Scrivimi capisce gli ordini + link «carrello pronto» per Lisa). Poi Mario ha chiesto i tasti del menù ordinati e ha DATO L'OK A PUBBLICARE (13/11 ~19:35): patch v0.10.30 `docs/lavori-in-corso/c155-tasti.patch` (giro 99/99 verde PRIMA dell'ultimo ritocco CSS della barra a 3 voci). Mario manda il link a Lisa SOLO dopo che la v0.10.30 è online.

- **Modo di lavorare (Mario 13/11 18:50, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11 sera, #78):** pagina del menù «bella ordinata» online, poi lui manda a Lisa il link «carrello pronto» (già dato, vale ancora). Turni CORTISSIMI, prima rispondere, niente lavori non chiesti, foto coi caratteri grandi prima di pubblicare (PT E83).

## Stato (13/11 19:48 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUu3oyB/claude/pronti-ramo-definitivo.
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **v0.10.29 ONLINE** (#78, giro 99/99 locale, commit `[pubblica]` e8e10dc): «Scrivimi» capisce gli ordini + link `…/?ordine=<testo>` (carrello pronto, `carrelloDaLink` in app.js). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.29; `…/app.js | grep -c carrelloDaLink` → 3. Link e messaggio WhatsApp per Lisa dati a Mario 13/11.
## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#78)
- C155: causa provata (Lisa ha usato «Scrivimi»), v0.10.29 online (giro 99/99): «Scrivimi» capisce gli ordini + `?ordine=<testo>` → `carrelloDaLink` (app.js). Link e messaggio WhatsApp per Lisa dati a Mario.
- Tasti del menù (patch `c155-tasti.patch`, v0.10.30): «Scrivi a Monica» terza voce della barra in basso (`barraCliente`, classe `wa-monica`), tolto il tasto verde fisso e `tastoMonica` (anche in aiutante.js:801), allergie in `.striscia-menu` sticky sotto la testata (`--alto-testata` messo in `render`), barra `repeat(auto-fit, minmax(0,1fr))`. Prove: C155 apre il foglio dalla barra; nel passo C155 `pit-vc-visto` e via il `.vapore` (coprivano il tasto).
- PT E82 (risposta in ritardo), PT E83 (pubblicato senza foto coi caratteri grandi). C156 regola account (Mario «1»: Preferenze + kit + blocco automatico) in Da fare.
- Controllo Da fare: C156 aggiunta; Aspetta Mario aggiornato.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #72: **Flash-Lite** per trascrivere (500 al giorno gratis) → no: meno preciso, crema di riso contata due volte; Mario «il lite fà un pò schifo». **Gemini Omni** (`gemini-omni-1.2-flash`) → no: CREA video, niente generateContent né piano gratis. **gemini-2.5-flash** → 404 per gli utenti nuovi dall'11/11. Valori nutrizionali detti nel video → no: 2 su 3 sbagliati, si stimano dalle dosi. `--finto` scriveva nella cache vera → corretto.
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario (PT E82). Poi `git apply docs/lavori-in-corso/c155-tasti.patch` (oppure `git stash list`: «c155-tasti handoff» c'è solo nel contenitore vecchio), `python3 -I tools/anteprima.py`, foto del menù coi caratteri grandi (`P.grande = true`, Pixel 7): la barra in basso deve avere Menù · I miei ordini · Scrivi a Monica su UNA riga e «Dettami l'ordine» + microfono NON devono coprire la barra (prima del ritocco andava su due righe). Se va: giro completo, commit `v0.10.30 [pubblica]` (Mario HA GIÀ DATO L'OK a pubblicare), curl della versione, poi a Mario: «puoi mandare il link a Lisa» + foto.
2. Dopo: microfono e «Dettami l'ordine» nella striscia in cima (Mario: «così non rimane nessun microfono sospeso lì in basso»; file della Voce `voce-clienti.js` `disegnaVC`/`fabVisibile`, molte prove `.vc-fab` in tools/prova.js). Prima una riga a Mario e il suo ok.
3. Piano «Tutto dentro l'app» (Mario «1»): Messaggi dentro l'app, raccolta `messaggi`, regole Firebase (guida a Mario). Poi C156 regola account (Mario «1»).
4. Vecchi: trascrizione ogni mattina (sveglia della #77), scritte C154, idee C149, C140, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.
## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 19; prime DOMANDA 3 piano e DOMANDA 4 regola).

## Ultimo messaggio di Mario
13/11 19:47, parola per parola: «Voglio mandargliela a Lisa una volta che c'è la pagina bella ordinata, se no riclicca cose che non deve cliccare.» → Mario manda il link solo dopo v0.10.30 online.
## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C157; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Alto** (`high`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 18:43 · [AVVIO] Sessione #78 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio, risposta su C155
- 2026-11-13 18:46 · Cioè, stai rispondendo a quello che ti ho detto dopo 20 e passa minuti? È un'alt… → spiegazione del ritardo, PT E82
- 2026-11-13 18:48 · Se ascolti quello che dico nei messaggi, ti ho detto che Monica non lo visualizz… → causa provata, domanda ritirata, PT E82
- 2026-11-13 18:49 · Come puoi da questo messaggio correggere i gusti dei cibi? Cioè, sei pazzo. Hai … → spiegato il gusto dei ravioli
- 2026-11-13 18:50 · No, non è che non ti avevo chiesto se è una correzione, è una correzione, ma non… → modo di lavorare nelle consegne, v0.10.28 verificata
- 2026-11-13 18:53 · Io voglio che sia tutto tracciato, voglio spingere il cliente a ordinare dall'ap… → C155 piano «Tutto dentro l'app», DOMANDA 3
- 2026-11-13 18:54 · Mi raccomando, questo errore che è appena successo non deve capitare in tutto l'… → C156, DOMANDA 4
- 2026-11-13 18:56 · 1 vai di consiglio Riusciamo a metterlo dentro l'ordine? Almeno rimane tracciato… → DOMANDE 3 e 4 = 1; proposta link Lisa
- 2026-11-13 18:59 · 1 VAI E DAMMI IL LINK PER LISA CON CARRELLO GIà PRONTO DOPO AGGIORNAMENTO DA APP → v0.10.29 online, link dato
- 2026-11-13 19:01 · Puoi mettere qualcosa di carino per scocciare i clienti, qualcosa, qualche, nell… → benvenuto nel carrello (poi tolto)
- 2026-11-13 19:02 · Non nell'app non so come sia possibile un messaggio carino. Cioè, voglio su What… → messaggio WhatsApp per Lisa, riquadro nell'app tolto
- 2026-11-13 19:12 · è normale un lavoro cosí certosino guarda i tasti ...ti ho messo opus alto..... … → PT E83, tasti sistemati in patch
- 2026-11-13 19:16 · Poi ti ho detto, bisogna incentivare i clienti a ordinare nell'app, non a mandar… → Scrivi a Monica in secondo piano
- 2026-11-13 19:29 · Io quel tasto l'avrei messo sotto nella banda bianca tra menu e i miei ordini. A… → DOMANDA 7
- 2026-11-13 19:33 · Che dici? Poi correggimi, eh? Dici che nella parte di su, quella dove c'è scritt… → piano tasti, DOMANDA 8
- 2026-11-13 19:34 · Sì, ok, ma non farla troppo stretta perché te l'ho detto io, no? Cerca di rimpic… → patch c155-tasti v0.10.30, ok a pubblicare
- 2026-11-13 19:47 · Voglio mandargliela a Lisa una volta che c'è la pagina bella ordinata, se no ric… → link a Lisa dopo v0.10.30 online

Ultimo, intero:
> Voglio mandargliela a Lisa una volta che c'è la pagina bella ordinata, se no riclicca cose che non deve cliccare.

