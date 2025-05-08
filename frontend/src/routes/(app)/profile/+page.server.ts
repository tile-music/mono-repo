import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { assembleBlankProfile } from "./profile";

export const load: PageServerLoad = async ({
    cookies,
    locals: { supabase, session },
}) => {
    if (session == null) throw Error("User does not have session.");

    // fetch profile data
    let { data: user, error } = await supabase
        .from("profiles")
        .select(`updated_at, username, full_name, website, avatar_url, theme`)
        .eq("id", session.user.id)
        .single();
    if (error && error.code == "PGRST116") {
        user = {
            updated_at: null,
            username: null,
            full_name: null,
            website: null,
            avatar_url: null,
            theme: "dark",
        };
    } else if (error) throw error;

    const email = session.user.email ?? null;

    // set theme
    if (user && user.theme) {
        cookies.set("theme", user.theme, {
            path: "/",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        });
    }

    // return the retrieved user, or the blank user if no profile was found
    return { user, email };
};

export const actions: Actions = {
    update_profile: async ({ request, locals: { supabase, session } }) => {
        if (session == null) return fail(401, { not_authenticated: true });

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

        // get profile data
        let { data: user, error: get_error } = await supabase
            .from("profiles")
            .select(`updated_at, username, full_name, website, avatar_url`)
            .eq("id", session.user.id)
            .single();
        if (get_error || !user) throw get_error;

        // make sure update is necessary
        if (
            user.username == update.username &&
            user.full_name == update.full_name &&
            user.website == update.website &&
            user.avatar_url == update.avatar_url
        ) {
            // update is unnecessary
            return fail(400, { update_unnecessary: true });
        }

        // attempt to perform update
        const { error: update_error } = await supabase
            .from("profiles")
            .upsert(update);
        if (update_error) {
            console.log(update_error);
            if (update_error.code === "23514")
                return fail(400, { username_too_short: true });
            else return fail(500, { server_error: true });
        }

        return { success: true };
    },

    update_theme: async ({
        cookies,
        request,
        locals: { supabase, session },
    }) => {
        if (session == null) return fail(401, { not_authenticated: true });

        // assemble update object
        const theme = await request.json();
        const update = {
            id: session?.user.id,
            updated_at: new Date(),
            theme: theme,
        };

        // get profile data
        let { data: user, error: get_error } = await supabase
            .from("profiles")
            .select(`theme`)
            .eq("id", session.user.id)
            .single();
        if (get_error || !user) throw get_error;

        // make sure update is necessary
        if (user.theme == update.theme) {
            // update is unnecessary
            return fail(400, { update_unnecessary: true });
        }

        // attempt to perform update
        const { error: update_error } = await supabase
            .from("profiles")
            .upsert(update);
        if (update_error) {
            console.log(update_error);
            if (update_error.code === "23514")
                return fail(400, { username_too_short: true });
            else return fail(500, { server_error: true });
        }

        // set theme cookie to expire in 7 days
        cookies.set("theme", theme, {
            path: "/",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        });

        return { success: true };
    },

    reset_profile: async ({ request, locals: { supabase, session } }) => {
        if (session == null) return fail(401, { not_authenticated: true });

        // replace profile with blank profile, retaining user id and email
        const blankProfile = assembleBlankProfile(
            session.user.id,
            session.user.email,
        );
        const { error } = await supabase.from("profiles").upsert(blankProfile);
        if (error) {
            console.error(error); // log unexpected error
            return fail(500, { server_error: true });
        }

        return { success: true, user: JSON.stringify(blankProfile) };
    },

    reset_listening_data: async ({
        locals: { supabase, session },
    }) => {
        if (session == null) return fail(401, { not_authenticated: true });

        // attempt to reset listening data
        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        };
        const { data } = await supabase.functions.invoke(
            "reset-listening-data",
            headers,
        );

        // handle errors
        const response = JSON.parse(data);
        return response;
    },
};
