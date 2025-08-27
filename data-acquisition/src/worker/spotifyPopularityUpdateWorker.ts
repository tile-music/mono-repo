import { Worker, process } from '../../deps.ts';
import { updateSpotifyAlbumPopularity } from '../util/updateSpotifyInfo.ts';
import { connection } from './queue.ts';
import { log } from "../util/log.ts";

const worker = new Worker('spotifyAlbumPopularity', async () => {
  try {
    await updateSpotifyAlbumPopularity();
    log(5, `Spotify Album Popularity updated at ${new Date()}`);
  } catch (error) {
    log(2, `Error updating Spotify Album Popularity: ${error}`);
  }
}, { connection });

process.on('unhandledRejection', (err) => {
  log(2, `Unhandled Rejection: ${err}`);
})
// Graceful shutdown handling
process.on('SIGINT', async () => {
  await worker.close();
  log(4, 'Worker and queue closed');
  process.exit(0);
});
