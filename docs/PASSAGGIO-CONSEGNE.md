# Passaggio di consegne

Sessione attuale: #75 (dopo la #74 `session_01WTjqUw4QVbXHnpAg1txmfs`, chiusa alla soglia 13/11 13:09; la apre la #74 con `create_session` (catena 5 di 8)).

**#75 aperta dalla #74 (13/11, ferma ad aspettare Mario oltre 180k, C455).** v0.10.27 ONLINE (#74, Mario «va bene metti online»): C151 Ricettario riordinato + «💡 Consigli, allenamenti e altro» (18 video). Aspetta la foto di Mario (chiudi e riapri l'app).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11, #74):** Ricettario chiaro (12:50 «3000 tastine… non si capisce nulla»), niente video non ricette fra le ricette (12:53 «è uno scherzo?»; 12:54 «cose utili… lasciale… una sezione a parte»); altre ricette (13:0x «hai altre ricette da aggiungere?»).

## Stato (13/11 13:09 ora italiana)
- **C151 ONLINE v0.10.27** (giro 98/98 verde, commit `[pubblica]` 2ddd559). Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c filtriAccesi` → 5; `…/ricette-video.js | grep -c '"altro"'` → 18. Video non ricette: `tools/dati/video-non-ricette.json`, `raccogli_video.py` `segna_altro`.
## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#74)
- Avvio, sveglia C150 rifatta (`trig_01JKS2CJhRPjxHBXxR1GXhxu`, 14/11 9:10). Foto di Mario: v0.10.26 online, «Ricette video (798)» ✅, ma «cloud bread» 0 in Proteiche (ricerca solo nella scheda accesa) → C151.
- PT E78 (video di allenamento fra le ricette). Prima tolto il video e preparata v0.10.27 (giro 98/98 verde), poi annullata per «lasciale… sezione a parte».
- Controllo Da fare: 1 voce aggiunta (C151).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #72: **Flash-Lite** per trascrivere (500 al giorno gratis) → no: meno preciso, crema di riso contata due volte; Mario «il lite fà un pò schifo». **Gemini Omni** (`gemini-omni-1.2-flash`) → no: CREA video, niente generateContent né piano gratis. **gemini-2.5-flash** → 404 per gli utenti nuovi dall'11/11. Valori nutrizionali detti nel video → no: 2 su 3 sbagliati, si stimano dalle dosi. `--finto` scriveva nella cache vera → corretto.
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Foto di Mario su v0.10.27 (Ricettario: un tasto «Filtri», «cloud bread» trovato; Ricette video → «Consigli, allenamenti e altro»): chiudere 👁 C151. Mario 13:11 «caricarle io 30 per volta non consumo limiti?» → risposto: poco, e le carico io in automatico (da fare: RicetteFit 459/905 senza tocchi di Mario).
2. Poi «altre ricette» (risposta a Mario #74): prima le ~300 scartate da `tools/stima.py` (ingredienti sconosciuti), poi Ricette di Alice, HSN, Sergio Chisari.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67) e `01WTjqUvtoJC` (#70): vecchie (C148 ormai online).
3. Foto di v0.10.26 (C148, C150): «798» visto da Mario 12:49; «🎙️ dosi» da vedere dopo C151 (cloud bread si trova). Poi chiudere le 👁. Era: quando Mario manda la foto di v0.10.26 (Ricette video con Cotto al Dente e 2foodfitlovers, «Cloud bread» con «🎙️ dosi dal video»): chiudere le 👁 di C148 e C150 se va bene; se Mario scrive altro, prima quello.
4. Ogni mattina dopo le 9:00 (limite azzerato): `python3 -I tools/trascrivi_video.py --da ricette-video.js` in sottofondo (C148 ormai nel file: niente patch); controllo a occhio a campione e delle righe `dubbi`; commit del json. Sveglia `send_later` 14/11 9:10 (`trig_01JKS2CJhRPjxHBXxR1GXhxu`, della #74; quella della #73 cancellata): rifarla ogni giorno.
5. A fine giro: rifare i primi video senza «nome» (togliere le loro voci senza nome dal json e rilanciare), poi nuove versioni coi video trascritti.
6. Altri creatori della tabella #70 (Ricette di Alice, HSN, Sergio Chisari); idee C149 quando Mario risponde. Vecchi: C140 privato, C143 + kit 38.26, pagella C141, Android schermo intero.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 16; 🛑 C148+C150 online, 🛑 C150 foto, 🛑 C141 pagella, idee C149).

## Ultimo messaggio di Mario
13/11 13:11, parola per parola: «va bene metti online ma caricarle io 30 per volta non consumo limiti?» → v0.10.27 online; risposta sui limiti in chat. Prima: 13/11 12:57, parola per parola: «hai altre ricette da aggiungere?» → risposta in chat (tabella: ~450 RicetteFit dal server, ~300 scartate da `stima.py`, 3 creatori, dosi dei video ogni mattina; consiglio: prima C151, poi le 300, poi i creatori). Prima, 12:53 «è uno scherzo verooooooo????» e 12:54 «magari cose utili cosí lasciale visto che c'è ma una sezione a parte» → C151.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C152; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 11:52 · [AVVIO] Sessione #74 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio; sveglia C150 rifatta; riga foto v0.10.26
- 2026-11-13 12:50 · riordina la pagina oltre a non trovare nulla c'è un casino in questa pagina 3000… → C151 riordino (patch + foto, DOMANDA 🛑)
- 2026-11-13 12:53 · è uno scherzo verooooooo???? → PT E78; video non ricette
- 2026-11-13 12:55 · magari cose utili cosí lasciale visto che c'è ma una sezione a parte → C151 sezione «Consigli, allenamenti e altro» (18 video)
- 2026-11-13 12:57 · hai altre ricette da aggiungere? → risposta in chat (tabella); prossimi passi 2
- 2026-11-13 13:11 · va bene metti online ma caricarle io 30 per volta non consumo limiti? → v0.10.27 online (C151); risposta sui limiti

Ultimo, intero:
> va bene metti online ma caricarle io 30 per volta non consumo limiti?

