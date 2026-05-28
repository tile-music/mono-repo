interface ExternalUrls {
    spotify: string;
}

interface Image {
    url: string;
    height: number;
    width: number;
}

interface Restrictions {
    reason: string;
}

interface Artist {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    name: string;
    type: "artist";
    uri: string;
}

interface Album {
    album_type: "album" | "single" | "compilation";
    total_tracks: number;
    available_markets: string[];
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: "year" | "month" | "day";
    restrictions?: Restrictions;
    type: "album";
    uri: string;
    artists: Artist[];
}

interface ExternalIds {
    isrc?: string;
    ean?: string;
    upc?: string;
}

interface Track {
    album: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: ExternalIds;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    is_playable?: boolean;
    linked_from?: Record<string, unknown>;
    restrictions?: Restrictions;
    name: string;
    popularity: number;
    preview_url: string | null;
    track_number: number;
    type: "track";
    uri: string;
    is_local: boolean;
}

interface Context {
    type: string;
    href: string;
    external_urls: ExternalUrls;
    uri: string;
}

export interface PlayHistoryItem {
    track: Track;
    played_at: string;
    context: Context | null;
}

interface Cursors {
    after: string;
    before: string;
}

export interface RecentlyPlayedTracksResponse {
    href: string;
    limit: number;
    next: string | null;
    cursors: Cursors;
    total: number;
    items: PlayHistoryItem[];
}

interface Paging<T> {
    href: string;
    items: T[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
}

export interface SpotifyAlbumWithTracks extends Album {
    tracks: Paging<Track>;
}

let appAccessToken: string | null = null;
let appTokenExpiresAt = 0;

async function getAccessToken(refreshToken: string): Promise<string> {
    const clientId = Deno.env.get("SPOTIFY_CID");
    const clientSecret = Deno.env.get("SPOTIFY_SECRET");

    if (!clientId || !clientSecret) {
        throw new Error(
            "SPOTIFY_CID and SPOTIFY_SECRET must be set in environment variables",
        );
    }

    const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        },
    );

    if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(`Failed to refresh access token: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
}


export async function getRecentlyPlayedTracks(
    refreshToken: string,
    limit: number = 50,
): Promise<RecentlyPlayedTracksResponse> {

    const constrainedLimit = Math.min(Math.max(1, limit), 50);
    const accessToken = await getAccessToken(refreshToken);

    const response = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${constrainedLimit}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch recently played tracks: ${error}`);
    }

    return await response.json();
}


async function getAppAccessToken(): Promise<string> {
    const now = Date.now();

    if (appAccessToken && now < appTokenExpiresAt) {
        return appAccessToken;
    }

    const clientId = Deno.env.get("SPOTIFY_CID");
    const clientSecret = Deno.env.get("SPOTIFY_SECRET");

    if (!clientId || !clientSecret) {
        throw new Error(
            "SPOTIFY_CID and SPOTIFY_SECRET must be set in environment variables",
        );
    }

    const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
            }),
        },
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get app access token: ${error}`);
    }

    const data = await response.json();

    appAccessToken = data.access_token;
    // subtract 30s for safety margin
    appTokenExpiresAt = Date.now() + (data.expires_in - 30) * 1000;

    return appAccessToken!;
}

// ===============================
// Fetch Album (Resolves Pagination)
// ===============================

export async function getSpotifyAlbumById(
    albumId: string,
): Promise<SpotifyAlbumWithTracks> {

    async function fetchWithAuth(url: string): Promise<Response> {
        let token = await getAppAccessToken();

        let response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // If token expired unexpectedly, refresh once
        if (response.status === 401) {
            appAccessToken = null;
            token = await getAppAccessToken();
            //await response.
            response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        return response;
    }

    // Initial album fetch
    const albumResponse = await fetchWithAuth(
        `https://api.spotify.com/v1/albums/${albumId}`,
    );

    if (!albumResponse.ok) {
        const error = await albumResponse.text();
        throw new Error(`Failed to fetch album: ${error}`);
    }

    const albumData: SpotifyAlbumWithTracks = await albumResponse.json();

    // Resolve paginated track pages
    let allTracks = [...albumData.tracks.items];
    let nextUrl = albumData.tracks.next;

    while (nextUrl) {
        const pageResponse = await fetchWithAuth(nextUrl);

        if (!pageResponse.ok) {
            const error = await pageResponse.text();
            throw new Error(`Failed to fetch album track page: ${error}`);
        }

        const pageData: Paging<Track> = await pageResponse.json();

        allTracks = allTracks.concat(pageData.items);
        nextUrl = pageData.next;
    }

    return {
        ...albumData,
        tracks: {
            ...albumData.tracks,
            items: allTracks,
            next: null,
            previous: null,
            offset: 0,
            limit: allTracks.length,
            total: allTracks.length,
        },
    };
}
