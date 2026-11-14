import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PRODUCTS, getProduct } from '@/lib/products';
import ProductView from '@/components/ProductView';
import ProductCard from '@/components/ProductCard';

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
  const more = PRODUCTS.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4);
  const fill = more.length < 4 ? PRODUCTS.filter((p) => p.slug !== product.slug && p.category !== product.category && !p.afterDark).slice(0, 4 - more.length) : [];
  return (
    <>
      <section className="sec product">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/shop">Shop</Link><span>/</span>
            <Link href={`/shop?c=${product.category}`}>{product.category === 'tees' ? 'Baby Tees' : product.category === 'tanks' ? 'Tanks' : 'String Bikinis'}</Link><span>/</span>
            <span aria-current="page">{product.name}</span>
          </nav>
          <ProductView product={product} />
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><h2>You might also like</h2></div>
          <div className="grid">{[...more, ...fill].map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        </div>
      </section>
    </>
  );
}
