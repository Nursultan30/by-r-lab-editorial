const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const report={sizes:[],errors};
for(const [width,height] of [[360,740],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]]){
 await page.setViewportSize({width,height});await page.goto(process.env.BASE_URL,{waitUntil:'networkidle'});await page.waitForTimeout(350);
 const r=await page.evaluate(()=>{const g=document.querySelector('#portfolio'),first=document.querySelector('.eg-card');const rows=[...document.querySelectorAll('.eg-card')].map(e=>e.getBoundingClientRect());return {width:innerWidth,height:innerHeight,cards:rows.length,foldedHeight:g.offsetHeight,viewportScreens:+(g.offsetHeight/innerHeight).toFixed(2),firstPairSameRow:rows[0].top===rows[1].top,firstCardHeight:Math.round(rows[0].height),wideAfterPair:rows[2].width>rows[0].width,overflow:document.documentElement.scrollWidth>innerWidth,toggleExpanded:document.querySelector('#eg-toggle').getAttribute('aria-expanded')}});
 await page.locator('#eg-toggle').click();await page.waitForTimeout(600);r.expandedCards=await page.locator('[data-eg-product]').count();r.expandedAria=await page.locator('#eg-toggle').getAttribute('aria-expanded');r.topCollapseVisible=await page.locator('#eg-collapse-top').isVisible();r.expandedOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 await page.locator('.eg-media').nth(7).click();r.lightbox=await page.locator('#eg-dialog').evaluate(e=>e.open);await page.keyboard.press('Escape');
 await page.locator('#eg-collapse-top').click();await page.waitForTimeout(700);r.collapsedCards=await page.locator('[data-eg-product]').count();r.returnTop=await page.locator('#portfolio').evaluate(e=>Math.round(e.getBoundingClientRect().top));
 if(width<=600){await page.selectOption('#eg-category-select','couture')}else{await page.locator('[data-eg-filter="couture"]').click()}
 r.oneSampleCards=await page.locator('[data-eg-product]').count();r.smallCategoryToggleHidden=await page.locator('#eg-expand-panel').isHidden();
 if(width<=600){await page.selectOption('#eg-category-select','all')}else{await page.locator('[data-eg-filter="all"]').click()}
 r.filterResetCollapsed=await page.locator('[data-eg-product]').count()===3;
 if(width===390||width===1440){await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#portfolio').screenshot({path:`./compact-${width}.jpg`,type:'jpeg',quality:82});await page.emulateMedia({reducedMotion:'no-preference'})}
 report.sizes.push(r);
}
await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await page.locator('#eg-toggle').click();await page.waitForTimeout(200);await page.locator('#eg-toggle').click();report.reducedMotion={cards:await page.locator('[data-eg-product]').count(),expanded:await page.locator('#eg-toggle').getAttribute('aria-expanded')};
await page.locator('#eg-toggle').focus();await page.keyboard.press('Enter');report.keyboardExpansion=await page.locator('[data-eg-product]').count()===35;
fs.writeFileSync('./compact-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(errors.length||report.sizes.some(r=>r.cards!==3||r.expandedCards!==35||r.collapsedCards!==3||r.overflow||r.expandedOverflow||!r.firstPairSameRow||!r.wideAfterPair||!r.lightbox||!r.smallCategoryToggleHidden||!r.filterResetCollapsed||Math.abs(r.returnTop-(r.width<=800?90:110))>8)||!report.keyboardExpansion)process.exitCode=1;await browser.close();
})();
