// Render design HTML files to transparent master PNGs (3000x3600)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{
  const src='/home/user/brand/designs/src', out='/home/user/brand/designs/master';
  fs.mkdirSync(out,{recursive:true});
  const files=(process.argv[2]?process.argv.slice(2):fs.readdirSync(src).filter(f=>f.endsWith('.html')));
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:3000,height:3600},deviceScaleFactor:1});
  for(const f of files){
    await p.goto('file://'+path.join(src,f));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
    await p.locator('.c').screenshot({path:path.join(out,f.replace('.html','.png')),omitBackground:true});
    console.log('rendered',f);
  }
  await b.close();
})();
