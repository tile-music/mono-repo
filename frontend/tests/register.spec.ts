import { test, expect } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomString } from "./utils";

import env from "dotenv";
env.config({ path: ".env.local" });

test.describe("Test form completeness", async () => {
    test("User must enter email", async ({ page }) => {
        await page.goto("/register");

        await page
            .getByPlaceholder("password", { exact: true })
            .fill("Test1Password!");
        await page.getByText("get started").click();

        await expect(page.getByText("please enter an email")).toBeVisible();
    });

    test("User must enter password", async ({ page }) => {
        await page.goto("/register");

        await page.getByPlaceholder("email").fill("test@test.com");
        await page.getByText("get started").click();

        await expect(page.getByText("please enter a password")).toBeVisible();
    });

    test("Passwords must match", async ({ page }) => {
        await page.goto("/register");

        await page.getByPlaceholder("email").fill("test@test.com");
        await page
            .getByPlaceholder("password", { exact: true })
            .fill("Test1Password!");
        await page.getByPlaceholder("confirm password").fill("Test2Password!");
        await page.getByText("get started").click();

        await expect(page.getByText("passwords must match")).toBeVisible();
    });
});

test.describe("Test well formed credentials", async () => {
    test("Email must be valid", async ({ page }) => {
        await page.goto("/register");

        await page.getByPlaceholder("email").fill("test");
        await page.getByText("get started").click();
        await expect(
            page.getByText("please enter a valid email"),
        ).toBeVisible();
    });

    test("Password must be at least 8 characters", async ({ page }) => {
        await page.goto("/register");

        await page
            .getByPlaceholder("password", { exact: true })
            .fill("Test1P!");
        await page.getByText("get started").click();

        await expect(
            page.getByText("password must be at least 8 characters"),
        ).toBeVisible();
    });

    test("Password must be 64 characters or less", async ({ page }) => {
        await page.goto("/register");

        await page
            .getByPlaceholder("password", { exact: true })
            .fill(
                "Test1Password!Test1Password!Test1Password!Test1Password!Test1Password!Test1Password!Test1Password!",
            );
        await page.getByText("get started").click();

        await expect(
            page.getByText("password must be 64 characters or less"),
        ).toBeVisible();
    });

    test("Password must contain a number", async ({ page }) => {
        await page.goto("/register");

        await page
            .getByPlaceholder("password", { exact: true })
            .fill("TestPassword!");
        await page.getByText("get started").click();

        await expect(
            page.getByText("password must contain a number"),
        ).toBeVisible();
    });
});

test.describe.serial("Test server feedback", async () => {
    let supabaseTest: SupabaseClient, email: string, password: string;

    test.beforeAll(async () => {
        // create client
        supabaseTest = createClient(
            process.env.TEST_SUPABASE_URL as string,
            process.env.PUBLIC_SUPABASE_SERVICE_KEY as string,
            { db: { schema: "public" } },
        );

        email = `test-${randomString(8, "a")}@test.com`;
        password = "A1!" + randomString(13, "aA#!"); // just so it passes complexity reqs.
    });

    test("Valid credentials must result in successful signup", async ({
        page,
    }) => {
        await page.goto("/register");

        await page.getByPlaceholder("email").fill(email);
        await page.getByPlaceholder("password", { exact: true }).fill(password);
        await page.getByPlaceholder("confirm password").fill(password);

        await page.getByText("get started").click();
        await expect(page).toHaveURL(/.*link-spotify/);
    });

    test("Attempting to register with an existing email must be rejected", async ({
        page,
    }) => {
        await page.goto("/register");

        await page.getByPlaceholder("email").fill(email);
        await page.getByPlaceholder("password", { exact: true }).fill(password);
        await page.getByPlaceholder("confirm password").fill(password);

        await page.getByText("get started").click();
        await expect(
            page.getByText("this email is already taken"),
        ).toBeVisible();
    });

    test.afterAll(async () => {
        // sign in with user
        const { data, error: login_error } =
            await supabaseTest.auth.signInWithPassword({
                email,
                password,
            });
        if (login_error) throw login_error;

        // delete user
        const { error: delete_error } =
            await supabaseTest.auth.admin.deleteUser(data.user.id);
        if (delete_error) throw delete_error;
    });
});
