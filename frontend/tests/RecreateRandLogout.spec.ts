import { test, expect } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getEmail,registerUser, injectSpotifyCreds } from "./utils";

import exp from "constants";
import env from "dotenv";
import { get } from "http";
import { aw } from "vitest/dist/chunks/reporters.D7Jzd9GS.js";

env.config({ path: ".env.local" });

const testName = "RecreateRandLogout";
test.describe("RecreateRandLogout", () => {
  const supabase = createClient(
    process.env.EXTERNAL_SUPABASE_URL as string,
    process.env.PUBLIC_SUPABASE_SERVICE_KEY as string
  );
  const password = "password1";
  test("RecreateRandLogout", async ({ page, browserName}) => {
    test.setTimeout(500000000);
    await page.goto("/register")
    await registerUser(browserName, testName, page, password)
    await page.waitForURL("**/link-spotify");
    await page.goto("/profile");
    for ( ; ; ){
      const profile = () => page.getByText("profile")
      const listening = () => page.getByText("listening data")
      const display = () => page.getByText("art display")
      listening()?.click()
      await page.waitForURL("**/listening");
      await page.waitForTimeout(Math.random()*30000);
      await profile()?.click();
      await page.waitForURL("**/profile");
      await page.waitForTimeout(Math.random()*30000);
      
    }


  })
  test.afterEach(async ({ browserName }) => {
    if (supabase) {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: getEmail(browserName,testName),
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
  })
})