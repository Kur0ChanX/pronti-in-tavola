const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const err = []; p.on('pageerror', e => err.push(e.message));
  await p.goto('file://' + require('path').resolve(__dirname, '../dist/anteprima.html'));
  const t0 = Date.now();
  for (const ms of [1000, 1900, 2600, 3300, 3600, 4000, 4400, 5200]) { await p.waitForTimeout(Math.max(0, ms - (Date.now() - t0))); await p.screenshot({ path: `/tmp/pit/f${ms}.png` }); }
  console.log(err.join('\n') || 'nessun errore'); await b.close();
})();
