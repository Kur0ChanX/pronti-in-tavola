/* Prova dell'«ascolto preciso» del server (ascolta.mjs, C105) con Whisper e Groq FINTI: niente rete, niente chiavi.
   Uso: node tools/prova-ascolta.mjs   (esce con 1 se una prova fallisce) */
import { ascolta, correggiAscolto, pulisciCorretto, pulisciAscolto, promptAscolto, paroleChiave } from '../ascolta.mjs';

let ok = 0, ko = 0;
const prova = (nome, vero, dettaglio = '') => { if (vero) { ok++; console.log('OK  ' + nome); } else { ko++; console.log('NO  ' + nome + (dettaglio ? ' → ' + dettaglio : '')); } };
const PIATTI = ['Lasagne semplici', 'Lasagne al ragù', 'Lasagne particolari', 'Polpette di carne', 'Culurgiones'];
const AUDIO = Buffer.from('audio finto di prova').toString('base64');
const json = (o, status = 200) => ({ ok: status < 300, status, json: async () => o });

/* un «Groq» finto: whisper v3, whisper turbo e correttore rispondono come gli si dice; registra cosa riceve */
function finti({ v3 = 'Due teglie di lasagne persa a Mato.', turbo = 'turbo', cf = 'Dette di lasagne per sabato.', corretto = 'Due teglie di lasagne per sabato.', erroreV3 = false, erroreCorr = false, lento = false, dg = 'Due teglie di lasagne per sabato.', erroreDg = false, erroreTurbo = false } = {}) {
  const chiamate = [];
  const f = async (url, o) => {
    if (/deepgram/.test(url)) {
      const q = new URL(url).searchParams; chiamate.push({ tipo: 'deepgram', modello: q.get('model'), lingua: q.get('language'), privacy: q.get('mip_opt_out'), chiavi: q.getAll('keyterm'), auth: o.headers.authorization, ct: o.headers['content-type'] });
      return erroreDg ? json({ err_msg: 'credito finito' }, 402) : json({ results: { channels: [{ alternatives: [{ transcript: dg, confidence: 0.93 }] }] } });
    }
    if (/transcriptions/.test(url)) {
      const modello = o.body.get('model'); chiamate.push({ tipo: 'whisper', modello, prompt: o.body.get('prompt'), lingua: o.body.get('language'), file: o.body.get('file') });
      if (modello === 'whisper-large-v3') return erroreV3 ? json({ error: { message: 'rate limit' } }, 429) : json({ text: v3 });
      return erroreTurbo ? json({ error: { message: 'rate limit' } }, 429) : json({ text: turbo });
    }
    const corpo = JSON.parse(o.body); chiamate.push({ tipo: 'correttore', corpo });
    if (lento) await new Promise((res, rej) => { const t = setTimeout(res, 3000); o.signal.addEventListener('abort', () => { clearTimeout(t); rej(new Error('abort')); }); });
    if (erroreCorr) return json({ error: 'giù' }, 503);
    return json({ choices: [{ message: { content: corretto } }] });
  };
  const env = { GROQ_API_KEY: 'finta', AI: { run: async (m, i) => { chiamate.push({ tipo: 'cf', modello: m, prompt: i.initial_prompt }); if (cf instanceof Error) throw cf; return { text: cf }; } } };
  return { f, env, chiamate };
}

// 1. il caso di Mario: due trascrizioni storpiate, il correttore le rimette a posto; v3 e Cloudflare in parallelo
{
  const { f, env, chiamate } = finti();
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f);
  prova('correttore: «Due teglie di lasagne per sabato.»', r.testo === 'Due teglie di lasagne per sabato.' && r.corretto === true, JSON.stringify(r));
  prova('le due trascrizioni tornano al telefono (v3 prima)', JSON.stringify(r.alternative) === JSON.stringify(['Due teglie di lasagne persa a Mato.', 'Dette di lasagne per sabato.']), JSON.stringify(r.alternative));
  const w = chiamate.find(c => c.tipo === 'whisper');
  prova('Groq usa whisper-large-v3 (non turbo), in italiano, file .mp4', w && w.modello === 'whisper-large-v3' && w.lingua === 'it' && w.file.name === 'voce.mp4');
  prova('Cloudflare chiamato anche lui', chiamate.some(c => c.tipo === 'cf' && c.modello === '@cf/openai/whisper-large-v3-turbo'));
  prova('niente turbo se il v3 risponde', !chiamate.some(c => c.modello === 'whisper-large-v3-turbo'));
  const c = chiamate.find(x => x.tipo === 'correttore');
  prova('correttore: menù e trascrizioni nella domanda, temperatura 0, senza «pensare»', c && /Lasagne al ragù/.test(c.corpo.messages[1].content) && /persa a Mato/.test(c.corpo.messages[1].content) && c.corpo.temperature === 0 && c.corpo.reasoning_effort === 'none');
  prova('prompt di Whisper: frase vera con le parole del menù', /^Pronti in Tavola, la cucina di Monica/.test(w.prompt) && /Culurgiones/.test(w.prompt) && w.prompt.length <= 600);
  prova('motore scritto nella risposta', /groq:whisper-large-v3\+cloudflare → qwen/.test(r.motore), r.motore);
}
// 2. limiti del v3 finiti e Cloudflare giù → Groq turbo
{
  const { f, env, chiamate } = finti({ erroreV3: true, cf: new Error('decode'), turbo: 'Un chilo di polpette per domani.', corretto: 'Un chilo di polpette di carne per domani.' });
  const r = await ascolta(env, AUDIO, 'audio/webm;codecs=opus', PIATTI, f);
  prova('v3 e Cloudflare giù → turbo, poi corretto', r.testo === 'Un chilo di polpette di carne per domani.' && chiamate.some(c => c.modello === 'whisper-large-v3-turbo'), JSON.stringify(r));
}
// 3. correttore giù (o lento) → la prima trascrizione, con le alternative per il telefono
{
  const { f, env } = finti({ erroreCorr: true });
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f);
  prova('correttore giù → trascrizione del v3 e alternative', r.testo === 'Due teglie di lasagne persa a Mato.' && r.corretto === false && r.alternative.length === 2, JSON.stringify(r));
  const l = finti({ lento: true });
  const t0 = Date.now(), c = await correggiAscolto(l.env, ['Dette di lasagne per sabato.'], PIATTI, l.f, 200);
  prova('correttore lento → si arrende in tempo (200 ms a modello)', c === null && Date.now() - t0 < 1500, String(Date.now() - t0));
}
// 4. trascrizioni uguali → una sola; «sì» → niente correttore
{
  const { f, env, chiamate } = finti({ v3: 'Sì.', cf: 'sì' });
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f);
  prova('«sì»: una sola alternativa e niente correttore (risposta subito)', r.testo === 'Sì.' && r.alternative.length === 1 && !chiamate.some(c => c.tipo === 'correttore'), JSON.stringify(r));
}
// 5. frasi inventate da Whisper sul silenzio e correttore che chiacchiera
{
  prova('«Sottotitoli creati dalla comunità Amara.org» scartata', pulisciAscolto('Sottotitoli creati dalla comunità Amara.org') === '');
  const { f, env } = finti({ v3: 'Sottotitoli creati dalla comunità Amara.org', cf: '', turbo: 'Grazie per la visione!' });
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f);
  prova('solo frasi inventate → «non ho capito» (testo vuoto)', r.testo === '' && /vuoto/.test(r.errore), JSON.stringify(r));
  const tt = ['Dette di lasagne per sabato.'];
  prova('correttore: «Frase corretta: …» tolto', pulisciCorretto('Frase corretta: «Due teglie di lasagne per sabato.»', tt) === 'Due teglie di lasagne per sabato.');
  prova('correttore: spiegazione lunga rifiutata', pulisciCorretto('Il cliente probabilmente voleva dire che desidera ordinare due teglie di lasagne al ragù per il giorno di sabato prossimo, come da menù', tt) === '');
  prova('correttore: pensiero <think> tolto', pulisciCorretto('<think>vediamo</think>\nDue teglie di lasagne per sabato.', tt) === 'Due teglie di lasagne per sabato.');
  prova('prompt: menù lungo tagliato da Groq a 600', promptAscolto(Array(60).fill('Piatto con un nome lungo')).length > 600);
}
// 6. senza chiave Groq: solo Cloudflare, niente correttore
{
  const { f, env } = finti(); delete env.GROQ_API_KEY;
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f);
  prova('senza chiave Groq → Cloudflare da solo', r.testo === 'Dette di lasagne per sabato.' && r.corretto === false && r.motore === 'cloudflare', JSON.stringify(r));
}
// 7. C108 «1»: CLIENTE con la chiave Deepgram → Groq v3 + Deepgram in parallelo, Cloudflare (salvadanaio di chi gestisce) non toccato
{
  const { f, env, chiamate } = finti(); env.DEEPGRAM_API_KEY = 'finta';
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f, { cliente: true });
  const d = chiamate.find(c => c.tipo === 'deepgram') || {};
  prova('cliente: v3 + Deepgram, niente Cloudflare', r.motore.startsWith('groq:whisper-large-v3+deepgram') && !chiamate.some(c => c.tipo === 'cf'), r.motore);
  prova('Deepgram: nova-3, italiano, «Token», tipo dell\'audio', d.modello === 'nova-3' && d.lingua === 'it' && d.auth === 'Token finta' && d.ct === 'audio/mp4', JSON.stringify(d));
  prova('Deepgram: privacy, l\'audio dei clienti non resta a Deepgram (mip_opt_out)', d.privacy === 'true', JSON.stringify(d));
  prova('Deepgram: parole chiave con misure e piatti', d.chiavi && d.chiavi.includes('teglie') && d.chiavi.includes('Lasagne al ragù'), JSON.stringify(d.chiavi));
  prova('correttore riceve le due trascrizioni', r.alternative.length === 2 && r.corretto === true, JSON.stringify(r));
}
// 8. Deepgram giù (credito finito) → riserva Groq turbo, così le trascrizioni restano due
{
  const { f, env, chiamate } = finti({ erroreDg: true }); env.DEEPGRAM_API_KEY = 'finta';
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f);
  prova('Deepgram giù → v3 + turbo, Cloudflare non serve', /groq:whisper-large-v3\+groq:whisper-large-v3-turbo/.test(r.motore) && !chiamate.some(c => c.tipo === 'cf'), r.motore);
}
// 9. tutto Groq e Deepgram giù → Cloudflare per ultimo: il cliente non resta mai senza ascolto
{
  const { f, env, chiamate } = finti({ erroreV3: true, erroreDg: true, erroreTurbo: true }); env.DEEPGRAM_API_KEY = 'finta';
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f);
  prova('tutto giù tranne Cloudflare → Cloudflare', r.testo !== '' && /cloudflare/.test(r.motore) && chiamate.some(c => c.tipo === 'cf'), JSON.stringify(r));
}
// 10. CHI GESTISCE (Monica, Mario) con la chiave Deepgram → resta su Groq v3 + Cloudflare: Deepgram è dei clienti
{
  const { f, env, chiamate } = finti(); env.DEEPGRAM_API_KEY = 'finta';
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f, { cliente: false });
  prova('gestore: niente Deepgram', !chiamate.some(c => c.tipo === 'deepgram') && /groq:whisper-large-v3\+cloudflare/.test(r.motore), r.motore);
}
// 11. parole chiave: tetto (menù enorme) e pulizia
{
  const k = paroleChiave(Array.from({ length: 200 }, (_, i) => 'Piatto numero ' + i + ' (vegano)'));
  prova('parole chiave: massimo 80, misure sempre dentro, niente parentesi', k.length <= 80 && k.join(' ').length <= 1000 && k[0] === 'teglia' && !/[()]/.test(k.join('')), k.length + ' ' + k.slice(0, 8).join('|'));
}
// 12. (C108b) cliente «ridotto» (frasi del giorno di tutti i clienti finite): Cloudflare non si tocca, il cliente è ascoltato lo stesso
{
  const { f, env, chiamate } = finti({ turbo: 'Due teglie di lasagne per sabato.' });
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f, { cliente: true, ridotto: true });
  prova('ridotto senza Deepgram: v3 + turbo, niente Cloudflare', r.testo !== '' && /groq:whisper-large-v3\+groq:whisper-large-v3-turbo/.test(r.motore) && !chiamate.some(c => c.tipo === 'cf'), r.motore);
}
{
  const { f, env, chiamate } = finti({ erroreDg: true }); env.DEEPGRAM_API_KEY = 'finta';
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f, { cliente: true, ridotto: true });
  prova('ridotto con Deepgram giù: v3 + turbo, niente Cloudflare', /groq:whisper-large-v3\+groq:whisper-large-v3-turbo/.test(r.motore) && !chiamate.some(c => c.tipo === 'cf'), r.motore);
}
{
  const { f, env, chiamate } = finti({ erroreV3: true, erroreTurbo: true });
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f, { cliente: true, ridotto: true });
  prova('ridotto e Groq giù: Cloudflare per ultimo, mai fermo', r.testo !== '' && /cloudflare/.test(r.motore) && chiamate.filter(c => c.tipo === 'cf').length === 1, JSON.stringify(r));
}
{
  const { f, env, chiamate } = finti({ erroreV3: true, turbo: 'Un chilo di polpette per domani.' });
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f, { cliente: true, ridotto: true });
  prova('ridotto, risponde solo turbo: basta lui, Cloudflare no', /groq:whisper-large-v3-turbo/.test(r.motore) && !chiamate.some(c => c.tipo === 'cf'), r.motore);
}
{
  const { f, env } = finti();
  const r = await ascolta(env, AUDIO, 'audio/mp4', PIATTI, f, { cliente: false, ridotto: true });
  prova('chi gestisce: «ridotto» non lo tocca (resta Groq v3 + Cloudflare)', /groq:whisper-large-v3\+cloudflare/.test(r.motore), r.motore);
}
// 13. (C108b, PT E41) il conto del server: mai un blocco, segnalazioni solo a Mario, oltre il tetto di tutti «ridotto»
{
  const fs = await import('node:fs'), os = await import('node:os'), path = await import('node:path'), { pathToFileURL, fileURLToPath } = await import('node:url');
  const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const src = fs.readFileSync(path.join(radice, 'worker.js'), 'utf8')
    .replace("import { DurableObject } from 'cloudflare:workers';", 'class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }')
    .replace("from './gz.mjs'", `from '${pathToFileURL(path.join(radice, 'gz.mjs'))}'`).replace("from './ascolta.mjs'", `from '${pathToFileURL(path.join(radice, 'ascolta.mjs'))}'`)
    + '\nexport { Avvisi as _Avvisi, TETTO_ASCOLTO as _TA, TETTO_ASCOLTO_CLIENTE as _TAC, numeroApp as _numeroApp };\n';
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pit-asc-')), 'worker.mjs'); fs.writeFileSync(tmp, src);
  const { _Avvisi: Avvisi, _TA: TA, _TAC: TAC, _numeroApp: numeroApp } = await import(pathToFileURL(tmp));
  const mem = new Map(), ctx = { storage: { get: async k => structuredClone(mem.get(k)), put: async (k, v) => { mem.set(k, structuredClone(v)); } } };
  const av = new Avvisi(ctx, {}), mandati = [];
  av.manda = async (uid, per, pc, extra) => { mandati.push({ uid, per, ...extra }); };
  mem.set('iscritti', [{ uid: 'monica', endpoint: 'https://a' }, { uid: 'mario', endpoint: 'https://b', dev: true }]);
  const esiti = []; for (let i = 0; i < TAC * 3; i++) esiti.push(await av.contaAscolto('laura', TAC));
  prova('un cliente oltre la soglia: mai fermo', esiti.every(e => e === ''), [...new Set(esiti)].join(','));
  const asc = mandati.filter(m => m.cosa === 'ascolto');
  prova('segnalazione a ' + (TAC + 1) + ' e ' + (2 * TAC + 1) + ', solo a Mario', asc.length === 2 && asc[0].n === TAC + 1 && asc[1].n === 2 * TAC + 1 && mandati.every(m => m.uid === 'mario'), JSON.stringify(mandati));
  for (let i = 0; i < 5; i++) await av.contaAscolto(null);
  prova('chi gestisce non entra nel conto dei clienti', mem.get('asc').n === TAC * 3 && mem.get('asc').g === 5);
  const altri = []; for (let i = mem.get('asc').n; i < TA + 3; i++) altri.push(await av.contaAscolto('cliente' + (i % 50), TAC));
  prova('tetto di tutti: «ridotto» dalla ' + (TA + 1) + 'a, mai blocco', altri.slice(0, -3).every(e => e === '') && altri.slice(-3).every(e => e === 'ridotto'), altri.slice(-5).join(','));
  prova('tetto di tutti segnalato una volta', mandati.filter(m => m.cosa === 'ascoltoQuota').length === 1);
  prova('registro delle segnalazioni', (mem.get('segnalazioni') || []).some(s => s.cosa === 'ascolto' && s.cliente === 'laura'));
  prova('soglia dalle impostazioni nei tetti sicuri', numeroApp({ ascoltoAvviso: { integerValue: '80' } }, 'ascoltoAvviso', 10, 500, TAC) === 80 && numeroApp({ ascoltoAvviso: { integerValue: '9999' } }, 'ascoltoAvviso', 10, 500, TAC) === TAC);
}
console.log(`\n${ok} OK, ${ko} NO`);
process.exit(ko ? 1 : 0);
