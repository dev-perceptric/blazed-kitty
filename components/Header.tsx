'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { Logo } from './Art';

export default function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link href="/" className="brand" aria-label="Blazed Kitty home">
          <Logo className="brand-mark" />
          <span className="brand-name">Blazed Kitty</span>
        </Link>
        <nav className="nav" aria-label="Shop">
          <Link href="/shop?c=tees">Baby Tees</Link>
          <Link href="/shop?c=tanks">Tanks</Link>
          <Link href="/shop?c=bikinis">Bikinis</Link>
          <Link href="/shop?c=after-dark">After Dark</Link>
        </nav>
        <button type="button" className="bag-btn" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
          Bag <span className="bag-count">{count}</span>
        </button>
      </div>
    </header>
  );
}
