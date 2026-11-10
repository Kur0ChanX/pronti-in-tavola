---
name: minuti-github
description: Minuti del mese (GitHub, Blacksmith) e dove far girare le prove (`scegli-giro.py`). Usala all'avvio se dall'ultimo conteggio è partita una PR, prima di segnare pronta una PR e prima di un push che fa partire le prove fuori.
---

# Minuti e smistatore dei giri

Tre posti per le prove, ognuno con la sua bravura e i suoi limiti. GitHub non dà il contatore: li conto io. Si azzerano il 1° del mese.

| Posto | Minuti | Giro completo | Bravo per | Limiti |
|---|---|---|---|---|
| **Blacksmith** (`blacksmith-2vcpu-ubuntu-2404`, acceso dal 24/10) | 3000 al mese, gratis | ~17 min | **giro completo delle versioni e urgenze** (Mario #296 «1», E162): stesse prove di GitHub in metà tempo | niente segreti (i workflow coi segreti restano su GitHub); 4 vCPU = minuti doppi |
| **GitHub** (`ubuntu-latest`) | 2000 al mese (repo privato, solo di questo progetto) | ~87 min (10/11, C471) | **secondo parere del lunedì** (macchina più lenta = escono le prove instabili rare, più l'iPhone); versioni solo se Blacksmith è fermo o finito; sempre pubblicazione, anteprima, letture coi segreti | i minuti delle pubblicazioni vanno tenuti da parte (riserva) |
| **Contenitore di Claude** | illimitati, zero token mentre gira | ~35 min | prove della parte cambiata, prove rosse da rifare (`--repeat-each`), giro di riserva se fuori non c'è più niente | non è una macchina indipendente; occupa la sessione |

## Come scelgo (ogni volta)
1. `python3 -I tools/scegli-giro.py <caso>` (`lavoro` · `versione` · `urgenza` · `rosso` · `lunedi`): conta i minuti (~40 s) e scrive «DOVE» e il perché. Regole dentro: prove della parte cambiata e prove rosse sempre qui; versione e urgenza su Blacksmith (~17 min), poi GitHub oltre la riserva, poi il contenitore; il lunedì su GitHub (secondo parere, `prove.yml` lo manda lì da solo), sennò Blacksmith se avanza, sennò si salta. Niente doppio giro completo nel contenitore prima della PR (Mario #296): stesse prove, ~35 min persi (E162).
2. GitHub scelto → etichetta `giro-github` sulla PR PRIMA di segnarla pronta. Contenitore scelto → giro completo verde qui, poi etichetta `giro-locale` (il giro fuori si salta), pronta e unione. Senza etichetta: Blacksmith (variabile `PROVE_RUNNER`).
3. Il numero dei minuti nelle consegne con la data (serve a sapere se ricontare all'avvio).

## Perché non finiscono più (E113, storia in `docs/ERRORI-STORIA.md`)
- Regole dei giri (contano quante volte girano, uno per versione, niente `synchronize`, unione solo col verde sull'ultimo commit): skill `pr` «Minuti» e «Dalla bozza all'unione».
- Un giro fuori rosso: prima la prova rossa nel contenitore, mai rilanciare alla cieca (E22).

## Oltre 2000 minuti di GitHub
- Oltre 2000 nessuna prova sui computer di GitHub fino al 1° (un giro partito lì lo annullo appena lo vedo); Blacksmith e contenitore vanno avanti (E160). Tetto «Budgets and alerts» di Actions: 0 $ (Mario #295: «poi non più a pagamento tanto c'è black in supporto»; il passo è di Mario, M18; finché la pagina dice 11 $, oltre 2000 GitHub paga ~0,006 $ al minuto fino a 11 $, foto `archivio/sessione-295/`). Al tetto si fermano anche pubblicazione e anteprima: la riserva per pubblicazioni e anteprime non si tocca mai.
- Avviso dei minuti oltre 2000: **una riga sola, una volta al giorno** (prima risposta della giornata), e di nuovo solo se scelgo un giro che costa soldi. Mai in testa a ogni messaggio (Mario #296: «questo è spam», E163).
- Sotto 2000: nessuna domanda e nessun avviso.

## Lezioni dal diario (spostate intere da `docs/ERRORI.md`, C469 A6, 09/11)
- **E168** (Mario 31/10 23:50) L'Atlante si aggiorna da solo ogni 3 ore di giorno, a ogni versione su `main` e a mano: niente più giri a ogni consegna (457 partenze in 2,5 giorni); a mano solo se Mario lo chiede.
- **E215** Un conto che legge un elenco dal server si confronta col `total_count` (le ricerche di GitHub si fermano a 1000 giri: 853 minuti segnati, 3830 veri).
- **E218** Un lavoro fermo per un tetto di GitHub passa su Blacksmith da solo, in una riga, senza chiedere (C290, E162; 29/10 «non dovresti neanche chiederlo»).
