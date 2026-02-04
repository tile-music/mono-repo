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

interface PlayHistoryItem {
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

// Camel case types (transformed output)
interface ExternalUrlsCamel {
    spotify: string;
}

interface ImageCamel {
    url: string;
    height: number;
    width: number;
}

interface RestrictionsCamel {
    reason: string;
}

interface ArtistCamel {
    externalUrls: ExternalUrlsCamel;
    href: string;
    id: string;
    name: string;
    type: "artist";
    uri: string;
}

interface AlbumCamel {
    albumType: "album" | "single" | "compilation";
    totalTracks: number;
    availableMarkets: string[];
    externalUrls: ExternalUrlsCamel;
    href: string;
    id: string;
    images: ImageCamel[];
    name: string;
    releaseDate: string;
    releaseDatePrecision: "year" | "month" | "day";
    restrictions?: RestrictionsCamel;
    type: "album";
    uri: string;
    artists: ArtistCamel[];
}

interface ExternalIdsCamel {
    isrc?: string;
    ean?: string;
    upc?: string;
}

interface TrackCamel {
    album: AlbumCamel;
    artists: ArtistCamel[];
    availableMarkets: string[];
    discNumber: number;
    durationMs: number;
    explicit: boolean;
    externalIds: ExternalIdsCamel;
    externalUrls: ExternalUrlsCamel;
    href: string;
    id: string;
    isPlayable?: boolean;
    linkedFrom?: Record<string, unknown>;
    restrictions?: RestrictionsCamel;
    name: string;
    popularity: number;
    previewUrl: string | null;
    trackNumber: number;
    type: "track";
    uri: string;
    isLocal: boolean;
}

interface ContextCamel {
    type: string;
    href: string;
    externalUrls: ExternalUrlsCamel;
    uri: string;
}

export interface PlayHistoryItemCamel {
    track: TrackCamel;
    playedAt: string;
    context: ContextCamel | null;
}

interface CursorsCamel {
    after: string;
    before: string;
}

export interface RecentlyPlayedTracksResponseCamel {
    href: string;
    limit: number;
    next: string | null;
    cursors: CursorsCamel;
    total: number;
    items: PlayHistoryItemCamel[];
}

/**
 * Converts snake_case keys to camelCase recursively
 */
function toCamelCase<T = any>(obj: any): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => toCamelCase(item)) as T;
    }

    if (typeof obj === "object" && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc: any, key: string) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
                letter.toUpperCase(),
            );
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {} as any) as T;
    }

    return obj as T;
}

/**
 * Fetches recently played tracks from Spotify
 * @param refreshToken - Spotify refresh token
 * @param limit - Number of tracks to fetch (max 50, default 50)
 * @returns Recently played tracks data in camelCase
 */
export async function getRecentlyPlayedTracks(
    refreshToken: string,
    limit: number = 50,
): Promise<RecentlyPlayedTracksResponseCamel> {
    // Validate and constrain limit
    const constrainedLimit = Math.min(Math.max(1, limit), 50);

    // Get Spotify credentials from environment variables
    const clientId = Deno.env.get("SP_CID");
    const clientSecret = Deno.env.get("SP_SECRET");

    if (!clientId || !clientSecret) {
        throw new Error(
            "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in environment variables",
        );
    }

    // Step 1: Exchange refresh token for access token
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
    const accessToken = tokenData.access_token;

    // Step 2: Fetch recently played tracks
    const recentlyPlayedResponse = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${constrainedLimit}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (!recentlyPlayedResponse.ok) {
        const error = await recentlyPlayedResponse.text();
        throw new Error(`Failed to fetch recently played tracks: ${error}`);
    }

    const recentlyPlayedData = await recentlyPlayedResponse.json();

    // Convert snake_case to camelCase
    return toCamelCase<RecentlyPlayedTracksResponseCamel>(recentlyPlayedData);
}
