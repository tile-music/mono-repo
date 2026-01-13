import { getListeningData } from "$lib/server/functions";
import type { Actions } from "./$types";
import { error } from "@sveltejs/kit";

export const actions: Actions = {
    loaddata: async ({ request, locals: { user } }) => {
        if (user == null) return error(401, "Not authenticated");

        const body = await request.json();
        const result = await getListeningData(user, body);

        if ("error" in result) return error(result.status, result.error);

        // parse and return list of songs
        return { songs: result.body };
    },
};
