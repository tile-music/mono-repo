import express from 'express';
import { Queue } from 'bullmq';
import { connection } from './redis';  // Assuming you already have the Redis connection
import { spotifyFire } from './worker';       // Import the spotifyFire function
import { makeQueue } from './makeQueue';

// Create an instance of Express
const app = express();
app.use(express.json());

// Create a Queue instance
const queue = makeQueue();

// Route to add a new job to the queue
/**
 * Extracts the `userId`, `refreshToken`, and `type` properties from the request body.
 *
 * @param req - The HTTP request object containing the body with user details.
 * @param req.body - The body of the request containing user information.
 * @param req.body.userId - The unique identifier for the user.
 * @param req.body.refreshToken - The refresh token for the user session.
 * @param req.body.type - The type of request or user action.
 */
app.post('/add-job', async (req, res) => {
  const { userId, refreshToken, type } = req.body;
  console.log(req.body)
  console.log("userId", userId)
  if (!userId || !refreshToken) {
    return res.status(400).json({ error: 'Missing userId, refreshToken, or cronExpression' });
  }

  try {

    if(type === "spotify"){
      await queue.add(
        'spotify' + userId,
        {
          data: {
            userId,
            refreshToken,
          },
        },
        {
          jobId: "spotify" + userId,
        }
      );
      await queue.add(
        'spotify' + userId,
        {
          data: {
            userId,
            refreshToken,
          },
        },
        {
          repeat: { pattern: "0/30 * * * *" },
          jobId: "spotify" + userId,
        }
      );
      console.log("added job");
      res.status(200).json({ message: 'Job added successfully' });
    }else{
      return res.status(400).json({ error: 'Invalid type' });
    }
    // Add job to queue with specified cron expression
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to add job' });
  }
});

// Start the server on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
