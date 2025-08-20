import { Fireable } from "../Fireable.ts";
import { MusicBrainzApi, SupabaseClient } from "../../../deps.ts";


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
  protected supabase: SupabaseClient<any, "test" | "prod", any>;

  hasFired: boolean = false;

  constructor(supabase: SupabaseClient<any, "test" | "prod", any>) {
    this.supabase = supabase;
    this.musicbrainz = new MusicBrainzApi(mbConfig);
  }
  abstract fetchMbidFromDatabase(): Promise<any>;
  abstract performMbLookup(): Promise<any>;
  getHasFired(): boolean {
    return this.hasFired;
  }

  abstract fire(): Promise<void>;
}