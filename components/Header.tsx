'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { Wordmark } from './Media';

export default function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <nav className="nav nav-left" aria-label="Shop">
          <Link href="/shop">Shop</Link>
          <Link href="/shop?c=tees">Tees</Link>
          <Link href="/shop?c=tanks">Tanks</Link>
          <Link href="/shop?c=panties">Panties</Link>
          <Link href="/shop?c=after-dark">After Dark</Link>
        </nav>
        <Link href="/" className="brand" aria-label="Blazed Kitty home">
          <Wordmark />
        </Link>
        <div className="header-right">
          <button type="button" className="bag-btn" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
            Bag ({count})
          </button>
        </div>
      </div>
    </header>
  );
}
