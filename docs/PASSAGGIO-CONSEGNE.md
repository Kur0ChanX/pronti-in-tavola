# Passaggio di consegne

Sessione attuale: #82 (dopo la #81 `session_01WTjqUwJ4nEdo84Hoh2yP3S`, chiusa alla soglia 13/11 21:24; la apre la #81 con `create_session` (catena 4 di 8)).

**#81: la apre la #80 (catena 3 di 8).** #80: C157 (misura della teglia da scegliere) + barra «Chiedi o ordina» dei tasti (C155) fatte in UNA patch `docs/lavori-in-corso/c155-c157-tutto.patch`, prove C157 verdi, foto della barra mandate: aspetta l'ok di Mario (DOMANDA 1 #80). Niente online. Lisa ha ordinato da sola (link non più urgente).

- **Modo di lavorare (Mario 13/11 18:50, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11 sera, #80):** tasti del menù COME LI VUOLE LUI (foto `archivio/foto/2026-11-13-c155-barra-{1,2}.png`, DOMANDA 1 #80), poi online insieme a C157. Poi il passaggio di consegne che non perda niente (C158, DOMANDA 2 #80) e il controllo delle regole (DOMANDA 2 #79). Caratteri grandi: Mario «è solo per la gente che vede poco» → foto a Mario coi caratteri NORMALI; i grandi li controllo io (PT E83 resta per il controllo). Turni corti, prima rispondere, niente lavori non chiesti.

## Stato (13/11 21:24 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUwJ4nE/claude/pronti-ramo-definitivo.
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **v0.10.29 ONLINE** (#78, giro 99/99 locale, commit `[pubblica]` e8e10dc): «Scrivimi» capisce gli ordini + link `…/?ordine=<testo>` (carrello pronto, `carrelloDaLink` in app.js). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.29; `…/app.js | grep -c carrelloDaLink` → 3. Link e messaggio WhatsApp per Lisa dati a Mario 13/11.
- **Patch `docs/lavori-in-corso/c155-c157-tutto.patch`** (#80, app.js aiutante.js voce-clienti.js style.css data.js tools/prova.js; dentro anche la vecchia `c155-tasti.patch`): C157 = azione `scegli` in voce-clienti.js, `daScegliere` in `controllaAIC` (aiutante.js), riquadro rosso «Scegli la misura» (`sceltaMisura`, `c-misura`) e «Invia» spento (`misuraManca`) in app.js, prova «link senza misura… (C157)»; C155 = barra `.ai-cliente` ferma in cima, testo «Chiedi o ordina: allergie, prezzi…», microfono a destra; `fabVisibile` solo nel carrello; barra in basso a 3 voci; v0.10.30 + novità (da riscrivere: parla ancora della striscia delle allergie). Verifica: `git apply --check`. Prove dei tasti in tools/prova.js ancora sul microfono galleggiante del menù (`.vc-fab`): da aggiornare prima del giro.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#80)
- Link di Lisa: il primo (senza 2 kg) era sbagliato perché i messaggi di Mario scritti nella #78 dopo l'handoff non erano nell'avvio (arrivati dopo, girati dalla #79) → C158. Giusto: `…/?ordine=2%20kg%20di%20ravioli%20ricotta%20e%20spinaci%0A1%20teglia%20di%20melanzane%20alla%20parmigiana`. Lisa poi ha ordinato da sola.
- C157 e barra C155 in patch (vedi Stato); foto C157 `archivio/foto/2026-11-13-c157-misura-{1,2}.png` (fatte coi caratteri grandi, prezzi del menù di prova) e barra `…c155-barra-{1,2}.png`.
- Giro completo NON fatto (fermato per lavorare ai tasti).
- Controllo Da fare: 1 voce aggiunta (C158); Aspetta Mario: tolta DOMANDA 1 #79 e la riga foto C157, aggiunte DOMANDE 1-2 #80.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario (PT E82). Niente online prima del suo «1» alla DOMANDA 1 #80 (foto barra).
2. Col «1»: `git apply docs/lavori-in-corso/c155-c157-tutto.patch`; aggiornare le prove dei tasti (`.vc-fab` nel menù non c'è più; barra `.ai-cliente` ferma, un microfono solo); novità v0.10.30 riscritte (barra «Chiedi o ordina», «Scrivi a Monica» in basso, misura della teglia da scegliere); controllo coi caratteri grandi (solo io, niente foto a Mario); giro completo; `v0.10.30 [pubblica]`; curl; a Mario «chiudi e riapri l'app».
3. Con «2» o correzioni: rileggere le sue parole intere in fondo a `docs/lavori-in-corso/c155-messaggi-in-ordini.md`, «Ho capito: …» prima di nuove foto.
4. C158 dopo la DOMANDA 2 #80 (hook `avvio-check.py` funzione `parole_intere`: tutte le sessioni non chiuse). Controllo regole dopo la DOMANDA 2 #79. C157 dal menù normale dopo una domanda (la #79 la chiedeva: tolta, Mario è passato ai tasti).
5. Vecchi: «Tutto dentro l'app» e C156, trascrizione ogni mattina (sveglia della #77), scritte C154, idee C149, C140, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.
## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 20; prime le 3 della #79: DOMANDA 1 tasti 🛑, 2 controllo regole, 3 misura C157).

## Ultimo messaggio di Mario
13/11 ~20:45, parola per parola: «Allora, questa cosa dei ravioli l'ha fatta il cliente, è entrato dentro e è riuscito a ordinare. Allora, come prima cosa miglioriamo quella cosa del tasto che ti ho detto. Se ho capito bene, mandami prima delle foto, quella del microfono e quella della ricerca sopra, di togliere il doppio microfono e la ricerca sopra solo col microfono, che fa tutto, sia allergie sia per ordinare dall'app. Mettila larga al massimo e che segua un po' lo scroll, non farla troppo grossa, nel senso troppo alta, ecco. Se riesci a farci stare tutto in una riga, magari col pulsante a destra del microfono, e sotto il tasto scrivimi.
Poi dimmi se hai migliorato questa cosa, questo problema che abbiamo avuto nel passaggio di consegna, che non hai capito, che lo miglioriamo, che facciamo che leggi tutto quello della sessione precedente, gli ultimi messaggi, oppure fai in modo che non si perda lucidità nel passaggio di consegna, a discapito magari di qualche piccolo token in più.
Ma poi io non capisco questa cosa dei caratteri grandi che stai dicendo, secondo me hai capito male. Cioè non per forza... Cioè quello dei caratteri grandi è un pulsante che attivi e disattivi. Non capisco questa cosa che mi vuoi far vedere con i caratteri grandi, cioè non l'ho capito. Quello è solo per la gente che vede poco.»
→ foto barra (DOMANDA 1 #80), risposta sul passaggio di consegne + C158 (DOMANDA 2 #80), caratteri grandi: foto normali.
## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C159; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 20:46 · [AVVIO] Sessione #81 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → 
- 2026-11-13 21:12 · Allora, le foto secondo me per ora vanno bene. Cosa resta in sospeso? La questio… → 
- 2026-11-13 21:18 · Allora, spiegami cosa vuoi fare su / chiedi o ordina più misura della teglia. Qu… → 
- 2026-11-13 21:18 · Scusa, se facciamo da quella precedente e basta, non rimarranno mai indietro, pe… → 

Ultimo, intero:
> Scusa, se facciamo da quella precedente e basta, non rimarranno mai indietro, perché alla fine quella dopo legge quella precedente. Di tutte mi sembra un po', forse un po' troppo dispendioso di token, di tutte quelle aperte. Facciamo della precedente. Perché non facciamo invece... risolviamo meglio che il passaggio di consegna, valuta tu se è meglio fare un passaggio di consegna più accurato oppure che la sessione dopo legge la sessione precedente. Qual è meglio, qual è il sistema migliore, più ottimale per lavorare meglio?

