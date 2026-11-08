/* C83 (Mario 08/11, 5ª volta: «controlla ogni ricetta una per una: ci sono TUTTI i passaggi di GialloZafferano?»).
   Per ogni ricetta confronta la pagina vera di GZ con quello che legge l'app:
   1) quanti passi mostra GZ (blocchi della pagina) e quanti ne ha l'app;
   2) ogni frase dei passi ufficiali di GZ (recipeInstructions) deve esserci nel testo dell'app (numeri delle foto esclusi).
   Uso: TUTTE=1 PAGINE=6 node tools/confronta-passi.mjs /percorso/esito.json → riassunto e ricette con differenze. Serve la rete. */
import { gzRicetta, gzCerca, UA_GZ } from '../gz.mjs';
import fs from 'fs';
const H = { 'user-agent': UA_GZ, 'accept-language': 'it-IT' };
const get = async u => { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { headers: H }); if (r.ok) return await r.text(); } catch (e) {} await new Promise(o => setTimeout(o, 1500)); } return ''; };
const base = fs.readFileSync(new URL('../ricette.js', import.meta.url), 'utf8');
const urls = new Set([...base.matchAll(/^\s*\["([^"]+)", "/gm)].map(m => `https://ricette.giallozafferano.it/${m[1]}.html`));
const liste = process.env.TUTTE ? ['ricette-cat/Primi', 'ricette-cat/Secondi-piatti', 'ricette-cat/Dolci-e-Desserts', 'ricette-cat/Antipasti', 'ricette-cat/Contorni', 'ricette-cat/Lievitati', 'ricette-cat/Piatti-Unici', 'ricette-cat/Salse-e-Sughi', 'ricette-cat/Bevande', 'ricerca-ricette/sardegna']
  : ['ricette-cat/Primi', 'ricette-cat/Secondi-piatti', 'ricette-cat/Dolci-e-Desserts', 'ricette-cat/Antipasti', 'ricette-cat/Contorni', 'ricette-regionali/Sardegna'];
const pagine = ['', ...Array.from({ length: Math.max(0, (Number(process.env.PAGINE) || 3) - 1) }, (_, k) => `page${k + 2}/`)];
for (const l of liste) for (const p of pagine) gzCerca(await get(`https://www.giallozafferano.it/${l}/${p}`)).forEach(x => urls.add(x.url));
const tutte = [...urls]; console.error('ricette da confrontare:', tutte.length);

// testo per il confronto: minuscolo, solo lettere (via numeri delle foto, punteggiatura, spazi, entità)
const ENT = { amp: '&', nbsp: ' ', quot: '"', apos: "'", egrave: 'è', eacute: 'é', agrave: 'à', ograve: 'ò', ugrave: 'ù', igrave: 'ì', Egrave: 'È', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', deg: '°', hellip: '…' };
const piano = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&(\w+);/g, (m, n) => ENT[n] || ' ')
  .replace(/\[\[\d+\]\]/g, ' ').toLowerCase().normalize('NFC').replace(/[^\p{L}]+/gu, '');
function ld(html) {
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); const x = [].concat(j['@graph'] || j).find(o => o && /Recipe/.test([].concat(o['@type']).join())); if (x) return x; } catch (e) {}
  }
  return null;
}
const out = []; let i = 0;
async function lavora() {
  while (i < tutte.length) {
    const u = tutte[i++], nome = u.split('/').pop().replace('.html', ''), h = await get(u);
    if (!h) { out.push({ nome, diff: ['pagina non letta'] }); continue; }
    const r = gzRicetta(h, u), L = ld(h), diff = [];
    if (!r) { out.push({ nome, diff: ['l\'app non legge la ricetta'] }); continue; }
    const blocchi = h.split('<div class="gz-content-recipe-step">').length - 1;
    const uff = L ? [].concat(L.recipeInstructions || []).map(s => typeof s === 'string' ? s : s.text || '') : [];
    if (blocchi && r.passi.length !== blocchi) diff.push(`passi: GZ ${blocchi}, app ${r.passi.length}`);
    const nostro = piano(r.passi.map(p => p.t).join(' '));
    let perse = 0, frasi = 0; const esempi = [];
    for (const t of uff) for (const f of String(t).split(/(?<=[.!?;:])\s+/)) {
      const pf = piano(f); if (pf.length < 12) continue; frasi++;
      if (!nostro.includes(pf)) { perse++; if (esempi.length < 2) esempi.push(f.trim().slice(0, 70)); }
    }
    if (perse) diff.push(`${perse} frasi di GZ su ${frasi} non trovate: «${esempi.join('» «')}»`);
    out.push({ nome, diff, passiGz: blocchi, passiApp: r.passi.length, frasi });
  }
}
await Promise.all([lavora(), lavora(), lavora(), lavora()]);
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
const diverse = out.filter(x => x.diff.length);
console.log(`confrontate ${out.length}: ${out.length - diverse.length} con tutti i passi e tutte le frasi di GZ, ${diverse.length} con differenze; frasi controllate ${out.reduce((t, x) => t + (x.frasi || 0), 0)}`);
diverse.forEach(x => console.log('-', x.nome, ':', x.diff.join(' · ')));
