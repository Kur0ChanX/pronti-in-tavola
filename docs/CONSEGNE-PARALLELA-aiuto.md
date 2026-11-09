# Consegne della chat parallela «Aiuto» (bug) · Aiuto 7 → Aiuto 8 (in corso: Aiuto 8 = `session_01WTjqUxwKQtc7WQsefh8EJF`)

**Già deciso da Mario (non richiedere):** «vai avanti da solo» (08/11): procedi coi tuoi consigli e pubblica senza aspettarlo; «cerca e vai avanti da solo» (08/11 19:39, su Francesco); niente artefatto, Mario prova sul sito vero; guida iPhone a figure e popup «Installa l'app» già fatti (C94, C95).
**Da non rifare:** ricerca su dove sta Condividi in Safari (fonti in testa a `guida-iphone.js`); analisi del codice di registrazione e lista di Monica (C97): `dati.js` `registra`/`decidi`/`capi` e `firestore.rules` utenti/nomi sono coerenti, nessun punto dove una richiesta salvata sparisce; «Accetta per il primo ordine» c'è già (chi non è confermato fa il primo ordine `daApprovare`, avviso `primo`).
**Cosa preme a Mario adesso:** Francesco Sanciu (amico con iPhone) vede «Monica deve attivarti» ma in Clienti non c'è nessuno (né Nuovi, né rifiutati, né clienti).

Aiuto 7 = `session_01WTjqUu72CCre8257ouny2k` (catena 5 di 8), chiusa alla soglia 09/11 ~09:00. Impegno della sessione: xhigh (`.claude/settings.json` lasciato «medium»: è condiviso con la principale).

## Fatto (tutto online; controlla: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.69 o più)
- v0.9.67: `worker.js` `stato(e)` dà `questo` (il server conosce questo telefono), `scriviDiario` (anche avvisi fermati per pausa/tetto); la richiesta di persona nuova non si ferma nella pausa di 15 s. `app.js` `diarioAvvisi`/`caricaDiarioAvvisi`/`voceDiario` in Impostazioni → Notifiche (solo gestore sul sito). Foto di Mario: `archivio/foto/2026-11-09-c97-ultimi-avvisi-mario.jpg` (✅ server conosce il telefono; avvisi 17:36, 17:46, 18:02, 18:50, 23:16 tutti ✅ 2 telefoni).
- v0.9.68: `righeAttesa` (nome, codice = 4 lettere dell'uid, «Ricorda a Monica», rimando da solo ogni 6 ore con `P.ricordatoIl`), codici nelle righe di Clienti, «Nessuno in attesa».
- v0.9.69: `senzaNome()`/`avvisoSenzaNome()` («Monica non sa ancora che ci sei» + «Scrivi il tuo nome», azione `benv-torna`) in cima al menù; `attivaAvvisiCliente` senza nome → torna al benvenuto.
- Prove in `tools/prova.js`: «ultimi avvisi», «Ricorda a Monica», «cliente senza nome». Giro completo 62 OK.

## Ipotesi su Francesco (non provata)
Ha toccato «Guarda il menù» (`benv-guarda`) e non ha mai scritto il nome: nessun documento `utenti`, quindi Monica non vede niente; il popup «Installa l'app» gli faceva attivare le notifiche e (versione vecchia) diceva «prima Monica deve approvarti». Mario dice che Francesco era l'avviso delle 18:50 («penso»): se fosse vero, il documento c'era e poi è sparito: non spiegabile dal codice. Mario ha chiesto a Francesco se l'app gli ha chiesto il nome: risposta non arrivata.

## Prossimi passi
- (Aiuto 8, 09/11 09:10) Fatti: passo 3 (v0.9.70 online), passo 4 (iPhone: dati separati, cookie del nome copiato da Safari: già gestito), C98 controllo regole (vedi C98 in Da fare). Restano: passi 2 e 5, C98 punti 1-3.
0. Messaggio di Mario dopo l'handoff (09/11 ~09:05): «Fai un bel check di tutte le regole se ci sono buchi». Interpretazione (da confermare con Mario in una riga, intanto parti): le regole del database `firestore.rules` (chi legge/scrive cosa: clienti, ordini, utenti, nomi, gestori) e le regole del flusso clienti (nome, approvazione, primo ordine, notifiche), cercando buchi come quello di Francesco. Prova con `npm run prova-firebase` / `tools/prova-regole.js`.
1. Avvio: titolo «📗 🍝 Aiuto 8 ❔ · Francesco nome» (riga in «Aspetta Mario»).
2. Quando Mario risponde: Francesco riapre l'app (0.9.69) e scrive il nome → compare in Clienti col codice? Se sì, chiudere la causa in `docs/ERRORI.md` (lezione: senza nome nessuna richiesta). Se no, chiedere foto della schermata di Francesco (codice) e di Clienti.
3. Idea da valutare: togliere il popup «Installa l'app» a chi non ha scritto il nome (`serveInvito`), così prima il nome poi l'app.
4. Ipotesi C96: su iPhone l'app dall'icona ha dati separati da Safari (anche il cookie `pit_nome`?): ricerca aggiornata 11/2026; se separati, chi installa deve riscrivere il nome (ok: «c'è già» → ricollega).
5. Proposta aperta: togliere l'invito piccolo dopo il primo ordine (`primiPassi`/`cartaHome`), doppio col popup.

## Note
- Prima di ogni versione `git fetch` e guardare `VERSIONE_APP` su origin; conflitti solo in `data.js` (novità) e in fondo a `style.css`.
- Prove autonome: stato con `page.evaluate` in testa; per `Dati.attivo` nelle prove `Object.defineProperty(Dati, 'attivo', …)` e `Dati.io.uid` finto.

Controllo Da fare: 0 voci aggiunte (C97 aggiornata; riga in «## 0. Aspetta Mario»). Messaggi di Mario della sessione: foto ultimi avvisi; «Francesco… era quello delle 18»; «perché non c'è il nome nei clienti?… ho chiesto a Francesco se l'app gli ha chiesto il nome»; «non c'è persone rifiutate… non c'è Francesco da nessuna parte, Francesco non mi ha risposto».

## Ultimo messaggio di Mario (parola per parola)
«Fai un bel check di tutte le regole se ci sono buchi»
