# Ricettario di Monica · specifica (C55)

Chiesto da Mario l'08/11/2026 ~04:20: «ricettario tipo GialloZafferano per Monica… ricette italiane, anche la cucina sarda che è molto importante… passo passo con foto… lo vedono Monica e io, non i clienti».
Scelte di Mario (08/11 ~04:35): **60 ricette** all'inizio, poi a gruppi · **foto vere e libere** (Wikimedia Commons) per il piatto finito + **disegni semplici** per i passi · ricette di Monica (anche dettate all'aiutante): **più avanti**.

## Chi lo vede
- Solo chi gestisce (Monica e Mario). I clienti non lo vedono e non scaricano nemmeno il file delle ricette.
- Entrata: Home di chi gestisce → riquadro «Ricettario» (accanto a «I miei piatti»).

## Da dove vengono le ricette
- Le scrive Claude da zero, parole semplici, frasi corte. **Mai copiare** testi o foto di GialloZafferano o altri siti (sono protetti; ingredienti e passi di base sono di tutti).
- File `ricette.js` nel repo (niente Firebase, niente costi): si carica solo per chi gestisce e funziona anche senza rete (service worker).
- Foto del piatto: Wikimedia Commons con licenza libera, rimpicciolite (~800 px, webp) in `media/ricette/`; sotto la foto «Foto: <autore> · <licenza>» col link (obbligo della licenza CC BY-SA). Nessuna foto adatta → disegno.
- Per scaricare da Commons serve un User-Agent proprio (senza: errore 429, provato l'08/11).

## Com'è fatta una ricetta (dati)
`{ id, nome, zona: 'gallura'|'sarda'|'italiana', regione, categoria: 'antipasti'|'primi'|'secondi'|'contorni'|'dolci'|'pane', difficolta: 1-3, prep, cottura (minuti), porzioni, ingredienti: [{ q, u, nome, nota }], passi: [{ t, min?, disegno? }], consigli: [], conserva, allergeni: [], foto: { file, autore, licenza, link } }`

## Funzioni (prima versione)
1. **Elenco**: cerca per nome o ingrediente; filtri grandi «Gallura · Sarde · Italiane», categoria, «pronta in meno di 30 minuti»; ⭐ preferite in cima.
2. **Scheda**: foto, tempi, difficoltà, **porzioni +/-** che ricalcola le dosi, ingredienti da spuntare, passi numerati con disegno, consigli, allergeni.
3. **Cucina guidata**: un passo per schermata a caratteri grandi, schermo sempre acceso (Wake Lock), la voce femminile dell'aiutante legge il passo, «Avanti / Indietro / Ripeti» grandi (e a voce dove il telefono lo permette), **timer** toccando «10 minuti» nel testo, con suono anche ad app in secondo piano.
4. **«Metti nella lista della spesa»**: ingredienti con le porzioni scelte → `spesa.js`.
5. **«Diventa un piatto del menù»**: crea il piatto con nome, foto e dosi (Monica poi mette il prezzo).
6. **Aiutante**: «cosa cucino con patate e salsiccia?», «come si fanno i culurgiones?» → cerca nel ricettario e apre la ricetta.

## Lotti
- **L1**: struttura, elenco, scheda, porzioni, cucina guidata, spesa, 15 ricette (10 Gallura/sarde, 5 italiane) con foto. Prove + foto a Mario.
- **L2**: +25 ricette, «Diventa un piatto», aiutante. **L3**: +20 ricette (totale 60).
- Più avanti (Mario): ricette di Monica, anche dettate.

## Elenco proposto (60)
- **Gallura e Sardegna (25)**: zuppa gallurese (suppa cuata), chjusoni al sugo, mazza frissa, culurgiones, malloreddus alla campidanese, fregola con arselle, fregola al pomodoro e salsiccia, pane frattau, maccarrones de busa al sugo, porceddu al forno, agnello con carciofi, favata, burrida, calamari ripieni, polpo e patate, aragosta alla catalana, panadas, minestrone sardo con fregola, seadas, pardulas, papassinos, amaretti sardi, gueffus, aranzada, torta di ricotta sarda.
- **Italiane (35)**: lasagne, parmigiana di melanzane, carbonara, amatriciana, ragù alla bolognese, pasta al forno, cannelloni, pesto alla genovese, pasta alla norma, pasta e fagioli, minestrone, risotto alla milanese, gnocchi di patate, arancini, polpette al sugo, polpettone, cotoletta alla milanese, scaloppine al limone, saltimbocca, pollo alla cacciatora, spezzatino con patate, ossobuco, involtini, vitello tonnato, melanzane ripiene, frittata di verdure, peperonata, insalata di mare, pizza, focaccia, tiramisù, panna cotta, crostata di marmellata, torta di mele, ciambellone.

## Occhio critico
- Due persone insieme: il ricettario è di sola lettura (preferite sul telefono), nessun conflitto.
- Senza rete: file e foto nella cache; la voce e il microfono possono mancare → i tasti restano.
- Peso: 60 foto × ~60 KB ≈ 3,6 MB, scaricate solo da chi gestisce e solo quando apre la ricetta.
- Allergeni: indicati con prudenza, «controlla sempre le etichette».

## Ricerca 08/11/2026 ~05:00 (Mario: «ricette vere, ufficiali, con foto delle preparazioni, gold standard»)
- **GialloZafferano** (Mondadori Digital): nessuna API; testi e foto protetti → niente copia né lettura automatica. Ma ha un **canale YouTube ufficiale** (@GialloZafferanoTV, ~2,8 milioni di iscritti, ~6.000 videoricette, anche sarde: «Culurgionis d'Ogliastra» con un pastificio di Tortolì). Incorporare i video YouTube è permesso dalle regole di YouTube (lettore ufficiale, salvo blocco del proprietario); le miniature dei video si possono mostrare col video.
- **API di ricette**: Spoonacular ed Edamam solo in inglese, regole strette (cache 1 ora, niente copie); Pepesto: ricette con licenza permanente, anche italiane, ma a pagamento (prova 10 ricette 15 €) e **immagini fatte dall'AI** (non foto vere).
- **Strada consigliata «Ricettario ufficiale a video»**: scheda = videoricetta ufficiale incorporata + miniatura vera + tasto «Ricetta completa con le foto dei passaggi» che apre la pagina ufficiale di GialloZafferano; da noi preferiti, «è la ricetta del mio piatto», dosi di Monica per la spesa, note di Monica. Gratis. Rischio: un video tolto → la scheda lo dice e resta il link.
- Il codice di `ricettario.js` (elenco, filtri, preferiti, spesa) si riusa; la cucina guidata coi nostri testi no (sarebbero di nuovo testi di Claude).
