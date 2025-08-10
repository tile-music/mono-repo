import { Fireable } from "../Fireable.ts";
import { MusicBrainzApi, SupabaseClient } from "../../../deps.ts";
import { type UUID } from "@std/uuid";

export const mbConfig = {
  appName: 'tile.music',
  appVersion: "0.0.0",
  appContactInfo: "ivybixler@gmail.com",
};

export abstract class MusicBrainz implements Fireable<MusicBrainz> {
  protected musicbrainz: MusicBrainzApi;
  protected supabase: SupabaseClient;

  hasFired : boolean = false;

  constructor(supabase: SupabaseClient){
    this.supabase = supabase;
    this.musicbrainz = new MusicBrainzApi(mbConfig);
  }
  abstract fetchMbidFromDatabase() : Promise<UUID|false>;
  abstract performMbLookup(): Promise<undefined>;
  getHasFired() : boolean {
    return this.hasFired;
  }

  fire(): Promise<void> {
    this.hasFired = true;
    return Promise.resolve();
  }

  validate(): asserts this is MusicBrainz {
    
  }
}