import { test, expect } from '@playwright/test';
test.describe("Test homepage elements", async () => {
  test('Contains header text', async ({ page }) => {
    await page.goto('/');
  
    const login = await page.getByText("music viz mqp!")
    await expect(login).toBeVisible();
  });
});

test.describe("Test login/register elements", async () => {
  test('Login contains welcome text', async ({ page }) => {
    await page.goto('/login');
  
    const login = await page.getByText("welcome!");
    await expect(login).toBeVisible();
  });

  test('Register contains welcome text', async ({ page }) => {
    await page.goto('/register');
  
    const login = await page.getByText("welcome!");
    await expect(login).toBeVisible();
  });
});

