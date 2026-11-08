/* Controllo delle ricette vere di GialloZafferano col lettore dell'app (C80, 08/11): le 69 di partenza + 6 elenchi di GZ.
   Uso: node tools/controlla-ricette.mjs /percorso/esito.json → riassunto e problemi per ricetta. Serve la rete verso giallozafferano.it. */
import { gzRicetta, gzCerca, UA_GZ } from '../gz.mjs';
import fs from 'fs';
const H = { 'user-agent': UA_GZ, 'accept-language': 'it-IT' };
const get = async u => { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { headers: H }); if (r.ok) return await r.text(); } catch (e) {} await new Promise(o => setTimeout(o, 1500)); } return ''; };
const base = fs.readFileSync(new URL('../ricette.js', import.meta.url), 'utf8');
const urls = new Set([...base.matchAll(/^\s*\["([^"]+)", "/gm)].map(m => `https://ricette.giallozafferano.it/${m[1]}.html`));
const liste = ['ricette-cat/Primi', 'ricette-cat/Secondi-piatti', 'ricette-cat/Dolci-e-Desserts', 'ricette-cat/Antipasti', 'ricette-cat/Contorni', 'ricette-regionali/Sardegna'];
for (const l of liste) for (const p of ['', 'page2/', 'page3/']) {
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
  if (!r.passi.length) prob.push('0 passi');
  if (!r.ingredienti.length) prob.push('0 ingredienti');
  const tuttiN = [];
  r.passi.forEach((p, k) => {
    const nn = [...p.t.matchAll(/\[\[(\d+)\]\]/g)].map(m => +m[1]); tuttiN.push(...nn);
    if (/<|&[a-z#]+;/i.test(p.t)) prob.push(`passo ${k + 1}: resti di HTML`);
    if (p.t.length < 15) prob.push(`passo ${k + 1}: testo cortissimo «${p.t}»`);
    if (!/[.!?:)»"…\]]\s*$/.test(p.t.trim())) prob.push(`passo ${k + 1}: finisce senza punto «…${p.t.slice(-30)}»`);
    if (nn.length && p.foto.length && p.foto.length !== nn.length && !(p.foto.length === 1 && nn.length > 1)) prob.push(`passo ${k + 1}: ${p.foto.length} foto per ${nn.length} numerini`);
    if (nn.length && !p.foto.length) prob.push(`passo ${k + 1}: numerini senza foto`);
    if (p.foto.length === 1 && nn.length > 4) prob.push(`passo ${k + 1}: striscia con ${nn.length} numerini (oltre 4)`);
  });
  for (let k = 1; k < tuttiN.length; k++) if (tuttiN[k] !== tuttiN[k - 1] + 1) { prob.push(`numerini saltati: ${tuttiN[k - 1]}→${tuttiN[k]}`); break; }
  const strisce = r.passi.filter(p => p.foto.length === 1 && /\[\[\d+\]\][\s\S]*\[\[\d+\]\]/.test(p.t)).length;
  return { nome, prob, passi: r.passi.length, strisce, ing: r.ingredienti.length };
}
await Promise.all([lavora(), lavora(), lavora(), lavora()]);
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
const brutte = out.filter(x => x.prob.length);
console.log(`controllate ${out.length}: ${out.length - brutte.length} ok, ${brutte.length} con problemi; con foto a strisce: ${out.filter(x => x.strisce).length}`);
brutte.forEach(x => console.log('-', x.nome, ':', x.prob.join(' · ')));
