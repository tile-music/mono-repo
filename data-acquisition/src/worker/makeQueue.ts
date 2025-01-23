import { Queue, Worker, QueueEvents } from 'bullmq';

import { connection } from './redis';
/**
 * Creates and returns a new Queue instance configured for cron jobs.
 *
 * The queue is named 'my-cron-jobs' and is configured with the following default job options:
 * - `attempts`: 3 - Each job will be attempted up to 3 times.
 * - `backoff`: An exponential backoff strategy with a delay of 1000 milliseconds.
 *
 * @returns {Queue} A new Queue instance configured with the specified options.
 */
export function makeDataAcqQueue(){
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

export function makeSpotifyAlbumPopularityQueue(){
  return new Queue('spotifyAlbumPopularity', {
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