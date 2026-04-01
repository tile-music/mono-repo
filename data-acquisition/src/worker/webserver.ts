import { default as express } from "@express";
import { makeDataAcqQueue } from "./makeQueue.ts";

import { log } from "../util/log.ts";
import { supabase } from "../../tests/music/supabase.ts";
import { z } from "@zod";

const queue = makeDataAcqQueue();
// Create an instance of Express
const app = express();
app.use(express.json());
async function removeJob(jobId: string) {
    let failCount = 0;
    while (failCount < 8 && !(await queue.remove(jobId))) {
        if (failCount === 6)
            throw new Error(
                "Failed to remove job from queue something is blocking it or one of its dependencies",
            );
        failCount += 1;
    }
}

const addJobSchema = z.object({
    userId: z.string().min(1, "userId cannot be empty"),
    refreshToken: z.string().min(1, "refreshToken cannot be empty"),
    type: z.literal("spotify"),
});

const removeJobSchema = z.object({
    userId: z.string().min(1, "userId cannot be empty"),
    type: z.literal("spotify"),
});

/**
 * Extracts the `userId`, `refreshToken`, and `type` properties from the request body.
 *
 * @param req - The HTTP request object containing the body with user details.
 * @param req.body - The body of the request containing user information.
 * @param req.body.userId - The unique identifier for the user.
 * @param req.body.refreshToken - The refresh token for the user session.
 * @param req.body.type - The type of request or user action.
 */
app.post("/add-job", async (req: any, res: any) => {
    const { userId, refreshToken, type } = req.body;
    console.log(req.body);
    console.log("userId", userId);
    if (!userId || !refreshToken || !type) {
        return res
            .status(400)
            .json({ error: "Missing userId, refreshToken, or cronExpression" });
    }

    try {
        if (type === "spotify") {
            //while (!(await queue.remove("single-shot" + userId)))
            await queue.add(
                userId,
                {
                    data: {
                        userId,
                        refreshToken,
                    },
                },
                {
                    jobId: "single-shot" + userId,
                },
            );
            //while(!(await queue.remove(userId)))
            await queue.add(
                userId,
                {
                    data: {
                        userId,
                        refreshToken,
                    },
                },
                {
                    repeat: { pattern: "0/30 * * * *" },
                    jobId: userId,
                },
            );
            log(6, "job added");
            res.status(200).json({ message: "Job added successfully" });
        } else {
            return res.status(400).json({ error: "Invalid type" });
        }
        // Add job to queue with specified cron expression
    } catch (err) {
        res.status(500).json({ error: "Failed to add job: " + err });
    }
});

app.post("/remove-job", async (req: any, res: any) => {
    console.log("remove job");
    const { userId, type } = req.body;
    console.log(req.body);
    console.log("userId", userId);
    if (!userId || !type) {
        return res
            .status(400)
            .json({ error: "Missing userId, refreshToken, or cronExpression" });
    }

    try {
        if (type === "spotify") {
            await removeJob(userId);
            await removeJob("single-shot" + userId);

            console.log("removed job");
            res.status(200).json({ message: "Job removed successfully" });
        } else {
            return res.status(400).json({ error: "Invalid type" });
        }
    } catch (err) {
        if (err instanceof Error) {
            switch (err.message) {
                case "Failed to remove job from queue something is blocking it or one of its dependencies":
                    return res.status(500).json({
                        error: "you may be hitting the button too many times in a row, chill out then try agian",
                    });
            }
        }
        res.status(500).json({ error: "Failed to add job" });
    }
});

app.get("/health", (res: any) => {
    res.status(200).json({ message: "Server is healthy" });
});

async function createTestUser(prefix: string) {
    const email = `${prefix}-${crypto.randomUUID()}@example.com`;

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: "password",
    });

    if (error) throw error;
    if (!data.user?.id) throw new Error("Failed to create test user");

    return data.user.id;
}

async function getUserPlayCount(userId: string) {
    const { data, error } = await supabase
        .from("plays")
        .select("track_id")
        .eq("user_id", userId);

    if (error) throw error;
    return data.length ?? 0;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**file change */

app.get("/healthz", async (_req: any, res: any) => {
    let userId: string | null = null;

    try {
        const refreshToken = Deno.env.get("SP_REFRESH");

        // 1. Create test user
        userId = await createTestUser("healthz");

        // 2. Enqueue job (same path as production)
        await queue.add(
            userId,
            {
                data: {
                    provider: "spotify",
                    userId: userId,
                    refreshToken: refreshToken,
                },
            },
            {
                jobId: "spotify:healthz-" + userId,
            },
        );

        // 3. Wait for worker to process
        // (tune this depending on your queue latency)
        let attempts = 0;
        let playCount = 0;

        while (attempts < 10) {
            await sleep(2000); // 2s backoff
            playCount = await getUserPlayCount(userId);

            if (playCount > 0) break;
            attempts++;
        }

        if (playCount === 0) {
            throw new Error("No plays inserted - pipeline failed");
        }

        // 4. Cleanup queue jobs
        await removeJob(userId);
        await removeJob("healthz-" + userId);

        // 5. Delete user
        await supabase.auth.admin.deleteUser(userId);

        return res.status(200).json({
            status: "ok",
            playsInserted: playCount,
        });
    } catch (err) {
        // Cleanup on failure too
        if (userId) {
            try {
                await removeJob(userId);
                await removeJob("healthz-" + userId);
                await supabase.auth.admin.deleteUser(userId);
            } catch (_) {
                // swallow cleanup errors
            }
        }

        return res.status(500).json({
            status: "error",
            error: err instanceof Error ? err.message : String(err),
        });
    }
});

// Start the server on a specified port
let PORT = 3000;
if (Deno.env.get("DATA_ACQ_PORT") === undefined)
    console.log("PORT is not set, using default port 3000");
else if (isNaN(parseInt(Deno.env.get("DATA_ACQ_PORT")!)))
    console.log("PORT is not a number, using default port 3000");
else PORT = parseInt(Deno.env.get("DATA_ACQ_PORT")!);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
