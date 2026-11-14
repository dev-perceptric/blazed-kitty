import Link from 'next/link';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { isDark } from '@/lib/art';
import { ProductArt } from './Art';
import { AdultBlur } from './Adult';

export function tileColor(p: Product) {
  if (p.garment === 'bikini') return 'var(--lav)';
  return isDark(p.colors[0].hex) ? 'var(--gum)' : 'var(--plum)';
}

export default function ProductCard({ product }: { product: Product }) {
  const art = <ProductArt product={product} />;
  return (
    <Link href={`/product/${product.slug}`} className="card">
      <div className="card-art" style={{ background: tileColor(product) }}>
        {product.afterDark ? <AdultBlur>{art}</AdultBlur> : art}
      </div>
      <div className="card-meta">
        <div className="card-top">
          <span className="code">{product.code}</span>
          {product.afterDark && <span className="tag tag-dark">After Dark</span>}
        </div>
        <h3>{product.name}</h3>
        <div className="card-bottom">
          <span className="price">{formatPrice(product.price)}</span>
          <span className="swatches" aria-label={`${product.colors.length} color${product.colors.length > 1 ? 's' : ''}`}>
            {product.garment !== 'bikini' && product.colors.map((c) => <i key={c.name} style={{ background: c.hex }} title={c.name} />)}
          </span>
        </div>
      </div>
    </Link>
  );
}
