import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { SignInWithOAuthCredentials } from "@supabase/supabase-js/dist/index.cjs";

export const GET: RequestHandler = async ({
    locals: { user, supabase },
    url,
}) => {
    const next = url.searchParams.get("next") ?? "/profile";
    const linkIdentity = url.searchParams.get("linkIdentity") ?? "false";
    console.log("link identity", true);

    const scope = "user-read-recently-played user-read-private user-read-email";
    const options = {
        provider: "spotify",
        options: {
            scopes: scope,
            queryParams: { show_dialog: "true" },
            redirectTo: `http://localhost/oauth/spotify/callback?scope=${scope}&next=${next}`,
            skipBrowserRedirect: true,
        },
    } satisfies SignInWithOAuthCredentials;

    if (linkIdentity) {
        const { data, error } = await supabase.auth.linkIdentity(options);

        if (!error) {
            // linkIdentity skips the internal authorization route, so we can send
            // the user directly to the provider's OAuth url.
            return redirect(302, data.url);
        }
    } else {
        const { data, error } = await supabase.auth.signInWithOAuth(options);

        if (!error) {
            // /oauth/authorize is proxied by nginx to http://kong:8000/auth/v1/authorize,
            // which is the supabase authorization url. Supabase has no clue we're doing this,
            // but we still want to take advantage of the more secure PKCE flow, so we have to
            // let it generate its own URL and splice it manually.
            const newUrl =
                "http://localhost/oauth/authorize?" + data.url.split("?")[1];
            console.log(newUrl);
            return redirect(302, newUrl);
        }
    }

    return redirect(302, "/login");
};
