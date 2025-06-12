import { SpotifyTrack, Track } from "./Track.ts";
import { SupabaseClient } from "../../deps.ts";
import { log } from "../util/log.ts";
import { json } from "node:stream/consumers";

/**
 * Represents information about a music album.
 * 
 * @class AlbumInfo
 * @classdesc This class holds various details about a music album including its name, type, release date, number of tracks, artists, genre, and identifiers.
 * 
 * @property {string} albumName - The name of the album.
 * @property {string} albumType - The type of the album (e.g., single, album, EP).
 * @property {number} numTracks - The number of tracks in the album.
 * @property {Date} releaseDate - The release date of the album.
 * @property {string[]} artists - The list of artists involved in the album.
 * @property {string[]} genre - The genres associated with the album.
 * @property {string} upc - The Universal Product Code of the album.
 * @property {string} ean - The European Article Number of the album.
 * @property {string} albumIsrc - The International Standard Recording Code of the album.
 * @property {string} image - The URL or path to the album's cover image.
 * 
 * @constructor
 * @param {string} albumName - The name of the album.
 * @param {string} albumType - The type of the album.
 * @param {string[]} artists - The list of artists involved in the album.
 * @param {string} image - The URL or path to the album's cover image.
 * @param {Date} releaseDate - The release date of the album.
 * @param {number} numTracks - The number of tracks in the album.
 * @param {string[]} genre - The genres associated with the album.
 * @param {string} upc - The Universal Product Code of the album.
 * @param {string} ean - The European Article Number of the album.
 * @param {string} albumIsrc - The International Standard Recording Code of the album.
 * @param {number} albumId - The id of said album in the database
 * @param {string} primaryIdent - the primary identifier for album (differs depending on service)
 * 
 * @method createDbEntryObject
 * @description Creates an object that can be used to create a new entry in the database.
 * @returns {Object} An object containing the album information formatted for database entry.
 */
export class Album {
  private albumName: string;
  private albumType: string;
  private numTracks: number;
  private releaseDay: number | null;
  private releaseMonth: number | null;
  private releaseYear: number;
  private artists: string[];
  private genre: string[];
  private image: string;
  private albumId?: number;
  protected primaryIdent: string;
  protected supabase: SupabaseClient<any, "prod" | "test", any>;
  protected query;

  protected tracks: Track[] = [];

  constructor(
    albumName: string,
    albumType: string,
    artists: string[],
    image: string,
    releaseDay: number | undefined,
    releaseMonth: number | undefined,
    releaseYear: number,
    numTracks: number,
    genre: string[],
    supabase: SupabaseClient<any, "prod" | "test", any>
  ) {
    this.albumName = albumName;
    this.albumType = albumType;
    this.artists = artists;
    this.releaseDay = releaseDay ? releaseDay : null;
    this.releaseMonth = releaseMonth ? releaseMonth : null;
    this.releaseYear = releaseYear;
    this.numTracks = numTracks;
    this.image = image;
    this.genre = genre;
    this.primaryIdent = `${albumName},${this.artists.join(",")}`;
    this.supabase = supabase;
    //console.log(this);
    this.query = this.supabase.from("albums").select("album_id")
  }

  protected queryHelper() {
    return this.query
      .eq("album_name", this.albumName)
      .eq("release_year", this.releaseYear)
      .eq("release_month", this.releaseMonth)
      .eq("release_day", this.releaseDay)
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
  public async getAlbumDbID() : Promise<number> {
    if (this.albumId) return this.albumId;
    let { data, error } = await this.queryHelper()
    log(6, `data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`)
    if (error) {
      ({ data, error } = await this.supabase.from("albums").insert(this.createDbEntryObject()));
    }
    if (error || data === null) throw Error(`could not insert Album ${JSON.stringify(this.createDbEntryObject())}`)
    if (data.length > 1) log(3, `multiple matching entries for base album class, 
      Album: ${JSON.stringify(this.createDbEntryObject())} 
      Data: ${JSON.stringify(data)}`)
    this.albumId = data[0].album_id;
    return data[0].album_id;
  }

  public getTracks() {
    return this.tracks;
  }

  public addTrack(track: Track) {
    this.tracks.push(track);
  }

  public getAlbumIdentifier() {
    return this.primaryIdent;
  }
  /**
   *
   * @returns an object that can be used to create a new entry in the database
   */

  public createDbEntryObject() {
    return {
      album_name: this.albumName,
      album_type: this.albumType,
      release_day: this.releaseDay,
      release_month: this.releaseMonth,
      release_year: this.releaseYear,
      num_tracks: this.numTracks,
      artists: this.artists,
      genre: this.genre,
      image: this.image,
    };
  }
}

export class SpotifyAlbumInfo extends Album {

  private spotifyId: string;
  protected override tracks: SpotifyTrack[] = [];
  static fromSpotifyData(){

  }
  constructor(
    albumName: string,
    albumType: string,
    artists: string[],
    image: string,
    releaseDay: number | undefined,
    releaseMonth: number | undefined,
    releaseYear: number,
    numTracks: number,
    genre: string[],
    supabase: SupabaseClient<any, "prod" | "test", any>,
    spotifyId: string,

  ) {
    super(albumName, albumType, artists, image, releaseDay, releaseMonth, releaseYear, numTracks, genre, supabase);
    this.spotifyId = spotifyId;
    this.primaryIdent = spotifyId;
  }

  public override addTrack(track: SpotifyTrack): void {
    this.tracks.push(track);
  }
  protected override queryHelper() {
    return this.query.eq("spotify_id", this.spotifyId)
  }

  public override createDbEntryObject() {
    return {
      ...super.createDbEntryObject(),
      spotify_id: this.spotifyId
    };
  }

}