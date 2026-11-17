import { PRODUCTS, type Product } from './products';
import {
  CATEGORIES, COLOR_FAMILIES, EDITS, LINES, PRICE_RANGES, SIZE_ORDER, VIBES, categoriesFor, getCategory, getEdit, getLine, getVibe, vibeText,
  type LineDef,
} from './taxonomy';
import { ALL_SUBTYPES, CUTS, LENGTHS, MATERIALS, PRINTS, SLEEVES, SUBTYPES, THEMES, type TagOption } from './tags';

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

/** Vibes come from the photo tags; products without tags fall back to words in the name. */
export function vibeMatches(p: Product, vibeId: string) {
  const a = p.attrs;
  if (vibeId === 'anime' && (p.tags?.includes('anime') || a?.print === 'anime')) return true;
  if (a?.vibe) return a.vibe === vibeId || !!a.vibes?.includes(vibeId);
  return !!getVibe(vibeId)?.match.test(vibeText(p));
}

export type DeptId = 'women' | 'men';
export const DEPTS: { id: DeptId; label: string; blurb: string }[] = [
  { id: 'women', label: 'Women', blurb: 'Baby tees, goth tops, mini skirts and everything in between.' },
  { id: 'men', label: 'Men', blurb: 'Oversized graphic tees, hoodies, jackets and baggy jeans.' },
];
export const getDept = (id: string) => DEPTS.find((d) => d.id === id);
const inDept = (d?: DeptId) => (p: Product) => !d || p.depts.includes(d);

function categoryChildren(line: LineDef, list: Product[], base: string[] = []): Child[] {
  return categoriesFor(line.id)
    .map((c) => ({ label: c.label, href: shopHref(...base, line.id, c.id), count: list.filter((p) => p.category === c.id).length }))
    .filter((c) => c.count > 0);
}

function lineChildren(list: Product[], base: string[] = []): Child[] {
  return LINES.map((l) => ({ label: l.label, href: shopHref(...base, l.id), count: list.filter((p) => p.line === l.id).length })).filter((c) => c.count > 0);
}

function vibeChildren(): Child[] {
  return VIBES.map((v) => ({ label: v.label, href: shopHref('vibe', v.id), count: PRODUCTS.filter((p) => vibeMatches(p, v.id)).length })).filter((c) => c.count > 0);
}

function editChildren(): Child[] {
  return EDITS.map((e) => ({ label: e.label, href: shopHref('edit', e.id), count: PRODUCTS.filter((p) => visible(p) && e.test(p)).length })).filter((c) => c.count >= 6);
}

/**
 * Turns a /shop/... path into a collection.
 *   /shop                          everything
 *   /shop/new                      newest drop
 *   /shop/after-dark               18+ pieces (hidden while empty)
 *   /shop/vibe/goth                a vibe
 *   /shop/women, /shop/men         a department (unisex pieces are in both)
 *   /shop/women/tops/baby-tees     a line or category inside a department
 *   /shop/tops/baby-tees           a line or category across both
 */
export function resolveCollection(path: string[] = []): Collection | null {
  const all = PRODUCTS;
  const shop: Crumb = { label: 'Shop', href: '/shop' };

  if (path.length === 0) {
    return {
      key: 'all', title: 'Shop', href: '/shop', crumbs: [], products: all,
      children: [...DEPTS.map((d) => ({ label: d.label, href: shopHref(d.id), count: all.filter(inDept(d.id)).length })), ...lineChildren(all)],
    };
  }

  const [a, b, c, ...rest] = path;
  if (rest.length) return null;

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
    if (!vibe || c) return null;
    const list = all.filter((p) => vibeMatches(p, vibe.id));
    return {
      key: `vibe/${vibe.id}`, title: vibe.label, blurb: vibe.blurb, image: coverFor(list), href: shopHref('vibe', vibe.id),
      crumbs: [shop], products: list, children: vibeChildren(), vibe: vibe.id,
    };
  }

  if (a === 'edit') {
    const edit = b ? getEdit(b) : undefined;
    if (!edit || c) return null;
    const list = all.filter((p) => visible(p) && edit.test(p));
    return {
      key: `edit/${edit.id}`, title: edit.label, blurb: edit.blurb, image: coverFor(list), href: shopHref('edit', edit.id),
      crumbs: [shop], products: list, children: editChildren(),
    };
  }

  const dept = getDept(a);
  const base = dept ? [dept.id] : [];
  const [lineId, catId, extra] = dept ? [b, c, undefined] : [a, b, c];
  if (extra) return null;
  const deptList = all.filter(inDept(dept?.id));
  const crumbs: Crumb[] = [shop];
  if (dept) {
    const deptCrumb = { label: dept.label, href: shopHref(dept.id) };
    if (!lineId) {
      return {
        key: dept.id, title: dept.label, blurb: dept.blurb, image: coverFor(deptList.filter((p) => p.category !== 'jewelry')), href: deptCrumb.href,
        crumbs, products: deptList, children: lineChildren(deptList, base),
      };
    }
    crumbs.push(deptCrumb);
  }

  const line = getLine(lineId);
  if (!line || !LINES.includes(line)) return null;
  const lineList = deptList.filter((p) => p.line === line.id);
  const prefix = dept ? `${dept.label}’s ` : '';
  const lineHref = shopHref(...base, line.id);
  if (!catId) {
    return {
      key: [...base, line.id].join('/'), title: prefix + line.label, blurb: line.blurb, image: coverFor(lineList), href: lineHref,
      crumbs, products: lineList, children: categoryChildren(line, lineList, base),
    };
  }
  const cat = getCategory(catId);
  if (!cat || cat.line !== line.id) return null;
  const list = lineList.filter((p) => p.category === cat.id);
  return {
    key: [...base, line.id, cat.id].join('/'), title: prefix + cat.label, blurb: line.blurb, image: coverFor(list), href: shopHref(...base, line.id, cat.id),
    crumbs: [...crumbs, { label: line.label, href: lineHref }], products: list, children: categoryChildren(line, lineList, base),
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
  for (const e of EDITS) paths.push(['edit', e.id]);
  for (const d of DEPTS) {
    paths.push([d.id]);
    for (const l of LINES) {
      if (!PRODUCTS.some((p) => p.depts.includes(d.id) && p.line === l.id)) continue;
      paths.push([d.id, l.id]);
      for (const c of categoriesFor(l.id)) if (PRODUCTS.some((p) => p.depts.includes(d.id) && p.category === c.id)) paths.push([d.id, l.id, c.id]);
    }
  }
  return paths;
}

/** Breadcrumb trail for a product page. */
export function productTrail(p: Product): Crumb[] {
  const shop = { label: 'Shop', href: '/shop' };
  const line = getLine(p.line);
  const cat = getCategory(p.category);
  if (!line || !cat || !LINES.includes(line)) return [shop];
  const d = p.depts.includes('women') ? 'women' : 'men';
  return [shop, { label: getDept(d)!.label, href: shopHref(d) }, { label: line.label, href: shopHref(d, line.id) }, { label: cat.label, href: shopHref(d, line.id, cat.id) }];
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
  const dept = getDept(path[0]);
  const rest = dept ? path.slice(1) : path;
  const base = dept ? `${dept.id}/` : '';
  const cat = rest[rest.length - 1];
  if (cat && OLD_CATS[cat]) return shopHref(base + OLD_CATS[cat]);
  if (OLD_LINES[rest[0]]) return shopHref(base + OLD_LINES[rest[0]]);
  if (rest[0] === 'home' || rest[0] === 'swim') return dept ? shopHref(dept.id) : '/shop';
  return null;
}

// ---------- filters ----------

export type Filters = Partial<Record<FilterKey, string>>;

export const FILTER_KEYS = ['type', 'vibe', 'print', 'theme', 'fit', 'sleeve', 'length', 'material', 'color', 'size', 'price'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

/** Main color from the photo tags; untagged products fall back to their color options. */
const colorFamilies = (p: Product) =>
  p.attrs?.color ? [p.attrs.color] : COLOR_FAMILIES.filter((f) => p.colors.some((c) => f.match.test(c.name)) || f.match.test(p.name)).map((f) => f.id);

export function matchesFilter(p: Product, key: FilterKey, value: string) {
  const a = p.attrs;
  switch (key) {
    case 'type': return a?.sub === value;
    case 'vibe': return vibeMatches(p, value);
    case 'print': return a?.print === value;
    case 'theme': return !!a?.themes?.includes(value);
    case 'fit': return !!a?.cut?.includes(value);
    case 'sleeve': return a?.sleeve === value;
    case 'length': return a?.length === value;
    case 'material': return !!a?.material?.includes(value);
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
  // Sub-types: only those for the categories in this list, in category order.
  const cats = new Set(list.map((p) => p.category));
  const types: TagOption[] = cats.size ? Object.entries(SUBTYPES).filter(([c]) => cats.has(c as Product['category'])).flatMap(([, o]) => o) : ALL_SUBTYPES;
  const facets: Facet[] = [
    { key: 'type', label: 'Type', options: opts('type', types) },
    { key: 'vibe', label: 'Vibe', options: opts('vibe', VIBES) },
    { key: 'print', label: 'Print', options: opts('print', PRINTS) },
    { key: 'theme', label: 'Theme', options: opts('theme', THEMES) },
    { key: 'fit', label: 'Fit', options: opts('fit', CUTS) },
    { key: 'sleeve', label: 'Sleeve', options: opts('sleeve', SLEEVES) },
    { key: 'length', label: 'Length', options: opts('length', LENGTHS) },
    { key: 'material', label: 'Material', options: opts('material', MATERIALS) },
    { key: 'color', label: 'Color', options: opts('color', COLOR_FAMILIES) },
    { key: 'size', label: 'Size', options: opts('size', sizes) },
    { key: 'price', label: 'Price', options: opts('price', PRICE_RANGES) },
  ];
  return facets.filter((x) => !hide.includes(x.key) && x.options.length > 1);
}

// ---------- menu ----------

export interface MenuLine { id: string; label: string; href: string; categories: Child[] }
export interface MenuDept { id: DeptId; label: string; href: string; lines: MenuLine[]; cover?: string }
export interface Menu { depts: MenuDept[]; vibes: Child[]; edits: Child[]; afterDark: boolean; vibeCover?: string }

/** The menu, with only sections that have products. Built on the server and passed to the header. */
export function buildMenu(): Menu {
  const depts = DEPTS.map((d) => {
    const list = PRODUCTS.filter(inDept(d.id));
    const lines = LINES.map((l) => ({ id: l.id, label: l.label, href: shopHref(d.id, l.id), categories: categoryChildren(l, list.filter((p) => p.line === l.id), [d.id]) }))
      .filter((l) => l.categories.length > 0);
    const cover = coverFor(list.filter((p) => (d.id === 'women' ? p.category === 'baby-tees' && /Y2K/.test(p.name) : p.category === 'hoodies')).slice(3));
    return { id: d.id, label: d.label, href: shopHref(d.id), lines, cover };
  }).filter((d) => d.lines.length > 0);
  return {
    depts,
    vibes: vibeChildren(),
    edits: editChildren(),
    afterDark: PRODUCTS.some((p) => p.afterDark),
    vibeCover: coverFor(PRODUCTS.filter((p) => /\bGoth\b/.test(p.name)).slice(5)),
  };
}

export { CATEGORIES };
