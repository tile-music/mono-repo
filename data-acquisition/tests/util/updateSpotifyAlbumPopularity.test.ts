import { SupabaseClient } from "@supabase/supabase-js";
import { SpotifyUpdateData, updateSpotifyAlbumPopularityHelper, selectString, updateSpotifyAlbumPopularity } from "../../src/util/updateSpotifyAlbumPopularity";
import { Client, Player } from "spotify-api.js";
import { SpotifyUserPlaying } from "../../src/music/UserPlaying";

import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();
describe("Test updateSpotifyAlbumPopularity", () => {
  let supabase: SupabaseClient<any, "test", any>;
  let spotifyClient: Client;
  let spotifyData: SpotifyUpdateData[] = [];
  let userId: string;
  
  beforeAll(async () => {
    supabase = new SupabaseClient(
      process.env.SB_URL_TEST as string,
      process.env.ANON as string,
      { db: { schema: "test" } }
    );
    const { data, error } = await supabase.auth.signUp({
      email: "test3@example.com",
      password: "password",
    });
    userId = data.user?.id || "test-user-id";
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
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    //await supabase.rpc("clear_t
    /* const error = await supabase.schema("test").from("played_tracks").delete()
    if(error) throw error; */
    //await supabase.rpc("clear_test_tables");
  });
  /* describe("fetch testdata from db", () => {
    test("get data ", async () => {
      const userPlayedData = await supabase.schema("prod").from("played_tracks").select(selectString).limit(50);
      //console.log("data: ", userPlayedData);
      fs.writeFileSync('tests/util/test-data.json', JSON.stringify(userPlayedData.data));
    });
  }) */

  test("test update SpotifyAlbumPopularityHelper", async () => {
    const data = fs.readFileSync('tests/util/test-data.json', 'utf8');
    spotifyData = JSON.parse(data);
    //console.log("spotifyData: ", spotifyData);
    const ret = await updateSpotifyAlbumPopularityHelper(spotifyClient.token, "test", false, undefined, spotifyData)
    ret.forEach((r) => {
      expect(r.album_popularity).toBeGreaterThanOrEqual(0);
    })
  }, 10000);

  test("use real data", async () => {
    const spotifyUserPlaying = new SpotifyUserPlaying(
      supabase,
      userId,
      { refresh_token: process.env.SP_REFRESH }
    );
    await spotifyUserPlaying.init();
    await expect(spotifyUserPlaying.fire()).resolves.not.toThrow();

    await updateSpotifyAlbumPopularityHelper(spotifyClient.token, "test", false);

    const { data: updatedData, error: updatedError } = (await supabase.schema("test").from("played_tracks").select(selectString).eq("user_id", userId));

    //console.log(updatedData);
    const typedUpdatedData = updatedData as unknown as SpotifyUpdateData[];
    typedUpdatedData?.forEach((d) => {
      console.log(d)
      expect(d.album_popularity).toBeGreaterThanOrEqual(0);
    })
  }, 10000)
  test("test update using prod method", async () => {
    const {data, error} = await supabase.schema("test").from("played_tracks").update({album_popularity: 0}).eq("user_id", userId).select("*");
    if(error) throw error;
    if(data.length === 0) throw new Error("No data found");
    await updateSpotifyAlbumPopularity()
    const {data: updatedData, error: updatedError} = await supabase.schema("test").from("played_tracks").select(selectString).eq("user_id", userId);
    const typedUpdatedData = updatedData as unknown as SpotifyUpdateData[];

    typedUpdatedData?.forEach((d) => {
      expect(d.album_popularity).toBeGreaterThanOrEqual(0);
    })
    
  })
  

});