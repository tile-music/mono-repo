import { Fireable } from "./Fireable.ts";
import { matchAlbum, getConfig, init, type FilterResponse } from "@munite";
import { Track } from "./Track.ts";
import { SupabaseClient } from "@supabase";
import type { Database } from "_shared/schema.ts";
import { log } from "../util/log.ts";
import { PK_VIOLATION } from "../util/constants.ts";
import { Release } from "./Release.ts";
import { TrackRecording } from "./TrackRecording.ts";
await init({
    musicbrainz_api_url: Deno.env.get("MUSICBRAINZ_API_URL") ?? "",
    max_musicbrainz_requests_per_second: parseInt(
        Deno.env.get("MAX_MUSICBRAINZ_REQUESTS_PER_SECOND") ?? "1",
    ),
    query_release: Deno.env.get("QUERY_RELEASE") ?? "true",
    log_level: "debug"
});

/**
 * Maps an internal album to a MusicBrainz release.
 */
export class AlbumRelease implements Fireable {

    id?: string;
    muniteResult?: FilterResponse;
    query;
    isPrimary: boolean = true;

    /**
     * @param albumId Internal album ID.
     * @param albumLookupData Service payload used for Munite matching.
     * @param tracks Tracks associated with the album.
     * @param supabase Database client.
     * @param sourceService Upstream source provider.
     */
    constructor(
        private albumId: string,
        private albumLookupData: any,
        private tracks: Track[],
        private supabase: SupabaseClient<Database>,
        private sourceService: "spotify" | "apple-music" | "manual",
    ) {

        this.query = this.supabase
            .from("mb_album_releases")
            .select("*")
            .eq("album_id", this.albumId);

    }

    /**
     * Calls Munite to resolve the best MusicBrainz release match.
     */
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

    /**
     * Returns the album release row ID, inserting related rows when missing.
     */
    protected async getARDbID() {
        if (this.id) return this.id;
        log(6, `${JSON.stringify(this.query)}`);
        let { data, error } = await this.query;
        let dbEntry;
        log(
            6,
            `BEFORE ATTEMT TO INSERT data in album release: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`,
        );
        if (data?.length === 0 || !data) {
            log(6, "fetching and inserting");
            await this.callMunite();
            dbEntry = this.createDbEntryObject();
            if(this.muniteResult?.status === "success" && dbEntry) {
                const release = new Release(this.muniteResult.release.id, this.supabase);
                log(6, "created release class calling fire")
                await release.fire();
                ({ data, error } = await this.supabase
                    .from("mb_album_releases")
                    .insert(dbEntry)
                    .select());
                const trackRecording = new TrackRecording(this.tracks, this.muniteResult, this.supabase);
                await trackRecording.fire()
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

    /**
     * Persists the album-to-release mapping when applicable.
     */
    public async fire(): Promise<void> {
        if(this.sourceService === "manual") return;
        await this.getARDbID();
    }

    /**
     * Builds the insert payload for `mb_album_releases`.
     */
    protected createDbEntryObject() : Database["public"]["Tables"]["mb_album_releases"]["Insert"] | void {
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
