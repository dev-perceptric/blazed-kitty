// How the store is organized: departments (women, men), product lines, and categories.
// Lines and categories exist before their products do, so the site can show
// "dropping soon" pages and fill in as each drop lands in Printful.

export type Dept = 'women' | 'men';

export type LineId = 'tops' | 'lounge' | 'swim' | 'headwear' | 'stash' | 'home';

export type CategoryId =
  // Tops
  | 'baby-tees' | 'crop-tees' | 'tees' | 'tanks' | 'long-sleeves'
  // Couch Lock lounge
  | 'hoodies' | 'sweatpants' | 'shorts' | 'pajamas'
  // Swim and underwear
  | 'panties' | 'bikinis' | 'boxers' | 'trunks'
  // Headwear
  | 'hats' | 'beanies' | 'bucket-hats'
  // The Stash
  | 'stickers' | 'glassware' | 'bags' | 'socks' | 'tech'
  // Hotbox Home
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
  { id: 'women', label: 'Women', blurb: 'Baby tees, tanks, panties and the rest of the rotation.', image: lineImg('women') },
  { id: 'men', label: 'Men', blurb: 'Tees, hoodies, boxers and hats for the guys who pass it left.', image: lineImg('men') },
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
  { id: 'lounge', label: 'Couch Lock', blurb: 'Hoodies, sweats and PJs for not leaving the couch.', image: lineImg('lounge'), deptImage: { men: lineImg('menlounge') } },
  { id: 'swim', label: 'Swim & Underwear', deptLabel: { women: 'Panties', men: 'Swim & Boxers' }, blurb: 'Printed where it counts.', image: lineImg('swim') },
  { id: 'headwear', label: 'Headwear', blurb: 'Dad hats, beanies and buckets. One size fits most heads.', image: lineImg('headwear') },
  { id: 'stash', label: 'The Stash', blurb: 'Stickers, glasses, bags and socks for the sesh.', image: lineImg('stash'), unisex: true },
  { id: 'home', label: 'Hotbox Home', blurb: 'Blankets, candles and wall art for your spot.', image: lineImg('home'), unisex: true },
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

  { id: 'hoodies', label: 'Hoodies', line: 'lounge', depts: BOTH },
  { id: 'sweatpants', label: 'Sweatpants', line: 'lounge', depts: BOTH },
  { id: 'shorts', label: 'Shorts', line: 'lounge', depts: BOTH },
  { id: 'pajamas', label: 'Pajamas', line: 'lounge', depts: ['women'] },

  { id: 'panties', label: 'Panties', line: 'swim', depts: ['women'] },
  { id: 'bikinis', label: 'Bikinis', line: 'swim', depts: ['women'] },
  { id: 'boxers', label: 'Boxers', line: 'swim', depts: ['men'] },
  { id: 'trunks', label: 'Swim Trunks', line: 'swim', depts: ['men'] },

  { id: 'hats', label: 'Hats', line: 'headwear', depts: BOTH },
  { id: 'beanies', label: 'Beanies', line: 'headwear', depts: BOTH },
  { id: 'bucket-hats', label: 'Bucket Hats', line: 'headwear', depts: BOTH },

  { id: 'stickers', label: 'Stickers', line: 'stash', depts: BOTH },
  { id: 'glassware', label: 'Glassware', line: 'stash', depts: BOTH },
  { id: 'bags', label: 'Stash Bags', line: 'stash', depts: BOTH },
  { id: 'socks', label: 'Socks', line: 'stash', depts: BOTH },
  { id: 'tech', label: 'Tech', line: 'stash', depts: BOTH },

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
