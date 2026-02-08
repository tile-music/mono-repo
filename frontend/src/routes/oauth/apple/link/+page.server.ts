import type { PageServerLoad } from "./$types";
import { getAppleMusicDeveloperToken } from "$lib/server/utils/apple";

export const load: PageServerLoad = async ({ locals: { user } }) => {
    if (!user) {
        throw Error("User does not have session.");
    }

    const token = await getAppleMusicDeveloperToken();
    return { token };
};
