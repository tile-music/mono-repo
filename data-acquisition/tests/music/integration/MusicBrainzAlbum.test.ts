import { SupabaseClient } from "../../../deps.ts";
import { supabase } from "../supabase.ts";

import { SpotifyAlbum, TestData } from "../../../src/music/Album.ts";
import { testData0 } from "./TestData.ts";
import { SpotifyMusicBrainzAlbum, MusicBrainzAlbum } from "../../../src/music/MusicBrainz/MusicBrainzAlbum.ts";
import { Database } from "../../../../lib/schema.ts"
import { expect } from "jsr:@std/expect";
Deno.test("MusicBrainzAlbum Tests ", async (t) => {

  const { data, error } = await supabase.auth.signUp({
    email: "test1@example.com",
    password: "password",
  });

  if (error) throw error;

  const userId = data.user?.id || "";
  const testAlbum = async (testDataItem: TestData) => {
    const spotifyAlbum = SpotifyAlbum.fromTestData(testDataItem, supabase, userId);
    await spotifyAlbum.fire()
    const musicbrainzAlbum = new SpotifyMusicBrainzAlbum(spotifyAlbum, supabase);
    await musicbrainzAlbum.fire();
  }
  type AlbumMbidRow = Database["test" | "prod"]["Tables"]["album_mbids"]["Row"];
  // Example: specify the type for album_mbids, assuming it's an array of rows
  // Remove or update this line if not needed
  // const albumMbids: Database["test"]["Tables"]["album_mbids"][] = [];
  function uniqueByAlbumId(data: AlbumMbidRow[]) {
    const seen = new Set<number>();
    return data.filter(item => {
      if (seen.has(item.album_id)) {
        return false;
      }
      seen.add(item.album_id);
      return true;
    });
  }

  /* await t.step("SpotifyMusicBrainzAlbum no fallback", async () => {
    for (const t of testData0) {
      await testAlbum(t);
    }
    const { data, error: _error } = await supabase.from("album_mbids").select("*");
    expect(uniqueByAlbumId(data as AlbumMbidRow[])).toHaveLength(testData0.length);
  }) */
  await t.step("SpotifyMusicBrainzAlbum no fallback", async () => {
    const spotifyAlbum = SpotifyAlbum.fromTestData(testData0[3], supabase, userId);
    await spotifyAlbum.fire()
    const musicbrainzAlbum = new SpotifyMusicBrainzAlbum(spotifyAlbum, supabase);
    await musicbrainzAlbum.fire();
  })

  await supabase.auth.admin.deleteUser(userId);
})