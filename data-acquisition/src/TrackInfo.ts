import { AlbumInfo } from "./AlbumInfo";
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
    console.log(this);
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

