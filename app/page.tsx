import Link from 'next/link';
import { collectionHref, coverOf, getCollection, mixed, productsIn } from '@/lib/catalog';
import { RETURN_DAYS, WELCOME_PERCENT } from '@/lib/site';
import ProductCard from '@/components/ProductCard';
import Slideshow, { type Slide } from '@/components/Slideshow';
import Tabs from '@/components/Tabs';
import Faq from '@/components/Faq';
import Newsletter from '@/components/Newsletter';

const col = (slug: string) => getCollection(slug)!;
/** Photos from a collection, skipping a few so tiles don't repeat each other. */
function photos(slug: string, n: number, skip = 0, dept?: 'womens' | 'mens') {
  return productsIn(col(slug), dept).filter((p) => p.photos?.length).slice(skip, skip + n).map((p) => p.photos![0].src);
}

const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export default function Home() {
  const slides: Slide[] = [
    { eyebrow: 'New Y2K drops every week', title: 'Y2K Clothing', cta: 'Shop Women', href: collectionHref('all', 'womens'), alt: { cta: 'Shop Men', href: collectionHref('all', 'mens') }, images: photos('y2k-baby-tees', 3, 4, 'womens') },
    { eyebrow: 'Baggy, flare and low rise', title: 'Y2K Jeans & Jorts', cta: 'Shop Jeans', href: collectionHref('y2k-jeans'), alt: { cta: 'Shop Jorts', href: collectionHref('y2k-jorts') }, images: photos('y2k-baggy-jeans', 3, 2) },
    { eyebrow: 'Rhinestones, skulls and zips', title: 'Y2K Zip Up Hoodies', cta: 'Shop Hoodies', href: collectionHref('y2k-zip-up-hoodies'), images: photos('y2k-zip-up-hoodies', 3, 30) },
    { eyebrow: 'Washed anime and manga', title: 'Y2K Anime Tees', cta: 'Shop Anime', href: collectionHref('y2k-anime'), images: photos('y2k-anime', 3, 10) },
  ].filter((s) => s.images.length);

  const big = [
    { slug: 'y2k-jeans', label: 'Y2K Jeans', skip: 8 },
    { slug: 'y2k-hoodies', label: 'Y2K Hoodies', skip: 3 },
    { slug: 'y2k-baby-tees', label: 'Y2K Baby Tees', skip: 12 },
  ];

  // [collection, label, which product photo to use]
  const cats: [string, string, number][] = ([
    ['y2k-baby-tees', 'Baby Tees', 2], ['y2k-graphic-tees', 'Graphic Tees', 3], ['y2k-hoodies', 'Hoodies', 4], ['y2k-baggy-jeans', 'Baggy Jeans', 5],
    ['y2k-jorts', 'Jorts', 3], ['y2k-mini-skirts', 'Mini Skirts', 2], ['y2k-dresses', 'Dresses', 0], ['y2k-corset-tops', 'Corsets', 0],
    ['y2k-jackets', 'Jackets', 7], ['y2k-platform-shoes', 'Platforms', 0], ['y2k-rings', 'Rings', 9], ['y2k-necklaces', 'Chokers', 7],
  ] as [string, string, number][]).filter(([s]) => productsIn(col(s)).length);

  const trending = ['y2k-trending', 'y2k-jorts', 'y2k-baby-tees', 'y2k-graphic-tees', 'y2k-rings', 'y2k-platform-shoes']
    .filter((s) => productsIn(col(s)).length >= 4)
    .map((s) => ({
      label: col(s).title.replace(/^Y2K /, ''),
      href: collectionHref(s),
      panel: <div className="grid">{productsIn(col(s)).slice(0, 8).map((p, i) => <ProductCard key={p.slug} product={p} eager={i < 4} />)}</div>,
    }));

  const themes = ['y2k-anime', 'y2k-goth', 'y2k-grunge', 'y2k-coquette', 'y2k-band-merch', 'y2k-emo', 'y2k-fairy-grunge', 'y2k-harajuku', 'y2k-streetwear', 'y2k-brazil', 'y2k-rhinestone', 'y2k-acid-wash']
    .filter((s) => productsIn(col(s)).length >= 6);

  const newIn = mixed(productsIn(col('y2k-new-in')).slice(0, 1200)).slice(0, 8);

  return (
    <>
      <Slideshow slides={slides} />

      <section className="sec">
        <div className="wrap big-tiles">
          {big.map((b) => (
            <Link key={b.slug} href={collectionHref(b.slug)} className="big-tile">
              <div className="photo"><img src={coverOf(productsIn(col(b.slug)), b.skip)} alt="" loading="lazy" /></div>
              <div className="big-tile-copy"><h3>{b.label}</h3><span className="btn btn-white">Shop now</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head"><h2>Shop by category</h2><Link href="/collections/all" className="link">Shop all</Link></div>
          <div className="cat-list">
            {cats.map(([s, label, skip]) => (
              <Link key={s} href={collectionHref(s)} className="cat-item">
                <div className="photo"><img src={coverOf(productsIn(col(s)), skip)} alt="" loading="lazy" /></div>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head" style={{ justifyContent: 'center', textAlign: 'center' }}><h2>Trending now</h2></div>
          <Tabs tabs={trending} />
        </div>
      </section>

      <section className="impact">
        <div className="wrap">
          <h2>Nine lives.<br /><em>Zero basics.</em></h2>
          <p>Y2K baby tees, baggy jeans, rhinestone zip hoodies, goth dresses and chunky rings for women and men. Thousands of pieces, new drops every week, free shipping on every order.</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><h2>Shop by theme</h2></div>
          <div className="theme-row">
            {themes.map((s, n) => (
              <Link key={s} href={collectionHref(s)} className="theme-tile">
                <div className="photo"><img src={coverOf(productsIn(col(s)), 3 + n)} alt="" loading="lazy" /></div>
                <span>{col(s).title.replace(/^Y2K /, '').replace(/ Clothing| Tops/, '')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head"><h2>New in</h2><Link href={collectionHref('y2k-new-in')} className="link">View all</Link></div>
          <div className="grid">{newIn.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap icons-row">
          <div className="icon-card"><Icon d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><strong>Free shipping</strong><span>On every order, worldwide</span></div>
          <div className="icon-card"><Icon d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" /><strong>{RETURN_DAYS} day returns</strong><span>Changed your mind? No stress</span></div>
          <div className="icon-card"><Icon d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" /><strong>Secure checkout</strong><span>Payments handled by Stripe</span></div>
          <div className="icon-card"><Icon d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19l1-5.8L3.5 9.2l5.9-.9L12 3Z" /><strong>New drops weekly</strong><span>Fresh Y2K pieces every week</span></div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head" style={{ justifyContent: 'center' }}><h2>FAQ</h2></div>
          <Faq limit={5} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="club">
            <div>
              <h2>Get {WELCOME_PERCENT}% off your first order</h2>
              <p className="lede">Join the Bad Kitty Club for new Y2K drops, restocks and members-only codes.</p>
            </div>
            <Newsletter />
          </div>
        </div>
      </section>
    </>
  );
}
