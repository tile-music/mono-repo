import { Album, SpotifyAlbumInfo } from "./Album.ts";
import { Track, SpotifyTrack } from "./Track.ts";

/**
 * @file PlayedTrack.ts
 * @description This file contains the definition of the PlayedTrack class, which represents a track that has been played, including its metadata and popularity.
 */

/**
 * @class PlayedTrack
 * @classdesc Represents a track that has been played, including the time it was played, track information, album information, and its popularity.
 * 
 * @property {Date} playedAt - The date and time when the track was played.
 * @property {TrackInfo} trackInfo - The information about the track.
 * @property {AlbumInfo} albumInfo - The information about the album the track belongs to.
 * @property {number} popularity - The popularity score of the track.
 * 
 * @constructor
 * @param {Date} playedAt - The date and time when the track was played.
 * @param {Track} trackInfo - The information about the track.
 * @param {Album} albumInfo - The information about the album the track belongs to.
 * @param {number} popularity - The popularity score of the track.
 * 
 * @method createDbEntryObject
 * @description Creates an object suitable for database entry, containing the track's popularity, the time it was listened to, and nested objects for track and album information.
 * @returns {Object} An object representing the database entry for the played track.
 */
export class Play {

  private listenedAt: number;
  private trackId: number;
  private albumId: number;

  constructor(albumId: number, trackId: number, listenedAt: number) {
    this.listenedAt = listenedAt;
    this.trackId = trackId;
    this.albumId = albumId;
  }

  public createDbEntryObject() {
    return {
      track_id: this.trackId,
      album_id: this.albumId,
      listened_at: this.listenedAt,
    };
  }
}

export class SpotifyPlay extends Play {
  private trackPopularity: number;
  constructor(albumId: number, trackId: number, listenedAt: number, trackPopularity: number) {
    super(albumId, trackId, listenedAt)
    this.trackPopularity = trackPopularity;
  }
  public override createDbEntryObject() {
    return {
      ...super.createDbEntryObject(),
      track_popularity: this.trackPopularity
    }
  }
}