import type { RequestHandler } from "@sveltejs/kit";
import { removeJob } from "../../../lib/remove-job";

/**
 * Handles the POST request to unlink Spotify credentials for the authenticated user.
 * Returns a 200 response with the request body as JSON. If the session is null,
 * returns a 400 response with an error message.
 */
export const POST: RequestHandler = async ({
    locals: { supabase, session },
    request,
}) => {
    // Parse the request body
    let body = await request.json();

    if (session) {
        // Retrieve user information
        const { data, error } = await supabase.auth.getUser();
        const userId = data.user?.id;

        if (!userId) throw new Error("User not found");

        // Delete Spotify credentials from the database
        await supabase
            .from("spotify_credentials")
            .delete()
            .eq("id", userId);

        // Remove associated job
        await removeJob(userId);

        // Return success response
        return new Response(JSON.stringify(body), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Return error response if session is invalid
    body = JSON.stringify({ error: "User does not have session." });
    return new Response(body, {
        status: 400,
        headers: { "Content-Type": "application/json" },
    });
};