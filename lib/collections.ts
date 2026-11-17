import { PRODUCTS, type Product } from './products';
import {
  CATEGORIES, COLOR_FAMILIES, DETAILS, LINES, PRICE_RANGES, SIZE_ORDER, VIBES, categoriesFor, getCategory, getLine, getVibe,
  type LineDef,
} from './taxonomy';

export interface Crumb { label: string; href: string }
export interface Child { label: string; href: string; count: number }

export interface Collection {
  key: string;
  title: string;
  blurb?: string;
  image?: string;
  href: string;
  crumbs: Crumb[];
  products: Product[];
  /** Sub-collections to show as chips (lines on /shop, categories inside a line, vibes on vibe pages). */
  children: Child[];
  afterDark?: boolean;
  /** Set on vibe pages, so the vibe filter is hidden there. */
  vibe?: string;
}

const visible = (p: Product) => !p.afterDark;

export const NEWEST_DROP = PRODUCTS.reduce((max, p) => (p.drop > max ? p.drop : max), 'drop0');

export function shopHref(...parts: string[]) {
  return ['/shop', ...parts].join('/');
}

/** First photo of the first product in a list, for tiles and headers. */
export function coverFor(list: Product[]) {
  // Clothing first: stash extras (grinders, ashtrays) make odd cover photos.
  const p = list.find((x) => x.photos?.length && x.category !== 'extras') ?? list.find((x) => x.photos?.length);
  return p?.photos?.[0]?.src;
}

export const vibeMatches = (p: Product, vibeId: string) => !!getVibe(vibeId)?.match.test(p.name);

function categoryChildren(line: LineDef, list: Product[]): Child[] {
  return categoriesFor(line.id)
    .map((c) => ({ label: c.label, href: shopHref(line.id, c.id), count: list.filter((p) => p.category === c.id).length }))
    .filter((c) => c.count > 0);
}

function lineChildren(): Child[] {
  return LINES.map((l) => ({ label: l.label, href: shopHref(l.id), count: PRODUCTS.filter((p) => p.line === l.id).length })).filter((c) => c.count > 0);
}

function vibeChildren(): Child[] {
  return VIBES.map((v) => ({ label: v.label, href: shopHref('vibe', v.id), count: PRODUCTS.filter((p) => v.match.test(p.name)).length })).filter((c) => c.count > 0);
}

/**
 * Turns a /shop/... path into a collection.
 *   /shop                      everything
 *   /shop/new                  newest drop
 *   /shop/after-dark           18+ pieces (hidden while empty)
 *   /shop/vibe/goth            a vibe
 *   /shop/tops                 a line
 *   /shop/tops/baby-tees       a category inside a line
 */
export function resolveCollection(path: string[] = []): Collection | null {
  const all = PRODUCTS;
  const shop: Crumb = { label: 'Shop', href: '/shop' };

  if (path.length === 0) {
    return { key: 'all', title: 'Shop', href: '/shop', crumbs: [], products: all, children: lineChildren() };
  }

  const [a, b, c, ...rest] = path;
  if (c || rest.length) return null;

  if (a === 'new' && !b) {
    return {
      key: 'new', title: 'New In', blurb: 'The latest drop. Get it before it sells out.', href: shopHref('new'), crumbs: [shop],
      products: all.filter((p) => p.drop === NEWEST_DROP && visible(p)), children: [],
    };
  }

  if (a === 'after-dark' && !b) {
    return {
      key: 'after-dark', title: 'After Dark', blurb: 'The ruder lines. Blurred until you say you’re a grown-up.',
      href: shopHref('after-dark'), crumbs: [shop], products: all.filter((p) => p.afterDark), children: [], afterDark: true,
    };
  }

  if (a === 'vibe') {
    const vibe = b ? getVibe(b) : undefined;
    if (!vibe) return null;
    const list = all.filter((p) => vibe.match.test(p.name));
    return {
      key: `vibe/${vibe.id}`, title: vibe.label, blurb: vibe.blurb, image: coverFor(list), href: shopHref('vibe', vibe.id),
      crumbs: [shop], products: list, children: vibeChildren(), vibe: vibe.id,
    };
  }

  const line = getLine(a);
  if (!line || !LINES.includes(line)) return null;
  const lineList = all.filter((p) => p.line === line.id);
  const lineCrumb = { label: line.label, href: shopHref(line.id) };
  if (!b) {
    return {
      key: line.id, title: line.label, blurb: line.blurb, image: coverFor(lineList), href: lineCrumb.href, crumbs: [shop],
      products: lineList, children: categoryChildren(line, lineList),
    };
  }
  const cat = getCategory(b);
  if (!cat || cat.line !== line.id) return null;
  const list = lineList.filter((p) => p.category === cat.id);
  return {
    key: `${line.id}/${cat.id}`, title: cat.label, blurb: line.blurb, image: coverFor(list), href: shopHref(line.id, cat.id),
    crumbs: [shop, lineCrumb], products: list, children: categoryChildren(line, lineList),
  };
}

/** Every valid /shop path with products, for static generation. */
export function allCollectionPaths(): string[][] {
  const paths: string[][] = [[], ['new']];
  for (const l of LINES) {
    paths.push([l.id]);
    for (const c of categoriesFor(l.id)) paths.push([l.id, c.id]);
  }
  for (const v of VIBES) paths.push(['vibe', v.id]);
  return paths;
}

/** Breadcrumb trail for a product page. */
export function productTrail(p: Product): Crumb[] {
  const shop = { label: 'Shop', href: '/shop' };
  const line = getLine(p.line);
  const cat = getCategory(p.category);
  if (!line || !cat || !LINES.includes(line)) return [shop];
  return [shop, { label: line.label, href: shopHref(line.id) }, { label: cat.label, href: shopHref(line.id, cat.id) }];
}

// ---------- old links ----------

/** Old /shop?c= links from before the first rebuild. */
export const LEGACY_TABS: Record<string, string> = {
  tees: shopHref('tops'),
  tanks: shopHref('tops', 'camis-tanks'),
  panties: '/shop',
  'after-dark': shopHref('after-dark'),
};

const OLD_LINES: Record<string, string> = { tops: 'tops', bottoms: 'bottoms', lounge: 'knits', stash: 'accessories', headwear: 'accessories' };
const OLD_CATS: Record<string, string> = {
  'baby-tees': 'tops/baby-tees', 'crop-tees': 'tops/crop-tees', tees: 'tops/oversized-tees', tanks: 'tops/camis-tanks',
  'long-sleeves': 'tops/long-sleeves', hoodies: 'knits/hoodies', sweatpants: 'bottoms/pants', shorts: 'bottoms/shorts',
  dresses: 'dresses', skirts: 'bottoms/skirts', pants: 'bottoms/pants', jewelry: 'accessories/jewelry', socks: 'accessories/legwear',
  bags: 'accessories/bags', shoes: 'accessories/shoes', accessories: 'accessories/belts', tech: 'accessories/extras',
  glassware: 'accessories/extras', 'rolling-mats': 'accessories/extras',
};

/** Where an old /shop/women/..., /shop/men/... or old line link should go now. Null if the path is current. */
export function legacyRedirect(path: string[] = []): string | null {
  if (!path.length || resolveCollection(path)) return null;
  const [a, ...rest] = path;
  if (a === 'women' || a === 'men') {
    if (!rest.length) return '/shop';
    return legacyRedirect(rest) ?? (resolveCollection(rest) ? shopHref(...rest) : '/shop');
  }
  const cat = rest[rest.length - 1];
  if (cat && OLD_CATS[cat]) return shopHref(OLD_CATS[cat]);
  if (OLD_LINES[a]) return shopHref(OLD_LINES[a]);
  if (a === 'home' || a === 'swim') return '/shop';
  return null;
}

// ---------- filters ----------

export interface Filters {
  vibe?: string;
  detail?: string;
  color?: string;
  size?: string;
  price?: string;
}

export const FILTER_KEYS = ['vibe', 'detail', 'color', 'size', 'price'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

const colorFamilies = (p: Product) => COLOR_FAMILIES.filter((f) => p.colors.some((c) => f.match.test(c.name)) || f.match.test(p.name)).map((f) => f.id);

export function matchesFilter(p: Product, key: FilterKey, value: string) {
  switch (key) {
    case 'vibe': return vibeMatches(p, value);
    case 'detail': return !!DETAILS.find((d) => d.id === value)?.match.test(p.name);
    case 'color': return colorFamilies(p).includes(value);
    case 'size': return p.sizes.includes(value);
    case 'price': {
      const r = PRICE_RANGES.find((x) => x.id === value);
      return !!r && p.price >= r.min && p.price < r.max;
    }
  }
}

export function applyFilters(list: Product[], f: Filters, except?: FilterKey) {
  return list.filter((p) => FILTER_KEYS.every((k) => k === except || !f[k] || matchesFilter(p, k, f[k]!)));
}

export interface FacetOption { id: string; label: string; count: number }
export interface Facet { key: FilterKey; label: string; options: FacetOption[] }

/** Filter groups for a list, with counts that respect the other active filters. Empty options are left out. */
export function facetsFor(list: Product[], f: Filters, hide: FilterKey[] = []): Facet[] {
  const opts = (key: FilterKey, defs: { id: string; label: string }[]) => {
    const base = applyFilters(list, f, key);
    return defs.map((d) => ({ id: d.id, label: d.label, count: base.filter((p) => matchesFilter(p, key, d.id)).length })).filter((o) => o.count > 0);
  };
  const sizes = SIZE_ORDER.filter((s) => list.some((p) => p.sizes.includes(s))).map((s) => ({ id: s, label: s }));
  const facets: Facet[] = [
    { key: 'vibe', label: 'Vibe', options: opts('vibe', VIBES) },
    { key: 'detail', label: 'Details', options: opts('detail', DETAILS) },
    { key: 'color', label: 'Color', options: opts('color', COLOR_FAMILIES) },
    { key: 'size', label: 'Size', options: opts('size', sizes) },
    { key: 'price', label: 'Price', options: opts('price', PRICE_RANGES) },
  ];
  return facets.filter((x) => !hide.includes(x.key) && x.options.length > 1);
}

// ---------- menu ----------

export interface MenuLine { id: string; label: string; href: string; categories: Child[] }
export interface Menu { clothing: MenuLine[]; accessories: MenuLine[]; vibes: Child[]; afterDark: boolean; covers: Record<'clothing' | 'accessories' | 'vibes', string | undefined> }

/** The menu, with only sections that have products. Built on the server and passed to the header. */
export function buildMenu(): Menu {
  const line = (l: LineDef): MenuLine => ({ id: l.id, label: l.label, href: shopHref(l.id), categories: categoryChildren(l, PRODUCTS.filter((p) => p.line === l.id)) });
  const lines = LINES.map(line).filter((l) => l.categories.length > 0);
  return {
    clothing: lines.filter((l) => getLine(l.id)!.group === 'clothing'),
    accessories: lines.filter((l) => getLine(l.id)!.group === 'accessories'),
    vibes: vibeChildren(),
    afterDark: PRODUCTS.some((p) => p.afterDark),
    covers: {
      clothing: coverFor(PRODUCTS.filter((p) => p.category === 'baby-tees' && /Y2K/.test(p.name)).slice(3)),
      accessories: coverFor(PRODUCTS.filter((p) => p.category === 'jewelry')),
      vibes: coverFor(PRODUCTS.filter((p) => /\bGoth\b/.test(p.name)).slice(5)),
    },
  };
}

export { CATEGORIES };
