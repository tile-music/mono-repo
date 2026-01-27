import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import { assembleBlankProfile } from "./profile";
import { log } from "$lib/log";
import { resetListeningData } from "$lib/server/functions";

type UpdateProfileFields = {
    username: string;
    full_name: string;
    website: string;
};

type UpdateThemeFields = {
    theme: string;
};

type ActionResponse<T extends object> = {
    success: boolean;
    fields: Partial<T>;
    failures: Record<keyof T, string> & { general: string };
};

export type FormResponse = {
    update_profile?: ActionResponse<UpdateProfileFields>;
    update_theme?: ActionResponse<UpdateThemeFields>;
    reset_profile?: ActionResponse<{}>;
    reset_listening_data?: ActionResponse<{}>;
};

export const load: PageServerLoad = async ({ locals: { user } }) => {
    const email = user?.email;
    if (!email) {
        log(3, "User does not have email.");
        throw error(401, "Not authenticated");
    }

    return { email, title: "Profile" };
};

export const actions: Actions = {
    update_profile: async ({
        request,
        locals: { supabase, user, profile },
    }) => {
        const response = {
            update_profile: {
                success: false,
                fields: {},
                failures: {
                    username: "",
                    full_name: "",
                    website: "",
                    general: "",
                },
            },
        } satisfies FormResponse;

        const form: ActionResponse<UpdateProfileFields> =
            response.update_profile;

        if (user == null || profile == null) {
            log(
                3,
                "User is not authenticated or does not have profile in protected route.",
            );
            form.failures.general = "Not authenticated";
            return fail(401, response);
        }

        // assemble update object
        const formData = await request.formData();
        form.fields = {
            username: formData.get("username")?.toString(),
            full_name: formData.get("full_name")?.toString() ?? "",
            website: formData.get("website")?.toString() ?? "",
        };

        console.log(form.fields);

        if (form.fields.username === undefined) {
            form.failures.username = "Username is required";
            return fail(400, response);
        } else if (form.fields.username.length < 3) {
            form.failures.username = "Username must be at least 3 characters";
            return fail(400, response);
        }

        // make sure update is necessary
        if (
            profile.username == form.fields.username &&
            profile.full_name == form.fields.full_name &&
            profile.website == form.fields.website
        ) {
            // update is unnecessary
            log(5, `Not updating ${user.id}: update is unnecessary`);
            form.failures.general = "No update needed";
            return fail(400, response);
        }

        // attempt to perform update
        const { error: update_error } = await supabase
            .from("profiles")
            .update(form.fields)
            .eq("id", user.id);
        if (update_error) {
            if (update_error.code === "23514") {
                log(5, `Not updating ${user.id}: username too short`);
                form.failures.username =
                    "Username must be at least 3 characters";
                return fail(400, response);
            } else {
                log(2, "Error updating user: " + JSON.stringify(update_error));
                form.failures.general =
                    "Server error when trying to update profile";
                return fail(500, response);
            }
        }

        form.success = true;
        return response;
    },

    update_theme: async ({ request, locals: { supabase, user, profile } }) => {
        const response = {
            update_theme: {
                success: false,
                fields: {},
                failures: {
                    theme: "",
                    general: "",
                },
            },
        } satisfies FormResponse;
        const form: ActionResponse<UpdateThemeFields> = response.update_theme;

        const formData = await request.formData();
        form.fields = {
            theme: formData.get("theme")?.toString(),
        };

        if (user == null) {
            log(3, "User is not authenticated in protected route.");
            form.failures.general = "Not authenticated";
            return fail(401, response);
        }

        if (form.fields.theme === undefined) {
            form.failures.theme = "Theme is required";
            return fail(400, response);
        }

        const themes = ["light", "dark"];
        if (!themes.includes(form.fields.theme)) {
            form.failures.theme = "Invalid theme";
            return fail(400, response);
        }

        // assemble update object
        const update = {
            id: user.id,
            updated_at: new Date(),
            theme: form.fields.theme,
        };

        // make sure update is necessary
        if (profile && profile.theme == update.theme) {
            // update is unnecessary
            log(5, `Not updating ${user.id} theme: update is unnecessary`);
            form.failures.general = "No update needed";
            return fail(400, response);
        }

        // attempt to perform update
        const { error: update_error } = await supabase
            .from("profiles")
            .update(update)
            .eq("id", user.id);
        if (update_error) {
            log(2, "Error updating profile theme: " + update_error);
            form.failures.general =
                "Server error when trying to update profile theme";
            return fail(500, response);
        }

        form.success = true;
        return response;
    },

    reset_profile: async ({ locals: { supabase, user } }) => {
        const response = {
            reset_profile: {
                success: false,
                fields: {},
                failures: {
                    general: "",
                },
            },
        } satisfies FormResponse;
        const form: ActionResponse<{}> = response.reset_profile;

        if (user == null) {
            log(3, "User is not authenticated in protected route.");
            form.failures.general = "Not authenticated";
            return fail(401, response);
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
            form.failures.general = "Server error when resetting profile";
            return fail(500, response);
        }

        form.success = true;
        return response;
    },

    reset_listening_data: async ({ locals: { user } }) => {
        const response = {
            reset_listening_data: {
                success: false,
                fields: {},
                failures: {
                    general: "",
                },
            },
        } satisfies FormResponse;
        const form: ActionResponse<{}> = response.reset_listening_data;

        if (user == null) {
            log(3, "User is not authenticated in protected route.");
            form.failures.general = "Not authenticated";
            return fail(401, response);
        }

        // attempt to reset listening data
        const result = await resetListeningData(user);

        if ("error" in result) {
            log(2, "Error resetting listening data: " + result.error);
            form.failures.general =
                result.error ?? "Error when resetting listening data";
            return fail(result.status, response);
        }

        form.success = true;
        return response;
    },
};
