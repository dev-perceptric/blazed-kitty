import type { Product } from './products';
import { getCategory, getLine } from './taxonomy';
import { attrWords } from './tags';

/** Words that mean the same thing to shoppers. Left side is what people type. */
const SYNONYMS: Record<string, string> = {
  tshirt: 'tee', tshirts: 'tee', shirt: 'tee', shirts: 'tee', t: 'tee', top: 'tee', tops: 'tee',
  hoody: 'hoodie', hoodies: 'hoodie', zipup: 'zip', sweatshirt: 'hoodie',
  skirts: 'skirt', dresses: 'dress', pant: 'pants', trousers: 'pants', jean: 'jeans',
  gothic: 'goth', emo: 'emo', y2k: 'y2k', brasil: 'brazil', brazilian: 'brazil',
  kitty: 'cat', kitten: 'cat', cats: 'cat', skull: 'skulls', skeleton: 'skulls', star: 'stars', heart: 'hearts',
  grey: 'gray', jersey: 'jersey', band: 'music', merch: 'music', rapper: 'music', leather: 'leather',
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9$ ]+/g, ' ').replace(/\s+/g, ' ').trim();

const stem = (w: string) => {
  const s = SYNONYMS[w] ?? w;
  return s.length > 3 && s.endsWith('s') && !s.endsWith('ss') ? s.slice(0, -1) : s;
};

interface Doc { p: Product; name: string; all: string }

let cache: { list: Product[]; docs: Doc[] } | null = null;

function docsFor(list: Product[]): Doc[] {
  if (cache?.list === list) return cache.docs;
  const docs = list.map((p) => {
    const name = norm(p.name).split(' ').map(stem).join(' ');
    const extra = [getCategory(p.category)?.label, getLine(p.line)?.label, attrWords(p.attrs), ...(p.tags ?? []), p.attrs?.print === 'music' ? 'band merch' : '']
      .filter(Boolean).join(' ');
    return { p, name, all: `${name} ${norm(extra).split(' ').map(stem).join(' ')}` };
  });
  cache = { list, docs };
  return docs;
}

/** Products matching every word of the query, best matches first (words in the name count most). */
export function searchProducts(list: Product[], query: string): Product[] {
  let words = norm(query).split(' ').filter(Boolean);
  // "jorts" means denim shorts: only the Shorts category counts.
  if (words.some((w) => w === 'jorts' || w === 'jort')) {
    list = list.filter((p) => p.category === 'shorts');
    words = words.filter((w) => w !== 'jorts' && w !== 'jort');
    if (!words.length) return list.filter((p) => p.attrs?.material?.includes('denim') || /denim|jean|jort/i.test(p.name)).concat(list.filter((p) => !(p.attrs?.material?.includes('denim') || /denim|jean|jort/i.test(p.name))));
  }
  words = words.map(stem);
  if (!words.length) return list;
  const hit = (text: string, w: string) => (` ${text} `).includes(` ${w}`);
  const scored: { p: Product; score: number }[] = [];
  for (const d of docsFor(list)) {
    let score = 0;
    let ok = true;
    for (const w of words) {
      if (hit(d.name, w)) score += 3;
      else if (hit(d.all, w)) score += 1;
      else { ok = false; break; }
    }
    if (ok) scored.push({ p: d.p, score: score + (d.name.startsWith(words[0]) ? 1 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
}
