# Pronti in Tavola · passaggio di consegne

Sessione #01 (chat di Claude, 04-05/11/2026) → prima sessione di Claude Code.
Repository: `Kur0ChanX/pronti-in-tavola` (privato) · ramo unico: `claude/pronti-ramo-definitivo` · icona del progetto: 🍝
Pagina di prova (artifact): https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH (v0.7; nella cartella `sorgente/` ci sono gli stessi file di questo repository).

## 1. Scopo e utenti
App per **Monica**, sorella di Mario: cucina in casa e vende piatti da asporto ad amici e conoscenti, come hobby, senza Partita IVA. Ritiro a casa sua a Olbia.
- **Clienti**: ricevono un invito su WhatsApp, aprono il link, vedono il menù (foto, ingredienti, allergeni), ordinano, seguono l'ordine. Molti sono poco pratici: tutto deve essere semplicissimo.
- **Monica**: riceve la notifica a ogni ordine, accetta o propone un altro giorno, gestisce piatti, foto, prezzi, ingredienti, pronti del giorno, clienti e impostazioni. Non è pratica: l'app deve essere a prova di errore e lei deve poter fare tutto da sola.
- **Mario**: crea e mantiene l'app (aiuto di riserva, tasto «Chiedi a Mario»).

## 2. Funzioni
### Fatte nella v0.7 (prova: dati salvati solo sul telefono, in localStorage)
Cliente
- Apertura animata a ogni apertura (circa 5 s, un tocco ovunque la salta).
- Menù vero (23 piatti dal menù di ottobre) diviso in Stuzzichini, Primi, Dolci; righe stile carta del menù con prezzo.
- «Pronti subito»: piatti già pronti con le quantità, si prendono senza prenotare, ritiro oggi entro un'ora decisa da Monica.
- Scheda del piatto: gusti (varianti), formato (teglia da 6 / da 8, al kg a passi di 0,5, al pezzo, intera), quantità, ingredienti, allergeni calcolati, «come si prepara a casa», richieste veloci (es. «Poco sale»), nota libera, «Manda a un'amica».
- Etichette automatiche: Pronto oggi, Novità (2 settimane), Il più amato, Vegetariano, «Contiene: …» in rosso se c'è una sua allergia.
- Le mie allergie (14 di legge), salvate solo sul suo telefono. Testo grande.
- Carrello: due ritiri automatici se ci sono pronti + da preparare; «Mi serve entro…» (rispetta anticipo, pausa e limite settimanale); pagamento; nota per Monica; invio.
- I miei ordini: tappe Inviato, Confermato, Pronto, Ritirato; risposta alla proposta di Monica («Va bene» / «Un altro giorno»); «Cambia l'ordine» con approvazione di Monica; annulla ordine (solo se nuovo); «Mi è piaciuto»; «Ordina di nuovo».
- Dove ritirare: Via Libano 53, 07026 Olbia, «Suona il citofono fuori», tasto «Apri in Maps», «Scrivi» e «Chiama» quando Monica inserisce il numero.
Monica
- Home a 4 riquadri: Ordini, I miei piatti, Clienti, Impostazioni; «Pronti subito oggi»; agenda «Da preparare»; guida della prima volta (3 passi).
- Notifica (finta nella prova) quando arriva un ordine.
- Ordini in 4 schede: Da guardare, Da preparare (con «Cosa cucinare» per giorno e note), Pronti, Finiti. Accetta, Proponi un altro giorno, Non posso farlo, modifica del cliente con differenze a colori (verde aggiunto, rosso tolto), «È pronto: avvisa su WhatsApp», Ritirato, Soldi ricevuti.
- I miei piatti: interruttore «nel menù», foto (ridotta e migliorata da sola), pronti di oggi, nome, riga sotto, parte del menù, prezzi e formati, gusti con prezzo diverso e ingredienti in più, ingredienti con suggerimenti (nuovi ingredienti: allergeni proposti da confermare), richieste veloci, come si prepara a casa, Novità, «Ho controllato tutto», «Come lo vede il cliente», cestino 30 giorni.
- Nuovo piatto in 4 passi (nome, parte del menù, come lo vendi, prezzo).
- Clienti: invito su WhatsApp, richieste tramite amici da approvare, elenco.
- Impostazioni: pausa fino a una data, giorni di anticipo, limite di teglie a settimana, ora dei pronti, menù di Natale (data limite e piatti), pagamenti, indirizzo e nota, numeri WhatsApp di Monica e di Mario, testo grande, rivedi guida, ricomincia la prova.
- Ogni modifica si salva da sola; «Annulla» per 10 secondi.
- Animazioni: entrata delle schermate, piatto che vola nel carrello, foglio che si chiude scendendo, scoppio all'invio.

### Da fare
In `docs/DA-FARE.md` (un posto solo). Kit RVC 35.0 installato il 05/11/2026 nella prima sessione di Claude Code.

## 3. Decisioni e perché
| Tema | Decisione | Perché / chi |
|---|---|---|
| Lingua | Solo italiano, frasi corte, parole semplici, «tu» ai clienti | Clienti e Monica poco pratici |
| Semplicità | Una cosa per schermata, pulsanti grandi con parole, niente tasto Salva, Annulla sempre | Mario: «se no si spaventa Monica»; Monica deve fare tutto da sola |
| Ritiro | Solo ritiro a casa; consegna dopo | Mario |
| Giorno | Il cliente dice «mi serve entro»; Monica accetta o propone | È un secondo lavoro: Monica si organizza |
| Anticipo | Regolabile da Monica (parte da 1 giorno) | Mario |
| Pronti subito | Monica segna cosa ha pronto e quanti; si azzerano il giorno dopo | Idea di Mario |
| Formati | Teglia da 6 = 6 porzioni, teglia da 8 = 8 porzioni; kg a passi di 0,5; pezzo; intera | Dal menù di Monica; Mario ha confermato le porzioni |
| Prezzo al kg | Niente pesata: il prezzo calcolato è quello finale | Mario |
| Prezzi confermati | Panade medie tipo oschiresi: carciofi e patate 1,50 €/pz, carne 1,00 €/pz; impanade a mezza luna 15 €/kg (circa 20 pezzi) | Mario 05/11 |
| Pagamento | **Solo contanti al ritiro**. Bonifico e Postepay esistono ma spenti nelle impostazioni | Mario 05/11. Niente PayPal «amici» (non è per vendite) |
| Promemoria pagamento | Niente messaggio «ti ricordo il pagamento» | Mario |
| Clienti nuovi | Invito di Monica; anche richieste tramite amici, sempre approvate da Monica | Mario |
| Allergeni | Calcolati dagli ingredienti (14 di legge); allergie del cliente solo sul suo telefono | Dato sulla salute: meglio non tenerlo online |
| Idee approvate | Pausa, limite settimanale, agenda, «Mi è piaciuto», passaparola controllato, Novità, testo grande, icona col logo, menù di Natale già nella prima versione ma acceso solo da Monica | Mario |
| Colori | Dal logo: bordeaux `#7B2318`, terracotta `#C4532E`, ocra `#E8B46A`, crema `#FBF4E8`, basilico `#4C6A36` per «pronto» | Coerenza col logo |
| Caratteri | Titoli Fraunces (con grazie, stile trattoria), testo Nunito Sans | Leggibile e caldo |
| Stile | «Trattoria moderna»: niente pergamena e disegnini del menù stampato | Sembrerebbe amatoriale in un'app |
| Piatti senza foto | Riquadro crema chiaro con l'iniziale | Mario: il marrone era pesante |
| Apertura | Una sola schermata: anello che si disegna, logo di Monica da sfocato a nitido, titolo e «Con Monica» scritti, riflesso; sotto «Powered by» + YNOY scritto a mano **copiato dall'apertura di Jona** (tratti SVG), alla fine le 4 lune in terracotta una alla volta. Circa 5 s, a ogni apertura, un tocco ovunque salta | Mario: niente fumo (fa pasta fresca), niente oro, non troppo lunga |
| Firma | «Powered by» + logo YNOY Corp con le 4 lune (lo stesso di Jona) | Firma di Mario su tutte le sue app |
| Nome app | «Pronti in Tavola con Monica»; in testata «Pronti in Tavola» | Logo di Monica |

## 4. Scelte tecniche
- **Linguaggio**: HTML, CSS e JavaScript semplice, senza framework (come Jona). File: `index.html`, `style.css`, `data.js` (menù, ingredienti, allergeni, stato iniziale), `app.js` (tutta la logica).
- **Dove gira**: nel browser del telefono come **app installabile** (PWA): niente store; il cliente apre il link da WhatsApp. Monica la aggiunge alla schermata Home per le notifiche.
- **Dati oggi**: localStorage del telefono (chiavi `pit-prova-v1` e `pit-telefono-v1`). In `app.js` solo `carica()` e `salva()` toccano i dati: per Firebase si cambia quello strato.
- **Dati domani**: Firebase (come Jona). Sito su Cloudflare Pages.
- **Pagina di prova**: `python3 -I tools/anteprima.py` crea `dist/anteprima.html` con tutto dentro (immagini comprese), pubblicata come artifact.
- **Prove**: `node tools/prova.js` (Playwright, schermo Pixel 7): 19 controlli dal cliente a Monica, tutti verdi sulla v0.7. `node tools/fotogrammi.js`: fotogrammi dell'apertura in `/tmp/pit/`.
- **Immagini** in `media/`: logo di Monica (`logo.png`, `logo-480.webp`, strati `logo-medaglione/titolo/firma.webp`), icone 192/512, firma YNOY di Jona (`ynoy-firma.png`, lune `firma-luna-1..4.png`), logo YNOY caricato da Mario (`ynoy.png`, `ynoy-scritta.png`, `ynoy-luna-1..4.png`, per la firma in fondo alle pagine), originali (`logo-originale.jpg`, `ynoy-originale.jpg`, `menu-vecchio.jpg`).

## 5. Aperto
- Mario: dare all'app Claude su GitHub l'accesso a `pronti-in-tavola` e toccare **Save** (il caricamento era ancora rifiutato alle 08:10 del 05/11).
- Mario: creare il sito su Cloudflare Pages e il progetto Firebase (passi da dare uno alla volta).
- Monica: controllare ingredienti, allergeni e istruzioni dei 23 piatti (bozza di Claude, segnata «Da controllare»); scrivere il ripieno delle impanade; dare il suo numero WhatsApp.
- Mario: numero per «Chiedi a Mario» (va messo nelle impostazioni dell'app, non nel codice).
- Da decidere più avanti: dominio `pronti-in-tavola.app`; consegna a domicilio; durata dell'apertura per i clienti.

## Ultimo messaggio di Mario
«Prepara la CONSEGNA completa di "Pronti in tavola" per passarla a Claude Code. Un solo messaggio, niente riassunti vaghi: 1. Scopo dell'app e chi la usa. 2. Elenco di TUTTE le funzioni decise (fatte / da fare). 3. Tutte le decisioni prese e il perché (grafica, colori, nomi, lingua). 4. Scelte tecniche (linguaggio, dove gira, dove salva i dati). 5. Il codice COMPLETO di ogni file, ognuno con il suo nome file, senza parti tagliate o "...". 6. Domande ancora aperte e cose che dovevo fare io. Se non entra in un messaggio, dividi in parti numerate (1/3, 2/3…) e dimmi quando hai finito.»
