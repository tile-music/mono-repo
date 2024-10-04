import { AlbumInfo } from '../src/AlbumInfo';

describe('AlbumInfo class', () => {
  test('constructor should initialize properties correctly', () => {
    const albumInfo = new AlbumInfo(
      "Lenny Skinny",
      "Album",
      ["lenny skinny"],
      "placeholder",
      new Date("1/1/71"),
      1,
      ["Rock"],
      "123456789012",
      "1234567890123",
      "US1234567890",
      50
    );

    expect(albumInfo['albumName']).toBe("Lenny Skinny");
    expect(albumInfo['albumType']).toBe("Album");
    expect(albumInfo['artists']).toStrictEqual(["lenny skinny"]);
    expect(albumInfo['releaseDate']).toStrictEqual(new Date("1/1/71"));
    expect(albumInfo['numTracks']).toBe(1);
    expect(albumInfo['image']).toBe("placeholder");
    expect(albumInfo['genre']).toStrictEqual(["Rock"]);
    expect(albumInfo['upc']).toBe("123456789012");
    expect(albumInfo['ean']).toBe("1234567890123");
    expect(albumInfo['albumIsrc']).toBe("US1234567890");
    expect(albumInfo['popularity']).toBe(50);
  });

  test('createDbEntryObject should return correct object', () => {
    const albumInfo = new AlbumInfo(
      "Lenny Skinny",
      "Album",
      ["lenny skinny"],
      "placeholder",
      new Date("1/1/71"),
      1,
      ["Rock"],
      "123456789012",
      "1234567890123",
      "US1234567890",
      50
    );

    const dbEntry = albumInfo.createDbEntryObject();
    expect(dbEntry).toStrictEqual({
      album_name: "Lenny Skinny",
      album_type: "Album",
      release_date: new Date("1/1/71").toISOString(),
      num_tracks: 1,
      artists: ["lenny skinny"],
      genre: ["Rock"],
      upc: "123456789012",
      ean: "1234567890123",
      popularity: 50,
      image: "placeholder"
    });
  });
});