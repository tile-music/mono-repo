import { SupabaseClient } from "../../deps.ts";
import { makeDataAcqQueue } from "./makeQueue.ts";
import { log } from "../util/log.ts";

import "jsr:@std/dotenv/load";

/**
 */
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
 * @returns {Promise<void>} A promise that resolves when the jobs have been added to the queue.
 * @todo: add a perameter instead of creating a new queue
 * @todo: deduplicate
 */
export async function makeDataAcqJobs() {
    const queue = makeDataAcqQueue();
    const supabase = new SupabaseClient(
        Deno.env.get("SB_URL")!,
        Deno.env.get("SERVICE")!,
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
            2,
            "Error when retrieving connected spotify accounts: " +
                get_connected_spotify_accounts_error.message,
        );
    } else {
        for (const account of connected_spotify_accounts) {
            // immediate job
            await queue.add(
                "spotify" + account,
                {
                    data: {
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
                        userId: account.user_id,
                        refreshToken: account.refresh_token,
                    },
                },
                {
                    repeat: { pattern: "0/30 * * * *" },
                    immediateley: true,
                    jobId: "spotify" + account.user_id,
                },
            );
        }
    }
}
