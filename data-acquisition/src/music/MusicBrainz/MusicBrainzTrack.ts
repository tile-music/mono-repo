import { MusicBrainzApi, SupabaseClient } from "../../../deps.ts";

import { Fireable } from "../Fireable.ts";
import { MusicBrainz } from "./MusicBrainz.ts";
import { Track } from "../Track.ts";

import { MusicBrainzAlbum } from "./MusicBrainzAlbum.ts";
export class MusicBrainzTrack extends MusicBrainz implements Fireable<MusicBrainzTrack> {
  mbAlbum: MusicBrainzAlbum;
  track: Track;
  constructor(track: Track, mbAlbum: MusicBrainzAlbum, supabase: SupabaseClient) {
    super(supabase);
    this.mbAlbum = mbAlbum;
    this.track = track;
  };
  
  async _init(): Promise<void> {
    
  };
7
  override async fetchMbidFromDatabase(): Promise<undefined>  {
    const trackId = await this.track.getTrackDbID();
    const {data, error} = await this.supabase.from("track_mbids").select("*").eq("track_id", trackId);
    if(error) throw new Error(`${error}`); 
  }

  override async performMbLookup(): Promise<undefined> {

  }
  
  override async fire(): Promise<void> {
    await super.fire();
    await this.fetchMbidFromDatabase()
  }
  override validate() : asserts this is MusicBrainzTrack {
  }
}