# Consegne della chat parallela «Salvagente» (PC di casa come riserva di Cloudflare e Firebase, C138) · Salvagente 3 → Salvagente 4

**Già deciso da Mario (non richiedere):** niente piani a pagamento (Cloudflare, Firebase) e niente blocchi alle persone, solo avvisi a lui (`docs/lavori-in-corso/gia-deciso-da-mario.md`, PT E54); servizi su account solo dell'app (PT E5); mai nominare altri progetti; Mario prova sul sito vero, niente artefatto; il suo PC «solo come alternativa o supporto», mai al posto dei server veri (10/11 18:51). Su C138 NON ha ancora scelto: propende per la 2.
**Da non rifare:** la ricerca e la risposta con le 3 strade (Salvagente 1); il confronto fra la scelta 1 e la 2 con 2 schemi, tabella e consiglio (Salvagente 2, mandato 10/11 ~19:05: ultima sezione di `docs/lavori-in-corso/c138-salvagente-in-casa.md`); aprire le foto degli schemi con `Read` (PT E58: il contatore le pesa ~70k token l'una, per questo la 2 ha chiuso subito); C130, C135, C136, C137 sono della Principale: non toccarli. All'avvio NON servono (PT E61): `list_triggers` (nessuna sveglia della catena, controllato 10/11 19:15), la pulizia delle scorte (da qui è rifiutata: la fa il giro notturno), riletture di skill e codice degli hook, indagini.
**Cosa preme a Mario adesso:** capire la differenza fra la 1 e la 2 e scegliere; ha paura che salti la luce («la stabilità che ti dà un server non te la dà nessuno»); tutto a 0 € («io non ho soldi», 10/11 17:02).

Catena: Salvagente 1 `session_01WTjqUtRJWxKmp6nyeUvNrE` (aperta da Mario a mano 10/11 18:30, chiusa 18:52) → Salvagente 2 `session_01WTjqUtvmZCDENLTWcamJxv` (18:50-19:20, chiusa per l'attesa lunga: 258k per 2 foto aperte, PT E58) → Salvagente 3 `session_01WTjqUv7MaJNtEXzKJFZKx7` (19:13-19:30 circa, chiusa per l'attesa lunga: 183k col solo avvio, PT E61). Solo documenti e 2 foto: nessun file di codice toccato.

## Stato (Salvagente 3 `session_01WTjqUv7MaJNtEXzKJFZKx7`, 10/11 19:23 ora italiana, chiusa alla soglia; la apre la Salvagente 3 con `create_session` (catena 3 di 8))
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-parallela-20261110-01WTjqUv7MaJ/claude/pronti-ramo-definitivo.
- Fatto: avvio (Fable · Massimo come la 2, controllato con `get_session` mio e della 2); primo messaggio corto a Mario ~19:21 («🧠», la 🛑 in una riga col consiglio «2 in due tempi», «⚠️ Aspettano te: 12»); titolo giallo; due voci in `docs/PER-IL-KIT.md` (conto dei messaggi dal file di un'altra catena; giro a vuoto dell'attesa lunga) e lezione PT E61. Si verifica: `git log --oneline -6 -- docs/PER-IL-KIT.md docs/ERRORI.md docs/CONSEGNE-PARALLELA-SALVAGENTE.md`.
- Scorte: nel ramo quelle della 1, della 2 e la mia (`…-01WTjqUv7MaJ`). La `scorta-principale-20261110-01WTjqUtRJWx` NON si unisce (E97: dentro solo il primo messaggio di Mario, già nel registro della parallela). Pulizia (`pulisci-scorte.py --unite --cancella`) lanciata alle 19:17: «Cancellate 0 di 17, rifiutata da qui» (permesso del contenitore): la fa il giro notturno delle 05:17, non rilanciarla.
- Sveglie: nessuna della catena (`list_triggers` alle 19:15: le 3 legate a una sessione sono di altre chat). Non ne servono finché Mario non sceglie.

## Stato (controlla, non fidarti)
- C138 in `docs/DA-FARE.md`: voce nella tabella + riga 🛑 in «## 0. Aspetta Mario» (col nome della catena e il numero nuovo), coi percorsi delle 2 foto. Verifica: `grep -n -o '^.\{0,30\}Salvagente.\{0,220\}' docs/DA-FARE.md`.
- Mario NON ha ancora scelto (alle 19:30). Verifica: la riga 🛑 c'è ancora; `ReadNotifications`; `grep -n '^## 2026' docs/MESSAGGI-MARIO-PARALLELA.md | tail -2` (l'ultimo deve essere «18:51 · 01WTjqUtRJWx»). Può rispondere nella 4, nella 3, nella 2 o nella 1: le chiuse girano il messaggio con `send_message` (skill `consegne`, fase 8).
- Corsia d'emergenza (C135) e contatore vero (C130): della Principale, che aspetta due passi a mano di Mario (righe sue in «Aspetta Mario»). Non toccarli.

## Prossimi passi
1. **Avvio leggero** (PT E61: il contesto parte già da ~85k e sopra 180k, al primo stop, l'hook chiede di nuovo le consegne). Solo questi passi, con pensieri corti: `get_session` tuo e della 3 (motore e impegno, C474); `ReadNotifications`; le verifiche di «Stato (controlla, non fidarti)»; `sed -n '6,72p' docs/ERRORI.md` (ora è corto); titolo verde. Poi primo messaggio CORTO: la riga «🧠 Continuo con Fable · Massimo…», la 🛑 in UNA riga (niente domanda intera e niente foto: Mario le ha avute alle 19:05 e un promemoria alle 19:21; mai la stessa domanda due volte), in fondo «⚠️ Aspettano te» riletto da `docs/DA-FARE.md` dopo il fetch (PT E32). Poi titolo giallo «scegli la strada». Niente codice e niente piano finché Mario sceglie. Se l'attesa lunga scatta lo stesso: fai come dice l'hook (regola 🔒), ma dillo a Mario in una riga (sarebbe il terzo giro a vuoto) con le proposte di `docs/PER-IL-KIT.md` «Attesa lunga».
2. Quando Mario risponde (nella 3, o nella 2 o nella 1 che la girano): togli la riga da «Aspetta Mario», scrivi la scelta in `docs/lavori-in-corso/c138-salvagente-in-casa.md`, poi:
   - scelta 2 (probabile; consigliata «in due tempi») → specifica nello stesso file: tempo 1 = l'officina (motore del ricettario in casa, sentinella, copia viva di Firestore, prove); tempo 2 = il gemello (avvisi dal PC guardando Firestore, segno «avvisato» sull'ordine e stesso `tag` della notifica; casella postale dell'aiutante). Prima del tempo 2 mostrare a Mario i numeri della sentinella e cosa copre già C135: gli ho scritto che lì può ancora fermarsi alla 1. Piano a pezzi per Opus (skill `fable-opus`); per ogni pezzo la misura dei consumi PRIMA (PT E52) e il controllo dei doppioni con C130 e C135 (`docs/CHI-FA-COSA.md`);
   - scelta 1 → solo il tempo 1;
   - scelta 3 → anche il server gemello pubblico: prima le domande su dominio (circa 11 € l'anno) e su quale PC; il rischio sui termini di Tailscale è già stato detto una volta;
   - scelta 4 → C138 in `docs/DA-FARE-FATTE.md` con la sua risposta, catena chiusa.
3. Se chiede altri schemi o ritocchi (o dice che dal telefono non si leggono): sorgente `docs/lavori-in-corso/c138-schemi.html` (come rifarli: commento in testa; una foto per scelta, 390 px a 2x, caratteri da 13 px in su), controllo di misure e titoli dalla pagina, mai la foto aperta a piena misura (PT E58). Se la DOMANDA 1 va ricordata: si rimandano le 2 foto con lo strumento dei file (didascalia «DOMANDA 1 · scelta 1» e «scelta 2», E247).
4. Domande utili DOPO la scelta (non fatte, per non caricarlo): quale PC (solo per questo o quello di tutti i giorni); il motore di GitHub di casa gira su Windows o dentro WSL2; ha già un dominio suo.
5. Idee dette a Mario che diventano voci di Da fare solo se le sceglie: ricettario in file statici; ordine su WhatsApp se il server non conferma (oggi `wa.me` è in un punto solo di `app.js`: controllare cosa c'è già); AI in casa per l'aiutante; sotto l'UPS anche router e scatola della fibra (detto alle 19:05).

## Sessione appena chiusa (Salvagente 3)
- Avvio alle 19:13: ramo allineato dall'hook, consegne ed errori letti; nessun messaggio nuovo di Mario (registro: ultimo 18:51).
- Alle 19:14, con `send_message` dalla 2: «Chi fa cosa» e riga 🛑 già col numero 3 (commit `654b007d`), controllato con git prima di unire.
- Errore mio PT E61: avvio pesante (letture larghe, un'indagine sul codice di due hook, pensieri lunghi) → 183k al primo stop → consegne dopo un solo messaggio corto. Misure in `docs/ERRORI-STORIA.md`; proposta di guardia in `docs/PER-IL-KIT.md` «Attesa lunga».
- I miei push sono di soli documenti: nessun giro partito. Nessuna PR da questa chat: le tiene la Principale.
- Controllo Da fare: 0 voci aggiunte (nessun messaggio nuovo di Mario in questa sessione).

## Strade provate e scartate
- Un solo schema con le due scelte affiancate: sul telefono il testo diventa troppo piccolo → una foto per scelta.
- Tabella «cosa succede se» in una terza foto: troppe colonne per 390 px → tabella nel testo della chat, 3 colonne.
- Schemi a righe con le emoji (Salvagente 1): Mario non aveva capito e ha chiesto «con degli schemi» → foto vere.
- Gemello su un secondo servizio gratis in un centro dati, al posto del PC: pensato e NON detto a Mario (non studiato: limiti gratis, chiavi, un servizio in più da curare). Se chiede «e se salta la luce mentre Cloudflare è fermo?» è la strada da studiare (skill `ricerca-aggiornata`); l'altra rete è l'ordine su WhatsApp.
- Piano a pagamento di Cloudflare o secondo account gratis per raddoppiare i limiti: no (PT E54).
- Unire la propria scorta con le consegne modificate e non salvate: git si ferma (la scorta ha la stessa copia) → prima il commit, poi il merge; mai script e commit nello stesso comando con un merge a metà (E286).
- Restare ad aspettare nella 3 a 183k senza fare le consegne: scartato (l'attesa lunga è regola 🔒 e lo chiede l'hook). Il costo delle due strade è simile (stima): per questo la guardia è una proposta per il kit, la sceglie Mario.

## Riferimenti
- Lavoro: `docs/lavori-in-corso/c138-salvagente-in-casa.md` (ultima sezione = risposta delle 19:05); schemi: `docs/lavori-in-corso/c138-schemi.html`; foto: `archivio/foto/2026-11-10-1900-c138-scelta-1-officina.png`, `archivio/foto/2026-11-10-1900-c138-scelta-2-gemello.png`. Skill: `domande`, `foto`, `fable-opus`, `ricerca-aggiornata`, `chat-parallela`.
- Architettura letta: `wrangler.jsonc`, `worker.js` (`/api/*`, classi `Avvisi` e `Ricettario`), `dati.js` (Firestore), `app.js` (`avvisaGestori`), `gz.mjs`, `rf.mjs`, `.github/workflows/sito.yml`.

## Ultimo messaggio vero di Mario (10/11 18:51, scritto nella chat Salvagente 1, parola per parola)
> Più che altro ho paura di che mi si stacca la luce, cioè la stabilità che ti dà un server non te la dà nessuno. Io il mio PC lo utilizzerei solo come alternativa o supporto. Confrontami un po' con degli schemi, la scelta 1 e la scelta 2, perché io ero intenzionato un po' la scelta 2, ma tu mi consigli la 1, quindi magari qualcosa non l'ho capito.

Esito: risposta delle ~19:05 col confronto (2 schemi, tabella, consiglio «2 in due tempi»); non è ancora la scelta: riga 🛑 in «Aspetta Mario». Il primo messaggio (10/11 18:30), intero: `docs/lavori-in-corso/c138-salvagente-in-casa.md` «Parole di Mario».

## Motore e forza di pensiero
Motore: **claude-fable-5-2** (Fable 5.2) · impegno **Massimo** (`max`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Testo per aprire la Salvagente 4
la apre la Salvagente 3 con `create_session` (catena 3 di 8). Scritto da Salvagente 3 il 10/11/2026 (righe di fatto da `tools/consegne.py fatti --parallela`).

Titolo: `💛 🍝 Salvagente 4 · metti Fable`

Testo da incollare:
```
[AVVIO] ⛔ FABLE (C472): la sessione di prima lavorava con Fable. Se il tuo motore non è Fable non fare niente, nemmeno l'avvio: scrivi a Mario solo «⛔ La sessione di prima lavorava con Fable: metti Fable (menu del motore nell'app o /model), poi scrivimi "via". Per andare con Opus scrivimi "vai con Opus".» Se sei Fable, avvio normale: Sei la chat parallela Salvagente 4 di Pronti in Tavola, linea «Salvagente» (ramo claude/pronti-ramo-definitivo). git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo (se «HEAD detached» prima git checkout claude/pronti-ramo-definitivo). Leggi CLAUDE.md, docs/ERRORI.md e le tue consegne docs/CONSEGNE-PARALLELA-SALVAGENTE.md (leggi i file solo a blocchi con grep -n e sed -n, mai interi); continua da sola dai «Prossimi passi».
```

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-10 19:13 · [AVVIO] ⛔ FABLE (C472): la sessione di prima lavorava con Fable. Se il tuo motor… → testo d'avvio scritto dalla Salvagente 2 (non è un messaggio di Mario): avvio fatto, motore Fable confermato con `get_session`

Ultimo, intero:
> [AVVIO] ⛔ FABLE (C472): la sessione di prima lavorava con Fable. Se il tuo motore non è Fable non fare niente, nemmeno l'avvio: scrivi a Mario solo «⛔ La sessione di prima lavorava con Fable: metti Fable (menu del motore nell'app o /model), poi scrivimi "via". Per andare con Opus scrivimi "vai con Opus".» Se sei Fable, avvio normale: Sei la chat parallela Salvagente 3 di Pronti in Tavola, linea «Salvagente» (ramo claude/pronti-ramo-definitivo). git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo (se «HEAD detached» prima git checkout claude/pronti-ramo-definitivo). Leggi CLAUDE.md, docs/ERRORI.md e le tue consegne docs/CONSEGNE-PARALLELA-SALVAGENTE.md (leggi i file solo a blocchi con grep -n e sed -n, mai interi); continua da sola dai «Prossimi passi».

