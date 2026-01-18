import { Album, SpotifyAlbum } from '../../../src/music/Album.ts';
import { expect } from "jsr:@std/expect";
import { supabase } from "../supabase.ts"

/* @ibixler add worst case tests as well */
Deno.test('base classes', async (t) => {
  const album = new Album(
    "Lenny Skinny",
    "Album",
    ["lenny skinny"],
    "placeholder",
    30,
    12,
    2012,
    12,
    ["Rock"],
    supabase
  );
  await t.step('constructor should initialize properties correctly', () => {

    expect(album['title']).toBe("Lenny Skinny");
    expect(album['albumType']).toBe("Album");
    expect(album['artists']).toStrictEqual(["lenny skinny"]);
    expect(album['releaseDay']).toStrictEqual(30);
    expect(album['releaseMonth']).toStrictEqual(12);
    expect(album['releaseYear']).toStrictEqual(2012);
    expect(album['numTracks']).toBe(12);
    expect(album['image']).toBe("placeholder");
    expect(album['genre']).toStrictEqual(["Rock"]);


  });

  await t.step('createDbEntryObject should return correct object', () => {
    const dbEntry = album.createDbEntryObject();
    expect(dbEntry).toStrictEqual({
      album_name: "Lenny Skinny",
      album_type: "Album",
      release_day: 30,
      release_month: 12,
      release_year: 2012,
      num_tracks: 12,
      artists: ["lenny skinny"],
      genre: ["Rock"],
      image: "placeholder",

    });
  });
});
Deno.test('spotify class', async (t) => {
  await t.step('constructor should initialize properties correctly', () => {
    const albumInfo = new SpotifyAlbum(
      "Lenny Skinny",
      "Album",
      ["lenny skinny"],
      "placeholder",
      30,
      12,
      2012,
      12,
      ["Rock"],
      supabase,

      "spoturi1234567890",
      47
    );



    expect(albumInfo['title']).toBe("Lenny Skinny");
    expect(albumInfo['albumType']).toBe("Album");
    expect(albumInfo['artists']).toStrictEqual(["lenny skinny"]);
    expect(albumInfo['releaseDay']).toStrictEqual(30);
    expect(albumInfo['releaseMonth']).toStrictEqual(12);
    expect(albumInfo['releaseYear']).toStrictEqual(2012);
    expect(albumInfo['numTracks']).toBe(12);
    expect(albumInfo['image']).toBe("placeholder");
    expect(albumInfo['genre']).toStrictEqual(["Rock"]);

    expect(albumInfo['spotifyId']).toBe("spoturi1234567890");
    expect(albumInfo["albumId"]).toBe(47)
  });
  await t.step('createDbEntryObject should return correct object', async () => {
    const albumInfo = new SpotifyAlbum(
      "New Artist",
      "Single",
      ["new artist"],
      "new_placeholder",
      15,
      6,
      2021,
      5,
      ["Pop"],
      supabase,
      "9876543210",
      213
    );

    const dbEntry = albumInfo.createDbEntryObject();
    console.log(dbEntry)
    expect(dbEntry).toStrictEqual({
      album_id:213,
      album_name: "New Artist",
      album_type: "Single",
      release_day: 15,
      release_month: 6,
      release_year: 2021,
      num_tracks: 5,
      artists: ["new artist"],
      genre: ["Pop"],
      image: "new_placeholder",
      spotify_id: "9876543210",
    });
  });
  

});
