import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'About BlazedKitty', description: 'BlazedKitty is a Y2K clothing store for women and men: baby tees, baggy jeans, jorts, goth and anime pieces.' };

export default function AboutPage() {
  return (
    <InfoPage title="About BlazedKitty" intro="Nine lives, zero basics.">
      <h2>Who we are</h2>
      <p>BlazedKitty is a Y2K clothing store for anyone who never grew out of their emo phase. We pick the baby tees, baggy jeans, jorts, rhinestone zip hoodies, platform shoes and chunky rings that look like they came straight out of 2003, then mix in goth, grunge, coquette and anime.</p>
      <h2>What we sell</h2>
      <p>Thousands of Y2K pieces for women and men, sorted down to the detail so you can find exactly the fit, print and vibe you want. New drops land every week.</p>
      <h2>How it works</h2>
      <p>Your pieces ship straight from our partner warehouses with free shipping on every order. That keeps prices low and lets us carry far more styles than a single shop could stock.</p>
      <h2>Get in touch</h2>
      <p>Questions about sizing, an order or a return? See the <Link className="link" href="/faq">FAQ</Link> or <Link className="link" href="/contact">contact us</Link>.</p>
    </InfoPage>
  );
}
