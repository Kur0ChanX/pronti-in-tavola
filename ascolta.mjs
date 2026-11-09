/* «Ascolto preciso» dei clienti (C105) · SOLO nel Worker (worker.js lo importa; non va al telefono, non è in FILE_APP).
   Voce 5, 09/11/2026 (Mario dall'iPad: «non capisce bene e parlo normale»; detto «due teglie di lasagne per sabato»,
   scritto «Dette di lasagne per sabato» e «2 teglie di lasagna persa a Mato»).
   Strada: 1) due Whisper IN PARALLELO sullo stesso audio: Groq `whisper-large-v3` (il più preciso, non turbo) e Cloudflare
   `whisper-large-v3-turbo`; se nessuno risponde, Groq turbo. Voce 8, 09/11 (Mario: C108 «1», salvadanai separati): per i
   CLIENTI, con la chiave `DEEPGRAM_API_KEY`, i due in parallelo sono Groq v3 e Deepgram Nova-3 (parole chiave = menù e
   misure); riserve in ordine finché ce ne sono due: Groq turbo, Cloudflare per ultimo (è il salvadanaio di chi gestisce).
   Manuale Deepgram letto il 09/11/2026: POST /v1/listen, «Token», keyterm solo Nova-3, max 100 e 500 token. 2) Un CORRETTORE veloce (Groq, frase sola, temperatura 0) che
   con le trascrizioni e il menù rimette a posto solo le parole sentite male (piatti, giorni, quantità). Se il correttore
   manca o sbaglia, il telefono riceve le trascrizioni e sceglie quella con più senso sul menù (`scegliTrascrizione`).
   Manuali Groq letti il 09/11/2026: speech-to-text (modelli whisper-large-v3 e -turbo, mp4/m4a/webm/ogg/wav), reasoning
   (`qwen/qwen3.8-27b` accetta reasoning_effort "none"; `openai/gpt-oss-120b` "low"), limiti gratuiti. */

/* Il «prompt» di Whisper è il testo che viene PRIMA dell'audio: una frase vera in italiano con le parole giuste
   (non un elenco, e non un ordine intero, che Whisper potrebbe ricopiare se l'audio è poco chiaro). */
export const promptAscolto = piatti => `Pronti in Tavola, la cucina di Monica a Olbia. Si ordina a teglie da sei o da otto, al chilo, mezzo chilo, a etti o a pezzi, per oggi, domani, dopodomani, sabato o domenica. Nel menù: ${piatti.join(', ')}.`;

/* frasi che Whisper «inventa» sul silenzio o sul rumore (in italiano la più famosa è quella di Amara.org) */
const INVENTATE = /amara\.org|sottotitol|grazie (per la|della|per la vostra) (visione|attenzione)|iscriviti al canale|www\.|\.(com|it|org)\b/i;
export const pulisciAscolto = t => { t = String(t || '').replace(/\s+/g, ' ').trim(); return INVENTATE.test(t) ? '' : t.slice(0, 300); };
const chiave = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const CORRETTORE = `Sei il correttore dell'ascolto di una cucina da asporto italiana. Ricevi il menù e una o più trascrizioni automatiche DELLO STESSO audio di un cliente: possono avere parole sentite male (esempi: «Dette di lasagne» era «Due teglie di lasagne», «persa a Mato» era «per sabato»).
Scrivi la frase che il cliente ha detto davvero, in italiano corretto.
Regole:
- correggi solo le parole sentite male: piatti (scritti come nel menù), giorni, numeri e misure (teglia, teglie, chilo, mezzo chilo, etti, pezzi, porzioni);
- non aggiungere piatti, quantità, giorni o parole che nelle trascrizioni non ci sono;
- se il cliente nomina un piatto che nel menù corrisponde a più piatti (per esempio «lasagne» e nel menù ci sono tre lasagne), lascia la parola detta: non sceglierne uno;
- se è una domanda resta una domanda; non rispondere e non commentare;
- rispondi solo con la frase, su una riga.`;
/* modelli del correttore, in ordine: il primo non «pensa» (risponde in meno di un secondo), il secondo pensa poco */
export const MODELLI_CORRETTORE = [
  { model: 'qwen/qwen3.8-27b', reasoning_effort: 'none', max_tokens: 200 },
  { model: 'openai/gpt-oss-120b', reasoning_effort: 'low', max_tokens: 800 }
];
const testoRisposta = j => { const c = j && j.choices && j.choices[0] && j.choices[0].message; return c && typeof c.content === 'string' ? c.content : ''; };
/* la risposta del correttore si accetta solo se è UNA frase plausibile: niente spiegazioni, niente frasi molto più lunghe */
export function pulisciCorretto(out, testi) {
  let t = String(out || '').replace(/<think>[\s\S]*?<\/think>/gi, '').split('\n').map(s => s.trim()).find(Boolean) || '';
  t = t.replace(/^(frase( corretta)?|risposta|correzione|testo)\s*:\s*/i, '').replace(/^["«“'\s]+|["»”'\s]+$/g, '').trim();
  const lunga = Math.max(...testi.map(x => x.length));
  if (!t || t.length > lunga * 1.6 + 20 || /trascrizion|men[uù]\s*:|correttor/i.test(t)) return '';
  return pulisciAscolto(t);
}
export async function correggiAscolto(env, testi, piatti, f = (...a) => fetch(...a), attesaMs = 4500) {
  if (!env.GROQ_API_KEY || !testi.length) return null;
  if (testi.every(t => chiave(t).split(' ').length <= 2)) return null;   // «sì», «no», «grazie»: niente da correggere, risposta subito
  const messaggi = [{ role: 'system', content: CORRETTORE },
    { role: 'user', content: `Menù: ${piatti.join('; ') || '(non arrivato)'}\nTrascrizioni dello stesso audio:\n${testi.map((t, i) => `${i + 1}. ${t}`).join('\n')}` }];
  for (const m of MODELLI_CORRETTORE) {
    const ctl = new AbortController(), tempo = setTimeout(() => ctl.abort(), attesaMs);
    try {
      const r = await f('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', signal: ctl.signal,
        headers: { authorization: 'Bearer ' + env.GROQ_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify(Object.assign({ messages: messaggi, temperature: 0 }, m)) });
      if (!r.ok) continue;
      const t = pulisciCorretto(testoRisposta(await r.json()), testi);
      if (t) return { testo: t, modello: m.model };
    } catch (e) { /* tempo scaduto o rete: prova il prossimo */ } finally { clearTimeout(tempo); }
  }
  return null;
}

/* parole chiave per Deepgram: prima le misure (mai tagliate), poi i piatti; tetto prudente sotto i 100 termini e i 500 token */
export const PAROLE_MISURE = ['teglia', 'teglie', 'mezzo chilo', 'etti', 'porzioni', 'dopodomani'];
export function paroleChiave(piatti) {
  const out = []; let car = 0;
  for (const p of [...PAROLE_MISURE, ...(piatti || [])]) {
    const k = String(p || '').replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim();
    if (!k || out.includes(k) || out.length >= 80 || car + k.length > 900) continue;
    out.push(k); car += k.length;
  }
  return out;
}
const estensione = tipo => /mp4|m4a/.test(tipo) ? 'mp4' : /aac/.test(tipo) ? 'aac' : /ogg/.test(tipo) ? 'ogg' : /wav/.test(tipo) ? 'wav' : 'webm';
export async function ascolta(env, audioB64, tipo, piatti, f = (...a) => fetch(...a), { cliente = true } = {}) {
  const prompt = promptAscolto(piatti), errori = [];
  let bytes = null;
  const groq = async modello => {
    if (!env.GROQ_API_KEY) return null;
    try {
      bytes = bytes || Uint8Array.from(atob(audioB64), ch => ch.charCodeAt(0));
      const fd = new FormData();
      fd.append('file', new Blob([bytes], { type: tipo || 'audio/webm' }), 'voce.' + estensione(tipo));
      fd.append('model', modello); fd.append('language', 'it'); fd.append('prompt', prompt.slice(0, 600)); fd.append('temperature', '0');
      const r = await f('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { authorization: 'Bearer ' + env.GROQ_API_KEY }, body: fd });
      const j = await r.json().catch(() => ({}));
      const t = r.ok ? pulisciAscolto(j.text) : '';
      if (t) return { testo: t, motore: 'groq:' + modello };
      errori.push('groq ' + modello + ' ' + (r.ok ? 'vuoto' : (j.error && j.error.message) || r.status));
    } catch (e) { errori.push('groq ' + modello + ' ' + (e.message || e)); }
    return null;
  };
  const cf = async () => {   // Workers AI: audio in base64 (manuale Cloudflare, letto il 09/11/2026); con webm/opus a volte non decodifica
    if (!env.AI) return null;
    try {
      const r = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio: audioB64, language: 'it', initial_prompt: prompt.slice(0, 800) });
      const t = pulisciAscolto(r && r.text);
      if (t) return { testo: t, motore: 'cloudflare' };
      errori.push('cloudflare vuoto');
    } catch (e) { errori.push('cloudflare ' + (e.message || e)); }
    return null;
  };
  const deepgram = async () => {   // Nova-3 monolingua italiano, audio grezzo; risposta: results.channels[0].alternatives[0].transcript
    if (!env.DEEPGRAM_API_KEY) return null;
    const ctl = new AbortController(), tempo = setTimeout(() => ctl.abort(), 12000);
    try {
      bytes = bytes || Uint8Array.from(atob(audioB64), ch => ch.charCodeAt(0));
      const q = new URLSearchParams({ model: 'nova-3', language: 'it', smart_format: 'true' });
      paroleChiave(piatti).forEach(k => q.append('keyterm', k));
      const r = await f('https://api.deepgram.com/v1/listen?' + q, { method: 'POST', signal: ctl.signal,
        headers: { authorization: 'Token ' + env.DEEPGRAM_API_KEY, 'content-type': tipo || 'audio/webm' }, body: bytes });
      const j = await r.json().catch(() => ({}));
      const alt = r.ok && j.results && j.results.channels && j.results.channels[0] && j.results.channels[0].alternatives && j.results.channels[0].alternatives[0];
      const t = alt ? pulisciAscolto(alt.transcript) : '';
      if (t) return { testo: t, motore: 'deepgram' };
      errori.push('deepgram ' + (r.ok ? 'vuoto' : j.err_msg || j.message || r.status));
    } catch (e) { errori.push('deepgram ' + (e.message || e)); } finally { clearTimeout(tempo); }
    return null;
  };
  /* clienti con Deepgram: Groq v3 + Deepgram; altrimenti (o chi gestisce) Groq v3 + Cloudflare. Riserve finché non sono due */
  const conDg = cliente && !!env.DEEPGRAM_API_KEY;
  const principali = conDg ? [() => groq('whisper-large-v3'), deepgram] : [() => groq('whisper-large-v3'), cf];
  const riserve = conDg ? [() => groq('whisper-large-v3-turbo'), cf] : [() => groq('whisper-large-v3-turbo')];
  const trovati = (await Promise.allSettled(principali.map(m => m()))).map(x => x.status === 'fulfilled' ? x.value : null).filter(Boolean);
  for (const m of riserve) { if (trovati.length >= 2) break; const t = await m().catch(() => null); if (t) trovati.push(t); }   // limiti o servizio giù: le riserve hanno limiti loro
  const alternative = [];
  trovati.forEach(x => { if (!alternative.some(a => chiave(a) === chiave(x.testo))) alternative.push(x.testo); });
  if (!alternative.length) return { testo: '', errore: errori.join(' / ') || 'nessun motore' };
  const corr = await correggiAscolto(env, alternative, piatti, f).catch(() => null);
  return { testo: corr ? corr.testo : alternative[0], alternative, corretto: !!corr,
    motore: trovati.map(x => x.motore).join('+') + (corr ? ' → ' + corr.modello : '') };
}
