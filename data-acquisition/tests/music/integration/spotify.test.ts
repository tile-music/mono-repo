import { expect } from "@expect";
import { getRecentlyPlayedTracks } from "../../../src/util/spotify.ts";

Deno.test("getRecentlyPlayedTracks - should fetch recently played tracks with proper structure", async () => {
  const refreshToken = Deno.env.get("SP_REFRESH");

  if (!refreshToken) {
    throw new Error("SP_REFRESH environment variable is required for testing");
  }

  const result = await getRecentlyPlayedTracks(refreshToken);

  // Verify top-level structure
  expect(result).toBeDefined();
  expect(typeof result).toBe("object");
  expect(result.href).toBeDefined();
  expect(typeof result.href).toBe("string");
  expect(typeof result.limit).toBe("number");
  expect(result.items).toBeInstanceOf(Array);

});

Deno.test("getRecentlyPlayedTracks - should convert snake_case to camelCase", async () => {
  const refreshToken = Deno.env.get("SP_REFRESH");

  if (!refreshToken) {
    throw new Error("SP_REFRESH environment variable is required for testing");
  }

  const result = await getRecentlyPlayedTracks(refreshToken);

  // Verify camelCase conversion at top level
  expect(result.items).toBeDefined();

  if (result.items.length > 0) {
    const firstItem = result.items[0];

    // Check that camelCase keys exist
    expect(firstItem.playedAt).toBeDefined();
    expect((firstItem as any).played_at).toBeUndefined(); // snake_case should not exist

    // Check track properties
    expect(firstItem.track.durationMs).toBeDefined();
    expect((firstItem.track as any).duration_ms).toBeUndefined();
    expect(firstItem.track.isLocal).toBeDefined();
    expect((firstItem.track as any).is_local).toBeUndefined();
    expect(firstItem.track.trackNumber).toBeDefined();
    expect((firstItem.track as any).track_number).toBeUndefined();

    // Check nested album properties
    expect(firstItem.track.album.albumType).toBeDefined();
    expect((firstItem.track.album as any).album_type).toBeUndefined();
    expect(firstItem.track.album.totalTracks).toBeDefined();
    expect((firstItem.track.album as any).total_tracks).toBeUndefined();
    expect(firstItem.track.album.externalUrls).toBeDefined();
    expect((firstItem.track.album as any).external_urls).toBeUndefined();
    expect(firstItem.track.album.releaseDate).toBeDefined();
    expect((firstItem.track.album as any).release_date).toBeUndefined();

    // Check artists
    expect(firstItem.track.artists[0].externalUrls).toBeDefined();
    expect((firstItem.track.artists[0] as any).external_urls).toBeUndefined();

  }
});

Deno.test("getRecentlyPlayedTracks - should respect custom limit", async () => {
  const refreshToken = Deno.env.get("SP_REFRESH");

  if (!refreshToken) {
    throw new Error("SP_REFRESH environment variable is required for testing");
  }

  const customLimit = 10;
  const result = await getRecentlyPlayedTracks(refreshToken, customLimit);

  expect(result.limit).toBe(customLimit);
  expect(result.items.length).toBeLessThanOrEqual(customLimit);

});

Deno.test("getRecentlyPlayedTracks - should cap limit at 50", async () => {
  const refreshToken = Deno.env.get("SP_REFRESH");

  if (!refreshToken) {
    throw new Error("SP_REFRESH environment variable is required for testing");
  }

  const result = await getRecentlyPlayedTracks(refreshToken, 100);

  // Spotify API max is 50
  expect(result.limit).toBe(50);
  expect(result.items.length).toBeLessThanOrEqual(50);

});

Deno.test("getRecentlyPlayedTracks - should have valid track data structure", async () => {
  const refreshToken = Deno.env.get("SP_REFRESH");

  if (!refreshToken) {
    throw new Error("SP_REFRESH environment variable is required for testing");
  }

  const result = await getRecentlyPlayedTracks(refreshToken, 5);

  if (result.items.length > 0) {
    const track = result.items[0].track;

    // Verify required track fields
    expect(track.id).toBeDefined();
    expect(typeof track.id).toBe("string");
    expect(track.name).toBeDefined();
    expect(typeof track.name).toBe("string");
    expect(track.uri).toBeDefined();
    expect(track.uri).toMatch(/^spotify:track:/);
    expect(typeof track.durationMs).toBe("number");
    expect(track.durationMs).toBeGreaterThan(0);
    expect(typeof track.explicit).toBe("boolean");
    expect(typeof track.popularity).toBe("number");
    expect(track.type).toBe("track");

    // Verify album
    expect(track.album).toBeDefined();
    expect(track.album.id).toBeDefined();
    expect(track.album.name).toBeDefined();
    expect(track.album.images).toBeInstanceOf(Array);
    expect(track.album.images.length).toBeGreaterThan(0);
    expect(track.album.images[0].url).toMatch(/^https?:\/\//);

    // Verify artists
    expect(track.artists).toBeInstanceOf(Array);
    expect(track.artists.length).toBeGreaterThan(0);
    expect(track.artists[0].id).toBeDefined();
    expect(track.artists[0].name).toBeDefined();
    expect(track.artists[0].type).toBe("artist");

    // Verify played_at timestamp
    expect(result.items[0].playedAt).toBeDefined();
    expect(typeof result.items[0].playedAt).toBe("string");

  }
});

Deno.test("getRecentlyPlayedTracks - should handle minimal limit", async () => {
  const refreshToken = Deno.env.get("SP_REFRESH");

  if (!refreshToken) {
    throw new Error("SP_REFRESH environment variable is required for testing");
  }

  const result = await getRecentlyPlayedTracks(refreshToken, 1);

  expect(result.limit).toBe(1);
  expect(result.items.length).toBeLessThanOrEqual(1);

});
