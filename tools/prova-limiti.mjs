/* Prova del server (C108, C109) con memoria finta, senza Cloudflare: limiti per persona (mai fermi, segnalazioni solo a Mario,
   modo ridotto) e catena delle AI dei clienti (Groq per primo, Cloudflare per ultimo). Uso: node tools/prova-limiti.mjs */
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(radice, 'worker.js'), 'utf8')
  .replace("import { DurableObject } from 'cloudflare:workers';", 'class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }')
  .replace("from './gz.mjs'", `from '${pathToFileURL(path.join(radice, 'gz.mjs'))}'`).replace("from './rf.mjs'", `from '${pathToFileURL(path.join(radice, 'rf.mjs'))}'`).replace("from './ascolta.mjs'", `from '${pathToFileURL(path.join(radice, 'ascolta.mjs'))}'`)
  + '\nexport { Avvisi as _Avvisi, limitiAIC as _limitiAIC, chiediAI as _chiediAI, TETTO_AIC as _TETTO };\n';
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pit-')), 'worker.mjs'); fs.writeFileSync(tmp, src);
const { _Avvisi: Avvisi, _limitiAIC: limitiAIC, _chiediAI: chiediAI, _TETTO: TETTO } = await import(pathToFileURL(tmp));
const mem = new Map(); const ctx = { storage: { get: async k => structuredClone(mem.get(k)), put: async (k, v) => { mem.set(k, structuredClone(v)); } } };
const av = new Avvisi(ctx, {}); const mandati = [];
av.manda = async (uid, per, pc, extra) => { mandati.push({ uid, per, ...extra }); };
let ok = 0, no = 0; const atteso = (c, m) => { if (c) ok++; else { no++; console.log('NO', m); } };
mem.set('iscritti', [{ uid: 'monica', endpoint: 'https://a' }, { uid: 'mario', endpoint: 'https://b', dev: true }, { uid: 'mario', endpoint: 'https://c', dev: true }]);
// limiti dalle impostazioni
atteso(JSON.stringify(limitiAIC(null)) === '{"soglia":30,"ridotto":100}', 'base');
atteso(JSON.stringify(limitiAIC({ aicAvviso: { integerValue: '50' }, aicRidotto: { integerValue: '40' } })) === '{"soglia":50,"ridotto":51}', 'ridotto sopra soglia');
atteso(JSON.stringify(limitiAIC({ aicAvviso: { integerValue: '5000' } })) === '{"soglia":30,"ridotto":100}', 'tetto sicuro');
// un cliente normale, domande distanziate (finto orologio)
let t = Date.now(); const ora = Date.now; Date.now = () => t;
const lim = limitiAIC(null); const esiti = [];
for (let i = 1; i <= TETTO + 5; i++) { t += 61000; esiti.push(await av.contaAIC('laura', lim)); if (i === 59) { /* quota totale 60: altri clienti */ } }
const primoRidotto = esiti.indexOf('ridotto') + 1;
atteso(esiti.slice(0, 99).every(e => e === '') && esiti[99] === 'ridotto', 'le prime 99 con AI, la 100a ridotta');
console.log('primo ridotto alla domanda', primoRidotto, '· segnalazioni', mandati.map(m => m.cosa + ':' + m.n).join(' '));
atteso(mandati.every(m => m.uid === 'mario'), 'solo Mario');
atteso(mandati.filter(m => m.cosa === 'aiutante').length === 2, 'aiutante a 31 e 61 (una notifica per uid)');

atteso(mandati.filter(m => m.cosa === 'ridotto').length === 1, 'ridotto una volta');
atteso(!esiti.includes('tuo') && !esiti.includes('tetto'), 'mai blocco');
// raffica di un altro cliente, giorno nuovo
mem.delete('aic'); mandati.length = 0; const r = [];
for (let i = 0; i < 12; i++) { t += 2000; r.push(await av.contaAIC('robot', lim)); }
atteso(r.slice(0, 9).every(e => e === '') && r[9] === 'ridotto' && r[11] === 'ridotto', 'raffica: dalla 10a in un minuto ridotto ' + r.join(','));
atteso(mandati.filter(m => m.cosa === 'raffica').length === 1, 'raffica segnalata una volta');
t += 70000; atteso(await av.contaAIC('robot', lim) === '', 'dopo un minuto torna l\'AI');
// chi gestisce («guarda come»): niente conto a testa
atteso(await av.contaAIC(null, lim) === '', 'gestore');
const reg = mem.get('segnalazioni'); atteso(reg.length > 0 && reg.length <= 30, 'registro');
const conto = await av.contoAI(); atteso(conto.tetti.sogliaCliente === 30 && conto.tetti.raffica === 10 && Array.isArray(conto.segnalazioni), 'contoAI');
// iscrizione con dev
mem.set('iscritti', []); await av.iscrivi('m1', { endpoint: 'https://x' }, true); await av.iscrivi('mo', { endpoint: 'https://y' }, false);
atteso(mem.get('iscritti')[0].dev === true && !('dev' in mem.get('iscritti')[1]), 'iscrivi dev');
// quota di tutti: tanti clienti, 2 domande l'uno
mem.delete('aic'); mandati.length = 0; const q = [];
for (let i = 0; i < TETTO + 4; i++) { t += 61000; q.push(await av.contaAIC('c' + (i >> 1), lim)); }
atteso(q.slice(0, TETTO).every(e => e === '') && q[TETTO] === 'ridotto', 'quota: dopo ' + TETTO + ' risponde il telefono');
atteso(mandati.some(m => m.cosa === 'quota80' && m.n === Math.ceil(TETTO * 0.8)) && mandati.filter(m => m.cosa === 'quota').length === 1, 'quota80 e quota una volta');
Date.now = ora;
// C108: catena delle AI dei clienti
const risposta = JSON.stringify({ testo: 'Ciao', azioni: [] }); const chiamati = [];
const fetchVero = globalThis.fetch;
const prova = async (groq, cf) => { chiamati.length = 0;
  globalThis.fetch = async (u, o) => { const m = JSON.parse(o.body).model; chiamati.push('groq:' + m); const ok = groq.includes(m); return { ok, status: ok ? 200 : 429, json: async () => ({ choices: [{ message: { content: risposta } }] }) }; };
  const env = { GROQ_API_KEY: 'finta', AI: { run: async (m) => { chiamati.push('cf:' + m); if (cf.includes(m)) return { response: risposta }; throw new Error('4006 neurons'); } } };
  return chiediAI(env, 'ciao', '{}', [], null, true); };
let x = await prova(['qwen/qwen3.8-27b'], []); atteso(x.modello === 'groq:qwen/qwen3.8-27b' && chiamati.length === 1, 'cliente: Groq qwen per primo ' + chiamati);
x = await prova(['openai/gpt-oss-20b'], []); atteso(x.modello === 'groq:openai/gpt-oss-20b' && chiamati.length === 3, 'cliente: terzo modello Groq ' + chiamati);
x = await prova([], ['@cf/qwen/qwen3.8-27b']); atteso(x.modello === '@cf/qwen/qwen3.8-27b' && chiamati.length === 4, 'cliente: Cloudflare per ultimo ' + chiamati);
x = await prova([], []); atteso(x.fermo === 'ridotto' && /piatto/.test(x.testo) && !/domani/.test(x.testo), 'cliente: nessuno risponde → ridotto ' + JSON.stringify(x));
// Monica: resta Cloudflare per prima
chiamati.length = 0; globalThis.fetch = async () => { chiamati.push('groq'); return { ok: false, status: 429, json: async () => ({}) }; };
x = await chiediAI({ GROQ_API_KEY: 'finta', AI: { run: async (m) => { chiamati.push('cf:' + m); return { response: risposta }; } } }, 'ciao', '{}', [], null, false);
atteso(chiamati[0] === 'cf:@cf/qwen/qwen3.8-27b' && chiamati.length === 1, 'Monica: Cloudflare per prima ' + chiamati);
globalThis.fetch = fetchVero;
console.log(`${ok} OK, ${no} NO`);
process.exitCode = no ? 1 : 0;
