import Link from 'next/link';
import { Logo } from './Art';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo className="footer-logo" />
          <p className="script">nine lives, all of them baked</p>
        </div>
        <nav aria-label="Footer shop links">
          <h4>Shop</h4>
          <Link href="/shop?c=tees">Baby Tees</Link>
          <Link href="/shop?c=tanks">Tanks</Link>
          <Link href="/shop?c=bikinis">String Bikinis</Link>
          <Link href="/shop?c=after-dark">After Dark</Link>
        </nav>
        <div>
          <h4>The fine print</h4>
          <p>Everything is printed when you order, so give it a few days to make before it ships.</p>
          <p>After Dark pieces are for adults 18 and older.</p>
          <p>We sell clothes. No weed here, just jokes about it.</p>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Blazed Kitty</span>
        <span>EST 4:20 · DROP 01</span>
      </div>
    </footer>
  );
}
