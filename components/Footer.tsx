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
          <Link href={shopHref('after-dark')}>After Dark</Link>
        </nav>
        <div>
          <h4>Good to know</h4>
          <p>Every piece is printed when you order, then shipped.</p>
          <p>After Dark pieces are for adults 18 and older.</p>
          <p>We sell clothes. No weed here, just jokes about it.</p>
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
