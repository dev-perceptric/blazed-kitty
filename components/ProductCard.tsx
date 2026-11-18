import Link from 'next/link';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { isNew } from '@/lib/catalog';
import { ProductPhoto } from './Media';
import { AdultBlur } from './Adult';

/** White product card: photo (second photo on hover), name, price and color dots. */
export default function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const photo = <ProductPhoto product={product} hover eager={eager} />;
  const colors = product.colors.filter((c) => !/photo|default/i.test(c.name));
  return (
    <Link href={`/product/${product.slug}`} className="tile">
      <div className="tile-media">
        {product.afterDark ? <AdultBlur>{photo}</AdultBlur> : photo}
        {isNew(product) && <span className="badge">New</span>}
      </div>
      <div className="tile-info">
        <span className="tile-name">{product.name}</span>
        <span className="tile-price">{formatPrice(product.price)}</span>
        {colors.length > 1 && (
          <span className="tile-dots" aria-label={`${colors.length} colors`}>
            {colors.slice(0, 5).map((c) => (
              <i key={c.name} className="tile-dot" style={{ background: c.image ? `center / cover url(${c.image}), ${c.hex}` : c.hex }} />
            ))}
            {colors.length > 5 && <span className="tile-more">+{colors.length - 5}</span>}
          </span>
        )}
      </div>
    </Link>
  );
}
