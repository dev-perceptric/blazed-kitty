'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartProvider';
import { Wordmark } from './Media';
import type { Menu, MenuLine } from '@/lib/collections';

type Tab = 'clothing' | 'accessories' | 'vibes';
const TABS: { id: Tab; label: string; href: string }[] = [
  { id: 'clothing', label: 'Clothing', href: '/shop' },
  { id: 'accessories', label: 'Accessories', href: '/shop/accessories' },
  { id: 'vibes', label: 'Vibes', href: '/shop/vibe/y2k' },
];

function LineCol({ line, onPick }: { line: MenuLine; onPick: () => void }) {
  return (
    <div className="mega-col">
      <Link href={line.href} className="mega-head" onClick={onPick}>{line.label}</Link>
      {line.categories.map((c) => <Link key={c.href} href={c.href} onClick={onPick}>{c.label}</Link>)}
    </div>
  );
}

function MegaPanel({ tab, menu, onPick }: { tab: Tab; menu: Menu; onPick: () => void }) {
  const cover = menu.covers[tab];
  const feature = tab === 'clothing' ? { href: '/shop', label: 'Shop all clothing' } : tab === 'accessories' ? { href: '/shop/accessories', label: 'Shop all accessories' } : { href: '/shop/new', label: 'Shop new in' };
  return (
    <div className="mega-inner wrap">
      <div className="mega-cols">
        {tab === 'clothing' && menu.clothing.map((l) => <LineCol key={l.id} line={l} onPick={onPick} />)}
        {tab === 'accessories' && menu.accessories.map((l) => <LineCol key={l.id} line={l} onPick={onPick} />)}
        {tab === 'vibes' && (
          <div className="mega-col">
            <span className="mega-head">Shop by vibe</span>
            {menu.vibes.map((v) => <Link key={v.href} href={v.href} onClick={onPick}>{v.label}</Link>)}
          </div>
        )}
        {menu.afterDark && tab === 'clothing' && (
          <div className="mega-col">
            <span className="mega-head">Also</span>
            <Link href="/shop/after-dark" onClick={onPick}>After Dark</Link>
          </div>
        )}
      </div>
      <Link href={feature.href} className="mega-feature" onClick={onPick}>
        {cover && <div className="photo"><img src={cover} alt="" loading="lazy" className="is-product" /></div>}
        <span>{feature.label}</span>
      </Link>
    </div>
  );
}

/** menu: built on the server (lib/collections buildMenu) so only sections with products show. */
export default function Header({ menu }: { menu: Menu }) {
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const [mega, setMega] = useState<Tab | null>(null);
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMega(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMega(null);
      setMobile((m) => {
        if (m) menuBtn.current?.focus();
        return false;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  const openMega = (t: Tab) => { clearTimeout(closeTimer.current); setMega(t); };
  const closeMega = () => { closeTimer.current = setTimeout(() => setMega(null), 120); };
  const isOn = (t: Tab) =>
    t === 'vibes' ? pathname.startsWith('/shop/vibe') :
    t === 'accessories' ? pathname.startsWith('/shop/accessories') :
    menu.clothing.some((l) => pathname.startsWith(l.href)) || pathname === '/shop';
  const tabs = TABS.filter((t) => (t.id === 'accessories' ? menu.accessories.length : t.id === 'vibes' ? menu.vibes.length : menu.clothing.length) > 0);

  return (
    <header className="site-header" onMouseLeave={closeMega}>
      <div className="wrap header-row">
        <button ref={menuBtn} type="button" className="menu-btn" onClick={() => setMobile(true)} aria-expanded={mobile} aria-controls="mobile-menu">
          <span className="menu-icon" aria-hidden="true"><i /><i /></span>
          <span className="sr-only">Menu</span>
        </button>

        <nav className="nav nav-left" aria-label="Shop">
          <Link href="/shop/new" className={pathname === '/shop/new' ? 'is-on' : ''} onMouseEnter={() => setMega(null)}>New</Link>
          {tabs.map((t) => (
            <div key={t.id} className="nav-item" onMouseEnter={() => openMega(t.id)} onMouseLeave={closeMega}>
              <Link href={t.href} className={isOn(t.id) ? 'is-on' : ''} aria-haspopup="true" aria-expanded={mega === t.id} onFocus={() => openMega(t.id)}>
                {t.label}
              </Link>
            </div>
          ))}
          {menu.afterDark && <Link href="/shop/after-dark" className={`nav-adult${pathname === '/shop/after-dark' ? ' is-on' : ''}`} onMouseEnter={() => setMega(null)}>After Dark</Link>}
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

      <div className={`mega${mega ? ' is-open' : ''}`} onMouseEnter={() => mega && openMega(mega)} onMouseLeave={closeMega} hidden={!mega}>
        {mega && <MegaPanel tab={mega} menu={menu} onPick={() => setMega(null)} />}
      </div>

      <div id="mobile-menu" className={`mobile-root${mobile ? ' is-open' : ''}`} aria-hidden={!mobile}>
        <div className="drawer-scrim" onClick={() => setMobile(false)} />
        <aside className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer-head">
            <Wordmark />
            <button type="button" className="text-btn" onClick={() => setMobile(false)}>Close</button>
          </div>
          <nav className="mobile-nav" aria-label="Shop">
            <Link href="/shop/new" className="m-top">New In</Link>
            <Link href="/shop" className="m-top">Shop All</Link>
            {[...menu.clothing, ...menu.accessories].map((l) => (
              <details key={l.id} className="m-group">
                <summary className="m-top">{l.label}</summary>
                <div className="m-sub m-cats">
                  <Link href={l.href} className="m-all">All {l.label}</Link>
                  {l.categories.map((c) => <Link key={c.href} href={c.href}>{c.label}</Link>)}
                </div>
              </details>
            ))}
            {menu.vibes.length > 0 && (
              <details className="m-group">
                <summary className="m-top">Vibes</summary>
                <div className="m-sub m-cats">
                  {menu.vibes.map((v) => <Link key={v.href} href={v.href}>{v.label}</Link>)}
                </div>
              </details>
            )}
            {menu.afterDark && <Link href="/shop/after-dark" className="m-top">After Dark <span className="soon">18+</span></Link>}
          </nav>
        </aside>
      </div>
    </header>
  );
}
