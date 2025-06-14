import { Play, SpotifyPlay } from "./Play.ts"
import { SupabaseClient } from "../../deps.ts";
import { supabase } from "../../tests/music/supabase.ts";
import {log} from "../util/log.ts"
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
export class Track {
  readonly trackName: string;
  readonly trackArtists: string[];
  readonly isrc: string;
  readonly durationMs: number;
  protected play: Play;
  protected query;
  protected trackId?: number;
  protected supabase;

  constructor(
    trackName: string,
    trackArtists: string[],
    isrc: string,
    durationMs: number,
    supabase: SupabaseClient<any, "prod" | "test", any>,
  ) {
    this.trackName = trackName;
    this.trackArtists = trackArtists;
    this.durationMs = durationMs;
    this.isrc = isrc;
    this.play = play;
    this.supabase = supabase;
    this.query = supabase.from("tracks").select("track_id")
    //console.log(this);
  }

  protected queryHelper() {
    return this.query
      .eq("isrc", this.isrc)
  }

  /**
   * Retrieves the database ID for the current album instance.
   * 
   * This method queries the database for an album entry matching the current
   * album's name and release date (year, month, day). If no matching entry is found,
   * it attempts to insert a new album record. If the operation fails or returns no data,
   * an error is thrown. If multiple matching entries are found, a warning is logged.
   * 
   * @returns {Promise<number>} The album's database ID.
   * @throws {Error} If the album cannot be inserted or retrieved from the database.
   * @todo find some intelligent way to fall back to a worse query, which should never happen in reality
   */
  public async getTrackDbID() : Promise<number> {
    if (this.trackId) return this.trackId;
    let { data, error } = await this.queryHelper()
    
    if (error?.code === "2305") {
      ({ data, error } = await this.supabase.from("albums").insert(this.createDbEntryObject()));
    }
    if (error || data === null) {log(6, `data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`)}
    if (data.length > 1) log(3, `multiple matching entries for base album class, 
      Album: ${JSON.stringify(this.createDbEntryObject())} 
      Data: ${JSON.stringify(data)}`)
    this.trackId = data[0].track_id;
    return data[0].track_id;
  }

  /**
   * this method is used to create an object that can be used to create a new entry in the database
   * @returns an object that can be used to create a new entry in the database
   */
  public createDbEntryObject() {
    return {
      isrc: this.isrc,
      track_name: this.trackName,
      track_artists: this.trackArtists,
      track_duration_ms: this.durationMs,
    };
  }
  
  public createPlayDbEntryObject() {
    return { ...this.play.createDbEntryObject() };
  }
}

export class SpotifyTrack extends Track {
  private spotifyId: string;
  constructor(
    trackName: string,
    trackArtists: string[],
    isrc: string,
    durationMs: number,
    spotifyId: string,
  ) {
    super(trackName, trackArtists, isrc, durationMs,supabase);

    this.spotifyId = spotifyId;
  }

  public override createDbEntryObject() {
    return {
      ...super.createDbEntryObject(),
      spotify_id: this.spotifyId,
    };
  }
}