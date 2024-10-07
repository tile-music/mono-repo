import { Queue, Worker } from 'bullmq';
import {makeJobs} from './worker/service-adapter';
import { SupabaseClient } from '@supabase/supabase-js';
import { SpotifyUserPlaying } from './music/UserPlaying';
import { fork } from 'node:child_process';
import os from 'os';
import { connection } from './worker/redis';

// Create a Queue instance
const myQueue = new Queue('my-cron-jobs', { connection });
async function reset() {
  await myQueue.obliterate({ force: true });
}
reset();
// Create a QueueScheduler to manage job scheduling
makeJobs(myQueue);


// Worker to process the job

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await myQueue.close();
  console.log('Worker and queue closed');
  process.exit(0);
});

for (let i = 0; i < os.cpus().length; i++ ){
  fork(__dirname + "/worker.ts");
}