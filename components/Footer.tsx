import Link from 'next/link';
import { Wordmark } from './Media';
import { buildMenu } from '@/lib/collections';

export default function Footer() {
  const menu = buildMenu();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <nav aria-label="Clothing links">
          <h4>Clothing</h4>
          <Link href="/shop/new">New In</Link>
          <Link href="/shop">Shop all</Link>
          {menu.clothing.map((l) => <Link key={l.id} href={l.href}>{l.label}</Link>)}
        </nav>
        <nav aria-label="Accessories links">
          <h4>Accessories</h4>
          {menu.accessories.flatMap((l) => l.categories).map((c) => <Link key={c.href} href={c.href}>{c.label}</Link>)}
        </nav>
        <nav aria-label="Vibes links">
          <h4>Vibes</h4>
          {menu.vibes.map((v) => <Link key={v.href} href={v.href}>{v.label}</Link>)}
          {menu.afterDark && <Link href="/shop/after-dark">After Dark</Link>}
        </nav>
        <div>
          <h4>Good to know</h4>
          <p>Every order ships straight to your door.</p>
          <p>New pieces land every week.</p>
          <p>Pieces in one order can arrive in separate packages.</p>
          <p>Tag your fits @blazedkitty</p>
        </div>
      </div>
      <div className="wrap footer-mark">
        <Wordmark className="wordmark-xl" />
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Blazed Kitty</span>
        <span>Nine lives, zero basics</span>
      </div>
    </footer>
  );
}
