/* guida-iphone.js · guida a figure per mettere l'app sulla schermata Home dell'iPhone (C94, Mario 08/11 «1 guida a figure per iPhone,
   controlla bene come esce su iphone negli ultimi anni di aggiornamenti»).
   Nessun sito può installarsi da solo su iPhone: la persona deve fare i passi. Qui un disegno grande per passo, con un cerchio che pulsa
   e una freccia sul tasto da toccare. Dove sta il tasto Condividi dipende dalla versione di iOS (fonti 11/2026: manuale Apple iOS 26 e 27
   «Turn a website into an app in Safari», Cult of Mac 22/06/2026, 9to5Mac 15/09/2025, openpwa.net 10/2026):
   - iOS 27, barra «Compatta» (normale): menu della pagina a SINISTRA dell'indirizzo → Condividi (a destra ora c'è il tasto delle schede);
   - iOS 26, barra «Compatta» (normale): ⋯ a DESTRA dell'indirizzo → Condividi;
   - iOS 18 o più vecchi, o barra «In basso»/«In alto»: tasto Condividi sempre in vista, nella barra in basso;
   - da iOS 26 la finestra «Aggiungi» ha l'interruttore «Apri come app web» (acceso di solito): va lasciato acceso.
   La versione si legge da «Version/NN» di Safari (dal 26 il sistema nel nome del browser resta fermo a 18_6, la versione di Safari no).
   Chrome su iPhone (CriOS): Condividi in alto a destra, nella barra dell'indirizzo. */
(function () {
  const VINO = '#8a2432', GRIGIO = '#d9d4cc', SCURO = '#1d1d1f';
  const versioneIOS = ua => { const m = /Version\/(\d+)/.exec(ua); return m ? +m[1] : 0; };

  /* pezzi del disegno (viewBox 120×210: un telefono) */
  const tel = (dentro, testo) => `<svg class="gf-fig" viewBox="0 0 120 210" role="img" aria-label="${testo}">
    <rect x="2" y="2" width="116" height="206" rx="18" fill="${SCURO}"/><rect x="6" y="6" width="108" height="198" rx="14" fill="#fff"/>
    <rect x="44" y="10" width="32" height="8" rx="4" fill="${SCURO}"/>
    <text x="14" y="34" font-size="8" font-weight="700" fill="${VINO}">Pronti in Tavola</text>
    <rect x="14" y="42" width="92" height="22" rx="5" fill="#f3ece2"/><rect x="14" y="70" width="60" height="5" rx="2" fill="${GRIGIO}"/>
    <rect x="14" y="80" width="80" height="5" rx="2" fill="${GRIGIO}"/><rect x="14" y="90" width="70" height="5" rx="2" fill="${GRIGIO}"/>
    ${dentro}</svg>`;
  /* cerchio che pulsa + freccia che scende sul tasto (x, y = centro del tasto) */
  const qui = (x, y, r = 9) => `<circle class="gf-pulsa" cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${VINO}" stroke-width="2.5"/>
    <g class="gf-freccia"><path d="M${x} ${y - r - 22}v14" stroke="${VINO}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M${x - 6} ${y - r - 10}l6 7 6-7" fill="none" stroke="${VINO}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const condividi = (x, y, c = SCURO) => `<path d="M${x} ${y - 5}v7M${x - 3} ${y - 2}l3-3 3 3M${x - 4} ${y}h-1v6h10v-6h-1" fill="none" stroke="${c}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`;
  const indirizzo = (x, w, y = 186) => `<rect x="${x}" y="${y - 9}" width="${w}" height="18" rx="9" fill="#eceae6"/>
    <text x="${x + w / 2}" y="${y + 3}" font-size="6.5" text-anchor="middle" fill="#555">pronti-in-tavola…</text>`;
  const tondo = (x, y, simbolo) => `<circle cx="${x}" cy="${y}" r="9" fill="#eceae6"/>${simbolo}`;
  const ICO_PAGINA = (x, y) => `<rect x="${x - 4}" y="${y - 5}" width="8" height="10" rx="1.5" fill="none" stroke="${SCURO}" stroke-width="1.2"/><path d="M${x - 2} ${y - 2}h4M${x - 2} ${y + 1}h4" stroke="${SCURO}" stroke-width="1"/>`;
  const ICO_SCHEDE = (x, y) => `<rect x="${x - 4}" y="${y - 3}" width="8" height="8" rx="1.5" fill="none" stroke="${SCURO}" stroke-width="1.2"/><path d="M${x - 2} ${y - 5}h6v6" fill="none" stroke="${SCURO}" stroke-width="1.2"/>`;

  /* passo 1: dove si tocca, secondo la barra di Safari */
  const barra27 = () => tondo(19, 186, ICO_PAGINA(19, 186)) + indirizzo(32, 56) + tondo(101, 186, ICO_SCHEDE(101, 186)) + qui(19, 186);
  const barra26 = () => tondo(19, 186, `<path d="M21 182l-4 4 4 4" fill="none" stroke="${SCURO}" stroke-width="1.4" stroke-linecap="round"/>`) + indirizzo(32, 56)
    + tondo(101, 186, `<text x="101" y="189" font-size="9" text-anchor="middle" fill="${SCURO}">⋯</text>`) + qui(101, 186);
  const barraClassica = () => indirizzo(12, 96, 166) + `<rect x="6" y="178" width="108" height="26" fill="#f6f5f3"/>`
    + [18, 39, 81, 102].map((x, i) => `<rect x="${x - 3}" y="${188}" width="6" height="6" rx="1" fill="${i < 2 ? 'none' : GRIGIO}" stroke="${GRIGIO}"/>`).join('')
    + condividi(60, 190) + qui(60, 190);
  const barraChrome = () => `<rect x="6" y="20" width="108" height="20" fill="#f6f5f3"/>` + indirizzo(12, 80, 30) + condividi(102, 30) + qui(102, 30);
  /* passo 2 (solo iOS 26 e 27): il menu che si apre, con «Condividi» */
  const menu = sinistra => {
    const x = sinistra ? 10 : 40, righe = ['Condividi', 'Aggiungi segnalibro', 'Trova nella pagina', 'Modalità lettura'];
    return `<rect x="${x}" y="98" width="70" height="72" rx="10" fill="#fff" stroke="${GRIGIO}"/>`
      + righe.map((t, i) => `<text x="${x + 8}" y="${114 + i * 16}" font-size="6.5" font-weight="${i ? 400 : 700}" fill="${i ? '#555' : SCURO}">${t}</text>`
        + (i ? `<path d="M${x + 4} ${120 + i * 16}h62" stroke="#eee"/>` : condividi(x + 61, 112))).join('')
      + (sinistra ? tondo(19, 186, ICO_PAGINA(19, 186)) : tondo(101, 186, `<text x="101" y="189" font-size="9" text-anchor="middle">⋯</text>`))
      + indirizzo(32, 56) + qui(x + 35, 111, 11);
  };
  /* passo 3: il foglio di Condividi, si scorre in giù fino a «Aggiungi alla schermata Home» */
  const foglio = () => `<rect x="6" y="60" width="108" height="144" rx="14" fill="#f2f1ef"/>
    ${[22, 44, 66, 88].map(x => `<circle cx="${x + 4}" cy="80" r="8" fill="${GRIGIO}"/>`).join('')}
    ${['Copia', 'Aggiungi ai preferiti'].map((t, i) => `<rect x="12" y="${98 + i * 22}" width="96" height="18" rx="5" fill="#fff"/><text x="18" y="${110 + i * 22}" font-size="6.5" fill="#555">${t}</text>`).join('')}
    <rect x="12" y="142" width="96" height="22" rx="5" fill="#fff" stroke="${VINO}" stroke-width="1.5"/>
    <text x="17" y="156" font-size="6.2" font-weight="700" fill="${SCURO}">Aggiungi alla schermata Home</text>
    <rect x="12" y="168" width="96" height="18" rx="5" fill="#fff"/><text x="18" y="180" font-size="6.5" fill="#aaa">Modifica azioni…</text>
    <path d="M112 196v-26" stroke="${VINO}" stroke-width="2" stroke-linecap="round" class="gf-scorri"/><path d="M108 174l4-5 4 5" fill="none" stroke="${VINO}" stroke-width="2" class="gf-scorri"/>
    ${qui(60, 153, 13)}`;
  /* passo 4: la finestra «Aggiungi»; da iOS 26 c'è «Apri come app web» */
  const aggiungi = conInterruttore => `<rect x="6" y="24" width="108" height="180" fill="#f2f1ef"/>
    <text x="13" y="40" font-size="6.5" fill="#555">Annulla</text><text x="104" y="40" font-size="7" font-weight="700" text-anchor="end" fill="#0a64d6">Aggiungi</text>
    <rect x="12" y="52" width="96" height="34" rx="6" fill="#fff"/><rect x="17" y="57" width="24" height="24" rx="6" fill="${VINO}"/>
    <text x="29" y="73" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">PT</text><text x="46" y="68" font-size="6.5" fill="${SCURO}">Pronti in Tavola</text>
    ${conInterruttore ? `<rect x="12" y="94" width="96" height="22" rx="6" fill="#fff"/><text x="17" y="108" font-size="6.3" fill="${SCURO}">Apri come app web</text>
    <rect x="86" y="99" width="18" height="11" rx="5.5" fill="#34c759"/><circle cx="98.5" cy="104.5" r="4.3" fill="#fff"/>
    <text x="95" y="124" font-size="5.5" text-anchor="middle" fill="#2a8f3f">acceso ✓</text>` : ''}
    ${qui(91, 37, 11)}`;

  /* i passi: [testo, disegno] */
  function passiIPhone(ua) {
    const v = versioneIOS(ua), chrome = /CriOS/.test(ua), nuovo = v >= 26 || (chrome && /OS 18_6/.test(ua));
    const C = '<b>Condividi</b>';
    const p = [];
    if (chrome) p.push([`Tocca ${C} in alto a destra, vicino all'indirizzo.`, tel(barraChrome(), 'Tasto Condividi in alto a destra')]);
    else if (v >= 27) p.push([`Tocca il tasto <b>a sinistra dell'indirizzo</b>, in basso.`, tel(barra27(), 'Tasto a sinistra dell\'indirizzo')],
      [`Tocca ${C}.`, tel(menu(true), 'Menu con Condividi')]);
    else if (v === 26) p.push([`Tocca <b>⋯</b> in basso a destra.`, tel(barra26(), 'Tasto con tre puntini in basso a destra')],
      [`Tocca ${C}.`, tel(menu(false), 'Menu con Condividi')]);
    else p.push([`Tocca ${C} in basso, al centro.`, tel(barraClassica(), 'Tasto Condividi in basso al centro')]);
    p.push([`<b>Scorri in giù</b> e tocca <b>Aggiungi alla schermata Home</b>.<br><small class="tenue">Non c'è? In fondo tocca <b>Modifica azioni</b> e aggiungilo.</small>`,
      tel(foglio(), 'Elenco con Aggiungi alla schermata Home')]);
    p.push([nuovo ? 'Lascia <b>acceso</b> «Apri come app web» e tocca <b>Aggiungi</b> in alto a destra.' : 'Tocca <b>Aggiungi</b> in alto a destra.',
      tel(aggiungi(nuovo), 'Finestra Aggiungi')]);
    return { passi: p, v, chrome };
  }

  /* HTML della guida: i passi uno sotto l'altro, ognuno col suo disegno */
  function guidaIPhone(ua = navigator.userAgent) {
    const { passi, v, chrome } = passiIPhone(ua);
    const altro = !chrome && v >= 26 ? `<p class="gf-nota">Vedi già ${'<b>Condividi</b>'} in basso? Toccalo e vai al passo ${passi.length - 1}.</p>` : '';
    return `<ol class="gf-passi">${passi.map(([t, f], i) => `<li class="gf-passo"><div class="gf-testo"><span class="gf-num">${i + 1}</span><div>${t}</div></div>${f}</li>`).join('')}</ol>${altro}
      <p class="gf-nota">Poi trovi <b>Pronti in Tavola</b> tra le app del telefono.</p>`;
  }
  window.GuidaIPhone = { guidaIPhone, passiIPhone, versioneIOS };
})();
