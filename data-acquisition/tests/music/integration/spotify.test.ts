import { expect } from "@expect";
import { getRecentlyPlayedTracks } from "../../../src/util/spotify.ts";

Deno.test(
    "getRecentlyPlayedTracks - should fetch recently played tracks with proper structure",
    async () => {
        const refreshToken = Deno.env.get("SP_REFRESH");

        if (!refreshToken) {
            throw new Error(
                "SP_REFRESH environment variable is required for testing",
            );
        }

        const result = await getRecentlyPlayedTracks(refreshToken);

        // Verify top-level structure
        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(result.href).toBeDefined();
        expect(typeof result.href).toBe("string");
        expect(typeof result.limit).toBe("number");
        expect(result.items).toBeInstanceOf(Array);
    },
);

Deno.test(
    "getRecentlyPlayedTracks - should convert snake_case to camelCase",
    async () => {
        const refreshToken = Deno.env.get("SP_REFRESH");

        if (!refreshToken) {
            throw new Error(
                "SP_REFRESH environment variable is required for testing",
            );
        }

        const result = await getRecentlyPlayedTracks(refreshToken);

        expect(result.items).toBeDefined();

        if (result.items.length > 0) {
            const firstItem = result.items[0];

            expect(firstItem.played_at).toBeDefined();
            expect((firstItem as any).playedAt).toBeUndefined();

            expect(firstItem.track.duration_ms).toBeDefined();
            expect((firstItem.track as any).durationMs).toBeUndefined();
            expect(firstItem.track.is_local).toBeDefined();
            expect((firstItem.track as any).isLocal).toBeUndefined();
            expect(firstItem.track.track_number).toBeDefined();
            expect((firstItem.track as any).trackNumber).toBeUndefined();

            expect(firstItem.track.album.album_type).toBeDefined();
            expect((firstItem.track.album as any).albumType).toBeUndefined();
            expect(firstItem.track.album.total_tracks).toBeDefined();
            expect((firstItem.track.album as any).totalTracks).toBeUndefined();
            expect(firstItem.track.album.external_urls).toBeDefined();
            expect(
                (firstItem.track.album as any).externalUrls,
            ).toBeUndefined();
            expect(firstItem.track.album.release_date).toBeDefined();
            expect((firstItem.track.album as any).releaseDate).toBeUndefined();

            expect(firstItem.track.artists[0].external_urls).toBeDefined();
            expect(
                (firstItem.track.artists[0] as any).externalUrls,
            ).toBeUndefined();
        }
    },
);

Deno.test("getRecentlyPlayedTracks - should respect custom limit", async () => {
    const refreshToken = Deno.env.get("SP_REFRESH");

    if (!refreshToken) {
        throw new Error(
            "SP_REFRESH environment variable is required for testing",
        );
    }

    const customLimit = 10;
    const result = await getRecentlyPlayedTracks(refreshToken, customLimit);

    expect(result.limit).toBe(customLimit);
    expect(result.items.length).toBeLessThanOrEqual(customLimit);
});

Deno.test("getRecentlyPlayedTracks - should cap limit at 50", async () => {
    const refreshToken = Deno.env.get("SP_REFRESH");

    if (!refreshToken) {
        throw new Error(
            "SP_REFRESH environment variable is required for testing",
        );
    }

    const result = await getRecentlyPlayedTracks(refreshToken, 100);

    expect(result.limit).toBe(50);
    expect(result.items.length).toBeLessThanOrEqual(50);
});

Deno.test(
    "getRecentlyPlayedTracks - should have valid track data structure",
    async () => {
        const refreshToken = Deno.env.get("SP_REFRESH");

        if (!refreshToken) {
            throw new Error(
                "SP_REFRESH environment variable is required for testing",
            );
        }

        const result = await getRecentlyPlayedTracks(refreshToken, 5);

        if (result.items.length > 0) {
            const track = result.items[0].track;

            expect(track.id).toBeDefined();
            expect(typeof track.id).toBe("string");
            expect(track.name).toBeDefined();
            expect(typeof track.name).toBe("string");
            expect(track.uri).toBeDefined();
            expect(track.uri).toMatch(/^spotify:track:/);
            expect(typeof track.duration_ms).toBe("number");
            expect(track.duration_ms).toBeGreaterThan(0);
            expect(typeof track.explicit).toBe("boolean");
            expect(typeof track.popularity).toBe("number");
            expect(track.type).toBe("track");

            expect(track.album).toBeDefined();
            expect(track.album.id).toBeDefined();
            expect(track.album.name).toBeDefined();
            expect(track.album.images).toBeInstanceOf(Array);
            expect(track.album.images.length).toBeGreaterThan(0);
            expect(track.album.images[0].url).toMatch(/^https?:\/\//);

            expect(track.artists).toBeInstanceOf(Array);
            expect(track.artists.length).toBeGreaterThan(0);
            expect(track.artists[0].id).toBeDefined();
            expect(track.artists[0].name).toBeDefined();
            expect(track.artists[0].type).toBe("artist");

            expect(result.items[0].played_at).toBeDefined();
            expect(typeof result.items[0].played_at).toBe("string");
        }
    },
);

Deno.test("getRecentlyPlayedTracks - should handle minimal limit", async () => {
    const refreshToken = Deno.env.get("SP_REFRESH");

    if (!refreshToken) {
        throw new Error(
            "SP_REFRESH environment variable is required for testing",
        );
    }

    const result = await getRecentlyPlayedTracks(refreshToken, 1);

    expect(result.limit).toBe(1);
    expect(result.items.length).toBeLessThanOrEqual(1);
});
