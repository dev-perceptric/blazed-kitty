// House type spec: Courier Prime Bold small line + Anton big lines, FIXED sizes for every design.
// Canvas = baby tee print area 10x12 in at 300 dpi (3000x3600).
const {chromium}=require('playwright');
const DPI=300, BIG=2.5*DPI, SMALL=0.46*DPI, GAP=0.12*DPI, LH=0.92;
const D={
 veryhot:{s:'slightly stoned but',b:['VERY','HOT']},
 petme:{s:'i’m high so',b:['PET','ME']},
 hotbaked:{s:'sorry for being so',b:['HOT &','BAKED']},
 mommy:{s:'mommy needs',b:['A JOINT']},
 born:{s:'born to smoke,',b:['FORCED','TO WORK']},
 rumors:{s:'the rumors are true:',b:['I’M','BAKED']},
 lighter:{s:'do not pass me',b:['THE','LIGHTER'],after:'under any circumstances'},
 goodgirl:{s:'who’s a good girl?',b:['ME.','I’M','HIGH.']},
 exgf:{s:'best ex-girlfriend',strike:true,b:['BETTER','SMOKE','BUDDY']},
};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:3000,height:3600}});
for(const [k,v] of Object.entries(D)){
 const big=v.b.map(t=>`<div>${t}</div>`).join('');
 const html=`<html><head><style>
 @font-face{font-family:A;src:url(file:///home/user/brand/fonts/Anton-400-normal.woff2)}
 @font-face{font-family:C;font-weight:700;src:url(file:///home/user/brand/fonts/CourierPrime-700-normal.woff2)}
 html,body{margin:0;background:transparent} .c{width:3000px;height:3600px;display:flex;flex-direction:column;align-items:center;padding-top:${0.4*DPI}px;box-sizing:border-box}
 .s{font-family:C;font-weight:700;font-size:${SMALL}px;letter-spacing:.025em;color:#1A1A1A;white-space:nowrap;${v.strike?'text-decoration:line-through;text-decoration-thickness:.09em;':''}}
 .b{font-family:A;font-size:${BIG}px;line-height:${LH};letter-spacing:.008em;color:#C81E32;text-align:center;margin-top:${GAP}px;white-space:nowrap}
 .a{margin-top:${GAP*1.5}px}</style></head><body><div class=c><div class=s>${v.s}</div><div class=b>${big}</div>${v.after?`<div class="s a">${v.after}</div>`:''}</div></body></html>`;
 require('fs').writeFileSync('/home/user/brand/tools/_s.html',html);await p.goto('file:///home/user/brand/tools/_s.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);
 await p.locator('.c').screenshot({path:`/home/user/brand/house/spec/${k}.png`,omitBackground:true});console.log(k);
}
await b.close()})();
