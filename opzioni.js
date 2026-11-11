/* ================= IMPOSTAZIONI IN PIÙ (C88, Mario 08/11 «aggiungi tantissime impostazioni… così non siamo vincolati al codice») =================
   Un elenco unico: ogni voce sa dove si vede, il suo valore di base (= come funziona oggi), i limiti e le parole per l'aiutante.
   Si salvano in S.impostazioni.<chiave> (un campo per chiave in impostazioni/app). Spiegazione in docs/SPEC-IMPOSTAZIONI.md.
   Caricato dopo data.js e prima di app.js: app.js può chiamare opz() direttamente. */
const GRUPPI_OPZ = [['clienti', 'Menù e ordini dei clienti'], ['messaggi', 'Messaggi WhatsApp ai clienti'], ['cucina', 'Per te in cucina']];
const GIORNI_SETT = [[1, 'Lunedì'], [2, 'Martedì'], [3, 'Mercoledì'], [4, 'Giovedì'], [5, 'Venerdì'], [6, 'Sabato'], [0, 'Domenica']];
const PARTI_BASE = CATEGORIE.map(c => c.slice());   // le parti del menù di base (data.js): Monica le rinomina, le sposta, ne aggiunge (C92)
const PAROLE_MSG = [['nome', 'il nome del cliente'], ['n', 'il numero dell\'ordine'], ['giorno', 'il giorno del ritiro'], ['totale', 'il totale'],
  ['indirizzo', 'il tuo indirizzo'], ['mappa', 'il link per arrivare'], ['nota', 'come trovarti'], ['orari', 'gli orari di ritiro'], ['link', 'il link dell\'app']];
const OPZIONI = [
  { k: 'avviso', g: 'clienti', nome: 'Avviso in cima al menù', tipo: 'testo', max: 160, def: '', es: 'es. Questa settimana niente fritti',
    aiuto: 'Una frase che i clienti vedono subito, in cima al menù. Vuota = nessun avviso.', parole: /avviso|in cima al menu|scritta per i client|comunicazion|annunci/ },
  { k: 'giorniChiusi', g: 'clienti', nome: 'Giorni in cui non si ritira', tipo: 'giorni', def: [],
    aiuto: 'Tocca i giorni in cui sei chiusa ogni settimana: i clienti non possono sceglierli.', parole: /chius[oa] (la |il )?(domenic|luned|marted|mercoled|gioved|venerd|sabat)|giorn[oi] di (chiusura|riposo)|non lavoro (la |il )|riposo/ },
  { k: 'oraLimite', g: 'clienti', nome: 'Ora limite per ordinare', tipo: 'ora', def: '',
    aiuto: 'Dopo quest\'ora il primo giorno che il cliente può scegliere slitta di uno. Vuota = nessuna ora limite.', parole: /ora limite|entro che ora|fino a che ora (si puo|possono) ordin|ordin\w* (la sera|tardi)/ },
  { k: 'giorniAvanti', g: 'clienti', nome: 'Quanti giorni avanti si ordina', tipo: 'numero', min: 3, max: 60, def: 14, unita: 'giorni',
    aiuto: 'Quanti giorni vedono i clienti quando scelgono il giorno del ritiro.', parole: /giorni avanti|troppo avanti|quanti giorni (vedono|possono)|settimane prima/ },
  { k: 'minimo', g: 'clienti', nome: 'Ordine minimo', tipo: 'euro', min: 0, max: 200, def: 0,
    aiuto: 'Sotto questa cifra il cliente non può mandare l\'ordine. 0 = nessun minimo.', parole: /minimo|ordini (troppo )?piccoli/ },
  { k: 'orari', g: 'clienti', nome: 'Orari di ritiro', tipo: 'testo', max: 80, def: '', es: 'es. dalle 17 alle 20',
    aiuto: 'Li leggono i clienti quando scelgono il giorno (e nei messaggi con {orari}). Vuoto = non si vede.', parole: /orari|a che ora (ritir|vengon|passan)|fascia/ },
  { k: 'notaClienti', g: 'clienti', nome: 'Nota dei clienti', tipo: 'si', def: true,
    aiuto: 'Acceso: nel carrello il cliente può scriverti una nota.', parole: /nota (del|dei) client|scriver\w* (una )?nota|commento/ },
  { k: 'novitaGiorni', g: 'clienti', nome: 'Quanto dura «Novità»', tipo: 'numero', min: 1, max: 60, def: 14, unita: 'giorni',
    aiuto: 'Quanti giorni resta l\'etichetta «Novità» su un piatto.', parole: /quanto dura (la |l.etichetta )?novit|giorni (della )?novit/ },
  { k: 'aiClienti', g: 'clienti', nome: 'Aiutante per i clienti', tipo: 'si', def: true,
    aiuto: 'Acceso: i clienti possono chiedere all\'aiutante (allergie, cosa ordinare, a che punto è l\'ordine).', parole: /aiutante (per i|dei) client/ },
  { k: 'voceClientiFab', g: 'clienti', nome: 'Microfono fisso per i clienti', tipo: 'si', def: true, aiuto: 'Acceso: nel menù e nel carrello c\'è un microfono sempre a portata di dito, per ordinare e chiedere a voce.', parole: /microfono (fisso|grande|nel menu)|tasto (del )?microfono|comando vocale|voce dei client/ },
  { k: 'voceClientiRisponde', g: 'clienti', nome: 'L\'aiutante risponde a voce ai clienti', tipo: 'si', def: true, aiuto: 'Acceso: quando il cliente parla, la risposta viene anche letta a voce.', parole: /rispond\w* a voce|legge le risposte|voce dell.aiutante/ },
  { k: 'voceClientiConferma', g: 'clienti', nome: '«Sì» detto a voce mette nel carrello', tipo: 'si', def: true, aiuto: 'Acceso: dopo la proposta l\'aiutante chiede «Lo metto nel carrello?» e basta dire sì. L\'ordine parte comunque solo con «Invia».', parole: /si a voce|conferma a voce|senza toccare/ },
  { k: 'voceClientiSecondi', g: 'clienti', nome: 'Silenzio che chiude l\'ascolto preciso', tipo: 'numero', min: 2, max: 6, def: 3, unita: 'secondi', aiuto: 'Quanti secondi di silenzio aspetta l\'ascolto preciso prima di capire la frase.', parole: /secondi di silenzio|ascolto (troppo )?(lungo|corto)|si ferma (troppo )?(presto|tardi)/ },
  /* (Mario 09/11 «è sparito… uno deve cliccare per forza uno dei due»): dopo C93/C97 le persone sono accettate PRIMA del primo ordine
     e la scelta, che valeva solo per chi non era accettato, non usciva più: un amico che provava ha mandato un ordine vero */
  { k: 'chiediProva', g: 'clienti', nome: 'Chiedi «Ordini davvero o provi l\'app?»', tipo: 'scelta',
    scelte: [['tutti', 'A tutti, a ogni ordine'], ['nuovi', 'Solo a chi non hai ancora accettato'], ['mai', 'Mai']], def: 'tutti',
    aiuto: 'Prima di inviare il cliente deve toccare una delle due: «Ordino davvero» o «Sto solo provando l\'app». Nessuna è già segnata. Le prove ti arrivano con la scritta PROVA e non si cucinano.',
    parole: /solo provando|ordin\w* (davvero|di prova)|prova(re)? l'app|ordini? (finti|per prova)/ },
  { k: 'voceClientiMotore', g: 'clienti', nome: 'Come ascolta i clienti', tipo: 'scelta', scelte: [['auto', 'Da sola: telefono, poi ascolto preciso se serve'], ['telefono', 'Solo il telefono'], ['preciso', 'Sempre l\'ascolto preciso (sul server)']], def: 'auto', aiuto: 'L\'ascolto preciso capisce meglio i nomi sardi e le frasi lunghe, ma passa dal server.', parole: /ascolto preciso|motore (della |di )?voce|come ascolta/ },
  { k: 'voceClientiSinonimi', g: 'clienti', nome: 'Parole dei clienti per i piatti', tipo: 'testo', max: 400, def: '', es: 'es. sebadas=seadas, culurgionis=culurgiones', aiuto: 'Come i clienti chiamano i tuoi piatti, se diverso dal menù: «parola detta=parola del menù», separate da virgola.', parole: /sinonim|parole (dei|per i) piatt|come (li )?chiamano/ },
  { k: 'parti', g: 'clienti', nome: 'Parti del menù', tipo: 'parti', def: () => PARTI_BASE.map(c => c.slice()),
    aiuto: 'I nomi e l\'ordine delle parti del menù (Stuzzichini, Primi, Dolci…). Puoi aggiungerne una, es. «Secondi». Una parte con dei piatti dentro non si toglie: prima sposta i piatti.',
    perAI: 'valore = elenco dei nomi delle parti in ordine, separati da virgola (es. "Stuzzichini, Primi, Secondi, Dolci")',
    parole: /parti del menu|(parte|categori\w*|sezion\w*) (del menu|nuov|in piu)|(aggiung|mett|crea|togli|rinomin|spost)\w* (la |una |le )?(parte|parti|categori\w*|sezion\w*)/ },
  { k: 'saluto', g: 'clienti', nome: 'Saluto in cima al menù', tipo: 'testo', max: 50, def: () => `Benvenuti da ${cuoca()}!`, vuotoDiBase: true,
    aiuto: 'La frase in alto, sotto «Pronti in Tavola», per chi non ha ancora scritto il suo nome (chi l\'ha scritto legge «Ciao Laura!»). Vuota = quella di base.', parole: /saluto|benvenut/ },
  { k: 'pausaTesto', g: 'clienti', nome: 'Frase della pausa', tipo: 'testo', max: 140, def: 'Puoi già ordinare per i giorni dopo.', vuotoDiBase: true,
    aiuto: 'Quando sei in pausa i clienti leggono «… è in pausa fino a…» e sotto questa frase. Vuota = quella di base.', parole: /(frase|testo|scritta|messaggio) (della |di )?pausa/ },
  { k: 'altroPagare', g: 'clienti', nome: 'Altri modi di pagare', tipo: 'testo', max: 120, def: '', es: 'es. Satispay al 333 1234567',
    aiuto: 'Un modo di pagare in più, scritto da te: i clienti lo leggono nel carrello, sotto «Come paghi». Vuoto = non si vede.', parole: /satispay|paypal|altr[oi] mod[oi] (di|per) pagar|pagare con (la )?carta/ },
  { k: 'msgAccettato', g: 'messaggi', nome: 'Messaggio «ordine confermato»', tipo: 'messaggio', max: 600, def: 'Ciao {nome}! Ho confermato il tuo ordine n. {n} per {giorno}.',
    aiuto: 'Lo mandi su WhatsApp quando accetti un ordine.', parole: /messaggio (di |della |del )?conferm/ },
  { k: 'msgPronto', g: 'messaggi', nome: 'Messaggio «ordine pronto»', tipo: 'messaggio', max: 600, def: 'Ciao {nome}! Il tuo ordine n. {n} è pronto.\nTotale: {totale}\nRitira qui: {indirizzo}\n{mappa}\n{nota}',
    aiuto: 'Lo mandi su WhatsApp quando l\'ordine è pronto.', parole: /messaggio (di |del )?pront/ },
  { k: 'msgProposta', g: 'messaggi', nome: 'Messaggio «ti propongo un altro giorno»', tipo: 'messaggio', max: 600, def: 'Ciao {nome}! Per il tuo ordine n. {n} ti propongo {giorno}. Rispondi dall\'app con un tocco: {link}',
    aiuto: 'Lo mandi su WhatsApp quando proponi un altro giorno.', parole: /messaggio (per |di |del )?(propost|altro giorno)/ },
  { k: 'invitoAmici', g: 'messaggi', nome: 'Messaggio d\'invito per gli amici', tipo: 'messaggio', max: 600, pm: ['link'], senzaFirma: true,
    def: () => `Ciao! Sono ${cuoca()} 🍝 Ho aperto Pronti in Tavola, la mia cucina casalinga: guardi il menù coi prezzi, ordini con pochi tocchi e passi da me a ritirare.\n\nTocca qui:\n{link}`,
    aiuto: 'Il messaggio che parte con «Invita gli amici». Se togli {link} il link lo metto io in fondo.', parole: /messaggio (d.|per l.|dell.)?invit|invit\w* (per )?(gli |i )?amic/ },
  { k: 'bigliettoTitolo', g: 'messaggi', nome: 'Biglietto d\'invito: titolo', tipo: 'testo', max: 40, def: 'Assaggia la mia cucina!', vuotoDiBase: true,
    aiuto: 'La scritta grande del biglietto che mandi agli amici. Vuota = quella di base.', parole: /biglietto|cartolina|immagine (dell.|d.)?invit/ },
  { k: 'bigliettoSotto', g: 'messaggi', nome: 'Biglietto d\'invito: sottotitolo', tipo: 'testo', max: 60, def: 'Piatti fatti a mano da me, pronti da ritirare', vuotoDiBase: true,
    aiuto: 'La riga sotto il titolo del biglietto. Vuota = quella di base.', parole: /sottotitolo (del )?biglietto|biglietto/ },
  { k: 'firma', g: 'messaggi', nome: 'Firma dei messaggi', tipo: 'testo', max: 60, def: () => `${cuoca()} · Pronti in Tavola`, vuotoDiBase: true,
    aiuto: 'Va in fondo a ogni messaggio ai clienti. Vuota = quella di base.', parole: /\bfirma\b/ },
  { k: 'annullaSecondi', g: 'cucina', nome: 'Tempo per «Annulla»', tipo: 'numero', min: 5, max: 30, def: 10, unita: 'secondi',
    aiuto: 'Dopo un cambio, per quanti secondi resta il tasto «Annulla» in basso.', parole: /tasto annulla|tempo per annull|annullare (dopo|se sbaglio)/ },
  /* (C109, PT E41) solo per Mario, in «Solo per te, Mario»: il gruppo 'mario' non è in GRUPPI_OPZ, Monica e il suo aiutante non le vedono.
     Il server le legge da impostazioni/app (worker.js limitiAIC, con gli stessi tetti) */
  { k: 'aicAvviso', g: 'mario', nome: 'Aiutante dei clienti: segnalazione', tipo: 'numero', min: 10, max: 200, def: 30, unita: 'domande al giorno',
    aiuto: 'Quando un cliente supera questo numero di domande in un giorno ti arriva una segnalazione (di nuovo al doppio). Il cliente NON viene mai fermato.' },
  { k: 'aicRidotto', g: 'mario', nome: 'Aiutante dei clienti: risposte semplici', tipo: 'numero', min: 20, max: 1000, def: 100, unita: 'domande al giorno',
    aiuto: 'Oltre questo numero (o con 10 domande in un minuto) a quel cliente risponde il telefono, senza AI: ordini, prezzi, allergie. Non viene fermato e ti arriva una segnalazione. Vale solo se è più alto della segnalazione.' },
  { k: 'ascoltoAvviso', g: 'mario', nome: 'Microfono dei clienti: segnalazione', tipo: 'numero', min: 10, max: 500, def: 40, unita: 'frasi al giorno',
    aiuto: 'Quando un cliente supera questo numero di frasi dette al microfono in un giorno ti arriva una segnalazione (di nuovo al doppio). Il cliente NON viene mai fermato.' },
  /* C136 (Mario 10/11 «a manuale poco alla volta»): quante ricette legge il server a ogni carico a mano (il server taglia a 50) */
  { k: 'ricCarico', g: 'mario', nome: 'Ricettario: ricette per ogni carico', tipo: 'numero', min: 5, max: 50, def: 20, unita: 'ricette', parole: /ricette per (ogni )?carico|carica altre/,
    aiuto: 'Quante ricette nuove legge il server quando tocchi «⚡ Carica altre» nel database o «🔍 Cerca altre» in Proteiche. Poche alla volta = meno letture gratuite del server consumate.' },
  /* C124 soglie di «🏋️ Proteiche» nel Ricettario (valori per porzione; fonti in docs/lavori-in-corso/c124-ricettario-proteico.md) */
  { k: 'fitProt', g: 'mario', nome: 'Proteiche: pasto da', tipo: 'numero', min: 10, max: 60, def: 25, unita: 'g di proteine a porzione', parole: /protei|palestr|\bfit/,
    aiuto: 'C141: da queste proteine a porzione una proteica è un «pasto» (Pranzo, Cena); sotto, e sotto le calorie di «snack e dolci», è uno snack o un dolce. 25 g: ISSN 2017 dice 20-40 g a pasto.' },
  { k: 'fitProtPerc', g: 'mario', nome: 'Pagella: proteine verdi dal', tipo: 'numero', min: 10, max: 60, def: 25, unita: '% delle calorie', parole: /protei|palestr|\bfit/,
    aiuto: 'C141: nella pagella le proteine sono 🟢 da questa parte delle calorie in su (25%: scelta di Mario 10/11), 🟡 dalla soglia d\'entrata.' },
  { k: 'fitEntraPerc', g: 'mario', nome: 'Proteiche: entrano dal', tipo: 'numero', min: 10, max: 50, def: 20, unita: '% delle calorie', parole: /protei|palestr|\bfit|entra/,
    aiuto: 'C141 (Mario 11/11 «fai passare tutte le ricette proteiche»): entra in «🏋️ Proteiche» ogni ricetta con almeno questa parte delle calorie dalle proteine. 20%: regola UE per «ad alto contenuto di proteine» (Reg. CE 1924/2006).' },
  { k: 'pagVerde', g: 'mario', nome: 'Pagella: verde fino al', tipo: 'numero', min: 5, max: 40, def: 15, unita: '% del giorno', parole: /pagell|voto|semafor|calori|grass|zucche|\bsale\b/,
    aiuto: 'C141: calorie, grassi saturi, zuccheri e sale di una porzione sono 🟢 fino a questa parte del fabbisogno di un giorno (UE: 2000 kcal, 20 g saturi, 90 g zuccheri, 6 g sale). 15%: stima di Claude.' },
  { k: 'pagGiallo', g: 'mario', nome: 'Pagella: giallo fino al', tipo: 'numero', min: 10, max: 60, def: 30, unita: '% del giorno', parole: /pagell|voto|semafor|calori|grass|zucche|\bsale\b/,
    aiuto: 'C141: oltre il verde e fino a qui 🟡, oltre 🔴. 30%: come i semafori delle etichette inglesi (rosso oltre il 30% a porzione).' },
  /* C125 (Mario 10/11 «un po' più severe… anche ricette dolci proteiche, snack»): chi non passa come pasto può entrare come snack o dolce */
  { k: 'fitSnackKcal', g: 'mario', nome: 'Proteiche: snack e dolci fino a', tipo: 'numero', min: 100, max: 600, def: 300, unita: 'kcal a porzione', parole: /protei|palestr|\bfit|snack|dolc/,
    aiuto: 'Fino a queste calorie, e sotto le proteine del «pasto», una proteica è uno snack o un dolce (Spuntino, Merenda, Dopo cena). 300: stima di Claude.' },
  { k: 'fitSnackProt', g: 'mario', nome: 'Proteiche: proteine minime', tipo: 'numero', min: 5, max: 40, def: 8, unita: 'g a porzione', parole: /protei|palestr|\bfit|snack|dolc/,
    aiuto: 'C141: sotto queste proteine a porzione una ricetta non entra in «🏋️ Proteiche», anche se in proporzione ne ha tante. 8 g: stima di Claude.' },
  { k: 'fitVeloci', g: 'mario', nome: 'Proteiche: «⚡ Pronte in…»', tipo: 'numero', min: 5, max: 30, def: 10, unita: 'minuti', parole: /protei|palestr|\bfit|veloc|minut|immediat/,
    aiuto: 'Il tasto «⚡ Pronte in 10 minuti» della sezione «🏋️ Proteiche» mostra le ricette pronte entro questi minuti (tempo totale della ricetta). Mario 10/11: «ricette immediate».' }
];
const OPZ = Object.fromEntries(OPZIONI.map(o => [o.k, o]));
const baseOpz = o => typeof o.def === 'function' ? o.def() : Array.isArray(o.def) ? o.def.slice() : o.def;

/* un valore scritto da Monica (o dall'AI) → il valore giusto, o undefined se non va bene */
function valoreOpz(o, v) {
  switch (o.tipo) {
    case 'numero': case 'euro': {
      const n = Number(String(v).replace(',', '.'));
      if (!Number.isFinite(n) || n < o.min || n > o.max) return undefined;
      return o.tipo === 'euro' ? Math.round(n * 100) / 100 : Math.round(n);
    }
    case 'si': return v === true || v === 'true' || v === 'sì' || v === 'si' ? true : v === false || v === 'false' || v === 'no' ? false : undefined;
    case 'ora': { const t = String(v || '').trim(); return t === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : undefined; }
    case 'parti': return valoreParti(v);
    case 'scelta': return o.scelte.some(([k]) => k === v) ? v : undefined;
    case 'giorni': { const a = (Array.isArray(v) ? v : String(v || '').split(',')).map(Number); return a.every(x => Number.isInteger(x) && x >= 0 && x <= 6) && a.length < 7 ? [...new Set(a)].sort() : undefined; }
    default: return String(v == null ? '' : v).replace(/[<>]/g, '').slice(0, o.max || 200);
  }
}
/* il valore di adesso (quello di base se non è mai stato cambiato o non va bene) */
function opz(k) {
  const o = OPZ[k], v = S && S.impostazioni ? S.impostazioni[k] : undefined;
  if (!o) return undefined;
  if (v === undefined || v === null) return baseOpz(o);
  const ok = valoreOpz(o, v);
  if (ok === undefined || ((o.tipo === 'messaggio' || o.vuotoDiBase) && !String(ok).trim())) return baseOpz(o);
  return ok;
}
const cambiataOpz = k => { const v = opz(k), b = baseOpz(OPZ[k]); return JSON.stringify(v) !== JSON.stringify(b); };
function testoOpz(o, v) {
  switch (o.tipo) {
    case 'numero': return `${v} ${o.unita || ''}`.trim();
    case 'euro': return v ? euro(v) : 'Nessun minimo';
    case 'si': return v ? 'Acceso' : 'Spento';
    case 'ora': return v || 'Nessuna';
    case 'giorni': return v.length ? GIORNI_SETT.filter(([n]) => v.includes(n)).map(([, t]) => t).join(', ') : 'Nessuno: sempre aperta';
    case 'parti': return v.map(c => c[1]).join(', ');
    case 'scelta': return (o.scelte.find(([k]) => k === v) || ['', v])[1];
    case 'messaggio': return cambiataOpz(o.k) ? 'Scritto da te' : 'Quello di base';
    default: return v ? `«${v.length > 50 ? v.slice(0, 50) + '…' : v}»` : 'Vuoto';
  }
}
/* parti del menù: un elenco di nomi (o di [chiave, nome]) → [[chiave, nome], …]; i nomi già usati tengono la loro chiave */
const partiSalvate = () => { const v = S && S.impostazioni && S.impostazioni.parti;   // senza passare da opz(): eviterebbe un giro infinito
  return Array.isArray(v) && v.length && v.every(c => Array.isArray(c) && /^[a-z0-9]{1,30}$/.test(c[0]) && typeof c[1] === 'string') ? v : PARTI_BASE; };
function valoreParti(v) {
  const ora = partiSalvate(), usate = new Set();
  const lista = (Array.isArray(v) ? v : String(v == null ? '' : v).split(/[,\n]/)).map(x => Array.isArray(x) ? x : [null, x]);
  const out = [];
  for (const [k0, n0] of lista) {
    const nome = String(n0 == null ? '' : n0).replace(/[<>"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 30);
    if (!nome) continue;
    const sn = semplOpz(nome);
    if (out.some(c => semplOpz(c[1]) === sn)) return undefined;   // due parti con lo stesso nome
    let k = k0 && /^[a-z0-9]{1,30}$/.test(k0) ? k0 : ((ora.find(c => semplOpz(c[1]) === sn) || PARTI_BASE.find(c => semplOpz(c[1]) === sn && !ora.some(x => x[0] === c[0])) || [])[0]);
    if (!k || usate.has(k)) { const b = sn.replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'parte'; k = b; for (let i = 2; usate.has(k) || ora.some(c => c[0] === k) || lista.some(x => x[0] === k); i++) k = b + i; }
    usate.add(k); out.push([k, nome.charAt(0).toUpperCase() + nome.slice(1)]);
  }
  return out.length >= 1 && out.length <= 12 ? out : undefined;
}
/* le parti tolte che hanno ancora dei piatti (anche spenti): non si possono togliere */
const partiPiene = v => opz('parti').filter(([k]) => !v.some(c => c[0] === k) && S.piatti.some(p => !p.cestino && p.cat === k));
/* CATEGORIE (data.js) segue le parti di Monica; una parte con piatti che non c'è più torna in fondo, così nessun piatto sparisce */
function applicaParti() {
  const v = opz('parti').map(c => c.slice());
  (S.piatti || []).forEach(p => { if (!p.cestino && p.cat && !v.some(c => c[0] === p.cat)) v.push((PARTI_BASE.find(c => c[0] === p.cat) || [p.cat, p.cat.charAt(0).toUpperCase() + p.cat.slice(1)]).slice()); });
  CATEGORIE.splice(0, CATEGORIE.length, ...v);
}
/* le parole tra graffe dei messaggi → i valori veri */
const riempi = (t, val) => String(t).replace(/\{(\w+)\}/g, (m, k) => (k in val ? String(val[k] == null ? '' : val[k]) : m));

/* ---------- in Impostazioni: una voce per impostazione, a gruppi, con la ricerca in cima ---------- */
function sezOpz(o) {
  const v = opz(o.k), campo = `data-campo="o.${o.k}"`;
  let dentro = `<p class="tenue" style="margin:0">${esc(o.aiuto)}</p>`;
  if (o.tipo === 'testo') dentro += `<input type="text" ${campo} maxlength="${o.max}" value="${esc(S.impostazioni[o.k] == null ? (o.vuotoDiBase ? '' : v) : S.impostazioni[o.k])}" placeholder="${esc(o.es || (o.vuotoDiBase ? baseOpz(o) : ''))}" aria-label="${esc(o.nome)}">`;
  if (o.tipo === 'numero' || o.tipo === 'euro') dentro += `<div class="fila"><input type="number" ${campo} inputmode="${o.tipo === 'euro' ? 'decimal' : 'numeric'}" min="${o.min}" max="${o.max}" step="${o.tipo === 'euro' ? '0.5' : '1'}" value="${v}" style="max-width:120px" aria-label="${esc(o.nome)}"><span class="tenue">${o.tipo === 'euro' ? 'euro' : esc(o.unita || '')} (da ${o.min} a ${o.max})</span></div>`;
  if (o.tipo === 'si') dentro += `<label class="interr"><span>${esc(o.nome)}</span><input type="checkbox" ${campo} ${v ? 'checked' : ''}></label>`;
  if (o.tipo === 'ora') dentro += `<div class="fila"><input type="time" ${campo} value="${esc(v)}" style="max-width:140px" aria-label="${esc(o.nome)}">${v ? `<button type="button" class="link" data-a="o-base" data-k="${o.k}">Togli l'ora</button>` : ''}</div>`;
  if (o.tipo === 'scelta') dentro += `<div class="scelte">${o.scelte.map(([k, t]) => `<button type="button" class="chip" data-a="o-scelta" data-k="${o.k}" data-v="${k}" aria-pressed="${v === k}">${esc(t)}</button>`).join('')}</div>`;
  if (o.tipo === 'giorni') dentro += `<div class="scelte">${GIORNI_SETT.map(([n, t]) => `<button type="button" class="chip" data-a="o-giorno" data-k="${o.k}" data-v="${n}" aria-pressed="${v.includes(n)}">${t}</button>`).join('')}</div>`;
  if (o.tipo === 'parti') {
    dentro += v.map(([k, n], i) => { const quanti = S.piatti.filter(p => !p.cestino && p.cat === k).length;
      return `<div class="fila parte-riga"><input type="text" data-campo="op.${k}" maxlength="30" value="${esc(n)}" aria-label="Nome della parte ${i + 1}" style="flex:1;min-width:0">
        <button type="button" class="btn chiaro piccolo" data-a="o-parte-su" data-v="${k}" ${i ? '' : 'disabled'} aria-label="Sposta su ${esc(n)}">↑</button>
        <button type="button" class="btn chiaro piccolo" data-a="o-parte-giu" data-v="${k}" ${i < v.length - 1 ? '' : 'disabled'} aria-label="Sposta giù ${esc(n)}">↓</button>
        <button type="button" class="btn chiaro piccolo" data-a="o-parte-togli" data-v="${k}" aria-label="Togli ${esc(n)}${quanti ? `: ha ${quanti} piatti` : ''}">✕</button></div>`; }).join('')
      + `<div class="fila"><input type="text" id="nuova-parte" maxlength="30" placeholder="es. Secondi" aria-label="Nome della parte nuova" style="flex:1;min-width:0">
        <button type="button" class="btn piccolo" data-a="o-parte-agg">Aggiungi</button></div>`
      + (cambiataOpz(o.k) ? `<button type="button" class="link" data-a="o-base" data-k="${o.k}">Rimetti le parti di base</button>` : '');
  }
  if (o.tipo === 'messaggio') {
    const esempio = riempi(v, { nome: 'Laura', n: 12, giorno: 'sabato 14 novembre', totale: '24,00 €', indirizzo: 'Via Roma 1, Olbia', mappa: 'https://maps.google.com/…', nota: 'Suona il citofono', orari: opz('orari') || 'dalle 17 alle 20', link: 'https://…' });
    dentro += `<textarea ${campo} rows="5" maxlength="${o.max}" aria-label="${esc(o.nome)}">${esc(v)}</textarea>
      <small class="tenue">Parole che riempio io: ${PAROLE_MSG.filter(([k]) => !o.pm || o.pm.includes(k)).map(([k, t]) => `<b>{${k}}</b> ${t}`).join(' · ')}</small>
      <span class="etichetta" style="font-weight:800">Esempio</span><div class="ai-fum lei" style="white-space:pre-line;max-width:100%">${esc(esempio)}${o.senzaFirma ? '' : '\n' + esc(opz('firma'))}</div>
      ${cambiataOpz(o.k) ? `<button type="button" class="link" data-a="o-base" data-k="${o.k}">Rimetti il messaggio di base</button>` : ''}`;
  }
  if (o.tipo === 'testo' && S.impostazioni[o.k]) dentro += `<button type="button" class="link" data-a="o-base" data-k="${o.k}">${o.vuotoDiBase ? 'Rimetti quella di base' : 'Svuota'}</button>`;
  return ['opz-' + o.k, esc(o.nome), testoOpz(o, v), `<section class="scheda sez-dentro">${dentro}</section>`];
}
function sezioniOpzioni() {
  return `<h3 class="tenue" style="margin:14px 0 0;font-size:.95rem">Altre regole dell'app</h3>
    ${GRUPPI_OPZ.map(([g, t]) => `<span class="etichetta" style="font-weight:800;margin-top:6px">${t}</span>${listaSez(OPZIONI.filter(o => o.g === g).map(sezOpz))}`).join('')}`;
}
function cercaImpHtml() {
  return `<div class="cerca-imp"><input type="search" id="cerca-imp" autocomplete="off" placeholder="🔎 Cerca un'impostazione… (es. minimo, orari, firma)" value="${esc(UI.cercaImp || '')}" aria-label="Cerca un'impostazione"></div>
    <p class="tenue piccolo" id="cerca-imp-niente" hidden style="margin:0">Non trovo niente: prova con un'altra parola, o chiedi all'aiutante.</p>`;
}
/* filtra le voci di Impostazioni: nome, valore e parole dell'aiutante */
function filtraImp() {
  if (UI.vista !== 'impostazioni') return;
  const q = semplOpz(UI.cercaImp || '').trim(), voci = document.querySelectorAll('main.corpo details.sez');
  let viste = 0;
  voci.forEach(d => {
    const o = OPZ[(d.dataset.sez || '').replace(/^opz-/, '')];
    const testo = semplOpz(d.querySelector('summary').textContent + ' ' + (o ? o.aiuto : ''));
    const si = !q || q.split(/\s+/).every(w => testo.includes(w)) || (o && o.parole && o.parole.test(q));
    d.hidden = !si; if (si) viste++;
  });
  document.querySelectorAll('main.corpo h3.tenue, main.corpo .etichetta').forEach(x => { if (!x.closest('details')) x.hidden = !!q; });
  const n = $('#cerca-imp-niente'); if (n) n.hidden = !q || viste > 0;
}
const semplOpz = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function dopoRenderOpz() { if (UI.vista === 'impostazioni' && UI.cercaImp) filtraImp(); }   // chiamata da render() (app.js)

/* salvataggio: un campo alla volta (due persone insieme non si pestano i piedi) */
function salvaOpz(k, el) {
  const o = OPZ[k]; if (!o) return;
  const v = valoreOpz(o, el.type === 'checkbox' ? el.checked : el.value);
  if (v === undefined) { mostraToast(o.tipo === 'numero' || o.tipo === 'euro' ? `Scrivi un numero da ${o.min} a ${o.max}.` : 'Questo valore non va bene.'); render(); return; }
  if (o.tipo === 'si') { cambia(v ? 'Acceso' : 'Spento', () => { S.impostazioni[k] = v; }); return; }
  S.impostazioni[k] = v; salva(); salvatoOk();
}
function spostaParte(k, d) {
  const v = opz('parti'), i = v.findIndex(c => c[0] === k), j = i + d;
  if (i < 0 || j < 0 || j >= v.length) return;
  [v[i], v[j]] = [v[j], v[i]];
  cambia('Spostata', () => { S.impostazioni.parti = v; });
}
/* nome di una parte cambiato nel campo */
function salvaParte(k, el) {
  const v = opz('parti'), i = v.findIndex(c => c[0] === k);
  if (i < 0) return;
  const nv = v.map(c => c.slice()); nv[i][1] = el.value;
  const ok = valoreParti(nv);
  if (!ok || ok.length !== v.length) { mostraToast(el.value.trim() ? 'Questo nome c\'è già.' : 'Il nome non può restare vuoto.'); render(); return; }
  S.impostazioni.parti = ok; salva(); salvatoOk();
}
const AZIONI_OPZ = {   // app.js le aggiunge ad A (A nasce dopo questo file)
  'o-giorno'(el) {
    const k = el.dataset.k, n = Number(el.dataset.v), v = opz(k).slice(), i = v.indexOf(n);
    if (i >= 0) v.splice(i, 1); else if (v.length < 6) v.push(n); else { mostraToast('Almeno un giorno deve restare aperto.'); return; }
    cambia(i >= 0 ? 'Riaperto' : 'Chiuso', () => { S.impostazioni[k] = v.sort(); });
  },
  'o-scelta'(el) { const k = el.dataset.k, v = el.dataset.v, o = OPZ[k]; if (!o || opz(k) === v) return; cambia(testoOpz(o, v), () => { S.impostazioni[k] = v; }); },
  'o-parte-su'(el) { spostaParte(el.dataset.v, -1); },
  'o-parte-giu'(el) { spostaParte(el.dataset.v, 1); },
  'o-parte-togli'(el) {
    const k = el.dataset.v, v = opz('parti'), c = v.find(x => x[0] === k);
    if (!c) return;
    const n = S.piatti.filter(p => !p.cestino && p.cat === k).length;
    if (n) { mostraToast(`«${c[1]}» ha ${n} ${n === 1 ? 'piatto' : 'piatti'}: prima spostali in un'altra parte (apri il piatto → Nome e parte del menù).`); return; }
    if (v.length < 2) { mostraToast('Serve almeno una parte nel menù.'); return; }
    cambia(`Tolta «${c[1]}»`, () => { S.impostazioni.parti = v.filter(x => x[0] !== k); });
  },
  'o-parte-agg'() {
    const inp = $('#nuova-parte'), nome = inp ? inp.value.trim() : '', v = opz('parti');
    if (!nome) { mostraToast('Scrivi il nome della parte nuova, es. Secondi.'); if (inp) inp.focus(); return; }
    const nv = valoreParti([...v, [null, nome]]);
    if (!nv || nv.length === v.length) { mostraToast(v.length >= 12 ? 'Al massimo 12 parti.' : `«${nome}» c'è già.`); return; }
    cambia(`Aggiunta «${nv[nv.length - 1][1]}»`, () => { S.impostazioni.parti = nv; });
  },
  'o-base'(el) { const k = el.dataset.k; cambia('Rimesso come prima', () => { delete S.impostazioni[k]; }); }
};
document.addEventListener('input', e => { if (e.target.id === 'cerca-imp') { UI.cercaImp = e.target.value; filtraImp(); } });
