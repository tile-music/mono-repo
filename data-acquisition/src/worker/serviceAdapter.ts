import { SupabaseClient } from "@supabase";
import { makeDataAcqQueue } from "./makeQueue.ts";
import { Database } from "_shared/schema.ts"
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
    console.log("makeJobs");
    const supabase = new SupabaseClient(
        Deno.env.get("SB_URL")!,
        Deno.env.get("SERVICE")!,
        { db: { schema: "public" } },
    );
    await supabase
        .from("spotify_credentials")
        .select("*")
        .then((items) => {
            console.log(items);
            items.data?.forEach(async (e: {
                id: string,
                refresh_token: string
            }) => {
                await queue.add(
                    "spotify:" + e.id,
                    {
                        data: {
                            userId: e.id,
                            refreshToken: e.refresh_token,
                        },
                    },
                    {
                        jobId: "spotify" + e.id,
                    },
                );
                await queue.add(
                    "spotify:" + e.id,
                    {
                        data: {
                            userId: e.id,
                            refreshToken: e.refresh_token,
                        },
                    },
                    {
                        repeat: { pattern: "0/30 * * * *" },
                        jobId: "spotify" + e.id,
                    },
                );
            });
        });
}
/** if you'd like to update sooner you could get rid of the second 0 and even the first */
