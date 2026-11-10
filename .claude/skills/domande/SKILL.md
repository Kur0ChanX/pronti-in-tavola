---
name: domande
description: Domande e passi a mano per Mario: scelte numerate col consiglio, foto, conferme, «Aspetta Mario», struttura di Da fare, «⚠️ Aspettano te», Quadro, lotti «👁». Leggila prima di ogni domanda o passo a mano per Mario.
---

# Domande a Mario

Livello 2 del kit: in `REGOLE.md` («Domande a Mario») c'è la regola corta, cioè cosa chiedo e cosa decido io; qui c'è come scrivo la domanda. L'hook `domande-chiare.py` controlla contesto, scelte numerate, sigle e domande ripetute.

## Come la scrivo
- **Prima di scrivere** un messaggio con ❓ o 👉 (E244, C469 M13; sennò gli hook fanno riscrivere e Mario legge due volte): riga di oggi in «## 0. Aspetta Mario» (🛑 se decisiva), promessa in Da fare, commit e push, titolo con « ❓N», notifica; poi scrivo, ogni domanda col suo «📌 Di cosa parliamo». Le domande senza risposta si ricordano, mai in loop.
- **Una regola sola** (C469 domanda 6): le domande NUOVE di un lavoro TUTTE INSIEME in un messaggio, anche le importanti e quelle con foto (Mario 1/11 ~01:05: «una alla volta non trovo il senso», E243); quelle ARRETRATE da ricordare (righe di «## 0. Aspetta Mario») UNA per messaggio, in ordine, con le sue foto (E265, Mario 02/11 16:06 «uno alla volta»).
- **Forma**: nel blocco `❓ DOMANDE`, numerate «DOMANDA 1», «DOMANDA 2»…, ognuna col suo «📌 Di cosa parliamo», scelte numerate «1 · … · 2 · …» e il mio consiglio; ogni foto con la didascalia «DOMANDA N · scelta N», nell'ordine delle domande. Niente strumento delle domande a tocco (salta o sparisce). Mario risponde coi numeri (es. «1:1 2:2») o a parole.
- Ogni domanda parte da `📌 Di cosa parliamo:` (cos'è, dove si vede nell'app, perché adesso, a cosa serve la risposta), anche se ripetuta. Ogni scelta dice cosa cambia per chi usa l'app. Mai sigle di lavori o sessioni: a parole.
- Una foto prova per ogni scelta che si vede (anche finta), numerata come la scelta, nello stesso messaggio; senza foto solo le scelte che non si vedono (regole di lavoro, soldi). Come si fanno le foto: skill `foto`, se il progetto ce l'ha.
- Scritta come a chi la legge per la prima volta, di facile apprendimento (Mario 31/10 19:0x): cos'è la cosa in una riga, dove la tocca nell'app, cosa succede con ogni scelta (il giorno dopo, per le colleghe), il consiglio col perché. Mai dare per saputo il contesto di ieri.

- **Turni brevi** (spostato da `REGOLE.md`, kit 37.2): il turno si chiude con una riga di stato e un comando in sottofondo che mi risveglia, poi riparto.
- **Una volta sola** (spostato da `REGOLE.md` «Risposta nell'ultimo messaggio», kit 37.2): le righe di stato contano come dette, `✅ FATTO` porta solo il nuovo; si ripete solo «⚠️ Aspettano te». Hook che ripete: 3-5 parole.

## Passi a mano (spostato da `REGOLE.md`, kit 30.5)
- Ogni cosa che chiedo a Mario di fare (passi, prove, foto, decisioni): prima una riga «A cosa serve: …» (cosa ottiene lui, l'app o il lavoro); nel blocco `👉 DA FARE TU` è la prima riga, prima dei passi.
- Cose da fare a mano: link da aprire diretto, intero e cliccabile (mai nei riquadri di codice), link da copiare in un riquadro; perché e cosa inserire; un'azione per passo, numerati; pulsanti in **grassetto** coi nomi esatti (mai inventati); testo da copiare in un riquadro; alla fine chiedo a che passo è. Prima di mandarli apro la pagina del link (WebFetch o ricerca) e controllo che pulsanti, voci e ordine ci siano davvero; pagina chiusa dietro un accesso: lo dico e uso la guida ufficiale con la sua data. GitHub dal telefono (Chrome desktop): dove scorrere, cosa toccare, cosa deve comparire, cosa no.

## Conferme e risposte
- Conferma solo per cose rischiose o irreversibili (dati veri, soldi, cancellazioni): «Confermi? 1 · Sì · 2 · No».
- Risposta dubbia: rispondo al dubbio e rifaccio la domanda in 2 righe. Una risposta che non cita la domanda e può valere per un'altra non è un «sì»: la rifaccio in 2 righe.
- Domanda aperta e Mario scrive d'altro: in fondo solo la riga «⚠️ Aspettano te» (non durante i passi a mano); intanto solo ciò che non dipende dalla risposta (C469: ricordare in una riga ≠ richiedere, una per messaggio). Mai la stessa domanda due volte senza che Mario scriva: resta nella sua riga di «Aspetta Mario». Dopo un riavvio la rifaccio.
- Domanda ripetuta che aveva foto o video: si RIMANDANO ogni volta (anche nei promemoria della propria catena, E247), nello stesso messaggio, con la didascalia «DOMANDA N · scelta N»; mai «le foto di ieri» (Mario 31/10 19:0x «rimandami le foto»). Nessuna domanda si perde mai: resta nella sua riga di «Aspetta Mario», col percorso delle sue foto, finché Mario non risponde (C347).

## Domande decisive 🛑 e normali ⏭ (C422, Mario 02/11)
- **🛑 decisiva** se la risposta cambia cosa vede o fa chi usa l'app, tocca dati veri, soldi, cancellazioni, cose difficili da disfare, o deciderebbe tanto codice da rifare se sbaglio. Nel blocco `❓ DOMANDE`: «1. 🛑 …». Mi fermo su quel lavoro: niente codice che dipende dalla risposta, nessuna sveglia che ci lavora sopra, titolo giallo se non ho altro; intanto solo lavori indipendenti.
- **⏭ normale** (gusti piccoli, scelte tecniche, cose che si cambiano in un minuto): non mi fermo. Scrivo «⏭ vado col 1 (consiglio) finché non dici altro» e lavoro col consiglio; la riga in «Aspetta Mario» resta finché Mario risponde, e se sceglie altro cambio.
- Ogni domanda, 🛑 o ⏭, ha la sua riga in «Aspetta Mario» finché Mario risponde: nessuna si perde; il titolo lo mostra con « ❓N» (E289: il «❔» bianco non si vede; skill `consegne` fase 6).
- Dubbio fra le due: 🛑 (meglio aspettare che rifare).
- Riga in «Aspetta Mario» di una 🛑: `- gg/mm · 🛑 · <segno> <Nome> <numero> · …`. L'hook `titolo-giallo.py` ferma il turno se il messaggio ha una 🛑 e la riga di oggi non ce l'ha; `avvio-check.py` le ricorda per prime a ogni sessione nuova (zero token in chat: il promemoria lo scrive l'hook).

## Quando mi fermo (spostato da `REGOLE.md`, kit 35.1)
- Comando fallito con una soluzione che non è normale e sicura: prima capisco il perché leggendo soltanto (uscita, file, `git log`); se basta `git fetch` e merge, lo faccio e avviso Mario in una riga; sennò mi fermo e scrivo a Mario le opzioni.

## «## 0. Aspetta Mario» (C369, Mario 31/10 ~23:10)
- Ogni cosa che aspetta Mario (domanda, foto da approvare, passo a mano, conferma) diventa SUBITO una riga nella sezione «## 0. Aspetta Mario», in cima a `docs/DA-FARE.md`, prima del messaggio finale: `- gg/mm · <segno> <Nome> <numero> · <cosa deve fare Mario, una riga>` (segno giallo e nome della catena, kit 30.7, anche se è chiusa: es. «- 01/11 · 🟡 Principale 466 · …», «- 01/11 · 🟨 Dov'è 8 · …»; foto: il percorso in `archivio/`). Commit e push subito.
- Si toglie solo quando Mario risponde, in qualunque chat: chi legge la risposta toglie la riga (anche di un'altra chat) e gira la risposta a quella chat (`send_message`). All'handoff le righe restano: nelle consegne solo il rimando, mai una copia.
- Domanda rifatta: data di oggi nella sua riga. Il turno che finisce con ❓ o 👉 senza una riga di oggi lo ferma l'hook `titolo-giallo.py`; all'avvio le righe le elenca `avvio-check.py` (titolo verde: il giallo solo quando mi fermo ad aspettare Mario, E245; ogni titolo giallo vuole la sua riga di oggi).

## Struttura di `docs/DA-FARE.md` (spostato da `REGOLE.md`, kit 32.4)
- Dopo «## 0. Aspetta Mario», 3 parti (Claude da solo · dopo ok di Mario · Mario a mano), numeri fissi, tabella per urgenza (🔴 in cima), aggiornato nello stesso commit del lavoro; a Mario in ordine, mai in blocco.
- Sopra la sezione 0 il «## Nastro delle versioni»: chi lo aggiorna, quando, notifica → skill `pr`.
- Si legge a righe, mai intero (oltre 40 KB = ~13k token, C469): la mia voce con `grep -n "^| C469 |" docs/DA-FARE.md`, poi solo quella riga (`sed -n 'Np'` o `Read` con `offset` e `limit` 1) ed `Edit`; i titoli di tutte con `grep -n -o "^| [^|]* | .\{0,80\}"`; la sezione 0 con `sed -n` fra le sue testate.

## Lavori aperti e chat (C417)
- Lavori aperti = righe della tabella «## Lavori» di `docs/DA-FARE.md`; nessun tetto (Mario 09/11): li chiude la catena «Fix». Una richiesta nuova di Mario non si perde: voce subito, con le sue parole, e la dico «in coda» in una riga.
- Quante chat insieme lo decide Mario (catene in `docs/CHI-FA-COSA.md`); una chat avviata su un lavoro importante non si chiude: si finisce. Prima di passare un lavoro a un'altra chat: skill `chat-parallela` «Carico».
- In fondo a ogni messaggio a Mario, dopo i blocchi fissi: `⚠️ Aspettano te: N · <nomi corti>` (una riga, dalle righe di «## 0. Aspetta Mario»; niente = la riga si salta). È un promemoria, non la domanda: la domanda intera solo quando Mario scrive (E179).
- Ogni mattina il «📊 Quadro» (la 📥 Bacheca del mattino, un posto solo, E263): tabella con lavori aperti, voci «👁 Lo vedi», 🔴, chiusi ieri, e la differenza dal giorno prima.
- Voci «👁 Lo vedi» a Mario a lotti di 10 o più al giorno (prima le più vecchie e le 🔴), ognuna con foto o prova e scelte «1 va · 2 non va (cosa) · 3 non serve più»: 1 e 3 chiudono la voce (in `docs/DA-FARE-FATTE.md`), 2 la riapre col suo difetto. Elenco pronto: `python3 -I .claude/hooks/promesse.py --lotto` (le 10 più vecchie). Foto e prove le prepara un aiutante (`fotografo`); a Mario UNA voce per messaggio con la sua foto (E282), la successiva appena risponde.

## Lezioni dal diario (regole delle correzioni di Mario; testo intero con date e parole in `docs/ERRORI-STORIA.md`)
- **E292** Mario risponde a una domanda e dice «procediamo con le altre, una per volta»: SUBITO la domanda dopo, con le foto; mai un «⚠️ Aspettano te» che gli richiede cose appena dette (04/11 17:1x «mi leggi o non mi leggi?»). Prima di scrivere: ogni riga di Mario → cosa ho fatto con quella riga.
- Prima di chiedere o ricordare (E303 E279 E273 E267 E142 E196): `git fetch` + merge, rileggo «## 0. Aspetta Mario», `ReadNotifications` e TUTTI i `docs/MESSAGGI-MARIO*.md`; una risposta data in un'altra chat vale anche se scritta come domanda → la confermo in UNA riga; se l'aveva già detto: «l'avevi detto alle HH:MM, errore mio» e si parte.
- Leggere la risposta (E227 E271 E200): una risposta che non cita la domanda non è un «sì» (sopra); nei riassunti le SUE parole; una regola su cosa «non si scrive» si controlla sul suo messaggio parola per parola.
- Scrivere (E320 E180 E259 E172 E159 E187 E263 E128): parole di tutti i giorni, mai codice; prima l'effetto per Mario, il numero tecnico dopo e solo se serve; per ogni scelta «👍 Pro» e «👎 Contro», schema o foto, consiglio col perché; il nome della cosa oltre alla sigla; mai «…» in titoli, nomi o passi; frasi in positivo, senza doppie negazioni; un numero grande con quanta parte serve, quanta è a scelta e cosa succede se non si fa; voto di un aiutante = «prova simulata (aiutante)», mai col nome di una persona vera.
- Foto (E140 E144): ritagliate sul pezzo che cambia, sotto ognuna cosa cambia davvero, consiglio dopo le scelte (skill `foto`).
- Aspetta Mario (E291 E289): la riga porta la chat che ha EREDITATO la domanda, dove leggerla e dove rispondere; « ❓N» nel titolo di ogni sessione che ne ha (sopra).
- Lotti «👁» (E282): UNA domanda per messaggio, spiegata facile, con la sua foto.
- Passi a mano (E155 E194 E201 E21 E3): prima «dove siamo», poi un passo alla volta con cosa deve comparire, mai dato per fatto senza la sua conferma; solo se serve a FINIRE l'app (sennò lo rinvio in una riga); prima il costo per Mario (voci × minuti) e se c'è un modo che lo evita; le password non le vedo mai e lo dico prima; mai inventare un pulsante (impegno xhigh = «Extra»); file da Mario: un .zip con l'elenco, i nomi di ospiti e colleghi li copro io.
- Richieste (E213 E193): mai parcheggiate su una domanda: la lettura più probabile dalle SUE parole, fatta e mostrata con la foto; se il dubbio resta, la domanda nello stesso messaggio. Risultato che si vede: la strada più corta, un passo alla volta con l'ora stimata, il resto fermo finché non l'ha visto.
- Stime (E190 E220): col conto (giri × minuti + pause), giri in fila appena il codice è pronto, ora di fine dal conto e risultati man mano; mai «domattina» a occhio.
- Altro (E134 E175): funzioni di gestione HK = Chiara (a Mario si chiede l'aspetto, mai a chi darle); un rischio sui termini di un servizio lo dico UNA volta.
