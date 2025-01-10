import { Worker } from 'bullmq';
import {makeDataAcqJobs} from './serviceAdapter';
import { SupabaseClient } from '@supabase/supabase-js';
import { SpotifyUserPlaying } from '../music/UserPlaying';
import { updateSpotifyAlbumPopularity } from '../util/updateSpotifyAlbumPopularity';
import { fork } from 'node:child_process';
import os from 'node:os';
import { connection } from './redis';
import dotenv from 'dotenv';

dotenv.config();
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
    process.env.SB_URL as string,
    process.env.SERVICE as string,
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
  async (job: any) => {
    const { userId, refreshToken } = job.data.data;
    
    await spotifyFire(userId, refreshToken, process.env.SB_SCHEMA as SupabaseSchema); 

    console.log(
      `Processing job ${job.id} at ${new Date()} for user ${userId}`
    );

    // Proceed with further actions using spotifyUserPlaying
  },
  { connection }
);

const worker2 = new Worker("spotifyAlbumPopularity", async (job: any) => {
  await updateSpotifyAlbumPopularity();
  console.log("Updated Spotify Album Popularity");
}, { connection });

console.log("Worker and queue started");

process.on('unhandledRejection', (err) => {
  console.error(err);
})

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await worker.close();
  await worker2.close();
  console.log('Worker and queue closed');
  process.exit(0);
});