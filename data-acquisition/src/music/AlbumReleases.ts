import { Fireable } from "./Fireable.ts";
import { matchAlbum, getConfig, init, type FilterResponse } from "@munite";
import { Track } from "./Track.ts";
import { SupabaseClient } from "@supabase";
import type { Database } from "_shared/schema.ts";
import { timeStamp } from "node:console";
import { log } from "../util/log.ts";
import { PK_VIOLATION } from "../util/constants.ts";
import { success } from "@zod";
await init({
    musicbrainz_api_url: Deno.env.get("MUSICBRAINZ_API_URL") ?? "",
    max_musicbrainz_requests_per_second: parseInt(
        Deno.env.get("MAX_MUSICBRAINZ_REQUESTS_PER_SECOND") ?? "1",
    ),
    query_release: Deno.env.get("QUERY_RELEASE") ?? "true",
});
export class AlbumRelease implements Fireable {
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
    protected async callMunite() {
        log(6, `munite config ${JSON.stringify(getConfig(), null, 2)}`);

        if (this.sourceService === "manual") {
            log(6, "munite skipped (manual source)");
            return;
        }

        try {
            log(
                6,
                `album lookup data in munite req\n
                album lookup data plain: ${this.albumLookupData} ${typeof this.albumLookupData}\n`,
            );

            const parsedLookupData = () => {
                if (typeof this.albumLookupData === "string") {
                    log(
                        6,
                        `album lookup data is string \n${this.sourceService}`,
                    );
                    return JSON.parse(this.albumLookupData);
                }
                return this.albumLookupData;
            };

            this.muniteResult = await matchAlbum(
                this.sourceService,
                parsedLookupData(),
            );
            if(this.muniteResult.status === "error" ) log(3, `munite lookup failed \n ${JSON.stringify(this, null, 2)}`)
            log(6, "invoked munite");
            log(6, `munite result:\n${JSON.stringify(this.muniteResult, null, 2)}`);
        } catch (error) {
            log(
                1,
                `munite error: ${error instanceof Error ? error.stack : error}`,
            );
        }
    }
    protected async getARDbID() {
        if (this.id) return this.id;
        log(6, `${JSON.stringify(this.query)}`);
        let { data, error } = await this.query;
        let dbEntry;
        log(
            6,
            `BEFORE ATTEMT TO INSERT data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`,
        );
        if (data?.length === 0 || !data) {
            log(6, "fetching and inserting");
            await this.callMunite();
            dbEntry = this.createDbEntryObject();
            if(this.muniteResult?.status === "success" && dbEntry) {
                ({ data, error } = await this.supabase
                    .from("mb_album_releases")
                    .insert(dbEntry)
                    .select());
            }
        }
        log(6, `data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);
        if ((error && error?.code !== PK_VIOLATION) || data === null)
            throw Error(
                `could not insert Album release ${JSON.stringify(dbEntry)}
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
        if(this.sourceService === "manual") return;
        await this.getARDbID();
    }
    protected createDbEntryObject(): Database["public"]["Tables"]["mb_album_releases"]["Insert"] | void {
        const date = new Date();
        if (this.muniteResult?.status !== "success" || !this.muniteResult)
            return
        return {
            id: this.muniteResult.release.id,
            album_id: this.albumId,
            created_at: date.toISOString(),
            is_primary: this.isPrimary,
            release_group_id: this.muniteResult.release.release_group.id,
        };
    }
}
