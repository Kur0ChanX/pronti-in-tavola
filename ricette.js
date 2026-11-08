/* Ricettario di Monica (C55, docs/SPEC-RICETTARIO.md): solo per chi gestisce, mai per i clienti.
   Ricette scritte da Claude da zero, parole semplici (niente testi copiati da altri siti).
   Dosi per le porzioni indicate; q = quantità (null = «q.b.», quanto basta), u = unità.
   passi: t = testo; min = minuti per il timer della cucina guidata; disegno = figura del passo. */
const RICETTE = [
  {
    id: 'zuppa-gallurese', nome: 'Zuppa gallurese (suppa cuata)', zona: 'gallura', regione: 'Gallura',
    categoria: 'primi', difficolta: 2, prep: 30, cottura: 60, porzioni: 6,
    intro: 'Il piatto delle feste in Gallura: strati di pane, formaggio e brodo, cotti al forno finché sopra fa la crosticina. Non è una zuppa da cucchiaio: si taglia a quadrotti.',
    ingredienti: [
      { q: 600, u: 'g', nome: 'pane raffermo', nota: 'meglio di semola, a fette di 1 cm' },
      { q: 2, u: 'l', nome: 'brodo di carne', nota: 'di pecora o misto manzo e pollo, ben saporito' },
      { q: 400, u: 'g', nome: 'formaggio vaccino fresco', nota: 'tipo fresa o casizolu, a fettine' },
      { q: 150, u: 'g', nome: 'pecorino sardo stagionato', nota: 'grattugiato' },
      { q: 1, u: 'mazzetto', nome: 'prezzemolo', nota: 'tritato' },
      { q: 1, u: 'cucchiaino', nome: 'cannella in polvere', nota: 'facoltativa, si usa in molti paesi' },
      { q: 1, u: 'pizzico', nome: 'noce moscata' },
      { q: 30, u: 'g', nome: 'burro', nota: 'per la teglia' }
    ],
    passi: [
      { t: 'Accendi il forno a 180 gradi. Imburra bene una teglia alta.', disegno: 'forno' },
      { t: 'Scalda il brodo: deve essere caldo ma non bollente.', disegno: 'pentola' },
      { t: 'Fai un primo strato di fette di pane sul fondo della teglia.', disegno: 'teglia' },
      { t: 'Copri il pane con fettine di formaggio fresco, una manciata di pecorino, un po\' di prezzemolo e, se ti piace, un velo di cannella.', disegno: 'teglia' },
      { t: 'Ripeti gli strati (pane, formaggio, pecorino, prezzemolo) fino a 2 cm dal bordo. L\'ultimo strato è di formaggio.', disegno: 'teglia' },
      { t: 'Versa il brodo piano piano, un mestolo alla volta, finché il pane è inzuppato e il brodo arriva quasi in cima. Aspetta 5 minuti che il pane beva.', min: 5, disegno: 'mestolo' },
      { t: 'Inforna per circa 50 minuti, finché sopra è dorato e croccante. Se si asciuga troppo, aggiungi un mestolo di brodo ai bordi.', min: 50, disegno: 'forno' },
      { t: 'Lasciala riposare 10 minuti fuori dal forno, poi tagliala a quadrotti.', min: 10, disegno: 'coltello' }
    ],
    consigli: ['Il pane deve essere secco di almeno due giorni, sennò diventa una pappa.', 'Il segreto è il brodo: assaggialo, deve essere saporito già da solo.'],
    conserva: 'In frigo 2 giorni, coperta. Si scalda in forno con un goccio di brodo.',
    allergeni: ['glutine', 'latte', 'sedano (nel brodo)'],
    foto: null
  },
  {
    id: 'chjusoni', nome: 'Chjusoni al sugo di salsiccia', zona: 'gallura', regione: 'Gallura',
    categoria: 'primi', difficolta: 2, prep: 60, cottura: 60, porzioni: 6,
    intro: 'Gnocchetti di semola fatti a mano, tipici della Gallura (a volte si chiamano ciciones). Col sugo di salsiccia sono il pranzo della domenica.',
    ingredienti: [
      { q: 500, u: 'g', nome: 'semola di grano duro rimacinata' },
      { q: 250, u: 'ml', nome: 'acqua tiepida', nota: 'più o meno, quanta ne prende' },
      { q: 1, u: 'pizzico', nome: 'sale' },
      { q: 1, u: 'bustina', nome: 'zafferano', nota: 'facoltativo, sciolto nell\'acqua' },
      { q: 400, u: 'g', nome: 'salsiccia fresca' },
      { q: 700, u: 'g', nome: 'passata di pomodoro' },
      { q: 1, u: '', nome: 'cipolla piccola' },
      { q: 3, u: 'cucchiai', nome: 'olio extravergine d\'oliva' },
      { q: 80, u: 'g', nome: 'pecorino sardo grattugiato' },
      { q: null, u: '', nome: 'sale e basilico', nota: 'quanto basta' }
    ],
    passi: [
      { t: 'Metti la semola in una ciotola con il sale. Aggiungi l\'acqua tiepida (con lo zafferano, se lo usi) poco alla volta, impastando.', disegno: 'impastare' },
      { t: 'Impasta almeno 10 minuti, finché la pasta è liscia e soda. Coprila e lasciala riposare 30 minuti.', min: 30, disegno: 'impastare' },
      { t: 'Intanto il sugo: trita la cipolla e falla appassire nell\'olio a fuoco basso.', min: 5, disegno: 'padella' },
      { t: 'Togli la pelle alla salsiccia, sbriciolala nella pentola e falla rosolare finché non è più rosa.', min: 8, disegno: 'padella' },
      { t: 'Aggiungi la passata, un pizzico di sale e qualche foglia di basilico. Cuoci a fuoco basso con il coperchio socchiuso.', min: 45, disegno: 'pentola' },
      { t: 'Taglia un pezzo di pasta e fai un cordoncino grosso come un dito. Tagliane pezzetti di 1 cm.', disegno: 'coltello' },
      { t: 'Schiaccia ogni pezzetto col pollice sul tagliere (o sul cestino di vimini) trascinandolo: si arrotola e fa le righe. Mettili su un vassoio infarinato.', disegno: 'impastare' },
      { t: 'Cuoci i chjusoni in tanta acqua salata che bolle: quando vengono a galla, contane ancora 3-4 minuti e assaggia.', min: 4, disegno: 'pentola' },
      { t: 'Scolali, condiscili col sugo e tanto pecorino.', disegno: 'mestolo' }
    ],
    consigli: ['Si possono fare il giorno prima e lasciare asciugare su un telo infarinato.', 'Si congelano crudi, sparsi sul vassoio; poi si buttano ancora congelati nell\'acqua.'],
    conserva: 'Crudi: 1 giorno all\'aria o 2 mesi in freezer. Cotti e conditi: 2 giorni in frigo.',
    allergeni: ['glutine', 'latte'],
    foto: null
  },
  {
    id: 'culurgiones', nome: 'Culurgiones di patate e menta', zona: 'sarda', regione: 'Ogliastra',
    categoria: 'primi', difficolta: 3, prep: 90, cottura: 10, porzioni: 6,
    intro: 'Ravioli dell\'Ogliastra ripieni di patate, pecorino e menta, chiusi «a spiga». Ci vuole pazienza, ma sono il piatto che fa dire «wow».',
    ingredienti: [
      { q: 500, u: 'g', nome: 'semola di grano duro rimacinata', nota: 'per la pasta' },
      { q: 250, u: 'ml', nome: 'acqua tiepida' },
      { q: 1, u: 'cucchiaio', nome: 'olio extravergine d\'oliva', nota: 'per la pasta' },
      { q: 1, u: 'kg', nome: 'patate a pasta gialla' },
      { q: 200, u: 'g', nome: 'pecorino sardo', nota: 'metà fresco e metà stagionato, grattugiato' },
      { q: 1, u: 'mazzetto', nome: 'menta fresca' },
      { q: 2, u: 'spicchi', nome: 'aglio' },
      { q: 4, u: 'cucchiai', nome: 'olio extravergine d\'oliva', nota: 'per il ripieno' },
      { q: 700, u: 'g', nome: 'passata di pomodoro', nota: 'per il sugo semplice' },
      { q: null, u: '', nome: 'sale', nota: 'quanto basta' }
    ],
    passi: [
      { t: 'Lessa le patate con la buccia in acqua salata finché la forchetta entra facile.', min: 35, disegno: 'pentola' },
      { t: 'Intanto impasta semola, acqua, olio e un pizzico di sale per 10 minuti. Copri la pasta e lasciala riposare.', min: 30, disegno: 'impastare' },
      { t: 'Scalda l\'olio con l\'aglio schiacciato per 2 minuti, poi togli l\'aglio: questo olio profumato va nel ripieno.', min: 2, disegno: 'padella' },
      { t: 'Sbuccia le patate ancora calde e schiacciale. Aggiungi pecorino, olio all\'aglio e la menta tritata fine. Assaggia: deve essere saporito. Fai raffreddare.', disegno: 'ciotola' },
      { t: 'Fai palline di ripieno grandi come una noce.', disegno: 'ciotola' },
      { t: 'Stendi la pasta sottile (circa 2 mm) e ritaglia dischi di 8-9 cm con un bicchiere.', disegno: 'mattarello' },
      { t: 'Metti una pallina al centro del disco e tienilo nella mano. Piega i bordi in alto e chiudi pizzicando prima un lato e poi l\'altro, a zig zag, dal basso verso la punta: viene la spiga. Chiudi bene la punta.', disegno: 'impastare' },
      { t: 'Prepara un sugo semplice: passata, un filo d\'olio e sale, 20 minuti a fuoco basso.', min: 20, disegno: 'pentola' },
      { t: 'Cuoci i culurgiones in acqua salata a bollore leggero (se bolle forte si aprono): 6-7 minuti da quando salgono a galla.', min: 7, disegno: 'pentola' },
      { t: 'Scolali con la schiumarola, condisci con il sugo e pecorino.', disegno: 'mestolo' }
    ],
    consigli: ['La spiga all\'inizio viene storta: va bene lo stesso, l\'importante è che sia chiusa bene.', 'Si congelano crudi su un vassoio infarinato, poi in sacchetto.'],
    conserva: 'Crudi: 2 mesi in freezer (si cuociono congelati, 2 minuti in più). Cotti: 1 giorno in frigo.',
    allergeni: ['glutine', 'latte'],
    foto: null
  },
  {
    id: 'seadas', nome: 'Seadas (sebadas) con miele', zona: 'sarda', regione: 'Sardegna',
    categoria: 'dolci', difficolta: 2, prep: 60, cottura: 15, porzioni: 8,
    intro: 'Grandi ravioli di pasta col formaggio fresco e la scorza di limone, fritti e coperti di miele caldo. Dolce e salato insieme.',
    ingredienti: [
      { q: 500, u: 'g', nome: 'semola di grano duro rimacinata' },
      { q: 50, u: 'g', nome: 'strutto', nota: 'o burro morbido' },
      { q: 220, u: 'ml', nome: 'acqua tiepida' },
      { q: 1, u: 'pizzico', nome: 'sale' },
      { q: 600, u: 'g', nome: 'formaggio vaccino fresco acidulo', nota: 'tipo casizolu o fresa, un po\' asciutto' },
      { q: 2, u: '', nome: 'limoni non trattati', nota: 'solo la scorza grattugiata' },
      { q: 150, u: 'g', nome: 'miele', nota: 'meglio di corbezzolo o millefiori sardo' },
      { q: 1, u: 'l', nome: 'olio di semi di arachide', nota: 'per friggere' }
    ],
    passi: [
      { t: 'Grattugia il formaggio con la grattugia a fori grossi (o taglialo a pezzetti) e mescolalo con la scorza di limone.', disegno: 'ciotola' },
      { t: 'Scalda il formaggio in un pentolino a fuoco basso mescolando, finché diventa una pasta filante. Stendila su carta forno alta 1 cm e falla raffreddare.', min: 5, disegno: 'padella' },
      { t: 'Impasta semola, strutto, sale e acqua per 10 minuti. Copri e lascia riposare.', min: 30, disegno: 'impastare' },
      { t: 'Ritaglia dal formaggio freddo dischi di 7-8 cm.', disegno: 'coltello' },
      { t: 'Stendi la pasta sottile (2 mm). Metti un disco di formaggio, copri con altra pasta e premi bene tutto intorno per far uscire l\'aria.', disegno: 'mattarello' },
      { t: 'Ritaglia con un bicchiere grande o una rotella, lasciando 1 cm di bordo. Chiudi bene i bordi con la forchetta.', disegno: 'coltello' },
      { t: 'Scalda l\'olio in padella alta (è pronto quando un pezzetto di pasta frigge subito). Friggi una o due seadas alla volta, 2 minuti per lato, finché sono dorate.', min: 4, disegno: 'friggere' },
      { t: 'Scolale su carta assorbente. Scalda il miele 1 minuto e versalo sopra. Si mangiano calde.', disegno: 'mestolo' }
    ],
    consigli: ['Se il formaggio è troppo umido le seadas si aprono in frittura: lascialo scolare qualche ora.', 'Crude si congelano benissimo, divise da carta forno.'],
    conserva: 'Crude: 2 mesi in freezer, si friggono congelate a fuoco un po\' più basso. Fritte: vanno mangiate subito.',
    allergeni: ['glutine', 'latte'],
    foto: null
  },
  {
    id: 'malloreddus', nome: 'Malloreddus alla campidanese', zona: 'sarda', regione: 'Campidano',
    categoria: 'primi', difficolta: 1, prep: 15, cottura: 45, porzioni: 4,
    intro: 'Gnocchetti sardi con sugo di salsiccia, zafferano e pecorino. Facile e sempre amato: con i malloreddus già pronti si fa in meno di un\'ora.',
    ingredienti: [
      { q: 400, u: 'g', nome: 'malloreddus', nota: 'gnocchetti sardi secchi' },
      { q: 300, u: 'g', nome: 'salsiccia fresca', nota: 'meglio sarda, al finocchietto' },
      { q: 500, u: 'g', nome: 'passata di pomodoro' },
      { q: 1, u: '', nome: 'cipolla piccola' },
      { q: 1, u: 'bustina', nome: 'zafferano' },
      { q: 3, u: 'cucchiai', nome: 'olio extravergine d\'oliva' },
      { q: 80, u: 'g', nome: 'pecorino sardo grattugiato' },
      { q: null, u: '', nome: 'sale e basilico', nota: 'quanto basta' }
    ],
    passi: [
      { t: 'Trita la cipolla e falla appassire nell\'olio a fuoco basso.', min: 5, disegno: 'padella' },
      { t: 'Aggiungi la salsiccia sbriciolata senza pelle e falla rosolare bene.', min: 8, disegno: 'padella' },
      { t: 'Versa la passata, lo zafferano sciolto in un cucchiaio d\'acqua calda, sale e basilico. Cuoci a fuoco basso.', min: 30, disegno: 'pentola' },
      { t: 'Cuoci i malloreddus in tanta acqua salata per il tempo scritto sulla confezione. Assaggia prima di scolare.', min: 12, disegno: 'pentola' },
      { t: 'Scolali, mescolali nel sugo per un minuto e servi con tanto pecorino.', disegno: 'mestolo' }
    ],
    consigli: ['Il sugo è più buono il giorno dopo: si può preparare prima.'],
    conserva: 'Sugo: 3 giorni in frigo o 3 mesi in freezer. Pasta condita: 2 giorni in frigo.',
    allergeni: ['glutine', 'latte'],
    foto: null
  }
];
