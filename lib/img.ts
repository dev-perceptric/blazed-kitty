// Product photos are resized and converted to WebP by the site's own image service (/_next/image),
// so a product card downloads a ~40 KB WebP instead of the full ~400 KB original. Client-safe.

const HOSTS = ['pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev', 'ae01.alicdn.com'];
/** Widths the image service makes (must match next.config images.deviceSizes / imageSizes). */
export const WIDTHS = [96, 160, 256, 480, 768, 1080, 1600] as const;
export type Width = (typeof WIDTHS)[number];

const ok = (src?: string) => !!src && HOSTS.some((h) => src.startsWith(`https://${h}/`));

/** URL of a resized WebP copy of a product photo (or the original for anything else). */
export function img(src: string | undefined, w: Width, q = 75): string {
  if (!src) return '';
  return ok(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}` : src;
}

/** srcset for a photo at the given widths. */
export function srcSet(src: string | undefined, widths: Width[]): string | undefined {
  return ok(src) ? widths.map((w) => `${img(src, w)} ${w}w`).join(', ') : undefined;
}

/** Ready-made props for the main sizes the site uses. */
export const cardImg = (src?: string) => ({ src: img(src, 480), srcSet: srcSet(src, [256, 480, 768]), sizes: '(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 25vw' });
export const heroImg = (src?: string) => ({ src: img(src, 1080), srcSet: srcSet(src, [480, 768, 1080, 1600]), sizes: '(max-width: 600px) 100vw, 34vw' });
export const galleryImg = (src?: string) => ({ src: img(src, 1080), srcSet: srcSet(src, [480, 768, 1080, 1600]), sizes: '(max-width: 860px) 100vw, 55vw' });
export const thumbImg = (src?: string) => ({ src: img(src, 160), srcSet: srcSet(src, [160, 256]), sizes: '96px' });
export const tileImg = (src?: string) => ({ src: img(src, 768), srcSet: srcSet(src, [480, 768, 1080]), sizes: '(max-width: 600px) 100vw, 33vw' });
