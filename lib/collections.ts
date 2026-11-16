import { PRODUCTS, type Product } from './products';
import {
  CATEGORIES, DEPTS, LINES, categoriesFor, getCategory, getDept, getLine, lineImage, lineLabel, linesFor,
  type Dept, type LineDef,
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
  /** Sub-collections to show as chips (lines under a department, categories under a line). */
  children: Child[];
  afterDark?: boolean;
}

const visible = (p: Product) => !p.afterDark;
const inDept = (d: Dept) => (p: Product) => p.depts.includes(d);

export const NEWEST_DROP = PRODUCTS.reduce((max, p) => (p.drop > max ? p.drop : max), 'drop0');

export function shopHref(...parts: string[]) {
  return ['/shop', ...parts].join('/');
}

function lineChildren(line: LineDef, dept: Dept | undefined, base: string[], list: Product[]): Child[] {
  return categoriesFor(line.id, dept).map((c) => ({
    label: c.label,
    href: shopHref(...base, c.id),
    count: list.filter((p) => p.category === c.id).length,
  }));
}

/**
 * Turns a /shop/... path into a collection.
 *   /shop                         everything
 *   /shop/new                     newest drop
 *   /shop/after-dark              18+ pieces
 *   /shop/women                   a department
 *   /shop/women/tops              a line inside a department
 *   /shop/women/tops/baby-tees    a category inside a department
 *   /shop/stash, /shop/stash/socks  unisex lines and their categories
 */
export function resolveCollection(path: string[] = []): Collection | null {
  const all = PRODUCTS;
  const shop: Crumb = { label: 'Shop', href: '/shop' };

  if (path.length === 0) {
    return {
      key: 'all', title: 'Shop', href: '/shop', crumbs: [], products: all,
      children: [
        ...DEPTS.map((d) => ({ label: d.label, href: shopHref(d.id), count: all.filter(inDept(d.id)).length })),
        ...LINES.filter((l) => l.unisex).map((l) => ({ label: l.label, href: shopHref(l.id), count: all.filter((p) => p.line === l.id).length })),
        { label: 'After Dark', href: shopHref('after-dark'), count: all.filter((p) => p.afterDark).length },
      ],
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

  const dept = getDept(a);
  if (dept) {
    const deptList = all.filter(inDept(dept.id));
    const deptCrumb = { label: dept.label, href: shopHref(dept.id) };
    if (!b) {
      return {
        key: dept.id, title: dept.label, blurb: dept.blurb, image: dept.image, href: shopHref(dept.id), crumbs: [shop],
        products: deptList,
        children: [
          ...linesFor(dept.id).map((l) => ({ label: lineLabel(l, dept.id), href: shopHref(dept.id, l.id), count: deptList.filter((p) => p.line === l.id).length })),
          ...LINES.filter((l) => l.unisex).map((l) => ({ label: l.label, href: shopHref(l.id), count: all.filter((p) => p.line === l.id).length })),
        ],
      };
    }
    const line = getLine(b);
    if (!line || line.unisex || !linesFor(dept.id).includes(line)) return null;
    const lineList = deptList.filter((p) => p.line === line.id);
    const lineCrumb = { label: lineLabel(line, dept.id), href: shopHref(dept.id, line.id) };
    if (!c) {
      return {
        key: `${dept.id}/${line.id}`, title: `${dept.label}’s ${lineLabel(line, dept.id)}`, blurb: line.blurb,
        image: lineImage(line, dept.id), href: lineCrumb.href, crumbs: [shop, deptCrumb], products: lineList,
        children: lineChildren(line, dept.id, [dept.id, line.id], lineList),
      };
    }
    const cat = getCategory(c);
    if (!cat || cat.line !== line.id || !cat.depts.includes(dept.id)) return null;
    return {
      key: `${dept.id}/${line.id}/${cat.id}`, title: `${dept.label}’s ${cat.label}`, blurb: line.blurb,
      image: lineImage(line, dept.id), href: shopHref(dept.id, line.id, cat.id), crumbs: [shop, deptCrumb, lineCrumb],
      products: lineList.filter((p) => p.category === cat.id),
      children: lineChildren(line, dept.id, [dept.id, line.id], lineList),
    };
  }

  const line = getLine(a);
  if (line) {
    const lineList = all.filter((p) => p.line === line.id);
    const lineCrumb = { label: line.label, href: shopHref(line.id) };
    if (!b) {
      return {
        key: line.id, title: line.label, blurb: line.blurb, image: line.image, href: lineCrumb.href, crumbs: [shop],
        products: lineList, children: lineChildren(line, undefined, [line.id], lineList),
      };
    }
    const cat = getCategory(b);
    if (!cat || cat.line !== line.id || c) return null;
    return {
      key: `${line.id}/${cat.id}`, title: cat.label, blurb: line.blurb, image: line.image, href: shopHref(line.id, cat.id),
      crumbs: [shop, lineCrumb], products: lineList.filter((p) => p.category === cat.id),
      children: lineChildren(line, undefined, [line.id], lineList),
    };
  }

  return null;
}

/** Every valid /shop path, for static generation. */
export function allCollectionPaths(): string[][] {
  const paths: string[][] = [[], ['new'], ['after-dark']];
  for (const d of DEPTS) {
    paths.push([d.id]);
    for (const l of linesFor(d.id)) {
      paths.push([d.id, l.id]);
      for (const c of categoriesFor(l.id, d.id)) paths.push([d.id, l.id, c.id]);
    }
  }
  for (const l of LINES) {
    paths.push([l.id]);
    for (const c of categoriesFor(l.id)) paths.push([l.id, c.id]);
  }
  return paths;
}

/** Breadcrumb trail and home collection for a product page. */
export function productTrail(p: Product): Crumb[] {
  const line = getLine(p.line)!;
  const cat = getCategory(p.category)!;
  const shop = { label: 'Shop', href: '/shop' };
  if (line.unisex) return [shop, { label: line.label, href: shopHref(line.id) }, { label: cat.label, href: shopHref(line.id, cat.id) }];
  const dept = p.depts.length === 1 ? getDept(p.depts[0])! : undefined;
  if (!dept) return [shop, { label: line.label, href: shopHref(line.id) }, { label: cat.label, href: shopHref(line.id, cat.id) }];
  return [
    shop,
    { label: dept.label, href: shopHref(dept.id) },
    { label: lineLabel(line, dept.id), href: shopHref(dept.id, line.id) },
    { label: cat.label, href: shopHref(dept.id, line.id, cat.id) },
  ];
}

/** Old /shop?c= links from before the rebuild. */
export const LEGACY_TABS: Record<string, string> = {
  tees: shopHref('women', 'tops'),
  tanks: shopHref('women', 'tops', 'tanks'),
  panties: shopHref('women', 'swim', 'panties'),
  'after-dark': shopHref('after-dark'),
};

export { CATEGORIES };
