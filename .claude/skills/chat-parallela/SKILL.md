---
name: chat-parallela
description: Regole delle due chat sullo stesso ramo (chi fa cosa, chat principale e parallela, aiuto quando una si blocca). Usala quando si apre o si chiude una chat parallela, prima di prendere un lavoro con due chat attive e quando l'altra chat sembra ferma.
---

# Due chat sullo stesso ramo

## Chi fa cosa (`docs/CHI-FA-COSA.md`)
- Prima di un lavoro: `git fetch` + merge, leggo il file. Lavoro (o un file da toccare) già di un'altra chat → non lo tocco: le scrivo o scelgo altro.
- Lavoro libero → scrivo la mia riga, commit e push SUBITO (solo documenti: vanno bene anche con una PR pronta). Finito (unito in `main`) o lasciato: tolgo la riga.
- Zone fisse nel file: la principale tiene PR, unione e pubblicazione della versione in corso e le consegne in `docs/PASSAGGIO-CONSEGNE.md`; la parallela solo la sua zona.
- La PR la apre chi è pronta, da sola, dopo aver scritto nel file «PR N aperta»: l'altra la legge e non ne apre una seconda. Una versione alla volta: il lavoro della chat senza PR entra nella versione dopo (ramo-copia: skill `pr`).
- Dopo l'unione chi ha unito fa subito `git merge origin/main` nel ramo comune, push, e lo scrive all'altra.
- Domande a Mario: ognuna solo sul suo lavoro. Mario risponde nella chat sbagliata → chi la legge la gira all'altra con `send_message`, parola per parola.
- Richiesta di Mario nella zona dell'altra: la faccio io se me la chiede in questa chat, ma prima scrivo la riga nel file e avviso l'altra.
- I messaggi fra le chat sono solo cortesia: mai aspettarli. Se una è pronta, va da sola.

## La chat parallela
- Serve per un lavoro grande in una zona separata, che non tocca i file della principale.
- Catena nuova (kit 30.7): nome di una parola, che non cambia mai, e prima forma libera della tabella «## Catene» di `docs/CHI-FA-COSA.md` (riserva: libri 📗 📒 📕 📓); numero da 1; fissi per tutta la catena anche all'handoff; chi la apre scrive la riga. Quante parallele insieme lo decide Mario (REGOLE «Chat e carico»). Titoli: skill `consegne` fase 6.
- Prompt di avvio: «[AVVIO] Sei la chat parallela <zona> <NN> di <progetto> (ramo <ramo>)» + fetch e merge del ramo + file da leggere (`CLAUDE.md`, `docs/ERRORI.md`, le sue consegne `docs/CONSEGNE-PARALLELA-<lavoro>.md`).
- Con quella frase la scorta si segna «parallela»: ramo `scorta-parallela-<AAAAMMGG>-<id sessione>/<ramo>` (uno per sessione, C352: due parallele insieme non si pestano), messaggio di Mario in `docs/ULTIMO-MESSAGGIO-PARALLELA.md`. Aperta a mano senza la frase: primo comando `python3 -I .claude/hooks/scorta.py ruolo parallela`.
- All'avvio unisce solo la sua scorta; quella della principale non si unisce (al massimo `git show <scorta>:<file del messaggio>`).
- Vive finché ha lavoro nella sua zona. Alla soglia: consegne nelle sue `docs/CONSEGNE-PARALLELA-<lavoro>.md` (mai in `docs/PASSAGGIO-CONSEGNE.md`); sessione parallela nuova solo se resta più di mezza sessione di lavoro, sennò il resto passa alla principale.
- Finito il lavoro: consegne, push, titolo col segno «chiusa» della sua catena, `<segno chiusa> <icona> <Nome> <NN> · <cosa ha fatto>` (es. «🟥 <icona> Dov'è 8 · online + Porter»; regola «Titoli»; data di chiusura nella tabella «## Catene»; le sue righe di «## 0. Aspetta Mario» restano), nessuna sessione nuova; le sue zone tornano alla principale in `docs/CHI-FA-COSA.md` e un `send_message` alla principale.

## Aiuto fra le chat
- Evento atteso dall'altra (unione, PR, risposta di Mario arrivata qui): `send_message` SUBITO. L'altra può non avere sveglie.
- Bloccata dopo 2 tentativi sulla stessa cosa: lo dico a Mario e scrivo all'altra l'errore, cosa ho provato e dove sono i registri. L'altra guarda con occhi nuovi nel suo contenitore e risponde con una proposta, senza toccare i file della prima.
- Chat ferma con un lavoro aperto (niente commit né messaggi da più di 1 ora): l'altra guarda `get_session`. Se è morta: una riga a Mario con il testo da incollare; il lavoro urgente (PR pronta, unione) lo prende l'altra, scrivendolo nel file.
- Sessione nuova: la apre la chat che chiude con `create_session` (a 8 della catena Mario; skill `consegne`, fase 5); l'altra chat non la apre.
- `send_message` solo a sessioni attive nell'ultima ora; per le altre una riga in `docs/DA-FARE.md`.

## Carico (kit 35.1)
- Per guardare le altre sessioni: `list_sessions` sempre con `limit` 4 (spostato da REGOLE «Token», kit 36.14).
- Prima di passare un lavoro a un'altra chat (anche alla principale) guardo i suoi lavori in corso in `docs/CHI-FA-COSA.md`.
- Richiesta piccola con l'altra chat carica: la faccio io, se non pesta la sua zona; sennò chat a parte. Passata a una chat carica si perde o arriva tardissimo.
- Lavoro grosso mentre l'altra ha un lavoro grosso: chat a parte, mai in coda alla sua.
- Ogni chat cose diverse, mai accavallate: zone e file in `docs/CHI-FA-COSA.md`, le parole di Mario girate intere.
- Quante chat insieme lo decide Mario, non un numero fisso; una chat avviata su un lavoro importante si finisce.

## Aiutanti (spostato da `REGOLE.md` «Token, file e aiutanti», kit 37.2)
- Agente dedicato (`.claude/agents/`, motore leggero), mai `general-purpose` (Fable → skill `fable-opus`), rapporto corto, ognuno i suoi file, poi le prove delle parti cambiate; vicino alla soglia niente aiutanti lunghi.
