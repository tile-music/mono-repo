import { AlbumInfo } from "./AlbumInfo";

export class TrackInfo {
  private trackName: string | null = null;
  private trackArtists: string[] | null = null;
  private albumInfo: AlbumInfo | null = null;
  private image: string | null = null;
  private isrc: string | null = null;
  private durationMs: number | null = null;
  private progressMs: number | null = null;
  private popularity: number | null = null;
  

  private inDB: boolean | null = null;

  constructor() {
    this.inDB = false;
  }
  public getInDB() { return this.inDB; }
  public setInDB(value: boolean) { this.inDB = value; }
  /**
   * 
   * @param data represents the JSON object from the Spotify API
   * This method updates the track info with the data from the Spotify API
   * 
   * TODO: Handle the case where the track is not a track and it is an episode, 
   * this may be the responsibility of a different function this is also ripe for inheritance/ interfaces
   */

  public updateTrackInfo(data: any) {

    console.log("updateTrackInfo");
    if(data.currentPlayingType !== "track") return;
    let item = data.item;
    if(item.externalID.isrc !== this.isrc) this.reset();
    console.log (data.progress);
    console.log(item);
    this.updateTrackArtists(item.artists);
    this.updateAlbumInfo(item.album);
    this.trackName = item.name;
    this.isrc = item.externalID.isrc;
    this.durationMs = item.duration;
    this.progressMs = data.progress;
    this.popularity = item.popularity;
    console.log(this);
  }
  
  /**
   * this method resets the track info to null for another track to be played
   */
  public reset(){
    this.trackName = null;
    this.trackArtists = null;
    this.albumInfo = null;
    this.image = null;
    this.durationMs = null;
    this.progressMs = null;
    this.inDB = false;
  }
  /**
   * This method updates the album info with the data from the Spotify API
   * @param album represents the album object from the Spotify API
   */
  private updateAlbumInfo(album: any) {
    if (this.albumInfo === null) {
      console.log(album)
      this.albumInfo = new AlbumInfo(album.name, album.albumType, album.artists, album.images[0].url, new Date(album.releaseDate), album.totalTracks);
    }
    
  }
  /**
   * this method updates the track artists with the data from the Spotify API
   * @param artists represents the artists object from the Spotify API
   */
  private updateTrackArtists(artists: any){
    if (this.trackArtists === null) {
      console.log("trackArtists is null");
      this.trackArtists = new Array();
      for (let artist of artists) {
        this.trackArtists.push(artist.name);
      }
    }
  }
  /**
   * this method is used to determine if the progress of the track is sufficient to be added to the database
   * @returns true if the progress of the track is greater than 66% of the duration
   */
  public isProgressSufficient(){
    if(this.durationMs === null || this.progressMs === null) return false;
    return this.progressMs/this.durationMs >= 0.66; 
  }
  /**
   * this method is used to create an object that can be used to create a new entry in the database
   * @returns an object that can be used to create a new entry in the database
   * @todo change how indb is set because this might create a state mismatch
   */
  public createDbEntryObject() {
    this.inDB = true;
    return {
      p_track_name: this.trackName,
      p_track_artists: this.trackArtists,
      p_track_album: this.albumInfo?.createDbEntryObject(),
      p_track_duration_ms: this.durationMs,
      p_isrc: this.isrc,
      p_listened_at: new Date().toISOString(),
      p_popularity: this.popularity
    }
  }
  
}

export class SpotifyTrackInfo extends TrackInfo {
  constructor() {
    super();
  }

}