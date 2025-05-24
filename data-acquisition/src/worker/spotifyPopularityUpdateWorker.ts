import { Worker, process } from '../../deps.ts';
import { updateSpotifyAlbumPopularity } from '../util/updateSpotifyInfo.ts';
import { connection } from './redis.ts';

const worker = new Worker('spotifyAlbumPopularity', async () => {
  try {
    await updateSpotifyAlbumPopularity();
    console.log(`Spotify Album Popularity updated at ${new Date()}`);
  } catch (error) {
    console.error("Error updating Spotify Album Popularity:", error);
  }
}, { connection });

process.on('unhandledRejection', (err) => {
  console.error(err);
})
// Graceful shutdown handling
process.on('SIGINT', async () => {
  await worker.close();
  console.log('Worker and queue closed');
  process.exit(0);
});
