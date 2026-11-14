# Blazed Kitty storefront

Nine lives, all of them baked. A Next.js 14 store for the Blazed Kitty print-on-demand brand: cropped baby tees, micro-rib tanks and string bikinis, printed by Printful.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's here

| Path | What it does |
|---|---|
| `lib/products.ts` | The catalog: 12 products, retail prices, colors, sizes and the Printful blank each one prints on |
| `lib/art.ts` | All artwork as SVG strings: the Pink Chrome logo, front prints, bikini patterns and garment mockups |
| `app/page.tsx` | Home: hero, categories, Drop 01, After Dark, newsletter |
| `app/shop/page.tsx` | Shop with tabs for tees, tanks, bikinis and After Dark |
| `app/product/[slug]` | Product page with color, size, quantity and add to bag |
| `components/CartDrawer.tsx` | The bag, saved in the browser |
| `components/Adult.tsx` | Blurs After Dark art until the visitor confirms they are 18+ |
| `app/api/checkout` | Creates a Stripe Checkout session (needs `STRIPE_SECRET_KEY`) |
| `app/api/newsletter` | Adds emails to a Resend audience (needs `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`) |

Copy `.env.example` to `.env.local` and fill in keys as each service gets connected. Without keys the store still runs; checkout and sign-up show a plain "not connected yet" message.

## Printful blanks

| Product type | Printful catalog ID | Blank |
|---|---|---|
| Baby tees | 636 | AS Colour 4062 Women's Crop Tee |
| Tanks | 780 | Bella+Canvas 1012 Micro-Rib Tank |
| String bikinis | 667 | All-Over Print String Bikini |

## Next up

- Printful sync: upload print files, create store products and pull real mockups
- Stripe webhook that creates and confirms the Printful order after payment
- Order and shipping emails through Resend
