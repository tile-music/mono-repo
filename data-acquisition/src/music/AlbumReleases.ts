import { Fireable } from "./Fireable.ts";
import { matchAlbum, getConfig, init, type FilterResponse } from "@munite";
import { Track } from "./Track.ts";
import { SupabaseClient } from "@supabase";
import type { Database } from "_shared/schema.ts";
import { timeStamp } from "node:console";
import { log } from "../util/log.ts";
import { PK_VIOLATION } from "../util/constants.ts";
await init({
    musicbrainz_api_url: Deno.env.get("MUSICBRAINZ_API_URL") ?? "",
    max_musicbrainz_requests_per_second: parseInt(
        Deno.env.get("MAX_MUSICBRAINZ_REQUESTS_PER_SECOND") ?? "1",
    ),
    query_release: Deno.env.get("QUERY_RELEASE") ?? "true",
});
class _AlbumRelease implements Fireable {
    albumId: string;
    id?: string;
    albumLookupData: any;
    muniteResult?: FilterResponse;
    tracks: Track[];
    supabase: SupabaseClient<Database>;
    query;
    isPrimary: boolean = true;
    sourceService: "spotify" | "apple-music" | "manual";

    constructor(
        albumId: string,
        albumLookupData: any,
        tracks: Track[],
        supabase: SupabaseClient<Database>,
        sourceService: "spotify" | "apple-music" | "manual",
    ) {
        this.albumId = albumId;
        this.albumLookupData = albumLookupData;
        this.tracks = tracks;
        this.supabase = supabase;
        this.query = this.supabase
            .from("mb_album_releases")
            .select("*")
            .eq("album_id", this.albumId);
        this.sourceService = sourceService;
    }
    protected async getARDbID() {
        if (this.id) return this.id;
        log(6, `${JSON.stringify(this.query)}`);
        let { data, error } = await this.query;
        log(
            6,
            `BEFORE ATTEMT TO INSERT data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`,
        );
        if (data?.length === 0 || !data) {
            log(6, "fetching and inserting");

            ({ data, error } = await this.supabase
                .from("mb_album_releases")
                .insert(this.createDbEntryObject())
                .select());
        }
        log(6, `data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);
        if ((error && error?.code !== PK_VIOLATION) || data === null)
            throw Error(
                `could not insert Album ${JSON.stringify(this.createDbEntryObject())}
                error: ${JSON.stringify(error)}`,
            );
        if (data.length > 1)
            log(
                3,
                `multiple matching entries for base mb album releases class,
                    a method of handling this case has not been created create it, moron
                    Album: ${JSON.stringify(this.createDbEntryObject())}
                    Data: ${JSON.stringify(data)}`,
            );
        this.id = data[0].id;
        return data[0].id;
    }
    public async fire(): Promise<void> {
        return;
    }
    protected createDbEntryObject(): Database["public"]["Tables"]["mb_album_releases"]["Insert"] {
        if (!this.muniteResult || !this.id)
            throw new Error(
                "create db object called before invocation of munite",
            );
        return {
            id: this.id,
            album_id: this.albumId,
            created_at: Date.now().toLocaleString(),
            is_primary: this.isPrimary,
            release_group_id: "string",
        };
    }
}
