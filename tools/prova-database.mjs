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
// C81: controllo di tutte le ricette del database (una rovinata apposta torna da rileggere)
{ const una = oggetto.sql.exec('SELECT id FROM ricette LIMIT 1').toArray()[0];
  const c1 = await ponte.controlla();
  oggetto.sql.exec("UPDATE ricette SET json = json_set(json, '$.passi', json('[]'), '$.v', 4) WHERE id = ?", una.id);
  const c2 = await ponte.controlla(), rilette = await ponte.vecchie(50), st = await ponte.statoDb();
  prova('C81: controlla tutte le ricette, una rovinata contata e rimessa da rileggere', c2.totale === c1.totale && c2.nMale >= 1 && c2.ok + c2.nMale === c2.totale && c2.male.some(m => m.id === una.id && m.prob.includes('0 passi')) && rilette.length > 0 && st.controllo && st.controllo.quando === c2.quando);
}
console.log(`${ok} OK, ${no} NO`);
process.exit(no ? 1 : 0);
