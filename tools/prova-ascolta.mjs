/* Prova dell'«ascolto preciso» del server (ascolta.mjs, C105) con Whisper e Groq FINTI: niente rete, niente chiavi.
   Uso: node tools/prova-ascolta.mjs   (esce con 1 se una prova fallisce) */
import { ascolta, correggiAscolto, pulisciCorretto, pulisciAscolto, promptAscolto } from '../ascolta.mjs';

let ok = 0, ko = 0;
const prova = (nome, vero, dettaglio = '') => { if (vero) { ok++; console.log('OK  ' + nome); } else { ko++; console.log('NO  ' + nome + (dettaglio ? ' → ' + dettaglio : '')); } };
const PIATTI = ['Lasagne semplici', 'Lasagne al ragù', 'Lasagne particolari', 'Polpette di carne', 'Culurgiones'];
const AUDIO = Buffer.from('audio finto di prova').toString('base64');
const json = (o, status = 200) => ({ ok: status < 300, status, json: async () => o });

/* un «Groq» finto: whisper v3, whisper turbo e correttore rispondono come gli si dice; registra cosa riceve */
function finti({ v3 = 'Due teglie di lasagne persa a Mato.', turbo = 'turbo', cf = 'Dette di lasagne per sabato.', corretto = 'Due teglie di lasagne per sabato.', erroreV3 = false, erroreCorr = false, lento = false } = {}) {
  const chiamate = [];
  const f = async (url, o) => {
    if (/transcriptions/.test(url)) {
      const modello = o.body.get('model'); chiamate.push({ tipo: 'whisper', modello, prompt: o.body.get('prompt'), lingua: o.body.get('language'), file: o.body.get('file') });
      if (modello === 'whisper-large-v3') return erroreV3 ? json({ error: { message: 'rate limit' } }, 429) : json({ text: v3 });
      return json({ text: turbo });
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
console.log(`\n${ok} OK, ${ko} NO`);
process.exit(ko ? 1 : 0);
