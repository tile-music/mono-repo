import { Play, SpotifyPlay } from "../../../src/music/Play.ts";
import { Track, SpotifyTrack } from "../../../src/music/Track.ts";

import { expect } from "jsr:@std/expect";
import { supabase } from "../supabase.ts";
/**
 * sharted by chat
 */
Deno.test("TrackInfo classes", (t) => {
    t.step("base class", (t) => {
        t.step(
            "should create an instance of TrackInfo with correct properties",
            () => {
                const trackName = "Test Track";
                const trackArtists = ["Artist1", "Artist2"];
                const isrc = "US1234567890";
                const durationMs = 300000;

                const trackInfo = new Track(
                    trackName,
                    trackArtists,
                    isrc,
                    durationMs,
                    new Play(4235236236234531512612, supabase, "blah"),
                    supabase,
                    98,
                );

                expect(trackInfo).toBeInstanceOf(Track);
                expect(trackInfo["title"]).toBe(trackName);
                expect(trackInfo["trackArtists"]).toBe(trackArtists);
                expect(trackInfo["isrc"]).toBe(isrc);
                expect(trackInfo["durationMs"]).toBe(durationMs);
            },
        );

        t.step("should create a correct database entry object", () => {
            const trackName = "Test Track";
            const trackArtists = ["Artist1", "Artist2"];
            const isrc = "US1234567890";
            const durationMs = 300000;

            const trackInfo = new Track(
                trackName,
                trackArtists,
                isrc,
                durationMs,
                new Play(4235236236234531512612, supabase, "blah"),
                supabase,
                97,
                "97",
            );
            const dbEntry = trackInfo.createDbEntryObject();

            expect(dbEntry).toEqual({
                album_id: "97",
                source_title: trackName,
                source_artists: trackArtists,
                source_service: "manual",
                source_external_id: "placeholder",
            });
        });
    });
    t.step("spotify class", (t) => {
        t.step(
            "should create an instance of SpotifyTrackInfo with correct properties",
            () => {
                const trackName = "Test Track";
                const trackArtists = ["Artist1", "Artist2"];
                const isrc = "US1234567890";
                const durationMs = 300000;
                const spotifyId = "1234567890";

                const spotifyTrackInfo = new SpotifyTrack(
                    trackName,
                    trackArtists,
                    isrc,
                    durationMs,
                    spotifyId,
                    new Play(4235236236234531512612, supabase, "blah"),
                    supabase,
                    99,
                );

                expect(spotifyTrackInfo).toBeInstanceOf(SpotifyTrack);
                expect(spotifyTrackInfo["title"]).toBe(trackName);
                expect(spotifyTrackInfo["trackArtists"]).toBe(trackArtists);
                expect(spotifyTrackInfo["isrc"]).toBe(isrc);
                expect(spotifyTrackInfo["durationMs"]).toBe(durationMs);
                expect(spotifyTrackInfo["externalId"]).toBe(spotifyId);
            },
        );

        t.step("should create a correct database entry object", () => {
            const trackName = "Test Track";
            const trackArtists = ["Artist1", "Artist2"];
            const isrc = "US1234567890";
            const durationMs = 300000;
            const popularity = 50;
            const spotifyId = "1234567890";
            const albumId = "ALBUMID";
            const spotifyTrackInfo = new SpotifyTrack(
                trackName,
                trackArtists,
                isrc,
                durationMs,
                spotifyId,
                new SpotifyPlay(
                    4235236236234531512612,
                    popularity,
                    supabase,
                    "blah",
                ),
                supabase,
                3,
                "ALBUMID",
            );
            const dbEntry = spotifyTrackInfo.createDbEntryObject();

            expect(dbEntry).toEqual({
                source_title: trackName,
                source_artists: trackArtists,
                source_external_id: spotifyId,
                source_service: "spotify",
                album_id: albumId,
            });
        });
    });
});
