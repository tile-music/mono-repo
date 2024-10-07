import { SpotifyUserPlaying, UserPlaying } from "../music/UserPlaying";
import { SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { spotifyFire } from "./worker";
dotenv.config();
export async function makeJobs(queue: any) {
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
        await spotifyFire(element.id, element.refresh_token);
        await queue.add(
          "spotify" + element,
          {
            data: {
              userId: element.id,
              refreshToken: element.refresh_token,
            },
          },
          {
            repeat: { cron: "0,30 * * * *" },
            jobId: "spotify" + element.id,
          }
        );
      });
    });
}
