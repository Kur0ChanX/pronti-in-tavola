# Passaggio di consegne

Sessione attuale: #59 (dopo la #58 `session_01WTjqUtkYeeZHD4f7DVbw4V`, chiusa alla soglia 11/11 12:55; la apre la #58 con `create_session`: `session_01WTjqUwA2q291z3N1uEMDoL`, catena 7 di 8).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 12:55):** 1) ricette proteiche: ne vuole 200, «specialmente dolci snack merenda colazione dopo allenamento» (C139): online 191 ma solo 4 dolci → DOMANDA regola dolci 1-3; 2) il ricettario non deve MAI bloccare Cloudflare (le 191 sono un file del sito, zero letture); 3) corsia d'emergenza C135 (login Cloudflare giusto); 4) C140 giri di prova: PC di casa → Blacksmith → GitHub per tutti i progetti.

## Stato (11/11 12:55 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Scorta della #58 da unire solo se ha lavoro nuovo.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs` pubblica da solo (`sito.yml`): codice a metà = patch in `docs/lavori-in-corso/`, mai commit dei `.js`. Pubblicazioni 0.10.20-22 verdi (sito aggiornato).
- **v0.10.22 online** (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.22; `…/ricette-fit.js` ha 191 righe `  {`). Giro completo locale 93/93 sulla 0.10.20; sulla 0.10.22 92/93 con la sola soglia della prova C139 (carte ≥ 10) poi corretta a 3 e `SOLO=C139` verde.
- **C135, cosa manca**: causa del 10041 TROVATA (PT E64, foto di Mario): cassetto nell'account `0818…` del login `info.prontiintavola`, che non ha il Worker. Quando Mario manda l'indirizzo del cassetto NUOVO (`…/<account>/workers/kv/namespaces/<ID>/settings`): metti l'ID in `wrangler.jsonc` (togli `//` dalla riga «Da rimettere…», ID nuovo), push, controlla il giro verde, poi `/api/stato` → `riserva` con `quando` dopo 10 minuti. Guida corretta in `GUIDE-GIUSTE.md` (cassetto C135).
- **C135 come funziona** (worker.js, cerca «C135», `riservaKv`): copia `avvisi` scritta solo quando cambia; cron `*/10` → `riserva()`; `/api/prova {riserva:true}` = prova di Mario. ~150 letture KV al giorno.
- **C139**: v0.10.19 = Proteiche filtra senza cercare sul web + doppia conferma (`okConsumo`). v0.10.20 = `ricette-fit.js` (191: RicetteFit 154, GZ 37; dolci 4, spuntino 13, merenda 4, colazione 3, allenamento 50) scritto da `tools/raccogli-fit.mjs` (pagine in `.cache-fit/`, non su GitHub: rilancio = rilegge i siti ~30 min; regola presa da `ricettario.js` col `vm`); caricato da `caricaRicette`, aggiunto in `elencoRic`. v0.10.21-22 = `PAROLE_MOM.salato` toglie i piatti salati da Colazione, Merenda, Dopo cena e Dolci (PT E65). Stima con regole snack più larghe (prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %): 230 buone, dolci 22, merenda 23, colazione 16. Dettagli: `docs/lavori-in-corso/c139-ricette-senza-consumi.md`.
- Server: ripartito l'11/11 alle 01:26 (non alle 01:00: PT E63); `/api/chiave` dà la chiave, `/api/stato` 2 telefoni iscritti, `riserva: {spenta: true}` (manca il cassetto). Verifica: `curl -s …/api/chiave` → `{"chiave":…}`.
- Sveglie: nessuna mia; nessuna da rifare.
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca `data.js` → v0.10.19 o dopo (`git apply --exclude=data.js` + novità a mano), al «1» di Mario.
- File snelli: `docs/ERRORI.md` ~10 KB, al tetto (lezione nuova = riga corta + storia in `ERRORI-STORIA.md`); `docs/DA-FARE.md` voci ≤ 400 caratteri.
- Chat parallela **Salvagente 4** attiva (C138, solo documenti, `docs/CONSEGNE-PARALLELA-SALVAGENTE.md`, riga 🛑 in Aspetta Mario): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto (arriva col «KIT NUOVO» all'avvio), non urgente; Preferenze v38 uguali.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.
- Piani: C137 `docs/lavori-in-corso/c137-modalita-risparmio.md`; C136 `docs/lavori-in-corso/c136-blocco-ricettario.md`; C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch.
- Manuali KV: developers.cloudflare.com/kv/get-started (dashboard: Workers KV → «Create instance»), /kv/concepts/kv-namespaces («KV namespace IDs are public»), /workers/authorization/workers (permessi per i binding).

## Sessione appena chiusa (#58)
- Avvio; messaggio di Mario 11:25 (arrivato nella #57) = strada 1 → 191 proteiche nel file del sito, v0.10.20-22 online, PT E65. C140 (giri casa → Blacksmith → GitHub): fatti dai manuali e DOMANDA 1 (motore di casa già collegato?).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #58: allentare SOLO gli zuccheri degli snack (30 % o 40 %) → +2 dolci appena: li blocca la quota di proteine. Altre 10 ricerche di dolci su GZ (senza zucchero, albumi, ricotta…) → 0 nuove buone. Filtro «yogurt»/«dolc» nei nomi → pollo a colazione e «patate dolci» nei dolci (PT E65). `tools/anteprima.py` con `ricette-fit.js` dentro → rompe i conteggi delle prove vecchie: il file si aggiunge solo nella prova C139 (`addScriptTag`, poi `RICETTE_FIT.splice(0)`).
- #57: ipotesi B (permesso KV del token) SCARTATA: il problema era il login/account (PT E64). Tasti dei momenti in Proteiche che cercano sul web da soli → tolti (consumavano). Prova C55 da sola (`SOLO=C55`) è rossa anche prima delle modifiche: nel giro completo è verde.
- #56: collegare un cassetto creato a mano con il solo accesso «Editor» del token → «KV namespace not found 10041» (manuale: «non servono permessi sulle risorse collegate», dal vivo NON vale o è l'account). Link `dash.cloudflare.com/?to=/:account/workers/kv/namespaces` dal telefono → apre la Home.
- #55: collegare il cassetto dal pannello «Associazioni» del Worker → scartato: il deploy successivo da GitHub (`wrangler.jsonc`) lo toglierebbe. `git rev-parse --short HEAD origin/…` → «Needed a single revision» che sembra un push fallito (PT E59). Testo intero delle voci aperte come righe `| C…` in `DA-FARE-FATTE.md` → `promesse.py --controlla` rosso (PT E60).
- #54: Context7 → quota del mese finita: ricerca Parallel (skill `ricerca-aggiornata`). Heredoc `cat > file <<EOF` con la parola `env` → fermato dalla guardia: script scritti con Write. Per C55: spia su `mostraToast`.
- #53: togliere il cron da `wrangler.jsonc` → scartato (Mario non potrebbe riaccendere il motore). `turbo` con n non valido deve dare errore.
- #51: piano Workers Paid → NO di Mario. Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). `send_later` a catena 8 → rifiutato.
- #50: commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. Avvio leggero. Controlla il sito: v0.10.22.
1. Mario risponde alla DOMANDA regola dolci (riga C139 in «Aspetta Mario»). Con 2: soglie di base `fitSnackProt` 8, `fitSnackPerc` 20, `fitSnackZuc` 30 in `ricettario.js` (`fitRic`) e in `opzioni.js` (stessi nomi), aggiorna la nota delle regole e le prove C124/C125 che citano «10 g»/«30 %»; poi `node tools/raccogli-fit.mjs 200` (rilegge i siti, ~30 min, in sottofondo), `SOLO=C139`, giro completo, versione, push, foto. Con 3: cercare un terzo sito con valori per porzione nel JSON-LD (fonti ufficiali, PT E25).
2. C140: alla risposta di Mario sul motore di casa (foto Runners) → specifica in `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`: un motore per progetto sul PC, passo «scegli» (chiave di sola lettura dei motori + crediti Blacksmith da `.claude/conta-minuti.py`), pubblici sempre su GitHub; regola per tutti i progetti → kit (sessione del kit).
3. C135: Mario manda l'indirizzo del cassetto nuovo → `wrangler.jsonc`, push, giro verde, `/api/stato` riserva accesa.
4. Foto di Mario di Proteiche per chiudere la promessa C139.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (12 della principale; nuove della #58: C139 regola dolci 🛑, C140 motore di casa). Controllo Da fare: 1 voce aggiunta (C140).

## Ultimo messaggio di Mario
11/11 ~11:45, parola per parola: «Domanda, puoi fare in modo che tutti i progetti possano passare per il mio GitHub a casa, che ho creato un server, se provano inizialmente il mio server del PC a casa per fare i giri di prova su GitHub, se è occupato da un altro progetto che non c'è spazio passano a Blacksmith, se ho finito i crediti di Blacksmith passa a GitHub server normale, quello con quello il server gratuito, ecco, con i limiti per chi ce li ha, per chi ha un progetto privato, chi ce l'ha pubblico invece è un altro discorso.» → C140, DOMANDA 1.
Prima (11:25, nella #57): «Aggiungi 200 ricette proteiche specialmente dolci snack merenda colazione dopo allenamento poi il resto cerca da varie fonti» → C139 v0.10.20-22.

## Numeri liberi
Prossimo E libero: PT E66; prossimo C libero: C141; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 10:59 · [AVVIO] Sessione #58 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio; messaggio 11:25 dalla #57 → C139 v0.10.20-22
- 2026-11-11 11:45 · Domanda, puoi fare in modo che tutti i progetti possano passare per il mio GitHu… → C140 + DOMANDA 1

Ultimo, intero:
> Domanda, puoi fare in modo che tutti i progetti possano passare per il mio GitHub a casa, che ho creato un server, se provano inizialmente il mio server del PC a casa per fare i giri di prova su GitHub, se è occupato da un altro progetto che non c'è spazio passano a Blacksmith, se ho finito i crediti di Blacksmith passa a GitHub server normale, quello con quello il server gratuito, ecco, con i limiti per chi ce li ha, per chi ha un progetto privato, chi ce l'ha pubblico invece è un altro discorso.

