import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PRODUCTS, findAnyProduct, getProduct } from '@/lib/products';
import { productTrail } from '@/lib/collections';
import ProductView from '@/components/ProductView';
import ProductCard from '@/components/ProductCard';
import Crumbs from '@/components/Crumbs';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProduct(params.slug);
  return p ? { title: p.name, description: p.blurb } : { title: 'Not found' };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  // Pieces taken off the store send old links to the shop instead of a dead page.
  if (!product) {
    if (findAnyProduct(params.slug)) redirect('/shop');
    notFound();
  }
  const others = PRODUCTS.filter((p) => p.slug !== product.slug && (product.afterDark || !p.afterDark));
  const shares = (_p: (typeof PRODUCTS)[number]) => true;
  // Same design in another cut first (matching sets), then same category, then same line.
  const ranked = [
    ...(product.printful ? others.filter((p) => p.design === product.design) : []),
    ...others.filter((p) => (!product.printful || p.design !== product.design) && p.category === product.category && shares(p)),
    ...others.filter((p) => p.design !== product.design && p.category !== product.category && p.line === product.line && shares(p)),
    ...others.filter((p) => p.line !== product.line && shares(p)),
  ];
  const more = ranked.slice(0, 4);
  return (
    <>
      <section className="sec product">
        <div className="wrap">
          <Crumbs items={productTrail(product)} />
          <ProductView product={product} />
        </div>
      </section>
      {more.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-head"><h2>Complete the set</h2></div>
            <div className="grid">{more.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
