'use client';

import { useState } from 'react';
import { BODY, BOTTOM_CATS, FOOT_CM, cmText, normSize, shoeUS, toInch, usHint, type SizeChart } from '@/lib/sizing';

/** The product's own size chart (cm / in), the US equivalent for each size, and how to use it. */
export default function SizeGuide({ chart, sizes, category, oversized }: { chart?: SizeChart; sizes: string[]; category: string; oversized: boolean }) {
  const [unit, setUnit] = useState<'cm' | 'in'>('in');
  const shoes = category === 'shoes';
  const showUS = sizes.some((s) => usHint(s, category, oversized));
  const v = (x: string) => (unit === 'cm' ? cmText(x) : toInch(x));
  const bodyRows = shoes ? [] : sizes.map(normSize).filter((s, i, a) => BODY[s] && a.indexOf(s) === i);
  const bottoms = BOTTOM_CATS.has(category);
  const shoeRows = shoes ? sizes.map(normSize).filter((s, i, a) => FOOT_CM[s] && a.indexOf(s) === i) : [];
  const unitToggle = (
    <div className="sg-unit" role="group" aria-label="Units">
      <button type="button" className={unit === 'cm' ? 'is-on' : ''} onClick={() => setUnit('cm')}>CM</button>
      <button type="button" className={unit === 'in' ? 'is-on' : ''} onClick={() => setUnit('in')}>IN</button>
    </div>
  );
  return (
    <div className="size-guide">
      {chart && (
        <>
          <div className="sg-top">
            <span className="sg-title">Measurements of this piece</span>
            {unitToggle}
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
                      {vals.map((x, i) => <td key={i}>{v(x)}</td>)}
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
      {shoeRows.length > 0 && (
        <>
          <div className="sg-top">
            <span className="sg-title">Size conversion</span>
            {!chart && unitToggle}
          </div>
          <div className="sg-scroll">
            <table className="sg-table">
              <thead><tr><th>EU</th><th>US women</th><th>US men</th><th>Foot length</th></tr></thead>
              <tbody>{shoeRows.map((s) => { const u = shoeUS(s); return <tr key={s}><td>{s}</td><td>{u.w ?? '–'}</td><td>{u.m ?? '–'}</td><td>{v(FOOT_CM[s])}</td></tr>; })}</tbody>
            </table>
          </div>
        </>
      )}
      {bodyRows.length > 0 && (
        <>
          <div className="sg-top">
            <span className="sg-title">{chart ? 'Body measurements each size fits' : 'What each size fits (your body)'}</span>
            {!chart && unitToggle}
          </div>
          <div className="sg-scroll">
            <table className="sg-table">
              <thead>
                <tr>
                  <th>Size</th>
                  {!oversized && <th>US</th>}
                  {!bottoms && <th>Bust</th>}
                  <th>Waist</th>
                  <th>Hip</th>
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((s) => (
                  <tr key={s}>
                    <td>{s}</td>
                    {!oversized && <td>{usHint(s, category, false)?.replace('US ', '') ?? '–'}</td>}
                    {!bottoms && <td>{v(BODY[s].bust)}</td>}
                    <td>{v(BODY[s].waist)}</td>
                    <td>{v(BODY[s].hip)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!chart && <p className="sg-note">The seller didn&apos;t give exact measurements for this piece, so these are the standard Asian body sizes it is made for. Measure yourself around the fullest part of your bust and hips and the narrowest part of your waist.</p>}
        </>
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
