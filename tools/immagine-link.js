// Disegna l'immagine dell'anteprima del link su WhatsApp (og:image, C5).
// Uso: node tools/immagine-link.js  →  media/anteprima-link-<N>.jpg (1200×630, JPEG sotto 300 KB).
// Se cambi il disegno, alza N (WhatsApp tiene in memoria la vecchia immagine per nome)
// e aggiorna lo stesso nome in index.html (og:image).
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const N = 1;
const radice = path.resolve(__dirname, '..');
const uscita = path.join(radice, 'media', `anteprima-link-${N}.jpg`);
const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(radice, 'media', 'logo.png')).toString('base64');

const pibiones = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' fill='%237B2318' fill-opacity='.09'%3E%3Ccircle cx='18' cy='4' r='1.3'/%3E%3Ccircle cx='25' cy='11' r='1.3'/%3E%3Ccircle cx='32' cy='18' r='1.3'/%3E%3Ccircle cx='25' cy='25' r='1.3'/%3E%3Ccircle cx='18' cy='32' r='1.3'/%3E%3Ccircle cx='11' cy='25' r='1.3'/%3E%3Ccircle cx='4' cy='18' r='1.3'/%3E%3Ccircle cx='11' cy='11' r='1.3'/%3E%3C/svg%3E";
const rombi = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10'%3E%3Cpath d='M8 1 L13 5 L8 9 L3 5 Z' fill='none' stroke='%23C4532E' stroke-width='1.2'/%3E%3Ccircle cx='8' cy='5' r='1.1' fill='%237B2318'/%3E%3Ccircle cx='0' cy='5' r='.9' fill='%23E8B46A'/%3E%3Ccircle cx='16' cy='5' r='.9' fill='%23E8B46A'/%3E%3C/svg%3E";

const pagina = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,600&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { background: #FBF4E8 url("${pibiones}"); position: relative; font-family: 'Fraunces', serif; }
  .bordo { position: absolute; left: 0; right: 0; height: 22px; background: url("${rombi}") center / 35px 22px repeat-x; opacity: .8; }
  .su { top: 22px; } .giu { bottom: 22px; }
  img { position: absolute; left: 50%; top: 50%; height: 500px; transform: translate(-50%, -50%); }
  .lato { position: absolute; top: 50%; transform: translateY(-50%); width: 300px; text-align: center;
    font-style: italic; font-weight: 600; font-size: 66px; line-height: 1.05; letter-spacing: -.01em; }
  .lato i { display: block; height: 14px; margin: 22px auto 0; width: 150px; background: url("${rombi}") center / 22px 14px repeat-x; }
  .sx { left: 40px; color: #7B2318; } .dx { right: 40px; color: #C4532E; }
</style></head><body>
  <div class="bordo su"></div><div class="bordo giu"></div>
  <div class="lato sx">Cucina<br>di casa<i></i></div>
  <img src="${logo}" alt="">
  <div class="lato dx">Ordina<br>e ritira<i></i></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(pagina, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const ok = await page.evaluate(() => document.fonts.check("italic 600 66px 'Fraunces'"));
  if (!ok) { console.error('NO: carattere Fraunces non caricato (serve la rete)'); process.exit(1); }
  await page.screenshot({ path: uscita, type: 'jpeg', quality: 85 });
  await browser.close();
  const kb = Math.round(fs.statSync(uscita).size / 1024);
  console.log(`${path.relative(radice, uscita)}: 1200×630, ${kb} KB${kb < 300 ? '' : ' — NO: oltre 300 KB, WhatsApp non la mostrerebbe'}`);
  if (kb >= 300) process.exit(1);
})();
