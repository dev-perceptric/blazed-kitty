import type { Metadata, Viewport } from 'next';
import { Anton, Archivo_Black, Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';
import CartProvider from '@/components/CartProvider';
import Header from '@/components/Header';
import { buildMenu } from '@/lib/catalog';
import Announcement from '@/components/Announcement';
import Promo from '@/components/Promo';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { GOOGLE_SITE_VERIFICATION, PINTEREST_VERIFICATION } from '@/lib/site';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-display', display: 'swap' });
const logo = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-logo', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const serif = Instrument_Serif({ weight: '400', style: ['italic'], subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'BlazedKitty | Y2K Clothing, Baby Tees, Baggy Jeans & Jorts', template: '%s | BlazedKitty' },
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  other: { 'p:domain_verify': PINTEREST_VERIFICATION },
  description: 'Y2K clothing for women and men: baby tees, graphic tees, zip hoodies, baggy jeans, jorts, mini skirts, platform shoes and jewelry. Free shipping worldwide.',
};

export const viewport: Viewport = { themeColor: '#ffffff', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${logo.variable} ${inter.variable} ${serif.variable}`}>
      <body>
        <CartProvider>
          <Announcement />
          <Header menu={buildMenu()} />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <Promo />
        </CartProvider>
      </body>
    </html>
  );
}
