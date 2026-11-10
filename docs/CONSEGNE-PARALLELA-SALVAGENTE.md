# Consegne della chat parallela «Salvagente» (PC di casa come riserva di Cloudflare e Firebase, C138) · Salvagente 1 → Salvagente 2

**Già deciso da Mario (non richiedere):** niente piani a pagamento (Cloudflare, Firebase) e niente blocchi alle persone, solo avvisi a lui (`docs/lavori-in-corso/gia-deciso-da-mario.md`, PT E54); servizi su account solo dell'app (PT E5); mai nominare altri progetti; Mario prova sul sito vero, niente artefatto. Su C138 NON ha ancora scelto niente.
**Da non rifare:** la ricerca del 10/11/2026 (tabella con fonti e date in `docs/lavori-in-corso/c138-salvagente-in-casa.md`); la risposta lunga a Mario con le 3 strade e la DOMANDA 1 (mandata 10/11 ~18:45; testo della domanda nello stesso file); C130, C135, C136, C137 sono della Principale (contatore, corsia d'emergenza, motore a mano, modalità risparmio): non toccarli.
**Cosa preme a Mario adesso:** sapere se e come i suoi PC di casa (Windows, sempre accesi, UPS, fibra 2,5 Gbit) possono fare da salvagente quando finiscono i limiti gratis; soluzioni «super moderne, smart», sicure, a 0 € («io non ho soldi», 10/11 17:02). Deve scegliere la strada.

Salvagente 1 = `session_01WTjqUtRJWxKmp6nyeUvNrE` (aperta da Mario a mano 10/11 18:30 con una domanda; ruolo «parallela» messo a mano con `scorta.py ruolo parallela`; catena nuova, cuori 💚 💛 ❤️ 🖤 in `docs/CHI-FA-COSA.md`). Solo documenti: nessun file di codice toccato. Chiusa per la regola dell'attesa lunga (contesto oltre 180k mentre aspetta Mario).

## Stato (Salvagente 1 `session_01WTjqUtRJWxKmp6nyeUvNrE`, 10/11 18:48 ora italiana, chiusa alla soglia; la apre la Salvagente 1 con `create_session` (catena 1 di 8))
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-parallela-20261110-01WTjqUtRJWx/claude/pronti-ramo-definitivo.
- Fatto: ricerca, risposta a Mario con 3 strade e DOMANDA 1 🛑 (10/11 ~18:45), C138 in Da fare; nessun codice. Provato: niente da provare (solo documenti). Si verifica: `git log --oneline -4 -- docs/lavori-in-corso/c138-salvagente-in-casa.md docs/CONSEGNE-PARALLELA-SALVAGENTE.md`.
- Scorte: `scorta-principale-20261110-01WTjqUtRJWx/…` è di QUESTA chat (primi minuti col ruolo sbagliato): dentro c'è solo il primo messaggio di Mario, già nel registro della parallela. NON unirla (E97); la toglie la pulizia delle scorte. La `scorta-parallela-…-01WTjqUtRJWx` l'ha unita la Salvagente 1.

## Stato (controlla, non fidarti)
- C138 in `docs/DA-FARE.md`: voce nella tabella + riga 🛑 in «## 0. Aspetta Mario». Verifica: `grep -n "C138\|Salvagente" docs/DA-FARE.md`.
- Ricerca, strade, occhio critico e domanda fatta: `docs/lavori-in-corso/c138-salvagente-in-casa.md` (leggilo intero: è il lavoro, ~10 KB).
- Mario NON ha ancora risposto alla DOMANDA 1. Verifica: la riga 🛑 è ancora in «Aspetta Mario»; `ReadNotifications`; `docs/MESSAGGI-MARIO-PARALLELA.md`.

## Prossimi passi
1. Titolo verde e primo messaggio corto: la DOMANDA 1 è 🛑, quindi niente codice e niente piano finché Mario sceglie. In fondo solo «⚠️ Aspettano te» (la domanda intera solo quando Mario scrive: è già nella chat della Salvagente 1 e nella riga).
2. Quando Mario risponde (qui, o nella Salvagente 1 che la gira): togli la riga da «Aspetta Mario», scrivi la scelta in `c138-salvagente-in-casa.md`, poi:
   - scelta 1 (officina) → specifica nello stesso file dei 4 lavori (motore del ricettario in casa, sentinella, copia viva di Firestore, prove) e piano a pezzi per Opus (skill `fable-opus`); per ogni pezzo la misura dei consumi PRIMA (PT E52) e il controllo dei doppioni con C130 e C135 (`docs/CHI-FA-COSA.md`: cosa ha già fatto la Principale);
   - scelta 2 → come la 1, più il gemello silenzioso (avvisi dal PC guardando Firestore, casella postale per l'aiutante); prima guarda cosa copre già C135;
   - scelta 3 → anche il server gemello pubblico: prima le domande su dominio (circa 11 € l'anno) e su quale PC; il rischio sui termini di Tailscale è già stato detto una volta;
   - scelta 4 → C138 in `docs/DA-FARE-FATTE.md` con la sua risposta, catena chiusa.
3. Domande utili DOPO la scelta (non fatte, per non caricarlo): quale PC (solo per questo o quello di tutti i giorni); il motore di GitHub di casa gira su Windows o dentro WSL2; ha già un dominio suo.
4. Idee dette a Mario che diventano voci di Da fare solo se le sceglie: ricettario in file statici; ordine su WhatsApp se il server non conferma (oggi `wa.me` è in un punto solo di `app.js`: controllare cosa c'è già); AI in casa per l'aiutante.

## Sessione appena chiusa (Salvagente 1)
- Letti codice e documenti (cosa usa l'app di Cloudflare e Firebase), ricerca con Parallel Search (8 ricerche e 1 lettura, fonti ufficiali datate), risposta a Mario: 3 strade più una scartata, consiglio 1, DOMANDA 1 🛑 con 4 scelte.
- «Plan mode» chiesto da Mario: applicato come il suo comando «piano» (niente codice); la modalità piano dello strumento non accesa perché lì non si scrivono file (detto a Mario).
- Conflitto di merge con la Principale 54 su `docs/DA-FARE.md` e `docs/CHI-FA-COSA.md` (righe aggiunte nello stesso punto): risolto tenendo le righe di tutte e due (detto a Mario).
- `docs/DA-FARE.md` oltre il tetto di 40 KB (41,3): le voci finite sono della Principale, non toccate (detto a Mario).
- Nessuna PR aperta da questa chat: le PR le tiene la Principale.
- Controllo Da fare: 0 voci aggiunte adesso (C138 scritta alle 18:43, è l'unica richiesta della sessione).

## Strade provate e scartate
- Modalità piano dello strumento (`EnterPlanMode`): non permette di scrivere i documenti che il kit vuole subito.
- Immagine con gli schemi delle strade: regime leggero (foto solo se cambia l'aspetto); usati schemi a righe con le emoji.
- Piano a pagamento di Cloudflare o secondo account gratis per raddoppiare i limiti: no (PT E54; aggirare i limiti mette a rischio l'account).
- Script e `git commit` nello stesso comando con un merge a metà: la guardia lo ferma (E286). Prima lo script, poi il controllo dei segni, poi il commit.

## Riferimenti
- Lavoro: `docs/lavori-in-corso/c138-salvagente-in-casa.md`. Skill: `domande`, `fable-opus`, `ricerca-aggiornata`, `chat-parallela`.
- Architettura letta: `wrangler.jsonc`, `worker.js` (`/api/*`, classi `Avvisi` e `Ricettario`), `dati.js` (Firestore), `gz.mjs`, `rf.mjs`, `.github/workflows/sito.yml`.

## Motore e forza di pensiero
Motore: **claude-fable-5-2** (Fable 5.2) · impegno **Massimo** (`max`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Testo per aprire la Salvagente 2
la apre la Salvagente 1 con `create_session` (catena 1 di 8). Scritto da Salvagente 1 il 10/11/2026 (righe di fatto da `tools/consegne.py fatti --parallela`).

Titolo: `💛 🍝 Salvagente 2 · metti Fable`

Testo da incollare:
```
[AVVIO] ⛔ FABLE (C472): la sessione di prima lavorava con Fable. Se il tuo motore non è Fable non fare niente, nemmeno l'avvio: scrivi a Mario solo «⛔ La sessione di prima lavorava con Fable: metti Fable (menu del motore nell'app o /model), poi scrivimi "via". Per andare con Opus scrivimi "vai con Opus".» Se sei Fable, avvio normale: Sei la chat parallela Salvagente 2 di Pronti in Tavola, linea «Salvagente» (ramo claude/pronti-ramo-definitivo). git fetch origin claude/pronti-ramo-definitivo && git merge --ff-only origin/claude/pronti-ramo-definitivo (se «HEAD detached» prima git checkout claude/pronti-ramo-definitivo). Leggi CLAUDE.md, docs/ERRORI.md e le tue consegne docs/CONSEGNE-PARALLELA-SALVAGENTE.md (leggi i file solo a blocchi con grep -n e sed -n, mai interi); continua da sola dai «Prossimi passi».
```

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-10 18:30 · avvia plane mode pensiero profondo brain storming Volevo farti una domanda, sicc… → C138: voce in Da fare e riga 🛑 in «Aspetta Mario»; ricerca e 3 strade in `docs/lavori-in-corso/c138-salvagente-in-casa.md` (commit a3826375); risposta con le 3 strade e DOMANDA 1 mandata 10/11 ~18:45, aspetta la sua scelta

Ultimo, intero:
> avvia plane mode pensiero profondo brain storming
> 
> 
> Volevo farti una domanda, siccome sto creando, cioè non è che sto creando, sto mettendo il motore di GitHub sul computer per fare le verifiche delle applicazioni senza che mi consumano minuti, cioè quindi lo sto facendo solo in locale, volevo chiederti se è possibile di se posso creare una sorta di, nel mio computer fisso sempre acceso, una sorta di Claude Flare per quando finisco i limiti. Volevo chiederti per quello, per Claude Flare e poi per Firebase. Volevo capire se è possibile creare dei server nel mio PC sicuri, non hackerabili o difficilmente hackerabili, che posso utilizzare sulle mie applicazioni in caso, come salvagente, in caso ho un problema, rimangono attive sul progetto. Magari, cosa ne so, si possono copiare quello che c'è su Cloudflare e quello che c'è su Firebase, si portano sui miei programmi e si attivano solo quando oltrepasso i limiti come salvagente di emergenza. Volevo sapere se si poteva fare delle cose del genere sui miei computer, girano su Windows. I miei computer sono abbastanza performanti, se non sono performanti. Volevo chiederti se potevo creare dei server del genere, magari li attacco sotto un UPS in caso manca la corrente e niente, internet o la fibra, quindi 2.5 gigabit. Quindi volevo chiederti questo consiglio qua, se puoi cercare approfonditamente delle soluzioni super moderne, smart e intelligenti.

