/* Pronti in Tavola · aiutante di Monica (C48; Mario 08/11 «iniziami l'assistente per Monica non clienti», poi «potenzialo al massimo»).
   Monica scrive, detta o manda una FOTO → il server (/api/aiutante, Workers AI gratuito) propone un PIANO di 0-8 azioni →
   l'app controlla ogni azione sui dati veri e la mostra «prima → dopo», Monica può toglierne o correggerne i valori →
   «Fai» le fa tutte insieme (un solo Annulla per 10 secondi). L'AI non tocca mai i dati: le azioni sono quelle dei pulsanti dell'app.
   Solo per chi gestisce, mai per i clienti. */
const AI = { msgs: [], attesa: false, rec: null, bozza: '', foto: null };
const DOMANDE_AI = ['Cosa devo cucinare oggi?', 'Come si mette la pausa?', 'Chi viene a ritirare oggi?', 'Chi deve ancora pagare?', 'Quanto ho incassato questo mese?', 'Com\'è andata la settimana?'];
const ESEMPI_AI = ['«L\'ordine di Laura è pronto e ha pagato»', '«Togli il tiramisù e alza le lasagne a 14 euro»', '«Sono in ferie fino a domenica»', 'una foto della lista della spesa scritta a mano'];
const Riconosci = window.SpeechRecognition || window.webkitSpeechRecognition;
const STATO_AI = { nuovo: 'da accettare', proposta: 'aspetta che il cliente risponda sul giorno', daApprovare: 'cliente nuovo da approvare', accettato: 'da preparare',
  pronto: 'pronto, da ritirare', ritirato: 'ritirato', rifiutato: 'rifiutato', annullato: 'annullato', prova: 'di prova' };
const VISTE_AI = { ordini: 'Ordini', piatti: 'I miei piatti', clienti: 'Clienti', impostazioni: 'Impostazioni', spesa: 'Lista della spesa' };
PATH.microfono = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>';
PATH.scintille = '<path d="M11 3l1.8 4.7 4.7 1.8-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z"/><path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>';
NOMI_VISTE.aiutante = 'Aiutante';

/* i dati che l'AI legge: piatti, ordini aperti o recenti (con quelli ancora da pagare), incassi, pausa */
function datiAI() {
  const d = new Date(); d.setDate(d.getDate() - 14);
  const da = iso(d), pagato = o => !!(o.paga && o.paga.ricevuto), imp = S.impostazioni;
  const ordini = S.ordini.filter(o => !o.archiviato && (!FINITI.includes(o.stato) || o.entro >= da || (o.stato === 'ritirato' && !pagato(o))))
    .sort((a, b) => a.entro.localeCompare(b.entro)).slice(-80)
    .map(o => Object.assign({ n: o.n, cliente: cliente(o.cliente).nome, stato: STATO_AI[o.stato] || o.stato, ritiro: o.entro + ' ' + giornoLungo(o.entro),
      cosa: o.righe.map(r => `${r.nome} (${descRiga(r)})`).join(', '), totale: totale(o.righe), pagato: pagato(o) }, diProva(o) ? { prova: true } : {}));
  const c = contiMese(oggi().slice(0, 7));
  return { oggi: oggi() + ' ' + giornoLungo(oggi()), pausa: imp.pausa && imp.pausa.attiva ? 'in pausa fino al ' + imp.pausa.fino : 'aperta',
    piatti: visibili().map(p => ({ id: p.id, nome: p.nome, cat: p.cat, nelMenu: !!p.disponibile, descrizione: p.sotto || '', prontiOggi: p.pronto && p.pronto.giorno === oggi() ? p.pronto.qta : 0,
      formati: p.formati.map(f => ({ id: f.id, nome: f.nome, prezzo: f.prezzo })) })),
    ordini, incassiMese: { giaPresi: c.presi, daPrendere: c.daPrendere, ordini: c.oo.length } };
}

/* ---------- ogni azione controllata sui dati di ADESSO ----------
   { no: 'perché no' } oppure { titolo, prima, dopo, campi: [[chiave, tipo, etichetta]], fai(), dopoFatto() } oppure { link } (WhatsApp, vai a…) */
const numeroAI = v => Math.round(Number(String(v).replace(',', '.')) * 100) / 100;
const giornoOk = g => /^\d{4}-\d{2}-\d{2}$/.test(String(g)) && g >= oggi() && g <= iso(new Date(Date.now() + 120 * 864e5));
function controllaAI(a) {
  const n = Number(a.n), o = Number.isInteger(n) && n > 0 ? S.ordini.find(x => x.n === n && !x.archiviato) : null;
  const chi = o ? cliente(o.cliente).nome : '', cosa = o ? o.righe.map(x => x.nome.toLowerCase()).join(', ') : '';
  const ord = o ? `Ordine n. ${o.n} di ${chi}` : '', stato = o ? `«${STATO_AI[o.stato] || o.stato}»` : '';
  const serveOrdine = ['pronto', 'ritirato', 'soldi', 'accetta', 'rifiuta', 'proponi', 'whatsapp'].includes(a.azione);
  if (serveOrdine && !o) return { no: `Non trovo l'ordine n. ${String(a.n).slice(0, 10)}: dimmi il nome del cliente.` };
  const p = a.id ? piatto(a.id) : null;
  if (['disponibile', 'prezzo', 'pronti', 'descrizione'].includes(a.azione) && (!p || p.cestino)) return { no: 'Non trovo quel piatto: dimmi il nome che c\'è nel menù.' };
  switch (a.azione) {
    case 'pronto':
      if (o.stato !== 'accettato') return { no: `${ord} è ${stato}: non si può segnare pronto.` };
      return { titolo: `${ord}: pronto`, prima: 'Da preparare', dopo: `Pronto · ${chi} riceve l'avviso`, nota: cosa, fai: () => segna(o, 'pronto'), dopoFatto: () => avvisaCliente(o) };
    case 'ritirato':
      if (!['accettato', 'pronto'].includes(o.stato)) return { no: `${ord} è ${stato}: non si può segnare ritirato.` };
      return { titolo: `${ord}: ritirato`, prima: STATO_AI[o.stato], dopo: 'Ritirato', nota: cosa, fai: () => segna(o, 'ritirato') };
    case 'soldi':
      if (!VALIDI.includes(o.stato)) return { no: `${ord} è ${stato}: niente soldi da segnare.` };
      if (o.paga && o.paga.ricevuto) return { no: `I soldi dell'ordine n. ${o.n} sono già segnati.` };
      return { titolo: `${ord}: soldi ricevuti`, prima: 'Da prendere', dopo: `Presi ${euro(totale(o.righe))}`, fai: () => { o.paga = Object.assign({}, o.paga, { ricevuto: true, dice: false }); } };
    case 'accetta':
      if (o.stato !== 'nuovo') return { no: `${ord} è ${stato}: non c'è niente da accettare.` };
      return { titolo: `${ord}: accetto`, prima: 'Da accettare', dopo: `Confermato per ${giornoLungo(o.entro)}`, nota: cosa, fai: () => { o.righe = prezziGiusti(o.righe); segna(o, 'accettato'); } };
    case 'rifiuta':
      if (!['nuovo', 'proposta'].includes(o.stato)) return { no: `${ord} è ${stato}: non si può rifiutare da qui.` };
      return { titolo: `${ord}: rifiuto`, prima: STATO_AI[o.stato], dopo: 'Rifiutato', nota: cosa, fai: () => { segna(o, 'rifiutato'); rimettiPronti(o); } };
    case 'proponi':
      if (!['nuovo', 'accettato'].includes(o.stato)) return { no: `${ord} è ${stato}: non si può proporre un altro giorno.` };
      if (!giornoOk(a.giorno) || a.giorno === o.entro) return { no: 'Quel giorno non va bene: scegline uno da oggi in avanti, diverso da quello chiesto.', campi: [['giorno', 'date', 'Giorno']] };
      return { titolo: `${ord}: altro giorno`, prima: giornoLungo(o.entro), dopo: `${giornoLungo(a.giorno)} · ${chi} riceve la proposta`, campi: [['giorno', 'date', 'Giorno']],
        fai: () => { if (daAccettare(o)) o.righe = prezziGiusti(o.righe); o.proposta = a.giorno; o.stato = 'proposta'; }, dopoFatto: () => avvisaCliente(o, 'proposta') };
    case 'disponibile': {
      const si = a.si !== false && a.si !== 'false';
      if (!!p.disponibile === si) return { no: si ? `${p.nome} è già nel menù.` : `${p.nome} è già fuori dal menù.` };
      return { titolo: `${p.nome}: ${si ? 'di nuovo nel menù' : 'fuori dal menù'}`, prima: si ? 'Fuori menù' : 'Nel menù', dopo: si ? 'Nel menù' : 'Fuori menù (gli ordini fatti restano)', fai: () => { p.disponibile = si; } };
    }
    case 'prezzo': {
      const f = p.formati.find(y => y.id === a.formato) || (p.formati.length === 1 ? p.formati[0] : null), x = numeroAI(a.prezzo);
      if (!f) return { no: `${p.nome} ha più formati (${p.formati.map(y => y.nome).join(', ')}): quale cambio?` };
      if (!(x > 0 && x <= 500)) return { no: 'Il prezzo non mi torna: scrivi la cifra giusta.', campi: [['prezzo', 'number', 'Euro']] };
      if (x === f.prezzo) return { no: `${p.nome} (${f.nome}) costa già ${euro(x)}.` };
      return { titolo: `${p.nome} · ${f.nome}: prezzo`, prima: euro(f.prezzo), dopo: euro(x), campi: [['prezzo', 'number', 'Euro']],
        nota: x > f.prezzo * 3 || x < f.prezzo / 3 ? 'Attenta: è molto diverso da prima.' : 'Vale per gli ordini nuovi.', fai: () => { f.prezzo = x; } };
    }
    case 'pronti': {
      const f = p.formati.find(y => p.pronto && y.id === p.pronto.formato) || p.formati[0], q = numeroAI(a.qta), ora = p.pronto && p.pronto.giorno === oggi() ? p.pronto.qta : 0;
      if (!(q >= 0 && q <= 200)) return { no: 'Quanti ne hai pronti? Scrivi il numero.', campi: [['qta', 'number', 'Quanti']] };
      if (q === ora) return { no: `${p.nome}: ne hai già segnati ${q} pronti.` };
      return { titolo: `${p.nome}: pronti oggi`, prima: ora ? qtaTesto(f.tipo, ora, f.nome) : 'Nessuno', dopo: q ? qtaTesto(f.tipo, q, f.nome) + ' · i clienti li vedono in cima' : 'Nessuno', campi: [['qta', 'number', 'Quanti']],
        fai: () => { p.pronto = { formato: f.id, qta: q, giorno: oggi() }; } };
    }
    case 'descrizione': {
      const t = String(a.testo || '').replace(/[<>]/g, '').trim().slice(0, 140);
      if (!t) return { no: 'Che descrizione scrivo?', campi: [['testo', 'text', 'Descrizione']] };
      return { titolo: `${p.nome}: descrizione`, prima: p.sotto || '(vuota)', dopo: t, campi: [['testo', 'text', 'Descrizione']], fai: () => { p.sotto = t; } };
    }
    case 'nuovo_piatto': {
      const nome = String(a.nome || '').replace(/[<>]/g, '').trim().slice(0, 50), cat = CATEGORIE.some(c => c[0] === a.cat) ? a.cat : 'primi';
      const pr = a.prezzi || {}, modo = ['teglie', 'kg', 'pz', 'intera'].includes(a.modo) ? a.modo : 'intera';
      const chiavi = modo === 'teglie' ? ['t6', 't8'] : [modo === 'intera' ? 'intera' : modo], val = Object.fromEntries(chiavi.map(k => [k, numeroAI(pr[k])]));
      if (!nome) return { no: 'Come si chiama il piatto nuovo?' };
      if (visibili().some(x => norm(x.nome) === norm(nome))) return { no: `${nome} c'è già tra i tuoi piatti.` };
      const campi = [['nome', 'text', 'Nome'], ...chiavi.map(k => ['prezzi.' + k, 'number', { t6: 'Teglia da 6', t8: 'Teglia da 8', kg: 'Al chilo', pz: 'Al pezzo', intera: 'Intera' }[k]])];
      if (chiavi.some(k => !(val[k] > 0 && val[k] <= 500))) return { no: 'Mi manca il prezzo: scrivilo qui.', campi };
      const formati = modo === 'teglie' ? T(val.t6, val.t8) : modo === 'kg' ? KG(val.kg) : modo === 'pz' ? PZ(val.pz) : [{ id: 'intera', tipo: 'intera', nome: 'Intera', prezzo: val.intera }];
      return { titolo: `Piatto nuovo: ${nome}`, prima: '', dopo: `${CATEGORIE.find(c => c[0] === cat)[1]} · ${formati.map(f => `${f.nome} ${euro(f.prezzo)}`).join(' · ')}`, campi,
        nota: 'Entra nel menù con «Da controllare»: poi aggiungi ingredienti, allergeni e foto.',
        fai: () => S.piatti.push({ id: norm(nome).replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36).slice(-3), cat, nome, sotto: String(a.descrizione || '').replace(/[<>]/g, '').slice(0, 140), aiuto: '',
          formati, varianti: [], ing: [], note: [], scalda: '', foto: null, disponibile: true, stagione: '', novita: true, novitaDal: oggi(), controllato: false, cuori: 0, pronto: null, ordine: S.piatti.length, cestino: null }) };
    }
    case 'pausa':
      if (!giornoOk(a.fino)) return { no: 'Fino a che giorno vai in pausa?', campi: [['fino', 'date', 'Fino a (compreso)']] };
      return { titolo: 'Pausa degli ordini', prima: S.impostazioni.pausa.attiva ? 'In pausa fino al ' + giornoLungo(S.impostazioni.pausa.fino) : 'Aperta', dopo: `In pausa fino a ${giornoLungo(a.fino)} compreso · i clienti ordinano solo per dopo`,
        campi: [['fino', 'date', 'Fino a (compreso)']], fai: () => { S.impostazioni.pausa.attiva = true; S.impostazioni.pausa.fino = a.fino; } };
    case 'riapri':
      if (!S.impostazioni.pausa.attiva) return { no: 'Sei già aperta.' };
      return { titolo: 'Fine della pausa', prima: 'In pausa', dopo: 'Aperta', fai: () => { S.impostazioni.pausa.attiva = false; } };
    case 'impostazione': {
      const IMP = {   // chiave → [etichetta, tipo, leggi(), scrivi(v), valido(v), testo(v)]
        anticipo: ['Giorni di preavviso', 'number', i => i.anticipo, (i, v) => { i.anticipo = v; }, v => Number.isInteger(v) && v >= 0 && v <= 14, v => v === 0 ? 'Anche in giornata' : `${v} ${v === 1 ? 'giorno' : 'giorni'} prima`],
        limite: ['Teglie al giorno', 'number', i => i.limite.attivo ? i.limite.teglie : 0, (i, v) => { i.limite.attivo = v > 0; if (v > 0) i.limite.teglie = v; }, v => Number.isInteger(v) && v >= 0 && v <= 99, v => v ? `Al massimo ${v}` : 'Senza limite'],
        prontiFino: ['Pronti fino alle', 'time', i => i.prontiFino, (i, v) => { i.prontiFino = v; }, v => /^([01]\d|2[0-3]):[0-5]\d$/.test(v), v => v],
        natale: ['Menù di Natale', 'bool', i => !!i.natale.attivo, (i, v) => { i.natale.attivo = v; }, v => typeof v === 'boolean', v => v ? 'Acceso' : 'Spento'],
        natale_entro: ['Natale: ordini entro', 'date', i => i.natale.entro, (i, v) => { i.natale.entro = v; }, v => giornoOk(v), v => giornoLungo(v)],
        contanti: ['Pagamento in contanti', 'bool', i => !!i.paga.contanti, (i, v) => { i.paga.contanti = v; }, v => typeof v === 'boolean', v => v ? 'Sì' : 'No'],
        bonifico: ['Pagamento con bonifico', 'bool', i => !!i.paga.bonifico, (i, v) => { i.paga.bonifico = v; }, v => typeof v === 'boolean', v => v ? 'Sì' : 'No'],
        postepay: ['Pagamento con Postepay', 'bool', i => !!i.paga.postepay, (i, v) => { i.paga.postepay = v; }, v => typeof v === 'boolean', v => v ? 'Sì' : 'No'],
        nota_ritiro: ['Nota per il ritiro', 'text', i => i.ritiro.nota || '', (i, v) => { i.ritiro.nota = v; }, v => typeof v === 'string' && v.length <= 140, v => v || '(vuota)']
      };
      const d = IMP[a.chiave], i = S.impostazioni;
      if (!d) return { no: 'Questa impostazione si cambia da Impostazioni: ti ci porto?' };
      let v = a.valore;
      if (d[1] === 'number') v = Math.round(Number(String(v).replace(',', '.')));
      if (d[1] === 'bool') v = v === true || v === 'true' || v === 'sì' || v === 'si';
      if (d[1] === 'text') v = String(v || '').replace(/[<>]/g, '').trim().slice(0, 140);
      const campi = d[1] === 'bool' ? [] : [['valore', d[1], d[0]]];
      if (!d[4](v)) return { no: `${d[0]}: il valore non mi torna, correggilo qui.`, campi };
      if (a.chiave === 'contanti' && !v && !i.paga.bonifico && !i.paga.postepay) return { no: 'Serve almeno un modo di pagare: prima accendi bonifico o Postepay.' };
      if (a.chiave === 'nota_ritiro' && !i.ritiro) return { no: 'Il ritiro si imposta da Impostazioni.' };
      if (d[2](i) === v) return { no: `${d[0]}: è già così (${d[5](v)}).` };
      return { titolo: `Impostazioni · ${d[0]}`, prima: d[5](d[2](i)), dopo: d[5](v), campi, fai: () => d[3](i, v) };
    }
    case 'messaggio': {
      const t = String(a.testo || '').trim().slice(0, 700);
      if (!t) return { no: 'Che messaggio preparo?' };
      return { link: wa('', t), etichetta: 'Scegli a chi mandarlo', titolo: 'Messaggio per le amiche', dopo: t };
    }
    case 'spesa': {
      const voci = (Array.isArray(a.voci) ? a.voci : String(a.voci || '').split(',')).map(v => String(v || '').replace(/[<>]/g, '').trim().slice(0, 60)).filter(Boolean).slice(0, 15);
      if (!voci.length) return { no: 'Cosa aggiungo alla lista della spesa?' };
      return { titolo: 'Lista della spesa', prima: '', dopo: '+ ' + voci.join(', '), spesa: true, fai: () => voci.forEach(v => aggiungiVoce(v)) };
    }
    case 'whatsapp': {
      const t = String(a.testo || '').trim().slice(0, 600), tel = cliente(o.cliente).telefono;
      if (!t) return { no: 'Cosa scrivo al cliente?' };
      return { link: wa(tel || '', t), etichetta: `Scrivi a ${nomeBreve(chi)} su WhatsApp`, titolo: `Messaggio per ${chi}`, dopo: t };
    }
    case 'apri':
      if (!VISTE_AI[a.vista]) return { no: 'Non so quale pagina aprire.' };
      return { vai: a.vista, etichetta: `Vai a ${VISTE_AI[a.vista]}`, titolo: VISTE_AI[a.vista] };
    case 'idea': {
      const t = String(a.testo || '').trim().slice(0, 500);
      if (!t) return { no: 'Qual è l\'idea?' };
      return { link: wa(S.impostazioni.mario, `Ciao Mario, un'idea per Pronti in Tavola: ${t}`), etichetta: 'Mandala a Mario', titolo: 'Idea per Mario (la programma lui)', dopo: t };
    }
    default: return { no: '' };
  }
}
/* la risposta del server → { testo, azioni } (accetta anche il vecchio formato con UNA azione) */
function pianoDa(r) {
  r = r || {};
  let azioni = Array.isArray(r.azioni) ? r.azioni : r.azione && !['rispondi', 'capito_male'].includes(r.azione) ? [r] : [];
  azioni = azioni.filter(a => a && typeof a === 'object' && typeof a.azione === 'string').slice(0, 8).map(a => JSON.parse(JSON.stringify(a)));
  let testo = String(r.testo || '').trim().slice(0, 700);
  if (!testo && azioni.length) testo = azioni.length === 1 ? 'Ecco cosa farei:' : `Ecco le ${azioni.length} cose che farei:`;
  if (!testo) testo = 'Non ho capito bene: me lo ridici con altre parole?';
  return { testo, azioni: azioni.map(a => ({ a, on: true })) };
}

/* ---------- domanda al server (separata: le prove la sostituiscono con una risposta finta) ---------- */
async function chiediAiutante(testo, dati, storia, foto) {
  if (!sulSito()) throw new Error('Qui nell\'anteprima l\'aiutante non risponde: provalo nell\'app vera, sul telefono.');
  if (!navigator.onLine) throw new Error('Sei senza internet: riprova quando torna la rete.');
  const tok = await Dati.token(); if (!tok) throw new Error('Entra prima con Google.');
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 45000);
  try {
    const res = await fetch('/api/aiutante', { method: 'POST', signal: ctl.signal, headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ testo, dati, storia, foto }) });
    const j = await res.json().catch(() => ({}));
    if (res.status === 503) throw new Error('L\'aiutante non è ancora acceso: avvisa Mario.');
    if (res.status === 403) throw new Error('Solo chi gestisce può usare l\'aiutante.');
    if (res.status === 413) throw new Error('La foto è troppo grande: prova con un\'altra.');
    if (!res.ok) throw new Error(`Qualcosa non va (${j.errore || res.status}): riprova tra poco.`);
    if (j.grezzo || j.errore) console.warn('aiutante:', j.grezzo || j.errore);
    return j;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Ci sto mettendo troppo: riprova tra poco.');
    if (e instanceof TypeError) throw new Error('Non riesco a collegarmi: riprova tra poco.');
    throw e;
  } finally { clearTimeout(t); }
}

async function inviaAI(testo, voce) {
  testo = String(testo || '').trim().slice(0, 400);
  const foto = AI.foto;
  if ((!testo && !foto) || AI.attesa) return;
  const storia = AI.msgs.slice(-6).map(m => ({ chi: m.chi, t: m.t }));
  AI.msgs.forEach(m => { if (m.piano && !m.esito) m.esito = 'no'; });   // si decide solo sull'ultimo piano: quelli vecchi non tornano attivi da soli
  AI.bozza = ''; AI.foto = null; AI.msgs.push({ chi: 'io', t: testo || 'Guarda la foto', foto }); AI.attesa = true;
  render(); fondoAI();
  let r;
  try { r = await chiediAiutante(testo, datiAI(), storia, foto); } catch (e) { r = { testo: e.message, azioni: [] }; }
  const pi = pianoDa(r);
  AI.attesa = false;
  AI.msgs.push({ chi: 'lei', t: pi.testo, piano: pi.azioni.length ? pi.azioni : null });
  AI.msgs = AI.msgs.slice(-30);
  if (UI.vista === 'aiutante') { render(); fondoAI(); }
  if (voce) parlaAI(pi.testo + (pi.azioni.some(x => !controllaAI(x.a).no) ? ' Controlla e tocca Conferma.' : ''));
}
/* fa insieme le azioni scelte: un solo salvataggio e un solo Annulla */
function faiPiano(m) {
  const scelte = m.piano.filter(x => x.on).map(x => ({ x, c: controllaAI(x.a) })).filter(({ c }) => c.fai);
  if (!scelte.length) {   // nel frattempo è cambiato tutto (anche dall'altra persona): il piano si chiude col perché
    const no = m.piano.map(x => controllaAI(x.a).no).find(Boolean);
    m.esito = no || 'Niente da fare: controlla le righe.'; render(); return;
  }
  const primaS = JSON.stringify(S), primaSp = JSON.stringify(SPESA), spesa = scelte.some(({ c }) => c.spesa);
  scelte.forEach(({ x, c }) => { c.fai(); x.fatto = true; });
  m.esito = 'fatto';
  salva(); if (spesa) salvaSpesa(); render();
  scelte.forEach(({ c }) => { if (c.dopoFatto) c.dopoFatto(); });
  mostraToast(scelte.length === 1 ? 'Fatto' : `Fatte ${scelte.length} cose`, () => { S = JSON.parse(primaS); SPESA = JSON.parse(primaSp); m.esito = 'annullato'; salva(); if (spesa) salvaSpesa(); render(); });
}
function fondoAI() { if (UI.vista === 'aiutante') window.scrollTo(0, document.body.scrollHeight); }
/* voce femminile e naturale (Mario 08/11 «bella voce non robotica, sempre femminile»): tra le voci italiane del telefono
   prima quelle «naturali» o di rete (più umane), poi i nomi femminili noti; mai una voce maschile se ce n'è una femminile */
const FEMMINILI = /elsa|alice|federica|paola|isabella|bianca|carla|chiara|giulia|francesca|elena|sofia|google italiano|female|donna|femmin/i;
const MASCHILI = /luca|cosimo|diego|giorgio|roberto|marco|male|uomo|maschi/i;
function voceAI() {
  const vv = (speechSynthesis.getVoices() || []).filter(v => /^it/i.test(v.lang));
  const punti = v => (FEMMINILI.test(v.name) ? 4 : 0) - (MASCHILI.test(v.name) && !/female/i.test(v.name) ? 6 : 0) + (/natural|neural|enhanced|premium|online/i.test(v.name) ? 3 : 0) + (v.localService === false ? 2 : 0);
  return vv.sort((a, b) => punti(b) - punti(a))[0] || null;
}
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { AI.voce = voceAI(); };
function parlaAI(t) {
  if (!window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(t).replace(/[«»]/g, '')), v = AI.voce || voceAI();
    u.lang = 'it-IT'; if (v) u.voice = v; u.rate = 1.0; u.pitch = 1.1;
    speechSynthesis.speak(u);
  } catch (e) { /* senza voce: resta scritto */ }
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
/* foto: rimpicciolita sul telefono (lato lungo 1024 px, JPEG) prima di partire */
function fotoAI(file) {
  if (!file || !/^image\//.test(file.type)) return;
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const k = Math.min(1, 1024 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    AI.foto = c.toDataURL('image/jpeg', .8); render(); const el = $('#ai-testo'); if (el) el.focus();
  };
  img.onerror = () => { URL.revokeObjectURL(url); mostraToast('Questa foto non si apre: prova con un\'altra.'); };
  img.src = url;
}

/* ---------- disegno ---------- */
function barraAI() {   // nella Home, sotto il saluto: come la ricerca dei siti fatti bene
  return `<div class="ai-barra"><button type="button" class="ai-apri" data-a="vai" data-v="aiutante">${ico('scintille')}<span>Chiedi all'aiutante…</span></button>
    ${Riconosci ? `<button type="button" class="ai-mic" data-a="ai-detta" aria-label="Detta all'aiutante">${ico('microfono')}</button>` : ''}</div>`;
}
function rigaPiano(x, i, j, fermo) {
  const c = controllaAI(x.a), id = `${i}|${j}`;
  if (c.no !== undefined && !c.campi) return c.no ? `<div class="ai-azione no">${ico('x')}<span>${esc(c.no)}</span></div>` : '';
  if (c.link || c.vai) return `<div class="ai-azione"><div class="ai-cosa"><b>${esc(c.titolo)}</b>${c.dopo ? `<span class="ai-dopo">${esc(c.dopo)}</span>` : ''}</div>
    ${c.link ? `<a class="btn chiaro piccolo" href="${c.link}" target="_blank" rel="noopener">${ico('chat')}${esc(c.etichetta)}</a>` : `<button type="button" class="btn chiaro piccolo" data-a="ai-vai" data-v="${c.vai}">${esc(c.etichetta)}</button>`}</div>`;
  const campi = (c.campi || []).map(([k, tipo, et]) => { const v = k.split('.').reduce((o, p) => o && o[p], x.a); return `<label class="ai-campo"><small>${esc(et)}</small>
    <input type="${tipo}" ${tipo === 'number' ? 'inputmode="decimal" step="0.5" min="0"' : ''} data-aif="${id}|${k}" value="${esc(v == null ? '' : String(v))}" ${fermo ? 'disabled' : ''}></label>`; }).join('');
  if (c.no !== undefined) return `<div class="ai-azione no"><div class="ai-cosa"><span>${esc(c.no)}</span></div><div class="ai-campi">${campi}</div></div>`;
  return `<div class="ai-azione ${x.on ? '' : 'spenta'}"><label class="ai-spunta"><input type="checkbox" data-aion="${id}" ${x.on ? 'checked' : ''} ${fermo ? 'disabled' : ''} aria-label="Fai: ${esc(c.titolo)}"></label>
    <div class="ai-cosa"><b>${esc(c.titolo)}</b>${c.prima ? `<span class="ai-prima">${esc(c.prima)}</span>` : ''}<span class="ai-dopo">→ ${esc(c.dopo)}</span>${c.nota ? `<small class="tenue">${esc(c.nota)}</small>` : ''}
    ${campi && !fermo ? `<div class="ai-campi">${campi}</div>` : ''}</div></div>`;
}
function fumettoAI(m, i) {
  if (m.chi === 'io') return `<div class="ai-fum io">${m.foto ? `<img src="${m.foto}" alt="La tua foto">` : ''}${esc(m.t)}</div>`;
  let h = `<div class="ai-fum lei">${esc(m.t)}`;
  if (m.piano) {
    const fermo = !!m.esito, quante = m.piano.filter(x => x.on && controllaAI(x.a).fai).length;
    h += `<div class="ai-piano">${m.piano.map((x, j) => rigaPiano(x, i, j, fermo)).join('')}</div>`;
    if (m.esito) h += `<small class="ai-esito">${m.esito === 'fatto' ? '✓ Fatto' : m.esito === 'no' ? 'Lasciato stare' : m.esito === 'annullato' ? 'Annullato' : esc(m.esito)}</small>`;
    else if (quante) h += `<div class="fila ai-faccio"><b>Controlla e conferma</b><button type="button" class="btn piccolo" data-a="ai-si" data-i="${i}">${ico('spunta')}${quante === 1 ? 'Conferma' : `Conferma tutte e ${quante}`}</button><button type="button" class="btn chiaro piccolo" data-a="ai-no" data-i="${i}">Lascia stare</button></div>`;
  }
  return h + '</div>';
}
function vAiutante() {
  let h = testataMonica('Aiutante', 'home') + '<main class="corpo aiutante">';
  if (!AI.msgs.length) h += `<section class="scheda ai-intro">${ico('scintille')}<div><b>Ciao! Sono il tuo aiutante.</b>
    <p style="margin:4px 0 0">Scrivimi, dimmi a voce o mandami una foto. Anche più cose insieme: ti mostro prima cosa cambia, tu correggi e decidi.</p>
    <p class="tenue piccolo" style="margin:6px 0 0">Per esempio: ${ESEMPI_AI.join(' · ')}</p></div></section>`;
  h += `<div class="ai-chat" aria-live="polite">${AI.msgs.map(fumettoAI).join('')}${AI.attesa ? '<div class="ai-fum lei ai-pensa" aria-label="Sto pensando"><span></span><span></span><span></span></div>' : ''}</div>`;
  if (!AI.attesa) h += `<div class="scelte ai-domande">${DOMANDE_AI.map(d => `<button type="button" class="chip" data-a="ai-chiedi" data-t="${esc(d)}">${esc(d)}</button>`).join('')}</div>`;
  if (AI.foto) h += `<div class="ai-foto-pronta"><img src="${AI.foto}" alt="Foto da mandare"><span>Foto pronta: scrivi cosa vuoi (o tocca Invia)</span><button type="button" class="icona" data-a="ai-foto-via" aria-label="Togli la foto">${ico('x')}</button></div>`;
  h += `<div class="ai-scrivi"><label class="ai-mic chiaro" aria-label="Manda una foto">${ico('foto')}<input type="file" accept="image/*" id="ai-file" hidden></label>
    <input id="ai-testo" type="text" enterkeyhint="send" autocomplete="off" maxlength="400" placeholder="${AI.rec ? 'Ti ascolto…' : 'Scrivi qui…'}" value="${esc(AI.bozza)}" aria-label="Cosa vuoi fare?">
    ${Riconosci ? `<button type="button" class="ai-mic ${AI.rec ? 'acceso' : ''}" data-a="ai-detta" aria-label="${AI.rec ? 'Smetti di ascoltare' : 'Detta'}">${ico('microfono')}</button>` : ''}
    <button type="button" class="btn" data-a="ai-invia" ${AI.attesa ? 'disabled' : ''}>Invia</button></div>
    <p class="tenue piccolo" style="margin:0">L'aiutante usa un'intelligenza artificiale gratuita: può sbagliare, per questo ti mostra sempre prima cosa cambia.</p>`;
  return h + '</main>';
}

/* ---------- azioni ---------- */
const pianoDi = el => AI.msgs[Number(el.dataset.i)];
Object.assign(A, {
  'ai-invia'() { const el = $('#ai-testo'); inviaAI(el ? el.value : AI.bozza); },
  'ai-chiedi'(el) { inviaAI(el.dataset.t); },
  'ai-detta'() { if (UI.vista !== 'aiutante') vai('aiutante'); ascoltaAI(); },
  'ai-foto-via'() { AI.foto = null; render(); },
  'ai-vai'(el) { vai(el.dataset.v); },
  'ai-si'(el) { const m = pianoDi(el); if (m && m.piano && !m.esito) faiPiano(m); },   // si ricontrolla tutto: nel frattempo può aver cambiato qualcosa anche l'altra persona
  'ai-no'(el) { const m = pianoDi(el); if (m && !m.esito) { m.esito = 'no'; render(); } }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'ai-testo') AI.bozza = el.value;
  if (el.dataset && el.dataset.aif) {   // valore corretto da Monica: cambia l'azione e ridisegna dopo una pausa
    const [i, j, k] = el.dataset.aif.split('|'), m = AI.msgs[Number(i)], x = m && m.piano && m.piano[Number(j)];
    if (!x || m.esito) return;
    const parti = k.split('.'), ultimo = parti.pop(), dove = parti.reduce((o, p) => (o[p] = o[p] && typeof o[p] === 'object' ? o[p] : {}), x.a);
    dove[ultimo] = el.value;
    clearTimeout(AI.tRid); AI.tRid = setTimeout(() => { const f = document.activeElement && document.activeElement.dataset.aif; render(); if (f) { const n = document.querySelector(`[data-aif="${f}"]`); if (n) { n.focus(); try { n.setSelectionRange(n.value.length, n.value.length); } catch (er) { /* date */ } } } }, 600);
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'ai-file') { fotoAI(el.files && el.files[0]); el.value = ''; }
  if (el.dataset && el.dataset.aion) { const [i, j] = el.dataset.aion.split('|'), m = AI.msgs[Number(i)]; if (m && m.piano && !m.esito) { m.piano[Number(j)].on = el.checked; render(); } }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ai-testo') { e.preventDefault(); inviaAI(e.target.value); } });
