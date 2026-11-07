/* Pronti in Tavola · service worker: l'app si apre anche senza rete (C3).
   Pagina e file dell'app: prima la rete (le novità arrivano subito); senza rete, o dopo 3 secondi, la copia.
   Libreria Firebase (versione fissa, uguale a FIREBASE_VERSIONE di dati.js) e caratteri: dalla copia, la rete solo la prima volta.
   Dati (Firestore) e accesso (Google): non si toccano, li gestisce Firebase con la sua copia. */
'use strict';
const VERSIONE_FB = '13.2.0';
const CACHE = 'pit-' + VERSIONE_FB;
const FB = 'https://www.gstatic.com/firebasejs/' + VERSIONE_FB + '/';
const GUSCIO = ['./', 'style.css', 'data.js', 'dati.js', 'lucchetto.js', 'app.js', 'spesa.js', 'manifest.webmanifest',
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
    const sera = u && u.tipo === 'promemoria' && u.n > 0;
    return self.registration.showNotification(sera ? 'Domani si cucina 🍝' : 'Pronti in Tavola', {
      body: sera ? `Domani hai ${u.n === 1 ? '1 ordine' : u.n + ' ordini'} da preparare. Tocca per vedere cosa cucinare.` : 'Hai un ordine nuovo da guardare 🍝',
      icon: 'media/icon-192.png', badge: 'media/badge-96.png', tag: sera ? 'promemoria' : 'ordine', renotify: true, data: { url: './' } });
  };
  e.waitUntil(fetch('/api/ultimo', { cache: 'no-store' }).then(r => r.json()).catch(() => null)
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
    const c = cc.find(x => new URL(x.url).origin === location.origin);
    return c ? c.focus() : clients.openWindow((e.notification.data && e.notification.data.url) || './');
  }));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (fisso(r.url)) { e.respondWith(caches.match(r).then(m => m || fetch(r).then(x => metti(r, x)))); return; }
  if (new URL(r.url).origin !== location.origin) return;
  e.respondWith(primaRete(r));
});
