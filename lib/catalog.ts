// The store's collections: every page under /collections/<slug> and /collections/<slug>/<womens|mens>.
// Collections are built from each product's category and photo tags (lib/tags.ts), so new imports land in the
// right places on their own. Every title carries "Y2K" for search.
import { PRODUCTS, type Product } from './products';
import { vibeMatches } from './filters';

export type DeptId = 'womens' | 'mens';
export const DEPTS: { id: DeptId; label: string; short: string; blurb: string }[] = [
  { id: 'womens', label: 'Women', short: "Women's", blurb: 'Y2K baby tees, mini skirts, low rise jeans, corsets and everything in between.' },
  { id: 'mens', label: 'Men', short: "Men's", blurb: 'Y2K graphic tees, zip hoodies, baggy jeans, jorts and jackets.' },
];
export const getDept = (id?: string) => DEPTS.find((d) => d.id === id);
export const inDept = (p: Product, d?: DeptId) => !d || p.depts.includes(d === 'womens' ? 'women' : 'men');

export type GroupId =
  | 'tops' | 'knits' | 'outerwear' | 'jeans' | 'pants' | 'shorts' | 'skirts' | 'dresses' | 'shoes' | 'jewelry' | 'accessories'
  | 'themes' | 'new' | 'hidden';

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'tops', label: 'Tops' },
  { id: 'knits', label: 'Hoodies & Knits' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'pants', label: 'Pants' },
  { id: 'shorts', label: 'Jorts & Shorts' },
  { id: 'skirts', label: 'Skirts' },
  { id: 'dresses', label: 'Dresses & Sets' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
];

export interface CollectionDef {
  slug: string;
  title: string;
  group: GroupId;
  /** The group's main collection ("All Jeans"). */
  parent?: boolean;
  blurb: string;
  test: (p: Product) => boolean;
  /** Sort the list (default: store order). */
  order?: 'new';
  /** Shown in a department menu only for women (skirts, dresses...). */
  womenOnly?: boolean;
}

const cat = (...ids: string[]) => (p: Product) => ids.includes(p.category);
const sub = (...ids: string[]) => (p: Product) => !!p.attrs?.sub && ids.includes(p.attrs.sub);
const mat = (id: string) => (p: Product) => !!p.attrs?.material?.includes(id);
const theme = (id: string) => (p: Product) => !!p.attrs?.themes?.includes(id);
const print = (...ids: string[]) => (p: Product) => !!p.attrs?.print && ids.includes(p.attrs.print);
const named = (re: RegExp) => (p: Product) => re.test(p.name);
const len = (...ids: string[]) => (p: Product) => !!p.attrs?.length && ids.includes(p.attrs.length);
const and = (...fs: ((p: Product) => boolean)[]) => (p: Product) => fs.every((f) => f(p));
const or = (...fs: ((p: Product) => boolean)[]) => (p: Product) => fs.some((f) => f(p));
const not = (f: (p: Product) => boolean) => (p: Product) => !f(p);
const TEES = cat('baby-tees', 'crop-tees', 'oversized-tees');
const DENIM = or(mat('denim'), named(/\b(denim|jean|jorts?)\b/i));

export const COLLECTIONS: CollectionDef[] = [
  // Tops
  { slug: 'y2k-tops', title: 'Y2K Tops', group: 'tops', parent: true, test: cat('baby-tees', 'crop-tees', 'oversized-tees', 'long-sleeves', 'camis-tanks', 'halter-tube', 'corsets-bodysuits', 'blouses'),
    blurb: 'Baby tees, graphic tees, long sleeves, camis and corsets with that early 2000s attitude.' },
  { slug: 'y2k-baby-tees', title: 'Y2K Baby Tees', group: 'tops', womenOnly: true, test: cat('baby-tees'),
    blurb: 'Fitted, cropped and a little rude. The baby tee is the backbone of every Y2K outfit.' },
  { slug: 'y2k-crop-tops', title: 'Y2K Crop Tops', group: 'tops', womenOnly: true, test: cat('crop-tees'),
    blurb: 'Cropped tees and tops that sit right at the waistband of your lowest-rise jeans.' },
  { slug: 'y2k-graphic-tees', title: 'Y2K Graphic Tees', group: 'tops', test: and(TEES, print('graphic', 'slogan', 'photo', 'anime', 'music', 'screen', 'logo')),
    blurb: 'Big prints, loud slogans, band art and anime. Graphic tees that start the conversation for you.' },
  { slug: 'y2k-oversized-tees', title: 'Y2K Oversized Tees', group: 'tops', test: cat('oversized-tees'),
    blurb: 'Boxy, dropped-shoulder tees, often acid washed, made to wear baggy.' },
  { slug: 'y2k-long-sleeve-tops', title: 'Y2K Long Sleeve Tops', group: 'tops', test: cat('long-sleeves'),
    blurb: 'Layered, mesh, striped and fitted long sleeves for every season.' },
  { slug: 'y2k-tank-tops', title: 'Y2K Tank Tops & Camis', group: 'tops', test: cat('camis-tanks', 'halter-tube'),
    blurb: 'Camis, tanks, halters and tube tops, the hot-weather side of Y2K.' },
  { slug: 'y2k-corset-tops', title: 'Y2K Corsets & Bodysuits', group: 'tops', womenOnly: true, test: cat('corsets-bodysuits'),
    blurb: 'Lace-up corset tops, bustiers and bodysuits to wear out or layer over a tee.' },
  { slug: 'y2k-shirts', title: 'Y2K Shirts & Blouses', group: 'tops', test: cat('blouses'),
    blurb: 'Button ups, polos and lace blouses with a vintage twist.' },
  { slug: 'y2k-jerseys', title: 'Y2K Jerseys', group: 'tops', test: or(print('jersey'), sub('jersey-tee')),
    blurb: 'Football and hockey style jerseys with numbers on the back, a blokecore favorite.' },

  // Hoodies & knits
  { slug: 'y2k-hoodies-knits', title: 'Y2K Hoodies & Knits', group: 'knits', parent: true, test: cat('hoodies', 'sweaters', 'cardigans'),
    blurb: 'Zip hoodies, knit sweaters and cardigans for cold nights and loud music.' },
  { slug: 'y2k-hoodies', title: 'Y2K Hoodies', group: 'knits', test: cat('hoodies'),
    blurb: 'Pullovers and zip ups, plain or covered in prints, rhinestones and band art.' },
  { slug: 'y2k-zip-up-hoodies', title: 'Y2K Zip Up Hoodies', group: 'knits', test: sub('zip-hoodie', 'rhinestone-zip-hoodie'),
    blurb: 'The full zip hoodie: rhinestone skulls, back prints, fur hoods and all.' },
  { slug: 'y2k-graphic-hoodies', title: 'Y2K Graphic Hoodies', group: 'knits', test: and(cat('hoodies'), not(print('plain', 'pattern'))),
    blurb: 'Hoodies with big front and back prints, from gothic letters to tour merch.' },
  { slug: 'y2k-sweaters', title: 'Y2K Sweaters', group: 'knits', test: cat('sweaters'),
    blurb: 'Striped, distressed and cropped knit sweaters.' },
  { slug: 'y2k-cardigans', title: 'Y2K Cardigans', group: 'knits', test: cat('cardigans'),
    blurb: 'Cropped cardigans, shrugs and boleros to throw over a cami.' },

  // Outerwear
  { slug: 'y2k-jackets', title: 'Y2K Jackets & Coats', group: 'outerwear', parent: true, test: cat('jackets'),
    blurb: 'Faux leather, denim, bombers, puffers and fur collar coats.' },
  { slug: 'y2k-leather-jackets', title: 'Y2K Leather Jackets', group: 'outerwear', test: and(cat('jackets'), or(sub('leather-jacket'), mat('faux-leather'))),
    blurb: 'Faux leather moto and cropped jackets for every night out.' },
  { slug: 'y2k-denim-jackets', title: 'Y2K Denim Jackets', group: 'outerwear', test: and(cat('jackets'), or(sub('denim-jacket'), mat('denim'))),
    blurb: 'Washed, cropped and oversized denim jackets.' },
  { slug: 'y2k-bomber-jackets', title: 'Y2K Bomber & Varsity Jackets', group: 'outerwear', test: sub('bomber-jacket', 'varsity-jacket', 'track-jacket'),
    blurb: 'Bombers, varsity and track jackets with a 2000s mall energy.' },
  { slug: 'y2k-coats', title: 'Y2K Coats & Puffers', group: 'outerwear', test: sub('coat', 'puffer-jacket', 'fur-collar-jacket'),
    blurb: 'Fur collar coats, puffers and long coats for the cold.' },

  // Jeans
  { slug: 'y2k-jeans', title: 'Y2K Jeans', group: 'jeans', parent: true, test: cat('jeans'),
    blurb: 'Baggy, flare, low rise and embroidered jeans. The pair your whole outfit is built on.' },
  { slug: 'y2k-baggy-jeans', title: 'Y2K Baggy Jeans', group: 'jeans', test: and(cat('jeans'), sub('baggy-jeans')),
    blurb: 'Wide leg, barrel and straight baggy jeans that pool at the ankle.' },
  { slug: 'y2k-flare-jeans', title: 'Y2K Flare Jeans', group: 'jeans', test: and(cat('jeans'), sub('flare-jeans')),
    blurb: 'Low rise flares and bootcuts, straight out of 2003.' },
  { slug: 'y2k-skinny-jeans', title: 'Y2K Skinny Jeans', group: 'jeans', test: and(cat('jeans'), sub('skinny-jeans')),
    blurb: 'Skinny and slim jeans for the emo era.' },
  { slug: 'y2k-low-rise-jeans', title: 'Y2K Low Rise Jeans', group: 'jeans', womenOnly: true, test: and(cat('jeans'), (p) => !!p.attrs?.cut?.includes('low-rise')),
    blurb: 'Hip-hugging low rise jeans, the signature Y2K cut.' },
  { slug: 'y2k-embroidered-jeans', title: 'Y2K Embroidered Jeans', group: 'jeans', test: and(cat('jeans'), or(mat('embroidery'), mat('rhinestone'))),
    blurb: 'Jeans covered in embroidery, rhinestones, wings and crosses.' },

  // Pants
  { slug: 'y2k-pants', title: 'Y2K Pants & Trousers', group: 'pants', parent: true, test: cat('pants'),
    blurb: 'Cargos, flares, sweatpants and faux leather pants.' },
  { slug: 'y2k-cargo-pants', title: 'Y2K Cargo Pants', group: 'pants', test: and(cat('pants'), sub('cargo-pants')),
    blurb: 'Baggy cargos and parachute pants with all the pockets.' },
  { slug: 'y2k-flare-pants', title: 'Y2K Flare Pants', group: 'pants', test: and(cat('pants'), sub('flare-pants')),
    blurb: 'Low rise flare pants in knit, faux leather and sparkle.' },
  { slug: 'y2k-sweatpants', title: 'Y2K Sweatpants', group: 'pants', test: and(cat('pants'), sub('sweatpants')),
    blurb: 'Baggy, flared and low rise sweatpants.' },
  { slug: 'y2k-wide-leg-pants', title: 'Y2K Wide Leg Pants', group: 'pants', test: and(cat('pants'), sub('wide-leg-pants')),
    blurb: 'Wide leg trousers and pants that move.' },
  { slug: 'y2k-leather-pants', title: 'Y2K Leather Pants', group: 'pants', test: and(cat('pants'), mat('faux-leather')),
    blurb: 'Faux leather flares, straight legs and stacked pants.' },

  // Jorts & shorts
  { slug: 'y2k-jorts-shorts', title: 'Y2K Jorts & Shorts', group: 'shorts', parent: true, test: cat('shorts'),
    blurb: 'Long jorts, micro shorts and everything in between.' },
  { slug: 'y2k-jorts', title: 'Y2K Jorts', group: 'shorts', test: and(cat('shorts'), DENIM),
    blurb: 'Denim shorts and long jorts, baggy or barely there.' },
  { slug: 'y2k-shorts', title: 'Y2K Shorts', group: 'shorts', test: and(cat('shorts'), not(DENIM)),
    blurb: 'Lace, striped, faux leather and sweat shorts.' },

  // Skirts
  { slug: 'y2k-skirts', title: 'Y2K Skirts', group: 'skirts', parent: true, womenOnly: true, test: cat('skirts'),
    blurb: 'Pleated minis, low rise skirts and long goth maxis.' },
  { slug: 'y2k-mini-skirts', title: 'Y2K Mini Skirts', group: 'skirts', womenOnly: true, test: and(cat('skirts'), or(sub('mini-skirt'), len('mini'))),
    blurb: 'Micro minis, ruffle minis and low rise minis.' },
  { slug: 'y2k-pleated-skirts', title: 'Y2K Pleated Skirts', group: 'skirts', womenOnly: true, test: and(cat('skirts'), sub('pleated-skirt')),
    blurb: 'Plaid, denim and tennis-style pleated skirts.' },
  { slug: 'y2k-maxi-skirts', title: 'Y2K Midi & Maxi Skirts', group: 'skirts', womenOnly: true, test: and(cat('skirts'), or(sub('midi-skirt', 'maxi-skirt'), len('midi', 'maxi'))),
    blurb: 'Long denim, cargo and lace skirts that sweep the floor.' },

  // Dresses & sets
  { slug: 'y2k-dresses-sets', title: 'Y2K Dresses & Sets', group: 'dresses', parent: true, womenOnly: true, test: cat('dresses', 'sets', 'bikinis'),
    blurb: 'Mini dresses, corset dresses, matching sets and jumpsuits.' },
  { slug: 'y2k-dresses', title: 'Y2K Dresses', group: 'dresses', womenOnly: true, test: cat('dresses'),
    blurb: 'Slip, corset, mini and maxi dresses for every kind of night.' },
  { slug: 'y2k-mini-dresses', title: 'Y2K Mini Dresses', group: 'dresses', womenOnly: true, test: and(cat('dresses'), or(sub('mini-dress'), len('mini'))),
    blurb: 'Short and sweet, or short and goth.' },
  { slug: 'y2k-maxi-dresses', title: 'Y2K Midi & Maxi Dresses', group: 'dresses', womenOnly: true, test: and(cat('dresses'), or(sub('midi-dress', 'maxi-dress'), len('midi', 'maxi'))),
    blurb: 'Long lace, velvet and slit dresses.' },
  { slug: 'y2k-corset-dresses', title: 'Y2K Corset Dresses', group: 'dresses', womenOnly: true, test: and(cat('dresses'), sub('corset-dress')),
    blurb: 'Lace-up corset dresses with a built-in bodice.' },
  { slug: 'y2k-sets', title: 'Y2K Sets & Jumpsuits', group: 'dresses', test: cat('sets'),
    blurb: 'Matching two piece sets, tracksuits, jumpsuits and rompers.' },
  { slug: 'y2k-swimwear', title: 'Y2K Swimwear', group: 'dresses', womenOnly: true, test: cat('bikinis'),
    blurb: 'Bikinis and cover ups.' },

  // Shoes
  { slug: 'y2k-shoes', title: 'Y2K Shoes', group: 'shoes', parent: true, test: cat('shoes'),
    blurb: 'Platforms, boots, Mary Janes and chunky sneakers.' },
  { slug: 'y2k-platform-shoes', title: 'Y2K Platform Shoes', group: 'shoes', test: and(cat('shoes'), named(/platform|chunky|thick sole|muffin/i)),
    blurb: 'The higher the better. Platform boots, sneakers and Mary Janes.' },
  { slug: 'y2k-boots', title: 'Y2K Boots', group: 'shoes', test: and(cat('shoes'), named(/boot/i)),
    blurb: 'Combat boots, knee highs and fur boots.' },
  { slug: 'y2k-mary-janes', title: 'Y2K Mary Janes', group: 'shoes', womenOnly: true, test: and(cat('shoes'), named(/mary jane|lolita/i)),
    blurb: 'Buckled, bowed and platform Mary Janes.' },
  { slug: 'y2k-sneakers', title: 'Y2K Sneakers', group: 'shoes', test: and(cat('shoes'), named(/sneaker|trainer|skate|high top|canvas/i)),
    blurb: 'Chunky skate shoes, high tops and platform sneakers.' },

  // Jewelry
  { slug: 'y2k-jewelry', title: 'Y2K Jewelry', group: 'jewelry', parent: true, test: cat('jewelry'),
    blurb: 'Rings, chokers, chains and charms to finish the fit.' },
  { slug: 'y2k-rings', title: 'Y2K Rings', group: 'jewelry', test: and(cat('jewelry'), sub('rings')),
    blurb: 'Chunky, stacked, heart, skull and cross rings.' },
  { slug: 'y2k-necklaces', title: 'Y2K Necklaces & Chokers', group: 'jewelry', test: and(cat('jewelry'), sub('necklace', 'choker')),
    blurb: 'Chokers, chains, crosses and pendants.' },
  { slug: 'y2k-earrings', title: 'Y2K Earrings', group: 'jewelry', test: and(cat('jewelry'), sub('earrings')),
    blurb: 'Hoops, drops, studs and piercings.' },
  { slug: 'y2k-bracelets', title: 'Y2K Bracelets & Body Chains', group: 'jewelry', test: and(cat('jewelry'), sub('bracelet', 'body-chain')),
    blurb: 'Charm bracelets, cuffs and body chains.' },

  // Accessories
  { slug: 'y2k-accessories', title: 'Y2K Accessories', group: 'accessories', parent: true, test: cat('legwear', 'arm-warmers', 'hats', 'hair', 'bags', 'belts'),
    blurb: 'Hats, bags, belts, leg warmers and hair clips.' },
  { slug: 'y2k-hats', title: 'Y2K Hats & Beanies', group: 'accessories', test: cat('hats'), blurb: 'Beanies, caps and balaclavas.' },
  { slug: 'y2k-beanies', title: 'Y2K Beanies', group: 'accessories', test: and(cat('hats'), sub('beanie')), blurb: 'Printed, slogan, skull and cat ear beanies for cold days and colder looks.' },
  { slug: 'y2k-caps', title: 'Y2K Caps', group: 'accessories', test: and(cat('hats'), sub('cap')), blurb: 'Trucker, baseball and newsboy caps with a Y2K edge.' },
  { slug: 'y2k-balaclavas', title: 'Y2K Balaclavas & Hoods', group: 'accessories', test: and(cat('hats'), named(/balaclava|ski mask|\bhood\b/i)), blurb: 'Knit balaclavas, ski masks and scarf hoods. Full coverage, zero chill.' },
  { slug: 'y2k-bags', title: 'Y2K Bags', group: 'accessories', test: cat('bags'), blurb: 'Shoulder bags, mini bags and bag charms.' },
  { slug: 'y2k-belts', title: 'Y2K Belts & Sunglasses', group: 'accessories', test: cat('belts'), blurb: 'Studded belts, chains, scarves and shades.' },
  { slug: 'y2k-legwear', title: 'Y2K Socks & Leg Warmers', group: 'accessories', womenOnly: true, test: cat('legwear'), blurb: 'Leg warmers, tights, fishnets and thigh highs.' },
  { slug: 'y2k-arm-warmers', title: 'Y2K Arm Warmers & Gloves', group: 'accessories', womenOnly: true, test: cat('arm-warmers'), blurb: 'Striped arm warmers and fingerless gloves.' },
  { slug: 'y2k-hair-accessories', title: 'Y2K Hair Accessories', group: 'accessories', womenOnly: true, test: cat('hair'), blurb: 'Clips, claws and headbands.' },

  // Lines no menu shows, kept so old links land somewhere sensible.
  { slug: 'y2k-bottoms', title: 'Y2K Bottoms', group: 'hidden', test: cat('skirts', 'jeans', 'pants', 'shorts'), blurb: 'Jeans, jorts, skirts and pants.' },

  // Themes
  { slug: 'y2k-anime', title: 'Y2K Anime Clothing', group: 'themes', test: (p) => vibeMatches(p, 'anime'), blurb: 'Washed anime and manga tees, hoodies and long sleeves.' },
  { slug: 'y2k-band-merch', title: 'Y2K Band Merch', group: 'themes', test: print('music'), blurb: 'Tour hoodies and tees for the bands and rappers on repeat.' },
  { slug: 'y2k-grunge', title: 'Y2K Grunge', group: 'themes', test: (p) => vibeMatches(p, 'grunge'), blurb: 'Faded, layered and a little wrecked.' },
  { slug: 'y2k-goth', title: 'Y2K Goth', group: 'themes', test: (p) => vibeMatches(p, 'goth'), blurb: 'Lace, crosses, velvet and everything black.' },
  { slug: 'y2k-emo', title: 'Y2K Emo', group: 'themes', test: (p) => vibeMatches(p, 'emo'), blurb: 'Stripes, studs, skinny jeans and eyeliner.' },
  { slug: 'y2k-punk', title: 'Y2K Punk', group: 'themes', test: (p) => vibeMatches(p, 'punk'), blurb: 'Spikes, chains, safety pins and plaid.' },
  { slug: 'y2k-coquette', title: 'Y2K Coquette', group: 'themes', test: (p) => vibeMatches(p, 'coquette'), blurb: 'Bows, lace, ruffles and a sweet face.' },
  { slug: 'y2k-fairy-grunge', title: 'Y2K Fairy Grunge', group: 'themes', test: (p) => vibeMatches(p, 'fairy-grunge'), blurb: 'Soft, sheer, floral and slightly haunted.' },
  { slug: 'y2k-harajuku', title: 'Y2K Harajuku', group: 'themes', test: (p) => vibeMatches(p, 'harajuku'), blurb: 'Loud, layered and kawaii.' },
  { slug: 'y2k-streetwear', title: 'Y2K Streetwear', group: 'themes', test: (p) => vibeMatches(p, 'streetwear'), blurb: 'Baggy fits, zip hoodies, jerseys and big graphic tees.' },
  { slug: 'y2k-brazil', title: 'Y2K Brazil Tops', group: 'themes', test: theme('brazil'), blurb: 'Brasil baby tees, flag colors and football tops.' },
  { slug: 'y2k-acid-wash', title: 'Y2K Acid Wash', group: 'themes', test: or(mat('acid-wash'), sub('acid-wash-tee')), blurb: 'Faded, washed and broken in from day one.' },
  { slug: 'y2k-rhinestone', title: 'Y2K Rhinestone', group: 'themes', test: or(mat('rhinestone'), sub('rhinestone-zip-hoodie')), blurb: 'Rhinestones, sequins and a lot of sparkle.' },
  { slug: 'y2k-lace', title: 'Y2K Lace', group: 'themes', test: mat('lace'), blurb: 'Lace trim, lace camis and lace everything.' },
  { slug: 'y2k-leopard-print', title: 'Y2K Leopard Print', group: 'themes', test: theme('leopard'), blurb: 'Leopard, cheetah and animal print.' },
  { slug: 'y2k-skulls', title: 'Y2K Skulls', group: 'themes', test: theme('skulls'), blurb: 'Skulls, skeletons and bones.' },
  { slug: 'y2k-stripes', title: 'Y2K Stripes', group: 'themes', test: theme('stripes'), blurb: 'Emo stripes, ringer stripes, all the stripes.' },
  { slug: 'y2k-stars', title: 'Y2K Stars', group: 'themes', test: theme('stars'), blurb: 'Stars on everything.' },

  // New
  { slug: 'y2k-new-in', title: 'New In', group: 'new', order: 'new', test: () => true, blurb: 'The latest Y2K drops. Get them before they sell out.' },
  { slug: 'y2k-trending', title: 'Trending Now', group: 'new', test: () => true, blurb: 'What everyone is wearing right now.' },
  { slug: 'y2k-under-20', title: 'Y2K Under $20', group: 'new', test: (p) => p.price < 20, blurb: 'Full fits for less.' },
];

/** Everything shoppers can browse (stash extras and 18+ pieces stay out of collections). */
export const SHOP = PRODUCTS.filter((p) => !p.afterDark && p.category !== 'extras');
const ORDER = new Map(SHOP.map((p, i) => [p.slug, i]));
/** The most recently imported pieces get a "New" badge. */
const NEW_FROM = SHOP.length - 400;
export const isNew = (p: Product) => (ORDER.get(p.slug) ?? -1) >= NEW_FROM;

export const ALL: CollectionDef = { slug: 'all', title: 'All Y2K Clothing', group: 'hidden', test: () => true, blurb: 'Every Y2K piece in the store: tops, jeans, jorts, dresses, shoes and jewelry.' };
export const getCollection = (slug: string) => (slug === 'all' ? ALL : COLLECTIONS.find((c) => c.slug === slug));

/** Core clothing first, so mixed rows lead with jeans and tees instead of accessories. */
const MIX_ORDER = ['baby-tees', 'jeans', 'oversized-tees', 'hoodies', 'dresses', 'shorts', 'crop-tees', 'skirts', 'long-sleeves', 'jackets',
  'camis-tanks', 'pants', 'corsets-bodysuits', 'sets', 'sweaters', 'cardigans', 'shoes', 'jewelry'];

/** Newest pieces first, taking one from each category in turn so no one category takes over. */
export function mixed(list: Product[], rank: (a: Product, b: Product) => number = (a, b) => ORDER.get(b.slug)! - ORDER.get(a.slug)!) {
  const byCat = new Map<string, Product[]>(MIX_ORDER.map((c) => [c, []]));
  for (const p of [...list].sort(rank)) {
    if (byCat.has(p.category)) byCat.get(p.category)!.push(p);
  }
  const out: Product[] = [];
  for (let i = 0; ; i++) {
    let added = false;
    for (const l of byCat.values()) if (l[i]) { out.push(l[i]); added = true; }
    if (!added) break;
  }
  return out;
}

const cache = new Map<string, Product[]>();
/** Products in a collection, for a department or both. */
export function productsIn(c: CollectionDef, dept?: DeptId): Product[] {
  const key = `${c.slug}/${dept ?? ''}`;
  if (cache.has(key)) return cache.get(key)!;
  // Women-only collections (baby tees, skirts, dresses...) have no Men page.
  let list = c.womenOnly && dept === 'mens' ? [] : SHOP.filter((p) => inDept(p, dept) && c.test(p));
  if (c.order === 'new') list = [...list].sort((a, b) => ORDER.get(b.slug)! - ORDER.get(a.slug)!);
  // Trending: pieces sold in the most colors and sizes (usually the seller's best sellers), mixed across categories.
  if (c.slug === 'y2k-trending') list = mixed(list, (a, b) => b.colors.length * b.sizes.length - a.colors.length * a.sizes.length || ORDER.get(b.slug)! - ORDER.get(a.slug)!);
  cache.set(key, list);
  return list;
}

export function collectionHref(slug: string, dept?: DeptId) {
  return `/collections/${slug}${dept ? `/${dept}` : ''}`;
}

export function collectionTitle(c: CollectionDef, dept?: DeptId) {
  const d = getDept(dept);
  return d ? `${c.title} for ${d.label}` : c.title;
}

/** Every /collections path that has products, for static generation and the sitemap. */
export function allCollectionPaths(): { slug: string; dept?: DeptId }[] {
  const out: { slug: string; dept?: DeptId }[] = [];
  for (const c of [ALL, ...COLLECTIONS]) {
    if (!productsIn(c).length) continue;
    out.push({ slug: c.slug });
    for (const d of DEPTS) if (productsIn(c, d.id).length) out.push({ slug: c.slug, dept: d.id });
  }
  return out;
}

/** The main collection for a category, used for breadcrumbs and old links. */
export const CATEGORY_COLLECTION: Record<string, string> = {
  'baby-tees': 'y2k-baby-tees', 'crop-tees': 'y2k-crop-tops', 'oversized-tees': 'y2k-oversized-tees', 'long-sleeves': 'y2k-long-sleeve-tops',
  'camis-tanks': 'y2k-tank-tops', 'halter-tube': 'y2k-tank-tops', 'corsets-bodysuits': 'y2k-corset-tops', blouses: 'y2k-shirts',
  hoodies: 'y2k-hoodies', sweaters: 'y2k-sweaters', cardigans: 'y2k-cardigans', jackets: 'y2k-jackets',
  jeans: 'y2k-jeans', pants: 'y2k-pants', shorts: 'y2k-jorts-shorts', skirts: 'y2k-skirts',
  dresses: 'y2k-dresses', sets: 'y2k-sets', bikinis: 'y2k-swimwear', shoes: 'y2k-shoes', jewelry: 'y2k-jewelry',
  legwear: 'y2k-legwear', 'arm-warmers': 'y2k-arm-warmers', hats: 'y2k-hats', hair: 'y2k-hair-accessories', bags: 'y2k-bags', belts: 'y2k-belts',
};

export interface Crumb { label: string; href: string }

/** Breadcrumbs for a product: Home / Women / Y2K Tops / Y2K Baby Tees. */
export function productTrail(p: Product): Crumb[] {
  const dept: DeptId = p.depts.includes('women') ? 'womens' : 'mens';
  const own = getCollection(CATEGORY_COLLECTION[p.category] ?? '');
  const parent = own && COLLECTIONS.find((c) => c.group === own.group && c.parent);
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, { label: getDept(dept)!.label, href: collectionHref('all', dept) }];
  if (parent && parent !== own) trail.push({ label: parent.title, href: collectionHref(parent.slug, dept) });
  if (own) trail.push({ label: own.title, href: collectionHref(own.slug, dept) });
  return trail;
}

// ---------- menus ----------

export interface MenuLink { label: string; href: string; count: number }
export interface MenuGroup { id: GroupId; label: string; href: string; links: MenuLink[] }
export interface MenuDept { id: DeptId; label: string; href: string; groups: MenuGroup[]; cover?: string }
export interface Menu { depts: MenuDept[]; themes: MenuLink[]; fresh: MenuLink[] }

/** First photo of a list, for tiles and menu covers. */
export function coverOf(list: Product[], skip = 0) {
  return list.filter((p) => p.photos?.length).slice(skip)[0]?.photos?.[0]?.src;
}

export function buildMenu(): Menu {
  const depts = DEPTS.map((d) => {
    const groups = GROUPS.map((g) => {
      const cols = COLLECTIONS.filter((c) => c.group === g.id && (d.id === 'womens' || !c.womenOnly));
      const parent = cols.find((c) => c.parent);
      const links = cols.filter((c) => !c.parent).map((c) => ({ label: c.title.replace(/^Y2K /, ''), href: collectionHref(c.slug, d.id), count: productsIn(c, d.id).length }))
        .filter((l) => l.count >= 3);
      return { id: g.id, label: g.label, href: parent ? collectionHref(parent.slug, d.id) : '#', links, count: parent ? productsIn(parent, d.id).length : 0 };
    }).filter((g) => g.count > 0).map(({ count: _c, ...g }) => g);
    const coverPool = productsIn(getCollection(d.id === 'womens' ? 'y2k-baby-tees' : 'y2k-hoodies')!, d.id);
    return { id: d.id, label: d.label, href: collectionHref('all', d.id), groups, cover: coverOf(coverPool, 5) };
  });
  const links = (group: GroupId, min = 6) => COLLECTIONS.filter((c) => c.group === group)
    .map((c) => ({ label: c.title.replace(/^Y2K /, ''), href: collectionHref(c.slug), count: productsIn(c).length }))
    .filter((l) => l.count >= min);
  return { depts, themes: links('themes'), fresh: links('new', 1) };
}

// ---------- old /shop links ----------

const OLD_VIBES: Record<string, string> = {
  y2k: 'all', grunge: 'y2k-grunge', goth: 'y2k-goth', coquette: 'y2k-coquette', 'fairy-grunge': 'y2k-fairy-grunge', 'emo-punk': 'y2k-emo',
  harajuku: 'y2k-harajuku', anime: 'y2k-anime', streetwear: 'y2k-streetwear', rave: 'all', western: 'all',
};
const OLD_EDITS: Record<string, string> = {
  'band-merch': 'y2k-band-merch', brazil: 'y2k-brazil', jerseys: 'y2k-jerseys', 'acid-wash': 'y2k-acid-wash', rhinestone: 'y2k-rhinestone',
  lace: 'y2k-lace', 'leather-jackets': 'y2k-leather-jackets', skulls: 'y2k-skulls', cats: 'all', stripes: 'y2k-stripes',
  'cropped-hoodies': 'y2k-hoodies', 'under-20': 'y2k-under-20', 'meme-tees': 'y2k-graphic-tees',
};
const OLD_LINES: Record<string, string> = {
  tops: 'y2k-tops', knits: 'y2k-hoodies-knits', bottoms: 'y2k-bottoms', dresses: 'y2k-dresses-sets', accessories: 'y2k-accessories',
  lounge: 'y2k-hoodies-knits', stash: 'y2k-accessories', headwear: 'y2k-hats', swim: 'y2k-swimwear', home: 'all',
};
const OLD_CATS: Record<string, string> = {
  ...CATEGORY_COLLECTION, tees: 'y2k-oversized-tees', tanks: 'y2k-tank-tops', sweatpants: 'y2k-sweatpants', socks: 'y2k-legwear',
  accessories: 'y2k-belts', extras: 'all', panties: 'all', lingerie: 'all', pajamas: 'y2k-sets', beanies: 'y2k-hats', 'bucket-hats': 'y2k-hats',
};

/** Where an old /shop/... link goes now. */
export function legacyHref(path: string[] = [], query: Record<string, string | undefined> = {}): string {
  const q = new URLSearchParams(Object.entries(query).filter(([k, v]) => v && k !== 'c') as [string, string][]);
  if (q.has('q')) return `/search?${q}`;
  const tail = q.toString() ? `?${q}` : '';
  const [a, b, c] = path;
  if (!a) return `/collections/all${tail}`;
  if (a === 'new') return `/collections/y2k-new-in${tail}`;
  if (a === 'after-dark') return '/collections/all';
  if (a === 'vibe') return `/collections/${OLD_VIBES[b] ?? 'all'}${tail}`;
  if (a === 'edit') return `/collections/${OLD_EDITS[b] ?? 'all'}${tail}`;
  const dept: DeptId | undefined = a === 'women' ? 'womens' : a === 'men' ? 'mens' : undefined;
  const [line, category] = dept ? [b, c] : [a, b];
  const slug = (category && OLD_CATS[category]) || (line && (OLD_LINES[line] ?? OLD_CATS[line])) || 'all';
  return `${collectionHref(slug, dept)}${tail}`;
}
