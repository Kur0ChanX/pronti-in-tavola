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
   - /api/gz { db: 'stato' | 'pausa' | 'riprendi' | 'mie' | 'aggiungi' (r) | 'togli' (id) | 'turbo' (n) | 'mieScritte' | 'salvaMia' (r) | 'togliMia' (id) }, { cat: 'nuove', fuori } (proposte del motore) e { cat: 'db', q, pagina } → il TUO database delle ricette (C60, oggetto Ricettario)
   - GET  /api/ultimo   → che tipo era l'ultima notifica (sw.js sceglie il testo: ordine nuovo o promemoria)
   - ogni sera (cron in wrangler.jsonc) → promemoria «domani hai N ordini» se ce ne sono (Mario 07/11)
   Le chiavi le crea l'oggetto «Avvisi» la prima volta e le tiene lui: nessun segreto nel codice né in chat.
   Notifica senza contenuto (niente cifratura): il testo lo scrive sw.js. Così nessuno può mandare testi finti. */
import { DurableObject } from 'cloudflare:workers';
import { gzRicetta, gzCerca, gzVideo, gzProssima, urlGz, UA_GZ, esaminaRicetta, gzSoloNutr } from './gz.mjs';
import { rfRicetta, rfElenco, urlRf, idRf, urlDaIdRf, MAPPA_RF } from './rf.mjs';
import { ascolta } from './ascolta.mjs';   // «ascolto preciso» dei clienti (C105): due Whisper + correttore col menù
/* catalogo per portata: le sezioni di GialloZafferano (ricette-cat/<nome>/) */
const CAT_GZ = { antipasti: 'ricette-cat/Antipasti', primi: 'ricette-cat/Primi', secondi: 'ricette-cat/Secondi-piatti', contorni: 'ricette-cat/Contorni', dolci: 'ricette-cat/Dolci-e-Desserts',
  lievitati: 'ricette-cat/Lievitati', unici: 'ricette-cat/Piatti-Unici', sughi: 'ricette-cat/Salse-e-Sughi', bevande: 'ricette-cat/Bevande', sardegna: 'ricerca-ricette/sardegna' };   // la sezione regionale di GZ non esiste più (404, 08/11): si usa la loro ricerca, pagina dopo pagina

const PROGETTO = 'pronti-in-tavola';
const CONTATTO = 'https://pronti-in-tavola.pronti-in-tavola.workers.dev/';
const TETTO_GIORNO = 60;        // al massimo 60 avvisi «ordine nuovo» al giorno
const TIPI_GESTORE = ['ordine', 'ordineProva', 'primo', 'richiesta', 'risposta', 'modifica', 'qui', 'chiusi'];
const TIPI_SERVER = ['esagera'];   // (C109) avvisi che manda solo il server (un telefono non li può chiedere con /api/avvisa)   // cosa è successo, per il testo e per aprire il punto giusto (C27)
const PAUSA_MS = 15 * 1000;
/* (C119) foto dei passi «a strisce» delle ricette vecchie di GZ (3 foto 220×170 in una): stessa regola di fotoRicetta in ricettario.js */
const STRISCIA = /_strip_\d+-\d+\.\w+(?:$|[?#])|seq\d+\.\w+(?:$|[?#])/i;
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
{"azione":"impostazione","chiave":"<chiave>","valore":<valore>}  cambia un'impostazione dell'app. Valgono anche TUTTE le chiavi di DATI.impostazioniExtra (tipo giorni = numeri 0 domenica…6 sabato, es. [0,1]; ora = "HH:MM" o ""; si = true/false; messaggio = testo con {nome} {n} {giorno} {totale} {indirizzo} {mappa} {nota} {orari} {link}); per portarla lì: {"azione":"vai","voce":"opz-<chiave>"}. Chiavi: anticipo (giorni minimi di preavviso, 0-14), limite (teglie massime al giorno, 0 = senza limite), prontiFino ("HH:MM", fino a che ora valgono i pronti di oggi), natale (true/false, menù di Natale), natale_entro ("AAAA-MM-GG"), bonifico (true/false), postepay (true/false), contanti (true/false), nota_ritiro (testo per chi viene a ritirare)
{"azione":"messaggio","testo":"..."}  prepara un messaggio WhatsApp per tutte le amiche (per esempio «oggi ho le lasagne pronte»), Monica sceglie a chi mandarlo
{"azione":"spesa","voci":["2 kg farina","ricotta"]}  aggiunge alla lista della spesa
{"azione":"whatsapp","n":<n>,"testo":"..."}  prepara un messaggio WhatsApp al cliente di quell'ordine (Monica lo manda lei)
{"azione":"apri","vista":"ordini|piatti|clienti|impostazioni|spesa"}  porta Monica a una pagina
{"azione":"vai","voce":"<voce>","id":"<id piatto, solo per le voci del piatto>"}  porta Monica DRITTA nel punto dell'app dove si fa una cosa (la apre e la evidenzia). Voci del piatto (con id): foto, prezzi, pronto, nome, gusti, ingredienti, dosi, richieste, fritto, casa, novita. Voci delle Impostazioni: imp-pausa, imp-pronti, imp-ritiro, imp-numeri, imp-paga, imp-vista, imp-gestori, imp-notifiche (anche gli ultimi avvisi arrivati), imp-lucchetto, imp-anticipo, imp-limite, imp-natale, imp-voce (velocità della voce che legge). Pagine: ordini, ordini-storico (ordini finiti, prove, archiviati), piatti, nuovo, clienti, clienti-nome (nome e codice di un cliente), clienti-nuovi (interruttore «Accetta clienti nuovi»), clienti-rifiutati (persone a cui ha detto no, si possono riaccettare), clienti-attesa (chi aspetta il suo sì; chi non compare tocca «Ricorda a Monica»), spesa, ricettario, ricettario-fit (ricette proteiche per palestra e definizione), ricettario-diff (filtro difficoltà), ricettario-db (database e motore delle ricette). Usala per ogni «come si fa», «dove trovo», «voglio cambiare…» che Monica fa da sola nell'app (es. «cambiare la foto della parmigiana» → {"azione":"vai","voce":"foto","id":"<id della parmigiana>"}), e nel testo spiega in 1-2 frasi cosa toccare una volta lì.
CAPIRE IL SENSO (Mario: «deve capire il contesto di quello che dico, non leggere la parola»): prima di scegliere un posto chiediti cosa vuole FARE Monica con la frase intera, non quale parola ha detto. Es. «la mia amica non riesce ad aprire il link» → clienti (inviti), non ordini; «non mi suona niente quando ordinano» → imp-notifiche; «leggo male le scritte» → imp-vista; «la Laura ora si chiama in un altro modo» → clienti-nome. DATI.indizi = posti trovati solo cercando le parole: un aiuto, spesso sbagliato. Sicura → UNA azione vai. Esiti fra 2-3 posti → 2-3 azioni vai e nel testo «Intendi…?». Non capisci → nessuna azione e chiedi cosa vuole fare.
{"azione":"idea","testo":"..."}  Monica vuole cambiare o aggiungere qualcosa che NON si può fare dall'app (una funzione nuova, un cambio del funzionamento): scrivi per Mario, che la programma, cosa vuole, dove nell'app e perché, con tutti i dettagli che ha detto
GUIDA DELL'APP (per rispondere a «come si fa…»): Home = saluto, «Chiedi all'aiutante», riquadri Ordini · I miei piatti · Clienti · Impostazioni, «Pronti subito oggi», «Da preparare» con la Lista della spesa, Incassi del mese, Inviti. Ordini = schede Nuovi · Oggi · Prossimi · Storico; un ordine si accetta, si rifiuta o si propone un altro giorno; poi Pronto (il cliente riceve l'avviso), Ritirato, Soldi ricevuti; si può annullare per 10 secondi. I miei piatti = foto, nome, prezzi per formato, gusti, ingredienti e allergeni (li controlla sempre Monica), dosi per la spesa, fritto o al forno da Monica col sovrapprezzo, interruttore «Nel menù». Clienti = invita le amiche con un biglietto per WhatsApp, approva le persone nuove (la prima volta Monica le accetta), persone rifiutate; ogni persona ha un codice fisso che non cambia mai (es. K7P2M; Mario ⭐MARIO, Monica ⭐MONICA), la matita accanto al nome cambia il nome che vede Monica, e se il cliente corregge il suo nome Monica vede «ora si chiama… prima…» finché tocca «Visto». Impostazioni a voci: pausa e ferie, giorni di preavviso, limite di teglie, pronti fino a, Natale, pagamenti (contanti, bonifico, Postepay), indirizzo e nota del ritiro, numero WhatsApp, lucchetto (impronta o PIN), notifiche. Lista della spesa = dagli ordini (per oggi, 3 giorni, settimana) + la sua lista. Ricettario = ricette di GialloZafferano e sue (su ogni ricetta la fonte e i valori per porzione: calorie, proteine, carboidrati, grassi, zuccheri, sale); filtri per portata, «Difficoltà» (Facili, Medie, Difficili) e la sezione «🏋️ Proteiche» (almeno 20 g di proteine a porzione, poche calorie, grassi saturi, zuccheri e sale; prima quelle con più proteine); nella Home il riquadro «Proteiche» porta lì; «🗄 Database» porta dritto al database; foto di un passo piccola o sgranata: toccala per ingrandirla, poi «✨ Migliora con l'AI» (l'AI del telefono la rende grande e nitida; dopo la prima volta lo fa da sola).
Regole: un ordine si riconosce dal numero o dal nome del cliente; se è ambiguo o manca un dato non mettere azioni e chiedi nel testo.
Con più richieste insieme metti più azioni. Per le domande (cosa cucinare, chi ritira, chi deve pagare, incassi) rispondi nel testo usando SOLO i DATI, senza azioni.
Con una FOTO: lista scritta a mano o scontrino → azione spesa; menù o lavagna → prezzi o piatti nuovi; foto di un piatto → descrizione o nuovo_piatto.
Gli ordini con "prova":true sono di prova: non contarli negli incassi né tra le cose da cucinare.
Usa solo numeri, id e nomi presenti nei DATI: non inventare mai. Il testo è breve, caldo, in italiano semplice, al massimo 3 frasi.`;
/* aiutante dei clienti (C50, Mario 08/11 «per i clienti fallo al meglio ma tienilo disattivato»): solo menù e i suoi ordini, mai dati di altri */
const TETTO_AIC = 200;   // domande dei clienti con l'AI al giorno, in tutto (C108: Groq, 3 modelli da ~70-100 domande l'uno); oltre risponde il telefono
/* (C109, PT E41; Mario 09/11 «limiti per persona da consiglio») nessun cliente viene MAI fermato:
   oltre SOGLIA domande di UN cliente arriva una segnalazione a chi gestisce (di nuovo al doppio);
   oltre RIDOTTO al giorno, o RAFFICA in un minuto (telefono inceppato, robot), «modo ridotto»: niente AI per lui, risponde il telefono.
   Soglia e ridotto li sceglie Mario («Solo per te, Mario»: impostazioni/app aicAvviso, aicRidotto), qui i valori di base e i tetti sicuri */
const SOGLIA_AIC_CLIENTE = 30, RIDOTTO_AIC_CLIENTE = 100, RAFFICA_AIC = 10;
const QUOTA_AVVISO = 0.8;   // all'80% delle domande dei clienti di tutto il giorno una segnalazione a chi gestisce
const RISPOSTA_RIDOTTA = 'Dimmi il piatto, quanti e per che giorno (es. «2 lasagne per sabato»), oppure chiedimi prezzi e allergie. Per altro tocca «Scrivi a Monica».';
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
/* (C108, Mario 09/11 «salvadanai separati», «come consiglio»): l'aiutante dei CLIENTI usa Groq per primo, tre modelli in fila
   (gratis: 1.000 domande e 200.000 token al giorno PER MODELLO, 8.000 token al minuto; console.groq.com/docs/rate-limits letta il 09/11/2026);
   i neuroni di Cloudflare restano a Monica e Mario, ai clienti solo per ultimo. Nessuno risponde → «modo ridotto» (risponde il telefono) */
const PONTE_CLIENTI = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
/* ascolti dei clienti al giorno (C108b, PT E41: mai un blocco). TETTO_ASCOLTO = in tutto: oltre, ascolto senza Cloudflare (~4 neuroni
   a frase, salvadanaio di Monica e Mario) + una segnalazione; TETTO_ASCOLTO_CLIENTE = soglia di segnalazione a testa (base, cambiabile: 'ascoltoAvviso') */
const TETTO_ASCOLTO = 400, TETTO_ASCOLTO_CLIENTE = 40;
async function ponteAI(env, messaggi, modelli = PONTE) {
  if (!env.GROQ_API_KEY) return null;
  for (const m of modelli) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + env.GROQ_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ model: m, messages: messaggi, temperature: 0.2, max_tokens: 1500, ...(/gpt-oss/.test(m) ? { reasoning_effort: 'low' } : {}) }) });   // gpt-oss «pensa»: poco, così resta spazio per la risposta (C71)
      if (r.ok) return { r: await r.json(), modello: 'groq:' + m };
    } catch (e) { /* prova il prossimo */ }
  }
  return null;
}
/* prova delle AI (Mario 08/11 «posso provare se risponde Groq?»). 400 token: con 30 i modelli che «pensano» li finivano e rispondevano vuoto (foto di Mario 08/11 12:35): una domanda piccolissima a ogni modello, uno alla volta.
   Solo chi gestisce; costa pochissimo (poche decine di neuroni, 2 richieste Groq). */
async function provaAI(env) {
  const msg = [{ role: 'user', content: 'Rispondi solo con la parola: pronto' }];
  const giro = async (nome, fn) => {
    const t0 = Date.now();
    try { const x = testoDi(await fn()).replace(/<think>[\s\S]*?<\/think>/g, '').trim(); return x ? { nome, ok: true, ms: Date.now() - t0, testo: x.slice(0, 40) } : { nome, ok: false, ms: Date.now() - t0, errore: 'risposta vuota (ha usato tutto il tempo per pensare)' }; }
    catch (e) { return { nome, ok: false, ms: Date.now() - t0, errore: String(e && e.message || e).slice(0, 120) }; }
  };
  const esiti = [];
  for (const m of [MODELLO_AI, ...RISERVE]) {
    const nome = 'Cloudflare · ' + m.split('/').pop();
    esiti.push(env.AI ? await giro(nome, () => env.AI.run(m, { messages: msg, max_completion_tokens: 400, temperature: 0, reasoning_effort: 'low' })) : { nome, ok: false, errore: 'AI non collegata' });
  }
  for (const m of [...new Set([...PONTE, ...PONTE_CLIENTI])]) {
    const nome = 'Groq · ' + m.split('/').pop();
    if (!env.GROQ_API_KEY) { esiti.push({ nome, ok: false, errore: 'chiave GROQ_API_KEY assente nel sito' }); continue; }
    esiti.push(await giro(nome, async () => {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + env.GROQ_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ model: m, messages: msg, temperature: 0, max_tokens: 400, ...(/gpt-oss/.test(m) ? { reasoning_effort: 'low' } : {}) }) });
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
  if (cliente) {   // (C108) clienti: Groq per primo, poi Cloudflare; nessuno risponde → risponde il telefono, mai «riprova domani»
    const p = await ponteAI(env, soloTesto, PONTE_CLIENTI);
    if (p) { r = p.r; modello = p.modello; }
    else if (env.AI) for (const m of [MODELLO_AI, ...RISERVE]) {
      try { r = await env.AI.run(m, { messages: soloTesto, max_completion_tokens: 1500, temperature: 0.2, ...(m === MODELLO_AI ? { reasoning_effort: 'low' } : {}) }); modello = m; break; }
      catch (e) { if (finiti(e)) break; }
    }
    if (!r) return { fermo: 'ridotto', testo: RISPOSTA_RIDOTTA, azioni: [] };
  } else try { r = await env.AI.run(MODELLO_AI, { messages: messaggi, max_completion_tokens: 2000, temperature: 0.2, reasoning_effort: 'low' }); }
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
async function paginaGz(u, chi = 'GialloZafferano') {   // anche RicetteFit (C124): stessa cache di 1 giorno
  const cache = caches.default, chiave = new Request('https://cache.pronti/gz?' + encodeURIComponent(u));
  const c = await cache.match(chiave);
  if (c) return c.text();
  const r = await fetch(u, { headers: { 'user-agent': UA_GZ, 'accept-language': 'it-IT,it' } });
  if (!r.ok) throw new Error(chi + ' risponde ' + r.status);
  const t = await r.text();
  await cache.put(chiave, new Response(t, { headers: { 'cache-control': 'max-age=86400' } }));
  return t;
}
/* (C119) foto di GialloZafferano passate dal NOSTRO server per «✨ Migliora con l'AI» (foto-ai.js): le loro foto non danno
   il permesso (CORS) di leggere i pixel, che servono all'AI del telefono. SOLO foto di www.giallozafferano.it/images
   (mai un passaggio aperto ad altri siti), al massimo 3 MB, tenute 30 giorni nella cache di Cloudflare. */
const FOTO_GZ = /^https:\/\/www\.giallozafferano\.it\/images\/[\w./%-]+\.(?:jpe?g|png|webp)$/i, FOTO_GZ_MAX = 3 * 1024 * 1024;
async function fotoGz(u, ctx) {
  u = String(u || '');
  if (!FOTO_GZ.test(u) || u.includes('..')) return json({ errore: 'foto non permessa' }, 400);
  const cache = caches.default, chiave = new Request('https://cache.pronti/foto-gz?' + encodeURIComponent(u));
  const c = await cache.match(chiave).catch(() => null); if (c) return c;
  const r = await fetch(u, { headers: { 'user-agent': UA_GZ, accept: 'image/*' } });
  if (!r.ok) return json({ errore: 'GialloZafferano risponde ' + r.status }, 502);
  const tipo = r.headers.get('content-type') || '';
  if (!/^image\//.test(tipo)) return json({ errore: 'non è una foto' }, 502);
  const b = await r.arrayBuffer();
  if (b.byteLength > FOTO_GZ_MAX) return json({ errore: 'foto troppo grande' }, 413);
  const testa = { 'content-type': tipo, 'cache-control': 'public, max-age=2592000' };
  const dopo = cache.put(chiave, new Response(b, { headers: testa })).catch(() => null);
  if (ctx) ctx.waitUntil(dopo); else await dopo;
  return new Response(b, { headers: testa });
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
/* C124 passo 8: RicetteFit (rf.mjs). leggiWeb = la ricetta dal sito giusto (GialloZafferano o RicetteFit) */
async function leggiRf(u) { return rfRicetta(await paginaGz(u, 'RicetteFit'), u); }
const leggiWeb = u => urlRf(u) ? leggiRf(urlRf(u)) : leggiGz(u);
const urlDaId = id => /^rf:/.test(String(id || '')) ? urlDaIdRf(id) : urlGz('https://ricette.giallozafferano.it/' + String(id || '').slice(3) + '.html');
async function ricettaGz(b, cfg, ctx) {
  const db = ricDb(cfg), poi = p => { if (p && ctx) ctx.waitUntil(p.catch(() => null)); };
  if (b && b.db) {   // { db: 'stato' } numeri · { db: 'pausa'|'riprendi' } ferma o riprende la crescita
    if (!db) return { errore: 'database non collegato' };
    if (b.db === 'pausa' || b.db === 'riprendi') await db.metti1('pausa', b.db === 'pausa' ? '1' : '');
    if (b.db === 'mie') return { scelte: await db.scelte() };
    if (b.db === 'cerca') { const prima = (await db.statoDb()).ricette; await motoreRicette(cfg, true); const d = await db.statoDb(); return { db: d, nuove: d.ricette - prima }; }   // 🔄 «Cerca adesso»
    if (b.db === 'aggiungi') {   // ➕ con l'ok di chi gestisce: nel ricettario per tutti i telefoni, e la ricetta intera salvata per sempre
      if (!(await db.aggiungi(b.r))) return { errore: 'ricetta non valida' };
      const u = urlDaId(b.r.id);
      if (u && !(await db.una(b.r.id))) poi(leggiWeb(u).then(r => r && db.salva(r)));
      return { scelte: await db.scelte() };
    }
    if (b.db === 'togli') { await db.togli(b.id); return { scelte: await db.scelte() }; }
    if (b.db === 'turbo') {   // «carica N»: il Durable Object lavora da solo a sveglie, n da 1 a 200 (senza n: solo lo stato)
      if (b.n === undefined) return { turbo: await db.turboStato() };
      const n = Math.floor(Number(b.n));
      if (!(n >= 1 && n <= 200)) return { errore: 'n da 1 a 200' };
      return { turbo: await db.turboAvvia(n) };
    }
    if (b.db === 'controlla') return { controllo: await controllaTutte(db), db: await db.statoDb() };   // C83 «🔍 Controlla tutte adesso» (C123: esito vero)
    if (b.db === 'fit') {   // C124: parole della corsia fit, dalla pagina Database; { base: true } = quelle di base
      if (!b.base && typeof b.parole !== 'string') return { errore: 'parole mancanti' };
      await db.mettiParoleFit(b.base ? null : paroleFit(b.parole));
      return { db: await db.statoDb() };
    }
    if (b.db === 'rf') { await db.metti1('rfSpento', b.acceso === false ? '1' : ''); return { db: await db.statoDb() }; }   // C124: RicetteFit acceso o spento dalla pagina Database
    if (b.db === 'mieScritte') return { mie: await db.mieScritte() };   // ricette scritte a mano, uguali su tutti i telefoni
    if (b.db === 'salvaMia') {
      if (!(await db.salvaMia(b.r))) return { errore: 'ricetta non valida' };
      return { ok: true, id: b.r.id };
    }
    if (b.db === 'togliMia') { await db.togliMia(b.id); return { ok: true }; }
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
  const u = urlGz(b && b.u) || urlRf(b && b.u);
  if (!u) return { errore: 'indirizzo non valido' };
  let r = null, err = null;
  try { r = await leggiWeb(u); } catch (e) { err = e; }
  if (r) { if (db) poi(db.salva(r)); return { ricetta: r }; }   // ogni ricetta aperta: salvata per sempre
  const salvata = db ? await db.una(urlRf(u) ? idRf(u) : 'gz:' + u.replace('https://ricette.giallozafferano.it/', '').replace(/\.html$/, '')).catch(() => null) : null;
  if (salvata) return { ricetta: salvata, dalDb: true };   // GialloZafferano giù o cambiato: la copia del database
  if (err) throw err;
  return { errore: 'ricetta non trovata nella pagina' };
}

/* MOTORE (cron ogni 10 minuti): se la coda è corta legge UNA pagina di una sezione (a rotazione, pagina dopo pagina)
   e mette in coda le ricette che il database non ha; poi ne scarica RICETTE_GIRO. Poche per volta: rispetta GialloZafferano
   e il piano gratuito (50 richieste e ~10 ms di calcolo per giro). ~280 ricette al giorno. */
const FONTI_DB = ['sardegna', 'primi', 'secondi', 'dolci', 'antipasti', 'contorni', 'lievitati', 'unici', 'sughi', 'bevande'];
/* C124 (Mario 10/11 «cerchi in automatico le ricette per fitness sala pesi»): corsia «fit» del motore, una pagina su 4 (le sarde restano
   una su 2): cerca su GialloZafferano queste parole, una dopo l'altra. Si cambiano dalla pagina Database (senza Claude). Quali vanno in
   «🏋️ Proteiche» lo decidono poi i valori per porzione, sul telefono. */
const FIT_BASE = ['proteiche', 'light', 'petto di pollo', 'fesa di tacchino', 'merluzzo', 'salmone', 'tonno', 'albumi', 'gamberi', 'polpo', 'pesce spada', 'orata', 'ceci', 'lenticchie', 'ricotta', 'yogurt greco', 'bresaola', 'uova'];
const urlCerca = q => `https://www.giallozafferano.it/ricerca-ricette/${encodeURIComponent(q).replace(/%20/g, '+')}/`;
const paroleFit = t => [...new Set(String(t || '').toLowerCase().split(/[,;\n]+/).map(p => p.replace(/[^\p{L}\p{N} '-]/gu, '').replace(/\s+/g, ' ').trim()).filter(p => p.length >= 2 && p.length <= 40))].slice(0, 30);
/* C124 passo 8 (Mario 10/11 «piano piano… in automatico»): RicetteFit, UNA ricetta nuova per giro (144 al giorno: le ~905 in circa 6 giorni),
   presa dal suo elenco (sitemap, tenuta 1 giorno in cache) e messa in testa alla coda; finito l'elenco, si riguarda il giorno dopo
   (solo le nuove). Una sola alla volta in coda: se la pagina non risponde si riprova, alla 3ª volta va fra le scartate (PT E29). */
const RF_GIRO = 60;   // indirizzi dell'elenco guardati per giro per trovare quella nuova
const NUTR_GIRO = 10;   // C124: ricette già salvate senza valori, rilette 10 ogni 10 minuti (~1300 in un giorno)
const RICETTE_GIRO = 2, TURBO_GIRO = 5, TURBO_PAUSA = 30000, TURBO_SVEGLIE = 400, TURBO_VUOTE = 20, CODA_MIN = 10, CRON_DB = '*/10 * * * *';
/* ricetta completa = nome, almeno 3 ingredienti, almeno 2 passi e una foto (Mario 08/11 «con cura») */
const ricettaCompleta = r => !!(r && r.nome && Array.isArray(r.ingredienti) && r.ingredienti.length >= 3 && Array.isArray(r.passi) && r.passi.length >= 2 && r.foto);
/* UN passo del motore. «db» è l'oggetto Ricettario stesso (turbo, dentro il Durable Object) oppure il suo stub (cron): con await vanno bene tutti e due.
   Ritorna { fatte, scartate, nuoveCoda }: ricette complete salvate, incomplete scartate, indirizzi messi in coda. */
async function passoMotore(db, quante, aMano) {
  const s = await db.statoDb(); if (s.pausa && !aMano) return null;
  let nuoveCoda = 0, rf = s.rf && s.rf.inCoda ? 1 : 0;
  if (s.rf && !s.rf.spento && !rf && s.rf.fine !== oggiRf()) {   // C124: RicetteFit, una nuova per giro
    try { const tt = rfElenco(await paginaGz(MAPPA_RF, 'RicetteFit')); rf = await db.rfInCoda(tt.slice(s.rf.i || 0, (s.rf.i || 0) + RF_GIRO), s.rf.i || 0, tt.length, oggiRf()); }
    catch (e) { /* elenco non raggiungibile: si riprova al prossimo giro, la coda di GZ va avanti */ }
  }
  if (s.coda < CODA_MIN) {
    // sarde in priorità ma miste (Mario 08/11 «in priorità sarde ma cercale miste»): una pagina sì e una no è delle sarde,
    // le altre girano fra le sezioni; finite le sarde, solo le altre fino al giro completo, poi le sarde ripartono
    const sarda = s.paginaSarda !== 'fine' && (Number(s.pagine) || 0) % 2 === 0;
    const parole = s.paroleFit || [], fit = !sarda && parole.length > 0 && s.paginaFit !== 'fine' && (Number(s.pagine) || 0) % 4 === 1;
    const i = Math.max(1, (Number(s.fonte) || 0) % FONTI_DB.length);
    const u = sarda ? s.paginaSarda || `https://www.giallozafferano.it/${CAT_GZ.sardegna}/`
      : fit ? s.paginaFit || urlCerca(parole[Math.min(Number(s.fitI) || 0, parole.length - 1)]) : s.pagina || `https://www.giallozafferano.it/${CAT_GZ[FONTI_DB[i]]}/`;
    let html = '';
    try { html = await paginaGz(u); } catch (e) { await db.giro({ errore: String(e.message || e) }); }
    const lista = gzCerca(html), nuove = lista.length ? await db.inCoda(lista.map(x => x.url), sarda) : 0;
    nuoveCoda = nuove;
    const dopo = lista.length ? gzProssima(html, u, lista.length) : '';
    // pagina rotta o vuota (es. 404): si passa alla sezione dopo, così il motore non resta mai fermo sulla stessa (C65)
    if (sarda) await db.posizioneSarda(dopo, nuove);
    else if (fit) await db.posizioneFit(dopo, nuove);
    else await db.posizione(dopo ? i : (i + 1) % FONTI_DB.length || 1, dopo, nuove, !dopo && i === FONTI_DB.length - 1);
  }
  let fatte = 0, scartate = 0;
  for (const u of await db.prendi(quante + rf)) {
    const ok = urlGz(u) || urlRf(u); if (!ok) { await db.togliCoda(u); continue; }
    try {
      const r = await leggiWeb(ok);
      if (!r) await db.togliCoda(u);
      else if (!ricettaCompleta(r)) { await db.scarta(u); scartate++; }   // incompleta: via dalla coda, contata, mai più riprovata
      else if (await db.salvaMotore(r)) fatte++;   // archivio + ricettario
      else await db.togliCoda(u);
    } catch (e) { /* riprova al prossimo giro (max 3) */ }
  }
  await db.giro({ fatte, scartate });
  return { fatte, scartate, nuoveCoda };
}
const oggiRf = () => new Date(Date.now() + 3600000).toISOString().slice(0, 10);   // giorno (ora italiana d'inverno, basta per «una volta al giorno»)
async function motoreRicette(cfg, aMano) {
  const db = ricDb(cfg); if (!db) return;
  const p = await passoMotore(db, RICETTE_GIRO, aMano);
  /* C72: le ricette salvate col lettore vecchio, o segnate dal controllo, si rileggono da GialloZafferano, 5 ogni giro */
  await rileggiSegnate(db, 5);
  if (p) await leggiNutr(db, NUTR_GIRO);   // C124 (in pausa no)
}
/* C124: valori per porzione delle ricette salvate prima della v0.10.3 (solo la pagina, niente video). Esito sempre scritto:
   valori · senza valori (GZ non li dà, o pagina sparita) · rete giù = riprova, alla 3ª «senza valori» (PT E29: mai fermi). */
async function leggiNutr(db, n) {
  const urls = await db.senzaNutr(n).catch(() => []);
  await Promise.all(urls.map(async u => {
    let html = '';
    try { html = await paginaGz(u); } catch (e) { return /risponde 40[4]|risponde 410/.test(String(e.message)) ? db.mettiNutr(u, null) : db.nutrRiprova(u); }
    const v = gzSoloNutr(html);
    return v === undefined ? db.nutrRiprova(u) : db.mettiNutr(u, v);
  }).map(p => p.catch(() => null)));
  return urls.length;
}
/* C123 (Mario 10/11 «5 da sistemare… secondo me non le sistema da solo»): prima il controllo le rimetteva da rileggere ogni giorno e
   GZ le ridava uguali, all'infinito («ci penso io» finto). Ora ognuna riletta ha un esito VERO e non si riprova più:
   senza problemi = sistemata · stessi problemi = «uguale» (su GZ è proprio così: es. una foto citata che lì non c'è, un frullato
   con 1 passo) · pagina tolta da GZ (404) = «sparita», si tiene la copia · rete o GZ giù = riprova, alla 3ª volta «illeggibile». */
async function rileggiSegnate(db, n) {
  const urls = await db.vecchie(n).catch(() => []);
  await Promise.all(urls.map(async u => {
    let r = null;
    try { r = await leggiWeb(u); } catch (e) { return /risponde 40[4]|risponde 410/.test(String(e.message)) ? db.tieni(u, 'sparita') : db.riprova(u); }
    if (!r || !r.nome) return db.tieni(u, 'illeggibile');   // la pagina c'è ma non è più una ricetta: si tiene la copia
    if (!esaminaRicetta(r).length) return db.salva(r);   // sistemata
    if (ricettaCompleta(r)) { r.esito = 'uguale'; return db.salva(r); }   // com'è sull'originale
    return db.tieni(u, 'uguale');   // GZ la dà più corta della copia salvata: si tiene la copia
  }).map(p => p.catch(() => null)));
  return urls.length;
}
/* C123: ricette del ricettario senza la ricetta intera nell'archivio: si leggono subito (anche se GZ le ha corte: sono state scelte) */
async function leggiMancanti(db, n) {
  const mm = await db.mancanti(n).catch(() => []);
  await Promise.all(mm.map(async m => {
    const r = await leggiWeb(m.url).catch(() => null);
    if (r && r.nome && r.id === m.id) { if (esaminaRicetta(r).length) r.esito = 'uguale'; await db.salva(r); }
  }).map(p => p.catch(() => null)));
}
/* C83 + C123: controllo di tutte, poi le segnate rilette SUBITO (10 + 10) e controllo di nuovo: l'esito è quello vero, non una promessa */
async function controllaTutte(db) {
  const c = await db.controlla();
  if (!c.nMale && !c.mancanti) return c;
  await rileggiSegnate(db, 10);
  await leggiMancanti(db, 10);
  return db.controlla();
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

/* impostazioni/app lette col token di chi chiede (cliente o gestore): i campi di Firestore, o null */
async function campiApp(req) {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROGETTO}/databases/(default)/documents/impostazioni/app`, { headers: { authorization: 'Bearer ' + tok } });
  return r.ok ? ((await r.json()) || {}).fields || {} : null;
}
const accesoAIC = f => !!f && !(f.aiClienti && f.aiClienti.booleanValue === false);   // acceso di base (Mario 08/11): spento solo se Mario lo spegne
/* l'aiutante dei clienti è acceso? (impostazioni/app.aiClienti, letto col token del cliente) */
/* un numero delle impostazioni nei suoi tetti sicuri, altrimenti quello di base */
function numeroApp(f, k, min, max, base) {
  const x = f && f[k], n = Number(x && (x.integerValue ?? x.doubleValue ?? x.stringValue));
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : base;
}
/* (C109) soglie per cliente scelte da Mario: avviso 10-200 (base 30), modo ridotto 20-1000 (base 100), sempre sopra l'avviso */
function limitiAIC(f) {
  const soglia = numeroApp(f, 'aicAvviso', 10, 200, SOGLIA_AIC_CLIENTE);
  return { soglia, ridotto: Math.max(numeroApp(f, 'aicRidotto', 20, 1000, RIDOTTO_AIC_CLIENTE), soglia + 1) };
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
  /* (C97) e = indirizzo del telefono che chiede: «questo» dice se il server lo conosce (senza mostrare gli indirizzi degli altri) */
  async stato(e) {
    const tutti = (await this.ctx.storage.get('iscritti')) || [];
    return { telefoni: tutti.map(x => ({ servizio: new URL(x.endpoint).host, da: new Date(x.da).toISOString() })), questo: e ? tutti.some(x => x.endpoint === e) : null,
      conto: (await this.ctx.storage.get('conto')) || null, ultimi: (await this.ctx.storage.get('diario')) || [] };
  }
  async scriviDiario(voce) {
    const diario = ((await this.ctx.storage.get('diario')) || []).slice(-9);
    diario.push(Object.assign({ quando: new Date().toISOString() }, voce));
    await this.ctx.storage.put('diario', diario);
  }

  async iscrivi(uid, sub, dev) {
    if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || sub.endpoint.length > 1000) return false;
    const tutti = (await this.ctx.storage.get('iscritti')) || [];
    const altri = tutti.filter(x => x.endpoint !== sub.endpoint);
    altri.push({ uid, endpoint: sub.endpoint, da: Date.now(), ...(dev ? { dev: true } : {}) });   // dev: telefono di Mario (C109)
    await this.ctx.storage.put('iscritti', altri.slice(-20));   // al massimo 20 telefoni
    return true;
  }

  async manda(soloUid, per, perCliente, extra, chi) {
    const chiave = perCliente ? 'clienti' : 'iscritti';
    if (!perCliente && per !== 'promemoria') await this.ctx.storage.put('ultimo', { ...(extra || {}), tipo: TIPI_GESTORE.includes(per) || TIPI_SERVER.includes(per) ? per : 'ordine', quando: Date.now() });
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
    await this.scriviDiario(Object.assign({ per: per || (soloUid ? 'prova' : 'ordine'), telefoni: dest.length, esiti }, chi ? { chi } : {}));
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

  /* aiutante dei clienti (C109): nessun blocco. '' = risponde l'AI; 'ridotto' = risponde il telefono (quota del giorno finita,
     o un cliente oltre il «modo ridotto» o in raffica). Ogni soglia passata: una segnalazione a chi gestisce, una volta sola */
  async contaAIC(cliente, lim) {
    const soglia = (lim && lim.soglia) || SOGLIA_AIC_CLIENTE, ridotto = Math.max((lim && lim.ridotto) || RIDOTTO_AIC_CLIENTE, soglia + 1);
    const oggi = new Date().toISOString().slice(0, 10), c0 = (await this.ctx.storage.get('aic')) || {};
    const c = c0.giorno === oggi ? c0 : { giorno: oggi, n: 0, chi: {} };
    c.raf = c.raf || {}; c.visti = c.visti || {};
    const segnala = async (chiave, ...a) => { if (c.visti[chiave]) return; c.visti[chiave] = 1; await this.segnala(...a).catch(() => {}); };
    let esito = '';
    if (cliente) {
      const ora = Date.now(), r = (c.raf[cliente] || []).filter(t => ora - t < 60000).concat(ora).slice(-RAFFICA_AIC);
      c.raf[cliente] = r;
      const n = c.chi[cliente] = (c.chi[cliente] || 0) + 1;
      if (r.length >= RAFFICA_AIC) { esito = 'ridotto'; await segnala('raffica:' + cliente, 'raffica', cliente, RAFFICA_AIC, RAFFICA_AIC); }
      if (n >= ridotto) { esito = 'ridotto'; await segnala('ridotto:' + cliente, 'ridotto', cliente, n, ridotto); }
      else if (n === soglia + 1 || n === 2 * soglia + 1) await segnala('aiutante:' + cliente + ':' + n, 'aiutante', cliente, n, soglia);
    }
    if (!esito && c.n >= TETTO_AIC) { esito = 'ridotto'; await segnala('quota', 'quota', '', c.n, TETTO_AIC); }
    if (!esito) {
      c.n++;
      if (c.n === Math.ceil(TETTO_AIC * QUOTA_AVVISO)) await segnala('quota80', 'quota80', '', c.n, TETTO_AIC);
    }
    await this.ctx.storage.put('aic', c);
    return esito;
  }
  /* (C109, PT E41) UNA funzione per segnalare a chi gestisce che una persona usa molto una cosa: non ferma mai nessuno.
     Registro (ultime 30, «Solo per te, Mario») + notifica solo ai telefoni di Mario (iscritti con dev). La usa anche l'ascolto (Voce). */
  async segnala(cosa, cliente, n, soglia) {
    const reg = ((await this.ctx.storage.get('segnalazioni')) || []).slice(-29);
    reg.push({ quando: new Date().toISOString(), cosa, cliente: cliente || '', n, soglia });
    await this.ctx.storage.put('segnalazioni', reg);
    const mario = [...new Set(((await this.ctx.storage.get('iscritti')) || []).filter(x => x.dev).map(x => x.uid))];   // solo a Mario (consiglio C109): Monica non deve fare niente
    for (const uid of mario) await this.manda(uid, 'esagera', null, { cosa, cliente: cliente || '', n });
  }
  /* ascolto preciso (C108b, PT E41): nessuno viene mai fermato. '' = ascolto normale; 'ridotto' = oltre TETTO_ASCOLTO frasi dei
     clienti nel giorno: ascolto senza Cloudflare (Groq e Deepgram hanno limiti loro). Ogni soglia passata: una segnalazione, una volta sola.
     Chi gestisce (cliente vuoto) si conta a parte e non tocca il conto dei clienti */
  async contaAscolto(cliente, soglia = TETTO_ASCOLTO_CLIENTE) {
    const oggi = new Date().toISOString().slice(0, 10), c0 = (await this.ctx.storage.get('asc')) || {};
    const c = c0.giorno === oggi ? c0 : { giorno: oggi, n: 0, chi: {} };
    c.chi = c.chi || {}; c.visti = c.visti || {};
    const segnala = async (chiave, ...a) => { if (c.visti[chiave]) return; c.visti[chiave] = 1; await this.segnala(...a).catch(() => {}); };
    if (!cliente) { c.g = (c.g || 0) + 1; await this.ctx.storage.put('asc', c); return ''; }
    c.n++;
    const n = c.chi[cliente] = (c.chi[cliente] || 0) + 1;
    if (n === soglia + 1 || n === 2 * soglia + 1) await segnala('ascolto:' + cliente + ':' + n, 'ascolto', cliente, n, soglia);
    if (c.n === TETTO_ASCOLTO + 1) await segnala('ascoltoQuota', 'ascoltoQuota', '', c.n, TETTO_ASCOLTO);
    await this.ctx.storage.put('asc', c);
    return c.n > TETTO_ASCOLTO ? 'ridotto' : '';
  }
  async contoAI() {
    const oggi = new Date().toISOString().slice(0, 10), a = (await this.ctx.storage.get('ai')) || {}, b = (await this.ctx.storage.get('aic')) || {}, s = (await this.ctx.storage.get('asc')) || {};
    return { giorno: oggi, monica: a.giorno === oggi ? a.n : 0, clienti: b.giorno === oggi ? b.n : 0, persone: b.giorno === oggi ? Object.keys(b.chi || {}).length : 0, ascolti: s.giorno === oggi ? s.n : 0,
      segnalazioni: ((await this.ctx.storage.get('segnalazioni')) || []).slice(-10),
      tetti: { monica: TETTO_AI, clienti: TETTO_AIC, sogliaCliente: SOGLIA_AIC_CLIENTE, ridottoCliente: RIDOTTO_AIC_CLIENTE, raffica: RAFFICA_AIC, ascolti: TETTO_ASCOLTO, ascoltiACliente: TETTO_ASCOLTO_CLIENTE } };
  }

  /* «ordine nuovo»: chiunque può chiederlo (il cliente non ha Google), quindi tetto al giorno e pausa */
  async avvisa(tipo, chi) {
    chi = typeof chi === 'string' && /^[A-Z0-9]{4,8}$/.test(chi) ? chi : '';   // (C99) codice fisso di chi manda l'avviso
    const oggi = new Date().toISOString().slice(0, 10), c = (await this.ctx.storage.get('conto')) || {};
    const t = TIPI_GESTORE.includes(tipo) ? tipo : 'ordine';
    /* (C97) anche gli avvisi fermati finiscono nel diario: Mario vede in Impostazioni → Notifiche perché non è suonato */
    if (c.giorno === oggi && c.n >= TETTO_GIORNO) { await this.scriviDiario({ per: t, telefoni: 0, esiti: [], fermo: 'tetto', chi }); return { fermo: 'tetto' }; }
    // il primo ordine e la richiesta di una persona nuova passano sempre (C97: prima la richiesta si perdeva se cadeva nei 15 secondi)
    if (c.ultimo && Date.now() - c.ultimo < PAUSA_MS && t !== 'primo' && t !== 'richiesta') { await this.scriviDiario({ per: t, telefoni: 0, esiti: [], fermo: 'pausa', chi }); return { fermo: 'pausa' }; }
    await this.ctx.storage.put('conto', { giorno: oggi, n: (c.giorno === oggi ? c.n : 0) + 1, ultimo: Date.now() });
    return this.manda(null, t, null, null, chi);
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
      'CREATE TABLE IF NOT EXISTS scelte (id TEXT PRIMARY KEY, url TEXT, nome TEXT, zona TEXT, categoria TEXT, foto TEXT, aggiunta INTEGER)',
      'CREATE TABLE IF NOT EXISTS scartate (url TEXT PRIMARY KEY, quando INTEGER)',   // ricette incomplete: non si riprovano
      // ricette scritte a mano (id «mia…»), uguali su tutti i telefoni; tolta=1 = cancellata
      'CREATE TABLE IF NOT EXISTS mie (id TEXT PRIMARY KEY, json TEXT, aggiornata INTEGER, tolta INTEGER DEFAULT 0)'].forEach(q => this.sql.exec(q));
    try { this.sql.exec('ALTER TABLE coda ADD COLUMN sarda INTEGER DEFAULT 0'); } catch (e) { /* c'è già */ }
    for (const c of ['voto REAL DEFAULT 0', 'video INTEGER DEFAULT 0', 'strisce INTEGER DEFAULT 0', 'nutr INTEGER']) { try { this.sql.exec('ALTER TABLE ricette ADD COLUMN ' + c); } catch (e) { /* c'è già */ } }
    /* (C119) ricette vecchie di GZ: foto dei passi a strisce piccole (ogni foto 220×170, si sgranano); una volta sola per quelle già salvate */
    if (!this.leggi1('strisceOk')) {
      this.sql.exec("UPDATE ricette SET strisce = CASE WHEN instr(json, '_strip_') > 0 OR lower(json) GLOB '*seq[0-9]*' THEN 1 ELSE 0 END");
      this.metti1('strisceOk', 1);
    }
  }
  leggi1(k) { const r = this.sql.exec('SELECT v FROM stato WHERE k = ?', k).toArray()[0]; return r ? r.v : ''; }
  metti1(k, v) { this.sql.exec('INSERT INTO stato (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', k, String(v ?? '')); }
  salva(r) {
    if (!r || !/^(?:gz|rf):[\w%-]+$/.test(r.id || '') || !r.nome) return false;
    const ora = Date.now(), cerca = minuscolo([r.nome, r.categoria, (r.ingredienti || []).map(i => i.nome).join(' ')].join(' '));
    const strisce = (r.passi || []).some(p => (p.foto || []).some(f => STRISCIA.test(String(f)))) ? 1 : 0;
    const nutr = r.nutr && typeof r.nutr === 'object' ? 1 : r.nutr === null ? 0 : null;   // C124: 1 valori · 0 GZ non li dà · null da leggere
    this.sql.exec(`INSERT INTO ricette (id, url, nome, categoria, foto, descr, cerca, json, creata, aggiornata, voto, video, strisce, nutr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, categoria = excluded.categoria, foto = excluded.foto, descr = excluded.descr, cerca = excluded.cerca, json = excluded.json, aggiornata = excluded.aggiornata, voto = excluded.voto, video = excluded.video, strisce = excluded.strisce, nutr = excluded.nutr`,
      r.id, r.url || '', r.nome, r.categoria || '', r.foto || '', String(r.intro || '').slice(0, 200), cerca, JSON.stringify(r), ora, ora, Number(r.voto) || 0, r.hls || r.mp4 ? 1 : 0, strisce, nutr);
    this.sql.exec('DELETE FROM coda WHERE url = ?', r.url || '');
    return true;
  }
  vecchie(n) { return this.sql.exec("SELECT url FROM ricette WHERE IFNULL(json_extract(json, '$.v'), 0) < 4 AND url != '' ORDER BY IFNULL(json_extract(json, '$.prove'), 0), aggiornata LIMIT ?", Math.min(20, Number(n) || 5)).toArray().map(x => x.url); }
  /* C123: riletta col lettore di oggi, si tiene com'è con l'esito (uguale · sparita · illeggibile) e non si riprova */
  tieni(url, esito = 'sparita') { this.sql.exec("UPDATE ricette SET json = json_set(json, '$.v', 4, '$.esito', ?) WHERE url = ?", String(esito), String(url)); }
  riprova(url) {   // rete o GZ giù: si riprova più tardi (in fondo alla fila), alla 3ª volta «illeggibile» (PT E29: mai fermi sullo stesso errore)
    this.sql.exec("UPDATE ricette SET json = json_set(json, '$.prove', IFNULL(json_extract(json, '$.prove'), 0) + 1) WHERE url = ?", String(url));
    this.sql.exec("UPDATE ricette SET json = json_set(json, '$.v', 4, '$.esito', 'illeggibile') WHERE url = ? AND json_extract(json, '$.prove') >= 3", String(url));
  }
  /* C124: valori per porzione */
  senzaNutr(n) { return this.sql.exec("SELECT url FROM ricette WHERE nutr IS NULL AND url != '' ORDER BY IFNULL(json_extract(json, '$.nutrProve'), 0), creata DESC LIMIT ?", Math.min(20, Number(n) || 10)).toArray().map(x => x.url); }
  mettiNutr(url, v) { this.sql.exec("UPDATE ricette SET json = json_set(json, '$.nutr', json(?)), nutr = ? WHERE url = ?", JSON.stringify(v && typeof v === 'object' ? v : null), v && typeof v === 'object' ? 1 : 0, String(url)); }
  nutrRiprova(url) {
    this.sql.exec("UPDATE ricette SET json = json_set(json, '$.nutrProve', IFNULL(json_extract(json, '$.nutrProve'), 0) + 1) WHERE url = ?", String(url));
    if ((this.sql.exec("SELECT json_extract(json, '$.nutrProve') AS n FROM ricette WHERE url = ?", String(url)).toArray()[0] || {}).n >= 3) this.mettiNutr(url, null);
  }
  /* C124: parole della corsia «fit» (vuoto = di base; [] = corsia spenta) */
  paroleFit() { const t = this.leggi1('paroleFit'); if (!t) return FIT_BASE.slice(); try { const a = JSON.parse(t); return Array.isArray(a) ? a : FIT_BASE.slice(); } catch (e) { return FIT_BASE.slice(); } }
  mettiParoleFit(a) { this.metti1('paroleFit', a ? JSON.stringify(a) : ''); this.metti1('fitI', 0); this.metti1('paginaFit', ''); }
  posizioneFit(pagina, nuove) {   // pagina dopo della parola; finite le pagine, la parola dopo; finite le parole «fine» fino al prossimo giro completo
    if (pagina) this.metti1('paginaFit', pagina);
    else { const i = (Number(this.leggi1('fitI')) || 0) + 1, fine = i >= this.paroleFit().length; this.metti1('fitI', fine ? 0 : i); this.metti1('paginaFit', fine ? 'fine' : ''); }
    this.metti1('ultimaPagina', JSON.stringify({ quando: Date.now(), nuove }));
    this.metti1('pagine', (Number(this.leggi1('pagine')) || 0) + 1);
  }
  mancanti(n) { return this.sql.exec("SELECT s.id, s.url FROM scelte s LEFT JOIN ricette r ON r.id = s.id WHERE r.id IS NULL AND s.url != '' LIMIT ?", Math.min(20, Number(n) || 5)).toArray(); }
  una(id) { const x = this.sql.exec('SELECT json FROM ricette WHERE id = ?', String(id)).toArray()[0]; return x ? JSON.parse(x.json) : null; }
  /* elenco per l'app (stessa forma della ricerca di GialloZafferano): le più nuove prima; tutte le parole presenti */
  elenco(q, da, n = 30) {
    const parole = minuscolo(q).replace(/[^\p{L}\p{N} ]/gu, ' ').split(' ').filter(p => p.length >= 2).slice(0, 5);
    const dove = parole.length ? 'WHERE ' + parole.map(() => 'cerca LIKE ?').join(' AND ') : '';
    return this.sql.exec(`SELECT url, nome, foto, categoria, descr FROM ricette ${dove} ORDER BY creata DESC LIMIT ? OFFSET ?`, ...parole.map(p => '%' + p + '%'), Math.min(31, Number(n) || 30), Math.max(0, Number(da) || 0))
      .toArray().map(x => ({ url: x.url, nome: x.nome, foto: x.foto, categoria: x.categoria, desc: x.descr }));
  }
  /* in coda solo gli indirizzi che il database non ha (né in coda né salvati): quante nuove */
  inCoda(urls, sarda) {
    let n = 0; const ora = Date.now();
    for (const u of [...new Set(urls || [])].slice(0, 40)) {
      if (typeof u !== 'string' || !/^https:\/\/ricette\.giallozafferano\.it\/[\w%-]+\.html$/.test(u)) continue;
      if (this.sql.exec('SELECT 1 FROM ricette WHERE url = ?', u).toArray().length) continue;
      if (this.sql.exec('SELECT 1 FROM coda WHERE url = ?', u).toArray().length) continue;
      if (this.sql.exec('SELECT 1 FROM scartate WHERE url = ?', u).toArray().length) continue;
      this.sql.exec('INSERT INTO coda (url, aggiunta, sarda) VALUES (?, ?, ?)', u, ora, sarda ? 1 : 0); n++;
    }
    return n;
  }
  prendi(n) {
    this.sql.exec("INSERT OR IGNORE INTO scartate (url, quando) SELECT url, ? FROM coda WHERE tentativi >= 3 AND url LIKE 'https://www.ricettefit.it/%'", Date.now());   // C124: RicetteFit illeggibile 3 volte: mai più riprovata
    this.sql.exec('DELETE FROM coda WHERE tentativi >= 3');
    const tt = this.sql.exec("SELECT url FROM coda ORDER BY (url LIKE 'https://www.ricettefit.it/%') DESC, tentativi, aggiunta LIMIT ?", n).toArray().map(x => x.url);   // RicetteFit (una alla volta) per prima
    tt.forEach(u => this.sql.exec('UPDATE coda SET tentativi = tentativi + 1 WHERE url = ?', u));
    return tt;
  }
  togliCoda(u) { this.sql.exec('DELETE FROM coda WHERE url = ?', String(u)); }
  /* C124: la prima ricetta di RicetteFit che il database non ha (né salvata, né in coda, né scartata), dagli indirizzi da «i» in poi.
     Finito l'elenco senza nuove: «fine» per oggi e domani si riparte dall'inizio (così entrano le ricette nuove). 1 = una in coda. */
  rfInCoda(urls, i, tot, oggi) {
    let k = 0;
    for (const u of (urls || []).slice(0, RF_GIRO)) {
      k++;
      if (typeof u !== 'string' || !/^https:\/\/www\.ricettefit\.it\/ricetta\/[\w%-]+\/$/.test(u)) continue;
      if (this.sql.exec('SELECT 1 FROM ricette WHERE url = ? UNION SELECT 1 FROM coda WHERE url = ? UNION SELECT 1 FROM scartate WHERE url = ?', u, u, u).toArray().length) continue;
      this.sql.exec('INSERT INTO coda (url, aggiunta, sarda) VALUES (?, ?, 0)', u, Date.now());
      this.metti1('rfI', (Number(i) || 0) + k); this.metti1('rfTot', Number(tot) || 0);
      return 1;
    }
    const dopo = (Number(i) || 0) + k, finito = !k || dopo >= (Number(tot) || 0);
    this.metti1('rfI', finito ? 0 : dopo); this.metti1('rfTot', Number(tot) || 0);
    if (finito) this.metti1('rfFine', String(oggi || ''));
    return 0;
  }
  scarta(u) { this.sql.exec('INSERT OR IGNORE INTO scartate (url, quando) VALUES (?, ?)', String(u), Date.now()); this.togliCoda(u); }
  /* ricetta del motore: archivio + ricettario insieme (zona «sarda» se l'indirizzo veniva dalle pagine sarde). Solo se completa. */
  salvaMotore(r) {
    if (!ricettaCompleta(r)) return false;
    const c = this.sql.exec('SELECT sarda FROM coda WHERE url = ?', r.url || '').toArray()[0];
    if (!this.salva(r)) return false;
    this.aggiungi({ id: r.id, nome: r.nome, zona: c && c.sarda ? 'sarda' : 'italiana', categoria: r.categoria, foto: r.foto });
    return true;
  }
  /* una volta sola: le ricette complete già nell'archivio entrano anche nel ricettario (a pezzi da 200, per la memoria) */
  riempiScelte() {
    if (this.leggi1('scelteRiempite')) return;
    this.metti1('scelteRiempite', '1');
    for (let da = 0; ; da += 200) {
      const righe = this.sql.exec('SELECT json FROM ricette ORDER BY creata LIMIT 200 OFFSET ?', da).toArray();
      for (const x of righe) {
        let r = null; try { r = JSON.parse(x.json); } catch (e) { continue; }
        if (ricettaCompleta(r)) this.aggiungi({ id: r.id, nome: r.nome, zona: 'italiana', categoria: r.categoria, foto: r.foto });
      }
      if (righe.length < 200) break;
    }
  }
  /* TURBO «carica N»: sveglie del Durable Object ogni ~30 s; ferma a N ricette complete nuove, a 400 sveglie o a 20 sveglie vuote di fila */
  turboStato() { try { return JSON.parse(this.leggi1('turbo') || 'null'); } catch (e) { return null; } }
  async turboAvvia(n) {
    const t = { obiettivo: Math.min(200, Math.max(1, Math.floor(Number(n)) || 1)), fatte: 0, scartate: 0, attivo: true, da: Date.now(), finito: 0, sveglie: 0, vuote: 0 };
    this.metti1('turbo', JSON.stringify(t));
    await this.ctx.storage.setAlarm(Date.now() + 1000);
    return t;
  }
  async alarm() {
    const t = this.turboStato(); if (!t || !t.attivo) return;
    let p = null;
    try { p = await passoMotore(this, Math.min(TURBO_GIRO, t.obiettivo - t.fatte), true); } catch (e) { /* sveglia sprecata: conta come vuota */ }
    t.sveglie++;
    if (p) { t.fatte += p.fatte; t.scartate += p.scartate; }
    t.vuote = p && (p.fatte || p.scartate) ? 0 : t.vuote + 1;
    if (t.fatte >= t.obiettivo || t.sveglie >= TURBO_SVEGLIE || t.vuote >= TURBO_VUOTE) { t.attivo = false; t.finito = Date.now(); }
    this.metti1('turbo', JSON.stringify(t));
    if (t.attivo) await this.ctx.storage.setAlarm(Date.now() + TURBO_PAUSA);
  }
  /* C83 (Mario 08/11 «hai guardato tutte le ricette caricate bene da GialloZafferano?»): controlla TUTTE le ricette del database
     (stesse regole di tools/controlla-ricette.mjs). Quelle con problemi tornano da rileggere col lettore di oggi (v 0 → il motore
     ne rilegge 5 ogni 10 minuti); nel ricettario senza la ricetta intera = «mancanti», rimesse in coda. Esito salvato per il riquadro. */
  controlla() {
    const righe = this.sql.exec('SELECT id, url, nome, json FROM ricette').toArray();
    const male = [], originali = [];
    for (const x of righe) {
      let r = null; try { r = JSON.parse(x.json); } catch (e) {}
      const prob = esaminaRicetta(r);
      if (!prob.length) continue;
      /* C123: già riletta col lettore di oggi e su GZ è così (o la pagina non c'è più): non è da sistemare, si dice il perché */
      const esito = !x.url ? 'senza-pagina' : r && Number(r.v) >= 4 && (r.esito === 'uguale' || r.esito === 'sparita') ? r.esito : '';
      if (esito) { originali.push({ id: x.id, nome: x.nome, prob: prob.slice(0, 3), esito }); continue; }
      male.push({ id: x.id, nome: x.nome, prob: prob.slice(0, 3) });   // da rileggere (anche le «illeggibili»: un giorno dopo si riprova)
      this.sql.exec("UPDATE ricette SET json = json_remove(json_set(json, '$.v', 0, '$.prove', 0), '$.esito') WHERE id = ?", x.id);
    }
    const mancanti = this.sql.exec('SELECT s.id, s.nome, s.url FROM scelte s LEFT JOIN ricette r ON r.id = s.id WHERE r.id IS NULL').toArray();
    for (const m of mancanti) if (m.url && (urlGz(m.url) || urlRf(m.url))) this.sql.exec('INSERT INTO coda (url, aggiunta, tentativi) VALUES (?, ?, 0) ON CONFLICT(url) DO NOTHING', m.url, Date.now());
    const esito = { quando: Date.now(), totale: righe.length, ok: righe.length - male.length - originali.length, male: male.slice(0, 30), nMale: male.length,
      originali: originali.slice(0, 30), nOriginali: originali.length,
      mancanti: mancanti.length, nomiMancanti: mancanti.slice(0, 10).map(m => m.nome) };
    this.metti1('controllo', JSON.stringify(esito));
    return esito;
  }
  /* ricette scritte a mano */
  mieScritte() { return this.sql.exec('SELECT id, json, aggiornata FROM mie WHERE tolta = 0 ORDER BY aggiornata DESC').toArray().map(x => ({ id: x.id, r: JSON.parse(x.json), aggiornata: x.aggiornata })); }
  salvaMia(r) {
    if (!r || typeof r !== 'object' || typeof r.id !== 'string' || !/^mia[\w-]{0,80}$/.test(r.id)) return false;
    const j = JSON.stringify(r); if (j.length > 1500000) return false;   // con la foto (~100-400 KB): sotto i 2 MB a riga
    this.sql.exec('INSERT INTO mie (id, json, aggiornata, tolta) VALUES (?, ?, ?, 0) ON CONFLICT(id) DO UPDATE SET json = excluded.json, aggiornata = excluded.aggiornata, tolta = 0', r.id, j, Date.now());
    return true;
  }
  togliMia(id) { this.sql.exec('UPDATE mie SET tolta = 1, aggiornata = ? WHERE id = ?', Date.now(), String(id)); }
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
    if (finito) { this.metti1('passate', (Number(this.leggi1('passate')) || 0) + 1); this.metti1('paginaSarda', ''); if (this.leggi1('paginaFit') === 'fine') this.metti1('paginaFit', ''); }   // finite tutte le sezioni: un giro completo, le sarde ripartono
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
  /* C69: col tempo, la difficoltà e gli ingredienti presi dall'archivio, così il telefono filtra da solo, anche senza rete */
  scelte() { return this.sql.exec(`SELECT s.id, s.url, s.nome, s.zona, s.categoria, s.foto, s.aggiunta,
      COALESCE(NULLIF(json_extract(r.json, '$.totale'), 0), IFNULL(json_extract(r.json, '$.prep'), 0) + IFNULL(json_extract(r.json, '$.cottura'), 0)) AS totale,
      IFNULL(json_extract(r.json, '$.difficolta'), '') AS difficolta, IFNULL(substr(r.cerca, 1, 250), '') AS cerca,
      CASE WHEN r.nutr = 1 THEN json_extract(r.json, '$.nutr') END AS nutr
    FROM scelte s LEFT JOIN ricette r ON r.id = s.id ORDER BY s.aggiunta DESC`).toArray().map(x => {   // C124: valori per porzione, per filtrare anche senza rete
      let n = null; try { n = x.nutr ? JSON.parse(x.nutr) : null; } catch (e) { /* niente valori */ }
      x.nutr = n ? { kcal: n.kcal, prot: n.prot, carb: n.carb, grassi: n.grassi, saturi: n.saturi, zuc: n.zuc, fibre: n.fibre, sodio: n.sodio } : null;
      return x;
    }); }
  aggiungi(x) {
    if (!x || !/^(?:gz|rf):[\w%-]+$/.test(x.id || '') || !x.nome) return false;
    const pulito = (v, n) => String(v || '').slice(0, n);
    this.sql.exec('INSERT OR IGNORE INTO scelte (id, url, nome, zona, categoria, foto, aggiunta) VALUES (?, ?, ?, ?, ?, ?, ?)', x.id, urlDaId(x.id),
      pulito(x.nome, 120), ['sarda', 'gallura', 'italiana'].includes(x.zona) ? x.zona : 'italiana', pulito(x.categoria, 40), /^https:\/\/(?:[\w.-]+\.giallozafferano\.it|www\.ricettefit\.it\/wp-content\/uploads)\//.test(x.foto || '') ? pulito(x.foto, 300) : '', Date.now());
    return true;
  }
  togli(id) { this.sql.exec('DELETE FROM scelte WHERE id = ?', String(id)); }
  /* PROPOSTE del motore: ricette dell'archivio che il tuo ricettario non ha; prima quelle con le foto grandi (C119, Mario 10/11
     «sgranatissime»: le vecchie a strisce vanno in fondo), poi col video e i voti più alti */
  proposte(fuori, da) {
    const no = new Set([...(fuori || []).map(String), ...this.scelte().map(x => x.id)]);
    const tt = this.sql.exec('SELECT id, url, nome, foto, categoria, descr, voto, video FROM ricette ORDER BY strisce ASC, video DESC, voto DESC, creata DESC LIMIT 400').toArray().filter(x => !no.has(x.id));
    return tt.slice(Math.max(0, Number(da) || 0), (Number(da) || 0) + 31).map(x => ({ url: x.url, nome: x.nome, foto: x.foto, categoria: x.categoria, desc: x.descr, voto: x.voto, video: !!x.video }));
  }
  statoDb() {
    this.riempiScelte();
    const uno = (q, ...a) => this.sql.exec(q, ...a).toArray()[0] || {}, v = uno('SELECT COUNT(*) AS n, COALESCE(SUM(byte), 0) AS b FROM voci');
    const j = k => { try { return JSON.parse(this.leggi1(k) || 'null'); } catch (e) { return null; } };
    return { scelte: uno('SELECT COUNT(*) AS n FROM scelte').n, nelRicettario: uno('SELECT COUNT(*) AS n FROM scelte').n, scartate: uno('SELECT COUNT(*) AS n FROM scartate').n,
      turbo: this.turboStato(), controllo: j('controllo'), mieServer: uno('SELECT COUNT(*) AS n FROM mie WHERE tolta = 0').n, ricette: uno('SELECT COUNT(*) AS n FROM ricette').n, coda: uno('SELECT COUNT(*) AS n FROM coda').n, voci: v.n, mbVoci: Math.round(v.b / 104857.6) / 10,
      oggi: uno('SELECT COUNT(*) AS n FROM ricette WHERE creata > ?', Date.now() - 86400000).n, pausa: !!this.leggi1('pausa'),
      conValori: uno('SELECT COUNT(*) AS n FROM ricette WHERE nutr = 1').n, senzaValori: uno('SELECT COUNT(*) AS n FROM ricette WHERE nutr IS NULL').n,   // C124
      paroleFit: this.paroleFit(), fitI: Number(this.leggi1('fitI')) || 0, paginaFit: this.leggi1('paginaFit') || '',
      rf: { lette: uno("SELECT COUNT(*) AS n FROM ricette WHERE id LIKE 'rf:%'").n, inCoda: uno("SELECT COUNT(*) AS n FROM coda WHERE url LIKE 'https://www.ricettefit.it/%'").n,   // C124 passo 8
        scartate: uno("SELECT COUNT(*) AS n FROM scartate WHERE url LIKE 'https://www.ricettefit.it/%'").n, i: Number(this.leggi1('rfI')) || 0, tot: Number(this.leggi1('rfTot')) || 0,
        fine: this.leggi1('rfFine') || '', spento: !!this.leggi1('rfSpento') },
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
      if (url.pathname === '/api/stato' && req.method === 'GET') return json(await av.stato(url.searchParams.get('e') || ''));
      if (url.pathname === '/api/ultimo' && req.method === 'GET') return json(await av.ultimo(url.searchParams.get('e') || ''));
      if (req.method !== 'POST') return json({ errore: 'metodo' }, 405);
      if (url.pathname === '/api/avvisa') { const b = await req.json().catch(() => null); return json(await av.avvisa(b && b.tipo, b && b.chi)); }
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
        const f = c ? await campiApp(req) : null;
        if (c && !accesoAIC(f)) return json({ errore: 'spento' }, 403);
        const b = await req.json().catch(() => null);
        const testo = String((b && b.testo) || '').trim().slice(0, 300), dati = JSON.stringify((b && b.dati) || {});
        if (!testo) return json({ errore: 'frase vuota' }, 400);
        if (dati.length > 40000) return json({ errore: 'dati troppo grandi' }, 413);
        if (!env.AI && !env.GROQ_API_KEY) return json({ errore: 'AI non collegata' }, 503);
        const fermo = await av.contaAIC(c, limitiAIC(f));
        if (fermo) return json({ fermo, testo: RISPOSTA_RIDOTTA, azioni: [] });   // (C109) mai «hai finito»: il telefono risponde da solo
        return json(await chiediAI(env, testo, dati, b.storia, null, true));
      }
      if (url.pathname === '/api/ascolta') {   // «ascolto preciso» (C105): clienti Groq v3 + Deepgram, chi gestisce Groq v3 + Cloudflare (C108) → correttore → { testo, alternative }
        const c = await clienteDa(req), g = c ? null : await gestoreDa(req);
        if (!c && !g) return json({ errore: 'prima Monica deve approvarti' }, 403);
        const f = c ? await campiApp(req) : null;
        if (c && !accesoAIC(f)) return json({ errore: 'spento' }, 403);
        const b = await req.json().catch(() => null), audio = b && typeof b.audio === 'string' ? b.audio : '';
        if (!audio) return json({ errore: 'audio vuoto' }, 400);
        if (audio.length > 1700000) return json({ errore: 'audio troppo lungo' }, 413);
        const modo = await av.contaAscolto(c, numeroApp(f, 'ascoltoAvviso', 10, 500, TETTO_ASCOLTO_CLIENTE));   // (C108b) mai fermo
        const piatti = Array.isArray(b.piatti) ? b.piatti.filter(x => typeof x === 'string').slice(0, 60).map(x => x.slice(0, 40)) : [];
        return json(await ascolta(env, audio, String(b.tipo || ''), piatti, undefined, { cliente: !!c || (!!g && b.comeCliente === true), ridotto: modo === 'ridotto' }));   // (C108) chi gestisce che «guarda come cliente» prova la strada vera dei clienti (Deepgram)
      }
      const uid = await gestoreDa(req);
      if (!uid) return json({ errore: 'non sei tra chi gestisce' }, 403);
      if (url.pathname === '/api/voce') { const b = await req.json().catch(() => null); return await voce(b, env, ctx).catch(e => json({ errore: String(e.message || e) }, 502)); }
      if (url.pathname === '/api/foto-gz') { const b = await req.json().catch(() => null); return await fotoGz(b && b.u, ctx); }
      if (url.pathname === '/api/gz') { const b = await req.json().catch(() => null); const r = await ricettaGz(b, env, ctx).catch(e => ({ errore: String(e.message || e) })); return json(r, r.errore ? 502 : 200); }
      if (url.pathname === '/api/conto-ai') return json(await av.contoAI());
      if (url.pathname === '/api/prova-ai') return json(await provaAI(env));
      if (url.pathname === '/api/visto-qui') return json(await av.vistoQui());
      if (url.pathname === '/api/iscrivi') {
        const b = await req.json().catch(() => null);
        return (await av.iscrivi(uid, b && b.sub, !!(b && b.dev))) ? json({ ok: true }) : json({ errore: 'iscrizione non valida' }, 400);
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
    if (ev.cron === CRON_DB) {
      ctx.waitUntil(motoreRicette(env).catch(() => null));
      const db = ricDb(env);   // C83: una volta al giorno il controllo di tutte le ricette, da solo
      if (db) ctx.waitUntil(Promise.resolve(db.statoDb()).then(s => !s.controllo || Date.now() - s.controllo.quando > 86400000 ? controllaTutte(db) : null).catch(() => null));
      return;
    }
    ctx.waitUntil(env.AVVISI.get(env.AVVISI.idFromName('cucina')).promemoria());
    const fd = fotoDb(env); if (fd) ctx.waitUntil(Promise.resolve(fd.pulisciOriginali(ORIG_GIORNI)).catch(() => null));   // ogni sera: via le foto originali oltre 60 giorni
  }
};
