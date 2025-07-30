import { Fireable } from "../Fireable.ts";
import { MusicBrainzApi, SupabaseClient } from "../../../deps.ts";
import { type UUID } from "@std/uuid";

export const mbConfig = {
  appName: 'tile.music',
  appVersion: "0.0.0",
  appContactInfo: "ivybixler@gmail.com",
};

export abstract class MusicBrainz {
  protected musicbrainz: MusicBrainzApi;
  protected supabase: SupabaseClient;
  constructor(supabase: SupabaseClient){
    this.supabase = supabase;
    this.musicbrainz = new MusicBrainzApi(mbConfig);
  }
  abstract fetchMbidFromDatabase() : Promise<UUID|false>;
}