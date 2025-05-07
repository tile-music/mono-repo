// src/routes/+page.server.ts
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { removeJob } from "../../../lib/remove-job";
/**
 * Handles the POST request to unlink Spotify credentials for the authenticated user.
 *
 * @param {Object} context - The context object containing locals and request.
 * @param {Object} context.locals - The locals object containing Supabase client and session.
 * @param {Object} context.locals.supabase - The Supabase client instance.
 * @param {Object} context.locals.session - The session object containing user session information.
 * @param {Request} context.request - The request object containing the request data.
 *
 * @returns {Promise<Response>} - A promise that resolves to a Response object.
 *
 * The function performs the following steps:
 * 1. Parses the request body as JSON.
 * 2. Checks if the session is not null.
 * 3. If the session is valid, retrieves the user information from Supabase.
 * 4. Deletes the user's Spotify credentials from the "spotify_credentials" table.
 * 5. Returns a 200 response with the request body as JSON.
 * 6. If the session is null, returns a 400 response with an error message.
 */
export const POST: RequestHandler = async ({
    locals: { supabase, session },
    request,
}) => {
    let body = await request.json();
    if (session !== null) {
        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        };
        const { data, error } = await supabase.auth.getUser();
        console.log("data", data);
        const userId = data.user?.id;
        if (!userId) throw new Error("User not found");
        console.log("userId", userId);
        const { data: dbData, error: error2 } = await supabase
            .from("spotify_credentials")
            .delete()
            .eq("id", userId);

        console.log("removing job");
        await removeJob(userId);
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
