import { AlbumInfo } from "./AlbumInfo";
/**
 * @file TrackInfo.ts
 * @description This file contains the definition of the TrackInfo class, which represents information about a music track.
 */

/**
 * @class TrackInfo
 * @classdesc Represents information about a music track.
 * 
 * @property {string} trackName - The name of the track.
 * @property {string[]} trackArtists - An array of artists associated with the track.
 * @property {string} isrc - The International Standard Recording Code (ISRC) of the track.
 * @property {number} durationMs - The duration of the track in milliseconds.
 * 
 * @constructor
 * @param {string} trackName - The name of the track.
 * @param {string[]} trackArtists - An array of artists associated with the track.
 * @param {string} isrc - The International Standard Recording Code (ISRC) of the track.
 * @param {number} durationMs - The duration of the track in milliseconds.
 * 
 * @method createDbEntryObject
 * @description Creates an object that can be used to create a new entry in the database.
 * @returns {Object} An object that can be used to create a new entry in the database.
 * @todo Change how `indb` is set because this might create a state mismatch.
 */
export class TrackInfo {
  private trackName: string;
  private trackArtists: string[];
  private isrc: string;
  private durationMs: number;

  constructor(
    trackName: string,
    trackArtists: string[],
    isrc: string,
    durationMs: number,
  ) {
    this.trackName = trackName;
    this.trackArtists = trackArtists;
    this.durationMs = durationMs;
    this.isrc = isrc;
    //console.log(this);
  }

  /**
   * this method is used to create an object that can be used to create a new entry in the database
   * @returns an object that can be used to create a new entry in the database
   * @todo change how indb is set because this might create a state mismatch
   */
  public createDbEntryObject() {
    return {
      isrc: this.isrc,
      track_name: this.trackName,
      track_artists: this.trackArtists,
      track_duration_ms: this.durationMs,
    };
  }
}

export class SpotifyTrackInfo extends TrackInfo {
  private spotifyId: string;
  constructor(
    trackName: string,
    trackArtists: string[],
    isrc: string,
    durationMs: number,
    spotifyId: string,
  ) {
    super(trackName, trackArtists, isrc, durationMs);
    this.spotifyId = spotifyId;
  }
  public createDbEntryObject() {
    return {
      ...super.createDbEntryObject(),
      spotify_id: this.spotifyId,

    };
  }
}