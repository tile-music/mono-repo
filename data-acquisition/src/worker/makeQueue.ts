import { Queue, Worker, QueueEvents } from 'bullmq';

import { connection } from './redis';
export function makeQueue(){
  return new Queue('my-cron-jobs', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  });
}