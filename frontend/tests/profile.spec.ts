import { test, expect, type Page } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomString } from "./utils";

import env from "dotenv";
import path from "path";
env.config({ path: path.resolve(".env.local") });

test.describe.serial("Test profile editing", async () => {
    let supabaseTest: SupabaseClient,
        username: string,
        email: string,
        password: string;
    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        // create client
        supabaseTest = createClient(
            process.env.TEST_SUPABASE_URL as string,
            process.env.PUBLIC_SUPABASE_SERVICE_KEY as string,
            { db: { schema: "public" } },
        );

        username = "test-" + randomString(8, "a");
        email = username + "@test.com";
        password = "A1!" + randomString(13, "aA#!"); // just so it passes complexity reqs.

        page.on("console", (msg) => {
            console.log(msg);
        });
    });

    test("Username must be set upon profile creation", async () => {
        page.goto("/register");
        await page.getByPlaceholder("email").fill(email);
        await page.getByPlaceholder("password", { exact: true }).fill(password);
        await page.getByPlaceholder("confirm password").fill(password);

        await page.getByText("get started").click();
        page.waitForURL(/.*link-spotify/);
        await page.goto("/profile");
        await expect(page.getByLabel("username")).toHaveValue(username);
    });

    test("Successful profile updates must be persistent", async () => {
        page.goto("/profile");

        // generate credentials
        const newUsername = randomString(8, "Aa#!");
        const newName = randomString(5, "Aa#!") + " " + randomString(5, "Aa#!");
        const newWebsite = "www.example.com";

        // const newUsername = "newUsername";
        // const newName = "new name";
        // const newWebsite = "www.example.com";

        // update profile
        await page.getByLabel("username").fill(newUsername);
        await page.getByLabel("full name").fill(newName);
        await page.getByLabel("website").fill(newWebsite);
        await page.getByText("save profile").click();

        // await expect(page.getByText("updated successfully")).toBeVisible();
        await page.reload();

        await expect(page.getByLabel("username")).toHaveValue(newUsername);
        await expect(page.getByLabel("full name")).toHaveValue(newName);
        await expect(page.getByLabel("website")).toHaveValue(newWebsite);
    });

    // test('Profile updates must reject usernames that are too short', async ({ page }) => {
    //     await expect(page.getByText("failed to update profile: username must be at least 3 characters")).toBeVisible();
    // });

    // test('Updates must happen only if profile fields are modified', async ({ page }) => {
    //     await expect(page.getByText("change fields to update profile")).toBeVisible();
    // });

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
