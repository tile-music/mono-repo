import {
  AppleMusicUserPlaying,
  MockUserPlaying,
  SpotifyUserPlaying,
  UserPlaying,
} from "../../../src/music/UserPlaying.ts";
import { type TestData } from "../../../src/music/Album.ts";
import { expect } from "@expect";
import { supabase } from "../supabase.ts";
import { testData0 } from "./TestData.ts";

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

type UserPlayingFactory = (userId: string) => UserPlaying;

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} environment variable is required for testing`);
  }
  return value;
}

async function createTestUser(prefix: string) {
  const email = `${prefix}-${crypto.randomUUID()}@example.com`;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: "password",
  });

  if (error) throw error;
  if (!data.user?.id) throw new Error(`Could not create user for ${prefix}`);

  return data.user.id;
}

async function getUserPlayCount(userId: string) {
  const { count, error } = await supabase
    .from("plays")
    .select("track_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;

  return count ?? 0;
}

async function assertRealDataHasTrackIds(userId: string) {
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

  for (const entry of data ?? []) {
    if (entry.tracks) {
      expect(entry.tracks.source_external_id).toBeDefined();
    }
  }
}

async function runProviderTests(
  t: Deno.TestContext,
  providerName: string,
  userId: string,
  createUserPlaying: UserPlayingFactory,
) {
  await t.step(`${providerName} fire method`, async () => {
    const userPlaying = createUserPlaying(userId);
    await userPlaying.init();
    await expect(userPlaying.fire()).resolves.not.toThrow();
  });

  await t.step(`${providerName} fire method does not create duplicates`, async () => {
    const userPlaying = createUserPlaying(userId);

    await userPlaying.init();
    await expect(userPlaying.fire()).resolves.not.toThrow();

    const initialCount = await getUserPlayCount(userId);

    await userPlaying.fire();

    const secondCount = await getUserPlayCount(userId);

    expect(initialCount).toBeGreaterThan(0);
    expect(secondCount).toEqual(initialCount);
  });

  await t.step(`test using real ${providerName.toLowerCase()} data`, async () => {
    const userPlaying = createUserPlaying(userId);

    await userPlaying.init();
    await expect(userPlaying.fire()).resolves.not.toThrow();

    await assertRealDataHasTrackIds(userId);
  });
}

async function runMockUserPlayingTests(t: Deno.TestContext, userId: string) {
  await t.step("MockUserPlaying init method", async () => {
    const mockUserPlaying = new MockUserPlaying(supabase, userId, testData0);

    await expect(mockUserPlaying.init()).resolves.not.toThrow();
  });

  await t.step("MockUserPlaying fire method", async () => {
    const mockUserPlaying = new MockUserPlaying(supabase, userId, testData0);

    await mockUserPlaying.init();
    await expect(mockUserPlaying.fire()).resolves.not.toThrow();

    const playCount = await getUserPlayCount(userId);

    expect(playCount).toBe(4);
  });

  await t.step("MockUserPlaying init method using test data 2", async () => {
    const mockUserPlaying = new MockUserPlaying(supabase, userId, testData1);

    await expect(mockUserPlaying.init()).resolves.not.toThrow();
  });

  await t.step("MockUserPlaying fire method using test data 2", async () => {
    const mockUserPlaying = new MockUserPlaying(supabase, userId, testData1);

    await mockUserPlaying.init();
    await expect(mockUserPlaying.fire()).resolves.not.toThrow();
  });
}

Deno.test("mock:user-playing", async (t) => {
  const userId = await createTestUser("mock");

  try {
    await runMockUserPlayingTests(t, userId);
  } finally {
    await supabase.auth.admin.deleteUser(userId);
  }
});

Deno.test("spotify:integration:user-playing", async (t) => {
  const userId = await createTestUser("spotify");

  try {
    const spotifyRefreshToken = getRequiredEnv("SP_REFRESH");

    const spotifyFactory: UserPlayingFactory = (userId: string) =>
      new SpotifyUserPlaying(supabase, userId, {
        refresh_token: spotifyRefreshToken,
      });

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

    await runProviderTests(
      t,
      "SpotifyUserPlaying",
      userId,
      spotifyFactory,
    );
  } finally {
    await supabase.auth.admin.deleteUser(userId);
  }
});

Deno.test("apple:integration:user-playing", async (t) => {
  const userId = await createTestUser("apple");

  try {
    const appleMusicAccessToken = getRequiredEnv("APPLE_ACCESS_TOKEN");

    const appleMusicFactory: UserPlayingFactory = (userId: string) =>
      new AppleMusicUserPlaying(supabase, userId, {
        access_token: appleMusicAccessToken,
      });

    await runProviderTests(
      t,
      "AppleMusicUserPlaying",
      userId,
      appleMusicFactory,
    );
  } finally {
    await supabase.auth.admin.deleteUser(userId);
  }
});
