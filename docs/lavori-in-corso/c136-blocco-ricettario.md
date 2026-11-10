# C136 · Blocco al ricettario (a mano, poco alla volta)

## Parole di Mario (10/11, chat #52)
- 17:41 «cmq bisogna mettere un blocco al ritardo se tutto il consumo era quello che non vada sempre in automatico a manuale poco alla volta»
- 17:41 «volevo scrivere un blocco al ricettario»

## Scelte (Principale 53, 10/11 ~18:00)
- Il cron ogni 10 minuti resta, ma per il ricettario fa solo UNA lettura: l'interruttore «motore automatico» (chiave `auto` nel Ricettario). Di base SPENTO: niente motore, niente carico automatico, niente controllo di tutte ogni giorno.
- Perché non togliere il cron: così Mario può riaccenderlo da solo (regola «Senza Claude»), con conferma; costo ~144 righe lette al giorno (niente).
- L'interruttore lo vede solo Mario (Database → Tutto il dettaglio), al posto di «⏸ Ferma / ▶️ Riprendi».
- A mano: «⚡ Carica altre N ricette» (N in «Solo per te, Mario», base 20, da 5 a 50; il server taglia a 50). Anche «🔍 Cerca altre» delle Proteiche legge al massimo N.
- Un carico a mano finisce da solo: N ricette, o 4 sveglie per ogni 5 ricette (min 20), o 20 sveglie vuote. «⏹ Ferma» lo interrompe (annulla).
- Testi onesti (PT E17): niente «ogni 10 minuti», «parto da sola» col motore spento.
