import { Worker } from 'bullmq';
import {makeJobs} from './service-adapter';
import { SupabaseClient } from '@supabase/supabase-js';
import { SpotifyUserPlaying } from '../music/UserPlaying';
import { fork } from 'node:child_process';
import os from 'node:os';
import { connection } from './redis';
export async function spotifyFire(userId: string, refreshToken: string) {
  const supabaseInd = new SupabaseClient(
    process.env.SB_URL as string,
    process.env.SERVICE as string,
    { db: { schema: "test" } }
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
    
    spotifyFire(userId, refreshToken);

    console.log(
      `Processing job ${job.id} at ${new Date()} for user ${userId}`
    );

    // Proceed with further actions using spotifyUserPlaying
  },
  { connection }
);

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await worker.close();
  console.log('Worker and queue closed');
  process.exit(0);
});