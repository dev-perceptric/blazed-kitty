// Font specimen sheet: 20 fonts, same slogan, numbered, for picking.
const { chromium } = require('playwright'); const fs = require('fs');
const F = [
  ['Playfair Display Black Italic', 'PlayfairDisplay-900-italic', 'Fashion serif', 'lower'],
  ['Fraunces Black Italic', 'Fraunces-900-italic', 'Soft retro serif', 'lower'],
  ['DM Serif Display Italic', 'DMSerifDisplay-400-italic', 'Magazine serif', 'lower'],
  ['Bodoni Moda Italic', 'BodoniModa-800-italic', 'Vogue-style serif', 'lower'],
  ['Instrument Serif Italic', 'InstrumentSerif-400-italic', 'Thin elegant serif', 'lower'],
  ['EB Garamond Bold Italic', 'EBGaramond-700-italic', 'Classic book serif', 'lower'],
  ['Abril Fatface', 'AbrilFatface-400-normal', 'Heavy poster serif', 'title'],
  ['Rozha One', 'RozhaOne-400-normal', 'High-contrast serif', 'title'],
  ['Source Serif Black Italic', 'SourceSerif4-900-italic', 'Chunky serif italic', 'lower'],
  ['Zilla Slab Bold', 'ZillaSlab-700-normal', 'Slab serif', 'lower'],
  ['Anton', 'Anton-400-normal', 'Tall condensed caps', 'upper'],
  ['Bebas Neue', 'BebasNeue-400-normal', 'Clean condensed caps', 'upper'],
  ['Archivo Black', 'ArchivoBlack-400-normal', 'Heavy block caps', 'upper'],
  ['Space Grotesk Bold', 'SpaceGrotesk-700-normal', 'Techy grotesk', 'lower'],
  ['Syne ExtraBold', 'Syne-800-normal', 'Wide art-school sans', 'lower'],
  ['Unbounded Black', 'Unbounded-900-normal', 'Wide Y2K sans', 'upper'],
  ['Courier Prime Bold', 'CourierPrime-700-normal', 'Typewriter', 'lower'],
  ['Grenze Gotisch Bold', 'GrenzeGotisch-700-normal', 'Modern blackletter', 'title'],
  ['UnifrakturCook', 'UnifrakturCook-700-normal', 'Old English blackletter', 'title'],
  ['Great Vibes', 'GreatVibes-400-normal', 'Elegant script', 'title'],
];
const text = { lower: 'smoke weed,<br>kiss girls', upper: 'SMOKE WEED,<br>KISS GIRLS', title: 'Smoke Weed,<br>Kiss Girls' };
const faces = F.map(([, file], i) => { const [, w, st] = file.split('-'); return `@font-face{font-family:F${i};font-weight:${w};font-style:${st};src:url(file:///home/user/brand/fonts/${file}.woff2)}`; }).join('\n');
const tiles = F.map(([name, file, desc, c], i) => { const [, w, st] = file.split('-');
  return `<div class=t><div class=n>${i + 1}</div><div class=s style="font-family:F${i};font-weight:${w};font-style:${st}">${text[c]}</div><div class=l><b>${name}</b><br>${desc}</div></div>`; }).join('');
const html = `<html><head><style>${faces}
body{margin:0;background:#0b0b0b;font-family:-apple-system,Helvetica,Arial,sans-serif}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;padding:18px;width:1764px}
.t{background:#fff;border-radius:10px;height:300px;position:relative;display:flex;flex-direction:column;justify-content:center;align-items:center}
.s{font-size:46px;line-height:1.05;text-align:center;color:#C81E32;margin-top:-30px}
.n{position:absolute;top:10px;left:12px;background:#FF4F9A;color:#fff;font-weight:700;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:15px}
.l{position:absolute;bottom:12px;left:0;right:0;text-align:center;font-size:14px;color:#555;line-height:1.3}
</style></head><body><div class=g>${tiles}</div></body></html>`;
(async () => { fs.writeFileSync('/home/user/brand/tools/_fonts.html', html);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 1400 }, deviceScaleFactor: 1 });
  await p.goto('file:///home/user/brand/tools/_fonts.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  await p.locator('.g').screenshot({ path: '/home/user/brand/ck/font_sheet.jpg', quality: 90, type: 'jpeg' }); await b.close(); })();
