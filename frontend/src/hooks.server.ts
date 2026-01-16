import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { log } from "$lib/log";

import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";
import type { Profile } from "$shared/Profile";

const supabase: Handle = async ({ event, resolve }) => {
    /**
     * Creates a Supabase client specific to this server request.
     * The Supabase client gets the Auth token from the request cookies.
     */

    event.locals.supabase = createServerClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll: () => event.cookies.getAll(),
                /**
                 * SvelteKit's cookies API requires `path` to be explicitly set in
                 * the cookie options. Setting `path` to `/` replicates previous/
                 * standard behavior.
                 */
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        event.cookies.set(name, value, {
                            ...options,
                            path: "/",
                        });
                    });
                },
            },
        },
    );

    /**
     * Unlike `supabase.auth.getSession()`, which returns the session _without_
     * validating the JWT, this function also calls `getUser()` to validate the
     * JWT before returning the session.
     */
    event.locals.safeGetSession = async () => {
        const {
            data: { session },
        } = await event.locals.supabase.auth.getSession();
        if (!session) {
            return { session: null, user: null };
        }

        const {
            data: { user },
            error,
        } = await event.locals.supabase.auth.getUser();
        if (error) {
            // JWT validation has failed
            return { session: null, user: null };
        }

        return { session, user };
    };

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            /**
             * Supabase libraries use the `content-range` and `x-supabase-api-version`
             * headers, so we need to tell SvelteKit to pass it through.
             */
            return (
                name === "content-range" || name === "x-supabase-api-version"
            );
        },
    });
};

const authGuard: Handle = async ({ event, resolve }) => {
    const { session, user } = await event.locals.safeGetSession();
    event.locals.session = session;
    event.locals.user = user;
    if (event.request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*", // Replace '*' with specific origin in production
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }

    // make sure users can't access protected routes
    if (!event.locals.session) {
        const protectedRoutes = [
            "/display",
            "/listening",
            "/profile",
            "/link-spotify",
        ];
        let prot = false;
        for (const route of protectedRoutes) {
            if (event.url.pathname.startsWith(route)) prot = true;
        }
        if (prot === true) redirect(303, "/login");
    }

    if (
        event.locals.session &&
        (event.url.pathname === "/login" || event.url.pathname === "/register")
    ) {
        redirect(303, "/profile");
    }
    const response = await resolve(event);
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
    );

    return response;
};

const profile: Handle = async ({ event, resolve }) => {
    const { user } = event.locals;

    // if no user is logged in, set profile to null
    if (!user) {
        event.locals.profile = null;
        return resolve(event);
    }

    // fetch the user's profile from the database
    const fetchResult = await event.locals.supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // if there's an error fetching the profile, log it and set profile to null
    if (fetchResult.error) {
        log(
            3,
            "Error fetching profile of authenticated user:" +
            JSON.stringify(fetchResult.error, null, 2),
        );
        event.locals.profile = null;
        return resolve(event);
    }

    const profile = fetchResult.data as Profile;
    event.locals.profile = profile;
    return resolve(event);
};

const userTheme: Handle = async ({ event, resolve }) => {
    const { profile } = event.locals;
    const theme = `theme-${profile?.theme ?? "theme-default-dark"}`;

    return await resolve(event, {
        transformPageChunk: ({ html }) => html.replace("[theme]", theme),
    });
};

export const handle: Handle = sequence(supabase, authGuard, profile, userTheme);
