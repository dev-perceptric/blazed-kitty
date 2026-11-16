// How the store is organized: departments (women, men), product lines, and categories.
// Lines and categories exist before their products do, so the site can show
// "dropping soon" pages and fill in as each drop lands in Printful.

export type Dept = 'women' | 'men';

export type LineId = 'tops' | 'bottoms' | 'lounge' | 'swim' | 'headwear' | 'stash' | 'home';

export type CategoryId =
  // Tops
  | 'baby-tees' | 'crop-tees' | 'tees' | 'tanks' | 'long-sleeves'
  // Dresses & bottoms
  | 'dresses' | 'skirts' | 'pants'
  // Layers (lounge)
  | 'hoodies' | 'sweatpants' | 'shorts' | 'pajamas'
  // Swim and underwear
  | 'panties' | 'bikinis' | 'lingerie' | 'boxers' | 'trunks'
  // Headwear
  | 'hats' | 'beanies' | 'bucket-hats'
  // Extras (stash)
  | 'stickers' | 'glassware' | 'bags' | 'socks' | 'tech' | 'jewelry' | 'accessories' | 'shoes'
  // Room (home)
  | 'blankets' | 'wall-art' | 'candles' | 'rolling-mats';

export const CDN = 'https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev';
const lineImg = (name: string) => `${CDN}/site/web/lines/${name}.jpg`;

export interface DeptDef {
  id: Dept;
  label: string;
  blurb: string;
  image: string;
}

export const DEPTS: DeptDef[] = [
  { id: 'women', label: 'Women', blurb: 'Baby tees, goth tops, grunge layers and everything in between.', image: lineImg('women') },
  { id: 'men', label: 'Men', blurb: 'Dark tees, hoodies and layers. More landing soon.', image: lineImg('men') },
];

export interface LineDef {
  id: LineId;
  label: string;
  /** Label override per department, e.g. "Swim & Panties" vs "Swim & Boxers". */
  deptLabel?: Partial<Record<Dept, string>>;
  blurb: string;
  image: string;
  deptImage?: Partial<Record<Dept, string>>;
  /** Unisex lines (Stash, Home) get their own spot in the main menu. */
  unisex?: boolean;
}

export const LINES: LineDef[] = [
  { id: 'tops', label: 'Tops', blurb: 'Fitted, cropped and a little rude.', image: lineImg('women'), deptImage: { men: lineImg('men') } },
  { id: 'bottoms', label: 'Dresses & Bottoms', deptLabel: { men: 'Pants' }, blurb: 'Mini skirts, slip dresses and baggy jeans.', image: lineImg('women'), deptImage: { men: lineImg('men') } },
  { id: 'lounge', label: 'Layers', blurb: 'Zip-ups, fur trim and cardigans for cold nights out.', image: lineImg('lounge'), deptImage: { men: lineImg('menlounge') } },
  { id: 'swim', label: 'Swim & Underwear', deptLabel: { women: 'Panties', men: 'Swim & Boxers' }, blurb: 'Bikinis, lingerie and the little things underneath.', image: lineImg('swim') },
  { id: 'headwear', label: 'Headwear', blurb: 'Beanies, caps and buckets to finish the fit.', image: lineImg('headwear') },
  { id: 'stash', label: 'Extras', blurb: 'Jewelry, bags, shoes and odd little extras.', image: lineImg('stash'), unisex: true },
  { id: 'home', label: 'Room', blurb: 'Decor for a room that matches your playlist.', image: lineImg('home'), unisex: true },
];

export interface CategoryDef {
  id: CategoryId;
  label: string;
  line: LineId;
  /** Departments that list this category in their menu. */
  depts: Dept[];
}

const BOTH: Dept[] = ['women', 'men'];

export const CATEGORIES: CategoryDef[] = [
  { id: 'baby-tees', label: 'Baby Tees', line: 'tops', depts: ['women'] },
  { id: 'crop-tees', label: 'Crop Tees', line: 'tops', depts: ['women'] },
  { id: 'tees', label: 'Tees', line: 'tops', depts: ['men'] },
  { id: 'tanks', label: 'Tanks', line: 'tops', depts: BOTH },
  { id: 'long-sleeves', label: 'Long Sleeves', line: 'tops', depts: BOTH },

  { id: 'dresses', label: 'Dresses & Sets', line: 'bottoms', depts: ['women'] },
  { id: 'skirts', label: 'Skirts', line: 'bottoms', depts: ['women'] },
  { id: 'pants', label: 'Pants & Jeans', line: 'bottoms', depts: BOTH },

  { id: 'hoodies', label: 'Hoodies', line: 'lounge', depts: BOTH },
  { id: 'sweatpants', label: 'Sweatpants', line: 'lounge', depts: BOTH },
  { id: 'shorts', label: 'Shorts', line: 'lounge', depts: BOTH },
  { id: 'pajamas', label: 'Pajamas', line: 'lounge', depts: ['women'] },

  { id: 'panties', label: 'Panties', line: 'swim', depts: ['women'] },
  { id: 'bikinis', label: 'Bikinis', line: 'swim', depts: ['women'] },
  { id: 'lingerie', label: 'Lingerie', line: 'swim', depts: ['women'] },
  { id: 'boxers', label: 'Boxers', line: 'swim', depts: ['men'] },
  { id: 'trunks', label: 'Swim Trunks', line: 'swim', depts: ['men'] },

  { id: 'hats', label: 'Hats', line: 'headwear', depts: BOTH },
  { id: 'beanies', label: 'Beanies', line: 'headwear', depts: BOTH },
  { id: 'bucket-hats', label: 'Bucket Hats', line: 'headwear', depts: BOTH },

  { id: 'stickers', label: 'Stickers', line: 'stash', depts: BOTH },
  { id: 'glassware', label: 'Glassware', line: 'stash', depts: BOTH },
  { id: 'bags', label: 'Bags', line: 'stash', depts: BOTH },
  { id: 'socks', label: 'Socks', line: 'stash', depts: BOTH },
  { id: 'tech', label: 'Tech', line: 'stash', depts: BOTH },
  { id: 'jewelry', label: 'Jewelry', line: 'stash', depts: BOTH },
  { id: 'accessories', label: 'Accessories', line: 'stash', depts: BOTH },
  { id: 'shoes', label: 'Shoes', line: 'stash', depts: BOTH },

  { id: 'blankets', label: 'Blankets', line: 'home', depts: BOTH },
  { id: 'wall-art', label: 'Wall Art', line: 'home', depts: BOTH },
  { id: 'candles', label: 'Candles', line: 'home', depts: BOTH },
  { id: 'rolling-mats', label: 'Rolling Mats', line: 'home', depts: BOTH },
];

export const getDept = (id: string) => DEPTS.find((d) => d.id === id);
export const getLine = (id: string) => LINES.find((l) => l.id === id);
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);

export function lineLabel(line: LineDef, dept?: Dept) {
  return (dept && line.deptLabel?.[dept]) || line.label;
}

export function lineImage(line: LineDef, dept?: Dept) {
  return (dept && line.deptImage?.[dept]) || line.image;
}

/** Categories in a line, narrowed to one department when given. */
export function categoriesFor(line: LineId, dept?: Dept) {
  return CATEGORIES.filter((c) => c.line === line && (!dept || c.depts.includes(dept)));
}

/** Lines shown under a department in the menu (unisex lines live at the top level). */
export function linesFor(dept: Dept) {
  return LINES.filter((l) => !l.unisex && categoriesFor(l.id, dept).length > 0);
}
