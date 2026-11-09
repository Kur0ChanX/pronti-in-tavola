# Consegne della chat parallela «Aiuto» (bug) · Aiuto 8 → Aiuto 9

**Già deciso da Mario (non richiedere):** «vai avanti da solo»; niente artefatto, Mario prova sul sito vero. C99 deciso (09/11 ~09:45): specifica in `docs/SPECIFICA.md` «Codice fisso e nome dei profili» (due nomi con padrone diverso + storia «prima si chiamava»; codice fisso per tutti, ⭐MARIO e ⭐MONICA). Regola nuova del progetto (09/11): ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`).
**Da non rifare:** analisi di registrazione e lista di Monica (C97: codice coerente); ricerca iPhone: l'app dall'icona ha dati separati da Safari, copia solo i cookie alla creazione (iOS 17.2+, fonti openpwa.net 10/2026, webkit.org 17.2) → il cookie `pit_nome` già ricollega il nome; controllo regole C98 (3 buchi in `docs/DA-FARE.md` C98).
**Cosa preme a Mario adesso:** incollare le regole nuove in Firebase (guida già mandata), poi nome modificabile e codice fisso nell'app (C99).

Aiuto 8 = `session_01WTjqUxwKQtc7WQsefh8EJF` (catena 6 di 8), chiusa alla soglia 09/11 ~09:55. Impegno high (`.claude/settings.json` lasciato com'è: condiviso con la principale).

## Stato (controlla, non fidarti)
- v0.9.70 online: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.70. Niente foglio «Installa l'app» a chi non ha il nome (`serveInvito` + `controllaInvito`, `app.js`); prova nel passo «cliente senza nome». Giro completo 62 OK.
- `firestore.rules` nel repo PIÙ NUOVO di quello online (avviso in `docs/SPEC-FIREBASE.md`): cuori legati all'ordine (C98), `codiceCliente`/`codiceFermo` (codice scritto una volta sola, anche per i gestori), cliente che corregge il nome (`utenti` prima del sì, `clienti.nomeCliente` dopo), `nomiPrima` ≤30. Emulatore: `npx firebase emulators:exec --only firestore --project demo-pronti "node tools/prova-regole.js"` → 64 OK, 0 NO (serve `npm ci`, fatto in questo contenitore). Compatibili con l'app di oggi: Mario può incollarle quando vuole.
- Guida mandata a Mario: da PC raw GitHub `firestore.rules` → Ctrl+A Ctrl+C → https://console.firebase.google.com/project/pronti-in-tavola/firestore/rules → Ctrl+A Ctrl+V → **Pubblica** → foto e «fatto». Riga in «Aspetta Mario».

## Prossimi passi
1. Avvio: titolo «📗 🍝 Aiuto 9 ❔ · codice e nome».
2. C99 app (non serve aspettare l'incolla: senza regole nuove le scritture del cliente falliscono → «non ancora disponibile», senza errori):
   - `dati.js` `registra`: `utenti.codice` casuale (5 caratteri `A-HJ-NP-Z2-9`, almeno una cifra); se la creazione è rifiutata (regole vecchie) riprova senza codice. `decidi`: `clienti.codice` = codice del telefono (cliente nuovo); ricollega → resta quello del cliente.
   - Chi gestisce assegna una volta sola il codice a clienti/utenti/gestori che non ce l'hanno (gestori: nome Mario → `MARIO`, Monica → `MONICA`, altri `G`+4). ATTENZIONE: ogni scrittura di chi gestisce su utenti/clienti/gestori deve conservare `codice` (sennò `codiceFermo` la ferma): controllare `salva()` in `dati.js` (~riga 293-320, set di documenti interi).
   - Nome: cliente «Correggi il nome» (prima del sì su `utenti`, dopo su `clienti.nomeCliente`, storia in `nomiPrima` {nome, chi, il}); Monica matita sul «nome per Monica» (`clienti.nome`) + riga «ora si chiama Y · prima X» con «Visto»; il cliente vede sempre il suo nome.
   - Codice visibile: Clienti (ogni riga; oggi `codiceTel(uid)` 4 lettere → sostituire), ordini, avvisi, diario avvisi, sotto il nome del cliente; ⭐ davanti a MARIO e MONICA.
   - Voci nell'aiutante (`aiutante.js` `VOCI`, `worker.js` azione «vai» e GUIDA), prove in `tools/prova.js`, novità in `data.js`.
3. Quando Mario scrive «fatto» con la foto delle regole: togliere la riga in «Aspetta Mario», togliere l'avviso in `docs/SPEC-FIREBASE.md`, chiudere C98 punto 1.
4. C97: quando Mario risponde su Francesco (compare in Clienti?) chiudere la causa in `docs/ERRORI.md`.
5. Aperte da proporre di nuovo solo se Mario chiede: C98 punti 2-3 (tetto pronti/teglie, tetto a parte per «Ricorda a Monica»), invito doppio dopo il primo ordine (`primiPassi`).

6. (Messaggio dopo l'handoff, 09/11 ~10:00) Mario chiede se Firebase può passare dalla sua Gmail alla mail di Pronti in Tavola. Risposta data da Aiuto 8: pochi passi, Impostazioni → Utenti e autorizzazioni → Aggiungi membro → mail nuova come Proprietario, accetta l'invito, la vecchia resta finché la nuova funziona. Se Mario la fa: guidarlo (pulsanti da controllare sulle sue foto) e scriverla in `docs/GUIDE-GIUSTE.md`.

## Note
- Il sito si pubblica da solo a ogni push del ramo (`.github/workflows/sito.yml`): codice C99 dell'app solo a versione finita e provata.
- Prima di ogni versione `git fetch` e guardare `VERSIONE_APP` su origin; conflitti solo in `data.js` (novità) e in fondo a `style.css`.
- Prove autonome: stato con `page.evaluate` in testa; `Object.defineProperty(Dati, 'attivo', …)` e `Dati.io.uid` finto.

Controllo Da fare: 1 voce aggiunta (C99); regola nuova scritta (aiutante). Messaggi di Mario della sessione: «se sbaglia il nome non ha modo di editarlo… codice fisso del profilo»; «il cliente può correggere il suo nome… Monica vede la differenza… anch'io e Monica un codice riconoscibile»; «ogni funzione nuova… implementata anche nel comando vocale di Monica».

## Ultimo messaggio di Mario (parola per parola)
«salva che ogni funzione nuova che andremo ad aggiungere, Monica o io di conseguenza può cercarla e modificare ovviamente funzioni base, cioè senza fare danno al codice, nel comando vocale della pagina iniziale. Adesso non mi ricordo come si chiama, chiedi a Monica, insomma mettila come regola del progetto, che ogni cosa che andremo ad aggiungere va implementata anche in chiedi a Monica. Non chiedi a Monica, scusami, no, non chiedi a Monica, è quella del cliente. Il comando vocale di Monica nella schermata principale, non ricordo come si chiama.»
