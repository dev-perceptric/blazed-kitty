'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartProvider';
import { Wordmark } from './Media';
import SearchBox from './SearchBox';
import type { DeptId, Menu } from '@/lib/catalog';

type Tab = DeptId | 'themes' | 'new';

const Caret = () => (
  <svg className="caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
);
const BagIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 10V7a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
);

function MegaPanel({ tab, menu, onPick }: { tab: Tab; menu: Menu; onPick: () => void }) {
  const dept = menu.depts.find((d) => d.id === tab);
  if (dept) {
    return (
      <div className="mega-inner wrap">
        <div className="mega-cols">
          {dept.groups.map((g) => (
            <div key={g.id} className="mega-col">
              <Link href={g.href} className="mega-head" onClick={onPick}>{g.label}</Link>
              <Link href={g.href} onClick={onPick}>All {g.label}</Link>
              {g.links.map((l) => <Link key={l.href} href={l.href} onClick={onPick}>{l.label}</Link>)}
            </div>
          ))}
        </div>
        <Link href={dept.href} className="mega-feature" onClick={onPick}>
          {dept.cover && <div className="photo"><img src={dept.cover} alt="" loading="lazy" /></div>}
          <span>Shop all {dept.label} →</span>
        </Link>
      </div>
    );
  }
  const links = tab === 'themes' ? menu.themes : menu.fresh;
  return (
    <div className="mega-inner wrap">
      <div className="mega-cols">
        <div className="mega-col" style={{ gridColumn: '1 / -1' }}>
          <span className="mega-head">{tab === 'themes' ? 'Shop by theme' : 'New collections'}</span>
          <div className="mega-cols">
            {links.map((l) => <Link key={l.href} href={l.href} onClick={onPick}>{l.label}</Link>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/** menu: built on the server (lib/catalog buildMenu) so only sections with products show. */
export default function Header({ menu }: { menu: Menu }) {
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const [mega, setMega] = useState<Tab | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mDept, setMDept] = useState<DeptId>('womens');
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMega(null); setMobile(false); }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMega(null);
      setMobile((m) => { if (m) menuBtn.current?.focus(); return false; });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  const openMega = (t: Tab) => { clearTimeout(closeTimer.current); setMega(t); };
  const closeMega = () => { closeTimer.current = setTimeout(() => setMega(null), 140); };
  const tabs: { id: Tab; label: string; href: string }[] = [
    ...menu.depts.map((d) => ({ id: d.id as Tab, label: d.label, href: d.href })),
    { id: 'themes', label: 'Themed Collections', href: menu.themes[0]?.href ?? '/collections/all' },
    { id: 'new', label: 'New In', href: '/collections/y2k-new-in' },
  ];
  const mobileDept = menu.depts.find((d) => d.id === mDept) ?? menu.depts[0];

  return (
    <header className="site-header" onMouseLeave={closeMega}>
      <div className="wrap header-row">
        <button ref={menuBtn} type="button" className="menu-btn" onClick={() => setMobile(true)} aria-expanded={mobile} aria-controls="mobile-menu">
          <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
          <span className="sr-only">Menu</span>
        </button>

        <Link href="/" className="brand" aria-label="Blazed Kitty home"><Wordmark /></Link>

        <nav className="nav" aria-label="Shop">
          <Link href="/collections/all" className={pathname === '/collections/all' ? 'is-on' : ''} onMouseEnter={() => setMega(null)}>All</Link>
          {tabs.map((t) => (
            <div key={t.id} className="nav-item" data-open={mega === t.id} onMouseEnter={() => openMega(t.id)} onMouseLeave={closeMega}>
              <Link href={t.href} aria-haspopup="true" aria-expanded={mega === t.id} onFocus={() => openMega(t.id)}>{t.label} <Caret /></Link>
            </div>
          ))}
          <Link href="/about" className={pathname === '/about' ? 'is-on' : ''} onMouseEnter={() => setMega(null)}>About</Link>
          <Link href="/track" className={pathname === '/track' ? 'is-on' : ''} onMouseEnter={() => setMega(null)}>Track Order</Link>
        </nav>

        <div className="header-right">
          <SearchBox />
          <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
            <BagIcon />
            {count > 0 && <span className="bag-count">{count}</span>}
          </button>
        </div>
      </div>

      <div className={`mega${mega === 'themes' || mega === 'new' ? ' mega-wide' : ''}`} onMouseEnter={() => mega && openMega(mega)} onMouseLeave={closeMega} hidden={!mega}>
        {mega && <MegaPanel tab={mega} menu={menu} onPick={() => setMega(null)} />}
      </div>

      <div id="mobile-menu" className={`mobile-root${mobile ? ' is-open' : ''}`} aria-hidden={!mobile}>
        <div className="drawer-scrim" onClick={() => setMobile(false)} />
        <aside className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer-head">
            <Wordmark />
            <button type="button" className="text-btn" onClick={() => setMobile(false)}>Close</button>
          </div>
          <div className="m-tabs" role="tablist">
            {menu.depts.map((d) => (
              <button key={d.id} type="button" role="tab" aria-selected={mDept === d.id} className={`m-tab${mDept === d.id ? ' is-on' : ''}`} onClick={() => setMDept(d.id)}>{d.label}</button>
            ))}
          </div>
          <nav className="mobile-nav" aria-label="Shop">
            {mobileDept && <Link href={mobileDept.href} className="m-top">Shop all {mobileDept.label}</Link>}
            {mobileDept?.groups.map((g) => (
              <details key={`${mobileDept.id}-${g.id}`} className="m-group">
                <summary className="m-top">{g.label}</summary>
                <div className="m-cats">
                  <Link href={g.href} className="m-all">All {g.label}</Link>
                  {g.links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
                </div>
              </details>
            ))}
            <details className="m-group">
              <summary className="m-top">Themed Collections</summary>
              <div className="m-cats">{menu.themes.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</div>
            </details>
            <details className="m-group">
              <summary className="m-top">New In</summary>
              <div className="m-cats">{menu.fresh.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</div>
            </details>
            <Link href="/collections/all" className="m-top">All Y2K Clothing</Link>
            <Link href="/track" className="m-top">Track Order</Link>
            <Link href="/about" className="m-top">About</Link>
            <Link href="/faq" className="m-top">FAQ</Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
