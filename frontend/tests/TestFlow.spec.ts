
import { test, expect } from '@playwright/test';
import { SupabaseClient } from '@supabase/supabase-js';
import env from 'dotenv';
env.config({path:"../.env.local"});
const email = 'test@test.com'
const password ='password'
test.describe("Test homepage elements", async () => {
  test('Contains header text', async ({ page }) => {
    await page.goto('/');
  
    // Expect a title "to contain" a substring
    const login = await page.getByText("music viz mqp!")
    await expect(login).toBeVisible();
    const register = await page.$('#content > ul > li:nth-child(3) > a');
    await register?.click();
    const registerEmail = await page.$('#email');
    await registerEmail?.fill(email);
    const registerPassword = await page.$('#password');
    await registerPassword?.fill(password);
    const registerPasswordConfirm = await page.$('#confirm_password');
    await registerPasswordConfirm?.fill(password)
    const registerButton = await page.$('body > div > div.content.s-gO4E-FEgf6uX > div.right.s-gO4E-FEgf6uX > div > form > fieldset:nth-child(2) > input');
    await registerButton?.click();
    await page.waitForURL('**/link-spotify');

    const oneLastThing = await page.getByText("one last thing...")
    await expect(oneLastThing).toBeVisible(); 
  });
})

test.beforeEach(async ({ page }) => {
  const supabase = new SupabaseClient(
    process.env.PUBLIC_SUPABASE_URL as string,
    process.env.PUBLIC_SUPABASE_SERVICE_KEY as string,
    { db: { schema: "prod" } }
  );
  await supabase.auth.signInWithPassword({email: email, password: password});
  let userId = await supabase.auth.getUser();
  console.log(userId)
  //userId = userId.data?.id;
  
});

test.afterEach(async ({ page }) => {
  // Code to run after each test
  console.log('After each test');
});
