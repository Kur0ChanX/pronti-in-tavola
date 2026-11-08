/* Controllo delle ricette vere di GialloZafferano col lettore dell'app (C80, 08/11): le 69 di partenza + 6 elenchi di GZ.
   Uso: node tools/controlla-ricette.mjs /percorso/esito.json → riassunto e problemi per ricetta. Serve la rete verso giallozafferano.it. */
import { gzRicetta, gzCerca, UA_GZ, esaminaRicetta } from '../gz.mjs';
import fs from 'fs';
const H = { 'user-agent': UA_GZ, 'accept-language': 'it-IT' };
const get = async u => { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { headers: H }); if (r.ok) return await r.text(); } catch (e) {} await new Promise(o => setTimeout(o, 1500)); } return ''; };
const base = fs.readFileSync(new URL('../ricette.js', import.meta.url), 'utf8');
const urls = new Set([...base.matchAll(/^\s*\["([^"]+)", "/gm)].map(m => `https://ricette.giallozafferano.it/${m[1]}.html`));
// TUTTE=1: tutte le sezioni che usa il motore del server (CAT_GZ di worker.js); PAGINE=N pagine per sezione (di base 3)
const liste = process.env.TUTTE ? ['ricette-cat/Primi', 'ricette-cat/Secondi-piatti', 'ricette-cat/Dolci-e-Desserts', 'ricette-cat/Antipasti', 'ricette-cat/Contorni', 'ricette-cat/Lievitati', 'ricette-cat/Piatti-Unici', 'ricette-cat/Salse-e-Sughi', 'ricette-cat/Bevande', 'ricerca-ricette/sardegna']
  : ['ricette-cat/Primi', 'ricette-cat/Secondi-piatti', 'ricette-cat/Dolci-e-Desserts', 'ricette-cat/Antipasti', 'ricette-cat/Contorni', 'ricette-regionali/Sardegna'];
const pagine = ['', ...Array.from({ length: Math.max(0, (Number(process.env.PAGINE) || 3) - 1) }, (_, k) => `page${k + 2}/`)];
for (const l of liste) for (const p of pagine) {
  const h = await get(`https://www.giallozafferano.it/${l}/${p}`);
  gzCerca(h).forEach(x => urls.add(x.url));
}
const tutte = [...urls]; console.error('ricette da controllare:', tutte.length);
const out = []; let i = 0;
async function lavora() { while (i < tutte.length) { const u = tutte[i++]; const h = await get(u); const r = h ? gzRicetta(h, u) : null; out.push(esamina(u, r, h)); } }
function esamina(u, r, h) {
  const nome = u.split('/').pop().replace('.html', ''), prob = [];
  if (!h) return { nome, prob: ['pagina non letta'] };
  if (!r) return { nome, prob: ['lettore: nessuna ricetta'] };
  prob.push(...esaminaRicetta(r));
  const strisce = r.passi.filter(p => p.foto.length === 1 && /\[\[\d+\]\][\s\S]*\[\[\d+\]\]/.test(p.t)).length;
  return { nome, prob, passi: r.passi.length, strisce, ing: r.ingredienti.length };
}
await Promise.all([lavora(), lavora(), lavora(), lavora()]);
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
const brutte = out.filter(x => x.prob.length);
console.log(`controllate ${out.length}: ${out.length - brutte.length} ok, ${brutte.length} con problemi; con foto a strisce: ${out.filter(x => x.strisce).length}`);
brutte.forEach(x => console.log('-', x.nome, ':', x.prob.join(' · ')));
