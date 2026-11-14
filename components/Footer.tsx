import Link from 'next/link';
import { Wordmark } from './Media';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <nav aria-label="Footer shop links">
          <h4>Shop</h4>
          <Link href="/shop?c=tees">Baby Tees</Link>
          <Link href="/shop?c=tanks">Tanks</Link>
          <Link href="/shop?c=panties">Panties</Link>
          <Link href="/shop?c=after-dark">After Dark</Link>
        </nav>
        <div>
          <h4>Good to know</h4>
          <p>Every piece is printed when you order, then shipped.</p>
          <p>After Dark pieces are for adults 18 and older.</p>
          <p>We sell clothes. No weed here, just jokes about it.</p>
        </div>
        <div>
          <h4>Say hi</h4>
          <p>Tag us @blazedkitty</p>
        </div>
      </div>
      <div className="wrap footer-mark">
        <Wordmark className="wordmark-xl" />
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Blazed Kitty</span>
        <span>Nine lives, all of them baked</span>
      </div>
    </footer>
  );
}
