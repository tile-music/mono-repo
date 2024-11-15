import { test, expect } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import env from "dotenv";
import type { an } from "vitest/dist/chunks/reporters.WnPwkmgA.js";

env.config({ path: ".env.local" });

let supabase: SupabaseClient<any, "test", any> | undefined;
const email = "test@test.com";
const password = "password1";
test.describe("Test homepage elements", async () => {
  test("Contains header text", async ({ page }) => {
    await page.goto("/");

    // Expect a title "to contain" a substring
    const login = await page.getByText("music viz mqp!");
    await expect(login).toBeVisible();
    const register = await page.$("#content > ul > li:nth-child(3) > a");
    await register?.click();
    const registerEmail = await page.$("#email");
    await registerEmail?.fill(email);
    const registerPassword = await page.$("#password");
    await registerPassword?.fill(password);
    const registerPasswordConfirm = await page.$("#confirm_password");
    await registerPasswordConfirm?.fill(password);
    const registerButton = await page.$(
      "body > div > div.content.s-gO4E-FEgf6uX > div.right.s-gO4E-FEgf6uX > div > form > fieldset:nth-child(2) > input"
    );
    await registerButton?.click();
    await page.waitForURL("**/link-spotify");

    const oneLastThing = await page.getByText("one last thing...");
    await expect(oneLastThing).toBeVisible();
  });
});

test.beforeAll(async () => {
  console.log("supabse", process.env.EXTERNAL_SUPABASE_URL);
  supabase = createClient(
    process.env.EXTERNAL_SUPABASE_URL as string,
    process.env.PUBLIC_SUPABASE_SERVICE_KEY as string,
    { db: { schema: "test" } }
  );

  //userId = userId.data?.id;
});

test.afterAll(async () => {
  if (supabase) {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error creating user:", error.message);
    } else {
      const userId = data.user?.id;
      if (userId) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          userId
        );
        if (deleteError) {
          console.error("Error deleting user:", deleteError.message);
        } else {
          console.log("User deleted successfully");
        }
      }
    }
    // Code to run after each test
    console.log("After each test");
  }
});
