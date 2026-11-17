import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  FILTER_KEYS, LEGACY_TABS, allCollectionPaths, applyFilters, facetsFor, legacyRedirect, resolveCollection,
  type FilterKey, type Filters,
} from '@/lib/collections';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { AdultConfirm } from '@/components/Adult';
import ComingSoon from '@/components/ComingSoon';
import Crumbs from '@/components/Crumbs';

type Search = { c?: string; sort?: string } & Partial<Record<FilterKey, string>>;
type Props = { params: { path?: string[] }; searchParams: Search };

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'new', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

/** Featured order: spread dropship items (CJ, AliExpress) evenly through the printed pieces, starting near the top. */
function spreadDropship(list: Product[]) {
  const made = list.filter((p) => !p.cj && !p.ae);
  const drop = list.filter((p) => p.cj || p.ae);
  if (!drop.length || !made.length) return list;
  const every = Math.max(2, Math.floor(made.length / drop.length));
  const out: Product[] = [];
  let d = 0;
  made.forEach((p, i) => {
    if (i % every === 1 && d < drop.length) out.push(drop[d++]);
    out.push(p);
  });
  return [...out, ...drop.slice(d)];
}

function sortList(list: Product[], sort: string) {
  const out = sort === 'featured' ? spreadDropship(list) : [...list];
  if (sort === 'new') out.sort((a, b) => b.drop.localeCompare(a.drop));
  if (sort === 'price-asc') out.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
  return out;
}

export function generateStaticParams() {
  return allCollectionPaths().map((path) => ({ path }));
}

export function generateMetadata({ params }: Props): Metadata {
  const col = resolveCollection(params.path);
  return col ? { title: col.title, description: col.blurb } : { title: 'Not found' };
}

/** Link to the same page with one search param changed (undefined removes it). */
function hrefWith(base: string, search: Search, change: Partial<Search>) {
  const q = new URLSearchParams();
  for (const k of [...FILTER_KEYS, 'sort'] as const) {
    const v = k in change ? change[k] : search[k];
    if (v && !(k === 'sort' && v === 'featured')) q.set(k, v);
  }
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export default function ShopPage({ params, searchParams }: Props) {
  if (!params.path?.length && searchParams.c && LEGACY_TABS[searchParams.c]) redirect(LEGACY_TABS[searchParams.c]);
  const col = resolveCollection(params.path);
  if (!col) {
    const to = legacyRedirect(params.path);
    if (to) permanentRedirect(to);
    notFound();
  }

  const filters: Filters = {};
  for (const k of FILTER_KEYS) if (searchParams[k]) filters[k] = searchParams[k];
  const facets = facetsFor(col.products, filters, col.vibe ? ['vibe'] : []);
  const active = facets.flatMap((f) => (filters[f.key] ? [{ key: f.key, label: f.options.find((o) => o.id === filters[f.key])?.label ?? filters[f.key]! }] : []));

  const sort = SORTS.some((s) => s.id === searchParams.sort) ? searchParams.sort! : 'featured';
  const list = sortList(applyFilters(col.products, filters), sort);
  const total = col.products.length;
  const big = !!col.image && col.crumbs.length <= 1 && col.children.length > 0;
  const countLabel = (n: number) => (n ? `${n} ${n === 1 ? 'piece' : 'pieces'}` : 'Dropping soon');

  return (
    <section className="sec shop">
      <div className="wrap">
        {col.crumbs.length > 0 && <Crumbs items={col.crumbs} />}

        {big ? (
          <header className="coll-hero">
            <div className="coll-hero-copy">
              <h1>{col.title}</h1>
              {col.blurb && <p className="lede">{col.blurb}</p>}
              <span className="count">{countLabel(total)}</span>
            </div>
            <div className="coll-hero-media photo"><img src={col.image} alt="" className="is-product" /></div>
          </header>
        ) : (
          <div className="shop-head">
            <h1>{col.title}</h1>
            <span className="count">{countLabel(total)}</span>
          </div>
        )}

        {col.children.length > 0 && (
          <nav className="chips" aria-label="Browse">
            {col.children.map((ch) => (
              <Link key={ch.href} href={ch.href} className={`chip${ch.href === col.href ? ' is-active' : ''}`} aria-current={ch.href === col.href ? 'page' : undefined}>
                {ch.label} <span className="chip-count">{ch.count}</span>
              </Link>
            ))}
          </nav>
        )}

        {col.afterDark && (
          <div className="notice">
            <p>These are blurred until you confirm you’re 18 or older.</p>
            <AdultConfirm />
          </div>
        )}

        {total > 0 ? (
          <>
            {facets.length > 0 && (
              <div className="filters" aria-label="Filter">
                {facets.map((f) => (
                  <details key={f.key} className={`filter${filters[f.key] ? ' is-on' : ''}`}>
                    <summary>{f.label}{filters[f.key] ? `: ${active.find((a) => a.key === f.key)?.label}` : ''}</summary>
                    <div className="filter-menu">
                      {f.options.map((o) => (
                        <Link key={o.id} href={hrefWith(col.href, searchParams, { [f.key]: filters[f.key] === o.id ? undefined : o.id })}
                          className={`filter-opt${filters[f.key] === o.id ? ' is-active' : ''}`} scroll={false}>
                          {o.label} <span>{o.count}</span>
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
                {active.length > 0 && (
                  <div className="filter-active">
                    {active.map((a) => (
                      <Link key={a.key} href={hrefWith(col.href, searchParams, { [a.key]: undefined })} className="chip is-active" scroll={false}>
                        {a.label} ✕
                      </Link>
                    ))}
                    <Link href={hrefWith(col.href, { sort: searchParams.sort }, {})} className="link" scroll={false}>Clear all</Link>
                  </div>
                )}
              </div>
            )}

            <div className="toolbar">
              <span className="count">{list.length} {list.length === 1 ? 'piece' : 'pieces'}</span>
              <nav className="sorts" aria-label="Sort">
                {SORTS.map((s) => (
                  <Link key={s.id} href={hrefWith(col.href, searchParams, { sort: s.id })} className={`sort${s.id === sort ? ' is-active' : ''}`} aria-current={s.id === sort ? 'true' : undefined} scroll={false}>
                    {s.label}
                  </Link>
                ))}
              </nav>
            </div>
            {list.length > 0 ? (
              <div className="grid">
                {list.map((p, i) => <ProductCard key={p.slug} product={p} eager={i < 4} />)}
              </div>
            ) : (
              <p className="lede">Nothing matches all of those. <Link href={col.href} className="link">Clear the filters</Link></p>
            )}
          </>
        ) : (
          <ComingSoon title={col.title} image={big ? undefined : col.image} />
        )}
      </div>
    </section>
  );
}
