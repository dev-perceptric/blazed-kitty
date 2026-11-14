import Link from 'next/link';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { ProductPhoto } from './Media';
import { AdultBlur } from './Adult';

export default function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const photo = <ProductPhoto product={product} hover eager={eager} />;
  return (
    <Link href={`/product/${product.slug}`} className="tile">
      <div className="tile-media">
        {product.afterDark ? <AdultBlur>{photo}</AdultBlur> : photo}
        {product.afterDark && <span className="badge">After Dark</span>}
      </div>
      <div className="tile-info">
        <span className="tile-name">{product.name}</span>
        <span className="tile-price">{formatPrice(product.price)}</span>
      </div>
      {product.garment !== 'bikini' && product.colors.length > 1 && (
        <span className="tile-colors">{product.colors.length} colors</span>
      )}
    </Link>
  );
}
