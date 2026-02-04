import { createSupabaseProdClient } from "../utils/supabase.js";
import type { User } from "@supabase/supabase-js";

async function resetListeningData(user: User) {
    const supabase = createSupabaseProdClient();

    // remove all played tracks by this user's user id
    const { data, error } = await supabase
        .from("played_tracks")
        .delete()
        .eq("user_id", user.id)
        .select("play_id");

    // handle errors
    if (error) {
        return {
            status: 500,
            error: "server_error",
        };
    }

    // make sure data was removed
    if (!data.length || data.length == 0)
        return {
            status: 200,
            body: "no_action",
        };

    return {
        status: 200,
        body: "success",
    };
}

export default resetListeningData;
