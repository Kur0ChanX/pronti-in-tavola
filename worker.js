/* Pronti in Tavola · Worker del sito (C3, Mario 07/11: «per il momento arrivano a me, poi facciamo Monica»).
   Serve i file dell'app e, sotto /api/, le notifiche degli ordini con Web Push:
   - GET  /api/chiave   → chiave pubblica (VAPID) che il telefono usa per iscriversi
   - POST /api/iscrivi  → chi gestisce iscrive il suo telefono (serve il suo accesso Google: lo controlla Firestore)
   - POST /api/prova    → notifica di prova ai telefoni di chi chiama (stesso controllo)
   - POST /api/avvisa   → «c'è un ordine nuovo» a tutti i telefoni di chi gestisce (chiunque, ma con un tetto)
   - POST /api/agenda   → chi gestisce manda quanti ordini ha per ogni giorno (solo numeri, niente nomi)
   - POST /api/cliente  → il cliente approvato iscrive il suo telefono per «il tuo ordine è pronto» (token anonimo, controllo utenti/<uid>)
   - POST /api/pronto   → chi gestisce avvisa un cliente: { cliente, tipo: 'pronto' | 'proposta' }
   - GET  /api/ultimo   → che tipo era l'ultima notifica (sw.js sceglie il testo: ordine nuovo o promemoria)
   - ogni sera (cron in wrangler.jsonc) → promemoria «domani hai N ordini» se ce ne sono (Mario 07/11)
   Le chiavi le crea l'oggetto «Avvisi» la prima volta e le tiene lui: nessun segreto nel codice né in chat.
   Notifica senza contenuto (niente cifratura): il testo lo scrive sw.js. Così nessuno può mandare testi finti. */
import { DurableObject } from 'cloudflare:workers';

const PROGETTO = 'pronti-in-tavola';
const CONTATTO = 'https://pronti-in-tavola.pronti-in-tavola.workers.dev/';
const TETTO_GIORNO = 60;        // al massimo 60 avvisi «ordine nuovo» al giorno
const TIPI_GESTORE = ['ordine', 'richiesta', 'risposta', 'modifica'];   // cosa è successo, per il testo e per aprire il punto giusto (C27)
const PAUSA_MS = 15 * 1000;     // e non più di uno ogni 15 secondi

const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const daB64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const json = (dati, stato = 200) => new Response(JSON.stringify(dati), { status: stato, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/* chi gestisce? Firestore legge gestori/<uid> col token di Google della persona: se risponde 200, è un gestore */
async function gestoreDa(req) {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!tok || tok.split('.').length !== 3) return null;
  let uid;
  try { uid = JSON.parse(new TextDecoder().decode(daB64u(tok.split('.')[1]))).user_id; } catch (e) { return null; }
  if (!uid || !/^[\w-]{1,128}$/.test(uid)) return null;
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROGETTO}/databases/(default)/documents/gestori/${uid}`, { headers: { authorization: 'Bearer ' + tok } });
  return r.ok ? uid : null;
}

/* cliente approvato? Firestore legge utenti/<uid> col suo token (anche anonimo): ridà il suo numero di cliente */
async function clienteDa(req) {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!tok || tok.split('.').length !== 3) return null;
  let uid;
  try { uid = JSON.parse(new TextDecoder().decode(daB64u(tok.split('.')[1]))).user_id; } catch (e) { return null; }
  if (!uid || !/^[\w-]{1,128}$/.test(uid)) return null;
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROGETTO}/databases/(default)/documents/utenti/${uid}`, { headers: { authorization: 'Bearer ' + tok } });
  if (!r.ok) return null;
  const f = ((await r.json()) || {}).fields || {};
  return f.stato && f.stato.stringValue === 'approvato' && f.cliente && f.cliente.stringValue ? f.cliente.stringValue : null;
}

export class Avvisi extends DurableObject {
  async chiavi() {
    let k = await this.ctx.storage.get('vapid');
    if (!k) {
      const c = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
      k = { pub: b64u(await crypto.subtle.exportKey('raw', c.publicKey)), priv: await crypto.subtle.exportKey('jwk', c.privateKey) };
      await this.ctx.storage.put('vapid', k);
    }
    return k;
  }
  async chiavePubblica() { return (await this.chiavi()).pub; }
  /* per capire i guasti (Mario 07/11: notifica non arrivata): quanti telefoni e gli ultimi 10 invii, senza indirizzi */
  async stato() {
    const tutti = (await this.ctx.storage.get('iscritti')) || [];
    return { telefoni: tutti.map(x => ({ servizio: new URL(x.endpoint).host, da: new Date(x.da).toISOString() })), conto: (await this.ctx.storage.get('conto')) || null, ultimi: (await this.ctx.storage.get('diario')) || [] };
  }

  async iscrivi(uid, sub) {
    if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || sub.endpoint.length > 1000) return false;
    const tutti = (await this.ctx.storage.get('iscritti')) || [];
    const altri = tutti.filter(x => x.endpoint !== sub.endpoint);
    altri.push({ uid, endpoint: sub.endpoint, da: Date.now() });
    await this.ctx.storage.put('iscritti', altri.slice(-20));   // al massimo 20 telefoni
    return true;
  }

  async manda(soloUid, per, perCliente) {
    const chiave = perCliente ? 'clienti' : 'iscritti';
    if (!perCliente && per !== 'promemoria') await this.ctx.storage.put('ultimo', { tipo: TIPI_GESTORE.includes(per) ? per : 'ordine', quando: Date.now() });
    const tutti = (await this.ctx.storage.get(chiave)) || [];
    const dest = perCliente ? tutti.filter(x => x.cliente === perCliente) : tutti.filter(x => !soloUid || x.uid === soloUid);
    if (perCliente) {   // il testo «è pronto» vale solo per i telefoni di quel cliente
      const pu = (await this.ctx.storage.get('ultimoPer')) || {};
      dest.forEach(x => { pu[x.endpoint] = { tipo: per === 'proposta' ? 'proposta' : 'pronto', quando: Date.now() }; });
      const tieni = Object.entries(pu).sort((a, b) => b[1].quando - a[1].quando).slice(0, 200);
      await this.ctx.storage.put('ultimoPer', Object.fromEntries(tieni));
    }
    const k = await this.chiavi();
    const priv = await crypto.subtle.importKey('jwk', k.priv, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    const morti = [], esiti = [];
    let ok = 0;
    for (const s of dest) {
      const aud = new URL(s.endpoint).origin;
      const testa = b64u(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
      const corpo = b64u(new TextEncoder().encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: CONTATTO })));
      const firma = b64u(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, priv, new TextEncoder().encode(testa + '.' + corpo)));
      try {
        const r = await fetch(s.endpoint, { method: 'POST', headers: { authorization: `vapid t=${testa}.${corpo}.${firma}, k=${k.pub}`, ttl: '86400', urgency: 'high', 'content-length': '0' } });
        esiti.push(r.status + (r.ok ? '' : ' ' + (await r.text()).slice(0, 120)));
        if (r.status === 404 || r.status === 410) morti.push(s.endpoint); else if (r.ok) ok++;
      } catch (e) { esiti.push('errore ' + String(e && e.message || e).slice(0, 120)); }
    }
    if (morti.length) await this.ctx.storage.put(chiave, tutti.filter(x => !morti.includes(x.endpoint)));
    const diario = ((await this.ctx.storage.get('diario')) || []).slice(-9);
    diario.push({ quando: new Date().toISOString(), per: per || (soloUid ? 'prova' : 'ordine'), telefoni: dest.length, esiti });
    await this.ctx.storage.put('diario', diario);
    return { mandati: ok, telefoni: dest.length };
  }

  /* agenda: { '2026-11-09': 3, … } solo numeri, al massimo 31 giorni */
  async agenda(a) {
    if (!a || typeof a !== 'object') return false;
    const pulita = {};
    for (const [g, n] of Object.entries(a).slice(0, 31)) if (/^\d{4}-\d{2}-\d{2}$/.test(g) && Number.isInteger(n) && n > 0 && n < 100) pulita[g] = n;
    await this.ctx.storage.put('agenda', pulita);
    return true;
  }
  async ultimo(e) {
    const pu = e ? ((await this.ctx.storage.get('ultimoPer')) || {})[e] : null, g = (await this.ctx.storage.get('ultimo')) || { tipo: 'ordine', quando: 0 };
    return pu && pu.quando > (g.quando || 0) ? pu : g;   // stesso telefono gestore e cliente: vale la più recente
  }
  async iscriviCliente(cliente, sub) {
    if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || sub.endpoint.length > 1000) return false;
    const tutti = ((await this.ctx.storage.get('clienti')) || []).filter(x => x.endpoint !== sub.endpoint);
    tutti.push({ cliente, endpoint: sub.endpoint, da: Date.now() });
    await this.ctx.storage.put('clienti', tutti.slice(-300));   // al massimo 300 telefoni di clienti
    return true;
  }
  /* promemoria della sera: domani (ora di Roma) ha ordini? */
  async promemoria() {
    const domani = new Date(Date.now() + 864e5).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
    const n = ((await this.ctx.storage.get('agenda')) || {})[domani] || 0;
    if (!n) return { fermo: 'niente domani' };
    await this.ctx.storage.put('ultimo', { tipo: 'promemoria', n, giorno: domani, quando: Date.now() });
    return this.manda(null, 'promemoria');
  }

  /* «ordine nuovo»: chiunque può chiederlo (il cliente non ha Google), quindi tetto al giorno e pausa */
  async avvisa(tipo) {
    const oggi = new Date().toISOString().slice(0, 10), c = (await this.ctx.storage.get('conto')) || {};
    if (c.giorno === oggi && c.n >= TETTO_GIORNO) return { fermo: 'tetto' };
    if (c.ultimo && Date.now() - c.ultimo < PAUSA_MS) return { fermo: 'pausa' };
    await this.ctx.storage.put('conto', { giorno: oggi, n: (c.giorno === oggi ? c.n : 0) + 1, ultimo: Date.now() });
    return this.manda(null, TIPI_GESTORE.includes(tipo) ? tipo : 'ordine');
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    const av = env.AVVISI.get(env.AVVISI.idFromName('cucina'));
    try {
      if (url.pathname === '/api/chiave' && req.method === 'GET') return json({ chiave: await av.chiavePubblica() });
      if (url.pathname === '/api/stato' && req.method === 'GET') return json(await av.stato());
      if (url.pathname === '/api/ultimo' && req.method === 'GET') return json(await av.ultimo(url.searchParams.get('e') || ''));
      if (req.method !== 'POST') return json({ errore: 'metodo' }, 405);
      if (url.pathname === '/api/avvisa') { const b = await req.json().catch(() => null); return json(await av.avvisa(b && b.tipo)); }
      if (url.pathname === '/api/cliente') {
        const c = await clienteDa(req);
        if (!c) return json({ errore: 'prima Monica deve approvarti' }, 403);
        const b = await req.json().catch(() => null);
        return (await av.iscriviCliente(c, b && b.sub)) ? json({ ok: true }) : json({ errore: 'iscrizione non valida' }, 400);
      }
      const uid = await gestoreDa(req);
      if (!uid) return json({ errore: 'non sei tra chi gestisce' }, 403);
      if (url.pathname === '/api/iscrivi') {
        const b = await req.json().catch(() => null);
        return (await av.iscrivi(uid, b && b.sub)) ? json({ ok: true }) : json({ errore: 'iscrizione non valida' }, 400);
      }
      if (url.pathname === '/api/prova') return json(await av.manda(uid));
      if (url.pathname === '/api/pronto') {
        const b = await req.json().catch(() => null), c = b && b.cliente;
        if (typeof c !== 'string' || !/^[\w-]{1,80}$/.test(c)) return json({ errore: 'cliente non valido' }, 400);
        return json(await av.manda(null, b.tipo === 'proposta' ? 'proposta' : 'pronto', c));
      }
      if (url.pathname === '/api/agenda') return (await av.agenda(await req.json().catch(() => null))) ? json({ ok: true }) : json({ errore: 'agenda non valida' }, 400);
      return json({ errore: 'non trovato' }, 404);
    } catch (e) {
      return json({ errore: String(e && e.message || e) }, 500);
    }
  },
  /* ogni sera: promemoria per domani */
  async scheduled(ev, env, ctx) {
    ctx.waitUntil(env.AVVISI.get(env.AVVISI.idFromName('cucina')).promemoria());
  }
};
