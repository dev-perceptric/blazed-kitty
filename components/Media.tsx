import type { Product } from '@/lib/products';
import { shotsFor, printSrc } from '@/lib/images';

/** Main product photo, with an optional second photo shown on hover. */
export function ProductPhoto({ product, color, hover = false, eager = false, className = '' }: { product: Product; color?: string; hover?: boolean; eager?: boolean; className?: string }) {
  const shots = shotsFor(product, color);
  const hex = (product.colors.find((c) => c.name === color) ?? product.colors[0]).hex;
  if (!shots.length) {
    return (
      <div className={`photo photo-print ${className}`} style={{ background: product.allOver ? '#151315' : hex }}>
        <img src={printSrc(product)} alt={`${product.name} print`} loading={eager ? 'eager' : 'lazy'} />
      </div>
    );
  }
  return (
    <div className={`photo ${hover && shots[1] ? 'has-hover' : ''} ${className}`}>
      <img src={shots[0].src} alt={product.name} loading={eager ? 'eager' : 'lazy'} className={shots[0].style === 'Model' ? undefined : 'is-product'} />
      {hover && shots[1] && <img className={`photo-alt${shots[1].style === 'Model' ? '' : ' is-product'}`} src={shots[1].src} alt="" aria-hidden="true" loading="lazy" />}
    </div>
  );
}

/** Text logo with two small hallmarks: cat ears on the K and a wisp of smoke off the D. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} role="img" aria-label="Blazed Kitty">
      <span aria-hidden="true">
        BLAZE<span className="wm-d">D<svg className="wm-smoke" viewBox="0 0 10 26"><path d="M5 25 C1 20 9 16 5 11 C2 7 8 5 6 1" /></svg></span>{' '}
        <span className="wm-k">K<i className="wm-ear wm-ear-l" /><i className="wm-ear wm-ear-r" /></span>ITTY
      </span>
    </span>
  );
}
