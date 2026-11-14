import type { Metadata, Viewport } from 'next';
import { Titan_One, Yellowtail, Outfit, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { svgDefs } from '@/lib/art';
import CartProvider from '@/components/CartProvider';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

const titan = Titan_One({ weight: '400', subsets: ['latin'], variable: '--font-titan', display: 'swap' });
const yellowtail = Yellowtail({ weight: '400', subsets: ['latin'], variable: '--font-script', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const plex = IBM_Plex_Mono({ weight: ['500', '600'], subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Blazed Kitty', template: '%s · Blazed Kitty' },
  description: 'Nine lives, all of them baked. Baby tees, tanks and string bikinis for girls who roll their own.',
};

export const viewport: Viewport = { themeColor: '#0e0a12', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${titan.variable} ${yellowtail.variable} ${outfit.variable} ${plex.variable}`}>
      <body>
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
          <defs dangerouslySetInnerHTML={{ __html: svgDefs() }} />
        </svg>
        <CartProvider>
          <div className="announce">
            <div className="wrap">Made when you order · Baby tees XS–2XL · Bikinis 2XS–6XL</div>
          </div>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
