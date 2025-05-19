import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import process from "node:process";

import { Client, Player } from "npm:spotify-api.js";

import { TrackInfo, SpotifyTrackInfo } from "./TrackInfo.ts";
import { AlbumInfo, SpotifyAlbumInfo } from "./AlbumInfo.ts";
import { PlayedTrack } from "./PlayedTrack.ts";

import { log } from "../util/log.ts"

export type ReleaseDate = { year: number, month?: number, day?: number }

export abstract class UserPlaying {
  userId!: string;
  supabase!: SupabaseClient<any, "test" | "prod", any>;
  context!: any;
  inited!: boolean;
  postgres!: any;
  played: PlayedTrack[] = [];
  dbEntries: any = { p_track_info: [], p_user_id: "" };
  constructor(supabase: SupabaseClient<any, "test" | "prod", any>, userId: string, context: any) {
    this.supabase = supabase;
    this.userId = userId;
    this.context = context;
    this.inited = false;
  }
  protected makeDBEntries(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public init(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public fire(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public async putInDB(): Promise<void> {
    await this.makeDBEntries();
    //console.log(this.dbEntries);

    for (const entry of this.dbEntries.p_track_info) {
        let { data: trackData, error: trackError } = await this.supabase
          .from("tracks")
          .insert(entry.track)
          .select("*");
        log(6, `trackData: ${JSON.stringify(trackData)}, trackError: ${JSON.stringify(trackError)}`)
        if (trackError && trackError?.code !== "23505") throw trackError;
        let { data: albumData, error: albumError } = await this.supabase
          .from("albums")
          .insert(entry.track_album)
          .select("*");
        if (albumError && albumError?.code !== "23505") throw albumError;
        //console.log(albumData, trackData, albumError, trackError);
        if (!trackData) {
          //console.log("reached track");
          const { data: trackDataRet, error: trackErrorRet } = await this.supabase
            .from("tracks")
            .select("*")
            .eq("isrc", entry.track.isrc);
          trackData = trackDataRet;
          trackError = trackErrorRet;

        //console.log(trackData, trackError);
      }
      if (!albumData) {
        //console.log("reached album");
        //console.log(entry);
        let query1 = this.supabase
        .from("albums")
        .select("*")

        const albumSpotifyId = entry.track_album.spotify_id;
        log(6,`spotify album id: ${albumSpotifyId}`)
        if (albumSpotifyId) {
          query1 = query1.eq("spotify_id", albumSpotifyId);
          ({ data: albumData, error: albumError } = await query1);
          log(6, `will fallback execute ${( Array.isArray(albumData) && albumData["length"] === 0)}`)
        }
        if(!albumSpotifyId || (Array.isArray(albumData) && albumData.length === 0)){
          log(6, "executing fallback query")
          let query = this.supabase.from("albums").select("*")
          query = query.eq("album_name", entry.track_album.album_name); // Filter by album_name
          //.eq("image", entry.track_album.image) // Filter by image
          query = query.eq("album_type", entry.track_album.album_type);
          //.eq("release_date", entry.track_album.release_date)
          query = query.eq("num_tracks", entry.track_album.num_tracks); // Filter by release_dat
          log(6, `query ${JSON.stringify(query)}`);
          ({ data: albumData, error: albumError } = await query);
          log(6,`album data: ${albumData}, albumError: ${albumError}` )

        }
        //.eq("artists", entry.track_album.artists)
        log(6, `Album data: ${albumData}`)
        log(6, entry.track_album.spotify_id);


          //.eq("(album).album_isrc", entry.track_album.album.album_isrc;
          //console.log(albumData, albumError);
        }
        if (trackData && trackData.length > 0 && albumData && albumData.length > 0) {
          //console.log("reached track albums");
          const { data: _trackAlbumData, error: _trackAlbumError } =
            await this.supabase.from("track_albums").insert({
              track_id: trackData[0].track_id,
              album_id: albumData[0].album_id,
            });

          const { data: _playedData, error: _playedError } = await this.supabase
            .from("played_tracks")
            .insert({
              user_id: this.userId,
              track_id: trackData[0].track_id,
              album_id: albumData[0].album_id,
              listened_at: entry.listened_at,
              track_popularity: entry.track_popularity,
              isrc: entry.track.isrc,
            });
          //console.log(playedData, playedError);
          /* if(playedError){
            console.log("Duplicate entry")
          } */
          // improve error handling
        } else {
          log(1, `track data ${JSON.stringify(trackData)} album data: ${JSON.stringify(albumData)}, 
                  ${JSON.stringify(entry)}
                  No data returned from insert or albumData is undefined or empty` )

          throw new Error(`track data ${JSON.stringify(trackData)} album data: ${JSON.stringify(albumData)}, 
                  ${JSON.stringify(entry)}
                  No data returned from insert or albumData is undefined or empty`);
        }
      
    }
  }
}

export class SpotifyUserPlaying extends UserPlaying {
  client!: Client;
  player!: Player;
  items!: any[];
  albums: any[] = [];

  constructor(supabase: SupabaseClient<any, "test" | "prod", any>, userId: any, context: any) {
    super(supabase, userId, context);
  }
  public override async init(): Promise<void> {
    //console.log(this.context);
    this.client = await Client.create({
      refreshToken: true,
      token: {
        clientID: process.env.SP_CID as string,
        clientSecret: process.env.SP_SECRET as string,
        refreshToken: this.context.refresh_token,
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
      const releaseDateRaw: any = item.track.album.release_date ? item.track.album.release_date : item.track.album.releaseDate;
      const releaseDatePrecisionRaw: any = item.track.album.release_date_precision ? item.track.album.release_date_precision : item.track.album.releaseDatePrecision;

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
        item.track.album.id
      );
      const trackInfo = new SpotifyTrackInfo(
        item.track.name,
        item.track.artists.map((artist: any) => artist.name),
        item.track.externalID.isrc,
        item.track.duration,
        item.track.id
      );
      const playedTrackInfo = new PlayedTrack(
        SpotifyUserPlaying.parseISOToDate(item.playedAt).valueOf(),
        trackInfo,
        album,
        item.track.popularity
      );
      this.played.push(playedTrackInfo);
      //console.log(playedTrackInfo);
    }
    for (const [_, track] of this.played.entries()) {
      await this.dbEntries.p_track_info.push(track.createDbEntryObject());
    }
    this.dbEntries.p_user_id = this.userId;


  }
  public override async fire(): Promise<void> {
    this.items = (await this.player.getRecentlyPlayed({ limit: 50 })).items;
    //console.log(this.items)
    await this.putInDB();

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
  protected override async makeDBEntries(): Promise<void> {
    for (const track of this.mockData) {
      const album = new AlbumInfo(
        track.albumInfo.albumName,
        "Album",
        track.albumInfo.albumArtists,
        track.albumInfo.albumImage,
        track.albumInfo.releaseDay,
        track.albumInfo.releaseMonth,
        track.albumInfo.releaseYear,
        1,
        ["Test Genre"],

      );
      const trackInfo = new TrackInfo(
        track.trackName,
        track.trackArtists,
        track.isrc,
        track.durationMs
      );
      const playedTrackInfo = new PlayedTrack(
        track.timestamp,
        trackInfo,
        album,
        track.popularity
      );
      this.played.push(playedTrackInfo);
    }
    for (const track of this.played) {
      await this.dbEntries.p_track_info.push(track.createDbEntryObject());
    }

    this.dbEntries.p_user_id = this.userId;

  }

  public override async init(): Promise<void> {
    this.inited = true;
    console.log("Mock init");
  }
  public override async fire(): Promise<void> {
    await this.putInDB();
  }
}
