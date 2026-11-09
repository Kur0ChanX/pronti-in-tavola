/* ================= COMANDO VOCALE DEI CLIENTI (C105, Mario 09/11 «performante… smart… sorprendente») =================
   Tre strati: A) ascolto (il telefono, poi «ascolto preciso» sul server se serve), B) capire SENZA rete (capisciCliente:
   piatti, quantità, formati, gusti, giorni, domande su prezzi, allergie, pronti, ordini), C) conversazione a voce
   (risposta letta, «sì» detto o scritto mette nel carrello, «Dettami l'ordine», microfono fisso nel menù e nel carrello).
   aiutante.js (zona clienti) chiama capisciCliente / ascoltaCliente / rispondiSiNoCliente con typeof (PT E23).
   Allergie e ordini del cliente restano sul telefono: al server va solo l'audio con i nomi dei piatti.
   NON ANCORA COLLEGATO (Voce 2, 09/11): manca lo script in index.html/anteprima.py, i ganci in aiutante.js, /api/ascolta,
   gli stili .vc-* e le prove. Specifica: docs/SPEC-VOCE-CLIENTI.md; passi: docs/CONSEGNE-PARALLELA-voce.md. */
const VC = { rec: null, media: null, stato: '', testo: '', perSi: null, dettato: false, precisoDopo: false, giaPreciso: false, giro: 0, giu: 0, partito: false, tGuardia: 0, audio: null, errore: '' };
const vcS = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const vcOpz = (k, base) => { try { const v = typeof opz === 'function' ? opz(k) : undefined; return v === undefined ? base : v; } catch (e) { return base; } };
const riconoscitore = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
/* iPhone e iPad: il riconoscitore di Safari c'è ma è a rischio: nell'app installata sulla Home non parte mai (WebKit 225298, dal 2021, ancora così 11/2026),
   dentro WhatsApp dà «service-not-allowed», e anche in Safari dopo un audio (la risposta a voce) resta muto (WebKit 321436, 08/2026). Lì si registra e capisce il server. */
const suiOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const appSullaHome = () => navigator.standalone === true || !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches);
const telefonoAscoltaBene = () => !!riconoscitore() && !(suiOS() && appSullaHome());
const vocePuoSentireSi = () => !!riconoscitore() && !suiOS();   // il «sì» a voce arriva dopo un audio: su iPhone e iPad resta il tocco su Conferma
const VC_VUOTE = /^(di|del|della|delle|dei|con|alla|alle|al|allo|ai|e|ed|in|la|le|il|lo|gli|a|da|per|un|una|uno|tipo|medie|mezza|luna)$/;
/* come i clienti chiamano i piatti (parola detta → parola del menù); Monica ne aggiunge altre da Impostazioni («sebadas=seadas, …») */
const SINONIMI_VOCE = { lasagna: 'lasagne', lasagnette: 'lasagne', 'la sagne': 'lasagne', 'la sagna': 'lasagne', 'le sagne': 'lasagne', sebadas: 'seadas', sebada: 'seadas', seada: 'seadas', sebadaz: 'seadas',
  culurgionis: 'culurgiones', culingionis: 'culurgiones', culurgione: 'culurgiones', culurgionas: 'culurgiones', panadas: 'panade', panada: 'panade', impanadas: 'impanade', impanada: 'impanade',
  raviolo: 'ravioli', polpetta: 'polpette', papassinos: 'papassini', papassino: 'papassini', pabassinas: 'papassini', pabassinos: 'papassini', 'cheese cake': 'cheesecake', 'chis cheik': 'cheesecake',
  'cous cous': 'couscous', cuscus: 'couscous', 'cus cus': 'couscous', 'tira misu': 'tiramisu', 'gnocchetti sardi': 'malloreddus', parmigiane: 'parmigiana', involtino: 'involtini', sfoglie: 'sfoglia', crostate: 'crostata', sformati: 'sformato' };
const NUM_VOCE = { un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, undici: 11, dodici: 12, tredici: 13, quattordici: 14, quindici: 15, sedici: 16, diciassette: 17, diciotto: 18, diciannove: 19, venti: 20, trenta: 30, dozzina: 12, paio: 2, coppia: 2, mezzo: 0.5, mezza: 0.5, meta: 0.5 };
const GIORNI_VOCE = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
const MESI_VOCE = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const PAROLE_ALLERGENI = { glutin: 'glutine', celiac: 'glutine', farina: 'glutine', crostace: 'crostacei', gamber: 'crostacei', uova: 'uova', uovo: 'uova', pesce: 'pesce', arachid: 'arachidi', soia: 'soia', latte: 'latte', lattos: 'latte', latticin: 'latte', formagg: 'latte',
  guscio: 'guscio', noci: 'guscio', noce: 'guscio', nocciol: 'guscio', mandorl: 'guscio', sedano: 'sedano', senape: 'senape', sesamo: 'sesamo', solfit: 'solfiti', lupin: 'lupini', mollusc: 'molluschi', cozze: 'molluschi', vongol: 'molluschi' };
const VERBI_ORDINE = /\b(vorrei|voglio|vogliamo|prendo|prendiamo|prenderei|metti|mettimi|aggiungi|aggiungimi|prenoto|prenotare|prenoterei|ordino|ordinare|ordiniamo|dammi|mi dai|mi metti|mi servono|mi serve|mi servirebbe|avrei bisogno|ci servono|ci serve)\b/;

function sinonimiVoce() {
  const tutti = Object.assign({}, SINONIMI_VOCE);
  String(vcOpz('voceClientiSinonimi', '') || '').split(/[,;\n]/).forEach(c => { const [a, b] = c.split('=').map(x => vcS(x)); if (a && b) tutti[a] = b; });
  return Object.keys(tutti).sort((a, b) => b.length - a.length).map(k => [new RegExp(`(^| )${k}(?= |$)`, 'g'), `$1${tutti[k]}`]);
}
const applicaSinonimi = (t, sin) => { sin.forEach(([re, a]) => { t = t.replace(re, a); }); return t; };
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
/* quanto una parola detta somiglia a una del menù: 1 uguale (o stesso inizio: lasagna/lasagne), poi tolleranza agli errori di trascrizione */
function simileVoce(detta, menu) {
  if (detta === menu) return 1;
  if (detta.length >= 5 && menu.length >= 5 && detta.slice(0, 5) === menu.slice(0, 5)) return 1;
  if (detta.length >= 4 && menu.length >= 4 && detta.slice(0, 4) === menu.slice(0, 4) && Math.abs(detta.length - menu.length) <= 1) return 0.9;
  if (detta.length >= 5 && menu.length >= 5) { const d = lev(detta, menu); if (d <= 1) return 0.85; if (d <= 2 && menu.length >= 7) return 0.7; }
  return 0;
}
const paroleMenu = (n, sin) => applicaSinonimi(vcS(n), sin).split(' ').filter(w => w.length >= 3 && !VC_VUOTE.test(w));

/* ---------- numeri, formati e quantità nella frase ---------- */
const numeroDetto = w => /^\d+([.,]\d+)?$/.test(w) ? Number(w.replace(',', '.')) : w in NUM_VOCE ? NUM_VOCE[w] : /^(qualche|alcune|alcuni)$/.test(w) ? 2 : null;
const UNITA_VOCE = /^(teglia|teglie|tegliette|vassoi\w*|chilo|chili|kg|chilogramm\w*|etto|etti|pezzo|pezzi|pezzetti|porzion\w*|person\w*)$/;
/* gruppi «numero + unità» con la posizione: «due teglie da 8», «un chilo e mezzo», «tre etti», «teglia grande», «sei pezzi», «per 8 persone» */
function quantitaDette(tok, eMenu) {
  const out = [], usati = new Set();
  for (let i = 0; i < tok.length; i++) {
    let q = numeroDetto(tok[i]), fine = i, unita = '', porz = 0, grande = '';
    const soloUnita = q === null && /^(teglia|teglie|chilo|kg|etto|pezzo)$/.test(tok[i]) && !/^(al|a|il|la|lo|le|i|del|della|dello|allo|alla|per|ogni|quante|quanti|quanto|che|una|un|uno|mezza|mezzo)$/.test(tok[i - 1] || '');
    if (q === null && !soloUnita) continue;
    if (soloUnita) { q = /^etto$/.test(tok[i]) ? 0.1 : 1; fine = i - 1; }
    if (q !== null && !soloUnita && /^(da|per|il|entro il|alle|ore)$/.test(tok[i - 1] || '') && !UNITA_VOCE.test(tok[i + 1] || '')) continue;   // «teglia da 8», «per il 15», «alle 18»: non sono quantità
    let j = fine + 1;
    if (tok[j] === 'e' && /^(mezzo|mezza)$/.test(tok[j + 1] || '')) { q += 0.5; fine = j + 1; j = fine + 1; }
    const u = tok[j] || '';
    if (/^(chilo|chili|kg|chilogramm\w*)$/.test(u)) { unita = 'kg'; fine = j; if (tok[j + 1] === 'e' && /^(mezzo|mezza)$/.test(tok[j + 2] || '')) { q += 0.5; fine = j + 2; } }
    else if (/^(etto|etti)$/.test(u)) { unita = 'kg'; q = q / 10; fine = j; if (tok[j + 1] === 'e' && /^(mezzo|mezza)$/.test(tok[j + 2] || '')) { q += 0.05; fine = j + 2; } }
    else if (/^(teglia|teglie|tegliette|vassoi\w*)$/.test(u)) { unita = 'teglia'; fine = j; }
    else if (/^(pezzo|pezzi|pezzetti)$/.test(u)) { unita = 'pz'; fine = j; }
    else if (/^(porzion\w*|person\w*)$/.test(u)) { unita = 'teglia'; porz = q; q = 1; fine = j; }
    if (unita === 'teglia') {   // «da 8», «per sei», «da sei persone», «grande», «piccola»
      let k = fine + 1;
      if (/^(da|per|di)$/.test(tok[k] || '')) k++;
      const n = numeroDetto(tok[k] || '');
      if (n && n >= 2 && n <= 20) { porz = n; fine = k; if (/^(porzion\w*|person\w*)$/.test(tok[k + 1] || '')) fine = k + 1; }
      else if (/^(grande|grandi|grossa|grosse|maxi)$/.test(tok[k] || '')) { grande = 'grande'; fine = k; }
      else if (/^(piccola|piccole|piccolo|media|medie|mini)$/.test(tok[k] || '')) { grande = 'piccola'; fine = k; }
    }
    if (!(q > 0) || q > 60) continue;
    if (!unita && q === 1 && /^(un|uno|una)$/.test(tok[i])) {   // «un», «una» contano solo davanti a un piatto («una parmigiana»), non in «una domanda»
      const dopo = tok[i + 1] === 'di' || tok[i + 1] === 'della' ? tok[i + 2] : tok[i + 1];
      if (!dopo || !eMenu(dopo)) continue;
    }
    for (let k = i; k <= fine; k++) usati.add(k);
    out.push({ q, unita, porz, grande, ini: i, fine });
    i = fine;
  }
  return { gruppi: out, usati };
}
/* il giorno detto: oggi, domani, dopodomani, sabato (prossimo), «il 15», «15 novembre», Natale, fine settimana, fra 3 giorni */
function giornoDetto(tok) {
  const t = tok.join(' '), og = oggi(), d = daIso(og);
  if (/\bdopodomani\b/.test(t)) return { g: piuGiorni(og, 2), detto: 'dopodomani' };
  if (/\bdomani\b/.test(t)) return { g: piuGiorni(og, 1), detto: 'domani' };
  if (/\b(oggi|stasera|a pranzo|a cena|oggi stesso)\b/.test(t)) return { g: og, detto: 'oggi' };
  const fra = /\b(fra|tra) (\w+) giorn/.exec(t); if (fra) { const n = numeroDetto(fra[2]); if (n) return { g: piuGiorni(og, n), detto: `fra ${n} giorni` }; }
  if (/\bnatale\b/.test(t)) { const na = S.impostazioni.natale; return { g: na && na.attivo && na.entro ? na.entro : `${og.slice(0, 4)}-12-24`, detto: 'Natale' }; }
  for (let i = 0; i < 7; i++) {
    const m = new RegExp(`\\b${GIORNI_VOCE[i]}\\b( (prossim[oa]|che viene))?`).exec(t);
    if (!m) continue;
    let avanti = (i - d.getDay() + 7) % 7;
    if (avanti === 0 && (m[2] || /\bprossim/.test(t))) avanti = 7;
    return { g: piuGiorni(og, avanti), detto: GIORNI_VOCE[i] };
  }
  if (/\b(fine settimana|weekend|week end)\b/.test(t)) return { g: piuGiorni(og, (6 - d.getDay() + 7) % 7 || 7), detto: 'il fine settimana' };
  const data = /\b(\d{1,2})( di)? (gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\b/.exec(t);
  if (data) { const me = MESI_VOCE.indexOf(data[3]) + 1; let anno = d.getFullYear(); if (me < d.getMonth() + 1) anno++; return { g: `${anno}-${String(me).padStart(2, '0')}-${String(data[1]).padStart(2, '0')}`, detto: `il ${data[1]} ${data[3]}` }; }
  const solo = /\b(il|per il|entro il) (\d{1,2})\b(?! (euro|chil|tegl|pezz|etti|persone|porzion))/.exec(t);
  if (solo) { const n = Number(solo[2]); if (n >= 1 && n <= 31) { let me = d.getMonth() + 1, anno = d.getFullYear(); if (n < d.getDate()) { me++; if (me > 12) { me = 1; anno++; } } return { g: `${anno}-${String(me).padStart(2, '0')}-${String(n).padStart(2, '0')}`, detto: `il ${n}` }; } }
  return null;
}

/* ---------- i piatti nominati: con tolleranza, sinonimi, gusti; ambiguità → alternative ---------- */
function piattiVoce(tok, usatiQta, scelte, sin) {
  const cand = [];
  visibili().forEach(p => {
    const parole = paroleMenu(p.nome, sin); if (!parole.length) return;
    let somma = 0, pos = [], forte = false;
    parole.forEach(w => {
      let best = 0, bi = -1, due = false;
      for (let i = 0; i < tok.length; i++) {
        if (usatiQta.has(i)) continue;
        let s = tok[i].length >= 3 ? simileVoce(tok[i], w) : 0, d = false;
        if (i + 1 < tok.length && !usatiQta.has(i + 1) && tok[i].length <= 4) { const s2 = simileVoce(tok[i] + tok[i + 1], w); if (s2 > s) { s = s2; d = true; } }
        if (s > best) { best = s; bi = i; due = d; }
      }
      if (best >= 0.7) { somma += best; pos.push(bi); if (due) pos.push(bi + 1); if (best >= 0.85) forte = true; }
    });
    if (!forte) return;
    let gusto = null;
    (p.varianti || []).forEach(v => { if (gusto) return; paroleMenu(v.nome, sin).forEach(w => { tok.forEach((x, i) => { if (!gusto && !usatiQta.has(i) && x.length >= 4 && simileVoce(x, w) >= 0.85) gusto = { id: v.id, nome: v.nome, i }; }); }); });
    let punti = somma / parole.length;
    if (gusto) { punti += 0.5; pos.push(gusto.i); }
    cand.push({ p, punti, pos: [...new Set(pos)].sort((a, b) => a - b), gusto, esatto: !gusto && punti >= 1 && parole.length === pos.length });
  });
  cand.sort((a, b) => b.punti - a.punti || a.pos[0] - b.pos[0]);
  const menzioni = [], presi = new Set();
  cand.forEach(c => {
    if (c.pos.some(i => presi.has(i))) {   // stessi suoni già presi da un piatto più forte: è un'alternativa, se vicina
      const m = menzioni.find(m => m.pos.some(i => c.pos.includes(i)));
      if (m && c.punti >= m.punti - 0.15 && m.alt.length < 3 && !m.esatto) m.alt.push(c);
      return;
    }
    c.pos.forEach(i => presi.add(i));
    menzioni.push(Object.assign({ alt: [] }, c));
  });
  menzioni.sort((a, b) => a.pos[0] - b.pos[0]);
  return menzioni.map((m, idx) => {
    const forzato = scelte && scelte[idx] ? [m, ...m.alt].find(x => x.p.id === scelte[idx]) : null;
    if (forzato) return Object.assign({}, forzato, { alt: [], pos: m.pos, ambiguo: false });
    return Object.assign(m, { ambiguo: m.alt.length > 0 && !m.esatto });
  });
}
/* il formato giusto per quello che ha detto: teglia da 8 / grande / al chilo / pezzi; se non dice nulla il primo */
function formatoVoce(p, g) {
  const ff = p.formati || []; if (!ff.length) return null;
  const teglie = ff.filter(f => f.tipo === 'teglia' || f.tipo === 'intera');
  if (g) {
    if (g.unita === 'kg') return ff.find(f => f.tipo === 'kg') || ff[0];
    if (g.unita === 'pz') return ff.find(f => f.tipo === 'pz') || ff[0];
    if (g.porz) { const n = g.porz, porzDi = f => f.porzioni || Number((f.nome.match(/\d+/) || [0])[0]); return teglie.find(f => porzDi(f) === n) || teglie.slice().sort((a, b) => Math.abs(porzDi(a) - n) - Math.abs(porzDi(b) - n))[0] || ff[0]; }
    if (g.grande === 'grande') return teglie[teglie.length - 1] || ff[ff.length - 1];
    if (g.grande === 'piccola') return teglie[0] || ff[0];
  }
  return teglie[0] || ff[0];
}
const qtaVoce = (f, q) => { const n = typeof NUM !== 'undefined' ? NUM.format(q) : String(q); return f.tipo === 'kg' ? `${n} kg` : f.tipo === 'teglia' ? `${q} ${q === 1 ? 'teglia' : 'teglie'} da ${(f.nome.match(/\d+/) || [f.porzioni || ''])[0]}`.trim() : f.tipo === 'intera' ? `${q} ${q === 1 ? 'intera' : 'intere'}` : `${q} ${q === 1 ? 'pezzo' : 'pezzi'}`; };

/* ---------- l'intento della frase ---------- */
function intentoVoce(t, haPiatti, haQta) {
  const corto = t.split(' ').length <= 4, verbo = VERBI_ORDINE.test(t);
  if (/^(si|va bene|ok|okay|certo|esatto|giusto|perfetto|d accordo|confermo|conferma|metti pure|mettilo|mettila|mettili|vai|procedi|aggiungi pure)\b/.test(t) && corto && !haPiatti) return 'si';
  if (/^(no|non|lascia|lascia stare|lascia perdere|annulla|niente|basta|ferma|fermati|non ancora|no grazie)\b/.test(t) && corto && !haPiatti) return 'no';
  if (/^(ciao|buongiorno|buonasera|buonasera|salve|grazie|grazie mille|ok grazie)\b/.test(t) && corto && !haPiatti) return 'saluto';
  if (/\b(ripeti|ridillo|ridimmelo|non ho (capito|sentito)|cosa hai detto)\b/.test(t) && !haPiatti) return 'ripeti';
  if (/\b(cosa posso (dire|chiedere|chiederti)|come funzion\w*|cosa sai fare|aiuto|aiutami|istruzioni)\b/.test(t) && !haPiatti) return 'aiuto';
  if (/\b(lo stesso|le stesse cose|come|uguale|quello) (dell|dall|della|all|dalla|l)?\s?(ultima|scorsa|altra) volta|\brifai\b|ordina di nuovo|il solito|come sempre|la solita\b/.test(t)) return 'rifai';
  if (/\b(apri|vai|portami|fammi vedere|mostrami|andiamo)\b.{0,14}\b(carrello|menu|ordini)\b/.test(t) || /^(il )?(carrello|menu|i miei ordini)$/.test(t)) return 'apri';
  if (/\b(scriv\w*|chied\w*|parl\w*|manda\w*|contatt\w*|messaggio|chiamo|chiama)\b.{0,10}\bmonica\b/.test(t)) return 'monica';
  if (/\b(mio|miei) ordin|a che punto|hai confermato|stato dell ordine|ordine (e )?(pronto|confermato)/.test(t)) return 'stato';
  if (!haPiatti && !haQta && /\be pronto\b|\bsono pronti\b|quando (e|sara|saranno) pront|quando (lo |li )?(ritiro|passo|vengo)/.test(t)) return 'stato';
  if (!haQta && !verbo && /\b(pront[oi] (subito|oggi|adesso|ora)|cosa c e (gia )?(di )?pronto|qualcosa (di )?(gia )?pronto|gia pronto|pronti subito|pronto|pronti|subito|adesso|per oggi|per stasera|oggi stesso)\b/.test(t)) return 'pronti';
  if (/\b(consigli\w*|suggerisc\w*|cosa (mi )?(prendo|scelgo|consigli)|specialit\w*|cosa c e di buono|piatto del giorno|novita|cosa (c e|avete|hai|cucini|cucina|fa|prepara) (oggi|di buono|nel menu|questa settimana)|menu di oggi|cosa (mi )?conviene|il piu (buono|richiesto|amato))\b/.test(t)) return 'consiglio';
  if (!haQta && !verbo && /\b(ha|hanno|c e|ci sono|contiene|contengono|e con|sono con|va bene per|vanno bene per|adatt[oi] a)\b.{0,12}\b(glutine|lattosio|arachid\w*|crostace\w*|sedano|soia|frutta a guscio|noci|nocciol\w*|mandorl\w*|uova|uovo|latte|latticin\w*|pesce|senape|sesamo|lupin\w*|mollusch\w*|solfit\w*|celiac\w*|vegetarian\w*|vegan\w*)\b/.test(t)) return 'allergeni';   // «il tiramisù ha il glutine?»
  if (!haQta && /\b(allergi\w*|intolleran\w*|celiac\w*|vegetarian\w*|vegan\w*|posso mangiar\w*|contiene|contengono|cosa c e dentro|c e dentro|ingredient\w*|fatt[oi] con|senza (glutine|lattosio|latte|uova|noci|frutta|pesce|crostacei|soia|sedano|formaggio|carne))\b/.test(t)) return 'allergeni';
  if (!haQta && /\b(quanto (costa|costano|viene|vengono|e il prezzo|si paga|spendo)|prezz\w*|costo|costa)\b/.test(t)) return 'prezzo';
  if (/\b(orari\w*|a che ora|dove (si ritira|ritiro|sei|siete|vengo)|come (si )?paga|pagare|pago|contanti|bonifico|postepay|quanto (prima|anticipo)|quanti giorni (prima|di anticipo)|come (si )?ordina|come faccio a ordinare|indirizzo|consegn\w* a casa|a domicilio|minimo)\b/.test(t)) return 'info';
  if (haPiatti && (haQta || verbo || /\bper (sabato|domenica|lunedi|martedi|mercoledi|giovedi|venerdi|domani|dopodomani|natale|il \d)/.test(t))) return 'ordina';
  if (haPiatti) return 'piatto';
  if (haQta) return 'ordina';
  return '';
}

/* ---------- il cuore: la frase → cosa vuole, con la risposta pronta (senza rete) ---------- */
function capisciCliente(testo, scelte) {
  const originale = String(testo || '').trim(), sin = sinonimiVoce();
  const t = applicaSinonimi(vcS(originale), sin), tok = t.split(' ').filter(Boolean);
  const paroleTutte = new Set(visibili().flatMap(p => paroleMenu(p.nome, sin).concat((p.varianti || []).flatMap(v => paroleMenu(v.nome, sin)))));
  const eMenu = w => [...paroleTutte].some(x => simileVoce(w, x) >= 0.85);
  const { gruppi, usati } = quantitaDette(tok, eMenu);
  const menzioni = piattiVoce(tok, usati, scelte, sin), gg = giornoDetto(tok);
  const intento = intentoVoce(t, menzioni.length > 0, gruppi.length > 0);
  const esito = { intento, piatti: menzioni.map(m => ({ id: m.p.id, nome: m.p.nome, gusto: m.gusto ? m.gusto.id : '', ambiguo: m.ambiguo })), giorno: gg ? gg.g : null, giornoDetto: gg ? gg.detto : '', quantita: gruppi.map(g => g.q), confidenza: 0, risposta: null, alternative: [], originale };
  esito.indizi = { intento: intento || 'non chiaro', piatti: esito.piatti.map(x => `${x.nome} (id ${x.id})`), numeri: gruppi.map(g => `${g.q}${g.unita ? ' ' + g.unita : ''}`), giorno: esito.giorno };
  menzioni.forEach((m, idx) => { if (m.ambiguo) [m, ...m.alt].forEach(c => esito.alternative.push({ nome: c.p.nome, testo: originale, scelte: Object.assign({}, scelte || {}, { [idx]: c.p.id }) })); });
  const r = rispostaLocale(esito, menzioni, gruppi, t);
  esito.risposta = r.risposta; esito.confidenza = r.confidenza; if (r.giorno !== undefined) esito.giorno = r.giorno;
  return esito;
}
function rispostaLocale(e, menzioni, gruppi, t) {
  const imp = S.impostazioni, ess = esempiVoce(), p0 = menzioni[0] ? menzioni[0].p : null;
  const tok = t.split(' ');
  const chiedi = (testo, azioni, conf) => ({ risposta: { testo, azioni: azioni || [] }, confidenza: conf });
  const prezzi = (p, gusto) => p.formati.map(x => `${x.nome.toLowerCase()} ${euro(prezzoDi(p, x.id, gusto || ''))}`).join(', ');
  const ambigua = menzioni.find(m => m.ambiguo);
  if (ambigua && ['ordina', 'piatto', 'prezzo', 'allergeni', 'pronti', ''].includes(e.intento)) {
    const nomi = [ambigua, ...ambigua.alt].map(c => c.p.nome);
    return chiedi(`Quale intendi? ${nomi.slice(0, -1).join(', ')} o ${nomi[nomi.length - 1]}?`, [], 0.7);
  }
  if (p0 && !p0.disponibile && ['ordina', 'piatto', 'prezzo', 'pronti', ''].includes(e.intento)) {
    const altri = visibili().filter(p => p.disponibile && p.cat === p0.cat && p.id !== p0.id).slice(0, 3);
    return chiedi(`${p0.nome} oggi non è nel menù.${altri.length ? ` Nella stessa parte ci sono ${altri.map(p => p.nome).join(', ')}.` : ''} Vuoi altro?`, altri.slice(0, 2).map(p => ({ azione: 'piatto', id: p.id })), 0.85);
  }
  switch (e.intento) {
    case 'si': return chiedi('Va bene.', [], 0.95);
    case 'no': return chiedi('Lascio stare.', [], 0.95);
    case 'saluto': return chiedi(/grazie/.test(t) ? 'Di niente! Se vuoi altro, sono qui.' : `Ciao! Dimmi cosa ti va: per esempio ${ess[0]}.`, [], 0.9);
    case 'ripeti': { const ult = AIC.msgs.slice().reverse().find(m => m.chi === 'lei' && m.t); return chiedi(ult ? ult.t : 'Non ho ancora detto nulla: chiedimi del menù o dimmi cosa vuoi ordinare.', [], 0.9); }
    case 'aiuto': return chiedi(`Puoi dirmi, per esempio: ${ess.join(' · ')}. Oppure tocca «Dettami l'ordine» e dimmi tutto in una frase.`, [], 0.95);
    case 'apri': { const v = /carrello/.test(t) ? 'carrello' : /ordini/.test(t) ? 'ordini' : 'menu'; return chiedi(`Ti porto ${v === 'carrello' ? 'al carrello' : v === 'ordini' ? 'ai tuoi ordini' : 'al menù'}.`, [{ azione: 'apri', vista: v }], 0.9); }
    case 'monica': { const msg = e.originale.replace(/^.*?monica\b[:,]?\s*(che|se|di)?\s*/i, '').trim() || e.originale; return chiedi(imp.whatsapp ? 'Preparo il messaggio per Monica: tocca «Apri WhatsApp» e mandalo tu.' : 'Monica non ha ancora messo il suo WhatsApp nell\'app: la trovi al ritiro.', imp.whatsapp ? [{ azione: 'scrivi_monica', testo: msg.slice(0, 300) }] : [], 0.9); }
    case 'rifai': {
      const o = S.ordini.filter(o => o.cliente === P.cliente && o.stato === 'ritirato').sort((a, b) => b.entro.localeCompare(a.entro) || b.n - a.n)[0];
      if (!o) return chiedi(`Non trovo un tuo ordine passato da rifare. Dimmi cosa vuoi: per esempio ${ess[0]}.`, [], 0.85);
      const az = o.righe.map(r => ({ azione: 'carrello', id: r.piatto, formato: r.formato, qta: r.qta, gusto: r.variante || '' })).filter(a => { const p = piatto(a.id); return p && !p.cestino && p.disponibile; }).slice(0, 4);
      return chiedi(az.length ? `L'ultima volta hai preso ${o.righe.map(r => r.nome).join(', ')}. Rimetto tutto nel carrello?` : 'I piatti dell\'ultima volta oggi non ci sono nel menù. Vuoi scegliere qualcos\'altro?', az, 0.9);
    }
    case 'stato': {
      const miei = S.ordini.filter(o => o.cliente === P.cliente && o.stato !== 'prova' && !o.archiviato && ['nuovo', 'proposta', 'accettato', 'pronto', 'daApprovare'].includes(o.stato)).sort((a, b) => b.n - a.n);
      if (!miei.length) return chiedi(`Non hai ordini in corso. Vuoi ordinare qualcosa? Dimmi per esempio ${ess[0]}.`, [{ azione: 'apri', vista: 'menu' }], 0.85);
      const o = miei[0], st = typeof STATO_CLIENTE !== 'undefined' ? STATO_CLIENTE[o.stato] || o.stato : o.stato;
      const extra = { pronto: ' Puoi passare a ritirarlo.', proposta: ' Monica ti ha proposto un altro giorno: rispondi dai tuoi ordini.', accettato: ' Quando è pronto ti avviso.', daApprovare: ' Monica deve ancora accettarti come cliente.' }[o.stato] || ' Monica deve ancora confermarlo.';
      return chiedi(`Il tuo ordine n. ${o.n} per ${giornoLungo(o.entro)} è «${st}».${extra}${miei.length > 1 ? ` Hai altri ${miei.length - 1} ordini in corso.` : ''}`, [{ azione: 'apri', vista: 'ordini' }], 0.9);
    }
    case 'pronti': {
      const pr = prontiOggi();
      if (p0) { const f = p0.formati.find(x => x.id === (p0.pronto || {}).formato) || p0.formati[0]; return pr.includes(p0) ? chiedi(`Sì! ${p0.nome}: ${qtaTesto(f.tipo, p0.pronto.qta, f.nome)} già pronti, ${euro(prezzoDi(p0, f.id))}${f.tipo === 'kg' ? ' al kg' : ''}, da ritirare oggi entro le ${imp.prontiFino}. Lo prendi?`, [{ azione: 'piatto', id: p0.id }], 0.9) : chiedi(`${p0.nome} oggi non è tra i piatti già pronti: puoi ordinarlo per i prossimi giorni. Lo metto nel carrello?`, [{ azione: 'carrello', id: p0.id, formato: f.id, qta: f.min || 1 }], 0.85); }
      if (!pr.length) { const g = giorniPossibili(0).find(x => !x.no); return chiedi(`Oggi non c'è niente di già pronto. Puoi ordinare per i prossimi giorni${g ? `: il primo è ${giornoLungo(g.g)}` : ''}. Dimmi cosa ti va!`, [], 0.9); }
      const righe = pr.slice(0, 5).map(p => { const f = p.formati.find(x => x.id === p.pronto.formato) || p.formati[0]; return `${p.nome} (${qtaTesto(f.tipo, p.pronto.qta, f.nome)}, ${euro(prezzoDi(p, f.id))}${f.tipo === 'kg' ? ' al kg' : ''})`; });
      return chiedi(`Pronti da ritirare oggi entro le ${imp.prontiFino}: ${righe.join('; ')}. Ne vuoi uno?`, pr.slice(0, 3).map(p => ({ azione: 'piatto', id: p.id })), 0.9);
    }
    case 'consiglio': {
      const sicuro = p => !(p.ing || []).length || !allergeniDi(p.ing).some(a => P.allergie.includes(a));
      const disp = visibili().filter(p => p.disponibile && sicuro(p)), miei = S.ordini.filter(o => o.cliente === P.cliente && o.stato === 'ritirato').flatMap(o => o.righe.map(r => r.piatto));
      const scelti = [], agg = (p, perche) => { if (p && !scelti.some(s => s.p.id === p.id) && scelti.length < 3) scelti.push({ p, perche }); };
      prontiOggi().filter(sicuro).forEach(p => agg(p, 'già pronto oggi'));
      disp.filter(p => typeof novita === 'function' && novita(p)).forEach(p => agg(p, 'novità'));
      disp.filter(p => p.cuori >= 3).sort((a, b) => b.cuori - a.cuori).forEach(p => agg(p, 'tra i più amati'));
      disp.filter(p => miei.includes(p.id)).forEach(p => agg(p, 'l\'hai già preso'));
      disp.forEach(p => agg(p, ''));
      if (!scelti.length) return chiedi('Oggi il menù è ancora vuoto: Monica lo sta preparando. Torna a trovarci presto!', [], 0.85);
      const frase = scelti.map(s => `${s.p.nome}${s.perche ? ` (${s.perche})` : ''}, ${euro(prezzoDi(s.p, s.p.formati[0].id))}${s.p.formati[0].tipo === 'kg' ? ' al kg' : ''}`).join('; ');
      return chiedi(`Ti consiglio: ${frase}.${P.allergie.length ? ' Ho tolto i piatti con le tue allergie.' : ''} Vuoi che ne metta uno nel carrello?`, scelti.map(s => ({ azione: 'piatto', id: s.p.id })), 0.9);
    }
    case 'allergeni': {
      const nomeAll = a => (typeof NOME_ALL !== 'undefined' && NOME_ALL[a] ? NOME_ALL[a] : a).toLowerCase();
      const dettiAll = [...new Set(tok.flatMap(w => Object.keys(PAROLE_ALLERGENI).filter(k => w.startsWith(k)).map(k => PAROLE_ALLERGENI[k])))], veg = /vegetarian|vegan|senza carne/.test(t);
      if (p0) {
        const ing = p0.ing || [];
        if (!ing.length) return chiedi(`Gli ingredienti di ${p0.nome} Monica non li ha ancora scritti nell'app: chiedili a lei prima di ordinare.`, imp.whatsapp ? [{ azione: 'scrivi_monica', testo: `Ciao Monica, ${p0.nome}: che ingredienti ha? Ho un'allergia.` }] : [{ azione: 'piatto', id: p0.id }], 0.85);
        const all = allergeniDi(ing), mie = all.filter(a => P.allergie.includes(a)), chiesti = dettiAll.filter(a => all.includes(a));
        let testo = `${p0.nome}: ${ing.map(i => ING(i).n.toLowerCase()).join(', ')}.` + (all.length ? ` Allergeni scritti da Monica: ${all.map(nomeAll).join(', ')}.` : ' Nessun allergene segnato da Monica.');
        if (dettiAll.length) testo += chiesti.length ? ` Sì, contiene ${chiesti.map(nomeAll).join(' e ')}.` : ` Non risulta ${dettiAll.map(nomeAll).join(' né ')}.`;
        if (veg) testo += ing.some(i => ING(i).m) ? ' Non è vegetariano.' : ' È vegetariano.';
        if (mie.length) testo += ` Attenzione: ${mie.map(nomeAll).join(', ')} è tra le tue allergie.`;
        return chiedi(testo + ' Per sicurezza chiedi sempre conferma a Monica.', [{ azione: 'piatto', id: p0.id }], 0.9);
      }
      if (!dettiAll.length && !veg && !P.allergie.length) return chiedi(/\b(mie|mia|le mie)\b/.test(t) ? 'Non hai ancora segnato allergie: nel menù tocca «Hai allergie?» e poi te lo dico.' : 'Dimmi di quale piatto vuoi sapere gli ingredienti, o quale allergia hai: per esempio «cosa posso mangiare senza glutine?».', [], 0.85);
      const evita = dettiAll.length ? dettiAll : P.allergie;
      const ok = visibili().filter(p => p.disponibile && (p.ing || []).length && !allergeniDi(p.ing).some(a => evita.includes(a)) && (!veg || !p.ing.some(i => ING(i).m)));
      const cosa = veg && !evita.length ? 'vegetariani' : `senza ${evita.map(nomeAll).join(', ')}`;
      return chiedi(ok.length ? `Piatti ${cosa}, secondo gli ingredienti scritti da Monica: ${ok.slice(0, 6).map(p => p.nome).join(', ')}${ok.length > 6 ? ' e altri' : ''}. Per sicurezza chiedi conferma a Monica.` : `Non trovo piatti ${cosa} tra quelli con gli ingredienti scritti. Chiedi a Monica: lei sa tutto dei suoi piatti.`, ok.slice(0, 3).map(p => ({ azione: 'piatto', id: p.id })), 0.9);
    }
    case 'prezzo': {
      if (!p0) return chiedi(`Di quale piatto vuoi sapere il prezzo? Per esempio «quanto costa ${(visibili().find(p => p.disponibile) || { nome: 'la parmigiana' }).nome.toLowerCase()}?».`, [], 0.8);
      return chiedi(menzioni.slice(0, 3).map(m => `${m.p.nome}: ${prezzi(m.p, m.gusto && m.gusto.id)}`).join('. ') + '. Lo metto nel carrello?', menzioni.slice(0, 3).map(m => ({ azione: 'piatto', id: m.p.id })), 0.9);
    }
    case 'info': {
      const pezzi = [], anticipo = `${imp.anticipo} ${imp.anticipo === 1 ? 'giorno' : 'giorni'}`;
      if (/orari|a che ora|quando/.test(t) && vcOpz('orari', '')) pezzi.push(`Orari di ritiro: ${vcOpz('orari', '')}.`);
      if (/pag|contanti|bonifico|postepay/.test(t)) pezzi.push(`Si paga ${Object.keys(METODO).filter(m => imp.paga[m]).map(m => METODO[m].toLowerCase()).join(' o ') || 'in contanti al ritiro'}${vcOpz('altroPagare', '') ? `, oppure ${vcOpz('altroPagare', '')}` : ''}.`);
      if (/dove|indirizzo|ritir|consegn|domicilio/.test(t)) pezzi.push('Si ritira da Monica, a Olbia: l\'indirizzo esatto lo trovi nell\'ordine quando è pronto. Niente consegne a casa.');
      if (/prima|anticipo|giorni|ordina/.test(t)) pezzi.push(`Si ordina con ${anticipo} di anticipo${vcOpz('oraLimite', '') ? `, entro le ${vcOpz('oraLimite', '')}` : ''}; Monica conferma il giorno dall'app.`);
      if (/minimo/.test(t)) pezzi.push(vcOpz('minimo', 0) > 0 ? `L'ordine minimo è ${euro(vcOpz('minimo', 0))}.` : 'Non c\'è un ordine minimo.');
      if (!pezzi.length) pezzi.push(`Scegli dal menù, metti nel carrello e tocca «Invia»: Monica conferma il giorno. Si ordina con ${anticipo} di anticipo${vcOpz('orari', '') ? `; orari di ritiro ${vcOpz('orari', '')}` : ''}.`);
      return chiedi(pezzi.join(' '), [], 0.85);
    }
    case 'piatto': { const f = formatoVoce(p0, null), g = menzioni[0].gusto; return chiedi(`${p0.nome}${p0.sotto ? ', ' + p0.sotto.toLowerCase() : ''}: ${prezzi(p0, g && g.id)}. Lo metto nel carrello?`, [{ azione: 'carrello', id: p0.id, formato: f ? f.id : '', qta: f ? (f.min || 1) : 1, gusto: g ? g.id : '' }], 0.75); }
    case 'ordina': {
      if (!menzioni.length) return chiedi(`Ho capito la quantità${e.giorno ? ` e il giorno (${giornoLungo(e.giorno)})` : ''}, ma non il piatto. Quale vuoi? Per esempio ${ess[0]}.`, [], 0.3);
      // ogni quantità va al piatto più vicino (prima quello dopo di lei: «due teglie di lasagne»)
      const assegnate = menzioni.map(() => null);
      gruppi.forEach(g => {
        let best = -1, bd = 1e9;
        menzioni.forEach((m, i) => { if (assegnate[i]) return; const d = m.pos[0] > g.fine ? m.pos[0] - g.fine : g.ini - m.pos[m.pos.length - 1] + 0.5; if (d < bd) { bd = d; best = i; } });
        if (best >= 0) assegnate[best] = g;
      });
      const az = [], descr = []; let nota = '', teglie = P.carrello.filter(r => !r.pronto && (r.tipo === 'teglia' || r.tipo === 'intera')).reduce((s, r) => s + r.qta, 0);
      menzioni.slice(0, 4).forEach((m, i) => {
        const p = m.p, g = assegnate[i], f = formatoVoce(p, g); if (!f) return;
        const { min, passo: st } = passoDi(f);
        let q = g ? g.q : min;
        if (g && !g.unita && f.tipo === 'kg' && q >= 3 && q / 10 >= min) q = q / 10;   // «tre polpette» su un piatto al chilo: tre etti
        const qq = Math.max(min, Math.min(f.tipo === 'kg' ? 20 : 30, Math.round(q / st) * st));
        if (g && Math.abs(qq - q) > 0.01) nota += ` ${p.nome}: ${qtaVoce(f, qq)} è il minimo che Monica prepara.`;
        if (f.tipo === 'teglia' || f.tipo === 'intera') teglie += qq;
        az.push({ azione: 'carrello', id: p.id, formato: f.id, qta: qq, gusto: m.gusto ? m.gusto.id : '' });
        descr.push(`${qtaVoce(f, qq)} di ${p.nome}${m.gusto ? ' ' + m.gusto.nome.toLowerCase() : p.varianti.length > 1 ? ' (gusto da scegliere)' : ''}`);
      });
      let giorno = e.giorno;
      if (giorno) {
        const gp = giorniPossibili(teglie), tr = gp.find(x => x.g === giorno);
        if (!tr || tr.no) { const primo = gp.find(x => !x.no); nota += ` Per ${giornoLungo(giorno)} non si può${tr && tr.no ? ` (${tr.no.toLowerCase()})` : giorno < oggi() ? ' (è passato)' : ` (serve ${imp.anticipo} ${imp.anticipo === 1 ? 'giorno' : 'giorni'} di anticipo)`}: il primo giorno libero è ${primo ? giornoLungo(primo.g) : 'da chiedere a Monica'}.`; giorno = null; }
      }
      if (/\bsenza\b|\bpoco\b|\bpoca\b|\bben cott|\bnon troppo/.test(t)) nota += ' Le richieste particolari scrivile nella nota del carrello, così Monica le legge.';
      return { risposta: { testo: `Ecco: ${descr.join(', ')}${giorno ? `, per ${giornoLungo(giorno)}` : ''}.${nota}`, azioni: az }, confidenza: gruppi.length || menzioni.every(m => m.esatto) ? 0.9 : 0.8, giorno };
    }
    default: {
      if (p0) return chiedi(`${p0.nome}: ${prezzi(p0)}. Vuoi ordinarlo?`, [{ azione: 'piatto', id: p0.id }], 0.6);
      return chiedi(`Non ho capito bene. Prova con: ${ess.slice(0, 3).join(' · ')}.`, [], 0.2);
    }
  }
}
/* esempi veri sul menù di oggi (primo uso, «cosa posso dire?», intro dell'aiutante) */
function esempiVoce() {
  const disp = visibili().filter(p => p.disponibile), teglia = disp.find(p => p.formati.some(f => f.tipo === 'teglia')), kg = disp.find(p => p.formati.some(f => f.tipo === 'kg')), uno = disp[0];
  const libero = giorniPossibili(1).find(x => !x.no), giorno = libero ? GIORNI_VOCE[daIso(libero.g).getDay()] : 'sabato', out = [];
  if (teglia) out.push(`«Due teglie di ${teglia.nome.toLowerCase()} per ${giorno}»`);
  if (kg) out.push(`«Un chilo di ${kg.nome.toLowerCase()}»`);
  out.push('«Cosa c\'è di pronto oggi?»');
  if (uno) out.push(`«${uno.nome} ha il glutine?»`, `«Quanto costa ${uno.nome.toLowerCase()}?»`);
  out.push('«Il mio ordine è pronto?»');
  return out.slice(0, 5);
}
/* i prezzi e i chili letti bene dalla voce («12,50 €» → «dodici euro e cinquanta», «1,5 kg» → «un chilo e mezzo») */
function parolaNumero(n) {
  n = Math.round(n); if (n < 0 || n > 9999) return String(n);
  const u = ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
  const de = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];
  if (n < 20) return u[n];
  if (n < 100) { const d = Math.floor(n / 10), r = n % 10; return (r === 1 || r === 8 ? de[d].slice(0, -1) : de[d]) + (r ? u[r] : ''); }
  if (n < 1000) { const c = Math.floor(n / 100), r = n % 100; return (c === 1 ? 'cento' : u[c] + 'cento') + (r ? parolaNumero(r) : ''); }
  const m = Math.floor(n / 1000), r = n % 1000; return (m === 1 ? 'mille' : u[m] + 'mila') + (r ? parolaNumero(r) : '');
}
function perVoceCliente(t) {
  return String(t || '').replace(/[«»]/g, '').replace(/(\d+)[.,](\d\d)\s?€/g, (m, e, c) => `${parolaNumero(e)} euro${Number(c) ? ' e ' + parolaNumero(c) : ''}`).replace(/(\d+)\s?€/g, (m, e) => `${parolaNumero(e)} euro`)
    .replace(/(\d+)[,.](\d+)\s?kg/g, (m, a, b) => { const q = Number(a + '.' + b); return q === 0.5 ? 'mezzo chilo' : q === 1.5 ? 'un chilo e mezzo' : q < 1 ? `${parolaNumero(Math.round(q * 10))} etti` : /^50?$/.test(b) ? `${parolaNumero(a)} chili e mezzo` : `${q} chili`; })
    .replace(/\b1 kg\b/g, 'un chilo').replace(/(\d+) kg\b/g, (m, a) => `${parolaNumero(a)} chili`).replace(/\bn\. (\d+)/g, 'numero $1').replace(/ · /g, ', ').replace(/\s?×\s?/g, ' per ').replace(/\(([^)]*)\)/g, ', $1,');
}
/* «sì» o «no» (detto o scritto) sull'ultima proposta ancora aperta: true se l'ha gestito */
function rispondiSiNoCliente(intento) {
  const i = AIC.msgs.map((m, k) => (m.chi === 'lei' && m.piano && !m.esito ? k : -1)).filter(k => k >= 0).pop();
  if (i === undefined) return false;
  const m = AIC.msgs[i];
  if (intento === 'si') { if (!m.piano.some(x => x.on && controllaAIC(x.a).fai)) return false; A['ac-si']({ dataset: { i: String(i) } }); return true; }
  if (intento === 'no') { m.esito = 'no'; render(); if (m.voce && vcOpz('voceClientiRisponde', true)) parlaCliente('Va bene, lascio stare.'); return true; }
  return false;
}

/* ================= A. ASCOLTO ================= */
function ticVoce(alto) {
  try { const ac = VC.audio || (VC.audio = new (window.AudioContext || window.webkitAudioContext)()); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = alto ? 880 : 440; g.gain.value = 0.08; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.07); } catch (e) { /* senza suono */ }
  try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { /* iPhone non vibra */ }
}
const nomiPiattiVoce = () => visibili().filter(p => p.disponibile).map(p => p.nome).slice(0, 60);
function statoVC(stato, testo) {
  VC.stato = stato; VC.testo = testo || '';
  clearInterval(VC.tCap);
  if (stato === 'capisco') { VC.daCapisco = Date.now(); VC.tCap = setInterval(() => { if (VC.stato !== 'capisco') { clearInterval(VC.tCap); return; } const p = document.querySelector('#vc .vc-pannello p'); if (p) p.textContent = testoCapisco(); }, 500); }
  disegnaVC();
  if (UI.vista === 'aiuto' && stato === 'capito') { const el = $('#ac-testo'); if (el) el.value = VC.testo; }
  // C110: il microfono della pagina (Aiutante, barra del menù) si accende e si spegne subito, senza ridisegnare la pagina
  const su = ascoltoInCorso();
  document.querySelectorAll('.ai-mic[data-a="ac-detta"], .ai-mic[data-a="ai-detta"]').forEach(b => { b.classList.toggle('acceso', su); b.setAttribute('aria-label', su ? 'Smetti di ascoltare' : 'Chiedi a voce'); });
  const campo = document.getElementById('ac-testo'); if (campo) campo.placeholder = su ? 'Ti ascolto…' : 'Scrivi qui…';
}
/* attesa dell'ascolto preciso riempita (C110, Mario 09/11 «l'attesa bisogna riempirla se no sembra che non è partito») */
function testoCapisco() {
  const s = (Date.now() - (VC.daCapisco || Date.now())) / 1000;
  return s < 2.5 ? 'Sto capendo le parole…' : s < 6 ? 'Controllo i nomi dei piatti…' : s < 15 ? 'Ci metto un po\' più del solito: quasi fatto…' : 'La rete è lenta: ancora qualche secondo…';
}
const ascoltoInCorso = () => !!(VC.rec || VC.media || VC.stato === 'capisco' || VC.stato === 'avvio');
/* iPhone/iPad: la voce delle risposte parte solo se il primo speak() è dentro un tocco (la risposta arriva dopo la rete).
   Si chiama nel tocco del microfono, prima di ogni await: un «parla» muto sblocca la voce per tutta la pagina. */
function sbloccaVoceIOS() {
  try { const ac = VC.audio || (VC.audio = new (window.AudioContext || window.webkitAudioContext)()); if (ac.state === 'suspended') ac.resume(); } catch (e) { /* senza bip */ }
  if (!suiOS() || !window.speechSynthesis || VC.voceSbloccata) return;
  if (navigator.userActivation && !navigator.userActivation.isActive) return;   // non è un tocco vero: riprova al prossimo
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'it-IT'; speechSynthesis.speak(u); VC.voceSbloccata = true; } catch (e) { /* resta il tasto «Ascolta» */ }
}
/* iPhone/iPad (Safari 17+): dice al telefono cosa facciamo; col microfono aperto la voce del telefono va bassa, dopo torna normale */
function sessioneAudio(tipo) { try { if (suiOS() && navigator.audioSession) navigator.audioSession.type = tipo; } catch (e) { /* telefono senza Audio Session */ } }
function fermaAscoltoCliente() {
  clearTimeout(VC.tGuardia);
  if (VC.stato === 'avvio') { VC.giro++; statoVC('', ''); return; }   // il microfono non è ancora acceso: annullo prima che parta
  if (VC.rec) { try { VC.rec.stop(); } catch (e) { /* già fermo */ } }
  if (VC.media && VC.media.state === 'recording') { try { VC.media.stop(); } catch (e) { VC.media = null; } }
}
/* aiutante di MONICA (aiutante.js): dove il riconoscitore del telefono non parte (iPad/iPhone con l'app sulla Home, PT E39) detta con l'ascolto preciso */
const dettaturaServe = () => !telefonoAscoltaBene() && !!(navigator.mediaDevices && window.MediaRecorder);
function dettaConAscoltoPreciso(manda) {
  if (ascoltoInCorso()) { fermaAscoltoCliente(); return; }
  if (typeof fermaVoce === 'function') fermaVoce();
  VC.perSi = null; VC.dettato = false; VC.giro++;
  registraCliente({ manda });
}
const puoAscoltoPreciso = () => navigator.onLine && !!(navigator.mediaDevices && window.MediaRecorder) && ((typeof sulSito === 'function' && sulSito()) || !!window.ascoltaServerFinto);
/* tocco sul microfono: il telefono ascolta; se non ce la fa (errore, muto per 8 s, frase senza senso) passa all'ascolto preciso.
   «Dettami l'ordine» parte subito con l'ascolto preciso: il telefono taglia alla prima pausa, una frase lunga no. */
function ascoltaCliente(o = {}) {
  if (ascoltoInCorso()) { fermaAscoltoCliente(); return; }
  if (typeof fermaVoce === 'function') fermaVoce();
  try { localStorage.setItem('pit-vc-visto', '1'); } catch (e) { /* niente */ }
  VC.perSi = o.perSi == null ? null : o.perSi; VC.dettato = !!o.dettato; VC.giro++;
  const R = riconoscitore(), motore = o.perSi != null ? 'telefono' : vcOpz('voceClientiMotore', 'auto');   // il «sì»/«no» lo sente il telefono (gratis, subito); senza riconoscitore resta il tocco su Conferma
  if (o.perSi != null && !vocePuoSentireSi()) return;
  if (motore === 'preciso' || (motore === 'auto' && (!R || !telefonoAscoltaBene() || VC.precisoDopo || ((o.dettato || suiOS()) && puoAscoltoPreciso())))) { VC.precisoDopo = false; registraCliente(o); return; }
  if (!R) { mostraToast('Questo telefono non sa dettare: scrivi la frase.'); return; }
  const rec = new R(), giro = VC.giro; let finali = [], interim = '', avuto = false;
  rec.lang = 'it-IT'; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
  rec.onresult = ev => {
    avuto = true; clearTimeout(VC.tGuardia); interim = '';
    for (let i = ev.resultIndex || 0; i < ev.results.length; i++) { const r = ev.results[i]; if (r.isFinal) finali.push([...Array(Math.min(5, r.length)).keys()].map(k => r[k].transcript)); else interim += r[0].transcript; }
    statoVC('ascolto', (finali.map(a => a[0]).join(' ') + ' ' + interim).trim());
  };
  rec.onerror = ev => {
    VC.errore = ev.error;
    if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') mostraToast('Per parlare serve il microfono: tocca «Consenti» quando il telefono lo chiede.');
    else if (ev.error === 'no-speech') mostraToast('Non ho sentito nulla: riprova tenendo il telefono vicino.');
  };
  rec.onend = () => {
    if (VC.rec !== rec) return;
    VC.rec = null; clearTimeout(VC.tGuardia); ticVoce(false);
    const err = VC.errore; VC.errore = '';
    if (!finali.length && interim) finali = [[interim]];
    if (!finali.length) {
      if (motore === 'auto' && err && !['no-speech', 'aborted'].includes(err) && puoAscoltoPreciso()) { registraCliente(o); return; }   // anche «not-allowed»: il microfono vero lo chiede getUserMedia
      statoVC('', ''); return;
    }
    const scelto = scegliAlternativa(finali);
    if (motore === 'auto' && scelto.confidenza < 0.6 && puoAscoltoPreciso() && o.perSi == null && !VC.giaPreciso) { VC.giaPreciso = true; statoVC('capito', scelto.testo); mostraToast('Non sono sicura di aver capito: ripeti, ti ascolto con più attenzione.'); registraCliente(o); return; }
    VC.giaPreciso = false;
    consegnaDetto(scelto.testo, o);
  };
  VC.rec = rec; VC.errore = '';
  try { rec.start(); } catch (e) { VC.rec = null; mostraToast('Il microfono non parte: riprova.'); return; }
  ticVoce(true); statoVC('ascolto', '');
  // cane da guardia (bug iPhone: dopo un audio la dettatura resta muta): nessun segno entro 8 s (4 su iPhone e iPad) → ascolto preciso
  VC.tGuardia = setTimeout(() => { if (VC.rec !== rec || avuto || VC.giro !== giro) return; VC.rec = null; try { rec.abort(); } catch (e) { /* niente */ } if (motore === 'auto' && puoAscoltoPreciso()) registraCliente(o); else { statoVC('', ''); mostraToast('Non ho sentito nulla: riprova.'); } }, suiOS() ? 4000 : 8000);
}
/* fra le frasi che il telefono propone vince quella che ha più senso sul menù */
function scegliAlternativa(finali) {
  const combinazioni = [finali.map(a => a[0]).join(' ')];
  finali.forEach((alts, i) => alts.slice(1).forEach(alt => combinazioni.push(finali.map((a, j) => (j === i ? alt : a[0])).join(' '))));
  let best = null;
  const sin = sinonimiVoce();
  combinazioni.forEach(c => { const e = capisciCliente(c), punti = e.confidenza + (e.piatti.length ? 0.3 : 0) - (e.piatti.some(p => p.ambiguo) ? 0.1 : 0) + (applicaSinonimi(vcS(c), sin) === vcS(c) ? 0.05 : 0); /* a parità vince la frase già giusta («lasagne», non «la sagne») */ if (!best || punti > best.punti) best = { testo: c.trim(), confidenza: e.confidenza, punti }; });
  return best;
}
/* giorni spezzati o storpiati da Whisper (Voce 5, 09/11: Mario ha detto «per sabato», scritto «persa a Mato»):
   «sa bato» → «sabato», «dopo domani» → «dopodomani» (sennò vale «domani»!) sempre; «persa a Mato» → «per sabato» solo come
   frase in più da confrontare (scegliTrascrizione), e solo dopo «per/entro» o attaccato a «per», mai a caso («salato» resta). */
const GIORNI_SCRITTI = { domenica: 'domenica', lunedi: 'lunedì', martedi: 'martedì', mercoledi: 'mercoledì', giovedi: 'giovedì', venerdi: 'venerdì', sabato: 'sabato' };
function ritoccaGiorni(testo) {
  const w = String(testo || '').replace(/\bdopo domani\b/gi, 'dopodomani').split(' ');
  for (let i = 0; i < w.length - 1; i++) {
    const unito = vcS(w[i] + w[i + 1]);
    if (unito in GIORNI_SCRITTI && !(vcS(w[i]) in GIORNI_SCRITTI)) w.splice(i, 2, GIORNI_SCRITTI[unito] + ((/[.,!?;:]+$/.exec(w[i + 1]) || [''])[0]));
  }
  return w.join(' ');
}
function giornoSimile(testo) {
  const w = String(testo || '').split(' '), s = w.map(vcS);
  if (s.some(x => x in GIORNI_SCRITTI || /^(oggi|domani|dopodomani|stasera)$/.test(x))) return '';
  for (let i = 0; i < w.length; i++) for (let n = 1; n <= 3 && i + n <= w.length; n++) {
    const unito = s.slice(i, i + n).join(''), dopoPer = i > 0 && /^(per|entro)$/.test(s[i - 1]), attaccato = !dopoPer && /^per./.test(unito);
    if (!dopoPer && !attaccato) continue;
    const resto = attaccato ? unito.slice(3) : unito;
    if (resto.length < 5) continue;
    const g = Object.keys(GIORNI_SCRITTI).find(k => { const d = lev(resto, k); return d > 0 && d <= (attaccato ? 2 : 1); });
    if (g) return [...w.slice(0, i), (attaccato ? 'per ' : '') + GIORNI_SCRITTI[g] + ((/[.,!?;:]+$/.exec(w[i + n - 1]) || [''])[0]), ...w.slice(i + n)].join(' ');
  }
  return '';
}
/* il server manda la frase corretta (r.testo, r.corretto) e le trascrizioni di Whisper (r.alternative): vince quella che ha più
   senso sul menù (piatti, quantità, giorno); la frase del correttore parte avvantaggiata. Senza alternative: r.testo ritoccato. */
function scegliTrascrizione(r) {
  const cand = [];
  const metti = (t, bonus) => { t = ritoccaGiorni(String(t || '').replace(/\s+/g, ' ').trim()); if (t && !cand.some(c => vcS(c.t) === vcS(t))) cand.push({ t, bonus }); const g = t && giornoSimile(t); if (g && !cand.some(c => vcS(c.t) === vcS(g))) cand.push({ t: g, bonus }); };
  metti(r && r.testo, r && r.corretto ? 0.15 : 0.02);
  ((r && Array.isArray(r.alternative)) ? r.alternative : []).forEach(a => metti(a, 0));
  if (cand.length < 2) return cand[0] ? cand[0].t : String((r && r.testo) || '');
  let best = null;
  cand.forEach(c => { const e = capisciCliente(c.t), p = e.confidenza + (e.piatti.length ? 0.3 : 0) + (e.quantita.length ? 0.1 : 0) + (e.giorno ? 0.1 : 0) + c.bonus; if (!best || p > best.p) best = { t: c.t, p }; });
  return best.t;
}
/* «ascolto preciso»: registra (si ferma da sola al silenzio), manda al server (Whisper), riceve il testo */
async function registraCliente(o = {}) {
  if (!navigator.mediaDevices || !window.MediaRecorder) { mostraToast('Questo telefono non sa registrare: scrivi la frase.'); statoVC('', ''); return; }
  if (!navigator.onLine) { mostraToast('Per l\'ascolto preciso serve internet: intanto scrivi la frase.'); statoVC('', ''); return; }
  sbloccaVoceIOS();   // subito, dentro il tocco (bip e voce delle risposte): Safari non lo fa partire dopo
  const giro = VC.giro; VC.sento = false;
  statoVC('avvio', '');   // C110: si vede subito che è partito (su iPad il microfono ci mette un attimo e a volte chiede il permesso)
  sessioneAudio('play-and-record');
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { sessioneAudio('auto'); if (VC.giro === giro) { mostraToast('Per parlare serve il microfono: tocca «Consenti» quando il telefono lo chiede.'); statoVC('', ''); } return; }
  if (VC.giro !== giro) { stream.getTracks().forEach(t => t.stop()); sessioneAudio('auto'); return; }   // annullato mentre si accendeva
  const tipo = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', ''].find(t => !t || (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)));
  let mr; try { mr = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined); } catch (e) { mr = new MediaRecorder(stream); }
  const pezzi = [], inizio = Date.now(), silenzioMs = Math.max(2, Math.min(6, Number(vcOpz('voceClientiSecondi', 3)) || 3)) * 1000;
  let analizza = null, parlato = false, ultimoSuono = Date.now();
  try {   // misura il volume: dopo «silenzioMs» di silenzio (dopo aver parlato) si ferma da sola
    const ac = VC.audio || (VC.audio = new (window.AudioContext || window.webkitAudioContext)()); if (ac.state === 'suspended') ac.resume();
    const an = ac.createAnalyser(); an.fftSize = 512; ac.createMediaStreamSource(stream).connect(an); const buf = new Uint8Array(an.fftSize);
    analizza = setInterval(() => { an.getByteTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; } const rms = Math.sqrt(s / buf.length);
      if (rms > 0.02) { parlato = true; ultimoSuono = Date.now(); if (!VC.sento && VC.giro === giro) { VC.sento = true; disegnaVC(); } } else if (parlato && Date.now() - ultimoSuono > silenzioMs && mr.state === 'recording') mr.stop();
      const onda = VC.stato === 'registro' && document.querySelector('#vc .vc-onda'); if (onda) { onda.classList.add('viva'); onda.style.setProperty('--liv', Math.min(1, rms * 10).toFixed(2)); } }, 100);   // le barrette seguono la voce: si vede che sente
  } catch (e) { /* senza misura: si ferma al tempo massimo o al tocco */ }
  const tMax = setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, 15000);
  mr.ondataavailable = ev => { if (ev.data && ev.data.size) pezzi.push(ev.data); };
  mr.onstop = async () => {
    clearInterval(analizza); clearTimeout(tMax); stream.getTracks().forEach(t => t.stop()); VC.media = null; ticVoce(false); sessioneAudio('playback');   // microfono chiuso: la risposta a voce torna forte
    if (VC.giro !== giro) return;
    const blob = new Blob(pezzi, { type: mr.mimeType || tipo || 'audio/webm' });
    if (Date.now() - inizio < 500 || blob.size < 1200) { statoVC('', ''); mostraToast('Non ho sentito nulla: riprova.'); return; }
    if (blob.size > 1200000) { statoVC('', ''); mostraToast('Frase troppo lunga: dimmela in due pezzi.'); return; }
    statoVC('capisco', '');
    try {
      const r = await (window.ascoltaServerFinto || ascoltaServer)({ audio: await base64Di(blob), tipo: blob.type, piatti: nomiPiattiVoce() });
      if (VC.giro !== giro) return;
      if (r && r.testo) { consegnaDetto(scegliTrascrizione(r), o); return; }
      statoVC('', ''); mostraToast(r && r.fermo ? 'Per oggi ho ascoltato tanto: scrivimi la frase.' : 'Non ho capito le parole: riprova o scrivi la frase.');
    } catch (e) { if (VC.giro === giro) { statoVC('', ''); mostraToast(e.message || 'Adesso non riesco a capire la voce: scrivi la frase.'); } }
  };
  VC.media = mr; mr.start(250); ticVoce(true); statoVC('registro', '');
}
const base64Di = blob => new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1] || ''); fr.onerror = () => no(new Error('audio non leggibile')); fr.readAsDataURL(blob); });
async function ascoltaServer(corpo) {
  const tok = await Dati.tokenCliente(); if (!tok) throw new Error('Riapri l\'app e riprova.');
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 30000);
  try {
    const res = await fetch('/api/ascolta', { method: 'POST', signal: ctl.signal, headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
    const j = await res.json().catch(() => ({}));
    if (res.status === 403) throw new Error(j.errore === 'spento' ? 'L\'aiutante per ora è spento.' : 'L\'ascolto è per chi Monica ha già accettato.');
    if (!res.ok) throw new Error('Adesso non riesco a capire la voce: scrivi la frase.');
    return j;
  } catch (e) { if (e.name === 'AbortError') throw new Error('Ci sto mettendo troppo: riprova.'); if (e instanceof TypeError) throw new Error('Non riesco a collegarmi: scrivi la frase.'); throw e; }
  finally { clearTimeout(t); }
}
/* RISPOSTA A VOCE DEI CLIENTI (C110): la voce del telefono, sempre pronta (i clienti non scaricano Paola: niente avviso «si sta scaricando»).
   Niente cancel() se non sta parlando (su iPhone un cancel subito prima di speak può far perdere la frase).
   iPhone/iPad: se dopo 3 s la voce non è partita, il fumetto mostra «Ascolta la risposta» (un tocco la fa partire di sicuro). */
function parlaCliente(t, fine, i) {
  const k = typeof sceltaVoce === 'function' ? sceltaVoce() : '';
  if (!suiOS() && typeof motoreLocale === 'function' && motoreLocale(k) && AI.localiPronte && AI.localiPronte[k] === true) { parlaAI(t, fine); return; }   // Paola già sul telefono (chi gestisce che guarda come cliente)
  const m = i != null ? AIC.msgs[i] : null; if (m) m.detto = t;
  if (!window.speechSynthesis || typeof frasiVoce !== 'function') { if (fine) fine(); return; }
  AI.giroVoce = (AI.giroVoce || 0) + 1;
  if (AI.audio) { try { AI.audio.pause(); } catch (e) { /* già ferma */ } AI.audio = null; }
  try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); } catch (e) { /* niente */ }
  const giro = AI.giroVoce, ff = frasiVoce(t), v = typeof voceAI === 'function' ? voceAI() : null;
  if (!ff.length) { if (fine) fine(); return; }
  let partita = false;
  try {
    ff.forEach((f, j) => {
      const u = new SpeechSynthesisUtterance(f);
      u.lang = 'it-IT'; if (v) u.voice = v; u.rate = Math.min(1.3, 0.97 * (typeof velVoce === 'function' ? velVoce() : 0.9) / 0.9); u.pitch = 1.0;
      u.onstart = () => { partita = true; };
      if (j === ff.length - 1) u.onend = u.onerror = () => { if (AI.giroVoce === giro && fine) fine(); };
      speechSynthesis.speak(u);
    });
  } catch (e) { if (fine) fine(); return; }
  if (m && suiOS()) setTimeout(() => { if (partita || AI.giroVoce !== giro || m.muta) return; m.muta = true; if (UI.vista === 'aiuto') { render(); fondoAC(); } mostraToast('Tocca «Ascolta la risposta» per sentirla.'); }, 3000);
}
/* tocco su «Ascolta la risposta» / «Riascolta»: dentro il tocco la voce parte sempre */
function riascoltaCliente(i) {
  const m = AIC.msgs[i]; if (!m) return;
  sbloccaVoceIOS(); sessioneAudio('playback');
  if (m.muta) { m.muta = false; render(); }
  parlaCliente(m.detto || perVoceCliente(m.t), null, null);
}
/* la frase capita → all'aiutante (o alla domanda «lo metto nel carrello?» se stavamo aspettando un sì) */
function consegnaDetto(testo, o) {
  testo = String(testo || '').trim(); if (!testo) { statoVC('', ''); return; }
  statoVC('capito', testo);
  if (o && typeof o.manda === 'function') { setTimeout(() => { if (VC.stato === 'capito') statoVC('', ''); }, 900); o.manda(testo); return; }   // aiutante di Monica
  if (o && o.perSi != null) {
    const e = capisciCliente(testo);
    if ((e.intento === 'si' || e.intento === 'no') && rispondiSiNoCliente(e.intento)) { statoVC('', ''); return; }
  }
  if (UI.vista !== 'aiuto') vai('aiuto');
  setTimeout(() => { if (VC.stato === 'capito') statoVC('', ''); }, 600);
  inviaAC(testo, true, { dettato: !!(o && o.dettato) });
}
/* dopo la risposta a voce: se c'è una proposta per il carrello riapre il microfono per il «sì» */
function dopoVoceCliente(i) {
  const m = AIC.msgs[i];
  if (!m || !m.piano || m.esito || !m.voce || UI.vista !== 'aiuto' || ascoltoInCorso()) return;
  if (!vcOpz('voceClientiConferma', true) || !vocePuoSentireSi() || !m.piano.some(x => x.on && controllaAIC(x.a).fai)) return;
  ascoltaCliente({ perSi: i, dettato: m.dettato });
}
/* dopo «Conferma» (a voce o col tocco) di una proposta nata dalla voce: giorno nel carrello, poi al carrello con il riepilogo letto */
function dopoConfermaCliente(m) {
  if (m.giorno) { const tr = giorniPossibili(P.carrello.filter(r => !r.pronto && (r.tipo === 'teglia' || r.tipo === 'intera')).reduce((s, r) => s + r.qta, 0)).find(x => x.g === m.giorno); if (tr && !tr.no) UI.entro = m.giorno; }
  if (!m.voce && !m.dettato) return;
  vai('carrello');
  if (m.voce && vcOpz('voceClientiRisponde', true)) {
    const n = P.carrello.length;
    parlaCliente(perVoceCliente(`Nel carrello hai ${n} ${n === 1 ? 'cosa' : 'cose'}, totale ${euro(totale(P.carrello))}.${UI.entro ? ` Ritiro ${giornoLungo(UI.entro)}.` : ' Scegli il giorno.'} Quando sei pronto tocca Invia.`));
  }
}

/* ================= C. MICROFONO FISSO E «HO CAPITO» ================= */
const fabVisibile = () => P.ruolo !== 'monica' && typeof aiClientiVisibile === 'function' && aiClientiVisibile() && vcOpz('voceClientiFab', true) && ['menu', 'carrello'].includes(UI.vista) && !UI.foglio && !UI.modifica && !!(riconoscitore() || (navigator.mediaDevices && window.MediaRecorder));
function disegnaVC() {
  let box = document.getElementById('vc');
  if (!box) { box = document.createElement('div'); box.id = 'vc'; document.body.appendChild(box); agganciaFab(box); }
  const fab = fabVisibile(), su = fab || ascoltoInCorso() || VC.stato === 'capito';   // C110: anche nella pagina Aiutante (su iPad sembrava che non partisse)
  box.hidden = !su; document.body.classList.toggle('vc-su', fab);
  if (!su) return;
  const st = VC.stato, primo = fab && !st && (() => { try { return !localStorage.getItem('pit-vc-visto'); } catch (e) { return false; } })();
  const suggerimento = VC.perSi != null ? 'Di\' «sì» oppure «no»' : VC.dettato ? 'Dimmi piatti, quantità e giorno, tutto in una frase' : 'Parla pure: mi fermo da sola quando finisci';
  const chiave = [fab, st, primo, ascoltoInCorso(), UI.vista === 'aiuto'].join('|');
  const attesa = VC.sento ? 'Ti sento! Quando finisci mi fermo da sola.' : suggerimento;
  if (box.dataset.chiave === chiave && ['ascolto', 'registro', 'capito', 'capisco', 'avvio'].includes(st)) {   // stessa struttura: cambio solo i testi, senza rifare il pannello (su iPad lampeggiava a ogni render)
    const p = box.querySelector('.vc-pannello p'), b = box.querySelector('[data-vc="stop"]');
    if (p) { if (st === 'capito') p.textContent = `«${VC.testo}»`; else if (st === 'capisco') p.textContent = testoCapisco(); else if (st !== 'avvio') { p.className = VC.testo ? '' : 'tenue'; p.textContent = VC.testo ? `Ho capito: «${VC.testo}»` : st === 'registro' ? attesa : suggerimento; } }
    if (b) b.textContent = VC.testo ? 'Basta così' : 'Annulla';
    return;
  }
  box.dataset.chiave = chiave;
  let pann = '';
  if (st === 'avvio') pann = `<div class="vc-pannello" aria-live="polite"><div class="ai-pensa" style="padding:0"><span></span><span></span><span></span></div><b>Accendo il microfono…</b><p class="tenue">Se il telefono chiede il permesso, tocca «Consenti».</p><button type="button" class="btn piccolo chiaro" data-vc="stop">Annulla</button></div>`;
  else if (st === 'ascolto' || st === 'registro') pann = `<div class="vc-pannello" aria-live="polite"><div class="vc-onda"><span></span><span></span><span></span><span></span><span></span></div><b>${st === 'registro' ? 'Ti ascolto con attenzione…' : 'Ti ascolto…'}</b>${VC.testo ? `<p>Ho capito: «${esc(VC.testo)}»</p>` : `<p class="tenue">${esc(st === 'registro' ? attesa : suggerimento)}</p>`}<button type="button" class="btn piccolo chiaro" data-vc="stop">${VC.testo ? 'Basta così' : 'Annulla'}</button></div>`;
  else if (st === 'capisco') pann = `<div class="vc-pannello" aria-live="polite"><div class="ai-pensa" style="padding:0"><span></span><span></span><span></span></div><b>Un attimo…</b><p>${testoCapisco()}</p></div>`;
  else if (st === 'capito') pann = `<div class="vc-pannello"><b>Ho capito:</b><p>«${esc(VC.testo)}»</p></div>`;
  else if (primo) pann = `<div class="vc-pannello vc-primo"><b>Puoi parlarmi!</b><p>Tocca il microfono e prova a dire: ${esempiVoce().slice(0, 3).join(', ')}.</p><button type="button" class="btn piccolo chiaro" data-vc="visto">Ho capito</button></div>`;
  box.classList.toggle('vc-senza-fab', !fab);   // C110: fuori da Menù e Carrello c'è già il microfono della pagina: niente tondo che copre, pannello più in basso
  box.innerHTML = !fab ? pann : `${pann}<div class="vc-fabs">${fab && !ascoltoInCorso() && st !== 'capito' ? `<button type="button" class="vc-detta" data-vc="detta">${ico('carrello')}<span>Dettami l'ordine</span></button>` : ''}<button type="button" class="vc-fab ${ascoltoInCorso() ? 'acceso' : ''}" data-vc="mic" aria-label="${ascoltoInCorso() ? 'Smetti di ascoltare' : 'Parla: ordina o chiedi a voce'}">${ico('microfono')}</button></div>`;
}
/* tocco = ascolta finché finisci di parlare; tieni premuto = parla finché tieni (al rilascio capisce); tocco mentre ascolta = basta così */
function agganciaFab(box) {
  box.addEventListener('pointerdown', ev => { if (!ev.target.closest('[data-vc="mic"]')) return; ev.preventDefault(); VC.giu = Date.now(); VC.partito = !ascoltoInCorso(); if (VC.partito) ascoltaCliente(); });
  box.addEventListener('pointerup', ev => { if (!ev.target.closest('[data-vc="mic"]')) return; sbloccaVoceIOS(); if (VC.partito && VC.stato === 'avvio') return; if (!VC.partito || Date.now() - VC.giu > 700) fermaAscoltoCliente(); });   // il rilascio del dito è un tocco vero per Safari: sblocco lì
  box.addEventListener('click', ev => {
    const el = ev.target.closest('[data-vc]'); if (!el) return;
    if (el.dataset.vc === 'mic') sbloccaVoceIOS();   // C110: Safari conta come tocco il click, non il pointerdown
    if (el.dataset.vc === 'stop') fermaAscoltoCliente();
    if (el.dataset.vc === 'detta') ascoltaCliente({ dettato: true });
    if (el.dataset.vc === 'visto') { try { localStorage.setItem('pit-vc-visto', '1'); } catch (e) { /* niente */ } disegnaVC(); }
  });
}
/* il microfono fisso si ridisegna a ogni render dell'app (app.js non si tocca: si aggancia alla funzione globale) */
if (typeof window.render === 'function') {
  const renderPrimaVC = window.render;
  window.render = function () { const r = renderPrimaVC.apply(this, arguments); try { disegnaVC(); } catch (e) { /* al prossimo */ } return r; };
}
Object.assign(A, {
  'vc-alt'(el) { const m = AIC.msgs[Number(el.dataset.m)], alt = m && m.alt && m.alt[Number(el.dataset.j)]; if (!alt) return; m.altFatto = true; inviaAC(alt.testo, false, { scelte: alt.scelte, nome: alt.nome }); },
  'vc-detta'() { ascoltaCliente({ dettato: true }); },
  'vc-ascolta'(el) { riascoltaCliente(Number(el.dataset.m)); }
});
if (typeof PATH === 'object' && !PATH.altoparlante) PATH.altoparlante = '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>';
try { disegnaVC(); } catch (e) { /* al prossimo render */ }
