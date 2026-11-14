export type Category = 'tees' | 'tanks' | 'bikinis';
export type Garment = 'crop' | 'tank' | 'bikini';

export interface Color {
  name: string;
  hex: string;
}

export interface Product {
  slug: string;
  code: string;
  name: string;
  category: Category;
  garment: Garment;
  design: string;
  price: number;
  colors: Color[];
  sizes: string[];
  blurb: string;
  afterDark?: boolean;
  printful: { productId: number; blank: string };
  details: string[];
}

// Printful blank colors, from the Printful catalog API.
const CROP = {
  black: { name: 'Black', hex: '#151515' },
  bubblegum: { name: 'Bubblegum', hex: '#ffc5d4' },
  palePink: { name: 'Pale Pink', hex: '#ffd4c5' },
  white: { name: 'White', hex: '#ffffff' },
};
const TANK = {
  black: { name: 'Black', hex: '#151515' },
  pink: { name: 'Pink', hex: '#ffd7de' },
  white: { name: 'White', hex: '#ffffff' },
};
const PRINT = { name: 'Full print', hex: '#ffffff' };

const CROP_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const TANK_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const BIKINI_SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

const CROP_BLANK = { productId: 636, blank: 'AS Colour 4062 Women’s Crop Tee' };
const TANK_BLANK = { productId: 780, blank: 'Bella+Canvas 1012 Micro-Rib Tank' };
const BIKINI_BLANK = { productId: 667, blank: 'All-Over Print String Bikini' };

const CROP_DETAILS = ['100% combed cotton', 'Relaxed fit, dropped shoulders, cropped length', 'Printed when you order'];
const TANK_DETAILS = ['Micro-rib, 52% Airlume cotton and 48% polyester', 'Thick straps, mid-length cut', 'Printed when you order'];
const BIKINI_DETAILS = ['Recycled polyester with elastane, double layered', 'UPF 50+', 'Tie the straps your way', 'Printed edge to edge, then cut and sewn'];

export const PRODUCTS: Product[] = [
  {
    slug: 'blazed-kitty-logo-crop', code: 'BK-T01', name: 'Blazed Kitty Logo Crop', category: 'tees', garment: 'crop',
    design: 'logo', price: 36, colors: [CROP.black], sizes: CROP_SIZES, printful: CROP_BLANK, details: CROP_DETAILS,
    blurb: 'The pink chrome kitty face, front and center. The one that started it all.',
  },
  {
    slug: 'pet-me-im-high-crop', code: 'BK-T02', name: "Pet Me, I'm High Crop", category: 'tees', garment: 'crop',
    design: 'pet', price: 36, colors: [CROP.black], sizes: CROP_SIZES, printful: CROP_BLANK, details: CROP_DETAILS,
    blurb: 'Curly pink script, a tiny sleepy kitty and a trail of paw prints. Flirty diary energy.',
  },
  {
    slug: 'nine-lives-crop', code: 'BK-T03', name: 'Nine Lives Crop', category: 'tees', garment: 'crop',
    design: 'nine', price: 36, colors: [CROP.black], sizes: CROP_SIZES, printful: CROP_BLANK, details: CROP_DETAILS,
    blurb: 'Nine sleepy kitties, one glowing pink. All of them baked.',
  },
  {
    slug: 'kitty-wants-a-snack-crop', code: 'BK-T04', name: 'Kitty Wants a Snack Crop', category: 'tees', garment: 'crop',
    design: 'snack', price: 36, colors: [CROP.bubblegum, CROP.palePink, CROP.white], sizes: CROP_SIZES, printful: CROP_BLANK, details: CROP_DETAILS,
    blurb: 'A munchies joke with a wink. Read it however you want.',
  },
  {
    slug: 'bad-kitty-club-crop', code: 'BK-T05', name: 'Bad Kitty Club Crop', category: 'tees', garment: 'crop',
    design: 'bad', price: 36, colors: [CROP.bubblegum, CROP.white], sizes: CROP_SIZES, printful: CROP_BLANK, details: CROP_DETAILS,
    blurb: 'The club badge with our winking, tongue-out kitty. Members only.',
  },
  {
    slug: 'purr-puff-pass-crop', code: 'BK-T06', name: 'Purr Puff Pass Crop', category: 'tees', garment: 'crop',
    design: 'purr', price: 36, colors: [CROP.black], sizes: CROP_SIZES, printful: CROP_BLANK, details: CROP_DETAILS,
    blurb: 'Three words stacked in pink with smoke rings floating off the corner.',
  },
  {
    slug: 'streets-and-sheets-tank', code: 'BK-K01', name: 'Streets & Sheets Tank', category: 'tanks', garment: 'tank',
    design: 'streets', price: 34, colors: [TANK.black], sizes: TANK_SIZES, printful: TANK_BLANK, details: TANK_DETAILS, afterDark: true,
    blurb: 'Sativa in the streets, indica in the sheets. You know which one you are.',
  },
  {
    slug: 'high-maintenance-tank', code: 'BK-K02', name: 'High Maintenance Tank', category: 'tanks', garment: 'tank',
    design: 'maint', price: 34, colors: [TANK.pink, TANK.white], sizes: TANK_SIZES, printful: TANK_BLANK, details: TANK_DETAILS,
    blurb: 'High maintenance, low standards. Honest, at least.',
  },
  {
    slug: 'smoke-ears-string-bikini', code: 'BK-B01', name: 'Smoke Ears String Bikini', category: 'bikinis', garment: 'bikini',
    design: 'patEars', price: 64, colors: [PRINT], sizes: BIKINI_SIZES, printful: BIKINI_BLANK, details: BIKINI_DETAILS,
    blurb: 'Tiny smoke-ring kitties in two pinks, scattered over black.',
  },
  {
    slug: 'pink-leopard-string-bikini', code: 'BK-B02', name: 'Pink Leopard String Bikini', category: 'bikinis', garment: 'bikini',
    design: 'patLeopard', price: 64, colors: [PRINT], sizes: BIKINI_SIZES, printful: BIKINI_BLANK, details: BIKINI_DETAILS,
    blurb: 'Hot pink leopard with dark rosettes. Animal print for a bad kitty.',
  },
  {
    slug: 'kitty-faces-string-bikini', code: 'BK-B03', name: 'Kitty Faces String Bikini', category: 'bikinis', garment: 'bikini',
    design: 'patFaces', price: 64, colors: [PRINT], sizes: BIKINI_SIZES, printful: BIKINI_BLANK, details: BIKINI_DETAILS,
    blurb: 'Sleepy kitty faces in plum and hot pink on bubblegum.',
  },
  {
    slug: 'kitty-script-string-bikini', code: 'BK-B04', name: 'Kitty Script String Bikini', category: 'bikinis', garment: 'bikini',
    design: 'script', price: 64, colors: [PRINT], sizes: BIKINI_SIZES, printful: BIKINI_BLANK, details: BIKINI_DETAILS, afterDark: true,
    blurb: 'Pink smoke fading into black, with kitty in script right where it counts.',
  },
];

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: 'tees', label: 'Baby Tees', blurb: 'Cropped, soft and a little rude.' },
  { id: 'tanks', label: 'Tanks', blurb: 'Micro-rib with thick straps.' },
  { id: 'bikinis', label: 'String Bikinis', blurb: 'Printed edge to edge.' },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}
