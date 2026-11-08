/* Pronti in Tavola · dati di partenza (menù di Monica, ottobre 2026).
   Ingredienti, dosi e istruzioni sono una BOZZA: ogni piatto ha checked:false finché Monica non lo controlla. */
'use strict';

/* I 14 allergeni di legge (Reg. UE 1169/2011) */
const ALLERGENI = [
  ['glutine', 'Glutine'], ['crostacei', 'Crostacei'], ['uova', 'Uova'], ['pesce', 'Pesce'],
  ['arachidi', 'Arachidi'], ['soia', 'Soia'], ['latte', 'Latte'], ['guscio', 'Frutta a guscio'],
  ['sedano', 'Sedano'], ['senape', 'Senape'], ['sesamo', 'Sesamo'], ['solfiti', 'Solfiti'],
  ['lupini', 'Lupini'], ['molluschi', 'Molluschi']
];

/* Elenco ingredienti: n = nome, a = allergeni, m = carne o pesce (non vegetariano) */
const INGREDIENTI = {
  farina: { n: 'Farina di grano', a: ['glutine'] },
  semola: { n: 'Semola di grano duro', a: ['glutine'] },
  pangrattato: { n: 'Pangrattato', a: ['glutine'] },
  sfoglia: { n: 'Pasta sfoglia', a: ['glutine', 'latte'] },
  sfogliauovo: { n: "Sfoglia all'uovo", a: ['glutine', 'uova'] },
  couscous: { n: 'Cous cous', a: ['glutine'] },
  savoiardi: { n: 'Savoiardi', a: ['glutine', 'uova'] },
  biscotti: { n: 'Biscotti secchi', a: ['glutine', 'latte'] },
  riso: { n: 'Riso', a: [] },
  uova: { n: 'Uova', a: ['uova'] },
  latte: { n: 'Latte', a: ['latte'] },
  burro: { n: 'Burro', a: ['latte'] },
  besciamella: { n: 'Besciamella', a: ['latte', 'glutine'] },
  mozzarella: { n: 'Mozzarella', a: ['latte'] },
  parmigiano: { n: 'Parmigiano', a: ['latte'] },
  pecorino: { n: 'Pecorino', a: ['latte'] },
  ricotta: { n: 'Ricotta', a: ['latte'] },
  formaggio: { n: 'Formaggio fresco', a: ['latte'] },
  gorgonzola: { n: 'Gorgonzola', a: ['latte'] },
  emmenthal: { n: 'Emmenthal', a: ['latte'] },
  mascarpone: { n: 'Mascarpone', a: ['latte'] },
  spalmabile: { n: 'Formaggio spalmabile', a: ['latte'] },
  panna: { n: 'Panna', a: ['latte'] },
  nutella: { n: 'Crema di nocciole e cacao', a: ['guscio', 'latte', 'soia'] },
  noci: { n: 'Noci', a: ['guscio'] },
  mandorle: { n: 'Mandorle', a: ['guscio'] },
  tonno: { n: 'Tonno', a: ['pesce'], m: 1 },
  gamberetti: { n: 'Gamberetti', a: ['crostacei'], m: 1 },
  macinato: { n: 'Carne macinata', a: [], m: 1 },
  carne: { n: 'Carne', a: [], m: 1 },
  pollo: { n: 'Pollo', a: [], m: 1 },
  cotto: { n: 'Prosciutto cotto', a: [], m: 1 },
  strutto: { n: 'Strutto', a: [], m: 1 },
  melanzane: { n: 'Melanzane', a: [] },
  zucchine: { n: 'Zucchine', a: [] },
  carciofi: { n: 'Carciofi', a: [] },
  patate: { n: 'Patate', a: [] },
  spinaci: { n: 'Spinaci', a: [] },
  radicchio: { n: 'Radicchio', a: [] },
  verdure: { n: 'Verdure di stagione', a: [] },
  pomodoro: { n: 'Passata di pomodoro', a: [] },
  cipolla: { n: 'Cipolla', a: [] },
  aglio: { n: 'Aglio', a: [] },
  prezzemolo: { n: 'Prezzemolo', a: [] },
  basilico: { n: 'Basilico', a: [] },
  menta: { n: 'Menta', a: [] },
  carota: { n: 'Carota', a: [] },
  sedano: { n: 'Sedano', a: ['sedano'] },
  peperoni: { n: 'Peperoni', a: [] },
  avocado: { n: 'Avocado', a: [] },
  rucola: { n: 'Rucola', a: [] },
  frutti: { n: 'Frutti di bosco', a: [] },
  marmellata: { n: 'Marmellata', a: [] },
  uvetta: { n: 'Uva passa', a: [] },
  arancia: { n: "Scorza d'arancia", a: [] },
  zucchero: { n: 'Zucchero', a: [] },
  cacao: { n: 'Cacao', a: [] },
  caffe: { n: 'Caffè', a: [] },
  olio: { n: 'Olio extravergine', a: [] },
  oliosemi: { n: 'Olio di semi', a: [] },
  limone: { n: 'Limone', a: [] }
};

const CATEGORIE = [
  ['stuzzichini', 'Stuzzichini'],
  ['primi', 'Primi'],
  ['dolci', 'Dolci']
];

/* Formati: t6/t8 = teglia da 6/8 porzioni, kg = al chilo, pz = al pezzo, intera = torta intera */
const T = (p6, p8) => [
  { id: 't6', tipo: 'teglia', nome: 'Teglia da 6', porzioni: 6, prezzo: p6 },
  { id: 't8', tipo: 'teglia', nome: 'Teglia da 8', porzioni: 8, prezzo: p8 }
];
const KG = (p, min = 0.5, passo = 0.5) => [{ id: 'kg', tipo: 'kg', nome: 'Al chilo', prezzo: p, min, passo }];
const PZ = (p, min = 1, passo = 1) => [{ id: 'pz', tipo: 'pz', nome: 'Al pezzo', prezzo: p, min, passo }];

const PIATTI_INIZIALI = [
  { id: 'polpette-melanzane', cat: 'stuzzichini', nome: 'Polpette di melanzane', formati: KG(11), ing: ['melanzane', 'pangrattato', 'uova', 'pecorino', 'aglio', 'prezzemolo', 'oliosemi'], note: ['Poco sale', 'Ben cotte'] },
  { id: 'polpette-zucchine', cat: 'stuzzichini', nome: 'Polpette di zucchine', formati: KG(11), ing: ['zucchine', 'pangrattato', 'uova', 'parmigiano', 'menta', 'oliosemi'], note: ['Poco sale', 'Senza menta'] },
  { id: 'polpette-tonno', cat: 'stuzzichini', nome: 'Polpette di tonno', formati: KG(12), ing: ['tonno', 'patate', 'pangrattato', 'uova', 'parmigiano', 'prezzemolo', 'oliosemi'], note: ['Poco sale'] },
  { id: 'polpette-carne', cat: 'stuzzichini', nome: 'Polpette di carne', formati: KG(15), ing: ['macinato', 'pangrattato', 'uova', 'parmigiano', 'latte', 'aglio', 'prezzemolo', 'oliosemi'], note: ['Poco sale', 'Senza aglio'] },
  { id: 'involtini', cat: 'stuzzichini', nome: 'Involtini di melanzane e prosciutto', formati: T(15, 20), ing: ['melanzane', 'cotto', 'mozzarella', 'pomodoro', 'parmigiano', 'basilico', 'olio'], note: ['Poco formaggio'] },
  { id: 'sfoglia-zucchine', cat: 'stuzzichini', nome: 'Sfoglia zucchine, prosciutto e mozzarella', formati: T(13, 17), ing: ['sfoglia', 'zucchine', 'cotto', 'mozzarella'], note: [] },
  { id: 'sfoglia-parmigiana', cat: 'stuzzichini', nome: 'Sfoglia alla parmigiana', formati: T(13, 17), ing: ['sfoglia', 'melanzane', 'mozzarella', 'pomodoro', 'parmigiano', 'basilico'], note: [] },
  { id: 'panade-carciofi', cat: 'stuzzichini', nome: 'Panade di carciofi e patate', sotto: 'Medie, tipo oschiresi', formati: PZ(1.5, 2), ing: ['semola', 'strutto', 'carciofi', 'patate', 'aglio', 'prezzemolo', 'olio'], note: [] },
  { id: 'panade-carne', cat: 'stuzzichini', nome: 'Panade di carne', sotto: 'Medie, tipo oschiresi', formati: PZ(1, 2), ing: ['semola', 'strutto', 'carne', 'aglio', 'prezzemolo'], note: [] },
  { id: 'impanade', cat: 'stuzzichini', nome: 'Impanade a mezza luna', sotto: 'Da friggere a casa', aiuto: '1 kg = circa 20 pezzi', formati: KG(15), ing: ['farina', 'strutto', 'carne'], note: [], scalda: 'Friggere in olio di semi ben caldo, pochi pezzi per volta, finché sono dorate.' },
  { id: 'ravioli', cat: 'primi', nome: 'Ravioli freschi', formati: KG(12), varianti: [
    { id: 'ricotta', nome: 'Ricotta', prezzi: { kg: 12 }, ing: ['ricotta'] },
    { id: 'spinaci', nome: 'Spinaci', prezzi: { kg: 13 }, ing: ['spinaci', 'ricotta'] },
    { id: 'formaggio', nome: 'Formaggio', prezzi: { kg: 15 }, ing: ['pecorino', 'formaggio'] }
  ], ing: ['semola', 'farina', 'uova'], note: [], scalda: 'Cuocere in acqua salata bollente per 4-5 minuti.' },
  { id: 'parmigiana', cat: 'primi', nome: 'Melanzane alla parmigiana', formati: T(22, 26), ing: ['melanzane', 'pomodoro', 'mozzarella', 'parmigiano', 'basilico', 'oliosemi'], note: ['Ben gratinata'], scalda: 'Forno a 180 °C per 15-20 minuti.' },
  { id: 'lasagne-semplici', cat: 'primi', nome: 'Lasagne semplici', formati: T(17, 20), ing: ['sfogliauovo', 'besciamella', 'pomodoro', 'parmigiano', 'mozzarella'], note: ['Ben gratinate', 'Poca besciamella'], scalda: 'Forno a 180 °C per 20-25 minuti, coperte con la stagnola.' },
  { id: 'lasagne-ragu', cat: 'primi', nome: 'Lasagne al ragù', formati: T(20, 25), ing: ['sfogliauovo', 'besciamella', 'macinato', 'pomodoro', 'parmigiano', 'cipolla', 'carota', 'sedano', 'olio'], note: ['Ben gratinate', 'Poca besciamella'], scalda: 'Forno a 180 °C per 20-25 minuti, coperte con la stagnola.' },
  { id: 'lasagne-particolari', cat: 'primi', nome: 'Lasagne particolari', formati: T(20, 25), varianti: [
    { id: 'carciofi', nome: 'Carciofi', ing: ['carciofi'] },
    { id: 'verdure', nome: 'Verdure', ing: ['verdure'] },
    { id: 'radicchio', nome: 'Radicchio e gorgonzola', ing: ['radicchio', 'gorgonzola'] },
    { id: 'noci', nome: 'Gorgonzola e noci', ing: ['gorgonzola', 'noci'] }
  ], ing: ['sfogliauovo', 'besciamella', 'parmigiano'], note: ['Ben gratinate'], scalda: 'Forno a 180 °C per 20-25 minuti, coperte con la stagnola.' },
  { id: 'sformato', cat: 'primi', nome: 'Sformato di zucchine', formati: T(12, 15), ing: ['zucchine', 'uova', 'parmigiano', 'pangrattato', 'latte'], note: [] },
  { id: 'insalata-riso', cat: 'primi', nome: 'Insalata di riso estiva', formati: T(20, 25), ing: ['riso', 'gamberetti', 'avocado', 'rucola', 'emmenthal', 'olio', 'limone'], note: ['Senza gamberetti'], stagione: 'estate', disponibile: false },
  { id: 'couscous', cat: 'primi', nome: 'Cous cous pollo e verdure', formati: T(20, 25), ing: ['couscous', 'pollo', 'zucchine', 'peperoni', 'carota', 'cipolla', 'olio'], note: ['Poco piccante'], novita: true },
  { id: 'tiramisu', cat: 'dolci', nome: 'Tiramisù', formati: T(22, 25), ing: ['savoiardi', 'mascarpone', 'uova', 'zucchero', 'caffe', 'cacao'], note: ['Poco cacao sopra'] },
  { id: 'cheesecake-nutella', cat: 'dolci', nome: 'Cheesecake alla Nutella', formati: T(24, 28), ing: ['biscotti', 'burro', 'spalmabile', 'panna', 'nutella'], note: [] },
  { id: 'cheesecake-frutti', cat: 'dolci', nome: 'Cheesecake ai frutti di bosco', formati: T(24, 28), ing: ['biscotti', 'burro', 'spalmabile', 'panna', 'frutti'], note: [] },
  { id: 'crostata', cat: 'dolci', nome: 'Crostata di marmellata', formati: [{ id: 'intera', tipo: 'intera', nome: 'Intera', prezzo: 17 }], ing: ['farina', 'burro', 'zucchero', 'uova', 'marmellata'], note: [] },
  { id: 'papassini', cat: 'dolci', nome: 'Papassini', formati: KG(18), ing: ['farina', 'zucchero', 'uvetta', 'noci', 'mandorle', 'strutto', 'uova', 'arancia'], note: [] }
];

/* Giorni relativi a oggi (per la prova) */
function giornoDa(n) {
  const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function statoIniziale() {
  const piatti = PIATTI_INIZIALI.map((p, i) => Object.assign({
    sotto: '', aiuto: '', varianti: [], note: [], scalda: '', foto: null, disponibile: true,
    stagione: '', novita: false, controllato: false, cuori: 0, pronto: null, ordine: i, cestino: null
  }, JSON.parse(JSON.stringify(p))));
  const P = id => piatti.find(p => p.id === id);
  P('lasagne-ragu').cuori = 21; P('tiramisu').cuori = 14; P('parmigiana').cuori = 9;
  P('lasagne-ragu').pronto = { formato: 't8', qta: 2, giorno: giornoDa(0) };
  P('panade-carciofi').pronto = { formato: 'pz', qta: 12, giorno: giornoDa(0) };

  const riga = (piatto, formato, qta, extra) => {
    const p = P(piatto), f = p.formati.find(x => x.id === formato);
    const v = extra && extra.variante ? p.varianti.find(x => x.id === extra.variante) : null;
    const prezzo = (v && v.prezzi && v.prezzi[formato]) || f.prezzo;
    return Object.assign({ piatto, nome: p.nome, formato, formatoNome: f.nome, tipo: f.tipo, variante: v ? v.id : '', varianteNome: v ? v.nome : '', qta, prezzo, note: [], testo: '' }, extra || {});
  };

  return {
    versione: 1,
    soloContanti: true,
    piatti,
    clienti: [
      { id: 'c1', nome: 'Giulia Rossi', da: giornoDa(-60) },
      { id: 'c2', nome: 'Paolo Sanna', da: giornoDa(-40) },
      { id: 'c3', nome: 'Anna Piras', da: giornoDa(-20) }
    ],
    richieste: [
      { id: 'r1', nome: 'Laura Deiana', tramite: 'Giulia Rossi', il: giornoDa(0), stato: 'nuovo', primo: 'o4', cliente: null },
      { id: 'r2', nome: 'Paolo Sanna', tramite: '', il: giornoDa(0), stato: 'ricollega', primo: null, cliente: 'c2' }
    ],
    ordini: [
      { id: 'o1', n: 1, cliente: 'c1', righe: [riga('lasagne-ragu', 't6', 1), riga('papassini', 'kg', 0.5)], entro: giornoDa(-12), stato: 'ritirato', paga: { metodo: 'contanti', dice: false, ricevuto: true }, nota: '', creato: giornoDa(-14), cuori: {} },
      { id: 'o2', n: 2, cliente: 'c2', righe: [riga('lasagne-ragu', 't8', 1), riga('tiramisu', 't6', 1, { note: ['Poco cacao sopra'] })], entro: giornoDa(2), stato: 'accettato', paga: { metodo: 'contanti', dice: false, ricevuto: false }, nota: 'Passo dopo le 18', creato: giornoDa(-1), cuori: {} },
      { id: 'o3', n: 3, cliente: 'c3', righe: [riga('polpette-carne', 'kg', 1.5, { note: ['Poco sale'] }), riga('parmigiana', 't6', 1)], entro: giornoDa(1), stato: 'nuovo', paga: { metodo: 'bonifico', dice: false, ricevuto: false }, nota: '', creato: giornoDa(0), cuori: {} },
      { id: 'o4', n: 4, cliente: null, utente: 'r1', righe: [riga('parmigiana', 't6', 1)], entro: giornoDa(2), stato: 'daApprovare', pronto: false, paga: { metodo: 'contanti', dice: false, ricevuto: false }, nota: '', creato: giornoDa(0), cuori: {} }
    ],
    prossimoNumero: 5,
    impostazioni: {
      anticipo: 1,
      pausa: { attiva: false, fino: giornoDa(7) },
      limite: { attivo: false, teglie: 10 },
      prontiFino: '20:00',
      natale: { attivo: false, entro: '2026-12-20', piatti: ['papassini', 'tiramisu', 'lasagne-ragu'] },
      paga: { contanti: true, bonifico: false, postepay: false, iban: '', intestataria: 'Monica', telefonoPostepay: '' },
      ritiro: { via: 'Via Libano 53', citta: '07026 Olbia', nota: 'Suona il citofono fuori.' },
      whatsapp: '',
      mario: '',
      indirizzoApp: 'https://pronti-in-tavola.pronti-in-tavola.workers.dev/'
    }
  };
}

/* Versione dell'app e novità: le vede solo lo sviluppatore (Mario 07/11). La prima è la più nuova. */
const VERSIONE_APP = '0.9.13';
/* Novità per versione, divise come nelle note di RVC (Mario 07/11): Nuovo · Migliorato · Corretto */
const NOVITA = [
  { v: '0.9.13', data: '08/11/2026',
    nuovo: ['Solo per Mario: tasto «Prova le AI adesso» che controlla una per una Cloudflare e Groq e dice chi risponde'] },
  { v: '0.9.12', data: '08/11/2026',
    migliorato: ['«Sono qui sotto» con l\'app chiusa: squilla ogni 5 secondi per 1 minuto, con vibrazione lunga, finché la apri'],
    corretto: ['L\'app si bloccava all\'apertura e Mario restava nella parte cliente: ora si apre giusta (e una prova lo controlla sempre)'] },
  { v: '0.9.11', data: '08/11/2026',
    nuovo: ['Sviluppatore: cronologia completa degli aggiornamenti dalla 0.1 a oggi, con le funzioni'] },
  { v: '0.9.10', data: '08/11/2026',
    nuovo: ['Aiutante: quando finiscono le risposte gratuite di Cloudflare passa da solo a Groq (gratuito, 1.000 risposte al giorno), appena c\'è la chiave'],
    migliorato: ['Vapore dopo lo sblocco: alla fine si dirada piano, niente stacco'] },
  { v: '0.9.9', data: '08/11/2026',
    nuovo: ['«Sono qui sotto»: con l\'app aperta il telefono di chi gestisce squilla forte e vibra come una chiamata, con una schermata grande «Ho visto, scendo»; la notifica torna altre 2 volte finché non la apri'],
    migliorato: ['Clienti: il tasto si chiama «Scrivimi»'] },
  { v: '0.9.8', data: '08/11/2026',
    nuovo: ['Aiutante AI per i clienti: allergie, ingredienti, prezzi, stato dell\'ordine, «metti nel carrello» con conferma. Si spegne in Impostazioni → Solo per te, Mario', 'Solo per te, Mario: quante domande all\'AI oggi (chi gestisce e clienti) e i limiti gratuiti spiegati'] },
  { v: '0.9.7', data: '08/11/2026',
    migliorato: ['Aiutante: voce femminile più naturale, dice «controlla e tocca Conferma»; pulsanti «Conferma» e «Lascia stare»; se un\'AI non risponde passa da sola a un\'altra gratuita'],
    corretto: ['«Scrivi a Monica»: nel messaggio c\'è sempre nome e cognome'] },
  { v: '0.9.6', data: '08/11/2026',
    nuovo: ['Clienti: «Scrivi a Monica» su WhatsApp (tasto verde in basso, e in ogni ordine col suo numero), col messaggio già iniziato «Ciao Monica! Ti scrivo dall\'app Pronti in Tavola… Volevo chiederti:»'],
    migliorato: ['Aiutante: cambia le impostazioni (preavviso, teglie al giorno, pronti fino a, Natale, pagamenti, nota del ritiro) sempre con «prima → dopo» e conferma; risponde a «come si fa…» con la guida dell\'app; prepara messaggi per tutte le amiche'] },
  { v: '0.9.5', data: '08/11/2026',
    migliorato: ['Aiutante potenziato: più cose in una frase, ognuna mostrata «prima → dopo» con valori da correggere e spunta per toglierla, un solo «Fai» e un solo Annulla; vede le FOTO (lista scritta a mano, menù, piatto); accetta, rifiuta, propone un altro giorno, segna i pronti, crea piatti nuovi «Da controllare», scrive descrizioni, mette in pausa, prepara messaggi WhatsApp, porta alla pagina giusta e raccoglie le idee per Mario; ricorda le ultime frasi; AI più nuova (Qwen 3.8, consigliata da Cloudflare)'] },
  { v: '0.9.4', data: '08/11/2026',
    nuovo: ['Aiutante di Monica (intelligenza artificiale gratuita): nella Home «Chiedi all\'aiutante…» o il microfono; capisce frasi come «l\'ordine di Laura è pronto», «togli il tiramisù dal menù», «aggiungi la farina alla spesa», risponde a «cosa devo cucinare oggi?» e prima di fare chiede sempre «Faccio?»'] },
  { v: '0.9.3', data: '07/11/2026',
    nuovo: ['«Sono qui sotto»: il cliente arrivato per il ritiro avvisa Monica con un tocco; a lei suona «Laura è qui per il ritiro» e il tocco apre l\'ordine'] },
  { v: '0.9.2', data: '07/11/2026',
    nuovo: ['Lucchetto: tre tempi. Mario e Monica hanno ciascuno il suo («si richiude se esci dall\'app per…»), più uno per gli ospiti che decidono loro due. Mario può cambiare anche quello di Monica'] },
  { v: '0.9.1', data: '07/11/2026',
    nuovo: ['Vapore di cottura dopo lo sblocco: prima non si vede nulla, poi la schermata in penombra e sbuffi a ondate fino a vederla nitida (fluido anche a 120 Hz)',
      'Piatti: «Al forno da Monica» col suo sovrapprezzo, accanto al fritto; il cliente sceglie una cottura',
      'Impostazioni: scheda «Solo per te, Mario» con «Segna come PROVA gli ordini fatti finora» e conferma chiara',
      'Barra sviluppatore: si apre e si chiude scorrendo il dito da sinistra a destra in cima allo schermo',
      'Ordini di prova: «Archivia» con due tocchi (uno o tutti), spariscono dalle schede; «Archiviati» per ripristinarli'],
    migliorato: ['Impostazioni a voci: si vedono i titoli col riassunto, un tocco apre solo quella parte (come la scheda del piatto)', 'Cliente: in fondo «Area riservata» piccola e discreta al posto di «Sei Monica? Entra»; via «(se vuoi)» dalla nota', 'Novità divise in Nuovo, Migliorato e Corretto', 'Nella scheda del piatto «Fritto da te» diventa «Cotto da te»'],
    corretto: ['Il pulsante per segnare le prove era nascosto (7 tocchi + Altre impostazioni)', 'Fine dell\'apertura senza scatto: la Home entra mentre il logo svanisce', 'Impostazioni: «Dove ritirano» con le scritte Via e Città ed esempi; WhatsApp di Monica e numero di Mario spiegati'] },
  { v: '0.9', data: '07/11/2026',
    nuovo: ['Modalità sviluppatore: 7 tocchi sulla firma, guarda come cliente, versione e novità',
      'Ordini di prova: il cliente nuovo sceglie «Ordino davvero» o «Sto solo provando l\'app» prima di inviare',
      'Monica vede le prove col bollino PROVA; non contano negli incassi né nella spesa'],
    migliorato: ['Persona nuova che ordina: a Monica la notifica «accettala» che resta e vibra',
      'Cliente in attesa: «Attendi che Monica accetti» in giallo, sempre visibile',
      'Via il riquadro «Apri in Chrome»: ora «Due tocchi e sei a posto» (installa e notifiche)'],
    corretto: ['Logo di Monica senza bianco dentro le lettere'] },
  { v: '0.8', data: '07/11/2026',
    nuovo: ['Fritto da Monica: sovrapprezzo unico per piatto', 'Proposta di un altro giorno anche per cliente nuovo; avviso «è pronto» al cliente'],
    migliorato: ['Notifiche che aprono il punto giusto; persone nuove subito a Monica', 'Lucchetto dopo 8 minuti'],
    corretto: ['Solo tema chiaro (niente pagina scura); niente lampeggio nelle scelte'] },
  /* cronologia ricostruita l'08/11 dalla storia di GitHub e dalle consegne (Mario 08/11 «la cronologia… fino alla 0.1»):
     la 0.7 è stata un lavoro lungo, diviso qui in tappe per giorno; dalla 0.1 alla 0.6 l'app è nata nella chat di Claude */
  { v: '0.7 · tappa 3', data: '07/11/2026',
    nuovo: ['Notifiche vere degli ordini sul telefono di chi gestisce (con prova e stato «iscritto»)', 'Pagina Ordini a 4 schede (Nuovi · Oggi · Prossimi · Storico) con cerca, filtri e scadenze chiare',
      'Promemoria della sera «domani hai N ordini»', 'Avviso «il tuo ordine è pronto» al cliente', 'Tre biglietti d\'invito in foto per WhatsApp e scheda Inviti nella Home', 'Sito online su Cloudflare, pubblicato da solo'],
    migliorato: ['App ben impaginata anche su tablet Android e iPad', 'Monica propone un altro giorno anche al cliente nuovo', 'Etichette per prodotto, senza nome del cliente'],
    corretto: ['iPhone: medaglione dell\'apertura senza riquadro bianco', 'Testi onesti: niente «ti arriva la notifica» finché non esisteva', 'Menù vuoto: «Monica sta preparando il menù»'] },
  { v: '0.7 · tappa 2', data: '06/11/2026',
    migliorato: ['Etichette per le vaschette: logo, «Buon appetito», trama sarda, bordo a greca con rosette, firma a mano', 'Apertura: «Powered by» e logo YNOY più piccoli e più in basso'] },
  { v: '0.7 · tappa 1', data: '05/11/2026',
    nuovo: ['Dati veri condivisi con Firebase, anche senza rete (modifiche in coda)', 'Lucchetto della parte di Monica: impronta o PIN', 'Benvenuto del cliente nuovo: nome e cognome, poi «Ciao <nome>»',
      'Lista della spesa: dalle dosi e dagli ordini, «La mia lista», «Ho fatto la spesa»', 'Incassi del mese, costo per piatto, immagine del menù per WhatsApp, etichette da stampare',
      'App sul telefono anche senza internet; anteprima del link su WhatsApp col logo'],
    migliorato: ['App più semplice: 2 voci in basso, ritiro dentro «I miei ordini»', 'Sfondo con trama sarda «a pibiones» e bordura a rombi', '«Manda questo piatto a un\'amica»'],
    corretto: ['Monica scrive solo ciò che ha cambiato lei (niente doppioni con due telefoni)'] },
  { v: '0.1 → 0.6', data: '04-05/11/2026',
    nuovo: ['Nata nella chat di Claude: apertura animata, menù vero di 23 piatti (Stuzzichini, Primi, Dolci), «Pronti subito»',
      'Scheda del piatto: gusti, formati (teglia, kg, pezzo, intera), ingredienti, allergeni, note veloci; «Le mie allergie» e testo grande',
      'Carrello con due ritiri e «Mi serve entro…»; I miei ordini con tappe, proposta di giorno, «Cambia l\'ordine», «Ordina di nuovo»',
      'Monica: Home a 4 riquadri, ordini (accetta, proponi, rifiuta), I miei piatti con foto e prezzi, nuovo piatto in 4 passi, clienti, impostazioni (pausa, anticipo, limite, Natale, pagamenti)',
      'Ogni modifica si salva da sola con «Annulla» per 10 secondi'] }
];
