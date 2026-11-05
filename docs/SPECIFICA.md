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
| Aspetto | Colori del logo, stile «trattoria moderna»; apertura animata col logo e il vapore; in basso «Powered by» col logo YNOY Corp con le 4 lune (`media/ynoy.png`) |
| Telefono di Monica | Android |
| Indirizzo web | Gratis (proposta: `pronti-in-tavola-by-ynoy-corp.pages.dev`, come Jona) |
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
5. Fase 3: etichette da stampare, immagine del menù per WhatsApp, incassi del mese, costo per piatto.

## Da controllare con Monica
- Ingredienti, allergeni e istruzioni dei 23 piatti sono una **bozza** di Claude (segnati «Da controllare»).
- Prezzi confermati da Mario (05/11): panade medie tipo oschiresi carciofi e patate 1,50 € al pezzo, carne 1,00 € al pezzo; impanade a mezza luna 15 € al kg (circa 20 pezzi).
- Impanade: ripieno da far scrivere a Monica negli ingredienti.
