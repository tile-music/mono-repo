import { Fireable } from "../Fireable.ts";
import { MusicBrainzApi, SupabaseClient } from "../../../deps.ts";
import { IRelease, IReleaseList, IReleaseMatch } from "npm:musicbrainz-api";
import { MusicBrainzLookupType  } from "../../util/constants.ts";
import { Database } from "../../../../lib/schema.ts";

export const mbConfig = {
  appName: 'tile.music',
  appVersion: "0.0.0",
  appContactInfo: "ivybixler@gmail.com",
  disableRateLimiting: true,
};

export type MBError = {
  "error": "Not Found",
  "help": "For usage, please see: https://musicbrainz.org/development/mmd"
};

export abstract class MusicBrainz implements Fireable {
  protected musicbrainz: MusicBrainzApi;
  protected supabase: SupabaseClient<Database, "test" | "prod", Database["prod" | "test"]>;
  hasFired: boolean = false;
  id: string | null = null; 

  matched: boolean = false;
  
  constructor(supabase: SupabaseClient<any, "test" | "prod", any>) {
    this.supabase = supabase;
    this.musicbrainz = new MusicBrainzApi(mbConfig);
  }
  
  abstract fetchMbidFromDatabase(): Promise<any>;
  abstract performMbLookup(): Promise<void>;
  getHasFired(): boolean {
    return this.hasFired;
  }

  abstract fire(): Promise<void>;
}