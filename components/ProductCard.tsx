import Link from 'next/link';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { isNew } from '@/lib/catalog';
import { inStock } from '@/lib/stock';
import { isOversized, sizeLabel } from '@/lib/sizing';
import { shotsFor } from '@/lib/images';
import { ProductPhoto } from './Media';
import { img } from '@/lib/img';
import { AdultBlur } from './Adult';
import QuickAdd, { type QuickSize } from './QuickAdd';

/** The color in the card's first photo, so quick add puts the pictured piece in the bag. */
function pictured(product: Product) {
  const first = shotsFor(product)[0]?.color;
  return product.colors.find((c) => c.name === first) ?? product.colors[0];
}

/** White product card: photo (second photo on hover), name, price, color dots and a quick add button. */
export default function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const photo = <ProductPhoto product={product} hover eager={eager} />;
  const colors = product.colors.filter((c) => !/photo|default/i.test(c.name));
  const color = pictured(product);
  const oversized = isOversized(product);
  const sizes: QuickSize[] = product.afterDark || !color ? [] : product.sizes
    .filter((s) => inStock(product, color.name, s))
    .map((s) => {
      const l = sizeLabel(s, product.category, oversized);
      return { size: s, label: l.main, text: l.text };
    });
  return (
    <div className="tile">
      <Link href={`/product/${product.slug}`} className="tile-link">
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
                <i key={c.name} className="tile-dot" style={{ background: c.image ? `center / cover url(${img(c.image, 96)}), ${c.hex}` : c.hex }} />
              ))}
              {colors.length > 5 && <span className="tile-more">+{colors.length - 5}</span>}
            </span>
          )}
        </div>
      </Link>
      {sizes.length > 0 && (
        <QuickAdd
          item={{ slug: product.slug, name: product.name, price: product.price, color: color.name, image: shotsFor(product, color.name)[0]?.src }}
          sizes={sizes}
          showColor={colors.length > 1}
        />
      )}
    </div>
  );
}
