# Comando vocale dei clienti (C105): i ganci da scrivere · Voce 2 → Voce 3 · 09/11/2026

`voce-clienti.js` (543 righe, sintassi ok, commit f22334b3) è scritto ma NON collegato: fuori da index.html non cambia nulla online. Qui i pezzi esatti da aggiungere negli altri file (zona Voce di `docs/CHI-FA-COSA.md`). Le funzioni che il file espone: `capisciCliente(testo, scelte)` → `{intento, piatti, giorno, confidenza, risposta:{testo, azioni}, alternative:[{nome, testo, scelte}], indizi}`; `rispondiSiNoCliente(intento)`; `ascoltaCliente({perSi, dettato})`; `dopoVoceCliente(i)`; `dopoConfermaCliente(m)`; `perVoceCliente(t)`; `esempiVoce()`; `ascoltoInCorso()`; azioni `A['vc-alt']`, `A['vc-detta']`; il microfono fisso si disegna da solo (`#vc` nel body, aggancio a `window.render`).

## 1. index.html e tools/anteprima.py
- index.html: dopo `<script src="aiutante.js"></script>` → `<script src="voce-clienti.js"></script>`.
- anteprima.py riga 18: nella tupla, `'voce-clienti.js'` subito dopo `'aiutante.js'`.

## 2. aiutante.js, solo zona «AIUTANTE DEI CLIENTI» (righe ~641-807)
**`inviaAC(testo, voce, extra = {})`** (riga ~715), nuovo corpo:
```js
async function inviaAC(testo, voce, extra = {}) {
  testo = String(testo || '').trim().slice(0, 300);
  if (!testo || AIC.attesa) return;
  const loc = typeof capisciCliente === 'function' ? capisciCliente(testo, extra.scelte) : null;   // capisce senza rete (voce-clienti.js)
  if (loc && (loc.intento === 'si' || loc.intento === 'no') && typeof rispondiSiNoCliente === 'function' && rispondiSiNoCliente(loc.intento)) return;   // «sì»/«no» sull'ultima proposta
  const storia = AIC.msgs.slice(-6).map(m => ({ chi: m.chi, t: m.t }));
  AIC.msgs.forEach(m => { if (m.piano && !m.esito) m.esito = 'no'; });
  AIC.bozza = ''; AIC.msgs.push({ chi: 'io', t: extra.nome || testo }); AIC.attesa = true;
  render(); fondoAC();
  let r;
  if (loc && loc.confidenza >= 0.6) r = loc.risposta;   // risposta locale: istantanea, zero neuroni, anche in aereo
  else {
    try { r = await window.chiediAiutoCliente(testo, Object.assign(datiAIC(), loc ? { indizi: loc.indizi } : {}), storia); }
    catch (e) { r = { testo: e.message + (loc ? ' ' + loc.risposta.testo : ''), azioni: loc ? loc.risposta.azioni : [] }; }
  }
  const pi = pianoDa(r);
  pi.azioni = pi.azioni.slice(0, 4);
  AIC.attesa = false;
  AIC.msgs.push({ chi: 'lei', t: pi.testo, piano: pi.azioni.length ? pi.azioni : null, voce: !!voce, dettato: !!extra.dettato, giorno: loc ? loc.giorno : null, alt: loc && loc.alternative.length ? loc.alternative : null });
  AIC.msgs = AIC.msgs.slice(-30);
  if (UI.vista === 'aiuto') { render(); fondoAC(); }
  const i = AIC.msgs.length - 1, haFai = pi.azioni.some(x => controllaAIC(x.a).fai);
  const o = k => typeof opz !== 'function' || opz(k) !== false, poi = () => { if (typeof dopoVoceCliente === 'function') dopoVoceCliente(i); };
  if (voce) { if (o('voceClientiRisponde')) parlaAI((typeof perVoceCliente === 'function' ? perVoceCliente(pi.testo) : pi.testo) + (haFai ? (o('voceClientiConferma') ? ' Lo metto nel carrello? Dimmi sì o no.' : ' Controlla e tocca Conferma.') : ''), poi); else poi(); }
}
```
**`fumettoAC`** (riga ~749): dentro `if (m.chi !== 'io')`, dopo il testo, le alternative: `if (m.alt && !m.altFatto) h += `<div class="scelte vc-alt">${m.alt.map((a, j) => `<button type="button" class="chip" data-a="vc-alt" data-m="${i}" data-j="${j}">${esc(a.nome)}</button>`).join('')}</div>`;`.
**`'ac-detta'`** (riga ~778): `'ac-detta'() { if (typeof ascoltaCliente === 'function') { ascoltaCliente(); return; } if (UI.vista !== 'aiuto') vai('aiuto'); ascoltaAI(inviaAC, AIC); }`. In `vAiutoCliente` il microfono acceso: `AI.rec || (typeof ascoltoInCorso === 'function' && ascoltoInCorso())`; la condizione `Riconosci ?` diventa `(Riconosci || window.MediaRecorder) ?` anche in `barraAIC`.
**`'ac-si'`**: dopo `scelte.forEach(c => c.fai()); m.esito = 'fatto'; render();` → `if (typeof dopoConfermaCliente === 'function') dopoConfermaCliente(m);` (mette il giorno in `UI.entro`, va al carrello e legge il riepilogo se la proposta è nata dalla voce).
**`vAiutoCliente`** intro: esempi veri `typeof esempiVoce === 'function' ? esempiVoce().slice(0, 3).join(' · ') : '…'` e un tasto `<button type="button" class="btn chiaro piccolo" data-a="vc-detta">${ico('microfono')}Dettami l'ordine</button>`.
**`datiAIC`** (privacy, Mario 08/11 «allergie solo sul telefono»): `mieAllergie` → `allergie: P.allergie.length ? 'segnate sul telefono, le controlla l\'app (non chiederle)' : 'nessuna segnata'`. Le domande sulle allergie le risolve `capisciCliente` sul telefono (intento `allergeni`, 0,9); al server arrivano solo le frasi poco chiare.

## 3. worker.js: `/api/ascolta` (subito dopo il blocco `/api/aiuto-cliente`, riga ~815, PRIMA di `const uid = await gestoreDa(req)`)
```js
      if (url.pathname === '/api/ascolta') {   // «ascolto preciso» dei clienti (C105): audio → Whisper (Cloudflare, poi Groq) → testo
        const c = await clienteDa(req), g = c ? null : await gestoreDa(req);
        if (!c && !g) return json({ errore: 'prima Monica deve approvarti' }, 403);
        if (c && !(await aiClientiAcceso(req))) return json({ errore: 'spento' }, 403);
        const b = await req.json().catch(() => null), audio = b && typeof b.audio === 'string' ? b.audio : '';
        if (!audio) return json({ errore: 'audio vuoto' }, 400);
        if (audio.length > 1700000) return json({ errore: 'audio troppo lungo' }, 413);
        const fermo = await av.contaAscolto(c);
        if (fermo) return json({ fermo, testo: '' });
        const piatti = Array.isArray(b.piatti) ? b.piatti.filter(x => typeof x === 'string').slice(0, 60).map(x => x.slice(0, 40)) : [];
        return json(await ascolta(env, audio, String(b.tipo || ''), piatti));
      }
```
Funzione `ascolta` (vicino a `ponteAI`, riga ~107):
```js
const TETTO_ASCOLTO = 400, TETTO_ASCOLTO_CLIENTE = 40;   // ascolti al giorno: in tutto e per cliente (Whisper: ~4 neuroni a frase)
async function ascolta(env, audioB64, tipo, piatti) {
  const prompt = `Pronti in Tavola, cucina sarda di Monica a Olbia. Piatti: ${piatti.join(', ')}. Parole: teglia da sei, teglia da otto, al chilo, mezzo chilo, etti, pezzi, sabato, domenica, culurgiones, seadas, panade, malloreddus.`.slice(0, 800);
  const pulisci = t => String(t || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  let errore = '';
  if (env.AI) {
    try { const r = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio: audioB64, language: 'it', initial_prompt: prompt }); const t = pulisci(r && r.text); if (t) return { testo: t, motore: 'cloudflare' }; errore = 'vuoto'; }
    catch (e) { errore = String(e.message || e); }
  }
  if (env.GROQ_API_KEY) {
    try {
      const bytes = Uint8Array.from(atob(audioB64), ch => ch.charCodeAt(0)), est = /mp4/.test(tipo) ? 'mp4' : /aac/.test(tipo) ? 'aac' : /ogg/.test(tipo) ? 'ogg' : 'webm';
      const fd = new FormData(); fd.append('file', new Blob([bytes], { type: tipo || 'audio/webm' }), 'voce.' + est); fd.append('model', 'whisper-large-v3-turbo'); fd.append('language', 'it'); fd.append('prompt', prompt.slice(0, 600)); fd.append('temperature', '0');
      const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { authorization: 'Bearer ' + env.GROQ_API_KEY }, body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.text) return { testo: pulisci(j.text), motore: 'groq' };
      errore += ' / groq ' + (j.error ? j.error.message : r.status);
    } catch (e) { errore += ' / groq ' + e.message; }
  }
  return { testo: '', errore: errore || 'nessun motore' };
}
```
Nel Durable Object `Avvisi` (vicino a `contaAIC`, riga ~554): `contaAscolto(cliente)` uguale a `contaAIC` ma chiave `'asc'` e tetti `TETTO_ASCOLTO`/`TETTO_ASCOLTO_CLIENTE`; in `contoAI` aggiungere `ascolti: (await this.ctx.storage.get('asc') || {}).giorno === oggi ? …n : 0`. Controllare dal vivo che `env.AI.run` accetti `audio` in base64 per questo modello (specifica §2: sì, dati del 09/11); se dà errore, mandare `{ body: bytes, contentType: tipo }`.

## 4. opzioni.js: 6 voci nel gruppo `clienti` (dopo `aiClienti`) + tipo `scelta`
```js
  { k: 'voceClientiFab', g: 'clienti', nome: 'Microfono fisso per i clienti', tipo: 'si', def: true, aiuto: 'Acceso: nel menù e nel carrello c\'è un microfono sempre a portata di dito, per ordinare e chiedere a voce.', parole: /microfono (fisso|grande|nel menu)|tasto (del )?microfono|comando vocale|voce dei client/ },
  { k: 'voceClientiRisponde', g: 'clienti', nome: 'L\'aiutante risponde a voce ai clienti', tipo: 'si', def: true, aiuto: 'Acceso: quando il cliente parla, la risposta viene anche letta a voce.', parole: /rispond\w* a voce|legge le risposte|voce dell.aiutante/ },
  { k: 'voceClientiConferma', g: 'clienti', nome: '«Sì» detto a voce mette nel carrello', tipo: 'si', def: true, aiuto: 'Acceso: dopo la proposta l\'aiutante chiede «Lo metto nel carrello?» e basta dire sì. L\'ordine parte comunque solo con «Invia».', parole: /si a voce|conferma a voce|senza toccare/ },
  { k: 'voceClientiSecondi', g: 'clienti', nome: 'Silenzio che chiude l\'ascolto preciso', tipo: 'numero', min: 2, max: 6, def: 3, unita: 'secondi', aiuto: 'Quanti secondi di silenzio aspetta l\'ascolto preciso prima di capire la frase.', parole: /secondi di silenzio|ascolto (troppo )?(lungo|corto)|si ferma (troppo )?(presto|tardi)/ },
  { k: 'voceClientiMotore', g: 'clienti', nome: 'Come ascolta i clienti', tipo: 'scelta', scelte: [['auto', 'Da sola: telefono, poi ascolto preciso se serve'], ['telefono', 'Solo il telefono'], ['preciso', 'Sempre l\'ascolto preciso (sul server)']], def: 'auto', aiuto: 'L\'ascolto preciso capisce meglio i nomi sardi e le frasi lunghe, ma passa dal server.', parole: /ascolto preciso|motore (della |di )?voce|come ascolta/ },
  { k: 'voceClientiSinonimi', g: 'clienti', nome: 'Parole dei clienti per i piatti', tipo: 'testo', max: 400, def: '', es: 'es. sebadas=seadas, culurgionis=culurgiones', aiuto: 'Come i clienti chiamano i tuoi piatti, se diverso dal menù: «parola detta=parola del menù», separate da virgola.', parole: /sinonim|parole (dei|per i) piatt|come (li )?chiamano/ },
```
Tipo `scelta`: in `valoreOpz` → `case 'scelta': return o.scelte.some(([k]) => k === v) ? v : undefined;`; in `testoOpz` → `case 'scelta': return (o.scelte.find(([k]) => k === v) || ['', v])[1];`; in `sezOpz` → `if (o.tipo === 'scelta') dentro += `<div class="scelte">${o.scelte.map(([k, t]) => `<button type="button" class="chip" data-a="o-scelta" data-k="${o.k}" data-v="${k}" aria-pressed="${v === k}">${esc(t)}</button>`).join('')}</div>`;`; in `AZIONI_OPZ` → `'o-scelta'(el) { const k = el.dataset.k, v = el.dataset.v, o = OPZ[k]; if (!o || opz(k) === v) return; cambia(testoOpz(o, v), () => { S.impostazioni[k] = v; }); }`. Controllare che `tools/prova-impostazioni.js` accetti il tipo nuovo (grep `tipo`). Le voci entrano da sole nell'aiutante di Monica (`impostazioniExtra`, `DOVE_AI['opz-…']`).

## 5. style.css, in fondo, solo `.vc-*`
`#vc` fisso; `.vc-fabs { position: fixed; left: 16px; bottom: calc(84px + env(safe-area-inset-bottom)); z-index: 30; display: flex; gap: 8px; align-items: center; }` (a SINISTRA: a destra c'è «Scrivimi» `.wa-monica`); `.vc-fab` 58×58 tondo bordeaux (`var(--vino)`), `.vc-fab.acceso` terracotta con anello che pulsa (come `ai-ascolta`); `.vc-detta` pillola crema con bordo `var(--grano)` (nascosta sotto 380 px: `@media (max-width: 379px) { .vc-detta { display: none; } }`); `.vc-pannello` scheda fissa sopra i tasti (`left: 16px; right: 16px; bottom: calc(150px + env(safe-area-inset-bottom))`), `.vc-onda span` 5 barrette che pulsano (`@keyframes vc-onda`), `.vc-primo` sfondo crema; `body.vc-su main.corpo { padding-bottom: 96px; }` (il microfono non copre «Invia» nel carrello); `touch-action: manipulation; user-select: none; -webkit-touch-callout: none` sul `.vc-fab` (tieni premuto); `@media (prefers-reduced-motion: reduce)` ferma le animazioni.

## 6. tools/prova.js: passi nuovi in fondo (prima di `console.log(errori…`), autonomi
1. **capisce 30 frasi** con `page.evaluate`: tabella `[frase, intento, idPiatto, qta, formato, giornoAtteso]` sui piatti di data.js (lasagne-ragu, polpette-carne, tiramisu, panade-carne, ravioli+gusto ricotta, papassini al kg, parmigiana): «due teglie di lasagne al ragù per sabato» → ordina, qta 2, t6, sabato prossimo (calcolato nella pagina con `piuGiorni`); «una teglia da 8 di lasagne al ragu» → t8; «un chilo e mezzo di polpette di carne» → 1.5 kg; «tre etti di papassini» → 0.5 (minimo) con nota; «la sagne al ragù» (trascrizione rotta) → lasagne-ragu; «quanto costa il tiramisù» → prezzo; «il tiramisù ha il glutine?» → allergeni, testo con «glutine»; «cosa c'è di pronto oggi» → pronti; «il mio ordine è pronto?» → stato; «cosa mi consigli» → consiglio; «lasagne» → ambiguo con 3 alternative; «polpette» → ambiguo 4; «scrivi a Monica che arrivo alle 18» → monica; «lo stesso dell'ultima volta» → rifai; «apri il carrello» → apri; «sì», «no», «ciao», «grazie»; «una domanda: quanto costa la parmigiana» → prezzo (non ordina); «blu vermiglio» → confidenza < 0,6.
2. **microfono finto**: `window.SpeechRecognition = class { start() { setTimeout(() => { const alts = window.__frasi.shift(); const r = alts.map(t => ({ transcript: t })); r.isFinal = true; r.length = alts.length; this.onresult({ resultIndex: 0, results: [r] }); setTimeout(() => this.onend(), 40); }, 60); } stop() {} abort() {} }`; `S.impostazioni.voceClientiRisponde = false` (così `dopoVoceCliente` parte subito senza aspettare la voce); `__frasi = [['due teglie di la sagne al ragu per sabato', 'due teglie di lasagne al ragù per sabato'], ['sì']]`; clic su `.vc-fab` nel menù → vista `aiuto`, fumetto «io» con la frase scelta (quella con più senso), carrello vuoto finché non arriva il «sì» → riga `lasagne-ragu` qta 2, `UI.vista === 'carrello'`, `UI.entro` = sabato. Foto `40-voce-clienti`.
3. **ascolto preciso finto**: `S.impostazioni.voceClientiMotore = 'preciso'`; `navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [] })`; `window.MediaRecorder = class { constructor() { this.state = 'inactive'; } start() { this.state = 'recording'; } stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob([new Uint8Array(3000)]) }); this.onstop(); } static isTypeSupported() { return true; } }`; `window.ascoltaServerFinto = async b => { window.__mandato = b; return { testo: 'un chilo di polpette di carne per domani', motore: 'finto' }; }`; clic `.vc-fab`, attesa 700 ms, `fermaAscoltoCliente()` → `__mandato.piatti` è l'elenco dei nomi, proposta con `polpette-carne` 1 kg. Poi `voceClientiMotore = 'telefono'` → clic → `VC.media` resta null e parte il riconoscitore finto.
4. **«Dettami l'ordine»**: `data-vc="detta"` con il registratore finto che ridà «due teglie di lasagne al ragù, un chilo di polpette di carne e un tiramisù per sabato» → 3 azioni carrello; «Conferma» → 3 righe, `UI.entro` sabato, vista carrello.
5. **C50** (riga ~592): il chip «Cosa c'è di pronto oggi?» ora risponde in locale: controllare `.ai-fum.lei` presente, poi scrivere «blu vermiglio quattordici» (confidenza bassa → server → nell'anteprima il messaggio con «anteprima»). Il resto del passo resta uguale («due per sabato» senza piatto va al server finto).
Giro: `python3 -I tools/anteprima.py && SOLO="voce|C50" node tools/prova.js > /tmp/pit/prova-voce.txt`, poi il giro completo in un file prima del push (E27).

## 7. Versione e consegna
Versione libera (`curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP`), NOVITA una riga per funzione (parole di Mario: «comando vocale dei clienti: parli e ordini»), `docs/DA-FARE.md` C105 (👁 già scritta), push → `sito.yml` → a Mario «chiudi e riapri l'app», dove toccare e «A cosa serve».
