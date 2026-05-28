import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { log } from "$lib/log";
import * as z from "zod";

const Body = z.object({
    token: z.string(),
});

export const POST: RequestHandler = async ({
    locals: { user, supabase },
    request,
}) => {
    if (!user) {
        return json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = Body.safeParse(body);

    if (!result.success) {
        return json(
            {
                error: "Validation error",
                ...z.flattenError(result.error),
            },
            {
                status: 400,
            },
        );
    }

    const token = result.data.token;

    await supabase
        .from("connected_accounts")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", "apple");

    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 179);

    const connected_account = {
        user_id: user.id,
        provider: "apple",
        refresh_token: null,
        access_token: token,
        access_token_expires_at: expires_at,
        scope: "name email",
    };

    const { error: insert_error } = await supabase
        .from("connected_accounts")
        .upsert(connected_account);

    if (insert_error) {
        log(3, "Error inserting connected account:" + insert_error.message);
        return json(
            { error: "Failed to insert connected account" },
            { status: 500 },
        );
    }

    return json({ success: true }, { status: 200 });
};
