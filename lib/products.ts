export type Category = 'tees' | 'tanks' | 'panties';
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
  drop: string;
  price: number;
  colors: Color[];
  sizes: string[];
  blurb: string;
  afterDark?: boolean;
  printful: { productId: number; syncProductId: number; blank: string };
  details: string[];
}

// Generated from the Printful store (Blazed Kitty) by build_catalog.py on the brand-assets branch.
export const PRODUCTS: Product[] = [
  {"slug": "in-a-situationship-with-my-grinder-crop-tee", "code": "BK-T01", "name": "In a Situationship With My Grinder Crop Tee", "category": "tees", "garment": "crop", "design": "situationship", "drop": "drop2", "price": 36, "colors": [{"name": "Light Washed Denim", "hex": "#dde9f3"}, {"name": "Vintage White", "hex": "#f9f6f2"}], "sizes": ["S", "M", "L", "XL", "2XL"], "blurb": "Committed to one thing only: the grinder.", "printful": {"productId": 1579, "syncProductId": 493772681, "blank": "Bella+Canvas 6882GD Garment Dye Cropped Tee"}, "details": ["100% ring-spun cotton, heavyweight and garment-dyed", "Cropped, boxy fit with oversized sleeves", "Printed when you order"]},
  {"slug": "too-hot-to-be-sober-rib-tank", "code": "BK-K01", "name": "Too Hot to Be Sober Rib Tank", "category": "tanks", "garment": "tank", "design": "toohot", "drop": "drop2", "price": 34, "colors": [{"name": "Athletic Heather", "hex": "#9e9e9e"}, {"name": "Solid Baby Blue Blend", "hex": "#c3dbf0"}, {"name": "Solid Pink Blend", "hex": "#ffd7de"}, {"name": "Solid White Blend", "hex": "#ffffff"}], "sizes": ["XS", "S", "M", "L", "XL", "2XL"], "blurb": "Sobriety was never her color.", "printful": {"productId": 780, "syncProductId": 493772701, "blank": "Bella+Canvas 1012 Micro-Rib Tank"}, "details": ["Micro-rib, 52% Airlume cotton and 48% polyester", "Thick straps, scoop neck, mid-length cut", "Printed when you order"]},
  {"slug": "pet-me-harder-string-bottom", "code": "BK-P01", "name": "Pet Me Harder String Bottom", "category": "panties", "garment": "bikini", "design": "petmeharder", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "For the girls who like it a little rougher.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772706, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "lick-me-im-sticky-string-bottom", "code": "BK-P02", "name": "Lick Me, I’m Sticky String Bottom", "category": "panties", "garment": "bikini", "design": "lickme", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "Sticky situation, fully intended.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772714, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "come-get-this-kitty-string-bottom", "code": "BK-P03", "name": "Come Get This Kitty String Bottom", "category": "panties", "garment": "bikini", "design": "comegetkitty", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "An invitation, printed where it counts.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772724, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "eat-my-munchies-string-bottom", "code": "BK-P04", "name": "Eat My Munchies String Bottom", "category": "panties", "garment": "bikini", "design": "munchies", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "The munchies hit different.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772730, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "good-girls-smoke-too-string-bottom", "code": "BK-P05", "name": "Good Girls Smoke Too String Bottom", "category": "panties", "garment": "bikini", "design": "goodgirls", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "Good girls smoke too. Ask around.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772750, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "wet-like-a-bong-string-bottom", "code": "BK-P06", "name": "Wet Like a Bong String Bottom", "category": "panties", "garment": "bikini", "design": "wetbong", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "Wet like a bong. You heard it here.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772753, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "roll-it-lick-it-light-it-string-bottom", "code": "BK-P07", "name": "Roll It, Lick It, Light It String Bottom", "category": "panties", "garment": "bikini", "design": "rollit", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "Three steps. She knows them by heart.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772929, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "ride-the-high-string-bottom", "code": "BK-P08", "name": "Ride The High String Bottom", "category": "panties", "garment": "bikini", "design": "ridehigh", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "Saddle up.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772937, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "kitty-is-hungry-string-bottom", "code": "BK-P09", "name": "Kitty Is Hungry String Bottom", "category": "panties", "garment": "bikini", "design": "kittyhungry", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "Feed the kitty.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772945, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
  {"slug": "bad-kitty-needs-a-spanking-string-bottom", "code": "BK-P10", "name": "Bad Kitty Needs a Spanking String Bottom", "category": "panties", "garment": "bikini", "design": "spanking", "drop": "drop2", "price": 30, "colors": [{"name": "Full print", "hex": "#ffffff"}], "sizes": ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"], "blurb": "Bad kitty. You know what to do.", "afterDark": true, "printful": {"productId": 669, "syncProductId": 493772965, "blank": "All-Over Print Recycled String Bottom"}, "details": ["Soft stretchy polyester and elastane, UPF 50+", "String sides you tie your way", "Printed edge to edge, then cut and sewn"]},
];

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: 'tees', label: 'Baby Tees', blurb: 'Fitted, cropped and a little rude.' },
  { id: 'tanks', label: 'Tanks', blurb: 'Micro-rib with thick straps.' },
  { id: 'panties', label: 'Panties', blurb: 'String bottoms, printed where it counts.' },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(n: number) {
  return '$' + n.toFixed(2);
}
