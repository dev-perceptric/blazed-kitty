'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { shotsFor, printSrc } from '@/lib/images';
import { AdultBlur, AdultConfirm } from './Adult';
import { useCart } from './CartProvider';

export default function ProductView({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, setOpen } = useCart();
  const isBikini = product.garment === 'bikini';

  const shots = shotsFor(product, color.name);
  const gallery = shots.length ? shots.map((s) => s.src) : [printSrc(product)];
  const current = gallery[Math.min(active, gallery.length - 1)];

  function pickColor(c: typeof color) {
    setColor(c);
    setActive(0);
  }

  function addToBag() {
    if (!size) return;
    add({ slug: product.slug, color: color.name, size }, qty);
    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const main = (
    <div className={`photo pdp-photo${shots.length ? '' : ' photo-print'}`} style={shots.length ? undefined : { background: isBikini ? '#151315' : color.hex }}>
      <img src={current} alt={product.name} />
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
              <button key={s} type="button" id={`size-${s}`} className={`size${s === size ? ' is-on' : ''}`} onClick={() => setSize(s)} aria-pressed={s === size}>{s}</button>
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

        <details className="acc" open>
          <summary>Details</summary>
          <ul>
            {product.details.map((d) => <li key={d}>{d}</li>)}
            <li>{product.printful.blank}</li>
          </ul>
        </details>
        <details className="acc">
          <summary>Shipping</summary>
          <p>Each piece is printed after you order. Shipping cost and timing show at checkout.</p>
        </details>
      </div>
    </div>
  );
}
