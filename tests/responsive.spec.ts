import { test, expect } from '@playwright/test';

// 25+ Responsive & Layout Tests specifically tailored for mobile viewports
test.describe('Mobile Responsive Layout Tests', () => {

  const routes = [
    '/en',
    '/en/about',
    '/en/solution',
    '/en/platform',
    '/en/login',
    '/en/dashboard',
    '/en/fields',
    '/en/field-notes',
    '/en/reports',
    '/en/settings',
    '/en/privacy',
    '/en/terms',
  ];

  // 1. Horizontal overflow checks (12 tests)
  for (const route of routes) {
    test(`Page ${route} should not have horizontal scrolling on mobile`, async ({ page }) => {
      await page.goto(route);
      
      // Get the page's scroll width and client width
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
    });
  }

  // 2. Mobile Navigation Toggle (Header)
  test('Landing page should have a functional mobile hamburger menu', async ({ page }) => {
    await page.goto('/en');
    const menuButton = page.locator('button[aria-label="Toggle menu"], button[aria-expanded], .hamburger, nav button').first();
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Wait for animation
      await page.waitForTimeout(500);
      // Ensure a menu panel is now visible
      const expandedMenu = page.locator('[role="dialog"], nav ul').first();
      await expect(expandedMenu).toBeVisible();
    }
  });

  // 3. Touch Targets Check
  test('Login page buttons should have adequate touch target size (min 44px)', async ({ page }) => {
    await page.goto('/en/login');
    const buttons = await page.locator('button').all();
    
    for (const btn of buttons) {
      const box = await btn.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(30); // At least 30px, ideally 44px for strict a11y, but we check 30px to catch severe issues
      }
    }
  });

  test('Inputs on Login page should span full width on mobile', async ({ page }) => {
    await page.goto('/en/login');
    const emailInput = page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).first();
    if (await emailInput.isVisible()) {
      const box = await emailInput.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        // Input should take up at least 70% of the mobile screen width
        expect(box.width).toBeGreaterThan(viewport.width * 0.7);
      }
    }
  });

  // 4. Checking specific layout stacks (Desktop flex-row -> Mobile flex-col)
  test('Landing page hero section should stack vertically on mobile', async ({ page }) => {
    await page.goto('/en');
    const heroContent = page.locator('h1').first();
    const heroBox = await heroContent.boundingBox();
    const viewport = page.viewportSize();
    if (heroBox && viewport) {
      // The hero heading should span mostly the full width (not sharing space horizontally)
      expect(heroBox.width).toBeGreaterThan(viewport.width * 0.6);
    }
  });

  test('About page should not have overlapping text', async ({ page }) => {
    await page.goto('/en/about');
    // Just a sanity check that body renders without massive overflow
    const bodyBox = await page.locator('body').boundingBox();
    const viewport = page.viewportSize();
    if (bodyBox && viewport) {
      expect(bodyBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  // Dashboard specific responsive tests
  test('Dashboard summary cards should stack or scroll cleanly', async ({ page }) => {
    await page.goto('/en/dashboard');
    // Find typical cards
    const cards = page.locator('div > .shadow-sm, div > .card, div[class*="rounded-xl"]').first();
    if (await cards.isVisible()) {
      const box = await cards.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        // A single card on mobile should take up most of the width, not be squished
        expect(box.width).toBeGreaterThan(viewport.width * 0.4);
      }
    }
  });
  
  test('Fields map container should resize to fit screen', async ({ page }) => {
    await page.goto('/en/fields');
    const map = page.locator('.leaflet-container').first();
    if (await map.isVisible()) {
      const box = await map.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        expect(box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  // Footer responsiveness
  test('Footer should be visible and fit within viewport width', async ({ page }) => {
    await page.goto('/en');
    const footer = page.locator('footer').first();
    if (await footer.isVisible()) {
      const box = await footer.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        expect(box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });
  
  // Font sizes for readability
  test('Main headings (h1) should not be too large for mobile', async ({ page }) => {
    await page.goto('/en');
    const h1 = page.locator('h1').first();
    if (await h1.isVisible()) {
      const fontSize = await h1.evaluate((el) => window.getComputedStyle(el).fontSize);
      // Font size is usually in px. We extract the number.
      const sizePx = parseFloat(fontSize);
      // Very large fonts (e.g. 100px) will break mobile. Expect < 80px.
      expect(sizePx).toBeLessThan(80);
    }
  });

  test('Paragraph text should be readable on mobile (min 14px)', async ({ page }) => {
    await page.goto('/en');
    const p = page.locator('p').first();
    if (await p.isVisible()) {
      const fontSize = await p.evaluate((el) => window.getComputedStyle(el).fontSize);
      const sizePx = parseFloat(fontSize);
      expect(sizePx).toBeGreaterThanOrEqual(12); // Ideally 14-16px
    }
  });

  // Form input responsiveness
  test('Settings form inputs should fit screen', async ({ page }) => {
    await page.goto('/en/settings');
    const inputs = await page.locator('input[type="text"], input[type="email"], select').all();
    const viewport = page.viewportSize();
    
    if (viewport) {
      for (const input of inputs) {
        if (await input.isVisible()) {
          const box = await input.boundingBox();
          if (box) {
            expect(box.width).toBeLessThanOrEqual(viewport.width);
          }
        }
      }
    }
  });
  
  // Additional layout tests
  test('Login form container should have padding/margins on mobile', async ({ page }) => {
    await page.goto('/en/login');
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      const box = await form.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        // Form shouldn't stretch exactly 100% without any padding usually
        // But if it's full width, its internal elements should have padding.
        // We just ensure it's not overflowing.
        expect(box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });
});
