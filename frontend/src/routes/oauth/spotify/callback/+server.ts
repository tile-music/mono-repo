import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { log } from "$lib/log";

export const GET: RequestHandler = async ({ locals: { supabase }, url }) => {
    console.log(url.searchParams);
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
    console.log("INSERTED :)");

    if (insert_error) {
        log(3, "Error inserting connected account:" + insert_error);
        redirect(303, "/login");
    }

    redirect(303, "/" + next.slice(1));
};
