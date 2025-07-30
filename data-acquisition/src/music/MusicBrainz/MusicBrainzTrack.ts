import { MusicBrainzApi, SupabaseClient } from "../../../deps.ts";

import { Fireable } from "../Fireable.ts";
import { MusicBrainz } from "./MusicBrainz.ts";
import { Track } from "../Track.ts";
import {type UUID} from "@std/uuid";
export class MusicBrainzTrack extends MusicBrainz implements Fireable<MusicBrainzTrack> {
  protected track: Track;
  constructor(track: Track, supabase: SupabaseClient) {
    super(supabase)
    this.track = track;
  };
  
  async _init(): Promise<void> {
    
  };

  override async fetchMbidFromDatabase(): Promise<UUID|false> {
  }
  
  async fire(): Promise<void> {
    await this.fetchMbidFromDatabase()

  };
  validate() : asserts this is MusicBrainzTrack {

  }
}