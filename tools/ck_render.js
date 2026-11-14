// One font per design (all lines same font/size/color). Different font per design.
// Size rule: cap height = CAP inches for every design, shrunk only if the block is wider than MAXW.
const {chromium}=require('playwright');const fs=require('fs');
const DPI=300, CAP=0.85, XH=0.58, MAXW=7.6, TOP=1.0;
const D=JSON.parse(fs.readFileSync(process.argv[2]||'/home/user/brand/tools/ck_designs.json'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:3000,height:3600}});
for(const [k,v] of Object.entries(D)){
  const [fam,w,st]=v.font.split('-');
  const css=`@font-face{font-family:F;font-weight:${w};font-style:${st};src:url(file:///home/user/brand/fonts/${v.font}.woff2)}`;
  const mk=(px)=>`<html><head><style>${css}html,body{margin:0;background:transparent}.c{width:3000px;height:3600px;padding-top:${TOP*DPI}px;box-sizing:border-box;text-align:center}
   .t{display:inline-block;font-family:F;font-weight:${w};font-style:${st};font-size:${px}px;line-height:1.08;color:${v.color};white-space:nowrap}</style></head>
   <body><div class=c><div class=t id=t>${(()=>{const L=v.lines.slice();if(v.img){L.splice(v.img.at,0,`<img src="file://${v.img.file}" style="display:block;height:${v.img.h*DPI}px;margin:0 auto ${0.1*DPI}px">`)}return L.join('<br>').replace(/(<img[^>]*>)<br>/g,'$1')})()}</div></div></body></html>`;
  fs.writeFileSync('/home/user/brand/tools/_ck.html',mk(300));await p.goto('file:///home/user/brand/tools/_ck.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
  const m=await p.evaluate(()=>{const c=document.createElement('canvas').getContext('2d');const t=document.getElementById('t');const cs=getComputedStyle(t);
     c.font=`${cs.fontStyle} ${cs.fontWeight} 300px F`;const cap=c.measureText('H').actualBoundingBoxAscent;const xh=c.measureText('x').actualBoundingBoxAscent;return {cap,xh,w:t.getBoundingClientRect().width}});
  const caps=v.lines.join('')===v.lines.join('').toUpperCase(); let px=caps?300*(CAP*DPI)/m.cap:300*(XH*DPI)/m.xh; px*=(v.scale||1); const wAt=m.w*px/300; if(wAt>MAXW*DPI) px*=MAXW*DPI/wAt;
  fs.writeFileSync('/home/user/brand/tools/_ck.html',mk(px));await p.goto('file:///home/user/brand/tools/_ck.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
  await p.locator('.c').screenshot({path:`/home/user/brand/ck/print/${k}.png`,omitBackground:true});
  console.log(k,caps?'CAPS':'lower','cap',(m.cap*px/300/DPI).toFixed(2)+'in','width',(m.w*px/300/DPI).toFixed(2)+'in');
}
await b.close()})();
