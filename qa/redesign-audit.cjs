const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.BASE_URL,{waitUntil:'networkidle'});
const sizes=[];
for(const width of [360,390,430,768,1024,1440,1920]){
 await page.setViewportSize({width,height:1000});await page.waitForTimeout(350);
 sizes.push(await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth,heading:document.querySelector('h1').innerText})));
}
await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'./redesign-desktop.png'});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'./redesign-mobile.png'});
await page.locator('#menuToggle').click();const menuOpen=await page.locator('#menuToggle').getAttribute('aria-expanded');await page.keyboard.press('Escape');
await page.locator('#byr-gallery').scrollIntoViewIfNeeded();
await page.locator('[data-filter="Платья"]').click();await page.waitForTimeout(500);
const gallery=await page.locator('.byr-gallery-title').innerText();
await page.locator('#faq details').first().locator('summary').click();const faq=await page.locator('#faq details').first().getAttribute('open');
const links=await page.locator('a[href*="wa.me"]').evaluateAll(links=>links.map(x=>x.href));
await page.locator('#garment').fill('Тестовая модель');await page.locator('#quantity').fill('10');
await page.evaluate(()=>{window.__wa=null;window.open=(url)=>{window.__wa=url;return null}});
await page.locator('#quoteForm button').click();const form=await page.evaluate(()=>window.__wa);
await page.locator('#services').scrollIntoViewIfNeeded();await page.locator('.service-card-toggle').first().click();const serviceOpen=await page.locator('.service-card-toggle').first().getAttribute('aria-expanded');
const report={serviceOpen,sizes,errors,menuOpen,gallery,faqOpen:faq!==null,whatsappLinks:links.length,whatsappAllCorrect:links.every(x=>x.startsWith('https://wa.me/996700551335')),formCorrect:form?.includes('996700551335')&&decodeURIComponent(form).includes('Тестовая модель'),images:await page.locator('img').evaluateAll(a=>a.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src))};
fs.writeFileSync('./redesign-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
await browser.close();
})();
