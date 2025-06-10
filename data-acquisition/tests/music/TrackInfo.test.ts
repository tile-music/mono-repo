
import { TrackInfo, SpotifyTrackInfo } from '../../src/music/Track.ts';
import { expect } from "jsr:@std/expect";
/**
 * sharted by chat
 */
Deno.test('TrackInfo classes', async (t) => {
  await t.step("base class", async (t) => {
    await t.step('should create an instance of TrackInfo with correct properties', () => {
      const trackName = 'Test Track';
      const trackArtists = ['Artist1', 'Artist2'];
      const isrc = 'US1234567890';
      const durationMs = 300000;

      const trackInfo = new TrackInfo(trackName, trackArtists, isrc, durationMs);

      expect(trackInfo).toBeInstanceOf(TrackInfo);
      expect(trackInfo['trackName']).toBe(trackName);
      expect(trackInfo['trackArtists']).toBe(trackArtists);
      expect(trackInfo['isrc']).toBe(isrc);
      expect(trackInfo['durationMs']).toBe(durationMs);
    });

    await t.step('should create a correct database entry object', async () => {
      const trackName = 'Test Track';
      const trackArtists = ['Artist1', 'Artist2'];
      const isrc = 'US1234567890';
      const durationMs = 300000;

      const trackInfo = new TrackInfo(trackName, trackArtists, isrc, durationMs);
      const dbEntry = trackInfo.createDbEntryObject();

      expect(dbEntry).toEqual({
        isrc: isrc,
        track_name: trackName,
        track_artists: trackArtists,
        track_duration_ms: durationMs,
      });
    });
  });
  await t.step("spotify class", async (t) => {
    await t.step('should create an instance of SpotifyTrackInfo with correct properties', async () => {
      const trackName = 'Test Track';
      const trackArtists = ['Artist1', 'Artist2'];
      const isrc = 'US1234567890';
      const durationMs = 300000;
      const spotifyId = '1234567890';

      const trackInfo = new TrackInfo(trackName, trackArtists, isrc, durationMs);
      const spotifyTrackInfo = new SpotifyTrackInfo(trackName, trackArtists, isrc, durationMs, spotifyId);

      expect(spotifyTrackInfo).toBeInstanceOf(SpotifyTrackInfo);
      expect(spotifyTrackInfo['trackName']).toBe(trackName);
      expect(spotifyTrackInfo['trackArtists']).toBe(trackArtists);
      expect(spotifyTrackInfo['isrc']).toBe(isrc);
      expect(spotifyTrackInfo['durationMs']).toBe(durationMs);
      expect(spotifyTrackInfo['spotifyId']).toBe(spotifyId);
    });

    await t.step('should create a correct database entry object', async () => {
      const trackName = 'Test Track';
      const trackArtists = ['Artist1', 'Artist2'];
      const isrc = 'US1234567890';
      const durationMs = 300000;
      const popularity = 50;
      const spotifyId = '1234567890';

      const trackInfo = new TrackInfo(trackName, trackArtists, isrc, durationMs);
      const spotifyTrackInfo = new SpotifyTrackInfo(trackName, trackArtists, isrc, durationMs, spotifyId);
      const dbEntry = spotifyTrackInfo.createDbEntryObject();

      expect(dbEntry).toEqual({
        isrc: isrc,
        track_name: trackName,
        track_artists: trackArtists,
        track_duration_ms: durationMs,
        spotify_id: spotifyId,
      });
    });
  })

});