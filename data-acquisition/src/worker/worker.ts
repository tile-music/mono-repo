import { Worker, Job } from "@bull";
import { SupabaseClient } from "@supabase";
import { default as process } from "@node-process";

import {
    AppleMusicUserPlaying,
    SpotifyUserPlaying,
} from "../music/UserPlaying.ts";
import { connection } from "./redis.ts";

import "@std/dotenv/load";
import { log } from "../util/log.ts";

/**
 * Fetches and processes the currently playing track for a Spotify user.
 *
 * This function initializes a Supabase client and a SpotifyUserPlaying instance
 * with the provided user ID and refresh token. It then fetches the currently
 * playing track for the user and processes it.
 *
 * @param userId - The ID of the Spotify user.
 * @param refreshToken - The refresh token for the Spotify user.
 * @returns A promise that resolves when the operation is complete.
 */

type SupabaseSchema = "test" | "prod";

export async function spotifyFire(userId: string, refreshToken: string) {
    const supabaseInd = new SupabaseClient(
        Deno.env.get("SB_URL")!,
        Deno.env.get("SERVICE")!,
    );

    const spotifyUserPlaying = new SpotifyUserPlaying(supabaseInd, userId, {
        refresh_token: refreshToken,
    });

    await spotifyUserPlaying.init();
    await spotifyUserPlaying.fire();
}

export async function appleMusicFire(userId: string, accessToken: string) {
    const supabaseInd = new SupabaseClient(
        Deno.env.get("SB_URL")!,
        Deno.env.get("SERVICE")!,
    );

    const appleMusicUserPlaying = new AppleMusicUserPlaying(
        supabaseInd,
        userId,
        { access_token: accessToken },
    );

    await appleMusicUserPlaying.init();
    await appleMusicUserPlaying.fire();
}

const worker = new Worker(
    "my-cron-jobs",
    async (job: Job) => {
        const provider: string = job.data.data.provider;
        const userId: string = job.data.data.userId;

        console.log(
            `Processing job ${job.id} at ${new Date()} for user ${userId}`,
        );

        if (provider === "spotify") {
            await spotifyFire(userId, job.data.data.refreshToken);
        } else if (provider === "apple") {
            await appleMusicFire(userId, job.data.data.accessToken);
        } else {
            log(2, `Unknown provider ${provider} for job ${job.id}`);
        }
    },
    { connection },
);

process.on("unhandledRejection", (err: Error) => {
    console.error(err);
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
    await worker.close();
    console.log("Worker and queue closed");
    process.exit(0);
});
