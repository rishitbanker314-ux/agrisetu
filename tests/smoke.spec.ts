import { test, expect } from '@playwright/test';

// 25+ Smoke Tests to verify core routes and basic rendering
test.describe('Smoke Tests - Core Pages', () => {
  const routes = [
    { path: '/hi', name: 'Landing (Hindi)' },
    { path: '/en', name: 'Landing (English)' },
    { path: '/en/about', name: 'About' },
    { path: '/en/solution', name: 'Solution' },
    { path: '/en/platform', name: 'Platform' },
    { path: '/en/login', name: 'Login' },
    { path: '/en/dashboard', name: 'Dashboard' },
    { path: '/en/fields', name: 'Fields' },
    { path: '/en/field-notes', name: 'Field Notes' },
    { path: '/en/reports', name: 'Reports' },
    { path: '/en/settings', name: 'Settings' },
    { path: '/en/privacy', name: 'Privacy' },
    { path: '/en/terms', name: 'Terms' },
  ];

  // 13 routing smoke tests
  for (const route of routes) {
    test(`Should load ${route.name} page without errors`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page).not.toHaveTitle(/404/);
    });
  }

  // Element existence smoke tests
  test('Landing page should have a hero section', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('About page should render main heading', async ({ page }) => {
    await page.goto('/en/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Solution page should render main heading', async ({ page }) => {
    await page.goto('/en/solution');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Platform page should render main heading', async ({ page }) => {
    await page.goto('/en/platform');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Login page should render Google Auth button', async ({ page }) => {
    await page.goto('/en/login');
    await expect(page.locator('button', { hasText: /continue with google/i })).toBeVisible();
  });

  test('Login page should render Terms checkbox', async ({ page }) => {
    await page.goto('/en/login');
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });

  test('Dashboard should have a sidebar or bottom navigation on mobile', async ({ page }) => {
    await page.goto('/en/dashboard');
    const menuButton = page.locator('button:has(svg.lucide-menu)').first();
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('Dashboard should render main content area', async ({ page }) => {
    await page.goto('/en/dashboard');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Fields page should render a map or list container', async ({ page }) => {
    await page.goto('/en/fields');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Settings page should render form elements', async ({ page }) => {
    await page.goto('/en/settings');
    await expect(page.locator('input, select, button').first()).toBeVisible();
  });

  test('Privacy policy should contain text content', async ({ page }) => {
    await page.goto('/en/privacy');
    await expect(page.locator('body')).toContainText(/privacy/i);
  });

  test('Terms page should contain text content', async ({ page }) => {
    await page.goto('/en/terms');
    await expect(page.locator('body')).toContainText(/terms/i);
  });
});
