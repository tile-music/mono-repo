import { test, expect } from '@playwright/test';
test.describe("Test login flow", async () => {
    test('Invalid credentials are rejected', async ({ page }) => {
      await page.goto('/login');
    
      await page.getByPlaceholder("email").fill("test@test.com")
      await page.getByPlaceholder("password").fill("testpassword")
      await page.getByText("log in").click()
      
      await expect(page.getByText("invalid login credentials")).toBeVisible();
    });
  })