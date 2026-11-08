/* Prova del database delle ricette (C60) senza Cloudflare: il Worker vero (worker.js) con un finto oggetto Ricettario
   su SQLite di Node, GialloZafferano e Microsoft finti. Lancia: node tools/prova-database.mjs → «N OK, 0 NO». */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const radice = join(dirname(fileURLToPath(import.meta.url)), '..');
let ok = 0, no = 0;
const prova = (nome, v) => { if (v) ok++; else { no++; console.log('NO  ' + nome); } };

/* Worker con DurableObject finto (fuori da Cloudflare «cloudflare:workers» non c'è) */
const cartella = mkdtempSync(join(tmpdir(), 'pit-db-'));
const codice = readFileSync(join(radice, 'worker.js'), 'utf8')
  .replace("import { DurableObject } from 'cloudflare:workers';", 'class DurableObject { constructor(ctx, cfg) { this.ctx = ctx; this.env = cfg; } }')
  .replace("from './gz.mjs'", `from '${pathToFileURL(join(radice, 'gz.mjs')).href}'`);
writeFileSync(join(cartella, 'worker.mjs'), codice);
const W = await import(pathToFileURL(join(cartella, 'worker.mjs')).href);

/* SQLite come quello di Cloudflare: exec(q, ...valori) → { toArray() } */
function sqlFinto() {
  const d = new DatabaseSync(':memory:');
  return { exec(q, ...a) { a = a.map(x => x instanceof ArrayBuffer ? new Uint8Array(x) : x); const st = d.prepare(q); const righe = /^\s*SELECT/i.test(q) ? st.all(...a) : (st.run(...a), []); return { toArray: () => righe.map(r => ({ ...r })) }; }, get databaseSize() { return 4096; } };
}
const oggetto = new W.Ricettario({ storage: { sql: sqlFinto() } }, {});
/* come la chiamata vera fra Worker e oggetto: risposte asincrone */
const ponte = new Proxy({}, { get: (_, k) => (...a) => Promise.resolve().then(() => oggetto[k](...a)) });
const contesto = { attese: [], waitUntil(p) { this.attese.push(p); } };
const finisci = async () => { await Promise.all(contesto.attese); contesto.attese = []; };

/* GialloZafferano finto: 3 pagine della sezione Sardegna (35 ricette, 5 doppie) e le ricette */
const nomi = Array.from({ length: 35 }, (_, i) => 'Ricetta-sarda-' + (i % 30));
const carta = n => `<article class="gz-card"><a href="https://ricette.giallozafferano.it/${n}.html" title="${n}"></a><h2 class="gz-title"><a>${n.replace(/-/g, ' ')}</a></h2></article>`;
const pagina = i => nomi.slice(i * 15, i * 15 + 15).map(carta).join('') + (i < 2 ? `<link rel="next" href="https://www.giallozafferano.it/ricette-regionali/page${i + 2}/Sardegna/">` : '');
const ricettaHtml = n => `<script type="application/ld+json">${JSON.stringify({ '@type': 'Recipe', name: n.replace(/-/g, ' '), recipeCategory: 'Primi piatti', recipeIngredient: ['Pecorino sardo 100 g', 'Sale q.b.'], recipeInstructions: [{ text: 'Mescola tutto.' }], image: 'https://www.giallozafferano.it/images/ricette/' + n + '.jpg' })}</script>`;
let richieste = [], gzGiu = false, msVoci = 0;
globalThis.caches = { default: { match: async () => null, put: async () => null } };
globalThis.fetch = async (u) => {
  u = String(u); richieste.push(u);
  if (gzGiu) return new Response('giù', { status: 503 });
  let m;
  if (u === 'https://www.giallozafferano.it/ricette-regionali/Sardegna/') return new Response(pagina(0));
  if ((m = /ricette-regionali\/page(\d)\/Sardegna/.exec(u))) return new Response(pagina(+m[1] - 1));
  if ((m = /^https:\/\/ricette\.giallozafferano\.it\/([\w-]+)\.html$/.exec(u))) return new Response(ricettaHtml(m[1]));
  if (u.includes('ricerca-ricette')) return new Response(carta('Culurgiones') + carta('Ricetta-sarda-1'));
  return new Response('', { status: 404 });
};
const cfg = { RICETTARIO: { idFromName: () => 'x', get: () => ponte }, AVVISI: { idFromName: () => 'c', get: () => ({}) } };

/* 1. il motore: prima pagina in coda, 2 ricette scaricate per giro */
await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci();
let s = await ponte.statoDb();
prova('giro 1: 2 ricette nel database', s.ricette === 2);
prova('giro 1: 13 in coda (15 - 2)', s.coda === 13);
prova('giro 1: pagina dopo ricordata', /page2\/Sardegna/.test(s.pagina));
prova('giro 1: al massimo 3 richieste a GialloZafferano', richieste.length <= 3);
for (let i = 0; i < 25; i++) { await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci(); }
s = await ponte.statoDb();
prova('30 ricette diverse, senza doppioni (35 sulle pagine)', s.ricette === 30);
prova('coda vuota alla fine', s.coda === 0);
prova('finita la Sardegna passa alla sezione dopo', s.fonte === 1);
prova('il promemoria della sera non fa girare il motore', await (async () => { const n = richieste.length; let fatto = false;
  const c2 = { RICETTARIO: cfg.RICETTARIO, AVVISI: { idFromName: () => 'c', get: () => ({ promemoria: async () => { fatto = true; } }) } };
  await W.default.scheduled({ cron: '0 18 * * *' }, c2, contesto); await finisci(); return fatto && richieste.length === n; })());

/* 2. pausa: nessuna richiesta */
await ponte.metti1('pausa', '1'); richieste = [];
await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci();
prova('in pausa il motore non chiama nessuno', richieste.length === 0);
await ponte.metti1('pausa', '');

/* 3. sfoglia e cerca nel database (quello che vede l'app) */
const chiedi = async (corpo, token = true) => {
  const r = await W.default.fetch(new Request('https://x/api/gz', { method: 'POST', headers: token ? { authorization: 'Bearer a.' + btoa(JSON.stringify({ user_id: 'u1' })) + '.c' } : {}, body: JSON.stringify(corpo) }), cfg, contesto);
  await finisci(); return r;
};
/* gestore: Firestore finto risponde 200 per gestori/u1 */
const fetchGz = globalThis.fetch;
globalThis.fetch = async (u, o) => /firestore\.googleapis\.com/.test(String(u)) ? new Response('{}', { status: 200 }) : fetchGz(u, o);
let j = await (await chiedi({ cat: 'db', cerca: 'Il tuo database' })).json();
prova('sfoglia: 30 ricette, nessuna pagina dopo', j.ricette && j.ricette.length === 30 && j.prossima === '');
prova('sfoglia: la scheda ha nome, link e foto', j.ricette && j.ricette[0].nome && /\.html$/.test(j.ricette[0].url) && /\.jpg$/.test(j.ricette[0].foto));
j = await (await chiedi({ cat: 'db', q: 'sarda 12' })).json();
prova('cerca nel database: «sarda 12» = 1 ricetta', j.ricette && j.ricette.length === 1 && /12/.test(j.ricette[0].nome));
j = await (await chiedi({ cat: 'db', q: 'pecorino' })).json();
prova('cerca anche negli ingredienti', j.ricette && j.ricette.length === 30);
j = await (await chiedi({ db: 'stato' })).json();
prova('stato per l\'app: numeri del database', j.db && j.db.ricette === 30 && j.db.coda === 0 && j.db.pausa === false);
j = await (await chiedi({ db: 'pausa' })).json();
prova('pausa dall\'app', j.db && j.db.pausa === true);
j = await (await chiedi({ db: 'riprendi' })).json();
prova('riprendi dall\'app', j.db && j.db.pausa === false);
prova('senza accesso di chi gestisce: rifiutato', (await chiedi({ db: 'stato' }, false)).status === 403);

/* 4. ricetta aperta: salvata; GialloZafferano giù → la copia del database */
j = await (await chiedi({ u: 'https://ricette.giallozafferano.it/Culurgiones.html' })).json();
prova('ricetta aperta letta dal vivo', j.ricetta && j.ricetta.nome === 'Culurgiones' && !j.dalDb);
prova('ricetta aperta salvata per sempre', !!(await ponte.una('gz:Culurgiones')));
j = await (await chiedi({ cerca: 'culurgiones' })).json();
prova('la ricerca mette in coda quello che il database non ha', (await ponte.statoDb()).coda === 0 && j.ricette.length === 2);
gzGiu = true;
j = await (await chiedi({ u: 'https://ricette.giallozafferano.it/Culurgiones.html' })).json();
prova('GialloZafferano giù: la ricetta arriva dal database', j.ricetta && j.ricetta.nome === 'Culurgiones' && j.dalDb === true);
j = await (await chiedi({ cerca: 'sarda 13' })).json();
prova('GialloZafferano giù: la ricerca guarda nel database', j.ricette && j.ricette.length === 1 && j.dalDb === true);
gzGiu = false;

/* 5. voci: create una volta, poi sempre dal database (stessa voce + stesso testo = una copia) */
globalThis.fetch = async (u, o) => {
  if (/speech\.platform\.bing\.com/.test(String(u))) { msVoci++; return new Response(null, { status: 403 }); }
  return /firestore\.googleapis\.com/.test(String(u)) ? new Response('{}', { status: 200 }) : fetchGz(u, o);
};
await ponte.salvaVoce('isabella:' + await (async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0')).join(''))('Passo 1. Mescola tutto.'), new Uint8Array([1, 2, 3]));
const rv = await W.default.fetch(new Request('https://x/api/voce', { method: 'POST', headers: { authorization: 'Bearer a.' + btoa(JSON.stringify({ user_id: 'u1' })) + '.c' }, body: JSON.stringify({ t: 'Passo 1.  Mescola tutto.', v: 'isabella' }) }), cfg, contesto);
prova('voce già salvata: dal database, Microsoft non chiamata', rv.status === 200 && msVoci === 0 && (await rv.arrayBuffer()).byteLength === 3);
await ponte.salvaVoce('isabella:' + 'f'.repeat(64), new Uint8Array([9]));
await ponte.salvaVoce('isabella:' + 'f'.repeat(64), new Uint8Array([9, 9]));
s = await ponte.statoDb();
prova('voci senza doppioni (2 diverse salvate)', s.voci === 2);
const rn = await W.default.fetch(new Request('https://x/api/voce', { method: 'POST', headers: { authorization: 'Bearer a.' + btoa(JSON.stringify({ user_id: 'u1' })) + '.c' }, body: JSON.stringify({ t: 'Testo nuovo', v: 'isabella' }) }), cfg, contesto);
prova('voce nuova: chiede a Microsoft (qui rifiuta → errore, l\'app usa la voce del telefono)', msVoci === 1 && rn.status === 502);

/* 6. il TUO ricettario (C61): il motore propone, tu aggiungi con l'ok; niente doppioni; togli */
j = await (await chiedi({ cat: 'nuove', fuori: ['gz:Ricetta-sarda-0'] })).json();
prova('proposte: dall\'archivio, senza quelle che hai già', j.ricette && j.ricette.length === 30 && !j.ricette.some(x => /Ricetta-sarda-0\.html$/.test(x.url)) && j.prossima === '');   // 31 nell'archivio, 1 già tua
j = await (await chiedi({ cat: 'nuove', pagina: 'nuove:10', fuori: ['gz:Ricetta-sarda-0'] })).json();
prova('proposte: «Carica altre» porta le altre', j.ricette && j.ricette.length === 20 && j.prossima === '');
const nuova = { id: 'gz:Ricetta-sarda-5', nome: 'Ricetta sarda 5', zona: 'sarda', categoria: 'primi', foto: 'https://www.giallozafferano.it/images/x.jpg' };
j = await (await chiedi({ db: 'aggiungi', r: nuova })).json();
prova('➕ aggiungi: nel tuo ricettario', j.scelte && j.scelte.length === 1 && j.scelte[0].id === 'gz:Ricetta-sarda-5' && j.scelte[0].zona === 'sarda');
j = await (await chiedi({ db: 'aggiungi', r: nuova })).json();
prova('➕ due volte la stessa: nessun doppione', j.scelte && j.scelte.length === 1);
j = await (await chiedi({ cat: 'nuove' })).json();
prova('quella aggiunta non è più fra le proposte', j.ricette && !j.ricette.some(x => /Ricetta-sarda-5\.html$/.test(x.url)));
j = await (await chiedi({ db: 'aggiungi', r: { id: 'gz:../x', nome: 'x' } })).json();
prova('ricetta non valida rifiutata', j.errore === 'ricetta non valida');
j = await (await chiedi({ db: 'aggiungi', r: { id: 'gz:Pane-nuovo', nome: 'Pane nuovo', zona: 'luna', foto: 'https://altro.sito/x.jpg' } })).json();
prova('aggiungi una nuova: salvata anche intera, zona e foto ripulite', j.scelte && j.scelte.length === 2 && j.scelte[0].zona === 'italiana' && j.scelte[0].foto === '' && !!(await ponte.una('gz:Pane-nuovo')));
j = await (await chiedi({ db: 'mie' })).json();
prova('elenco del tuo ricettario', j.scelte && j.scelte.length === 2);
j = await (await chiedi({ db: 'togli', id: 'gz:Pane-nuovo' })).json();
prova('togli dal ricettario', j.scelte && j.scelte.length === 1);
j = await (await chiedi({ db: 'stato' })).json();
prova('stato: quante nel tuo ricettario', j.db && j.db.scelte === 1);

/* 7. 🔄 «Cerca adesso»: un giro subito, anche in pausa; numeri per la pagina Database */
await ponte.metti1('pausa', '1'); await ponte.metti1('fonte', 0); await ponte.metti1('pagina', '');
j = await (await chiedi({ db: 'cerca' })).json();
prova('«Cerca adesso» fa un giro anche in pausa e dice quante nuove', j.db && j.nuove >= 0 && j.db.giri > 26 && j.db.pagine > 3 && j.db.sezione && j.db.fonti === 10);
await ponte.metti1('pausa', '');
console.log(`${ok} OK, ${no} NO`);
process.exit(no ? 1 : 0);
