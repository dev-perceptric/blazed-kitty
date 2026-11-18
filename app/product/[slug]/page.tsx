import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PRODUCTS, findAnyProduct, getProduct, type Product } from '@/lib/products';
import { SHOP, productTrail } from '@/lib/catalog';
import { SITE_URL, BRAND } from '@/lib/site';
import ProductView from '@/components/ProductView';
import ProductCard from '@/components/ProductCard';
import Crumbs from '@/components/Crumbs';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProduct(params.slug);
  if (!p) return { title: 'Not found' };
  const img = p.photos?.[0]?.src;
  return {
    title: p.name,
    description: `${p.name}. ${p.blurb} Free shipping on every order.`,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: img ? { images: [img], title: p.name } : undefined,
  };
}

/** Pieces that share the most photo tags with this one. */
function similar(product: Product, pool: Product[]) {
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

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) {
    // Renamed pieces forward to their new link; pieces taken off the store go to the shop.
    const old = findAnyProduct(params.slug);
    if (old && getProduct(old.slug)) permanentRedirect(`/product/${old.slug}`);
    if (old) permanentRedirect('/collections/all');
    notFound();
  }
  const others = SHOP.filter((p) => p.slug !== product.slug);
  const like = similar(product, others.filter((p) => p.category === product.category)).slice(0, 8);
  const look = similar(product, others.filter((p) => p.line !== product.line && p.attrs?.vibe === product.attrs?.vibe)).slice(0, 4);

  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: `${product.blurb} ${product.details.join('. ')}`,
    image: (product.photos ?? []).slice(0, 6).map((ph) => ph.src), sku: product.code, brand: { '@type': 'Brand', name: BRAND },
    offers: { '@type': 'Offer', url: `${SITE_URL}/product/${product.slug}`, priceCurrency: 'USD', price: product.price.toFixed(2), availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition' },
  };

  return (
    <>
      <section className="sec product">
        <div className="wrap">
          <Crumbs items={productTrail(product)} />
          <ProductView product={product} />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </section>
      {look.length >= 4 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head"><h2>Complete the look</h2></div>
            <div className="grid">{look.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </div>
        </section>
      )}
      {like.length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head"><h2>You may also like</h2></div>
            <div className="grid">{like.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
