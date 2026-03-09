import { SupabaseClient } from "@supabase";

import { Track, SpotifyTrack, AppleMusicTrack } from "./Track.ts";
import { Album, AppleMusicAlbum, SpotifyAlbum, TestData } from "./Album.ts";
import { AppleMusicPlay, Play, SpotifyPlay } from "./Play.ts";

import { log } from "../util/log.ts";

import type { Database } from "_shared/schema.ts";

import { Fireable } from "./Fireable.ts";

import {
    getRecentlyPlayedTracks,
    PlayHistoryItem,
} from "../util/spotify.ts";
import {
    AppleMusicRecentlyPlayedResponse,
    getRecentlyPlayedTracksApple,
} from "../util/apple-music.ts";

export type ReleaseDate = { year: number; month?: number; day?: number };

/**
 * Abstract class representing a user's music playback session and handling database operations.
 *
 * @template SupabaseClient - The Supabase client type for database operations.
 * @template PlayedTrack - The type representing a played track.
 *
 * @property userId - The unique identifier for the user.
 * @property supabase - The Supabase client instance for database interactions.
 * @property context - Additional context or configuration for the user session.
 * @property inited - Indicates whether the user session has been initialized.
 * @property postgres - Optional property for direct Postgres access or configuration.
 * @property played - Array of played tracks for the user.
 * @property dbEntries - Object containing database entries to be inserted, including track info and user ID.
 *
 * @constructor
 * @param supabase - The Supabase client instance.
 * @param userId - The unique identifier for the user.
 * @param context - Additional context or configuration for the user session.
 *
 * @method makeDBEntries - Abstract method to prepare database entries from played tracks.
 * @returns Promise<void>
 *
 * @method init - Abstract method to initialize the user session.
 * @returns Promise<void>
 *
 * @method fire - Abstract method to trigger the main logic for the user session.
 * @returns Promise<void>
 *
 * @method putInDB - Inserts played track and album information into the database, handling duplicates and linking tracks to albums.
 * @returns Promise<void>
 * @throws Error if track or album data cannot be found or inserted.
 *
 * @method findMBID - Attempts to find MusicBrainz IDs (MBIDs) for played tracks and albums.
 * @returns Promise<void>
 */
export abstract class UserPlaying implements Fireable {
    userId!: string;
    supabase!: SupabaseClient<Database>;
    context!: any;
    inited!: boolean;
    protected albums: Map<string, Album> = new Map();
    dbEntries: any = { p_track_info: [], p_user_id: "" };

    /**
     * @param supabase Database client.
     * @param userId Internal user ID.
     * @param context Provider-specific auth/context payload.
     */
    constructor(
        supabase: SupabaseClient<Database>,
        userId: string,
        context: any,
    ) {
        this.supabase = supabase;
        this.userId = userId;
        this.context = context;
        this.inited = false;
    }

    public abstract init(): Promise<void>;

    protected abstract matchAlbums(): void;

    /**
     * Reuses an existing album entity or stores a new one by external ID.
     */
    protected addOrGetAlbum(album: Album) {
        const ident = album.getExternalId();
        if (this.albums.has(ident)) return this.albums.get(ident);
        else {
            this.albums.set(ident, album);
            return this.albums.get(ident);
        }
    }

    /**
     * Matches albums/tracks and persists each album pipeline.
     */
    public async fire(): Promise<void> {
        try {
            this.matchAlbums();
            await Promise.all(
                Array.from(this.albums.values()).map(
                    async (album) => await album.fire(),
                ),
            );
        } catch (e) {
            log(0, `Error putting in DB: ${e}`);
        }
    }

    /* validate(): asserts this is UserPlaying {

  } */
}

/**
 * Playback ingestion workflow for Spotify.
 */
export class SpotifyUserPlaying extends UserPlaying {
    items!: PlayHistoryItem[];

    /**
     * @param supabase Database client.
     * @param userId Internal user ID.
     * @param context Spotify token context.
     */
    constructor(
        supabase: SupabaseClient<Database>,
        userId: string,
        context: any,
    ) {
        super(supabase, userId, context);
    }

    /**
     * No-op init kept for interface parity.
     */
    public override async init(): Promise<void> {}

    /**
     * Converts recently played Spotify items to album and track entities.
     */
    protected override matchAlbums(): void {
        //await this.getAlbumPopularity();

        for (const [_, item] of this.items.entries()) {
            try {
                const release_date_raw = item.track.album.release_date;
                const release_date_precision_raw =
                    item.track.album.release_date_precision;

                const release_date_parsed: ReleaseDate =
                    SpotifyUserPlaying.parseSpotifyDate(
                        release_date_raw,
                        release_date_precision_raw,
                    );

                const album = this.addOrGetAlbum(
                    new SpotifyAlbum(
                        item.track.album.name,
                        item.track.album.album_type,
                        item.track.album.artists.map(
                            (artist: { name: string }) => artist.name,
                        ),
                        item.track.album.images[0].url,
                        release_date_parsed.day,
                        release_date_parsed.month,
                        release_date_parsed.year,
                        item.track.album.total_tracks as number,
                        [],
                        this.supabase,
                        item.track.album.id,
                    ),
                );

                if (!album) {
                    log(0, `album is undefined ${{ ...item }}`);
                    continue;
                }

                album.addTrack(
                    new SpotifyTrack(
                        item.track.name,
                        item.track.artists.map(
                            (artist: { name: string }) => artist.name,
                        ),
                        item.track.external_ids?.isrc ?? "",
                        item.track.duration_ms,
                        item.track.id,
                        new SpotifyPlay(
                            SpotifyUserPlaying.parseISOToDate(
                                item.played_at,
                            ).valueOf(),
                            item.track.popularity,
                            this.supabase,
                            this.userId,
                            item.track.external_ids?.isrc,
                        ),
                        this.supabase,
                        item.track.track_number,
                    ),
                );
            } catch (error) {
                log(
                    1,
                    `
                    error: ${JSON.stringify(error, null, 2)}\n
                    error putting ${JSON.stringify(item, null, 2)}`,
                );
                continue;
            }
        }
    }

    /**
     * Fetches Spotify recently played tracks and persists normalized entities.
     */
    public override async fire(): Promise<void> {
        const things = await getRecentlyPlayedTracks(
            this.context.refresh_token,
        );

        this.items = things.items;
        await super.fire();
    }

    /**
     * Parses Spotify release date strings based on precision.
     */
    public static parseSpotifyDate(
        date: string,
        datePrecision: "year" | "month" | "day",
    ): ReleaseDate {
        if (!date) {
            throw new Error("Date is undefined");
        }
        const [year, month, day] = date.split("-");
        switch (datePrecision) {
            case "year":
                return { year: parseInt(date) };
            case "month":
                return { year: parseInt(year), month: parseInt(month) };
            case "day":
                return {
                    year: parseInt(year),
                    month: parseInt(month),
                    day: parseInt(day),
                };
        }
    }

    /**
     * Parses an ISO 8601 UTC timestamp into a `Date`.
     */
    public static parseISOToDate(isoString: string): Date {
        //console.log(isoString);
        const match = isoString.match(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?Z$/,
        );

        if (!match) {
            throw new Error("Invalid ISO 8601 format");
        }

        const [, year, month, day, hours, minutes, seconds, milliseconds] =
            match;

        // Parse components into numbers
        const parsedYear = Number(year);
        const parsedMonth = Number(month) - 1; // Months are 0-indexed
        const parsedDay = Number(day);
        const parsedHours = Number(hours);
        const parsedMinutes = Number(minutes);
        const parsedSeconds = Number(seconds);
        const parsedMilliseconds = milliseconds
            ? Number(milliseconds) * 1000
            : 0;

        // Construct a Date object in UTC
        return new Date(
            Date.UTC(
                parsedYear,
                parsedMonth,
                parsedDay,
                parsedHours,
                parsedMinutes,
                parsedSeconds,
                parsedMilliseconds,
            ),
        );
    }
}

/**
 * Playback ingestion workflow for Apple Music.
 */
export class AppleMusicUserPlaying extends UserPlaying {
    recently_played!: AppleMusicRecentlyPlayedResponse;
    last_played_id!: string | null;

    /**
     * @param supabase Database client.
     * @param userId Internal user ID.
     * @param context Apple Music token context.
     */
    constructor(
        supabase: SupabaseClient<Database>,
        userId: string,
        context: { access_token: string },
    ) {
        super(supabase, userId, context);
    }

    /**
     * No-op init kept for interface parity.
     */
    public override async init() {}

    /**
     * Converts recently played Apple tracks to album and track entities.
     */
    protected override matchAlbums(): void {
        let now = new Date().valueOf();
        let new_listen = true;

        for (const song of this.recently_played.data) {
            try {
                if (song.id === this.last_played_id) new_listen = false;

                const album = this.addOrGetAlbum(
                    new AppleMusicAlbum(song, this.supabase),
                );
                if (!album) {
                    log(0, `album is undefined ${{ ...song }}`);
                    continue;
                }

                // Sequentially move played time back by the song length
                now -= song.attributes.durationInMillis!;

                album.addTrack(
                    new AppleMusicTrack(
                        song,
                        new AppleMusicPlay(
                            new_listen,
                            now,
                            this.supabase,
                            this.userId,
                            song.attributes.isrc,
                        ),
                        this.supabase,
                    ),
                );
            } catch (error) {
                log(
                    1,
                    `
                    error: ${JSON.stringify(error, null, 2)}\n
                    error putting ${JSON.stringify(song, null, 2)}`,
                );
                continue;
            }
        }
    }

    /**
     * Fetches Apple Music history, determines new listens, and persists entities.
     */
    public override async fire(): Promise<void> {
        this.recently_played = await getRecentlyPlayedTracksApple(
            this.context.access_token,
        );

        log(6, `recently played tracks: ${JSON.stringify(this.recently_played, null, 2)}`)

        const { data, error } = await this.supabase
            .from("plays")
            .select("tracks( source_external_id )")
            .order("timestamp", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            log(
                1,
                `Error grabbing last played track for user ${this.userId}: ${error.message} `,
            );
        } else {
            this.last_played_id = data?.tracks?.source_external_id ?? null;
        }

        log(
            6,
            `Last played id for user ${this.userId}: ${this.last_played_id}`,
        );

        await super.fire();
    }
}

/**
 * Test-only ingestion workflow backed by mock data.
 */
export class MockUserPlaying extends UserPlaying {
    mockData: TestData[];

    /**
     * @param supabase Database client.
     * @param userId Internal user ID.
     * @param context Mock tracks to ingest.
     */
    constructor(
        supabase: SupabaseClient<Database>,
        userId: string,
        context: TestData[],
    ) {
        super(supabase, userId, context);
        this.mockData = context;
    }

    /**
     * Converts mock fixtures into album and track entities.
     */
    protected override matchAlbums(): void {
        // make sure this works like a traditional for loop not async for each because that will result in a major race condition
        for (const track of this.mockData) {
            const album = this.addOrGetAlbum(
                new Album(
                    track.albumInfo.albumName,
                    "Album",
                    track.albumInfo.albumArtists,
                    track.albumInfo.albumImage,
                    track.albumInfo.releaseDay,
                    track.albumInfo.releaseMonth,
                    track.albumInfo.releaseYear,
                    1,
                    ["Test Genre"],
                    this.supabase,
                ),
            );

            if (!album) throw new Error("Album Does Not Exist");
            album.addTrack(
                new Track(
                    track.trackName,
                    track.trackArtists,
                    track.isrc,
                    track.durationMs,
                    new Play(
                        track.timestamp,
                        this.supabase,
                        this.userId,
                        track.isrc,
                    ),
                    this.supabase,
                    2,
                ),
            );
        }
    }

    /**
     * Marks mock ingestion as initialized.
     */
    public override init(): Promise<void> {
        this.inited = true;
        return Promise.resolve();
    }
}
