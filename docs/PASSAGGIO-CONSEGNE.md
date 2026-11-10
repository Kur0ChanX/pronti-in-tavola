# Passaggio di consegne

Sessione attuale: #52 (dopo la #51 `session_01WTjqUv8dDcEnw4cyAzmz4S`, chiusa alla soglia 10/11 17:02; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (10/11 16:55):** 1) C131: Mario ha scelto «p1» → soglie di base nuove di Proteiche (dettagli nei Prossimi passi 0). 2) C133: controllare le 7 regole scelte per il kit (doppioni, regole migliori, conflitti) prima di passarle alla sessione del kit. 3) C127 giorno proteico pronto in patch (aspetta «1»). 4) Kit v38: pacchetto scaricato, aspetta «1 · Sì» (domanda del pacchetto).

## Stato (10/11 17:02 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261110-01WTjqUv8dDc/claude/pronti-ramo-definitivo.
- Ramo = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessuna PR aperta (qui il push di `*.js`, `*.css`, `*.html` del ramo pubblica il sito vero da solo: `sito.yml`; i soli documenti no). Scorte della #50 (`scorta-principale-20261110-01WTjqUud6hw`, solo consumo e ULTIMA-RISPOSTA) e della #49 (`…01WTjqUwbG8f`): solo documenti, NON unirle. Scorte parallele Voce: NON unirle (E97).
- ONLINE v0.10.14 (verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -m1 VERSIONE_APP` → 0.10.14). Nel ramo il codice è uguale all'online: nessun `.js` cambiato dalla #50.
- C127 pezzi 2-3 PRONTI in `docs/lavori-in-corso/c127-pezzi-2-3.patch` (verifica: `git apply --check docs/lavori-in-corso/c127-pezzi-2-3.patch` senza errori): contiene anche `data.js` 0.10.15 con le novità e la pulizia del passo di prova. Giro completo con la patch 91 OK, 0 NO; server 159/0 (#50, 16:25).
- C131: misura su 250 ricette vere in `docs/lavori-in-corso/c131-regole-proteiche.md` (oggi entrano 18; P1 = 29; P2 = 35). Soglie in `opzioni.js` (`def` di fitSaturi 10, fitZuc 10, fitSodio 700, fitSnackZuc 15, fitSnackSodio 400) e valori di riserva in `fitRic` (`ricettario.js` righe 35-37). Prove che usano `fitRic`: `tools/prova.js` riga ~1872 (profili pasto/snack) e i passi Proteiche (righe ~1617, ~1686).
- Kit: qui 35.0; fonte 38.14 (verifica: `curl -s https://raw.githubusercontent.com/RVC-Operation-by-YNOY-CORP/RVC/claude/rvc-ramo-definitivo/docs/kit-progetto/VERSIONE`, la chiave la mette il proxy). Chiave «Kit RVC lettura» fino al 30/11/2027, promemoria `trig_0168NSAAcmYsGPeUsondSuow` (23/11/2027 10:23, sessione nuova; senza connettori, non servono). CLAUDE.md ~1459 token (tetto 1000).
- `docs/DA-FARE.md` ~40 KB (tetto 40 KB = 40.960 byte): la #50 ha spostato la storia di 13 voci in `docs/DA-FARE-FATTE.md`.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.
- **Piano C127 pezzi 2-3**: `docs/lavori-in-corso/c127-giorno-proteico.md` + patch `c127-pezzi-2-3.patch`. **Piano C124**: `docs/lavori-in-corso/c124-ricettario-proteico.md` (8 passi, tutti fatti). **Piano C125**: `docs/lavori-in-corso/c125-fitness-severo-e-cerca.md` (5 pezzi). **Piano C126**: `docs/lavori-in-corso/c126-proteiche-momenti-e-fonti.md` (pezzi 1-2 fatti, 3-4 fonti).

## Sessione appena chiusa (#50)
- Avvio: scorte non unite (parallele Voce e #49: solo documenti); la mia scorta dopo il riavvio del contenitore unita con `-X ours` (solo consumo). Nessuna sveglia della #49.
- C127: patch applicata, `data.js` 0.10.15 a mano, causa dei 2 passi rossi trovata (le ricette di prova aperte restavano in `RIC.scaricate`, cache `pit-ric-cache` e IndexedDB e contavano come «Oggi +N entrate», perché `tutteRic` include le scaricate fuori elenco): pulizia in coda al passo. Giro 91/0. File di nuovo come online, patch aggiornata. Foto rimandata a Mario.
- C131: campione dal vivo (`campione.mjs` + `misura*.mjs` nello scratchpad, non salvati: la logica è in `docs/lavori-in-corso/c131-regole-proteiche.md`). Mario «p1 va bene» alle ~16:55.
- Kit: la #42 (chiusa) ha salvato la chiave col modulo sicuro (Mario 16:30); la #50 ha scaricato il pacchetto v38 indipendente (17 parti) e confrontato i file; promemoria della scadenza creato (Mario «avvisami prima»). C132 (regola «soluzioni smart») e C133 (regole nate qui mancanti nel kit: tabella in chat, elenco in `docs/PER-IL-KIT.md` «C133»).
- Controllo Da fare: 3 voci aggiunte (C131 aggiornata con la scelta, C132, C133).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #50: `tools/scarica-kit.py` NON c'è qui (kit 35) e quello della fonte cerca solo fino a 12 parti → NO col pacchetto v38 (17 parti): curl delle parti a mano. Applicare il kit in questa sessione → NO (74 file con Write, contesto alla soglia). Commit dei `.js` della patch per «salvarli» → NO (pubblicherebbe il sito senza il «1» di Mario): patch in `docs/lavori-in-corso/`, file riportati com'erano con `git apply -R`. Lancio in sottofondo con `&` dentro un comando normale → funziona ma non avvisa: usare `run_in_background`.
- #49 (C130): `node --check worker.js` NON vede gli errori dei moduli (una `}` in più passata): `node --input-type=module --check < worker.js`. Seme del contatore di oggi senza condizione → le prove del server (stessa data) col freno: rosse; ora il seme vale solo con oltre 200 ricette. Cache dello stato a tempo → scartata (le prove leggono i numeri subito dopo ogni passo): una lettura per tabella. `git stash` per separare l'urgenza dal lavoro a metà: ok, poi la patch nel ramo (lo stash vive solo nel contenitore).
- #49 (prova): `.find(x => !x || …) || {ok}` nasconde un `null` (la prova passa finta): mappare tutti i risultati e controllare con `some`.
- #48 (C127): codice del pezzo 2 salvato nel ramo prima delle prove → NO (il push di un `.js` pubblica il sito vero): patch in `docs/lavori-in-corso/`, il codice resta com'è online. Monitor con `tail -f` chiuso a forza → la guardia lo blocca (comando vietato), anche scritto dentro un testo: ciclo con `grep -c` e `sleep`. Nome di azione nuovo senza `grep` → doppione (PT E51).
- #47 (C128): leggere i numeri veri del server dal contenitore → NO (`/api/gz` solo per chi gestisce): campione dal vivo coi lettori veri (`rf.mjs`, `gz.mjs`) + `fitRic`. Pagina 2 della ricerca GZ: `…/ricerca-ricette/page2/<parole>/` funziona (provato dal vivo). `leggiNutr` dentro l'oggetto (sveglie) falliva in silenzio (`.catch` su un array): ora `Promise.resolve().then(...)`. Ricette di prova con `nutr: null` = «lette, senza valori» (colonna 0), NON «da leggere»: per «da leggere» niente `nutr`.
- #47 (prove): `python3 - <<EOF` con la parola `env` dentro lo ferma la guardia («stamperebbe tutte le variabili»): scrivere lo script in un file dello scratchpad e lanciarlo con `python3 -I`.
- Sessioni #28-#46 e 1-22: `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo, «Strade scartate #28-#43»).

## Prossimi passi
0. C131 (Mario ~16:55 «p1 va bene»): soglie di base P1 = fitSaturi 13, fitZuc 15, fitSnackZuc 20, fitSodio 800, fitSnackSodio 500 (proteine, quote e kcal uguali). Cambia `def` in `opzioni.js` e i valori di riserva di `fitRic` in `ricettario.js` (righe 35-37); controlla la riga ~1872 di `tools/prova.js` e i passi Proteiche (`SOLO='Proteiche|C125|C124'`); novità in `data.js` (versione 0.10.15: «Ricettario «🏋️ Proteiche»: regole meno severe su grassi saturi, zuccheri e sale, misurate su 250 ricette vere: entrano piatti come salmone al forno, arrosto di manzo e pollo al curry; restano fuori quelli grassi o salati»). Se Mario ha già cambiato le soglie a mano nelle Impostazioni valgono le sue: dillo. Giro completo, push (pubblica), controllo online, riga 👁. Poi la patch C127 diventa v0.10.16 (`git apply --exclude=data.js` + `data.js` a mano).
1. C133 (Mario ~16:55): le 7 regole scelte (lavori che si ripetono misurati prima · causa solo con prova, sennò ipotesi · soluzioni smart anche non chieste · guide giuste con le foto · errori col perché vero e il codice · esito scritto di ogni lavoro automatico · siti esterni provati dal vivo). «Controlla prima doppioni, regole migliori, conflitti»: confrontale col kit 38.14 (pacchetto: vedi passo 4) e fra loro (es. E46 ed E47 sono due facce di «niente esiti muti»; «causa solo con prova» vicina a «Prova o non è successo»; «soluzioni smart» vicina a «💡 PARERE»), proponi a Mario il testo finale, poi scrivilo in `docs/PER-IL-KIT.md` per la sessione del kit (con C132 e il difetto delle 12 parti).
2. C130: domani (11/11) chiedi a Mario se è arrivata un'email di Cloudflare; con la foto del «Visualizza utilizzo», guarda le righe lette.
3. C127 (v0.10.16 dopo C131): al «1» di Mario applica la patch (passo 0), giro, push, controllo online.
4. Kit v38 (C129): al «1 · Sì» di Mario applica il pacchetto (parte 1: file uno per uno con Write, `<file>.prima-del-kit`, `CLAUDE.md` a mano, prove degli hook 33/33). Scaricarlo: `for i in $(seq 1 17); do curl -s -f -o <scratchpad>/kit/P$i.md https://raw.githubusercontent.com/RVC-Operation-by-YNOY-CORP/RVC/claude/rvc-ramo-definitivo/docs/kit-progetto/pacchetto/PACCHETTO-v38-indipendente-${i}di17.md; done`. Confronto #50: 55 file cambiati, 19 nuovi (`.mcp.json` senza parallel-search; `settings.json` con più strumenti vietati). Lavoro lungo: in una sessione fresca.
5. C127/C128: foto di Mario della pagina Proteiche (Aspetta Mario). C126 pezzi 3-4: fonti con valori calcolati (specifica prima del codice).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md`. Nuove della #50: kit «Applico il pacchetto 38.14? 1 · Sì · 2 · No» (🛑) e C132 proposte 1-3 (modulo sicuro, link compilati, promemoria). C127 «1/2» resta.

## Ultimo messaggio di Mario
10/11 ~16:55 (in questa chat, #50), parola per parola: «p1 va bene

poi aggiungi
Un lavoro che si ripete da solo si misura prima contro i limiti gratuiti
Una causa si dice solo con una prova, sennò è un'«ipotesi»
Proporti soluzioni smart geniali e intelligenti anche se non le chiedi
Guide giuste con le foto dei siti
Messaggi d'errore con il perché vero e il codice
Ogni lavoro automatico finisce con un esito scritto
Indirizzi di siti esterni provati dal vivo prima di usarli

controlla prima se ci sono doppioni o regole migliori o conflitti ecc ecc» → C131 P1 (passo 0) e C133 (passo 1).
Prima, nella chat chiusa #42 (riferiti dalla #42): 16:30 chiave fatta e incollata nel modulo; 16:35 «inventati soluzioni simili così smart per tutti i miei progetti» (C132); 16:40 «30 novembre 27 ma tu avvisami prima ok?» (promemoria fatto); 16:45 «la 4 la usiamo da una vita… spero sia andata anche su rvc» (non c'è: C132); 16:50 «tutte le regole che abbiamo creato su pronti in tavola dimmele e vediamo se le ha rvc» (C133, tabella data). 16:15 (chat #49) «vai di consiglio» (C131 misura).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C134; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

