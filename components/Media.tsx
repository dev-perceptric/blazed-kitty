import type { Product } from '@/lib/products';
import { shotsFor, printSrc } from '@/lib/images';
import { cardImg } from '@/lib/img';

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
      <img {...cardImg(shots[0].src)} alt={product.name} loading={eager ? 'eager' : 'lazy'} className={shots[0].style === 'Model' ? undefined : 'is-product'} />
      {hover && shots[1] && <img className={`photo-alt${shots[1].style === 'Model' ? '' : ' is-product'}`} {...cardImg(shots[1].src)} alt="" aria-hidden="true" loading="lazy" />}
    </div>
  );
}

/** The BlazedKitty logo: "blazed kitty" in a heavy lowercase type, the dot of the i is a pink cat head. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} role="img" aria-label="Blazed Kitty">
      <span aria-hidden="true">
        blazed k<span className="wm-i">ı<svg viewBox="0 0 30 25"><path d="M2 24 L4 2 L11 9 Q15 7.5 19 9 L26 2 L28 24 Z" /></svg></span>tty
      </span>
    </span>
  );
}
