// Blazed Kitty artwork as SVG strings. Every drawing uses a 400x400 art box.
// Shared gradients, filters, clip paths and bikini patterns live in svgDefs(),
// which the root layout renders once per page.
import type { Product } from './products';

const INK = '#120814';
const f = (n: number) => n.toFixed(1);

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function T(cls: string, x: number, y: number, size: number, len: number, text: string, extra = '') {
  const fit = len ? `textLength="${len}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text class="${cls}" x="${x}" y="${y}" font-size="${size}" text-anchor="middle" ${fit} ${extra}>${text}</text>`;
}
const place = (x: number, y: number, s: number, inner: string) =>
  `<g transform="translate(${x},${y}) scale(${s}) translate(-200,-190)">${inner}</g>`;
const smoke = (d: string, w = 6, c = '#fff1f6') =>
  `<path d="${d}" stroke="${c}" stroke-width="${w * 2.6}" fill="none" stroke-linecap="round" opacity=".35" filter="url(#bk-b8)"/>` +
  `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
const inkAttr = (fill: string, w = 7) =>
  `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" paint-order="stroke"`;

const HEAD = 'M110,170 L120,70 Q125,58 135,66 L185,118 Q200,114 215,118 L265,66 Q275,58 280,70 L290,170 C300,250 260,320 200,320 C140,320 100,250 110,170 Z';

function sleepyEye(cx: number) {
  return `<path d="M${cx - 28},205 Q${cx},234 ${cx + 28},205 Z" fill="#fff1f6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M${cx - 8},206 A8,8 0 0 0 ${cx + 8},206 Z" fill="${INK}"/>
    <path d="M${cx - 32},204 L${cx + 32},204" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
}

interface FaceOpts { wink?: boolean; tongue?: boolean; lashes?: boolean; smoke?: boolean; glow?: boolean }
export function kittyFace(o: FaceOpts = {}) {
  let s = '';
  if (o.glow !== false) s += `<path d="${HEAD}" fill="#ff2e93" opacity=".5" filter="url(#bk-b18)"/>`;
  s += `<path d="${HEAD}" fill="url(#bk-fur)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M130,88 L142,138 L172,118 Z M270,88 L258,138 L228,118 Z" fill="#ffd1e8" opacity=".85"/>
    <ellipse cx="138" cy="238" rx="16" ry="8" fill="#ff7ab8" opacity=".7"/><ellipse cx="262" cy="238" rx="16" ry="8" fill="#ff7ab8" opacity=".7"/>`;
  s += o.wink ? `<path d="M134,212 Q160,190 186,212" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>` : sleepyEye(160);
  s += sleepyEye(240);
  if (o.lashes) s += `<path d="M268,200 l12,-10 M272,207 l14,-4 M262,197 l7,-13" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<path d="M191,240 L209,240 L200,251 Z" fill="${INK}"/>`;
  if (o.tongue) s += `<path d="M191,256 Q200,286 209,256 Z" fill="#ff7ab8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<path d="M200,251 Q190,264 181,257 M200,251 Q210,264 219,257" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g stroke="${INK}" stroke-width="3" stroke-linecap="round"><line x1="146" y1="250" x2="88" y2="240"/><line x1="146" y1="258" x2="86" y2="264"/><line x1="254" y1="250" x2="312" y2="240"/><line x1="254" y1="258" x2="314" y2="264"/></g>`;
  if (o.smoke !== false)
    s += smoke('M220,256 C252,250 262,224 252,204 C244,188 264,170 290,172') +
      `<circle cx="318" cy="150" r="15" fill="none" stroke="#fff1f6" stroke-width="5" opacity=".85"/>`;
  return s;
}

function miniKitty(x: number, y: number, s: number, fill: string, eye: string) {
  return place(x, y, s, `<path d="${HEAD}" fill="${fill}"/><path d="M128,204 L192,204 M208,204 L272,204" stroke="${eye}" stroke-width="16" stroke-linecap="round"/><path d="M138,208 Q160,232 182,208 M218,208 Q240,232 262,208" stroke="${eye}" stroke-width="11" fill="none" stroke-linecap="round"/>`);
}

function paw(fill = '#ff2e93') {
  const beans: [number, number, number][] = [[132, 200, -20], [178, 160, -6], [222, 160, 6], [268, 200, 20]];
  const pad = 'M200,330 C150,330 128,300 140,272 C152,244 178,236 200,236 C222,236 248,244 260,272 C272,300 250,330 200,330 Z';
  return `<g fill="${fill}" stroke="${INK}" stroke-width="6"><path d="${pad}"/>${beans.map((b) => `<ellipse cx="${b[0]}" cy="${b[1]}" rx="24" ry="31" transform="rotate(${b[2]} ${b[0]} ${b[1]})"/>`).join('')}</g>` +
    `<g fill="#fff" opacity=".55">${beans.map((b) => `<ellipse cx="${b[0] - 7}" cy="${b[1] - 10}" rx="5" ry="8" transform="rotate(${b[2]} ${b[0]} ${b[1]})"/>`).join('')}</g>`;
}

/** The main logo: the Pink Chrome kitty face wordmark (E6.5). Pass flat for a one-color version. */
export function logoMark(flat?: string) {
  const L = 'M62,226 L84,150 L122,214 Z', R = 'M338,226 L316,150 L278,214 Z';
  const TP = 'M346,326 C386,310 386,260 358,250 C340,244 332,264 346,270';
  const acc = flat || '#fff1f6';
  const fill = flat || 'url(#bk-chrome)';
  const eye = (cx: number) => flat
    ? `<path d="M${cx - 32},204 L${cx + 32},204 M${cx - 24},208 Q${cx},230 ${cx + 24},208" stroke="${flat}" stroke-width="9" fill="none" stroke-linecap="round"/>`
    : sleepyEye(cx);
  const whiskers = `<line x1="118" y1="244" x2="40" y2="236"/><line x1="118" y1="254" x2="42" y2="262"/><line x1="282" y1="244" x2="360" y2="236"/><line x1="282" y1="254" x2="358" y2="262"/>`;
  return `<g ${flat ? '' : 'filter="url(#bk-bevel)"'}><path d="${L} ${R}" fill="${fill}" ${flat ? '' : `stroke="${INK}" stroke-width="6"`} stroke-linejoin="round"/></g>` +
    T('fs', 200, 112, 74, 210, 'blazed', `fill="${acc}" transform="rotate(-6 200 100)"`) +
    `<g transform="translate(0,-6)">${eye(162)}${eye(238)}</g>` +
    `<path d="M192,232 L208,232 L200,242 Z" fill="${acc}"/>` +
    `<g stroke="${acc}" stroke-width="3" stroke-linecap="round">${whiskers}</g>` +
    `<g ${flat ? '' : 'filter="url(#bk-bevel)"'}>${T('fb', 200, 346, 96, 300, 'KITTY', flat ? `fill="${flat}"` : inkAttr(fill))}</g>` +
    (flat
      ? `<path d="${TP}" stroke="${flat}" stroke-width="10" fill="none" stroke-linecap="round"/>`
      : `<path d="${TP}" stroke="${INK}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="${TP}" stroke="url(#bk-chrome)" stroke-width="10" fill="none" stroke-linecap="round"/>`);
}

function seal(ring: string, bg: string, txt: string) {
  return `<circle cx="200" cy="200" r="184" fill="${bg}"/><circle cx="200" cy="200" r="184" fill="none" stroke="${ring}" stroke-width="8"/><circle cx="200" cy="200" r="124" fill="none" stroke="${txt}" stroke-opacity=".35" stroke-width="2"/>
    <text class="fb" font-size="24" fill="${txt}"><textPath href="#bk-badge" textLength="925" lengthAdjust="spacing">BLAZED KITTY ✦ BAD KITTY CLUB ✦ EST 4:20 ✦</textPath></text>` +
    place(200, 206, 0.52, kittyFace({ wink: true, tongue: true, lashes: true, smoke: false }));
}

/* ---------- Garment front prints ---------- */
const PRINTS: Record<string, () => string> = {
  logo: () => logoMark(),
  pet: () =>
    T('fs', 196, 150, 104, 260, 'pet me', 'fill="#ff2e93" transform="rotate(-7 200 150)"') +
    T('fs', 206, 256, 104, 300, 'i’m high', 'fill="#ff9bd2" transform="rotate(-7 200 250)"') +
    place(200, 336, 0.26, kittyFace({ glow: false })) +
    `<g fill="#ff2e93" opacity=".8">${[[70, 330], [98, 300], [312, 302], [340, 334]].map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="7"/><circle cx="${p[0] - 9}" cy="${p[1] - 11}" r="3.5"/><circle cx="${p[0]}" cy="${p[1] - 14}" r="3.5"/><circle cx="${p[0] + 9}" cy="${p[1] - 11}" r="3.5"/>`).join('')}</g>`,
  nine: () => {
    let g = '';
    [160, 230, 300].forEach((y, j) => [120, 200, 280].forEach((x, i) => {
      const mid = i === 1 && j === 1;
      g += (mid ? `<circle cx="${x}" cy="${y}" r="34" fill="#ff2e93" opacity=".6" filter="url(#bk-b8)"/>` : '') +
        miniKitty(x, y, 0.24, mid ? '#ff2e93' : '#fff1f6', INK);
    }));
    return T('fb', 200, 104, 58, 300, 'NINE LIVES', 'fill="#fff1f6"') + g + T('fs', 200, 388, 56, 300, 'all of them baked', 'fill="#ff2e93"');
  },
  snack: () =>
    T('fs', 196, 140, 80, 270, 'kitty wants', 'fill="#2a1030" transform="rotate(-5 200 140)"') +
    T('fb', 200, 250, 92, 320, 'A SNACK', 'fill="#2a1030"') +
    place(200, 322, 0.3, paw()) +
    T('fm', 200, 392, 14, 0, 'FEED ME AFTER 4:20', 'fill="#2a1030" letter-spacing="4"'),
  bad: () => seal('#2a1030', 'none', '#2a1030'),
  purr: () =>
    `<g fill="none" stroke="#fff1f6" opacity=".7"><circle cx="340" cy="70" r="20" stroke-width="6" filter="url(#bk-b3)"/><circle cx="366" cy="34" r="11" stroke-width="4" filter="url(#bk-b3)"/></g>` +
    ['PURR', 'PUFF', 'PASS'].map((w, i) => T('fb', 196, 136 + i * 100, 96, 290, w, 'fill="#ff2e93" stroke="#0e0a12" stroke-width="6" paint-order="stroke"')).join('') +
    T('fm', 200, 388, 13, 0, 'BLAZED KITTY · EST 4:20', 'fill="#ff9bd2" letter-spacing="4"'),
  streets: () =>
    T('fs', 200, 150, 82, 320, 'sativa in the streets', 'fill="#ff9bd2" transform="rotate(-5 200 150)"') +
    T('fb', 200, 262, 70, 330, 'INDICA IN', 'fill="#fff1f6"') +
    T('fb', 200, 338, 70, 330, 'THE SHEETS', 'fill="#ff2e93"') +
    smoke('M330,60 C348,44 330,32 346,18', 4),
  maint: () =>
    T('fb', 200, 150, 64, 330, 'HIGH', 'fill="#2a1030"') +
    T('fb', 200, 232, 64, 330, 'MAINTENANCE', 'fill="#2a1030"') +
    T('fs', 200, 312, 72, 280, 'low standards', 'fill="#ff2e93" transform="rotate(-5 200 306)"') +
    place(200, 368, 0.14, kittyFace({ glow: false, smoke: false })),
};

/* ---------- Garment shapes ---------- */
const SHAPES = {
  crop: {
    d: 'M150,40 C170,72 230,72 250,40 L302,50 L358,82 L386,140 L342,158 L322,130 C320,200 324,262 330,322 C262,336 138,336 70,322 C76,262 80,200 78,130 L58,158 L14,140 L42,82 L98,50 Z',
    art: { x: 110, y: 92, s: 180 },
  },
  tank: {
    d: 'M118,28 L146,28 C150,70 158,102 172,116 C186,124 214,124 228,116 C242,102 250,70 254,28 L282,28 C286,80 294,118 310,146 C320,190 316,250 318,300 C320,340 324,370 326,394 C260,406 140,406 74,394 C76,370 80,340 82,300 C84,250 80,190 90,146 C106,118 114,80 118,28 Z',
    art: { x: 116, y: 136, s: 168 },
  },
} as const;

function garmentSVG(p: Product, hex: string, label: string) {
  const g = SHAPES[p.garment as 'crop' | 'tank'];
  const dark = isDark(hex);
  const seam = dark ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.14)';
  const neck = p.garment === 'crop'
    ? `<path d="M150,40 C170,72 230,72 250,40" fill="none" stroke="${seam}" stroke-width="6"/><path d="M34,134 L68,148 M366,134 L332,148" stroke="${seam}" stroke-width="1.5" stroke-dasharray="3 3"/>`
    : `<path d="M146,30 C150,70 158,102 172,116 C186,124 214,124 228,116 C242,102 250,70 254,30" fill="none" stroke="${seam}" stroke-width="5"/><g stroke="${seam}" stroke-width="1" opacity=".7">${Array.from({ length: 22 }, (_, i) => `<line x1="${84 + i * 11}" y1="150" x2="${84 + i * 11}" y2="398"/>`).join('')}</g>`;
  return `<svg viewBox="0 0 400 420" role="img" aria-label="${label}">
    <path d="${g.d}" fill="${hex}"/>
    ${neck}
    <g clip-path="url(#bk-clip-${p.garment})"><svg x="${g.art.x}" y="${g.art.y}" width="${g.art.s}" height="${g.art.s}" viewBox="0 0 400 400" overflow="visible">${PRINTS[p.design]()}</svg></g>
    <path d="${g.d}" fill="url(#bk-shade)" pointer-events="none"/>
  </svg>`;
}

const CUPL = 'M165,70 C150,100 118,140 104,166 Q150,172 196,164 C192,130 178,96 165,70 Z';
const CUPR = 'M235,70 C250,100 282,140 296,166 Q250,172 204,164 C208,130 222,96 235,70 Z';
const BOT = 'M108,268 Q200,288 292,268 C272,318 232,358 213,386 Q200,394 187,386 C168,358 128,318 108,268 Z';
const BIKINI: Record<string, { fill: string; string: string; extra?: string }> = {
  patEars: { fill: 'url(#bk-pat-ears)', string: '#ff2e93' },
  patLeopard: { fill: 'url(#bk-pat-leopard)', string: '#1a0a1c' },
  patFaces: { fill: 'url(#bk-pat-faces)', string: '#2a1030' },
  script: {
    fill: '#1a0f1f', string: '#ff9bd2',
    extra: `<text class="fs" x="200" y="312" font-size="44" text-anchor="middle" fill="#ff2e93" transform="rotate(-6 200 306)">kitty</text>`,
  },
};

function bikiniSVG(p: Product, label: string) {
  const b = BIKINI[p.design];
  const piece = (d: string) => `<path d="${d}" fill="${b.fill}" stroke="#1a0a1c" stroke-width="3" stroke-linejoin="round"/><path d="${d}" fill="url(#bk-bik-shade)"/>`;
  const glow = p.design === 'script'
    ? `<g filter="url(#bk-b8)" opacity=".75"><circle cx="150" cy="140" r="26" fill="#ff2e93"/><circle cx="250" cy="140" r="26" fill="#ff2e93"/><circle cx="200" cy="300" r="34" fill="#ff2e93"/></g>`
    : '';
  return `<svg viewBox="0 0 400 420" role="img" aria-label="${label}">
    <g stroke="${b.string}" stroke-width="3.5" fill="none" stroke-linecap="round">
      <path d="M165,72 L180,4"/><path d="M235,72 L220,4"/>
      <path d="M24,172 Q110,178 200,166 Q290,178 376,172"/>
      <path d="M110,270 Q78,262 44,258"/><path d="M290,270 Q322,262 356,258"/>
      <path d="M46,258 L32,300 M46,258 L60,304 M354,258 L340,304 M354,258 L368,300"/>
    </g>
    ${piece(CUPL)}${piece(CUPR)}${piece(BOT)}
    ${glow ? `<g clip-path="url(#bk-clip-bikini)">${glow}</g>` : ''}
    <circle cx="200" cy="166" r="7" fill="none" stroke="#e8e0ea" stroke-width="3"/>
    ${b.extra || ''}
  </svg>`;
}

export function productSVG(p: Product, hex: string, view: 'garment' | 'print' = 'garment') {
  const label = `${p.name}${p.garment === 'bikini' ? '' : `, ${view === 'print' ? 'print art' : 'front'}`}`;
  if (p.garment === 'bikini') return bikiniSVG(p, label);
  if (view === 'print') {
    return `<svg viewBox="0 0 400 400" role="img" aria-label="${label}"><rect width="400" height="400" fill="${hex}"/><svg x="20" y="20" width="360" height="360" viewBox="0 0 400 400">${PRINTS[p.design]()}</svg></svg>`;
  }
  return garmentSVG(p, hex, label);
}

/** Raw front print for a design, drawn in a 400x400 box (no background). */
export function printArt(design: string) {
  return PRINTS[design]();
}

/** Full bikini fabric for Printful all-over print files, at print scale. */
export function fabricSVG(design: string, w: number, h: number) {
  // Scale tiles so motifs land around 1 to 2 inches on the fabric.
  const k = design === 'patLeopard' ? 4.5 : 6;
  let tile = '';
  let size = 56;
  let bg = '#0e0a12';
  if (design === 'patEars') {
    tile = miniEars(14, 14, '#ff2e93') + miniEars(42, 42, '#ff9bd2');
  } else if (design === 'patLeopard') {
    size = 110;
    tile = leopard();
    bg = '#ff2e93';
  } else if (design === 'patFaces') {
    size = 64;
    bg = '#ffb8dd';
    tile = miniKitty(16, 17, 0.1, '#2a1030', '#ffb8dd') + miniKitty(48, 49, 0.1, '#ff2e93', '#2a1030');
  } else {
    size = 90;
    bg = '#1a0f1f';
    tile = `<text class="fs" x="22" y="34" font-size="22" fill="#ff2e93" transform="rotate(-8 22 34)">kitty</text>` +
      `<text class="fs" x="64" y="80" font-size="22" fill="#ff9bd2" transform="rotate(-8 64 80)">kitty</text>` +
      `<circle cx="74" cy="22" r="5" fill="none" stroke="#ff9bd2" stroke-width="1.6"/><circle cx="16" cy="70" r="3.5" fill="none" stroke="#ff2e93" stroke-width="1.4"/>`;
  }
  const s = size * k;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><pattern id="fab" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${bg}"/><g transform="scale(${k})">${tile.replace('<rect width="110" height="110" fill="#ff2e93"/>', '')}</g></pattern></defs>
    <rect width="${w}" height="${h}" fill="url(#fab)"/></svg>`;
}

export function logoSVG(label = 'Blazed Kitty', flat?: string) {
  return `<svg viewBox="0 0 400 400" role="img" aria-label="${label}">${logoMark(flat)}</svg>`;
}

export function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

/* ---------- Shared defs ---------- */
function miniEars(x: number, y: number, c: string) {
  return `<g fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="${x}" cy="${y + 3}" r="8"/><path d="M${x - 8},${y - 1} L${x - 6},${y - 11} L${x - 2},${y - 5} M${x + 8},${y - 1} L${x + 6},${y - 11} L${x + 2},${y - 5}"/></g>`;
}
function leopard() {
  const r = rng(42);
  let s = '<rect width="110" height="110" fill="#ff2e93"/>';
  [[22, 24], [66, 18], [92, 52], [40, 62], [16, 92], [72, 86], [50, 38]].forEach(([x, y]) => {
    const R = 7 + r() * 5;
    s += `<ellipse cx="${x}" cy="${y}" rx="${f(R)}" ry="${f(R * 0.8)}" fill="#a3125b"/>`;
    const a0 = r() * 360;
    for (let k = 0; k < 3; k++) {
      const a1 = ((a0 + k * 120) * Math.PI) / 180, a2 = ((a0 + k * 120 + 78) * Math.PI) / 180, RR = R + 5;
      s += `<path d="M${f(x + RR * Math.cos(a1))},${f(y + RR * 0.85 * Math.sin(a1))} A${f(RR)},${f(RR * 0.85)} 0 0 1 ${f(x + RR * Math.cos(a2))},${f(y + RR * 0.85 * Math.sin(a2))}" stroke="#1a0a1c" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    }
  });
  return s;
}

export function svgDefs() {
  return `
  <linearGradient id="bk-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb8dd"/><stop offset=".55" stop-color="#ff2e93"/><stop offset="1" stop-color="#c21672"/></linearGradient>
  <linearGradient id="bk-chrome" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".38" stop-color="#ffd0e6"/><stop offset=".5" stop-color="#a8236a"/>
    <stop offset=".53" stop-color="#ffe3f0"/><stop offset=".75" stop-color="#ff7fbf"/><stop offset="1" stop-color="#ffffff"/>
  </linearGradient>
  <linearGradient id="bk-shade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".2" stop-color="#000" stop-opacity="0"/>
    <stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/>
  </linearGradient>
  <radialGradient id="bk-bik-shade" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
  <filter id="bk-b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="bk-b8" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="bk-b18" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="bk-bevel" x="-15%" y="-20%" width="130%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/>
    <feSpecularLighting in="b" surfaceScale="4" specularConstant="1.1" specularExponent="22" lighting-color="#ffffff" result="s"><fePointLight x="-120" y="-160" z="240"/></feSpecularLighting>
    <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
    <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0" result="lit"/>
    <feDropShadow in="lit" dx="0" dy="5" stdDeviation="4" flood-color="#000" flood-opacity=".5"/>
  </filter>
  <path id="bk-badge" d="M200,200 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0"/>
  <clipPath id="bk-clip-crop"><path d="${SHAPES.crop.d}"/></clipPath>
  <clipPath id="bk-clip-tank"><path d="${SHAPES.tank.d}"/></clipPath>
  <clipPath id="bk-clip-bikini"><path d="${CUPL} ${CUPR} ${BOT}"/></clipPath>
  <pattern id="bk-pat-ears" width="56" height="56" patternUnits="userSpaceOnUse"><rect width="56" height="56" fill="#0e0a12"/>${miniEars(14, 14, '#ff2e93')}${miniEars(42, 42, '#ff9bd2')}</pattern>
  <pattern id="bk-pat-leopard" width="110" height="110" patternUnits="userSpaceOnUse">${leopard()}</pattern>
  <pattern id="bk-pat-faces" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#ffb8dd"/>${miniKitty(16, 17, 0.1, '#2a1030', '#ffb8dd')}${miniKitty(48, 49, 0.1, '#ff2e93', '#2a1030')}</pattern>`;
}
