import { Fireable } from "../Fireable.ts";
import { MusicBrainz } from "./MusicBrainz.ts"
import { Album } from "../Album.ts";
import { SupabaseClient } from "../../../deps.ts";
import { IReleaseGroupList, IReleaseList, IUrl, IRelease, IReleaseGroup, IReleaseGroupMatch } from "npm:musicbrainz-api";
import { SP_ALBUM_URL } from "../../util/constants.ts";

import { type MBError } from "./MusicBrainz.ts";

import { log } from "../../util/log.ts";
import { release } from "node:os";

type IMusicBrainzResult = IReleaseList | IUrl;
export class MusicBrainzAlbum extends MusicBrainz implements Fireable {

  album: Album;
  result: IReleaseGroupList | IReleaseList | undefined = undefined;

  constructor(album: Album, supabase: SupabaseClient<any, "test" | "prod", any>) {
    super(supabase);
    this.album = album;
  }
  async _init(): Promise<void> {

  }

  override async fetchMbidFromDatabase(): Promise<undefined> {
    const resp = await this.supabase.from("album_mbids").select("*").eq("album_id", await this.album.getAlbumDbID());
  }

  override async performMbLookup(): Promise<IRelease[] | undefined> {
    const makeArtistQueryString = (arr: string[]) => arr.map((t) => `artist:"${t}" AND`).join(" ");
    const queryStringHelper = (artists: string[], title: string) => `query=${makeArtistQueryString(artists)} releasegroup:"${title}"`;
    const query = queryStringHelper(this.album.getArtists(), this.album.getTitle());
    const releaseGroups = await this.musicbrainz.search("release-group", { query })
      .then((v) => v["release-groups"]
        .filter((v) => (v["primary-type"].toLowerCase() === this.album.getAlbumType()) &&
          v["title"] === this.album.getTitle() && !(v["disambiguation"]) || v["disambiguation"] === "" ));
    const releases = releaseGroups[0].releases?.filter((v) => !(v.status === "Withdrawn"));
    if (releases === undefined) throw new Error("Release Undefined");
    //await Promise.all(Array.from(this.albums.values()).map(async album => await album.fire()));
    console.log(releases)
    await Promise.all(releases.map(async (v) => log(6, `${JSON.stringify(await this.musicbrainz.lookup("release", v.id),null,2)}`)));
    
    return releases;
  }

  getResult(): IReleaseGroupList | IReleaseList {
    if (this.result !== undefined) return this.result;
    else throw new Error("Mus")
  }
  /**
   * this funtion should
   * 
   * 1. check if the entry is in the database if it is make sure it isnt stale
   * 2. if the entry is in the data base and they arent stale then the function exits (consider ways to prevent the cache from being refreshed all at once)
   * 3. the class should store the lookup in some format that is easily usable by other classes, mainly play
   *    a play should be responsible for picking what mbid gets picked for a given play
   * 
   * we want to reduce the number of musicbrainz calls
   */
  override async fire(): Promise<void> {
    const lookup = await this.performMbLookup();
    log(6, `lookup result ${JSON.stringify(lookup, null, 2)}`)
    if ('error' in lookup)
      log(0, `musicbrainz lookup failed`)
  }

  /* private filterResultHelper(result: IReleaseGroupList | IReleaseList) {
    let filterType: "release-groups" | "releases";
    if ("release-groups" in result) return result["release-groups"];
    else if ("releases" in result) return result["releases"];
  }
  private filterResults(list: IReleaseGroup[] | IRelease[]){
    list.filter((a:Album,)=>  )
  } */
}

export class SpotifyMusicBrainzAlbum extends MusicBrainzAlbum {

  override async performMbLookup(): Promise<IReleaseGroupList | IReleaseList | IUrl> {
    const musicbrainzSpotifyId = await this.musicbrainz.lookupUrl(SP_ALBUM_URL + this.album.getAlbumIdentifier());
    if ("error" in musicbrainzSpotifyId)
      return await super.performMbLookup();
    return musicbrainzSpotifyId;
  }
}