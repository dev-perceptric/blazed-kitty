// How the store is organized: lines (Tops, Knits & Layers...), the categories inside them, plus vibes and
// detail tags for browsing and filtering. Blazed Kitty is a women's alt store, so there are no departments.

/** Kept for the hidden Printful catalog, which still lists departments. The store itself is women-only. */
export type Dept = 'women' | 'men';

export type LineId =
  | 'tops' | 'knits' | 'bottoms' | 'dresses' | 'accessories'
  // Lines from the old layout, still used by the hidden Printful catalog.
  | 'lounge' | 'swim' | 'headwear' | 'stash' | 'home';

export type CategoryId =
  // Tops
  | 'baby-tees' | 'crop-tees' | 'long-sleeves' | 'oversized-tees' | 'camis-tanks' | 'halter-tube' | 'corsets-bodysuits' | 'blouses'
  // Knits & layers
  | 'sweaters' | 'cardigans' | 'hoodies' | 'jackets'
  // Bottoms
  | 'skirts' | 'jeans' | 'pants' | 'shorts'
  // Dresses & sets
  | 'dresses' | 'sets'
  // Accessories
  | 'jewelry' | 'legwear' | 'arm-warmers' | 'hair' | 'bags' | 'belts' | 'shoes' | 'extras'
  // Old categories, still used by the hidden Printful catalog.
  | 'tees' | 'tanks' | 'sweatpants' | 'pajamas' | 'panties' | 'bikinis' | 'lingerie' | 'boxers' | 'trunks' | 'hats' | 'beanies'
  | 'bucket-hats' | 'stickers' | 'glassware' | 'socks' | 'tech' | 'accessories' | 'blankets' | 'wall-art' | 'candles' | 'rolling-mats';

export const CDN = 'https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev';

export interface LineDef {
  id: LineId;
  label: string;
  blurb: string;
  /** Which top-level menu tab the line lives under. */
  group: 'clothing' | 'accessories';
}

export const LINES: LineDef[] = [
  { id: 'tops', label: 'Tops', blurb: 'Baby tees, long sleeves and camis. Fitted, cropped and a little rude.', group: 'clothing' },
  { id: 'knits', label: 'Knits & Layers', blurb: 'Sweaters, cardigans and zip-ups for cold nights and loud music.', group: 'clothing' },
  { id: 'bottoms', label: 'Bottoms', blurb: 'Mini skirts, baggy jeans and everything low-rise.', group: 'clothing' },
  { id: 'dresses', label: 'Dresses & Sets', blurb: 'Dresses, matching sets and swim. One piece, whole look.', group: 'clothing' },
  { id: 'accessories', label: 'Accessories', blurb: 'Jewelry, legwear, bags and the little things that finish the fit.', group: 'accessories' },
];

export interface CategoryDef {
  id: CategoryId;
  label: string;
  line: LineId;
  /** Kept so the import scripts can read this file; always women. */
  depts: Dept[];
}

const W: Dept[] = ['women'];

export const CATEGORIES: CategoryDef[] = [
  { id: 'baby-tees', label: 'Baby Tees', line: 'tops', depts: W },
  { id: 'crop-tees', label: 'Crop Tees', line: 'tops', depts: W },
  { id: 'long-sleeves', label: 'Long Sleeve Tees', line: 'tops', depts: W },
  { id: 'oversized-tees', label: 'Oversized & Raglan Tees', line: 'tops', depts: W },
  { id: 'camis-tanks', label: 'Camis & Tanks', line: 'tops', depts: W },
  { id: 'halter-tube', label: 'Halter & Tube Tops', line: 'tops', depts: W },
  { id: 'corsets-bodysuits', label: 'Corsets & Bodysuits', line: 'tops', depts: W },
  { id: 'blouses', label: 'Blouses & Shirts', line: 'tops', depts: W },

  { id: 'sweaters', label: 'Sweaters', line: 'knits', depts: W },
  { id: 'cardigans', label: 'Cardigans & Shrugs', line: 'knits', depts: W },
  { id: 'hoodies', label: 'Hoodies & Zip-Ups', line: 'knits', depts: W },
  { id: 'jackets', label: 'Jackets', line: 'knits', depts: W },

  { id: 'skirts', label: 'Skirts', line: 'bottoms', depts: W },
  { id: 'jeans', label: 'Jeans', line: 'bottoms', depts: W },
  { id: 'pants', label: 'Pants', line: 'bottoms', depts: W },
  { id: 'shorts', label: 'Shorts', line: 'bottoms', depts: W },

  { id: 'dresses', label: 'Dresses', line: 'dresses', depts: W },
  { id: 'sets', label: 'Matching Sets', line: 'dresses', depts: W },
  { id: 'bikinis', label: 'Bikinis & Swim', line: 'dresses', depts: W },

  { id: 'jewelry', label: 'Jewelry', line: 'accessories', depts: W },
  { id: 'legwear', label: 'Socks & Legwear', line: 'accessories', depts: W },
  { id: 'arm-warmers', label: 'Arm Warmers & Gloves', line: 'accessories', depts: W },
  { id: 'hats', label: 'Hats & Beanies', line: 'accessories', depts: W },
  { id: 'hair', label: 'Hair', line: 'accessories', depts: W },
  { id: 'bags', label: 'Bags', line: 'accessories', depts: W },
  { id: 'belts', label: 'Belts, Scarves & More', line: 'accessories', depts: W },
  { id: 'shoes', label: 'Shoes', line: 'accessories', depts: W },
  { id: 'extras', label: 'Extras', line: 'accessories', depts: W },
];

export const getLine = (id: string) => LINES.find((l) => l.id === id);
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);

/** Categories in a line. */
export function categoriesFor(line: LineId) {
  return CATEGORIES.filter((c) => c.line === line);
}

// ---------- vibes (a second way to browse) ----------

export interface VibeDef {
  id: string;
  label: string;
  blurb: string;
  match: RegExp;
}

/** Read from the aesthetic word in each product name ("... Grunge Long Sleeve Tee"). */
export const VIBES: VibeDef[] = [
  { id: 'y2k', label: 'Y2K', blurb: 'Low-rise, rhinestones and 2003 energy.', match: /\bY2K\b/ },
  { id: 'grunge', label: 'Grunge', blurb: 'Faded, layered and a little wrecked.', match: /(?<!Fairy )\bGrunge\b/ },
  { id: 'goth', label: 'Goth', blurb: 'Lace, crosses and everything black.', match: /\bGoth\b/ },
  { id: 'coquette', label: 'Coquette', blurb: 'Bows, ruffles and a sweet face.', match: /\bCoquette\b/ },
  { id: 'fairy-grunge', label: 'Fairy Grunge', blurb: 'Soft, sheer and slightly haunted.', match: /\bFairy Grunge\b/ },
  { id: 'emo-punk', label: 'Emo & Punk', blurb: 'Stripes, studs and eyeliner.', match: /\b(Emo|Punk)\b/ },
  { id: 'harajuku', label: 'Harajuku', blurb: 'Loud, layered and kawaii.', match: /\bHarajuku\b/ },
  { id: 'anime', label: 'Anime', blurb: 'Washed anime and manga tees, hoodies and long sleeves.', match: /#anime\b/ },
];

export const getVibe = (id: string) => VIBES.find((v) => v.id === id);

/** Text vibes match against: the name plus #tags. */
export const vibeText = (p: { name: string; tags?: string[] }) => [p.name, ...(p.tags ?? []).map((t) => `#${t}`)].join(' ');

// ---------- detail tags and filters ----------

export interface TagDef {
  id: string;
  label: string;
  match: RegExp;
}

/** Details read from product names. Used as filters on every shop page. */
export const DETAILS: TagDef[] = [
  { id: 'off-shoulder', label: 'Off Shoulder', match: /off[- ]shoulder|one[- ]shoulder|skew/i },
  { id: 'lace', label: 'Lace', match: /\blace\b/i },
  { id: 'striped', label: 'Striped', match: /strip/i },
  { id: 'rhinestone', label: 'Rhinestone', match: /rhinestone|sequin|diamond|glitter/i },
  { id: 'mesh', label: 'Mesh & Sheer', match: /mesh|sheer|fishnet/i },
  { id: 'layered', label: 'Layered', match: /layered|fake two|two piece/i },
  { id: 'skull', label: 'Skull & Skeleton', match: /skull|skeleton|ribcage|bone/i },
  { id: 'star', label: 'Stars', match: /\bstars?\b/i },
  { id: 'cross', label: 'Crosses', match: /\bcross(es)?\b|rosary/i },
  { id: 'heart', label: 'Hearts', match: /heart/i },
  { id: 'animal', label: 'Cats & Bunnies', match: /\b(cat|cats|kitty|kitten|bunny|bunnies|rabbit)\b/i },
  { id: 'leopard', label: 'Leopard & Animal Print', match: /leopard|cheetah|zebra|snake|cow print/i },
  { id: 'plaid', label: 'Plaid', match: /plaid|tartan|checker/i },
  { id: 'bow', label: 'Bows & Ruffles', match: /\bbows?\b|ruffle|frill/i },
  { id: 'fur', label: 'Faux Fur', match: /\bfur\b|fluffy|plush/i },
  { id: 'wings', label: 'Wings & Angels', match: /wing|angel/i },
];

/** Basic color families, read from each product's color options. */
export const COLOR_FAMILIES: TagDef[] = [
  { id: 'black', label: 'Black', match: /black|charcoal|ink/i },
  { id: 'white', label: 'White', match: /white|ivory|cream|off white/i },
  { id: 'grey', label: 'Grey', match: /gr[ae]y|silver/i },
  { id: 'pink', label: 'Pink', match: /pink|rose|fuchsia|magenta|blush/i },
  { id: 'red', label: 'Red', match: /\bred\b|burgundy|wine|claret|maroon/i },
  { id: 'purple', label: 'Purple', match: /purple|violet|lavender|lilac/i },
  { id: 'blue', label: 'Blue', match: /blue|navy|denim|sky/i },
  { id: 'green', label: 'Green', match: /green|olive|mint|sage/i },
  { id: 'brown', label: 'Brown & Beige', match: /brown|beige|khaki|coffee|apricot|camel|tan\b/i },
  { id: 'yellow', label: 'Yellow & Orange', match: /yellow|orange|gold/i },
];

export const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', 'One Size'];

export const PRICE_RANGES = [
  { id: 'under-20', label: 'Under $20', min: 0, max: 20 },
  { id: '20-30', label: '$20 to $30', min: 20, max: 30 },
  { id: '30-40', label: '$30 to $40', min: 30, max: 40 },
  { id: '40-up', label: '$40 and up', min: 40, max: Infinity },
];
