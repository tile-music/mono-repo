import { Worker } from 'bullmq';
import { updateSpotifyAlbumPopularity } from '../util/updateSpotifyAlbumPopularity';
import { connection } from './redis';


const worker = new Worker('spotifyAlbumPopularity', async () => {
  try {
    console.log("attempting to update Spotify Album Popularity");
    await updateSpotifyAlbumPopularity();
    console.log("Updated Spotify Album Popularity");
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
console.log("Spotify Album Popularity Worker started");