import type { Product } from '@/lib/products';
import { productSVG, logoSVG } from '@/lib/art';

export function ProductArt({ product, hex, view = 'garment', className = '' }: { product: Product; hex?: string; view?: 'garment' | 'print'; className?: string }) {
  const svg = productSVG(product, hex ?? product.colors[0].hex, view);
  return <div className={`art ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Logo({ className = '', flat, label }: { className?: string; flat?: string; label?: string }) {
  return <span className={`logo ${className}`} dangerouslySetInnerHTML={{ __html: logoSVG(label, flat) }} />;
}
