# Consegne della chat parallela «Aiuto» (bug) · Aiuto 9 → Aiuto 10

**Già deciso da Mario (non richiedere):** «vai avanti da solo»; niente artefatto, Mario prova sul sito vero. C99 fatto come da `docs/SPECIFICA.md` «Codice fisso e nome dei profili». Ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`). C101: Mario VUOLE togliere gli ordini fatti finora (tutti di prova): non richiedere se cancellarli, solo mostrare cosa sparisce prima di farlo.
**Da non rifare:** C99 (v0.9.71 online, provato); regole C98-C99 già pubblicate (foto `archivio/foto/2026-11-09-regole-c98-c99-pubblicate.jpg`); ricerca limiti Firebase (sono per progetto: Firestore 50.000 letture/giorno per progetto; legato all'account solo il numero di progetti creabili, 5-10 su Spark; fonti firebase.google.com/support/faq e docs/firestore/quotas, 11/2026); la prova Firebase con 2 NO (foto pesante; si ferma su «Accetta dopo un No») fallisce uguale anche SENZA C99 (provato con stash): difetto vecchio, non mio.
**Cosa preme a Mario adesso:** C101: storico pulito, conteggio dagli ordini veri.

Aiuto 9 = `session_01WTjqUvc6wykACULLz4o3Xx` (catena 7 di 8), chiusa alla soglia 09/11 ~10:20. Impegno: `.claude/settings.json` lasciato com'è (condiviso con la principale).

## Stato (controlla, non fidarti)
- v0.9.71 online: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.71. Giro completo `node tools/prova.js` 64 OK, 0 NO; regole emulatore 64 OK.
- C99 nel codice: `dati.js` (`nuovoCodice`, `registra` col codice e riprova senza, `decidi` passa codice e `nomiPrima` al cliente, `assegnaCodici` una volta per sessione dal listener dei gestori, `cambiaNome`, `mioNome`, `mioCodice`); `app.js` (`mostraCodice`, `codiceDi`, `rigaMioCliente`, `foglioMioNome`, `foglioNomeMonica`, `profiloCliente`, azioni `mio-nome*`, `nome-monica*`, `nome-visto`); `worker.js` (`chi` nel diario degli avvisi); `aiutante.js` voce `clienti-nome`; prove in `tools/prova.js` (cerca «C99»).
- Foto di Mario 10:17 (`archivio/foto/2026-11-09-clienti-codici-v0971.jpg`): codici visibili in Clienti → l'assegnazione automatica funziona coi dati veri.
- Questo contenitore aveva bisogno di `npm ci` per l'emulatore: nella sessione nuova rifallo prima di `prova-firebase`/`prova-regole`.

## Prossimi passi
1. Avvio: titolo «📗 🍝 Aiuto 10 ❔ · ordini di prova».
2. **C101** (`docs/DA-FARE.md`): togliere gli ordini già fatti (foto: Daniele Cabras 4, Barbara Miscera 2). Occhio critico: è un'azione sui dati veri che non si annulla → prima la «💾 Copia di sicurezza» (C58), poi dire a Mario in una riga cosa sparisce (n. ordini, chi) e farlo; togliere anche `settimane/*` (teglie contate) e rimettere `contatori/ordini.prossimo` a 1 solo se Mario vuole i numeri da 1 (domanda non decisiva: consiglio sì). Strada consigliata: tasto di chi gestisce in Impostazioni → «Togli tutti gli ordini di prova / vecchi» con doppia conferma e «Annulla» 10 s (riusabile; anche voce nell'aiutante, regola del progetto), così niente accessi alla console. Gli ordini «prova» (P.prova) già non contano: lasciarli fuori dai conteggi come oggi.
3. **C100**: funzioni vecchie di chi gestisce che mancano in `DOVE_AI` di `aiutante.js` (codice e «Ricorda a Monica» in Clienti, ultimi avvisi in Notifiche, «Accetta clienti nuovi», persone rifiutate…): voce + GUIDA in `worker.js` + prova; poi v0.9.72.
4. C97: quando Mario risponde su Francesco, chiudere la causa in `docs/ERRORI.md`.
5. Domanda Firebase (riga in «Aspetta Mario»): se Mario dice 1, guida da PC (Impostazioni ⚙ → Utenti e autorizzazioni; pulsanti da controllare sulle sue foto, poi in `docs/GUIDE-GIUSTE.md`): account nuovo proprietario, Mario Editor. Prima controllare che l'account nuovo entri come proprietario.
6. Aperte da proporre solo se Mario chiede: C98 proposte 1-2, invito doppio dopo il primo ordine.

## Note
- Il sito si pubblica da solo a ogni push del ramo: codice solo a versione finita e provata.
- Prima di ogni versione `git fetch` e guardare `VERSIONE_APP` su origin; conflitti solo in `data.js` (novità) e in fondo a `style.css`.
- Prove autonome: stato con `page.evaluate` in testa; `Object.defineProperty(Dati, 'attivo', …)`.

Controllo Da fare: 1 voce aggiunta (C101); C99 aggiornata con la foto. Messaggi di Mario della sessione: domanda limiti Firebase (risposta data, riga in Aspetta Mario); richiesta C101.

## Ultimo messaggio di Mario (parola per parola)
«Vedi, io ti avevo messo che gli ordini che avevamo fatto non venivano conteggiati perché erano tutti di prova, ma anche adesso nessuno, al momento nessuno ha fatto un vero e proprio ordine. Possiamo cancellare questi che vediamo qui, due ordini effettuati? Quindi se un cliente che clicca quando va a ordinare sto solo provando, quella funzione che avevamo messo non viene conteggiato negli ordini, ma adesso questi ordini qui li possiamo togliere, così lo storico rimane pulito. Cioè partiamo dal conteggio dei veri ordini.»
