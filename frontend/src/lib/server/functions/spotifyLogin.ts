import type { User } from "@supabase/supabase-js";
import { SP_CID, SP_REDIRECT } from "$env/static/private";

/**
 * Generates a Spotify authorization URL for the user to log in with Spotify
 *
 * @param user - The authenticated user
 * @returns An object containing the Spotify authorization URL or an error
 */
async function spotifyLogin(user: User, token: string) {
    const scope = "user-read-recently-played";
    const clientId = SP_CID;
    const redirectUrl = SP_REDIRECT;
    console.log(SP_CID, SP_REDIRECT);

    // validate environment variables
    if (!clientId || !redirectUrl) {
        return {
            status: 500,
            error: "Missing Spotify configuration (client ID or redirect URL)",
        };
    }

    // build query parameters
    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUrl,
        state: "poop", // dumb for now
    });

    console.log(params);

    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

    return {
        status: 200,
        body: { url: spotifyAuthUrl },
    };
}

export default spotifyLogin;
