import { SupabaseClient } from "@supabase/supabase-js";
import { SpotifyUserPlaying, MockUserPlaying } from "../src/music/UserPlaying";

import dotenv from "dotenv";
dotenv.config();

describe("UserPlaying Tests", () => {
  let supabase: SupabaseClient;
  describe("UserPlaying Tests", () => {
    let supabase: any;
    let postgres: any;
    let userId: string;
    let context: any = { refresh_token: process.env.SP_REFRESH };
    let email: string = "test@test.com";
    let password: string = "password";
    const testData1 = [
      {
        trackName: "Test Track",
        trackArtists: ["Test Artist"],
        albumInfo: {
          albumName: "Test Album",
          albumArtists: ["Test Album Artist"],
          albumImage: "Test Image",
          albumReleaseDate: new Date(2021, 1, 1),
        },
        image: "Test Image",
        isrc: "USRC17607830",
        durationMs: 1000,
        progressMs: 500,
        popularity: 100,
        timestamp: new Date(125666778),
      },
      {
        trackName: "Test Track 2",
        trackArtists: ["Test Artist 2"],
        albumInfo: {
          albumName: "Test Album 2",
          albumArtists: ["Test Album Artist 2"],
          albumImage: "Test Image 2",
          albumReleaseDate: new Date(2021, 1, 1),
        },
        image: "Test Image 2",
        isrc: "USRC17607839",
        durationMs: 2000,
        progressMs: 1000,
        popularity: 95,
        timestamp: new Date(13888088),
      },
    ];
    const testData2 = Array.from({ length: 50 }, (_, i) => ({
      trackName: `Test Track ${i % 10}`,
      trackArtists: [`Test Artist ${i % 5}`],
      albumInfo: {
        albumName: `Test Album ${i % 7}`,
        albumArtists: [`Test Album Artist ${i % 3}`],
        albumImage: `Test Image ${i % 4}`,
        albumReleaseDate: new Date(2021, 1, 1),
      },
      image: `Test Image ${i % 4}`,
      isrc: `USRC176078${30 + i}`,
      durationMs: 1000 + i * 100,
      progressMs: 500 + i * 50,
      popularity: 100 - (i % 10),
      timestamp: new Date(125666778 + i * 1000),
    }));

    beforeAll(async () => {
      supabase = new SupabaseClient(
        process.env.SB_URL_TEST as string,
        process.env.ANON as string,
        { db: { schema: "test" } }
      );

      const { data, error } = await supabase.auth.signUp({
        email: "test1@example.com",
        password: "password",
      });
      if (error) throw error;
      userId = data.user?.id || "test-user-id";
    });
    afterAll(async () => {
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
      supabase = new SupabaseClient(
        process.env.SB_URL_TEST as string,
        process.env.SERVICE as string
      );
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      //await supabase.rpc("clear_test_tables");
    });

    /* test("postgres connection" , async () => {
      await expect(postgres.query("SELECT * from test.tracks")).resolves.not.toThrow();
    }); */

    // test("SpotifyUserPlaying init method", async () => {
    //   const spotifyUserPlaying = new SpotifyUserPlaying(
    //     supabase,
    //     userId,
    //     context
    //   );
    //   await expect(spotifyUserPlaying.init()).resolves.not.toThrow();
    // });

    test("MockUserPlaying init method", async () => {
      const mockUserPlaying = new MockUserPlaying(supabase, userId, testData1);
      await expect(mockUserPlaying.init()).resolves.not.toThrow();
    });

    test("MockUserPlaying fire method", async () => {
      const mockUserPlaying = new MockUserPlaying(supabase, userId, testData1);
      await mockUserPlaying.init();
      await expect(mockUserPlaying.fire())
        .resolves.not.toThrow()
        .then(() =>
          supabase
            .from("played_tracks")
            .select()
            .eq("user_id", userId)
            .then(({ data, error }: { data: any; error: any }) => {
              console.log(data);
              expect(data).toHaveLength(2);
            })
        );
    });
    test("MockUserPlaying init method using test data 2", async () => {
      const mockUserPlaying = new MockUserPlaying(supabase, userId, testData2);
      await expect(mockUserPlaying.init()).resolves.not.toThrow();
    });

    test("MockUserPlaying fire method using test data 2", async () => {
      const mockUserPlaying = new MockUserPlaying(supabase, userId, testData2);
      await mockUserPlaying.init();
      await expect(mockUserPlaying.fire())
        .resolves.not.toThrow()
        .then(() =>
          supabase
            .from("played_tracks")
            .select()
            .eq("user_id", userId)
            .then(({ data, error }: { data: any; error: any }) => {
              console.log(data);
            })
        );
    });
    test("MockUserPlaying data integrity", async () => {
      const mockUserPlaying = new MockUserPlaying(supabase, userId, testData1);
      await mockUserPlaying.init();
      //await mockUserPlaying.fire();
      expect(mockUserPlaying.mockData).toHaveLength(2);
      expect(mockUserPlaying.mockData[0].trackName).toBe("Test Track");
    });

    test("SpotifyUserPlaying fire method", async () => {
      const spotifyUserPlaying = new SpotifyUserPlaying(
        supabase,
        userId,
        context
      );
      await spotifyUserPlaying.init();
      await expect(spotifyUserPlaying.fire()).resolves.not.toThrow();
    });
    test("SpotifyUserPlaying fire method does not create duplicates", async () => {
      const spotifyUserPlaying = new SpotifyUserPlaying(
      supabase,
      userId,
      context
      );
      await spotifyUserPlaying.init();
      await expect(spotifyUserPlaying.fire())
      .resolves.not.toThrow()
      .then(async () => {
        const { data, error } = await supabase
        .from("played_tracks")
        .select()
        .eq("user_id", userId);
        if (error) throw error;

        await spotifyUserPlaying.fire();
        const { data: newData, error: newError } = await supabase
        .from("played_tracks")
        .select()
        .eq("user_id", userId);
        if (newError) throw newError;

        expect(newData.length).toBeGreaterThanOrEqual(data.length - 2);
        expect(newData.length).toBeLessThanOrEqual(data.length + 2);
      });
    });
  });
});
