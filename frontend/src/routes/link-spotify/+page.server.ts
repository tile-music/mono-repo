import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { spotifyLogin } from "$lib/server/functions";

export const load: PageServerLoad = async ({ locals: { user }, url }) => {
    if (user !== null) {
        // determine if users have clicked the 'log in with spotify' button or are just trying to load the page
        if (url.searchParams.get("link") === "true") {
            const result = await spotifyLogin();
            if ("error" in result) {
                // TODO: tell the user that the link failed and to try again
                throw Error(result.error);
            }

            redirect(302, result.body.url);
        }
    } else {
        throw Error("User does not have session.");
    }
};
