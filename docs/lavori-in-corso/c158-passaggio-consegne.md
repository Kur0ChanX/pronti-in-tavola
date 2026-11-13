# C158 · Passaggio di consegne senza perdere i messaggi di Mario

## Parole di Mario (intere)
- 13/11 ~20:45: «Poi dimmi se hai migliorato questa cosa, questo problema che abbiamo avuto nel passaggio di consegna, che non hai capito, che lo miglioriamo, che facciamo che leggi tutto quello della sessione precedente, gli ultimi messaggi, oppure fai in modo che non si perda lucidità nel passaggio di consegna, a discapito magari di qualche piccolo token in più.»
- 13/11 ~21:20: «Scusa, se facciamo da quella precedente e basta, non rimarranno mai indietro, perché alla fine quella dopo legge quella precedente. Di tutte mi sembra un po', forse un po' troppo dispendioso di token, di tutte quelle aperte. Facciamo della precedente. Perché non facciamo invece... risolviamo meglio che il passaggio di consegna, valuta tu se è meglio fare un passaggio di consegna più accurato oppure che la sessione dopo legge la sessione precedente. Qual è meglio, qual è il sistema migliore, più ottimale per lavorare meglio?»

Ho capito: solo la sessione PRECEDENTE, non tutte le aperte; scegliere io il sistema migliore. ❓ da confermare (DOMANDA C158 in Aspetta Mario).

## Proposta (#81)
- Causa vera del link di Lisa: messaggi scritti nella sessione vecchia DOPO l'handoff; stanno solo nella sua scorta, non nel ramo; `parole_intere` di `.claude/hooks/avvio-check.py` legge solo `HEAD`.
- Fix: `parole_intere` legge anche il registro dalla scorta della precedente (`git show <scorta>:docs/MESSAGGI-MARIO.md`, senza unirla) e mostra i messaggi non ancora nel ramo. Consegne corte come ora. La vecchia gira i messaggi tardivi (PT E82, già regola).
- Costo: poche centinaia di token all'avvio.
