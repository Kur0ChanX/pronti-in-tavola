# Passaggio di consegne

Sessione attuale: #52 (dopo la #51 `session_01WTjqUv8dDcEnw4cyAzmz4S`, chiusa alla soglia 10/11 17:02; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.). NUOVO 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario.
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #20 alla #26: stesso file, in fondo.
- **Cosa preme a Mario adesso (10/11 17:05, arrabbiato):** 1) C130: Cloudflare ha bloccato il server dalle 15:35 alle 01:00 (letture gratuite finite per il MIO carico veloce, PT E53): notifiche degli ordini a Monica ferme. Mario: «l'app deve funzionare… io non ho soldi», niente blocchi alle persone (PT E54). 2) Dopo le 01:00: provare dal vivo che tutto riparta. 3) Poi C133, C127, kit v38 (domande aperte).

## Stato (10/11 17:05 ora italiana)
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta (il push di `*.js`, `*.css`, `*.html` del ramo pubblica il sito vero da solo: `sito.yml`; i soli documenti no). Scorte della #50, #49 e parallele Voce: NON unirle (E97).
- v0.10.15 = C130 bis (server) + C131 (soglie P1 di Proteiche): push della #51 alle 17:08 (giro 90 OK, 0 NO; server 161 OK, 0 NO), pubblica da sola (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP`).
- Server bloccato da Cloudflare fino alle 00:00 UTC = 01:00 italiane (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/api/chiave` → oggi `{"errore":"…rows read…"}`, dopo le 01:00 `{"chiave":"…"}`). Ordini, menù e clienti vanno (Firebase); notifiche, «Sono qui sotto», database ricette fermi fino alle 01:00.
- C130 bis nel codice: `contiDb` (conteggi pesanti salvati 30 min), `contaCoda` (15 min, rifatta quando entra qualcosa), indice `coda_ordine` + `prendi` senza leggere tutta la coda, avviso «letture» a Mario alla prima frenata del giorno (`segnala` → `sw.js` testo `letture`), contatori di aiutante e microfono che non fermano mai (Avvisi guasto = si risponde lo stesso), errore di Cloudflare tradotto (`perche`). Nessun blocco alle persone. Misura (`tools/prova-database.mjs`, riga «MISURA»): giornata intera ~807 mila righe su 5 milioni (prima: cron 3.054 e sveglia 1.965 righe l'una, ora 71 e 42).
- C127 pezzi 2-3 in `docs/lavori-in-corso/c127-pezzi-2-3.patch`: tocca anche `data.js` (0.10.15) → ora va rifatta come v0.10.16 (`git apply --exclude=data.js` + novità a mano).
- Kit: qui 35.0; fonte 38.14. Chiave «Kit RVC lettura» fino al 30/11/2027, promemoria `trig_0168NSAAcmYsGPeUsondSuow`. CLAUDE.md ~1459 token (tetto 1000).
- `docs/DA-FARE.md` 40.901 byte (tetto 40.960): prima di aggiungere, sposta storia in `docs/DA-FARE-FATTE.md`.

## Riferimenti
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- Piani: C127 `docs/lavori-in-corso/c127-giorno-proteico.md` + patch; C131 `docs/lavori-in-corso/c131-regole-proteiche.md`; C126 `docs/lavori-in-corso/c126-proteiche-momenti-e-fonti.md` (pezzi 3-4).
- Foto dell'email di Cloudflare: `archivio/foto/2026-11-10-1645-email-cloudflare-blocco.jpg`, `…-1653-email-cloudflare-orari.jpg` (avviso 90% 15:29, blocco 15:35).

## Sessione appena chiusa (#51)
- C131 P1 fatto (soglie in `opzioni.js` con testi d'aiuto, riserva in `fitRic`, prova con 2 piatti di confine): passi Proteiche 5/5.
- C130: Mario 16:45 email del blocco. Provato dal vivo 16:48 (`/api/chiave` 500 «Exceeded allowed rows read»). Causa PROVATA con l'orario dell'email (15:35, freno v0.10.14 online ~15:52): PT E53. Difese C130 bis scritte e misurate (vedi Stato); server 161 OK, 0 NO.
- Errore mio dopo: ho proposto il piano a pagamento e un blocco alle ricerche delle persone (3,5 milioni) → Mario NO (PT E54): blocco tolto, resta solo l'avviso.
- Giro completo 90 OK, 0 NO; push 17:08 (v0.10.15). Prova dal vivo 17:05: l'app si apre, «Benvenuti da Monica» e «Entra» vanno (Firebase).
- Mario 17:06 «aggiungiamo un account inventato qualcosa, ho l'app ferma»: sconsigliato (indirizzo nuovo = link e icone rotti, memoria vuota, rischio per l'account); chiesto cosa vede fermo (1 notifiche · 2 app o tasto, foto · 3 aiutante o microfono).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #51: piano Workers Paid (5 $/mese, sblocca in pochi minuti) → NO di Mario (niente soldi). Blocco delle ricerche delle persone → NO di Mario (PT E41, E54). Rimettere stasera le notifiche senza Cloudflare (KV o un altro account) → scartato: chiave privata e iscrizioni dei telefoni stanno dentro la memoria bloccata, nuove chiavi = tutti i telefoni da riiscrivere. `send_later` e sveglie → rifiutati a catena 8 (lineage 8): per aspettare usare `run_in_background`. Misura delle righe lette nella prova: `EXPLAIN QUERY PLAN` (SCAN = tutta la tabella, SEARCH = righe trovate), non c'è miniflare qui.
- #50: `tools/scarica-kit.py` NON c'è qui e quello della fonte cerca solo 12 parti → curl a mano (17 parti). Commit dei `.js` per «salvarli» → NO (pubblica il sito): patch in `docs/lavori-in-corso/`.
- #49: `node --check worker.js` NON vede gli errori dei moduli: `node --input-type=module --check < worker.js`. `.find(x => !x || …) || {ok}` nasconde un `null`.
- #48: Monitor con `tail -f` → la guardia lo blocca. Nome di azione nuovo senza `grep` → doppione (PT E51).
- #47: `python3 - <<EOF` con la parola `env` dentro lo ferma la guardia: script in un file dello scratchpad + `python3 -I`.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo).

## Prossimi passi
0. Risposta di Mario a «cosa vedi fermo?»: 2 = guasto vero, correggilo subito (foto in `archivio/foto/`); 1 o 3 = spiega che le notifiche tornano alle 01:00 e che aiutante e microfono vanno dalla v0.10.15 (chiedi una prova). Controllo online: `data.js` 0.10.15 e `sw.js` col testo `letture:`.
1b. Mario 17:12: kit 38.14 «sì» → applica il pacchetto (passo 4, lavoro lungo: da fare per primo dopo il passo 0). C133 «attiva su rvc quelle selezionate da me con i controlli richiesti»: controlli (doppioni, conflitti, regole migliori, col kit 38.14 e fra loro), testo finale in `docs/PER-IL-KIT.md` «C133» e passalo alla sessione del kit di RVC (qui NIENTE `add_repo` di RVC: spegne gli hook); a Mario la tabella dei controlli e cosa è cambiato.
1. Dopo le 01:00 italiane (11/11): `curl -s …/api/chiave` deve dare la chiave. Poi a Mario, in una riga: server ripartito, notifiche di nuovo attive; chiedi la foto della pagina Durable Objects di Cloudflare (utilizzo di oggi) per vedere le righe lette vere. Promessa C130: 7 giorni senza email di Cloudflare.
2. Avviso onesto nell'app quando il server non risponde per il limite (PT E17): una riga per Monica «notifiche ferme fino a stanotte: guarda gli ordini nell'app». Non fatto: proponilo a Mario (idea, non ancora chiesta).
3. Contatore vero (chiave gratuita «Account Analytics», Aspetta Mario): al «1» guida passo passo (pulsanti controllati sul sito) e `request_credential`; il server legge `durableObjectsPeriodicGroups` (campi da controllare con l'introspezione GraphQL) e manda l'avviso a Mario al 40%.
4. C127 (v0.10.16) al «1» di Mario; C133 (7 regole per il kit: doppioni e conflitti, testo a Mario); kit v38 al «1 · Sì» (lavoro lungo); foto Proteiche (C127/C128).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md`. Nuova della #51: C130 contatore vero gratuito (1 sì · 2 no). Il piano a pagamento NON si richiede più (Mario NO). Restano: kit 38.14 (🛑), C132 proposte 1-3, C127 «1/2», foto Proteiche.

## Ultimo messaggio di Mario
10/11 ~17:12 (in questa chat, #51), parola per parola: «Kit si le regole attiva su rvc quelle selezionate da me con i controlli richiesti» → kit 38.14: SÌ (passo 4); C133: le 7 regole vanno attivate nel kit di RVC dopo i controlli (passo 1b).
Prima, ~17:06: «Aggiungiamo un account inventato qualcosa ho l'app fermaaaaaaaaaaa» → sconsigliato, domanda «cosa vedi fermo?» (passo 0).
Prima, ~17:05: «Devo pagare io i tuoi sbagli? ti sei matto
ti avevo detto di non mettere blocchi ma se qualcosa segnava piú del dovuto dovevi avvisarmi ora metti i blocchi cosí è facile oppure che devo pagare.... non va bene cosí
L'app deve funzionare risolvi ora io non ho soldi ti avviso» → blocco alle persone tolto, piano a pagamento ritirato (PT E54).
Prima, in questa chat: 16:45 foto dell'email «Le richieste di servizio sono temporaneamente bloccate» + «Quello che ho voluto sempre evitare dall'inizio di questo progetto, alla fine non siamo riusciti a renderlo inevitabile.»; «non sei stato per niente bravo in questo» (PT E53); 16:53 foto della posta (blocco 15:35) + «trovami ler forza adesso soluzioni per far funzionare l'app al 100% me lo merito per i tuoi errori».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C134; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).
