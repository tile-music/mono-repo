export class AlbumInfo {
  private albumName: string;
  private albumType: string;
  private numTracks: number;
  private releaseDate: Date;
  private artists: string[];
  private genre: string[];
  private upc: string;
  private ean: string;
  private albumIsrc: string;
  private popularity: number;
  private image: string;

  constructor(
    albumName: string,
    albumType: string,
    artists: string[],
    image: string,
    releaseDate: Date,
    numTracks: number,
    genre: string[],
    upc: string,
    ean: string,
    albumIsrc: string,
    popularity: number
  ) {
    this.albumName = albumName;
    this.albumType = albumType;
    this.artists = artists;
    this.releaseDate = releaseDate;
    this.numTracks = numTracks;
    this.image = image;
    this.genre = genre;
    this.upc = upc;
    this.ean = ean;
    this.albumIsrc = albumIsrc;
    this.popularity = popularity;

    console.log(this);
  }
  /**
   *
   * @returns an object that can be used to create a new entry in the database
   */

  public createDbEntryObject() {
    return {
      album_name: this.albumName,
      album_type: this.albumType,
      release_date: this.releaseDate.toISOString(),
      artists: this.artists,
      genre: this.genre,
      upc: this.upc,
      ean: this.ean,
      popularity: this.popularity,
      image: this.image,
    };
  }
}
