import { json } from "node:stream/consumers";
import { Album, SpotifyAlbum } from "./Album.ts";
import { Track, SpotifyTrack } from "./Track.ts";
import { SupabaseClient } from "../../deps.ts";
import { Fireable } from "./Fireable.ts";

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
export class Play implements Fireable {

  private listenedAt: number;
  private trackId?: number;
  private albumId?: number;
  private isrc?: string;
  private userId: string;
  protected supabase: SupabaseClient<any, "prod" | "test", any>;

  constructor(listenedAt: number,
    supabase: SupabaseClient<any, "prod" | "test", any>, userId: string,
    isrc?: string) {
    this.listenedAt = listenedAt;
    this.supabase = supabase;
    this.isrc = isrc;
    this.userId = userId;

  }

  public setAlbumAndTrackId(albumId: number, trackId: number,) {
    this.trackId = trackId;
    this.albumId = albumId;
  }

  public createDbEntryObject() {
    if (!this.trackId || !this.albumId) throw new Error(`album or track id not defined on Play:${JSON.stringify(this)}`)
    return {
      track_id: this.trackId,
      listened_at: this.listenedAt,
      isrc: this.isrc,
      user_id: this.userId,
    };
  }

  public async fire(): Promise<void> {
    const {data: _data, error} = await this.supabase.from("played_tracks").insert(this.createDbEntryObject());
    if(error) throw new Error(`play failed to insert Play: ${JSON.stringify(this.createDbEntryObject())} error: ${JSON.stringify(error)}`)
  }
}

export class SpotifyPlay extends Play {
  private trackPopularity: number;
  constructor(listenedAt: number, trackPopularity: number, supabase: SupabaseClient<any, "prod" | "test", any>, userId: string, isrc?: string) {
    super(listenedAt, supabase, userId, isrc)
    this.trackPopularity = trackPopularity;
  }
  public override createDbEntryObject() {
    return {
      ...super.createDbEntryObject(),
      track_popularity: this.trackPopularity
    }
  }
}