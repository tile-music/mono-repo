import { Play } from "./Play.ts";
import { SupabaseClient } from "@supabase";

import { Fireable } from "./Fireable.ts";
import { log } from "../util/log.ts";
import { PK_VIOLATION } from "../util/constants.ts";

import { Database } from "_shared/schema.ts";

import { AppleMusicSong } from "../util/apple-music.ts";

/**
 * @file TrackInfo.ts
 * @description This file contains the definition of the TrackInfo class, which represents information about a music track.
 */

/**
 * @class TrackInfo
 * @classdesc Represents information about a music track.
 *
 * @property {string} trackName - The name of the track.
 * @property {string[]} trackArtists - An array of artists associated with the track.
 * @property {string} isrc - The International Standard Recording Code (ISRC) of the track.
 * @property {number} durationMs - The duration of the track in milliseconds.
 *
 * @constructor
 * @param {string} trackName - The name of the track.
 * @param {string[]} trackArtists - An array of artists associated with the track.
 * @param {string} isrc - The International Standard Recording Code (ISRC) of the track.
 * @param {number} durationMs - The duration of the track in milliseconds.
 *
 * @method createDbEntryObject
 * @description Creates an object that can be used to create a new entry in the database.
 * @returns {Object} An object that can be used to create a new entry in the database.
 * @todo Change how `indb` is set because this might create a state mismatch.
 */
export class Track implements Fireable {
    readonly title: string;
    readonly trackArtists: string[];
    readonly isrc: string;
    readonly durationMs: number;
    protected play: Play;
    protected query;
    protected trackNum: number;
    /* protected discNum: number; */
    protected trackId?: string;
    protected albumId?: string;
    protected supabase;
    protected externalId = "placeholder";
    protected sourceService = "manual";

    /**
     * @param trackName Source title for the track.
     * @param trackArtists Source artists for the track.
     * @param isrc Track ISRC.
     * @param durationMs Track duration in milliseconds.
     * @param play Play entity associated with this track.
     * @param supabase Database client.
     * @param trackNum Track number within the source album.
     * @param albumId Optional parent album ID.
     */
    constructor(
        trackName: string,
        trackArtists: string[],
        isrc: string,
        durationMs: number,
        play: Play,
        supabase: SupabaseClient<Database>,
        trackNum: number,
        /* discNum: number, */
        albumId?: string,
    ) {
        this.title = trackName;
        this.trackArtists = trackArtists;
        this.durationMs = durationMs;
        this.isrc = isrc;
        this.play = play;
        this.supabase = supabase;
        this.query = supabase.from("tracks").select("id");
        this.albumId = albumId;
        this.trackNum = trackNum;
        /* this.discNum = discNum; */
    }

    /**
     * Sets the album ID for this track.
     */
    public setAlbumId(albumId: string) {
        this.albumId = albumId;
    }

    /**
     * Returns the source track title.
     */
    public getTitle(){
        return this.title;
    }

    /**
     * Adds source external ID filtering to the base track query.
     */
    protected queryHelper() {
        return this.query.eq("source_external_id", this.externalId);
    }

    /**
     * Retrieves the database ID for the current album instance.
     *
     * This method queries the database for an album entry matching the current
     * album's name and release date (year, month, day). If no matching entry is found,
     * it attempts to insert a new album record. If the operation fails or returns no data,
     * an error is thrown. If multiple matching entries are found, a warning is logged.
     *
     * @returns {Promise<number>} The album's database ID.
     * @throws {Error} If the album cannot be inserted or retrieved from the database.
     * @todo find some intelligent way to fall back to a worse query, which should never happen in reality
     */
    public async getTrackDbID(): Promise<string> {
        if (this.trackId) return this.trackId;
        log(6, `external id ${this.externalId}`);
        let { data, error } = await this.queryHelper();
        log(
            6,
            `before insert attempt data track: ${JSON.stringify(data)}, error:: ${JSON.stringify(error)}`,
        );
        if (data?.length === 0 || !data) {
            ({ data, error } = await this.supabase
                .from("tracks")
                .insert(this.createDbEntryObject())
                .select());
        }
        if ((error && error?.code !== PK_VIOLATION) || data === null)
            throw new Error(
                `data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`,
            );
        if (data?.length > 1)
            log(
                3,
                `multiple matching entries for base album class,
      Track: ${JSON.stringify(this.createDbEntryObject())}
      Data: ${JSON.stringify(data)}`,
            );
        this.trackId = data[0].id;
        return data[0].id;
    }

    /**
     * this method is used to create an object that can be used to create a new entry in the database
     * @returns an object that can be used to create a new entry in the database
     */
    public createDbEntryObject() {
        if (!this.albumId) throw new Error("albumid is not defined");
        return {
            album_id: this.albumId,
            //isrc: this.isrc,
            source_title: this.title,
            source_artists: this.trackArtists,
            //track_duration_ms: this.durationMs,
            source_service: this.sourceService,
            source_external_id: this.externalId,
            //track_num: this.trackNum,
            /* disc_num: this.discNum, */
        };
    }

    // public matchMusicBrainz(releases: IReleaseMatch[]) {
    //     releases.forEach((release) => {
    //         log(6, `release in track ${JSON.stringify(release)}`);
    //     });
    // }

    /**
     * Persists the track and then persists the related play.
     */
    public async fire(): Promise<void> {
        const trackId = await this.getTrackDbID();
        log(6, `track id ${trackId}`);
        if (!this.albumId)
            throw new Error("album id is undefined, this should never happen");
        log(6, "track fire called");
        this.play.setTrackId(trackId);

        //log(6, ` track directly before  play fire ${JSON.stringify(this)}`);
        await this.play.fire();
    }
}

/**
 * Spotify-backed track entity.
 */
export class SpotifyTrack extends Track {
    /**
     * @param trackName Source title for the track.
     * @param trackArtists Source artists for the track.
     * @param isrc Track ISRC.
     * @param durationMs Track duration in milliseconds.
     * @param spotifyId Spotify track ID.
     * @param play Play entity associated with this track.
     * @param supabase Database client.
     * @param trackNum Track number within the source album.
     * @param albumId Optional parent album ID.
     */
    constructor(
        trackName: string,
        trackArtists: string[],
        isrc: string,
        durationMs: number,
        spotifyId: string,
        play: Play,
        supabase: SupabaseClient<Database>,
        trackNum: number,
        /*     discNum: number, */
        albumId?: string,
    ) {
        super(
            trackName,
            trackArtists,
            isrc,
            durationMs,
            play,
            supabase,
            trackNum,
            /*  discNum,  */ albumId,
        );
        this.externalId = spotifyId;
        this.sourceService = "spotify";
    }
}

/**
 * Apple Music-backed track entity.
 */
export class AppleMusicTrack extends Track {
    /**
     * @param song Apple Music song payload.
     * @param play Play entity associated with this track.
     * @param supabase Database client.
     */
    constructor(
        song: AppleMusicSong,
        play: Play,
        supabase: SupabaseClient<Database>,
    ) {
        const attr = song.attributes;
        super(
            attr.name,
            [attr.artistName ?? ""],
            attr.isrc ?? "",
            attr.durationInMillis ?? -1,
            play,
            supabase,
            attr.trackNumber ?? -1,
        );
        this.externalId = song.id;
        this.sourceService = "apple";
    }
}
