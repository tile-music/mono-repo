
import { Play, SpotifyPlay } from "../../../src/music/Play.ts";
import {  Track, SpotifyTrack} from '../../../src/music/Track.ts';

import { expect } from "jsr:@std/expect";
import { supabase } from "../supabase.ts";
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

      const trackInfo = new Track(trackName, trackArtists, isrc, durationMs, new Play(4235236236234531512612, supabase, "blah"), supabase, 98);

      expect(trackInfo).toBeInstanceOf(Track);
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

      const trackInfo = new Track(trackName, trackArtists, isrc, durationMs, new Play(4235236236234531512612, supabase, "blah"), supabase, 97);
      const dbEntry = trackInfo.createDbEntryObject();

      expect(dbEntry).toEqual({
        album_id: 97,
        isrc: isrc,
        track_name: trackName,
        track_artists: trackArtists,
        track_duration_ms: durationMs,
      });
    });
  });
  await t.step("spotify class", async (t) => {
    await t.step('should create an instance of SpotifyTrackInfo with correct properties', () => {
      const trackName = 'Test Track';
      const trackArtists = ['Artist1', 'Artist2'];
      const isrc = 'US1234567890';
      const durationMs = 300000;
      const spotifyId = '1234567890';

      const spotifyTrackInfo = new SpotifyTrack(trackName, trackArtists, isrc, durationMs, spotifyId,  new Play(4235236236234531512612, supabase, "blah"), supabase, 99);

      expect(spotifyTrackInfo).toBeInstanceOf(SpotifyTrack);
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
      const spotifyTrackInfo = new SpotifyTrack(trackName, trackArtists, isrc, durationMs, spotifyId,  new SpotifyPlay(4235236236234531512612,popularity, supabase, "blah"), supabase, 38);
      const dbEntry = spotifyTrackInfo.createDbEntryObject();

      expect(dbEntry).toEqual({
        album_id: 38,
        isrc: isrc,
        track_name: trackName,
        track_artists: trackArtists,
        track_duration_ms: durationMs,
        spotify_id: spotifyId,
      });
    });
  })

});
