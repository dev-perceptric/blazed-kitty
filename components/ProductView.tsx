'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { ProductArt } from './Art';
import { AdultBlur, AdultConfirm } from './Adult';
import { useCart } from './CartProvider';
import { tileColor } from './ProductCard';

export default function ProductView({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]);
  const [view, setView] = useState<'garment' | 'print'>('garment');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, setOpen } = useCart();
  const isBikini = product.garment === 'bikini';

  function addToBag() {
    if (!size) return;
    add({ slug: product.slug, color: color.name, size }, qty);
    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const art = <ProductArt product={product} hex={color.hex} view={view} />;

  return (
    <div className="pdp">
      <div className="pdp-media">
        <div className="pdp-stage" style={{ background: view === 'print' ? color.hex : tileColor({ ...product, colors: [color] }) }}>
          {product.afterDark ? <AdultBlur>{art}</AdultBlur> : art}
        </div>
        {!isBikini && (
          <div className="seg" role="group" aria-label="Picture">
            <button type="button" id="view-front" aria-pressed={view === 'garment'} onClick={() => setView('garment')}>On the tee</button>
            <button type="button" id="view-print" aria-pressed={view === 'print'} onClick={() => setView('print')}>Print up close</button>
          </div>
        )}
        {product.afterDark && <AdultConfirm className="pdp-adult" />}
      </div>

      <div className="pdp-info">
        <span className="code">{product.code}{product.afterDark ? ' · After Dark' : ''}</span>
        <h1>{product.name}</h1>
        <p className="pdp-price">{formatPrice(product.price)}</p>
        <p className="pdp-blurb">{product.blurb}</p>

        {!isBikini && (
          <fieldset className="opt">
            <legend>Color <span>{color.name}</span></legend>
            <div className="color-row">
              {product.colors.map((c) => (
                <button key={c.name} type="button" id={`color-${c.name.toLowerCase().replace(/\s+/g, '-')}`} className={`color-dot${c.name === color.name ? ' is-on' : ''}`} style={{ background: c.hex }} onClick={() => setColor(c)} aria-label={c.name} aria-pressed={c.name === color.name} />
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="opt">
          <legend>Size {size ? <span>{size}</span> : <span className="muted">Pick one</span>}</legend>
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
          <button type="button" className="btn btn-pink btn-grow" onClick={addToBag} disabled={!size}>
            {!size ? 'Pick a size' : added ? 'Added to bag' : `Add to bag · ${formatPrice(product.price * qty)}`}
          </button>
        </div>

        <ul className="details">
          {product.details.map((d) => <li key={d}>{d}</li>)}
          <li>Blank: {product.printful.blank}</li>
        </ul>
      </div>
    </div>
  );
}
