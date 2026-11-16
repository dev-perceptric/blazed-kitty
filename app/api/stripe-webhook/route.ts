import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/products';
import {
  createOrder,
  externalIdFor,
  findSyncVariant,
  getOrderByExternalId,
  type OrderItem,
  type Recipient,
} from '@/lib/printful';
import { getSession, getSessionLineItems, stripe, verifyStripeSignature, type CheckoutSession } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Countries where Printful needs a state or province code.
const STATE_COUNTRIES = new Set(['US', 'CA', 'AU']);

const money = (cents: number | null | undefined) => ((cents ?? 0) / 100).toFixed(2);

function recipientFrom(s: CheckoutSession): Recipient {
  const ship = s.collected_information?.shipping_details ?? s.shipping_details;
  const a = ship?.address;
  if (!a?.line1 || !a.city || !a.country || !a.postal_code) {
    throw new Error(`Session ${s.id} has no full shipping address`);
  }
  const country = a.country.toUpperCase();
  return {
    name: ship?.name || s.customer_details?.name || 'Customer',
    address1: a.line1,
    address2: a.line2 || undefined,
    city: a.city,
    state_code: STATE_COUNTRIES.has(country) && a.state ? a.state : undefined,
    country_code: country,
    zip: a.postal_code,
    email: s.customer_details?.email || undefined,
    phone: s.customer_details?.phone || undefined,
  };
}

/** Turns one paid Stripe Checkout session into one Printful order. Safe to run twice for the same session. */
async function fulfil(sessionId: string) {
  const externalId = externalIdFor(sessionId);
  const existing = await getOrderByExternalId(externalId);
  if (existing) return { status: 'already_sent', printfulOrderId: existing.id };

  const [session, lineItems] = await Promise.all([getSession(sessionId), getSessionLineItems(sessionId)]);

  const items: OrderItem[] = [];
  for (const li of lineItems) {
    const meta = li.price?.product?.metadata ?? {};
    const product = meta.slug ? getProduct(meta.slug) : undefined;
    if (!product) {
      console.warn(`stripe-webhook: ${sessionId} has an item that is not a Printful product`, meta.slug);
      continue;
    }
    items.push({
      sync_variant_id: await findSyncVariant(product, meta.color ?? '', meta.size ?? ''),
      quantity: li.quantity ?? 1,
      retail_price: money(li.price?.unit_amount),
    });
  }
  if (items.length === 0) return { status: 'no_printful_items' };

  const totals = session.total_details ?? {};
  const confirm = process.env.PRINTFUL_CONFIRM_ORDERS !== 'false';

  let order;
  try {
    order = await createOrder(
      {
        externalId,
        recipient: recipientFrom(session),
        items,
        retailCosts: {
          currency: (session.currency ?? 'usd').toUpperCase(),
          subtotal: money(session.amount_subtotal),
          discount: money(totals.amount_discount),
          shipping: money(totals.amount_shipping),
          tax: money(totals.amount_tax),
        },
      },
      confirm,
    );
  } catch (e) {
    // Two deliveries of the same event can race. If the other one won, that's fine.
    const raced = await getOrderByExternalId(externalId);
    if (raced) return { status: 'already_sent', printfulOrderId: raced.id };
    throw e;
  }

  // Note the Printful order on the Stripe payment so you can find one from the other.
  if (session.payment_intent) {
    const form = new URLSearchParams();
    form.append('metadata[printful_order_id]', String(order.id));
    form.append('metadata[printful_external_id]', externalId);
    await stripe(`/payment_intents/${session.payment_intent}`, { method: 'POST', form }).catch((e) =>
      console.warn('stripe-webhook: could not tag payment with Printful order', e.message),
    );
  }

  return { status: confirm ? 'sent' : 'draft', printfulOrderId: order.id };
}

// Stripe calls this after checkout. Paid sessions become Printful orders.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });

  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get('stripe-signature'), secret)) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  }

  let event: { id: string; type: string; data: { object: CheckoutSession } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
  }

  const handled = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
  if (!handled.includes(event.type)) return NextResponse.json({ received: true, ignored: event.type });

  const session = event.data.object;
  // Bank-transfer style payments finish later and come back as async_payment_succeeded.
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    return NextResponse.json({ received: true, waiting: session.payment_status });
  }

  try {
    const result = await fulfil(session.id);
    console.log(`stripe-webhook: ${event.type} ${session.id}`, result);
    return NextResponse.json({ received: true, ...result });
  } catch (e) {
    // A 500 makes Stripe retry for up to 3 days, so a fix to the catalog or a Printful outage heals itself.
    console.error(`stripe-webhook: failed for ${session.id}`, e);
    return NextResponse.json({ error: 'Could not send the order to Printful' }, { status: 500 });
  }
}
