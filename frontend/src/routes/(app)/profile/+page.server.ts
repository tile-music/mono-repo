import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import { assembleBlankProfile } from "./profile";
import { log } from "$lib/log";
import { resetListeningData } from "$lib/server/functions";

export const load: PageServerLoad = async ({
    locals: { supabase, user, profile },
}) => {
    if (!user) {
        log(3, "User is not authenticated in protected route.");
        throw error(401, "Not authenticated");
    }

    const email = user.email;
    if (!email) {
        log(3, "User does not have email in session.");
        throw error(401, "Not authenticated");
    }

    if (!profile) {
        log(3, "User does not have profile in protected route.");

        // Insert blank profile
        const blankProfile = assembleBlankProfile(user.id, email);
        const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
              .upsert(blankProfile, {
                onConflict: "id",
              })
              .select();

        if (insertError || !newProfile || !newProfile[0]) {
            log(
                2,
                "Error inserting blank profile: " +
                    (insertError
                        ? insertError.message
                        : "profile was created but not returned"),
            );
            throw error(500, "Server error while creating profile");
        }

        profile = newProfile[0];
    }

    return { email, profile };
};

export const actions: Actions = {
    update_profile: async ({
        request,
        locals: { supabase, user, profile },
    }) => {
        if (user == null || profile == null) {
            log(
                3,
                "User is not authenticated or does not have profile in protected route.",
            );
            return fail(401, { not_authenticated: true });
        }

        // assemble update object
        const formData = await request.formData();
        const update = {
            id: user.id,
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
            log(5, `Not updating ${user.id}: update is unnecessary`);
            return fail(400, { update_unnecessary: true });
        }

        // attempt to perform update
        const { error: update_error } = await supabase
            .from("profiles")
            .update(update)
            .eq("id", user.id)
        if (update_error) {
            if (update_error.code === "23514") {
                log(5, `Not updating ${user.id}: username too short`);
                return fail(400, { username_too_short: true });
            } else {
                log(2, "Error updating user: " + JSON.stringify(update_error));
                return fail(500, { server_error: true });
            }
        }

        return { success: true };
    },

    update_theme: async ({ request, locals: { supabase, user, profile } }) => {
        if (user == null) {
            log(3, "User is not authenticated in protected route.");
            return fail(401, { not_authenticated: true });
        }

        // assemble update object
        const theme = await request.json();
        const update = {
            id: user.id,
            updated_at: new Date(),
            theme: theme,
        };

        // make sure update is necessary
        if (profile && profile.theme == update.theme) {
            // update is unnecessary
            log(5, `Not updating ${user.id} theme: update is unnecessary`);
            return fail(400, { update_unnecessary: true });
        }

        // attempt to perform update
        const { error: update_error } = await supabase
            .from("profiles")
            .update(update)
            .eq("id", user.id)
        if (update_error) {
            log(2, "Error updating profile theme: " + update_error);
            return fail(500, { server_error: true });
        }

        return { success: true };
    },

    reset_profile: async ({ locals: { supabase, user } }) => {
        if (user == null) {
            log(3, "User is not authenticated in protected route.");
            return fail(401, { not_authenticated: true });
        }

        // replace profile with blank profile, retaining user id and email
        const blankProfile = assembleBlankProfile(user.id, user.email);
        const { error } = await supabase
            .from("profiles")
            .update(blankProfile)
            .eq("id", user.id)
            .select();
        if (error) {
            log(2, "Error resetting profile: " + error);
            return fail(500, { server_error: true });
        }

        return { success: true, user: JSON.stringify(blankProfile) };
    },

    reset_listening_data: async ({ locals: { user } }) => {
        if (user == null) {
            log(3, "User is not authenticated in protected route.");
            return fail(401, "not_authenticated");
        }

        // attempt to reset listening data
        const result = await resetListeningData(user);

        if ("error" in result) {
            log(2, "Error resetting listening data: " + result.error);
            return fail(result.status, result.error);
        }

        // handle errors
        return result.body;
    },
};
