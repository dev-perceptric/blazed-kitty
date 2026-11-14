# Blazed Kitty storefront

Nine lives, all of them baked. A Next.js 14 store for the Blazed Kitty print-on-demand brand, printed by Printful. The store is set up for Women and Men across six product lines: Tops, Couch Lock (lounge), Swim & Underwear, Headwear, The Stash and Hotbox Home.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's here

| Path | What it does |
|---|---|
| `lib/taxonomy.ts` | Departments, product lines and categories. Add a category here and it shows up in the menu, footer and shop pages |
| `lib/collections.ts` | Turns a `/shop/...` path into a list of products, crumbs and sub-links |
| `lib/products.ts` | The catalog, generated from the Printful store: department, line, category, prices, colors, sizes and Printful IDs |
| `lib/mockups.json` | Photos per product: one model photo first, then Printful product-only shots per color (hosted on Cloudflare R2) |
| `app/page.tsx` | Home: hero, new in, Women and Men, the six lines, After Dark, newsletter |
| `app/shop/[[...path]]` | Every shop page: `/shop`, `/shop/new`, `/shop/women`, `/shop/women/tops`, `/shop/women/tops/baby-tees`, `/shop/stash/socks`, `/shop/after-dark`. Empty ones show a "coming soon" sign-up |
| `app/product/[slug]` | Product page with color, size, quantity and add to bag |
| `components/CartDrawer.tsx` | The bag, saved in the browser |
| `components/Adult.tsx` | Blurs After Dark art until the visitor confirms they are 18+ |
| `app/api/checkout` | Creates a Stripe Checkout session (needs `STRIPE_SECRET_KEY`) |
| `app/api/newsletter` | Adds emails to a Resend audience (needs `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`) |

Copy `.env.example` to `.env.local` and fill in keys as each service gets connected. Without keys the store still runs; checkout and sign-up show a plain "not connected yet" message.

## Store layout

| Line | Women | Men |
|---|---|---|
| Tops | Baby Tees, Crop Tees, Tanks, Long Sleeves | Tees, Tanks, Long Sleeves |
| Couch Lock | Hoodies, Sweatpants, Shorts, Pajamas | Hoodies, Sweatpants, Shorts |
| Swim & Underwear | Panties, Bikinis | Boxers, Swim Trunks |
| Headwear | Hats, Beanies, Bucket Hats | same |
| The Stash (unisex) | Stickers, Glassware, Stash Bags, Socks, Tech | same |
| Hotbox Home (unisex) | Blankets, Wall Art, Candles, Rolling Mats | same |

Old links like `/shop?c=tees` redirect to the new pages.

## Printful blanks

`scripts/build_catalog.py` has a `TYPES` table that maps each Printful catalog ID to its line, category, departments, price and details. Live now: 967 (baby tee), 1579 (crop tee), 780 (rib tank), 669 (string bottom). The table already lists the planned blanks (hoodies, sweats, swim, boxers, hats, stickers, glassware, candles and more), so new Printful products drop into the right page when the catalog is rebuilt.

Line photos for the menu and empty pages live in R2 under `site/web/lines/`.

## Updating products

Images live on Cloudflare R2 (`blazed-kitty` bucket). To refresh the catalog after changing the Printful store:

1. `scripts/printful_product_shots.py` makes Printful product-only photos for every store product.
2. `scripts/pick_models.py` uploads one model photo per product.
3. `scripts/build_catalog.py` writes `lib/products.ts` and `lib/mockups.json`.

These read design data from the `brand-assets` branch.

## Next up

- Stripe webhook that creates and confirms the Printful order after payment
- Order and shipping emails through Resend
