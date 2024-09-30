import { AlbumInfo } from "./AlbumInfo";
import { TrackInfo } from "./TrackInfo";

export class PlayedTrack {
  private playedAt: Date;
  private trackInfo: TrackInfo;
  private albumInfo: AlbumInfo;

  constructor(playedAt: Date, trackInfo: TrackInfo, albumInfo: AlbumInfo) {
    this.playedAt = playedAt;
    this.trackInfo = trackInfo;
    this.albumInfo = albumInfo;
  }

  public createDbEntryObject() {
    return {
      p_listened_at: this.playedAt.toISOString(),
      track: this.trackInfo.createDbEntryObject(),
      track_album: this.albumInfo.createDbEntryObject(),
    };
  }
}