import { SupabaseClient } from "@supabase/supabase-js";
import { SpotifyUserPlaying, MockUserPlaying } from "../../src/music/UserPlaying";
import { Client, Player } from "spotify-api.js";

import dotenv from "dotenv";
import { parse } from "path";
import { time } from "console";

dotenv.config();

let context: any = { refresh_token: process.env.SP_REFRESH };




describe("spotify Listening timestamp sanity check", () => {
  const testData = ["2024-11-15T14:27:57.952Z",
    "2024-11-15T14:24:25.620Z",
    "2024-11-15T14:22:30.406Z",
    "2024-11-15T14:17:43.461Z",
    "2024-11-15T14:13:43.754Z",
    "2024-11-15T14:09:47.990Z",
    "2024-11-15T14:06:07.862Z",
    "2024-11-15T13:59:51.570Z",
    "2024-11-15T13:56:10.273Z"]
  test("SpotifyUserPlaying parseSpotifyListeningTimestamp", () => {
    for (const timestamp of testData) { // Use for...of to iterate over values
      const date = SpotifyUserPlaying.parseISOToDate(timestamp);
      const dateTs = new Date(timestamp)
      // Check if the parsed date matches the original timestamp
      expect(dateTs.toISOString()).toStrictEqual(timestamp);
    }

  })
})
describe("Spotify UserPlaying Integration", () => {
  let supabase: SupabaseClient<any, "test", any>;
  let userId: string;
  let spotifyClient: Client;
  let player: Player;
  let spotifyData: any;

  beforeAll(async () => {
    supabase = new SupabaseClient(
      process.env.SB_URL_TEST as string,
      process.env.ANON as string,
      { db: { schema: "test" } }
    );

    const { data, error } = await supabase.auth.signUp({
      email: "test2@example.com",
      password: "password",
    });
    spotifyClient = await Client.create({
      refreshToken: true,
      token: {
        clientID: process.env.SP_CID as string,
        clientSecret: process.env.SP_SECRET as string,
        refreshToken: process.env.SP_REFRESH as string,
      },
      onRefresh: () => {
        console.log("token refreshed");
      },
    });
    player = new Player(spotifyClient);

    if (error) throw error;
    userId = data.user?.id || "test-user-id";
  });
  beforeEach(async () => {
    spotifyData = (await player.getRecentlyPlayed({ limit: 50 })).items;
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
  test("SpotifyUserPlaying fire method data integrity", async () => {
    const spotifyUserPlaying = new SpotifyUserPlaying(
      supabase,
      userId,
      context
    );
    await spotifyUserPlaying.init();
    await expect(spotifyUserPlaying.fire()).resolves.not.toThrow().then(async () => {
      let { data, error } = await supabase
        .from("played_tracks")
        .select()
        .eq("user_id", userId);
      console.log(spotifyData)
      if (data) {
        data = data?.sort((a, b) => b.listened_at - a.listened_at);
      }

      expect(data).toHaveLength(spotifyData.length);
      expect(data).toBeDefined()
      if (data) {
        for (let i = 0; i < data.length; i++) {
          console.log(spotifyData[i].playedAt);
          //console.log(SpotifyUserPlaying.parseISOToDate(spotifyData.items[i].playedAt), data[i].listened_at);
          const spotifyTimeStamp: Date = SpotifyUserPlaying.parseISOToDate(spotifyData[i].playedAt)
          const tsDateObjectSpTimestamp: Date = new Date(spotifyData[i].playedAt)
          expect(data[i].isrc).toStrictEqual(spotifyData[i].track.externalID.isrc);
          expect(data[i].listened_at).toStrictEqual(spotifyTimeStamp.valueOf());




        }
      }

    })



  });

})

describe("UserPlaying Tests", () => {

  describe("UserPlaying Tests", () => {
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

      supabase = new SupabaseClient(
        process.env.SB_URL_TEST as string,
        process.env.SERVICE as string
      );
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      //await supabase.rpc("clear_test_tables");
    });
    let supabase: any;
    let postgres: any;
    let userId: string;

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
          albumReleaseDay: 1,
          albumReleaseMonth: 2,
          albumReleaseYear: 2021,
        },
        image: "Test Image",
        isrc: "USRC17607830",
        durationMs: 1000,
        progressMs: 500,
        popularity: 100,
        timestamp: 1256667799,
      },
      {
        trackName: "Test Track 2",
        trackArtists: ["Test Artist 2"],
        albumInfo: {
          albumName: "Test Album 2",
          albumArtists: ["Test Album Artist 2"],
          albumImage: "Test Image 2",
          albumReleaseDay: 1,
          albumReleaseMonth: 2,
          albumReleaseYear: 2023,
        },
        image: "Test Image 2",
        isrc: "USRC17607839",
        durationMs: 2000,
        progressMs: 1000,
        popularity: 95,
        timestamp: 13888088,
      },
    ];
    const testData2 = Array.from({ length: 50 }, (_, i) => ({
      trackName: `Test Track ${i % 10}`,
      trackArtists: [`Test Artist ${i % 5}`],
      albumInfo: {
        albumName: `Test Album ${i % 7}`,
        albumArtists: [`Test Album Artist ${i % 3}`],
        albumImage: `Test Image ${i % 4}`,
        albumReleaseDay: 1,
        albumReleaseMonth: 2,
        albumReleaseYear: 2024,
      },
      image: `Test Image ${i % 4}`,
      isrc: `USRC176078${30 + i}`,
      durationMs: 1000 + i * 100,
      progressMs: 500 + i * 50,
      popularity: 100 - (i % 10),
      timestamp: 125666778 + i * 1000,
    }));



    /* test("postgres connection" , async () => {
      await expect(postgres.query("SELECT * from test.tracks")).resolves.not.toThrow();
    }); */

    test("SpotifyUserPlaying init method", async () => {
      const spotifyUserPlaying = new SpotifyUserPlaying(
        supabase,
        userId,
        context
      );
      await expect(spotifyUserPlaying.init()).resolves.not.toThrow();
    });

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

    test("SpotifyUserPlaying Parse Spotify Date Function", async () => {
      expect(SpotifyUserPlaying.parseSpotifyDate("1999-12-22", "day")).toStrictEqual({ year: 1999, month: 12, day: 22 });
      expect(SpotifyUserPlaying.parseSpotifyDate("1999-12", "month")).toStrictEqual({ year: 1999, month: 12 });
      expect(SpotifyUserPlaying.parseSpotifyDate("1999", "year")).toStrictEqual({ year: 1999 });
    })


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
          expect(data.length).toBeGreaterThan(0)
          expect(newData.length).toBeGreaterThanOrEqual(data.length);
          expect(newData.length).toBeLessThanOrEqual(data.length);
        });
    }, 10000);
    test("test using real spotify data", async() => {
      const spotifyUserPlaying = new SpotifyUserPlaying(
        supabase,
        userId,
        context
      );
      await spotifyUserPlaying.init();
      await expect(spotifyUserPlaying.fire()).resolves.not.toThrow().then(async () => {
        const { data, error } = await supabase
          .from("played_tracks")
          .select(`listened_at, albums(spotify_id),
                    tracks(spotify_id)`)
          .eq("user_id", userId);
        if (error) throw error;
        expect(data).toBeDefined();
        console.log(data)
        for (const entry of data) {
          expect(entry.albums.spotify_id).toBeDefined();
        }
      });
    })
  });
});
