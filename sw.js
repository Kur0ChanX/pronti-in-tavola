/* Pronti in Tavola · service worker: l'app si apre anche senza rete (C3).
   Pagina e file dell'app: prima la rete (le novità arrivano subito); senza rete, o dopo 3 secondi, la copia.
   Libreria Firebase (versione fissa, uguale a FIREBASE_VERSIONE di dati.js) e caratteri: dalla copia, la rete solo la prima volta.
   Dati (Firestore) e accesso (Google): non si toccano, li gestisce Firebase con la sua copia. */
'use strict';
const VERSIONE_FB = '13.2.0';
const CACHE = 'pit-' + VERSIONE_FB;
const FB = 'https://www.gstatic.com/firebasejs/' + VERSIONE_FB + '/';
const GUSCIO = ['./', 'style.css', 'data.js', 'dati.js', 'opzioni.js', 'lucchetto.js', 'vapore.js', 'guida-iphone.js', 'app.js', 'spesa.js', 'aiutante.js', 'voce-clienti.js', 'voce-piper.js', 'voce-kokoro.js', 'foto-ai.js', 'ricettario.js', 'manifest.webmanifest',
  'media/icon-192.png', 'media/icon-512.png', 'media/badge-96.png', 'media/logo-480.webp', 'media/logo-firma.webp', 'media/logo-medaglione.webp', 'media/logo-titolo.webp',
  'media/ynoy-firma.png', 'media/ynoy-scritta.png', 'media/ynoy-luna-1.png', 'media/ynoy-luna-2.png', 'media/ynoy-luna-3.png', 'media/ynoy-luna-4.png'];
const LIBRERIA = ['firebase-app.js', 'firebase-firestore.js', 'firebase-auth.js'].map(f => FB + f);
const fisso = u => u.startsWith(FB) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(GUSCIO).then(() => Promise.all(LIBRERIA.map(u => c.add(new Request(u, { mode: 'cors' })).catch(() => {})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pit-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const metti = (r, x) => { if (x.ok) { const c = x.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return x; };
function primaRete(r) {
  const copia = () => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('./') : undefined));
  return new Promise(fine => {
    let fatto = false;
    const dai = x => { if (x && !fatto) { fatto = true; fine(x); } };
    const t = setTimeout(() => copia().then(dai), 3000);   // rete lentissima: intanto la copia
    fetch(r).then(x => { clearTimeout(t); dai(metti(r, x)); },
      () => copia().then(m => { clearTimeout(t); dai(m || Response.error()); }));
  });
}
/* notifica degli ordini (worker.js la manda senza contenuto: il testo è qui) */
/* che notifica è lo dice /api/ultimo (ordine nuovo o promemoria della sera); senza risposta: ordine nuovo */
self.addEventListener('push', e => {
  const mostra = u => {
    const t = (u && u.tipo) || 'ordine';
    const T = {   // titolo, testo (C27: il tocco apre il punto giusto dell'app)
      promemoria: ['Domani si cucina 🍝', `Domani hai ${u && u.n === 1 ? '1 ordine' : ((u && u.n) || 0) + ' ordini'} da preparare. Tocca per vedere cosa cucinare.`],
      pronto: ['Il tuo ordine è pronto! 🍝', 'Passa a ritirarlo quando vuoi. Tocca per vedere l\'indirizzo.'],
      proposta: ['Monica ti propone un altro giorno 🍝', 'Tocca per rispondere: «Va bene» o «Un altro giorno».'],
      richiesta: ['Una persona nuova vuole ordinare 🍝', 'Tocca per vedere chi è e accettarla.'],
      ordineProva: ['Ordine di PROVA', 'Un cliente sta provando l\'app: non è da cucinare. Tocca per vederlo.'],
      primo: ['Una persona nuova ha ordinato: accettala 🍝', 'Il suo primo ordine aspetta il tuo sì. Tocca per vedere chi è.'],
      risposta: ['Un cliente ha risposto sul giorno 🍝', 'Tocca per vedere la sua risposta.'],
      modifica: ['Un cliente chiede una modifica 🍝', 'Tocca per vedere cosa cambia.'],
      esagera: ({   // (C109) solo a Mario: nessuno viene mai fermato
        ridotto: ['Un cliente usa tantissimo l\'aiutante ⚠️', 'Ora gli risponde il telefono, senza AI: non è fermato. Tocca per vedere chi è.'],
        raffica: ['Tante domande in un minuto da un cliente ⚠️', 'Telefono inceppato? Per un minuto risponde il telefono, senza AI. Tocca per i dettagli.'],
        quota80: ['Aiutante dei clienti: domande di oggi quasi finite', 'Siamo all\'80%. Nessuno è fermato. Tocca per i dettagli.'],
        quota: ['Aiutante dei clienti: domande di oggi finite', 'Fino a domani risponde il telefono, senza AI. Nessuno è fermato.'],
        ascolto: ['Un cliente usa molto il microfono', 'Nessuno è stato fermato. Tocca per vedere i dettagli.'],
        ascoltoQuota: ['Microfono dei clienti molto usato oggi', 'Oltre 400 frasi: ora ascoltano solo Groq e Deepgram. Nessuno è fermato.']
      })[u && u.cosa] || ['Un cliente usa molto l\'aiutante', 'Nessuno è stato fermato. Tocca per vedere i dettagli.'],
      chiusi: ['Una persona nuova non riesce a entrare 🔒', '«Accetta clienti nuovi» è spento. Tocca per riaprire.'],   // (C104)
      qui: [`${(u && u.prova) ? 'PROVA · ' : ''}${(u && u.nome) || 'Un cliente'} è qui per il ritiro 🍝`, `${u && u.n ? 'Ordine n. ' + u.n + '. ' : ''}Tocca per vederlo.`],
      ordine: ['Pronti in Tavola', 'Hai un ordine nuovo da guardare 🍝']
    };
    const tipo = t === 'promemoria' && !(u.n > 0) ? 'ordine' : (T[t] ? t : 'ordine');
    return self.registration.showNotification(T[tipo][0], {
      body: T[tipo][1], icon: 'media/icon-192.png', badge: 'media/badge-96.png', tag: tipo, renotify: true,
      requireInteraction: ['richiesta', 'primo', 'ordine', 'qui', 'chiusi'].includes(tipo),
      vibrate: tipo === 'qui' ? [2500, 200, 2500, 200, 2500, 200, 2500] : [300, 150, 300, 150, 300],   // «sono qui»: vibra come una chiamata (C51)
      data: { url: './#vai=' + (tipo === 'qui' && u.n ? 'qui_' + u.n : tipo), tipo: tipo === 'qui' && u.n ? 'qui_' + u.n : tipo } })
      /* con l'app aperta suona anche lei, forte, finché Monica tocca «Ho visto» (C51) */
      .then(() => tipo === 'qui' ? self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cc => cc.forEach(c => c.postMessage({ suona: { nome: (u && u.nome) || '', n: (u && u.n) || 0, prova: !!(u && u.prova) } }))) : null);
  };
  e.waitUntil(self.registration.pushManager.getSubscription().catch(() => null)
    .then(sub => fetch('/api/ultimo' + (sub ? '?e=' + encodeURIComponent(sub.endpoint) : ''), { cache: 'no-store' })).then(r => r.json()).catch(() => null)
    .then(u => mostra(u && u.quando && Date.now() - u.quando < 6 * 3600e3 ? u : null)));
});
/* iscrizione scaduta o cambiata dal telefono: se ne prende subito una nuova con la stessa chiave;
   la manda a worker.js l'app alla prossima apertura (rinnovaAvvisi), perché qui manca l'accesso Google */
self.addEventListener('pushsubscriptionchange', e => {
  const k = e.oldSubscription && e.oldSubscription.options && e.oldSubscription.options.applicationServerKey;
  if (k) e.waitUntil(self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: k }).catch(() => {}));
});
/* tocco sulla notifica: apre l'app (o la porta davanti se è già aperta) */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cc => {
    const c = cc.find(x => new URL(x.url).origin === location.origin), d = e.notification.data || {};
    if (c) { c.postMessage({ vai: d.tipo || 'ordine' }); return c.focus(); }   // app già aperta: le dice cosa mostrare
    return clients.openWindow(d.url || './');
  }));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (fisso(r.url)) { e.respondWith(caches.match(r).then(m => m || fetch(r).then(x => metti(r, x)))); return; }
  // foto delle ricette scaricate (ricettario «📥 Scarica»): dalla copia sul telefono, così si vedono senza rete
  if (/^https:\/\/www\.giallozafferano\.it\/images\//.test(r.url)) { e.respondWith(caches.open('gz-foto').then(c => c.match(r.url)).then(m => m || fetch(r))); return; }
  if (new URL(r.url).origin !== location.origin) return;
  if (/\.onnx$/.test(new URL(r.url).pathname)) return;   // (C119) il modello dell'AI delle foto (5 MB) lo tiene foto-ai.js nella sua memoria: niente seconda copia
  e.respondWith(primaRete(r));
});
