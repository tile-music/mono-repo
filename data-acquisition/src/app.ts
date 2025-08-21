import { QueueEvents, fork, process } from "../deps.ts"

import { makeDataAcqJobs, makeSpotifyAlbumPopularityJobs } from './worker/serviceAdapter.ts';
import { connection } from './worker/queue.ts';
import { makeDataAcqQueue, makeSpotifyAlbumPopularityQueue } from './worker/queue.ts';

// Create a Queue instance
const queue = makeDataAcqQueue();
const queue2 = makeSpotifyAlbumPopularityQueue();
async function reset() {
  await queue.obliterate({ force: true });
  await queue2.obliterate({ force: true });
}
reset();

// Create a QueueScheduler to manage job scheduling
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
  await queue2.close();
  console.log('Worker and queue closed');
  process.exit(0);
});
console.log("Starting Spotify Album Popularity Worker");
fork(import.meta.dirname + "/worker/spotifyPopularityUpdateWorker.ts");
console.log("Starting Webserver");
fork(import.meta.dirname + "/worker/webserver.ts");

console.log("Starting Spotify Worker");
for (let i = 0; i < Math.floor(navigator.hardwareConcurrency / 2) ; i++ ){
  fork(import.meta.dirname + "/worker/worker.ts" );
}
async function main(){
  await makeDataAcqJobs();
  await makeSpotifyAlbumPopularityJobs();

}
main();
