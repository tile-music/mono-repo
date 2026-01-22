import { SupabaseClient } from "../../deps.ts";
import { Database } from "../../../lib/schema.ts";
export const supabase: SupabaseClient<Database> = new SupabaseClient(
    Deno.env.get("SB_URL_TEST") as string,
    Deno.env.get("SERVICE") as string,
    { db: { schema: "prod" } },
);
