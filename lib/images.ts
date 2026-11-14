import data from './mockups.json';
import type { Product } from './products';
import { CDN } from './taxonomy';

export interface Shot {
  src: string;
  color: string;
  style: string;
  option: string;
}

const MOCKUPS = data as Record<string, Shot[]>;

// Our model photo first, then Printful's product-only shots (ghost, then flat).
function rank(s: Shot) {
  const t = `${s.style} ${s.option}`.toLowerCase();
  if (s.style === 'Model') return 0;
  if (t.includes('main') || t.includes('ghost')) return 1;
  if (t.includes('flat')) return 2;
  return 3;
}

/** Photos for a product, best first. Filtered to one color when given. */
export function shotsFor(p: Product, color?: string): Shot[] {
  const all = [...(MOCKUPS[p.slug] ?? [])].sort((a, b) => rank(a) - rank(b));
  const model = all.filter((s) => s.color === '*');
  const rest = all.filter((s) => s.color !== '*');
  const byColor = color ? rest.filter((s) => s.color === color) : rest;
  // Show one product shot per color in the default view so cards stay clean.
  const pick = byColor.length ? byColor : rest.filter((s) => s.color === rest[0]?.color);
  return [...model, ...pick];
}


/** The print file itself, used when no photo exists yet. */
export function printSrc(p: Product) {
  return `${CDN}/printful/${p.design}__${p.printful.productId}.png`;
}
