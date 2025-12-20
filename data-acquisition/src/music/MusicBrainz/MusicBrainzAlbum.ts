import { Fireable } from "../Fireable.ts";
import { MusicBrainz } from "./MusicBrainz.ts";
import { Album } from "../Album.ts";
import { SupabaseClient } from "../../../deps.ts";
import { IReleaseMatch } from "../../../deps.ts";
import { ONE_WEEK, SP_ALBUM_URL } from "../../util/constants.ts";

import { Database } from "../../../../lib/schema.ts";
import { log } from "../../util/log.ts";

import { CoverArt } from "./CoverArt.ts";

/**
 * Represents an album lookup and caching handler for MusicBrainz integration.
 *
 * The `MusicBrainzAlbum` class manages the process of searching for album
 * releases on MusicBrainz, caching results in a database, and handling
 * rate-limiting and cache freshness. It is designed to minimize the number of
 * MusicBrainz API calls by checking for existing, non-stale entries in the
 * database before performing a new lookup.
 *
 * Key responsibilities:
 * - Checks if the album's MusicBrainz ID (MBID) is present and up-to-date in
 *   the database.
 * - If the cache is stale or missing, performs a MusicBrainz API lookup using
 *   the album's title and artists.
 * - Handles MusicBrainz API rate limiting with randomized backoff and retry.
 * - Stores lookup results in a format usable by other classes (e.g., for
 *   playback).
 * - Upserts fresh lookup results into the database and triggers cover art
 *   fetching.
 *
 * This class is intended to reduce redundant MusicBrainz queries and provide
 * a consistent interface for album metadata retrieval and caching.
 */
export class MusicBrainzAlbum extends MusicBrainz implements Fireable {
    album: Album;
    results: IReleaseMatch[] = [];
    coverArt: CoverArt = new CoverArt(this, this.supabase);

    constructor(
        album: Album,
        supabase: SupabaseClient<
            Database,
            "prod" | "test",
            Database["prod" | "test"]
        >,
    ) {
        super(supabase);
        this.album = album;
        log(6, `mb album created ${JSON.stringify(this.album)}`);
    }

    async _init(): Promise<void> {}

    getResults(): IReleaseMatch[] {
        return this.results;
    }

    async fetchMbidFromDatabase() {
        const { data, error } = await this.supabase
            .from("album_mbids")
            .select("*")
            .eq("album_id", await this.album.getAlbumDbID());
        if (error) throw error;
        return data;
    }

    /**
     * Performs a MusicBrainz album lookup using the album's title and artists.
     *
     * This method constructs a query string based on the album's title (with any extra information removed)
     * and its artists, then searches the MusicBrainz API for matching releases. The results are filtered
     * to only include releases with a track count matching the album's number of tracks.
     *
     * If the MusicBrainz API returns a rate limit error, the method waits for a randomized backoff period
     * before retrying the lookup.
     *
     * @override
     * @async
     * @returns {Promise<void>} Resolves when the lookup and any necessary retries are complete.
     */
    override async performMbLookup() {
        log(6, "fallback mb lookup executing");
        const splitSongTitle = (title: string) => {
            const match = title.match(/^([^({\[]+)([({\[].*)?$/);
            return {
                title: match?.[1]?.trim() ?? title,
                extras: match?.[2]?.trim() ?? null,
            };
        };
        /** add a function thats  */
        const title = splitSongTitle(this.album.getTitle()).title;
        const makeArtistQueryString = (arr: string[]) =>
            arr.map((t) => `artist:"${t}" AND`).join(" ");
        const makeQueryString = (artists: string[], title: string) =>
            `query=${makeArtistQueryString(artists)} release:"${title}" AND primarytype:"${this.album.getAlbumType()}" AND format:"digital media"`;
        const query = makeQueryString(this.album.getArtists(), title);
        log(6, "mb query: " + query);
        const releases = await this.musicbrainz.search("release", {
            query: query,
        });
        log(6, `lookup result ${JSON.stringify(releases)}`);
        if (releases === undefined) {
            return;
        }
        if ("releases" in releases) {
            const filteredResult = releases.releases.filter(
                (v) => v["track-count"] === this.album.getNumTracks(),
            );
            //const filteredResult = releases.releases
            this.results = filteredResult;
        }
        if ("error" in releases) {
            if (new String(releases.error).match("rate limit")) {
                log(0, "rate limit SMASHED");
                const randomNum = Math.random();
                const delay = (seconds: number) =>
                    new Promise((res) =>
                        setTimeout(res, seconds * 1000 * randomNum),
                    );
                log(
                    6,
                    `backoff time is now ${this.backoffTime * 1000 * randomNum} seconds`,
                );
                await delay(this.backoffTime);
            }
        }
    }

    /**
     * Executes the main logic for refreshing or updating the album cache from the database.
     *
     * - Checks if album data exists in the database and determines if it needs to be refreshed based on the `updated_at` timestamp.
     * - If data is stale or missing, performs a MusicBrainz lookup and updates the database with new entries.
     * - Logs relevant information at each step for debugging and monitoring purposes.
     * - Triggers the cover art fetching process if a lookup is performed.
     * - Sets the `hasFired` flag to indicate the operation has completed.
     *
     * @override
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    override async fire(nCalls?: number): Promise<void> {
        const data = await this.fetchMbidFromDatabase();
        if ("length" in data && data.length > 0) {
            data.forEach((d) => {
                if (new Date().valueOf() - ONE_WEEK > d.updated_at)
                    log(0, "refresh album search now!");
                else
                    log(6, `data, no need to refresh atm ${JSON.stringify(d)}`);
            });
        } else {
            await this.performMbLookup();
            log(6, `lookup result ${JSON.stringify(this.results, null, 2)}`);
            if (this.results === null) {
                log(0, `match failed`);
                return;
            } else if ("error" in this.results) {
                log(0, `musicbrainz lookup failed`);
                return;
            }
            log(
                6,
                `putting in db ${JSON.stringify(this.makeDbEntries(), null, 2)}`,
            );
            const { data: _data, error } = await this.supabase
                .from("album_mbids")
                .upsert(this.makeDbEntries())
                .select("*");
            log(
                6,
                `data ${JSON.stringify(_data)} insert error ${JSON.stringify(error)}`,
            );

            await this.coverArt.fire();
        }
        this.hasFired = true;
    }

    matchTracks() {
        if (this.results === null || this.results.length === 0) {
            log(4, "match tracks invoked but there were no results");
            return;
        }
    }

    makeDbEntries() {
        return this.results.map((v) => ({
            album_id: this.album.getAlbumId(),
            mbid: v.id,
            updated_at: new Date().valueOf(),
            type: "release",
        }));
    }
}

export class SpotifyMusicBrainzAlbum extends MusicBrainzAlbum {
    override async performMbLookup() {
        const resource = SP_ALBUM_URL + this.album.getAlbumIdentifier();

        const result = await this.musicbrainz.browse(
            "url",
            { resource: resource },
            ["release-rels"],
        );
        if ("relations" in result && Array.isArray(result["relations"])) {
            log(6, `mbspotify id ${JSON.stringify(result.relations, null, 2)}`);
            result.relations.forEach((t) => {
                if ("release" in t)
                    this.results.push(t.release as IReleaseMatch);
            });
        } else {
            log(4, "CANT FIND ALBUM FALLING BACK");
            await super.performMbLookup();
        }
        /* else if ("error" in result) {
      log(6, "CANT FIND ALBUM FALLING BACK")
      await super.performMbLookup();
    } */
    }
}
