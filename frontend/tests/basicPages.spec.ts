import { test, expect } from '@playwright/test';
test.describe("Test homepage elements", async () => {
  test('Contains header text', async ({ page }) => {
    await page.goto('/');
  
    // Expect a title "to contain" a substring
    const login = await page.getByText("music viz mqp!")
    await expect(login).toBeVisible();
  });
})

