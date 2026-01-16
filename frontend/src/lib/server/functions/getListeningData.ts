import type {
    SongInfo,
    AlbumInfo,
    ListeningDataSongInfo,
} from "../../../../../lib/Song.ts";
import type {
    ListeningColumns,
    ListeningDataRequest,
    ListeningColumnKeys,
    ListeningColumn,
} from "../../../../../lib/Request.ts";
import { assertListeningColumns } from "../utils/validateListening";
import type { User } from "@supabase/supabase-js";
import { createSupabaseProdClient } from "../utils/supabase";

type SortCol = { column: string; order: string };

/**
 * Handles the user data request.
 *
 * @param _req - The request object.
 * @returns A response object containing the user's played tracks' or null if empty.
 */
async function getListeningData(user: User, body: unknown) {
    const supabase = createSupabaseProdClient();

    let options: ListeningDataRequest = body as ListeningDataRequest;
    try {
        // validate the request body
    } catch (error) {
        return {
            status: 400,
            error: String(error),
        };
    }

    // fetch the track and album information for the current user's played tracks
    const sortColObj = getSortCol(options);

    let query = supabase
        .from("played_tracks")
        .select(
            `
      listened_at,
      track-sec:tracks ( isrc, track_name, track_artists, track_duration_ms, spotify_id,
      albums ( album_name, num_tracks, release_day,release_month,release_year, artists, image, upc, spotify_id))
    `,
        )
        .eq("user_id", user.id)
        .range(options.offset, options.offset + options.limit - 1);

    if (sortColObj)
        query = query.order(sortColObj.column, sortColObjHelper(sortColObj));

    const { data: dbData, error } = await query;
    if (error) {
        return {
            status: 400,
            error: error.message,
        };
    }

    const songs: SongInfo[] = [];

    for (const entry of dbData) {
        /* the supabase api thinks that tracks() and albums() return an array of objects,
    but in reality, they only return one object. as a result, we have to do some
    pretty ugly typecasting to make the compiler happy */
        const track = entry[
            "track-sec"
        ] as unknown as (typeof dbData)[0]["tracks"][0];
        const album = track.albums as unknown as (typeof track)["albums"];

        // extract album information
        const albumInfo: AlbumInfo = {
            title: album.album_name,
            tracks: album.num_tracks,
            release_day: album.release_day,
            release_month: album.release_month,
            release_year: album.release_year,
            artists: album.artists,
            image: album.image,
            upc: album.upc,
            spotify_id: album.spotify_id,
        };

        /* extract song information  we set the state for */
        const songInfo: ListeningDataSongInfo = {
            isrc: track.isrc,
            title: track.track_name,
            artists: track.track_artists,
            duration: track.track_duration_ms,
            listened_at: entry.listened_at,
            spotify_id: track.spotify_id,
            albums: [albumInfo],
            is_child: false,
            has_children: false,
            is_parent: false,
            size: 0,
        };

        songs.push(songInfo);
    }

    // send the list of songs as a response, or null if there are no songs
    if (songs.length === 0) {
        return {
            status: 401,
            error: "No songs returned",
        };
    } else {
        return {
            status: 200,
            body: songs,
        };
    }
}

function getSortCol(body: ListeningColumns): SortCol | null {
    const keys: ListeningColumnKeys[] = Object.keys(
        body,
    ) as ListeningColumnKeys[];
    const secHelper = (secName: string) => `${secName}-sec`;
    const trackSecHelper = (colName: string) =>
        `${secHelper("track")}(${colName})`;
    const albumSecHelper = (colName: string) =>
        `${secHelper("album")}(${colName})`;

    for (const key of keys) {
        if (body[key]?.order === "asc" || body[key]?.order === "desc") {
            switch (key) {
                case "title":
                    return {
                        column: trackSecHelper("track_name"),
                        order: body[key]?.order,
                    };
                case "duration":
                    return {
                        column: trackSecHelper("track_duration_ms"),
                        order: body[key]?.order,
                    };
                case "album":
                    return {
                        column: albumSecHelper("album_name"),
                        order: body[key]?.order,
                    };
                case "artist":
                    return {
                        column: trackSecHelper("track_artists"),
                        order: body[key]?.order,
                    };
                case "spotify_track_id":
                    return {
                        column: trackSecHelper("spotify_id"),
                        order: body[key]?.order,
                    };
                case "spotify_album_id":
                    return {
                        column: albumSecHelper("spotify_id"),
                        order: body[key]?.order,
                    };
                case "isrc":
                    return {
                        column: trackSecHelper("isrc"),
                        order: body[key]?.order,
                    };
                case "upc":
                    return {
                        column: albumSecHelper("upc"),
                        order: body[key]?.order,
                    };
                default:
                    return { column: key, order: body[key]?.order };
            }
        }
    }
    return null;
}

function sortColObjHelper(sortColObj: SortCol): {
    referencedTable?: string;
    ascending: boolean;
} {
    let ascending: boolean;
    if (sortColObj.order === "asc") ascending = true;
    else if (sortColObj.order === "desc") ascending = false;
    else throw "Invalid sort order passed to helper";
    return { ascending: ascending };
}

export default getListeningData;
