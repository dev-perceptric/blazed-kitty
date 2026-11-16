'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/products';
import { cjVariant, formatPrice } from '@/lib/products';
import { shotsFor, printSrc } from '@/lib/images';
import { AdultBlur, AdultConfirm } from './Adult';
import { useCart } from './CartProvider';

export default function ProductView({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : '');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, setOpen } = useCart();
  const isBikini = !!product.allOver;

  const shots = shotsFor(product, color.name);
  const gallery = shots.length ? shots.map((s) => s.src) : [printSrc(product)];
  const current = gallery[Math.min(active, gallery.length - 1)];
  const currentIsProduct = shots.length > 0 && shots[Math.min(active, shots.length - 1)].style !== 'Model';
  const count = gallery.length;
  const go = (step: number) => setActive((i) => (Math.min(i, count - 1) + step + count) % count);
  const touchX = useRef<number | null>(null);
  const wheelLock = useRef(0);

  // Left / right arrow keys move through the photos.
  useEffect(() => {
    if (count < 2) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Keep the picked thumbnail in view when the row scrolls sideways.
  useEffect(() => {
    document.getElementById(`thumb-${active}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  function onWheel(e: React.WheelEvent) {
    // Sideways trackpad scroll flips photos; normal page scrolling is left alone.
    if (count < 2 || Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 20) return;
    const now = Date.now();
    if (now - wheelLock.current < 450) return;
    wheelLock.current = now;
    go(e.deltaX > 0 ? 1 : -1);
  }

  // CJ products only come in the color and size combos CJ stocks. Printful pieces come in all of them.
  const stocked = (c: string, s: string) => !product.cj || !!cjVariant(product, c, s);

  function pickColor(c: typeof color) {
    setColor(c);
    if (size && !stocked(c.name, size)) setSize(product.sizes.length === 1 && stocked(c.name, product.sizes[0]) ? product.sizes[0] : '');
    // Jump to Printful's product shot in the picked color (the model photo stays first in the row).
    setActive(shotsFor(product, c.name)[0]?.style === 'Model' ? 1 : 0);
  }

  function addToBag() {
    if (!size) return;
    add({ slug: product.slug, color: color.name, size }, qty);
    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const main = (
    <div
      className={`photo pdp-photo${shots.length ? '' : ' photo-print'}`}
      style={shots.length ? undefined : { background: isBikini ? '#151315' : color.hex }}
      onWheel={onWheel}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      <img src={current} alt={product.name} className={currentIsProduct ? 'is-product' : undefined} draggable={false} />
      {count > 1 && (
        <>
          <button type="button" className="pdp-arrow pdp-prev" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
          <button type="button" className="pdp-arrow pdp-next" onClick={() => go(1)} aria-label="Next photo">›</button>
          <span className="pdp-count" aria-hidden="true">{Math.min(active, count - 1) + 1} / {count}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="pdp">
      <div className="pdp-gallery">
        {product.afterDark ? <AdultBlur>{main}</AdultBlur> : main}
        {gallery.length > 1 && (
          <div className="thumbs" role="group" aria-label="More photos">
            {gallery.map((src, i) => (
              <button key={src} type="button" id={`thumb-${i}`} className={`thumb${i === active ? ' is-on' : ''}`} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`} aria-pressed={i === active}>
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
        {product.afterDark && <AdultConfirm />}
      </div>

      <div className="pdp-info">
        <h1>{product.name}</h1>
        <p className="pdp-price">{formatPrice(product.price)}</p>
        <p className="pdp-blurb">{product.blurb}</p>

        {!isBikini && (
          <fieldset className="opt">
            <legend>Color <span>{color.name}</span></legend>
            <div className="swatch-row">
              {product.colors.map((c) => (
                <button key={c.name} type="button" id={`color-${c.name.toLowerCase().replace(/\s+/g, '-')}`} className={`swatch${c.name === color.name ? ' is-on' : ''}`} style={{ background: c.hex }} onClick={() => pickColor(c)} aria-label={c.name} aria-pressed={c.name === color.name} />
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="opt">
          <legend>Size {size ? <span>{size}</span> : null}</legend>
          <div className="size-row">
            {product.sizes.map((s) => (
              <button key={s} type="button" id={`size-${s}`} className={`size${s === size ? ' is-on' : ''}`} onClick={() => setSize(s)} aria-pressed={s === size} disabled={!stocked(color.name, s)}>{s}</button>
            ))}
          </div>
        </fieldset>

        <div className="buy-row">
          <div className="qty qty-lg">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="One less">−</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty(Math.min(10, qty + 1))} aria-label="One more">+</button>
          </div>
          <button type="button" className="btn btn-grow" onClick={addToBag} disabled={!size}>
            {!size ? 'Select a size' : added ? 'Added' : 'Add to bag'}
          </button>
        </div>

        {product.description && product.description.length > 0 && (
          <details className="acc" open>
            <summary>Description</summary>
            <div className="pdp-desc">
              {product.description.map((para) => <p key={para}>{para}</p>)}
            </div>
          </details>
        )}
        <details className="acc">
          <summary>Details</summary>
          <ul>
            {product.details.map((d) => <li key={d}>{d}</li>)}
            {product.printful && <li>{product.printful.blank}</li>}
          </ul>
        </details>
        <details className="acc">
          <summary>Shipping</summary>
          <p>
            {product.cj
              ? `Ships from our ${product.cj.from === 'US' ? 'US' : 'overseas'} warehouse${product.cj.delivery ? ` in about ${product.cj.delivery}` : ''}. Orders with printed pieces may arrive in separate packages.`
              : 'Each piece is printed after you order. Shipping cost and timing show at checkout.'}
          </p>
        </details>
      </div>
    </div>
  );
}
