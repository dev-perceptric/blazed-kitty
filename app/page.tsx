import Link from 'next/link';
import { PRODUCTS, getProduct } from '@/lib/products';
import { NEWEST_DROP, shopHref } from '@/lib/collections';
import { DEPTS, LINES } from '@/lib/taxonomy';
import ProductCard from '@/components/ProductCard';
import { ProductPhoto } from '@/components/Media';
import { AdultBlur, AdultConfirm } from '@/components/Adult';
import Newsletter from '@/components/Newsletter';

export default function Home() {
  const left = getProduct('in-a-situationship-with-my-grinder-baby-tee')!;
  const right = getProduct('university-of-bad-bitches-baby-tee')!;
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
          <h1>Nine lives.<br />All of them baked.</h1>
          <p className="whisper">cute face, dirty mouth</p>
          <div className="hero-actions">
            <Link href={shopHref('women')} className="btn">Shop Women</Link>
            <Link href={shopHref('men')} className="btn btn-line btn-glass">Shop Men</Link>
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

      <section className="sec depts">
        <div className="wrap depts-row">
          {DEPTS.map((d) => {
            const n = PRODUCTS.filter((p) => p.depts.includes(d.id)).length;
            return (
              <Link key={d.id} href={shopHref(d.id)} className="dept">
                <div className="photo"><img src={d.image} alt="" loading="lazy" /></div>
                <div className="dept-copy">
                  <span className="dept-label">{d.label}</span>
                  <span className="eyebrow">{n ? `${n} pieces` : 'First drop soon'}</span>
                </div>
              </Link>
            );
          })}
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
              const n = PRODUCTS.filter((p) => p.line === l.id).length;
              return (
                <Link key={l.id} href={shopHref(l.id)} className="line-tile">
                  <div className="photo"><img src={l.image} alt="" loading="lazy" /></div>
                  {n === 0 && <span className="badge">Soon</span>}
                  <span className="line-label">{l.label}</span>
                  <span className="line-blurb">{l.blurb}</span>
                </Link>
              );
            })}
          </div>
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
