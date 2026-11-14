import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PRODUCTS, getProduct } from '@/lib/products';
import ProductView from '@/components/ProductView';
import ProductCard from '@/components/ProductCard';

const CAT_LABEL = { tees: 'Baby Tees', tanks: 'Tanks', bikinis: 'Swim' } as const;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProduct(params.slug);
  return p ? { title: p.name, description: p.blurb } : { title: 'Not found' };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const same = PRODUCTS.filter((p) => p.slug !== product.slug && p.category === product.category);
  const other = PRODUCTS.filter((p) => p.slug !== product.slug && p.category !== product.category && !p.afterDark);
  const more = [...same, ...other].slice(0, 4);
  return (
    <>
      <section className="sec product">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/shop">Shop</Link><span>/</span>
            <Link href={`/shop?c=${product.category}`}>{CAT_LABEL[product.category]}</Link>
          </nav>
          <ProductView product={product} />
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><h2>You may also like</h2></div>
          <div className="grid">{more.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        </div>
      </section>
    </>
  );
}
