/* C139 (Mario 11/11 11:25 «Aggiungi 200 ricette proteiche specialmente dolci snack merenda colazione dopo allenamento poi il resto,
   cerca da varie fonti»): Claude raccoglie le ricette proteiche dal computer e le scrive in ricette-fit.js, un file del sito.
   Il server di Cloudflare non legge niente (zero letture): l'app le mostra in «🏋️ Proteiche» come le altre.
   - Fonti: RicetteFit (tutto il suo elenco), GialloZafferano (ricerche con parole proteiche) e i Blog di GialloZafferano (stesse ricerche). Si legge SOLO nome, foto, tempi e
     valori per porzione dalla pagina ufficiale; testo, dosi e passi l'app li legge dal sito d'origine quando si apre (PT E25).
   - Entra solo una ricetta che passa la STESSA regola dell'app (fitRic di ricettario.js, soglie di base): il codice si prende da lì.
   - Prima i momenti che chiede Mario (dolci, spuntino, merenda, colazione, dopo l'allenamento), poi il resto; niente doppioni di nome.
   Uso: node tools/raccogli-fit.mjs [quante=200] → ricette-fit.js. Pagine tenute in .cache-fit/ (rilanciarlo non rilegge i siti). */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { gzRicetta, gzCerca, gzProssima, bgCerca, UA_GZ } from '../gz.mjs';
import { rfRicetta, rfElenco, MAPPA_RF } from '../rf.mjs';

const RADICE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CACHE = path.join(RADICE, '.cache-fit'), QUANTE = Math.max(1, Number(process.argv[2]) || 200);
const PRIMA_MAX = Math.round(QUANTE * 0.75);   // i momenti di Mario fino a 3 su 4; il resto almeno 1 su 4 (se ci sono)
const PRIMA = ['dolci', 'spuntino', 'merenda', 'colazione', 'allenamento'];
const PAROLE_GZ = ['dolci proteici', 'pancake proteici', 'torta proteica', 'muffin proteici', 'barrette proteiche', 'budino proteico',
  'cheesecake proteica', 'brownies proteici', 'biscotti proteici', 'porridge proteico', 'overnight oats', 'yogurt greco', 'skyr',
  'ricotta light', 'frullato proteico', 'mousse proteica', 'gelato proteico', 'plumcake proteico', 'crepes proteiche',
  'colazione proteica', 'snack proteici', 'merenda proteica', 'albumi', 'fiocchi di latte', 'ricette proteiche', 'secondi proteici',
  'pollo light', 'tacchino light', 'pesce light', 'ricette light',
  'dolci senza zucchero', 'dolci light', 'dolci con albumi', 'dolci con ricotta', 'dolci con yogurt', 'crema di ricotta', 'semifreddo yogurt', 'frittelle di albumi', 'muffin salati', 'snack salati light',
  'dolci fit', 'dolci proteici senza zucchero', 'torta yogurt greco', 'budino skyr', 'tiramisu proteico', 'cheesecake light', 'mousse yogurt greco', 'biscotti avena', 'dolci con fiocchi di latte', 'pancake albumi', 'torta albumi', 'crema proteica',
  // C139 (Mario 11/11 sera: «dolci con la crema proteica, fatta con lo shake… albumi, yogurt greco, Philadelphia proteica… 200 ricette così»)
  'proteine in polvere', 'whey', 'shake proteico', 'dolci con proteine', 'philadelphia', 'philadelphia light', 'quark', 'skyr dolce', 'fiocchi di latte dolce',
  'cheesecake yogurt greco', 'tiramisu light', 'tiramisu yogurt greco', 'budino proteico cioccolato', 'mug cake proteica', 'mug cake', 'torta in tazza',
  'muffin albumi', 'brownies albumi', 'crepes albumi', 'waffle proteici', 'pan di spagna albumi', 'meringhe', 'mousse albumi', 'semifreddo proteico',
  'gelato yogurt greco', 'ghiaccioli yogurt', 'barrette avena', 'energy balls', 'protein balls', 'biscotti proteici avena', 'ciambella proteica',
  'plumcake yogurt greco', 'torta ricotta light', 'crostata light', 'dolci senza zucchero yogurt', 'dolci con stevia', 'dolci con eritritolo',
  'crema pasticcera light', 'crema yogurt greco', 'crema albumi', 'french toast proteico', 'porridge albumi', 'oatmeal proteico', 'banana bread proteico',
  'cottage cheese', 'ricotta e cacao', 'yogurt greco e frutta', 'parfait yogurt', 'chia pudding', 'budino chia', 'zabaione light'];
fs.mkdirSync(CACHE, { recursive: true });

/* la regola dell'app, presa dal codice vero (un posto solo: se Mario cambia le soglie di base, questo le segue) */
function regolaApp() {
  const src = fs.readFileSync(path.join(RADICE, 'ricettario.js'), 'utf8').split('\n');
  const pezzo = nome => {
    const i = src.findIndex(l => l.startsWith(`const ${nome} =`) || l.startsWith(`function ${nome}(`));
    if (i < 0) throw new Error('in ricettario.js manca ' + nome);
    let j = i + 1; while (j < src.length && !/^(const |function |let |\/\*|[A-Z]+\.|async )/.test(src[j])) j++;
    return src.slice(i, j).join('\n');
  };
  const nomi = ['senzaAccenti', 'sogliaFit', 'valoriPieni', 'fitRic', 'PAROLE_MOM', 'momentoRic', 'CAT_RIC', 'catRic'];
  const ctx = { opz: undefined }; vm.createContext(ctx);
  vm.runInContext(nomi.map(pezzo).join('\n') + '\nthis.fitRic = fitRic; this.momentoRic = momentoRic; this.catRic = catRic; this.senzaAccenti = senzaAccenti;', ctx);
  return ctx;
}
const R = regolaApp();

const pausa = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
let lette = 0;
function pagina(u) {   // dal disco se già letta; sennò dal sito, con calma (una ogni 0,6 s)
  const f = path.join(CACHE, createHash('sha1').update(u).digest('hex') + '.html');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  pausa(600); lette++;
  let t = '';
  try { t = execFileSync('curl', ['-sL', '-m', '25', '-A', UA_GZ, '-H', 'accept-language: it-IT,it', u], { maxBuffer: 3e7 }).toString(); } catch (e) { return ''; }
  if (t.length > 2000) fs.writeFileSync(f, t);
  return t;
}

/* 1. candidati: tutto RicetteFit + le ricerche di GialloZafferano (3 pagine per parola) */
const cand = new Map();
for (const u of rfElenco(pagina(MAPPA_RF))) cand.set(u, 'rf');
for (const p of PAROLE_GZ) {
  let u = 'https://www.giallozafferano.it/ricerca-ricette/' + encodeURIComponent(p).replace(/%20/g, '+') + '/';
  for (let k = 0; k < 3 && u; k++) {
    const h = pagina(u), l = gzCerca(h);
    l.forEach(x => { if (!cand.has(x.url)) cand.set(x.url, 'gz'); });
    bgCerca(h).forEach(x => { if (!cand.has(x)) cand.set(x, 'bg'); });   // C139: le ricette dei Blog di GialloZafferano mostrate dalla stessa ricerca
    u = l.length ? gzProssima(h, u, l.length) : '';
  }
}
console.error(`candidati: ${cand.size} (RicetteFit ${[...cand.values()].filter(x => x === 'rf').length}, blog ${[...cand.values()].filter(x => x === 'bg').length})`);

/* 2. ogni candidato: valori per porzione → regola dell'app */
const giaApp = new Set((fs.readFileSync(path.join(RADICE, 'ricette.js'), 'utf8').match(/\["([\w-]+)"/g) || []).map(x => 'gz:' + x.slice(2, -1)));
const buone = [], nomiVisti = new Set(); let n = 0, senzaValori = 0, nonFit = 0;
for (const [u, chi] of cand) {
  if (++n % 100 === 0) console.error(`… ${n}/${cand.size} lette ${lette} buone ${buone.length}`);
  const h = pagina(u); if (!h) continue;
  let r = null; try { r = chi === 'rf' ? rfRicetta(h, u) : gzRicetta(h, u); } catch (e) { continue; }
  if (!r || !r.id || !r.nome || giaApp.has(r.id)) continue;
  if (/^(fondo|brodo|salsa|dado|marinatura|besciamella)\b/i.test(r.nome.trim())) continue;   // basi di cucina, non piatti da mangiare (es. «Fondo bruno»)
  if (!r.nutr) { senzaValori++; continue; }
  const nu = r.nutr, nutr = { kcal: nu.kcal, prot: nu.prot, carb: nu.carb, zuc: nu.zuc, saturi: nu.saturi, sodio: nu.sodio };
  const tipo = R.fitRic(nutr); if (!tipo) { nonFit++; continue; }
  const chiaveNome = R.senzaAccenti(r.nome).replace(/[^a-z0-9]+/g, ' ').trim();
  if (nomiVisti.has(chiaveNome)) continue; nomiVisti.add(chiaveNome);
  const x = { id: r.id, nome: r.nome.trim(), categoria: R.catRic(r.categoria || ''), foto: r.foto || '', totale: Number(r.totale) || 0, difficolta: r.difficolta || '', nutr,
    cerca: (r.ingredienti || []).map(i => i.nome).filter(Boolean).join(', ').slice(0, 300) };
  x.momenti = PRIMA.filter(m => R.momentoRic(x, m));
  buone.push(x);
}

/* 3. scelta: prima i momenti di Mario (alternati, così ci sono tutti), poi il resto; ordine finale per proteine per 100 kcal */
const prima = buone.filter(x => x.momenti.length), resto = buone.filter(x => !x.momenti.length);
const presi = new Set(), scelte = [];
const perProt = (a, b) => b.nutr.prot / b.nutr.kcal - a.nutr.prot / a.nutr.kcal;
const code = PRIMA.map(m => prima.filter(x => x.momenti.includes(m)).sort(perProt));
const limPrima = Math.min(prima.length, Math.max(PRIMA_MAX, QUANTE - resto.length));
for (let giro = 0; scelte.length < limPrima && code.some(c => c.length); giro++) {
  for (const c of code) { while (c.length && presi.has(c[0].id)) c.shift(); if (c.length && scelte.length < limPrima) { presi.add(c[0].id); scelte.push(c.shift()); } }
}
resto.sort(perProt).forEach(x => { if (scelte.length < QUANTE && !presi.has(x.id)) { presi.add(x.id); scelte.push(x); } });
prima.sort(perProt).forEach(x => { if (scelte.length < QUANTE && !presi.has(x.id)) { presi.add(x.id); scelte.push(x); } });

const conta = {}; PRIMA.forEach(m => { conta[m] = scelte.filter(x => x.momenti.includes(m)).length; });
const fonti = { gz: scelte.filter(x => x.id.startsWith('gz:')).length, rf: scelte.filter(x => x.id.startsWith('rf:')).length, bg: scelte.filter(x => x.id.startsWith('bg:')).length };
const oggi = new Date().toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' });
const righe = scelte.map(({ momenti, ...x }) => '  ' + JSON.stringify(x)).join(',\n');
fs.writeFileSync(path.join(RADICE, 'ricette-fit.js'), `/* C139 · Ricette proteiche scelte da Claude il ${oggi} (Mario 11/11 «aggiungi 200 ricette proteiche… cerca da varie fonti»).
   File del sito: il server non legge niente per mostrarle (zero letture di Cloudflare). Scritto da tools/raccogli-fit.mjs, NON a mano.
   Solo nome, foto, tempo e valori per porzione delle pagine ufficiali (GialloZafferano ${fonti.gz}, RicetteFit ${fonti.rf}, Blog di GialloZafferano ${fonti.bg}): dosi e passi
   l'app li legge dal sito d'origine quando si apre la ricetta (PT E25). Ognuna passa la regola «🏋️ Proteiche» di ricettario.js. */
const RICETTE_FIT = [
${righe}
].map(r => Object.assign({ pagina: r.id.slice(3), zona: 'italiana', fit: true }, r));
`);
console.log(JSON.stringify({ scritte: scelte.length, candidati: cand.size, buone: buone.length, senzaValori, nonFit, lette, fonti, momenti: conta, resto: scelte.filter(x => !x.momenti.length).length }));
