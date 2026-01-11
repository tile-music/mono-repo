// src/routes/+page.server.ts
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { SupabaseClient } from "@supabase/supabase-js";

import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_SERVICE_KEY,
} from "$env/static/public";

const headers = { "Content-Type": "application/json" };

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
}) => {
    if (session !== null) {
        // create a supabase client
        const supabaseProd = new SupabaseClient(
            PUBLIC_SUPABASE_URL as string,
            PUBLIC_SUPABASE_SERVICE_KEY as string,
            { db: { schema: "prod" } },
        );

        try {
            // attempt to clear user's played tracks and delete their account
            const { data, error: authError } = await supabase.auth.getUser();
            if (authError) throw authError;
            const userId = data.user?.id;
            if (userId) {
                const { error: clearError } = await supabaseProd
                    .from("played_tracks")
                    .delete()
                    .eq("user_id", userId);
                if (clearError) throw clearError;
                const { error: deleteError } =
                    await supabaseProd.auth.admin.deleteUser(userId);
                if (deleteError) throw deleteError;
            } else throw "User not found.";
        } catch (error) {
            // if any errors occur, respond with internal server error
            console.error(error);
            const body = JSON.stringify({ error: "Internal server error." });
            return new Response(body, { status: 500, headers });
        }

        return new Response("", { status: 200, headers });
    } else {
        const body = JSON.stringify({ error: "User does not have session." });
        return new Response(body, { status: 400, headers });
    }
};
