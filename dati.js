/* Pronti in Tavola · motore dati «firebase» (docs/SPEC-FIREBASE.md).
   Lo usano solo carica() e salva() di app.js. Senza configurazione, con ?prova o da file
   resta spento e l'app usa il motore «prova» di sempre (dati sul telefono). */
'use strict';

/* Configurazione web di Firebase: non è un segreto (la protezione sono le regole di firestore.rules);
   chi apre il sito la vede comunque. Progetto «Pronti in Tavola» di Mario, registrata il 05/11/2026.
   L'anteprima di prova (tools/anteprima.py) la toglie: lì l'app resta sui dati di prova. */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDagZOV9P1sER30TLq24i2ybZlZ0sQqFdE',
  authDomain: 'pronti-in-tavola.firebaseapp.com',
  projectId: 'pronti-in-tavola',
  storageBucket: 'pronti-in-tavola.firebasestorage.app',
  messagingSenderId: '340961319417',
  appId: '1:340961319417:web:0c1e6c4a9b894bc187c528'
};
const FIREBASE_VERSIONE = '13.2.0';

const Dati = (() => {
  const qs = new URLSearchParams(location.search);
  const EMULATORE = qs.has('emulatore');
  const CONFIG = EMULATORE ? { apiKey: 'demo-chiave', authDomain: 'demo-pronti.firebaseapp.com', projectId: 'demo-pronti', appId: 'demo-app' } : FIREBASE_CONFIG;
  const attivo = !!CONFIG && !qs.has('prova') && location.protocol !== 'file:';
  const CHIAVE_COPIA = 'pit-copia-v1';

  let F = null, db = null, auth = null, alCambio = () => {}, alStato = () => {}, op = {};
  const srv = {};                 // ultima copia del server (o della cache): 'raccolta/id' → dati
  let base = null;                // la copia da cui è nato lo S attuale: Monica scrive solo ciò che ha cambiato lei
  const ascolti = [];             // ascolti attivi da chiudere al cambio di utente
  let ultimaScrittura = Promise.resolve(), inAttesa = 0, tAvviso = null;
  const io = { uid: null, gestore: false, utente: null, letto: false, pronto: false, entrata: 0, nome: '' };   // letto: si sa già se il telefono ha un nome
  let ascoltoUtente = null;   // il documento utenti/ di questo telefono
  let uscito = false;         // «Esci da questo telefono»: si aspetta solo il ricaricamento

  /* JSON con le chiavi in ordine: due oggetti uguali danno lo stesso testo */
  const chiaro = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)
    ? Object.keys(x).sort().reduce((o, c) => { o[c] = x[c]; return o; }, {}) : x));
  const copia = v => JSON.parse(JSON.stringify(v));
  /* versione di una foto (lunghezza + impronta del testo): cambia solo se cambia la foto */
  const versioneFoto = f => { let h = 0; for (let i = 0; i < f.length; i++) h = (h * 31 + f.charCodeAt(i)) | 0; return f.length.toString(36) + '-' + (h >>> 0).toString(36); };

  /* ---------- da S (lo stato dell'app) ai documenti, e ritorno ---------- */
  function documenti(S, rif) {
    const d = {}, imp = copia(S.impostazioni || {});
    const paga = imp.paga || {};
    d['impostazioni/approvati'] = { ritiro: imp.ritiro || {}, whatsapp: imp.whatsapp || '',
      pagaDati: { iban: paga.iban || '', intestataria: paga.intestataria || '', telefonoPostepay: paga.telefonoPostepay || '' } };
    d['impostazioni/monica'] = { mario: imp.mario || '' };
    if (S.spesa) d['impostazioni/spesa'] = copia(S.spesa);
    // foto del menù (fino a 3, Mario 07/11): come quelle dei piatti, ognuna nel suo documento foto/menu-N
    (S.menuFoto || []).forEach((f, i) => { if (f) d['foto/menu-' + (i + 1)] = { foto: f }; });   // lista della spesa e dosi: solo di Monica (C15)
    ['ritiro', 'whatsapp', 'mario'].forEach(k => delete imp[k]);
    imp.paga = { contanti: !!paga.contanti, bonifico: !!paga.bonifico, postepay: !!paga.postepay };
    d['impostazioni/app'] = Object.assign(imp, { ingExtra: S.ingExtra || {}, soloContanti: !!S.soloContanti });
    (S.piatti || []).forEach(p => {
      const resto = copia(p); delete resto.foto;
      // la versione cambia solo quando Monica cambia la foto: una foto non ancora arrivata non è una foto tolta
      if ((p.foto || null) !== (((rif || srv)['foto/' + p.id] || {}).foto || null)) resto.fotoV = p.foto ? versioneFoto(p.foto) : null;
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
    const utenti = tutti('utenti'), clienti = tutti('clienti');
    const nomeDi = id => (clienti.find(c => c.id === id) || {}).nome || (id === 'monica' ? 'Monica' : '');
    // «Telefono nuovo»: lo stesso nome di un cliente che c'è già (se no è come un nuovo)
    // (C93) o un altro telefono con lo stesso nome già approvato (browser e poi app installata su iPhone)
    const vecchioDi = u => (clienti.find(c => stessaPersona(c, u)) || {}).id
      || (utenti.find(x => x.uid !== u.uid && stessaPersona(x, u) && x.stato === 'approvato' && x.cliente) || {}).cliente || null;
    // (C93) Lo stesso nome in attesa su due telefoni (browser e app installata): Monica vede UNA richiesta,
    // la più nuova ('ricollega' viene dopo 'nuovo'); il Sì o il No vale anche per le altre («gemelli»).
    const attesa = utenti.filter(u => u.stato === 'nuovo' || u.stato === 'ricollega');
    const peso = u => (u.stato === 'ricollega' ? 2 : 1) * 1e9 + (u.primo ? 1 : 0);
    const capi = attesa.filter(u => !attesa.some(x => x !== u && stessaPersona(x, u) && (peso(x) > peso(u) || (peso(x) === peso(u) && x.uid > u.uid))));
    // Copia profonda: cambiare S non deve cambiare la copia del server, se no non si vede la differenza.
    const S = copia({
      versione: 1, motore: 'firebase', soloContanti, ingExtra, impostazioni: imp,
      piatti: tutti('piatti').sort((a, b) => (a.ordine || 0) - (b.ordine || 0)),
      clienti,
      ordini: tutti('ordini').sort((a, b) => (a.n || 0) - (b.n || 0)),
      prossimoNumero: (srv['contatori/ordini'] || {}).prossimo || 1,
      settimane: Object.keys(srv).filter(k => k.startsWith('settimane/')).reduce((o, k) => { o[k.slice(10)] = Math.max(0, srv[k].teglie || 0); return o; }, {}),
      utenti,
      spesa: srv['impostazioni/spesa'] || null,
      richieste: capi.map(u => ({ id: u.uid, nome: u.nome, codice: u.codice || '', nomiPrima: u.nomiPrima || [], tramite: nomeDi(u.tramite), il: u.il, stato: u.stato, primo: u.primo || null, cliente: vecchioDi(u),
        gemelli: attesa.filter(x => x !== u && stessaPersona(x, u)).map(x => x.uid) })),
      // «Persone rifiutate»: i telefoni a cui Monica ha detto No (può cambiare idea con «Accetta»)
      rifiutati: utenti.filter(u => u.stato === 'no').map(u => ({ id: u.uid, nome: u.nome, codice: u.codice || '', tramite: nomeDi(u.tramite), il: u.il, primo: u.primo || null }))
    });
    S.piatti.forEach(p => {
      p.foto = (srv['foto/' + p.id] || {}).foto || null;   // le foto sono testo: niente copia
      if (p.pronto && p.pronto.qta < 0) p.pronto.qta = 0;    // due cali insieme (Monica e un cliente): mai sotto zero
    });
    S.menuFoto = (imp.menuFotoV || []).map((v, i) => (srv['foto/menu-' + (i + 1)] || {}).foto || null);
    return S;
  }

  /* ---------- copia sul telefono: il menù si vede subito, anche senza rete ---------- */
  function copiaLocale() {
    try { const c = JSON.parse(localStorage.getItem(CHIAVE_COPIA)); return c && c.versione === 1 ? c : null; }
    catch (e) { return null; }
  }
  /* senza le foto (fino a 300 KB l'una, non ci starebbero): quelle le tiene la copia di Firestore */
  function salvaCopia(S) {
    const c = Object.assign({}, S, { piatti: S.piatti.map(p => p.foto && /^data:/.test(p.foto) ? Object.assign({}, p, { foto: null }) : p) });
    try { localStorage.setItem(CHIAVE_COPIA, JSON.stringify(c)); } catch (e) { /* telefono pieno: si rilegge dal server */ }
  }

  let tCambio = null;
  function avvisaCambio() {
    clearTimeout(tCambio);
    // Il cliente aspetta le impostazioni (senza, l'app non sa disegnarsi); Monica no: col database vuoto lo prepara lei.
    if (!srv['impostazioni/app'] && !(io.gestore && io.pronto)) return;
    tCambio = setTimeout(() => { prendiFoto(); base = Object.assign({}, srv); const S = stato(); if (io.pronto) salvaCopia(S); alCambio(S, Object.assign({}, io)); }, 30);
  }

  /* Foto: non si ascoltano (fino a 300 KB l'una; dopo 30 minuti fuori Firestore le rimanderebbe tutte e i 10 GB
     gratis del mese finirebbero). Il piatto dice la versione (fotoV): si prende dalla copia del telefono,
     e dal server solo se è cambiata. */
  const fotoVer = {}, fotoInArrivo = {};
  let fotoDalServer = 0;
  function prendiFoto() {
    const { doc, getDoc, getDocFromCache } = F.fs;
    const menu = ((srv['impostazioni/app'] || {}).menuFotoV || []).map((v, i) => ({ id: 'menu-' + (i + 1), fotoV: v }));
    [...tutti('piatti'), ...menu].forEach(p => {
      const k = 'foto/' + p.id, v = p.fotoV || null;
      if (!v) { if (k in srv) { delete srv[k]; delete fotoVer[k]; avvisaCambio(); } return; }
      if (fotoVer[k] === v || fotoInArrivo[k] === v) return;
      fotoInArrivo[k] = v;
      const r = doc(db, 'foto', p.id), giusta = s => !!s && s.exists() && versioneFoto(s.data().foto || '') === v;
      getDocFromCache(r).catch(() => null)
        .then(s => giusta(s) ? s : getDoc(r).then(x => { fotoDalServer++; return x; }, () => null))
        .then(s => {
          if (fotoInArrivo[k] === v) delete fotoInArrivo[k];
          if (!s) return;                       // senza rete: si riprova al prossimo cambio
          fotoVer[k] = v;                       // provata questa versione: niente giri a vuoto
          if (s.exists()) srv[k] = s.data(); else delete srv[k];
          avvisaCambio();
        });
    });
  }

  /* ---------- ascolti ---------- */
  /* Con la copia del telefono uguale al server, il passaggio «dalla copia» → «dal server» non porta dati nuovi:
     senza includeMetadataChanges non arriverebbe mai e Monica, riaperta l'app, non potrebbe salvare. */
  function ascolta(rif, col) {
    const singolo = !col;
    let primo = true;
    ascolti.push(F.fs.onSnapshot(rif, { includeMetadataChanges: true }, snap => {
      let cambiato = primo; primo = false;
      if (singolo) {
        const k = rif.path, prima = k in srv ? chiaro(srv[k]) : '';
        if (snap.exists()) srv[k] = snap.data(); else delete srv[k];
        if (prima !== (k in srv ? chiaro(srv[k]) : '')) cambiato = true;
      } else {
        const ch = snap.docChanges();   // solo i cambi di dati, non quelli dei metadati
        if (ch.length) cambiato = true;
        ch.forEach(c => {
          const k = col + '/' + c.doc.id;
          if (c.type === 'removed') delete srv[k];
          else srv[k] = col === 'utenti' ? Object.assign({ uid: c.doc.id }, c.doc.data()) : c.doc.data();
        });
      }
      if (!snap.metadata.fromCache && !io.pronto) { io.pronto = true; cambiato = true; }
      if (cambiato) avvisaCambio();
    }, err => {
      console.warn('ascolto', col || rif.path, err.code); alStato({ errore: err.code });
      // Un cliente a cui Monica ha appena cambiato lo stato (Accetta e poi Annulla): l'ascolto del suo documento
      // può restare indietro. Si rilegge dal server e si riaprono gli ascolti giusti (C14).
      if (err.code === 'permission-denied' && !io.gestore) rileggiUtente();
    }));
  }
  let tRilettura = 0, rilettura = null;
  function rileggiUtente() {   // al massimo una ogni 2 secondi, ma l'ultima non si perde mai
    if (!io.uid || rilettura) return;
    const attesa = Math.max(0, 2000 - (Date.now() - tRilettura));
    rilettura = setTimeout(() => { rilettura = null; tRilettura = Date.now(); rileggiOra(); }, attesa);
  }
  function rileggiOra() {
    (F.fs.getDocFromServer || F.fs.getDoc)(F.fs.doc(db, 'utenti', io.uid)).then(snap => {
      io.utente = snap.exists() ? snap.data() : null; io.letto = true;
      apriAscolti(); avvisaCambio();
    }, () => {});
  }
  function chiudiAscolti() { while (ascolti.length) ascolti.pop()(); }

  function apriAscolti() {
    chiudiAscolti();
    // cliente: quello che leggeva prima (indirizzo, scheda, ordini) si toglie: lo rimettono gli ascolti di adesso
    if (!io.gestore) Object.keys(srv).filter(k => /^(clienti\/|ordini\/|impostazioni\/approvati$)/.test(k)).forEach(k => delete srv[k]);
    const { doc, collection, query, where } = F.fs;
    ['piatti', 'settimane'].forEach(c => ascolta(collection(db, c), c));
    ascolta(doc(db, 'impostazioni', 'app'));
    if (io.gestore) {
      ['clienti', 'ordini', 'utenti'].forEach(c => ascolta(collection(db, c), c));
      ascolta(doc(db, 'impostazioni', 'approvati')); ascolta(doc(db, 'impostazioni', 'monica')); ascolta(doc(db, 'impostazioni', 'spesa')); ascolta(doc(db, 'contatori', 'ordini'));
      // chi gestisce e chi chiede di gestire (invito per Monica)
      ascolti.push(F.fs.onSnapshot(collection(db, 'gestori'), s => { io.gestoriLista = s.docs.map(d => ({ uid: d.id, nome: d.data().nome || '', codice: d.data().codice || '' })); avvisaCambio(); if (op.ridisegna) op.ridisegna(); prossimiCodici(); }, () => {}));
      ascolti.push(F.fs.onSnapshot(collection(db, 'richiesteGestore'), s => { io.richiesteGestore = s.docs.map(d => Object.assign({ uid: d.id }, d.data())); avvisaCambio(); if (op.ridisegna) op.ridisegna(); }, () => {}));
      return;
    }
    ascolta(doc(db, 'contatori', 'ordini'));
    ascolta(query(collection(db, 'ordini'), where('utente', '==', io.uid)), 'ordini');
    if (!io.anonimo) {
      // entrata con Google dall'invito: la sua richiesta, e il sì del gestore (allora l'app si riapre da gestore)
      ascolti.push(F.fs.onSnapshot(doc(db, 'richiesteGestore', io.uid), s => { io.richiestaMia = s.exists() ? s.data() : null; if (op.ridisegna) op.ridisegna(); }, () => {}));
      ascolti.push(F.fs.onSnapshot(doc(db, 'gestori', io.uid), s => { if (s.exists() && !io.gestore) location.reload(); }, () => {}));
    }
    const u = io.utente;
    if (u && u.stato === 'approvato' && u.cliente) {
      ascolta(doc(db, 'impostazioni', 'approvati'));
      ascolta(doc(db, 'clienti', u.cliente));
      ascolta(query(collection(db, 'ordini'), where('cliente', '==', u.cliente)), 'ordini');
    }
  }

  /* ---------- chi sono: telefono anonimo, o Monica con Google ---------- */
  async function chiSono(user) {
    const { doc, getDoc, getDocFromCache, onSnapshot } = F.fs;
    if (io.uid !== user.uid) { chiudiAscolti(); [srv, fotoVer].forEach(o => Object.keys(o).forEach(k => delete o[k])); base = null; io.pronto = false; }
    io.uid = user.uid;
    io.entrata = Date.parse(user.metadata && user.metadata.lastSignInTime) || 0;   // per il lucchetto: entrata appena fatta?
    io.nome = user.displayName || '';
    io.anonimo = !!user.isAnonymous; io.email = user.email || '';
    const rg = doc(db, 'gestori', user.uid);   // senza rete: dalla copia del telefono
    const sg = await getDoc(rg).catch(() => getDocFromCache(rg)).catch(() => null);
    io.gestore = sg?.exists() || false;
    io.nomeGestore = (io.gestore && sg.data() && sg.data().nome) || '';   // «Ciao <nome>» nella Home del gestore
    io.utente = null; io.letto = io.gestore;
    if (!io.gestore) {
      // Il documento utenti/ di questo telefono: quando Monica approva, si riaprono gli ascolti.
      let prima = null;
      ascoltoUtente && ascoltoUtente();
      ascoltoUtente = onSnapshot(doc(db, 'utenti', user.uid), snap => {
        io.utente = snap.exists() ? snap.data() : null; io.letto = true;
        const ora = io.utente ? io.utente.stato + '/' + io.utente.cliente : '';
        if (ora !== prima) { prima = ora; apriAscolti(); }
        avvisaCambio();
      }, () => { io.utente = null; io.letto = true; apriAscolti(); });
    } else { ascoltoUtente && ascoltoUtente(); ascoltoUtente = null; apriAscolti(); }
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
      if (uscito) return;
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
    if (!db || !io.gestore) return ultimaScrittura;
    const { doc, writeBatch, deleteField, increment } = F.fs;
    /* Confronto con la copia da cui S è nato (base), non con l'ultima arrivata: un cambio del server
       non ancora in S (Mario, un ordine nuovo) non viene riscritto né cancellato.
       La base può venire dalla copia di Firestore sul telefono (app aperta senza rete): le scritture
       restano in coda, anche ad app chiusa, e partono da sole quando torna la rete. */
    const rif = base || srv, nuovi = documenti(S, rif), b = writeBatch(db);
    const dopo = {};   // come diventa la base dopo questa scrittura: due salvataggi di fila non mandano due volte la stessa differenza
    let n = 0;
    Object.keys(nuovi).forEach(k => {
      const vecchio = rif[k], nuovo = nuovi[k];
      // Teglie della settimana: si scrive la differenza, non il numero, così gli ordini arrivati intanto restano contati
      if (k.startsWith('settimane/')) {
        const d = (nuovo.teglie || 0) - ((vecchio || {}).teglie || 0);
        if (d) { b.set(doc(db, k), { teglie: increment(d) }, { merge: true }); n++; dopo[k] = Object.assign({}, vecchio, { teglie: nuovo.teglie }); }
        return;
      }
      if (!vecchio) {
        // senza la copia del server non si creano impostazioni e contatore: sul server potrebbero esserci già
        if (!io.pronto && /^(impostazioni|contatori)\//.test(k)) return;
        b.set(doc(db, k), nuovo); n++; dopo[k] = nuovo; return;
      }
      const campi = {};
      Object.keys(nuovo).forEach(c => { if (chiaro(nuovo[c]) !== chiaro(vecchio[c])) campi[c] = nuovo[c]; });
      // Pronti dello stesso giorno e formato: solo la differenza, così quelli presi intanto dai clienti non tornano indietro
      const pv = vecchio.pronto, pn = nuovo.pronto;
      if (campi.pronto && k.startsWith('piatti/') && pv && pn && chiaro(Object.assign({}, pv, { qta: 0 })) === chiaro(Object.assign({}, pn, { qta: 0 }))) {
        delete campi.pronto; campi['pronto.qta'] = increment(arrot((pn.qta || 0) - (pv.qta || 0)));
      }
      if (k.startsWith('impostazioni/')) Object.keys(vecchio).forEach(c => { if (!(c in nuovo)) campi[c] = deleteField(); });
      if (Object.keys(campi).length) { b.update(doc(db, k), campi); n++; dopo[k] = k.startsWith('impostazioni/') ? nuovo : Object.assign({}, vecchio, nuovo); }
    });
    Object.keys(rif).forEach(k => {
      if (!(k in nuovi) && SCRIVIBILI.some(p => k.startsWith(p)) && !k.startsWith('impostazioni/') && !k.startsWith('contatori/')) { b.delete(doc(db, k)); n++; dopo[k] = null; }
    });
    if (!n) return ultimaScrittura;
    // S non è nato dai dati di Firestore (solo la copia dell'app, nei primi istanti): niente scritture alla cieca, e lo si dice
    if (!base) { alStato({ errore: 'non-pronto' }); return ultimaScrittura; }
    Object.keys(dopo).forEach(k => {
      if (dopo[k]) base[k] = dopo[k]; else delete base[k];
      // le foto non si ascoltano: quella scritta da Monica è già la copia giusta
      if (k.startsWith('foto/')) { if (dopo[k]) { srv[k] = dopo[k]; fotoVer[k] = versioneFoto(dopo[k].foto); } else { delete srv[k]; delete fotoVer[k]; } }
    });
    inAttesa++;
    clearTimeout(tAvviso);
    if (!navigator.onLine || !io.pronto) alStato({ rete: false, inAttesa });
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
    const S = Object.assign({}, iniziale, { clienti: [], ordini: [], richieste: [], rifiutati: [], prossimoNumero: 1 });
    S.piatti = S.piatti.map(p => Object.assign({}, p, { cuori: 0, pronto: null }));
    scrivi(S);
    return true;
  }

  /* ---------- clienti: nome, ordini e risposte, sempre «tutto o niente» ---------- */
  const errore = (code, extra) => Object.assign(new Error(code), { code }, extra || {});
  const approvato = () => !!(io.utente && io.utente.stato === 'approvato' && io.utente.cliente);
  /* (Mario 09/11, iPad: «a Monica escono 2 richieste anche se è la stessa persona») Chi ha corretto il nome su un telefono
     e poi apre l'app da un altro (iPhone dall'icona: memoria separata) ha una chiave nuova: si riconosce da qualunque nome
     che ha avuto (chiave, nome di adesso, nomi di prima), non solo dalla chiave della prima volta. */
  const nomiDi = x => [x.chiave, chiaveNome(x.nome || ''), chiaveNome(x.nomeCliente || ''), ...(x.nomiPrima || []).map(n => chiaveNome((n && n.nome) || ''))].filter(Boolean);
  const stessaPersona = (a, b) => { const na = nomiDi(a); return nomiDi(b).some(k => na.includes(k)); };
  const chiaveNome = nome => String(nome).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');

  // Il telefono si presenta: nome unico (nomi/), o «ricollega» se è lo stesso nome su un telefono nuovo.
  async function registra(nome, tramite, ricollega) {
    if (!ricollega && (srv['impostazioni/app'] || {}).nuovi === false) throw errore('chiuso');   // chi c'è già rientra anche a porta chiusa
    if (!navigator.onLine) throw errore('unavailable');
    const chiave = chiaveNome(nome);
    if (!chiave || nome.length < 2 || nome.length > 60) throw errore('nome');
    const { doc, writeBatch } = F.fs, b = writeBatch(db);
    const u = { nome, chiave, tramite: String(tramite || '').slice(0, 40), il: op.oggi(), stato: ricollega ? 'ricollega' : 'nuovo', cliente: null, primo: null, codice: nuovoCodice() };
    b.set(doc(db, 'utenti', io.uid), u);
    if (!ricollega) b.set(doc(db, 'nomi', chiave), { il: u.il });
    try { await b.commit(); }
    catch (e) {
      // (C99) regole vecchie sul server: non conoscono il codice → di nuovo senza (lo assegna poi chi gestisce)
      if (e.code !== 'permission-denied') throw e;
      delete u.codice;
      const b2 = writeBatch(db);
      b2.set(doc(db, 'utenti', io.uid), u);
      if (!ricollega) b2.set(doc(db, 'nomi', chiave), { il: u.il });
      await b2.commit();
    }
    io.utente = u; io.letto = true; avvisaCambio();
  }

  // Quanto prende un ordine dai «pronti» (per piatto) e dalle teglie della settimana.
  const fuori = ['annullato', 'rifiutato', 'daApprovare', 'prova'];
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

  /* ---------- Monica decide su un telefono nuovo: Sì (cliente nuovo o ricollega) o No ---------- */
  // Tutto o niente: utenti/, clienti/, il primo ordine, i pronti e le teglie della settimana.
  // Se nel frattempo i pronti sono finiti, l'ordine resta da fare in un altro giorno (pronto: false).
  // Restituisce i pronti finiti e «annulla» per i 10 secondi dell'avviso.
  async function decidi(uid, si) {
    if (!io.gestore) throw errore('permission-denied');
    if (!navigator.onLine) throw errore('unavailable');
    const { doc, runTransaction } = F.fs, nuovoId = 'c' + Date.now().toString(36);
    const r = await runTransaction(db, async t => {
      const uS = await t.get(doc(db, 'utenti', uid));
      // Un telefono nuovo, oppure (solo con Sì) uno a cui Monica aveva detto No e ha ripensato.
      if (!uS.exists() || !(['nuovo', 'ricollega'].includes(uS.data().stato) || (si && uS.data().stato === 'no'))) throw errore('gia');
      const u = uS.data(), eraNo = u.stato === 'no';
      const oS = u.primo ? await t.get(doc(db, 'ordini', u.primo)) : null;
      const o = oS && oS.exists() && (oS.data().stato === 'daApprovare' || (eraNo && oS.data().stato === 'rifiutato' && !oS.data().cliente)) ? oS.data() : null;
      let vecchio = si ? tutti('clienti').find(c => stessaPersona(c, u)) || null : null;   // anche un «nuovo» col nome corretto altrove: stesso cliente
      // (C93) Nessun cliente ancora con quel nome: forse un altro telefono con lo stesso nome è appena stato approvato
      // (la copia locale dei clienti può non averlo ancora): lo leggo dentro la transazione, così mai due clienti uguali.
      if (si && !vecchio && u.chiave) {
        for (const x of tutti('utenti').filter(x => x.uid !== uid && stessaPersona(x, u))) {
          const xS = await t.get(doc(db, 'utenti', x.uid));
          if (xS.exists() && xS.data().stato === 'approvato' && xS.data().cliente) { vecchio = { id: xS.data().cliente }; break; }
        }
      }
      const cliente = si ? (vecchio ? vecchio.id : nuovoId) : null;
      const dopo = o ? Object.assign({}, o, si ? { stato: 'nuovo', cliente } : { stato: 'rifiutato' }) : null;
      const vuole = presi(dopo), piatti = {}, finiti = [];
      for (const k of Object.keys(vuole)) piatti[k] = await t.get(doc(db, 'piatti', k));
      Object.keys(vuole).forEach(k => {
        const p = piatti[k].exists() ? piatti[k].data() : null;
        if (!p || !p.pronto || p.pronto.giorno !== op.oggi() || p.pronto.qta < vuole[k]) finiti.push(p ? p.nome : k);
      });
      if (finiti.length) dopo.pronto = false;
      const preso = finiti.length ? {} : vuole, tg = teglie(dopo), sett = {};
      for (const k of Object.keys(tg)) sett[k] = await t.get(doc(db, 'settimane', k));
      // prima tutte le letture, poi le scritture
      // (C99) il cliente nuovo prende il codice del suo telefono; «ricollega» tiene quello del cliente che c'è già
      if (si && !vecchio) t.set(doc(db, 'clienti', cliente), Object.assign({ id: cliente, nome: u.nome, chiave: u.chiave, da: op.oggi(), tramite: u.tramite || '' },
        u.codice && !tutti('clienti').some(c => c.codice === u.codice) ? { codice: u.codice } : {}, u.nomiPrima ? { nomiPrima: u.nomiPrima } : {}));
      t.update(doc(db, 'utenti', uid), si ? { stato: 'approvato', cliente } : { stato: 'no', era: u.stato });
      if (o) t.update(doc(db, 'ordini', u.primo), { stato: dopo.stato, cliente: dopo.cliente, pronto: !!dopo.pronto });
      Object.keys(preso).forEach(k => {
        const pr = piatti[k].data().pronto;
        t.update(doc(db, 'piatti', k), { pronto: Object.assign({}, pr, { qta: arrot(pr.qta - preso[k]) }), ultimoOrdine: u.primo });
      });
      Object.keys(tg).forEach(k => t.set(doc(db, 'settimane', k), { teglie: (sett[k].exists() ? sett[k].data().teglie || 0 : 0) + tg[k], ultimo: u.primo }));
      return { u, o, dopo, cliente, creato: si && !vecchio, preso, tg, finiti };
    });
    return { finiti: r.finiti, annulla: () => annullaDecisione(uid, r) };
  }
  // Rimette tutto com'era prima del Sì o del No (se nel frattempo nessuno l'ha cambiato).
  async function annullaDecisione(uid, r) {
    if (!navigator.onLine) throw errore('unavailable');
    const { doc, runTransaction } = F.fs;
    await runTransaction(db, async t => {
      const uS = await t.get(doc(db, 'utenti', uid));
      if (!uS.exists() || uS.data().stato !== (r.cliente ? 'approvato' : 'no')) throw errore('gia');
      const oS = r.o ? await t.get(doc(db, 'ordini', r.u.primo)) : null;
      const torna = !!(oS && oS.exists() && oS.data().stato === r.dopo.stato);   // il cliente non l'ha cambiato
      const piatti = {}, sett = {};
      if (torna) {
        for (const k of Object.keys(r.preso)) piatti[k] = await t.get(doc(db, 'piatti', k));
        for (const k of Object.keys(r.tg)) sett[k] = await t.get(doc(db, 'settimane', k));
      }
      t.set(doc(db, 'utenti', uid), Object.assign({}, r.u, uS.data().codice ? { codice: uS.data().codice } : {}));   // (C99) il codice resta
      if (r.creato) t.delete(doc(db, 'clienti', r.cliente));
      if (!torna) return;
      t.update(doc(db, 'ordini', r.u.primo), { stato: r.o.stato, cliente: r.o.cliente, pronto: !!r.o.pronto });
      Object.keys(r.preso).forEach(k => {
        const p = piatti[k].exists() ? piatti[k].data() : null;
        if (p && p.pronto && p.pronto.giorno === op.oggi()) t.update(doc(db, 'piatti', k), { pronto: Object.assign({}, p.pronto, { qta: arrot(p.pronto.qta + r.preso[k]) }) });
      });
      Object.keys(r.tg).forEach(k => t.set(doc(db, 'settimane', k), { teglie: Math.max(0, (sett[k].exists() ? sett[k].data().teglie || 0 : 0) - r.tg[k]), ultimo: r.u.primo }));
    });
  }

  /* ---------- (C99) codice fisso dei profili e nome che la persona corregge ---------- */
  const LETTERE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // niente O, I, 0, 1: non si confondono a voce
  function nuovoCodice(usati) {
    for (;;) {
      let c = '';
      for (let i = 0; i < 5; i++) c += LETTERE[Math.floor(Math.random() * LETTERE.length)];
      if (/[2-9]/.test(c) && !(usati && usati.has(c))) return c;
    }
  }
  const codiciUsati = () => new Set([...tutti('clienti'), ...tutti('utenti'), ...(io.gestoriLista || [])].map(x => x.codice).filter(Boolean));
  // Chi gestisce dà il codice, una volta sola, a chi non l'ha ancora (persone arrivate prima della v0.9.71).
  let codiciFatti = false, tCodici = null;
  function prossimiCodici() { if (!codiciFatti) { clearTimeout(tCodici); tCodici = setTimeout(() => assegnaCodici().catch(e => console.warn('codici', e.code)), 4000); } }
  async function assegnaCodici() {
    if (codiciFatti || !io.gestore || !io.pronto || !navigator.onLine || !io.gestoriLista) return 0;
    const usati = codiciUsati();
    const daFare = [];
    tutti('clienti').filter(c => !c.codice).forEach(c => daFare.push(['clienti', c.id]));
    tutti('utenti').filter(u => !u.codice && u.stato !== 'approvato').forEach(u => daFare.push(['utenti', u.uid]));
    io.gestoriLista.filter(g => !g.codice).forEach(g => daFare.push(['gestori', g.uid, g.nome]));
    codiciFatti = true;
    if (!daFare.length) return 0;
    const { doc, runTransaction } = F.fs;
    return runTransaction(db, async t => {
      const letti = [];
      for (const d of daFare.slice(0, 200)) letti.push([d, await t.get(doc(db, d[0], d[1]))]);
      let n = 0;
      letti.forEach(([d, sn]) => {
        if (!sn.exists() || sn.data().codice) return;   // intanto l'ha dato un altro telefono di chi gestisce
        let c = '';
        if (d[0] === 'gestori') {
          const nome = String(d[2] || '').toLowerCase();
          c = /\bmario\b/.test(nome) && !usati.has('MARIO') ? 'MARIO' : /\bmonica\b/.test(nome) && !usati.has('MONICA') ? 'MONICA' : 'G' + nuovoCodice(usati).slice(0, 4);
        } else c = nuovoCodice(usati);
        usati.add(c); n++;
        t.update(doc(db, d[0], d[1]), { codice: c });
      });
      return n;
    });
  }
  // Il cliente corregge il suo nome: prima del sì in utenti/, dopo in clienti/ («nome del cliente»). La storia dice com'era.
  async function cambiaNome(nome) {
    nome = String(nome || '').replace(/\s+/g, ' ').trim();
    if (nome.length < 2 || nome.length > 60) throw errore('nome');
    if (!navigator.onLine) throw errore('unavailable');
    const u = io.utente;
    if (!u) throw errore('nome');
    const { doc, updateDoc } = F.fs, il = new Date().toISOString().slice(0, 16);
    if (u.stato === 'approvato' && u.cliente) {
      const c = srv['clienti/' + u.cliente] || {}, prima = c.nomeCliente || u.nome;
      if (prima === nome) return;
      await updateDoc(doc(db, 'clienti', u.cliente), { nomeCliente: nome, nomiPrima: [...(c.nomiPrima || []), { nome: prima, chi: 'cliente', il }].slice(-30) });
    } else {
      if (u.nome === nome) return;
      await updateDoc(doc(db, 'utenti', io.uid), { nome, nomiPrima: [...(u.nomiPrima || []), { nome: u.nome, chi: 'cliente', il }].slice(-30) });
    }
  }
  // Il nome che vede il cliente: il suo (corretto da lui), non quello che usa Monica.
  function mioNome() {
    const u = io.utente; if (!u) return '';
    const c = u.cliente ? srv['clienti/' + u.cliente] : null;
    return (c && c.nomeCliente) || u.nome || '';
  }
  function mioCodice() {
    const u = io.utente;
    if (io.gestore) return ((io.gestoriLista || []).find(g => g.uid === io.uid) || {}).codice || '';
    if (!u) return '';
    const c = u.cliente ? srv['clienti/' + u.cliente] : null;
    return (c && c.codice) || u.codice || '';
  }

  async function entraGoogle() {
    const au = F.au, provider = new au.GoogleAuthProvider();
    await au.signInWithPopup(auth, provider);
  }
  /* il lucchetto non si apre (chiave persa, telefono cambiato): di nuovo Google, solo con lo stesso account */
  async function rientra() {
    const au = F.au;
    await au.reauthenticateWithPopup(auth.currentUser, new au.GoogleAuthProvider());
    io.entrata = Date.now();
  }
  /* «Esci da questo telefono»: via la copia dei dati (anche quella di Firestore) e l'account;
     poi l'app si ricarica e il telefono torna un cliente anonimo nuovo */
  /* invito per gestire: chi è entrato con Google chiede; un gestore dice sì o no; un gestore ne toglie un altro (mai sé stesso) */
  async function chiediGestore() {
    const u = auth.currentUser;
    if (!u || u.isAnonymous) throw errore('google');
    if (!navigator.onLine) throw errore('unavailable');
    const { doc, setDoc } = F.fs;
    await setDoc(doc(db, 'richiesteGestore', u.uid), { nome: String(u.displayName || u.email || 'Senza nome').slice(0, 60), email: u.email, quando: new Date().toISOString().slice(0, 16) });
  }
  async function decidiGestore(uid, nome, si) {
    if (!io.gestore) throw errore('permission-denied');
    if (!navigator.onLine) throw errore('unavailable');
    const { doc, writeBatch } = F.fs, b = writeBatch(db);
    if (si) b.set(doc(db, 'gestori', uid), { nome: String(nome || 'Gestore').slice(0, 40) });
    b.delete(doc(db, 'richiesteGestore', uid));
    await b.commit();
  }
  async function togliGestore(uid) {
    if (!io.gestore || uid === io.uid) throw errore('permission-denied');
    if (!navigator.onLine) throw errore('unavailable');
    await F.fs.deleteDoc(F.fs.doc(db, 'gestori', uid));
  }
  async function esci() {
    // modifiche non ancora arrivate al server: uscendo si perderebbero
    const inviate = await Promise.race([F.fs.waitForPendingWrites(db).then(() => true, () => false), new Promise(r => setTimeout(() => r(false), 3000))]);
    if (!inviate) throw errore('in-attesa');
    uscito = true;
    chiudiAscolti(); if (ascoltoUtente) { ascoltoUtente(); ascoltoUtente = null; }
    await F.fs.terminate(db).catch(() => {});
    await F.fs.clearIndexedDbPersistence(db).catch(() => {});
    try { localStorage.removeItem(CHIAVE_COPIA); } catch (e) { /* niente */ }
    await F.au.signOut(auth);
  }

  return {
    attivo, emulatore: EMULATORE, io, copiaLocale, avvia, scrivi, preparaVuoto, entraGoogle, rientra, esci, registra, inviaOrdini, decidi, assegnaCodici, cambiaNome, mioNome, mioCodice, nuovoCodice, chiediGestore, decidiGestore, togliGestore,
    token: () => (auth && auth.currentUser && !auth.currentUser.isAnonymous) ? auth.currentUser.getIdToken() : Promise.resolve(null),   // per le notifiche (worker.js)
    tokenCliente: () => (auth && auth.currentUser) ? auth.currentUser.getIdToken() : Promise.resolve(null),   // avviso «è pronto» al cliente (C25)
    confermato: () => ultimaScrittura,
    haDati: () => !!base,
    fotoDalServer: () => fotoDalServer,
    inAttesa: () => inAttesa
  };
})();
