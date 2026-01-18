import { SupabaseClient } from "@supabase/supabase-js";

async function checkSpotifyLogin(supabase: SupabaseClient) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw "Unable to fetch user.";

    const userId = userData.user["id"];
    // check if the user has linked spotify credentials
    const { data: dbData, error } = await supabase
        .from("spotify_credentials")
        .select("*")
        .eq("id", userId);

    if (dbData && dbData.length > 0) {
        return { success: true };
    } else {
        return { success: false };
    }
}

export default checkSpotifyLogin;
