const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});let errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.argv[2],{waitUntil:'networkidle'});
const qa={screens:[],allCategories:[],errors};
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 await page.setViewportSize({width,height});
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1200);
 await page.screenshot({type:'jpeg',quality:75,path:`./${name}-hero.jpg`});
 for(const id of ['portfolio','services','process','brief']){
  await page.evaluate(id=>scrollTo({top:document.getElementById(id).offsetTop-100,behavior:'instant'}),id);await page.waitForTimeout(1200);
  const h=await page.locator('#'+id+' h2').boundingBox();
  qa.screens.push({screen:name,section:id,headingFits:!!h&&h.x>=0&&h.x+h.width<=width});
  await page.screenshot({type:'jpeg',quality:75,path:`./${name}-${id}.jpg`});
 }
}
await page.locator('#byr-gallery').scrollIntoViewIfNeeded();
for(const name of ['Все','Пиджаки','Платья','Верхняя одежда','Трикотаж','Костюмы']){
 await page.locator(`[data-filter="${name}"]`).click();await page.waitForTimeout(600);
 qa.allCategories.push({name,total:await page.locator('.byr-gallery-total').innerText(),broken:await page.locator('.byr-gallery-deck img').evaluateAll(a=>a.some(i=>i.complete&&!i.naturalWidth))});
}
for(const width of [360,390,430,768,1024,1440,1920]){
 await page.setViewportSize({width,height:900});
 const overflow=await page.evaluate(()=>Array.from(document.querySelectorAll('h1,h2,h3')).filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.x+r.width>innerWidth+1}).map(e=>e.textContent));
 qa['headings_'+width]=overflow;
}
await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});
await page.locator('[data-filter="Все"]').click();
await page.locator('#byr-gallery').scrollIntoViewIfNeeded();
qa.lastImage=[];
for(let i=0;i<5;i++){await page.locator('.byr-gallery-arrow--next').click();await page.waitForTimeout(100);qa.lastImage.push(await page.locator('.byr-gallery-title').innerText())}
qa.reducedMotion=await page.evaluate(()=>({heroVisible:getComputedStyle(document.querySelector('h1')).opacity,customCursor:getComputedStyle(document.querySelector('#cursor')).display,animatedElements:document.getAnimations().filter(a=>a.playState==='running').length}));
fs.writeFileSync('./visual-qa.json',JSON.stringify(qa,null,2));console.log(JSON.stringify(qa,null,2));
await browser.close();
})();
