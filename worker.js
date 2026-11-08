/* Pronti in Tavola · Worker del sito (C3, Mario 07/11: «per il momento arrivano a me, poi facciamo Monica»).
   Serve i file dell'app e, sotto /api/, le notifiche degli ordini con Web Push:
   - GET  /api/chiave   → chiave pubblica (VAPID) che il telefono usa per iscriversi
   - POST /api/iscrivi  → chi gestisce iscrive il suo telefono (serve il suo accesso Google: lo controlla Firestore)
   - POST /api/prova    → notifica di prova ai telefoni di chi chiama (stesso controllo)
   - POST /api/avvisa   → «c'è un ordine nuovo» a tutti i telefoni di chi gestisce (chiunque, ma con un tetto)
   - POST /api/agenda   → chi gestisce manda quanti ordini ha per ogni giorno (solo numeri, niente nomi)
   - POST /api/cliente  → il cliente approvato iscrive il suo telefono per «il tuo ordine è pronto» (token anonimo, controllo utenti/<uid>)
   - POST /api/pronto   → chi gestisce avvisa un cliente: { cliente, tipo: 'pronto' | 'proposta' }
   - POST /api/qui      → il cliente approvato dice «sono qui sotto» per il ritiro: a chi gestisce suona «<nome> è qui» (Mario 07/11)
   - POST /api/aiutante → chi gestisce scrive o detta una frase: l'AI gratuita di Cloudflare (Workers AI) propone UNA azione in JSON;
                          l'app la mostra e la fa solo dopo «Sì, fallo» (Mario 08/11). Tetto: 150 richieste al giorno.
   - POST /api/aiuto-cliente → aiutante dei CLIENTI approvati (C50): menù, prezzi, allergeni, i SUOI ordini, «metti nel carrello».
                          Acceso di base, spento se Mario mette impostazioni/app.aiClienti = false; chi gestisce può provarlo sempre. Tetto: 10 a cliente, 60 in tutto al giorno.
   - POST /api/visto-qui → chi gestisce ha visto «sono qui»: la notifica smette di risuonare (C51)
   - POST /api/prova-ai → chi gestisce: una domanda piccola a ogni AI (Cloudflare e Groq), con esito e tempo
   - POST /api/conto-ai → chi gestisce: quante domande oggi (Monica e clienti), per la scheda «Solo per te, Mario»
   - POST /api/gz       → chi gestisce: { u } una ricetta di GialloZafferano letta dal vivo (gz.mjs), { cerca } la ricerca (C55)
   - /api/gz { db: 'stato' | 'pausa' | 'riprendi' | 'mie' | 'aggiungi' (r) | 'togli' (id) }, { cat: 'nuove', fuori } (proposte del motore) e { cat: 'db', q, pagina } → il TUO database delle ricette (C60, oggetto Ricettario)
   - GET  /api/ultimo   → che tipo era l'ultima notifica (sw.js sceglie il testo: ordine nuovo o promemoria)
   - ogni sera (cron in wrangler.jsonc) → promemoria «domani hai N ordini» se ce ne sono (Mario 07/11)
   Le chiavi le crea l'oggetto «Avvisi» la prima volta e le tiene lui: nessun segreto nel codice né in chat.
   Notifica senza contenuto (niente cifratura): il testo lo scrive sw.js. Così nessuno può mandare testi finti. */
import { DurableObject } from 'cloudflare:workers';
import { gzRicetta, gzCerca, gzVideo, gzProssima, urlGz, UA_GZ } from './gz.mjs';
/* catalogo per portata: le sezioni di GialloZafferano (ricette-cat/<nome>/) */
const CAT_GZ = { antipasti: 'ricette-cat/Antipasti', primi: 'ricette-cat/Primi', secondi: 'ricette-cat/Secondi-piatti', contorni: 'ricette-cat/Contorni', dolci: 'ricette-cat/Dolci-e-Desserts',
  lievitati: 'ricette-cat/Lievitati', unici: 'ricette-cat/Piatti-Unici', sughi: 'ricette-cat/Salse-e-Sughi', bevande: 'ricette-cat/Bevande', sardegna: 'ricerca-ricette/sardegna' };   // la sezione regionale di GZ non esiste più (404, 08/11): si usa la loro ricerca, pagina dopo pagina

const PROGETTO = 'pronti-in-tavola';
const CONTATTO = 'https://pronti-in-tavola.pronti-in-tavola.workers.dev/';
const TETTO_GIORNO = 60;        // al massimo 60 avvisi «ordine nuovo» al giorno
const TIPI_GESTORE = ['ordine', 'ordineProva', 'primo', 'richiesta', 'risposta', 'modifica', 'qui'];   // cosa è successo, per il testo e per aprire il punto giusto (C27)
const PAUSA_MS = 15 * 1000;
const SQUILLO_MS = 5000, SQUILLI = 12;   // «sono qui»: uno squillo ogni 5 secondi per 1 minuto (C51)     // e non più di uno ogni 15 secondi

const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const daB64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const json = (dati, stato = 200) => new Response(JSON.stringify(dati), { status: stato, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/* aiutante di Monica (Mario 08/11 «la miglior IA gratuita… potenzialo al massimo»): Workers AI, piano gratuito.
   Modello: Qwen 3.8 27B (vede anche le foto; consigliato da Cloudflare il 05/11/2026), se non risponde GLM 4.7 Flash (solo testo). */
const MODELLO_AI = '@cf/qwen/qwen3.8-27b';
const RISERVE = ['@cf/google/gemma-4-26b-a4b-it', '@cf/zai-org/glm-4.7-flash'];   // consigliati da Cloudflare (05/11/2026), stesso account
const TETTO_AI = 150;   // richieste al giorno; il limite vero sono i 10.000 «neuroni» gratuiti (finiti → messaggio, nessun costo)
const ISTRUZIONI_AI = `Sei l'aiutante di cucina di Monica, che cucina da asporto a Olbia e usa l'app «Pronti in Tavola».
Monica ti scrive o ti detta una frase in italiano (a volte con errori di dettatura), a volte con una FOTO. Ricevi i DATI attuali dell'app in JSON e le ultime frasi della conversazione.
Rispondi SOLO con un oggetto JSON, senza altro testo: {"testo":"<risposta breve>","azioni":[ ...da 0 a 8 azioni... ]}
Azioni possibili (usa solo queste):
{"azione":"pronto","n":<n. ordine>}  l'ordine è pronto (avvisa il cliente)
{"azione":"ritirato","n":<n>}  il cliente l'ha ritirato
{"azione":"soldi","n":<n>}  ha ricevuto i soldi
{"azione":"accetta","n":<n>}  accetta un ordine «da accettare»
{"azione":"rifiuta","n":<n>}  rifiuta un ordine
{"azione":"proponi","n":<n>,"giorno":"AAAA-MM-GG"}  propone al cliente un altro giorno di ritiro
{"azione":"disponibile","id":"<id piatto>","si":true|false}  rimette o toglie un piatto dal menù
{"azione":"prezzo","id":"<id piatto>","formato":"<id formato>","prezzo":<euro>}  cambia un prezzo
{"azione":"pronti","id":"<id piatto>","qta":<numero>}  cose già pronte oggi (porzioni, pezzi o kg secondo il formato)
{"azione":"descrizione","id":"<id piatto>","testo":"<frase che fa venire fame, max 120 lettere>"}  cambia la descrizione di un piatto
{"azione":"nuovo_piatto","nome":"...","cat":"stuzzichini|primi|dolci","modo":"teglie|kg|pz|intera","prezzi":{"t6":..,"t8":..} oppure {"kg":..} {"pz":..} {"intera":..},"descrizione":"..."}  piatto nuovo
{"azione":"pausa","fino":"AAAA-MM-GG"}  mette in pausa gli ordini fino a quel giorno compreso
{"azione":"riapri"}  toglie la pausa
{"azione":"impostazione","chiave":"<chiave>","valore":<valore>}  cambia un'impostazione dell'app. Chiavi: anticipo (giorni minimi di preavviso, 0-14), limite (teglie massime al giorno, 0 = senza limite), prontiFino ("HH:MM", fino a che ora valgono i pronti di oggi), natale (true/false, menù di Natale), natale_entro ("AAAA-MM-GG"), bonifico (true/false), postepay (true/false), contanti (true/false), nota_ritiro (testo per chi viene a ritirare)
{"azione":"messaggio","testo":"..."}  prepara un messaggio WhatsApp per tutte le amiche (per esempio «oggi ho le lasagne pronte»), Monica sceglie a chi mandarlo
{"azione":"spesa","voci":["2 kg farina","ricotta"]}  aggiunge alla lista della spesa
{"azione":"whatsapp","n":<n>,"testo":"..."}  prepara un messaggio WhatsApp al cliente di quell'ordine (Monica lo manda lei)
{"azione":"apri","vista":"ordini|piatti|clienti|impostazioni|spesa"}  porta Monica a una pagina
{"azione":"idea","testo":"..."}  Monica vuole una funzione che l'app non ha: riassumila per Mario, che la programma
GUIDA DELL'APP (per rispondere a «come si fa…»): Home = saluto, «Chiedi all'aiutante», riquadri Ordini · I miei piatti · Clienti · Impostazioni, «Pronti subito oggi», «Da preparare» con la Lista della spesa, Incassi del mese, Inviti. Ordini = schede Nuovi · Oggi · Prossimi · Storico; un ordine si accetta, si rifiuta o si propone un altro giorno; poi Pronto (il cliente riceve l'avviso), Ritirato, Soldi ricevuti; si può annullare per 10 secondi. I miei piatti = foto, nome, prezzi per formato, gusti, ingredienti e allergeni (li controlla sempre Monica), dosi per la spesa, fritto o al forno da Monica col sovrapprezzo, interruttore «Nel menù». Clienti = invita le amiche con un biglietto per WhatsApp, approva le persone nuove (la prima volta Monica le accetta), persone rifiutate. Impostazioni a voci: pausa e ferie, giorni di preavviso, limite di teglie, pronti fino a, Natale, pagamenti (contanti, bonifico, Postepay), indirizzo e nota del ritiro, numero WhatsApp, lucchetto (impronta o PIN), notifiche. Lista della spesa = dagli ordini (per oggi, 3 giorni, settimana) + la sua lista.
Regole: un ordine si riconosce dal numero o dal nome del cliente; se è ambiguo o manca un dato non mettere azioni e chiedi nel testo.
Con più richieste insieme metti più azioni. Per le domande (cosa cucinare, chi ritira, chi deve pagare, incassi) rispondi nel testo usando SOLO i DATI, senza azioni.
Con una FOTO: lista scritta a mano o scontrino → azione spesa; menù o lavagna → prezzi o piatti nuovi; foto di un piatto → descrizione o nuovo_piatto.
Gli ordini con "prova":true sono di prova: non contarli negli incassi né tra le cose da cucinare.
Usa solo numeri, id e nomi presenti nei DATI: non inventare mai. Il testo è breve, caldo, in italiano semplice, al massimo 3 frasi.`;
/* aiutante dei clienti (C50, Mario 08/11 «per i clienti fallo al meglio ma tienilo disattivato»): solo menù e i suoi ordini, mai dati di altri */
const TETTO_AIC = 60, TETTO_AIC_CLIENTE = 10;   // domande al giorno: in tutto e per ogni cliente (restano neuroni per Monica)
const ISTRUZIONI_CLIENTE = `Sei l'aiutante gentile dell'app «Pronti in Tavola» di Monica, che cucina da asporto a Olbia: i clienti ordinano dall'app e ritirano a casa sua.
Parli con UN cliente. Ricevi i DATI in JSON: il menù di oggi (piatti, prezzi, formati, gusti, ingredienti e allergeni scritti da Monica), le regole degli ordini, gli ordini di QUESTO cliente, il suo carrello e le sue allergie.
Rispondi SOLO con un oggetto JSON, senza altro testo: {"testo":"<risposta breve>","azioni":[ ...da 0 a 4 azioni... ]}
Azioni possibili (usa solo queste):
{"azione":"carrello","id":"<id piatto>","formato":"<id formato>","qta":<numero>,"gusto":"<id gusto, se il piatto ne ha>"}  propone di mettere un piatto nel carrello (il cliente conferma, poi l'ordine lo manda lui)
{"azione":"piatto","id":"<id piatto>"}  apre la scheda del piatto (foto, ingredienti, gusti)
{"azione":"apri","vista":"menu|ordini|carrello"}  porta il cliente al menù, ai suoi ordini o al carrello
{"azione":"scrivi_monica","testo":"<domanda per Monica>"}  prepara un messaggio WhatsApp per Monica (lo manda il cliente)
COME FUNZIONA L'APP: dal Menù si tocca un piatto, si sceglie formato, gusto e quantità, «Aggiungi»; nel carrello si sceglie il giorno «Ti serve entro…» e come pagare, poi «Invia». Monica conferma o propone un altro giorno. «Pronti subito» = piatti già pronti da ritirare oggi. In «I miei ordini» si vede lo stato; quando è pronto arriva l'avviso; al ritiro c'è «Sono qui sotto».
REGOLE IMPORTANTI:
- Allergie e ingredienti: usa SOLO quelli nei DATI. Se un piatto non ha ingredienti scritti o il cliente ha un dubbio di salute, di' che li controlla Monica e proponi scrivi_monica. Non dire mai che un piatto è sicuro per un allergico: di' cosa c'è scritto e consiglia di chiedere conferma a Monica.
- Non inventare mai piatti, prezzi, giorni, sconti o orari. Non promettere giorni di ritiro: li conferma Monica.
- Non hai dati di altri clienti e non ne parli. Non dai l'indirizzo né il numero di Monica.
- Non mandi ordini: al massimo proponi «carrello», poi il cliente controlla e tocca Invia.
- Se manca un dato (quale formato, quanti) chiedilo nel testo senza azioni.
- Domande fuori tema (non sul cibo o sull'app): rispondi con gentilezza che aiuti solo con il menù e gli ordini.
Il testo è breve, caldo, in italiano semplice, al massimo 3 frasi; dai del tu.`;
function jsonDa(t) {   // il primo oggetto JSON nel testo (toglie eventuali <think>…</think> e ```)
  t = String(t || '').replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```(json)?/g, '');
  const a = t.indexOf('{'); if (a < 0) return null;
  for (let b = t.lastIndexOf('}'); b > a; b = t.lastIndexOf('}', b - 1)) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { /* prova più corto */ } }
  return null;
}
const testoDi = r => { const x = typeof r === 'string' ? r : (r && (r.response ?? (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content))) || ''; return typeof x === 'string' ? x : JSON.stringify(x); };
/* ponte (Mario 08/11 «quando si blocca per i limiti crea un altro ponte automatico… con nuovi limiti»): Groq, piano gratuito
   (1.000 richieste e 200.000 token al giorno, senza carta, non addestra sui dati; docs lette l'08/11/2026). Stesso modello Qwen 3.8.
   La chiave è il segreto GROQ_API_KEY del Worker (lo mette il giro sito.yml dai segreti di GitHub): senza, il ponte non c'è. */
const PONTE = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
async function ponteAI(env, messaggi) {
  if (!env.GROQ_API_KEY) return null;
  for (const m of PONTE) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + env.GROQ_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ model: m, messages: messaggi, temperature: 0.2, max_tokens: 1500 }) });
      if (r.ok) return { r: await r.json(), modello: 'groq:' + m };
    } catch (e) { /* prova il prossimo */ }
  }
  return null;
}
/* prova delle AI (Mario 08/11 «posso provare se risponde Groq?»): una domanda piccolissima a ogni modello, uno alla volta.
   Solo chi gestisce; costa pochissimo (poche decine di neuroni, 2 richieste Groq). */
async function provaAI(env) {
  const msg = [{ role: 'user', content: 'Rispondi solo con la parola: pronto' }];
  const giro = async (nome, fn) => {
    const t0 = Date.now();
    try { const x = testoDi(await fn()).replace(/<think>[\s\S]*?<\/think>/g, '').trim(); return { nome, ok: !!x, ms: Date.now() - t0, testo: x.slice(0, 40) }; }
    catch (e) { return { nome, ok: false, ms: Date.now() - t0, errore: String(e && e.message || e).slice(0, 120) }; }
  };
  const esiti = [];
  for (const m of [MODELLO_AI, ...RISERVE]) {
    const nome = 'Cloudflare · ' + m.split('/').pop();
    esiti.push(env.AI ? await giro(nome, () => env.AI.run(m, { messages: msg, max_completion_tokens: 30, temperature: 0 })) : { nome, ok: false, errore: 'AI non collegata' });
  }
  for (const m of PONTE) {
    const nome = 'Groq · ' + m.split('/').pop();
    if (!env.GROQ_API_KEY) { esiti.push({ nome, ok: false, errore: 'chiave GROQ_API_KEY assente nel sito' }); continue; }
    esiti.push(await giro(nome, async () => {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + env.GROQ_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ model: m, messages: msg, temperature: 0, max_tokens: 30 }) });
      if (!r.ok) throw new Error('Groq risponde ' + r.status + (r.status === 401 ? ' (chiave sbagliata)' : r.status === 429 ? ' (limite raggiunto)' : r.status === 404 ? ' (modello non trovato)' : ''));
      return r.json();
    }));
  }
  return { esiti };
}
async function chiediAI(env, testo, dati, storia, foto, cliente) {
  const passate = (Array.isArray(storia) ? storia : []).slice(-6).map(m => ({ role: m && m.chi === 'io' ? 'user' : 'assistant', content: String((m && m.t) || '').slice(0, 400) })).filter(m => m.content);
  const domanda = `DATI: ${dati}\n\n${cliente ? 'DOMANDA DEL CLIENTE' : 'FRASE DI MONICA'}: ${testo}${foto ? '\n(Monica ha mandato anche una FOTO)' : ''}`;
  const ultimo = foto ? { role: 'user', content: [{ type: 'text', text: domanda }, { type: 'image_url', image_url: { url: foto } }] } : { role: 'user', content: domanda };
  const messaggi = [{ role: 'system', content: cliente ? ISTRUZIONI_CLIENTE : ISTRUZIONI_AI }, ...passate, ultimo];
  let r, modello = MODELLO_AI;
  const soloTesto = [messaggi[0], ...passate, { role: 'user', content: domanda }];
  const finiti = e => /4006|neuron|allocation/i.test(String(e && e.message));
  const ponte = async () => { const p = await ponteAI(env, soloTesto); if (p) { r = p.r; modello = p.modello; } return !!p; };
  try { r = await env.AI.run(MODELLO_AI, { messages: messaggi, max_completion_tokens: 2000, temperature: 0.2, reasoning_effort: 'low' }); }
  catch (e) {
    if (finiti(e)) {   // finiti i neuroni gratuiti di Cloudflare: passa a Groq (solo testo)
      if (!(await ponte())) return { testo: 'Per oggi ho finito le risposte gratuite: riprova domani.', azioni: [] };
    } else if (foto) return { testo: 'Non riesco a guardare la foto adesso: scrivimi cosa c\'è, per favore.', azioni: [], errore: String(e && e.message || e).slice(0, 200) };
    else {
      /* se il modello principale non risponde, provo gli altri gratuiti di Cloudflare, poi Groq */
      for (const m of RISERVE) {
        try { r = await env.AI.run(m, { messages: soloTesto, max_completion_tokens: 1500, temperature: 0.2 }); modello = m; break; }
        catch (e2) { if (finiti(e2)) break; }
      }
      if (!r && !(await ponte())) return { testo: 'Adesso l\'aiutante non risponde: riprova tra qualche minuto.', azioni: [] };
    }
  }
  const j = jsonDa(testoDi(r));
  if (!j) return { testo: 'Non ho capito bene: me lo ridici?', azioni: [], grezzo: testoDi(r).slice(0, 300), modello };
  return Object.assign(j, { modello });
}

/* VOCE VERA (Mario 08/11 «consiglio 1»): le voci neurali italiane di Microsoft Edge («Leggi ad alta voce»), gratis e senza chiave.
   Accesso NON ufficiale: se Microsoft lo cambia risponde 403 e l'app torna da sola alla voce del telefono.
   VOCE_VERSIONE (variabile del Worker) aggiorna la versione di Edge senza toccare il codice. Ogni lettura resta 30 giorni nella cache. */
const VOCI_EDGE = { isabella: 'it-IT-IsabellaNeural', elsa: 'it-IT-ElsaNeural', giuseppe: 'it-IT-GiuseppeMultilingualNeural', diego: 'it-IT-DiegoNeural' };
const TOK_EDGE = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
async function hexSha(s) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join(''); }
function dataEdge() {
  const d = new Date(), g = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()], m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()], z = n => String(n).padStart(2, '0');
  return `${g} ${m} ${z(d.getUTCDate())} ${d.getUTCFullYear()} ${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())} GMT+0000 (Coordinated Universal Time)`;
}
async function voceEdge(testo, voce, cfg) {
  const nome = VOCI_EDGE[voce] || VOCI_EDGE.isabella, ver = (cfg && cfg.VOCE_VERSIONE) || '143.0.3650.75', mag = ver.split('.')[0];
  let s = Math.floor(Date.now() / 1000) + 11644473600; s -= s % 300;
  const gec = (await hexSha(`${s}0000000${TOK_EDGE}`)).toUpperCase(), id = crypto.randomUUID().replace(/-/g, '');
  const r = await fetch(`https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOK_EDGE}&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=1-${ver}&ConnectionId=${id}`, {
    headers: { Upgrade: 'websocket', Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold', Pragma: 'no-cache', 'Cache-Control': 'no-cache',
      'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${mag}.0.0.0 Safari/537.36 Edg/${mag}.0.0.0` } });
  const ws = r.webSocket;
  if (!ws) throw new Error('voce: Microsoft risponde ' + r.status);
  ws.accept();
  const pezzi = [];
  const fatto = new Promise((ok, ko) => {
    const tempo = setTimeout(() => { try { ws.close(); } catch (e) { /* già chiuso */ } ko(new Error('voce: tempo scaduto')); }, 20000);
    ws.addEventListener('message', e => {
      if (typeof e.data === 'string') { if (e.data.includes('Path:turn.end')) { clearTimeout(tempo); try { ws.close(); } catch (er) { /* già chiuso */ } ok(); } return; }
      const b = new Uint8Array(e.data), n = (b[0] << 8) | b[1], testa = new TextDecoder().decode(b.slice(2, 2 + n));
      if (testa.includes('Path:audio')) pezzi.push(b.slice(2 + n));
    });
    ws.addEventListener('close', () => { clearTimeout(tempo); ok(); });
    ws.addEventListener('error', () => { clearTimeout(tempo); ko(new Error('voce: collegamento interrotto')); });
  });
  ws.send(`X-Timestamp:${dataEdge()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
  ws.send(`X-RequestId:${id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${dataEdge()}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='it-IT'><voice name='${nome}'><prosody pitch='+0Hz' rate='-4%' volume='+0%'>${xmlEsc(testo)}</prosody></voice></speak>`);
  await fatto;
  const tot = pezzi.reduce((a, p) => a + p.length, 0);
  if (!tot) throw new Error('voce: nessun audio');
  const out = new Uint8Array(tot); let k = 0; for (const p of pezzi) { out.set(p, k); k += p.length; }
  return out;
}
/* voce salvata PER SEMPRE nel database (C60, Mario 08/11 «salva le voci definitivamente… senza doppioni»):
   stessa voce + stesso testo = una sola copia (chiave voce:sha256). Prima la cache, poi il database, solo se manca Microsoft. */
async function voce(b, cfg, ctx) {
  const testo = String((b && b.t) || '').replace(/\s+/g, ' ').trim().slice(0, 1500), v = VOCI_EDGE[b && b.v] ? b.v : 'isabella';
  if (!testo) return new Response('niente da leggere', { status: 400 });
  const sha = await hexSha(testo), k = v + ':' + sha, db = ricDb(cfg);
  const cache = caches.default, chiave = new Request('https://cache.pronti/voce/' + v + '/' + sha);
  const c = await cache.match(chiave).catch(() => null); if (c) return c;
  const testa = { 'content-type': 'audio/mpeg', 'cache-control': 'private, max-age=2592000' };
  let mp3 = db ? await db.voce(k).catch(() => null) : null;
  if (mp3) return new Response(mp3, { headers: testa });
  mp3 = await voceEdge(testo, v, cfg);
  const dopo = Promise.all([db ? db.salvaVoce(k, mp3).catch(() => null) : null,
    cache.put(chiave, new Response(mp3, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'max-age=2592000' } })).catch(() => null)]);
  if (ctx) ctx.waitUntil(dopo); else await dopo;
  return new Response(mp3, { headers: testa });
}

/* GialloZafferano dal vivo (C55): pagina letta al momento, tenuta 1 giorno nella cache di Cloudflare (meno richieste al loro sito) */
async function paginaGz(u) {
  const cache = caches.default, chiave = new Request('https://cache.pronti/gz?' + encodeURIComponent(u));
  const c = await cache.match(chiave);
  if (c) return c.text();
  const r = await fetch(u, { headers: { 'user-agent': UA_GZ, 'accept-language': 'it-IT,it' } });
  if (!r.ok) throw new Error('GialloZafferano risponde ' + r.status);
  const t = await r.text();
  await cache.put(chiave, new Response(t, { headers: { 'cache-control': 'max-age=86400' } }));
  return t;
}
/* il TUO database delle ricette (C60): oggetto «Ricettario» con SQLite, sullo stesso account dell'app, gratis.
   Cresce da solo (motoreRicette ogni 10 minuti) e con ogni ricetta che Monica o Mario aprono o scorrono. */
const ricDb = cfg => cfg && cfg.RICETTARIO ? cfg.RICETTARIO.get(cfg.RICETTARIO.idFromName('ricette')) : null;
/* foto originali in un archivio a parte (stessa classe, altro nome: 1 GB tutto suo); tetto 25 MB a foto, 60 giorni */
const fotoDb = cfg => cfg && cfg.RICETTARIO ? cfg.RICETTARIO.get(cfg.RICETTARIO.idFromName('originali')) : null;
const ORIG_MAX = 25 * 1024 * 1024, ORIG_PEZZO = 1900 * 1024, ORIG_GIORNI = 60;
async function originali(req, cfg) {
  const db = fotoDb(cfg); if (!db) return json({ errore: 'archivio non collegato' }, 503);
  if (/^image\//.test(req.headers.get('content-type') || '')) {   // carica: il corpo è la foto così com'è
    const b = await req.arrayBuffer();
    if (!b.byteLength || b.byteLength > ORIG_MAX) return json({ errore: 'foto vuota o oltre 25 MB' }, 413);
    const pezzi = []; for (let i = 0; i < b.byteLength; i += ORIG_PEZZO) pezzi.push(b.slice(i, i + ORIG_PEZZO));
    let nome = ''; try { nome = decodeURIComponent(req.headers.get('x-nome') || ''); } catch (e) { /* nome strano: senza nome */ }
    return json({ ok: true, id: await db.salvaOriginale(nome || 'foto', req.headers.get('content-type'), pezzi) });
  }
  const c = await req.json().catch(() => null) || {};
  if (c.azione === 'scarica') {
    const f = await db.originale(c.id); if (!f) return json({ errore: 'foto non trovata' }, 404);
    return new Response(new Blob(f.pezzi.map(p => new Uint8Array(p)), { type: f.tipo || 'image/jpeg' }), { headers: { 'content-type': f.tipo || 'image/jpeg', 'cache-control': 'no-store' } });
  }
  if (c.azione === 'togli') { await db.togliOriginale(c.id); return json({ ok: true }); }
  return json({ foto: await db.elencoOriginali(), giorni: ORIG_GIORNI });
}
async function leggiGz(u) {
  const r = gzRicetta(await paginaGz(u), u);
  if (!r) return null;
  if (r.videoChiave) { try { Object.assign(r, gzVideo(await paginaGz('https://ptp.stbm.it/v/' + r.videoChiave))); } catch (e) { /* senza video: resta la ricetta */ } }
  return r;
}
async function ricettaGz(b, cfg, ctx) {
  const db = ricDb(cfg), poi = p => { if (p && ctx) ctx.waitUntil(p.catch(() => null)); };
  if (b && b.db) {   // { db: 'stato' } numeri · { db: 'pausa'|'riprendi' } ferma o riprende la crescita
    if (!db) return { errore: 'database non collegato' };
    if (b.db === 'pausa' || b.db === 'riprendi') await db.metti1('pausa', b.db === 'pausa' ? '1' : '');
    if (b.db === 'mie') return { scelte: await db.scelte() };
    if (b.db === 'cerca') { const prima = (await db.statoDb()).ricette; await motoreRicette(cfg, true); const d = await db.statoDb(); return { db: d, nuove: d.ricette - prima }; }   // 🔄 «Cerca adesso»
    if (b.db === 'aggiungi') {   // ➕ con l'ok di chi gestisce: nel ricettario per tutti i telefoni, e la ricetta intera salvata per sempre
      if (!(await db.aggiungi(b.r))) return { errore: 'ricetta non valida' };
      const u = urlGz('https://ricette.giallozafferano.it/' + String(b.r.id).slice(3) + '.html');
      if (u && !(await db.una(b.r.id))) poi(leggiGz(u).then(r => r && db.salva(r)));
      return { scelte: await db.scelte() };
    }
    if (b.db === 'togli') { await db.togli(b.id); return { scelte: await db.scelte() }; }
    return { db: await db.statoDb() };
  }
  if (b && b.cat === 'db') {   // sfoglia o cerca nel database, 30 per volta («Carica altre» = pagina 'db:<da>')
    if (!db) return { errore: 'database non collegato' };
    const da = typeof b.pagina === 'string' && /^db:\d{1,6}$/.test(b.pagina) ? +b.pagina.slice(3) : 0;
    const q = typeof b.q === 'string' ? b.q : '', ricette = await db.elenco(q, da, 31);
    return { ricette: ricette.slice(0, 30), prossima: ricette.length > 30 ? 'db:' + (da + 30) : '' };
  }
  if (b && b.cat === 'nuove') {   // 🔎 il motore propone (dall'archivio che cresce da solo), tu scegli
    if (!db) return { errore: 'database non collegato' };
    const da = typeof b.pagina === 'string' && /^nuove:\d{1,6}$/.test(b.pagina) ? +b.pagina.slice(6) : 0;
    const ricette = await db.proposte(Array.isArray(b.fuori) ? b.fuori.slice(0, 500) : [], da);
    return { ricette: ricette.slice(0, 30), prossima: ricette.length > 30 ? 'nuove:' + (da + 30) : '' };
  }
  if (b && (typeof b.cerca === 'string' || typeof b.cat === 'string')) {
    let u = '';
    if (typeof b.pagina === 'string' && /^https:\/\/(?:www|ricette)\.giallozafferano\.it\/[\w\/%+.,-]*$/.test(b.pagina)) u = b.pagina;   // «Carica altre»
    else if (b.cat && /^ricette-con-[\w-]{2,60}$/.test(b.cat)) u = `https://ricette.giallozafferano.it/${b.cat}/`;   // per ingrediente
    else if (b.cat) { if (!CAT_GZ[b.cat]) return { errore: 'portata sconosciuta' }; u = `https://www.giallozafferano.it/${CAT_GZ[b.cat]}/`; }
    else {
      const q = b.cerca.trim().toLowerCase().replace(/[^\p{L}\p{N} '-]/gu, '').slice(0, 60);
      if (q.length < 2) return { ricette: [] };
      u = `https://www.giallozafferano.it/ricerca-ricette/${encodeURIComponent(q).replace(/%20/g, "+")}/`;
    }
    const html = await paginaGz(u).catch(() => ''), ricette = gzCerca(html);
    // pagina della sezione vuota o cambiata: si cerca la stessa cosa a parole (così il catalogo non resta mai vuoto)
    if (!ricette.length && b.cat && !b.pagina && typeof b.cerca === 'string' && b.cerca.trim().length >= 2) return ricettaGz({ cerca: b.cerca }, cfg, ctx);
    if (!html && !ricette.length) {   // GialloZafferano non risponde: si cerca nel tuo database
      const mie = db && !b.cat && !b.pagina ? await db.elenco(b.cerca, 0).catch(() => []) : [];
      if (mie.length) return { ricette: mie, prossima: '', dalDb: true };
      throw new Error('GialloZafferano non risponde');
    }
    if (db && ricette.length) poi(db.inCoda(ricette.map(x => x.url)));   // quello che si scorre entra in coda per il database
    return { ricette, prossima: ricette.length ? gzProssima(html, u, ricette.length) : '' };
  }
  const u = urlGz(b && b.u);
  if (!u) return { errore: 'indirizzo non valido' };
  let r = null, err = null;
  try { r = await leggiGz(u); } catch (e) { err = e; }
  if (r) { if (db) poi(db.salva(r)); return { ricetta: r }; }   // ogni ricetta aperta: salvata per sempre
  const salvata = db ? await db.una('gz:' + u.replace('https://ricette.giallozafferano.it/', '').replace(/\.html$/, '')).catch(() => null) : null;
  if (salvata) return { ricetta: salvata, dalDb: true };   // GialloZafferano giù o cambiato: la copia del database
  if (err) throw err;
  return { errore: 'ricetta non trovata nella pagina' };
}

/* MOTORE (cron ogni 10 minuti): se la coda è corta legge UNA pagina di una sezione (a rotazione, pagina dopo pagina)
   e mette in coda le ricette che il database non ha; poi ne scarica RICETTE_GIRO. Poche per volta: rispetta GialloZafferano
   e il piano gratuito (50 richieste e ~10 ms di calcolo per giro). ~280 ricette al giorno. */
const FONTI_DB = ['sardegna', 'primi', 'secondi', 'dolci', 'antipasti', 'contorni', 'lievitati', 'unici', 'sughi', 'bevande'];
const RICETTE_GIRO = 2, CODA_MIN = 10, CRON_DB = '*/10 * * * *';
async function motoreRicette(cfg, aMano) {
  const db = ricDb(cfg); if (!db) return;
  const s = await db.statoDb(); if (s.pausa && !aMano) return;
  if (s.coda < CODA_MIN) {
    // sarde in priorità ma miste (Mario 08/11 «in priorità sarde ma cercale miste»): una pagina sì e una no è delle sarde,
    // le altre girano fra le sezioni; finite le sarde, solo le altre fino al giro completo, poi le sarde ripartono
    const sarda = s.paginaSarda !== 'fine' && (Number(s.pagine) || 0) % 2 === 0;
    const i = Math.max(1, (Number(s.fonte) || 0) % FONTI_DB.length);
    const u = sarda ? s.paginaSarda || `https://www.giallozafferano.it/${CAT_GZ.sardegna}/` : s.pagina || `https://www.giallozafferano.it/${CAT_GZ[FONTI_DB[i]]}/`;
    let html = '';
    try { html = await paginaGz(u); } catch (e) { await db.giro({ errore: String(e.message || e) }); }
    const lista = gzCerca(html), nuove = lista.length ? await db.inCoda(lista.map(x => x.url)) : 0;
    const dopo = lista.length ? gzProssima(html, u, lista.length) : '';
    // pagina rotta o vuota (es. 404): si passa alla sezione dopo, così il motore non resta mai fermo sulla stessa (C65)
    if (sarda) await db.posizioneSarda(dopo, nuove);
    else await db.posizione(dopo ? i : (i + 1) % FONTI_DB.length || 1, dopo, nuove, !dopo && i === FONTI_DB.length - 1);
  }
  let fatte = 0;
  for (const u of await db.prendi(RICETTE_GIRO)) {
    const ok = urlGz(u); if (!ok) { await db.togliCoda(u); continue; }
    try { const r = await leggiGz(ok); if (r) { await db.salva(r); fatte++; } else await db.togliCoda(u); } catch (e) { /* riprova al prossimo giro (max 3) */ }
  }
  await db.giro({ fatte });
}

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

/* l'aiutante dei clienti è acceso? (impostazioni/app.aiClienti, letto col token del cliente) */
async function aiClientiAcceso(req) {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROGETTO}/databases/(default)/documents/impostazioni/app`, { headers: { authorization: 'Bearer ' + tok } });
  if (!r.ok) return false;
  const f = ((await r.json()) || {}).fields || {};
  return !(f.aiClienti && f.aiClienti.booleanValue === false);   // acceso di base (Mario 08/11): spento solo se Mario lo spegne
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

  async manda(soloUid, per, perCliente, extra) {
    const chiave = perCliente ? 'clienti' : 'iscritti';
    if (!perCliente && per !== 'promemoria') await this.ctx.storage.put('ultimo', { ...(extra || {}), tipo: TIPI_GESTORE.includes(per) ? per : 'ordine', quando: Date.now() });
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

  /* «sono qui» (Mario 07/11): solo clienti approvati, uno ogni minuto per cliente, nome e numero d'ordine puliti */
  async qui(cliente, b) {
    const arr = (await this.ctx.storage.get('arrivi')) || {};
    if (arr[cliente] && Date.now() - arr[cliente] < 60000) return { fermo: 'pausa' };
    arr[cliente] = Date.now();
    await this.ctx.storage.put('arrivi', Object.fromEntries(Object.entries(arr).sort((x, y) => y[1] - x[1]).slice(0, 100)));
    const nome = String((b && b.nome) || 'Un cliente').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 40) || 'Un cliente';
    const n = Number.isInteger(b && b.n) && b.n > 0 && b.n < 1e6 ? b.n : 0;
    const extra = { nome, n, prova: !!(b && b.prova) };
    /* suoneria (Mario 08/11 «tipo suoneria», poi «ogni 5 secondi… vibrazione lunghissima»): la notifica torna ogni 5 secondi
       per 1 minuto (12 squilli), finché chi gestisce non la apre o tocca «Ho visto» (/api/visto-qui) */
    await this.ctx.storage.put('squillo', { extra, volte: 1 });
    await this.ctx.storage.setAlarm(Date.now() + SQUILLO_MS);
    return this.manda(null, 'qui', null, extra);
  }
  async vistoQui() { await this.ctx.storage.delete('squillo'); return { ok: true }; }
  async alarm() {
    const sq = await this.ctx.storage.get('squillo');
    if (!sq) return;
    if (sq.volte >= SQUILLI) { await this.ctx.storage.delete('squillo'); return; }
    await this.ctx.storage.put('squillo', { extra: sq.extra, volte: sq.volte + 1 });
    await this.manda(null, 'qui', null, sq.extra);
    if (sq.volte + 1 < SQUILLI) await this.ctx.storage.setAlarm(Date.now() + SQUILLO_MS); else await this.ctx.storage.delete('squillo');
  }

  /* aiutante: quante richieste oggi (tetto per restare nel gratuito) */
  async contaAI() {
    const oggi = new Date().toISOString().slice(0, 10), c = (await this.ctx.storage.get('ai')) || {};
    if (c.giorno === oggi && c.n >= TETTO_AI) return false;
    await this.ctx.storage.put('ai', { giorno: oggi, n: (c.giorno === oggi ? c.n : 0) + 1 });
    return true;
  }

  /* aiutante dei clienti: tetto in tutto e per cliente (chi gestisce che prova conta in tutto, non a testa) */
  async contaAIC(cliente) {
    const oggi = new Date().toISOString().slice(0, 10), c0 = (await this.ctx.storage.get('aic')) || {};
    const c = c0.giorno === oggi ? c0 : { giorno: oggi, n: 0, chi: {} };
    if (c.n >= TETTO_AIC) return 'tetto';
    if (cliente && (c.chi[cliente] || 0) >= TETTO_AIC_CLIENTE) return 'tuo';
    c.n++; if (cliente) c.chi[cliente] = (c.chi[cliente] || 0) + 1;
    await this.ctx.storage.put('aic', c);
    return '';
  }
  async contoAI() {
    const oggi = new Date().toISOString().slice(0, 10), a = (await this.ctx.storage.get('ai')) || {}, b = (await this.ctx.storage.get('aic')) || {};
    return { giorno: oggi, monica: a.giorno === oggi ? a.n : 0, clienti: b.giorno === oggi ? b.n : 0, persone: b.giorno === oggi ? Object.keys(b.chi || {}).length : 0,
      tetti: { monica: TETTO_AI, clienti: TETTO_AIC, aCliente: TETTO_AIC_CLIENTE } };
  }

  /* «ordine nuovo»: chiunque può chiederlo (il cliente non ha Google), quindi tetto al giorno e pausa */
  async avvisa(tipo) {
    const oggi = new Date().toISOString().slice(0, 10), c = (await this.ctx.storage.get('conto')) || {};
    if (c.giorno === oggi && c.n >= TETTO_GIORNO) return { fermo: 'tetto' };
    if (c.ultimo && Date.now() - c.ultimo < PAUSA_MS && tipo !== 'primo') return { fermo: 'pausa' };   // il primo ordine di una persona nuova passa sempre
    await this.ctx.storage.put('conto', { giorno: oggi, n: (c.giorno === oggi ? c.n : 0) + 1, ultimo: Date.now() });
    return this.manda(null, TIPI_GESTORE.includes(tipo) ? tipo : 'ordine');
  }
}

/* Ricettario: il database delle ricette e delle voci (SQLite dentro l'oggetto, gratis fino a 5 GB). Niente doppioni: id e chiavi uniche. */
const minuscolo = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export class Ricettario extends DurableObject {
  constructor(ctx, cfg) {
    super(ctx, cfg);
    this.sql = ctx.storage.sql;
    ['CREATE TABLE IF NOT EXISTS ricette (id TEXT PRIMARY KEY, url TEXT, nome TEXT, categoria TEXT, foto TEXT, descr TEXT, cerca TEXT, json TEXT, creata INTEGER, aggiornata INTEGER)',
      'CREATE INDEX IF NOT EXISTS ricette_creata ON ricette (creata)',
      'CREATE INDEX IF NOT EXISTS ricette_url ON ricette (url)',
      'CREATE TABLE IF NOT EXISTS coda (url TEXT PRIMARY KEY, aggiunta INTEGER, tentativi INTEGER DEFAULT 0)',
      'CREATE TABLE IF NOT EXISTS voci (k TEXT PRIMARY KEY, mp3 BLOB, byte INTEGER, creata INTEGER)',
      'CREATE TABLE IF NOT EXISTS stato (k TEXT PRIMARY KEY, v TEXT)',
      'CREATE TABLE IF NOT EXISTS originali (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, tipo TEXT, byte INTEGER, quando INTEGER, scaricata INTEGER DEFAULT 0)',
      'CREATE TABLE IF NOT EXISTS originali_pezzi (id INTEGER, n INTEGER, dati BLOB, PRIMARY KEY (id, n))',
      // il TUO ricettario (C61): le ricette che Mario o Monica hanno scelto con «➕ Aggiungi», uguali su tutti i telefoni
      'CREATE TABLE IF NOT EXISTS scelte (id TEXT PRIMARY KEY, url TEXT, nome TEXT, zona TEXT, categoria TEXT, foto TEXT, aggiunta INTEGER)'].forEach(q => this.sql.exec(q));
    for (const c of ['voto REAL DEFAULT 0', 'video INTEGER DEFAULT 0']) { try { this.sql.exec('ALTER TABLE ricette ADD COLUMN ' + c); } catch (e) { /* c'è già */ } }
  }
  leggi1(k) { const r = this.sql.exec('SELECT v FROM stato WHERE k = ?', k).toArray()[0]; return r ? r.v : ''; }
  metti1(k, v) { this.sql.exec('INSERT INTO stato (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', k, String(v ?? '')); }
  salva(r) {
    if (!r || !/^gz:[\w%-]+$/.test(r.id || '') || !r.nome) return false;
    const ora = Date.now(), cerca = minuscolo([r.nome, r.categoria, (r.ingredienti || []).map(i => i.nome).join(' ')].join(' '));
    this.sql.exec(`INSERT INTO ricette (id, url, nome, categoria, foto, descr, cerca, json, creata, aggiornata, voto, video) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, categoria = excluded.categoria, foto = excluded.foto, descr = excluded.descr, cerca = excluded.cerca, json = excluded.json, aggiornata = excluded.aggiornata, voto = excluded.voto, video = excluded.video`,
      r.id, r.url || '', r.nome, r.categoria || '', r.foto || '', String(r.intro || '').slice(0, 200), cerca, JSON.stringify(r), ora, ora, Number(r.voto) || 0, r.hls || r.mp4 ? 1 : 0);
    this.sql.exec('DELETE FROM coda WHERE url = ?', r.url || '');
    return true;
  }
  una(id) { const x = this.sql.exec('SELECT json FROM ricette WHERE id = ?', String(id)).toArray()[0]; return x ? JSON.parse(x.json) : null; }
  /* elenco per l'app (stessa forma della ricerca di GialloZafferano): le più nuove prima; tutte le parole presenti */
  elenco(q, da, n = 30) {
    const parole = minuscolo(q).replace(/[^\p{L}\p{N} ]/gu, ' ').split(' ').filter(p => p.length >= 2).slice(0, 5);
    const dove = parole.length ? 'WHERE ' + parole.map(() => 'cerca LIKE ?').join(' AND ') : '';
    return this.sql.exec(`SELECT url, nome, foto, categoria, descr FROM ricette ${dove} ORDER BY creata DESC LIMIT ? OFFSET ?`, ...parole.map(p => '%' + p + '%'), Math.min(31, Number(n) || 30), Math.max(0, Number(da) || 0))
      .toArray().map(x => ({ url: x.url, nome: x.nome, foto: x.foto, categoria: x.categoria, desc: x.descr }));
  }
  /* in coda solo gli indirizzi che il database non ha (né in coda né salvati): quante nuove */
  inCoda(urls) {
    let n = 0; const ora = Date.now();
    for (const u of [...new Set(urls || [])].slice(0, 40)) {
      if (typeof u !== 'string' || !/^https:\/\/ricette\.giallozafferano\.it\/[\w%-]+\.html$/.test(u)) continue;
      if (this.sql.exec('SELECT 1 FROM ricette WHERE url = ?', u).toArray().length) continue;
      if (this.sql.exec('SELECT 1 FROM coda WHERE url = ?', u).toArray().length) continue;
      this.sql.exec('INSERT INTO coda (url, aggiunta) VALUES (?, ?)', u, ora); n++;
    }
    return n;
  }
  prendi(n) {
    this.sql.exec('DELETE FROM coda WHERE tentativi >= 3');
    const tt = this.sql.exec('SELECT url FROM coda ORDER BY tentativi, aggiunta LIMIT ?', n).toArray().map(x => x.url);
    tt.forEach(u => this.sql.exec('UPDATE coda SET tentativi = tentativi + 1 WHERE url = ?', u));
    return tt;
  }
  togliCoda(u) { this.sql.exec('DELETE FROM coda WHERE url = ?', String(u)); }
  /* FOTO ORIGINALI (Mario 08/11: le foto di Monica a piena qualità, da scaricare e ritoccare): pezzi da 1,9 MB (tetto 2 MB a riga) */
  salvaOriginale(nome, tipo, pezzi) {
    const byte = pezzi.reduce((t, p) => t + p.byteLength, 0);
    this.sql.exec('INSERT INTO originali (nome, tipo, byte, quando) VALUES (?, ?, ?, ?)', String(nome).slice(0, 80), String(tipo).slice(0, 40), byte, Date.now());
    const id = this.sql.exec('SELECT last_insert_rowid() AS id').toArray()[0].id;
    pezzi.forEach((p, n) => this.sql.exec('INSERT INTO originali_pezzi (id, n, dati) VALUES (?, ?, ?)', id, n, p));
    return id;
  }
  elencoOriginali() { return this.sql.exec('SELECT id, nome, tipo, byte, quando, scaricata FROM originali ORDER BY id DESC LIMIT 60').toArray(); }
  originale(id) {
    const m = this.sql.exec('SELECT nome, tipo FROM originali WHERE id = ?', Number(id)).toArray()[0]; if (!m) return null;
    this.sql.exec('UPDATE originali SET scaricata = ? WHERE id = ?', Date.now(), Number(id));
    return Object.assign(m, { pezzi: this.sql.exec('SELECT dati FROM originali_pezzi WHERE id = ? ORDER BY n', Number(id)).toArray().map(r => r.dati) });
  }
  togliOriginale(id) { this.sql.exec('DELETE FROM originali_pezzi WHERE id = ?', Number(id)); this.sql.exec('DELETE FROM originali WHERE id = ?', Number(id)); }
  pulisciOriginali(giorni) {   // più vecchie di N giorni: via da sole (spazio gratuito: 1 GB per archivio)
    const ids = this.sql.exec('SELECT id FROM originali WHERE quando < ?', Date.now() - giorni * 86400000).toArray().map(r => r.id);
    ids.forEach(id => this.togliOriginale(id)); return ids.length;
  }
  posizione(fonte, pagina, nuove, finito) {
    this.metti1('fonte', fonte); this.metti1('pagina', pagina || ''); this.metti1('ultimaPagina', JSON.stringify({ quando: Date.now(), nuove }));
    this.metti1('pagine', (Number(this.leggi1('pagine')) || 0) + 1);
    if (finito) { this.metti1('passate', (Number(this.leggi1('passate')) || 0) + 1); this.metti1('paginaSarda', ''); }   // finite tutte le sezioni: un giro completo, le sarde ripartono
  }
  posizioneSarda(pagina, nuove) {   // pagina dopo delle sarde; 'fine' = finite fino al prossimo giro completo
    this.metti1('paginaSarda', pagina || 'fine'); this.metti1('ultimaPagina', JSON.stringify({ quando: Date.now(), nuove }));
    this.metti1('pagine', (Number(this.leggi1('pagine')) || 0) + 1);
  }
  giro(x) { this.metti1('ultimoGiro', JSON.stringify(Object.assign({ quando: Date.now() }, x))); this.metti1('giri', (Number(this.leggi1('giri')) || 0) + 1); }
  voce(k) { const x = this.sql.exec('SELECT mp3 FROM voci WHERE k = ?', String(k)).toArray()[0]; return x ? x.mp3 : null; }
  salvaVoce(k, mp3) {
    const b = mp3 instanceof ArrayBuffer ? mp3 : mp3.buffer.slice(mp3.byteOffset, mp3.byteOffset + mp3.byteLength);
    if (!b.byteLength || b.byteLength > 1800000) return false;   // una riga del database regge al massimo 2 MB
    this.sql.exec('INSERT OR IGNORE INTO voci (k, mp3, byte, creata) VALUES (?, ?, ?, ?)', String(k), b, b.byteLength, Date.now());
    return true;
  }
  /* il tuo ricettario: elenco, aggiungi (niente doppioni: stesso id = una riga), togli */
  scelte() { return this.sql.exec('SELECT id, url, nome, zona, categoria, foto, aggiunta FROM scelte ORDER BY aggiunta DESC').toArray(); }
  aggiungi(x) {
    if (!x || !/^gz:[\w%-]+$/.test(x.id || '') || !x.nome) return false;
    const pulito = (v, n) => String(v || '').slice(0, n);
    this.sql.exec('INSERT OR IGNORE INTO scelte (id, url, nome, zona, categoria, foto, aggiunta) VALUES (?, ?, ?, ?, ?, ?, ?)', x.id, 'https://ricette.giallozafferano.it/' + x.id.slice(3) + '.html',
      pulito(x.nome, 120), ['sarda', 'gallura', 'italiana'].includes(x.zona) ? x.zona : 'italiana', pulito(x.categoria, 40), /^https:\/\/[\w.-]+\.giallozafferano\.it\//.test(x.foto || '') ? pulito(x.foto, 300) : '', Date.now());
    return true;
  }
  togli(id) { this.sql.exec('DELETE FROM scelte WHERE id = ?', String(id)); }
  /* PROPOSTE del motore: ricette dell'archivio che il tuo ricettario non ha; prima quelle col video e i voti più alti */
  proposte(fuori, da) {
    const no = new Set([...(fuori || []).map(String), ...this.scelte().map(x => x.id)]);
    const tt = this.sql.exec('SELECT id, url, nome, foto, categoria, descr, voto, video FROM ricette ORDER BY video DESC, voto DESC, creata DESC LIMIT 400').toArray().filter(x => !no.has(x.id));
    return tt.slice(Math.max(0, Number(da) || 0), (Number(da) || 0) + 31).map(x => ({ url: x.url, nome: x.nome, foto: x.foto, categoria: x.categoria, desc: x.descr, voto: x.voto, video: !!x.video }));
  }
  statoDb() {
    const uno = (q, ...a) => this.sql.exec(q, ...a).toArray()[0] || {}, v = uno('SELECT COUNT(*) AS n, COALESCE(SUM(byte), 0) AS b FROM voci');
    const j = k => { try { return JSON.parse(this.leggi1(k) || 'null'); } catch (e) { return null; } };
    return { scelte: uno('SELECT COUNT(*) AS n FROM scelte').n, ricette: uno('SELECT COUNT(*) AS n FROM ricette').n, coda: uno('SELECT COUNT(*) AS n FROM coda').n, voci: v.n, mbVoci: Math.round(v.b / 104857.6) / 10,
      oggi: uno('SELECT COUNT(*) AS n FROM ricette WHERE creata > ?', Date.now() - 86400000).n, pausa: !!this.leggi1('pausa'),
      fonte: Number(this.leggi1('fonte')) || 0, fonti: FONTI_DB.length, paginaSarda: this.leggi1('paginaSarda') || '', sezione: FONTI_DB[Math.max(1, Number(this.leggi1('fonte')) || 0)], pagina: this.leggi1('pagina'), ultimoGiro: j('ultimoGiro'),
      giri: Number(this.leggi1('giri')) || 0, pagine: Number(this.leggi1('pagine')) || 0, passate: Number(this.leggi1('passate')) || 0, mb: Math.round(this.ctx.storage.sql.databaseSize / 104857.6) / 10 };
  }
}

export default {
  async fetch(req, env, ctx) {
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
      if (url.pathname === '/api/qui') {
        const c = await clienteDa(req);
        if (!c) return json({ errore: 'prima Monica deve approvarti' }, 403);
        return json(await av.qui(c, await req.json().catch(() => null)));
      }
      if (url.pathname === '/api/aiuto-cliente') {
        const c = await clienteDa(req), g = c ? null : await gestoreDa(req);   // chi gestisce lo prova anche spento («guarda come»)
        if (!c && !g) return json({ errore: 'prima Monica deve approvarti' }, 403);
        if (c && !(await aiClientiAcceso(req))) return json({ errore: 'spento' }, 403);
        const b = await req.json().catch(() => null);
        const testo = String((b && b.testo) || '').trim().slice(0, 300), dati = JSON.stringify((b && b.dati) || {});
        if (!testo) return json({ errore: 'frase vuota' }, 400);
        if (dati.length > 40000) return json({ errore: 'dati troppo grandi' }, 413);
        if (!env.AI) return json({ errore: 'AI non collegata' }, 503);
        const fermo = await av.contaAIC(c);
        if (fermo) return json({ fermo, testo: fermo === 'tuo' ? 'Per oggi abbiamo parlato tanto! Riprova domani, o scrivi a Monica.' : 'Per oggi l\'aiutante ha finito le risposte: riprova domani, o scrivi a Monica.', azioni: [] });
        return json(await chiediAI(env, testo, dati, b.storia, null, true));
      }
      const uid = await gestoreDa(req);
      if (!uid) return json({ errore: 'non sei tra chi gestisce' }, 403);
      if (url.pathname === '/api/voce') { const b = await req.json().catch(() => null); return await voce(b, env, ctx).catch(e => json({ errore: String(e.message || e) }, 502)); }
      if (url.pathname === '/api/gz') { const b = await req.json().catch(() => null); const r = await ricettaGz(b, env, ctx).catch(e => ({ errore: String(e.message || e) })); return json(r, r.errore ? 502 : 200); }
      if (url.pathname === '/api/conto-ai') return json(await av.contoAI());
      if (url.pathname === '/api/prova-ai') return json(await provaAI(env));
      if (url.pathname === '/api/visto-qui') return json(await av.vistoQui());
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
      if (url.pathname === '/api/aiutante') {
        const b = await req.json().catch(() => null);
        const testo = String((b && b.testo) || '').trim().slice(0, 400), dati = JSON.stringify((b && b.dati) || {});
        const foto = typeof (b && b.foto) === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.foto) ? b.foto : null;
        if (!testo && !foto) return json({ errore: 'frase vuota' }, 400);
        if (dati.length > 60000 || (foto && foto.length > 900000)) return json({ errore: 'dati troppo grandi' }, 413);
        if (!env.AI) return json({ errore: 'AI non collegata' }, 503);
        if (!(await av.contaAI())) return json({ fermo: 'tetto', testo: 'Per oggi ho finito le risposte gratuite: riprova domani.', azioni: [] });
        return json(await chiediAI(env, testo || 'Guarda la foto.', dati, b.storia, foto));
      }
      if (url.pathname === '/api/agenda') return (await av.agenda(await req.json().catch(() => null))) ? json({ ok: true }) : json({ errore: 'agenda non valida' }, 400);
      if (url.pathname === '/api/originali') return await originali(req, env);
      return json({ errore: 'non trovato' }, 404);
    } catch (e) {
      return json({ errore: String(e && e.message || e) }, 500);
    }
  },
  /* ogni 10 minuti: il motore del database delle ricette · ogni sera: promemoria per domani */
  async scheduled(ev, env, ctx) {
    if (ev.cron === CRON_DB) { ctx.waitUntil(motoreRicette(env).catch(() => null)); return; }
    ctx.waitUntil(env.AVVISI.get(env.AVVISI.idFromName('cucina')).promemoria());
    const fd = fotoDb(env); if (fd) ctx.waitUntil(Promise.resolve(fd.pulisciOriginali(ORIG_GIORNI)).catch(() => null));   // ogni sera: via le foto originali oltre 60 giorni
  }
};
