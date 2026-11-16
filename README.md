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
| `app/api/stripe-webhook` | After Stripe confirms payment, sends the order to Printful to print and ship (needs `STRIPE_WEBHOOK_SECRET` and `PRINTFUL_API_TOKEN`) |
| `lib/printful.ts`, `lib/stripe.ts` | Small API helpers for the webhook |
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

## Orders

1. Checkout sends the buyer to Stripe. Each line item carries the product slug, color and size.
2. Stripe calls `/api/stripe-webhook` with `checkout.session.completed` (or `checkout.session.async_payment_succeeded` for slower payment types).
3. The webhook checks Stripe's signature, reads the items and shipping address, finds the matching Printful store variant and creates the Printful order.
4. The Printful order ID is saved on the Stripe payment as `printful_order_id`.

Each Printful order's external ID is a hash of the Stripe session, so a repeated webhook never makes a second order. If anything fails, the webhook answers 500 and Stripe retries for up to 3 days.

Set `PRINTFUL_CONFIRM_ORDERS=false` to land orders as Printful drafts while testing.

### Setup

1. Stripe Dashboard → Developers → Webhooks → Add endpoint: `https://blazedkitty.com/api/stripe-webhook`
2. Events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`
3. Copy the signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` on the server, along with `STRIPE_SECRET_KEY`, `PRINTFUL_API_TOKEN` and `PRINTFUL_STORE_ID`.

## Next up

- Order and shipping emails through Resend
