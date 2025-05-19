import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { SpotifyUpdateData, updateSpotifyAlbumPopularityHelper, selectString, updateSpotifyAlbumPopularity } from "../../src/util/updateSpotifyInfo.ts";
import { Client } from "npm:spotify-api.js@latest";
import { SpotifyUserPlaying } from "../../src/music/UserPlaying.ts";
import { expect } from "jsr:@std/expect";

import fs from 'node:fs';



Deno.test("Test updateSpotifyAlbumPopularity", async (t: Deno.TestContext) => {
  let supabase: SupabaseClient<any, "test", any> = new SupabaseClient(
    Deno.env.get("SB_URL_TEST") as string,
    Deno.env.get("SERVICE") as string,
    { db: { schema: "test" } }
  );;
  let spotifyClient: Client;
  let spotifyData: SpotifyUpdateData[] = [];

  spotifyClient = await Client.create({
    refreshToken: true,
    token: {
      clientID: Deno.env.get("SP_CID") as string,
      clientSecret: Deno.env.get("SP_SECRET") as string,
      refreshToken: Deno.env.get("SP_REFRESH") as string,
    },
    onRefresh: () => {
      console.log("token refreshed");
    },
  });

  //you can use this if you need to remake the test data
  /* describe("fetch testdata from db", () => {
    test("get data ", async () => {
      const userPlayedData = await supabase.schema("prod").from("played_tracks").select(selectString).limit(25);
      //console.log("data: ", userPlayedData);
      fs.writeFileSync('tests/util/test-data.json', JSON.stringify(userPlayedData.data));
    });
  }) */

  t.step("test update SpotifyAlbumPopularityHelper", async (t: Deno.TestContext) => {
    const data = fs.readFileSync('tests/util/test-data.json', 'utf8');
    spotifyData = JSON.parse(data);
    console.log("spotifyData: ", spotifyData.length);
    const ret = await updateSpotifyAlbumPopularityHelper(spotifyClient.token, "test", false, undefined, spotifyData)
    expect(ret.size).toBe(spotifyData.length);
    ret.forEach((r) => {
      expect(r.albums.spotify_id).toBeDefined();
      expect(r.album_popularity).toBeGreaterThanOrEqual(0);
    })
  });
  t.step("test using real data", async (t) => {
    let userId: string;
    let spotifyUserPlaying;
    /** the type should be some kind of postgrest builder but im lazy👅 */
    let query: any;

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
      { refresh_token: Deno.env.get("SP_REFRESH") }
    );
    await spotifyUserPlaying.init();
    await spotifyUserPlaying.fire();
    query = (supabase.schema("test").from("played_tracks").select(selectString).eq("user_id", userId))

    afterAll(async () => {
      await supabase.auth.admin.deleteUser(userId);
    })
    t.step("use real data", async () => {
      await updateSpotifyAlbumPopularityHelper(spotifyClient.token, "test", false)
      let { data, error } = await query;
      let typedData = data as unknown as SpotifyUpdateData[];
      if (error) throw error;
      expect(data?.length).toBeGreaterThan(0);
      typedData?.forEach((d) => {
        console.log(d)
        expect(d.album_popularity === null).toBeFalsy();
      })
    })
    t.step("test update using real data with albums having no spotify ids", async () => {
      let localQuery = query;
      localQuery = localQuery.gte("listened_at", new Date(Date.now().valueOf() - (1000 * 60 * 60 * 24)).valueOf());
      await supabase.schema("test").from("played_tracks").update({ album_popularity: null }).eq("user_id", userId)
      await supabase.schema("test").from("albums").update({ spotify_id: null }).gte("num_tracks", 0)
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
    })
  });
});