import data from './mockups.json';
import type { Product } from './products';

export interface Shot {
  src: string;
  color: string;
  style: string;
  option: string;
}

const MOCKUPS = data as Record<string, Shot[]>;

// On-model lifestyle photos first, then on-model studio, then flat lays.
function rank(s: Shot) {
  const t = `${s.style} ${s.option}`.toLowerCase();
  if (t.includes('lifestyle') && !t.includes('flat')) return 0;
  if (t.includes('women')) return 1;
  if (t.includes('flat lifes')) return 2;
  return 3;
}

/** Photos for a product, best first. Filtered to one color when given. */
export function shotsFor(p: Product, color?: string): Shot[] {
  const all = [...(MOCKUPS[p.slug] ?? [])].sort((a, b) => rank(a) - rank(b));
  const byColor = color ? all.filter((s) => s.color === color) : all;
  return byColor.length ? byColor : all;
}

/** The print file itself, used when no photo exists yet. */
export function printSrc(p: Product) {
  return `/prints/${p.design}.${p.garment === 'bikini' ? 'jpg' : 'png'}`;
}
