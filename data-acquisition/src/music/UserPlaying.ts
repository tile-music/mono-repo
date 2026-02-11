import { SupabaseClient } from "@supabase";

import { Track, SpotifyTrack } from "./Track.ts";
import { Album, SpotifyAlbum, TestData } from "./Album.ts";
import { Play, SpotifyPlay } from "./Play.ts";

import { log } from "../util/log.ts";

import type { Database } from "_shared/schema.ts";

import { Fireable } from "./Fireable.ts";

import {
    getRecentlyPlayedTracks,
    PlayHistoryItemCamel,
} from "../util/spotify.ts";
import { REPLCommand } from "node:repl";
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

    protected addOrGetAlbum(album: Album) {
        const ident = album.getExternalId();
        if (this.albums.has(ident)) return this.albums.get(ident);
        else {
            this.albums.set(ident, album);
            return this.albums.get(ident);
        }
    }

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

export class SpotifyUserPlaying extends UserPlaying {
    items!: PlayHistoryItemCamel[];

    constructor(
        supabase: SupabaseClient<Database>,
        userId: string,
        context: any,
    ) {
        super(supabase, userId, context);
    }
    public override async init(): Promise<void> {}

    protected override matchAlbums(): void {
        //await this.getAlbumPopularity();

        for (const [_, item] of this.items.entries()) {
            try {
                const releaseDateRaw = item.track.album.releaseDate;
                const releaseDatePrecisionRaw =
                    item.track.album.releaseDatePrecision;

                const releaseDateParsed: ReleaseDate =
                    SpotifyUserPlaying.parseSpotifyDate(
                        releaseDateRaw,
                        releaseDatePrecisionRaw,
                    );
                const album = this.addOrGetAlbum(
                    new SpotifyAlbum(
                        item.track.album.name,
                        item.track.album.albumType,
                        item.track.album.artists.map(
                            (artist: { name: string }) => artist.name,
                        ),
                        item.track.album.images[0].url,
                        releaseDateParsed.day,
                        releaseDateParsed.month,
                        releaseDateParsed.year,
                        item.track.album.totalTracks as number,
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
                        item.track.externalIds.isrc ?? "",
                        item.track.durationMs,
                        item.track.id,
                        new SpotifyPlay(
                            SpotifyUserPlaying.parseISOToDate(
                                item.playedAt,
                            ).valueOf(),
                            item.track.popularity,
                            this.supabase,
                            this.userId,
                            item.track.externalIds.isrc,
                        ),
                        this.supabase,
                        item.track.trackNumber,
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
    public override async fire(): Promise<void> {
        const things = await getRecentlyPlayedTracks(
            this.context.refresh_token,
        );

        this.items = things.items;
        await super.fire();
    }
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

export class AppleMusicUserPlaying extends UserPlaying {
    recently_played!: AppleMusicRecentlyPlayedResponse;

    constructor(
        supabase: SupabaseClient<Database>,
        userId: string,
        context: { access_token: string },
    ) {
        super(supabase, userId, context);
    }

    public override async init() {}

    protected override matchAlbums() {}

    public override async fire(): Promise<void> {
        this.recently_played = await getRecentlyPlayedTracksApple(
            this.context.access_token,
        );

        console.log(this.recently_played);

        await super.fire();
    }
}

export class MockUserPlaying extends UserPlaying {
    mockData: TestData[];
    constructor(
        supabase: SupabaseClient<Database>,
        userId: string,
        context: TestData[],
    ) {
        super(supabase, userId, context);
        this.mockData = context;
    }

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

    public override init(): Promise<void> {
        this.inited = true;
        return Promise.resolve();
    }
}
