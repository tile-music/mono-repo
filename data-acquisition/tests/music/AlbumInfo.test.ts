import { AlbumInfo } from '../../src/music/AlbumInfo';

describe('AlbumInfo class', () => {
  test('constructor should initialize properties correctly', () => {
    const albumInfo = new AlbumInfo(
      "Lenny Skinny",
      "Album",
      ["lenny skinny"],
      "placeholder",
      30,
      12,
      2012,
      12,
      ["Rock"],
      "123456789012",
      "1234567890123",
      "US1234567890"
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
    expect(albumInfo['upc']).toBe("123456789012");
    expect(albumInfo['ean']).toBe("1234567890123");
    expect(albumInfo['albumIsrc']).toBe("US1234567890");
  });

  test('createDbEntryObject should return correct object', () => {
    const albumInfo = new AlbumInfo(
      "New Artist",
      "Single",
      ["new artist"],
      "new_placeholder",
      15,
      6,
      2021,
      5,
      ["Pop"],
      "987654321098",
      "9876543210987",
      "US9876543210"
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
      upc: "987654321098",
      ean: "9876543210987",
      image: "new_placeholder"
      });
    });
  });