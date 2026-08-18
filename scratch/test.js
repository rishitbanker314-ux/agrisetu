const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('FAILED REQUEST:', response.url(), response.status());
    }
  });

  console.log('Navigating to site...');
  await page.goto('https://agrisetu-kappa.vercel.app', { waitUntil: 'networkidle' });
  console.log('Site loaded. Taking screenshot...');
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
  console.log('Done.');
})();
