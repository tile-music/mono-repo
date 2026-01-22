import type { ListeningDataRequest } from "./request";
import { createSupabaseProdClient } from "$lib/server/utils/supabase";
import type { SongInfo, AlbumInfo } from "$shared/Song";
import { log } from "$lib/log";

/**
 * An album, as returned by Supabase
 */
type ReturnedAlbum = {
    album_name: string;
    num_tracks: number;
    artists: string[];
    upc: null;
    spotify_id: string;
    release_day: number;
    release_month: number;
    release_year: number;
    image: string;
};

/**
 * A song, as returned by Supabase
 */
type ReturnedTrack = {
    isrc: string;
    track_name: string;
    track_artists: string[];
    track_duration_ms: number;
    spotify_id: string;
    albums: ReturnedAlbum | ReturnedAlbum[];
};

type ReturnedData = {
    listened_at: number;
    tracks: ReturnedTrack | ReturnedTrack[];
}[];

/**
 * Returns a list of frontend-compatible songs given a user id and
 * an options object containing a start date as well as offset and
 * limit controls.
 *
 * @param userId The user's user id
 * @param request An options object
 * @returns A list of frontend-compatible songs */
export async function queryListeningData(
    userId: string,
    request: ListeningDataRequest,
): Promise<SongInfo[]> {
    const supabase = createSupabaseProdClient();
    let query = supabase
        .from("played_tracks")
        .select(
            `
            listened_at,
            tracks ( isrc, track_name, track_artists, track_duration_ms, spotify_id,
            albums ( album_name, num_tracks, release_day,release_month,release_year, artists, image, upc, spotify_id))
            `,
        )
        .eq("user_id", userId)
        .order("listened_at", { ascending: false })
        .range(request.offset, request.offset + request.limit - 1);

    const { data: rawData, error } = await query;
    if (error) {
        log(3, "Error fetching listening data: " + error);
        throw "Error fetching listening data";
    }

    // Supabase doesn't quite understand the shape of this data,
    // so we have to re-cast it.
    const data = rawData as unknown as ReturnedData;

    const songs: SongInfo[] = [];
    for (const entry of data) {
        // handle ambiguous type of entry.tracks
        if (Array.isArray(entry.tracks)) {
            for (const track of entry.tracks) {
                songs.push(processReturnedTrack(track, entry.listened_at));
            }
        } else {
            songs.push(processReturnedTrack(entry.tracks, entry.listened_at));
        }
    }

    return songs;
}

/*
 * Transforms a returned track from the database into one
 * usable by the frontend, handling ambiguous array types
 */
function processReturnedTrack(
    track: ReturnedTrack,
    listened_at: number,
): SongInfo {
    const returnedAlbums = track.albums;
    const albums = Array.isArray(returnedAlbums)
        ? returnedAlbums
        : [returnedAlbums];

    return {
        isrc: track.isrc,
        title: track.track_name,
        artists: track.track_artists,
        duration: track.track_duration_ms,
        listened_at,
        spotify_id: track.spotify_id,
        albums: albums.map(processReturnedAlbum),
    };
}

/*
 * Transforms a returned album from the database into one
 * usable by the frontend
 */
function processReturnedAlbum(album: ReturnedAlbum): AlbumInfo {
    return {
        title: album.album_name,
        tracks: album.num_tracks,
        release_day: album.release_day,
        release_month: album.release_month,
        release_year: album.release_year,
        artists: album.artists,
        image: album.image,
        upc: "",
        spotify_id: album.spotify_id,
    };
}
