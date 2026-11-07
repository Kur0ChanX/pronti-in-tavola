/* Vapore di cottura dopo lo sblocco (Mario 07/11, scelto «A Pentola», poi ritoccato):
   1. tanto vapore: non si vede nulla;
   2. la schermata appare in penombra dietro il vapore;
   3. sbuffi densi salgono a ondate dal basso, come da una pentola, finché la schermata è nitida.
   requestAnimationFrame segue lo schermo: sui telefoni a 120 Hz gira a 120 fotogrammi da solo.
   Si salta con un tocco; chi ha «riduci animazioni» vede solo una dissolvenza breve. */
const Vapore = (() => {
  const STILI = { A: 'Pentola' };
  let attivo = null;
  const liscio = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
  const caso = (a, b) => a + Math.random() * (b - a);

  /* sbuffo irregolare: tanti batuffoli morbidi uno sull'altro, disegnato una volta sola */
  function sbuffo(colore) {
    const n = 160, c = document.createElement('canvas'); c.width = c.height = n;
    const g = c.getContext('2d');
    for (let i = 0; i < 9; i++) {
      const x = n / 2 + caso(-.2, .2) * n, y = n / 2 + caso(-.16, .16) * n, r = caso(.18, .32) * n;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `rgba(${colore},.42)`); rg.addColorStop(.5, `rgba(${colore},.2)`); rg.addColorStop(1, `rgba(${colore},0)`);
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 6.29); g.fill();
    }
    return c;
  }

  function parti(stile = 'A', fatto) {
    if (attivo) attivo.ferma();
    const app = document.getElementById('app');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !app) {
      if (app) app.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' }); if (fatto) fatto(); return;
    }
    const D = 2600, dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    const velo = document.createElement('div'); velo.className = 'vapore'; velo.setAttribute('aria-hidden', 'true');
    const cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    velo.appendChild(cv); document.body.appendChild(velo);
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const forme = [sbuffo('255,255,255'), sbuffo('255,253,248'), sbuffo('250,242,230'), sbuffo('255,255,255')];
    const pp = [];
    // il muro iniziale: copre tutto lo schermo
    for (let i = 0; i < 46; i++) pp.push({ muro: true, x: caso(-.1, 1.1) * W, y: caso(-.1, 1.1) * H, r: caso(.32, .55) * W + 60, f: forme[i % 4], rot: caso(0, 6.28), vx: caso(-30, 30), vy: -caso(60, 180), a: caso(.8, 1) });
    // tre ondate dalla pentola (dal basso), sempre più leggere
    [[.12, 1], [.36, .85], [.58, .65]].forEach(([parte, forza], w) => {
      for (let i = 0; i < 34; i++) pp.push({ x: caso(-.05, 1.05) * W, y: H + caso(0, .25) * H, r: caso(.16, .32) * W + 30, f: forme[(i + w) % 4], rot: caso(0, 6.28), vr: caso(-.5, .5),
        parte: parte + caso(0, .1), vita: caso(.42, .55), sale: caso(.9, 1.35) * H, ondeggia: caso(12, 34), fase: caso(0, 6.28), a: caso(.75, 1) * forza });
    });
    app.style.opacity = '0';
    const t0 = performance.now(); let fine = false, entrata = false, rq = 0;
    function ferma() {
      if (fine) return; fine = true; cancelAnimationFrame(rq);
      velo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).onfinish = () => velo.remove();
      if (!entrata) app.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
      app.style.opacity = ''; attivo = null; if (fatto) fatto();
    }
    function giro() {
      const t = (performance.now() - t0) / D; if (t >= 1) return ferma();
      g.clearRect(0, 0, W, H);
      // penombra: la schermata c'è, ma in ombra calda, e si schiarisce mentre il vapore sale
      const ombra = .5 * (1 - liscio((t - .3) / .55));
      if (ombra > .005) { g.globalAlpha = ombra; g.fillStyle = '#2B160E'; g.fillRect(0, 0, W, H); }
      // vapore pieno: all'inizio non si vede nulla
      const pieno = 1 - liscio((t - .14) / .3);
      if (pieno > .005) { g.globalAlpha = pieno; g.fillStyle = '#F6EFE4'; g.fillRect(0, 0, W, H); }
      for (const p of pp) {
        let x, y, r, a;
        if (p.muro) {   // il muro si alza e si apre
          const u = t * 1.6; x = p.x + p.vx * u; y = p.y + p.vy * u - liscio((t - .12) / .45) * H * .5; r = p.r * (1 + u * .5);
          a = p.a * (1 - liscio((t - .16) / .36));
        } else {
          const u = (t - p.parte) / p.vita; if (u <= 0 || u >= 1) continue;
          x = p.x + Math.sin(u * 4 + p.fase) * p.ondeggia; y = p.y - p.sale * (u * (.55 + u * .45)); r = p.r * (.7 + u * 1.5);
          a = p.a * liscio(u / .18) * (1 - liscio((u - .45) / .55));
        }
        if (a <= .01) continue;
        g.globalAlpha = a; g.save(); g.translate(x, y); g.rotate(p.rot + (p.vr || 0) * t * 2); g.drawImage(p.f, -r, -r, r * 2, r * 2); g.restore();
      }
      g.globalAlpha = 1;
      if (!entrata && t > .2) {   // la schermata entra dietro il vapore, già al suo posto quando si schiarisce
        entrata = true; app.style.opacity = '';
        app.animate([{ transform: 'scale(1.025) translateY(10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: D * .6, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
      rq = requestAnimationFrame(giro);
    }
    velo.addEventListener('pointerdown', ferma, { once: true });
    rq = requestAnimationFrame(giro);
    attivo = { ferma };
  }
  return { parti, STILI };
})();
