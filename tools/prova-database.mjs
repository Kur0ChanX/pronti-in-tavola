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
  .replace("from './gz.mjs'", `from '${pathToFileURL(join(radice, 'gz.mjs')).href}'`)
  .replace("from './rf.mjs'", `from '${pathToFileURL(join(radice, 'rf.mjs')).href}'`)
  .replace("from './ascolta.mjs'", `from '${pathToFileURL(join(radice, 'ascolta.mjs')).href}'`);
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
const pagina = i => nomi.slice(i * 15, i * 15 + 15).map(carta).join('') + (i < 2 ? `<link rel="next" href="https://www.giallozafferano.it/ricerca-ricette/page${i + 2}/sardegna/">` : '');
const ricettaHtml = n => `<script type="application/ld+json">${JSON.stringify({ '@type': 'Recipe', name: n.replace(/-/g, ' '), recipeCategory: 'Primi piatti', recipeIngredient: n === 'Ricetta-sarda-7' ? ['Pecorino sardo 100 g'] : ['Pecorino sardo 100 g', 'Farina 200 g', 'Sale q.b.'], recipeInstructions: [{ text: 'Mescola tutto.' }, { text: 'Cuoci a fuoco dolce.' }], image: 'https://www.giallozafferano.it/images/ricette/' + n + '.jpg' })}</script>`;
let richieste = [], gzGiu = false, msVoci = 0;
globalThis.caches = { default: { match: async () => null, put: async () => null } };
globalThis.fetch = async (u) => {
  u = String(u); richieste.push(u);
  if (gzGiu) return new Response('giù', { status: 503 });
  let m;
  if (u === 'https://www.giallozafferano.it/ricerca-ricette/sardegna/') return new Response(pagina(0));
  if ((m = /ricerca-ricette\/page(\d)\/sardegna/.exec(u))) return new Response(pagina(+m[1] - 1));
  if ((m = /^https:\/\/ricette\.giallozafferano\.it\/([\w-]+)\.html$/.exec(u))) return new Response(ricettaHtml(m[1]));
  if (u.includes('ricerca-ricette')) return new Response(carta('Culurgiones') + carta('Ricetta-sarda-1'));
  return new Response('', { status: 404 });
};
const cfg = { RICETTARIO: { idFromName: () => 'x', get: () => ponte }, AVVISI: { idFromName: () => 'c', get: () => ({}) } };

oggetto.mettiParoleFit([]);   // la corsia «fit» (C124) ha le sue prove in fondo: qui spenta, così i conti di sotto restano quelli
oggetto.metti1('rfSpento', '1');   // anche RicetteFit (C124 passo 8): prove in fondo
/* 1. il motore: prima pagina in coda, 2 ricette scaricate per giro */
await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci();
let s = await ponte.statoDb();
prova('giro 1: 2 ricette nel database', s.ricette === 2);
prova('giro 1: 13 in coda (15 - 2)', s.coda === 13);
prova('giro 1: prima le sarde, pagina dopo ricordata', /page2\/sardegna/.test(s.paginaSarda));
prova('giro 1: al massimo 3 richieste a GialloZafferano', richieste.length <= 3);
for (let i = 0; i < 25; i++) { await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci(); }
s = await ponte.statoDb();
prova('29 ricette complete, senza doppioni (35 sulle pagine, 1 incompleta)', s.ricette === 29);
prova('la ricetta incompleta non entra né nell\'archivio né nel ricettario, ed è contata', !(await ponte.una('gz:Ricetta-sarda-7')) && s.scartate === 1 && s.coda === 0);
prova('ogni ricetta salvata dal motore entra da sola nel ricettario', s.nelRicettario === 29 && s.scelte === 29);
const sc = await ponte.scelte();
prova('ricettario: zona sarda dalle pagine sarde, campi pieni', sc.filter(x => x.zona === 'sarda').length === 29 && sc.every(x => /\.html$/.test(x.url) && x.nome && /\.jpg$/.test(x.foto) && x.aggiunta > 0));
oggetto.sql.exec("UPDATE ricette SET json = json_set(json, '$.totale', 25, '$.difficolta', 'Facile') WHERE id = ?", sc[0].id);
const sc2 = await ponte.scelte(), x69 = sc2.find(y => y.id === sc[0].id);
prova('C69: ricettario col tempo, la difficoltà e gli ingredienti dall\'archivio', x69 && x69.totale === 25 && x69.difficolta === 'Facile' && x69.cerca.length > 0 && sc2.every(y => 'totale' in y && 'cerca' in y));
const vv = await ponte.vecchie(50);
prova('C72: le ricette salvate col lettore vecchio sono da rileggere', vv.length === 0 || vv.every(u => /^https:/.test(u)));
oggetto.sql.exec("UPDATE ricette SET json = json_remove(json, '$.v')"); const v2 = await ponte.vecchie(3); await ponte.tieni(v2[0]);
prova('C72: rilettura 5 alla volta, una pagina sparita non si riprova', v2.length === 3 && !(await ponte.vecchie(50)).includes(v2[0]));
prova('coda vuota alla fine', s.coda === 0);
const lette = richieste.filter(u => /giallozafferano\.it\/(ricerca-ricette|ricette-cat)\//.test(u));
prova('sarde miste alle altre: una pagina sarda e una di un\'altra sezione', /sardegna/.test(lette[0]) && /Primi/.test(lette[1]) && /sardegna/.test(lette[2]));
prova('finite le sarde: «fine», poi solo le altre', s.paginaSarda === 'fine' && /ricette-cat/.test(lette[lette.length - 1]));
prova('pagina che non esiste (404, qui i Primi finti): il motore va avanti, non resta fermo (C65)', richieste.some(u => /ricette-cat\/Secondi-piatti\//.test(u)) && s.fonte >= 2);
for (let i = 0; i < 12; i++) { await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci(); }
s = await ponte.statoDb();
prova('giro completo delle altre sezioni: le sarde ripartono', s.passate >= 1 && richieste.filter(u => u.endsWith('/ricerca-ricette/sardegna/')).length >= 2);
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
prova('sfoglia: 30 ricette, nessuna pagina dopo', j.ricette && j.ricette.length === 29 && j.prossima === '');
prova('sfoglia: la scheda ha nome, link e foto', j.ricette && j.ricette[0].nome && /\.html$/.test(j.ricette[0].url) && /\.jpg$/.test(j.ricette[0].foto));
j = await (await chiedi({ cat: 'db', q: 'sarda 12' })).json();
prova('cerca nel database: «sarda 12» = 1 ricetta', j.ricette && j.ricette.length === 1 && /12/.test(j.ricette[0].nome));
j = await (await chiedi({ cat: 'db', q: 'pecorino' })).json();
prova('cerca anche negli ingredienti', j.ricette && j.ricette.length === 29);
j = await (await chiedi({ db: 'stato' })).json();
prova('stato per l\'app: numeri del database', j.db && j.db.ricette === 29 && j.db.coda === 0 && j.db.pausa === false);
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

/* 6. il TUO ricettario (C61): il motore propone, tu aggiungi con l'ok; niente doppioni; togli. Si parte da un ricettario vuoto (il motore l'aveva riempito da solo) */
oggetto.sql.exec('DELETE FROM scelte');
j = await (await chiedi({ cat: 'nuove', fuori: ['gz:Ricetta-sarda-0'] })).json();
prova('proposte: dall\'archivio, senza quelle che hai già', j.ricette && j.ricette.length === 29 && !j.ricette.some(x => /Ricetta-sarda-0\.html$/.test(x.url)) && j.prossima === '');   // 30 nell'archivio (29 + Culurgiones), 1 già tua
j = await (await chiedi({ cat: 'nuove', pagina: 'nuove:10', fuori: ['gz:Ricetta-sarda-0'] })).json();
prova('proposte: «Carica altre» porta le altre', j.ricette && j.ricette.length === 19 && j.prossima === '');
/* (C119, Mario 10/11 «sgranatissime») prima le ricette con le foto grandi: una vecchia a strisce, anche col video e il voto più alto, va in fondo */
oggetto.salva({ id: 'gz:Strisce-video', url: 'https://ricette.giallozafferano.it/Strisce-video.html', nome: 'Strisce video', categoria: 'Primi', voto: 5, mp4: 'https://x/v.mp4', passi: [{ t: '1', foto: ['https://www.giallozafferano.it/images/ricette/1/Strisce_strip_1-3.jpg'] }] });
oggetto.salva({ id: 'gz:Foto-grandi', url: 'https://ricette.giallozafferano.it/Foto-grandi.html', nome: 'Foto grandi', categoria: 'Primi', voto: 1, passi: [{ t: '1', foto: ['https://www.giallozafferano.it/images/ricette/1/Foto-grandi_1.jpg'] }] });
j = await (await chiedi({ cat: 'nuove', fuori: [] })).json();
const tutte = [...j.ricette, ...(await (await chiedi({ cat: 'nuove', pagina: 'nuove:31', fuori: [] })).json()).ricette].map(x => x.url.split('/').pop());
prova('(C119) proposte: le foto grandi prima, la vecchia a strisce in fondo anche col video', tutte.includes('Foto-grandi.html') && tutte[tutte.length - 1] === 'Strisce-video.html');
oggetto.sql.exec("UPDATE ricette SET strisce = 0"); oggetto.metti1('strisceOk', '');
new W.Ricettario({ storage: { sql: oggetto.sql } }, {});   // all'avvio dopo l'aggiornamento: le ricette già salvate si segnano una volta sola
const segnate = oggetto.sql.exec("SELECT id FROM ricette WHERE strisce = 1").toArray().map(x => x.id);
prova('(C119) ricette già nell\'archivio: le vecchie a strisce segnate all\'avvio', segnate.join() === 'gz:Strisce-video' && oggetto.leggi1('strisceOk') === '1');
oggetto.sql.exec("DELETE FROM ricette WHERE id IN ('gz:Strisce-video', 'gz:Foto-grandi')");
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
/* 9. archivio → ricettario, una volta sola: le complete già nell'archivio che mancano entrano; le incomplete no */
oggetto.sql.exec('DELETE FROM scelte');
oggetto.salva({ id: 'gz:Vecchia-completa', url: 'https://ricette.giallozafferano.it/Vecchia-completa.html', nome: 'Vecchia completa', categoria: 'Dolci', foto: 'https://www.giallozafferano.it/images/v.jpg', ingredienti: [{ nome: 'a' }, { nome: 'b' }, { nome: 'c' }], passi: [{ t: '1' }, { t: '2' }] });
oggetto.salva({ id: 'gz:Vecchia-povera', url: 'https://ricette.giallozafferano.it/Vecchia-povera.html', nome: 'Vecchia povera', foto: 'https://www.giallozafferano.it/images/p.jpg', ingredienti: [{ nome: 'a' }], passi: [{ t: '1' }] });
oggetto.metti1('scelteRiempite', '');
s = await ponte.statoDb();
prova('riempimento unico: entrano le complete dell\'archivio (29 + Culurgiones + Pane nuovo + Vecchia), non l\'incompleta', s.nelRicettario === 32 && !(await ponte.scelte()).some(x => x.id === 'gz:Vecchia-povera'));
await ponte.togli('gz:Vecchia-completa');
s = await ponte.statoDb();
prova('il riempimento non si ripete: quella tolta resta tolta', s.nelRicettario === 31);

/* 10. ricette scritte a mano sul server */
const mia = { id: 'mia123', nome: 'Torta di Monica', ingredienti: [{ nome: 'uova' }], foto: 'data:image/jpeg;base64,' + 'A'.repeat(400000) };
j = await (await chiedi({ db: 'salvaMia', r: mia })).json();
prova('mia: salvata (anche con foto da 400 KB)', j.ok === true);
j = await (await chiedi({ db: 'mieScritte' })).json();
prova('mia: elenco con id, ricetta e data', j.mie && j.mie.length === 1 && j.mie[0].id === 'mia123' && j.mie[0].r.nome === 'Torta di Monica' && j.mie[0].aggiornata > 0);
await chiedi({ db: 'salvaMia', r: Object.assign({}, mia, { nome: 'Torta di Monica 2' }) });
j = await (await chiedi({ db: 'mieScritte' })).json();
prova('mia: salvare di nuovo aggiorna, nessun doppione', j.mie.length === 1 && j.mie[0].r.nome === 'Torta di Monica 2');
prova('mia: id che non inizia con «mia» rifiutato', (await (await chiedi({ db: 'salvaMia', r: { id: 'gz:x', nome: 'x' } })).json()).errore === 'ricetta non valida');
prova('mia: oltre 1.500.000 caratteri rifiutata', (await (await chiedi({ db: 'salvaMia', r: { id: 'miagrande', foto: 'A'.repeat(1500001) } })).json()).errore === 'ricetta non valida');
j = await (await chiedi({ db: 'stato' })).json();
prova('stato: mieServer = 1', j.db && j.db.mieServer === 1);
await chiedi({ db: 'togliMia', id: 'mia123' });
j = await (await chiedi({ db: 'mieScritte' })).json();
prova('mia: tolta non si vede più', j.mie.length === 0 && (await ponte.statoDb()).mieServer === 0);

/* 11. turbo «carica N»: allarme finto, qui chiamo io alarm() in un ciclo */
const allarmi = []; oggetto.ctx.storage.setAlarm = async t => { allarmi.push(t); };
oggetto.sql.exec('DELETE FROM ricette'); oggetto.sql.exec('DELETE FROM coda'); oggetto.sql.exec('DELETE FROM scelte'); oggetto.sql.exec('DELETE FROM scartate');
for (const k of ['fonte', 'pagina', 'paginaSarda', 'pagine']) oggetto.metti1(k, '');
richieste = [];
/* la sezione Primi finta ha 12 ricette «miste» (le altre sezioni restano vuote) */
const fetchPrima = globalThis.fetch;
globalThis.fetch = async (u, o) => String(u) === 'https://www.giallozafferano.it/ricette-cat/Primi/' && !gzGiu ? new Response(Array.from({ length: 12 }, (_, i) => carta('Primo-misto-' + i)).join('')) : fetchPrima(u, o);
prova('turbo: n fuori misura rifiutato', (await (await chiedi({ db: 'turbo', n: 0 })).json()).errore && (await (await chiedi({ db: 'turbo', n: 201 })).json()).errore);
prova('turbo: senza accesso di chi gestisce niente', (await chiedi({ db: 'turbo', n: 5 }, false)).status === 403);
j = await (await chiedi({ db: 'turbo', n: 20 })).json();
prova('turbo: avviato, risponde {turbo} attivo con obiettivo 20 e allarme impostato', j.turbo && j.turbo.attivo === true && j.turbo.obiettivo === 20 && j.turbo.fatte === 0 && allarmi.length === 1);
let giri = 0; while ((await ponte.statoDb()).turbo.attivo && giri < 50) { await oggetto.alarm(); giri++; }
s = await ponte.statoDb();
prova('turbo: arriva a 20 e si ferma da solo', s.turbo.fatte === 20 && s.turbo.attivo === false && s.turbo.finito > 0 && s.nelRicettario === 20 && s.ricette === 20);
prova('turbo: una sveglia scarica al massimo 5 ricette (20 = almeno 4 sveglie) e non si risveglia da fermo', giri >= 4 && giri <= 10 && allarmi.length === giri);
const prima = richieste.length; await oggetto.alarm();
prova('turbo: fermo, una sveglia in più non fa niente', richieste.length === prima);
const zone = (await ponte.scelte()).reduce((a, x) => (a[x.zona] = (a[x.zona] || 0) + 1, a), {});
prova('turbo: le sarde vengono prima ma ci sono anche le altre', zone.sarda >= 10 && zone.italiana >= 1);
/* senza novità: 20 sveglie vuote di fila → si ferma */
gzGiu = true; j = await (await chiedi({ db: 'turbo', n: 50 })).json(); giri = 0;
while ((await ponte.statoDb()).turbo.attivo && giri < 100) { await oggetto.alarm(); giri++; }
s = await ponte.statoDb();
prova('turbo: GialloZafferano non dà niente → si ferma dopo 20 sveglie vuote', giri === 20 && s.turbo.attivo === false && s.turbo.fatte === 0);
gzGiu = false;
/* 8. foto originali di Monica (Mario 08/11): caricata così com'è, in pezzi; Mario la scarica identica; tetto 25 MB; via dopo 60 giorni */
const auto = { authorization: 'Bearer a.' + btoa(JSON.stringify({ user_id: 'u1' })) + '.c' };
const orig = async (corpo, tipo, extra = {}) => { const r = await W.default.fetch(new Request('https://x/api/originali', { method: 'POST', headers: Object.assign({ 'content-type': tipo }, auto, extra), body: corpo }), cfg, contesto); await finisci(); return r; };
const foto4 = new Uint8Array(4 * 1024 * 1024 + 123); for (let i = 0; i < foto4.length; i++) foto4[i] = (i * 31) % 251;
j = await (await orig(foto4, 'image/jpeg', { 'x-nome': encodeURIComponent('Culurgiones al sugo') })).json();
prova('originale: caricata (4 MB, 3 pezzi)', j.ok && j.id > 0 && (await ponte.elencoOriginali()).length === 1);
j = await (await orig('{}', 'application/json')).json();
prova('originale: nell\'elenco con nome, peso e «nuova»', j.foto && j.foto[0].nome === 'Culurgiones al sugo' && j.foto[0].byte === foto4.length && !j.foto[0].scaricata && j.giorni === 60);
let rr = await orig(JSON.stringify({ azione: 'scarica', id: j.foto[0].id }), 'application/json');
const giu = new Uint8Array(await rr.arrayBuffer());
prova('originale: scaricata identica, byte per byte', rr.headers.get('content-type') === 'image/jpeg' && giu.length === foto4.length && giu.every((x, i) => x === foto4[i]));
prova('originale: dopo lo scarico è segnata «scaricata»', !!(await ponte.elencoOriginali())[0].scaricata);
prova('originale: oltre 25 MB rifiutata', (await orig(new Uint8Array(25 * 1024 * 1024 + 1), 'image/jpeg')).status === 413);
rr = await W.default.fetch(new Request('https://x/api/originali', { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: foto4 }), cfg, contesto);
prova('originale: senza accesso da gestore niente', rr.status === 403);
prova('originale: pulizia lascia le foto giovani', (await ponte.pulisciOriginali(60)) === 0 && (await ponte.elencoOriginali()).length === 1);
prova('originale: pulizia toglie le vecchie (pezzi compresi)', (await ponte.pulisciOriginali(-1)) === 1 && (await ponte.elencoOriginali()).length === 0 && (await ponte.originale(j.foto[0].id)) === null);
// C83: controllo di tutte le ricette del database (una rovinata apposta torna da rileggere)
{ const una = oggetto.sql.exec('SELECT id FROM ricette LIMIT 1').toArray()[0];
  const c1 = await ponte.controlla();
  oggetto.sql.exec("UPDATE ricette SET json = json_set(json, '$.passi', json('[]'), '$.v', 4) WHERE id = ?", una.id);
  const c2 = await ponte.controlla(), rilette = await ponte.vecchie(50), st = await ponte.statoDb();
  prova('C83: controlla tutte le ricette, una rovinata contata e rimessa da rileggere', c2.totale === c1.totale && c2.nMale >= 1 && c2.ok + c2.nMale === c2.totale && c2.male.some(m => m.id === una.id && m.prob.includes('0 passi')) && rilette.length > 0 && st.controllo && st.controllo.quando === c2.quando);
}
// C123 (Mario 10/11 «5 da sistemare… non le sistema da solo»): le segnate si rileggono SUBITO e hanno un esito vero, mai più in giro
{ const prima = globalThis.fetch, sparite = new Set();
  globalThis.fetch = async u => { u = String(u); if (/firestore\.googleapis\.com/.test(u)) return new Response('{}'); if (sparite.has(u)) return new Response('', { status: 404 }); return prima(u); };
  const tok = { authorization: 'Bearer a.' + btoa(JSON.stringify({ user_id: 'u1' })) + '.c' };
  const ctl = async () => (await (await W.default.fetch(new Request('https://x/api/gz', { method: 'POST', headers: tok, body: JSON.stringify({ db: 'controlla' }) }), cfg, contesto)).json()).controllo;
  oggetto.sql.exec("UPDATE ricette SET json = json_remove(json_set(json, '$.v', 4), '$.esito')");   // tutte come appena lette, senza esito
  const c1 = await ctl(), tot = c1.totale;
  prova('C123: le segnate si rileggono subito, 10 per volta: quelle uguali su GZ diventano «uguali all\'originale»', c1.nOriginali === 10 && c1.nMale === tot - 10 && c1.ok + c1.nMale + c1.nOriginali === tot && c1.originali.every(m => m.esito === 'uguale'));
  await ctl(); const c3 = await ctl();
  prova('C123: a ogni controllo diminuiscono, alla fine 0 ancora da rileggere', c3.nMale === 0 && c3.nOriginali === tot && (await ponte.vecchie(50)).length === 0);
  const c4 = await ponte.controlla();
  prova('C123: il controllo di ogni giorno NON le rimette da rileggere (niente giro infinito)', c4.nMale === 0 && c4.nOriginali === tot && (await ponte.vecchie(50)).length === 0);
  const due = oggetto.sql.exec('SELECT id, url FROM ricette LIMIT 2').toArray();
  oggetto.sql.exec("UPDATE ricette SET json = json_remove(json_set(json, '$.v', 0), '$.esito') WHERE id IN (?, ?)", due[0].id, due[1].id);
  sparite.add(due[0].url);
  const c5 = await ctl();
  prova('C123: pagina tolta da GZ (404) = «sparita», si tiene la copia', c5.originali.some(m => m.id === due[0].id && m.esito === 'sparita') && !!(await ponte.una(due[0].id)) && c5.nMale === 0);
  oggetto.sql.exec("UPDATE ricette SET json = json_remove(json_set(json, '$.v', 0), '$.esito') WHERE id = ?", due[1].id);
  gzGiu = true;
  for (let i = 0; i < 3; i++) { await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci(); }
  gzGiu = false;
  const j3 = JSON.parse(oggetto.sql.exec('SELECT json FROM ricette WHERE id = ?', due[1].id).toArray()[0].json);
  prova('C123: GZ giù 3 volte = «illeggibile», non resta in testa alla fila (PT E29)', j3.esito === 'illeggibile' && j3.v === 4 && j3.prove === 3);
  const c6 = await ctl();
  prova('C123: un giorno dopo l\'«illeggibile» si riprova e, uguale su GZ, diventa «uguale all\'originale»', c6.nMale === 0 && c6.originali.some(m => m.id === due[1].id && m.esito === 'uguale'));
  oggetto.sql.exec("INSERT INTO scelte (id, url, nome, zona, categoria, foto, aggiunta) VALUES ('gz:Culurgiones', 'https://ricette.giallozafferano.it/Culurgiones.html', 'Culurgiones', 'sarda', '', '', ?)", Date.now());
  const c7 = await ctl();
  prova('C123: ricetta del ricettario senza la ricetta intera → letta subito, 0 mancanti', c7.mancanti === 0 && !!(await ponte.una('gz:Culurgiones')));
  const { esaminaRicetta } = await import(pathToFileURL(join(radice, 'gz.mjs')).href);
  const ric = foto7 => ({ nome: 'Risotto', foto: 'x.jpg', ingredienti: [{ nome: 'riso' }, { nome: 'brodo' }], passi: [
    { t: 'Versate il brodo [[4]] e il riso [[5]], poi un mestolo alla volta [[6]] [[7]] fino a cottura.', foto: ['r_4.jpg', 'r_5.jpg', 'r_6.jpg'] },
    { t: 'Mantecate col burro [[8]] [[9]] e servite subito ben caldo.', foto: [foto7, 'r_8.jpg', 'r_9.jpg'] }] });
  prova('C123: foto citata nel passo 2 ma messa da GZ nel passo 3 = non manca', !esaminaRicetta(ric('r_7.jpg')).some(p => /foto mancant/.test(p)));
  prova('C123: foto citata che non c\'è in nessun passo = «1 foto mancante»', esaminaRicetta(ric('r_10.jpg')).includes('passo 1: 1 foto mancante'));
  globalThis.fetch = prima; await finisci();
}
// C119: passaggio delle foto di GZ per «✨ Migliora con l'AI»: solo foto di www.giallozafferano.it/images, mai altri siti
{ const prima = globalThis.fetch, chieste = [];
  globalThis.fetch = async u => { u = String(u); if (/firestore\.googleapis\.com/.test(u)) return new Response('{}'); chieste.push(u); return /\.jpg$/.test(u) ? new Response(new Uint8Array([255, 216, 255, 1, 2]), { headers: { 'content-type': 'image/jpeg' } }) : new Response('<html>', { headers: { 'content-type': 'text/html' } }); };
  const tok = { authorization: 'Bearer a.' + btoa(JSON.stringify({ user_id: 'u1' })) + '.c' };
  const fg = async (u, h = tok) => W.default.fetch(new Request('https://x/api/foto-gz', { method: 'POST', headers: h, body: JSON.stringify({ u }) }), cfg, contesto);
  const buona = await fg('https://www.giallozafferano.it/images/ricette/6/648/asticeok_seq3.jpg');
  prova('C119: foto di GZ passata (200, è una foto, tenuta 30 giorni)', buona.status === 200 && buona.headers.get('content-type') === 'image/jpeg' && /max-age=2592000/.test(buona.headers.get('cache-control')) && (await buona.arrayBuffer()).byteLength === 5);
  const no = [await fg('https://example.com/a.jpg'), await fg('https://www.giallozafferano.it/images/../ricette.html'), await fg('https://www.giallozafferano.it/ricette/x.jpg'), await fg('http://www.giallozafferano.it/images/a.jpg'), await fg('https://www.giallozafferano.it/images/a.jpg?x=1')];
  prova('C119: altri siti, cartelle fuori da /images, http e indirizzi strani → 400', no.every(r => r.status === 400) && chieste.length === 1);
  prova('C119: senza accesso da gestore niente foto (403)', (await fg('https://www.giallozafferano.it/images/a.jpg', {})).status === 403 && chieste.length === 1);
  const html = await fg('https://www.giallozafferano.it/images/finta.png');
  prova('C119: se GZ non dà una foto → 502 col motivo', html.status === 502 && /non è una foto/.test((await html.json()).errore));
  globalThis.fetch = prima; await finisci();
}
// C124 (Mario 10/11 «ricette per fitness… poche calorie e grassi cattivi, attenzione a sale e zuccheri»): valori per porzione
{ const { gzNutrizione, gzSoloNutr } = await import(pathToFileURL(join(radice, 'gz.mjs')).href);
  const li = (n, v, u = 'g') => `<li><span class="gz-list-macros-name"><span>${n}</span></span><span class="gz-list-macros-unit"><span>${u}</span></span><span class="gz-list-macros-value"><span>${v}</span></span></li>`;
  const macro = (kcal, prot) => `<div class="gz-list-macros-container"><ul>${li('Energia', kcal, 'Kcal')}${li('Proteine', prot)}${li('&nbsp;&nbsp;di cui saturi', '2,1')}${li('Sodio', '380', 'mg')}</ul></div>`;
  const n1 = gzNutrizione(macro('412,5', '32,4'), { nutrition: { calories: '999 kcal', fatContent: '9,5 g', sugarContent: '1,2 g' } });
  prova('C124: valori dall\'HTML (virgole decimali), il JSON-LD solo per quelli che mancano', n1.kcal === 412.5 && n1.prot === 32.4 && n1.saturi === 2.1 && n1.sodio === 380 && n1.grassi === 9.5 && n1.zuc === 1.2);
  prova('C124: un valore che manca è null, mai 0', n1.fibre === null && n1.carb === null);
  prova('C124: senza calorie né proteine = nessun valore', gzNutrizione('', { nutrition: { fatContent: '3 g' } }) === null && gzNutrizione('', {}) === null);
  const ldR = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Recipe', name: 'x' })}</script>`;
  prova('C124: pagina che non è una ricetta = undefined (si riprova), ricetta senza valori = null', gzSoloNutr('<html></html>') === undefined && gzSoloNutr(ldR) === null);

  /* rilettura delle ricette salvate prima (senza valori): 10 per giro, esito sempre scritto */
  oggetto.sql.exec('DELETE FROM ricette'); oggetto.sql.exec('DELETE FROM coda'); oggetto.sql.exec('DELETE FROM scelte');
  oggetto.mettiParoleFit([]); oggetto.metti1('pausa', '');
  for (let i = 0; i < 12; i++) { oggetto.salva({ id: 'gz:Fit-' + i, url: `https://ricette.giallozafferano.it/Fit-${i}.html`, nome: 'Fit ' + i, v: 4, ingredienti: [], passi: [] }); oggetto.aggiungi({ id: 'gz:Fit-' + i, nome: 'Fit ' + i }); }
  const prima = globalThis.fetch, lette = [];
  globalThis.fetch = async (u, o) => { u = String(u); const m = /\/Fit-(\d+)\.html$/.exec(u); if (!m) return prima(u, o); lette.push(+m[1]);
    if (m[1] === '10') return new Response('', { status: 404 }); if (m[1] === '11') return new Response('giù', { status: 503 });
    return new Response(ldR.replace('"x"', '"Fit"') + macro(String(300 + +m[1] * 10), String(20 + +m[1]))); };
  let s0 = await ponte.statoDb();
  prova('C124: 12 ricette senza valori da leggere', s0.senzaValori === 12 && s0.conValori === 0);
  await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci();
  let s1 = await ponte.statoDb();
  prova('C124: un giro legge 10 ricette, solo la pagina (niente video)', lette.length === 10 && s1.senzaValori === 2 + lette.filter(n => n === 11).length);
  for (let i = 0; i < 4; i++) { await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci(); }
  s1 = await ponte.statoDb();
  const j10 = await ponte.una('gz:Fit-10'), j11 = await ponte.una('gz:Fit-11'), j3 = await ponte.una('gz:Fit-3');
  prova('C124: pagina sparita = senza valori; rete giù 3 volte = senza valori (mai fermi, PT E29)', j10.nutr === null && j11.nutr === null && j11.nutrProve === 3 && lette.filter(n => n === 11).length === 3);
  prova('C124: alla fine 10 con valori, 0 da leggere, nessuna riletta due volte', s1.conValori === 10 && s1.senzaValori === 0 && lette.filter(n => n === 3).length === 1 && j3.nutr.kcal === 330 && j3.nutr.prot === 23);
  const sc = await ponte.scelte(), x3 = sc.find(x => x.id === 'gz:Fit-3'), x10 = sc.find(x => x.id === 'gz:Fit-10');
  prova('C124: il ricettario porta i valori al telefono (per filtrare anche senza rete)', x3.nutr && x3.nutr.prot === 23 && x3.nutr.kcal === 330 && x3.nutr.sodio === 380 && !('colest' in x3.nutr) && x10.nutr === null);
  oggetto.salva({ id: 'gz:Nuova', url: 'https://ricette.giallozafferano.it/Nuova.html', nome: 'Nuova', nutr: { kcal: 200, prot: 25 } });
  oggetto.salva({ id: 'gz:Senza', url: 'https://ricette.giallozafferano.it/Senza.html', nome: 'Senza', nutr: null });
  prova('C124: le ricette lette col lettore nuovo hanno già l\'esito: non si rileggono', !(await ponte.senzaNutr(20)).length && (await ponte.statoDb()).conValori === 11);
  oggetto.sql.exec("UPDATE ricette SET nutr = NULL, json = json_remove(json, '$.nutr') WHERE id = 'gz:Fit-1'"); oggetto.metti1('pausa', '1'); lette.length = 0;
  await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci();
  prova('C124: in pausa niente riletture dei valori', lette.length === 0);
  oggetto.metti1('pausa', ''); globalThis.fetch = prima;
}
// C124: corsia «fit» del motore (una pagina su 4) con le parole cambiabili dalla pagina Database
{ const prima = globalThis.fetch, chieste = [];
  const cartaF = n => `<article class="gz-card"><a href="https://ricette.giallozafferano.it/${n}.html" title="${n}"></a><h2 class="gz-title"><a>${n}</a></h2></article>`;
  globalThis.fetch = async (u, o) => { u = String(u);
    if (u === 'https://www.giallozafferano.it/ricerca-ricette/petto+di+pollo/') { chieste.push(u); return new Response(Array.from({ length: 15 }, (_, i) => cartaF('Pollo-' + i)).join('') + '<link rel="next" href="https://www.giallozafferano.it/ricerca-ricette/page2/petto+di+pollo/">'); }
    if (u === 'https://www.giallozafferano.it/ricerca-ricette/page2/petto+di+pollo/') { chieste.push(u); return new Response(cartaF('Pollo-15') + cartaF('Pollo-16')); }
    if (u === 'https://www.giallozafferano.it/ricerca-ricette/tonno/') { chieste.push(u); return new Response(cartaF('Tonno-0')); }
    if (/ricerca-ricette|ricette-cat/.test(u)) chieste.push(u);
    return prima(u, o); };
  oggetto.sql.exec('DELETE FROM coda'); oggetto.mettiParoleFit(['petto di pollo', 'tonno']);
  const giro = async () => { oggetto.sql.exec('DELETE FROM coda'); oggetto.metti1('pagine', 1); await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci(); };
  await giro(); let s = await ponte.statoDb();
  prova('C124 fit: la pagina 1 su 4 cerca la prima parola, pagina dopo ricordata', chieste[0] === 'https://www.giallozafferano.it/ricerca-ricette/petto+di+pollo/' && /page2\/petto\+di\+pollo/.test(s.paginaFit) && s.fitI === 0);
  await giro(); s = await ponte.statoDb();
  prova('C124 fit: finite le pagine, la parola dopo', chieste[1] === 'https://www.giallozafferano.it/ricerca-ricette/page2/petto+di+pollo/' && s.fitI === 1 && s.paginaFit === '');
  await giro(); s = await ponte.statoDb();
  prova('C124 fit: finite le parole, «fine» fino al prossimo giro completo', chieste[2] === 'https://www.giallozafferano.it/ricerca-ricette/tonno/' && s.paginaFit === 'fine' && s.fitI === 0);
  await giro();
  prova('C124 fit: dopo «fine» le pagine 1 su 4 tornano alle altre sezioni', chieste.length === 4 && !/petto|tonno/.test(chieste[3]));
  prova('C124 fit: le ricette trovate entrano nel ricettario come le altre', !!(await ponte.una('gz:Pollo-0')) && (await ponte.scelte()).some(x => x.id === 'gz:Pollo-0'));
  let j = await (await chiedi({ db: 'fit', parole: 'Pollo, tonno; Orata!, a, pollo' })).json();
  prova('C124 fit: parole cambiate dall\'app, pulite, senza doppioni né parole di 1 lettera', JSON.stringify(j.db.paroleFit) === '["pollo","tonno","orata"]' && j.db.paginaFit === '' && j.db.fitI === 0);
  j = await (await chiedi({ db: 'fit', base: true })).json();
  prova('C124 fit: «rimetti quelle di base»', j.db.paroleFit.length === 25 && j.db.paroleFit[0] === 'proteiche' && j.db.paroleFit.includes('budino proteico'));
  oggetto.mettiParoleFit(['proteiche', 'light', 'petto di pollo', 'fesa di tacchino', 'merluzzo', 'salmone', 'tonno', 'albumi', 'gamberi', 'polpo', 'pesce spada', 'orata', 'ceci', 'lenticchie', 'ricotta', 'yogurt greco', 'bresaola', 'uova']);
  s = await ponte.statoDb();
  prova('C125 fit: la base vecchia salvata uguale diventa la base nuova (con snack e dolci)', s.paroleFit.length === 25 && s.paroleFit.includes('proteine in polvere'));
  oggetto.mettiParoleFit(['pollo', 'tonno']); s = await ponte.statoDb();
  prova('C125 fit: le parole cambiate da Mario restano sue', JSON.stringify(s.paroleFit) === '["pollo","tonno"]');
  prova('C124 fit: senza accesso di chi gestisce niente', (await chiedi({ db: 'fit', parole: 'x' }, false)).status === 403);
  globalThis.fetch = prima; oggetto.mettiParoleFit(null);
}
// C124 passo 8 (Mario 10/11 «altre fonti migliori… segnami la fonte», «piano piano in automatico»): RicetteFit
{ const { rfRicetta, rfElenco, urlRf, idRf, urlDaIdRf, ingredienteRf } = await import(pathToFileURL(join(radice, 'rf.mjs')).href);
  const { esaminaRicetta } = await import(pathToFileURL(join(radice, 'gz.mjs')).href);
  const F = 'https://www.ricettefit.it/wp-content/uploads/2026/04/';
  const paginaRf = (slug, o = {}) => `<html><head><meta property="og:image" content="${F}${slug}-foto.webp"/></head><body>
    <img srcset="${F}${slug}-foto.webp 1920w, ${F}${slug}-foto-300x200.webp 300w, ${F}${slug}-foto-1024x683.webp 1024w, ${F}${slug}-foto-768x512.webp 768w">
    <span>Difficoltà: <b>${o.diff || 'Principiante'}</b></span>
    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage' }, { '@type': 'Recipe', name: o.nome || 'Pollo fit ' + slug,
      description: 'Petto di pollo &amp; limone, leggero.', image: [F + slug + '-500x500.webp'], author: { '@type': 'Person', name: 'La Cuoca Fit' }, recipeYield: '2', recipeCategory: ['Secondi'],
      prepTime: 'PT0H10M', cookTime: 'PT0H15M', totalTime: 'PT0H25M',
      recipeIngredient: o.ing || ['300 g Petto di pollo', '1 pz Limone', '10 ml Olio extravergine', 'Sale q.b.'],
      recipeInstructions: o.passi || [{ '@type': 'HowToStep', name: 'Tagliare il pollo', text: 'Taglia il petto di pollo a strisce sottili e regolari.', image: F + slug + '-passo1.webp' },
        { '@type': 'HowToStep', name: 'Cuocere', text: 'Cuoci in padella antiaderente per 8 minuti, girando spesso.', image: '' }],
      nutrition: { '@type': 'NutritionInformation', calories: '320 calories', proteinContent: '38.5 grams', fatContent: '9.1 grams', saturatedFatContent: '1.6 grams', sugarContent: '0.4 grams', sodiumContent: '310 milligrams', transFatContent: '6.2 grams' } }] })}</script>
    <h2>Domande frequenti (FAQ)</h2><div class="dr-faqs-list"><div class="dr-faq-item"><div class="dr-faq-title-wrap"><h3 class="dr-title">
    Posso usare il tacchino?</h3></div><div class="dr-faq-content-wrap"><p><p>Sì, la fesa di tacchino va benissimo.</p></p></div></div></div></section><h2>Altro</h2></body></html>`;
  const u1 = 'https://www.ricettefit.it/ricetta/pollo-al-limone/';
  const r = rfRicetta(paginaRf('pollo-al-limone'), u1);
  prova('RicetteFit: id «rf:» e indirizzo all\'originale', r.id === 'rf:pollo-al-limone' && r.url === u1 && idRf(u1) === r.id && urlDaIdRf(r.id) === u1);
  prova('RicetteFit: foto grande da 1024 px (non il ritaglio da 500 del JSON-LD, PT E45)', r.foto === F + 'pollo-al-limone-foto-1024x683.webp');
  prova('RicetteFit: passi col titolo davanti e la loro foto', r.passi.length === 2 && r.passi[0].t === 'Tagliare il pollo. Taglia il petto di pollo a strisce sottili e regolari.' && r.passi[0].foto[0] === F + 'pollo-al-limone-passo1.webp' && !r.passi[1].foto.length);
  prova('RicetteFit: valori per porzione col punto decimale; mancanti null, mai 0; niente «trans»', r.nutr.kcal === 320 && r.nutr.prot === 38.5 && r.nutr.saturi === 1.6 && r.nutr.sodio === 310 && r.nutr.carb === null && r.nutr.fibre === null);
  prova('RicetteFit: ingredienti «quantità unità nome», «pz» senza unità, «Sale q.b.»', JSON.stringify(r.ingredienti.map(i => [i.nome, i.q, i.u])) === '[["Petto di pollo",300,"g"],["Limone",1,""],["Olio extravergine",10,"ml"],["Sale",null,""]]');
  prova('RicetteFit: difficoltà come quella di GZ (Principiante → Facile, Intermedio → Media)', r.difficolta === 'Facile' && rfRicetta(paginaRf('x', { diff: 'Intermedio' }), 'https://www.ricettefit.it/ricetta/x/').difficolta === 'Media');
  prova('RicetteFit: domande frequenti nel «Consiglio», tempi, porzioni, autore, testo pulito', r.consiglio === 'Posso usare il tacchino?\nSì, la fesa di tacchino va benissimo.' && r.prep === 10 && r.totale === 25 && r.porzioni === 2 && r.autore === 'La Cuoca Fit' && r.intro === 'Petto di pollo & limone, leggero.' && r.categoria === 'Secondi');
  prova('RicetteFit: la ricetta letta passa il controllo delle ricette (C83)', esaminaRicetta(r).length === 0 && r.v === 4);
  prova('RicetteFit: solo pagine di ricetta di ricettefit.it (mai un proxy aperto)', !urlRf('https://evil.it/ricetta/x/') && !urlRf('http://www.ricettefit.it/ricetta/x/') && !urlRf('https://www.ricettefit.it/wp-admin/') && !urlRf('https://www.ricettefit.it/ricetta/') && urlRf('https://ricettefit.it/ricetta/x') === 'https://www.ricettefit.it/ricetta/x/');
  prova('RicetteFit: pagina che non è una ricetta = null', rfRicetta('<html></html>', u1) === null && rfRicetta(paginaRf('y'), 'https://evil.it/ricetta/y/') === null);
  prova('RicetteFit: «2 Uova» senza unità, «1/2 Limone» al modo di GZ', JSON.stringify(ingredienteRf('2 Uova')) === '{"nome":"Uova","q":2,"u":"","nota":""}' && ingredienteRf('Farina 00 300 g').q === 300);
  const mappa = ['https://www.ricettefit.it/ricetta/', u1, 'https://www.ricettefit.it/ricetta/rf-corta/', 'https://www.ricettefit.it/ricetta/rf-giu/', u1, 'https://www.ricettefit.it/ricetta/rf-buona/'];
  const xml = `<urlset>${mappa.map(u => `<url><loc>${u}</loc><image:image><image:loc>${F}a.webp</image:loc></image:image></url>`).join('')}</urlset>`;
  prova('RicetteFit: elenco dalla sitemap senza indice, foto né doppioni', JSON.stringify(rfElenco(xml)) === JSON.stringify([u1, 'https://www.ricettefit.it/ricetta/rf-corta/', 'https://www.ricettefit.it/ricetta/rf-giu/', 'https://www.ricettefit.it/ricetta/rf-buona/']));

  // il motore: una ricetta nuova per giro, in testa alla coda, mai ferma su una pagina rotta (PT E29)
  const prima = globalThis.fetch, chiesteRf = [];
  globalThis.fetch = async (u, o) => { u = String(u);
    if (u.startsWith('https://www.ricettefit.it/')) { chiesteRf.push(u);
      if (u === 'https://www.ricettefit.it/recipe-sitemap.xml') return new Response(xml);
      if (u.endsWith('/rf-giu/')) return new Response('giù', { status: 503 });
      if (u.endsWith('/rf-corta/')) return new Response(paginaRf('rf-corta', { passi: [{ '@type': 'HowToStep', text: 'Un passo solo, troppo poco.' }] }));
      return new Response(paginaRf(u.split('/').slice(-2)[0])); }
    return prima(u, o); };
  oggetto.mettiParoleFit([]); oggetto.metti1('rfSpento', ''); oggetto.sql.exec('DELETE FROM coda');
  const giro = async () => { await W.default.scheduled({ cron: '*/10 * * * *' }, cfg, contesto); await finisci(); return ponte.statoDb(); };
  let s = await giro();
  prova('RicetteFit motore: giro 1 legge la prima (in testa alla coda) e la mette nel ricettario', s.rf.lette === 1 && !!(await ponte.una('rf:pollo-al-limone')) && (await ponte.scelte()).some(x => x.id === 'rf:pollo-al-limone' && x.url === u1 && x.nutr && x.nutr.prot === 38.5));
  prova('RicetteFit motore: elenco e posizione ricordati', s.rf.i === 1 && s.rf.tot === 4 && s.rf.inCoda === 0);
  s = await giro();
  prova('RicetteFit motore: incompleta (1 passo) = scartata, mai riprovata', s.rf.scartate === 1 && !(await ponte.una('rf:rf-corta')));
  for (let k = 0; k < 4; k++) s = await giro();   // 3 tentativi; al 4° giro va fra le scartate
  prova('RicetteFit motore: pagina giù riprovata 3 volte, poi scartata (mai ferma)', s.rf.scartate === 2 && chiesteRf.filter(u => u.endsWith('/rf-giu/')).length === 3 && s.rf.inCoda === 0);
  s = await giro(); s = await giro();
  const mappeOggi = chiesteRf.filter(u => u.endsWith('sitemap.xml')).length;
  prova('RicetteFit motore: finito l\'elenco «fine» per oggi, posizione da capo; tutte le buone lette', s.rf.lette === 2 && !!(await ponte.una('rf:rf-buona')) && !!s.rf.fine && s.rf.i === 0);
  s = await giro();
  prova('RicetteFit motore: dopo «fine» oggi l\'elenco non si richiede più', chiesteRf.filter(u => u.endsWith('sitemap.xml')).length === mappeOggi);
  // il telefono: apre, aggiunge, accende e spegne
  let j = await (await chiedi({ u: 'https://www.ricettefit.it/ricetta/carbonara-fit/' })).json();
  prova('RicetteFit telefono: ricetta aperta dall\'app e salvata nel database', j.ricetta && j.ricetta.id === 'rf:carbonara-fit' && !!(await ponte.una('rf:carbonara-fit')));
  j = await (await chiedi({ u: 'https://evil.it/ricetta/x/' })).json();
  prova('RicetteFit telefono: indirizzo di un altro sito rifiutato', j.errore === 'indirizzo non valido');
  j = await (await chiedi({ db: 'aggiungi', r: { id: 'rf:nuova-fit', nome: 'Nuova fit', foto: F + 'n.webp', zona: 'italiana' } })).json();
  prova('RicetteFit telefono: «➕ Aggiungi» col suo indirizzo e la sua foto; la ricetta intera letta subito', j.scelte.some(x => x.id === 'rf:nuova-fit' && x.url === 'https://www.ricettefit.it/ricetta/nuova-fit/' && x.foto === F + 'n.webp') && !!(await ponte.una('rf:nuova-fit')));
  j = await (await chiedi({ db: 'rf', acceso: false })).json();
  const nGiri = chiesteRf.length; oggetto.metti1('rfFine', ''); await giro();
  prova('RicetteFit: spenta dall\'app (senza Claude) = nessuna richiesta a RicetteFit', j.db.rf.spento === true && chiesteRf.length === nGiri);
  j = await (await chiedi({ db: 'rf', acceso: true })).json();
  prova('RicetteFit: riaccesa; senza accesso di chi gestisce niente', j.db.rf.spento === false && (await chiedi({ db: 'rf', acceso: false }, false)).status === 403);
  globalThis.fetch = prima; oggetto.mettiParoleFit(null);
}
console.log(`${ok} OK, ${no} NO`);
process.exit(no ? 1 : 0);
