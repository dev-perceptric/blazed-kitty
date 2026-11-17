import Link from 'next/link';
import { PRODUCTS, getProduct } from '@/lib/products';
import { NEWEST_DROP, coverFor, shopHref } from '@/lib/collections';
import { LINES, VIBES } from '@/lib/taxonomy';
import ProductCard from '@/components/ProductCard';
import { ProductPhoto } from '@/components/Media';
import { AdultBlur, AdultConfirm } from '@/components/Adult';
import Newsletter from '@/components/Newsletter';

export default function Home() {
  // Hero: preferred pieces if they're in the store, otherwise the first two with photos.
  const withPhotos = PRODUCTS.filter((p) => !p.afterDark && (p.photos?.length || p.printful));
  const hero = ['one-shoulder-shrink-tee-498643', 'skinny-crop-tee-099822', 'in-a-situationship-with-my-grinder-baby-tee', 'university-of-bad-bitches-baby-tee']
    .map((s) => getProduct(s)).filter((p): p is NonNullable<typeof p> => !!p);
  const [left, right] = [...hero, ...withPhotos];
  const newIn = PRODUCTS.filter((p) => !p.afterDark && p.drop === NEWEST_DROP).slice(0, 8);
  const afterDark = PRODUCTS.filter((p) => p.afterDark).slice(0, 6);
  const dropNo = NEWEST_DROP.replace(/\D/g, '').padStart(2, '0');

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
          <p className="eyebrow">Drop {dropNo}</p>
          <h1>Nine lives.<br />Zero basics.</h1>
          <p className="whisper">cute face, dark heart</p>
          <div className="hero-actions">
            <Link href={shopHref('new')} className="btn">Shop New In</Link>
            <Link href={shopHref('tops')} className="btn btn-line btn-glass">Shop Tops</Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <h2>New in</h2>
            <Link href={shopHref('new')} className="link">View all</Link>
          </div>
          <div className="grid">
            {newIn.map((p, i) => <ProductCard key={p.slug} product={p} eager={i < 4} />)}
          </div>
        </div>
      </section>

      <section className="sec lines">
        <div className="wrap">
          <div className="sec-head">
            <h2>Shop by vibe</h2>
            <Link href="/shop" className="link">Shop all</Link>
          </div>
          <div className="vibes-row">
            {VIBES.map((v) => {
              const list = PRODUCTS.filter((p) => v.match.test(p.name));
              if (!list.length) return null;
              return (
                <Link key={v.id} href={shopHref('vibe', v.id)} className="line-tile">
                  <div className="photo"><img src={coverFor(list.slice(2))} alt="" loading="lazy" className="is-product" /></div>
                  <span className="line-label">{v.label}</span>
                  <span className="line-blurb">{v.blurb}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec lines">
        <div className="wrap">
          <div className="sec-head">
            <h2>Shop the lines</h2>
            <Link href="/shop" className="link">Shop all</Link>
          </div>
          <div className="lines-row">
            {LINES.map((l) => {
              const list = PRODUCTS.filter((p) => p.line === l.id && (l.id !== 'accessories' || p.category === 'jewelry' || p.category === 'legwear'));
              if (!list.length) return null;
              return (
                <Link key={l.id} href={shopHref(l.id)} className="line-tile">
                  <div className="photo"><img src={coverFor(list.slice(1))} alt="" loading="lazy" className="is-product" /></div>
                  <span className="line-label">{l.label}</span>
                  <span className="line-blurb">{l.blurb}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {afterDark.length > 0 && <section className="sec after">
        <div className="wrap after-row">
          <div className="after-copy">
            <p className="eyebrow">18+</p>
            <h2>After Dark</h2>
            <p className="lede">The ruder lines. Blurred until you say you’re a grown-up.</p>
            <div className="after-actions">
              <AdultConfirm />
              <Link href={shopHref('after-dark')} className="link">See the pieces</Link>
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
      </section>}

      <section className="sec club">
        <div className="wrap club-row">
          <div>
            <h2>Bad Kitty Club</h2>
            <p className="lede">First look at new drops and members-only codes. No spam, just kitty.</p>
          </div>
          <Newsletter />
        </div>
      </section>
    </>
  );
}
