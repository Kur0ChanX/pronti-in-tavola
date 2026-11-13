/* Pronti in Tavola · aiutante di Monica (C48; Mario 08/11 «iniziami l'assistente per Monica non clienti», poi «potenzialo al massimo»).
   Monica scrive, detta o manda una FOTO → il server (/api/aiutante, Workers AI gratuito) propone un PIANO di 0-8 azioni →
   l'app controlla ogni azione sui dati veri e la mostra «prima → dopo», Monica può toglierne o correggerne i valori →
   «Fai» le fa tutte insieme (un solo Annulla per 10 secondi). L'AI non tocca mai i dati: le azioni sono quelle dei pulsanti dell'app.
   In fondo l'aiutante dei CLIENTI (C50): spento di base, lo accende Mario («Solo per te, Mario»); solo menù e i SUOI ordini. */
const AI = { msgs: [], attesa: false, rec: null, bozza: '', foto: null };
const DOMANDE_AI = ['Cosa devo cucinare oggi?', 'Come si mette la pausa?', 'Chi viene a ritirare oggi?', 'Chi deve ancora pagare?', 'Quanto ho incassato questo mese?', 'Com\'è andata la settimana?'];
const ESEMPI_AI = ['«Come cambio la foto della parmigiana?»', '«L\'ordine di Laura è pronto e ha pagato»', '«Togli il tiramisù e alza le lasagne a 14 euro»', '«Sono in ferie fino a domenica»', 'una foto della lista della spesa scritta a mano'];
const Riconosci = window.SpeechRecognition || window.webkitSpeechRecognition;
const STATO_AI = { nuovo: 'da accettare', proposta: 'aspetta che il cliente risponda sul giorno', daApprovare: 'cliente nuovo da approvare', accettato: 'da preparare',
  pronto: 'pronto, da ritirare', ritirato: 'ritirato', rifiutato: 'rifiutato', annullato: 'annullato', prova: 'di prova' };
const VISTE_AI = { ordini: 'Ordini', piatti: 'I miei piatti', clienti: 'Clienti', impostazioni: 'Impostazioni', spesa: 'Lista della spesa' };
PATH.microfono = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>';
PATH.scintille = '<path d="M11 3l1.8 4.7 4.7 1.8-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z"/><path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>';
NOMI_VISTE.aiutante = 'Aiutante'; NOMI_VISTE.aiuto = 'Aiutante';

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
    ordini, incassiMese: { giaPresi: c.presi, daPrendere: c.daPrendere, ordini: c.oo.length },
    impostazioniExtra: OPZIONI.filter(o => o.g !== 'mario').map(o => ({ chiave: o.k, nome: o.nome, tipo: o.tipo, valore: o.tipo === 'messaggio' ? String(opz(o.k)).slice(0, 160) : o.tipo === 'parti' ? opz(o.k).map(c => c[1]).join(', ') : opz(o.k), cosa: o.aiuto + (o.perAI ? ' · ' + o.perAI : '') })) };
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
      const nome = String(a.nome || '').replace(/[<>]/g, '').trim().slice(0, 50), cat = CATEGORIE.some(c => c[0] === a.cat) ? a.cat : (CATEGORIE.find(c => c[0] === 'primi') || CATEGORIE[0])[0];
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
      const d = IMP[a.chiave], i = S.impostazioni, o = OPZ[a.chiave] && OPZ[a.chiave].g !== 'mario' ? OPZ[a.chiave] : null;   // (C109) le regole di Mario non si cambiano dall'aiutante
      if (!d && o) {   // impostazioni in più (opzioni.js, C88)
        const v = valoreOpz(o, a.valore), campi = ['numero', 'euro', 'testo', 'ora'].includes(o.tipo) ? [['valore', o.tipo === 'numero' || o.tipo === 'euro' ? 'number' : o.tipo === 'ora' ? 'time' : 'text', o.nome]] : [];
        if (v === undefined) return { no: `${o.nome}: il valore non mi torna, correggilo qui.`, campi };
        if (o.tipo === 'parti') {   // C92: una parte con dei piatti non si toglie (nemmeno rinominandola a voce: il nome si cambia toccandolo)
          const piene = partiPiene(v);
          if (piene.length) return { no: `«${piene[0][1]}» ha dei piatti: non la tolgo. Per cambiarle il nome toccalo in Impostazioni → Parti del menù.` };
          const nuove = v.filter(c => !opz('parti').some(x => x[0] === c[0])).map(c => c[1]);
          return { titolo: 'Impostazioni · Parti del menù', prima: testoOpz(o, opz(o.k)), dopo: (nuove.length ? `Nuova: ${nuove.join(', ')} · ` : '') + testoOpz(o, v), campi: [], fai: () => { S.impostazioni.parti = v; } };
        }
        if (JSON.stringify(v) === JSON.stringify(opz(o.k))) return { no: `${o.nome}: è già così (${testoOpz(o, v)}).` };
        return { titolo: `Impostazioni · ${o.nome}`, prima: testoOpz(o, opz(o.k)), dopo: o.tipo === 'messaggio' ? String(v).slice(0, 120) : testoOpz(o, v), campi, fai: () => { S.impostazioni[o.k] = v; } };
      }
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
    case 'vai': {
      const v = DOVE_AI[a.voce];
      if (!v) return { no: 'Non so dove portarti: dimmelo con altre parole.' };
      if (VOCI_PIATTO.includes(a.voce)) {
        const pp = a.id ? piatto(a.id) : null;
        if (!pp || pp.cestino) return { no: 'Non trovo quel piatto: dimmi il nome che c\'è nel menù.' };
        return { vai: 'piatto:' + pp.id, sez: v.sez, etichetta: 'Portami lì', titolo: `${pp.nome} → ${v.nome}`, dopo: v.come };
      }
      if (a.voce === 'imp-gestori' || a.voce === 'imp-lucchetto') { if (!Dati.attivo) return { no: 'Questa voce c\'è solo nell\'app vera, con i dati veri.' }; }
      if (a.voce === 'clienti-rifiutati' && !(S.rifiutati || []).length) return { no: 'Non hai detto di no a nessuno: la lista delle persone rifiutate è vuota.' };
      if (a.voce === 'imp-palestra' && !(typeof puoSviluppare === 'function' && puoSviluppare())) return { no: 'Il profilo palestra c\'è solo sul telefono di Mario.' };
      if (a.voce === 'imp-voce' && typeof sonoMarioVero === 'function' && sonoMarioVero()) return { vai: 'impostazioni', sez: null, etichetta: 'Portami lì', titolo: 'Voce', dopo: 'La tua velocità della voce è in alto, nella scheda «Solo per te, Mario».' };
      const pv = a.perVoce && DOVE_AI[a.perVoce];
      return { vai: v.vista, sez: v.sez || null, ui: v.ui || null, etichetta: 'Portami lì', titolo: v.nome, dopo: pv ? `Tocca il piatto, poi «${pv.nome}». ${pv.come}` : v.come };
    }
    case 'apri':
      if (!VISTE_AI[a.vista]) return { no: 'Non so quale pagina aprire.' };
      return { vai: a.vista, etichetta: `Vai a ${VISTE_AI[a.vista]}`, titolo: VISTE_AI[a.vista] };
    case 'idea': {
      const t = String(a.testo || '').trim().slice(0, 500);
      if (!t) return { no: 'Qual è l\'idea?' };
      const ult = AI.ultimaVista && NOMI_VISTE[AI.ultimaVista.split(':')[0]], dove = ult && ult !== 'Home' ? ` (ero in «${ult}»)` : '';
      return { link: wa(S.impostazioni.mario, `Ciao Mario, sono Monica. Vorrei cambiare o aggiungere una cosa in Pronti in Tavola${dove}:\n${t}\n\nVersione dell'app: ${VERSIONE_APP}`), etichetta: 'Manda a Mario su WhatsApp', titolo: 'Questa non si cambia ancora dall\'app: la chiedo a Mario', dopo: t };
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
  /* (C102, Mario 09/11 «deve capire il contesto di quello che dico, non che legge la parola e mi porta alla parola scritta»):
     prima l'AI legge la frase intera; i posti trovati dalle parole le arrivano solo come indizi.
     Senza AI (niente rete, anteprima, risposte del giorno finite) le parole propongono fino a 3 posti con «Intendi…?»
     e non la portano da sola: decide lei con un tocco. */
  let r, daParole = false;
  const aiutoParole = motivo => {
    const qui = !foto && capisciDove(testo, 3);
    if (qui) { daParole = true; return rispostaDove(qui, true); }
    return /funzion|vorrei che|si potrebbe|sarebbe bello|mi servirebbe|manca |aggiung/.test(semplice(testo)) ? { testo: 'Questa la chiedo a Mario: controlla il messaggio e mandalo.', azioni: [{ azione: 'idea', testo }] } : { testo: motivo, azioni: [] };
  };
  try {
    const dati = datiAI(), ind = foto ? [] : (capisciDove(testo, 3) || []).filter(a => a.azione === 'vai').map(a => ({ voce: a.voce, id: a.id, posto: (DOVE_AI[a.voce] || {}).nome }));
    if (ind.length) dati.indizi = ind;
    r = await chiediAiutante(testo, dati, storia, foto);
    if (r && r.fermo) r = aiutoParole(r.testo || 'Per oggi l\'aiutante ha finito le risposte.');
  } catch (e) { r = aiutoParole(e.message); }
  const pi = pianoDa(r);
  AI.attesa = false;
  AI.msgs.push({ chi: 'lei', t: pi.testo, piano: pi.azioni.length ? pi.azioni : null });
  AI.msgs = AI.msgs.slice(-30);
  if (UI.vista === 'aiutante') { render(); fondoAI(); }
  const soloVai = !daParole && pi.azioni.length === 1 && controllaAI(pi.azioni[0].a);   // dalle sole parole non si parte da soli (C102)
  if (soloVai && soloVai.vai) {   // Mario 08/11 «portala direttamente»: un attimo per leggere, poi ci va da sola
    if (voce) parlaAI(pi.testo);
    setTimeout(() => { if (UI.vista === 'aiutante' && !AI.attesa) portaLi(soloVai); }, 1400);
    return;
  }
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
/* voce scelta da chi usa l'app (Ricettario → Cucina guidata → «Voce»), altrimenti la migliore femminile italiana del telefono */
const vociIt = () => window.speechSynthesis ? (speechSynthesis.getVoices() || []).filter(v => /^it/i.test(v.lang)) : [];
function voceAI() {
  const vv = vociIt();
  let scelta = ''; try { scelta = localStorage.getItem('pit-voce') || ''; } catch (e) { /* niente */ }
  const mia = scelta && !/^edge:/.test(scelta) && vv.find(v => v.name === scelta); if (mia) return mia;
  if (scelta === VOCE_GOOGLE) { const g = voceGoogle(); if (g) return g; }   // «Voce Google del telefono» (Mario 08/11 «proviamo google come seconda voce»)
  const punti = v => (FEMMINILI.test(v.name) ? 4 : 0) - (MASCHILI.test(v.name) && !/female/i.test(v.name) ? 6 : 0) + (/natural|neural|enhanced|premium|online/i.test(v.name) ? 3 : 0) + (v.localService === false ? 2 : 0);
  return vv.sort((a, b) => punti(b) - punti(a))[0] || null;
}
/* VOCE GOOGLE (Mario 08/11 ~15:30 «proviamo google come seconda voce»): seconda scelta dopo Paola; usa la voce italiana di Google del telefono
   (su Android le voci di Google si chiamano anche «it-it-x-…»). Se il telefono non l'ha, legge la migliore italiana che c'è. */
const VOCE_GOOGLE = 'tel:google';
const voceGoogle = () => vociIt().filter(v => /google|it-it-x-/i.test(v.name + ' ' + (v.voiceURI || ''))).sort((a, b) => (FEMMINILI.test(b.name) ? 1 : 0) - (FEMMINILI.test(a.name) ? 1 : 0))[0] || null;
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { AI.voce = voceAI(); };
/* frasi corte una dopo l'altra: su Android le frasi lunghe si troncano e la voce suona più piatta.
   Tono e velocità naturali (il tono alzato la rendeva «robotica»). */
function frasiVoce(t) {
  const pulito = String(t).replace(/[«»"*_#]/g, '').replace(/\s+/g, ' ').replace(/\bq\.b\./gi, 'quanto basta').replace(/\b(\d+) ?g\b/g, '$1 grammi').replace(/\b(\d+) ?ml\b/g, '$1 millilitri').replace(/\b(\d+) ?min\b/g, '$1 minuti').trim();
  const out = [];
  pulito.split(/(?<=[.!?;:])\s+/).forEach(f => { while (f.length > 180) { const k = f.lastIndexOf(',', 180) > 60 ? f.lastIndexOf(',', 180) + 1 : f.lastIndexOf(' ', 180); out.push(f.slice(0, k)); f = f.slice(k).trim(); } if (f) out.push(f); });
  return out;
}
/* VOCE VERA (Mario 08/11 «consiglio 1»): voci neurali di Microsoft lette dal server (/api/voce), solo per chi gestisce.
   Scelta in «Voce che legge» (pit-voce = «edge:isabella», «edge:elsa»…); se il server non risponde si usa la voce del telefono. */
/* SPENTE (Mario 08/11 ~11:40 «voci Microsoft lasciamo perdere»: Microsoft rifiuta il lasciapassare, 403): niente più nella scelta;
   una vecchia scelta «edge:…» salvata sul telefono diventa la voce automatica (sceltaVoce). */
const VOCI_VERE = [];
/* VOCE AUTOMATICA (Mario 08/11 «deve funzionare tutto automaticamente… la migliore… scaricala anche coi dati»): la voce di base è Paola (Piper),
   l'app la scarica da sola sul telefono di chi gestisce (ricettario.js voceAutomatica); Kokoro resta spento finché non legge l'italiano (il suo fonemizzatore sa solo l'inglese, provato 08/11). */
const sceltaVoce = () => { try { const v = localStorage.getItem('pit-voce') || VOCE_AUTO; return /^edge:/.test(v) ? VOCE_AUTO : v; } catch (e) { return VOCE_AUTO; } };
/* VOCI SUL TELEFONO (Mario 08/11 «Kokoro e Piper… integrali»): voce-piper.js e voce-kokoro.js espongono window.VociLocali.<motore>
   = { voci: [[chiave, nome]], mb(chiave), pronta(chiave), scarica(chiave, avanzamento), parla(testo, chiave) → Blob wav, libera() }.
   Scelta «piper:paola», «kokoro:sara»… in pit-voce; si scaricano una volta (50-100 MB) e parlano anche senza rete. */
const VOCE_AUTO = 'piper:paola', MOTORI_VOCE = ['piper'];
const motoreLocale = k => { const m = /^(piper|kokoro):/.exec(k || ''); return m && MOTORI_VOCE.includes(m[1]) && window.VociLocali && window.VociLocali[m[1]] ? window.VociLocali[m[1]] : null; };
const vociLocali = () => { const V = window.VociLocali || {}; return MOTORI_VOCE.filter(m => V[m]).flatMap(m => V[m].voci || []); };
AI.localiPronte = AI.localiPronte || {};   // chiave → true/false, riempito piano piano da statoVoceLocale
function statoVoceLocale(k, poi) {
  const M = motoreLocale(k); if (!M) return false;
  if (k in AI.localiPronte) return AI.localiPronte[k];
  AI.localiPronte[k] = undefined;
  M.pronta(k).then(ok => { AI.localiPronte[k] = !!ok; if (poi) poi(); }).catch(() => { AI.localiPronte[k] = false; if (poi) poi(); });
  return undefined;
}
const voceLocalePronta = () => Object.keys(AI.localiPronte).find(k => AI.localiPronte[k] === true) || '';
/* velVoce(), velMia(), velDiTutti(): in app.js (si carica prima: PT E23) */
async function parlaLocale(t, scelta, fine, giro) {
  const M = motoreLocale(scelta), testo = frasiVoce(t).join(' ');
  if (!testo) { if (fine) fine(); return; }
  try {
    if (!(await M.pronta(scelta))) throw new Error('non scaricata');
    AI.localiPronte[scelta] = true;
    const b = await M.parla(testo, scelta, velVoce());
    if (AI.giroVoce !== giro) return;
    const u = URL.createObjectURL(b), a = AI.audio = new Audio(u);
    a.onended = () => { URL.revokeObjectURL(u); if (AI.giroVoce === giro) { AI.audio = null; if (fine) fine(); } };
    a.onerror = () => { URL.revokeObjectURL(u); if (AI.giroVoce === giro) parlaTelefono(t, fine); };
    await a.play();
  } catch (e) {
    if (AI.giroVoce !== giro) return;
    if (!AI.localeAvvisata && typeof mostraToast === 'function') { AI.localeAvvisata = true; mostraToast(/non scaricata/.test(e.message) ? 'La voce vera si sta ancora scaricando sul telefono: intanto legge la voce del telefono.' : 'La voce sul telefono non riesce a leggere: per ora legge la voce del telefono.'); }
    parlaTelefono(t, fine);
  }
}
/* ripiego quando Microsoft non risponde: prima una voce scaricata sul telefono, poi quella del telefono */
function ripiegoVoce(t, fine, giro) { const k = voceLocalePronta(); if (k) parlaLocale(t, k, fine, giro); else parlaTelefono(t, fine); }
function fermaVoce() {
  AI.giroVoce = (AI.giroVoce || 0) + 1;
  if (AI.audio) { try { AI.audio.pause(); } catch (e) { /* già ferma */ } AI.audio = null; }
  if (window.speechSynthesis) speechSynthesis.cancel();
}
/* voci scaricate sul telefono (Mario 08/11 «scaricale per ogni ricetta offline»): cache «voci-pit», una per voce + testo, per sempre */
const CACHE_VOCI = 'voci-pit';
async function chiaveAudio(f, v) {
  try { const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v + '|' + f)))].map(b => b.toString(16).padStart(2, '0')).join(''); return location.origin + '/voci-salvate/' + h; } catch (e) { return ''; }
}
async function blobVoce(f, v) {
  const ck = window.caches ? await chiaveAudio(f, v) : '';
  const salvata = ck ? await caches.open(CACHE_VOCI).then(c => c.match(ck)).catch(() => null) : null;
  if (salvata) return salvata.blob();
  const tok = typeof Dati !== 'undefined' && Dati.token ? await Dati.token() : '';
  if (!tok) throw new Error('senza accesso');
  const r = await fetch('/api/voce', { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ t: f, v }) });
  if (!r.ok || !/audio/.test(r.headers.get('content-type') || '')) throw new Error('voce ' + r.status);
  const b = await r.blob();
  if (ck) await caches.open(CACHE_VOCI).then(c => c.put(ck, new Response(b, { headers: { 'content-type': 'audio/mpeg' } }))).catch(() => null);
  return b;
}
/* scarica in anticipo la lettura di un testo con la voce scelta (niente se è scelta la voce del telefono) */
async function scaricaVoce(t) {
  const scelta = sceltaVoce(); if (motoreLocale(scelta)) return true;   // la voce è già sul telefono: niente da scaricare
  if (!/^edge:/.test(scelta) || AI.voceNo) return false;
  const testo = frasiVoce(t).join(' '); if (!testo) return true;
  try { await blobVoce(testo, scelta.slice(5)); return true; } catch (e) { return false; }
}
async function audioVero(f, v) {
  AI.cacheVoce = AI.cacheVoce || new Map();
  const k = v + '|' + f; if (AI.cacheVoce.has(k)) return AI.cacheVoce.get(k);
  const u = URL.createObjectURL(await blobVoce(f, v));
  AI.cacheVoce.set(k, u);
  if (AI.cacheVoce.size > 40) { const [k0, u0] = AI.cacheVoce.entries().next().value; URL.revokeObjectURL(u0); AI.cacheVoce.delete(k0); }
  return u;
}
function parlaAI(t, fine) {
  const scelta = sceltaVoce();
  if (motoreLocale(scelta)) { fermaVoce(); parlaLocale(t, scelta, fine, AI.giroVoce); return; }
  if (/^edge:/.test(scelta) && !AI.voceNo && typeof Dati !== 'undefined' && Dati.token) {
    fermaVoce();
    const giro = AI.giroVoce, ff = frasiVoce(t), testo = ff.join(' ');
    if (!testo) { if (fine) fine(); return; }
    audioVero(testo, scelta.slice(5)).then(u => {
      if (AI.giroVoce !== giro) return;
      const a = AI.audio = new Audio(u);
      a.onended = () => { if (AI.giroVoce === giro) { AI.audio = null; if (fine) fine(); } };
      a.onerror = () => { if (AI.giroVoce === giro) parlaTelefono(t, fine); };
      return a.play();
    }).catch(() => { if (AI.giroVoce !== giro) return; if (!AI.voceAvvisata && typeof mostraToast === 'function') { AI.voceAvvisata = true; mostraToast(voceLocalePronta() ? 'La voce di Microsoft non risponde: legge la voce scaricata sul telefono.' : 'La voce di Microsoft non risponde: per ora legge la voce del telefono (sempre la stessa).'); } AI.voceNoFino = Date.now() + 120000; AI.voceNo = true; setTimeout(() => { AI.voceNo = false; }, 120000); ripiegoVoce(t, fine, giro); });
    return;
  }
  parlaTelefono(t, fine);
}
function parlaTelefono(t, fine) {
  if (!window.speechSynthesis) { if (fine) fine(); return; }
  try {
    speechSynthesis.cancel();
    const v = AI.voce = voceAI(), ff = frasiVoce(t), giro = (AI.giroVoce = (AI.giroVoce || 0) + 1);
    if (!ff.length) { if (fine) fine(); return; }
    ff.forEach((f, i) => {
      const u = new SpeechSynthesisUtterance(f);
      u.lang = 'it-IT'; if (v) u.voice = v; u.rate = Math.min(1.3, 0.97 * velVoce() / 0.9); u.pitch = 1.0;
      if (i === ff.length - 1 && fine) { u.onend = () => { if (AI.giroVoce === giro) fine(); }; u.onerror = () => { if (AI.giroVoce === giro) fine(); }; }
      speechSynthesis.speak(u);
    });
  } catch (e) { if (fine) fine(); /* senza voce: resta scritto */ }
}
/* microfono: dettatura in italiano, a fine frase parte da sola */
function ascoltaAI(manda = inviaAI, box = AI) {
  if (typeof dettaConAscoltoPreciso === 'function' && dettaturaServe()) { dettaConAscoltoPreciso(t => manda(t, true)); return; }   // iPad/iPhone dalla Home: il telefono non detta (PT E39)
  if (!Riconosci) { mostraToast('Questo telefono non sa dettare: scrivi la frase.'); return; }
  if (AI.rec) { AI.rec.stop(); return; }
  let detto = '';
  const rec = new Riconosci();
  rec.lang = 'it-IT'; rec.interimResults = true; rec.maxAlternatives = 1;
  rec.onresult = e => { detto = [...e.results].map(x => x[0].transcript).join(''); box.bozza = detto; const el = $('#ai-testo') || $('#ac-testo'); if (el) el.value = detto; };
  rec.onerror = e => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') mostraToast('Per dettare serve il microfono: tocca «Consenti» quando il telefono lo chiede.');
    else if (e.error === 'no-speech') mostraToast('Non ho sentito nulla: riprova.');
    else if (e.error === 'network') mostraToast('Per dettare serve internet.');
  };
  rec.onend = () => { AI.rec = null; if (detto.trim()) manda(detto, true); else render(); };
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
    ${(Riconosci || window.MediaRecorder) ? `<button type="button" class="ai-mic" data-a="ai-detta" aria-label="Detta all'aiutante">${ico('microfono')}</button>` : ''}</div>`;
}
function rigaPiano(x, i, j, fermo) {
  const c = controllaAI(x.a), id = `${i}|${j}`;
  if (c.no !== undefined && !c.campi) return c.no ? `<div class="ai-azione no">${ico('x')}<span>${esc(c.no)}</span></div>` : '';
  if (c.link || c.vai) return `<div class="ai-azione"><div class="ai-cosa"><b>${esc(c.titolo)}</b>${c.dopo ? `<span class="ai-dopo">${esc(c.dopo)}</span>` : ''}</div>
    ${c.link ? `<a class="btn chiaro piccolo" href="${c.link}" target="_blank" rel="noopener">${ico('chat')}${esc(c.etichetta)}</a>` : `<button type="button" class="btn piccolo" data-a="ai-vai" data-i="${i}" data-j="${j}">${ico('cerca')}${esc(c.etichetta)}</button>`}</div>`;
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
    ${(Riconosci || window.MediaRecorder) ? `<button type="button" class="ai-mic ${AI.rec || (typeof ascoltoInCorso === 'function' && ascoltoInCorso()) ? 'acceso' : ''}" data-a="ai-detta" aria-label="${AI.rec ? 'Smetti di ascoltare' : 'Detta'}">${ico('microfono')}</button>` : ''}
    <button type="button" class="btn" data-a="ai-invia" ${AI.attesa ? 'disabled' : ''}>Invia</button></div>
    <p class="tenue piccolo" style="margin:0">L'aiutante usa un'intelligenza artificiale gratuita: può sbagliare, per questo ti mostra sempre prima cosa cambia.</p>`;
  return h + '</main>';
}

/* ---------- «Portami lì» (Mario 08/11, C87): l'aiutante porta Monica nel punto esatto dell'app ----------
   Ogni voce: dove sta (vista e sezione da aprire), il suo nome e cosa fare una volta lì (frasi corte).
   Le parole servono a capire le domande anche SENZA l'AI (senza rete, nell'anteprima, o se l'AI è giù). */
const DOVE_AI = {
  foto: { sez: 'foto', nome: 'Foto', come: 'Tocca «Cambia la foto» (o «Aggiungi una foto»), scegli la foto, sistemala e tocca «Usa questa foto».', parole: /\bfot|immagin|\bscatt/ },
  prezzi: { sez: 'prezzi', nome: 'Prezzi e formati', come: 'Scrivi il prezzo nuovo nella casella: si salva da solo.', parole: /prezz|cost[ao] (al|il|la)|quanto (lo |la )?vend|euro/, azione: true },
  pronto: { sez: 'pronto', nome: 'Pronto subito oggi', come: 'Scrivi quanti ne hai già pronti oggi: i clienti li vedono subito.', parole: /gi[aà] pront|pronti (oggi|subito)|ho pront/, azione: true },
  nome: { sez: 'nome', nome: 'Nome e parte del menù', come: 'Cambia il nome o la riga sotto il nome: si salva da solo.', parole: /\bnome\b|rinomin|riga sotto|descrizion/ },
  gusti: { sez: 'gusti', nome: 'Gusti', come: 'Aggiungi o togli un gusto, con il suo prezzo se cambia.', parole: /\bgust[oi]\b|varian/ },
  ingredienti: { sez: 'ingredienti', nome: 'Ingredienti e allergeni', come: 'Tocca gli ingredienti giusti: gli allergeni si segnano da soli, controllali tu.', parole: /ingredient|allerg|glutin|lattos|\buov[ao]\b/ },
  dosi: { sez: 'dosi', nome: 'Dosi e costo', come: 'Scrivi quanto ti serve di ogni ingrediente: la lista della spesa fa i conti da sola.', parole: /\bdos[ei]\b|quantit|grammi|quanto (mi )?(costa|serve) (fare|farl|preparar)/ },
  richieste: { sez: 'richieste', nome: 'Richieste veloci', come: 'Aggiungi le richieste che i clienti possono toccare (es. «senza cipolla»).', parole: /richiest|senza cipoll|note (dei|del) client/ },
  fritto: { sez: 'fritto', nome: 'Cotto da te', come: 'Accendi «Fritto da te» o «Al forno da te» e scrivi quanto costa in più.', parole: /fritt|friggi|al forno da/ },
  casa: { sez: 'casa', nome: 'Come si prepara a casa', come: 'Scrivi come scaldarlo o cuocerlo a casa: il cliente lo legge.', parole: /a casa|scald|riscald|cuocer/ },
  novita: { sez: 'novita', nome: 'Etichetta «Novità»', come: 'Accendi l\'interruttore: l\'etichetta resta 2 settimane.', parole: /novit/ },
  'imp-pausa': { vista: 'impostazioni', sez: 'imp-pausa', nome: 'Pausa', come: 'Accendi la pausa e scegli fino a quando: i clienti non possono ordinare.', parole: /pausa|ferie|vacanz|chiud|non (prendo|voglio) ordin/, azione: true },
  'imp-pronti': { vista: 'impostazioni', sez: 'imp-pronti', nome: 'Pronti subito', come: 'Scegli fino a che ora valgono i piatti pronti di oggi.', parole: /fino a che ora|ora (del|di) ritiro|orari/ },
  'imp-ritiro': { vista: 'impostazioni', sez: 'imp-ritiro', nome: 'Dove ritirano', come: 'Scrivi l\'indirizzo e come trovarti (citofono, piano).', parole: /indirizz|dove (ritir|vengon)|citofon|via\b/ },
  'imp-numeri': { vista: 'impostazioni', sez: 'imp-numeri', nome: 'Numeri', come: 'Scrivi il tuo numero di WhatsApp con il +39.', parole: /numer[oi] (di )?(telefon|whatsapp|cellular)|mio numero|cambiat[oa] numero/ },
  'imp-paga': { vista: 'impostazioni', sez: 'imp-paga', nome: 'Pagamenti', come: 'Accendi come vuoi essere pagata: contanti, bonifico (con l\'IBAN) o Postepay.', parole: /pagament|bonific|\biban\b|postepay|contanti|pagar/, azione: true },
  'imp-vista': { vista: 'impostazioni', sez: 'imp-vista', nome: 'Testo grande e guida', come: 'Accendi «Testo grande» se leggi male, o tocca «Rivedi la guida».', parole: /testo grande|scritt[ae] (piccol|grand)|non (ci )?vedo|ingrandi|rivedi la guida/ },
  'imp-gestori': { vista: 'impostazioni', sez: 'imp-gestori', nome: 'Chi gestisce la cucina', come: 'Qui vedi chi entra come te e puoi aggiungere una persona.', parole: /chi gestisc|aiutar(mi)? in cucina|mio marito|socia|altra persona (che )?gestisc/ },
  'imp-notifiche': { vista: 'impostazioni', sez: 'imp-notifiche', nome: 'Notifiche', come: 'Tocca «Attiva» e poi «Consenti» quando il telefono lo chiede. Sotto vedi gli ultimi avvisi arrivati, anche le segnalazioni di un cliente che usa molto l\'aiutante (nessuno viene fermato). In fondo la corsia d\'emergenza 🛟: se il server si ferma, gli avvisi partono lo stesso.', parole: /notific|avvis[io] (degli|sul)|suon|emergenz|corsia|server (fermo|bloccat)|ultimi avvisi|segnalazion|esager|(usa|chied\w*) (tanto|molto|troppo)/ },
  // (C100) funzioni vecchie che l'aiutante non conosceva
  'imp-voce': { vista: 'impostazioni', sez: 'imp-voce', nome: 'Voce', come: 'Sposta il cursore: più a sinistra la voce è più lenta. Tocca «Senti la velocità» per provarla.', parole: /\bvoce\b|parla (troppo )?(veloce|lent|pian|fort)|velocita/ },
  'imp-lucchetto': { vista: 'impostazioni', sez: 'imp-lucchetto', nome: 'Lucchetto', come: 'Scegli impronta o PIN per aprire la tua parte dell\'app.', parole: /lucchett|\bpin\b|impront|password|blocc(a|o) (l'app|il telefono)/ },
  'imp-anticipo': { vista: 'impostazioni', sez: 'imp-anticipo', nome: 'Giorni di anticipo', come: 'Con + e − scegli quanti giorni prima devono ordinare.', parole: /anticip|preavvis|giorni prima/, azione: true },
  'imp-limite': { vista: 'impostazioni', sez: 'imp-limite', nome: 'Limite della settimana', come: 'Accendi il limite e scegli quante teglie al massimo.', parole: /limit|troppi ordini|massimo di teglie|teglie al massimo/, azione: true },
  'imp-natale': { vista: 'impostazioni', sez: 'imp-natale', nome: 'Menù di Natale', come: 'Accendilo, scegli la data ultima e i piatti di Natale.', parole: /natal|feste|capodann|pasqu/, azione: true },
  ordini: { vista: 'ordini', nome: 'Ordini', come: 'In alto le schede Nuovi, Oggi, Prossimi e Storico; tocca un ordine per accettarlo o segnarlo pronto.', parole: /\bordin[ie]\b|chi (ha )?ordinat|da accettar/ },
  piatti: { vista: 'piatti', nome: 'I miei piatti', come: 'Tocca un piatto per cambiarlo; l\'interruttore lo toglie o lo rimette nel menù.', parole: /i miei piatti|\bmen[uù]\b|tutti i piatti/ },
  nuovo: { vista: 'nuovo', nome: 'Nuovo piatto', come: 'Rispondi alle 4 domande: nome, parte del menù, come lo vendi, prezzi.', parole: /(nuovo|aggiung\w*|mett\w*|cre\w*) (un )?piatt|piatto nuovo/ },
  // (C99) nome e codice di un cliente: vince sul «nome» del piatto quando si parla di clienti o codici
  'clienti-nome': { vista: 'clienti', nome: 'Nome e codice dei clienti', come: 'In «I tuoi clienti» tocca la matita accanto al nome per cambiarlo; il codice accanto (es. K7P2M) non cambia mai. Se un cliente ha corretto il suo nome, lo vedi lì finché tocchi «Visto».', parole: /(nome|codice|chiam)\w*.*client|client\w*.*(nome|codice|chiam)|codice (fisso|del|della|di)|\bil mio codice\b/ },
  'clienti-nuovi': { vista: 'clienti', nome: 'Accetta clienti nuovi', come: 'In «Fai conoscere la tua cucina» c\'è l\'interruttore «Accetta clienti nuovi». Spento: chi ha il link vede il menù, ma non può fare il primo ordine.', parole: /accett\w* (client|person|gent)\w* nuov|(client|person|gent)\w* nuov\w* no\b|non (voglio|prendo|accetto) (piu )?(client|person|gent)\w* nuov|nessun (cliente|altro) nuov/ },
  'clienti-rifiutati': { vista: 'clienti', nome: 'Persone rifiutate', come: 'In fondo, in «Persone rifiutate», ci sono quelle a cui hai detto no. Se hai sbagliato, tocca «Accetta».', parole: /rifiutat|ho detto (di )?no|detto no per sbaglio|riaccett|sbagliato a (rifiut|dire no)/, ui: { rifiutati: true } },
  'clienti-attesa': { vista: 'clienti', nome: 'Chi aspetta il tuo sì', come: 'Sotto «Nuovi» ci sono le persone che aspettano: tocca Sì o No. Se una persona dice che aspetta e qui non c\'è, dille di toccare «Ricorda a Monica» nell\'app; se ancora non compare, deve riaprire il link e scrivere di nuovo il nome.', parole: /aspett\w* (il mio |il tuo |un )?s[iì]\b|ricorda a monica|non (la|lo|li) trovo (tra|nei|fra) (i )?client|non compar\w* (tra|nei|fra) (i )?client|non c.e (tra|nei|fra) (i )?client/ },
  'ordini-storico': { vista: 'ordini', nome: 'Storico degli ordini', come: 'Qui ci sono gli ordini finiti, le prove e quelli archiviati.', parole: /storic|ordini (vecchi|passati|finiti|archiviat)|archiviat/, ui: { tab: 'storico' } },
  clienti: { vista: 'clienti', nome: 'Clienti', come: 'Qui inviti le amiche su WhatsApp e approvi le persone nuove.', parole: /client|invit|amich|approv|nuove persone/ },
  spesa: { vista: 'spesa', nome: 'Lista della spesa', come: 'In alto scegli per quanti giorni: la lista si fa dagli ordini, e puoi aggiungere le tue cose.', parole: /spesa|comprar|supermercat/ },
  'ricettario-foto': { vista: 'ricettario', nome: 'Foto piccole: Migliora con l\'AI', come: 'Apri una ricetta e tocca la foto di un passo: si ingrandisce. Sotto c\'è «✨ Migliora con l\'AI»: in pochi secondi la foto diventa grande e nitida. Dopo la prima volta lo fa da sola.', parole: /(foto|immagin)\w*.*(sgranat|sfocat|piccol|brutt|nitid|miglior|ingrand|pixel)|(sgranat|sfocat|miglior|ingrand)\w*.*(foto|immagin)/ },
  // C124: sezione proteica, difficoltà e Database (prima di «ricettario»: vince sulle parole più precise)
  // C149: prima di «ricettario-fit» (che prende «palestra»): il profilo di Mario per il «Voto per te»
  'imp-palestra': { vista: 'impostazioni', nome: 'Il mio profilo palestra', come: 'Nella scheda «Solo per te, Mario» c\'è «🏋️ Il mio profilo palestra»: scrivi peso, altezza, età, quante volte fai pesi e l\'obiettivo. Si salva da solo, solo su questo telefono, e nel Ricettario vedi il «Voto per te».', parole: /profilo (della )?palestr|(il )?mio peso|voto per te|quante proteine (mi servono|devo|al giorno)|mio obiettivo/ },
  'ricettario-fit': { vista: 'ricettario', nome: 'Ricette proteiche', come: 'Sei in «🏋️ Proteiche»: tutte le ricette ricche di proteine, ognuna col voto da 1 a 10 e il semaforo (🟢 bene, 🟡 così così, 🔴 attento) per proteine, calorie, grassi saturi, zuccheri e sale; prima quelle col voto più alto. Scegli uno o più momenti (Colazione, Cena…) e, se vuoi, una o più fonti (pollo, albumi…); il riquadro verde dice cosa sto caricando e «🔍 Cerca altre» ne cerca di nuove. Su ogni ricetta trovi i valori per porzione.', parole: /protei|palestr|fitness|\bgym\b|ipertrofi|definizion|asciugar|massa muscol|poche calorie|ricett\w* (light|legger|fit)/, ui: { ricZona: 'fit' } },
  'ricettario-video': { vista: 'ricvideo', nome: 'Ricette video', come: 'Qui ci sono le ricette dai video di YouTube, divise per youtuber: tocca un nome, poi una ricetta. Tocca la foto e il video parte dentro l\'app; «✕ Chiudi il video» per tornare. Dove vedi «🎙️ dal video», dosi e passi li ha ascoltati Claude da quello che dice il video.', parole: /video|youtub|youtuber|pietrobon|bearded/ },
  'ricettario-diff': { vista: 'ricettario', nome: 'Difficoltà delle ricette', come: 'Sotto le portate c\'è «Difficoltà»: tocca Facili, Medie o Difficili.', parole: /ricett\w* (facil|semplic|difficil)|difficolt/ },
  'ricettario-db': { vista: 'ricdb', nome: 'Database ricette', come: 'Qui vedi quante ricette ci sono, il motore che le cerca da solo e le parole per le ricette proteiche.', parole: /database|archivio (delle )?ricett|motore (delle )?ricett/ },
  ricettario: { vista: 'ricettario', nome: 'Ricettario', come: 'Cerca una ricetta per nome o ingrediente, poi tocca «Cucina guidata». Se in alto c\'è «🛟 Modalità risparmio», fino all\'ora scritta non cerca ricette nuove: le tue funzionano.', parole: /ricett|ricettari|cucina guidata|modalit. risparmio/ }
};
/* le impostazioni in più (opzioni.js): «Portami lì» per ognuna */
OPZIONI.filter(o => o.g !== 'mario').forEach(o => { DOVE_AI['opz-' + o.k] = { vista: 'impostazioni', sez: 'opz-' + o.k, nome: o.nome, come: o.aiuto, parole: o.parole, azione: true }; });
const VOCI_PIATTO = ['foto', 'prezzi', 'pronto', 'nome', 'gusti', 'ingredienti', 'dosi', 'richieste', 'fritto', 'casa', 'novita'];
const semplice = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const PAROLE_VUOTE = /^(di|del|della|delle|dei|con|alla|alle|al|allo|e|in|la|le|il|lo|gli|tipo|medie|da)$/;
/* i piatti nominati nella frase: conta le parole del nome (anche «melanzane» → Melanzane alla parmigiana); a pari punti tutti (Monica sceglie) */
function piattiDetti(t) {
  const parole = semplice(t).split(/[^a-z]+/).filter(w => w.length >= 4);
  const uguale = (x, w) => x === w || (x.length >= 5 && w.length >= 5 && x.slice(0, 5) === w.slice(0, 5));
  const voti = visibili().map(p => {
    const sue = semplice(p.nome).split(/[^a-z]+/).filter(w => w.length >= 4 && !PAROLE_VUOTE.test(w));
    return { p, n: sue.filter(w => parole.some(x => uguale(x, w))).length / Math.max(1, sue.length) };
  }).filter(v => v.n > 0);
  const top = Math.max(0, ...voti.map(v => v.n));
  return voti.filter(v => v.n === top).map(v => v.p).slice(0, 4);
}
/* i posti che le PAROLE fanno pensare (C102: solo indizi per l'AI, o riserva «Intendi…?» senza AI); quanti = quanti posti al massimo.
   null = niente di sicuro (azioni con numeri o date, domande sui dati) */
function capisciDove(testo, quanti = 1) {
  const t = semplice(testo);
  if (!t || t.length > 200) return null;
  const domanda = /\bcome\b|\bdove\b|non (la |lo |li |le )?(so|trovo|riesco|capisco|vedo)|si fa|posso|aiut|portami|fammi vedere|apri|vai /.test(t);
  const voglio = domanda || /vogli|vorrei|devo|cambi|modific|sistem|aggiung|mett|togli|scriv|attiv|accend|spegn|impost/.test(t);
  if (!voglio) return null;
  const np = !/\bcome\b|\bdove\b/.test(t) && t.replace(/[.!?,;:"«»]+/g, ' ').replace(/\s+/g, ' ').trim().match(/(?:aggiung\w*|mett\w*|crea\w*)\s+(?:anche\s+)?(?:la|una|il)?\s*(?:parte|categoria|sezione)\s+(?:nuova\s+)?(?:dei\s+|degli\s+|delle\s+|di\s+|chiamata\s+)?([a-z][a-z ']{1,28}?)\s*(?:nel menu|al menu|in fondo|$)/);
  if (np) { const nome = np[1].trim(); return [{ azione: 'impostazione', chiave: 'parti', valore: [...opz('parti'), [null, nome]], detta: nome }]; }   // «aggiungi la parte secondi» anche senza rete (C92)
  const chiavi = Object.keys(DOVE_AI).filter(k => DOVE_AI[k].parole.test(t));
  if (!chiavi.length) return null;
  // in ordine: la voce precisa vince sulla pagina («ordine minimo» → Ordine minimo, non Ordini)
  const ordine = [...new Set([...chiavi.filter(x => x === 'clienti-nome'), ...chiavi.filter(x => VOCI_PIATTO.includes(x)), ...chiavi.filter(x => DOVE_AI[x].sez), ...chiavi.filter(x => x.includes('-')), ...chiavi])];   // la voce precisa («ordini-storico») prima della pagina («ordini»)
  const fuori = [];
  for (const k of ordine) {
    if (fuori.length >= quanti) break;
    const v = DOVE_AI[k];
    if (v.azione && !domanda && /\d/.test(t)) { if (!fuori.length) return null; continue; }   // «alza le lasagne a 14 euro», «pausa fino al 20»: lo fa l'AI
    if (VOCI_PIATTO.includes(k)) {
      const pp = piattiDetti(testo);
      if (!pp.length && k === 'nome' && !domanda) continue;
      if (pp.length) { if (!fuori.length && pp.length > 1) return pp.map(p => ({ azione: 'vai', voce: k, id: p.id })); fuori.push({ azione: 'vai', voce: k, id: pp[0].id }); }
      else if (!fuori.some(a => a.voce === 'piatti')) fuori.push({ azione: 'vai', voce: 'piatti', perVoce: k });
      continue;
    }
    fuori.push({ azione: 'vai', voce: k });
  }
  return fuori.length ? fuori : null;
}
function rispostaDove(aa, incerta) {
  if (incerta) aa = aa.filter(a => !controllaAI(a).no);
  if (!aa.length) return { testo: 'Non ho capito dove vuoi andare: dimmelo con altre parole.', azioni: [] };
  const c = controllaAI(aa[0]);
  if (c.no) return { testo: c.no, azioni: [] };
  if (aa[0].azione === 'impostazione') return { testo: `Aggiungo «${aa[0].detta}» alle parti del menù: controlla e conferma qui sotto.`, azioni: aa };
  if (aa.length > 1 && aa.every(a => a.voce === aa[0].voce && a.id)) return { testo: `Quale piatto? Ne ho trovati ${aa.length}: tocca quello giusto.`, azioni: aa };
  if (incerta) return { testo: aa.length > 1 ? 'Ho capito solo qualche parola: intendi uno di questi? Tocca quello giusto.' : `Ho capito solo qualche parola: intendi «${c.titolo}»? Se sì tocca «Portami lì».`, azioni: aa };
  return { testo: `Ti porto in ${c.titolo}. ${c.dopo}`, azioni: aa };
}
/* va nel punto: apre la sezione, la porta in vista e la fa lampeggiare; in cima una riga con cosa fare e «Torna all'aiutante» */
function portaLi(c) {
  vai(c.vai);
  if (c.ui) Object.assign(UI, c.ui);   // (C100) es. scheda Storico degli Ordini, Persone rifiutate aperte
  UI.sez = c.sez || null; UI.aiQui = { vista: c.vai, testo: c.dopo, titolo: c.titolo };
  render();
  setTimeout(() => {
    const d = c.sez && document.querySelector(`details.sez[data-sez="${c.sez}"]`);
    if (d) { d.open = true; ($('.ai-qui') || d).scrollIntoView({ block: 'start', behavior: 'smooth' }); d.classList.remove('ai-lampo'); void d.offsetWidth; d.classList.add('ai-lampo'); }
  }, 80);
}
function bannerAI() {   // chiamata da render() (app.js) con typeof: resta finché Monica è in quella pagina
  if (UI.vista !== 'aiutante') AI.ultimaVista = UI.vista;
  if (!UI.aiQui) return;
  if (UI.vista !== UI.aiQui.vista || P.ruolo !== 'monica') { if (UI.vista !== 'aiutante') UI.aiQui = null; return; }
  const m = $('main.corpo'); if (!m || m.querySelector('.ai-qui')) return;
  const d = UI.sez && m.querySelector(`details.sez[data-sez="${UI.sez}"]`);   // subito sopra la voce aperta, così si vede insieme
  (d || m).insertAdjacentHTML(d ? 'beforebegin' : 'afterbegin', `<div class="ai-qui">${ico('scintille')}<div><b>${esc(UI.aiQui.titolo)}</b><span>${esc(UI.aiQui.testo)}</span>
    <div class="fila"><button type="button" class="link" data-a="ai-torna">Torna all'aiutante</button><button type="button" class="link tenue" data-a="ai-qui-via">Ho capito</button></div></div></div>`);
}

/* ---------- azioni ---------- */
const pianoDi = el => AI.msgs[Number(el.dataset.i)];
Object.assign(A, {
  'ai-invia'() { const el = $('#ai-testo'); inviaAI(el ? el.value : AI.bozza); },
  'ai-chiedi'(el) { inviaAI(el.dataset.t); },
  'ai-detta'() { if (UI.vista !== 'aiutante') vai('aiutante'); ascoltaAI(); },
  'ai-foto-via'() { AI.foto = null; render(); },
  'ai-vai'(el) { const m = pianoDi(el), x = m && m.piano && m.piano[Number(el.dataset.j)], c = x && controllaAI(x.a); if (c && c.vai) portaLi(c); },
  'ai-torna'() { UI.aiQui = null; vai('aiutante'); fondoAI(); },
  'ai-qui-via'() { UI.aiQui = null; const b = $('.ai-qui'); if (b) b.remove(); },
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

/* ================= AIUTANTE DEI CLIENTI (C50, Mario 08/11 «per i clienti fallo al meglio ma tienilo disattivato») =================
   Il cliente approvato chiede (scritto o a voce): allergie, ingredienti, prezzi, cosa ordinare, a che punto è il suo ordine.
   L'AI propone al massimo «metti nel carrello», «apri il piatto», «scrivi a Monica»: l'ordine lo manda sempre il cliente.
   Acceso per tutti dall'08/11 (Mario «attiva per i clienti»); S.impostazioni.aiClienti = false lo spegne; Mario lo prova anche spento con «guarda come». */
const AIC = { msgs: [], attesa: false, bozza: '' };
const DOMANDE_AIC = ['Cosa c\'è di pronto oggi?', 'Cosa mi consigli?', 'Cosa posso mangiare con le mie allergie?', 'A che punto è il mio ordine?', 'Come si ordina?'];
const VISTE_AIC = { menu: 'Menù', ordini: 'I miei ordini', carrello: 'Il carrello' };
function aiClientiOn() { return S.impostazioni.aiClienti !== false; }   // acceso di base (Mario 08/11 «attiva per i clienti»): si spegne solo con l'interruttore
function aiClientiVisibile() { return P.ruolo !== 'monica' && !UI.modifica && (aiClientiOn() || !!UI.devCliente) && (!Dati.attivo || !!P.cliente || !!UI.devCliente); }
function datiAIC() {
  const imp = S.impostazioni, nomiAll = ids => allergeniDi(ids).map(a => NOME_ALL[a]);
  const piatti = visibili().filter(p => p.disponibile).map(p => {
    const ing = p.ing || [];
    return Object.assign({ id: p.id, nome: p.nome, parte: (CATEGORIE.find(([k]) => k === p.cat) || ['', ''])[1], descrizione: p.sotto || '',
      formati: p.formati.map(f => ({ id: f.id, nome: f.nome, prezzo: f.prezzo, tipo: f.tipo })),
      ingredienti: ing.length ? ing.map(i => ING(i).n) : 'non ancora scritti: chiedere a Monica', allergeni: ing.length ? nomiAll(ing) : 'da chiedere a Monica' },
      ing.length ? { vegetariano: !ing.some(i => ING(i).m) } : {},
      p.varianti.length ? { gusti: p.varianti.map(v => ({ id: v.id, nome: v.nome, allergeniInPiu: nomiAll(v.ing || []).filter(a => !nomiAll(ing).includes(a)) })) } : {},
      p.fritto > 0 ? { fritto_da_Monica_euro_in_piu: p.fritto } : {}, p.forno > 0 ? { al_forno_da_Monica_euro_in_piu: p.forno } : {},
      p.pronto && p.pronto.giorno === oggi() && p.pronto.qta > 0 && !pausaOra() ? { prontiOggi: p.pronto.qta } : {});
  });
  const miei = S.ordini.filter(o => o.cliente === P.cliente && o.stato !== 'prova' && !o.archiviato).sort((a, b) => b.n - a.n).slice(0, 8)
    .map(o => ({ n: o.n, stato: STATO_AI[o.stato] || o.stato, ritiro: o.entro + ' ' + giornoLungo(o.entro), cosa: o.righe.map(r => `${r.nome} (${descRiga(r)})`).join(', '), totale: totale(o.righe), pagato: !!(o.paga && o.paga.ricevuto) }));
  return { oggi: oggi() + ' ' + giornoLungo(oggi()), monica: pausaOra() ? `in pausa fino a ${giornoLungo(imp.pausa.fino)} (si può ordinare per i giorni dopo)` : 'aperta',
    giorniDiPreavviso: imp.anticipo, prontiDaRitirareEntroLe: imp.prontiFino, pagamenti: Object.keys(METODO).filter(m => imp.paga[m]).map(m => METODO[m]),
    notaRitiro: (imp.ritiro || {}).nota || '', allergie: P.allergie.length ? 'segnate sul telefono, le controlla l\'app (non chiederle)' : 'nessuna segnata', piatti, mieiOrdini: miei,
    carrello: P.carrello.map(r => `${r.nome} (${descRiga(r)})`) };
}
/* ogni azione controllata sul menù di ADESSO (un piatto può essere finito nel frattempo) */
function controllaAIC(a) {
  const p = a.id ? piatto(a.id) : null, ok = p && !p.cestino && p.disponibile;
  switch (a.azione) {
    case 'carrello': {
      if (!ok) return { no: 'Questo piatto adesso non è nel menù.' };
      const f = p.formati.find(x => x.id === a.formato) || p.formati[0], { min, passo: st } = passoDi(f);
      const v = p.varianti.find(x => x.id === a.gusto) || p.varianti[0];
      let q = numeroAI(a.qta); if (!(q > 0)) q = min;
      q = Math.max(min, Math.min(f.tipo === 'kg' ? 20 : 30, Math.round(q / st) * st));
      const r = { piatto: p.id, nome: p.nome, formato: f.id, formatoNome: f.nome, tipo: f.tipo, variante: v ? v.id : '', varianteNome: v ? v.nome : '', qta: arrot(q),
        prezzo: prezzoDi(p, f.id, v ? v.id : ''), note: [], testo: '', pronto: false, fritto: false, frittoPrezzo: 0, forno: false, fornoPrezzo: 0,
        ...(a.scegli && p.formati.length > 1 ? { daScegliere: true } : {}) };   // C157: misura non detta → la sceglie il cliente nel carrello, «Invia» fermo
      const n = quanti(P.carrello);
      return { titolo: `Metto nel carrello: ${p.nome}`, nota0: n ? `Nel carrello hai già ${n} ${n === 1 ? 'cosa' : 'cose'}: restano.` : '',
        dopo: r.daScegliere ? `${r.qta} · misura da scegliere nel carrello` : `${descRiga(r)} · ${euro(prezzoRiga(r))}`, nota: p.varianti.length > 1 && !p.varianti.some(x => x.id === a.gusto) ? 'Gusto da controllare nel carrello' : '',
        campi: [['qta', 'number', f.tipo === 'kg' ? 'Quanti kg' : 'Quanti']], fai() { aggiungiRiga(P.carrello, r); salvaP(); } };
    }
    case 'piatto': return ok ? { titolo: p.nome, dopo: p.sotto || '', etichetta: 'Guarda il piatto', vai: 'piatto:' + p.id } : { no: 'Questo piatto adesso non è nel menù.' };
    case 'apri': return VISTE_AIC[a.vista] ? { titolo: VISTE_AIC[a.vista], etichetta: 'Apri', vai: a.vista } : { no: '' };
    case 'scrivi_monica': {
      if (!S.impostazioni.whatsapp) return { no: '' };
      const t = String(a.testo || '').trim().slice(0, 300);
      return { titolo: 'Scrivimi', dopo: t, etichetta: 'Apri WhatsApp', link: waMonica().replace(/(text=[^&]*)$/, m => m + encodeURIComponent(t)) };
    }
    default: return { no: '' };
  }
}
/* domanda al server (separata: le prove la sostituiscono con una risposta finta) */
async function chiediAiutoCliente(testo, dati, storia) {
  if (!sulSito()) throw new Error('Qui nell\'anteprima l\'aiutante non risponde: provalo nell\'app vera, sul telefono.');
  if (!navigator.onLine) throw new Error('Sei senza internet: riprova quando torna la rete.');
  const tok = await Dati.tokenCliente(); if (!tok) throw new Error('Riapri l\'app e riprova.');
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 45000);
  try {
    const res = await fetch('/api/aiuto-cliente', { method: 'POST', signal: ctl.signal, headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ testo, dati, storia }) });
    const j = await res.json().catch(() => ({}));
    if (res.status === 403) throw new Error(j.errore === 'spento' ? 'L\'aiutante per ora è spento.' : 'L\'aiutante è per chi Monica ha già accettato.');
    if (!res.ok) throw new Error('Adesso l\'aiutante non risponde: riprova tra poco, o scrivi a Monica.');
    if (j.grezzo || j.errore) console.warn('aiuto-cliente:', j.grezzo || j.errore);
    return j;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Ci sto mettendo troppo: riprova tra poco.');
    if (e instanceof TypeError) throw new Error('Non riesco a collegarmi: riprova tra poco.');
    throw e;
  } finally { clearTimeout(t); }
}
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
    if (r && r.fermo && loc && loc.confidenza > 0) r = loc.risposta;   // (C109) server in «modo ridotto»: meglio quello che il telefono ha capito
  }
  const pi = pianoDa(r);
  pi.azioni = pi.azioni.slice(0, 4);
  AIC.attesa = false;
  AIC.msgs.push({ chi: 'lei', t: pi.testo, piano: pi.azioni.length ? pi.azioni : null, voce: !!voce, dettato: !!extra.dettato, giorno: loc ? loc.giorno : null, alt: loc && loc.alternative.length ? loc.alternative : null });
  AIC.msgs = AIC.msgs.slice(-30);
  if (UI.vista === 'aiuto') { render(); fondoAC(); }
  const i = AIC.msgs.length - 1, haFai = pi.azioni.some(x => controllaAIC(x.a).fai);
  const o = k => typeof opz !== 'function' || opz(k) !== false, poi = () => { if (typeof dopoVoceCliente === 'function') dopoVoceCliente(i); };
  if (voce) { if (o('voceClientiRisponde')) (typeof parlaCliente === 'function' ? (t, f) => parlaCliente(t, f, i) : parlaAI)((typeof perVoceCliente === 'function' ? perVoceCliente(pi.testo) : pi.testo) + (haFai ? (o('voceClientiConferma') && (typeof vocePuoSentireSi !== 'function' || vocePuoSentireSi()) ? ' Lo metto nel carrello? Dimmi sì o no.' : ' Controlla e tocca Conferma.') : ''), poi); else poi(); }
}
window.chiediAiutoCliente = chiediAiutoCliente;
function fondoAC() {
  if (UI.vista !== 'aiuto') return;
  const fum = document.querySelectorAll('.ai-fum.lei'), ultimo = fum[fum.length - 1];
  const testa = document.querySelector('.testata'), fissa = testa && /sticky|fixed/.test(getComputedStyle(testa).position), sopra = (fissa ? testa.getBoundingClientRect().height : 0) + 12;
  window.scrollTo(0, document.body.scrollHeight);
  if (ultimo && ultimo.getBoundingClientRect().top < sopra) window.scrollTo(0, ultimo.getBoundingClientRect().top + window.scrollY - sopra);   // schermo basso (iPad in orizzontale): l'inizio della risposta deve restare in vista
}
function barraAIC() {
  if (!aiClientiVisibile()) return '';
  return `<div class="ai-barra ai-cliente"><button type="button" class="ai-apri" data-a="vai" data-v="aiuto">${ico('scintille')}<span>Chiedi o ordina: allergie, prezzi, piatti…</span></button>
    ${(Riconosci || window.MediaRecorder) ? `<button type="button" class="ai-mic" data-a="ac-detta" aria-label="Chiedi o ordina a voce">${ico('microfono')}</button>` : ''}</div>`;
}
function rigaAC(x, i, j, fermo) {
  const c = controllaAIC(x.a), id = `${i}|${j}`;
  if (c.no !== undefined) return c.no ? `<div class="ai-azione no">${ico('x')}<span>${esc(c.no)}</span></div>` : '';
  if (c.link || c.vai) return `<div class="ai-azione"><div class="ai-cosa"><b>${esc(c.titolo)}</b>${c.dopo ? `<span class="ai-dopo">${esc(c.dopo)}</span>` : ''}</div>
    ${c.link ? `<a class="btn chiaro piccolo" href="${c.link}" target="_blank" rel="noopener">${ico('chat')}${esc(c.etichetta)}</a>` : `<button type="button" class="btn chiaro piccolo" data-a="ac-vai" data-v="${esc(c.vai)}">${esc(c.etichetta)}</button>`}</div>`;
  const campi = c.campi.map(([k, tipo, et]) => `<label class="ai-campo"><small>${esc(et)}</small><input type="${tipo}" inputmode="decimal" step="0.5" min="0" data-acf="${id}|${k}" value="${esc(String(x.a[k] == null ? '' : x.a[k]))}" ${fermo ? 'disabled' : ''}></label>`).join('');
  return `<div class="ai-azione ${x.on ? '' : 'spenta'}"><label class="ai-spunta"><input type="checkbox" data-acon="${id}" ${x.on ? 'checked' : ''} ${fermo ? 'disabled' : ''} aria-label="${esc(c.titolo)}"></label>
    <div class="ai-cosa"><b>${esc(c.titolo)}</b><span class="ai-dopo">${esc(c.dopo)}</span>${[c.nota, c.nota0].filter(Boolean).map(t => `<small class="tenue">${esc(t)}</small>`).join('')}
    ${!fermo ? `<div class="ai-campi">${campi}</div>` : ''}</div></div>`;
}
function fumettoAC(m, i) {
  if (m.chi === 'io') return `<div class="ai-fum io">${esc(m.t)}</div>`;
  let h = `<div class="ai-fum lei">${esc(m.t)}`;
  if (m.voce && typeof riascoltaCliente === 'function') h += `<button type="button" class="vc-ascolta ${m.muta ? 'forte' : ''}" data-a="vc-ascolta" data-m="${i}">${ico('altoparlante')}${m.muta ? 'Ascolta la risposta' : 'Riascolta'}</button>`;   // C110: su iPhone/iPad la voce parte di sicuro con un tocco
  if (m.alt && !m.altFatto) h += `<div class="scelte vc-alt">${m.alt.map((a, j) => `<button type="button" class="chip" data-a="vc-alt" data-m="${i}" data-j="${j}">${esc(a.nome)}</button>`).join('')}</div>`;   // «Quale intendi?» (voce-clienti.js)
  if (m.piano) {
    const fermo = !!m.esito, quante = m.piano.filter(x => x.on && controllaAIC(x.a).fai).length;
    h += `<div class="ai-piano">${m.piano.map((x, j) => rigaAC(x, i, j, fermo)).join('')}</div>`;
    if (m.esito) h += `<small class="ai-esito">${m.esito === 'fatto' ? '✓ Nel carrello' : m.esito === 'no' ? 'Lasciato stare' : esc(m.esito)}</small>`;
    else if (quante) h += `<div class="fila ai-faccio"><b>Controlla e conferma</b><button type="button" class="btn piccolo" data-a="ac-si" data-i="${i}">${ico('spunta')}${quante === 1 ? 'Conferma' : `Conferma tutte e ${quante}`}</button><button type="button" class="btn chiaro piccolo" data-a="ac-no" data-i="${i}">Lascia stare</button></div>`;
  }
  return h + '</div>';
}
function vAiutoCliente() {
  const asc = !!AI.rec || (typeof ascoltoInCorso === 'function' && ascoltoInCorso());   // microfono acceso (anche l'ascolto preciso di voce-clienti.js)
  let h = testataSemplice('Aiutante', 'menu', 'Menù') + '<main class="corpo aiutante">';
  if (!aiClientiOn()) h += `<div class="avviso">${ico('occhio')}<div><b>Lo vedi solo tu, Mario:</b> per i clienti è spento. Si accende in Impostazioni → Solo per te, Mario.</div></div>`;
  if (!AIC.msgs.length) h += `<section class="scheda ai-intro">${ico('scintille')}<div><b>Ciao! Ti aiuto a scegliere.</b>
    <p style="margin:4px 0 0">Chiedimi di allergie, ingredienti, prezzi o del tuo ordine. Scrivi o tocca il microfono.</p>
    <p class="tenue piccolo" style="margin:6px 0 0">Per esempio: ${typeof esempiVoce === 'function' ? esempiVoce().slice(0, 3).map(esc).join(' · ') : '«Cosa c\'è senza glutine?» · «Il mio ordine è pronto?»'}</p>
    ${typeof ascoltaCliente === 'function' && (Riconosci || window.MediaRecorder) ? `<button type="button" class="btn chiaro piccolo" style="margin-top:8px" data-a="vc-detta">${ico('microfono')}Dettami l'ordine</button>` : ''}</div></section>`;
  h += `<div class="ai-chat" aria-live="polite">${AIC.msgs.map(fumettoAC).join('')}${AIC.attesa ? '<div class="ai-fum lei ai-pensa" aria-label="Sto pensando"><span></span><span></span><span></span></div>' : ''}</div>`;
  if (!AIC.attesa) h += `<div class="scelte ai-domande">${DOMANDE_AIC.map(d => `<button type="button" class="chip" data-a="ac-chiedi" data-t="${esc(d)}">${esc(d)}</button>`).join('')}</div>`;
  h += `<div class="ai-scrivi"><input id="ac-testo" type="text" enterkeyhint="send" autocomplete="off" maxlength="300" placeholder="${asc ? 'Ti ascolto…' : 'Scrivi qui…'}" value="${esc(AIC.bozza)}" aria-label="La tua domanda">
    ${(Riconosci || window.MediaRecorder) ? `<button type="button" class="ai-mic ${asc ? 'acceso' : ''}" data-a="ac-detta" aria-label="${asc ? 'Smetti di ascoltare' : 'Chiedi a voce'}">${ico('microfono')}</button>` : ''}
    <button type="button" class="btn" data-a="ac-invia" ${AIC.attesa ? 'disabled' : ''}>Invia</button></div>
    <p class="tenue piccolo" style="margin:0">L'aiutante usa un'intelligenza artificiale: può sbagliare. Per allergie e intolleranze chiedi sempre conferma a Monica.</p>`;
  return h + '</main>';   // «Scrivi a Monica» ora è nella barra in basso (C155)
}
const pianoAC = el => AIC.msgs[Number(el.dataset.i)];
Object.assign(A, {
  'ac-invia'() { const el = $('#ac-testo'); inviaAC(el ? el.value : AIC.bozza); },
  'ac-chiedi'(el) { inviaAC(el.dataset.t); },
  'ac-detta'() { if (typeof ascoltaCliente === 'function') { ascoltaCliente(); return; } if (UI.vista !== 'aiuto') vai('aiuto'); ascoltaAI(inviaAC, AIC); },
  'ac-vai'(el) { const [v, id] = el.dataset.v.split(':'); if (v === 'piatto') { vai('menu'); apriPiatto(id, false); } else vai(v); },
  'ac-si'(el) {
    const m = pianoAC(el); if (!m || !m.piano || m.esito) return;
    const scelte = m.piano.filter(x => x.on).map(x => controllaAIC(x.a)).filter(c => c.fai);
    if (!scelte.length) { m.esito = 'Niente da mettere nel carrello: il menù è cambiato.'; render(); return; }
    const prima = JSON.stringify(P.carrello);
    scelte.forEach(c => c.fai()); m.esito = 'fatto'; render();
    mostraToast(scelte.length === 1 ? 'Messo nel carrello' : `${scelte.length} piatti nel carrello`, () => { P.carrello = JSON.parse(prima); salvaP(); m.esito = 'Tolto dal carrello'; render(); });
    if (typeof dopoConfermaCliente === 'function') dopoConfermaCliente(m);   // giorno nel carrello e riepilogo letto se la proposta è nata dalla voce
  },
  'ac-no'(el) { const m = pianoAC(el); if (m && !m.esito) { m.esito = 'no'; render(); } }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'ac-testo') AIC.bozza = el.value;
  if (el.dataset && el.dataset.acf) {
    const [i, j, k] = el.dataset.acf.split('|'), m = AIC.msgs[Number(i)], x = m && m.piano && m.piano[Number(j)];
    if (!x || m.esito) return;
    x.a[k] = el.value;
    clearTimeout(AIC.tRid); AIC.tRid = setTimeout(() => { const f = document.activeElement && document.activeElement.dataset.acf; render(); if (f) { const n = document.querySelector(`[data-acf="${f}"]`); if (n) n.focus(); } }, 700);
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.acon) { const [i, j] = el.dataset.acon.split('|'), m = AIC.msgs[Number(i)]; if (m && m.piano && !m.esito) { m.piano[Number(j)].on = el.checked; render(); } }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ac-testo') { e.preventDefault(); inviaAC(e.target.value); } });

/* app.js ha già disegnato la pagina prima che arrivasse questo file: ridisegna per mostrare le barre dell'aiutante */
try { if (typeof S !== 'undefined' && S && P.ruolo) render(); } catch (e) { /* al prossimo render */ }
