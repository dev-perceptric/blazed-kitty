import Link from 'next/link';
import { Wordmark } from './Media';
import Newsletter from './Newsletter';
import { buildMenu } from '@/lib/catalog';

export default function Footer() {
  const menu = buildMenu();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <nav aria-label="Shop">
          <h4>Shop</h4>
          <Link href="/collections/all">All Y2K Clothing</Link>
          {menu.depts.map((d) => <Link key={d.id} href={d.href}>{d.label}</Link>)}
          {menu.fresh.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
        {menu.depts.map((d) => (
          <nav key={d.id} aria-label={`${d.label} links`}>
            <h4>{d.label}</h4>
            {d.groups.slice(0, 8).map((g) => <Link key={g.id} href={g.href}>Y2K {g.label}</Link>)}
          </nav>
        ))}
        <nav aria-label="Help">
          <h4>Help</h4>
          <Link href="/track">Track Order</Link>
          <Link href="/shipping">Shipping</Link>
          <Link href="/returns">Returns</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <div className="footer-news">
          <h4>Join the Bad Kitty Club</h4>
          <p>New Y2K drops, restocks and members-only codes. No spam, just kitty.</p>
          <Newsletter />
        </div>
      </div>
      <div className="wrap footer-mark">
        <Wordmark className="wordmark-xl" />
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Blazed Kitty · Y2K clothing, shipped worldwide</span>
        <span>Nine lives, zero basics</span>
      </div>
    </footer>
  );
}
