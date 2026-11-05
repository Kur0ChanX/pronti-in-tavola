---
name: domande
description: Come scrivo le domande a Mario (blocco «❓ DOMANDE», «📌 Di cosa parliamo», scelte numerate col consiglio, foto prova, conferme, risposte dubbie, domande rimaste senza risposta, passi a mano, righe di «## 0. Aspetta Mario», struttura di Da fare e nastro, «Chiudere prima di aprire»: «⚠️ Aspettano te», «📊 Quadro», lotti delle voci «👁»). Leggila prima di ogni domanda o passo a mano per Mario.
---

# Domande a Mario

Livello 2 del kit: in `REGOLE.md` («Domande a Mario») c'è la regola corta, cioè cosa chiedo e cosa decido io; qui c'è come scrivo la domanda. L'hook `domande-chiare.py` controlla contesto, scelte numerate, sigle e domande ripetute.

## Come la scrivo
- Domande TUTTE INSIEME in un messaggio, anche le importanti e quelle con foto (Mario 1/11 ~01:05: «una alla volta non trovo il senso»): numerate «DOMANDA 1», «DOMANDA 2»…, ognuna col suo «📌 Di cosa parliamo», e ogni foto con la didascalia «DOMANDA N · scelta N», mandate nell'ordine delle domande; Mario risponde coi numeri (es. «1:1 2:2»). SCRITTE nel blocco `❓ DOMANDE`, scelte numerate «1 · … · 2 · …» e il mio consiglio. Niente strumento delle domande a tocco (salta o sparisce). Mario risponde col numero o a parole.
- Ogni domanda parte da `📌 Di cosa parliamo:` (cos'è, dove si vede nell'app, perché adesso), anche se ripetuta. Ogni scelta dice cosa cambia per chi usa l'app. Mai sigle di lavori o sessioni: a parole.
- Una foto prova per ogni scelta che si vede (anche finta), numerata come la scelta, nello stesso messaggio; senza foto solo le scelte che non si vedono (regole di lavoro, soldi). Come si fanno le foto: skill `foto`, se il progetto ce l'ha.
- Scritta come a chi la legge per la prima volta, di facile apprendimento (Mario 31/10 19:0x): cos'è la cosa in una riga, dove la tocca nell'app, cosa succede con ogni scelta (il giorno dopo, per le colleghe), il consiglio col perché. Mai dare per saputo il contesto di ieri.

## Passi a mano (spostato da `REGOLE.md`, kit 30.5)
- Cose da fare a mano: link diretto e intero (mai nei riquadri di codice), perché e cosa inserire; un'azione per passo, numerati; pulsanti in **grassetto** coi nomi esatti (mai inventati); testo da copiare in un riquadro; alla fine chiedo a che passo è. Prima di mandarli apro la pagina del link (WebFetch o ricerca) e controllo che pulsanti, voci e ordine ci siano davvero; pagina chiusa dietro un accesso: lo dico e uso la guida ufficiale con la sua data. GitHub dal telefono (Chrome desktop): dove scorrere, cosa toccare, cosa deve comparire, cosa no.

## Conferme e risposte
- Conferma solo per cose rischiose o irreversibili (dati veri, soldi, cancellazioni): «Confermi? 1 · Sì · 2 · No».
- Risposta dubbia: rispondo al dubbio e rifaccio la domanda in 2 righe. Una risposta che non cita la domanda e può valere per un'altra non è un «sì»: la rifaccio in 2 righe.
- Domanda senza risposta e Mario scrive d'altro: la ripeto in 2 righe in fondo (non durante i passi a mano); intanto solo ciò che non dipende dalla risposta. Mai la stessa domanda due volte senza che Mario scriva: resta nella sua riga di «Aspetta Mario». Dopo un riavvio la rifaccio.
- Domanda ripetuta che aveva foto o video: si RIMANDANO ogni volta (anche nei promemoria della propria catena, E247), nello stesso messaggio, con la didascalia «DOMANDA N · scelta N»; mai «le foto di ieri» (Mario 31/10 19:0x «rimandami le foto»). Nessuna domanda si perde mai: resta nella sua riga di «Aspetta Mario», col percorso delle sue foto, finché Mario non risponde (C347).

## Domande decisive 🛑 e normali ⏭ (C422, Mario 02/11)
- **🛑 decisiva** se la risposta cambia cosa vede o fa chi usa l'app, tocca dati veri, soldi, cancellazioni, cose difficili da disfare, o deciderebbe tanto codice da rifare se sbaglio. Nel blocco `❓ DOMANDE`: «1. 🛑 …». Mi fermo su quel lavoro: niente codice che dipende dalla risposta, nessuna sveglia che ci lavora sopra, titolo giallo se non ho altro; intanto solo lavori indipendenti.
- **⏭ normale** (gusti piccoli, scelte tecniche, cose che si cambiano in un minuto): non mi fermo. Scrivo «⏭ vado col 1 (consiglio) finché non dici altro» e lavoro col consiglio; la riga in «Aspetta Mario» resta finché Mario risponde, e se sceglie altro cambio.
- Ogni domanda, 🛑 o ⏭, ha la sua riga in «Aspetta Mario» finché Mario risponde: nessuna si perde; il titolo lo mostra con « ❔» o « ❓» (skill `consegne` fase 6).
- Dubbio fra le due: 🛑 (meglio aspettare che rifare).
- Riga in «Aspetta Mario» di una 🛑: `- gg/mm · 🛑 · <segno> <Nome> <numero> · …`. L'hook `titolo-giallo.py` ferma il turno se il messaggio ha una 🛑 e la riga di oggi non ce l'ha; `avvio-check.py` le ricorda per prime a ogni sessione nuova (zero token in chat: il promemoria lo scrive l'hook).

## «## 0. Aspetta Mario» (C369, Mario 31/10 ~23:10)
- Ogni cosa che aspetta Mario (domanda, foto da approvare, passo a mano, conferma) diventa SUBITO una riga nella sezione «## 0. Aspetta Mario», in cima a `docs/DA-FARE.md`, prima del messaggio finale: `- gg/mm · <segno> <Nome> <numero> · <cosa deve fare Mario, una riga>` (segno giallo e nome della catena, kit 30.7, anche se è chiusa: es. «- 01/11 · 🟡 Principale 466 · …», «- 01/11 · 🟨 Dov'è 8 · …»; foto: il percorso in `archivio/`). Commit e push subito.
- Si toglie solo quando Mario risponde, in qualunque chat: chi legge la risposta toglie la riga (anche di un'altra chat) e gira la risposta a quella chat (`send_message`). All'handoff le righe restano: nelle consegne solo il rimando, mai una copia.
- Domanda rifatta: data di oggi nella sua riga. Il turno che finisce con ❓ o 👉 senza una riga di oggi lo ferma l'hook `titolo-giallo.py`; all'avvio le righe le elenca `avvio-check.py` (titolo verde: il giallo solo quando mi fermo ad aspettare Mario, E245; ogni titolo giallo vuole la sua riga di oggi).

## Struttura di `docs/DA-FARE.md` (spostato da `REGOLE.md`, kit 32.4)
- Dopo «## 0. Aspetta Mario», 3 parti (Claude da solo · dopo ok di Mario · Mario a mano), numeri fissi, tabella per urgenza (🔴 in cima), aggiornato nello stesso commit del lavoro; a Mario in ordine, mai in blocco.
- Sopra la sezione 0 il «## Nastro delle versioni»: chi lo aggiorna, quando, notifica → skill `pr`.

## Chiudere prima di aprire (C417, Mario 02/11 15:52)
- Lavori aperti = righe della tabella «## Lavori» di `docs/DA-FARE.md`. Oltre 30: niente lavori nuovi, solo chiudere quelli aperti; le urgenze dell'hotel (E210) passano sempre. Una richiesta nuova di Mario non si perde: voce subito, con le sue parole, e la dico «in coda» in una riga.
- Al massimo 3 chat insieme (catene in `docs/CHI-FA-COSA.md`); una chat avviata su un lavoro importante non si chiude per stare nel numero: si finisce.
- In fondo a ogni messaggio a Mario, dopo i blocchi fissi: `⚠️ Aspettano te: N · <nomi corti>` (una riga, dalle righe di «## 0. Aspetta Mario»; niente = la riga si salta). È un promemoria, non la domanda: la domanda intera solo quando Mario scrive (E179).
- Ogni mattina il «📊 Quadro» (la 📥 Bacheca del mattino, un posto solo, E263): tabella con lavori aperti, voci «👁 Lo vedi», 🔴, chiusi ieri, e la differenza dal giorno prima.
- Voci «👁 Lo vedi» a Mario a lotti di 10 o più al giorno (prima le più vecchie e le 🔴), ognuna con foto o prova e scelte «1 va · 2 non va (cosa) · 3 non serve più»: 1 e 3 chiudono la voce (in `docs/DA-FARE-FATTE.md`), 2 la riapre col suo difetto. Foto e prove le prepara un aiutante (`fotografo`); a Mario un messaggio solo per lotto.
- Domande arretrate da ricordare (righe di «## 0. Aspetta Mario»): UNA per messaggio, in ordine, con le sue foto (E265, Mario 02/11 16:06 «uno alla volta»); le domande nuove di uno stesso lavoro restano tutte insieme (E243).
