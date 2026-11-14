'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartProvider';
import { getProduct, formatPrice } from '@/lib/products';
import { ProductArt } from './Art';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, count } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  async function checkout() {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMsg(data.error || 'Checkout did not start. Try again in a minute.');
    } catch {
      setMsg('Could not reach checkout. Check your connection and try again.');
    }
    setBusy(false);
  }

  return (
    <div className={`drawer-root${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your bag">
        <div className="drawer-head">
          <h2>Your bag <span className="drawer-count">{count}</span></h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close bag">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p className="script">nothing in here yet</p>
            <p>Your bag is empty. Go find something cute and a little rude.</p>
            <Link href="/shop" className="btn btn-pink" onClick={() => setOpen(false)}>Shop the drop</Link>
          </div>
        ) : (
          <>
            <ul className="drawer-list">
              {items.map((item, i) => {
                const p = getProduct(item.slug);
                if (!p) return null;
                const color = p.colors.find((c) => c.name === item.color) ?? p.colors[0];
                return (
                  <li key={`${item.slug}-${item.color}-${item.size}`} className="line">
                    <Link href={`/product/${p.slug}`} className="line-art" onClick={() => setOpen(false)}>
                      <ProductArt product={p} hex={color.hex} />
                    </Link>
                    <div className="line-info">
                      <span className="code">{p.code}</span>
                      <strong>{p.name}</strong>
                      <span className="line-opts">{p.garment === 'bikini' ? '' : `${color.name} · `}{item.size}</span>
                      <div className="qty">
                        <button type="button" onClick={() => setQty(i, item.qty - 1)} aria-label={`One less ${p.name}`}>−</button>
                        <span aria-live="polite">{item.qty}</span>
                        <button type="button" onClick={() => setQty(i, item.qty + 1)} aria-label={`One more ${p.name}`}>+</button>
                        <button type="button" className="line-remove" onClick={() => remove(i)}>Remove</button>
                      </div>
                    </div>
                    <span className="line-price">{formatPrice(p.price * item.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="drawer-foot">
              <div className="subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <p className="fine">Shipping and tax are added at checkout. Everything is printed when you order.</p>
              <button type="button" className="btn btn-pink btn-block" onClick={checkout} disabled={busy}>
                {busy ? 'Opening checkout…' : 'Check out'}
              </button>
              {msg && <p className="drawer-msg" role="status">{msg}</p>}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
