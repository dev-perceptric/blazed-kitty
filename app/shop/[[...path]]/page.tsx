import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { LEGACY_TABS, allCollectionPaths, resolveCollection } from '@/lib/collections';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { AdultConfirm } from '@/components/Adult';
import ComingSoon from '@/components/ComingSoon';
import Crumbs from '@/components/Crumbs';

type Props = { params: { path?: string[] }; searchParams: { c?: string; sort?: string } };

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'new', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

function sortList(list: Product[], sort: string) {
  const out = [...list];
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

export default function ShopPage({ params, searchParams }: Props) {
  if (!params.path?.length && searchParams.c && LEGACY_TABS[searchParams.c]) redirect(LEGACY_TABS[searchParams.c]);
  const col = resolveCollection(params.path);
  if (!col) notFound();

  const sort = SORTS.some((s) => s.id === searchParams.sort) ? searchParams.sort! : 'featured';
  const list = sortList(col.products, sort);
  const big = !!col.image && col.crumbs.length <= 2 && col.key.split('/').length <= 2 && col.children.length > 0;

  return (
    <section className="sec shop">
      <div className="wrap">
        {col.crumbs.length > 0 && <Crumbs items={col.crumbs} />}

        {big ? (
          <header className="coll-hero">
            <div className="coll-hero-copy">
              <h1>{col.title}</h1>
              {col.blurb && <p className="lede">{col.blurb}</p>}
              <span className="count">{list.length ? `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}` : 'Dropping soon'}</span>
            </div>
            <div className="coll-hero-media photo"><img src={col.image} alt="" /></div>
          </header>
        ) : (
          <div className="shop-head">
            <h1>{col.title}</h1>
            <span className="count">{list.length ? `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}` : 'Dropping soon'}</span>
          </div>
        )}

        {col.children.length > 0 && (
          <nav className="chips" aria-label="Browse">
            {col.children.map((ch) => (
              <Link key={ch.href} href={ch.href} className={`chip${ch.href === col.href ? ' is-active' : ''}`} aria-current={ch.href === col.href ? 'page' : undefined}>
                {ch.label}
                {ch.count === 0 && <span className="soon">Soon</span>}
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

        {list.length > 0 ? (
          <>
            <div className="toolbar">
              <span className="count">{list.length} {list.length === 1 ? 'piece' : 'pieces'}</span>
              <nav className="sorts" aria-label="Sort">
                {SORTS.map((s) => (
                  <Link key={s.id} href={s.id === 'featured' ? col.href : `${col.href}?sort=${s.id}`} className={`sort${s.id === sort ? ' is-active' : ''}`} aria-current={s.id === sort ? 'true' : undefined} scroll={false}>
                    {s.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="grid">
              {list.map((p, i) => <ProductCard key={p.slug} product={p} eager={i < 4} />)}
            </div>
          </>
        ) : (
          <ComingSoon title={col.title} image={big ? undefined : col.image} />
        )}
      </div>
    </section>
  );
}
