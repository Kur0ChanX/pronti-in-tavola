/* Prova del lettore delle ricette di GialloZafferano (gz.mjs), senza rete: pagine finte coi casi veri trovati l'08/11/2026 (C72).
   Uso: node tools/prova-gz.mjs → «N OK, 0 NO». */
import { gzRicetta } from '../gz.mjs';
let ok = 0, no = 0;
const prova = (nome, vero) => { if (vero) { ok++; console.log('OK  ', nome); } else { no++; console.log('NO  ', nome); } };
const ld = { '@type': 'Recipe', name: 'Prova', recipeIngredient: ['Farina 00 300 g', 'Uova 2', 'Sale q.b.'], image: '/images/ricette/1/x.jpg', totalTime: 'PT40M' };
const passo = corpo => `<div class="gz-content-recipe-step"><div class="gz-content-recipe-step-img-container"><picture><img src="/images/ricette/1/p.jpg"></picture></div>${corpo}</div>`;
const pagina = passi => `<script type="application/ld+json">${JSON.stringify(ld)}</script><section>${passi.join('')}</section><h2>Conservazione</h2><div>Si conserva 2 giorni.</div>`;
const r = gzRicetta(pagina([
  passo('<p>Setacciate la farina <span class="num-step">1</span>. Unite le uova <span class="num-step">2</span>.</p>'),
  passo('<p class="MsoNormal">Impastate bene <span class="num-step">3</span>.</p><p>Fate riposare 30 minuti <span class="num-step">4</span>.</p>'),
  passo('<p>Infornate <span class="num-step">5</span>.</p><ul><li>Servite tiepida.</li></ul>')]), 'https://ricette.giallozafferano.it/Prova.html');
prova('3 passi letti', r && r.passi.length === 3);
prova('numerini frase↔foto tenuti e niente spazio prima del punto', r.passi[0].t === 'Setacciate la farina [[1]]. Unite le uova [[2]].');
prova('paragrafo con classe («MsoNormal») e più paragrafi nello stesso passo', /Impastate bene \[\[3\]\]\./.test(r.passi[1].t) && /Fate riposare 30 minuti \[\[4\]\]\./.test(r.passi[1].t));
prova('anche gli elenchi del passo', /Servite tiepida/.test(r.passi[2].t));
prova('l\'ultimo passo non si mangia «Conservazione»', !/conserva/i.test(r.passi[2].t) && /2 giorni/.test(r.conserva));
prova('versione 3 del lettore (le copie vecchie si rileggono)', r.v === 3);
console.log(`${ok} OK, ${no} NO`);
process.exit(no ? 1 : 0);
