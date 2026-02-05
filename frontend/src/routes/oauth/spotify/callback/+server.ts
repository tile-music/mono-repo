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
        redirect(303, "/login");
    }

    const { data: exchange, error: session_error } =
        await supabase.auth.exchangeCodeForSession(code);

    if (session_error) {
        log(3, "Error exchanging code for session:" + session_error);
        redirect(303, "/login");
    }

    const user = exchange.user!;
    const session = exchange.session!;

    const { data: existing_connected_account } = await supabase
        .from("connected_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "spotify")
        .limit(1)
        .single();

    let id;
    if (existing_connected_account) {
        id = existing_connected_account.id;
    } else {
        id = crypto.randomUUID();
    }

    const connected_account = {
        id: id,
        user_id: user.id,
        provider: "spotify",
        refresh_token: session.provider_refresh_token,
        access_token: null,
        access_token_expires_at: null,
        scope: scope,
    };

    const { error: insert_error } = await supabase
        .from("connected_accounts")
        .upsert(connected_account);

    if (insert_error) {
        log(3, "Error inserting connected account:" + insert_error.message);
        redirect(303, "/login");
    }

    const add_job_response = await fetch(DATA_ACQ_URL + "/add-job", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: connected_account.user_id,
            refreshToken: connected_account.refresh_token,
            type: connected_account.provider,
        }),
    });

    if (!add_job_response.ok) {
        log(
            2,
            "Error adding data acquisition job: " +
                (await add_job_response.text()),
        );
    }

    redirect(303, "/" + next.slice(1));
};
