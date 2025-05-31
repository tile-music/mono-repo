import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { assembleBlankProfile } from "./settings/profile";
import { log } from "$lib/log"

export const load: PageServerLoad = async ({
    locals: { supabase, session, profile },
}) => {
    if (session == null) {
        log(3, "User does not have session in protected route.");
        throw Error("User does not have session in protected route.");
    }

    const email = session.user.email ?? null;

    // return the retrieved (or blank) user profile
    return { email, profile };
};

export const actions: Actions = {
    update_profile: async ({ request, locals: { supabase, session, profile } }) => {
        if (session == null || profile == null) {
            log(3, "User does not have session or profile in protected route.");
            return fail(401, { not_authenticated: true });
        }

        // assemble update object
        const formData = await request.formData();
        const update = {
            id: session?.user.id,
            updated_at: new Date(),
            username: formData.get("username") as string,
            full_name: formData.get("full name") as string,
            website: formData.get("website") as string,
            avatar_url: null,
        };

        // make sure update is necessary
        if (
            profile.username == update.username &&
            profile.full_name == update.full_name &&
            profile.website == update.website &&
            profile.avatar_url == update.avatar_url
        ) {
            // update is unnecessary
            log(5, `Not updating ${session.user.id}: update is unnecessary`);
            return fail(400, { update_unnecessary: true });
        }

        // attempt to perform update
        const { error: update_error } = await supabase
            .from("profiles")
            .upsert(update);
        if (update_error) {
            if (update_error.code === "23514") {
                log(5, `Not updating ${session.user.id}: username too short`);
                return fail(400, { username_too_short: true });
            } else {
                log(2, "Error updating user: " + update_error);
                return fail(500, { server_error: true });
            }
        }

        return { success: true };
    },

    update_theme: async ({
        cookies,
        request,
        locals: { supabase, session, profile },
    }) => {
        if (session == null) {
            log(3, "User does not have session in protected route.");
            return fail(401, { not_authenticated: true });
        }

        // assemble update object
        const theme = await request.json();
        const update = {
            id: session?.user.id,
            updated_at: new Date(),
            theme: theme,
        };

        // make sure update is necessary
        if (profile && profile.theme == update.theme) {
            // update is unnecessary
            log(5, `Not updating ${session.user.id} theme: update is unnecessary`);
            return fail(400, { update_unnecessary: true });
        }

        // attempt to perform update
        const { error: update_error } = await supabase
            .from("profiles")
            .upsert(update);
        if (update_error) {
            log(2, "Error updating profile theme: " + update_error);
            return fail(500, { server_error: true });
        }

        return { success: true };
    },

    reset_profile: async ({ request, locals: { supabase, session } }) => {
        if (session == null) {
            log(3, "User does not have session in protected route.");
            return fail(401, { not_authenticated: true });
        }

        // replace profile with blank profile, retaining user id and email
        const blankProfile = assembleBlankProfile(
            session.user.id,
            session.user.email,
        );
        const { error } = await supabase.from("profiles").upsert(blankProfile);
        if (error) {
            log(2, "Error resetting profile: " + error);
            return fail(500, { server_error: true });
        }

        return { success: true, user: JSON.stringify(blankProfile) };
    },

    reset_listening_data: async ({
        locals: { supabase, session },
    }) => {
        if (session == null) {
            log(3, "User does not have session in protected route.");
            return fail(401, { not_authenticated: true });
        }

        // attempt to reset listening data
        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        };
        const { data, error } = await supabase.functions.invoke(
            "reset-listening-data",
            headers,
        );
        if (error) {
            log(2, "Error resetting listening data: " + error);
            return fail(500, { server_error: true });
        }

        // handle errors
        const response = JSON.parse(data);
        return response;
    },
};
