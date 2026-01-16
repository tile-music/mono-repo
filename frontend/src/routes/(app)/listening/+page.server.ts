import { getListeningData } from "$lib/server/functions";
import type { Actions } from "./$types";
import { error } from "@sveltejs/kit";

export const actions: Actions = {
    loaddata: async ({ request, locals: { user } }) => {
        if (user == null) return error(401, "Not authenticated");

        const body = await request.json();
        const result = await getListeningData(user, body);

        if ("error" in result) {
            console.log(result.error);
            return error(result.status, JSON.stringify(result.error, null, 2));
        }

        // parse and return list of songs
        return { songs: result.body };
    },
};
