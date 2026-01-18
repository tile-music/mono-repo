import { Fireable } from "../Fireable.ts";
import { MusicBrainzApi, SupabaseClient } from "../../../deps.ts";

import { Database } from "../../../../lib/schema.ts";

export const mbConfig = {
    appName: "tile.music",
    appVersion: "0.0.0",
    appContactInfo: "ivybixler@gmail.com",
};

/**
 * Abstract base class for interacting with the MusicBrainz API and managing related operations.
 *
 * @remarks
 * - Provides a shared static instance of the MusicBrainz API client.
 * - Manages a Supabase client for database operations.
 * - Implements the `Fireable` interface, requiring `fire` and `getHasFired` methods.
 *
 * @typeParam Database - The database schema type for Supabase.
 *
 * @property hasFired - Indicates whether the fire operation has been executed.
 * @property id - Optional identifier for the instance.
 * @property backoffTime - Time in seconds to wait before retrying an operation.
 * @property matched - Indicates whether a match was found during lookup.
 *
 * @constructor
 * @param supabase - The Supabase client instance for database operations.
 *
 * @method performMbLookup - Abstract method to perform a MusicBrainz lookup.
 * @method getHasFired - Returns whether the fire operation has been executed.
 * @method fire - Abstract method to execute the main operation.
 */
/**
 * Abstract base class for interacting with the MusicBrainz API and managing
 * related data acquisition tasks. Implements the `Fireable` interface.
 *
 * @remarks
 * - Provides a shared static instance of `MusicBrainzApi` for all subclasses.
 * - Manages a Supabase client instance for database operations.
 * - Tracks firing state and matching status.
 * - Subclasses must implement the `performMbLookup` and `fire` methods.
 *
 * @typeParam Database - The database schema type.
 */
export abstract class MusicBrainz implements Fireable {
    protected static musicbrainzStatic: MusicBrainzApi = new MusicBrainzApi(
        mbConfig,
    );
    protected musicbrainz = MusicBrainz.musicbrainzStatic;
    protected supabase: SupabaseClient<
        Database,
        "prod" | "test",
        Database["prod" | "test"]
    >;
    hasFired: boolean = false;
    id: string | null = null;
    backoffTime: number = 2;

    matched: boolean = false;

    constructor(
        supabase: SupabaseClient<
            Database,
            "prod" | "test",
            Database["prod" | "test"]
        >,
    ) {
        this.supabase = supabase;
    }

    abstract performMbLookup(): Promise<void>;
    getHasFired(): boolean {
        return this.hasFired;
    }

    abstract fire(): Promise<void>;
}
