import express from 'express';
import { Queue } from 'bullmq';
import { connection } from './redis';  // Assuming you already have the Redis connection
import { spotifyFire } from './worker';       // Import the spotifyFire function
import { makeDataAcqQueue } from './makeQueue';

const queue = makeDataAcqQueue();
// Create an instance of Express
const app = express();
app.use(express.json());
async function removeJob(jobId: string) {
  let failCount = 0;
  while (failCount < 8 && !(await queue.remove(jobId))){
    if(failCount === 6) throw new Error("Failed to remove job from queue something is blocking it or one of its dependencies");
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
app.post('/add-job', async (req, res) => {
  const { userId, refreshToken, type } = req.body;
  console.log(req.body)
  console.log("userId", userId)
  if (!userId || !refreshToken || !type) {
    return res.status(400).json({ error: 'Missing userId, refreshToken, or cronExpression' });
  }

  try {

    if(type === "spotify"){
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
          jobId:  "single-shot" + userId,
        }
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

app.post('/remove-job', async (req, res) => {
  console.log("remove job")
  const { userId, type } = req.body;
  console.log(req.body)
  console.log("userId", userId)
  if (!userId || !type) {
    return res.status(400).json({ error: 'Missing userId, refreshToken, or cronExpression' });
  }

  try {

    if(type === "spotify"){
      await removeJob(userId);
      await removeJob("single-shot"+userId);
      
      console.log("removed job");
      res.status(200).json({ message: 'Job removed successfully' });
    }else{
      return res.status(400).json({ error: 'Invalid type' });
    }
  } catch (err : any) {
    if(err instanceof Error){
      switch(err.message){
        case "Failed to remove job from queue something is blocking it or one of its dependencies":
          return res.status(500).json({ error: "you may be hitting the button too many times in a row, chill out then try agian" });
      }
    }
    res.status(500).json({ error: 'Failed to add job' });
  }
});

// Start the server on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
