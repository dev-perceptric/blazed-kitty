import { DELIVERY_MAX, DELIVERY_MIN, RETURN_DAYS, SUPPORT_EMAIL, WELCOME_PERCENT } from './site';

export const FAQ: { q: string; a: string }[] = [
  { q: 'How long does shipping take?', a: `Shipping is free on every order. Most orders arrive in ${DELIVERY_MIN} to ${DELIVERY_MAX} days, and each product page shows the estimate for that piece. Pieces in one order can arrive in separate packages.` },
  { q: 'How do I track my order?', a: 'Go to Track Order and enter your email and order number (it starts with BK- and is on your confirmation page). Your tracking number shows there once your parcel ships, usually 1 to 3 business days after you order.' },
  { q: 'What is your return policy?', a: `You can return unworn items within ${RETURN_DAYS} days of delivery. Email ${SUPPORT_EMAIL} first and we send the return address. If something arrives damaged or wrong, we replace or refund it for free.` },
  { q: 'How do Y2K sizes fit?', a: 'Every product shows US and EU sizes, and the size guide on each product page lists the measurements in inches and centimeters. Baby tees and fitted tops are meant to be snug, so size up if you are between sizes or want a looser fit. Oversized tees, hoodies and baggy jeans are cut big on purpose.' },
  { q: 'Do you ship worldwide?', a: 'We ship to the United States, Canada, the United Kingdom, Australia, New Zealand, Ireland, Germany, France, the Netherlands, Spain, Italy, Sweden and Denmark. Orders outside the US may pay local import taxes.' },
  { q: 'Is there a discount for my first order?', a: `Yes. Join the Bad Kitty Club email list and you get ${WELCOME_PERCENT}% off your first order. Enter the code at checkout.` },
  { q: 'What does Y2K style mean?', a: 'Y2K is the look of the late 90s and early 2000s: baby tees, low rise and baggy jeans, rhinestones, butterfly clips, platform shoes and a lot of attitude. We mix it with goth, grunge, emo, coquette and anime.' },
];
