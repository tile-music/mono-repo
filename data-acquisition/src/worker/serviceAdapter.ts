import { SupabaseClient, dotenv, process } from "../../deps.ts";
import { makeDataAcqQueue, makeSpotifyAlbumPopularityQueue } from "./makeQueue.ts";

dotenv.config();
/**
 */
/**
 * Asynchronously creates and schedules jobs for Spotify credentials.
 *
 * This function initializes a job queue and connects to a Supabase client to fetch Spotify credentials.
 * For each credential, it adds two jobs to the queue:
 * 1. A one-time job with the user's Spotify credentials.
 * 2. A recurring job that runs every 30 minutes with the user's Spotify credentials.
 *
 * @async
 * @function makeJobs
 * @returns {Promise<void>} A promise that resolves when the jobs have been added to the queue.
 * @todo: add a perameter instead of creating a new queue
 * @todo: deduplicate 
*/
export async function makeDataAcqJobs() {
  const queue = makeDataAcqQueue();
  console.log("makeJobs");
  const supabase = new SupabaseClient(
    process.env.SB_URL as string,
    process.env.SERVICE as string,
    { db: { schema: "public" } }
  );
  await supabase
    .from("spotify_credentials")
    .select("*")
    .then((items) => {
      console.log(items);
      items.data?.forEach(async (element) => {
        await queue.add(
          "spotify" + element,
          {
            data: {
              userId: element.id,
              refreshToken: element.refresh_token,
            },
          },
          {
            jobId: "spotify" + element.id,
          }
        );
        await queue.add(
          "spotify" + element,
          {
            data: {
              userId: element.id,
              refreshToken: element.refresh_token,
            },
          },
          {
            repeat: { pattern: "0/30 * * * *" },
            jobId: "spotify" + element.id,
          }
        );
      });
    })
}
/** if you'd like to update sooner you could get rid of the second 0 and even the first */
export async function makeSpotifyAlbumPopularityJobs() {
  const queue = makeSpotifyAlbumPopularityQueue();
  console.log("makeJobs for SpotifyAlbumPopularity");
  await queue.add(
    'spotifyAlbumPopularityCronJob',
    { string: "update" },
    {
      repeat: { pattern: "0 0 * * *" },
    }
  );
  console.log("added job for SpotifyAlbumPopularity update");
  await queue.add(
    'spotifyAlbumPopularitySingleShot',
    { string:  "initialize" },
    { removeOnComplete: true, 
      removeOnFail: true }
  );
}