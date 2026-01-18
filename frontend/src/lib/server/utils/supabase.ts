import { createClient } from "@supabase/supabase-js";

import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";

function createSupabaseProdClient() {
    return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        db: { schema: "prod" },
    });
}

export { createSupabaseProdClient };
