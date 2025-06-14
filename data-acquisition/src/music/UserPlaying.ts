import { SupabaseClient, Client, Player } from "../../deps.ts";

import "jsr:@std/dotenv/load";

import { Track, SpotifyTrack } from "./Track.ts";
import { Album, SpotifyAlbumInfo } from "./Album.ts";
import { Play, SpotifyPlay } from "./Play.ts";

import { log } from "../util/log.ts"

import { MusicBrainzApi } from "../../deps.ts";


export type ReleaseDate = { year: number, month?: number, day?: number }

/**
 * Abstract class representing a user's music playback session and handling database operations.
 * 
 * @template SupabaseClient - The Supabase client type for database operations.
 * @template PlayedTrack - The type representing a played track.
 * 
 * @property userId - The unique identifier for the user.
 * @property supabase - The Supabase client instance for database interactions.
 * @property context - Additional context or configuration for the user session.
 * @property inited - Indicates whether the user session has been initialized.
 * @property postgres - Optional property for direct Postgres access or configuration.
 * @property played - Array of played tracks for the user.
 * @property dbEntries - Object containing database entries to be inserted, including track info and user ID.
 * 
 * @constructor
 * @param supabase - The Supabase client instance.
 * @param userId - The unique identifier for the user.
 * @param context - Additional context or configuration for the user session.
 * 
 * @method makeDBEntries - Abstract method to prepare database entries from played tracks.
 * @returns Promise<void>
 * 
 * @method init - Abstract method to initialize the user session.
 * @returns Promise<void>
 * 
 * @method fire - Abstract method to trigger the main logic for the user session.
 * @returns Promise<void>
 * 
 * @method putInDB - Inserts played track and album information into the database, handling duplicates and linking tracks to albums.
 * @returns Promise<void>
 * @throws Error if track or album data cannot be found or inserted.
 * 
 * @method findMBID - Attempts to find MusicBrainz IDs (MBIDs) for played tracks and albums.
 * @returns Promise<void>
 */
export abstract class UserPlaying {
  userId!: string;
  supabase!: SupabaseClient<any, "test" | "prod", any>;
  context!: any;
  inited!: boolean;
  postgres!: any;
  protected albums: Map<string, Album> = new Map();
  dbEntries: any = { p_track_info: [], p_user_id: "" };


  constructor(supabase: SupabaseClient<any, "test" | "prod", any>, userId: string, context: any) {
    this.supabase = supabase;
    this.userId = userId;
    this.context = context;
    this.inited = false;
  }

  protected abstract makeDBEntries(): Promise<void>;
  public abstract init(): Promise<void>;
  public abstract fire(): Promise<void>;

  protected abstract matchAlbums(): Promise<void>;

  protected addOrGetAlbum(album: Album) {
    const ident = album.getAlbumIdentifier()
    if (this.albums.has(ident))
      return this.albums.get(ident);
    else {
      this.albums.set(ident, album);
      return this.albums.get(ident);
    }
  }

  public async putInDB(): Promise<void> {
    await this.makeDBEntries();
    //console.log(this.dbEntries);
  }


}

export class SpotifyUserPlaying extends UserPlaying {
  client!: Client;
  player!: Player;
  items!: any[];

  constructor(supabase: SupabaseClient<any, "test" | "prod", any>, userId: string, context: any) {
    super(supabase, userId, context);
  }
  public override async init(): Promise<void> {
    //console.log(this.context);
    this.client = await Client.create({
      refreshToken: true,
      token: {
        clientID: Deno.env.get("SP_CID") as string,
        clientSecret: Deno.env.get("SP_SECRET") as string,
        refreshToken: this.context.refresh_toke1n,
      },
      onRefresh: () => {
        console.log(
          `Token has been refreshed. New token: ${this.client.token}!`
        );
      },
    });
    this.player = new Player(this.client);
  }


  protected override async makeDBEntries(): Promise<void> {
    //await this.getAlbumPopularity();
    for (const [_, item] of this.items.entries()) {
      const releaseDateRaw: number = item.track.album.release_date ? item.track.album.release_date : item.track.album.releaseDate;
      const releaseDatePrecisionRaw: number = item.track.album.release_date_precision ? item.track.album.release_date_precision : item.track.album.releaseDatePrecision;

      const releaseDateParsed: ReleaseDate = SpotifyUserPlaying.parseSpotifyDate(releaseDateRaw, releaseDatePrecisionRaw);
      const album = new SpotifyAlbumInfo(
        item.track.album.name,
        item.track.album.albumType,
        item.track.album.artists.map((artist: any) => artist.name),
        item.track.album.images[0].url,
        releaseDateParsed.day,
        releaseDateParsed.month,
        releaseDateParsed.year,
        item.track.album.totalTracks as number,
        item.track.album.genres,
        this.supabase,
        item.track.album.id)
      const playedTrackInfo = new SpotifyPlay(
        SpotifyUserPlaying.parseISOToDate(item.playedAt).valueOf(),
        item.track.popularity
      );
      const trackInfo = new SpotifyTrack(
        item.track.name,
        item.track.artists.map((artist: { name: string }) => artist.name),
        item.track.externalID.isrc,
        item.track.duration,
        playedTrackInfo,
        item.track.id,
      );
      
      this.addOrGetAlbum(album)
      //console.log(playedTrackInfo);
    }
    for (const [_, track] of this.played.entries()) {
      await this.dbEntries.p_track_info.push(track.createDbEntryObject());
    }
    this.dbEntries.p_user_id = this.userId;


  }
  public override async fire(): Promise<void> {
    this.items = (await this.player.getRecentlyPlayed({ limit: 50 })).items;

    try { await this.putInDB(); }
    catch (e) { log(1, `Error putting in DB: ${e}`); }
  }
  public static parseSpotifyDate(date: string, datePrecision: "year" | "month" | "day"): ReleaseDate {
    if (!date) {
      throw new Error("Date is undefined");
    }
    const [year, month, day] = date.split("-");
    switch (datePrecision) {
      case "year":
        return { year: parseInt(date) };
      case "month":
        return { year: parseInt(year), month: parseInt(month) };
      case "day":
        return { year: parseInt(year), month: parseInt(month), day: parseInt(day) };

    }
  }
  public static parseISOToDate(isoString: string): Date {
    //console.log(isoString);
    const match = isoString.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?Z$/
    );

    if (!match) {
      throw new Error("Invalid ISO 8601 format");
    }

    const [, year, month, day, hours, minutes, seconds, milliseconds] = match;

    // Parse components into numbers
    const parsedYear = Number(year);
    const parsedMonth = Number(month) - 1; // Months are 0-indexed
    const parsedDay = Number(day);
    const parsedHours = Number(hours);
    const parsedMinutes = Number(minutes);
    const parsedSeconds = Number(seconds);
    const parsedMilliseconds = milliseconds ? Number(milliseconds) * 1000 : 0;

    // Construct a Date object in UTC
    return new Date(
      Date.UTC(
        parsedYear,
        parsedMonth,
        parsedDay,
        parsedHours,
        parsedMinutes,
        parsedSeconds,
        parsedMilliseconds
      )
    );
  }

}

export class MockUserPlaying extends UserPlaying {
  mockData: any;
  constructor(supabase: SupabaseClient<any, "test" | "prod", any>, userId: any, context: any) {
    super(supabase, userId, context);
    this.mockData = context;
  }

  protected override async matchAlbums(): Promise<void> {
    // make sure this works like a traditional for loop not async for each because that will result in a major race condition
    for (const track of this.mockData) {
      const album = this.addOrGetAlbum(new Album(
        track.albumInfo.albumName,
        "Album",
        track.albumInfo.albumArtists,
        track.albumInfo.albumImage,
        track.albumInfo.releaseDay,
        track.albumInfo.releaseMonth,
        track.albumInfo.releaseYear,
        1,
        ["Test Genre"],
        this.supabase
      ));

      if (!album) throw new Error("Album Does Not Exist");


      const trackInfo = new Track(
        track.trackName,
        track.trackArtists,
        track.isrc,
        track.durationMs,
        this.supabase
      );
    }
  }
  protected override async makeDBEntries(): Promise<void> {

  }

  public override init(): Promise<void> {
    this.inited = true;
    console.log("Mock init");
    return Promise.resolve();
  }
  public override async fire(): Promise<void> {
    await this.putInDB();
  }
}
