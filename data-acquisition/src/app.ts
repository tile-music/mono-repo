import { Queue, Worker, QueueEvents } from 'bullmq';
import {makeJobs} from './worker/service-adapter';
import { SupabaseClient } from '@supabase/supabase-js';
import { SpotifyUserPlaying } from './music/UserPlaying';
import { fork } from 'node:child_process';
import os from 'os';
import { connection } from './worker/redis';

// Create a Queue instance
const queue = new Queue('my-cron-jobs', { connection });
async function reset() {
  await queue.obliterate({ force: true });
}
reset();
// Create a QueueScheduler to manage job scheduling
makeJobs();


const queueEvents = new QueueEvents('my-cron-jobs', { connection });

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed with error ${failedReason}`);
});
// Graceful shutdown handling
process.on('SIGINT', async () => {
  await queue.close();
  console.log('Worker and queue closed');
  process.exit(0);
});

fork(__dirname + "/worker/webserver.ts");

for (let i = 3; i < os.cpus().length; i++ ){
  fork(__dirname + "/worker/worker.ts");
}