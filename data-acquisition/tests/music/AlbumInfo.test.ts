import { Album, SpotifyAlbumInfo } from '../../src/music/Album.ts';
import { expect } from "jsr:@std/expect";
import {supabase} from "./supabase.ts"
console.log(supabase)
Deno.test('base classes', async (t) => {
  await t.step('constructor should initialize properties correctly', () => {
    const albumInfo = new Album(
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

    expect(albumInfo['albumName']).toBe("Lenny Skinny");
    expect(albumInfo['albumType']).toBe("Album");
    expect(albumInfo['artists']).toStrictEqual(["lenny skinny"]);
    expect(albumInfo['releaseDay']).toStrictEqual(30);
    expect(albumInfo['releaseMonth']).toStrictEqual(12);
    expect(albumInfo['releaseYear']).toStrictEqual(2012);
    expect(albumInfo['numTracks']).toBe(12);
    expect(albumInfo['image']).toBe("placeholder");
    expect(albumInfo['genre']).toStrictEqual(["Rock"]);

  });

  await t.step('createDbEntryObject should return correct object', () => {
    const albumInfo = new Album(
      "New Artist",
      "Single",
      ["new artist"],
      "new_placeholder",
      15,
      6,
      2021,
      5,
      ["Pop"],
      supabase


    );

    const dbEntry = albumInfo.createDbEntryObject();
    expect(dbEntry).toStrictEqual({
      album_name: "New Artist",
      album_type: "Single",
      release_day: 15,
      release_month: 6,
      release_year: 2021,
      num_tracks: 5,
      artists: ["new artist"],
      genre: ["Pop"],
      image: "new_placeholder"
    });
  });
});
Deno.test('spotify classes', async (t) => {
  await t.step('constructor should initialize properties correctly', () => {
    const albumInfo = new SpotifyAlbumInfo(
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

      "spoturi1234567890"
    );

    expect(albumInfo['albumName']).toBe("Lenny Skinny");
    expect(albumInfo['albumType']).toBe("Album");
    expect(albumInfo['artists']).toStrictEqual(["lenny skinny"]);
    expect(albumInfo['releaseDay']).toStrictEqual(30);
    expect(albumInfo['releaseMonth']).toStrictEqual(12);
    expect(albumInfo['releaseYear']).toStrictEqual(2012);
    expect(albumInfo['numTracks']).toBe(12);
    expect(albumInfo['image']).toBe("placeholder");
    expect(albumInfo['genre']).toStrictEqual(["Rock"]);

    expect(albumInfo['spotifyId']).toBe("spoturi1234567890");
  });
  await t.step('createDbEntryObject should return correct object', async () => {
    const albumInfo = new SpotifyAlbumInfo(
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

      "9876543210"
    );

    const dbEntry = albumInfo.createDbEntryObject();
    expect(dbEntry).toStrictEqual({
      album_name: "New Artist",
      album_type: "Single",
      release_day: 15,
      release_month: 6,
      release_year: 2021,
      num_tracks: 5,
      artists: ["new artist"],
      genre: ["Pop"],
      image: "new_placeholder",
      spotify_id: "9876543210"
    });

  });
});
