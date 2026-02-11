import {
    SpotifyUserPlaying,
    MockUserPlaying,
} from "../../../src/music/UserPlaying.ts";
import { type TestData } from "../../../src/music/Album.ts";
import { expect } from "jsr:@std/expect";
import { supabase } from "../supabase.ts";
import { testData0 } from "./TestData.ts";

Deno.test("User Playing Tests ", async (t: Deno.TestContext) => {
    const testData1: TestData[] = Array.from({ length: 200 }, (_, i) => ({
        trackName: `Test Track ${i % 10}`,
        trackArtists: [`Test Artist ${i % 5}`],

        albumInfo: {
            albumType: "album",
            albumName: `Test Album ${i % 7}`,
            albumArtists: [`Test Album Artist ${i % 3}`],
            albumImage: `Test Image ${i % 4}`,
            releaseDay: 1,
            releaseMonth: 2,
            releaseYear: 2024,
            externalId: `spotify:album:test-${i}`,
            numTracks: 3,
        },
        image: `Test Image ${i % 4}`,
        isrc: `USRC176078${30 + i}`,
        durationMs: 1000 + i * 100,
        popularity: 100 - (i % 10),
        timestamp: 125666778 + i * 1000,
        externalId: `spotify:track:test-${i}`,
        trackNum: (i % 10) + 1,
    }));

    const { data, error } = await supabase.auth.admin.createUser({
        email: "test1@example.com",
        password: "password",
    });

    if (error) throw error;

    const userId = data.user?.id || "";

    await t.step("Mock user playing tests", async (t: Deno.TestContext) => {
        await t.step("MockUserPlaying init method", async () => {
            const mockUserPlaying = new MockUserPlaying(
                supabase,
                userId,
                testData0,
            );
            await expect(mockUserPlaying.init()).resolves.not.toThrow();
        });
        await t.step("MockUserPlaying fire method", async () => {
            const mockUserPlaying = new MockUserPlaying(
                supabase,
                userId,
                testData0,
            );
            await mockUserPlaying.init();
            await expect(mockUserPlaying.fire())
                .resolves.not.toThrow()
                .then(async () => {
                    const { data } = await supabase
                        .from("plays")
                        .select()
                        .eq("user_id", userId);
                    expect(data).toHaveLength(4);
                });
        });
        await t.step(
            "MockUserPlaying init method using test data 2",
            async () => {
                const mockUserPlaying = new MockUserPlaying(
                    supabase,
                    userId,
                    testData1,
                );
                await expect(mockUserPlaying.init()).resolves.not.toThrow();
            },
        );

        await t.step(
            "MockUserPlaying fire method using test data 2",
            async () => {
                const mockUserPlaying = new MockUserPlaying(
                    supabase,
                    userId,
                    testData1,
                );
                await mockUserPlaying.init();
                await expect(mockUserPlaying.fire())
                    .resolves.not.toThrow()
                    .then(() =>
                        supabase.from("plays").select().eq("user_id", userId),
                    );
            },
        );
    });
    await t.step("Spotify User Playing tests", async (t) => {
        const context = { refresh_token: Deno.env.get("SPOTIFY_REFRESH") };
        await t.step("SpotifyUserPlaying Parse Spotify Date Function", () => {
            expect(
                SpotifyUserPlaying.parseSpotifyDate("1999-12-22", "day"),
            ).toStrictEqual({ year: 1999, month: 12, day: 22 });
            expect(
                SpotifyUserPlaying.parseSpotifyDate("1999-12", "month"),
            ).toStrictEqual({ year: 1999, month: 12 });
            expect(
                SpotifyUserPlaying.parseSpotifyDate("1999", "year"),
            ).toStrictEqual({ year: 1999 });
        });
        await t.step("SpotifyUserPlaying fire method", async () => {
            const spotifyUserPlaying = new SpotifyUserPlaying(
                supabase,
                userId,
                context,
            );
            await spotifyUserPlaying.init();
            await expect(spotifyUserPlaying.fire()).resolves.not.toThrow();
        });
        await t.step(
            "SpotifyUserPlaying fire method does not create duplicates",
            async () => {
                const spotifyUserPlaying = new SpotifyUserPlaying(
                    supabase,
                    userId,
                    context,
                );
                await spotifyUserPlaying.init();
                await expect(spotifyUserPlaying.fire())
                    .resolves.not.toThrow()
                    .then(async () => {
                        const { data, error } = await supabase
                            .from("plays")
                            .select()
                            .eq("user_id", userId);
                        if (error) throw error;

                        await spotifyUserPlaying.fire();
                        const { data: newData, error: newError } =
                            await supabase
                                .from("plays")
                                .select()
                                .eq("user_id", userId);
                        if (newError) throw newError;
                        expect(data.length).toBeGreaterThan(0);
                        expect(newData.length).toBeGreaterThanOrEqual(
                            data.length,
                        );
                        expect(newData.length).toBeLessThanOrEqual(data.length);
                    });
            },
        );
        await t.step("test using real spotify data", async () => {
            const spotifyUserPlaying = new SpotifyUserPlaying(
                supabase,
                userId,
                context,
            );
            await spotifyUserPlaying.init();
            await expect(spotifyUserPlaying.fire())
                .resolves.not.toThrow()
                .then(async () => {
                    const { data, error } = await supabase
                        .from("plays")
                        .select(
                            `timestamp,
                    tracks(source_external_id,
                    albums(source_external_id))`,
                        )
                        .eq("user_id", userId);
                    if (error) throw error;
                    expect(data).toBeDefined();
                    for (const entry of data) {
                        if (entry.tracks)
                            expect(
                                entry.tracks.source_external_id,
                            ).toBeDefined();
                    }
                });
        });
    });
    await supabase.auth.admin.deleteUser(userId);
});
