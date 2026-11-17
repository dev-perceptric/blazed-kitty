import Link from 'next/link';
import { Wordmark } from './Media';
import { buildMenu } from '@/lib/collections';

export default function Footer() {
  const menu = buildMenu();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        {menu.depts.map((d) => (
          <nav key={d.id} aria-label={`${d.label} links`}>
            <h4>{d.label}</h4>
            <Link href={d.href}>Shop all</Link>
            {d.lines.map((l) => <Link key={l.id} href={l.href}>{l.label}</Link>)}
          </nav>
        ))}
        <nav aria-label="Vibes links">
          <h4>Vibes</h4>
          <Link href="/shop/new">New In</Link>
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
