import { SupabaseClient } from "@supabase/supabase-js";

import { TrackInfo } from "./TrackInfo";

import { Album, Client, Player, User } from "spotify-api.js";
import { AlbumInfo } from "./AlbumInfo";

import { PlayedTrack } from "./PlayedTrack";
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export abstract class UserPlaying {
  userId!: string;
  supabase!: SupabaseClient<any,"test"|"prod",any>;
  context!: any;
  inited!: boolean;
  postgres!: any;
  played: PlayedTrack[] = [];
  dbEntries: any = { p_track_info: [], p_user_id: "", p_environment: "" };
  constructor(supabase: SupabaseClient<any,"test"|"prod",any>, userId: string, context: any) {
    this.supabase = supabase;
    this.userId = userId;
    this.context = context;
    this.inited = false;
  }
  protected async makeDBEntries(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public async init(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public async fire(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public async putInDB(): Promise<void> {
    await this.makeDBEntries();
    //console.log(this.dbEntries);
    let i = 1;
    for (let entry of this.dbEntries.p_track_info) {
      let { data: trackData, error: trackError } = await this.supabase
        .from("tracks")
        .insert(entry.track)
        .select("*");
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
        
        const { data: albumDataRet, error: albumErrorRet } = await this.supabase
          .from("albums")
          .select("*")
          .eq("album_name", entry.track_album.album_name) // Filter by album_name
          //.eq("album_type", entry.track_album.album_type)
          //.eq("release_date", entry.track_album.release_date)
          .eq("num_tracks", entry.track_album.num_tracks) // Filter by release_date
          
        //.eq("(album).album_isrc", entry.track_album.album.album_isrc)
        albumData = albumDataRet;
        albumError = albumErrorRet;
        //console.log(albumData, albumError);
      }
      if (trackData && trackData.length > 0 && albumData && albumData.length > 0) {
        //console.log("reached track albums");
        const { data: trackAlbumData, error: trackAlbumError } =
          await this.supabase.from("track_albums").insert({
            track_id: trackData[0].track_id,
            album_id: albumData[0].album_id,
          });
        const { data: playedData, error: playedError } = await this.supabase
          .from("played_tracks")
          .insert({
            user_id: this.userId,
            track_id: trackData[0].track_id,
            listened_at: entry.listened_at,
            popularity: entry.popularity,
            isrc: entry.track.isrc,
          });
      } else {
        //console.error("No data returned from insert or albumData is undefined or empty");
        throw new Error("No data returned from insert or albumData is undefined or empty");
      }
      i += 1;
    }
  }
}

export class SpotifyUserPlaying extends UserPlaying {
  client!: Client;
  player!: Player;
  items!: any[];
  constructor(supabase: SupabaseClient<any,"test"|"prod",any>, userId: any, context: any) {
    super(supabase, userId, context);
  }
  public async init(): Promise<void> {
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
  protected async makeDBEntries(): Promise<void> {
    for(const item of this.items) {
      //console.log(item)
      const album = new AlbumInfo(
        item.track.album.name,
        item.track.album.album_type,
        item.track.album.artists.map((artist: any) => artist.name),
        item.track.album.images[0].url,
        new Date(item.track.album.releaseDate),
        item.track.album.totalTracks as number,
        item.track.album.genres,
        item.track.album.upc,
        item.track.album.ean,
        "USRC17607830",
      );
      const trackInfo = new TrackInfo(
        item.track.name,
        item.track.artists.map((artist: any) => artist.name),
        item.track.externalID.isrc,
        item.track.duration
      );
      const playedTrackInfo = new PlayedTrack(
        new Date(item.playedAt),
        trackInfo,
        album,
        item.track.popularity
      );
      this.played.push(playedTrackInfo);
    }
    for (const track of this.played) {
      await this.dbEntries.p_track_info.push(track.createDbEntryObject());
    }
    this.dbEntries.p_user_id = this.userId;
    this.dbEntries.p_environment = "test";


  }
  public async fire(): Promise<void> {
    this.items = ( await this.player.getRecentlyPlayed({ limit: 50 })).items;
    await this.putInDB();

  }
}

export class MockUserPlaying extends UserPlaying {
  mockData: any;
  constructor(supabase: SupabaseClient<any,"test"|"prod",any>, userId: any, context: any) {
    super(supabase, userId, context);
    this.mockData = context;
  }
  protected async makeDBEntries(): Promise<void> {
    for (let track of this.mockData) {
      const album = new AlbumInfo(
        track.albumInfo.albumName,
        "Album",
        track.albumInfo.albumArtists,
        track.albumInfo.albumImage,
        new Date(track.albumInfo.albumReleaseDate),
        1,
        ["Test Genre"],
        "Test UPC",
        "",
        "" 
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
    for (let track of this.played) {
      await this.dbEntries.p_track_info.push(track.createDbEntryObject());
    }

    this.dbEntries.p_user_id = this.userId;
    this.dbEntries.p_environment = "test";
  }

  public async init(): Promise<void> {
    this.inited = true;
    console.log("Mock init");
    console.log;
  }
  public async fire(): Promise<void> {
    await this.putInDB();
  }
}
