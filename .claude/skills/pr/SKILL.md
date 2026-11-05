---
name: pr
description: Regole delle PR verso main e dei minuti GitHub (bozza, un solo giro, unione da sola col verde, ramo-copia, quando si pubblica, corsia urgenze, quando leggere l'esito). Usala prima di aprire o segnare pronta una PR, prima di un push che può far partire le prove e quando arriva l'esito di un giro.
---

# PR, prove su GitHub e minuti

Le regole corte sono in `docs/kit-progetto/REGOLE.md` («Rami e PR»); qui la procedura. Passi tecnici del progetto, se ci sono: skill `unione-pr` (unione e intoppi) e `minuti-github` (conteggio).

## Minuti: contano QUANTE volte girano le prove, non quanto durano
1. Un solo giro completo per versione, dove dice il `CLAUDE.md` del progetto (di base: nel contenitore, gratis, poi un giro di conferma su GitHub).
2. Le prove partono solo a PR aperta, riaperta o segnata pronta: niente `synchronize`, quindi un push su una PR pronta non fa partire niente.
3. Unione solo col verde sull'ultimo commit; dopo un push, bozza → pronta per un giro nuovo.
4. Mario vede subito ogni modifica: ogni push del ramo che tocca l'app la pubblica sull'anteprima (solo costruzione, niente prove); il sito vero cambia a versione finita, le urgenze subito. A Mario dico l'indirizzo e cosa provare.
5. Pochi lavori (job) per workflow: ognuno si arrotonda al minuto e rifà l'installazione; niente calendari giornalieri se non servono; minuti contati per lavoro.
- Conteggio e scelta del posto (skill `minuti-github`, se c'è: smistatore fra contenitore, Blacksmith e GitHub): all'avvio solo se dopo l'ultimo conteggio nelle consegne è partita una PR, e prima di ogni push che fa partire le prove. Oltre 2000 minuti nel mese: niente giri sui computer di GitHub fino al 1°.

## Dalla bozza all'unione
1. PR verso `main` in **bozza** (draft) mentre lavoro: in bozza le prove su GitHub non partono.
2. Prima di ogni push, in locale: unità, regole, build e prove nel browser della parte cambiata (il `CLAUDE.md` del progetto dice se serve il giro completo). Mai «[skip ci]» nei commit, nemmeno di soli documenti (F04): i workflow su push hanno già `paths`, un commit di soli documenti non fa partire niente; nello squash GitHub lo incolla e `main` non pubblica. La guardia lo ferma.
3. Versione finita: foto dell'aspetto già approvate da Mario, prove verdi come al punto 2 (giro completo in locale solo se il `CLAUDE.md` del progetto lo chiede), `docs/DA-FARE.md` e novità aggiornati (ogni voce con «👁 Lo vedi» della versione è dentro, o a Mario dico perché no). Testi delle novità: chiari e professionali, da aggiornamento d'app; mai far capire che ci parliamo (niente «come chiesto», nomi, sessioni); permessi e controlli sulle persone solo nei dettagli dello sviluppatore.
4. **Ramo-copia**: `versione-vNN` = copia del commit provato, push; la PR parte da lì. Il ramo comune resta libero, codice compreso, anche col giro in corso (entra nella versione dopo). Con la PR pronta niente push su `versione-vNN`: per una correzione la PR torna prima in bozza.
5. Prima di segnare pronta: `git log -1 --format=%s origin/versione-vNN` senza «[skip ci]» (la guardia ferma `create_pull_request` non in bozza e `update_pull_request` `draft: false` se l'ultimo commit del ramo su GitHub lo porta, C413). Poi push e PR aperta già pronta (`create_pull_request` `draft: false`, o `update_pull_request` `draft: false`): parte UN giro. Dopo 1 minuto controllo che il giro sia partito.
6. Esito: si legge UNA volta, all'evento `check_suite` o dopo ≥15 minuti dal push (`get_check_runs` sul commit del giro, anche se dopo ci sono commit di soli documenti), oppure con un ciclo in sottofondo che costa zero token. Mai letture ripetute in chat, mai sveglie sotto i 50 minuti per guardare GitHub (la ripresa dei turni brevi è un'altra cosa).
7. A Mario, con la versione in attesa: «fine giro alle HH:MM → se verde pubblico subito; se rosso ~2 ore», con l'ora massima e il perché di un ritardo, mai solo «ancora in corso». Una versione alla volta.
8. Giro completo finito e TUTTO verde sull'ultimo commit (fuori, dove dice lo smistatore; senza minuti fuori in locale: `REGOLE.md` «Rami e PR») → unisco io, da sola, sempre (squash) con un `commit_message` scritto da me (un «[skip ci]» incollato salta la pubblicazione); poi una riga a Mario. Nello stesso turno il **nastro delle versioni** in cima a `docs/DA-FARE.md` (sempre 3 righe: `🚀 Online: v<N> · <segno> <Nome> <numero> · <gg/mm hh:mm> · <3 parole>`, `🧪 In prova: v<N> · <segno> <Nome> <numero> · <3 parole>`, `⏳ Dopo: …`, es. «⏳ Dopo: v119 · 🟢 Principale 466 · …»; una versione appartiene a una sola catena alla volta) e la notifica sul telefono «🚀 v<N> online · <segno> <Nome> <numero> · <3 parole>»: li ricorda l'hook `nastro-check.py`. Anche PR aperta o versione passata a un'altra catena → nastro nello stesso commit, e la catena con una versione in prova lo scrive nel titolo («· v<N> in prova»). Rosso, annullato o non finito → non unisco: correggo in bozza e rifaccio un giro. Niente giro doppio dopo l'unione.
9. Subito dopo l'unione, prima di ogni altra modifica: `git fetch origin main && git merge origin/main` nel ramo comune e push; controllo che la pubblicazione parta e guardo il sito vero. Le promesse della versione (`python3 -I .claude/hooks/promesse.py --aperte`) si chiudono («👁 Visto da Mario») solo con la prova dal sito vero (foto o lettura dei dati veri), e a Mario dico cosa resta aperto. All'altra chat un `send_message` (cortesia: mai aspettarla).

## Quando si pubblica
- Giro su Blacksmith (minuti liberi) o in locale: si pubblica appena il giro completo è verde, a ogni ora, senza fasce.
- Solo se il giro deve usare i minuti di GitHub vicini a 2000: al massimo una versione per fascia, ora italiana: mattina (fino alle 13), pomeriggio (13–18), sera (dalle 18); fascia già usata → ramo-copia e PR aspettano la fascia dopo (prima della PR `git log origin/main --since=<inizio fascia>` senza versioni). Le urgenze della corsia sotto sono sempre fuori dal conto.
- La versione porta tutto il lavoro pronto delle chat sul ramo.

## Corsia urgenze
Urgenza di sicurezza = dati visti da chi non deve, permessi sbagliati, dati persi, app ferma. Non aspetta il lavoro dell'altra chat. La correzione va sul ramo comune: push, `send_message` all'altra chat, riga nella voce della versione, riga «URGENZA» in `docs/CHI-FA-COSA.md`. Poi:
1. PR della versione col giro in corso, giro verde → unione e subito una versione con la sola urgenza.
2. PR della versione col giro in corso, giro rosso → la correzione entra in `versione-vNN` e la PR rifà il giro.
3. Nessuna PR → versione con la sola urgenza, subito: ramo-copia da `origin/main` + `git cherry-pick` della correzione.

## Push
- Prima di ogni push: `git fetch` e merge normale (il lavoro di un'altra chat si unisce così); prima guardo l'esito delle prove, poi commit e push in un comando a parte.
- Push di soli documenti sempre ok: non fanno partire le prove.
- Rami a parte, mai cancellati a mano (solo il lavoro mensile «Pulisci le scorte» toglie le `scorta-*` più vecchie di 30 giorni già nel ramo, C352): scorte per sessione `scorta-<ruolo>-<AAAAMMGG>-<id>/<ramo>` (C352; le vecchie `scorta-<ruolo>/<ramo>` e `scorta/<ramo>` non si scrivono più, si leggono ancora), rami-copia `versione-vNN`, copie `vecchio-…` dell'hook di avvio.
- Un push con l'albero dei file identico al precedente (es. unire una scorta vuota) non conta come «solo documenti»: con zero file cambiati il giro può essere completo.
