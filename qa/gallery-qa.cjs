const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[],failed=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).hostname==='127.0.0.1')failed.push({url:r.url(),status:r.status()})});
await page.goto(process.env.BASE_URL,{waitUntil:'networkidle'});await page.waitForTimeout(1400);
const report={sectionOrder:await page.locator('main > section').evaluateAll(a=>a.map(x=>x.id)),initialCards:await page.locator('[data-eg-product]').count(),filters:[],sizes:[],errors,failed};
for(const width of [360,390,430,768,1024,1440,1920]){
 await page.setViewportSize({width,height:1000});
 report.sizes.push(await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth,headingOverflow:[...document.querySelectorAll('h1,h2,h3')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.right>innerWidth+1}).map(x=>x.textContent),rulers:document.querySelectorAll('.measure-ruler').length})));
}
await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo({top:document.querySelector('#portfolio').offsetTop-100,behavior:'instant'}));await page.waitForTimeout(1200);await page.screenshot({path:'./gallery-desktop-heading.jpg',type:'jpeg',quality:80});
const media=page.locator('[data-eg-product] .eg-media');
await media.first().scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:'./gallery-desktop-pair.jpg',type:'jpeg',quality:80});
await page.locator('[data-eg-product]').nth(2).scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:'./gallery-desktop-wide.jpg',type:'jpeg',quality:80});
await page.locator('[data-eg-product] .eg-media').first().click();report.modalOpen=await page.locator('#eg-dialog').evaluate(el=>el.open);report.modalFullViewport=await page.locator('#eg-dialog').evaluate(el=>({width:el.clientWidth,height:el.clientHeight,viewportWidth:innerWidth,viewportHeight:innerHeight}));
const initial=await page.locator('#eg-detail-image').getAttribute('src');await page.keyboard.press('ArrowRight');report.modalNext=initial!==await page.locator('#eg-detail-image').getAttribute('src');report.originalAvailable=await page.locator('#eg-photo-kind').innerText();await page.waitForTimeout(500);await page.screenshot({path:'./gallery-desktop-lightbox.jpg',type:'jpeg',quality:80});await page.keyboard.press('Escape');report.modalClosed=await page.locator('#eg-dialog').evaluate(el=>!el.open);report.focusReturned=await page.locator('[data-eg-product] .eg-media').first().evaluate(el=>el===document.activeElement);
for(const category of ['tailoring','dresses','shirts','couture','casual','corporate','all']){
 await page.locator(`[data-eg-filter="${category}"]`).click();
 report.filters.push({category,total:await page.locator('[data-eg-product]').count(),matching:await page.evaluate(cat=>[...document.querySelectorAll('[data-eg-product]')].every(el=>cat==='all'||window.BYRLAB_GALLERY.find(i=>i.id===el.dataset.egProduct)?.category===cat),category)});
}
report.pendingSwatches=await page.locator('#portfolio [data-eg-variant]').count();
report.firstLayout=await page.locator('.eg-card').evaluateAll(a=>a.slice(0,3).map(x=>({id:x.dataset.egProduct,x:x.getBoundingClientRect().x,y:x.getBoundingClientRect().y,width:x.getBoundingClientRect().width,wide:x.classList.contains('eg-card--wide')})));
report.galleryCTA=await page.locator('.eg-inquiry a').getAttribute('href');
// Verify every referenced source, including images reached only through the lightbox.
report.mediaResources=await page.evaluate(async()=>{
 const urls=new Set();window.BYRLAB_GALLERY.forEach(x=>x.variants.forEach(v=>{[v.image,v.original_image,v.editorial_image,...(v.detail_images||[])].filter(Boolean).forEach(p=>urls.add(p))}));let broken=[];for(const url of urls){const r=await fetch(url,{method:'HEAD'});if(!r.ok)broken.push({url,status:r.status})}return {total:urls.size,broken};
});
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:document.querySelector('#portfolio').offsetTop-80,behavior:'instant'}));await page.waitForTimeout(500);await page.screenshot({path:'./gallery-mobile-heading.jpg',type:'jpeg',quality:80});await page.locator('.eg-media').first().scrollIntoViewIfNeeded();await page.screenshot({path:'./gallery-mobile-card.jpg',type:'jpeg',quality:80});await page.locator('.eg-media').first().click();await page.waitForTimeout(500);await page.screenshot({path:'./gallery-mobile-lightbox.jpg',type:'jpeg',quality:80});await page.keyboard.press('Escape');
await page.locator('#menuToggle').click();report.menuOpens=await page.locator('#menuToggle').getAttribute('aria-expanded');await page.keyboard.press('Escape');
await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});report.reducedMotion=await page.locator('.eg-media').first().evaluate(el=>({opacity:getComputedStyle(el).opacity,clip:getComputedStyle(el).clipPath,runningAnimations:el.getAnimations().length}));
fs.writeFileSync('./gallery-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(errors.length||failed.length||report.sizes.some(x=>x.overflow||x.headingOverflow.length)||report.mediaResources.broken.length||!report.modalOpen||!report.modalClosed||!report.modalNext)process.exitCode=1;await browser.close();
})();
