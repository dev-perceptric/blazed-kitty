import Link from 'next/link';
import { PRODUCTS, getProduct } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { ProductPhoto } from '@/components/Media';
import { AdultBlur, AdultConfirm } from '@/components/Adult';
import Newsletter from '@/components/Newsletter';

const CATS = [
  { id: 'tees', label: 'Baby Tees', slug: 'pet-me-im-high-crop' },
  { id: 'tanks', label: 'Tanks', slug: 'high-maintenance-tank' },
  { id: 'bikinis', label: 'Swim', slug: 'smoke-ears-string-bikini' },
];

export default function Home() {
  const left = getProduct('blazed-kitty-logo-crop')!;
  const right = getProduct('pink-leopard-string-bikini')!;
  const newIn = PRODUCTS.filter((p) => !p.afterDark).slice(0, 8);
  const afterDark = PRODUCTS.filter((p) => p.afterDark);

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <Link href={`/product/${left.slug}`} className="hero-half" aria-label={left.name}>
            <ProductPhoto product={left} eager />
          </Link>
          <Link href={`/product/${right.slug}`} className="hero-half" aria-label={right.name}>
            <ProductPhoto product={right} eager />
          </Link>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Drop 01</p>
          <h1>Nine lives.<br />All of them baked.</h1>
          <p className="whisper">cute face, dirty mouth</p>
          <Link href="/shop" className="btn">Shop the drop</Link>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <h2>New in</h2>
            <Link href="/shop" className="link">View all</Link>
          </div>
          <div className="grid">
            {newIn.map((p, i) => <ProductCard key={p.slug} product={p} eager={i < 4} />)}
          </div>
        </div>
      </section>

      <section className="sec cats">
        <div className="wrap cats-row">
          {CATS.map((c) => {
            const p = getProduct(c.slug)!;
            return (
              <Link key={c.id} href={`/shop?c=${c.id}`} className="cat">
                <ProductPhoto product={p} />
                <span className="cat-label">{c.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="sec after">
        <div className="wrap after-row">
          <div className="after-copy">
            <p className="eyebrow">18+</p>
            <h2>After Dark</h2>
            <p className="lede">The ruder lines. Blurred until you say you’re a grown-up.</p>
            <div className="after-actions">
              <AdultConfirm />
              <Link href="/shop?c=after-dark" className="link">See the pieces</Link>
            </div>
          </div>
          <div className="after-media">
            {afterDark.map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="after-item">
                <AdultBlur><ProductPhoto product={p} /></AdultBlur>
                <span>{p.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec club">
        <div className="wrap club-row">
          <div>
            <h2>Bad Kitty Club</h2>
            <p className="lede">New drops and early access. No spam, just kitty.</p>
          </div>
          <Newsletter />
        </div>
      </section>
    </>
  );
}
