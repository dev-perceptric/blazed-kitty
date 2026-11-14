# Blazed Kitty storefront

Nine lives, all of them baked. A Next.js 14 store for the Blazed Kitty print-on-demand brand: raglan baby tees, micro-rib tanks, cropped tees and string bottoms, printed by Printful.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's here

| Path | What it does |
|---|---|
| `lib/products.ts` | The catalog: 54 products generated from the Printful store, with prices, colors, sizes and Printful IDs |
| `lib/mockups.json` | Photos per product: one model photo first, then Printful product-only shots per color (hosted on Cloudflare R2) |
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
| Raglan baby tees | 967 | Bella+Canvas 1201 Micro Rib Raglan Baby Tee |
| Tanks | 780 | Bella+Canvas 1012 Micro-Rib Tank |
| Cropped tees | 1579 | Bella+Canvas 6882GD Garment Dye Cropped Tee |
| String bottoms | 669 | All-Over Print Recycled String Bikini Bottom |

## Updating products

Images live on Cloudflare R2 (`blazed-kitty` bucket). To refresh the catalog after changing the Printful store:

1. `scripts/printful_product_shots.py` makes Printful product-only photos for every store product.
2. `scripts/pick_models.py` uploads one model photo per product.
3. `scripts/build_catalog.py` writes `lib/products.ts` and `lib/mockups.json`.

These read design data from the `brand-assets` branch.

## Next up

- Stripe webhook that creates and confirms the Printful order after payment
- Order and shipping emails through Resend
