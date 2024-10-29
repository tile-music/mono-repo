import { makeJobs } from "../../src/worker/service-adapter";
import { SupabaseClient } from "@supabase/supabase-js";
import { Queue } from "bullmq";
import { makeQueue } from "../../src/worker/makeQueue";

jest.mock("@supabase/supabase-js");
jest.mock("../../src/worker/makeQueue");

describe("makeJobs", () => {
  let mockQueue: jest.Mocked<Queue>;
  let mockSupabaseClient: jest.Mocked<SupabaseClient>;

  beforeEach(() => {
    mockQueue = {
      add: jest.fn(),
    } as unknown as jest.Mocked<Queue>;

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [
          { id: "user1", refresh_token: "token1" },
          { id: "user2", refresh_token: "token2" },
        ],
      }),
    } as unknown as jest.Mocked<SupabaseClient>;

    (makeQueue as jest.Mock).mockReturnValue(mockQueue);
    (SupabaseClient as jest.Mock).mockImplementation(() => mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create and schedule jobs for each Spotify credential", async () => {
    await makeJobs();

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("spotify_credentials");
    expect(mockSupabaseClient.select).toHaveBeenCalledWith("*");

    expect(mockQueue.add).toHaveBeenCalledTimes(4);

    expect(mockQueue.add).toHaveBeenCalledWith(
      "spotify" + { id: "user1", refresh_token: "token1" },
      {
        data: {
          userId: "user1",
          refreshToken: "token1",
        },
      },
      {
        jobId: "spotifyuser1",
      }
    );

    expect(mockQueue.add).toHaveBeenCalledWith(
      "spotify" + { id: "user1", refresh_token: "token1" },
      {
        data: {
          userId: "user1",
          refreshToken: "token1",
        },
      },
      {
        repeat: { pattern: "0/30 * * * *" },
        jobId: "spotifyuser1",
      }
    );

    expect(mockQueue.add).toHaveBeenCalledWith(
      "spotify" + { id: "user2", refresh_token: "token2" },
      {
        data: {
          userId: "user2",
          refreshToken: "token2",
        },
      },
      {
        jobId: "spotifyuser2",
      }
    );

    expect(mockQueue.add).toHaveBeenCalledWith(
      "spotify" + { id: "user2", refresh_token: "token2" },
      {
        data: {
          userId: "user2",
          refreshToken: "token2",
        },
      },
      {
        repeat: { pattern: "0/30 * * * *" },
        jobId: "spotifyuser2",
      }
    );
  });

  it("should handle empty Spotify credentials", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({ data: [] });

    await makeJobs();

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("spotify_credentials");
    expect(mockSupabaseClient.from()).toHaveBeenCalledWith("*");

    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it("should handle errors from Supabase client", async () => {
    mockSupabaseClient.select.mockRejectedValueOnce(new Error("Supabase error"));

    await expect(makeJobs()).rejects.toThrow("Supabase error");

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("spotify_credentials");
    expect(mockSupabaseClient.select).toHaveBeenCalledWith("*");

    expect(mockQueue.add).not.toHaveBeenCalled();
  });
});