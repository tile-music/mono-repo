import { Fireable } from "../Fireable.ts";
import { MusicBrainzApi, SupabaseClient } from "../../../deps.ts";

import { Database } from "../../../../lib/schema.ts";


export const mbConfig = {
  appName: 'tile.music',
  appVersion: "0.0.0",
  appContactInfo: "ivybixler@gmail.com",
};



export abstract class MusicBrainz implements Fireable {
  protected static musicbrainzStatic: MusicBrainzApi = new MusicBrainzApi(mbConfig);
  protected musicbrainz = MusicBrainz.musicbrainzStatic;
  protected supabase: SupabaseClient<Database, "prod" | "test", Database["prod" | "test"]>;
  hasFired: boolean = false;
  id: string | null = null; 
  backoffTime: number = 2;

  matched: boolean = false;
  
  constructor(supabase: SupabaseClient<Database, "prod" | "test", Database["prod" | "test"]>) {
    this.supabase = supabase;
  }
  

  abstract performMbLookup(): Promise<void>;
  getHasFired(): boolean {
    return this.hasFired;
  }

  abstract fire(): Promise<void>;
}