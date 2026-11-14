'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartProvider';
import { Wordmark } from './Media';
import { DEPTS, LINES, categoriesFor, lineLabel, linesFor, type Dept } from '@/lib/taxonomy';
import { shopHref } from '@/lib/collections';

const UNISEX = LINES.filter((l) => l.unisex);

function MegaPanel({ dept, onPick }: { dept: Dept; onPick: () => void }) {
  const d = DEPTS.find((x) => x.id === dept)!;
  return (
    <div className="mega-inner wrap">
      <div className="mega-cols">
        {linesFor(dept).map((l) => (
          <div key={l.id} className="mega-col">
            <Link href={shopHref(dept, l.id)} className="mega-head" onClick={onPick}>{lineLabel(l, dept)}</Link>
            {categoriesFor(l.id, dept).map((c) => (
              <Link key={c.id} href={shopHref(dept, l.id, c.id)} onClick={onPick}>{c.label}</Link>
            ))}
          </div>
        ))}
        <div className="mega-col">
          <span className="mega-head">Also for the sesh</span>
          {UNISEX.map((l) => <Link key={l.id} href={shopHref(l.id)} onClick={onPick}>{l.label}</Link>)}
          <Link href={shopHref('after-dark')} onClick={onPick}>After Dark</Link>
        </div>
      </div>
      <Link href={shopHref(dept)} className="mega-feature" onClick={onPick}>
        <div className="photo"><img src={d.image} alt="" loading="lazy" /></div>
        <span>Shop all {d.label}</span>
      </Link>
    </div>
  );
}

export default function Header() {
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const [mega, setMega] = useState<Dept | null>(null);
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

  const openMega = (d: Dept) => { clearTimeout(closeTimer.current); setMega(d); };
  const closeMega = () => { closeTimer.current = setTimeout(() => setMega(null), 120); };
  const isOn = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="site-header" onMouseLeave={closeMega}>
      <div className="wrap header-row">
        <button ref={menuBtn} type="button" className="menu-btn" onClick={() => setMobile(true)} aria-expanded={mobile} aria-controls="mobile-menu">
          <span className="menu-icon" aria-hidden="true"><i /><i /></span>
          <span className="sr-only">Menu</span>
        </button>

        <nav className="nav nav-left" aria-label="Shop">
          <Link href={shopHref('new')} className={isOn(shopHref('new')) ? 'is-on' : ''} onMouseEnter={() => setMega(null)}>New</Link>
          {DEPTS.map((d) => (
            <div key={d.id} className="nav-item" onMouseEnter={() => openMega(d.id)} onMouseLeave={closeMega}>
              <Link href={shopHref(d.id)} className={isOn(shopHref(d.id)) ? 'is-on' : ''} aria-haspopup="true" aria-expanded={mega === d.id}
                onFocus={() => openMega(d.id)}>
                {d.label}
              </Link>
            </div>
          ))}
          {UNISEX.map((l) => (
            <Link key={l.id} href={shopHref(l.id)} className={isOn(shopHref(l.id)) ? 'is-on' : ''} onMouseEnter={() => setMega(null)} onFocus={() => setMega(null)}>
              {l.id === 'stash' ? 'Stash' : 'Home'}
            </Link>
          ))}
          <Link href={shopHref('after-dark')} className={`nav-adult${isOn(shopHref('after-dark')) ? ' is-on' : ''}`} onMouseEnter={() => setMega(null)} onFocus={() => setMega(null)}>After Dark</Link>
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
        {mega && <MegaPanel dept={mega} onPick={() => setMega(null)} />}
      </div>

      <div id="mobile-menu" className={`mobile-root${mobile ? ' is-open' : ''}`} aria-hidden={!mobile}>
        <div className="drawer-scrim" onClick={() => setMobile(false)} />
        <aside className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer-head">
            <Wordmark />
            <button type="button" className="text-btn" onClick={() => setMobile(false)}>Close</button>
          </div>
          <nav className="mobile-nav" aria-label="Shop">
            <Link href={shopHref('new')} className="m-top">New In</Link>
            {DEPTS.map((d) => (
              <details key={d.id} className="m-group">
                <summary className="m-top">{d.label}</summary>
                <div className="m-sub">
                  <Link href={shopHref(d.id)} className="m-all">Shop all {d.label}</Link>
                  {linesFor(d.id).map((l) => (
                    <details key={l.id} className="m-line">
                      <summary>{lineLabel(l, d.id)}</summary>
                      <div className="m-cats">
                        <Link href={shopHref(d.id, l.id)}>All {lineLabel(l, d.id)}</Link>
                        {categoriesFor(l.id, d.id).map((c) => <Link key={c.id} href={shopHref(d.id, l.id, c.id)}>{c.label}</Link>)}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
            {UNISEX.map((l) => (
              <details key={l.id} className="m-group">
                <summary className="m-top">{l.label}</summary>
                <div className="m-sub m-cats">
                  <Link href={shopHref(l.id)} className="m-all">Shop all {l.label}</Link>
                  {categoriesFor(l.id).map((c) => <Link key={c.id} href={shopHref(l.id, c.id)}>{c.label}</Link>)}
                </div>
              </details>
            ))}
            <Link href={shopHref('after-dark')} className="m-top">After Dark <span className="soon">18+</span></Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
