import { SupabaseClient } from "@supabase/supabase-js";
import { SpotifyUpdateData, updateSpotifyAlbumPopularityHelper } from "../../src/music/updateSpotifyAlbumPopularity";
import { Client, Player } from "spotify-api.js";

import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();
describe("Test updateSpotifyAlbumPopularity", () => {
  let supabase: SupabaseClient<any, "test", any>;
  let spotifyClient: Client;
  let spotifyData: SpotifyUpdateData[] = [];

  beforeAll(async () => {
    supabase = new SupabaseClient(
      process.env.SB_URL_TEST as string,
      process.env.ANON as string,
      { db: { schema: "test" } }
    );
    spotifyClient = await Client.create({
      refreshToken: true,
      token: {
        clientID: process.env.SP_CID as string,
        clientSecret: process.env.SP_SECRET as string,
        refreshToken: process.env.SP_REFRESH as string,
      },
      onRefresh: () => {
        console.log("token refreshed");
      },
    });


  });
  afterAll(async () => {
    supabase = new SupabaseClient(
      process.env.SB_URL_TEST as string,
      process.env.SERVICE as string
    );
    /* const error = await supabase.schema("test").from("played_tracks").delete()
    if(error) throw error; */
    //await supabase.rpc("clear_test_tables");
  });
  describe("fetch testdata from db", () => {
    test("get data ", async () => {
      const userPlayedData = await supabase.schema("prod").from("played_tracks").select(`
        listened_at, track_id, album_id, track_popularity, album_popularity,
        albums (spotify_id) 
        )
      `).limit(50);
      console.log("data: ", userPlayedData);
      fs.writeFileSync('tests/util/test-data.json', JSON.stringify(userPlayedData.data));
    });

  })
  test("test update SpotifyAlbumPopularityHelper", () => {
    fs.readFile('tests/util/test-data.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      spotifyData = JSON.parse(data);
    });
    updateSpotifyAlbumPopularityHelper(spotifyClient.token, "test", false, undefined, spotifyData)

  });
});