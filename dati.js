/* Pronti in Tavola · motore dati «firebase» (docs/SPEC-FIREBASE.md).
   Lo usano solo carica() e salva() di app.js. Senza configurazione, con ?prova o da file
   resta spento e l'app usa il motore «prova» di sempre (dati sul telefono). */
'use strict';

/* Configurazione web di Firebase: non è un segreto (la protezione sono le regole).
   Si riempie quando Mario crea il progetto. */
const FIREBASE_CONFIG = null;
const FIREBASE_VERSIONE = '13.2.0';

const Dati = (() => {
  const qs = new URLSearchParams(location.search);
  const EMULATORE = qs.has('emulatore');
  const CONFIG = EMULATORE ? { apiKey: 'demo-chiave', authDomain: 'demo-pronti.firebaseapp.com', projectId: 'demo-pronti', appId: 'demo-app' } : FIREBASE_CONFIG;
  const attivo = !!CONFIG && !qs.has('prova') && location.protocol !== 'file:';
  const CHIAVE_COPIA = 'pit-copia-v1';

  let F = null, db = null, auth = null, alCambio = () => {}, alStato = () => {}, op = {};
  const srv = {};                 // ultima copia del server (o della cache): 'raccolta/id' → dati
  const ascolti = [];             // ascolti attivi da chiudere al cambio di utente
  let ultimaScrittura = Promise.resolve(), inAttesa = 0, tAvviso = null;
  const io = { uid: null, gestore: false, utente: null, pronto: false };
  let ascoltoUtente = null;   // il documento utenti/ di questo telefono

  /* JSON con le chiavi in ordine: due oggetti uguali danno lo stesso testo */
  const chiaro = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)
    ? Object.keys(x).sort().reduce((o, c) => { o[c] = x[c]; return o; }, {}) : x));
  const copia = v => JSON.parse(JSON.stringify(v));

  /* ---------- da S (lo stato dell'app) ai documenti, e ritorno ---------- */
  function documenti(S) {
    const d = {}, imp = copia(S.impostazioni || {});
    const paga = imp.paga || {};
    d['impostazioni/approvati'] = { ritiro: imp.ritiro || {}, whatsapp: imp.whatsapp || '',
      pagaDati: { iban: paga.iban || '', intestataria: paga.intestataria || '', telefonoPostepay: paga.telefonoPostepay || '' } };
    d['impostazioni/monica'] = { mario: imp.mario || '' };
    ['ritiro', 'whatsapp', 'mario'].forEach(k => delete imp[k]);
    imp.paga = { contanti: !!paga.contanti, bonifico: !!paga.bonifico, postepay: !!paga.postepay };
    d['impostazioni/app'] = Object.assign(imp, { ingExtra: S.ingExtra || {}, soloContanti: !!S.soloContanti });
    (S.piatti || []).forEach(p => {
      const resto = copia(p); delete resto.foto;
      d['piatti/' + p.id] = resto;
      if (p.foto) d['foto/' + p.id] = { foto: p.foto };
    });
    (S.clienti || []).forEach(c => { d['clienti/' + c.id] = copia(c); });
    (S.ordini || []).forEach(o => { d['ordini/' + o.id] = copia(o); });
    d['contatori/ordini'] = { prossimo: S.prossimoNumero || 1 };
    if (op.contaSettimane) {
      const conto = op.contaSettimane(S);
      Object.keys(srv).filter(k => k.startsWith('settimane/')).forEach(k => { d[k] = { teglie: 0 }; });
      Object.keys(conto).forEach(s => { d['settimane/' + s] = { teglie: conto[s] }; });
    }
    return d;
  }
  const tutti = col => Object.keys(srv).filter(k => k.startsWith(col + '/')).map(k => srv[k]);
  function stato() {
    const imp = copia(srv['impostazioni/app'] || {}), appr = srv['impostazioni/approvati'] || {}, mon = srv['impostazioni/monica'] || {};
    const ingExtra = imp.ingExtra || {}, soloContanti = imp.soloContanti !== false;
    delete imp.ingExtra; delete imp.soloContanti;
    imp.paga = Object.assign({ contanti: true, bonifico: false, postepay: false }, imp.paga || {}, appr.pagaDati || {});
    imp.ritiro = appr.ritiro || { via: '', citta: '', nota: '' };
    imp.whatsapp = appr.whatsapp || '';
    imp.mario = mon.mario || '';
    const utenti = tutti('utenti');
    const nomeDi = id => (tutti('clienti').find(c => c.id === id) || {}).nome || (id === 'monica' ? 'Monica' : '');
    // Copia profonda: cambiare S non deve cambiare la copia del server, se no non si vede la differenza.
    const S = copia({
      versione: 1, motore: 'firebase', soloContanti, ingExtra, impostazioni: imp,
      piatti: tutti('piatti').sort((a, b) => (a.ordine || 0) - (b.ordine || 0)),
      clienti: tutti('clienti'),
      ordini: tutti('ordini').sort((a, b) => (a.n || 0) - (b.n || 0)),
      prossimoNumero: (srv['contatori/ordini'] || {}).prossimo || 1,
      settimane: Object.keys(srv).filter(k => k.startsWith('settimane/')).reduce((o, k) => { o[k.slice(10)] = srv[k].teglie || 0; return o; }, {}),
      utenti,
      richieste: utenti.filter(u => u.stato === 'nuovo' || u.stato === 'ricollega')
        .map(u => ({ id: u.uid, nome: u.nome, tramite: nomeDi(u.tramite), il: u.il, stato: u.stato }))
    });
    S.piatti.forEach(p => { p.foto = (srv['foto/' + p.id] || {}).foto || null; });   // le foto sono testo: niente copia
    return S;
  }

  /* ---------- copia sul telefono: il menù si vede subito, anche senza rete ---------- */
  function copiaLocale() {
    try { const c = JSON.parse(localStorage.getItem(CHIAVE_COPIA)); return c && c.versione === 1 ? c : null; }
    catch (e) { return null; }
  }
  function salvaCopia(S) { try { localStorage.setItem(CHIAVE_COPIA, JSON.stringify(S)); } catch (e) { /* telefono pieno: si rilegge dal server */ } }

  let tCambio = null;
  function avvisaCambio() {
    clearTimeout(tCambio);
    // Il cliente aspetta le impostazioni (senza, l'app non sa disegnarsi); Monica no: col database vuoto lo prepara lei.
    if (!srv['impostazioni/app'] && !(io.gestore && io.pronto)) return;
    tCambio = setTimeout(() => { const S = stato(); if (io.pronto) salvaCopia(S); alCambio(S, Object.assign({}, io)); }, 30);
  }

  /* ---------- ascolti ---------- */
  function ascolta(rif, col) {
    const singolo = !col;
    ascolti.push(F.fs.onSnapshot(rif, snap => {
      if (singolo) { const k = rif.path; if (snap.exists()) srv[k] = snap.data(); else delete srv[k]; }
      else {
        snap.docChanges().forEach(ch => {
          const k = col + '/' + ch.doc.id;
          if (ch.type === 'removed') delete srv[k];
          else srv[k] = col === 'utenti' ? Object.assign({ uid: ch.doc.id }, ch.doc.data()) : ch.doc.data();
        });
      }
      if (!snap.metadata.fromCache) io.pronto = true;
      avvisaCambio();
    }, err => { console.warn('ascolto', col || rif.path, err.code); alStato({ errore: err.code }); }));
  }
  function chiudiAscolti() { while (ascolti.length) ascolti.pop()(); }

  function apriAscolti() {
    chiudiAscolti();
    const { doc, collection, query, where } = F.fs;
    ['piatti', 'foto', 'settimane'].forEach(c => ascolta(collection(db, c), c));
    ascolta(doc(db, 'impostazioni', 'app'));
    if (io.gestore) {
      ['clienti', 'ordini', 'utenti'].forEach(c => ascolta(collection(db, c), c));
      ascolta(doc(db, 'impostazioni', 'approvati')); ascolta(doc(db, 'impostazioni', 'monica')); ascolta(doc(db, 'contatori', 'ordini'));
      return;
    }
    ascolta(doc(db, 'contatori', 'ordini'));
    ascolta(query(collection(db, 'ordini'), where('utente', '==', io.uid)), 'ordini');
    const u = io.utente;
    if (u && u.stato === 'approvato' && u.cliente) {
      ascolta(doc(db, 'impostazioni', 'approvati'));
      ascolta(doc(db, 'clienti', u.cliente));
      ascolta(query(collection(db, 'ordini'), where('cliente', '==', u.cliente)), 'ordini');
    }
  }

  /* ---------- chi sono: telefono anonimo, o Monica con Google ---------- */
  async function chiSono(user) {
    const { doc, getDoc, onSnapshot } = F.fs;
    if (io.uid !== user.uid) { chiudiAscolti(); Object.keys(srv).forEach(k => delete srv[k]); io.pronto = false; }
    io.uid = user.uid;
    io.gestore = (await getDoc(doc(db, 'gestori', user.uid)).catch(() => null))?.exists() || false;
    io.utente = null;
    if (!io.gestore) {
      // Il documento utenti/ di questo telefono: quando Monica approva, si riaprono gli ascolti.
      let prima = null;
      ascoltoUtente && ascoltoUtente();
      ascoltoUtente = onSnapshot(doc(db, 'utenti', user.uid), snap => {
        io.utente = snap.exists() ? snap.data() : null;
        const ora = io.utente ? io.utente.stato + '/' + io.utente.cliente : '';
        if (ora !== prima) { prima = ora; apriAscolti(); }
        avvisaCambio();
      }, () => { io.utente = null; apriAscolti(); });
    } else apriAscolti();
  }
  async function avvia(cambio, statoRete, opzioni) {
    alCambio = cambio; alStato = statoRete || (() => {}); op = opzioni || {};
    const base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSIONE + '/';
    const [app, fs, au] = await Promise.all(['firebase-app.js', 'firebase-firestore.js', 'firebase-auth.js'].map(f => import(base + f)));
    F = { app, fs, au };
    const fa = app.initializeApp(CONFIG);
    db = fs.initializeFirestore(fa, {
      ignoreUndefinedProperties: true,
      localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() })
    });
    auth = au.getAuth(fa);
    if (EMULATORE) {
      fs.connectFirestoreEmulator(db, '127.0.0.1', 8080);
      au.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    }
    au.onAuthStateChanged(auth, user => {
      if (user) chiSono(user);
      else au.signInAnonymously(auth).catch(e => alStato({ errore: e.code }));
    });
    addEventListener('online', () => alStato({ rete: true, inAttesa }));
    addEventListener('offline', () => alStato({ rete: false, inAttesa }));
  }

  /* ---------- scrivere solo i campi cambiati (Monica) ---------- */
  const SCRIVIBILI = ['piatti/', 'foto/', 'impostazioni/', 'clienti/', 'ordini/', 'contatori/'];
  function scrivi(S) {
    if (db && !io.gestore && io.pronto) return scriviCliente(S);
    if (!db || !io.gestore || !io.pronto) return ultimaScrittura;
    const { doc, writeBatch, deleteField } = F.fs;
    const nuovi = documenti(S), b = writeBatch(db);
    let n = 0;
    Object.keys(nuovi).forEach(k => {
      const vecchio = srv[k], nuovo = nuovi[k];
      if (!vecchio) { b.set(doc(db, k), nuovo); n++; return; }
      const campi = {};
      Object.keys(nuovo).forEach(c => { if (chiaro(nuovo[c]) !== chiaro(vecchio[c])) campi[c] = nuovo[c]; });
      if (k.startsWith('impostazioni/')) Object.keys(vecchio).forEach(c => { if (!(c in nuovo)) campi[c] = deleteField(); });
      if (Object.keys(campi).length) { b.update(doc(db, k), campi); n++; }
    });
    Object.keys(srv).forEach(k => {
      if (!(k in nuovi) && SCRIVIBILI.some(p => k.startsWith(p)) && !k.startsWith('impostazioni/') && !k.startsWith('contatori/')) { b.delete(doc(db, k)); n++; }
    });
    if (!n) return ultimaScrittura;
    inAttesa++;
    clearTimeout(tAvviso);
    if (!navigator.onLine) alStato({ rete: false, inAttesa });
    ultimaScrittura = b.commit().then(() => {
      inAttesa--; alStato({ rete: true, inAttesa });
    }, e => {
      inAttesa--; console.warn('scrittura', e.code); alStato({ errore: e.code, inAttesa });
      throw e;
    });
    ultimaScrittura.catch(() => {});
    return ultimaScrittura;
  }

  /* La prima volta che entra Monica il database è vuoto: si caricano i 23 piatti e le impostazioni. */
  function preparaVuoto(iniziale) {
    if (!io.gestore || !io.pronto || srv['impostazioni/app']) return false;
    const S = Object.assign({}, iniziale, { clienti: [], ordini: [], richieste: [], prossimoNumero: 1 });
    S.piatti = S.piatti.map(p => Object.assign({}, p, { cuori: 0, pronto: null }));
    scrivi(S);
    return true;
  }

  /* ---------- clienti: nome, ordini e risposte, sempre «tutto o niente» ---------- */
  const errore = (code, extra) => Object.assign(new Error(code), { code }, extra || {});
  const approvato = () => !!(io.utente && io.utente.stato === 'approvato' && io.utente.cliente);
  const chiaveNome = nome => String(nome).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');

  // Il telefono si presenta: nome unico (nomi/), o «ricollega» se è lo stesso nome su un telefono nuovo.
  async function registra(nome, tramite, ricollega) {
    if ((srv['impostazioni/app'] || {}).nuovi === false) throw errore('chiuso');
    if (!navigator.onLine) throw errore('unavailable');
    const chiave = chiaveNome(nome);
    if (!chiave || nome.length < 2 || nome.length > 60) throw errore('nome');
    const { doc, writeBatch } = F.fs, b = writeBatch(db);
    const u = { nome, chiave, tramite: String(tramite || '').slice(0, 40), il: op.oggi(), stato: ricollega ? 'ricollega' : 'nuovo', cliente: null, primo: null };
    b.set(doc(db, 'utenti', io.uid), u);
    if (!ricollega) b.set(doc(db, 'nomi', chiave), { il: u.il });
    await b.commit();
    io.utente = u; avvisaCambio();
  }

  // Quanto prende un ordine dai «pronti» (per piatto) e dalle teglie della settimana.
  const fuori = ['annullato', 'rifiutato', 'daApprovare'];
  function presi(o) {
    const m = {};
    if (o && o.pronto && !fuori.includes(o.stato)) o.righe.forEach(r => { m[r.piatto] = (m[r.piatto] || 0) + r.qta; });
    return m;
  }
  function teglie(o) { const m = {}; if (o && !fuori.includes(o.stato)) { const n = op.teglieOrdine(o); if (n) m[op.settimana(o.entro)] = n; } return m; }
  const unione = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const arrot = x => Math.round(x * 100) / 100;

  // Una scrittura dell'ordine (nuovo o cambiato) con i suoi effetti su pronti, cuori, teglie e contatore.
  function transazione(vecchio, nuovo) {
    if (!navigator.onLine) return Promise.reject(errore('unavailable'));
    const { doc, runTransaction } = F.fs, id = nuovo.id, appr = approvato();
    return runTransaction(db, async t => {
      const dPronti = {}, dCuori = {}, dTeglie = {};
      if (appr) {
        const a = presi(vecchio), b = presi(nuovo), ta = teglie(vecchio), tb = teglie(nuovo);
        unione(a, b).forEach(k => { const d = (b[k] || 0) - (a[k] || 0); if (d) dPronti[k] = d; });
        unione(ta, tb).forEach(k => { const d = (tb[k] || 0) - (ta[k] || 0); if (d) dTeglie[k] = d; });
        const ca = (vecchio && vecchio.cuori) || {}, cb = nuovo.cuori || {};
        unione(ca, cb).forEach(k => { const d = (cb[k] ? 1 : 0) - (ca[k] ? 1 : 0); if (d) dCuori[k] = d; });
      }
      // prima tutte le letture, poi le scritture (regola delle transazioni)
      const cont = vecchio ? null : await t.get(doc(db, 'contatori', 'ordini'));
      const piatti = {};
      for (const k of unione(dPronti, dCuori)) piatti[k] = await t.get(doc(db, 'piatti', k));
      const sett = {};
      for (const k of Object.keys(dTeglie)) sett[k] = await t.get(doc(db, 'settimane', k));
      const scritto = Object.assign({}, nuovo);
      if (!vecchio) {
        if (!cont.exists()) throw errore('unavailable');
        scritto.n = cont.data().prossimo;
        Object.assign(scritto, { utente: io.uid, cliente: appr ? io.utente.cliente : null, stato: appr ? 'nuovo' : 'daApprovare' });
      }
      const agg = {};
      Object.keys(dPronti).forEach(k => {
        const p = piatti[k].exists() ? piatti[k].data() : null, d = dPronti[k];
        if (d > 0) {   // prende: deve esserci ancora, di oggi
          if (!p || !p.pronto || p.pronto.giorno !== op.oggi() || p.pronto.qta < d) throw errore('finito', { nome: p ? p.nome : k, piatto: k });
          agg[k] = { pronto: Object.assign({}, p.pronto, { qta: arrot(p.pronto.qta - d) }) };
        } else if (p && p.pronto && p.pronto.giorno === nuovo.entro) {   // rimette: solo nello stesso giorno
          agg[k] = { pronto: Object.assign({}, p.pronto, { qta: arrot(p.pronto.qta - d) }) };
        }
      });
      Object.keys(dCuori).forEach(k => {
        if (!piatti[k].exists()) return;
        agg[k] = Object.assign(agg[k] || {}, { cuori: Math.max(0, (piatti[k].data().cuori || 0) + dCuori[k]) });
      });
      if (vecchio) {
        const campi = {};
        Object.keys(nuovo).forEach(c => { if (chiaro(nuovo[c]) !== chiaro(vecchio[c])) campi[c] = nuovo[c]; });
        t.update(doc(db, 'ordini', id), campi);
      } else {
        t.set(doc(db, 'ordini', id), scritto);
        t.update(doc(db, 'contatori', 'ordini'), { prossimo: scritto.n + 1, ultimo: id });
        if (!appr) t.update(doc(db, 'utenti', io.uid), { primo: id });
      }
      Object.keys(agg).forEach(k => t.update(doc(db, 'piatti', k), Object.assign(agg[k], { ultimoOrdine: id })));
      Object.keys(dTeglie).forEach(k => {
        const prima = sett[k].exists() ? sett[k].data().teglie || 0 : 0;
        t.set(doc(db, 'settimane', k), { teglie: Math.max(0, prima + dTeglie[k]), ultimo: id });
      });
      return scritto;
    });
  }

  // Ordini nuovi del cliente: uno alla volta (il contatore sale di 1 per scrittura).
  // Se uno non parte, l'errore dice quanti sono già partiti.
  async function inviaOrdini(lista) {
    let partiti = 0;
    try { for (const o of lista) { await transazione(null, o); partiti++; } }
    catch (e) { e.partiti = partiti; throw e; }
  }

  // Cambi del cliente sui suoi ordini (annulla, risposta alla proposta, «Ho pagato», cuori, modifica).
  function scriviCliente(S) {
    if (!io.utente) return Promise.resolve();
    const cambiati = (S.ordini || []).filter(o => srv['ordini/' + o.id] && chiaro(o) !== chiaro(srv['ordini/' + o.id]));
    if (!cambiati.length) return ultimaScrittura;
    inAttesa++;
    ultimaScrittura = cambiati.reduce((pr, o) => pr.then(() => transazione(srv['ordini/' + o.id], o)), Promise.resolve())
      .then(() => { inAttesa--; alStato({ rete: true, inAttesa }); },
        e => { inAttesa--; console.warn('scrittura', e.code); alStato({ errore: e.code, inAttesa }); avvisaCambio(); throw e; });
    ultimaScrittura.catch(() => {});
    return ultimaScrittura;
  }

  async function entraGoogle() {
    const au = F.au, provider = new au.GoogleAuthProvider();
    await au.signInWithPopup(auth, provider);
  }

  return {
    attivo, emulatore: EMULATORE, io, copiaLocale, avvia, scrivi, preparaVuoto, entraGoogle, registra, inviaOrdini,
    confermato: () => ultimaScrittura,
    inAttesa: () => inAttesa
  };
})();
