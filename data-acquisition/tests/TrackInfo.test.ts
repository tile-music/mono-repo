
import { TrackInfo } from '../src/TrackInfo';

describe('TrackInfo', () => {
  it('should create an instance of TrackInfo with correct properties', () => {
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

  it('should create a correct database entry object', () => {
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