'use client';

import { useState } from 'react';
import { cmText, normSize, shoeUS, toInch, usHint, type SizeChart } from '@/lib/sizing';

/** The product's own size chart (cm / in), the US equivalent for each size, and how to use it. */
export default function SizeGuide({ chart, sizes, category, oversized }: { chart?: SizeChart; sizes: string[]; category: string; oversized: boolean }) {
  const [unit, setUnit] = useState<'cm' | 'in'>('in');
  const shoes = category === 'shoes';
  const showUS = sizes.some((s) => usHint(s, category, oversized));
  return (
    <div className="size-guide">
      {chart && (
        <>
          <div className="sg-top">
            <span className="sg-title">Measurements of this piece</span>
            <div className="sg-unit" role="group" aria-label="Units">
              <button type="button" className={unit === 'cm' ? 'is-on' : ''} onClick={() => setUnit('cm')}>CM</button>
              <button type="button" className={unit === 'in' ? 'is-on' : ''} onClick={() => setUnit('in')}>IN</button>
            </div>
          </div>
          <div className="sg-scroll">
            <table className="sg-table">
              <thead>
                <tr>
                  <th>Size</th>
                  {showUS && <th>{shoes ? 'US women / men' : 'Fits like US'}</th>}
                  {chart.cols.map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map(([size, ...vals]) => {
                  const us = shoes ? shoeUS(size) : null;
                  return (
                    <tr key={size}>
                      <td>{size}</td>
                      {showUS && <td>{shoes ? (us?.w ? `${us.w} / ${us.m ?? '–'}` : '–') : usHint(size, category, oversized)?.replace('US ', '') ?? '–'}</td>}
                      {vals.map((v, i) => <td key={i}>{unit === 'cm' ? cmText(v) : toInch(v)}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="sg-note">
            {shoes
              ? 'Foot length is heel to longest toe. Measure your foot and pick the size that matches or is slightly longer.'
              : 'These are measurements of the garment itself, not body sizes. For the best fit, lay a piece you own flat, measure it, and compare.'}
          </p>
        </>
      )}
      {!chart && shoes && sizes.some((s) => shoeUS(s).w) && (
        <div className="sg-scroll">
          <table className="sg-table">
            <thead><tr><th>EU</th><th>US women</th><th>US men</th></tr></thead>
            <tbody>{sizes.map((s) => { const u = shoeUS(s); return <tr key={s}><td>{normSize(s)}</td><td>{u.w ?? '–'}</td><td>{u.m ?? '–'}</td></tr>; })}</tbody>
          </table>
        </div>
      )}
      <p className="sg-note">
        {shoes
          ? 'Sizes are EU. Most of our platforms run true to EU size; if you are between sizes, go half a size up.'
          : oversized
            ? 'This piece is cut oversized on purpose, so take your usual size.'
            : 'Asian sizing runs about one size small, so an Asian M fits like a US S. Fitted tops and baby tees are made to be snug: size up once if you are between sizes or want a looser fit.'}
      </p>
    </div>
  );
}
