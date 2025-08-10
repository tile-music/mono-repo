import { Fireable } from "../Fireable.ts";
import { MusicBrainz } from "./MusicBrainz.ts"
import { Album } from "../Album.ts";
import { SupabaseClient } from "../../../deps.ts";
import { assertStrictEquals } from "jsr:@std/assert@^1.0.13/strict-equals";
import { IReleaseGroupList, IReleaseList } from "npm:musicbrainz-api";
export class MusicBrainzAlbum extends MusicBrainz implements Fireable<MusicBrainzAlbum> {

  album: Album;
  result: IReleaseGroupList | IReleaseList | undefined = undefined;

  constructor(album: Album, supabase: SupabaseClient) {
    super(supabase);
    this.album = album;
  }
  async _init(): Promise<void> {

  }

  override async fetchMbidFromDatabase(): Promise<undefined> {
    const resp = await this.supabase.from("album_mbids").select("*").eq("album_id", await this.album.getAlbumDbID());
  }

  override async performMbLookup(): Promise<IReleaseGroupList> {
    const makeArtistQueryString = (arr: string[]) => arr.map((t) => `artist:"${t}" AND`).join(" ");
    const queryStringHelper = (artists: string[], title: string) => `query=${makeArtistQueryString(artists)} releasegroup:"${title}"`;
    const query = queryStringHelper(this.album.getArtists(), this.album.getTitle());
    const releaseGroups = await this.musicbrainz.search("release-group", { query })
    return releaseGroups;
  }

  getResult() : IReleaseGroupList | IReleaseList {
    if(this.result !== undefined) return this.result;
    else throw new Error("Mus")
  }
  /**
   * this funtion should
   * 
   * 1. check if the entry is in the database if it is make sure it isnt stale
   * 2. if the entry is in the data base and they arent stale then the function exits
   * 3. the class should store the lookup in some format that is easily usable by other classes, mainly play
   *    a play should be responsible for picking what mbid gets picked for a given play
   * 
   * we want to reduce the number of musicbrainz calls
   */
  override async fire(): Promise<void> {
    await super.fire()
  }
  /**
   * 
   * @param data 
   * @param supabase 
   * @returns 
   * 
   * @todo implment from test data methond
   */

  validate(): asserts this is MusicBrainzAlbum {

  }
}