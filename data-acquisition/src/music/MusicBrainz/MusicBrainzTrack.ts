import { SupabaseClient } from "../../../deps.ts";

import { Fireable } from "../Fireable.ts";
import { MusicBrainz } from "./MusicBrainz.ts";
import { Track } from "../Track.ts";


import { Database } from "../../../../lib/schema.ts";
import { IReleaseList } from "npm:musicbrainz-api";

type MBData = {
  mbid: string;

}
export class MusicBrainzTrack extends MusicBrainz implements Fireable {
  track: Track;
  /* REMEMEMBER THAT THE MUSICBRAINZ LOOKUP PASSED TO THIS CLASS MUST BE A RECORDING */
  constructor(track: Track,
    release: IReleaseList, 
    supabase: SupabaseClient<Database, "prod" | "test", Database["prod" | "test"]>) {
    super(supabase);
    this.track = track;
  };

  async _init(): Promise<void> {

  };

  async fetchMbidFromDatabase() {
    const trackId = await this.track.getTrackDbID();
    const { data, error } = await this.supabase.from("track_mbids")
      .select("*")
      .eq("track_id", trackId);
    if (error) throw new Error(`${error}`);
  }

  override async performMbLookup(): Promise<undefined> {

  }
  
  

  override async fire(): Promise<void> {
    await this.fetchMbidFromDatabase()
  }
}