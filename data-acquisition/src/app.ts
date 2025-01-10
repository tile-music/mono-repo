import { Queue, Worker, QueueEvents } from 'bullmq';
import {makeDataAcqJobs} from './worker/serviceAdapter';
import { SupabaseClient } from '@supabase/supabase-js';
import { SpotifyUserPlaying } from './music/UserPlaying';
import { fork } from 'node:child_process';
import os from 'os';
import { connection } from './worker/redis';
import { makeDataAcqQueue, makeSpotifyAlbumPopularityQueue } from './worker/makeQueue';

// Create a Queue instance
const queue = makeDataAcqQueue();
const queue2 = makeSpotifyAlbumPopularityQueue();
async function reset() {
  await queue.obliterate({ force: true });
  await queue2.obliterate({ force: true });
}
reset();
// Create a QueueScheduler to manage job scheduling
makeDataAcqJobs();


const queueEvents = new QueueEvents('my-cron-jobs', { connection });
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed with error ${failedReason}`);
});

const queueEvents2 = new QueueEvents('spotifyAlbumPopularity', { connection})

queueEvents2.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed with error ${failedReason}`);
});
// Graceful shutdown handling
process.on('SIGINT', async () => {
  await queue.close();
  console.log('Worker and queue closed');
  process.exit(0);
});

fork(__dirname + "/worker/webserver.ts");

for (let i = 0; i < Math.floor(os.cpus().length/2) ; i++ ){
  fork(__dirname + "/worker/worker.ts" );
}
