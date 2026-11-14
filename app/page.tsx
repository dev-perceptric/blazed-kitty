import Link from 'next/link';
import { PRODUCTS, CATEGORIES } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { ProductArt, Logo } from '@/components/Art';
import { AdultBlur, AdultConfirm } from '@/components/Adult';
import Newsletter from '@/components/Newsletter';

const TICKER = ['PET ME I’M HIGH', 'PURR PUFF PASS', 'BAD KITTY CLUB', 'NINE LIVES', 'KITTY WANTS A SNACK', 'STREETS & SHEETS'];
const TILE: Record<string, { bg: string; ink: string; slug: string }> = {
  tees: { bg: 'var(--gum)', ink: 'var(--ink)', slug: 'blazed-kitty-logo-crop' },
  tanks: { bg: 'var(--lav)', ink: 'var(--ink)', slug: 'high-maintenance-tank' },
  bikinis: { bg: 'var(--pink)', ink: 'var(--ink)', slug: 'pink-leopard-string-bikini' },
};

export default function Home() {
  const drop = PRODUCTS.filter((p) => !p.afterDark).slice(0, 8);
  const afterDark = PRODUCTS.filter((p) => p.afterDark);
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="kicker">Drop 01 · Now showing</p>
            <h1>Nine lives.<br />All of them <span className="pink">baked.</span></h1>
            <p className="script hero-script">cute face, dirty mouth</p>
            <p className="lede">Cropped baby tees, micro-rib tanks and string bikinis with a sleepy pink kitty and jokes your mom won’t get. Printed when you order.</p>
            <div className="hero-ctas">
              <Link href="/shop" className="btn btn-pink">Shop the drop</Link>
              <Link href="/shop?c=after-dark" className="btn btn-ghost">After Dark</Link>
            </div>
          </div>
          <div className="hero-stage">
            <Logo className="hero-logo" label="Blazed Kitty logo" />
            <span className="sticker s1">DROP 01</span>
            <span className="sticker s2">EST 4:20</span>
            <span className="sticker s3">9 LIVES</span>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}<b>✦</b></span>)}
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <h2>Pick your poison</h2>
          </div>
          <div className="tiles">
            {CATEGORIES.map((c) => {
              const t = TILE[c.id];
              const p = PRODUCTS.find((x) => x.slug === t.slug)!;
              const n = PRODUCTS.filter((x) => x.category === c.id).length;
              return (
                <Link key={c.id} href={`/shop?c=${c.id}`} className="tile" style={{ background: t.bg, color: t.ink }}>
                  <ProductArt product={p} className="tile-art" />
                  <div className="tile-label">
                    <strong>{c.label}</strong>
                    <span>{c.blurb}</span>
                  </div>
                  <span className="tile-count">{n} styles →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <h2>Drop 01</h2>
            <Link href="/shop" className="link-arrow">Shop all {PRODUCTS.length} →</Link>
          </div>
          <div className="grid">
            {drop.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>

      <section className="sec after-dark">
        <div className="wrap after-grid">
          <div>
            <p className="kicker">For grown-ups</p>
            <h2>After Dark</h2>
            <p className="lede">The ruder lines. Kept behind a blur so nobody gets surprised at work.</p>
            <AdultConfirm />
            <p><Link href="/shop?c=after-dark" className="link-arrow">See the After Dark pieces →</Link></p>
          </div>
          <div className="after-row">
            {afterDark.map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="after-card">
                <AdultBlur><ProductArt product={p} /></AdultBlur>
                <span>{p.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap facts">
          <div><span className="fact-num">01</span><h3>Made when you order</h3><p>Nothing sits in a warehouse. Your piece gets printed after you check out, then ships.</p></div>
          <div><span className="fact-num">02</span><h3>Sizes for real bodies</h3><p>Baby tees and tanks run XS to 2XL. String bikinis run 2XS to 6XL.</p></div>
          <div><span className="fact-num">03</span><h3>Soft stuff only</h3><p>Combed cotton crops, micro-rib tanks and double-layer UPF 50+ bikinis.</p></div>
        </div>
      </section>

      <section className="sec club">
        <div className="wrap club-grid">
          <div>
            <h2>Join the Bad Kitty Club</h2>
            <p className="lede">New drops, early access and the occasional bad idea. No spam, just kitty.</p>
          </div>
          <Newsletter />
        </div>
      </section>
    </>
  );
}
