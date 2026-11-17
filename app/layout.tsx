import type { Metadata, Viewport } from 'next';
import { Anton, Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';
import CartProvider from '@/components/CartProvider';
import Header from '@/components/Header';
import { buildMenu } from '@/lib/collections';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-display', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const serif = Instrument_Serif({ weight: '400', style: ['italic'], subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Blazed Kitty', template: '%s · Blazed Kitty' },
  description: 'Alt clothing for girls who never grew out of their emo phase. Baby tees, goth tops, grunge layers, mini skirts and Y2K accessories, shipped worldwide.',
};

export const viewport: Viewport = { themeColor: '#0c0b0c', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} ${serif.variable}`}>
      <body>
        <CartProvider>
          <div className="announce">New alt drops every week · Ships worldwide</div>
          <Header menu={buildMenu()} />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
