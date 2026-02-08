import { SpotifyTrack, Track } from "./Track.ts";
import { SupabaseClient } from "@supabase";
import { log } from "../util/log.ts";

import { PK_VIOLATION } from "../util/constants.ts";
import { Fireable } from "./Fireable.ts";
import { SpotifyPlay } from "./Play.ts";

import { Database } from "_shared/schema.ts";

import { matchSpotifyAlbum } from "@munite";

/**
 * Represents information about a music album.
 *
 * @class AlbumInfo
 * @classdesc This class holds various details about a music album including its name, type, release date, number of tracks, artists, genre, and identifiers.
 *
 * @property {string} albumName - The name of the album.
 * @property {string} albumType - The type of the album (e.g., single, album, EP).
 * @property {number} numTracks - The number of tracks in the album.
 * @property {Date} releaseDate - The release date of the album.
 * @property {string[]} artists - The list of artists involved in the album.
 * @property {string[]} genre - The genres associated with the album.
 * @property {string} upc - The Universal Product Code of the album.
 * @property {string} ean - The European Article Number of the album.
 * @property {string} albumIsrc - The International Standard Recording Code of the album.
 * @property {string} image - The URL or path to the album's cover image.
 *
 * @constructor
 * @param {string} albumName - The name of the album.
 * @param {string} albumType - The type of the album.
 * @param {string[]} artists - The list of artists involved in the album.
 * @param {string} image - The URL or path to the album's cover image.
 * @param {Date} releaseDate - The release date of the album.
 * @param {number} numTracks - The number of tracks in the album.
 * @param {string[]} genre - The genres associated with the album.
 * @param {string} upc - The Universal Product Code of the album.
 * @param {string} ean - The European Article Number of the album.
 * @param {string} albumIsrc - The International Standard Recording Code of the album.
 * @param {number} albumId - The id of said album in the database
 * @param {string} primaryIdent - the primary identifier for album (differs depending on service)
 *
 * @method createDbEntryObject
 * @description Creates an object that can be used to create a new entry in the database.
 * @returns {Object} An object containing the album information formatted for database entry.
 */
export class Album implements Fireable {
    private title: string;
    private albumType: string;
    private numTracks: number;
    /* private numDiscs: number; */
    private releaseDay: number | null;
    private releaseMonth: number | null;
    private releaseYear: number;
    private artists: string[];
    private genre: string[];
    private image: string;
    private id?: string;
    protected externalId: string;
    protected supabase: SupabaseClient<Database>;
    protected query;
    protected sourceService = "manual";

    protected tracks: Track[] = [];

    constructor(
        title: string,
        albumType: string,
        artists: string[],
        image: string,
        releaseDay: number | undefined,
        releaseMonth: number | undefined,
        releaseYear: number,
        numTracks: number,
        genre: string[],
        supabase: SupabaseClient<Database>,
        /* numDiscs: number, */
        albumId?: string,
    ) {
        this.title = title;
        this.albumType = albumType;
        this.artists = artists;
        this.releaseDay = releaseDay ? releaseDay : null;
        this.releaseMonth = releaseMonth ? releaseMonth : null;
        this.releaseYear = releaseYear;
        this.numTracks = numTracks;
        this.image = image;
        this.genre = genre;
        this.externalId = `${title},${this.artists.join(",")}`;
        this.supabase = supabase;
        this.query = this.supabase.from("albums").select("id");
        this.id = albumId;
    }

    public getAlbumType() {
        return this.albumType.toLowerCase();
    }

    public getNumTracks() {
        return this.numTracks;
    }

    protected queryHelper() {
        this.query = this.query.eq("source_external_id", this.externalId);
        return this.query;
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
    public async getAlbumDbID(): Promise<string> {
        if (this.id) return this.id;
        log(6, `${JSON.stringify(this.queryHelper())}`);
        let { data, error } = await this.queryHelper();

        log(
            6,
            `BEFORE ATTEMT TO INSERT data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`,
        );
        if (data?.length === 0 || !data) {
            log(6, "inserting");
            ({ data, error } = await this.supabase
                .from("albums")
                .insert(this.createDbEntryObject())
                .select());
        }
        log(6, `data: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);
        if ((error && error?.code !== PK_VIOLATION) || data === null)
            throw Error(
                `could not insert Album ${JSON.stringify(this.createDbEntryObject())} error: ${JSON.stringify(error)}`,
            );
        if (data.length > 1)
            log(
                3,
                `multiple matching entries for base album class,
      Album: ${JSON.stringify(this.createDbEntryObject())}
      Data: ${JSON.stringify(data)}`,
            );
        this.id = data[0].id;
        return data[0].id;
    }

    public getAlbumId() {
        if (this.id) return this.id;
        else throw new Error("album id has not been fetched from database");
    }

    public getTracks() {
        return this.tracks;
    }

    public addTrack(track: Track) {
        this.tracks.push(track);
        return track;
    }

    public getExternalId() {
        return this.externalId;
    }
    /**
     *
     * @returns an object that can be used to create a new entry in the database
     */

    public createDbEntryObject() {
        return {
            ...(this.id && { id: this.id }),
            source_title: this.title,
            source_service: this.sourceService,
            source_artists: this.artists,
            source_image: this.image,
            source_external_id: this.externalId,
            source_album_type: this.albumType,
        };
    }
    public async fire(): Promise<void> {
        const albumId = await this.getAlbumDbID();
        await Promise.all(
            this.tracks.map(async (t) => {
                t.setAlbumId(albumId);
                await t.fire();
            }),
        );
        //log(6, `musicbrainz fire for album ${this.title}`);
        //await this.mbFire();
    }
    public getTitle(): string {
        return this.title;
    }
    public getArtists(): string[] {
        return this.artists;
    }

    protected async matchMusicBrainz(): Promise<void> {
        try {
            const musicbrainzData = await matchSpotifyAlbum(this.getExternalId());
            log(6, `musicbrainz data:\n${JSON.stringify(matchSpotifyAlbum, null, 2)}`)
        } catch (e) {
            log(2, `error encountered while matching album\n
                    Album: ${`)
        }
    }
}

export class SpotifyAlbum extends Album {
    protected override tracks: SpotifyTrack[] = [];
    constructor(
        albumName: string,
        albumType: string,
        artists: string[],
        image: string,
        releaseDay: number | undefined,
        releaseMonth: number | undefined,
        releaseYear: number,
        numTracks: number,
        genre: string[],
        supabase: SupabaseClient<Database>,
        spotifyId: string,
        /* numDiscs: number, */
        albumId?: string,
    ) {
        super(
            albumName,
            albumType,
            artists,
            image,
            releaseDay,
            releaseMonth,
            releaseYear,
            numTracks,
            genre,
            supabase,
            albumId,
        );
        this.externalId = spotifyId;
        this.sourceService = "spotify";
    }
    static fromTestData(
        data: TestData,
        supabase: SupabaseClient<Database>,
        userId: string,
    ): SpotifyAlbum {
        const ret = new SpotifyAlbum(
            data.albumInfo.albumName,
            data.albumInfo.albumType,
            data.albumInfo.albumArtists,
            data.albumInfo.albumImage,
            data.albumInfo.releaseDay,
            data.albumInfo.releaseMonth,
            data.albumInfo.releaseYear,
            data.albumInfo.numTracks,
            [],
            supabase,
            data.albumInfo.externalId,
            /* data.albumInfo.numDiscs, */
        );
        ret.addTrack(
            new SpotifyTrack(
                data.trackName,
                data.trackArtists,
                data.isrc,
                data.durationMs,
                data.externalId,
                new SpotifyPlay(
                    data.timestamp,
                    data.popularity,
                    supabase,
                    userId,
                    data.isrc,
                ),
                supabase,
                data.trackNum,
                //data.discNum,
            ),
        );
        return ret;
    }

    // protected override async mbFire() {
    //     const mb = new SpotifyMusicBrainzAlbum(this, this.supabase);
    //     await mb.fire();
    // }

    // public override createDbEntryObject() {
    //     return {
    //         ...super.createDbEntryObject(),
    //         external_id: this.spotifyId,
    //     };
    // }
}

export type TestData = {
    trackName: string;
    trackArtists: string[];
    albumInfo: {
        albumType: string;
        albumName: string;
        albumArtists: string[];
        albumImage: string;
        releaseDay: number;
        releaseMonth: number;
        releaseYear: number;
        externalId: string;
        numTracks: number;
        /*     numDiscs: number; */
    };
    image: string;
    isrc: string;
    durationMs: number;
    popularity: number;
    timestamp: number;
    externalId: string;
    trackNum: number;
};
