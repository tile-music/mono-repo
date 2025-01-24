import { SupabaseClient } from "@supabase/supabase-js";
import { SpotifyUpdateData, updateSpotifyAlbumPopularityHelper, selectString, updateSpotifyAlbumPopularity } from "../../src/util/updateSpotifyInfo";
import { Client, Player } from "spotify-api.js";
import { SpotifyUserPlaying } from "../../src/music/UserPlaying";

import dotenv from "dotenv";
import fs from 'fs';
import { PostgrestBuilder } from "@supabase/postgrest-js";

dotenv.config();
describe("Test updateSpotifyAlbumPopularity", () => {
  let supabase: SupabaseClient<any, "test", any> = new SupabaseClient(
    process.env.SB_URL_TEST as string,
    process.env.SERVICE as string,
    { db: { schema: "test" } }
  );;
  let spotifyClient: Client;
  let spotifyData: SpotifyUpdateData[] = [];
  

  beforeAll(async () => {

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
  
 //you can use this if you need to remake the test data
  /* describe("fetch testdata from db", () => {
    test("get data ", async () => {
      const userPlayedData = await supabase.schema("prod").from("played_tracks").select(selectString).limit(25);
      //console.log("data: ", userPlayedData);
      fs.writeFileSync('tests/util/test-data.json', JSON.stringify(userPlayedData.data));
    });
  }) */

  test("test update SpotifyAlbumPopularityHelper", async () => {
    const data = fs.readFileSync('tests/util/test-data.json', 'utf8');
    spotifyData = JSON.parse(data);
    console.log("spotifyData: ", spotifyData.length);
    const ret = await updateSpotifyAlbumPopularityHelper(spotifyClient.token, "test", false, undefined, spotifyData)
    expect(ret.size).toBe(spotifyData.length);
    ret.forEach((r) => {
      expect(r.albums.spotify_id).toBeDefined();
      expect(r.album_popularity).toBeGreaterThanOrEqual(0);
    })
  }, 1000000000);
  describe("test using real data", () => {
    let userId: string;
    let spotifyUserPlaying;
    /** the type should be some kind of postgrest builder but im lazy👅 */
    let query: any;

    beforeAll(async () => {
      const { data, error } = await supabase.auth.signUp({
        email: "test4@example.com",
        password: "password",
      });
      if (error) throw error;
      userId = data.user?.id as string;
      if (userId === '' || userId === undefined) throw Error("userId is empty");
      spotifyUserPlaying = new SpotifyUserPlaying(
        supabase,
        userId,
        { refresh_token: process.env.SP_REFRESH }
      );
      await spotifyUserPlaying.init();
      await spotifyUserPlaying.fire();
      query = (supabase.schema("test").from("played_tracks").select(selectString).eq("user_id", userId))
    })
    afterAll(async () => {
      await supabase.auth.admin.deleteUser(userId);
    })
    test("use real data", async () => {
      await  updateSpotifyAlbumPopularityHelper(spotifyClient.token, "test", false)
      let { data, error } = await query;
      let typedData = data as unknown as SpotifyUpdateData[];
      if (error) throw error;
      expect(data?.length).toBeGreaterThan(0);
      typedData?.forEach((d) => {
        console.log(d)
        expect(d.album_popularity === null).toBeFalsy();
      })
    }, 10000)
    test("test update using real data with albums having no spotify ids", async () => {
      let localQuery = query;
      localQuery = localQuery.gte("listened_at", new Date(Date.now().valueOf() - (1000 * 60 * 60 * 24)).valueOf());
      await supabase.schema("test").from("played_tracks").update({ album_popularity: null }).eq("user_id", userId)
      await supabase.schema("test").from("albums").update({spotify_id: null}).gte("num_tracks", 0)
      await updateSpotifyAlbumPopularity();
      const { data, error } = await localQuery;
      if (error) throw error;
      const typedUpdatedData = data as unknown as SpotifyUpdateData[];
      expect(data?.length).toBeGreaterThan(0);
      console.log(data)
      typedUpdatedData?.forEach((d) => {
      
        expect(d.album_popularity === null).toBeFalsy();
        expect(d.albums.spotify_id === null).toBeFalsy();
      })
    }, 10000)
  });
});