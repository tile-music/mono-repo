export class AlbumInfo {
  public albumName: string
  public albumType: string
  public artists: string[]
  public image: string
  public releaseDate: Date
  public numTracks: number;

  constructor(albumName: string, albumType: string, artists: string[], image: string, releaseDate: Date, numTracks: number) {
    this.albumName = albumName;
    this.albumType = albumType;
    this.artists = [];
    for (let artist of artists) {
      this.artists.push(artist);
    }
    this.releaseDate = releaseDate
    this.numTracks = numTracks;
    this.image = image;

    console.log(this)
  }
  /**
   * 
   * @returns an object that can be used to create a new entry in the database
   */
  public createDbEntryObject() {
    return {
      album_name: this.albumName,
      album_type: this.albumType,
      artists: this.artists,
      image: this.image,
      release_date: this.releaseDate.toDateString(),
      num_tracks: this.numTracks
    }
  }
}
