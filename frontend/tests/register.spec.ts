import { test, expect } from '@playwright/test';

test.describe("Test form completeness", async () => {
    test('User must enter email', async ({ page }) => {
        await page.goto('/register');

        await page.getByPlaceholder("password", { exact: true }).fill("Test1Password!");
        await page.getByText("get started").click();

        await expect(page.getByText("please enter an email")).toBeVisible();
    });

    test('User must enter password', async ({ page }) => {
        await page.goto('/register');

        await page.getByPlaceholder("email").fill("test@test.com");
        await page.getByText("get started").click();

        await expect(page.getByText("please enter a password")).toBeVisible();
    });

    test('Passwords must match', async ({ page }) => {
        await page.goto('/register');

        await page.getByPlaceholder("email").fill("test@test.com");
        await page.getByPlaceholder("password", { exact: true }).fill("Test1Password!");
        await page.getByPlaceholder("confirm password").fill("Test2Password!");
        await page.getByText("get started").click();

        await expect(page.getByText("passwords must match")).toBeVisible();
    });
});

test.describe("Test well formed credentials", async () => {
    test('Email must be valid', async ({ page }) => {
        await page.goto('/register');

        await page.getByPlaceholder("email").fill("test");
        await page.getByText("get started").click();
        await expect(page.getByText("please enter a valid email")).toBeVisible();
    });
  
    test('Password must be at least 8 characters', async ({ page }) => {
        await page.goto('/register');

        await page.getByPlaceholder("password", { exact: true }).fill("Test1P!");
        await page.getByText("get started").click();
        
        await expect(page.getByText("password must be at least 8 characters")).toBeVisible();
    });

    test('Password must be 64 characters or less', async ({ page }) => {
        await page.goto('/register');
        
        await page.getByPlaceholder("password", { exact: true }).fill("Test1Password!Test1Password!Test1Password!Test1Password!Test1Password!Test1Password!Test1Password!");
        await page.getByText("get started").click();
        
        await expect(page.getByText("password must be 64 characters or less")).toBeVisible();
    });

    test('Password must contain a number', async ({ page }) => {
        await page.goto('/register');
        
        await page.getByPlaceholder("password", { exact: true }).fill("TestPassword!");
        await page.getByText("get started").click();
        
        await expect(page.getByText("password must contain a number")).toBeVisible();
    });
  });