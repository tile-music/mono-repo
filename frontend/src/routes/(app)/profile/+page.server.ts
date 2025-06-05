import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import { assembleBlankProfile } from "./profile";
import { log } from "$lib/log"
import { FunctionsHttpError } from "@supabase/supabase-js";

export const load: PageServerLoad = async ({
    locals: { supabase, session, profile },
}) => {
    if (!session) {
        log(3, "User does not have session in protected route.");
        throw error(401, "Not authenticated");
    }

    const email = session.user.email;
    if (!email) {
        log(3, "User does not have email in session.");
        throw error(401, "Not authenticated");
    }

    if (!profile) {
        log(3, "User does not have profile in protected route.");

        // Insert blank profile
        const blankProfile = assembleBlankProfile(session.user.id, email);
        const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert(blankProfile)
            .select();

        if (insertError || !newProfile || !newProfile[0]) {
            log(2, "Error inserting blank profile: " +
                (insertError ? insertError.message : "profile was created but not returned"));
            throw error(500, "Server error while creating profile");
        }

        profile = newProfile[0];
    }

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

    reset_profile: async ({ locals: { supabase, session } }) => {
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

    change_avatar: async ({ request, locals: { supabase, session, profile } }) => {
        if (session == null) {
            log(3, "User does not have session in protected route.");
            return fail(401, { not_authenticated: true });
        }

        if (profile == null) {
            log(3, "User does not have profile in protected route.");
            return fail(401, { not_authenticated: true });
        }

        // remove existing avatar
        if (profile.avatar_url) {
            const headers = {
                headers: { Authorization: `Bearer ${session.access_token}` },
            };
            const { error } = await supabase.functions.invoke(
                "delete-avatar", { ...headers }
            );
    
            if (error) {
                if (error instanceof FunctionsHttpError) {
                    const message = await error.context.text();
                    log(3, "Error uploading avatar: " + message);
                    return fail(400, { function_error: true, error: message });
                }
                return fail(500, { server_error: true });
            }
        }

        // upload new avatar
        const formData = await request.formData();
        const headers = {
            headers: { Authorization: `Bearer ${session.access_token}` },
        };
        const { error } = await supabase.functions.invoke(
            "upload-avatar", { body: formData, ...headers }
        );

        if (error) {
            if (error instanceof FunctionsHttpError) {
                const message = await error.context.text();
                log(3, "Error uploading avatar: " + message);
                return fail(400, { function_error: true, error: message });
            }
            return fail(500, { server_error: true });
        }

        return { success: true }
    },

    remove_avatar: async ({
        locals: { supabase, session, profile },
    }) => {
        if (session == null) {
            log(3, "User does not have session in protected route.");
            return fail(401, { not_authenticated: true });
        }

        if (profile == null) {
            log(3, "User does not have profile in protected route.");
            return fail(401, { not_authenticated: true });
        }

        if (!profile.avatar_url) {
            log(3, "User does not have avatar to remove.");
            return fail(400, { no_avatar: true });
        }

        const headers = {
            headers: { Authorization: `Bearer ${session.access_token}` },
        };
        const { error } = await supabase.functions.invoke(
            "delete-avatar", { ...headers }
        );

        if (error) {
            if (error instanceof FunctionsHttpError) {
                const message = await error.context.text();
                log(3, "Error uploading avatar: " + message);
                return fail(400, { function_error: true, error: message });
            }
            return fail(500, { server_error: true });
        }

        return { success: true }
    },
};
