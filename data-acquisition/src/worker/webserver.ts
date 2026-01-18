import { express } from "../../deps.ts";
import { makeDataAcqQueue } from "./makeQueue.ts";

import { log } from "../../../lib/log.ts";
import "jsr:@std/dotenv/load";

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

app.get("/health", (req: any, res: any) => {
    res.status(200).json({ message: "Server is healthy" });
});

// Start the server on a specified port
let PORT = 3000;
if (Deno.env.get("PORT") === undefined)
    console.log("PORT is not set, using default port 3000");
else if (isNaN(parseInt(Deno.env.get("PORT")!)))
    console.log("PORT is not a number, using default port 3000");
else PORT = parseInt(Deno.env.get("PORT")!);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
