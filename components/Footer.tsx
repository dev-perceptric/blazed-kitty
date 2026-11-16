import { PRODUCTS } from '@/lib/products';
import Link from 'next/link';
import { Wordmark } from './Media';
import { DEPTS, LINES, linesFor, lineLabel } from '@/lib/taxonomy';
import { shopHref } from '@/lib/collections';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        {DEPTS.map((d) => (
          <nav key={d.id} aria-label={`${d.label} links`}>
            <h4>{d.label}</h4>
            <Link href={shopHref(d.id)}>Shop all</Link>
            {linesFor(d.id).map((l) => <Link key={l.id} href={shopHref(d.id, l.id)}>{lineLabel(l, d.id)}</Link>)}
          </nav>
        ))}
        <nav aria-label="More links">
          <h4>More</h4>
          <Link href={shopHref('new')}>New In</Link>
          {LINES.filter((l) => l.unisex).map((l) => <Link key={l.id} href={shopHref(l.id)}>{l.label}</Link>)}
          {PRODUCTS.some((p) => p.afterDark) && <Link href={shopHref('after-dark')}>After Dark</Link>}
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
