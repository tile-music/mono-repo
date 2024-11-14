import { test, expect } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import env from "dotenv";
import { get } from "http";


env.config({ path: ".env.local" });

let supabase: SupabaseClient<any, "test", any> | undefined;
const email = ["test@test.com", "test1@test.com","test2@test.com"];
const password = "password1";

const getEmail = (browserName: string) => {
  switch (browserName) {
    case "chromium":
      return "test1@test.com"
    case "firefox":
      return "test2@test.com"
    case "webkit":
      return "test3@test.com"
    default:
      throw Error("unexpected browser name");
      break;
  }
}

const injectSpotifyCreds = async (email:string) => {
  if(supabase){
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) {
      console.error("Error creating user: ", error.message);
      throw Error("Error creating user: " + error.message);
    } else {
      const userId = data.user?.id;
      if(userId){
        supabase.from("spotify_creds").insert({id: userId, refresh_token: process.env.SP});
      }else{
        throw Error("could not find user");
      }
      }
    }
  }


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
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.3497.92 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
];

test.describe("Test homepage elements", async () => {
  test("Contains header text", async ({ page, browserName,browser }) => {
    
    await page.goto("/");

    // Expect a title "to contain" a substring
    const login = await page.getByText("music viz mqp!");
    await expect(login).toBeVisible();
    const register = await page.$("#content > ul > li:nth-child(3) > a");
    await register?.click();
    await page.waitForURL("**/register");
    const registerEmail = await page.$("#email");
    await registerEmail?.fill(getEmail(browserName));
    const registerPassword = await page.$("#password");
    await registerPassword?.fill(password);
    const registerPasswordConfirm = await page.$("#confirm_password");
    await registerPasswordConfirm?.fill(password);
    const registerButton = await page.$(
      "body > div > div.content.s-gO4E-FEgf6uX > div.right.s-gO4E-FEgf6uX > div > form > fieldset:nth-child(2) > input"
    );
    await registerButton?.click();
    await injectSpotifyCreds(getEmail(browserName));
    await page.waitForURL("**/link-spotify");

    const oneLastThing = await page.getByText("one last thing...");
    await expect(oneLastThing).toBeVisible();
    
    await page.reload();
    await page.waitForTimeout(50000);
    const spotifyButton =  page.getByText("Unlink Spotify Account");
    await expect(spotifyButton).toBeVisible();
    console.log("Spotify button", spotifyButton);
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
    await page.waitForTimeout(50)
    await page.waitForURL("**fixthis"); */
  });
});

test.beforeAll(async () => {

  supabase = createClient(
    process.env.EXTERNAL_SUPABASE_URL as string,
    process.env.PUBLIC_SUPABASE_SERVICE_KEY as string,
    { db: { schema: "test" } }
  );

  //userId = userId.data?.id;
})


test.afterEach(async ({browserName}) => {
  if (supabase) {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: getEmail(browserName),
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
