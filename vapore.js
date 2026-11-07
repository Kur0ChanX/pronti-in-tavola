/* Vapore di cucina dopo lo sblocco (Mario 07/11): tutta la pagina si riempie di vapore,
   poi si dirada e appare la schermata. requestAnimationFrame segue lo schermo:
   sui telefoni a 120 Hz gira a 120 fotogrammi al secondo da solo.
   Tre stili da scegliere (A pentola · B nebbia che si apre · C coperchio).
   Si salta con un tocco; chi ha «riduci animazioni» vede solo una dissolvenza breve. */
const Vapore = (() => {
  const STILI = { A: 'Pentola', B: 'Nebbia che si apre', C: 'Coperchio' };
  let attivo = null;

  function sprite(colore) {           // una nuvoletta morbida disegnata una volta sola: poi solo drawImage (leggero)
    const c = document.createElement('canvas'), n = 128; c.width = c.height = n;
    const g = c.getContext('2d'), r = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    r.addColorStop(0, `rgba(${colore},.55)`); r.addColorStop(.45, `rgba(${colore},.28)`); r.addColorStop(1, `rgba(${colore},0)`);
    g.fillStyle = r; g.fillRect(0, 0, n, n); return c;
  }
  const liscio = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
  const caso = (a, b) => a + Math.random() * (b - a);

  function parti(stile = 'A', fatto) {
    if (attivo) attivo.ferma();
    const app = document.getElementById('app');
    const riduci = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (riduci || !app) { if (app) app.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' }); if (fatto) fatto(); return; }
    const D = { A: 1900, B: 1800, C: 1700 }[stile] || 1900;
    const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    const velo = document.createElement('div'); velo.className = 'vapore'; velo.setAttribute('aria-hidden', 'true');
    const cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    velo.appendChild(cv); document.body.appendChild(velo);
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    // fondo: cucina calda e scura (A, C) dove il vapore bianco risalta; B tutta nebbia bianca
    const fondo = (() => { if (stile === 'B') return '#FFFDF8';
      const f = g.createRadialGradient(W / 2, H * .62, 0, W / 2, H * .62, Math.hypot(W, H) * .7);
      f.addColorStop(0, '#7A3524'); f.addColorStop(.55, '#4A1E14'); f.addColorStop(1, '#22100B'); return f; })();
    const bianco = sprite('255,255,255'), caldo = sprite(stile === 'B' ? '250,236,214' : '255,236,210');
    const N = Math.round(Math.min(stile === 'B' ? 110 : 160, Math.max(70, W * H / (stile === 'B' ? 4200 : 2600))));
    const cx = W / 2, cy = H * .55, diag = Math.hypot(W, H);
    const pp = [];
    for (let i = 0; i < N; i++) {
      const p = { s: Math.random() < .3 ? caldo : bianco, rot: caso(0, 6.28), vr: caso(-.4, .4), a: caso(.6, 1) };
      if (stile === 'A') Object.assign(p, { x: caso(-.1, 1.1) * W, y: H + caso(0, H * .3), r: caso(.07, .2) * W + 20, vx: caso(-25, 25), vy: -caso(.55, 1.05) * H, nasce: caso(0, .35) });
      else if (stile === 'B') { const ang = caso(0, 6.28), d = caso(0, .65) * diag; Object.assign(p, { x: cx + Math.cos(ang) * d * .7, y: cy + Math.sin(ang) * d * .7, ang, r: caso(.3, .6) * W + 60, nasce: 0, a: caso(.9, 1.4) }); }
      else { const ang = -Math.PI / 2 + caso(-1.25, 1.25); Object.assign(p, { x: cx + caso(-.12, .12) * W, y: cy + caso(-20, 20), ang, v: caso(.35, .9) * diag, r: caso(.05, .14) * W + 16, nasce: caso(0, .25) }); }
      pp.push(p);
    }
    // la pagina sotto: entra appena il vapore si dirada (solo transform e opacity: le fa la scheda grafica)
    const ingresso = { A: [{ transform: 'translateY(18px) scale(.985)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      B: [{ transform: 'scale(1.035)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      C: [{ transform: 'scale(.965)', opacity: 0 }, { transform: 'none', opacity: 1 }] }[stile];
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
      // velo di fondo: copre la pagina finché il vapore è pieno, poi sparisce
      const copre = stile === 'A' ? liscio(t / .3) * (1 - liscio((t - .42) / .4)) : stile === 'B' ? 1 - liscio((t - .12) / .55) : liscio(t / .15) * (1 - liscio((t - .3) / .45));
      g.globalAlpha = copre; g.fillStyle = fondo; g.fillRect(0, 0, W, H);
      if (stile === 'C') {      // bagliore caldo del coperchio che si alza
        const b = Math.sin(Math.min(1, t / .5) * Math.PI), rg = g.createRadialGradient(cx, cy, 0, cx, cy, W * .9);
        rg.addColorStop(0, 'rgba(255,200,130,.35)'); rg.addColorStop(1, 'rgba(255,214,150,0)');
        g.globalAlpha = b * .9; g.fillStyle = rg; g.fillRect(0, 0, W, H);
      }
      for (const p of pp) {
        const u = (t - p.nasce) / (1 - p.nasce); if (u <= 0) continue;
        let x, y, r, a;
        if (stile === 'A') { x = p.x + p.vx * u * 2 + Math.sin(u * 5 + p.rot) * 18; y = p.y + p.vy * u * (1 + u * .9); r = p.r * (1 + u * 1.8); a = p.a * liscio(u / .2) * (1 - liscio((t - .45) / .45)); }
        else if (stile === 'B') { const via = liscio((t - .1) / .75) * diag * .9; x = p.x + Math.cos(p.ang) * via; y = p.y + Math.sin(p.ang) * via - u * 40; r = p.r * (1 + u * .8); a = p.a * (1 - liscio((t - .35) / .55)); }
        else { const e = 1 - Math.pow(1 - Math.min(1, u * 1.3), 3); x = p.x + Math.cos(p.ang) * p.v * e * .6; y = p.y + Math.sin(p.ang) * p.v * e * .75 - u * 60; r = p.r * (.5 + e * 2.2); a = p.a * liscio(u / .12) * (1 - liscio((t - .3) / .55)); }
        if (a <= .01) continue;
        g.globalAlpha = stile === 'B' ? a : a * .5; g.save(); g.translate(x, y); g.rotate(p.rot + p.vr * u); g.drawImage(p.s, -r, -r, r * 2, r * 2); g.restore();
      }
      g.globalAlpha = 1;
      const quando = stile === 'A' ? .42 : stile === 'B' ? .18 : .3;
      if (!entrata && t > quando) { entrata = true; app.style.opacity = ''; app.animate(ingresso, { duration: D * .55, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
      rq = requestAnimationFrame(giro);
    }
    velo.addEventListener('pointerdown', ferma, { once: true });
    rq = requestAnimationFrame(giro);
    attivo = { ferma };
  }
  return { parti, STILI };
})();
