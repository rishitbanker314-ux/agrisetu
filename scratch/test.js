const { chromium } = require('playwright');

(async () => {
  console.log("Starting smoke test on https://agrisetu-kappa.vercel.app");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(`[Browser Error]: ${msg.text()}`);
  });
  
  // Capture uncaught page errors
  page.on('pageerror', error => {
    console.error(`[Page Error]: ${error.message}`);
  });
  
  // Capture failed requests
  page.on('requestfailed', request => {
    console.error(`[Request Failed]: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    await page.goto('https://agrisetu-kappa.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    console.log("Successfully loaded page.");
    
    // Check if the dashboard rendered
    const title = await page.title();
    console.log("Page title:", title);
    
    // Wait for Leaflet map to render
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    console.log("Map rendered.");
    
    // Check if quick stats loaded (not showing "...")
    await page.waitForTimeout(3000); // Wait for the initial API calls
    const ndviStat = await page.locator('text=NDVI').first().textContent();
    console.log("NDVI Text:", ndviStat);
    
    // Take a screenshot
    await page.screenshot({ path: 'scratch/screenshot.png', fullPage: true });
    console.log("Saved screenshot to scratch/screenshot.png");

  } catch (error) {
    console.error("Smoke test failed:", error);
  } finally {
    await browser.close();
  }
})();
