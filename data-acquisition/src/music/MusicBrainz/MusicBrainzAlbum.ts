import { Fireable } from "../Fireable.ts";
import { MusicBrainz } from "./MusicBrainz.ts"
import { Album } from "../Album.ts";
import { SupabaseClient } from "../../../deps.ts";
import { IReleaseMatch } from "npm:musicbrainz-api";
import { ONE_WEEK, SP_ALBUM_URL } from "../../util/constants.ts";



import { log } from "../../util/log.ts";


export class MusicBrainzAlbum extends MusicBrainz implements Fireable {

  album: Album;
  result: IReleaseMatch[] = [];

  constructor(album: Album, supabase: SupabaseClient<any, "test" | "prod", any>) {
    super(supabase);
    this.album = album;
  }

  async _init(): Promise<void> {

  }

  override async fetchMbidFromDatabase(): Promise<any> {
    const { data, error } = await this.supabase.from("album_mbids").select("*").eq("album_id", await this.album.getAlbumDbID());
    if (error) throw error;
    return data;
  }

  override async performMbLookup() {
    log(6, "fallback mb lookup executing")
    const splitSongTitle = (title: string) => {
      const match = title.match(/^([^({\[]+)([({\[].*)?$/);
      return {
        title: match?.[1]?.trim() ?? title,
        extras: match?.[2]?.trim() ?? null,
      };
    };

    const title = splitSongTitle(this.album.getTitle()).title;
    const makeArtistQueryString = (arr: string[]) => arr.map((t) => `artist:"${t}" AND`).join(" ");
    const queryStringHelper = (artists: string[], title: string) =>
      `query=${makeArtistQueryString(artists)} release:"${title}" AND primarytype:"${this.album.getAlbumType()}"`;
    
    const query = queryStringHelper(this.album.getArtists(), title);
    const releases = await this.musicbrainz.search("release", { query:query });
    if (releases === undefined) {
      return;
    }
    if ("releases" in releases) {
      const filteredResult = releases.releases.filter((v) => v["track-count"] === this.album.getNumTracks());
      //const filteredResult = releases.releases
      this.result = filteredResult;
    }
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
    const data = await this.fetchMbidFromDatabase()
    if ("length" in data && data.length > 0) {
      data.forEach((d) => {
        if ("updated_at" in d
          && ((new Date().valueOf() - ONE_WEEK) > data.updated_at))
          log(0, "refresh album cache now!")
        else log(6, `data, no need to refresh atm ${JSON.stringify(d)}`)
      })
    } else {
      await this.performMbLookup();
      log(6, `lookup result ${JSON.stringify(this.result, null, 2)}`);
      if (this.result === null) log(0, `match failed`)
      else if ('error' in this.result)
        log(0, `musicbrainz lookup failed`)
      log(6, `putting in db ${JSON.stringify(this.makeDbEntries(), null, 2)}`)
      const { data: _data, error } = await this.supabase
        .from("album_mbids")
        .upsert(this.makeDbEntries())
        .select("*")
      log(6, `data ${JSON.stringify(_data)} insert error ${JSON.stringify(error)}`)
    }
    this.hasFired = true;
  }

  makeDbEntries() {
    return this.result.map((v) => ({
      album_id: this.album.getAlbumId(),
      mbid: v.id,
      updated_at: new Date().valueOf(),
      type: "release"
    }))
  }
}

export class SpotifyMusicBrainzAlbum extends MusicBrainzAlbum {

  override async performMbLookup() {
    const resource = SP_ALBUM_URL + this.album.getAlbumIdentifier();
    log(6, resource);
    console.log("hello!!!!!!!")
    const result = await this.musicbrainz.browse("url", { resource: resource }, ["release-rels"]);
    if ("relations" in result) log(6, `mbspotify id ${JSON.stringify(result.relations, null, 2)}`);
    console.log("lookup completed");
    if ("relations" in result
      && Array.isArray(result["relations"])) {
      result.relations.forEach(t => {
        if ("release" in t) this.result.push(t.release as IReleaseMatch)
      })
    }
    else {
      log(6, "CANT FIND ALBUM FALLING BACK")
      await super.performMbLookup();
    }
    /* else if ("error" in result) {
      log(6, "CANT FIND ALBUM FALLING BACK")
      await super.performMbLookup();
    } */
  }
}