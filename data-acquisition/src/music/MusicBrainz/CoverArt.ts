import { MusicBrainzAlbum } from "./MusicBrainzAlbum.ts";
import { CoverArtArchiveApi, SupabaseClient } from "../../../deps.ts";

import { Fireable } from "../Fireable.ts";

import { log } from "../../util/log.ts";
import { ICoversInfo, IImage } from "npm:musicbrainz-api";
import { Database } from "../../../../lib/schema.ts";

type CoverArtExtension = { 
  mbid: string, 
  type: "front" | "back", 
  source: string
};

export class CoverArt implements Fireable {
  supabase: SupabaseClient<Database, "prod" | "test", Database["prod" | "test"]>;
  mbAlbum: MusicBrainzAlbum;
  coverArt: CoverArtArchiveApi = new CoverArtArchiveApi();

  covers: (IImage["thumbnails"] & CoverArtExtension )[] = [];
  constructor(mbAlbum: MusicBrainzAlbum, 
    supabase: SupabaseClient<Database, "prod" | "test", Database["prod" | "test"]>) {
    this.mbAlbum = mbAlbum;
    this.supabase = supabase;
  }
  async fire(): Promise<void> {
    for (const r of this.mbAlbum.getResults()) {
      const result: ICoversInfo = await this.coverArt.getReleaseCovers(r.id);
      log(6, ` album art !!!${JSON.stringify(result, null, 2)}`);
      result.images.forEach(e =>
        this.covers.push(
          {
            ...e.thumbnails,
            mbid: r.id,
            type: e.back ? "back" : "front",
            source: "coverartarchive"
          }));
    }
    await this.supabase.from("album_art").insert(this.covers);
  }

}