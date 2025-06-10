import { SupabaseClient } from "../../deps.ts";

export const supabase: SupabaseClient<any, "test", any>  = new SupabaseClient(
  Deno.env.get("SB_URL_TEST") as string,
  Deno.env.get("SERVICE") as string,
  { db: { schema: "test" } }
);