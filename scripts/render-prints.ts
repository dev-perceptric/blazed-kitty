// Renders Printful print files for every product into public/prints.
// Run: npx tsx scripts/render-prints.ts   (needs Playwright with Chromium)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { PRODUCTS } from '../lib/products';
import { printArt, fabricSVG, svgDefs } from '../lib/art';

const OUT = 'public/prints';
// Printful print areas (px at 150 dpi) from the mockup-generator printfiles API.
const AREA = { crop: { w: 1500, h: 1500 }, tank: { w: 1050, h: 1200 }, bikini: { w: 7500, h: 3300 } };

const FONTS = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@600&family=Titan+One&family=Yellowtail&display=block';
const page = (body: string, w: number, h: number) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}">
<style>html,body{margin:0;background:transparent;width:${w}px;height:${h}px;overflow:hidden}
.fb{font-family:'Titan One'}.fs{font-family:'Yellowtail'}.fm{font-family:'IBM Plex Mono';font-weight:600}</style></head>
<body><svg width="0" height="0" style="position:absolute"><defs>${svgDefs()}</defs></svg>${body}</body></html>`;

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const p of PRODUCTS) {
    const a = AREA[p.garment];
    const ctx = await browser.newContext({ viewport: { width: a.w, height: a.h }, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    let body: string;
    let file: string;
    if (p.garment === 'bikini') {
      body = fabricSVG(p.design, a.w, a.h);
      file = `${OUT}/${p.design}.jpg`;
    } else {
      const s = Math.min(a.w, a.h);
      body = `<svg width="${a.w}" height="${a.h}" viewBox="0 0 ${a.w} ${a.h}"><svg x="${(a.w - s) / 2}" y="0" width="${s}" height="${s}" viewBox="0 0 400 400">${printArt(p.design)}</svg></svg>`;
      file = `${OUT}/${p.design}.png`;
    }
    await pg.setContent(page(body, a.w, a.h), { waitUntil: 'networkidle' });
    await pg.evaluate(() => (document as any).fonts.ready);
    await pg.waitForTimeout(400);
    if (p.garment === 'bikini') await pg.screenshot({ path: file, type: 'jpeg', quality: 88 });
    else await pg.screenshot({ path: file, omitBackground: true });
    console.log('wrote', file);
    await ctx.close();
  }
  await browser.close();
}

main();
