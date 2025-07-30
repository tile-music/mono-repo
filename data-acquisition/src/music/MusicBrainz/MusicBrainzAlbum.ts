import { Fireable } from "../Fireable.ts";
import { MusicBrainz } from "./MusicBrainz.ts"
import { Album } from "../Album.ts";
import { SupabaseClient } from "../../../deps.ts";
import { assertStrictEquals } from "jsr:@std/assert@^1.0.13/strict-equals";
import { IReleaseGroupList } from "npm:musicbrainz-api";
export class MusicBrainzAlbum extends MusicBrainz implements Fireable<MusicBrainzAlbum> {

  album: Album;

  constructor(album: Album, supabase: SupabaseClient) {
    super(supabase);
    this.album = album;
  }
  async _init(): Promise<void> {

  }

  override async fetchMbidFromDatabase(): Promise<undefined> {
    const resp = await this.supabase.from("album_mbids").select("*").eq("album_id", await this.album.getAlbumDbID());
  }

  async performMbLookup(): Promise<IReleaseGroupList> {
    const makeArtistQueryString = (arr: string[]) => arr.map((t) => `artist:"${t}" AND`).join(" ");
    const queryStringHelper = (artists: string[], title: string) => `query=${makeArtistQueryString(artists)} releasegroup:"${title}"`;
    const query = queryStringHelper(this.album.getArtists(), this.album.getTitle());

    const releaseGroups = await this.musicbrainz.search("release-group", { query })
    
    return releaseGroups;
  }

  async fire(): Promise<void> {

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