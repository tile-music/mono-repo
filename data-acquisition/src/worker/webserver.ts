import { makeDataAcqQueue } from "./queue.ts";
import { log } from "../util/log.ts";
import "jsr:@std/dotenv/load";

const queue = makeDataAcqQueue();

/**
 * Handles incoming HTTP requests and routes them to appropriate handlers.
 * 
 * @param req - The incoming HTTP request
 * @returns Promise that resolves to an HTTP response
 */
function handleRequest(req: Request): Promise<Response> {
  log(6, `Received ${req.method} request to ${req.url}`);
  
  if (req.method === "POST" && req.url === "/add-job") {
    return addJob(req);
  } else if (req.method === "POST" && req.url === "/remove-job") {
    return removeJob(req);
  } else {
    log(3, `404 Not Found for ${req.method} ${req.url}`);
    return Promise.resolve(createResponse(404, { error: "Not Found" }));
  }
}

/**
 * Creates a standardized JSON HTTP response.
 * 
 * @param status - HTTP status code
 * @param body - Response body object to be JSON stringified
 * @returns HTTP Response with JSON content type
 */
function createResponse(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json", },
  });
}

/**
 * Handles POST requests to add a new job to the queue.
 * Creates both a single-shot job and a recurring job for Spotify data acquisition.
 * 
 * @param req - HTTP request containing userId, refreshToken, and type in JSON body
 * @returns Promise that resolves to HTTP response indicating success or failure
 */
async function addJob(req: Request) {
  try {
    const body = await req.json();
    const { userId, refreshToken, type } = body;

    if (!userId || !refreshToken || !type) {
      const missingFields = `userId=${!!userId}, refreshToken=${!!refreshToken}, type=${!!type}`;
      log(3, `Bad request - missing required fields: ${missingFields}`);
      return createResponse(400, {
        error: "Missing userId, refreshToken, or cronExpression",
      });
    }

    if (type === "spotify") {
      await queue.add(
        userId,
        { data: { userId, refreshToken, }, },
        { jobId: "single-shot" + userId, },
      );

      await queue.add(
        userId,
        { data: { userId, refreshToken, }, },
        { repeat: { pattern: "0/30 * * * *" }, jobId: userId, },
      );
      log(5, `Successfully added Spotify jobs for user ${userId}`);
      return createResponse(200, { message: "Job added successfully" });
    } else {
      log(3, `Invalid job type requested: ${type}`);
      return createResponse(200, { error: "Invalid type" });
    }
  } catch (err) {
    log(2, `Failed to add job: ${err}`);
    return createResponse(500, { error: "Failed to add job: " + err });
  }
}

/**
 * Handles POST requests to remove jobs from the queue.
 * Removes both the recurring job and single-shot job for the specified user.
 * 
 * @param req - HTTP request containing userId and type in JSON body
 * @returns Promise that resolves to HTTP response indicating success or failure
 */
async function removeJob(req: Request) {
  try {
    const body = await req.json();
    const { userId, type } = body;

    if (!userId || !type) {
      log(3, `Bad request - missing required fields: userId=${!!userId}, type=${!!type}`);
      return createResponse(400, {
        error: "Missing userId, refreshToken, or cronExpression",
      });
    }

    if (type === "spotify") {
      await queue.remove(userId);
      await queue.remove("single-shot" + userId);
      log(5, `Successfully removed Spotify jobs for user ${userId}`);
      return createResponse(200, { message: "Job removed successfully" });
    } else {
      log(3, `Invalid job type for removal: ${type}`);
      return createResponse(400, { error: "Invalid type" });
    }
  } catch (err) {
    if (err instanceof Error) {
      switch (err.message) {
        case "Failed to remove job from queue something is blocking it or one of its dependencies":
          log(2, `Job removal blocked for user: ${err.message}`);
          return createResponse(500, {
            error:
              "you may be hitting the button too many times in a row, chill out then try agian",
          });
      }
    }
    log(2, `Failed to remove job: ${err}`);
    return createResponse(500, { error: "Failed to add job" });
  }
}

// Start the server on a specified port
let PORT = 3000;
if (Deno.env.get("PORT") === undefined) {
  log(4, "PORT is not set, using default port 3000");
} else if (isNaN(parseInt(Deno.env.get("PORT")!))) {
  log(4, "PORT is not a number, using default port 3000");
} else {
  PORT = parseInt(Deno.env.get("PORT")!);
}

log(5, `Starting webserver on port ${PORT}`);
Deno.serve({ port: PORT }, handleRequest);
