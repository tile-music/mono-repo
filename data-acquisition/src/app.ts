import { Queue, Worker } from 'bullmq';
import {makeJobs} from './service-adapter';
const connection = {
  host: 'localhost',
  port: 6379,
};

// Create a Queue instance
const myQueue = new Queue('my-cron-jobs', { connection });
async function reset() {
  await myQueue.obliterate({ force: true });
}
reset();
// Create a QueueScheduler to manage job scheduling
makeJobs(myQueue);


// Worker to process the jobs
const worker = new Worker(
  'my-cron-jobs',
  async (job:any) => {
    console.log(
      `Processing job ${job.id} at ${new Date()} with data: ${job.data.jobData}`
    );
  },
  { connection }
);

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await worker.close();
  await myQueue.close();
  console.log('Worker and queue closed');
  process.exit(0);
});
