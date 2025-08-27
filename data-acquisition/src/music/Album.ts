import { SpotifyTrack, Track } from "./Track.ts";
import { SupabaseClient } from "../../deps.ts";
import { log } from "../util/log.ts";

import { PK_VIOLATION } from "../util/constants.ts";
import { Fireable } from "./Fireable.ts";
import { SpotifyPlay } from "./Play.ts";
import { MusicBrainzAlbum, SpotifyMusicBrainzAlbum } from "./MusicBrainz/MusicBrainzAlbum.ts";


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
export class Album implements Fireable {
  private title: string;
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
    title: string,
    albumType: string,
    artists: string[],
    image: string,
    releaseDay: number | undefined,
    releaseMonth: number | undefined,
    releaseYear: number,
    numTracks: number,
    genre: string[],
    supabase: SupabaseClient<any, "prod" | "test", any>,
    albumId?: number,
  ) {
    this.title = title;
    this.albumType = albumType;
    this.artists = artists;
    this.releaseDay = releaseDay ? releaseDay : null;
    this.releaseMonth = releaseMonth ? releaseMonth : null;
    this.releaseYear = releaseYear;
    this.numTracks = numTracks;
    this.image = image;
    this.genre = genre;
    this.primaryIdent = `${title},${this.artists.join(",")}`;
    this.supabase = supabase;
    //console.log(this);
    this.query = this.supabase.from("albums").select("album_id");
    this.albumId = albumId;
  }

  public getAlbumType() {
    return this.albumType.toLowerCase();
  }

  public getNumTracks() {
    return this.numTracks;
  }

  protected queryHelper() {
    this.query = this.query.eq("album_name", this.title)
    if (this.releaseYear) {
      this.query = this.query.eq("release_year", this.releaseYear ?? null)
    }
    if (this.releaseDay) {
      this.query = this.query.eq("release_day", this.releaseDay ?? null)
    }
    if (this.releaseMonth) {
      this.query = this.query.eq("release_month", this.releaseMonth ?? null)
    }
    return this.query
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
  public async getAlbumDbID(): Promise<number> {
    if (this.albumId) return this.albumId;
    log(6, `${JSON.stringify(this.queryHelper())}`)
    let { data, error } = await this.queryHelper()

    log(6, `BEFORE ATTEMT TO INSERT data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`)
    if (data?.length === 0 || !data) {
      ({ data, error } = await this.supabase.from("albums").insert(this.createDbEntryObject()).select());
    }
    log(6, `data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`)
    if (error && error?.code !== PK_VIOLATION || data === null) throw Error(`could not insert Album ${JSON.stringify(this.createDbEntryObject())} error: ${JSON.stringify(error)}`)
    if (data.length > 1) log(3, `multiple matching entries for base album class, 
      Album: ${JSON.stringify(this.createDbEntryObject())} 
      Data: ${JSON.stringify(data)}`)
    this.albumId = data[0].album_id;
    return data[0].album_id;
  }

  public getAlbumId() {
    if (this.albumId) return this.albumId;
    else throw new Error("album id has not been fetched from database")
  }

  public getTracks() {
    return this.tracks;
  }

  public addTrack(track: Track) {
    this.tracks.push(track);
    return track;
  }

  public getAlbumIdentifier() {
    return this.primaryIdent;
  }

  public async musicbrainzLookup(): Promise<void> {

  }

  /**
   *
   * @returns an object that can be used to create a new entry in the database
   */

  public createDbEntryObject() {

    return {
      ...(this.albumId && { album_id: this.albumId }),
      album_name: this.title,
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
  public async fire(): Promise<void> {

    const albumId = await this.getAlbumDbID()
    await Promise.all(this.tracks.map(async (t) => {
      t.setAlbumId(albumId);
      await t.fire();
    }))
    await this.mbFire();
    
  }
  protected async mbFire() {
    const mbAlbum = new MusicBrainzAlbum(this, this.supabase);
    await mbAlbum.fire();
  }
  public getTitle(): string {
    return this.title;
  }
  public getArtists(): string[] {
    return this.artists;
  }
}

export class SpotifyAlbum extends Album {

  private spotifyId: string;
  protected override tracks: SpotifyTrack[] = [];
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
    albumId?: number
  ) {
    super(albumName, albumType, artists,
      image, releaseDay, releaseMonth, releaseYear,
      numTracks, genre, supabase, albumId);
    this.spotifyId = spotifyId;
    this.primaryIdent = spotifyId;
  }

  protected override queryHelper() {
    return this.query.eq("spotify_id", this.spotifyId)
  }

  static fromTestData(
    data: TestData,
    supabase: SupabaseClient<any, "prod" | "test", any>,
    userId: string,
  ): SpotifyAlbum {
    const ret = new SpotifyAlbum(
      data.albumInfo.albumName, data.albumInfo.albumType, data.albumInfo.albumArtists,
      data.albumInfo.albumImage, data.albumInfo.albumReleaseDay,
      data.albumInfo.albumReleaseMonth, data.albumInfo.albumReleaseYear, data.albumInfo.numTracks, [], supabase, data.albumInfo.spotifyId
    );
    ret.addTrack(new SpotifyTrack(data.trackName, data.trackArtists,
      data.isrc, data.durationMs, data.spotifyId,
      new SpotifyPlay(data.timestamp, data.popularity,
        supabase, userId, data.isrc), supabase));
    return ret
  }
  override async mbFire() {
    const mbAlbum = new SpotifyMusicBrainzAlbum(this, this.supabase);
    await mbAlbum.fire();
  }

  public override createDbEntryObject() {
    return {
      ...super.createDbEntryObject(),
      spotify_id: this.spotifyId
    };
  }
}

export type TestData = {
  trackName: string;
  trackArtists: string[];
  albumInfo: {
    albumType: string;
    albumName: string;
    albumArtists: string[];
    albumImage: string;
    albumReleaseDay: number;
    albumReleaseMonth: number;
    albumReleaseYear: number;
    spotifyId: string;
    numTracks: number;
  };
  image: string;
  isrc: string;
  durationMs: number;
  popularity: number;
  timestamp: number;
  spotifyId: string;
};