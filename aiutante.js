/* Pronti in Tavola · aiutante di Monica (C48, Mario 08/11 «la miglior IA gratuita… iniziami l'assistente per Monica non clienti»).
   Monica scrive o detta una frase → il server (/api/aiutante, Workers AI gratuito) propone UNA azione →
   l'app la controlla sui dati veri, la spiega con parole sue e la fa solo dopo «Sì, fallo» (poi Annulla per 10 secondi).
   L'AI non tocca mai i dati: le azioni sono le stesse dei pulsanti dell'app. Solo per chi gestisce, mai per i clienti. */
const AI = { msgs: [], attesa: false, rec: null, bozza: '' };
const DOMANDE_AI = ['Cosa devo cucinare oggi?', 'Chi viene a ritirare oggi?', 'Chi deve ancora pagare?', 'Quanto ho incassato questo mese?'];
const ESEMPI_AI = ['«L\'ordine di Laura è pronto»', '«Togli il tiramisù dal menù»', '«Aggiungi 2 kg di farina alla spesa»'];
const Riconosci = window.SpeechRecognition || window.webkitSpeechRecognition;
const STATO_AI = { nuovo: 'da accettare', proposta: 'aspetta che il cliente risponda sul giorno', daApprovare: 'cliente nuovo da approvare', accettato: 'da preparare',
  pronto: 'pronto, da ritirare', ritirato: 'ritirato', rifiutato: 'rifiutato', annullato: 'annullato', prova: 'di prova' };
PATH.microfono = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>';
PATH.scintille = '<path d="M11 3l1.8 4.7 4.7 1.8-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z"/><path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>';
NOMI_VISTE.aiutante = 'Aiutante';

/* i dati che l'AI legge: piatti, ordini aperti o recenti (con quelli ancora da pagare) e incassi del mese */
function datiAI() {
  const d = new Date(); d.setDate(d.getDate() - 14);
  const da = iso(d), pagato = o => !!(o.paga && o.paga.ricevuto);
  const ordini = S.ordini.filter(o => !o.archiviato && (!FINITI.includes(o.stato) || o.entro >= da || (o.stato === 'ritirato' && !pagato(o))))
    .sort((a, b) => a.entro.localeCompare(b.entro)).slice(-80)
    .map(o => Object.assign({ n: o.n, cliente: cliente(o.cliente).nome, stato: STATO_AI[o.stato] || o.stato, ritiro: o.entro + ' ' + giornoLungo(o.entro),
      cosa: o.righe.map(r => `${r.nome} (${descRiga(r)})`).join(', '), totale: totale(o.righe), pagato: pagato(o) }, diProva(o) ? { prova: true } : {}));
  const c = contiMese(oggi().slice(0, 7));
  return { oggi: oggi() + ' ' + giornoLungo(oggi()),
    piatti: visibili().map(p => ({ id: p.id, nome: p.nome, nelMenu: !!p.disponibile, formati: p.formati.map(f => ({ id: f.id, nome: f.nome, prezzo: f.prezzo })) })),
    ordini, incassiMese: { giaPresi: c.presi, daPrendere: c.daPrendere, ordini: c.oo.length } };
}

/* la proposta dell'AI controllata sui dati di ADESSO: { testo } se non si può, { testo, fai } se si può (si ricontrolla anche al «Sì») */
function capisciAI(r) {
  r = r || {};
  const n = Number(r.n), o = Number.isInteger(n) && n > 0 ? S.ordini.find(x => x.n === n && !x.archiviato) : null;
  const chi = o ? cliente(o.cliente).nome : '', cosa = o ? o.righe.map(x => x.nome.toLowerCase()).join(', ') : '';
  const nessuno = { testo: `Non trovo l'ordine n. ${String(r.n).slice(0, 10)}: me lo ridici col nome del cliente?` };
  switch (r.azione) {
    case 'pronto':
      if (!o) return nessuno;
      if (o.stato === 'pronto') return { testo: `L'ordine n. ${o.n} di ${chi} è già pronto.` };
      if (o.stato !== 'accettato') return { testo: `L'ordine n. ${o.n} di ${chi} è «${STATO_AI[o.stato] || o.stato}»: non si può segnare pronto.` };
      return { testo: `Segno pronto l'ordine n. ${o.n} di ${chi} (${cosa}). ${chi} riceve l'avviso.`,
        fai: () => { cambia('Segnato pronto', () => { segna(o, 'pronto'); }); avvisaCliente(o); } };
    case 'ritirato':
      if (!o) return nessuno;
      if (!['accettato', 'pronto'].includes(o.stato)) return { testo: `L'ordine n. ${o.n} di ${chi} è «${STATO_AI[o.stato] || o.stato}»: non si può segnare ritirato.` };
      return { testo: `Segno ritirato l'ordine n. ${o.n} di ${chi} (${cosa}).`, fai: () => cambia('Ritirato', () => { segna(o, 'ritirato'); }) };
    case 'soldi':
      if (!o) return nessuno;
      if (!VALIDI.includes(o.stato)) return { testo: `L'ordine n. ${o.n} di ${chi} è «${STATO_AI[o.stato] || o.stato}»: niente soldi da segnare.` };
      if (o.paga && o.paga.ricevuto) return { testo: `I soldi dell'ordine n. ${o.n} di ${chi} sono già segnati.` };
      return { testo: `Segno ricevuti ${euro(totale(o.righe))} da ${chi} (ordine n. ${o.n}).`,
        fai: () => cambia('Soldi ricevuti', () => { o.paga = Object.assign({}, o.paga, { ricevuto: true, dice: false }); }) };
    case 'disponibile': {
      const p = piatto(r.id), si = r.si !== false && r.si !== 'false';
      if (!p || p.cestino) return { testo: 'Non trovo quel piatto: me lo ridici col nome che c\'è nel menù?' };
      if (!!p.disponibile === si) return { testo: si ? `${p.nome} è già nel menù.` : `${p.nome} è già fuori dal menù.` };
      return { testo: si ? `Rimetto nel menù ${p.nome}: i clienti lo vedono subito.` : `Tolgo dal menù ${p.nome}: i clienti non lo vedono più (gli ordini già fatti restano).`,
        fai: () => cambia(si ? `Di nuovo nel menù: ${p.nome}` : `Tolto dal menù: ${p.nome}`, () => { p.disponibile = si; }) };
    }
    case 'prezzo': {
      const p = piatto(r.id), x = Math.round(Number(String(r.prezzo).replace(',', '.')) * 100) / 100;
      if (!p || p.cestino) return { testo: 'Non trovo quel piatto: me lo ridici col nome che c\'è nel menù?' };
      const f = p.formati.find(y => y.id === r.formato) || (p.formati.length === 1 ? p.formati[0] : null);
      if (!f) return { testo: `${p.nome} ha più formati (${p.formati.map(y => y.nome).join(', ')}): quale cambio?` };
      if (!(x > 0 && x <= 500)) return { testo: 'Il prezzo non mi torna: dimmi la cifra in euro, per esempio «12 euro».' };
      if (x === f.prezzo) return { testo: `${p.nome} (${f.nome}) costa già ${euro(x)}.` };
      const strano = x > f.prezzo * 3 || x < f.prezzo / 3 ? ' Attenta: è molto diverso da prima.' : '';
      return { testo: `Cambio il prezzo di ${p.nome} (${f.nome}): da ${euro(f.prezzo)} a ${euro(x)}. Vale per gli ordini nuovi.${strano}`,
        fai: () => cambia(`Prezzo cambiato: ${p.nome}`, () => { f.prezzo = x; }) };
    }
    case 'spesa': {
      const voci = (Array.isArray(r.voci) ? r.voci : [r.voci]).map(v => String(v || '').replace(/[<>]/g, '').trim().slice(0, 60)).filter(Boolean).slice(0, 10);
      if (!voci.length) return { testo: 'Cosa aggiungo alla lista della spesa?' };
      return { testo: `Aggiungo alla lista della spesa: ${voci.join(', ')}.`,
        fai: () => { const prima = JSON.stringify(SPESA); voci.forEach(v => aggiungiVoce(v)); mostraToast(voci.length === 1 ? 'Aggiunto alla spesa' : `Aggiunte ${voci.length} cose alla spesa`, () => { SPESA = JSON.parse(prima); salvaSpesa(); render(); }); } };
    }
    case 'rispondi': case 'capito_male':
      return { testo: String(r.testo || '').trim().slice(0, 600) || 'Non ho capito bene: me lo ridici?' };
    default:
      return { testo: 'Non ho capito bene: me lo ridici con altre parole?' };
  }
}

/* la domanda al server (separata: le prove la sostituiscono con una risposta finta) */
async function chiediAiutante(testo, dati) {
  if (!sulSito()) throw new Error('Qui nell\'anteprima l\'aiutante non risponde: provalo nell\'app vera, sul telefono.');
  if (!navigator.onLine) throw new Error('Sei senza internet: riprova quando torna la rete.');
  const tok = await Dati.token(); if (!tok) throw new Error('Entra prima con Google.');
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 30000);
  try {
    const res = await fetch('/api/aiutante', { method: 'POST', signal: ctl.signal, headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ testo, dati }) });
    const j = await res.json().catch(() => ({}));
    if (res.status === 503) throw new Error('L\'aiutante non è ancora acceso: avvisa Mario.');
    if (res.status === 403) throw new Error('Solo chi gestisce può usare l\'aiutante.');
    if (!res.ok) throw new Error(`Qualcosa non va (${j.errore || res.status}): riprova tra poco.`);
    if (j.grezzo) console.warn('aiutante: risposta non letta', j.grezzo);
    return j;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Ci sto mettendo troppo: riprova tra poco.');
    if (e instanceof TypeError) throw new Error('Non riesco a collegarmi: riprova tra poco.');
    throw e;
  } finally { clearTimeout(t); }
}

async function inviaAI(testo, voce) {
  testo = String(testo || '').trim().slice(0, 400);
  if (!testo || AI.attesa) return;
  AI.bozza = ''; AI.msgs.push({ chi: 'io', t: testo }); AI.attesa = true;
  render(); fondoAI();
  let r;
  try { r = await chiediAiutante(testo, datiAI()); } catch (e) { r = { azione: 'rispondi', testo: e.message }; }
  const c = capisciAI(r);
  AI.attesa = false;
  AI.msgs.push({ chi: 'lei', t: c.testo, r: c.fai ? r : null });
  AI.msgs = AI.msgs.slice(-30);
  if (UI.vista === 'aiutante') { render(); fondoAI(); }
  if (voce) parlaAI(c.testo + (c.fai ? ' Faccio?' : ''));
}
function fondoAI() { if (UI.vista === 'aiutante') window.scrollTo(0, document.body.scrollHeight); }
function parlaAI(t) {
  if (!window.speechSynthesis) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'it-IT'; speechSynthesis.speak(u); } catch (e) { /* senza voce: resta scritto */ }
}
/* microfono: dettatura in italiano, a fine frase parte da sola */
function ascoltaAI() {
  if (!Riconosci) { mostraToast('Questo telefono non sa dettare: scrivi la frase.'); return; }
  if (AI.rec) { AI.rec.stop(); return; }
  let detto = '';
  const rec = new Riconosci();
  rec.lang = 'it-IT'; rec.interimResults = true; rec.maxAlternatives = 1;
  rec.onresult = e => { detto = [...e.results].map(x => x[0].transcript).join(''); AI.bozza = detto; const el = $('#ai-testo'); if (el) el.value = detto; };
  rec.onerror = e => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') mostraToast('Per dettare serve il microfono: tocca «Consenti» quando il telefono lo chiede.');
    else if (e.error === 'no-speech') mostraToast('Non ho sentito nulla: riprova.');
    else if (e.error === 'network') mostraToast('Per dettare serve internet.');
  };
  rec.onend = () => { AI.rec = null; if (detto.trim()) inviaAI(detto, true); else render(); };
  AI.rec = rec;
  try { rec.start(); render(); } catch (e) { AI.rec = null; render(); }
}

/* ---------- disegno ---------- */
function barraAI() {   // nella Home, sotto il saluto: come la ricerca dei siti fatti bene
  return `<div class="ai-barra"><button type="button" class="ai-apri" data-a="vai" data-v="aiutante">${ico('scintille')}<span>Chiedi all'aiutante…</span></button>
    ${Riconosci ? `<button type="button" class="ai-mic" data-a="ai-detta" aria-label="Detta all'aiutante">${ico('microfono')}</button>` : ''}</div>`;
}
function fumettoAI(m, i) {
  if (m.chi === 'io') return `<div class="ai-fum io">${esc(m.t)}</div>`;
  let h = `<div class="ai-fum lei">${esc(m.t)}`;
  if (m.r) h += m.esito ? `<small class="ai-esito">${m.esito === 'fatto' ? '✓ Fatto' : m.esito === 'no' ? 'Lasciato stare' : esc(m.esito)}</small>`
    : `<div class="fila ai-faccio"><b>Faccio?</b><button type="button" class="btn piccolo" data-a="ai-si" data-i="${i}">${ico('spunta')}Sì, fallo</button><button type="button" class="btn chiaro piccolo" data-a="ai-no" data-i="${i}">No</button></div>`;
  return h + '</div>';
}
function vAiutante() {
  let h = testataMonica('Aiutante', 'home') + '<main class="corpo aiutante">';
  if (!AI.msgs.length) h += `<section class="scheda ai-intro">${ico('scintille')}<div><b>Ciao! Sono il tuo aiutante.</b>
    <p style="margin:4px 0 0">Scrivimi o dimmi a voce cosa vuoi fare. Prima di cambiare qualcosa ti chiedo sempre «Faccio?».</p>
    <p class="tenue piccolo" style="margin:6px 0 0">Per esempio: ${ESEMPI_AI.join(' · ')}</p></div></section>`;
  h += `<div class="ai-chat" aria-live="polite">${AI.msgs.map(fumettoAI).join('')}${AI.attesa ? '<div class="ai-fum lei ai-pensa" aria-label="Sto pensando"><span></span><span></span><span></span></div>' : ''}</div>`;
  if (!AI.attesa) h += `<div class="scelte ai-domande">${DOMANDE_AI.map(d => `<button type="button" class="chip" data-a="ai-chiedi" data-t="${esc(d)}">${esc(d)}</button>`).join('')}</div>`;
  h += `<div class="ai-scrivi"><input id="ai-testo" type="text" enterkeyhint="send" autocomplete="off" maxlength="400" placeholder="${AI.rec ? 'Ti ascolto…' : 'Scrivi qui…'}" value="${esc(AI.bozza)}" aria-label="Cosa vuoi fare?">
    ${Riconosci ? `<button type="button" class="ai-mic ${AI.rec ? 'acceso' : ''}" data-a="ai-detta" aria-label="${AI.rec ? 'Smetti di ascoltare' : 'Detta'}">${ico('microfono')}</button>` : ''}
    <button type="button" class="btn" data-a="ai-invia" ${AI.attesa ? 'disabled' : ''}>Invia</button></div>
    <p class="tenue piccolo" style="margin:0">L'aiutante usa un'intelligenza artificiale gratuita: può sbagliare, per questo ti chiede sempre prima di fare.</p>`;
  return h + '</main>';
}

/* ---------- azioni ---------- */
Object.assign(A, {
  'ai-invia'() { const el = $('#ai-testo'); inviaAI(el ? el.value : AI.bozza); },
  'ai-chiedi'(el) { inviaAI(el.dataset.t); },
  'ai-detta'() { if (UI.vista !== 'aiutante') vai('aiutante'); ascoltaAI(); },
  'ai-si'(el) {
    const m = AI.msgs[Number(el.dataset.i)]; if (!m || !m.r || m.esito) return;
    const c = capisciAI(m.r);   // ricontrollo: nel frattempo può aver cambiato qualcosa anche l'altra persona
    if (!c.fai) { m.esito = c.testo; render(); return; }
    m.esito = 'fatto'; c.fai();
  },
  'ai-no'(el) { const m = AI.msgs[Number(el.dataset.i)]; if (m && !m.esito) { m.esito = 'no'; render(); } }
});
document.addEventListener('input', e => { if (e.target.id === 'ai-testo') AI.bozza = e.target.value; });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ai-testo') { e.preventDefault(); inviaAI(e.target.value); } });
