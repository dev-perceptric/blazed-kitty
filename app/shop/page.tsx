import Link from 'next/link';
import type { Metadata } from 'next';
import { PRODUCTS } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { AdultConfirm } from '@/components/Adult';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'tees', label: 'Baby Tees' },
  { id: 'tanks', label: 'Tanks' },
  { id: 'panties', label: 'Panties' },
  { id: 'after-dark', label: 'After Dark' },
];

export const metadata: Metadata = { title: 'Shop' };

export default function Shop({ searchParams }: { searchParams: { c?: string } }) {
  const c = TABS.some((t) => t.id === searchParams.c) ? searchParams.c! : 'all';
  const list = PRODUCTS.filter((p) => (c === 'all' ? true : c === 'after-dark' ? p.afterDark : p.category === c));
  const tab = TABS.find((t) => t.id === c)!;
  return (
    <section className="sec shop">
      <div className="wrap">
        <div className="shop-head">
          <h1>{tab.id === 'all' ? 'Shop' : tab.label}</h1>
          <span className="count">{list.length} {list.length === 1 ? 'piece' : 'pieces'}</span>
        </div>
        <nav className="tabs" aria-label="Filter products">
          {TABS.map((t) => (
            <Link key={t.id} href={t.id === 'all' ? '/shop' : `/shop?c=${t.id}`} className={`tab${t.id === c ? ' is-active' : ''}`} aria-current={t.id === c ? 'page' : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
        {c === 'after-dark' && (
          <div className="notice">
            <p>These are blurred until you confirm you’re 18 or older.</p>
            <AdultConfirm />
          </div>
        )}
        <div className="grid">
          {list.map((p, i) => <ProductCard key={p.slug} product={p} eager={i < 4} />)}
        </div>
      </div>
    </section>
  );
}
