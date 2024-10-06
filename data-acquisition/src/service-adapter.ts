import { SpotifyUserPlaying, UserPlaying } from "./UserPlaying";
import { SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
export async function makeJobs(queue: any) {
  console.log ("makeJobs");
  const supabase = new SupabaseClient(
    process.env.SB_URL as string,
    process.env.SERVICE as string,
    { db: { schema: "public" } }
  );
  await supabase
    .from("spotify_credentials")
    .select("*")
    .then((items) =>{
      console.log(items);
      items.data?.forEach(async (element) =>  {
        const supabaseInd = new SupabaseClient(
          process.env.SB_URL as string,
          process.env.SERVICE as string,
          
          { db: { schema: "test" } }
        );
        const spotifyUserPlaying = new SpotifyUserPlaying(
          supabaseInd,
          element.id,
          { refresh_token: element.refresh_token }
        );
        await queue.add(
          "spotify" + element,
          { data: spotifyUserPlaying.fire() },
          {
            repeat: { cron: "* * * * * *" },
            jobId: "spotify" + element.id,
          }
        );
      })
    });
}
