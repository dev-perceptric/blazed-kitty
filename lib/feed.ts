// Server side of infinite scrolling: builds the same product lists the pages show and turns them into light card data.
import type { Product } from './products';
import { formatPrice } from './money';
import { shotsFor } from './images';
import { SHOP, getCollection, getDept, isNew, productsIn } from './catalog';
import { FILTER_KEYS, applyFilters, type Filters } from './filters';
import { searchProducts } from './search';

export const PER_PAGE = 60;
export const RECS_FIRST = 12;
export const RECS_PER_PAGE = 24;

export interface Card {
  slug: string; name: string; price: string; isNew: boolean;
  img?: string; imgClass?: string; img2?: string; img2Class?: string;
  dots: string[]; more: number;
}

export function cardOf(p: Product): Card {
  const shots = shotsFor(p);
  const colors = p.colors.filter((c) => !/photo|default/i.test(c.name));
  return {
    slug: p.slug, name: p.name, price: formatPrice(p.price), isNew: isNew(p),
    img: shots[0]?.src ?? p.photos?.[0]?.src, imgClass: shots[0]?.style === 'Model' ? undefined : 'is-product',
    img2: shots[1]?.src, img2Class: shots[1] ? `photo-alt${shots[1].style === 'Model' ? '' : ' is-product'}` : undefined,
    dots: colors.length > 1 ? colors.slice(0, 5).map((c) => (c.image ? `center / cover url(${c.image}), ${c.hex}` : c.hex)) : [],
    more: colors.length > 5 ? colors.length - 5 : 0,
  };
}

export const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'new', label: 'Newest' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
];

/** Filters + sort, shared by the collection pages and the feed API so both show the same order. */
export function filterAndSort(products: Product[], search: Partial<Record<string, string>>) {
  const filters: Filters = {};
  for (const k of FILTER_KEYS) if (search[k]) filters[k] = search[k];
  const sort = SORTS.some((s) => s.id === search.sort) ? search.sort! : 'featured';
  let list = applyFilters(products, filters);
  if (sort === 'new') list = [...list].reverse();
  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  return { list, filters, sort };
}

/** Pieces that share the most photo tags with this one. */
export function similar(product: Product, pool: Product[]) {
  const a = product.attrs ?? {};
  const score = (p: Product) => {
    const b = p.attrs ?? {};
    let s = 0;
    if (b.sub && b.sub === a.sub) s += 3;
    if (b.vibe && b.vibe === a.vibe) s += 2;
    if (b.print && b.print === a.print) s += 1;
    s += (b.themes ?? []).filter((t) => a.themes?.includes(t)).length;
    s += (b.material ?? []).filter((t) => a.material?.includes(t)).length * 0.5;
    return s;
  };
  return pool.map((p) => ({ p, s: score(p) })).sort((x, y) => y.s - x.s).map((x) => x.p);
}

/** "You may also like": same category first (closest match first), then the same vibe from other categories. */
export function alsoLike(product: Product) {
  const others = SHOP.filter((p) => p.slug !== product.slug);
  const same = similar(product, others.filter((p) => p.category === product.category));
  const vibe = similar(product, others.filter((p) => p.category !== product.category && p.attrs?.vibe && p.attrs.vibe === product.attrs?.vibe));
  return [...same, ...vibe];
}

export function completeLook(product: Product) {
  const others = SHOP.filter((p) => p.slug !== product.slug);
  return similar(product, others.filter((p) => p.line !== product.line && p.attrs?.vibe === product.attrs?.vibe));
}

/** One page of cards for the feed API. Returns null for an unknown source. */
export function feedPage(q: URLSearchParams): { cards: Card[]; next: number | null } | null {
  const page = Math.max(1, Number(q.get('page')) || 1);
  const kind = q.get('kind');
  let list: Product[];
  let first = PER_PAGE, per = PER_PAGE;
  if (kind === 'collection') {
    const c = getCollection(q.get('slug') ?? '');
    const dept = q.get('dept') ? getDept(q.get('dept')!) : undefined;
    if (!c || (q.get('dept') && !dept)) return null;
    list = filterAndSort(productsIn(c, dept?.id), Object.fromEntries(q)).list;
  } else if (kind === 'search') {
    const term = (q.get('q') ?? '').trim().slice(0, 80);
    list = filterAndSort(term ? searchProducts(SHOP, term) : SHOP, Object.fromEntries(q)).list;
  } else if (kind === 'like') {
    const p = SHOP.find((x) => x.slug === q.get('slug'));
    if (!p) return null;
    list = alsoLike(p);
    first = RECS_FIRST; per = RECS_PER_PAGE;
  } else return null;
  const start = page === 1 ? 0 : first + (page - 2) * per;
  const size = page === 1 ? first : per;
  const slice = list.slice(start, start + size);
  return { cards: slice.map(cardOf), next: start + size < list.length ? page + 1 : null };
}
