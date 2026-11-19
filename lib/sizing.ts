// Size help shown on product pages: Asian → US letter sizes and EU → US shoe sizes. Client-safe (no catalog imports).

export interface SizeChart { cols: string[]; rows: string[][]; src: string; countries?: Record<string, Record<string, string>> }

const ASIAN_TO_US: Record<string, string> = {
  XXS: 'XXS', XS: 'XXS', S: 'XS', M: 'S', L: 'M', XL: 'L', '2XL': 'XL', '3XL': '2XL', '4XL': '3XL', '5XL': '4XL', '6XL': '5XL',
};
const EU_TO_US_W: Record<string, string> = { '34': '4', '35': '5', '36': '6', '37': '6.5', '38': '7.5', '39': '8.5', '40': '9', '41': '10', '42': '10.5', '43': '11.5', '44': '12', '45': '13', '46': '14' };
const EU_TO_US_M: Record<string, string> = { '38': '5.5', '39': '6.5', '40': '7', '41': '8', '42': '8.5', '43': '9.5', '44': '10.5', '45': '11', '46': '12', '47': '13' };

export const normSize = (s: string) => {
  const t = s.replace(/[（(].*?[)）]/g, '').trim().toUpperCase().replace('ASIAN ', '');
  return ({ XXL: '2XL', XXXL: '3XL', XXXXL: '4XL' } as Record<string, string>)[t] ?? t;
};

/** Short US hint under a size button ("US S", "US W 7.5"), or null when it doesn't apply. */
export function usHint(size: string, category: string, oversized: boolean): string | null {
  const s = normSize(size);
  if (category === 'shoes') return EU_TO_US_W[s] ? `US W ${EU_TO_US_W[s]}` : null;
  if (oversized) return null; // cut big on purpose: take your usual size
  return ASIAN_TO_US[s] ? `US ${ASIAN_TO_US[s]}` : null;
}

export function shoeUS(eu: string) {
  const s = normSize(eu);
  return { w: EU_TO_US_W[s], m: EU_TO_US_M[s] };
}

export const toInch = (v: string) => v.split('-').map((x) => (Number(x) / 2.54).toFixed(1)).join('–');
export const cmText = (v: string) => v.replace('-', '–');

/** Body measurements each standard Asian size fits (cm). Used on every size guide so S/M/L always mean something. */
export const BODY: Record<string, { bust: string; waist: string; hip: string }> = {
  XXS: { bust: '72-76', waist: '54-58', hip: '78-82' },
  XS: { bust: '76-80', waist: '58-62', hip: '82-86' },
  S: { bust: '80-84', waist: '62-66', hip: '86-90' },
  M: { bust: '84-88', waist: '66-70', hip: '90-94' },
  L: { bust: '88-92', waist: '70-74', hip: '94-98' },
  XL: { bust: '92-96', waist: '74-78', hip: '98-102' },
  '2XL': { bust: '96-100', waist: '78-82', hip: '102-106' },
  '3XL': { bust: '100-104', waist: '82-86', hip: '106-110' },
  '4XL': { bust: '104-110', waist: '86-92', hip: '110-116' },
  '5XL': { bust: '110-116', waist: '92-98', hip: '116-122' },
};
/** Foot length (cm) for EU shoe sizes. */
export const FOOT_CM: Record<string, string> = { '34': '21.5', '35': '22.5', '36': '23', '37': '23.5', '38': '24', '39': '24.5', '40': '25', '41': '25.5', '42': '26', '43': '26.5', '44': '27', '45': '27.5', '46': '28' };
export const BOTTOM_CATS = new Set(['jeans', 'pants', 'shorts', 'skirts']);
