import type { Actions, PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getContextData, getDisplayData } from "$lib/server/functions";

export const load: PageServerLoad = async () => {
    return { title: "Studio" };
};

export const actions: Actions = {
    refresh: async ({ request, locals: { user } }) => {
        if (user == null) return error(401, "Not authenticated");

        const body = await request.json();

        const result = await getDisplayData(user, body);

        if ("error" in result) return error(result.status, result.error);

        // parse and return list of songs
        return { songs: result.body };
    },
    context: async ({ request, locals: { user } }) => {
        if (user == null) return error(401, "Not authenticated");

        const body = await request.json();

        const result = await getContextData(user, body);
        if ("error" in result) return error(result.status, result.error);
        return result.body;
    },
};
