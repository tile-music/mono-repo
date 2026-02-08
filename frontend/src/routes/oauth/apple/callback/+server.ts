import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { log } from "$lib/log";
import { DATA_ACQ_URL } from "$env/static/private";

export const GET: RequestHandler = async ({ locals: { supabase }, url }) => {
    const code = url.searchParams.get("code");
    const scope = url.searchParams.get("scope");
    const next = url.searchParams.get("next");

    if (!code || !scope || !next) {
        log(
            3,
            "Callback URL is missing one or more required params: code, scope, next",
        );
        return redirect(303, "/login");
    }

    const { data: exchange, error: session_error } =
        await supabase.auth.exchangeCodeForSession(code);

    if (session_error) {
        log(3, "Error exchanging code for session:" + session_error);
        return redirect(303, "/login");
    }
    return redirect(303, "/" + next.slice(1));
};
