import { test, expect } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getEmail, registerUser } from "./utils";

import exp from "constants";
import env from "dotenv";
import { get } from "http";

env.config({ path: ".env.local" });

let supabase: SupabaseClient<any, "test", any> | undefined;
const password = "password1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const testName = "Flow";


const fireSpotifyJob = async (userId: string | undefined) => {
  if (!userId) {
    throw Error("userId is undefined");
  }
  await fetch("http://127.0.0.1:3001/add-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    },
    body: JSON.stringify({
      userId: userId,
      refreshToken: process.env.SP_REFRESH,
      type: "spotify"
    })
  })
}

const getUserId = async (userEmail: string) => {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });
    if (error) {
      console.error("Error creating user: ", error.message);
      throw Error("Error creating user: " + error.message);
    } else {
      return data.user?.id;
    }
  }
};

const injectSpotifyCreds = async (userEmail: string) => {
  if (supabase) {
    const userId = await getUserId(userEmail);
    if (userId) {
      const { data, error } = await supabase
        .from("spotify_credentials")
        .insert({ id: userId, refresh_token: process.env.SP_REFRESH });
      if (error) {
        console.error("Error inserting spotify creds: ", error);
        throw Error("Error inserting spotify creds: " + error.message);
      }
    } else {
      throw Error("could not find user");
    }
  }
};

/*const getRandomNumber = () =>  Math.floor(Math.random() * 500) + 1;

const slowType = async (element: any, text: string, page :any) => {
  text.split("").forEach(async (char) => {
    console.log("char", char);
    await element?.focus()
    await element?.evaluate("e => e.setSelectionRange(-1, -1)")
    await element?.type(char);
    await page.waitForTimeout(getRandomNumber()*10);
  })
} */
const userAgentStrings = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.3497.92 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
];

test.describe("Test homepage elements", async () => {
  test("Contains header text", async ({ page, browserName}) => {
    await page.goto("/");
    registerUser(browserName, testName, page, password);
    // Expect a title "to contain" a substring
    const login = await page.getByText("music viz mqp!");
    await expect(login).toBeVisible();
    const register = await page.getByText("register");
    await register?.click();
    await page.waitForURL("**/register");
    /* await injectSpotifyCreds(getEmail(browserName));
    await page.waitForTimeout(5000); */

    await page.waitForURL("**/link-spotify");

    const oneLastThing = await page.getByText("one last thing...");
    await expect(oneLastThing).toBeVisible();
    await injectSpotifyCreds(getEmail(browserName, testName));
    
    await page.reload();
    const spotifyButton = page.getByText("Unlink Spotify Account");
    await expect(spotifyButton).toBeVisible();
    await page.goto("/profile");
    /**for some reason this blocks for like ever... */
    fireSpotifyJob(await getUserId(getEmail(browserName, testName)));
    await page.waitForTimeout(2000);
    console.log("fired job");
    const artDisplay = await page.getByText("art display");
    await artDisplay?.click();
    
    const listeningData = await page.getByText("listening data");
    await listeningData?.click();
    await page.waitForURL("**/listening");
  
    const listeningDataContainer = page.getByText("plays")
    expect(listeningDataContainer).toBeDefined();

    const profile = await page.getByText("profile");
    await profile?.click();
    await page.waitForURL("**/profile");

    /* await page.waitForTimeout(500);
    await page.waitForURL("https://accounts.spotify.com/**");
    const spotifyEmail = await page.$("#login-username");
    await slowType(spotifyEmail, process.env.SPOTIFY_EMAIL as string, page);
    await page.waitForTimeout(getRandomNumber());
    const spotifyPassword = await page.$("#login-password");
    await slowType(spotifyPassword, process.env.SPOTIFY_PASSWORD as string, page);
    await page.waitForTimeout(getRandomNumber()); 
    const spotifyLoginButton = await page.$("#login-button");

    await spotifyLoginButton?.click();
    await page.waitForURL("**fixthis"); */
  });
});

test.beforeAll(async () => {
  console.log(process.env.EXTERNAL_SUPABASE_URL);
  supabase = createClient(
    process.env.EXTERNAL_SUPABASE_URL as string,
    process.env.PUBLIC_SUPABASE_SERVICE_KEY as string
  );

  //userId = userId.data?.id;
});

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
});
