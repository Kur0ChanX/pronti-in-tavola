# C160 · Quanto costa a Monica fare una ricetta

## Parole di Mario (intere, registro 13/11 22:35, sessione #82)
- 13/11 22:35: «128-Sì, guarda se l'hai studiata meglio, rifletti bene e vai come consiglio. Poi ti chiedo un'altra cosa da mettere in priorità, scusami, due cose. Prima fai questa cosa che abbiamo detto adesso, poi questa cosa delle regole. Poi cosa facciamo? Abilitiamo Monica alla modalità sviluppatore, però in che senso? Voglio che anche Monica vede come vedono i clienti, però voglio che ci sia solo lo swipe verso l'alto come ce l'ho io, e ogni volta che rientra nell'app si chiude, cioè lo deve riswappare per andare nella modalità cliente. E poi così può provare lei gli ordini, che si può fare gli ordini da sola, però tu dirai cosa se ne fa a farsi gli ordini da sola, giusto per provare l'app. Quindi ci sarà, prima di ordinare sto solo provando l'app quando va a ordinare, oppure sto ordinando davvero, ma sto ordinando davvero non lo farà mai, quasi mai, però glielo lasciamo questa opzione. Verifica che ci sia, sto solo facendo una prova, come mi sembra l'abbiamo già implementato, e così abilitiamo anche Monica a far vedere l'app come il cliente, che anche lì deve vedere come lo vede il cliente, ecco. Quindi evitiamo di, non lo so, facciamo magari mettiamo 5 tocchi la prima volta per entrare, come lo faccio io, 5 tocchi in modalità mi sembra la 5 tocchi dove c'è sotto i noi la scritta, sotto in basso nella pagina principale, e poi lei fa lo swipe su in alto, lì si abilita. Ogni volta che rientra nell'app però questa se la ritroverà chiusa, perché non è bellissima da vedere. Poi un'altra cosa da implementare è il costo per cioè quanto spende lei per creare una ricetta. Quindi mi sembra che abbiamo già implementato che Monica carica tutti gli ingredienti, mette le quantità che usa nella ricetta e poi mettiamo una parte di quanto lei lo paga. Nel senso, mette monica le sue quantita e poi aggiungiamo la quantita esempio kg litri ecc del prodotto acquistato con il prezzo caricato da Monica cosi puoi calcolare quanto gli costa fare quella ricetta e carica i prodotti nella lista spesa che dici fai un bel lavoro con logica»

Ho capito: per ogni ingrediente della ricetta Monica ha già la quantità usata; aggiungiamo il prodotto comprato (confezione: kg, litri, pezzi…) col prezzo che mette lei; l'app calcola il costo della ricetta (e a porzione) e porta i prodotti nella lista della spesa. ❓ da confermare (Mario).

## Cosa c'è già (controllato #83, 13/11 23:10)
- Scheda del piatto → «Dosi e costo» (`sezioneDosi` in `spesa.js`): dosi per la teglia piccola (le altre calcolate), poi «Quanto ti costa»: per formato «ti costa X · vendi a Y · ti restano Z» (`costoPiatto`), tasti degli ingredienti senza prezzo.
- Foglio dell'ingrediente (`foglioSpesaIng`): «Quanto lo paghi», «La confezione che compri» (solo in grammi, millilitri o pezzi), «Si misura in», reparto. Dati su Firebase `impostazioni/spesa` (solo gestori, C15).
- Lista della spesa: dagli ordini, in confezioni intere («2 × 250 g»).
- Foto: `archivio/foto/2026-11-13-2310-c160-oggi-1-costo.png`, `…-oggi-2-prezzo.png`.

## Buchi trovati e proposte (DOMANDA 1 della #83, aspetta «tutti» o numeri)
1. Confezione in kg e litri (oggi «1000 grammi»): scelta g/kg, ml/l, pezzi; l'app converte.
2. Prima la confezione, poi il prezzo, con la prova «= 10,00 € al kg».
3. Ingredienti del piatto senza dose: oggi non contano e non si vedono → «manca la dose, non conta».
4. Gusti con ingredienti in più: `costoPiatto` chiama `costoDosi(p)` senza gusto → costo di ogni gusto («+ 0,80 €»).
5. Altre spese per teglia (vaschetta, carta, gas): una casella per formato, entra nel costo.
6. Costo anche in «I miei piatti», una riga sotto ogni piatto (solo Monica).
7. Lista della spesa: «Spenderai circa N €» dai prezzi delle confezioni (senza prezzo: «N cose senza prezzo»).
- Occhio critico: i clienti non vedono mai costi (dati solo gestori); Mario e Monica insieme sullo stesso prezzo = vince l'ultimo (come oggi per tutta la spesa); senza rete: memoria del telefono, poi Firebase.

## Stato
- Aspetta DOMANDA 1. Poi: codice in patch, prova `SOLO=dosi`, foto, ok di Mario, giro, online.
