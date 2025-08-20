import { SupabaseClient } from "../../../deps.ts";
import { supabase } from "../supabase.ts";

import { SpotifyAlbum } from "../../../src/music/Album.ts";
import { testData0 } from "./TestData.ts";
import { SpotifyMusicBrainzAlbum } from "../../../src/music/MusicBrainz/MusicBrainzAlbum.ts";
Deno.test("MusicBrainzAlbum Tests ", async (t) => {

  const { data, error } = await supabase.auth.signUp({
    email: "test1@example.com",
    password: "password",
  });

  if (error) throw error;

  const userId = data.user?.id || "";

  await t.step("SpotifyMusicBrainzAlbum no fallback", async () => {
    const spotifyAlbum = SpotifyAlbum.fromTestData(testData0[0],supabase, userId); 
    await spotifyAlbum.fire()
    const musicbrainzAlbum = new SpotifyMusicBrainzAlbum(spotifyAlbum, supabase);
    await musicbrainzAlbum.fire();
  }) 

  await supabase.auth.admin.deleteUser(userId);
})