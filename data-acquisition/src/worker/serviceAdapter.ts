import { SupabaseClient } from "../../deps.ts";
import { makeDataAcqQueue, makeSpotifyAlbumPopularityQueue } from "./queue.ts";
import { log } from "../util/log.ts";

import "jsr:@std/dotenv/load";

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
  log(5, "Starting makeDataAcqJobs");
  const supabase = new SupabaseClient(
    Deno.env.get("SB_URL")!,
    Deno.env.get("SERVICE")!,
    { db: { schema: "public" } }
  );
  await supabase
    .from("spotify_credentials")
    .select("*")
    .then((items) => {
      log(6, `Found ${items.data?.length || 0} Spotify credentials: ${JSON.stringify(items)}`);
      items.data?.forEach(async (element) => {
        // add single-shot job
        await queue.add(
          "spotify" + element.id,
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

        // add recurring job
        await queue.add(
          "spotify" + element.id,
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
        log(5, `Added Spotify jobs for user ${element.id}`);
      });
    })
}

/**
 * Asynchronously creates and schedules jobs for Spotify album popularity updates.
 *
 * This function initializes a job queue and adds two jobs:
 * 1. A recurring job that runs daily at midnight to update Spotify album popularity.
 * 2. A single-shot job to initialize the Spotify album popularity data.
 *
 * @async
 * @function makeSpotifyAlbumPopularityJobs
 * @returns {Promise<void>} A promise that resolves when the jobs have been added to the queue.
 */
export async function makeSpotifyAlbumPopularityJobs() {
  const queue = makeSpotifyAlbumPopularityQueue();
  log(5, "Starting makeSpotifyAlbumPopularityJobs");
  await queue.add(
    'spotifyAlbumPopularityCronJob',
    { string: "update" },
    {
      repeat: { pattern: "0 0 * * *" },
    }
  );
  log(5, "Added recurring job for SpotifyAlbumPopularity update");
  await queue.add(
    'spotifyAlbumPopularitySingleShot',
    { string:  "initialize" },
    { removeOnComplete: true, 
      removeOnFail: true }
  );
  log(5, "Added single-shot job for SpotifyAlbumPopularity initialization");
}