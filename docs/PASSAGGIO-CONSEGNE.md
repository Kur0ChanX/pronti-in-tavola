# Passaggio di consegne

Sessione attuale: #76 (dopo la #75 `session_01WTjqUtr7kgfPr9chcd8gX1`, chiusa alla soglia 13/11 15:23; la apre la #75 con `create_session` (catena 6 di 8)).

**#76 aperta dalla #75 (13/11, ferma ad aspettare Mario oltre 180k, C455).** C152 (+70 proteiche) e C153 (dosi del procedimento di Pietrobon) PRONTE IN PATCH, NON online: aspettano l'ok di Mario (DOMANDA 1, foto `archivio/foto/2026-11-13-c153-cloud-bread-ingredienti.png` mandata).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (13/11, #75):** ingredienti completi nelle ricette video (15:18 «mancano in tutti ingredienti»); altre ricette (12:57). Prima (#74): Ricettario chiaro (12:50 «3000 tastine… non si capisce nulla»), niente video non ricette fra le ricette (12:53 «è uno scherzo?»; 12:54 «cose utili… lasciale… una sezione a parte»); altre ricette (13:0x «hai altre ricette da aggiungere?»).

## Stato (13/11 15:23 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261113-01WTjqUtr7kg/claude/pronti-ramo-definitivo.
- **C151 ONLINE v0.10.27** (giro 98/98 verde, commit `[pubblica]` 2ddd559). Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c filtriAccesi` → 5; `…/ricette-video.js | grep -c '"altro"'` → 18. Video non ricette: `tools/dati/video-non-ricette.json`, `raccogli_video.py` `segna_altro`.
- **C152 in patch** `docs/lavori-in-corso/c152-stimate-nuove.patch` (ricette-stimate.js: 522 vecchie uguali + 70 nuove; 37 porridge passano a dolce). Verifica: `git apply --check` ok; prova `SOLO=C141` verde.
- **C153 in patch** `docs/lavori-in-corso/c153-dosi-procedimento.patch` (ricette-video.js: 13 ricette Pietrobon con dosi del procedimento, Cloud bread 3 → 5 ingredienti). Prove `SOLO=C144`, `SOLO=C150` verdi. Strumenti già nel ramo: `tools/stima.py`, `tools/raccogli_stimate.py --ignoti/--aggiungi`, `tools/raccogli_video.py --dosi-su`.
- C151 CHIUSA (Mario ha visto il Cloud bread trovato, 15:17).
## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#75)
- Avvio; sveglia C150 14/11 9:10 rifatta dalla #76 (`trig_01AeWzak3U9TaJYRmrQaDu7k`), quella della #75 cancellata.
- C152: `--ignoti` (scarti per stima 293 → 136), stima migliorata (q b, erbe, attrezzi, pezzi, 9 prodotti, 20 codici CREA; bug cipollotti=pollo, pomodorini 100 g, peperoncino 150 g), `--aggiungi`: +70. Una tolta (nome «Kcal totali…»).
- C153: foto di Mario del Cloud bread con 3 ingredienti → dosi nel procedimento (solo Pietrobon: gli altri raccontano, provato: rumore).
- Controllo Da fare: 2 voci aggiunte (C152, C153); C151 chiusa in DA-FARE-FATTE.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #72: **Flash-Lite** per trascrivere (500 al giorno gratis) → no: meno preciso, crema di riso contata due volte; Mario «il lite fà un pò schifo». **Gemini Omni** (`gemini-omni-1.2-flash`) → no: CREA video, niente generateContent né piano gratis. **gemini-2.5-flash** → 404 per gli utenti nuovi dall'11/11. Valori nutrizionali detti nel video → no: 2 su 3 sbagliati, si stimano dalle dosi. `--finto` scriveva nella cache vera → corretto.
- #71: testo dei video coi sottotitoli di YouTube → no: `captions.download` solo per chi può modificare il video (403); librerie non ufficiali bloccate dai server cloud. Scaricare l'audio (Mario: «ti do il permesso») → no: contro le regole di YouTube e serve aggirare i controlli anti-robot. Finestra sicura `request_credential` per la chiave Gemini dal telefono → «Denied» (come PT E28): chiave a mano come variabile.
- #69: creatori solo TikTok o Instagram (Marta Ponzini, Melissa «ginni_fit») → fuori dalla lista: non si leggono in automatico (#59). Greg Doucette → fuori: oggi quasi niente ricette. Snellire Da fare spostando «voci chiuse» → non ce n'erano (sono tutte promesse aperte): tolta solo la storia.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
0. PRIMA: C154 (messaggio di Mario ~15:30 sopra): domanda 🛑 su cosa fare delle ricette video (1 solo complete · 2 togliere tutto · 3 avviso «forse incompleti»), con i numeri veri. C152 (70 stimate) è indipendente dai video: chiedere a parte se pubblicarla.
1. Risposta di Mario alla DOMANDA 1 (C152 + C153). «1» → `git apply` delle due patch, versione nuova (`VERSIONE` in data.js e sw.js come le volte prima), anteprima, giro completo verde (dove dice `tools/scegli-giro.py`), commit `[pubblica]`, curl di verifica, «chiudi e riapri l'app». «2» → correggere quello che dice.
2. Ogni mattina dopo le 9:00: `python3 -I tools/trascrivi_video.py --da ricette-video.js` in sottofondo (se C153 non è ancora online, prima `git apply` della patch in locale e poi toglierla: il json del parlato non è del sito); controllo a campione e righe `dubbi`; commit del json; sveglia `send_later` del giorno dopo.
3. Ordine della trascrizione: oggi prima i video senza valori, poi senza dosi. Valutare di mettere prima le ricette con ingredienti senza quantità (Mario vuole ingredienti completi).
4. Foto di v0.10.26 (C148, C150, «🎙️ dosi»): Cloud bread non è ancora trascritto; mandare a Mario una ricetta già trascritta (es. `yt:-suyFvtSL6k`).
5. Altri creatori (Ricette di Alice, HSN, Sergio Chisari); idee C149 quando Mario risponde. Vecchi: C140 privato, C143 + kit 38.26, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70): vecchie.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 16; 🛑 C148+C150 online, 🛑 C150 foto, 🛑 C141 pagella, idee C149).

## Ultimo messaggio di Mario
13/11 ~15:30 (dopo l'handoff), parola per parola: «mi sà che cancelliamo tutto cosí nom ha senso / non posso riguardare il video perché ho paura che manchi qualcosa / chissà in quanti altre ricette video mancano gli ingredienti.......» → C154: decidere con Mario cosa fare delle ricette video (consiglio: mostrare solo le complete dal parlato); C153 NON pubblicare. Prima:
13/11 15:18, parola per parola (con 2 foto del Cloud bread): «mancano in tutti ingredienti» → C153 patch + foto, DOMANDA 1 (1 = metto online C152 + C153 · 2 = no).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C155; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Alto** (`high`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-13 13:19 · [AVVIO] Sessione #75 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio; C152 +70 proteiche (patch)
- 2026-11-13 15:18 · mancano in tutti ingredienti → C153 patch + foto, DOMANDA 1

Ultimo, intero:
> mancano in tutti ingredienti

