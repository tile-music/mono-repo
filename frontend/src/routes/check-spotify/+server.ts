import type { RequestHandler } from "@sveltejs/kit";
import { checkSpotifyLogin } from "$lib/server/functions";

export const POST: RequestHandler = async ({ locals: { supabase, user } }) => {
    let body: string;
    if (user !== null) {
        const result = await checkSpotifyLogin(supabase);

        body = result.success ? "spotify logged in" : "spotify login not found";

        return new Response(JSON.stringify(body), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } else {
        body = JSON.stringify({ error: "User does not have session." });
        return new Response(body, {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};
