import type { SongInfo, AlbumInfo } from "../../../../../lib/Song.ts";
import type {
    ContextDataRequest,
    RankOutput,
    ContextDataResponse,
} from "$shared/Request.ts";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseProdClient } from "../utils/supabase";

/**
 * Handles requests for art display context menu data, querying a user's list
 * of played tracks and sorting/filtering them based on request parameters.
 *
 * @param _req - The request object.
 * @returns A response object containing a sorted list of played tracks, or null if empty.
 */
async function getContextData(user: User, body: unknown) {
    const supabase: SupabaseClient<any, "prod", any> =
        createSupabaseProdClient();

    // get search filters
    let filters;
    try {
        filters = validateContextDataRequest(body);
    } catch (error) {
        return {
            status: 400,
            error: String(error),
        };
    }

    // fetch the track and album information for the current user's played tracks
    let query = supabase
        .from("played_tracks")
        .select(
            `
    listened_at,
    tracks!inner( isrc, track_name, track_artists, track_duration_ms,
       albums!inner( album_name, num_tracks, release_day,
        release_month, release_year, artists, image )
    )
  `,
        )
        .eq("user_id", user.id)
        .eq("tracks.albums.image", filters.upc);

    // if start date is provided, filter out listens before start date
    if (filters.date.start)
        query = query.gte("listened_at", filters.date.start);

    // if end date is provided, filter out listens after end date (inclusive)
    if (filters.date.end) {
        const endTimestamp = filters.date.end + 86400000; // add 24 hours
        query = query.lte("listened_at", endTimestamp);
    }

    // execute query
    const { data: dbData, error } = await query;
    if (error) throw error;

    const songs: SongInfo[] = [];
    for (const entry of dbData) {
        // the supabase api thinks that tracks() and track_albums() return an array of objects,
        // but in reality, they only return one object. as a result, we have to do some
        // pretty ugly typecasting to make the compiler happy
        const track =
            entry.tracks as unknown as (typeof dbData)[0]["tracks"][0];
        const album = track.albums as unknown as (typeof track)["albums"][0];

        // extract album information
        const albumInfo: AlbumInfo = {
            title: album.album_name,
            tracks: album.num_tracks,
            release_day: album.release_day,
            release_month: album.release_month,
            release_year: album.release_year,
            artists: album.artists,
            image: album.image,
            upc: "",
            spotify_id: "",
        };

        // extract song information
        const songInfo: SongInfo = {
            isrc: track.isrc,
            title: track.track_name,
            artists: track.track_artists,
            duration: track.track_duration_ms,
            listened_at: entry.listened_at,
            albums: [albumInfo],
            spotify_id: "",
        };

        songs.push(songInfo);
    }

    // filter songs by the requested number of cells if given
    const rankedSongs = rankSongsFromAlbum(songs, filters.rank_determinant);

    // send the list of songs as a response, or null if there are no songs
    if (songs.length >= 0) {
        const response: ContextDataResponse = { songs: rankedSongs };
        return {
            status: 200,
            body: response,
        };
    } else {
        return {
            status: 500,
            error: "Unable to retrieve song data.",
        };
    }
}

/**
 * Aggregates a list of songs based on a chosen aggregate and
 * sorts them based on a chosen determinant
 *
 * @param songs the list of songs listened to by the user
 * @returns a sorted list of objects containing the song and its rank quantity
 */
function rankSongsFromAlbum(
    songs: SongInfo[],
    determinant: ContextDataRequest["rank_determinant"],
): RankOutput {
    // return empty array if listening data is empty
    if (!songs || !songs.length) return [];

    // increment rank quantity differently based on determinant
    let increment: (s: SongInfo) => number;
    if (determinant === "listens") increment = (_s: SongInfo) => 1;
    else if (determinant === "time") increment = (s: SongInfo) => s.duration;
    else throw "Invalid aggregate";

    // tabulate number of listens based on chosen aggregate
    const ranks: { [x: string]: number } = {};
    const songRanking: { [x: string]: SongInfo } = {};
    for (const song of songs) {
        const rank = song.isrc;

        // create new entry in rankings or increment current entry
        if (!ranks[rank]) {
            ranks[rank] = increment(song);
            songRanking[rank] = song;
        } else ranks[rank] += increment(song);
    }

    // translate isrc back into song
    const output: RankOutput = [];
    for (const identifier in ranks)
        output.push({
            song: songRanking[identifier],
            quantity: ranks[identifier],
        });

    // sort by number of plays in descending order
    output.sort((a, b) => {
        return b.quantity - a.quantity;
    });
    return output;
}

/**
 * Verifies that the format of a request body matches that of DisplayDataRequest
 *
 * @param req The raw request body
 * @returns A request body that matches the format of DisplayDataRequest,
 *  or an error if unsuccessful
 */
export function validateContextDataRequest(req: unknown): ContextDataRequest {
    if (typeof req !== "object" || req == null)
        throw "Invalid request: body is not an object";

    if (!("upc" in req) || typeof req.upc !== "string" || req.upc == null)
        throw "Invalid request: missing or invalid UPC";

    // date
    if (!("date" in req) || typeof req.date !== "object" || req.date == null)
        throw "Invalid request: missing date";

    if (!("start" in req.date) || req.date.start === undefined)
        throw "Invalid request: start date is missing";
    if (req.date.start != null && !Number.isInteger(req.date.start))
        throw "Invalid request: start date is invalid";

    if (!("end" in req.date) || req.date.end === undefined)
        throw "Invalid request: end date is missing";
    if (req.date.end != null && !Number.isInteger(req.date.end))
        throw "Invalid request: end date is invalid";

    if (
        req.date.start !== null &&
        req.date.end !== null &&
        req.date.end! < req.date.start!
    )
        throw "Invalid request: end date is before start date";

    // rank determinant
    if (!("rank_determinant" in req))
        throw "Invalid request: rank determinant is missing";
    if (req.rank_determinant !== "listens" && req.rank_determinant !== "time")
        throw "Invalid request: rank determinant is invalid";

    return req as ContextDataRequest;
}

export default getContextData;
