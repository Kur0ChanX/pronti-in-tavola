/* Ricettario (C55, Mario 08/11 «porta GialloZafferano dentro l'app»): legge DAL VIVO una ricetta di GialloZafferano
   e la ridà in un formato semplice per l'app. Usato da worker.js (/api/gz), solo per chi gestisce.
   Nel codice e nel sito non si salva nessun testo né foto di GialloZafferano: si leggono al momento, come un browser.
   Funzioni pure (niente rete) così le prove le controllano su pagine salvate. */

const SITO_GZ = 'https://ricette.giallozafferano.it/';
export const UA_GZ = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';

/* indirizzo accettato: solo pagine di ricetta di GialloZafferano (niente altri siti: il server non diventa un proxy aperto) */
export function urlGz(u) {
  try {
    const x = new URL(String(u || ''));
    if (x.protocol !== 'https:' || x.hostname !== 'ricette.giallozafferano.it' || !/^\/[\w%-]+\.html$/.test(x.pathname)) return '';
    return SITO_GZ + x.pathname.slice(1);
  } catch (e) { return ''; }
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', egrave: 'è', eacute: 'é', agrave: 'à', ograve: 'ò', ugrave: 'ù', igrave: 'ì', deg: '°', rsquo: '’', lsquo: '‘', hellip: '…' };
export const testo = h => String(h || '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&(\w+);/g, (m, n) => ENT[n] || m)
  .replace(/[ \t\r]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const assoluto = s => !s ? '' : /^https?:/.test(s) ? s : 'https://www.giallozafferano.it' + (s[0] === '/' ? '' : '/') + s;

/* «PT1H20M» → 80 minuti */
export function minutiIso(t) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(String(t || ''));
  return m ? (+(m[1] || 0)) * 60 + (+(m[2] || 0)) : 0;
}

/* «Farina 00 300 g» → { nome: 'Farina 00', q: 300, u: 'g' }; «Sale fino q.b.» → q null */
export function ingrediente(riga) {
  const t = testo(riga);
  let m = /^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(g|gr|kg|ml|cl|dl|l|cucchiai(?:ni|no|o)?|bicchier[ei]|tazz[ae]|spicchi?|foglie|fogli[oa]?|rametti?|mazzett[oi]|pizzic[oh]i?|bustin[ae]|vasett[oi]|fette|fetta|baccelli|ciuff[oi]|gambi?|cubett[oi]|noce)?\.?\s*(\(.*\))?$/i.exec(t);
  if (m && m[1]) return { nome: m[1].trim(), q: parseFloat(m[2].replace(',', '.')), u: (m[3] || '').toLowerCase(), nota: m[4] ? m[4].replace(/^\(|\)$/g, '') : '' };
  m = /^(.*?)\s+(q\.?\s?b\.?|a piacere|qb)\s*(\(.*\))?$/i.exec(t);
  if (m) return { nome: m[1].trim(), q: null, u: '', nota: m[3] ? m[3].replace(/^\(|\)$/g, '') : '' };
  return { nome: t, q: null, u: '', nota: '' };
}

function recipeLd(html) {
  for (const b of String(html).matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let d; try { d = JSON.parse(b[1]); } catch (e) { continue; }
    const tutti = [].concat(d, d && d['@graph'] || []);
    const r = tutti.find(x => x && String(x['@type']).includes('Recipe'));
    if (r) return r;
  }
  return null;
}
const primaFoto = im => !im ? '' : typeof im === 'string' ? im : Array.isArray(im) ? primaFoto(im[0]) : im.url || '';

/* sezione col titolo h2 (es. «Conservazione», «Consiglio», «Presentazione»): il primo blocco di testo che segue */
function sezione(html, titolo) {
  const re = new RegExp(`<h2[^>]*>\\s*${titolo}\\s*</h2>\\s*<div[^>]*>([\\s\\S]*?)</div>`, 'i');
  const m = re.exec(html);
  return m ? testo(m[1]).slice(0, 3000) : '';
}

/* pagina della ricetta → oggetto per l'app */
export function gzRicetta(html, url) {
  html = String(html || '');
  const ld = recipeLd(html);
  if (!ld) return null;
  const passi = [];
  for (const m of html.matchAll(/<div class="gz-content-recipe-step">([\s\S]*?)<\/p>\s*<\/div>/g)) {
    const blocco = m[1];
    const foto = [...blocco.matchAll(/<img[^>]+src="([^"]+)"/g)].map(f => assoluto(f[1])).filter(f => /\/images\/ricette\//.test(f));
    const p = blocco.slice(blocco.lastIndexOf('<p>'));
    const t = testo(p.replace(/<span class="num-step">\s*\d+\s*<\/span>/g, ''));
    if (t) passi.push({ t, foto });
  }
  if (!passi.length) [].concat(ld.recipeInstructions || []).forEach(s => {
    const t = testo(typeof s === 'string' ? s : s.text); if (t) passi.push({ t, foto: [] });
  });
  const dato = n => { const m = new RegExp(`${n}:\\s*<strong>([^<]+)</strong>`, 'i').exec(html); return m ? testo(m[1]) : ''; };
  const video = /ptps?\.stbm\.it\/v\/(\w+)/.exec(html);
  const porzioni = parseInt(String([].concat(ld.recipeYield || '')[0]).replace(/\D+/g, ' ').trim(), 10) || 4;
  return {
    id: 'gz:' + url.replace(SITO_GZ, '').replace(/\.html$/, ''),
    url, nome: testo(ld.name), intro: (sezione(html, 'PRESENTAZIONE') || testo(ld.description)).split(/\n(?=Ecco|Scopri|Leggi|Prova anche|Se ti piac)/)[0].trim(),
    foto: assoluto(primaFoto(ld.image)), categoria: testo([].concat(ld.recipeCategory || '')[0]),
    porzioni, prep: minutiIso(ld.prepTime), cottura: minutiIso(ld.cookTime), totale: minutiIso(ld.totalTime),
    difficolta: dato('Difficoltà'), costo: dato('Costo'),
    ingredienti: [].concat(ld.recipeIngredient || []).map(ingrediente).filter(i => i.nome),
    passi, conserva: sezione(html, 'Conservazione'), consiglio: sezione(html, 'Consiglio'),
    autore: testo(ld.author && (ld.author.name || ld.author)), videoChiave: video ? video[1] : ''
  };
}

/* scheda del lettore video di GialloZafferano → indirizzo dello streaming (HLS .m3u8) e copertina */
export function gzVideo(js) {
  const t = String(js || '').replace(/\\\//g, '/');
  const m = /https:\/\/video\.giallozafferano\.it\/[^"']+?\.m3u8/.exec(t);
  const mp4 = /https:\/\/[\w.-]+akamaized\.net\/[^"']+?\.mp4/.exec(t);
  const k = /"vkey":"(\w+)"/.exec(t);
  return { hls: m ? m[0] : '', mp4: mp4 ? mp4[0] : '', copertina: k ? `https://ptps.stbm.it/t/${k[1]}_large.jpg` : '' };
}

/* pagina di ricerca → elenco di ricette (nome, link, foto, portata, descrizione) */
export function gzCerca(html) {
  const out = [];
  for (const m of String(html || '').matchAll(/<article class="gz-card[\s\S]*?<\/article>/g)) {
    const a = m[0], u = /href="(https:\/\/ricette\.giallozafferano\.it\/[^"#]+\.html)"/.exec(a);
    if (!u || out.some(x => x.url === u[1])) continue;
    const nome = /<h[24] class="gz-title[^"]*">\s*(?:<a[^>]*>)?([\s\S]*?)<\/(?:a|h[24])>/.exec(a) || /href="https:\/\/ricette[^"]+" title="([^"]+)"/.exec(a);
    const foto = /<img[^>]+(?:data-)?src="(https?:\/\/[^"]+|\/[^"]+)"/.exec(a);
    const cat = /<div class="gz-category">\s*<a[^>]*>([\s\S]*?)<\/a>/.exec(a), desc = /<div class="gz-description">([\s\S]*?)<\/div>/.exec(a);
    out.push({ url: u[1], nome: testo(nome && nome[1]), foto: foto ? assoluto(foto[1]) : '', categoria: testo(cat && cat[1]), desc: testo(desc && desc[1]).slice(0, 200) });
  }
  return out.filter(x => x.nome).slice(0, 30);
}

/* pagina dopo (catalogo infinito): prima il link «successiva» della pagina; se manca, /pageN/ dopo la sezione (ricerca-ricette, ricette-cat).
   Solo indirizzi di www.giallozafferano.it. Se la pagina ha poche ricette, non c'è un'altra pagina. */
export const GZ_SEZIONI = /^(https:\/\/www\.giallozafferano\.it\/(?:ricerca-ricette|ricette-cat|ricette-regionali))\/(?:page(\d+)\/)?(.+)$/;
const GZ_ING = /^(https:\/\/ricette\.giallozafferano\.it\/ricette-con-[\w-]+\/)(?:page(\d+)\/)?$/;   // per ingrediente: /pageN/ in fondo
export function gzProssima(html, u, n) {
  const h = String(html || '');
  const m = /<link[^>]+rel="next"[^>]+href="([^"]+)"/.exec(h) || /<link[^>]+href="([^"]+)"[^>]+rel="next"/.exec(h)
    || /<a[^>]+href="([^"]+)"[^>]*(?:rel="next"|class="[^"]*(?:next|successiv)[^"]*")/i.exec(h);
  const ok = s => /^https:\/\/(?:www|ricette)\.giallozafferano\.it\/[\w\/%+.,-]*$/.test(s) && s !== u ? s : '';
  if (m) { const s = ok(assoluto(m[1].replace(/&amp;/g, '&'))); if (s) return s; }
  if (n < 15) return '';
  const s = GZ_SEZIONI.exec(u); if (s) return ok(`${s[1]}/page${(Number(s[2]) || 1) + 1}/${s[3]}`);
  const g = GZ_ING.exec(u); return g ? ok(`${g[1]}page${(Number(g[2]) || 1) + 1}/`) : '';
}
