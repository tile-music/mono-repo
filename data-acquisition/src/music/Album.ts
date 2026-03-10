import { AppleMusicTrack, SpotifyTrack, Track } from "./Track.ts";
import { SupabaseClient } from "@supabase";
import { log } from "../util/log.ts";

import { PK_VIOLATION } from "../util/constants.ts";
import { Fireable } from "./Fireable.ts";
import { SpotifyPlay } from "./Play.ts";

import { Database } from "_shared/schema.ts";

import { AlbumRelease } from "./AlbumRelease.ts";
import {
    AppleMusicAlbumResponse,
    AppleMusicSong,
    getAlbumByIdApple,
} from "../util/apple-music.ts";

import {
    SpotifyAlbumWithTracks,
    getSpotifyAlbumById,
} from "../util/spotify.ts";

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
    protected albumLookupData?: any;
    protected title: string;
    protected albumType: string;
    protected numTracks: number;
    /* private numDiscs: number; */
    protected releaseDay: number | null;
    protected releaseMonth: number | null;
    protected releaseYear: number;
    protected artists: string[];
    protected genre: string[];
    protected image: string;
    protected id?: string;
    protected externalId: string;
    protected supabase: SupabaseClient<Database>;
    protected query;
    protected sourceService: "manual" | "apple-music" | "spotify" = "manual";

    protected tracks: Track[] = [];

    /**
     * @param title Source album title.
     * @param albumType Source album type.
     * @param artists Source artists.
     * @param image Album artwork URL.
     * @param releaseDay Release day if available.
     * @param releaseMonth Release month if available.
     * @param releaseYear Release year.
     * @param numTracks Number of tracks.
     * @param genre Source genres.
     * @param supabase Database client.
     * @param albumId Optional internal album ID.
     */
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
        this.query = this.supabase.from("albums").select("id, source_data");
        this.id = albumId;
    }

    /**
     * Returns the normalized album type.
     */
    public getAlbumType() {
        return this.albumType.toLowerCase();
    }

    /**
     * Returns the source track count.
     */
    public getNumTracks() {
        return this.numTracks;
    }

    /**
     * Adds source external ID filtering to the base album query.
     */
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
     * this method also has the side effect of fetching the album lookup data from the database
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
            await this.fetchSourceData();
            ({ data, error } = await this.supabase
                .from("albums")
                .insert(await this.createDbEntryObject())
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
                `multiple matching entries for base album class,
                    Album: ${JSON.stringify(await this.createDbEntryObject())}
                    Data: ${JSON.stringify(data)}`,
            );
        this.albumLookupData = data[0].source_data ?? undefined;
        this.id = data[0].id;
        return data[0].id;
    }

    /**
     * Returns the internal album ID after persistence.
     */
    public getAlbumId() {
        if (this.id) return this.id;
        else throw new Error("album id has not been fetched from database");
    }

    /**
     * Returns associated track entities.
     */
    public getTracks() {
        return this.tracks;
    }

    /**
     * Appends a track to this album.
     */
    public addTrack(track: Track) {
        this.tracks.push(track);
        return track;
    }

    /**
     * Returns the provider-specific album external ID.
     */
    public getExternalId() {
        return this.externalId;
    }

    /**
     *
     * @returns an object that can be used to create a new entry in the database
     */

    public async createDbEntryObject() {
        return {
            ...(this.id && { id: this.id }),
            source_title: this.title,
            source_service: this.sourceService,
            source_artists: this.artists,
            source_image: this.image,
            source_external_id: this.externalId,
            source_album_type: this.albumType,
            source_data: this.albumLookupData,
        };
    }

    /**
     * Fetches and stores provider metadata used for matching and persistence.
     */
    protected async fetchSourceData(): Promise<void> {}

    /**
     * Persists the album, then all tracks, then MusicBrainz mapping.
     */
    public async fire(): Promise<void> {
        const albumId = await this.getAlbumDbID();
        await Promise.all(
            this.tracks.map(async (t) => {
                t.setAlbumId(albumId);
                await t.fire();
            }),
        );
        log(6, "perfomring munite lookup");
        const albumRelease = new AlbumRelease(
            albumId,
            this.albumLookupData,
            this.tracks,
            this.supabase,
            this.sourceService,
        );
        await albumRelease.fire();
        //log(6, `musicbrainz fire for album ${this.title}`);

    }

    /**
     * Returns the album title.
     */
    public getTitle(): string {
        return this.title;
    }

    /**
     * Returns album artist names.
     */
    public getArtists(): string[] {
        return this.artists;
    }
}

/**
 * Spotify-backed album entity.
 */
export class SpotifyAlbum extends Album {
    protected override tracks: SpotifyTrack[] = [];
    declare albumLookupData?: SpotifyAlbumWithTracks;

    /**
     * @param albumName Source album title.
     * @param albumType Source album type.
     * @param artists Source artists.
     * @param image Album artwork URL.
     * @param releaseDay Release day if available.
     * @param releaseMonth Release month if available.
     * @param releaseYear Release year.
     * @param numTracks Number of tracks.
     * @param genre Source genres.
     * @param supabase Database client.
     * @param spotifyId Spotify album ID.
     * @param albumId Optional internal album ID.
     */
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

    /**
     * Builds a Spotify album from local test fixture data.
     */
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

    /**
     * Fetches Spotify album lookup data by external ID.
     */
    protected override async fetchSourceData() {
        this.albumLookupData = await getSpotifyAlbumById(this.externalId);
    }
}

/**
 * Apple Music-backed album entity.
 */
export class AppleMusicAlbum extends Album {
    protected override tracks: AppleMusicTrack[] = [];
    declare albumLookupData?: AppleMusicAlbumResponse;

    /**
     * @param song Apple Music song payload used to derive album metadata.
     * @param supabase Database client.
     * @param albumId Optional internal album ID.
     */
    constructor(
        song: AppleMusicSong,
        supabase: SupabaseClient<Database>,
        albumId?: string,
    ) {
        const attr = song.attributes;
        super(
            attr.albumName ?? "",
            "album",
            ["placeholder artist"],
            attr.artwork?.url ?? "",
            -1,
            -1,
            -1,
            -1,
            ["placeholder genre"],
            supabase,
            albumId,
        );

        const externalIdRegex = /album\/(?:[^/]+\/)?(\d+)(?=\?|$)/;
        const regexResult = externalIdRegex.exec(attr.url ?? "");
        if (regexResult !== null) this.externalId = regexResult[1];
        else {
            log(
                3,
                "Apple Music song URL does not match expected format to retrieve album ID:" +
                    attr.url,
            );
        }

        this.sourceService = "apple-music";
    }

    /**
     * Fetches Apple Music album lookup data by external ID.
     */
    public override async fetchSourceData(): Promise<void> {
        //we should plan on not hard coding region
        if (!this.albumLookupData) {
            const response = await getAlbumByIdApple("us", this.externalId);
            if (response.data.length !== 0) {
                this.albumLookupData = response;
                const data = this.albumLookupData.data[0].attributes;

                this.albumType = "album";
                if (data.isCompilation) this.albumType = "compilation";
                if (data.isSingle) this.albumType = "single";
            }
        }
    }

    /**
     * Builds the album insert payload from Apple lookup metadata.
     */
    public override async createDbEntryObject() {
        if (!this.albumLookupData)
            throw new Error(
                "missing album lookup data THIS SHOULD NEVER HAPPEN",
            );
        return {
            id: this.id,
            source_title: this.albumLookupData.data[0].attributes.name,
            source_service: this.sourceService,
            source_artists: [
                this.albumLookupData.data[0].attributes.artistName ??
                    "Unknown Artist",
            ],
            source_image: this.image,
            source_external_id: this.externalId,
            source_album_type: this.albumType,
            source_data: this.albumLookupData.data[0],
        };
    }
}

/**
 * Fixture shape used by mock ingestion.
 */
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
