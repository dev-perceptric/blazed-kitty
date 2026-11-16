# Blazed Kitty storefront

Nine lives, zero basics. A Next.js 14 store for Blazed Kitty, an alt clothing brand: baby tees, goth tops, grunge layers and y2k pieces. Pieces come from AliExpress and CJ Dropshipping; the original Printful catalog is still in the code but hidden (`SHOW_PRINTFUL` in `lib/products.ts`). Lines: Tops, Layers (lounge), Swim & Underwear, Headwear, Extras (stash) and Room (home).

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
| `lib/printful.ts`, `lib/stripe.ts`, `lib/cj.ts` | Small API helpers for the webhook |
| `lib/cj-products.json` | CJ Dropshipping products, written by `scripts/cj_catalog.py` |
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

## CJ Dropshipping products

Ready-made items (stash bags, trays, accessories) can come from CJ next to the Printful pieces.

1. Find products: `python3 scripts/cj_search.py "stash bag" --us` (`--us` = US warehouse, faster shipping).
2. Add picks to `scripts/cj_picks.json`, for example:
   ```json
   [{ "pid": "1234-ABCD", "category": "bags", "name": "Smell Proof Stash Bag", "blurb": "Keeps the sesh between us." }]
   ```
   `category` is any id from `lib/taxonomy.ts`. Optional: `price`, `details`, `description`, `depts`, `afterDark`, `from`.
3. Run `python3 scripts/cj_catalog.py`. It pulls sizes, colors, costs and photos (copied to R2 under `cj/`), prices each item at CJ cost × 2 plus shipping unless you set `price`, and writes `lib/cj-products.json`.

CJ items only offer the color and size combos CJ stocks. On a paid order, the webhook sends CJ items to CJ (one order per warehouse), picks the cheapest CJ shipping, and pays from the CJ wallet. Printful items in the same order still go to Printful, so the buyer gets separate packages.

## AliExpress products

1. Put `ALIEXPRESS_APP_KEY`, `ALIEXPRESS_APP_SECRET` and `ADMIN_TOKEN` in the server `.env`.
2. Give the container a saved folder for the AliExpress sign-in. In `docker-compose.yml`, under `web:` add
   `volumes: ["bk-data:/app/data"]`, and at the bottom add `volumes: { bk-data: {} }`.
3. Sign in once: open `https://blazedkitty.com/api/aliexpress/connect?key=ADMIN_TOKEN` and approve.
4. Find products: `python3 scripts/ae_search.py "y2k baby tee"`, add picks to `scripts/ae_picks.json`
   (`{"id": "...", "category": "baby-tees"}` plus optional name, price, blurb, details), then run
   `python3 scripts/ae_catalog.py`. Both scripts call `/api/aliexpress/admin` with the `X-Admin-Token` header.

Paid AliExpress items are ordered by the Stripe webhook with the cheapest shipping and paid with the AliExpress account's payment method.

### Import list (bulk)

1. Open https://blazedkitty.com/admin/queue, enter `ADMIN_TOKEN` once, and drag the **+ BlazedKitty** button to the bookmarks bar.
2. On any AliExpress page (search, store, wishlist), scroll down and click the button. Every product on the page is saved to `/app/data/ae-queue.json` on the server, without duplicates.
3. Each batch:
   ```bash
   python3 scripts/ae_queue.py pull /tmp/batch.json      # everything waiting
   python3 scripts/ae_import.py /tmp/batch.json          # sort into sections, skip kids' items and copyrighted art
   python3 scripts/ae_catalog.py                         # pull details and photos
   python3 scripts/ae_tidy.py /tmp/batch.json --from N   # multi-pack prices, real fur, over $90, generic names
   # photo check: remove anything with characters, bands, brands or real people; add their ids to scripts/ae_blocked.json
   python3 scripts/ae_blurbs.py && python3 scripts/ae_catalog.py
   python3 scripts/ae_queue.py sync /tmp/batch.json      # mark added / skipped
   ```

## Next up

- Order and shipping emails through Resend
