import { createClient } from "@supabase";
import { Database } from "_shared/schema.ts";

function getRequiredEnv(name: string): string {
    const value = Deno.env.get(name);
    if (value) return value;
    throw new Error(`${name} environment variable is required for testing`);
}

export const supabase = createClient<Database>(
    getRequiredEnv("SB_URL_TEST"),
    getRequiredEnv("SERVICE"),
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
);
