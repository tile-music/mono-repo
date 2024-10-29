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
 * 
 * @method createDbEntryObject
 * @description Creates an object that can be used to create a new entry in the database.
 * @returns {Object} An object containing the album information formatted for database entry.
 */
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


    //console.log(this);
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
      num_tracks: this.numTracks,
      artists: this.artists,
      genre: this.genre,
      upc: this.upc,
      ean: this.ean,
      image: this.image,
    };
  }
}
