import { SignJWT, importPKCS8 } from "@jose";
import { log } from "./log.ts";

const APPLE_MEDIA_KEY_ID = Deno.env.get("APPLE_MEDIA_KEY_ID");
const APPLE_MEDIA_KEY_PATH = Deno.env.get("APPLE_MEDIA_KEY_PATH");
const APPLE_TEAM_ID = Deno.env.get("APPLE_TEAM_ID");
const APP_URL = Deno.env.get("APP_URL");

if (
    !APPLE_MEDIA_KEY_ID ||
    !APPLE_MEDIA_KEY_PATH ||
    !APPLE_TEAM_ID ||
    !APP_URL
) {
    log(
        1,
        "One of the following required environment variables are not defined: " +
            "APPLE_MEDIA_KEY_ID, APPLE_MEDIA_KEY_PATH, APPLE_TEAM_ID, APP_URL",
    );
}

const MAX_TOKEN_AGE = 60 * 60 * 24; // 1 day (in seconds)

let cachedToken: string | null = null;
let cachedExp = 0;

// Song Types

type Artwork = {
    width: number;
    height: number;
    url: string;
    bgColor?: string;
    textColor1?: string;
    textColor2?: string;
    textColor3?: string;
    textColor4?: string;
};

type Preview = {
    url: string;
};

type PlayParams = {
    id: string;
    kind: string;
};

type SongAttributes = {
    albumName?: string;
    genreNames?: string[];
    trackNumber?: number;
    durationInMillis?: number;
    releaseDate?: string;
    isrc?: string;
    artwork?: Artwork;
    composerName?: string;
    url?: string;
    playParams?: PlayParams;
    discNumber?: number;
    hasLyrics?: boolean;
    isAppleDigitalMaster?: boolean;
    name: string;
    previews?: Preview[];
    artistName?: string;
};

export type AppleMusicSong = {
    id: string;
    type: "songs";
    href: string;
    attributes: SongAttributes;
};

export type AppleMusicRecentlyPlayedResponse = {
    data: AppleMusicSong[];
    href?: string;
    next?: string;
    meta?: Record<string, unknown>;
};

/**
 * Fetches recently played tracks from Apple Music.
 *
 * Note: The Apple Music API requires BOTH a Developer Token (JWT)
 * and a Music User Token.
 *
 * @param limit Number of tracks to fetch (default 30; max 30)
 * @returns Recently played tracks response
 */
export async function getRecentlyPlayedTracksApple(
    user_token: string,
    limit: number = 30,
    offset?: number,
): Promise<AppleMusicRecentlyPlayedResponse> {
    const constrainedLimit = Math.min(Math.max(1, limit), 30);

    const developer_token = await getAppleMusicDeveloperToken();

    if (!developer_token || !user_token) {
        throw new Error(
            "Apple Music Developer Token and Music User Token must be set",
        );
    }

    const url =
        `https://api.music.apple.com/v1/me/recent/played/tracks?limit=${constrainedLimit}` +
        (offset && offset > 0 ? `&offset=${offset}` : "");

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${developer_token}`,
            "Music-User-Token": user_token,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch Apple Music recently played tracks: ${response.status} ${errorText}`,
        );
    }

    const json = await response.json();
    return json as AppleMusicRecentlyPlayedResponse;
}

// Album Types

type EditorialNotes = {
    short?: string;
    standard?: string;
};

type ResourceId = {
    id: string;
    type: string;
    href?: string;
};

type Relationship<T> = {
    href?: string;
    next?: string;
    data?: T[];
};

type AlbumAttributes = {
    artistName?: string;
    name: string;
    url?: string;
    genreNames?: string[];
    releaseDate?: string;
    trackCount?: number;
    isCompilation?: boolean;
    isSingle?: boolean;
    isMasteredForItunes?: boolean;
    upc?: string;
    copyright?: string;
    recordLabel?: string;
    editorialNotes?: EditorialNotes;
    artwork?: Artwork;
};

export type AppleMusicAlbum = {
    id: string;
    type: "albums";
    href: string;
    attributes: AlbumAttributes;
    relationships?: {
        artists?: Relationship<ResourceId>;
        tracks?: Relationship<AppleMusicSong>;
    };
};

export type AppleMusicAlbumResponse = {
    data: AppleMusicAlbum[];
    href?: string;
    next?: string;
    meta?: Record<string, unknown>;
};

/**
 * Fetches a specific album from the Apple Music Catalog by album ID.
 *
 * @param storefront A valid Apple Music storefront code (e.g., "us", "gb", "jp")
 * @param albumId The album ID (e.g., "329455551")
 * @returns The catalog album response containing the requested album
 *
 * Notes:
 * - This call requires ONLY the Developer Token.
 * - You can include `include=tracks` to also fetch the track relationship.
 */
export async function getAlbumByIdApple(
    storefront: string,
    albumId: string,
    options?: { includeTracks?: boolean },
): Promise<AppleMusicAlbumResponse> {
    const developer_token = await getAppleMusicDeveloperToken();
    if (!developer_token) {
        throw new Error("Apple Music Developer Token must be set");
    }

    const includeParam = options?.includeTracks ? "?include=tracks" : "";

    const url = `https://api.music.apple.com/v1/catalog/${encodeURIComponent(
        storefront,
    )}/albums/${encodeURIComponent(albumId)}${includeParam}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${developer_token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch Apple Music album ${albumId}: ${response.status} ${errorText}`,
        );
    }

    const json = await response.json();
    return json as AppleMusicAlbumResponse;
}

/**
 * Generates and returns an Apple Music developer token (JWT) signed with ES256.
 *
 * Behavior:
 * - Caches the token in-memory and reuses it if still valid (with a 1-hour safety margin).
 * - Reads a PKCS#8 PEM private key from the file system.
 * - Uses environment variables for key ID, team ID, and allowed origin.
 *
 * Returns:
 * - The signed JWT developer token.
 */
export async function getAppleMusicDeveloperToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    if (cachedToken && cachedExp - now > 60 * 60) {
        return cachedToken;
    }

    const privateKeyPem = await Deno.readTextFile(APPLE_MEDIA_KEY_PATH!);
    const privateKey = await importPKCS8(privateKeyPem, "ES256");

    const exp = now + MAX_TOKEN_AGE;

    const token = await new SignJWT()
        .setProtectedHeader({
            alg: "ES256",
            kid: APPLE_MEDIA_KEY_ID!,
        })
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .setIssuer(APPLE_TEAM_ID!)
        .sign(privateKey);

    cachedToken = token;
    cachedExp = exp;

    return token;
}
