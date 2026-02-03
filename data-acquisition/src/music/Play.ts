import { SupabaseClient } from "../../deps.ts";
import { Fireable } from "./Fireable.ts";
import { log } from "../util/log.ts";
import { PK_VIOLATION } from "../util/constants.ts";

import { Database } from "_shared/schema.ts";

/**
 * @file PlayedTrack.ts
 * @description This file contains the definition of the PlayedTrack class, which represents a track that has been played, including its metadata and popularity.
 */

/**
 * @class PlayedTrack
 * @classdesc Represents a track that has been played, including the time it was played, track information, album information, and its popularity.
 *
 * @property {Date} playedAt - The date and time when the track was played.
 * @property {TrackInfo} trackInfo - The information about the track.
 * @property {AlbumInfo} albumInfo - The information about the album the track belongs to.
 * @property {number} popularity - The popularity score of the track.
 *
 * @constructor
 * @param {Date} playedAt - The date and time when the track was played.
 * @param {Track} trackInfo - The information about the track.
 * @param {Album} albumInfo - The information about the album the track belongs to.
 * @param {number} popularity - The popularity score of the track.
 *
 * @method createDbEntryObject
 * @description Creates an object suitable for database entry, containing the track's popularity, the time it was listened to, and nested objects for track and album information.
 * @returns {Object} An object representing the database entry for the played track.
 *
 */
export class Play implements Fireable {
    private listenedAt: number;
    private trackId?: string;
    private albumId?: string;
    private selectedMbid?: string | null = null;
    private isrc?: string;
    private userId: string;

    protected supabase: SupabaseClient<Database>;

    constructor(
        listenedAt: number,
        supabase: SupabaseClient<Database>,
        userId: string,
        isrc?: string,
    ) {
        this.listenedAt = listenedAt;
        this.supabase = supabase;
        this.isrc = isrc;
        this.userId = userId;
    }


    public setTrackId(trackId: string) {
        this.trackId = trackId;
    }

    public setAlbumId(albumId: string) {
        this.albumId = albumId;
    }

    public createDbEntryObject() {
        if (!this.trackId)
            throw new Error(
                `track id not defined on Play:${JSON.stringify(this)}`,
            );
        return {
            track_id: this.trackId,
            timestamp: this.listenedAt,
            user_id: this.userId,
        };
    }

    public async fire(): Promise<void> {
        const { data: _data, error } = await this.supabase
            //.from(this.selectedMbid ? "played_tracks" : "unmatched_played_tracks")
            .from("plays")
            .insert(this.createDbEntryObject());
        if (error?.code === PK_VIOLATION) log(6, "Play already inserted");
        else if (error)
            throw new Error(
                `play failed to insert Play: ${JSON.stringify(this.createDbEntryObject())} error: ${JSON.stringify(error)}`,
            );
    }
}

export class SpotifyPlay extends Play {
    private trackPopularity: number;
    constructor(
        listenedAt: number,
        trackPopularity: number,
        supabase: SupabaseClient<Database>,
        userId: string,
        isrc?: string,
    ) {
        super(listenedAt, supabase, userId, isrc);
        this.trackPopularity = trackPopularity;
    }
    public override createDbEntryObject() {
        return {
            ...super.createDbEntryObject(),
            track_popularity: this.trackPopularity,
        };
    }
}
