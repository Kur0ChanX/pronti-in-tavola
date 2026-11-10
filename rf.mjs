/* C124 passo 8 (Mario 10/11 «se ne trovi altre ricette per fitness in altre fonti migliori mettile caricate al meglio, tutti i passaggi,
   info, foto fatte bene… e segnami la fonte»; fonte scelta da Mario 10/11 ~11:40: RicetteFit.it, «piano piano, in automatico»).
   Lettore di RicetteFit: stessa forma delle ricette di GialloZafferano (gz.mjs → gzRicetta), id «rf:<slug>».
   Dati dal JSON-LD «Recipe» della pagina: passi con la loro foto (1024 px), valori per porzione (calcolati da RicetteFit con le
   tabelle CREA); foto grande dall'HTML (il JSON-LD ha solo ritagli da 500 px: PT E45). robots.txt di RicetteFit: lettura permessa (10/11/2026). */
import { recipeLd, testo, minutiIso, ingrediente } from './gz.mjs';

export const SITO_RF = 'https://www.ricettefit.it/';
export const MAPPA_RF = SITO_RF + 'recipe-sitemap.xml';   // elenco di tutte le ricette (~905 il 10/11/2026)
const PAGINA_RF = /^\/ricetta\/([\w%-]+)\/?$/;
const FOTO_RF = /^https:\/\/www\.ricettefit\.it\/wp-content\/uploads\/[\w./%-]+\.(?:jpe?g|png|webp)$/i;

/* indirizzo accettato: solo pagine di ricetta di RicetteFit (il server non diventa un proxy aperto) */
export function urlRf(u) {
  try {
    const x = new URL(String(u || '')), m = PAGINA_RF.exec(x.pathname);
    if (x.protocol !== 'https:' || !/^(?:www\.)?ricettefit\.it$/.test(x.hostname) || !m) return '';
    return SITO_RF + 'ricetta/' + m[1] + '/';
  } catch (e) { return ''; }
}
export const idRf = u => { const x = urlRf(u); return x ? 'rf:' + x.slice(SITO_RF.length + 8, -1) : ''; };
export const urlDaIdRf = id => /^rf:[\w%-]+$/.test(String(id || '')) ? SITO_RF + 'ricetta/' + id.slice(3) + '/' : '';

/* elenco delle ricette (sitemap): indirizzi puliti, senza doppioni, senza la pagina «/ricetta/» dell'indice */
export function rfElenco(xml) {
  return [...new Set([...String(xml || '').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => urlRf(m[1])).filter(Boolean))];
}

/* C125 (Mario 10/11 13:40 «la ricerca… nelle fonti alternative anche a giallozafferano»): le ricette dell'elenco che hanno
   nell'indirizzo TUTTE le parole cercate, per radice («budino» trova anche «budini»); «con», «alla»… non contano.
   Nome dall'indirizzo, foto dall'elenco (ogni voce della sitemap ha la sua <image:loc>): nessuna richiesta in più a RicetteFit. */
const senzaAccenti = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const VUOTE_RF = new Set(['con', 'per', 'alla', 'alle', 'allo', 'agli', 'dei', 'del', 'della', 'delle', 'dello', 'degli', 'nel', 'nella', 'sul', 'sulla', 'una', 'uno']);
export const radiciRf = q => senzaAccenti(q).replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ')
  .filter(p => p.length >= 3 && !VUOTE_RF.has(p)).map(p => p.length >= 5 ? p.slice(0, Math.max(4, p.length - 2)) : p);
export function nomeRf(u) {
  let s = (String(u || '').split('/ricetta/')[1] || '').replace(/\/$/, '');
  try { s = decodeURIComponent(s); } catch (e) { /* indirizzo con % rotto: resta com'è */ }
  s = s.replace(/-\d+$/, '').replace(/-+/g, ' ').trim();   // «pancake-proteici-2» → «pancake proteici»
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}
export function rfTrova(xml, q, max = 20) {
  const radici = radiciRf(q), out = [];
  if (!radici.length) return out;
  for (const m of String(xml || '').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>\s*([^<\s]+)\s*<\/loc>/.exec(m[1]), url = loc ? urlRf(loc[1]) : '';
    if (!url || out.some(x => x.url === url)) continue;
    const t = senzaAccenti(url.slice(SITO_RF.length + 8));
    if (!radici.every(p => t.includes(p))) continue;
    const f = /<image:loc>\s*([^<\s]+)\s*<\/image:loc>/.exec(m[1]);
    out.push({ url, nome: nomeRf(url), foto: f && FOTO_RF.test(f[1]) ? f[1] : '' });
    if (out.length >= max) break;
  }
  return out;
}

/* «140 g Spaghetti integrali» → { nome: 'Spaghetti integrali', q: 140, u: 'g' }; «1 pz Uovo» → q 1, senza unità.
   Scritte al modo di GZ («Sale q.b.», «Farina 300 g»): il lettore di GZ */
const RIGA_RF = /^(\d+(?:[.,]\d+)?)\s*(g|gr|kg|ml|cl|dl|l|pz|pezz[io]|cucchiai(?:ni|no|o)?|spicchi?|foglie|fette|fetta|pizzic[oh]i?|bustin[ae]|vasett[oi]|tazz[ae]|bicchier[ei])?\.?\s+(\D.*)$/i;
export function ingredienteRf(riga) {
  const t = testo(riga), m = RIGA_RF.exec(t);
  if (!m) return ingrediente(t);
  const u = (m[2] || '').toLowerCase(), nota = /\(([^)]*)\)\s*$/.exec(m[3]);
  return { nome: m[3].replace(/\s*\([^)]*\)\s*$/, '').trim(), q: parseFloat(m[1].replace(',', '.')), u: /^(?:pz|pezz)/.test(u) ? '' : u === 'gr' ? 'g' : u, nota: nota ? nota[1] : '' };
}

/* valori PER PORZIONE (JSON-LD, punto decimale: «24.4 grams», «463 milligrams»). Stesse chiavi di gzNutrizione; un valore che
   manca resta null, MAI 0. (Attenzione: il loro «transFatContent» è etichettato «Grassi insaturi» sul sito: non si usa.) */
const LD_RF = { calories: 'kcal', carbohydrateContent: 'carb', sugarContent: 'zuc', proteinContent: 'prot', fatContent: 'grassi', saturatedFatContent: 'saturi', fiberContent: 'fibre', cholesterolContent: 'colest', sodiumContent: 'sodio' };
const numero = v => { const m = /\d+(?:[.,]\d+)?/.exec(String(v ?? '')); const n = m ? parseFloat(m[0].replace(',', '.')) : NaN; return Number.isFinite(n) && n >= 0 && n < 100000 ? Math.round(n * 10) / 10 : null; };
export function rfNutrizione(ld) {
  const nu = ld && ld.nutrition || {}, n = {};
  for (const [c, k] of Object.entries(LD_RF)) {
    let x = nu[c] != null && nu[c] !== '' ? numero(nu[c]) : null;
    if (x != null && (k === 'sodio' || k === 'colest') && /\bg(?:rams?)?\b/i.test(String(nu[c])) && !/mg|milli/i.test(String(nu[c]))) x = Math.round(x * 10000) / 10;   // in grammi → mg
    n[k] = x;
  }
  return n.kcal == null && n.prot == null ? null : n;
}

/* foto grande: quella di og:image (originale), o dalla sua serie (srcset) la più piccola da almeno 1000 px (meno peso, sempre nitida) */
function fotoGrande(html, ld) {
  const prima = im => !im ? '' : typeof im === 'string' ? im : Array.isArray(im) ? prima(im[0]) : im.url || '';
  const og = (/<meta property="og:image" content="([^"]+)"/.exec(html) || [])[1] || prima(ld.image);
  if (!FOTO_RF.test(og || '')) return FOTO_RF.test(prima(ld.image)) ? prima(ld.image) : '';
  const base = og.replace(/\.\w+$/, '');
  for (const s of html.matchAll(/srcset="([^"]+)"/g)) {
    if (!s[1].includes(base)) continue;
    const tt = s[1].split(',').map(x => x.trim().split(/\s+/)).map(([u, w]) => ({ u, w: parseInt(w, 10) || 0 }))
      .filter(x => x.u.startsWith(base) && x.w >= 1000 && FOTO_RF.test(x.u)).sort((a, b) => a.w - b.w);
    if (tt.length) return tt[0].u;
  }
  return og;
}

/* «Domande frequenti» della ricetta → «Consiglio» nell'app (domanda e risposta, una riga ciascuna) */
function faqRf(html) {
  return html.split('<div class="dr-faq-item">').slice(1, 9).map(b => {
    const d = /<h3[^>]*>([\s\S]*?)<\/h3>/.exec(b), i = b.indexOf('dr-faq-content-wrap');
    const r = i < 0 ? '' : testo(b.slice(b.indexOf('>', i) + 1).split(/<\/section>|<h2\b|<aside\b|<footer\b|<div class="dr-(?!faq)/)[0]).replace(/\s*\n\s*/g, ' ');
    return d && r ? testo(d[1]) + '\n' + r : '';
  }).filter(Boolean).join('\n').slice(0, 3000);
}

const DIFF_RF = { principiante: 'Facile', facile: 'Facile', intermedio: 'Media', medio: 'Media', media: 'Media', avanzato: 'Difficile', esperto: 'Difficile', difficile: 'Difficile' };

/* pagina della ricetta → oggetto per l'app (null se la pagina non è una ricetta) */
export function rfRicetta(html, url) {
  html = String(html || ''); url = urlRf(url);
  const ld = recipeLd(html);
  if (!ld || !url) return null;
  const foto = im => { const f = typeof im === 'string' ? im : im && im.url || ''; return FOTO_RF.test(f) ? f : ''; };
  const passi = [].concat(ld.recipeInstructions || [])
    .flatMap(s => s && /HowToSection/.test(String(s['@type'])) ? [].concat(s.itemListElement || []) : [s])
    .map(s => {
      if (typeof s === 'string') return { t: testo(s), foto: [] };
      const nome = testo(s && s.name).replace(/[.:;]+$/, ''), t = testo(s && s.text), f = foto(s && s.image);
      // il titolo del passo, com'è sul sito, davanti al testo («Preparare la crema. In una ciotola…»)
      const tt = nome && t && !t.toLowerCase().startsWith(nome.toLowerCase()) ? nome + '. ' + t : t || nome;
      return { t: tt, foto: f ? [f] : [] };
    }).filter(p => p.t);
  const diff = (/Difficolt(?:à|&agrave;|&#224;)\s*:?\s*<b>([^<]+)<\/b>/i.exec(html) || [])[1];
  const porzioni = parseInt(String([].concat(ld.recipeYield || '')[0]).replace(/\D+/g, ' ').trim(), 10) || 4;
  return {
    v: 4, fonte: 'rf',
    id: idRf(url), url, nome: testo(ld.name), intro: testo(ld.description).slice(0, 3000),
    foto: fotoGrande(html, ld), categoria: testo([].concat(ld.recipeCategory || '')[0]),
    porzioni, prep: minutiIso(ld.prepTime), cottura: minutiIso(ld.cookTime), totale: minutiIso(ld.totalTime),
    difficolta: DIFF_RF[testo(diff).toLowerCase()] || testo(diff), costo: '',
    nutr: rfNutrizione(ld),
    ingredienti: [].concat(ld.recipeIngredient || []).map(ingredienteRf).filter(i => i.nome),
    passi, conserva: '', consiglio: faqRf(html),
    autore: testo(ld.author && (ld.author.name || ld.author)) || 'RicetteFit', videoChiave: '',
    voto: Math.round((parseFloat(ld.aggregateRating && ld.aggregateRating.ratingValue) || 0) * 10) / 10, voti: parseInt(ld.aggregateRating && (ld.aggregateRating.ratingCount || ld.aggregateRating.reviewCount), 10) || 0
  };
}
