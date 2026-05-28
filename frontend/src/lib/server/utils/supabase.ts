import { createClient } from "@supabase/supabase-js";

import { env } from "$env/dynamic/private";
import { log } from "$lib/log";

function createSupabaseProdClient() {
    if (!env.SB_URL || !env.SB_ANON_KEY) {
        log(
            0,
            "One of the following required environment variables " +
                "are not defined: SB_URL, SB_ANON_KEY",
        );
    }
    return createClient(env.SB_URL!, env.SB_ANON_KEY!, {
        db: { schema: "prod" },
    });
}

export { createSupabaseProdClient };
