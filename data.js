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
const VERSIONE_APP = '0.9.67';
/* Novità per versione, divise come nelle note di RVC (Mario 07/11): Nuovo · Migliorato · Corretto */
const NOVITA = [
  { v: '0.9.67', data: '08/11/2026',
    nuovo: ['Impostazioni → Notifiche: chi gestisce vede gli ultimi avvisi mandati (ora, cosa, a quanti telefoni) e se questo telefono è iscritto davvero'],
    corretto: ['L\'avviso «Persona nuova da accettare» parte sempre, anche se arriva subito dopo un altro'] },
  { v: '0.9.66', data: '08/11/2026',
    corretto: ['Clienti non ancora confermati da Monica: «Attiva le notifiche» non va più in giro continuo. Il sì resta ricordato e le notifiche partono da sole appena Monica conferma'] },
  { v: '0.9.65', data: '08/11/2026',
    nuovo: ['Clienti: appena entrano sale «Installa l\'app sul telefono»: scelgono iPhone o Android, seguono la guida e poi attivano le notifiche. «Più tardi» lo chiude fino alla prossima apertura'] },
  { v: '0.9.64', data: '08/11/2026',
    nuovo: ['Guida iPhone a figure: un disegno per passo con la freccia sul tasto giusto, per iOS 27, 26, 18 e Chrome'] },
  { v: '0.9.63', data: '08/11/2026',
    migliorato: ['Guida iPhone: «Lascia acceso Apri come app web e tocca Aggiungi» (iOS 26), così l\'icona apre l\'app e non Safari'] },
  { v: '0.9.62', data: '08/11/2026',
    nuovo: ['Clienti: in cima al menù «Lo stesso dell\'ultima volta?» con «Ordina di nuovo» in un tocco'],
    migliorato: ['Clienti: «Metti l\'app sul telefono» arriva dopo il primo ordine (prima solo il menù, niente distrazioni)', 'Android: la finestra per installare l\'app è quella grande, con le foto dell\'app'] },
  { v: '0.9.61', data: '08/11/2026',
    migliorato: ['Cliente che mette l\'app nella schermata Home dopo essersi registrato: l\'app la riconosce da sola («Sei Sabrina Rossi? Sì, sono io», un tocco)'],
    corretto: ['Stessa persona registrata nel browser e poi nell\'app installata: Monica vede una sola richiesta e il suo Sì fa un solo cliente, mai doppioni'] },
  { v: '0.9.60', data: '08/11/2026',
    nuovo: ['Impostazioni → «Parti del menù»: Monica rinomina, sposta e aggiunge le parti (es. «Secondi»); una parte con dei piatti non si toglie', 'A voce all\'aiutante: «aggiungi la parte secondi» (anche senza rete), poi conferma', 'Impostazioni: saluto in cima al menù, frase della pausa, altri modi di pagare (es. Satispay), messaggio d\'invito per gli amici, titolo e sottotitolo del biglietto'],
    migliorato: ['Piatti dal ricettario nella parte «Secondi» se c\'è'] },
  { v: '0.9.59', data: '08/11/2026',
    migliorato: ['Clienti: al posto del tasto «Installa l\'app» una guida corta in 3 passi, con le schede iPhone e Android (si apre già sulla giusta, ma si può cambiare; su iPhone dice di scorrere in giù per «Aggiungi alla schermata Home», come nel manuale Apple). Su Android, dove il telefono lo permette, resta il tasto che installa con un tocco'] },
  { v: '0.9.58', data: '08/11/2026',
    nuovo: ['Impostazioni: 14 regole nuove che Monica cambia da sola (avviso in cima al menù, giorni di chiusura, ora limite, giorni avanti, ordine minimo, orari di ritiro, nota dei clienti, durata «Novità», aiutante dei clienti, i 3 messaggi WhatsApp e la firma, tempo di «Annulla»)', 'In cima a Impostazioni «🔎 Cerca un\'impostazione»', 'L\'aiutante porta a ognuna di queste voci e le può cambiare (tu confermi)'] ,
    migliorato: ['Invito su WhatsApp per le amiche: «la mia cucina casalinga»'] },
  { v: '0.9.57', data: '08/11/2026',
    corretto: ['Clienti con iPhone e un browser diverso da Safari (Chrome, Google…): i passi giusti per mettere l\'app sul telefono', 'Primi passi: scritto chiaro che per ordinare non serve installare l\'app'] },
  { v: '0.9.56', data: '08/11/2026',
    nuovo: ['Aiutante di Monica: «come cambio la foto della parmigiana?» → ti porta dritta lì, apre la voce giusta e ti dice cosa toccare (funziona anche senza internet)', 'Se una cosa non si può ancora cambiare dall\'app, l\'aiutante prepara il messaggio WhatsApp per Mario con tutti i dettagli'] },
  { v: '0.9.55', data: '08/11/2026',
    nuovo: ['Panade: le dosi si scrivono per un impasto da 12 pezzi (il numero si cambia nella scheda del piatto), la lista della spesa fa i conti da sola'] },
  { v: '0.9.54', data: '08/11/2026',
    corretto: ['Ricettario: entrando dalla Home parti sempre dall\'alto, con le ricette; il punto di prima torna solo con «Indietro» da una ricetta'] },
  { v: '0.9.53', data: '08/11/2026',
    migliorato: ['Indietro: torni allo stesso punto della pagina dove eri (anche dopo aver modificato una ricetta), non più in cima',
      'Ricettario: tasto fisso «🗄 Database» in basso a destra, un tocco e sei al riquadro del database; lì diventa «⬆ Ricette» per tornare su'] },
  { v: '0.9.52', data: '08/11/2026',
    migliorato: ['Voce Paola sul telefono: ora lavora a parte, così l\'app non si blocca mentre prepara la frase (prima la pagina restava ferma qualche secondo, ora quasi niente)'] },
  { v: '0.9.51', data: '08/11/2026',
    migliorato: ['Aggiornamenti: l\'app non si riavvia più da sola. Compare un avviso in basso: finisci quello che stai facendo e tocca «Riavvia»; salva e torna nella stessa pagina'],
    nuovo: ['Foto dei piatti: prima di salvarla si apre «Sistema la foto». Puoi ritagliarla (come nel menù, quadrata o intera), spostarla col dito, ingrandirla, ruotarla, cambiare luce e colori; «✨ Migliora» le dà il ritocco caldo'] },
  { v: '0.9.50', data: '08/11/2026',
    nuovo: ['«🗄 Il mio database»: controllo di TUTTE le ricette caricate (passi, foto, ingredienti), da solo ogni giorno o subito col tasto «🔍 Controlla tutte»; quelle da sistemare le rilegge da sola da GialloZafferano'],
    corretto: ['Ricette di GialloZafferano: nell\'ultimo passo non entrano più le «Domande e risposte» né la pubblicità; le lettere accentate come «È» e le virgolette «“ ”» si leggono giuste'] },
  { v: '0.9.49', data: '08/11/2026',
    migliorato: ['Quanto ti costa un piatto: i prezzi si scrivono lì, toccando l\'ingrediente (prima diceva di cercare una matita nella lista della spesa)'] },
  { v: '0.9.48', data: '08/11/2026',
    nuovo: ['Per Mario: il numero della versione è sempre in vista in alto a destra, con l\'ora in piccolo; un tocco apre gli aggiornamenti'],
    corretto: ['Aggiornamenti dell\'app: l\'ora di ogni versione è quella vera, presa da sola quando l\'app va online (prima era scritta a mano e poteva sbagliare)'] },
  { v: '0.9.47', data: '08/11/2026',
    corretto: ['Foto dei passi: il numerino ora lo prende dal nome della foto di GialloZafferano, così è giusto anche quando la frase salta un numero (controllate 253 ricette)'] },
  { v: '0.9.46', data: '08/11/2026', ora: '16:05',
    corretto: ['Ricette vecchie di GialloZafferano: le foto dei passi «1-3» ora si vedono tutte, una per numerino (prima solo quella di mezzo)', 'Gesto indietro del telefono (swipe dal bordo): torna indietro nell\'app invece di chiuderla; nella prima schermata ti avvisa e chiude solo al secondo gesto'] },
  { v: '0.9.45', data: '08/11/2026',
    nuovo: ['Voce: in «Voce che legge» c\'è «Voce Google del telefono», seconda scelta dopo Paola. Si sente la voce italiana di Google del telefono, anche senza rete'] },
  { v: '0.9.44', data: '08/11/2026', ora: '15:30',
    corretto: ['Cucina guidata: la pagina del passo non resta più vuota mentre parla la voce'] },
  { v: '0.9.43', data: '08/11/2026', ora: '15:10',
    nuovo: ['L\'app si aggiorna da sola: quando c\'è una versione nuova te lo dice, si riavvia e riparte dalla stessa schermata'],
    migliorato: ['Dosi dei piatti a teglia: le scrivi per la teglia da 6 e la teglia da 8 la calcola l\'app (quelli al chilo restano al chilo)'] },
  { v: '0.9.42', data: '08/11/2026', ora: '15:00',
    corretto: ['Ricette: controllate tutte le 69 dell\'elenco. Pastiera, Melanzane ripiene e Spaghetti con la bottarga perdevano frasi o un passo intero: ora sono complete come su GialloZafferano', 'Le ricette già salvate nell\'archivio si rileggono da sole, 5 ogni 10 minuti; quelle sul telefono alla prima apertura con la rete'] },
  { v: '0.9.41', data: '08/11/2026', ora: '14:35',
    corretto: ['Passi delle ricette: il punto finale non va più a capo da solo dopo il numerino'] },
  { v: '0.9.40', data: '08/11/2026', ora: '14:25',
    corretto: ['Ricette uguali a GialloZafferano: tornano i numerini 1, 2, 3 che legano ogni frase alla sua foto (prima si perdevano) e niente più spazi strani prima dei punti', 'Le ricette già salvate sul telefono si rileggono da sole la prima volta che le apri con la rete'] },
  { v: '0.9.39', data: '08/11/2026', ora: '13:45',
    nuovo: ['Ricettario: «⚙️ Più filtri e ordina» con ⏱ fino a 30 minuti o 1 ora, 👌 facili, e ordina per nuove, A-Z o più veloci', 'Quante ricette trovi e «✕ Azzera i filtri»; i filtri restano come li hai lasciati', 'Cerca con 2-3 ingredienti anche fra le ricette arrivate dal motore'] },
  { v: '0.9.38', data: '08/11/2026', ora: '12:55',
    corretto: ['«Prova le AI adesso»: Cloudflare sembrava spento, ma la prova dava troppo poco spazio alla risposta; ora se una AI non risponde dice il perché'] },
  { v: '0.9.37', data: '08/11/2026', ora: '12:40',
    nuovo: ['Velocità della voce: la sceglie Mario in «Solo per te, Mario» (da 0,7 a 1,3, con «▶️ Senti») e vale anche per Monica; di base un po\' più lenta di prima'] },
  { v: '0.9.36', data: '08/11/2026', ora: '12:16',
    nuovo: ['Ricettario: le ricette che il motore trova entrano da sole (🆕 per 7 giorni), solo quelle complete (almeno 3 ingredienti, 2 passi e la foto); «⚡ Carica 100 ricette adesso», sarde per prime ma miste, lo fa il server anche a telefono chiuso', 'Le ricette scritte a mano vanno sul server: le vede anche Monica (senza rete partono appena torna)'],
    migliorato: ['«🗄 Il mio database» più chiaro: nel ricettario, nuove, in arrivo, sul telefono e se è tutto salvato'] },
  { v: '0.9.35', data: '08/11/2026', ora: '12:03',
    nuovo: ['Foto originali: quando Monica carica la foto di un piatto o del menù, l\'app ne tiene anche una copia a piena qualità (parte appena c\'è rete); Mario la scarica da «Solo per te, Mario» → «📷 Foto originali di Monica», la ritocca e la ricarica. Restano 60 giorni'],
    migliorato: ['Le foto caricate da Mario non vengono più ritoccate dall\'app (sono già sistemate da lui)'] },
  { v: '0.9.34', data: '08/11/2026', ora: '11:47',
    corretto: ['Motore delle ricette fermo su «Ricette sarde»: GialloZafferano ha tolto quella pagina; ora usa la loro ricerca «sardegna» e, se una pagina non c\'è più, passa da solo alla sezione dopo', 'Motore: sarde in priorità ma miste alle altre (una pagina sarda e una di un\'altra sezione); in «🗄 Il mio database» vedi a che pagina sono le sarde e a che sezione le altre'] },
  { v: '0.9.33', data: '08/11/2026', ora: '11:39',
    migliorato: ['Voce: tolte dalla scelta le voci Microsoft (non rispondevano più); chi le aveva scelte ora sente Paola, la voce sul telefono'] },
  { v: '0.9.32', data: '08/11/2026', ora: '11:45',
    corretto: ['Voce Paola: sul sito vero lo scarico falliva («Failed to fetch»): il sito dei modelli rifiutava le richieste dal nostro indirizzo; ora si scarica'] },
  { v: '0.9.31', data: '08/11/2026', ora: '11:40',
    nuovo: ['Voce automatica: la voce di base è Paola (Piper), vera e italiana; l\'app la scarica da sola sul telefono di chi gestisce la prima volta che apre il Ricettario (94 MB, con qualunque rete), senza toccare nulla; poi legge anche senza rete'],
    corretto: ['Kokoro tolto dalle voci: in italiano non legge (il suo programma sa solo l\'inglese); torna quando funziona'] },
  { v: '0.9.30', data: '08/11/2026', ora: '11:10',
    nuovo: ['Ricettario: «🗄 Il mio database» in vista, senza cambiare pagina: quante ricette ha trovato il motore, quante nel tuo ricettario (e quante aggiunte oggi), quante sul telefono, quante con la voce; stato del motore con avanzamento e le ultime trovate; «🔄 Cerca adesso»'],
    migliorato: ['Voce che legge: se Microsoft non risponde lo dice chiaro (per questo le voci sembravano uguali) e consiglia una voce sul telefono; scegliendo una voce non ancora scaricata chiede di scaricarla invece di parlare con quella del telefono'] },
  { v: '0.9.29', data: '08/11/2026', ora: '10:42',
    nuovo: ['Voci sul telefono (Piper: Paola e Riccardo · Kokoro: Sara e Nicola): in Cucina guidata → «Voce che legge» scegli una voce «sul telefono», tocca «⬇️ Scarica la voce» una volta sola (50-100 MB, meglio col Wi-Fi) e da lì legge anche senza rete, anche in aereo'],
    migliorato: ['Se la voce di Microsoft non risponde, legge la voce scaricata sul telefono (prima: sempre quella del telefono)'] },
  { v: '0.9.28', data: '08/11/2026', ora: '10:22',
    nuovo: ['Ricettario in ordine: una sola ricerca, i filtri in una riga, l\'elenco subito; «🔎 Scopri» con le ricette nuove, il catalogo e i temi; «➕ Aggiungi al mio ricettario» (uguale su tutti i telefoni)',
      'Pagina «🗄 Database ricette»: quante ricette hai, quante nuove, quali hanno la voce sul telefono, il motore con «🔄 Cerca adesso» e la barra di avanzamento'],
    corretto: ['«▶️ Ascolta la ricetta passo passo»: la voce parte da sola al primo passo (prima bisognava toccare «Ripeti»)'] },
  { v: '0.9.27', data: '08/11/2026',
    nuovo: ['Ricettario: «🗄 Il tuo database» sul server dell\'app: cresce da solo ogni 10 minuti con le ricette di GialloZafferano, salva per sempre ogni ricetta aperta e ogni lettura della voce (senza doppioni). «Sfoglia», «Ferma» e «Riprendi»'],
    migliorato: ['Se GialloZafferano non risponde, ricette e ricerche arrivano dal tuo database', 'Cucina guidata: la voce legge il passo e poi il consiglio («di\' avanti»), così le letture si riusano'] },
  { v: '0.9.26', data: '08/11/2026',
    nuovo: ['Ricettario: «💾 Copia di sicurezza»: salva in un file ricette tue, note e preferite e riprendile su un altro telefono (si uniscono, niente si cancella)'] },
  { v: '0.9.25', data: '08/11/2026',
    nuovo: ['Ricettario: «📥 Scarica» con un tocco tutto l\'elenco o i risultati di una ricerca o del catalogo: testi e foto sul telefono, le apri anche senza rete',
      'Ricettario: «📥 Sul telefono» mostra le ricette scaricate; ogni giorno, col Wi-Fi, l\'app scarica da sola le nuove (si può spegnere)'] },
  { v: '0.9.24', data: '08/11/2026',
    nuovo: ['Voce vera: la cucina guidata e l\'aiutante leggono con voci umane (Isabella, Elsa, Giuseppe, Diego); si sceglie in «Voce che legge». Senza rete o se il servizio non risponde, legge la voce del telefono'] },
  { v: '0.9.23', data: '08/11/2026',
    nuovo: ['Ricettario: «🎲 Cosa cucino oggi?» ti propone una ricetta (più spesso preferite e sarde), «Un\'altra» per cambiarla',
      'Timer della cucina sempre in vista: esci dalla ricetta e in alto resta la barretta col tempo che manca; un tocco ti riporta al passo'] },
  { v: '0.9.22', data: '08/11/2026',
    nuovo: ['Ricettario: «➕ Metti nel menù» crea il piatto dalla ricetta (nome già scritto, tu scegli come lo vendi e il prezzo); nella scheda del piatto «📖 Apri la ricetta»'] },
  { v: '0.9.21', data: '08/11/2026',
    nuovo: ['Ricettario: cerca a voce (tocca 🎙 e di\' «seadas» o «zucchine e uova»)', 'Ricettario: «🕘 Viste di recente», le ultime ricette aperte, anche senza rete'] },
  { v: '0.9.20', data: '08/11/2026',
    nuovo: ['Catalogo: «Ricette sarde» e «Per ingrediente» (27 ingredienti: melanzane, ricotta, pecorino sardo, cozze, agnello…), sempre con «Carica altre ricette»'],
    migliorato: ['Se una sezione di GialloZafferano cambia o non c\'è, l\'app cerca da sola la stessa cosa a parole: il catalogo non resta mai vuoto'] },
  { v: '0.9.19', data: '08/11/2026',
    nuovo: ['Ricettario: «Tutto il catalogo» di GialloZafferano per portata (antipasti, primi, secondi, dolci, lievitati…) con «Carica altre ricette» senza fine',
      'Cucina guidata: scegli la voce che legge fra quelle del telefono (le «online» sono le più naturali)'],
    migliorato: ['Voce più naturale: tono normale, frasi corte una dopo l\'altra, «g» letto «grammi», «q.b.» letto «quanto basta»',
      'Più risultati in ogni ricerca: «Carica altre ricette» in fondo'] },
  { v: '0.9.18', data: '08/11/2026',
    nuovo: ['Ricettario: «Cosa cucino con quello che ho?» scrivi 2 o 3 ingredienti (es. zucchine, uova) e trovi le ricette che li usano',
      'Ricettario: «Le tue note» su ogni ricetta, anche di GialloZafferano (es. «metà zucchero»); le rivedi nella cucina guidata',
      'Cucina guidata: più timer insieme, anche di ricette diverse, ognuno col suo «Ferma»; timer veloci da 5 a 45 minuti in ogni passo',
      'Esplora GialloZafferano: 40 temi, con più piatti sardi (culurgiones, fregola, porceddu, carasau, bottarga, mirto…)'],
    migliorato: ['Le ricette dell\'elenco senza foto prendono quella della ricetta già aperta'] },
  { v: '0.9.17', data: '08/11/2026',
    nuovo: ['Ricettario: foto dei passaggi che si ingrandiscono (tocca, scorri col dito, allarga con due dita)',
      'Ricettario: «Esplora GialloZafferano» con 24 temi (dolci sardi, pasta fresca, pesce, torte salate…) che si aprono nell\'app',
      'Ricettario: «Ispirate ai tuoi piatti», ricette simili a quelle del tuo menù, aggiornate ogni giorno',
      'Cucina guidata a mani libere: la voce legge un passo e si ferma; tu dici «avanti», «indietro», «ripeti», «timer», «quanto manca», «ingredienti», «finito»'] },
  { v: '0.9.16', data: '08/11/2026',
    nuovo: ['Ricettario con GialloZafferano DENTRO l\'app: cerchi una ricetta, la apri qui con video nel lettore dell\'app, ingredienti e foto dei passaggi, senza uscire',
      'Ricette tue: scrivi nome, ingredienti e passi (anche con foto), le trovi in «Le mie»',
      'Preferite: con la stella restano sul telefono e si aprono anche senza rete'],
    migliorato: ['Incolli un link di GialloZafferano nella ricerca e la ricetta si apre nell\'app', 'Interruttore «Ricettario nella Home» in «Solo per te, Mario»'],
    corretto: ['Le ricette con «:» nel nome della pagina ora si aprono'] },
  { v: '0.9.15', data: '08/11/2026',
    migliorato: ['Ricettario nascosto per ora: le ricette devono essere ufficiali (Mario 08/11), si sceglie la strada'] },
  { v: '0.9.14', data: '08/11/2026',
    nuovo: ['Ricettario per Monica e Mario: ricette sarde e italiane passo passo, porzioni che si ricalcolano, cucina guidata con voce e timer, ingredienti nella lista della spesa (prime 5 ricette)'] },
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
/* Ora italiana in cui ogni versione è andata online (dal git), per la cronologia (Mario 08/11: «anche l'orario»).
   Dalla 0.9.46 l'ora NON si scrive più a mano: la mette tools/sito.py in PUBBLICATE (qui sotto). Le versioni prima della 0.9 hanno solo la data. */
/* ORA VERA (Mario 08/11 ~16:00 «aggiorna l'orario e risolvilo dalla base»: l'ora scritta a mano era sbagliata, 15:50 alle 15:00).
   La riempie da sola tools/sito.py quando pubblica: versione → 'gg/mm/aaaa HH:MM' italiana; la versione online = ora della pubblicazione,
   le altre = ora del commit che l'ha creata. Qui vuota: nell'anteprima valgono `data`/`ora` scritti nelle voci. Non scriverla a mano. */
const PUBBLICATE = {};
const ORE_NOVITA = { '0.9.28': '10:22', '0.9.27': '09:31', '0.9.26': '09:03', '0.9.25': '09:00', '0.9.24': '08:47', '0.9.23': '08:20', '0.9.22': '07:49',
  '0.9.21': '07:23', '0.9.20': '06:59', '0.9.19': '06:34', '0.9.18': '06:23', '0.9.17': '06:03', '0.9.16': '05:26', '0.9.15': '04:52',
  '0.9.14': '04:39', '0.9.13': '04:22', '0.9.12': '04:03', '0.9.11': '03:56', '0.9.10': '03:46', '0.9.9': '03:41', '0.9.8': '03:33',
  '0.9.7': '03:18', '0.9.6': '03:11', '0.9.5': '03:03', '0.9.4': '02:46', '0.9.3': '23:57', '0.9.2': '23:23', '0.9.1': '21:07', '0.9': '18:49' };
