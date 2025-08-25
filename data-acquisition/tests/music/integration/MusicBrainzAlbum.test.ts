import { SupabaseClient } from "../../../deps.ts";
import { supabase } from "../supabase.ts";

import { SpotifyAlbum, TestData } from "../../../src/music/Album.ts";
import { testData0 } from "./TestData.ts";
import { SpotifyMusicBrainzAlbum } from "../../../src/music/MusicBrainz/MusicBrainzAlbum.ts";
Deno.test("MusicBrainzAlbum Tests ", async (t) => {

  const { data, error } = await supabase.auth.signUp({
    email: "test1@example.com",
    password: "password",
  });

  if (error) throw error;

  const userId = data.user?.id || "";
  const testAlbum = async (testDataItem: TestData) => {
    const spotifyAlbum = SpotifyAlbum.fromTestData(testDataItem,supabase, userId); 
    await spotifyAlbum.fire()
    const musicbrainzAlbum = new SpotifyMusicBrainzAlbum(spotifyAlbum, supabase);
    await musicbrainzAlbum.fire();

  }
  await t.step("SpotifyMusicBrainzAlbum no fallback", async () => {
    for (const t of testData0) {
      await testAlbum(t);
    }
  }) 

  await supabase.auth.admin.deleteUser(userId);
})