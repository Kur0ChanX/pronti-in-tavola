# Pronti in Tavola con Monica · specifica

Versione 0.1 · 05/11/2026 · decisa in chat con Mario (04-05/11/2026).

## Cos'è
App per Monica, sorella di Mario: cucina in casa e vende da asporto ad amici e conoscenti, come hobby (niente Partita IVA).
Due lati nella stessa app:
- **Cliente**: apre il link ricevuto su WhatsApp, vede il menù, ordina, segue l'ordine, paga.
- **Monica**: riceve gli ordini (con notifica), li accetta o propone un altro giorno, gestisce piatti, foto, prezzi, pronti, clienti, impostazioni.

Regola d'oro di Mario: **semplicissima**. Monica fa tutto da sola, a prova di errore; Mario è solo la riserva.

## Decisioni prese
| Tema | Decisione |
|---|---|
| Ritiro | Solo ritiro a casa (Via Libano 53, 07026 Olbia, «Suona il citofono fuori»). Consegna: dopo |
| Giorno | Il cliente sceglie «mi serve entro il giorno X»; Monica accetta o propone un altro giorno; il cliente risponde con un tocco |
| Anticipo | Giorni di anticipo regolabili da Monica (partenza: 1) |
| Pronti subito | Monica segna cosa ha già pronto e quanti; si prendono senza prenotare, ritiro oggi entro un'ora scelta da lei; si azzerano il giorno dopo |
| Formati | Teglia da 6 = 6 porzioni, teglia da 8 = 8 porzioni; al kg (passi da 0,5); al pezzo; intera |
| Prezzo al kg | Niente pesata: il prezzo calcolato è quello finale |
| Pagamento | Contanti al ritiro, bonifico istantaneo (IBAN da copiare), Postepay a Postepay (numero di telefono). Interruttori nelle impostazioni. Si paga dopo la conferma. «Ho pagato» del cliente → Monica conferma «Soldi ricevuti». Niente messaggi «ti ricordo il pagamento» |
| Pagamento scelto | **Solo contanti** (05/11). Bonifico e Postepay restano spenti nelle impostazioni |
| Clienti nuovi | Invito di Monica su WhatsApp; anche richieste tramite amici, sempre con l'approvazione di Monica |
| Allergeni | Calcolati dagli ingredienti (14 di legge); allergie del cliente salvate solo sul suo telefono |
| Idee approvate | Pausa, limite di teglie a settimana, agenda «da preparare», «Mi è piaciuto», passaparola controllato, Novità per 2 settimane, testo grande, icona col logo, menù di Natale (solo se lo accende Monica, già nella prima versione) |
| Aspetto | Colori del logo, stile «trattoria moderna»; apertura animata col logo e il vapore; in basso «Powered by» col logo YNOY Corp con le 4 lune (`media/ynoy.png`); decori sardi delicati (trama «a pibiones» sullo sfondo, rombi nei titoli): vanno bene così, mai pacchiani né pesanti (Mario 05/11) |
| Telefono di Monica | Android |
| Indirizzo web | Gratis: `pronti-in-tavola.pages.dev` (deciso da Mario il 05/11) |
| Passaparola | Link unico che tutti possono rigirare; menù visibile a chi lo apre; il nuovo utente scrive il suo nome (diverso da quelli già usati) e Monica lo approva al primo ordine; indirizzo e ordini solo agli approvati (Mario 05/11) |
| Accesso di Monica | Google una volta sola + impronta o PIN del telefono a ogni apertura della sua parte (Mario 05/11) |
| Indipendenza | L'app non usa i limiti gratuiti di altre app (Firebase, Cloudflare) e non pesa su di esse: account e progetti solo suoi (Mario 05/11). Firebase: progetto nuovo sull'account Google di Mario (limiti per progetto). Cloudflare: account nuovo solo dell'app, mai condiviso neanche all'1% (Mario 05/11) |
| Ambiente | Progetto tutto separato: repository suo, ambiente Claude Code nuovo, ramo unico nuovo, kit RVC installato |

## Fatto nella v0.1 (prova)
Pagina di prova con i dati salvati sul telefono: https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH
Cliente: menù vero (23 piatti dal menù di ottobre), pronti subito, gusti e formati, note veloci, allergie, carrello con due ritiri, giorni (pausa e limite), pagamenti, ordini con tappe, proposta di giorno, «Ho pagato», modifica dell'ordine con approvazione, «Mi è piaciuto», ordina di nuovo, dove ritirare con Maps, testo grande.
Monica: home a 4 riquadri, guida della prima volta, notifica (finta nella prova), ordini (da guardare, da preparare con «Cosa cucinare», pronti, finiti), accetta / proponi / rifiuta, avviso «è pronto» su WhatsApp, soldi ricevuti, piatti (foto migliorata, pronti, nome, parte del menù, prezzi e formati, gusti, ingredienti con allergeni e nuovi ingredienti da confermare, richieste veloci, come si prepara, nel menù, novità, «ho controllato», anteprima, cestino 30 giorni), nuovo piatto in 4 passi, clienti (invito, richieste), impostazioni, «Chiedi a Mario», Annulla per 10 secondi.

## Prossimi passi (in ordine)
1. Repository nuovo + ambiente nuovo + ramo unico + kit (Mario crea il repository).
2. Dati veri condivisi (specifica: `docs/SPEC-FIREBASE.md`): Firebase come Jona (Firestore + accesso col link d'invito; Monica con accesso suo). Foto: verificare se Firebase Storage chiede il piano a pagamento; se sì, foto piccole dentro Firestore.
3. Notifiche vere a Monica (Android, app aggiunta alla schermata Home) e sito su Cloudflare Pages.
4. Fase 2: dosi per ricetta e **spesa** (totale e per ordine, dispensa, confezioni, reparti, senza rete), sconti.
   - **Lista della spesa** (Mario 05/11: «guarda le quantità dei prodotti… e quando va a fare la spesa gli segna la spesa che deve fare in base alle quantità degli ordini»), fatta in `spesa.js`: dosi per 1 porzione / 1 kg / 1 pezzo / 1 torta (in più per gusto), ordini accettati fino a oggi, domani, 3 giorni o una settimana (anche quelli da accettare, se vuole), meno quello che ha in casa, arrotondato alle confezioni, diviso per reparti, spunte mentre compra, lista su WhatsApp. I «pronti subito» non contano. I clienti non vedono mai le dosi.
   - **Lista della spesa completa** (C16, Mario 05/11: «prendi spunto alle app gold standard… e poi una sezione… spesa per i miei ordini»). Ricerca del 05/11 (anylist.com, listonic.com «best grocery list apps 2026» del 18/08/2026, Google Play): le migliori hanno suggerimenti mentre scrivi, reparti automatici, quantità, una lista sola riusata, «preferiti/recenti», spunte, condivisione. Due schede: **La mia lista** (scrivi «latte» o «2 kg patate», Invio o +; reparto messo da solo e ricordato se lo cambi; suggerimenti mentre scrivi; «Compri spesso» con le cose usate di più, all'inizio idee di base; niente doppioni: la voce che c'è torna da prendere con la quantità nuova; «Anche per gli ordini: …» se la stessa cosa serve per gli ordini; spunte; «Togli le cose prese» e «Svuota» con Annulla) e **Spesa per i miei ordini** (quella di sopra). Un solo «Manda tutta la spesa su WhatsApp» con le due liste per reparto, senza le cose già prese. Reparti in più: Pane e dolci, Bevande, Casa e pulizia. Scartati per ora: prezzi e totale (Monica paga in contanti, si aggiunge se lo chiede), voce e foto delle voci (difficili per lei), condivisione dal vivo (serve Firebase, domanda in Aspetta Mario).
5. Fase 3: etichette da stampare, immagine del menù per WhatsApp, incassi del mese, costo per piatto.

## Da controllare con Monica
- Ingredienti, allergeni e istruzioni dei 23 piatti sono una **bozza** di Claude (segnati «Da controllare»).
- Prezzi confermati da Mario (05/11): panade medie tipo oschiresi carciofi e patate 1,50 € al pezzo, carne 1,00 € al pezzo; impanade a mezza luna 15 € al kg (circa 20 pezzi).
- Impanade: ripieno da far scrivere a Monica negli ingredienti.
