import { Database } from "_shared/schema.ts";
import { Fireable } from "./Fireable.ts";
import { SupabaseClient } from "@supabase";
import { log } from "../util/log.ts";
import { PK_VIOLATION } from "../util/constants.ts";

/**
 * Represents a MusicBrainz release row persisted in `mb_releases`.
 */
export class Release implements Fireable {
    private query;
    /**
     * @param id MusicBrainz release ID.
     * @param supabase Database client.
     */
    constructor(
        private id: string,
        private supabase: SupabaseClient<Database>,
    ) {
        this.query = this.supabase
            .from("mb_releases")
            .select("*")
            .eq("id", this.id);
    }

    /**
     * Returns the release ID, inserting the release row when needed.
     */
    protected async getDbId() {
        log(6, "release class instantated and getdbid called")
        log(6, `${JSON.stringify(this.query)}`);
        let { data, error } = await this.query;
        let dbEntry;
        log(
            6,
            `BEFORE ATTEMT TO INSERT data in release: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`,
        );
        if (data?.length === 0 || !data) {
            log(6, "fetching and inserting");
            ({ data, error } = await this.supabase
                .from("mb_releases")
                .insert(this.createDbEntryObject())
                .select());
        }
        log(6, `data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);
        if ((error && error?.code !== PK_VIOLATION) || data === null)
            throw Error(
                `could not insert release ${JSON.stringify(dbEntry)}
                error: ${JSON.stringify(error)}`,
            );
        if (data.length > 1)
            log(
                3,
                `multiple matching entries for base mb releases class,
                    a method of handling this case has not been created create it, moron
                    Album: ${JSON.stringify(this.createDbEntryObject())}
                    Data: ${JSON.stringify(data)}`,
            );
        this.id = data[0].id;
        return data[0].id;
    }

    /**
     * Ensures the release row exists.
     */
    public async fire(): Promise<void> {
        await this.getDbId();
    }

    /**
     * Builds the insert payload for `mb_releases`.
     */
    protected createDbEntryObject(): Database["public"]["Tables"]["mb_releases"]["Insert"] {
        const date = new Date();
        return { id: this.id, created_at: date.toISOString() };
    }
}
