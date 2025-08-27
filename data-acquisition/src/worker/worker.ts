import { Worker, SupabaseClient, process } from '../../deps.ts';
import { SpotifyUserPlaying } from '../music/UserPlaying.ts';
import { connection } from './queue.ts';
import { log } from "../util/log.ts";

import "jsr:@std/dotenv/load";

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

export async function spotifyFire(userId: string, refreshToken: string, supabaseSchema: SupabaseSchema) {
  const supabaseInd = new SupabaseClient(
    Deno.env.get("SB_URL")!,
    Deno.env.get("SERVICE")!,
    { db: { schema: supabaseSchema} }
  );

  const spotifyUserPlaying = new SpotifyUserPlaying(
    supabaseInd,
    userId,
    { refresh_token: refreshToken }
  );

  await spotifyUserPlaying.init();
  await spotifyUserPlaying.fire();
}

const worker = new Worker(
  'my-cron-jobs',
  async (job) => {
    const { userId, refreshToken } = job.data.data;
    
    const SB_SCHEMA = Deno.env.get("SB_SCHEMA");
    if (SB_SCHEMA !== "test" && SB_SCHEMA !== "prod")
      throw new Error("Invalid Supabase schema. Must be 'test' or 'prod'.");

    await spotifyFire(userId, refreshToken, SB_SCHEMA); 

    log(5, `Processed job ${job.id} for user ${userId}`);
  },
  { connection }
);

process.on('unhandledRejection', (err) => {
  log(2, `Unhandled Rejection: ${err}`);
})

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await worker.close();
  log(4, 'Worker and queue closed');
  process.exit(0);
});

