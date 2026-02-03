import { createClient } from "@supabase";
import { Database } from "_shared/schema.ts";

export const supabase = createClient<Database>(
    Deno.env.get("SB_URL_TEST")!,
    Deno.env.get("SERVICE")!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
);
