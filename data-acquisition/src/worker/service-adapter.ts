import { SpotifyUserPlaying, UserPlaying } from "../music/UserPlaying";
import { SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Queue } from "bullmq";
import { connection } from "./redis";
dotenv.config();
/**
 * @todo: add a perameter instead of creating a new queue
 */
export async function makeJobs() {
  const queue = new Queue('my-cron-jobs', { connection });
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
    });
}
