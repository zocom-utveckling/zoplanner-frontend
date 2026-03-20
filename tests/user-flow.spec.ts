import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const timestamp = Date.now();
const TEST_USER = {
  name: 'Test Anvandare',
  email: 'test' + timestamp + '@zoplanner.se',
  username: 'testuser' + timestamp,
  password: 'TestLosen123',
};

test.describe.serial('ZoPlanner - Hela användarflödet', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.alert = () => {};
    });
  });

  test('1. Registrera ny användare som Manager', async ({ page }) => {
    await page.goto(BASE_URL + '/register');
    await page.fill('input[placeholder="Enter your full name"]', TEST_USER.name);
    await page.fill('input[placeholder="Enter your email"]', TEST_USER.email);
    await page.fill('input[placeholder="Choose a username"]', TEST_USER.username);
    const selects = page.locator('select');
    await selects.nth(1).selectOption('MANAGER');
    await page.fill('input[placeholder="Create a password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/home-page/, { timeout: 15000 });
  });

  test('2. Logga in med skapad användare', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.fill('input[placeholder="Enter your username"]', TEST_USER.username);
    await page.fill('input[placeholder="Enter your password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/home-page/, { timeout: 15000 });
  });

  test('3. Se kalender', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.fill('input[placeholder="Enter your username"]', TEST_USER.username);
    await page.fill('input[placeholder="Enter your password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/home-page/, { timeout: 15000 });
    await expect(page.getByText('Mars 2026')).toBeVisible({ timeout: 5000 });
  });

});