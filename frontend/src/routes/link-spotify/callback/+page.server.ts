import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { SP_SECRET, SP_CID, SP_REDIRECT } from "$env/static/private";
import type { SupabaseClient } from "@supabase/supabase-js";

export const load: PageServerLoad = async ({
    locals: { supabase, user },
    url,
}) => {
    if (!user) throw redirect(302, "/");

    const code = url.searchParams.get("code");
    if (!code) throw redirect(302, "/");

    const spotifyCredentials = await getSpotifyCredentials(code);

    if (
        !("refresh_token" in spotifyCredentials) ||
        typeof spotifyCredentials.refresh_token !== "string"
    )
        throw Error("Invalid Spotify credentials received");

    const storeResponse = await storeSpotifyCredentials(
        supabase,
        user.id,
        spotifyCredentials.refresh_token,
    );

    if (storeResponse.status !== 200)
        throw Error("Failed to store Spotify credentials");

    await addSpotifyCredentialsToDataAcquisition(
        user.id,
        spotifyCredentials.refresh_token,
    );

    redirect(302, "/profile");
};

const corsHeaders = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
});

async function getSpotifyCredentials(code: string): Promise<JSON> {
    const clientSecret = SP_SECRET;
    const clientId = SP_CID;
    const redirectUrl = SP_REDIRECT;

    const encodedCredentials = Buffer.from(
        clientId + ":" + clientSecret,
        "utf8",
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: new URLSearchParams({
            code: code,
            redirect_uri: redirectUrl,
            grant_type: "authorization_code",
        }),
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + encodedCredentials,
            ...corsHeaders,
        },
    });

    return response.json();
}

async function addSpotifyCredentialsToDataAcquisition(
    userId: string,
    token: string,
) {
    const response = await fetch("http://data-acquisition:3001/add-job", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
        },
        body: JSON.stringify({
            userId: userId,
            refreshToken: token,
            type: "spotify",
        }),
    });
}

async function storeSpotifyCredentials(
    supabase: SupabaseClient,
    userId: string,
    refreshToken: string,
) {
    const deleteResponse = await supabase
        .from("spotify_credentials")
        .delete()
        .eq("id", userId);
    if (deleteResponse) console.log("delete error", deleteResponse);

    const { error: insertError } = await supabase
        .from("spotify_credentials")
        .insert({
            id: userId,
            refresh_token: refreshToken,
        });

    if (insertError) {
        console.log("error", insertError);
        return {
            status: 500,
            error: "Failed to store Spotify credentials",
        };
    }

    return {
        status: 200,
        body: "Spotify credentials stored successfully",
    };
}
