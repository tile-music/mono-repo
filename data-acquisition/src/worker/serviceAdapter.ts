import { SupabaseClient } from "@supabase";
import { makeDataAcqQueue } from "./makeQueue.ts";
// import { Database } from "_shared/schema.ts";
import { log } from "../util/log.ts";

/** */
/**
 * Asynchronously creates and schedules jobs for Spotify credentials.
 *
 * This function initializes a job queue and connects to a Supabase client to fetch Spotify credentials.
 * For each credential, it adds two jobs to the queue:
 * 1. A one-time job with the user's Spotify credentials.
 * 2. A recurring job that runs every 30 minutes with the user's Spotify credentials.
 *
 * @async
 * @function makeJobs
 * @returns A promise that resolves when the jobs have been added to the queue.
 * @todo: add a perameter instead of creating a new queue
 * @todo: deduplicate
 */
export async function makeDataAcqJobs(): Promise<void> {
    const queue = makeDataAcqQueue();
    const supabase = new SupabaseClient(
        Deno.env.get("SB_URL")!,
        Deno.env.get("SB_SERVICE_KEY")!,
        { db: { schema: "public" } },
    );

    const {
        data: connected_spotify_accounts,
        error: get_connected_spotify_accounts_error,
    } = await supabase
        .from("connected_accounts")
        .select("user_id, refresh_token")
        .eq("provider", "spotify");

    if (get_connected_spotify_accounts_error) {
        log(
            1,
            "Error when retrieving connected Spotify accounts: " +
                get_connected_spotify_accounts_error.message,
        );
    } else {
        for (const account of connected_spotify_accounts) {
            // immediate job
            await queue.add(
                "spotify" + account,
                {
                    data: {
                        provider: "spotify",
                        userId: account.user_id,
                        refreshToken: account.refresh_token,
                    },
                },
                {
                    jobId: "spotify" + account.user_id,
                },
            );

            // job every 30 mins
            await queue.add(
                "spotify" + account,
                {
                    data: {
                        provider: "spotify",
                        userId: account.user_id,
                        refreshToken: account.refresh_token,
                    },
                },
                {
                    repeat: { pattern: "0/30 * * * *" },
                    jobId: "spotify" + account.user_id,
                },
            );
        }
    }

    const {
        data: connected_apple_music_accounts,
        error: get_connected_apple_music_accounts_error,
    } = await supabase
        .from("connected_accounts")
        .select("user_id, access_token")
        .eq("provider", "apple");

    if (get_connected_apple_music_accounts_error) {
        log(
            1,
            "Error when retrieving connected Apple Music accounts: " +
                get_connected_apple_music_accounts_error.message,
        );
    } else {
        for (const account of connected_apple_music_accounts) {
            // immediate job
            await queue.add(
                "apple" + account,
                {
                    data: {
                        provider: "apple",
                        userId: account.user_id,
                        accessToken: account.access_token,
                    },
                },
                {
                    jobId: "apple" + account.user_id,
                },
            );

            // job every 15 mins
            await queue.add(
                "apple" + account,
                {
                    data: {
                        provider: "apple",
                        userId: account.user_id,
                        accessToken: account.access_token,
                    },
                },
                {
                    repeat: { pattern: "0/15 * * * *" },
                    jobId: "apple" + account.user_id,
                },
            );
        }
    }
}
