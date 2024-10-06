import { AlbumInfo } from "./AlbumInfo";
import { TrackInfo } from "./TrackInfo";

export class PlayedTrack {
  private playedAt: Date;
  private trackInfo: TrackInfo;
  private albumInfo: AlbumInfo;
  private popularity: number

  constructor(playedAt: Date, trackInfo: TrackInfo, albumInfo: AlbumInfo, popularity: number) {
    this.playedAt = playedAt;
    this.trackInfo = trackInfo;
    this.albumInfo = albumInfo;
    this.popularity = popularity;
  }

  public createDbEntryObject() {
    return {
      popularity: this.popularity,
      listened_at: this.playedAt.toISOString(),
      track: this.trackInfo.createDbEntryObject(),
      track_album: this.albumInfo.createDbEntryObject(),
    };
  }
}