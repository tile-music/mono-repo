import { test, expect } from "@playwright/test";

test.describe("Test login flow", async () => {
    test("User must enter email", async ({ page }) => {
        await page.goto("/login");

        await page.getByPlaceholder("password").fill("testpassword");
        await page.getByText("log in").click();

        await expect(page.getByText("please enter an email")).toBeVisible();
    });

    test("User must enter password", async ({ page }) => {
        await page.goto("/login");

        await page.getByPlaceholder("email").fill("test@test.com");
        await page.getByText("log in").click();

        await expect(page.getByText("please enter a password")).toBeVisible();
    });

    test("Invalid credentials are rejected", async ({ page }) => {
        await page.goto("/login");

        await page.getByPlaceholder("email").fill("test@test.com");
        await page.getByPlaceholder("password").fill("testpassword");
        await page.getByText("log in").click();

        await expect(page.getByText("invalid credentials")).toBeVisible();
    });
});
