import {SupabaseClient} from "@supabase/supabase-js";
/**
 * Generates a random string of the desired length and complexity. For lowercase alpha
 * characters, include `a` in `chars`. For uppercase alpha, numbers, and special characters,
 * include `A`, `#`, and `!` respectively.
 * 
 * https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
 * 
 * @param length The length of the desired string
 * @param chars The character types desired in the string
 * @returns 
 */
export function randomString(length: number, chars: string) {
    let mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    let result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}
export function getEmail(browserName: string, testName: string) {
    switch (browserName) {
      case "chromium":
        return `${testName}test1@test.com`;
      case "firefox":
        return `${testName}test2@test.com`;
      case "webkit":
        return `${testName}test3@test.com`;
      default:
        throw Error("unexpected browser name");
        break;
    }
  };
  
export async function registerUser(browserName: string, testName: string, page: any, password: string) {
    
    const registerEmail = await page.getByPlaceholder("email");
    await registerEmail?.fill(getEmail(browserName, testName));
    const registerPassword = await page.getByPlaceholder("password", {exact: true});
    await registerPassword?.fill(password);
    const registerPasswordConfirm = await page.getByPlaceholder("confirm password");
    await registerPasswordConfirm?.fill(password);
    const registerButton = await page.getByText("get started");
    await registerButton?.click();

  }

  export const injectSpotifyCreds = async (userEmail: string, password:string, supabase: SupabaseClient<any, "test" ,any>) => {
    if (supabase) {
      const userId = await getUserId(userEmail, password, supabase);
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

  export const getUserId = async (userEmail: string, password: string, supabase: SupabaseClient<any, "public"|"test"|"prod">) => {
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
  